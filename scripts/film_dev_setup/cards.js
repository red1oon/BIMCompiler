// ⚠ DO NOT REMOVE — film 4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). TWO frames:
// above, a TYPED terminal strip (every command is typed character by character, 2 per still, with its REAL output lines from out/cmd_*.log: facts.js ran each typed line byte for byte), scrolling like a terminal;
// below, the REAL picture that line produced: the three apps (pages.js), the saved building opened offline, or a band of the REAL VS Code (shoot.sh). The bottom 170 px stay empty for the captions.
// Every line, picture and number is read from out/; nothing is typed in by hand. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = f => pics[f] || (pics[f] = b64(f));
const TOP = 400, BAR = 30, MT = TOP + BAR, MH = 410, SC = 1920 / 1440, FS = 21, CPL = Math.floor((1920 - 68) / (0.602 * FS)), ROWS = 12, BANDTOP = 408;   // MH 410: a 4-line caption (it starts near y=840) must not cover the picture
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:14px 34px;font-family:'DejaVu Sans Mono',monospace;font-size:${FS}px;line-height:1.38;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre-wrap;word-break:break-all;color:#F3EEE8} .cmd:before{content:'$ ';color:#4ade80} .url:before{content:'▶ ';color:#7dd3fc} .ans{white-space:pre-wrap;word-break:break-all;color:#fbbf24} .bad{color:#f87171;font-weight:700} .good{color:#4ade80;font-weight:700}
.cur{display:inline-block;width:12px;height:22px;background:#4ade80;vertical-align:-4px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px;white-space:nowrap;overflow:hidden} .bar b{color:#7dd3fc}
.mod{position:absolute;left:0;top:${MT}px;width:1920px;height:${MH}px;overflow:hidden;background:#05080f} .mod img{position:absolute}
.lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px} .panel{position:absolute;left:60px;top:30px;right:60px;font-family:'DejaVu Sans Mono',monospace;font-size:21px;line-height:1.5;color:#fbbf24;white-space:pre-wrap;word-break:break-all} .panel h3{font-family:'DejaVu Sans',sans-serif;color:#94a3b8;font-size:19px;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}`;
const colorize = s => esc(s).replace(/verdict=PASS/g, 'verdict=<span class="good">PASS</span>').replace(/verdict=FAIL/g, 'verdict=<span class="bad">FAIL</span>').replace(/(§MANIFEST_FAIL)/g, '<span class="bad">$1</span>').replace(/bad_paths=1\b/g, '<span class="bad">bad_paths=1</span>').replace(/bad_paths=0\b/g, '<span class="good">bad_paths=0</span>');
const rows = l => Math.max(1, Math.ceil((l.s.length + (l.t === 'cmd' ? 2 : 0)) / CPL));
const termHtml = (lines, typing) => { const all = lines.concat(typing != null ? [{ t: typing.url ? 'url' : 'cmd', s: typing.s, cur: !typing.done }] : []); let keep = [], n = 0;
  for (let i = all.length - 1; i >= 0; i--) { const r = rows(all[i]); if (n + r > ROWS) break; n += r; keep.unshift(all[i]); }
  return `<div class="term" data-rows="${n}">` + keep.map(l => l.t === 'ans' ? `<div class="ans">${colorize(l.s)}</div>` : `<div class="cmd ${l.t === 'url' ? 'url' : ''}">${esc(l.s)}${l.cur ? '<span class="cur"></span>' : ''}</div>`).join('') + '</div>'; };
const bar = st => `<div class="bar">▲ <b>terminal</b>, typed in the downloaded folder &nbsp;·&nbsp; ▼ ${st}</div>`;
const frame = (termH, lowerH, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${termH}${bar(st)}${lowerH}</body></html>`;
const band = still => `<div class="mod"><img src="${img(path.join(OUT, 'stills', still + '.png'))}" style="left:0;width:1920px;top:${-BANDTOP}px"></div>`;
const apps = () => { const P = F.pages.apps, one = (k, x, lab) => `<img src="${img(path.join(OUT, P[k].png))}" style="left:${x}px;top:-35px;width:640px;height:480px"><div class="lab" style="left:${x + 8}px;top:8px">${lab}</div>`;
  return `<div class="mod">${one('modeller', 0, 'Modeller · opens, no failed request')}${one('erp', 640, 'ERP · opens, no failed request')}${one('viewer', 1280, 'Viewer · the Duplex, fetched from the internet')}</div>`; };
const offline = () => { const f = path.join(OUT, F.pages.offline.png);
  return `<div class="mod"><div style="position:absolute;left:0;top:0;width:1100px;height:410px;overflow:hidden"><img src="${img(f)}" style="left:-90px;top:-275px;width:1280px"></div>` +
    `<div style="position:absolute;left:1130px;top:185px;width:760px;height:50px;overflow:hidden;border:2px solid #FF6B78"><img src="${img(f)}" style="left:-${340 * 760 / 600}px;top:-${912 * 760 / 600}px;width:${1280 * 760 / 600}px"></div>` +
    `<div class="lab" style="left:1130px;top:150px">the page's own status line, from the saved file</div><div class="lab" style="left:10px;top:8px">Viewer · opened by name · offline: ${esc(Object.keys(F.pages.offline.blocked).join(', '))} blocked</div></div>`; };
const panel = (h, txt) => `<div class="mod"><div class="panel"><h3>${esc(h)}</h3>${esc(txt)}</div></div>`;
// a typed sequence: steps = [{ cmd, ans:[lines], lower, st, url }]; the terminal scrolls; 2 characters per still; the answers of a middle step hold 1.2 s, the last step's answers take the rest of the beat
const seq = steps => { const s = [], lines = []; steps.forEach((p, si) => { const last = si === steps.length - 1, mk = (typing, st) => ({ html: frame(termHtml(lines, typing), p.lower, st || p.st) });
    s.push(Object.assign(mk({ s: '', url: p.url }), { frames: si === 0 ? 14 : 4 }));
    for (let k = 2; k < p.cmd.length; k += 2) s.push(Object.assign(mk({ s: p.cmd.slice(0, k), url: p.url }), { frames: 1, key: 'k' }));
    s.push(Object.assign(mk({ s: p.cmd, url: p.url }), { frames: 1, key: 'k' })); s.push(Object.assign(mk({ s: p.cmd, url: p.url }), { frames: 8, key: 'r' }));
    lines.push({ t: p.url ? 'url' : 'cmd', s: p.cmd }); p.ans.forEach(a => lines.push({ t: 'ans', s: a }));
    s.push(Object.assign({ html: frame(termHtml(lines, null), p.lower, p.st2 || p.st) }, last ? { frames: null } : { frames: 28 })); }); return s; };
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:88px;font-weight:700;margin-top:24px;line-height:1.15} .s{font-size:38px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}`;
const full = inner => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`, CO = '<span style="color:#FF6B78">', CE = '</span>';
const S = F.steps, shown = (id, i) => S[id][i].shown, cmd = (id, i) => S[id][i].typed, cards = {};
cards.cover = [{ html: full('<div class="ch"><div class="k">CH 0</div><div class="t1">From an empty folder<br>to a ' + CO + 'witnessed' + CE + ' dev setup</div><div class="s">Download, serve, install the add-on, and check it: every line typed, every number read from a log</div><div class="c">Sovereignty begins with visibility in a single window · English</div></div>'), frames: null }];
// b1: the from-scratch witness's own lines (read from out/from_scratch.log), the three apps below
{ const sc = fs.readFileSync(path.join(OUT, 'from_scratch.log'), 'utf8').split('\n').map(l => l.trim()), pick = re => sc.filter(l => re.test(l)).map(l => l.replace(/ title="[^"]*"/, '').replace(/ first_words="[^"]*"/, ''));
  const ans = pick(/^§FROM_SCRATCH_S2 |^§FROM_SCRATCH_S4 |^§FROM_SCRATCH_S5_INSTALL|^§FROM_SCRATCH steps_ran/).map(l => l.replace(/ \(throwaway.*$/, ''));
  cards.b1 = seq([{ cmd: 'node scripts/tests/witness_from_scratch.js', ans, lower: apps(), st: 'the three apps, opened from the download', st2: 'the three apps, opened from the download' }]); }
cards.b1b = seq([{ cmd: 'ls viewer/buildings/', ans: ['patches', F.pages.save.name], lower: offline(), st: 'the saved file, opened by name, offline', st2: 'the saved file, opened by name, offline' },
  { cmd: 'http://127.0.0.1:' + F.pages.port + '/' + F.pages.offline.url, url: true, ans: [F.pages.offline.text], lower: offline(), st: 'the saved file, opened by name, offline', st2: 'the building opens from the file' }]);
cards.b2 = seq([{ cmd: cmd('b2', 0), ans: shown('b2', 0), lower: band('b2_hover'), st: 'the real VS Code · X0 Navigator installed from the .vsix', st2: 'the real VS Code' },
  { cmd: cmd('b2', 1), ans: shown('b2', 1), lower: band('b2_hover'), st: 'the real VS Code · the add-on, hovering a shared field', st2: 'the add-on installed here, not in your profile: hover a shared field' }]);
cards.b3 = seq([0, 1, 2].map(i => ({ cmd: cmd('b3', i), ans: shown('b3', i), lower: band('b3_where'), st: 'the real VS Code at the line the answer names', st2: 'the real VS Code at the line the answer names' })));
{ const gap = fs.readFileSync(path.join(OUT, 'cmd_b4_gap.log'), 'utf8').split('\n'), e = gap.find(l => /Cannot find module/.test(l)) || '', g = gap.find(l => /not a git repository/.test(l)) || '';
  const gp = panel('what the ZIP lacks (found while making this film)', e.trim().slice(0, 150) + '\n' + g.trim().slice(0, 120) + '\n\nafter npm install the first is gone; the second needs git init');
  cards.b4 = seq([{ cmd: cmd('b4', 0), ans: shown('b4', 0), lower: gp, st: 'the two gaps of the ZIP, as the tools print them' }, { cmd: cmd('b4', 1), ans: shown('b4', 1), lower: band('b4_edit'), st: 'the real VS Code: the version typed by hand' },
    { cmd: cmd('b4', 2), ans: shown('b4', 2), lower: band('b4_edit'), st: 'the real VS Code: the line the check names', st2: 'the check refuses, names the file and the line' }, { cmd: cmd('b4', 3), ans: shown('b4', 3), lower: band('b4_edit'), st: 'the bump tool writes it right' },
    { cmd: cmd('b4', 4), ans: shown('b4', 4), lower: band('b4_edit'), st: 'the check passes', st2: 'the check passes' }]); }
cards.b5 = seq([{ cmd: cmd('b5', 0), ans: shown('b5', 0), lower: band('b5_header'), st: 'the real VS Code: a proof header, line ' + F.proof.line }, { cmd: cmd('b5', 1), ans: shown('b5', 1), lower: band('b5_proves'), st: 'the real VS Code: the header now names a file that is not there' },
  { cmd: cmd('b5', 2), ans: shown('b5', 2), lower: band('b5_proves'), st: 'the proof map goes red', st2: 'the proof map goes red' }]);
cards.b6 = seq([0, 1, 2].map(i => ({ cmd: cmd('b6', i), ans: shown('b6', i), lower: band('b6_ci'), st: 'the real VS Code: tests/ci_fast_tier.json, an excluded row and its reason', st2: 'the real VS Code: tests/ci_fast_tier.json' })));
cards.b7 = seq([{ cmd: cmd('b7', 0), ans: shown('b7', 0), lower: band('b7_session'), st: 'the real VS Code: the code that read the transcript', st2: 'the real VS Code: devtools/x0/session.js' }]);
{ const C = F.credentials, PA = require('./priorart.json'), prs = Object.keys(C.prs).map(n => '#' + n).join(' ');
  const css = `<style>.lc{margin:40px 56px 0} .lc h1{font-size:46px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:560px 620px 560px;gap:36px;margin-top:22px}
    .col h2{font-size:20px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.32;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:56px;bottom:190px;font-size:17px;color:#94a3b8;width:1800px}</style>`;
  const got = ['<b>From the download</b><br>' + F.scratch.files.toLocaleString('en-US') + ' files, ' + F.scratch.mb + ' MB · ' + F.scratch.steps + ' steps ran · verdict ' + F.scratch.verdict, '<b>Add-on</b><br>packed and installed from the .vsix; hover shows ' + F.x0.writes + ' writes, ' + F.x0.reads + ' reads',
    '<b>Checks</b><br>manifest ' + F.manifest.greenIdentical.replace(/^\d+ /, '') + ' · ' + F.manifest.greenDeps + ' deps · proof map ' + F.proof.green.proven + ' of ' + F.proof.green.modules + ' proven · CI tier ' + F.ci.tier + ' of ' + F.ci.witnessFiles.toLocaleString('en-US') + ' witness files'];
  const gaps = ['<b>First viewer run needs the internet</b><br>its building comes from OCI (' + F.scratch.viewerFail + ' local requests fail first)', '<b>The ZIP needs two steps</b><br>npm install (lint package) and git init (a git index) before the manifest tools run', '<b>' + F.ci.excluded + ' witnesses kept out of CI</b>, each with its measured reason; the modeller still has failing witnesses on unedited main', '<b>Analytics host</b><br>the viewer also loads ' + esc(F.scratch.viewerHosts.split(',')[0])];
  const pa = PA.items.map(i => '<b>' + esc(i.name) + '</b><br>' + esc(i.does) + '<br><i>→ ' + esc(i.took) + '</i>');
  const cred = ['<b>' + esc(C.repo) + '</b> @ ' + esc(C.commit.slice(0, 8)) + '<br>' + esc(C.licence), '<b>Merged</b><br>' + esc(prs), '<b>Witnessed</b><br>W-FROM-SCRATCH ' + esc(F.scratch.steps) + ' verdict=' + esc(F.scratch.verdict), '<b>Developer Guide</b><br>red1oon.github.io/BIMCompiler/DeveloperGuide/'];
  const col = (h, rs) => '<div class="col"><h2>' + h + '</h2>' + rs.map(r => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full(css + '<div class="lc"><h1>What a stranger gets, ' + CO + 'what is not there yet' + CE + ', who stands behind it</h1><div class="cols">' + col('what a stranger gets', got) + col('named gaps · prior art', gaps.slice(0, 3).concat(pa.slice(0, 1))) + col('credentials · prior art', cred.concat(pa.slice(1))) +
    '</div><div class="cr">Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real VS Code and the real apps, headless on the CPU · the editor ran in a throwaway profile · the film was made from this session\'s own logs</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(4, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc'), imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .panel, .term > div')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);
          return { over: Math.max(t ? t.scrollHeight - t.clientHeight : 0, lc ? lc.getBoundingClientRect().bottom - (1080 - 170) : 0, wide), loaded: imgs.every(i => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets + ' chars_per_line=' + CPL + ' rows=' + ROWS);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
