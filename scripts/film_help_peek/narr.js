// ⚠ DO NOT REMOVE — film v3 "Help that checks before you complete" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.22; storyboard OK'd by the owner 2026-11-25; adapted from film_ctxhelp_derived/narr.js), ENGLISH voice, English subtitles.
//   The beats, their narration (F asks, M answers; short: the picture explains) and the facts each beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses];
//   guard.js resolves every key from out/facts.json (shots.js, facts.js), out/legacy.json (legacy_shot.js) and the witness logs run on the same main tree, and FAILS the build if one is not as stated.
//   LANGUAGE RULE (owner 2026-11-24, "State principles and abstract terms before giving concrete examples. Spare the technicalities"; "Script need not say about a good guide, but about what a newbie needs"):
//   each beat opens with what a newcomer needs, in plain words; no internal terms (no DocAction, tick, table names, § lines) in the spoken text. The workings go to the report card and the last card.
//   Figures are spelled in words for the voice. READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.5 },
  { id: 'card', hold: 11, text: 'M: Before you press Complete on a document, you need to know what must be in place. Today iDempiere ships one help topic, and tells you what is wrong only after you press, one reason at a time. We added a topic for every core window. And Kernel ERP checks your document before you press, marks the field, and fixes it in one click.',
    says: [['legacy.helps', '1', 'one help topic'], ['now.one_each', 'Y', 'one reason at a time'], ['core.windows', 'Y', 'a topic for every core window'], ['fix.one_click', 'Y', 'fixes it in one click']] },
  { id: 'now', text: 'F: I filled in an order. Why will it not go through? | M: Press Complete, and iDempiere gives you one reason: the period is closed.',
    says: [['now.one_each', 'Y', 'one reason: the period is closed']] },
  { id: 'fixdate', text: 'F: So I change the date. | M: Press Complete again, and now the customer is over the credit hold. | F: Why did it not say both? | M: It checks one thing at a time, and only after you press.',
    says: [['now.second_other', 'Y', 'now the customer is over the credit hold'], ['now.one_each', 'Y', 'one thing at a time'], ['now.after_press', 'Y', 'only after you press']] },
  { id: 'ours', text: 'F: And with the help switched on? | M: Before anyone presses anything, the help door shows a two: two things to fix. | M: Open it, and it lists both, in the order iDempiere would stop, and marks the two fields. | M: It tried Complete for you, and kept nothing.',
    says: [['ours.count', '2', 'a two: two things to fix'], ['ours.legacy_order', 'Y', 'in the order iDempiere would stop'], ['ours.both_marked', 'Y', 'lists both ... marks the two fields'], ['ours.nothing_kept', 'Y', 'kept nothing']] },
  { id: 'fix', text: 'F: Can it fix them? | M: One click on Fix sets the date to today, and the list drops to one. | M: Undo Changes takes it back. | M: And the credit line has an Open link, which takes you to the customer.',
    says: [['fix.one_click', 'Y', 'the date to today, and the list drops to one'], ['fix.undo', 'Y', 'Undo Changes takes it back'], ['fix.open', 'Y', 'takes you to the customer']] },
  { id: 'done', text: 'F: And then? | M: Save, and the door follows: one thing left. | M: The person releases the hold in the Business Partner window, and the door goes quiet. | M: Now Complete goes through.',
    says: [['done.count_after_save', '1', 'one thing left'], ['done.released', 'Y', 'releases the hold'], ['done.completed', 'Y', 'Complete goes through']] },
  { id: 'windows', text: 'F: Is this only for orders? | M: No. Every window has its help: what you need to have ready, how to fill it, what Complete does, and what can stop it. | M: Shipment, and Purchase Order. | M: The last line opens the same section of the guide online.',
    says: [['help.windows', 'Y', 'Every window has its help'], ['help.ship_po', 'Y', 'Shipment, and Purchase Order'], ['help.guide_live', 'Y', 'opens the same section of the guide online']] },
  { id: 'ask', text: 'F: What if I only know the question? | M: Type it in plain words, and the help answers with the window, and the action: Close.',
    says: [['ask.answer', 'Y', 'the window, and the action: Close']] },
  { id: 'legacy', text: 'F: And in real iDempiere? | M: The same help, as one script for legacy sites. Ordinary rows in its own help records, no code, and no new columns. | M: Here is real iDempiere\'s own panel on a purchase order: the tab\'s own words, then ours. | M: Afterwards we took our rows out again, and the pilot is as it was.',
    says: [['legacy.one_script', 'Y', 'one script'], ['legacy.nocode', 'Y', 'no code, and no new columns'], ['legacy.shown', 'Y', 'the tab\'s own words, then ours'], ['legacy.back', 'true', 'the pilot is as it was']] },
  { id: 'admin', hold: 9 },
  { id: 'close', hold: 22, text: 'M: A document tells you what must be in place before you act, and what the action will do. | M: That is the help, and it is open to every iDempiere user. | M: The prior art, the credits and the technical rows are on this card.',
    says: [] }
];
exports.lang = 'en';
exports.beats = EN;
exports.en = EN;
exports.saidEnglish = EN.map((b) => b.text || '').join(' ');
