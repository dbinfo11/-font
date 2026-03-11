"use client";

import { useState } from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { useFontStore, BUILT_IN_PRESETS, Preset } from "@/store/fontStore";

export function PresetsPanel() {
  const { params, savedPresets, loadPreset, savePreset, deletePreset } =
    useFontStore();
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSave = () => {
    const name = newName.trim() || `Preset ${savedPresets.length + 1}`;
    savePreset(name);
    setNewName("");
    setSaving(false);
  };

  const isActive = (preset: Preset) =>
    Object.entries(preset.params).every(([k, v]) => params[k] === v);

  return (
    <div className="flex flex-col gap-3 px-5 py-4 border-b border-[#252525]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Presets
        </span>
        <button
          onClick={() => setSaving((v) => !v)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <Plus size={11} />
          Save current
        </button>
      </div>

      {saving && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Preset name…"
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white transition-colors"
          >
            <Check size={12} />
          </button>
        </div>
      )}

      {/* Built-in presets */}
      <div className="flex flex-wrap gap-1.5">
        {BUILT_IN_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => loadPreset(preset)}
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              isActive(preset)
                ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400 hover:text-neutral-200 hover:border-[#3a3a3a]"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom presets */}
      {savedPresets.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
            Saved
          </span>
          {savedPresets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-2 group">
              <button
                onClick={() => loadPreset(preset)}
                className={`flex-1 text-left text-xs py-1 px-2 rounded border transition-colors ${
                  isActive(preset)
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "bg-[#1a1a1a] border-[#252525] text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {preset.name}
              </button>
              <button
                onClick={() => deletePreset(preset.id)}
                className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
