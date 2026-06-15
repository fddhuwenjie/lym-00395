export interface LayoutProps {
  display: 'grid' | 'flex';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'start' | 'end' | 'stretch';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | 'start' | 'end' | 'self-start' | 'self-end';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'start' | 'end';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense' | 'dense';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: string;
  justifySelf?: string;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  containerCSS: LayoutProps;
  itemCount: number;
  containerRawCSS: string;
  itemsRawCSS: string;
  itemStyles?: Record<number, string>;
  htmlTemplate?: string;
}

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'full';

export interface ViewportConfig {
  width: number | string;
  label: string;
  icon: string;
}

export interface Snapshot {
  id: string;
  name: string;
  createdAt: number;
  containerCSS: string;
  itemsCSS: string;
  itemCount: number;
  itemStyles?: Record<number, string>;
  htmlTemplate?: string;
  thumbnail?: string;
  layoutProps: LayoutProps;
}
