// ITEM 3 TRIAGE — are the deg-0 / "far" rooms real rooms or walker artifacts?
// Evidence per room: compiler's own predefined_type verdict, area, rect count, aspect,
// nearest same-storey ARC door, nearest same-storey circulation node, contained-element count.
const fs = require('fs');
const WT = process.argv[2], DB = process.argv[3];
const initSqlJs = require(WT + '/viewer/lib/sql-wasm.js');
const RG = require(WT + '/common/room_graph.js');
(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(WT + '/viewer/lib/sql-wasm.wasm') });
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(DB)));
  const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
  const rejects = [];
  const g = RG.buildGraph(q, { log: m => { if (/ROOM_SPINE_BRIDGE/.test(m)) rejects.push(m); } });

  const deg = {};
  for (const e of g.edges) { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; }

  // compiler verdict per LOGICAL room guid
  const verdict = {}, elemCount = {};
  for (const r of q("SELECT COALESCE(room_guid,guid), predefined_type, object_type FROM spatial_structure WHERE type='IfcSpace'"))
    verdict[r[0]] = r[1] + '/' + r[2];
  for (const r of q("SELECT space_guid, count(*) FROM rel_contained_in_space GROUP BY 1"))
    elemCount[r[0]] = r[1];

  // doors (same query the engine uses)
  const doors = q("SELECT m.guid, m.storey, t.center_x, t.center_y, t.bbox_x, t.bbox_y" +
    " FROM elements_meta m JOIN element_transforms t ON t.guid = m.guid" +
    " WHERE m.ifc_class LIKE 'IfcDoor%' AND m.discipline='ARC' AND t.center_x IS NOT NULL");

  const rectDist = (rc, px, py) => Math.hypot(Math.max(rc.x0 - px, 0, px - rc.x1), Math.max(rc.y0 - py, 0, py - rc.y1));
  const nonRoom = Object.keys(g.nodesByGuid).map(k => g.nodesByGuid[k]).filter(n => n.kind !== 'room');

  const rooms = g.nodes.filter(n => n.kind === 'room');
  const deg0 = rooms.filter(r => !deg[r.guid]);
  const rows = [];
  for (const r of deg0) {
    let area = 0, minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    for (const rc of r.rects) {
      area += (rc.x1 - rc.x0) * (rc.y1 - rc.y0);
      minx = Math.min(minx, rc.x0); maxx = Math.max(maxx, rc.x1);
      miny = Math.min(miny, rc.y0); maxy = Math.max(maxy, rc.y1);
    }
    const w = maxx - minx, h = maxy - miny;
    let dDoor = Infinity;
    for (const d of doors) {
      if (d[1] !== r.storey) continue;
      for (const rc of r.rects) dDoor = Math.min(dDoor, rectDist(rc, d[2], d[3]));
    }
    let dCirc = Infinity, circKind = '-';
    for (const n of nonRoom) {
      if (n.storey !== r.storey) continue;
      for (const rc of r.rects) { const dd = rectDist(rc, n.cx, n.cy); if (dd < dCirc) { dCirc = dd; circKind = n.kind; } }
    }
    rows.push({ guid: r.guid, name: r.name, storey: r.storey, area, w, h,
      nrect: r.rects.length, aspect: Math.max(w, h) / Math.max(0.01, Math.min(w, h)),
      verdict: verdict[r.guid] || (r.guid.indexOf('CORRIDOR_ROOM::') === 0 ? 'BACKPROP/synthetic' : '?'),
      elems: elemCount[r.guid] || 0, dDoor, dCirc, circKind });
  }
  rows.sort((a, b) => b.area - a.area);
  console.log('§TRIAGE deg0=' + rows.length + ' of rooms=' + rooms.length);
  console.log('name'.padEnd(30) + 'verdict'.padEnd(26) + 'area'.padStart(8) + 'w x h'.padStart(16) +
    'nr'.padStart(4) + 'elem'.padStart(6) + 'dDoor'.padStart(8) + 'dCirc'.padStart(8) + '  kind');
  for (const r of rows)
    console.log(r.name.slice(0, 29).padEnd(30) + r.verdict.padEnd(26) +
      r.area.toFixed(1).padStart(8) + (r.w.toFixed(1) + ' x ' + r.h.toFixed(1)).padStart(16) +
      String(r.nrect).padStart(4) + String(r.elems).padStart(6) +
      (isFinite(r.dDoor) ? r.dDoor.toFixed(2) : 'none').padStart(8) +
      (isFinite(r.dCirc) ? r.dCirc.toFixed(2) : 'none').padStart(8) + '  ' + r.circKind);

  // buckets
  const b = { real: [], artifact: [], unclear: [] };
  for (const r of rows) {
    if (r.elems > 0 && r.area >= 4) b.real.push(r);
    else if (r.elems === 0) b.artifact.push(r);
    else b.unclear.push(r);
  }
  console.log('\n§TRIAGE_BUCKET has_contained_elements=' + b.real.length +
    ' zero_elements=' + b.artifact.length + ' tiny_with_elements=' + b.unclear.length);
  const byV = {};
  for (const r of rows) byV[r.verdict] = (byV[r.verdict] || 0) + 1;
  console.log('§TRIAGE_VERDICT ' + JSON.stringify(byV));
  const far = rows.filter(r => r.dDoor > 2);
  console.log('§TRIAGE_FAR n=' + far.length + ' meanArea=' + (far.reduce((s, r) => s + r.area, 0) / Math.max(1, far.length)).toFixed(1) +
    ' meanElems=' + (far.reduce((s, r) => s + r.elems, 0) / Math.max(1, far.length)).toFixed(1) +
    ' zeroElem=' + far.filter(r => r.elems === 0).length);
  console.log('\n' + rejects.slice(0, 3).join('\n'));
})().catch(e => console.log('ERR ' + e.stack));
