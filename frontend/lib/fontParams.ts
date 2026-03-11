export type ParamGroup = "basic" | "grade" | "stroke" | "vertical";

export interface FontParam {
  key: string;
  label: string;
  description: string;
  min: number;
  max: number;
  default: number;
  step: number;
  group: ParamGroup;
  unit?: string;
}

export const FONT_PARAMS: FontParam[] = [
  // ─── Basic ────────────────────────────────────────────────────
  {
    key: "wght",
    label: "Weight",
    description: "Stroke thickness",
    min: 100,
    max: 900,
    default: 400,
    step: 1,
    group: "basic",
  },
  {
    key: "wdth",
    label: "Width",
    description: "Character width",
    min: 25,
    max: 151,
    default: 100,
    step: 0.5,
    unit: "%",
    group: "basic",
  },
  {
    key: "slnt",
    label: "Slant",
    description: "Oblique angle",
    min: -10,
    max: 0,
    default: 0,
    step: 0.5,
    unit: "°",
    group: "basic",
  },
  {
    key: "opsz",
    label: "Optical Size",
    description: "Optimized for display size",
    min: 8,
    max: 144,
    default: 14,
    step: 0.5,
    unit: "pt",
    group: "basic",
  },
  // ─── Grade & Counter ──────────────────────────────────────────
  {
    key: "GRAD",
    label: "Grade",
    description: "Weight without spacing change",
    min: -200,
    max: 150,
    default: 0,
    step: 1,
    group: "grade",
  },
  {
    key: "XTRA",
    label: "Counter Width",
    description: "Horizontal white space inside letters",
    min: 323,
    max: 603,
    default: 468,
    step: 1,
    group: "grade",
  },
  // ─── Stroke Width ─────────────────────────────────────────────
  {
    key: "XOPQ",
    label: "Thick Stroke",
    description: "Vertical stroke width",
    min: 27,
    max: 175,
    default: 96,
    step: 1,
    group: "stroke",
  },
  {
    key: "YOPQ",
    label: "Thin Stroke",
    description: "Horizontal stroke width",
    min: 25,
    max: 135,
    default: 79,
    step: 1,
    group: "stroke",
  },
  // ─── Vertical Metrics ─────────────────────────────────────────
  {
    key: "YTLC",
    label: "Lowercase Height",
    description: "Y space for lowercase letters",
    min: 416,
    max: 570,
    default: 514,
    step: 1,
    group: "vertical",
  },
  {
    key: "YTUC",
    label: "Uppercase Height",
    description: "Y space for uppercase letters",
    min: 528,
    max: 760,
    default: 712,
    step: 1,
    group: "vertical",
  },
  {
    key: "YTAS",
    label: "Ascender Height",
    description: "Y space for ascending strokes",
    min: 649,
    max: 854,
    default: 750,
    step: 1,
    group: "vertical",
  },
  {
    key: "YTDE",
    label: "Descender Depth",
    description: "Y space for descending strokes",
    min: -305,
    max: -98,
    default: -203,
    step: 1,
    group: "vertical",
  },
  {
    key: "YTFI",
    label: "Figure Height",
    description: "Y space for numbers",
    min: 560,
    max: 788,
    default: 738,
    step: 1,
    group: "vertical",
  },
];

export const PARAM_GROUPS: { key: ParamGroup; label: string }[] = [
  { key: "basic", label: "Basic" },
  { key: "grade", label: "Grade & Counter" },
  { key: "stroke", label: "Stroke Width" },
  { key: "vertical", label: "Vertical Metrics" },
];

export type ParamValues = Record<string, number>;

export function getDefaultParams(): ParamValues {
  return Object.fromEntries(FONT_PARAMS.map((p) => [p.key, p.default]));
}

export function toVariationSettings(params: ParamValues): string {
  return Object.entries(params)
    .map(([key, value]) => `'${key}' ${value}`)
    .join(", ");
}
