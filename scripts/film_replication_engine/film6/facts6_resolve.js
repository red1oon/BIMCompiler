// ⚠ DO NOT REMOVE — Scope: resolves every fact of facts6.spec.json from its log (LOGDIR). Prints one §FACT line per fact. READ THE LOG (logs/facts6_resolve.log).
// A "now" fact whose regex does not match = MISSING (exit 3). A pending fact is PENDING, never a value. Nothing is typed: values come only from the log text.
// Usage: node facts6_resolve.js [LOGDIR] [--json out.json]   (SEED env = path of erp/ad_seed.db for the sql facts)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts6.spec.json'), 'utf8'));
const args = process.argv.slice(2).filter(a => !a.startsWith('--')); const jIdx = process.argv.indexOf('--json');
const LOGDIR = args[0] && !/\.json$/.test(args[0]) ? args[0] : path.join(__dirname, 'logs', 'evidence');
const res = {}; let miss = 0, now = 0, pend = 0, prov = 0, cut = 0;
for (const f of spec.facts) {
  if (f.status === 'pending') { pend++; res[f.id] = { status: 'pending', owner: f.owner }; console.log(`§FACT ${f.id} PENDING owner=${f.owner} (${f.witness})`); continue; }
  let val = null, why = '';
  if (f.status === 'cut') { res[f.id] = { status: 'cut', reason: f.reason }; cut++; console.log(`§FACT ${f.id} CUT ${f.reason}`); continue; }
  if (f.kind === 'cmd') {
    try { const out = cp.execSync(f.command, { encoding: 'utf8', shell: '/bin/bash' }); const mm = new RegExp(f.regex, 'm').exec(out); if (mm && mm[f.group] !== undefined) val = mm[f.group]; else why = 'cmd regex no match'; } catch (e) { why = 'cmd failed: ' + e.message.split('\n')[0]; }
  } else if (f.kind === 'sql') {
    const m = /^(sqlite3 \S+) (".*")$/.exec(f.command); const db = process.env.SEED || m[1].split(' ')[1];
    try { val = cp.execSync(`sqlite3 ${db} ${m[2]}`, { encoding: 'utf8' }).trim(); } catch (e) { why = 'sql failed: ' + e.message.split('\n')[0]; }
  } else {
    const file = path.join(LOGDIR, f.log);
    if (!fs.existsSync(file)) why = 'log missing: ' + f.log;
    else { const txt = fs.readFileSync(file, 'utf8'); const mm = new RegExp(f.regex, 'm').exec(txt);
      if (!mm) why = 'regex no match'; else val = f.kind === 'flag' ? 'true' : (mm[f.group] !== undefined ? mm[f.group] : (why = 'group ' + f.group + ' empty', null)); }
  }
  if (val === null || val === undefined || why) { miss++; res[f.id] = { status: 'MISSING', why }; console.log(`§FACT ${f.id} MISSING ${why}`); continue; }
  if (f.status === 'now-provisional') prov++; else now++;
  res[f.id] = { status: f.status, value: val, log: f.log, witness: f.witness };
  console.log(`§FACT ${f.id} ${f.status.toUpperCase()} value=${val} log=${f.log || 'sql'}`);
}
console.log(`§FACTS_VERDICT ${miss ? 'FAIL' : 'PASS'} total=${spec.facts.length} now=${now} provisional=${prov} pending=${pend} cut=${cut} missing=${miss}`);
if (jIdx > 0) fs.writeFileSync(process.argv[jIdx + 1], JSON.stringify(res, null, 1));
process.exit(miss ? 3 : 0);
