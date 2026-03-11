"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { RotateCcw } from "lucide-react";
import { FontParam } from "@/lib/fontParams";

interface Props {
  param: FontParam;
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
}

export function ParameterSlider({ param, value, onChange, onReset }: Props) {
  const isDefault = value === param.default;
  const displayValue =
    Number.isInteger(param.step)
      ? Math.round(value).toString()
      : value.toFixed(1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-neutral-200 leading-none">
            {param.label}
          </span>
          <span className="text-xs text-neutral-500 mt-0.5 truncate">
            {param.description}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-sm tabular-nums text-neutral-300 min-w-[3rem] text-right">
            {displayValue}
            {param.unit ?? ""}
          </span>
          <button
            onClick={onReset}
            disabled={isDefault}
            className="p-1 rounded text-neutral-600 hover:text-neutral-300 disabled:opacity-0 disabled:pointer-events-none transition-all"
            title="Reset to default"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      <RadixSlider.Root
        min={param.min}
        max={param.max}
        step={param.step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="relative flex items-center w-full h-4 touch-none select-none cursor-pointer"
      >
        <RadixSlider.Track className="relative h-[2px] w-full grow rounded-full bg-neutral-700">
          <RadixSlider.Range className="absolute h-full rounded-full bg-blue-500" />
        </RadixSlider.Track>
        <RadixSlider.Thumb className="block w-3.5 h-3.5 rounded-full bg-white shadow-md ring-2 ring-transparent hover:ring-blue-400 focus:ring-blue-500 focus:outline-none transition-all" />
      </RadixSlider.Root>

      <div className="flex justify-between text-[10px] text-neutral-700">
        <span>{param.min}{param.unit ?? ""}</span>
        <span>{param.max}{param.unit ?? ""}</span>
      </div>
    </div>
  );
}
