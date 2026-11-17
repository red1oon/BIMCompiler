// ⚠ DO NOT REMOVE — film "Help that answers, in the Viewer" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §17.1), ENGLISH voice, English subtitles: the beats, their narration (F asks, M answers,
// short: the picture explains) and the facts each beat speaks. Each `says` entry is [fact key, expected value, the words the voice uses]; guard.js resolves every key from out/facts.json, the witness
// logs run on the same tree and the saved copies, and FAILS the build if one is not as stated. Figures are spelled in words for the voice. A beat with `typed` is typed in the top strip first (key
// sounds only), the voice starts after its return key (check K2). READ out/guard.log.
'use strict';
const EN = [
  { id: 'cover', hold: 4.5 },
  { id: 'quote', text: 'F: Does an app need help at all? | M: Jakob Nielsen\'s tenth usability heuristic is about exactly that. | M: Help should be easy to search, and focused on the user\'s task. | M: Short, with concrete steps.',
    says: [['quote.source', 'Jakob Nielsen · Nielsen Norman Group', 'Jakob Nielsen'], ['quote.h10', 'Y', 'tenth usability heuristic'], ['quote.found', 'Y', 'easy to search, and focused on the user\'s task'], ['quote.steps', 'Y', 'Short, with concrete steps']] },
  { id: 'klass', text: 'F: So, in the BIM Viewer: I click a wall. What is it? | M: The info panel now says so, in one plain sentence. | M: Under it, the official IFC definition from buildingSMART, word for word, with its credit.',
    says: [['klass.class', 'IfcWall', 'I click a wall'], ['klass.ours', 'Y', 'one plain sentence'], ['klass.ifc', 'Y', 'the official IFC definition from buildingSMART'], ['w.c2', 'Y', 'word for word'], ['klass.credit', 'Y', 'with its credit']] },
  { id: 'lang', text: 'F: And in my own language? | M: In German, buildingSMART publishes its own text, and that is what you get. | M: In Chinese, our sentence is Chinese. | M: buildingSMART has no Chinese text for a wall yet, so the panel shows the English, and says so.',
    says: [['de.bsdd', 'Y', 'buildingSMART publishes its own text'], ['zh.ours', 'Y', 'our sentence is Chinese'], ['zh.nobsdd', 'Y', 'no Chinese text for a wall yet'], ['zh.fallback', 'Y', 'shows the English, and says so']] },
  { id: 'ask', typed: 'native', text: 'F: Can I find a tool without knowing its name? | M: Press F one: the help opens on the left, and stays open. | M: Type any word from what you want to do. | M: It finds Save Building and Open Building: a step of each says native, and both open to show you.',
    says: [['dock.left', 'Y', 'opens on the left'], ['word.inName', 'N', 'without knowing its name'], ['found.names', 'Save Building + Open Building', 'It finds Save Building and Open Building'], ['found.why', 'Y', 'a step of each says native'], ['found.open', 'Y', 'both open to show you'], ['found.only', 'Y', 'It finds']] },
  { id: 'cli', typed: 'viewer.counts building=Duplex', text: 'F: And at the command line? | M: Open Find in the help: a link to its guide section, and the same question as a command. | M: Typed at the prompt, it counts this model: one thousand one hundred and ninety-three elements. | M: The same answer the Find panel gives.',
    says: [['find.guide', 'Y', 'a link to its guide section'], ['find.cli', 'viewer.counts building=<building>', 'the same question as a command'], ['cli.status', 'ok', 'it counts this model'], ['cli.total', '1193', 'one thousand one hundred and ninety-three'], ['cli.same', 'Y', 'The same answer the Find panel gives']] },
  { id: 'dock', text: 'F: Does it cover my model? | M: Drag it wherever you like. | M: Close it, open it again, and it comes back where you left it, still showing what you had open.',
    says: [['dock.saved', 'Y', 'Drag it wherever you like'], ['dock.same', 'Y', 'it comes back where you left it'], ['dock.keptOpen', 'Y', 'still showing what you had open']] },
  { id: 'close', hold: 18 }
];
exports.lang = 'en';
exports.beats = EN;
exports.saidEnglish = EN.map((b) => b.text || '').join(' ');
