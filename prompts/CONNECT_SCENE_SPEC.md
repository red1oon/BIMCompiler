# CONNECT SCENE — shared cross-surface context (Modeller ⇄ Viewer ⇄ ERP)

```
# ⚠ DO NOT REMOVE
SCOPE: A "Connect Scene" = a shared CONTEXT that makes the three already-separate surfaces (Bonsai
Modeller, BIM Viewer, iDempiere ERP) TALK — NOT a merge. They keep their own chrome; they share
selection, timeline, and identity over the ONE signed op-log. User idea + agreed take, 2026-06-18.
DOCTRINE GUARDRAIL: surfaces stay PERMANENTLY SEPARATE (modeller↔viewer decree). The Connect Scene
shares CONTEXT ONLY (selection / timeline / identity events) — never DOM, never chrome. This IS the
"handoff" mechanism the separation doctrine always anticipated.
STATUS: BUILDING. P0 ✅ + P1 ✅ (#383) + P2 ✅ (#384). NEXT = fold ERP into P1/P2 (third participant: ERP
  record fold over the authored chain — gated on a real BIM-pushed project, no fabricate), then P3 commit.
  ✅ P0 broker+toggle — W-CONNECT-BUS 4/4 + W-CONNECT-BUS-MODELLER PASS. viewer/connect_scene.js
     (window.Connect; transport = BroadcastChannel[same-origin N-surface] + postMessage + CustomEvent,
     mid-dedup; ping round-trip+ACK). Modeller "Connect" toolbar toggle.
  ✅ P1 selection — W-CONNECT-SELECT PASS across two REAL surfaces over BroadcastChannel: forward
     Modeller→Viewer (highlight 254 real Clinic IfcDoor) + reverse Viewer→Modeller (lands on same feature).
     main.js + modeller.html subscribe/publish 'selection'; resolves by ifc_class bridge (NON-INVENT), echo-
     guarded; ?connect=1 auto-enable. Witnesses: viewer/tests/connect_{bus,modeller,select}_live.js.
  ✅ P2 timeline — W-CONNECT-TIMELINE PASS (#384). Signed op-log IS the timeline: scrub broadcasts the
     op-cursor over 'timeline' → connected surfaces fold the one log to the same op_hash. TWO folds at once
     (geometry meshes + records foldRecords) → scrub back before a feature = geometry AND record both vanish,
     forward restores, lockstep cross-surface. Broker self-guard fixed to key on per-INSTANCE token (two tabs
     of the same surface now talk). modeller scrub→publish + subscribe→scrubTo(both folds), echo-guarded.
     Witness: viewer/tests/connect_timeline_live.js. ⚠ deeper ERP-record co-vanish (one surface folds another's
     authored chain) needs the authored→ERP bridge / real BIM-pushed project — do NOT fabricate.
  ↪ REBRAND (user decree): modeller 'Bonsai' → 'DAGeVu' (visible strings only — title/banner/toast;
     window.Bonsai API + bonsai_*.js + W-BONSAI-* ids unchanged, developer-facing).
  ↪ 2026-09-13: `prompts/RATES_SOURCE_OF_TRUTH.md` names **P3 as the dependency** for a specific real use
     case (edit a wall in the Modeller → switch to the Viewer → see the 4D/5D/cost consequence already
     reflected) — the recommended alternative to ever teaching the Modeller its own scheduling-rates
     machinery. Raises P3's priority; doesn't change its scope.
     ↳ **USER DECIDED same day: that route STANDS** ("I am for it, if this is better organised reuse, now
     by Modeller"). So P3 is no longer a recommended dependency, it is the AGREED one — the Modeller will
     never carry rates/scheduling machinery, and this channel is how it sees 4D/5D consequence. Scope
     unchanged: `W-CONNECT-COMMIT` as already written below. The §2 audit behind that decision also found
     the Viewer's own `sequence_rules.json` is a MIRROR, not live for the 4D bake (§2-RESULT there) —
     which is the concrete reason NOT to point a second surface at it.
LOG MANDATE: after ANY witness run, read the log before conclusions.
```

## THE TAKE (refined from the user's idea)
The user's framing is exactly right: **not a merge, a shared context that makes them talk.** My refinements:

1. **It's a BROKER, not a surface.** A tiny shared module `connect_scene.js` (`window.Connect`) that any
   surface *registers* with and then publishes/subscribes over. No surface owns it; no DOM is shared.
2. **Identity is the anchor, and it already exists.** The signed op-log (`kernel_ops.js`, shipped in BOTH
   `viewer/` and `erp/`, hash-chained + edge-signed) is the common source of truth. Every cross-surface
   reference is BY SIGNED IDENTITY (op_hash / featureId ⇄ guid ⇄ ERP record id), never by ad-hoc id — so a
   thing selected in one surface resolves to the *same signed entity* in the others. This is the deep
   correctness the whole lane was built toward (W-KERNEL-SIGNED / W-BONSAI-SIGNED: one signed log backs
   BOTH ERP records AND BIM geometry).
