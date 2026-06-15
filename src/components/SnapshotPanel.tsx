import React, { useState } from 'react';
import { Snapshot } from '../types';

interface SnapshotPanelProps {
  snapshots: Snapshot[];
  onTakeSnapshot: () => void;
  onDeleteSnapshot: (id: string) => void;
  onReorderSnapshots: (snapshots: Snapshot[]) => void;
  onLoadSnapshot: (snapshot: Snapshot) => void;
  compareMode: boolean;
  onToggleCompareMode: () => void;
  selectedForCompare: string[];
  onToggleCompareSelect: (id: string) => void;
  onClearCompare: () => void;
}

export const SnapshotPanel: React.FC<SnapshotPanelProps> = ({
  snapshots,
  onTakeSnapshot,
  onDeleteSnapshot,
  onReorderSnapshots,
  onLoadSnapshot,
  compareMode,
  onToggleCompareMode,
  selectedForCompare,
  onToggleCompareSelect,
  onClearCompare,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newSnapshots = [...snapshots];
    const [draggedItem] = newSnapshots.splice(draggedIndex, 1);
    newSnapshots.splice(targetIndex, 0, draggedItem);
    onReorderSnapshots(newSnapshots);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800">
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">快照历史</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTakeSnapshot}
            disabled={snapshots.length >= 10}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded text-xs font-medium text-white transition-colors flex items-center gap-1"
            title="保存当前布局快照"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            快照
          </button>
          <button
            onClick={onToggleCompareMode}
            className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              compareMode
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title="对比模式"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            对比
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="px-3 py-2 bg-emerald-900/20 border-b border-emerald-800/50 text-xs text-emerald-300">
          <div className="flex items-center justify-between">
            <span>
              已选择 {selectedForCompare.length}/2 个快照进行对比
            </span>
            {selectedForCompare.length > 0 && (
              <button
                onClick={onClearCompare}
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                清除选择
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {snapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>暂无快照</p>
            <p className="mt-1 text-slate-600">点击"快照"按钮保存当前布局</p>
          </div>
        ) : (
          snapshots.map((snapshot, index) => {
            const isSelected = selectedForCompare.includes(snapshot.id);
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;

            return (
              <div
                key={snapshot.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-50 scale-95' : ''
                } ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                {compareMode && (
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompareSelect(snapshot.id);
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="p-2"
                  onClick={() => !compareMode && onLoadSnapshot(snapshot)}
                >
                  <div className="aspect-video bg-slate-900 rounded mb-2 overflow-hidden relative">
                    {snapshot.thumbnail ? (
                      <img
                        src={snapshot.thumbnail}
                        alt={snapshot.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-slate-300">
                      {snapshot.itemCount} 项
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {snapshot.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {formatDate(snapshot.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSnapshot(snapshot.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="删除快照"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400">
                      {snapshot.layoutProps.display}
                    </span>
                    {snapshot.layoutProps.display === 'grid' && snapshot.layoutProps.gridTemplateColumns && (
                      <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400">
                        {snapshot.layoutProps.gridTemplateColumns}
                      </span>
                    )}
                    {snapshot.layoutProps.display === 'flex' && snapshot.layoutProps.flexDirection && (
                      <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400">
                        {snapshot.layoutProps.flexDirection}
                      </span>
                    )}
                  </div>
                </div>

                {isDragOver && (
                  <div className="absolute inset-0 border-2 border-dashed border-indigo-500 rounded-lg pointer-events-none" />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        {snapshots.length}/10 个快照 · 拖拽可排序
      </div>
    </div>
  );
};
