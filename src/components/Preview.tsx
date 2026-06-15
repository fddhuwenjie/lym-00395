import React, { useEffect, useRef, useState, useCallback } from 'react';

interface OverlayInfo {
  containerRect: DOMRect;
  contentRect: { left: number; top: number; width: number; height: number };
  paddingLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gridTemplateColumns: string[];
  gridTemplateRows: string[];
  columnGap: number;
  rowGap: number;
  items: Array<{
    rect: DOMRect;
    gridColumnStart: number;
    gridColumnEnd: number;
    gridRowStart: number;
    gridRowEnd: number;
  }>;
}

interface PreviewProps {
  containerCSS: string;
  itemsCSS: string;
  itemStyles?: Record<number, string>;
  itemCount: number;
  htmlTemplate?: string;
  viewportWidth: number | string;
  showGuides: boolean;
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export const Preview: React.FC<PreviewProps> = ({
  containerCSS,
  itemsCSS,
  itemStyles,
  itemCount,
  htmlTemplate,
  viewportWidth,
  showGuides,
  containerRef: externalRef,
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = externalRef || internalRef;
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [overlayInfo, setOverlayInfo] = useState<OverlayInfo | null>(null);
  const styleIdRef = useRef(`preview-style-${Math.random().toString(36).slice(2, 9)}`);

  const calculateOverlay = useCallback(() => {
    const container = containerRef.current;
    if (!container || !showGuides) {
      setOverlayInfo(null);
      return;
    }

    const cs = getComputedStyle(container);
    const items: OverlayInfo['items'] = [];

    const paddingLeft = parseFloat(cs.paddingLeft) || 0;
    const paddingTop = parseFloat(cs.paddingTop) || 0;
    const paddingRight = parseFloat(cs.paddingRight) || 0;
    const paddingBottom = parseFloat(cs.paddingBottom) || 0;

    const containerRect = container.getBoundingClientRect();
    const contentRect = {
      left: containerRect.left + paddingLeft,
      top: containerRect.top + paddingTop,
      width: containerRect.width - paddingLeft - paddingRight,
      height: containerRect.height - paddingTop - paddingBottom,
    };

    const children = Array.from(container.children).filter(
      (c) => c instanceof HTMLElement
    ) as HTMLElement[];

    children.forEach((child) => {
      const childCS = getComputedStyle(child);
      items.push({
        rect: child.getBoundingClientRect(),
        gridColumnStart: parseInt(childCS.gridColumnStart) || 0,
        gridColumnEnd: parseInt(childCS.gridColumnEnd) || 0,
        gridRowStart: parseInt(childCS.gridRowStart) || 0,
        gridRowEnd: parseInt(childCS.gridRowEnd) || 0,
      });
    });

    const gridTC = cs.gridTemplateColumns || '';
    const gridTR = cs.gridTemplateRows || '';

    setOverlayInfo({
      containerRect,
      contentRect,
      paddingLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
      display: cs.display || '',
      flexDirection: cs.flexDirection || 'row',
      justifyContent: cs.justifyContent || '',
      alignItems: cs.alignItems || '',
      gridTemplateColumns: gridTC ? gridTC.split(' ').filter(Boolean) : [],
      gridTemplateRows: gridTR ? gridTR.split(' ').filter(Boolean) : [],
      columnGap: parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0,
      rowGap: parseFloat(cs.rowGap) || parseFloat(cs.gap) || 0,
      items,
    });
  }, [containerRef, showGuides]);

  useEffect(() => {
    const styleId = styleIdRef.current;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const scope = `#${containerRef.current?.id || 'preview-container'}`;
    const scopedContainerCSS = containerCSS
      .replace(/\.container/g, scope);
    const scopedItemsCSS = itemsCSS
      .replace(/\.item/g, `${scope} > .item`);

    let extraItemStyles = '';
    if (itemStyles) {
      for (const [idx, style] of Object.entries(itemStyles)) {
        extraItemStyles += `\n${scope} > .item:nth-child(${parseInt(idx) + 1}) { ${style} }`;
      }
    }

    styleEl.textContent = scopedContainerCSS + '\n\n' + scopedItemsCSS + extraItemStyles;

    return () => {};
  }, [containerCSS, itemsCSS, itemStyles, containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    calculateOverlay();

    const ro = new ResizeObserver(() => {
      calculateOverlay();
    });

    ro.observe(container);
    Array.from(container.children).forEach((child) => {
      if (child instanceof HTMLElement) ro.observe(child);
    });

    const mo = new MutationObserver(() => {
      calculateOverlay();
      Array.from(container.children).forEach((child) => {
        if (child instanceof HTMLElement) ro.observe(child);
      });
    });

    mo.observe(container, { childList: true, attributes: true, subtree: true });

    window.addEventListener('resize', calculateOverlay);

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', calculateOverlay);
    };
  }, [containerRef, calculateOverlay, itemCount, htmlTemplate]);

  const renderHTML = () => {
    if (htmlTemplate) {
      const innerContent = htmlTemplate
        .replace(/<div[^>]*class="container"[^>]*>/, '')
        .replace(/<\/div>\s*$/, '')
        .trim();
      return <div dangerouslySetInnerHTML={{ __html: innerContent }} />;
    }
    return Array.from({ length: itemCount }, (_, i) => (
      <div key={i} className="item preview-item">
        Item {i + 1}
      </div>
    ));
  };

  return (
    <div
      ref={scrollWrapperRef}
      className="relative flex-1 bg-slate-900 overflow-auto p-6 flex items-start justify-center"
      style={{ minHeight: 0 }}
    >
      <div
        ref={cardRef}
        className="relative bg-white rounded-lg shadow-xl"
        style={{
          width: typeof viewportWidth === 'number' ? `${viewportWidth}px` : viewportWidth,
          maxWidth: '100%',
          minHeight: '400px',
        }}
      >
        <div
          id="preview-container"
          ref={containerRef as any}
          className="container relative"
          style={{ padding: '16px', minHeight: '400px', height: '100%' }}
        >
          {renderHTML()}
        </div>

        {showGuides && overlayInfo && (
          <GuidesOverlay info={overlayInfo} wrapperRef={cardRef} />
        )}
      </div>
    </div>
  );
};

const GuidesOverlay: React.FC<{
  info: OverlayInfo;
  wrapperRef: React.RefObject<HTMLDivElement>;
}> = ({ info, wrapperRef }) => {
  const wrapperRect = wrapperRef.current?.getBoundingClientRect();
  if (!wrapperRect) return null;

  const { containerRect, contentRect, display, flexDirection, gridTemplateColumns, gridTemplateRows, columnGap, rowGap, items } = info;
  
  const containerOffsetX = containerRect.left - wrapperRect.left;
  const containerOffsetY = containerRect.top - wrapperRect.top;
  
  const contentOffsetX = contentRect.left - wrapperRect.left;
  const contentOffsetY = contentRect.top - wrapperRect.top;
  const contentW = contentRect.width;
  const contentH = contentRect.height;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width="100%"
      height="100%"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <marker
          id="arrow-main"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
        </marker>
        <marker
          id="arrow-cross"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
        </marker>
        <pattern id="gap-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#ef4444" opacity="0.3" />
        </pattern>
      </defs>

      {display.includes('grid') && (
        <GridGuides
          offsetX={contentOffsetX}
          offsetY={contentOffsetY}
          w={contentW}
          h={contentH}
          gridTemplateColumns={gridTemplateColumns}
          gridTemplateRows={gridTemplateRows}
          columnGap={columnGap}
          rowGap={rowGap}
        />
      )}

      {(display === 'flex' || display === 'inline-flex') && (
        <FlexGuides
          offsetX={contentOffsetX}
          offsetY={contentOffsetY}
          w={contentW}
          h={contentH}
          flexDirection={flexDirection}
          items={items}
        />
      )}

      <ItemBorders items={items} wrapperRect={wrapperRect} />
    </svg>
  );
};

