import { useRef, useState, useCallback, memo } from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import './VirtualGrid.css';

const COLUMNS = [
  { key: 'id', label: 'ID', width: 80 },
  { key: 'date', label: 'Date', width: 160 },
  { key: 'merchant', label: 'Merchant', width: 180 },
  { key: 'category', label: 'Category', width: 140 },
  { key: 'amount', label: 'Amount', width: 120 },
  { key: 'status', label: 'Status', width: 110 },
  { key: 'description', label: 'Description', width: 260 },
];

/* ---- Editable Cell ---- */
function EditableCell({ rowIndex, colKey, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setEditing(true);
    setEditValue(typeof value === 'number' ? String(value) : value);
  };

  const commit = () => {
    setEditing(false);
    onSave(rowIndex, colKey, editValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="grid-cell__edit-input"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <span onDoubleClick={handleDoubleClick} className="grid-cell__text">
      {colKey === 'amount' ? `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
       colKey === 'date' ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) :
       value}
    </span>
  );
}

/* ---- Row Component ---- */
const GridRow = memo(function GridRow({
  row,
  rowIndex,
  globalIndex,
  isSelected,
  onClick,
  onCellSave,
  pinnedColumns,
  columns,
}) {
  return (
    <div
      data-test-id={`virtual-row-${globalIndex}`}
      data-selected={isSelected ? 'true' : undefined}
      className={`grid-row ${isSelected ? 'grid-row--selected' : ''} ${
        rowIndex % 2 === 0 ? 'grid-row--even' : ''
      }`}
      onClick={onClick}
      role="row"
    >
      {columns.map((col) => {
        const isPinned = pinnedColumns.has(col.key);
        return (
          <div
            key={col.key}
            data-test-id={`cell-${globalIndex}-${col.key}`}
            className={`grid-cell ${isPinned ? 'pinned-column' : ''} ${
              col.key === 'status' ? `grid-cell--status-${String(row[col.key]).toLowerCase()}` : ''
            } ${col.key === 'amount' ? 'grid-cell--amount' : ''}`}
            style={{ width: col.width, minWidth: col.width }}
          >
            <EditableCell
              rowIndex={globalIndex}
              colKey={col.key}
              value={row[col.key]}
              onSave={onCellSave}
            />
          </div>
        );
      })}
    </div>
  );
});

/* ---- Main Grid ---- */
export default function VirtualGrid({
  data,
  sortKey,
  sortDir,
  onSort,
  onCellSave,
  selectedRows,
  onRowClick,
  pinnedColumns,
  onTogglePin,
}) {
  const scrollContainerRef = useRef(null);

  const {
    handleScroll,
    totalHeight,
    offsetY,
    visibleData,
    startIndex,
    renderedCount,
    firstVisibleRow,
    ROW_HEIGHT,
  } = useVirtualScroll(data, scrollContainerRef);

  const getSortIcon = (key) => {
    if (sortKey !== key) return '⇅';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="virtual-grid">
      {/* Header */}
      <div className="grid-header glass">
        {COLUMNS.map((col) => {
          const isPinned = pinnedColumns.has(col.key);
          return (
            <div
              key={col.key}
              data-test-id={`header-${col.key}`}
              className={`grid-header__cell ${isPinned ? 'pinned-column' : ''} ${
                sortKey === col.key ? 'grid-header__cell--sorted' : ''
              }`}
              style={{ width: col.width, minWidth: col.width }}
              onClick={() => onSort(col.key)}
            >
              <span className="grid-header__label">{col.label}</span>
              <span className="grid-header__sort-icon">{getSortIcon(col.key)}</span>
              {(col.key === 'id' || col.key === 'date') && (
                <button
                  data-test-id={`pin-column-${col.key}`}
                  className={`grid-header__pin-btn ${isPinned ? 'grid-header__pin-btn--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(col.key);
                  }}
                  title={isPinned ? 'Unpin column' : 'Pin column'}
                >
                  📌
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll Container */}
      <div
        data-test-id="grid-scroll-container"
        className="grid-scroll-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {/* Sizer — gives full scrollbar height */}
        <div className="grid-sizer" style={{ height: totalHeight }} />

        {/* Row Window — positioned absolutely */}
        <div
          data-test-id="grid-row-window"
          className="grid-row-window"
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {visibleData.map((row, i) => {
            const globalIndex = startIndex + i;
            return (
              <GridRow
                key={row.id}
                row={row}
                rowIndex={i}
                globalIndex={globalIndex}
                isSelected={selectedRows.has(globalIndex)}
                onClick={(e) => onRowClick(globalIndex, e)}
                onCellSave={onCellSave}
                pinnedColumns={pinnedColumns}
                columns={COLUMNS}
              />
            );
          })}
        </div>
      </div>

      {/* Expose metrics for parent */}
      <DebugData
        renderedCount={renderedCount}
        firstVisibleRow={firstVisibleRow}
        totalRows={data.length}
      />
    </div>
  );
}

/* Invisible component for passing metrics up */
function DebugData({ renderedCount, firstVisibleRow, totalRows }) {
  // Store in a global ref for the parent to read
  VirtualGrid.__debugData = { renderedCount, firstVisibleRow, totalRows };
  return null;
}
