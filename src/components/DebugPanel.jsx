import { useState, useEffect, useRef } from 'react';
import './DebugPanel.css';

export default function DebugPanel({ renderedCount, firstVisibleRow, totalRows }) {
  const [fps, setFps] = useState(60);
  const [collapsed, setCollapsed] = useState(false);
  const frameTimesRef = useRef([]);
  const lastFrameRef = useRef(performance.now());
  const rafRef = useRef(null);

  useEffect(() => {
    let running = true;
    function measureFps() {
      if (!running) return;
      const now = performance.now();
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
      }

      const avg =
        frameTimesRef.current.reduce((a, b) => a + b, 0) /
        frameTimesRef.current.length;
      setFps(Math.round(1000 / avg));

      rafRef.current = requestAnimationFrame(measureFps);
    }

    rafRef.current = requestAnimationFrame(measureFps);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fpsColor = fps >= 55 ? 'var(--status-completed)' : fps >= 30 ? 'var(--status-pending)' : 'var(--status-failed)';

  return (
    <div
      data-test-id="debug-panel"
      className={`debug-panel glass ${collapsed ? 'debug-panel--collapsed' : ''}`}
    >
      <div className="debug-panel__header" onClick={() => setCollapsed(!collapsed)}>
        <span className="debug-panel__dot" style={{ background: fpsColor }} />
        <span className="debug-panel__title">Debug</span>
        <span className="debug-panel__toggle">{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <div className="debug-panel__body">
          <div className="debug-panel__metric">
            <span className="debug-panel__label">FPS</span>
            <span
              data-test-id="debug-fps"
              className="debug-panel__value"
              style={{ color: fpsColor }}
            >
              {fps}
            </span>
          </div>

          <div className="debug-panel__metric">
            <span className="debug-panel__label">DOM Rows</span>
            <span data-test-id="debug-rendered-rows" className="debug-panel__value">
              {renderedCount}
            </span>
          </div>

          <div className="debug-panel__metric">
            <span className="debug-panel__label">Position</span>
            <span data-test-id="debug-scroll-position" className="debug-panel__value">
              Row {(firstVisibleRow + 1).toLocaleString()} / {totalRows.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
