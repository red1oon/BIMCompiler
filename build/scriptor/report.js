// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// report.js — the plain-text compile report a person reads (prompts/TEAMWORK_FRAMEWORK.md §26). One line per row, then what is wrong (x) or worth a look (!). Pure formatting of compile()'s result.
'use strict';
function list(a) { return a.join(', '); }
function report(result) {
  var out = [];
  result.virtualErrors.forEach(function (e) { out.push('x ' + e); });
  result.plan.forEach(function (f) {
    var head = f.name + '  ' + (f.noTable ? (f.treatment || '?') + ' (no table)' : (f.dir || '') + ' ' + f.table + (f.error ? '' : ' [' + f.tableType + '] carries ' + f.payloadColumns + ' of ' + f.tableColumns + ' columns' + (f.proposed ? ' (PROPOSED by the dictionary, trim it)' : '')));
    out.push(head);
    if (f.error) out.push('   x ' + (f.error === 'no-table' ? 'no such table: ' + f.table : f.error));
    (f.treatmentErrors || []).forEach(function (e) { out.push('   x ' + e); });
    if ((f.declaredMissing || []).length) out.push('   x unknown column(s): ' + list(f.declaredMissing));
    if ((f.mandatoryUncarried || []).length && !f.proposed) out.push('   ! mandatory columns not carried: ' + list(f.mandatoryUncarried));
    if ((f.derivedCarried || []).length) out.push('   ! system-computed columns carried: ' + list(f.derivedCarried));
    if ((f.baseRequirement || []).length) out.push('   i the receiver must already hold: ' + list(f.baseRequirement));
    if (f.ghostGuard) out.push('   i not checked for system-computed columns (virtual table: the dictionary has no window to judge by)');
  });
  var bad = result.virtualErrors.length + result.plan.reduce(function (n, f) { return n + (f.error ? 1 : 0) + (f.treatmentErrors || []).length + (f.declaredMissing || []).length; }, 0);
  out.push(bad ? bad + ' problem(s) (x): fix them before using this plan.' : 'No problems (x). plan ' + result.hash.slice(0, 12));
  return out;
}
module.exports = { report: report };
