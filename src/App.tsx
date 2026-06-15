import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CSSMonacoEditor } from './components/CSSMonacoEditor';
import { Preview } from './components/Preview';
import { PropertyForm } from './components/PropertyForm';
import { PresetSelector } from './components/PresetSelector';
import { ViewportSwitcher, VIEWPORTS } from './components/ViewportSwitcher';
import { PRESETS } from './presets';
import { LayoutProps, ViewportSize } from './types';
import { parseContainerCSS, stringifyContainerCSS, buildFullCSS, buildStandaloneHTML } from './cssUtils';

const DEFAULT_PRESET = PRESETS[1];

const App: React.FC = () => {
  const [containerCSS, setContainerCSS] = useState(DEFAULT_PRESET.containerRawCSS);
  const [itemsCSS, setItemsCSS] = useState(DEFAULT_PRESET.itemsRawCSS);
  const [layoutProps, setLayoutProps] = useState<LayoutProps>(DEFAULT_PRESET.containerCSS);
  const [itemCount, setItemCount] = useState(DEFAULT_PRESET.itemCount);
  const [itemStyles, setItemStyles] = useState<Record<number, string> | undefined>(DEFAULT_PRESET.itemStyles);
  const [htmlTemplate, setHtmlTemplate] = useState<string | undefined>(DEFAULT_PRESET.htmlTemplate);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [showGuides, setShowGuides] = useState(true);
  const [currentPresetId, setCurrentPresetId] = useState<string>(DEFAULT_PRESET.id);
  const [isFormUpdating, setIsFormUpdating] = useState(false);
  const [isCodeUpdating, setIsCodeUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'container' | 'items'>('container');
  const containerRef = useRef<HTMLDivElement>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const handleCodeChange = useCallback((newCSS: string) => {
    if (isFormUpdating) return;
    setIsCodeUpdating(true);
    setContainerCSS(newCSS);
    const parsed = parseContainerCSS(newCSS);
    setLayoutProps(parsed);
    setCurrentPresetId('');
    setTimeout(() => setIsCodeUpdating(false), 0);
  }, [isFormUpdating]);

  const handleItemsCodeChange = useCallback((newCSS: string) => {
    setItemsCSS(newCSS);
    setCurrentPresetId('');
  }, []);

  const handleFormChange = useCallback((newProps: LayoutProps) => {
    if (isCodeUpdating) return;
    setIsFormUpdating(true);
    setLayoutProps(newProps);
    const newCSS = stringifyContainerCSS(newProps, containerCSS);
    setContainerCSS(newCSS);
    setCurrentPresetId('');
    setTimeout(() => setIsFormUpdating(false), 0);
  }, [isCodeUpdating, containerCSS]);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setCurrentPresetId(presetId);
    setContainerCSS(preset.containerRawCSS);
    setItemsCSS(preset.itemsRawCSS);
    setLayoutProps(preset.containerCSS);
    setItemCount(preset.itemCount);
    setItemStyles(preset.itemStyles);
    setHtmlTemplate(preset.htmlTemplate);
  }, []);

  const handleCopyCSS = useCallback(async () => {
    const fullCSS = buildFullCSS(containerCSS, itemsCSS, itemStyles);
    try {
      await navigator.clipboard.writeText(fullCSS);
      showNotification('CSS 已复制到剪贴板');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullCSS;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showNotification('CSS 已复制到剪贴板');
    }
  }, [containerCSS, itemsCSS, itemStyles, showNotification]);

  const handleDownloadHTML = useCallback(() => {
    const html = buildStandaloneHTML(containerCSS, itemsCSS, itemCount, htmlTemplate, itemStyles);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout-preview.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('HTML 文件已下载');
  }, [containerCSS, itemsCSS, itemCount, htmlTemplate, itemStyles, showNotification]);

  const handleViewportChange = useCallback((v: ViewportSize) => {
    setViewport(v);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleCopyCSS();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleDownloadHTML();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopyCSS, handleDownloadHTML]);

  const viewportWidth = VIEWPORTS[viewport].width;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100">CSS Layout Debugger</h1>
              <p className="text-xs text-slate-500">Grid & Flexbox 可视化调试</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <PresetSelector onSelect={handlePresetSelect} currentId={currentPresetId} />
        </div>

        <div className="flex items-center gap-3">
          <ViewportSwitcher value={viewport} onChange={handleViewportChange} />

          <div className="h-6 w-px bg-slate-700" />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
            />
            <span className="text-xs text-slate-400 font-medium">显示辅助线</span>
          </label>

          <div className="h-6 w-px bg-slate-700" />

          <button
            onClick={handleCopyCSS}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
            title="复制 CSS (Ctrl/Cmd+Shift+C)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制 CSS
          </button>

          <button
            onClick={handleDownloadHTML}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            title="下载 HTML (Ctrl/Cmd+Shift+S)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载 HTML
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActivePanel('container')}
              className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                activePanel === 'container'
                  ? 'bg-slate-800 text-slate-100 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              容器 CSS
            </button>
            <button
              onClick={() => setActivePanel('items')}
              className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                activePanel === 'items'
                  ? 'bg-slate-800 text-slate-100 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              子项 CSS
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {activePanel === 'container' ? (
              <CSSMonacoEditor
                value={containerCSS}
                onChange={handleCodeChange}
                label="Container Styles"
              />
            ) : (
              <CSSMonacoEditor
                value={itemsCSS}
                onChange={handleItemsCodeChange}
                label="Items Styles"
              />
            )}
          </div>

          <div className="h-[280px] flex-shrink-0 border-t border-slate-800 overflow-hidden">
            <PropertyForm props={layoutProps} onChange={handleFormChange} />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <Preview
            containerCSS={containerCSS}
            itemsCSS={itemsCSS}
            itemStyles={itemStyles}
            itemCount={itemCount}
            htmlTemplate={htmlTemplate}
            viewportWidth={viewportWidth}
            showGuides={showGuides}
            containerRef={containerRef}
          />
        </div>
      </div>

      <footer className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex-shrink-0 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>
            显示模式: <span className="text-slate-300 font-medium">{layoutProps.display}</span>
          </span>
          {layoutProps.display === 'grid' && layoutProps.gridTemplateColumns && (
            <span>
              列: <span className="text-slate-300 font-medium">{layoutProps.gridTemplateColumns}</span>
            </span>
          )}
          {layoutProps.display === 'flex' && layoutProps.flexDirection && (
            <span>
              方向: <span className="text-slate-300 font-medium">{layoutProps.flexDirection}</span>
            </span>
          )}
          {layoutProps.gap && (
            <span>
              间距: <span className="text-slate-300 font-medium">{layoutProps.gap}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>快捷键: Ctrl+Shift+C 复制 | Ctrl+Shift+S 下载</span>
        </div>
      </footer>

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 animate-pulse">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {notification}
        </div>
      )}
    </div>
  );
};

export default App;
