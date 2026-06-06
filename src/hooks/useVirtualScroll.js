import { useState, useCallback, useRef, useEffect } from 'react';

const ROW_HEIGHT = 40;
const BUFFER_ROWS = 10;

export function useVirtualScroll(data, containerRef) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const rafRef = useRef(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, [containerRef]);

  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      lastScrollTop.current = newScrollTop;
      setScrollTop(newScrollTop);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const MAX_SCROLL_HEIGHT = 15000000;
  
  const REAL_TOTAL_HEIGHT = data.length * ROW_HEIGHT;
  const totalHeight = Math.min(REAL_TOTAL_HEIGHT, MAX_SCROLL_HEIGHT);
  
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);

  const maxScrollTop = Math.max(0, totalHeight - containerHeight);
  const realMaxScrollTop = Math.max(0, REAL_TOTAL_HEIGHT - containerHeight);

  let realScrollTop = scrollTop;
  if (maxScrollTop > 0 && maxScrollTop !== realMaxScrollTop) {
    const scrollRatio = scrollTop / maxScrollTop;
    realScrollTop = scrollRatio * realMaxScrollTop;
  }

  const startIndex = Math.max(0, Math.floor(realScrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const endIndex = Math.min(data.length, Math.floor((realScrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS);
  
  const offsetY = scrollTop + (startIndex * ROW_HEIGHT) - realScrollTop;
  const visibleData = data.slice(startIndex, endIndex);
  const firstVisibleRow = Math.max(0, Math.floor(realScrollTop / ROW_HEIGHT));

  return {
    handleScroll,
    totalHeight,
    offsetY,
    visibleData,
    startIndex,
    endIndex,
    renderedCount: visibleData.length,
    firstVisibleRow,
    scrollTop,
    ROW_HEIGHT,
  };
}
