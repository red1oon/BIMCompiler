<!-- ⚠ DO NOT REMOVE — Scope: the NEW facts the v3 script of "Terms you can check" needs (draft, 2026-11-01; nothing recorded or rendered). Each row: value, source (repo-root relative), JS regex (resolve.js semantics: first match, `m` flag, given group), and the text it matched. READ THE LOG after any change to a source log: resolve.js hashes each source. -->
# Facts to add for v3 (74 new facts)

**Verified:** all 74 rows below were resolved with the real `scripts/film_terms/resolve.js` against a scratch copy of the spec (`SPEC=` and `RESOLVED_OUT=` pointed at the scratchpad, so `facts.spec.json` and `facts.resolved.json` are untouched): `§FACTS_VERDICT PASS total=74 missing=0 sources=14`. To adopt: append these entries to `make_spec.js` (same `add(id, log, regex, group, extra)` form; `flag` = `{kind:'flag'}`, `count` = `{kind:'count'}`, `derive` = `{kind:'derive', of, div, dp}`) and re-run `resolve.js`.
In the table a pipe is written `\|` for markdown; the regex itself contains a literal-pipe escape `\|`, shown as `\\|`.

## Facts v2 already has and v3 reuses unchanged (do not re-add)
`lex_n` (the six words) · `ver_enforced`, `ver_open` (v2's record: 10 enforced / 3 open, from `build/scriptor/witness_terms_record_20261031.log`, used as the "last time" side) · `n10`, `n100`, `bytes10`, `kb10`, `mb100` (the old unbounded first download: 367 KB, 4.5 MB) · `star_limits` (simulated devices, no network) · `gov_name`, `gov_mit`, `gov_while` (§48.9 governance wording).
**Correction to the brief:** v2 was built on the 2026-10-31 morning record, which is `enforced=10 open=3`, not 12 / 1 (12 / 1 was the runner state in the middle of the day, before the sealing row). So the "before" figures are ten and three, taken from `ver_enforced` / `ver_open`.

## New facts
| id | value | source log | regex | matched text |
|---|---|---|---|---|
| v3_enforced | 13 | `build/scriptor/terms_postSeal/runner.log` | `§TERMS_VERDICT PASS enforced=(\d+)` g1 | `§TERMS_VERDICT PASS enforced=13` |
| v3_open | 0 | `build/scriptor/terms_postSeal/runner.log` | `§TERMS_VERDICT PASS enforced=\d+ open=(\d+)` g1 | `§TERMS_VERDICT PASS enforced=13 open=0` |
| v3_browser | 5 | `build/scriptor/terms_postSeal/runner.log` | `§TERMS_VERDICT PASS .*browser=judged (\d+)/` g1 | `§TERMS_VERDICT PASS enforced=13 open=0 witness_failed=0 uncontrolled=0 browser=judged 5/` |
| v3_word | PASS | `build/scriptor/terms_postSeal/runner.log` | `§TERMS_VERDICT (PASS)` g1 | `§TERMS_VERDICT PASS` |
| v3_seal_ok | 9 | `build/scriptor/terms_postSeal/runner.log` | `^RELAY \(sealing\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g1 | `RELAY (sealing) \| PASS+PASS \| 9/9 refused \| ENFORCED` |
| v3_seal_tot | 9 | `build/scriptor/terms_postSeal/runner.log` | `^RELAY \(sealing\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g2 | `RELAY (sealing) \| PASS+PASS \| 9/9 refused \| ENFORCED` |
| v3_bound_ok | 6 | `build/scriptor/terms_postSeal/runner.log` | `^VISIT \(bounded\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g1 | `VISIT (bounded) \| PASS \| 6/6 refused \| ENFORCED` |
| v3_bound_tot | 6 | `build/scriptor/terms_postSeal/runner.log` | `^VISIT \(bounded\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g2 | `VISIT (bounded) \| PASS \| 6/6 refused \| ENFORCED` |
| v3_keys_ok | 8 | `build/scriptor/terms_postSeal/runner.log` | `^trusted keys \(roles \+ threshold\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g1 | `trusted keys (roles + threshold) \| PASS \| 8/8 refused \| ENFORCED` |
| v3_keys_tot | 8 | `build/scriptor/terms_postSeal/runner.log` | `^trusted keys \(roles \+ threshold\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| ENFORCED` g2 | `trusted keys (roles + threshold) \| PASS \| 8/8 refused \| ENFORCED` |
| neg_found | 8 | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `^RELAY \(sealing\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| UNCONTROLLED` g1 | `RELAY (sealing) \| PASS+PASS \| 8/9 refused \| UNCONTROLLED` |
| neg_tot | 9 | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `^RELAY \(sealing\) \\| [A-Z+]+ \\| (\d+)/(\d+) refused \\| UNCONTROLLED` g2 | `RELAY (sealing) \| PASS+PASS \| 8/9 refused \| UNCONTROLLED` |
| neg_status | UNCONTROLLED | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `^RELAY \(sealing\) \\| [A-Z+]+ \\| \d+/\d+ refused \\| (UNCONTROLLED)` g1 | `RELAY (sealing) \| PASS+PASS \| 8/9 refused \| UNCONTROLLED` |
| neg_missing | CONTROL team key only: the same member opens all of it | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `control NOT FOUND: (.+)$` g1 | `control NOT FOUND: CONTROL team key only: the same member opens all of it` |
| neg_word | FAIL | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `§TERMS_VERDICT (FAIL)` g1 | `§TERMS_VERDICT FAIL` |
| neg_uncontrolled | 1 | `build/scriptor/terms_postSeal_neg/neg_seal.out` | `§TERMS_VERDICT FAIL .*uncontrolled=(\d+)` g1 | `§TERMS_VERDICT FAIL enforced=0 open=0 witness_failed=0 uncontrolled=1` |
| rs_downloaded | 3 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-A Y \(a modified client .*opens \d+ of the (\d+) laned ops of X` g1 | `§RS-A Y (a modified client that lists and gets every m/ object) opens 0 of the 3 laned ops of X` |
| rs_opened | 0 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-A Y \(a modified client .*opens (\d+) of the \d+ laned ops of X` g1 | `§RS-A Y (a modified client that lists and gets every m/ object) opens 0 of the 3 laned ops of X` |
| rs_ctl_opened | 3 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-A CONTROL: .* - opened=(\d+)/\d+` g1 | `§RS-A CONTROL: with audience sealing off (space key, as F1) the same Y opens 3 of 3 (so the isolation above is` |
| rs_ctl_tot | 3 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-A CONTROL: .* - opened=\d+/(\d+)` g1 | `§RS-A CONTROL: with audience sealing off (space key, as F1) the same Y opens 3 of 3 (so the isolation above is` |
| rs_relay_objs | 9 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-B no business value in any of the (\d+) relay objects` g1 | `§RS-B no business value in any of the 9 relay objects` |
| rs_relay_hits | 0 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-B no business value .* - hits=(\d+)` g1 | `§RS-B no business value in any of the 9 relay objects (5 needles) - hits=0` |
| rs_gap_mid | 2 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-G the relay withholds X's MIDDLE .*"seq":(\d+)` g1 | `§RS-G the relay withholds X's MIDDLE m/hub/ bundle -> gaps() = [{author X, box hub, seq 2}] - [{"author":"dd38` |
| rs_gap_last | true | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-G the relay withholds X's LAST bundle -> reported from X's signed head` (flag) | `§RS-G the relay withholds X's LAST bundle -> reported from X's signed head` |
| rs_gap_f1none | true | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-G CONTROL \(the F1 engine, same withholding\): gaps\(\) = \[\]` (flag) | `§RS-G CONTROL (the F1 engine, same withholding): gaps() = []` |
| rs_rev_opened | 0 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-F the revoked device opens 0 of it .* opened=(\d+)` g1 | `§RS-F the revoked device opens 0 of it (it downloaded the sealed ops, cl_sealed=2) - opened=0` |
| rs_snap_leaked | 0 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-J Y \(space key only\) opens 0 of the \d+ laned ops .* leaked=(\d+)` g1 | `§RS-J Y (space key only) opens 0 of the 3 laned ops of others that the snapshot carries (20 ops in it) - leake` |
| rs_hold | true | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-H no pair key yet: the station HOLDS its laned op` (flag) | `§RS-H no pair key yet: the station HOLDS its laned op` |
| rs_office | true | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS-I office mesh: relay shape equals the F1 engine` (flag) | `§RS-I office mesh: relay shape equals the F1 engine` |
| rs_judged | 39 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_SCOPE_VERDICT PASS judged=(\d+)` g1 | `§RS_SCOPE_VERDICT PASS judged=39` |
| rs_fails | 0 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_SCOPE_VERDICT PASS judged=\d+ fails=(\d+)` g1 | `§RS_SCOPE_VERDICT PASS judged=39 fails=0` |
| rs_mut | 9 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_MUTANTS killed=(\d+)/` g1 | `§RS_MUTANTS killed=9/` |
| rs_mut_tot | 9 | `build/scriptor/terms_postSeal/witness_read_scope.log` | `§RS_MUTANTS killed=\d+/(\d+)` g1 | `§RS_MUTANTS killed=9/9` |
| rs_red_fails | 13 | `build/scriptor/read_scope_20261031/RED.log` | `§RS_SCOPE_VERDICT FAIL judged=\d+ fails=(\d+)` g1 | `§RS_SCOPE_VERDICT FAIL judged=39 fails=13` |
| rs_red_word | FAIL | `build/scriptor/read_scope_20261031/RED.log` | `§RS_SCOPE_VERDICT (FAIL)` g1 | `§RS_SCOPE_VERDICT FAIL` |
| sc10 | 397 | `build/scriptor/read_scope_20261031/scale_10.log` | `§STAR-EDGE-V1 s:0 \{.*?"bytes_down":(\d+)` g1 | `§STAR-EDGE-V1 s:0 {"sync_ms":38.24800002574921,"visit_ms":70.69900000095367,"bytes_down":397` |
| sc100 | 399 | `build/scriptor/read_scope_20261031/scale_100.log` | `§STAR-EDGE-V1 s:0 \{.*?"bytes_down":(\d+)` g1 | `§STAR-EDGE-V1 s:0 {"sync_ms":171.8550000190735,"visit_ms":383.56500005722046,"bytes_down":399` |
| wc_run1_s | 269.4 | `build/scriptor/witness_cache/GREEN_full.log` | `§WC-R1 run1 ([\d.]+) s` g1 | `§WC-R1 run1 269.4 s` |
| wc_run2_s | 5.8 | `build/scriptor/witness_cache/GREEN_full.log` | `§WC-R1 run2 ([\d.]+) s` g1 | `§WC-R1 run2 5.8 s` |
| wc_ran | 1 | `build/scriptor/witness_cache/GREEN_full.log` | `§WC-R1 run2 .* ran=(\d+) cached=\d+` g1 | `§WC-R1 run2 5.8 s: §TERMS_VERDICT PASS enforced=13 open=0 witness_failed=0 uncontrolled=0 browser=judged 0/ski` |
| wc_cached | 12 | `build/scriptor/witness_cache/GREEN_full.log` | `§WC-R1 run2 .* ran=\d+ cached=(\d+)` g1 | `§WC-R1 run2 5.8 s: §TERMS_VERDICT PASS enforced=13 open=0 witness_failed=0 uncontrolled=0 browser=judged 0/ski` |
| wc_run1 | 269 | - | derive wc_run1_s / 1, 0 dp |  |
| wc_run2 | 6 | - | derive wc_run2_s / 1, 0 dp |  |
| bp_inputs | 348 | `build/scriptor/witness_cache/browser_publish.log` | `^run1 .* inputs=(\d+)` g1 | `run1 cached=false exit=0 inputs=348` |
| bp_s1 | 158.4 | `build/scriptor/witness_cache/browser_publish.log` | `^run1 .* s=([\d.]+) ` g1 | `run1 cached=false exit=0 inputs=348 skip=null s=158.4 ` |
| bp_s2 | 0.0 | `build/scriptor/witness_cache/browser_publish.log` | `^run2 cached=true .* s=([\d.]+) ` g1 | `run2 cached=true exit=0 inputs=348 skip=null s=0.0 ` |
| bp_run1 | 158 | - | derive bp_s1 / 1, 0 dp |  |
| bp_run2 | 0 | - | derive bp_s2 / 1, 0 dp |  |
| bp_same | true | `build/scriptor/witness_cache/browser_publish.log` | `^run2 cached=true .*§WP_VERDICT PASS judged=12 fails=0 mutants_killed=4/4` (flag) | `run2 cached=true exit=0 inputs=348 skip=null s=0.0 §WP_VERDICT PASS judged=12 fails=0 mutants_killed=4/4` |
| wc_red_fails | 4 | `build/scriptor/witness_cache/RED_native.log` | `§WC_VERDICT FAIL judged=\d+ fails=(\d+)` g1 | `§WC_VERDICT FAIL judged=23 fails=4` |
| wc_m8 | true | `build/scriptor/witness_cache/GREEN_native.log` | `PASS §WC-M8 a database opened through better-sqlite3 .*after-change cached=false` (flag) | `PASS §WC-M8 a database opened through better-sqlite3 (native code, outside Node fs) is an input: unchanged hit` |
| wc_m9 | true | `build/scriptor/witness_cache/GREEN_native.log` | `PASS §WC-M9 a run that starts a non-Node program .* is NOT cached` (flag) | `PASS §WC-M9 a run that starts a non-Node program (whose reads cannot be traced) is NOT cached` |
| wc_mut | 8 | `build/scriptor/witness_cache/GREEN_native.log` | `§WC_VERDICT \w+ judged=\d+ fails=0 inconclusive=\d+ mutants=(\d+)/` g1 | `§WC_VERDICT INCONCLUSIVE judged=23 fails=0 inconclusive=1 mutants=8/` |
| wc_fails | 0 | `build/scriptor/witness_cache/GREEN_native.log` | `§WC_VERDICT \w+ judged=\d+ fails=(\d+)` g1 | `§WC_VERDICT INCONCLUSIVE judged=23 fails=0` |
| de_bytes | 44937216 | `build/scriptor/dev_env/publish_ad_full.log` | `bytes=(\d+) sha=` g1 | `bytes=44937216 sha=` |
| de_mb | 45 | - | derive de_bytes / 1000000, 0 dp |  |
| de_gz | 12001394 | `build/scriptor/dev_env/publish_ad_full.log` | `uploaded gz=(\d+) bytes` g1 | `uploaded gz=12001394 bytes` |
| de_gz_mb | 12 | - | derive de_gz / 1000000, 0 dp |  |
| de_sha_ok | true | `build/scriptor/dev_env/publish_ad_full.log` | `fetched back, sha matches` (flag) | `fetched back, sha matches` |
| de_terms | 6 | `build/scriptor/dev_env/GREEN_real.log` | `^   §UNTRACKED ` (count) | `6 lines match` |
| de_port_before | 7 | `build/scriptor/dev_env/runner2.log` | `§TERMS_PORTABLE rows=\d+ portable=(\d+) not_portable=\d+` g1 | `§TERMS_PORTABLE rows=13 portable=7 not_portable=6` |
| de_notport_before | 6 | `build/scriptor/dev_env/runner2.log` | `§TERMS_PORTABLE rows=\d+ portable=\d+ not_portable=(\d+)` g1 | `§TERMS_PORTABLE rows=13 portable=7 not_portable=6` |
| de_port_after | 13 | `build/scriptor/dev_env/GREEN_real.log` | `§TERMS_PORTABLE rows=\d+ portable=(\d+)` g1 | `§TERMS_PORTABLE rows=13 portable=13` |
| de_rows | 13 | `build/scriptor/dev_env/GREEN_real.log` | `§TERMS_PORTABLE rows=(\d+)` g1 | `§TERMS_PORTABLE rows=13` |
| de_judged | 13 | `build/scriptor/dev_env/GREEN_real.log` | `§DE_VERDICT PASS judged=(\d+)` g1 | `§DE_VERDICT PASS judged=13` |
| de_mut | 4 | `build/scriptor/dev_env/GREEN_real.log` | `§DE_VERDICT PASS judged=\d+ fails=\d+ inconclusive=\d+ mutants=(\d+)/` g1 | `§DE_VERDICT PASS judged=13 fails=0 inconclusive=0 mutants=4/` |
| r3_open | true | `prompts/TEAMWORK_FRAMEWORK.md` | `\*\*Open:\*\* R3 the stranger run` (flag) | `**Open:** R3 the stranger run` |
| r3_not_done | true | `prompts/TEAMWORK_FRAMEWORK.md` | `a fresh-clone run on another machine has not been done` (flag) | `a fresh-clone run on another machine has not been done` |
| lim_meta | true | `prompts/TEAMWORK_FRAMEWORK.md` | `\*\*Residuals \(stated\):\*\* relay metadata visible` (flag) | `**Residuals (stated):** relay metadata visible` |
| lim_ckpt | true | `prompts/TEAMWORK_FRAMEWORK.md` | `checkpoint STATE is sealed with the team key` (flag) | `checkpoint STATE is sealed with the team key` |
| lim_github | true | `prompts/TEAMWORK_FRAMEWORK.md` | `GitHub pipe untested` (flag) | `GitHub pipe untested` |
| lim_n1000 | true | `prompts/TEAMWORK_FRAMEWORK.md` | `N=1000 not run` (flag) | `N=1000 not run` |
| de_public | true | `prompts/TEAMWORK_FRAMEWORK.md` | `every credential-like value equals the public iDempiere seed` (flag) | `every credential-like value equals the public iDempiere seed` |
| lim_oldapp | true | `prompts/TEAMWORK_FRAMEWORK.md` | `an old app in a mailbox space misses mailbox mail silently` (flag) | `an old app in a mailbox space misses mailbox mail silently` |

## Things the regexes do NOT prove, and how the script treats them
1. **`wc_mut` / `wc_fails`** come from `witness_cache/GREEN_native.log`, whose last line is `§WC_VERDICT INCONCLUSIVE judged=23 fails=0 inconclusive=1 mutants=8/8`. It is INCONCLUSIVE only because its "real runner twice" arm (R1) was switched off in that run (`⚪ INCONCLUSIVE R1 ... --real 0`). The §51.1 / §50.2 RESULT text says `23/0 mutants=8/8`, but **no persisted log with PASS and 8/8 together exists**: the PASS log (`GREEN_full.log`) is the earlier 6-mutant version. The script therefore does NOT say "the cache's own test passed with eight broken versions"; it cites only the two arms that carry the claim (`wc_m8`, `wc_m9`, each a PASS line) and the RED run (`wc_red_fails`). The fresh full run of that test is a ~5 min CPU job; not run here (no GPU or browser involved, but heavy). Recommend it be re-run and its log kept before recording.
2. **"Six" vs "seven" uncachable tests.** §50.2 RESULT says "6 of the terms witnesses are now uncachable". `runner2.log` shows `§CACHE_SKIP ... non-node-child` for seven distinct test files (plantrust, policy, settrust, cl5_conflict via git; docno_till via psql, twice; f1_mailbox and read_scope via sh). The script says "some tests" and no number.
3. **`de_terms` = 6** counts `§UNTRACKED` lines in `GREEN_real.log` (one per term that read the dictionary file); it equals the hand-found six in §50.1.
4. **`sc10`/`sc100`** (397 / 399 bytes) are the SEALED build's first-download numbers (`read_scope_20261031/scale_10.log`, `scale_100.log`). The live objectives page still prints the earlier F1 figures (384 / 386 / 388 B). Both are true of their builds; the film uses the logs above. The sealed build was not measured at 1000 stations (`lim_n1000`).
5. **Page quotes are not facts yet.** The three live pages are HTML, not logs. Any sentence the film quotes from a page must be frozen at record time (curl snapshot hashed into `sources`), as the Seatbelt panel was in v2. The quotes the script uses are listed in `script_en_v3.md` under each chapter and were read from the pages on 2026-11-01.
6. **Stale statement on the live developers page:** it still says "six terms' engine tests open build/erp/ad_full.db ... Making that file reproducible is part of the same check" (written before the file was published to public storage). The film must NOT show that box as current; either the page is updated first or the card says "was".
