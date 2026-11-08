#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §G1-SPEC (the generic root-cause fix) — feeds Witnesses: W-GENESIS-COMPLETE, W-INITDEF-GEN
// The model classes' setInitialDefaults() — what `new MXxx(ctx, 0, trx)` sets before anything else — EXTRACTED from the iDempiere 13 source into ONE generated
//   table for the twin's ModelLayer.newPO (erp/model_initial_defaults.js). Hand-copying them one class at a time is how 10+ classes were missing (W-NINJA-MIGRATE).
// Sources: org.adempiere.base/src/org/compiere/model/M*.java (setInitialDefaults() body, else the standard ctor's `if (<Key>_ID == 0)` block), constants from the
//   X_<Table>.java / M*.java / I_*.java `public static final` fields; columns checked against ad_seed.db (a setter that is not a column of the table is skipped, logged).
// Values: true/false -> 'Y'/'N'; Env.ZERO/ONE/ONEHUNDRED, numerals, new BigDecimal(n), BigDecimal.valueOf(n) -> numbers; "x" -> string; CONSTANT -> its literal;
//   new Timestamp(System.currentTimeMillis()) / TimeUtil.getDay(...) / Env.getContextAsDate -> CLOCK (the session date, as the ctor's own clock); anything else UNRESOLVED (logged, not guessed).
// Run: node scripts/gen_initial_defaults.js <bim-ootb/erp>      (writes <erp>/model_initial_defaults.js; log build/erp/logs_migrate_2026-11-09/gen_initial_defaults.log)
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
var ERP = process.argv[2] || path.join(process.env.HOME, 'bim-ootb/erp');
var SRC = path.join(process.env.HOME, 'idempiere-dev-setup/idempiere/org.adempiere.base/src/org/compiere/model');
var LOGF = path.join(__dirname, '..', 'build/erp/logs_migrate_2026-11-09/gen_initial_defaults.log');
var log = [];
function L(s) { console.log(s); log.push(s); }
function sq(sql) { return JSON.parse(cp.execFileSync('sqlite3', ['-json', path.join(ERP, 'ad_seed.db'), sql], { encoding: 'utf8', maxBuffer: 1 << 28 }) || '[]'); }
var COLS = {};
sq("SELECT lower(t.tablename) AS t, lower(c.columnname) AS c, c.ad_reference_id AS r FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id WHERE c.isactive='Y' AND coalesce(c.columnsql,'')=''")
  .forEach(function (r) { (COLS[r.t] = COLS[r.t] || {})[r.c] = r.r; });

var srcCache = {};
function src(name) { if (srcCache[name] !== undefined) return srcCache[name]; var f = name === 'DocAction' ? path.join(SRC, '..', 'process', 'DocAction.java') : path.join(SRC, name + '.java');
  return (srcCache[name] = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null); }
