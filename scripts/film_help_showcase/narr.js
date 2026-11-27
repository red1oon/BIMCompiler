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
const ZH = [   // v2 (owner: "The Mandarin should show in Mandarin on the app too"; "can its CLI also asks in Mandarin"): the screen is 中文 from login, the questions are typed in Chinese, and the CLI answers in Chinese
  { id: 'cover', hold: 4.5 },
  { id: 'quote', text: 'F: 一周里，有多少时间花在查找资料上？ | M: 麦肯锡估计，将近百分之二十。 | M: 用来查找内部信息，或者寻找能帮忙的同事。',
    gloss: 'F: How much of the week goes into just looking things up? | M: McKinsey estimated nearly twenty percent of it. | M: Looking for internal information, or tracking down a colleague who can help.',
    says: [['quote.found', 'Y', '将近百分之二十'], ['quote.source', 'McKinsey Global Institute', '麦肯锡']] },
  { id: 'before', text: 'F: 以前，一个字段会告诉你什么？ | M: 只有列名和类型。 | M: 现在它和原版 iDempiere 一样，显示字段自己的说明，这里是中文。 | M: 在真实的原版数据库上，一万五千八百四十九个字段全部一致。 | M: 点进描述字段，提示面板就显示它的名称、说明和帮助。',
    gloss: 'F: What did a field tell you before? | M: Its column name and its type. | M: Now it says what legacy iDempiere says: the field\'s own description, here in Chinese. | M: It matches the real legacy database on all 15,849 fields. | M: Click into the Description field, and the Tool Tip panel shows its name, its description and its help.',
    says: [['old.tooltip', 'Y', '只有列名和类型'], ['f4.n', '15849', '一万五千八百四十九'], ['ui.desc_translated', 'Y', '这里是中文'], ['field.panel', 'Y', '名称、说明和帮助']] },
  { id: 'ask1', text: 'F: 我可以直接用中文问吗？ | M: 输入问题，它就找到销售订单窗口和结束操作。 | M: 订单处于完成或等候付款时，才能结束。 | M: 它还给出完成这一步的命令行。 | M: 里面没有人工智能，只是匹配字典自己的中文词。',
    gloss: 'F: Can I just ask in Chinese? | M: Type a question. It finds the Sales Order window and the Close action (结束 in this language pack). | M: Close is allowed once the order is completed or waiting payment. | M: It also gives the command line that does it. | M: No AI inside: it matches the dictionary\'s own Chinese words.',
    says: [['ask1.lang', 'zh_CN', '用中文问'], ['ask1.window', '143', '销售订单窗口'], ['ask1.action', 'CL', '结束操作'], ['ask1.allowed', '完成, 等候付款', '完成或等候付款'], ['ask1.cli', 'erp.close kind=Order number=<Document No>', '命令行']] },
  { id: 'link', text: 'F: 这些步骤是从哪里来的？ | M: 来自 ERP 用户指南，由构建会话译成中文，还链接到原文的章节。 | M: 点击销售订单，窗口打开，旁边就是中文的操作说明。',
    gloss: 'F: Where do these steps come from? | M: From the ERP user guide, translated into Chinese by the build session, with a link to the original section. | M: Click Sales Order, and the window opens with its how-to beside it, in Chinese.',
    says: [['link.opened', '143', '窗口打开'], ['link.ctx_lang', 'zh_CN', '中文的操作说明'], ['w.s7', 'Y', '由构建会话译成中文']] },
  { id: 'ask2', text: 'F: 那完成一张发票呢？ | M: 发票窗口和完成操作，还列出允许完成的每一种状态。 | M: 命令行也很诚实：目前只支持订单。',
    gloss: 'F: And completing an invoice? | M: The Invoice window, and Complete, with every status it is allowed from. | M: The command line is honest: today it is offered for orders only.',
    says: [['ask2.window', '167', '发票窗口'], ['ask2.action', 'CO', '完成操作'], ['ask2.cli_note', 'Y', '目前只支持订单']] },
  { id: 'cli', text: 'F: 在命令行里也能问吗？ | M: 可以。同样的问题，同样的字典，同样的中文语言包。 | M: 终端的语言是中文，所以回答也是中文。 | M: 它只读不写，什么都不会改变。',
    gloss: 'F: Can I ask at the command line too? | M: Yes. The same question, the same dictionary, the same Chinese language pack. | M: The terminal\'s language is Chinese, so the answer is Chinese too. | M: It only reads: nothing is changed.',
    says: [['cli.window', '143', '同样的问题'], ['cli.action', 'CL', '同样的字典'], ['cli.lang', 'zh_CN/LANG', '终端的语言是中文'], ['cli.harm', 'read', '只读不写']] },
  { id: 'close', hold: 18 }
];
// The German cut (FILM_LANG=de): the screen is Deutsch from login, the questions are typed in German, the CLI answers in German. Each turn is ONE caption line; its `gloss` is the English under it.
//   Translated by the build session, not reviewed by a native speaker (said on the last card).
const DE = [
  { id: 'cover', hold: 4.5 },
  { id: 'quote', text: 'F: Wie viel Zeit der Woche geht fürs Nachschlagen drauf? | M: McKinsey schätzt: fast zwanzig Prozent. | M: Für die Suche nach internen Informationen, | M: oder nach einem Kollegen, der helfen kann.',
    gloss: 'F: How much of the week goes into just looking things up? | M: McKinsey estimated nearly twenty percent of it. | M: Looking for internal information, | M: or tracking down a colleague who can help.',
    says: [['quote.found', 'Y', 'fast zwanzig Prozent'], ['quote.source', 'McKinsey Global Institute', 'McKinsey']] },
  { id: 'before', text: 'F: Was hat ein Feld früher angezeigt? | M: Nur seinen Spaltennamen und seinen Typ. | M: Jetzt zeigt es seine eigene Beschreibung, wie das Original. | M: Hier auf Deutsch. | M: In der echten Originaldatenbank stimmen sie überein: | M: alle fünfzehntausendachthundertneunundvierzig Felder. | M: Klicken Sie ins Feld Beschreibung. | M: Der Tool-Tip-Bereich zeigt Name, Beschreibung und Hilfe.',
    gloss: 'F: What did a field tell you before? | M: Its column name and its type. | M: Now it shows its own description, as the original does. | M: Here in German. | M: In the real original database they match: | M: all 15,849 fields. | M: Click into the Description field. | M: The Tool Tip panel shows its name, its description and its help.',
    says: [['old.tooltip', 'Y', 'Spaltennamen und seinen Typ'], ['f4.n', '15849', 'fünfzehntausendachthundertneunundvierzig'], ['ui.desc_translated', 'Y', 'Hier auf Deutsch'], ['field.panel', 'Y', 'Name, Beschreibung und Hilfe']] },
  { id: 'ask1', text: 'F: Kann ich einfach auf Deutsch fragen? | M: Ja. Es findet das Fenster Auftrag und die Aktion Schließen. | M: Erlaubt bei Fertiggestellt oder Zurückgehaltene Zahlung. | M: Dazu die Befehlszeile, die es erledigt. | M: Keine KI dahinter: es vergleicht die Wörter des Wörterbuchs.',
    gloss: 'F: Can I just ask in German? | M: Yes. It finds the Sales Order window (Auftrag) and the Close action. | M: Allowed when the order is Completed or Waiting Payment. | M: And the command line that does it. | M: No AI inside: it matches the dictionary\'s own words.',
    says: [['ask1.lang', 'de_DE', 'auf Deutsch fragen'], ['ask1.window', '143', 'Fenster Auftrag'], ['ask1.action', 'CL', 'Aktion Schließen'], ['ask1.allowed', 'Fertiggestellt, Zurückgehaltene Zahlung', 'Fertiggestellt oder Zurückgehaltene Zahlung'], ['ask1.cli', 'erp.close kind=Order number=<Document No>', 'die Befehlszeile']] },
  { id: 'link', text: 'F: Woher kommen diese Schritte? | M: Aus dem ERP-Benutzerhandbuch, übersetzt von der Build-Sitzung, | M: mit einem Link zum Originalabschnitt. | M: Klicken Sie auf Auftrag: das Fenster öffnet sich, | M: daneben die Anleitung auf Deutsch.',
    gloss: 'F: Where do these steps come from? | M: From the ERP user guide, translated by the build session, | M: with a link to the original section. | M: Click Auftrag (Sales Order): the window opens, | M: with its how-to beside it, in German.',
    says: [['link.opened', '143', 'das Fenster öffnet sich'], ['link.ctx_lang', 'de_DE', 'Anleitung auf Deutsch'], ['w.s7', 'Y', 'übersetzt von der Build-Sitzung']] },
  { id: 'ask2', text: 'F: Und eine Rechnung fertigstellen? | M: Das Fenster Rechnung und die Aktion Fertigstellen, | M: mit jedem Status, aus dem sie erlaubt ist. | M: Die Befehlszeile ist ehrlich: bisher nur für Aufträge.',
    gloss: 'F: And completing an invoice? | M: The Invoice window and the Complete action, | M: with every status it is allowed from. | M: The command line is honest: so far for orders only.',
    says: [['ask2.window', '167', 'Fenster Rechnung'], ['ask2.action', 'CO', 'Aktion Fertigstellen'], ['ask2.cli_note', 'Y', 'bisher nur für Aufträge']] },
  { id: 'cli', text: 'F: Geht das auch auf der Kommandozeile? | M: Ja. Dieselbe Frage, dasselbe Wörterbuch, dasselbe Sprachpaket. | M: Das Terminal ist auf Deutsch eingestellt, also antwortet es deutsch. | M: Es liest nur: nichts wird verändert.',
    gloss: 'F: Can I ask at the command line too? | M: Yes. The same question, the same dictionary, the same language pack. | M: The terminal is set to German, so it answers in German. | M: It only reads: nothing is changed.',
    says: [['cli.window', '143', 'Dieselbe Frage'], ['cli.action', 'CL', 'dasselbe Wörterbuch'], ['cli.lang', 'de_DE/LANG', 'Terminal ist auf Deutsch eingestellt'], ['cli.harm', 'read', 'Es liest nur']] },
  { id: 'close', hold: 18 }
];
const L = process.env.FILM_LANG || 'en';
exports.lang = L;
exports.beats = L === 'zh' ? ZH : (L === 'de' ? DE : EN);
exports.en = EN; exports.zh = ZH; exports.de = DE;
// what the film SAYS in English (the voice of the English cut, the gloss of the Mandarin cut): the guard's not-said list reads this
exports.saidEnglish = (L === 'zh' ? ZH.map((b) => b.gloss || '') : (L === 'de' ? DE.map((b) => b.gloss || '') : EN.map((b) => b.text || ''))).join(' ');
