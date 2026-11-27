// ⚠ DO NOT REMOVE — Scope: FILM-M1 compositor — turn the recorded parts into the film's 1920×1080 frames (MOBILE_PERF.md §FILM-M1 R4/R5).
// READ <work>/stage/render_stage.log after every run. Issue this proves: only beats whose evidence line was present (manifest ok=true)
// reach the film (§STAGE_DROPPED lists the rest), every caption names its source (§STAGE_CAPTION), and frames planned == written.
// Run: node render_stage.js <work>   (work holds A/ B/ HQ/ from record_phone.js and opener/ from render_opener.js with FILM_ID=m1)
'use strict';
const os = require('os'), fs = require('fs'), path = require('path');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const W = path.resolve(process.argv[2] || '.'), OUT = path.join(W, 'stage'); fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const J = p => JSON.parse(fs.readFileSync(path.join(W, p), 'utf8'));
const url = p => 'file://' + path.join(W, p);
const pngs = d => fs.readdirSync(path.join(W, d)).filter(f => f.endsWith('.png')).sort().map(f => d + '/' + f);
const lerp = (a, b, u) => a + (b - a) * u, ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const lr = (a, b, u) => ({ x: Math.round(lerp(a.x, b.x, u)), y: Math.round(lerp(a.y, b.y, u)), w: Math.round(lerp(a.w, b.w, u)), h: Math.round(lerp(a.h, b.h, u)) });

