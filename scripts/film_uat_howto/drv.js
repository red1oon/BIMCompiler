// ⚠ DO NOT REMOVE — film "UAT, hands on: where to click" (prompts/FILM_UAT_GUIDE.md §5): the DESKTOP DRIVER. READ THE LOG after every run (§FILM_*); the exit code is not evidence.
// Drives a private Xvfb desktop (:97) the way a person does: the REAL X pointer moved along an eased arc (xdotool, one chained call per move), real clicks, real keys,
// the REAL OS file window and Downloads folder. Every web target is read from the page (CDP DOM box -> screen point); a click that lands outside its target's box FAILS the take.
// Every event is logged with wall-clock time, which is also each captured frame's pts (ffmpeg x11grab -copyts), so the composer maps events onto frames exactly.
'use strict';
const { execFileSync, spawn } = require('child_process'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium } = require('/home/red1/bim-ootb/tests/node_modules/playwright');
const ENV = Object.assign({}, process.env, { DISPLAY: ':97' }); delete ENV.DBUS_SESSION_BUS_ADDRESS;
const now = () => Date.now() / 1000, sleep = ms => new Promise(r => setTimeout(r, ms));
const X = (...a) => execFileSync('xdotool', a.map(String), { env: ENV }).toString();
const XQ = (...a) => { try { return X(...a); } catch (e) { return ''; } };   // a search that finds nothing yet
let EV = null, LOG = null, FAILS = 0, browser = null, ctx = null;
const D = module.exports = { page: null, home: null, fails: () => FAILS };
function log(s) { const l = s; console.log(l); if (LOG) fs.appendFileSync(LOG, l + '\n'); }
D.log = log;
D.check = (ok, what, detail) => { if (!ok) FAILS++; log('§FILM_CHECK ' + (ok ? 'PASS' : 'FAIL') + ' ' + what + (detail ? ' ' + detail : '')); return ok; };
D.init = async (home, logPath) => {
  D.home = home; LOG = logPath; browser = await chromium.connectOverCDP('http://127.0.0.1:9333'); ctx = browser.contexts()[0];
  // Playwright's CDP connection sends downloads to its own temp folder under a random name: give Chrome back its OWN behaviour (its Downloads folder, its real names, its download bubble)
  const bs = await browser.newBrowserCDPSession(); await bs.send('Browser.setDownloadBehavior', { behavior: 'default' }); log('§FILM_DL_BEHAVIOR default (Chrome\'s own)');
  D.page = ctx.pages()[0]; ctx.on('page', p => { log('§FILM_TAB opened ' + (p.url() || '(blank)')); });
};
D.usePage = async (match) => { for (let i = 0; i < 40; i++) { const p = ctx.pages().find(q => match.test(q.url())); if (p) { D.page = p; return p; } await sleep(250); } throw new Error('no tab matches ' + match); };
D.pages = () => ctx.pages();
// ---- the recording of one scene
let FF = null;
D.recStart = async (file) => {
  EV = { file, t0: now(), moves: [], clicks: [], keys: [], cues: [], fast: [] };
  FF = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'x11grab', '-draw_mouse', '1', '-framerate', '30', '-video_size', '1920x1080', '-i', ':97', '-copyts', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '10', '-pix_fmt', 'yuv444p', file], { env: ENV, stdio: ['pipe', 'ignore', 'pipe'] });
  FF.stderr.on('data', d => log('§FILM_FFMPEG ' + String(d).trim()));
  await sleep(700); log('§FILM_REC start ' + path.basename(file) + ' t=' + now().toFixed(3));
};
D.recStop = async () => {
  await sleep(400); FF.stdin.write('q'); await new Promise(r => FF.on('close', r)); EV.t1 = now();
  fs.writeFileSync(EV.file.replace(/\.mkv$/, '.events.json'), JSON.stringify(EV, null, 1));
  log('§FILM_REC stop ' + path.basename(EV.file) + ' moves=' + EV.moves.length + ' clicks=' + EV.clicks.length + ' keys=' + EV.keys.length + ' cues=' + EV.cues.length + ' dur=' + (EV.t1 - EV.t0).toFixed(2));
};
D.cue = (name, extra) => { EV.cues.push(Object.assign({ t: now(), name }, extra || {})); log('§FILM_CUE ' + name + ' t=' + now().toFixed(3) + (extra ? ' ' + JSON.stringify(extra) : '')); };
D.fastStart = (why) => { EV.fast.push({ t0: now(), why }); log('§FILM_FAST start ' + why); };
D.fastEnd = () => { const f = EV.fast[EV.fast.length - 1]; f.t1 = now(); log('§FILM_FAST end ' + f.why + ' sec=' + (f.t1 - f.t0).toFixed(2)); };
// ---- where things are on the screen
D.mouse = () => { const m = /x:(\d+) y:(\d+)/.exec(X('getmouselocation')); return { x: +m[1], y: +m[2] }; };
async function origin(pg) { const g = await pg.evaluate(() => ({ sx: screenX, sy: screenY, ow: outerWidth, oh: outerHeight, iw: innerWidth, ih: innerHeight, dpr: devicePixelRatio })); const side = (g.ow - g.iw) / 2; return { x: g.sx + side, y: g.sy + g.oh - g.ih - side, dpr: g.dpr }; }
D.box = async (target, pg) => {   // target: a CSS selector string or a Playwright locator -> its box in SCREEN pixels
  pg = pg || D.page; const loc = typeof target === 'string' ? pg.locator(target).first() : target;
  await loc.waitFor({ state: 'visible', timeout: 60000 }); const b = await loc.boundingBox(), o = await origin(pg);
  return { x: o.x + b.x, y: o.y + b.y, w: b.width, h: b.height, name: typeof target === 'string' ? target : String(target) };
};
D.screenBox = (x, y, w, h, name) => ({ x, y, w, h, name });   // a native window part, measured from its X window geometry
D.win = (rx) => { const ids = XQ('search', '--onlyvisible', '--name', rx).trim().split('\n').filter(Boolean); if (!ids.length) return null; const id = ids[ids.length - 1]; const g = X('getwindowgeometry', '--shell', id); const v = k => +(new RegExp(k + '=(\\d+)').exec(g) || [0, 0])[1]; return { id, x: v('X'), y: v('Y'), w: v('WIDTH'), h: v('HEIGHT') }; };
D.waitWin = async (rx, ms) => { for (let i = 0; i < (ms || 20000) / 200; i++) { const w = D.win(rx); if (w && w.w > 50) return w; await sleep(200); } return null; };
// ---- the pointer: an eased arc, ~60 steps a second, one chained xdotool call
D.moveTo = async (x, y, dur) => {
  const a = D.mouse(); x = Math.round(x); y = Math.round(y); const dist = Math.hypot(x - a.x, y - a.y);
  dur = dur || Math.min(1.0, Math.max(0.45, 0.35 + dist / 2200)); const n = Math.max(8, Math.round(dur * 60)), dt = dur / n;
  const nx = -(y - a.y) / (dist || 1), ny = (x - a.x) / (dist || 1), bow = Math.min(90, dist * 0.12);   // a slight bow, as a hand moves
  const cx = (a.x + x) / 2 + nx * bow, cy = (a.y + y) / 2 + ny * bow, args = [], pts = [];
  for (let i = 1; i <= n; i++) { let s = i / n; s = s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
    const px = Math.round((1 - s) * (1 - s) * a.x + 2 * (1 - s) * s * cx + s * s * x), py = Math.round((1 - s) * (1 - s) * a.y + 2 * (1 - s) * s * cy + s * s * y);
    args.push('mousemove', px, py, 'sleep', dt.toFixed(4)); pts.push([px, py]); }
  const t0 = now(); X(...args); const t1 = now(); EV && EV.moves.push({ t0, t1, from: [a.x, a.y], to: [x, y], pts });
  await sleep(160);   // the rest on the target before the press
};
D.aim = async (target, opt) => {   // move onto a target (selector, locator, or a screen box) and return its box
  opt = opt || {}; const b = target && target.w !== undefined && target.x !== undefined && !target.locator ? target : await D.box(target, opt.page);
  const px = b.x + b.w * (opt.fx === undefined ? 0.5 : opt.fx), py = b.y + b.h * (opt.fy === undefined ? 0.5 : opt.fy);
  await D.moveTo(px, py, opt.dur); D.last = b; log('§FILM_PTR target="' + (opt.label || b.name) + '" box=' + [b.x, b.y, b.w, b.h].map(Math.round).join(',') + ' aim=' + Math.round(px) + ',' + Math.round(py)); return b;
};
D.click = async (opt) => {   // a real press where the pointer is; it must be inside the last aimed box
  opt = opt || {}; const m = D.mouse(), b = D.last, inside = b && m.x >= b.x && m.x <= b.x + b.w && m.y >= b.y && m.y <= b.y + b.h;
  D.check(inside, 'click_inside ' + (opt.label || (b && b.name) || '?'), 'at=' + m.x + ',' + m.y);
  const t = now(); X('click', '--repeat', opt.n || 1, '--delay', 90, opt.button || 1); EV.clicks.push({ t, x: m.x, y: m.y, n: opt.n || 1, button: opt.button || 1, label: opt.label || (b && b.name), box: b ? [b.x, b.y, b.w, b.h].map(Math.round) : null });
  log('§FILM_PTR click at=' + m.x + ',' + m.y + ' n=' + (opt.n || 1) + ' button=' + (opt.button || 1) + ' t=' + t.toFixed(3)); await sleep(opt.after === undefined ? 500 : opt.after);
};
D.aimClick = async (target, opt) => { const b = await D.aim(target, opt); await D.click(opt); return b; };
D.wheel = async (down, n) => { for (let i = 0; i < n; i++) { X('click', down ? 5 : 4); EV.keys.push({ t: now(), k: 'w' }); await sleep(70); } await sleep(350); };
D.scrollInto = async (sel, margin) => {   // scroll with the mouse wheel, as a person does, until the target is on screen (it never jumps by script)
  margin = margin || 200; const m = D.mouse(); if (m.y < 160 || m.x < 560 || m.x > 1340) await D.moveTo(960, 620);   // the wheel scrolls what is under the pointer: put it over the page's text first
  for (let i = 0; i < 60; i++) { const b = await D.box(sel), top = 92 + margin, bot = 1075 - margin; if (b.y >= top && b.y + b.h <= bot) return b;
    // FILM_UAT_GUIDE §5.10: the margin is a wish. A page that cannot scroll further that way (the Run Checker does not scroll at all) keeps a fully visible target where it is.
    const pg = await D.page.evaluate(() => ({ y: scrollY, max: document.documentElement.scrollHeight - innerHeight })), up = b.y < top;   // the wheel turns by the edge that is out: top above the window -> up, else its bottom is below -> down
    if ((up ? pg.y <= 0 : pg.y >= pg.max - 1) && b.y >= 92 && b.y + b.h <= 1075) { log('§FILM_SCROLL ' + (typeof sel === 'string' ? sel : 'locator') + ' page_at=' + (up ? 'top' : 'end') + ' y=' + Math.round(b.y) + ' (margin not reachable)'); return b; }
    const dist = up ? top - b.y : b.y + b.h - bot, n = Math.max(1, Math.min(8, Math.round(dist / 110)));   // one wheel notch scrolls ~100 px; fewer notches as it gets close
    await D.wheel(!up, n); await sleep(450); }   // smooth scrolling keeps moving after the last notch: let it settle before measuring again
  throw new Error('could not scroll to ' + sel);
};
// §5.15: a panel that scrolls INSIDE itself (the Modeller's #dm-body): the wheel over the panel, until the target is inside the scroller's shown box (the margin is a wish, §5.10)
D.scrollIn = async (target, scroller, margin) => {
  margin = margin === undefined ? 60 : margin; const sb = await D.box(scroller);
  const m = D.mouse(); if (!(m.x > sb.x + 20 && m.x < sb.x + sb.w - 20 && m.y > sb.y + 20 && m.y < sb.y + sb.h - 20)) await D.moveTo(sb.x + sb.w * 0.55, sb.y + sb.h * 0.5);
  for (let i = 0; i < 60; i++) {
    const b = await D.box(target), top = sb.y + margin, bot = sb.y + sb.h - margin; if (b.y >= top && b.y + Math.min(b.h, sb.h - 2 * margin) <= bot) return b;
    const up = b.y < top, st = await D.page.evaluate(s => { const e = document.querySelector(s); return { y: e.scrollTop, max: e.scrollHeight - e.clientHeight }; }, scroller);
    if ((up ? st.y <= 0 : st.y >= st.max - 1) && b.y >= sb.y && b.y + b.h <= sb.y + sb.h) { log('§FILM_SCROLL ' + (typeof target === 'string' ? target : 'locator') + ' in ' + scroller + ' at=' + (up ? 'top' : 'end') + ' y=' + Math.round(b.y)); return b; }
    const dist = up ? top - b.y : b.y + Math.min(b.h, sb.h - 2 * margin) - bot, n = Math.max(1, Math.min(8, Math.round(dist / 110)));
    await D.wheel(!up, n); await sleep(450); }
  throw new Error('could not scroll to ' + (typeof target === 'string' ? target : 'locator') + ' in ' + scroller);
};
// §5.15: a list (<select>): click it, type the option's first letters, Enter (a keyboard pick, as a person does); the caller checks the value after
D.pickSelect = async (target, text, label) => { await D.aimClick(target, { label: label || 'the list' }); await sleep(500); await D.type(text, 120); await sleep(300); await D.key('Return', 'choose ' + text); await sleep(600); };
// §5.15: a press, an eased move, a release from one screen point to another (the exclude box); button 3 = a right-drag (OrbitControls pans)
D.dragFromTo = async (x0, y0, x1, y1, opt) => { opt = opt || {}; const btn = opt.button || 1; await D.moveTo(x0, y0, opt.dur0); const t = now(); X('mousedown', btn); EV.clicks.push({ t, x: Math.round(x0), y: Math.round(y0), n: 0, button: btn, label: opt.label || 'drag start' });
  await sleep(150); await D.moveTo(x1, y1, opt.dur || 1.2); await sleep(150); X('mouseup', btn); log('§FILM_PTR drag from=' + Math.round(x0) + ',' + Math.round(y0) + ' to=' + Math.round(x1) + ',' + Math.round(y1) + ' button=' + btn + (opt.label ? ' (' + opt.label + ')' : '')); await sleep(400); };
