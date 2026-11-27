// ⚠ DO NOT REMOVE — film "One line" (§24): the beats, their narration (F asks, M explains) and the facts each beat speaks. Numbers are spelled in words for the voice;
// guard.js checks each `says` entry against out/facts.json. No proof talk in the voice (owner, 2026-11-10). READ out/guard.log.
'use strict';
const EN = [
  { id: 'title', hold: 3.6 },
  { id: 'screens', text: 'F: Business software is full of screens. | M: And every task is a hunt for the right button.', says: [] },
  { id: 'find', text: 'M: What if you could just say it? One line. | F: Find order fifty thousand. | M: And the app answers. It is a draft.', says: [['order.number', '50000', 'fifty thousand'], ['find.docStatus', 'DR', 'draft']] },
  { id: 'do', text: 'F: What can I do with it? | M: Ask. Then do it. Complete the order. | F: One line, and the draft is completed. | M: The same engine as the screen, without the screen.', says: [['complete.after.docStatus', 'CO', 'completed']] },
  { id: 'more', text: 'M: Void an order. Close one. Reverse one. | F: Is each one just a line? | M: Each is one line.', says: [['void.after.docStatus', 'VO', 'void'], ['close.after.docStatus', 'CL', 'close'], ['reverse.after.docStatus', 'RE', 'reverse']] },
  { id: 'building', text: 'F: And the building? | M: The same door. How many rooms? Five. | M: The fire protection layout would place forty six items.', says: [['rooms', 5, 'five'], ['walk', 46, 'forty six']] },
  { id: 'script', text: 'M: Put a few lines in a file, and you have a script. | F: One I can actually read.', says: [] },
  { id: 'door', text: 'M: People type it. An A I can use the very same lines. | F: One door, and one small vocabulary.', says: [] },
  { id: 'others', text: 'F: Do other systems do this? | M: Others give programmers a code console, or a developer tool. | M: In our search, we did not find one short vocabulary that a person and an A I both type.', says: [] },
  { id: 'close', text: 'M: One line at a time. It is open source, and published so anyone\'s A I can read it. | F: And the guide shows how.', says: [] }
];
// Mandarin (Simplified). Same ids, same facts; the spoken word of each fact is the Chinese one.
const ZH = [
  { id: 'title', hold: 3.6 },
  { id: 'screens', text: 'F: 企业软件到处都是界面。 | M: 每件事都要到处找那个按钮。', says: [] },
  { id: 'find', text: 'M: 如果直接说出来呢？只要一行。 | F: 查找订单五万号。 | M: 系统马上回答。它是一张草稿。', says: [['order.number', '50000', '五万'], ['find.docStatus', 'DR', '草稿']] },
  { id: 'do', text: 'F: 我能对它做什么？ | M: 先问，再做。完成这张订单。 | F: 一行命令，草稿就完成了。 | M: 和界面背后是同一个引擎，只是不用界面。', says: [['complete.after.docStatus', 'CO', '完成']] },
  { id: 'more', text: 'M: 作废一张订单。关闭一张。冲销一张。 | F: 每个都只要一行吗？ | M: 每个都只要一行。', says: [['void.after.docStatus', 'VO', '作废'], ['close.after.docStatus', 'CL', '关闭'], ['reverse.after.docStatus', 'RE', '冲销']] },
  { id: 'building', text: 'F: 那建筑模型呢？ | M: 同一扇门。有多少个房间？五个。 | M: 消防布置会放置四十六个设备。', says: [['rooms', 5, '五个'], ['walk', 46, '四十六']] },
  { id: 'script', text: 'M: 把几行写进一个文件，就是一个脚本。 | F: 而且我真的看得懂。', says: [] },
  { id: 'door', text: 'M: 人可以输入。AI 也能用完全相同的命令。 | F: 一扇门，一套很小的词汇。', says: [] },
  { id: 'others', text: 'F: 其他系统也这样做吗？ | M: 其他系统给程序员的是代码控制台，或者开发工具。 | M: 在我们的查找中，没有找到一套人和 AI 都能直接输入的简短词汇。', says: [] },
  { id: 'close', text: 'M: 一次一行。它是开源的，公开发布，让任何人的 AI 都能读懂。 | F: 指南里有做法。', says: [] }
];
exports.lang = process.env.FILM_LANG === 'zh' ? 'zh' : 'en';
exports.beats = exports.lang === 'zh' ? ZH : EN;
