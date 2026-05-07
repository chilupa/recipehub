/**
 * Scale leading quantities in free-text ingredient lines (e.g. "2 cups flour").
 * Lines without a recognizable leading amount are left unchanged.
 */

const UNICODE_FRAC: Record<string, number> = {
  "½": 1 / 2,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** Approximate fractional part as "n/d" with small denominator, or null. */
function fractionalPartToAscii(frac: number): string | null {
  if (!Number.isFinite(frac) || frac <= 0 || frac >= 1) return null;
  const tolerance = 0.06;
  for (let d = 2; d <= 16; d++) {
    const n = Math.round(frac * d);
    if (n <= 0 || n >= d) continue;
    if (Math.abs(n / d - frac) < tolerance) {
      const g = gcd(n, d);
      return `${n / g}/${d / g}`;
    }
  }
  return null;
}

/** Format a positive scaled number for ingredient lines. */
export function formatScaledQuantity(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return String(n);
  const rounded = Math.round(n * 10000) / 10000;
  const intPart = Math.floor(rounded + 1e-9);
  let frac = rounded - intPart;
  if (Math.abs(frac) < 1e-4) return String(intPart);

  const vulgar: [number, string][] = [
    [1 / 8, "⅛"],
    [1 / 4, "¼"],
    [1 / 3, "⅓"],
    [3 / 8, "⅜"],
    [1 / 2, "½"],
    [5 / 8, "⅝"],
    [2 / 3, "⅔"],
    [3 / 4, "¾"],
    [7 / 8, "⅞"],
  ];
  for (const [v, sym] of vulgar) {
    if (Math.abs(frac - v) < 0.04) {
      return intPart === 0 ? sym : `${intPart}${sym}`;
    }
  }

  const ascii = fractionalPartToAscii(frac);
  if (ascii) {
    return intPart === 0 ? ascii : `${intPart} ${ascii}`;
  }

  const dec = rounded.toFixed(2).replace(/\.?0+$/, "");
  return dec;
}

export type ParsedLeadingQuantity = {
  value: number;
  /** Length of matched quantity substring (trimmed line prefix). */
  rawLen: number;
};

/**
 * Parse a leading numeric quantity from a trimmed ingredient line.
 */
export function parseLeadingQuantity(trimmed: string): ParsedLeadingQuantity | null {
  if (!trimmed) return null;

  /** Quantities stop before the next word; lookahead keeps the separating space in `rest`. */
  let m = trimmed.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)(?=\s|$)/);
  if (m) {
    const whole = parseInt(m[1], 10);
    const num = parseInt(m[2], 10);
    const den = parseInt(m[3], 10);
    if (den === 0) return null;
    return { value: whole + num / den, rawLen: m[0].length };
  }

  m = trimmed.match(/^(\d+)\s*([½⅓⅔¼¾⅛⅜⅝⅞])(?=\s|$)/);
  if (m) {
    const sym = m[2];
    const v = UNICODE_FRAC[sym];
    if (v === undefined) return null;
    const whole = parseInt(m[1], 10);
    return { value: whole + v, rawLen: m[0].length };
  }

  m = trimmed.match(/^(\d+)\s*\/\s*(\d+)(?=\s|$)/);
  if (m) {
    const num = parseInt(m[1], 10);
    const den = parseInt(m[2], 10);
    if (den === 0) return null;
    return { value: num / den, rawLen: m[0].length };
  }

  m = trimmed.match(/^([½⅓⅔¼¾⅛⅜⅝⅞])(?=\s|$)/);
  if (m) {
    const v = UNICODE_FRAC[m[1]];
    if (v === undefined) return null;
    return { value: v, rawLen: m[0].length };
  }

  m = trimmed.match(/^(\d+\.\d+|\d+)(?=\s|$)/);
  if (m) {
    return { value: parseFloat(m[1]), rawLen: m[0].length };
  }

  return null;
}

export function scaleIngredientLine(line: string, factor: number): string {
  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return line;

  const leadingWs = line.match(/^\s*/)?.[0] ?? "";
  const rest = line.slice(leadingWs.length);
  const parsed = parseLeadingQuantity(rest);
  if (!parsed) return line;

  const scaled = parsed.value * factor;
  const formatted = formatScaledQuantity(scaled);
  return `${leadingWs}${formatted}${rest.slice(parsed.rawLen)}`;
}

export function scaleRecipeIngredients(
  ingredients: string[],
  factor: number,
): string[] {
  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) {
    return ingredients;
  }
  return ingredients.map((line) => scaleIngredientLine(line, factor));
}
