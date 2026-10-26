# ⚠ DO NOT REMOVE — AGENT_CALLABLE_CHECKERS (spec-first, 2026-10-27)

**SCOPE.** One local, read-only checker that an AI agent (Claude Code, Codex, any MCP client) or a person can
call to get a verdict on (A) **a user's IFC** and (B) **our own published claims about this codebase**.
The agent proposes; the checker judges. No AI/LLM runs inside the checker, and nothing in the shipped
browser runtime changes. **READ THE LOG AFTER EVERY RUN.** Exit code is not evidence. A verdict over an
empty population prints `VACUOUS`/`INCONCLUSIVE`, never `PASS`. Honour this block until every phase is ✅.

This file is written BEFORE any code. Nothing below is built yet.

## 0. Origin (user's words, 2026-10-27)
> *"Let AI LLMs agents call our checkers. Check if written this down, if not spec it. Also not just users
> IFCs but also check our codebase itself as claimed."*

Searched 2026-10-27 (`grep -i 'MCP|model context|agent callable'` over `bim-compiler/prompts`, `docs`,
`bim-ootb/prompts`, `docs`, README): **not written down anywhere.** Nearest prior work, none of it this:
- `prompts/ERP_WS_API.md` + `bim-ootb erp/ws_agent.js`, `erp/ws_policy.js`: agent access to **ERP data**
  (per-agent identity, expiry, rate limits, approve-by-digest). Its policy rules are reused in §4.
- `prompts/Modeller/COMPETITIVE_PASCALORG_HARVEST.md §2`: a competitor ships an MCP server over its editor.
- `docs/ERP_AI_ADVISORY.md`: the agent-security sources (OWASP LLM06, MCP security best practices).

## 1. What already exists (extracted, bim-ootb `origin/main` @ bbce0dc0 unless stated)
| checker | what it judges | where | state |
|---|---|---|---|
| `witness_no_ai_inside.js` C1-C3 | the guarantee in `docs/USER_GUIDE.md:9-16` (no AI, nothing leaves the browser, deterministic) | branch `origin/test/no-ai-inside-witness` (2 commits, **no PR, NOT on main**) | last verdict `PASS_WITH_DISCLOSED` (`prompts/NO_AI_INSIDE_WITNESS.md §8`) |
| Dubai Track-B `metrics_worker.js` M1-M15 | IFC richness census (spatial chain, psets, orphans, dup GUIDs, georef) | `readiness/metrics_worker.js` (on main) | browser Worker only; **VACUOUS on STEP corruption** (`IFC_COMPLIANCE_SELFCHECK.md §8.2` K2) |
| `ifcopenshell.validate` | IFC schema/attribute validity | python, dev env only | used by hand in `IFC_COMPLIANCE_SELFCHECK.md §8.3`; segfaults on truncated files (K2) |
| `witness_ifc_export_schema.js` X1-X8 | our two exporters emit schema-valid IFC4 | spec `IFC_COMPLIANCE_SELFCHECK.md §EXPORTER_FIX` | **not found on main** — status unverified |
| `witness_ids.js` I1-I3 + `ids_check.py` | IDS 1.0 via buildingSMART `ifctester` | `modeller/tests/` (on main) | bound to the private SYSNOVA shed sheets; SKIPs without them |
| `witness_kit/contract.js` | refuses a witness without population, schema and a red control that really fails | `witness_kit/` (on main) | the contract every new check here goes through |
| 1,003 `witness_*.js` files | individual feature claims | bim-ootb main | not indexed against any public claim |

**The gap, in one line:** the checks exist, but an outsider cannot call them, and the headline guarantee's
own checker is not even on `main` — a skeptic cloning the repo cannot run it today.

## 2. Two families of checks

