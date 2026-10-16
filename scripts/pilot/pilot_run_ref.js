// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot; read the log after every run.
// pilot_run_ref.js <scenario.json> — execute a scenario's steps on the REAL iDempiere (pilot_ref.js). Writes ids to <out>.refmap.json.
'use strict';
const fs = require('fs'), R = require('./pilot_ref'), cfg = require('./pilot_cfg');
(async () => {
  const sc = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const map = {}; let bad = 0;
  for (const [i, s] of sc.steps.entries()) {
    const sub = f => Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, (typeof v === 'string' && v[0] === '@') ? map[v.slice(1)] : v]));
    let r;
    if (s.op === 'create') { r = await R.create(s.table, sub(s.fields)); if (r.ok) { const pkc = s.table + '_ID'; const m = cfg.psql('select max(' + pkc + ') from ' + s.table)[0][0]; r.id = Number(m); map[s.as] = r.id; } }  // WS RecordID is unreliable for child rows; single writer -> max(pk) is the created row
    else if (s.op === 'update') r = await R.update(s.table, map[s.ref], sub(s.fields));
    else if (s.op === 'docaction') r = await R.docAction(s.table, map[s.ref], s.action);
    console.log('§PILOT-REF-STEP n=' + i + ' op=' + s.op + ' table=' + s.table + (s.as ? ' as=' + s.as : '') + (s.action ? ' action=' + s.action : '') + ' ok=' + r.ok + ' id=' + r.id + (r.error ? ' error="' + r.error + '"' : ''));
    if (!r.ok) bad++;
  }
  fs.writeFileSync(process.argv[3] || '/dev/null', JSON.stringify(map)); console.log('§PILOT-REF-RUN steps=' + sc.steps.length + ' failed=' + bad + ' map=' + JSON.stringify(map));
})();
