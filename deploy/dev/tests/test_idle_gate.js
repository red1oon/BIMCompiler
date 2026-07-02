// ⚠ DO NOT REMOVE — Scope: prove §S286 desktop on-demand render gate wiring.
// Witness W-IDLE-LOG (whitebox): after the scene settles, the desktop loop must emit
// `§IDLE_GATE park`; calling APP.markDirty() must emit `§IDLE_GATE wake`. Read the log.
// Wiring/deploy check only — value proof is the §-log, not Playwright assertions.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:8080/dev/';
const LOG = path.join(__dirname, 'log', 'idle_gate.log');

(async () => {
  const lines = [];
  const rec = (s) => { lines.push(s); };
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  page.on('console', m => rec(m.text()));
  page.on('pageerror', e => rec('§PAGEERROR ' + e.message));

  rec('§TEST_LOAD url=' + URL);
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 }).catch(e => rec('§GOTO_FAIL ' + e.message));

  // Let the render loop run and settle to idle (no interaction → must park)
  await page.waitForTimeout(4000);
  rec('§TEST_PHASE settled — expecting §IDLE_GATE park above');

  // Now wake it via the public dirty hook, then settle again
  const hasMarkDirty = await page.evaluate(() => {
    const A = window.APP || window.A;
    if (A && typeof A.markDirty === 'function') { A.markDirty(); return true; }
    return false;
  }).catch(() => false);
  rec('§TEST_MARKDIRTY called=' + hasMarkDirty);
  await page.waitForTimeout(2000);

  await browser.close();

  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, lines.join('\n'));

  // Verdict from the log (read the log, not exit code)
  const txt = lines.join('\n');
  const v35   = /§MAIN_JS v35/.test(txt);
  const park  = /§IDLE_GATE park/.test(txt);
  const wake  = /§IDLE_GATE wake/.test(txt);
  const err   = (txt.match(/§PAGEERROR/g) || []).length;
  console.log('--- VERDICT ---');
  console.log('W-fresh-code  §MAIN_JS v35 :', v35 ? 'PASS' : 'FAIL');
  console.log('W-IDLE-LOG    park on idle :', park ? 'PASS' : 'FAIL');
  console.log('W-IDLE-LOG    wake on dirty:', wake ? 'PASS' : 'FAIL');
  console.log('boot errors                :', err === 0 ? 'PASS (0)' : 'FAIL (' + err + ')');
  console.log('log saved                  :', LOG);
})();
