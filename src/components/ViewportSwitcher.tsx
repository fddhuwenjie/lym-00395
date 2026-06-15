import React from 'react';
import { ViewportSize, ViewportConfig } from '../types';

export const VIEWPORTS: Record<ViewportSize, ViewportConfig> = {
  mobile: { width: 375, label: 'Mobile', icon: '📱' },
  tablet: { width: 768, label: 'Tablet', icon: '📋' },
  desktop: { width: 1200, label: 'Desktop', icon: '🖥️' },
  full: { width: '100%', label: 'Full', icon: '⬛' },
};

interface ViewportSwitcherProps {
  value: ViewportSize;
  onChange: (v: ViewportSize) => void;
}

export const ViewportSwitcher: React.FC<ViewportSwitcherProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
      {(Object.keys(VIEWPORTS) as ViewportSize[]).map((key) => {
        const vp = VIEWPORTS[key];
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
            title={`${vp.label} (${typeof vp.width === 'number' ? vp.width + 'px' : vp.width})`}
          >
            <span>{vp.icon}</span>
            <span>{vp.label}</span>
          </button>
        );
      })}
    </div>
  );
};
