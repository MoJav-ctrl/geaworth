<#
.SYNOPSIS
  Builds and runs Geaworth Properties in Docker.

.EXAMPLE
  .\setup.ps1                      # build + start on http://localhost:3000
  .\setup.ps1 -Port 8080 -Open     # custom host port, open the browser when ready
  .\setup.ps1 -LocalImages         # download photos at build time (no external image host)
  .\setup.ps1 -SkipChecks         # skip the npm install / lint / test step
  .\setup.ps1 -Logs                # follow container logs
  .\setup.ps1 -Down                # stop and remove the container (data is kept)
  .\setup.ps1 -Down -Purge         # ...and also delete ALL saved data (listings, users, photos, inquiries)

  If scripts are blocked:  powershell -ExecutionPolicy Bypass -File .\setup.ps1
#>
[CmdletBinding()]
param(
  [int]$Port = 0,            # host port (default: value in .env, else 3000)
  [switch]$Rebuild,          # force a clean rebuild (--no-cache)
  [switch]$LocalImages,      # bake photos into the image
  [switch]$Open,             # open the site in the default browser when healthy
  [switch]$SkipChecks,       # skip npm install + lint + tests before building
  [switch]$NoStart,          # prepare .env and build only
  [switch]$Logs,             # follow logs and exit
  [switch]$Down,             # stop and remove the container
  [switch]$Purge             # with -Down: also delete the data volume (listings, users, photos, inquiries)
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Write-Warn2($msg){ Write-Host "    $msg" -ForegroundColor Yellow }

# Run a native command silently and return its exit code (safe under $ErrorActionPreference = 'Stop' in Windows PowerShell 5.1)
function Invoke-Quiet([scriptblock]$Block) {
  $old = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try { & $Block *> $null } catch { } finally { $ErrorActionPreference = $old }
  return $LASTEXITCODE
}

function Assert-LastExit($what) {
  if ($LASTEXITCODE -ne 0) { throw "$what failed (exit code $LASTEXITCODE)." }
}

# Create or update KEY=value in .env, preserving everything else
function Set-EnvValue([string]$Path, [string]$Key, [string]$Value) {
  $lines = @()
  if (Test-Path $Path) { $lines = @(Get-Content -Path $Path) }
  $found = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^\s*$([regex]::Escape($Key))\s*=") { $lines[$i] = "$Key=$Value"; $found = $true }
  }
  if (-not $found) { $lines += "$Key=$Value" }
  # UTF-8 *without* BOM so Docker Compose reads the first line correctly
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllLines($Path, [string[]]$lines, $utf8)
}

function Get-EnvValue([string]$Path, [string]$Key) {
  if (-not (Test-Path $Path)) { return $null }
  foreach ($line in Get-Content -Path $Path) {
    if ($line -match "^\s*$([regex]::Escape($Key))\s*=\s*(.*)$") { return $Matches[1].Trim() }
  }
  return $null
}

# ---------- 1. Docker checks ----------
Write-Step "Checking Docker"
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is not installed or not on PATH. Install Docker Desktop: https://www.docker.com/products/docker-desktop"
}
if ((Invoke-Quiet { docker info }) -ne 0) { throw "Docker is installed but not running. Start Docker Desktop, wait until it says 'running', then re-run this script." }
if ((Invoke-Quiet { docker compose version }) -ne 0) { throw "Docker Compose v2 is required ('docker compose'). Update Docker Desktop." }
Write-Ok "Docker and Compose are ready."

# ---------- 2. Down / logs shortcuts ----------
if ($Down) {
  Write-Step "Stopping Geaworth"
  if ($Purge) {
    docker compose down --volumes --remove-orphans
    Assert-LastExit "docker compose down"
    Write-Warn2 "Container removed and ALL saved data deleted: listings, uploaded photos, user accounts, inquiries and valuation files."
  } else {
    docker compose down --remove-orphans
    Assert-LastExit "docker compose down"
    Write-Ok "Container removed. Your data was kept: listings, photos, users and inquiries (use -Purge to delete it all)."
  }
  return
}
if ($Logs) {
  docker compose logs -f --tail 100
  return
}

# ---------- 3. .env ----------
Write-Step "Preparing .env"
$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envFile)) {
  if (-not (Test-Path '.env.example')) { throw ".env.example not found in $PSScriptRoot." }
  Copy-Item '.env.example' $envFile
  Write-Ok "Created .env from .env.example"
} else {
  Write-Ok ".env already exists (keeping your values)"
}

if ($Port -le 0) {
  $fromEnv = Get-EnvValue $envFile 'PORT'
  if ($fromEnv -match '^\d+$') { $Port = [int]$fromEnv } else { $Port = 3000 }
}
if ($Port -lt 1 -or $Port -gt 65535) { throw "Invalid port: $Port" }

