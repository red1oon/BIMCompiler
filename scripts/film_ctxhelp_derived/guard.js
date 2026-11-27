// ⚠ DO NOT REMOVE — film "Read from legacy's own code" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.20; adapted from film_ctxhelp_cms/guard.js): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources
//   (out/facts.json: the twin page's DOM and § log, the commands run for real, the witness logs on the same main tree, legacy_rules.json; out/legacy.json: beat 8's run on the pilot) and FAILS if one is not as stated,
//   if a picture is missing or does not hold what it must show, if the page logged an error, if the pilot was not restored, if a number word is spoken that no fact covers, or if the narration says something the
//   pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js'), OUT = path.join(__dirname, process.env.OUTD || 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), g = (s, re) => ((re.exec(s || '') || [])[1] || null), Lg = F.legacy || {}, Y = (b) => (b ? 'Y' : 'N');
const QUOTE = 'Business Partner with this Order over Credit Hold', so = F.so.p, po = F.po.p, bp = F.bp.p, sh = F.ship.p, td = F.term.tick.d, rd = F.term.ref.d, ef = F.rules.effect;
const facts = {
  'legacy.helps': String(Lg.before && Lg.before.helps), 'twin.records': F.ctxwin.records === F.ctxwin.rows && F.ctxwin.records === (Lg.applied || {}).helps ? String(F.ctxwin.records) : 'N', 'core.windows': F.derived.windows === F.derived.of ? String(F.derived.windows) : 'N',
  'so.tab': g(F.so.line, / id=(\d+)/), 'so.before_each_linked': Y(so.beforeItems.length > 0 && so.beforeLinks.length === so.beforeItems.length), 'so.sections': Y([/Before you start\./, /Do it\./, /What Complete does\./, /When it refuses/].every((re) => re.test(so.all))),
  'who.line': F.term.sed.cmd === 'sed -n ' + ef.line + 'p MOrder.java' && F.term.sed.out.trim() === F.rules.srcLine && F.term.sed.out.indexOf(ef.token) >= 0 && F.rules.tokenHeld ? String(ef.line) : 'N', 'who.first_li': Y(so.complete.length > 0 && so.complete[0].text.indexOf(ef.text) >= 0),
  'who.build_fails': Y(F.rules.buildFailsDocumented && /FAIL/.test(F.red.verdict) && F.red.srcline.indexOf(ef.id) >= 0),
  'tick.verdict': td.verdict, 'tick.legacy': String((td.legacy || {}).shipments_completed), 'tick.sqlite': String((td.sqlite || {}).shipments_completed),
  'refuse.quote_panel': Y(so.refuse.indexOf('“' + QUOTE + '”') >= 0), 'refuse.quote_run': Y(((rd.legacy || {}).reason || '').indexOf(QUOTE) >= 0 && rd.verdict === 'MATCH'), 'refuse.tick': Y(so.refuse.indexOf('“' + QUOTE + '” ✓') >= 0),
  'po.ticks': String(po.ticks), 'po.tick_is_po': Y(po.complete.filter((x) => x.tick).every((x) => /^Purchase Order/.test(x.text)) && po.ticks > 0), 'po.fewer': Y(po.ticks < so.ticks),
  'bp.needed': Y(bp.neededLinks.length > 0 && /Shipment \(Customer\)/.test(bp.needed || '')), 'click.window': F.click.viaMenu ? 'menu' : g(F.click.line, / window=(\d+) /), 'ship.more': F.ship.more && F.ship.more.file === 'MInOut.java' ? String(F.ship.more.n) : 'N',
  'legacy.added': String((Lg.applied || {}).helps - (Lg.before || {}).helps) === String((Lg.applied || {}).tabLinks + (Lg.applied || {}).procLinks) ? String((Lg.applied || {}).helps - (Lg.before || {}).helps) : 'N',
  'legacy.nocode': Y(F.script.ddl === 0 && F.script.tables.every((t) => /^AD_(CTXHELP|CTXHELPMSG|CTXHELPMSG_TRL|TAB|PROCESS)$/.test(t))), 'legacy.shown': Y(Lg.zk && Lg.zk.hasOwn && Lg.zk.hasOurs), 'legacy.back': String(Lg.back),
  'effects.n': String(F.rules.effects), 'ticks.n': F.derived.flipped === 0 ? String(F.derived.ticks) : 'N' };
