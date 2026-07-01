# ⚠ DO NOT REMOVE — Scope guard
# Scope: ERP OOTB — AD-driven UI renderer for erp.html
#        Renders iDempiere Application Dictionary as card-first mobile UI
#        from SQLite WASM. No server. No iDempiere runtime.
# Read the log after every run. Exit code is not evidence.
# Spec-first: implement only what is described in a § section below.

---

# ERP OOTB — AD UI Renderer

## Previous session delivered (S255)

**4,428 lines of code + 20MB AD seed data. 323/323 tests.**

| File | Lines | What |
|---|---|---|
| `deploy/dev/ad_seed.sql` | 64,797 | 59,323 rows of real iDempiere AD: 587 menus, 370 windows, 1130 tabs, 20911 fields + GardenWorld data |
| `deploy/dev/ad_parser.js` | 342 | getMenuTree, getWindow, getTabs, getFields, resolveReference, evaluateDisplayLogic. 48/48 tests. |
| `deploy/dev/doc_engine.js` | 306 | 5-table engine + StateMachine + JournalEngine + journalReverse. 79/79 tests. |
| `deploy/dev/erp_panel.js` | 477 | Card render, role filtering, action dispatch, sub-card drill. |
| `deploy/dev/erp.html` | 216 | Standalone shell, no Three.js, sql.js WASM, dark theme. |
| `deploy/dev/role_band.js` | 157 | 6-role header bar, pointerup, CustomEvent. |
| `deploy/dev/swipe.js` | 255 | Card stack, pointer gestures, drill-in/back. |
| `deploy/dev/tests/test_erp_ui.js` | 861 | 155 tests: roles, cards, filtering, lifecycle, reversal, XSS. |
| `deploy/dev/tests/test_stress.js` | 619 | 41 tests: 100K docs, 500K lines, 1M ops, §-log driven. |
| `deploy/dev/tests/test_ad_parser.js` | 430 | 48 tests: menu tree, 3 windows, fields, master-detail, GardenWorld. |
| `docs/ERP.md` | 557 | Full spec: AD→SQLite mapping, parser, renderer, charts. |
| `scripts/export_ad.sh` | 208 | PostgreSQL→SQLite AD export from docker. |
| `prompts/SpatialERP_POC.md` | updated | §16 Gap Tracker: 9 closed, 9 open. |

**Key proven facts (from §-logs):**
- C_Project window (130): 8 tabs, 44 fields in header, Phase at TabLevel=1
- C_BPartner window (123): 9 tabs, master-detail with 5 partners having contacts
- M_Product window (140): 17 tabs including BOM + Price
- DocStatus ref (131): 12 options (Drafted, In Progress, Completed...)
- DisplayLogic: `@Col@='val'` + AND/OR evaluator works
- Stress: 1.6M rows in 179MB, all queries < 1s, 32 lifecycles/sec
- Journal reversal: counter-entries, net=0, REVERSED is terminal

## This session: render the AD as a mobile-first card UI

### §1. File structure

| File | Lines | What |
|---|---|---|
| `deploy/dev/ad_ui.js` | ~300 | AD renderer: menu, window, tabs, fields, inline edit |
| `deploy/dev/ad_data.js` | ~150 | Generic CRUD: read/save/delete any AD_Table record |
| `deploy/dev/ad_charts.js` | ~100 | Cross-table SQL → Canvas chart (bar, pie) |
| `deploy/dev/erp.html` | rewrite | Loads ad_seed.sql, renders AD menu, opens windows |
| `SYSNOVA/index.html` | modify | "ERP OOTB" button on landing page |
| `tests/test_ad_ui.js` | ~200 | AD renderer tests, §-log driven |

### §2. Bottom navigation bar (persistent, 5 icons)

Fixed at viewport bottom. Always visible. 48px min-height. Dark theme.

```
┌─────────────────────────────────┐
│  [🏠] [📋] [➕] [📊] [⚙️]     │
│  Home  List  New  Charts  More  │
└─────────────────────────────────┘
```

| Icon | Label | Action |
|---|---|---|
| 🏠 | Home | Show AD_Menu tree as card list |
| 📋 | List | Show current window's records as scrollable cards |
| ➕ | New | Create new record in current window (FAB style) |
| 📊 | Charts | SQL analytics overlay for current table |
| ⚙️ | More | Settings, share link, "Open in BIM", about |

### §3. Menu screen (Home)

Renders AD_Menu tree from `ADParser.getMenuTree(db)`.

