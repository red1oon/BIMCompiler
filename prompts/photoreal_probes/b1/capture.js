// capture.js <port> <db> <want> <cam> <tgt> <out> [query]: fresh profile, one real Alt+S, FULL console log to <out> (one line per message)
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, DB, WANT, CAMJ, TGTJ, OUT, Q = ''] = process.argv.slice(2);
(async () => { const b = await puppeteer.launch({ headless: true, protocolTimeout: 900000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1705,1054'] });
  const p = await b.newPage(); await p.setViewport({ width: 1685, height: 874 }); const L = [];
  p.on('console', m => L.push(m.text().replace(/\n/g, '\\n'))); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
  await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=/buildings/' + DB + '_extracted.db' + Q, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(w => window.APP && window.APP.guidMap && Object.keys(window.APP.guidMap).length >= w, { timeout: 400000, polling: 2000 }, +WANT); await sleep(3000);
  await p.evaluate((c, t) => { const A = window.APP; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); }, JSON.parse(CAMJ), JSON.parse(TGTJ));
  await sleep(500); const j0 = L.length; await p.keyboard.down('Alt'); await p.keyboard.press('s'); await p.keyboard.up('Alt');
  for (let i = 0; i < 400 && !L.slice(j0).some(t => /§GI_STILL result|§GI_STILL_FAIL/.test(t)); i++) await sleep(1000); await sleep(1500);
  fs.writeFileSync(OUT, L.join('\n') + '\n'); console.log(OUT, L.length, 'lines'); await b.close(); })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
