import React from "react";
import { Sparkles } from "lucide-react";
import { PRESET_SAMPLES } from "../data/presets";
import { PresetSample } from "../types";

interface PresetSelectorProps {
  onSelect: (preset: PresetSample) => void;
  disabled?: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect, disabled = false }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        Quick Test Presets:
      </span>
      {PRESET_SAMPLES.map((sample) => (
        <button
          key={sample.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(sample)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-lg transition-all shadow-2xs disabled:opacity-50"
        >
          <span>{sample.title}</span>
          <span className="text-slate-400 text-[11px]">({sample.role})</span>
        </button>
      ))}
    </div>
  );
};
