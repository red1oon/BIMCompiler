// ⚠ DO NOT REMOVE — film "Help that answers" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11; house style prompts/FILM_NARRATION.md): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu).
// TWO frames: above, the typed question or the page's own § log lines (real lines from out/facts.json and the witness logs); below, the REAL ERP page (out/pages/*.png): the whole page scaled to the band
// on the left, and the help panel cut from the SAME pixels on the right, at the scale that fits, labelled with that scale. The bottom 170 px stay empty for the captions. Nothing is typed in by hand. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), out = path.resolve(process.argv[2] || path.join(OUT, 'cards')); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const W1 = fs.readFileSync(path.join(OUT, 'witness_field_help_main.log'), 'utf8'), W2 = fs.readFileSync(path.join(OUT, 'witness_help_showcase_main.log'), 'utf8');
const ZH = (process.env.FILM_LANG || 'en') === 'zh', LB = F.lb;
// the words of the cards, per cut. Code, log lines, file names and the names of sources stay as they are in both; the Mandarin cut's words are translated by the build session (said on the last card).
const LANGC = process.env.FILM_LANG || 'en', DE = LANGC === 'de';
const DE_T = {
  bar: (st) => `▲ <b>eingegeben</b> ins Feld „How To“, und das eigene § Protokoll der Seite &nbsp;·&nbsp; ▼ <b>der ERP-Zwilling</b>, die echte Seite &nbsp;·&nbsp; ${st}`,
  barCli: (st) => `▲ <b>red1</b>, die Kommandozeile (Terminal auf de_DE) &nbsp;·&nbsp; ▼ <b>der ERP-Zwilling</b>, dieselbe Antwort auf der Seite &nbsp;·&nbsp; ${st}`,
  lab: (sc) => 'das Hilfefenster, die eigenen Pixel der Seite, ' + (sc === 1 ? '1:1' : (sc > 1 ? 'vergrößert ' : 'verkleinert ') + sc.toFixed(2).replace(/0$/, '') + 'x'),
  kicker: 'KERNEL-ERP · HILFE', title: 'Hilfe, die <span style="color:#FF6B78">antwortet</span>', sub: 'Feldhilfe, eine Frage-Box und Anleitungen, im Fenster', line: 'Die echte Seite, ohne Bildschirm · Deutsch (englische Untertitel)',
  quoteZh: '„Ein typischer Interaktionsmitarbeiter verbringt schätzungsweise 28 Prozent der Arbeitswoche mit E-Mails und fast 20 Prozent mit der Suche nach internen Informationen oder nach Kollegen, die bei bestimmten Aufgaben helfen können.“', quoteZhNote: 'Deutsche Übersetzung von der Build-Sitzung, nicht von Muttersprachlern geprüft',
  fetched: 'Kopie abgerufen', before1: 'vorher (vor #3126): ', now1: 'jetzt: die eigene Beschreibung des Felds, wie im Original (WEditor.java:333); Spalte · Typ nur noch im Protokoll:',
  st: { before: 'ins Feld Belegnr. klicken: das Tool-Tip-Fenster', idle: 'noch kein Feld gewählt', card: 'die Antwortkarte, aus dem Wörterbuch', link: 'der Link der Karte öffnete Auftrag: daneben seine Anleitung, aus dem Handbuch', open: 'Auftrag geöffnet', pay: 'die Antwortkarte', lb: 'Deutsch gewählt: dasselbe Feld',
    beforeUi: 'ins Feld Beschreibung klicken: das Tool-Tip-Fenster (Deutsch)', pay2: 'die Antwortkarte für eine Rechnung', cli: 'dieselbe Frage an der red1-Kommandozeile: ihre echte Antwort' },
  lbLang: 'Deutsch', english: 'englisches Original (Wörterbuch): ', fallback: null,
  h1: 'Was es kostet, <span style="color:#FF6B78">was wir gelernt haben</span>, wer dahintersteht', cost: 'Kosten, gemessen', prior: 'Vorbild: die Lehre', cred: 'Projekt-Nachweise',
  heap: (a, b, d) => '<b>Speicher, deutsche Sitzung</b> (nach erzwungener Bereinigung, je ein Lauf)<br>mit Hilfepaket ' + a + ' · ohne ' + b + ' · <i>' + d + '</i>', packs: '<b>Hilfepaket, einmal je Sprache geladen</b>', fields: '<b>Felder mit Übersetzung</b>', seed: '<b>Nie in der Seed-Datenbank</b><br>eine eigene Datei, nur die gewählte Sprache',
  feature: '<b>Diese Funktion</b>', featureHead: '<b>Diese Funktion</b>', merged: '(zusammengeführt)', witnessed: '<b>Bezeugt auf main ', guide: '<b>ERP-Benutzerhandbuch</b>', paper: '<b>Paper</b>: Deterministic Spatial Compilation<br>Prioritätsdatum ',
  credit: 'Eingangszitat: McKinsey Global Institute, <i>The social economy</i>, Juli 2012 · deutscher Text: das veröffentlichte de_DE-Paket (Team Germany), unverändert · Sprecher, Untertitel und Karten auf Deutsch von der Build-Sitzung übersetzt, nicht von Muttersprachlern geprüft · Tastengeräusche: eklee und qubodup, OpenGameArt „Single Key Press Sounds“, CC BY 3.0 · Bilder: die echte ERP-Seite, ohne Bildschirm auf der CPU' };
