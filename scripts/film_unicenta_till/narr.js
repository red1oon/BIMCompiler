// ⚠ DO NOT REMOVE — Scope: the beats of "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34). Narration = script_en.md VERBATIM; every number word spoken is declared here as a fact key (facts.spec.json). READ THE LOG of every run.
'use strict';
const fs = require('fs'), path = require('path'), { LANG } = require('./lang.js');
const SB = {}; fs.readFileSync(path.join(__dirname, 'script_' + LANG + '.md'), 'utf8').split('\n').forEach(l => { const m = /^\| (\d+) \|.*\| "(.*)" \|\s*$/.exec(l); if (m) SB[m[1]] = m[2]; });
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.spec.json'), 'utf8')); delete SPEC._note;
// [id, card (a plain card name, a chapter card, or 'REC:<segment>' = a recorded clip), storyboard row (null = silent), hold seconds (silent), facts, blockedBy]
// BEAT3=stills (default): beat 3 is a composite of design stills (the recorded footage shows the OLD till -> branch-admin hand-off, which contradicts the main-till words).  BEAT3=live: the recorded clips seg_tills / seg_admin (re-record them when the main till + branch relay, TEAMWORK §38, have landed).
const B3 = (process.env.BEAT3 || 'live') === 'live';   // v4 (§34.G): live is the default now (main till + branch relay recorded for real); BEAT3=stills rebuilds from the design stills
const BEATS = [
  ['c0', 'ch0', null, 3.6, []],   // v4 (§34.G): the opening chapter card, silent, before beat 0
  ['b0a', 'before', '1', 0, ['year2011', 'stacks3']], ['b0b', 'after', '2', 0, ['stacks3']], ['b0c', 'exp1+exp2+exp3+exp4', '18', 0, []],
  ['c1', 'ch1', null, 3.6, []], ['b1p', 'orig', '3', 0, ['year2011', 'guide_two', 'guide_three']], ['b1a', 'REC:know', '4', 0, ['parity_n', 'parity_of']], ['b1b', 'REC:sale', '5', 0, ['sale_lines', 'sale_total']], ['b1c', 'REC:fold', '6', 0, [], 'W-TILL-CATALOG-TOGGLE'],
  ['c2', 'ch2', null, 3.6, []], ['b2a', 'REC:floor', '7', 0, []], ['b2b', 'REC:bump', '8', 0, ['rest_open_writes', 'rest_tap_writes', 'relay_order', 'lines_lo', 'lines_hi'], 'W-REST-FLOOR (chairs drawn)'],
  ['c3', 'ch3', null, 3.6, []], ['b3a', B3 ? 'REC:tills' : 'day1+day2', '9', 0, B3 ? ['tills', 'b3_tickets', 'relay_day', 'b3_lines'] : []], ['b3b', B3 ? 'REC:admin' : 'day2+day3', '10', 0, B3 ? ['eoda_send'] : []],
  ['c4', 'ch4', null, 3.6, []], ['b4a', 'REC:close', '11', 0, []], ['b4b', 'gs', '12', 0, ['dc_before_g', 'dc_before_s', 'dc_after_g', 'dc_after_s', 'dc_rowdiff', 'bom_a', 'bom_b', 'bom_c']],
  ['c5', 'ch5', null, 3.6, []], ['b5a', 'REC:price', '13', 0, ['soda_one', 'soda_other', 'soda_prices']], ['b5b', 'REC:receive', '14', 0, ['recv_target', 'recv_conf', 'recv_scrap', 'src_before', 'src_after', 'tgt_before', 'tgt_after'], 'W-RECEIVE-UI (§33.4 typed panel)'],
  ['c6', 'ch6', null, 3.6, []], ['b6', 'match', '15', 0, ['par_items', 'par_hdr', 'par_line']],
  ['b7', 'notyet', '16', 0, ['open_count', 'open_dec', 'open_dec2']], ['b8', 'credits', '17', 0, ['year2011']], ['end', 'credits', null, 0.3, []]];
const beats = BEATS.map(([id, card, sb, hold, facts, blocked]) => { const raw = sb ? SB[sb] : null; if (sb && !raw) throw new Error('storyboard row ' + sb + ' has no narration'); facts.forEach(k => { if (!SPEC[k]) throw new Error(id + ' names unknown fact ' + k); });
  return { id, card, cards: card.startsWith('REC:') ? null : card.split('+'), rec: card.startsWith('REC:') ? card.slice(4) : null, hold: hold || null, text: raw, facts, blocked: blocked || null }; });
// seconds-share of each still of a cross-faded beat (the first still carries the opening line)
const WEIGHTS = { b0c: [2, 3, 3, 4], b3a: [1, 1], b3b: [1, 1] };
module.exports = { beats, SPEC, WEIGHTS };
