// ⚠ DO NOT REMOVE — film "Help that answers" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11), ENGLISH voice, English subtitles: the beats, their narration (F asks, M answers, short: the picture
// explains) and the facts each beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json, the witness logs and the saved
// prior-art copies, and FAILS the build if one is not as stated. Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.5 },
  { id: 'quote', text: 'F: How much of the week goes into just looking things up? | M: McKinsey estimated nearly twenty percent of it. | M: Looking for internal information, or tracking down a colleague who can help.',
    says: [['quote.found', 'Y', 'nearly twenty percent'], ['quote.source', 'McKinsey Global Institute', 'McKinsey']] },
  { id: 'before', text: 'F: What did a field tell you before? | M: Its column name and its type. | M: Now it says what legacy iDempiere says: the field\'s own description. | M: It matches the real legacy database on all fifteen thousand eight hundred and forty-nine fields. | M: Click into one, and the Tool Tip panel shows its name, its description and its help.',
    says: [['old.tooltip', 'Y', 'its column name and its type'], ['f4.n', '15849', 'fifteen thousand eight hundred and forty-nine'], ['field.panel', 'Y', 'its name, its description and its help']] },
  { id: 'ask1', text: 'F: Can I just ask it? | M: Type a question. It finds the Sales Order window and the Close action. | M: Close is allowed once the order is completed or waiting payment. | M: It also gives the command line that does it. | M: No A I inside: it matches the dictionary\'s own words.',
    says: [['ask1.window', '143', 'the Sales Order window'], ['ask1.action', 'CL', 'the Close action'], ['ask1.allowed', 'Completed, Waiting Payment', 'completed or waiting payment'], ['ask1.cli', 'erp.close kind=Order number=<Document No>', 'the command line that does it']] },
  { id: 'link', text: 'F: And these steps? | M: They come from the E R P user guide, word for word, with a link to its section. | M: Click Sales Order, and the window opens with its how-to beside it.',
    says: [['s5', '4/4', 'word for word'], ['link.opened', '143', 'the window opens'], ['link.ctx', 'Y', 'its how-to beside it']] },
  { id: 'ask2', text: 'F: What about voiding a payment? | M: The Payment window, and Void, with every status it is allowed from. | M: The command line is honest: today it is offered for orders only.',
    says: [['ask2.window', '195', 'The Payment window'], ['ask2.action', 'VO', 'Void'], ['ask2.cli_note', 'Y', 'offered for orders only']] },
  { id: 'german', text: 'F: Does it speak German? | M: Choose Deutsch. The same field\'s description is now German, | M: from the published German language pack: nearly fifteen thousand fields. | M: Its longer help has no German text yet, so it stays English, as in legacy.',
    says: [['lb.lang', 'de_DE', 'Choose Deutsch'], ['lb.fields', '14961', 'nearly fifteen thousand fields'], ['lb.desc_translated', 'Y', 'description is now German'], ['lb.help_translated', 'N', 'stays English']] },
  { id: 'close', hold: 18 }
];
// The Mandarin cut (FILM_LANG=zh): the same beats, ids and facts, turn for turn; each beat's `gloss` is the English line shown under the Chinese one (written form, the owner's rule:
// "if in foreign language, give English subtitles"). Translated by the build session, not reviewed by a native speaker (said on the last card). The language beat is 中文 (zh_CN), the Description field.
const ZH = [
  { id: 'cover', hold: 4.5 },
  { id: 'quote', text: 'F: 一周里，有多少时间花在查找资料上？ | M: 麦肯锡估计，将近百分之二十。 | M: 用来查找内部信息，或者寻找能帮忙的同事。',
    gloss: 'F: How much of the week goes into just looking things up? | M: McKinsey estimated nearly twenty percent of it. | M: Looking for internal information, or tracking down a colleague who can help.',
    says: [['quote.found', 'Y', '将近百分之二十'], ['quote.source', 'McKinsey Global Institute', '麦肯锡']] },
  { id: 'before', text: 'F: 以前，一个字段会告诉你什么？ | M: 只有列名和类型。 | M: 现在它和原版 iDempiere 一样，显示字段自己的说明。 | M: 在真实的原版数据库上，一万五千八百四十九个字段全部一致。 | M: 点进一个字段，提示面板就显示它的名称、说明和帮助。',
    gloss: 'F: What did a field tell you before? | M: Its column name and its type. | M: Now it says what legacy iDempiere says: the field\'s own description. | M: It matches the real legacy database on all 15,849 fields. | M: Click into one, and the Tool Tip panel shows its name, its description and its help.',
    says: [['old.tooltip', 'Y', '只有列名和类型'], ['f4.n', '15849', '一万五千八百四十九'], ['field.panel', 'Y', '名称、说明和帮助']] },
  { id: 'ask1', text: 'F: 我可以直接问它吗？ | M: 输入一个问题，它就找到销售订单窗口和关闭操作。 | M: 订单处于已完成或等待付款时，才能关闭。 | M: 它还给出完成这一步的命令行。 | M: 里面没有人工智能，只是匹配字典自己的词。',
    gloss: 'F: Can I just ask it? | M: Type a question. It finds the Sales Order window and the Close action. | M: Close is allowed once the order is completed or waiting payment. | M: It also gives the command line that does it. | M: No AI inside: it matches the dictionary\'s own words.',
    says: [['ask1.window', '143', '销售订单窗口'], ['ask1.action', 'CL', '关闭操作'], ['ask1.allowed', 'Completed, Waiting Payment', '已完成或等待付款'], ['ask1.cli', 'erp.close kind=Order number=<Document No>', '命令行']] },
  { id: 'link', text: 'F: 这些步骤是从哪里来的？ | M: 来自 ERP 用户指南，一字不改，还链接到对应的章节。 | M: 点击销售订单，窗口打开，旁边就是它的操作说明。',
    gloss: 'F: Where do these steps come from? | M: From the ERP user guide, word for word, with a link to its section. | M: Click Sales Order, and the window opens with its how-to beside it.',
    says: [['s5', '4/4', '一字不改'], ['link.opened', '143', '窗口打开'], ['link.ctx', 'Y', '旁边就是它的操作说明']] },
  { id: 'ask2', text: 'F: 那作废一笔付款呢？ | M: 付款窗口和作废操作，还列出允许作废的每一种状态。 | M: 命令行也很诚实：目前只支持订单。',
    gloss: 'F: What about voiding a payment? | M: The Payment window, and Void, with every status it is allowed from. | M: The command line is honest: today it is offered for orders only.',
    says: [['ask2.window', '195', '付款窗口'], ['ask2.action', 'VO', '作废操作'], ['ask2.cli_note', 'Y', '目前只支持订单']] },
  { id: 'german', text: 'F: 它会说中文吗？ | M: 选择中文。同一张订单上，描述字段的说明和帮助都变成了中文。 | M: 文字来自已发布的中文语言包，共九千三百多个字段。 | M: 没有中文的字段，比如文档号，和原版一样保持英文。',
    gloss: 'F: Does it speak Chinese? | M: Choose Chinese. On the same order, the Description field\'s description and help are now Chinese. | M: The text comes from the published Chinese language pack: over nine thousand three hundred fields. | M: A field with no Chinese text, like Document No, stays in English, as in legacy.',
    says: [['lb.lang', 'zh_CN', '选择中文'], ['lb.fields', '9315', '九千三百多个字段'], ['lb.desc_translated', 'Y', '说明……变成了中文'], ['lb.help_translated', 'Y', '帮助都变成了中文'], ['lb.fallback', 'Y', '文档号……保持英文']] },
  { id: 'close', hold: 18 }
];
const L = process.env.FILM_LANG || 'en';
exports.lang = L;
exports.beats = L === 'zh' ? ZH : EN;
exports.en = EN; exports.zh = ZH;
// what the film SAYS in English (the voice of the English cut, the gloss of the Mandarin cut): the guard's not-said list reads this
exports.saidEnglish = (L === 'zh' ? ZH.map((b) => b.gloss || '') : EN.map((b) => b.text || '')).join(' ');