function parsePixelValue(s: string): number {
  const match = s.match(/^([\d.]+)px$/);
  if (match) return parseFloat(match[1]);
  const match2 = s.match(/^([\d.]+)$/);
  if (match2) return parseFloat(match2[1]);
  return 0;
}

function computeTrackPositions(
  sizes: number[],
  gap: number,
  startOffset: number,
  totalSize: number
): { positions: number[]; trackSizes: number[] } {
  const trackCount = sizes.length || 1;
  const validSizes = sizes.filter(s => s > 0);
  
  let trackSizes: number[];
  if (validSizes.length === trackCount) {
    trackSizes = sizes;
  } else {
    const availableSize = totalSize - gap * (trackCount - 1);
    trackSizes = Array(trackCount).fill(availableSize / trackCount);
  }

  const positions: number[] = [startOffset];
  let current = startOffset;
  for (let i = 0; i < trackCount; i++) {
    current += trackSizes[i];
    positions.push(current);
    if (i < trackCount - 1) {
      current += gap;
    }
  }

  return { positions, trackSizes };
}

const GridGuides: React.FC<{
  offsetX: number;
  offsetY: number;
  w: number;
  h: number;
  gridTemplateColumns: string[];
  gridTemplateRows: string[];
  columnGap: number;
  rowGap: number;
}> = ({ offsetX, offsetY, w, h, gridTemplateColumns, gridTemplateRows, columnGap, rowGap }) => {
  const colSizes = gridTemplateColumns.map(parsePixelValue);
  const rowSizes = gridTemplateRows.map(parsePixelValue);

  const { positions: colPositions, trackSizes: colTrackSizes } = computeTrackPositions(
    colSizes,
    columnGap,
    offsetX,
    w
  );
  const { positions: rowPositions, trackSizes: rowTrackSizes } = computeTrackPositions(
    rowSizes,
    rowGap,
    offsetY,
    h
  );

  const trackLines: JSX.Element[] = [];
  const gapRects: JSX.Element[] = [];
  const labels: JSX.Element[] = [];

  colPositions.forEach((x, i) => {
    trackLines.push(
      <line
        key={`col-${i}`}
        x1={x}
        y1={offsetY}
        x2={x}
        y2={offsetY + h}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="6 3"
        opacity="0.8"
      />
    );

    if (i < colTrackSizes.length) {
      const cx = x + colTrackSizes[i] / 2;
      labels.push(
        <text
          key={`col-label-${i}`}
          x={cx}
          y={offsetY - 6}
          fill="#3b82f6"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
        >
          col {i + 1}
        </text>
      );

      if (i < colTrackSizes.length - 1 && columnGap > 0) {
        const gapX = x + colTrackSizes[i];
        gapRects.push(
          <rect
            key={`col-gap-${i}`}
            x={gapX}
            y={offsetY}
            width={columnGap}
            height={h}
            fill="url(#gap-pattern)"
          />
        );
      }
    }
  });

  rowPositions.forEach((y, j) => {
    trackLines.push(
      <line
        key={`row-${j}`}
        x1={offsetX}
        y1={y}
        x2={offsetX + w}
        y2={y}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="6 3"
        opacity="0.8"
      />
    );

    if (j < rowTrackSizes.length) {
      const cy = y + rowTrackSizes[j] / 2;
      labels.push(
        <text
          key={`row-label-${j}`}
          x={offsetX - 6}
          y={cy}
          fill="#3b82f6"
          fontSize="11"
          fontWeight="600"
          textAnchor="end"
          dominantBaseline="middle"
        >
          row {j + 1}
        </text>
      );

      if (j < rowTrackSizes.length - 1 && rowGap > 0) {
        const gapY = y + rowTrackSizes[j];
        gapRects.push(
          <rect
            key={`row-gap-${j}`}
            x={offsetX}
            y={gapY}
            width={w}
            height={rowGap}
            fill="url(#gap-pattern)"
          />
        );
      }
    }
  });

  return (
    <>
      {gapRects}
      {trackLines}
      {labels}
    </>
  );
};

