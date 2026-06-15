import * as css from 'css';
import { LayoutProps } from './types';

export function parseContainerCSS(raw: string): LayoutProps {
  const result: LayoutProps = {
    display: 'flex',
  };

  try {
    const cleanCSS = raw.includes('{') ? raw : `.container { ${raw} }`;
    const parsed = css.parse(cleanCSS);
    const rules = parsed.stylesheet?.rules || [];
    for (const rule of rules) {
      if (rule.type === 'rule') {
        const declarations = (rule as css.Rule).declarations || [];
        for (const decl of declarations) {
          if (decl.type === 'declaration') {
            const property = (decl as css.Declaration).property;
            const value = (decl as css.Declaration).value;
            if (property && value !== undefined) {
              const camelProp = toCamelCase(property);
              if (camelProp === 'display' && (value === 'grid' || value === 'flex')) {
                (result as any)[camelProp] = value;
              } else if (camelProp !== 'height' && camelProp !== 'minHeight') {
                (result as any)[camelProp] = value;
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('CSS parse error:', e);
  }

  return result;
}

export function stringifyContainerCSS(props: LayoutProps, existingRaw?: string): string {
  try {
    const baseCSS = existingRaw || `.container { height: 100%; }`;
    const parsed = css.parse(baseCSS);
    const rules = parsed.stylesheet?.rules || [];

    for (const rule of rules) {
      if (rule.type === 'rule') {
        const declarations = (rule as css.Rule).declarations || [];
        const propMap = new Map<string, number>();

        declarations.forEach((decl, idx) => {
          if (decl.type === 'declaration') {
            propMap.set((decl as css.Declaration).property || '', idx);
          }
        });

        for (const [key, value] of Object.entries(props)) {
          if (value === undefined || value === '') continue;
          const kebabKey = toKebabCase(key);
          const existingIdx = propMap.get(kebabKey);

          if (existingIdx !== undefined) {
            (declarations[existingIdx] as css.Declaration).value = value;
          } else {
            declarations.push({
              type: 'declaration',
              property: kebabKey,
              value: value,
            } as css.Declaration);
          }
        }

        const filteredDecls = declarations.filter((decl) => {
          if (decl.type !== 'declaration') return true;
          const prop = (decl as css.Declaration).property;
          const val = (decl as css.Declaration).value;
          if (val === undefined || val === '') return false;
          const camelProp = toCamelCase(prop || '');
          if (camelProp === 'height' || camelProp === 'minHeight') return true;
          return Object.keys(props).some(k => toKebabCase(k) === prop);
        });

        (rule as css.Rule).declarations = filteredDecls;
      }
    }

    return css.stringify(parsed, { compress: false });
  } catch (e) {
    console.warn('CSS stringify error:', e);
    const lines: string[] = [];
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined && value !== '') {
        lines.push(`  ${toKebabCase(key)}: ${value};`);
      }
    }
    return `.container {\n${lines.join('\n')}\n  height: 100%;\n}`;
  }
}

function toCamelCase(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function toKebabCase(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function extractBlock(raw: string, selector: string): string {
  const match = raw.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
  return match ? match[1].trim() : '';
}

export function buildFullCSS(
  containerRaw: string,
  itemsRaw: string,
  itemStyles?: Record<number, string>
): string {
  let result = containerRaw + '\n\n' + itemsRaw;
  if (itemStyles) {
    for (const [idx, style] of Object.entries(itemStyles)) {
      result += `\n\n.item:nth-child(${parseInt(idx) + 1}) { ${style} }`;
    }
  }
  return result;
}

export function buildStandaloneHTML(
  containerCSS: string,
  itemsCSS: string,
  itemCount: number,
  htmlTemplate?: string,
  itemStyles?: Record<number, string>
): string {
  let itemsHTML = '';
  if (htmlTemplate) {
    itemsHTML = htmlTemplate.replace(/class="container"/, 'class="container"');
  } else {
    const items = Array.from({ length: itemCount }, (_, i) => {
      return `  <div class="item preview-item">Item ${i + 1}</div>`;
    });
    itemsHTML = `<div class="container">\n${items.join('\n')}\n</div>`;
  }

  let extraStyles = '';
  if (itemStyles) {
    for (const [idx, style] of Object.entries(itemStyles)) {
      extraStyles += `\n.container > .item:nth-child(${parseInt(idx) + 1}) { ${style} }`;
    }
  }

  const fullCSS = containerCSS + '\n\n' + itemsCSS + '\n' + extraStyles;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Layout Preview</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
      padding: 24px;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    .preview-wrapper {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      padding: 16px;
      min-height: 400px;
      width: 100%;
      max-width: 1200px;
    }

    .preview-item {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
      min-height: 40px;
      padding: 8px 12px;
    }

    ${fullCSS}
  </style>
</head>
<body>
  <div class="preview-wrapper">
    ${itemsHTML}
  </div>
</body>
</html>`;
}

export function getContainerDeclarations(raw: string): { property: string; value: string }[] {
  const result: { property: string; value: string }[] = [];
  try {
    const cleanCSS = raw.includes('{') ? raw : `.container { ${raw} }`;
    const parsed = css.parse(cleanCSS);
    const rules = parsed.stylesheet?.rules || [];
    for (const rule of rules) {
      if (rule.type === 'rule') {
        const declarations = (rule as css.Rule).declarations || [];
        for (const decl of declarations) {
          if (decl.type === 'declaration') {
            const property = (decl as css.Declaration).property;
            const value = (decl as css.Declaration).value;
            if (property && value !== undefined) {
              result.push({ property, value });
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('CSS parse error:', e);
  }
  return result;
}

export async function captureThumbnail(element: HTMLElement | null): Promise<string | undefined> {
  if (!element) return undefined;
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const rect = element.getBoundingClientRect();
    const scale = 0.5;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    ctx.scale(scale, scale);

    const computedStyle = getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor || '#ffffff';
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const children = Array.from(element.children) as HTMLElement[];
    for (const child of children) {
      const childRect = child.getBoundingClientRect();
      const childStyle = getComputedStyle(child);
      
      const x = childRect.left - rect.left;
      const y = childRect.top - rect.top;
      const w = childRect.width;
      const h = childRect.height;

      const bgGradient = childStyle.backgroundImage;
      if (bgGradient && bgGradient.includes('gradient')) {
        const colors = bgGradient.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\([^)]+\)/g);
        if (colors && colors.length >= 2) {
          const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(1, colors[colors.length - 1]);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = '#6366f1';
        }
      } else {
        ctx.fillStyle = childStyle.backgroundColor || '#6366f1';
      }

      const radius = parseFloat(childStyle.borderRadius) || 0;
      if (radius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, w, h);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.min(12, h * 0.3)}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(child.textContent?.slice(0, 10) || '', x + w / 2, y + h / 2);
    }

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Thumbnail capture failed:', e);
    return undefined;
  }
}
