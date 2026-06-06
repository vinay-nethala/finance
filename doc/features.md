# Features

All data-test-id attributes and interactive features implemented in the grid.

## Grid Core

| Feature | data-test-id | Description |
|---------|-------------|-------------|
| Scroll container | `grid-scroll-container` | Main scrollable viewport |
| Row window | `grid-row-window` | Container for visible rows |
| Virtual rows | `virtual-row-{index}` | Each rendered row |

## Debug Panel

| Metric | data-test-id | Description |
|--------|-------------|-------------|
| Panel | `debug-panel` | Floating overlay |
| FPS | `debug-fps` | Real-time frame rate |
| DOM rows | `debug-rendered-rows` | Number of rendered elements |
| Position | `debug-scroll-position` | Current scroll position |

## Sorting

Click any column header to sort ascending. Click again for descending.

| Column | data-test-id |
|--------|-------------|
| ID | `header-id` |
| Date | `header-date` |
| Merchant | `header-merchant` |
| Category | `header-category` |
| Amount | `header-amount` |
| Status | `header-status` |
| Description | `header-description` |

## Filtering

| Element | data-test-id | Behavior |
|---------|-------------|----------|
| Merchant input | `filter-merchant` | Debounced text search |
| Result count | `filter-count` | Shows "Showing X of 1,000,000 rows" |
| Completed btn | `quick-filter-Completed` | Filter by status |
| Pending btn | `quick-filter-Pending` | Filter by status |
| Failed btn | `quick-filter-Failed` | Filter by status |

## Row Selection

- **Single click** — selects one row, adds `data-selected="true"`
- **Ctrl+click** — multi-select, adds selection without removing others

## Cell Editing

- **Double-click** any cell to edit
- Press **Enter** or click away to save
- Cell format: `cell-{rowIndex}-{columnKey}`

## Column Pinning

| Column | data-test-id |
|--------|-------------|
| Pin ID | `pin-column-id` |
| Pin Date | `pin-column-date` |

Clicking a pin button adds the `pinned-column` CSS class for sticky positioning.
