// ⚠ DO NOT REMOVE — Scope: writes facts.spec.v3.json for the PUBLIC cut of "Terms you can check" v3 (script_en_v3_public.md). Same rule as make_spec.js: no value typed; each fact = log + regex + group. Old-spec facts are PICKED BY ID from facts.spec.json (v1/v2 inputs untouched). Env G2=pass adds the fresh-copy fact, G3=1 adds the 1,000-till fact; either fails the resolve if its log line is absent (no fallback value). READ THE LOG: out_v3/resolve.log.
'use strict';
const fs = require('fs'), path = require('path');
const old = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.spec.json'), 'utf8')).facts, F = [];
['n10', 'n100', 'n1000', 'star_limits', 'bytes10', 'bytes100', 'kb10', 'mb100', 'gov_name', 'gov_mit', 'gov_while'].forEach(id => { const f = old.find(x => x.id === id); if (!f) throw new Error('old fact missing ' + id); F.push(f); });
const B = 'build/scriptor/', R = B + 'terms_postSeal/runner.log', N = B + 'terms_postSeal_neg/neg_seal.out', S = B + 'terms_postSeal/witness_read_scope.log', S10 = B + 'read_scope_20261031/scale_10.log', S100 = B + 'read_scope_20261031/scale_100.log', G = B + 'gaps_49_1/g4_GREEN.log', FW = 'prompts/TEAMWORK_FRAMEWORK.md', EXE = B + 'terms_run/witness_comm_executors.log';
const add = (id, log, regex, group, extra) => F.push(Object.assign({ id, log, regex, group: group || 1 }, extra || {})), flag = (id, log, re) => add(id, log, re, 0, { kind: 'flag' });
add('v3_enforced', R, '§TERMS_VERDICT PASS enforced=(\\d+)'); add('v3_open', R, '§TERMS_VERDICT PASS enforced=\\d+ open=(\\d+)'); add('v3_word', R, '§TERMS_VERDICT (PASS)');
const nr = '^RELAY \\(sealing\\) \\| [A-Z+]+ \\| (\\d+)/(\\d+) refused \\| UNCONTROLLED'; add('neg_found', N, nr, 1); add('neg_tot', N, nr, 2); add('neg_word', N, '§TERMS_VERDICT (FAIL)');
add('rs_downloaded', S, '§RS-A Y \\(a modified client .*opens \\d+ of the (\\d+) laned ops of X'); add('rs_opened', S, '§RS-A Y \\(a modified client .*opens (\\d+) of the \\d+ laned ops of X'); add('rs_ctl_opened', S, '§RS-A CONTROL: .* - opened=(\\d+)/\\d+'); add('rs_ctl_tot', S, '§RS-A CONTROL: .* - opened=\\d+/(\\d+)');
flag('rs_office', S, '§RS-I office mesh: relay shape equals the F1 engine');
add('sc10', S10, '§STAR-EDGE-V1 s:0 \\{.*?"bytes_down":(\\d+)'); add('sc100', S100, '§STAR-EDGE-V1 s:0 \\{.*?"bytes_down":(\\d+)');
add('gh_gap_mid', G, '§RSGH-G the relay withholds X\'s MIDDLE .* gaps\\(\\) = exactly its box seq\\(s\\) \\[(\\d+)\\]'); add('gh_gap_last', G, '§RSGH-G the relay withholds X\'s LAST bundle -> reported from X\'s signed head `boxes`: \\[(\\d+)\\]'); add('gh_word', G, '§RSGH_VERDICT (PASS)');
flag('gh_ctl_flag', G, '§RSGH-G CONTROL \\(engine without `box`, same middle withholding over GitHub\\): gaps\\(\\) = \\[\\]');
// envelope labels on the beat-4 shelf: the box sequence numbers of the bundles X sent, from the log line "box seqs per bundle=[[1,2],[3],[4],[5]]"
for (let i = 1; i <= 5; i++) add('env' + i, G, '§RSGH bundles of X under m/hub/ on GitHub=\\d+ box seqs per bundle=\\[\\[(\\d+),(\\d+)\\],\\[(\\d+)\\],\\[(\\d+)\\],\\[(\\d+)\\]\\]', i);
flag('refuse_every', EXE, 'its status op is REFUSED \\(?not-executor\\)? on EVERY device');
flag('lim_meta', FW, '\\*\\*Residuals \\(stated\\):\\*\\* relay metadata visible'); flag('r3_not_done', FW, 'a fresh-clone run on another machine has not been done');
if (process.env.G2 === 'pass') add('g2_pass', B + 'gaps_49_1/g2_stranger.log', '§DE_VERDICT (PASS)');
if (process.env.G3 === '1') add('sc1000', B + 'gaps_49_1/g3_scale_1000.log', '§STAR-EDGE-V1 s:0 \\{.*?"bytes_down":(\\d+)');
fs.mkdirSync(path.join(__dirname, 'out_v3'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'facts.spec.v3.json'), JSON.stringify({ _scope: 'Public cut v3', facts: F }, null, 1)); console.log('§SPEC_V3 facts=' + F.length);
