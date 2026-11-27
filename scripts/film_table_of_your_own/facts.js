#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "A table of your own, in one line" (bim-compiler prompts/FILM_COMMAND_LINE_ERP.md, section FOLLOW-UP FILM): runs every command the film shows on a bim-ootb checkout at main and keeps
// the REAL answers; the screens are the plain output of the real mis.js session code driven by key names. Nothing is typed by hand into the film: cards.js prints out/facts.json. READ out/facts.log after a run.
// Asks the legacy server NOTHING. Usage: OOTB=<bim-ootb checkout at main> node facts.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const OOTB = process.env.OOTB;
if (!OOTB || !fs.existsSync(path.join(OOTB, 'erp/ninja_csv.js'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at main (needs erp/ninja_csv.js: mis.add_window)'); process.exit(2); }
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toy_'));
process.env.BIM_OBJECT_OPLOG = path.join(dir, 'ops.jsonl'); process.chdir(dir);   // mis.add_window reads its file from the folder the line is run from
const L = (m) => console.log('§FACTS ' + m);
const out = { made: new Date().toISOString(), ootb: spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), lines: {} };
const { createDoor } = require(path.join(OOTB, 'common/door/door.js')), MIS = require(path.join(OOTB, 'common/door/mis.js'));
const runDoor = async (id, line, expect) => { process.env.BIM_DOOR_JOURNAL = path.join(dir, 'journal_' + id + '.jsonl'); const j = await createDoor({}).runLine(line, { actor: 'human' }); out.lines[id] = { line, status: j.status }; L(id + ' ' + j.status + ' ' + line);
  if (j.status !== expect) throw new Error(id + ': expected ' + expect + ', got ' + j.status + ' ' + String(j.why || '').slice(0, 200)); return j; };
const play = async (id, opts, keys) => {
  process.env.BIM_DOOR_JOURNAL = path.join(dir, 'journal_' + id + '.jsonl');
  const door = createDoor({}), outs = [], q = keys.slice(), r = await MIS.session(Object.assign({ filters: [], limit: 10 }, opts), async () => q.length ? q.shift() : null, (s) => outs.push(s), door);
  const screens = []; let cur = 'start', lines = [];
  outs.forEach(s => { if (/^-> /.test(s)) lines.push(s.slice(3)); else if (/^key /.test(s)) cur = s.slice(4); else { screens.push({ key: cur, screen: s, lines: lines.slice() }); lines = []; } });
  L('session ' + id + ' keys=' + keys.length + ' screens=' + screens.length + ' door_lines=' + r.lines.length); return { screens, lines: r.lines, state: r.state };
};
(async () => {
  const K = 'AST_Asset', FILE = K + '.csv';
  // ---- the sheet: what a person writes, one line per column
  const SHEET = ['Column,Type,Mandatory,Default,List', 'Name,String,Y,,', 'PurchaseDate,Date,,,', 'Cost,Amount,,,', 'Condition,List,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor"', 'IsInsured,,,,'];
  fs.writeFileSync(path.join(dir, FILE), SHEET.join('\n') + '\n');
  out.sheet = { file: FILE, text: SHEET, columns: SHEET.length - 1 };
  // ---- one line: a look first (writes nothing), then the window
  const dry = await runDoor('dry', 'mis.add_window file=' + FILE + ' dry=Y', 'ok'), add = await runDoor('add', 'mis.add_window file=' + FILE, 'ok'), S = add.answer.opSummary;
  out.add = { table: add.answer.table, window: add.answer.window.name, columns: add.answer.columns, standard: dry.answer.standard.length, standardNames: dry.answer.standard, roles: S['create:ad_window_access'] || 0, ops: add.answer.ops, fields: S['create:ad_field'] || 0, listValues: (add.answer.lists[0] || { values: [] }).values };
  // ---- the empty screen, then the first record by form
  const e = await play('empty', { kind: K }, ['Esc']);
  out.empty = { screen: e.screens[0].screen, says: /no \S+ record yet/.test(e.screens[0].screen) };
  if (!out.empty.says) throw new Error('the empty screen does not say there is no record yet');
  const f = await play('first', { kind: K }, ['+', { text: 'Tractor' }, 'Enter', 'y', 'Esc']), all = f.screens.map(s => s.screen).join('\n');
  const form = f.screens.filter(s => /^New /.test(s.screen))[0], asked = form.screen.split('\n').filter(l => /^( > |   )[* ] \S/.test(l)).length, fill = /(\d+) columns filled by the engine/.exec(all);
  out.first = { asked, filled: fill ? Number(fill[1]) : null, line: f.lines.filter(l => /^mis\.new /.test(l) && !/dry=Y/.test(l))[0], screens: f.screens.map(s => ({ key: s.key, text: s.screen })) };
  if (!out.first.line || out.first.filled == null) throw new Error('the first record was not made by the form');
  // ---- two refusals, in the engine's own words
  const r1 = await runDoor('refuse1', 'mis.new kind=' + K + ' Cost=5', 'refused'), r2 = await runDoor('refuse2', 'mis.new kind=' + K + ' Name=Plough Condition=BAD', 'refused');
  out.refuse1 = { why: r1.why, names: /Name/.test(r1.why) };
  out.refuse2 = { why: r2.why, valid: (String(r2.why).split(';')[0].split(' - ').slice(3)) };
  if (!out.refuse1.names || out.refuse2.valid.length !== out.add.listValues.length) throw new Error('a refusal does not say what the film says it says');
  // ---- who made it and when: the record, read back
  const ls = await runDoor('list', 'mis.list kind=' + K + ' columns=' + K + '_ID,Name,Cost,Condition', 'ok'), id = ls.answer.rows[0][K + '_ID'], rd = await runDoor('read', 'mis.read kind=' + K + ' id=' + id, 'ok'), rec = rd.answer.record;
  out.stamp = { created: rec.created, createdby: rec.createdby, uu: rec[K.toLowerCase() + '_uu'], name: rec.name, condition: rec.condition };
  if (!rec.created || !rec.createdby || !out.stamp.uu) throw new Error('the record carries no Created / CreatedBy / UU');
  // ---- a restart: a separate process on the same op-log still has the table and the row
  const RL = 'mis.list kind=' + K + ' columns=Name,Cost,Condition', rs = spawnSync(process.execPath, [path.join(OOTB, 'common/door/door.js'), '--actor', 'human', RL], { cwd: dir, env: Object.assign({}, process.env, { BIM_DOOR_JOURNAL: path.join(dir, 'journal_restart.jsonl') }), encoding: 'utf8', maxBuffer: 1 << 26 });
  let rj; try { rj = JSON.parse(rs.stdout.trim().split('\n').pop()); } catch (x) { throw new Error('restart: no JSON ' + String(rs.stderr).slice(-200)); }
  out.lines.restart = { line: RL, status: rj.status }; L('restart ' + rj.status + ' (separate process pid ' + rs.pid + ') ' + RL);
  if (rj.status !== 'ok') throw new Error('restart: ' + rj.status);
  out.restart = { total: rj.answer.total, rows: rj.answer.rows, pid: rs.pid, ownPid: process.pid };
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'facts.json'), JSON.stringify(out, null, 1));
  L('wrote out/facts.json sheet.columns=' + out.sheet.columns + ' add.ops=' + out.add.ops + ' standard=' + out.add.standard + ' roles=' + out.add.roles + ' first.asked=' + out.first.asked + ' filled=' + out.first.filled + ' refuse2.valid=' + out.refuse2.valid.join('/') + ' stamp=' + out.stamp.created + ' by ' + out.stamp.createdby + ' restart.total=' + out.restart.total);
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
