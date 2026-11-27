// ⚠ DO NOT REMOVE — Scope: RECORD the silent picture of Film 6 "No Server to Keep Alive — and the Books Still Close": headless Chrome --disable-gpu, CPU only, the clock STEPPED (frame k = film second k/24, the page is a pure function of Stage.at(t)).
// Picture = the Civil Works cards (cards6.js), the REAL-PAGE frames of the live site (shots/*.png, film6_shots.js), and the stage replaying the REAL trace (trace6.json). REFUSES a trace that is not REAL (film6_guard.js). Read the log (film.log): §FILM_CUE per beat, layout / badge / console verdicts.
// Run:  BEAT_MIN=<beatmin.json> node film6_record.js <outDir>        env FPS (24), SHOTS=<comma film seconds> (stills for the lead, no evidence), SECONDS=<n> (record only the first n seconds: a trial)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const Cards = require('./cards6.js'), Guard = require('./film6_guard.js'), L = require('./layout6.js');
const OUT = path.resolve(process.argv[2] || '.'), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FPS = +(process.env.FPS || 24), LOG = []; const say = s => { LOG.push(s); console.log(s); };
const TRACE = path.join(__dirname, 'trace6.json'), why = Guard.assertReal(TRACE); if (why.length) { say('§GUARD_REFUSED ' + why.join(' | ')); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); process.exit(4); } say('§GUARD_OK trace6.json is REAL: no DRAFT event, every source has a sha256');
const trace = JSON.parse(fs.readFileSync(TRACE, 'utf8')), X = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts6.resolved.json'), 'utf8')), CL = JSON.parse(fs.readFileSync(path.join(__dirname, 'claims6.json'), 'utf8')), CB = Cards.build(X, CL);
const PLAN = JSON.parse(fs.readFileSync(process.env.PLAN6 || path.join(__dirname, 'plan6.json'), 'utf8')), MIN = JSON.parse(fs.readFileSync(process.env.BEAT_MIN, 'utf8'));
const CAP = { home_lens: 'Home dashboard · the Micro Finance lens (PA_DashboardContent)', import_window_before: 'Import POS Sales window · tickets declared, nothing imported', process_dialog: 'Process dialog · parameters from AD_Process_Para', import_window_after: 'Import window · Imported box and error column', menu_tree: 'The menu tree · Data Import', wse_doc_action_access: 'Document Action Access · Web Service Execution: nothing offered', recurring_run: 'Recurring Run (process 200074)', acct_processor: 'Tenant Accounting Processor (process 53187)', role_wse: 'Role window · Web Service Execution', plugins_user: 'Plugins & Releases · a user can read, only the System Administrator can change', home_103: 'Role 103 home · no Micro Finance gadget', process_batch: 'Import POS Sales · one ticket imported, one left whole', import_payment_window: 'Import Payment (window 280)' };
const SHOT_SRC = { home_lens: 'live site, GardenWorld Admin, after the System Administrator started the bundle' };
const shotHtml = name => { const f = path.join(__dirname, 'shots', name + '.png'); if (!fs.existsSync(f)) throw new Error('missing shot ' + name); if (!CAP[name]) throw new Error('no caption for shot ' + name);
  return `<div class="pg" style="background:#080A0E"><img src="file://${f}" style="position:absolute;left:0;top:0;width:1920px;height:930px"><div style="position:absolute;left:24px;top:864px;max-width:1500px;background:#080A0E;border:3px solid #4FC3F7;border-radius:12px;padding:10px 20px;font:700 28px/1.25 'Noto Sans';color:#FFFFFF">${CAP[name].replace(/&/g, '&amp;')}</div></div>`; };
// ---- the film plan: beat windows from BEAT_MIN (speech + 1.0 s) and the silent hold; the last beat gets >= 6 s after the line ----
let t = 0; const beats = [], segs = [];
PLAN.beats.forEach((b, i) => { let d = b.silentHold ? b.silentHold : MIN[b.id]; if (d === undefined) throw new Error('no BEAT_MIN for ' + b.id); if (i === PLAN.beats.length - 1) d = Math.max(d, 2.6 + 6.2);
  const o = { id: b.id, start: t, end: t + d, vis: b.vis }; beats.push(o); const v = b.vis;
  if (v.k === 'card') segs.push({ id: b.id, kind: 'card', card: v.c, start: t, end: t + d, title: b.id });
  else if (v.k === 'stage') segs.push({ id: b.id, kind: 'stage', tbeat: v.t, start: t, end: t + d });
  else if (v.k === 'seq') { let a = t; v.parts.forEach((pt, q) => { const e = q === v.parts.length - 1 ? t + d : a + pt.secs; if (pt.k === 'card') segs.push({ id: b.id + '#' + q, kind: 'card', card: pt.c, start: a, end: e, title: b.id }); else segs.push({ id: b.id + '#' + q, kind: 'stage', tbeat: pt.t, start: a, end: e }); a = e; }); }
  else v.s.forEach((nm, q) => { const a = t + d * q / v.s.length, e = t + d * (q + 1) / v.s.length; segs.push({ id: b.id + '#' + q, kind: 'html', html: shotHtml(nm), start: a, end: e, title: nm }); });
  t += d; });
