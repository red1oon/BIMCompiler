// ⚠ DO NOT REMOVE — film "The container legacy gave us, filled" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.18): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources
//   (out/facts.json: the twin page, the red1 door, beat 7's legacy run, the witness logs run on the same main tree) and FAILS if one is not as stated, if a picture is missing, if the page logged an
//   error, or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js'), OUT = path.join(__dirname, process.env.OUTD || 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), g = (s, re) => ((re.exec(s || '') || [])[1] || null), Lg = F.legacy || {};
const facts = {
  'legacy.helps': String(Lg.before && Lg.before.helps), 'twin.records': String(F.ctxwin.records === F.ctxwin.rows ? F.ctxwin.records : 'N'), 'twin.window': g(F.ctxwin.window, /\((\d+)\)/),
  'so.shown': g(F.so.line, / shown=(\S+)/), 'line.tab': g(F.line.line, / type=T id=(\d+)/), 'line.shown': g(F.line.line, / shown=(\S+)/), 'tax.shown': g(F.tax.line, / shown=(\S+)/),
  'fit.max': g(F.lines.k6cut, /of max (\d+) chars/), 'more.heading': F.guide && F.more && F.guide.heading && F.more.text.replace(/ …$/, '') === F.guide.heading ? F.guide.heading : 'N',
  'ask.window': g(F.ask.line, / window=(\d+)/), 'ask.action': g(F.ask.line, / action=(\w+)/),
  'cli.window': F.cli && F.cli.window ? String(F.cli.window.id) : 'N', 'cli.action': F.cli ? String(F.cli.action) : 'N', 'cli.status': F.cli ? F.cli.status : 'N',
  'lang.zh': g((F.langs.zh_CN || {}).line, / lang=(\S+)/), 'lang.de': g((F.langs.de_DE || {}).line, / lang=(\S+)/), 'lang.es_topic': g((F.langs.es_ES || {}).line, / lang=(\S+)/),
  'lang.es_own': /^Orden\b/.test(((F.langs.es_ES || {}).panel || {}).ctx || '') ? 'Y' : 'N',
  'tenant.client': (F.tenant.rows || []).some((r) => Number(r.c) === 11) ? '11' : 'N', 'tenant.shown': (F.tenant.panel.ctx || '').indexOf(F.tenant.body) >= 0 && / howto=1000000 /.test(F.tenant.line || '') ? 'Y' : 'N',
  'tenant.system': String(((F.tenant.rows || []).find((r) => Number(r.c) === 0) || {}).n),
  'legacy.shown': Lg.zk && Lg.zk.hasOwn && Lg.zk.hasOurs ? 'Y' : 'N', 'legacy.l3': /^PASS L3 /.test(F.lines.legacyL3) ? 'PASS' : 'N', 'legacy.l5': /^PASS L5 /.test(F.lines.legacyL5) ? 'PASS' : 'N', 'legacy.back': String(Lg.back) };
let bad = 0; const L = (m) => console.log('§FILM_GUARD ' + m);
N.beats.forEach((b) => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const pics = ['ctxwin', 'so_header', 'so_line', 'so_tax', 'so_more', 'guide', 'ask', 'lang_zh_CN', 'lang_de_DE', 'lang_es_ES', 'tenant_shown'];
const must = [['no page error in the twin session', (F.errors || []).length === 0], ['every twin picture the cards need exists', pics.every((n) => F.shots[n] && fs.existsSync(path.join(OUT, F.shots[n].file)))],
  ['beat 7\'s legacy picture exists and the pilot was restored to its snapshot', fs.existsSync(path.join(OUT, 'pages', 'legacy_so.png')) && Lg.back === true],
  ['the verdicts on the card are PASS lines of logs run on the same tree', Object.values(F.verdicts).every((x) => /PASS$/.test(x))],
  ['credentials: MIT, every PR the card names merged', F.credentials.licence === 'MIT License' && F.credentials.prs.every((x) => x.state === 'MERGED')]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
const said = N.saidEnglish;
[[/\blive\b|real.?time/i, 'the pictures are taken, not streamed'], [/faster|speed|seconds/i, 'no speed was measured'], [/every language|all languages|French|Japanese/i, 'only Mandarin, German and Spanish were shown'],
 [/reviewed|native/i, 'no translation was reviewed by a native speaker'], [/RUN_SyncDB|RUN SyncDB/i, 'beat 7 applied the script with psql, not through RUN_SyncDB']].forEach(([re, why]) => { const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
