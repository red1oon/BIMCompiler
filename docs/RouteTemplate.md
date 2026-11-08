# Find & Navigate — Indoor Wayfinding Guide
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


Type "Find fire pump" in BIM OOTB. Walk to it from the front door.

**Live demo:** [BIM OOTB](https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-full/o/index.html)
 — load any building, type `Find door` in the search bar, click Navigate.

## How to Use

1. **Type `Find <anything>`** in the search bar (or say it into the mic)
2. Amber panel shows matching elements — filter by type, storey, name
3. **Tap a result** to highlight it (camera stays put)
4. **Tap Navigate** — camera snaps to main entrance, first-person view
5. **Tap Walk arrow** (or press arrow-up) — advance one waypoint at a time
6. **HUD shows:** direction arrow, distance remaining, step N of M
7. **Arrival:** target element highlighted, info panel opens
8. **Close search bar** to exit navigation and return to orbit view

Voice input (mic button) adds spoken turn-by-turn cues on top of the visual HUD.

## Route Template

When a building finishes streaming, the viewer auto-builds a walking path
template for every storey. This is what powers the turn-by-turn directions.

### What Gets Built

```
Your IFC data (walls, doors, columns)
  │
  ▼
Occupancy Grid ─── 2m cells, walls = blocked, doors = walkable
  │
  ▼
Route Template ─── graph of ~15-80 nodes per storey
  │                 (doors, corridor junctions, dead ends)
  │                 connected by BFS-discovered edges
  ▼
A* Pathfinding ─── shortest path on the graph, not the grid
  │
  ▼
Waypoints ───────── ~4m steps, labelled by nearest room name
```

### Template Structure (JSON-like)

```javascript
{
  storey: "Level 1",
  nodes: [
    { id: "door_0",     type: "door",     x: 3.0, y: -0.2, label: "Main Entrance" },
    { id: "junction_5", type: "junction", x: 5.4, y: -5.0, label: "Corridor" },
    { id: "door_3",     type: "door",     x: 6.3, y: -9.7, label: "Office 201" },
    { id: "endpoint_8", type: "endpoint", x: 9.1, y: -2.3, label: "End" }
  ],
  edges: [
    { from: 0, to: 1, cost: 6.2 },   // metres
    { from: 1, to: 2, cost: 5.8 },
    { from: 1, to: 3, cost: 4.9 }
  ]
}
```

**Node types:**
- `door` — every IfcDoor position on the storey
- `junction` — walkable cell with 3+ open neighbours (corridor intersection)
- `endpoint` — walkable cell with 1 open neighbour (dead end)

**Labels** come from the nearest `IfcSpace` or `IfcRoom` within 10m.
If none exist in the IFC, labels default to the node type ("Door", "Junction").

### Where to Find It Locally

The template lives in browser memory (no file on disk). To inspect or edit:

1. Open browser DevTools → Console
2. After streaming completes, run:

```javascript
// View all cached templates
APP._nav.gridCache           // occupancy grids per storey
APP.getRouteTemplate("Level 1")  // route template for a storey

// Inspect nodes and edges
var t = APP.getRouteTemplate("Level 1");
console.table(t.nodes);      // id, type, x, y, label
console.table(t.edges);      // from, to, cost

// Force rebuild (e.g. after editing DB)
APP.preProcessRouteTemplates();
```

### How to Customise

The template is a plain graph. Edit it in the console or write a script:

```javascript
var t = APP.getRouteTemplate("Level 1");

// Add a custom waypoint (e.g. reception desk)
t.nodes.push({ id: "custom_1", type: "junction",
  x: 7.5, y: -3.0, label: "Reception" });

// Connect it to nearest existing node
t.edges.push({ from: t.nodes.length - 1, to: 1, cost: 4.0 });

// Lower cost = preferred path (makes A* favour this route)
t.edges[0].cost = 1.0;  // make this corridor preferred
```

Changes persist until page reload. To make permanent changes, add
`IfcSpace` / `IfcRoom` elements to your IFC — they auto-label nodes.

### Tuning

| Parameter | Default | Where | Effect |
|-----------|---------|-------|--------|
| `CELL_SIZE` | 2m | navigate_grid.js | Grid resolution. Smaller = finer but slower |
| `MAX_BFS` | 80 cells | navigate_grid.js | Max search radius for edge discovery |
| `STEP` | 4m | navigate_grid.js / navigate_path.js | Walk-step distance per tap |
| `EYE_HEIGHT` | 1.6m | navigate_engine.js | Camera height during walk |

## Console Debug Logs

Open DevTools → Console. Filter by `§NAV` or `§GRID` or `§ROUTE`:

| Tag | What it shows |
|-----|--------------|
| `§NAV_PREPROCESS` | All storeys processed, total nodes/edges |
| `§GRID_BUILD` | Grid size, occupied/walkable cells, door count |
| `§ROUTE_TEMPLATE` | Nodes, edges, types per storey |
| `§NAV_DIAG` | Pre-flight: target, camera, offsets, DB state |
| `§NAV_ENTRANCE` | Which door was picked as start, distance from centre |
| `§NAV_WAYPOINTS_DUMP` | Full path: `[Start → Door → Door → Destination]` |
| `§NAV_MOVE_CAM` | Camera position at each waypoint step |

## Code Structure (for developers)

