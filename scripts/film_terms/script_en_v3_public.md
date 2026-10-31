<!-- ⚠ DO NOT REMOVE — Scope: DRAFT public (plain-English) cut of "Terms you can check" v3, 2026-11-01. NOT recorded or rendered. Developer cut = script_en_v3.md. Rules: every number is {fact:id} (ids in facts.spec.json, facts_v3_additions.md); no digit and no typed number word in a spoken line (write "a", "each", "another", never "one"/"two"); banned on cards and narration: witness, mutant, server, sync, node, git, npm, ai, terminal, toolchain, plus this cut's own ban: runner, control, cache, manifest, portable, epoch, fold, § . Read the guard and tsv logs after every edit. -->
# Terms you can check: the last open promise — PUBLIC CUT (DRAFT)
Audience: a shop owner, an IT buyer, a curious developer. Target 4:30 to 5:00, about 650 spoken words (F asks as the skeptic, M explains). Each beat is a plain picture with at most one idea figure. Amber for anything limited, green only where a test passed.

## 1 | Hook (0:00 to 0:30)
**Picture:** a shop: three tills and a head office. A cloud icon with a cross over it; the tills keep ringing up sales. A small label under head office: "nothing in the middle to rent or keep alive".
F: What happens to the shop when the internet drops?
M: The tills keep selling. Each till keeps its own books. When the connection comes back, they catch up. There is nothing in the middle to rent, and nothing in the middle to keep alive.
F: Then why should I trust it?
M: Because every promise we make has a test that must fail if the promise breaks. That is what this film shows.

## 2 | How it works in one picture (0:30 to 1:05)
**Picture:** each till holds a ledger book. A post box in the middle. Small sealed envelopes travel till to post box to head office. A label on the post box: "carries, never decides".
F: If nothing is in the middle, how do the tills share anything?
M: Through a post box. A till drops in small sealed envelopes of changes. Head office collects them, and any till can fetch what is meant for it. The post box only carries. It never decides anything, so you can swap it and the books stay the same.
F: And if two tills change the same record?
M: The rules decide, on every device, the same way. A change that is refused is refused everywhere, and the reason is shown. Nothing is quietly overwritten.

## 3 | Private by design (1:05 to 2:00)
**Picture:** Till A, Till B, head office. A's envelopes are sealed so only A and head office can open them. A red-outlined Till B with a "tampered app" tag grabs all of A's envelopes, and a counter shows how many it opens: `{fact:rs_opened}`. Beside it, amber "the old way, team-wide key": the same till opens everything.
**Shows:** `build/scriptor/terms_postSeal/witness_read_scope.log` (RS-A; the old-way control line `rs_ctl_opened`).
F: Can another till read my till's mail?
M: No. The mail between a till and head office is sealed so that only that till and head office can open it. Not the post box. Not the other tills.
F: Prove it.
M: We built the attack. A till running a tampered app downloaded all of another till's envelopes, every last envelope, and opened {fact:rs_opened}. And to show the test can fail, we ran the old way, with a single shared key. There, the same till opens everything.

## 4 | Nothing goes missing unnoticed (2:00 to 2:40)
**Picture:** a row of numbered envelopes 1 to 5 on a shelf (numbers are the row labels used elsewhere in the film, structural, not figures); envelope number `{fact:gh_gap_mid}` is missing, and a red "gap" flag points to it. Below, a small GitHub badge: "also checked on a real public post box".
**Shows:** `build/scriptor/gaps_49_1/g4_GREEN.log` (RSGH-G lines; verdict `gh_word`).
F: What if the post box quietly holds an envelope back?
M: Each envelope is numbered and signed. Hold an envelope back, and the receiver sees the gap, even if it was the last in the row. And this is not only a laboratory trick. The same checks passed over a real public post box on GitHub, where envelope number {fact:gh_gap_mid} was held back and reported. With the numbering switched off, the same test finds no gap. So we know the test can say no.

