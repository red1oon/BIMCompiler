// ⚠ DO NOT REMOVE — film "Information is Free" (prompts/FILM_INFORMATION_IS_FREE.md §3, CH 0): the beats and their narration (F asks, M answers, one or two plain sentences each: the picture does the explaining).
// Numbers are spelled in words for the voice; guard.js checks each `says` entry against out/facts.json (re-measured every build) and that nothing on the not-said list is spoken. READ out/guard.log.
// The claim "no other project is more open" is said AS A CLAIM ("We know of no other project that gives out more"): it cannot be measured, so it is never said as a fact.
'use strict';
const EN = [
  { id: 'cover', hold: 3.6 },
  { id: 'clone', text: 'F: Is this the whole project? | M: All of it. In the open, and M I T licensed.', says: [['bc.license', 'MIT License', 'm i t']] },
  { id: 'prompts', text: 'F: Even the prompts? | M: Three hundred sixty-nine specs and prompts here, and seventy more in the second repository. How it was built, not just what. | F: Does anyone give more? | M: We know of no other project that gives out more: not only the code, but the specs, the prompts that built it, and the checks that prove it.', says: [['bc.prompts', '369', 'three hundred sixty-nine'], ['oo.prompts', '70', 'seventy more']] },
  { id: 'docs', text: 'F: Is there help for newcomers? | M: Guides, written for people. Three hundred twenty-three pages in the docs.', says: [['bc.docsMd', '323', 'three hundred twenty-three']] },
  { id: 'fsg', text: 'F: Only in English? | M: No. The command line guide comes in six more languages: Spanish, French, German, Indonesian, Japanese and Chinese. Here it is in Spanish, in Japanese, in German.', says: [['bc.guideLanguagesBesidesEnglish', '6', 'six more languages']] },
  { id: 'login', text: 'F: And the product itself? | M: The same openness. Here is its login screen, in four languages.', says: [] },
  { id: 'license', text: 'F: Can I use it? | M: Read it, copy it, build on it. It is M I T licensed.', says: [['bc.license', 'MIT License', 'm i t']] },
  { id: 'mantra', hold: 6.0 },
  { id: 'credits', hold: 7.0, text: 'M: That is the project. The links are on this card.', says: [] }   // the spec's credits card is silent; this one short line is a deviation so that the longest silence stays near seven seconds (reported in the build result)
];
exports.lang = 'en';
exports.beats = EN;