3. **Don't invent transport — GENERALIZE what ships.** The selection bus already exists between ERP and the
   embedded Viewer: `erp/bim_panel.js` ⇄ `viewer/main.js`+`viewer/picking.js` speak `bim:ready` /
   `bim:highlight` / `bim:highlighted`(ACK) / `bim:focusRecord` / `bim:clearHighlight` over `postMessage`
   (B3 cross-highlight, PR #369). The Connect Scene = (a) lift this into a typed 3-channel protocol,
   (b) abstract transport (postMessage when cross-document/iframe, in-process CustomEvent when same-doc),
   (c) add the **Modeller as a third participant**.
4. **Three channels, all anchored on the signed identity:**
   - **selection** — pick in any surface → the others highlight/focus the same signed entity. (Modeller
     feature → Viewer silhouette via `picking.js focusElement` → ERP focus the owning Project/Order line.)
   - **timeline** — the signed op-log IS the timeline. Scrub in one → all fold to the same op_hash. KILLER
     DEMO: scrub back before a feature → its GEOMETRY *and* its ERP record both vanish (one log, two folds).
     Adapt `viewer/universal_history.js` (the shipped history engine) as the shared scrubber.
   - **identity/commit** — a commit in any surface appends to the shared chain → broadcast `{tip}` → the
     others re-fold the affected slice (bidirectional feedback). Author a wall in the Modeller → ERP shows
     the new line (where mapped) → Viewer shows the geometry.
5. **The toggle.** A "Connect" button in the Modeller activates the broker (opt-in — it's a powerful
   cross-surface mode). Off = surfaces independent. On = a small "connected surfaces" indicator + live sync.

## WHY THE OP-LOG MAKES THIS SOUND (not hand-wavy)
- The op-log already unifies the data layer (signed kernel_ops backs ERP + geometry). The Connect Scene is
  ONLY the runtime/UX layer that lets surfaces subscribe to + broadcast over that shared identity.
- The regen cache (PR #382) keys geometry by op_hash; cross-surface selection/timeline keying by the SAME
  op_hash means selection and scrub are O(1) cache-aligned across surfaces.

## BUILD PHASES (new session — each = ONE witness, build leg-by-leg)
- **P0 — Broker + toggle (`W-CONNECT-BUS`):** `viewer/connect_scene.js` (`window.Connect`: `register(surface)`,
  `publish(channel,payload)`, `subscribe(channel,fn)`; transport = postMessage|CustomEvent auto-detected).
  Modeller "Connect" toggle button. Witness: two registered surfaces exchange a ping round-trip (+ ACK), the
  toggle gates it.
- **P1 — Selection channel (`W-CONNECT-SELECT`):** generalize the `bim:*` protocol; Modeller pick →
  `Connect.publish('selection',{op_hash,featureId,guid,ifcClass})` → Viewer highlights (reuse
  `picking.js focusElement`), ERP focuses the owning record (reuse `bim_panel.js` `bim:focusRecord` path).
  Reverse too. Witness: pick in each surface → the other two land on the SAME signed entity.
- **P2 — Timeline channel (`W-CONNECT-TIMELINE`):** shared scrub over the one signed chain (adapt
  `universal_history.js`). Witness (the killer demo): scrub before a feature → geometry gone in Modeller/Viewer
  AND the ERP record gone — fold both from the same op_hash cursor; deterministic; scrub forward restores both.
- **P3 — Identity/commit channel (`W-CONNECT-COMMIT`):** a commit in one surface → `Connect.publish('identity',
  {tip})` → others re-fold the affected slice. Witness: author in Modeller → Viewer + ERP reflect it live;
  verifyChain ok throughout (still one signed log).

## GROUNDED POINTERS (verified 2026-06-18, bim-ootb)
- Selection bus to generalize: `erp/bim_panel.js` (host: posts `bim:highlight`, listens `bim:ready`/`bim:highlighted`/
  `bim:focusRecord`) ⇄ `viewer/main.js` + `viewer/picking.js` (embedded viewer side). Messages: `bim:ready`,
  `bim:highlight`, `bim:highlighted`, `bim:focusRecord`, `bim:clearHighlight`.
- Shared signed op-log: `viewer/kernel_ops.js` == `erp/kernel_ops.js` (commitGroup / verifyChain / op_hash chain).
- History engine to adapt for the shared scrubber: `viewer/universal_history.js`.
- Modeller op-log seam: `viewer/bonsai_oplog.js` (`window.Bonsai.oplog`: `_geomOps` now carries `op_hash`;
  `scrubTo`, `deleteFeature`, `undo`/`redo`); fold = `viewer/bonsai_kernel.js foldChainToScene` (regen-cached).
- Modeller selection: `viewer/modeller.html` `window.Bonsai.select(featureId)` + `highlight()` + outliner
  `setActive`. Worktree `/tmp/wt-bonsai`; witnesses `viewer/tests/bonsai_*_live.js` (puppeteer-Chromium pattern).
- Component identity bridge: a library component carries `ifc_class` (W-BONSAI-INSERT); ERP product Value == IFC
  class (B3 mapping, see [[project_holy_grail_engine_law]] / BIM-embed §B3) — reuse for selection resolution.

## REUSE THE WITNESS HARNESS
puppeteer-Chromium + own http server (Node18 can't host occt — V8 too old for WASM tail-calls). For multi-surface
witnesses, drive two pages / an iframe in one context. Templates: `viewer/tests/bonsai_*_live.js`. occt Vec3 =
`{x,y,z}` not array; WebGL needs `--use-angle=swiftshader`.

## NON-INVENT BOUNDARY
Cross-surface mappings (feature↔record) must FOLD from the signed op-log + existing AD/IFC-class bridges, never be
hand-coded per pair. If a mapping isn't derivable, surface it as `⛔ BLOCKED: <the one question>` — do not fabricate.
```
```
