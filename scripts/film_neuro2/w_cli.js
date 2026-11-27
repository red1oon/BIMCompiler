#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — W-FILM-NEURO2-CLI (NEURO_SYMBOLIC_ORDER_CONTRACT.md §22.4, §22.8). Read the log after every run: exit code alone is not evidence.
// Judges the SAVED evidence of the Part II demos (scripts/film_neuro2/evidence/, written by demo/run_all.sh from EMPTY folders against the live site).
// Issue each check proves or disproves is named on its line. Prints INCONCLUSIVE (never PASS) if any demo judged nothing; W_CLI_BREAK=1 tampers one saved stdout and MUST FAIL.
// Run: node w_cli.js [--rerun]   (--rerun re-runs demo/run_all.sh first, then judges)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const E = path.join(__dirname, 'evidence'), D = path.join(__dirname, 'demo');
if (process.argv.includes('--rerun')) { const r = cp.spawnSync('bash', [path.join(D, 'run_all.sh')], { stdio: 'inherit' }); console.log('§W-CLI rerun run_all exit=' + r.status); }
let pass = 0, fail = 0, vacuous = 0; const L = s => console.log(s);
const ok = (id, issue, cond, detail) => { cond ? pass++ : fail++; L(`§W-CLI ${cond ? 'PASS' : 'FAIL'} ${id} (issue: ${issue}) ${detail}`); };
const rd = (id, ext) => { try { return fs.readFileSync(path.join(E, id + '.' + ext), 'utf8'); } catch (e) { return null; } };
const J = id => { const s = rd(id, 'stdout'); if (!s) return null; try { return JSON.parse(s.trim()); } catch (e) { try { return JSON.parse(s.trim().split('\n').pop()); } catch (e2) { return null; } } };
const sha = f => cp.execFileSync('sha256sum', [f]).toString().slice(0, 16);

// ---------- load ----------
const ids = ['d1_counts', 'd2_clashes', 'd3_shift', 'd4_path_fwd', 'd4_path_rev', 'd5_menu', 'd6_viewer_actions', 'd6_erp_verbs'];
const ex = {}; for (const id of ids) ex[id] = rd(id, 'exit');
let d1 = J('d1_counts');
if (process.env.W_CLI_BREAK === '1') { L('§W-CLI FALSIFIER W_CLI_BREAK=1: the saved d1 stdout is tampered in memory (total -1); the witness MUST FAIL'); if (d1) { d1 = JSON.parse(JSON.stringify(d1)); d1.value.total -= 1; } }
const d2 = J('d2_clashes'), d3 = J('d3_shift'), d4f = J('d4_path_fwd'), d4r = J('d4_path_rev'), d5 = J('d5_menu');
const missing = ids.filter(i => ex[i] === null || rd(i, 'stdout') === null);
ok('C0', 'a demo that never ran reads as a pass', missing.length === 0, `evidence present for ${ids.length - missing.length}/${ids.length}${missing.length ? ' missing: ' + missing.join(',') : ''}`);
if (missing.length) { L('§W-CLI verdict=INCONCLUSIVE nothing judged for ' + missing.join(',')); process.exit(2); }

