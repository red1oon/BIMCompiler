#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-ROTATION-CONVENTION scope (read this block first)
 * SCOPE: RESUME_DISC_WALKER_ENVELOPE_BOUND.md item 3 -- `_eulerMat3(rx,ry,rz)` used to build a literal XYZ
 *   rotation matrix straight from (rotation_x, rotation_y, rotation_z), but the ACTUAL production renderer
 *   (modeller/bonsai_library.js:78/110, place()/foldInsert's 3-axis branch) applies
 *   `new THREE.Euler(rotX, rotZRad, -rotY)` (default 'XYZ' order) -- the render's Y-axis angle is rotation_z
 *   and its Z-axis angle is -rotation_y. The two conventions agree only in degenerate cases (Z-only cardinal
 *   rotation, or a locally-symmetric bbox) -- real rotation_y/rotation_x on an asymmetric bbox diverges
 *   MATERIALLY. This witness proves the divergence AND the fix, against REAL data and the REAL browser-side
 *   THREE.js (never trusting a from-memory reimplementation of THREE's own math twice).
 *   NON-INVENT: reads the REAL, MEASURED `/tmp/wt-embed-8-arc/modeller/Terminal_ARC.db` + `mesh.db` (the
 *   embed-8-arc rotation-consolidation session's output -- the ONLY Terminal DB with non-zero rotation_x/y/z;
 *   `~/bim-ootb/modeller/Terminal_meta.db` has ALL-ZERO rotations, confirmed by direct query, and cannot
 *   exercise this bug at all). SKIPPED (not a false pass) if that worktree is gone. Ground truth = the REAL
 *   `~/bim-ootb/modeller/lib/three.core.min.js`, driven headless via puppeteer with the EXACT production
 *   convention. Read the §-log after the run; exit code is not the evidence (Log Mandate).
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   R1 BUG-REPRODUCED  — the OLD (pre-fix) `_eulerMat3` formula diverges from the REAL renderer by >1m on real
 *                        Terminal elements with non-zero rotation_y (not a rounding artifact).
 *   R2 FIX-CONVERGES   — the NEW `_eulerMat3` (this file's `build/disc_walker.js`, live-required, not
 *                        reimplemented here) matches the REAL renderer to <1e-4m across every real test case,
 *                        INCLUDING zero-rotation controls (no regression on the degenerate case).
 *   R3 REGRESSION      — the existing hostBind/true-midpoint/occupancy witness suite stays 0-FAIL — this is a
 *                        formula correction, not a signature or call-shape change.
 */
'use strict';
var fs = require('fs'), path = require('path'), http = require('http');
var initSqlJs = require('sql.js');
var puppeteer = require('puppeteer');
var execSync = require('child_process').execSync;

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var ARC_DB = '/tmp/wt-embed-8-arc/modeller/Terminal_ARC.db';
var MESH_DB = '/tmp/wt-embed-8-arc/modeller/mesh.db';
var THREE_LIB = path.join(process.env.HOME, 'bim-ootb/modeller/lib/three.core.min.js');
var LOG = path.join(ROOT, 'logs', 'witness_rotation_convention_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) {
  if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); }
  else { fail++; log('  ❌ ' + claim + ' — ' + detail); }
}
function rows(db, sql) {
  var r = db.exec(sql); if (!r.length) return [];
  return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; });
}
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }
function corners8(lMin, lMax) {
  var out = [];
  [0, 1].forEach(function (xi) { [0, 1].forEach(function (yi) { [0, 1].forEach(function (zi) {
    out.push([xi ? lMax[0] : lMin[0], yi ? lMax[1] : lMin[1], zi ? lMax[2] : lMin[2]]);
  }); }); });
  return out;
}
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }
function midpointViaTrueMidpoint(guid, bdb, geoDb, w) {
  // Drives the LIVE, required `DW._trueMidpoint` (build/disc_walker.js) exactly as hostBind/occupancy do --
  // no reimplementation, so this witness grades the actual shipping code, not a mirror of it.
  return DW._trueMidpoint(bdb, guid, w, geoDb);
}

