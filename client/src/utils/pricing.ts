/**
 * Formats a numeric price into Nigerian Naira currency with thousands separators.
 * E.g., formatNaira(385000000) -> "₦385,000,000"
 * E.g., formatNaira(28000000, "yr") -> "₦28,000,000 / yr"
 * E.g., formatNaira(180000, "night") -> "₦180,000 / night"
 */
export function formatNaira(amount: number, period?: string | null): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₦0";
  }
  const formatted = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(amount);

  if (period) {
    const cleanPeriod = period.startsWith("/") ? period.trim() : `/ ${period.trim()}`;
    return `₦${formatted} ${cleanPeriod}`;
  }
  return `₦${formatted}`;
}

/**
 * Parses user input for prices (e.g. "350,000,000", "₦180M", "50m", "750000000")
 * into a valid integer number.
 */
export function parsePrice(input: string | number): number {
  if (typeof input === "number") return input;
  if (!input) return 0;

  const clean = input.trim().toLowerCase().replace(/₦/g, "").replace(/\s/g, "");
  
  if (clean.endsWith("m") || clean.endsWith("m+")) {
    const numPart = parseFloat(clean.replace("m+", "").replace("m", ""));
    return isNaN(numPart) ? 0 : Math.round(numPart * 1_000_000);
  }
  if (clean.endsWith("b") || clean.endsWith("b+")) {
    const numPart = parseFloat(clean.replace("b+", "").replace("b", ""));
    return isNaN(numPart) ? 0 : Math.round(numPart * 1_000_000_000);
  }
  if (clean.endsWith("k")) {
    const numPart = parseFloat(clean.replace("k", ""));
    return isNaN(numPart) ? 0 : Math.round(numPart * 1_000);
  }

  const numericOnly = clean.replace(/,/g, "");
  const parsed = parseFloat(numericOnly);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

/**
 * Evaluates whether a price falls within a named price bracket.
 */
export function matchesPriceBracket(price: number, bracket: string): boolean {
  if (!bracket || bracket === "all" || bracket === "any" || bracket === "") {
    return true;
  }
  switch (bracket.toLowerCase()) {
    case "under-50m":
      return price < 50_000_000;
    case "50m-150m":
      return price >= 50_000_000 && price <= 150_000_000;
    case "150m-500m":
      return price >= 150_000_000 && price <= 500_000_000;
    case "500m-plus":
    case "500m+":
      return price >= 500_000_000;
    default:
      return true;
  }
}

/**
 * Calculates net annual yield percentage between annual rent and asset purchase price.
 */
export function calculateNetYield(annualRent: number, assetPrice: number): number {
  if (!assetPrice || assetPrice <= 0 || !annualRent || annualRent <= 0) return 0;
  return Number(((annualRent / assetPrice) * 100).toFixed(1));
}

/**
 * Converts a named price bracket to min/max query params for GET /api/listings.
 */
export function priceBracketToRange(bracket: string): { minPrice?: number; maxPrice?: number } {
  switch ((bracket || "").toLowerCase()) {
    case "under-50m":
      return { maxPrice: 49_999_999 };
    case "50m-150m":
      return { minPrice: 50_000_000, maxPrice: 150_000_000 };
    case "150m-500m":
      return { minPrice: 150_000_000, maxPrice: 500_000_000 };
    case "500m-plus":
    case "500m+":
      return { minPrice: 500_000_000 };
    default:
      return {};
  }
}
