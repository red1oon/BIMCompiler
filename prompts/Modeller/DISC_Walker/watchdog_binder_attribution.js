// §PROBE-BINDER — for every stranded (deg 0) room, WHICH predicate in room_graph.js's E1 door
// loop (lines 462-478) rejected each nearby door? Replicates the predicate exactly:
//   query  : ifc_class LIKE 'IfcDoor%' AND discipline='ARC' AND center_x IS NOT NULL
//   filter : isRoomDoor(name)                       -> else nonRoomDoor
//   filter : g.storey === door.storey               -> strict string equality
//   metric : rectDist(rect, dx, dy) <= max(bx,by)/2 + 0.20
//   edge   : ONLY IF cands.length >= 2  (a door touching ONE room makes no E1 edge)
const fs = require('fs'), path = require('path');
const OOTB = '/home/red1/bim-ootb';
const initSqlJs = require(path.join(OOTB, 'node_modules/sql.js/dist/sql-wasm.js'));
const RG = require(path.join(OOTB, 'common/room_graph.js'));
const SLACK = 0.20;
const NON_ROOM = ['liftdeur', 'lift', 'elevator', 'aufzug', 'fahrstuhl', 'hoist'];
const isRoomDoor = n => { n = String(n || '').toLowerCase(); return !NON_ROOM.some(k => n.indexOf(k) >= 0); };
const rectDist = (rc, px, py) => Math.hypot(Math.max(rc.x0 - px, 0, px - rc.x1), Math.max(rc.y0 - py, 0, py - rc.y1));

(async () => {
  const SQL = await initSqlJs({ locateFile: f => path.join(OOTB, 'node_modules/sql.js/dist/', f) });
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(process.argv[2])));
  const q = s => { const r = db.exec(s); return r.length ? r[0].values : []; };
  const g = RG.buildGraph(q, {});
  const rooms = g.nodes.filter(n => n.kind === 'room');
  const deg = {}; (g.edges || []).forEach(e => { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; });
  const area = n => (n.rects || []).reduce((s, r) => s + Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0), 0);

  const allDoors = q("SELECT m.guid, m.element_name, m.storey, t.center_x, t.center_y, t.bbox_x, t.bbox_y, m.discipline " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class LIKE 'IfcDoor%' AND t.center_x IS NOT NULL");
  const arc = allDoors.filter(d => d[7] === 'ARC');
  console.log('§BINDER ' + path.basename(process.argv[2]));
  console.log('  doors total=' + allDoors.length + '  discipline=ARC=' + arc.length +
    '  non-ARC=' + (allDoors.length - arc.length) +
    '  disciplines=' + JSON.stringify([...new Set(allDoors.map(d => d[7]))]));
  console.log('  room storeys=' + JSON.stringify([...new Set(rooms.map(r => r.storey))]));
  console.log('  door storeys=' + JSON.stringify([...new Set(allDoors.map(d => d[2]))]));

  // Which rooms does each ARC door land on? (the real cands loop)
  const candsFor = (d, slackOverride) => {
    const [, name, storey, dx, dy, bx, by] = d;
    const buf = Math.max(bx || 0, by || 0) / 2 + (slackOverride == null ? SLACK : slackOverride);
    return rooms.filter(r => r.storey === storey)
      .map(r => ({ r, dist: Math.min(...r.rects.map(rc => rectDist(rc, dx, dy))) }))
      .filter(x => x.dist <= buf);
  };

  const iso = rooms.filter(n => !deg[n.guid]).sort((a, b) => area(b) - area(a));
  const reason = { 'no ARC door in range': 0, 'door found but cands<2 (touches only this room)': 0, 'lift/non-room door only': 0 };
  console.log('\n  stranded rooms = ' + iso.length + '. Per-room verdict under the REAL predicate:');
  iso.forEach(n => {
    let inRange = 0, lone = 0, nonRoom = 0;
    arc.forEach(d => {
      if (d[2] !== n.storey) return;
      const buf = Math.max(d[5] || 0, d[6] || 0) / 2 + SLACK;
      const dist = Math.min(...n.rects.map(rc => rectDist(rc, d[3], d[4])));
      if (dist > buf) return;
      inRange++;
      if (!isRoomDoor(d[1])) { nonRoom++; return; }
      if (candsFor(d).length < 2) lone++;
    });
    let verdict;
    if (inRange === 0) verdict = 'no ARC door in range';
    else if (lone > 0) verdict = 'door found but cands<2 (touches only this room)';
    else verdict = 'lift/non-room door only';
    reason[verdict]++;
    if (area(n) > 40) console.log('    ' + area(n).toFixed(1).padStart(7) + 'm² ' + String(n.storey).padEnd(9) +
      ' inRange=' + inRange + ' loneDoor=' + lone + ' nonRoom=' + nonRoom + '  ' + verdict + '  ' + n.name);
  });
  console.log('\n  VERDICT TALLY: ' + JSON.stringify(reason, null, 0));

  // What would a wider slack buy R14 specifically, under the REAL cands>=2 rule?
  const r14 = rooms.find(r => /R14/.test(r.name) && area(r) > 300);
  if (r14) {
    console.log('\n  R14 (' + area(r14).toFixed(1) + 'm², storey=' + r14.storey + ') under wider slack, REAL cands>=2 rule:');
    [0.20, 0.50, 1.00, 2.00, 3.00].forEach(s => {
      let would = 0;
      arc.forEach(d => {
        if (d[2] !== r14.storey || !isRoomDoor(d[1])) return;
        const buf = Math.max(d[5] || 0, d[6] || 0) / 2 + s;
        if (Math.min(...r14.rects.map(rc => rectDist(rc, d[3], d[4]))) > buf) return;
        if (candsFor(d, s).length >= 2) would++;
      });
      console.log('    slack ' + s.toFixed(2) + 'm -> R14 would gain ' + would + ' E1 edge(s)');
    });
  }
  db.close();
})().catch(e => { console.error('ERR ' + e.message + '\n' + e.stack); process.exit(1); });
