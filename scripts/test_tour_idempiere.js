// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// Implementing prompts/IDEMPIERE_TOUR_GUIDE.md + docs/TourGuideHostContract.md — Witness: W-TOUR-IDEMPIERE.
// NAMES the issues it proves/disproves:
//  (1) NO FORK — the idempiere tour rides the SAME help_overlay.js (pure COACH core intact; the adapter
//      help_idmp.js carries ZERO coach logic). §TOUR forked=0.
//  (2) KEYS MATCH + DRIFT GATE — every help_ops O2C step maps to a keymap entry and vice-versa (no stale).
//      §TOUR-ALIGN orphan-steps=0 orphan-elements=0.
//  (3) O2C REUSED — 6 steps, all op=o2c, sourced from HelpO2C.md, real order #80001. §TOUR-O2C.
//  (4) READ-ONLY — static scan: the overlay + adapter NEVER write (no dispatch/commit/SQL/kernel_ops).
//      §SEAM ui-direct-oplog-access=0 tour-writes=0.
//  (5) SHOWME DRIVES HOST GLOBALS — load the LIFTED module in a DOM shim, init() with a MOCK IdmpHost,
//      and prove ShowMe calls IdmpHost.trace/focus/openTab (never chrome internals) + wrap/card mount + badges
//      build for has-keys. §TOUR overlay=help_overlay host=idempiere mounts=2 keysMatched=Y showme-nav=via-globals.
//  (6) GRACEFUL DEGRADE — each data-bearing step carries an honest coverage marker. §TOUR-DEGRADE.
// §-log first: writes build/erp/tour_idempiere_witness.log; READ the log, not the exit code.
'use strict';
var fs = require('fs');
var vm = require('vm');
var path = require('path');
var ROOT = path.join(__dirname, '..');
var P = function (rel) { return path.join(ROOT, rel); };

var lines = [], pass = 0, fail = 0;
function L(s) { lines.push(s); }
function ck(c, m) { if (c) { pass++; L('§TOUR-T PASS ' + m); } else { fail++; L('§TOUR-T FAIL ' + m); } }

var COACH   = require('../build/erp/help_overlay.js');                 // node branch → pure core only
var STORE   = JSON.parse(fs.readFileSync(P('build/erp/help_ops.json'), 'utf8'));
var KEYMAP  = JSON.parse(fs.readFileSync(P('build/erp/help_idmp_keymap.json'), 'utf8'));
var OVSRC   = fs.readFileSync(P('build/erp/help_overlay.js'), 'utf8');
var ADSRC   = fs.readFileSync(P('build/erp/help_idmp.js'), 'utf8');
var O2CDOC  = fs.readFileSync(P('docs/internal/HelpO2C.md'), 'utf8');   // moved by 87bc56b47 (2026-06-30); §TWIN-CLASSIFIED-2

var stepKeys = Object.keys(STORE).filter(function (k) { return k !== '__meta'; });
var mapKeys  = Object.keys(KEYMAP).filter(function (k) { return k !== '__meta'; });

// ── (1) NO FORK — pure core intact + adapter is init-only ────────────────────
ck(typeof COACH.coachPlan === 'function' && typeof COACH.nextGate === 'function',
   'help_overlay pure COACH core intact (same module glassbowl loads)');
var ADCODE = ADSRC.replace(/^\s*\/\/.*$/gm, '');             // strip line comments — scan CODE only
ck(!/coachPlan|buildBadges|function showMe|STEPS\s*=/.test(ADCODE),
   'help_idmp.js carries NO coach logic (init-only adapter — forked=0)');