- Summary nodes (IsSummary=Y) render as collapsible folder cards
- Leaf nodes (Action=W) render as tappable items with window name
- Search box at top: filters menu nodes by name
- Tap leaf → opens window (§4)
- Recent windows shown at top (from localStorage)

```
┌─────────────────────────────────┐
│ ☰  ERP OOTB            [🔍]    │
├─────────────────────────────────┤
│ Recent: Project · Product       │
├─────────────────────────────────┤
│ ▼ Partner Relations             │
│   ● Business Partner            │
│   ○ Contact                     │
│ ▼ Materials Management          │
│   ● Product                     │
│   ○ Price List                  │
│ ▼ Project Management            │
│   ● Project ←tap to open        │
│ ▼ Financial                     │
│ ▼ Manufacturing                 │
│ ...                             │
├─────────────────────────────────┤
│  [🏠] [📋] [➕] [📊] [⚙️]     │
└─────────────────────────────────┘
```

### §4. Window screen (List + Card)

When user opens a window (e.g. C_Project):

1. `ADParser.getWindow(db, windowId)` → get window + tabs + fields
2. Tab rail renders at top (horizontal scroll, active underline)
3. Header tab (TabLevel=0) loads records from AD_Table
4. Each record renders as a card (swipe left/right = next/prev)
5. Fields rendered from AD_Field metadata:
   - `referenceType='string'` → text input
   - `referenceType='list'` → dropdown (options from resolveReference)
   - `referenceType='date'` → date picker
   - `referenceType='yesno'` → toggle switch
   - `referenceType='amount'` → number input with formatting
   - `referenceType='tableDirect'` → FK dropdown (lazy-loaded from table)
   - `isKey=true` → hidden
   - `isDisplayed=false` → hidden
   - `displayLogic` → evaluated via evaluateDisplayLogic
   - `isMandatory=true` → red border when empty
   - `isReadOnly=true` → disabled

6. Tap field → inline edit (no separate edit mode)
7. Swipe left/right → next/prev record
8. Tap detail tab (TabLevel=1) → filters by parent FK, shows child cards

```
┌─────────────────────────────────┐
│ ☰  Project ▸ ABC Tower   [🔍]  │  Breadcrumb
├─────────────────────────────────┤
│ [Project] [Phase] [Task] [Line] │  Tab rail
│  ════════                       │
├─────────────────────────────────┤
│  Name    ░░░░ ABC Tower ░░░░░  │
│  Status  [● In Progress    ▼]  │
│  Partner [Seed Farm        ▼]  │
│  Start   [2026-05-13      📅]  │
│  Amount  [    250,000.00    ]  │
│  ─────────────────────────────  │
│  📊 Budget vs Actual            │
│  ▓▓▓▓▓▓▓░░░  68%               │
│                                 │
│  ← swipe → (next record)       │
│  ↓ swipe ↓ (detail tab)        │
├─────────────────────────────────┤
│  [🏠] [📋] [➕] [📊] [⚙️]     │
└─────────────────────────────────┘
```

### §5. Master-detail navigation

Tab rail shows all tabs. Tapping a level-1 tab:
- Auto-filters child records WHERE parent_FK = current header record ID
- Shows child records as card list (swipeable)
- Breadcrumb updates: "Project ▸ Phase ▸ Task"
- Swipe down on child → back to parent

Example: C_BPartner (18 records) → tap "Contact" tab →
shows AD_User WHERE C_BPartner_ID = selected partner.

### §6. Generic CRUD — `ad_data.js`

```javascript
ADData.readRecords(db, tableName, where, orderBy)
  // SELECT * FROM {tableName} WHERE {where} ORDER BY {orderBy}
  // Returns array of record objects

ADData.saveRecord(db, tableName, record, columns)
  // Uses AD_Column metadata for validation
  // INSERT or UPDATE based on isKey column
  // Logs via kernel_ops: commitOp(db, 'AD_SAVE', {table, id})

ADData.deleteRecord(db, tableName, keyColumn, keyValue)
  // DELETE + kernel_ops log

ADData.getNextId(db, tableName)
  // SELECT MAX(keyCol) + 1 — simple sequence
```

All writes go through kernel_ops.commitOp → undo/redo/audit for free.

### §7. Cross-table charts — `ad_charts.js`

Each window gets a [📊] button. Tapping it shows:
- Auto-generated aggregate query for current table
- Canvas bar chart rendered from results
- Tap "Custom SQL" → text input → run any SELECT → chart
- Pre-built queries per window:
  - C_Project: status distribution, budget vs actual
  - M_Product: products by category, price distribution
  - C_BPartner: customers vs vendors, by group

### §8. erp.html rewrite

