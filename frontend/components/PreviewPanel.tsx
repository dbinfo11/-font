"use client";

import { useState } from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import {
  AlignLeft, AlignCenter, AlignRight,
  Grid3x3, Sun, Moon, Ruler, GitCompare,
  Code2, Columns2,
} from "lucide-react";
import { useFontStore } from "@/store/fontStore";
import { calcMetrics, getContrastRatio, getWCAGLevel } from "@/lib/utils";
import { CSSCodeModal } from "./CSSCodeModal";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "preview" | "waterfall" | "kerning" | "metrics" | "wcag";
type Align = "left" | "center" | "right";

// ─── Constants ───────────────────────────────────────────────────────────────

const PREVIEW_SIZES = [72, 56, 48, 36, 24, 18, 14];

const GLYPH_SAMPLES = [
  "AaBbCcDdEeFf",
  "GgHhIiJjKkLlMm",
  "NnOoPpQqRrSs",
  "TtUuVvWwXxYyZz",
  "0123456789",
  "!?&@#$% .,;:",
  "fifl ff ffi ffl", // ligature test
  "\"'()[]{}—–…",
];

const KERNING_PAIRS = [
  ["AV", "AW", "AY", "AT", "AO", "AC"],
  ["VA", "VO", "VU", "VY", "Ve", "Vo"],
  ["WA", "WO", "WU", "WY", "We", "Wo"],
  ["TA", "TY", "TO", "TU", "Te", "To"],
  ["FA", "FO", "LT", "LV", "LW", "LY"],
  ["PA", "YA", "YO", "YU", "Tr", "Tu"],
];

const METRICS_SAMPLE = "Hamburgefons";

const OT_FEATURE_LABELS: Record<string, string> = {
  liga: "Ligatures",
  calt: "Contextual",
  smcp: "Small Caps",
  onum: "Oldstyle #",
  tnum: "Tabular #",
};

// ─── Bg config ───────────────────────────────────────────────────────────────

const BG_STYLES: Record<string, React.CSSProperties> = {
  dark: { background: "#0a0a0a" },
  light: { background: "#f5f5f5" },
  grid: {
    background: "#0a0a0a",
    backgroundImage:
      "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
  },
};

