"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { useFontStore } from "@/store/fontStore";
import { generateCSS } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

export function CSSCodeModal({ onClose }: Props) {
  const { fontName, params, features, lineHeight, letterSpacing, wordSpacing } =
    useFontStore();
  const [copied, setCopied] = useState(false);

  const css = generateCSS(
    fontName,
    params,
    features,
    lineHeight,
    letterSpacing,
    wordSpacing
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[600px] max-w-[90vw] bg-[#141414] border border-[#252525] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
          <span className="text-sm font-semibold text-neutral-200">CSS Code</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-xs text-white transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Code */}
        <pre className="p-5 text-xs text-neutral-300 font-mono overflow-x-auto leading-relaxed whitespace-pre">
          {css}
        </pre>
      </div>
    </div>
  );
}
