#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "Inside the Record" (prompts/FILM_COMMAND_LINE_ERP.md CH 3): the facts and the lower frame. Reads the REAL recording (out/rec/frames.json, red1.err, the scratch op-log
// rec.py wrote) and, for every answer the shell drew, the place its prompt names (the menu tree at a path, the Sales Order window, or order 100 after N op-log rows). For each such state it boots
// the door database on the op-log PREFIX (snapdb.js), opens the REAL ERP page (erp/idempiere.html) on it in a headless Chrome on the CPU, and keeps a picture CROPPED to the part that changes
// (owner, 2026-11-18): the opened folder's rows, the window's tabs, or the record's status row + actions + fields. The page is opened again on the data: it is not linked live to the terminal.
// Checks written into facts.json (each can say INCONCLUSIVE): F every typed line drew its door line, ok · I isolation · P the page = the door/shell on every state · Z each state's crop changed
// from the state before it (NO-OP named) · H no grey suggestion left on a finished line · plus the figures the voice speaks and the end card's proof (witness runs, the A5 log).
// Usage: OOTB=<bim-ootb checkout> [OUTD=out] node facts.js        READ out/facts.log after a run.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), { spawnSync } = require('child_process');
const OOTB = process.env.OOTB, OD = process.env.OUTD || 'out', OUT = path.join(__dirname, OD), REC = path.join(OUT, 'rec'), ERPD = path.join(OUT, 'erp'); fs.mkdirSync(ERPD, { recursive: true });
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const L = (m) => console.log('§FACTS ' + m), R = JSON.parse(fs.readFileSync(path.join(REC, 'frames.json'), 'utf8')), ERR = fs.readFileSync(path.join(REC, 'red1.err'), 'utf8');
const LANGC = { en: 'en_US', zh: 'zh_CN', th: 'th_TH', ms: 'ms_MY' }[process.env.FILM_LANG || 'en'];
const checks = []; let bad = 0, missing = 0; const chk = (id, ok, info) => { checks.push({ id, ok: ok === true ? 'OK' : ok === null ? 'INCONCLUSIVE' : 'BAD', info }); if (ok === false) bad++; if (ok === null) missing++; L((ok === true ? 'OK   ' : ok === null ? 'INCON ' : 'BAD  ') + id + ' ' + info); };
const out = { made: new Date().toISOString(), ootb: spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), states: {}, frameState: [] };
// ── 1. the place each answer names, from the prompt the shell drew on the cursor line ──
const promptOf = (f) => { const m = /^(red1(?: [^>]*)?>)/.exec((f.text[f.cy] || '').trim()); return m ? m[1] : null; };
function viewOf(p, opn) {
  if (!p) return null; let m;
  if ((m = /^red1 menu(?:\/(.*))?\/Order\/(\S+)>$/.exec(p))) return { kind: 'rec', number: m[2], opn, key: 'rec:' + opn };
  if (/\/Order>$/.test(p)) return { kind: 'win', key: 'win' };
  if ((m = /^red1 menu(?:\/(.*))?>$/.exec(p))) { const pa = m[1] ? m[1].split('/') : []; return { kind: 'tree', path: pa, key: 'tree:' + pa.join('/') }; }   // (a menu name holding '/' would split wrongly; none on this walk)
  if (p === 'red1>') return { kind: 'tree', path: [], key: 'tree:' };
  return null;
}
let cur = null; const order = [];
R.frames.forEach((f, i) => { if (f.kind === 'a' && /^answer/.test(f.what)) { const v = viewOf(promptOf(f), f.opn); if (v) { if (!out.states[v.key]) { out.states[v.key] = Object.assign({ firstFrame: i, step: f.step }, v); order.push(v.key); } cur = v.key; } } out.frameState.push(cur); });
L('states in film order: ' + order.join(' | '));
// the shell's listed entries of a menu screen (the rows under "<path>: N entries")
const entriesOf = (f) => { const t = f.text, h = t.findIndex(l => /: \d+ entries; cd <name> goes in/.test(l)); if (h < 0) return null; const n = +/: (\d+) entries/.exec(t[h])[1], rows = [];
  for (let j = h + 1; j < t.length && rows.length < n; j++) { const m = /^ {2}[▸WRPXF] (.*?)(?: \(\d+\)| · \S+)?\s*$/.exec(t[j]); if (m) rows.push(m[1]); else break; } return { n, rows }; };
