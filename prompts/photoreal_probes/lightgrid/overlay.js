// overlay.js <port> <png> : W-STILL_OVERLAY_GUARD. Fresh page at the PNG's pose; turn X-Ray ON (and the ghost bbox if MODE=ghost), press
// Alt+S, then read §STILL_OVERLAY_GUARD + A.xrayOn / ghostXrayOn() right after the press. Proves: a still never starts in an overlay mode.
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, PNG] = process.argv.slice(2);
function pose(f) { const d = fs.readFileSync(f); let i = 8; while (i < d.length) { const n = d.readUInt32BE(i), t = d.toString('latin1', i + 4, i + 8), c = d.slice(i + 8, i + 8 + n); i += 12 + n;
  if (t === 'tEXt') { const z = c.indexOf(0); if (c.toString('latin1', 0, z) === 'bim-still-pose') return JSON.parse(c.slice(z + 1).toString('utf8')); } } }
(async () => { const b = await puppeteer.launch({ headless: true, protocolTimeout: 900000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1503,889'] });
  const P = pose(PNG), p = await b.newPage(); await p.setViewport({ width: P.w, height: P.h }); const L = [];
  p.on('console', m => L.push(m.text())); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
  await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html' + P.url, { waitUntil: 'domcontentloaded' });
  { let last = -1, same = 0; for (let i = 0; i < 400 && same < 6; i++) { await sleep(2000); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; } }
  await sleep(3000);
  if (process.env.MODE === 'ghost') { for (let i = 0; i < 120; i++) { const on = await p.evaluate(() => typeof window.ghostXrayOn === 'function' && window.ghostXrayOn()); if (on) break; await sleep(1000); } await sleep(1000); }
  const pre = await p.evaluate((mode) => { const A = window.APP; if (mode !== 'ghost' && !A.xrayOn) A.toggleXray(); return { xray: A.xrayOn, ghost: typeof window.ghostXrayOn === 'function' ? window.ghostXrayOn() : null }; }, process.env.MODE || 'xray');
  await p.keyboard.down('Alt'); await p.keyboard.press('s'); await p.keyboard.up('Alt'); await sleep(1500);
  const post = await p.evaluate(() => ({ xray: window.APP.xrayOn, ghost: typeof window.ghostXrayOn === 'function' ? window.ghostXrayOn() : null, active: !!window.APP._stillRefineActive }));
  const g = L.filter(t => /§STILL_OVERLAY_GUARD|§XRAY|PAGEERROR|§SHELL_GHOST_AUTO|§CINEMA_GHOST_RESET/.test(t));
  const G = process.env.MODE === 'ghost'; const verdict = G ? (!pre.ghost ? 'INCONCLUSIVE (ghost shell never came on)' : !post.active ? 'INCONCLUSIVE (still did not start)' : (!post.ghost && g.some(t => /§STILL_OVERLAY_GUARD .*ghost=on->off OK/.test(t))) ? 'PASS' : 'FAIL') : !pre.xray ? 'INCONCLUSIVE (x-ray never turned on)' : !post.active ? 'INCONCLUSIVE (still did not start)' : (!post.xray && g.some(t => /§STILL_OVERLAY_GUARD xray=on->off.* OK/.test(t))) ? 'PASS' : 'FAIL';
  console.log('§W_OVERLAY_GUARD pre=' + JSON.stringify(pre) + ' post=' + JSON.stringify(post) + ' verdict=' + verdict); g.forEach(t => console.log('  ' + t.slice(0, 300)));
  await b.close(); })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
