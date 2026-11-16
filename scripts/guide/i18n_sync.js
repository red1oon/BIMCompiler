#!/usr/bin/env node
// ⚠ DO NOT REMOVE — i18n_sync.js: carry an English page's edits into its translations without retranslating them (prompts/DOCS_I18N.md §6f). READ THE § LOG.
// Witness: scripts/guide/witness_i18n_sync.js (W-I18N-SYNC). Needs the I11 line structure: one English body line = one translated body line.
//   node scripts/guide/i18n_sync.js <Page> [--lang xx] [--apply] [--old-english FILE]
// Per translated page docs/<Page>.<lang>.md:
//   1. the OLD English = the git version of docs/<Page>.md whose sha256 prefix is the page's source_sha (or --old-english FILE); none -> refused, never guessed;
//   2. diff old -> new English by lines (longest common subsequence);
//   3. each new English line is KEPT (unchanged: its translated line is reused), CARRIED (fence, code, comment, blank: copied from the new English),
//      PATCHED (prose whose only change is in code spans or numbers: the tokens are swapped inside the translation), or TODO (new or reworded prose:
//      the new English line is written in its place and listed in docs/<Page>.<lang>.todo.json);
//   4. --apply writes the page; source_sha moves to the new English hash only when there is no TODO line (else the page keeps showing "out of date").
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');
const LN = require('./i18n_lines.js');
const REPO = path.join(__dirname, '..', '..'), DOCS = path.join(REPO, 'docs');
const say = (m) => console.error('§I18N_SYNC ' + m);
const sha16 = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

// longest common subsequence over lines -> pairs [oldIndex, newIndex] of equal lines, in order
function lcs(a, b) {
  const n = a.length, m = b.length, W = m + 1, T = new Uint32Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) T[i * W + j] = a[i] === b[j] ? T[(i + 1) * W + j + 1] + 1 : Math.max(T[(i + 1) * W + j], T[i * W + j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (a[i] === b[j]) { pairs.push([i, j]); i++; j++; } else if (T[(i + 1) * W + j] >= T[i * W + j + 1]) i++; else j++; }
  return pairs;
}
// find the git version of the English page with this content hash
function oldEnglish(rel, want) {
  const r = cp.spawnSync('git', ['-C', REPO, 'log', '--all', '--format=%H', '--', rel], { encoding: 'utf8', maxBuffer: 1 << 26 });
  for (const h of (r.stdout || '').split('\n').filter(Boolean)) {
    const s = cp.spawnSync('git', ['-C', REPO, 'show', h + ':' + rel], { encoding: 'utf8', maxBuffer: 1 << 26 });
    if (s.status === 0 && sha16(s.stdout) === want) return { text: s.stdout, commit: h.slice(0, 9) };
  }
  return null;
}
// the core, pure: (old English body, new English body, translated body, brk) -> { out, report, todo }
function sync(oldB, newB, trB, brk) {
  const kNew = LN.kinds(newB), kOld = LN.kinds(oldB), pairs = lcs(oldB, newB), oldOf = new Map(pairs.map(([i, j]) => [j, i]));
  const out = [], todo = [], rep = { kept: 0, carried: 0, patched: 0, todo: 0, lines: newB.length, changedProse: 0 }, cls = [];
  // the old lines that left without a match, in order, so a changed line can be paired with the one it replaced (same hunk, same position)
  const matchedOld = new Set(pairs.map(p => p[0]));
  let pi = 0, lastOld = -1;
  for (let j = 0; j < newB.length; j++) {
    const line = newB[j], k = kNew[j];
    if (oldOf.has(j)) { const i = oldOf.get(j); lastOld = i; out.push(kOld[i] === 'prose' ? trB[i] : line); if (kOld[i] === 'prose') { rep.kept++; cls.push('kept'); } else { rep.carried++; cls.push('carried'); } continue; }
    if (k !== 'prose') { out.push(line); rep.carried++; cls.push('carried'); continue; }
    rep.changedProse++;
    // the old line this one replaced: the next unmatched old prose line after the last matched one, before the next matched one
    let i = lastOld + 1, nextMatched = oldB.length; for (const [oi, nj] of pairs) if (nj > j) { nextMatched = oi; break; }
    while (i < nextMatched && (matchedOld.has(i) || kOld[i] !== 'prose')) i++;
    const was = i < nextMatched ? i : -1;
    if (was >= 0) { matchedOld.add(was); lastOld = was; }
    if (was >= 0 && brk === 'keepstale') { out.push(trB[was]); rep.kept++; cls.push('kept'); continue; }   // W-I18N-SYNC falsifier (must FAIL Y4)
    if (was >= 0) {
      const o = LN.tokens(oldB[was]), n = LN.tokens(line);
      if (o.mask === n.mask && o.toks.length === n.toks.length) {
        let t = trB[was], ok = true;
        const pairsT = o.toks.map((x, q) => [x, n.toks[q]]).filter(([x, y]) => x !== y);
        for (const [x] of pairsT) if (LN.count(t, x) !== LN.count(oldB[was], x)) ok = false;
        if (ok) { // swap each changed token (all its occurrences change together, as in the English line)
          const uniq = new Map(); pairsT.forEach(([x, y]) => { if (uniq.has(x) && uniq.get(x) !== y) ok = false; uniq.set(x, y); });
          if (ok && brk === 'substring') { uniq.forEach((y, x) => { t = t.split(x).join('\u0001' + y + '\u0002'); }); t = t.replace(/[\u0001\u0002]/g, ''); out.push(t); rep.patched++; cls.push('patched'); continue; }   // W-I18N-SYNC falsifier: the old substring swap (must FAIL Y7)
          if (ok) { out.push(LN.swap(t, uniq)); rep.patched++; cls.push('patched'); continue; }   // whole tokens, one pass (DOCS_I18N.md §6f FIX)
        }
      }
    }
    out.push(line); rep.todo++; cls.push('todo'); todo.push({ line: j + 1, english_old: was >= 0 ? oldB[was] : null, english_new: line, translation_old: was >= 0 ? trB[was] : null });
  }
  return { out, rep, todo, cls };
}
module.exports = { sync, lcs };

