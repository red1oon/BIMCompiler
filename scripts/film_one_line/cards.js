// ⚠ DO NOT REMOVE — film "One line" (§24): the cards, as PNG stills (1920x1080, headless Chrome on the CPU, --disable-gpu). Every command line and answer printed here is read from
// out/facts.json (the real runs of facts.js); nothing is typed in by hand. PLAYBOOK C: dark background, bottom 230 px left empty for captions. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const F = require('./out/facts.json'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const ZHL = process.env.FILM_LANG === 'zh';
const NAME = ZHL ? { DR: '草稿', CO: '已完成', VO: '已作废', CL: '已关闭', RE: '已冲销', PR: '准备' } : { DR: 'Draft', CO: 'Completed', VO: 'Voided', CL: 'Closed', RE: 'Reversed', PR: 'Prepare' }, ACT = ZHL ? { CO: '完成', PR: '准备', VO: '作废', CL: '关闭', RC: '冲销' } : { CO: 'Complete', PR: 'Prepare', VO: 'Void', CL: 'Close', RC: 'Reverse' };
// every on-screen text (the command lines and the diagram stay as they are: they are the product's own)
const T = ZHL ? { kick: 'BIM + ERP &nbsp;·&nbsp; 开源', t1: 'ERP 脚本', t2: '跳过界面', tp: '人用起来快，AI 用起来更快。', today: '今天：完成一张订单要……', todayBody: '打开菜单 <span>→</span> 找到窗口 <span>→</span><br>找到记录 <span>→</span> 找到页签 <span>→</span><br>找到按钮 <span>→</span> 确认',
  one: '一行命令', order: '订单', status: '状态', ask: '先问，再做', each: '每个动作都是一行', bld: '同一扇门，也能打开建筑模型', rooms: '个房间', walk: '个消防设备将被布置', script: '把几行写进文件，就是脚本', door: '人可以输入，AI 也用同样的命令。',
  othersH: '其他 ERP 提供什么？', rows: [['Odoo', '<code>odoo-bin shell</code>：给开发者的 Python 控制台'], ['ERPNext', '<code>bench execute</code>、<code>bench console</code>：运行 Python 函数或控制台'], ['Tryton', '<code>proteus</code>：用来写脚本的 Python 库'], ['NetSuite', 'SuiteCloud CLI：供开发者构建和部署项目的工具'], ['AI 连接器', '面向 Odoo、SAP、ERPNext：社区开发的通用记录读写工具']],
  foot: '它们都需要写代码，或者需要程序员。在这次查找中，我们没有找到一套人和 AI 都能直接输入的简短单据动作词汇。', src: '2026 年 11 月查阅各厂商官方页面和公开列表。这是一次查找，不是全面调查。未查 SAP 自有工具和 Dynamics 365。',
  closeBig: '一次一行', closeSub: '开源 &nbsp;·&nbsp; 目前 ' + F.verbs + ' 个动词' }
