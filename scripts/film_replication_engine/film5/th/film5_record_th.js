// ⚠ DO NOT REMOVE — THAI copy of ../film5_record.js (paths to ../facts5.js, ./cards5_th.js, ./stage5_th.html). Scope: RECORD the silent picture of the Thai cut of Film 5 "Trust and the thin pipe" (cards only, no 3D, no GPU): headless Chrome with --disable-gpu, CPU only. The clock is STEPPED (frame k = k/24 s) and the page is a pure function of it.
// Adapted from film2/film4_record.js (not edited there). Read the log after every run: <out>/film.log holds §FILM_*, §ONSCREEN_*, §PALETTE_*, §CONTRAST_*, §CONSOLE_*.
// Run:  node film5_record.js <outDir>      env BEAT_MIN=<json: seconds each beat is held, from the narration>, DEFAULT_HOLD (s, default 9), FPS (24), SHOTS=<comma film seconds>
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const X = require('./facts5_th.js').build(), Cards = require('./cards5_th.js');
const OUT = path.resolve(process.argv[2] || '.'), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FPS = +(process.env.FPS || 24), DEF = +(process.env.DEFAULT_HOLD || 9);
const MIN = process.env.BEAT_MIN ? JSON.parse(fs.existsSync(process.env.BEAT_MIN) ? fs.readFileSync(process.env.BEAT_MIN, 'utf8') : process.env.BEAT_MIN) : {};
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const PALETTE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'palette.json'), 'utf8'));
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
  await page.goto('file://' + path.join(__dirname, 'stage5_th.html')); await page.waitForFunction(() => window.Stage);
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
  // on-screen numbers: every digit token on every card (all reveal states) must literally occur in a frozen source that the Thai cut still uses (plantrust.log, hosts.log, the tf lines, the SUP lines; thin_derive.log is NOT one any more), or be a listed structural token
  { const allowed = new Set(); Object.values(X.TEXT_USED).forEach(tx => (tx.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach(m => allowed.add(m.replace(/,/g, '')))); for (let i = 0; i <= 13; i++) allowed.add(String(i));            // STEP 1-4 / K0..K3 / the numbered chips 1..13 of the broken-copies row (a plain list index, the count 13 is itself a fact)
    const unknown = []; let ntok = 0; audits.forEach(A => { (A.audit.fullText.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach(m => { ntok++; const v = m.replace(/,/g, ''); if (!allowed.has(v)) unknown.push(A.id + ':' + m); }); });
    say(`§ONSCREEN_NUMBERS tokens=${ntok} not_in_any_frozen_source=${unknown.length} ${unknown.length ? 'FAIL ' + unknown.join(' ') : 'PASS'}`);
    const ctl = '12345678'; say(`§ONSCREEN_NUMBERS_CONTROL a planted token (${ctl}) is ${allowed.has(ctl) ? 'NOT detected FAIL' : 'detected PASS'}`); }
  // source tags: every 'file line N' citation on a card is a line number of the LIVE file (facts5_th.js remaps the English cites by text); that live line must be a line that is literally in the frozen copy (or in the SUP lines)
  { const TH = require('./facts5_th.js'), KEY = { 'TEAMWORK_FRAMEWORK.md': 'tf', 'witness_comm_plantrust.log': 'pt', 'hosts.log': 'ho' }; const frozenSet = {}; Object.keys(KEY).forEach(f => { const k = KEY[f]; frozenSet[k] = new Set(TH.frozenLines(k).filter(t => t.trim())); });
    TH.supRaw.forEach(x => frozenSet.tf.add(x.text)); let nc = 0, nb = 0;
    const judge = (beat, file, line) => { const k = KEY[file]; if (!k) return 'unknown file ' + file; const lv = TH.liveLines[k]; if (!lv) return 'live file unreadable'; const t = lv[line - 1]; if (t === undefined || !t.trim()) return 'live line ' + line + ' is empty or past the end'; if (!frozenSet[k].has(t)) return 'live line ' + line + ' is not a line of the frozen copy: "' + t.trim().slice(0, 60) + '"'; return null; };
    audits.forEach(A => { const st = A.audit.srcText; if (/\(\?\)|frozen copy only/.test(st)) { nb++; say(`§SRC_LINE_BAD beat=${A.id} cites a line that could not be re-found in the live file: ${st.slice(0, 160)}`); }
      for (const m of st.matchAll(/([A-Za-z_.0-9]+\.(?:md|log)) line (\d+)/g)) { nc++; const why = judge(A.id, m[1], +m[2]); if (why) { nb++; say(`§SRC_LINE_BAD beat=${A.id} ${m[1]} line ${m[2]}: ${why}`); } else say(`§SRC_LINE beat=${A.id} ${m[1]} line ${m[2]} = "${TH.liveLines[KEY[m[1]]][+m[2] - 1].trim().slice(0, 70).replace(/\s+/g, ' ')}"`); } });
    const ctl = judge('control', 'TEAMWORK_FRAMEWORK.md', 10), ctl2 = judge('control', 'hosts.log', 99999);
    say(`§SRC_LINES citations=${nc} pointing_nowhere=${nb} ${nb || !nc ? 'FAIL' : 'PASS'}`); say(`§SRC_LINES_CONTROL a planted cite to a live line that is not in the frozen copy is ${ctl ? 'detected' : 'NOT detected FAIL'}; a cite past the end of the file is ${ctl2 ? 'detected' : 'NOT detected FAIL'} ${ctl && ctl2 ? 'PASS' : 'FAIL'}`); }
  // palette: every solid colour the cards use (text, fills, borders) must be in film5/palette.json
  { const pal = new Set(Object.values(PALETTE.colours).map(c => hex2rgb(c.hex).join(',')).concat(['255,255,255'])); const off = {}; let total = 0;
    audits.forEach(A => Object.keys(A.audit.palette).forEach(c => { const v = rgbOf(c); if (!v) return; total++; const key = v.join(','); if (!pal.has(key)) off[c] = (off[c] || 0) + A.audit.palette[c]; }));
    say(`§PALETTE_CARDS distinct_off_palette_colours=${Object.keys(off).length} ${Object.keys(off).length ? 'FAIL ' + JSON.stringify(off) : 'PASS'} (palette = ${Object.keys(PALETTE.colours).map(k => PALETTE.colours[k].hex).join(' ')})`); }
  // contrast of every text run against its own background
  { let worst = 99, worstT = '', nbad = 0, n = 0; audits.forEach(A => A.audit.colors.forEach(c => { const f = rgbOf(c.c), g = rgbOf(c.bg); if (!f || !g) return; n++; const ratio = contrast(f, g), large = c.px >= 24 || (c.px >= 18.66 && c.w >= 700), need = large ? 3 : 4.5; if (ratio < worst) { worst = ratio; worstT = c.t + ' @' + c.px + 'px'; } if (ratio < need) { nbad++; if (nbad <= 6) say(`§CONTRAST_BAD ${A.id} ratio=${ratio.toFixed(2)} need=${need} ${c.c} on ${c.bg} "${c.t}" ${c.px}px`); } }));
    say(`§CONTRAST text_runs=${n} below_WCAG_AA=${nbad} lowest=${worst.toFixed(2)} ("${worstT}") ${nbad ? 'FAIL' : 'PASS'}`); }
  // glyph witness (Thai): every character that can reach the screen (all reveal states, source tags, fixed chrome) must render as a real glyph in the page's own font stacks, not the tofu box. Control: U+0E3B (no font has it) must render unlike blank and unlike a real letter.
  { const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); const CH = new Set();
    Object.keys(C).forEach(id => [...strip(C[id])].forEach(c => CH.add(c))); Object.keys(CB.SRCTAG).forEach(id => [...CB.SRCTAG[id]].forEach(c => CH.add(c))); [...'แหล่งที่มา: ตอนที่ ·'].forEach(c => CH.add(c)); audits.forEach(A => [...A.audit.fullText].forEach(c => CH.add(c)));
    const chars = [...CH].filter(c => c.trim() !== '' && c.charCodeAt(0) > 31).sort().join(''); fs.writeFileSync(path.join(OUT, 'screen_chars.txt'), chars);
    const gr = await page.evaluate(chs => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const x = cv.getContext('2d', { willReadFrequently: true });
      const draw = (ch, font) => { x.clearRect(0, 0, 64, 64); x.font = font; x.textBaseline = 'alphabetic'; x.fillStyle = '#000'; x.fillText(ch, 8, 44); const d = x.getImageData(0, 0, 64, 64).data; let h = 5381, ink = 0; for (let i = 3; i < d.length; i += 4) { h = ((h << 5) + h + d[i]) | 0; if (d[i] > 40) ink++; } return h + ':' + ink; };
      const stacks = { sansBold: "700 40px 'Noto Sans','Noto Sans Thai','DejaVu Sans',sans-serif", sansReg: "400 40px 'Noto Sans','Noto Sans Thai','DejaVu Sans',sans-serif", mono: "400 40px 'DejaVu Sans Mono','Noto Sans Thai',monospace" };
      const out = { stacks: Object.keys(stacks), missing: {}, control: {} };
      Object.keys(stacks).forEach(k => { const tofu = draw('\u0E3B', stacks[k]), blank = draw(' ', stacks[k]), real = draw('\u0E01', stacks[k]); out.control[k] = { tofuIsInk: +tofu.split(':')[1] > 0, tofuNotBlank: tofu !== blank, tofuNotReal: tofu !== real };
        out.missing[k] = [...chs].filter(ch => { const g = draw(ch, stacks[k]); return g === tofu || g.split(':')[1] === '0'; }); });
      return out; }, chars);
    const ctlOk = Object.values(gr.control).every(c => c.tofuIsInk && c.tofuNotBlank && c.tofuNotReal); const all = new Set();
    [...chars].forEach(ch => { if (gr.stacks.every(k => gr.missing[k].includes(ch))) all.add(ch); });
    say(`§FILM_GLYPH distinct_chars=${[...chars].length} thai_chars=${[...chars].filter(c => /[\u0E00-\u0E7F]/.test(c)).length} control_tofu_detectable=${ctlOk ? 1 : 0} chars_rendering_as_tofu_in_every_stack=${all.size} [${[...all].join('')}] ${ctlOk && all.size === 0 ? 'PASS' : ctlOk ? 'FAIL' : 'INCONCLUSIVE'}`);
    say(`§FILM_GLYPH_DETAIL per_stack_missing=${JSON.stringify(Object.fromEntries(Object.entries(gr.missing).map(([k, v]) => [k, v.join('')])))}`); }
  say(`§CONSOLE_ERRORS console_errors=${consoleErr} page_errors=${pageErr} failed_requests=${reqFail} ${consoleErr || pageErr || reqFail ? 'FAIL' : 'PASS'}`);
  fs.writeFileSync(path.join(OUT, 'film.page.log'), PL.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'cards_audit.json'), JSON.stringify(audits.map(A => ({ id: A.id, text: A.audit.text, hiddenAtEnd: A.audit.hiddenAtEnd })), null, 1));
  const lines = []; let i = 0; while (i < frames.length) { let j = i; while (j + 1 < frames.length && frames[j + 1] === frames[i]) j++; lines.push(`file '${frames[i]}'`, `duration ${((j - i + 1) / FPS).toFixed(6)}`); i = j + 1; }
  lines.push(`file '${frames[frames.length - 1]}'`); fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'film_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', `fps=${FPS},scale=1920:930:flags=lanczos,pad=1920:1080:0:0:color=0x080A0E,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-frames:v', String(N), mp4]);
  say(`§FILM_DONE frames=${N} distinct_images=${new Set(frames).size} dur=${(N / FPS).toFixed(2)}s out=${mp4}`);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({ total: t, frames: N, beats }, null, 1)); await browser.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§FILM_ERROR ' + (e.stack || e) + '\n'); process.exit(1); });
