#!/usr/bin/env node
// §S49 LEG-4 PROBE — re-injection, the soundness fix §S48 proved is mandatory.
// §S47 refused the PHYSICS edge that contradicted the grid. §S48 measured what that costs: the
// precedence is dropped, not satisfied, so float rose and strict midair went 0 -> 8,702. The sound
// form is the INVERSE: physics is MANDATORY and never refused; the grid is the tidiness layer and
// it is the GRID edge that yields where the two disagree. Elements are then scheduled in an order
// that respects every physics edge, with the grid's (location, trade) rank as the PRIORITY that
// breaks every tie — which is what "the grid orders, declared arrows win" actually means.
// PASS MARK, declared before the run: strict midair back to 0 on 7/7, and float no worse than B.
// (retains §S47/§S48 blocks below for comparison)
// The grid is TWO ORDERED LISTS, not a solved graph: trades in fixed order within a location,
// locations bottom-to-top. Both edge families point forward, so the cell graph is ACYCLIC BY
// CONSTRUCTION — there is nothing to contract and no band to report. What this probe measures is
// the only thing left to be measured: WHICH REAL PHYSICS THE GRID CANNOT REPRESENT — every E1
// support edge that contradicts the grid order, i.e. every link refuse-at-creation would refuse.
// That residue is what §S26.11 leg 4 hands to a person as a declared arrow.
// (retains §S46's room-grain cycle test below for comparison)
// EXTRACT, DON'T INVENT: the location comes from rel_contained_in_space (the IFC's own
// element→space containment, what LBMS calls a location) and, where no room is declared, from
// build/level_deriver.js (§S35, already built and gate-passed: 100% coverage, T4=0, 14/14 fixtures).
// No new location grid is derived here. — copy into bim-ootb/viewer/tests/ and run from there (relative requires).
// STUDY ONLY, READ-ONLY. Measures the Gantt bar hull AT _displayTimeline's own output and
// time_machine.js:6074's own grouping — B1, not a separate lane. Nothing is designed or built here.
// witness_midair_zero.js — §MIDAIR_REPAIR (2026-08-12, bim-compiler
// prompts/4D_SCHEDULE_PERFECTION.md — the acceptance bar in the user's own words:
// "all i want is not to see a single item hanging in midair that is all").
//
// ISSUE this witness proves/disproves: does any element APPEAR in the movie before the first
// element it physically touches appears? ScheduleGate.auditFloating cannot answer that — its
// support pools are seq<=4 + promoted slabs + walls, so an element whose only neighbours are
// outside those pools (and every seq<=4 member, which no gate checks at all) is reported clean
// while hanging in plain sight. This witness judges the DISPLAY timeline — the times kernel_ops
// is written from, i.e. what the movie plays — with an INDEPENDENT census: it re-derives contact
// and ground-layer geometry itself rather than calling the shipped repair's own helpers, so a
// repair that is mis-wired, mis-scoped, or silently a no-op FAILS here instead of self-certifying.
//
// §S20 REDESIGN (2026-08-17, 4D_GANTT_TM_REFACTOR.md §S20) — this witness used to author its
// "post-repair" timeline by slicing `_twoTierRemap`/`_midairRepair` (the dead legacy chain,
// §PATHS NOT TO TAKE #1: reachable only via `?cpm4d=0`, never live) straight out of source and
// calling them, making this witness the pipeline's own regression baseline rather than a test OF
// it (§S19_RESULTS). Rebuilt to author the timeline via the LIVE default path instead —
// `_displayTimeline`'s CPM success branch (`CpmSchedule.run`, viewer/cpm_schedule.js), the exact
// function `injectGantt`'s kernel_ops write path and the materializeZones displayRemap hook both
// call. `CpmSchedule` is REQUIRED as the real module (never sliced) — same discipline
// `probe_cpm_display_path.js` and `witness_zone_display_authoring.js`'s W-ZDA-6 already established.
// This witness's INDEPENDENCE property is unchanged and is why it is not a duplicate of W-ZDA-6:
// `census()` below re-derives contact/ground geometry itself — it does NOT call `_contactGraph`
// (the function `_midairAudit`, and therefore W-ZDA-6's own judge, calls internally) — so a bug in
// `_contactGraph` itself would self-certify in W-ZDA-6 but still be caught here. This witness also
// covers the full 7-building fleet; W-ZDA-6 covers 2 (Duplex, HHS_Office_Federated).
//
//   W-MZ-1  Pre-CPM census REPORTED per building (the RAW computeSchedule output, before
//           _displayTimeline authors anything). Reported, not gated — it is the before-number,
//           and it changes whenever any upstream gate changes.
//   W-MZ-2  THE BAR: post-CPM midair == 0 on every shipped building. Any non-zero = a real
//           element a viewer will see hanging.
//   W-MZ-3  RETIRED this stage (was: "repair moves nothing earlier than the pre-repair remap
//           output" — a two-STAGE invariant specific to the legacy remap-then-repair architecture).
//           CPM authors the whole timeline in ONE pass from RAW, not two stages, so there is no
//           intermediate output left to be monotone against — and the natural analogue (CPM start
//           vs RAW start) is MEASURED to move earlier on ~25% of elements as normal, correct
//           behavior (§S19_RESULTS §E5_BOUND_CHECK: 12,131/48,428 Terminal elements start earlier
//           under CPM than their own raw computeSchedule start, by design — ES seeds from one
//           shared epoch, not a per-element floor). Asserting "earlier == 0" against RAW would
//           fail on already-measured, already-accepted behavior — a manufactured regression, not
//           a real one. No replacement invariant substituted; W-MZ-8 below is the real cost-lock.
//   W-MZ-4  Orphans (touch NOTHING anywhere in the model — no schedule can fix them) are counted
//           and LOCKED at their measured baselines: a change is a real extraction/data change to
//           examine, never absorbed silently. Purely geometric (x0/x1/y0/y1/bz/tz), independent of
//           which display-authoring path ran — re-measured fresh this stage, not assumed carried
//           over from the legacy-chain numbers.
//   W-MZ-5  Wiring: the kernel_ops path calls `_displayTimeline` (unchanged assertion), and
//           `_displayTimeline`'s CPM branch actually calls `CpmSchedule.run` then `_midairAudit`
//           on success — replaces the old "legacy branch still runs _twoTierRemap then
//           _midairRepair" check, which tested the FALLBACK the live path never takes and which
//           breaks by construction once Part B deletes those two functions.
//   W-MZ-6  The 🔓→🔒 LOCK gate judges by the SAME rule (verifyGanttIntegrity runs _midairAudit and
//           refuses on it) — otherwise a planner's own bar-drag re-creates the hangings the
//           generated film has none of, and the lock is granted anyway.
//   W-MZ-7  That judge is not vacuous: drag one element 5 days before its first contact and it must
//           report the hanging. A test that cannot fail proves nothing.
//   W-MZ-8  The COST of CPM authoring is locked, not hidden: moving an element can leave a
//           dependent starting before that support FINISHES (auditFloating's own measure). The
//           after-value is baselined per building, freshly measured against the CPM path (NOT
//           carried over from the legacy-chain numbers, which measured a different function),
//           so the trade can never drift quietly.
//
// Reachability proof (§S14.0 discipline: print it, don't assume it): each building's `_dtResult`
// is asserted `.cpm === true` (fresh CpmSchedule.run success, this witness never populates
// `_displayTimeline`'s one-shot cache before its own single call) and the captured
// `§CPM_DISPLAY on` log line is printed per building — never `§CPM_DISPLAY_FALLBACK`.
//
// Approximation caveat (same as witness_tier_serial_display.js, retired §S20 — see this file's own
// prior revisions): durations come from ScheduleAuthor._installSecs with real class fragmentation
// + linear weighting — the same single-source formula injectGantt's getInstallSecs uses. Real
// per-element numbers, node-side.
//
// Command: BLD_DIR=~/bim-ootb/buildings node tests/witness_midair_zero.js   (from viewer/)
// Read the § log lines, not the exit code alone.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const initSqlJs = require(path.join(__dirname, '..', '..', 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleGate = require(path.join(__dirname, '..', 'schedule_gate.js'));
const ScheduleAuthor = require(path.join(__dirname, '..', 'schedule_author.js'));
const CpmSchedule = require(path.join(__dirname, '..', 'cpm_schedule.js'));
const BIMC = process.env.BIM_COMPILER || path.join(require('os').homedir(), 'bim-compiler');
const LevelDeriver = require(path.join(BIMC, 'build', 'level_deriver.js'));
const tmSrc = fs.readFileSync(path.join(__dirname, '..', 'time_machine.js'), 'utf8');

let pass = 0, fail = 0;
function assert(cond, msg) { if (cond) { pass++; console.log('  PASS ' + msg); } else { fail++; console.log('  FAIL ' + msg); } }
function finish() { console.log('\n§MIDAIR_ZERO_SUMMARY pass=' + pass + ' fail=' + fail); process.exit(fail ? 1 : 0); }

