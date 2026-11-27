// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" rc3 (prompts/FILM_LOD_UPGRADE_FIND.md "FILM rc3 SPEC"): the Modeller's Upgrade pill, run for real. READ THE LOG after every run; the exit code is not evidence.
// The REAL Modeller (read-only `git archive origin/main` export of bim-ootb with #3268), one model per run:
//   MODEL=B  the combined model with no added row (JPAM_base.db): open the Upgrade dialog, Run Steel joints, Run Bracing gussets, Load schedule + Run Beam rebar, Add-on IFC (IFC2X3, no frame file).
//   MODEL=A  the architecture extract as read: Run Layers.
// Every click is the page's own control (the dialog's buttons; the file inputs through the browser's file chooser). The page's own § lines are kept verbatim per beat. Framing = the Modeller's own
// Bonsai.selectByGuid (-> _frameTo, 1100 ms) on a VIRTUAL clock that is switched OFF while a pack runs (the run's 25 ms slices need the real clock; the beam rebar run is captured at real time, which is the point:
// the page keeps painting). Device scale 2. SHOTS=0 = a smoke run (no screenshots, software GL is fine). Usage: MODEL=A|B node capture_pill.js <bim-ootb export> <db> <out dir> [marks json] [storeys json]
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./lib.js');
const TREE = path.resolve(process.argv[2]), DB = path.resolve(process.argv[3]), OUT = path.resolve(process.argv[4]), MARKS = process.argv[5] && path.resolve(process.argv[5]), STOREYS = process.argv[6] && path.resolve(process.argv[6]);
const MODEL = process.env.MODEL || 'B', SHOTS = process.env.SHOTS !== '0', PORT = +(process.env.PORT || (MODEL === 'A' ? 8771 : 8772));
fs.mkdirSync(path.join(OUT, 'p'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'dl'), { recursive: true });
const FRAME = {   // the element each beat frames: the first hit of the Find term the Viewer beat types (rc1's choice), so the two halves show the same part
  mod_layers: { guid: 'GEN-LY-0HXMLqIt99pQaffYvMYxGm-2', what: 'wall layer (gypsum board)' },
  mod_joints: { guid: 'GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-PL', what: 'fin plate', only: ['GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-PL', 'GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-BT', 'GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-WD'] },
  mod_gussets: { guid: 'GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-BT', what: 'gusset bolts', only: ['GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-PL', 'GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-BT', 'GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-WD'] },
  mod_beambars: { guid: 'GEN-RB-1ys0ZPPjX6tO0ZNAbl4tBB-BOT', what: 'bottom bars of a beam' }
};
const J = { made: new Date().toISOString(), model: MODEL, db: path.basename(DB), beats: {} }, log = (m) => console.log(m);
(async () => {
  const srv = await L.serve(TREE, PORT), br = await L.launch(), pg = await br.newPage(); await pg.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
  const cdp = await pg.target().createCDPSession(); await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(OUT, 'dl') });
  const t0 = Date.now(), T = () => ((Date.now() - t0) / 1000).toFixed(1), con = [];
  pg.on('console', (m) => { const t = m.text(); con.push(t); if (/§LODUP|§ARC-SEED building|§MOD_PARTS_VIEW|§FRAME_FEATURE/.test(t)) log('[page ' + T() + '] ' + t.slice(0, 400)); }); pg.on('pageerror', (e) => log('§FILM_PAGEERROR ' + String(e).slice(0, 300)));
  await pg.goto('http://127.0.0.1:' + PORT + '/modeller/modeller.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await pg.waitForFunction('window.__sceneReady===true', { timeout: 120000 });
  await pg.click('#b-open'); await pg.waitForSelector('#m-open-panel .mo-row[data-key="__local"]', { visible: true });
  const [ch] = await Promise.all([pg.waitForFileChooser(), pg.click('#m-open-panel .mo-row[data-key="__local"]')]); await ch.accept([DB]);
  await pg.waitForFunction(() => window.__arcFidByGuid && Object.keys(window.__arcFidByGuid).length > 100 && window.Bonsai && window.Bonsai.oplog && window.Bonsai.oplog.db, { timeout: 600000 });
  await pg.waitForFunction(() => !/verifying/i.test(document.body.innerText), { timeout: 60000 }).catch(() => log('§FILM_WARN still "verifying" after 60 s'));
  await L.sleep(3000);
  J.seed_line = con.filter((l) => /§ARC-SEED building/.test(l)).pop() || ''; log('§FILM_PILL_OPEN model=' + MODEL + ' db=' + J.db + ' ' + J.seed_line.slice(0, 200));
  // the switchable virtual clock: ON = one capture is one 1000/24 ms step of the Modeller's own animation; OFF = real time (monotonic across the switch)
  await pg.evaluate(() => { const rn = performance.now.bind(performance), rr = window.requestAnimationFrame.bind(window), rc = window.cancelAnimationFrame.bind(window);
    const c = window.__clock = { map: new Map(), id: 0, vt: 0, on: false, off: 0 }; performance.now = () => c.on ? c.vt : rn() + c.off;
    window.requestAnimationFrame = (cb) => { if (c.on) { c.map.set(++c.id, cb); return -c.id; } return rr(cb); }; window.cancelAnimationFrame = (id) => { if (id < 0) c.map.delete(-id); else rc(id); };
    c.set = (on) => { if (on && !c.on) { c.vt = rn() + c.off; c.on = true; } else if (!on && c.on) { c.off = c.vt - rn(); c.on = false; const q = Array.from(c.map.values()); c.map.clear(); q.forEach((cb) => rr(cb)); } };
    window.__step = (ms) => { c.vt += (ms == null ? 1000 / 24 : ms); const q = Array.from(c.map.values()); c.map.clear(); q.forEach((cb) => { try { cb(c.vt); } catch (e) { /* the app's own handling */ } }); return q.length; }; });
  const clock = (on) => pg.evaluate((o) => window.__clock.set(o), on), step = (n, ms) => pg.evaluate((k, m) => { for (let i = 0; i < k; i++) window.__step(m); }, n || 1, ms);
  let nShot = 0; const shot = async (rel, type) => { if (!SHOTS) return null; nShot++;
    // rc4 S3: the dialog as its own clip, then the scene with the dialog hidden (so the scene pane can show the whole canvas); the clip is <rel>.panel.png
    const pr = await pg.evaluate(() => { const P = document.getElementById('m-lodup-panel'); if (!P || P.style.display === 'none' || P.style.visibility === 'hidden') return null; const r = P.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    if (pr) { await pg.screenshot({ path: path.join(OUT, rel + '.panel.png'), clip: pr }); await pg.evaluate(() => { document.getElementById('m-lodup-panel').style.visibility = 'hidden'; }); await step(1, 0); }
    await pg.screenshot({ path: path.join(OUT, rel), type: type || 'png', quality: type === 'jpeg' ? 92 : undefined });
    if (pr) { await pg.evaluate(() => { document.getElementById('m-lodup-panel').style.visibility = ''; }); await step(1, 0); }
    return rel; };
  // rc4 S2: the Modeller's Zoom to fit frames the SELECTION when there is one (fitView, modeller.html l.553): press Escape first (its own deselect, l.4335)
  const fitAll = async () => { await pg.keyboard.press('Escape'); await step(2); await pg.click('#b-fit'); await step(40, 50); await step(4); };
  const rects = () => pg.evaluate(() => { const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }; return { panel: R(document.getElementById('m-lodup-panel')), canvas: R(document.querySelector('canvas')), pill: R(document.getElementById('b-lodup')) }; });
  const panelState = () => pg.evaluate(() => { const P = document.getElementById('m-lodup-panel'); if (!P) return null; return { shown: P.style.display !== 'none', rows: [...P.querySelectorAll('.lu-row')].map((r) => ({ id: r.dataset.id, label: (r.querySelector('b') || {}).textContent, applies: (r.querySelector('[data-k=applies]') || {}).textContent, text: (r.querySelector('.lu-s') || {}).textContent, status: (P.querySelector('[data-st="' + r.dataset.id + '"]') || {}).textContent })), ifc: (P.querySelector('[data-st-ifc]') || {}).textContent, ifcBtn: (() => { const b = P.querySelector('.lu-ifc'); return b ? { disabled: b.disabled, title: b.title } : null; })() }; });
  const rowRect = (id) => pg.evaluate((i) => { const e = i === 'ifc' ? document.querySelector('#m-lodup-panel .lu-ifcrow') : document.querySelector('#m-lodup-panel .lu-row[data-id="' + i + '"]'); if (!e) return null; const r = e.getBoundingClientRect(), d = i === 'ifc' ? document.querySelector('#m-lodup-panel [data-st-ifc]') : null, rd = d ? d.getBoundingClientRect() : null; return { x: r.x, y: r.y, w: r.width, h: (rd ? rd.bottom : r.bottom) - r.y }; }, id);
  const panelShow = (on) => pg.evaluate((o) => { const P = document.getElementById('m-lodup-panel'); if (P) P.style.visibility = o ? '' : 'hidden'; }, on);
  const showRow = (id) => pg.evaluate((i) => { const r = document.querySelector('#m-lodup-panel .lu-row[data-id="' + i + '"]') || document.querySelector('#m-lodup-panel .lu-ifcrow'); if (r) r.scrollIntoView({ block: 'nearest' }); }, id);
  const liveGen = () => pg.evaluate(() => { const r = window.Bonsai.oplog.db.exec("SELECT output_guid, parameters FROM kernel_ops WHERE undone=0 AND op_type='GEOM_INSERT' AND output_guid LIKE 'GEN-%' ORDER BY output_guid"); return r.length ? r[0].values.map((v) => { const P = JSON.parse(v[1]), b = P.bbox, pl = P.placement; return [v[0], [pl.x, pl.y, pl.z + (b[5] - b[4]) / 2]]; }) : []; });
  const linesSince = (n0, re) => con.slice(n0).filter((l) => (re || /§LODUP/).test(l));
  await clock(true); await pg.click('#b-fit'); await step(40, 50); await L.sleep(500); await step(4);
  // ---- beat: the dialog (B only)
  const runBeat = async (id, pack, extra) => {
    const b = J.beats[id] = { id, pack }; await clock(true);
    await pg.evaluate(() => window.Bonsai.setAllVisible && window.Bonsai.setAllVisible()); await fitAll();   // every run starts from the whole model (Escape, then the Modeller's own Zoom to fit)
    await showRow(pack); await step(2); b.before = await shot('p/' + id + '_before.png'); b.panel_before = await panelState(); b.row_before = await rowRect(pack);
    if (extra) await extra(b);
    const n0 = con.length, tr = Date.now(); await clock(false);
    await pg.evaluate((p) => document.querySelector('#m-lodup-panel .lu-run[data-run="' + p + '"]').click(), pack);
    const live = []; let k = 0;
    while (Date.now() - tr < 1500000) { await L.sleep(SHOTS ? 50 : 500); if (con.slice(n0).some((l) => /§LODUP_COST pack=|§LODUP_RUN failed|VACUOUS/.test(l))) break; if (SHOTS && id === 'mod_beambars') { k++; await L.sleep(250); live.push({ t: +((Date.now() - tr) / 1000).toFixed(2), f: await shot('p/' + id + '_run_' + String(k).padStart(3, '0') + '.jpg', 'jpeg'), status: (await panelState()).rows.find((r) => r.id === pack).status }); } }
    b.run_s = +((Date.now() - tr) / 1000).toFixed(2); b.live = live; await L.sleep(2500); await clock(true); await step(6);
    b.lines = linesSince(n0); b.panel_after = await panelState(); await showRow(pack); await step(2); b.after_panel = await shot('p/' + id + '_after.png'); b.row_after = await rowRect(pack); b.panel_rect = (await rects()).panel;
    log('§FILM_PILL_RUN beat=' + id + ' pack=' + pack + ' run_s=' + b.run_s + ' live_frames=' + live.length + ' status="' + ((b.panel_after.rows.find((r) => r.id === pack) || {}).status || '') + '" lines=' + b.lines.length);
    b.lines.forEach((l) => log('§FILM_PILL_LINE beat=' + id + ' ' + l.slice(0, 400)));
    return b;
  };
  const frameBeat = async (id) => {
    const F = FRAME[id], b = J.beats[id]; b.guid = F.guid; b.what = F.what; await clock(true);
    await pg.evaluate(() => window.Bonsai.setAllVisible && window.Bonsai.setAllVisible());
    const gen = new Map(await liveGen()); b.part_centre = gen.get(F.guid) || null; b.seeded = await pg.evaluate((g) => window.__arcFidByGuid && window.__arcFidByGuid[g] != null, F.guid);
    if (F.only) { b.hidden = await pg.evaluate((keep) => { let n = 0; Object.keys(window.__arcFidByGuid).forEach((g) => { if (keep.indexOf(g) < 0 && window.Bonsai.setFeatureVisible(window.__arcFidByGuid[g], false)) n++; }); return n; }, F.only); await step(6); }
    await panelShow(false); await step(2); const n0 = con.length; await pg.evaluate((g) => window.Bonsai.selectByGuid(g), F.guid); await L.sleep(200);
    const frames = []; for (let i = 0; i < 28; i++) { if (i) await step(1); frames.push(await shot('p/' + id + '_fly_' + String(i + 1).padStart(3, '0') + '.jpg', 'jpeg')); }
    await step(4); b.after = await shot('p/' + id + '_framed.png'); b.frames = frames; await panelShow(true); await step(2);
    b.frame_line = (con.slice(n0).filter((l) => /§FRAME_FEATURE|§FRAME_GUID/.test(l)).pop() || ''); const m = /centre=\[([-\d.]+),([-\d.]+),([-\d.]+)\] dist=([\d.]+)/.exec(b.frame_line);
    b.frame_centre = m ? [+m[1], +m[2], +m[3]] : null; b.frame_dist = m ? +m[4] : null;
    b.target_to_part_m = (m && b.part_centre) ? +Math.hypot(b.frame_centre[0] - b.part_centre[0], b.frame_centre[1] - b.part_centre[1], b.frame_centre[2] - b.part_centre[2]).toFixed(3) : null;
    log('§FILM_PILL_FRAME beat=' + id + ' guid=' + F.guid + ' live=' + !!b.part_centre + ' seeded=' + b.seeded + ' hidden=' + (b.hidden || 0) + ' target_to_part_m=' + b.target_to_part_m + ' (the frame line shows 2 decimals) ' + b.frame_line);
    await pg.evaluate(() => window.Bonsai.setAllVisible && window.Bonsai.setAllVisible()); await step(4);
  };
  // the dialog
  const ob = J.beats.mod_open = { id: 'mod_open' }; ob.before = await shot('p/mod_open_before.png'); const n0 = con.length;
  await clock(false); await pg.click('#b-lodup'); await pg.waitForFunction(() => document.querySelectorAll('#m-lodup-panel .lu-row').length === 6, { timeout: 300000 }); await L.sleep(2500); await clock(true); await step(4);
  ob.lines = linesSince(n0); ob.panel = await panelState(); ob.after = await shot('p/mod_open_after.png'); J.rects = await rects(); ob.panel_rect = J.rects.panel;
  log('§FILM_PILL_DIALOG rows=' + ob.panel.rows.length + ' ' + ob.panel.rows.map((r) => r.id + ':"' + r.label + '" ' + (r.applies || '').trim()).join(' | ') + ' ifc_button=' + JSON.stringify(ob.panel.ifcBtn));
  if (MODEL === 'A') { await runBeat('mod_layers', 'layers'); await frameBeat('mod_layers'); }
  else {
    await runBeat('mod_joints', 'joints'); await frameBeat('mod_joints');
    await runBeat('mod_gussets', 'gussets'); await frameBeat('mod_gussets');
    await runBeat('mod_beambars', 'beambars', async (b) => {   // the schedule, through the row's own "Load schedule…" button
      const [fc] = await Promise.all([pg.waitForFileChooser({ timeout: 20000 }), pg.evaluate(() => document.querySelector('#m-lodup-panel .lu-load[data-load="beambars|schedule"]').click())]); await fc.accept([MARKS]); await L.sleep(2500); await step(4);
      b.panel_loaded = await panelState(); b.loaded = await shot('p/mod_beambars_loaded.png'); b.row_loaded = await rowRect('beambars'); const r = b.panel_loaded.rows.find((x) => x.id === 'beambars'); log('§FILM_PILL_SCHEDULE loaded applies="' + (r.applies || '').trim() + '" text="' + (r.text || '').slice(0, 160) + '"'); });
    await frameBeat('mod_beambars');
    // the Add-on IFC: IFC2X3 (the default), no frame file; the browser's own download
    const ib = J.beats.mod_ifc = { id: 'mod_ifc' }; await clock(true); await pg.evaluate(() => window.Bonsai.setAllVisible && window.Bonsai.setAllVisible()); await fitAll();
    // rc4 S4: show on the canvas what goes in the file: every original element hidden with the Outliner eye's own call, only the added parts stay
    ib.hidden_originals = await pg.evaluate(() => { let n = 0; Object.keys(window.__arcFidByGuid).forEach((g) => { if (!/^GEN-/.test(g) && window.Bonsai.setFeatureVisible(window.__arcFidByGuid[g], false)) n++; }); return n; }); await step(6);
    ib.shown_added = await pg.evaluate(() => Object.keys(window.__arcFidByGuid).filter((g) => /^GEN-/.test(g)).length); log('§FILM_PILL_IFC_SHOWN originals_hidden=' + ib.hidden_originals + ' added_parts_shown=' + ib.shown_added + ' (the Outliner eye call, Bonsai.setFeatureVisible)'); await showRow('ifc'); await step(2); ib.before = await shot('p/mod_ifc_before.png'); ib.panel_before = await panelState(); ib.row_before = await rowRect('ifc');
    // first press: the writer refuses when a storey has no elevation (none is invented); kept on screen
    const r0 = con.length; await clock(false); await pg.evaluate(() => document.querySelector('#m-lodup-panel .lu-ifc').click()); await pg.waitForFunction(() => /no elevation|parts,/.test((document.querySelector('#m-lodup-panel [data-st-ifc]') || {}).textContent || ''), { timeout: 600000 }); await L.sleep(1500);
    await clock(true); await step(4); ib.refusal_lines = linesSince(r0); ib.panel_refused = await panelState(); await showRow('ifc'); await step(2); ib.refused = await shot('p/mod_ifc_refused.png'); ib.row_refused = await rowRect('ifc');
    log('§FILM_PILL_IFC_FIRST status="' + ib.panel_refused.ifc + '"');
    // the storeys file through the row's own "Load frame…" button (storey heights only: no site placement, no shift)
    if (STOREYS) { const [fc2] = await Promise.all([pg.waitForFileChooser({ timeout: 20000 }), pg.evaluate(() => document.querySelector('#m-lodup-panel .lu-frame').click())]); await fc2.accept([STOREYS]); await L.sleep(2500); await step(4);
      ib.panel_framed = await panelState(); ib.frame_text = await pg.evaluate(() => (document.querySelector('#m-lodup-panel [data-k=frame]') || {}).textContent); await showRow('ifc'); await step(2); ib.framed = await shot('p/mod_ifc_framed.png'); ib.row_framed = await rowRect('ifc'); log('§FILM_PILL_IFC_FRAME panel says "' + ib.frame_text + '"'); }
    const before = new Set(fs.readdirSync(path.join(OUT, 'dl'))), i0 = con.length, ti = Date.now(); await clock(false);
    await pg.evaluate(() => document.querySelector('#m-lodup-panel .lu-ifc').click());
    let file = null; while (Date.now() - ti < 900000) { await L.sleep(500); const f = fs.readdirSync(path.join(OUT, 'dl')).filter((x) => !before.has(x) && /\.ifc$/.test(x)); if (f.length && con.slice(i0).some((l) => /§LODUP_IFC_WRITTEN/.test(l))) { await L.sleep(3000); file = path.join(OUT, 'dl', f[0]); break; } }
    await clock(true); await step(4); ib.lines = linesSince(i0); ib.panel_after = await panelState(); ib.after = await shot('p/mod_ifc_after.png'); ib.row_after = await rowRect('ifc'); ib.file = file; ib.bytes = file ? fs.statSync(file).size : null; ib.export_s = +((Date.now() - ti) / 1000).toFixed(2);
    log('§FILM_PILL_IFC file=' + (file ? path.basename(file) : 'NONE') + ' bytes=' + ib.bytes + ' status="' + ib.panel_after.ifc + '"'); ib.lines.forEach((l) => log('§FILM_PILL_LINE beat=mod_ifc ' + l.slice(0, 400)));
  }
  J.live_gen = (await liveGen()).map((x) => x[0]); J.heapMB = await pg.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
  fs.writeFileSync(path.join(OUT, 'pill_' + MODEL + '.json'), JSON.stringify(J, null, 1));
  log('§FILM_PILL_DONE model=' + MODEL + ' beats=' + Object.keys(J.beats).join(',') + ' live_generated=' + J.live_gen.length + ' shots=' + nShot + ' heapMB=' + J.heapMB + ' wall_s=' + T());
  await br.close(); srv.close();
})().catch((e) => { console.log('§FILM_PILL_FAIL ' + (e && e.stack || e)); process.exit(1); });
