// ⚠ DO NOT REMOVE — film "MIS Menu Driven" (prompts/FILM_COMMAND_LINE_ERP.md, CH 2): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). Two frames, as CH 0: the terminal above (each
// line or key typed, one still per character, a key sound on each; then the REAL answer or the REAL screen, recorded by facts.js from the same menuSession `door.js /M` runs) and the REAL ERP page below
// (facts.js's pictures). The last card shows the measured costs, the proof run during the build and the credits read from the checkout. Nothing is typed in by hand. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OD = process.env.OUTD || 'out', F = require('./' + OD + '/facts.json'), out = path.resolve(process.argv[2] || OD + '/cards'); fs.mkdirSync(out, { recursive: true });
const LG = process.env.FILM_LANG || 'en', tr = (en, zh, ms) => ({ en, zh, ms }[LG] || en), FONT = { en: "'DejaVu Sans'", zh: "'Noto Sans CJK SC','DejaVu Sans'", ms: "'DejaVu Sans'" }[LG] || "'DejaVu Sans'";   // ms: translated by the build session, NOT reviewed by a native speaker   // zh: translated by the build session, NOT reviewed by a native speaker
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pics = {}, img = (id) => pics[id] || (pics[id] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, OD, F.states[id].file)).toString('base64'));
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden}
.term{position:absolute;left:28px;right:28px;top:14px;height:262px;background:#0b0f17;border:2px solid #334155;border-radius:14px;padding:12px 26px;font-family:'DejaVu Sans Mono',monospace;font-size:31px;line-height:1.42;overflow:hidden}
.cmd{color:#F3EEE8;white-space:pre} .cmd:before{content:'$ ';color:#4ade80}
.ans{color:#fbbf24;white-space:pre} .ans b{color:#7dd3fc;font-weight:700} .dim{color:#94a3b8;font-size:22px;line-height:1.3;white-space:pre}
.scr{color:#e2e8f0;font-size:21px;line-height:1.28;white-space:pre} .scr .hd{color:#7dd3fc;font-weight:700} .scr .cu{color:#0b0f17;background:#4ade80} .scr .nt{color:#fbbf24}
.keys{color:#4ade80;font-size:21px;line-height:1.28;white-space:pre}
.cur{display:inline-block;width:17px;height:32px;background:#4ade80;vertical-align:-5px;margin-left:2px} .kc{display:inline-block;width:12px;height:22px;background:#4ade80;vertical-align:-4px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:282px;height:30px;background:#1e293b;color:#94a3b8;font-size:20px;line-height:30px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc;font-weight:700} .bar i{float:right;font-style:normal;color:#fbbf24;font-weight:700;letter-spacing:2px}
.erp{position:absolute;left:0;top:312px;width:1920px;height:537px;display:block}`;
const split = (termInner, state) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="term">${termInner}</div><div class="bar">▼ <b>${tr('the ERP window','ERP 窗口', 'tetingkap ERP')}</b>${tr(', opened on the same data','，在同一份数据上打开', ', dibuka pada data yang sama')}<i>${tr('PROTOTYPE','原型', 'PROTOTAIP')}</i></div><img class="erp" src="${img(state)}"></body></html>`;
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden} .ch{text-align:center;margin-top:230px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:128px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .t2{font-size:44px;color:#94a3b8;margin-top:34px}
.cols{display:flex;gap:34px;margin:70px 60px 0 60px} .col{flex:1;background:#111827;border:2px solid #334155;border-radius:18px;padding:26px 30px} .col h2{font-size:34px;letter-spacing:5px;color:#FF6B78;margin-bottom:18px} .col p{font-size:27px;line-height:1.38;color:#e2e8f0;margin-bottom:12px} .col b{color:#7dd3fc} .col .s{color:#94a3b8;font-size:22px}
.ttl{text-align:center;font-size:56px;font-weight:700;margin-top:56px}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body><div class="term" style="display:none"></div>${inner}</body></html>`;
// a recorded screen, cut to what the terminal frame holds: its first line, the rows around the pointer, its last line (the note or the find prompt)
function screen(lines, keyLine, noNote) {
  const L = lines.slice(), head = L.shift(), last = !noNote && L.length > 1 ? L.pop() : '', ci = Math.max(0, L.findIndex(x => /^> /.test(x))), from = Math.max(0, Math.min(ci - 2, L.length - 5)), mid = L.slice(from, from + 5);
  const row = (x) => /^> /.test(x) ? '<span class="cu">' + esc(x) + '</span>' : esc(x);
  return '<div class="scr"><span class="hd">' + esc(head) + '</span>\n' + mid.map(row).join('\n') + (last ? '\n<span class="nt">' + esc(last) + '</span>' : '') + '</div>' + (keyLine != null ? '<div class="keys">' + keyLine + '</div>' : '');
}
// a typed line: typed over the picture of BEFORE; with its answer the picture is the one taken AFTER (CH 0's beat)
function typed(b) {
  const line = (k, done) => '<div class="cmd">' + esc(b.cmd.slice(0, k)) + (done ? '' : '<span class="cur"></span>') + '</div>';
  const st = [{ html: split(line(0, false), b.before), frames: 14 }];
  for (let k = 1; k <= b.cmd.length; k++) st.push({ html: split(line(k, false), b.before), frames: 1, key: 'k' });
  st.push({ html: split(line(b.cmd.length, false), b.before), frames: 8, key: 'r' });
  st.push({ html: split(line(b.cmd.length, true) + b.after, b.after_state), frames: null });
  return st;
}
// keys on the screen: each key shows the screen the app drew after it (recorded), a key sound each; the last still holds
const SEQ = F.seq, KN = { Enter: '⏎', Esc: 'Esc', '/': '/' };
function keyed(beatId, before, after, lead) {
  const items = SEQ.filter(x => x.beat === beatId), st = []; let typedK = '', scr = null;
  const prev = SEQ.slice(0, SEQ.indexOf(items[0])).filter(x => x.screen).pop(); scr = prev ? prev.screen : null;
  st.push({ html: split(screen(scr, 'keys: <span class="kc"></span>'), before), frames: 14 });
  const lines = [];
  items.forEach((x, i) => {
    if (x.key) { typedK += (KN[x.key] || x.key) + (x.key.length > 1 ? ' ' : ''); const nxt = items.slice(i + 1).find(y => y.screen); const isRet = x.key === 'Enter' || x.key === 'Esc' || /^\d$/.test(x.key);
      if (!isRet && nxt) scr = nxt.screen; st.push({ html: split(screen(scr, 'keys: ' + esc(typedK) + '<span class="kc"></span>'), before), frames: isRet ? 8 : 4, key: isRet ? 'r' : 'k' }); }
    else if (x.line && x.line.charAt(0) !== '(') lines.push(x.line);   // the door lines the screen ran (the hand-over note is not one)
  });
  const end = items.filter(x => x.screen).pop().screen;
  st.push({ html: split((lead ? '<div class="dim">' + lines.map(l => '-> ' + esc(l.length > 118 ? l.slice(0, 117) + '…' : l)).join('\n') + '</div>' : '') + screen(lead ? end.slice(0, 4) : end, 'keys: ' + esc(typedK), lead), after), frames: null });
  return st;
}
const ans = (h) => '<div class="ans">' + h + '</div>', L = F.lines;
const rowsTxt = '<div class="dim">' + ['Value         Name'].concat(F.still1.rows.map(r => (r.Value + '              ').slice(0, 14) + r.Name)).map(esc).join('\n') + '</div>';
const cards = {
  cover: [{ html: full('<div class="ch"><div class="k">' + tr('COMMAND LINE ERP  ·  CH 2', '命令行 ERP  ·  第 2 章', 'ERP BARIS ARAHAN  ·  BAB 2') + '</div><div class="t1">' + tr('MIS Menu Driven', 'MIS 菜单驱动', 'MIS Dipacu Menu') + '</div><div class="t2">' + tr('The same lines, and now a menu', '同样的命令行，现在还有菜单', 'Baris yang sama, dan kini ada menu') + '</div></div>'), frames: null }],
  still1: typed({ cmd: L.still1.line, before: 's0', after_state: 's1', after: rowsTxt + ans(tr('<b>' + F.still1.rows.length + '</b> groups · the window below: record 1 of <b>' + F.states.s1.records + '</b>', '<b>' + F.still1.rows.length + '</b> 个组 · 下面的窗口：共 <b>' + F.states.s1.records + '</b> 条记录', '<b>' + F.still1.rows.length + '</b> kumpulan · tetingkap di bawah: rekod 1 daripada <b>' + F.states.s1.records + '</b>')) }),
  still2: typed({ cmd: L.still2.line, before: 's1', after_state: 's2', after: ans(tr('created <b>' + esc(F.still2.number) + '</b> · the window: <b>' + F.still2.windowRows + '</b> records', '已创建 <b>' + esc(F.still2.number) + '</b> · 窗口：<b>' + F.still2.windowRows + '</b> 条记录', 'dicipta <b>' + esc(F.still2.number) + '</b> · tetingkap: <b>' + F.still2.windowRows + '</b> rekod')) }),
  menu: typed({ cmd: '/M role=102', before: 's2', after_state: 'sM', after: screen(SEQ.find(x => x.beat === 'menu' && x.screen).screen.slice(0, 6)) }),
  find: keyed('find', 'sM', 'sM', false),
  open: keyed('open', 'sM', 's3', true),
  back: keyed('back', 's3', 'sM', false),
  close: [{ html: full('<div class="ttl">' + tr('Costs, checks, credits', '成本 · 检查 · 致谢', 'Kos, semakan, penghargaan') + '</div><div class="cols">' +
    '<div class="col"><h2>' + tr('COSTS', '成本', 'KOS') + '</h2><p>' + tr('a door line here: ', '这里一行命令：', 'satu baris arahan di sini: ') + '<b>' + Math.min(L.still1.ms, L.menuRead.ms, L.findRead.ms) + '–' + Math.max(L.still1.ms, L.menuRead.ms, L.findRead.ms) + ' ms</b>' + tr('; a new record: ', '；新建一条记录：', '; satu rekod baharu: ') + '<b>' + L.still2.ms + ' ms</b></p><p>' + tr('needs <b>Node.js</b> (' + esc(F.costs.node) + ' here) and the checkout', '需要 <b>Node.js</b>（这里是 ' + esc(F.costs.node) + '）和代码库', 'perlu <b>Node.js</b> (' + esc(F.costs.node) + ' di sini) dan salinan kod') + '</p><p>' + tr('<b>no server</b>, no database server, <b>no licence fee</b>', '<b>无需服务器</b>，无需数据库服务器，<b>无许可费</b>', '<b>tiada pelayan</b>, tiada pelayan pangkalan data, <b>tiada yuran lesen</b>') + '</p><p class="s">' + tr('measured on this laptop\'s CPU, in this build', '在这台笔记本电脑的 CPU 上、在这次构建中测得', 'diukur pada CPU komputer riba ini, dalam binaan ini') + '</p></div>' +
    '<div class="col"><h2>' + tr('CHECKS', '检查', 'SEMAKAN') + '</h2><p>W-MIS-MENU: ' + tr('<b>' + F.proof.pass + ' of ' + (F.proof.pass + F.proof.fail) + '</b> claims pass, run in this build', '<b>' + F.proof.pass + ' / ' + (F.proof.pass + F.proof.fail) + '</b> 项通过，在这次构建中运行', '<b>' + F.proof.pass + ' daripada ' + (F.proof.pass + F.proof.fail) + '</b> tuntutan lulus, dijalankan dalam binaan ini') + '</p><p>' + tr('the menu: <b>' + F.proof.entries + '</b> entries, <b>' + F.proof.windows + '</b> windows, the same by plain SQL', '菜单：<b>' + F.proof.entries + '</b> 个条目，<b>' + F.proof.windows + '</b> 个窗口，用 SQL 直接核对一致', 'menu: <b>' + F.proof.entries + '</b> entri, <b>' + F.proof.windows + '</b> tetingkap, sama apabila dikira dengan SQL') + '</p><p>' + tr('role 102: <b>' + F.proof.role102 + '</b> entries · role 103: <b>' + F.proof.role103 + '</b>', '角色 102：<b>' + F.proof.role102 + '</b> 个条目 · 角色 103：<b>' + F.proof.role103 + '</b>', 'peranan 102: <b>' + F.proof.role102 + '</b> entri · peranan 103: <b>' + F.proof.role103 + '</b>') + '</p><p>' + tr('the browser shows the same <b>' + F.pane.doorEntries + '</b>, and <b>' + F.pane.pluginEntries.length + '</b> plugin window it loads (' + esc(F.pane.pluginEntries.join(', ')) + ')', '浏览器显示同样的 <b>' + F.pane.doorEntries + '</b> 个，外加它加载的 <b>' + F.pane.pluginEntries.length + '</b> 个插件窗口（' + esc(F.pane.pluginEntries.join('、')) + '）', 'pelayar menunjukkan <b>' + F.pane.doorEntries + '</b> yang sama, dan <b>' + F.pane.pluginEntries.length + '</b> tetingkap pemalam yang dimuatkannya (' + esc(F.pane.pluginEntries.join(', ')) + ')') + '</p></div>' +
    '<div class="col"><h2>' + tr('CREDITS', '致谢', 'PENGHARGAAN') + '</h2><p><b>' + esc(F.credits.copyright) + '</b></p><p>' + esc(F.credits.licence) + '</p><p>' + tr('the ERP kernel folded from the <b>' + esc(String(F.credits.lineage).replace(/\s*lineage$/, '')) + '</b> lineage', 'ERP 内核源自 <b>' + esc(String(F.credits.lineage).replace(/\s*lineage$/, '')) + '</b> 这一脉', 'kernel ERP berasal daripada keturunan <b>' + esc(String(F.credits.lineage).replace(/\s*lineage$/, '')) + '</b>') + '</p><p class="s">' + tr('every screen in this film was recorded from the running code', '片中每个画面都录自正在运行的代码', 'setiap skrin dalam filem ini dirakam daripada kod yang sedang berjalan') + '</p></div></div>'), frames: null }]
};
cards.end = cards.close.map(x => Object.assign({}, x));   // the end beat holds the same card
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); plan[id] = []; let worst = 0;
    for (let i = 0; i < cards[id].length; i++) { const name = id + '_' + String(i + 1).padStart(3, '0') + '.png'; await pg.setContent(cards[id][i].html, { waitUntil: 'load' });
      const m = await pg.evaluate(() => { const t = document.querySelector('.term'), im = document.querySelector('.erp'), cols = Array.from(document.querySelectorAll('.col')); return { over: t && t.style.display !== 'none' ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: im ? im.getBoundingClientRect().bottom - (window.innerHeight - 230) : Math.max(0, ...cols.map(c => c.getBoundingClientRect().bottom - (window.innerHeight - 230))), img: im ? (im.complete && im.naturalWidth > 0) : null }; });
      worst = Math.max(worst, m.over, m.low); if (m.img === false) throw new Error('the ERP picture of ' + id + ' did not load');
      await pg.screenshot({ path: path.join(out, name) }); const e = { file: name, frames: cards[id][i].frames }; if (cards[id][i].key) { e.key = cards[id][i].key; if (e.key === 'k') keys++; else rets++; } plan[id].push(e); n++; }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' stills=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall + ' key_stills=' + keys + ' return_stills=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