// ---- keys: typed text (each character logged for its key sound) and named keys
D.type = async (text, delay) => { delay = delay || 105; const t0 = now(); X('type', '--delay', delay, '--', text); /* '--': a text that starts with '-' (a negative z, §5.15) is not an option */ for (let i = 0; i < text.length; i++) EV.keys.push({ t: t0 + i * delay / 1000, k: 'k' }); log('§FILM_KEYS typed=' + JSON.stringify(text) + ' n=' + text.length); await sleep(200); };
D.key = async (combo, label) => { const t = now(); X('key', combo); EV.keys.push({ t, k: /Return|KP_Enter/.test(combo) ? 'r' : 'k', combo }); log('§FILM_KEY ' + combo + (label ? ' (' + label + ')' : '')); await sleep(350); };
// ---- files that land
// WHICH TAB CHROME SHOWS: Playwright's CDP attach makes every tab report document.visibilityState 'visible' (measured: two tabs both 'visible'), so that is no evidence.
// The real fact is the Chrome window's X title = the shown tab's title + ' - Google Chrome'. The driver acts on THAT tab.
D.shownTitle = () => { const ids = XQ('search', '--onlyvisible', '--class', 'google-chrome').trim().split('\n').filter(Boolean); for (const id of ids) { const n = XQ('getwindowname', id).trim(); if (/ - Google Chrome$/.test(n)) return n.replace(/ - Google Chrome$/, ''); } return ''; };
D.shownPage = async () => { const t = D.shownTitle(); for (const p of ctx.pages()) { const pt = await p.title().catch(() => null); if (pt !== null && pt === t) return p; } return null; };
D.waitUrl = async (rx, ms) => {   // the SHOWN tab reaches a URL matching rx
  for (let i = 0; i < (ms || 30000) / 250; i++) { const p = await D.shownPage(); if (p && rx.test(p.url())) { D.page = p; log('§FILM_URL shown ' + p.url()); return true; } await sleep(250); }
  D.check(false, 'url ' + rx, 'the shown tab never reached it (shown title "' + D.shownTitle() + '")'); return false; };   // polls: a Back restores from the page cache without a load event
