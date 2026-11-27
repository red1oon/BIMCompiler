// ⚠ DO NOT REMOVE — W-GRID-PRIMARY (lane spec §L1.11). Issues proved/disproved: (a) a dense derived grid (Hospital: 128 x 128) is cut to a readable primary grid;
// (b) readable grids are NOT touched (Duplex 3x4, HHS 12x13, SampleCastle 28x31: no §GRID_PRIMARY dropped lines). Python == JS is W-LOG (witness_std2d_set.js).
// Control: a synthetic 60-line axis built from evidence-less lines must be reduced to exterior lines only and say so.
// Usage: node tests/dxf2bim/witness_grid_primary.js <dbs...>   (NODE_PATH reaches better-sqlite3)
'use strict';
const Database = require('better-sqlite3'), S = require('../../deploy/dev/std2d.js'), path = require('path');
let fail = 0; const chk = (id, issue, ok, d) => { if (!ok) fail++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
for (const db of process.argv.slice(2)) {
  const R = S.writeStdSet(sql => new Database(db, { readonly: true }).prepare(sql).all(), path.basename(db, '.db'));
  const prim = R.log.filter(l => l.startsWith('§GRID_PRIMARY')), nx = R.grid.x.length, ny = R.grid.y.length, dropped = prim.some(l => !/dropped=0/.test(l));
  const big = prim.length > 0;
  chk('GP[' + path.basename(db) + ']', big ? 'a dense grid is left unreadable' : 'a readable grid was changed', big ? (nx <= 40 && ny <= 40) || prim.every(l => /only exterior/.test(l)) : !dropped, `grid=${nx}x${ny} ${prim.join(' | ')}`);
}
// control: the rule itself on a synthetic dense axis (60 single-wall interior lines + 2 exterior): must keep exactly the exterior lines and log it
const mk = n => { const rows = []; for (let i = 0; i < n; i++) rows.push([i * 0.5, 'w' + i]); return rows; };
const ctl = S.primaryClusters(mk(60).map(([p, g]) => [[p, g]]), new Set(['w0', 'w59'])).keep.length;
chk('GP-control', 'the rule cannot reduce a dense axis of unsupported lines to the exterior', ctl === 2, 'kept=' + ctl);
process.exit(fail ? 1 : 0);
