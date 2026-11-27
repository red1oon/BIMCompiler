// ⚠ DO NOT REMOVE — film "When AI Dies": every on-screen sentence of the cards (not the code, the log lines or the real editor's own text), one table per language. t(key, vars) THROWS on a missing key or an unfilled {var}:
// a cut can never silently show English. Code, § lines, file names, key names and proper names are not in this table: they are shown as the evidence has them (guard.js checks that no other English is left on a translated card).
'use strict';
const EN = {
  'cover.kicker': 'WHEN AI DIES', 'cover.t1': 'Your vibe-coding days may be over', 'cover.t2': 'unless your editor knows your code', 'cover.line': 'No assistant in this film: the real VS Code, its AI features switched off, and the real bim-ootb code',
  'cmd.before': '# the assistant is gone. ask the editor instead.', 'cmd.q1': '# where is APP.db used?', 'cmd.q2': '# what runs when I change this field?', 'cmd.q3': '# what did this line print last time?', 'cmd.q4': 'Date.now()', 'cmd.q5': '# done. bump it.', 'cmd.passenger': '# the AI is back. give it facts, not guesses.',
  'bar.top': 'the typed line and what the editor answered', 'bar.bottom': 'the real VS Code, AI features off', 'bar.erp': 'the real ERP page, the dev hover loaded by a bookmarklet',
  'st.before': 'the profile\'s own settings.json', 'st.q1': 'Shift+F12: the references panel', 'st.q2a': 'hover a field of the Sales Order window', 'st.q2b': 'Alt+1: the editor opens the line it names', 'st.q3': 'hover the tag: the last value, its log, its commit',
  'st.q4': 'a clock call in a core file: the underline and its hover', 'st.q5a': 'a file changed: the Bump button waits', 'st.q5b': 'Bump: checking in the background', 'st.q5c': 'Bump ✓: the checks passed; a second press writes', 'st.q5d': 'written: the cache version is up',
  'st.passenger': 'Context for this file, opened beside the code',
  'a.before.set': 'read from VS Code: chat.disableAIFeatures = {v}', 'a.before.ext': 'extensions that are not built in: {n}',
  'a.q1.key': 'Shift+F12  ->  {places} places in {files} files', 'a.q1.def': 'the editor\'s own JavaScript support: {n} other definitions',
  'a.q2.hover': 'hover {field}  ->  {layers} layers, in the order they fire', 'a.q2.key': '{key} opens {at}',
  'a.q3.val': 'last value, from a saved log, proven current', 'a.q3.src': 'the log and the commit it came from',
  'a.q4.warn': '{file}:{line}  warning {code}', 'a.q4.why': 'the reason, and what to call instead, are in the hover below',
  'a.q5.idle': 'press Bump when the feature is complete', 'a.q5.chk': 'checking in the background: you can keep working', 'a.q5.ready': 'the real check passed; nothing is written yet',
  'a.pass.cmd': 'X0 Navigator: Context for this file', 'a.pass.res': '{n} lines copied for an assistant, and opened beside the code', 'a.pass.note': 'X0 calls no model: you paste the block where you like',
  'why.h1': 'It cannot drift: X0 holds no knowledge of your code', 'why.sub': 'It reads what the repo itself generates and checks, and says so when it does not know.',
  'why.proof': 'The honest proof: we did not cut the network, we listed the doors in its code', 'why.und': 'code-understanding features', 'why.ship': 'Run and Ship features (they talk to GitHub, as the guide says)',
  'why.doors': '{n} doors', 'why.red': 'red control: a fetch() planted in a copy of the tag hover was counted', 'why.setting': 'and the profile\'s own setting', 'why.iso': 'nothing reaches the browser, no dependencies',
  'rm.kicker': 'NOT BUILT YET', 'rm.title': 'What is only designed', 'rm.foot': 'The film shows only what is built and merged. Designed in prompts/CODE_ARCHITECTURE_DESIGN.md, parts B to E.',
  'rm.B1': 'the Modeller\'s module manifest (next: its build spec is written; B0, the check, is built)', 'rm.C': 'named parts of the shared object, each with one owner', 'rm.D': 'an owner table: which file answers which question', 'rm.E': 'a proof map: which test proves which rule',
  'cl.h1a': 'What we learned,', 'cl.h1b': 'who stands behind it', 'cl.col1': 'prior art: the lesson', 'cl.col2': 'credentials', 'cl.col3': 'read more',
  'cl.pr': 'Merged in bim-ootb: {list}', 'cl.wit': 'Witnessed in this build', 'cl.limit': 'Limits, said plainly', 'cl.limit1': 'the legacy-parity bridge row of the Bump witness was skipped here (it writes to a test server)', 'cl.limit2': 'the check of the network doors reads the code; it is not a network cut',
  'cl.guide': 'Developer Guide, X0 Navigator (English)', 'cl.guide2': 'the guide is in English', 'cl.keys': 'Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real VS Code and the real ERP page, on the CPU, no GPU',
  'pr.2985': 'references', 'pr.3055': 'ERP hover', 'pr.2970': 'tag hover value', 'pr.3209': 'core purity', 'pr.3162': 'Bump', 'pr.2966': 'context',
  'cl.tr': ''
};
const PA = require('./priorart.json'); PA.items.forEach((it, k) => { EN['pa.' + k + '.does'] = it.does; EN['pa.' + k + '.took'] = it.took; });
Object.assign(EN, { 'feat.references': 'references', 'feat.field_hover_and_f12': 'field hover and F12', 'feat.tag_hover': 'tag hover', 'feat.value_beside_the_code': 'value beside the code', 'feat.purity_warning': 'purity warning', 'feat.context_for_a_file': 'context for a file', 'feat.fetch_back': 'Fetch back', 'feat.deploy_main_now': 'Deploy main now', 'feat.memory_of_the_pages': 'memory of the pages' });
module.exports = { en: EN };
const lang = process.env.FILM_LANG || 'en';
try { Object.assign(module.exports, require('./i18n_' + lang + '.js')); } catch (e) { if (lang !== 'en') throw e; }
module.exports.t = (k, vars) => { const T = module.exports[lang]; if (!(k in T)) throw new Error('i18n: no ' + lang + ' text for ' + k); return T[k].replace(/\{(\w+)\}/g, (m, x) => { if (!vars || !(x in vars)) throw new Error('i18n: ' + k + ' needs {' + x + '}'); return vars[x]; }); };
module.exports.lang = lang;
