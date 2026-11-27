// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" (prompts/FILM_LOD_UPGRADE_FIND.md). READ THE LOG after every run; the exit code is not evidence.
// The REAL Viewer (a read-only `git archive origin/main` export of bim-ootb, served on a private port) opened on JPAM_film.db. Real key presses type each Find term; each result row is clicked with the real
// mouse; the Viewer's OWN fly-to (nf_panel_search.js selectResult -> animFly, t += 0.02, 50 steps) is captured FRAME BY FRAME at a fixed step: requestAnimationFrame is replaced by a manual queue, so one
// capture = one step of the Viewer's own animation, never a real-time recording. Device scale 2. Every number is read from the page: the panel's count, the isolate size, the camera and the element's own
// transform. Prints §FILM_SHOT per beat, §FILM_PANEL_CHECK (the shot shows the panel count that was read: the crop equals a clip of the live DOM, and differs when the count text is changed), §FILM_GHOST_WATCH.
// Usage: node capture_viewer.js <bim-ootb export dir> <out dir>      (env GL=sw for software GL)
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const L = require('./lib.js');
const TREE = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3]); fs.mkdirSync(path.join(OUT, 'v'), { recursive: true });
const PORT = +(process.env.PORT || 8761), VW = 1280, VH = 720, DSF = 2;
const TERMS = [
  { id: 'find_layer', term: 'layer', pick: 0 },       // the first hit is a ceiling layer; every wall layer inside the first 50 rows carries a vendor prefix of the model, so no wall row is flown to (stated on the card)
  { id: 'find_fin', term: 'Fin plate', pick: 0 },
  { id: 'find_rebar', term: 'reinforcing', pick: 0 },
  { id: 'find_gusset', term: 'gusset', pick: 0 },
  { id: 'find_plate', term: 'plate', pick: 0, witness: true }   // §AG FLY witness only (run with BEATS=find_plate): the one-word term the Find box takes; never a film beat
].filter((b) => (process.env.BEATS ? process.env.BEATS.split(',').includes(b.id) : !b.witness));   // BEATS=find_fin re-captures that beat alone (film rc2); the default is the four rc1 beats
const J = { made: new Date().toISOString(), viewport: { w: VW, h: VH, dsf: DSF }, beats: {}, iso: [] };
const log = (m) => console.log(m);
(async () => {
  const srv = await L.serve(TREE, PORT), br = await L.launch(), pg = await br.newPage(); await pg.setViewport({ width: VW, height: VH, deviceScaleFactor: DSF });
  const t0 = Date.now(), T = () => ((Date.now() - t0) / 1000).toFixed(1), con = [];
  pg.on('console', (m) => { const t = m.text(); if (/§PARTS_VIEW|§NAV_FIND_SEARCH|§NAV_FIND_SELECT|§SHELL_GHOST|§FILTER_GUIDS isolate|§CONTRACT_CHECK|§KBD_ROUTE/.test(t)) { con.push('[' + T() + '] ' + t.slice(0, 240)); } });
  pg.on('pageerror', (e) => log('§FILM_PAGEERROR ' + String(e).slice(0, 200)));
  await pg.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=buildings/JPAM_film.db', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await pg.waitForFunction('window.APP && window.APP.partsView && window.APP.activeGuidFilter', { timeout: 400000 });
  await L.sleep(6000);
  // the start-up panels (4D timeline, clash matrix) are closed the way a person does it: a click on their cross
  const xs = await pg.evaluate(() => Array.from(document.querySelectorAll('button,span,div,a')).filter((e) => /^[✕×✖]$/.test(e.textContent.trim()) && e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return { id: e.id, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
  for (const c of xs) { await pg.mouse.click(c.x, c.y); await L.sleep(400); }
  log('§FILM_PANELS_CLOSED ' + xs.map((c) => c.id).join(','));
  await pg.evaluate(() => { const A = window.APP; window.__isoLog = []; let last = 'init'; window.__isoWatch = setInterval(() => { const f = A.activeGuidFilter, s = f ? f.size : null; if (s !== last) { window.__isoLog.push({ t: Math.round(performance.now()), size: s }); last = s; } }, 250); });
  const pvLine = con.filter((l) => /§PARTS_VIEW hostsHidden/.test(l)).pop(); log('§FILM_PARTS ' + pvLine);
  J.parts_view_line = (pvLine || '').replace(/^\[[\d.]+\] /, '');
  const iso = () => pg.evaluate(() => { const f = window.APP.activeGuidFilter; return f ? f.size : null; });
  J.isolate_at_start = await iso(); log('§FILM_ISOLATE start=' + J.isolate_at_start + ' (6956 = 7137 elements - 181 hosts hidden by the parts view)');
  // the virtual frame clock: one step runs every queued requestAnimationFrame callback once (the render loop and the Viewer's own animFly)
  const clockOn = () => pg.evaluate(() => { if (window.__clock) return; const c = window.__clock = { map: new Map(), id: 0, raf: window.requestAnimationFrame.bind(window), caf: window.cancelAnimationFrame.bind(window) };
    window.requestAnimationFrame = (cb) => { c.map.set(++c.id, cb); return c.id; }; window.cancelAnimationFrame = (id) => { c.map.delete(id); };
    window.__step = () => { const q = Array.from(c.map.values()); c.map.clear(); const n = performance.now(); q.forEach((cb) => { try { cb(n); } catch (e) { /* the app's own error handling */ } }); return q.length; }; });
  const clockOff = () => pg.evaluate(() => { const c = window.__clock; if (!c) return 0; const q = Array.from(c.map.values()); window.requestAnimationFrame = c.raf; window.cancelAnimationFrame = c.caf; c.map.clear(); q.forEach((cb) => c.raf(cb)); window.__clock = null; return q.length; });
  const shot = async (rel, type) => { const f = path.join(OUT, rel); await pg.screenshot({ path: f, type: type || 'png', quality: type === 'jpeg' ? 92 : undefined }); return rel; };
  const rects = () => pg.evaluate(() => { const R = (s) => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
    return { panel: R('#find-panel'), input: R('#find-name'), count: R('#find-count'), results: R('#find-results'), selected: R('#find-selected'), canvas: R('canvas') }; });
  const cam = () => pg.evaluate(() => { const A = window.APP, p = A.camera.position, t = A.controls.target; return { p: [p.x, p.y, p.z], t: [t.x, t.y, t.z] }; });
  const panelText = () => pg.evaluate(() => ({ count: (document.getElementById('find-count') || {}).textContent || '', items: document.querySelectorAll('.find-result-item').length, first: (document.querySelector('.find-result-item') || {}).innerText || '' }));

  // beat 'viewer': the whole mosque, parts view on, nothing else open
  await L.sleep(1500); J.whole = await shot('v/whole.png'); J.whole_cam = await cam(); log('§FILM_SHOT beat=viewer_whole frames=1 crop=whole viewport target_guid=- target_to_element_m=- ' + J.parts_view_line);
  // open Find with the real F key
  await pg.evaluate(() => document.activeElement && document.activeElement.blur()); await pg.keyboard.press('f'); await L.sleep(2000);
  J.isolate_after_find_open = await iso(); log('§FILM_ISOLATE after_find_open=' + J.isolate_after_find_open);

  for (const B of TERMS) {
    const beat = { term: B.term }; J.beats[B.id] = beat;
    // clear the box (the person's own select-all + delete), then the BEFORE picture
    await pg.click('#find-name', { clickCount: 3 }); await pg.keyboard.down('Control'); await pg.keyboard.press('a'); await pg.keyboard.up('Control'); await pg.keyboard.press('Backspace'); await L.sleep(1200);
    beat.before = await shot('v/' + B.id + '_before.png'); beat.before_rects = await rects(); beat.before_cam = await cam();
    // the real key presses (a space reaches the box: bim-ootb #3231)
    await pg.keyboard.type(B.term, { delay: 25 }); await pg.waitForFunction(() => { const c = (document.getElementById('find-count') || {}).textContent || ''; return /found|match/i.test(c) && document.querySelectorAll('.find-result-item').length > 0; }, { timeout: 60000 }); await L.sleep(1500);
    const box = await pg.evaluate(() => document.getElementById('find-name').value); beat.box_value = box;
    // the row to fly to
    const pickIdx = await pg.evaluate((pick) => { const items = Array.from(document.querySelectorAll('.find-result-item')); if (pick === 'wallrow') { const i = items.findIndex((e) => /of Basic Wall/.test(e.innerText)); return i; } return pick; }, B.pick);
    if (pickIdx < 0) throw new Error('no row to pick for ' + B.id);
    await pg.evaluate((i) => { const it = document.querySelectorAll('.find-result-item')[i]; it.scrollIntoView({ block: 'center' }); }, pickIdx); await L.sleep(500);
    const pt = await pg.evaluate((i) => { const r = document.querySelectorAll('.find-result-item')[i].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: document.querySelectorAll('.find-result-item')[i].innerText }; }, pickIdx);
    beat.rects = await rects(); beat.panel = await panelText(); beat.pick_index = pickIdx; beat.pick_text = pt.text.replace(/\n/g, ' · ');
    await clockOn();   // the page's animation is held; one step before each capture redraws the canvas (its drawing buffer is not kept), so the shot and the live clips below see the same pixels
    await pg.evaluate(() => window.__step()); beat.result = await shot('v/' + B.id + '_result.png');
    // §FILM_PANEL_CHECK: the shot shows the count that was read. (a) the crop of the shot at the count's rect equals a clip of the live page; (b) it differs once the count text is changed
    const cr = beat.rects.count, clip = { x: Math.floor(cr.x), y: Math.floor(cr.y), width: Math.ceil(cr.w), height: Math.ceil(cr.h) }, tmp = path.join(OUT, 'v', '_chk');
    await pg.evaluate(() => window.__step()); await pg.screenshot({ path: tmp + '_clip.png', clip }); const orig = await pg.evaluate(() => { const e = document.getElementById('find-count'), o = e.textContent; e.textContent = '999 found'; return o; }); await pg.evaluate(() => window.__step()); await pg.screenshot({ path: tmp + '_mut.png', clip }); await pg.evaluate((o) => { document.getElementById('find-count').textContent = o; }, orig);
    const cropShot = (src, dst) => execFileSync('convert', [src, '-crop', (clip.width * DSF) + 'x' + (clip.height * DSF) + '+' + (clip.x * DSF) + '+' + (clip.y * DSF), '+repage', dst]);
    cropShot(path.join(OUT, beat.result), tmp + '_crop.png');
    const ae = (a, b) => { try { execFileSync('compare', ['-fuzz', '10%', '-metric', 'AE', a, b, 'null:'], { stdio: ['ignore', 'ignore', 'pipe'] }); return 0; } catch (e) { return +String(e.stderr || '').trim().split(/\s/)[0] || -1; } };
    const same = ae(tmp + '_crop.png', tmp + '_clip.png'), diff = ae(tmp + '_crop.png', tmp + '_mut.png');
    beat.panel_check = { count: beat.panel.count, same_px: same, differs_px: diff, ok: same < 20 && diff > 100 };
    log('§FILM_PANEL_CHECK beat=' + B.id + ' term="' + B.term + '" box="' + box + '" count="' + beat.panel.count + '" rows=' + beat.panel.items + ' crop_vs_live_px=' + same + ' crop_vs_changed_text_px=' + diff + ' -> ' + (beat.panel_check.ok ? 'PASS' : 'FAIL'));
    beat.isolate_before_click = await iso();
    // the element's own transform (what the Viewer flies to), before the click
    // click the row with the real mouse and capture the Viewer's own fly frame by frame
    const c0 = await cam();
    await pg.mouse.click(pt.x, pt.y); await L.sleep(400); const frames = []; let n = 0;
    const sel = con.filter((l) => /§NAV_FIND_SELECT/.test(l)).pop(); const guid = (/guid=(\S+)/.exec(sel || '') || [])[1]; beat.guid = guid;
    const target = await pg.evaluate((g) => { const A = window.APP, r = A.dbQuery('SELECT center_x, center_y, center_z, bbox_x, bbox_y, bbox_z FROM element_transforms WHERE guid = ?', [g])[0], p = A.ifc2three(r[0], r[1], r[2]); const e = A.dbQuery('SELECT ifc_class, element_name, storey FROM elements_meta WHERE guid = ?', [g])[0];
      return { c: [p.x, p.y, p.z], bbox: [r[3], r[4], r[5]], cls: e[0], name: e[1], storey: e[2] }; }, guid);
    // the geometry's own centre (elements_rtree), against the transform's centre the Find flies to
    const tc = await pg.evaluate((g) => { const A = window.APP, r = A.dbQuery('SELECT (minX+maxX)/2, (minY+maxY)/2, (minZ+maxZ)/2 FROM elements_rtree WHERE id = (SELECT rowid FROM elements_meta WHERE guid = ?)', [g])[0], p = A.ifc2three(r[0], r[1], r[2]); return [p.x, p.y, p.z]; }, guid);
    target.true_c = tc; beat.target = target;
    const grab = async () => { n++; const f = 'v/' + B.id + '_fly_' + String(n).padStart(3, '0') + '.jpg'; await shot(f, 'jpeg'); const c = await cam(); frames.push({ f, cam: c }); };
    await grab();                                    // step 1 ran synchronously in the click (t = 0.02)
    for (let i = 0; i < 49; i++) { await pg.evaluate(() => window.__step()); await grab(); }
    for (let i = 0; i < 3; i++) { await pg.evaluate(() => window.__step()); }   // the render loop catches up with the final camera
    await grab();
    const c1 = await cam(), d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const expect = Math.max(...target.bbox) * 1.5 + 0.5, tgtD = d3(c1.t, target.c), camD = d3(c1.p, target.c);
    // frame-to-frame: the camera moved on each of the first 50 steps and stopped at the end
    let moved = 0; for (let i = 1; i < 50; i++) if (d3(frames[i].cam.p, frames[i - 1].cam.p) > 1e-6 || d3(frames[i].cam.t, frames[i - 1].cam.t) > 1e-6) moved++;
    beat.fly = { cams: frames.map((x) => x.cam), frames: frames.map((x) => x.f), miss_m: +d3(c1.t, tc).toFixed(3), steps_with_motion: moved, start_cam: c0, end_cam: c1, target_to_element_m: +tgtD.toFixed(4), camera_to_element_m: +camD.toFixed(3), expected_cam_dist_m: +expect.toFixed(3), cam_moved_m: +d3(c0.p, c1.p).toFixed(3) };
    if (beat.fly.miss_m > 0.5) log('§FILM_FLY_MISS beat=' + B.id + ' the Find fly ended ' + beat.fly.miss_m + ' m from the part\'s own geometry (elements_rtree centre): its element_transforms.center is not the part\'s own centre (facts.js §FILM_CENTRE). A.zoomToGuid was tried and does not move the camera for these parts (no per-guid mesh), so no second step is filmed.');
    // the picked element's own parts, isolated (the Viewer's A.filterByGuids, the same call the parts view and every isolate use), then pulled back with the mouse wheel (OrbitControls dolly) so its surroundings show.
    // Without this the part sits inside the architecture and cannot be seen (the yellow outline alone).
    const isoInfo = await pg.evaluate((g) => { const A = window.APP, q = (sql, p) => A.dbQuery(sql, p || []).map((r) => r[0]); let sib = [];
      const par = q('SELECT parent_guid FROM element_parts WHERE child_guid = ?', [g])[0];
      if (par) { sib = q('SELECT child_guid FROM element_parts WHERE parent_guid = ?', [par]); }
      else { const m = /^(GEN-[A-Z]+-.+-[AB])-[A-Z]+$/.exec(g); if (m) sib = q('SELECT guid FROM elements_meta WHERE guid LIKE ?', [m[1] + '-%']); }
      const cls = A.dbQuery('SELECT ifc_class FROM elements_meta WHERE guid = ?', [g])[0][0]; let host = null;
      if (par && /Member|Beam/.test(A.dbQuery('SELECT ifc_class FROM elements_meta WHERE guid = ?', [par])[0][0]) && cls !== 'IfcReinforcingBar') host = par;     // the brace of a gusset
      else { const mm = /^GEN-CR-(.+)-[AB]-[A-Z]+$/.exec(g); if (mm) host = mm[1]; }                                                                                         // the beam of a fin plate
      const set = new Set(sib.concat(host ? [host] : [])); A.filterByGuids(set); return { n: set.size, siblings: sib.length, host, isolate_size: A.activeGuidFilter ? A.activeGuidFilter.size : null }; }, guid);
    beat.iso = isoInfo; for (let i = 0; i < 4; i++) await pg.evaluate(() => window.__step());
    await pg.mouse.move(640, 300); const out0 = await cam(); let on = 0; const og = async () => { on++; const f = 'v/' + B.id + '_out_' + String(on).padStart(3, '0') + '.jpg'; await shot(f, 'jpeg'); frames.push({ f, cam: await cam() }); };
    await og(); for (let i = 0; i < 2; i++) { await pg.mouse.wheel({ deltaY: 100 }); await pg.evaluate(() => window.__step()); await og(); }
    for (let i = 0; i < 40; i++) { await pg.evaluate(() => window.__step()); await og(); }
    const c3 = await cam(); beat.out = { frames: on, camera_to_element_m: +d3(c3.p, tc).toFixed(3), target_to_geometry_m: +d3(c3.t, tc).toFixed(3), from_camera_m: +d3(out0.p, tc).toFixed(3) };
    beat.fly.cams = frames.map((x) => x.cam); beat.fly.frames = frames.map((x) => x.f);
    log('§FILM_ISOLATE beat=' + B.id + ' parts of the same host: ' + isoInfo.siblings + ', host drawn: ' + isoInfo.host + ', isolate size ' + isoInfo.isolate_size + '; pulled back with the wheel: camera ' + beat.out.from_camera_m + ' -> ' + beat.out.camera_to_element_m + ' m from the part, ' + on + ' frames');
    await clockOff(); await L.sleep(800);
    beat.rects_after = await rects(); beat.after = await shot('v/' + B.id + '_after.png'); beat.isolate_after_iso = await iso(); await pg.evaluate(() => window.APP.filterByGuids(null)); await L.sleep(800); beat.isolate_after = await iso();
    beat.panel_after = await pg.evaluate(() => ({ selected: (document.getElementById('find-selected-text') || {}).textContent || '', info_name: (document.getElementById('info-name') || {}).textContent || '', info_class: (document.getElementById('info-class') || {}).textContent || '' }));
    log('§FILM_SHOT beat=' + B.id + ' frames=' + frames.length + ' (50 of the Viewer\'s own fly + pulled back) crop=scene(87,181,907,358)@1.5+panel(slices)@2.0 target_guid=' + guid + ' target_to_transform_center_m=' + beat.fly.target_to_element_m + ' target_to_geometry_m=' + beat.fly.miss_m + ' camera_to_element_m=' + beat.fly.camera_to_element_m + ' expected_cam_dist_m=' + beat.fly.expected_cam_dist_m + ' steps_with_motion=' + moved + ' isolate before=' + beat.isolate_before_click + ' after=' + beat.isolate_after + ' count="' + beat.panel.count + '" class=' + target.cls + ' storey=' + target.storey);
  }
  // the isolate log over the whole session: does the shell-ghost lens (about 30 s after the first Find open, per the design note) set its own isolate?
  await L.sleep(35000); J.iso = await pg.evaluate(() => window.__isoLog); J.isolate_end = await iso();
  const ev = J.iso.map((e) => '+' + (e.t / 1000).toFixed(1) + 's=' + e.size).join(' '); log('§FILM_GHOST_WATCH changes=' + J.iso.length + ' [' + ev + '] end=' + J.isolate_end + ' ' + (J.iso.some((e) => e.size === 0) ? 'EMPTY ISOLATE SEEN' : 'no empty isolate seen') + '; session s=' + T());
  J.console = con; fs.writeFileSync(path.join(OUT, 'viewer.json'), JSON.stringify(J, null, 1));
  log('§FILM_VIEWER_DONE beats=' + Object.keys(J.beats).length + ' panel_checks_ok=' + Object.values(J.beats).filter((b) => b.panel_check.ok).length + '/' + Object.keys(J.beats).length);
  await br.close(); srv.close();
})().catch((e) => { console.log('§FILM_VIEWER_FAIL ' + (e && e.stack || e)); process.exit(1); });