const T = DE ? DE_T : ZH ? {
  bar: (st) => `▲ <b>输入</b>到“操作说明”框中的内容，以及页面自己的 § 日志 &nbsp;·&nbsp; ▼ <b>ERP 孪生系统</b>，真实页面 &nbsp;·&nbsp; ${st}`,
  lab: (sc) => '帮助面板：页面自己的像素，' + (sc === 1 ? '原尺寸' : (sc > 1 ? '放大 ' : '缩小为 ') + sc.toFixed(2).replace(/0$/, '') + ' 倍'),
  kicker: 'KERNEL-ERP · 帮助', title: '会' + '<span style="color:#FF6B78">回答问题</span>' + '的帮助', sub: '字段帮助、提问框和操作说明，都在窗口里', line: '真实页面，无头浏览器 · 普通话（英文字幕）',
  quoteZh: '“一般的交互型员工估计把每周工作时间的 28% 用于处理电子邮件，近 20% 用于查找内部信息，或寻找能帮助完成具体任务的同事。”', quoteZhNote: '中文译文由构建会话翻译，未经母语者审校',
  fetched: '副本取于', before1: '以前（#3126 之前）：', now1: '现在：字段自己的说明，与原版一致（WEditor.java:333）；列名 · 类型只写进日志：',
  st: { before: '点进“Document No”：提示面板', idle: '尚未聚焦任何字段', card: '回答卡片，来自字典', link: '卡片的链接打开了销售订单：旁边是它的操作说明，来自指南', open: '销售订单已打开', pay: '付款的回答卡片', lb: '选择了中文：同一个订单', beforeUi: '点进“描述”字段：提示面板（中文）', pay2: '发票的回答卡片', cli: '同一个问题，在 red1 命令行里：它真实的回答' },
  barCli: (st) => `▲ <b>red1</b> 命令行（终端语言 zh_CN） &nbsp;·&nbsp; ▼ <b>ERP 孪生系统</b>，同一个答案在页面上 &nbsp;·&nbsp; ${st}`,
  lbLang: '中文', english: '英文原文（字典）：', fallback: '文档号：中文语言包里没有它的文字，所以显示英文：',
  h1: '代价、' + '<span style="color:#FF6B78">借鉴</span>' + '、以及背后的项目', cost: '代价（实测）', prior: '借鉴的先例', cred: '项目凭证',
  heap: (a, b, d) => '<b>中文会话的内存</b>（强制回收后，各测一次）<br>有帮助包 ' + a + ' · 没有 ' + b + ' · <i>' + d + '</i>', packs: '<b>帮助包，每种语言只下载一次</b>', fields: '<b>有翻译的字段</b>', seed: '<b>从不放进种子数据库</b><br>单独的文件，只下载所选语言',
  feature: '<b>本功能</b><br>#3126 字段帮助 · #3128 帮助包、搜索、操作说明（已合并）', featureHead: '<b>本功能</b>', merged: '（已合并）', witnessed: '<b>在 main 上见证 ', guide: '<b>ERP 用户指南</b>', paper: '<b>论文</b>：确定性空间编译<br>优先权日期 ',
  credit: '开场引语：麦肯锡全球研究院，<i>The social economy</i>，2012 年 7 月 · 中文文字：已发布的 zh_CN 语言包，未改动 · 旁白、字幕和卡片中文由构建会话翻译，未经母语者审校 · 按键声：eklee 与 qubodup，OpenGameArt “Single Key Press Sounds”，CC BY 3.0 · 画面：真实 ERP 页面，CPU 上的无头浏览器' }
