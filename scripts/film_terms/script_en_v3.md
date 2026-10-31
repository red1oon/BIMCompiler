<!-- ⚠ DO NOT REMOVE — Scope: DRAFT English dialogue + card plan of the film "Terms you can check" v3 (written 2026-11-01; NOT recorded, rendered or built — recording needs the owner's go). Rules (same as script_en.md): every number is {fact:<id>} (ids: v2's facts.spec.json plus facts_v3_additions.md) and is spelled out by tsv.js; NO digit and NO typed number word (one, two, three...) in a spoken line — tsv.js §NUM_CHECK fails the build; so write "a", "each", "another", never "one". Banned on cards/narration: witness, mutant, server, sync, node, git, npm, ai, terminal, toolchain, and file names/shell commands. Plain English. F is the skeptic and asks; M explains. Read the guard and tsv logs after every edit. -->
# Terms you can check — v3 "The last open promise" (DRAFT)
Target length 4:45 to 5:15 (about 860 spoken words at the v2 pace of ~177 words/min; v2 was 937 words = 5:17). Visual language, voices and credit line as in FILM_NOTES.md (data cards, amber for anything open or limited, green only for a promise whose control was found). Three live pages appear as REAL page captures (read-only, same method as v2's `cap_panels.js`), cropped so no file name or shell command is on screen (the pages contain test file names and install commands; the banned-word rule applies to the picture too).

Story in a line: last cut ended with three promises open; the last of them (mail between a station and head office is sealed to that pair) is now closed and the runner prints thirteen enforced, zero open. The film shows that the checker can still say no, what it costs to keep the checks honest, how someone else can run them, and what is still not proven.

---
## t | title (0:00 to 0:18)
**Card:** large title "Terms you can check". Sub-line: "The last open promise". Two small tiles side by side: LAST CUT `{fact:ver_enforced}` enforced / `{fact:ver_open}` open (amber) -> NOW `{fact:v3_enforced}` enforced / `{fact:v3_open}` open.
**Shows:** v2's record (`build/scriptor/witness_terms_record_20261031.log`) and the current run (`build/scriptor/terms_postSeal/runner.log`).
F: Last time you left some promises open. Where are they now?
M: Last cut, {fact:ver_enforced} promises were enforced and {fact:ver_open} were open. The same runner now prints {fact:v3_enforced} enforced and {fact:v3_open} open. This film is about the last of them, and what it took to be allowed to say that.

## c1 | the rule, in a breath (0:18 to 0:45)
**Card:** three lines, no figures: "A promise has a test." / "The test has a control that must fail when the promise is broken." / "No control found, no green."  (plain-word recap of the lexicon; no new facts.)
F: Words are cheap. What makes a promise count?
M: A green needs a failing control. Each promise has a test, and a second check that must catch the promise being broken. If the control goes missing, the runner refuses to call it green.

## c2 | sealed mail (0:45 to 1:50)
**Card A (the attack):** diagram of three boxes, "Station X", "Head office", "Station Y (modified app)". Reveal steps: Y downloads everything `{fact:rs_downloaded}` of `{fact:rs_downloaded}` messages of X's mail -> opens `{fact:rs_opened}`. Tile "the shared place": `{fact:rs_relay_objs}` objects searched for the business values, hits `{fact:rs_relay_hits}`.
**Card B (the control):** same member, same mail, old setup (team key only): opens `{fact:rs_ctl_opened}` of `{fact:rs_ctl_tot}` (amber label "the old way").
**Shows:** `build/scriptor/terms_postSeal/witness_read_scope.log` lines RS-A, RS-B; RED run `build/scriptor/read_scope_20261031/RED.log`.
F: What worried me was the shared place. Can a station read another station's mail?
M: Mail between a station and head office is now sealed to that pair. We played a station running a modified app that downloads everything. It took all {fact:rs_downloaded} of another station's messages, and opened {fact:rs_opened}. The shared place held {fact:rs_relay_objs} objects. We searched them for the business values and found {fact:rs_relay_hits}.
F: How do I know the test can fail?
M: Same member, same mail, but with the old team-wide key. It opens {fact:rs_ctl_opened} of {fact:rs_ctl_tot}. That is the control: it shows the sealing is what keeps the mail shut, not the setup. And the test was written first against the old build, where it failed {fact:rs_red_fails} checks.
F: What about a device you have removed?
M: After the key change it opens {fact:rs_rev_opened} of the new mail. A copy of the history taken as a snapshot gives a member with only the team key {fact:rs_snap_leaked}.
**Limit shown on this card, amber, small:** "The shared place still sees who sent how much, and when." (source flag `lim_meta`)

## c3 | a held-back bundle shows (1:50 to 2:25)
**Card:** timeline of numbered messages 1, 2, 3 in a mailbox (these index numbers are structural row labels, as in v2's listed row indexes, not facts) with the middle one missing and a red marker "gap at `{fact:rs_gap_mid}`". Below, amber: "the old engine: no gap shown".
**Shows:** `witness_read_scope.log` RS-G lines.
F: And if the relay just holds a message back?
M: Before, that was invisible. Now each message in a mailbox carries a signed running number. Hold back a middle bundle and the receiver reports a gap at number {fact:rs_gap_mid}. Hold back the last, and the sender's signed summary gives it away. Run the old engine on the same case and it shows no gap. That control is in the test too.

## c4 | the runner says no, then yes (2:25 to 3:05)
**Card A (NO):** the runner table with the sealing row in red: "RELAY (sealing)  `{fact:neg_found}`/`{fact:neg_tot}`  `{fact:neg_status}`" and the missing sentence in quotes: `{fact:neg_missing}`; footer verdict "`{fact:neg_word}`", uncontrolled `{fact:neg_uncontrolled}`.
**Card B (YES):** same row restored `{fact:v3_seal_ok}`/`{fact:v3_seal_tot}` refused, green; verdict `{fact:v3_word}` enforced `{fact:v3_enforced}` open `{fact:v3_open}`; "real pages judged `{fact:v3_browser}`". Side tile: "`{fact:rs_judged}` checks, `{fact:rs_fails}` failed; `{fact:rs_mut}` of `{fact:rs_mut_tot}` deliberately broken versions caught."
**Shows:** `build/scriptor/terms_postSeal_neg/neg_seal.out` then `build/scriptor/terms_postSeal/runner.log`; REAL capture of the live objectives page, "Not promised yet" heading with an empty table, then the sealing row under "Met" (crop: heading plus the row's left and right columns, not the file-name column).
F: Show me the runner refusing.
M: We took a single control sentence out of the sealing row: "{fact:neg_missing}". The runner found {fact:neg_found} of {fact:neg_tot} controls, called the promise {fact:neg_status}, and the whole run came back {fact:neg_word}.
F: And with it back?
M: The sealing row shows {fact:v3_seal_ok} of {fact:v3_seal_tot} refused, and the verdict is {fact:v3_word}: {fact:v3_enforced} enforced, {fact:v3_open} open, and the real pages judged too, {fact:v3_browser} of them. The sealing test ran {fact:rs_judged} checks with {fact:rs_fails} failed, and caught {fact:rs_mut} of {fact:rs_mut_tot} deliberately broken versions of the code. The project's own page now shows nothing under "Not promised yet".
**Page quote (freeze at record time):** objectives page: "Not promised yet" (empty table) and the sealing row "in a mailbox (star) space each station's mail is sealed to its pair (that station + head office): another member holding the team key reads none of it, the relay reads none of it, and a withheld mailbox bundle shows as a gap".

## c5 | the two others that closed (3:05 to 3:30)
**Card:** two tiles. "A first download that stays small": `{fact:sc10}` bytes at `{fact:n10}` stations, `{fact:sc100}` at `{fact:n100}` (was `{fact:kb10}` KB and `{fact:mb100}` MB); footnote amber "simulated devices on a single machine, no network". "Key roles with a signing threshold": `{fact:v3_keys_ok}`/`{fact:v3_keys_tot}` refused; "Visit bounded": `{fact:v3_bound_ok}`/`{fact:v3_bound_tot}` refused.
**Shows:** `read_scope_20261031/scale_10.log`, `scale_100.log`; runner rows `VISIT (bounded)`, `trusted keys (roles + threshold)`; `star_limits` flag from the v2 scale log.
F: You said some others were open too.
M: Both of the others closed in the same stretch. A new station's first download is about {fact:sc10} bytes with {fact:n10} stations and {fact:sc100} with {fact:n100}. It used to be {fact:kb10} kilobytes, then {fact:mb100} megabytes. That was measured on simulated devices on a single machine, no network. And key roles with a signing threshold now pass with {fact:v3_keys_ok} of {fact:v3_keys_tot} broken cases refused.

## c6 | what it costs to keep this honest (3:30 to 4:10)
**Card A (the saving):** bar pair: `{fact:wc_run1}` s -> `{fact:wc_run2}` s (all promises, no browser); second pair: `{fact:bp_run1}` s -> `{fact:bp_run2}` s (a browser test that read `{fact:bp_inputs}` files). Tag: "same verdict".
**Card B (the catch):** "Can a stranger get every file this test reads?" -> found: a database opened by the database program itself, invisible to the file tracker. "Changed database: cache now misses (control caught)"; amber: "Price: tests that start outside programs always run again."
**Shows:** `witness_cache/GREEN_full.log` (WC-R1), `witness_cache/browser_publish.log`, `witness_cache/RED_native.log`, `witness_cache/GREEN_native.log` (arms M8, M9). Page: developers page section "The test cache" (frozen quote: "A full run takes minutes, and most of it repeats tests whose inputs have not changed.").
F: Thirteen promises, each with controls. What does that cost?
M: A full run took {fact:wc_run1} seconds. Now each passing result is stored with a fingerprint of every file the test actually read. Run again with nothing changed, and it takes {fact:wc_run2} seconds: {fact:wc_cached} replayed, {fact:wc_ran} re-run, same verdict. A browser test that read {fact:bp_inputs} files went from {fact:bp_run1} seconds to {fact:bp_run2}.
F: A store that replays a pass is exactly how you get a stale green.
M: Which is why we tested it. A new check asks: can a stranger get every file this test reads? It exposed the store's own blind spot. A database opened by the database program itself was invisible to the file tracker. Change that database, and the store would have replayed an old pass. The test for the fix failed {fact:wc_red_fails} checks first. Now a changed database forces a re-run, and any test that starts a program the tracker cannot see into is never stored. The price is that those tests always run again. A re-run is slower, never wrong.

## c7 | the file only this machine had (4:10 to 4:40)
**Card:** big "`{fact:de_terms}` of `{fact:de_rows}`" with caption "promises read a `{fact:de_mb}` MB dictionary that existed only on the author's computer". Then arrow to public storage: "`{fact:de_gz_mb}` MB compressed, fetched back, checked byte for byte". Last tile: "Runnable from a clean copy: `{fact:de_port_before}` of `{fact:de_rows}` -> `{fact:de_port_after}` of `{fact:de_rows}`" (amber to green only on the final step).
**Shows:** `build/scriptor/dev_env/GREEN_real.log` (`§UNTRACKED`, `§TERMS_PORTABLE`), `publish_ad_full.log`, `runner2.log` (first `§TERMS_PORTABLE`). REAL capture of the developers page "Run the checks yourself" text (prose and option table only; crop out the shell block).
F: So can I run it?
M: We went looking for what a stranger could not get. The detector named {fact:de_terms} of the {fact:de_rows} promises, all reading the same {fact:de_mb} megabyte application dictionary that only lived on the author's computer. It holds public demo data, checked first. It is now on public storage, {fact:de_gz_mb} megabytes compressed, fetched back and compared byte for byte. The count of promises that a clean copy can check went from {fact:de_port_before} to {fact:de_port_after} of {fact:de_rows}.
**On-screen guard:** the developers page still carries a "known gap" box about this file (written before the fix). Do not film that box unless the page has been updated (see notes).

## c8 | what is still not proven (4:40 to 5:15)
**Card (all amber, no green anywhere):** "NOT YET PROVEN" / "Nobody has run the checks from a fresh copy on another machine." / "Mail is sealed to the pair, but the shared place still sees who sent how much, and when." / "A snapshot of the history is sealed with the team key: record ids are visible to every member." / "Tried on a shared folder, not yet on the GitHub relay." / "Sealed mailboxes not measured with very large teams." / "An old app in a new team silently misses mailbox mail." / Green line, small: "Teams founded before mailboxes, and office teams, work exactly as before."
**Shows:** facts `r3_not_done`, `r3_open`, `lim_meta`, `lim_ckpt`, `lim_github`, `lim_n1000`, `lim_oldapp`, `rs_office`. Page: REAL capture of the developers page "Not yet proven" box (the sentence "Nobody has yet run them from a fresh clone on another machine") and "Stated limits" paragraph.
F: Have you run it from nothing, on someone else's machine?
M: No. The page says so in a box, and so do we. The reinstating and checking pieces exist. The clean-copy run on another machine has not been done, and it is next.
F: And the sealing?
M: The shared place still sees who sent how much, and when. A snapshot of the history is sealed with the team key, so record ids are visible to every member. It has been tried on a shared folder, not yet on the GitHub relay, and not yet with very large teams. An old app in a new team silently misses mailbox mail. Teams founded before mailboxes, and office teams, work exactly as before, and the test says so.

## c9 | close (5:15 to 5:35)
**Card:** three live addresses in plain text (the three pages), above the governance line: "Project quality objectives. Tested properties and stated limits, not a warranty." End hold 6 s.
**Shows:** `gov_name`, `gov_mit`, `gov_while` (v2 facts, §48.9). Page quote (freeze): objectives page: "These are tested properties and stated limits, not a warranty."
F: What do I actually get?
M: {fact:gov_name}, not a warranty. They hold for a build whose terms run passes. Anyone may clone it under the MIT licence, and a clone keeps them only while its own run still passes. The team guide, the objectives page and the developers page are open. Run it, and tell us where it says no.

---
## Notes for the builder (not narration)
- **Length:** the dialogue above is about 940 words as drafted (about 5:20 at v2's pace), slightly over the 860 target. If the cut runs past 5:30, trim in this order: c1 (can merge into the title line), the "removed device / snapshot" exchange in c2 (keep in the limits card), the browser-test sentence in c6.
- **Numbers on cards that are not facts:** the mailbox timeline labels 1, 2, 3 in c3 are structural labels (v2 handled row indexes the same way: guard has a structural-index list). If the guard rejects them, label them "first / middle / last" instead.
- **Spoken-number rule:** every `{fact}` in a spoken line is spelled out by tsv.js; check that "sc10" reads as "three hundred ninety-seven" and `bp_run2` as "zero". Avoid the typed word "one" in dialogue: lines above use "a single", "another", "each".
- **"fingerprint", "database program", "file tracker"** are the plain-English stand-ins for hash, native database driver, and the tracer; they are descriptions, not facts.
- **Facts the sealed scale line needs a caveat for:** card c5 uses the sealed-build logs (397 / 399 bytes). The live objectives page prints the earlier mailbox build's figures (384 / 386 / 388 bytes). Do not show both in one frame without saying why.
- **Page captures** (owner's go needed to record): objectives page "Not promised yet" empty table; developers page "Run the checks yourself" prose and "Not yet proven" box. All crops must hide file names containing the banned word. The Team guide page appears only as the closing address, not as a capture.
- **Update before recording:** (1) the developers page "Not yet proven" box and its `ad_full.db` sentence are stale since the file was published; (2) the objectives page was generated from the 2026-10-31 run and does not mention the dictionary or the cache fix; neither blocks the film if the script quotes only what they say now, which it does.
