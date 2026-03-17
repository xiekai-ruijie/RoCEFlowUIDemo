# AI Agent Guide: AIGC3.0 RoCE Flow Prototype

This guide outlines the architectural decisions, development workflows, and coding conventions for the `AIGC3.0_RoCE流路径交互原型` project.

## 1. Architecture Overview

This project is a **standalone static prototype** (HTML/CSS/Vanilla JS) designed to demonstrate RoCE flow path analysis and fault diagnosis interactions.

- **No Build System**: There is no Webpack, Vite, or npm package manager. The code runs directly in the browser.
- **Single Page Application (SPA) feel**: Although it uses multi-page navigation (`index.html`, `fault-diagnosis.html`), the state is transient and reset on navigation unless passed via URL (not currently implemented).
- **Data Source**: All data is mocked and loaded globally via `assets/scripts/data.js`.

## 2. Key Directories & Files

- `index.html`: Main entry point for Flow Analysis.
- `fault-diagnosis.html`: Entry point for the Fault Diagnosis dashboard.
- `assets/scripts/`:
    - `data.js`: **CRITICAL**. Defines `window.ROCE_MOCK_DATA`. Must be loaded before other scripts.
    - `app.js`: Main logic for `index.html` (Filtering, Tables, Topology, Charts).
    - `diagnosis.js`: Logic for `fault-diagnosis.html` (Diagnosis Task flows).
    - `nav.js`: Handles global navigation interactions.
- `assets/styles/main.css`: Single CSS file containing all styles.

## 3. Critical Patterns & Conventions

### 3.1 Data Management (Global Mock)
Data is not fetched from an API. It is defined in `data.js` and attached to the `window` object.
**Pattern:**
```javascript
// assets/scripts/data.js
window.ROCE_MOCK_DATA = { ... };

// assets/scripts/app.js
const data = window.ROCE_MOCK_DATA;
```
**Guideline:** When adding new features that require data, extend `window.ROCE_MOCK_DATA` in `data.js` rather than creating local variables.

### 3.2 DOM Manipulation (Vanilla)
Do not use React/Vue/jQuery patterns. Use direct DOM manipulation.
**Pattern:**
1.  Define a `refs` object at the top of the scope to cache DOM elements.
2.  Define a `state` object for mutable data.
3.  Update DOM based on state changes.

```javascript
// Example from app.js
const refs = {
    searchBtn: document.getElementById('searchBtn'),
    flowTableBody: document.getElementById('flowTableBody')
};
const state = { filteredFlows: [] };

// Event Listener
refs.searchBtn.addEventListener('click', () => { ... });
```

### 3.3 Localization / Text Management
Text content is centralized in a `TEXT` constant (in `app.js`) to support easier updates to terminology.
**Pattern:**
```javascript
const TEXT = { pageTitle: '...', ... };
function t(key) { return TEXT[key] || key; }
// Usage
element.textContent = t('pageTitle');
```

## 4. Development Workflow

1.  **Edit**: Modify `html`, `css`, or `js` files directly.
2.  **Preview**: Open `index.html` in a web browser.
3.  **Deploy**: Push to `main`. GitHub Actions automatically deploys to GitHub Pages via `.github/workflows/pages.yml`.

## 5. Specific Implementation Details

-   **Topology Visualization**: Implemented using bespoke logic in `app.js` (rendering nodes/links inside `refs.topologyContainer`), likely using HTML/SVG elements directly rather than a canvas library.
-   **Charts**: Implemented using simple DOM elements or SVG within `app.js` (Look for `createChart` or similar logic). *Verify implementation details if modifying charts.*
-   **Filtering**: Filtering logic resides in `app.js` inside functions like `filterFlows()`. It performs client-side filtering on `window.ROCE_MOCK_DATA`.

## 6. Common Tasks

-   **Adding a new column to the flow list**:
    1.  Update `ROCE_MOCK_DATA.flows` objects in `data.js`.
    2.  Update HTML table header in `index.html`.
    3.  Update row rendering logic in `app.js` (`renderFlows` function).
-   **Modifying Diagnosis Logic**:
    1.  Edit `diagnosis.js`.
    2.  Check `createGraph` function for topology visualization updates in the diagnosis view.

