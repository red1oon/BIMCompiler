// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" (prompts/FILM_LOD_UPGRADE_FIND.md), beat 2. READ THE LOG after every run; the exit code is not evidence.
// The REAL Modeller (read-only `git archive origin/main` export of bim-ootb, bim-ootb #3232: ARC seed draws element_parts children and generated parts, not a host whose parts are present), opened on JPAM_film.db
// through the Open chooser's local-file input. One framing per upgrade command, by the Modeller's own Bonsai.selectByGuid (-> frameFeature -> _frameTo, an 1100 ms ease), captured FRAME BY FRAME on a virtual clock
// (performance.now and requestAnimationFrame are replaced; one capture = 1000/24 ms of the Modeller's own animation). Device scale 2. The framing centre is the Modeller's own §FRAME_FEATURE line and is
// compared with the element's own transform row in the DB. Usage: node capture_modeller.js <bim-ootb export dir> <JPAM_film.db> <out dir>
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const L = require('./lib.js');
const TREE = path.resolve(process.argv[2]), DB = path.resolve(process.argv[3]), OUT = path.resolve(process.argv[4]); fs.mkdirSync(path.join(OUT, 'm'), { recursive: true });
const PORT = +(process.env.PORT || 8762);
const BEATS = [   // one per upgrade command; the element is the first hit of the Find term the Viewer beat types (same order as the panel's own SQL), a wall's layer for the layers
  { id: 'mod_conn', guid: 'GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-PL', what: 'fin plate', only: ['GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-PL', 'GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-BT', 'GEN-CR-3D5QSRXD1ErO1q65K0AzsZ-B-WD'] },
  { id: 'mod_layers', guid: 'GEN-LY-0HXMLqIt99pQaffYvMYxGm-2', what: 'wall layer (gypsum board)' },
  { id: 'mod_rebar', guid: 'GEN-RB-1ys0ZPPjX6tO0ZNAbl4tBB-BOT', what: 'bottom bars of a beam' },
  { id: 'mod_gusset', guid: 'GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-BT', what: 'gusset bolts', only: ['GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-PL', 'GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-BT', 'GEN-GU-3D5QSRXD1ErO1q65K0AzcC-A-WD'] }
];
const J = { made: new Date().toISOString(), beats: {} };
const log = (m) => console.log(m);
(async () => {
  const srv = await L.serve(TREE, PORT), br = await L.launch(), pg = await br.newPage(); await pg.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
  const t0 = Date.now(), T = () => ((Date.now() - t0) / 1000).toFixed(1), con = [];
  pg.on('console', (m) => { const t = m.text(); if (/§ARC-SEED building|§MOD_PARTS_VIEW|§FRAME_FEATURE|§FRAME_GUID|§MODELLER-OPEN chooser pick|§GEOM-HARDFAIL/.test(t)) con.push('[' + T() + '] ' + t.slice(0, 300)); }); pg.on('pageerror', (e) => log('§FILM_PAGEERROR ' + String(e).slice(0, 200)));
  await pg.goto('http://127.0.0.1:' + PORT + '/modeller/modeller.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await pg.waitForFunction('window.__sceneReady===true', { timeout: 120000 });
  await pg.click('#b-open'); await pg.waitForSelector('#m-open-panel .mo-row[data-key="__local"]', { visible: true });
  const [ch] = await Promise.all([pg.waitForFileChooser(), pg.click('#m-open-panel .mo-row[data-key="__local"]')]); await ch.accept([DB]);
  await pg.waitForFunction(() => window.__arcFidByGuid && Object.keys(window.__arcFidByGuid).length > 100, { timeout: 300000 });
  await pg.waitForFunction(() => !/verifying/i.test(document.body.innerText), { timeout: 45000 }).catch(() => log('§FILM_WARN the Modeller still says "verifying" after 45 s (its own status text; the seed is done: §ARC-SEED line above)'));
  await L.sleep(3000);
  const seed = con.filter((l) => /§ARC-SEED building/.test(l)).pop(), mpv = con.filter((l) => /§MOD_PARTS_VIEW/.test(l)).pop();
  J.seed_line = (seed || '').replace(/^\[[\d.]+\] /, ''); J.mod_parts_view_line = (mpv || '').replace(/^\[[\d.]+\] /, ''); log('§FILM_MODELLER ' + J.seed_line); log('§FILM_MODELLER ' + J.mod_parts_view_line);
  // the virtual clock (performance.now + requestAnimationFrame), then every capture is one 1000/24 ms step
  await pg.evaluate(() => { const c = window.__clock = { map: new Map(), id: 0, vt: performance.now() }; performance.now = () => c.vt;
    window.requestAnimationFrame = (cb) => { c.map.set(++c.id, cb); return c.id; }; window.cancelAnimationFrame = (id) => { c.map.delete(id); };
    window.__step = (ms) => { c.vt += (ms == null ? 1000 / 24 : ms); const q = Array.from(c.map.values()); c.map.clear(); q.forEach((cb) => { try { cb(c.vt); } catch (e) { /* the app's own handling */ } }); return q.length; }; });
  const step = (n, ms) => pg.evaluate((k, m) => { for (let i = 0; i < k; i++) window.__step(m); }, n || 1, ms);
  const shot = async (rel, type) => { await pg.screenshot({ path: path.join(OUT, rel), type: type || 'png', quality: type === 'jpeg' ? 92 : undefined }); return rel; };
  // the starting view: the Modeller's own "Zoom to fit", clicked
  await pg.click('#b-fit'); await step(40, 50); await L.sleep(500); await step(4); J.start = await shot('m/start.png'); log('§FILM_SHOT beat=mod_start frames=1 crop=whole window target_guid=- target_to_element_m=- (Zoom to fit)');
  const rects = await pg.evaluate(() => { const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }; return { canvas: R('canvas'), outliner: R('#bonsai-outliner') || R('.outliner'), stat: R('#stat') }; });
  J.rects = rects;
  const dbCentre = (guid) => pg.evaluate((g) => { const db = new window.SQL.Database(new Uint8Array(window.__dwBuf)); try { const r = db.exec("SELECT (r.minX+r.maxX)/2, (r.minY+r.maxY)/2, (r.minZ+r.maxZ)/2, r.maxX-r.minX, r.maxY-r.minY, r.maxZ-r.minZ FROM elements_rtree r WHERE r.id = (SELECT rowid FROM elements_meta WHERE guid='" + g + "')"); const t = db.exec("SELECT center_x, center_y, center_z FROM element_transforms WHERE guid='" + g + "'"); return r[0].values[0].concat(t[0].values[0]); } finally { db.close(); } }, guid);   // the geometry's own bounds (elements_rtree), then element_transforms.center
  const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (const B of BEATS) {
    const beat = { guid: B.guid, what: B.what }; J.beats[B.id] = beat;
    await pg.evaluate(() => window.Bonsai.setAllVisible && window.Bonsai.setAllVisible());
    if (B.only) { beat.hidden = await pg.evaluate((keep) => { let n = 0; Object.keys(window.__arcFidByGuid).forEach((g) => { if (keep.indexOf(g) < 0 && window.Bonsai.setFeatureVisible(window.__arcFidByGuid[g], false)) n++; }); return n; }, B.only); beat.kept = B.only.length;
      log('§FILM_HIDE beat=' + B.id + ' every seeded feature but the joint\'s own ' + B.only.length + ' parts is hidden: features_hidden=' + beat.hidden + ' (the Outliner eye\'s own call, Bonsai.setFeatureVisible)'); await step(6); }
    beat.before = await shot('m/' + B.id + '_before.png');
    const nc = con.length, has = await pg.evaluate((g) => ({ fid: window.__arcFidByGuid && window.__arcFidByGuid[g] != null, anchor: !!(window.__arcAnchorGuids && window.__arcAnchorGuids.has(g)) }), B.guid); beat.seeded = has;
    const sel = await pg.evaluate((g) => window.Bonsai.selectByGuid(g), B.guid);   // select + the Modeller's own fly (frameFeature -> _frameTo)
    await L.sleep(200); const fr = con.slice(nc).filter((l) => /§FRAME_FEATURE|§FRAME_GUID/.test(l)).pop() || ''; beat.frame_line = fr.replace(/^\[[\d.]+\] /, '');
    const frames = []; let n = 0; const grab = async () => { n++; const f = 'm/' + B.id + '_fly_' + String(n).padStart(3, '0') + '.jpg'; await shot(f, 'jpeg'); frames.push(f); };
    await grab(); for (let i = 0; i < 27; i++) { await step(1); await grab(); }   // 1100 ms ease at 1000/24 ms steps = 26.4 steps, then it holds
    await step(4); beat.after = await shot('m/' + B.id + '_after.png'); beat.frames = frames;
    const m = /centre=\[([-\d.]+),([-\d.]+),([-\d.]+)\] dist=([\d.]+)/.exec(beat.frame_line), dbc = await dbCentre(B.guid);
    beat.db_center = dbc.slice(0, 3); beat.db_bbox = dbc.slice(3, 6); beat.transform_center = dbc.slice(6, 9); beat.transform_center_to_geometry_m = +d3(beat.transform_center, beat.db_center).toFixed(3); beat.frame_centre = m ? [+m[1], +m[2], +m[3]] : null; beat.frame_dist = m ? +m[4] : null;
    beat.target_to_element_m = m ? +d3(beat.frame_centre, beat.db_center).toFixed(4) : null; beat.status = await pg.evaluate(() => (document.getElementById('stat') || {}).textContent || '');
    log('§FILM_SHOT beat=' + B.id + ' frames=' + frames.length + ' crop=window band(0,181,1280,358)@1.5 target_guid=' + B.guid + ' target_to_element_m=' + beat.target_to_element_m + ' transform_center_to_geometry_m=' + beat.transform_center_to_geometry_m + ' selected=' + sel + ' hidden=' + (beat.hidden || 0) + ' seeded=' + JSON.stringify(has) + ' ' + beat.frame_line);
  }
  J.console = con; fs.writeFileSync(path.join(OUT, 'modeller.json'), JSON.stringify(J, null, 1));
  log('§FILM_MODELLER_DONE beats=' + Object.keys(J.beats).length + ' all_target_to_element_within_5cm=' + Object.values(J.beats).every((b) => b.target_to_element_m != null && b.target_to_element_m <= 0.05));
  await br.close(); srv.close();
})().catch((e) => { console.log('§FILM_MODELLER_FAIL ' + (e && e.stack || e)); process.exit(1); });
