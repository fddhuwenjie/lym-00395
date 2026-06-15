import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CSSMonacoEditorProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

const CSS_PROPERTIES = [
  'display',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'justify-content',
  'align-items',
  'align-content',
  'gap',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-auto-flow',
  'justify-items',
  'align-self',
  'justify-self',
  'grid-column',
  'grid-row',
  'grid-area',
  'order',
  'flex',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'aspect-ratio',
  'min-height',
  'min-width',
  'height',
  'width',
  'padding',
  'margin',
];

const DISPLAY_VALUES = ['flex', 'grid', 'block', 'inline-block', 'inline-flex', 'inline-grid'];
const FLEX_DIRECTION_VALUES = ['row', 'row-reverse', 'column', 'column-reverse'];
const FLEX_WRAP_VALUES = ['nowrap', 'wrap', 'wrap-reverse'];
const JUSTIFY_CONTENT_VALUES = [
  'flex-start', 'flex-end', 'center', 'space-between', 'space-around',
  'space-evenly', 'start', 'end', 'stretch', 'left', 'right',
];
const ALIGN_ITEMS_VALUES = [
  'flex-start', 'flex-end', 'center', 'stretch', 'baseline',
  'start', 'end', 'self-start', 'self-end',
];
const ALIGN_CONTENT_VALUES = [
  'flex-start', 'flex-end', 'center', 'space-between', 'space-around',
  'space-evenly', 'stretch', 'start', 'end',
];
const JUSTIFY_ITEMS_VALUES = ['start', 'end', 'center', 'stretch'];
const GRID_AUTO_FLOW_VALUES = ['row', 'column', 'row dense', 'column dense', 'dense'];
const GRID_TEMPLATE_PRESETS = [
  '1fr', '1fr 1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)',
  'repeat(4, 1fr)', 'repeat(auto-fill, minmax(100px, 1fr))',
  'repeat(auto-fit, minmax(100px, 1fr))', '200px 1fr 200px',
  'auto 1fr auto',
];

export const CSSMonacoEditor: React.FC<CSSMonacoEditorProps> = ({ value, onChange, label }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    (monacoInstance.languages as any).css?.defaults?.setModeConfiguration?.({
      diagnostics: {
        validate: false,
      },
    });

    monacoInstance.languages.registerCompletionItemProvider('css', {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const lineUntilPosition = model.getLineContent(position.lineNumber).slice(0, position.column - 1);

        const propertyMatch = lineUntilPosition.match(/([\w-]+)\s*:\s*([\w-,()\s]*)$/);
        if (propertyMatch) {
          const propName = propertyMatch[1];
          return {
            suggestions: getPropertyValueSuggestions(propName).map(v => ({
              label: v,
              kind: monacoInstance.languages.CompletionItemKind.Value,
              insertText: v,
              range: undefined!,
            })),
          };
        }

        const atPropertyStart = /([;{}]|^)\s*([\w-]*)$/.test(lineUntilPosition);
        if (atPropertyStart) {
          return {
            suggestions: CSS_PROPERTIES.map(prop => ({
              label: prop,
              kind: monacoInstance.languages.CompletionItemKind.Property,
              insertText: prop + ': ',
              range: undefined!,
            })),
          };
        }

        return { suggestions: [] };
      },
    });
  };

  function getPropertyValueSuggestions(prop: string): string[] {
    switch (prop) {
      case 'display': return DISPLAY_VALUES;
      case 'flex-direction': return FLEX_DIRECTION_VALUES;
      case 'flex-wrap': return FLEX_WRAP_VALUES;
      case 'justify-content': return JUSTIFY_CONTENT_VALUES;
      case 'align-items': return ALIGN_ITEMS_VALUES;
      case 'align-content': return ALIGN_CONTENT_VALUES;
      case 'justify-items': return JUSTIFY_ITEMS_VALUES;
      case 'grid-auto-flow': return GRID_AUTO_FLOW_VALUES;
      case 'grid-template-columns':
      case 'grid-template-rows':
        return GRID_TEMPLATE_PRESETS;
      case 'gap':
      case 'row-gap':
      case 'column-gap':
        return ['8px', '12px', '16px', '20px', '24px', '1rem', '1.5rem', '2rem'];
      default:
        return [];
    }
  }

  return (
    <div className="flex flex-col h-full">
      {label && (
        <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 text-sm font-medium text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          {label}
        </div>
      )}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="css"
          value={value}
          onChange={(v) => onChange(v || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
};
