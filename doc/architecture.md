# Architecture

How the financial data grid works under the hood.

## System Overview

```mermaid
graph TB
    subgraph Browser["Browser"]
        A[index.html] --> B[main.jsx]
        B --> C[App.jsx]
        C --> D[FilterBar]
        C --> E[VirtualGrid]
        C --> F[DebugPanel]
        E --> G[useVirtualScroll Hook]
        G --> H[Scroll Handler<br/>requestAnimationFrame]
        G --> I[Visible Window<br/>Calculation]
        I --> J[DOM Rows<br/>~20 elements]
    end

    subgraph Data["Data Layer"]
        K[transactions.json<br/>1M records] -->|fetch| C
        C -->|filter + sort| L[processedData<br/>useMemo]
        L --> E
    end

    style Browser fill:#1e293b,stroke:#3b82f6,color:#f1f5f9
    style Data fill:#1e293b,stroke:#10b981,color:#f1f5f9
```

## Virtual Scrolling Flow

The core virtualization runs in three steps every time the user scrolls:

```mermaid
sequenceDiagram
    participant User
    participant ScrollContainer
    participant RAF as requestAnimationFrame
    participant Hook as useVirtualScroll
    participant DOM

    User->>ScrollContainer: scrolls
    ScrollContainer->>RAF: schedule update
    RAF->>Hook: read scrollTop
    Hook->>Hook: startIndex = floor(scrollTop / rowHeight) - buffer
    Hook->>Hook: endIndex = startIndex + visibleCount + buffer
    Hook->>Hook: offsetY = startIndex * rowHeight
    Hook->>DOM: render data[startIndex..endIndex]
    Hook->>DOM: translateY(offsetY) on window div
    Note over DOM: Only ~20 rows in DOM<br/>regardless of dataset size
```

## Component Tree

```mermaid
graph TD
    App --> Header
    App --> FilterBar
    App --> VirtualGrid
    App --> DebugPanel

    FilterBar --> MerchantInput["Merchant Input<br/>(debounced)"]
    FilterBar --> QuickFilters["Status Buttons<br/>Completed/Pending/Failed"]
    FilterBar --> RowCount["Filter Count"]

    VirtualGrid --> GridHeader["Column Headers<br/>(sortable + pinnable)"]
    VirtualGrid --> ScrollContainer["Scroll Container"]
    ScrollContainer --> Sizer["Sizer Div<br/>height = rows × 40px"]
    ScrollContainer --> RowWindow["Row Window<br/>translateY positioned"]
    RowWindow --> Row1["GridRow (memo)"]
    RowWindow --> Row2["GridRow (memo)"]
    RowWindow --> RowN["..."]

    Row1 --> Cell1["EditableCell"]
    Row1 --> Cell2["EditableCell"]

    style App fill:#3b82f6,stroke:#3b82f6,color:#fff
    style VirtualGrid fill:#8b5cf6,stroke:#8b5cf6,color:#fff
    style ScrollContainer fill:#06b6d4,stroke:#06b6d4,color:#fff
```

## DOM Structure

```
grid-scroll-container          ← overflow-y: scroll
  ├── grid-sizer               ← height: totalRows × 40px (creates scrollbar)
  └── grid-row-window           ← position: absolute, translateY(offsetY)
       ├── virtual-row-0        ← only visible rows rendered
       ├── virtual-row-1
       ├── ...
       └── virtual-row-N        ← N ≈ 20 (viewport + buffer)
```

## State Management

```mermaid
graph LR
    A[allData<br/>1M rows] --> B{Filters Active?}
    B -->|merchant filter| C[filter by name]
    B -->|status filter| D[filter by status]
    C --> E[Sort?]
    D --> E
    B -->|no filter| E
    E -->|yes| F[Array.sort]
    E -->|no| G[processedData]
    F --> G
    G --> H[useVirtualScroll]
    H --> I[visibleData<br/>~20 rows]
    I --> J[Render]

    style A fill:#f59e0b,stroke:#f59e0b,color:#000
    style G fill:#10b981,stroke:#10b981,color:#000
    style I fill:#3b82f6,stroke:#3b82f6,color:#fff
```

## Key Design Decisions

| Decision | Why |
|----------|-----|
| Fixed row height (40px) | Enables O(1) scroll position calculation |
| `translateY()` over `top` | GPU-accelerated, avoids layout thrashing |
| `requestAnimationFrame` throttling | Aligns updates with browser paint cycle |
| `React.memo` on rows | Prevents re-render of unchanged rows |
| `useMemo` for filtered data | Avoids re-filtering on unrelated state changes |
| Streaming JSON fetch | Shows progress while loading 200MB+ file |
