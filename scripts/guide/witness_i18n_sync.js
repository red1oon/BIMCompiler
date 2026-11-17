#!/usr/bin/env node
// ⚠ DO NOT REMOVE — W-I18N-SYNC: an English edit carried into the translations without retranslating them (prompts/DOCS_I18N.md §6f). READ THE LOG.
// Fixture: REAL git versions. The translations of docs/FastScriptGuide.md were made from the version with sha 276f5bede717d2ac; the "edited English" is
// another real version of the same file (SYNC_OTHER, default 93611da3b, a 143-line real edit). Each translation is synced from one to the other.
//   Y1 ISSUE (a translation thrown away): every new English line that equals exactly one old prose line keeps that line's translation byte for byte.
//   Y2 ISSUE (a block edited by hand or lost): every fence, code, comment and blank line of the result equals the new English.
//   Y3 ISSUE (a token patch that breaks a command or a figure): every patched line has exactly the new English line's code spans and numbers.
//   Y4 ISSUE (a changed sentence silently kept in its old translation): every new English prose line found nowhere in the old English is patched or to-do, never kept.
//   Y5 ISSUE (the result is not a valid page): the same line structure as the new English (I11), and over all prose the same code spans and numbers (I3, I4).
//   Y6 ISSUE (no saving): the to-do lines are at most the changed prose lines, stated against a full retranslation.
//   Y7 ISSUE (a number inside another, or a chained swap, corrupts a patched line; DOCS_I18N.md §6f FIX): a synthetic nested-number line patches to exactly the new numbers.
//   Falsifiers: SYNC_BREAK=keepstale (a changed line keeps its old translation: must FAIL Y4) · SYNC_BREAK=substring (the old substring swap: must FAIL Y7).
//   Run: node scripts/guide/witness_i18n_sync.js > build/witness_i18n_sync.log 2>&1
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const LN = require('./i18n_lines.js'), SY = require('./i18n_sync.js');
const REPO = path.join(__dirname, '..', '..'), PAGE = 'FastScriptGuide', OTHER = process.env.SYNC_OTHER || '93611da3b', BRK = process.env.SYNC_BREAK || '';
let pass = 0, fail = 0, inc = 0;
const L = (m) => console.log('§W-I18N-SYNC ' + m), chk = (n, ok, info) => { ok ? pass++ : fail++; console.log('  ' + (ok ? '✅' : '❌') + ' ' + n + (info ? '  ' + info : '')); }, incon = (id, w) => { inc++; L('INCONCLUSIVE ' + id + ' — ' + w); };
const show = (rev) => { const r = cp.spawnSync('git', ['-C', REPO, 'show', rev + ':docs/' + PAGE + '.md'], { encoding: 'utf8', maxBuffer: 1 << 26 }); return r.status === 0 ? r.stdout : null; };
const sha16 = (s) => require('crypto').createHash('sha256').update(s).digest('hex').slice(0, 16);
const langs = fs.readdirSync(path.join(REPO, 'docs')).map(f => (new RegExp('^' + PAGE + '\\.([a-z]{2})\\.md$').exec(f) || [])[1]).filter(Boolean);
const nowEn = fs.readFileSync(path.join(REPO, 'docs', PAGE + '.md'), 'utf8'), other = show(OTHER);
if (!other) { incon('Y', 'no git version ' + OTHER + ' of ' + PAGE + '.md'); }
const bag = (a) => { const m = {}; a.forEach(x => { m[x] = (m[x] || 0) + 1; }); return JSON.stringify(Object.keys(m).sort().map(k => [k, m[k]])); };
const bad = { Y1: [], Y2: [], Y3: [], Y4: [], Y5: [], Y6: [] }; let judged = 0, totalTodo = 0, totalLines = 0, kept = 0, patched = 0, carried = 0;
if (other) langs.forEach(lang => {
  const tr = LN.parse(fs.readFileSync(path.join(REPO, 'docs', PAGE + '.' + lang + '.md'), 'utf8'));
  if (tr.meta.source_sha !== sha16(nowEn)) { incon('Y', lang + ': its source_sha ' + tr.meta.source_sha + ' is not the current English; the fixture assumes it is'); return; }
  const oldB = LN.parse(nowEn).body, newB = LN.parse(other).body, trB = tr.body;
  if (oldB.length !== trB.length) { bad.Y5.push(lang + ' the translation breaks I11 before the sync'); return; }
  judged++;
  const r = SY.sync(oldB, newB, trB, BRK), out = r.out, kNew = LN.kinds(newB), kOld = LN.kinds(oldB);
  totalTodo += r.rep.todo; totalLines += newB.length; kept += r.rep.kept; patched += r.rep.patched; carried += r.rep.carried;
  L(lang + ' old=' + sha16(nowEn) + ' new=' + OTHER + ' lines=' + newB.length + ' kept=' + r.rep.kept + ' carried=' + r.rep.carried + ' patched=' + r.rep.patched + ' todo=' + r.rep.todo + ' changedProse=' + r.rep.changedProse);
  const oldProse = new Map(); oldB.forEach((l, i) => { if (kOld[i] === 'prose') oldProse.set(l, oldProse.has(l) ? -1 : i); });
  newB.forEach((l, j) => {
    if (kNew[j] !== 'prose') { if (out[j] !== l) bad.Y2.push(lang + ' line ' + (j + 1)); return; }
    const u = oldProse.get(l);
    if (u !== undefined && u >= 0 && out[j] !== trB[u] && r.cls[j] !== 'todo') bad.Y1.push(lang + ' line ' + (j + 1));   // (a line the diff paired elsewhere may be honestly re-listed as to-do)
    if (u !== undefined && u >= 0 && r.cls[j] === 'todo') bad.Y1.push(lang + ' line ' + (j + 1) + ' unchanged in English but listed to-do');
    if (u === undefined && r.cls[j] === 'kept') bad.Y4.push(lang + ' line ' + (j + 1) + ' ' + JSON.stringify(l.slice(0, 50)));
    if (r.cls[j] === 'patched' && bag(LN.tokens(out[j]).toks) !== bag(LN.tokens(l).toks)) bad.Y3.push(lang + ' line ' + (j + 1));
  });
  // Y5 the result as a page against the NEW English
  const kOut = LN.kinds(out);
  if (out.length !== newB.length || kOut.some((k, q) => (k === 'prose') !== (kNew[q] === 'prose') || (k !== 'prose' && k !== kNew[q]))) bad.Y5.push(lang + ' line structure');
  const pt = (b, k) => b.filter((_, q) => k[q] === 'prose').map(x => LN.tokens(x).toks).flat();
  if (bag(pt(out, kOut).filter(t => t.startsWith('`'))) !== bag(pt(newB, kNew).filter(t => t.startsWith('`')))) bad.Y5.push(lang + ' code spans');
  if (r.rep.todo > r.rep.changedProse) bad.Y6.push(lang + ' todo ' + r.rep.todo + ' > changed prose ' + r.rep.changedProse);
});
// Y7 (DOCS_I18N.md §6f FIX) nested numbers: a number inside another (5 in 1157, 6 in 64) and a swap whose result is a later swap's input (5->6, 6->7)
{ const o = ['**N.** 59 a 5 b 1157 c 6 d 14 and 64'], n = ['**N.** 62 a 6 b 1158 c 7 d 15 and 64'], t = ['**N.** 14 d 6 c 1157 b 5 a 59 und 64'];
  const r = SY.sync(o, n, t, BRK), want = bag(LN.tokens(n[0]).toks), got = bag(LN.tokens(r.out[0]).toks);
  L('Y7 nested numbers: class=' + r.cls[0] + ' out=' + JSON.stringify(r.out[0]) + ' want numbers ' + want);
  chk('Y7 a patched line swaps whole numbers only, in one pass (5 inside 1157 and 6 inside 64 untouched; 5->6 then 6->7 not chained)', r.cls[0] === 'patched' && got === want, 'got ' + got); }
