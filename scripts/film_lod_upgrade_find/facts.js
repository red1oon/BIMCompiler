// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" (prompts/FILM_LOD_UPGRADE_FIND.md). READ THE LOG after every run; the exit code is not evidence.
// Reads, never runs, the generators: the real § verdict lines are copied VERBATIM from the existing logs (~/Projects/Jebel/lod_sandbox/jpam/log/*.log and .../conn_rules/log/*.log), the Find terms' totals are
// counted on JPAM_film.db with the panel's own SQL (viewer/nf_panel_search.js: name or class LIKE %term%, ORDER BY storey, class, name, LIMIT 50), and the guide link is fetched (§FILM_GUIDE).
// Writes out/facts.json (the capture JSON of capture_viewer.js / capture_modeller.js is merged in by cards.js). Usage: node facts.js <work dir with viewer.json + modeller.json>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const OUT = path.resolve(process.env.OUTD || path.join(__dirname, 'out')); fs.mkdirSync(OUT, { recursive: true });
const J = path.join(os.homedir(), 'Projects/Jebel/lod_sandbox'), JL = J + '/jpam/log/', CL = J + '/conn_rules/log/', DB = J + '/jpam/JPAM_film.db';
const L = (m) => console.log('§FACTS ' + m), F = { made: new Date().toISOString(), cmds: {}, counts: {}, find: {}, lines: {} };
let bad = 0;
const rd = (f) => fs.readFileSync(f, 'utf8').split('\n');
const pick = (file, tag) => { const l = rd(file).find((x) => x.startsWith('§' + tag + ' ')); if (!l) { bad++; L('MISSING ' + tag + ' in ' + file); return null; } F.lines[tag] = { file: path.basename(path.dirname(file)) + '/' + path.basename(file), text: l }; return l; };
// the four commands (arguments as the logs name them: the DB / list paths on the §*_WRITTEN and sha lines; the regex from the change list's own header line) and the verdict lines each one printed
F.cmds.conn = { line: 'python3 gen_connections.py Jebel_conn_rules_run1.db', answers: ['CONN_RULES', 'CONN_CLEAR', 'CONN_CLEAR_POST'].map((t) => pick(CL + 'gen_run1.log', t)) };
F.cmds.layers = { line: 'python3 build_jpam.py ../work/JPAM.db JPAM_changes.txt', answers: ['JPAM_IDENT', 'JPAM_FRAME', 'JPAM_COUNTS'].map((t) => pick(JL + 'build_run1.log', t)) };
F.cmds.rebar = { line: "python3 rebar_from_schedule.py JPAM.db JPAM_rebar.db JPAM_rebar_changes.txt --schedule-json s401_marks.json --mark-regex ':([A-Za-z]+[0-9]+)\\('", answers: ['PJRB_BUILT', 'PJRB_INSIDE', 'PJRB_STATED', 'PJRB_SUMMARY'].map((t) => pick(JL + 'rebar_run1.log', t)) };
F.cmds.gusset = { line: 'python3 gen_gussets.py JPAM_gussets.db JPAM_gussets_changes.txt', answers: ['GUS_COUNTS', 'GUS_RULES', 'GUS_CLEAR_POST'].map((t) => pick(JL + 'gus_run1.log', t)) };
['JPAM_COUNTS', 'PJRB_STATED', 'GUS_COUNTS'].forEach(() => 0);
pick(JL + 'film_db.log', 'FILMDB_COUNTS'); pick(JL + 'film_db.log', 'FILMDB_IDENT'); pick(JL + 'film_db.log', 'FILMDB_DETERMINISM'); pick(JL + 'rebar_run1.log', 'PJRB_IDENT'); pick(JL + 'gus_run1.log', 'GUS_IDENT'); pick(JL + 'rebar_run1.log', 'PJRB_JOIN'); pick(JL + 'gus_run1.log', 'GUS_SIZES');
const num = (l, re) => { const m = re.exec(l || ''); return m ? +m[1] : null; };
const C = F.lines.FILMDB_COUNTS.text; F.counts = { elements: num(C, /elements=(\d+)/), base: num(C, /\(base (\d+)\)/), layer: num(C, /layer=(\d+)/), conn: num(C, /conn=(\d+)/), rebar: num(C, /rebar=(\d+)/), gusset: num(C, /gusset=(\d+)/), added: num(C, /added_total=(\d+)/), element_parts: num(C, /element_parts=(\d+)/) };
const RB = F.lines.PJRB_BUILT.text, ST = F.lines.PJRB_STATED.text, GC = F.lines.GUS_COUNTS.text, CR = F.lines.CONN_RULES.text, CK = F.lines.CONN_CLEAR.text;
F.rebar = { beams: num(RB, /beams_built=(\d+)/), sets: num(RB, /sets_added=(\d+)/), judged: num(ST, /beams_judged=(\d+)/), mismatches: num(ST, /set_mismatches=(\d+)/), beams_affected: num(ST, /beams_affected=(\d+)/), stated_verdict: /-> (\w+)$/.exec(ST.trim())[1] };
F.gusset = { generated: num(GC, /generated=(\d+)/), total: num(GC, /total=(\d+)/), refused: JSON.parse(/refused=(\{[^}]*\})/.exec(GC)[1].replace(/'/g, '"')) }; F.gusset.refused_sum = Object.values(F.gusset.refused).reduce((a, b) => a + b, 0);
F.conn = { joints: num(CR, /joints=(\d+)/), failures: num(CR, /clause_failures=(\d+)/), shipped: num(CK, /shipped=(\d+)/), refused_clash: num(CK, /refused_for_clash=(\d+)/) };
L('counts ' + JSON.stringify(F.counts) + ' rebar=' + JSON.stringify(F.rebar) + ' gusset=' + JSON.stringify(F.gusset) + ' conn=' + JSON.stringify(F.conn));
if (F.gusset.generated + F.gusset.refused_sum !== F.gusset.total) { bad++; L('FAIL gusset generated + refused != total'); }
// the Find terms on the film DB: totals by kind and the first 50 (the panel's own SQL), read-only, by a small python
const py = `
import sqlite3, json, sys
db = sqlite3.connect('file:' + sys.argv[1] + '?mode=ro', uri=True)
BASE = "SELECT m.guid, m.ifc_class, m.element_name, m.storey FROM elements_meta m JOIN element_transforms t ON m.guid = t.guid WHERE (LOWER(m.element_name) LIKE LOWER(?) OR LOWER(m.ifc_class) LIKE LOWER(?))"
kind = lambda g: g[:7] if g.startswith('GEN-') else 'orig'
out = {}
for term in json.loads(sys.argv[2]):
    p = ['%' + term + '%'] * 2
    allr = db.execute(BASE + ' ORDER BY m.storey, m.ifc_class, m.element_name', p).fetchall(); top = allr[:50]
    ca = {}; ct = {}
    for r in allr: ca[kind(r[0])] = ca.get(kind(r[0]), 0) + 1
    for r in top: ct[kind(r[0])] = ct.get(kind(r[0]), 0) + 1
    out[term] = {'total': len(allr), 'by_kind': ca, 'shown50': len(top), 'shown_by_kind': ct, 'first': [top[0][0], top[0][1], top[0][2], top[0][3]] if top else None}
out['_meta'] = {'hosts_with_parts': db.execute('select count(distinct parent_guid) from element_parts').fetchone()[0], 'parts_rows': db.execute('select count(*) from element_parts').fetchone()[0], 'sha_note': 'read-only'}
print(json.dumps(out))`;
// §FILM_CENTRE: the Find flies to element_transforms.center. For the 150 connection parts is it the part's own centre (the geometry's bounds, elements_rtree)? Or the host beam's centre?
const py2 = `
import sqlite3, json, sys, math
db = sqlite3.connect('file:' + sys.argv[1] + '?mode=ro', uri=True)
rows = db.execute("select m.guid, t.center_x, t.center_y, t.center_z, (r.minX+r.maxX)/2, (r.minY+r.maxY)/2, (r.minZ+r.maxZ)/2 from elements_meta m join element_transforms t using(guid) join elements_rtree r on r.id = m.rowid where m.guid like 'GEN-%'").fetchall()
out = {}
for pre in ('GEN-CR-', 'GEN-GU-', 'GEN-LY-', 'GEN-RB-'):
    rs = [r for r in rows if r[0].startswith(pre)]; ds = sorted(math.dist(r[1:4], r[4:7]) for r in rs)
    out[pre] = {'n': len(rs), 'min': ds[0], 'median': ds[len(ds)//2], 'max': ds[-1], 'over_0_5m': sum(1 for d in ds if d > 0.5)}
cr = [r for r in rows if r[0].startswith('GEN-CR-')]; same = 0
for r in cr:
    host = r[0][len('GEN-CR-'):].rsplit('-', 2)[0]; h = db.execute('select center_x, center_y, center_z from element_transforms where guid=?', (host,)).fetchone()
    if h and math.dist(h, r[1:4]) < 1e-6: same += 1
orig = [r for r in db.execute("select t.center_x,t.center_y,t.center_z,(r.minX+r.maxX)/2,(r.minY+r.maxY)/2,(r.minZ+r.maxZ)/2 from elements_meta m join element_transforms t using(guid) join elements_rtree r on r.id=m.rowid where m.guid not like 'GEN-%'")]
out['conn_center_equals_host_center'] = same; out['orig_n'] = len(orig); out['orig_over_1mm'] = sum(1 for r in orig if math.dist(r[:3], r[3:]) > 0.001)
print(json.dumps(out))`;
F.centre = JSON.parse(execFileSync('python3', ['-I', '-c', py2, DB], { encoding: 'utf8' }));
['GEN-CR-', 'GEN-GU-', 'GEN-LY-', 'GEN-RB-'].forEach((k) => { const c = F.centre[k]; L('§FILM_CENTRE ' + k + ' parts=' + c.n + ' element_transforms.center to the part\'s own bounds centre: min ' + c.min.toFixed(3) + ' median ' + c.median.toFixed(3) + ' max ' + c.max.toFixed(3) + ' m; over 0.5 m: ' + c.over_0_5m); });
L('§FILM_CENTRE connection parts whose center equals their HOST BEAM\'s center: ' + F.centre.conn_center_equals_host_center + ' of ' + F.centre['GEN-CR-'].n + '; original elements ' + F.centre.orig_n + ', center off its bounds centre by more than 1 mm: ' + F.centre.orig_over_1mm);
if (F.centre.conn_center_equals_host_center !== F.centre['GEN-CR-'].n) { bad++; L('FAIL not every connection part has its host beam\'s center'); }
const TERMS = ['layer', 'Fin plate', 'reinforcing', 'gusset'];
const R = JSON.parse(execFileSync('python3', ['-I', '-c', py, DB, JSON.stringify(TERMS)], { encoding: 'utf8' })); F.find = R;
TERMS.forEach((t) => L('find term="' + t + '" total=' + R[t].total + ' by_kind=' + JSON.stringify(R[t].by_kind) + ' shown(LIMIT 50)=' + R[t].shown50 + ' first=' + R[t].first[0] + ' | ' + R[t].first[1] + ' | ' + R[t].first[2].slice(0, 60)));
const exp = { 'layer': ['GEN-LY-', F.counts.layer], 'Fin plate': ['GEN-CR-', 50], 'reinforcing': ['GEN-RB-', F.counts.rebar], 'gusset': ['GEN-GU-', 2] };
TERMS.forEach((t) => { const got = R[t].by_kind[exp[t][0]] || 0; const ok = got === exp[t][1] && R[t].total === exp[t][1]; if (!ok) { bad++; L('FAIL term=' + t + ' kind ' + exp[t][0] + '=' + got + ' total=' + R[t].total + ' expected=' + exp[t][1]); } });
// the guide link (house style: always a guide link, checked): HTTP 200 + anchor id present + whether the page describes the film's content at all
const GUIDE = 'https://red1oon.github.io/BIMCompiler/BIMUserGuide/', ANCH = 'find-panel-search-voice-query-and-axis-lenses';
let page = '', http = 0;
try { page = execFileSync('curl', ['-sS', '-L', '--max-time', '60', '-w', '\n%{http_code}', GUIDE], { encoding: 'utf8', maxBuffer: 1 << 26 }); http = +page.slice(page.lastIndexOf('\n') + 1); page = page.slice(0, page.lastIndexOf('\n')); } catch (e) { L('guide fetch failed ' + String(e).slice(0, 120)); }
const plain = page.replace(/<[^>]+>/g, ' '), cover = {};
['fin plate', 'gusset', 'rebar', 'reinforc', 'element_parts', 'parts view', 'rule-based', 'LOD400 Upgrade'].forEach((k) => { cover[k] = (plain.toLowerCase().split(k.toLowerCase()).length - 1); });
const lodSec = /LOD400 Upgrade[\s\S]{0,700}/.exec(plain);
F.guide = { url: GUIDE, http, anchor_find_panel: page.indexOf('id="' + ANCH + '"') >= 0, mentions: cover, lod_section_text: lodSec ? lodSec[0].replace(/\s+/g, ' ').slice(0, 330) : null,
  covers_the_added_work: (cover['fin plate'] + cover['gusset'] + cover['rebar'] + cover['reinforc'] + cover['element_parts'] + cover['rule-based']) > 0 };
L('§FILM_GUIDE url=' + GUIDE + ' http=' + http + ' anchor=' + (F.guide.anchor_find_panel ? 'Y' : 'N') + ' (the Find panel section only) mentions=' + JSON.stringify(cover) + ' covers_the_added_work=' + (F.guide.covers_the_added_work ? 'Y' : 'N'));
F.guide.covers_the_added_work_word = F.guide.covers_the_added_work ? 'yes' : 'no';
// the capture JSON (when present): the numbers the narration speaks that only the browser knows
const WORK = process.argv[2] && path.resolve(process.argv[2]);
if (WORK && fs.existsSync(path.join(WORK, 'viewer.json'))) { const V = JSON.parse(fs.readFileSync(path.join(WORK, 'viewer.json'), 'utf8')), pv = V.parts_view_line || '';
  F.viewer = { hostsHidden: num(pv, /hostsHidden=(\d+)/), partsShown: num(pv, /partsShown=(\d+)/), elements: num(pv, /elements=(\d+)/), isolate_start: V.isolate_at_start, isolate_after_find_open: V.isolate_after_find_open, ghost_changes: V.iso, isolate_end: V.isolate_end };
  Object.keys(V.beats).forEach((k) => { const b = V.beats[k]; F.viewer[k] = { term: b.term, panel: String(parseInt(b.panel.count, 10)), count_text: b.panel.count, rows: b.panel.items, guid: b.guid, cls: b.target.cls, storey: b.target.storey, name: b.target.name, pick_text: b.pick_text, panel_check_ok: b.panel_check.ok, find_fly_miss_m: b.fly.miss_m, miss_round1: b.fly.miss_m.toFixed(1), target_to_geometry_m: b.fly.miss_m, camera_to_element_m: b.fly.camera_to_element_m, info_class: b.panel_after.info_class }; });
  L('viewer ' + JSON.stringify({ hostsHidden: F.viewer.hostsHidden, partsShown: F.viewer.partsShown, isolate_start: F.viewer.isolate_start, after_find_open: F.viewer.isolate_after_find_open })); }
else L('no viewer.json yet (run capture_viewer.js first)');
if (WORK && fs.existsSync(path.join(WORK, 'modeller.json'))) { const M = JSON.parse(fs.readFileSync(path.join(WORK, 'modeller.json'), 'utf8')), mp = M.mod_parts_view_line || '';
  F.modeller = { seed_line: M.seed_line, mod_parts_view_line: mp, committed: num(M.seed_line, /committed=(\d+)/), hostsHidden: num(mp, /hostsHidden=(\d+)/), partsSeeded: num(mp, /partsSeeded=(\d+)/), generatedSeeded: num(mp, /generatedSeeded=(\d+)/), beats: M.beats };
  L('modeller committed=' + F.modeller.committed + ' hostsHidden=' + F.modeller.hostsHidden + ' partsSeeded=' + F.modeller.partsSeeded + ' generatedSeeded=' + F.modeller.generatedSeeded); }
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
L('VERDICT ' + (bad ? 'FAIL' : 'PASS') + ' bad=' + bad + ' lines=' + Object.keys(F.lines).length); process.exit(bad ? 1 : 0);
