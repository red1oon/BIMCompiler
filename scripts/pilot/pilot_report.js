// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot §4/§7; read the log after every run.
// pilot_report.js — aggregate ~/.cache/pilot/<case>/{cmp,ours,ref}.json into the replay table: docs driven, diffs by kind, each diff -> rule.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const dir = path.join(os.homedir(), '.cache', 'pilot'); const rows = [], kinds = {}, byTable = {};
for (const c of fs.readdirSync(dir).filter(x => fs.existsSync(path.join(dir, x, 'cmp.json'))).sort()) {
  const cmp = JSON.parse(fs.readFileSync(path.join(dir, c, 'cmp.json'))), ours = JSON.parse(fs.readFileSync(path.join(dir, c, 'ours.json')));
  const sc = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios', c + '.json')));
  const docs = sc.steps.filter(s => s.op === 'docaction').length, creates = sc.steps.filter(s => s.op === 'create').length;
  const okOurs = ours.steps.filter(s => !s.error && s.result !== 'ACTION-NOT-OFFERED').length;
  let miss = 0, part = 0, val = 0, mcol = 0, extra = 0, na = 0;
  for (const t of cmp.tables) {
    const v = String(t.verdict); if (v.startsWith('MISSING')) { miss++; (byTable[t.table] = byTable[t.table] || { n: 0, owner: t.owner }).n++; } else if (v.startsWith('PARTIAL')) part++; else if (v.startsWith('EXTRA')) extra++; else if (v.startsWith('N/A')) na++;
    for (const x of t.cols || []) { if (x.v === 'VALUE-DIFF') val++; else if (x.v && x.v.startsWith('MISSING-COL')) mcol++; else if (x.v === 'EXTRA-IN-OURS') extra++; if (x.missing && x.missing.length) { mcol += x.missing.length; } }
  }
  rows.push({ c, creates, docs, okOurs, steps: sc.steps.length, refTables: cmp.tables.filter(t => t.ref).length, miss, part, val, mcol, extra, na });
}
console.log('| case | create steps | doc actions | steps ours drove | ref tables changed | MISSING-IN-OURS tables | PARTIAL tables | VALUE-DIFF cols | MISSING cols/fact-lines | EXTRA cols | harness-n/a |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.c} | ${r.creates} | ${r.docs} | ${r.okOurs}/${r.steps} | ${r.refTables} | ${r.miss} | ${r.part} | ${r.val} | ${r.mcol} | ${r.extra} | ${r.na} |`);
console.log('\n§PILOT-REPLAY-TOTAL docsDriven=' + rows.reduce((a, r) => a + r.docs, 0) + ' createSteps=' + rows.reduce((a, r) => a + r.creates, 0) + ' cases=' + rows.length);
console.log('\n| missing table (across cases) | cases | owning Java | trap |'); console.log('|---|---|---|---|');
for (const [t, v] of Object.entries(byTable).sort((a, b) => b[1].n - a[1].n)) console.log(`| ${t} | ${v.n} | ${v.owner.java} | ${v.owner.trap} |`);
