# Financial Data Grid

A high-performance data grid that renders **1 million financial transactions** using virtual scrolling built from scratch. No virtualization libraries used — pure React with custom windowing logic.

## What It Does

- Loads and displays 1,000,000 transaction rows in the browser
- Only renders ~20 DOM elements at any time (virtual scrolling)
- Sorting, filtering, cell editing, multi-select, column pinning
- Real-time debug panel tracking FPS, DOM count, and scroll position
- Glassmorphism dark UI with smooth animations

## Quick Start

```bash
# Install and generate data
npm install
npm run generate-data

# Run locally
npm run dev
```

Or with Docker:

```bash
docker-compose up
# Open http://localhost:8080
```

## How Virtualization Works

Instead of rendering all 1M rows, we calculate which rows are visible based on scroll position and only mount those + a small buffer. A "sizer" div creates the full scrollbar height, while a "window" div uses `translateY()` to position visible rows. Scroll events are throttled via `requestAnimationFrame`.

See [doc/architecture.md](doc/architecture.md) for the full breakdown.

## Project Structure

```
├── scripts/generate-data.js    # Generates 1M records
├── src/
│   ├── App.jsx                 # Main app with state management
│   ├── components/
│   │   ├── VirtualGrid.jsx     # Core virtualized grid
│   │   ├── DebugPanel.jsx      # Real-time metrics overlay
│   │   └── FilterBar.jsx       # Search + quick filters
│   └── hooks/
│       └── useVirtualScroll.js  # Custom windowing hook
├── doc/                        # Architecture and setup docs
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # One-command deploy
└── nginx.conf                  # Production server config
```

## Tech Stack

React 19 · Vite 8 · Vanilla CSS · Nginx · Docker

## Data Schema

Each transaction has: `id`, `date`, `merchant`, `category`, `amount`, `status`, `description`.

Status values: `Completed`, `Pending`, `Failed`.
