# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** coalesce/defer the Time Machine event-index rebuild while a building is still streaming
in. Nothing else. **Read the log after every run** — the witness is `§PERF_INCR_INDEX` COUNT during
a streamed load with TM active (currently ~10+ on LTU), not a feeling.
**Status:** OPEN (filed 2026-07-20 when its parent files retired to done/ — this is the ONE item
from that lane that never got fixed).

## The measured problem (already witnessed live, 2026-07-20, LTU 122k)
Turn TM on while a big building is still progressively streaming: every streaming batch bumps
`A._metaGen` → `_tmSceneSig` change → full `_tmBuildEventIndex()` rebuild → `_incrPrimed=false` →
next pass forced `mode=full`. Live log showed 10+ cycles of
`§PERF_INCR_INDEX built meshes=<growing> ... ms=50-159` + `§PERF_TRAVERSE ms=20-41 ... mode=full`.
Correct behavior by the staleness design, but a real 0.5-2s of stacked main-thread cost per load,
felt as early-session lethargy. Provenance: `prompts/done/TOUR_WALKMODE_IDLE_PARK_STUCK.md` §5 and
`prompts/TM_INCREMENTAL_RENDER_PERF.md` §0a (both now history — this file is the live pointer).

## Fix shape (named then, still the shape now)
Don't rebuild per batch: debounce the metaGen-triggered rebuild (rebuild once, ~500ms after the
last bump), or defer index build until `!APP.streaming` (mirror `§FLY_STREAM_WAIT` doctrine —
DLOD Phase 3's `_dlodEngaged` already gates on `!app.streaming`, same idea). Keep the §4 Risk
discipline from the parent file: a stale index silently corrupts the scene — the equivalence
witness (`mismatch=0`) gates any change here, same as Phases 1-3.
