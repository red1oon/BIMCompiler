// ⚠ DO NOT REMOVE — film "MIS Menu Driven" (prompts/FILM_COMMAND_LINE_ERP.md, CH 2): the beats, their narration (F asks, M answers, one short line each: the picture does the explaining) and the facts
// each beat speaks. Numbers are spelled in words for the voice; guard.js checks each `says` entry against out/facts.json and that nothing on the not-said list is spoken. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 3.6 },
  { id: 'still1', text: 'F: Do the single lines of before still work? | M: The same line as before. Three groups, the same three in the window below.', says: [['still1.rows.length', '3', 'three groups'], ['states.s1.records', '3', 'same three']] },
  { id: 'still2', text: 'F: And writing? | M: One line adds a group. The window shows four.', says: [['still2.windowRows', '4', 'shows four']] },
  { id: 'menu', text: 'F: Now, a menu. | M: Slash M. The menu of the E R P, for this role. Two hundred and ninety-four windows.', says: [['menu.windows', '294', 'two hundred and ninety-four windows']] },
  { id: 'find', text: 'F: Where are the partners? | M: Slash, and a name. Eleven entries.', says: [['find.items', '11', 'eleven entries']] },
  { id: 'open', text: 'M: Number three opens its list. The screen types the same lines you would.', says: [] },
  { id: 'back', text: 'F: And back? | M: Escape, and escape. The menu again.', says: [] },
  { id: 'close', hold: 8.5, text: 'M: Every key on the screen is a line you could type yourself. | F: The card has what it costs, how it is checked, and who made it.', says: [] },
  { id: 'end', hold: 9 }   // the same card, silent: the voice tool's own credit line takes the last seconds
];
// FILM_LANG=zh: the Mandarin narration, translated by the build session (2026-11-15), NOT reviewed by a native speaker. The same beats, the same facts; the spoken figure words are Chinese.
const ZH = [
  { id: 'cover', hold: 3.6 },
  { id: 'still1', text: 'F: 以前的单行命令还能用吗？ | M: 还是原来那一行。三个组，下面的窗口里也是同样三个。', says: [['still1.rows.length', '3', '三个组'], ['states.s1.records', '3', '同样三个']] },
  { id: 'still2', text: 'F: 那写入呢？ | M: 一行命令加一个组。窗口里显示四个。', says: [['still2.windowRows', '4', '显示四个']] },
  { id: 'menu', text: 'F: 现在，来个菜单。 | M: 斜杠 M。这是 ERP 自己的菜单，按这个角色。二百九十四个窗口。', says: [['menu.windows', '294', '二百九十四个窗口']] },
  { id: 'find', text: 'F: 业务伙伴在哪里？ | M: 斜杠，再输入名称。十一个条目。', says: [['find.items', '11', '十一个条目']] },
  { id: 'open', text: 'M: 按三，打开它的列表。屏幕替你输入的，就是你自己会输入的那几行命令。', says: [] },
  { id: 'back', text: 'F: 怎么返回？ | M: 按两次 Escape。又回到菜单。', says: [] },
  { id: 'close', hold: 8.5, text: 'M: 屏幕上的每一个按键，都是一行你可以自己输入的命令。 | F: 这张卡片写着它的成本、怎样检查，以及是谁做的。', says: [] },
  { id: 'end', hold: 9 }
];
// FILM_LANG=ms: the Malay narration, translated by the build session (2026-11-15), NOT reviewed by a native speaker. The same beats, the same facts; the spoken figure words are Malay.
const MS = [
  { id: 'cover', hold: 3.6 },
  { id: 'still1', text: 'F: Arahan lama masih boleh guna? | M: Baris yang sama seperti dahulu. Tiga kumpulan, tiga yang sama dalam tetingkap di bawah.', says: [['still1.rows.length', '3', 'tiga kumpulan'], ['states.s1.records', '3', 'tiga yang sama']] },
  { id: 'still2', text: 'F: Bagaimana dengan menulis? | M: Satu baris menambah satu kumpulan. Tetingkap menunjukkan empat.', says: [['still2.windowRows', '4', 'menunjukkan empat']] },
  { id: 'menu', text: 'F: Sekarang, satu menu. | M: Slash M. Menu E R P itu sendiri, untuk peranan ini. Dua ratus sembilan puluh empat tetingkap.', says: [['menu.windows', '294', 'dua ratus sembilan puluh empat tetingkap']] },
  { id: 'find', text: 'F: Di mana rakan niaga? | M: Slash, dan satu nama. Sebelas entri.', says: [['find.items', '11', 'sebelas entri']] },
  { id: 'open', text: 'M: Nombor tiga membuka senarainya. Skrin menaip baris yang sama seperti yang anda taip.', says: [] },
  { id: 'back', text: 'F: Dan untuk kembali? | M: Escape, dan escape. Menu semula.', says: [] },
  { id: 'close', hold: 11, text: 'M: Setiap kekunci pada skrin ialah satu baris yang boleh anda taip sendiri. | F: Kad ini menunjukkan kosnya, cara ia disemak, dan siapa yang membuatnya.', says: [] },
  { id: 'end', hold: 9 }
];
exports.lang = { zh: 'zh', ms: 'ms' }[process.env.FILM_LANG] || 'en';
exports.beats = { en: EN, zh: ZH, ms: MS }[exports.lang];
