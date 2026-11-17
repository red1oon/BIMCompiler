#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "MIS Menu Driven" (bim-compiler prompts/FILM_COMMAND_LINE_ERP.md, CH 2): runs every line and every key the film types on a bim-ootb checkout at main, keeps the REAL
// answers and the REAL screens (common/door/mis.js menuSession, the same code `door.js /M` runs), and after each step opens the REAL ERP page (erp/idempiere.html) on the door's database in a headless
// browser on the CPU (owner's permission for this film, 2026-11-15): its picture is the lower frame; its grid text and its own menu line (§IDEMPIERE menu … visibleWindows) are checked against the door.
// The page is OPENED AGAIN on the data after each step: the terminal and the browser are not linked live. For the last card it measures each door line's time, runs W-MIS-MENU and reads the
// licence and lineage from the checkout. Asks the legacy server NOTHING. Usage: OOTB=<bim-ootb checkout at main, with #3053> node facts.js      READ out/facts.log after a run.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), { spawnSync } = require('child_process');
const OOTB = process.env.OOTB;
if (!OOTB || !fs.existsSync(path.join(OOTB, 'common/door/menu_core.js'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at main that has the terminal menu (#3053)'); process.exit(2); }
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mmd_')), OUT = path.join(__dirname, process.env.OUTD || 'out'), ERP = path.join(OUT, 'erp'); fs.mkdirSync(ERP, { recursive: true });
process.env.BIM_OBJECT_OPLOG = path.join(dir, 'ops.jsonl'); process.env.ERP_OPIMAGE = 'off'; process.env.BIM_DOOR_JOURNAL = path.join(dir, 'journal.jsonl'); process.chdir(dir);
const LANGC = { en: 'en_US', zh: 'zh_CN', th: 'th_TH', ms: 'ms_MY' }[process.env.FILM_LANG || 'en'], ROLE = '102', K = 'C_BP_Group', WIN = 192;
const L = (m) => console.log('§FACTS ' + m);
const out = { made: new Date().toISOString(), ootb: spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), lines: {}, states: {}, ms: [] };
const { createDoor } = require(path.join(OOTB, 'common/door/door.js')), E = require(path.join(OOTB, 'common/door/erp_cli.js')), MIS = require(path.join(OOTB, 'common/door/mis.js'));
const runDoor = async (id, line, expect) => { const j = await createDoor({}).runLine(line, { actor: 'human' }); out.lines[id] = { line, status: j.status, ms: j.ms }; out.ms.push(j.ms); L(id + ' ' + j.status + ' ms=' + j.ms + ' ' + line);
  if (j.status !== expect) throw new Error(id + ': expected ' + expect + ', got ' + j.status + ' ' + String(j.why || '').slice(0, 200)); return j; };
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.db': 'application/octet-stream' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = /^\/erp\/film_\d+\.db$/.test(u) ? path.join(dir, path.basename(u)) : path.join(OOTB, u);
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(0);
const VIEW = { width: 1280, height: 358, deviceScaleFactor: 1.5 };   // drawn 1.5 times larger: 1920 x 537, the lower frame
let browser, nImg = 0;
async function state(id, win, note) {   // the door's database now -> a file -> the real page on it -> picture, its grid text and its own menu line
  const w = process.stderr.write; process.stderr.write = () => true; let O; try { O = await E.boot({}); } finally { process.stderr.write = w; }
  const file = 'film_' + (++nImg) + '.db'; fs.writeFileSync(path.join(dir, file), Buffer.from(O.db.export()));
  const pg = await browser.newPage(); await pg.setViewport(VIEW); const errs = [], menuLines = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); pg.on('console', m => { const t = m.text(); if (/^§IDEMPIERE menu /.test(t)) menuLines.push(t); });
  await pg.goto('http://localhost:' + srv.address().port + '/erp/idempiere.html?lang=' + LANGC + '&seed=' + file + '&login=101' + (win ? '&window=' + win : ''), { waitUntil: 'networkidle0', timeout: 120000 });
  await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, { timeout: 60000 });
  if (win) await pg.waitForFunction(() => /Record \d+ of \d+|No records|0 of 0/i.test(document.body.innerText) || document.querySelectorAll('table th').length > 2, { timeout: 60000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  const dom = await pg.evaluate(() => { const role = (document.body.innerText.match(/scoped to ([^\n·—]+)/) || [])[1] || null, rec = document.body.innerText.match(/Record (\d+) of (\d+)/);
    return { role, records: rec ? +rec[2] : null, leaves: Array.from(document.querySelectorAll('#idmp-tree .idmp-row.leaf')).map(r => ({ id: +r.dataset.menuId, name: (r.querySelector('.nm') || r).innerText.trim() })) }; });
  await pg.screenshot({ path: path.join(ERP, id + '.png') }); await pg.close();
  const ml = menuLines.pop() || '', vw = /visibleWindows=(\d+)\/(\d+)/.exec(ml);
  const st = { file: 'erp/' + id + '.png', window: win || null, note, pageErrors: errs, pageRole: dom.role ? dom.role.trim() : null, pageMenu: vw ? { visibleWindows: +vw[1], totalWindows: +vw[2] } : null, records: dom.records, pageLeaves: dom.leaves };
  if (win) { const j = await createDoor({}).runLine('mis.list kind=' + K + ' columns=Name limit=50 role=' + ROLE, { actor: 'human' }); st.door = j.status === 'ok' ? j.answer.rows.map(r => r.Name) : []; st.rows = dom.records; st.same = dom.records != null && dom.records === st.door.length; }
  out.states[id] = st; L('state ' + id + ' window=' + (win || '-') + (win ? ' page_records=' + dom.records + ' door(role ' + ROLE + ')=' + st.door.join(',') + ' same=' + st.same : '') + ' page_role=' + st.pageRole + ' page_menu=' + JSON.stringify(st.pageMenu) + ' page_leaves=' + dom.leaves.length + ' page_errors=' + errs.length);
  return st;
}
const trim = (s) => s.split('\n').filter(l => !/^key /.test(l));
(async () => {
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  await state('s0', null, 'the ERP page and its menu, before');
  // 1-2: the single lines of before still work, a read and a write
  const l1 = await runDoor('still1', 'mis.list kind=' + K + ' columns=Value,Name role=' + ROLE, 'ok'); out.still1 = { rows: l1.answer.rows.map(r => ({ Value: r.Value, Name: r.Name })), total: l1.answer.total };
  const s1 = await state('s1', WIN, 'the Business Partner Group window');
  const n2 = await runDoor('still2', 'mis.new kind=' + K + ' Value=FILM Name="Film Partners" role=' + ROLE, 'ok'); out.still2 = { number: n2.answer.number, id: n2.answer.id };
  const s2 = await state('s2', WIN, 'one group more');
  out.still1.windowRows = s1.rows; out.still2.windowRows = s2.rows;
  // 3-6: the menu screen, key by key, the REAL screens (the same menuSession `door.js /M` runs)
  const m = await runDoor('menuRead', 'mis.menu role=' + ROLE, 'ok'); out.menu = { windows: m.answer.windows, leaves: m.answer.leaves, folders: m.answer.folders, role: m.answer.role };
  const f = await runDoor('findRead', 'mis.menu role=' + ROLE + ' find=partner', 'ok'); out.find = { items: f.answer.items.length };
  const KEYS = [['menu', '__start'], ['find', '/'], ['find', 'p'], ['find', 'a'], ['find', 'r'], ['find', 't'], ['find', 'n'], ['find', 'e'], ['find', 'r'], ['find', 'Enter'], ['open', '3'], ['back', 'Esc'], ['back', 'Esc'], ['back', 'q']];
  const seq = [], queue = KEYS.slice(1).map(x => x[1]); let cur = 'menu';
  const sink = (s) => { if (/^key /.test(s)) { const kk = s.slice(4); const nx = KEYS.find((x, i) => i > 0 && !x.used && x[1] === kk); if (nx) { nx.used = true; cur = nx[0]; } seq.push({ beat: cur, key: kk }); return; } if (/^-> /.test(s)) { seq.push({ beat: cur, line: s.slice(3) }); if (!/^\(open /.test(s.slice(3))) { /* a door line */ } return; } seq.push({ beat: cur, screen: trim(s) }); };
  const t0 = Date.now(), r = await MIS.menuSession({ menu: true, role: ROLE, limit: 6 }, () => Promise.resolve(queue.length ? queue.shift() : null), sink, createDoor({})); out.screenMs = Date.now() - t0;
  out.seq = seq; out.opened = r.opened; out.screenLines = r.lines;
  L('screen opened=' + JSON.stringify(r.opened) + ' door_lines=' + r.lines.length + ' screens=' + seq.filter(x => x.screen).length + ' phase=' + r.state.phase + ' ms=' + out.screenMs);
  const listScreen = seq.filter(x => x.beat === 'open' && x.screen).pop(), shown = listScreen ? listScreen.screen.join('\n') : '';
  await state('sM', null, 'the menu, after');
  const s3 = await state('s3', WIN, 'the window the screen opened');
  out.open = { kind: r.opened[0] || null, screenNames: s3.door.filter(n => shown.indexOf(n) >= 0), pageRecords: s3.records };
  // the last card: proof read from a run made now, credits from the checkout
  const wm = spawnSync(process.execPath, [path.join(OOTB, 'common/door/tests/witness_mis_menu.js')], { encoding: 'utf8', cwd: OOTB, env: Object.assign({}, process.env, { BIM_OBJECT_OPLOG: path.join(dir, 'w.ops.jsonl'), BIM_DOOR_JOURNAL: path.join(dir, 'w.j.jsonl') }) });
  const wv = (wm.stdout.match(/^§WITNESS_MIS_MENU .*$/m) || [''])[0], u1 = (wm.stdout.match(/U1 .*door entries=(\d+) sql=(\d+) · windows door=(\d+) sql=(\d+)/) || []), u2 = (wm.stdout.match(/role 102: (\d+) \(want (\d+)\) · role 103: (\d+) \(want (\d+)\)/) || []);
  out.proof = { menuWitness: wv, pass: +(wv.match(/pass=(\d+)/) || [])[1], fail: +(wv.match(/fail=(\d+)/) || [])[1], entries: +u1[1], entriesSql: +u1[2], windows: +u1[3], windowsSql: +u1[4], role102: +u2[1], role103: +u2[3] };
  const lic = fs.readFileSync(path.join(OOTB, 'LICENSE'), 'utf8').split('\n'), readme = fs.readFileSync(path.join(OOTB, 'README.md'), 'utf8');
  out.credits = { licence: lic[0].trim(), copyright: (lic.find(x => /^Copyright/.test(x)) || '').trim(), lineage: (readme.match(/folded from the ([^,]+?),/) || [])[1] || null };
  out.costs = { msMin: Math.min.apply(null, out.ms), msMax: Math.max.apply(null, out.ms), lines: out.ms.length, node: process.version };
  await browser.close(); srv.close();
  // check P: the page's grid names the door's rows on every window state; the page's own menu count = the door's for the same role; no page error
  const withWin = Object.keys(out.states).filter(k => out.states[k].window), same = withWin.filter(k => out.states[k].same), errs = Object.keys(out.states).reduce((n, k) => n + out.states[k].pageErrors.length, 0);
  // the menu: every door entry is on the page; an entry only the page has must be one the dictionary does not hold (a browser plugin's), named on the card
  const doorLeaves = []; (function w(ns) { ns.forEach(n => { if (n.children) w(n.children); else doorLeaves.push(n.id); }); })(m.answer.tree);
  const pl = out.states.sM.pageLeaves, pIds = new Set(pl.map(x => x.id)), dIds = new Set(doorLeaves), onlyDoor = doorLeaves.filter(i => !pIds.has(i)), onlyPage = pl.filter(x => !dIds.has(x.id));
  const inDict = (i) => spawnSync('sqlite3', ['-readonly', path.join(OOTB, 'erp/ad_seed.db'), 'SELECT count(*) FROM ad_menu WHERE ad_menu_id=' + Number(i)], { encoding: 'utf8' }).stdout.trim() !== '0';
  const pluginOnly = onlyPage.filter(x => !inDict(x.id)), pm = out.states.sM.pageMenu, menuSame = !!pm && onlyDoor.length === 0 && pluginOnly.length === onlyPage.length && out.states.sM.pageRole === out.menu.role.name;
  out.pane = { states: withWin.length, same: same.length, pageErrors: errs, menuSame, pageMenu: pm, pageRole: out.states.sM.pageRole, doorEntries: doorLeaves.length, pageEntries: pl.length, onlyDoor: onlyDoor.length, pluginEntries: pluginOnly.map(x => x.name) };
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(out, null, 1));
  const verdict = !withWin.length || !pm ? 'INCONCLUSIVE' : (same.length === withWin.length && errs === 0 && menuSame && out.proof.fail === 0 && out.opened[0] === K ? 'PASS' : 'FAIL');
  L('PANE_VERDICT ' + verdict + ' grids=' + same.length + '/' + withWin.length + ' page_entries=' + pl.length + ' door_entries=' + doorLeaves.length + ' only_door=' + onlyDoor.length + ' only_page=' + JSON.stringify(onlyPage) + ' (not in the dictionary: ' + pluginOnly.length + ') role=' + out.states.sM.pageRole + ' menuSame=' + menuSame + ' page_errors=' + errs + ' opened=' + out.opened.join(','));
  L('wrote facts.json still1.rows=' + out.still1.rows.length + ' still2.windowRows=' + out.still2.windowRows + ' menu=' + JSON.stringify(out.menu) + ' find.items=' + out.find.items + ' proof=' + JSON.stringify(out.proof) + ' costs=' + JSON.stringify(out.costs) + ' credits=' + JSON.stringify(out.credits));
  if (verdict !== 'PASS') process.exit(verdict === 'FAIL' ? 1 : 2);
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); try { browser && browser.close(); } catch (x) { /* closed */ } process.exit(1); });
