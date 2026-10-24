// Film recorder: "The Server is Dead - the Modeller, part 3: a real building" (TEAMWORK_FRAMEWORK §15.14, retake §15.15.4: the ONE Team icon + built-in avatars).
// Two real browser contexts = User A / User B, ONE fresh space; both open the REAL HHS Office ARC model (1077 seeded elements) in the real modeller.html?team=1.
// Wings: north / west / south of the C-shaped Level-1 footprint (numbers: slab extents in modeller/HHS_ARC.db). A works the north wing; B the west and south wings.
// Shared = what the team DRAWS (blocks, made by the Modeller's own command) and MOVES (real gizmo drags). The seeded building is the common base: moving one of its walls stays local-only.
// View-only film aids (never model state): renderer clipping plane z=3.8 (floors above Level 1 hidden), camera, wing labels, a pointer disc. Selection = Bonsai.select (the Modeller's own call), as the witness does.
'use strict';
var fs = require('fs'), path = require('path');
var L = require('./lib.js'), sleep = L.sleep;
var pw = require('/home/red1/bim-ootb/tests/node_modules/playwright');
var OUT = process.argv[2] || path.join(__dirname, 'rec1');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
var W = 960, H = 640;
var cues = [], states = [], T0 = 0, names = {}, extra = {};
function now() { return (Date.now() - T0) / 1000; }
function cue(name, x) { var t = now(); cues.push({ name: name, t: +t.toFixed(3) }); console.log('§FILM_CUE ' + name + ' t=' + t.toFixed(2) + (x ? ' ' + x : '')); return t; }
var BLURCSS = '(function(){document.addEventListener("DOMContentLoaded",function(){var s=document.createElement("style");s.textContent="#tp-link,#tp-inv,#tp-token,input[type=password]{filter:blur(8px)!important}";document.head.appendChild(s)})})()';
var CURSOR = '(function(){var d;function mk(){if(d||!document.documentElement)return;d=document.createElement("div");d.style.cssText="position:fixed;width:20px;height:20px;border-radius:50%;background:rgba(255,196,60,.8);border:2px solid #fff;pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);left:-60px;top:-60px;box-shadow:0 0 6px #000";document.documentElement.appendChild(d)}'
  + 'function mv(e){mk();if(!d)return;d.style.left=e.clientX+"px";d.style.top=e.clientY+"px"}'
  + 'window.addEventListener("pointermove",mv,true);window.addEventListener("mousemove",mv,true);window.addEventListener("pointerdown",function(e){mv(e);if(d){d.style.background="rgba(255,70,50,.9)";d.style.width=d.style.height="14px"}},true);'
  + 'window.addEventListener("pointerup",function(e){if(d){d.style.background="rgba(255,196,60,.8)";d.style.width=d.style.height="20px"}},true);document.addEventListener("DOMContentLoaded",mk)})()';
// wings of the Level-1 footprint (metres, world frame = IFC frame): north y >= 31, south y <= -3.5, west = the rest (x < -3.5)
function wingOf(x, y) { return y >= 31 ? 'north' : (y <= -3.5 ? 'south' : 'west'); }
var GEO = process.env.HOME + '/.cache/bim-modeller-geo/v3_HHS_geo.db';
// the five team blocks (x0, y0, w, h in metres; depth = height)
var AVATAR = { A: 'a02', B: 'a12' };   // what the two people pick in the panel (real clicks on the grid)
var BLOCKS = [
  { name: 'N1', who: 'A', x: 2, y: 37, w: 4.8, h: 1.4, d: 1.0 }, { name: 'N2', who: 'A', x: 12, y: 38, w: 2, h: 2, d: 1.0 },
  { name: 'W1', who: 'B', x: -10, y: 12, w: 2, h: 4, d: 1.0 }, { name: 'S1', who: 'B', x: 28, y: -9.6, w: 5, h: 1.4, d: 1.0 }, { name: 'S2', who: 'B', x: 40, y: -10, w: 2, h: 2, d: 1.0 }];

