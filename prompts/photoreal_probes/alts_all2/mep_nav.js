// ⚠ DO NOT REMOVE — MEP GREY (Hospital nav) probe. Scope: nav-only load (no Alt+S) of Hospital on /tmp/wt-look (:8650), three URLs;
// reports §MEP_HUE_TALLY, A._instMepUniform/Mixed, A._mepHueCounts, and the material colour actually used by every IfcPipeSegment /
// IfcDuctSegment material in A._matCache (+ meshes using it). Read the output log after the run.
'use strict';
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'), os = require('os'), path = require('path');
const URLS = [
  'http://127.0.0.1:8650/viewer/viewer.html?db=https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/buildings/Hospital_extracted.db&ghost=1',
  'http://127.0.0.1:8650/viewer/viewer.html?db=/buildings/Hospital_extracted.db&ghost=1',
  'http://127.0.0.1:8650/viewer/viewer.html?db=/buildings/Hospital_extracted.db'];
(async () => {
  for (const url of URLS) {
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'mepnav-')), L = [];
    const b = await puppeteer.launch({ headless: true, userDataDir: prof, protocolTimeout: 900000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1300,760'] });
    try {
      const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 });
      p.on('console', m => L.push(m.text())); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 });
      let last = -1, same = 0; for (let i = 0; i < 200 && same < 4; i++) { await new Promise(r => setTimeout(r, 2000)); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; }
      await new Promise(r => setTimeout(r, 5000));
      const R = await p.evaluate(() => { const A = window.APP, use = new Map(); A.scene.traverse(o => { if (!o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => use.set(m, (use.get(m) || 0) + (o.isInstancedMesh ? o.count : 1))); });
        const mats = Object.keys(A._matCache || {}).filter(k => /\|Ifc(Pipe|Duct)Segment\|/.test(k)).map(k => { const m = A._matCache[k]; return { key: k.slice(0, 140), color: m.color ? m.color.getHexString() : null, used: use.get(m) || 0, map: !!m.map }; });
        let ghostN = 0, sample = []; A.scene.traverse(o => { if (!o.material || !o.isMesh && !o.isBatchedMesh && !o.isInstancedMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && m.userData && m.userData.ghost) ghostN++; });
        return { inst: { uniform: A._instMepUniform, mixed: A._instMepMixed }, counts: A._mepHueCounts, mats, ghostMats: ghostN, bld: A.activeBuilding, mepHueOff: !!A._mepHueOff };
      });
      console.log('=== ' + url);
      L.filter(l => /§MEP_HUE_TALLY|§TRI_SRC_TALLY|§DB_404|PAGEERROR|§GHOST/.test(l)).forEach(l => console.log('  ' + l.slice(0, 400)));
      console.log('  inst ' + JSON.stringify(R.inst) + ' mepHueCounts ' + JSON.stringify(R.counts) + ' mepHueOff=' + R.mepHueOff + ' bld=' + R.bld);
      R.mats.slice(0, 24).forEach(m => console.log('  mat ' + m.color + ' used=' + m.used + ' map=' + m.map + ' key=' + m.key));
      console.log('  segment materials=' + R.mats.length);
    } catch (e) { console.log('FATAL ' + url + ' ' + e.message); }
    finally { await b.close(); fs.rmSync(prof, { recursive: true, force: true }); }
  }
})();
