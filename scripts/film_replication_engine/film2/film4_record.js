// ⚠ DO NOT REMOVE — Scope: RECORD the silent picture of Film 2 v2 "Keeping the bloat off" (under-the-hood cut; prompts/TEAMWORK_FRAMEWORK.md §16.24 v2): full-screen cards only (opener with logos and cards, Part 1, Part 2, Part 3 under the hood,
// limits, sources). Headless Chrome, --disable-gpu, CPU only. The clock is STEPPED (frame k = k/24 s) and the page is a pure function of it. Read the log after every run: <out>/film.log holds §FILM_*, §CITE_*, §LOGO_*, §WORDS_*.
// Run:  node film4_record.js <outDir>      env BEAT_MIN=<json: seconds each beat is held, from the narration>, DEFAULT_HOLD (s, default 9), FPS (24), SHOTS=<comma film seconds>
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const X2 = require('./facts4.js'), Cards = require('./cards4.js'), B4 = require('./beats4.js');
const OUT = path.resolve(process.argv[2] || '.'), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FPS = +(process.env.FPS || 24), DEF = +(process.env.DEFAULT_HOLD || 9);
const MIN = process.env.BEAT_MIN ? JSON.parse(fs.existsSync(process.env.BEAT_MIN) ? fs.readFileSync(process.env.BEAT_MIN, 'utf8') : process.env.BEAT_MIN) : {};
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async () => {
  const X = X2.build(); say('§FILM_FACTS n=' + Object.keys(X.F).length + ' all cross-checks passed (facts4.js)');
  const CB = Cards.build(X); CB.finish(); const C = CB.C;
  let t = 0; const beats = B4.BEATS.map(b => { const d = Math.max(b.read || 0, MIN[b.id] || DEF), o = { id: b.id, card: b.card, start: t, end: t + d }; t += d; return o; });
  const N = Math.ceil(t * FPS - 1e-9); say(`§FILM_PLAN beats=${beats.length} total=${t.toFixed(2)}s frames=${N} fps=${FPS}`);
  beats.forEach(b => say(`§FILM_PLAN beat=${b.id} start=${b.start.toFixed(2)} end=${b.end.toFixed(2)} hold=${(b.end - b.start).toFixed(2)} narration_hold=${(MIN[b.id] || DEF).toFixed(2)}${MIN[b.id] ? '' : ' (default)'}`));
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 }), page = await ctx.newPage(); const PL = [], IMGREQ = new Set();
  page.on('console', m => PL.push(m.text())); page.on('pageerror', e => { PL.push('PAGEERR ' + e); say('§FILM_ERROR pageerror ' + e); }); page.on('request', r => { if (r.resourceType() === 'image') IMGREQ.add(decodeURIComponent(r.url().replace(/^file:\/\//, ''))); });
  await page.goto('file://' + path.join(__dirname, 'stage4.html')); await page.waitForFunction(() => window.Stage);
  await page.evaluate(d => window.Stage.init(d), { parts: [{ offset: 0, beats }], cards: C });
  const imgs = () => page.evaluate(() => window.Stage.imagesReady());
  if (process.env.SHOTS) { for (const f of process.env.SHOTS.split(',').map(Number)) { const r = await page.evaluate(x => window.Stage.at(x), f); await imgs(); await page.screenshot({ path: path.join(OUT, 'shot_' + f.toFixed(1) + '.png'), clip: { x: 0, y: 0, width: 1920, height: 930 } }); const ov = await page.evaluate(() => window.Stage.overflowCard()); say(`§FILM_SHOT ft=${f} beat=${r.beat} overflow=${JSON.stringify(ov).slice(0, 400)}`); } await browser.close(); return; }
  let prevHash = null, prevFile = null, lastBeat = null, frames = [], layoutChecked = 0, bad = 0; const t0 = Date.now();
  for (let k = 0; k < N; k++) {
    const ft = k / FPS, r = await page.evaluate(f => window.Stage.at(f), ft);
    if (r.beat !== lastBeat) { lastBeat = r.beat; say(`§FILM_CUE beat=${r.beat} id=${r.beat} t=${ft.toFixed(2)} trace_t=card frame=${k}`); }
    if (r.hash !== prevHash) { await imgs(); const ov = await page.evaluate(() => window.Stage.overflowCard()); if (ov.length) { bad++; if (bad <= 8) say(`§FILM_LAYOUT_BAD card=${r.card} ft=${ft.toFixed(2)} ${ov.join(' | ').slice(0, 300)}`); }
      layoutChecked++; const fn = path.join(FR, String(k).padStart(6, '0') + '.jpg'); await page.screenshot({ path: fn, type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 930 } }); prevFile = fn; prevHash = r.hash; }
    frames.push(prevFile); if (k % 800 === 0) console.log(`  frame ${k}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  say(`§FILM_LAYOUT_DONE changed_frames_checked=${layoutChecked} card_frames_with_clipped_or_outside_or_overlapping_text=${bad} ${bad ? 'FAIL' : 'PASS'}`);
  const claims = Cards.CLAIM, audits = []; for (const b of beats) { const a = await page.evaluate(f => { window.Stage.at(f); return window.Stage.imagesReady().then(() => ({ audit: window.Stage.cardAudit(), ov: window.Stage.overflowCard() })); }, b.end - 0.05); audits.push({ id: b.id, ...a }); }
  let nq = 0, qbad = 0, nc = 0, cbad = 0, hidden = 0; const shown = new Set();
  audits.forEach(A => { A.audit.quotes.forEach(q => { nq++; shown.add(q.id); const j = claims[q.id]; if (!(j && q.text === j.quote)) { qbad++; say(`§CITE_QUOTE_BAD card=${A.id} claim=${q.id} shown="${q.text}" json="${j && j.quote}"`); } });
    A.audit.cites.forEach(c => { nc++; const j = claims[c.id], ds = Cards.shortDate(j.date_of_source); const ok = c.pub === j.publisher && c.ttl === j.title && c.dt === ds && (j.date_of_source === null ? c.dt === 'undated page' : j.date_of_source.indexOf(c.dt) !== -1); if (!ok) { cbad++; say(`§CITE_BAR_BAD card=${A.id} claim=${c.id} shown=${JSON.stringify(c)}`); } });
    A.audit.vis.forEach(v => { if (v !== 'visible') hidden++; }); });
  say(`§CITE_QUOTES shown=${nq} distinct_claims=${shown.size} not_byte_equal_to_json=${qbad} ${qbad || !nq ? 'FAIL' : 'PASS'}`);
  say(`§CITE_BARS shown=${nc} publisher_title_date_mismatch=${cbad} ${cbad || !nc ? 'FAIL' : 'PASS'} (date shown must be contained in the JSON date string; null date shows "undated page")`);
  say(`§CITE_REVEAL elements_still_hidden_at_end_of_card=${hidden} ${hidden ? 'FAIL' : 'PASS'}`);
  { let n = 0; audits.forEach(A => { if (A.ov.length) { n++; say(`§FILM_LAYOUT_BAD end_of_card=${A.id} ${A.ov.join(' | ').slice(0, 300)}`); } }); say(`§FILM_CARD_LAYOUT cards=${audits.length} with_clipped_or_outside_or_overlapping_text=${n} ${n ? 'FAIL' : 'PASS'}`); }
  { const cited = new Set(); shown.forEach(id => cited.add(claims[id].source_url)); const listed = new Set(); audits.forEach(A => A.audit.urls.forEach(u => listed.add(u))); const missing = [...cited].filter(u => !listed.has(u)), extra = [...listed].filter(u => !cited.has(u));
    say(`§CITE_SOURCES cited_urls=${cited.size} listed_on_sources_cards=${listed.size} missing=${missing.length} extra=${extra.length} ${missing.length || extra.length ? 'FAIL' : 'PASS'} ${missing.concat(extra).join(' ')}`); }
  { const LI = JSON.parse(fs.readFileSync(path.join(__dirname, 'film2_logos_index.json'), 'utf8')).entries, bySlug = {}, byPath = {}; LI.forEach(e => { bySlug[e.slug] = e; if (e.local_path) byPath[e.local_path] = e; if (e.use_instead) byPath[e.use_instead.local_path] = Object.assign({}, e, { sha256: e.use_instead.sha256 }); });
    let n = 0, badimg = 0, distort = 0, uni = 0; const seen = new Set();
    audits.forEach(A => A.audit.imgs.forEach(i => { n++; seen.add(i.slug); const e = bySlug[i.slug], want = e.use_instead ? e.use_instead.sha256 : e.sha256; if (!i.ok || i.sha !== want) { badimg++; say(`§LOGO_BAD card=${A.id} slug=${i.slug}`); } const ra = i.rw / i.rh, na = i.w / i.h; if (i.fit === 'contain') uni++; if (i.rw && i.rh && i.fit !== 'contain' && Math.abs(ra - na) / na > 0.02) { distort++; say(`§LOGO_ASPECT_BAD slug=${i.slug}`); } }));
    let reqBad = 0, reqN = 0; IMGREQ.forEach(p => { reqN++; const e = byPath[p]; if (!e) { reqBad++; say(`§LOGO_REQ_UNKNOWN ${p}`); return; } const h = sha(p); if (h !== e.sha256) { reqBad++; say(`§LOGO_REQ_HASH_BAD ${e.slug}`); } });
    say(`§LOGO_DOM imgs_shown=${n} distinct=${seen.size} not_loaded_or_wrong_sha_attr=${badimg} aspect_distorted=${distort} scaled_uniformly_by_object_fit_contain=${uni} (never cropped or stretched) ${badimg || distort || !n ? 'FAIL' : 'PASS'}`);
    say(`§LOGO_REQUESTS image_requests=${reqN} disk_sha256_differs_from_index=${reqBad} ${reqBad || !reqN ? 'FAIL' : 'PASS'} (PowerSync: the clean alternate file; its sha256 was computed from the downloaded bytes)`);
    const w = audits.find(A => A.id === 'wall'), wt = w ? w.audit.text : '', okp = ['Nostr', 'Triplit', 'Secure Scuttlebutt'].every(x => wt.indexOf(x) !== -1) && ![...seen].some(s => /nostr|triplit|ssb|scuttlebutt/.test(s));
    say(`§LOGO_PLAINTEXT wall shows the names Nostr, Triplit, Secure Scuttlebutt as text and loads no image for them ${okp ? 'PASS' : 'FAIL'}`);
    const cr = audits.some(A => /© 2019 The Manyverse Authors, CC BY-SA 4.0/.test(A.audit.text)) && audits.some(A => /Logos and names are trademarks of their owners, shown to identify the projects discussed\./.test(A.audit.text));
    say(`§LOGO_CREDITS trademark line and Manyverse credit on screen ${cr ? 'PASS' : 'FAIL'}; Matrix logo loaded: ${seen.has('matrix') ? 'YES FAIL' : 'no PASS'}`); }
  fs.writeFileSync(path.join(OUT, 'film.page.log'), PL.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'cards_audit.json'), JSON.stringify(audits, null, 1));
  const lines = []; let i = 0; while (i < frames.length) { let j = i; while (j + 1 < frames.length && frames[j + 1] === frames[i]) j++; lines.push(`file '${frames[i]}'`, `duration ${((j - i + 1) / FPS).toFixed(6)}`); i = j + 1; }
  lines.push(`file '${frames[frames.length - 1]}'`); fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'film_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', `fps=${FPS},scale=1920:930:flags=lanczos,pad=1920:1080:0:0:color=black,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-frames:v', String(N), mp4]);
  say(`§FILM_DONE frames=${N} distinct_images=${new Set(frames).size} dur=${(N / FPS).toFixed(2)}s out=${mp4}`);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({ total: t, frames: N, beats }, null, 1)); await browser.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§FILM_ERROR ' + (e.stack || e) + '\n'); process.exit(1); });
