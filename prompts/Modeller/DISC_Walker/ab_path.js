// APPLES-TO-APPLES path A/B across #997. Same fixture, same fixed room pairs, only the engine moves.
// Pairs are chosen by a deterministic rule (below), NOT hand-picked per engine — a pair picked from
// the post-change graph and then looked up in the pre-change one would bias the comparison.
// Emits §PATH_LEGAL (illegal-chord counts) computed by each engine's OWN chordIllegalCount.
// Does NOT emit §FPS_MODE / §DLOD_TICK — those are viewer render-loop logs with no headless analogue.
const fs = require('fs');
const WT = process.argv[2], DB = process.argv[3], LABEL = process.argv[4];
const initSqlJs = require(WT + '/viewer/lib/sql-wasm.js');
const RG = require(WT + '/common/room_graph.js');

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(WT + '/viewer/lib/sql-wasm.wasm') });
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(DB)));
  const q = s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } };
  const g = RG.buildGraph(q, { log: () => {} });
  const ctx = { rasters: g.rasters, roomRectsByStorey: g.roomRectsByStorey, corridorRectsByStorey: g.corridorRectsByStorey };
  const byGuid = {}; g.nodes.forEach(n => { byGuid[n.guid] = n; });

  // Deterministic pair selection, engine-independent: sort ALL room guids lexically and take
  // fixed ordinals. Same guids resolve in both engines because the DB is identical.
  const guids = g.nodes.filter(n => n.kind === 'room').map(n => n.guid).sort();
  const pick = i => guids[Math.floor(i * (guids.length - 1))];
  const PAIRS = [
    ['CTRL-A', pick(0.10), pick(0.90)],
    ['CTRL-B', pick(0.25), pick(0.75)],
    ['CTRL-C', pick(0.40), pick(0.60)],
    ['CTRL-D', pick(0.05), pick(0.50)],
  ];

  console.log(`§AB ${LABEL} rooms=${guids.length} edges=${g.edges.length} E1=${g.stats.edges}`);
  for (const [name, a, b] of PAIRS) {
    let res = null;
    try { res = RG.shortestPath(g, a, b); } catch (e) { res = null; }
    const nm = x => ((byGuid[x] || g.nodesByGuid[x] || {}).name) || x;
    if (!res || !res.path || res.path.length < 2) {
      console.log(`§AB ${LABEL} ${name} from="${nm(a)}" to="${nm(b)}" NO-ROUTE`);
      continue;
    }
    // §PATH_LEGAL — walk the returned PATH (guids), and for consecutive nodes on the SAME storey
    // count illegal samples on the straight centre-to-centre chord, using THIS engine's own
    // predicate over THIS engine's own walkable evidence. Cross-storey hops are skipped: no raster
    // spans floors, so a stair leg has nothing to be legal or illegal against.
    let illegal = 0, legs = 0, worst = 0;
    for (let i = 0; i + 1 < res.path.length; i++) {
      const A = g.nodesByGuid[res.path[i]], B = g.nodesByGuid[res.path[i + 1]];
      if (!A || !B || A.storey !== B.storey) continue;
      legs++;
      const bad = RG.chordIllegalCount(ctx, A.storey, A.cx, A.cy, B.cx, B.cy);
      illegal += bad; if (bad > worst) worst = bad;
    }
    const kinds = res.path.map(x => (g.nodesByGuid[x] || {}).kind || '?').join('>');
    console.log(`§AB ${LABEL} ${name} from="${nm(a)}" to="${nm(b)}" ` +
      `dist=${(res.distance || 0).toFixed(2)} doors=${res.doors.length} hops=${res.path.length} ` +
      `polyPts=${(res.polyline || []).length} §PATH_LEGAL legs=${legs} illegal=${illegal} worstLeg=${worst} ` +
      `kinds=${kinds}`);
  }
})().catch(e => console.log('ERR ' + e.stack));
