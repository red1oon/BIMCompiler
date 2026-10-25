// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treat.js — the TREATMENT REGISTRY (prompts/TEAMWORK_FRAMEWORK.md §22.3). The core knows no treatment: a treatment is a component that registers
// itself under a name (build/scriptor/treatments/*.js, loaded at start-up; loadDir(dir) loads more); a flow row names it. Mirrors iDempiere's
// service registries (IModelFactory / IProcessFactory) and ModelValidationEngine dispatch.
// EXTENSION POINTS (the whole contract; every one optional except needs):
//   needs:[row params] · scope(w,dev)->[relay prefixes the device may touch] · check(row)->[errors] · expand(row)->rows · deviceVisit(w,dev,row,view) · hubVisit(w,row) · onAccept(w,row,acceptedRow,fact) · publish(w,row,value)
'use strict';
var fs = require('fs'), path = require('path'), R = {};
function register(name, comp) {
  if (R[name]) throw new Error('duplicate treatment ' + name);
  if (!comp || !Array.isArray(comp.needs)) throw new Error('treatment ' + name + ' needs a needs array');
  R[name] = comp; return comp;
}
function loadDir(dir) { return fs.readdirSync(dir).filter(function (f) { return /\.js$/.test(f); }).sort().map(function (f) { require(path.join(dir, f)); return f; }); }
function expand(rows) { var out = []; rows.forEach(function (r) { out.push(r); var c = R[r.treatment]; if (c && c.expand) c.expand(r).forEach(function (x) { out.push(x); }); }); return out; }
// validate(row) -> [errors]; run at compile time (W-TREAT-REGISTRY)
function validate(row) {
  var t = R[row.treatment];
  if (!t) return ['unknown treatment ' + row.treatment];
  return t.needs.filter(function (p) { return row[p] === undefined || row[p] === null || row[p] === ''; }).map(function (p) { return row.treatment + ' needs ' + p; })
    .concat(t.check ? t.check(row) : []);
}
module.exports = { T: R, register: register, get: function (n) { return R[n]; }, loadDir: loadDir, expand: expand, validate: validate };
loadDir(path.join(__dirname, 'treatments'));