Boot sequence:
1. Load sql.js WASM
2. Load ad_seed.sql (CREATE TABLES + INSERT data)
3. Load modules: kernel_ops, doc_engine, ad_parser, ad_data, ad_ui, ad_charts
4. `ADParser.init(db)` → log counts
5. Render bottom nav + Home screen (menu tree)
6. If `?window=130` → auto-open C_Project window
7. If `?db=Hospital.db` → load building DB, add AD tables on top

### §9. Landing page — "ERP OOTB" alongside "BIM OOTB"

SYSNOVA/index.html:
- Footer: "ERP OOTB" link (replaces "ERP — GOD MODE")
- Each building card: amber [ERP] button opens erp.html?db=building.db
- Standalone: erp.html with no ?db= loads GardenWorld demo

### §10. BroadcastChannel — viewer cross-tab

Channel: `bim_erp` (follows existing bim_4d pattern in main.js:154)
- ERP → Viewer: `ERP_FOCUS_STOREY`, `ERP_HIGHLIGHT`
- Viewer → ERP: `ERP_ELEMENT_PICKED`
- "Open in BIM" button in More menu

### §11. Visual theme

- Background: #1e1e1e (same as BIM OOTB)
- Card: #2a2a2a, border #444, radius 12px
- Accent: #4fc3f7 (blue) for navigation, #ff9800 (amber) for actions
- Font: system-ui, 14px body, 12px labels
- Touch targets: min 44px height
- All events: pointerup, not click

### §12. Mobile navigation patterns

| Gesture | Action |
|---|---|
| Swipe left/right on card | Next/prev record |
| Swipe down on record | Show detail tabs |
| Tap field | Edit inline (no edit mode toggle) |
| Long press record | Action sheet (Delete, Copy, Share) |
| Bottom nav tap | Switch context (Home/List/New/Charts) |
| Tap breadcrumb | Jump up hierarchy |
| Pull down on list | Refresh |

### §13. Test plan — `test_ad_ui.js`

§-log driven. Every check cross-references log values against DB queries.
**84/84 tests as of S256.**

- T1-T5: Menu tree, window/tabs, field types, master-detail, CRUD
- T6: Charts — SQL aggregate, prebuilt queries, error handling
- T7: DisplayLogic — =, !=, AND, empty
- T8: Module API — all public methods exist
- T9-T11: Inline edit persistence, URL params, countRecords
- T12: Client switcher — System (AD_Window 370, AD_Table 1003, AD_Reference 604) + GW (C_BPartner 18, M_Product 55)
- T13: Crash protection — missing tables → empty array + toast, no crash
- T14: Charts — pie chart, dashboard queries (products by category, customer vs vendor)
- T15: Help panel data — window/tab descriptions, field types
- T16: System AD self-browse — W102→AD_Tab→AD_Field drill, W100→AD_Column drill

## S256 delivered

**2,204 lines. 132/132 tests. ~5 hours spec→ship.**

| File | Lines | What |
|---|---|---|
| `deploy/dev/ad_ui.js` | 1,017 | Menu, window, tabs, fields, inline edit, client switcher, KPI cards, help panel, swipe |
| `deploy/dev/ad_data.js` | 162 | Generic CRUD: read/save/delete any AD_Table record |
| `deploy/dev/ad_charts.js` | 283 | Horizontal bar + pie charts, prebuilt queries, custom SQL overlay |
| `deploy/dev/ad_seed.db` | 7.7MB | Binary SQLite: 587 menus, 370 windows, 1130 tabs, 20911 fields, GardenWorld data |
| `deploy/dev/erp.html` | 168 | Modern dark glass theme, loads .db binary, auto-open ?window= |
| `deploy/dev/tests/test_ad_ui.js` | 644 | 84 tests covering all §13 items |
| `deploy/dev/landing.html` | +5 | ERP OOTB h1 header next to BIM OOTB |

## Next session: S257 — Polish + FK resolution + heatmap

### §14. FK resolution — show Name not integer

When field referenceType is `tableDirect` or `table`, resolve the FK integer
to the target table's identifier column (usually `Name`). Use AD_Column to
find the FK table, query it for the display value. Cache resolved names
per session to avoid repeated lookups.

### §15. Top app bar

Replace bare search box with a proper app bar:
- Left: hamburger → menu | Back arrow when in window
- Centre: client name or window name
- Right: [?] help | [QR] share | search icon (expands)

### §16. Context-aware heatmap panel

Instead of charts at bottom, a right-side heatmap panel (desktop) or
bottom sheet (mobile) that shows a treemap/heatmap of the current context:
- Home: tables by row count (bigger = more data, colour = table type)
- Window: field completeness (filled vs empty per record)
- Tap a heatmap cell → drill to that table/record

