import { ParamValues, toVariationSettings } from "./fontParams";
import { OTFeatures } from "@/store/fontStore";

// ─── WCAG Contrast ───────────────────────────────────────────────────────────

function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const L1 = getRelativeLuminance(hex1);
  const L2 = getRelativeLuminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WCAGLevel = "AAA" | "AA" | "AA Large" | "Fail";

export function getWCAGLevel(ratio: number, isLargeText = false): WCAGLevel {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3.0) return "AA";
    return "Fail";
  }
  if (ratio >= 7.0) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3.0) return "AA Large";
  return "Fail";
}

// ─── CSS Code Generation ─────────────────────────────────────────────────────

export function generateCSS(
  fontName: string,
  params: ParamValues,
  features: OTFeatures,
  lineHeight: number,
  letterSpacing: number,
  wordSpacing: number
): string {
  const variationSettings = toVariationSettings(params);
  const featureSettings = Object.entries(features)
    .map(([k, v]) => `'${k}' ${v ? 1 : 0}`)
    .join(", ");
  const safeName = fontName.replace(/\s+/g, "-");

  return `@font-face {
  font-family: '${fontName}';
  src: url('${safeName}.woff2') format('woff2'),
       url('${safeName}.ttf') format('truetype');
}

.${safeName.toLowerCase()} {
  font-family: '${fontName}', sans-serif;
  font-variation-settings: ${variationSettings};
  font-feature-settings: ${featureSettings};
  line-height: ${lineHeight};
  letter-spacing: ${letterSpacing}em;
  word-spacing: ${wordSpacing}em;
}`;
}

// ─── Metrics Calculation ─────────────────────────────────────────────────────

const UPM = 2048;

export interface MetricsLines {
  ascender: number;
  capHeight: number;
  xHeight: number;
  baseline: number;
  descender: number;
  totalHeight: number;
}

/**
 * Returns Y positions (px from top) for each metric line,
 * given font parameters, font size in px, and lineHeight multiplier.
 * Uses Roboto Flex parametric Y axes.
 */
export function calcMetrics(
  params: ParamValues,
  fontSize: number,
  lineHeight: number
): MetricsLines {
  const YTAS = params.YTAS ?? 750;
  const YTDE = params.YTDE ?? -203; // negative
  const YTUC = params.YTUC ?? 712;
  const YTLC = params.YTLC ?? 514;

  const emSquareHeight = (YTAS - YTDE) / UPM * fontSize;
  const totalHeight = lineHeight * fontSize;
  const halfLeading = (totalHeight - emSquareHeight) / 2;

  return {
    ascender:  halfLeading,
    capHeight: halfLeading + (YTAS - YTUC) / UPM * fontSize,
    xHeight:   halfLeading + (YTAS - YTLC) / UPM * fontSize,
    baseline:  halfLeading + YTAS / UPM * fontSize,
    descender: halfLeading + (YTAS - YTDE) / UPM * fontSize,
    totalHeight,
  };
}
