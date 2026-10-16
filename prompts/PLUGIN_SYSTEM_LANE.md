# ⚠ DO NOT REMOVE — PLUGIN_SYSTEM_LANE scope: Phases A-D shipped; Phase E is a new, narrower bridge. Read the log after every run.

# Fold Engine Plugin System — Implementation Lane

**Status:** Phases A-D **DONE, shipped, live** (see §DONE below — `window.PluginRegistry`/`window.PluginEngine`,
precached in `erp/sw.js`, wired into `erp/idempiere.html`, three working example bundles under `erp/plugins/`).
Un-archived 2026-09-15 (was incorrectly marked NOT STARTED — that line was stale; fix it going forward,
this file drifts easily since "DONE" and the header live far apart). **Phase E (below) is new work, not started.**
**Priority:** Non-blocking background work
**Branch:** a dedicated `feat/plugin-adval-bridge` worktree, never the shared `bim-ootb` checkout directly.

---

## Session Startup — Read These First

In order:
1. `build/erp/kernel_ops.js` — op schema (add `PLUGIN_*` op types here, additive only)
2. `build/erp/ad_callout.js:36` — `registerHandler` pattern to replicate
3. `build/erp/ad_modelval.js:651` — `fireHooks` pattern to replicate
4. `build/erp/ad_process.js:68` — `registerHandler` with `meta.kind` pattern
5. `build/erp/erp_engine.js:1-30` — UMD wrapper + pure-logic contract (no DB binding)
6. `docs/ERP_COVERAGE_MATRIX.md` — current state; plugin system does NOT touch the matrix

---

## Spec

### What Already Exists (do not replace — wrap only)

| File | Hook | Plugin contribution |
|---|---|---|
| `build/erp/ad_modelval.js:654` | `fireHooks(timing, info, ctx)` | BEFORE/AFTER SAVE validator |
| `build/erp/ad_callout.js:36` | `registerHandler(name, fn)` | Field callout |
| `build/erp/ad_process.js:69` | `registerHandler(classname, fn, meta)` | SvrProcess / report |
| `build/erp/post_resolver.js` | token dispatch map | GL token resolver |
| `build/erp/ad_docfsm.js` | FSM transition map | Document lifecycle |
| `build/erp/kernel_ops.js` | `op_type` TEXT column | Lifecycle audit ops |

Engine contract from `erp_engine.js`: **pure logic, no DB binding, host injects `query(sql) → rows[]`.** Preserve this.

---

### Bundle Structure

```
my-plugin.foldbundle/
├── manifest.json
├── activator.js
└── handlers/
    ├── validators.js
    ├── callouts.js
    ├── processes.js
    └── tokens.js
```

**`manifest.json`:**
```json
{
  "id": "com.example.manufacturing",
  "version": "1.0.0",
  "engineVersion": ">=0.9.0",
  "requires": {},
  "contributions": {
    "validator": { "module": "handlers/validators.js", "tables": ["M_Production"] },
    "callout":   { "module": "handlers/callouts.js" },
    "process":   { "module": "handlers/processes.js" },
    "token":     { "module": "handlers/tokens.js" }
  },
  "activator": "activator.js"
}
```

**`activator.js`:**
```javascript
export async function activate(ctx) {
  // ctx.modelval   → ad_modelval module
  // ctx.callout    → ad_callout module
  // ctx.process    → ad_process module
  // ctx.postTokens → post_resolver token map (plain object)
  // ctx.db.query   → read-only SQL
  // ctx.ops.append → append kernel_ops op
}
export async function deactivate(ctx) {}
```

---

### Phase A — `build/erp/plugin_registry.js` (~200 LOC)

New file, same UMD wrapper as `erp_engine.js`. Implement:

1. `installBundle(manifestUrl)` — fetch + validate manifest, write to OPFS, append `PLUGIN_INSTALL` op via existing `appendOp`.
2. `startBundle(id)` — topological sort on `requires`, call `activate(ctx)`.
3. `stopBundle(id)` / `uninstallBundle(id)` — call `deactivate`, remove OPFS files, append op.
4. Lifecycle states: `INSTALLED → RESOLVED → ACTIVE → STOPPED → UNINSTALLED`. Stored in IndexedDB.
5. `resolveDeps(manifests[])` — semver compare (~15 LOC inline) + topological sort. Reject cycles.

