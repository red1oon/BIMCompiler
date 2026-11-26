// ⚠ DO NOT REMOVE — Scope: render PHONE 1 (phone1.html) to 456×933 PNG frames. Spec: CitaGlobal_Pitch_Report.md §13.9.
// READ <out>/render_phone1.log after every run. Issue this proves: the screen has exactly dur×30 frames, every image
// it shows loaded (§PHONE1_IMG broken=0 — a missing frame would show as an empty box), and the page threw nothing.
// Run: node render_phone1.js <outDir> <clashFramesDir> <camFramesDir>   (CPU only, headless)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path');
const [OUT, CLASH, CAM] = process.argv.slice(2).map(p => path.resolve(p)); fs.mkdirSync(OUT, { recursive: true });
const FPS = 30, LOG = []; const say = (s) => { LOG.push(s); console.log(s); };
const count = (d) => fs.readdirSync(d).filter(f => f.endsWith('.png')).length;
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 456, height: 933 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.join(__dirname, 'phone1.html'));
  const q = { clashDir: CLASH, camDir: CAM, clashN: count(CLASH), camN: count(CAM) };
  say(`§PHONE1_INPUT clash_frames=${q.clashN} cam_frames=${q.camN}`);
  await page.evaluate((qq) => window.PHONE1.setup(qq), q);
  const n = Math.round((await page.evaluate(() => window.PHONE1.dur)) * FPS);
  let broken = 0;
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.PHONE1.render(t), i / FPS);
    broken += await page.evaluate(async () => { const im = [...document.images]; await Promise.all(im.map(x => x.decode().catch(() => {}))); return im.filter(x => !x.naturalWidth).length; });
    await page.screenshot({ path: path.join(OUT, String(i).padStart(4, '0') + '.png') });
  }
  const got = count(OUT);
  say(`§PHONE1_FRAMES expected=${n} written=${got} ${got === n ? 'OK' : 'MISMATCH'}`);
  say(`§PHONE1_IMG broken=${broken} ${broken === 0 ? 'OK' : 'FAIL'}`);
  say(`§PHONE1_PAGEERRORS n=${errs.length}${errs.length ? ' ' + errs.join(' | ') : ''}`);
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'render_phone1.log'), LOG.join('\n') + '\n');
})().catch(e => { say('§PHONE1_FATAL ' + e.stack); fs.writeFileSync(path.join(OUT, 'render_phone1.log'), LOG.join('\n') + '\n'); process.exit(1); });
