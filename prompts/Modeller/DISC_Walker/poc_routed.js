// POC GATE (calculation-only — engine behaviour UNCHANGED, only a read-only export added).
// Question: for each room the straight-chord gate REJECTED, does a WALKABLE ROUTE to a spine exist?
// Reports straight distance vs routed length so the detour-ratio question is decided by data.
const fs = require('fs');
const WT = process.argv[2], DB = process.argv[3], LABEL = process.argv[4] || 'fixture';
const initSqlJs = require(WT + '/viewer/lib/sql-wasm.js');
const RG = require(WT + '/common/room_graph.js');

function polyLen(a, pts, b) {
  let L = 0, px = a.cx, py = a.cy;
  for (const p of pts) { L += Math.hypot(p.x - px, p.y - py); px = p.x; py = p.y; }
  return L + Math.hypot(b.cx - px, b.cy - py);
}

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(WT + '/viewer/lib/sql-wasm.wasm') });
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(DB)));
  const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
  const g = RG.buildGraph(q, { log: () => {} });
  const ctx = { rasters: g.rasters, roomRectsByStorey: g.roomRectsByStorey, corridorRectsByStorey: g.corridorRectsByStorey };

  const deg = {};
  for (const e of g.edges) { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; }
  const spines = Object.keys(g.nodesByGuid).map(k => g.nodesByGuid[k]).filter(n => n.kind === 'spine');
  const spineByStorey = {};
  for (const s of spines) (spineByStorey[s.storey] = spineByStorey[s.storey] || []).push(s);

  const rectD = (rc, px, py) => Math.hypot(Math.max(rc.x0 - px, 0, px - rc.x1), Math.max(rc.y0 - py, 0, py - rc.y1));
  const deg0 = g.nodes.filter(n => n.kind === 'room' && !deg[n.guid]);
  console.log(`§POC-ROUTED ${LABEL} deg0_after_straight_gate=${deg0.length} spineStoreys=${Object.keys(spineByStorey).length}`);

  const out = [];
  const t0 = Date.now();
  for (const r of deg0) {
    const pts = spineByStorey[r.storey] || [];
    const ranked = pts.map(p => {
      let d = Infinity;
      if (r.rects && r.rects.length) for (const rc of r.rects) d = Math.min(d, rectD(rc, p.cx, p.cy));
      else d = Math.hypot(p.cx - r.cx, p.cy - r.cy);
      return { p, d };
    }).sort((a, b) => a.d - b.d);
    let hit = null;
    // try nearest-first, but bound the work: only candidates within 3x the nearest gap + 5m
    const cap = ranked.length ? ranked[0].d * 3 + 5 : 0;
    for (const c of ranked) {
      if (c.d > cap) break;
      const a = { storey: r.storey, cx: r.cx, cy: r.cy };
      const b = { storey: r.storey, cx: c.p.cx, cy: c.p.cy };
      let res;
      try { res = RG.astarHop(ctx, a, b); } catch (e) { res = null; }
      if (res === null) continue;
      const straight = Math.hypot(b.cx - a.cx, b.cy - a.cy);
      const routed = res.length ? polyLen(a, res, b) : straight;
      hit = { spine: c.p.guid, gap: c.d, straight, routed, turns: res.length, kind: res.length ? 'ROUTED' : 'STRAIGHT' };
      break;
    }
    out.push({ name: r.name, storey: r.storey, cands: ranked.length, nearest: ranked.length ? ranked[0].d : Infinity, hit });
  }
  const ms = Date.now() - t0;

  console.log('room'.padEnd(30) + 'result'.padEnd(10) + 'gap'.padStart(7) + 'straight'.padStart(10) +
    'routed'.padStart(9) + 'ratio'.padStart(7) + 'turns'.padStart(7));
  for (const o of out) {
    if (!o.hit) { console.log(o.name.slice(0, 29).padEnd(30) + 'NO-ROUTE'.padEnd(10) + o.nearest.toFixed(2).padStart(7)); continue; }
    const h = o.hit;
    console.log(o.name.slice(0, 29).padEnd(30) + h.kind.padEnd(10) + h.gap.toFixed(2).padStart(7) +
      h.straight.toFixed(2).padStart(10) + h.routed.toFixed(2).padStart(9) +
      (h.routed / Math.max(0.01, h.straight)).toFixed(2).padStart(7) + String(h.turns).padStart(7));
  }
  const found = out.filter(o => o.hit);
  const routedOnly = found.filter(o => o.hit.kind === 'ROUTED');
  console.log(`\n§POC-ROUTED ${LABEL} would_bridge=${found.length}/${out.length}` +
    ` (routed=${routedOnly.length} straight=${found.length - routedOnly.length}) still_deg0=${out.length - found.length} elapsed=${ms}ms`);
  if (routedOnly.length) {
    const ratios = routedOnly.map(o => o.hit.routed / Math.max(0.01, o.hit.straight)).sort((a, b) => a - b);
    const lens = routedOnly.map(o => o.hit.routed).sort((a, b) => a - b);
    console.log(`§POC-ROUTED ${LABEL} detour_ratio min=${ratios[0].toFixed(2)} max=${ratios[ratios.length - 1].toFixed(2)}` +
      ` | routed_len min=${lens[0].toFixed(2)}m max=${lens[lens.length - 1].toFixed(2)}m`);
  }
  const r14 = out.find(o => /R14/.test(o.name) && /Level 1/.test(o.storey));
  if (r14) console.log(`§POC-ROUTED ${LABEL} R14 ` + (r14.hit ? JSON.stringify(r14.hit) : 'NO-ROUTE'));
})().catch(e => console.log('ERR ' + e.stack));
