// ⚠ DO NOT REMOVE — film 3 (prompts/FILM_IDE_ERP_DEBUG.md): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). TWO frames: above, the REAL VS Code (a crop of the stills shoot.sh took, scaled 4:3 up,
// never a drawing) or a typed terminal strip showing the REAL log lines; below, the REAL ERP page (page_<old|new>.png from facts.js, opened on the kernel's data of that step, NOT live). The bottom 170 px stay empty
// for the captions. Every line, picture and count is read from out/; nothing is typed in by hand. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const SH = fs.readFileSync(path.join(OUT, 'shots.log'), 'utf8'), plan = JSON.parse(/§FILM_PLAN commits [^{]*(\{.*\})/.exec(SH)[1]), pl = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = f => pics[f] || (pics[f] = b64(f));
const CROP = { h1_tag_before: 190, f1_call: 255, f2_landed: 255, t0a_deleted: 300, t0b_half: 300, t0c_typed: 300, t1a_deleted: 300, t1b_half: 300, t1c_typed: 300, s1_saved: 300 };   // the top y (in the 1440x900 still) of the 300 px band the beat is about
const SC = 1920 / 1440, TOP = 400, BAR = 30, ERPT = TOP + BAR, ERPH = 480;
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden}
.top{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;overflow:hidden;background:#1e1e1e} .top img{position:absolute;left:0;width:1920px}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:18px 34px;font-family:'DejaVu Sans Mono',monospace;font-size:27px;line-height:1.45;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:'$ ';color:#4ade80} .ans{white-space:pre;color:#fbbf24} .bad{color:#f87171;font-weight:700} .good{color:#4ade80;font-weight:700} .dim{color:#94a3b8}
.cur{display:inline-block;width:15px;height:29px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.erp{position:absolute;left:0;top:${ERPT}px;width:1920px;height:${ERPH}px;overflow:hidden} .erp img{display:block;width:1920px}`;
const bar = (st) => `<div class="bar">▲ <b>VS Code</b> (the real editor) &nbsp;·&nbsp; ▼ <b>the ERP page</b>, opened on the data of this step, not live-linked &nbsp;·&nbsp; ${esc(st)}</div>`;
const frame = (topHtml, erpFile, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topHtml}${bar(st)}<div class="erp"><img class="pg" src="${img(erpFile)}"></div></body></html>`;
const vsc = still => `<div class="top"><img class="v" src="${img(path.join(OUT, 'stills', still + '.png'))}" style="top:${-Math.round(CROP[still] * SC)}px"></div>`;
const termHtml = (cmd, k, done, lines) => `<div class="term"><div class="cmd">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}</div>`;
const OLD = path.join(OUT, 'page_old.png'), NEW = path.join(OUT, 'page_new.png'), CMD = 'node erp/tests/witness_replay_clock.js';
const logLines = (f, col) => fs.readFileSync(path.join(OUT, f), 'utf8').split('\n').filter(l => /§REPLAY_CLOCK_SESSION_DAY|§WITNESS_REPLAY_CLOCK/.test(l)).map(l => {
  const t = cut(l.trim(), 112), flag = /same=N/.test(t) ? t.replace(/same=N/, '<span class="bad">same=N</span>') : t.replace(/same=Y/, '<span class="good">same=Y</span>'); return '<div class="ans">' + (/same=N|same=Y/.test(t) ? flag.replace(/^(?!<)/, '') : esc(t)) + '</div>'; }).join('');
const lineHtml = f => fs.readFileSync(path.join(OUT, f), 'utf8').split('\n').filter(l => /§REPLAY_CLOCK_SESSION_DAY|§WITNESS_REPLAY_CLOCK/.test(l)).map(l => { const t = cut(l.trim(), 112), e = esc(t).replace(/same=N/, '<span class="bad">same=N</span>').replace(/same=Y/, '<span class="good">same=Y</span>'); return '<div class="ans">' + e + '</div>'; }).join('');
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:104px;font-weight:700;line-height:1.1;margin-top:30px} .s{font-size:40px;color:#cbd5e1;margin-top:46px} .c{font-size:24px;color:#94a3b8;margin-top:70px}`;
const full = inner => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`;
const typed = (before, cmd, lines, after, st1, st2) => { const s = [{ html: frame(termHtml(cmd, 0, false, ''), before, st1), frames: 14 }]; for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termHtml(cmd, k, false, ''), before, st1), frames: 1, key: 'k' });
  s.push({ html: frame(termHtml(cmd, cmd.length, false, ''), before, st1), frames: 8, key: 'r' }); s.push({ html: frame(termHtml(cmd, cmd.length, true, lines), after, st2), frames: null }); return s; };
const E = (name, html, frames, key) => ({ name, html, frames, key });
const cards = {};
const CO = '<span style="color:#FF6B78">', CE = '</span>';   // the two tones: off-white and the film's coral
cards.cover = [{ html: full('<div class="ch"><div class="k">CH 0</div><div class="t1">VSC ' + CO + 'Hot Edit' + CE + '</div><div class="s">inbuilt tools for ERP/BIM developers</div><div class="c">Example: the invoice dated yesterday · bim-ootb #2996 → #3010 · English</div></div>'), frames: null }];
cards.wrong = typed(OLD, CMD, lineHtml('before.log'), OLD, 'the invoice, before the fix', 'the invoice, before the fix');
cards.hover = [{ html: frame(vsc('h1_tag_before'), OLD, 'hover on the tag in the test'), frames: null }];
cards.find = [{ html: frame(vsc('f1_call'), OLD, 'F12 on the call of env()'), frames: null }, { html: frame(vsc('f2_landed'), OLD, 'it lands on function env'), frames: null }];
{ // the fix: stills at the typing checkpoints; one key sound per typed character in between (the picture lags the keys by up to half a fragment: stills are checkpoints, stated in the spec)
  const s = [], F = plan.frags, hold = (still, n, key) => s.push({ html: frame(vsc(still), OLD, 'typing the fix into erp/ws_kernel.js'), frames: n, key });
  F.forEach((f, i) => { const half = Math.floor(f.neu.length / 2), a = 't' + i + 'a_deleted', b = 't' + i + 'b_half', c = 't' + i + 'c_typed';
    hold(a, 12); for (let k = 0; k < half; k++) hold(a, 1, 'k'); hold(b, 6); for (let k = half; k < f.neu.length; k++) hold(b, 1, 'k'); hold(c, 10); });
  s.push({ html: frame(vsc('s1_saved'), OLD, 'saved (Ctrl+S)'), frames: 8, key: 'r' }); s.push({ html: frame(vsc('s1_saved'), OLD, 'saved'), frames: null }); cards.fix = s; }
cards.proof = typed(OLD, CMD, lineHtml('after.log'), NEW, 'the invoice, before the fix', 'the same steps on the fixed code');
cards.close = [{ html: full('<div class="ch" style="margin-top:300px"><div class="t1" style="font-size:96px">Two lines in,<br>' + CO + 'two lines out.' + CE + '</div><div class="s">The check that found it now guards it.</div></div>'), frames: null }];
{ const PA = require('./priorart.json'), row = i => '<div class="pr"><div class="pn">' + esc(i.name) + '</div><div class="pd">' + esc(i.does) + '</div><div class="pt">' + esc(i.took) + '</div></div>';
  const css = `<style>.pa{margin:46px 70px 0;} .pa h1{font-size:54px;color:#F3EEE8} .pa h1 span{color:#FF6B78} .ph,.pr{display:grid;grid-template-columns:420px 640px 1fr;gap:26px} .ph{font-size:20px;color:#94a3b8;letter-spacing:2px;margin:26px 0 8px;text-transform:uppercase}
    .pr{padding:14px 0;border-top:1px solid #334155;font-size:25px;line-height:1.3} .pn{color:#7dd3fc;font-weight:700} .pd{color:#cbd5e1} .pt{color:#fbbf24} .pg{margin-top:26px;font-size:30px;color:#F3EEE8} .pg b{color:#7dd3fc} .cr{margin-top:14px;font-size:19px;color:#94a3b8}</style>`;
  cards.priorart = [{ html: full(css + '<div class="pa"><h1>Prior art: <span>what this learned from</span></h1><div class="ph"><div>source we read</div><div>what it does</div><div>what we took</div></div>' + PA.items.map(row).join('') +
    '<div class="pg">Every step, with the tools: <b>' + esc(PA.guide.url) + '</b> &nbsp;·&nbsp; ' + esc(PA.guide.sections) + '</div><div class="cr">Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real VS Code and the real ERP page</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (let i = 0; i < cards[id].length; i++) { const c = cards[id][i];
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'); const im = document.querySelector('.pg'), v = document.querySelector('.v'); return { over: t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, pg: im ? im.complete && im.naturalWidth > 0 : null, v: v ? v.complete && v.naturalWidth > 0 : null }; });
        if (m.pg === false || m.v === false) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