let bad = 0; const L = (m) => console.log('§FILM_GUARD ' + m);
N.beats.forEach((b) => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
// every spoken number word is covered by a `says` entry of the same beat
const NUM = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|first|second|third)\b/gi;
N.beats.forEach((b) => { if (!b.text) return; const covered = (b.says || []).map((s) => s[2].toLowerCase()); const loose = [];
  b.text.split(' | ').forEach((turn) => { let m; const t = turn.replace(/^[FM]: /, ''); NUM.lastIndex = 0; while ((m = NUM.exec(t))) { const w = m[1].toLowerCase(); if (!covered.some((c) => c.indexOf(w) >= 0)) loose.push(w); } });
  if (loose.length) bad++; L((loose.length ? 'FAIL ' : 'OK   ') + b.id + ' number words all covered by a fact' + (loose.length ? ': uncovered ' + loose.join(',') : '')); });
const stills = ['ctxwin', 'so_a', 'so_b', 'so_c', 'po_b', 'bp_n', 'ship_b', 'ship_c'], zs = (Lg.zk && Lg.zk.shots) || {};
const must = [['no page error in the twin session', (F.errors || []).length === 0], ['every twin picture exists and holds the elements it must show (inside its crop window)', stills.every((n) => F.shots[n] && fs.existsSync(path.join(OUT, F.shots[n].file)) && (n === 'ctxwin' || F.shots[n].inside))],
  ['beat 8: legacy\'s three stills exist and hold what they must show', ['top', 'complete', 'tail'].every((k) => zs[k] && zs[k].inside && fs.existsSync(path.join(OUT, zs[k].file)))],
  ['beat 8: the pilot was restored to its snapshot (legacy_shot) and its tables say 1 / 0 / 0 (pilot_witness)', Lg.back === true && /PASS 1\/0\/0/.test(F.pilot.verdict)], ['the L&F parity witness on the pilot passes', /PASS fails=0 inconclusive=0/.test(F.lf.verdict)],
  ['W-CTXHELP-DERIVED passes 8/0 on the same tree and its red run (DV_BREAK=srcline) FAILS', /PASS pass=8 fail=0 inconclusive=0/.test(F.derived.verdict) && /FAIL pass=7 fail=1/.test(F.red.verdict)],
  ['a ✓ needs a MATCH: with every verdict flipped the text has 0 ✓ (D3), with the real facts ' + F.derived.ticks, F.derived.flipped === 0 && F.derived.ticks > 0],
  ['the twin\'s Context Help Records = legacy\'s AD_CtxHelp after the apply (131 = 1 + 130)', F.ctxwin.records === (Lg.applied || {}).helps], ['the guide link: the guides do NOT describe this panel yet (gap named, no guide link on the card)', F.guide.gap === true],
  ['credentials: MIT, every PR the card names merged', F.credentials.licence === 'MIT License' && F.credentials.prs.every((x) => x.state === 'MERGED')]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
const said = N.saidEnglish;
[[/\blive\b|real.?time/i, 'the pictures are taken, not streamed'], [/faster|speed|seconds/i, 'no speed was measured'], [/every language|all languages|French|Japanese|Mandarin|German|Spanish|Chinese|translated/i, 'no language was shown; translations are named only as not built'],
 [/reviewed|native/i, 'nothing was reviewed by a native speaker or a person'], [/RUN_SyncDB|RUN SyncDB/i, 'beat 8 applied the script with psql, not through RUN_SyncDB'], [/\bnow shows\b|\bfresh\b|just now/i, 'legacy\'s panel may be served from its cache (§LEGACY_CACHE), so no "fresh" claim'],
 [/\bAI\b|A I\b|artificial/i, 'no claim about AI']].forEach(([re, why]) => { const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
