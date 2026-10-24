// ⚠ DO NOT REMOVE — shared harness for the docs-refresh capture scripts (prompts/DOCS_GUIDE_REFRESH.md).
// Every step logs a §DOCS_* line; the guide may quote only values a capture wrote to its JSON report.
// Read the log after every run — exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');

const OCI = 'https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/';
const SITE = 'https://red1oon.github.io/bim-ootb/';

// opts: out (png dir), log (file), report (json path), gpu ('sw' default | 'real'), w,h
async function start(opts) {
  const o = Object.assign({ gpu: 'sw', w: 1440, h: 900, dpr: 2 }, opts);
  fs.mkdirSync(o.out, { recursive: true });
  fs.writeFileSync(o.log, '');
  const log = (s) => { console.log(s); fs.appendFileSync(o.log, s + '\n'); };
  const gpuArgs = { sw: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    real: ['--use-angle=gl-egl', '--ignore-gpu-blocklist'] }[o.gpu] || [];
  const env = Object.assign({}, process.env, o.gpu === 'real' ? { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' } : {});
  const browser = await puppeteer.launch({ headless: true, env, protocolTimeout: 30 * 60 * 1000,
    userDataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'docs-cap-')),
    args: ['--no-sandbox', `--window-size=${o.w},${o.h}`].concat(gpuArgs) });
  const page = await browser.newPage();
  await page.setViewport({ width: o.w, height: o.h, deviceScaleFactor: o.dpr });
  const dl = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-dl-'));
  const cdp = await page.target().createCDPSession();
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
  const errs = []; const net = { resets: 0, loadFail: [] };
  page.on('console', m => { const t = m.text(); fs.appendFileSync(o.log, '[con] ' + t + '\n'); if (/ERR_CONNECTION_RESET|ERR_NETWORK|ERR_TIMED_OUT/.test(t)) net.resets++; const lf = t.match(/§LOAD_FAIL (\S+)/); if (lf) net.loadFail.push(lf[1]); });
  page.on('pageerror', e => { errs.push(String(e)); fs.appendFileSync(o.log, '[pageerror] ' + e + '\n'); });
  const report = { at: new Date().toISOString(), steps: {}, pageerrors: errs };
  const shot = async (name, sel) => {
    const f = path.isAbsolute(name) ? name + '.png' : path.join(o.out, name + '.png');
    if (sel) { const el = await page.$(sel); if (!el) { log('§DOCS_SHOT_MISSING ' + name + ' sel=' + sel); return null; } await el.screenshot({ path: f }); }
    else await page.screenshot({ path: f });
    log('§DOCS_SHOT ' + f);
    return f;
  };
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  // open a building straight in the viewer (what the front door's card does)
  const openBuilding = async (db, extra, opts) => {
    const url = SITE + 'viewer/viewer.html?db=' + OCI + 'buildings/' + db + (extra || '');
    const loadMs = (opts && opts.loadMs) || 2400000;
    // up to 3 attempts: a load that never starts its DB fetch, or a page that re-navigates itself mid-wait
    // (service-worker first-claim, seen 2026-10-24), is retried instead of failing the whole capture.
    for (let attempt = 1; attempt <= 3; attempt++) {
      log('§DOCS_NAV attempt=' + attempt + ' ' + url);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 });
        await page.waitForFunction(() => { const A = window.APP; return A && A.activeBuilding && A.buildingsRendered && A.buildingsRendered.has(A.activeBuilding) && !A.streaming; },
          { timeout: attempt === 3 ? loadMs : ((opts && opts.stallMs) || 240000), polling: 2000 });
        return page.evaluate(() => ({ building: window.APP.activeBuilding, elements: (window.APP.dbQuery('SELECT count(*) FROM elements_meta')[0] || [0])[0] }));
      } catch (e) { log('§DOCS_LOAD_RETRY attempt=' + attempt + ' ' + String(e.message || e).slice(0, 120)); await sleep(2000); }
    }
    throw new Error('openBuilding failed after 3 attempts: ' + db);
  };
  const finish = async (ok) => {
    if (o.report) { fs.mkdirSync(path.dirname(o.report), { recursive: true }); fs.writeFileSync(o.report, JSON.stringify(report, null, 1)); }
    report.net = net;
    // a run whose scripts failed to load over a flaky network is not evidence — never install its images
    const degraded = net.resets > 0 || net.loadFail.length > 0;
    log('§DOCS_NET resets=' + net.resets + ' loadFail=' + JSON.stringify(net.loadFail));
    log((ok ? (degraded ? '§DOCS_DONE DEGRADED(network) pageerrors=' : '§DOCS_DONE ok pageerrors=') : '§DOCS_DONE FAILED pageerrors=') + errs.length);
    if (degraded && !process.exitCode) process.exitCode = 2;
    await browser.close().catch(() => {});
  };
  return { browser, page, cdp, log, report, shot, sleep, openBuilding, finish, dl, OCI, SITE };
}
module.exports = { start, OCI, SITE };
