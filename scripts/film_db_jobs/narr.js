// ⚠ DO NOT REMOVE — Scope: the beats of "What a server stands for, and what a database stands for" (TEAMWORK_FRAMEWORK.md §53). Narration = script_en.md VERBATIM (F/M turns), no figures by design. READ THE LOG of every run.
'use strict';
const fs = require('fs'), path = require('path');
function storyboard() { const o = {}; fs.readFileSync(path.join(__dirname, 'script_en.md'), 'utf8').split('\n').forEach(l => { const m = /^\| (\d+) \|.*\| "(.*)" \|\s*$/.exec(l); if (m) o[m[1]] = m[2]; }); return o; }
const LANG = process.env.FILM_LANG || 'en';
const SB = LANG === 'zh' ? (() => { const z = JSON.parse(fs.readFileSync(path.join(__dirname, 'script_zh.json'), 'utf8')); delete z._note; return z; })() : storyboard();
// [beat id, card, storyboard row (null = silent), fixed hold seconds (silent beats)]
const BEATS = [['b01', 'title', null, 3.4], ['c1', 'ch1', null, 3.6], ['b02', 'objection', '2'], ['b03', 'guard', '3'], ['b04', 'sensor', '4'], ['b05', 'lock', '5'],
  ['c2', 'ch2', null, 3.6], ['b06', 'job1', '6'], ['b07', 'job2', '7'], ['b08', 'job3', '8'], ['b09', 'job458', '9'], ['b10', 'job6', '10'], ['b11', 'job7', '11'], ['b12', 'job9', '12'],
  ['c3', 'ch3', null, 3.6], ['b13', 'exception', '13'], ['b14', 'suff', '14'], ['b15', 'close', '15'], ['b16', 'end', null, 0.3]];
const beats = BEATS.map(([id, card, sb, hold]) => { const raw = sb ? SB[sb] : null; if (sb && !raw) throw new Error('storyboard beat ' + sb + ' has no narration'); return { id, card, hold: hold || null, text: raw, facts: [] }; });
module.exports = { beats, F: {}, LANG };
