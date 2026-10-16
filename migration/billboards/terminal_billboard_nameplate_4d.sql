-- §BILLBOARD_NAME_ELEMENT (4D half) — bind the name plate to the LAST leaf task.
-- Spec: bim-compiler prompts/PHOTOREAL_STILL_RENDER.md §BILLBOARD_NAME_ELEMENT §4.
-- Companion/prerequisite: terminal_billboard_nameplate.sql (the element itself — run that FIRST).
-- Applies ONLY to a DB that carries the 4D tables (tasks/task_elements) AND a materialised
-- kernel_ops timeline — i.e. TerminalHi4D.db. Running it on Terminal_Hi.db would error on the
-- missing tables, which is exactly why the two files are split.
--
-- ── WHY TASK_Finishes ───────────────────────────────────────────────────────────────────────────
-- User directive: the name plate "shall appear last, not like now it came on."
-- TerminalHi4D.db's authored schedule (SCH_AUTHORED, materializeDefault-produced — see
-- CINEMA_PATH_EDITOR.md §CPE_BUILDUP_REAL_SCHEDULE) has 5 dated non-summary leaves; the last by
-- schedule_finish is TASK_Finishes (2026-05-01 -> 2026-05-31). Signage goes up last. Verified:
--   TASK_Superstructure 2026-01-01..01-31 | TASK_MEP_Rough_in 01-31..03-02
--   TASK_Architecture   03-02..04-01      | TASK_MEP_Final    04-01..05-01
--   TASK_Finishes       05-01..05-31  <- max(schedule_finish) over is_summary=0
--
-- ── WHY THE kernel_ops ROW IS PART OF THIS PATCH, NOT AN EXTRA ──────────────────────────────────
-- The task_elements row ALONE is not enough on this DB, and this is the trap the file exists to
-- close. TerminalHi4D.db already carries 48,433 materialised ELEMENT_PLACE kernel_ops rows with
-- _captured=1, so time_machine.js activate() (viewer/time_machine.js:4439-4450) takes the
-- existing-ops path and NEVER runs injectGantt() — which means the _cap overlay that reads
-- task_elements never runs either. An element with no ELEMENT_PLACE op is absent from _ops, and
-- renderAtTime's traverse (viewer/time_machine.js:1269-1296) then sets obj.visible = false for it
-- at EVERY cursor value: the plate would be invisible for the whole film. This is precisely the
-- post-authoring-injection ordering gap named in CINEMA_PATH_EDITOR.md
-- §CPE_BUILDUP_REAL_SCHEDULE §6, hit for real.
--
-- ── THE TIMESTAMPS ARE DERIVED FROM _cap's OWN SLOT FORMULA, NOT CHOSEN ─────────────────────────
-- viewer/time_machine.js:3437-3438, verbatim:
--     s_i = w.s + Math.floor((i / _n) * _span);
--     e_i = (i + 1 < _n) ? (w.s + Math.floor(((i + 1) / _n) * _span)) : w.e;
-- with, for TASK_Finishes:
--     w.s = 1777593600000 (2026-05-01)   w.e = 1780185600000 (2026-05-31)   _span = 2592000000 ms
--     _n  = 259  (258 existing Finishes elements + this one)
--     i   = 258  (last)
--   -> start_ts = 1777593600000 + floor((258/259) * 2592000000) = 1780175592277
--                                                                 (2026-05-30T21:13:12.277Z)
--   -> end_ts   = w.e                                           = 1780185600000
--                                                                 (2026-05-31T00:00:00.000Z)
-- start_ts is 38,789 ms AFTER the previous last Finishes op's start (1780175553488), so this is
-- strictly the last-starting op of the whole programme, at 99.923 % of 2026-01-01..2026-05-31.
-- NO EXISTING OP IS RE-TIMED by this file.
--
-- The parameters JSON matches what _cap itself would have written, field for field:
--   phase    = the task's own name ('Finishes')       — _cap sets p.phase = w.name (:3441)
--   cls/name/storey = the element's own metadata      — from the generative pass
--   resource = '_DEFAULT'                             — _cap does NOT overwrite resource, and
--              IfcBuildingElementProxy takes the SEQUENCE_DEFAULT route, exactly as the billboard
--              panel's own shipped op does ("resource":"_DEFAULT")
--   _captured = 1, _task = 'TASK_Finishes'            — _cap sets both (:3443-3444)
--
-- ⚠ ONE BOUNDED, DELIBERATE DIFFERENCE, recorded so it is not "discovered" later as a bug.
-- _cap sorts a phase's bucket by center_z ASCENDING (:3434). This plate's center_z is 23.61; the
-- current last Finishes element (1eZp5ooAv7nR3kNwng52r2, IfcCovering) is at 23.6228781. So a full
-- tmRefoldSchedule() would place this plate SECOND-to-last of 259, ~2.8 h of model time earlier —
-- still inside the final 0.4 % of the programme, still visually "last". This file encodes the
-- construction fact (signage goes up last); a refold encodes bottom-up Z order. Both satisfy the
-- directive; they are not identical, and the witness asserts the value written here, not a range.
--
-- Idempotent: INSERT OR REPLACE on task_elements (PK is (task_id, guid)); the kernel_ops row is
-- DELETE-then-INSERT because kernel_ops.id is a plain autoincrementing INTEGER PRIMARY KEY with no
-- natural key to REPLACE on.
-- To remove: DELETE FROM task_elements WHERE guid='BB0BIMOOTBNAME000001A';
--            DELETE FROM kernel_ops WHERE output_guid='BB0BIMOOTBNAME000001A';

INSERT OR REPLACE INTO task_elements (task_id, guid) VALUES ('TASK_Finishes', 'BB0BIMOOTBNAME000001A');

DELETE FROM kernel_ops WHERE output_guid = 'BB0BIMOOTBNAME000001A' AND op_type = 'ELEMENT_PLACE';

INSERT INTO kernel_ops (timestamp, op_type, parameters, input_guids, output_guid, undone, user_tag)
VALUES (
  1780175592277,
  'ELEMENT_PLACE',
  '{"phase":"Finishes","cls":"IfcBuildingElementProxy","name":"BIM_OOTB_NamePlate:Facade_1200x4000:1","storey":"Aras 04","resource":"_DEFAULT","_end_ts":1780185600000,"_captured":1,"_task":"TASK_Finishes"}',
  '["BB0BIMOOTBNAME000001A"]',
  'BB0BIMOOTBNAME000001A',
  0,
  'local'
);