### §17. Master-detail parent constraint

When opening a detail tab (TabLevel > 0), auto-filter by parent FK.
Currently implemented but needs: proper FK column detection from AD_Column
metadata (not just tableName + '_ID' convention).

### §18. Swipe CRUD + keyboard navigation

- Swipe left on record card → delete (with confirm)
- Swipe right → duplicate
- Long press field → action sheet (copy, clear, lookup)
- Pull down on list → refresh from DB
- **Desktop:** Arrow left/right = prev/next record, up/down = prev/next tab
- **KPI cards:** double-click/tap → opens the window for that entity (Partners→W123, Products→W140, etc.)

### §19. QR / shareable link per page

Every screen generates a shareable URL:
- `?window=123` → opens Business Partner
- `?window=123&record=117` → opens specific partner
- `?client=gardenworld` → auto-switches client
- QR code canvas rendered in More menu, scannable

## S257 delivered

**3,249 lines across 11 files. 153/153 tests.**

| File | Lines | What |
|---|---|---|
| `deploy/dev/ad_graph.js` | 757 | Data Globe: Fibonacci sphere, perspective projection, drag-orbit, fly-to-front, status colouring |
| `deploy/dev/ad_ui.js` | 1,450 | App bar, CRUD toolbar, multi-panel, FK resolution, graph integration |
| `deploy/dev/ad_data.js` | 278 | +resolveFK, clearFKCache, getTableStats, getFieldCompleteness |
| `deploy/dev/ad_charts.js` | 450 | +drawTreemap (grid, DPR), +drawCompleteness |
| `deploy/dev/tests/test_ad_ui.js` | 870 | 153 tests: CRUD lifecycle, FK chain, navigation, DisplayLogic, graph |

---

## §20. Spatial UI — The ERP Governance Layer

### The problem with traditional ERP UI

ERP was born in the 1970s as character-mode terminals. SAP's GUI in the 1990s
was the same terminal with a skin. Web ERP (Odoo, iDempiere ZK) is the same
terminal in a browser. Four decades, same paradigm:

```
┌──────────────────────────────────────┐
│ Menu → Window → Tab → Grid → Form   │  ← linear, sequential
│ User sees: ONE record at a time      │  ← no context
│ To compare: open another tab/window  │  ← lost context
│ To assess: run a report              │  ← delayed insight
└──────────────────────────────────────┘
```

The user navigates a **tree** (menu → window → tab → record) but the data
is a **graph** (partners ↔ products ↔ prices ↔ orders ↔ invoices). The tree
UI hides the graph structure. Users compensate by opening 8 tabs, alt-tabbing,
and running reports. This is the entire ERP UX crisis.

### The Spatial UI answer

Replace the tree with the graph. Literally.

```
┌──────────────────────────────────────────────────┐
│           DATA GLOBE (ad_graph.js)                │
│                                                    │
│    Partners ●───────● Products                     │
│       │    ╲       ╱     │                         │
│       │     ╲     ╱      │                         │
│    Contacts  ●───●  Categories                     │
│              Prices                                │
│                                                    │
│  Position = importance (front = active)             │
│  Colour = status (cyan/green/amber/red/grey)        │
│  Size = data volume or activity                     │
│  Connections = FK relationships                     │
│  Drag = orbit   Zoom = focus   Tap = drill          │
└──────────────────────────────────────────────────┘
```

One glance replaces: a dashboard, a status report, a navigation menu,
and a search query. The spatial layout *is* the analysis.

### How Spatial UI governs the ERP stack

```
Layer 4: SPATIAL UI (ad_graph.js)
  │  Globe / mind map / constellation
  │  Renders ANY AD_Table as nodes on a sphere
  │  Colour from: DocStatus + Updated date + field completeness
  │  Drill: entity → records → card view → inline edit
  │
Layer 3: CARD UI (ad_ui.js)
  │  Master-detail panels, CRUD toolbar, arrow keys
  │  Renders AD_Field metadata as form fields
  │  FK resolution shows Name not integer
  │  Multi-panel: master top, detail tabs below side-by-side
  │
Layer 2: DATA ENGINE (ad_data.js + ad_parser.js)
  │  Generic CRUD for any AD_Table
  │  AD metadata parser: menu tree, windows, tabs, fields
  │  DisplayLogic evaluator, reference resolver
  │  kernel_ops integration for undo/redo/audit
  │
Layer 1: STORAGE (SQLite WASM + ad_seed.db)
  │  7.7MB iDempiere Application Dictionary
  │  587 menus, 370 windows, 1130 tabs, 20911 fields
  │  GardenWorld demo data: 18 partners, 55 products
  │  Runs in browser, no server, no network
  │
Layer 0: SPEC (AD metadata is the spec)
     AD_Window defines windows. AD_Tab defines tabs.
     AD_Field defines fields. AD_Column defines types.
     AD_Reference defines dropdowns. DisplayLogic defines visibility.
     The UI renders from metadata — zero hardcoded forms.
```

