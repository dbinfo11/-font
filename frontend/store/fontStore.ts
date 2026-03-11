"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FONT_PARAMS,
  ParamValues,
  getDefaultParams,
  toVariationSettings,
} from "@/lib/fontParams";

export interface Preset {
  id: string;
  name: string;
  params: ParamValues;
  isBuiltIn?: boolean;
}

export interface OTFeatures {
  liga: boolean; // standard ligatures
  calt: boolean; // contextual alternates
  smcp: boolean; // small caps
  onum: boolean; // old-style figures
  tnum: boolean; // tabular numbers
}

export type BgMode = "dark" | "light" | "grid";

export const BUILT_IN_PRESETS: Preset[] = [
  { id: "default",   name: "Default",   params: getDefaultParams(), isBuiltIn: true },
  { id: "thin",      name: "Thin",      params: { ...getDefaultParams(), wght: 100 }, isBuiltIn: true },
  { id: "light",     name: "Light",     params: { ...getDefaultParams(), wght: 300 }, isBuiltIn: true },
  { id: "medium",    name: "Medium",    params: { ...getDefaultParams(), wght: 500 }, isBuiltIn: true },
  { id: "bold",      name: "Bold",      params: { ...getDefaultParams(), wght: 700 }, isBuiltIn: true },
  { id: "black",     name: "Black",     params: { ...getDefaultParams(), wght: 900 }, isBuiltIn: true },
  { id: "condensed", name: "Condensed", params: { ...getDefaultParams(), wdth: 50  }, isBuiltIn: true },
  { id: "wide",      name: "Wide",      params: { ...getDefaultParams(), wdth: 140 }, isBuiltIn: true },
  { id: "italic",    name: "Italic",    params: { ...getDefaultParams(), slnt: -10 }, isBuiltIn: true },
  { id: "display",   name: "Display",   params: { ...getDefaultParams(), wght: 250, opsz: 144 }, isBuiltIn: true },
  { id: "caption",   name: "Caption",   params: { ...getDefaultParams(), wght: 500, opsz: 8, wdth: 90 }, isBuiltIn: true },
];

interface FontStore {
  fontName: string;
  params: ParamValues;
  previewText: string;
  previewSize: number;
  isExporting: boolean;

  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;

  bgMode: BgMode;
  showMetrics: boolean;
  features: OTFeatures;
  compareSnapshot: ParamValues | null;
  savedPresets: Preset[];
  textColor: string;
  bgColor: string;

  setFontName: (name: string) => void;
  setParam: (key: string, value: number) => void;
  resetParam: (key: string) => void;
  resetAll: () => void;
  setPreviewText: (text: string) => void;
  setPreviewSize: (size: number) => void;
  setExporting: (v: boolean) => void;
  setLineHeight: (v: number) => void;
  setLetterSpacing: (v: number) => void;
  setWordSpacing: (v: number) => void;
  setBgMode: (mode: BgMode) => void;
  setShowMetrics: (v: boolean) => void;
  toggleFeature: (key: keyof OTFeatures) => void;
  setCompareSnapshot: () => void;
  clearCompareSnapshot: () => void;
  savePreset: (name: string) => void;
  loadPreset: (preset: Preset) => void;
  deletePreset: (id: string) => void;
  setTextColor: (c: string) => void;
  setBgColor: (c: string) => void;
  getVariationSettings: () => string;
  getFontFeatureSettings: () => string;
  exportFont: (format: "ttf" | "woff2" | "both") => Promise<void>;
}

export const useFontStore = create<FontStore>()(
  persist(
    (set, get) => ({
      fontName: "MyFont",
      params: getDefaultParams(),
      previewText: "The quick brown fox jumps over the lazy dog",
      previewSize: 56,
      isExporting: false,
      lineHeight: 1.2,
      letterSpacing: 0,
      wordSpacing: 0,
      bgMode: "dark",
      showMetrics: false,
      features: { liga: true, calt: true, smcp: false, onum: false, tnum: false },
      compareSnapshot: null,
      savedPresets: [],
      textColor: "#ffffff",
      bgColor: "#000000",

      setFontName: (name) => set({ fontName: name }),
      setParam: (key, value) =>
        set((state) => ({ params: { ...state.params, [key]: value } })),
      resetParam: (key) => {
        const param = FONT_PARAMS.find((p) => p.key === key);
        if (param)
          set((state) => ({ params: { ...state.params, [key]: param.default } }));
      },
      resetAll: () => set({ params: getDefaultParams() }),
      setPreviewText: (text) => set({ previewText: text }),
      setPreviewSize: (size) => set({ previewSize: size }),
      setExporting: (v) => set({ isExporting: v }),
      setLineHeight: (v) => set({ lineHeight: v }),
      setLetterSpacing: (v) => set({ letterSpacing: v }),
      setWordSpacing: (v) => set({ wordSpacing: v }),
      setBgMode: (mode) => set({ bgMode: mode }),
      setShowMetrics: (v) => set({ showMetrics: v }),
      toggleFeature: (key) =>
        set((state) => ({
          features: { ...state.features, [key]: !state.features[key] },
        })),
      setCompareSnapshot: () => set({ compareSnapshot: { ...get().params } }),
      clearCompareSnapshot: () => set({ compareSnapshot: null }),
      savePreset: (name) => {
        const preset: Preset = {
          id: `custom-${Date.now()}`,
          name,
          params: { ...get().params },
        };
        set((state) => ({ savedPresets: [...state.savedPresets, preset] }));
      },
      loadPreset: (preset) => set({ params: { ...preset.params } }),
      deletePreset: (id) =>
        set((state) => ({
          savedPresets: state.savedPresets.filter((p) => p.id !== id),
        })),
      setTextColor: (c) => set({ textColor: c }),
      setBgColor: (c) => set({ bgColor: c }),
      getVariationSettings: () => toVariationSettings(get().params),
      getFontFeatureSettings: () => {
        const { features } = get();
        return Object.entries(features)
          .map(([k, v]) => `'${k}' ${v ? 1 : 0}`)
          .join(", ");
      },
      exportFont: async (format) => {
        const { fontName, params, setExporting } = get();
        setExporting(true);
        try {
          const res = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fontName, params, format }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(err.detail ?? "Export failed");
          }
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const ext = format === "both" ? "zip" : format;
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fontName}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        } finally {
          setExporting(false);
        }
      },
    }),
    {
      name: "font-studio-storage",
      partialize: (state) => ({
        savedPresets: state.savedPresets,
        fontName: state.fontName,
      }),
    }
  )
);
