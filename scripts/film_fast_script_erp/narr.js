// ⚠ DO NOT REMOVE — film "Fast Script ERP" (prompts/FILM_COMMAND_LINE_ERP.md "CH fast-script-erp"; cloned from film_red1_shell): the beats, their narration (F asks, M answers: lively, one short exchange each, the picture does the explaining)
// and the facts each beat speaks. EVERY figure in the text is written from out/facts.json (this build's own recording) through words(); guard.js re-checks each `says` entry against facts.json and that nothing on the not-said list is spoken.
// A beat's `id` is also its recorded step in script.json (rec.py). English only (Kokoro, local CPU). The narration says only what the screen shows and claims nothing that is not built (one line names the next step, posting the cost to the ERP Project Order, as "being built": the owner's words, 2026-11-16). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.OUTD || 'out', 'facts.json'), 'utf8'));
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n) {   // 0..999,999,999, English, as spoken: 1193 -> one thousand one hundred and ninety-three
  if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  if (n < 1e6) return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : '');
  return words(Math.floor(n / 1e6)) + ' million' + (n % 1e6 ? (n % 1e6 < 100 ? ' and ' : ' ') + words(n % 1e6) : '');
}
const DG = '零一二三四五六七八九';
function zhw(n) {   // 0..999,999,999 in Chinese numerals as spoken: 1054482 -> 一百零五万四千四百八十二 ; 6980 -> 六千九百八十 ; 113 -> 一百一十三
  const sec = (m) => { let s = '', z = false; [Math.floor(m / 1000) % 10, Math.floor(m / 100) % 10, Math.floor(m / 10) % 10, m % 10].forEach((x, i) => { if (x === 0) { if (s) z = true; } else { if (z) { s += '零'; z = false; } s += DG[x] + ['千', '百', '十', ''][i]; } }); return s; };
  if (n === 0) return '零'; if (n < 20 && n >= 10) return '十' + (n % 10 ? DG[n % 10] : '');
  if (n < 10000) return sec(n); const hi = Math.floor(n / 10000), lo = n % 10000;
  return (hi < 10000 ? sec(hi) : zhw(hi)) + '万' + (lo ? (lo < 1000 ? '零' : '') + sec(lo) : '');
}
const LANG = process.env.FILM_LANG === 'zh' ? 'zh' : 'en', w = LANG === 'zh' ? zhw : words, S = (p, v, word) => [p, String(v), word];
const EN = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: How do I start? | M: Type red one. The greeting counts its verbs and its words: ' + w(F.greet.verbs) + ' verbs, ' + w(F.greet.words) + ' words. Then a tip.', says: [S('greet.verbs', F.greet.verbs, w(F.greet.verbs) + ' verbs'), S('greet.words', F.greet.words, w(F.greet.words) + ' words')] },
  { id: 'help', text: 'F: What can it do? | M: ' + w(F.help.groups) + ' groups: B I M, M I S and E R P. The E R P group has ' + w(F.help.erpN) + ' words: do, run and next.', says: [S('help.groups', F.help.groups, w(F.help.groups) + ' groups'), S('help.erpN', F.help.erpN, w(F.help.erpN) + ' words')] },
  { id: 'level', text: 'F: Can it explain a word? | M: Level student, then help run. It says what the word does, and the line it runs.', says: [] },
  { id: 'bp', text: 'F: How do I get to a table? | M: Type a few letters. A grey suggestion appears, and Tab takes it. Then ls: ' + w(F.bp.shown) + ' of ' + w(F.bp.of) + ' business partners.', says: [S('bp.shown', F.bp.shown, w(F.bp.shown) + ' of'), S('bp.of', F.bp.of, w(F.bp.of) + ' business')] },
  { id: 'po1', text: 'F: Can it run a process? | M: Run, and the name of the process. It asks its questions in the order of the dictionary. The project comes first: ' + w(F.po.project.n) + ' to pick from.', says: [S('po.project.n', F.po.project.n, w(F.po.project.n) + ' to pick')] },
  { id: 'po2', text: 'F: And the phase? | M: Only the ' + w(F.po.phase.n) + ' phases of that project are offered. I leave it out.', says: [S('po.phase.n', F.po.phase.n, w(F.po.phase.n) + ' phases')] },
  { id: 'po3', text: 'F: The project line? | M: ' + w(F.po.line.n) + ' lines. I leave this out too.', says: [S('po.line.n', F.po.line.n, w(F.po.line.n) + ' lines')] },
  { id: 'po4', text: 'F: And the last question? | M: Consolidate keeps its default, yes. Enter, and the full line it runs is printed. ' + w(F.po.run.orders) + ' purchase orders are made, from ' + w(F.po.run.orderLines) + ' order lines.', says: [S('po.run.orders', F.po.run.orders, w(F.po.run.orders) + ' purchase orders'), S('po.run.orderLines', F.po.run.orderLines, w(F.po.run.orderLines) + ' order lines')] },
  { id: 'ord', text: 'F: Where did they go? | M: Cd order, and list by description. ' + w(F.ord.rows) + ' orders, all drafts.', says: [S('ord.rows', F.ord.rows, w(F.ord.rows) + ' orders')] },
  { id: 'co', text: 'F: Can I complete an order? | M: Do C O and its number. The status goes from D R to C O, and the grand total is ' + w(F.co.total) + '.', says: [S('co.total', F.co.total, 'total is ' + w(F.co.total))] },
  { id: 'next', text: 'F: What may it do now? | M: Next, and the number. The legal moves come as a tree. Close and void have words. R E has none yet.', says: [S('next.withWord', F.next.withWord.join(','), 'close and void'), S('next.noWord', F.next.noWord.join(','), 'r e has none')] },
  { id: 'gap', text: 'F: And a process it cannot run? | M: ' + F.gap.process + ' has no J S port yet. Red one says so, and says the gap is in red one, not your mistake.', says: [S('gap.process', F.gap.process, F.gap.process.toLowerCase())] },
  { id: 'report', text: 'F: Can I tell the owners? | M: Report shows the draft. Nothing is sent until you open it.', says: [] },
  { id: 'url', text: 'F: And to send it? | M: Choose the GitHub issue, and the link prints: ' + w(F.url.chars) + ' characters. Opening it is your move.', says: [S('url.chars', F.url.chars, w(F.url.chars) + ' characters')] },
  { id: 'cost', text: 'F: And back in the building? | M: Duplex. Cost by discipline prices ' + w(F.cost.elements) + ' elements, ' + w(F.cost.total) + ' in all. The rows add up to it. Posting that cost to the E R P project order is being built.', says: [S('cost.elements', F.cost.elements, w(F.cost.elements) + ' elements'), S('cost.total', F.cost.total, w(F.cost.total) + ' in all')] },
  { id: 'exit', text: 'M: Exit, and you are back in the shell. | F: Remember the name. | M: Red one.', says: [] },
  { id: 'end', hold: 9 }   // the end card, silent: the voice tool's own credit line takes the last seconds
];
[EN].forEach(a => a.forEach(b => { if (b.text) b.text = b.text.replace(/(^|[.?!] |: )([a-z])/g, (m, a, c) => a + c.toUpperCase()); }));   // a spoken number opens a sentence: the caption shows it capitalised
// FILM_LANG=zh: the Mandarin narration, translated by the build session (2026-11-16), NOT reviewed by a native speaker. The same beats, the same facts (every figure is written from facts.json through zhw());
// Latin words stay Latin (BIM, MIS, ERP, GitHub, red one, the command words), the way the Edge voice reads them. "明细" and the other words of guard.js's not-said list are not used.
const ZH = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: 怎么开始？ | M: 输入 red one。问候语会数出它的动词和词：' + w(F.greet.verbs) + '个动词，' + w(F.greet.words) + '个词。然后是提示行。', says: [S('greet.verbs', F.greet.verbs, w(F.greet.verbs) + '个动词'), S('greet.words', F.greet.words, w(F.greet.words) + '个词')] },
  { id: 'help', text: 'F: 它能做什么？ | M: ' + w(F.help.groups) + '个组：BIM、MIS 和 ERP。ERP 组有' + w(F.help.erpN) + '个词：do、run 和 next。', says: [S('help.groups', F.help.groups, w(F.help.groups) + '个组'), S('help.erpN', F.help.erpN, w(F.help.erpN) + '个词')] },
  { id: 'level', text: 'F: 它会解释每个词吗？ | M: 先输入 level student，再输入 help run。它会说明这个词做什么，以及它运行的那行命令。', says: [] },
  { id: 'bp', text: 'F: 怎么进入表格？ | M: 先输入几个字母。灰色的建议会出现，按 Tab 就能接受。然后输入 ls：共' + w(F.bp.of) + '个业务伙伴，显示' + w(F.bp.shown) + '个。', says: [S('bp.of', F.bp.of, '共' + w(F.bp.of) + '个业务伙伴'), S('bp.shown', F.bp.shown, '显示' + w(F.bp.shown) + '个')] },
  { id: 'po1', text: 'F: 它能运行流程吗？ | M: 输入 run 和流程的名称。它按字典里的顺序提问。先问项目：有' + w(F.po.project.n) + '个可选。', says: [S('po.project.n', F.po.project.n, '有' + w(F.po.project.n) + '个可选')] },
  { id: 'po2', text: 'F: 阶段呢？ | M: 只提供这个项目自己的' + w(F.po.phase.n) + '个阶段。我跳过它。', says: [S('po.phase.n', F.po.phase.n, w(F.po.phase.n) + '个阶段')] },
  { id: 'po3', text: 'F: 项目行呢？ | M: 共' + w(F.po.line.n) + '行。这个也跳过。', says: [S('po.line.n', F.po.line.n, '共' + w(F.po.line.n) + '行')] },
  { id: 'po4', text: 'F: 最后的问题呢？ | M: 合并选项保持默认，选是。按回车，它运行的完整命令就打印出来。生成了' + w(F.po.run.orders) + '张采购订单，来自' + w(F.po.run.orderLines) + '行订单行。', says: [S('po.run.orders', F.po.run.orders, w(F.po.run.orders) + '张采购订单'), S('po.run.orderLines', F.po.run.orderLines, w(F.po.run.orderLines) + '行订单行')] },
  { id: 'ord', text: 'F: 它们在哪里？ | M: 输入 cd Order，再按描述列出。' + w(F.ord.rows) + '张订单，全是草稿。', says: [S('ord.rows', F.ord.rows, w(F.ord.rows) + '张订单')] },
  { id: 'co', text: 'F: 能完成订单吗？ | M: 输入 do CO 和订单号。状态从 D R 变成 C O，总计是' + w(F.co.total) + '。', says: [S('co.total', F.co.total, '总计是' + w(F.co.total))] },
  { id: 'next', text: 'F: 现在它还能做什么？ | M: next 加订单号。合法的下一步，画成树状图。关闭和作废有对应的词。R E 还没有词。', says: [S('next.withWord', F.next.withWord.join(','), '关闭和作废'), S('next.noWord', F.next.noWord.join(','), 'r e 还没有词')] },
  { id: 'gap', text: 'F: 它不能运行的流程呢？ | M: ' + F.gap.process + ' 还没有 J S 移植。red one 会这样告诉你，缺口在 red one，不是你的错。', says: [S('gap.process', F.gap.process, F.gap.process.toLowerCase())] },
  { id: 'report', text: 'F: 我能告诉开发者吗？ | M: report 会显示草稿。你打开它之前，什么都不会发送。', says: [] },
  { id: 'url', text: 'F: 怎么发送？ | M: 选择 GitHub 议题，链接就打印出来：' + w(F.url.chars) + '个字符。要不要打开，由你决定。', says: [S('url.chars', F.url.chars, w(F.url.chars) + '个字符')] },
  { id: 'cost', text: 'F: 回到建筑里呢？ | M: Duplex。按专业计价，' + w(F.cost.elements) + '个构件，一共' + w(F.cost.total) + '。各行加起来就是总数。把这笔成本过账到 ERP 项目订单，正在开发中。', says: [S('cost.elements', F.cost.elements, w(F.cost.elements) + '个构件'), S('cost.total', F.cost.total, '一共' + w(F.cost.total))] },
  { id: 'exit', text: 'M: 输入 exit，就回到了 shell。 | F: 记住这个名字。 | M: red one。', says: [] },
  { id: 'end', hold: 9 }
];
exports.lang = LANG; exports.beats = { en: EN, zh: ZH }[LANG]; exports.words = words; exports.zhw = zhw;
