import React from 'react';
import { LayoutProps } from '../types';

interface PropertyFormProps {
  props: LayoutProps;
  onChange: (props: LayoutProps) => void;
}

const DISPLAY_OPTIONS = [
  { value: 'flex', label: 'flex' },
  { value: 'grid', label: 'grid' },
];

const FLEX_DIRECTION_OPTIONS = [
  { value: 'row', label: 'row' },
  { value: 'row-reverse', label: 'row-reverse' },
  { value: 'column', label: 'column' },
  { value: 'column-reverse', label: 'column-reverse' },
];

const FLEX_WRAP_OPTIONS = [
  { value: 'nowrap', label: 'nowrap' },
  { value: 'wrap', label: 'wrap' },
  { value: 'wrap-reverse', label: 'wrap-reverse' },
];

const JUSTIFY_CONTENT_OPTIONS = [
  { value: '', label: '(default)' },
  { value: 'flex-start', label: 'flex-start' },
  { value: 'flex-end', label: 'flex-end' },
  { value: 'center', label: 'center' },
  { value: 'space-between', label: 'space-between' },
  { value: 'space-around', label: 'space-around' },
  { value: 'space-evenly', label: 'space-evenly' },
  { value: 'start', label: 'start' },
  { value: 'end', label: 'end' },
  { value: 'stretch', label: 'stretch' },
];

const ALIGN_ITEMS_OPTIONS = [
  { value: '', label: '(default)' },
  { value: 'flex-start', label: 'flex-start' },
  { value: 'flex-end', label: 'flex-end' },
  { value: 'center', label: 'center' },
  { value: 'stretch', label: 'stretch' },
  { value: 'baseline', label: 'baseline' },
  { value: 'start', label: 'start' },
  { value: 'end', label: 'end' },
];

const ALIGN_CONTENT_OPTIONS = [
  { value: '', label: '(default)' },
  { value: 'flex-start', label: 'flex-start' },
  { value: 'flex-end', label: 'flex-end' },
  { value: 'center', label: 'center' },
  { value: 'space-between', label: 'space-between' },
  { value: 'space-around', label: 'space-around' },
  { value: 'space-evenly', label: 'space-evenly' },
  { value: 'stretch', label: 'stretch' },
];

const JUSTIFY_ITEMS_OPTIONS = [
  { value: '', label: '(default)' },
  { value: 'start', label: 'start' },
  { value: 'end', label: 'end' },
  { value: 'center', label: 'center' },
  { value: 'stretch', label: 'stretch' },
];

const GRID_AUTO_FLOW_OPTIONS = [
  { value: '', label: '(default)' },
  { value: 'row', label: 'row' },
  { value: 'column', label: 'column' },
  { value: 'row dense', label: 'row dense' },
  { value: 'column dense', label: 'column dense' },
];

const GRID_TEMPLATE_PRESETS_COLUMNS = [
  '',
  '1fr',
  '1fr 1fr',
  'repeat(2, 1fr)',
  'repeat(3, 1fr)',
  'repeat(4, 1fr)',
  'repeat(3, 150px)',
  'repeat(auto-fill, minmax(120px, 1fr))',
  'repeat(auto-fit, minmax(120px, 1fr))',
  '200px 1fr 200px',
  'auto 1fr auto',
];

const GRID_TEMPLATE_PRESETS_ROWS = [
  '',
  'auto',
  'auto 1fr',
  'auto 1fr auto',
  '1fr 1fr',
  'repeat(3, 1fr)',
  'repeat(auto-fill, minmax(100px, 1fr))',
];