function sliceFn(src, name, which, optional) {
  let from = 0;
  for (let p = 0; p <= (which || 0); p++) {
    const idx = src.indexOf('function ' + name + '(', from);
    if (idx < 0) { if (optional) return null; throw new Error(name + ' #' + (which || 0) + ' not found'); }
    let depth = 0, i = idx, seenOpen = false;
    for (; i < src.length; i++) {
      if (src[i] === '{') { depth++; seenOpen = true; }
      else if (src[i] === '}') { depth--; if (seenOpen && depth === 0) break; }
    }
    if (i >= src.length) throw new Error('unbalanced braces for ' + name);
    if (p === (which || 0)) return src.slice(idx, i + 1);
    from = i + 1;
  }
  throw new Error('unreachable');
}
// §ZONE_INDEX (#1313) + §TIER_SERIAL_BY_ZONE (#1314) added module-level helpers that
// _buildXrayElements now calls. Sliced optionally so older revisions still run unchanged.
const zoneParts = [sliceFn(tmSrc, '_zoneIndexBuild', 0, true), sliceFn(tmSrc, '_zoneIndex', 0, true)].filter(Boolean);
// §SCHEDULE_CLASSIFY_DEDUP (2026-08-15) added _classifyNameOverride/_classifyRule — the shared
// pair _buildXrayElements' local matchNameOverride/matchRule now delegate to. Sliced optionally,
// same reasoning. This sandbox's `window` has no `ScheduleAuthor`, so the sliced pair runs its own
// fallback branch — functionally identical, not the delegating path (covered by
// witness_class_fallback_blackbox.js instead).
const classifyParts = [sliceFn(tmSrc, '_classifyNameOverride', 0, true), sliceFn(tmSrc, '_classifyRule', 0, true)].filter(Boolean);
// §S20: dropped from this slice list — `_promoteRoofLoadPath`/`_buildXrayElements`/`_contactGraph`/
// `_midairAudit`/`_displayTimeline` never reach them — `_tier1Extents`, `_tier1Serialize`,
// `_tier1Protrusion`, `_tierAuditRegate`, `_twoTierRemap`, `_midairRepair` (only reachable through
// each other and `_displayTimeline`'s FALLBACK branch, which `_CPM_DISPLAY = true` below never
// takes), and `_TIER1_ORDER` (used only inside that same dead chain).
const sliced = ['var _CPM_DISPLAY = true;',   // §S20: the only branch left reachable post-Part-B
  (zoneParts.length === 2 ? 'var _zoneMemo = [];' : ''), zoneParts[0] || '', zoneParts[1] || '',
  sliceFn(tmSrc, '_zoneOf', 0, true) || '',
  classifyParts[0] || '', classifyParts[1] || '',
  sliceFn(tmSrc, '_promoteRoofLoadPath'), sliceFn(tmSrc, '_buildXrayElements'),
  sliceFn(tmSrc, '_contactGraph'), sliceFn(tmSrc, '_designatedSupport'), sliceFn(tmSrc, '_midairAudit'),
  sliceFn(tmSrc, '_displayTimelineRemember'), sliceFn(tmSrc, '_displayTimeline')].join('\n');
console.log('§MIDAIR_SLICE zoneHelpers=' + (zoneParts.length === 2 ? 'present' : 'absent (pre-#1313 revision)') +
  ' classifyHelpers=' + (classifyParts.length === 2 ? 'present' : 'absent (pre-§SCHEDULE_CLASSIFY_DEDUP revision)') +
  ' — §S20: authors via _displayTimeline (CPM branch), CpmSchedule required as the real module');

// W-MZ-5 — the CPM path must be reachable from the kernel_ops path, not merely defined.
assert(/_displayTimeline\(_twItems\)/.test(tmSrc),
  'W-MZ-5a kernel_ops path calls _displayTimeline (the single display-timeline source)');
