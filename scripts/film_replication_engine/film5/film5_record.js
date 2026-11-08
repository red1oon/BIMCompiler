// ⚠ DO NOT REMOVE — Scope: RECORD the silent picture of Film 5 "Trust and the thin pipe" (cards only, no 3D, no GPU): headless Chrome with --disable-gpu, CPU only. The clock is STEPPED (frame k = k/24 s) and the page is a pure function of it.
// Adapted from film2/film4_record.js (not edited there). Read the log after every run: <out>/film.log holds §FILM_*, §ONSCREEN_*, §PALETTE_*, §CONTRAST_*, §CONSOLE_*.
// Run:  node film5_record.js <outDir>      env BEAT_MIN=<json: seconds each beat is held, from the narration>, DEFAULT_HOLD (s, default 9), FPS (24), SHOTS=<comma film seconds>
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const X = require('./facts5.js').build(), Cards = require('./cards5.js');
const OUT = path.resolve(process.argv[2] || '.'), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FPS = +(process.env.FPS || 24), DEF = +(process.env.DEFAULT_HOLD || 9);
const MIN = process.env.BEAT_MIN ? JSON.parse(fs.existsSync(process.env.BEAT_MIN) ? fs.readFileSync(process.env.BEAT_MIN, 'utf8') : process.env.BEAT_MIN) : {};
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const PALETTE = JSON.parse(fs.readFileSync(path.join(__dirname, 'palette.json'), 'utf8'));
const hex2rgb = h => { const m = /^#(..)(..)(..)$/.exec(h); return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]; };
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const rgbOf = s => { const m = /rgba?\((\d+), (\d+), (\d+)/.exec(s); return m ? [+m[1], +m[2], +m[3]] : null; };
(async () => {
  X.LOG.forEach(l => LOG.push(l)); say(`§FILM_FACTS n=${Object.keys(X.F).length} extracted from the frozen sources (facts5.js); inputs: ${X.INPUTS.map(i => i.key + '=' + i.sha16 + ':' + i.liveNow).join(' ')}`);
  const CB = Cards.build(X), C = CB.C, ids = Object.keys(C);
  let t = 0; const beats = ids.map(id => { const d = Math.max(MIN[id] || DEF, 2.0), o = { id, card: id, start: t, end: t + d }; t += d; return o; });
  const N = Math.ceil(t * FPS - 1e-9); say(`§FILM_PLAN beats=${beats.length} total=${t.toFixed(2)}s frames=${N} fps=${FPS}`);
  beats.forEach(b => say(`§FILM_PLAN beat=${b.id} start=${b.start.toFixed(2)} end=${b.end.toFixed(2)} hold=${(b.end - b.start).toFixed(2)} narration_hold=${(MIN[b.id] || DEF).toFixed(2)}${MIN[b.id] ? '' : ' (default)'}`));
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 }), page = await ctx.newPage(); const PL = []; let consoleErr = 0, pageErr = 0, reqFail = 0;
  page.on('console', m => { PL.push(m.type() + ' ' + m.text()); if (m.type() === 'error') { consoleErr++; say('§CONSOLE_ERROR ' + m.text().slice(0, 200)); } });
  page.on('pageerror', e => { pageErr++; PL.push('PAGEERR ' + e); say('§FILM_ERROR pageerror ' + e); }); page.on('requestfailed', r => { reqFail++; say('§CONSOLE_ERROR requestfailed ' + r.url().slice(0, 120)); });
  await page.goto('file://' + path.join(__dirname, 'stage5.html')); await page.waitForFunction(() => window.Stage);
  await page.evaluate(d => window.Stage.init(d), { beats, cards: C, fade: CB.FADE });
  // ----- controls: each checker must SEE a planted fault (a checker that cannot fail is not a checker) -----
  { await page.evaluate(() => { window.Stage.at(0.5); document.getElementById('ov').insertAdjacentHTML('beforeend', '<div class="bx" style="left:100px;top:300px;width:300px;height:100px">A</div><div class="bx" style="left:150px;top:330px;width:300px;height:100px">B</div><div class="tx pos" style="left:1850px;top:100px">outside the safe area</div><div class="bx" style="left:600px;top:300px;width:200px;height:40px"><div class="tx">text that spills out of its box</div></div>'); });
    const ovp = await page.evaluate(() => window.Stage.overflowCard()); await page.evaluate(() => { document.getElementById('ov')._h = null; });
    const clean = await page.evaluate(() => { window.Stage.at(0.5); return window.Stage.overflowCard(); });
    const offPal = rgbOf('rgb(250, 0, 0)'), palSet = new Set(Object.values(PALETTE.colours).map(c => hex2rgb(c.hex).join(',')).concat(['255,255,255']));
    const lowC = contrast(hex2rgb('#6B6A63'), hex2rgb('#1A1A19'));
    const ok1 = ovp.some(x => /^overlap/.test(x)) && ovp.some(x => /^out:/.test(x)) && ovp.some(x => /^spill:/.test(x)), ok2 = !palSet.has(offPal.join(',')), ok3 = lowC < 4.5, ok4 = clean.length === 0;
    say(`§CONTROLS overlap_outside_and_spill_planted=${ok1 ? 'detected' : 'NOT DETECTED'} off_palette_planted=${ok2 ? 'detected' : 'NOT DETECTED'} low_contrast_planted(muted on panel, ratio ${lowC.toFixed(2)})=${ok3 ? 'detected' : 'NOT DETECTED'} page_restored_clean=${ok4 ? 'yes' : 'NO'} ${ok1 && ok2 && ok3 && ok4 ? 'PASS' : 'FAIL'}`); }
  if (process.env.SHOTS) { for (const f of process.env.SHOTS.split(',').map(Number)) { const r = await page.evaluate(x => window.Stage.at(x), f); await page.screenshot({ path: path.join(OUT, 'shot_' + f.toFixed(1) + '.png'), clip: { x: 0, y: 0, width: 1920, height: 930 } }); const ov = await page.evaluate(() => window.Stage.overflowCard()); say(`§FILM_SHOT ft=${f} beat=${r.beat} overflow=${JSON.stringify(ov).slice(0, 400)}`); } await browser.close(); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); return; }
  let prevHash = null, prevFile = null, lastBeat = null, frames = [], layoutChecked = 0, bad = 0; const t0 = Date.now();
  for (let k = 0; k < N; k++) {
    const ft = k / FPS, r = await page.evaluate(f => window.Stage.at(f), ft);
    if (r.beat !== lastBeat) { lastBeat = r.beat; say(`§FILM_CUE beat=${r.beat} id=${r.beat} t=${ft.toFixed(2)} trace_t=card frame=${k}`); }
    if (r.hash !== prevHash) { const ov = await page.evaluate(() => window.Stage.overflowCard()); if (ov.length) { bad++; if (bad <= 8) say(`§FILM_LAYOUT_BAD card=${r.card} ft=${ft.toFixed(2)} ${ov.join(' | ').slice(0, 300)}`); }
      layoutChecked++; const fn = path.join(FR, String(k).padStart(6, '0') + '.jpg'); await page.screenshot({ path: fn, type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 930 } }); prevFile = fn; prevHash = r.hash; }
    frames.push(prevFile); if (k % 800 === 0) console.log(`  frame ${k}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  say(`§FILM_LAYOUT_DONE changed_frames_checked=${layoutChecked} frames_with_clipped_or_outside_or_overlapping_text=${bad} ${bad ? 'FAIL' : 'PASS'}`);
  // ----- end-of-card audits (each card at its fully revealed state, and at every reveal fraction) -----
  const audits = []; for (const b of beats) { const a = await page.evaluate(f => { window.Stage.at(f); return { audit: window.Stage.cardAudit(), ov: window.Stage.overflowCard() }; }, b.end - 0.05); audits.push({ id: b.id, ...a }); }
  { let n = 0, hid = 0; audits.forEach(A => { if (A.ov.length) { n++; say(`§FILM_LAYOUT_BAD end_of_card=${A.id} ${A.ov.join(' | ').slice(0, 300)}`); } hid += A.audit.hiddenAtEnd; });
    say(`§FILM_CARD_LAYOUT cards=${audits.length} with_clipped_or_outside_or_overlapping_text=${n} ${n ? 'FAIL' : 'PASS'}`); say(`§CARD_REVEAL elements_still_hidden_at_end_of_card_without_a_replacement=${hid} ${hid ? 'FAIL' : 'PASS'}`); }
  // every reveal state (not only the last) must also be free of overlap: audit at each fraction where something appears or disappears
  { let states = 0, badS = 0; for (const b of beats) { const fr = await page.evaluate(f => { window.Stage.at(f); var s = {}; document.querySelectorAll('#ov .rv').forEach(function (e) { s[e.getAttribute('data-f')] = 1; if (e.hasAttribute('data-u')) s[e.getAttribute('data-u')] = 1; }); return Object.keys(s).map(Number); }, b.start + 0.001);
      for (const f of fr) { const ft = Math.min(b.end - 0.01, b.start + (b.end - b.start) * (f + 0.002)); const ov = await page.evaluate(x => { window.Stage.at(x); return window.Stage.overflowCard(); }, ft); states++; if (ov.length) { badS++; say(`§FILM_STATE_BAD beat=${b.id} frac=${f} ${ov.join(' | ').slice(0, 260)}`); } } }
    say(`§FILM_STATES reveal_states_checked=${states} flagged=${badS} ${badS ? 'FAIL' : 'PASS'}`); }
  // heading present on every card
  { let miss = 0; audits.forEach(A => { const ti = CB.TITLES[A.id]; if (A.audit.text.indexOf(ti) < 0) { miss++; say(`§CARD_TEXT_MISSING beat=${A.id} title="${ti}"`); } });
    say(`§CARD_TEXT heading_present_on_screen cards=${audits.length} missing=${miss} ${miss ? 'FAIL' : 'PASS'}`); }
  // on-screen numbers: every digit token on every card (all reveal states) must literally occur in a frozen source (log or prompt lines), or be a listed structural token
  { const allowed = new Set(); Object.values(X.ALLTEXT).forEach(tx => (tx.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach(m => allowed.add(m.replace(/,/g, '')))); for (let i = 0; i <= 13; i++) allowed.add(String(i));            // STEP 1-4 / K0..K3 / the numbered chips 1..13 of the broken-copies row (a plain list index, the count 13 is itself a fact)
    const unknown = []; let ntok = 0; audits.forEach(A => { (A.audit.fullText.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach(m => { ntok++; const v = m.replace(/,/g, ''); if (!allowed.has(v)) unknown.push(A.id + ':' + m); }); });
    say(`§ONSCREEN_NUMBERS tokens=${ntok} not_in_any_frozen_source=${unknown.length} ${unknown.length ? 'FAIL ' + unknown.join(' ') : 'PASS'}`);
    const ctl = '12345678'; say(`§ONSCREEN_NUMBERS_CONTROL a planted token (${ctl}) is ${allowed.has(ctl) ? 'NOT detected FAIL' : 'detected PASS'}`); }
  // source tags: every 'file line N' citation must point at a real line of the frozen source; the line's start is logged
  { const FR = { 'TEAMWORK_FRAMEWORK.md': ['tf_4018_4068.txt', 4017], 'witness_comm_plantrust.log': ['plantrust.log', 0], 'hosts.log': ['hosts.log', 0], 'witness_thin_derive.log': ['thin_derive.log', 0] }; let nc = 0, nb = 0;
    audits.forEach(A => { const st = A.audit.srcText; for (const m of st.matchAll(/([A-Za-z_.0-9]+\.(?:md|log)) line (\d+)/g)) { nc++; const f = FR[m[1]]; if (!f) { nb++; say(`§SRC_LINE_BAD beat=${A.id} unknown file ${m[1]}`); continue; } const L = fs.readFileSync(path.join(__dirname, 'inputs', f[0]), 'utf8').split('\n'), ln = +m[2] - f[1]; if (ln < 1 || ln > L.length || !L[ln - 1].trim()) { nb++; say(`§SRC_LINE_BAD beat=${A.id} ${m[1]} line ${m[2]} is outside the frozen source or empty`); } else say(`§SRC_LINE beat=${A.id} ${m[1]} line ${m[2]} = "${L[ln - 1].trim().slice(0, 70).replace(/\s+/g, ' ')}"`); } });
    say(`§SRC_LINES citations=${nc} pointing_nowhere=${nb} ${nb || !nc ? 'FAIL' : 'PASS'}`); }
  // palette: every solid colour the cards use (text, fills, borders) must be in film5/palette.json
  { const pal = new Set(Object.values(PALETTE.colours).map(c => hex2rgb(c.hex).join(',')).concat(['255,255,255'])); const off = {}; let total = 0;
    audits.forEach(A => Object.keys(A.audit.palette).forEach(c => { const v = rgbOf(c); if (!v) return; total++; const key = v.join(','); if (!pal.has(key)) off[c] = (off[c] || 0) + A.audit.palette[c]; }));
    say(`§PALETTE_CARDS distinct_off_palette_colours=${Object.keys(off).length} ${Object.keys(off).length ? 'FAIL ' + JSON.stringify(off) : 'PASS'} (palette = ${Object.keys(PALETTE.colours).map(k => PALETTE.colours[k].hex).join(' ')})`); }
  // contrast of every text run against its own background
  { let worst = 99, worstT = '', nbad = 0, n = 0; audits.forEach(A => A.audit.colors.forEach(c => { const f = rgbOf(c.c), g = rgbOf(c.bg); if (!f || !g) return; n++; const ratio = contrast(f, g), large = c.px >= 24 || (c.px >= 18.66 && c.w >= 700), need = large ? 3 : 4.5; if (ratio < worst) { worst = ratio; worstT = c.t + ' @' + c.px + 'px'; } if (ratio < need) { nbad++; if (nbad <= 6) say(`§CONTRAST_BAD ${A.id} ratio=${ratio.toFixed(2)} need=${need} ${c.c} on ${c.bg} "${c.t}" ${c.px}px`); } }));
    say(`§CONTRAST text_runs=${n} below_WCAG_AA=${nbad} lowest=${worst.toFixed(2)} ("${worstT}") ${nbad ? 'FAIL' : 'PASS'}`); }
  say(`§CONSOLE_ERRORS console_errors=${consoleErr} page_errors=${pageErr} failed_requests=${reqFail} ${consoleErr || pageErr || reqFail ? 'FAIL' : 'PASS'}`);
  fs.writeFileSync(path.join(OUT, 'film.page.log'), PL.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'cards_audit.json'), JSON.stringify(audits.map(A => ({ id: A.id, text: A.audit.text, hiddenAtEnd: A.audit.hiddenAtEnd })), null, 1));
  const lines = []; let i = 0; while (i < frames.length) { let j = i; while (j + 1 < frames.length && frames[j + 1] === frames[i]) j++; lines.push(`file '${frames[i]}'`, `duration ${((j - i + 1) / FPS).toFixed(6)}`); i = j + 1; }
  lines.push(`file '${frames[frames.length - 1]}'`); fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'film_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', `fps=${FPS},scale=1920:930:flags=lanczos,pad=1920:1080:0:0:color=0x080A0E,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-frames:v', String(N), mp4]);
  say(`§FILM_DONE frames=${N} distinct_images=${new Set(frames).size} dur=${(N / FPS).toFixed(2)}s out=${mp4}`);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({ total: t, frames: N, beats }, null, 1)); await browser.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§FILM_ERROR ' + (e.stack || e) + '\n'); process.exit(1); });