### Phase B — Extend `kernel_ops.js` op types (additive)

Add to the `op_type` enum comment block only:
```
PLUGIN_INSTALL | PLUGIN_UNINSTALL | PLUGIN_START | PLUGIN_STOP
```
`parameters` = JSON `{id, version, manifestUrl}`. No schema change.

### Phase C — Three witness plugins (`build/erp/fixtures/plugins/`)

Each runs via `bash build/erp/run_witness.sh`. Each produces `§`-tagged output.

- **C-1** callout plugin — registers on `M_Product.Name`, uppercases. Witness: `§PLUGIN-CALLOUT name=WIDGET`
- **C-2** validator plugin — BEFORE SAVE `M_Production` rejects qty < 0. Witness: `§PLUGIN-VALRULE M_Production qty<0 REJECT`
- **C-3** token plugin — resolves `{Production.WIP}` → account ID from seed. Witness: `§PLUGIN-TOKEN WIP=50100`

---

### Witness Contract

All phases must produce these lines before the session closes:
```
§PLUGIN-INSTALL id=com.example.manufacturing version=1.0.0 opId=<n>
§PLUGIN-START   id=com.example.manufacturing state=ACTIVE
§PLUGIN-CALLOUT name=WIDGET
§PLUGIN-VALRULE M_Production qty<0 REJECT
§PLUGIN-TOKEN   WIP=50100
```
No log line = not done.

---

### Out of Scope (do not build)

