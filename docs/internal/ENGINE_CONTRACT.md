<!--
BIM OOTB / ERP OOTB — iDempiere 2.0: the engine↔UI contract (the seam).
Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
SPDX-License-Identifier: MIT
-->
> **Lane (2026-11-09):** this file is one part of the ONE-DOOR framework (Actor | Channel | One door | Engine). Home and lane map: `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` §0. Column owned here: ENGINE seam (`dispatch`, `verbs(ctx)`).

# Engine ↔ UI Contract — the one seam between the model engine and the renderer

> **Status: DRAFT / SPEC. Nothing built; EXPLICIT GO before any code.** Spec-first; non-invent
> (signatures below are grounded in the existing `ad_data.js` / `erp_kernel.js` / `erp_signer.js`, not
> imagined); witness-led; §-log first.
>
> **Why this doc exists.** Two sessions run in parallel: the **renderer** session owns the complete
> iDempiere journey (login → menu → window → master-detail) — `IDEMPIERE_RENDERER_SPEC.md`; **this
> (engine) session** owns the underlying model — op-log, verbs, fold, access. They must build
> independently without colliding. This doc defines the **only** place they touch. It is owned by the
> **engine** side and *referenced* (not duplicated) by `IDEMPIERE_RENDERER_SPEC.md`.
>
> Read first: [IDEMPIERE_2.md](IDEMPIERE_2.md) (the model) · [DistributedERP.md §13](DistributedERP.md)
> (gravity sharding) · [PLUGIN_ARCHITECTURE.md](PLUGIN_ARCHITECTURE.md) (verbs/manifest) ·
> `bim-ootb/viewer/ad_data.js`, `scripts/erp_kernel.js`, `bim-ootb/viewer/erp_signer.js` (the real code).

---

## §0 The principle

The engine never knows what a *window*, *tab*, *field*, or *login* is. The UI never knows what the
*op-log*, *fold*, *signature*, or *shard residency* is. Each is ignorant of the other's vocabulary, and
they meet only at the five calls in §1. This is the `separation_of_concern` rule made into an interface:
the UI **consumes** sharded, scoped data; it does not **own** the streaming pipeline.

If a change would make the engine reference a UI concept, or the UI reach past these five calls into the
op-log, the seam has rotted — that is the failure this doc exists to prevent.

## §1 The seam — five calls (grounded in existing code)

The UI makes only these calls. Each carries a **context** (§2) that the engine uses to scope and gate.

| Call | Purpose | Maps to today | Returns |
|---|---|---|---|
| `read(query, ctx)` | read master data **or** projection (current state) | `ad_data.readRecords(db, table, where, orderBy)` (`ad_data.js:186`), bridge-mapped to the 5-table projection (`_readBridge`, `ad_data.js:144`) | array of row objects, **or** stub markers for unresident shards (§3) |
| `dispatch(intent, ctx)` | submit a verb/op (the only write path) | `erp_kernel` `register/getHandler/dispatch` (`erp_kernel.js:202-241`) → `applyOne` (`90-134`) → signed append | `{ok, op_uuid, before, after}` **or** `{rejected, why}` (owner-gate / CAS / role) |
| `manifest(ctx)` | the gravity-ranked table list + residency, so the UI can prioritise/lazy-load | a fold over `kernel_ops` ([DistributedERP §13](DistributedERP.md)) | `[{table, gravityRank, resident, contentHash}]` |
| `verbs(ctx)` | the legal actions for a doc-state (drives which buttons the UI may show) | `getHandler(docType, action)` registry (`erp_kernel.js:203`) | `[{action, label}]` — capability-filtered by role |
| `verify(ctx)` | check the chain / replay hash (so the UI can show "trusted") | `sealChain`/`_canonical` (`kernel_ops.js:121-153`), `erp_signer.js` | `{chainOk, len, tip}` |

