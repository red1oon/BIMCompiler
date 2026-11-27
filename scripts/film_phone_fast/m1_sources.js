// ⚠ DO NOT REMOVE — Scope: FILM-M1 last card sources (prior art + credentials), shared by cards_m1.js (builds the card) and guard_cards.js (checks it independently).
// READ the § lines either prints. Issue this proves: nothing is on the card unless its words are in the file it cites (prompts/MOBILE_PERF.md at origin/master, common/tests/gh_standin.js at the app tree) —
// verifyPrior / verifyCreds return {ok,line,why} per row; a row that fails is left off the card (never added unread).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO = path.resolve(__dirname, '..', '..');
const gitShow = (repo, ref, file) => { const r = cp.spawnSync('git', ['-C', repo, 'show', ref + ':' + file], { encoding: 'utf8', maxBuffer: 1 << 28 }); return r.status === 0 ? r.stdout : null; };
// the text of a cited file: bim-compiler files from git (ref), bim-ootb files from the app tree (APP env / arg) so the card cites what the film was recorded from
function textOf(w, APP) { if (w.repo === 'bim-ootb') { const f = path.join(APP || process.env.BIM_OOTB || '', w.file); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; } return gitShow(REPO, w.ref || 'origin/master', w.file); }
function verifyPrior(items, APP) { return items.map(it => { const t = textOf(it.where, APP); if (t == null) return { it, ok: false, why: 'file not readable: ' + it.where.repo + ':' + it.where.file };
  const i = t.indexOf(it.where.text); if (i < 0) return { it, ok: false, why: 'cited words not in ' + it.where.file }; return { it, ok: true, line: t.slice(0, i).split('\n').length }; }); }
function verifyCreds(cfg, state) { const t = gitShow(REPO, 'origin/master', 'prompts/MOBILE_PERF.md') || ''; const lines = t.split('\n');
  return cfg.items.map(c => { let ok = t.indexOf(c.text) >= 0, why = ok ? '' : 'words not in MOBILE_PERF.md', line = ok ? t.slice(0, t.indexOf(c.text)).split('\n').length : 0;
    if (ok && c.header) { const h = lines.findIndex(l => /^###/.test(l) && l.indexOf(c.header) >= 0); if (h < 0) { ok = false; why = 'no ✅ heading carries "' + c.header + '"'; } else { let e = h + 1; while (e < lines.length && !/^##/.test(lines[e])) e++; if (!(line - 1 > h && line - 1 < e)) { ok = false; why = 'words are outside the block of heading line ' + (h + 1); } } }
    if (ok && c.lineHas && (lines[line - 1] || '').indexOf(c.lineHas) < 0) { ok = false; why = 'the line with the verdict does not carry "' + c.lineHas + '"'; }
    const st = state && state[c.pr]; if (ok && st !== 'MERGED') { ok = false; why = 'PR #' + c.pr + ' state=' + st; }
    return { c, ok, why, line }; }); }
function prStates(repo, prs) { const o = {}; for (const n of prs) { const r = cp.spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/' + repo, '--json', 'state', '-q', '.state'], { encoding: 'utf8' }); o[n] = r.status === 0 ? r.stdout.trim() : 'UNKNOWN'; } return o; }
module.exports = { verifyPrior, verifyCreds, prStates, gitShow, textOf, REPO };