: {
  bar: (st) => `▲ <b>typed</b> into the How To box, and the page's own § log &nbsp;·&nbsp; ▼ <b>the ERP twin</b>, the real page &nbsp;·&nbsp; ${st}`,
  lab: (sc) => 'the help panel, the page\'s own pixels, ' + (sc === 1 ? 'at 1x' : (sc > 1 ? 'enlarged ' : 'reduced ') + sc.toFixed(2).replace(/0$/, '') + 'x'),
  kicker: 'KERNEL-ERP · HELP', title: 'Help that <span style="color:#FF6B78">answers</span>', sub: 'Field help, a question box and how-to, inside the window', line: 'The real page, headless · English',
  quoteZh: null, fetched: 'copy fetched', before1: 'before (#3126), ', now1: 'now: the field\'s own Description, as legacy (WEditor.java:333) — the column · type goes to the log only:',
  st: { before: 'click into Document No: the Tool Tip panel', idle: 'nothing focused yet', card: 'the answer card, from the dictionary', link: 'the card\'s link opened Sales Order: its how-to, from the guide', open: 'Sales Order open', pay: 'the answer card for a payment', lb: 'Deutsch chosen: the same field', beforeUi: 'click into Description: the Tool Tip panel', pay2: 'the answer card', cli: 'the same question at the red1 prompt: its real answer' },
  barCli: (st) => `▲ <b>red1</b>, the command line &nbsp;·&nbsp; ▼ <b>the ERP twin</b>, the same answer on the page &nbsp;·&nbsp; ${st}`,
  lbLang: 'Deutsch', english: 'English original (the dictionary): ', fallback: null,
  h1: 'What it costs, <span style="color:#FF6B78">what we learned</span>, who stands behind it', cost: 'cost, measured', prior: 'prior art: the lesson', cred: 'project credentials',
  heap: (a, b, d) => '<b>Heap, German session</b> (forced GC, one run each)<br>with the help pack ' + a + ' · without ' + b + ' · <i>' + d + '</i>', packs: '<b>Help pack, fetched once per language</b>', fields: '<b>Fields with a translation</b>', seed: '<b>Never in the seed</b><br>a separate file, only the chosen language',
  feature: '<b>This feature</b><br>#3126 field help · #3128 the help pack, search, how-to (merged)', featureHead: '<b>This feature</b>', merged: '(merged)', witnessed: '<b>Witnessed on main ', guide: '<b>ERP User Guide</b>', paper: '<b>Paper</b>: Deterministic Spatial Compilation<br>priority date ',
  credit: 'Opening quote: McKinsey Global Institute, <i>The social economy</i>, July 2012 · German text: the published de_DE pack (Team Germany), unchanged · Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real ERP page, headless on the CPU' };
