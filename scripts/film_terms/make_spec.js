// ⚠ DO NOT REMOVE — Scope: writes facts.spec.json for the film "Terms you can check" (TEAMWORK_FRAMEWORK §49). No value is typed: each fact names the log and the regex that extracts it; resolve.js reads the log. READ THE LOG out/resolve.log after every run.
'use strict';
const fs = require('fs'), path = require('path');
const B = 'build/scriptor/', T = B + 'terms_run/';
const L = { REC: B + 'witness_terms_record_20261031.log', MUT: B + 'witness_terms_reuse_mutant_20261031.log', VIS: T + 'witness_terms_visit.log', EXE: T + 'witness_comm_executors.log', PTR: T + 'witness_comm_plantrust.log', WTE: T + 'witness_team_executors.log',
  D20: B + 'witness_docno_till_48_11d_D20.log', SO: B + 'uservalue_48_11d/witness_team_so.log', SB: B + 'seatbelt_48_13/witness_team_so.log', JS: B + 'terms_run_record.json', FW: 'prompts/TEAMWORK_FRAMEWORK.md',
  S10: B + 'witness_scale_star_engine_10.log', S100: B + 'witness_scale_star_engine_100.log', S1000: B + 'witness_scale_star_engine_1000.log' };
const F = []; const add = (id, log, regex, group, extra) => F.push(Object.assign({ id, log, regex, group: group || 1 }, extra || {}));
const esc = s => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
// beat 1 — lexicon (the doc's own table)
['RELAY', 'LEDGER', 'BUNDLE', 'VISIT', 'ACK', 'STATEMENT'].forEach(w => { add('lex_' + w.toLowerCase() + '_def', L.FW, '^\\| ' + w + ' \\| ([^|]+) \\| "([^"]+)" \\|', 1); add('lex_' + w.toLowerCase() + '_say', L.FW, '^\\| ' + w + ' \\| ([^|]+) \\| "([^"]+)" \\|', 2); });
add('lex_n', L.FW, '^\\| (?:RELAY|LEDGER|BUNDLE|VISIT|ACK|STATEMENT) \\| ', 0, { kind: 'count' });
// beat 2 — the runner
add('ver_enforced', L.REC, '§TERMS_VERDICT PASS enforced=(\\d+)'); add('ver_open', L.REC, '§TERMS_VERDICT PASS enforced=\\d+ open=(\\d+)'); add('ver_browser', L.REC, '§TERMS_VERDICT PASS .*browser=judged (\\d+)/');
add('ver_word', L.REC, '§TERMS_VERDICT (PASS)');
['VISIT (bounded)', 'RELAY (sealing)', 'trusted keys (roles + threshold)'].forEach((n, i) => add('open' + i + '_term', L.REC, '^(' + esc(n) + ') \\| - \\| - \\| OPEN'));
['LEDGER signed / STATEMENT', 'trusted keys', 'STATEMENT (rule in force)', 'BUNDLE (Complete)', 'LEDGER convergent', 'VISIT (offline / interrupted)', 'VISIT (voluntary, once)', 'ACK', 'BUNDLE (version skew)', 'LOCAL NUMBERING (LEDGER)'].forEach((n, i) => {
  const r = '^(' + esc(n) + ') \\| [A-Z+]+ \\| (\\d+)/(\\d+) refused \\| ENFORCED'; add('enf' + i + '_term', L.REC, r, 1); add('enf' + i + '_ok', L.REC, r, 2); add('enf' + i + '_tot', L.REC, r, 3); });