const TEXT_COLOR: Record<string, string> = {
  dark: "#e5e5e5",
  light: "#1a1a1a",
  grid: "#e5e5e5",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function PreviewPanel() {
  const store = useFontStore();
  const {
    params, previewText, previewSize, lineHeight, letterSpacing, wordSpacing,
    bgMode, showMetrics, features, compareSnapshot,
    setPreviewText, setPreviewSize, setLineHeight, setLetterSpacing, setWordSpacing,
    setBgMode, setShowMetrics, toggleFeature,
    setCompareSnapshot, clearCompareSnapshot,
    getVariationSettings, getFontFeatureSettings,
    textColor, bgColor, setTextColor, setBgColor,
  } = store;

  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [align, setAlign] = useState<Align>("left");
  const [showCSS, setShowCSS] = useState(false);

  const variationSettings = getVariationSettings();
  const featureSettings = getFontFeatureSettings();

  const fontStyle = (size?: number): React.CSSProperties => ({
    fontFamily: '"Roboto Flex", sans-serif',
    fontVariationSettings: variationSettings,
    fontFeatureSettings: featureSettings,
    fontSize: size ?? previewSize,
    lineHeight,
    letterSpacing: `${letterSpacing}em`,
    wordSpacing: `${wordSpacing}em`,
    color: TEXT_COLOR[bgMode],
    textAlign: align,
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: "preview",   label: "Preview"   },
    { key: "waterfall", label: "Waterfall" },
    { key: "kerning",   label: "Kerning"   },
    { key: "metrics",   label: "Metrics"   },
    { key: "wcag",      label: "WCAG"      },
  ];

  return (
    <>
      <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#252525] bg-[#141414] flex-wrap flex-shrink-0">

          {/* Background */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-0.5 border border-[#2a2a2a]">
            {(["dark", "light", "grid"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBgMode(mode)}
                title={mode}
                className={`p-1.5 rounded-md transition-colors ${bgMode === mode ? "bg-[#2e2e2e] text-neutral-200" : "text-neutral-600 hover:text-neutral-400"}`}
              >
                {mode === "dark"  ? <Moon size={13} /> :
                 mode === "light" ? <Sun  size={13} /> :
                                    <Grid3x3 size={13} />}
              </button>
            ))}
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-0.5 border border-[#2a2a2a]">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAlign(a)}
                className={`p-1.5 rounded-md transition-colors ${align === a ? "bg-[#2e2e2e] text-neutral-200" : "text-neutral-600 hover:text-neutral-400"}`}
              >
                {a === "left"   ? <AlignLeft   size={13} /> :
                 a === "center" ? <AlignCenter size={13} /> :
                                  <AlignRight  size={13} />}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#252525]" />

          {/* OT Feature toggles */}
          {(Object.keys(features) as (keyof typeof features)[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleFeature(key)}
              title={OT_FEATURE_LABELS[key]}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                features[key]
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                  : "bg-[#1a1a1a] border-[#252525] text-neutral-600 hover:text-neutral-400"
              }`}
            >
              {key}
            </button>
          ))}

          <div className="h-4 w-px bg-[#252525]" />

          {/* Metrics overlay */}
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            title="Metrics overlay"
            className={`p-1.5 rounded-md transition-colors border ${
              showMetrics
                ? "bg-amber-600/20 border-amber-500/40 text-amber-300"
                : "bg-[#1a1a1a] border-[#252525] text-neutral-600 hover:text-neutral-400"
            }`}
          >
            <Ruler size={13} />
          </button>

          {/* Compare snapshot */}
          <button
            onClick={() => compareSnapshot ? clearCompareSnapshot() : setCompareSnapshot()}
            title={compareSnapshot ? "Clear compare" : "Snapshot for compare"}
            className={`p-1.5 rounded-md transition-colors border ${
              compareSnapshot
                ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                : "bg-[#1a1a1a] border-[#252525] text-neutral-600 hover:text-neutral-400"
            }`}
          >
            {compareSnapshot ? <Columns2 size={13} /> : <GitCompare size={13} />}
          </button>

          {/* CSS code */}
          <button
            onClick={() => setShowCSS(true)}
            title="Copy CSS"
            className="p-1.5 rounded-md bg-[#1a1a1a] border border-[#252525] text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            <Code2 size={13} />
          </button>

          <div className="flex-1" />

          {/* Size slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600">Size</span>
            <div className="w-28">
              <RadixSlider.Root
                min={12} max={120} step={1}
                value={[previewSize]}
                onValueChange={([v]) => setPreviewSize(v)}
                className="relative flex items-center w-full h-4 touch-none cursor-pointer"
              >
                <RadixSlider.Track className="relative h-[2px] w-full rounded-full bg-neutral-700">
                  <RadixSlider.Range className="absolute h-full rounded-full bg-neutral-500" />
                </RadixSlider.Track>
                <RadixSlider.Thumb className="block w-3 h-3 rounded-full bg-white shadow focus:outline-none" />
              </RadixSlider.Root>
            </div>
            <span className="text-xs tabular-nums text-neutral-500 w-8">{previewSize}px</span>
          </div>
        </div>

        {/* ── Typography micro-controls ────────────────────────────────── */}
        <div className="flex items-center gap-5 px-5 py-2 border-b border-[#252525] bg-[#0f0f0f] text-xs flex-shrink-0">
          {[
            { label: "Line height", value: lineHeight, min: 0.8, max: 3, step: 0.05, set: setLineHeight, fmt: (v: number) => v.toFixed(2) },
            { label: "Letter spacing", value: letterSpacing, min: -0.1, max: 0.5, step: 0.005, set: setLetterSpacing, fmt: (v: number) => `${v.toFixed(3)}em` },
            { label: "Word spacing", value: wordSpacing, min: 0, max: 2, step: 0.05, set: setWordSpacing, fmt: (v: number) => `${v.toFixed(2)}em` },
          ].map(({ label, value, min, max, step, set, fmt }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-neutral-600 whitespace-nowrap">{label}</span>
              <div className="w-24">
                <RadixSlider.Root
                  min={min} max={max} step={step}
                  value={[value]}
                  onValueChange={([v]) => set(v)}
                  className="relative flex items-center w-full h-4 touch-none cursor-pointer"
                >
                  <RadixSlider.Track className="relative h-[2px] w-full rounded-full bg-neutral-800">
                    <RadixSlider.Range className="absolute h-full rounded-full bg-neutral-600" />
                  </RadixSlider.Track>
                  <RadixSlider.Thumb className="block w-2.5 h-2.5 rounded-full bg-neutral-400 shadow focus:outline-none" />
                </RadixSlider.Root>
              </div>
              <span className="text-neutral-500 tabular-nums w-16">{fmt(value)}</span>
            </div>
          ))}

          <div className="flex-1" />
          <span className="text-neutral-700 font-mono truncate max-w-xs" title={variationSettings}>
            {variationSettings}
          </span>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────── */}
        <div className="flex border-b border-[#252525] bg-[#0f0f0f] flex-shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? "border-blue-500 text-neutral-200"
                  : "border-transparent text-neutral-600 hover:text-neutral-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto" style={BG_STYLES[bgMode]}>

          {/* PREVIEW TAB */}
          {activeTab === "preview" && (
            <div className="flex flex-col gap-8 p-8">
              {compareSnapshot ? (
                /* Compare mode: side by side */
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-3">Snapshot</div>
                    <div
                      style={{
                        fontFamily: '"Roboto Flex", sans-serif',
                        fontVariationSettings: Object.entries(compareSnapshot).map(([k, v]) => `'${k}' ${v}`).join(", "),
                        fontFeatureSettings: featureSettings,
                        fontSize: previewSize,
                        lineHeight,
                        letterSpacing: `${letterSpacing}em`,
                        color: TEXT_COLOR[bgMode],
                        opacity: 0.6,
                      }}
                    >
                      {previewText}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-3">Current</div>
                    <div style={fontStyle()}>{previewText}</div>
                  </div>
                </div>
              ) : (
                /* Normal mode: editable textarea with optional metrics overlay */
                <div className="relative">
                  {showMetrics && <MetricsOverlay params={params} fontSize={previewSize} lineHeight={lineHeight} />}
                  <textarea
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    rows={4}
                    spellCheck={false}
                    className="w-full bg-transparent border border-transparent hover:border-[#252525] focus:border-[#353535] focus:outline-none resize-none rounded-md px-0 py-1 placeholder-neutral-700 transition-colors"
                    style={fontStyle()}
                    placeholder="Type to preview…"
                  />
                </div>
              )}
            </div>
          )}

          {/* WATERFALL TAB */}
          {activeTab === "waterfall" && (
            <div className="flex flex-col gap-8 p-8">
              <div className="flex flex-col gap-5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
                  Size waterfall
                </span>
                {PREVIEW_SIZES.map((size) => (
                  <div key={size} className="flex items-baseline gap-4">
                    <span className="text-[10px] text-neutral-700 tabular-nums w-7 flex-shrink-0">{size}</span>
                    <span style={fontStyle(size)}>
                      {previewText || "The quick brown fox jumps over the lazy dog"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[#1e1e1e]" />

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 block mb-4">
                  Glyphs
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {GLYPH_SAMPLES.map((sample) => (
                    <div key={sample} style={fontStyle(24)} className="leading-relaxed">
                      {sample}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* KERNING TAB */}
          {activeTab === "kerning" && (
            <div className="p-8">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 block mb-6">
                Kerning pairs
              </span>
              <div className="flex flex-col gap-6">
                {KERNING_PAIRS.map((row, i) => (
                  <div key={i} className="flex gap-4 flex-wrap">
                    {row.map((pair) => (
                      <div key={pair} className="flex flex-col items-center gap-1">
                        <span
                          style={{
                            ...fontStyle(48),
                            letterSpacing: 0,
                            wordSpacing: 0,
                          }}
                          className="leading-none"
                        >
                          {pair}
                        </span>
                        <span className="text-[10px] text-neutral-700 font-mono">{pair}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 block mb-4">
                  Spacing string
                </span>
                <div
                  style={fontStyle(36)}
                  className="leading-relaxed tracking-widest"
                >
                  HHOHAHOAHOAHO NNINIA OOIOVO xoxoxo noinino
                </div>
              </div>
            </div>
          )}

          {/* METRICS TAB */}
          {activeTab === "metrics" && (
            <MetricsTab params={params} previewSize={previewSize} lineHeight={lineHeight} fontStyle={fontStyle} />
          )}

          {/* WCAG TAB */}
          {activeTab === "wcag" && (
            <WCAGTab
              previewText={previewText}
              previewSize={previewSize}
              variationSettings={variationSettings}
              featureSettings={featureSettings}
              lineHeight={lineHeight}
              letterSpacing={letterSpacing}
              textColor={textColor}
              bgColor={bgColor}
              setTextColor={setTextColor}
              setBgColor={setBgColor}
            />
          )}

        </div>
      </main>

      {showCSS && <CSSCodeModal onClose={() => setShowCSS(false)} />}
    </>
  );
}

// ─── Metrics Overlay (shown over preview text) ────────────────────────────────

function MetricsOverlay({
  params,
  fontSize,
  lineHeight,
}: {
  params: Record<string, number>;
  fontSize: number;
  lineHeight: number;
}) {
  const m = calcMetrics(params, fontSize, lineHeight);

  const lines = [
    { y: m.ascender,  label: "Ascender",  color: "#22c55e" },
    { y: m.capHeight, label: "Cap",        color: "#3b82f6" },
    { y: m.xHeight,   label: "x-Height",  color: "#eab308" },
    { y: m.baseline,  label: "Baseline",  color: "#ef4444" },
    { y: m.descender, label: "Descender", color: "#a855f7" },
  ];

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ height: m.totalHeight, top: 4 }}
    >
      {lines.map(({ y, label, color }) => (
        <div
          key={label}
          className="absolute left-0 right-0 flex items-center"
          style={{ top: y }}
        >
          <div style={{ height: 1, flex: 1, background: color, opacity: 0.5 }} />
          <span
            className="text-[9px] px-1 ml-1 flex-shrink-0"
            style={{ color, fontFamily: "monospace" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Metrics Tab ──────────────────────────────────────────────────────────────

function MetricsTab({
  params,
  previewSize,
  lineHeight,
  fontStyle,
}: {
  params: Record<string, number>;
  previewSize: number;
  lineHeight: number;
  fontStyle: (size?: number) => React.CSSProperties;
}) {
  const m = calcMetrics(params, previewSize, lineHeight);

  const lines = [
    { y: m.ascender,  label: "Ascender",  value: Math.round(params.YTAS ?? 750), color: "#22c55e" },
    { y: m.capHeight, label: "Cap Height", value: Math.round(params.YTUC ?? 712), color: "#3b82f6" },
    { y: m.xHeight,   label: "x-Height",  value: Math.round(params.YTLC ?? 514), color: "#eab308" },
    { y: m.baseline,  label: "Baseline",  value: 0,                              color: "#ef4444" },
    { y: m.descender, label: "Descender", value: Math.round(params.YTDE ?? -203), color: "#a855f7" },
  ];

  return (
    <div className="p-8">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 block mb-6">
        Metrics visualization
      </span>

      {/* Visual display */}
      <div
        className="relative mb-8 overflow-hidden"
        style={{ height: m.totalHeight + 32 }}
      >
        {/* Metric lines */}
        {lines.map(({ y, label, value, color }) => (
          <div
            key={label}
            className="absolute left-0 right-0 flex items-center gap-3"
            style={{ top: y + 16 }}
          >
            <div style={{ height: 1, width: 40, background: color, opacity: 0.7, flexShrink: 0 }} />
            <div
              className="text-[10px] font-mono whitespace-nowrap"
              style={{ color, flexShrink: 0 }}
            >
              {label} {value !== 0 ? `(${value})` : ""}
            </div>
            <div style={{ height: 1, flex: 1, background: color, opacity: 0.15 }} />
          </div>
        ))}

        {/* Sample text */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{
            ...fontStyle(previewSize),
            top: 16,
            lineHeight,
          }}
        >
          {METRICS_SAMPLE}
        </div>
      </div>

      {/* Metrics table */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Ascender (YTAS)",  value: `${params.YTAS ?? 750} / 2048 = ${((params.YTAS ?? 750) / 2048 * 100).toFixed(1)}%` },
          { label: "Cap Height (YTUC)", value: `${params.YTUC ?? 712} / 2048 = ${((params.YTUC ?? 712) / 2048 * 100).toFixed(1)}%` },
          { label: "x-Height (YTLC)",  value: `${params.YTLC ?? 514} / 2048 = ${((params.YTLC ?? 514) / 2048 * 100).toFixed(1)}%` },
          { label: "Descender (YTDE)", value: `${params.YTDE ?? -203} / 2048 = ${((params.YTDE ?? -203) / 2048 * 100).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#141414] rounded-lg p-3">
            <div className="text-[10px] text-neutral-600 mb-1">{label}</div>
            <div className="text-xs text-neutral-300 font-mono">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WCAG Tab ─────────────────────────────────────────────────────────────────

function WCAGTab({
  previewText, previewSize, variationSettings, featureSettings,
  lineHeight, letterSpacing, textColor, bgColor, setTextColor, setBgColor,
}: {
  previewText: string;
  previewSize: number;
  variationSettings: string;
  featureSettings: string;
  lineHeight: number;
  letterSpacing: number;
  textColor: string;
  bgColor: string;
  setTextColor: (c: string) => void;
  setBgColor: (c: string) => void;
}) {
  const ratio = getContrastRatio(textColor, bgColor);
  const normalLevel = getWCAGLevel(ratio, false);
  const largeLevel  = getWCAGLevel(ratio, true);

  const levelColor = (level: string) =>
    level === "AAA" ? "text-green-400" :
    level === "AA"  ? "text-blue-400"  :
    level === "AA Large" ? "text-yellow-400" :
    "text-red-400";

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* Color pickers */}
      <div className="flex gap-6">
        {[
          { label: "Text color",       value: textColor, set: setTextColor },
          { label: "Background color", value: bgColor,   set: setBgColor   },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="text-xs text-neutral-500">{label}</span>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md border border-[#252525] overflow-hidden cursor-pointer relative"
                style={{ background: value }}
              >
                <input
                  type="color"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <input
                type="text"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-neutral-200 font-mono w-24 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Ratio display */}
      <div className="flex gap-4">
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Contrast ratio</div>
          <div className="text-4xl font-bold text-neutral-100 tabular-nums">{ratio.toFixed(2)}<span className="text-lg text-neutral-500">:1</span></div>
        </div>
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Normal text</div>
          <div className={`text-2xl font-bold ${levelColor(normalLevel)}`}>{normalLevel}</div>
          <div className="text-xs text-neutral-600 mt-1">AA ≥ 4.5 / AAA ≥ 7.0</div>
        </div>
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Large text (18pt+)</div>
          <div className={`text-2xl font-bold ${levelColor(largeLevel)}`}>{largeLevel}</div>
          <div className="text-xs text-neutral-600 mt-1">AA ≥ 3.0 / AAA ≥ 4.5</div>
        </div>
      </div>

      {/* Live preview */}
      <div
        className="rounded-xl p-8 border border-[#252525]"
        style={{ background: bgColor }}
      >
        <div
          style={{
            fontFamily: '"Roboto Flex", sans-serif',
            fontVariationSettings: variationSettings,
            fontFeatureSettings: featureSettings,
            fontSize: previewSize,
            lineHeight,
            letterSpacing: `${letterSpacing}em`,
            color: textColor,
          }}
        >
          {previewText || "The quick brown fox jumps over the lazy dog"}
        </div>
      </div>
    </div>
  );
}
