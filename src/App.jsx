import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import VirtualGrid from './components/VirtualGrid';
import DebugPanel from './components/DebugPanel';
import FilterBar from './components/FilterBar';
import './App.css';

export default function App() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);

  /* Sorting */
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  /* Filtering */
  const [merchantFilter, setMerchantFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState(null);

  /* Selection */
  const [selectedRows, setSelectedRows] = useState(new Set());

  /* Pinned columns */
  const [pinnedColumns, setPinnedColumns] = useState(new Set());

  /* Debug metrics */
  const [debugMetrics, setDebugMetrics] = useState({
    renderedCount: 0,
    firstVisibleRow: 0,
  });

  const rafDebugRef = useRef(null);

  /* Load data */
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setLoadProgress(10);

        const response = await fetch('/transactions.json');
        if (!response.ok) throw new Error('Failed to load data');

        setLoadProgress(30);

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length') || 0;
        let receivedLength = 0;
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          if (contentLength > 0) {
            setLoadProgress(30 + Math.round((receivedLength / contentLength) * 50));
          }
        }

        setLoadProgress(85);
        const blob = new Blob(chunks);
        const text = await blob.text();
        setLoadProgress(90);

        const parsed = JSON.parse(text);
        if (!cancelled) {
          setAllData(parsed);
          setLoadProgress(100);
          setTimeout(() => setLoading(false), 400);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  /* Poll debug metrics from VirtualGrid */
  useEffect(() => {
    function poll() {
      if (VirtualGrid.__debugData) {
        setDebugMetrics(VirtualGrid.__debugData);
      }
      rafDebugRef.current = requestAnimationFrame(poll);
    }
    rafDebugRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafDebugRef.current) cancelAnimationFrame(rafDebugRef.current);
    };
  }, []);

  /* Processed data (filter + sort) */
  const processedData = useMemo(() => {
    let result = allData;

    // Filter by merchant
    if (merchantFilter) {
      const lowerFilter = merchantFilter.toLowerCase();
      result = result.filter((row) =>
        row.merchant.toLowerCase().includes(lowerFilter)
      );
    }

    // Quick filter by status
    if (quickFilter) {
      result = result.filter((row) => row.status === quickFilter);
    }

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        let cmp = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [allData, merchantFilter, quickFilter, sortKey, sortDir]);

  /* Handlers */
  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey]
  );

  const handleFilterMerchant = useCallback((value) => {
    setMerchantFilter(value);
    setSelectedRows(new Set());
  }, []);

  const handleQuickFilter = useCallback((status) => {
    setQuickFilter(status);
    setSelectedRows(new Set());
  }, []);

  const handleRowClick = useCallback((index, e) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    } else {
      setSelectedRows(new Set([index]));
    }
  }, []);

  const handleCellSave = useCallback(
    (globalIndex, colKey, newValue) => {
      setAllData((prev) => {
        const row = processedData[globalIndex];
        if (!row) return prev;
        const originalIndex = prev.findIndex((r) => r.id === row.id);
        if (originalIndex === -1) return prev;
        const next = [...prev];
        next[originalIndex] = {
          ...next[originalIndex],
          [colKey]: colKey === 'amount' ? parseFloat(newValue) || 0 : newValue,
        };
        return next;
      });
    },
    [processedData]
  );

  const handleTogglePin = useCallback((key) => {
    setPinnedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /* Loading screen */
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card glass">
          <div className="loading-spinner" />
          <h2 className="loading-title">Loading Financial Data</h2>
          <p className="loading-subtitle">
            Parsing 1,000,000 transaction records...
          </p>
          <div className="loading-progress-track">
            <div
              className="loading-progress-bar"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="loading-percent">{loadProgress}%</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div className="loading-card glass">
          <h2 className="loading-title" style={{ color: 'var(--status-failed)' }}>
            Error Loading Data
          </h2>
          <p className="loading-subtitle">{error}</p>
          <p className="loading-subtitle">
            Run <code>npm run generate-data</code> first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header glass">
        <div className="app-header__left">
          <div className="app-header__logo">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h1 className="app-header__title">Financial Data Grid</h1>
            <p className="app-header__subtitle">
              {allData.length.toLocaleString()} transactions • Virtual Scrolling
            </p>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        totalRows={allData.length}
        filteredCount={processedData.length}
        onFilterMerchant={handleFilterMerchant}
        onQuickFilter={handleQuickFilter}
        activeQuickFilter={quickFilter}
      />

      {/* Grid */}
      <VirtualGrid
        data={processedData}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onCellSave={handleCellSave}
        selectedRows={selectedRows}
        onRowClick={handleRowClick}
        pinnedColumns={pinnedColumns}
        onTogglePin={handleTogglePin}
      />

      {/* Debug Panel */}
      <DebugPanel
        renderedCount={debugMetrics.renderedCount}
        firstVisibleRow={debugMetrics.firstVisibleRow}
        totalRows={processedData.length}
      />
    </div>
  );
}
