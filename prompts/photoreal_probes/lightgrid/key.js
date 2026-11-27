const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => { const b = await puppeteer.launch({ headless: true, userDataDir: __dirname + '/prof_8663', args: ['--no-sandbox'] }); const p = await b.newPage(); await p.setBypassServiceWorker(true);
  p.on('console', m => { const t = m.text(); if (/light_zones|LOAD_FAIL|SW|§LIGHT_FIELD/.test(t)) console.log('C ' + t.slice(0, 200)); });
  p.on('response', r => { if (/light_zones/.test(r.url())) console.log('R ' + r.url() + ' ' + r.status() + ' sw=' + r.fromServiceWorker() + ' cache=' + r.fromCache()); });
  await p.goto('http://127.0.0.1:8663/viewer/viewer.html?db=../buildings/Clinic_extracted.db', { waitUntil: 'domcontentloaded' }); await sleep(8000);
  console.log(await p.evaluate(() => window.LightZones && window.LightZones.cacheKey())); await b.close(); })();
