// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treatments/rule.js — RULE: a named kernel process that emits facts (§16.18, §22.3). Two triggers, exactly one per row:
//   `on`            the arrival of that flow at the hub runs the process (event-driven; the process gets the arrived fact)
//   `role`+`schedule` a ROLE runs the process on its schedule (TEAM_REPLICATION_PLUGIN_STUDY §14: legacy processes are run by a person/department, not by an arrival).
//                   `schedule` is a label for people, recorded in the plan (as on a FACT); the engine's clock is the head office's session: the role's run happens in every hub visit, after the
//                   flows are ingested (rows are visited in file order: put a scheduled rule AFTER the flows whose arrivals it reads). The process gets no fact (null) and reads the hub's own state,
//                   as a legacy report reads the database; running it again with nothing new emits nothing.
//   `processId`     optional: the AD_Process_ID the `process` name stands for (documentation, checked only for being a positive integer).
'use strict';
function emit(w, row, out) {
  var down = w.rows.filter(function (r) { return r.name === row.emits; })[0];
  (out || []).forEach(function (o) { w.hubSend(down, o.station, { flow: down.name, key: o.key, fields: o.fields, by: 'HUB' }); });
}
require('../treat.js').register('RULE', {
  needs: ['process', 'emits'],
  refs: ['on', 'emits'],                                                 // both must name a row of the same file (checked at compile time)
  check: function (row) {
    var e = [], ev = row.on !== undefined && row.on !== null && row.on !== '', sc = row.role !== undefined && row.role !== null && row.role !== '' && row.schedule !== undefined && row.schedule !== null && row.schedule !== '';
    if (ev && (row.role !== undefined || row.schedule !== undefined)) e.push('RULE is triggered by on, or by role and schedule, not both');
    else if (!ev && !sc) e.push('RULE needs on, or role and schedule');
    if (row.processId !== undefined && !(Number.isInteger(row.processId) && row.processId > 0)) e.push('RULE processId must be a positive integer');
    return e;
  },
  onAccept: function (w, row, acc, fact) {                              // arrival of the row's 'on' flow -> named kernel process -> emitted facts
    if (row.on === undefined || acc.name !== row.on) return;
    var proc = w.procs[row.process]; if (!proc) throw new Error('no process ' + row.process);
    emit(w, row, proc(w.hub, fact, w));
  },
  hubVisit: function (w, row) {                                          // the role's run, in the head office's session
    if (row.on !== undefined) return;
    var proc = w.procs[row.process]; if (!proc) throw new Error('no process ' + row.process);
    emit(w, row, proc(w.hub, null, w));
  }
});
