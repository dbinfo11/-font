"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { FONT_PARAMS, PARAM_GROUPS, ParamGroup } from "@/lib/fontParams";
import { useFontStore } from "@/store/fontStore";
import { ParameterSlider } from "./ParameterSlider";
import { PresetsPanel } from "./PresetsPanel";

const TYPOGRAPHY_PARAMS = [
  { key: "lineHeight",     label: "Line Height",     description: "Space between lines",         min: 0.8, max: 3.0,  default: 1.2,  step: 0.05 },
  { key: "letterSpacing",  label: "Letter Spacing",  description: "Space between characters",    min: -0.1, max: 0.5, default: 0,    step: 0.005, unit: "em" },
  { key: "wordSpacing",    label: "Word Spacing",    description: "Space between words",         min: 0,    max: 2.0, default: 0,    step: 0.05,  unit: "em" },
];

export function ParameterPanel() {
  const {
    params, setParam, resetParam, resetAll,
    lineHeight, letterSpacing, wordSpacing,
    setLineHeight, setLetterSpacing, setWordSpacing,
  } = useFontStore();

  const [openGroups, setOpenGroups] = useState<Set<ParamGroup | "typography">>(
    new Set(["basic", "grade", "stroke", "vertical", "typography"])
  );

  const toggleGroup = (group: ParamGroup | "typography") => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const typoValues: Record<string, number> = { lineHeight, letterSpacing, wordSpacing };
  const typoSetters: Record<string, (v: number) => void> = {
    lineHeight: setLineHeight,
    letterSpacing: setLetterSpacing,
    wordSpacing: setWordSpacing,
  };

  return (
    <aside className="flex flex-col h-full w-[340px] flex-shrink-0 border-r border-[#252525] bg-[#141414]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Parameters
        </span>
        <button
          onClick={resetAll}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <RefreshCw size={11} />
          Reset all
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* Presets */}
        <PresetsPanel />

        {/* Typography group */}
        <Collapsible.Root
          open={openGroups.has("typography")}
          onOpenChange={() => toggleGroup("typography")}
        >
          <Collapsible.Trigger className="flex w-full items-center justify-between px-5 py-3 border-b border-[#252525] hover:bg-white/[0.02] transition-colors">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Typography
            </span>
            <ChevronDown
              size={14}
              className={`text-neutral-600 transition-transform duration-200 ${openGroups.has("typography") ? "rotate-180" : ""}`}
            />
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="flex flex-col gap-5 px-5 py-5 border-b border-[#252525]">
              {TYPOGRAPHY_PARAMS.map((p) => (
                <ParameterSlider
                  key={p.key}
                  param={{ ...p, group: "basic" }}
                  value={typoValues[p.key]}
                  onChange={(v) => typoSetters[p.key](v)}
                  onReset={() => typoSetters[p.key](p.default)}
                />
              ))}
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Variable font axis groups */}
        {PARAM_GROUPS.map(({ key: groupKey, label }) => {
          const paramsInGroup = FONT_PARAMS.filter((p) => p.group === groupKey);
          const isOpen = openGroups.has(groupKey);

          return (
            <Collapsible.Root
              key={groupKey}
              open={isOpen}
              onOpenChange={() => toggleGroup(groupKey)}
            >
              <Collapsible.Trigger className="flex w-full items-center justify-between px-5 py-3 border-b border-[#252525] hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  {label}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-neutral-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="flex flex-col gap-5 px-5 py-5 border-b border-[#252525]">
                  {paramsInGroup.map((param) => (
                    <ParameterSlider
                      key={param.key}
                      param={param}
                      value={params[param.key]}
                      onChange={(v) => setParam(param.key, v)}
                      onReset={() => resetParam(param.key)}
                    />
                  ))}
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          );
        })}
      </div>
    </aside>
  );
}
