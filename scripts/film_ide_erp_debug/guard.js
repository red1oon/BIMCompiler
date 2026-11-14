// ⚠ DO NOT REMOVE — film 3 (prompts/FILM_IDE_ERP_DEBUG.md): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources (out/facts.json, out/shots.log, out/before.log, out/after.log, the bim-compiler guide)
// and FAILS if one is not as stated, if the typed text is not in the merged fix, if a shoot step reported an error, or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js'), OUT = path.join(__dirname, 'out');
const rd = f => fs.readFileSync(path.join(OUT, f), 'utf8'), F = JSON.parse(rd('facts.json')), SH = rd('shots.log'), BEF = rd('before.log'), AFT = rd('after.log');
const shot = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); return ls.length ? ls[ls.length - 1] : ''; };   // the LAST take of a still
const num = (l, k) => { const m = new RegExp(' ' + k + '=(\\d+)').exec(l); return m ? m[1] : null; };
const plan = JSON.parse(/§FILM_PLAN commits [^{]*(\{.*\})/.exec(SH)[1]);
const sameLines = (log, v) => log.split('\n').filter(l => l.indexOf('§REPLAY_CLOCK_SESSION_DAY') >= 0 && /tz=Asia\/Kuala_Lumpur/.test(l) === (v === 'KL') || false);
const kl = log => log.split('\n').filter(l => /§REPLAY_CLOCK_SESSION_DAY tz=Asia\/Kuala_Lumpur/.test(l)), utc = log => log.split('\n').filter(l => /§REPLAY_CLOCK_SESSION_DAY tz=UTC/.test(l));
const diff = (/§FILM_DIFF\s+(.*)/.exec(SH) || [])[1] || '', guide = (() => { try { return fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'DeveloperGuide.md'), 'utf8'); } catch (e) { return ''; } })();
const h1 = shot('h1_tag_before'), f2 = shot('f2_landed'), defs = /§FILM_DEFS count=(\d+) .* at=(\S+)/.exec(SH);
const facts = {
  'clock.time': (/local_clock=\S+ (\d\d:\d\d)/.exec(BEF) || [])[1], 'clock.localDay': F.states.new.localDay,
  'old.invoiceDay': F.states.old.page.dateInvoiced, 'new.invoiceDay': F.states.new.page.dateInvoiced,
  'hover.names_spec': /CODE_ARCHITECTURE_DESIGN\.md:\d+/.test(h1) ? 'Y' : 'N', 'hover.names_printer': /printed by:/.test(h1) && /witness_replay_clock\.js:151/.test(h1) ? 'Y' : 'N',
  'def.line': defs && defs[2] === 'erp/ws_kernel.js:' + plan.def.line && num(f2, 'line') === String(plan.def.line) ? String(plan.def.line) : 'N',
  'old.next_line_utc': plan.frags[0].line === plan.def.line + 1 && /toISOString\(\)/.test(plan.frags[0].old) ? 'Y' : 'N',
  'typed.0': num(shot('t0c_typed'), 'typed') === String(plan.frags[0].neu.length) ? String(plan.frags[0].neu.length) : 'N', 'typed.1': num(shot('t1c_typed'), 'typed') === String(plan.frags[1].neu.length) ? String(plan.frags[1].neu.length) : 'N',
  'after.same_y': String(utc(AFT).concat(kl(AFT)).filter(l => /same=Y/.test(l)).length), 'diff.ins': (/(\d+) insertions?\(\+\)/.exec(diff) || [])[1], 'diff.del': (/(\d+) deletions?\(-\)/.exec(diff) || [])[1],
  'guide.section': /^### 5\.6 The clock rule/m.test(guide) ? '5.6' : 'N' };
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m);
N.beats.forEach(b => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const must = [['before: the Kuala Lumpur line says same=N and the UTC line same=Y', kl(BEF).length === 1 && /same=N/.test(kl(BEF)[0]) && utc(BEF).length === 1 && /same=Y/.test(utc(BEF)[0])],
  ['after: both lines say same=Y and the witness passes', /§WITNESS_REPLAY_CLOCK pass=4 fail=0/.test(AFT) && kl(AFT).length === 1 && /same=Y/.test(kl(AFT)[0])],
  ['the typed text is in the file and the old text is gone', /§FILM_TYPED .*fragments_in_file=true old_gone=true/.test(SH)],
  ['the typed fix is the size of the merged fix (bim-ootb #3010: +2/-2)', facts['diff.ins'] === '2' && facts['diff.del'] === '2'],
  ['no shoot step reported an error', !/§FILM_ERROR/.test(SH)], ['facts.js verdict PASS (page == kernel row, OLD = UTC day, NEW = local day)', F.checks && F.checks.P && F.checks.B],
  ['every still the cards need exists', ['h1_tag_before', 'f1_call', 'f2_landed', 't0a_deleted', 't0b_half', 't0c_typed', 't1a_deleted', 't1b_half', 't1c_typed', 's1_saved'].every(n => fs.existsSync(path.join(OUT, 'stills', n + '.png')))],
  ['the page pictures exist', ['old', 'new'].every(i => fs.existsSync(path.join(OUT, 'page_' + i + '.png')))]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
// not-said: the film must not claim what the pictures do not show
const said = N.beats.map(b => b.text || '').join(' ');
[[/last value/i, 'the add-on shows no last value for this tag'], [/\blive\b|linked|real.?time/i, 'the page is opened on data written earlier, not linked live'], [/\bFAIL(s|ed)?\b/, 'the witness line is information, not a failed test']].forEach(([re, why]) => { const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