const wline = (txt, re) => ((txt.split('\n').find((l) => re.test(l)) || '').trim());
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = (f) => pics[f] || (pics[f] = b64(f));
const TOP = 260, BAR = 30, MT = TOP + BAR, MH = 620, PW = 1080 * MH / 1080 * 1920 / 1080;   // page band: the whole 1920x1080 page scaled to MH tall
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:16px 34px;font-family:'DejaVu Sans Mono','Noto Sans CJK SC',monospace;font-size:23px;line-height:1.4;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:'? ';color:#4ade80} .cmd.sh:before{content:'red1 ❯ '} .out{white-space:pre-wrap;color:#e8eef5;font-size:22px;line-height:1.35} .ans{white-space:pre-wrap;color:#fbbf24;overflow-wrap:anywhere} .good{color:#4ade80} .bad{color:#f87171} .dim{color:#94a3b8;white-space:pre}
.de{color:#7dd3fc;white-space:pre-wrap} .cur{display:inline-block;width:14px;height:26px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.pg{position:absolute;left:30px;top:${MT}px;height:${MH}px;border:1px solid #334155} .crop{position:absolute;top:${MT}px;overflow:hidden;border:3px solid #FF6B78;background:#fff} .crop img{position:absolute}
.lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
const bar = (st, cli) => `<div class="bar">${(cli ? T.barCli : T.bar)(esc(st))}</div>`;
// the lower band: the whole page (scaled), and the panel part [y0,y1) of the SAME png at the scale that fits the band (at most 1.5x)
const lower = (shotName, y0, y1) => {
  const s = F.shots[shotName], png = path.join(OUT, s.file), pageW = Math.round(MH * 1920 / 1080), px = s.rects.panel.x, pw = s.rects.panel.w;
  const CH0 = MH - 40, sc = Math.min(1.5, CH0 / (y1 - y0)), cw = Math.round(pw * sc), ch = Math.round((y1 - y0) * sc), left = 30 + pageW + 40;   // 40 px under the crop for its label, above the captions
  return `<img class="pg" src="${img(png)}"><div class="crop" style="left:${left}px;width:${cw + 6}px;height:${Math.min(CH0, ch) + 6}px"><img src="${img(png)}" style="width:${Math.round(1920 * sc)}px;left:${-Math.round(px * sc)}px;top:${-Math.round(y0 * sc)}px"></div>` +
    `<div class="lab" style="left:${left}px;top:${MT + Math.min(CH0, ch) + 6}px">${T.lab(sc)}</div>`;
};
const crop = { // each beat's panel part, from the rects shots.js recorded (never placed by hand)
  idle: (r) => [r.tipTitle.y, r.howtoTitle.y + r.howtoTitle.h + 120],
  card: (r) => [r.howtoTitle.y, r.card.y + r.card.h + 8],
  ctx: (r) => [r.ctx.y - 10, r.ctx.y + r.ctx.h + 8],
  tip: (r) => [r.tipTitle.y, r.tooltip.y + 300] };
const band = (name, kind) => { const r = F.shots[name].rects, [a, b] = crop[kind](r); return lower(name, Math.max(0, a), Math.min(1080, b)); };
const frame = (topHtml, lowHtml, st, cli) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topHtml}${bar(st, cli)}${lowHtml}</body></html>`;
const term = (inner) => `<div class="term">${inner}</div>`;
const termTyped = (cmd, k, done, lines, sh) => term(`<div class="cmd${sh ? ' sh' : ''}">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}`);
const typed = (cmd, lines, lowBefore, lowAfter, st1, st2, sh) => { const s = [{ html: frame(termTyped(cmd, 0, false, '', sh), lowBefore, st1, sh), frames: 14 }];
  for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termTyped(cmd, k, false, '', sh), lowBefore, st1, sh), frames: 2, key: 'k' });
  s.push({ html: frame(termTyped(cmd, cmd.length, false, '', sh), lowBefore, st1, sh), frames: 8, key: 'r' }); s.push({ html: frame(termTyped(cmd, cmd.length, true, lines, sh), lowAfter, st2, sh), frames: null }); return s; };
const ans = (l) => `<div class="ans">${esc(cut(l, 300))}</div>`, dim = (l) => `<div class="dim">${esc(l)}</div>`, good = (l) => `<div class="ans good">${esc(cut(l, 300))}</div>`;
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:104px;font-weight:700;margin-top:24px} .s{font-size:40px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}
.q{margin:150px 170px 0;font-size:50px;line-height:1.38;font-weight:600} .q .big{color:#FF6B78} .qa{margin:40px 170px 0;font-size:27px;color:#cbd5e1;line-height:1.45} .qs{margin:16px 170px 0;font-size:20px;color:#94a3b8}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`;
const CO = '<span style="color:#FF6B78">', CE = '</span>', cards = {};
cards.cover = [{ html: full('<div class="ch"><div class="k">' + T.kicker + '</div><div class="t1">' + T.title + '</div><div class="s">' + T.sub + '</div><div class="c">' + T.line + '</div></div>'), frames: null }];
{ const Q = F.quote, zq = T.quoteZh ? '<div class="qa" style="margin-top:22px;color:#F3EEE8;font-size:30px">' + esc(T.quoteZh) + '<br><span style="font-size:19px;color:#94a3b8">' + esc(T.quoteZhNote) + '</span></div>' : '';
  cards.quote = [{ html: full('<div class="q"' + ((ZH || DE) ? ' style="margin-top:90px;font-size:42px"' : '') + '>“' + esc(Q.text).replace(esc(Q.stat), '<span class="big">' + esc(Q.stat) + '</span>') + '”</div>' + zq + '<div class="qa">' + esc(Q.who) + '<br><i>' + esc(Q.title) + '</i>, ' + esc(Q.date) + '</div><div class="qs">' + esc(Q.url) + ' · ' + T.fetched + ' ' + esc(Q.fetched) + ' (web.archive.org)</div>'), frames: null }]; }
