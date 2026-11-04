// ⚠ DO NOT REMOVE — Scope: the LIVE facts of "uniCenta POS, reborn": every number the voice says that the recording re-derives must equal the §TILLFILM_FACT the recorder printed from the live in-browser DB (and, where a log value exists, that log's value).
// A LIVE fact with no printed line is INCONCLUSIVE, never PASS. READ THE LOG: node livecheck.js out/rec/film.log > out/livecheck.log
'use strict';
const fs = require('fs'), path = require('path'); const R = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'facts.resolved.json'), 'utf8'));
const L = {}; fs.readFileSync(process.argv[2] || 'out/rec/film.log', 'utf8').split('\n').forEach(l => { const m = /^§TILLFILM_FACT (\S+?)=(.*)$/.exec(l); if (m) L[m[1]] = m[2]; });
const fx = k => R[k] && R[k].value;
// [live key, expected (string), what the voice says / its log twin]
const CK = [['tills', '3', 'three tills'], ['sale_lines', '4', 'two rose bushes + hoe + chair = four units'], ['relay_day', fx('day_requests'), 'zero till requests while selling (§26.R twin)'], ['z_equal', 'true', 'statement gross == sum of the three Z'],
  ['eoda_send', '1', 'one hub-lane put for the send'], ['recv_target', fx('recv_target'), 'five sent'], ['recv_confirmed', fx('recv_conf'), 'three arrived'], ['recv_scrapped', fx('recv_scrap'), 'one scrapped'],
  ['src_before', fx('src_before'), 'twenty'], ['src_after', fx('src_after'), 'fifteen'], ['tgt_before', fx('tgt_before'), 'four'], ['tgt_after', fx('tgt_after'), 'six'],
  ['tap_deposits', fx('rest_tap_writes'), 'tapping items writes nothing (§32.R twin)'], ['leave_deposits', fx('rest_open_writes'), 'one write per table visit (§32.R twin)'], ['prices_total', String(+fx('soda_other') + 1), 'twenty-six others = 27 - 1'], ['parity_rows', fx('parity_n'), 'twenty-five of twenty-five (§32.R twin)']];
let fail = 0, inc = 0;
CK.forEach(([k, want, why]) => { if (L[k] === undefined) { inc++; console.log('§LIVE ' + k + ' INCONCLUSIVE no §TILLFILM_FACT printed (' + why + ')'); return; } const ok = L[k] === String(want); if (!ok) fail++; console.log('§LIVE ' + k + ' ' + (ok ? 'OK' : 'FAIL') + ' live=' + L[k] + ' want=' + want + ' (' + why + ')'); });
const extra = [['chairs_drawn', v => +v > 0, 'W-REST-FLOOR: chairs drawn'], ['sale_total', v => +v > 0, 'sample sale total']]; extra.forEach(([k, f, why]) => { if (L[k] === undefined) { inc++; console.log('§LIVE ' + k + ' INCONCLUSIVE'); return; } const ok = f(L[k]); if (!ok) fail++; console.log('§LIVE ' + k + ' ' + (ok ? 'OK' : 'FAIL') + ' live=' + L[k] + ' (' + why + ')'); });
console.log('§LIVE_VERDICT ' + (fail ? 'FAIL fails=' + fail : inc ? 'INCONCLUSIVE missing=' + inc : 'PASS') + ' checked=' + (CK.length + extra.length)); process.exit(fail ? 1 : 0);
