import { useState, useCallback, useRef } from 'react';
import './FilterBar.css';

const QUICK_STATUSES = ['Completed', 'Pending', 'Failed'];

export default function FilterBar({
  totalRows,
  filteredCount,
  onFilterMerchant,
  onQuickFilter,
  activeQuickFilter,
}) {
  const [merchantValue, setMerchantValue] = useState('');
  const debounceRef = useRef(null);

  const handleMerchantChange = useCallback(
    (e) => {
      const value = e.target.value;
      setMerchantValue(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterMerchant(value);
      }, 250);
    },
    [onFilterMerchant]
  );

  const handleQuickFilterClick = useCallback(
    (status) => {
      onQuickFilter(activeQuickFilter === status ? null : status);
    },
    [onQuickFilter, activeQuickFilter]
  );

  return (
    <div className="filter-bar glass">
      <div className="filter-bar__section">
        <div className="filter-bar__input-group">
          <svg className="filter-bar__search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            data-test-id="filter-merchant"
            type="text"
            placeholder="Filter by merchant..."
            value={merchantValue}
            onChange={handleMerchantChange}
            className="filter-bar__input"
          />
        </div>
      </div>

      <div className="filter-bar__section">
        <span className="filter-bar__label">Status:</span>
        <div className="filter-bar__quick-filters">
          {QUICK_STATUSES.map((status) => (
            <button
              key={status}
              data-test-id={`quick-filter-${status}`}
              className={`filter-bar__quick-btn filter-bar__quick-btn--${status.toLowerCase()} ${
                activeQuickFilter === status ? 'filter-bar__quick-btn--active' : ''
              }`}
              onClick={() => handleQuickFilterClick(status)}
            >
              <span className={`filter-bar__status-dot filter-bar__status-dot--${status.toLowerCase()}`} />
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar__section filter-bar__section--count">
        <span data-test-id="filter-count" className="filter-bar__count">
          Showing {filteredCount.toLocaleString()} of {totalRows.toLocaleString()} rows
        </span>
      </div>
    </div>
  );
}
