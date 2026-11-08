<!-- ⚠ DO NOT REMOVE — Scope: facts for the v4 DEVELOPER cut (script_en_v4_dev.md), 2026-11-01, DRAFT, nothing built. Each row: value, source (repo-root relative), JS regex (resolve.js semantics: first match, m flag, group), and the matched text. Verified: all 100 rows resolved with the real scripts/film_terms/resolve.js on a scratch spec (SPEC= / RESOLVED_OUT= in the scratchpad): 100 facts resolved, none missing. A pipe in the regex is written \| for markdown. READ THE LOGS. -->
# Facts for v4 (developer cut)

## New source logs made for this film (reproducible)
- `scripts/film_terms/repo_facts_v4.sh` writes `build/scriptor/film_v4/repo_facts.log`: line counts and file counts at the PINNED commits (BIMCompiler ca532b065, bim-ootb 6a8023a5) via `git show <pin>:<file> | wc -l`, the 14 code excerpts shown on screen (`§REPO_EXCERPT <repo>@<pin> <file>:<line> <text>`, from `git show <pin>:<file> | sed -n '<l>p'`), and two grep counts. The guard compares each on-screen excerpt with these lines.
- `build/scriptor/film_v4/equivalent_mutant_repro.log`: the equivalent mutant REPRODUCED (witness_cache.js, witness_trace.js and witness_witness_cache.js copied to build/scriptor/film_v4/eqm/, the table cut to the single original needle `wrap(fs, 'readFileSync', readOf(1));` -> empty, run with `--real 0`). Result: `needle_count=1 -> red=none (expected M2)`: the mutant applied once and nothing went red.
- `build/scriptor/film_v4/pr_2487.json`, `pr_2488.json`: `gh pr view <n> -R red1oon/bim-ootb --json number,title,body,mergedAt`.
- `build/scriptor/film_v4/lkml_2000_08_25_132.html` is EMPTY: lkml.org refused the fetch (Anubis "Access Denied"). See the quote note in the script.

