// ⚠ DO NOT REMOVE — Scope: FILM_PLAN §9 T1 (DXF2BIM film). Preload hook: `FILM_CAPTURE_DIR=<dir> node -r <this> <sandbox script> [args]`.
// Wraps dxf2bim.run and dxf2mesh.assemble while an EXISTING witnessed script runs unchanged, and dumps each result as JSON,
// so the film draws exactly what the witness computed (no copied config). Read the log: §CAPTURE lines; run_id must equal the script's own log.
'use strict';
const Module = require('module'), fs = require('fs'), path = require('path');
const DIR = process.env.FILM_CAPTURE_DIR;
if (!DIR) throw new Error('FILM_CAPTURE_DIR not set');
fs.mkdirSync(DIR, { recursive: true });
const TAG = process.env.FILM_CAPTURE_TAG || path.basename(process.argv[1] || 'run', '.js');
let n = 0;
const dump = (kind, obj) => {
  const f = path.join(DIR, `${TAG}_${kind}_${String(++n).padStart(2, '0')}.json`);
  fs.writeFileSync(f, JSON.stringify(obj));
  return f;
};
const origLoad = Module._load;
Module._load = function (req, parent, isMain) {
  const m = origLoad.apply(this, arguments);
  if (/dxf2bim\.js$/.test(req) && m && m.run && !m.__filmWrapped) {
    const run = m.run;
    m.run = function (txt, map, cfg, deps) {
      const r = run.apply(this, arguments);
      const f = dump('run', { run_id: r.run_id, ops: r.ops, report: r.report, region: deps && deps.region || null, exclude: deps && deps.exclude || null, level: deps && deps.level, storey: deps && deps.storey });
      console.error('§CAPTURE run run_id=' + r.run_id + ' ops=' + r.ops.length + ' -> ' + f);
      return r;
    };
    m.__filmWrapped = true;
  }
  if (/dxf2mesh\.js$/.test(req) && m && m.assemble && !m.__filmWrapped) {
    const asm = m.assemble;
    m.assemble = function () {
      const r = asm.apply(this, arguments);
      const f = dump('assemble', r);
      console.error('§CAPTURE assemble run_id=' + r.run_id + ' elements=' + (r.elements || []).length + ' -> ' + f);
      return r;
    };
    m.__filmWrapped = true;
  }
  return m;
};