const FlexGuides: React.FC<{
  offsetX: number;
  offsetY: number;
  w: number;
  h: number;
  flexDirection: string;
  items: any[];
}> = ({ offsetX, offsetY, w, h, flexDirection }) => {
  const isRow = flexDirection.includes('row');
  const isReverse = flexDirection.includes('reverse');

  let mainStartX: number, mainStartY: number, mainEndX: number, mainEndY: number;
  let crossStartX: number, crossStartY: number, crossEndX: number, crossEndY: number;

  if (isRow) {
    mainStartX = isReverse ? offsetX + w : offsetX;
    mainStartY = offsetY + h / 2;
    mainEndX = isReverse ? offsetX : offsetX + w;
    mainEndY = offsetY + h / 2;

    crossStartX = offsetX + w / 2;
    crossStartY = offsetY;
    crossEndX = offsetX + w / 2;
    crossEndY = offsetY + h;
  } else {
    mainStartX = offsetX + w / 2;
    mainStartY = isReverse ? offsetY + h : offsetY;
    mainEndX = offsetX + w / 2;
    mainEndY = isReverse ? offsetY : offsetY + h;

    crossStartX = offsetX;
    crossStartY = offsetY + h / 2;
    crossEndX = offsetX + w;
    crossEndY = offsetY + h / 2;
  }

  const mainMidX = (mainStartX + mainEndX) / 2;
  const mainMidY = (mainStartY + mainEndY) / 2;
  const crossMidX = (crossStartX + crossEndX) / 2;
  const crossMidY = (crossStartY + crossEndY) / 2;

  const mainLabelOffsetX = isRow ? 0 : 20;
  const mainLabelOffsetY = isRow ? -12 : 0;
  const crossLabelOffsetX = isRow ? -20 : 0;
  const crossLabelOffsetY = isRow ? 0 : 20;

  return (
    <>
      <line
        x1={mainStartX}
        y1={mainStartY}
        x2={mainEndX}
        y2={mainEndY}
        stroke="#f59e0b"
        strokeWidth="3"
        markerEnd="url(#arrow-main)"
        opacity="0.9"
      />
      <text
        x={mainMidX + mainLabelOffsetX}
        y={mainMidY + mainLabelOffsetY}
        fill="#f59e0b"
        fontSize="11"
        fontWeight="700"
        textAnchor="middle"
      >
        main axis
      </text>

      <line
        x1={crossStartX}
        y1={crossStartY}
        x2={crossEndX}
        y2={crossEndY}
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray="4 4"
        markerEnd="url(#arrow-cross)"
        opacity="0.9"
      />
      <text
        x={crossMidX + crossLabelOffsetX}
        y={crossMidY + crossLabelOffsetY}
        fill="#10b981"
        fontSize="11"
        fontWeight="700"
        textAnchor="middle"
      >
        cross axis
      </text>
    </>
  );
};

const ItemBorders: React.FC<{
  items: any[];
  wrapperRect: DOMRect;
}> = ({ items, wrapperRect }) => {
  return (
    <>
      {items.map((item, i) => {
        const x = item.rect.left - wrapperRect.left;
        const y = item.rect.top - wrapperRect.top;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={item.rect.width}
              height={item.rect.height}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <text
              x={x + 4}
              y={y + 12}
              fill="#8b5cf6"
              fontSize="10"
              fontWeight="600"
            >
              #{i + 1}
            </text>
          </g>
        );
      })}
    </>
  );
};