That is the whole boundary. `read` serves both master data and the fold (both are just rows from the
engine's point of view); `dispatch` is the sole mutation path; the other three are read-only metadata.

> **First addon over this contract — the POS lens (2026-06-11, [POS_ADDON_SPEC](POS_ADDON_SPEC.md)).**
> `pos_lens.js` is a pure consumer: tiles/prices via the seed reads, Complete = ONE signed group through
> `kernel_ops.commitGroup` on the page's published op log (`window.ERP.opDb`), sealed + chain-verified by
> the same `seal`/`chainVerify` the Kanban write path rides. The group is COMPOSED of existing verbs only —
> `buildDoc` (order) · `completeOrder` (SET_STATUS CO + `createShipment`/`createInvoice` fan-out, policy
> DERIVED from `C_DocType.docsubtypeso='WR'`) · `explodeBOM` (backflush CONSUME leaves, 'P-' polarity) ·
> `completeInvoice` · `qtyOnHand` (replenishment fold) — **newVerbs=[] witnessed** (W-POS-RING / W-POS-WR /
> W-POS-BACKFLUSH / W-POS-REPLENISH headless + W-POS-LIVE wiring). The addon needed no fifth thing
> (no own persistence, no forked engine) — the FOLD-not-FORK gate held.

## §2 The context — identity, role, scope (carried on every call)

`ctx` is what makes "owner/role of client" an engine concern, enforced once, here:

```
ctx = {
  actor,      // device/session id — the single-writer subject (G-SINGLE-WRITER)
  pubKey,     // edge signing key — identity is a recorded input (W-SIGN, G-IDENTITY)
  roleId,     // AD_Role — authorisation
  allowOrgs   // org-access set, or '*' — the read/match PARTITION (poc_wire.js WIRE-4)
}
```

- **Reads are scoped:** `read` returns only rows inside `allowOrgs`; a role with no access to the data
  org gets an **empty** result, not a filtered-after-the-fact list (`poc_wire.js:141-150`,
  `§WIRE access … orgs-visible=0`). The UI cannot widen its own scope — it only renders what comes back.
- **Writes are gated:** `dispatch` rejects a non-owner op (owner-gate) or an out-of-capability verb
  (role) **on the engine side**, deterministically, returning `{rejected, why}`. The UI shows the
  rejection; it cannot bypass it.
- **Identity is an input, never computed** — `actor`/`pubKey`/UUIDs are minted at the edge and recorded
  in the op (`§7`/`§0.21` of [DistributedERP.md](DistributedERP.md)); the kernel only reads them.

This is the resolution of the earlier "where does role/access live" question: **it lives in the contract,
engine-enforced.** Not a separate access doc — a property of every `read`/`dispatch`.

## §3 Data sharding across the seam — policy vs trigger

Sharding ([DistributedERP §13](DistributedERP.md)) factors cleanly across the boundary, which is the
whole point:

| Piece | Side | In the contract |
|---|---|---|
| **What's worth loading** — gravity-ranked manifest (a fold over the log, content-hash-verified) | **Engine** | `manifest(ctx)` |
| **Serving a shard** — "give me table T", verified not trusted | **Engine** | implied by `read` (engine fetches the shard underneath) |
| **When to pull** — user opens a master-detail tab / clicks a cold bubble | **UI** | the UI calls `read`; it does not manage residency |
| **Stub vs value while fetching** | **UI renders**, engine supplies | `read` returns `{__stub:true, table, reason:'cold-fetching'}` — **never a guessed value** ([DistributedERP §13](DistributedERP.md)) |

So the UI's lazy-loading of detail rows is legitimately UI-driven, but it goes **through `read`** — the UI
asks for rows and gets **rows-or-a-stub**, and never needs to know whether a table is resident or
streamed-on-touch. The streaming pipeline stays engine-side (the `separation_of_concern` rule).

## §4 Seam invariants (the rules that keep it the only coupling)

| # | Invariant | Witness |
|---|---|---|
| I1 | UI reads/writes **only** via §1 — never `SELECT` on `kernel_ops`, never computes state | `§SEAM ui-direct-oplog-access=0` (static scan of the renderer) |
| I2 | Engine references **no** UI concept (window/tab/field/login) | `§SEAM engine-ui-terms=0` (static scan of the engine) |
| I3 | Role scope enforced engine-side on every `read`/`dispatch`; UI cannot widen it | `§SEAM read role=R rows-in-scope=N out-of-scope=0` (mirror `poc_wire`) |
| I4 | `dispatch` is deterministic + signed; same intent → same op → stable replay | `§SEAM dispatch replay rebuildA==rebuildB agree=Y` |
| I5 | Unresident data returns a **stub**, never a value; fetch resolves in place | `§SEAM read table=<cold> → stub (no value invented)` |
| I6 | Sharding **policy** is engine-side (`manifest`); UI owns only the fetch **trigger** | `§SEAM manifest source=oplog-fold; ui-residency-mgmt=0` |

## §5 Boundaries — what this doc does NOT cover

- **Rendering** (chrome, windows, master-detail, login flow) → `IDEMPIERE_RENDERER_SPEC.md`.
- **The model internals** (verb semantics, the fold, posting) → [IDEMPIERE_2.md](IDEMPIERE_2.md),
  [PLUGIN_ARCHITECTURE.md](PLUGIN_ARCHITECTURE.md).
- **The distributed mechanics** (merge, owner-gate, CAS, post office) → [DistributedERP.md](DistributedERP.md).
- This doc defines only the **interface** between the first and the rest.

## §6 Build order (each names its witness; NOTHING builds without GO)

- **C0** — formalise the five §1 calls as a single engine-side module (a thin wrapper over the existing
  `ad_data`/`erp_kernel`/`erp_signer` functions — no new engine logic). `§SEAM` surface enumerated.
- **C1** — thread `ctx` (role/`allowOrgs`) through `read` + `dispatch`; scope + gate. I3 witness.
- **C2** — `manifest(ctx)` as the gravity fold; `read` returns stubs for unresident tables. I5/I6.
- **C3** — static scans proving I1/I2 (renderer touches only §1; engine has no UI terms).

## §6.1 C0 — built (build session 2026-06-03, `scripts/erp_seam.js` + `scripts/poc_seam.js`)

C0 is a thin engine-side module (`makeSeam({proj, ad, fact, manifestPath, wfmc})`) exposing the five §1
calls over the EXISTING proven fns — **no new engine logic**. The surface, each mapped to its backing fn:

| Call | Backing fn (verified) | Returns |
|---|---|---|
| `read(query, ctx)` | `erp_kernel.query` + org-scope filter (mirror `poc_wire` WIRE-4) | rows scoped to `ctx.allowOrgs`; out-of-scope → **empty** |
| `dispatch(intent, ctx)` | role-gate + owner-gate → `erp_kernel.dispatch`/`apply` | `{ok, op_uuid, before, after}` or `{rejected, why}` |
| `manifest(ctx)` | loads the D2 `build/erp/shards/manifest.json` (`build_shard_manifest.js`) | `{tables[], shards[]}` |
| `verbs(ctx)` | `erp_kernel.handlers` registry reflection, capability-filtered | `[{action, label}]` |
| `verify(ctx)` | `erp_kernel.replay` ×2 (the §1 "**replay hash**" check) | `{chainOk, len, tip}` |

- **`verify` = replay-determinism**, per §1's own wording ("check the chain / **replay hash**"): seal-free,
  node-pure, no schema fork. `kernel_ops.js verifyChain` is the browser-side counterpart over the *sealed*
  `kernel_ops` schema (`id`/`prev_hash`/`op_hash`/`sig`); the engine projection uses `erp_kernel`'s op-log
  schema, so the node seam proves trust by replay equality (same intent → same op → identical rebuild).
- **Gates engine-side** (I3/owner): role capability via `ctx.role.actions` (mirror `poc_wire.mayRun`);
  owner-gate via the op-log — a mutation whose `ctx.actor` ≠ the doc's recorded owning actor is
  `{rejected, why:'owner-gate'}` (G-SINGLE-WRITER). The UI cannot bypass either.
- **Witnesses** (`build/erp/poc_seam.log`): `§SEAM surface=read,dispatch,manifest,verbs,verify` (enumerated);
  `§SEAM dispatch replay rebuildA==rebuildB agree=Y` (I4); `§SEAM read role=… rows-in-scope=N out-of-scope=0`
  (I3); `§SEAM gate owner-gate rejected=Y` / `role-no-grant rejected=Y`.

**⚠ JOINT re-freeze flag (do NOT resolve solo, ENGINE_CONTRACT §0/§4 firewall).** §1 names the manifest
facet `gravityRank`; the built D2 manifest (`build_shard_manifest.js`) emits `menuGroup` (+ `resident`,
`contentHash`). `manifest(ctx)` returns the menuGroup shape verbatim. The `gravityRank`↔`menuGroup` name
reconciliation is a **joint** decision with the RECORD-PANEL (host) lane — recorded here, not edited into
§1. `§SEAM-FROZEN` is left for that co-ratification.

## §7 Guardrails

1. **The seam is the only coupling.** No second backchannel between UI and engine.
2. **Engine ignorant of UI; UI ignorant of op-log.** Each speaks only the contract's vocabulary.
3. **Role/scope enforced engine-side, every call.** The UI presents; it never authorises.
4. **No invented values across the seam.** Unresident → stub; out-of-scope → empty; rejected → reason.
5. **Thin wrapper, not a new engine.** §1 maps to functions that already exist; the contract names them,
   it does not reimplement them.
6. **Witness everything.** No "it's decoupled / it's scoped" claim without the matching `§SEAM` line.

---

*Status: DRAFT v0.1, 2026-06-02 — the engine↔UI seam for the iDempiere 2.0 lineage. Owned by the engine
session; referenced by IDEMPIERE_RENDERER_SPEC.md (renderer session). Lets the two sessions build in
parallel against one interface. Signatures grounded in ad_data.js / erp_kernel.js / erp_signer.js /
kernel_ops.js / poc_wire.js (verified 2026-06-02); nothing asserted the code does not already support.*
