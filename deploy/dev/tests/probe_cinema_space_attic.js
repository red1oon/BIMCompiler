#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — P-CINEMA-SPACE-ATTIC scope (READ THE LOG after every run)
 * SCOPE: CINEMA_PATH_EDITOR.md §CINEMA_SPACE attic-pick. Alt+C's dive "goes for the attic" — the
 * camera settles in a top-level/roof void instead of a real occupiable space.
 *
 * THIS IS A REPRO-FINDER, NOT A FIX AND NOT A GATE. It exists because the brief says: capture the
 * §CINEMA_SPACE ranking on a building that ACTUALLY shows the attic dive, and do not theorise from
 * JKR (JKR's own live log chose a 27.7 m² room, so JKR is not the reproducing case). Before any fix
 * is written, the reproducing building has to be identified from data.
 *
 * It replicates `viewer/effects.js` §CINEMA_SPACE's ranking EXACTLY as shipped —
 *     score = area / (1 + dCtr / max(1, envelope*0.5))
 * over every room-graph node with rects — and then reports, per candidate, the facts that decide
 * whether it is an ATTIC rather than a room. It deliberately does NOT re-rank: the ranking is the
 * user's 2026-07-20 ruling and is not up for renegotiation here.
 *
 * ⚠ WHAT IT CANNOT DO, stated so nothing is over-claimed: the shipped enclosure gate is a BVH
 * ray-fan in the live scene, which has no headless equivalent — so this probe cannot reproduce
 * `enclosed=%`. It measures the DB/graph-side occupiability facts instead, which is precisely the
 * angle the brief points at (headroom, real floor beneath, reachability):
 *   - `topStorey`  — is the candidate on the building's highest storey?
 *   - `sizeZ`      — the compiled room's own height; an attic/roof void is short or absent
 *   - `slabAbove`  — count of IfcSlab/IfcRoof elements whose footprint covers the room centre and
 *                    sits ABOVE it. Zero = nothing overhead = not an interior space.
 *   - `edges`      — room-graph degree. An attic reachable by no door is not occupiable.
 *   - `contained`  — how many elements the room actually contains (a real room has furniture/fixtures)
 *
 * RUN: node deploy/dev/tests/probe_cinema_space_attic.js
 * Reads LOCAL DBs only (`~/bim-ootb/buildings/`) — never OCI.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DEV = path.resolve(__dirname, '..');
const LOCAL_SRC = process.env.LOCAL_DB_SRC || '/home/red1/bim-ootb/buildings';
const BUILDINGS = (process.env.BLDS || 'Terminal,Hospital,Clinic,LTU_AHouse,JKR,HHS_Office_Federated').split(',');
const TOP_N = 6;   // same as CINEMA_SPACE_TRY_MAX

(async () => {
  const initSqlJs = require('/home/red1/bim-compiler/node_modules/sql.js');
  const RG = require(path.join(DEV, 'room_graph.js'));
  const SQL = await initSqlJs();
  console.log('══ P-CINEMA-SPACE-ATTIC — which building actually reproduces the attic dive? ══');
  console.log('   ranking replicated verbatim from effects.js: score = area / (1 + dCtr / max(1, envelope*0.5))\n');

  const verdicts = [];
  for (const b of BUILDINGS) {
    const dbFile = path.join(LOCAL_SRC, b + '_extracted.db');
    if (!fs.existsSync(dbFile)) { console.log('⚠ absent: ' + dbFile); continue; }
    const db = new SQL.Database(fs.readFileSync(dbFile));
    const q = (s, p) => { try { const st = db.prepare(s); if (p) st.bind(p); const out = []; while (st.step()) out.push(st.get()); st.free(); return out; } catch (e) { return []; } };
    const g = RG.buildGraph(s => { try { const r = db.exec(s); return r.length ? r[0].values : []; } catch (e) { return []; } }, { log: () => {} });

    // ARC bbox + envelope, same inputs effects.js uses.
    const ext = q("SELECT MIN(center_x),MAX(center_x),MIN(center_y),MAX(center_y),MIN(center_z),MAX(center_z) FROM element_transforms WHERE center_x IS NOT NULL")[0];
    if (!ext) { console.log('⚠ ' + b + ': no element_transforms'); db.close(); continue; }
    const [xMin, xMax, yMin, yMax, zMin, zMax] = ext;
    const envelope = Math.max(xMax - xMin, yMax - yMin, zMax - zMin);
    const ctrIx = (xMin + xMax) / 2, ctrIy = (yMin + yMax) / 2;

    const cands = [];
    for (const k in g.nodesByGuid) {
      const rn = g.nodesByGuid[k];
      if (!rn || rn.kind !== 'room' || !rn.rects || !rn.rects.length) continue;
      let ar = 0;
      for (const rc of rn.rects) ar += Math.abs(rc.x1 - rc.x0) * Math.abs(rc.y1 - rc.y0);
      if (!(ar > 0)) continue;
      const dCtr = Math.hypot(rn.cx - ctrIx, rn.cy - ctrIy);
      cands.push({ guid: rn.guid, name: rn.name || rn.guid, storey: rn.storey, area: ar, dCtr,
        cx: rn.cx, cy: rn.cy, cz: rn.cz, score: ar / (1 + dCtr / Math.max(1, envelope * 0.5)) });
    }
    cands.sort((a, c) => c.score - a.score);

    // Highest storey by measured mean z of its own room nodes.
    const stZ = {};
    for (const k in g.nodesByGuid) { const n = g.nodesByGuid[k]; if (n && n.storey != null && n.cz != null) { (stZ[n.storey] = stZ[n.storey] || []).push(n.cz); } }
    const stMean = {}; for (const s in stZ) stMean[s] = stZ[s].reduce((a, x) => a + x, 0) / stZ[s].length;
    const topStorey = Object.keys(stMean).sort((a, c) => stMean[c] - stMean[a])[0];

    const deg = {};
    for (const e of g.edges) { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; }

    console.log('── ' + b + '   storeys=' + Object.keys(stMean).length + '  topStorey="' + topStorey +
      '"  envelope=' + envelope.toFixed(1) + 'm  candidates=' + cands.length);
    for (let i = 0; i < Math.min(cands.length, TOP_N); i++) {
      const c = cands[i];
      const ss = q("SELECT size_z FROM spatial_structure WHERE guid=?", [c.guid])[0];
      const sizeZ = ss ? ss[0] : null;
      const cont = q("SELECT COUNT(*) FROM rel_contained_in_space WHERE space_guid=?", [c.guid])[0];
      const contained = cont ? cont[0] : 0;
      // Anything slab/roof-like whose footprint covers the room centre and sits above it.
      const above = q("SELECT COUNT(*) FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid" +
        " WHERE (m.ifc_class LIKE 'IfcSlab%' OR m.ifc_class LIKE 'IfcRoof%')" +
        " AND t.center_z > ? AND t.center_x IS NOT NULL" +
        " AND ? BETWEEN t.center_x - COALESCE(t.bbox_x,0)/2 AND t.center_x + COALESCE(t.bbox_x,0)/2" +
        " AND ? BETWEEN t.center_y - COALESCE(t.bbox_y,0)/2 AND t.center_y + COALESCE(t.bbox_y,0)/2",
        [c.cz + 0.5, c.cx, c.cy])[0];
      const slabAbove = above ? above[0] : 0;
      const isTop = String(c.storey) === String(topStorey);
      console.log('   #' + (i + 1) + ' area=' + c.area.toFixed(1).padStart(7) + 'm2  dCtr=' + c.dCtr.toFixed(1).padStart(6) +
        '  storey="' + c.storey + '"' + (isTop ? ' ⬆TOP' : '') +
        '  sizeZ=' + (sizeZ == null ? '?' : sizeZ.toFixed(2)) +
        '  slabAbove=' + slabAbove + (slabAbove === 0 ? ' ⚠NO-ROOF' : '') +
        '  edges=' + (deg[c.guid] || 0) + ((deg[c.guid] || 0) === 0 ? ' ⚠ISOLATED' : '') +
        '  contained=' + contained +
        '  ' + c.name);
    }
    const t = cands[0];
    if (t) {
      const above0 = q("SELECT COUNT(*) FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid" +
        " WHERE (m.ifc_class LIKE 'IfcSlab%' OR m.ifc_class LIKE 'IfcRoof%') AND t.center_z > ? AND t.center_x IS NOT NULL" +
        " AND ? BETWEEN t.center_x - COALESCE(t.bbox_x,0)/2 AND t.center_x + COALESCE(t.bbox_x,0)/2" +
        " AND ? BETWEEN t.center_y - COALESCE(t.bbox_y,0)/2 AND t.center_y + COALESCE(t.bbox_y,0)/2",
        [t.cz + 0.5, t.cx, t.cy])[0];
      const onTop = String(t.storey) === String(topStorey), noRoof = (above0 ? above0[0] : 0) === 0;
      const isolated = (deg[t.guid] || 0) === 0;
      const suspect = onTop || noRoof || isolated;
      verdicts.push({ b, suspect, why: [onTop ? 'rank1 on TOP storey' : null, noRoof ? 'nothing overhead' : null, isolated ? 'unreachable (0 edges)' : null].filter(Boolean).join(' + ') || 'rank1 looks occupiable' });
      console.log('   → RANK-1 VERDICT: ' + (suspect ? '⚠ ATTIC-SUSPECT — ' : 'ok — ') + verdicts[verdicts.length - 1].why);
    }
    console.log('');
    db.close();
  }

  console.log('══ REPRO SHORTLIST ══');
  for (const v of verdicts) console.log('   ' + (v.suspect ? '⚠ ' : '  ') + v.b.padEnd(22) + v.why);
  const hits = verdicts.filter(v => v.suspect).map(v => v.b);
  console.log('\n   Reproducing candidate(s): ' + (hits.length ? hits.join(', ') : 'NONE from DB-side signals — the attic'
    + ' pick must then depend on the live BVH enclosure result, which this probe cannot see; capture §CINEMA_SPACE in the browser next.'));
})().catch(e => { console.log('ERR ' + (e && e.stack || e)); process.exit(1); });