// captions: every number is a § line or a measured table row — the source is logged with it
const CAP = {
  ready:         ['Ready to touch at once.', 'Longest freeze after the model arrives: 5.6 s → 0.6 s (measured on a phone profile).', 'MOBILE_PERF §2026-11-27 LEVELS, P3 row'],
  fab:           ['Panels open in under 0.1 s.', 'Slowest first open 52 ms, measured on a phone profile.', 'MOBILE_PERF §2026-11-27 PANELS table'],
  nav_open:      null,
  nav_swipe:     ['Swipe down to close.', 'One panel at a time.', '§SHEET_CLOSE via=swipe'],
  settings_open: ['Android Back closes it.', 'The page stays.', '§SHEET_CLOSE via=back'],
  settings_back: null,
  walk_start:    ['Walk: X-Ray turns itself on.', 'Pipes and ducts show through the walls.', '§WALK_XRAY_AUTO on'],
  walk_steps:    ['Every step on the record.', 'Steps simulated here; a phone counts them as you walk.', '§WALK_TRACE'],
  snag:          ['Snag the element.', 'Element, storey and time stamped on the photo, saved to the Issue Log (simulated camera).', '§SNAP + §ISSUE_SAVED'],
  share:         null,
  walk_stop:     ['Stop: X-Ray goes back off.', '', '§WALK_XRAY_AUTO restored off'],
  scrub:         null,   // filled from this run's §M1_SCRUB line below
};
const FPS = 30;
(async () => {
  const A = J('A/manifest.json'), B = J('B/manifest.json'), HQ = J('HQ/manifest.json'), box = J('opener/boxes.json').phone;
  const logA = fs.readFileSync(path.join(W, 'A/record.log'), 'utf8'), logHQ = fs.readFileSync(path.join(W, 'HQ/record.log'), 'utf8');
  const nScrub = +((logA.match(/§M1_SCRUB walk_events=(\d+)/) || [])[1] || 0), hqDist = (logHQ.match(/dist_m=([\d.]+) SAME_VIEW/) || [])[1];
  const logB = fs.readFileSync(path.join(W, 'B/record.log'), 'utf8'), dbB = (logB.match(/db=buildings\/(\w+?)_extracted/) || [])[1] || '?';
  const nameB = ({ HHS_Office_Federated: 'Office', Hospital: 'Hospital', Duplex: 'Duplex', Terminal: 'Terminal' })[dbB] || dbB;
  say(`§STAGE_SITE_B db=${dbB} label=${nameB}`);
  if (nScrub) CAP.scrub = ['Replay: scrub the walk back.', nScrub + ' walk events in the history bar.', '§M1_SCRUB walk_events=' + nScrub];
  const okA = new Set(A.beats.filter(b => b.ok).map(b => b.id)), okB = new Set(B.beats.filter(b => b.ok).map(b => b.id));
  say(`§STAGE_DROPPED A=[${A.beats.filter(b => !b.ok).map(b => b.id)}] B=[${B.beats.filter(b => !b.ok).map(b => b.id)}]`);
  // site B is the supporting beat: its holds play at half length so it does not linger (owner: no slow parts)
  const expand = (m, ok, div) => { const out = []; for (const f of m.frames) { if (f.beat !== 'ready' && !ok.has(f.beat)) continue;
    for (let k = 0; k < Math.ceil(f.hold / (div || 1)); k++) out.push({ src: f.f, beat: f.beat, tap: k < 6 ? f.tap : null }); } return out; };
  const fa = expand(A, okA).map(f => ({ ...f, src: 'A/' + f.src })), fb = expand(B, okB, 2).map(f => ({ ...f, src: 'B/' + f.src }));
  const D = [], seg = {}, beatAt = {};
  const mark = n => { seg[n] = D.length; };
  // 1 — opener intro (zoom into the site figure's phone; its screen shows phone A's first frame)
  mark('intro'); for (const p of pngs('opener/intro')) D.push({ bg: url(p) });
  // 2 — phone A, full height in the opener's phone box; caption beside it
  mark('phoneA'); const bgA = url(pngs('opener/intro').slice(-1)[0]);
  let cur = null, since = 0;
  for (const f of fa) { if (!(f.beat in beatAt)) beatAt[f.beat] = D.length; const c = CAP[f.beat]; if (c) { if (cur !== c) { cur = c; since = 0; say(`§STAGE_CAPTION beat=${f.beat} text="${c[0]}" source="${c[2]}"`); } }
    since++;
    D.push({ bg: bgA, dark: 0.55, phone: { src: url(f.src), r: box, tap: f.tap }, cap: cur && cur[0], sub: cur && cur[1], capBox: { x: 90, y: 330, w: 560, subDy: 150 }, capAlpha: Math.min(1, since / 8) }); }
  // 3 — split: phone A slides left, HQ desktop + phone B appear (0.8 s), then phone B plays while HQ holds the shared view
  mark('split');
  const L = { x: 60, y: 190, w: 392, h: 802 }, R = { x: 1468, y: 190, w: 392, h: 802 }, Dk = { x: 520, y: 300, w: 880, h: 495 };
  const lastA = url(fa[fa.length - 1].src), hq = url('HQ/' + HQ.frames[0].f), b0 = fb.length ? url(fb[0].src) : null;
  const labels = a => [{ x: L.x, y: 130, w: L.w, text: 'Site A · Duplex', a }, { x: Dk.x, y: 240, w: Dk.w, text: 'HQ · desktop', a }, { x: R.x, y: 130, w: R.w, text: 'Site B · ' + nameB, a }];
  const capHQ = ['HQ opens the same view.', 'A link sent from site A: desktop camera ' + hqDist + ' m from the link (§M1_HQ_CAM).'];
  const capB = okB.has('b_snag') ? ['Site B snags its own.', nameB + ' walk, X-Ray on by itself, stamped photo to its Issue Log.']
                                 : ['Site B walks its own site.', nameB + ' walk, X-Ray on by itself.'];
  say(`§STAGE_CAPTION beat=hq_open text="${capHQ[0]}" source="§M1_HQ_CAM SAME_VIEW"`); say(`§STAGE_CAPTION beat=b_walk/b_snag text="${capB[0]}" source="§WALK_XRAY_AUTO on${okB.has('b_snag') ? ' + §ISSUE_SAVED (B)' : ''}"`);
  const capBoxS = { x: 520, y: 850, w: 880, subDy: 66 };
  for (let i = 0; i < 24; i++) { const u = ease(i / 23); D.push({ bg: bgA, dark: lerp(0.55, 1, u), phone: { src: lastA, r: lr(box, L, u) },
    desk: u > 0.5 ? { src: hq, r: Dk } : null, phoneB: u > 0.5 && b0 ? { src: b0, r: R } : null, labels: labels(u) }); }
  beatAt.hq_open = D.length;
  for (let i = 0; i < 105; i++) D.push({ dark: 1, phone: { src: lastA, r: L }, desk: { src: hq, r: Dk }, phoneB: b0 ? { src: b0, r: R } : null, labels: labels(1),
    cap: capHQ[0], sub: capHQ[1], capBox: capBoxS, capAlpha: Math.min(1, (i + 1) / 8) });
  beatAt.site_b = D.length;
  fb.forEach((f, i) => D.push({ dark: 1, phone: { src: lastA, r: L }, desk: { src: hq, r: Dk }, phoneB: { src: url(f.src), r: R }, labels: labels(1),
    cap: capB[0], sub: capB[1], capBox: capBoxS, capAlpha: Math.min(1, (i + 1) / 8) }));
  // 4 — outro (overview, every link green, the closing line)
  mark('outro'); for (const p of pngs('opener/outro')) D.push({ bg: url(p) });
  const segs = Object.entries(seg).map(([k, v], i, a) => `${k}=${(((i + 1 < a.length ? a[i + 1][1] : D.length) - v) / FPS).toFixed(2)}s`);
  say(`§STAGE_PLAN frames=${D.length} seconds=${(D.length / FPS).toFixed(2)} ${segs.join(' ')}`);
  fs.writeFileSync(path.join(OUT, 'segments.json'), JSON.stringify({ seg, beatAt, frames: D.length, fps: FPS }));

  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.join(__dirname, 'stage.html'));
  let prev = null, rendered = 0, broken = 0;
  for (let i = 0; i < D.length; i++) {
    const out = path.join(OUT, String(i).padStart(5, '0') + '.png'), key = JSON.stringify(D[i]);
    if (key === prev) { fs.copyFileSync(path.join(OUT, String(i - 1).padStart(5, '0') + '.png'), out); continue; }
    await page.evaluate(d => window.STAGE.render(d), D[i]);
    broken += await page.evaluate(async () => { const im = [...document.images]; await Promise.all(im.map(x => x.decode().catch(() => {}))); return im.filter(x => !x.naturalWidth).length; });
    await page.screenshot({ path: out }); prev = key; rendered++;
  }
  await browser.close();
  const got = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).length;
  say(`§STAGE_FRAMES planned=${D.length} written=${got} rendered_unique=${rendered} ${got === D.length ? 'OK' : 'MISMATCH'}`);
  say(`§STAGE_IMG broken=${broken} ${broken === 0 ? 'OK' : 'FAIL'}`);
  say(`§STAGE_PAGEERRORS n=${errs.length}${errs.length ? ' ' + errs.join(' | ') : ''}`);
  fs.writeFileSync(path.join(OUT, 'render_stage.log'), LOG.join('\n') + '\n');
})().catch(e => { say('§STAGE_FATAL ' + e.stack); fs.writeFileSync(path.join(OUT, 'render_stage.log'), LOG.join('\n') + '\n'); process.exit(1); });
