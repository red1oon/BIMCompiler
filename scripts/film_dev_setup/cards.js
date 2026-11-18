// ⚠ DO NOT REMOVE — film 4 v2 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). TWO frames:
// ABOVE, the REAL VS Code (a band of the stills shoot.sh and facts.js took: the editor `node scripts/setup.js --open` launched, then the explorer + .vscode, the Extensions view, the Run Task menu, a snippet, the F5 menu, a hover, an edit),
// or a plain panel while nothing is open yet; BELOW, a TYPED terminal strip (every line typed character by character with real key sounds, the REAL output lines from out/cmd_*.log: facts.js ran each typed line byte for byte).
// The bottom 170 px stay empty for the captions. Every line, picture and number is read from out/; nothing is typed in by hand. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = f => pics[f] || (pics[f] = b64(f)), cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const VH = 564, BAR = 30, TT = VH + BAR, TH = 316, FS = 19, CPL = Math.floor((1920 - 68) / (0.602 * FS)), ROWS = 11;   // top: the real VS Code (570 px); the typed strip below holds 11 rows; the bottom 170 px stay empty for the captions
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden}
.vsc{position:absolute;left:0;top:0;width:1920px;height:${VH}px;overflow:hidden;background:#1e1e1e} .vsc img{position:absolute;left:0;width:1920px}
.pan{position:absolute;left:0;top:0;width:1920px;height:${VH}px;background:#10161f;padding:60px 90px;font-family:'DejaVu Sans Mono',monospace;font-size:30px;line-height:1.6;color:#cbd5e1;white-space:pre-wrap} .pan h3{font-family:'DejaVu Sans',sans-serif;color:#94a3b8;font-size:22px;letter-spacing:3px;text-transform:uppercase;margin-bottom:22px} .pan b{color:#fbbf24;font-weight:700}
.term{position:absolute;left:0;top:${TT}px;width:1920px;height:${TH}px;background:#0b0f17;padding:14px 34px;font-family:'DejaVu Sans Mono',monospace;font-size:${FS}px;line-height:1.36;overflow:hidden;border-top:2px solid #334155}
.cmd{white-space:pre-wrap;word-break:break-all;color:#F3EEE8} .cmd:before{content:'$ ';color:#4ade80} .ans{white-space:pre-wrap;word-break:break-all;color:#fbbf24} .hi{background:#1e3a5f} .bad{color:#f87171;font-weight:700} .good{color:#4ade80;font-weight:700}
.cur{display:inline-block;width:11px;height:20px;background:#4ade80;vertical-align:-4px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${VH}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:18px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px;white-space:nowrap;overflow:hidden} .bar b{color:#7dd3fc}
.lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:19px;font-weight:700;padding:3px 10px;white-space:nowrap}`;
const colorize = s => esc(s).replace(/verdict=PASS/g, 'verdict=<span class="good">PASS</span>').replace(/verdict=FAIL/g, 'verdict=<span class="bad">FAIL</span>').replace(/(§MANIFEST_FAIL)/g, '<span class="bad">$1</span>').replace(/bad_paths=1\b/g, '<span class="bad">bad_paths=1</span>').replace(/bad_paths=0\b/g, '<span class="good">bad_paths=0</span>').replace(/gaps=0\b/g, 'gaps=<span class="good">0</span>');
const rows = l => Math.max(1, Math.ceil((l.s.length + (l.t === 'cmd' ? 2 : 0)) / CPL));
const termHtml = (lines, typing) => { const all = lines.concat(typing != null ? [{ t: 'cmd', s: typing.s, cur: !typing.done }] : []); let keep = [], n = 0;
  for (let i = all.length - 1; i >= 0; i--) { const r = rows(all[i]); if (n + r > ROWS) break; n += r; keep.unshift(all[i]); }
  return `<div class="term" data-rows="${n}">` + keep.map(l => l.t === 'ans' ? `<div class="ans${l.hi ? ' hi' : ''}">${colorize(l.s)}</div>` : `<div class="cmd">${esc(l.s)}${l.cur ? '<span class="cur"></span>' : ''}</div>`).join('') + '</div>'; };
const bar = st => `<div class="bar">▲ ${st[0]} &nbsp;·&nbsp; ▼ <b>terminal</b>, typed in the downloaded folder &nbsp;·&nbsp; ${st[1] || ''}</div>`;
const frame = (topH, termH, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topH}${bar(st)}${termH}</body></html>`;
// the real editor: a band of the still (1920 px wide, taken at 1:1); y0 = where the band starts in the still (0 = the top: menus and the explorer; 270 = around the centred editor line)
const dims = f => { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };   // PNG header: the editor window is 1919x1079 (the --open run) or 1440x900 (the extension-test host: it ignores the saved window size); each is shown at 1920 px wide
const vsc = (still, y0, label) => { const f = path.join(OUT, 'stills', still + '.png'), d = dims(f), sc = 1920 / d.w, top = y0 === 'mid' ? Math.max(0, Math.round(0.5 * d.h * sc - VH / 2)) : y0;
  return `<div class="vsc"><img src="${img(f)}" style="top:-${top}px">${label ? `<div class="lab" style="right:24px;bottom:18px">${esc(label)}</div>` : ''}</div>`; };
const pan = (h, txt) => `<div class="pan"><h3>${esc(h)}</h3>${txt}</div>`;
const RE = ['the real VS Code', 'the real editor, throwaway profile'];
// a typed sequence: steps = [{ cmd, ans:[lines or {s,hi}], top, top2, st, st2 }]; the strip scrolls; 2 characters per still; the answers of a middle step hold 1.2 s, the last step's answers take the rest of the beat
const seq = (steps, pre) => { const s = [], lines = (pre || []).slice(); steps.forEach((p, si) => { const last = si === steps.length - 1, mk = (typing, top, st) => ({ html: frame(top, termHtml(lines, typing), st) });
    s.push(Object.assign(mk({ s: '' }, p.top, p.st), { frames: si === 0 ? 14 : 4 }));
    for (let k = 2; k < p.cmd.length; k += 2) s.push(Object.assign(mk({ s: p.cmd.slice(0, k) }, p.top, p.st), { frames: 1, key: 'k' }));
    s.push(Object.assign(mk({ s: p.cmd }, p.top, p.st), { frames: 1, key: 'k' })); s.push(Object.assign(mk({ s: p.cmd }, p.top, p.st), { frames: 8, key: 'r' }));
    lines.push({ t: 'cmd', s: p.cmd }); p.ans.forEach(a => lines.push(typeof a === 'string' ? { t: 'ans', s: a } : { t: 'ans', s: a.s, hi: a.hi }));
    s.push(Object.assign({ html: frame(p.top2 || p.top, termHtml(lines, null), p.st2 || p.st) }, last ? { frames: null } : { frames: 28 })); }); return s; };
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:88px;font-weight:700;margin-top:24px;line-height:1.15} .s{font-size:38px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}`;
const full = inner => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`, CO = '<span style="color:#FF6B78">', CE = '</span>';
const S = F.steps, shown = (id, i) => S[id][i].shown, cmd = (id, i) => S[id][i].typed, cards = {};
const shot = n => { const l = fs.readFileSync(path.join(OUT, 'shots.log'), 'utf8').split('\n').filter(x => x.startsWith('§FILM_SHOT name=' + n + ' ')).pop(); return JSON.parse(l.slice(('§FILM_SHOT name=' + n + ' ').length)); };
cards.cover = [{ html: full('<div class="ch"><div class="k">CH 0</div><div class="t1">From an empty folder<br>to a ' + CO + 'witnessed' + CE + ' dev setup</div><div class="s">Fetch, run one script, and the editor opens set up: every line typed, every number read from a log</div><div class="c">Sovereignty begins with visibility in a single window · English</div></div>'), frames: null }];
// b1: the two typed lines. Above: nothing open yet, then the real editor setup.js opened.
const Fx = F.fetch, meterLine = Fx.meter.replace(/\s+/g, ' '), setupAns = shown('b1', 0).filter(l => !/^\$ /.test(l)).map(l => l.length > CPL * 2 - 6 ? cut(l, CPL - 2) : l).map(l => ({ s: l, hi: /^§SETUP_VSC/.test(l) }));
cards.b1 = seq([{ cmd: Fx.typed.replace(/ && pwd$/, ''), ans: [meterLine], top: pan('an empty folder', 'nothing here yet'), top2: pan('downloaded', '<b>' + Fx.files.toLocaleString('en-US') + '</b> files · <b>' + Fx.mb + '</b> MB · commit <b>' + Fx.commit.slice(0, 8) + '</b>\n(read from the archive\'s own header)'), st: ['nothing is open yet', ''], st2: ['the archive, unpacked', 'github.com/red1oon/bim-ootb, anonymous'] },
  { cmd: S.b1[0].typed, ans: setupAns, top: pan('downloaded', '<b>' + Fx.files.toLocaleString('en-US') + '</b> files · <b>' + Fx.mb + '</b> MB · commit <b>' + Fx.commit.slice(0, 8) + '</b>'), top2: vsc('s_open', 0, 'the editor setup.js opened'), st: ['no editor yet', ''], st2: RE.concat([]).slice(0, 1).concat(['the folder, opened by `--open` in a throwaway profile']) }]);
// b2: the editor, set up (no typing: the strip keeps the script's own §SETUP_VSC line lit)
{ const T = shot('s_tasks'), L = shot('s_launch'), X = shot('s_ext'), SN = shot('s_snip'), D = shot('s_vscodedir');
  const keepLines = [{ t: 'cmd', s: Fx.typed.replace(/ && pwd$/, '') }, { t: 'ans', s: meterLine }, { t: 'cmd', s: S.b1[0].typed }].concat(setupAns.map(a => ({ t: 'ans', s: a.s, hi: a.hi })));
  const st = (a) => [RE[0], a], stills = [['s_vscodedir', 0, 'the repo\'s own .vscode folder: ' + D.vscode_dir.split(',').length + ' files'], ['s_ext', 0, 'X0 Navigator, installed by the script, active'], ['s_tasks', 0, 'Run Task: ' + T.count + ' tasks from tasks.json'],
    ['s_snip_suggest', 0, 'type "witness": the snippet is offered'], ['s_snip', 0, 'it expands to a witness skeleton'], ['s_launch', 0, 'F5: ' + L.count + ' launch targets from launch.json']];
  cards.b2 = stills.map(([n, y, lab]) => ({ html: frame(vsc(n, y, lab), termHtml(keepLines, null), st(lab)), frames: null })); }
// b3: the add-on's hover, and the same fact typed
cards.b3 = seq([{ cmd: cmd('b3', 0), ans: shown('b3', 0), top: vsc('b2_hover', 'mid', 'hover on A.camera'), st: [RE[0], 'hover on a shared field'], st2: [RE[0], 'the same answer, from the terminal'] }]);
// b4: the version typed by hand in the editor; the check refuses; the bump tool; the check passes
cards.b4 = seq([{ cmd: cmd('b4', 1), ans: shown('b4', 1), top: vsc('b4_edit', 'mid', 'one version changed by hand: ?v=99'), st: [RE[0], 'the version, changed by hand in the page'], st2: [RE[0], 'the check refuses, names the file and the line'] },
  { cmd: cmd('b4', 2), ans: shown('b4', 2), top: vsc('b4_edit', 'mid', 'one version changed by hand: ?v=99'), st: [RE[0], 'the bump tool writes it right'] }, { cmd: cmd('b4', 3), ans: shown('b4', 3), top: vsc('b4_edit', 'mid', 'one version changed by hand: ?v=99'), st: [RE[0], 'the check passes'], st2: [RE[0], 'the check passes'] }]);
// b5: a proof header, then one naming a missing file
cards.b5 = seq([{ cmd: cmd('b5', 0), ans: shown('b5', 0), top: vsc('b5_header', 'mid', 'a proof header: line ' + F.proof.line), st: [RE[0], 'a proof header, line ' + F.proof.line], st2: [RE[0], 'the proof map'] },
  { cmd: cmd('b5', 2), ans: shown('b5', 2), top: vsc('b5_proves', 'mid', 'the header now names a file that is not there'), st: [RE[0], 'the header now names a file that is not there'], st2: [RE[0], 'the proof map goes red'] }]);
cards.b7 = seq([{ cmd: cmd('b7', 0), ans: shown('b7', 0), top: vsc('b7_session', 'mid', 'devtools/x0/session.js'), st: [RE[0], 'the code that reads the transcript'], st2: [RE[0], 'this session\'s own transcript'] }]);
{ const C = F.credentials, PA = require('./priorart.json'), prs = Object.keys(C.prs).map(n => '#' + n).join(' ');
  const css = `<style>.lc{margin:40px 56px 0} .lc h1{font-size:46px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:560px 620px 560px;gap:36px;margin-top:22px}
    .col h2{font-size:20px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.32;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:56px;bottom:190px;font-size:17px;color:#94a3b8;width:1800px}</style>`;
  const T = shot('s_tasks'), L = shot('s_launch');
  const got = ['<b>From the fetch</b><br>' + Fx.files.toLocaleString('en-US') + ' files, ' + Fx.mb + ' MB · commit ' + Fx.commit.slice(0, 8), '<b>One script</b><br>' + esc(F.setup.line.replace(/^§/, '')), '<b>The editor</b><br>add-on active · ' + T.count + ' tasks · ' + L.count + ' launch targets · ' + F.setup.snippets + ' snippets',
    '<b>Checks</b><br>manifest ' + F.manifest.greenIdentical.replace(/^\d+ /, '') + ' · ' + F.manifest.greenDeps + ' deps · proof map ' + F.proof.green.proven + ' of ' + F.proof.green.modules + ' proven · CI fast tier: ' + F.ci.tier + ' modeller witnesses, ' + F.ci.excluded + ' more kept out, of ' + F.ci.witnessFiles.toLocaleString('en-US') + ' witness files'];
  const gaps = ['<b>First viewer run needs the internet</b><br>its building comes from OCI (' + F.scratch.viewerFail + ' local requests fail first)', '<b>setup.js needs the network once</b><br>npm ci fetches the lint package the manifest tools use', '<b>Witnesses kept out of the fast CI tier</b>: ' + F.ci.excluded + ', each with its measured reason; the modeller still has failing witnesses on unedited main', '<b>Not shown</b><br>--install into your own profile, and the analytics host the viewer loads (' + esc(F.scratch.viewerHosts.split(',')[0]) + ')'];
  const pa = PA.items.map(i => '<b>' + esc(i.name) + '</b><br>' + esc(i.does) + '<br><i>→ ' + esc(i.took) + '</i>');
  const cred = ['<b>' + esc(C.repo) + '</b> @ ' + esc(C.commit.slice(0, 8)) + '<br>' + esc(C.licence), '<b>Merged</b><br>' + esc(prs), '<b>Witnessed</b><br>W-FROM-SCRATCH ' + esc(F.scratch.steps) + ' verdict=' + esc(F.scratch.verdict) + ' · ' + esc(F.scratch.setupLine.replace(/^§FROM_SCRATCH_S5_SETUP exit=0 /, '').replace(/^§/, '')), '<b>Developer Guide</b><br>red1oon.github.io/BIMCompiler/DeveloperGuide/'];
  const col = (h, rs) => '<div class="col"><h2>' + h + '</h2>' + rs.map(r => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full(css + '<div class="lc"><h1>What a stranger gets, ' + CO + 'what is not there yet' + CE + ', who stands behind it</h1><div class="cols">' + col('what a stranger gets', got) + col('named gaps · prior art', gaps.concat(pa.slice(0, 1))) + col('credentials · prior art', cred.concat(pa.slice(1))) +
    '</div><div class="cr">Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real VS Code (throwaway profile, presentation settings only) and the real files, headless on the CPU · made from this session\'s own logs</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(4, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc'), imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .pan, .term > div')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);
          const pn = document.querySelector('.pan'); return { over: Math.max(t ? t.scrollHeight - t.clientHeight : 0, pn ? pn.scrollHeight - pn.clientHeight : 0, lc ? lc.getBoundingClientRect().bottom - (1080 - 170) : 0, wide), loaded: imgs.every(i => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets + ' chars_per_line=' + CPL + ' rows=' + ROWS);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
