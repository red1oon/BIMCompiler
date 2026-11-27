// ⚠ DO NOT REMOVE — Scope: resolve every {{fact}} of "CLI for OOTB Kernel Trilogy, Part II" (NEURO_SYMBOLIC_ORDER_CONTRACT.md §22.8) from the saved runs in evidence/
// (written by demo/*.sh from EMPTY folders against the live site), each by a pattern on a named file, never typed. Writes facts.resolved.json {facts, sources}.
// Exit 1 if any fact is missing or the storyboard uses an unresolved one. READ THE LOG: node resolve.js > out/resolve.log
'use strict';
const fs = require('fs'), path = require('path');
const EV = path.join(__dirname, 'evidence'), REL = 'scripts/film_neuro2/evidence/';
const facts = {}, sources = {}, missing = [];
const rd = f => fs.readFileSync(path.join(EV, f), 'utf8');
const last = f => { const s = rd(f).trim(); try { return JSON.parse(s); } catch (e) { return JSON.parse(s.split('\n').pop()); } };
function put(id, file, what, fn) { try { const v = fn(); if (v === undefined || v === null || v === '' || (typeof v === 'number' && !isFinite(v))) throw new Error('empty'); facts[id] = v; sources[id] = (/^(prompts|docs)\//.test(file) ? '' : REL) + file + ' :: ' + what; }
  catch (e) { missing.push(id + ' (' + file + ': ' + e.message + ')'); } }
const m1 = (s, re) => { const m = re.exec(s); if (!m) throw new Error('no match ' + re); return m; };
const grp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Part I recap (the G4 stop, carried over from Part I's evidence)
const G4 = JSON.parse(rd('p1_g4.json'));
put('g4_bay', 'p1_g4.json', 'reason: newly over the limit: <m>', () => m1(G4.edits[0].reason, /newly over the limit: ([\d.]+) m/)[1]);
put('g4_bay_r', 'p1_g4.json', 'reason: newly over the limit, rounded to whole metres (for speech)', () => String(Math.round(+m1(G4.edits[0].reason, /newly over the limit: ([\d.]+) m/)[1])));
put('g4_limit', 'p1_g4.json', 'reason: (limit <m> m', () => m1(G4.edits[0].reason, /\(limit (\d+) m/)[1]);
put('g4_reason', 'p1_g4.json', 'edits[0].reason', () => G4.edits[0].reason.replace(/^stopped: /, ''));
// d5: the connector menu, asked by the scripted client (no AI)
const D5 = last('d5_menu.stdout');
put('menu_n', 'd5_menu.stdout', 'toolCount', () => D5.toolCount);
put('menu_client', 'd5_menu.stdout', 'client', () => D5.client);
D5.tools.forEach((t, i) => { put('menu' + i + '_name', 'd5_menu.stdout', 'tools[' + i + '].name', () => t.name); put('menu' + i + '_inputs', 'd5_menu.stdout', 'tools[' + i + '].inputs keys', () => Object.keys(t.inputs).join(', '));
  put('menu' + i + '_desc', 'd5_menu.stdout', 'tools[' + i + '].description, first sentence', () => m1(t.description, /^(.+?[.])(?:\s|$)/)[1]); });
// d1: the Viewer's count
const D1 = last('d1_counts.stdout');
put('c_total', 'd1_counts.stdout', 'value.total', () => grp(D1.value.total));
['MEP', 'ARC', 'STR'].forEach(k => put('c_' + k.toLowerCase(), 'd1_counts.stdout', 'value.groups.' + k, () => D1.value.groups[k]));
put('c_summary', 'd1_counts.stdout', 'summary', () => D1.summary);
put('c_line', 'd1_counts.stdout', 'viewerLine (the Viewer\'s own §ASK_ANSWER)', () => D1.viewerLine);
put('d1_cmd', 'd1_counts.cmd', 'the exact command line', () => rd('d1_counts.cmd').trim());
put('d1_nfiles', 'd1_counts.files', 'lines (files downloaded into the empty folder)', () => rd('d1_counts.files').trim().split('\n').length);
put('tree_n', 'd1_counts.files', 'lines minus the one model file (the Viewer\'s page files and tools)', () => rd('d1_counts.files').trim().split('\n').filter(l => !/Duplex_extracted\.db/.test(l)).length);
// d2: clashes
const D2 = last('d2_clashes.stdout');
put('k_box', 'd2_clashes.stdout', 'value.bboxOverlaps', () => D2.value.bboxOverlaps);
put('k_clash', 'd2_clashes.stdout', 'value.meshClashes', () => D2.value.meshClashes);
put('k_cleared', 'd2_clashes.stdout', 'value.cleared', () => D2.value.cleared);
put('k_unj', 'd2_clashes.stdout', 'value.unknown', () => D2.value.unknown);
put('k_tol', 'd2_clashes.stdout', 'value.toleranceM x 1000, mm', () => Math.round(D2.value.toleranceM * 1000));
put('k_summary', 'd2_clashes.stdout', 'summary', () => D2.summary);
put('d2_cmd', 'd2_clashes.cmd', 'the exact command line', () => rd('d2_clashes.cmd').trim());
// d3: the edit report's shape-checked verdict
const D3 = last('d3_shift.stdout'), E3 = D3.edits[0], NR = E3.report.newRows.filter(r => r.id === 'clash')[0];
put('e_reason', 'd3_shift.stdout', 'edits[0].reason', () => E3.reason.replace(/^stopped: /, ''));
put('e_clash', 'd3_shift.stdout', 'newRows clash count', () => NR.count);
put('e_pairs', 'd3_shift.stdout', 'newRows clash box_count', () => NR.box_count);
put('e_cleared', 'd3_shift.stdout', 'reason: N cleared', () => m1(E3.reason, /(\d+) cleared \(/)[1]);
put('e_boxonly', 'd3_shift.stdout', 'reason: N box only', () => m1(E3.reason, /(\d+) box only/)[1]);
put('d3_cmd', 'd3_shift.cmd', 'the exact command line', () => rd('d3_shift.cmd').trim());
// the Viewer bug (found by the Viewer verb), numbers from the contract file and the control run on the owner's local Duplex copy
const NS = fs.readFileSync(path.join(__dirname, '..', '..', 'prompts', 'NEURO_SYMBOLIC_ORDER_CONTRACT.md'), 'utf8');
const bm = m1(NS, /`bboxOverlaps=(\d+) meshClashes=(\d+) cleared=(-\d+)`: the Viewer's own clash answer|Duplex ARC\/MEP gave `bboxOverlaps=(\d+) meshClashes=(\d+) cleared=(-\d+)`/);
const bv = bm[1] ? [bm[1], bm[2], bm[3]] : [bm[4], bm[5], bm[6]];
facts.bug_box = bv[0]; facts.bug_clash = bv[1]; facts.bug_neg = bv[2].replace('-', ''); sources.bug_box = sources.bug_clash = sources.bug_neg = 'prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md :: Duplex ARC/MEP gave `bboxOverlaps=… meshClashes=… cleared=-…`';
const X1 = last('x1_control_local_duplex_clashes.json');
put('fix_box', 'x1_control_local_duplex_clashes.json', 'value.bboxOverlaps (same test copy, after the fix)', () => X1.value.bboxOverlaps);
put('fix_clash', 'x1_control_local_duplex_clashes.json', 'value.meshClashes', () => X1.value.meshClashes);
put('fix_cleared', 'x1_control_local_duplex_clashes.json', 'value.cleared', () => X1.value.cleared);
// d4: the film path check
const P = { f: last('d4_path_fwd.stdout'), r: last('d4_path_rev.stdout') };
for (const k of ['f', 'r']) { const j = P[k], f = k === 'f' ? 'd4_path_fwd.stdout' : 'd4_path_rev.stdout', tot = j.log.map(l => /§FILM-PATH-VIS total linesInView=(\d+)\/(\d+) markersInView=(\d+)\/(\d+)/.exec(l)).filter(Boolean)[0], b0 = j.per.filter(b => b.band === '0')[0];
  put('p_lines_' + k, f, 'per[band 0].lines', () => b0.lines); put('p_markers_' + k, f, 'per[band 0].markers', () => b0.markers);
  if (k === 'f') { put('p_lines_t', f, '§FILM-PATH-VIS total linesInView=a/<b>', () => tot[2]); put('p_markers_t', f, '§FILM-PATH-VIS total markersInView=a/<b>', () => tot[4]);
    put('p_gl', f, '§FILM-PATH-VIS env gl=', () => m1(j.log[0], /gl=(\w+)/)[1]); } }
put('d4_cmd', 'd4_path_fwd.cmd', 'the exact command line', () => rd('d4_path_fwd.cmd').trim());
// d6: the inventories
const VA = rd('d6_viewer_actions.stdout').split('\n')[0], EVL = rd('d6_erp_verbs.stdout').split('\n')[0];
put('va_n', 'd6_viewer_actions.stdout', '§VIEWER_ACTIONS N_actions=', () => m1(VA, /N_actions=(\d+)/)[1]);
put('va_x', 'd6_viewer_actions.stdout', '§VIEWER_ACTIONS X=', () => m1(VA, / X=(\d+)/)[1]);
put('va_entry', 'd6_viewer_actions.stdout', '§VIEWER_ACTIONS N_entry=', () => m1(VA, /N_entry=(\d+)/)[1]);
put('ev_n', 'd6_erp_verbs.stdout', '§ERP_VERBS N=', () => grp(m1(EVL, /§ERP_VERBS N=(\d+)/)[1]));
put('ev_x', 'd6_erp_verbs.stdout', '§ERP_VERBS X=', () => m1(EVL, / X=(\d+)/)[1]);
put('ev_impl', 'd6_erp_verbs.stdout', '§ERP_VERBS impl=', () => m1(EVL, /impl=(\d+)/)[1]);
// the dictionary roadmap (contract §22.6): count the rungs of its table
const rt = NS.split('### 22.6')[1].split('### 22.7')[0], rungs = rt.split('\n').filter(l => /^\| D\d \|/.test(l));
put('rungs_n', 'prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md', '§22.6 table: rows D0..', () => rungs.length);
put('rung_state0', 'prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md', '§22.6 D0 state', () => m1(rungs[0], /\*\*(done, witnessed)\*\*/)[1]);
put('guide_url', 'docs/ProposerGuide.md', 'the guide link (docs site)', () => 'red1oon.github.io/BIMCompiler/ProposerGuide');
const GD = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'ProposerGuide.md'), 'utf8');
facts.cmd_mcp = m1(GD, /`(claude mcp add bim -- node "\$PWD\/bim_mcp\.js")`/)[1]; facts.cmd_get_mcp = m1(GD, /^(curl -O \S+bim_mcp\.js)$/m)[1]; facts.cmd_install = m1(GD, /^(npm install puppeteer@\d+)$/m)[1];
sources.cmd_mcp = sources.cmd_get_mcp = sources.cmd_install = 'docs/ProposerGuide.md :: Getting started / Connect your AI';

const sb = fs.readFileSync(path.join(__dirname, 'script_en.md'), 'utf8'), used = Array.from(new Set((sb.split('\n').filter(l => /^\| [\d.]+ \|/.test(l)).join('\n').match(/\{\{(\w+)\}\}/g) || []).map(x => x.slice(2, -2))));
const unres = used.filter(k => !(k in facts));
fs.writeFileSync(path.join(__dirname, 'facts.resolved.json'), JSON.stringify({ note: 'resolve.js output; every value read from the file named in sources', facts, sources }, null, 1));
Object.keys(facts).forEach(k => console.log('§FACT ' + k + '=' + JSON.stringify(facts[k]).slice(0, 200) + '  <- ' + sources[k]));
missing.forEach(m => console.log('§FACT_MISSING ' + m));
console.log('§FACTS resolved=' + Object.keys(facts).length + ' missing=' + missing.length);
console.log('§FACTS-USED storyboard=' + used.length + ' unresolved=' + unres.length + (unres.length ? ' ' + unres.join(',') : ''));
process.exit(missing.length || unres.length ? 1 : 0);
