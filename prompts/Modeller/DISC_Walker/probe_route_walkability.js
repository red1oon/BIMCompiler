// VIEWER_FIND_PANEL_ROOM_ACCURACY.md §17 — per-ANCHOR walkability + per-LEG A* verdict for one
// Room→Path route. Answers "is the drawn line on real floor, and if not, which leg and why".
// RUN: node probe_route_walkability.js <db>::<label>[::<patch.sql>]   (from a bim-ootb worktree)
// WHY the route's legs fail: is each ANCHOR itself on walkable floor? What does A* return per leg?
// Calculation-only. Uses only exported helpers (chordIllegalCount, astarHop).
const fs = require('fs');
const WT = __dirname;
const initSqlJs = require(WT + '/viewer/lib/sql-wasm.js');
const RG = require(WT + '/common/room_graph.js');
const SR = require(WT + '/common/storey_raster.js');

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(WT + '/viewer/lib/sql-wasm.wasm') });
  for (const spec of process.argv.slice(2)) {
    const [f, label, patch] = spec.split('::');
    const db = new SQL.Database(new Uint8Array(fs.readFileSync(f)));
    if (patch) { db.run(fs.readFileSync(patch, 'utf8')); console.log(`§PATCH ${label} applied ${patch}`); }
    const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
    const g = RG.buildGraph(q, { log: () => {} });
    const ctx = g; // pass the graph itself — it carries every walkable-evidence field
    const walkable = (st, x, y) => RG.chordIllegalCount(ctx, st, x, y, x, y) === 0;
    // raster fill per storey
    Object.keys(g.rasters || {}).forEach(st => {
      const r = g.rasters[st]; let set = 0;
      for (let c = 0; c < r.cols; c++) for (let rr = 0; rr < r.rows; rr++) if (r.contains(r.x0 + (c + 0.5) * r.res, r.y0 + (rr + 0.5) * r.res)) set++;
      console.log(`§RASTERFILL ${label} ${st} cols=${r.cols} rows=${r.rows} res=${r.res} setCells=${set} fill=${(100 * set / (r.cols * r.rows)).toFixed(1)}%`);
    });
    const rooms = g.nodes.filter(n => n.kind === 'room');
    const find = (st, rn) => rooms.find(r => String(r.storey) === st && new RegExp('(^|\\s)' + rn + '$').test(String(r.name)));
    const A = find('Level 1', 'R35'), B = find('Level 4', 'R8');
    const res = RG.shortestPath(g, A.guid, B.guid);
    console.log(`§ANCHORS ${label} — walkability of every anchor the drawn line passes through`);
    res.path.forEach((gu, i) => {
      const n = g.nodesByGuid[gu] || {};
      const w = n.storey != null ? walkable(n.storey, n.cx, n.cy) : null;
      console.log(`   [${String(i).padStart(2)}] ${String(n.kind).padEnd(8)} ${String(n.storey).padEnd(9)} walkable=${w} xy=(${(n.cx || 0).toFixed(1)},${(n.cy || 0).toFixed(1)}) ${n.name}`);
    });
    console.log(`§ASTAR_PER_LEG ${label}`);
    for (let i = 0; i + 1 < res.path.length; i++) {
      const a = g.nodesByGuid[res.path[i]], b = g.nodesByGuid[res.path[i + 1]];
      if (!a || !b || a.storey == null || a.storey !== b.storey) continue;
      const bad = RG.chordIllegalCount(ctx, a.storey, a.cx, a.cy, b.cx, b.cy);
      let hop; try { hop = RG.astarHop(g, a, b); } catch (e) { hop = 'ERR ' + e.message; }
      const verdict = hop === null ? 'NULL(no on-floor route)' : (Array.isArray(hop) ? (hop.length ? 'ROUTED pts=' + hop.length : 'STRAIGHT-OK') : hop);
      console.log(`   leg ${i}->${i + 1} ${a.storey} len=${Math.hypot(b.cx - a.cx, b.cy - a.cy).toFixed(1)}m chordIllegal=${bad} astar=${verdict}` +
        `  aWalk=${walkable(a.storey, a.cx, a.cy)} bWalk=${walkable(b.storey, b.cx, b.cy)}`);
    }
    const poly = res.polyline || [];
    let pbad = 0;
    for (let i = 0; i + 1 < poly.length; i++) {
      if (Math.abs((poly[i].z || 0) - (poly[i + 1].z || 0)) > 0.5) continue; // cross-storey
      const st = (g.nodesByGuid[res.path[0]] || {}).storey;
      pbad += 0; // storey per point unknown; measured below via node storeys instead
    }
    console.log(`§POLY ${label} pts=${poly.length} (per-point storey not tracked in result; leg table above is the measure)`);
    db.close();
  }
})().catch(e => console.log('ERR ' + e.stack));
