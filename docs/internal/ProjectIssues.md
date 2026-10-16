# Project Issues — upstream bugs found in third-party dependencies

**Purpose:** track real bugs found in vendored third-party libraries during this project's own
work, verified against the library's actual issue tracker (not assumed), so a future session can
file/PR them correctly on the first pass — following each project's own actual process, not a
guessed one. Every claim below was checked live (WebFetch/WebSearch, 2026-07-17), not inferred.

---

## `0beqz/realism-effects` (SSGI/TRAA effects for three.js)

**Repo:** https://github.com/0beqz/realism-effects — MIT licensed, actively maintained, a v2/
`poisson-recursive` branch is in progress for a reworked SSGI (better perf/quality/memory) —
worth checking whether that branch has already absorbed any of the below before filing.

**Contribution process (confirmed live, no CONTRIBUTING.md exists, inferred from repo state):**
- Standard GitHub Issues/PRs — no separate template process to follow beyond the normal flow.
- Dev setup: `git clone https://github.com/0beqz/realism-effects && cd realism-effects/example
  && npm i --force && npm run dev`.
- Code quality enforced via ESLint (`.eslintrc.cjs`/`.eslintrc.json`), `.clang-format`, Husky
  git hooks — match these before submitting, or the hooks will flag it.
- Primary language GLSL (shaders) + JS. 31 open issues, 4 open PRs at time of writing — active
  enough that a well-evidenced PR is likely to get reviewed, not ignored.

**Two currently open, unresolved issues our fixes directly explain — lead with these, don't file
fresh duplicates:**
- **#46 — "Sometimes buffers degradate to black"** (https://github.com/0beqz/realism-effects/issues/46).
  Reporter has no reproduction steps, no diagnosis, still open. This is the same symptom class our
  `useDirectLight` and depth-pack fixes (below) resolve.
- **#48 — "Whether to update Threejs to a new version and the current version is experiencing
  strange noise"** (https://github.com/0beqz/realism-effects/issues/48). No maintainer response,
  no diagnosis, still open. Matches our noise/transparency findings.

**Our three root-caused fixes, PR-readiness assessed individually (don't bundle all four
BatchedMesh-enablement patches in with these three — see caveat below):**

1. **`useDirectLight` never engages.** The library only sets that shader define inside
   `updateUsingRenderPass()` on an `isUsingRenderPass` TRANSITION — but the effect constructs
   with it already `true`, and the "set false next frame" rAF that would normally trigger the
   transition gets cancelled by every `update()` call in a continuously-rendering composer, so
   the transition condition never fires and the define never lands. Without it (and with no
   `scene.environment`), the effect's only light inputs are emissive (zero) + accumulated GI
   (starts black) → permanently black. **Fix:** call `ssgi.updateUsingRenderPass()` once,
   explicitly, right after construction. Self-contained logic bug in the library's own state
   machine, independent of three.js version or BatchedMesh. **PR-ready as-is.**
2. **Depth-pack layout mismatch on r185.** The denoiser's hand-rolled far-plane check
   (`depthTexel.r>0.9999`) assumed a specific byte-significance layout that no longer matches
   what's actually being read at establishing-shot distance, discarding ~every building fragment
   and leaving denoise targets at their initial-zero (hard black), compounded by this app's
   `renderer.autoClear=false`. **Fix already written layout-agnostic** — uses
   `unpackRGBAToDepth`-based comparison instead of assuming a fixed byte order, so it isn't a
   hack tied to what we happened to observe on r185. **PR-ready as-is**, and the most valuable of
   the three since it's the most likely one to keep breaking other users on newer three.js
   revisions too.
3. **Uninitialized GLSL bools → NaN-poisoned importance sampling.** `importanceSampling` defaults
   on and, with no `scene.environment`, sampled the library's default 1×1 env-info textures while
   also reading uninitialized GLSL bools — producing NaNs in the raw GI that poisoned temporal
   accumulation. **Fix:** initialize those bools. Clean, self-contained correctness bug. **PR-ready
   as-is.**

**Not yet PR-ready — needs generalization first:** the 4 patches that were required just to get
the library *running at all* on `BatchedMesh` geometry (predates `BatchedMesh` in the library's
own history). These were found/applied against this project's own vendored, hand-bundled copy
(`viewer/lib/postprocessing-n8ao.bundle.js`), not against a clean checkout of the library in its
normal npm-package form — before filing, diff them against a fresh `git clone` + the documented
dev setup above to confirm they're general fixes and not artifacts of this project's specific
bundling/build process.

**Evidence available to attach to any filed issue/PR** (already produced this session, not
hypothetical): measured accumulation-frame-counter jump (~1 → ~130) and residual drop (8.5% →
0.4%) after the fix; live screenshots; the exact commit messages in `bim-ootb` describing each
root cause (`ff29636`, `51851e3`/`b83d0bf`, and the follow-up ghosting fix in `7c2ba07`+`c04ece3`
for the related camera-pose/SVGF-reset issue found afterward — a fourth, separate finding, not
yet cross-checked against realism-effects' own issue tracker; do that before including it in the
same PR as the three above, since it may be specific to this app's on-demand render loop rather
than a library bug).

---

## `mrdoob/three.js`

**No actionable upstream bug found here** — checked the official r180→r185 Migration Guide
directly; depth packing isn't mentioned in any of those revision sections. The one related issue
found, `packDepthToRG seems broken` (#28692, https://github.com/mrdoob/three.js/issues/28692), is
a **different** bug (RG-only pack/unpack losing MSB data), already fixed upstream in r167 — not
the same finding as our #2 above. Do not conflate these when writing up either fix.

**Forward-looking note, not an issue to file:** three.js is developing a native `SSGINode`
(https://threejs.org/docs/pages/SSGINode.html) as part of its newer TSL/WebGPU node-material
system. A future three.js major version could make the whole `realism-effects`-plus-patches
approach here obsolete in favor of an official first-party one — worth periodically checking
`SSGINode`'s maturity, not something to act on now.

---

## Recommended next action (not yet done — for whichever session picks this up)
File PR #1 first (the three lighting/noise root causes together, referencing #46 and #48 by
number in the PR description) against a **fresh clone** of `realism-effects` main (check
`poisson-recursive` first in case v2 already fixed some of this) — do not submit a diff of the
vendored bundle directly, rewrite as a clean patch against the library's real source layout.
