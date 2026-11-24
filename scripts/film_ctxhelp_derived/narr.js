// ⚠ DO NOT REMOVE — film "Read from legacy's own code" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.20, storyboard v2 OK'd by the owner 2026-11-24; adapted from film_ctxhelp_cms/narr.js), ENGLISH voice, English subtitles.
//   The beats, their narration (F asks, M answers; short: the picture explains) and the facts each beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses];
//   guard.js resolves every key from out/facts.json (shots.js, facts.js), out/legacy.json (legacy_shot.js) and the witness logs run on the same main tree, and FAILS the build if one is not as stated.
//   Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.5 },
  { id: 'before', text: 'F: What does legacy iDempiere ship in its Context Help? | M: One topic: the welcome page. | M: Here is the same window in our twin. One hundred and thirty-one topics. | F: All of them? | M: Every window of the trade cycle and the books: one hundred and twenty-four.',
    says: [['legacy.helps', '1', 'One topic'], ['twin.records', '131', 'One hundred and thirty-one topics'], ['core.windows', '124', 'one hundred and twenty-four']] },
  { id: 'so', text: 'F: Open a Sales Order. What does the panel say? | M: Before you start: what must exist beforehand, with a link to the window that makes each one. | M: Do it: the tabs to fill, then Complete. | M: What Complete does: a line for each kind of order. | M: And when it refuses: the messages legacy gives.',
    says: [['so.tab', '186', 'a Sales Order'], ['so.before_each_linked', 'Y', 'a link to the window that makes each one'], ['so.sections', 'Y', 'Do it ... What Complete does ... when it refuses']] },
  { id: 'who', text: 'F: Who wrote that first line? | M: Legacy did. Here is its own source: line two thousand one hundred seventy-eight of M Order. | M: We read its code and cite the line. If the line moves, the build fails.',
    says: [['who.line', '2178', 'line two thousand one hundred seventy-eight'], ['who.first_li', 'Y', 'that first line'], ['who.build_fails', 'Y', 'If the line moves, the build fails']] },
  { id: 'tick', text: 'F: And the tick? | M: A tick means real iDempiere did it in a recorded run, and our twin did the same. | M: Here legacy completed one shipment, and so did the twin.',
    says: [['tick.verdict', 'MATCH', 'and our twin did the same'], ['tick.legacy', '1', 'legacy completed one shipment'], ['tick.sqlite', '1', 'and so did the twin']] },
  { id: 'refuse', text: 'F: What does it say when legacy refuses? | M: Its own message, word for word. | M: A customer over the credit hold: Business Partner with this Order over Credit Hold. | M: It carries a tick, because a recorded run was refused with that very message.',
    says: [['refuse.quote_panel', 'Y', 'Business Partner with this Order over Credit Hold (panel)'], ['refuse.quote_run', 'Y', 'refused with that very message'], ['refuse.tick', 'Y', 'It carries a tick']] },
  { id: 'po', text: 'F: And a Purchase Order? | M: The same rules are listed, and one carries a tick: the purchase order itself. | F: Why fewer ticks? | M: A tick needs a run on that side.',
    says: [['po.ticks', '1', 'one carries a tick'], ['po.tick_is_po', 'Y', 'the purchase order itself'], ['po.fewer', 'Y', 'fewer ticks']] },
  { id: 'any', text: 'F: And a setup window, like Business Partner? | M: It lists the documents that ask for one. Click one, and you are there. | M: Shipment shows what Complete does, legacy\'s refusals, and says how many more are in the source file: nine more in M In Out.',
    says: [['bp.needed', 'Y', 'the documents that ask for one'], ['click.window', '169', 'Click one, and you are there'], ['ship.more', '9', 'nine more in M In Out']] },
  { id: 'legacy', text: 'F: And in real iDempiere? | M: The same topics, as a single migration script for legacy sites: one hundred and thirty topics. | M: Rows in its own tables. No code, no new columns. | M: Here is real iDempiere\'s own panel on a shipment: the tab\'s own words, then ours. | M: Afterwards we took our rows out again, and the pilot is as it was.',
    says: [['legacy.added', '130', 'one hundred and thirty topics'], ['legacy.nocode', 'Y', 'No code, no new columns'], ['legacy.shown', 'Y', 'the tab\'s own words, then ours'], ['legacy.back', 'true', 'the pilot is as it was']] },
  { id: 'close', hold: 20, text: 'M: Read from legacy\'s own code: one hundred and twenty-four windows, seventy-eight cited effects, twenty-five ticks. | M: Not built yet: ticks for the rest, translations of the new text, and the VS Code link, which is only an idea.',
    says: [['core.windows', '124', 'one hundred and twenty-four windows'], ['effects.n', '78', 'seventy-eight cited effects'], ['ticks.n', '25', 'twenty-five ticks']] }
];
exports.lang = 'en';
exports.beats = EN;
exports.en = EN;
exports.saidEnglish = EN.map((b) => b.text || '').join(' ');
