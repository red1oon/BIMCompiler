# RESUME — seed→3D corridor trunk: render gate + construction animation — ✅ DONE+LIVE 2026-06-30

```
# ✅ DONE+LIVE 2026-06-30 — T1 + T2 + held-out ALL complete (bim-ootb #582 sw v24, #583).
# T1 RENDER GATE: window.__seedTrunkProbe + W-SEED-TRUNK-RENDER 8/8 (modeller/tests/witness_seed_trunk_render.js,
#   headless swiftshader). Render==planTrunk net (vertices==2×data segs, risers, no-drift maxDrift 5e-7m, litPct 64%).
#   Eyeball gap CLOSED. Gate caught a real bug: _renderSeedTrunk/seedTrunk guarded on net.refused truthy, but on a
#   SUCCESS net refused is the integer COUNT of unreachable fixtures → empty trunk whenever any fixture unreachable
#   (Duplex ELEC refuses 112/267); fixed to === true.
# T2 ANIMATION: seed-outward draw-range reveal (graph-path-distance keyed, ground→riser→upper, ~2s easeOutCubic,
#   prefers-reduced-motion→instant); §SEED-TRUNK-ANIM gate-asserts ends EXACTLY on net (32 frames finalSegs==5936).
# HELD-OUT: SampleCastle 7-storey, 3 risers, 208415 segs exact==net, maxDrift 1.13e-6m (witness argv [bldg] [disc]).
# W-DW-PIXELPROBE regression green. PROGRESS.md + WalkerMaturity.md updated. NOTHING LEFT on this card.
# ──────────────────────────────────────────────────────────────────────────────────────────────────────
# (original scope, for the record:)
SCOPE: close the "eyeball gap" on the seed-trunk RENDER and make the disc construction a VISIBLE, verifiable UX.
The seed→3D-trunk capability is DONE + LIVE (bim-ootb PR #580 MERGED, sw v23; engine proven W-SEED-TRUNK/
-CORRIDOR/-RISER/-ENGINE + W-SEEDTRUNK-ENGINE 6/6). What is NOT yet a standing gate: the modeller RENDER of the
trunk (LineSegments + risers) and the popup flow. Two tasks below. Read the log after every run (Log Mandate).
```

## CONTEXT (what's already true — don't re-derive)
- LIVE: `red1oon.github.io/bim-ootb/modeller/` — Outliner "Route trunk · from entry (seed)" → disc → `window.seedTrunk(disc)`:
  `DiscWalker.defaultSeed(bdb)` → popup (confirm/choose entry) → `SeedTrunk.planTrunk(bdb,fixtures,seed,risers,{storeys,groundStorey})`
  → `_renderSeedTrunk(disc,net)` draws disc-coloured `THREE.LineSegments` (per-storey corridor polylines + vertical risers) under `_dwRoot()`.
- ENGINE module: `modeller/seed_trunk.js` == `build/seed_trunk.js` (`planTrunk` returns `{storeys:[{edges:[[x,y,z]..polyline]}], risers, served, refused, totalLen, oneNetwork}`).
- The render fn `_renderSeedTrunk` is MODULE-SCOPE (like `_renderDiscWalk`) — `window.seedTrunk` is the public entry.

## ✅ THE HEADLESS WORKAROUND (proven 2026-06-30 — the "eyeball blocker" is a FLAG issue, not a wall)
Headless chromium CAN run the modeller's THREE (webgpu→swiftshader) render with the RIGHT flags — the precedent is
`modeller/tests/witness_dw_pixelprobe.js` (W-DW-PIXELPROBE). The WORKING launch (verified live, pageerrors:none,
`__sceneReady===true`, `window.seedTrunk` defined):
```
puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
```
(My first smoke failed with the WRONG flag `--use-gl=swiftshader` → "Error creating WebGL context". Do NOT repeat that.)
⚠ Production `discWalk()` caches rules in `bim_ootb_cache` IndexedDB which HANGS under puppeteer+swiftshader → drive the
render via the IDB-FREE seam (`window.__dwRender` / a new `window.__seedTrunkProbe`), NOT the production discWalk path.

