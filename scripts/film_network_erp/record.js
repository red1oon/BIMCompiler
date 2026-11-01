// ⚠ DO NOT REMOVE — Scope: RECORD the silent picture of "Network ERP without an Apps and Database server!" (TEAMWORK §45.15). Path-adapted COPY of ../film_terms/record_v4.js (that file is not edited): headless Chrome --disable-gpu (CPU only), stepped clock (frame k = film second k/FPS), the guard must PASS before the first frame, every distinct image probed for clipping. READ out/rec/film.log.
// Run: node record.js <outDir> <beatmin.json>   env FPS (24), SHOTS=<film seconds, comma> (stills for the agent's own layout debugging, no evidence)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const Cards = require('./cards.js');
const OUT = path.resolve(process.argv[2]), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FPS = +(process.env.FPS || 24), LOG = []; const say = s => { LOG.push(s); console.log(s); };
const g = require('child_process').spawnSync('node', [path.join(__dirname, 'guard.js')], { encoding: 'utf8' });
if (g.status !== 0) { say('§GUARD_REFUSED guard.js exit=' + g.status + ' ' + (g.stdout || '').split('\n').filter(l => /FAIL|INCONCLUSIVE/.test(l)).join(' | ')); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); process.exit(4); } say('§GUARD_OK guard.js PASS before the first frame');
const X = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.json'), 'utf8')).facts, CB = Cards.build(X);
const PLAN = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/work/plan.json'), 'utf8')).beats, MIN = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
let t = 0; const beats = PLAN.map((b, i) => { let d = MIN[b.id]; if (d === undefined) throw new Error('no beat length for ' + b.id); if (i === PLAN.length - 1) d += 5; const o = { id: b.id, card: b.card, start: t, end: t + d, speech: MIN[b.id + '_speech'] }; t += d; return o; });
const TOTAL = t, N = Math.ceil(TOTAL * FPS - 1e-9);
say(`§FILM_PLAN beats=${beats.length} total=${TOTAL.toFixed(2)}s frames=${N} fps=${FPS}`);
const shownAt = (b, ft) => { const n = CB[b.card].n, rel = ft - b.start, sp = b.speech || (b.end - b.start - 1.4); let k = 0; for (let i = 1; i <= n; i++) { if (rel >= 0.35 + (i - 1) * (sp * 0.92) / n) k = i; } return k; };
const probe = () => { const bad = []; document.querySelectorAll('.panel,.code').forEach(e => { const w = e.closest('[data-s]'); if (w && getComputedStyle(w).visibility === 'hidden') return; if (e.scrollHeight > e.clientHeight + 4) bad.push('content taller than ' + e.className + ' ' + e.textContent.slice(0, 30)); const r = e.getBoundingClientRect(); if (r.bottom > 875 || r.right > 1921) bad.push('panel outside frame ' + e.className); }); const vis = [...document.querySelectorAll('[data-s]')].filter(e => getComputedStyle(e).visibility !== 'hidden'); vis.forEach(e => { const r = e.getBoundingClientRect(); if (r.right > 1921 || r.left < -1 || r.bottom > 931) bad.push('outside ' + e.textContent.slice(0, 30)); });
  document.querySelectorAll('.bx,.lx,.take').forEach(e => { if (getComputedStyle(e.closest('[data-s]') || e).visibility === 'hidden') return; if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible') bad.push('clipped ' + e.textContent.slice(0, 30)); const r = e.getBoundingClientRect(); if (e.classList.contains('bx') && r.bottom > 875) bad.push('box over source line ' + e.textContent.slice(0, 30)); if (e.classList.contains('bx') && e.scrollHeight > e.clientHeight + 4) bad.push('box content taller than box ' + e.textContent.slice(0, 30)); });
  const tk = document.querySelector('.take'); if (tk && getComputedStyle(tk.closest('[data-s]')).visibility !== 'hidden') { const r = tk.getBoundingClientRect(); document.querySelectorAll('.bx,table,.hd').forEach(e => { if (e.closest('[data-s]') && getComputedStyle(e.closest('[data-s]')).visibility === 'hidden') return; const q = e.getBoundingClientRect(); if (q.bottom > r.top + 1 && q.top < r.bottom - 1 && q.right > r.left && q.left < r.right) bad.push('overlaps takeaway ' + e.className); }); }
  const s = document.querySelector('.src'); if (s) { const r = s.getBoundingClientRect(); if (s.scrollWidth > s.clientWidth + 2) bad.push('source line clipped'); document.querySelectorAll('.bx,table').forEach(e => { const q = e.getBoundingClientRect(); if (q.bottom > r.top) bad.push('content over source line'); }); } return bad; };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'] });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 })).newPage(); let ce = 0, pe = 0, rf = 0;
  page.on('console', m => { if (m.type() === 'error') { ce++; say('§CONSOLE_ERROR ' + m.text().slice(0, 200)); } }); page.on('pageerror', e => { pe++; say('§FILM_ERROR pageerror ' + e); }); page.on('requestfailed', r => { rf++; say('§CONSOLE_ERROR requestfailed ' + r.url().slice(0, 120)); });
  await page.setContent(`<html><head><style>${Cards.CSS}</style></head><body><div id="root"></div></body></html>`);
  const html = {}; Object.keys(CB).forEach(k => { html[k] = CB[k].html; });
  const show = async (card, k) => page.evaluate(([c, k, h]) => { const r = document.getElementById('root'); if (r.dataset.card !== c) { r.innerHTML = h; r.dataset.card = c; } r.querySelectorAll('[data-s]').forEach(e => { e.style.visibility = (+e.getAttribute('data-s') <= k) ? 'visible' : 'hidden'; }); return c + ':' + k; }, [card, k, html[card]]);
  if (process.env.SHOTS) for (const f of process.env.SHOTS.split(',').map(Number)) { const b = beats.filter(x => f >= x.start - 1e-9).pop(); const n = CB[b.card].n; await show(b.card, n); await page.screenshot({ path: path.join(OUT, 'shot_' + f + '_' + b.id + '.png') }); say(`§FILM_SHOT ft=${f} beat=${b.id}`); }
  let prev = null, prevFile = null, last = null, frames = [], checked = 0, bad = 0, probs = {}; const t0 = Date.now();
  for (let k = 0; k < N; k++) {
    const ft = k / FPS, b = beats.filter(x => ft >= x.start - 1e-9).pop(), n = shownAt({ ...b, card: b.card }, ft);
    if (b.id !== last) { last = b.id; say(`§FILM_CUE beat=${b.id} t=${ft.toFixed(2)} frame=${k}`); }
    const key = b.card + ':' + n;
    if (key !== prev) { await show(b.card, n); const pr = await page.evaluate(probe); checked++; if (pr.length) { bad++; pr.forEach(x => { probs[x] = (probs[x] || 0) + 1; }); } const fn = path.join(FR, String(k).padStart(6, '0') + '.jpg'); await page.screenshot({ path: fn, type: 'jpeg', quality: 94 }); prevFile = fn; prev = key; }
    frames.push(prevFile);
  }
  Object.keys(probs).slice(0, 10).forEach(x => say(`  §FILM_LAYOUT_PROBLEM x${probs[x]} ${x}`));
  say(`§FILM_LAYOUT_DONE distinct_images_checked=${checked} images_with_problems=${bad} ${checked === 0 ? 'INCONCLUSIVE' : bad ? 'FAIL' : 'PASS'}`);
  say(`§CONSOLE_ERRORS console_errors=${ce} page_errors=${pe} failed_requests=${rf} ${ce || pe || rf ? 'FAIL' : 'PASS'}`);
  const lines = []; let i = 0; while (i < frames.length) { let j = i; while (j + 1 < frames.length && frames[j + 1] === frames[i]) j++; lines.push(`file '${frames[i]}'`, `duration ${((j - i + 1) / FPS).toFixed(6)}`); i = j + 1; }
  lines.push(`file '${frames[frames.length - 1]}'`); fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'film_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', `fps=${FPS},scale=1920:930:flags=lanczos,pad=1920:1080:0:0:color=0x080A0E,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-frames:v', String(N), mp4]);
  say(`§FILM_DONE frames=${N} distinct_images=${new Set(frames).size} dur=${(N / FPS).toFixed(2)}s out=${mp4}`);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); await browser.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§FILM_ERROR ' + (e.stack || e) + '\n'); process.exit(1); });
