// ⚠ DO NOT REMOVE — film v3 "Help that checks before you complete" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.22; adapted from film_ctxhelp_derived/facts.js). READ out/facts.log.
//   Adds to out/facts.json (made by shots.js) what the cards quote and the guard resolves, none typed by hand: beat 8's facts (out/legacy.json from legacy_shot.js), the verdict lines of the witness logs run
//   on the same main tree (W-HELP-PEEK, W-CTXHELP-OVERLAY, W-CTXHELP-DERIVED + its red run, W-CTXHELP-LEGACY), the pilot-restored witness (out/pilot_witness.log) and the L&F parity verdict (out/lf_parity.log),
//   the counts of the shipped rows (ad_ctxhelp_app_rows.js, friendly_ops_peek.json, legacy_rules.json, the legacy script), the PR states (GitHub), the licence. A claim with nothing judged is INCONCLUSIVE, never PASS.
//   Usage: node facts.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), LG = [], L = (m) => { LG.push('§FACTS ' + m); console.log('§FACTS ' + m); };
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
F.legacy = JSON.parse(fs.readFileSync(path.join(OUT, 'legacy.json'), 'utf8'));
const log = (f) => (fs.existsSync(path.join(OUT, f)) ? fs.readFileSync(path.join(OUT, f), 'utf8') : ''), find = (f, re) => (log(f).split('\n').find((l) => re.test(l)) || '').trim(), num = (s, re) => { const m = re.exec(s || ''); return m ? Number(m[1]) : null; };
// W-HELP-PEEK: every claim's verdict line, the judged count (a claim that judged nothing is INCONCLUSIVE in the witness itself), the red run
const peekLines = log('witness_help_peek.log').split('\n').filter((l) => /^§HELP_PEEK \S+ verdict=/.test(l)), peek = {};
peekLines.forEach((l) => { const m = /^§HELP_PEEK (\S+) verdict=(\S+) judged=(\d+) failed=(\d+)/.exec(l); if (m && m[1] !== 'VERDICT') peek[m[1]] = { v: m[2], judged: Number(m[3]), failed: Number(m[4]) }; });
F.peek = { claims: peek, verdict: find('witness_help_peek.log', /^§HELP_PEEK VERDICT /), red: find('witness_help_peek.log', /^§HELP_PEEK RED verdict=/), reds: log('witness_help_peek.log').split('\n').filter((l) => /^§HELP_PEEK RED \S+ ->/.test(l)).map((l) => l.trim()) };
F.peek.allPass = Object.keys(peek).length > 0 && Object.values(peek).every((c) => c.v === 'PASS' && c.judged > 0) && /VERDICT PASS/.test(F.peek.verdict) && F.peek.reds.length > 0 && F.peek.reds.every((l) => /FAILS as it must/.test(l));
// the other witnesses on the same tree
const wl = (f, tag) => find(f, new RegExp('§WITNESS_' + tag + ' '));
F.overlay = { verdict: wl('witness_ctxhelp_overlay.log', 'CTXHELP_OVERLAY') }; F.derived = { d1: find('witness_ctxhelp_derived_main.log', /CTXHELP_DERIVED_W D1 derived/), verdict: wl('witness_ctxhelp_derived_main.log', 'CTXHELP_DERIVED') };
F.derived.windows = num(F.derived.d1, /derived (\d+) of \d+ core/); F.derived.of = num(F.derived.d1, /derived \d+ of (\d+) core/);
F.red = { verdict: wl('witness_ctxhelp_derived_red_srcline.log', 'CTXHELP_DERIVED'), fail: find('witness_ctxhelp_derived_red_srcline.log', /FAIL D2b/) };
F.legacyW = { verdict: wl('witness_ctxhelp_legacy.log', 'CTXHELP_LEGACY') };
// the shipped rows: helps in the app rows, the peek's rows by kind (P4 cites every one), legacy's effects, the legacy script's statements (no DDL)
const rows = require(path.join(TREE, 'erp', 'ad_ctxhelp_app_rows.js')), PR = JSON.parse(fs.readFileSync(path.join(TREE, 'erp', 'plugins', 'friendly_ops_peek.json'), 'utf8')), LR = JSON.parse(fs.readFileSync(path.join(TREE, 'erp', 'tools', 'legacy_rules.json'), 'utf8'));
const assume = Object.keys(PR.assume).reduce((a, k) => a + PR.assume[k].length, 0), field = Object.keys(PR.field).length, fix = Object.keys(PR.fix || {}).filter((k) => k.charAt(0) !== '_').length;
F.rows = { helps: Object.keys(rows.links || {}).length, peekAssume: assume, peekField: field, peekFix: fix, peekCited: Object.keys(PR.assume).reduce((a, k) => a + PR.assume[k].filter((x) => x.cite).length, 0) + Object.keys(PR.field).filter((k) => PR.field[k].cite).length + Object.keys(PR.fix || {}).filter((k) => k.charAt(0) !== '_' && PR.fix[k].cite).length, effects: LR.effects.length };
const T = JSON.parse(fs.readFileSync(path.join(TREE, 'erp', 'legacy', 'ctxhelp_targets.json'), 'utf8')); F.rows.tabs = T.targets.filter((t) => t.kind === 'T').length; F.rows.procs = T.targets.filter((t) => t.kind === 'P').length;
const sql = fs.readFileSync(path.join(TREE, 'erp', 'legacy', 'local_sql', 'postgresql', fs.readdirSync(path.join(TREE, 'erp', 'legacy', 'local_sql', 'postgresql')).find((f) => /ContextHelp\.sql$/.test(f))), 'utf8');
const st = {}; sql.split('\n').forEach((l) => { const m = /^(INSERT INTO|UPDATE|DELETE FROM|ALTER|CREATE|DROP)\s+(\w+)?/i.exec(l); if (m) { const k = m[1].toUpperCase() + ' ' + (m[2] || '').toUpperCase(); st[k] = (st[k] || 0) + 1; } });
F.script = { statements: st, ddl: Object.keys(st).filter((k) => /^(ALTER|CREATE|DROP)/.test(k)).length, tables: Array.from(new Set(Object.keys(st).map((k) => k.split(' ').pop()))).sort() };
// the pilot witness and the L&F parity
F.pilot = { counts: [find('pilot_witness.log', /ad_ctxhelp=/), find('pilot_witness.log', /ad_tab_with_ctxhelp=/), find('pilot_witness.log', /ad_process_with_ctxhelp=/)], verdict: find('pilot_witness.log', /§PILOT_VERDICT/) };
F.lf = { verdict: find('lf_parity.log', /^§LF_VERDICT /), findings: find('lf_parity.log', /^§LF_FINDINGS /) };
// credentials: every PR the last card names is MERGED (GitHub), the licence
const pr = (repo, n) => (spawnSync('gh', ['pr', 'view', String(n), '-R', repo, '--json', 'state', '-q', '.state'], { encoding: 'utf8' }).stdout || '').trim();
F.credentials = { licence: fs.readFileSync(path.join(TREE, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', prs: [3412, 3415, 3416, 3421, 3433, 3435, 3437, 3438, 3439, 3441].map((n) => ({ repo: 'red1oon/bim-ootb', n, state: pr('red1oon/bim-ootb', n) })).concat([1255, 1258].map((n) => ({ repo: 'red1oon/BIMCompiler', n, state: pr('red1oon/BIMCompiler', n) }))) };
// the prior art READ: the source lines the last card cites must exist where it says (HelpController.renderCtxHelp, MCtxHelpMsg, MOrder, MInOut, MInvoice): file present + the named symbol on a line
const SRC = path.join(os.homedir(), 'idempiere-dev-setup', 'idempiere'), grepIn = (glob, re) => { const r = spawnSync('bash', ['-c', "grep -rnE '" + re + "' $(find " + SRC + " -path '*" + glob + "' | head -1) | head -1"], { encoding: 'utf8' }); return (r.stdout || '').trim().slice(0, 160); };
F.prior = { renderCtxHelp: grepIn('HelpController.java', 'renderCtxHelp'), mctx: grepIn('MCtxHelpMsg.java', 'static.*(Cache|cache)|CCache'), morder: grepIn('model/MOrder.java', 'public String completeIt'), minout: grepIn('model/MInOut.java', 'public String completeIt'), minvoice: grepIn('model/MInvoice.java', 'public String completeIt') };
F.licenceFooter = 'Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0';
L('peek ' + JSON.stringify({ n: Object.keys(peek).length, allPass: F.peek.allPass, verdict: F.peek.verdict, red: F.peek.red })); L('overlay ' + F.overlay.verdict); L('derived ' + F.derived.d1 + ' | ' + F.derived.verdict); L('red ' + F.red.verdict + ' | ' + F.red.fail); L('legacyW ' + F.legacyW.verdict);
L('rows ' + JSON.stringify(F.rows)); L('script ' + JSON.stringify(F.script)); L('pilot ' + JSON.stringify(F.pilot)); L('lf ' + JSON.stringify(F.lf)); L('credentials ' + JSON.stringify(F.credentials.prs.map((x) => x.repo.split('/')[1] + '#' + x.n + ':' + x.state))); L('prior ' + JSON.stringify(F.prior));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
const ok = F.peek.allPass && /pass=\d+ fail=0 inconclusive=0 verdict=PASS/.test(F.overlay.verdict) && /PASS pass=\d+ fail=0 inconclusive=0/.test(F.derived.verdict) && /FAIL/.test(F.red.verdict) && !!F.red.fail && /PASS 1\/0\/0/.test(F.pilot.verdict) && /PASS fails=0 inconclusive=0/.test(F.lf.verdict) &&
  F.credentials.prs.every((x) => x.state === 'MERGED') && F.credentials.licence === 'MIT License' && F.legacy.back === true && F.script.ddl === 0 && F.derived.windows === F.derived.of && F.derived.windows > 0 && F.rows.peekCited === F.rows.peekAssume + F.rows.peekField + F.rows.peekFix &&
  Object.values(F.prior).every((x) => x.length > 0) && F.rows.helps === F.legacy.applied.helps - F.legacy.before.helps && /pass=\d+ fail=0 inconclusive=0 verdict=PASS/.test(F.legacyW.verdict);
L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); fs.writeFileSync(path.join(OUT, 'facts.log'), LG.join('\n') + '\n'); process.exit(ok ? 0 : 1);
