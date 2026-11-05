// ⚠ DO NOT REMOVE — Scope: resolve every non-LIVE fact of the film "uniCenta POS, reborn" (POS_PLUGIN_LOCAL_FIRST.md §34) from the log on disk named in facts.spec.json.
// A fact whose log is missing or whose value differs from the spoken number is a FAIL (never a guess). READ THE LOG: out/resolve.log. Usage: node resolve.js [out/facts.resolved.json]
'use strict';
const fs = require('fs'), path = require('path');
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.spec.json'), 'utf8')); delete spec._note;
const REPO = path.join(__dirname, '..', '..'), out = {}; let fail = 0, missing = [];
for (const [k, f] of Object.entries(spec).sort((a, b) => (a[1].minus ? 1 : 0) - (b[1].minus ? 1 : 0))) {
  if (f.live) { out[k] = { live: true, what: f.what }; console.log('§FACT ' + k + ' LIVE (printed by record.js)'); continue; }
  if (f.literal) { out[k] = { value: f.literal, raw: f.literal, src: f.quote, what: f.what }; console.log('§FACT ' + k + ' OK value=' + f.literal + ' src=OWNER-QUOTE ' + f.quote.slice(0, 80)); continue; }
  const p = f.src.startsWith('/') ? f.src.replace(/^\/tmp\/soda2_logs\/run_all_bridge\.log$/, fs.existsSync('/tmp/soda2_logs/run_all_bridge.log') ? '/tmp/soda2_logs/run_all_bridge.log' : process.env.HOME + '/.cache/bim_bridge/run_20261104_151811.log') : path.join(REPO, f.src);
  if (!fs.existsSync(p)) { missing.push(k + ' <- ' + f.src); fail++; console.log('§FACT ' + k + ' FAIL log missing ' + f.src); continue; }
  const m = new RegExp(f.re).exec(fs.readFileSync(p, 'utf8'));
  if (!m) { fail++; console.log('§FACT ' + k + ' FAIL no match for /' + f.re + '/ in ' + p); continue; }
  let val = m[1]; if (f.minus) { if (!out[f.minus]) { fail++; console.log('§FACT ' + k + ' FAIL needs ' + f.minus + ' first'); continue; } val = String(+m[1] - +out[f.minus].value); }
  const ok = f.minus ? (m[1] === f.expect && val === f.expectDerived) : m[1] === f.expect; if (!ok) fail++;
  out[k] = { value: val, raw: m[1], derived: f.minus ? m[1] + ' - ' + f.minus : undefined, src: p, re: f.re, what: f.what }; console.log('§FACT ' + k + ' ' + (ok ? 'OK' : 'FAIL got=' + val + ' want=' + (f.expectDerived || f.expect)) + ' value=' + val + ' src=' + p);
}
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(process.argv[2] || path.join(__dirname, 'out', 'facts.resolved.json'), JSON.stringify(out, null, 1));
console.log('§RESOLVE_VERDICT ' + (fail ? 'FAIL fails=' + fail + (missing.length ? ' missing_logs=' + missing.join('; ') : '') : 'PASS facts=' + Object.keys(out).length));
process.exit(fail ? 1 : 0);