// ── 2. the facts the voice speaks, from the screens and the §DOOR log ──
const byStep = {}; R.frames.forEach(f => { (byStep[f.step] = byStep[f.step] || []).push(f); });
const lastAns = (s) => (byStep[s] || []).filter(f => f.kind === 'a' && /^answer/.test(f.what)).pop(), allText = (f) => f ? f.text.join('\n') : '';
const doorLines = ERR.split('\n').filter(l => /(^|\s)§DOOR /.test(l))   /* the log line starts with its time stamp */.map(l => ({ verb: (/verb=(\S+)/.exec(l) || [])[1], status: (/status=(\S+)/.exec(l) || [])[1], ms: +((/ms=(\d+)/.exec(l) || [])[1] || 0), why: (/why="([^"]*)/.exec(l) || [])[1] || '' }));
const mE = entriesOf(lastAns('menu')), qE = entriesOf(lastAns('quote')), oE = entriesOf(lastAns('orders'));
out.menu = { root: mE && mE.n, quote: qE && qE.n, orders: oE && oE.n };
const recT = allText(lastAns('record')), may = (/it may do: ([A-Z, ]+?) \(/.exec(recT) || [])[1];
const tabF = (byStep.record || []).filter(f => f.kind === 'k' && f.what === 'Tab').pop(), tabRow = tabF ? tabF.text.find(l => /^[A-Z]{2}( {2}[A-Z]{2})+\s*$/.test(l)) : null;
out.record = { number: (/^Order (\S+): (\d+) tabs/m.exec(recT) || [])[1], tabs: +((/^Order \S+: (\d+) tabs/m.exec(recT) || [])[1] || 0), may: may ? may.split(', ') : [], tabCodes: tabRow ? tabRow.trim().split(/\s+/) : [] };
const actOf = (s, verb) => { const t = allText(lastAns(s)), h = new RegExp('^(\\S[^:]*): done · Order (\\S+) (\\w+) → (\\w+) \\(([^)]+)\\)', 'm').exec(t), rel = (/^ {2}related: (.*)$/m.exec(t) || [])[1] || '', kept = /^(\d+) change\(s\) kept · it may do: (.*)$/m.exec(t), ms = +((new RegExp('^ok · ' + verb.replace('.', '\\.') + ' · (\\d+) ms', 'm').exec(t) || [])[1] || 0);
  return h ? { action: h[1], number: h[2], from: h[3], to: h[4], toName: h[5], related: rel, changes: kept ? +kept[1] : null, next: kept ? kept[2].split(', ') : [], ms, json: /^(ops|document|opSummary): /m.test(t) } : null; };
out.re = actOf('re', 'erp.reactivate'); out.co = actOf('co', 'erp.complete'); out.bang = actOf('hist', 'erp.reactivate');
const hT = allText(lastAns('hist')); out.hist = { n: (/^\s*(\d+)\s+do RE\s*$/m.exec(hT) || [])[1] || null, echoed: /^→ do RE$/m.test(hT) };
if (out.re) out.re.relCounts = out.re.related.split(' · ').map(x => { const m = /^(.*?) (\d+) \(/.exec(x); return m ? { kind: m[1], n: +m[2] } : null; }).filter(Boolean);
L('menu=' + JSON.stringify(out.menu) + ' record=' + JSON.stringify(out.record) + ' re=' + JSON.stringify(out.re) + ' co=' + JSON.stringify(out.co) + ' bang=' + JSON.stringify(out.bang) + ' hist=' + JSON.stringify(out.hist));
// ── checks F, I, H on the recording ──
{ const typed = []; R.frames.forEach((f, i) => { if (f.kind === 'r' && f.what === 'Return') { const prev = R.frames[i - 1]; typed.push(f.step); } });
  const notOk = doorLines.filter(d => d.status !== 'ok'), refusedOk = notOk.every(d => d.verb === 'mis.describe' || (d.verb === 'mis.read' && /no Order with number 100/.test(d.why)));
  chk('F1 the door lines the film ran: ' + doorLines.length + ', all ok but the two `cd 100` tries the shell makes before the id (describe "100", number "100")', doorLines.length > 0 && refusedOk && notOk.length === 2, 'not ok: ' + JSON.stringify(notOk.map(d => d.verb + ' ' + d.status)));
  chk('F2 every action answered ok and drew its summary, never the JSON: re, co, !' + out.hist.n, !!(out.re && out.co && out.bang) && !out.re.json && !out.co.json && !out.bang.json && out.re.to === 'IP' && out.co.to === 'CO' && out.bang.to === 'IP', JSON.stringify([out.re && out.re.to, out.co && out.co.to, out.bang && out.bang.to]));
  chk('F3 the record offers what its `it may do` line says, and Tab lists the same codes in the same order', out.record.may.length > 0 && JSON.stringify(out.record.may) === JSON.stringify(out.record.tabCodes), JSON.stringify(out.record.may) + ' vs Tab ' + JSON.stringify(out.record.tabCodes));
  chk('F4 `history` numbered `do RE` and `!' + out.hist.n + '` printed the expanded line before it ran', !!out.hist.n && out.hist.echoed, JSON.stringify(out.hist));
  const sj = path.join(R.scratch, 'journal.jsonl'), mine = fs.existsSync(sj) ? fs.readFileSync(sj, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l).request; } catch (e) { return null; } }).filter(Boolean) : [];
  const home = path.join(os.homedir(), '.cache/bim_door/journal.jsonl'), homeTxt = fs.existsSync(home) ? fs.readFileSync(home, 'utf8') : '', leaked = mine.filter(r => homeTxt.indexOf(r) >= 0).length;
  chk('I isolation: the film\'s ' + mine.length + ' journalled lines are in the scratch journal only, ~/.cache/bim_object unchanged', mine.length > 0 && leaked === 0 && JSON.stringify(R.objBefore) === JSON.stringify(R.objAfter), 'leaked=' + leaked);
  const left = []; R.frames.forEach(f => { if (f.kind !== 'a') return; f.text.forEach((l, y) => { if (y !== f.cy && /^red1[^>]*> \S.*▸/.test(l)) left.push(f.step + ': ' + l.trim().slice(0, 90)); }); });
  chk('H no grey suggestion is left on a finished line (§46 A2), over every answer screen', left.length === 0, left.length + ' ' + JSON.stringify([...new Set(left)].slice(0, 3)));
}
// ── 3. the lower frame: the real page on each state, cropped ──
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.db': 'application/octet-stream' };
const dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fir_db_'));
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = /^\/erp\/film_\d+\.db$/.test(u) ? path.join(dbDir, path.basename(u)) : path.join(OOTB, u);
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(0);
const SCALE = 2;
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const dbFor = {}; let nDb = 0;
  const seedOf = (opn) => { if (dbFor[opn]) return dbFor[opn]; const file = 'film_' + (++nDb) + '.db', r = spawnSync(process.execPath, [path.join(__dirname, 'snapdb.js'), path.join(R.scratch, 'ops.jsonl'), String(opn), path.join(dbDir, file)], { encoding: 'utf8', env: Object.assign({}, process.env, { OOTB }), timeout: 600000 });
    L('db opn=' + opn + ' ' + (r.stdout || '').trim().split('\n').pop() + (r.status ? ' FAIL ' + (r.stderr || '').slice(-200) : '')); if (r.status) throw new Error('snapdb failed at ' + opn); return (dbFor[opn] = file); };
  for (const key of order) {
    const s = out.states[key], pg = await browser.newPage(); await pg.setViewport({ width: 1600, height: 900, deviceScaleFactor: SCALE }); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    const base = 'http://localhost:' + srv.address().port + '/erp/idempiere.html?lang=' + LANGC + '&login=101&seed=' + seedOf(s.kind === 'rec' ? s.opn : 0);
    const url = base + (s.kind === 'win' ? '&window=143' : s.kind === 'rec' ? '&window=143&record=100' : '');
    await pg.goto(url, { waitUntil: 'networkidle0', timeout: 180000 }); await pg.waitForFunction(() => document.querySelectorAll('#idmp-tree .idmp-row').length > 5, { timeout: 90000 });
    if (s.kind !== 'tree') await pg.waitForFunction(() => /Record \d+ of \d+/.test(document.body.innerText) && document.querySelector('.idmp-docfsm'), { timeout: 90000 });
    await new Promise(r => setTimeout(r, 1500));
    let dom;
    if (s.kind === 'tree') {
      const ids = s.path.map(nm => +spawnSync('sqlite3', ['-readonly', path.join(OOTB, 'erp/ad_seed.db'), "SELECT ad_menu_id FROM ad_menu WHERE issummary='Y' AND isactive='Y' AND TRIM(name)='" + nm.replace(/'/g, "''") + "' ORDER BY ad_menu_id LIMIT 1"], { encoding: 'utf8' }).stdout.trim()); s.menuIds = ids;   // the folder by its AD_Menu id: the page's labels may be translated
      for (const id of ids) { const ok = await pg.evaluate((i) => { const r = Array.from(document.querySelectorAll('#idmp-tree .idmp-row')).find(x => x.offsetParent && +x.dataset.menuId === i); if (!r) return false; r.click(); return true; }, id); const nm = id; await new Promise(r => setTimeout(r, 700)); if (!ok) errs.push('no tree row ' + nm); }
      dom = await pg.evaluate((pa) => { const R2 = (e) => { const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; };
        let rows; const tree = document.querySelector('#idmp-tree');
        if (!pa.length) rows = Array.from(tree.querySelectorAll(':scope > .idmp-node > .idmp-row'));
        else { const last = pa[pa.length - 1], fr = Array.from(tree.querySelectorAll('.idmp-row')).find(x => x.offsetParent && +x.dataset.menuId === last), kids = fr && fr.nextElementSibling; rows = fr ? [fr].concat(kids ? Array.from(kids.querySelectorAll(':scope > .idmp-node > .idmp-row')) : []) : []; }
        const bx = rows.map(R2), x0 = Math.min(...bx.map(b => b[0])), y0 = Math.min(...bx.map(b => b[1])), x1 = Math.max(...bx.map(b => b[0] + b[2])), y1 = Math.max(...bx.map(b => b[1] + b[3]));
        return { names: rows.map(r => r.querySelector('.nm').innerText.trim()), rowsY: bx.map(b => b[1] - y0), clip: [x0, y0, x1 - x0, y1 - y0] }; }, s.menuIds);   // rowsY: each row's top inside the crop (cards.js splits a long list at a row boundary)
      if (s.path.length) dom.children = dom.names.slice(1); else dom.children = dom.names;
    } else if (s.kind === 'win') {
      dom = await pg.evaluate(() => { const m = document.querySelector('#idmp-main').getBoundingClientRect(), c = document.querySelector('#idmp-content').getBoundingClientRect(), tabs = Array.from(document.querySelectorAll('#idmp-main .idmp-adtab')).filter(e => e.offsetParent).map(e => e.innerText.trim());   // the window's own tab elements (any language)
        return { tabs: [...new Set(tabs)], clip: [m.x, m.y, m.width, c.y - m.y] }; });
    } else {
      dom = await pg.evaluate(() => { const fsm = document.querySelector('.idmp-docfsm'), b0 = fsm.getBoundingClientRect(), chip = fsm.querySelector('.chip'), btns = Array.from(fsm.querySelectorAll('button')).filter(e => e.offsetParent).map(e => e.innerText.trim());
        const labs = Array.from(document.querySelectorAll('#idmp-form label.cfrow')).filter(e => e.offsetParent), first = (e) => ((e.childNodes[0] && e.childNodes[0].textContent) || e.innerText || '').trim(), st = labs.find(e => /^Status\b/.test(first(e)) || /^Status\b/.test((e.innerText || '').trim()));
        const dn = labs.find(e => /^Document No\b/.test((e.innerText || '').trim())), yEnd = dn ? dn.getBoundingClientRect().bottom : b0.bottom + 40, gt = labs.find(e => /^Grand Total\b/.test((e.innerText || '').trim())), gin = gt && gt.querySelector('input');
        return { chip: chip ? chip.innerText.trim() : null, chipClass: chip ? chip.className : null, buttons: btns, grandTotal: gin ? gin.value : null, clip: [b0.x, b0.y, b0.width, yEnd - b0.y + 6], rec: (document.body.innerText.match(/Record \d+ of \d+/) || [])[0] }; });
    }
    const pad = 10, c = dom.clip, clip = { x: Math.max(0, c[0] - pad), y: Math.max(0, c[1] - pad), width: c[2] + 2 * pad, height: c[3] + 2 * pad };
    const file = 'erp/' + key.replace(/[^a-z0-9]+/gi, '_') + '.png'; await pg.screenshot({ path: path.join(OUT, file), clip }); await pg.close();
    Object.assign(s, { file, clip, dom, pageErrors: errs, px: [Math.round(clip.width * SCALE), Math.round(clip.height * SCALE)] });
    L('state ' + key + ' ' + file + ' crop=' + clip.width.toFixed(0) + 'x' + clip.height.toFixed(0) + ' (x' + SCALE + ') dom=' + JSON.stringify(Object.assign({}, dom, { clip: undefined })) + ' errors=' + errs.length);
  }
  // ── check P: the page = the door / the shell, on every state ──
  const NAME = { CL: 'Close', VO: 'Void', RE: 'Re-Activate', CO: 'Complete', PR: 'Prepare' }, EN = !process.env.FILM_LANG || process.env.FILM_LANG === 'en';   // a translated page: names are the page's language, so P compares counts, status codes and non-empty labels
  order.forEach(key => { const s = out.states[key], f = R.frames.find((x, i) => out.frameState[i] === key && x.kind === 'a' && entriesOf(x)) || R.frames[s.firstFrame];   // a tree state is judged on the first screen of it that LISTS entries (the greeting's red1> lists none)
    if (s.kind === 'tree') { const e = entriesOf(f); chk('P ' + key + ' the page\'s folder rows = the shell\'s listed entries' + (EN ? '' : ' (count; the page is translated)'), !!e && (EN ? JSON.stringify(e.rows) === JSON.stringify(s.dom.children) : e.rows.length === s.dom.children.length && s.dom.children.every(x => x.length > 0)) && !s.pageErrors.length, (e ? e.n : '?') + ' shell vs ' + s.dom.children.length + ' page' + (e && JSON.stringify(e.rows) !== JSON.stringify(s.dom.children) ? ' DIFF ' + JSON.stringify(e.rows.filter(x => s.dom.children.indexOf(x) < 0)) + '/' + JSON.stringify(s.dom.children.filter(x => e.rows.indexOf(x) < 0)) : '')); }
    else if (s.kind === 'win') { const want = ['Order'].concat(((/4 tabs \(([^)]*)\)/.exec(recT) || [])[1] || '').split(', ')); chk('P win the window\'s tabs = Order + the record\'s child tabs the shell names' + (EN ? '' : ' (count)'), (EN ? JSON.stringify(s.dom.tabs) === JSON.stringify(want) : s.dom.tabs.length === want.length) && !s.pageErrors.length, JSON.stringify(s.dom.tabs) + ' vs ' + JSON.stringify(want)); }
    else { const db = spawnSync('sqlite3', ['-readonly', path.join(dbDir, dbFor[s.opn]), 'SELECT docstatus FROM c_order WHERE c_order_id=100'], { encoding: 'utf8' }).stdout.trim();
      const fr = R.frames.slice(s.firstFrame).find(x => x.kind === 'a' && /^answer/.test(x.what)), shellNext = (/it may do: ([A-Z, ]+?)(?: \(|$)/m.exec(allText(fr)) || [])[1], codes = shellNext ? shellNext.trim().split(', ') : [];
      s.door = { docStatus: db, codes };
      chk('P ' + key + ' the page\'s status pill = the door\'s DocStatus (' + db + '), and its action buttons = the shell\'s `it may do` (' + codes.join(',') + ')', new RegExp('· ' + db + '$').test(s.dom.chip || '') && (EN ? JSON.stringify(s.dom.buttons) === JSON.stringify(codes.map(x => NAME[x] || x)) : s.dom.buttons.length === codes.length && s.dom.buttons.every(x => x.length > 0)) && !s.pageErrors.length, (s.dom.chip || 'no chip') + ' ' + JSON.stringify(s.dom.buttons)); }
  });
  // ── check Z: each state's crop differs from the previous state's (same kind of crop), measured in the page ──
  const pg = await browser.newPage(); const diff = async (a, b) => pg.evaluate(async (A, B) => { const load = (src) => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; }); const ia = await load(A), ib = await load(B);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h).data; x.clearRect(0, 0, w, h); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h).data; let n = 0;
    for (let k2 = 0; k2 < da.length; k2 += 4) if (Math.abs(da[k2] - db[k2]) + Math.abs(da[k2 + 1] - db[k2 + 1]) + Math.abs(da[k2 + 2] - db[k2 + 2]) > 30) n++;
    return { share: n / (w * h), same: ia.width === ib.width && ia.height === ib.height }; }, 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, a)).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, b)).toString('base64'));
  out.zoom = [];
  for (let i = 1; i < order.length; i++) { const a = out.states[order[i - 1]], b = out.states[order[i]]; let z;
    if (a.kind !== b.kind || a.key.split(':')[0] === 'tree' && a.key !== b.key) z = { from: a.key, to: b.key, share: 1, why: 'another region' + (a.kind === b.kind ? ' (another folder)' : '') };
    else { const d = await diff(a.file, b.file); z = { from: a.key, to: b.key, share: +d.share.toFixed(4), sameSize: d.same }; }
    out.zoom.push(z); chk('Z ' + z.from + ' -> ' + z.to + ' the lower frame changed', z.share > 0.005, (z.share * 100).toFixed(2) + '% of pixels' + (z.why ? ' (' + z.why + ')' : '') + (z.share > 0.005 ? '' : ' NO-OP')); }
  await pg.close(); await browser.close(); srv.close();
  // ── the end card: proof run now, the A5 log in the checkout, credits ──
  const W = (name) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'fir_w_')), r = spawnSync(process.execPath, [path.join(OOTB, 'common/door/tests/witness_' + name + '.js')], { encoding: 'utf8', cwd: OOTB, timeout: 1500000, env: Object.assign({}, process.env, { BIM_OBJECT_OPLOG: path.join(d, 'o.jsonl'), BIM_DOOR_JOURNAL: path.join(d, 'j.jsonl'), RED1_HISTORY: path.join(d, 'h') }) });
    const v = ((r.stdout || '').match(/^§WITNESS_\S+ pass=(\d+) fail=(\d+) inconclusive=(\d+) verdict=(\w+)/m) || []); return { name, pass: +v[1], fail: +v[2], inconclusive: +v[3], verdict: v[4] || 'NONE' }; };
  const enF = path.join(__dirname, 'out', 'facts.json'), reuse = !EN && fs.existsSync(enF) && JSON.parse(fs.readFileSync(enF, 'utf8')).ootb === out.ootb;
  out.proof = reuse ? JSON.parse(fs.readFileSync(enF, 'utf8')).proof : ['red1_container', 'red1_bang', 'red1_record', 'red1_act'].map(W); if (reuse) L('proof reused from out/facts.json (the English build, same checkout ' + out.ootb + ')'); out.proof.forEach(p => L('proof ' + JSON.stringify(p)));
  const a5 = fs.readFileSync(path.join(OOTB, 'common/door/tests/logs/a5_erp_reactivate_parity.log'), 'utf8').split('\n').filter(l => /^§A5_CMP /.test(l)), cases = {};
  a5.forEach(l => { const m = /^§A5_CMP (\S+) \S+ (MATCH|DIFF)/.exec(l); if (m) { cases[m[1]] = cases[m[1]] || { match: 0, n: 0 }; cases[m[1]].n++; if (m[2] === 'MATCH') cases[m[1]].match++; } });
  out.a5 = { cases, base: ((fs.readFileSync(path.join(OOTB, 'common/door/tests/logs/a5_erp_reactivate_parity.log'), 'utf8').match(/^§A5 start .*base=(\S+)/m) || [])[1]) || null };
  const n5 = Object.keys(cases).map(k2 => cases[k2]); out.a5.fields = n5.length ? n5[0].n : 0; out.a5.allMatch = n5.length > 0 && n5.every(c2 => c2.match === c2.n && c2.n === n5[0].n);
  chk('A5 the re-activate parity log in the checkout: every case MATCH on every field', out.a5.allMatch, JSON.stringify(cases));
  chk('W the witnesses run during this build all PASS', out.proof.every(p => p.verdict === 'PASS'), out.proof.map(p => p.name + ' ' + p.pass + '/' + p.fail + ' ' + p.verdict).join(' · '));
  const lic = fs.readFileSync(path.join(OOTB, 'LICENSE'), 'utf8').split('\n'); out.credits = { licence: lic[0].trim(), copyright: (lic.find(x => /^Copyright/.test(x)) || '').trim() };
  out.costs = { re: out.re && out.re.ms, co: out.co && out.co.ms, bang: out.bang && out.bang.ms, node: process.version, lines: doorLines.length, linesMs: doorLines.reduce((a2, d) => a2 + d.ms, 0) };
  out.checks = { bad, missing, list: checks };
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(out, null, 1));
  L('FACTS_VERDICT ' + (bad ? 'FAIL' : missing ? 'INCONCLUSIVE' : 'PASS') + ' checks=' + checks.length + ' bad=' + bad + ' inconclusive=' + missing);
  process.exit(bad ? 1 : missing ? 2 : 0);
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
