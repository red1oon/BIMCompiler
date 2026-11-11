#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "Command Line ERP" (bim-compiler prompts/FILM_COMMAND_LINE_ERP.md): runs every command the film shows on a bim-ootb checkout at main and keeps the REAL answers; the screens are the
// plain output of the real mis.js session code driven by key names. Nothing is typed by hand into the film: cards.js prints out/facts.json. READ out/facts.log after a run.
// Needs the legacy test stack UP (read only: legacy.status, erp.compare; this film never refreshes it) and the legacy order 50981 (the 2026-11-10 hand check).
// Usage: OOTB=<bim-ootb checkout at main> COMPILER=<bim-compiler checkout> node facts.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const OOTB = process.env.OOTB, COMP = process.env.COMPILER || path.join(os.homedir(), 'bim-compiler');
if (!OOTB || !fs.existsSync(path.join(OOTB, 'common/door/mis.js'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at main (needs common/door/mis.js)'); process.exit(2); }
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cle_'));
process.env.BIM_OBJECT_OPLOG = path.join(dir, 'ops.jsonl'); process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';
const L = (m) => console.log('§FACTS ' + m);
const out = { made: new Date().toISOString(), ootb: spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), lines: {} };
const { createDoor } = require(path.join(OOTB, 'common/door/door.js')), MIS = require(path.join(OOTB, 'common/door/mis.js'));
let jn = 0;
const runDoor = async (id, line, actor, request) => { process.env.BIM_DOOR_JOURNAL = path.join(dir, 'journal_' + id + '.jsonl'); const j = await createDoor({}).runLine(line, Object.assign({ actor: actor || 'human' }, request ? { request } : {})); out.lines[id] = { line, status: j.status }; L(id + ' ' + j.status + ' ' + line); return j; };
// a real session of mis.js's own session(): keys in (a string is a key name, {text} is typed text), the screens out (plain text, as --plain prints them)
const play = async (id, opts, keys) => {
  process.env.BIM_DOOR_JOURNAL = path.join(dir, 'journal_' + id + '.jsonl');
  const door = createDoor({}), outs = [], q = keys.slice(), r = await MIS.session(Object.assign({ filters: [], limit: 10 }, opts), async () => q.length ? q.shift() : null, (s) => outs.push(s), door);
  const screens = []; let cur = 'start', lines = [];
  outs.forEach(s => { if (/^-> /.test(s)) lines.push(s.slice(3)); else if (/^key /.test(s)) cur = s.slice(4); else { screens.push({ key: cur, screen: s, lines: lines.slice() }); lines = []; } });
  L('session ' + id + ' keys=' + keys.length + ' screens=' + screens.length + ' door_lines=' + r.lines.length); return { screens, lines: r.lines, state: r.state };
};
(async () => {
  const CSV = path.join(dir, 'film_partners.csv'), K = 'C_BPartner';
  // ---- legacy first: the film needs it UP (read only)
  const st = await runDoor('status', 'legacy.status'); if (st.status !== 'ok' || st.answer.verdict !== 'UP') throw new Error('the legacy stack is not UP: ' + JSON.stringify(st.answer && st.answer.summary));
  out.legacy = { verdict: st.answer.verdict, summary: st.answer.summary };
  // ---- the list screen
  const a = await play('list', { kind: K, limit: 4 }, ['Down', 'Right', 'Esc']);
  const tot = /shown (\d+)-(\d+) of (\d+)/.exec(a.screens[0].screen);
  out.list = { kind: K, total: Number(tot[3]), shown: Number(tot[2]), screens: a.screens.map(s => ({ key: s.key, text: s.screen })) };
  out.keys = { lines: a.lines.length, moves: 2, session: a.lines, willRun: (/the line it will run: (.*)/.exec(a.screens[2].screen) || [])[1] };
  // ---- a new record by form
  const dry = await runDoor('newdry', 'mis.new kind=' + K + ' dry=Y');
  const b = await play('new', { kind: K, filters: [{ col: 'value', value: 'FILM001' }] }, ['+', { text: 'FILM001' }, 'Tab', { text: 'Film Partner' }, 'Enter', 'y', 'Esc']);
  const fill = /(\d+) columns filled by the engine/.exec(b.screens.map(s => s.screen).join('\n'));
  out.new = { mandatory: dry.answer.mandatory.length, mandatoryNames: dry.answer.mandatory, defaulted: dry.answer.defaulted, filled: fill ? Number(fill[1]) : null, lines: b.lines, screens: b.screens.map(s => ({ key: s.key, text: s.screen })) };
  // ---- an edit: only the changed column is sent
  const probe = await play('editprobe', { kind: K, filters: [{ col: 'value', value: 'FILM001' }] }, ['Enter']), nf = probe.state.form.fields.length;
  const c = await play('edit', { kind: K, filters: [{ col: 'value', value: 'FILM001' }] }, ['Enter', 'Tab', { text: 'Film Partner Ltd' }].concat(new Array(nf - 1).fill('Enter'), ['y', 'Esc']));
  const upd = c.lines.filter(l => /^mis\.update/.test(l));
  out.edit = { fields: nf, line: upd[0], changed: upd[0] ? (upd[0].replace(/^mis\.update kind=\S+ id=\d+ /, '').match(/(^| )[A-Za-z_0-9]+=/g) || []).length : 0, screens: c.screens.map(s => ({ key: s.key, text: s.screen })) };
  // ---- a delete the engine refuses (the standard partner is used by other records)
  const d = await play('delete', { kind: K, filters: [{ col: 'c_bpartner_id', value: '112' }] }, ['Right', 'Enter', 'y', 'Esc']);
  out.delete = { screens: d.screens.map(s => ({ key: s.key, text: s.screen })), refused: /refused: [^\n]*dependent record/.test(d.screens.map(s => s.screen).join('\n')) };
  // ---- a CSV: preview, then the good lines
  fs.writeFileSync(CSV, 'Value,Name,C_BP_Group_ID\nFILM101,Film Two,Standard Customers\nFILM102,Film Three,Nowhere\n');
  const pv = await runDoor('load_preview', 'mis.load kind=' + K + ' file=' + CSV), ld = await runDoor('load_ok', 'mis.load kind=' + K + ' dry=N file=' + CSV.replace(/\.csv$/, '.ok.csv'));
  out.load = { rows: pv.answer.rows, ok: pv.answer.ok, rejected: pv.answer.rejected.length, why: pv.answer.rejected[0] && pv.answer.rejected[0].why[0], loaded: ld.answer.loaded, keys: ld.answer.keys.length, csv: fs.readFileSync(CSV, 'utf8').trim().split('\n'), rejectedCsv: fs.readFileSync(CSV.replace(/\.csv$/, '.rejected.csv'), 'utf8').trim().split('\n') };
  // ---- an AI: the same line, held; a person confirms; it is written
  process.env.BIM_DOOR_JOURNAL = path.join(dir, 'journal_ai.jsonl');
  const AIL = 'mis.new kind=' + K + ' Value=FILMAI Name="Asked by an AI"';
  const ai = await createDoor({}).runLine(AIL, { actor: 'ai', request: 'film-ai' }); out.lines.ai = { line: AIL, status: ai.status }; L('ai ' + ai.status + ' ' + AIL);
  const cf = spawnSync(process.execPath, [path.join(OOTB, 'common/door/door.js'), '--confirm', 'film-ai'], { env: Object.assign({}, process.env), encoding: 'utf8', maxBuffer: 1 << 26 }); let cj; try { cj = JSON.parse(cf.stdout.trim().split('\n').pop()); } catch (e) { throw new Error('confirm: no JSON ' + cf.stderr.slice(-200)); }
  out.ai = { line: AIL, status: ai.status, why: String(ai.why || '').slice(0, 160), confirmStatus: cj.status, confirmedBy: cj.actor, number: cj.answer && cj.answer.number };
  L('confirm ' + cj.status + ' by ' + cj.actor);
  // ---- the same door asks legacy iDempiere: our order against the real one
  const h = await runDoor('new_order', 'mis.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101'); if (h.status !== 'ok') throw new Error('mis.new order: ' + h.why);
  await runDoor('new_line', 'mis.new kind=C_OrderLine order=' + h.answer.number + ' m_product_id=137 qtyentered=2');
  const cmp = await runDoor('compare', 'erp.compare kind=Order number=' + h.answer.number + ' legacy=50981'); if (cmp.status !== 'ok') throw new Error('erp.compare: ' + cmp.why);
  out.compare = { twinNumber: h.answer.number, legacyNumber: cmp.answer.legacy.number, match: cmp.answer.cells.match, diff: cmp.answer.cells.diff, nullVsDefault: cmp.answer.cells.nullVsDefault, n: cmp.answer.cells.n, summary: cmp.answer.summary };
  // ---- the One Door page, read from the figure: who is built, who is planned (its own words)
  const svg = fs.readFileSync(path.join(COMP, 'docs/figs/one_door.svg'), 'utf8'), txt = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1].trim());
  const actors = ['AI', 'Person', 'Mailbox', 'Phone', 'Device'], planned = [], built = [];
  actors.forEach(n => { const i = txt.indexOf(n), sub = txt[i + 1]; (/planned, not built/.test(sub) ? planned : built).push(n); });
  out.onedoor = { title: txt[0], built, planned, caveat: 'planned, not built', stages: txt.filter(x => /^\d\s/.test(x)).slice(0, 4) };
  // ---- light: measured from the files
  const wc = (f) => fs.readFileSync(path.join(OOTB, f), 'utf8').split('\n').length - 1, req = (f) => (fs.readFileSync(path.join(OOTB, f), 'utf8').match(/require\(/g) || []).length;
  const vj = JSON.parse(fs.readFileSync(path.join(OOTB, 'common/door/verbs.json'), 'utf8')).verbs, real = vj.filter(v => !v.alias_of);
  out.light = { coreFile: 'common/door/mis_core.js', coreLines: wc('common/door/mis_core.js'), coreBytes: fs.statSync(path.join(OOTB, 'common/door/mis_core.js')).size, coreRequires: req('common/door/mis_core.js'), driverFile: 'common/door/mis.js', driverLines: wc('common/door/mis.js'), driverRequires: req('common/door/mis.js') };
  out.verbs = real.length; out.misVerbs = real.filter(v => /^mis\./.test(v.verb)).length;
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'facts.json'), JSON.stringify(out, null, 1));
  L('wrote out/facts.json list.total=' + out.list.total + ' new=' + out.new.mandatory + '/' + out.new.filled + ' edit.changed=' + out.edit.changed + ' load=' + out.load.rows + '/' + out.load.ok + '/' + out.load.rejected + ' ai=' + out.ai.status + '>' + out.ai.confirmStatus + ' compare=' + out.compare.match + '/' + out.compare.diff + ' built=' + out.onedoor.built + ' planned=' + out.onedoor.planned + ' core=' + out.light.coreLines + ' verbs=' + out.verbs);
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
