import "dotenv/config";
import express from "express";
import path from "node:path";
import { createApp } from "./app.ts";
import { CLIENT_DIR, DIST_DIR } from "./lib/paths.ts";
import { ensureAdminUser } from "./lib/users.ts";

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

async function start() {
  await ensureAdminUser();
  const app = createApp();

  if (isProduction) {
    // Hashed assets can be cached forever; index.html must always revalidate.
    app.use(
      express.static(DIST_DIR, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`) && /-[A-Za-z0-9_-]{8,}\./.test(filePath)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        },
      }),
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(DIST_DIR, "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      configFile: path.join(CLIENT_DIR, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Geaworth Properties running at http://localhost:${PORT} (${isProduction ? "production" : "development"})`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
