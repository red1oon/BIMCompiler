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
const MSO = ['sifar', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan'];
function msw(n) {   // Malay: 1190 -> seribu seratus sembilan puluh ; 1054482 -> satu juta lima puluh empat ribu empat ratus lapan puluh dua ; 113 -> seratus tiga belas
  if (n < 10) return MSO[n]; if (n === 10) return 'sepuluh'; if (n === 11) return 'sebelas'; if (n < 20) return MSO[n - 10] + ' belas';
  if (n < 100) return MSO[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + MSO[n % 10] : '');
  if (n < 1000) return (n < 200 ? 'seratus' : MSO[Math.floor(n / 100)] + ' ratus') + (n % 100 ? ' ' + msw(n % 100) : '');
  if (n < 1e6) return (n < 2000 ? 'seribu' : msw(Math.floor(n / 1000)) + ' ribu') + (n % 1000 ? ' ' + msw(n % 1000) : '');
  return msw(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + msw(n % 1e6) : '');
}
const THO = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
function thw(n) {   // Thai: 1054482 -> หนึ่งล้านห้าหมื่นสี่พันสี่ร้อยแปดสิบสอง ; 21 -> ยี่สิบเอ็ด ; 11 -> สิบเอ็ด
  if (n === 0) return THO[0]; if (n >= 1e6) return thw(Math.floor(n / 1e6)) + 'ล้าน' + (n % 1e6 ? thw(n % 1e6) : '');
  let out = ''; [[100000, 'แสน'], [10000, 'หมื่น'], [1000, 'พัน'], [100, 'ร้อย']].forEach(([u, nm]) => { const d = Math.floor(n / u) % 10; if (d) out += THO[d] + nm; });
  const t = Math.floor(n / 10) % 10, o = n % 10; if (t) out += (t === 1 ? '' : t === 2 ? 'ยี่' : THO[t]) + 'สิบ'; if (o) out += (o === 1 && (t || n > 10) ? 'เอ็ด' : THO[o]);
  return out;
}
const LANG = ['zh', 'ms', 'th'].indexOf(process.env.FILM_LANG) >= 0 ? process.env.FILM_LANG : 'en', w = { en: words, zh: zhw, ms: msw, th: thw }[LANG], S = (p, v, word) => [p, String(v), word];
const dec = (str) => { const p = String(str).split('.'); const dg = { en: ONES, zh: DG.split(''), ms: MSO, th: THO }[LANG], pt = { en: ' point ', zh: '点', ms: ' titik ', th: ' จุด ' }[LANG]; return w(+p[0]) + pt + (p[1] || '').split('').map(d => dg[+d]).join(LANG === 'zh' ? '' : ' '); };
const list = (a) => LANG === 'zh' ? (a.length > 1 ? a.slice(0, -1).join('、') + ' 和 ' + a[a.length - 1] : a[0]) : (a.length > 1 ? a.slice(0, -1).join(', ') + ' ' + { en: 'and', ms: 'dan', th: 'และ' }[LANG] + ' ' + a[a.length - 1] : a[0]);
const EN = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: How do I start? | M: Type red one. The greeting counts its verbs and its words: ' + w(F.greet.verbs) + ' verbs, ' + w(F.greet.words) + ' words. Then a tip.', says: [S('greet.verbs', F.greet.verbs, w(F.greet.verbs) + ' verbs'), S('greet.words', F.greet.words, w(F.greet.words) + ' words')] },
  { id: 'help', text: 'F: What can it do? | M: ' + w(F.help.groups) + ' groups: B I M, M I S and E R P. The E R P group has ' + w(F.help.erpN) + ' words: ' + list(F.help.erpWords) + '.', says: [S('help.groups', F.help.groups, w(F.help.groups) + ' groups'), S('help.erpN', F.help.erpN, w(F.help.erpN) + ' words')] },
  { id: 'level', text: 'F: Can it explain a word? | M: Level student, then help run. It says what the word does, and the line it runs.', says: [] },
  { id: 'bp', text: 'F: How do I get to a table? | M: Type a few letters. A grey suggestion appears, and Tab takes it. Then ls: ' + w(F.bp.shown) + ' of ' + w(F.bp.of) + ' business partners.', says: [S('bp.shown', F.bp.shown, w(F.bp.shown) + ' of'), S('bp.of', F.bp.of, w(F.bp.of) + ' business')] },
  { id: 'po1', text: 'F: Can it run a process? | M: Run, and the name of the process. It asks its questions in the order of the dictionary. The project comes first: ' + w(F.po.project.n) + ' to pick from.', says: [S('po.project.n', F.po.project.n, w(F.po.project.n) + ' to pick')] },
  { id: 'po2', text: 'F: And the phase? | M: Only the ' + w(F.po.phase.n) + ' phases of that project are offered. I leave it out.', says: [S('po.phase.n', F.po.phase.n, w(F.po.phase.n) + ' phases')] },
  { id: 'po3', text: 'F: The project line? | M: ' + w(F.po.line.n) + ' lines. I leave this out too.', says: [S('po.line.n', F.po.line.n, w(F.po.line.n) + ' lines')] },
  { id: 'po4', text: 'F: And the last question? | M: Consolidate keeps its default, yes. Enter, and the full line it runs is printed, then a summary: ' + w(F.po.run.orders) + ' purchase orders made, by number, from ' + w(F.po.run.orderLines) + ' order lines.', says: [S('po.run.orders', F.po.run.orders, w(F.po.run.orders) + ' purchase orders'), S('po.run.orderLines', F.po.run.orderLines, w(F.po.run.orderLines) + ' order lines')] },
  { id: 'co', text: 'F: How do I complete an order? | M: Cd order, then do C O and the number from the summary. The status goes from D R to C O, and the grand total is ' + w(F.co.total) + '.', says: [S('co.total', F.co.total, 'total is ' + w(F.co.total))] },
  { id: 'next', text: 'F: What may it do now? | M: Next, and the number. The legal moves come as a tree. Close and void have words. R E has none yet.', says: [S('next.withWord', F.next.withWord.join(','), 'close and void'), S('next.noWord', F.next.noWord.join(','), 'r e has none')] },
  { id: 'gap', text: 'F: And a process it cannot run? | M: ' + F.gap.process + ' has no J S port yet. Red one says so, and says the gap is in red one, not your mistake.', says: [S('gap.process', F.gap.process, F.gap.process.toLowerCase())] },
  { id: 'report', text: 'F: Can I tell the owners? | M: Report shows the draft. Nothing is sent until you open it.', says: [] },
  { id: 'url', text: 'F: And to send it? | M: Choose the GitHub issue, and the link prints: ' + w(F.url.chars) + ' characters. Opening it is your move.', says: [S('url.chars', F.url.chars, w(F.url.chars) + ' characters')] },
  { id: 'cost', text: 'F: And back in the building? | M: Duplex. Cost by discipline shows its groups first: ' + w(F.cost.discs) + ' disciplines, ' + w(F.cost.total) + ' in all. Then it offers to post to the E R P project order.', says: [S('cost.discs', F.cost.discs, w(F.cost.discs) + ' disciplines'), S('cost.total', F.cost.total, w(F.cost.total) + ' in all')] },
  { id: 'post', text: 'F: And if I say yes? | M: It posts, and the wait is real: ' + w(F.post.sec) + ' seconds here. A project is made, with ' + w(F.post.changes) + ' changes. The planned amount is ' + dec(F.post.planned) + '.', says: [S('post.sec', F.post.sec, w(F.post.sec) + ' seconds'), S('post.changes', F.post.changes, w(F.post.changes) + ' changes'), S('post.planned', F.post.planned, dec(F.post.planned))] },
  { id: 'proj', text: 'F: Can I see it? | M: It offers to open the project. Yes, and the prompt moves there: ' + w(F.proj.props) + ' properties.', says: [S('proj.props', F.proj.props, w(F.proj.props) + ' properties')] },
  { id: 'ls', text: 'F: And the list? | M: Ls shows ' + w(F.ls.rows) + ' projects. The new project is there.', says: [S('ls.rows', F.ls.rows, w(F.ls.rows) + ' projects')] },
  { id: 'exit', text: 'M: Exit, and you are back in the shell. | F: Remember the name. | M: Red one.', says: [] },
  { id: 'end', hold: 9 }   // the end card, silent: the voice tool's own credit line takes the last seconds
];
EN.forEach(b => { if (b.text) b.text = b.text.replace(/(^|[.?!] |: )([a-z])/g, (m, a, c) => a + c.toUpperCase()); });   // a spoken number opens a sentence: the caption shows it capitalised
// FILM_LANG=zh: the Mandarin narration, translated by the build session (2026-11-16), NOT reviewed by a native speaker. The same beats, the same facts (every figure is written from facts.json through zhw());
// Latin words stay Latin (BIM, MIS, ERP, GitHub, red one, the command words), the way the Edge voice reads them. The words of guard.js's not-said list ("明细" ...) are not used.
const ZH = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: 怎么开始？ | M: 输入 red one。问候语会数出它的动词和词：' + w(F.greet.verbs) + '个动词，' + w(F.greet.words) + '个词。然后是提示行。', says: [S('greet.verbs', F.greet.verbs, w(F.greet.verbs) + '个动词'), S('greet.words', F.greet.words, w(F.greet.words) + '个词')] },
  { id: 'help', text: 'F: 它能做什么？ | M: ' + w(F.help.groups) + '个组：BIM、MIS 和 ERP。ERP 组有' + w(F.help.erpN) + '个词：' + list(F.help.erpWords) + '。', says: [S('help.groups', F.help.groups, w(F.help.groups) + '个组'), S('help.erpN', F.help.erpN, w(F.help.erpN) + '个词')] },
  { id: 'level', text: 'F: 它会解释每个词吗？ | M: 先输入 level student，再输入 help run。它会说明这个词做什么，以及它运行的那行命令。', says: [] },
  { id: 'bp', text: 'F: 怎么进入表格？ | M: 先输入几个字母。灰色的建议会出现，按 Tab 就能接受。然后输入 ls：共' + w(F.bp.of) + '个业务伙伴，显示' + w(F.bp.shown) + '个。', says: [S('bp.of', F.bp.of, '共' + w(F.bp.of) + '个业务伙伴'), S('bp.shown', F.bp.shown, '显示' + w(F.bp.shown) + '个')] },
  { id: 'po1', text: 'F: 它能运行流程吗？ | M: 输入 run 和流程的名称。它按字典里的顺序提问。先问项目：有' + w(F.po.project.n) + '个可选。', says: [S('po.project.n', F.po.project.n, '有' + w(F.po.project.n) + '个可选')] },
  { id: 'po2', text: 'F: 阶段呢？ | M: 只提供这个项目自己的' + w(F.po.phase.n) + '个阶段。我跳过它。', says: [S('po.phase.n', F.po.phase.n, w(F.po.phase.n) + '个阶段')] },
  { id: 'po3', text: 'F: 项目行呢？ | M: 共' + w(F.po.line.n) + '行。这个也跳过。', says: [S('po.line.n', F.po.line.n, '共' + w(F.po.line.n) + '行')] },
  { id: 'po4', text: 'F: 最后的问题呢？ | M: 合并选项保持默认，选是。按回车，它运行的完整命令就打印出来，接着是摘要：生成了' + w(F.po.run.orders) + '张采购订单，按编号列出，来自' + w(F.po.run.orderLines) + '行订单行。', says: [S('po.run.orders', F.po.run.orders, w(F.po.run.orders) + '张采购订单'), S('po.run.orderLines', F.po.run.orderLines, w(F.po.run.orderLines) + '行订单行')] },
  { id: 'co', text: 'F: 怎么完成订单？ | M: 输入 cd Order，再输入 do CO 和摘要里的订单号。状态从 D R 变成 C O，总计是' + w(F.co.total) + '。', says: [S('co.total', F.co.total, '总计是' + w(F.co.total))] },
  { id: 'next', text: 'F: 现在它还能做什么？ | M: next 加订单号。合法的下一步，画成树状图。关闭和作废有对应的词。R E 还没有词。', says: [S('next.withWord', F.next.withWord.join(','), '关闭和作废'), S('next.noWord', F.next.noWord.join(','), 'r e 还没有词')] },
  { id: 'gap', text: 'F: 它不能运行的流程呢？ | M: ' + F.gap.process + ' 还没有 J S 移植。red one 会这样告诉你，缺口在 red one，不是你的错。', says: [S('gap.process', F.gap.process, F.gap.process.toLowerCase())] },
  { id: 'report', text: 'F: 我能告诉开发者吗？ | M: report 会显示草稿。你打开它之前，什么都不会发送。', says: [] },
  { id: 'url', text: 'F: 怎么发送？ | M: 选择 GitHub 议题，链接就打印出来：' + w(F.url.chars) + '个字符。要不要打开，由你决定。', says: [S('url.chars', F.url.chars, w(F.url.chars) + '个字符')] },
  { id: 'cost', text: 'F: 回到建筑里呢？ | M: Duplex。按专业计价，先显示各组：' + w(F.cost.discs) + '个专业，一共' + w(F.cost.total) + '。然后是提议：要过账到 ERP 项目订单吗？', says: [S('cost.discs', F.cost.discs, w(F.cost.discs) + '个专业'), S('cost.total', F.cost.total, '一共' + w(F.cost.total))] },
  { id: 'post', text: 'F: 回答是呢？ | M: 它开始过账，等待是真实的：这里用了' + w(F.post.sec) + '秒。生成了项目，共有' + w(F.post.changes) + '项更改。计划金额是' + dec(F.post.planned) + '。', says: [S('post.sec', F.post.sec, w(F.post.sec) + '秒'), S('post.changes', F.post.changes, '共有' + w(F.post.changes) + '项更改'), S('post.planned', F.post.planned, dec(F.post.planned))] },
  { id: 'proj', text: 'F: 能看到它吗？ | M: 它提议打开这个项目。回答是，提示符就移到那里：' + w(F.proj.props) + '个属性。', says: [S('proj.props', F.proj.props, w(F.proj.props) + '个属性')] },
  { id: 'ls', text: 'F: 列表呢？ | M: ls 显示' + w(F.ls.rows) + '个项目。新的就在其中。', says: [S('ls.rows', F.ls.rows, '显示' + w(F.ls.rows) + '个项目')] },
  { id: 'exit', text: 'M: 输入 exit，就回到了 shell。 | F: 记住这个名字。 | M: red one。', says: [] },
  { id: 'end', hold: 9 }
];
// FILM_LANG=ms: the Malay narration, translated by the build session (2026-11-16), NOT reviewed by a native speaker. The same beats, the same facts; the spoken figure words are Malay.
const MS = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: Bagaimana hendak bermula? | M: Taip red one. Ucapan alu-aluan mengira kata kerja dan perkataannya: ' + w(F.greet.verbs) + ' kata kerja, ' + w(F.greet.words) + ' perkataan. Kemudian ada petua.', says: [S('greet.verbs', F.greet.verbs, w(F.greet.verbs) + ' kata kerja'), S('greet.words', F.greet.words, w(F.greet.words) + ' perkataan')] },
  { id: 'help', text: 'F: Apa yang boleh dilakukannya? | M: ' + w(F.help.groups) + ' kumpulan: B I M, M I S dan E R P. Kumpulan E R P ada ' + w(F.help.erpN) + ' perkataan: ' + list(F.help.erpWords) + '.', says: [S('help.groups', F.help.groups, w(F.help.groups) + ' kumpulan'), S('help.erpN', F.help.erpN, w(F.help.erpN) + ' perkataan')] },
  { id: 'level', text: 'F: Bolehkah ia menerangkan sesuatu perkataan? | M: Level student, kemudian help run. Ia menyatakan apa yang perkataan itu lakukan, dan baris yang dijalankannya.', says: [] },
  { id: 'bp', text: 'F: Bagaimana hendak ke sebuah jadual? | M: Taip beberapa huruf. Cadangan kelabu muncul, dan Tab menerimanya. Kemudian ls: ' + w(F.bp.shown) + ' daripada ' + w(F.bp.of) + ' rakan niaga.', says: [S('bp.shown', F.bp.shown, w(F.bp.shown) + ' daripada'), S('bp.of', F.bp.of, w(F.bp.of) + ' rakan niaga')] },
  { id: 'po1', text: 'F: Bolehkah ia menjalankan proses? | M: Run, dan nama proses. Ia bertanya mengikut susunan kamus. Projek dahulu: ' + w(F.po.project.n) + ' untuk dipilih.', says: [S('po.project.n', F.po.project.n, w(F.po.project.n) + ' untuk dipilih')] },
  { id: 'po2', text: 'F: Dan fasa? | M: Hanya ' + w(F.po.phase.n) + ' fasa bagi projek itu ditawarkan. Saya langkaunya.', says: [S('po.phase.n', F.po.phase.n, w(F.po.phase.n) + ' fasa')] },
  { id: 'po3', text: 'F: Baris projek? | M: ' + w(F.po.line.n) + ' baris. Yang ini pun saya langkau.', says: [S('po.line.n', F.po.line.n, w(F.po.line.n) + ' baris')] },
  { id: 'po4', text: 'F: Dan soalan terakhir? | M: Consolidate kekal pada nilai asal, ya. Enter, dan baris penuh yang dijalankan dicetak, kemudian ringkasan: ' + w(F.po.run.orders) + ' pesanan belian dibuat, mengikut nombor, daripada ' + w(F.po.run.orderLines) + ' baris pesanan.', says: [S('po.run.orders', F.po.run.orders, w(F.po.run.orders) + ' pesanan belian'), S('po.run.orderLines', F.po.run.orderLines, w(F.po.run.orderLines) + ' baris pesanan')] },
  { id: 'co', text: 'F: Bagaimana melengkapkan pesanan? | M: Cd order, kemudian do C O dan nombor daripada ringkasan. Status bertukar daripada D R kepada C O, dan jumlah besar ialah ' + w(F.co.total) + '.', says: [S('co.total', F.co.total, 'jumlah besar ialah ' + w(F.co.total))] },
  { id: 'next', text: 'F: Apa lagi yang boleh dilakukan sekarang? | M: Next, dan nombor. Langkah yang sah datang sebagai pokok. Close dan void ada perkataan. R E belum ada.', says: [S('next.withWord', F.next.withWord.join(','), 'close dan void'), S('next.noWord', F.next.noWord.join(','), 'r e belum ada')] },
  { id: 'gap', text: 'F: Dan proses yang tidak boleh dijalankannya? | M: ' + F.gap.process + ' belum ada port J S. Red one memberitahu begitu, dan jurang itu ada pada red one, bukan salah anda.', says: [S('gap.process', F.gap.process, F.gap.process.toLowerCase())] },
  { id: 'report', text: 'F: Bolehkah saya maklumkan kepada pemilik? | M: Report menunjukkan draf. Tiada apa-apa dihantar sehingga anda membukanya.', says: [] },
  { id: 'url', text: 'F: Dan untuk menghantarnya? | M: Pilih isu GitHub, dan pautan dicetak: ' + w(F.url.chars) + ' aksara. Membukanya terpulang kepada anda.', says: [S('url.chars', F.url.chars, w(F.url.chars) + ' aksara')] },
  { id: 'cost', text: 'F: Dan kembali ke bangunan? | M: Duplex. Cost mengikut disiplin menunjukkan kumpulannya dahulu: ' + w(F.cost.discs) + ' disiplin, ' + w(F.cost.total) + ' kesemuanya. Kemudian ia menawarkan untuk post ke pesanan projek E R P.', says: [S('cost.discs', F.cost.discs, w(F.cost.discs) + ' disiplin'), S('cost.total', F.cost.total, w(F.cost.total) + ' kesemuanya')] },
  { id: 'post', text: 'F: Dan jika saya jawab ya? | M: Ia post, dan menunggu itu benar: ' + w(F.post.sec) + ' saat di sini. Sebuah projek dibuat, dengan ' + w(F.post.changes) + ' perubahan. Jumlah yang dirancang ialah ' + dec(F.post.planned) + '.', says: [S('post.sec', F.post.sec, w(F.post.sec) + ' saat'), S('post.changes', F.post.changes, w(F.post.changes) + ' perubahan'), S('post.planned', F.post.planned, dec(F.post.planned))] },
  { id: 'proj', text: 'F: Bolehkah saya melihatnya? | M: Ia menawarkan untuk membuka projek. Ya, dan prompt berpindah ke situ: ' + w(F.proj.props) + ' sifat.', says: [S('proj.props', F.proj.props, w(F.proj.props) + ' sifat')] },
  { id: 'ls', text: 'F: Dan senarainya? | M: Ls menunjukkan ' + w(F.ls.rows) + ' projek. Projek baharu ada di situ.', says: [S('ls.rows', F.ls.rows, w(F.ls.rows) + ' projek')] },
  { id: 'exit', text: 'M: Exit, dan anda kembali ke shell. | F: Ingat nama itu. | M: Red one.', says: [] },
  { id: 'end', hold: 9 }
];
// FILM_LANG=th: the Thai narration, translated by the build session (2026-11-16), NOT reviewed by a native speaker. The same beats, the same facts; the spoken figure words are Thai.
const TH = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: เริ่มต้นอย่างไร? | M: พิมพ์ red one คำทักทายจะนับคำกริยาและคำสั่ง: ' + w(F.greet.verbs) + ' คำกริยา ' + w(F.greet.words) + ' คำ แล้วตามด้วยเคล็ดลับ', says: [S('greet.verbs', F.greet.verbs, w(F.greet.verbs) + ' คำกริยา'), S('greet.words', F.greet.words, w(F.greet.words) + ' คำ')] },
  { id: 'help', text: 'F: ทำอะไรได้บ้าง? | M: มี ' + w(F.help.groups) + ' กลุ่ม: B I M, M I S และ E R P กลุ่ม E R P มี ' + w(F.help.erpN) + ' คำ: ' + list(F.help.erpWords), says: [S('help.groups', F.help.groups, w(F.help.groups) + ' กลุ่ม'), S('help.erpN', F.help.erpN, w(F.help.erpN) + ' คำ')] },
  { id: 'level', text: 'F: อธิบายคำได้ไหม? | M: level student แล้วตามด้วย help run มันบอกว่าคำนั้นทำอะไร และบรรทัดที่มันรัน', says: [] },
  { id: 'bp', text: 'F: ไปที่ตารางอย่างไร? | M: พิมพ์ตัวอักษรไม่กี่ตัว คำแนะนำสีเทาจะปรากฏ แล้วกด Tab เพื่อรับ จากนั้น ls: คู่ค้า ' + w(F.bp.of) + ' ราย แสดง ' + w(F.bp.shown) + ' ราย', says: [S('bp.of', F.bp.of, 'คู่ค้า ' + w(F.bp.of) + ' ราย'), S('bp.shown', F.bp.shown, 'แสดง ' + w(F.bp.shown) + ' ราย')] },
  { id: 'po1', text: 'F: รันกระบวนการได้ไหม? | M: run แล้วตามด้วยชื่อกระบวนการ มันถามตามลำดับของพจนานุกรม ถามโครงการก่อน: มี ' + w(F.po.project.n) + ' ให้เลือก', says: [S('po.project.n', F.po.project.n, 'มี ' + w(F.po.project.n) + ' ให้เลือก')] },
  { id: 'po2', text: 'F: แล้วระยะล่ะ? | M: มีเฉพาะ ' + w(F.po.phase.n) + ' ระยะของโครงการนั้น ฉันข้ามไป', says: [S('po.phase.n', F.po.phase.n, w(F.po.phase.n) + ' ระยะ')] },
  { id: 'po3', text: 'F: แล้วบรรทัดโครงการ? | M: ' + w(F.po.line.n) + ' บรรทัด อันนี้ก็ข้ามเหมือนกัน', says: [S('po.line.n', F.po.line.n, w(F.po.line.n) + ' บรรทัด')] },
  { id: 'po4', text: 'F: แล้วคำถามสุดท้าย? | M: Consolidate ใช้ค่าเริ่มต้น คือใช่ กด Enter แล้วบรรทัดเต็มที่มันรันจะถูกพิมพ์ ตามด้วยสรุป: สร้างใบสั่งซื้อ ' + w(F.po.run.orders) + ' ใบ ตามหมายเลข จาก ' + w(F.po.run.orderLines) + ' บรรทัดคำสั่งซื้อ', says: [S('po.run.orders', F.po.run.orders, 'ใบสั่งซื้อ ' + w(F.po.run.orders) + ' ใบ'), S('po.run.orderLines', F.po.run.orderLines, w(F.po.run.orderLines) + ' บรรทัดคำสั่งซื้อ')] },
  { id: 'co', text: 'F: ทำให้ใบสั่งเสร็จได้อย่างไร? | M: cd Order แล้ว do CO กับหมายเลขจากสรุป สถานะเปลี่ยนจาก D R เป็น C O และยอดรวมคือ ' + w(F.co.total), says: [S('co.total', F.co.total, 'ยอดรวมคือ ' + w(F.co.total))] },
  { id: 'next', text: 'F: ตอนนี้ทำอะไรต่อได้? | M: next กับหมายเลข ขั้นตอนที่ถูกต้องแสดงเป็นต้นไม้ close กับ void มีคำสั่ง ส่วน R E ยังไม่มี', says: [S('next.withWord', F.next.withWord.join(','), 'close กับ void'), S('next.noWord', F.next.noWord.join(','), 'r e ยังไม่มี')] },
  { id: 'gap', text: 'F: แล้วกระบวนการที่รันไม่ได้? | M: ' + F.gap.process + ' ยังไม่มีพอร์ต J S red one บอกอย่างนั้น และบอกว่านี่คือช่องว่างของ red one ไม่ใช่ความผิดของคุณ', says: [S('gap.process', F.gap.process, F.gap.process.toLowerCase())] },
  { id: 'report', text: 'F: แจ้งเจ้าของได้ไหม? | M: report แสดงฉบับร่าง จะไม่มีอะไรถูกส่ง จนกว่าคุณจะเปิดมัน', says: [] },
  { id: 'url', text: 'F: แล้วจะส่งอย่างไร? | M: เลือก GitHub issue แล้วลิงก์จะถูกพิมพ์: ' + w(F.url.chars) + ' ตัวอักษร จะเปิดหรือไม่ เป็นเรื่องของคุณ', says: [S('url.chars', F.url.chars, w(F.url.chars) + ' ตัวอักษร')] },
  { id: 'cost', text: 'F: แล้วกลับมาที่อาคาร? | M: Duplex cost ตามสาขางานแสดงกลุ่มก่อน: ' + w(F.cost.discs) + ' สาขางาน รวม ' + w(F.cost.total) + ' แล้วมันเสนอให้ post ไปที่ E R P project order', says: [S('cost.discs', F.cost.discs, w(F.cost.discs) + ' สาขางาน'), S('cost.total', F.cost.total, 'รวม ' + w(F.cost.total))] },
  { id: 'post', text: 'F: ถ้าฉันตอบใช่? | M: มัน post และการรอนั้นจริง: ที่นี่ ' + w(F.post.sec) + ' วินาที สร้างโครงการขึ้นมา มี ' + w(F.post.changes) + ' การเปลี่ยนแปลง ยอดตามแผนคือ ' + dec(F.post.planned), says: [S('post.sec', F.post.sec, w(F.post.sec) + ' วินาที'), S('post.changes', F.post.changes, 'มี ' + w(F.post.changes) + ' การเปลี่ยนแปลง'), S('post.planned', F.post.planned, dec(F.post.planned))] },
  { id: 'proj', text: 'F: ดูได้ไหม? | M: มันเสนอให้เปิดโครงการ ตอบใช่ แล้วพรอมต์ย้ายไปที่นั่น: ' + w(F.proj.props) + ' คุณสมบัติ', says: [S('proj.props', F.proj.props, w(F.proj.props) + ' คุณสมบัติ')] },
  { id: 'ls', text: 'F: แล้วรายการ? | M: ls แสดง ' + w(F.ls.rows) + ' โครงการ โครงการใหม่อยู่ในนั้น', says: [S('ls.rows', F.ls.rows, w(F.ls.rows) + ' โครงการ')] },
  { id: 'exit', text: 'M: exit แล้วคุณก็กลับมาที่ shell | F: จำชื่อนี้ไว้ | M: red one', says: [] },
  { id: 'end', hold: 9 }
];
exports.lang = LANG; exports.beats = { en: EN, zh: ZH, ms: MS, th: TH }[LANG]; exports.words = words; exports.zhw = zhw;