## 5 | Stays light as you grow (2:40 to 3:25)
**Picture:** two bars. Old: a very tall bar "kilobytes then megabytes". Now: a thin line "{fact:sc10} bytes at {fact:n10} tills, {fact:sc100} bytes at {fact:n100}". Right-hand slot, dashed outline, marked **PENDING G3**: "`{fact:sc1000}` bytes at 1,000 tills" (shown only if the sealed 1,000-till run completes; otherwise the slot is removed and the line below is cut).
**Shows:** `build/scriptor/read_scope_20261031/scale_10.log`, `scale_100.log`; `gaps_49_1/g3_scale_1000.log` (pending). Footnote amber: "measured on simulated tills on a single machine".
F: Does a new till have to download everything the others sent?
M: No. A new till only fetches its own mail. Its first download stays about the same size, {fact:sc10} bytes with {fact:n10} tills and {fact:sc100} with {fact:n100}. Before this, it grew from kilobytes to megabytes. [PENDING G3, include only if measured: And at a thousand tills it is still {fact:sc1000} bytes.]

## 6 | Promises you can check (3:25 to 4:20)
**Picture:** a list of thirteen promises. A tick appears next to each only after its test passes. Then a hand removes a safety check from the sealed-mail promise; the tick turns to a red cross and a label reads "the whole run fails". Restore it: the tick returns, counter shows `{fact:v3_enforced}` kept, `{fact:v3_open}` still open.
**Shows:** `build/scriptor/terms_postSeal_neg/neg_seal.out` then `terms_postSeal/runner.log`; a REAL capture of the objectives page "Not promised yet" heading with an empty table (crop to heading and the promise text; no file names).
F: Anyone can write a promise down.
M: So each promise has a test, and the test has a check that must fail if the promise breaks. We took that check away from the sealed-mail promise, and the whole run failed. We put it back, and it passed. Now {fact:v3_enforced} promises are kept, and {fact:v3_open} are still open. The page that lists them has nothing left under "not promised yet".
F: And I can run that myself?
M: Yes. The developers page shows how, step by step, and says plainly what is not yet proven. Even the large file the tests need is downloadable and checked.

## 7 | Honest limits (4:20 to 4:40)
**Picture (single amber card):** "What we do not claim" / "The post box still sees who sent how much, and when." / "Teams started before sealed mail, and office teams, work exactly as before." / [PENDING G2, include only if a fresh-copy run passes: "The checks have been run from a fresh copy on another machine." / otherwise: "Not yet run from a fresh copy on another machine."]
**Shows:** facts `lim_meta`, `rs_office`, `r3_not_done` (current wording; replace with the G2 result when `gaps_49_1/g2_stranger.log` ends in PASS).
F: What should I not assume?
M: The post box still sees who sent how much, and when. Older teams and office teams work exactly as before. [PENDING G2: And the checks have been run from a fresh copy on another machine. / Until then: And nobody has yet run the checks from a fresh copy on another machine.]

## 8 | Try it (4:40 to 5:00)
**Picture:** three page addresses on screen (objectives page, developers page, team guide), over the line "Open source, MIT licence. No artificial intelligence inside. Tested properties, not a warranty." (`gov_name`, `gov_mit`, `gov_while`).
F: Can I just use it?
M: It is open source under the MIT licence, with no artificial intelligence inside. These are tested properties, not a warranty, and a copy keeps them only while its own tests still pass. Open the pages, run the tests, and tell us where it says no.

---
## Notes
- **Word count:** about 560 spoken words with the pending slots left out (about 600 with both included), roughly 3:30 to 4:00 at the v2 pace plus card pauses; add reveal time on beats 3, 4 and 6 to reach 4:30.
- **New facts used:** `gh_*` (added to `facts_v3_additions.md`, resolved). `sc1000` is NOT defined yet: do not add it until `gaps_49_1/g3_scale_1000.log` has a first-download line (the log currently stops during enrolment at 600 of 2000 devices).
- **Beat 6 count vs picture:** "thirteen" promises is `v3_enforced`; the tick list has 13 rows labelled in plain words from the objectives page.
- **Risk:** the word "GitHub" is a brand; if the guard's banned list matches "git" by substring, the beat 4 label and line need the guard's word-boundary check confirmed, else say "a real public post box".
- **Left out on purpose:** checkpoint limit (fixed, #2498), the test store story, the 45 MB dictionary story beyond the single line in beat 6, the gap/limit about very large teams (shown only once G3 reports).
