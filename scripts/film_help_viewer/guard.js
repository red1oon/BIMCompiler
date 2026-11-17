// ⚠ DO NOT REMOVE — film "Help that answers, in the Viewer" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §17.1): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources
// (out/facts.json from the real page, red1 and GitHub; the witness logs run on the same tree; the saved bSDD copies) and FAILS if one is not as stated, if a picture is missing, if the page logged an
// error, if a prior-art row's text is not found where it says (check P), or if the narration says what the pictures do not show (not-said list). Has its own red control (a planted wrong value must
// fail). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), N = require('./narr.js'), OUT = path.join(__dirname, process.env.OUTD || 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const W = { cls: fs.readFileSync(path.join(OUT, 'witness_class_help_main.log'), 'utf8') };
const bs = (lang) => JSON.parse(fs.readFileSync(path.join(OUT, 'prior', 'bsdd_IfcWall_' + lang + '.json'), 'utf8')).definition || '';
const EN = bs('EN'), DE = bs('de-DE'), ZHd = bs('zh-CN'), head = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 60);
const has = (s, part) => !!s && !!part && String(s).replace(/\s+/g, ' ').indexOf(head(part)) >= 0;
const g = (s, re) => ((re.exec(s || '') || [])[1] || null);
const en = F.en && F.en.block || {}, de = F.de_DE && F.de_DE.block || {}, zh = F.zh_CN && F.zh_CN.block || {};
const holders = (F.word && F.word.holders || []), openOf = (h) => (F.found || []).some((r) => r.open && r.name.indexOf(h.name) === 0);
const close1 = (a, b) => !!a && !!b && Math.abs(a.l - b.l) <= 1 && Math.abs(a.t - b.t) <= 1;
function facts(F) { return {
  'quote.found': F.quote && /easy to search and focused on the user's task/.test(F.quote.text) ? 'Y' : 'N', 'quote.source': F.quote && /^Jakob Nielsen · Nielsen Norman Group$/.test(F.quote.who) ? F.quote.who : 'N',
  'quote.h10': F.quote && /heuristic 10, Help and Documentation/.test(F.quote.title) ? 'Y' : 'N', 'quote.steps': F.quote && /Keep it concise, and list concrete steps/.test(F.quote.text) ? 'Y' : 'N',
  'klass.class': F.en && F.en.picked.i >= 0 && /class=IfcWall ours=Y ifc=Y/.test(F.lines.classEn || '') ? 'IfcWall' : 'N',
  'klass.ours': en.ours && en.ours.length > 20 ? 'Y' : 'N', 'klass.ifc': has(en.ifc, EN) ? 'Y' : 'N', 'w.c2': /PASS C2 verbatim/.test(W.cls) ? 'Y' : 'N',
  'klass.credit': /buildingSMART/.test(en.credit || '') ? 'Y' : 'N',
  'de.bsdd': has(de.ifc, DE) && DE !== EN && !de.fallback ? 'Y' : 'N',
  'zh.ours': /[一-鿿]/.test(zh.ours || '') ? 'Y' : 'N', 'zh.nobsdd': head(ZHd) === head(EN) ? 'Y' : 'N', 'zh.fallback': !!zh.fallback && has(zh.ifc, EN) ? 'Y' : 'N',
  'dock.left': +g(F.lines.dockOpen, /left=(\d+)/) <= 40 ? 'Y' : 'N', 'word.inName': F.word && F.word.inName ? 'Y' : 'N',
  'found.names': holders.map((h) => h.name).join(' + ') || 'N', 'found.why': holders.length && holders.every((h) => /native/i.test(h.bullet || '')) ? 'Y' : 'N', 'found.open': holders.length && holders.every(openOf) ? 'Y' : 'N',
  'found.only': (F.found || []).length === holders.length ? 'Y' : 'N',   // the rows shown are exactly the entries that hold the word
  'find.guide': F.find && F.find.open && /^https:\/\/red1oon\.github\.io\/BIMCompiler\/BIMUserGuide\/#/.test(F.find.guide || '') ? 'Y' : 'N',
  'find.cli': F.find && F.howtoCliFind[0] && F.find.cli[0] === F.howtoCliFind[0].line ? F.find.cli[0] : 'N',
  'cli.status': F.cli.status, 'cli.total': String(F.cli.total), 'cli.same': /the same answer the Viewer's Find panel gives/.test((F.howtoCliFind[0] || {}).cite || '') ? 'Y' : 'N',
  'dock.saved': !!F.lines.dragSave && F.dock.moved.l - F.dock.before.l > 150 ? 'Y' : 'N', 'dock.same': close1(F.dock.reopened, F.dock.moved) && !!F.lines.restore ? 'Y' : 'N', 'dock.keptOpen': F.dock.keptOpen ? 'Y' : 'N' }; }
