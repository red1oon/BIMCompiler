// ⚠ DO NOT REMOVE — Scope: the beats of "Think Global, Act Local" (NEURO_SYMBOLIC_ORDER_CONTRACT.md §16). Beats and narration are read from the
// storyboard table in script_en.md VERBATIM (turns "F: … ‖ M: …" become the fitter's "F: … | M: …"); {{id}} = a fact from facts.resolved.json,
// substituted here, never typed. A beat with no narration (—) gets a fixed hold (PLAYBOOK C: chapter cards 3.6 s, silent). READ THE LOG of every run.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.json'), 'utf8')).facts;
const HOLD = { title: 4.4, ch_global: 3.6, ch_local: 3.6, ch_rule: 3.6, end: 1 };
const rows = fs.readFileSync(path.join(__dirname, 'script_en.md'), 'utf8').split('\n').map(l => /^\| (\d+) \| (\w+) \| .* \| (?:"(.*)"|—) \|\s*$/.exec(l)).filter(Boolean);
function fill(t) { return t.replace(/\{\{(\w+)\}\}/g, (_, k) => { if (!(k in F)) throw new Error('unresolved fact ' + k); return String(F[k]); }); }
const beats = rows.map(m => { const id = 'b' + m[1].padStart(2, '0'), raw = m[3] || null;
  if (!raw && !(m[2] in HOLD)) throw new Error('beat ' + id + ' (' + m[2] + ') has no narration and no hold');
  return { id, card: m[2], hold: raw ? null : HOLD[m[2]], text: raw ? fill(raw).replace(/\s*‖\s*/g, ' | ') : null, facts: raw ? (raw.match(/\{\{(\w+)\}\}/g) || []).map(x => x.slice(2, -2)) : [] }; });
if (beats.length < 2) throw new Error('storyboard table not read');
module.exports = { beats, F, LANG: 'en' };