if (!judged) incon('Y', 'VACUOUS: no translation judged');
else {
  L('total over ' + judged + ' languages: lines=' + totalLines + ' kept=' + kept + ' carried=' + carried + ' patched=' + patched + ' to translate=' + totalTodo + ' (' + (100 * totalTodo / totalLines).toFixed(1) + '% of a full retranslation)');
  chk('Y1 every unchanged English line keeps its translation (' + judged + ' languages)', !bad.Y1.length, bad.Y1.slice(0, 3).join(' | '));
  chk('Y2 every fence, code, comment and blank line equals the new English', !bad.Y2.length, bad.Y2.slice(0, 3).join(' | '));
  chk('Y3 every patched line holds exactly the new code spans and numbers (' + patched + ' patched)', !bad.Y3.length, bad.Y3.slice(0, 3).join(' | '));
  chk('Y4 no changed English prose line keeps an old translation', !bad.Y4.length, bad.Y4.slice(0, 3).join(' | '));
  chk('Y5 the synced page has the new English line structure and code spans', !bad.Y5.length, bad.Y5.slice(0, 3).join(' | '));
  chk('Y6 to translate: ' + totalTodo + ' of ' + totalLines + ' lines, at most the changed prose', totalTodo > 0 && !bad.Y6.length, bad.Y6.slice(0, 3).join(' | ') || (totalTodo === 0 ? 'VACUOUS: the fixture changed no prose' : ''));
}
console.log('§WITNESS_I18N_SYNC pass=' + pass + ' fail=' + fail + ' inconclusive=' + inc + ' verdict=' + (fail ? 'FAIL' : inc ? 'INCONCLUSIVE' : 'PASS') + (BRK ? ' (SYNC_BREAK=' + BRK + ')' : ''));
process.exit(fail ? 1 : inc ? 2 : 0);
