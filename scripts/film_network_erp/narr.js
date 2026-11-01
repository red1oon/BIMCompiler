// ⚠ DO NOT REMOVE — Scope: the beats of the film "Network ERP without an Apps and Database server!" (TEAMWORK_FRAMEWORK.md §45.15). The narration is the
// storyboard's text (script_en.md) VERBATIM, one narrator (M); {{id}} = a fact from facts.resolved.json, substituted here, never typed. Beats with no
// narration (title, end) get a fixed hold. READ THE LOG of every run.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.json'), 'utf8')).facts;
// the narration column of script_en.md, read from the file (not retyped): beat number -> text between the outer quotes
function storyboard() { const o = {}; fs.readFileSync(path.join(__dirname, 'script_en.md'), 'utf8').split('\n').forEach(l => { const m = /^\| (\d+) \|.*\| "(.*)" \|\s*$/.exec(l); if (m) o[m[1]] = m[2]; }); return o; }
const SB = storyboard();
const BEATS = [['b01', 'title', null, 7], ['b02', 'usual', '2'], ['b03', 'other', '3'], ['b04', 'test', '4'], ['b05', 'lost', '5'], ['b06', 'books', '6'], ['b07', 'feel', '7'],
  ['b08', 'maths', '8'], ['b09', 'bends', '9'], ['b10', 'versus', '10'], ['b11', 'end', null, 2]];   // end card 2 s: the recorder adds a 5 s final hold (rc1 ended on 13.5 s of silence)
function fill(t) { return t.replace(/\{\{(\w+)\}\}/g, (_, k) => { if (!(k in F)) throw new Error('unresolved fact ' + k); return String(F[k]); }); }
const beats = BEATS.map(([id, card, sb, hold]) => { const raw = sb ? SB[sb] : null; if (sb && !raw) throw new Error('storyboard beat ' + sb + ' has no narration');
  return { id, card, hold: hold || null, text: raw ? fill(raw) : null, facts: raw ? (raw.match(/\{\{(\w+)\}\}/g) || []).map(x => x.slice(2, -2)) : [] }; });
module.exports = { beats, F };
