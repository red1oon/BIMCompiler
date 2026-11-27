#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "CLI in Action" (bim-compiler prompts/FILM_COMMAND_LINE_ERP.md, CH 0): runs every line the film types on a bim-ootb checkout at main, keeps the REAL answers, and after each
// line opens the REAL ERP page (erp/idempiere.html) on the door's database in a headless browser on the CPU: its picture is the film's lower frame, its grid text (read from the page's DOM) is checked
// against what the door lists on the same data (check P). Nothing is typed by hand into the film. The page is OPENED AGAIN on the data after each line: the terminal and the browser are not linked live.
// Asks the legacy server NOTHING. Usage: OOTB=<bim-ootb checkout at main, with #2998> node facts.js      READ out/facts.log after a run.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), { spawnSync } = require('child_process');
const OOTB = process.env.OOTB;
if (!OOTB || !/GRID_BREAK/.test(fs.readFileSync(path.join(OOTB, 'common/door/erp_cli.js'), 'utf8'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at main that has the grid-flag fix (#2998)'); process.exit(2); }
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cia_')), OUT = path.join(__dirname, process.env.OUTD || 'out'), ERP = path.join(OUT, 'erp'); fs.mkdirSync(ERP, { recursive: true });
process.env.BIM_OBJECT_OPLOG = path.join(dir, 'ops.jsonl'); process.env.ERP_OPIMAGE = 'off'; process.chdir(dir);   // the lines read their files from the folder they are run from
const LANGC = { en: 'en_US', zh: 'zh_CN', th: 'th_TH' }[process.env.FILM_LANG || 'en'];
let NAMEPOS = 0; try { const e = require('./out/facts.json'); NAMEPOS = e.states.s2.head.indexOf('Name'); } catch (x) { /* English run: 'Name' is found by its text */ }   // check P: a translated header is read at the English run's position of Name
const L = (m) => console.log('§FACTS ' + m);
const out = { made: new Date().toISOString(), ootb: spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), lines: {}, states: {} };
const { createDoor } = require(path.join(OOTB, 'common/door/door.js')), E = require(path.join(OOTB, 'common/door/erp_cli.js'));
const runDoor = async (id, line, expect) => { process.env.BIM_DOOR_JOURNAL = path.join(dir, 'journal_' + id + '.jsonl'); const j = await createDoor({}).runLine(line, { actor: 'human' }); out.lines[id] = { line, status: j.status }; L(id + ' ' + j.status + ' ' + line);
  if (j.status !== expect) throw new Error(id + ': expected ' + expect + ', got ' + j.status + ' ' + String(j.why || '').slice(0, 200)); return j; };
// the page, served beside the door's database of the moment (erp/film_<n>.db is the only path that is not the checkout's own file)
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.db': 'application/octet-stream' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = /^\/erp\/film_\d+\.db$/.test(u) ? path.join(dir, path.basename(u)) : path.join(OOTB, u);
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(0);
const VIEW = { width: 1280, height: 358, deviceScaleFactor: 1.5 };   // drawn 1.5 times larger: 1920 x 537, the lower frame
let browser, nImg = 0;
const K = 'AST_Asset';
async function state(id, win, note) {   // the door's database now -> a file -> the real page on it -> picture + the grid's own text; and what the door lists on the same data
  const w = process.stderr.write; process.stderr.write = () => true; let O; try { O = await E.boot({}); } finally { process.stderr.write = w; }
  const file = 'film_' + (++nImg) + '.db'; fs.writeFileSync(path.join(dir, file), Buffer.from(O.db.export()));
  const pg = await browser.newPage(); await pg.setViewport(VIEW); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.goto('http://localhost:' + srv.address().port + '/erp/idempiere.html?lang=' + LANGC + '&seed=' + file + '&login=101' + (win ? '&window=' + win : ''), { waitUntil: 'networkidle0', timeout: 120000 });
  await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, { timeout: 60000 });
  if (win) await pg.waitForFunction(() => /Record \d+ of \d+|No records|0 of 0/i.test(document.body.innerText) || document.querySelectorAll('table th').length > 2, { timeout: 60000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  const sc = await pg.evaluate((lg) => { const t = (document.querySelector('#idmp-tree') || document.body).innerText, re = lg === 'zh_CN' ? /[\u4e00-\u9fff]/g : lg === 'th_TH' ? /[\u0e00-\u0e7f]/g : /[a-z]/gi; return { chars: (t.match(re) || []).length, sample: t.split('\n').filter(x => x.trim()).slice(0, 12).join(' / ').slice(0, 220) }; }, LANGC);
  const dom = await pg.evaluate(() => { const tb = Array.from(document.querySelectorAll('table')).filter(t => t.querySelectorAll('th').length > 2)[0]; if (!tb) return { grid: false, who: (document.body.innerText.match(/GardenWorld[^\n]*/) || [''])[0] };
    const head = Array.from(tb.querySelectorAll('th')).map(x => x.innerText.trim()).filter(Boolean), rows = Array.from(tb.querySelectorAll('tbody tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())).filter(r => r.join('').length > 0);
    return { grid: true, head, rows, who: (document.body.innerText.match(/GardenWorld[^\n]*/) || [''])[0], status: (document.body.innerText.match(/Record \d+ of \d+/) || [''])[0] }; });
  await pg.screenshot({ path: path.join(ERP, id + '.png') }); await pg.close();
  const st = { file: 'erp/' + id + '.png', window: win || null, note, pageErrors: errs, who: dom.who, grid: dom.grid, scriptChars: sc.chars, head: dom.head || [], status: dom.status || '' };
  if (dom.grid) { const ni = dom.head.indexOf('Name') >= 0 ? dom.head.indexOf('Name') : NAMEPOS, off = dom.rows.length && dom.rows[0].length > dom.head.length ? dom.rows[0].length - dom.head.length : 0; st.names = dom.rows.map(r => r[ni + off]).filter(x => x != null); st.rows = st.names.length; st.cells = dom.rows.map(r => r.slice(off)); }
  if (win) { const j = await createDoor({}).runLine('mis.list kind=' + K + ' columns=Name limit=50', { actor: 'human' }); st.door = j.status === 'ok' ? j.answer.rows.map(r => r.Name) : []; st.same = dom.grid && JSON.stringify(st.names.slice().sort()) === JSON.stringify(st.door.slice().sort()); }
  out.states[id] = st; L('state ' + id + ' window=' + (win || '-') + ' grid=' + dom.grid + (dom.grid ? ' head=' + dom.head.join('|') + ' rows=' + st.rows + ' names=' + st.names.join(',') : '') + (win ? ' door=' + st.door.join(',') + ' same=' + st.same : '') + ' page_chars_in_' + LANGC + '=' + sc.chars + ' sample="' + sc.sample + '" page_errors=' + errs.length + ' who="' + dom.who + '"');
  return st;
}
(async () => {
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const FILE = K + '.csv';
  const SHEET = ['Column,Type,Mandatory,Default,List', 'Name,String,Y,,', 'PurchaseDate,Date,,,', 'Cost,Amount,,,', 'Condition,List,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor"', 'IsInsured,,,,'];
  fs.writeFileSync(path.join(dir, FILE), SHEET.join('\n') + '\n'); out.sheet = { file: FILE, text: SHEET, columns: SHEET.length - 1 };
  const MORE = ['Name,Cost,Condition', 'Harrow,450,GOOD', 'Seeder,980,FAIR', 'Trailer,2100,GOOD']; fs.writeFileSync(path.join(dir, 'more.csv'), MORE.join('\n') + '\n'); out.more = { file: 'more.csv', text: MORE, rows: MORE.length - 1 };
  await state('s0', null, 'the ERP menu before anything is made');
  const add = await runDoor('add', 'mis.add_window file=' + FILE, 'ok'), win = add.answer.window.id, S = add.answer.opSummary;
  out.add = { table: add.answer.table, window: add.answer.window.name, windowId: win, columns: add.answer.columns, ops: add.answer.ops, roles: S['create:ad_window_access'] || 0 };
  const s1 = await state('s1', win, 'the new window, no row yet'); out.add.gridColumns = s1.head.length;
  const n1 = await runDoor('create', 'mis.new kind=' + K + ' Name=Tractor Cost=1200.50', 'ok'); out.create = { number: n1.answer.number, filled: (n1.answer.filled || []).length }; await state('s2', win, 'one row');
  await runDoor('create2', 'mis.new kind=' + K + ' Name=Plough Cost=300 Condition=FAIR', 'ok'); await state('s3', win, 'two rows');
  const up = await runDoor('update', 'mis.update kind=' + K + ' number=Plough Condition=POOR', 'ok'); out.update = { changed: up.answer.changed }; const s4 = await state('s4', win, 'Plough reads Poor');
  out.update.shown = (s4.cells.filter(r => r.indexOf('Plough') >= 0)[0] || []).filter(c => /^(Good|Fair|Poor)$/.test(c))[0] || null;
  const rf = await runDoor('refuse', 'mis.new kind=' + K + ' Name=Roller Condition=BAD', 'refused'); out.refuse = { why: rf.why, valid: String(rf.why).split(';')[0].split(' - ').slice(3) };
  const ld = await runDoor('load', 'mis.load kind=' + K + ' file=more.csv dry=N', 'ok'); out.load = { rows: ld.answer.rows, loaded: ld.answer.loaded === true ? (ld.answer.keys || []).length : 0 }; await state('s6', win, 'the loaded rows');
  const de = await runDoor('delete', 'mis.delete kind=' + K + ' number=Plough', 'ok'); out.del = { gone: de.answer.gone, name: (de.answer.deleted || {}).number }; await state('s7', win, 'one row fewer');
  const sm = await runDoor('sum', 'mis.sum kind=' + K + ' column=Cost', 'ok'); out.sum = { n: sm.answer.n, sum: sm.answer.sum };
  const ls = await runDoor('list', 'mis.list kind=' + K + ' columns=Name,Cost,Condition', 'ok'); out.list = { rows: ls.answer.rows, total: ls.answer.total };
  await browser.close(); srv.close();
  // check P: every state with a window shows in its grid exactly the names the door lists on the same data; the page reported no error
  const withWin = Object.keys(out.states).filter(k => out.states[k].window), same = withWin.filter(k => out.states[k].same), errs = Object.keys(out.states).reduce((n, k) => n + out.states[k].pageErrors.length, 0), noGrid = withWin.filter(k => !out.states[k].grid);
  const noLang = Object.keys(out.states).filter(k => out.states[k].scriptChars === 0); out.pane = { noLang, states: withWin.length, same: same.length, pageErrors: errs, noGrid };
  ['s1', 's2', 's3', 's4', 's6', 's7'].forEach(k => { out[k] = { rows: out.states[k].rows }; });
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(out, null, 1));
  const verdict = !withWin.length ? 'INCONCLUSIVE' : (noGrid.length || noLang.length ? 'INCONCLUSIVE' : (same.length === withWin.length && errs === 0 ? 'PASS' : 'FAIL'));
  L('PANE_VERDICT ' + verdict + ' the grid of the page names the same rows as the door on ' + same.length + ' of ' + withWin.length + ' states; page_errors=' + errs + (noGrid.length ? ' no grid on: ' + noGrid.join(',') : ''));
  L('wrote out/facts.json add.ops=' + out.add.ops + ' gridColumns=' + out.add.gridColumns + ' rows s1..s7=' + ['s1', 's2', 's3', 's4', 's6', 's7'].map(k => out[k].rows).join('/') + ' update.shown=' + out.update.shown + ' refuse.valid=' + out.refuse.valid.join('/') + ' load=' + out.load.loaded + '/' + out.load.rows + ' sum=' + out.sum.sum + ' over ' + out.sum.n);
  if (verdict !== 'PASS') process.exit(verdict === 'FAIL' ? 1 : 2);
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); try { browser && browser.close(); } catch (x) { /* closed */ } process.exit(1); });