## TASK 1 — RENDER GATE: `window.__seedTrunkProbe` + W-SEED-TRUNK-RENDER (machine verification, no eyeballs)
Mirror `__dwPixelProbe` for the seed-trunk. In `modeller.html`, add a render-only seam:
- `window.__seedTrunkProbe = function(disc, net)` → call `_renderSeedTrunk(disc, net)` then return a SCENE-GRAPH CENSUS of
  `_dwRoot()`: number of `LineSegments` tagged `userData.dwTrunk===disc`, total vertex count (`geometry.position.count`),
  riser-segment count, a sampled vertex == a known `net` polyline point (the render must not drift from `planTrunk`'s
  coords — whitebox, like §DW-TUBE endpointDrift), + a one-frame `readPixels` litPct (canvas non-blank).
- Witness `modeller/tests/witness_seed_trunk_render.js` (W-SEED-TRUNK-RENDER, puppeteer, the WORKING flags above):
  IDB-free — fetch Duplex DBs, `dwOpen`, `dwWalk('ELEC')`, `defaultSeed`, build `net` via `SeedTrunk.planTrunk`, then
  `__seedTrunkProbe('ELEC', net)`. ASSERT: LineSegments>0, vertices == 2×(Σ polyline segs + risers) (gate asserts
  render==data, not a magic number), sampled vertex matches the net coord (drift<1e-3), litPct>0, no pageerror.
  REGRESSION: W-DW-PIXELPROBE still green.
- This becomes the STANDING render gate (add to the headless CI subset per `docs/TestArchitecture.md §Browser Testing`):
  every future render change is GATED, not eyeballed. ALSO improve `§SEED-TRUNK` whitebox log to print the rendered
  segment/riser counts (the §-log-first principle: the coder reads § lines to confirm the render, Playwright second).

## TASK 2 — CONSTRUCTION ANIMATION (the UX question: SEE the discipline being built)
TODAY the render is INSTANT — fixtures (boxes), chains (tubes), and the trunk (lines) all appear in ONE frame; there is
NO animation of construction. DECISION (user-raised 2026-06-30): animate the disc APPEARING/CONSTRUCTING so the user
WATCHES the service get laid from the entry outward. This is both a wow-factor UX AND a human-visible verification
(you SEE it build correctly, edge by edge). Spec:
- Reveal the trunk progressively from the SEED outward by graph distance (BFS order from the seed): grow each storey's
  corridor polylines edge-by-edge, then the riser CLIMBS, then the upper storey grows — over ~1.5–2.5s, eased.
- Implement as a per-frame draw-range on the `LineSegments` geometry (`geometry.setDrawRange(0, n)` advancing by frame)
  or staged add; respect `prefers-reduced-motion` (instant fallback). Fixtures can pop-in along the same front.
- Keep it a RENDER-only effect — the data (`net`) is computed up front and unchanged; the animation reveals it, never
  invents order beyond the seed-distance BFS (traceable). Add an `§SEED-TRUNK-ANIM` log line (frames, total ms, final
  segment count == net) so the render gate (Task 1) can assert the animation ENDS at the full proven geometry.
- Deploy: bim-ootb worktree off origin/main → sw bump → PR → live-verify with the headless probe (Task 1) + a real-browser eyeball.

## ACCEPTANCE
- T1: W-SEED-TRUNK-RENDER green (LineSegments+risers in the scene graph == planTrunk net, canvas paints), runs headless
  with the swiftshader flags, no pageerror; added to the headless CI subset. The eyeball gap is CLOSED by a machine gate.
- T2: opening a building → walk → "Route trunk" animates the trunk constructing from the seed (reduced-motion safe),
  ending EXACTLY on the proven geometry (gate-asserted). Deployed live + verified.
- Both: non-invent (render reveals computed data; no fabricated order/geometry). docs/internal/WalkerMaturity.md SEED-TRUNK → note the gate.
```
```
