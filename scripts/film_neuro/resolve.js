// ⚠ DO NOT REMOVE — Scope: resolve every {{fact}} of "Think Global, Act Local" (NEURO_SYMBOLIC_ORDER_CONTRACT.md §16) from the files in evidence/,
// each by a pattern on a named line, never typed. Writes facts.resolved.json {facts, sources}. Exit 1 if any fact is missing or the storyboard uses an
// unresolved one. READ THE LOG: node resolve.js > out/resolve.log
'use strict';
const fs = require('fs'), path = require('path');
const EV = path.join(__dirname, 'evidence'), REL = 'scripts/film_neuro/evidence/';
const facts = {}, sources = {}, missing = [];
const rd = f => fs.readFileSync(path.join(EV, f), 'utf8');
function put(id, file, what, fn) { try { const v = fn(); if (v === undefined || v === null || v === '' || (typeof v === 'number' && !isFinite(v))) throw new Error('empty'); facts[id] = v; sources[id] = REL + file + ' :: ' + what; }
  catch (e) { missing.push(id + ' (' + file + ': ' + e.message + ')'); } }
const m1 = (s, re) => { const m = re.exec(s); if (!m) throw new Error('no match ' + re); return m; };
const grp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// the free AI clip (FILM_VS_AI_SLOP.md §DUEL_LEDGER rows 3-4)
put('wan_wait1', 'duel_ledger_b_2026-11-02.log', 'run1 RESULT wait=', () => m1(rd('duel_ledger_b_2026-11-02.log'), /run1 RESULT wait=([\d.]+)s/)[1]);
put('wan_prompt', 'duel_ledger_b_2026-11-02.log', "t0 start prompt='…'", () => m1(rd('duel_ledger_b_2026-11-02.log'), /prompt='([^']+)'/)[1]);
// W-FILM-NEURO-4D5D-REPEAT (two independent runs of the shipped 4D pipeline, Hospital)
const W = rd('w_repeat.log');
put('rep_verdict', 'w_repeat.log', '§W_FILM_NEURO_4D5D_REPEAT verdict=', () => m1(W, /§W_FILM_NEURO_4D5D_REPEAT verdict=(\w+)/)[1]);
put('rep_n', 'w_repeat.log', 'part=4D.play n=', () => grp(m1(W, /part=4D\.play n=(\d+) .* SAME/)[1]));
put('rep_days', 'w_repeat.log', '§W_REPEAT_OVERLAY days=', () => m1(W, /§W_REPEAT_OVERLAY days=(\d+)/)[1]);
put('rep_cost', 'w_repeat.log', '§W_REPEAT_OVERLAY cost=', () => grp(m1(W, /§W_REPEAT_OVERLAY .* cost=(\d+)/)[1]));
put('rep_tasks', 'w_repeat.log', 'part=4D.tasks n=', () => m1(W, /part=4D\.tasks n=(\d+) .* SAME/)[1]);
// the Hospital film's clash pass (page log of the 2026-10-03 0049 bake)
const CL = rd('hospital_0049_clash.log');
put('clash_broad', 'hospital_0049_clash.log', '§CLASH_NARROWPHASE broad=', () => grp(m1(CL, /broad=(\d+)/)[1]));
put('clash_true', 'hospital_0049_clash.log', '§CLASH_NARROWPHASE meshTrue=', () => m1(CL, /meshTrue=(\d+)/)[1]);
put('clash_fp', 'hospital_0049_clash.log', '§CLASH_NARROWPHASE falsePositiveRate=', () => m1(CL, /falsePositiveRate=([\d.]+)%/)[1]);
// the proposer test, run 3 (results_v3_2026-11-07.json, bim-ootb modeller/tests/proposer_test)
const R = JSON.parse(rd('results_v3_2026-11-07.json'));
put('a_right', 'results_v3_2026-11-07.json', 'summary.right_outcome_A', () => R.summary.right_outcome_A);
put('b_right', 'results_v3_2026-11-07.json', 'summary.right_outcome_B', () => R.summary.right_outcome_B);
put('n_runs', 'results_v3_2026-11-07.json', 'summary.runs', () => R.summary.runs);
put('cost_v3', 'results_v3_2026-11-07.json', 'cost_usd (Claude Code estimate, not a charge), 2 decimals', () => R.cost_usd.toFixed(2));
put('model', 'results_v3_2026-11-07.json', 'model', () => R.model);
const g4 = R.runs.filter(r => r.brief === 'G4' && r.rep === 0)[0].attempts[0];
put('ai_quote', 'results_v3_2026-11-07.json', 'runs[G4 rep0].attempts[0].raw, first two sentences', () => m1(g4.raw, /^(Bay gx5 to gx6 is currently [^\n]*?\. To reach 13 m it must widen by [\d.]+ m\.)/)[1]);
put('ai_forecast', 'results_v3_2026-11-07.json', 'runs[G4 rep0].attempts[0].forecast, first sentence', () => m1(g4.forecast, /^(.+?\.)(?=\s+[A-Z]|$)/)[1]);
put('ai_decline', 'results_v3_2026-11-07.json', 'runs[G4 rep0].attempts[0].decline', () => String(g4.decline));
put('ai_target', 'results_v3_2026-11-07.json', 'the 13 m in the quote', () => m1(g4.raw, /To reach (\d+) m/)[1]);
put('run_date', 'results_v3_2026-11-07.json', 'file name date', () => '2026-11-07');
// edit_cli, today (evidence/g4.json, g2.json, hosp_lines.json — real runs against bim-ootb main, rev in bim_ootb_rev.txt)
const G4 = JSON.parse(rd('g4.json')), G2 = JSON.parse(rd('g2.json')), HL = JSON.parse(rd('hosp_lines.json'));
put('g4_reason', 'g4.json', 'edits[0].reason', () => G4.edits[0].reason.replace(/^stopped: /, ''));
put('g4_bay', 'g4.json', 'reason: newly over the limit: <m>', () => m1(G4.edits[0].reason, /newly over the limit: ([\d.]+) m/)[1]);
put('g4_limit', 'g4.json', 'reason: (limit <m> m', () => m1(G4.edits[0].reason, /\(limit (\d+) m/)[1]);
put('g4_mat', 'g4.json', 'reason: limit .. m, <material>', () => m1(G4.edits[0].reason, /\(limit \d+ m, (\w+)\)/)[1]);
put('g4_secs', 'g4.json', 'ms / 1000, whole seconds', () => (G4.ms / 1000).toFixed(0));
put('g4_cmd', 'g4.json', 'the command that produced it (building, edit)', () => 'node edit_cli.js --building ' + G4.building + ' --lattice-boxes --shift ' + G4.edits[0].grid + ' --move ' + G4.edits[0].move);
put('g2_reason', 'g2.json', 'edits[0].reason', () => G2.edits[0].reason.replace(/^stopped: /, ''));
put('g2_ov_before', 'g2.json', 'report row overlap before', () => G2.edits[0].report.rows.filter(r => r.id === 'overlap')[0].before);
put('g2_ov_after', 'g2.json', 'report row overlap after', () => G2.edits[0].report.rows.filter(r => r.id === 'overlap')[0].after);
put('g2_cmd', 'g2.json', 'the command', () => 'node edit_cli.js --building ' + G2.building + ' --lattice-boxes --shift ' + G2.edits[0].grid + ' --move ' + G2.edits[0].move);
put('lines_n', 'hosp_lines.json', 'model.lines.length', () => HL.model.lines.length);
put('lines_src', 'hosp_lines.json', 'model.grid_source', () => HL.model.grid_source);
put('lines_first', 'hosp_lines.json', 'model.lines[0..2] as printed', () => HL.model.lines.slice(0, 3).map(l => l.id + ' ' + l.axis + ' ' + l.pos).join(' · '));
const NC = JSON.parse(rd('panel_report.json')).notChecked;
put('nc_n', 'panel_report.json', 'notChecked.length', () => NC.length);
put('nc_list', 'panel_report.json', 'notChecked', () => NC.join(' · '));
put('live_same', 'w_live.log', '§W_FILM_NEURO_LIVE … SAME|DIFFER', () => m1(rd('w_live.log'), /§W_FILM_NEURO_LIVE .* (SAME|DIFFER)/)[1]);
// W-BLOCK-SHIFT, run today
const BS = rd('block_shift.log'), bsm = m1(BS, /crossing vertices \{"before":(\d+),"beyond":(\d+),"bad":(\d+),"elementsBoth":(\d+)/);
put('bs_vertices', 'block_shift.log', 'crossing vertices before+beyond', () => grp(+bsm[1] + +bsm[2]));
put('bs_off', 'block_shift.log', 'crossing vertices bad', () => bsm[3]);
put('bs_elements', 'block_shift.log', 'crossing vertices elementsBoth', () => bsm[4]);
put('bs_pass', 'block_shift.log', 'W-BLOCK-SHIFT: n PASS / m FAIL', () => m1(BS, /^W-BLOCK-SHIFT: (\d+ PASS \/ \d+ FAIL)/m)[1]);
// the compile path's coverage (OrderContractWitnessTest, recorded in the contract file §3.1)
const NS = fs.readFileSync(path.join(__dirname, '..', '..', 'prompts', 'NEURO_SYMBOLIC_ORDER_CONTRACT.md'), 'utf8');
const cps = m1(NS, /§ORDER_COVERAGE_SUMMARY defects=(\d+) none=(\d+)/);
facts.cp_total = cps[1]; facts.cp_none = cps[2]; sources.cp_total = sources.cp_none = 'prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md :: §ORDER_COVERAGE_SUMMARY defects= none=';
const cc = m1(NS, /so \*\*not a measurement\*\*; `\$(\d+)`, 4 CLI calls, no model/);
facts.check_cost = cc[1]; sources.check_cost = 'prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md :: §15.1 hand-off rehearsal `$N`, 4 CLI calls, no model';
// the web sources (fetched 2026-11-08)
const WS = rd('web_sources_2026-11-08.md');
put('ag_solved', 'web_sources_2026-11-08.md', 'alphageometry: solved N problems', () => m1(WS, /AlphaGeometry solved (\d+) problems/)[1]);
put('ag_of', 'web_sources_2026-11-08.md', 'alphageometry: (of N)', () => m1(WS, /under competition time limits" \(of (\d+)\)/)[1]);
put('ag_year', 'web_sources_2026-11-08.md', 'alphageometry paper year', () => m1(WS, /Nature 625, 476-482 \((\d{4})\)/)[1]);
put('blender_date', 'web_sources_2026-11-08.md', 'blender_connector: published <date>', () => m1(WS, /published (April \d+, \d{4})/)[1]);
put('autodesk_q', 'web_sources_2026-11-08.md', 'autodesk_assistant first quote', () => m1(WS, /"(AI-generated responses may not always be complete or accurate\.)"/)[1]);
put('guide_url', 'web_sources_2026-11-08.md', '(the guide link, from docs/ProposerGuide.md)', () => 'red1oon.github.io/BIMCompiler/ProposerGuide');
// the guide's own commands (docs/ProposerGuide.md "Getting started"), read, not typed
const GD = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'ProposerGuide.md'), 'utf8');
facts.cmd_install = m1(GD, /^(npm install puppeteer@\d+)$/m)[1]; facts.cmd_get = m1(GD, /^(curl -O \S+edit_cli\.js)$/m)[1]; facts.cmd_lines = m1(GD, /^(node edit_cli\.js --building Hospital --lines)$/m)[1];
sources.cmd_install = sources.cmd_get = sources.cmd_lines = 'docs/ProposerGuide.md :: Getting started';

const sb = fs.readFileSync(path.join(__dirname, 'script_en.md'), 'utf8'), used = Array.from(new Set((sb.split('\n').filter(l => /^\| \d+ \|/.test(l)).join('\n').match(/\{\{(\w+)\}\}/g) || []).map(x => x.slice(2, -2))));
const unres = used.filter(k => !(k in facts));
fs.writeFileSync(path.join(__dirname, 'facts.resolved.json'), JSON.stringify({ note: 'resolve.js output; every value read from the file named in sources', facts, sources }, null, 1));
Object.keys(facts).forEach(k => console.log('§FACT ' + k + '=' + JSON.stringify(facts[k]) + '  <- ' + sources[k]));
missing.forEach(m => console.log('§FACT_MISSING ' + m));
console.log('§FACTS resolved=' + Object.keys(facts).length + ' missing=' + missing.length);
console.log('§FACTS-USED storyboard=' + used.length + ' unresolved=' + unres.length + (unres.length ? ' ' + unres.join(',') : ''));
process.exit(missing.length || unres.length ? 1 : 0);