- No signing gate (reserve `signature` field in manifest, don't enforce)
- No `ServiceRegistry` abstraction — the five existing `registerHandler`/`fireHooks` APIs are enough
- No CLI packaging tool — a `.foldbundle` is a folder; `installBundle(url)` fetches it
- No iframe sandbox
- No native SQLite C extensions

---

### OSGi Mapping (for iDempiere developers)

| OSGi | Fold Engine equivalent |
|---|---|
| Bundle JAR | `.foldbundle` directory |
| `MANIFEST.MF` | `manifest.json` |
| `BundleActivator` | `activator.js` `activate`/`deactivate` |
| `BundleContext` | `ctx` injected by host |
| Service Registry | Not phase-A |
| Extension Point | `contributions` → existing `registerHandler`/`fireHooks` |
| Fragment Bundle | Out of scope |
| Start Level | `requires` graph order; no numeric levels |

---

### Phase D — Plugin Engine pill (UI, after Phase C witnesses green)

**Icon:** `plug` (Lucide) — add to `ICONS` in `deploy/dev/panels.js`:
```javascript
plug: { svg: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>', trl: null, key: null, desc: 'Plugin Engine' },
```

**Bundle format (single-file, no ZIP, no OPFS):**  
Distribute as one ES module on any raw URL (e.g. `raw.githubusercontent.com`). No directory fetching, no ZIP unpacking.
```javascript
// my-plugin.js — the whole bundle, one URL
export const manifest = { id: 'com.example.manufacturing', version: '1.0.0', requires: {} };
export async function activate(ctx) { /* register handlers */ }
export async function deactivate(ctx) { /* cleanup */ }
```
`installBundle(url)` does `import(url)`, reads `manifest`, calls `activate(ctx)`. No OPFS writes needed for the simple case. Bundle state (ACTIVE/STOPPED) lives in IndexedDB under `{id, url, state}`.

**This collapses iDempiere's two-step deploy into one:**  
iDempiere requires: (1) drop JAR into `plugins/` restart, (2) run 2Pack import separately.  
Our pill: paste URL → one click → plugin active. The `sql/setup.sql` equivalent runs inside `activate()`.

**Pill overlay — what it shows:**
- List of installed bundles: `id` / `version` / state chip (green ACTIVE, grey STOPPED)
- Install input: URL field + "Install" button → calls `installBundle(url)`
- Per-row: Start / Stop toggle + Uninstall button
- No settings, no signing UI in Phase D

**Witness:** `§PLUGIN-PILL install url=<url> id=com.example.manufacturing state=ACTIVE`

---

## DONE

**Phase A — `build/erp/plugin_registry.js` (W-PLUGIN)** ✅ — UMD host (`window.PluginRegistry` / node `module.exports`).
`create(host)` → `installBundle`/`startBundle`/`stopBundle`/`uninstallBundle` over the INSTALLED→RESOLVED→ACTIVE→
STOPPED→UNINSTALLED lifecycle; `resolveDeps(manifests[])` = inline semver (`satisfies`/`parseVer`/`cmpVer`) + DFS
topological sort with on-stack cycle detection. PURE host, no DB binding — host injects `db.query`, `ops.append`,
`import`, the engine modules, and (default in-memory) `store`. `engineVersion` gate enforced; `signature` reserved,
NOT enforced (no signing gate, per §Out of Scope).
- §-log: `§PLUGIN-INSTALL id=… version=1.0.0 opId=<n>` · `§PLUGIN-START id=… state=ACTIVE`

**Phase B — `build/erp/kernel_ops.js` op types** ✅ — additive comment-block enum on the `op_type` column:
`PLUGIN_INSTALL | PLUGIN_UNINSTALL | PLUGIN_START | PLUGIN_STOP`, `parameters` = JSON `{id,version,manifestUrl}`.
No schema change (op_type is free TEXT).

**Phase C — three witness bundles + `scripts/poc_plugin.js`** ✅ — `build/erp/fixtures/plugins/*.mjs`, single-file ES
modules (`manifest`+`activate`+`deactivate`), each contributes into a LIVE engine registry:
- C-1 `widget_callout.mjs` → `ad_callout.registerHandler` (M_Product.Name → upper) — `§PLUGIN-CALLOUT name=WIDGET`
- C-2 `production_validator.mjs` → `ad_modelval.registerValidator` (BEFORE_SAVE M_Production qty<0) — `§PLUGIN-VALRULE M_Production qty<0 REJECT`
- C-3 `wip_token.mjs` → contributes `{Production.WIP}` into `post_resolver.TOKENS`, EXTRACTED from seed —
  `§PLUGIN-TOKEN WIP=50005 value=14130 name="Work In Process"` (the spec's `50100` was a placeholder; 50005 is the
  REAL `c_elementvalue_id` in `ad_full.db` — non-invent honored).
Witness `bash build/erp/run_witness.sh scripts/poc_plugin.js` → exit 0, `🟢 W-PLUGIN PASS`. Falsifiers fire: dependency
CYCLE (`X↔Y`) + semver conflict rejected; kernel_ops audit = 3 install / 3 start / 1 stop / 1 uninstall.

**Phase D — Plugin Engine pill** ✅ (deployed erp sw v670) — `plug` icon already in `icons.js`. NEW
`build/erp/plugin_overlay.js` (`window.PluginEngine.open` — paste raw ES-module URL → one click → ACTIVE; bundle state
`{id,url,version,state}` persists in IndexedDB `fold_plugins`, re-activates on open). `pills_idmp.json` +`plugin`
(order 8.5); `idempiere.html` wires `ad_callout.js`+`plugin_registry.js`+`plugin_overlay.js` and binds
`IdmpPillActions.plugin` (injects db/adQ/KO + engine registries). Three example bundles precached under `erp/plugins/`.
Localhost whitebox smoke (`/tmp/wt-plugin/smoke_plugin_pill.js`, Playwright) PASS: scripts load · pill bound from
manifest · overlay opens via real handler · install→`§PLUGIN-PILL install url=… id=com.example.widget-callout state=ACTIVE`
· callout contributed + uppercases · reload → rehydrates ACTIVE from IndexedDB.

---

## Phase E — `AD_ModelValidator` table-driven auto-install (2026-09-15, new)

### Why this exists — the gap Phases A-D leave open

Phases A-D built a real, working plugin system — but it is **admin-driven, not AD-driven**: someone pastes a
bundle URL into the Plugin Engine pill and clicks Install. That is genuinely how iDempiere's *own* OSGi
plugin deploy works too (drop a JAR, restart) — so Phase D is not wrong, it faithfully mirrors that half of
iDempiere.

But iDempiere has a **second**, AD-metadata half this lane never touched: the `AD_ModelValidator` **window** —
an admin adds one row (`Name`, `ModelValidationClass`, `EntityType`), and iDempiere loads that class
automatically at startup, no separate deploy step. `erp/ad_modelval.js:39`'s `readValidators(db)` already
reads the real `ad_modelvalidator` table (3 rows: Libero MFG, Fixed Assets, Product Price) — **but nothing
calls it.** It is a stub wired to nothing, sitting next to a fully-working plugin system it was never
connected to. That disconnect is Phase E's whole scope.

### The design — recognizable to an iDempiere dev, reusing what already works

| `AD_ModelValidator` column | iDempiere meaning | Phase E meaning (same column, no schema change) |
|---|---|---|
| `Name` | human label | same |
| `ModelValidationClass` | Java FQCN on the classpath | a bundle URL/module path — `PluginRegistry.installBundle()`'s existing input |
| `EntityType` | scopes core vs custom | **gates auto-install** — see the open question below |

**Mechanism, using only existing pieces, nothing new to build from scratch:**
`readValidators(db)` → for each row whose `EntityType` clears the gate → `PluginRegistry.installBundle(row.ModelValidationClass)` then `.startBundle(id)`. Both calls already exist (`erp/plugin_registry.js`, Phase A). The bundle itself is an ordinary `.mjs` in the existing `manifest`/`activate`/`deactivate` shape (Phase A spec above) — e.g. `production_validator.mjs` already in `erp/plugins/` is a working example of exactly what a Phase-E-installed bundle would look like; Phase E only changes *how it gets installed* (from an AD table row instead of a pasted URL), not what a bundle is.

### Study this before writing code — open questions a good design must answer first

1. **Does auto-install from a DB row violate "foreign imperative code is a plugin, signed + reversible"**
   (`erp/plugin_release.js`'s own stated law)? A pasted URL is an explicit admin click; a table row read at
   boot is not. Decide: does Phase E require the row's bundle to ALSO be enabled via the existing
   enable/disable surface in `plugin_release.js` before `startBundle` fires — i.e. the AD row *proposes*,
   the existing Plugin Management UI still *approves*? Leaning yes, but this is the one decision that
   determines whether Phase E strengthens or quietly bypasses an already-decided security posture. Read
   `docs/HolyGrail.md`'s "foreign imperative code is a plugin" law in full before deciding, not just this
   one citing line.
2. **Idempotency at every boot.** `readValidators()` would run on every load. Confirm `installBundle`/
   `startBundle` on an already-ACTIVE bundle id is a safe no-op (check `plugin_registry.js`'s lifecycle
   state machine directly — don't assume) before wiring this in, or every page load re-appends
   `PLUGIN_INSTALL`/`PLUGIN_START` ops into `kernel_ops` for nothing.
3. **EntityType scoping.** The 3 real rows (Libero MFG, Fixed Assets, Product Price) are vendor plugins
   whose Java bodies were correctly never ported (`ERP_COVERAGE_MATRIX.md`'s own "named-deferred" call) —
   they must NOT auto-install against a nonexistent bundle URL and error at every boot. Only rows an admin
   has *also* pointed at a real, present bundle should ever attempt install; a `ModelValidationClass` that
   isn't a resolvable module path must fail loud once and then skip silently, never retry-loop.
4. **Respect the A-4 seam** (`docs/internal/ERP_BACKEND_SEPARATION.md`): a model-validator plugin GATES,
   it must never derive a posting value or write GL state. State this constraint explicitly in whatever
   spec/README a Phase-E bundle author reads — it is not enforced by any type system here, only by
   documented discipline, and a plugin author has no other way to learn it.
5. **Does this want its own kernel_ops op_type**, e.g. `MODELVAL_AUTOINSTALL`, distinct from `PLUGIN_INSTALL`,
   so the audit log can tell "an admin clicked install" apart from "the AD table drove this"? Additive,
   same pattern as Phase B — decide before writing the bridge, not after.

**Do not start implementation until questions 1-5 have written answers in this file.** This phase is
small in code (a bridge function, plausibly under 40 lines) and easy to get structurally wrong in a way
that either duplicates Phase D's UI-driven flow uselessly or quietly weakens the signed+reversible
guarantee Phase D already established. Read `docs/HolyGrail.md` in full, `docs/internal/ERP_BACKEND_SEPARATION.md`
§A-4, and `erp/plugin_registry.js`'s actual lifecycle code (not just this doc's summary of it) before
proposing an implementation.

### Answers (2026-09-15, resolved by direct investigation before implementation)

**Q2 — idempotency: RESOLVED, and it changes the design.** `plugin_registry.js:178` — `startBundle` on an
already-ACTIVE id is a safe no-op (`return {id, state, opId: null}`). But `plugin_registry.js:162` —
`installBundle` **throws** `'plugin already installed: ' + manifest.id'` if called again on the same id.
It is NOT safe to call blindly every boot. The bridge MUST either: (a) import the manifest first,
`store.get(manifest.id)` (needs `PluginRegistry`'s internal `store` — check if it's exposed; if not,
expose a read-only `isInstalled(id)` as part of this phase), and skip `installBundle` when already
present, calling only `startBundle`; or (b) wrap `installBundle` in try/catch and treat exactly this one
error message as expected/ignorable. (a) is more robust — string-matching an error message is fragile.

**Q3 — EntityType scoping: the speculation in this file was WRONG, corrected by real data.** Queried the
actual 3 rows (`build/erp/ad_full.db`):
```
50000 | Libero Manufacturing Management | org.eevolution.model.LiberoValidator | EE01
50004 | Fixed Assets                     | org.idempiere.fa.model.ModelValidator | D
200002| Product Price                    | org.adempiere.model.ProductPriceValidator | D
```
`EntityType` is `D` (core Dictionary) for 2 of 3, `EE01` (a vendor module code) for the third — **none are
`U`** (user/custom). EntityType does NOT cleanly separate "safe to auto-install" from "vendor Java body we
never ported." **Drop EntityType-based gating entirely.** Gate purely on whether `ModelValidationClass`
resolves to a real, locally-present bundle (a file under `erp/plugins/` or a resolvable URL) — these 3
real rows will always fail that check (their Java bodies are named-deferred, no JS port exists or is
planned), so they naturally never install, no special-casing needed. Log the failure ONCE per row per
session, never retry-loop.

**Q4 — RESOLVED, mechanical.** Whatever file documents how to author a bundle for this bridge (README in
`erp/plugins/`, or a new section in this file) must state the A-4 seam explicitly: a model-validator
bundle gates (may return an error string to block save/complete); it must never write GL state or derive
a posting value. Copy this sentence into that doc verbatim — don't paraphrase it thinner.

**Q5 — RESOLVED.** Add `MODELVAL_AUTOINSTALL` to `kernel_ops.js`'s `op_type` enum comment (additive, no
schema change, same pattern as Phase B's `PLUGIN_*`). Use it instead of `PLUGIN_INSTALL`/`PLUGIN_START`
when the bridge itself triggers install/start from an AD row, so the audit log can tell "admin pasted a
URL" apart from "the AD table drove this" — grep `§MODELVAL_AUTOINSTALL` should be sufficient to answer
"did this come from the dictionary" without cross-referencing timestamps.

**Q1 — the one real judgment call, not fully resolved by investigation, proceeding on a stated default.**
Recommendation: the AD row **proposes**, it does not **auto-approve**. Auto-install only for a row that
has ALSO been explicitly enabled through the existing enable/disable surface in `plugin_release.js` —
i.e. add the AD_ModelValidator row's candidate bundle to the Plugin Management list in a PENDING/proposed
state, require the same explicit enable click Phase D already requires for a pasted URL, and only THEN
does the boot-time bridge call `startBundle`. This preserves "foreign imperative code is a plugin, signed
+ reversible" rather than adding a second, weaker install path that bypasses it. **This is a product
decision, not an implementation detail — if red1 wants true zero-click auto-install (AD row alone is
sufficient, no separate approval), say so explicitly before or during the implementation session; the
agent should default to the approval-gated version above and flag it rather than assume zero-click.**