function constOf(name, classes) {   // public static final String NAME = "v";  /  int NAME = 3;
  for (var i = 0; i < classes.length; i++) {
    var s = src(classes[i]); if (!s) continue;
    var m = new RegExp('\\bstatic\\b(?:\\s+(?:public|private|protected|final))*\\s+(String|int|Integer|BigDecimal)\\s+' + name + '\\s*=\\s*([^;]+);').exec(s);   // a private static (MCountry.DISPLAYSEQUENCE) counts too
    if (m) { var v = m[2].trim(); if (/^"/.test(v)) return { v: JSON.parse(v) }; if (/^-?\d+$/.test(v)) return { v: Number(v) }; }
  }
  return null;
}
function strip(code) { return code.replace(/\/\*[\s\S]*?\*\//g, function (m) { return m.replace(/[^\n]/g, ' '); }).split('\n').map(function (l) { return l.replace(/\/\/.*$/, ''); }).join('\n'); }
function block(text, at) {   // the {...} starting at the first '{' at/after `at`; returns [start, end) of the inside
  var i = text.indexOf('{', at); if (i < 0) return null; var d = 0;
  for (var j = i; j < text.length; j++) { if (text[j] === '{') d++; else if (text[j] === '}') { d--; if (!d) return [i + 1, j]; } }
  return null;
}
function lineAt(text, idx) { return text.slice(0, idx).split('\n').length; }
function value(expr, classes, ref) {
  var e = expr.trim();
  if (e === 'true' || e === 'false') return { v: e === 'true' ? 'Y' : 'N' };
  if (e === 'null') return { skip: 'null' };
  if (/^Env\.ZERO$|^BigDecimal\.ZERO$/.test(e)) return { v: 0 };
  if (/^Env\.ONE$|^BigDecimal\.ONE$/.test(e)) return { v: 1 };
  if (/^Env\.ONEHUNDRED$/.test(e)) return { v: 100 };
  if (/^-?\d+(\.\d+)?[dDfFlL]?$/.test(e)) return { v: Number(e.replace(/[dDfFlL]$/, '')) };
  var m = /^(?:new\s+BigDecimal\s*\(|BigDecimal\.valueOf\s*\(|Integer\.valueOf\s*\()\s*"?(-?\d+(\.\d+)?)"?\s*\)$/.exec(e); if (m) return { v: Number(m[1]) };
  if (/^"([^"\\]|\\.)*"$/.test(e)) return { v: JSON.parse(e) };
  if (/currentTimeMillis|TimeUtil\.getDay|getContextAsDate|new\s+Timestamp/.test(e)) return { clock: true };
  m = /^(?:([A-Z]\w*)\.)?([A-Z][A-Z0-9_]*[A-Za-z0-9_]*)$/.exec(e);
  if (m && /_|^[A-Z0-9]+$/.test(m[2])) { var c = constOf(m[2], (m[1] ? [m[1]] : []).concat(classes, ['PO'])); if (c) return c; }   // PO carries ENTITYTYPE_* (PO.java)
  return { unresolved: e };
}

var GEN = {}, stats = { classes: 0, tables: 0, cols: 0, clock: 0, skipped: 0, unresolved: 0 }, unresolved = [], skipped = [];
fs.readdirSync(SRC).filter(function (f) { return /^M[A-Z]\w*\.java$/.test(f); }).sort().forEach(function (f) {
  var cls = f.replace(/\.java$/, ''), raw = src(cls), code = strip(raw);
  var ext = new RegExp('class\\s+' + cls + '\\s+extends\\s+(X_\\w+)').exec(code); if (!ext) return;
  var table = ext[1].slice(2).toLowerCase(); if (!COLS[table]) return;
  var body = null, where = null;
  var mi = code.search(/void\s+setInitialDefaults\s*\(\s*\)\s*\{/);
  if (mi >= 0) { var b = block(code, mi); if (b) { body = code.slice(b[0], b[1]); where = lineAt(code, mi); } }
  if (!body) {   // the standard ctor's `if (<Key>_ID == 0) { ... }` block (older classes, e.g. MClient)
    var key = ext[1].slice(2) + '_ID', re = new RegExp('public\\s+' + cls + '\\s*\\(\\s*Properties\\s+ctx\\s*,\\s*int\\s+(\\w+)[^)]*\\)\\s*\\{', 'g'), cm;
    while ((cm = re.exec(code))) {
      var cb = block(code, cm.index); if (!cb) continue;
      var ctor = code.slice(cb[0], cb[1]), ii = ctor.search(new RegExp('if\\s*\\(\\s*' + cm[1] + '\\s*==\\s*0\\s*\\)'));
      if (ii < 0) continue;
      var after = ctor.slice(ii), ib = /\)\s*\{/.exec(after);
      if (ib && ib.index < 40) { var bb = block(after, ib.index); if (bb) { body = after.slice(bb[0], bb[1]); where = lineAt(code, cb[0] + ii); } }
      if (body) break;
    }
  }
  if (!body || /setInitialDefaults\s*\(\s*\)\s*;/.test(body) && body.replace(/\s/g, '') === 'setInitialDefaults();') return;
  stats.classes++;
  var classes = [cls, ext[1], 'I_' + ext[1].slice(2)], init = {}, clock = [], sm, sre = /\bset([A-Z]\w*)\s*\(([\s\S]*?)\)\s*;/g;
  while ((sm = sre.exec(body))) {
    var col = sm[1].toLowerCase(), arg = sm[2];
    if (!COLS[table][col]) { skipped.push(cls + '.set' + sm[1]); stats.skipped++; continue; }
    if (/,/.test(arg.replace(/\([^()]*\)/g, ''))) { unresolved.push(cls + '.set' + sm[1] + '(' + arg.trim() + ')'); stats.unresolved++; continue; }
    var v = value(arg, classes, COLS[table][col]);
    if (v.skip) continue;
    if (v.clock) { if (clock.indexOf(col) < 0) clock.push(col); delete init[col]; continue; }
    if (v.unresolved != null) { unresolved.push(cls + '.set' + sm[1] + '(' + v.unresolved + ')'); stats.unresolved++; continue; }
    init[col] = v.v; clock = clock.filter(function (c) { return c !== col; });
  }
  if (!Object.keys(init).length && !clock.length) return;
  GEN[table] = { src: cls + '.java:' + where, init: init };
  if (clock.length) { GEN[table].clock = clock; stats.clock += clock.length; }
  stats.tables++; stats.cols += Object.keys(init).length;
});
L('§INITDEF-GEN source=' + SRC + ' classes=' + stats.classes + ' tables=' + stats.tables + ' columns=' + stats.cols + ' clock=' + stats.clock + ' skippedSetters=' + stats.skipped + ' unresolved=' + stats.unresolved);
unresolved.forEach(function (u) { L('   §INITDEF-UNRESOLVED ' + u); });
L('   §INITDEF-SKIPPED (setter is not a column of the table) ' + skipped.join(' '));
var ordered = {}; Object.keys(GEN).sort().forEach(function (t) { var g = GEN[t], o = { src: g.src, init: {} }; Object.keys(g.init).sort().forEach(function (c) { o.init[c] = g.init[c]; }); if (g.clock) o.clock = g.clock.slice().sort(); ordered[t] = o; });
var body = '{\n' + Object.keys(ordered).map(function (t) { return '    ' + JSON.stringify(t) + ': ' + JSON.stringify(ordered[t]); }).join(',\n') + '\n  }';
var sha = crypto.createHash('sha256').update(body).digest('hex').slice(0, 16);
var out = '// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>\n// SPDX-License-Identifier: MIT\n' +
  '// ⚠ GENERATED — do not edit. bim-compiler scripts/gen_initial_defaults.js from iDempiere 13 org.adempiere.base/src/org/compiere/model (M*.java setInitialDefaults /\n' +
  '//   the ctor `if (<Key>_ID == 0)` block; constants from X_*.java). bim-compiler prompts/MIGRATE_INSTALL_TENANT.md §G1-SPEC — Witness: W-GENESIS-COMPLETE.\n' +
  '// What `new MXxx(ctx, 0, trx)` sets before anything else: ModelLayer.newPO applies it UNDER a hand-registered MODEL[t].initialDefaults (the hand entry wins), and\n' +
  '//   `clock` columns take the session date (the ctor\'s own new Timestamp). ' + stats.tables + ' tables, ' + stats.cols + ' columns, sha ' + sha + '.\n' +
  "'use strict';\n(function (root, factory) {\n  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./model_layer'));\n" +
  '  else root.ModelInitialDefaults = factory(root.ModelLayer);\n' +
  "})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function (ML) {\n" +
  '  var GEN = ' + body + ';\n  if (ML && ML.setGeneratedDefaults) ML.setGeneratedDefaults(GEN);\n  return GEN;\n});\n';
fs.writeFileSync(path.join(ERP, 'model_initial_defaults.js'), out);
L('§INITDEF-GEN wrote ' + path.join(ERP, 'model_initial_defaults.js') + ' bytes=' + out.length + ' sha=' + sha);
fs.mkdirSync(path.dirname(LOGF), { recursive: true }); fs.writeFileSync(LOGF, log.join('\n') + '\n');
