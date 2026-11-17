// ⚠ DO NOT REMOVE — film "Inside the Record" (prompts/FILM_COMMAND_LINE_ERP.md CH 3): the beats and their narration (F asks, M answers: one short exchange each, the picture explains).
// EVERY figure in the text is written from out/facts.json (this build's own recording) through words(); guard.js re-checks each `says` entry against facts.json, and that nothing on the not-said list
// is spoken. A beat's `id` is its recorded step in script.json (rec.py). English first (Kokoro, local CPU). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, process.env.OUTD || 'out', 'facts.json'), 'utf8'));
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n) {   // 0..999,999, English, as spoken
  if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : '');
}
const LANG = ['zh', 'th'].indexOf(process.env.FILM_LANG) >= 0 ? process.env.FILM_LANG : 'en';
const DG = '零一二三四五六七八九';
function zhw(n) {   // 0..999,999,999 in Chinese numerals as spoken: 1054482 -> 一百零五万四千四百八十二 ; 6980 -> 六千九百八十 ; 113 -> 一百一十三
  const sec = (m) => { let s = '', z = false; [Math.floor(m / 1000) % 10, Math.floor(m / 100) % 10, Math.floor(m / 10) % 10, m % 10].forEach((x, i) => { if (x === 0) { if (s) z = true; } else { if (z) { s += '零'; z = false; } s += DG[x] + ['千', '百', '十', ''][i]; } }); return s; };
  if (n === 0) return '零'; if (n < 20 && n >= 10) return '十' + (n % 10 ? DG[n % 10] : '');
  if (n < 10000) return sec(n); const hi = Math.floor(n / 10000), lo = n % 10000;
  return (hi < 10000 ? sec(hi) : zhw(hi)) + '万' + (lo ? (lo < 1000 ? '零' : '') + sec(lo) : '');
}
const THO = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
function thw(n) {   // Thai: 1054482 -> หนึ่งล้านห้าหมื่นสี่พันสี่ร้อยแปดสิบสอง ; 21 -> ยี่สิบเอ็ด ; 11 -> สิบเอ็ด
  if (n === 0) return THO[0]; if (n >= 1e6) return thw(Math.floor(n / 1e6)) + 'ล้าน' + (n % 1e6 ? thw(n % 1e6) : '');
  let out = ''; [[100000, 'แสน'], [10000, 'หมื่น'], [1000, 'พัน'], [100, 'ร้อย']].forEach(([u, nm]) => { const d = Math.floor(n / u) % 10; if (d) out += THO[d] + nm; });
  const t = Math.floor(n / 10) % 10, o = n % 10; if (t) out += (t === 1 ? '' : t === 2 ? 'ยี่' : THO[t]) + 'สิบ'; if (o) out += (o === 1 && (t || n > 10) ? 'เอ็ด' : THO[o]);
  return out;
}
const w = { en: words, zh: zhw, th: thw }[LANG], S = (p, v, word) => [p, String(v), word], get = (p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), F);
const may = (F.record.may || []).map(c => ({ CL: 'close', VO: 'void', RE: 're-activate', CO: 'complete', PR: 'prepare' }[c] || c));
const list = (a) => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : (a[0] || '');
const rel = (F.re && F.re.relCounts || []).map(x => x.kind.replace('Shipment/Receipt', 'shipment').replace('Invoice', 'invoice'));
const EN = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: Back in red one? | M: Yes. This time we go inside one order.', says: [] },
  { id: 'menu', text: 'F: Can I find a window without knowing its name? | M: Type menu. It is the E R P\'s own menu, as places: ' + w(F.menu.root) + ' entries at the top.', says: [S('menu.root', F.menu.root, w(F.menu.root) + ' entries')] },
  { id: 'quote', text: 'M: cd goes into a folder, and the start of its name is enough. | F: ' + w(F.menu.quote) + ' entries.', says: [S('menu.quote', F.menu.quote, w(F.menu.quote) + ' entries')] },
  { id: 'orders', text: 'M: Sales Orders holds ' + w(F.menu.orders) + '. The E R P window below opens the same folder.', says: [S('menu.orders', F.menu.orders, 'holds ' + w(F.menu.orders))] },
  { id: 'window', text: 'M: A window opens its kind, and the prompt keeps the path.', says: [] },
  { id: 'record', text: 'F: And one order? | M: cd and its number. It may do ' + w(may.length) + ' things: ' + list(may) + '. Tab offers only those, in the order of the window\'s buttons.', says: [S('record.may.length', may.length, 'do ' + w(may.length) + ' things')] },
  { id: 're', text: 'F: Last time re-activate had no word. | M: Now it does, copied line for line from legacy i Dempiere, and checked against it running: ' + w(F.a5.fields) + ' of ' + w(F.a5.fields) + ' fields the same. The order is in progress again, and its ' + list(rel) + ' are reversed.', says: [S('a5.fields', F.a5.fields, w(F.a5.fields) + ' of ' + w(F.a5.fields) + ' fields')] },
  { id: 'co', text: 'F: And complete it again? | M: do C O. Completed, in ' + w(F.co.ms) + ' milliseconds.', says: [S('co.ms', F.co.ms, w(F.co.ms) + ' milliseconds')] },
  { id: 'hist', text: 'F: And again, without typing it? | M: history shows the lines. Bang ' + w(+F.hist.n) + ' runs that line again, and prints it first.', says: [S('hist.n', F.hist.n, 'bang ' + w(+F.hist.n))] },
  { id: 'up', text: 'M: Shift Tab climbs back, one place at a time. | F: Into the record, and out again.', says: [] },
  { id: 'end', hold: 14 }
];
// FILM_LANG=zh / th: translated by the build session (2026-11-18), NOT reviewed by a native speaker. The same beats and facts; the spoken figure words are written by zhw / thw from facts.json.
const mayZ = (F.record.may || []).map(c => ({ CL: '关闭', VO: '作废', RE: '重新激活', CO: '完成', PR: '准备' }[c] || c)), mayT = (F.record.may || []).map(c => ({ CL: 'ปิด', VO: 'ยกเลิก', RE: 'เปิดใช้งานใหม่', CO: 'ทำให้เสร็จ', PR: 'เตรียม' }[c] || c));
const relZ = (F.re && F.re.relCounts || []).map(x => /Invoice/.test(x.kind) ? '发票' : '发货单'), relT = (F.re && F.re.relCounts || []).map(x => /Invoice/.test(x.kind) ? 'ใบแจ้งหนี้' : 'ใบส่งของ');
const ZH = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: 又回到 red one 了？ | M: 对。这次我们走进一张订单的里面。', says: [] },
  { id: 'menu', text: 'F: 不知道窗口的名字，也能找到它吗？ | M: 输入 menu。这就是 E R P 自己的菜单，变成了一个个位置：最上层有' + w(F.menu.root) + '项。', says: [S('menu.root', F.menu.root, '有' + w(F.menu.root) + '项')] },
  { id: 'quote', text: 'M: cd 进入一个文件夹，名字的开头就够了。 | F: 有' + w(F.menu.quote) + '项。', says: [S('menu.quote', F.menu.quote, '有' + w(F.menu.quote) + '项')] },
  { id: 'orders', text: 'M: Sales Orders 里有' + w(F.menu.orders) + '项。下面的 E R P 窗口打开的是同一个文件夹。', says: [S('menu.orders', F.menu.orders, '有' + w(F.menu.orders) + '项')] },
  { id: 'window', text: 'M: 窗口打开它的类型，提示符保留着路径。', says: [] },
  { id: 'record', text: 'F: 那一张订单呢？ | M: cd 加上它的编号。它可以做' + w(mayZ.length) + '件事：' + mayZ.join('、') + '。Tab 只提供这几项，顺序和窗口的按钮一样。', says: [S('record.may.length', mayZ.length, '做' + w(mayZ.length) + '件事')] },
  { id: 're', text: 'F: 上次，重新激活还没有命令。 | M: 现在有了。它从旧版 i Dempiere 逐行移植，并对照正在运行的旧版做了检查：' + w(F.a5.fields) + '个字段中，' + w(F.a5.fields) + '个相同。订单回到进行中，它的' + relZ.join('和') + '都被冲销了。', says: [S('a5.fields', F.a5.fields, w(F.a5.fields) + '个字段中，' + w(F.a5.fields) + '个相同')] },
  { id: 'co', text: 'F: 再完成一次？ | M: do C O。已完成，用了' + w(F.co.ms) + '毫秒。', says: [S('co.ms', F.co.ms, w(F.co.ms) + '毫秒')] },
  { id: 'hist', text: 'F: 再来一次，但不用重新输入？ | M: history 列出输入过的行。叹号加' + w(+F.hist.n) + '，会再运行那一行，并先把它打印出来。', says: [S('hist.n', F.hist.n, '叹号加' + w(+F.hist.n))] },
  { id: 'up', text: 'M: Shift Tab 每次退回一个位置。 | F: 走进订单，再走出来。', says: [] },
  { id: 'end', hold: 14 }
];
const TH = [
  { id: 'cover', hold: 4 },
  { id: 'start', text: 'F: กลับมาที่ red one อีกแล้วเหรอ? | M: ใช่ คราวนี้เราจะเข้าไปข้างในใบสั่งขาย', says: [] },
  { id: 'menu', text: 'F: หาหน้าต่างได้ไหม ถ้าไม่รู้ชื่อ? | M: พิมพ์ menu นี่คือเมนูของ E R P เอง ในรูปของสถานที่ ชั้นบนสุดมี ' + w(F.menu.root) + ' รายการ', says: [S('menu.root', F.menu.root, 'มี ' + w(F.menu.root) + ' รายการ')] },
  { id: 'quote', text: 'M: cd เข้าไปในโฟลเดอร์ พิมพ์แค่ต้นชื่อก็พอ | F: มี ' + w(F.menu.quote) + ' รายการ', says: [S('menu.quote', F.menu.quote, 'มี ' + w(F.menu.quote) + ' รายการ')] },
  { id: 'orders', text: 'M: Sales Orders มี ' + w(F.menu.orders) + ' รายการ หน้าต่าง E R P ด้านล่างเปิดโฟลเดอร์เดียวกัน', says: [S('menu.orders', F.menu.orders, 'มี ' + w(F.menu.orders) + ' รายการ')] },
  { id: 'window', text: 'M: หน้าต่างจะเปิดชนิดของมัน และพรอมต์ยังเก็บเส้นทางไว้', says: [] },
  { id: 'record', text: 'F: แล้วใบสั่งขายใบนั้นล่ะ? | M: cd ตามด้วยหมายเลข มันทำได้ ' + w(mayT.length) + ' อย่าง คือ ' + mayT.join(' ') + ' Tab เสนอแค่นั้น เรียงตามปุ่มของหน้าต่าง', says: [S('record.may.length', mayT.length, 'ทำได้ ' + w(mayT.length) + ' อย่าง')] },
  { id: 're', text: 'F: คราวก่อน การเปิดใช้งานใหม่ยังไม่มีคำสั่ง | M: ตอนนี้มีแล้ว พอร์ตมาทีละบรรทัดจาก i Dempiere รุ่นเดิม และตรวจกับรุ่นเดิมที่กำลังทำงาน ฟิลด์ตรงกัน ' + w(F.a5.fields) + ' จาก ' + w(F.a5.fields) + ' ใบสั่งกลับไปเป็นกำลังดำเนินการ และ' + relT.join('กับ') + 'ถูกกลับรายการ', says: [S('a5.fields', F.a5.fields, 'ตรงกัน ' + w(F.a5.fields) + ' จาก ' + w(F.a5.fields))] },
  { id: 'co', text: 'F: แล้วทำให้เสร็จอีกครั้งล่ะ? | M: do C O เสร็จสมบูรณ์ ใช้เวลา ' + w(F.co.ms) + ' มิลลิวินาที', says: [S('co.ms', F.co.ms, w(F.co.ms) + ' มิลลิวินาที')] },
  { id: 'hist', text: 'F: ทำอีกครั้งโดยไม่ต้องพิมพ์ได้ไหม? | M: history แสดงบรรทัดที่เคยพิมพ์ เครื่องหมายตกใจกับ ' + w(+F.hist.n) + ' จะรันบรรทัดนั้นอีกครั้ง และพิมพ์ให้ดูก่อน', says: [S('hist.n', F.hist.n, 'เครื่องหมายตกใจกับ ' + w(+F.hist.n))] },
  { id: 'up', text: 'M: Shift Tab ถอยกลับทีละที่ | F: เข้าไปในใบสั่ง แล้วก็ออกมา', says: [] },
  { id: 'end', hold: 14 }
];
exports.lang = LANG; exports.beats = { en: EN, zh: ZH, th: TH }[LANG]; exports.words = words; exports.get = get;
