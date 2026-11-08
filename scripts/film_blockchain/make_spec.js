// ⚠ DO NOT REMOVE — Scope: facts for the film "'Blockchain' ERP" (bim-compiler prompts/TEAMWORK_FRAMEWORK.md §52.3). No value is typed here: each fact = a witness log + regex + group,
// resolved and frozen (with each source's sha256) by ../film_terms/resolve.js. READ THE LOG after any change to a source log. Run: node make_spec.js && SPEC=facts.spec.json RESOLVED_OUT=facts.resolved.json node ../film_terms/resolve.js
'use strict';
const fs = require('fs'), path = require('path'), F = [];
const B = 'build/scriptor/', G = B + 'film_bc_main_20261101/restore_drill_main.log', R = B + 'self_restore_20261101/RED.log', P = B + 'power_cut_20261101/RED.log';
const add = (id, log, regex, group, extra) => F.push(Object.assign({ id, log, regex, group: group || 1 }, extra || {}));
add('rd_verdict', G, '§RD_VERDICT (PASS) judged=\\d+'); add('rd_judged', G, '§RD_VERDICT PASS judged=(\\d+)');
add('relay_n', G, '§RD-R1 .* ops (\\d+)/\\d+'); add('relay_tot', G, '§RD-R1 .* ops \\d+/(\\d+)');
add('box_n', G, '§RD-R2 .* ops (\\d+)/\\d+'); add('box_tot', G, '§RD-R2 .* ops \\d+/(\\d+)');
add('hub_n', G, '§RD-S1 SELF-REBUILD: the hub .* ops (\\d+)/\\d+'); add('hub_tot', G, '§RD-S1 SELF-REBUILD: the hub .* ops \\d+/(\\d+)');
add('hub_before', R, '§RD-S1 SELF-REBUILD: the hub .* ops (\\d+)/\\d+');
add('st_n', G, '§RD-S1 SELF-REBUILD: station 1 .* ops (\\d+)/\\d+'); add('st_tot', G, '§RD-S1 SELF-REBUILD: station 1 .* ops \\d+/(\\d+)');
add('fork_after', G, '§RD-S2 .* equivocations=(\\d+)'); add('fork_before', R, '§RD-S2 .* equivocations=(\\d+)');
add('gap_seq', G, '§RD-R3 .*"seq":(\\d+)'); add('gap_missing', G, '§RD-R3 it lacks exactly .* missing=(\\d+)');
add('sealed', G, '§RD-R5 .* sealed=(\\d+)'); add('tamper_restored', G, '§RD-CTL .* restored=(\\d+)');
add('unsent_in', G, '§LIMIT work authored but never relayed .*: (\\d+) of \\d+ unsent'); add('unsent_tot', G, '§LIMIT work authored but never relayed .*: \\d+ of (\\d+) unsent');
add('pc_erp', P, '§PC-E1 .*"appended":(\\d+)'); add('pc_erp_ms', P, '§PC-E1 .*kill at (\\d+) ms');
add('pc_bim_kept', P, '§LIMIT viewer kernel: one edit every 500 ms for 6 s, then a crash, leaves (\\d+) of \\d+'); add('pc_bim_tot', P, '§LIMIT viewer kernel: one edit every 500 ms for 6 s, then a crash, leaves \\d+ of (\\d+)');
fs.writeFileSync(path.join(__dirname, 'facts.spec.json'), JSON.stringify({ _scope: "'Blockchain' ERP film", facts: F }, null, 1)); console.log('§SPEC_BC facts=' + F.length);