let bad = 0; const L = (m) => console.log('§FILM_GUARD ' + m), FX = facts(F);
N.beats.forEach((b) => (b.says || []).forEach(([k, want, word]) => { const got = FX[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
// red control: the same resolver on a copy with the count changed by one must disagree with the voice
const G = JSON.parse(JSON.stringify(F)); G.cli.total = F.cli.total + 1; const red = String(facts(G)['cli.total']) !== '1193';
L((red ? 'OK   ' : 'FAIL ') + 'red control: a planted count ' + G.cli.total + ' is caught'); if (!red) bad++;
const must = [
  ['no page error in any session', (F.errors || []).length === 0],
  ['the Find panel (measured at the shot, after the class text opened) covers neither the class text nor, in the help stills, the help panel', ['klass_en', 'klass_de_DE', 'klass_zh_CN'].every((n) => { const r = F.shots[n].rects, a = r['#find-panel'], c = r['#info-class-help']; return a && c && !(a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h); })],
  ['every picture the cards need exists', ['klass_en', 'klass_de_DE', 'klass_zh_CN', 'pal_open', 'pal_native', 'pal_find', 'dock_moved', 'dock_closed', 'dock_reopen'].every((n) => F.shots[n] && fs.existsSync(path.join(OUT, F.shots[n].file)))],
  ['the CLI line ran through red1 and answered ok', F.cli.exit === 0 && F.cli.status === 'ok' && /^§DOOR .*verb=viewer\.counts status=ok/.test(F.cli.door || '')],
  ['the typed lines are the ones the beats name', (N.beats.find((b) => b.id === 'ask') || {}).typed === F.word.w && (N.beats.find((b) => b.id === 'cli') || {}).typed === F.cli.line],
  ['credentials: MIT, every PR the film shows merged, the paper states its priority date', F.credentials.licence === 'MIT License' && F.credentials.prs.length >= 2 && F.credentials.prs.every((x) => /^MERGED/.test(x.state)) && /^\d{4}-\d\d-\d\d$/.test(F.credentials.paperPriority || '')],
  ['the verdicts on the card are PASS lines of logs run on the same tree as the pictures', ['classHelp', 'howto', 'dock'].every((k) => /PASS$/.test(F.verdicts[k])) && F.verdictTree === F.tree]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
// P prior art: a repo row = the text ON the cited line (the local legacy source); a saved row = the text inside the copy in out/prior/
const PA = require('./priorart.json');
const readWhere = (w) => { try { if (w.saved) return fs.readFileSync(path.join(OUT, w.saved), 'utf8'); if (w.repo === 'idempiere') return fs.readFileSync(path.join(os.homedir(), 'idempiere-dev-setup', 'idempiere', w.path), 'utf8').split('\n')[w.line - 1]; return null; } catch (e) { return null; } };
PA.items.forEach((it) => { const t = readWhere(it.where), ok = t != null && t.indexOf(it.where.text) >= 0; if (!ok) bad++;
  L((ok ? 'OK   ' : 'FAIL ') + 'prior art "' + it.name + '" <- ' + (it.where.saved || it.where.repo + ':' + it.where.path + ':' + it.where.line) + (ok ? '' : ' text not found: ' + it.where.text)); });
// not-said: the film must not claim what it does not show (§17 rules: no Modeller, no prefixes, no did-you-mean; only German and Chinese shown)
[[/\blive\b|real.?time/i, 'the pictures are taken, not streamed'], [/faster|speed/i, 'no speed was measured'], [/\bfirst\b|novel|unique/i, 'no priority is claimed'], [/modell?er/i, 'the Modeller help is not in this film'],
  [/prefix|did you mean|typo/i, 'prefixes and did-you-mean are not built'], [/French|Japanese|Spanish|Indonesian|every language|all languages/i, 'only German and Chinese are shown'], [/\bA ?I\b/, 'nothing is said about AI']]
  .forEach(([re, why]) => { const hit = re.test(N.saidEnglish); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