D.dlDir = () => path.join(D.home, 'Downloads');
D.waitFile = async (rx, ms, dir) => {
  dir = dir || D.dlDir();
  for (let i = 0; i < (ms || 60000) / 250; i++) { const f = fs.readdirSync(dir).find(n => rx.test(n) && !/\.crdownload$|^\.org\.chromium/.test(n)); if (f) { await sleep(600); const p = path.join(dir, f), buf = fs.readFileSync(p);
      log('§FILM_DL name=' + f + ' bytes=' + buf.length + ' sha256=' + crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)); return { name: f, path: p, bytes: buf.length }; } await sleep(250); }
  D.check(false, 'download ' + rx, 'nothing landed in ' + dir); return null;
};
D.sleep = sleep; D.now = now; D.X = X; D.ENV = ENV;
D.close = async () => { if (browser) await browser.close().catch(() => {}); };
// ---- the Files app (Nautilus) in its OWN private session bus (dbus-run-session), never the owner's; placed at a fixed spot so its parts can be measured once
D.filesLaunch = async (dir) => {   // before a take (not filmed): Nautilus is slow to start (its portals boot first, measured > 20 s), so it is started, then minimised
  let w = (XQ('search', '--class', 'nautilus').trim().split('\n').filter(Boolean)).pop();
  if (!w) { const env = Object.assign({}, ENV, { HOME: D.home, GSK_RENDERER: 'cairo', LIBGL_ALWAYS_SOFTWARE: '1' }); delete env.XDG_RUNTIME_DIR; delete env.WAYLAND_DISPLAY;
    spawn('dbus-run-session', ['--', 'nautilus', '--new-window', dir], { env, detached: true, stdio: 'ignore' }).unref();
    for (let i = 0; i < 450 && !w; i++) { await sleep(200); w = (XQ('search', '--onlyvisible', '--class', 'nautilus').trim().split('\n').filter(Boolean)).pop(); } }
  if (!w) { D.check(false, 'files_window', 'Nautilus did not open in 90 s'); return null; }
  await sleep(1500); XQ('windowminimize', w); D.filesWin = w; log('§FILM_FILES launched window=' + w); return w;
};
D.files = async (geo) => {   // in the take: the Files app comes forward, at a fixed place
  geo = geo || { x: 240, y: 140, w: 1440, h: 820 }; const w = D.filesWin; if (!w) { D.check(false, 'files_window', 'not launched'); return null; }
  X('windowactivate', '--sync', w); X('windowmove', w, geo.x, geo.y); X('windowsize', w, geo.w, geo.h); await sleep(1200);
  log('§FILM_FILES shown ' + X('getwindowgeometry', '--shell', w).replace(/\n/g, ' ').trim()); D.filesGeo = geo; return w;
};
D.closeWin = (id) => { try { X('windowclose', id); } catch (e) { } };
// ---- reading a NATIVE window (Files, the OS file window): one frame of the screen, words located by OCR (tesseract), so the pointer goes where the word really is
D.findText = async (rx, region, tries, quiet) => {   // quiet: a miss returns null without a FAIL (the caller has a derived fallback and checks it)
  const tmp = path.join(require('os').tmpdir(), 'film_ocr_' + process.pid), keep = typeof rx === 'function' ? rx : (t => rx.test(t));
  // four reads of one frame, merged: 1x colour, 2x grey, 2x grey inverted, 2x near-white only (white text on GTK's orange selected row is lost in the others; measured)
  const VARS = [['', 1], ['scale=3840:2160:flags=lanczos,format=gray', 2], ['scale=3840:2160:flags=lanczos,format=gray,negate', 2], ["scale=3840:2160:flags=lanczos,format=gray,lutyuv=y='if(gt(val,225),0,255)'", 2]];   // 4th: near-white text only (a selected row)
  for (let a = 0; a < (tries || 10); a++) {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'x11grab', '-video_size', '1920x1080', '-i', ':97', '-frames:v', '1', tmp + '_0.png'], { env: ENV });
    let hit = [];
    VARS.forEach(([vf, k], i) => {
      const f = tmp + '_' + i + '.png'; if (vf) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp + '_0.png', '-vf', vf, f]);
      execFileSync('tesseract', [f, '-', 'tsv'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n').slice(1).map(l => l.split('\t')).filter(c => c.length >= 12 && c[11].trim())
        .forEach(c => { const o = { x: Math.round(+c[6] / k), y: Math.round(+c[7] / k), w: Math.round(+c[8] / k), h: Math.round(+c[9] / k), conf: +c[10], t: c[11].trim(), read: i };
          if (keep(o.t) && (!region || (o.x >= region.x && o.y >= region.y && o.x <= region.x + region.w && o.y <= region.y + region.h))) hit.push(o); });
    });
    hit.sort((p, q) => (Math.abs(p.y - q.y) < 12 ? p.x - q.x : p.y - q.y));   // reading order: top row first, then left to right
    if (hit.length) { const o = hit[0]; log('§FILM_OCR found "' + o.t + '" at=' + [o.x, o.y, o.w, o.h].join(',') + ' conf=' + o.conf.toFixed(0) + ' read=' + o.read + ' of ' + hit.length + ' rx=' + String(rx).slice(0, 60)); return Object.assign(o, { name: o.t }); }
    await sleep(700);
  }
  if (!quiet) D.check(false, 'ocr_find ' + String(rx).slice(0, 60), 'not on screen'); return null;
};
// ---- a drag (orbit a 3D view): press, an eased move, release
D.drag = async (x1, y1, dur) => { const t = now(); X('mousedown', 1); EV.clicks.push({ t, x: D.mouse().x, y: D.mouse().y, n: 0, label: 'drag start' }); await D.moveTo(x1, y1, dur || 1.4); X('mouseup', 1); log('§FILM_PTR drag to=' + x1 + ',' + y1); await sleep(400); };
// ---- the OS file window (GTK 'Open File(s)'): go into each folder by double-click, then pick, then Open. Every name located by OCR inside the window.
D.pick = async (folders, pickFn, label) => {
  const DLG = '^(Open File|Select files)'; const dlg = await D.waitWin(DLG, 20000);   // GTK: 'Open File(s)' for an input, 'Select files this site can read' for the File System Access picker if (!D.check(!!dlg, 'file_window_opened', label)) return false;
  log('§FILM_DIALOG ' + JSON.stringify(dlg)); await sleep(900); const R = { x: dlg.x, y: dlg.y + 40, w: dlg.w, h: dlg.h - 120 };
  // start from Home (left pane): the window remembers the last folder it showed, so the first folder row may not be there otherwise
  // Home is often the SELECTED row (white on orange) and tesseract misreads its H: full take 2026-11-19 read it 'Some' on every frame (§5.8 mock). If 'Home' is not read,
  // derive it from the sidebar's fixed order: the one row between 'Recent' and 'Desktop' (both read at conf >= 90).
  const SIDE = { x: dlg.x, y: dlg.y - 20, w: 160, h: 300 };
  let hm = await D.findText(t => t === 'Home', SIDE, 3, true);
  if (!hm) {
    const rec = await D.findText(t => t === 'Recent', SIDE, 3), dsk = rec && await D.findText(t => /^Deskto/.test(t), { x: SIDE.x, y: rec.y + rec.h, w: SIDE.w, h: 200 }, 3);
    hm = dsk && await D.findText(t => /^[A-Za-z]{3,}$/.test(t), { x: rec.x - 4, y: rec.y + rec.h + 4, w: 120, h: dsk.y - rec.y - rec.h - 10 }, 3, true);
    // take2 2026-11-22: the selected row gave no word at all (take1 read 'Some'). The one row between them is then at the gap's middle (take1: Recent 152, Home 194, Desktop 229).
    // A wrong click cannot pass silently: the next folder ('Downloads') must still be found by OCR inside the window.
    if (!hm && rec && dsk && dsk.y - rec.y > 2 * dsk.h) hm = { x: dsk.x, y: Math.round((rec.y + dsk.y) / 2), w: dsk.w, h: dsk.h, t: '(gap middle)' };
    if (!D.check(!!hm, 'home_row_derived', hm ? 'read="' + hm.t + '" between Recent y=' + rec.y + ' and Desktop y=' + dsk.y : 'no row between Recent and Desktop')) return false;
    log('§FILM_OCR_DERIVED Home at=' + [hm.x, hm.y, hm.w, hm.h].join(',') + ' read="' + hm.t + '"');
  }
  await D.aim(D.screenBox(hm.x - 26, hm.y - 6, hm.w + 50, hm.h + 12, 'Home'), { label: 'Home (file window)' }); await D.click({ label: 'Home' }); await sleep(900);
  for (const f of folders) {
    const hit = await D.findText(typeof f === 'function' ? f : (t => t === f || t.replace(/[^\w.]/g, '') === f), R); if (!hit) return false;
    await D.aim(D.screenBox(hit.x - 30, hit.y - 4, hit.w + 40, hit.h + 8, f), { label: 'folder ' + (typeof f === 'string' ? f : 'match') }); await D.click({ n: 2, label: 'open folder (double-click)' }); await sleep(900);
  }
  if ((await pickFn(R)) === false) { X('key', 'Escape'); D.check(false, 'file_window_pick', label + ': the item was not found, the window was cancelled'); return false; }
  const ob = await D.findText(t => t === 'Open', { x: dlg.x + dlg.w - 300, y: dlg.y + dlg.h - 90, w: 300, h: 90 }); if (!ob) return false;
  await D.aim(D.screenBox(ob.x - 30, ob.y - 10, ob.w + 60, ob.h + 20, 'Open'), { label: 'Open' }); await D.click({ label: 'Open (file window)' });
  for (let i = 0; i < 40; i++) { if (!D.win(DLG)) { log('§FILM_DIALOG closed'); return true; } await sleep(250); }
  D.check(false, 'file_window_closed', label); return false;
};
