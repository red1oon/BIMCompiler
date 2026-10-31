// Film recorder: "The Server is Dead - the Modeller" (TEAMWORK_FRAMEWORK §15.11/§15.12). Two real browser contexts = User A / User B, ONE fresh space.
// Pairing = the unmodified common/comm/comm_phone.html in a second desktop window (no phone device). Modeller = real modeller.html?team=1.
// Moves = REAL gizmo drags (page.mouse on the Move gizmo); block creation + rotate = the model's own command (Bonsai.oplog.commit), labelled so on the film.
'use strict';
var fs = require('fs'), path = require('path');
var L = require('./lib.js'), sleep = L.sleep;
var pw = require('/home/red1/bim-ootb/tests/node_modules/playwright');
var OUT = process.argv[2] || path.join(__dirname, 'rec1');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
var W = 960, H = 640;
var cues = [], states = [], T0 = 0, names = {}, nextName = 1;
function now() { return (Date.now() - T0) / 1000; }
function cue(name, extra) { var t = now(); cues.push({ name: name, t: +t.toFixed(3) }); console.log('§FILM_CUE ' + name + ' t=' + t.toFixed(2) + (extra ? ' ' + extra : '')); return t; }
var CURSOR = '(function(){var d;function mk(){if(d||!document.documentElement)return;d=document.createElement("div");d.style.cssText="position:fixed;width:20px;height:20px;border-radius:50%;background:rgba(255,196,60,.8);border:2px solid #fff;pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);left:-60px;top:-60px;box-shadow:0 0 6px #000";document.documentElement.appendChild(d)}'
  + 'function mv(e){mk();if(!d)return;d.style.left=e.clientX+"px";d.style.top=e.clientY+"px"}'
  + 'window.addEventListener("pointermove",mv,true);window.addEventListener("mousemove",mv,true);window.addEventListener("pointerdown",function(e){mv(e);if(d){d.style.background="rgba(255,70,50,.9)";d.style.width=d.style.height="14px"}},true);'
  + 'window.addEventListener("pointerup",function(e){if(d){d.style.background="rgba(255,196,60,.8)";d.style.width=d.style.height="20px"}},true);document.addEventListener("DOMContentLoaded",mk)})()';

