// ⚠ DO NOT REMOVE — film 2 "CH 0 · Immersive Software: the ERP field" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 2), ENGLISH ONLY: the beats, their narration (F asks, M answers) and the facts each beat
// speaks. Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json and out/shots.log and FAILS the build if one is not as stated. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.2 },
  { id: 'setup', text: 'F: How do I see the code behind an ERP field? | M: One command indexes every registration: three hundred and two. One bookmark loads the tool into this tab. The shipped ERP never loads it.',
    says: [['index.entries', '302', 'three hundred and two']] },
  { id: 'move1', text: 'F: Target Document Type. What runs on it? | M: Hover it: twenty layers, in the order they fire. First the callout, CalloutOrder, line ninety-seven, ported from CalloutOrder dot java. Then the picker rule, then everything on save. Alt one opens the callout.',
    says: [['doctype.layers', '20', 'twenty layers'], ['doctype.callout_line', '97', 'line ninety-seven'], ['doctype.callout_legacy', 'CalloutOrder.java', 'CalloutOrder dot java'], ['doctype.alt1_opens_callout', 'Y', 'Alt one opens the callout']] },
  { id: 'move2', text: 'F: And when it says a piece is missing? | M: It said that once, wrongly: Date Ordered\'s date callout. The tool\'s own test asked the engine, and the engine runs it. Seventeen false alarms, now zero. One hundred and ninety-nine are really missing, across twelve thousand three hundred and twenty-three fields.',
    says: [['red.false_unported', '17', 'seventeen false alarms'], ['fix.false_unported', '0', 'now zero'], ['old.dateacct_unported', 'Y', 'it said that once'], ['new.dateacct_line_found', 'Y', 'the engine runs it'], ['fix.unported', '199', 'one hundred and ninety-nine'], ['fix.fields', '12323', 'twelve thousand three hundred and twenty-three']] },
  { id: 'close', hold: 18 }
];
// FILM_LANG=zh: the Mandarin narration, translated by the build session (2026-11-15), NOT reviewed by a native speaker. The same beats, the same facts; the spoken figure words are in Chinese.
const ZH = [
  { id: 'cover', hold: 4.2 },
  { id: 'setup', text: 'F: 怎么看到一个 ERP 字段背后的代码？ | M: 一条命令为所有注册建立索引，共三百零二个。一个书签把工具加载到这个标签页。正式发布的 ERP 从不加载它。',
    says: [['index.entries', '302', '三百零二个']] },
  { id: 'move1', text: 'F: 目标单据类型。它上面运行什么？ | M: 鼠标悬停：二十层，按触发的顺序。先是回调 CalloutOrder，第九十七行，移植自 CalloutOrder.java。然后是选择器的规则，然后是保存时的一切。按 Alt 加一，打开这个回调。',
    says: [['doctype.layers', '20', '二十层'], ['doctype.callout_line', '97', '第九十七行'], ['doctype.callout_legacy', 'CalloutOrder.java', 'CalloutOrder.java'], ['doctype.alt1_opens_callout', 'Y', '按 Alt 加一，打开这个回调']] },
  { id: 'move2', text: 'F: 如果它说某一块缺失呢？ | M: 它曾经说错过一次：订单日期的日期回调。工具自己的测试去问引擎，引擎确实在运行它。十七个误报，现在是零。真正缺失的有一百九十九个，覆盖一万二千三百二十三个字段。',
    says: [['red.false_unported', '17', '十七个误报'], ['fix.false_unported', '0', '现在是零'], ['old.dateacct_unported', 'Y', '说错过一次'], ['new.dateacct_line_found', 'Y', '引擎确实在运行它'], ['fix.unported', '199', '一百九十九个'], ['fix.fields', '12323', '一万二千三百二十三个字段']] },
  { id: 'close', hold: 18 }
];
exports.lang = { zh: 'zh' }[process.env.FILM_LANG] || 'en';
exports.beats = { en: EN, zh: ZH }[exports.lang];