: { kick: 'BIM + ERP &nbsp;·&nbsp; OPEN SOURCE', t1: 'ERP Scripting', t2: 'Skip the screens', tp: 'For fast humans, and even faster AI.', today: 'Today: to complete one order', todayBody: 'open the menu <span>→</span> find the window <span>→</span><br>find the record <span>→</span> find the tab <span>→</span><br>find the button <span>→</span> confirm',
  one: 'One line', order: 'order', status: 'status', ask: 'Ask, then do', each: 'Each is one line', bld: 'The same door opens the building', rooms: 'rooms', walk: 'fire protection items would be placed', script: 'A few lines in a file are a script', door: 'People type it. An AI can use the same lines.',
  othersH: 'What do other ERPs offer?', rows: [['Odoo', '<code>odoo-bin shell</code>: a Python console for developers'], ['ERPNext', '<code>bench execute</code>, <code>bench console</code>: run a Python function or console'], ['Tryton', '<code>proteus</code>: a Python library to script the server'], ['NetSuite', 'SuiteCloud CLI: a developer tool to build and deploy projects'], ['AI connectors', 'for Odoo, SAP, ERPNext: community-built, generic record tools']],
  foot: 'Each needs code or a programmer. In this search we did not find one short vocabulary of document actions that a person and an AI both type.', src: 'Looked up November 2026 from the vendors\' own pages and public listings. A search, not a survey. SAP\'s own tools and Dynamics 365 were not checked.',
  closeBig: 'One line at a time', closeSub: 'Open source &nbsp;·&nbsp; ' + F.verbs + ' verbs today' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const L = (id) => F.lines[id].line;
const page = (inner, extra) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden}
.area{position:absolute;left:110px;right:110px;top:95px;height:735px}
h1{font-size:46px;color:#7dd3fc;font-weight:700;margin-bottom:34px}
.term{background:#0b0f17;border:2px solid #334155;border-radius:18px;padding:34px 40px;font-family:'DejaVu Sans Mono','Noto Sans CJK SC',monospace;font-size:38px;line-height:1.5}
.cmd{color:#F3EEE8;white-space:pre-wrap} .cmd:before{content:'> ';color:#4ade80}
.ans{color:#fbbf24;margin:2px 0 22px 46px} .ans b{color:#7dd3fc;font-weight:700} .dim{color:#94a3b8;font-size:30px;margin:0 0 20px 46px}
.big{font-size:150px;font-weight:700;text-align:center;margin-top:170px} .sub{font-size:44px;color:#FF6B78;text-align:center;margin-top:30px}
.plain{font-size:60px;line-height:1.5;margin-top:60px} .plain span{color:#94a3b8}
table{border-collapse:collapse;width:100%;font-size:32px} td{padding:13px 18px;border-bottom:1px solid #334155;vertical-align:top} td:first-child{color:#7dd3fc;font-weight:700;white-space:nowrap} .foot{font-size:32px;color:#fbbf24;margin-top:26px;line-height:1.4} .src{font-size:22px;color:#64748b;margin-top:12px}
.file{background:#111827;border:2px dashed #475569;border-radius:14px;padding:22px 30px;font-family:'DejaVu Sans Mono',monospace;font-size:34px;line-height:1.5;margin-bottom:26px} .file i{color:#94a3b8;font-style:normal;font-size:26px}
${extra || ''}</style></head><body><div class="area">${inner}</div></body></html>`;
const term = (rows) => '<div class="term">' + rows.join('') + '</div>';
const cmd = (s) => '<div class="cmd">' + esc(s) + '</div>', ans = (h) => '<div class="ans">' + h + '</div>', dim = (s) => '<div class="dim">' + esc(s) + '</div>';
const st = (c) => '<b>' + c + '</b> ' + NAME[c];
const more = (v) => [cmd(L(v)), ans(T.order + ' ' + F[v].number + ' &nbsp; ' + st(F[v].before.docStatus) + ' → ' + st(F[v].after.docStatus))];
const svg = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'figs', 'one_door.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');
const cards = {
  // the opening chapter card, house style (PLAYBOOK C: plain #0b0f17, kicker coral 34, title line 1 off-white 120, line 2 coral, one plain line 40; silent, 3.6 s)
  title: [page('<div class="ch"><div class="k">' + T.kick + '</div><div class="t1">' + T.t1 + '</div><div class="t2">' + T.t2 + '</div><div class="p">' + T.tp + '</div></div>', 'body{background:#0b0f17} .ch{text-align:center;margin-top:120px} .k{font-size:34px;color:#FF6B78;letter-spacing:4px;font-weight:700} .t1{font-size:120px;font-weight:700;color:#F3EEE8;margin-top:50px;line-height:1.1} .t2{font-size:120px;font-weight:700;color:#FF6B78;line-height:1.15} .p{font-size:40px;color:#F3EEE8;margin-top:56px}')],
  screens: [page('<h1>' + T.today + '</h1><div class="plain">' + T.todayBody + '</div>')],
  find: [page('<h1>' + T.one + '</h1>' + term([cmd(L('find'))])),
    page('<h1>' + T.one + '</h1>' + term([cmd(L('find')), ans(T.order + ' <b>' + F.find.number + '</b> &nbsp; ' + T.status + ' ' + st(F.find.docStatus))]))],
  do: [page('<h1>' + T.ask + '</h1>' + term([cmd(L('actions')), ans(F.actions.map(a => '<b>' + a + '</b> ' + ACT[a]).join(' &nbsp;·&nbsp; '))])),
    page('<h1>' + T.ask + '</h1>' + term([cmd(L('actions')), ans(F.actions.map(a => '<b>' + a + '</b> ' + ACT[a]).join(' &nbsp;·&nbsp; ')), cmd(L('complete')), ans(T.order + ' ' + F.order.number + ' &nbsp; ' + st(F.complete.before.docStatus) + ' → ' + st(F.complete.after.docStatus))]))],
  more: [page('<h1>' + T.each + '</h1>' + term(more('void'))), page('<h1>' + T.each + '</h1>' + term(more('void').concat(more('close')))), page('<h1>' + T.each + '</h1>' + term(more('void').concat(more('close'), more('reverse'))))],
  building: [page('<h1>' + T.bld + '</h1>' + term([cmd(L('rooms')), ans('<b>' + F.rooms + '</b> ' + T.rooms), dim('= ' + F.lines.rooms.doorLine)])),
    page('<h1>' + T.bld + '</h1>' + term([cmd(L('rooms')), ans('<b>' + F.rooms + '</b> ' + T.rooms), dim('= ' + F.lines.rooms.doorLine), cmd(L('walk')), ans('<b>' + F.walk + '</b> ' + T.walk), dim('= ' + F.lines.walk.doorLine)]))],
  script: [page('<h1>' + T.script + '</h1><div class="file"><i>order.txt</i><br>' + F.script.text.split('\n').map(esc).join('<br>') + '</div>'),
    page('<h1>' + T.script + '</h1><div class="file"><i>order.txt</i><br>' + F.script.text.split('\n').map(esc).join('<br>') + '</div>' + term([cmd('door --script order.txt'), ans(F.script.statuses.map(s => esc(s.replace(' ok', '')) + ' <b>ok</b>').join(' &nbsp;·&nbsp; ')), ans(T.status + ' ' + st(F.script.after.docStatus))]))],
  door: [page('<h1>' + T.door + '</h1><div style="background:#fff;border-radius:16px;padding:10px;height:620px;display:flex;justify-content:center">' + svg.replace('<svg', '<svg style="height:100%;width:auto"') + '</div>')],
  others: [page('<h1>' + T.othersH + '</h1><table>' + T.rows.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</table><div class="foot">' + T.foot + '</div><div class="src">' + T.src + '</div>')],
  close: [page('<div class="big" style="font-size:110px;margin-top:150px">' + T.closeBig + '</div><div class="sub">' + T.closeSub + '</div><div class="sub" style="color:#7dd3fc;font-size:38px;margin-top:60px">red1oon.github.io/BIMCompiler/FastScriptGuide</div>')]
};
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {};
  for (const id of Object.keys(cards)) { plan[id] = []; for (let i = 0; i < cards[id].length; i++) { const f = path.join(out, id + '_' + (i + 1) + '.png'); await pg.setContent(cards[id][i], { waitUntil: 'load' });
    const over = await pg.evaluate(() => { const a = document.querySelector('.area'); return Math.max(0, a.scrollHeight - a.clientHeight); });
    await pg.screenshot({ path: f }); plan[id].push(path.basename(f)); console.log('§CARD ' + path.basename(f) + ' overflow_px=' + over + (over ? ' TOO-TALL' : '')); } }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + Object.values(plan).reduce((s, x) => s + x.length, 0));
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