const TOTAL = process.env.SECONDS ? +process.env.SECONDS : t, N = Math.ceil(TOTAL * FPS - 1e-9);
say(`§FILM_PLAN beats=${beats.length} segments=${segs.length} total=${t.toFixed(2)}s frames=${N} fps=${FPS}${process.env.SECONDS ? ' TRIAL ' + TOTAL + 's' : ''}`);
beats.forEach(b => say(`§FILM_PLAN beat=${b.id} start=${b.start.toFixed(2)} end=${b.end.toFixed(2)} hold=${(b.end - b.start).toFixed(2)} vis=${JSON.stringify(b.vis).slice(0, 120)}`));
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--font-render-hinting=none'] });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 })).newPage(); let consoleErr = 0, pageErr = 0, reqFail = 0; const PL = [];
  page.on('console', m => { PL.push(m.type() + ' ' + m.text()); if (m.type() === 'error') { consoleErr++; say('§CONSOLE_ERROR ' + m.text().slice(0, 200)); } }); page.on('pageerror', e => { pageErr++; say('§FILM_ERROR pageerror ' + e); }); page.on('requestfailed', r => { reqFail++; say('§CONSOLE_ERROR requestfailed ' + r.url().slice(0, 120)); });
  await page.goto('file://' + path.join(__dirname, 'stage6.html')); await page.waitForFunction(() => window.Stage);
  await page.addStyleTag({ content: Cards.CSS.replace(/html,body\{[^}]*\}/, '').replace(/:root\{[^}]*\}/, '') });
  const info = await page.evaluate(d => window.Stage.init(d), { trace, beats: segs, cards: CB.C }); say(`§FILM_INIT events=${info.events} status=${info.status}`);
  const ftOf = await page.evaluate(() => window.Stage.ftTable()); const E = trace.events;
  const expectOnline = ft => { const on = Object.assign({}, trace.header.initial_online || {}); E.forEach((e, i) => { if (ftOf[i] <= ft + 1e-9) { if (e.kind === 'online') on[e.actor] = true; if (e.kind === 'offline') on[e.actor] = false; } }); return on; };
  if (process.env.SHOTS) for (const f of process.env.SHOTS.split(',').map(Number)) { const r = await page.evaluate(x => window.Stage.at(x), f); await page.evaluate(() => Promise.all([].map.call(document.images, i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; })))); await page.screenshot({ path: path.join(OUT, 'shot_' + f.toFixed(1) + '.png'), clip: { x: 0, y: 0, width: 1920, height: 930 } }); say(`§FILM_SHOT ft=${f} beat=${r.beat}`); }
  let prevHash = null, prevFile = null, lastBeat = null, frames = [], checked = 0, bad = 0, badgeChecks = 0, badgeMis = 0, minC = 99; const t0 = Date.now(), problems = {};
  for (let k = 0; k < N; k++) {
    const ft = k / FPS, r = await page.evaluate(f => window.Stage.at(f), ft);
    const bid = beats.filter(b => ft >= b.start - 1e-9).pop().id; if (bid !== lastBeat) { lastBeat = bid; say(`§FILM_CUE beat=${bid} id=${bid} t=${ft.toFixed(2)} frame=${k}`); }
    if (r.hash !== prevHash) {
      await page.evaluate(() => Promise.all([].map.call(document.images, i => i.complete ? 1 : new Promise(rr => { i.onload = rr; i.onerror = rr; }))));
      const m = await page.evaluate(L.probe), pr = L.judge(m); checked++; m.runs.forEach(x => { if (x.op >= 0.99) minC = Math.min(minC, L.contrast(x.color, x.bg)); }); if (pr.length) { bad++; pr.forEach(x => { problems[x] = (problems[x] || 0) + 1; }); if (bad <= 6) say(`§FILM_LAYOUT_BAD ft=${ft.toFixed(2)} beat=${r.beat} ${pr.join(' | ').slice(0, 300)}`); }
      if (r.card === null) { const lab = await page.evaluate(() => window.Stage.labels()), ex = expectOnline(ft); ['till', 'phone1', 'phone2', 'verifier', 'clerk', 'stock'].forEach(a => { badgeChecks++; const off = !ex[a]; if (!lab[a] || lab[a].off !== off) badgeMis++; }); }
      const fn = path.join(FR, String(k).padStart(6, '0') + '.jpg'); await page.screenshot({ path: fn, type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 930 } }); prevFile = fn; prevHash = r.hash; }
    frames.push(prevFile); if (k % 1000 === 0) console.log(`  frame ${k}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  Object.keys(problems).slice(0, 8).forEach(k => say(`  §FILM_LAYOUT_PROBLEM x${problems[k]} ${k}`));
  say(`§FILM_LAYOUT_DONE changed_frames_checked=${checked} frames_with_problems=${bad} lowest_contrast=${minC.toFixed(2)} ${bad ? 'FAIL' : 'PASS'}`);
  say(`§FILM_BADGES stage_frames_checks=${badgeChecks} mismatches_vs_trace=${badgeMis} ${badgeMis || !badgeChecks ? 'FAIL' : 'PASS'}`);
  say(`§CONSOLE_ERRORS console_errors=${consoleErr} page_errors=${pageErr} failed_requests=${reqFail} ${consoleErr || pageErr || reqFail ? 'FAIL' : 'PASS'}`);
  fs.writeFileSync(path.join(OUT, 'film.page.log'), PL.join('\n') + '\n');
  const lines = []; let i = 0; while (i < frames.length) { let j = i; while (j + 1 < frames.length && frames[j + 1] === frames[i]) j++; lines.push(`file '${frames[i]}'`, `duration ${((j - i + 1) / FPS).toFixed(6)}`); i = j + 1; }
  lines.push(`file '${frames[frames.length - 1]}'`); fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'film_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', `fps=${FPS},scale=1920:930:flags=lanczos,pad=1920:1080:0:0:color=0x080A0E,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-frames:v', String(N), mp4]);
  say(`§FILM_DONE frames=${N} distinct_images=${new Set(frames).size} dur=${(N / FPS).toFixed(2)}s out=${mp4}`);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({ total: t, frames: N, beats }, null, 1)); await browser.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§FILM_ERROR ' + (e.stack || e) + '\n'); process.exit(1); });