// W-MZ-5b: the whole _displayTimeline body (from its own def to the next function) is checked
// directly — §S20 Part B deleted the legacy fallback (_twoTierRemap/_midairRepair), so there is no
// longer a second branch's text to accidentally match against; testing the full body is now both
// simpler AND robust (previously this sliced out just the CPM `if` branch using
// 'var tw = _twoTierRemap' as the boundary marker — that string no longer exists post-deletion,
// which would have silently widened the slice to near-EOF rather than erroring; found and fixed
// while executing Part B, not before).
const _dtIdx = tmSrc.indexOf('function _displayTimeline(items)');
const _dtBody = tmSrc.slice(_dtIdx, tmSrc.indexOf('function _displayTimelineRemember', _dtIdx));
assert(_dtIdx > 0 && _dtBody.length > 0 &&
  /CpmSchedule\.run\(items,/.test(_dtBody) && /if \(r && r\.ok\)/.test(_dtBody) && /_midairAudit\(items\)/.test(_dtBody) &&
  _dtBody.indexOf('_twoTierRemap') < 0 && _dtBody.indexOf('_midairRepair') < 0,
  'W-MZ-5b _displayTimeline calls CpmSchedule.run then, on success, _midairAudit (the live default ' +
  'path), and no longer references the deleted _twoTierRemap/_midairRepair chain at all');
// W-MZ-6 — the LOCK gate must judge by the same rule the generator enforces, or a planner's drag
// re-creates exactly the hangings the generated film has none of and the lock is still granted.
const _vgi = tmSrc.slice(tmSrc.indexOf('function verifyGanttIntegrity()'));
const _vgiBody = _vgi.slice(0, _vgi.indexOf('\n  }\n'));
assert(_vgiBody.indexOf('_midairAudit(') > 0,
  'W-MZ-6a verifyGanttIntegrity (the 🔓→🔒 lock gate) runs _midairAudit — auditFloating alone cannot see this population');
assert(/ok:\s*n <= base\.floating && ma\.midair <= base\.midair/.test(_vgiBody),
  'W-MZ-6b the lock gate REFUSES on a midair INCREASE (§GANTT_LOCK_DELTA: ok requires BOTH audits no worse ' +
  'than the edit-start baseline — absolute zero was the old contract and it refused the lock on 4 of 7 ' +
  'buildings for an unedited schedule)');

function loadRatesTable() {
  const txt = fs.readFileSync(path.join(__dirname, '..', 'rates.js'), 'utf8');
  const start = txt.indexOf('var RATES = {');
  const defIdx = txt.indexOf('var SEQUENCE_DEFAULT');
  return (new Function(txt.slice(start, txt.indexOf('};', defIdx) + 2) + '\n return RATES;'))();
}

const BLD_DIR = process.env.BLD_DIR || path.join(require('os').homedir(), 'bim-ootb', 'buildings');
// §S39/§S37-A2 (2026-08-19) — DB RESOLUTION IS A RULE, NOT A DICTIONARY. It used to be a
// hand-maintained map with ONE entry (LTU_AHouse), so every other building silently fell back to
// `<bld>_extracted.db` — including Terminal, Hospital and Clinic, which all HAVE a newer `_meta.db`
// (Terminal's and Hospital's were patched by PRs #1427/#1428 on 2026-08-17 and this witness never
// saw either patch). Measured cost of reading the deprecated file, same engine, only the DB
// changed: Terminal W-MZ-8 10,011 → 4,256 (−57.5%), Hospital 8,103 → 8,210, Clinic identical.
// The rule: prefer `<bld>_meta.db` when it exists, fall back to `<bld>_extracted.db`, and LOG the
// choice per building so a stale-fixture measurement can never again be read as a code regression
// (which is exactly what happened on 2026-08-18 — see the §RESULTS addendum in
// prompts/4D_GANTT_TM_REFACTOR.md). A dictionary entry would have fixed one building; the rule
// fixes the class and stays correct as more buildings gain a meta/geo split.
function resolveDbFile(bld) {
  const meta = path.join(BLD_DIR, bld + '_meta.db');
  const extracted = path.join(BLD_DIR, bld + '_extracted.db');
  if (fs.existsSync(meta)) return { path: meta, kind: 'meta', deprecatedAlso: fs.existsSync(extracted) };
  return { path: extracted, kind: 'extracted', deprecatedAlso: false };
}
const BUILDINGS = (process.env.ONLY || 'Terminal,Hospital,Duplex,HHS_Office_Federated,Clinic,LTU_AHouse,JKR').split(',');
// §S20 (2026-08-17) — FRESH baselines against the LIVE CPM path (`_displayTimeline`'s CPM branch),
// MEASURED this stage (first run with placeholder 0s, real numbers read off the FAIL lines,
// re-run to confirm PASS — never invented), NOT carried over assumed-unchanged from the retired
// legacy-chain numbers (those measured a DIFFERENT function's output entirely). The float-after
// trade (W-MZ-8) is genuinely new — CPM's precedence-driven displacement is a different mechanism
// than the legacy repair's later-only push, so a different number is expected, not a regression.
// §S39 RE-LOCK (2026-08-19). The §S20 numbers were GREEN when locked at 8f8d3de (#1430) and went
// RED on all 7 at 5ea6fcf (#1434 — "E3 gate no longer exempts stragglers from their own phase's
// completion"), then moved again at 6a395ca (#1435 — designatedSupport + directional judge).
// Bisected commit by commit against UNCHANGED DB files (green at #1431/#1432/#1433, red at #1434),
// so this is a CODE movement, not data drift, and both movers are merged, intentional,
// independently-verified correctness fixes: the lock was stale, not the engine.
// ⚠ #1435's own commit message attributed this failure to itself — measured, all 7 were ALREADY
// red at 6a395ca^. Corrected in prompts/4D_GANTT_TM_REFACTOR.md §S39.1.
// These numbers are measured on the file resolveDbFile() now picks (meta where it exists), which is
// why Terminal and Hospital differ from the extracted-DB values quoted in §S39.2.
//   §S20 lock → after #1434 → after #1435 (extracted) → THIS LOCK (correct DB)
//   Terminal 8789 → 10086 → 10011 → 4256   ·  Hospital 5107 → 8466 → 8103 → 8210
//   Duplex 289 → 239 → 237 → 237           ·  HHS 1538 → 1606 → 1491 → 1491
//   Clinic 3523 → 958 → 1205 → 1205        ·  LTU 15896 → 15296 → 12686 → 12686
//   JKR 3736 → 3656 → 3385 → 3385
// §S26.2 RE-LOCK (2026-08-19) — structure-first support election. The numbers this replaces were
// themselves freshly measured in the same branch stack (§S39 re-lock, correct `_meta.db` files);
// these are the SAME instrument on the SAME files with only the predicate changed, so the deltas
// below are the fix and nothing else:
//   Terminal 4256 → 2151 (−49.5%) · Hospital 8210 → 3960 (−51.8%) · Duplex 237 → 44 (−81.4%)
//   HHS 1491 → 889 (−40.4%) · Clinic 1205 → 877 (−27.2%) · LTU 12686 → 5023 (−60.4%)
//   JKR 3385 → 1222 (−63.9%)      — better on 7/7, worse on none.
const CPM_FLOAT_AFTER_BASELINE = { Terminal: 2151, Hospital: 3960, Duplex: 44, HHS_Office_Federated: 889,
  Clinic: 877, LTU_AHouse: 5023, JKR: 1222 };
// Orphans (W-MZ-4) are purely geometric (x0/x1/y0/y1/bz/tz contact only, never reads .s/.e) so they
// are independent of which display-authoring path produced the times — MEASURED to be IDENTICAL to
// the retired legacy-chain baseline (Terminal 7, Hospital 35, Duplex 1, HHS 36, Clinic 27,
// LTU_AHouse 865, JKR 1), confirming that independence rather than assuming it.
// §S39: Terminal 7 → 25. Same DB swap, not a code change — Terminal_meta.db has the SAME 48,428
// elements/transforms as the deprecated extracted file but different elevations (sum(center_z)
// 1,557,254 → 847,396, PR #1427's patch), so 18 more elements genuinely touch nothing. Orphans are
// purely geometric, so the DB is the only thing that can move this number.
const CPM_ORPHAN_BASELINE = { Terminal: 25, Hospital: 35, Duplex: 1, HHS_Office_Federated: 36,
  Clinic: 27, LTU_AHouse: 865, JKR: 1 };
const CELL = ScheduleGate.CELL, EPS = ScheduleGate.EPS, GAP = ScheduleGate.GAP;
const D = 86400000;

// ── the INDEPENDENT judge (deliberately not the shipped repair's own helpers) ──
function census(items) {
  const grid = {};
  const cellsOf = e => { const o = [];
    for (let a = Math.floor(e.x0 / CELL); a <= Math.floor(e.x1 / CELL); a++)
      for (let b = Math.floor(e.y0 / CELL); b <= Math.floor(e.y1 / CELL); b++) o.push(a + ',' + b);
    return o; };
  items.forEach((it, i) => cellsOf(it).forEach(c => (grid[c] = grid[c] || []).push(i)));
  let midair = 0, orphan = 0, grounded = 0, ok = 0;
  const worst = [];
  let probe = null;   // any non-grounded element WITH contacts — used by W-MZ-7 to re-create a hanging
  items.forEach((T, i) => {
    let lowest = Infinity, firstContact = Infinity, contacts = 0;
    const seen = {};
    for (const c of cellsOf(T)) {
      const arr = grid[c]; if (!arr) continue;
      for (const j of arr) {
        if (j === i || seen[j]) continue;
        const S = items[j];
        if (!(S.x0 <= T.x1 && S.x1 >= T.x0 && S.y0 <= T.y1 && S.y1 >= T.y0)) continue;
        seen[j] = 1;
        if (S.bz < lowest) lowest = S.bz;
        const bearing = S.bz < T.bz - EPS && S.tz >= T.bz - GAP;
        // §DAY_GAP_TAIL (2026-08-12): this mirrors _contactGraph's carrier clause EXACTLY,
        // including its lower-bound-only band (`S.bz >= T.tz - GAP` with no upper bound, so any
        // element at any height above T counts). That asymmetry was measured and deliberately LEFT
        // ALONE — see the §DAY_GAP_TAIL entry in bim-compiler prompts/4D_SCHEDULE_PERFECTION.md.
        const carrier = S.bz >= T.tz - GAP && S.tz > T.tz + EPS;
        const embedded = S.bz <= T.bz + EPS && S.tz >= T.tz - EPS;
        if (!bearing && !carrier && !embedded) continue;
        contacts++;
        if (S.s < firstContact) firstContact = S.s;
      }
    }
    const isGround = !(lowest < T.bz - GAP);
    if (!contacts) { if (isGround) grounded++; else orphan++; return; }
    if (!isGround && !probe && firstContact > 0) probe = { i, guid: T.guid, firstContact };
    if (firstContact <= T.s + 1) { ok++; return; }
    if (isGround) { grounded++; return; }
    midair++;
    worst.push({ cls: T.cls, seq: T.seq, phase: T.phase, bz: T.bz, start: T.s / D, sup: firstContact / D });
  });
  worst.sort((a, b) => (b.sup - b.start) - (a.sup - a.start));
  return { midair, orphan, grounded, ok, worst, probe };
}

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(__dirname, '..', '..', 'modeller', 'lib', 'sql-wasm.wasm')) });
  const rulesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'rates', 'sequence_rules.json'), 'utf8'));
  const SR = rulesJson.SEQUENCE_RULES, SD = rulesJson.SEQUENCE_DEFAULT, LR = rulesJson.LABOR_RATES;
  const NO = rulesJson.NAME_OVERRIDES || [];
  const RATES = loadRatesTable();

  for (const bld of BUILDINGS) {
    const dbPick = resolveDbFile(bld);
    const dbPath = dbPick.path;
    console.log('§W_MZ_DBFILE ' + bld + ' using=' + path.basename(dbPath) + ' kind=' + dbPick.kind +
      (dbPick.deprecatedAlso ? ' (a deprecated ' + bld + '_extracted.db also exists and was NOT used)' : '') +
      ' — every number below for this building is measured on THIS file');
    if (!fs.existsSync(dbPath)) { assert(false, 'W-MZ fixture missing: ' + dbPath); continue; }
    const db = new SQL.Database(fs.readFileSync(dbPath));
    // §S20: window.LABOR_RATES = the real rates.js table (RATES.LABOR_RATES) — matches what a real
    // browser exposes (rates.js declares `var LABOR_RATES` at module scope, i.e. window.LABOR_RATES),
    // so _displayTimeline's own §S6_CREW_PASS max_crews_fixed/max_crews lookup sees real per-resource
    // caps instead of running crew-unconstrained.
    const sandbox = { console: { log: () => {}, warn: () => {} }, performance: { now: () => Date.now() },
      window: { SEQUENCE_RULES: SR, SEQUENCE_DEFAULT: SD, SEQUENCE_NAME_OVERRIDES: NO, LABOR_RATES: RATES.LABOR_RATES },
      ScheduleGate: ScheduleGate, Math: Math, A: () => ({ db: db }),
      URLSearchParams: URLSearchParams, CpmSchedule: CpmSchedule };
    vm.createContext(sandbox);
    vm.runInContext(sliced + '\nthis.__bxe = _buildXrayElements; this.__dt = _displayTimeline;', sandbox);
    const els = sandbox.__bxe();
    if (!els || !els.length) { assert(false, 'W-MZ ' + bld + ' element build produced nothing'); db.close(); continue; }

    const nameOf = {};
    const nr = db.exec("SELECT guid, ifc_class, COALESCE(element_name,'') FROM elements_meta");
    if (nr.length) nr[0].values.forEach(v => { nameOf[v[0]] = v[2]; });
    const frag = ScheduleAuthor._classFragmentation(db, RATES);
    const lin = ScheduleAuthor._linearWeighting(db, RATES);
    const geoEls = els.filter(e => !(e.x0 === e.x1 && e.y0 === e.y1 && e.base_z === e.top_z));
    geoEls.forEach(e => {
      const rule = ScheduleAuthor.matchNameOverride(e.cls, nameOf[e.guid] || '', NO) || ScheduleAuthor.matchRule(e.cls, SR, SD);
      if (!e.phase) e.phase = rule.phase;
      e.resource = rule.resource || '_DEFAULT';
      const realQty = (frag.fragmented[e.cls] && frag.area[e.guid] != null) ? frag.area[e.guid] : null;
      const span = Math.max(e.x1 - e.x0, e.y1 - e.y0, e.top_z - e.base_z);
      const avgLen = lin.avgLength[e.cls];
      const lengthRatio = (realQty == null && span > 0 && avgLen > 0) ? span / avgLen : null;
      e.installSecs = ScheduleAuthor._installSecs(e.cls, rule, LR, realQty, lengthRatio);
    });
    // §S46 — declared location (rel_contained_in_space) + derived level (§S35), read before close.
    const __L = LevelDeriver.readLookups(db);
    const __ldEls = geoEls.map(e => ({ guid: e.guid, cls: e.cls, base_z: e.base_z, top_z: e.top_z }));
    const __G = LevelDeriver.buildGrid(__L, __ldEls); __G.medGap = LevelDeriver.medianGap(__G.grid);
    const __roomOf = {}, __levelOf = {};
    let __withRoom = 0;
    __ldEls.forEach(e => {
      const sp = __L.elementSpaces[e.guid];
      if (sp && sp.length) { __roomOf[e.guid] = sp[0]; __withRoom++; }
      const r = LevelDeriver.levelFor(e, __L.rawStorey[e.guid], __L, __G);
      __levelOf[e.guid] = (r.level == null ? 'NONE' : r.level.toFixed(2));
    });
    console.log('§S46_GRAIN ' + bld + ' elements=' + __ldEls.length +
      ' withDeclaredRoom=' + __withRoom + ' (' + (100 * __withRoom / __ldEls.length).toFixed(2) + '%)' +
      ' distinctRooms=' + new Set(Object.values(__roomOf)).size +
      ' distinctDerivedLevels=' + new Set(Object.values(__levelOf)).size +
      ' levelGridSource=' + __G.source);
    db.close();
    const maxCrews = {};
    for (const rk in LR) if (LR[rk].max_crews) maxCrews[rk] = LR[rk].max_crews;

    const quiet = console.log; console.log = () => {};
    let sched;
    try { sched = ScheduleGate.computeSchedule(geoEls, 0, 1, maxCrews); } finally { console.log = quiet; }

    const items = geoEls.map(e => ({ guid: e.guid, s: sched[e.guid].start, e: sched[e.guid].end,
      bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, cls: e.cls, seq: e.seq,
      phase: e.phase, storey: e.storey, resource: e.resource }));   // storey/resource: cpm_schedule.js reads both
    sandbox.__items = items;

    const before = census(items);   // RAW schedule (pre-CPM) — W-MZ-1's "before" number
    const _floatAt = () => {
      const m = {}; items.forEach(it => { m[it.guid] = { start: it.s, end: it.e }; });
      const q = console.log; console.log = () => {};
      try { return ScheduleGate.auditFloating(geoEls, m); } finally { console.log = q; }
    };
    const floatPre = _floatAt();
    // §S44 — snapshot BEFORE _displayTimeline mutates `items` in place. Config A = pre-CPM with the
    // shipped crew caps (levelling ON, CPM interleaving OFF). Config C = same scheduler, crews
    // UNCAPPED (levelling OFF) — the control that isolates levelling from everything else.
    const __snapA = items.map(it => ({ guid: it.guid, s: it.s, e: it.e, storey: it.storey, phase: it.phase }));
    let __snapC = null, __floatC = 'ERR';
    try {
      const q0 = console.log; console.log = () => {};
      let uncapped;
      try { uncapped = ScheduleGate.computeSchedule(geoEls.map(e => Object.assign({}, e)), 0, 1, {}); }
      finally { console.log = q0; }
      __snapC = geoEls.filter(e => uncapped[e.guid]).map(e => ({ guid: e.guid,
        s: uncapped[e.guid].start, e: uncapped[e.guid].end, storey: e.storey, phase: e.phase }));
      const mC = {}; __snapC.forEach(it => { mC[it.guid] = { start: it.s, end: it.e }; });
      const q1 = console.log; console.log = () => {};
      try { __floatC = ScheduleGate.auditFloating(geoEls, mC); } finally { console.log = q1; }
    } catch (e) { __floatC = 'ERR:' + (e && e.message || e); }
    console.log('§MIDAIR_BEFORE ' + bld + ' midair=' + before.midair + ' orphan=' + before.orphan +
      ' grounded=' + before.grounded + ' ok=' + before.ok + ' total=' + items.length);
    before.worst.slice(0, 3).forEach(w => console.log('    worst ' + w.cls + ' seq=' + w.seq + ' bz=' + w.bz.toFixed(2) +
      ' start=' + w.start.toFixed(1) + 'd firstSupport=' + w.sup.toFixed(1) + 'd'));

    const dtLines = [];
    sandbox.console = { log: (...a) => dtLines.push(a.join(' ')), warn: (...a) => dtLines.push(a.join(' ')) };
    const dtResult = vm.runInContext('this.__dt(this.__items);', sandbox);
    // §S14.0 reachability proof — print it, don't assume it. Each building gets a FRESH vm context
    // (no _displayTimeline._last cache carried in from a prior call), so `.cpm` must be exactly
    // `true` (fresh CpmSchedule.run success) — never 'reuse' (would mean a stale cache hit, which
    // cannot happen here) and never `false` (would mean the FALLBACK branch ran, i.e. this test
    // silently reverted to measuring the dead chain again — the exact bug class this redesign
    // exists to prevent).
    const cpmOnLine = dtLines.find(l => l.indexOf('§CPM_DISPLAY on') === 0);
    assert(dtResult && dtResult.cpm === true && !!cpmOnLine,
      'W-MZ-CPM-PATH ' + bld + ' _displayTimeline authored via the LIVE CPM branch, not the fallback ' +
      '(cpm=' + (dtResult && dtResult.cpm) + '; ' + (cpmOnLine || 'no §CPM_DISPLAY on log line captured') + ')');
    console.log((cpmOnLine || '§CPM_DISPLAY <no log captured>') + '  [' + bld + ']');

    const after = census(items);
    const floatPost = _floatAt();

    // ── §S44 SPLIT — crew-capacity levelling vs CPM interleaving ──────────────────────────────
    // Same elements, same DB, same judges; grouping is time_machine.js:6074's own storey|phase
    // (task tables hold 0 rows fleet-wide, §S26.13, so that fallback IS the live grouping).
    //   A  pre-CPM,  caps ON   levelling on,  interleaving OFF
    //   C  pre-CPM,  caps OFF  levelling off, interleaving off   (isolates levelling)
    //   B  post-CPM, caps ON   what ships today
    // A vs C is levelling's contribution to bar width. B vs A is the CPM pass's.
    const tukey = (arr, lowSide) => {
      const a = arr.slice().sort((x, y) => x - y), n = a.length;
      const q1 = a[Math.floor(n * 0.25)], q3 = a[Math.floor(n * 0.75)], iqr = q3 - q1;
      return lowSide ? Math.max(a[0], q1 - 1.5 * iqr) : Math.min(a[n - 1], q3 + 1.5 * iqr);
    };
    const med = a => { const x = a.slice().sort((p, q) => p - q); return x.length ? x[Math.floor(x.length / 2)] : 0; };
    function hullStats(rows) {
      const gmap = {};
      let lo = Infinity, hi = -Infinity;
      rows.forEach(it => {
        const key = (it.storey || '_UNKNOWN') + '|' + (it.phase || 'Architecture');
        (gmap[key] || (gmap[key] = { starts: [], ends: [] }));
        gmap[key].starts.push(it.s); gmap[key].ends.push(it.e);
        if (it.s < lo) lo = it.s; if (it.e > hi) hi = it.e;
      });
      const span = hi - lo;
      const bars = Object.keys(gmap).map(key => {
        const g = gmap[key], n = g.starts.length;
        const ss = g.starts.slice().sort((a, b) => a - b), ee = g.ends.slice().sort((a, b) => a - b);
        const rawSpan = ee[n - 1] - ss[0];
        const trimSpan = Math.max(tukey(g.ends, false) - tukey(g.starts, true), 0);
        let oneOut = rawSpan;
        if (n >= 2) oneOut = Math.max(Math.min(ee[n - 1] - ss[1], ee[n - 2] - ss[0]), 0);
        return { key, n, rawFrac: span ? rawSpan / span : 0, trimFrac: span ? trimSpan / span : 0,
                 owedToOne: rawSpan > 0 ? (rawSpan - oneOut) / rawSpan : 0 };
      });
      return { nbars: bars.length, days: span / 86400000,
               medRaw: med(bars.map(b => b.rawFrac)), medTrim: med(bars.map(b => b.trimFrac)),
               wide50: bars.filter(b => b.rawFrac > 0.5).length,
               wide80: bars.filter(b => b.rawFrac > 0.8).length,
               owedToOne: med(bars.map(b => b.owedToOne)) };
    }
    const A = hullStats(__snapA);
    const C = __snapC ? hullStats(__snapC) : null;
    const B = hullStats(items.map(it => ({ guid: it.guid, s: it.s, e: it.e, storey: it.storey, phase: it.phase })));
    const pf = x => (100 * x).toFixed(1) + '%';
    const row = (tag, h, fl) => console.log('§S44_CONFIG ' + bld + ' ' + tag + ' bars=' + h.nbars +
      ' makespanDays=' + h.days.toFixed(1) + ' medianBarSpan=' + pf(h.medRaw) +
      ' medianTrimmed=' + pf(h.medTrim) + ' wide50=' + h.wide50 + ' wide80=' + h.wide80 +
      ' float=' + fl + ' owedToOneElement=' + pf(h.owedToOne));
    if (C) row('C_preCPM_capsOFF', C, __floatC);
    row('A_preCPM_capsON ', A, floatPre);
    row('B_postCPM_capsON', B, floatPost);
    // ── §S45 — THE CELL: what does contiguity cost? ───────────────────────────────────────────
    // The fix candidate §S44.3 named: constrain a storey|phase group's members to a CONTIGUOUS
    // window — the location×trade cell, which is also the grain a P6 export needs. Modelled here
    // as a task-level CPM, no scheduling code changed and nothing built:
    //   cell duration = crew-limited work content = max over resources of (Σ member durations / cap)
    //                   using the engine's OWN per-element durations from config A, so units are
    //                   the same wall-clock ms the makespan comparison uses.
    //   cell edges    = E1 physics, lifted to cells: an edge u→v with cell(u)≠cell(v).
    //   makespan      = longest path over cells (optimistic: cells sharing a resource may overlap).
    // OPTIMISTIC BY CONSTRUCTION and that is the point — it is an upper bound on how good
    // contiguity can look. If even this bound is far worse than B, contiguity is expensive; if it
    // is close to B, contiguity is cheap and the fix is worth building.
    const cellOf = it => (it.storey || '_UNKNOWN') + '|' + (it.phase || 'Architecture');
    const durA = {};   // element durations from config A (pre-CPM, shipped caps)
    __snapA.forEach(it => { durA[it.guid] = it.e - it.s; });
    const capOf = r => (maxCrews && maxCrews[r]) ? maxCrews[r] : 3;   // §CREW-CAP default
    const cellWork = {}, cellMembers = {};
    items.forEach(it => {
      const c = cellOf(it), r = it.resource || '_DEFAULT';
      (cellWork[c] || (cellWork[c] = {}));
      cellWork[c][r] = (cellWork[c][r] || 0) + (durA[it.guid] || 0);
      (cellMembers[c] || (cellMembers[c] = [])).push(it.guid);
    });
    const cellDur = {};
    Object.keys(cellWork).forEach(c => {
      let d = 0;
      Object.keys(cellWork[c]).forEach(r => { const v = cellWork[c][r] / capOf(r); if (v > d) d = v; });
      cellDur[c] = d;
    });
    // E1 physics edges, lifted to cells
    const idxOf = {}; items.forEach((it, i) => { idxOf[it.guid] = i; });
    const G = CpmSchedule.contactGraph(items);
    const des = CpmSchedule.designatedSupport(items, G);
    const cellEdges = {}, cellsSet = Object.keys(cellDur);
    let liftedEdges = 0, intraCell = 0;
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = cellOf(items[des[i]]), b = cellOf(items[i]);
      if (a === b) { intraCell++; continue; }
      (cellEdges[a] || (cellEdges[a] = {}))[b] = 1; liftedEdges++;
    }
    // Cell-level cycles are NOT an error to route around — they are the finding. Contract them
    // (Tarjan, the same treatment cpm_schedule.solve() gives pure-physics SCCs) so the makespan is
    // honest: a cyclic group of cells cannot be ordered, so it must be scheduled as ONE block, and
    // its duration is the SUM of its members'. That is the true cost of demanding contiguity there.
    const cellIdx = {}; cellsSet.forEach((c, i) => { cellIdx[c] = i; });
    const adj = cellsSet.map(c => Object.keys(cellEdges[c] || {}).map(b => cellIdx[b]));
    const NC = cellsSet.length;
    const index = new Array(NC).fill(-1), low = new Array(NC).fill(0), onstk = new Array(NC).fill(false);
    const comp = new Array(NC).fill(-1); let idxc = 0, ncomp = 0; const stk = [];
    for (let s0 = 0; s0 < NC; s0++) {
      if (index[s0] !== -1) continue;
      const work = [[s0, 0]];
      while (work.length) {
        const top = work[work.length - 1], v = top[0];
        if (top[1] === 0) { index[v] = low[v] = idxc++; stk.push(v); onstk[v] = true; }
        let recursed = false;
        while (top[1] < adj[v].length) {
          const w = adj[v][top[1]++];
          if (index[w] === -1) { work.push([w, 0]); recursed = true; break; }
          else if (onstk[w] && index[w] < low[v]) low[v] = index[w];
        }
        if (recursed) continue;
        if (low[v] === index[v]) {
          for (;;) { const w = stk.pop(); onstk[w] = false; comp[w] = ncomp; if (w === v) break; }
          ncomp++;
        }
        work.pop();
        if (work.length) { const pv = work[work.length - 1][0]; if (low[v] < low[pv]) low[pv] = low[v]; }
      }
    }
    // Two treatments of a cell-level cycle, reported as a RANGE so contiguity's own cost is not
    // conflated with the cycles' cost:
    //   compDur    = SUM of member durations — a cyclic group cannot be ordered, so demanding
    //                contiguity forces it to run as one serial block. Pessimistic bound.
    //   compDurOpt = MAX of member durations — pretend the cycle's members run fully in parallel.
    //                Physically unjustified, but it is the floor: no contiguous schedule beats it.
    const compDur = new Array(ncomp).fill(0), compSize = new Array(ncomp).fill(0);
    const compDurOpt = new Array(ncomp).fill(0);
    cellsSet.forEach((c, i) => {
      compDur[comp[i]] += cellDur[c]; compSize[comp[i]]++;
      if (cellDur[c] > compDurOpt[comp[i]]) compDurOpt[comp[i]] = cellDur[c];
    });
    const cOut = Array.from({ length: ncomp }, () => ({}));
    cellsSet.forEach((c, i) => Object.keys(cellEdges[c] || {}).forEach(b => {
      const a = comp[i], d = comp[cellIdx[b]]; if (a !== d) cOut[a][d] = 1;
    }));
    const cIndeg = new Array(ncomp).fill(0);
    for (let a = 0; a < ncomp; a++) Object.keys(cOut[a]).forEach(d => { cIndeg[+d]++; });
    const cES = new Array(ncomp).fill(0);
    const qq = []; for (let a = 0; a < ncomp; a++) if (!cIndeg[a]) qq.push(a);
    let processed = 0;
    while (qq.length) {
      const a = qq.shift(); processed++;
      Object.keys(cOut[a]).forEach(d => {
        const fin = cES[a] + compDur[a];
        if (fin > cES[+d]) cES[+d] = fin;
        if (--cIndeg[+d] === 0) qq.push(+d);
      });
    }
    let cellMakespan = 0;
    for (let a = 0; a < ncomp; a++) { const f = cES[a] + compDur[a]; if (f > cellMakespan) cellMakespan = f; }
    // same pass, optimistic durations
    const cIndeg2 = new Array(ncomp).fill(0);
    for (let a = 0; a < ncomp; a++) Object.keys(cOut[a]).forEach(d => { cIndeg2[+d]++; });
    const cES2 = new Array(ncomp).fill(0);
    const qq2 = []; for (let a = 0; a < ncomp; a++) if (!cIndeg2[a]) qq2.push(a);
    while (qq2.length) {
      const a = qq2.shift();
      Object.keys(cOut[a]).forEach(d => {
        const fin = cES2[a] + compDurOpt[a];
        if (fin > cES2[+d]) cES2[+d] = fin;
        if (--cIndeg2[+d] === 0) qq2.push(+d);
      });
    }
    let cellMakespanOpt = 0;
    for (let a = 0; a < ncomp; a++) { const f = cES2[a] + compDurOpt[a]; if (f > cellMakespanOpt) cellMakespanOpt = f; }
    const biggestScc = Math.max.apply(null, compSize);
    const cellsInCycles = compSize.reduce((t, sz) => t + (sz > 1 ? sz : 0), 0);
    const cyclic = ncomp - processed;   // components left unprocessed; must be 0 after contraction
    console.log('§S45_CELL ' + bld + ' cells=' + cellsSet.length +
      ' E1crossingCells=' + liftedEdges + ' E1insideCell=' + intraCell +
      ' crossingShare=' + (100 * liftedEdges / Math.max(1, liftedEdges + intraCell)).toFixed(1) + '%' +
      ' cellSCCs=' + ncomp + ' cellsInCycles=' + cellsInCycles + '/' + NC +
      ' biggestSCC=' + biggestScc + ' unresolvedAfterContraction=' + cyclic +
      ' medianCellDurDays=' + (med(cellsSet.map(c => cellDur[c])) / D).toFixed(2) +
      ' contiguousMakespanDays=' + (cellMakespan / D).toFixed(1) +
      ' (cyclesRunParallelFloor=' + (cellMakespanOpt / D).toFixed(1) + ')' +
      ' vs_B_shipped=' + B.days.toFixed(1) + ' vs_A_preCPM=' + A.days.toFixed(1) +
      ' costVsB=' + (B.days > 0 ? ((cellMakespan / D / B.days - 1) * 100).toFixed(1) + '%' : 'n/a') +
      ' costVsB_floor=' + (B.days > 0 ? ((cellMakespanOpt / D / B.days - 1) * 100).toFixed(1) + '%' : 'n/a') +
      ' — every bar contiguous BY CONSTRUCTION (span = its own duration, wide50 would be ' +
      cellsSet.filter(c => cellDur[c] > 0.5 * cellMakespan).length + ')');

    // ── §S46 — re-run §S45's cycle test on the DECLARED grain ────────────────────────────────
    // grainA  room|phase where a room is declared, level|phase otherwise  (whole population)
    // grainB  room|phase, restricted to elements that HAVE a declared room (the pure test — if the
    //         graph is cyclic even here, the location hypothesis fails on its own turf)
    function cycleStats(keyFn, pop) {
      const inPop = {}; pop.forEach(it => { inPop[it.guid] = 1; });
      const keys = {}, edges = {};
      let cross = 0, inside = 0;
      pop.forEach(it => { keys[keyFn(it)] = 1; });
      for (let i = 0; i < des.length; i++) {
        if (des[i] < 0) continue;
        const src = items[des[i]], dst = items[i];
        if (!inPop[src.guid] || !inPop[dst.guid]) continue;
        const a = keyFn(src), b = keyFn(dst);
        if (a === b) { inside++; continue; }
        (edges[a] || (edges[a] = {}))[b] = 1; cross++;
      }
      const ks = Object.keys(keys), ki = {}; ks.forEach((k, i) => { ki[k] = i; });
      const N = ks.length, ad = ks.map(k => Object.keys(edges[k] || {}).map(b => ki[b]).filter(x => x != null));
      const idx = new Array(N).fill(-1), low = new Array(N).fill(0), on = new Array(N).fill(false);
      const cmp = new Array(N).fill(-1); let ic = 0, nc = 0; const st = [];
      for (let s0 = 0; s0 < N; s0++) {
        if (idx[s0] !== -1) continue;
        const w = [[s0, 0]];
        while (w.length) {
          const t = w[w.length - 1], v = t[0];
          if (t[1] === 0) { idx[v] = low[v] = ic++; st.push(v); on[v] = true; }
          let rec = false;
          while (t[1] < ad[v].length) {
            const x = ad[v][t[1]++];
            if (idx[x] === -1) { w.push([x, 0]); rec = true; break; }
            else if (on[x] && idx[x] < low[v]) low[v] = idx[x];
          }
          if (rec) continue;
          if (low[v] === idx[v]) { for (;;) { const x = st.pop(); on[x] = false; cmp[x] = nc; if (x === v) break; } nc++; }
          w.pop();
          if (w.length) { const pv = w[w.length - 1][0]; if (low[v] < low[pv]) low[pv] = low[v]; }
        }
      }
      const size = new Array(nc).fill(0); for (let i = 0; i < N; i++) size[cmp[i]]++;
      const inCycles = size.reduce((t, z) => t + (z > 1 ? z : 0), 0);
      return { cells: N, cross, inside, crossShare: cross + inside ? 100 * cross / (cross + inside) : 0,
               sccs: nc, inCycles, biggest: N ? Math.max.apply(null, size) : 0,
               acyclic: inCycles === 0 };
    }
    const keyRoomOrLevel = it => (__roomOf[it.guid] ? 'R:' + __roomOf[it.guid] : 'L:' + __levelOf[it.guid]) +
      '|' + (it.phase || 'Architecture');
    const keyRoomOnly = it => 'R:' + __roomOf[it.guid] + '|' + (it.phase || 'Architecture');
    const keyStoreyPhase = it => (it.storey || '_UNKNOWN') + '|' + (it.phase || 'Architecture');
    const popAll = items, popRoom = items.filter(it => __roomOf[it.guid]);
    const rep = (tag, st2, pop) => console.log('§S46_CYCLE ' + bld + ' ' + tag +
      ' population=' + pop.length + ' cells=' + st2.cells +
      ' E1crossing=' + st2.crossShare.toFixed(1) + '%' +
      ' SCCs=' + st2.sccs + ' cellsInCycles=' + st2.inCycles + '/' + st2.cells +
      ' biggestSCC=' + st2.biggest + ' ACYCLIC=' + (st2.acyclic ? 'YES' : 'NO'));
    rep('storey|phase (§S45 baseline)', cycleStats(keyStoreyPhase, popAll), popAll);
    rep('room-or-level|phase        ', cycleStats(keyRoomOrLevel, popAll), popAll);
    if (popRoom.length) {
      rep('room|phase (declared only)  ', cycleStats(keyRoomOnly, popRoom), popRoom);
      // CONTROL — the same restricted population keyed by the COARSE grain. Restricting to 1-13% of
      // elements drops most edges, which mechanically reduces cycles; if room|phase is acyclic only
      // because of that, storey|phase on the SAME population will be acyclic too. If storey|phase
      // stays cyclic here, the GRAIN is what is doing the work, not the subsetting.
      rep('storey|phase (same room pop)', cycleStats(keyStoreyPhase, popRoom), popRoom);
    }
    else console.log('§S46_CYCLE ' + bld + ' room|phase (declared only) — NO declared containment on this building, test not applicable');

    // ── §S47 — THE GRID: acyclic by construction; measure what it cannot represent ────────────
    // location = derived level (§S35 level_deriver, already gate-passed), ordered bottom-up.
    // trade    = the engine's own SEQUENCE_RULES sequence number, ordered as the rules order it.
    // A cell is (level, trade). Grid edges: (L,T)->(L,T+1) and (L,T)->(L+1,T). Product order.
    // An E1 physics edge a->b is REPRESENTABLE iff level(b) >= level(a) AND trade(b) >= trade(a):
    // the grid already orders a before b. Anything else contradicts the grid and is REFUSED.
    const lvlRank = {};
    Array.from(new Set(items.map(it => __levelOf[it.guid])))
      .filter(v => v !== 'NONE').map(Number).sort((a, b) => a - b)
      .forEach((z, i) => { lvlRank[z.toFixed(2)] = i; });
    const lvlOf = it => { const k = __levelOf[it.guid]; return lvlRank[k] == null ? -1 : lvlRank[k]; };
    const trdOf = it => (typeof it.seq === 'number' ? it.seq : 99);
    const gridKey = it => lvlOf(it) + '#' + trdOf(it);
    const gcells = {};
    items.forEach(it => {
      const k = gridKey(it), r = it.resource || '_DEFAULT';
      (gcells[k] || (gcells[k] = { work: {}, n: 0, lvl: lvlOf(it), trd: trdOf(it) }));
      gcells[k].work[r] = (gcells[k].work[r] || 0) + (durA[it.guid] || 0);
      gcells[k].n++;
    });
    const gk = Object.keys(gcells);
    gk.forEach(k => {
      let d = 0;
      Object.keys(gcells[k].work).forEach(r => { const v = gcells[k].work[r] / capOf(r); if (v > d) d = v; });
      gcells[k].dur = d;
    });
    // classify every E1 physics edge against the grid's product order
    let implied = 0, refused = 0, intra = 0;
    const refusedByCls = {}, refusedElems = {};
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = items[des[i]], b = items[i];
      const ka = gridKey(a), kb = gridKey(b);
      if (ka === kb) { intra++; continue; }
      const ok = (lvlOf(b) >= lvlOf(a)) && (trdOf(b) >= trdOf(a));
      if (ok) implied++;
      else {
        refused++;
        refusedByCls[b.cls] = (refusedByCls[b.cls] || 0) + 1;
        refusedElems[b.guid] = 1;
      }
    }
    const totalE1 = implied + refused + intra;
    // grid schedule: cells contiguous, ordered by the product order, crew-limited durations.
    // ES(L,T) = max(finish(L,T-1), finish(L-1,T)) — the two ordered lists, nothing solved.
    const byRank = gk.slice().sort((x, y) => (gcells[x].lvl - gcells[y].lvl) || (gcells[x].trd - gcells[y].trd));
    const ESg = {};
    byRank.forEach(k => {
      const c = gcells[k];
      let es = 0;
      gk.forEach(k2 => {
        const c2 = gcells[k2];
        const prevTrade = (c2.lvl === c.lvl && c2.trd < c.trd);
        const prevLevel = (c2.trd === c.trd && c2.lvl < c.lvl);
        if (prevTrade || prevLevel) { const f = (ESg[k2] || 0) + c2.dur; if (f > es) es = f; }
      });
      ESg[k] = es;
    });
    let gridMakespan = 0;
    gk.forEach(k => { const f = ESg[k] + gcells[k].dur; if (f > gridMakespan) gridMakespan = f; });
    const DD = 86400000;
    console.log('§S47_GRID ' + bld + ' cells=' + gk.length +
      ' levels=' + Object.keys(lvlRank).length + ' trades=' + new Set(items.map(trdOf)).size +
      ' acyclicByConstruction=YES (product order, no SCCs to contract)' +
      ' makespanDays=' + (gridMakespan / DD).toFixed(1) +
      ' vs_B_shipped=' + B.days.toFixed(1) +
      ' cost=' + (B.days > 0 ? ((gridMakespan / DD / B.days - 1) * 100).toFixed(1) + '%' : 'n/a') +
      ' wide50=0 byConstruction');
    console.log('§S47_REFUSED ' + bld + ' E1total=' + totalE1 +
      ' insideOneCell=' + intra + ' (' + (100 * intra / totalE1).toFixed(1) + '%)' +
      ' representedByGrid=' + implied + ' (' + (100 * implied / totalE1).toFixed(1) + '%)' +
      ' REFUSED=' + refused + ' (' + (100 * refused / totalE1).toFixed(2) + '%)' +
      ' elementsAffected=' + Object.keys(refusedElems).length +
      ' (' + (100 * Object.keys(refusedElems).length / items.length).toFixed(2) + '% of population)' +
      ' topClasses=' + JSON.stringify(Object.keys(refusedByCls).sort((a, b) => refusedByCls[b] - refusedByCls[a])
        .slice(0, 5).reduce((o, k2) => { o[k2] = refusedByCls[k2]; return o; }, {})));

    // ── §S47b — HANG-AWARE location: does the grid work if a suspended element is filed on the
    // level it hangs FROM? The refusals above are dominated by MEP whose designated support sits on
    // the level ABOVE it (a pipe under the slab of level N+1 is filed on level N by geometry, so its
    // support edge points DOWN the grid and gets refused). Promoting such an element to its
    // support's level is EXTRACTION — it uses designatedSupport()'s own answer, no new rule — and it
    // is exactly the §S34 declared-vs-geometry question asked for a different consumer.
    const lvl2 = {};
    items.forEach(it => { lvl2[it.guid] = lvlOf(it); });
    let promoted = 0;
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = items[des[i]], b = items[i];
      if (lvlOf(a) > lvlOf(b)) { lvl2[b.guid] = lvlOf(a); promoted++; }
    }
    const gridKey2 = it => lvl2[it.guid] + '#' + trdOf(it);
    let implied2 = 0, refused2 = 0, intra2 = 0;
    const refusedElems2 = {}, refusedByCls2 = {};
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = items[des[i]], b = items[i];
      if (gridKey2(a) === gridKey2(b)) { intra2++; continue; }
      const ok = (lvl2[b.guid] >= lvl2[a.guid]) && (trdOf(b) >= trdOf(a));
      if (ok) implied2++;
      else { refused2++; refusedElems2[b.guid] = 1; refusedByCls2[b.cls] = (refusedByCls2[b.cls] || 0) + 1; }
    }
    const tot2 = implied2 + refused2 + intra2;
    console.log('§S47B_HANGAWARE ' + bld + ' elementsPromotedToSupportLevel=' + promoted +
      ' (' + (100 * promoted / items.length).toFixed(2) + '%)' +
      ' cells=' + new Set(items.map(gridKey2)).size +
      ' insideOneCell=' + intra2 + ' (' + (100 * intra2 / tot2).toFixed(1) + '%)' +
      ' representedByGrid=' + implied2 + ' (' + (100 * implied2 / tot2).toFixed(1) + '%)' +
      ' REFUSED=' + refused2 + ' (' + (100 * refused2 / tot2).toFixed(2) + '%)' +
      ' elementsAffected=' + Object.keys(refusedElems2).length +
      ' (' + (100 * Object.keys(refusedElems2).length / items.length).toFixed(2) + '%)' +
      ' topClasses=' + JSON.stringify(Object.keys(refusedByCls2).sort((a, b) => refusedByCls2[b] - refusedByCls2[a])
        .slice(0, 4).reduce((o, k2) => { o[k2] = refusedByCls2[k2]; return o; }, {})));

    // ── §S48 — THE HANG-AWARE GRID, SCHEDULED, ON ALL FOUR AXES ───────────────────────────────
    // §S47 priced the BASE grid on two axes only. This schedules the HANG-AWARE grid for real —
    // cells in product order, elements packed inside their cell against GLOBAL per-resource crew
    // pools (a trade's crew cannot be in two cells at once) — and then judges the result with the
    // SAME instruments as every other configuration in this lane: ScheduleGate.auditFloating for
    // float, this witness's own census() for strict midair. Control = B, what ships today.
    const gcells2 = {};
    items.forEach(it => {
      const k = gridKey2(it);
      (gcells2[k] || (gcells2[k] = { lvl: lvl2[it.guid], trd: trdOf(it), mem: [] })).mem.push(it);
    });
    const order2 = Object.keys(gcells2).sort((x, y) =>
      (gcells2[x].lvl - gcells2[y].lvl) || (gcells2[x].trd - gcells2[y].trd));
    const cellFin = {}, gridS = {}, gridE = {};
    const pools = {};
    const poolFor = r => pools[r] || (pools[r] = new Array(capOf(r)).fill(0));
    order2.forEach(k => {
      const c = gcells2[k];
      let es = 0;
      order2.forEach(k2 => {
        if (k2 === k) return;
        const c2 = gcells2[k2];
        const prevTrade = (c2.lvl === c.lvl && c2.trd < c.trd);
        const prevLevel = (c2.trd === c.trd && c2.lvl < c.lvl);
        if ((prevTrade || prevLevel) && cellFin[k2] > es) es = cellFin[k2];
      });
      // pack this cell's elements against global crew pools, never earlier than the cell's own ES
      const mem = c.mem.slice().sort((a, b) => (a.bz - b.bz) || (a.guid < b.guid ? -1 : 1));
      let fin = es;
      mem.forEach(it => {
        const pool = poolFor(it.resource || '_DEFAULT');
        let idx = 0;
        for (let q = 1; q < pool.length; q++) if (pool[q] < pool[idx]) idx = q;
        const st = Math.max(es, pool[idx]);
        const en = st + (durA[it.guid] || 0);
        pool[idx] = en;
        gridS[it.guid] = st; gridE[it.guid] = en;
        if (en > fin) fin = en;
      });
      cellFin[k] = fin;
    });
    const gridItems = items.map(it => Object.assign({}, it, { s: gridS[it.guid], e: gridE[it.guid] }));
    const gm = {}; gridItems.forEach(it => { gm[it.guid] = { start: it.s, end: it.e }; });
    const qg = console.log; console.log = () => {};
    let gridFloat; try { gridFloat = ScheduleGate.auditFloating(geoEls, gm); } finally { console.log = qg; }
    const gridCensus = census(gridItems);
    const bCensus = census(items);   // B's own strict-midair, measured here rather than taken from W-MZ-2's assertion
    let gLo = Infinity, gHi = -Infinity;
    gridItems.forEach(it => { if (it.s < gLo) gLo = it.s; if (it.e > gHi) gHi = it.e; });
    const gSpan = gHi - gLo;
    let wide50g = 0, wide80g = 0;
    order2.forEach(k => {
      const mem = gcells2[k].mem;
      let lo = Infinity, hi = -Infinity;
      mem.forEach(it => { if (gridS[it.guid] < lo) lo = gridS[it.guid]; if (gridE[it.guid] > hi) hi = gridE[it.guid]; });
      const frac = gSpan ? (hi - lo) / gSpan : 0;
      if (frac > 0.5) wide50g++;
      if (frac > 0.8) wide80g++;
    });
    // leg 3 sizing, free: how many CELL PAIRS do the refused edges span?
    const refusedPairs = {};
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = items[des[i]], b = items[i];
      if (gridKey2(a) === gridKey2(b)) continue;
      if (!((lvl2[b.guid] >= lvl2[a.guid]) && (trdOf(b) >= trdOf(a))))
        refusedPairs[gridKey2(a) + '>' + gridKey2(b)] = 1;
    }
    console.log('§S48_FOURAXIS ' + bld +
      ' | GRID_hangAware cells=' + order2.length +
      ' days=' + (gSpan / 86400000).toFixed(1) +
      ' wide50=' + wide50g + ' wide80=' + wide80g +
      ' float=' + gridFloat + ' midair=' + gridCensus.midair +
      ' | B_shipsToday days=' + B.days.toFixed(1) +
      ' wide50=' + B.wide50 + ' wide80=' + B.wide80 +
      ' float=' + floatPost + ' midair=' + bCensus.midair +
      ' | costDays=' + (B.days > 0 ? ((gSpan / 86400000 / B.days - 1) * 100).toFixed(1) + '%' : 'n/a') +
      ' refusedCellPairs=' + Object.keys(refusedPairs).length + '/' + (order2.length * (order2.length - 1)));

    // ── §S49 — physics mandatory, grid as priority ───────────────────────────────────────────
    const nE = items.length;
    const preds = new Array(nE); for (let i = 0; i < nE; i++) preds[i] = [];
    const succ = new Array(nE); for (let i = 0; i < nE; i++) succ[i] = [];
    let physEdges = 0;
    // NOHANG=1 — §S26.3 / ledger A1: drop the `hang` family (a "support" that is NOT below its
    // dependent — designatedSupport()'s cls=2 carrier-above branch), measured there as the SOLE
    // remaining cycle source (largestSCC=1 on all 7 once dropped). This is the variant that tests
    // whether leg 4's pass mark is achievable at all, or only blocked by cyclic physics.
    const NOHANG = process.env.NOHANG === '1';
    let hangSkipped = 0;
    for (let i = 0; i < nE; i++) {
      if (des[i] < 0) continue;
      if (NOHANG && !(items[des[i]].bz < items[i].bz - 1e-9)) { hangSkipped++; continue; }
      preds[i].push(des[i]); succ[des[i]].push(i); physEdges++;
    }
    // grid priority: (location rank, trade rank) from the HANG-AWARE assignment
    const prio = new Array(nE);
    for (let i = 0; i < nE; i++) prio[i] = lvl2[items[i].guid] * 1000 + trdOf(items[i]);
    // §S49a — the physics graph from designatedSupport() is NOT acyclic: its cls=2 carrier-above
    // branch is the `hang` family, measured by §S26.3 as the sole remaining cycle source. Kahn over
    // it placed 29 of 1,119 on Duplex before this was handled. Break each cycle the way the doctrine
    // says: inside an SCC, an edge whose "support" is NOT strictly below its dependent is not
    // bearing — drop those first; if a cycle survives, drop one edge deterministically. Every drop
    // is COUNTED and reported, never silent.
    let brokeNotBelow = 0, brokeArbitrary = 0;
    (function breakPhysicsCycles() {
      for (let pass = 0; pass < 6; pass++) {
        const idx2 = new Array(nE).fill(-1), lw = new Array(nE).fill(0), on = new Array(nE).fill(false);
        const cm = new Array(nE).fill(-1); let ic = 0, nc = 0; const stk2 = [];
        for (let s0 = 0; s0 < nE; s0++) {
          if (idx2[s0] !== -1) continue;
          const wk = [[s0, 0]];
          while (wk.length) {
            const t = wk[wk.length - 1], v = t[0];
            if (t[1] === 0) { idx2[v] = lw[v] = ic++; stk2.push(v); on[v] = true; }
            let rec = false;
            while (t[1] < succ[v].length) {
              const x = succ[v][t[1]++];
              if (idx2[x] === -1) { wk.push([x, 0]); rec = true; break; }
              else if (on[x] && idx2[x] < lw[v]) lw[v] = idx2[x];
            }
            if (rec) continue;
            if (lw[v] === idx2[v]) { for (;;) { const x = stk2.pop(); on[x] = false; cm[x] = nc; if (x === v) break; } nc++; }
            wk.pop();
            if (wk.length) { const pv = wk[wk.length - 1][0]; if (lw[v] < lw[pv]) lw[pv] = lw[v]; }
          }
        }
        const szv = new Array(nc).fill(0); for (let i = 0; i < nE; i++) szv[cm[i]]++;
        let cut = 0;
        for (let i = 0; i < nE; i++) {
          if (szv[cm[i]] < 2) continue;
          const keep = [];
          for (let k = 0; k < preds[i].length; k++) {
            const a = preds[i][k];
            if (cm[a] !== cm[i]) { keep.push(a); continue; }
            const below = items[a].bz < items[i].bz - 1e-9;
            if (below && pass < 5) { keep.push(a); continue; }
            cut++; if (below) brokeArbitrary++; else brokeNotBelow++;
          }
          preds[i] = keep;
        }
        if (!cut) break;
        for (let i = 0; i < nE; i++) succ[i] = [];
        for (let i = 0; i < nE; i++) preds[i].forEach(a => succ[a].push(i));
      }
    })();
    const indegE = new Array(nE).fill(0);
    for (let i = 0; i < nE; i++) indegE[i] = preds[i].length;
    // ready set kept sorted by grid priority — a simple binary-insert list (n is large but
    // the ready set stays small in practice; sorted insert keeps the tie-break deterministic)
    const ready = [];
    const insert = v => {
      let lo = 0, hi = ready.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (prio[ready[m]] <= prio[v]) lo = m + 1; else hi = m; }
      ready.splice(lo, 0, v);
    };
    for (let i = 0; i < nE; i++) if (!indegE[i]) insert(i);
    const pools2 = {};
    const poolFor2 = r => pools2[r] || (pools2[r] = new Array(capOf(r)).fill(0));
    const S2 = new Array(nE).fill(0), E2 = new Array(nE).fill(0);
    const placed = new Array(nE).fill(false);
    let placedN = 0;
    while (ready.length) {
      const u = ready.shift();
      let es = 0;
      for (let k = 0; k < preds[u].length; k++) { const pf = E2[preds[u][k]]; if (pf > es) es = pf; }
      const pool = poolFor2(items[u].resource || '_DEFAULT');
      let idx = 0;
      for (let q = 1; q < pool.length; q++) if (pool[q] < pool[idx]) idx = q;
      const st = Math.max(es, pool[idx]);
      S2[u] = st; E2[u] = st + (durA[items[u].guid] || 0);
      pool[idx] = E2[u];
      placed[u] = true; placedN++;
      for (let k = 0; k < succ[u].length; k++) { const v = succ[u][k]; if (--indegE[v] === 0) insert(v); }
    }
    // anything left is inside a pure-physics cycle — COUNTED, never hidden, then placed after its
    // already-placed predecessors (the same "contract, report" posture solve() takes)
    let cyclicLeft = 0;
    for (let i = 0; i < nE; i++) if (!placed[i]) {
      cyclicLeft++;
      let es = 0;
      for (let k = 0; k < preds[i].length; k++) if (placed[preds[i][k]] && E2[preds[i][k]] > es) es = E2[preds[i][k]];
      const pool = poolFor2(items[i].resource || '_DEFAULT');
      let idx = 0;
      for (let q = 1; q < pool.length; q++) if (pool[q] < pool[idx]) idx = q;
      S2[i] = Math.max(es, pool[idx]); E2[i] = S2[i] + (durA[items[i].guid] || 0);
      pool[idx] = E2[i];
    }
    const legItems = items.map((it, i) => Object.assign({}, it, { s: S2[i], e: E2[i] }));
    const lm = {}; legItems.forEach(it => { lm[it.guid] = { start: it.s, end: it.e }; });
    const ql = console.log; console.log = () => {};
    let legFloat; try { legFloat = ScheduleGate.auditFloating(geoEls, lm); } finally { console.log = ql; }
    const legCensus = census(legItems);
    let lLo = Infinity, lHi = -Infinity;
    legItems.forEach(it => { if (it.s < lLo) lLo = it.s; if (it.e > lHi) lHi = it.e; });
    const lSpan = lHi - lLo;
    const lcell = {};
    legItems.forEach(it => {
      const k = gridKey2(it);
      (lcell[k] || (lcell[k] = { lo: Infinity, hi: -Infinity }));
      if (it.s < lcell[k].lo) lcell[k].lo = it.s;
      if (it.e > lcell[k].hi) lcell[k].hi = it.e;
    });
    const lkeys = Object.keys(lcell);
    const lw50 = lkeys.filter(k => lSpan && (lcell[k].hi - lcell[k].lo) / lSpan > 0.5).length;
    const lw80 = lkeys.filter(k => lSpan && (lcell[k].hi - lcell[k].lo) / lSpan > 0.8).length;
    const passMidair = legCensus.midair === 0, passFloat = legFloat <= floatPost;
    console.log('§S49_LEG4 ' + bld + ' NOHANG=' + (NOHANG ? '1' : '0') + ' hangEdgesSkipped=' + hangSkipped + ' physicsEdges=' + physEdges + ' cycleBreaks={notBelow:' + brokeNotBelow + ',arbitrary:' + brokeArbitrary + '} cyclicLeftovers=' + cyclicLeft +
      ' | days=' + (lSpan / 86400000).toFixed(1) + ' (B ' + B.days.toFixed(1) + ', ' +
      (B.days > 0 ? ((lSpan / 86400000 / B.days - 1) * 100).toFixed(1) + '%' : 'n/a') + ')' +
      ' wide50=' + lw50 + ' (B ' + B.wide50 + ')' +
      ' wide80=' + lw80 + ' (B ' + B.wide80 + ')' +
      ' float=' + legFloat + ' (B ' + floatPost + ')' +
      ' midair=' + legCensus.midair + ' (B ' + bCensus.midair + ')' +
      ' | PASS_midair0=' + (passMidair ? 'YES' : 'NO') +
      ' PASS_floatNoWorse=' + (passFloat ? 'YES' : 'NO'));

    console.log('§S44_SPLIT ' + bld +
      ' medianBarSpan ' + (C ? pf(C.medRaw) : '?') + ' --levelling--> ' + pf(A.medRaw) +
      ' --CPM--> ' + pf(B.medRaw) +
      ' | wide50 ' + (C ? C.wide50 : '?') + ' -> ' + A.wide50 + ' -> ' + B.wide50 +
      ' | makespanDays ' + (C ? C.days.toFixed(1) : '?') + ' -> ' + A.days.toFixed(1) + ' -> ' + B.days.toFixed(1) +
      ' | float ' + __floatC + ' -> ' + floatPre + ' -> ' + floatPost);
    assert(floatPost === CPM_FLOAT_AFTER_BASELINE[bld],
      'W-MZ-8 ' + bld + ' the measured TRADE is locked at ' + CPM_FLOAT_AFTER_BASELINE[bld] + ' (got ' + floatPost +
      '; auditFloating ' + floatPre + ' -> ' + floatPost + ') — CPM authoring can leave a dependent starting ' +
      'before its own support FINISHES (auditFloating\'s measure), a DIFFERENT invariant than midair (starting ' +
      'before a support APPEARS). Deliberate and named, never silent.');
    assert(after.midair === 0, 'W-MZ-2 ' + bld + ' ZERO elements appear before the first thing they touch (got ' +
      after.midair + (after.worst.length ? ', worst ' + after.worst[0].cls + ' start=' + after.worst[0].start.toFixed(1) +
      'd firstSupport=' + after.worst[0].sup.toFixed(1) + 'd' : '') + ')');
    // W-MZ-7 — a test that can fail: drag one element back before everything it touches (what a
    // planner's bar-drag does to its elements) and the lock-gate judge must SEE it.
    if (after.probe) {
      const it = items[after.probe.i], keepS = it.s, keepE = it.e;
      it.s = after.probe.firstContact - 5 * D; it.e = it.s + (keepE - keepS);
      const reAudit = census(items);
      assert(reAudit.midair >= 1,
        'W-MZ-7 ' + bld + ' judge catches a re-introduced hanging (moved 1 element 5d before its first contact, got midair=' + reAudit.midair + ')');
      it.s = keepS; it.e = keepE;
    } else { assert(false, 'W-MZ-7 ' + bld + ' no probe candidate found — census produced nothing to test with'); }
    assert(after.orphan === CPM_ORPHAN_BASELINE[bld],
      'W-MZ-4 ' + bld + ' orphans (touch nothing in the model) locked at ' + CPM_ORPHAN_BASELINE[bld] + ' (got ' + after.orphan +
      ') — an extraction limit, reported never gated, purely geometric (same either display-authoring path)');
  }
  finish();
})();
