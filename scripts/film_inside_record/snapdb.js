#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "Inside the Record" (prompts/FILM_COMMAND_LINE_ERP.md CH 3): the door's database as it was after N op-log rows. Copies the first N lines of the recording's SCRATCH op-log,
// boots the ERP engine on that prefix (erp_cli.boot, the same boot every door line runs) and exports the database to a file the ERP page opens (?seed=). One process per prefix, so nothing of
// one state leaks into the next. Usage: OOTB=<checkout> node snapdb.js <ops.jsonl> <N> <out.db>      prints §SNAPDB lines; READ them.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const [src, nStr, outDb] = process.argv.slice(2), N = Number(nStr), OOTB = process.env.OOTB;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fir_snap_')), pre = path.join(dir, 'ops.jsonl');
const lines = N > 0 ? fs.readFileSync(src, 'utf8').split('\n').filter(Boolean).slice(0, N) : [];
fs.writeFileSync(pre, lines.length ? lines.join('\n') + '\n' : '');
process.env.BIM_OBJECT_OPLOG = pre; process.env.BIM_DOOR_JOURNAL = path.join(dir, 'j.jsonl'); process.env.ERP_OPIMAGE = 'off';
const E = require(path.join(OOTB, 'common/door/erp_cli.js'));
(async () => {
  const w = process.stderr.write; process.stderr.write = () => true; let O; try { O = await E.boot({}); } finally { process.stderr.write = w; }
  fs.writeFileSync(outDb, Buffer.from(O.db.export()));
  const st = O.rows('SELECT docstatus AS s FROM c_order WHERE c_order_id=100')[0];
  console.log('§SNAPDB prefix=' + lines.length + ' of ' + N + ' out=' + path.basename(outDb) + ' bytes=' + fs.statSync(outDb).size + ' order100=' + (st ? st.s : 'none'));
})().catch(e => { console.error('§SNAPDB_FAIL ' + (e && e.stack || e)); process.exit(1); });
