// ⚠ DO NOT REMOVE — film "Information is Free" (prompts/FILM_INFORMATION_IS_FREE.md, CH 0; adapted from scripts/film_cli_in_action/cards.js): the stills (1920x1080 PNG, headless Chromium via Playwright on the CPU, --disable-gpu).
// Two frames: the terminal above (each line typed, one still per character, then its real answer from out/facts.json) and the REAL page below (out/shots/*.png, taken by capture.js). Cards: cover, the mantra (rendered from the spec's own lines),
// the credits. The bottom 230 px stay empty for the captions (PLAYBOOK C): every still is checked to hold ONE colour there. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/home/red1/bim-ootb/tests/node_modules/playwright');
const OD = process.env.OUTD || 'out', F = require('./' + OD + '/facts.json'), M = require('./mantra.js').parse(), out = path.resolve(process.argv[2] || OD + '/cards'); fs.mkdirSync(out, { recursive: true });
const FONT = "'DejaVu Sans'", esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pics = {}, img = (id) => pics[id] || (pics[id] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, OD, F.shots[id].file)).toString('base64'));
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden}
.term{position:absolute;left:28px;right:28px;top:14px;height:262px;background:#0b0f17;border:2px solid #334155;border-radius:14px;padding:14px 26px;font-family:'DejaVu Sans Mono',monospace;font-size:31px;line-height:1.42;overflow:hidden}
.cmd{color:#F3EEE8;white-space:pre} .cmd:before{content:'$ ';color:#4ade80}
.ans{color:#fbbf24;white-space:pre} .ans b{color:#7dd3fc;font-weight:700} .dim{color:#94a3b8;font-size:30px;white-space:pre}
.fl{color:#fbbf24;font-size:23px;line-height:1.4;white-space:pre}
.cur{display:inline-block;width:17px;height:32px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:282px;height:30px;background:#1e293b;color:#94a3b8;font-size:20px;line-height:30px;padding:0 28px;letter-spacing:1px;white-space:nowrap;overflow:hidden} .bar b{color:#7dd3fc;font-weight:700} .bar i{float:right;font-style:normal;color:#fbbf24;font-weight:700;letter-spacing:2px}
.erp{position:absolute;left:0;top:312px;width:1920px;height:537px;display:block}`;
const CAPD = String(F.shotsMade || '').slice(0, 10);
const bar = (s) => { const sh = F.shots[s], u = sh.url.replace(/^https:\/\//, ''); return '▼ <b>' + esc(u.length > 78 ? u.slice(0, 77) + '…' : u) + '</b>' + (sh.pickerText ? ' · login language: <b>' + esc(sh.pickerText) + '</b>' : '') + '<i>REAL PAGE · CAPTURED ' + CAPD + '</i>'; };
const split = (termInner, state) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="term">${termInner}</div><div class="bar">${bar(state)}</div><img class="erp" src="${img(state)}"></body></html>`;
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden} .ch{text-align:center;margin-top:230px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:128px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .t2{font-size:60px;font-weight:700;color:#FF6B78;line-height:1.3;margin-top:26px} .p{font-size:38px;color:#94a3b8;margin-top:40px}
.mk{font-size:30px;color:#FF6B78;letter-spacing:6px;font-weight:700;text-align:center;margin-top:150px} .mline{white-space:pre;text-align:center;font-size:62px;font-weight:700;color:#F3EEE8;margin-top:62px;line-height:1.15} .msrc{text-align:center;font-size:22px;color:#94a3b8;margin:92px auto 0;width:1800px;line-height:1.5}
.cn{font-size:84px;font-weight:700;color:#F3EEE8;text-align:center;margin-top:92px} .ce{font-size:46px;color:#7dd3fc;text-align:center;margin-top:16px} .cl{font-size:40px;color:#FF6B78;font-weight:700;text-align:center;margin-top:28px} .cu{font-size:38px;color:#7dd3fc;text-align:center;margin-top:16px} .cs{font-size:25px;color:#94a3b8;text-align:center;margin-top:12px}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body><div class="term" style="display:none"></div>${inner}</body></html>`;
// a typed beat: the line is typed over the picture of BEFORE; after the return key the lower frame shows the page the line refers to (`states`: [state, frames|null])
const ans = (h) => '<div class="ans">' + h + '</div>';
function beat(b) {
  const st = [];
  if (b.cmd) {
    const line = (k, done) => '<div class="cmd">' + esc(b.cmd.slice(0, k)) + (done ? '' : '<span class="cur"></span>') + '</div>';
    st.push({ html: split(line(0, false), b.before), frames: 14, typing: true });
    for (let k = 1; k <= b.cmd.length; k++) st.push({ html: split(line(k, false), b.before), frames: 1, key: 'k', typing: true });   // one character a frame at 24 fps: one key sound each
    st.push({ html: split(line(b.cmd.length, false), b.before), frames: 8, key: 'r', typing: true });                                  // the return key
    b.states.forEach(([s, fr]) => st.push({ html: split(line(b.cmd.length, true) + b.after, s), frames: fr, state: s }));
  } else b.states.forEach(([s, fr]) => st.push({ html: split('<div class="dim">' + esc(b.comment) + '</div>', s), frames: fr, state: s }));   // no command: one plain line, nothing typed, no key sound
  return st;
}
const L = F.lines, fsgRows = (() => { const f = L.fsg.answer, h = Math.ceil(f.length / 2); return '<div class="fl">' + esc(f.slice(0, h).join('   ')) + '\n' + esc(f.slice(h).join('   ')) + '</div>'; })();
const B = {
  clone: { cmd: L.clone.cmd, before: 'gh_repo', after: ans(esc(L.clone.answer[0])), states: [['gh_repo', null]] },
  prompts: { cmd: L.prompts.cmd, before: 'gh_repo', after: ans('<b>' + esc(L.prompts.answer[0]) + '</b>'), states: [['gh_spec', null]] },
  docs: { cmd: L.docs.cmd, before: 'gh_spec', after: ans('<b>' + esc(L.docs.answer[0]) + '</b>'), states: [['site_home', null]] },
  fsg: { cmd: L.fsg.cmd, before: 'site_home', after: fsgRows, states: [['guide_en', 130], ['guide_menu', 80], ['guide_es', 56], ['guide_ja', 44], ['guide_de', null]] },
  login: { comment: '# the product itself: its login screen (nothing is typed, nobody logs in)', states: [['login_en', null], ['login_es', null], ['login_ja', null], ['login_zh', null]] },
  license: { cmd: L.license.cmd, before: 'login_zh', after: ans('<b>' + esc(L.license.answer[0]) + '</b>'), states: [['gh_license', null]] }
};
const cards = {
  cover: [{ html: full('<div class="ch"><div class="k">CH 0</div><div class="t1">Information is Free</div><div class="t2">You have to Know</div></div>'), frames: null }],
  mantra: [{ html: full('<div class="mk">A NEW CONSTITUTION</div>' + M.map(l => '<div class="mline">' + esc(l) + '</div>').join('') + '<div class="msrc">Source: red1.org, page "red1 open source empire", under "A NEW CONSTITUTION" (Web Archive captures 2008-04-04 and 2009-01-29).<br>Second source: ADempiere community wiki, "Information is free": the 3-line mantra propounded by R. Oon.</div>'), frames: null, mantra: true }],
  credits: [{ html: full('<div class="cn">Redhuan D. Oon</div><div class="ce">red1org@gmail.com</div><div class="cl">MIT License</div><div class="cu">github.com/red1oon/BIMCompiler</div><div class="cu">github.com/red1oon/bim-ootb</div><div class="cu">red1oon.github.io/BIMCompiler</div><div class="cs" style="margin-top:44px">Key sounds: eklee, qubodup (CC BY 3.0, opengameart.org)</div><div class="cs">Voices: Kokoro (local)</div>'), frames: null }]
};
Object.keys(B).forEach(id => { cards[id] = beat(B[id]); });
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu', '--use-gl=swiftshader'] }), pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const plan = {}, mdom = [], texts = {}; let n = 0, tall = 0, keys = 0, rets = 0, dirty = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); plan[id] = []; let worst = 0, pic = [];
    for (let i = 0; i < cards[id].length; i++) { const name = id + '_' + String(i + 1).padStart(3, '0') + '.png'; await pg.setContent(cards[id][i].html, { waitUntil: 'load' });
      const m = await pg.evaluate(() => { const t = document.querySelector('.term'), im = document.querySelector('.erp'), c = document.querySelector('.ch, .cn, .mk'), last = Array.from(document.body.children).filter(e => e.getBoundingClientRect().height > 0).pop(); return { over: t && t.offsetHeight ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: im ? im.getBoundingClientRect().bottom - (window.innerHeight - 230) : (last ? last.getBoundingClientRect().bottom - (window.innerHeight - 230) : 0), img: im ? (im.complete && im.naturalWidth > 0) : null, w: im ? im.naturalWidth : 0, h: im ? im.naturalHeight : 0 }; });
      if (['cover', 'credits'].includes(id)) texts[id] = await pg.evaluate(() => document.body.innerText);
      if (cards[id][i].mantra) mdom.push(...(await pg.evaluate(() => Array.from(document.querySelectorAll('.mline')).map(e => ({ text: e.textContent, inner: e.innerText })))));
      worst = Math.max(worst, m.over, m.low); if (m.img === false) throw new Error('the page picture of ' + id + ' did not load'); if (m.img && cards[id][i].state) pic.push(cards[id][i].state + ':' + m.w + 'x' + m.h);
      const f = path.join(out, name); await pg.screenshot({ path: f });
      const colours = +execFileSync('convert', [f, '-crop', '1920x230+0+850', '+repage', '-format', '%k', 'info:'], { encoding: 'utf8' }).trim(); if (colours !== 1) { dirty++; console.log('§CARD_BOTTOM_DIRTY ' + name + ' colours_in_bottom_230px=' + colours); }
      const e = { file: name, frames: cards[id][i].frames }; if (cards[id][i].typing) e.typing = true; if (cards[id][i].key) { e.key = cards[id][i].key; if (e.key === 'k') keys++; else rets++; } plan[id].push(e); n++; }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' stills=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '') + (pic.length ? ' page_pictures=' + Array.from(new Set(pic)).join(',') : ' (full card)') + (B[id] && B[id].cmd ? ' typed=' + B[id].cmd.length + ' before=' + B[id].before : (B[id] ? ' (no command)' : ''))); }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); fs.writeFileSync(path.join(out, 'mantra_dom.json'), JSON.stringify(mdom, null, 1)); fs.writeFileSync(path.join(out, 'card_text.json'), JSON.stringify(texts, null, 1));
  console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall + ' key_stills=' + keys + ' return_stills=' + rets + ' bottom230_dirty=' + dirty + ' mantra_lines_rendered=' + mdom.length); if (dirty) process.exit(1);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