const GAP_PRESETS = [
  '',
  '4px',
  '8px',
  '12px',
  '16px',
  '20px',
  '24px',
  '1rem',
  '1.5rem',
  '2rem',
];

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[] | string[];
  onChange: (v: string) => void;
  freeform?: boolean;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  freeform,
  placeholder,
}) => {
  const normalizedOptions = options.map(o =>
    typeof o === 'string' ? { value: o, label: o || '(empty)' } : o
  );

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      {freeform ? (
        <div className="flex gap-1">
          <select
            className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={normalizedOptions.some(o => o.value === value) ? value : ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {normalizedOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            type="text"
            className="w-24 bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={value}
            placeholder={placeholder || '自定义...'}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <select
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {normalizedOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; color: string }> = ({ title, color }) => (
  <div className="flex items-center gap-2 pt-1 pb-2">
    <span className={`w-1.5 h-4 rounded-sm ${color}`} />
    <span className="text-sm font-semibold text-slate-200">{title}</span>
  </div>
);

export const PropertyForm: React.FC<PropertyFormProps> = ({ props, onChange }) => {
  const update = (key: keyof LayoutProps, value: string) => {
    const next = { ...props } as any;
    if (value === '') {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  };

  const isGrid = props.display === 'grid';
  const isFlex = props.display === 'flex';

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 text-sm">
      <SectionHeader title="基础" color="bg-indigo-500" />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="display"
          value={props.display}
          options={DISPLAY_OPTIONS}
          onChange={(v) => update('display', v)}
        />
        <SelectField
          label="gap"
          value={props.gap || ''}
          options={GAP_PRESETS}
          onChange={(v) => update('gap', v)}
          freeform
        />
      </div>

      {isFlex && (
        <>
          <SectionHeader title="Flexbox" color="bg-amber-500" />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="flex-direction"
              value={props.flexDirection || ''}
              options={[{ value: '', label: '(default)' }, ...FLEX_DIRECTION_OPTIONS]}
              onChange={(v) => update('flexDirection', v)}
            />
            <SelectField
              label="flex-wrap"
              value={props.flexWrap || ''}
              options={[{ value: '', label: '(default)' }, ...FLEX_WRAP_OPTIONS]}
              onChange={(v) => update('flexWrap', v)}
            />
            <SelectField
              label="justify-content"
              value={props.justifyContent || ''}
              options={JUSTIFY_CONTENT_OPTIONS}
              onChange={(v) => update('justifyContent', v)}
            />
            <SelectField
              label="align-items"
              value={props.alignItems || ''}
              options={ALIGN_ITEMS_OPTIONS}
              onChange={(v) => update('alignItems', v)}
            />
            <SelectField
              label="align-content"
              value={props.alignContent || ''}
              options={ALIGN_CONTENT_OPTIONS}
              onChange={(v) => update('alignContent', v)}
            />
          </div>
        </>
      )}

      {isGrid && (
        <>
          <SectionHeader title="Grid" color="bg-emerald-500" />
          <div className="space-y-3">
            <SelectField
              label="grid-template-columns"
              value={props.gridTemplateColumns || ''}
              options={GRID_TEMPLATE_PRESETS_COLUMNS}
              onChange={(v) => update('gridTemplateColumns', v)}
              freeform
              placeholder="e.g. 1fr 2fr"
            />
            <SelectField
              label="grid-template-rows"
              value={props.gridTemplateRows || ''}
              options={GRID_TEMPLATE_PRESETS_ROWS}
              onChange={(v) => update('gridTemplateRows', v)}
              freeform
              placeholder="e.g. auto 1fr"
            />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="row-gap"
                value={props.rowGap || ''}
                options={GAP_PRESETS}
                onChange={(v) => update('rowGap', v)}
                freeform
              />
              <SelectField
                label="column-gap"
                value={props.columnGap || ''}
                options={GAP_PRESETS}
                onChange={(v) => update('columnGap', v)}
                freeform
              />
              <SelectField
                label="justify-items"
                value={props.justifyItems || ''}
                options={JUSTIFY_ITEMS_OPTIONS}
                onChange={(v) => update('justifyItems', v)}
              />
              <SelectField
                label="grid-auto-flow"
                value={props.gridAutoFlow || ''}
                options={GRID_AUTO_FLOW_OPTIONS}
                onChange={(v) => update('gridAutoFlow', v)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
