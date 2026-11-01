<!-- ⚠ DO NOT REMOVE — Scope: storyboard + narration draft for the film "'Blockchain' ERP" (bim-compiler prompts/TEAMWORK_FRAMEWORK.md §52.3). SET-UP ONLY: nothing is recorded or rendered. Every number is a {{fact}} resolved from a witness log by make_spec.js + ../film_terms/resolve.js (facts.resolved.json, 23/23 resolved 2026-11-01). Recording needs the owner's go AND the self-restore change merged (bim-ootb feat/self-restore), so every number on screen is shipped code. READ THE LOG after any change to a source log. -->
# "Blockchain" ERP — storyboard (draft 1, ~2:30)

**Name (owner, 2026-11-01):** *"'Blockchain' ERP" to signify subjective similarity, as a popular analogy to be connotative* — the quotes are part of the name. The line under the title answers the literal reader.
**Look:** animated cards in the style of `../film_terms/cards_v4.js`, plus short excerpts of the real witness log lines (frozen, cropped). No invented screens.

| # | Beat (≈s) | On screen | Narration |
|---|---|---|---|
| 1 | Title (8) | **"Blockchain" ERP** · *recovers from any copy, with proof* | — |
| 2 | The fear (15) | a laptop goes dark; a question mark over the books | "No server. So if the laptop dies… are the books gone?" |
| 3 | Triple Redundancy (20) | three copies light up: the device · the office box · the off-site relay — and a key beside them | "Every saved change lives in three places: on the device, in a box in the office, and off-site. The key is what makes them readable." |
| 4 | Saved means on disk (20) | a browser is killed {{pc_erp_ms}} ms after three saves → **{{pc_erp}} of 3** come back | "Pull the plug a moment after saving. All {{pc_erp}} saves are still there — saved means on disk, as in any serious system, but without a server." |
| 5 | Any copy rebuilds the books (25) | everything wiped; rebuilt from the relay → **{{relay_n}} / {{relay_tot}}**; from the office box alone → **{{box_n}} / {{box_tot}}** | "Wipe every device. Rebuild from the relay alone: {{relay_n}} of {{relay_tot}}. From the office box alone: {{box_n}} of {{box_tot}}. Same books." |
| 6 | The lost laptop (20) | head office rebuilt from its keys → **{{hub_n}} / {{hub_tot}}** (before today's fix: {{hub_before}}) | "Lose the head-office laptop but keep its key: it comes back with all {{hub_n}} of its {{hub_tot}} records. This morning it got {{hub_before}} — the drill found that, and it was fixed." |
| 7 | No fork (15) | the restored station writes again → forks **{{fork_after}}** (before: {{fork_before}}) | "And it carries on where it left off. No second version of the truth: {{fork_after}} forks." |
| 8 | Proof, not trust (25) | a missing piece is named (mailbox seq {{gap_seq}}); a tampered piece is refused ({{tamper_restored}} restored); the wrong key → {{sealed}} records sealed, never an empty ledger | "Every copy proves itself. A missing piece is named. A changed piece is refused. Without the key, the data stays sealed — present, never silently empty." |
| 9 | What it does not do (15) | work never sent: **{{unsent_in}} of {{unsent_tot}}** in any rebuild · the 3D editor: {{pc_bim_kept}} of {{pc_bim_tot}} edits after a crash mid-work | "Two honest limits: work never sent anywhere can't come back from a copy — the device or the office box holds it. And the 3D editor still keeps only its last snapshot." |
| 10 | End card (8) | **"Blockchain" ERP** · no miners · no coin · no server | — |

**Before recording (checklist):** (1) bim-ootb `feat/self-restore` merged, terms runner 13/0 on main; (2) re-run `witness_restore_drill.js` and `witness_power_cut.js` on main, point `make_spec.js` at those logs, re-resolve (23/23); (3) a guard like `../film_terms/guard_v4.js`: every on-screen and spoken number is a fact, banned words absent; (4) the office box is a MODEL in the drill (a tee of the relay) — the card in beat 3/5 must say "office box (modelled)" until D1 is built; (5) owner's go to record.
