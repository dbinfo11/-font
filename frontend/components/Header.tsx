"use client";

import { useState } from "react";
import { Download, Loader2, ChevronDown } from "lucide-react";
import { useFontStore } from "@/store/fontStore";

export function Header() {
  const { fontName, setFontName, exportFont, isExporting } = useFontStore();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: "ttf" | "woff2" | "both") => {
    setShowExportMenu(false);
    await exportFont(format);
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#252525] bg-[#0a0a0a] flex-shrink-0 h-14">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold tracking-tight text-neutral-100">
          Font Studio
        </span>
        <span className="text-xs text-neutral-600 border border-[#252525] rounded px-1.5 py-0.5">
          Roboto Flex
        </span>
      </div>

      {/* Font name input */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-neutral-500">Font name</label>
        <input
          type="text"
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
          maxLength={64}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-500/50 w-44 transition-colors"
          spellCheck={false}
        />
      </div>

      {/* Export button */}
      <div className="relative">
        <div className="flex items-center rounded-lg overflow-hidden border border-[#2a2a2a]">
          {/* Main export button (TTF) */}
          <button
            onClick={() => handleExport("ttf")}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white"
          >
            {isExporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Export TTF
          </button>

          {/* Dropdown toggle */}
          <button
            onClick={() => setShowExportMenu((v) => !v)}
            disabled={isExporting}
            className="px-2 py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-60 transition-colors text-white border-l border-blue-800"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Dropdown menu */}
        {showExportMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowExportMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1.5 z-20 bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg shadow-xl overflow-hidden min-w-[140px]">
              {(["ttf", "woff2", "both"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {fmt === "both" ? "TTF + WOFF2 (.zip)" : fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