(async function () {
  var S = await L.start(), base = S.base;
  var browser = await pw.chromium.launch({ args: ['--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  var logs = { A: [], B: [] }, pg = {}, ctx = {}, errors = 0, fallbacks = 0;
  for (var w of ['A', 'B']) {
    ctx[w] = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: path.join(OUT, 'vid' + w), size: { width: W, height: H } } });
    await ctx[w].route('https://api.github.com/**', S.fakeGh);
    await ctx[w].route('https://objectstorage.ap-kulai-2.oraclecloud.com/**', function (r) { var u = r.request().url();   // the geometry file of the resident, from the local cache (same bytes the OCI bucket serves)
      if (/HHS_geo\.db/.test(u)) r.fulfill({ status: 200, body: fs.readFileSync(GEO), headers: { 'access-control-allow-origin': '*', 'content-type': 'application/octet-stream' } }); else r.abort(); });
    await ctx[w].addInitScript(CURSOR); await ctx[w].addInitScript(BLURCSS); pg[w] = await ctx[w].newPage();
    (function (x) { pg[x].on('console', function (m) { var t = m.text(); logs[x].push({ t: now(), s: t }); if (/§TEAM_|§COMM_SYNC|§PEOPLE_VIEW|§ARC-SEED /.test(t)) console.log('   [' + x + '] ' + t.slice(0, 230)); });
      pg[x].on('pageerror', function (e) { errors++; console.log('   [' + x + '] 🔴 PAGEERR ' + e.message); logs[x].push({ t: now(), s: 'PAGEERR ' + e.message }); }); pg[x].on('dialog', function (d) { d.accept().catch(function () {}); }); })(w);
  }
  T0 = Date.now(); var both = function (fn) { return Promise.all(['A', 'B'].map(function (w) { return fn(w); })); };
  await both(function (w) { return pg[w].goto('data:text/html,<body style="margin:0;background:%23000"></body>'); }); await sleep(1500);
  await both(function (w) { return pg[w].evaluate(function () { document.body.style.background = '#fff'; }); }); cue('pulse_white'); await sleep(1000);
  await both(function (w) { return pg[w].evaluate(function () { document.body.style.background = '#000'; }); }); cue('pulse_end'); await sleep(900);

  // ── helpers ──
  async function glide(w, x, y, steps) { await pg[w].mouse.move(x, y, { steps: steps || 14 }); }
  async function clickEl(w, sel) { await pg[w].locator(sel).first().scrollIntoViewIfNeeded().catch(function () {}); var b = await pg[w].locator(sel).first().boundingBox(); await glide(w, b.x + b.width / 2, b.y + b.height / 2); await sleep(250); await pg[w].mouse.down(); await sleep(90); await pg[w].mouse.up(); }
  async function blur(w) { await pg[w].addStyleTag({ content: '#invite,#invite-link,#token,#pb-url,#pb-secret,input[type=password]{filter:blur(9px)!important}' }); }
  async function ready(p) { await p.waitForSelector('body[data-ready="1"]', { timeout: 120000 }); }
  async function press(w, sel) { await clickEl(w, sel); await ready(pg[w]); }
  async function waitLog(w, re, from, ms) { var t0 = Date.now(); while (Date.now() - t0 < ms) { var l = logs[w].slice(from).find(function (x) { return re.test(x.s); }); if (l) return l.s; await sleep(120); } return null; }
  async function settleCam(w) { var last = null, n = 0; for (var k = 0; k < 40; k++) { var p = await pg[w].evaluate(function () { var c = window.A.camera, t = window.A.controls.target; return [c.position.x, c.position.y, c.position.z, t.x, t.y, t.z].map(function (v) { return v.toFixed(3); }).join(','); }); if (p === last) { n++; if (n >= 3) return; } else n = 0; last = p; await sleep(100); } }
  var r3 = function (a) { return a && a.map(function (v) { return Math.round(v * 1000) / 1000; }); };
  async function blocksOf(w) {   // the TEAM blocks only (parentless GEOM_EXTRUDE_POLY rows), centre from the live mesh, net offset from moveDeltaFor
    return pg[w].evaluate(function () {
      var O = window.Bonsai.oplog, r = O.db.exec("SELECT id, op_uuid, undone FROM kernel_ops WHERE op_type='GEOM_EXTRUDE_POLY' ORDER BY id"), rows = [];
      if (r.length) r[0].values.forEach(function (v) { if (!v[2]) rows.push({ id: v[0], uu: v[1] }); });
      var g = window.Bonsai.group(), T = window.THREE, boxes = {};
      g.children.forEach(function (m) { if (!m.isMesh || m.userData.featureId == null) return; var b = new T.Box3().setFromObject(m), k = m.userData.featureId; if (boxes[k]) boxes[k].union(b); else boxes[k] = b; });
      return rows.map(function (x) { var b = boxes[x.id], c = b ? b.getCenter(new T.Vector3()) : null, d = O.moveDeltaFor(x.id); return { id: x.id, uu: x.uu, centre: c ? [c.x, c.y, c.z] : null, off: [d.dx, d.dy, d.dz] }; });
    });
  }
  async function conflicts(w) { return pg[w].evaluate(async function () { var cf = await window.TeamSyncModeller.store().conflicts(); return cf.length; }); }
  async function chip(w) { return pg[w].evaluate(function () { var c = document.getElementById('team-chip'); return c ? { conflicts: Number(c.getAttribute('data-conflicts')), localonly: Number(c.getAttribute('data-localonly')) } : null; }); }
  async function banner(w) { return pg[w].evaluate(function () { var b = document.getElementById('team-headsup'); if (!b) return null; var r = b.getBoundingClientRect(); var av = b.querySelector('.tp-avatar'); return { text: b.textContent.replace(/\s+/g, ' ').trim(), av: av ? av.getAttribute('data-avatar') : null, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }; }); }
  async function peopleRows(w) { return pg[w].evaluate(function () { var p = document.getElementById('team-people'); if (!p || getComputedStyle(p).display === 'none') return null;
    return Array.prototype.map.call(p.querySelectorAll('.tp-person'), function (r) { return { name: r.querySelector('.tp-name').textContent.trim(), active: (r.querySelector('.tp-active') || {}).textContent, self: r.getAttribute('data-self') === '1', off: r.getAttribute('data-off') === '1', badges: r.querySelectorAll('.tp-badge').length, text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 140) }; }); }); }
  async function wallPos(w, id) { return pg[w].evaluate(function (i) { var T = window.THREE, m = window.Bonsai.meshFor(i); if (!m) return null; var b = new T.Box3().setFromObject(m), c = b.getCenter(new T.Vector3()), d = window.Bonsai.oplog.moveDeltaFor(i); return { centre: [c.x, c.y, c.z], off: [d.dx, d.dy, d.dz] }; }, id); }
  async function state(beat, extraFn) {
    var t = now(), out = {};
    for (var w of ['A', 'B']) {
      var bl = await blocksOf(w), ch = await chip(w), cf = await conflicts(w), bn = await banner(w), el = {};
      bl.forEach(function (x) { var nm = names[x.uu] || ('?' + x.id); el[nm] = { wing: x.centre ? wingOf(x.centre[0], x.centre[1]) : null, centre: r3(x.centre), off: r3(x.off) }; });
      var rec = { t: +t.toFixed(2), beat: beat, who: w, el: el, conf: cf, chipConflicts: ch.conflicts, chipLocalOnly: ch.localonly, banner: bn && bn.text };
      if (extraFn) Object.assign(rec, await extraFn(w));
      states.push(rec); out[w] = rec; console.log('§FILM_STATE t=' + rec.t + ' beat=' + beat + ' who=' + w + ' ' + JSON.stringify(rec));
    }
    return out;
  }
  function pstate(beat, who, lines) { var t = now(); states.push({ t: +t.toFixed(2), beat: beat, who: who, lines: lines, el: {}, conf: 0, chipConflicts: 0, chipLocalOnly: 0 }); console.log('§FILM_STATE t=' + t.toFixed(2) + ' beat=' + beat + ' who=' + who + ' ' + JSON.stringify(lines)); }   // readings of the pairing / avatar part (no blocks yet): the lines the film prints under the pane
  var vn = 0;
  async function visit(w) { var k = ++vn, n0 = logs[w].length; cue('V' + k + '_' + w + '_in'); await clickEl(w, '#team-visit'); var l = await waitLog(w, /§TEAM_VISIT /, n0, 90000); cue('V' + k + '_' + w + '_got'); await pg[w].evaluate(function () { return window.TeamSyncModeller.settle(); }); await sleep(700); cue('V' + k + '_' + w + '_out'); return l; }
  async function overview(w) {   // camera only + the film's block markers (one ring per team block that THIS window holds, at its live centre)
    var bl = await blocksOf(w), mk = bl.filter(function (x) { return x.centre; }).map(function (x) { var nm = names[x.uu] || '?', def = BLOCKS.filter(function (b) { return b.name === nm; })[0]; return { x: x.centre[0], y: x.centre[1], z: x.centre[2], name: nm, who: def ? def.who : '?' }; });
    await pg[w].evaluate(function (o) { var mk = o.mk, av = o.av; window.__filmMarks = mk; window.__filmAvatars = av; var A = window.A, c = A.camera, t = A.controls.target; c.position.set(20, -6, 80); t.set(20, 14, 0); A.controls.update(); if (A.requestRender) A.requestRender(); }, { mk: mk, av: AVATAR }); await sleep(450); }
  async function viewOn(w, c) { await pg[w].evaluate(function (c) { var A = window.A; A.camera.position.set(c[0], c[1] - 1.8, c[2] + 8.6); A.controls.target.set(c[0], c[1], c[2]); A.controls.update(); if (A.requestRender) A.requestRender(); }, c); await sleep(450); }
  async function command(w, b) {
    var id = await pg[w].evaluate(async function (a) { var c = await window.Bonsai.oplog.commit({ op_type: 'GEOM_EXTRUDE_POLY', parameters: { profile: { points: [[a.x, a.y], [a.x + a.w, a.y], [a.x + a.w, a.y + a.h], [a.x, a.y + a.h]] }, depth: a.d } }); await window.TeamSyncModeller.settle(); return c && c.id; }, b);
    var uu = await pg[w].evaluate(function (i) { return window.Bonsai.oplog.db.exec("SELECT op_uuid FROM kernel_ops WHERE id=" + i)[0].values[0][0]; }, id); names[uu] = b.name; return { id: id, uu: uu };
  }
  async function idOf(w, nm) { var bl = await blocksOf(w); var x = bl.filter(function (y) { return names[y.uu] === nm; })[0]; return x; }
  async function selectApi(w, id) { await pg[w].evaluate(function (i) { window.Bonsai.select(i); }, id); await sleep(500); }
  async function deselect(w) { await pg[w].evaluate(function () { window.Bonsai.select(null); }); await sleep(500); }
  async function project(w, id, off) { return pg[w].evaluate(function (a) { var T = window.THREE, cam = window.A.camera, cv = document.getElementById('c'), r = cv.getBoundingClientRect();
    var m = window.Bonsai.meshFor(a.i), b = new T.Box3().setFromObject(m), c = b.getCenter(new T.Vector3()); var v = new T.Vector3(c.x + a.off[0], c.y + a.off[1], c.z + a.off[2]).project(cam); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, { i: id, off: off }); }
  var gn = 0, drags = [], isoCount = {};
  async function gizmoDrag(w, id, axis, dist, label, iso) {   // select with the Modeller's own call, Move mode, then a REAL gizmo drag; returns the offset before/after and whether the op was sent
    var g = ++gn, n0 = logs[w].length; cue('G' + g + '_' + w + '_sel_in');
    await selectApi(w, id); await clickEl(w, '#b-move'); await sleep(300);
    var cen = await pg[w].evaluate(function (i) { var T = window.THREE, b = new T.Box3().setFromObject(window.Bonsai.meshFor(i)), c = b.getCenter(new T.Vector3()); return [c.x, c.y, c.z]; }, id);
    await viewOn(w, cen); await settleCam(w); if (iso) await isolateWall(w, iso.id, iso.x, iso.y0, iso.y1, iso.z); cue('G' + g + '_' + w + '_sel_done');   // iso: the dragged wall alone, bright, with a dashed line where it started — so the drag READS as a drag
    var A3 = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];   // grab the axis SHAFT where the gizmo really has it (its own mesh, read from the scene), release at shaft + dist
    var hp = await pg[w].evaluate(function (a) { var T = window.THREE, best = null; window.A.scene.updateMatrixWorld(true);
      window.A.scene.traverse(function (o) { if (o.isMesh && o.userData && o.userData.moveAxis === a.axis) { var b = new T.Box3().setFromObject(o), c = b.getCenter(new T.Vector3()), d = Math.hypot(c.x - a.c[0], c.y - a.c[1], c.z - a.c[2]); if (!best || d < best.d) best = { d: d, c: [c.x, c.y, c.z] }; } }); return best; }, { axis: axis, c: cen });
    if (!hp) throw new Error('no gizmo shaft for axis ' + axis);
    var scr = async function (pt) { return pg[w].evaluate(function (p) { var T = window.THREE, cam = window.A.camera, r = document.getElementById('c').getBoundingClientRect(), v = new T.Vector3(p[0], p[1], p[2]).project(cam); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, pt); };
    var p1 = await scr(hp.c), p2 = await scr([hp.c[0] + A3[0] * dist, hp.c[1] + A3[1] * dist, hp.c[2] + A3[2] * dist]);
    console.log('§FILM_GRAB who=' + w + ' ' + label + ' axis=' + axis + ' shaft@' + JSON.stringify(r3(hp.c)) + ' distFromCentre=' + hp.d.toFixed(2));
    var before = await pg[w].evaluate(function (i) { var d = window.Bonsai.oplog.moveDeltaFor(i); return [d.dx, d.dy, d.dz]; }, id); cue('G' + g + '_' + w + '_gest_in');
    await glide(w, p1[0], p1[1]); await sleep(250); cue('G' + g + '_' + w + '_down'); await pg[w].mouse.down(); await sleep(120);
    for (var k = 1; k <= 14; k++) { await pg[w].mouse.move(p1[0] + (p2[0] - p1[0]) * k / 14, p1[1] + (p2[1] - p1[1]) * k / 14); await sleep(70); }
    await sleep(300); await pg[w].mouse.up(); cue('G' + g + '_' + w + '_up'); await sleep(600);
    var out = await waitLog(w, /§TEAM_OUT op=GEOM_MOVE/, n0, 15000), lo = out ? null : await waitLog(w, /§TEAM_LOCALONLY op=GEOM_MOVE/, n0, 6000);
    await pg[w].evaluate(function () { return window.TeamSyncModeller.settle(); }); await sleep(500);
    var after = await pg[w].evaluate(function (i) { var d = window.Bonsai.oplog.moveDeltaFor(i); return [d.dx, d.dy, d.dz]; }, id); cue('G' + g + '_' + w + '_out');
    console.log('§FILM_DRAG who=' + w + ' ' + label + ' axis=' + axis + ' asked=' + dist + ' offsetBefore=' + JSON.stringify(r3(before)) + ' offsetAfter=' + JSON.stringify(r3(after)) + ' sent=' + (out ? out.slice(0, 90) : (lo ? 'LOCAL-ONLY ' + lo.slice(0, 120) : 'NOT SENT')));
    await pg[w].keyboard.press('Escape'); await sleep(250); await deselect(w); if (!iso) await overview(w);
    var res = { who: w, label: label, axis: axis, asked: dist, before: before, after: after, sent: !!out, local: !!lo, nLocal: logs[w].slice(n0).filter(function (x) { return /§TEAM_LOCALONLY op=GEOM_MOVE/.test(x.s); }).length }; drags.push(res); return res;
  }
  // film aids on a freshly opened Modeller: section clip (view only), folded outliner, wing labels that follow the camera
  async function filmAids(w) {
    await pg[w].click('#ol-collapse').catch(function () {}); await sleep(400);
    await pg[w].addStyleTag({ content: '#s9-erp-btn{display:none!important}' });   // film aid: the Project Order button (unrelated) sits exactly where the heads-up label appears at 960 px
    await pg[w].evaluate(function () {
      var A = window.A, T = window.THREE; A.renderer.localClippingEnabled = true; A.renderer.clippingPlanes = [new T.Plane(new T.Vector3(0, 0, -1), 3.8)];
      var defs = [['NORTH WING  ·  A', 8, 46, '#ffd9a0'], ['WEST WING  ·  B', -21, 24, '#a8dcff'], ['SOUTH WING  ·  B', 30, -17.5, '#a8dcff']], root = document.createElement('div'); root.id = 'film-wings'; root.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:40';
      document.body.appendChild(root); var els = defs.map(function (d) { var e = document.createElement('div'); e.style.cssText = 'position:fixed;transform:translate(-50%,-50%);font:700 20px "Liberation Sans Narrow",sans-serif;letter-spacing:1px;color:' + d[3] + ';text-shadow:0 0 4px #000,0 0 8px #000;white-space:nowrap'; e.textContent = d[0]; root.appendChild(e); return e; });
      var mroot = document.createElement('div'); mroot.id = 'film-marks'; mroot.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:39'; document.body.appendChild(mroot); var mels = [];
      var ref = document.createElement('div'); ref.style.cssText = 'position:fixed;display:none;border-left:3px dashed #ffd24d;transform-origin:0 0;pointer-events:none;z-index:41'; var refl = document.createElement('div'); refl.style.cssText = 'position:fixed;display:none;font:700 17px "Liberation Sans Narrow",sans-serif;color:#ffd24d;text-shadow:0 0 3px #000,0 0 6px #000;white-space:nowrap;pointer-events:none;z-index:41'; mroot.appendChild(ref); mroot.appendChild(refl);
      (function tick() {
        var rf = window.__filmRef; if (rf) { var cr = document.getElementById('c').getBoundingClientRect(), pp = [rf.p0, rf.p1].map(function (p) { var v = new T.Vector3(p[0], p[1], p[2]).project(A.camera); return [cr.left + (v.x + 1) / 2 * cr.width, cr.top + (1 - v.y) / 2 * cr.height]; }), dx = pp[1][0] - pp[0][0], dy = pp[1][1] - pp[0][1]; ref.style.display = 'block'; ref.style.left = pp[0][0] + 'px'; ref.style.top = pp[0][1] + 'px'; ref.style.height = Math.hypot(dx, dy) + 'px'; ref.style.transform = 'rotate(' + (Math.atan2(-dx, dy) * 180 / Math.PI) + 'deg) '; refl.style.display = 'block'; refl.style.left = (pp[0][0] + 12) + 'px'; refl.style.top = (pp[0][1] - 30) + 'px'; refl.textContent = rf.text; } else { ref.style.display = 'none'; refl.style.display = 'none'; }
        var mk = window.__filmMarks || [], cam0 = A.camera, cv0 = document.getElementById('c'), r0 = cv0.getBoundingClientRect(), far0 = cam0.position.z > 40;
        while (mels.length < mk.length) { var e = document.createElement('div'); e.style.cssText = 'position:fixed;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;box-sizing:border-box;overflow:visible'; var av = document.createElement('div'); av.style.cssText = 'width:40px;height:40px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px #fff,0 0 8px 2px #000'; e.appendChild(av); var l = document.createElement('div'); l.style.cssText = 'position:absolute;left:50%;top:-20px;transform:translateX(-50%);font:700 15px "Liberation Sans Narrow",sans-serif;text-shadow:0 0 3px #000,0 0 6px #000;white-space:nowrap;color:#fff'; e.appendChild(l); mroot.appendChild(e); mels.push(e); }
        mels.forEach(function (e, i) { var m = mk[i]; if (!m || !far0) { e.style.display = 'none'; return; } var v = new T.Vector3(m.x, m.y, m.z).project(cam0), col = m.who === 'A' ? '#ffb35c' : '#6cc6ff';
          e.style.display = 'block'; e.style.left = (r0.left + (v.x + 1) / 2 * r0.width) + 'px'; e.style.top = (r0.top + (1 - v.y) / 2 * r0.height) + 'px'; e.lastChild.style.color = col; e.lastChild.textContent = m.name;
          if (e.getAttribute('data-who') !== m.who) { e.setAttribute('data-who', m.who); var id = (window.__filmAvatars || {})[m.who]; e.firstChild.innerHTML = (id && window.TeamAvatars) ? window.TeamAvatars.svg(id, 40) : ''; e.firstChild.style.boxShadow = '0 0 0 3px ' + col + ',0 0 8px 2px #000'; } });
         var cam = A.camera, cv = document.getElementById('c'), r = cv.getBoundingClientRect(), far = cam.position.z > 40;
        defs.forEach(function (d, i) { var v = new T.Vector3(d[1], d[2], 0.5).project(cam); els[i].style.display = far ? 'block' : 'none'; els[i].style.left = (r.left + (v.x + 1) / 2 * r.width) + 'px'; els[i].style.top = (r.top + (1 - v.y) / 2 * r.height) + 'px'; });
        requestAnimationFrame(tick); })();
    });
  }
  async function isolateWall(w, id, x, y0, y1, z) {   // close-up aid (view only): every mesh but the wall hidden (walks nested groups); the wall drawn bright; a dashed line where the wall STARTED
    var r = await pg[w].evaluate(function (a) { var g = window.Bonsai.group(), T = window.THREE, vis = 0, tot = 0;
      g.traverse(function (o) { if (!o.isMesh) return; tot++; var f = o.userData && o.userData.featureId, p = o; while (f == null && p.parent && p.parent !== g) { p = p.parent; f = p.userData && p.userData.featureId; }
        o.visible = (f === a.id); if (o.visible) { vis++; if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.set(0x5ec8ff); if (o.material.emissive) o.material.emissive.set(0x1a5a80); } } });
      window.__filmMarks = []; window.__filmRef = { p0: [a.x, a.y0, a.z], p1: [a.x, a.y1, a.z], text: 'where the wall started' }; if (window.A.requestRender) window.A.requestRender(); return { vis: vis, tot: tot }; }, { id: id, x: x, y0: y0, y1: y1, z: z });
    console.log('§FILM_ISOLATE who=' + w + ' wall=' + id + ' visibleMeshes=' + r.vis + ' of ' + r.tot); isoCount[w] = r; await sleep(500);
  }
  async function loadPlain(w, url) {   // the Modeller as a user opens it: no ?team=1, nothing but the page (and, for B, the invite link)
    await pg[w].goto(url, { waitUntil: 'load' });
    await pg[w].waitForFunction(function () { return window.Bonsai && window.Bonsai.oplog && window.KernelOps && window.Bonsai.group && window.A && window.A.camera && window.TeamPanel; }, null, { timeout: 90000 }); await sleep(900);
  }
  async function iconState(w) { return pg[w].evaluate(function () { var b = document.getElementById('b-teams'); return b ? { st: b.getAttribute('data-team-state'), pressed: b.getAttribute('aria-pressed'), n: document.querySelectorAll('#b-teams').length, toggle: !!document.getElementById('team-people-toggle') } : null; }); }
  async function openPanelViaIcon(w) {   // enrolled: icon -> popover -> "Team settings" -> panel; not enrolled: icon -> panel
    await clickEl(w, '#b-teams'); await sleep(500);
    if (await pg[w].locator('#tp-settings').count()) { await sleep(700); await clickEl(w, '#tp-settings'); }
    await pg[w].waitForSelector('#team-panel', { timeout: 30000 }); await sleep(500);
  }
  async function closePanel(w) { await clickEl(w, '#tp-close'); await sleep(300); }
  async function openHHS(w) {
    cue('OPEN_' + w + '_in'); var n0 = logs[w].length; await clickEl(w, '#b-open'); await sleep(500); await clickEl(w, '#m-open-panel .mo-row[data-key="HHS"]');
    var l = await waitLog(w, /§ARC-SEED building=HHS/, n0, 90000); await sleep(3500); await filmAids(w); await overview(w); await settleCam(w); cue('OPEN_' + w + '_out'); return l;
  }

  // ═══ THE ONE TEAM ICON (§15.15.1): turn on -> Start a team -> invite -> Join -> Approve -> Visit -> pick avatars ═══
  var MOD = base + '/modeller/modeller.html?pipe=' + encodeURIComponent(S.PIPE);
  cue('S_load_in'); await both(function (w) { return loadPlain(w, MOD); }); var st0 = { A: await iconState('A'), B: await iconState('B') }; console.log('§FILM_ICON before ' + JSON.stringify(st0)); await sleep(1200); cue('S_load_out');
  cue('P_icon_in'); await clickEl('A', '#b-teams'); await pg.A.waitForSelector('#team-panel', { timeout: 30000 }); await sleep(2600);
  var panelOff = await pg.A.evaluate(function () { return { state: document.getElementById('tp-state').textContent, mode: document.getElementById('tp-mode').textContent, found: !!document.getElementById('tp-found') }; }); console.log('§FILM_PANEL off ' + JSON.stringify(panelOff)); pstate('panel_off', 'A', ['Team icon: off · the panel says: ' + panelOff.state]); cue('P_icon_out');
  cue('P_on_in'); var navP = pg.A.waitForNavigation({ waitUntil: 'load', timeout: 60000 }); await clickEl('A', '#tp-mode'); await navP;
  await pg.A.waitForFunction(function () { return window.Bonsai && window.Bonsai.oplog && window.TeamPanel; }, null, { timeout: 90000 }); await pg.A.waitForSelector('#tp-found', { timeout: 60000 }); await sleep(2400);
  var panelOn = await pg.A.evaluate(function () { return { state: document.getElementById('tp-state').textContent, found: !!document.getElementById('tp-found'), join: !!document.getElementById('tp-join'), grid: document.querySelectorAll('.tp-av-pick').length }; }); console.log('§FILM_PANEL on ' + JSON.stringify(panelOn)); pstate('panel_on', 'A', ['team mode on · panel reopened by itself', 'Start a team / Join · avatar grid: ' + panelOn.grid + ' characters']); cue('P_on_out');
  cue('P_found_in'); await clickEl('A', '#tp-found'); await pg.A.waitForSelector('#tp-paired', { timeout: 60000 }); await sleep(2600);
  var inviteLink = await pg.A.inputValue('#tp-link'), stFound = await iconState('A'); console.log('§FILM_PANEL founded icon=' + JSON.stringify(stFound) + ' linkTail=' + inviteLink.slice(-12)); pstate('found', 'A', ['Team icon: ' + stFound.st + ' (aria-pressed ' + stFound.pressed + ')', 'team devices 1 · A is the founder']); cue('P_found_out'); await closePanel('A');
  cue('P_join_in'); await pg.B.goto(inviteLink, { waitUntil: 'load' });
  await pg.B.waitForFunction(function () { return window.Bonsai && window.Bonsai.oplog && window.TeamPanel; }, null, { timeout: 90000 }); await pg.B.waitForSelector('#tp-join', { timeout: 60000 }); await sleep(2000);
  var invPre = await pg.B.inputValue('#tp-inv'); await clickEl('B', '#tp-join');
  if (process.env.FILM_DEBUG_JOIN) { await sleep(4000); console.log('§FILM_DEBUG B pairsec=' + JSON.stringify(await pg.B.evaluate(function () { var p = document.getElementById('tp-pairsec'); var b = document.getElementById('tp-join'); var r = b && b.getBoundingClientRect(); return { text: p && p.innerText, joinDisabled: b && b.disabled, rect: r && [r.left, r.top, r.width, r.height], inv: document.getElementById('tp-inv').value.length }; })) + ' lastMouse=' + JSON.stringify(await pg.B.evaluate(function () { return null; }))); process.exit(0); }
  await pg.B.waitForSelector('#tp-code', { timeout: 60000 }); await sleep(2400);
  var code = (await pg.B.textContent('#tp-code')).trim(), stJoin = await iconState('B'); console.log('§FILM_PAIR B code=' + code + ' icon=' + JSON.stringify(stJoin) + ' invitePrefilled=' + (invPre === inviteLink.split('#join=')[1])); pstate('joined', 'B', ['invite prefilled: ' + (invPre === inviteLink.split('#join=')[1]) + ' · device code ' + code, 'Team icon: ' + stJoin.st + ' (waiting for approval)']); cue('P_join_out'); await closePanel('B');
  cue('P_approve_in'); await openPanelViaIcon('A'); await clickEl('A', '#tp-req'); await pg.A.waitForSelector('#tp-reqs .tp-request', { timeout: 30000 }); await sleep(2200);
  var reqCodes = await pg.A.$$eval('#tp-reqs .tp-rcode', function (els) { return els.map(function (e) { return e.textContent.trim(); }); }); console.log('§FILM_PAIR A sees requests=' + JSON.stringify(reqCodes)); pstate('approve', 'A', ['join requests listed: ' + reqCodes.join(', ') + ' (B\'s code ' + code + ')', 'role: Team member (102)']);
  await clickEl('A', '#tp-reqs .tp-approve'); await pg.A.waitForSelector('#tp-paired', { timeout: 60000 }); await sleep(1800); cue('P_approve_out'); await closePanel('A');
  var vB = await visit('B'); await sleep(1200); var stBon = await iconState('B'), chipA = await pg.A.evaluate(function () { return document.getElementById('team-label').textContent; }), chipB = await pg.B.evaluate(function () { return document.getElementById('team-label').textContent; });
  pstate('paired', 'A', [chipA, 'Team icon: on']); pstate('paired', 'B', [chipB, 'Team icon: ' + stBon.st + ' (aria-pressed ' + stBon.pressed + ')']);
  console.log('§FILM_PAIR after B visit: iconB=' + JSON.stringify(stBon) + ' chipA=' + chipA + ' chipB=' + chipB);
  // avatars: each person picks one in the panel (real clicks); the choice reaches the other at the next Visit
  async function pickAvatar(w) { cue('AV_' + w + '_in'); await openPanelViaIcon(w); await sleep(1500); await clickEl(w, '.tp-av-pick[data-avatar="' + AVATAR[w] + '"]'); await sleep(1800); var pr = await pg[w].evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('.tp-av-pick[aria-pressed="true"]'), function (b) { return b.getAttribute('data-avatar'); }); }); console.log('§FILM_AVATAR ' + w + ' picked=' + JSON.stringify(pr)); cue('AV_' + w + '_out'); await closePanel(w); return pr; }
  var pickedA = await pickAvatar('A'), pickedB = await pickAvatar('B');
  await visit('A'); await visit('B'); await visit('A');
  // People popover from the ONE icon, B's window: both people with the avatars they chose
  cue('S_people_in'); await clickEl('B', '#b-teams'); await pg.B.waitForSelector('#team-people .tp-person', { timeout: 20000 }); await sleep(1500);
  var pplRows = await pg.B.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('#team-people .tp-person'), function (r) { return { person: r.getAttribute('data-person'), self: r.getAttribute('data-self') === '1', av: r.querySelector('.tp-avatar').getAttribute('data-avatar'), text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) }; }); });
  console.log('§FILM_PEOPLE B ' + JSON.stringify(pplRows)); pstate('people', 'B', pplRows.map(function (r) { return (r.self ? 'you (B)' : 'A') + ': avatar ' + r.av + ' · ' + (/active ([^·]*?)(\s|$)/.exec(r.text) ? 'active' : r.text.slice(0, 40)); })); pstate('people', 'A', ['A chose ' + AVATAR.A + ' · B chose ' + AVATAR.B]); await sleep(4200); cue('S_people_out'); await clickEl('B', '#b-teams'); await sleep(400);
  extra.spaceShort = inviteLink.split('#join=')[1].slice(0, 12);   // the space both windows are in (from the invite A made); printed in the film's note line
  extra.pairing = { st0: st0, panelOff: panelOff, panelOn: panelOn, stFound: stFound, stJoin: stJoin, invitePrefilled: invPre === inviteLink.split('#join=')[1], code: code, reqCodes: reqCodes, stBon: stBon, chipA: chipA, chipB: chipB, pickedA: pickedA, pickedB: pickedB, pplRows: pplRows };

  // ═══ OPEN THE BUILDING (both) ═══
  var seedA = await openHHS('A'), seedB = await openHHS('B');
  console.log('§FILM_SEED A ' + (seedA || 'NO LINE').slice(0, 160)); console.log('§FILM_SEED B ' + (seedB || 'NO LINE').slice(0, 160));
  var rowsOf = async function (w) { return pg[w].evaluate(function () { var r = window.Bonsai.oplog.db.exec("SELECT gid,count(*) FROM kernel_ops GROUP BY gid")[0].values; return r; }); };
  var rA = await rowsOf('A'), rB = await rowsOf('B'); extra.seedRows = { A: rA, B: rB }; console.log('§FILM_ROWS A ' + JSON.stringify(rA) + ' B ' + JSON.stringify(rB));
  cue('S_wings_in'); await state('opened'); await sleep(3200); cue('S_wings_out');

  // ═══ DRAW: A the north wing (N1, N2), B the west + south wings (W1, S1, S2) — the model's own command ═══
  cue('S_drawA_in');
  for (var b of BLOCKS.filter(function (x) { return x.who === 'A'; })) { await command('A', b); await sleep(500); }
  await overview('A'); await state('A_drew_north_before_visit'); await sleep(2200); cue('S_drawA_out');
  cue('S_drawB_in');
  for (var b2 of BLOCKS.filter(function (x) { return x.who === 'B'; })) { await command('B', b2); await sleep(500); }
  await overview('B'); await state('B_drew_west_south_before_visit'); await sleep(2600); cue('S_drawB_out');
  cue('S_visit1_in'); await visit('A'); await visit('B'); await visit('A'); await both(overview); await state('visits1_all_five'); await sleep(2800); cue('S_visit1_out');

  // ═══ PARALLEL MOVES in three wings, no Visit between: A N1 x+1 · B S1 x-1 · B W1 y+1 ═══
  var idN1 = (await idOf('A', 'N1')).id, idS1 = (await idOf('B', 'S1')).id, idW1 = (await idOf('B', 'W1')).id;   // row ids are PER DEVICE: only ever used on the window that read them
  var idS1A = (await idOf('A', 'S1')).id; console.log('§FILM_IDS S1 rowA=' + idS1A + ' rowB=' + idS1 + ' (same record uu on both: ' + ((await idOf('A', 'S1')).uu === (await idOf('B', 'S1')).uu) + ')');
  cue('S_move1_in'); await gizmoDrag('A', idN1, 'x', 1, 'N1'); await gizmoDrag('B', idS1, 'x', -1, 'S1'); await gizmoDrag('B', idW1, 'y', 1, 'W1');
  await state('moves_before_visit'); await sleep(2800); cue('S_move1_out');
  cue('S_move2_in'); await visit('A'); await visit('B'); await visit('A'); await both(overview); await state('moves_after_visits'); await sleep(3200); cue('S_move2_out');

  // ═══ HEADS-UP: A reaches into B's south wing: selects S1 (and B has S1 open too) ═══
  cue('S_head1_in'); idS1A = (await idOf('A', 'S1')).id; idS1 = (await idOf('B', 'S1')).id;   // Visits rebuild the projection and renumber rows: resolve the ids NOW, not before the moves
  console.log('§FILM_IDS S1 at head: rowA=' + idS1A + ' rowB=' + idS1); await selectApi('A', idS1A); await selectApi('B', idS1); await both(overview); await state('head_both_selected_before_visit'); await sleep(2200); cue('S_head1_out');
  cue('S_head2_in'); await visit('A'); await visit('B'); await both(overview); var bnS1 = await banner('B'); console.log('§FILM_HEADSUP B ' + JSON.stringify(bnS1)); await state('head_after_visits', async function (w) { return { bannerRect: (await banner(w) || {}).rect || null }; }); await sleep(3400); cue('S_head2_out');
  cue('S_head3_in'); await deselect('A'); await visit('A'); await visit('B'); await both(overview); var bnGone = await banner('B'); console.log('§FILM_HEADSUP_CLEARED B ' + JSON.stringify(bnGone)); await state('head_cleared'); await sleep(2400); cue('S_head3_out');

  // ═══ SWITCH-OFF: A ticks "Don't show what I'm on", selects S1 again; B keeps S1 open: no label, A still listed as active ═══
  cue('S_off_in');
  await clickEl('A', '#b-teams'); await pg.A.waitForSelector('#tp-hide', { timeout: 15000 }); await sleep(600); await clickEl('A', '#tp-hide'); await sleep(500);
  var hideOn = await pg.A.evaluate(function () { return document.getElementById('tp-hide').checked; }); console.log('§FILM_HIDE A checked=' + hideOn);
  await clickEl('A', '#b-teams'); await sleep(300); idS1A = (await idOf('A', 'S1')).id; await selectApi('A', idS1A); await overview('A'); await state('off_selected_before_visit'); await sleep(1600); cue('S_off_mid');
  await visit('A'); await visit('B'); await both(overview); var bnOff = await banner('B'); console.log('§FILM_HEADSUP_OFF B ' + JSON.stringify(bnOff));
  await clickEl('B', '#b-teams'); await pg.B.waitForSelector('#team-people .tp-person', { timeout: 15000 }); await sleep(800); var pplOff = await peopleRows('B');
  await state('off_after_visits', async function (w) { return { people: w === 'B' ? pplOff : null }; }); await sleep(4000); await clickEl('B', '#b-teams'); await sleep(300); cue('S_off_out');
  await deselect('A'); await deselect('B');

  // ═══ THE BUILDING ITSELF: A drags one of the seeded HHS walls (north wing): stays local-only ═══
  var wallId = await pg.A.evaluate(function () {   // a seeded, thin, tall element standing in the north wing (numbers from the live meshes)
    var T = window.THREE, r = window.Bonsai.oplog.db.exec("SELECT id FROM kernel_ops WHERE gid='arcseed-HHS' AND op_type='GEOM_INSERT' ORDER BY id")[0].values, best = null;
    r.forEach(function (v) { var m = window.Bonsai.meshFor(v[0]); if (!m) return; var b = new T.Box3().setFromObject(m), s = b.getSize(new T.Vector3()), c = b.getCenter(new T.Vector3());
      if (c.y > 33 && c.y < 41 && c.x > -2 && c.x < 20 && c.z < 3 && s.z > 2.5 && s.z < 4.2 && Math.min(s.x, s.y) < 0.35 && Math.max(s.x, s.y) > 3 && !best) best = { id: v[0], c: [c.x, c.y, c.z], s: [s.x, s.y, s.z] }; });
    return best; });
  console.log('§FILM_WALL ' + JSON.stringify(wallId)); extra.wall = wallId;
  var wallBefore = { A: await wallPos('A', wallId.id), B: await wallPos('B', wallId.id) };
  var wcen = wallBefore.B.centre, isoArg = { id: wallId.id, x: wcen[0], y0: wcen[1] - 2.2, y1: wcen[1] + 2.2, z: 0.3 };
  async function wallView(w) { await viewOn(w, wcen); await settleCam(w); await isolateWall(w, isoArg.id, isoArg.x, isoArg.y0, isoArg.y1, isoArg.z); }   // one camera on both; only the wall visible; dashed line = where it started
  cue('S_wall_in'); await wallView('B'); var wdrag = await gizmoDrag('A', wallId.id, 'x', 1, 'wall#' + wallId.id, isoArg); await state('wall_A_moved', async function (w) { return { wall: await wallPos(w, wallId.id) }; }); await sleep(2600); cue('S_wall_out');
  cue('S_wall2_in'); await visit('A'); await visit('B'); await both(wallView); await state('wall_after_visits', async function (w) { return { wall: await wallPos(w, wallId.id) }; }); await sleep(3200); cue('S_wall2_out');
  cue('S_wall3_in'); await both(settleCam);   // the SAME camera on both windows (a Visit rebuilds the meshes, so the isolation was re-applied just above)
  await state('wall_closeup', async function (w) { return { wall: await wallPos(w, wallId.id) }; }); await sleep(4200); cue('S_wall3_out');
  extra.wallBefore = wallBefore; extra.wdrag = wdrag; extra.drags = drags;

  // ── the verdict lines, read from the states (this file asserts; the film quotes) ──
  var by = function (beat, who) { return states.filter(function (s) { return s.beat === beat && s.who === who; })[0]; };
  var v = [];
  function chk(label, ok, d) { v.push({ label: label, ok: !!ok, detail: d }); console.log('§FILM_CHECK ' + (ok ? 'PASS' : 'FAIL') + ' ' + label + (d ? ' — ' + d : '')); }
  var o1A = by('opened', 'A'), o1B = by('opened', 'B');
  chk('both windows hold the seeded building and no team block', JSON.stringify(rA) === JSON.stringify(rB) && JSON.stringify(rA).indexOf('1077') > 0 && Object.keys(o1A.el).length === 0 && Object.keys(o1B.el).length === 0, JSON.stringify(rA));
  var dA = by('A_drew_north_before_visit', 'A'), dB = by('A_drew_north_before_visit', 'B'), eA = by('B_drew_west_south_before_visit', 'A'), eB = by('B_drew_west_south_before_visit', 'B');
  chk('before any Visit each window shows only its own blocks (A 2 north, B 0 -> B 3 west/south, A still 2)', Object.keys(dA.el).length === 2 && Object.keys(dB.el).length === 0 && Object.keys(eB.el).length === 3 && Object.keys(eA.el).length === 2, JSON.stringify([Object.keys(dA.el), Object.keys(dB.el), Object.keys(eA.el), Object.keys(eB.el)]));
  chk('wing of each block read from its live centre', Object.keys(dA.el).every(function (k) { return dA.el[k].wing === 'north'; }) && eB.el.W1.wing === 'west' && eB.el.S1.wing === 'south' && eB.el.S2.wing === 'south', JSON.stringify(Object.keys(eB.el).map(function (k) { return k + ':' + eB.el[k].wing; })));
  var v1A = by('visits1_all_five', 'A'), v1B = by('visits1_all_five', 'B');
  chk('after the Visits both windows hold five blocks with identical centres', Object.keys(v1A.el).length === 5 && JSON.stringify(v1A.el) === JSON.stringify(v1B.el), JSON.stringify(Object.keys(v1A.el)));
  var mA = by('moves_after_visits', 'A'), mB = by('moves_after_visits', 'B');
  chk('three real drags in three wings: after the Visits identical on both, 0 conflicts, chips 0', JSON.stringify(mA.el) === JSON.stringify(mB.el) && mA.conf === 0 && mB.conf === 0 && mA.chipConflicts === 0 && mB.chipConflicts === 0, JSON.stringify(['N1', 'S1', 'W1'].map(function (k) { return k + ' off ' + JSON.stringify(mA.el[k].off); })));
  var AX = { x: 0, y: 1, z: 2 };
  var dOK = ['N1', 'S1', 'W1'].map(function (nm) { var d = drags.filter(function (x) { return x.label === nm; })[0]; if (!d) return false; var k = AX[d.axis], moved = d.after[k] - d.before[k], other = [0, 1, 2].filter(function (j) { return j !== k; }).every(function (j) { return Math.abs(d.after[j] - d.before[j]) < 1e-6; }); return d.sent && !d.local && Math.abs(moved - d.asked) < 0.2 && Math.sign(moved) === Math.sign(d.asked) && other; });
  chk('each of the three drags moved ONLY its asked axis by ~its asked distance and was SENT (not local-only)', dOK.length === 3 && dOK.every(Boolean), JSON.stringify(drags.filter(function (x) { return /^(N1|S1|W1)$/.test(x.label); }).map(function (d) { return [d.label, d.axis, d.asked, r3(d.after), d.sent]; })));
  chk('final offsets match the drags (N1 +x, S1 -x, W1 +y) on both windows', Math.abs(mA.el.N1.off[0] - 1) < 0.2 && Math.abs(mA.el.S1.off[0] + 1) < 0.2 && Math.abs(mA.el.W1.off[1] - 1) < 0.2 && Math.abs(mA.el.W1.off[2]) < 1e-6, JSON.stringify([mA.el.N1.off, mA.el.S1.off, mA.el.W1.off]));
  var ownFocus = logs.A.filter(function (x) { return /§PEOPLE_FOCUS_OWN selected/.test(x.s) && x.t > cues.filter(function (k) { return k.name === 'S_head1_in'; })[0].t; }).length;
  chk('A\'s selection of S1 registered as a focus (§PEOPLE_FOCUS_OWN selected after S_head1_in)', ownFocus >= 1, 'lines=' + ownFocus);
  var hb = by('head_after_visits', 'B');
  chk('B has S1 open, A selected it and visited: B shows "... is editing this element"', hb.banner && /is editing this element/.test(hb.banner), hb.banner);
  chk('before the Visits B shows no label (NO-OP guard)', by('head_both_selected_before_visit', 'B').banner == null, '');
  chk('A deselects and visits; B visits: the label is gone', by('head_cleared', 'B').banner == null, '');
  var PR = extra.pairing, ppl = PR.pplRows, aPerson = ppl.filter(function (r) { return !r.self; })[0], bPerson = ppl.filter(function (r) { return r.self; })[0];
  chk('ONE Team icon: exactly one #b-teams on both windows, state off before anything, no #team-people-toggle', PR.st0.A && PR.st0.B && PR.st0.A.n === 1 && PR.st0.B.n === 1 && PR.st0.A.st === 'off' && PR.st0.B.st === 'off' && !PR.st0.A.toggle && !PR.st0.B.toggle, JSON.stringify(PR.st0));
  chk('the icon opens the panel: "Team mode is off" + Turn on; after Turn on the page reloads and the panel REOPENS by itself with Start a team / Join / the avatar grid (24)', /off/.test(PR.panelOff.state) && /Turn on/.test(PR.panelOff.mode) && !PR.panelOff.found && /on/.test(PR.panelOn.state) && PR.panelOn.found && PR.panelOn.join && PR.panelOn.grid === 24, JSON.stringify([PR.panelOff, PR.panelOn]));
  chk('A started a team: icon ON; B opened the invite: invite PREFILLED, device code shown, icon PENDING', PR.stFound.st === 'on' && PR.stFound.pressed === 'true' && PR.invitePrefilled && /^[0-9A-F]{4}-[0-9A-F]{4}$/.test(PR.code) && PR.stJoin.st === 'pending', JSON.stringify({ stFound: PR.stFound, stJoin: PR.stJoin, code: PR.code }));
  chk('A listed exactly B\'s code; after Approve and B\'s Visit both chips say team devices 2 and B\'s icon is ON', PR.reqCodes.length === 1 && PR.reqCodes[0] === PR.code && /team devices 2/.test(PR.chipA) && /team devices 2/.test(PR.chipB) && PR.stBon.st === 'on', JSON.stringify({ req: PR.reqCodes, chipA: PR.chipA, chipB: PR.chipB, stB: PR.stBon }));
  chk('avatars: A picked ' + AVATAR.A + ' and B picked ' + AVATAR.B + ' on the grid (aria-pressed); B\'s People list shows A with ' + AVATAR.A + ' and B itself with ' + AVATAR.B + ', both "active", both drawn as SVG heads', PR.pickedA.join() === AVATAR.A && PR.pickedB.join() === AVATAR.B && ppl.length === 2 && aPerson && bPerson && aPerson.av === AVATAR.A && bPerson.av === AVATAR.B && AVATAR.A !== AVATAR.B && ppl.every(function (r) { return /active/.test(r.text); }), JSON.stringify(ppl));
  chk('the heads-up label carries A\'s avatar', bnS1 && bnS1.av === AVATAR.A, JSON.stringify(bnS1));
  var po = by('off_after_visits', 'B');
  chk('A switched "Don\'t show what I\'m on" on: B shows no label, A still listed as active', po.banner == null && po.people && po.people.length === 2 && po.people.every(function (p) { return /active/.test(p.text); }) && hideOn, JSON.stringify(po.people && po.people.map(function (p) { return p.text; })));
  var wA = by('wall_A_moved', 'A'), wB = by('wall_after_visits', 'B'), wAf = by('wall_after_visits', 'A');
  chk('a seeded wall moved by A stays local-only: A offset ~1 m, chip = number of local-only lines (the wall + what rides on it), B unchanged after both Visits', !wdrag.sent && wdrag.local && wdrag.nLocal >= 1 && wA.chipLocalOnly === wdrag.nLocal && wB.chipLocalOnly === 0 && Math.abs(wAf.wall.off[0] - 1) < 0.1 && Math.abs(wB.wall.off[0]) < 1e-6 && Math.abs(wB.wall.centre[0] - wallBefore.B.centre[0]) < 1e-6, JSON.stringify({ A: wAf.wall, B: wB.wall }));
  var wc = { A: by('wall_closeup', 'A'), B: by('wall_closeup', 'B') };
  chk('close-up, same camera: A\'s wall stands ~1 m (0.999) from B\'s on x, y and z equal', Math.abs((wc.A.wall.centre[0] - wc.B.wall.centre[0]) - 0.999) < 0.01 && Math.abs(wc.A.wall.centre[1] - wc.B.wall.centre[1]) < 1e-6 && Math.abs(wc.A.wall.centre[2] - wc.B.wall.centre[2]) < 1e-6, JSON.stringify([wc.A.wall.centre, wc.B.wall.centre]));
  chk('close-up isolates the wall on both windows (only its own meshes visible: 1..6 of >1000)', [isoCount.A, isoCount.B].every(function (x) { return x && x.vis >= 1 && x.vis <= 6 && x.tot > 1000; }), JSON.stringify(isoCount));
  chk('0 page errors', errors === 0, 'pageerrors=' + errors);
  var boot = { A: logs.A.map(function (x) { return x.s; }).filter(function (s) { return /§TEAM_BOOT/.test(s); }), B: logs.B.map(function (x) { return x.s; }).filter(function (s) { return /§TEAM_BOOT/.test(s); }) };
  var fails = v.filter(function (x) { return !x.ok; }).length; console.log('§FILM_REC_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' checks=' + v.length + ' fails=' + fails);
  var chains = { A: logs.A.filter(function (x) { return /verifyChain=FAIL|group-torn/.test(x.s); }).length, B: logs.B.filter(function (x) { return /verifyChain=FAIL|group-torn/.test(x.s); }).length }; console.log('§FILM_CHAIN fail_or_torn_lines A=' + chains.A + ' B=' + chains.B);
  fs.writeFileSync(path.join(OUT, 'cues.json'), JSON.stringify({ cues: cues, states: states, boot: boot, errors: errors, code: code, checks: v, extra: extra, names: names }));
  fs.writeFileSync(path.join(OUT, 'pagelogs.json'), JSON.stringify(logs));
  var vp = {}; for (var w2 of ['A', 'B']) vp[w2] = await pg[w2].video().path();
  await ctx.A.close(); await ctx.B.close(); await browser.close(); S.close();
  fs.writeFileSync(path.join(OUT, 'videos.json'), JSON.stringify(vp)); console.log('§FILM_DONE ' + JSON.stringify(vp));
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(1); });
