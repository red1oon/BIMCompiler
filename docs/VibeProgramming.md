# Vibe Programming — How This Compiler Was Built

> **Foundation:** [The Drift](LAST_MILE_PROBLEM.md) · [TestArchitecture](TestArchitecture.md) · [MANIFESTO](MANIFESTO.md)
> **By the numbers:** [Project Chronology](PROJECT_CHRONOLOGY.md) — dated milestones + commit/fix ledger, Federation → Compiler → Browser.

<div class="bim-banner" markdown>
<b>One human. Zero traditional coding.</b> This compiler was built by a Java-literate ERP architect using AI as a force multiplier — domain expertise steers, AI types at the speed of thought. Current metrics in [PROGRESS.md](https://github.com/red1oon/BIMCompiler/blob/master/PROGRESS.md).
</div>

---

## What Is Vibe Programming?

In February 2025, Andrej Karpathy (co-founder of OpenAI, former Tesla AI director) coined the term:

> *"There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."*

He described accepting LLM suggestions without fully reading the code, running the app, seeing if it works, and iterating. He noted this works for throwaway weekend projects, not production code.

**This project disagrees with half of that statement.** The BIM Compiler is production-grade — 33 buildings compiled, 6 mathematical gates, deterministic output. But it was built entirely through AI-assisted programming. The difference: **domain expertise is the guard rail, not the code.**

---

## The Industry Numbers

The shift is real. These are the numbers the sceptics should weigh:

| Metric | Figure | Source |
|--------|--------|--------|
| Developers using or planning to use AI tools | 76% (2024) → 84% (2025) | Stack Overflow Developer Survey 2024 / 2025 |
| GitHub Copilot paid users | 2M+ | GitHub, late 2024 |
| Code suggestions accepted (Copilot) | ~30% | GitHub Blog, 2023-2024 |
| Developer task completion speed with AI | 55% faster | GitHub/Microsoft Research, 2023 |
| AI-generated code share in enabled repos | ~46% | GitHub Octoverse 2024 |
| Code churn (new code revised within 2 weeks) | 3.1% (2020) → 5.7% (2024) → 7.1% (2025) | GitClear, 211M-line study, 2025-2026 reports |

That churn trajectory is the one that matters — and it kept climbing after this paper first cited it. Adoption went up; stability did not follow. More usage produced more code, written faster, more of which got rewritten within two weeks. This is the central risk — and the central problem this project solved.

---

## 2026: The Industry Starts Lamenting "Vibe Slop"

Sixteen months after Karpathy's tweet, the term earned an unflattering sequel. In a May 2026 *Wall Street Journal* interview, **Mario Zechner** — an engineer behind Pi, OpenClaw's foundational engine — put it bluntly:

> *"You see infrastructure crumbling, and software is now much, much more buggy than before. We can keep playing this game for a few more months, maybe even years, but eventually it's going to come back to bite us."*

His collaborator **Armin Ronacher** coined the harsher phrase: "vibe slop at inference speeds." Even Karpathy walked part of it back — building his `nanochat` model, he found AI tools "just didn't work well enough at all and net unhelpful," and wrote it by hand instead.

The trend data backs the lament:

| Metric | Figure | Source |
|--------|--------|--------|
| Developer trust in AI code accuracy | 40% (2024) → 29% (2025) | Stack Overflow Developer Survey 2025 |
| Developers with a favorable opinion of AI tools | 72% (2024) → 60% (2025) | Stack Overflow Developer Survey 2025 |
| Cite "almost right, but not quite" as their #1 AI frustration | 45% | Stack Overflow Developer Survey 2025 |
| Spend more time fixing AI output than writing it themselves | 66% | Stack Overflow Developer Survey 2025 |
| Copy-pasted code, share of all lines | 8.3% (2020) → 12.3% (2024) | GitClear AI Copilot Code Quality 2025 |
| Refactored ("moved") code, share of all lines | 24.1% (2020) → 9.5% (2024) | GitClear AI Copilot Code Quality 2025 |
| AI-generated code samples failing security tests | 45% overall, 72% for Java | Veracode, 100+ LLMs / 80 coding tasks, 2025-2026 |
| Enterprise tech leaders seeing more production issues from AI code | 81% | CloudBees State of Code Abundance 2026 |
| ...same leaders still confident shipping it anyway | 92% | CloudBees State of Code Abundance 2026 |
| Fortune 50 monthly AI-code security findings, Dec 2024 → Jun 2025 | ~1,000 → 10,000+ | Apiiro, via Cloud Security Alliance research note 2026 |

**A concrete case:** in March 2026, Amazon suffered two outages within one week, traced in part to AI-assisted code changes — the first cost 120,000 lost orders and 1.6 million website errors, the second 6.3 million lost orders (Business Insider, via CloudBees).

**This project's answer to the lament is not "the sceptics are wrong."** They're right, and the numbers above are worse than when this paper was first written. The disagreement is about the fix. The industry-wide pattern is AI code shipped *without* an independent, deterministic check — trust the vibes, ship, discover the crumbling infrastructure later. This project inverts that: [6 mathematical gates](TestArchitecture.md) that don't care about vibes, where G3 alone can fail a build over one wrong coordinate in 48,428 elements. The backlash is evidence the industry needs more projects built this way, not fewer.

---

## Why It Works Here (And Fails Elsewhere)

Most vibe-coded projects fail because the human doesn't know what correct looks like. They accept whatever the AI produces because they can't evaluate it. The AI is both the author and the reviewer — a closed loop with no external ground truth.

This project has three things most don't:

### 1. A domain expert who knows what correct looks like

The creator, [Redhuan D. Oon](mailto:red1org@gmail.com), has two decades in ERP systems — [ADempiere](https://adempiere.net/) (2006), [iDempiere](https://idempiere.org/) (2010), and the BIM Compiler (2025). He helped start the ADempiere fork that led to iDempiere, wrote plugins and core improvements in Java, and knows the language and the ERP internals. But vibe programming changes the role: instead of typing Java line by line, he **supervises at the speed of thought** — his Java insight provides the key questions that steer the AI, while the AI handles the typing at a pace no human can match.

He writes **specifications**: what M_BOM means, how C_Order flows, why a wall must sit on a slab. The AI writes the Java. The domain expert evaluates whether the output is correct — not just by reading the compiled building, but by asking the precise Java questions that expose whether the AI's implementation actually honours the spec.

This is not a non-programmer hoping AI gets it right. This is a **Java-literate ERP architect using AI as a force multiplier for his domain expertise**.

### 2. Deterministic verification (no "looks right")

Every compiled building passes through [6 mathematical gates](TestArchitecture.md):

| Gate | What it proves |
|------|---------------|
| G1 COUNT | Input BOM quantity = output element count |
| G2 VOLUME | Compiled bounding volume matches reference |
| G3 DIGEST | Byte-level hash of output matches known-good baseline |
| G4 TAMPER | No file was modified outside the compilation pipeline |
| G5 PROVENANCE | Every output element traces back to a BOM line |
| G6 ISOLATION | No cross-building contamination between compilations |

The AI cannot cheat these gates. G3 alone — a cryptographic digest of the entire output — means a single wrong coordinate in a 48,428-element building fails the build. There is no "close enough."

### 3. The Drift is tracked, not hidden

When AI-generated code drifts from spec — and it does, consistently — the drift is documented. [The Drift](LAST_MILE_PROBLEM.md) tracks every known failure mode: walls that don't sit on slabs, columns that overlap, coordinates that shift by millimetres. 11 drift points, each citing the spec section it violates.

The project doesn't pretend AI code is perfect. It assumes AI code will drift and builds the infrastructure to catch it.

### 4. Build on known frameworks, never from scratch

This may be the most important lesson after months of vibe programming: **LLMs extrapolate well from established patterns. They hallucinate when there is no pattern to follow.**

Every major module in this project is built on a framework the LLM already knows:

| Module | Framework it builds on | Why the AI gets it right |
|--------|----------------------|------------------------|
| Data model | [iDempiere](https://idempiere.org/) ERP tables (M_Product, M_BOM, C_Order) | 20 years of open-source ERP code in training data |
| Compilation pipeline | [Bill of Materials](https://en.wikipedia.org/wiki/Bill_of_materials) explosion — standard MRP pattern | Textbook manufacturing algorithm, widely documented |
| Geometry verbs | Trigonometry, linear algebra, coordinate transforms | Maths doesn't drift — `cos(30°)` is `cos(30°)` in every language |
| Validation rules | [iDempiere AD_Val_Rule](https://wiki.idempiere.org/) pattern | Same validation framework used across the ERP ecosystem |
| 3D viewport | [Bonsai](https://bonsaibim.org/) / Blender Python API | Massive open-source codebase, heavily represented in training data |
| Test architecture | JUnit 5 + SQLite assertions | Standard Java testing — the AI writes these fluently |

When the AI is asked to "write a BOM explosion algorithm," it draws on thousands of MRP implementations it has seen. When asked to "compute a rafter length from pitch and span," it applies trigonometry it has been trained on extensively. When asked to "create a Blender panel with property fields," it follows Bonsai patterns it has seen in the IfcOpenShell codebase.

The failures come when the AI is asked to do something with **no framework precedent** — spatial reasoning about whether a wall sits on a slab, or whether two columns overlap in 3D space. These are the [drift points](LAST_MILE_PROBLEM.md). The pattern: **known framework = reliable code. Novel spatial reasoning = drift.**

The practical rule: if you can frame your problem as an instance of a pattern the LLM has seen before, vibe programming works. If you're inventing a new pattern, write the spec first and supervise every line.

---

## The Toolchain

This project uses [Claude Code](https://claude.ai/), Anthropic's CLI agent, as the primary development environment. The tools that make it work:

| Tool | Role |
|------|------|
| **Agent** (parallel subprocesses) | 4 research threads simultaneously — codebase search, spec verification, test runs in parallel |
| **Bash** (unrestricted shell) | `mvn compile`, `git`, `sqlite3`, pipeline scripts — the AI runs the full build chain |
| **Grep + Glob** (ripgrep-speed search) | Pattern matching across 400+ Java files in milliseconds |
| **Edit** (surgical diff) | One exact string replacement — not whole-file rewrites |
| **Read** (multimodal file access) | Code, images, PDFs, screenshots — the AI reads the same artefacts the architect reads |

The workflow:

```
Architect writes spec (what to build, why, constraints)
     ↓
AI reads spec + existing code + test architecture
     ↓
AI writes code (Java, SQL, YAML)
     ↓
AI runs tests (mvn test, Rosetta Stone gates)
     ↓
Gates pass? → commit. Gates fail? → AI reads drift doc, fixes, retries.
     ↓
Architect reviews compiled building in Bonsai viewport
     ↓
Building correct? → next task. Building wrong? → new drift point logged.
```

**Session discipline:** One bounded task per session. The AI reads the spec before writing code. Every code change cites the spec section it implements. Pre-flight citation is mandatory:
```java
// Implementing BBC.md §3.5.2 — Witness: W-FORGE-1
```

---

## What the Sceptics Get Right

The concerns are valid. This project has lived through all of them:

**"AI code drifts from architecture."** Yes. Relentlessly. The AI will invent shortcuts, merge concerns that should be separate, and silently change assumptions. [The Drift](LAST_MILE_PROBLEM.md) exists because this happened dozens of times. The solution is not to stop using AI — it's to build gates that catch the drift before it ships.

**"AI code has more bugs."** True, and getting worse, not better — GitClear's code churn climbed from a 3.1% pre-AI baseline to 7.1% by 2025, and Veracode found 45% of AI-generated samples fail security tests outright (see [2026: The Industry Starts Lamenting "Vibe Slop"](#2026-the-industry-starts-lamenting-vibe-slop) above). This project's answer: 6 gates, 408 tests, 35 reference buildings. The bug rate per shipped line is lower than most hand-written projects because the verification is more rigorous, not because the AI writes better code.

**"You don't understand your own codebase."** Partially true. The architect understands the *architecture* — what each module does, how data flows, what correct output looks like. He does not memorise every Java method signature. This is a feature, not a bug: the spec is the source of truth, not the code. If the code drifts from spec, the code is wrong — regardless of what it says internally.

**"It won't scale."** Tens of thousands of elements in the Terminal building. Multiple pipeline stages. Multiple databases. Dozens of specification documents. The project is larger than most startups' entire codebases. It scales because the architecture scales — not because the AI understands scale.

---

## The Honest Ledger

| What works | What doesn't |
|---|---|
| Spec → code → test → ship pipeline | AI cannot see spatial geometry — walls, slabs, collisions |
| Parallel agent research (4 threads) | AI invents plausible-looking code that violates spec |
| Deterministic gates catch all regressions | AI cannot evaluate aesthetic quality of compiled buildings |
| Domain expert catches architectural drift | AI forgets constraints from earlier in the conversation |
| 100 sessions, each bounded and verified | Long sessions degrade — quality drops past ~80% context |

The project succeeds not because AI is reliable, but because the verification infrastructure assumes AI is unreliable and proves correctness independently.

---

## Case Study: RTree Federation Viewer (S180–S189)

The strongest evidence for vibe programming at scale is the RTree federation viewer — a city-scale BIM viewer built inside Blender's Bonsai addon in ~3 weeks of Claude-assisted sessions.

### What was built

| Component | Lines | What it does |
|-----------|-------|-------------|
| `operator.py` | ~9,200 | Modal loaders, BACKEND bake pipeline, live-link, navigation, shred, distro |
| `bbox_visualization.py` | ~1,300 | GPU draw handler, RTree spatial queries, search, drill-down (L0→L1→L2) |
| `blend_cache.py` | ~1,400 | Full load, BLOB tessellation from SQLite, LOD manager |
| `blob_tessellate_worker.py` | ~420 | Discipline-based chunk baking subprocess |
| UI panels, logging, tests | ~800 | N-panel cockpit, discipline bars, storey filter |
| **Total** | **~13,000** | **Complete BIM federation viewer** |

### Proven at scale

- **1,063,911 elements** in sandbox city (12 disciplines, 33 buildings)
- **190,000 meshes** tessellated from SQLite BLOBs in <45s
- **Fine-grained Outliner** — VENT/HEAT/PLB/SAN/HVAC/ARC/STR/VOID, not generic MEP
- **Session .blend ~1MB** — links to baked chunks, instant save
- Posted to [osARCH forum](https://community.osarch.org/) with video proof (April 2026)

### What it would cost without AI

| Approach | Team | Duration | Cost (USD) |
|----------|------|----------|------------|
| Expert team (3–4 people) | Blender dev + BIM domain + perf engineer | 6–9 months | $150–300K |
| Single senior generalist | Blender + IFC + SQLite + GPU (rare unicorn) | 12–18 months | $120–200K |
| Outsource to BIM software firm | Contract team | 9–12 months | $200–400K |
| **Claude-assisted (actual)** | **1 domain expert + Claude Code** | **~3 weeks** | **Subscription** |

The skill intersection — `bpy.data.libraries.load(link=True)` + `IfcOpenShell geom.iterator()` + SQLite RTree + Blender GPU instancing + BIM domain knowledge — exists in perhaps 50 people worldwide. Hiring even one of them takes months.

### Why the multiplier is so large

**Iteration speed.** Each "try → see in Blender → fix" loop (baked-link path, disc suffixes, chunk naming, fly-to distance, Outliner hierarchy) takes 5–10 minutes with Claude. A developer would need a day per loop — reading Blender API docs, testing, debugging. S189 alone had ~30 such loops.

**Dead-end detection.** GN mode (Geometry Nodes instancing) was explored S165–S176 then halted — 8-minute evaluation overhead at 500 modifier trees made it unviable. A hired team would have burned weeks before discovering that. Claude explored it in 3 sessions.

**Domain bridging.** The architect brings "PLB pipes should not inflate the building bbox" and "disciplines must be contiguous per chunk." Claude brings `bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)` to force status bar updates during blocking loads. Neither alone could have built this.

---

## Case Study: The Browser Pivot (S165–S231)

The second case study is more instructive than the first, because it documents a **complete architectural reversal** — built collaboratively across 190+ sessions with Claude Code (1,400+ commits to date), where each session's constraints forced the next decision.

### Key turning points at a glance

| Date | Event | Significance |
|------|-------|-------------|
| [2025-10-30](https://github.com/red1oon/IfcOpenShell/commit/f410e32a13297355d8d5aed444ed176dd18e70a0) | "Full IFC4 database extraction and loading — MILESTONE" in the IfcOpenShell federation branch | **True origin.** First proof that IFC could become a queryable SQLite DB inside Bonsai/Blender. |
| [2025-12-18](https://github.com/red1oon/IfcOpenShell/commit/bc76b7123ef8ebc73155fc20a4714f42eaec1029) | PDF Terrain + federation GI database | DB-as-scene-data extended beyond pure IFC geometry |
| [2026-01-25](https://github.com/red1oon/BIMCompiler/commit/1702488d9c974310179d4d111e99e40cfaf1f113) | BIM Compiler repo created; Phase 3+4 Wall/Pipe builders | Work moved into standalone compiler repo; 190+ sessions begin |
| [2026-04-11](https://github.com/red1oon/BIMCompiler/commit/f116fdde35eeccbc1d69dc533a89df17bf38a687) | S173 — library-linked geometry pipeline | **Two-DB split born:** BLOBs in `library.db`, hashes in `extracted.db` |
| [2026-04-11](https://github.com/red1oon/BIMCompiler/commit/f3d2902b2b7fb578b8916565d9db7f1ee76f69bf) | S172 — `geom.iterator()` replaces `create_shape()` | Hash-addressed geometry dedup; 123K unique meshes serve 1M elements |
| [2026-04-12](https://github.com/red1oon/BIMCompiler/commit/2bb9335ed64d6fa8b352cc438872f6a6d4d5e70a) | S175 — GN 500-tree overhead confirmed | **GN halted.** Blender's own instancer had a hard ceiling at building scale |
| [2026-04-18](https://github.com/red1oon/BIMCompiler/commit/66fc9413a9ed8c3ac0b9d900634c57ba2a7e9e65) | S195 — "Direct DB Streaming — no .blend files" | **Bonsai out. Browser in.** Float32 BLOBs work in Python *and* JavaScript — the schema was always the portable part |
| [2026-04-20](https://github.com/red1oon/BIMCompiler/commit/7a19d6e2543aeae89d93d80042bb8704793da193) | S200 — BIM OOTB: single HTML + two DBs + sql.js WASM | **Bonsai becomes optional.** 126K elements in a browser tab, zero install |
| [2026-04-24](https://github.com/red1oon/BIMCompiler/commit/788eb47cc302b680025af07d7f55cc20de0ae742) | S220 — IFC import direct in browser via web-ifc WASM | Full round-trip closes: IFC → browser → same schema → viewer |
| [2026-04-27](https://github.com/red1oon/BIMCompiler/commit/9cca45a365d6dfaa650995288f62f1e08fec8926) | S231 — InstancedMesh, 85% draw call reduction | Hash-addressed schema pays dividends: instancing needed no schema change |
| 2026-04-29 | `docs/SQLite3D_Schema.md` published | Schema formalised as a candidate open standard |

### The assumption we started with

From S165 onward, the viewer was Blender + Bonsai. The BIM compiler produced SQLite databases; Bonsai loaded them. This was the right assumption at the time: Bonsai had GPU rendering, IFC awareness, and a Python plugin API. The goal was city-scale BIM federation inside Blender — a direct extension of the work that began in the [IfcOpenShell federation branch in October 2025](https://github.com/red1oon/IfcOpenShell/commit/f410e32a13297355d8d5aed444ed176dd18e70a0).

### S165–S174: Building the world's most sophisticated Blender BIM viewer

The first attempt at scale used **Geometry Nodes (GN)** — Blender's node-based instancing system — to render 1M elements as GPU instances. By S172, [`geom.iterator()` replaced the slower `create_shape()`](https://github.com/red1oon/BIMCompiler/commit/f3d2902b2b7fb578b8916565d9db7f1ee76f69bf) per-element tessellator, and BLOBs started flowing from SQLite into Blender via `from_pydata()`.

The architecture at S174 was impressive:

- 3-building pipeline (Clinic / Hospital / Terminal), parallel discipline merge
- 123,573 unique meshes in a 305MB `library.blend`
- Hash-addressed geometry deduplication: identical components share one mesh
- `element_instances.geometry_hash` → `component_geometries.vertices BLOB` — [the two-DB split was born here](https://github.com/red1oon/BIMCompiler/commit/f116fdde35eeccbc1d69dc533a89df17bf38a687), not in the browser

### S175: The wall that stopped GN

**One number killed Geometry Nodes:** at 500 modifier trees (each GN instance is a modifier), Blender's evaluation overhead hit **8 minutes per viewport interaction**. The user could not orbit the model. No GN optimisation — chunking, lazy eval, batch size tuning — changed this. [S175 session 2 confirmed it](https://github.com/red1oon/BIMCompiler/commit/2bb9335ed64d6fa8b352cc438872f6a6d4d5e70a): `Collection Info` node with >7K objects causes viewport hang. GN was [halted at S176](https://github.com/red1oon/BIMCompiler/commit/9d1fc6d810993677a4bccab6bc6fa60a7988d5c4).

This was the first crack: the assumed viewer technology had a hard ceiling we hit at real building scale.

### S180–S189: RTree rescues Blender

With GN abandoned, S180 introduced the **RTree Stingy Loader** — load geometry only for elements near the camera, shred everything else, query the SQLite R-tree for the next batch. This worked: `<1s` to first mesh in the viewport at S184. S189 added BLOB tessellation via `from_pydata()` — no `library.blend` file, geometry reconstructed directly from SQLite bytes in Python.

But Blender's save pipeline had its own ceiling. A session `.blend` linking 190K meshes to a baked library file was 300MB+. Every code change required baking. The bake took 45 minutes for a full city. Users needed Blender installed. They needed the Python addon configured. They needed the DB file paths set in the N-panel.

The second crack: Blender was the bottleneck, not the data.

### S192–S193: The last Blender steps

S192 bridged the BLOB gap to the browser — the first time geometry from `component_geometries` was served to a client other than Blender. S193 implemented DLOD auto-linker: `.blend` link/unlink by camera position. These were still Blender sessions. The pivot hadn't happened yet. (DLOD later rewritten as S274 per-slot frustum culling — see `docs/FeatureComparison.md` §Visibility Culling.)

### S195: Bonsai out. Browser in.

The [S195 commit](https://github.com/red1oon/BIMCompiler/commit/66fc9413a9ed8c3ac0b9d900634c57ba2a7e9e65) is where everything flips:

```
[S195] Direct DB Streaming — camera-driven mesh from BLOBs, no .blend files
```

Five months of Blender sessions. 500 modifier trees. 45-minute bake cycles. A 300MB session `.blend`. All of it dissolved by a single realisation: **the data format was the viewer interface, not the Blender addon API.**

If `from_pydata()` in Python could reconstruct a mesh from a BLOB, so could `new Float32Array(blob)` in JavaScript. The BLOB didn't care what consumed it. The SQLite file didn't care what opened it — Blender or a browser tab. Both were doing the same thing: deserialising `float32` bytes and handing them to a renderer.

Bonsai had been the assumed destination since October 2025. S195 made it optional in one session. The schema — built under Blender's constraints — turned out to be the portable part. Everything else was just a renderer.

### S200: BIM OOTB — Two DBs. One browser. Zero install.

```
[S200] BIM OOTB — single HTML + Two DBs + sql.js WASM + Three.js. No server.
Proven at 126K elements (LTU AHouse).
```
([commit 7a19d6e](https://github.com/red1oon/BIMCompiler/commit/7a19d6e2543aeae89d93d80042bb8704793da193))

No Bonsai. No Blender. No server. The same two DBs — `_extracted.db` (semantic index) and `_library.db` (BLOB geometry pool) — that the Blender viewer had been reading since S168 were now loaded into a browser tab via `fetch()` and opened with `new SQL.Database(new Uint8Array(buf))`.

The coordinate transform (`IFC X,Y,Z → Three.js X,Z,-Y`) was the only thing that changed. The schema was identical. The BLOBs were identical. The hash-addressed deduplication was identical.

### S220: IFC import in the browser

```
[S220] IFC import: coord fix, unit scaling, material extraction, boolean openings
```
([commit 788eb47](https://github.com/red1oon/BIMCompiler/commit/788eb47cc302b680025af07d7f55cc20de0ae742))

With web-ifc WASM parsing IFC directly in the browser, the full round-trip closed: IFC → browser → same `_extracted.db` + `_library.db` schema → viewer. Bonsai was no longer needed to create the DBs either.

The Bonsai addon — the assumed viewer from S165 — became one of several *optional* consumers of a schema that now ran everywhere.

### S231: InstancedMesh — the schema pays dividends

```
[S231] TE BOM storey fix + InstancedMesh 85% draw call reduction
```
([commit 9cca45a](https://github.com/red1oon/BIMCompiler/commit/9cca45a365d6dfaa650995288f62f1e08fec8926))

Because geometry is hash-addressed from the beginning — not as a performance optimisation but as a consequence of how the extractor works — instancing in the browser required no schema change. Elements with the same `geometry_hash` were grouped in one SQL query result. `THREE.InstancedMesh` consumed them directly. 85% draw call reduction on a 48K-element Terminal building, with no change to the DB.

### What vibe programming produced

The schema in [SQLite3D_Schema.md](SQLite3D_Schema.md) was not designed top-down. It emerged from 60+ sessions of constraint-driven iteration:

| Session | Constraint | Schema consequence |
|---------|-----------|-------------------|
| S168 | Blender session save was too large with BLOBs inlined | Two-DB split: BLOBs in `library.db`, hashes in `extracted.db` |
| S172 | `create_shape()` per element was O(n) and slow | `geom.iterator()` + SHA256 hash-addressed `component_geometries` |
| S173 | 30 buildings needed the same door mesh without copying it | Hash dedup: 123K unique meshes serve 1M elements |
| S175 | GN 500-tree overhead — Blender viewer had a hard ceiling | R-tree virtual table for spatial queries without in-memory BVH |
| S195 | Blender save pipeline was the bottleneck, not the data | Float32 BLOB format works in any language — Python or JS |
| S200 | Zero-install requirement for site use | sql.js WASM opens the same SQLite file in the browser |
| S231 | Mobile draw call budget | `geometry_hash` grouping → `THREE.InstancedMesh` with no schema change |

Each constraint was discovered in practice, not anticipated. Claude Code explored the solution space; the domain expert evaluated whether each result was correct. The schema that emerged is now published as a candidate open standard — not because it was designed to be one, but because 60 sessions of real-world pressure produced something that actually works.

---

## The Technology Convergence — Why This Was Impossible Before 2025

The BIM OOTB browser viewer and clash detection system depends on a stack that only became viable in 2025-2026. None of these components existed in production-ready form two years earlier.

### Timeline of Key Dependencies (npm exact dates)

The packages existed for years. But **production stability** — the point where you can trust them with a 48K-element building on a phone — converged in a narrow window.

| Technology | First release | Production-stable | Exact date | What it enabled |
|-----------|--------------|-------------------|------------|----------------|
| **sql.js** | v0.1.1 (May 2014) | v1.10.3 | **14 Apr 2024** | WASM SQLite — reliable memory, large DBs, no crashes |
| **sql.js** | | v1.12.0 | **29 Oct 2024** | Last stability fix before our Oct 2025 discovery |
| **rtree-sql.js** | v1.0.0 (Oct 2019) | v1.7.0 | **3 Jun 2022** | R-tree WASM — O(n log N) spatial clash queries in browser |
| **Three.js** | r1 (2010) | r128 | **23 Apr 2021** | Stable InstancedMesh — 48K elements, mobile GPU viable |
| **web-ifc** | v0.0.36 (Aug 2022) | v0.0.57-0.0.66 | **Aug–Nov 2024** | 10 releases in 4 months — IFC4 tessellation hardened |
| **web-ifc** | | v0.0.72 | **2 Oct 2025** | Released the same month we discovered spatial DB |
| **Web Share API** | Chrome 89 (Mar 2021) | Safari 15 | **Sep 2021** | File sharing (images + text) to WhatsApp/Telegram |
| **Service Workers** | Chrome 40 (2015) | Safari + Chrome stable | **2023–2024** | Reliable offline PWA with WASM + DB caching |
| **Claude Code** | | Anthropic CLI | **2025** | AI pair programming — domain expert + AI |

### The Critical Convergence

Three things happened in the same narrow window:

1. **sql.js v1.12.0** (29 Oct 2024) — fixed WASM memory stability for large databases. Without this, a 48K-element building would crash the browser tab.
2. **web-ifc v0.0.57–0.0.72** (Aug 2024 – Oct 2025) — a burst of 16 releases that hardened IFC4 tessellation. The parser we built on (v0.0.72) was released the same month we started the project.
3. **rtree-sql.js v1.7.0** (Jun 2022) — existed for 3 years but was obscure. Nobody had combined it with Three.js for BIM clash detection. The discovery was ours.

### The Discovery Chain — How AI Found What Google Could Not

The turning point of this entire project was not a line of code. It was a **discovery**: that an obscure npm package called `rtree-sql.js` — a fork of sql.js with one Makefile flag changed (`-DSQLITE_ENABLE_RTREE=1`) — could turn a browser tab into a spatial database engine capable of O(n log N) clash detection on 48,000 building elements.

Consider the chain of people who made this possible, none of whom knew each other or intended what we built:

| Who | When | What they did | Why they did it |
|-----|------|--------------|-----------------|
| **Alon Zakai** (Mozilla, `kripken`) | 2010 | Created Emscripten — C/C++ → JavaScript compiler | Wanted to port his C++ game fork (Syntensity/Sauerbraten) to the browser |
| **Zakai** | Feb 2012 | First commit to `sql.js` — SQLite compiled to JS | Side-project demo of Emscripten's power. Not a product — one `db.exec()` method, all data coerced to strings, no tests. |
| **Ophir Lojkine** (Paris, `lovasoa`) | 2014 | Found sql.js stalled (last commit over a year old, author unresponsive). Rewrote the API: prepared statements, BLOB support, types, tests. | Needed to test SQL commands on a machine with no database software. [Wrote about it on LinuxFr.org](https://linuxfr.org/news/retour-d-experience-sur-sql-js), 15 June 2014. Kripken added him as contributor; he has maintained it ever since. |
| **W3C / browser vendors** | Mar 2017 | WebAssembly MVP ships — Firefox 52 (Mar 7), Chrome 57 (Mar 9), Safari 11 (Sep), Edge 16 (Oct) | Cross-vendor binary format for compiled languages in the browser |
| **Taylor Brown** (`Taytay`) | Apr 2019 | [PR #255](https://github.com/sql-js/sql.js/pull/255) — switched sql.js from asm.js to WASM output | WASM was faster and smaller. Opened Nov 2018, merged Apr 29, 2019. |
| **Daniel Barela** (`danielbarela`) | Oct 2019 | Published [`rtree-sql.js`](https://www.npmjs.com/package/rtree-sql.js) — sql.js recompiled with one flag: `-DSQLITE_ENABLE_RTREE=1` | Needed spatial queries in the browser. Likely GIS background, not BIM. Three versions ever published (1.0.0, 1.0.1, 1.7.0). Minimal downloads. |
| **Stephan Beal** (SQLite team) | Nov 2022 | SQLite 3.40.0 — [first official WASM build](https://sqlite.org/wasm/doc/trunk/about.md). Explicitly credits sql.js as "the first-ever published use of sqlite3 for the web." | Making WASM a "first-class member of the family of supported SQLite deliverables." |
| **Lojkine + contributors** | Oct 2024 | sql.js v1.12.0 — WASM memory stability for large DBs | Bug fixes. No idea anyone would stream 48K building elements through it. |
| **Redhuan D. Oon** | Oct 2025 | Connected SQLite BLOBs → Float32Array → Three.js GPU | Needed zero-install BIM viewer for site foremen on phones |

A Mozilla game developer's side project → a French developer's maintenance rescue → a GIS engineer's one-flag fork → a Malaysian ERP architect who knew what a BOM was. **Four communities that never intersect** (compilers, databases, 3D graphics, construction) produced the ingredients. AI connected them.

#### Without AI, what path leads here?

An ERP architect who knows Java, iDempiere, and BIM would need to:

1. **Know that SQLite can run in a browser.** This means knowing about Emscripten, knowing that C libraries can compile to WASM, and knowing that sql.js exists. None of this appears in BIM literature, ERP forums, or construction technology conferences. The search term "SQLite in browser" leads to sql.js — but only if you already know to ask.

2. **Know that SQLite has a spatial index.** R-tree is a compile-time extension in SQLite, off by default. It is documented in SQLite's C API docs, not in any JavaScript context. The search term "spatial index JavaScript" leads to Turf.js, RBush, or PostGIS — not to SQLite R-tree.

3. **Know that someone compiled sql.js with the R-tree flag.** Daniel Barela published `rtree-sql.js` in October 2019 — three versions ever, minimal downloads, no blog posts, no tutorials, no Stack Overflow answers. Searching "R-tree WASM" or "spatial query browser" does not surface it. You would need to read sql.js GitHub issue [#390](https://github.com/sql-js/sql.js/issues/390) ("How to turn on rtree?"), follow the thread, and find Barela's fork. This is a needle in a mass of unrelated search results.

4. **Know that geometry BLOBs can go straight to WebGL.** The idea that `new Float32Array(blob)` produces a valid `BufferGeometry` for Three.js is not documented anywhere. It requires knowing both the SQLite BLOB storage format (just raw bytes) and the Three.js buffer attribute API (just typed arrays). These two facts live in different documentation universes.

5. **Connect all four in the right order.** Even if you discovered each piece independently, the architectural insight — that the SQLite file IS the delivery format, no server, no conversion, no API — requires seeing across all four domains simultaneously.

**No search engine connects these.** Google returns results within a domain. "SQLite spatial browser 3D BIM" returns nothing useful — the intersection has zero prior art. An AI trained across all four domains can hold the connection in a single context window: "You have geometry as BLOBs in SQLite. There is a WASM build of SQLite with R-tree. Three.js accepts Float32Array. The browser is the viewer." That sentence crosses four knowledge boundaries. It took one AI conversation to say it. It would have taken a human years of accidental discovery — or never.

### Why R-tree Is Load-Bearing — Not Optional

The R-tree spatial index is not an optimisation. It is the reason the product works on a phone. Without it, clash detection is a mathematical impossibility at building scale.

**What it is:** SQLite's R-tree is a compile-time extension (off by default) that creates a virtual table indexing objects by their bounding boxes in N dimensions. A query like "which elements overlap this box?" completes in **O(log N)** instead of scanning every row. It was designed by [Antonin Guttman in 1984](https://en.wikipedia.org/wiki/R-tree) for spatial databases — and it sat inside SQLite for years, unused in the browser, because nobody compiled it into the WASM build. In October 2019, Daniel Barela (`danielbarela`) added one flag (`-DSQLITE_ENABLE_RTREE=1`) to the sql.js Makefile and published [`rtree-sql.js`](https://www.npmjs.com/package/rtree-sql.js) to npm — three versions ever, minimal downloads. That single flag is the difference between a product and a demo.

**Where it runs in BIM OOTB** (three modules, 43 code references):

| Module | What R-tree does | Without R-tree |
|--------|-----------------|----------------|
| `measure.js` (clash detection) | For each MEP element, probe R-tree for overlapping ARC/STR elements. 500 probes × O(log 48K) = **sub-second**. | O(n²) cross-join: 500 × 47,500 = **23.75 million** row comparisons. Browser tab freezes or crashes. |
| `section_cut.js` (storey slicing) | Query elements within a Z-range slab. R-tree returns only elements in that band. | Full-table scan of all transforms, then filter by Z in JavaScript. Slow on large buildings. |
| `elevation.js` (building extents) | Min/max of all bounding boxes along any axis — one R-tree aggregate. | Full scan of `element_transforms` — works but slower, no spatial pruning. |

**The maths:** A 48,000-element airport terminal with 7 disciplines and 12 clash rules requires checking every discipline pair. Without R-tree, the naïve approach is a cross-join — `O(n²)` per pair. With 12 rules and ~7,000 elements per discipline on average, that's 12 × 7,000² = **588 million** comparisons. The browser has ~5 seconds before the user assumes it's broken. R-tree reduces this to 12 × 7,000 × O(log 48,000) ≈ **12 × 7,000 × 16 = 1.3 million** operations — a **450× speedup**. That's the difference between "instant" and "dead."

**The irony:** R-tree has been part of SQLite since [version 3.6.10 (2009)](https://sqlite.org/changes.html). It has been available as a compile flag for 17 years. The browser WASM build of SQLite (sql.js) existed since 2012. But nobody compiled the two together until `rtree-sql.js` appeared in 2019 — and even then, almost nobody used it. Our clash detection, running live on phones in 2026, depends on a 1984 algorithm, compiled through a 2010 toolchain, into a 2019 package, discovered by an AI in 2025.

**What actually runs in the viewer (verified from `loader.js`):**

| Package | Version | Date | Role |
|---------|---------|------|------|
| **rtree-sql.js** | v1.7.0 | 3 Jun 2022 | All DB queries + R-tree clash detection — loaded on **every page view** |
| **Three.js** | r160 | 13 Dec 2023 | 3D rendering, BatchedMesh, clipping — loaded on **every page view** |
| **web-ifc** | v0.0.77 | 6 Mar 2026 | IFC parsing — loaded **only when user drops an IFC file** |
| **SheetJS** | v0.20.3 | — | Excel export — loaded on **every page view** |

The core viewer (DB streaming, 3D rendering, clash detection, sharing) runs entirely on **rtree-sql.js v1.7.0 (2022)** and **Three.js r160 (2023)**. Both are 2-3 years old. The sql.js stability fixes from 2024 are not in our build (rtree-sql.js is a separate fork). web-ifc only matters for IFC import — the viewer never touches it. **This product could have been built in 2022** — the technology was ready. Nobody connected the pieces until Oct 2025.

### No Prior Art — In Any Industry

A search across npm, GitHub, academic databases, and industry tools confirms: **no application in the world streams 3D geometry from a SQLite database directly to the GPU in a browser.** Not in BIM. Not in GIS. Not in CAD. Not in gaming. Not in mapping.

The closest prior art:

| Project | What it does | Why it's not the same |
|---------|-------------|----------------------|
| `sdlgl3c-sqlite` (GitHub) | Loads 3D models from SQLite via OpenGL | Desktop native (C/C++), not browser, not WASM |
| SpatiaLite / GeoPackage | SQLite with spatial extensions | 2D GIS data, no 3D geometry BLOBs, no GPU rendering |
| CesiumJS / deck.gl | Browser 3D for GIS | Server-side tile rendering, not client-side SQLite |
| IFC.js / That Open Engine | Browser IFC viewer | Loads IFC files directly, not from SQLite DB |
| Speckle / Bimdata | Browser BIM viewers | Server-rendered, require accounts, no offline |

The BIM OOTB pipeline — **SQLite BLOB → Float32Array → BufferGeometry → GPU** — has no precedent in any industry. Every other 3D browser application either uses server-side rendering, proprietary file formats, or requires a backend. None store geometry as SQLite BLOBs and stream them to WebGL in the client. The combination was invisible because it crosses three communities (database, 3D graphics, construction) that don't talk to each other.

### The Solo Multiplier — It's Not Speed, It's Capability

This is not "I could have done it in 36 months, AI did it in 1." **It could not have been done at all.** A solo developer — even a competent one — hitting the WASM R-tree wall, Three.js clipping planes, service worker cache invalidation, and mobile touch event handling would not eventually get there slower. They would **stop**. You can't Google what you don't know to search for.

**Actual project timeline (git history):**

| Phase | Duration | What was built |
|-------|----------|---------------|
| Spatial DB discovery → Blender pipeline (S165-S193) | Oct-Dec 2025 (~2 months) | R-tree, GN instancing, DLOD — hit Blender's hard ceiling |
| Browser pivot (S195-S231) | Jan-Apr 2026 (~3 months) | sql.js WASM, Three.js streaming, InstancedMesh, mobile PWA |
| Clash detection + snag + share (S245-S246) | May 2026 (~2 days) | R-tree queries, matrix, fly-to, annotate, deep-link |
| **Total elapsed** | **~6 months** | Full browser BIM viewer + clash detection + sharing |
| **Compressed (hindsight, no dead ends)** | **~1 month** | If you already knew what worked |

**Cost comparison:**

| Scenario | Duration | Cost | Outcome |
|----------|----------|------|---------|
| Traditional team (5-6 people) | 3-4 months | $150K-$300K | Delivered but slow to pivot |
| Solo developer, pre-AI | 36 months | Time | **Abandoned** — too many unknowns outside domain expertise |
| Solo domain expert + AI | 6 months (1 month compressed) | ~$500 total API cost | Shipped, deployed, live on phones |

The team comparison is not a speed ratio. A team *can* build it — but they'd never pivot from Blender to browser in one conversation. The sunk cost of 3 engineers hired for Blender would anchor the project for months. The solo pre-AI comparison is not a speed ratio either — it's a binary: **possible vs impossible**. The WASM R-tree spatial index, the Three.js clipping planes with depth buffer management, the service worker cache versioning — these are not things a BIM domain expert learns by Googling. They are outside the search radius entirely.

AI doesn't make you faster. **AI makes the unreachable reachable.** The domain expert provides judgment that AI cannot: whether 25mm tolerance makes engineering sense, whether a pipe through a wall is a false positive, whether the building loads correctly on a foreman's phone. Speed without domain judgment produces fast garbage. Domain judgment without AI produces slow abandonment.

The combination — domain expert steering, AI building — is a new category. Not faster programming. Not no-code. Not outsourcing. A single mind with the full context, building at the speed of thought, with guard rails that only decades of industry experience can provide.

> **The parallel SQLite/Turso ferment of 2024–2026** — and what an LLM got *wrong* when asked to date it — is recorded in the [Enabling-Tech Timeline → The Turso / core-SQLite ferment](EnablingTechTimeline.md#the-turso-core-sqlite-ferment-20242026-parallel-mostly-routed-around), where the ROUTED-AROUND thesis already lives.

---

## For the Bonsai/BlenderBIM Community

If you're evaluating this project and wondering whether vibe-programmed code can be trusted:

1. **Clone it.** `git clone https://github.com/red1oon/BIMCompiler.git`
2. **Run the gates.** `./scripts/run_RosettaStones.sh classify_sh.yaml` — watch a building compile and pass 6 mathematical proofs.
3. **Read [The Drift](LAST_MILE_PROBLEM.md).** Every known failure is documented. Nothing is hidden.
4. **Check the tests.** `mvn test` — 408+ tests, not mocked, not stubbed, running against real SQLite databases with real BOM data.

The code was written by AI. The architecture was not. The proofs are mathematical. The buildings compile deterministically. Judge by the output, not the author.

---

*Built with [Claude Code](https://claude.ai/) (Anthropic) in ~190 sessions over 5 months. 1M elements compiled, 35 buildings, city-scale federation. Kuala Lumpur, 2025–2026.*

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
