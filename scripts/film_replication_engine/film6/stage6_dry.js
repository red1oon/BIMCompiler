// ⚠ DO NOT REMOVE — Scope: NOSHOT dry run of stage6 over a trace (default trace6_DRAFT.json): steps the film clock, takes NO screenshot, and runs the layout/consistency witnesses on the DOM at every sampled time. Headless Chrome --disable-gpu, CPU only.
// Witnesses: (W1) ONLINE/OFFLINE badge of every device == an independent recomputation from the trace file, at every sample; (W2) no text block overflows its box / is truncated; (W3) WCAG contrast >= 4.5 per text run; (W4) every colour in the Civil Works palette (HTML computed colours + SVG fill/stroke);
// (W5) each trace event fires exactly once, in order; envelopes on screen == send/deliver/verify/ack events in flight; (W6) Stage.at is a pure function (same time -> same hash after visiting other times); (W7) a DRAFT trace paints the DRAFT watermark AND film6_guard.js refuses it; (W8) trace validates against trace6.schema.json.
// CONTROLS (each must be DETECTED or the verdict is INCONCLUSIVE): wrong-badge expectation, overflowing text planted, low-contrast text planted, off-palette colour planted, guard accepting a DRAFT. READ THE LOG (logs/stage6_dry.log).
// Usage: node stage6_dry.js [trace.json=trace6_DRAFT.json] [stepSeconds=0.5]
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const TRACE = path.resolve(process.argv[2] || path.join(__dirname, 'trace6_DRAFT.json')), STEP = +(process.argv[3] || 0.5);
const trace = JSON.parse(fs.readFileSync(TRACE, 'utf8')), schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'trace6.schema.json'), 'utf8'));
const PAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'palette.json'), 'utf8')), hex2rgb = h => { const m = /^#(..)(..)(..)$/.exec(h); return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]; };
const PALSET = new Set(Object.values(PAL.colours).map(c => hex2rgb(c.hex).join(',')));
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const say = s => console.log(s); const fails = [];
// ---- W8 schema (mini validator: required / enum / const / type) ----
function validate(v, sc, p, out) { if (!sc) return; if (sc.const !== undefined && v !== sc.const) out.push(`${p}: expected ${sc.const}`); if (sc.enum && !sc.enum.includes(v)) out.push(`${p}: ${JSON.stringify(v)} not in enum`);
  if (sc.type === 'object') { if (typeof v !== 'object' || v === null || Array.isArray(v)) { out.push(p + ': not an object'); return; } (sc.required || []).forEach(k => { if (!(k in v)) out.push(`${p}.${k}: required`); }); Object.keys(sc.properties || {}).forEach(k => { if (k in v) validate(v[k], sc.properties[k], p + '.' + k, out); }); }
  else if (sc.type === 'array') { if (!Array.isArray(v)) { out.push(p + ': not an array'); return; } v.forEach((x, i) => validate(x, sc.items, `${p}[${i}]`, out)); } else if (sc.type === 'string' && typeof v !== 'string') out.push(p + ': not a string'); else if (sc.type === 'number' && typeof v !== 'number') out.push(p + ': not a number'); else if (sc.type === 'integer' && !Number.isInteger(v)) out.push(p + ': not an integer'); }
const sv = []; validate(trace, schema, '$', sv);
const E = trace.events; let prevSeq = 0, prevBeat = null, prevT = -1; E.forEach((e, i) => { if (e.seq <= prevSeq) sv.push(`event ${i}: seq not increasing`); prevSeq = e.seq; if (e.beat === prevBeat && e.t_min < prevT) sv.push(`event ${i}: t_min goes back inside beat ${e.beat}`); prevBeat = e.beat; prevT = e.t_min; if (!trace.header.beats.some(b => b.id === e.beat)) sv.push(`event ${i}: unknown beat ${e.beat}`); });
if (trace.header.status === 'DRAFT' && !trace.header.draft_notice) sv.push('DRAFT without draft_notice');
say(`§STAGE_SCHEMA events=${E.length} problems=${sv.length}${sv.length ? ' :: ' + sv.slice(0, 5).join(' | ') : ''}`); if (sv.length) fails.push('schema');
// ---- the film plan (windows per beat; a dry-run plan, the recorder brings the real one) ----
const beats = [{ id: 'card_ch1', start: 0, end: 2.5, card: 'ch1', title: 'card' }]; let t = 2.5;
trace.header.beats.forEach(b => { const n = E.filter(e => e.beat === b.id).length, d = Math.max(12, n * 2.2 + 3); beats.push({ id: b.id, start: t, end: t + d, title: b.title, src: b.src }); t += d; });
const TOTAL = t;
// independent expectation of online/offline from the trace file (not from stage code)
function expectOnline(ft, ftOf) { const on = Object.assign({}, trace.header.initial_online || {}); E.forEach((e, i) => { if (ftOf[i] <= ft + 1e-9) { if (e.kind === 'online') on[e.actor] = true; if (e.kind === 'offline') on[e.actor] = false; } }); return on; }
function probe(PALARR) {
  const out = { runs: [], overflow: [], colours: [], outside: [], svgCols: [] }, rgb = s => { const m = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?/.exec(s); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.99) return c.slice(0, 3); } return [8, 10, 14]; };
  document.querySelectorAll('#app *').forEach(el => {
    if (el.closest('svg')) return; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('#wm')) return;
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    if (own) { const c = rgb(cs.color); out.runs.push({ text: own.slice(0, 40), color: c.slice(0, 3), bg: bgOf(el), op: parseFloat(cs.opacity) }); const r = document.createRange(); r.selectNodeContents(el); Array.from(r.getClientRects()).forEach(q => { if (q.width > 0 && (q.left < 4 || q.right > 1916 || q.top < 2 || q.bottom > 928)) out.outside.push(own.slice(0, 40)); }); }
    if (el.matches('.st,.nt,.lg,.card') && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) out.overflow.push((el.id || el.className) + ': ' + el.textContent.slice(0, 40));
    if (el.matches('.hd,.lg div,#stripT,#stripS,.part,.nm,.sb') && el.scrollWidth > el.clientWidth + 1) out.overflow.push('wide ' + (el.id || el.className) + ': ' + el.textContent.slice(0, 40));
    [cs.color, cs.backgroundColor, cs.borderTopWidth !== '0px' ? cs.borderTopColor : null].forEach((v, i) => { const c = v && rgb(v); if (c && c[3] > 0.05 && (i !== 0 || own)) out.colours.push({ c: c.slice(0, 3), who: (el.id || el.className) + '' }); });
  });
  document.querySelectorAll('#svg [fill],#svg [stroke]').forEach(el => { ['fill', 'stroke'].forEach(a => { const v = el.getAttribute(a); if (v && v !== 'none') out.svgCols.push(v.toUpperCase()); }); });
  // text blocks inside the SVG panel must stay inside 1920x326
  document.querySelectorAll('#svg text').forEach(tx => { const b = tx.getBBox(); if (b.x < 0 || b.x + b.width > 1920 || b.y < 0 || b.y + b.height > 296) out.outside.push('svg:' + tx.textContent.slice(0, 30)); });
  // static card overlap (each card box inside the canvas and not overlapping another)
  const cards = Array.from(document.querySelectorAll('#cards .card')).map(c => c.getBoundingClientRect()); for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) { const a = cards[i], b = cards[j]; if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) out.overflow.push('cards overlap'); }
  return out;
}
function judge(m) { const bad = []; m.runs.forEach(r => { const ratio = contrast(r.color, r.bg); if (ratio < 4.5 && r.op >= 0.99) bad.push(`contrast ${ratio.toFixed(2)} "${r.text}"`); }); m.overflow.forEach(o => bad.push('overflow ' + o)); m.outside.forEach(o => bad.push('outside canvas ' + o));
  m.colours.forEach(c => { if (!PALSET.has(c.c.join(','))) bad.push(`off-palette rgb(${c.c}) on ${c.who}`); }); m.svgCols.forEach(h => { if (/^#[0-9A-F]{6}$/.test(h) && !PALSET.has(hex2rgb(h).join(','))) bad.push('off-palette svg ' + h); if (/^VAR/.test(h)) bad.push('svg var colour ' + h); }); return bad; }
(async () => {
  const Cards = require('./cards6.js'); const X = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts6.resolved.json'), 'utf8')), CL = JSON.parse(fs.readFileSync(path.join(__dirname, 'claims6.json'), 'utf8')); const CB = Cards.build(X, CL);
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'] });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 })).newPage(); let pageErr = 0, consErr = 0;
  page.on('pageerror', e => { pageErr++; say('§STAGE_ERROR pageerror ' + e); }); page.on('console', m => { if (m.type() === 'error') { consErr++; say('§STAGE_ERROR console ' + m.text().slice(0, 160)); } });
  await page.goto('file://' + path.join(__dirname, 'stage6.html')); await page.waitForFunction(() => window.Stage);
  const cardsCss = Cards.CSS; await page.addStyleTag({ content: cardsCss.replace(/html,body\{[^}]*\}/, '').replace(/:root\{[^}]*\}/, '') });
  const info = await page.evaluate(d => window.Stage.init(d), { trace, beats, cards: CB.C }); say(`§STAGE_INIT events=${info.events} status=${info.status} total=${TOTAL.toFixed(1)}s NOSHOT (no screenshot is taken)`);
  const ftOf = await page.evaluate(() => window.Stage.ftTable());
  // W5 part 1: planned fire times are non-decreasing within a beat and each beat's events lie inside its window
  let planBad = 0; E.forEach((e, i) => { const b = beats.find(x => x.id === e.beat); if (ftOf[i] < b.start || ftOf[i] > b.end) planBad++; if (i && E[i - 1].beat === e.beat && ftOf[i] < ftOf[i - 1] - 1e-9) planBad++; }); say(`§STAGE_PLAN events inside their beat window, in order: ${planBad === 0 ? 'OK' : 'BAD ' + planBad}`); if (planBad) fails.push('plan');
  // ---- the sweep ----
  let nS = 0, badgeMis = 0, badgeChecks = 0, layoutBad = 0, firedPrev = 0, firedBad = 0, pillBad = 0, wmBad = 0, minC = 99, pillMax = 0; const hashes = {}; const problems = {};
  for (let ft = 0; ft <= TOTAL + 1e-9; ft += STEP) {
    const r = await page.evaluate(f => window.Stage.at(f), ft); nS++; hashes[ft.toFixed(2)] = r.hash;
    if (r.fired < firedPrev) firedBad++; firedPrev = r.fired;
    if (!r.card) {
      const lab = await page.evaluate(() => window.Stage.labels()), exp = expectOnline(ft, ftOf);
      ['till', 'phone1', 'phone2', 'verifier', 'clerk', 'stock'].forEach(a => { badgeChecks++; const wantOff = !exp[a]; if (!lab[a] || lab[a].off !== wantOff || lab[a].text !== (wantOff ? 'OFFLINE' : 'ONLINE')) { badgeMis++; say(`  §STAGE_BADGE_MISMATCH ft=${ft} ${a} dom=${lab[a] && lab[a].text} expected=${wantOff ? 'OFFLINE' : 'ONLINE'}`); } });
      // envelopes in flight == events of kind send/deliver/verify/ack whose flight window contains ft (independent count)
      const want = E.reduce((s, e, i) => s + (['send', 'deliver', 'verify', 'ack'].includes(e.kind) && ftOf[i] <= ft && ft - ftOf[i] <= 1.1 + 0.4 && (ft - ftOf[i]) / 1.1 <= 1.2 ? 1 : 0), 0), got = (await page.evaluate(() => window.Stage.counters())).pills; pillMax = Math.max(pillMax, got); if (got !== want) { pillBad++; say(`  §STAGE_PILLS_MISMATCH ft=${ft} dom=${got} expected=${want}`); }
    } else { const ovl = await page.evaluate(() => document.getElementById('ov').children.length); if (!ovl) { layoutBad++; say(`  §STAGE_CARD_EMPTY ft=${ft}`); } }
    const m = await page.evaluate(probe), bad = judge(m); m.runs.forEach(x => { if (x.op >= 0.99) minC = Math.min(minC, contrast(x.color, x.bg)); }); if (bad.length) { layoutBad += bad.length; bad.forEach(b => { problems[b] = (problems[b] || 0) + 1; }); }
    const wm = await page.evaluate(() => getComputedStyle(document.getElementById('wm')).display); if (trace.header.status !== 'REAL' && wm === 'none') wmBad++; if (trace.header.status === 'REAL' && wm !== 'none') wmBad++;
  }
  Object.keys(problems).slice(0, 10).forEach(k => say(`  §STAGE_PROBLEM x${problems[k]} ${k}`));
  // W5: at the end, every event has fired exactly once
  const endFired = await page.evaluate(f => window.Stage.at(f).fired, TOTAL); say(`§STAGE_FIRED events=${E.length} fired_at_end=${endFired} regressions=${firedBad} ${endFired === E.length && !firedBad ? 'OK' : 'BAD'}`); if (endFired !== E.length || firedBad) fails.push('fired');
  say(`§STAGE_BADGES checks=${badgeChecks} mismatches=${badgeMis} (every device, every sample, against the trace file)`); if (badgeMis || !badgeChecks) fails.push('badges');
  say(`§STAGE_ENVELOPES samples=${nS} mismatches=${pillBad} max_in_flight=${pillMax}`); if (pillBad || !pillMax) fails.push('pills');
  say(`§STAGE_LAYOUT samples=${nS} problems=${layoutBad} lowest_contrast=${minC.toFixed(2)}`); if (layoutBad) fails.push('layout');
  say(`§STAGE_DRAFT watermark_mismatches=${wmBad} (status ${trace.header.status}: watermark must be ${trace.header.status === 'REAL' ? 'hidden' : 'shown'})`); if (wmBad) fails.push('watermark');
  // W6 purity: revisit times in a different order, hashes must be identical
  let pure = 0, pureBad = 0; const keys = Object.keys(hashes); const order = keys.filter((_, i) => i % 7 === 0).reverse();
  for (const k of order) { const r = await page.evaluate(f => window.Stage.at(f), +k); pure++; if (r.hash !== hashes[k]) { pureBad++; say(`  §STAGE_IMPURE ft=${k}`); } } say(`§STAGE_PURE revisited=${pure} different=${pureBad} ${pureBad ? 'BAD' : 'OK'}`); if (pureBad || !pure) fails.push('pure');
  // ---- CONTROLS ----
  let ctl = 0, ctlOK = 0; const C = (name, ok) => { ctl++; if (ok) ctlOK++; say(`§STAGE_CONTROL ${name} ${ok ? 'DETECTED' : 'NOT DETECTED'}`); };
  const midFt = beats[2].start + (beats[2].end - beats[2].start) * 0.9; await page.evaluate(f => window.Stage.at(f), midFt);
  { const lab = await page.evaluate(() => window.Stage.labels()), exp = expectOnline(midFt, ftOf); const flipped = Object.assign({}, exp, { phone1: !exp.phone1 }); const mis = (a, ex) => lab[a] && lab[a].off !== !ex[a]; C('badge expectation flipped for phone1', mis('phone1', flipped) && !mis('phone1', exp)); }
  { await page.evaluate(() => { const el = document.getElementById('st_till'); el._h = null; el.innerHTML += '<div>' + 'planted overflowing text that is far too long for this card box '.repeat(8) + '</div>'; }); const bad = judge(await page.evaluate(probe)); C('overflowing text planted in the Till card', bad.some(b => /overflow/.test(b))); await page.evaluate(f => window.Stage.at(f), midFt + 0.01); }
  { await page.evaluate(() => { const d = document.createElement('div'); d.id = 'plant'; d.style.cssText = 'position:absolute;left:700px;top:620px;font:400 22px Noto Sans;color:#6B6A63'; d.textContent = 'low contrast planted'; document.getElementById('app').appendChild(d); }); const bad = judge(await page.evaluate(probe)); C('low-contrast text planted', bad.some(b => /contrast/.test(b))); await page.evaluate(() => document.getElementById('plant').remove()); }
  { await page.evaluate(() => { const d = document.createElement('div'); d.id = 'plant'; d.style.cssText = 'position:absolute;left:700px;top:620px;font:400 22px Noto Sans;color:#ff00ff'; d.textContent = 'off palette'; document.getElementById('app').appendChild(d); }); const bad = judge(await page.evaluate(probe)); C('off-palette colour planted', bad.some(b => /off-palette/.test(b))); await page.evaluate(() => document.getElementById('plant').remove()); }
  await browser.close();
  // W7 guard
  const g = cp.spawnSync('node', [path.join(__dirname, 'film6_guard.js'), TRACE], { encoding: 'utf8' }); say(g.stdout.trim()); const isDraft = trace.header.status === 'DRAFT';
  say(`§STAGE_GUARD exit=${g.status} ${isDraft ? (g.status === 4 ? 'REFUSED as required' : 'BAD: DRAFT accepted') : (g.status === 0 ? 'accepted' : 'refused')}`); if (isDraft && g.status !== 4) fails.push('guard');
  { const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'f6guard-')), f = path.join(tmp, 'control_only.json'); const copy = JSON.parse(JSON.stringify(trace)); copy.header.status = 'REAL'; copy.events.forEach(e => { e.wit = 'CONTROL'; }); copy.header.sources = [{ witness: 'CONTROL-ONLY (temp file, deleted)', log: 'none', sha256: '0' }]; fs.writeFileSync(f, JSON.stringify(copy)); const g2 = cp.spawnSync('node', [path.join(__dirname, 'film6_guard.js'), f], { encoding: 'utf8' }); fs.rmSync(tmp, { recursive: true, force: true }); C('guard accepts a well-formed REAL trace (positive control, temp copy deleted)', g2.status === 0); }
  say(`§STAGE_CONTROLS ${ctlOK} of ${ctl} detected`); const inconclusive = ctlOK !== ctl; say(`§STAGE_ERRORS pageerrors=${pageErr} console_errors=${consErr}`); if (pageErr || consErr) fails.push('errors');
  say(`§STAGE_VERDICT ${inconclusive ? 'INCONCLUSIVE (a control did not detect its fault)' : fails.length ? 'FAIL ' + fails.join(',') : 'PASS'} samples=${nS} trace=${path.basename(TRACE)} status=${trace.header.status}${isDraft ? ' (DRAFT: layout evidence only, NOT publishable)' : ''}`);
  process.exit(fails.length || inconclusive ? 1 : 0);
})();
