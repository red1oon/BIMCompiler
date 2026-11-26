// ⚠ DO NOT REMOVE — Scope: render the CitaGlobal trailer frame device (opener.html) to PNG frames, phase by phase.
// Spec: ~/Projects/CitaGlobal/CitaGlobal_Pitch_Report.md §13.4. READ <out>/render_opener.log after every run.
// Issue this proves: the zoom lands EXACTLY on the box where footage then plays (§OPENER_BOX = the rect the
// last zoomed frame shows), and every phase has the frame count its duration asks for (§OPENER_FRAMES).
// Run: node render_opener.js <outDir> [phoneStill.png] [hqStill.png] [phoneBStill.png] [hqOutStill.png]   (CPU only, headless)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path');
const OUT = path.resolve(process.argv[2] || 'out'); fs.mkdirSync(OUT, { recursive: true });
const FPS = 30;
const LOG = []; const say = (s) => { LOG.push(s); console.log(s); };
const asUrl = (p) => p ? 'file://' + path.resolve(p) : null;
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.join(__dirname, 'opener.html'));
  const q = { phone: asUrl(process.argv[3]), hq: asUrl(process.argv[4]), phoneB: asUrl(process.argv[5]), hqOut: asUrl(process.argv[6]) };
  const phases = await page.evaluate(() => window.OPENER.PHASES);
  const boxes = await page.evaluate(() => window.OPENER.boxes());
  say(`§OPENER_BOX phone x=${boxes.phone.x} y=${boxes.phone.y} w=${boxes.phone.w} h=${boxes.phone.h}`);
  say(`§OPENER_BOX phoneB x=${boxes.phoneB.x} y=${boxes.phoneB.y} w=${boxes.phoneB.w} h=${boxes.phoneB.h} same_as_phone=${JSON.stringify(boxes.phoneB)===JSON.stringify(boxes.phone)}`);
  say(`§OPENER_BOX hq x=${boxes.hq.x} y=${boxes.hq.y} w=${boxes.hq.w} h=${boxes.hq.h}`);
  fs.writeFileSync(path.join(OUT, 'boxes.json'), JSON.stringify(boxes));
  for (const [name, ph] of Object.entries(phases)) {
    const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    const n = Math.round(ph.dur * FPS);
    for (let i = 0; i < n; i++) {
      await page.evaluate(([nm, t, qq]) => window.OPENER.render(nm, t, qq), [name, i / FPS, q]);
      await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
    }
    const got = fs.readdirSync(dir).filter(f => f.endsWith('.png')).length;
    say(`§OPENER_FRAMES phase=${name} dur=${ph.dur} expected=${n} written=${got} ${got === n ? 'OK' : 'MISMATCH'}`);
  }
  // the zoomed end-frames must hit the boxes: read the viewBox the page ends on and recompute
  const endIntro = await page.evaluate(() => { window.OPENER.render('intro', window.OPENER.PHASES.intro.dur, {}); return document.getElementById('s').getAttribute('viewBox'); });
  const endSend = await page.evaluate(() => { window.OPENER.render('send', window.OPENER.PHASES.send.dur, {}); return document.getElementById('s').getAttribute('viewBox'); });
  say(`§OPENER_END intro_viewBox="${endIntro}" send_viewBox="${endSend}"`);
  say(`§OPENER_PAGEERRORS n=${errs.length}${errs.length ? ' ' + errs.join(' | ') : ''}`);
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'render_opener.log'), LOG.join('\n') + '\n');
})().catch(e => { say('§OPENER_FATAL ' + e.stack); fs.writeFileSync(path.join(OUT, 'render_opener.log'), LOG.join('\n') + '\n'); process.exit(1); });