**A. Model checks (the user's file).** Input: a local `.ifc` path (+ optional `.ids`). Output: one report.
- `A1 parse` — opens or not; corruption must be reported, not recovered silently (K2 rule).
- `A2 schema` — ifcopenshell validate, statement count by class.
- `A3 census` — Track-B M1-M15, verbatim keys.
- `A4 ids` — ifctester against a caller-supplied IDS; `applicable=0` for a spec → `VACUOUS` for that spec.
- Later, not phase 1: clash, quantities/cost, 4D (these need the compiled DB path, not raw IFC).

**B. Claim checks (our codebase).** A **claims registry** `checks/claims.json`, one row per public claim:
```
{ "id": "G1", "quote": "There is no AI and no LLM in this app.",
  "source": "bim-compiler/docs/USER_GUIDE.md:9", "check": "witness_no_ai_inside.js#C1",
  "needs": [], "last": {"verdict": "...", "commit": "...", "log": "..."} }
```
- `B1` every row's `quote` must still be present at `source` — a claim edited in the docs without the
  registry is `FAIL drift` (this is the drift detector; it is what keeps the ledger honest).
- `B2` a row with no `check` reports `UNWITNESSED` — listed, never hidden, never counted as PASS.
- `B3` a row whose check needs something the caller lacks (legacy iDempiere for the twin parity run,
  private sheets, GPU) reports `INCONCLUSIVE needs=<x>` plus the last recorded run, clearly labelled as
  recorded, not re-run.
- Seed rows (extract only, from existing docs): G1/G2/G3 (`USER_GUIDE.md:9-16`); IFC export validity
  (`IFC_COMPLIANCE_SELFCHECK.md`); SQLite == legacy twin (`prompts/SQLiteIDEMPIERE.md`, `needs: legacy`).
  Further rows are added only by quoting a published sentence — never by writing a new claim to fill the list.

## 3. Interface
- **One CLI is the truth:** `node checks/check.js ifc <file> [--ids f.ids]`, `claims list`,
  `claims verify <id>|--all`. Writes a JSON report + `§CHECK_*` log lines.
- **MCP is a thin adapter over the CLI** (`checks/mcp_server.js`, stdio). Tools: `check_ifc`,
  `check_ids`, `list_claims`, `verify_claim`, `verify_all_claims`. Each tool spawns the CLI and returns its
  report unchanged — no second implementation (CLAUDE.md "one implementation per responsibility").
- Report fields (every result): `verdict` ∈ `PASS | PASS_WITH_DISCLOSED | FAIL | INCONCLUSIVE | VACUOUS | NO-OP`,
  `population` (count judged), `redControl` (ran + failed as required), `tools` (versions: web-ifc,
  ifcopenshell, ifctester, node), `commit` (repo HEAD), `input_sha256`, `findings[]` (verbatim, file:line).
- Missing python deps → that check `INCONCLUSIVE needs=ifcopenshell`, the rest still run.

## 4. Boundaries
1. Read-only and local. Never uploads, never writes into the checked file or repo, never "fixes".
2. No LLM call anywhere in `checks/`. The agent is outside, calling in. `checks/` sits outside the
   no-AI scan boundary (`NO_AI_INSIDE_WITNESS.md §2`: viewer/common/erp/modeller) — that boundary and the
   user-guide wording stay as they are; the guide gains one sentence only if the owner wants it.
3. Same input + same commit → byte-identical report, except one `run_at` field. Witnessed (§5 W-AC-3).
4. File access limited to paths the caller passes; no directory walking outside the repo for claims.
5. Read-only tools need no identity; `ws_policy.js` rate limits are reused only if a remote transport is
   ever added (not in scope).

## 5. Witnesses for the checker itself (each names the issue it proves; built on `witness_kit/contract.js`)
- **W-AC-1 corruption is not a pass** — the K1-K4 controls (`IFC_COMPLIANCE_SELFCHECK.md §8.1`): K1 PASS-able,
  K2 truncated → `FAIL` (not `done`), K3 empty → `VACUOUS`, K4 garbage → `FAIL parse`. Disproves the Track-B
  K2 blind spot carried into the agent path.
- **W-AC-2 claim drift is caught** — copy of the registry with one quote altered → `B1 FAIL drift`.
- **W-AC-3 report is deterministic** — two runs, same input → reports equal after removing `run_at`.
- **W-AC-4 a broken claim fails** — fixture tree with an LLM endpoint injected into a viewer file →
  `verify_claim G1` = `FAIL`, finding names the file:line.
- **W-AC-5 adapter adds nothing** — every MCP tool result equals the CLI report byte for byte.
- **W-AC-6 unwitnessed stays visible** — a registry row with no check → `UNWITNESSED`, total PASS count unchanged.

## 6. Phases (top to bottom, WORK-TO-ZERO)
- **P0 land what exists** — PR `test/no-ai-inside-witness` to bim-ootb main (rebase, rerun, read the log);
  find out whether `witness_ifc_export_schema.js` / §EXPORTER_FIX ever landed and record it in §1.
- **P1** `checks/claims.json` seed rows + `claims list|verify` + W-AC-2/4/6.
- **P2** `ifc` checks A1-A4 (node harness around the unmodified `metrics_worker.js`; python helpers for A2/A4) + W-AC-1/3.
- **P3** MCP adapter + W-AC-5 + a README section "Ask your agent to check us".
- **P4** public claims page generated from the registry (each row: quote, check, last verdict, the command).

## 7. Open — the owner's call
- ⛔ Repo home: `bim-ootb/checks/` (beside the witnesses it calls — proposed) or a separate small repo/npm package?
- ⛔ Should the user guide mention that agents can call the checker, or keep the guide about the app only?
