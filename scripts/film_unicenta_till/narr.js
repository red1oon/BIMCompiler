// ⚠ DO NOT REMOVE — Scope: the beats of "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34). Narration = script_en.md VERBATIM; every number word spoken is declared here as a fact key (facts.spec.json). READ THE LOG of every run.
'use strict';
const fs = require('fs'), path = require('path');
const SB = {}; fs.readFileSync(path.join(__dirname, 'script_en.md'), 'utf8').split('\n').forEach(l => { const m = /^\| (\d+) \|.*\| "(.*)" \|\s*$/.exec(l); if (m) SB[m[1]] = m[2]; });
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.spec.json'), 'utf8')); delete SPEC._note;
// [id, card (a plain card name, a chapter card, or 'REC:<segment>' = a recorded clip), storyboard row (null = silent), hold seconds (silent), facts, blockedBy]
const BEATS = [
  ['b0a', 'before', '1', 0, ['year2012']], ['b0b', 'after', '2', 0, []],
  ['c1', 'ch1', null, 3.6, []], ['b1a', 'REC:know', '3', 0, ['parity_n', 'parity_of']], ['b1b', 'REC:sale', '4', 0, ['sale_lines', 'sale_total']], ['b1c', 'REC:fold', '5', 0, [], 'W-TILL-CATALOG-TOGGLE'],
  ['c2', 'ch2', null, 3.6, []], ['b2a', 'REC:floor', '6', 0, []], ['b2b', 'REC:bump', '7', 0, ['rest_open_writes', 'rest_tap_writes', 'relay_order', 'lines_lo', 'lines_hi'], 'W-REST-FLOOR (chairs drawn)'],
  ['c3', 'ch3', null, 3.6, []], ['b3a', 'REC:tills', '8', 0, ['tills', 'day_requests', 'relay_day']], ['b3b', 'REC:admin', '9', 0, ['tills', 'z_equal', 'eoda_send']],
  ['c4', 'ch4', null, 3.6, []], ['b4a', 'REC:close', '10', 0, []], ['b4b', 'gs', '11', 0, ['dc_before_g', 'dc_before_s', 'dc_after_g', 'dc_after_s', 'dc_rowdiff', 'bom_a', 'bom_b', 'bom_c']],
  ['c5', 'ch5', null, 3.6, []], ['b5a', 'REC:price', '12', 0, ['soda_one', 'soda_other', 'soda_prices']], ['b5b', 'REC:receive', '13', 0, ['recv_target', 'recv_conf', 'recv_scrap', 'src_before', 'src_after', 'tgt_before', 'tgt_after'], 'W-RECEIVE-UI (§33.4 typed panel)'],
  ['c6', 'ch6', null, 3.6, []], ['b6', 'match', '14', 0, ['par_items', 'par_hdr', 'par_line']],
  ['b7', 'notyet', '15', 0, ['open_count', 'open_dec', 'open_dec2']], ['b8', 'credits', '16', 0, ['year2012']], ['end', 'credits', null, 0.3, []]];
const beats = BEATS.map(([id, card, sb, hold, facts, blocked]) => { const raw = sb ? SB[sb] : null; if (sb && !raw) throw new Error('storyboard row ' + sb + ' has no narration'); facts.forEach(k => { if (!SPEC[k]) throw new Error(id + ' names unknown fact ' + k); });
  return { id, card, rec: card.startsWith('REC:') ? card.slice(4) : null, hold: hold || null, text: raw, facts, blocked: blocked || null }; });
module.exports = { beats, SPEC };