cards.before = [{ html: frame(term(dim(T.before1 + 'erp/idempiere.html:' + F.oldTooltip.line + ' @ ' + F.oldTooltip.commit + ':') + `<div class="ans bad">${esc(F.oldTooltip.text)}</div>` + dim(T.now1) + ans(F.lines.fieldFocus) + good(wline(W1, /F4 description = AD_Field_v\.description/))),
  band(F.ui ? 'field_ui' : 'field_en', 'tip'), F.ui ? T.st.beforeUi : T.st.before), frames: null }];
cards.ask1 = typed(F.ask1.q, ans(F.ask1.line), band('idle', 'idle'), band('ask_close', 'card'), T.st.idle, T.st.card);
cards.link = [{ html: frame(term(ans(F.link.link) + ans(F.link.opened) + ans(F.link.ctx) + good(wline(W2, /S5 every how-to row/))), band('link_open', 'ctx'), T.st.link), frames: null }];
cards.ask2 = typed(F.ask2.q, ans(F.ask2.line), band('link_open', 'ctx'), band('ask_2', 'card'), T.st.open, F.ui ? T.st.pay2 : T.st.pay);
// §13 the v2 cut: the same question typed at the red1 prompt; the lines are red1's own (its arrow, then the card it prints: the answer's summary), the page below shows the same answer
if (F.cliAsk) { const C = F.cliAsk, out = `<div class="dim">${esc(C.arrow)}</div><div class="out">${esc(C.summary.split('\n').filter((l) => l.trim()).slice(0, 4).join('\n'))}</div>`;
  cards.cli = typed(C.line, out, band('link_open', 'ctx'), band('ask_close', 'card'), T.st.cli, T.st.cli, true); }
