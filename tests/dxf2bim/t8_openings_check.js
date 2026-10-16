// ⚠ DO NOT REMOVE — Sandbox check of openings on the real messy file. Width of every emitted door must equal the raw ARC radius × 0.0254.
// host_tol and door height are SANDBOX placeholders (N10). Read the log after every run.
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const txt = fs.readFileSync(process.argv[2], 'utf8');
const MAP = { version: 1, rules: [{ match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' }] };
for (const tol of [0.05, 0.15, 0.3]) {                       // SANDBOX: show sensitivity of host matching to host_tol
  const CFG = { version: 1, units: 'in', host_tol: tol, wall: { thickness: 0.2, height: 3.0, base: 0 }, opening: { door: { height: 2.1 } } };
  const r = D.run(txt, MAP, CFG, { DxfParser, hashHex, library: [] });
  const raw = new Map(new DxfParser().parseSync(txt).entities.map(e => [e.handle, e]));
  const doors = r.ops.filter(o => o.op_type === 'DXF_OPENING');
  const noHost = r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === 'GAP:no_host');
  const bad = doors.filter(o => o.params.width !== Math.round(raw.get(o.params.handle).radius * 0.0254 * 1e6) / 1e6);
  console.log('host_tol=' + tol + ' m: arcs=11 doors_emitted=' + doors.length + ' no_host=' + noHost.length + ' width_mismatch=' + bad.length +
    ' widths_m=' + JSON.stringify(doors.map(o => o.params.width).sort((a, b) => a - b)));
  if (tol === 0.15) doors.forEach(o => console.log('  door ' + o.params.handle + ' width=' + o.params.width + ' host=' + o.params.host_handle + ' hinge=' + o.params.hinge));
  console.log((bad.length === 0 && doors.length + noHost.length === 11 ? 'PASS' : 'FAIL') + ' T8-OPEN | width != raw radius, or an arc unaccounted | doors+no_host=' + (doors.length + noHost.length) + '/11');
}