function serve(root) {
  return new Promise(function (resolve) {
    var srv = http.createServer(function (req, res) {
      var fp = path.join(root, decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(fp, function (e, buf) {
        if (e) { res.statusCode = 404; return res.end('nf'); }
        res.setHeader('Content-Type', fp.endsWith('.js') ? 'text/javascript' : 'text/html');
        res.end(buf);
      });
    });
    srv.listen(0, function () { resolve(srv); });
  });
}

(async function () {
  log('═══ W-ROTATION-CONVENTION — real Terminal_ARC.db elements vs REAL browser-side THREE.js ═══');

  if (!fs.existsSync(ARC_DB) || !fs.existsSync(MESH_DB) || !fs.existsSync(THREE_LIB)) {
    log('  (⚠ ' + ARC_DB + ' / mesh.db / three.core.min.js not found on this machine — SKIPPED, not a false pass)');
  } else {
    var SQL = await initSqlJs();
    var arc = loadDb(SQL, ARC_DB), mesh = loadDb(SQL, MESH_DB);
    DW.dwOpen(arc); // not strictly needed for _trueMidpoint but mirrors normal usage

    var els = rows(arc, "SELECT m.guid g, m.ifc_class cls, t.center_x x, t.center_y y, t.center_z z, " +
      "t.rotation_x rx, t.rotation_y ry, t.rotation_z rz, i.geometry_hash gh " +
      "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid JOIN element_instances i ON m.guid=i.guid " +
      "WHERE t.rotation_y != 0 ORDER BY m.ifc_class LIMIT 12");
    var zeros = rows(arc, "SELECT m.guid g, m.ifc_class cls, t.center_x x, t.center_y y, t.center_z z, " +
      "t.rotation_x rx, t.rotation_y ry, t.rotation_z rz, i.geometry_hash gh " +
      "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid JOIN element_instances i ON m.guid=i.guid " +
      "WHERE t.rotation_y = 0 AND m.ifc_class='IfcWall' LIMIT 3");
    log('  cases: ' + els.length + ' rotation_y≠0, ' + zeros.length + ' zero-rotation control');

    // serve a tiny ES-module test page + a COPY of the real three.core.min.js (read-only source, copied for a
    // self-contained local server -- never edited) so puppeteer can exercise the REAL renderer convention.
    var tmpRoot = fs.mkdtempSync('/tmp/w-rotconv-');
    fs.mkdirSync(path.join(tmpRoot, 'lib'));
    fs.copyFileSync(THREE_LIB, path.join(tmpRoot, 'lib', 'three.core.min.js'));
    fs.writeFileSync(path.join(tmpRoot, 'test.html'),
      '<!doctype html><html><head><script type="module">\n' +
      "import * as THREE from './lib/three.core.min.js';\n" +
      'window.__renderMidpoint = function (corners, rx, ry, rz, wx, wy, wz) {\n' +
      '  var euler = new THREE.Euler(rx || 0, rz || 0, -(ry || 0));\n' + // production convention: bonsai_library.js:78/110
      '  var q = new THREE.Quaternion().setFromEuler(euler);\n' +
      '  var mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity];\n' +
      '  corners.forEach(function(c){ var v=new THREE.Vector3(c[0],c[1],c[2]).applyQuaternion(q);\n' +
      '    v.x+=wx; v.y+=wy; v.z+=wz;\n' +
      '    if(v.x<mn[0])mn[0]=v.x; if(v.x>mx[0])mx[0]=v.x;\n' +
      '    if(v.y<mn[1])mn[1]=v.y; if(v.y>mx[1])mx[1]=v.y;\n' +
      '    if(v.z<mn[2])mn[2]=v.z; if(v.z>mx[2])mx[2]=v.z; });\n' +
      '  return {x:(mn[0]+mx[0])/2, y:(mn[1]+mx[1])/2, z:(mn[2]+mx[2])/2};\n' +
      '};\nwindow.__threeReady = true;\n</script></head><body></body></html>\n');

    var srv = await serve(tmpRoot);
    var port = srv.address().port;
    var browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    var page = await browser.newPage();
    await page.goto('http://localhost:' + port + '/test.html', { waitUntil: 'load' });
    await page.waitForFunction('window.__threeReady === true', { timeout: 10000 });

    // OLD (pre-fix) formula reproduced ONLY to prove the bug existed -- literal XYZ from (rx,ry,rz), matches
    // what build/disc_walker.js's _eulerMat3 did before this commit (git-diffable in history).
    function eulerMat3_OLD(rx, ry, rz) {
      var ca = Math.cos(rx), sa = Math.sin(rx), cb = Math.cos(ry), sb = Math.sin(ry), cc = Math.cos(rz), sc = Math.sin(rz);
      return [[cb * cc, sa * sb * cc - ca * sc, ca * sb * cc + sa * sc],
        [cb * sc, sa * sb * sc + ca * cc, ca * sb * sc - sa * cc], [-sb, sa * cb, ca * cb]];
    }
    function midpointViaR(R, corners, w) {
      var mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
      corners.forEach(function (c) {
        var wx = R[0][0] * c[0] + R[0][1] * c[1] + R[0][2] * c[2] + w.x;
        var wy = R[1][0] * c[0] + R[1][1] * c[1] + R[1][2] * c[2] + w.y;
        var wz = R[2][0] * c[0] + R[2][1] * c[1] + R[2][2] * c[2] + w.z;
        if (wx < mn[0]) mn[0] = wx; if (wx > mx[0]) mx[0] = wx;
        if (wy < mn[1]) mn[1] = wy; if (wy > mx[1]) mx[1] = wy;
        if (wz < mn[2]) mn[2] = wz; if (wz > mx[2]) mx[2] = wz;
      });
      return { x: (mn[0] + mx[0]) / 2, y: (mn[1] + mx[1]) / 2, z: (mn[2] + mx[2]) / 2 };
    }

    var maxOldDelta = 0, maxNewDelta = 0, tested = 0;
    var cases = els.concat(zeros);
    for (var i = 0; i < cases.length; i++) {
      var e = cases[i];
      var geo = rows(mesh, "SELECT vertices vb FROM component_geometries WHERE geometry_hash='" + e.gh + "'")[0];
      if (!geo || !geo.vb || !geo.vb.length) continue;
      var u8 = geo.vb instanceof Uint8Array ? geo.vb : new Uint8Array(geo.vb);
      var n3 = Math.floor(u8.byteLength / 4 / 3) * 3;
      var f32 = new Float32Array(u8.buffer, u8.byteOffset, n3);
      var lMin = [Infinity, Infinity, Infinity], lMax = [-Infinity, -Infinity, -Infinity];
      for (var k = 0; k + 2 < f32.length; k += 3) {
        for (var a = 0; a < 3; a++) { var v = f32[k + a]; if (v < lMin[a]) lMin[a] = v; if (v > lMax[a]) lMax[a] = v; }
      }
      var c8 = corners8(lMin, lMax);
      var w = { x: e.x, y: e.y, z: e.z };
      var trueMid = await page.evaluate(function (args) {
        return window.__renderMidpoint(args.c, args.rx, args.ry, args.rz, args.wx, args.wy, args.wz);
      }, { c: c8, rx: e.rx, ry: e.ry, rz: e.rz, wx: w.x, wy: w.y, wz: w.z });
      var oldMid = midpointViaR(eulerMat3_OLD(e.rx, e.ry, e.rz), c8, w);
      // NEW = the LIVE _trueMidpoint (build/disc_walker.js), fed the SAME real mesh via geoDb=mesh, i.e. the
      // actual shipping code path, not a mirror of its formula.
      var newMid = midpointViaTrueMidpoint(e.g, arc, mesh, { x: w.x, y: w.y, z: w.z, rx: e.rx, ry: e.ry, rot: e.rz });
      var oldDelta = dist(oldMid, trueMid), newDelta = newMid.verified ? dist(newMid, trueMid) : NaN;
      tested++;
      var isControl = e.ry === 0;
      log('  ' + e.cls + ' ' + e.g.slice(0, 8) + ' rx=' + e.rx.toFixed(3) + ' ry=' + e.ry.toFixed(3) + ' rz=' + e.rz.toFixed(3) +
        (isControl ? ' [control]' : '') + ' — OLDΔ=' + oldDelta.toFixed(4) + 'm NEWΔ=' + (newMid.verified ? newDelta.toFixed(8) : 'UNVERIFIED') + 'm');
      if (!isControl && oldDelta > maxOldDelta) maxOldDelta = oldDelta;
      if (newMid.verified && newDelta > maxNewDelta) maxNewDelta = newDelta;
      assert('R2b VERIFIED[' + e.g.slice(0, 8) + ']', newMid.verified, 'DW._trueMidpoint resolved real mesh');
    }

    await browser.close(); srv.close(); arc.close(); mesh.close();
    fs.rmSync(tmpRoot, { recursive: true, force: true });

    assert('R1 BUG-REPRODUCED', maxOldDelta > 1, 'max OLD-vs-TRUE delta on real rotation_y≠0 elements = ' + maxOldDelta.toFixed(4) + 'm (>1m)');
    assert('R2 FIX-CONVERGES', maxNewDelta < 1e-4, 'max LIVE-_trueMidpoint-vs-TRUE delta across ' + tested + ' real cases (incl. controls) = ' + maxNewDelta.toFixed(8) + 'm (<1e-4m)');
  }

  // ── R3 REGRESSION ──
  var suite = [
    'scripts/witness_true_midpoint.js', 'scripts/witness_dwwalk_hostbind.js', 'scripts/witness_elec_hostbind.js',
    'scripts/witness_hostbind_agnostic.js', 'scripts/witness_shim_select.js', 'scripts/witness_walkback_mep.js',
    'build/witness_disc_walk_generalize.js', 'build/witness_disc_walk_duplex_generalize.js',
    'scripts/witness_generalize_xbuild.js', 'scripts/witness_rule_connector.js', 'build/witness_disc_walk_density.js',
    'scripts/witness_occ_true_midpoint.js', 'scripts/witness_terminal_geosplit.js'
  ];
  suite.forEach(function (script) {
    try {
      var out = execSync('node ' + script, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      var nFail = (out.match(/❌/g) || []).length;
      assert('R3 REGRESSION [' + script + ']', nFail === 0, nFail + ' failing assertions');
    } catch (e) {
      var out2 = (e.stdout || '') + (e.stderr || '');
      var nFail2 = (out2.match(/❌/g) || []).length;
      assert('R3 REGRESSION [' + script + ']', false, script + ' threw/non-zero exit — ' + (nFail2 ? nFail2 + ' fails' : e.message.split('\n')[0]));
    }
  });

  log('═══ SUMMARY: ' + pass + ' pass, ' + fail + ' fail ═══');
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  console.log('log: ' + LOG);
  process.exit(fail === 0 ? 0 : 1);
})();
