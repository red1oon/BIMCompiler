// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot §4; read the log after every run (exit code is not evidence).
// pilot_replay.js <case> [...]  — per case: snapshot every table of the reference DB, run the case on REAL iDempiere (ADInterface),
// diff every table by PK, run the SAME case through OUR ERP's UI in headless Chromium, then side-by-side compare (table + column).
// Outputs ~/.cache/pilot/<case>/{ref_diff,ours,cmp}.json + run.log. Customer swap = env PILOT_PG_DB / PILOT_CLIENT_ID / PILOT_OOTB.
'use strict';
const cp = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const cases = process.argv.slice(2); if (!cases.length) { console.error('usage: pilot_replay.js <case>...'); process.exit(2); }
const run = (args, log) => { const r = cp.spawnSync('node', args, { cwd: __dirname, encoding: 'utf8', maxBuffer: 1 << 28 }); fs.appendFileSync(log, r.stdout + (r.stderr || '')); return r; };
for (const c of cases) {
  const dir = path.join(os.homedir(), '.cache', 'pilot', c); fs.mkdirSync(dir, { recursive: true }); const log = path.join(dir, 'run.log'); fs.writeFileSync(log, '');
  const sc = path.join(__dirname, 'scenarios', c + '.json');
  run(['pilot_tablediff.js', 'snap', 'b_' + c.replace(/\W/g, '_')], log);
  const r1 = run(['pilot_run_ref.js', sc, path.join(dir, 'refmap.json')], log);
  const d = run(['pilot_tablediff.js', 'diff', 'b_' + c.replace(/\W/g, '_'), 'live', '--json', path.join(dir, 'ref_diff.json')], log);
  const r2 = run(['pilot_run_ours.js', sc, path.join(dir, 'ours.json')], log);
  const m = run(['pilot_compare_pos.js', path.join(dir, 'ref_diff.json'), path.join(dir, 'ours.json'), path.join(dir, 'cmp.json')], log);
  const txt = fs.readFileSync(log, 'utf8'); const g = re => (txt.match(re) || [])[0] || 'none';
  console.log('§PILOT-REPLAY case=' + c + ' ref=' + g(/§PILOT-REF-RUN steps=\d+ failed=\d+/) + ' | refTables=' + g(/tablesChanged=\d+/) + ' | ours=' + g(/§PILOT-OURS-RUN ops=\d+ pageerrors=\d+ fatal=\S+/) + ' | ' + g(/§PILOT-POS-CMP-SUMMARY .*/) + ' log=' + log);
}
