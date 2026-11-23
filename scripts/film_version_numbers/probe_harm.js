// ⚠ DO NOT REMOVE — SCOPE: film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6), chapter 2 "the visible harm". READ out/probe_harm.log after every run (exit code is not evidence).
// ISSUE: the spec says "pick a precached viewer file with a string visible in the page ... choose the example only after you have measured that its visible effect shows". This is that measurement, BEFORE any filming:
//   1. serve the AFTER tree (bim-ootb fc2f8216, a throwaway detached worktree) on a port of our own; headless Chrome (CPU, --disable-gpu, fresh profile, every request to a host other than localhost refused) opens the Viewer with its service worker ON;
//   2. read the text the page SHOWS (body.innerText, title/placeholder/aria-label attributes) and find, in every precached viewer/common .js file, a string literal that appears in it (candidates);
//   3. for the best candidates: edit that string in the throwaway tree, save, RELOAD, read the DOM (expect OLD: §HARM old_after_reload); run the press (node scripts/bump.js <file> --write), RELOAD, read the DOM again,
//      and if the Viewer's own "Update ready" toast shows, tap it and read once more. Restore the tree. One §HARM_TRY line per candidate; §HARM_CHOICE names the one the film uses (out/harm_choice.json).
// Not a witness of the product; it only decides which real example the film shows. Never runs while a GPU bake runs: build checks `pgrep -f "node cli_silent_bake"` first (done by the caller). Usage: node probe_harm.js [--try N]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), http = require('http');
const puppeteer = require(path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), AFTER = process.env.FILM_AFTER || '/tmp/wt-film6-after', PORT = +(process.env.FILM_PORT || 8641), L = m => console.log('§HARM_PROBE ' + m);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TRY = +((process.argv.indexOf('--try') > 0 && process.argv[process.argv.indexOf('--try') + 1]) || 60);
const git = (...a) => cp.spawnSync('git', a, { cwd: AFTER, encoding: 'utf8' });
const clean = () => { git('checkout', '--', '.'); return git('status', '--short').stdout.trim() === ''; };
let srv = null;
const startServer = () => new Promise(res => { srv = cp.spawn('node', [path.join(AFTER, 'scripts', '_fast_static_server.js'), String(PORT), AFTER], { stdio: 'ignore' }); setTimeout(res, 800); });
const stopServer = () => { if (srv) { try { process.kill(srv.pid); } catch (e) { /* gone */ } srv = null; } };
const BLOCK = h => !(h === 'localhost' || h === '127.0.0.1');
const launch = async tag => { const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'film6-prof-' + tag + '-'));
  const br = await puppeteer.launch({ headless: true, userDataDir: prof, args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1920,1080', '--allow-file-access-from-files'] });
  const pg = await br.newPage(); await pg.setViewport({ width: 1200, height: 700, deviceScaleFactor: 1.6 }); await pg.setRequestInterception(true);
  const blocked = new Set(); pg.on('request', rq => { let u; try { u = new URL(rq.url()); } catch (e) { return rq.continue(); } if (u.protocol.startsWith('http') && BLOCK(u.hostname)) { blocked.add(u.hostname); return rq.abort(); } rq.continue(); });
  pg.on('pageerror', () => {}); return { br, pg, prof, blocked }; };
const URL_V = 'http://localhost:' + PORT + '/viewer/viewer.html';
const domText = pg => pg.evaluate(() => { const t = [document.body.innerText]; document.querySelectorAll('[placeholder]').forEach(e => { const v = e.getAttribute('placeholder'); if (v) t.push(v); }); return t.join('\n').toLowerCase(); });   // only what the page SHOWS (no tooltips); lower case: CSS may upper-case it
const visibleRect = (pg, S) => pg.evaluate(S => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const i = n.nodeValue.indexOf(S); if (i < 0) continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + S.length); const b = r.getBoundingClientRect(); const cs = getComputedStyle(n.parentElement); if (b.width > 8 && b.height > 6 && b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.2) return { x: b.left, y: b.top, w: b.width, h: b.height }; } for (const e of document.querySelectorAll('[placeholder]')) { if ((e.getAttribute('placeholder') || '').indexOf(S) >= 0) { const b = e.getBoundingClientRect(); if (b.width > 8 && b.top >= 0 && b.bottom <= innerHeight) return { x: b.left, y: b.top, w: b.width, h: b.height }; } } return null; }, S);
const swReady = async pg => { await pg.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; }).catch(() => false); await sleep(2500); };
const controller = pg => pg.evaluate(() => !!navigator.serviceWorker.controller);
const KL = require('./lib_vsc.js');
let cur = 'help'; const UI = { help: KL.openHelp, settings: KL.openSettings, none: async () => {}, bld: KL.waitBuilding, bldt: KL.openTM, bldw: KL.openWH, bldhelp: async pg => { await KL.waitBuilding(pg); await KL.openHelp(pg); }, bldsettings: async pg => { await KL.waitBuilding(pg); await KL.openSettings(pg); } };
const urlOf = () => /^bld/.test(cur) ? URL_V + '?db=../buildings/HHS_Office_Federated_extracted.db' : URL_V;
const load = async pg => { await pg.goto(urlOf(), { waitUntil: 'load', timeout: 120000 }).catch(e => L('goto: ' + e.message)); await sleep(4000); await UI[cur](pg); };
const rl = async (pg, w) => { await pg.reload({ waitUntil: 'load' }); await sleep(w || 3000); await UI[cur](pg); };
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (!clean()) { L('FAIL the AFTER tree is not clean'); process.exit(1); }
  await startServer(); let verdict = 'INCONCLUSIVE'; const tries = [];
  try {
    // ---- 1+2: what the page shows, and which precached .js files hold a literal that appears in it
    const sw = fs.readFileSync(path.join(AFTER, 'viewer', 'sw.js'), 'utf8'), pre = /PRECACHE_ASSETS\s*=\s*\[([\s\S]*?)\];/.exec(sw)[1].match(/'[^']+'/g).map(x => x.slice(1, -1)).filter(x => /\.js$/.test(x) && !/(^|\/)lib\//.test(x));
    const labels = fs.readFileSync(path.join(AFTER, 'viewer', 'i18n', 'en_US.json'), 'utf8'), mods = JSON.parse(fs.readFileSync(path.join(AFTER, 'viewer', 'modules.json'), 'utf8')), cand = [];
    if (process.env.FILM_CAND) cand.push(JSON.parse(process.env.FILM_CAND));
    else for (const st of ['bld', 'bldhelp', 'bldsettings']) { cur = st;
      const A = await launch('scan'); await load(A.pg); await swReady(A.pg); await rl(A.pg, 3000);
      const ctl0 = await controller(A.pg), text = await domText(A.pg); L('state=' + st + ' page_loaded=Y controller=' + (ctl0 ? 'Y' : 'N') + ' dom_chars=' + text.length + ' blocked_hosts=' + Array.from(A.blocked).join(',')); await A.pg.screenshot({ path: path.join(OUT, 'probe_viewer_scan_' + st + '.png') });
      if (text.length < 50) { L('state=' + st + ' showed no text'); await A.br.close(); continue; }
      const here = [];
      for (const f of pre) { const rel = f.startsWith('../') ? f.slice(3) : 'viewer/' + f, abs = path.join(AFTER, rel); if (!fs.existsSync(abs)) continue; const src = fs.readFileSync(abs, 'utf8'); const seen = new Set();
        for (const m of src.matchAll(/(['"`])((?:(?!\1)[^\\\n]){5,70})\1/g)) { const s = m[2]; if (!/^[A-Za-z][A-Za-z0-9 ,.'’:&()\-\/]+$/.test(s) || seen.has(s)) continue; seen.add(s); if (text.indexOf(s.toLowerCase()) >= 0 && src.split(m[0]).length - 1 === 1 && text.split(s.toLowerCase()).length - 1 === 1) here.push({ rel, s, lit: m[0], state: st, wit: ((mods[rel] || {}).witnesses || []).length, bytes: src.length }); } }
      for (const c of here) c.vis = !!(await visibleRect(A.pg, c.s)); await A.br.close(); L('state=' + st + ' candidates=' + here.length + ' visible=' + here.filter(c => c.vis).length); cand.push(...here.filter(c => c.vis)); }
    if (!process.env.FILM_CAND) {   // batch screen: ALL candidates of a state edited at once (a unique marker word each); one load per state shows which words come from the edited file
      const byState = {}; cand.forEach(c => (byState[c.state] = byState[c.state] || []).push(c)); const keep = [];
      for (const st of Object.keys(byState)) { cur = st; const cs = byState[st], saved = {}; cs.forEach((c, i) => { const abs = path.join(AFTER, c.rel); saved[abs] = saved[abs] || fs.readFileSync(abs, 'utf8'); const w = c.s.split(' '); c.mark = (w.length > 1 ? w[0] + ' qz' + i + 'x ' + w.slice(1).join(' ') : 'qz' + i + 'x ' + c.s); });
        // one edit per candidate (the quoted literal exactly once, checked in the scan)
        for (const abs of Object.keys(saved)) { let t = saved[abs]; cs.filter(c => path.join(AFTER, c.rel) === abs).forEach(c => { t = t.replace(c.lit, c.lit.replace(c.s, c.mark)); }); fs.writeFileSync(abs, t); }
        const Z = await launch('batch'); await load(Z.pg); const dz = await domText(Z.pg); await Z.br.close(); for (const abs of Object.keys(saved)) fs.writeFileSync(abs, saved[abs]); if (!clean()) { L('FAIL tree not clean after the batch'); break; }
        cs.forEach(c => { c.js_sourced = dz.indexOf(c.mark.toLowerCase()) >= 0; L('batch state=' + st + ' ' + c.rel + ' "' + c.s + '" js_sourced=' + c.js_sourced); if (c.js_sourced) keep.push(c); }); }
      cand.splice(0, cand.length, ...keep); L('batch screened: ' + keep.length + ' candidates whose visible words come from the edited file'); }
    cand.sort((a, b) => a.wit - b.wit || b.s.length - a.s.length || a.bytes - b.bytes); L('candidates=' + cand.length + ' ' + JSON.stringify(cand.slice(0, 12).map(c => c.rel + ':"' + c.s + '"(w' + c.wit + ')')));
    // ---- 3: try the best ones
    for (const c of cand.slice(0, TRY)) { cur = c.state;
      const abs = path.join(AFTER, c.rel), orig = fs.readFileSync(abs, 'utf8'); const words = c.s.split(' '), to = c.to || (words.length > 1 ? words.slice(0, 1).concat(['new']).concat(words.slice(1)).join(' ')   : 'New ' + c.s);   // one added word: a typo-fix-sized edit
      const lit1 = c.litNew || c.lit.replace(c.s, to), t = { file: c.rel, old: c.s, new: to, litOld: c.lit, litNew: lit1, witnesses: c.wit, state: c.state };
      t.js_sourced = c.js_sourced; if (c.js_sourced === undefined) { fs.writeFileSync(abs, orig.replace(c.lit, lit1)); const Z = await launch('src'); await load(Z.pg); const dz = await domText(Z.pg); t.js_sourced = dz.indexOf(to.toLowerCase()) >= 0; await Z.br.close(); fs.writeFileSync(abs, orig); if (!t.js_sourced) { t.verdict = 'NO not_js_sourced (the visible words do not come from this file: editing it changes nothing on first load)'; tries.push(t); L('try ' + JSON.stringify(t)); continue; } }
      const B = await launch('try');
      try {
        await load(B.pg); await swReady(B.pg); await rl(B.pg, 3000); t.controller = await controller(B.pg); t.shows_old_before = (await domText(B.pg)).indexOf(c.s.toLowerCase()) >= 0;
        fs.writeFileSync(abs, orig.replace(c.lit, lit1));   // the edit + save
        await rl(B.pg, 4000); let d = await domText(B.pg); t.old_after_reload = d.indexOf(c.s.toLowerCase()) >= 0 && d.indexOf(to.toLowerCase()) < 0; t.new_after_reload = d.indexOf(to.toLowerCase()) >= 0;
        const p = cp.spawnSync('node', ['scripts/bump.js', c.rel, '--write'], { cwd: AFTER, encoding: 'utf8' }); t.press_exit = p.status; t.press_lines = (p.stdout || '').split('\n').filter(l => /^§BUMP/.test(l)).length;
        await rl(B.pg, 5000); d = await domText(B.pg); t.new_after_press_reload = d.indexOf(to.toLowerCase()) >= 0; t.toast = await B.pg.evaluate(() => !!document.getElementById('swUpdateToast'));
        for (let k = 0; k < 40 && !t.toast; k++) { await sleep(1000); t.toast = await B.pg.evaluate(() => !!document.getElementById('swUpdateToast')); } t.sw_versions = await B.pg.evaluate(async () => (await caches.keys()).join(','));   // the new worker installs in the background: give it time
        if (!t.new_after_press_reload) { await rl(B.pg, 4000); d = await domText(B.pg); t.new_after_second_reload = d.indexOf(to.toLowerCase()) >= 0; }
        t.verdict = t.shows_old_before && t.old_after_reload && (t.new_after_press_reload || t.new_after_second_reload) ? 'SHOWS' : 'NO'; } catch (e) { t.verdict = 'ERROR ' + e.message; }
      await B.br.close(); fs.writeFileSync(abs, orig); const ok = clean(); t.tree_clean = ok; tries.push(t); L('try ' + JSON.stringify(t)); if (!ok) { L('FAIL tree not clean after a try'); break; } }
    const pick = tries.find(t => t.verdict === 'SHOWS'); if (pick) { verdict = 'FOUND'; fs.writeFileSync(path.join(OUT, 'harm_choice.json'), JSON.stringify(pick, null, 1)); L('HARM_CHOICE ' + JSON.stringify(pick)); } else verdict = tries.length ? 'NONE_SHOW' : 'INCONCLUSIVE';
  } finally { stopServer(); clean(); }
  L('VERDICT ' + verdict); process.exitCode = verdict === 'FOUND' ? 0 : 2;
})().catch(e => { stopServer(); clean(); console.error('§HARM_PROBE FAIL ' + (e && e.stack || e)); process.exit(1); });