// ---------- C1 counts ----------
{ const v = d1 && d1.value, g = v && v.groups, sum = g ? Object.values(g).reduce((a, b) => a + b, 0) : -1;
  const line = d1 && d1.viewerLine, lv = line && JSON.parse(line.slice(line.indexOf('value=') + 6));
  ok('C1a', 'the verb answers something other than the Viewer\'s own line', !!d1 && ex.d1_counts.trim() === '0' && d1.verdict === 'OK' && lv && lv.total === v.total && JSON.stringify(lv.groups) === JSON.stringify(g), `exit=${ex.d1_counts.trim()} total=${v && v.total} equals the Viewer's own §ASK_ANSWER total=${lv && lv.total}`);
  ok('C1b', 'the groups do not add up to the total', !!v && sum === v.total && v.total > 0, `groups ${JSON.stringify(g)} sum=${sum} total=${v && v.total}`);
  if (!v || !(v.total > 0)) vacuous++;
  // independent recount on the very DB the demo downloaded (public bucket), same sha
  const dbl = (rd('d1_counts', 'files') || '').split('\n').find(l => /Duplex_extracted\.db/.test(l)); const dbsha = dbl && dbl.split(/\s+/)[0];
  const tmp = fs.mkdtempSync('/tmp/wcli_'); const db = path.join(tmp, 'Duplex.db');
  cp.execFileSync('curl', ['-fsS', '-o', db, 'https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/Duplex_extracted.db']);
  const rc = {}; cp.execFileSync('sqlite3', [db, 'select discipline,count(*) from elements_meta group by 1']).toString().trim().split('\n').forEach(r => { const [a, b] = r.split('|'); rc[a] = +b; });
  ok('C1c', 'the verb\'s count is not the file\'s count (independent GROUP BY on the downloaded DB)', sha(db) === dbsha && JSON.stringify(Object.entries(rc).sort()) === JSON.stringify(Object.entries(g || {}).sort()), `recount ${JSON.stringify(rc)} dbsha=${sha(db)} (demo's ${dbsha})`);
  fs.rmSync(tmp, { recursive: true, force: true });
  ok('C1d', 'the live number is silently replaced by the spec\'s', v && v.total === 1122 && g.MEP === 904 && g.ARC === 199 && g.STR === 19, `LIVE pinned 1122 = MEP 904 + ARC 199 + STR 19 (spec §22.2 says 1,193 on the owner's local Duplex copy; see §22.8 SPECDIFF)`); }

// ---------- C2 clashes ----------
{ const v = d2 && d2.value; const sum = v ? v.meshClashes + v.cleared + v.unknown : -1;
  ok('C2a', 'the sum is wrong again (the old 200-cap and double count gave 447 for 393)', !!v && ex.d2_clashes.trim() === '0' && d2.verdict === 'OK' && sum === v.bboxOverlaps && v.bboxOverlaps > 0, `box ${v && v.bboxOverlaps} = clash ${v && v.meshClashes} + cleared ${v && v.cleared} + unjudged ${v && v.unknown} (sum ${sum}) tolerance ${v && v.toleranceM} m`);
  if (!v || !(v.bboxOverlaps > 0)) vacuous++;
  ok('C2b', 'the live numbers drift unnoticed', !!v && v.bboxOverlaps === 487 && v.meshClashes === 356 && v.cleared === 131 && v.unknown === 0 && v.toleranceM === 0.025, `LIVE pinned 487 / 356 / 131 / 0 at 25 mm (spec §22.2: 393 / 291 / 102 on the owner's local copy)`); }

// ---------- C3 edit report: the NEW shape-checked verdict words ----------
{ const r = d3 && d3.edits && d3.edits[0], nr = r && r.report && (r.report.newRows || []).find(x => x.id === 'clash');
  ok('C3a', 'the edit report still says boxes only', !!r && ex.d3_shift.trim() === '3' && r.refused === true && r.stopped_by_gate === true && /New or deeper overlap \(shapes checked\): 5 \(5 clash, 0 not judged \(box verdict kept\), 20 cleared \(0 touching, 20 box only\); 25 box pairs\)/.test(r.reason), `exit=${ex.d3_shift.trim()} reason="${r && r.reason}"`);
  ok('C3b', 'the verdict row disagrees with its own sentence', !!nr && nr.count === 5 && nr.box_count === 25 && /20 cleared/.test(nr.shape_note || ''), `newRow clash count=${nr && nr.count} box_count=${nr && nr.box_count}`); }

// ---------- C4 film path ----------
{ const b = (j, k) => ((j && j.per) || []).find(x => x.band === k) || {};
  const f0 = b(d4f, '0'), r0 = b(d4r, '0');
  ok('C4a', 'the path check is blind (forward band must see the rows)', !!d4f && d4f.verdict === 'SEES' && f0.lines === 2 && f0.markers === 1 && d4f.bandLines === 2 && d4f.bandMarkers === 1, `forward: band 0 lines ${f0.lines}/2 markers ${f0.markers}/1 verdict=${d4f && d4f.verdict}`);
  ok('C4b', 'the path check counts what the camera cannot see (reversed band must go blind)', !!d4r && r0.samples > 0 && r0.lines === 0 && r0.markers === 0, `reversed: band 0 samples=${r0.samples} lines ${r0.lines}/2 markers ${r0.markers}/1 verdict=${d4r && d4r.verdict}`);
  if (!f0.samples || !r0.samples) vacuous++; }

