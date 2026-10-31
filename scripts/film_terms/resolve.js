// ⚠ DO NOT REMOVE — Scope: resolves every fact of facts.spec.json from its log (repo-root relative) and freezes them, with the sha256 of each source, into facts.resolved.json. A fact whose log or regex is not found = MISSING and the build FAILS (exit 3); there is no fallback value. READ THE LOG: out/resolve.log.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..'), spec = JSON.parse(fs.readFileSync(process.env.SPEC || path.join(__dirname, 'facts.spec.json'), 'utf8'));
const res = {}, src = {}; let miss = 0;
const txtOf = f => { const p = path.join(ROOT, f); if (!fs.existsSync(p)) return null; const t = fs.readFileSync(p, 'utf8'); src[f] = crypto.createHash('sha256').update(t).digest('hex'); return t; };
for (const f of spec.facts) {
  let val = null, why = '';
  if (f.kind === 'derive') { const o = res[f.of]; if (!o || o.status !== 'now') why = 'base fact missing: ' + f.of; else val = (Number(o.value) / f.div).toFixed(f.dp); }
  else if (f.kind === 'cmd') { try { const out = cp.execSync(f.command, { cwd: ROOT, encoding: 'utf8' }); const m = new RegExp(f.regex, 'm').exec(out); if (m) val = m[f.group]; else why = 'cmd regex no match'; txtOf(f.log); } catch (e) { why = 'cmd failed ' + e.message.split('\n')[0]; } }
  else { const t = txtOf(f.log); if (t === null) why = 'log missing: ' + f.log; else if (f.kind === 'count') {
      if (f.of) { const m = new RegExp(f.regex, 'm').exec(t); if (!m) why = 'regex no match'; else val = String((m[f.group].match(new RegExp(f.of, 'g')) || []).length); }
      else val = String((t.match(new RegExp(f.regex, 'gm')) || []).length); if (val === '0') { why = 'count is zero (nothing judged)'; val = null; } }
    else { const m = new RegExp(f.regex, 'm').exec(t); if (!m) why = 'regex no match'; else val = f.kind === 'flag' ? 'true' : (m[f.group] !== undefined ? m[f.group] : (why = 'group empty', null)); } }
  if (val === null || why) { miss++; res[f.id] = { status: 'MISSING', why }; console.log(`§FACT ${f.id} MISSING ${why} log=${f.log || ''}`); continue; }
  res[f.id] = { status: 'now', value: val, log: f.log || ('derived from ' + f.of) }; console.log(`§FACT ${f.id} value=${val.length > 90 ? val.slice(0, 90) + '…' : val} log=${res[f.id].log}`);
}
console.log(`§FACTS_VERDICT ${miss ? 'FAIL' : 'PASS'} total=${spec.facts.length} missing=${miss} sources=${Object.keys(src).length}`);
fs.writeFileSync(process.env.RESOLVED_OUT || path.join(__dirname, 'facts.resolved.json'), JSON.stringify({ facts: res, sources: src }, null, 1)); process.exit(miss ? 3 : 0);
