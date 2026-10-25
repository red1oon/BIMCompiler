// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treatments/seed.js — SEED: the hub publishes a versioned value; a device pulls it under a guard (§16.18, §22.3).
'use strict';
require('../treat.js').register('SEED', {
  needs: ['guard', 'audience'],
  scope: function () { return ['seed/', 'pub/']; },                       // addressed and public seeds are readable by every device
  publish: function (w, row, value) { w.relay.put((row.audience === 'public' ? 'pub/' : 'seed/') + row.name + '/latest', { v: value, ver: ++w.hub.ver }); w.log('HUB', 'publish', { flow: row.name, audience: row.audience }); },
  deviceVisit: function (w, dev, row, v) {
    if (row.audience !== 'public' && dev.role !== row.role) return;
    var st = dev.pull[row.name] || (dev.pull[row.name] = { last: null, val: null }), day = w.day();
    if (!w.opts.noGuard && st.val !== null && (row.guard === 'once' || st.last === day)) { w.stats.skipped++; w.log(dev.id, 'skip', { flow: row.name }); return; }   // I5: checked today and value present
    var got = v.get((row.audience === 'public' ? 'pub/' : 'seed/') + row.name + '/latest'); st.last = day; w.stats.fetch++;
    if (got) st.val = got.v; w.log(dev.id, 'pull', { flow: row.name, got: got ? got.v : null });
  }
});
