// ⚠ DO NOT REMOVE — Scope: WITNESS for the FILM-M1 stage compositor, frame=phone (rc2) — MOBILE_PERF.md §FILM-M1 RECORDING SPEC R4.
// READ the log after every run; the exit code is not evidence. Issues this proves or disproves:
//   (a) the phone screen keeps the recording's 456:933 aspect (nothing squeezed)         (b) the <img> fills exactly the stated screen rect (nothing cropped/stretched)
//   (c) the pixels inside the screen ARE the recording (mean abs diff vs the source scaled to the rect; a wrong frame must score far worse)
//   (d) bezel pixels are the bezel colour, background is the plain background, and nothing of the recording leaks outside (solid-magenta control)
//   (e) a manifest `tap` ({x,y} or [x,y], recording pixels) draws ONE ring at the mapped point; no `tap` draws nothing; the rest of the frame is unchanged
//   (f) frame=trailer still renders the rc1 device: screenshot sha256 equals the UNMODIFIED rc1 stage.html for the same descriptors
//   RED control: a screen forced to 456:800 must FAIL (a) and (b), or the verdict is INCONCLUSIVE (the witness could not report a failure).
// Run: node witness_stage.js <work> [<old_stage.html from origin/film/m1-clash-beat>]   (work holds A/ B/ HQ/ opener/ from the rc1 recording)
'use strict';
const os = require('os'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const W = path.resolve(process.argv[2] || '.'), OLD = process.argv[3] || '', DUMP = process.env.DUMP || '';
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const J = p => JSON.parse(fs.readFileSync(path.join(W, p), 'utf8')), url = p => 'file://' + path.join(W, p);
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
let judged = 0, fails = 0;
const judge = (tag, ok, detail) => { judged++; if (!ok) fails++; say(`§WIT ${tag} ${ok ? 'OK' : 'FAIL'} ${detail}`); return ok; };

(async () => {
  const A = J('A/manifest.json'), B = J('B/manifest.json'), HQ = J('HQ/manifest.json');
  const fA = i => 'A/' + A.frames[i].f, fB = i => 'B/' + B.frames[i].f, fHQ = 'HQ/' + HQ.frames[0].f;
  const iTap = A.frames.findIndex(f => f.tap), iNoTap = [0, Math.floor(A.frames.length / 2), A.frames.length - 1];
  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }), ana = await browser.newPage({ viewport: { width: 400, height: 300 } });
  const perrs = []; page.on('pageerror', e => perrs.push(String(e)));
  await page.goto('file://' + path.join(__dirname, 'stage.html'));
  const C = await page.evaluate(() => window.STAGE.consts), NAT = C.NAT, NATR = NAT.w / NAT.h;
  const magenta = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 456; c.height = 933; const x = c.getContext('2d'); x.fillStyle = '#ff00ff'; x.fillRect(0, 0, 456, 933); return c.toDataURL('image/png'); });

  // ---- shared helpers ----
  const shot = async d => { await page.evaluate(d_ => window.STAGE.render(d_), d); await page.evaluate(async () => { await Promise.all([...document.images].map(x => x.decode().catch(() => {}))); }); return page.screenshot(); };
  const dom = () => page.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    return { phones: [...document.querySelectorAll('.pscr')].map(e => ({ role: e.dataset.role, scr: R(e), img: R(e.querySelector('img')), nat: [e.querySelector('img').naturalWidth, e.querySelector('img').naturalHeight], ring: e.querySelector('.pring') ? R(e.querySelector('.pring')) : null })),
      wins: [...document.querySelectorAll('.win')].map(e => ({ content: R(e.querySelector('.wscr')), img: R(e.querySelector('.wscr img')), url: e.querySelector('.url').textContent, nat: [e.querySelector('.wscr img').naturalWidth, e.querySelector('.wscr img').naturalHeight] })),
      rings: document.querySelectorAll('.pring').length, cards: document.querySelectorAll('.card').length, phonesN: document.querySelectorAll('.pscr').length }; });
  // analysis page: decode a screenshot buffer + a source png, compare / sample
  const anaRun = (fn, arg) => ana.evaluate(fn, arg);
  const mad = (shotBuf, srcUrl, r, inset) => anaRun(async a => {
    const L = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
    const S = await L(a.shot), Q = await L(a.src); const c = document.createElement('canvas'); c.width = S.width; c.height = S.height; const x = c.getContext('2d'); x.drawImage(S, 0, 0);
    const rx = Math.round(a.r.x), ry = Math.round(a.r.y), rw = Math.round(a.r.w), rh = Math.round(a.r.h);
    const t = document.createElement('canvas'); t.width = rw; t.height = rh; const y = t.getContext('2d'); y.imageSmoothingEnabled = true; y.imageSmoothingQuality = 'high'; y.drawImage(Q, 0, 0, rw, rh);
    const sd = x.getImageData(rx, ry, rw, rh).data, td = y.getImageData(0, 0, rw, rh).data; let sum = 0, n = 0, big = 0;
    for (let j = a.inset; j < rh - a.inset; j++) for (let i = a.inset; i < rw - a.inset; i++) { const p = (j * rw + i) * 4; const d = (Math.abs(sd[p] - td[p]) + Math.abs(sd[p + 1] - td[p + 1]) + Math.abs(sd[p + 2] - td[p + 2])) / 3; sum += d; n++; if (d > 48) big++; }
    return { mad: sum / n, pctBig: 100 * big / n, n };
  }, { shot: 'data:image/png;base64,' + shotBuf.toString('base64'), src: srcUrl, r, inset });
  const px = (shotBuf, pts) => anaRun(async a => { const S = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = a.shot; });
    const c = document.createElement('canvas'); c.width = S.width; c.height = S.height; const x = c.getContext('2d'); x.drawImage(S, 0, 0); return a.pts.map(p => Array.from(x.getImageData(Math.round(p[0]), Math.round(p[1]), 1, 1).data.slice(0, 3))); },
    { shot: 'data:image/png;base64,' + shotBuf.toString('base64'), pts });
  const leak = (shotBuf, inRects) => anaRun(async a => { const S = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = a.shot; });
    const c = document.createElement('canvas'); c.width = S.width; c.height = S.height; const x = c.getContext('2d'); x.drawImage(S, 0, 0); const d = x.getImageData(0, 0, S.width, S.height).data;
    let outside = 0, inside = 0, insideN = 0; const isIn = (i, j, m) => a.rects.some(r => i >= r.x - m && i < r.x + r.w + m && j >= r.y - m && j < r.y + r.h + m);
    for (let j = 0; j < S.height; j++) for (let i = 0; i < S.width; i++) { const p = (j * S.width + i) * 4, mg = d[p] > 200 && d[p + 1] < 70 && d[p + 2] > 200;
      if (mg && !isIn(i, j, 1)) outside++; if (isIn(i, j, -40)) { insideN++; if (mg) inside++; } }
    return { outside, inside, insideN }; }, { shot: 'data:image/png;base64,' + shotBuf.toString('base64'), rects: inRects });
  const near = (p, q, t) => p.every((v, i) => Math.abs(v - q[i]) <= t);
  const dump = (name, buf) => { if (DUMP) { fs.mkdirSync(DUMP, { recursive: true }); fs.writeFileSync(path.join(DUMP, name + '.png'), buf); } };

  // ---- cases: sample frames per layout ----
  const cases = [];
  for (const i of iNoTap) cases.push({ name: `phone/A${i}`, d: { frame: 'phone', layout: 'phone', A: { src: url(fA(i)) } }, A: fA(i) });
  for (const i of iNoTap) cases.push({ name: `phone+desktop/A${i}`, d: { frame: 'phone', layout: 'phone+desktop', A: { src: url(fA(i)) }, hq: url(fHQ), labels: { A: 'Site A · Duplex', D: 'HQ · desktop' } }, A: fA(i), HQ: fHQ });
  const nB = B.frames.length; for (const j of [0, Math.floor(nB / 2), nB - 1]) cases.push({ name: `phone+desktop+phone/B${j}`, d: { frame: 'phone', layout: 'phone+desktop+phone', A: { src: url(fA(A.frames.length - 1)) }, hq: url(fHQ), B: { src: url(fB(j)) }, labels: { A: 'Site A · Duplex', D: 'HQ · desktop', B: 'Site B' } }, A: fA(A.frames.length - 1), B: fB(j), HQ: fHQ });
  for (const u of [0, 1]) cases.push({ name: `morph u=${u}`, d: { frame: 'phone', layout: 'phone+desktop+phone', morph: { from: 'phone', u }, A: { src: url(fA(A.frames.length - 1)) }, hq: url(fHQ), B: { src: url(fB(0)) } }, A: fA(A.frames.length - 1), B: fB(0), HQ: fHQ, expectSpec: u === 1, skipDesk: u === 0 });
  const other = fB(0);   // wrong-content control: a frame of ANOTHER site
  let negMad = null, posMads = [];
  for (const c of cases) {
    const buf = await shot(c.d); dump(c.name.replace(/[^\w.=-]/g, '_'), buf); const m = await dom(), R = await page.evaluate(n => window.STAGE.layout(n), c.d.layout);
    const specs = { A: R.phone, B: R.phoneB };
    for (const p of m.phones) {
      const aErr = Math.abs(p.scr.w / p.scr.h / NATR - 1) * 100;
      judge(`(a) aspect ${c.name} ${p.role}`, aErr <= 0.5 && p.nat[0] === NAT.w && p.nat[1] === NAT.h, `screen=${p.scr.w.toFixed(2)}x${p.scr.h.toFixed(2)} aspect_err=${aErr.toFixed(4)}% src_nat=${p.nat.join('x')}`);
      const sp = specs[p.role], dI = ['x', 'y', 'w', 'h'].map(k => Math.abs(p.img[k] - p.scr[k])), dS = c.expectSpec || !c.d.morph ? ['x', 'y', 'w', 'h'].map(k => Math.abs(p.img[k] - sp[k])) : [0];
      judge(`(b) img==screen${c.expectSpec || !c.d.morph ? '==spec' : ''} ${c.name} ${p.role}`, Math.max(...dI, ...dS) <= 1, `img=${[p.img.x, p.img.y, p.img.w, p.img.h].map(v => v.toFixed(2))} screen=${[p.scr.x, p.scr.y, p.scr.w, p.scr.h].map(v => v.toFixed(2))} max_d=${Math.max(...dI, ...dS).toFixed(3)}px`);
      if (!c.d.morph || c.expectSpec) {   // (c) the recording really is the content, at the mapped rect
        const r = await mad(buf, b64(path.join(W, c[p.role])), p.scr, 50), pass = r.mad <= 6 && r.pctBig <= 3; posMads.push(r.mad);
        judge(`(c) pixels==recording ${c.name} ${p.role}`, pass, `mad=${r.mad.toFixed(2)}/255 big_px=${r.pctBig.toFixed(2)}% n=${r.n}`);
        if (negMad === null && p.role === 'A' && c.name.startsWith('phone/')) { const w = await mad(buf, b64(path.join(W, other)), p.scr, 50); negMad = w.mad; say(`§WIT (c) NEGCONTROL wrong frame ${other} vs shot of ${c.A}: mad=${w.mad.toFixed(2)}/255 big_px=${w.pctBig.toFixed(2)}%`); }
        // (d) bezel colour at mid-bezel on the four sides (top sampled 60 px off-centre: the camera dot sits at the centre), beyond-body = plain bg
        const s = p.scr, bz = C.BEZEL / 2, pts = [[s.x - bz, s.y + s.h / 2], [s.x + s.w + bz, s.y + s.h / 2], [s.x + s.w / 2 + 60, s.y - bz], [s.x + s.w / 2, s.y + s.h + bz], [10, 10]];
        const got = await px(buf, pts); const okB = got.slice(0, 4).every(g => near(g, C.BEZEL_RGB, 3));
        judge(`(d) bezel colour + plain bg ${c.name} ${p.role}`, okB && near(got[4], C.BG_RGB, 2), `bezel L/R/T/B=${got.slice(0, 4).map(g => g.join('.')).join(' ')} want=${C.BEZEL_RGB.join('.')}±3; bg(10,10)=${got[4].join('.')} want=${C.BG_RGB.join('.')}±2`);
      }
    }
    for (const w of m.wins) { if (c.skipDesk) continue;
      const e = Math.abs(w.img.w / w.img.h / (16 / 9) - 1) * 100, d = ['x', 'y', 'w', 'h'].map(k => Math.abs(w.img[k] - w.content[k]));
      judge(`(a') desktop 16:9 ${c.name}`, e <= 0.5 && w.url === 'HQ' && w.nat[0] === 1920 && w.nat[1] === 1080, `content=${w.content.w.toFixed(2)}x${w.content.h.toFixed(2)} aspect_err=${e.toFixed(4)}% url_text="${w.url}" src_nat=${w.nat.join('x')}`);
      judge(`(b') desktop img==content ${c.name}`, Math.max(...d) <= 1, `max_d=${Math.max(...d).toFixed(3)}px`);
      if (!c.d.morph || c.expectSpec) { const r = await mad(buf, b64(path.join(W, c.HQ)), w.content, 30); judge(`(c') desktop pixels==HQ recording ${c.name}`, r.mad <= 12 && r.pctBig <= 6, `mad=${r.mad.toFixed(2)}/255 big_px=${r.pctBig.toFixed(2)}% n=${r.n}`); } }
  }
  // (c) discriminating? the wrong-frame control must score far worse than every right frame
  const worstPos = Math.max(...posMads); const discr = negMad !== null && negMad > 3 * worstPos + 3;
  say(`§WIT (c) DISCRIMINATION wrong_frame_mad=${negMad === null ? 'n/a' : negMad.toFixed(2)} worst_right_mad=${worstPos.toFixed(2)} ${discr ? 'OK (control separates)' : 'NOT DISCRIMINATING'}`);

  // ---- (d) leak control: solid magenta everywhere; any magenta outside the screens/content = the recording leaked past its frame ----
  { const d = { frame: 'phone', layout: 'phone+desktop+phone', A: { src: magenta }, hq: magenta, B: { src: magenta }, labels: { A: 'A', D: 'HQ', B: 'B' } }, buf = await shot(d), m = await dom();
    const rects = [...m.phones.map(p => p.scr), ...m.wins.map(w => w.content)], r = await leak(buf, rects);
    judge('(d) leak control (solid magenta, 3 devices)', r.outside === 0 && r.insideN > 0 && r.inside / r.insideN >= 0.98, `magenta_outside=${r.outside} magenta_inside=${r.inside}/${r.insideN}`);
    const d1 = { frame: 'phone', layout: 'phone', A: { src: magenta } }, b1 = await shot(d1), m1 = await dom(), r1 = await leak(b1, m1.phones.map(p => p.scr));
    judge('(d) leak control (solid magenta, layout phone)', r1.outside === 0 && r1.insideN > 0 && r1.inside / r1.insideN >= 0.98, `magenta_outside=${r1.outside} magenta_inside=${r1.inside}/${r1.insideN}`); }

  // ---- (e) tap ----
  const tapCases = [['phone', { x: 228, y: 466 }, 'obj'], ['phone', [300, 700], 'arr'], ['phone+desktop+phone', { x: 300, y: 700 }, 'obj@s=.86']];
  for (const [lay, tap, form] of tapCases) {
    const base = { frame: 'phone', layout: lay, A: { src: url(fA(iNoTap[0])) } }; if (lay.includes('desktop')) base.hq = url(fHQ); if (lay.endsWith('+phone')) base.B = { src: url(fB(0)) };
    const b0 = await shot(base), m0 = await dom(); const b1 = await shot({ ...base, A: { ...base.A, tap } }), m1 = await dom();
    const sc = m1.phones.find(p => p.role === 'A').scr, k = sc.w / NAT.w, t = Array.isArray(tap) ? { x: tap[0], y: tap[1] } : tap, mx = sc.x + t.x * k, my = sc.y + t.y * k;
    const [p0, p1, f0, f1] = await px(b0, [[mx, my], [mx, my]]).then(async a => [a[0], (await px(b1, [[mx, my]]))[0], (await px(b0, [[sc.x + 60 * k, sc.y + 60 * k]]))[0], (await px(b1, [[sc.x + 60 * k, sc.y + 60 * k]]))[0]]);
    const dd = Math.abs(p0[0] - p1[0]) + Math.abs(p0[1] - p1[1]) + Math.abs(p0[2] - p1[2]), ring = m1.phones.find(p => p.role === 'A').ring, ringC = ring && [ring.x + ring.w / 2, ring.y + ring.h / 2];
    judge(`(e) tap ${form} ${lay}`, m0.rings === 0 && m1.rings === 1 && dd > 30 && near(f0, f1, 0) && ringC && Math.abs(ringC[0] - mx) <= 1 && Math.abs(ringC[1] - my) <= 1 && ring.x >= sc.x && ring.y >= sc.y && ring.x + ring.w <= sc.x + sc.w && ring.y + ring.h <= sc.y + sc.h,
      `rings no_tap=${m0.rings} tap=${m1.rings} mapped=(${mx.toFixed(1)},${my.toFixed(1)}) ring_centre=(${ringC ? ringC[0].toFixed(1) + ',' + ringC[1].toFixed(1) : 'none'}) px_no_tap=${p0.join('.')} px_tap=${p1.join('.')} delta=${dd} far_px_same=${near(f0, f1, 0)}`);
    if (lay === 'phone' && form === 'obj') dump('tap_phone', b1); }
  if (iTap >= 0) { const d = { frame: 'phone', layout: 'phone', A: { src: url(fA(iTap)), tap: A.frames[iTap].tap } }; await shot(d); const m = await dom(); judge('(e) real manifest tap array [x,y] from rc1 A (frame ' + iTap + ')', m.rings === 1, `tap=${JSON.stringify(A.frames[iTap].tap)} rings=${m.rings}`); }
  { await shot({ frame: 'phone', layout: 'phone', A: { src: url(fA(0)), tap: null } }); const m = await dom(); judge('(e) tap:null draws nothing', m.rings === 0, `rings=${m.rings}`); }
  { const taps = [{ x: 'a', y: 1 }, [1], {}, 0]; let bad = 0; for (const t of taps) { await shot({ frame: 'phone', layout: 'phone', A: { src: url(fA(0)), tap: t } }); bad += (await dom()).rings; } judge('(e) malformed tap draws nothing', bad === 0, `rings=${bad} for ${taps.length} malformed entries`); }

  // ---- cards (title in / end card out): no phone body, text present ----
  { await shot({ frame: 'phone', layout: 'phone', cards: [{ title: 'The phone, fast.', sub: 'x', a: 1 }] }); const m = await dom(); judge('(g) title card: text, no phone body', m.cards === 1 && m.phonesN === 0, `cards=${m.cards} phones=${m.phonesN}`); }

  // ---- RED control: a screen forced to 456:800 must FAIL (a) and (b) ----
  let redA = false, redB = false;
  { const d = { frame: 'phone', layout: 'phone', A: { src: url(fA(0)) }, rectOverride: { phone: { w: 456, h: 800 } } }; const buf = await shot(d), m = await dom(), R = await page.evaluate(() => window.STAGE.layout('phone')), p = m.phones[0];
    const aErr = Math.abs(p.scr.w / p.scr.h / NATR - 1) * 100; redA = !(aErr <= 0.5);
    const dS = ['x', 'y', 'w', 'h'].map(k => Math.abs(p.img[k] - R.phone[k])); redB = !(Math.max(...dS) <= 1);
    say(`§WIT RED control screen forced 456x800: (a) ${redA ? 'FAIL as required' : 'PASSED (witness blind!)'} aspect_err=${aErr.toFixed(2)}% ; (b) ${redB ? 'FAIL as required' : 'PASSED (witness blind!)'} img_h=${p.img.h} spec_h=${R.phone.h} max_d=${Math.max(...dS).toFixed(1)}px`);
    dump('red_456x800', buf); }

  // ---- (f) trailer parity vs the UNMODIFIED rc1 stage.html ----
  let fJudged = 0;
  if (OLD && fs.existsSync(OLD) && fs.existsSync(path.join(W, 'opener/boxes.json'))) {
    const box = J('opener/boxes.json').phone, intro = fs.readdirSync(path.join(W, 'opener/intro')).filter(f => f.endsWith('.png')).sort(), bg = url('opener/intro/' + intro[intro.length - 1]), bgMid = url('opener/intro/' + intro[40]);
    const L = { x: 60, y: 190, w: 392, h: 802 }, R = { x: 1468, y: 190, w: 392, h: 802 }, Dk = { x: 520, y: 300, w: 880, h: 495 };
    const ds = [{ bg: bgMid }, { bg, dark: .55, phone: { src: url(fA(iTap >= 0 ? iTap : 0)), r: box, tap: A.frames[iTap >= 0 ? iTap : 0].tap }, cap: 'Ready to touch at once.', sub: 'x', capBox: { x: 90, y: 330, w: 560, subDy: 150 }, capAlpha: 1 },
      { bg, dark: 1, phone: { src: url(fA(5)), r: L }, desk: { src: url(fHQ), r: Dk }, phoneB: { src: url(fB(3)), r: R }, labels: [{ x: L.x, y: 130, w: L.w, text: 'Site A · Duplex', a: 1 }, { x: Dk.x, y: 240, w: Dk.w, text: 'HQ · desktop', a: 1 }], cap: 'HQ opens the same view.', sub: 'y', capBox: { x: 520, y: 850, w: 880, subDy: 66 }, capAlpha: 1 }];
    const old = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); await old.goto('file://' + path.resolve(OLD));
    for (const [i, d0] of ds.entries()) { const hOld = await (async () => { await old.evaluate(d => window.STAGE.render(d), d0); await old.evaluate(async () => { await Promise.all([...document.images].map(x => x.decode().catch(() => {}))); }); return crypto.createHash('sha256').update(await old.screenshot()).digest('hex'); })();
      await shot({ frame: 'phone', layout: 'phone', A: { src: url(fA(0)) } });   // leave the page in phone state first: render(frame=trailer) must restore the rc1 look from there
      const hNew = crypto.createHash('sha256').update(await shot({ ...d0, frame: 'trailer' })).digest('hex');
      judge(`(f) trailer parity sample ${i}`, hOld === hNew, `old=${hOld.slice(0, 16)} new=${hNew.slice(0, 16)}`); fJudged++; }
  } else say('§WIT (f) SKIPPED no old stage.html / opener (verdict will be INCONCLUSIVE)');
  await browser.close();
  say(`§WIT page_errors=${perrs.length}${perrs.length ? ' ' + perrs.join('|') : ''}`);
  if (perrs.length) judge('(h) no page errors', false, perrs.join('|'));
  const controlsOk = redA && redB && discr && fJudged > 0;
  const verdict = judged === 0 || !controlsOk ? (fails ? 'FAIL' : 'INCONCLUSIVE') : fails ? 'FAIL' : 'PASS';
  say(`§WITNESS_STAGE ${verdict} judged=${judged} fails=${fails} red_a_fails=${redA} red_b_fails=${redB} discriminating=${discr} trailer_samples=${fJudged}`);
  fs.writeFileSync(path.join(W, 'witness_stage.log'), LOG.join('\n') + '\n');
  process.exit(verdict === 'PASS' ? 0 : 1);
})().catch(e => { console.log('§WITNESS_STAGE INCONCLUSIVE judged=0 fails=0 fatal ' + e.stack); process.exit(2); });
