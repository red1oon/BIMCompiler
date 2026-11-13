#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: the pictures of docs/CapexUATGuide.md chapter B (the Shed 2D drawing set through the Modeller). Spec: bim-ootb prompts/CAPEX_DASHBOARD.md §5.65 + §5.77.
// Pictures are TEACHING material, never evidence. Each is taken from the REAL Modeller page, in software GL (no GPU), by this script: nothing is drawn by hand.
// Two guide-only additions, both placed from the page's own DOM: a label chip naming what the picture shows, and a pointer ring at the bounding box of the control the step clicks.
// READ shots.log after every run: §UAT_SHOT lines carry the facts each picture was taken at (sheets, roles, verdict, parts); §PAGEERR or a missing fact = not a usable picture.
// usage: BIMOOTB=<bim-ootb checkout of origin/main> SHED_SHEETS=<dir of the 9 shed sheets> node scripts/guide/uat_shed_shots.js <out dir>
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process'), http = require('http');
const puppeteer = require(path.join(process.env.HOME, 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.resolve(process.argv[2] || '.'), ROOT = process.env.BIMOOTB, SHD = (process.env.SHED_SHEETS || path.join(os.homedir(), 'Projects/SYSNOVA/DXF2BIM/ShedDrawing/sheets')) + '/';
if (!ROOT || !fs.existsSync(path.join(ROOT, 'modeller/modeller.html'))) { console.log('§UAT_SHOT FAIL set BIMOOTB to a bim-ootb checkout'); process.exit(2); }
if (!fs.existsSync(SHD + '0_FLOOR_PLAN.dxf')) { console.log('§UAT_SHOT SKIP shed sheets not found at ' + SHD); process.exit(2); }
const LOG = []; const log = m => { console.log(m); LOG.push(m); }, sleep = ms => new Promise(r => setTimeout(r, ms));
// the nine sheets with their settings written in, by the product's own CLI (the same line W-SHED-CHAIN uses, modeller/tests/witness_dxf_shed_chain.js)
const NAMES = ['0_FLOOR_PLAN', '1S_ELEV_SOUTH', '1N_ELEV_NORTH', '2_ELEV_WEST', '7_ELEV_EAST', '3_BEAM_LAYOUT', '4_FOUNDATION_LAYOUT', '8_SECTION_AA_TRUSS', '5_DETAILS'];
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'uatshed-'));
const cli = cp.spawnSync('node', [path.join(ROOT, 'modeller/dxf2bim_cli.js'), '--sheets'].concat(NAMES.map(x => SHD + x + '.dxf'), ['--out', TMP, '--complete', '--ifc', '--accept-suggestions', '--set', 'SHED', '--level', '0',
  '--datum', '1S_ELEV:0.6096@-4446.6', '--datum', '1N_ELEV:0.6096@-3895.2', '--datum', '2_ELEV:0.6096@-4515.7264', '--datum', '7_ELEV:0.6096@-3766.442', '--datum', '8_SECTION:0.6096@-3726.416',
  '--layer', 'plan:Col=column', '--layer', 'elev:0=column@1S_ELEV', '--layer', 'plan:Fo=footing', '--layer', 'plan:Dim=beam@3_BEAM', '--layer', 'elev:Wall=panel', '--layer', 'elev:Rod=fan', '--layer', 'elev:Dim=net', '--layer', 'plan:Rod=doorswing@0_FLOOR', '--layer', 'section:Fo=bar', '--layer', 'elev:Win=elevdoor',
  '--bodyz', 'footing=-1.4478,-1.143', '--exclude', '3_BEAM:-20880,-5600,-20845,-4950', '--bodyz', 'beam=3.098794,3.352794']), { encoding: 'utf8' });
