# ⚠ DO NOT REMOVE
**Scope:** a HORIZON note — where the photoreal side could go, and why it is cheap or expensive from
where we already stand. **Nothing here is scheduled and nothing here is a work order.** It exists so
a good idea is not lost and a bad re-attempt is not repeated. Foundation first; see §Gating.
**Read the log after every run** if any of this is ever picked up — verification here is `§`-tagged
numbers, never screenshots (CLAUDE.md FUNDAMENTAL LAW).

---

# §RENDER_HONEST_SCORE — where the render stack actually stands (2026-07-26)
Assessed from the code, not from impressions. What exists today: HDRI image-based lighting with
PMREM and a race guard so frame 0 never bakes the placeholder sky (§CINEMA_HDRI_RACE), real sun +
shadow maps, SSAO **and** N8AO, TAA 16-sample jittered accumulation for Alt+S stills, SSAA level 2
for recordings, triplanar materials, photo-cutout staffage with real-RPC detection.

| | score | why |
|---|---|---|
| Exterior daylight | **8/10** | The easy case for IBL: the dominant light IS the sky dome, and the HDRI literally is the sky dome. Sun + shadows + AO + supersampling on top gets genuinely close. Little of what a heavy engine adds is visible. |
| Interior | **5/10** | Dominated by INDIRECT light — sun through a window bouncing off floor and walls. That is the missing term, and AO cannot fake it: AO darkens creases, it does not add bounced fill. |

**The bit that matters for the film:** the cinema path spends its first ~14 of 24 s **indoors**
(dive → spin → walk-out) and only the last ~9 outside. The weakest region of the stack is exactly
where the movie spends most of its runtime. That is the case for caring about bounce light at all.

# §GI_BAKE_BUDGET — the fresh angle on light bouncing (user: "perhaps later we revisit")
An earlier bounce-light attempt went badly ("was terrible"). **Find out WHY before re-attempting — it
is not recorded here and must not be guessed at.** But there is one angle that may not have been
tried, and it is not a better algorithm:

`§GI_CINEMA_PRESET` measures N8AO at full res ~**317 ms/frame**, and the code calls a GI-active
recording "a ~3fps slideshow", so it drops to halfRes + reduced samples for the duration. **That
judgement is against a REALTIME budget.** MaxQ is an *offline bake* that already tolerates ten-plus
minutes per film and waits up to 20 s just for an HDRI. Bounce light that is hopeless at 60 fps can
be entirely affordable at 30 s/frame.

So the question to re-ask is not "can we afford GI?" but **"can we afford GI in the BAKE?"** — two
different budgets. The architecture already has the seam: §GI_CINEMA_PRESET saves and restores
quality settings around a recording, i.e. navigate-tier and bake-tier quality are already separate
concepts. Existing spikes to start from, not from scratch: **Alt+G** (N8AO POC) and **Alt+J** (SSGI,
realism-effects spike).

# §TWINMOTION_WISHLIST — distant target, recorded not scheduled
User: *"placing persons in rooms on the fly during preview, with flower pots and other props (this is
a long study but a distant target that can be done once the foundation is strong)."*

What it would build on, all of which already exists:
- the staffage sprite system and its asset table (`_STAFFAGE_PEOPLE` / `_STAFFAGE_TREES`);
- the **room graph**, which already knows what a room IS — so "place a person in *this room*" is a
  query we can already answer, unlike a generic 3D editor that only knows world coordinates;
- `staffage_instances` persistence, measured round-tripping 2026-07-26;
- the MaxQ **preview** beat and the §CINEMA_PATH_EDITOR dialog — the natural "adjust before
  recording" moment already exists and would not need inventing.

**The one architectural observation worth keeping:** today's staffage is *auto-placed* (derived from
frame/frustum/clearance rules). Hand-placed people and props are *authored*. That is the same class
as an edited cinema path and an edited staffage set — **user-authored scene data that must be STORED,
never re-derived** (prime rule: EXTRACT OR COMPILE ONLY). We are now on the verge of having three
separate tables for one idea (`staffage_instances`, `cinema_path`, and a future props table). If this
is ever picked up, **design the authored-scene-data mechanism ONCE** rather than growing a third
bespoke one — that decision is cheap now and expensive after users have saved files.

# §Gating — what must be solid before any of the above is worth starting
1. `§CINEMA_ATTIC_PICK` — the dive default (see `prompts/CINEMA_PATH_EDITOR.md`).
2. `§STAFFAGE_PAX_REJECT`'s 69 unattributed rejections — only ~3 figures are ever placed today;
   populating rooms by hand is moot while automatic population is quietly rejecting 96% of candidates.
3. `§CINEMA_PATH_EDITOR` shipped, because it establishes the adjust-before-record pattern the props
   idea would reuse.