if (LB && LB.field) { const lp = LB.field.panel.split('\n').filter(Boolean), dn = (LB.docNo && LB.docNo.panel || '').split('\n').filter(Boolean);
  cards.german = [{ html: frame(term(ans(LB.pack) + `<div class="de">${esc(T.lbLang)}: ${esc(lp[1])}</div><div class="dim">${esc(T.english)}${esc(LB.english[0])}</div>` + ans(F.lines.fieldFocusLb) +
      (T.fallback ? `<div class="dim">${esc(T.fallback)}${esc(dn[1] || '')}</div>` : good(wline(W2, /S2 de_DE Tool Tip panel/)))),
    band('field_lb', 'tip'), T.st.lb), frames: null }]; }
{ const PA = require('./priorart.json'), M = F.memory, kb = (b) => (b / 1024).toFixed(0) + ' KB', P = F.packs, C = F.credentials;
  const css = `<style>.lc{margin:44px 60px 0} .lc h1{font-size:46px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:470px 760px 500px;gap:40px;margin-top:24px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.33;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:186px;font-size:17px;color:#94a3b8;width:1800px}</style>`;
  const sign = M.deltaBytes >= 0 ? '+' : '−';
  const mem = [T.heap((M.withPack.used / 1048576).toFixed(1) + ' MB', (M.without.used / 1048576).toFixed(1) + ' MB', sign + kb(Math.abs(M.deltaBytes))),
    T.packs + '<br>de ' + kb(P.de_DE.bytes) + ' · fr ' + kb(P.fr_FR.bytes) + ' · zh ' + kb(P.zh_CN.bytes) + ' · ja ' + kb(P.ja_JP.bytes) + ' · how-to ' + kb(P.en_US.bytes),
    T.fields + '<br>de ' + P.de_DE.fields + ' · fr ' + P.fr_FR.fields + ' · zh ' + P.zh_CN.fields + ' · ja ' + P.ja_JP.fields, T.seed];
  const pa = PA.items.filter((i) => !i.lang || i.lang === LB.lang).map((i) => '<b>' + esc(i.name) + '</b><br>' + esc(ZH ? i.does_zh : (DE ? i.does_de : i.does)) + '<br><i>→ ' + esc(ZH ? i.took_zh : (DE ? i.took_de : i.took)) + '</i>');
  const PRL = DE ? { 3126: 'Feldhilfe', 3128: 'Hilfepaket, Suche, Anleitungen', 3133: 'Hilfe in der gewählten Sprache', 3136: 'erp.ask an der Kommandozeile', 3138: 'Deutsch', 0: 'Hilfe' } : ZH ? { 3126: '字段帮助', 3128: '帮助包、搜索、操作说明', 3133: '所选语言的帮助', 0: '命令行 erp.ask' } : { 3126: 'field help', 3128: 'the help pack, search, how-to', 3133: 'help in the chosen language', 0: 'erp.ask at the CLI' };
  const feat = (C.prs || []).length > 2 ? T.featureHead + '<br>' + C.prs.map((x) => '#' + x.n + ' ' + (PRL[x.n] || PRL[0])).join(' · ') + ' ' + T.merged : T.feature;
  const cred = ['<b>' + esc(C.repo) + '</b><br>' + esc(C.licence), feat, T.witnessed + esc(F.tree) + '</b><br>' + esc(F.verdicts.fieldHelp) + '<br>' + esc(F.verdicts.showcase) + (F.verdicts.erpAsk ? '<br>' + esc(F.verdicts.erpAsk) : ''),
    T.guide + '<br>red1oon.github.io/BIMCompiler/ERPUserGuide/', T.paper + esc(C.paperPriority) + ' · red1oon.github.io/BIMCompiler/SpatialCompilationPaper/'];
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map((r) => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full(css + '<div class="lc"><h1>' + T.h1 + '</h1><div class="cols">' + col(T.cost, mem) + col(T.prior, pa) + col(T.cred, cred) +
    '</div><div class="cr">' + T.credit + '</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map((b) => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc'), q = document.querySelector('.qs'), lab = document.querySelector('.lab'); const imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .q, .qa, .lab')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);
          const low = Math.max(lc ? lc.getBoundingClientRect().bottom : 0, q ? q.getBoundingClientRect().bottom : 0, lab ? lab.getBoundingClientRect().bottom : 0) - (1080 - 170);   // the caption area stays empty
          return { why: { term: t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: Math.round(low), wide: Math.round(wide) }, over: Math.max(t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low, wide), loaded: imgs.every((i) => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); if (m.over > 0) console.log('§CARD_OVER ' + name + ' ' + JSON.stringify(m.why)); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, Math.round(worst)) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch((e) => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
