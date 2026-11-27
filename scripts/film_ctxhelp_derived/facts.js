// ⚠ DO NOT REMOVE — film "Read from legacy's own code" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.20; adapted from film_ctxhelp_cms/facts.js): adds to out/facts.json (made by shots.js) what the cards quote and the guard
//   resolves, none typed by hand: beat 8's facts (out/legacy.json from legacy_shot.js), the counts and verdict lines of the witness logs (run on the same main tree, copied into out/), the effect
//   count and the cited line of erp/tools/legacy_rules.json, the pilot-restored witness (out/pilot_witness.log) and the L&F parity verdict (out/lf_parity.log), the PR states (GitHub), the licence.
//   READ out/facts.log. Usage: node facts.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), L = (m) => console.log('§FACTS ' + m);
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
F.legacy = JSON.parse(fs.readFileSync(path.join(OUT, 'legacy.json'), 'utf8'));
const log = (f) => fs.readFileSync(path.join(OUT, f), 'utf8'), find = (f, re) => (log(f).split('\n').find((l) => re.test(l)) || '').trim(), num = (s, re) => { const m = re.exec(s || ''); return m ? Number(m[1]) : null; };
// the derived witness (W-CTXHELP-DERIVED) on the same tree
const dw = 'witness_ctxhelp_derived_main.log';
F.derived = { d1: find(dw, /CTXHELP_DERIVED_W D1 derived/), d2b: find(dw, /CTXHELP_DERIVED_W D2b cited/), d3: find(dw, /CTXHELP_DERIVED_W D3 marks/), verdict: find(dw, /§WITNESS_CTXHELP_DERIVED /) };
F.derived.windows = num(F.derived.d1, /derived (\d+) of \d+ core/); F.derived.of = num(F.derived.d1, /derived \d+ of (\d+) core/); F.derived.ticks = num(F.derived.d3, /marks ✓ with the real facts (\d+)/); F.derived.flipped = num(F.derived.d3, /SQLITE-GAP (\d+)/);
F.derived.cited = num(F.derived.d2b, /cited lines (\d+) of/); F.derived.citedOf = num(F.derived.d2b, /cited lines \d+ of (\d+)/);
// the red run: a cited line moved by one must FAIL the witness (the claim "if the line moves, the build fails")
F.red = { srcline: find('witness_ctxhelp_derived_red_srcline.log', /FAIL D2b/), verdict: find('witness_ctxhelp_derived_red_srcline.log', /§WITNESS_CTXHELP_DERIVED /), cited: find('witness_ctxhelp_derived_red_srcline.log', /CTXHELP_DERIVED_W D2b cited/) };
// legacy's rules file: the effect count and the effect cited by beat 3
const LR = JSON.parse(fs.readFileSync(path.join(TREE, 'erp', 'tools', 'legacy_rules.json'), 'utf8')), ef = LR.effects.find((e) => e.id === 'C_Order.CO.shipment');
F.rules = { effects: LR.effects.length, effect: ef ? { id: ef.id, file: ef.file, line: ef.line, token: ef.token, text: ef.text } : null, head: LR.source && LR.source.head };
const src = fs.readFileSync(path.join(os.homedir(), 'idempiere-dev-setup', 'idempiere', 'org.adempiere.base', 'src', ef.file), 'utf8').split('\n')[ef.line - 1] || ''; F.rules.srcLine = src.trim(); F.rules.tokenHeld = src.indexOf(ef.token) >= 0;
const lrjs = fs.readFileSync(path.join(TREE, 'erp', 'tools', 'legacy_rules.js'), 'utf8'); F.rules.buildFailsDocumented = /each cited line must still hold its token, or the build FAILS/.test(lrjs);
// the legacy script: statements by kind and table (the claim "no code, no new columns")
const sql = fs.readFileSync(path.join(TREE, 'erp', 'legacy', 'local_sql', 'postgresql', fs.readdirSync(path.join(TREE, 'erp', 'legacy', 'local_sql', 'postgresql')).find((f) => /ContextHelp\.sql$/.test(f))), 'utf8');
const st = {}; sql.split('\n').forEach((l) => { const m = /^(INSERT INTO|UPDATE|DELETE FROM|ALTER|CREATE|DROP)\s+(\w+)?/i.exec(l); if (m) { const k = m[1].toUpperCase() + ' ' + (m[2] || '').toUpperCase(); st[k] = (st[k] || 0) + 1; } });
F.script = { statements: st, ddl: Object.keys(st).filter((k) => /^(ALTER|CREATE|DROP)/.test(k)).length, tables: Array.from(new Set(Object.keys(st).map((k) => k.split(' ').pop()))).sort() };
// the pilot witness and the L&F parity
F.pilot = { counts: [find('pilot_witness.log', /ad_ctxhelp=/), find('pilot_witness.log', /ad_tab_with_ctxhelp=/), find('pilot_witness.log', /ad_process_with_ctxhelp=/)], verdict: find('pilot_witness.log', /§PILOT_VERDICT/) };
F.lf = { verdict: find('lf_parity.log', /^§LF_VERDICT /), findings: find('lf_parity.log', /^§LF_FINDINGS /) };
const pr = (n) => (spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state', '-q', '.state'], { encoding: 'utf8' }).stdout || '').trim();
F.credentials = { licence: fs.readFileSync(path.join(TREE, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', prs: [3412, 3415, 3416].map((n) => ({ n, state: pr(n) })) };
F.guide = { gap: !spawnSync('grep', ['-rlE', 'What Complete does|Needed by', path.join(os.homedir(), 'bim-compiler', 'docs', 'ERPUserGuide.md'), '/tmp/wt-film/docs/ERPUserGuide.md', '/tmp/wt-film/docs/ERP_FirstSetup.md'], { encoding: 'utf8' }).stdout.trim() };
L('derived ' + JSON.stringify(F.derived)); L('red ' + JSON.stringify(F.red)); L('rules ' + JSON.stringify(F.rules)); L('script ' + JSON.stringify(F.script)); L('pilot ' + JSON.stringify(F.pilot)); L('lf ' + JSON.stringify(F.lf)); L('credentials ' + JSON.stringify(F.credentials)); L('guide_gap ' + F.guide.gap);
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
const ok = /PASS pass=8 fail=0 inconclusive=0/.test(F.derived.verdict) && /FAIL/.test(F.red.verdict) && !!F.red.srcline && /PASS 1\/0\/0/.test(F.pilot.verdict) && /PASS fails=0 inconclusive=0/.test(F.lf.verdict) && F.credentials.prs.every((x) => x.state === 'MERGED') &&
  F.credentials.licence === 'MIT License' && F.legacy.back === true && F.rules.tokenHeld && F.rules.buildFailsDocumented && F.script.ddl === 0 && F.derived.windows === F.derived.of && F.derived.cited === F.derived.citedOf;
L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