Set-EnvValue $envFile 'PORT' "$Port"
Set-EnvValue $envFile 'SITE_URL' "http://localhost:$Port"
if ($LocalImages) { Set-EnvValue $envFile 'VITE_LOCAL_IMAGES' 'true' }
Write-Ok "Host port: $Port"

# First admin account for /admin (only used by the server while no users exist yet)
if (-not (Get-EnvValue $envFile 'ADMIN_EMAIL')) {
  $adminEmail = Read-Host "Email for the first admin account (/admin login)"
  if ($adminEmail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') { throw "That does not look like a valid email address." }
  $bytes = New-Object byte[] 12
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $adminPassword = [Convert]::ToBase64String($bytes).Replace('+','a').Replace('/','b').Replace('=','')
  Set-EnvValue $envFile 'ADMIN_EMAIL' $adminEmail
  Set-EnvValue $envFile 'ADMIN_PASSWORD' $adminPassword
  Write-Ok "Admin login created. Email: $adminEmail   Password: $adminPassword"
  Write-Host "    Save this password, then change it on the Account page after signing in at /admin." -ForegroundColor Yellow
}

# Is the port already taken by something other than our own container?
$ours = $false
try { $ours = [bool](docker ps --filter "name=geaworth-web" --format "{{.Names}}") } catch { }
if (-not $ours) {
  $busy = $false
  try { $busy = [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) } catch { }
  if ($busy) { throw "Port $Port is already in use. Re-run with another port, e.g.  .\setup.ps1 -Port 8080" }
}

# ---------- 3b. Install, lint and test (fail fast, before the Docker build) ----------
if ($SkipChecks) {
  Write-Warn2 "Skipping npm install / lint / test (-SkipChecks)."
} else {
  Write-Step "Running npm install, lint and tests"
  $nodeMajor = 0
  $nodeFound = ""
  if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeFound = ((node -v) -replace '^v', '').Trim()
    if ($nodeFound -match '^(\d+)\.') { $nodeMajor = [int]$Matches[1] }
  }
  if ($nodeMajor -lt 24) {
    $have = if ($nodeFound) { "found $nodeFound" } else { "not installed" }
    Write-Warn2 "Node.js 24+ is needed for these checks ($have), so they were skipped. The Docker build does not need Node on this machine."
    Write-Warn2 "Install Node 24 LTS (https://nodejs.org) to run them, or pass -SkipChecks to hide this message."
  } else {
    $hadLock = Test-Path 'package-lock.json'
    npm install --no-audit --no-fund
    Assert-LastExit "npm install"
    npm run lint
    Assert-LastExit "npm run lint"
    npm test
    Assert-LastExit "npm test"
    Write-Ok "npm install, lint and tests all passed."
    if (-not $hadLock -and (Test-Path 'package-lock.json')) {
      Write-Warn2 "package-lock.json was just created. Commit it so builds are reproducible."
    }
  }
}

# ---------- 4. Build ----------
Write-Step "Building the image (first build takes a few minutes)"
if ($Rebuild) {
  docker compose build --no-cache
} else {
  docker compose build
}
Assert-LastExit "docker compose build"
Write-Ok "Image built."

if ($NoStart) {
  Write-Ok "Skipping start (-NoStart). Run '.\setup.ps1' again to start."
  return
}

# ---------- 5. Run ----------
Write-Step "Starting the container"
docker compose up -d
Assert-LastExit "docker compose up"

# ---------- 6. Wait for health ----------
Write-Step "Waiting for the site to become healthy"
$url = "http://localhost:$Port"
$healthy = $false
for ($i = 1; $i -le 45; $i++) {
  try {
    $res = Invoke-RestMethod -Uri "$url/api/health" -TimeoutSec 3
    if ($res.ok) { $healthy = $true; break }
  } catch { }
  Start-Sleep -Seconds 2
}

if (-not $healthy) {
  Write-Host "`nThe container did not become healthy in 90 seconds. Last logs:" -ForegroundColor Red
  docker compose logs --tail 40
  throw "Startup failed. Fix the error above, then re-run .\setup.ps1"
}

Write-Host ""
Write-Host "Geaworth Properties is running." -ForegroundColor Green
Write-Host "  Site:    $url"
Write-Host "  Admin:   $url/admin"
Write-Host "  Health:  $url/api/health"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  .\setup.ps1 -Logs            follow logs"
Write-Host "  .\setup.ps1 -Down            stop (data kept)"
Write-Host "  .\setup.ps1 -Rebuild         rebuild from scratch"
Write-Host "  docker compose exec web ls /app/storage    see saved listings, users and uploads"

if ($Open) { Start-Process $url }
