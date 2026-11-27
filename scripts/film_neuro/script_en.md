<!-- ⚠ DO NOT REMOVE — Scope: storyboard + narration for the film "Think Global, Act Local" (bim-compiler prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §16). Every number is a {{fact}} resolved by resolve.js from evidence/ into facts.resolved.json; guard.js refuses the build otherwise. Turns are "F: … ‖ M: …" (two voices, PLAYBOOK). English only (owner, 2026-11-08). READ out/*.log after every run. -->
# "Think Global, Act Local" — storyboard (English, rc4: the AI uses the app through the connector, §18; the session is a scripted stand-in)

| # | Card | On screen | Narration |
|---|---|---|---|
| 1 | title | Think Global, / Act Local · AI proposes, the compiler judges | — |
| 2 | problem | the typed question → the free AI clip of our own Hospital → "But is it accurate?" | "F: Say you ask an AI for this, and you get a beautiful render. But is it accurate? ‖ M: Nobody can say. A picture has no list of parts to check it against." |
| 3 | repeat | Claude → Blender connector → Bonsai opens the IFC · then our two runs of the Hospital schedule, one cost line | "F: But Claude can take my IFC into Blender now. ‖ M: It can, and Bonsai even has schedules. So ask it twice. Same schedule? Same cost? We ran the Hospital twice. All {{rep_n}} parts land on the same day, and the cost line matches for all {{rep_days}} days." |
| 4 | clash | boxes {{clash_broad}} → real overlap {{clash_true}} | "F: And clashes? If the boxes touch, is it a clash? ‖ M: In our Hospital, the boxes flagged {{clash_broad}}. The real shapes overlap in {{clash_true}}. The rest is guesswork." |
| 5 | idea | stick figure → globe (your AI, $) → the app's menu → laptop (the app, $0) → report back | "F: So is this one big AI service? ‖ M: No. You bring your own AI, and connect it to our app. The AI call costs money. The app runs on your own computer, free, with no AI inside. ‖ M: The app hands your AI a menu: each action, what it does, and what it needs." |
| 5.5 | menu | the real menu the connector hands the AI | "F: What does the AI actually see? ‖ M: This. Two actions, each in plain words, with its inputs in metres. That menu is the whole manual, so nobody has to learn the app first." |
| 6 | session | a scripted demo: the request, the two calls, the app's answers, the rule the AI is given | "F: And when I ask it something? ‖ M: Here is a scripted demo. A test script stands in for the AI, but every answer comes from the app. Asked for a {{s_target}} metre bay, it reads the grid, works out the shift, and asks the app to make it." |
| 7 | stopped | the app's answer: STOPPED, the report panel | "F: And then? ‖ M: The building's own rule said no. That span would be {{s_bay_after}} metres, against a limit of {{g4_limit}}. The app undid it, and the connector's own rules tell the AI to decline and say why." |
| 8 | ch_global | chapter: Think global | — |
| 9 | chart | right outcome, first try {{a_right}} → with the report {{b_right}}, of {{n_runs}} | "F: Does giving the AI the reason help? ‖ M: In our test, right answers went from {{a_right}} to {{b_right}}, out of {{n_runs}}. A small test, our own requests, one model. It shows a direction, not a proof." |
| 10 | ch_local | chapter: Act local | — |
| 11 | terminal | the connector line in the AI app's settings; the same actions as commands | "F: Where does it all run? ‖ M: On your own machine. Your AI app starts our connector there, and the app opens a fresh copy of the building for every call. ‖ M: And with no AI at all, the same actions are commands you can script yourself." |
| 12 | exact | a shift: every point beyond the line moves, every point before it stays · {{bs_vertices}} checked, {{bs_off}} off | "F: And how close is close? ‖ M: When a shift moves part of the building, every point beyond the line moves by exactly the amount asked. Every point before it stays. {{bs_vertices}} points checked. {{bs_off}} off." |
| 13 | report | the report: before and after, the limit, the bay, what was not checked | "F: And what doesn't it check? ‖ M: Every report says so. {{nc_n}} things, including load capacity and floating elements. So a pass never means safe." |
| 14 | ch_rule | chapter: How far from the rule | — |
| 15 | g2 | a second request: STOPPED, overlaps {{g2_ov_before}} → {{g2_ov_after}}, driven into a wall | "F: Does it only check spans? ‖ M: No. Here, a narrower bay pushed a wall into the one it touches. Stopped, with the reason, so the next try starts from a clean building." |
| 16 | others | how others pair AI with a check (sourced) | "F: Isn't everyone doing this? ‖ M: Many tools pair AI with rules, but most leave the final check to you. In mathematics, a model proposes and a proof engine decides. Here, any AI uses the app through its menu, and the app says how far off it is." |
| 17 | limits | honest limits | "M: Honestly: the overlap check still uses boxes, not the real shapes. It does not check strength or loads. And in the separate compile path, {{cp_none}} of {{cp_total}} planted mistakes went unnoticed." |
| 18 | roadmap | not built yet | "M: Not built yet: more actions in the menu. The real-shape check behind every report. A measured run of an AI with the connector." |
| 19 | promise | Let your AI do the beautiful rendering, / but let its data be grounded. | "M: So let your AI do the beautiful rendering. But let its data be grounded." |
| 20 | howto | the guide URL + the connector steps | "F: Can I try it with my own AI? ‖ M: Yes. Download two files, add the connector to your AI app, and ask in plain words. The guide shows every step." |
| 21 | end | Think Global, Act Local · the guide link · No AI inside | — |

**Sources:** `resolve.js` reads `evidence/` (copied 2026-11-08 from the runs named in each file) into `facts.resolved.json`, one source line per fact.