// ---------- C5 menu ----------
{ const names = d5 ? d5.tools.map(t => t.name).sort() : [];
  ok('C5', 'the menu is not the 4 verbs the film says', !!d5 && d5.toolCount === 4 && JSON.stringify(names) === JSON.stringify(['bim_lines', 'bim_try_shift', 'viewer_clashes', 'viewer_counts']) && d5.client === 'scripted client, no AI', `tools=${names.join(',')} client="${d5 && d5.client}"`); }

// ---------- C6 inventories ----------
{ const va = (rd('d6_viewer_actions', 'stdout') || '').split('\n')[0], ev = (rd('d6_erp_verbs', 'stdout') || '').split('\n')[0];
  const n = (s, k) => { const m = s.match(new RegExp('\\b' + k + '=(\\d+)')); return m ? +m[1] : null; };
  ok('C6a', 'the Viewer denominator moved or X is not 1', n(va, 'N_actions') === 64 && n(va, 'X') === 1 && n(va, 'N_entry') === 96, va.slice(0, 160));
  ok('C6b', 'the ERP denominator moved or X is not 0', n(ev, 'N') === 1153 && n(ev, 'X') === 0, ev.slice(0, 160));
  ok('C6c', 'the sha the inventories ran at is not the pinned one', (rd('d6_bim_ootb_sha', 'txt') || '').trim() === '16b3c205ebd70668152312a59b4f0d4315d19243', 'pinned bim-ootb main 16b3c205'); }

// ---------- C7 files: only the beat's download list ----------
for (const id of ['d1_counts', 'd2_clashes', 'd3_shift', 'd4_path_fwd', 'd4_path_rev', 'd5_menu']) {
  const listed = (rd(id, 'files') || '').trim().split('\n').filter(Boolean), after = +(rd(id, 'nfiles_after') || '-1');
  const extra = id === 'd5_menu' ? 1 : 0;   // the scripted client file is copied beside the server (ours, labelled)
  ok('C7-' + id, 'the run needed or created a file outside the beat\'s download list', listed.length > 0 && after === listed.length + extra, `downloaded ${listed.length}${extra ? ' + 1 scripted client' : ''}, files in the folder after the run ${after}`);
}
// negative: with HOME = the empty folder, no fallback to this machine's checkout exists; a folder with the tools but no DB must refuse
{ const t = fs.mkdtempSync('/tmp/wcli_neg_'); fs.mkdirSync(path.join(t, 'viewer/tools'), { recursive: true });
  for (const f of ['viewer_verbs.js', 'viewer_driver.js']) cp.execFileSync('curl', ['-fsS', '-o', path.join(t, 'viewer/tools', f), 'https://red1oon.github.io/bim-ootb/viewer/tools/' + f]);
  const r = cp.spawnSync('node', ['viewer/tools/viewer_verbs.js', 'counts', '--building', 'Duplex'], { cwd: t, encoding: 'utf8', timeout: 60000, env: Object.assign({}, process.env, { HOME: t, NODE_PATH: '/home/red1/bim-compiler/node_modules' }) });
  ok('C7-neg', 'a missing DB is silently found elsewhere on this machine (~/bim-ootb fallback)', r.status === 1 && /unknown building "Duplex"/.test(r.stderr), `exit=${r.status} stderr="${(r.stderr || '').trim().slice(0, 140)}"`);
  fs.rmSync(t, { recursive: true, force: true }); }

// ---------- C8 the command lines saved are the commands on screen ----------
const want = { d1_counts: 'node viewer/tools/viewer_verbs.js counts --building Duplex', d2_clashes: 'node viewer/tools/viewer_verbs.js clashes --building Duplex --a ARC --b MEP', d3_shift: 'node edit_cli.js --building HospitalGarage --shift gy10 --move 1.49', d4_path_fwd: 'node viewer/tools/film_path_vis.js --db buildings/Duplex_extracted.db --json', d5_menu: 'node mcp_menu_client.js node bim_mcp.js' };
for (const [id, c] of Object.entries(want)) ok('C8-' + id, 'the saved command differs from the command shown', (rd(id, 'cmd') || '').trim() === c, `"${(rd(id, 'cmd') || '').trim()}"`);

const verdict = fail ? 'FAIL' : vacuous ? 'INCONCLUSIVE' : 'PASS';
L(`§W-CLI verdict=${verdict} pass=${pass} fail=${fail} vacuous=${vacuous}`);
process.exit(fail ? 1 : vacuous ? 2 : 0);
