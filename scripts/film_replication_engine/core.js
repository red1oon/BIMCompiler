// ⚠ DO NOT REMOVE — Scope: pure functions shared by the stage page (stage.js) and the recorder / narration builder (Node).
// Spec: prompts/TEAMWORK_FRAMEWORK.md §16.19a (storyboard v2), §16.20a (OFFLINE label), §16.21 (film record).
// Nothing here invents a value: every number comes from a trace event. "Read the log after every run" — the recorder prints §FILM_* lines.
// 1. activity()   — the panel's counters, the SAME classification as scripts/witness_scriptor_treat.js activity() (so the film's counters can be compared with §TREAT_PANEL).
// 2. onlineAfter() — INDEPENDENT derivation of the online/offline state from the events fired so far (used by the recorder to check the page's DOM).
// 3. plan()       — maps trace events to film seconds. Online windows have ZERO length on the trace clock; here each is given a FIXED on-screen length (FLASH).
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Core = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var PIPEK = ['put', 'recv', 'pull', 'send', 'publish'];
  var LOCALK = ['local-sale', 'local-stock', 'local-fund', 'apply-code', 'noop-code', 'skip', 'reject-code', 'issue-code'];
  var HUBK = ['accept', 'duplicate', 'COLLISION', 'FLAG', 'send', 'publish'];
  var FLASH = 4.0;          // seconds an ONLINE window is shown on screen (fixed; the window is zero-length on the trace clock)
  var LEAD = 0.5, GAP_LOCAL = 0.9, GAP_PAIR = 0.55, GAP_FAIL = 1.4, GAP_EP = 0.3, FLIGHT = 0.9;

  function activity(tr) {                         // same rules as witness_scriptor_treat.js activity()
    var c = { local: 0, pipe: 0, hub: 0, visits: 0, visitsWithTraffic: 0, hubVisits: 0 };
    tr.forEach(function (e) {
      if (LOCALK.indexOf(e.kind) !== -1) c.local++;
      if (PIPEK.indexOf(e.kind) !== -1) c.pipe++;
      if (e.actor === 'HUB' && HUBK.indexOf(e.kind) !== -1) c.hub++;
      if (e.kind === 'visit') { c.visits++; if (e.moved > 0) c.visitsWithTraffic++; }
      if (e.kind === 'hub-visit' && !e.why) c.hubVisits++;
    });
    return c;
  }
  function onlineAfter(tr, n, actor) {            // true iff the last online/offline event of `actor` among the first n events is 'online'
    var on = false;
    for (var i = 0; i < n; i++) { var e = tr[i]; if (e.actor === actor) { if (e.kind === 'online') on = true; else if (e.kind === 'offline') on = false; } }
    return on;
  }
  function dayOf(t) { return Math.floor((t - Date.UTC(2026, 9, 25)) / 86400000) + 1; }   // 2026-10-25 = day 1

  // plan(trace, beats) — beats: [{id, from, to, minHold, card?, focusDay?}] with [from,to) index ranges covering the trace in order.
  // returns { ft[i] (film seconds of event i), win:[{actor,on,off,ftOn,ftOff}], beat:[{id,start,end,from,to}], total }
  function plan(trace, beats) {
    var ft = new Array(trace.length), sw = new Array(trace.length), win = [], out = [], cur = 0, prevT = trace.length ? trace[0].t : 0;
    beats.forEach(function (b) {
      var items = [], i = b.from;                 // episodes: an online..offline window, or a standalone event
      while (i < b.to) {
        var e = trace[i];
        if (e.kind === 'online') { var j = i + 1; while (j < b.to && !(trace[j].actor === e.actor && trace[j].kind === 'offline')) j++; items.push({ a: i, z: j, ep: true }); i = j + 1; }
        else { items.push({ a: i, z: i, ep: false }); i++; }
      }
      // pass 1: offsets in seconds from the beat start (fixed parts) + stretchable gaps
      var off = LEAD, rec = [], fixed = 0, stretch = 0, last = prevT, prevItemT = prevT;
      items.forEach(function (it, k) {
        var e0 = trace[it.a], dt = Math.abs(e0.t - prevItemT) / 3600000, gapBefore = 0;
        if (e0.t !== prevItemT) gapBefore = Math.min(1.4, 0.5 + 0.12 * dt);          // the trace clock sweeps to the next event time
        else if (k > 0) gapBefore = items[k - 1].ep || it.ep ? GAP_EP : 0;
        var r = { it: it, sweep: e0.t !== prevItemT ? gapBefore : 0, gap: e0.t !== prevItemT ? 0 : gapBefore };
        rec.push(r); prevItemT = trace[it.z].t;
      });
      // natural length
      var nat = LEAD; rec.forEach(function (r) {
        var it = r.it; nat += r.sweep + r.gap;
        if (it.ep) nat += FLASH + 0.25;
        else { var e0 = trace[it.a]; var nx = trace[it.a + 1]; var pairNext = nx && it.a + 1 < b.to && nx.t === e0.t && !(nx.kind === 'online');
          nat += e0.kind === 'fail' ? GAP_FAIL : (pairNext ? GAP_PAIR : GAP_LOCAL); }
      });
      var D = Math.max(b.minHold || 0, nat + 0.6), extra = D - (nat + 0.6);
      // stretch only the gaps between items (never an ONLINE window, which stays FLASH long)
      var nGaps = rec.length ? rec.length : 1, per = extra / nGaps, c = cur + LEAD;
      rec.forEach(function (r) {
        var it = r.it, e0 = trace[it.a];
        c += r.sweep + r.gap + per * (r.sweep || r.gap ? 1 : 0.5);
        sw[it.a] = r.sweep;
        if (it.ep) {
          var m = it.z - it.a - 1, dk = m > 0 ? Math.min(0.45, (FLASH - 1.1) / m) : 0;
          ft[it.a] = c; for (var q = 1; q <= m; q++) { ft[it.a + q] = c + 0.55 + (q - 1) * dk; sw[it.a + q] = 0; }
          if (it.z < b.to) { ft[it.z] = c + FLASH; sw[it.z] = 0; win.push({ actor: e0.actor, on: it.a, off: it.z, ftOn: c, ftOff: c + FLASH }); }
          c += FLASH + 0.25;
        } else {
          var nx = trace[it.a + 1], pairNext = nx && it.a + 1 < b.to && nx.t === e0.t && nx.kind !== 'online';
          ft[it.a] = c; c += e0.kind === 'fail' ? GAP_FAIL : (pairNext ? GAP_PAIR : GAP_LOCAL);
        }
      });
      out.push({ id: b.id, start: cur, end: cur + D, from: b.from, to: b.to, card: b.card || null, focusDay: b.focusDay || 0, title: b.title || '', src: b.src || '' });
      cur += D;
      if (b.to > b.from) prevT = trace[b.to - 1].t;
    });
    return { ft: ft, sw: sw, win: win, beat: out, total: cur };
  }
  return { PIPEK: PIPEK, LOCALK: LOCALK, HUBK: HUBK, FLASH: FLASH, FLIGHT: FLIGHT, activity: activity, onlineAfter: onlineAfter, dayOf: dayOf, plan: plan };
});
