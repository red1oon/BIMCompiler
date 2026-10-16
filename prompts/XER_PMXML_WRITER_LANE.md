# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** add a WRITER for Primavera **XER** and **P6 PMXML** to `viewer/foreign_schedule.js`, the
write-side counterpart to the existing `parseXER`/`parsePMXML` readers, so a schedule authored/edited
in the Time Machine can be returned to a P6 shop in a format their P6 reingests natively. Nothing else.
**Read the log after every run.** The witness is a ROUND-TRIP: writer output re-parsed by our own
reader must reproduce the source rows byte-identically (`§XER_ROUNDTRIP mismatch=0`).
**Status:** SPEC ONLY (2026-07-19). No code started.
**Spec-first:** this file IS the spec. No writer code before the §3 format contract is settled.

---

## 1. Why — the ONE interop gap, precisely located
Competitive research (2026-07, `prompts/` competitive brief) established that our schedule interop is
already strong and, on current evidence, ahead of most incumbents:
- **Read:** `foreign_schedule.js` ships `parseXER` + `parsePMXML` + `parseMSPDI`, normalised so PMXML
  and XER of the same plan yield identical rows.
- **Write:** `schedule_editor_ui.js:519 exportMSProject()` emits **MSPDI** (MS Project XML), its schema
  verified against `parseMSPDI` rather than invented.
- **Mapping:** a declared bind-token in the activity name — a model-independent selector we EXECUTE,
  not a GUID (rots on re-export) or a fuzzy name guess. Better than the manual task→element attach
  that is the incumbent norm.

**The single missing piece:** there is NO XER or PMXML *writer*. A P6 shop therefore gets
`XER-in → MSPDI-out`, which their P6 cannot natively reingest. Closing this puts us at documented
round-trip parity with Bexel Manager (the only competitor with a *documented* P6 write-back) and,
on current (unverified) evidence, ahead of SYNCHRO, whose round-trip reputation the research could
not confirm from primary 2026 docs.

**Bar to clear is realistic, not perfect.** The research also established that PMXML/XER *themselves*
lose data on cross-DB import regardless of tool — global calendars, activity codes, and **EPS-level
activity codes are dropped silently by P6 itself**. So "lossy but structurally faithful" write-back
is the universal standard, not a bar we would uniquely fail. Do NOT gold-plate; match the incumbent
standard and document the known losses (§5).

## 2. Format priority — PMXML FIRST, XER second
Ship PMXML before XER. Rationale, both sourced in the brief:
1. Every documented competitor export-to-P6 path is **PMXML/XML, never XER** — including Bexel's.
2. Autodesk's own ACC docs advise *"Using the XML files is preferable"* over XER.
PMXML is also structurally closer to our existing MSPDI writer (nested XML, tag-based) so it reuses
the `exportMSProject` shape. XER (tab-delimited `%T`/`%F`/`%R`) is a second, independent writer —
valuable because some older P6 installs still prefer XER, but not the lead.

## 3. Format contract — the READER is the schema authority (do NOT invent)
Same discipline `exportMSProject` already used against `parseMSPDI`: the writer's output must be a
fixed point of our own reader. Every field the writer emits must be a field the reader reads.

### 3.1 PMXML writer (`toPMXML(scheduleData)`)
Mirror `parsePMXML`'s block structure (`foreign_schedule.js:126`):
- `<Project>` header + `<Calendar>` blocks (emit the `hpd` the reader reads via `_tag`).
- `<WBS>` blocks — hierarchy from `wbsTree`, walked pre-order (same source `exportMSProject` walks).
- `<Activity>` blocks — Id, Name (INCLUDING the bind-token, so re-import re-binds to elements),
  Start/Finish (`YYYY-MM-DDTHH:MM:SS`, the PMXML form `dateOnly` accepts), Duration, and the
  float/critical fields the reader already extracts (`totalFloatDays`/`freeFloatDays`/`isCritical`).
- `<Relationship>` blocks — map internal FS/SS/FF/SF back via the INVERSE of `parsePMXML`'s reader
  map, lag in the reader's expected unit.

### 3.2 XER writer (`toXER(scheduleData)`)
Mirror `parseXER` (`foreign_schedule.js:62`): tab-delimited, `%T <table>` / `%F <field...>` /
`%R <value...>`, `ERMHDR` first line (the reader sniffs `^\s*(ERMHDR|%T)`). Emit the tables the
reader consumes: `PROJECT`, `CALENDAR`, `PROJWBS`, `TASK`, `TASKPRED`. Relationship types via the
inverse of `REL_FROM_XER` (`FS→PR_FS` etc.). Lag via the inverse of `hoursToDays` (days→`lag_hr_cnt`).

### 3.3 Shared source
Both writers consume the SAME internal `scheduleData` (`toScheduleData`'s output / the editor's
`wbsTree` + `listDependencies`) that `exportMSProject` already reads. No new data plumbing — this is
a serializer, not a pipeline. Wire both into the Schedule Editor's export UI beside "Export MS Project".

## 4. Verification — round-trip is the witness, not eyeballing
**W-XER-ROUNDTRIP / W-PMXML-ROUNDTRIP (blocking).** For each writer: take a real authored schedule
→ serialize → re-parse with our OWN reader → diff the row set against the source. `mismatch=0` on
tasks, WBS hierarchy, dependencies (type + lag), and dates. Any mismatch blocks. This is exactly the
guarantee `exportMSProject`'s comment already claims for MSPDI ("PMXML/XER of the same plan produce
identical rows") — extend it to the write path.

**W-P6-REAL (strong, needs a human).** The round-trip above proves internal consistency, NOT that
real Oracle P6 accepts the file. A genuine P6 import is the only proof of that, and it needs a P6
licence — flag as a human-gated follow-up, do not claim P6 compatibility from the self-round-trip
alone. `erp/tests/real_xer_witness.js` already exists for the READ side; add a real-P6-export witness
stub here for whoever has the licence.

**Non-witness:** "the XML looks like P6's." Not evidence. Round-trip mismatch count or nothing.

## 5. Known losses to DOCUMENT, not fix (from the brief's sourced findings)
P6's own import drops EPS-level activity codes silently; global calendars/activity codes duplicate or
overwrite on cross-DB import; baselines have a separate import procedure and do not survive ordinary
import. These are P6/format limits, not our bugs. Emit a `§XER_WRITE_LOSSY fields=...` log naming what
the format cannot carry, and state it in the export UI, rather than pretending lossless fidelity.

## 6. Scope boundaries
- **In:** two serializers + their round-trip witnesses + editor UI wiring.
- **Out:** resource levelling, baseline round-trip, EPS/activity-code preservation (P6 loses these
  itself), live P6 DB connection (a separate lane if ever wanted).
- **Out:** changing the readers, the bind-token scheme, or `toScheduleData`.

## 7. Provenance
Gap identified from the 2026-07 competitive brief (interop section) cross-checked against the actual
code (`foreign_schedule.js` readers, `schedule_editor_ui.js:519` MSPDI writer). The brief's evidence
flags apply: SYNCHRO's round-trip is UNVERIFIED and Fuzor's is marketing-only, so "parity with
incumbents" here means parity with the *documented* standard (Bexel), which is a defensible claim.
