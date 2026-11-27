<!-- ⚠ DO NOT REMOVE — Scope: the English dialogue of the film "Terms you can check" (TEAMWORK_FRAMEWORK §49). Rules: every number is {fact:<id>} (ids in facts.spec.json) and spelled out in words by tsv.js; NO digit and NO typed number word (one, two, three...) in a spoken line — tsv.js §NUM_CHECK fails the build. Plain English, no jargon, no toolchain. F is the skeptic and asks; M explains. READ THE LOG after every edit: out/tsv_*.log. -->
## t | title
F: Where is the database? Is it real-time?
M: Fair questions. We answer with {fact:lex_n} plain words, and every word has a check that fails when the word stops being true.
## b1 | lexicon
F: Start with the words.
M: A relay carries bundles. It never decides, so swap it and the books are unchanged.
F: And the database?
M: Each device keeps its own ledger, signed and agreed by merge, not guarded in a single spot. A bundle arrives whole or not at all, and a refusal says why.
F: And real-time?
M: There is no live link. You choose when to Visit, and if you are cut off, nothing is lost. An ACK shows where every claim got to, on both ends. A statement is a rule that was in force when the claim was made.
## b2a | runner
F: Anyone can write words. Do the words prove anything?
M: Because a green needs a failing control. Every term has a check, and a second check that must catch the term being broken.
F: Show me.
M: The runner lists the open terms first, and never in green. {fact:ver_open} are open. {fact:ver_enforced} are enforced, each with its control. And the real pages were judged too, {fact:ver_browser} of them.
## b2b | mutant
F: And if someone weakens a control?
M: We changed a single control sentence. The runner found only {fact:mut_found} of {fact:mut_tot} controls, marked the term uncontrolled, and the whole run failed. A green with a missing control is refused.
## b3 | visit
F: What if the relay is down?
M: We cut it. The {fact:vis_unsent} claims stayed on the device, none marked sent, and nothing reached the relay.
F: What if the relay lies, and says it saved a bundle it dropped?
M: Every Visit reads back what it sent. The read-back caught {fact:liar_rbf} dropped bundle, so {fact:liar_sent} were counted as sent.
F: And when the relay returns?
M: The next Visit sends the {fact:vis_sent_later} held claims. A third Visit sends {fact:vis_third}. Sent once, nothing lost.
## b4 | refusal
F: What if someone does what they should not?
M: A station tried to complete an order that only head office may complete. All {fact:ex_devices} devices refused it, and its consequence with it. Nothing was left in any ledger.
F: Can a rule be rewritten quietly?
M: A statement edited after signing is refused. If the primary key is lost, the backup key replaces it.
F: Is that only a test bench?
M: No. On the real page the same click was refused. The refusal count went from {fact:x7_before} to {fact:x7_after}, and the order did not change.
## b5 | weak
F: So what is the real weakness?
M: There is no central counter. Both devices, offline, on the plain shipped sequence, drew the same numbers. {fact:clash_a}. {fact:clash_b}. {fact:clash_c}.
F: Different documents, same number.
M: Yes. That is the price of having no central place, and we say so plainly.
## b6a | feature
F: Can that be fixed without a central counter?
M: Make the number say where it was made. Organisation, then station, then a running count that never leaves the station. Stations working offline shared no number, on any of the {fact:d10_types} document types.
F: And if a station forges another station's prefix?
M: Every device refuses it. All {fact:forged_devices} did.
## b6b | legacy
F: Does legacy iDempiere number it the same way?
M: We ran both side by side. At all {fact:d20_pos} positions the numbers were equal. And on the real page, the order carries its station's name in its number.
## b7a | terms
F: Do I have to take your word for it?
M: No. The Team panel has a Terms button. It shows this same table, from the last recorded run: {fact:rec_rows} terms, {fact:rec_enf} enforced, {fact:rec_open} open.
## b7b | seatbelt
F: And before I process a document?
M: The Seatbelt looks at {fact:sb_rows} things, like unsent changes, or a record changed by another device. It advised caution on {fact:sb_advise}. It only advises. The document went ahead.
## b8a | notpromised
F: So what do you not promise?
M: {fact:ver_open} terms are open. A Visit is not yet bounded. The first download grows with the team: about {fact:kb10} kilobytes at {fact:n10} stations, and about {fact:mb1000r} megabytes at {fact:n1000}, measured on simulated devices. The fix is on the roadmap.
F: And the others?
M: Sealing is judged only in a simulator. Key roles with a signing threshold are not built.
## b8b | govern
F: And what does hold?
M: Quality objectives, not a warranty. They hold for a build whose terms run passes. Anyone may clone it under the MIT licence, and a clone keeps them only while its own run still passes.
