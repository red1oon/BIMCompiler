'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.text()));
  await page.goto('http://localhost:8420/modeller/modeller.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.STRWalkerOutliner && window.STRWalkerOutliner._residents, { timeout: 20000 });
  const buildings = ['SampleHouse', 'Duplex', 'SampleCastle', 'HHS', 'Clinic', 'Hospital', 'HospitalGarage', 'Terminal'];
  const results = [];
  for (const key of buildings) {
    const before = logs.length;
    await page.evaluate((k) => {
      var res = window.STRWalkerOutliner._residents.find(r => r.key === k);
      return window.STRWalkerOutliner._openResident(res);
    }, key).catch(e => console.log('open error for', key, e.message));
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline && !logs.slice(before).some(l => /§GEOM-HARDFAIL/.test(l))) {
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(300); // let the DB_IDENTITY line (logged just before HARDFAIL) settle too
    const relevant = logs.slice(before).filter(l => /§DB_IDENTITY|§GEOM-HARDFAIL|geoDb cache|falling back to OCI/.test(l));
    results.push({ key, lines: relevant });
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
