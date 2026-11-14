// ⚠ DO NOT REMOVE — film "Model in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 1): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). Two frames: the terminal above (each line typed,
// one still per character, then its real answer) and the REAL Modeller canvas below (the pictures facts.js took of the session's page after each line). Every line, answer and picture is read from
// out/facts.json and out/erp/; nothing is typed in by hand. The bottom 230 px stay empty for the captions (PLAYBOOK C). Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const F = require('./' + (process.env.OUTD || 'out') + '/facts.json'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const LG = process.env.FILM_LANG || 'en', tr = (en, zh, th) => ({ en, zh, th }[LG] || en), FONT = { en: "'DejaVu Sans'", zh: "'Noto Sans CJK SC','DejaVu Sans'", th: "'Noto Sans Thai','DejaVu Sans'" }[LG];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const pics = {}, img = (id) => pics[id] || (pics[id] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, process.env.OUTD || 'out', F.states[id].file)).toString('base64'));   // the page is set as text, so the picture travels inside it
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden}
.term{position:absolute;left:28px;right:28px;top:14px;height:262px;background:#0b0f17;border:2px solid #334155;border-radius:14px;padding:14px 26px;font-family:'DejaVu Sans Mono',monospace;font-size:31px;line-height:1.42;overflow:hidden}
.cmd{color:#F3EEE8;white-space:pre} .cmd:before{content:'$ ';color:#4ade80}
.ans{color:#fbbf24;white-space:pre} .ans b{color:#7dd3fc;font-weight:700} .no{color:#f87171;font-weight:700} .dim{color:#94a3b8;font-size:24px;white-space:pre}
.fl{color:#cbd5e1;font-size:22px;line-height:1.32;white-space:pre}
.cur{display:inline-block;width:17px;height:32px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:282px;height:30px;background:#1e293b;color:#94a3b8;font-size:20px;line-height:30px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc;font-weight:700} .bar i{float:right;font-style:normal;color:#fbbf24;font-weight:700;letter-spacing:2px}
.erp{position:absolute;left:0;top:312px;width:1920px;height:537px;display:block}
.tag{position:absolute;left:28px;top:14px;font-size:0}`;
const split = (termInner, state) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="term">${termInner}</div><div class="bar">▼ <b>${tr('the Modeller canvas','ERP 窗口','หน้าต่าง ERP')}</b>${tr(', shown after each line','，在同一份数据上打开','เปิดบนข้อมูลเดียวกัน')}<i>${tr('PROTOTYPE','原型','ต้นแบบ')}</i></div><img class="erp" src="${img(state)}"></body></html>`;
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden} .ch{text-align:center;margin-top:230px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:128px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .t2{font-size:60px;font-weight:700;color:#FF6B78;line-height:1.3;margin-top:26px} .p{font-size:38px;color:#94a3b8;margin-top:40px}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body><div class="term" style="display:none"></div>${inner}</body></html>`;
// one beat: the line is typed over the picture of BEFORE; when the answer is printed the picture is the one taken AFTER the line
function beat(b) {
  const line = (k, done) => '<div class="cmd">' + esc(b.cmd.slice(0, k)) + (done ? '' : '<span class="cur"></span>') + '</div>';
  const st = [{ html: split(line(0, false), b.before), frames: 14 }];
  for (let k = 1; k <= b.cmd.length; k++) st.push({ html: split(line(k, false), b.before), frames: 1, key: 'k' });   // one character a frame at 24 fps: one key sound each
  st.push({ html: split(line(b.cmd.length, false), b.before), frames: 8, key: 'r' });                                  // the return key
  st.push({ html: split(line(b.cmd.length, true) + b.after.join(''), b.after_state), frames: null });
  return st;
}
const ans = (h) => '<div class="ans">' + h + '</div>', dim = (s) => '<div class="dim">' + esc(s) + '</div>', L = F.lines;
const A = F.add, usd = (n) => Number(n).toLocaleString('en-US') + ' USD';
const B = {
  open: { cmd: L.open.line, before: 's0', after_state: 's1', after: [ans('<b>' + A.sheets + '</b> sheets open · <b>' + A.bodies + '</b> bodies read (' + A.left_out + ' left out)'), ans('the gate is <b>open</b>: ready to convert')] },
  convert: { cmd: L.convert.line, before: 's1', after_state: 's2', after: [ans('<b>' + A.elements + '</b> elements made'), ans('add-a-bay is offered for <b>Farming Shed</b>')] },
  addbay_high: { cmd: L.addbay_high.line, before: 's2', after_state: 's3', after: [ans('one bay added at the <b>high</b> end · pitch <b>' + A.pitch + ' m</b>'), ans('<b>' + A.copies + '</b> copies (' + Object.keys(A.copiesByClass).map(k => k.replace('Ifc', '') + ' ' + A.copiesByClass[k]).join(' · ') + ')'), ans('gate <b>' + esc(A.gateHigh) + '</b> · cost <b>' + usd(A.costHigh.total) + '</b> (' + A.costHigh.added.toLocaleString('en-US') + ' added, ' + A.costHigh.changed.toLocaleString('en-US') + ' changed)')] },
  undo: { cmd: L.undo.line, before: 's3', after_state: 's4', after: [ans('undone: <b>' + L.undo.answer.elements_before + '</b> → <b>' + L.undo.answer.elements_after + '</b> elements')] },
  addbay_low: { cmd: L.addbay_low.line, before: 's4', after_state: 's5', after: [ans('one bay added at the <b>low</b> end · <b>' + L.addbay_low.answer.copies + '</b> copies'), ans('gate <b>' + esc(A.gateLow) + '</b> · cost <b>' + usd(A.costLow.total) + '</b>')] },
  refuse: { cmd: L.refuse.line, before: 's5', after_state: 's5', after: ['<div class="ans"><span class="no">refused</span> · <b>' + esc(String(F.add.refuseWhy).replace(/ \(.*$/, '')) + '</b></div>', dim('nothing was added: the model is as it was')] }
};
const cards = {
  cover: [{ html: full('<div class="ch"><div class="k">' + tr('COMMAND LINE  ·  CH 1','命令行 ERP  ·  第 0 章','ERP ผ่านบรรทัดคำสั่ง  ·  บทที่ 0') + '</div><div class="t1">' + tr('Model in Action','命令行实战','CLI ในการทำงานจริง') + '</div><div class="t2">' + tr('Open a drawing, convert it,<br>add a bay','回到老办法的数据增删改查，<br>外加一个强悍的 MIS','จัดการข้อมูลแบบกลับไปโรงเรียน<br>และ MIS ที่ทรงพลัง') + '</div><div class="p">' + tr('type a line above &nbsp;·&nbsp; see the Modeller canvas below','在上面输入一行命令 &nbsp;·&nbsp; 在下面看 ERP 窗口','พิมพ์หนึ่งบรรทัดด้านบน &nbsp;·&nbsp; ดูหน้าต่าง ERP ด้านล่าง') + '</div></div>'), frames: null }],
  close: [{ html: full('<div class="ch" style="margin-top:210px"><div class="t1" style="font-size:92px">' + tr('A drawing, three lines,<br>one more bay.','一张表格，一行命令，<br>一个可用的窗口。','หนึ่งชีต หนึ่งบรรทัด<br>หน้าต่างที่ใช้งานได้') + '</div><div class="t2" style="font-size:44px">' + tr('a prototype &nbsp;·&nbsp; open source','原型 &nbsp;·&nbsp; 开源','ต้นแบบ &nbsp;·&nbsp; โอเพนซอร์ส') + '</div><div class="p" style="color:#7dd3fc">red1oon.github.io/BIMCompiler/FastScriptGuide</div><div class="p" style="font-size:26px;margin-top:28px">' + tr('Key sounds: eklee, qubodup (CC BY 3.0, opengameart.org)','键盘声：eklee、qubodup（CC BY 3.0，opengameart.org）','เสียงคีย์บอร์ด: eklee, qubodup (CC BY 3.0, opengameart.org)') + '</div></div>'), frames: null }]
};
Object.keys(B).forEach(id => { cards[id] = beat(B[id]); });
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); plan[id] = []; let worst = 0, pic = 0;
    for (let i = 0; i < cards[id].length; i++) { const name = id + '_' + String(i + 1).padStart(3, '0') + '.png'; await pg.setContent(cards[id][i].html, { waitUntil: 'load' });
      const m = await pg.evaluate(() => { const t = document.querySelector('.term'), im = document.querySelector('.erp'); return { over: t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: im ? im.getBoundingClientRect().bottom - (window.innerHeight - 230) : 0, img: im ? (im.complete && im.naturalWidth > 0) : null, w: im ? im.naturalWidth : 0, h: im ? im.naturalHeight : 0 }; });
      worst = Math.max(worst, m.over, m.low); if (m.img === false) throw new Error('the ERP picture of ' + id + ' did not load'); if (m.img) pic = m.w + 'x' + m.h;
      await pg.screenshot({ path: path.join(out, name) }); const e = { file: name, frames: cards[id][i].frames }; if (cards[id][i].key) { e.key = cards[id][i].key; if (e.key === 'k') keys++; else rets++; } plan[id].push(e); n++; }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' stills=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '') + (pic ? ' erp_picture=' + pic : ' (full card)') + (B[id] ? ' typed=' + B[id].cmd.length + ' before=' + B[id].before + ' after=' + B[id].after_state : '')); }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall + ' key_stills=' + keys + ' return_stills=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
