# §SUN_SHADOW_DROWNED — full diagnostic trail (2026-08-13 → 2026-08-14)

Archived 2026-08-14 per this file's own housekeeping convention (closed work gets a one-line
pointer in `prompts/PHOTOREAL_STILL_RENDER.md`, full narrative moves here). CLOSED — PR #1346
merged, user-confirmed live. See the one-line pointer in the main file for the final state.

---

4. **§SUN_SHADOW_DROWNED — CLOSED 2026-08-14.** PR #1346 (mask/blend restore pass in
   `_buildStillAO()`, samples `A.sun.shadow.map` directly, mirrors three.js's own `getShadow()`
   chunk, restores AO-eroded contrast at the detected sun-shadow boundary only, denoise/AO tuning
   fully untouched) — CONFIRMED MERGED (`gh pr view 1346`: `state: MERGED`, both CI checks passed).
   #1343 (denoise 12→7/8→5, merged earlier) was confirmed INSUFFICIENT by the user first
   ("main shadow from the Sun is still not sharp as in alt-g Time Machine case") — #1346 superseded
   it. Real-pixel witness: +18.7% contrast at the shadow edge, 40x scoped away from ordinary AO
   corners — see the dated 2026-08-14 sub-entry below for full numbers. **User's own live
   gut-check, same day, fresh HHS_Office_Federated Alt+C bake (hard reset confirmed
   `§SUN_SHADOW_RESTORE_INIT_OK` live, not stale-cached):** watched the bake mid-run, reported "not
   evident to be diff[erent] onset" at the point checked, then closed the thread directly: "I am OK
   as this is as good as it can get but is good enough." **Ruling stands even though the live visual
   didn't show an obvious win at that point** — the numeric witness already cleared this project's
   own proof bar, and the user's own acceptance is the final word here. **Follow-up, same bake,
   further in (past the midpoint):** user: "strong shadows on walls and different surfaces.. this is
   good sign" — positive live visual corroboration, later in the sun-arc sweep than the first check.
   Consistent with, not contradicting, the closed ruling above. Not blocked on anything further;
   don't reopen without a new user complaint.
   Full diagnostic trail below — two structural hypotheses were tested and ruled out (autoRenderBeauty
   live-vs-frozen: no effect; AO pass insertion order: identical in both composers) before landing on
   the real, code-confirmed cause: Alt+S/Alt+C's denoise was bumped in PR #1331, Alt+G's never was.
   Original report, for context: User, watching the same Clinic
   MP4: the sun's cast shadow **loses its corner where it meets the beams, starting at the feet of
   the beams, specifically from the 3rd second to the 10th second** of the film (15fps → frames
   ~45-150 of 939; `tNorm` ≈ 0.05-0.16, i.e. still near the 55° noon start of §SUN_ARC's sweep, NOT
   the dusk end). Precise, user-supplied timing — narrower and more actionable than this entry's
   first pass (which only sampled 3 arbitrary frames and found nothing conclusive; superseded by
   this timing). **User's own causal read, given directly (2026-08-13): "the new alt-G noise adding
   to alt-S during daytime in film making drowns out the shadows"** — i.e. this is NOT independently
   framed as a shadow-map bug; the user is pointing at the same Alt+G/Alt+S AO pass covered by
   §PHOTO_AO_TUNING above (`effects_gi_poc.js` standalone composer + `effects.js` §PHOTO_AO fold that
   Alt+C's MaxQ bake runs every frame) as the thing masking the shadow detail at the beam base, not a
   separate mechanism. §PHOTO_AO_TUNING's 3 fixes (PR #1331/#1334/#1335 — see correction above,
   #1337 is unrelated) were confirmed "much better" overall on this same Clinic bake, but this
   specific daytime/beam-foot symptom in frames 45-150 was called out separately and may not be
   covered by those fixes. **Did not change any shadow or AO code this entry** —
   `§PHOTO_SHADOW_BIAS` (below) is real-pixel-verified and user-confirmed separately ("shadows
   working great"); a screenshot glance is not grounds to perturb either system per this file's own
   FUNDAMENTAL LAW discipline.

   **Follow-up, same session (2026-08-13): "shadows were great but began to wane considerably after
   the alt-s dark shadows in room corners fixing cutting down its noise level"** — user is pointing
   specifically at the noise-reduction side of §PHOTO_AO_TUNING, not the darkness/intensity side.
   Read the actual shipped values off `origin/main` `viewer/effects.js` directly (the shared
   `~/bim-ootb` checkout was dirty again this session — deleted release-please files, modified
   `CHANGELOG.md`/manifest — so `git show origin/main:viewer/effects.js` was used instead, not the
   working tree):
   ```
   effects.js:3462  STILL_AO_RADIUS = 32        // was 8m world-space, now 32px screen-space (#1334)
   effects.js:3463  STILL_AO_INTENSITY = 4      // was 6→2 (#1331)→4 (#1335)
   effects.js:3485  aoSamples = 8
   effects.js:3486  denoiseSamples = 4→8        // §PHOTO_AO_DARK, PR #1331 — THE noise-cut change
   effects.js:3487  denoiseRadius = 6→12        // §PHOTO_AO_DARK, PR #1331 — THE noise-cut change
   ```
   **Spec — hypothesis, NOT yet proven:** `denoiseRadius` is N8AO's own blur-kernel radius (screen
   pixels) applied to the AO occlusion buffer before it composites over the beauty pass. Doubling it
   6→12 doubles the blur footprint at every AO-dark junction, including the beam-foot contact point
   (a concave crease where a screen-space AO term and the sun's cast-shadow edge legitimately
   coincide). A wider blur there doesn't touch the shadow MAP itself, but it smears the *composited*
   local contrast right where the two effects overlap — consistent with "loses its corner" reading
   as erosion, not disappearance. This should bite hardest exactly where the user timed it: seconds
   3-10 (`tNorm` 0.05-0.16) is the 55°-near-noon start of §SUN_ARC, where the cast shadow is
   shortest/most foreshortened and has the smallest pixel footprint to survive a wide blur — a long
   dusk-end shadow has more margin and would show the same blur less. **Not yet verified against the
   alternative (intensity 2→4 from #1335 simply reading heavier at the same junction, unrelated to
   denoise blur) — the two changes shipped in the same PR and haven't been isolated.**

   **Next session — verification plan (real-GPU numeric witness, per FUNDAMENTAL LAW, no
   eyeballing):** headless Chrome + Puppeteer canvas capture (same method as §PHOTO_SHADOW_BIAS's own
   A/B and the `scratchpad/witness_*.js` pattern), on a fresh Clinic (or same-seed) bake, frames in
   the 45-150 range, at the beam-foot shadow junction: capture real pixel luminance/contrast under
   (a) current `denoiseRadius=12`, (b) reverted `denoiseRadius=6` with `denoiseSamples=8` held
   constant (isolates denoise-radius from the intensity change), single-variable per this project's
   own §PHOTO_AO_EDGE discipline. If (b) restores the corner definition without reintroducing the
   original "too noisy" complaint that #1331 was fixing, ship `denoiseRadius` back to 6 (or an
   intermediate value found by the A/B) as the fix; if not, isolate `intensity` next. Work in a
   `/tmp/wt-*` bim-ootb worktree, not the shared checkout (confirmed dirty again this session).

   **Scope correction, same session (2026-08-13):** user: "only in outside scene where Sun is
   present. In TimeMachine, its shadow is accurately portrayed. Our denoise is only indoors and it
   has hit outdoors is the issue." Two load-bearing facts this adds:
   1. **Time Machine's own sun shadow is unaffected** — TM doesn't run the Alt+S/Alt+C N8AO fold at
      all, so this is independent confirmation the underlying shadow MAP is fine (consistent with
      `§PHOTO_SHADOW_BIAS` being real-pixel-verified separately); the bug is specifically in the
      photoreal AO composite, not shadow casting itself.
   2. **The `denoiseRadius`/`denoiseSamples`/`intensity` retune (PR #1331/#1335) was aimed at INDOOR
      room-corner AO noise, but `effects.js` §PHOTO_AO applies ONE global `N8AOPass` config
      unconditionally to every Alt+S/Alt+C frame — there is no indoor/outdoor gate.** So the same
      blur/intensity that fixed indoor corners is now also running, unwanted, on outdoor sun-lit
      beam shadows. **This reframes the fix:** a single global revert of `denoiseRadius` would fix
      outdoor beam-foot shadows but re-break the indoor room-corner noise #1331/#1335 were shipped
      to fix — NOT an acceptable trade. The real fix is most likely scoping AO tuning by
      indoor/outdoor context (two configs, or an outdoor-specific reduction applied only when the
      exterior/sun is in frame), not a single shared constant. Confirm whether `effects.js` already
      has ANY indoor/outdoor or interior/exterior signal available at the point `§PHOTO_AO`
      configures `N8AOPass` (camera position vs. building bbox, an existing "isInterior" flag used
      elsewhere, etc.) before inventing a new one. **Sent to the already-dispatched witness agent as
      a mid-flight correction — do not re-run a plain global A/B without this scoping in mind.**

   **Second correction, same session, refines the first — "indoor/outdoor" is the WRONG axis:**
   user: "during movie, indoors maybe exposed to Sunlight and thus does exhibit shadow play as in
   that 3-10 sec mp4. This is where its indoor denoise effect has to let that stronger shadow
   overwrite as in TimeMachine when i turn on alt-G it is very nice as it does not overwrite Sun
   movement shadow." Two things this changes:
   1. **Indoor rooms exposed to sunlight (through a window/opening) show the SAME beam-foot erosion
      as the outdoor case** — so gating the fix purely on camera-position-indoor-vs-outdoor (the
      first correction above) is not the right signal either. The real distinguishing condition is
      "a strong directional sun-cast shadow is present in frame," indoor or outdoor, and the fix
      needs that shadow to win over/overwrite the AO denoise smoothing wherever it occurs — not a
      spatial gate.
   2. **A working reference already exists in this codebase: Alt+G.** User: turning on Alt+G "is
      very nice as it does not overwrite Sun movement shadow" — i.e. the STANDALONE GI/AO composer
      (`effects_gi_poc.js`, `§GI_CINEMA_PRESET`) does NOT exhibit this problem, even though it got
      the same PR #1331 retune (`aoRadius` 8→4, `intensity` 6→2) as the Alt+S fold that DOES exhibit
      it. **This means the bug is likely NOT the denoiseRadius/intensity magnitude at all** (both
      composers share similar values) **but a structural/compositing difference between the two
      integration points** — e.g. how each composites its AO term over the beauty pass (blend
      mode/order relative to the shadow-lit render), or the temporal-reconvergence difference already
      named as an open, never-pursued hypothesis in the CLOSED §PHOTO_AO_TUNING entry above ("Each
      Alt+C frame is a NEW pose → AO reconverges from a fresh seed every time... the better fit for
      'noise' specifically" — that hypothesis was shelved for a direct "too dark" ruling, not
      disproven). **Next step is a DIFF, not a magnitude A/B:** compare what `effects_gi_poc.js`'s
      Alt+G composite path does differently from `effects.js` §PHOTO_AO's Alt+S/Alt+C fold, on the
      SAME sunlit scene/pose, and look for the structural difference that lets Alt+G's sun shadow
      win. Sent to the already-dispatched witness agent as a second mid-flight correction.

   **Third correction, same session, sharpens the diff into a concrete testable claim:** user: "i
   suspect it is just a matter of which comes first?" — i.e. PASS ORDER in the composer chain,
   exactly the "blend mode/order relative to the shadow-lit render" half of point 2 above, now the
   leading candidate over the temporal-reconvergence half. Concrete claim to check first: in
   `effects_gi_poc.js`'s Alt+G chain, does the N8AOPass run BEFORE the shadow-lit beauty pass is
   finalized (so the sun shadow, rendered after/on top, wins and stays sharp) — while in
   `effects.js` §PHOTO_AO's Alt+S/Alt+C fold, does N8AOPass instead run AFTER the shadow-lit beauty
   pass (so its denoise blur smears over an already-rendered, already-sharp sun shadow, eroding it)?
   Read each composer's actual pass-insertion order (`EffectComposer.addPass`/insertion index) side
   by side — this is a direct code read, not a render witness, and should be checked BEFORE spending
   more GPU-witness time on magnitude A/Bs. If order is confirmed different, the fix is almost
   certainly moving §PHOTO_AO's `N8AOPass` insertion point to match Alt+G's (pass ordering, not a
   parameter retune) — re-verify with a real pixel witness after, per this file's own FUNDAMENTAL
   LAW, but only after the code-level order comparison is done.

   **Witness agent report back (2026-08-13), worktree `/tmp/wt-sun-shadow-ao` branch
   `probe/sun-shadow-ao` off `origin/main`@`82b1575`, clean, nothing committed/pushed — shared
   `~/bim-ootb` checkout untouched throughout.** INCONCLUSIVE, no code shipped (correct call per
   FUNDAMENTAL LAW — don't force a conclusion the data doesn't support):
   - **Magnitude A/B (real GPU, real beam-foot junction on Clinic's true west wall, single-variable,
     `denoiseSamples=8`/`intensity=4` held constant):** `denoiseRadius` 12→6 gave a measured
     +9.9% contrast / +13.9% dynamic range at the shadow edge (`§WITNESS_BEAM_SHADOW
     tag=A_current...contrast=123.75` vs `tag=B_denoiseR6...contrast=135.97`) — real data, but
     gathered before the indoor/outdoor framing was retracted, so NOT to be read as "the fix" on its
     own; a real but partial effect.
   - **Pass-order comparison (code read, not what was hypothesized):** literal pass-insertion order
     is actually the SAME in both composers (beauty pass, then AO pass) — "AO runs before vs after
     the finalized beauty" is not what the code shows. What IS structurally different: **Alt+G**
     (`effects_gi_poc.js`) leaves `autoRenderBeauty` at N8AO's own default `true`, so N8AO renders a
     fresh, live, shadow-correct beauty pass internally on every single frame, no separate tone-map
     pass exists in that chain at all. **Alt+S/Alt+C** (`effects.js` §PHOTO_AO) explicitly sets
     `autoRenderBeauty=false` and instead copies the ALREADY-FINISHED, FROZEN TAA beauty buffer (a
     16-sample accumulate, computed once) into N8AO's beauty target via a static copy, reused
     identically across all 24 AO-converge frames, with tone-mapping deferred to a separate final
     `OutputPass`. Live-fresh-per-frame vs frozen-copy-reused-24x is a real, confirmed difference —
     just not proven yet to be the mechanical cause of the shadow-edge erosion specifically (would
     need instrumentation/a witness the agent ran out of time for — folds measured 300-550s each
     under shared machine load this session).
   - **`autoRenderBeauty=true` test — RUN, RESULT: NO EFFECT, reverted, nothing shipped.** Same
     beam-foot junction, same sun angle: contrast 123.75 (old, frozen-copy beauty) → 124.95 (new,
     live beauty) — a 1% move, both dark/light sides brightened together, the actual dark-vs-light
     gap barely changed. Compare to the denoise-radius test's 9.9% move on the same number — live
     vs frozen beauty is NOT the mechanism. Indoor-corner regression check crashed mid-run (resource
     hiccup, shared machine) and wasn't worth re-running since the outdoor result already failed on
     its own. Code fully reverted, worktree clean, nothing committed/pushed.
   - **State after 2 rounds (2026-08-13):** two structural/compositing hypotheses tested
     (`autoRenderBeauty`, pass order) — neither explains it. The ONE lever that measurably moves the
     number so far is `denoiseRadius` magnitude (12→6, +9.9%), but that was measured under the
     indoor/outdoor framing the user has since retracted (indoor sunlit rooms show the same erosion,
     so a spatial gate isn't the right fix even if the magnitude itself is part of it). **Open,
     unresolved:** why Alt+G (same AO magnitude values, `effects_gi_poc.js`) doesn't show this
     symptom at all while Alt+S/Alt+C (`effects.js` §PHOTO_AO) does, given the two now-checked
     structural differences don't explain it. Needs a fresh angle next session, not another guess —
     candidates not yet tried: Alt+G is driven by live navigation (camera moves every frame, TAA/AO
     never accumulate across a frozen pose) vs Alt+S/Alt+C is captured at a STATIC pose per frame
     (24-frame AO converge at one fixed camera) — a static-pose-specific AO/shadow interaction (e.g.
     AO's own occlusion sampling picking up the shadow's own depth discontinuity and blurring across
     it, worse the longer AO converges at one fixed viewpoint) has not been checked at all yet.

   **Real lead found by direct code read (2026-08-13), answers the user's own question ("was one
   more notch of noise added to Alt+G?") — no, the reverse:** `git show
   origin/main:viewer/effects_gi_poc.js` shows Alt+G's `denoiseSamples=4`/`denoiseRadius=6` were
   **never touched** by PR #1331 — still the original library-default values. Only Alt+S/Alt+C
   (`effects.js` §PHOTO_AO) got bumped to `denoiseSamples=8`/`denoiseRadius=12` (double both). A
   code comment at `effects_gi_poc.js:68-79` explains why: N8AO's own docs recommend
   `denoiseSamples=1`/`denoiseRadius=0` ("purest temporal accumulation") for a LIVE/moving-camera
   context — Alt+G gets noise cancellation for free from camera motion across live frames, so it
   never needed heavier spatial blur. Alt+S/Alt+C's static 24-frame converge (fixed camera pose per
   still) doesn't get that same free temporal benefit, which is presumably why #1331 reached for
   spatial blur instead. **This lines up with the earlier denoiseRadius 12→6 witness result
   (+9.9% contrast)** — not a red herring, a real partial mechanism. **But a naive revert to 6/4
   risks reintroducing the original "too noisy" complaint #1331 fixed for the static-pose case** —
   unless Alt+S's own 24-frame fixed-pose loop can get equivalent temporal-accumulation noise
   cancellation (matching N8AO's own recommendation) instead of relying on spatial blur. **Next
   step:** check whether Alt+S's 24-frame AO-converge loop is actually using N8AO's temporal
   accumulation correctly across those frames (same fixed pose, should behave like Alt+G's live
   accumulation compressed into 24 forced frames) — if not wired right, fix that and lower
   denoiseRadius/denoiseSamples back toward Alt+G's values as part of the same change; verify with
   the same beam-foot + indoor-corner real-pixel witness.

   **User's own preferred approach, given directly:** "turned back the alt-G denoise level but just
   a bit not as before giving dark rooms" — i.e. don't fully revert `denoiseRadius`/`denoiseSamples`
   to Alt+G's 6/4 (risks bringing back the pre-#1331 "too dark/noisy indoors" complaint); step them
   back PARTIALLY from the current 12/8 toward 6/4, single controlled step per this file's own
   §PHOTO_AO_EDGE discipline ("one controlled step, not back to 6"), and check both the outdoor
   beam-foot junction and an indoor room corner at each step to find where both read acceptably.
   Prefer this pragmatic partial-step approach FIRST — simpler and directly requested — before the
   temporal-accumulation architecture investigation above, which stays as the fallback if a partial
   step alone can't satisfy both. Dispatched to the same agent.

   **User, final: "just a notch up will do, no need testing.. cos we already know the extremes
   already" then "Ever so slight. Just do it and push."** Skips the multi-point A/B search — ship a
   single, very small step up from Alt+G's baseline (`denoiseRadius=6`/`denoiseSamples=4`), NOT a
   search across values. Still gets the standard "prove the wiring is live" check every PR in this
   chain has used (cheap, single config, not an iterative search) before pushing — that's a
   different, minimal bar than the multi-point contrast search this entry called for earlier.
   **SHIPPED (2026-08-13), bim-ootb PR #1343, worktree `/tmp/wt-sun-shadow-ao`, shared checkout
   untouched.** `effects.js` §PHOTO_AO: `denoiseRadius` 12→7, `denoiseSamples` 8→5 (small step toward
   Alt+G's never-touched 6/4 baseline, not a full revert). `intensity`/`aoRadius` untouched. Wiring
   proof, real GPU, live values off the actual pass object: `§PHOTO_AO start frames=24 radius=32
   intensity=4 denoiseRadius=7 denoiseSamples=5`, converges clean (24/24, no errors). `sw.js`
   CACHE_VERSION v1021→v1022 (rebased past a same-day collision with another PR's v1021 bump).
   **MERGED 2026-08-13T07:33:01Z**, https://github.com/red1oon/bim-ootb/pull/1343 (confirmed via
   `gh pr view` — `state: MERGED`; no follow-up push was needed).

   **User visual confirm, same day, on the merged result:** "denoise increased a notch but main
   shadow from the Sun is still not sharp as in alt-g Time Machine case." **Verdict: the 12→7/8→5
   partial step is NOT sufficient** — the beam-foot sun-shadow erosion this whole entry chain has
   been chasing is still visible relative to Alt+G's 6/4 baseline. This confirms the direction
   (moving denoise down toward Alt+G helps, per the earlier +9.9%-contrast witness at 12→6) but
   not yet the magnitude — #1343 was a deliberately small, no-test "just a notch" step per the
   user's own instruction, not a claim that 7/5 would fully close the gap. **Two live options for
   next step, per this entry's own analysis above:** (a) another controlled step further down
   toward 6/4 (same beam-foot + indoor-corner witness pattern as every prior step in this chain,
   watching for the pre-#1331 "too dark/noisy indoors" regression as the stop condition), or (b)
   the temporal-accumulation architecture investigation (§ above, "check whether Alt+S's 24-frame
   AO-converge loop is actually using N8AO's temporal accumulation correctly") which could let
   Alt+S drop denoise toward Alt+G's values without the indoor regression, if the fixed-pose loop
   isn't currently wired to get that benefit. Not yet dispatched — needs a user steer on which
   before spending more GPU-witness time.

   **User steer, same session: "look at how TM with Day/Night cycle on, the shadows cast are
   strong, while alt-G denoise also on" + "shadows are strong when ground/earth appears in
   TimeMachine" — direct code read (origin/main, no edits, no witness run yet), answers this
   without a render:**
   1. **TM's sun shadow is not an AO/N8AO product at all.** It's the plain three.js directional
      `castShadow`/`receiveShadow` map, driven by the native Shadow toggle (`A._shadowOn`, the 'H'
      pill). `time_machine.js` repositions the sun and forces `renderer.shadowMap.needsUpdate=true`
      every tick during Day/Night playback (§ "Day/night — smooth sky + lighting, no shadow
      plumbing" comment + the code right below it) — completely separate code path from N8AO.
   2. **"Ground/earth appears" in TM literally means Shadow is on**, confirmed 1:1 in code:
      `scene.js:387` sets `ground.visible = false` by default; `time_machine.js:8089` only re-hides
      it `if (!app._shadowOn)`. So the user's observation is exact — ground visibility and the
      native shadow are the same toggle, and that shadow is baked into the beauty frame BEFORE
      N8AO ever touches it.
   3. **Alt+G's N8AO also sets `accumulate=true`** (`effects_gi_poc.js`), but N8AO's own README,
      quoted in-repo at that same call site, says accumulation "will be disabled automatically" while
      the camera moves. TM's Day/Night cycle is normally watched with the camera moving (orbit/
      follow), so in real usage Alt+G's AO spends most of its time in plain per-frame mode at
      `denoiseSamples=4`/`denoiseRadius=6` — the untouched library defaults — doing very little
      smoothing, on top of a shadow that's already sharp and already rendered.
   4. **Alt+S/Alt+C use the exact same native shadow-map mechanism** (§PHOTO_DUSK_SHADOWS above) so
      the shadow itself is equally capable of being sharp — but they deliberately FREEZE the camera
      and force `accumulate=true` for the FULL 24-frame AO-converge, 100% of the time by design
      (`effects.js:3480`, "camera is frozen during the AO phase — refine, don't flicker"), with
      `denoiseRadius=7` stacked on top. N8AO's own docs (same quote referenced in #3) say
      accumulate alone should let denoise trend toward 0 ("accumulation itself removes the noise
      spatial denoising was compensating for") — Alt+S/Alt+C is running BOTH mechanisms at once,
      guaranteed every still, which Alt+G essentially never does live. This is the same
      "static-pose-specific AO interaction" this entry named as untried two corrections back — now
      confirmed as a real code-level asymmetry, not just a hypothesis.
   5. **New structural fact, not previously named in this chain:** ground visibility + a brand-new
      `'paved'` texture/colour are (re)applied inside `_applyPhotoStaging()` (`effects.js:3147-3171`)
      in the SAME call that immediately precedes the 24-frame AO-converge loop. Frame 1 of that
      accumulate sequence sees a just-toggled-visible, just-retextured ground — not the long-stable
      ground TM has typically had visible for hundreds of prior frames. A texture/visibility
      discontinuity landing exactly at accumulation start, at the exact junction (ground contact =
      beam foot) the user keeps reporting eroded, is a new candidate contributor.
   **User ruling, same session: "Denoise is already perfect. Don't disturb it. Only borrow from how
   that shadow is sharp in TM usage."** Kills next-step (a) above (no more denoise-value moves,
   #1343's 7/5 stays as-is) and narrows the scope to (b)-and-beyond: port whatever makes TM's native
   `castShadow`/`receiveShadow` shadow stay sharp into Alt+S/Alt+C, without touching any N8AO
   denoise/accumulate/intensity constant. Candidates, in order of how directly they match "borrow
   from TM": port the ground-staging-before-AO-warm-up fix (b) above (isolate the texture-swap
   discontinuity at accumulation start, zero denoise change); check whether Alt+S's own
   `A.sun.shadow.bias`/resolution/frustum setup (§PHOTO_DUSK_SHADOWS/§PHOTO_SHADOW_BIAS_SCALE above)
   is actually equivalent to TM's live `applySunCycle` shadow setup at the SAME beam-foot junction,
   independent of AO entirely — the two shadow-map configs were built at different times for
   different purposes (dusk-arc bake vs continuous live cycle) and have never been diffed against
   each other directly. Not yet dispatched.

   **User asked directly: "so what has it got to do with the shadow?... we have to stack the shadow
   too?" — clarifying code read, no invention:** N8AO's `accumulate` never touches the shadow in
   either path — confirmed, that framing was a dead end. But a SEPARATE, real stacking mechanism
   does touch the shadow and was not yet named in this chain: Alt+S/Alt+C's beauty pass is built by
   `TAARenderPass` running **16 jittered-camera accumulation samples** (`effects.js:40-45`,
   §NIGHT-STILL-REFINE comment) BEFORE N8AO's AO pass ever runs — the sub-pixel camera jitter across
   those 16 samples anti-aliases (softens) every hard edge in the frame it blends, including the sun
   shadow's boundary. TM's shadow is rendered live, ONE unjittered sample per tick, so it never goes
   through this softening. **This is a denoise-untouched lever, distinct from N8AO entirely** — per
   the user's "don't disturb denoise" ruling this is now the leading candidate: check whether the
   16-sample jitter magnitude/pattern (not count, which AA quality depends on) can be reduced or
   whether the shadow map itself can be held STATIC/unjittered across the 16 TAA samples while only
   the rest of the beauty jitters, so the shadow edge doesn't get blended across sub-pixel offsets
   the way TM's never does. Not yet verified with a witness — a code-level candidate only.

   **Self-correction, same session — user pushed back: "how can TAA soften the middle part of the
   shadow, not just edges?"** Right catch, the TAA answer above is INCOMPLETE/wrong as the main
   mechanism: TAA's jitter is SUB-PIXEL — a pixel deep inside a large shadow reads "in shadow" in
   all 16 samples regardless of a fraction-of-a-pixel camera wiggle, so TAA can only blur a
   roughly-1px band right at the boundary line, never the interior. It does not explain a shadow
   reading weaker/eroded as a whole. **N8AO's own `denoiseRadius=7` blur is the better-fitting
   mechanism for that** — it's a real multi-pixel-radius blend of the AO occlusion buffer over a
   whole neighborhood, not a boundary-only effect, and it runs exactly at the beam-foot junction
   where AO's own contact-darkening (a concave wall/ground crease) is naturally strongest anyway —
   so AO's blur smooths a wide area there, not just a line. **Reframes the fix, given the user's
   own "don't touch denoise" ruling still stands:** the target isn't the denoise VALUE, it's its
   SPATIAL REACH onto the shadow — keep AO's blur kernel from sampling across the shadow boundary
   at all, e.g. composite the shadow term as its own layer AFTER N8AO's blur runs, instead of
   letting AO blend over pixels that are already shadow-darkened. TAA jitter stays a secondary,
   edge-only contributor, not the main one. Not yet verified with a witness — code-level reasoning
   only, next step is a real pixel witness before any code change per this file's FUNDAMENTAL LAW.

   **User reframes, same session: "I think blurred shadow edges is a feature, not a bug... Then it
   got more softer with denoise reduction. Question is why and once cleared back to nice enough
   before, can't it simply be stronger ie blacker?"** Two things this resolves, both from existing
   code/history, no new witness needed:
   1. **Darkness/contrast is NOT the open gap — already fixed and confirmed separately.**
      `§MOVIE_SHADOW_TM` (PR #1316, shipped BEFORE the AO-denoise saga) tuned
      `A.sun`/`A.ambient`/`A.hemi` intensities so Alt+S's `sunFillRatio` matches TM's EXACTLY
      (`2.155`, identical to TM's own `4.4/(0.785+1.257)`) — user confirmed live at the time:
      "shadows working great." `PHOTO_SUN_INTENSITY_SCALE`/`PHOTO_HEMI_INTENSITY_SCALE`/
      `PHOTO_AMBIENT_INTENSITY_SCALE` are all `1.0` in current code (`effects.js:2485,2588-2589`) —
      no headroom to go "blacker" without EXCEEDING TM's own contrast, which isn't "matching TM,"
      it's overshooting it. **"Can't it just be stronger/blacker" — no, that lever is already at
      TM parity, confirmed working, don't re-touch it** (the file's own §MOVIE_SHADOW_TM note says
      exactly this: "Do not re-tune these three scales without re-checking the ratio against TM's
      2.155").
   2. **What actually softened the edge came later and is a different mechanism entirely:**
      §MOVIE_SHADOW_TM (#1316) shipped clean; only AFTER that did §PHOTO_AO_TUNING (#1331) bump
      N8AO's `denoiseRadius` 6→12 for an unrelated reason (indoor room-corner AO noise) — a
      blur-radius change, nothing to do with light intensity/darkness. That blur is the entire
      remaining gap. **Confirms the target stays what point 5 above narrowed it to: stop AO's blur
      radius from reaching the shadow edge — not a darkness/intensity lever, that one's already
      spent and correct.**

   **Real-pixel check on a fresh bake, same session — user: "latest mp4 done. Check if shadows are
   OK":** `~/Downloads/BIM_MaxQ_Hospital_1786645170674.mp4` (Hospital, MaxQ Cinema/Alt+C, current
   shipped code — denoiseRadius=7/5 per #1343, nothing further shipped since). No live browser
   session available, so this is `ffmpeg` frame extraction + numeric luminance-gradient
   measurement on the exported frames (not eyeballing the video) — script in
   `scratchpad/measure_shadow_edge.py` this session (per-row max-gradient FWHM = edge width in
   px, plus plateau contrast). Two independent shadow boundaries measured in the finale segment
   (frames ~1030 and ~1100 of 1171 @ 15fps):
   - Silhouette-building shadow crossing the plaza: **edge width median=3.0px mean=2.84px**
     (n=219 rows), contrast mean=50.74, on a 1852px-wide frame.
   - Hospital's own footprint shadow on the ground: **edge width median=2.0px mean=2.70px**
     (n=200 rows), contrast mean=24.87.
   Both read as objectively crisp (a genuinely eroded/soft edge would span tens of px, not 2-3) —
   no visible sign of the erosion symptom in this bake. **Caveat, not a full rematch:** Hospital
   doesn't have Clinic's exposed-beam geometry, so this isn't the same beam-foot junction the
   original complaint named — it's real evidence the current shipped state isn't producing badly
   eroded shadows in general, not confirmation the exact original spot is fixed. The dispatched
   background agent (Task 1 shadow-config diff + Task 2 ground-warmup, both denoise-untouched)
   stalled before doing any work (600s no-progress, worktree never even created) — not yet
   re-dispatched, paused at user's request pending this bake's read.

   **User pressed a third time, same session — "shadows was thrown first, then denoise softens
   shadow... why can't shadow be applied again after?" — direct code read of the actual N8AO
   adapter (`effects.js` ~3505-3533), corrects/lowers the earlier cost estimate:** the frozen sharp
   TAA beauty (`readBuffer` — the crisp shadow baked in, computed BEFORE N8AO ever runs) is never
   discarded. Every one of the 24 AO-converge frames, the adapter function COPIES `readBuffer.texture`
   into N8AO's own scratch beauty target (`copyQuad.render()`), then calls `n8.render(renderer2,
   writeBuffer, readBuffer)` which writes N8AO's blurred/composited result into `writeBuffer`. Both
   the pre-AO sharp original (`readBuffer`) and the post-AO result (`writeBuffer`) are in scope in
   this SAME function, at the SAME point in the pipeline (composer position 1, right after TAA).
   **This is smaller than the "new shadow-only pass" idea floated earlier** — no new render is
   needed to capture the sharp shadow, it already exists and is already sitting there unconsumed.
   What's still missing: a MASK for where the shadow boundary actually is, so a final blend step can
   pull `writeBuffer` back toward `readBuffer` specifically at the shadow edge (leaving N8AO's
   legitimate contact-shadow detail elsewhere untouched) — buildable by sampling `A.sun.shadow.map`
   (already computed) in a small shader, not a new scene render. **Not yet built or witnessed** —
   next real candidate to spec + dispatch, cheaper/more contained than previously estimated.

   **BUILT + WITNESSED + SHIPPED (2026-08-14), bim-ootb PR #1346 (auto-merge armed):** worktree
   `/tmp/wt-sun-shadow-restore`, branch `fix/sun-shadow-restore` off `origin/main`@`6ab068c`
   (rebased fast-forward onto `a2c30ee` before push — one new commit landed mid-session, `sw.js`
   collision avoided by taking the higher `CACHE_VERSION`, v1024→v1025 per this file's own
   KEEP-BOTH convention). Built exactly the mask/blend step the prior entry named: in
   `_buildStillAO()`'s adapter, after `n8.render()`, a new `FullScreenQuad` shader reconstructs
   world position per-pixel from N8AO's own `beautyRenderTarget.depthTexture` (already computed,
   stable across all 24 AO-converge frames since the camera is frozen) via
   `camera.projectionMatrixInverse`/`camera.matrixWorld`, transforms into `A.sun.shadow.camera`
   clip space via `A.sun.shadow.matrix`, and samples `A.sun.shadow.map.texture` the same way
   three.js's own basic (non-PCF) `getShadow()` chunk does — mirrored directly from
   `viewer/lib/three.module.min.js`'s `shadowmap_pars_fragment` (`shadowCoord.z += bias; shadow =
   step(shadowCoord.z, texture2D(shadowMap, shadowCoord.xy).r)`), not hand-derived. An 8-tap
   screen-space neighbor check on this raw shadow term (kernel radius 4px, wide enough to counter
   `denoiseRadius=7`'s blur footprint) finds where it changes sharply — the true sun-shadow
   boundary, never an ordinary AO contact crease (those never cross the shadow-camera frustum test,
   so they read a uniform term and get zero mask). N8AOPass is rerouted into a scratch
   `WebGLRenderTarget` only when this path is live, so the mask/blend shader writes straight into
   the real composer `writeBuffer` with no read/write feedback loop and no extra copy pass beyond
   the one new full-screen draw. `denoiseRadius`/`denoiseSamples`/`intensity`/`accumulate`
   untouched, exactly per the user's "denoise is already perfect" ruling — this borrows sharpness
   from the already-correct shadow map instead, the same source Time Machine's native `castShadow`
   uses. A live runtime toggle, `A._sunShadowRestoreEnabled` (default true), was added for a
   same-build A/B — N8AO's own accumulation is keyed on camera pose, not on which target its output
   is routed to, so toggling this after the 24-frame converge and re-rendering one frame reproduces
   exactly what pre-fix shipped code would have produced at the same converged AO state, no need for
   two separate builds/page-loads.

   **Witness (real headless-Chrome pixel readback, `scratchpad/witness_sun_shadow_restore.js`,
   swiftshader software GL — same pattern as this repo's own `scripts/witness_shadow_bias_ab.js` /
   `scripts/witness_shadow_bias_postfix.js`; a real-hardware-GPU headless attempt via `--use-gl=egl`
   failed to acquire a context in this sandbox, confirmed by a quick A/B before committing to
   swiftshader — noted plainly, not glossed over), Clinic building, deterministic bbox+sun-azimuth
   camera pose (same formula as `witness_shadow_bias_ab.js` — NOT the exact "true west wall
   beam-foot" pose from the vanished background-agent run earlier this session, which was never
   saved to a script and could not be relocated), sun at `tNorm=0.08` (elevation 51.1°, inside the
   user's originally-reported 0.05–0.16 window), single converged 24-frame AO state, single-build
   A/B via the toggle above:**
   - **270 real detected sun-shadow-boundary rows: median contrast 105.58 (fix off) → 125.3 (fix
     on), +18.7%.** Edge width unchanged (2px median both sides) — the fix restores CONTRAST at the
     boundary, not its geometric width, consistent with this entry's own earlier correction that
     N8AO's blur smears local contrast rather than widening the transition.
   - **Regression check (ordinary AO contact-shadow corners, away from the sun shadow):** mean
     pixel luminance diff between fix-on/fix-off is **1.159 within 10px of a detected shadow edge**
     vs **0.029 farther away — a 40x ratio**, i.e. the restore is tightly scoped to the sun-shadow
     boundary and is not bleeding into ordinary AO corner detail.
   - Sanity check: toggling the restore pass back on after measuring reproduces the original frame
     almost exactly (mean abs diff 0.006 on a 0-255 scale) — deterministic, no side effects from the
     toggle itself.
   - **Not independently isolated:** per-frame render cost of the new pass alone (the 24-frame
     `§PHOTO_AO done avgRenderMs=811.8` this run includes N8AO's own cost, which dominates; the new
     mask/blend draw is one 8-tap-per-pixel full-screen shader, expected cheap by construction but
     not measured in isolation this session).
   - Full log: `scratchpad/witness_sun_shadow_restore.log` (bim-ootb worktree, not committed —
     matches how this saga's earlier probe witnesses were handled, numbers recorded here instead).
   - PR: https://github.com/red1oon/bim-ootb/pull/1346 — CONFIRMED MERGED (`gh pr view 1346`:
     `state: MERGED`, both CI checks passed).
