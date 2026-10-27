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
| `witness_no_ai_inside.js` C1-C3 | the guarantee in `docs/USER_GUIDE.md:9-16` (no AI, nothing leaves the browser, deterministic) | was branch-only (no PR) until bim-ootb PR #2408 (2026-10-27) | 2026-10-27 on main: `FAIL C1=FAIL C2=PASS C3=PASS` (`NO_AI_INSIDE_WITNESS.md §8 Update 2026-10-27`) |
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

### 3.1 The report a person reads (owner, 2026-10-27: *"report be illustrative and well cited,
transparent so users gain facts not hype"*)
Every run writes `report.json` (the truth) and `report.html` (a pure render of it, self-contained, opens offline).
- **One card per check:** verdict, one plain sentence of what it means, what was judged (`population`), the
  evidence (verbatim finding, `file:line` or IFC entity `#id`), and the exact command to re-run just that check.
- **Every rule cites its source:** the buildingSMART page / IFC schema clause / IDS file for model checks; the
  quoted sentence + `file:line` for claim checks. A rule with no citation is not shown as a rule — it is a defect (W-AC-7).
- **Pictures only from measured numbers:** small bars for census metrics (M5-M8, M11-M14 as % of elements),
  a pass/fail strip per claim. No overall "score", grade, badge or percentage that could hide a FAIL.
- **"What this did not check" is always printed:** INCONCLUSIVE/UNWITNESSED items with the reason (`needs=`),
  the known limits from §1 (e.g. Track-B blind to STEP corruption, WHERE rules not run), tool versions and the
  repo commit. Empty limits on a run that skipped anything = defect.
- **Wording is generated, not written:** each sentence comes from a fixed template filled with a value from
  `report.json`. No adjectives that are not a verdict word. The HTML adds no number the JSON does not hold (W-AC-8).

### 3.2 The check panel (owner, 2026-10-27: *"well designed where users can see how to drop their IFC set,
giving stats how fast it takes, with yours all in, up till how to get it localised and air gaped inside theirs"*)
One page, the same `report.html` engine, four parts top to bottom:
1. **Drop your IFC set** — drop one or many `.ifc` (+ optional `.ids`); each file becomes a row with its own cards.
   In the browser it runs the same check code the CLI runs (no second implementation); the python-only checks (A2, A4)
   show `needs=ifcopenshell` there and point to the local kit (part 4).
2. **How fast** — per file: size, element count, wall time per check, and the machine it ran on (CPU threads, RAM,
   browser/node version). Only measured values from this run; beside them our own reference runs read from their
   logs (file, size, time, machine). No estimate, no "up to" figure, no extrapolation to file sizes nobody ran.
3. **Our claims, all in** — the full claims registry (§2 B) with each row's verdict, so the user sees what we
   say about ourselves checked in the same place, including FAIL, UNWITNESSED and INCONCLUSIVE rows.
4. **Take it inside** — how to run it on your own machines, then air-gapped (§3.3), as numbered steps with the
   exact commands and the checksum to compare at each step.

### 3.3 Local and air-gapped kit
- One archive: `checks/`, pinned runtime deps (web-ifc wasm, sql.js, ajv; python wheels for ifcopenshell/ifctester),
  `MANIFEST.sha256` of every file, and the claims registry at the release commit.
- Steps the panel prints: (1) download on a connected machine, (2) `sha256sum -c MANIFEST.sha256`, (3) carry it in,
  (4) `node checks/check.js selftest --offline` — runs W-AC-1/3 controls and prints the same verdicts as our run,
  (5) use. Nothing in steps 3-5 needs a network.
- `--offline` is not a promise, it is enforced (§4 R2). Claim rows that need our repo history or a live service
  report `INCONCLUSIVE needs=network` inside the air gap — never a cached PASS presented as a fresh one.