Navigation is `setupNavigate(APP)` in `navigate.js`, a small orchestrator over five sub-modules
(`navigate_find.js`, `navigate_grid.js`, `navigate_path.js`, `navigate_engine.js`, `navigate_controls.js`),
each exposing its functions on `APP`. The Find panel UI itself now lives in `nf_panel_search.js`.
The sections below keep their original lettering:

```
navigate_find.js / nf_panel_search.js
├── SECTION A: FIND PANEL UI
│   CSS injection, DOM creation, search/filter/select logic
│   Key functions:
│     openFindPanel(term)       — reset state, populate dropdowns, run search
│     closeFindPanel()          — hide panel, stop nav, restore orbit
│     runSearch()               — SQL query → nav.results[], render list
│     selectResult(idx)         — highlight element, set active card
│     populateDropdowns()       — type/storey selects from DB
│     findMainEntrance()        — pick exterior door (furthest from centre)
│
navigate_grid.js
├── SECTION B: OCCUPANCY GRID + A*
│   Grid-based pathfinding (no meshes needed, DB only)
│   Key functions:
│     buildGrid(storey)         — 2m cells from wall/column positions
│     astar(grid, start, end)   — 8-connected A* on Uint8Array
│     toCell(grid, x, y)        — IFC coords → grid cell
│     fromCell(grid, c, r)      — grid cell → IFC coords
│
navigate_grid.js + navigate_path.js
├── SECTION C: ROUTE TEMPLATE + PATH
│   Graph skeleton + multi-storey path builder
│   Key functions:
│     buildRouteTemplate(storey) — extract door/junction/endpoint graph
│     graphAStar(template, s, e) — A* on ~15 nodes (not 5K cells)
│     graphPathToWaypoints()     — graph path → 4m-step walk waypoints
│     buildPath(start, target, storey)    — multi-storey orchestrator
│     buildSingleStoreyPath(s, e, storey) — template → grid → line fallback
│     labelNodes(nodes, storey)  — tag nodes with IfcSpace/IfcRoom names
│
navigate_engine.js
├── SECTION D: TURN-BY-TURN ENGINE
│   Camera control, HUD, direction cues, voice
│   Key functions:
│     startNavigation(target)   — pick entrance, build path, snap camera
│     advanceNavStep()          — next waypoint, off-path repath if >8m
│     stopNavigation()          — full exit: walk mode off, orbit restored
│     moveCameraToWaypoint(idx) — ifc2three transform, lerp or snap
│     onArrival()               — highlight, info panel, fade HUD
│     getDirectionCue()         — bearing delta → left/right/straight/stairs
│     speak(text)               — SpeechSynthesis if voice mode
│
navigate_controls.js
└── PRE-PROCESS HOOK + keyboard
      MutationObserver on #s-active → preProcessRouteTemplates()
```

### Integration with other modules

```
nlp.js ──"Find X"──→ APP.openFindPanel(term) ──→ navigate.js
                      (proxy in main.js lazy-loads the navigate modules on first call)

walk.js ──────────→ APP.cacheStoreyLevels()    used by buildPath for floor Z
                     APP.findNearestDoorPosition() used by walk mode (not nav)
                     APP.walkOrientTick()        render loop, no-op if no anchor

scene.js ─────────→ APP.ifc2three(x,y,z)       IFC → Three.js coord transform
                     APP.modelOffset             origin shift

main.js ──────────→ APP.loadNavigate()          lazy-load the navigate modules
                     _navProxy                   openFindPanel before load
                     animate() loop              calls walkOrientTick each frame
```

### State object

All navigation state lives in `nav` (closure variable, exposed as `APP._nav`):

```javascript
nav.results     // search results [{guid, ifc_class, element_name, storey, cx, cy, cz}]
nav.activeIdx   // selected result index (-1 = none)
nav.waypoints   // [{x, y, z, storey, label?, transition?}]
nav.stepIdx     // current waypoint during walk
nav.active      // true while navigating
nav.voiceMode   // true if input was via mic
nav.gridCache   // { "Level 1": {grid, cols, rows, minX, minY, doorCells} }
```

Route templates cached separately in `routeTemplateCache["Level 1"]`.

### Modifying the pathfinding

To change how paths are computed, edit Section B or C. The fallback chain is:

```
buildSingleStoreyPath()
  1. Try route template graph A*     ← edit buildRouteTemplate / graphAStar
  2. Try grid A*                     ← edit buildGrid / astar
  3. Fall back to straight line      ← interpolateLine (always works)
```

Each layer logs its result with a `§` tag, so you can see in the console
which layer produced the path and why earlier layers failed.

### Modifying the UI

The find panel is built with `document.createElement` in Section A (no framework).
CSS is injected at the top of `setupNavigate()`. To restyle: edit the injected CSS in
the Find panel module. Panel DOM IDs: `#find-panel`, `#find-name`, `#find-type`,
`#find-storey`, `#find-results`, `#find-navigate-btn`, `#find-count`.

HUD elements: `#nav-hud`, `#nav-direction-cue`, `#nav-bottom-bar`.

## Source Files

| File | What |
|------|------|
| `viewer/navigate.js` + `navigate_find.js`, `navigate_grid.js`, `navigate_path.js`, `navigate_engine.js`, `navigate_controls.js` | Orchestrator, grid + A*, route templates, path builder, turn-by-turn engine, keyboard |
| `viewer/nf_panel_search.js` | Find panel UI |
| `viewer/walk.js` | Walk mode, door finder, storey levels |
| `viewer/nlp.js` | "Find X" intercept, voice flag |

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
