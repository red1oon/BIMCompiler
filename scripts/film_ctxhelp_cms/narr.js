// ⚠ DO NOT REMOVE — film "The container legacy gave us, filled" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.18, storyboard v1 OK'd by the owner 2026-11-22), ENGLISH voice, English subtitles.
//   The beats, their narration (F asks, M answers; short: the picture explains) and the facts each beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses];
//   guard.js resolves every key from out/facts.json (shots.js), out/legacy.json (legacy_shot.js) and the witness logs run on the same main tree, and FAILS the build if one is not as stated.
//   Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.5 },
  { id: 'before', text: 'F: What does legacy iDempiere ship in its Context Help? | M: One topic: the welcome page. | M: Here is the same window in our twin. Same tables, same columns. Eighteen topics. | M: Legacy gave us the container. We filled it.',
    says: [['legacy.helps', '1', 'One topic'], ['twin.records', '18', 'Eighteen topics'], ['twin.window', '200034', 'the same window']] },
  { id: 'tab', text: 'F: Open a Sales Order. What does the panel say? | M: First, the tab\'s own words, exactly as legacy has them. | M: Then, under a thin line, the steps. | M: Click Order Line, and the panel follows the tab: its own step. | M: A tab without a topic shows legacy\'s text alone, as legacy does.',
    says: [['so.shown', 'dict+msg', 'the tab\'s own words ... then the steps'], ['line.tab', '187', 'Click Order Line'], ['line.shown', 'dict+msg', 'its own step'], ['tax.shown', 'dict', 'legacy\'s text alone']] },
  { id: 'guide', text: 'F: Some of these steps are long. | M: A message holds two thousand characters, in legacy and here. | M: So a long topic keeps whole paragraphs, then links to the rest, in the guide. | M: Read it in the app, or read the whole guide. It is the same text, not a second version.',
    says: [['fit.max', '2000', 'two thousand characters'], ['more.heading', 'Step 9 · Complete the order', 'links to the rest, in the guide']] },
  { id: 'ask', text: 'F: Can I just ask? | M: It finds the Sales Order window and the Close action, and every status Close is allowed from. | M: No A I inside: it matches the dictionary\'s own words.',
    says: [['ask.window', '143', 'the Sales Order window'], ['ask.action', 'CL', 'the Close action']] },
  { id: 'cli', text: 'F: And at the command line? | M: The same question, the same answer, from the same dictionary. | M: It only reads. Nothing is changed.',
    says: [['cli.window', '143', 'the same answer'], ['cli.action', 'CL', 'the same answer'], ['cli.status', 'ok', 'It only reads']] },
  { id: 'langs', text: 'F: And in other languages? | M: Mandarin, German, Spanish. The tab\'s own text comes from legacy\'s published language packs. | M: Our steps are machine translated in German and Chinese, and say so. | M: In Spanish they stay English for now. Translations wait until the content settles.',
    says: [['lang.zh', 'zh_CN', 'Mandarin'], ['lang.de', 'de_DE', 'German'], ['lang.es_topic', 'en_US', 'In Spanish they stay English'], ['lang.es_own', 'Y', 'the tab\'s own text']] },
  { id: 'tenant', text: 'F: Can a company write its own? | M: Yes, in the same Context Help window. Their own text wins, and shows at once. | M: The original stays untouched underneath.',
    says: [['tenant.client', '11', 'Their own text'], ['tenant.shown', 'Y', 'shows at once'], ['tenant.system', '1635', 'The original stays untouched']] },
  { id: 'legacy', text: 'F: And in real iDempiere? | M: The same topics, as one migration script for legacy sites. | M: Only rows in its own tables. No code, no new columns. | M: Its own panel now shows the tab\'s own words, then the steps. | M: Applied twice, nothing changes. And a site\'s own help is never replaced.',
    says: [['legacy.shown', 'Y', 'Its own panel now shows'], ['legacy.l3', 'PASS', 'Applied twice, nothing changes'], ['legacy.l5', 'PASS', 'a site\'s own help is never replaced'], ['legacy.back', 'true', '(not voiced: the pilot restored)']] },
  { id: 'close', hold: 16 }
];
exports.lang = 'en';
exports.beats = EN;
exports.en = EN;
exports.saidEnglish = EN.map((b) => b.text || '').join(' ');
