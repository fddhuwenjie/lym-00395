import React from 'react';
import { Preview } from './Preview';
import { Snapshot } from '../types';
import { getContainerDeclarations } from '../cssUtils';

interface CompareViewProps {
  snapshotA: Snapshot;
  snapshotB: Snapshot;
  viewportWidth: number | string;
  onClose: () => void;
}

interface CSSDiff {
  property: string;
  valueA: string;
  valueB: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
}

export const CompareView: React.FC<CompareViewProps> = ({
  snapshotA,
  snapshotB,
  viewportWidth,
  onClose,
}) => {
  const computeDiff = (): CSSDiff[] => {
    const declsA = getContainerDeclarations(snapshotA.containerCSS);
    const declsB = getContainerDeclarations(snapshotB.containerCSS);

    const mapA = new Map(declsA.map(d => [d.property, d.value]));
    const mapB = new Map(declsB.map(d => [d.property, d.value]));
    const allProperties = new Set([...mapA.keys(), ...mapB.keys()]);

    const diffs: CSSDiff[] = [];

    for (const prop of allProperties) {
      const valA = mapA.get(prop);
      const valB = mapB.get(prop);

      if (valA === undefined && valB !== undefined) {
        diffs.push({ property: prop, valueA: '', valueB: valB, status: 'added' });
      } else if (valA !== undefined && valB === undefined) {
        diffs.push({ property: prop, valueA: valA, valueB: '', status: 'removed' });
      } else if (valA !== valB) {
        diffs.push({ property: prop, valueA: valA || '', valueB: valB || '', status: 'changed' });
      } else {
        diffs.push({ property: prop, valueA: valA || '', valueB: valB || '', status: 'unchanged' });
      }
    }

    diffs.sort((a, b) => {
      const order = { changed: 0, added: 1, removed: 2, unchanged: 3 };
      return order[a.status] - order[b.status];
    });

    return diffs;
  };

  const diffs = computeDiff();
  const changedCount = diffs.filter(d => d.status !== 'unchanged').length;

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-200">快照对比</h3>
          <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded text-xs font-medium">
            {changedCount} 处差异
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          title="关闭对比"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
            <div className="px-3 py-2 bg-red-900/20 border-b border-red-800/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-300">{snapshotA.name}</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ width: '100%', maxWidth: typeof viewportWidth === 'number' ? `${viewportWidth}px` : viewportWidth, margin: '0 auto' }}>
                <Preview
                  containerCSS={snapshotA.containerCSS}
                  itemsCSS={snapshotA.itemsCSS}
                  itemStyles={snapshotA.itemStyles}
                  itemCount={snapshotA.itemCount}
                  htmlTemplate={snapshotA.htmlTemplate}
                  viewportWidth="100%"
                  showGuides={false}
                  enableTransition={false}
                  id={`compare-a-${snapshotA.id}`}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-3 py-2 bg-emerald-900/20 border-b border-emerald-800/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-300">{snapshotB.name}</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ width: '100%', maxWidth: typeof viewportWidth === 'number' ? `${viewportWidth}px` : viewportWidth, margin: '0 auto' }}>
                <Preview
                  containerCSS={snapshotB.containerCSS}
                  itemsCSS={snapshotB.itemsCSS}
                  itemStyles={snapshotB.itemStyles}
                  itemCount={snapshotB.itemCount}
                  htmlTemplate={snapshotB.htmlTemplate}
                  viewportWidth="100%"
                  showGuides={false}
                  enableTransition={false}
                  id={`compare-b-${snapshotB.id}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-64 flex-shrink-0 border-t border-slate-800 flex flex-col">
          <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-700">
            <span className="text-xs font-medium text-slate-300">CSS 属性差异</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-800 text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left font-medium w-1/3">属性</th>
                  <th className="px-3 py-2 text-left font-medium w-1/3">
                    <span className="text-red-400">{snapshotA.name}</span>
                  </th>
                  <th className="px-3 py-2 text-left font-medium w-1/3">
                    <span className="text-emerald-400">{snapshotB.name}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {diffs.map((diff, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-800 ${
                      diff.status === 'changed'
                        ? 'bg-amber-500/5'
                        : diff.status === 'added'
                        ? 'bg-emerald-500/5'
                        : diff.status === 'removed'
                        ? 'bg-red-500/5'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-slate-300">
                      {diff.property}
                    </td>
                    <td className={`px-3 py-2 font-mono ${
                      diff.status === 'removed' || diff.status === 'changed'
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-slate-400'
                    }`}>
                      {diff.valueA || <span className="text-slate-600 italic">—</span>}
                    </td>
                    <td className={`px-3 py-2 font-mono ${
                      diff.status === 'added' || diff.status === 'changed'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-400'
                    }`}>
                      {diff.valueB || <span className="text-slate-600 italic">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
