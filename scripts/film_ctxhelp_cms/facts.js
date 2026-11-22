// ⚠ DO NOT REMOVE — film "The container legacy gave us, filled" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.18): adds to out/facts.json (made by shots.js) what the cards quote, none typed by hand:
//   beat 7's facts (out/legacy.json from legacy_shot.js), the witness verdict lines (logs run on the same main tree, copied into out/ as *_main.log), the PR states (GitHub), the licence
//   (the tree's LICENSE). READ out/facts.log. Usage: node facts.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), L = (m) => console.log('§FACTS ' + m);
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
F.legacy = JSON.parse(fs.readFileSync(path.join(OUT, 'legacy.json'), 'utf8'));
const log = (f) => fs.readFileSync(path.join(OUT, f), 'utf8'), v = (f, re) => (log(f).match(re) || [''])[0];
F.verdicts = { overlay: v('witness_ctxhelp_overlay_main.log', /§WITNESS_CTXHELP_OVERLAY pass=\d+ fail=\d+ inconclusive=\d+ verdict=\S+/), legacy: v('witness_ctxhelp_legacy_main.log', /§WITNESS_CTXHELP_LEGACY pass=\d+ fail=\d+ inconclusive=\d+ verdict=\S+/),
  erpAsk: v('witness_erp_ask_main.log', /§WITNESS_ERP_ASK pass=\d+ fail=\d+ inconclusive=\d+ verdict=\S+/) };
Object.keys(F.verdicts).forEach((k) => { F.verdicts[k] = F.verdicts[k].replace('§WITNESS_', 'W-').replace(/_/g, '-'); });
F.lines.k6cut = (log('witness_ctxhelp_overlay_main.log').split('\n').find((l) => /K6 tab 186 .*cut at the limit/.test(l)) || '').trim();
F.lines.k10 = (log('witness_ctxhelp_overlay_main.log').split('\n').find((l) => /PASS K10 /.test(l)) || '').trim();
F.lines.k11 = (log('witness_ctxhelp_overlay_main.log').split('\n').find((l) => /PASS K11 /.test(l)) || '').trim();
['L1', 'L3', 'L5'].forEach((k) => { F.lines['legacy' + k] = (log('witness_ctxhelp_legacy_main.log').split('\n').find((l) => new RegExp('^  (PASS|FAIL) ' + k + ' ').test(l)) || '').trim(); });
const pr = (n) => (spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state', '-q', '.state'], { encoding: 'utf8' }).stdout || '').trim();
F.credentials = { licence: fs.readFileSync(path.join(TREE, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', prs: [3380, 3384, 3387, 3388, 3374].map((n) => ({ n, state: pr(n) })) };
L('verdicts ' + JSON.stringify(F.verdicts)); L('lines ' + JSON.stringify({ k6cut: F.lines.k6cut, l3: F.lines.legacyL3, l5: F.lines.legacyL5 })); L('credentials ' + JSON.stringify(F.credentials));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
const ok = Object.values(F.verdicts).every((x) => /PASS$/.test(x)) && F.credentials.prs.every((x) => x.state === 'MERGED') && F.credentials.licence === 'MIT License' && !!F.lines.k6cut && F.legacy.back === true;
L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
