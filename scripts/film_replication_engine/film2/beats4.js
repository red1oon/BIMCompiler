// ⚠ DO NOT REMOVE — Scope: the beat list of Film 2 v2 (under-the-hood cut): every beat is a full-screen card. `read` = the least seconds a card is held; the narration measurement (BEAT_MIN) lengthens it. No trace, no replayed day.
'use strict';
const BEATS = [['title', 6], ['wall', 8], ['c1', 12], ['c2', 11], ['c3', 13], ['c4', 12], ['c5', 12], ['c6', 14], ['d_tables', 10], ['d_source', 12], ['d_edges', 11], ['d_orderline', 12], ['d_computed', 11], ['d_honest', 11],
  ['r_strategy', 11], ['r_row', 11], ['r_zero', 12], ['r_bloat', 11], ['u_code', 16], ['u_chain', 16], ['u_probes', 16], ['u_erp', 16], ['u_ledger', 14], ['u_engine', 14], ['u_why', 10], ['u_next', 14], ['limits', 18], ['src1', 9], ['src2', 10]].map(([id, read]) => ({ id, card: id, read }));
module.exports = { BEATS };