## 4. Rules the machine enforces (owner, 2026-10-27: *"leave instructions where machines do not allow crossing
or breaking rules"*)
Each rule is a refusal in code plus a witness that tries to break it. A rule that exists only as prose is not on this list.
| # | rule | how the code refuses | witness that tries to break it |
|---|---|---|---|
| R1 | read-only: never writes into the input or the repo | inputs opened read-only; output only to a fresh `--out` dir; refuses if `--out` is inside the input set or the repo | W-AC-11 points `--out` at the repo / the input → refused, no byte changed (sha before = after) |
| R2 | nothing leaves the machine | `--offline` (default in the kit) loads a guard that throws on any `http`/`https`/`net`/`dns`/`fetch` use; the browser panel ships with a CSP of `connect-src 'self'` | W-AC-9 runs the selftest inside a no-network sandbox (`unshare -rn`, or a container with `--network none`) → same report; a fixture that tries a request → run stops with `§CHECK_REFUSED network` |
| R3 | no AI inside the checker | `checks/` joins the no-AI scan (C1) of `witness_no_ai_inside.js` | C1 red control (LLM host injected into a `checks/` fixture) → FAIL |
| R4 | never fixes, never grades | no write path exists to the input; the render has no score/grade field (schema forbids it) | W-AC-8 + schema: a report carrying `score` fails validation |
| R5 | no PASS without a population | `witness_kit/contract.js` (population + red control required) | W-AC-1 K3 empty → VACUOUS |
| R6 | same input → same report | `run_at` is the only free field | W-AC-3 |
| R7 | only the paths the caller passes | refuses paths outside the given files and the repo root | W-AC-11 `../` path → refused |
The agent (outside) cannot switch any of these off by argument: there is no `--allow-network`, `--fix` or `--score`
flag. A change to R1-R7 is a code change in a PR, visible in the claims registry diff.

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
- **W-AC-7 every rule is cited** — each card's citation is non-empty; URL citations are on an allowlist of
  primary sources, `file:line` citations still contain the quoted text. Control: strip one citation → FAIL.
- **W-AC-8 the picture tells no more than the data** — every number in `report.html` appears in `report.json`;
  "What this did not check" is non-empty whenever any check is not PASS. Control: inject a number into the
  HTML template → FAIL; drop the limits section on an INCONCLUSIVE run → FAIL.
- **W-AC-9 offline is real** (R2) — selftest in the no-network sandbox gives the same verdicts; a request attempt is refused.
- **W-AC-10 speed is measured, not quoted** — every time on the panel traces to a timing field of a run log; a
  hand-typed time in the template → FAIL.
- **W-AC-11 the rules hold under attack** (R1, R7) — `--out` into the repo/input, `../` paths, a writable input → all refused, no byte changed.

## 6. Phases (top to bottom, WORK-TO-ZERO)
- **P0 land what exists** — 🔄 witness PR bim-ootb #2408 (auto-merge on); export-schema status still to find — PR `test/no-ai-inside-witness` to bim-ootb main (rebase, rerun, read the log);
  find out whether `witness_ifc_export_schema.js` / §EXPORTER_FIX ever landed and record it in §1.
- **P1** `checks/claims.json` seed rows + `claims list|verify` + W-AC-2/4/6.
- **P2** `ifc` checks A1-A4 (node harness around the unmodified `metrics_worker.js`; python helpers for A2/A4) + W-AC-1/3.
- **P2b** `report.html` render (§3.1) + W-AC-7/8.
- **P3** MCP adapter + W-AC-5; standalone package build of `checks/` (same files, no fork) so an agent can
  install it without cloning; README + user-guide section "Check us yourself" (§7).
- **P4** the check panel (§3.2) + public claims page from the registry + W-AC-10.
- **P5** local/air-gapped kit (§3.3), R1-R7 guards + W-AC-9/11.

## 7. Decided (owner, 2026-10-27: *"I think both. It be available and guide says how."*)
- **Home = both:** source lives in `bim-ootb/checks/` beside the witnesses it calls; the same files are also
  published as a standalone package. One source, two ways to get it — the package is a build, never a fork.
- **The user guide says how:** a "Check us yourself" section — run it from a terminal, or ask your AI agent to
  (MCP setup lines), what a report looks like, and what it cannot check. The guide's "no AI in this app"
  sentence stays: the agent is outside the app, calling the checker.