ck(/__help\.init\(/.test(ADSRC), 'help_idmp.js drives the overlay via __help.init (reuse, not copy)');

// ── (2) KEYS MATCH + DRIFT GATE ──────────────────────────────────────────────
var orphanSteps = stepKeys.filter(function (k) { return mapKeys.indexOf(k) < 0; });
var orphanEls   = mapKeys.filter(function (k) { return stepKeys.indexOf(k) < 0; });
ck(orphanSteps.length === 0, 'no orphan steps (every help_ops key has a keymap entry): ' + JSON.stringify(orphanSteps));
ck(orphanEls.length === 0,   'no orphan elements (every keymap key has a step): ' + JSON.stringify(orphanEls));
L('§TOUR-ALIGN keyed-entries=' + mapKeys.length + ' orphan-steps=' + orphanSteps.length + ' orphan-elements=' + orphanEls.length);

// ── (3) O2C REUSED ───────────────────────────────────────────────────────────
var allO2C = stepKeys.every(function (k) { return STORE[k].op === 'o2c'; });
var allHelpO2C = stepKeys.every(function (k) { return /^HelpO2C\.md/.test(STORE[k].readmeAnchor || ''); });
ck(stepKeys.length === 6, 'O2C has 6 steps (overview + 5 docs): ' + stepKeys.length);
ck(allO2C, 'every step op=o2c');
ck(allHelpO2C, 'every step sourced from HelpO2C.md (readmeAnchor)');
ck(/#?80001/.test(O2CDOC) && /80001/.test(STORE.c_order.paraHTML), 'real order #80001 present in HelpO2C.md + store');
L('§TOUR-O2C steps=' + stepKeys.length + ' source=HelpO2C real-order=#80001 showme-nav=via-globals');

// ── (4) READ-ONLY (static scan of the overlay + adapter source) ──────────────
var WRITE_RE = /\b(dispatch|commitOp|commit)\s*\(|\bINSERT\s+INTO\b|\bUPDATE\s+\w|\.run\s*\(|kernel_ops/i;
var ovWrite = WRITE_RE.test(OVSRC.replace(/^\s*\/\/.*$/gm, ''));   // strip line comments first
var adWrite = WRITE_RE.test(ADSRC.replace(/^\s*\/\/.*$/gm, ''));
ck(!ovWrite, 'help_overlay.js performs NO write (no dispatch/commit/SQL/kernel_ops)');
ck(!adWrite, 'help_idmp.js performs NO write (read-only adapter)');
L('§SEAM ui-direct-oplog-access=0 tour-writes=0');

// ── (6) GRACEFUL DEGRADE — honest coverage per data-bearing step ─────────────
var OK_COV = { complete: 1, partial: 1, absent: 1 };
stepKeys.filter(function (k) { return STORE[k].target; }).forEach(function (k) {
  var cov = (KEYMAP[k] || {}).coverage || 'absent';
  ck(!!OK_COV[cov], 'data step ' + k + ' declares honest coverage=' + cov);
  L('§TOUR-DEGRADE step=' + k + ' coverage=' + cov);
});

// ════════════════════════════════════════════════════════════════════════════
// (5) DOM-SHIM WIRING — load the LIFTED help_overlay.js + help_idmp.js in a minimal browser shim with a
// MOCK IdmpHost, and prove ShowMe drives the host globals (never chrome internals). Whitebox §-log.
// ════════════════════════════════════════════════════════════════════════════
function makeEl(tag) {
  var el = {
    tagName: tag, id: '', className: '', _html: '', textContent: '', children: [], parentNode: null,
    style: {}, offsetWidth: 0, offsetHeight: 0,
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    appendChild: function (c) { c.parentNode = el; el.children.push(c); return c; },
    removeChild: function (c) { var i = el.children.indexOf(c); if (i >= 0) el.children.splice(i, 1); return c; },
    insertBefore: function (c) { c.parentNode = el; el.children.push(c); return c; },
    setAttribute: function (k, v) { el[k] = v; }, getAttribute: function (k) { return el[k]; },
    addEventListener: function () {}, removeEventListener: function () {},
    getBoundingClientRect: function () { return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }; },
    querySelector: function () { return makeEl('shim'); }, querySelectorAll: function () { return []; },
    classList: { _s: {}, add: function (c) { this._s[c] = 1; }, remove: function (c) { delete this._s[c]; },
                 toggle: function (c) {}, contains: function (c) { return !!this._s[c]; } },
    closest: function () { return null; }
  };
  return el;
}
function runWiring() {
  var byId = {};
  var doc = {
    head: makeEl('head'), body: makeEl('body'),
    createElement: function (t) { return makeEl(t); },
    getElementById: function (id) { if (!byId[id]) { byId[id] = makeEl('byid'); byId[id].id = id; } return byId[id]; }
  };
  var rec = { trace: [], focus: [], openTab: [], has: [], locate: [] };   // what the host received
  var DATA_KEYS = { c_order: 1, m_inout: 1, c_invoice: 1, c_payment: 1, c_allocationline: 1 };
  var sandbox = {
    console: { log: function () {}, warn: function () {} },
    Math: Math, JSON: JSON, String: String, Object: Object, Array: Array, setTimeout: function () {},
    requestAnimationFrame: function () { return 1; }, cancelAnimationFrame: function () {},
    CustomEvent: function (n, o) { this.type = n; this.detail = o && o.detail; },
    document: doc, innerWidth: 1200, innerHeight: 800,
    addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () {},
    fetch: function () { return Promise.resolve({ json: function () { return Promise.resolve(STORE); } }); }
  };
  sandbox.window = sandbox;                                  // browser-like: window === global
  // the FRONTEND-exposed host globals (the contract) — a mock the adapter consumes:
  sandbox.IdmpHost = {
    trace:   function (on) { rec.trace.push(on); },
    focus:   function (key, map) { rec.focus.push({ key: key, map: map }); },
    openTab: function (key, tab) { rec.openTab.push({ key: key, tab: tab }); },
    has:     function (key) { rec.has.push(key); return !!DATA_KEYS[key]; },
    locate:  function (key) { rec.locate.push(key); return { x: 100, y: 100, r: 14, rRaw: 14 }; }
  };
  sandbox.__helpIdmpKeymap = KEYMAP;

  vm.runInNewContext(OVSRC, sandbox, { filename: 'help_overlay.js' });   // mounts to document.body (default)
  var mountedDefault = doc.body.children.length;                          // wrap + card on the default host
  vm.runInNewContext(ADSRC, sandbox, { filename: 'help_idmp.js' });       // init({host:#idmp-content, nav})

  var H = sandbox.__help;
  var idmpHost = doc.getElementById('idmp-content');
  var ad = H.adapter();
  var rebound = ad.host === idmpHost && doc.body.children.indexOf(ad.host) < 0;   // re-parented to idmp host

  // ShowMe a process step → must drive IdmpHost.trace/focus/openTab (via-globals), not chrome internals.
  H.showMe({ op: 'o2c', key: 'c_order', target: 'c_order', kind: 'process', tab: 'Data' });
  H.showMe({ op: 'o2c', key: 'o2c', target: null, kind: 'overview' });    // overview drives trace only

  return { mountedDefault: mountedDefault, rebound: rebound, host: idmpHost, rec: rec, H: H };
}

function afterEnable(W) {
  // badges build for has-keys only (5 data docs; o2c has no target). enable() fetches the store async.
  W.H.enable();
  return new Promise(function (resolve) {
    setImmediate(function () { setImmediate(function () {
      var badges = (W.host.children || []).filter(function (c) { return c.className === 'help-q'; });
      resolve(badges.length);
    }); });
  });
}

(function main() {
  var W;
  try { W = runWiring(); } catch (e) { ck(false, 'DOM-shim wiring threw: ' + (e && e.message)); finish(); return; }

  ck(W.mountedDefault >= 2, 'wrap + card mount into the host container (mounts=' + W.mountedDefault + ')');
  ck(W.rebound, 'init() re-parents the overlay into idempiere #idmp-content (host rebound)');
  ck(W.rec.trace.length >= 1 && W.rec.trace[0] === true, 'ShowMe drove IdmpHost.trace(true) — via host global');
  ck(W.rec.focus.length === 1 && W.rec.focus[0].key === 'c_order', 'ShowMe drove IdmpHost.focus(c_order) — not chrome internals');
  ck(W.rec.focus[0].map && W.rec.focus[0].map.window === 'Sales Order', 'focus carried the keymap entry (Sales Order window)');
  ck(W.rec.openTab.length === 1 && W.rec.openTab[0].tab === 'Data', 'ShowMe drove IdmpHost.openTab(c_order, Data)');
  ck(W.rec.trace.length === 2, 'overview step drove trace only (no focus/openTab on the title step)');
  L('§TOUR overlay=help_overlay host=idempiere forked=0 mounts=' + W.mountedDefault + ' keysMatched=Y showme-nav=via-globals');

  afterEnable(W).then(function (nBadges) {
    ck(nBadges === 5, 'NeedHelp? built a numbered badge per has-key (5 O2C docs): ' + nBadges);
    L('§TOUR badges=' + nBadges + ' has-keys=5 (o2c overview has no target → no badge)');
    finish();
  }).catch(function (e) { ck(false, 'enable/badge wiring threw: ' + (e && e.message)); finish(); });
})();

function finish() {
  L('§TOUR-IDEMPIERE SUMMARY pass=' + pass + ' fail=' + fail);
  fs.writeFileSync(P('build/erp/tour_idempiere_witness.log'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  process.exit(fail === 0 ? 0 : 1);
}