const MDIR = path.join(TMP, 'marked'), marked = fs.existsSync(MDIR) ? fs.readdirSync(MDIR).filter(f => /\.dxf$/i.test(f)).sort().map(f => path.join(MDIR, f)) : [];
log('§UAT_SHOT cli rc=' + cli.status + ' marked=' + marked.length + ' ' + marked.map(f => path.basename(f)).join(','));
if (marked.length !== 9) { log('§UAT_SHOT FAIL the CLI did not write 9 marked sheets'); process.exit(1); }
const pick = k => marked.find(f => path.basename(f).indexOf(k) >= 0);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.stat(f, (e, s) => { if (e || s.isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const SITE = 'http://localhost:' + srv.address().port + '/modeller/modeller.html';
  const br = await puppeteer.launch({ headless: 'new', protocolTimeout: 900000, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--window-size=1440,810'] });
  const pg = await br.newPage(); await pg.setViewport({ width: 1440, height: 810, deviceScaleFactor: 1.5 });
  let errs = 0; pg.on('pageerror', e => { errs++; log('§PAGEERR ' + String(e.message).slice(0, 200)); });
  const fresh = async () => { await pg.goto(SITE, { timeout: 120000 }); await pg.waitForFunction('window.__sceneReady===true && window.DxfImportUI && window.A && window.A.scene', { timeout: 120000 }); await sleep(1200); };
  const openSheets = async (files, arrange) => { await pg.evaluate(a => { window.DxfImportUI.state.arrangeOnOpen = a; }, !!arrange); await pg.click('#b-open'); await pg.waitForSelector('#m-open-panel .mo-row[data-key="__dxf"]', { visible: true, timeout: 20000 });
    const [ch] = await Promise.all([pg.waitForFileChooser({ timeout: 20000 }), pg.click('#m-open-panel .mo-row[data-key="__dxf"]')]); await ch.accept(files);
    await pg.waitForFunction(n => window.DxfMetaEditor && window.DxfMetaEditor.state.sheets.length === n && !window.DxfMetaEditor.state.busy && window.DxfMetaEditor.state.verdict, { timeout: 300000, polling: 200 }, files.length); await sleep(arrange ? 9000 : 1500); };
  const closeMeta = async () => { for (let g = 0; g < 10; g++) { const open = await pg.evaluate(() => { const e = document.getElementById('dm-panel'); return !!(e && e.style.display !== 'none' && e.getBoundingClientRect().width > 0); }); if (!open) return; if (await pg.$('#dm-close')) await pg.click('#dm-close'); await sleep(600); } };
  const fold = async want => { const slim = await pg.evaluate(() => !!window.DxfImportUI.state.slim); if (slim !== want && await pg.$('#dxf-fold')) { await pg.click('#dxf-fold'); await sleep(600); } };
  // canvas-only pictures: the two panels are put out of the way (display only; the sheets stay loaded), the outliner is cropped off, and the sheet lines are drawn at full strength so they print
  const canvasOnly = on => pg.evaluate(on => { ['dxf-panel', 'dm-panel'].forEach(id => { const e = document.getElementById(id); if (e) { if (on) { e.dataset.uatDisp = e.style.display; e.style.display = 'none'; } else if (e.dataset.uatDisp !== undefined) { e.style.display = e.dataset.uatDisp; delete e.dataset.uatDisp; } } });
    let n = 0; window.A.scene.traverse(o => { if (o.isLineSegments && o.material && o.material.transparent) { if (on) { if (o.userData.uatOp === undefined) o.userData.uatOp = o.material.opacity; o.material.opacity = 1; n++; } else if (o.userData.uatOp !== undefined) { o.material.opacity = o.userData.uatOp; delete o.userData.uatOp; } } }); if (window.A.requestRender) window.A.requestRender(); return n; }, on);
  const canvasClip = () => pg.evaluate(() => { const o = document.querySelector('#outliner, .outliner, #bo-tree'); let x = 0; if (o) { let e = o; while (e.parentElement && e.parentElement !== document.body) e = e.parentElement; const b = e.getBoundingClientRect(); if (b.left < 5 && b.width < 600) x = Math.ceil(b.right); } return { x: x, y: 0, width: window.innerWidth - x, height: window.innerHeight }; });
  // guide-only additions, from the DOM: a label chip, a pointer ring at a control's bounding box
  const label = t => pg.evaluate(t => { let e = document.getElementById('uat-label'); if (!e) { e = document.createElement('div'); e.id = 'uat-label'; e.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;background:#12263a;color:#fff;font:600 17px/1.2 system-ui,sans-serif;padding:9px 18px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none'; document.body.appendChild(e); } e.textContent = t; e.style.display = t ? 'block' : 'none'; }, t);
  const pointer = sel => pg.evaluate(sel => { let e = document.getElementById('uat-ptr'); if (!e) { e = document.createElement('div'); e.id = 'uat-ptr'; e.style.cssText = 'position:fixed;z-index:99998;border:3px solid #e8372c;border-radius:10px;box-shadow:0 0 0 4px rgba(232,55,44,.25);pointer-events:none'; document.body.appendChild(e); }
    if (!sel) { e.style.display = 'none'; return null; } const t = document.querySelector(sel); if (!t) { e.style.display = 'none'; return null; } const b = t.getBoundingClientRect(); e.style.display = 'block'; e.style.left = (b.left - 5) + 'px'; e.style.top = (b.top - 5) + 'px'; e.style.width = (b.width + 4) + 'px'; e.style.height = (b.height + 4) + 'px'; return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; }, sel);
  // look at the 2D sheets: straight on to a single flat sheet, or from above at an angle for the arranged set
  const frame = iso => pg.evaluate(iso => { const A = window.A, T = window.THREE, c = A.camera, ctl = A.controls, g = A.scene.children.filter(o => /^dxf-(arrange|sheets)/.test(o.name || '') && o.visible && o.children.length)[0]; if (!g) return { none: A.scene.children.map(o => (o.name || o.type) + ':' + o.visible + ':' + o.children.length).filter(x => /dxf/i.test(x)) };
    const b = new T.Box3().setFromObject(g), ctr = b.getCenter(new T.Vector3()), sz = b.getSize(new T.Vector3()), th = Math.tan(c.fov * Math.PI / 360), asp = c.aspect;
    const dims = [sz.x, sz.y, sz.z], thin = iso ? 2 : dims.indexOf(Math.min.apply(null, dims)), dir = iso ? new T.Vector3(0.45, -0.7, 0.75).normalize() : new T.Vector3(thin === 0 ? 1 : 0, thin === 1 ? -1 : 0, thin === 2 ? 1 : 0);
    const w = thin === 0 ? sz.y : sz.x, h = thin === 2 ? sz.y : sz.z, d = iso ? Math.max(sz.x, sz.y, sz.z) * 0.5 / th * 1.25 : Math.max(h / 2 / th, w / 2 / (th * asp)) * 1.12;
    c.up.set(0, thin === 2 && !iso ? 1 : 0, thin === 2 && !iso ? 0 : 1); c.position.copy(ctr).addScaledVector(dir, d); ctl.target.copy(ctr); c.near = Math.max(0.01, d / 500); c.far = d * 20; c.updateProjectionMatrix(); ctl.update();
    return { group: g.name, size: [+sz.x.toFixed(2), +sz.y.toFixed(2), +sz.z.toFixed(2)], thin: thin }; }, !!iso);
  const facts = () => pg.evaluate(() => { const E = window.DxfMetaEditor.state, U = window.DxfImportUI.state; return { sheets: (U.sheets || E.sheets).map(s => (s.name || s.file || '?') + ':' + (s.role || s.view || '?')), verdict: typeof E.verdict === 'string' ? E.verdict : (E.verdict && (E.verdict.text || E.verdict.state || JSON.stringify(E.verdict).slice(0, 80))), bodies: U.gate && U.gate.structure ? U.gate.structure.bodies : null }; });
  const shot = async (name, note, clip) => { await sleep(700); await pg.screenshot(Object.assign({ path: path.join(OUT, name + '.png') }, clip ? { clip } : {})); log('§UAT_SHOT file=' + name + '.png ' + note + (clip ? ' clip=' + JSON.stringify(clip) : '')); };

  // 1 — where the drawings are opened
  await fresh(); await pg.click('#b-open'); await pg.waitForSelector('#m-open-panel .mo-row[data-key="__dxf"]', { visible: true }); await sleep(500);
  const pb = await pointer('#m-open-panel .mo-row[data-key="__dxf"]'); await label('Modeller · Open ▸ Open 2D drawings (.dxf)');
  await shot('uat_b1_open_menu', 'pointer=' + JSON.stringify(pb)); await pointer(null);
  // 2 — single sheets, each on its own. Plan sheets only: an elevation or section opened alone draws nothing (it stands on a plan); measured: dxf-sheets children=0
  for (const [key, title] of [['0_FLOOR_PLAN', 'Shed · Floor plan'], ['3_BEAM_LAYOUT', 'Shed · Beam layout'], ['4_FOUNDATION_LAYOUT', 'Shed · Foundation layout']]) {
    await fresh(); await openSheets([pick(key)], false); const f = await facts(); await closeMeta(); const nl = await canvasOnly(true); const fr = await frame(false);
    await label(title + ' · sheet ' + key + '.dxf'); await shot('uat_b1_sheet_' + key.toLowerCase(), 'sheets=' + JSON.stringify(f.sheets) + ' lines=' + nl + ' frame=' + JSON.stringify(fr), await canvasClip());
  }
  // 3 — the nine sheets opened together: the 2D Drawings panel and the metadata panel
  await fresh(); await openSheets(marked, true); const f9 = await facts(); await label('Shed · all nine sheets opened');
  await shot('uat_b1_nine_opened', 'sheets=' + f9.sheets.length + ' ' + JSON.stringify(f9.sheets) + ' verdict=' + JSON.stringify(f9.verdict) + ' bodies=' + f9.bodies);
  // 4 — the arranged 2D sheets alone
  await closeMeta(); await canvasOnly(true); const fa = await frame(true); await label('Shed · the nine 2D sheets arranged in place'); await shot('uat_b1_arranged', 'frame=' + JSON.stringify(fa), await canvasClip());
  const ft = await frame(false); await label('Shed · the arranged sheets seen from above'); await shot('uat_b1_arranged_top', 'frame=' + JSON.stringify(ft), await canvasClip()); await canvasOnly(false);
  // 5 — Convert
  await fold(false); if (await pg.$('#dxf-complete') && !(await pg.$eval('#dxf-complete', e => e.checked))) { await pg.click('#dxf-complete'); await sleep(2500); }
  const pc = await pointer('#dxf-convert'); await label('Shed · tick Complete, then press Convert'); await shot('uat_b2_convert_button', 'pointer=' + JSON.stringify(pc) + ' complete=' + (await pg.evaluate(() => { const e = document.getElementById('dxf-complete'); return !!(e && e.checked); }))); await pointer(null);
  await pg.click('#dxf-convert'); await pg.waitForFunction('window.DxfImportUI.state.last && window.DxfImportUI.state.last.nInserts > 0', { timeout: 300000 }); await sleep(2500);
  const n = await pg.evaluate(() => window.DxfImportUI.state.last.nInserts);
  await closeMeta(); await pg.evaluate(() => { ['dxf-panel', 'dm-panel'].forEach(id => { const e = document.getElementById(id); if (e) { e.dataset.uatDisp = e.style.display; e.style.display = 'none'; } }); }); await sleep(300); if (await pg.$('#b-fit')) { await pg.click('#b-fit'); await sleep(1800); }
  await label('Shed · converted to a 3D model (' + n + ' parts)'); await shot('uat_b2_converted', 'inserts=' + n, await canvasClip());
  // 6 — Export ▸ Viewer database
  await pg.click('#b-export'); await pg.waitForSelector('#m-export-panel .me-row[data-key="vdb"]', { visible: true }); await sleep(600);
  const pe = await pointer('#m-export-panel .me-row[data-key="vdb"]'); await label('Modeller · Export ▸ Viewer database (.db)'); await shot('uat_b2_export_menu', 'pointer=' + JSON.stringify(pe));
  log('§UAT_SHOT_DONE pageerrors=' + errs + ' out=' + OUT);
  fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n'); await br.close(); srv.close(); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(errs ? 1 : 0);
})().catch(e => { log('§UAT_SHOT FAIL ' + (e && e.stack || e)); try { fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n'); } catch (x) {} process.exit(1); });