**Key insight:** Layer 4 (Spatial UI) doesn't know about Business Partners
or Products. It knows about AD_Tables with rows. Any new table added to the
AD automatically appears as a node on the globe. The metadata *is* the UI
definition. Add a table → it appears. Add fields → they render. Add status
logic → the globe colours change. No code change needed.

This is what makes it a governance layer: it shows the health of the entire
ERP dataset at a glance. The CFO sees which entities have activity (bright
front stars) and which are stale (grey dust behind). The data analyst sees
field completeness without running a report. The developer sees which AD
tables have data and which are empty schema.

### Mobile UX — why the globe works on phones

| Desktop metaphor | Mobile equivalent | Why it works |
|---|---|---|
| Mouse drag | Finger drag | Same gesture, more natural on touch |
| Scroll wheel zoom | Pinch zoom | Native phone gesture |
| Click to drill | Tap to drill | Identical |
| Hover for tooltip | Long press for info | Standard mobile pattern |
| Arrow keys | Swipe left/right on cards | Already implemented |
| ESC to go back | Swipe down / back gesture | OS-native |
| Multi-panel side-by-side | Stack vertically (flex-wrap) | Already responsive |

The globe is actually **better** on mobile because:
1. No hover state needed — everything is tap/drag
2. The orbit gesture (drag to spin) is the same muscle memory as Google Earth
3. The fly-to-front animation gives spatial feedback that flat lists lack
4. Status colouring replaces column sorting (which is awkward on mobile)

### Mobile navigation flow

```
HOME GLOBE          TAP ENTITY         TAP RECORD
┌─────────┐        ┌─────────┐        ┌─────────┐
│  ◉ Partners       │  ◉ Acme  │        │ Name    │
│     ╲              │  ◉ Farm  │        │ Status  │
│  ◉ Products       │  ● old   │        │ Partner │
│     ╱              │  ● arch  │        │ Amount  │
│  ◉ Prices          │          │        │ [< 3 >] │
│                    │          │        ├─────────┤
│ drag=orbit         │ drag=orbit        │ Contact │
│ tap=drill          │ tap=open │        │ Location│
│                    │ ESC=back │        │ (panels)│
└─────────┘        └─────────┘        └─────────┘
   swipe ↓             swipe ↓            swipe ↓
 (menu list)         (back)              (back)
```

### What this replaces in competing ERPs

| SAP / Odoo / iDempiere | Spatial ERP OOTB |
|---|---|
| Dashboard: 6 KPI widgets, each a separate SQL | Globe: all entities visible, sized by data volume |
| Navigation: 3-level menu → window → tab | Tap entity node → fly to records |
| Status overview: run a report, wait, read table | Star colour = status. Instant. |
| Cross-entity view: open 3 tabs, alt-tab | Globe shows all entities + connections simultaneously |
| Mobile: responsive grid, still flat | 3D globe, touch-native, spatial memory |
| Onboarding: 2-week training course | Tap the bright star. Edit. Done. |

### §20.1 Future: Three.js upgrade

When erp.html loads Three.js (it doesn't today — deliberately lightweight),
the globe can upgrade to true WebGL:
- Depth-of-field blur (bokeh) for back-hemisphere nodes
- Bloom post-processing for active star glow
- Particle trails connecting recently-edited records
- Sprite textures for product images / BP logos
- OrbitControls with inertia (already proven in BIM viewer)

### §20.2 Future: kernel_ops live pulse

```
kernel_ops.commitOp(db, 'AD_SAVE', { table: 'C_BPartner', id: 117 });
```

Every commit writes to the op log. The globe can subscribe:
- Record just saved → node brightens for 10 seconds
- Record saved by another user (via BroadcastChannel) → node pulses
- Undo → node flickers red briefly
- This turns the globe into a **live operations monitor**

### §20.3 Future: mind map mode

Toggle from globe to flat force-directed graph:
- Drag nodes freely, pin them in place
- Group by category (auto-cluster products, separate from partners)
- Draw custom edges (user connects "this partner supplies this product")
- Export as PNG / SVG for presentations
- Think: Miro board, but populated from live ERP data
