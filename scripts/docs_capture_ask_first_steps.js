#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/AskFirstSteps.md. Runs every step of the page against the
// LIVE site and saves one screenshot per step + the values the app reported (§ lines). The page quotes
// only numbers written to the JSON report. Read the log after every run — the exit code is not evidence.
//
// Env: OUT (default docs/img/viewer) · GPU=real|sw (default real) · LOAD_MS (default 2400000) · LOG
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const GPU = process.env.GPU || 'real';
const LOAD_MS = +(process.env.LOAD_MS || 2400000);
const LOG = process.env.LOG || '/tmp/docs_capture_ask_first_steps.log';
const OCI = 'https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/';
// The exact URL the front door's Terminal card opens (bim-ootb index.html openBuilding)
const URL_ = 'https://red1oon.github.io/bim-ootb/viewer/viewer.html?db=' + OCI + 'buildings/Terminal_extracted.db&ghost=1';
fs.writeFileSync(LOG, '');
const log = (s) => { console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const report = { url: URL_, at: new Date().toISOString(), steps: {} };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const dl = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-dl-'));
  const gpuArgs = { sw: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'], real: ['--use-angle=gl-egl', '--ignore-gpu-blocklist'] }[GPU] || [];
  const env = Object.assign({}, process.env, GPU === 'real' ? { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' } : {});
  const browser = await puppeteer.launch({ headless: true, env, protocolTimeout: 30 * 60 * 1000,
    userDataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'ask-docs-')), args: ['--no-sandbox', '--window-size=1440,900'].concat(gpuArgs) });
  const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 900 });
  const cdp = await page.target().createCDPSession();
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
  page.on('console', m => { const t = m.text(); fs.appendFileSync(LOG, '[con] ' + t + '\n'); if (/§ASK_(ANSWER|SAVE|MOUNT|SUGGEST )/.test(t)) console.log('  ' + t.slice(0, 220)); });
  const shot = async (name, sel) => {
    const f = path.join(OUT, 'ask-first-steps-' + name + '.png');
    if (sel) { const el = await page.$(sel); await el.screenshot({ path: f }); } else await page.screenshot({ path: f });
    log('§DOCS_SHOT ' + f);
  };
  const type = async (t) => {
    const before = await page.evaluate(() => document.getElementById('find-ask-catalog').textContent);
    await page.evaluate((v) => { const el = document.getElementById('find-name'); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, t);
    // the list for THIS text: it must differ from what was shown before typing
    await page.waitForFunction((b) => { const c = document.getElementById('find-ask-catalog'); return c && c.textContent !== b && c.querySelector('.ask-q'); }, { timeout: 300000 }, before);
    return page.evaluate(() => Array.from(document.querySelectorAll('#find-ask-catalog .ask-q')).map(e => e.textContent.replace(/^↵ ?/, '')));
  };
  const runSentence = async (text) => {
    const n = await page.evaluate(() => window.APP.askAnswers.length);
    await page.evaluate((t) => { const r = Array.from(document.querySelectorAll('#find-ask-catalog .ask-q')).find(e => e.textContent.replace(/^↵ ?/, '') === t); r.click(); }, text);
    await page.waitForFunction((k) => window.APP.askAnswers.length > k, { timeout: 1800000, polling: 1000 }, n);
    return page.evaluate(() => { const a = window.APP.askAnswers[window.APP.askAnswers.length - 1]; return { question: a.question, verdict: a.verdict, summary: a.summary }; });
  };
  try {
    log('§DOCS_NAV ' + URL_);
    await page.goto(URL_, { waitUntil: 'domcontentloaded', timeout: 300000 });
    await page.waitForFunction(() => { const A = window.APP; return A && A.activeBuilding && A.buildingsRendered && A.buildingsRendered.has(A.activeBuilding) && !A.streaming; }, { timeout: LOAD_MS, polling: 2000 });
    report.steps.loaded = await page.evaluate(() => ({ building: window.APP.activeBuilding, elements: (window.APP.dbQuery('SELECT count(*) FROM elements_meta')[0] || [0])[0] }));
    log('§DOCS_STEP1 loaded ' + JSON.stringify(report.steps.loaded));
    await shot('1-terminal');
    // Step 2 — press F
    await page.keyboard.press('f');
    await page.waitForFunction(() => { const p = document.getElementById('find-panel'); return p && p.style.display === 'block' && document.getElementById('find-mode-ask'); }, { timeout: 120000 });
    await shot('2-find-panel', '#find-panel');
    // Step 3 — click Ask
    await page.click('#find-mode-ask');
    await page.waitForFunction(() => document.querySelectorAll('#find-ask-catalog .ask-q').length >= 6, { timeout: 300000 });
    report.steps.ask = await page.evaluate(() => Array.from(document.querySelectorAll('#find-ask-catalog .ask-q')).map(e => e.textContent));
    log('§DOCS_STEP3 ' + JSON.stringify(report.steps.ask));
    await shot('3-ask-list', '#find-panel');
    // Step 4 — type "cost MEP", click "Find 5D cost of materials for MEP" (needs the §K.1 cost patch live)
    report.steps.costList = await type('cost MEP');
    log('§DOCS_STEP4 ' + JSON.stringify(report.steps.costList));
    await shot('4-cost-list', '#find-panel');
    report.steps.cost = await runSentence('Find 5D cost of materials for MEP');
    log('§DOCS_STEP4b ' + JSON.stringify(report.steps.cost));
    await shot('5-cost-card', '#find-panel');
    // Step 5 — type "clash ARC MEP", click "Find clashes between ARC and MEP"
    report.steps.clashList = await type('clash ARC MEP');
    log('§DOCS_STEP5 ' + JSON.stringify(report.steps.clashList));
    
    report.steps.clash = await runSentence('Find clashes between ARC and MEP');
    log('§DOCS_STEP5b ' + JSON.stringify(report.steps.clash));
    await shot('6-clash-card', '#find-panel');
    // Step 5 — type "exit", click the worst-case sentence
    report.steps.exitList = await type('exit');
    report.steps.exit = await runSentence('Find path to exit (worst-case room)');
    log('§DOCS_STEP5 ' + JSON.stringify(report.steps.exit));
    await shot('7-exit-card', '#find-panel');
    // Step 6 — type "schedule", click the whole-building sentence (generates the 4D timeline)
    report.steps.schedList = await type('schedule');
    report.steps.sched = await runSentence('Find 4D schedule for the whole building');
    log('§DOCS_STEP6 ' + JSON.stringify(report.steps.sched));
    await shot('8-schedule-card', '#find-panel');
    // Step 7 — Save .xlsx
    await page.click('#find-ask-save');
    let file = null;
    for (let i = 0; i < 120 && !file; i++) { await new Promise(r => setTimeout(r, 500)); file = fs.readdirSync(dl).find(f => f.endsWith('.xlsx')); }
    report.steps.saved = file ? { file, bytes: fs.statSync(path.join(dl, file)).size } : null;
    log('§DOCS_STEP7 ' + JSON.stringify(report.steps.saved));
    await shot('9-save', '#find-panel');
    fs.writeFileSync(path.join(ROOT, 'scripts', 'docs_capture_ask_first_steps.report.json'), JSON.stringify(report, null, 1));
    log('§DOCS_DONE ok');
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); process.exitCode = 1; }
  finally { await browser.close().catch(() => {}); }
})();
