import React from 'react';
import { PRESETS } from '../presets';

interface PresetSelectorProps {
  onSelect: (presetId: string) => void;
  currentId?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect, currentId }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 font-medium">预设:</span>
      <div className="flex gap-1 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            title={p.description}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              currentId === p.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
};