if (require.main === module) {
  const a = process.argv.slice(2), page = a.find(x => !x.startsWith('--') && a[a.indexOf(x) - 1] !== '--lang' && a[a.indexOf(x) - 1] !== '--old-english');
  const onlyLang = a.includes('--lang') ? a[a.indexOf('--lang') + 1] : null, apply = a.includes('--apply'), oldFile = a.includes('--old-english') ? a[a.indexOf('--old-english') + 1] : null;
  if (!page) { console.error('usage: i18n_sync.js <Page> [--lang xx] [--apply] [--old-english FILE]'); process.exit(2); }
  const enPath = path.join(DOCS, page + '.md'), enText = fs.readFileSync(enPath, 'utf8'), en = LN.parse(enText), enSha = sha16(enText);
  const langs = fs.readdirSync(DOCS).map(f => (new RegExp('^' + page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.([a-z]{2})\\.md$').exec(f) || [])[1]).filter(Boolean).filter(l => !onlyLang || l === onlyLang);
  let code = 0;
  for (const lang of langs) {
    const trPath = path.join(DOCS, page + '.' + lang + '.md'), trText = fs.readFileSync(trPath, 'utf8'), tr = LN.parse(trText), was = tr.meta.source_sha;
    if (was === enSha && !oldFile) { say(page + '.' + lang + ' up to date (source_sha=' + was + ')'); continue; }
    const old = oldFile ? { text: fs.readFileSync(oldFile, 'utf8'), commit: 'file' } : oldEnglish(path.relative(REPO, enPath), was);
    if (!old) { say(page + '.' + lang + ' REFUSED: no git version of ' + page + '.md has sha ' + was + '; not guessed'); code = 3; continue; }
    const ob = LN.parse(old.text).body;
    if (ob.length !== tr.body.length) { say(page + '.' + lang + ' REFUSED: the translation has ' + tr.body.length + ' body lines, its English had ' + ob.length + ' (I11 line structure broken); not synced'); code = 3; continue; }
    const r = sync(ob, en.body, tr.body, process.env.SYNC_BREAK || '');
    say(page + '.' + lang + ' from=' + was + ' (' + old.commit + ') to=' + enSha + ' lines=' + r.rep.lines + ' kept=' + r.rep.kept + ' carried=' + r.rep.carried + ' patched=' + r.rep.patched + ' todo=' + r.rep.todo + ' (to translate: ' + r.rep.todo + ' of ' + r.rep.lines + ' lines)');
    const todoPath = path.join(DOCS, page + '.' + lang + '.todo.json');
    if (apply) {
      const fm = tr.fm.split('\n').map(l => (r.rep.todo === 0 && /^source_sha:/.test(l)) ? 'source_sha: ' + enSha : l).join('\n');
      fs.writeFileSync(trPath, '---\n' + fm + '\n---\n' + (tr.gap ? '\n' : '') + r.out.join('\n'));
      if (r.todo.length) fs.writeFileSync(todoPath, JSON.stringify({ page, lang, english_sha: enSha, todo: r.todo }, null, 1) + '\n'); else if (fs.existsSync(todoPath)) fs.unlinkSync(todoPath);
      say(page + '.' + lang + ' written; source_sha ' + (r.rep.todo === 0 ? 'moved to ' + enSha : 'kept (' + r.rep.todo + ' lines to translate in ' + path.relative(REPO, todoPath) + ')'));
    }
  }
  process.exit(code);
}
