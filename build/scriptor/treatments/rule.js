// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treatments/rule.js — RULE: a fact's arrival at the hub runs a named kernel process, which emits facts (§16.18, §22.3).
'use strict';
require('../treat.js').register('RULE', {
  needs: ['on', 'process', 'emits'],
  onAccept: function (w, row, acc, fact) {                              // arrival of the row's 'on' flow -> named kernel process -> emitted facts
    if (acc.name !== row.on) return;
    var proc = w.procs[row.process]; if (!proc) throw new Error('no process ' + row.process);
    var out = proc(w.hub, fact, w) || [], down = w.rows.filter(function (r) { return r.name === row.emits; })[0];
    out.forEach(function (o) { w.hubSend(down, o.station, { flow: down.name, key: o.key, fields: o.fields, by: 'HUB' }); });
  }
});
