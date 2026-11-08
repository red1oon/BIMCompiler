// ⚠ DO NOT REMOVE — renders th/problem_th.html to th/problem_th.png (1920x1080, CPU) and prints the text blocks that overflow their box (layout witness for the card). Usage: node render_card_th.js
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu'] }); const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.goto('file://' + path.join(__dirname, 'problem_th.html')); await p.waitForTimeout(300);
  const bad = await p.evaluate(() => [...document.querySelectorAll('div')].filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).map(e => e.textContent.slice(0, 40) + ' ' + e.scrollWidth + 'x' + e.scrollHeight + '/' + e.clientWidth + 'x' + e.clientHeight));
  console.log('§CARD_TH overflowing_blocks=' + bad.length + ' ' + JSON.stringify(bad)); await p.screenshot({ path: path.join(__dirname, 'problem_th.png') }); await b.close(); })();
