// ⚠ DO NOT REMOVE — film v3 "Help that checks before you complete" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.22; adapted from film_ctxhelp_derived/guard.js): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources
//   (out/facts.json: the twin page's DOM and § log, the witness logs on the same main tree; out/legacy.json: beat 8's run on the pilot) and FAILS if one is not as stated, if a picture is missing or does not
//   hold what it must show, if the page logged an error, if the pilot was not restored, if a number word is spoken that no fact covers, or if the narration says something the pictures do not show
//   (not-said list, which also holds the owner's language rule: no "refuses", no internal terms). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js'), OUT = path.join(__dirname, process.env.OUTD || 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), g = (s, re) => ((re.exec(s || '') || [])[1] || null), Lg = F.legacy || {}, Y = (b) => (b ? 'Y' : 'N');
const why = (l) => g(l, /why="([^"]*)"/), keyOf = (w) => g(w, /^@(\w+)@/), cnt = (l) => num(l, /count=(\d+)/), num = (s, re) => { const m = re.exec(s || ''); return m ? Number(m[1]) : null; };
const n = F.now, o = F.ours, ho = F.help, pk = (F.peek && F.peek.claims) || {}, pass = (c) => !!pk[c] && pk[c].v === 'PASS' && pk[c].judged > 0;
const needed = ['Before you start.', 'Do it.', 'What Complete does.', 'What can stop Complete:'], topicOk = (t) => !!t && needed.every((h) => t.bolds.indexOf(h) >= 0) && /^What can stop Complete/.test(t.stop || '');
const today = new Date().toLocaleDateString('sv');
const facts = {
  'legacy.helps': String(Lg.before && Lg.before.helps), 'core.windows': Y(F.derived.windows === F.derived.of && F.derived.windows > 0),
  'now.one_each': Y(why(n.ref1.line) === '@PeriodClosed@' && keyOf(why(n.ref2.line)) === 'BPartnerCreditHold' && n.ref1.chip === 'Drafted · DR' && n.ref2.chip === 'Drafted · DR'),
  'now.second_other': Y(keyOf(why(n.ref1.line)) === 'PeriodClosed' && keyOf(why(n.ref2.line)) === 'BPartnerCreditHold' && /dateordered/.test(n.fixed.save || '') && n.fixed.date === today),
  'now.after_press': Y(n.open.lens_buttons === 0 && n.open.peek_lines === 0 && !!n.ref1.line && !!n.ref1.toast && /^PROCESS/.test(n.ref1.toast)),
  'ours.count': cnt(o.bg) === 2 && o.badge === '2' ? '2' : 'N',
  'ours.legacy_order': Y(JSON.stringify(o.panel.keys) === JSON.stringify(['PeriodClosed', 'BPartnerCreditHold']) && pass('P3') && pass('P2')),
  'ours.both_marked': Y(o.panel.marked.some((m) => /^dateordered:PeriodClosed$/i.test(m)) && o.panel.marked.some((m) => /^c_bpartner_id:BPartnerCreditHold$/i.test(m)) && num(o.mark, /on_screen=(\d+)/) === 2),
  'ours.nothing_kept': Y(pass('P1') && pass('PP')),
  'fix.one_click': Y(/ok=true/.test(o.fix.set) && o.fix.before === '2026-10-15' && o.fix.after === today && /keys=\["BPartnerCreditHold"\]/.test(o.fix.repeek) && pass('PF2')),
  'fix.undo': Y(o.undo.form === o.fix.before && pass('PF3')), 'fix.open': Y(o.open.landed && pass('P6')),
  'done.count_after_save': cnt(o.saved.bg) === 1 && o.saved.badge === '1' && /dateordered/.test(o.saved.save || '') ? '1' : 'N',
  'done.released': Y(o.release.after === 'O' && /key=c_bpartner id=118/.test(o.release.save || '') && cnt(o.ready.bg) === 0 && o.ready.badge === null),
  'done.completed': Y(/^Completed/.test(o.complete.chip) && /ok=true status=CO/.test(o.complete.model) && /outcome=success/.test(o.complete.host) && !o.complete.refused),
  'help.windows': Y(topicOk(ho.ship.t) && topicOk(ho.po.t) && topicOk(ho.so.t) && F.derived.windows === F.derived.of), 'help.ship_po': Y(/id=257 /.test(ho.ship.line) && /id=294 /.test(ho.po.line)),
  'help.guide_live': Y(F.guide && F.guide.status === 200 && !!F.guide.anchor && F.guide.href === ho.so.t.guideHref && /#1-sales-order$/.test(F.guide.href) && /User Guide/.test(ho.so.t.guideText || '')),
  'ask.answer': Y(F.ask && F.ask.window && F.ask.window.name === 'Sales Order' && F.ask.action && F.ask.action.name === 'Close' && /close/i.test(F.ask.cli || '')),
  'legacy.one_script': Y(!!Lg.script && /ContextHelp\.sql$/.test(Lg.script)), 'legacy.nocode': Y(F.script.ddl === 0 && F.script.tables.every((t) => /^AD_(CTXHELP|CTXHELPMSG|CTXHELPMSG_TRL|TAB|PROCESS)$/.test(t))), 'legacy.shown': Y(Lg.zk && Lg.zk.hasOwn && Lg.zk.hasOurs), 'legacy.back': String(Lg.back) };
let bad = 0; const L = (m) => console.log('§FILM_GUARD ' + m);
N.beats.forEach((b) => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
// every spoken number word is covered by a `says` entry of the same beat
const NUM = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|first|second|third)\b/gi;
N.beats.forEach((b) => { if (!b.text) return; const covered = (b.says || []).map((s) => s[2].toLowerCase()); const loose = [];
  b.text.split(' | ').forEach((turn) => { let m; const t = turn.replace(/^[FM]: /, ''); NUM.lastIndex = 0; while ((m = NUM.exec(t))) { const w = m[1].toLowerCase(); if (!covered.some((c) => c.indexOf(w) >= 0)) loose.push(w); } });
  if (loose.length) bad++; L((loose.length ? 'FAIL ' : 'OK   ') + b.id + ' number words all covered by a fact' + (loose.length ? ': uncovered ' + loose.join(',') : '')); });
const stills = ['now_open', 'now_ref1', 'now_fixed', 'now_ref2', 'ours_door', 'ours_panel', 'ours_fix', 'ours_undo', 'ours_open', 'ours_saved', 'ours_release', 'ours_done', 'help_ship', 'help_po', 'help_so_foot', 'ask_card', 'guide_live'], zs = (Lg.zk && Lg.zk.shots) || {};
const sz = (f) => { try { const b = fs.readFileSync(f); return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20); } catch (e) { return 'none'; } };
const must = [['no page error in the twin sessions', (F.errors || []).length === 0], ['every twin picture exists, is 1920x1080, and holds the elements it must show', stills.every((k) => F.shots[k] && F.shots[k].ok && fs.existsSync(path.join(OUT, F.shots[k].file)) && sz(path.join(OUT, F.shots[k].file)) === '1920x1080')],
  ['beat 8: legacy\'s three stills exist and hold what they must show', ['top', 'complete', 'tail'].every((k) => zs[k] && zs[k].inside && fs.existsSync(path.join(OUT, zs[k].file)))],
  ['beat 8: legacy\'s own panel shows the CURRENT wording (You need these first / What can stop Complete), no tick, no file name', !!Lg.zk && /You need these first/.test(Lg.zk.panel) && /What can stop Complete/.test(Lg.zk.panel) && !/✓/.test(Lg.zk.panel) && !/\.java/.test(Lg.zk.panel) && Lg.zk.fresh === false],
  ['beat 8: the pilot was restored to its snapshot (legacy_shot) and its tables say 1 / 0 / 0 (pilot_witness)', Lg.back === true && /PASS 1\/0\/0/.test(F.pilot.verdict)], ['the L&F parity witness on the pilot passes', /PASS fails=0 inconclusive=0/.test(F.lf.verdict)],
  ['W-HELP-PEEK: every claim PASS with something judged, the seven red runs each FAIL as they must', F.peek.allPass === true],
  ['W-CTXHELP-OVERLAY, W-CTXHELP-DERIVED (8/0) and W-CTXHELP-LEGACY pass; the derived red run (DV_BREAK=srcline) FAILS', /verdict=PASS/.test(F.overlay.verdict) && /PASS pass=\d+ fail=0 inconclusive=0/.test(F.derived.verdict) && /FAIL/.test(F.red.verdict) && /verdict=PASS/.test(F.legacyW.verdict)],
  ['the peek\'s rows are all cited (P4): ' + F.rows.peekCited + ' of ' + (F.rows.peekAssume + F.rows.peekField + F.rows.peekFix), F.rows.peekCited === F.rows.peekAssume + F.rows.peekField + F.rows.peekFix],
  ['the rows shipped in the app = the topics the script adds to legacy (' + F.rows.helps + ')', F.rows.helps === Lg.applied.helps - Lg.before.helps],
  ['credentials: MIT, every PR the card names merged', F.credentials.licence === 'MIT License' && F.credentials.prs.every((x) => x.state === 'MERGED')], ['prior art: every source file the last card cites was found and read', Object.values(F.prior).every((x) => x.length > 0)]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
const said = N.saidEnglish;
[[/refus|not complete/i, 'owner language rule: no "refuses", no "not complete"'], [/tick|✓/i, 'no tick talk'], [/DocAction|table|schema|log line|§|witness|SQL|JSON/i, 'no internal terms in the spoken text'], [/\blive\b|real.?time/i, 'the pictures are taken, not streamed'], [/faster|speed|seconds|milliseconds/i, 'no speed was claimed in the voice'],
 [/every language|all languages|French|Japanese|Mandarin|German|Spanish|Chinese|translated/i, 'no language was shown'], [/reviewed|native/i, 'nothing was reviewed by a native speaker or a person'], [/RUN_SyncDB|RUN SyncDB/i, 'beat 8 applied the script with psql, not through RUN_SyncDB'],
 [/\bnow shows\b|\bfresh\b|just now/i, 'no "fresh" claim about legacy\'s cache'], [/\bAI\b|A I\b|artificial/i, 'no claim about AI'], [/Business Central|SAP/i, 'the competitors are named only on the last card']].forEach(([re, why]) => { const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