(async function () {
  var S = await L.start(), base = S.base;
  var browser = await pw.chromium.launch({ args: ['--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  var logs = { A: [], B: [] }, pg = {}, ctx = {}, errors = 0;
  for (var w of ['A', 'B']) {
    ctx[w] = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: path.join(OUT, 'vid' + w), size: { width: W, height: H } } });
    await ctx[w].route('https://api.github.com/**', S.fakeGh); await ctx[w].addInitScript(CURSOR); pg[w] = await ctx[w].newPage();
    (function (x) { pg[x].on('console', function (m) { var t = m.text(); logs[x].push({ t: now(), s: t }); if (/§TEAM_|§COMM_SYNC/.test(t)) console.log('   [' + x + '] ' + t.slice(0, 230)); });
      pg[x].on('pageerror', function (e) { errors++; console.log('   [' + x + '] 🔴 PAGEERR ' + e.message); logs[x].push({ t: now(), s: 'PAGEERR ' + e.message }); }); pg[x].on('dialog', function (d) { d.accept().catch(function () {}); }); })(w);
  }
  T0 = Date.now(); var both = function (fn) { return Promise.all(['A', 'B'].map(function (w) { return fn(w); })); };
  // ── sync pulse: black, then white 1 s, then black (found again in each video by frame luma) ──
  await both(function (w) { return pg[w].goto('data:text/html,<body style="margin:0;background:%23000"></body>'); }); await sleep(1500);
  await both(function (w) { return pg[w].evaluate(function () { document.body.style.background = '#fff'; }); }); cue('pulse_white'); await sleep(1000);
  await both(function (w) { return pg[w].evaluate(function () { document.body.style.background = '#000'; }); }); cue('pulse_end'); await sleep(900);

  // ── helpers ──
  async function glide(w, x, y, steps) { await pg[w].mouse.move(x, y, { steps: steps || 14 }); }
  async function clickEl(w, sel) { var b = await pg[w].locator(sel).first().boundingBox(); await glide(w, b.x + b.width / 2, b.y + b.height / 2); await sleep(250); await pg[w].mouse.down(); await sleep(90); await pg[w].mouse.up(); }
  async function blur(w) { await pg[w].addStyleTag({ content: '#invite,#invite-link,#token,#pb-url,#pb-secret,input[type=password]{filter:blur(9px)!important}' }); }
  async function ready(p) { await p.waitForSelector('body[data-ready="1"]', { timeout: 120000 }); }
  async function press(w, sel) { await clickEl(w, sel); await ready(pg[w]); }
  async function waitLog(w, re, from, ms) { var t0 = Date.now(); while (Date.now() - t0 < ms) { var l = logs[w].slice(from).find(function (x) { return re.test(x.s); }); if (l) return l.s; await sleep(120); } return null; }
  async function settleCam(w) { var last = null, n = 0; for (var k = 0; k < 40; k++) { var p = await pg[w].evaluate(function () { var c = window.A.camera, t = window.A.controls.target; return [c.position.x, c.position.y, c.position.z, t.x, t.y, t.z].map(function (v) { return v.toFixed(3); }).join(','); }); if (p === last) { n++; if (n >= 3) return; } else n = 0; last = p; await sleep(100); } }
  async function snap(w) {
    return pg[w].evaluate(function () {
      var O = window.Bonsai.oplog, r = O.db.exec("SELECT id, op_uuid, op_type, parameters, undone FROM kernel_ops WHERE op_type LIKE 'GEOM%' ORDER BY id"), rows = [];
      if (r.length) r[0].values.forEach(function (v) { rows.push({ id: v[0], uu: v[1], type: v[2], P: JSON.parse(v[3]), undone: v[4] }); });
      var g = window.Bonsai.group(), T = window.THREE, boxes = {};
      g.children.forEach(function (m) { if (!m.isMesh || m.userData.featureId == null) return; var b = new T.Box3().setFromObject(m), k = m.userData.featureId; if (boxes[k]) boxes[k].union(b); else boxes[k] = b; });
      var el = {};
      rows.forEach(function (x) { if (x.undone || /^GEOM_(MOVE|ROTATE|SCALE)$/.test(x.type) || x.P.parent != null) return;
        var b = boxes[x.id], c = b ? b.getCenter(new T.Vector3()) : null, s = b ? b.getSize(new T.Vector3()) : null, d = O.moveDeltaFor(x.id);
        el[x.uu] = { id: x.id, centre: c ? [c.x, c.y, c.z] : null, size: s ? [s.x, s.y, s.z] : null, off: [d.dx, d.dy, d.dz] }; });
      return el;
    });
  }
  async function conflicts(w) { return pg[w].evaluate(async function () { var cf = await window.TeamSyncModeller.store().conflicts(); return cf.map(function (k) { return { uu: k.uu, col: k.col, before: window.TeamSyncModeller.decV(k.before), values: k.candidates.map(function (x) { return window.TeamSyncModeller.decV(x.value); }) }; }); }); }
  async function chip(w) { return pg[w].evaluate(function () { var c = document.getElementById('team-chip'); return c ? { text: c.textContent.replace(/\s+/g, ' ').trim(), conflicts: Number(c.getAttribute('data-conflicts')), localonly: Number(c.getAttribute('data-localonly')) } : null; }); }
  function nameOf(uu) { if (!names[uu]) names[uu] = 'block ' + (nextName++); return names[uu]; }
  var r3 = function (a) { return a && a.map(function (v) { return Math.round(v * 1000) / 1000; }); };
  async function state(beat) {   // numbers read from live state, both panes, at one instant
    var t = now(), out = {};
    for (var w of ['A', 'B']) {
      var el = await snap(w), cf = await conflicts(w), ch = await chip(w), e2 = {};
      Object.keys(el).forEach(function (u) { e2[nameOf(u)] = { centre: r3(el[u].centre), size: r3(el[u].size), off: r3(el[u].off) }; });
      var rec = { t: +t.toFixed(2), beat: beat, who: w, el: e2, conf: cf.map(function (k) { return { block: nameOf(k.uu), col: k.col, values: k.values, kept: k.before }; }), chipConflicts: ch.conflicts, chipLocalOnly: ch.localonly };
      states.push(rec); out[w] = rec; console.log('§FILM_STATE t=' + rec.t + ' beat=' + beat + ' who=' + w + ' ' + JSON.stringify({ el: rec.el, conf: rec.conf, localOnly: rec.chipLocalOnly }));
    }
    return out;
  }
  var vn = 0;
  async function visit(w) { var k = ++vn, n0 = logs[w].length; cue('V' + k + '_' + w + '_in'); await clickEl(w, '#team-visit'); var l = await waitLog(w, /§TEAM_VISIT /, n0, 60000); cue('V' + k + '_' + w + '_got'); await pg[w].evaluate(function () { return window.TeamSyncModeller.settle(); }); await sleep(700); cue('V' + k + '_' + w + '_out'); return l; }
  async function openModeller(w) {
    await pg[w].goto(base + '/modeller/modeller.html?team=1&pipe=' + encodeURIComponent(S.PIPE), { waitUntil: 'load' });
    await pg[w].waitForFunction(function () { return window.Bonsai && window.Bonsai.oplog && window.KernelOps && window.Bonsai.group && window.A && window.A.camera; }, null, { timeout: 90000 });
    await pg[w].waitForSelector('#team-chip[data-team="ready"]', { timeout: 60000 }); await sleep(700);
    await pg[w].click('#ol-collapse'); await sleep(500);   // outliner folded: the scene gets the whole pane
  }
  async function command(w, op, P) { return pg[w].evaluate(async function (a) { var c = await window.Bonsai.oplog.commit({ op_type: a.op, parameters: a.P }); await window.TeamSyncModeller.settle(); return c && c.id; }, { op: op, P: P }); }
  async function project(w, id, off) { return pg[w].evaluate(function (a) { var T = window.THREE, cam = window.A.camera, cv = document.getElementById('c'), r = cv.getBoundingClientRect();
    var m = window.Bonsai.meshFor(a.i); var b = new T.Box3().setFromObject(m), c = b.getCenter(new T.Vector3());
    var v = new T.Vector3(c.x + a.off[0], c.y + a.off[1], c.z + a.off[2]).project(cam); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, { i: id, off: off }); }
  async function setView(w) { await pg[w].evaluate(function () { var A = window.A, c = A.camera, t = A.controls.target; c.position.set(2.2, -2.2, 8.2); t.set(2.2, 1.6, 0.5); A.controls.update(); if (A.requestRender) A.requestRender(); }); await sleep(350); }
  async function fitAll(w) { await pg[w].keyboard.press('Escape'); await sleep(200); await setView(w); }
  var fallbacks = 0, gn = 0;
  async function selectBlock(w, uu) {   // real click on the block, then zoom out with the real wheel (the Modeller frames the selection tightly)
    var id = (await snap(w))[uu].id, c = await project(w, id, [0, 0, 0]);
    await glide(w, c[0], c[1]); await sleep(200); await pg[w].mouse.down(); await sleep(80); await pg[w].mouse.up(); await sleep(500);
    var sel = await pg[w].evaluate(function () { return window.Bonsai._selId; });
    if (sel !== id) { var dbg = await pg[w].evaluate(function (a) { var T = window.THREE, cam = window.A.camera, g = window.Bonsai.group(), out = []; g.children.forEach(function (m) { if (m.isMesh && m.userData.featureId != null) { var b = new T.Box3().setFromObject(m), c = b.getCenter(new T.Vector3()).project(cam); out.push([m.userData.featureId, +c.x.toFixed(2), +c.y.toFixed(2)]); } }); return { click: a, meshes: out, dist: +cam.position.length().toFixed(1) }; }, c); console.log('§FILM_SELDBG ' + w + ' want=' + id + ' sel=' + sel + ' ' + JSON.stringify(dbg)); }
    if (sel !== id) { fallbacks++; console.log('§FILM_NOTE ' + w + ' real click did not select (sel=' + sel + ', want ' + id + ') -> Bonsai.select fallback'); await pg[w].evaluate(function (i) { window.Bonsai.select(i); }, id); }
    await settleCam(w); cue('G' + gn + '_' + w + '_clicked');
    return id;
  }
  async function gizmoDrag(w, uu, axis, dist, reuse) {
    var n0 = logs[w].length, id, g = ++gn; cue('G' + g + '_' + w + '_sel_in');
    if (!reuse) { id = await selectBlock(w, uu); await clickEl(w, '#b-move'); await sleep(300); await settleCam(w); await setView(w); cue('G' + g + '_' + w + '_sel_done'); } else id = (await snap(w))[uu].id;
    await settleCam(w); if (reuse) await setView(w);
    var A3 = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1], sg = dist < 0 ? -1 : 1;
    var p1 = await project(w, id, A3.map(function (v) { return v * 0.7; })), p2 = await project(w, id, A3.map(function (v) { return v * (0.7 + dist); }));
    var before = (await snap(w))[uu].off.slice(); cue('G' + g + '_' + w + '_gest_in');
    await glide(w, p1[0], p1[1]); await sleep(250); cue('G' + g + '_' + w + '_down'); await pg[w].mouse.down(); await sleep(120);
    for (var k = 1; k <= 14; k++) { await pg[w].mouse.move(p1[0] + (p2[0] - p1[0]) * k / 14, p1[1] + (p2[1] - p1[1]) * k / 14); await sleep(70); }
    await sleep(300); await pg[w].mouse.up(); cue('G' + g + '_' + w + '_up'); await sleep(600);
    var out = await waitLog(w, /§TEAM_OUT op=GEOM_MOVE/, n0, 15000); await pg[w].evaluate(function () { return window.TeamSyncModeller.settle(); }); await sleep(500);
    var after = (await snap(w))[uu].off; cue('G' + g + '_' + w + '_out');
    console.log('§FILM_DRAG who=' + w + ' ' + nameOf(uu) + ' axis=' + axis + ' asked=' + dist + ' offsetBefore=' + JSON.stringify(r3(before)) + ' offsetAfter=' + JSON.stringify(r3(after)) + ' sent=' + (out ? out.slice(0, 90) : 'NOT SENT'));
    return { before: before, after: after, sent: !!out };
  }
  async function exitMove(w) { await fitAll(w); }
  var uuByName = {}; async function uuOf(w, id) { var el = await snap(w), r = Object.keys(el).filter(function (u) { return el[u].id === id; })[0]; return r; }
  async function uuNamed(w, nm) { var el = await snap(w); return Object.keys(el).filter(function (u) { return nameOf(u) === nm; })[0]; }

  // ═══ PAIRING (test bench) ═══
  var phone = base + '/common/comm/comm_phone.html?gap=0';
  cue('S_pair1_in');
  await both(function (w) { return pg[w].goto(phone); }); await both(function (w) { return ready(pg[w]); });
  for (var w of ['A', 'B']) { await pg[w].fill('#token', 'fake-token-local-folder'); await blur(w); }
  await sleep(1800);
  await clickEl('A', '#b-token'); await ready(pg.A); await sleep(1500);
  await press('A', '#b-found'); await blur('A'); await sleep(2800); cue('S_pair1_out');
  var invite = await pg.A.inputValue('#invite-link');
  cue('S_pair2_in');
  await pg.B.goto(invite.replace(/^https?:\/\/[^/]+/, base).replace('#', '?gap=0#')); await pg.B.reload(); await ready(pg.B);
  if (await pg.B.locator('#token').isVisible()) { await pg.B.fill('#token', 'fake-token-local-folder'); await blur('B'); await sleep(1200); await press('B', '#b-token'); await sleep(900); } else { await blur('B'); await sleep(1500); }
  await press('B', '#b-join'); var code = (await pg.B.textContent('#mycode')).trim(); console.log('§FILM_PAIR B code=' + code); await sleep(3200); cue('S_pair2_out');
  cue('S_pair3_in');
  await press('A', '#b-requests'); await sleep(1800);
  var codes = await pg.A.$$eval('#requests .request .code', function (els) { return els.map(function (e) { return e.textContent.trim(); }); }); console.log('§FILM_PAIR A sees requests=' + JSON.stringify(codes));
  await pg.A.selectOption('#requests .request:has-text("' + code + '") .req-role', '102').catch(function () {}); await sleep(1200);
  await clickEl('A', '#requests .request:has-text("' + code + '") .b-approve'); await ready(pg.A); await sleep(2200); cue('S_pair3_out');
  cue('S_pair4_in');
  await press('B', '#b-visit'); var pst = (await pg.B.textContent('#pair-state')).trim(); console.log('§FILM_PAIR B state=' + pst); await sleep(3000); cue('S_pair4_out');

  // ═══ MODELLER ═══
  cue('load_in'); await both(openModeller); cue('load_out');
  cue('S_chip_in'); await state('chip'); await sleep(2600); cue('S_chip_out');
  var fitBoth = function () { return both(fitAll); };

  // create: A draws two blocks (the model's own command), Visit; B (empty) Visit -> both blocks appear
  cue('S_create1_in');
  await command('A', 'GEOM_EXTRUDE', { profile: { w: 2, h: 1 }, dir: [0, 0, 1.5] }); await sleep(600);
  await fitAll('A'); var U1 = Object.keys(await snap('A'))[0]; nameOf(U1);
  await state('A_drew_block1_before_visit'); await sleep(1300); cue('S_create1b_in');
  await command('A', 'GEOM_EXTRUDE_POLY', { profile: { points: [[3, 2], [4, 2], [4, 3], [3, 3]] }, depth: 1.5 }); await sleep(600);
  var U2 = Object.keys(await snap('A')).filter(function (u) { return u !== U1; })[0]; nameOf(U2);
  await fitAll('A'); await state('A_drew_block2_before_visit'); await sleep(2800); cue('S_create1_out');
  cue('S_create2_in'); var vA1 = await visit('A'); console.log('§FILM_VISIT A ' + (vA1 || '').slice(0, 200)); await state('A_visited'); await sleep(900); cue('S_create2_out');
  cue('S_create3_in'); var vB1 = await visit('B'); console.log('§FILM_VISIT B ' + (vB1 || '').slice(0, 200));
  await fitAll('B'); await state('B_visited_blocks_arrived'); await sleep(2400); cue('S_create3_out');

  // move (different blocks): A drags block 1 along x by -2 (a negative direction), B drags block 2 along x +2, no Visit between; then Visit A, B, A
  cue('S_move1_in'); await gizmoDrag('A', U1, 'x', -2); await exitMove('A'); await gizmoDrag('B', U2, 'x', 2); await exitMove('B'); await state('moves_before_visit'); await sleep(3000); cue('S_move1_out');
  cue('S_move2_in'); await visit('A'); await visit('B'); await visit('A'); await fitBoth(); await state('moves_after_visits'); await sleep(2400); cue('S_move2_out');

  // clash: same block, same axis, no Visit between: A x+1, B x+2 (and B y+1, a different axis)
  cue('S_clash1_in'); await gizmoDrag('A', U1, 'x', 1); await exitMove('A'); await gizmoDrag('B', U1, 'x', 2); await gizmoDrag('B', U1, 'y', 1, true); await exitMove('B');
  await state('clash_before_visit'); await sleep(3000); cue('S_clash1_out');
  cue('S_clash2_in'); await visit('A'); await visit('B'); await visit('A'); await fitBoth(); await state('clash_after_visits'); await sleep(5200); cue('S_clash2_out');

  // resolve: A (who has seen both) moves once more
  cue('S_resolve1_in'); await gizmoDrag('A', U1, 'x', 1); await exitMove('A'); await state('resolve_A_moved'); await sleep(2800); cue('S_resolve1_out');
  cue('S_resolve2_in'); await visit('A'); await visit('B'); await fitBoth(); await state('resolve_after_visits'); await sleep(3000); cue('S_resolve2_out');

  // limits: A rotates block 1 (the model's own command): NOT shared
  cue('S_limits1_in'); var idR = (await snap('A'))[U1].id; var n0 = logs.A.length;
  await command('A', 'GEOM_ROTATE', { parent: idR, drot: 90 }); var lo = await waitLog('A', /§TEAM_LOCALONLY op=GEOM_ROTATE/, n0, 8000); console.log('§FILM_LOCALONLY A ' + (lo || 'NO LINE').slice(0, 200)); await sleep(800);
  await fitAll('A'); await state('limits_A_rotated'); await sleep(2400); cue('S_limits1_out');
  cue('S_limits2_in'); await visit('A'); await visit('B'); await fitBoth(); await state('limits_after_visits'); await sleep(3200); cue('S_limits2_out');

  // ── the two pages' space ids ──
  var boot = { A: logs.A.map(function (x) { return x.s; }).filter(function (s) { return /§TEAM_BOOT/.test(s); }), B: logs.B.map(function (x) { return x.s; }).filter(function (s) { return /§TEAM_BOOT/.test(s); }) };
  console.log('§FILM_SPACE A ' + boot.A.join(' || ').slice(0, 200)); console.log('§FILM_SPACE B ' + boot.B.join(' || ').slice(0, 200));
  var visits = { A: logs.A.map(function (x) { return x.s; }).filter(function (s) { return /§TEAM_VISIT /.test(s); }), B: logs.B.map(function (x) { return x.s; }).filter(function (s) { return /§TEAM_VISIT /.test(s); }) };
  console.log('§FILM_ERRORS pageerrors=' + errors + ' realClickFallbacks=' + fallbacks);
  fs.writeFileSync(path.join(OUT, 'cues.json'), JSON.stringify({ cues: cues, states: states, boot: boot, visits: visits, errors: errors, fallbacks: fallbacks, code: code })); 
  fs.writeFileSync(path.join(OUT, 'pagelogs.json'), JSON.stringify(logs));
  var vp = {}; for (var w of ['A', 'B']) vp[w] = await pg[w].video().path();
  await ctx.A.close(); await ctx.B.close(); await browser.close(); S.close();
  fs.writeFileSync(path.join(OUT, 'videos.json'), JSON.stringify(vp)); console.log('§FILM_DONE ' + JSON.stringify(vp));
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(1); });