add('mut_found', L.MUT, '^BUNDLE \\(Complete\\) \\| [A-Z+]+ \\| (\\d+)/\\d+ refused \\| UNCONTROLLED'); add('mut_tot', L.MUT, '^BUNDLE \\(Complete\\) \\| [A-Z+]+ \\| \\d+/(\\d+) refused \\| UNCONTROLLED');
add('mut_missing', L.MUT, 'control NOT FOUND: (.+)$'); add('mut_word', L.MUT, '§TERMS_VERDICT (FAIL)'); add('mut_uncontrolled', L.MUT, '§TERMS_VERDICT FAIL .*uncontrolled=(\\d+)'); add('mut_exit1', L.MUT, '^exit=(1)$');
// beat 3 — Visit
add('vis_unsent', L.VIS, 'a dead pipe: every claim still held locally, none marked sent — unsent=(\\d+)'); add('vis_sent_later', L.VIS, 'the later Visit sends every held claim — sent=(\\d+)'); add('vis_third', L.VIS, 'a third Visit sends nothing \\(once only\\) — sent=(\\d+)');
add('vis_nothing', L.VIS, 'nothing reached the shared place', 0, { kind: 'flag' });
add('liar_rbf', L.VIS, 'liar pipe: sent=\\d+ readBackFail=(\\d+)'); add('liar_sent', L.VIS, 'liar pipe: sent=(\\d+) readBackFail='); add('vis_judged', L.VIS, '§VISIT_VERDICT PASS judged=(\\d+)'); add('vis_fails', L.VIS, '§VISIT_VERDICT PASS judged=\\d+ fails=(\\d+)');
// beat 4 — refusal
add('ex_devices', L.EXE, 'MERGED on all (\\d+) devices'); add('ex_reason', L.EXE, 'its status op is REFUSED (not-executor) on EVERY device'); add('ex_reason_group', L.EXE, 'REFUSED (not-executor-group) everywhere'); add('ex_ghost', L.EXE, 'ghost=(\\d+)'); add('ex_judged', L.EXE, '§EXE_VERDICT PASS judged=(\\d+)'); add('ex_fails', L.EXE, '§EXE_VERDICT PASS judged=\\d+ fails=(\\d+)');
add('pt_sig', L.PTR, 'REFUSED:(plan-trust-signature) on both devices'); add('pt_backup', L.PTR, 'the BACKUP signs \\[K1,K3\\] \\(primary dropped, lost-key recovery\\): MERGED', 0, { kind: 'flag' }); add('pt_judged', L.PTR, '§PLANTRUST_VERDICT PASS judged=(\\d+)'); add('pt_fails', L.PTR, '§PLANTRUST_VERDICT PASS judged=\\d+ fails=(\\d+)');
add('x7_before', L.WTE, 'not-executor verdicts (\\d+) -> \\d+'); add('x7_after', L.WTE, 'not-executor verdicts \\d+ -> (\\d+)'); add('wx_judged', L.WTE, '§WX_VERDICT PASS judged=(\\d+) fails=0'); add('wx_fails', L.WTE, '§WX_VERDICT PASS judged=\\d+ fails=(\\d+)'); add('wx_mut', L.WTE, 'mutants_killed=(\\d+)/\\d+');
add('x7_unchanged', L.WTE, 'and the order on A is unchanged', 0, { kind: 'flag' });
add('x9_stays', L.WTE, 'X9 after the map \\{\\} the SET_STATUS the station was refused on STAYS refused', 0, { kind: 'flag' });
// beat 5/6 — numbering
['a', 'b', 'c'].forEach((k, i) => add('clash_' + k, L.D20, 'PASS D5 .*clash=\\["(\\d+)","(\\d+)","(\\d+)"\\]', i + 1));
['order', 'invoice', 'shipment', 'payment'].forEach((k, i) => add('d9_' + k, L.D20, 'PASS D9 .*:: \\{"order":"([^"]+)","invoice":"([^"]+)","shipment":"([^"]+)","payment":"([^"]+)"\\}', i + 1));
add('d10_none', L.D20, 'PASS D10 .*shared=\\[\\]', 0, { kind: 'flag' }); add('d10_types', L.D20, 'no shared number on any of the (\\d+) doc types');
add('forged_doc', L.D20, '§TEAM_DOCNO_REFUSED docno-station documentno=(HQ-joesales-\\d+) expected prefix (HQ-gardenusr-)', 1); add('forged_prefix', L.D20, '§TEAM_DOCNO_REFUSED docno-station documentno=HQ-joesales-\\d+ expected prefix (HQ-gardenusr-)', 1);
add('forged_devices', L.D20, '§DT-FOLD honest=.*?forged=((?:REFUSED:docno-station ?)+)', 1, { kind: 'count', of: 'REFUSED:docno-station' });
add('d20_pos', L.D20, 'PASS D20 .*positions=(\\d+) keys='); add('d20_legacy', L.D20, '§DT-LEGACY-STATION plan=\\S+ legacy=(\\S+) twin='); add('d20_twin', L.D20, '§DT-LEGACY-STATION plan=\\S+ legacy=\\S+ twin=(\\S+) \\|');
add('d19_num', L.D20, 'PASS D19 .*number=(HQ-gardenad-\\d+)'); add('dt_inconc', L.D20, '§DT_VERDICT PASS judged=\\d+ fails=0 inconclusive=(\\d+) \\(legacy arm\\)');
add('page_order', L.SO, 'c_order (HQ-gardenad-\\d+) \\('); add('page_judged', L.SO, '§W-TEAM-SO PASS judged=(\\d+) fails=0 inconclusive=0 pageerrors=0');
// beat 7 — the buttons
add('rec_rows', L.JS, '', 0, { kind: 'cmd', command: "node -e \"const d=JSON.parse(require('fs').readFileSync('" + L.JS + "','utf8'));console.log(d.rows.length)\"", regex: '^(\\d+)$' });
add('rec_enf', L.JS, '', 0, { kind: 'cmd', command: "node -e \"const d=JSON.parse(require('fs').readFileSync('" + L.JS + "','utf8'));console.log(d.rows.filter(r=>r.status==='ENFORCED').length)\"", regex: '^(\\d+)$' });
add('rec_open', L.JS, '', 0, { kind: 'cmd', command: "node -e \"const d=JSON.parse(require('fs').readFileSync('" + L.JS + "','utf8'));console.log(d.rows.filter(r=>r.status==='OPEN').length)\"", regex: '^(\\d+)$' });
add('sb_rows', L.SB, '\\] §TEAM_SEATBELT open verdict=ADVISE advise=\\S+ (.*)$', 1, { kind: 'count', of: 'S\\d=' }); add('sb_advise', L.SB, '\\] §TEAM_SEATBELT open verdict=ADVISE advise=\\S+ (.*)$', 1, { kind: 'count', of: '=ADVISE' });
add('sb_s7', L.SB, '"id":"S7","st":"ADVISE","t":"S7(changed by another device)ADVISE'); add('sb_s3', L.SB, '"id":"S3","st":"OK","t":"S3(unsent changes)', 1); add('sb_s9', L.SB, '"id":"S9","st":"ADVISE","t":"S9(local numbering)ADVISE'); add('sb_word', L.SB, '\\] §TEAM_SEATBELT open verdict=(ADVISE)');
add('sb_went_ahead', L.SB, '\\(advisory: (the DocAction went ahead)\\)');
// beat 8 — not promised
add('open0_what', L.JS, '"id": "visit-bounded"[\\s\\S]*?"guarantee": "([^"]+)"'); add('open1_what', L.JS, '"id": "sealing-real"[\\s\\S]*?"guarantee": "([^"]+)"'); add('open2_what', L.JS, '"id": "key-roles-threshold"[\\s\\S]*?"guarantee": "([^"]+)"');
add('open0_fix', L.REC, '^VISIT \\(bounded\\) \\| - \\| - \\| OPEN \\| TEAMWORK §[\\d.]+ F\\d (per-device mailboxes)'); add('open1_state', L.REC, '^RELAY \\(sealing\\) .*\\((simulator PASS only, real comm layer untouched)\\)');
add('visit_only_engine', L.REC, 'ENFORCED \\[engine only \\(no browser witness located\\)\\]', 0, { kind: 'count' });
[['10', 'S10'], ['100', 'S100'], ['1000', 'S1000']].forEach(([n, k]) => { add('n' + n, L[k], '§STAR-POINT \\{"n":(' + n + '),"m"'); add('bytes' + n, L[k], '§STAR-EDGE-V1 s:0 \\{[^}]*"bytes_down":(\\d+)'); });
F.push({ id: 'kb10', kind: 'derive', of: 'bytes10', div: 1000, dp: 0 }, { id: 'mb100', kind: 'derive', of: 'bytes100', div: 1e6, dp: 1 }, { id: 'mb1000', kind: 'derive', of: 'bytes1000', div: 1e6, dp: 1 }, { id: 'mb1000r', kind: 'derive', of: 'bytes1000', div: 1e6, dp: 0 });
add('star_limits', L.S1000, '§STAR-LIMITS one Node process family simulates all devices \\(no network latency, no browser\\)', 0, { kind: 'flag' });
add('gov_mit', L.FW, '(A clone is free under MIT); it inherits the objectives only while its own terms run still passes'); add('gov_while', L.FW, 'A clone is free under MIT; it inherits the objectives (only while its own terms run still passes) with no control weakened');
add('gov_name', L.FW, '\\*\\*Name:\\*\\* "(Project quality objectives)"');
fs.writeFileSync(path.join(__dirname, 'facts.spec.json'), JSON.stringify({ _scope: 'Film "Terms you can check": every fact = log file + regex + group; nothing typed. derive = arithmetic on another fact (div, dp).', facts: F }, null, 1));
console.log('§SPEC_WRITTEN facts=' + F.length);
