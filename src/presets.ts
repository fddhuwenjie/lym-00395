import { Preset } from './types';

export const PRESETS: Preset[] = [
  {
    id: 'holy-grail',
    name: 'Holy Grail 圣杯布局',
    description: '经典三栏布局：头、左中右、尾',
    containerCSS: {
      display: 'grid',
      gridTemplateColumns: '200px 1fr 200px',
      gridTemplateRows: 'auto 1fr auto',
      gap: '12px',
    },
    itemCount: 5,
    containerRawCSS: `.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
  height: 100%;
  min-height: 300px;
}`,
    itemsRawCSS: `.item-header { grid-column: 1 / -1; }
.item-nav { grid-column: 1; grid-row: 2; }
.item-main { grid-column: 2; grid-row: 2; }
.item-aside { grid-column: 3; grid-row: 2; }
.item-footer { grid-column: 1 / -1; }`,
    itemStyles: {
      0: 'grid-column: 1 / -1;',
      1: 'grid-column: 1; grid-row: 2;',
      2: 'grid-column: 2; grid-row: 2; min-height: 120px;',
      3: 'grid-column: 3; grid-row: 2;',
      4: 'grid-column: 1 / -1;',
    },
    htmlTemplate: `<div class="container">
  <div class="item preview-item">Header</div>
  <div class="item preview-item">Nav</div>
  <div class="item preview-item">Main Content</div>
  <div class="item preview-item">Aside</div>
  <div class="item preview-item">Footer</div>
</div>`,
  },
  {
    id: 'card-grid',
    name: 'Card Grid 卡片网格',
    description: '响应式 3 列卡片布局',
    containerCSS: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
    },
    itemCount: 6,
    containerRawCSS: `.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}`,
    itemsRawCSS: `.item {
  aspect-ratio: 4 / 3;
}`,
    htmlTemplate: `<div class="container">
  <div class="item preview-item">Card 1</div>
  <div class="item preview-item">Card 2</div>
  <div class="item preview-item">Card 3</div>
  <div class="item preview-item">Card 4</div>
  <div class="item preview-item">Card 5</div>
  <div class="item preview-item">Card 6</div>
</div>`,
  },
  {
    id: 'sticky-footer',
    name: 'Sticky Footer 粘性页脚',
    description: '内容不足时页脚也贴底',
    containerCSS: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
    itemCount: 3,
    containerRawCSS: `.container {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}`,
    itemsRawCSS: `.item-header { flex-shrink: 0; }
.item-main { flex: 1; min-height: 60px; }
.item-footer { flex-shrink: 0; }`,
    itemStyles: {
      0: 'flex-shrink: 0;',
      1: 'flex: 1; min-height: 60px;',
      2: 'flex-shrink: 0;',
    },
    htmlTemplate: `<div class="container">
  <div class="item preview-item">Header</div>
  <div class="item preview-item">Main Content</div>
  <div class="item preview-item">Footer</div>
</div>`,
  },
  {
    id: 'flex-row-center',
    name: 'Flex 水平居中',
    description: '经典的水平垂直居中',
    containerCSS: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
    },
    itemCount: 3,
    containerRawCSS: `.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
  min-height: 200px;
}`,
    itemsRawCSS: `.item {
  padding: 20px 32px;
}`,
    htmlTemplate: `<div class="container">
  <div class="item preview-item">A</div>
  <div class="item preview-item">B</div>
  <div class="item preview-item">C</div>
</div>`,
  },
  {
    id: 'flex-column',
    name: 'Flex Column 垂直列',
    description: 'flex-direction: column 示例',
    containerCSS: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      gap: '8px',
    },
    itemCount: 4,
    containerRawCSS: `.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  gap: 8px;
  min-height: 300px;
}`,
    itemsRawCSS: `.item { }`,
    htmlTemplate: `<div class="container">
  <div class="item preview-item">Top</div>
  <div class="item preview-item">Middle 1</div>
  <div class="item preview-item">Middle 2</div>
  <div class="item preview-item">Bottom</div>
</div>`,
  },
  {
    id: 'grid-auto-fill',
    name: 'Grid Auto-Fill 自适应',
    description: 'auto-fill + minmax 响应式',
    containerCSS: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '12px',
    },
    itemCount: 8,
    containerRawCSS: `.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}`,
    itemsRawCSS: `.item {
  aspect-ratio: 1;
}`,
    htmlTemplate: `<div class="container">
  <div class="item preview-item">1</div>
  <div class="item preview-item">2</div>
  <div class="item preview-item">3</div>
  <div class="item preview-item">4</div>
  <div class="item preview-item">5</div>
  <div class="item preview-item">6</div>
  <div class="item preview-item">7</div>
  <div class="item preview-item">8</div>
</div>`,
  },
];
