// ⚠ DO NOT REMOVE — film "Help that answers" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources (out/facts.json from the real
// page and GitHub, the witness logs run on the same main tree, the saved prior-art copies) and FAILS if one is not as stated, if a picture is missing, if the page logged an error, if a prior-art row's text
// is not found where it says (check P), or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), N = require('./narr.js'), OUT = path.join(__dirname, 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const W1 = fs.readFileSync(path.join(OUT, 'witness_field_help_main.log'), 'utf8'), W2 = fs.readFileSync(path.join(OUT, 'witness_help_showcase_main.log'), 'utf8');
const g = (s, re) => ((re.exec(s || '') || [])[1] || null);
const f4 = /F4 description = AD_Field_v\.description\s+(\d+)\/(\d+)/.exec(W1), s5 = /S5 every how-to row[^\n]*?(\d+\/\d+)/.exec(W2);
const enP = (F.field && F.field.panel || '').split('\n').filter(Boolean), deP = (F.de.field && F.de.field.panel || '').split('\n').filter(Boolean);
const page = fs.readFileSync(path.join(OUT, 'prior', 'mckinsey_the_social_economy.html'), 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const facts = {
  'quote.found': F.quote && page.indexOf(F.quote.text) >= 0 && F.quote.text.indexOf('nearly 20 percent') >= 0 ? 'Y' : 'N', 'quote.source': F.quote && /^McKinsey Global Institute/.test(F.quote.who) ? 'McKinsey Global Institute' : 'N',
  'old.tooltip': /^v\.title = f\.columnName \+ ' · ' \+ f\.referenceType;$/.test(F.oldTooltip.text || '') ? 'Y' : 'N',
  'f4.n': f4 && f4[1] === f4[2] ? f4[1] : 'N', 'field.panel': enP.length >= 3 && enP[0] === 'Document No' && enP[1] === F.docNoEnglish ? 'Y' : 'N',
  'ask1.window': g(F.ask1.line, / window=(\d+)/), 'ask1.action': g(F.ask1.line, / action=(\w+)/), 'ask1.allowed': g(F.ask1.card, /Allowed when the document is: ([^\n]+)/), 'ask1.cli': g(F.ask1.line, / cli="([^"]+)"/),
  's5': s5 ? s5[1] : 'N', 'link.opened': g(F.link.opened, /\((\d+)\)/), 'link.ctx': /§HELP_CTX window=143 howto=\d+/.test(F.link.ctx || '') ? 'Y' : 'N',
  'ask2.window': g(F.ask2.line, / window=(\d+)/), 'ask2.action': g(F.ask2.line, / action=(\w+)/), 'ask2.cli_note': /erp\.void is offered for Order \(C_Order\), not for Payment/.test(F.ask2.line || '') ? 'Y' : 'N',
  'de.fields': g(F.de.pack, /fields=(\d+)/), 'de.desc_german': deP.length >= 3 && deP[1] !== F.docNoEnglish && deP[1] !== enP[1] ? 'Y' : 'N', 'de.help_english': deP.length >= 3 && deP.slice(2).join('\n') === enP.slice(2).join('\n') ? 'Y' : 'N' };
let bad = 0; const L = (m) => console.log('§FILM_GUARD ' + m);
N.beats.forEach((b) => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const must = [
  ['no page error in the session', (F.errors || []).length === 0],
  ['every picture the cards need exists', ['idle', 'ask_close', 'link_open', 'field_en', 'ask_void', 'field_de'].every((n) => F.shots[n] && fs.existsSync(path.join(OUT, F.shots[n].file)))],
  ['the memory was measured after a forced GC in both sessions, the pack present in one only', F.memory.withPack.gc && F.memory.without.gc && F.memory.withPack.pack === true && F.memory.without.pack === false],
  ['credentials: MIT, both PRs merged, the paper states its priority date', F.credentials.licence === 'MIT License' && /^MERGED/.test(F.credentials.pr3126) && /^MERGED/.test(F.credentials.pr3128) && /^\d{4}-\d\d-\d\d$/.test(F.credentials.paperPriority || '')],
  ['the verdicts on the card are PASS lines of the logs run on the same tree', /PASS$/.test(F.verdicts.fieldHelp) && /PASS$/.test(F.verdicts.showcase)],
  ['the German line shown is the pack\'s text for that field (S2 passed on main)', /✅ S2 de_DE Tool Tip panel/.test(W2)]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
// P prior art: a repo row = the text ON the cited line (idempiere: the local legacy source on disk; bim-ootb: origin/main); a web row = the text inside the copy saved in out/prior/ (tags stripped)
const PA = require('./priorart.json');
const readWhere = (w) => { try {
  if (w.saved) { let s = fs.readFileSync(path.join(__dirname, w.saved), 'utf8'); if (/\.html?$/.test(w.saved)) s = s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' '); return s; }
  if (w.repo === 'idempiere') return fs.readFileSync(path.join(os.homedir(), 'idempiere-dev-setup', 'idempiere', w.path), 'utf8').split('\n')[w.line - 1];
  return cp.execFileSync('git', ['-C', path.join(os.homedir(), 'bim-ootb'), 'show', 'origin/main:' + w.path], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n')[w.line - 1]; } catch (e) { return null; } };
PA.items.forEach((it) => { const t = readWhere(it.where), ok = t != null && t.indexOf(it.where.text) >= 0; if (!ok) bad++;
  L((ok ? 'OK   ' : 'FAIL ') + 'prior art "' + it.name + '" <- ' + (it.where.saved || it.where.repo + ':' + it.where.path + ':' + it.where.line) + (ok ? '' : ' text not found: ' + it.where.text)); });
// not-said: the film must not claim what the pictures do not show
const said = N.beats.map((b) => b.text || '').join(' ');
[[/\blive\b|real.?time/i, 'the page pictures are taken, not streamed'], [/faster|speed/i, 'no speed was measured'], [/every language|all languages|Japanese|French|Chinese/i, 'only German is shown'], [/\bfirst\b|novel|unique/i, 'no priority is claimed']].forEach(([re, why]) => {
  const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