## Facts
| id | value | source log | regex | matched text |
|---|---|---|---|---|
| b1_station_refused | true | `build/scriptor/terms_run/witness_comm_executors.log` | `a STATION completes an order it created: its status op is REFUSED not-executor on EVERY device` (flag) | `a STATION completes an order it created: its status op is REFUSED not-executor on EVERY device` |
| b1_hq_merged | true | `build/scriptor/terms_run/witness_comm_executors.log` | `HQ \(the executor\) completes its order: the status op and its consequence are MERGED on every device` (flag) | `HQ (the executor) completes its order: the status op and its consequence are MERGED on every device` |
| b1_ctl_merged | true | `build/scriptor/terms_run/witness_comm_executors.log` | `CONTROL: a table with no entry in the map \(m_movement\) — the station's status op is MERGED as today` (flag) | `CONTROL: a table with no entry in the map (m_movement) — the station's status op is MERGED as today` |
| b1_ok | 3 | `build/scriptor/terms_postSeal/runner.log` | `^BUNDLE \(Complete\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g1 | `BUNDLE (Complete) \| PASS+PASS \| 3/3 refused \| ENFORCED` |
| b1_tot | 3 | `build/scriptor/terms_postSeal/runner.log` | `^BUNDLE \(Complete\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g2 | `BUNDLE (Complete) \| PASS+PASS \| 3/3 refused \| ENFORCED` |
| b1_mut_found | 2 | `build/scriptor/witness_terms_reuse_mutant_20261031.log` | `^BUNDLE \(Complete\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| UNCONTROLLED` g1 | `BUNDLE (Complete) \| PASS+PASS \| 2/3 refused \| UNCONTROLLED` |
| b1_mut_tot | 3 | `build/scriptor/witness_terms_reuse_mutant_20261031.log` | `^BUNDLE \(Complete\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| UNCONTROLLED` g2 | `BUNDLE (Complete) \| PASS+PASS \| 2/3 refused \| UNCONTROLLED` |
| neg_found | 8 | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `^RELAY \(sealing\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| UNCONTROLLED` g1 | `RELAY (sealing) \| PASS+PASS \| 8/9 refused \| UNCONTROLLED` |
| neg_tot | 9 | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `^RELAY \(sealing\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| UNCONTROLLED` g2 | `RELAY (sealing) \| PASS+PASS \| 8/9 refused \| UNCONTROLLED` |
| neg_status | UNCONTROLLED | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `\\| (UNCONTROLLED) \[` g1 | `\| UNCONTROLLED [` |
| neg_missing | CONTROL team key only: the same member opens all of it | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `control NOT FOUND: (.+)$` g1 | `control NOT FOUND: CONTROL team key only: the same member opens all of it` |
| neg_word | FAIL | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `§TERMS_VERDICT (FAIL)` g1 | `§TERMS_VERDICT FAIL` |
| neg_uncontrolled | 1 | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `§TERMS_VERDICT FAIL .*uncontrolled=(\d+)` g1 | `§TERMS_VERDICT FAIL enforced=0 open=0 witness_failed=0 uncontrolled=1` |
| m_needle1 | 1 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-MUT M1 "laned ops sealed with the space key" needle_count=(\d+)` g1 | `§RS-MUT M1 "laned ops sealed with the space key" needle_count=1` |
| m_killed | 9 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_MUTANTS killed=(\d+)/` g1 | `§RS_MUTANTS killed=9/` |
| m_tot | 9 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_MUTANTS killed=\d+/(\d+)` g1 | `§RS_MUTANTS killed=9/9` |
| m_crash_rule | true | `scripts/witness_witness_cache.js` | `a crash is not a kill` (flag) | `a crash is not a kill` |
| m_once_rule | true | `scripts/witness_witness_cache.js` | `needle_count=' \+ n \+ ' \(must be 1\): NOT applied, not a kill` (flag) | `needle_count=' + n + ' (must be 1): NOT applied, not a kill` |
| eq_needle | 1 | `build/scriptor/film_v4/equivalent_mutant_repro.log` | `§WC-MUT "readFileSync not traced[^"]*" needle_count=(\d+) -> red=none` g1 | `§WC-MUT "readFileSync not traced (the ORIGINAL mutant, reproduced 2026-11-01)" needle_count=1 -> red` |
| eq_red | none | `build/scriptor/film_v4/equivalent_mutant_repro.log` | `§WC-MUT "readFileSync not traced[^"]*" needle_count=\d+ -> red=(none)` g1 | `§WC-MUT "readFileSync not traced (the ORIGINAL mutant, reproduced 2026-11-01)" needle_count=1 -> red` |
| eq_word | (expected M2) | `build/scriptor/film_v4/equivalent_mutant_repro.log` | `§WC-MUT "readFileSync not traced[^"]*" .*(\(expected M2\))` g1 | `§WC-MUT "readFileSync not traced (the ORIGINAL mutant, reproduced 2026-11-01)" needle_count=1 -> red` |
| tt_crash | true | `build/scriptor/film_v4/pr_2487.json` | `W-TT fixed for a record with no OPEN row` (flag) | `W-TT fixed for a record with no OPEN row` |
| stale_limit | true | `build/scriptor/film_v4/pr_2488.json` | `still said a withheld mailbox bundle shows as a parked op, not a gap` (flag) | `still said a withheld mailbox bundle shows as a parked op, not a gap` |
| nat_cached | true | `build/scriptor/witness_cache/RED_native.log` | `§WC-M8 .* after-change cached=(true)` g1 | `§WC-M8 a database opened through better-sqlite3 (native code, outside Node fs) is an input: unchange` |
| nat_marker | N1 | `build/scriptor/witness_cache/RED_native.log` | `§WC-M8 .* §FXN (N1)` g1 | `§WC-M8 a database opened through better-sqlite3 (native code, outside Node fs) is an input: unchange` |
| nat_fixed | false | `build/scriptor/witness_cache/GREEN_native.log` | `§WC-M8 .* after-change cached=(false)` g1 | `§WC-M8 a database opened through better-sqlite3 (native code, outside Node fs) is an input: unchange` |
| r1_portable | 13 | `build/scriptor/dev_env/runner1.log` | `§TERMS_PORTABLE rows=\d+ portable=(\d+)` g1 | `§TERMS_PORTABLE rows=13 portable=13` |
| r1_untracked | 0 | `build/scriptor/film_v4/repo_facts.log` | `§RUNNER1_UNTRACKED_LINES (\d+)` g1 | `§RUNNER1_UNTRACKED_LINES 0` |
| un_terms | 6 | `build/scriptor/film_v4/repo_facts.log` | `§RUNNER2_UNTRACKED_MISSING (\d+)` g1 | `§RUNNER2_UNTRACKED_MISSING 6` |
| un_db | build/erp/ad_full.db | `build/scriptor/dev_env/runner2.log` | `§UNTRACKED \S+ BIMCompiler/(build/erp/ad_full\.db) kind=untracked why=(gitignored)` g1 | `§UNTRACKED trusted-keys BIMCompiler/build/erp/ad_full.db kind=untracked why=gitignored` |
| un_why | gitignored | `build/scriptor/dev_env/runner2.log` | `§UNTRACKED \S+ BIMCompiler/build/erp/ad_full\.db kind=untracked why=(gitignored)` g1 | `§UNTRACKED trusted-keys BIMCompiler/build/erp/ad_full.db kind=untracked why=gitignored` |
| de_bytes | 44937216 | `build/scriptor/dev_env/publish_ad_full.log` | `bytes=(\d+) sha=` g1 | `bytes=44937216 sha=` |
| de_mb | 45 | - | derive de_bytes / 1000000, 0 dp |  |
| de_sha | 179cd349cedb | `build/scriptor/dev_env/publish_ad_full.log` | `bytes=\d+ sha=(\w+) ->` g1 | `bytes=44937216 sha=179cd349cedb ->` |
| de_back | true | `build/scriptor/dev_env/publish_ad_full.log` | `fetched back, sha matches` (flag) | `fetched back, sha matches` |
| pt_before | 7 | `build/scriptor/dev_env/runner2.log` | `§TERMS_PORTABLE rows=\d+ portable=(\d+) not_portable=\d+` g1 | `§TERMS_PORTABLE rows=13 portable=7 not_portable=6` |
| pt_rows | 13 | `build/scriptor/dev_env/GREEN_real.log` | `§TERMS_PORTABLE rows=(\d+)` g1 | `§TERMS_PORTABLE rows=13` |
| pt_after | 13 | `build/scriptor/dev_env/GREEN_real.log` | `§TERMS_PORTABLE rows=\d+ portable=(\d+)` g1 | `§TERMS_PORTABLE rows=13 portable=13` |
| de_judged | 13 | `build/scriptor/dev_env/GREEN_real.log` | `§DE_VERDICT PASS judged=(\d+)` g1 | `§DE_VERDICT PASS judged=13` |
| de_mut | 4 | `build/scriptor/dev_env/GREEN_real.log` | `§DE_VERDICT PASS judged=\d+ fails=\d+ inconclusive=\d+ mutants=(\d+)/` g1 | `§DE_VERDICT PASS judged=13 fails=0 inconclusive=0 mutants=4/` |
| c_run1 | 269.4 | `build/scriptor/witness_cache/GREEN_full.log` | `§WC-R1 run1 ([\d.]+) s` g1 | `§WC-R1 run1 269.4 s` |
| c_run2 | 5.8 | `build/scriptor/witness_cache/GREEN_full.log` | `§WC-R1 run2 ([\d.]+) s` g1 | `§WC-R1 run2 5.8 s` |
| c_run1i | 269 | - | derive c_run1 / 1, 0 dp |  |
| c_run2i | 6 | - | derive c_run2 / 1, 0 dp |  |
| g1_run1 | 656.4 | `build/scriptor/gaps_49_1/g1_witness_cache_full.log` | `§WC-R1 run1 ([\d.]+) s` g1 | `§WC-R1 run1 656.4 s` |
| g1_run2 | 652.8 | `build/scriptor/gaps_49_1/g1_witness_cache_full.log` | `§WC-R1 run2 ([\d.]+) s` g1 | `§WC-R1 run2 652.8 s` |
| g1_run1i | 656 | - | derive g1_run1 / 1, 0 dp |  |
| g1_run2i | 653 | - | derive g1_run2 / 1, 0 dp |  |
| g1_ran | 9 | `build/scriptor/gaps_49_1/g1_witness_cache_full.log` | `§WC-R1 run2 .* ran=(\d+) cached=\d+ cache_skip=\d+` g1 | `§WC-R1 run2 652.8 s: §TERMS_VERDICT PASS enforced=13 open=0 witness_failed=0 uncontrolled=0 browser=` |
| g1_cached | 4 | `build/scriptor/gaps_49_1/g1_witness_cache_full.log` | `§WC-R1 run2 .* ran=\d+ cached=(\d+) cache_skip=\d+` g1 | `§WC-R1 run2 652.8 s: §TERMS_VERDICT PASS enforced=13 open=0 witness_failed=0 uncontrolled=0 browser=` |
| g1_skip | 9 | `build/scriptor/gaps_49_1/g1_witness_cache_full.log` | `§WC-R1 run2 .* cache_skip=(\d+)` g1 | `§WC-R1 run2 652.8 s: §TERMS_VERDICT PASS enforced=13 open=0 witness_failed=0 uncontrolled=0 browser=` |
| g1_judged | 25 | `build/scriptor/gaps_49_1/g1_witness_cache_full.log` | `§WC_VERDICT PASS judged=(\d+)` g1 | `§WC_VERDICT PASS judged=25` |
| g1_mut | 8 | `build/scriptor/gaps_49_1/g1_witness_cache_full.log` | `§WC_VERDICT PASS judged=\d+ fails=\d+ inconclusive=\d+ mutants=(\d+)/` g1 | `§WC_VERDICT PASS judged=25 fails=0 inconclusive=0 mutants=8/` |
| sk_git | true | `build/scriptor/dev_env/runner2.log` | `§CACHE_SKIP \S+ reason=non-node-child \(git\)` (flag) | `§CACHE_SKIP witness_comm_plantrust.js reason=non-node-child (git)` |
| sk_psql | true | `build/scriptor/dev_env/runner2.log` | `§CACHE_SKIP \S+ reason=non-node-child \(psql\)` (flag) | `§CACHE_SKIP witness_docno_till.js reason=non-node-child (psql)` |
| sk_sh | true | `build/scriptor/dev_env/runner2.log` | `§CACHE_SKIP \S+ reason=non-node-child \(sh\)` (flag) | `§CACHE_SKIP witness_f1_mailbox.js reason=non-node-child (sh)` |
| s_red_judged | 39 | `build/scriptor/read_scope_20261031/RED.log` | `§RS_SCOPE_VERDICT FAIL judged=(\d+)` g1 | `§RS_SCOPE_VERDICT FAIL judged=39` |
| s_red_fails | 13 | `build/scriptor/read_scope_20261031/RED.log` | `§RS_SCOPE_VERDICT FAIL judged=\d+ fails=(\d+)` g1 | `§RS_SCOPE_VERDICT FAIL judged=39 fails=13` |
| s_judged | 39 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_SCOPE_VERDICT PASS judged=(\d+)` g1 | `§RS_SCOPE_VERDICT PASS judged=39` |
| s_fails | 0 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_SCOPE_VERDICT PASS judged=\d+ fails=(\d+)` g1 | `§RS_SCOPE_VERDICT PASS judged=39 fails=0` |
| gh_opened | 0 | `build/scriptor/gaps_49_1/g4_GREEN.log` | `§RSGH-A Y \(a modified client .*opens (\d+) of the \d+ laned ops of X` g1 | `§RSGH-A Y (a modified client that lists and gets every m/ object through the real GitHub pipe) opens` |
| gh_down | 6 | `build/scriptor/gaps_49_1/g4_GREEN.log` | `§RSGH-A Y \(a modified client .*opens \d+ of the (\d+) laned ops of X` g1 | `§RSGH-A Y (a modified client that lists and gets every m/ object through the real GitHub pipe) opens` |
| gh_mid | 4 | `build/scriptor/gaps_49_1/g4_GREEN.log` | `§RSGH-G the relay withholds X's MIDDLE .* gaps\(\) = exactly its box seq\(s\) \[(\d+)\]` g1 | `§RSGH-G the relay withholds X's MIDDLE m/hub/ bundle -> gaps() = exactly its box seq(s) [4]` |
| gh_last | 5 | `build/scriptor/gaps_49_1/g4_GREEN.log` | `§RSGH-G the relay withholds X's LAST bundle -> reported from X's signed head 'boxes': \[(\d+)\]` g1 | `§RSGH-G the relay withholds X's LAST bundle -> reported from X's signed head 'boxes': [5]` |
| gh_judged | 9 | `build/scriptor/gaps_49_1/g4_GREEN.log` | `§RSGH_VERDICT PASS judged=(\d+)` g1 | `§RSGH_VERDICT PASS judged=9` |
| gh_fails | 0 | `build/scriptor/gaps_49_1/g4_GREEN.log` | `§RSGH_VERDICT PASS judged=\d+ fails=(\d+)` g1 | `§RSGH_VERDICT PASS judged=9 fails=0` |
| k_red_ids | 3 | `build/scriptor/gaps_49_1/g5_RED.log` | `§RS-J G5: .* names 0 of the 3 laned op ids and 0 of their record ids - op ids in state=(\d+) record ids in state=\d+` g1 | `§RS-J G5: the snapshot STATE (1 state row(s) fetched, 1 readable with the team key) names 0 of the 3` |
| k_red_word | FAIL | `build/scriptor/gaps_49_1/g5_RED.log` | `(FAIL) §RS-J G5:` g1 | `FAIL §RS-J G5:` |
| k_red_judged | 5 | `build/scriptor/gaps_49_1/g5_RED.log` | `§RS_SCOPE_VERDICT FAIL judged=(\d+)` g1 | `§RS_SCOPE_VERDICT FAIL judged=5` |
| k_green_ids | 0 | `build/scriptor/gaps_49_1/g5_GREEN.log` | `§RS-J G5: .* - op ids in state=(\d+) record ids in state=\d+$` g1 | `§RS-J G5: the snapshot STATE (0 state row(s) fetched, 0 readable with the team key) names 0 of the 3` |
| k_green_judged | 41 | `build/scriptor/gaps_49_1/g5_GREEN.log` | `§RS_SCOPE_VERDICT PASS judged=(\d+)` g1 | `§RS_SCOPE_VERDICT PASS judged=41` |
| k_green_mut | 10 | `build/scriptor/gaps_49_1/g5_GREEN.log` | `§RS_SCOPE_VERDICT PASS judged=\d+ fails=\d+ inconclusive=\d+ mutants=(\d+)/` g1 | `§RS_SCOPE_VERDICT PASS judged=41 fails=0 inconclusive=0 mutants=10/` |
| k_ctl | 3 | `build/scriptor/gaps_49_1/g5_GREEN.log` | `§RS-J G5 CONTROL: .* - op ids in state=(\d+)` g1 | `§RS-J G5 CONTROL: without audience sealing the same STATE lists 3 of 3 laned op ids (the check can f` |
| g2_en | 12 | `build/scriptor/gaps_49_1/g2_stranger.log` | `§DE-R3 §TERMS_VERDICT FAIL enforced=(\d+)` g1 | `§DE-R3 §TERMS_VERDICT FAIL enforced=12` |
| g2_wf | 1 | `build/scriptor/gaps_49_1/g2_stranger.log` | `§DE-R3 §TERMS_VERDICT FAIL .* witness_failed=(\d+)` g1 | `§DE-R3 §TERMS_VERDICT FAIL enforced=12 open=0 witness_failed=1` |
| g2_clone_s | 184 | `build/scriptor/gaps_49_1/g2_stranger.log` | `§DE-R3 \$ git clone .* -> exit 0 \((\d+) s\)` g1 | `§DE-R3 $ git clone -q https://github.com/red1oon/BIMCompiler.git && git clone -q https://github.com/` |
| g2_fail_word | FAIL | `build/scriptor/gaps_49_1/g2_stranger.log` | `(FAIL) §DE-R3 a STRANGER tree` g1 | `FAIL §DE-R3 a STRANGER tree` |
| g2b_en | 13 | `build/scriptor/gaps_49_1/g2_stranger_rerun2_patched.log` | `§TERMS_VERDICT PASS enforced=(\d+)` g1 | `§TERMS_VERDICT PASS enforced=13` |
| g2b_open | 0 | `build/scriptor/gaps_49_1/g2_stranger_rerun2_patched.log` | `§TERMS_VERDICT PASS enforced=\d+ open=(\d+)` g1 | `§TERMS_VERDICT PASS enforced=13 open=0` |
| lim_meta | true | `prompts/TEAMWORK_FRAMEWORK.md` | `\*\*Residuals \(stated\):\*\* relay metadata visible` (flag) | `**Residuals (stated):** relay metadata visible` |
| l_terms | 189 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_terms\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_terms.js 189` |
| l_cache | 70 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_cache\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_cache.js 70` |
| l_trace | 79 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_trace\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_trace.js 79` |
| l_devenv | 51 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/dev_env\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/dev_env.js 51` |
| l_fetch | 54 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/dev_env_fetch\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/dev_env_fetch.js 54` |
| l_publish | 48 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/dev_env_publish\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/dev_env_publish.js 48` |
| l_wwc | 163 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_witness_cache\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_witness_cache.js 163` |
| l_wde | 129 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_dev_env\.js (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 scripts/witness_dev_env.js 129` |
| l_spec | 659 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES BIMCompiler@ca532b065 prompts/TEAMWORK_FRAMEWORK\.md (\d+)$` g1 | `§REPO_LINES BIMCompiler@ca532b065 prompts/TEAMWORK_FRAMEWORK.md 659` |
| l_store | 1098 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_store\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_store.js 1098` |
| l_roster | 375 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_roster\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_roster.js 375` |
| l_env | 131 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_envelope\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_envelope.js 131` |
| l_pipe | 189 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_pipe\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/comm/comm_pipe.js 189` |
| l_keys | 83 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/comm/team_keys\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/comm/team_keys.js 83` |
| l_sync | 866 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 erp/team_sync\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 erp/team_sync.js 866` |
| l_rs | 393 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/tests/witness_read_scope\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/tests/witness_read_scope.js 393` |
| l_rsgh | 166 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/tests/witness_read_scope_github\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/tests/witness_read_scope_github.js 166` |
| l_f1 | 257 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_LINES bim-ootb@6a8023a5 common/tests/witness_f1_mailbox\.js (\d+)$` g1 | `§REPO_LINES bim-ootb@6a8023a5 common/tests/witness_f1_mailbox.js 257` |
| n_comm | 17 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_COUNT BIMCompiler@ca532b065 scripts/witness_comm_\*\.js (\d+)` g1 | `§REPO_COUNT BIMCompiler@ca532b065 scripts/witness_comm_*.js 17` |
| n_team | 16 | `build/scriptor/film_v4/repo_facts.log` | `§REPO_COUNT bim-ootb@6a8023a5 erp/tests/witness_team_\*\.js (\d+)` g1 | `§REPO_COUNT bim-ootb@6a8023a5 erp/tests/witness_team_*.js 16` |

## Reading notes
1. **g1 vs the earlier cache numbers (both in the film, in order).** `witness_cache/GREEN_full.log`: 269.4 s then 5.8 s (before the native-database fix). `gaps_49_1/g1_witness_cache_full.log` (after it): 656.4 s then 652.8 s, ran=9 cached=4 cache_skip=9. After tightening the cache refuses 9 runs, so the second run saved almost nothing. That is the honest price; the script says it.
2. **r1_untracked** is a grep count (0) written by repo_facts_v4.sh from `dev_env/runner1.log` (the first, faulty run: 13/13 portable, no §UNTRACKED line); un_terms is the count of §UNTRACKED lines with manifest=missing in runner2.log.
3. **g2:** `g2_stranger.log` is a REAL fresh clone of both public repos into an empty temp folder, ON THIS MACHINE (not another machine): FAIL, 12 enforced, 1 witness failed. `g2_stranger_rerun2_patched.log` (later, 07:35) is a terms-runner re-run in that tree after a patch: 13 enforced, 0 open, but it is not the full check's verdict (no `§DE_VERDICT PASS`). The script says exactly that and has a swap for G2=pass.
4. **g3** (1,000 sealed tills): `g3_scale_1000.log` has only §STAR-ENROL progress (devices=1000/2000 at the time of reading); no bytes_down line. Pending; no fact.
5. **Not a fact, a code excerpt:** the strings quoted from code are checked by the guard against `repo_facts.log`, not by regex here.
6. **Count correction:** the brief said 18 witness_comm_*.js; at the pin there are 17 (`n_comm`).
