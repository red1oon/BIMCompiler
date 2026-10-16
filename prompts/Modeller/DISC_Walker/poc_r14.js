// Decisive probe for the watchdog's question: is ⚠ Level 1 R14 (the 315.7 m² atrium) genuinely
// sealed in the compiled geometry, or was the straight-chord gate merely too strict?
// UNCAPPED: every same-storey non-room node (spine/circ/doorwp/stairwp), nearest-first, A* each.
const fs = require('fs');
const WT = process.argv[2], DB = process.argv[3];
const initSqlJs = require(WT + '/viewer/lib/sql-wasm.js');
const RG = require(WT + '/common/room_graph.js');
(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(WT + '/viewer/lib/sql-wasm.wasm') });
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(DB)));
  const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
  const g = RG.buildGraph(q, { log: () => {} });
  const ctx = { rasters: g.rasters, roomRectsByStorey: g.roomRectsByStorey, corridorRectsByStorey: g.corridorRectsByStorey };
  const r14 = g.nodes.find(n => /R14/.test(n.name) && /Level 1/.test(n.storey));
  console.log(`§R14 name="${r14.name}" storey=${r14.storey} centre=(${r14.cx.toFixed(2)},${r14.cy.toFixed(2)}) rects=${r14.rects.length}`);
  r14.rects.forEach((rc, i) => console.log(`  rect${i} x[${rc.x0.toFixed(2)},${rc.x1.toFixed(2)}] y[${rc.y0.toFixed(2)},${rc.y1.toFixed(2)}]`));

  // is the room centre itself on walkable floor?
  const ras = g.rasters && g.rasters[r14.storey];
  console.log(`§R14 storey_has_raster=${!!ras}`);
  // sample the room's own interior: what fraction of its own rect is walkable?
  let inside = 0, tot = 0;
  const rc0 = r14.rects.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) }));
  for (let x = rc0.x0 + 0.25; x < rc0.x1; x += 0.5) for (let y = rc0.y0 + 0.25; y < rc0.y1; y += 0.5) {
    tot++; if (RG.chordIllegalCount(ctx, r14.storey, x, y, x, y) === 0) inside++;
  }
  console.log(`§R14 own_footprint_walkable=${inside}/${tot} (${(100 * inside / tot).toFixed(1)}%)`);

  const cands = Object.keys(g.nodesByGuid).map(k => g.nodesByGuid[k])
    .filter(n => n.kind !== 'room' && n.storey === r14.storey);
  const rectD = (rc, px, py) => Math.hypot(Math.max(rc.x0 - px, 0, px - rc.x1), Math.max(rc.y0 - py, 0, py - rc.y1));
  const ranked = cands.map(n => {
    let d = Infinity; for (const rc of r14.rects) d = Math.min(d, rectD(rc, n.cx, n.cy));
    return { n, d };
  }).sort((a, b) => a.d - b.d);
  console.log(`§R14 same_storey_non_room_nodes=${ranked.length} (uncapped A* against every one)`);
  const byKind = {};
  let firstHit = null;
  for (const c of ranked) {
    let res; try { res = RG.astarHop(ctx, { storey: r14.storey, cx: r14.cx, cy: r14.cy }, { storey: r14.storey, cx: c.n.cx, cy: c.n.cy }); } catch (e) { res = null; }
    const ok = res !== null;
    byKind[c.n.kind] = byKind[c.n.kind] || { n: 0, ok: 0 };
    byKind[c.n.kind].n++; if (ok) byKind[c.n.kind].ok++;
    if (ok && !firstHit) firstHit = { guid: c.n.guid, kind: c.n.kind, gap: c.d, turns: res.length };
  }
  console.log('§R14 reachable_by_kind ' + JSON.stringify(byKind));
  console.log('§R14 first_reachable ' + (firstHit ? JSON.stringify(firstHit) : 'NONE — no on-floor route to ANY circulation node on its storey'));

  // Also: can R14 reach ANY other room's centre on its storey?
  const others = g.nodes.filter(n => n.kind === 'room' && n.storey === r14.storey && n.guid !== r14.guid);
  let okRooms = 0, sample = null;
  for (const o of others) {
    let res; try { res = RG.astarHop(ctx, { storey: r14.storey, cx: r14.cx, cy: r14.cy }, { storey: r14.storey, cx: o.cx, cy: o.cy }); } catch (e) { res = null; }
    if (res !== null) { okRooms++; if (!sample) sample = o.name; }
  }
  console.log(`§R14 reachable_same_storey_rooms=${okRooms}/${others.length}` + (sample ? ' e.g. "' + sample + '"' : ''));
})().catch(e => console.log('ERR ' + e.stack));
