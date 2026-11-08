// ⚠ DO NOT REMOVE — Scope: RECORD the silent picture of Film 2 "Keeping the bloat off: the dictionary, replication, and a serverless day" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24).
// Picture = full-screen cards built from live queries / logs / the verified claims (cards2.js) + Film 1's stage replaying the engine's own recorded sample day (trace_film_pos.json, trace_film_mf.json), engine untouched.
// Headless Chrome, --disable-gpu, CPU only. The film clock is STEPPED (frame k = k/24 s) and the page is a pure function of it. Read the log after every run: <out>/film.log holds §FILM_*, §CITE_*, §LOGO_*, §WORDS_*.
// Run:  node film2_record.js <outDir>      env BEAT_MIN=<json: seconds each beat is held, from the narration>, DEFAULT_HOLD (s, default 9), FPS (24), SHOTS=<comma film seconds> (layout look only)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const Core = require('../core.js'), { TD } = require('../facts.js'), X2 = require('./facts2.js'), Cards = require('./cards2.js'), B2 = require('./beats2.js');
const OUT = path.resolve(process.argv[2] || '.'), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FPS = +(process.env.FPS || 24), DEF = +(process.env.DEFAULT_HOLD || 9);
const MIN = process.env.BEAT_MIN ? JSON.parse(fs.existsSync(process.env.BEAT_MIN) ? fs.readFileSync(process.env.BEAT_MIN, 'utf8') : process.env.BEAT_MIN) : {};
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

function cfgRows(R, part) {
  const pick = part === 1 ? ['F1', 'F2', 'R1', 'S1'] : ['S2', 'P1', 'R2', 'N1'];
  return pick.map(id => { const r = R.rows[id]; if (!r) throw new Error('flow row missing ' + id); const nm = r.name.split(' '); const ar = r.dir === 'UP' ? '↑' : r.dir === 'DOWN' ? '↓' : '';
    const rest = r.treatment === 'RULE' ? `on ${r.on.split(' ')[0]} → process ${r.process} → emits ${r.emits.split(' ')[0]}` : r.treatment === 'SEED' ? `${r.audience} · guard ${r.guard}` : `${r.table || 'addressed to the borrower'}${r.carries ? ' · carries ' + r.carries.length + ' named columns' : ''}`;
    return `<b>${nm[0]}</b> ${nm.slice(1).join(' ')} · ${r.treatment} ${ar} · ${rest}`; });
}
function buildData(X, CC) {
  const R = X.R, hold = b => Math.max(b.read || 0, MIN[b.id] || (b.card ? 0 : DEF));
  const mk = (list, trace) => B2.ranges(trace, list).map(b => Object.assign(b, { minHold: hold(b) }));
  const b0 = mk(B2.CARDS0, []), bp = mk(B2.POS, R.pos), bm = mk(B2.MF, R.mf), b3 = mk(B2.CARDS3, []);
  const p0 = Core.plan([], b0), pp = Core.plan(R.pos, bp), pm = Core.plan(R.mf, bm), p3 = Core.plan([], b3);
  let off = 0; const parts = [];
  [[0, 'pos', 'Opener · Parts 1 and 2', [], p0, b0, [], { 1: [8, 19] }], [1, 'pos', 'Part 3 · a serverless day (sample)', R.pos, pp, bp, B2.buildNotes(R, 1, bp), { 1: [8, 19], 2: [8, 20] }],
   [2, 'mf', 'Part 3 · Micro Finance (sample)', R.mf, pm, bm, B2.buildNotes(R, 2, bm), { 1: [8, 19] }], [3, 'pos', 'Limits and sources', [], p3, b3, [], { 1: [8, 19] }]].forEach(([n, layout, label, trace, plan, beats, notes, axis]) => {
    parts.push({ n, layout, label, trace, plan, offset: off, notes, cfgRows: n === 1 ? cfgRows(R, 1) : n === 2 ? cfgRows(R, 2) : [], axis, beats }); off += plan.total; });
  return { parts, facts: X.F, cards: CC.C, total: off };
}

(async () => {
  const X = X2.build(); say('§FILM_FACTS n=' + Object.keys(X.F).length + ' all cross-checks passed (facts2.js, facts.js)');
  const CB = Cards.build(X), SRCINFO = CB.finish(); const CC = { C: CB.C, USED: CB.USED };
  const D = buildData(X, CC); const N = Math.ceil(D.total * FPS - 1e-9);
  say(`§FILM_PLAN parts=${D.parts.map(p => p.plan.total.toFixed(2)).join('/')}s total=${D.total.toFixed(2)}s frames=${N} fps=${FPS} flash=${Core.FLASH}s`);
  D.parts.forEach(p => p.plan.beat.forEach(b => say(`§FILM_PLAN beat=${b.id} start=${(b.start + p.offset).toFixed(2)} end=${(b.end + p.offset).toFixed(2)} hold=${(b.end - b.start).toFixed(2)} narration_hold=${(MIN[b.id] || DEF).toFixed(2)}${MIN[b.id] ? '' : ' (default)'} events=${b.to - b.from}`)));
  const pdata = D.parts.map(p => ({ n: p.n, layout: p.layout, label: p.label, trace: p.trace, plan: p.plan, offset: p.offset, notes: p.notes, cfgRows: p.cfgRows, axis: p.axis }));
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const PL = [], IMGREQ = new Set(); page.on('console', m => PL.push(m.text())); page.on('pageerror', e => { PL.push('PAGEERR ' + e); say('§FILM_ERROR pageerror ' + e); });
  page.on('request', r => { if (r.resourceType() === 'image') IMGREQ.add(decodeURIComponent(r.url().replace(/^file:\/\//, ''))); });
  await page.goto('file://' + path.join(__dirname, 'stage2.html')); await page.waitForFunction(() => window.Stage);
  await page.evaluate(d => window.Stage.init(d), { parts: pdata, facts: D.facts, cards: D.cards });
  const imgs = () => page.evaluate(() => window.Stage.imagesReady());
  if (process.env.SHOTS) {
    for (const f of process.env.SHOTS.split(',').map(Number)) { const r = await page.evaluate(x => window.Stage.at(x), f); await imgs(); await page.screenshot({ path: path.join(OUT, 'shot_' + f.toFixed(1) + '.png'), clip: { x: 0, y: 0, width: 1920, height: 930 } }); const ov = await page.evaluate(() => window.Stage.overflowCard()); say(`§FILM_SHOT ft=${f} beat=${r.beat} card=${r.card} overflow=${JSON.stringify(ov).slice(0, 300)}`); }
    await browser.close(); return;
  }
  const parts = D.parts, firedNode = (P, ft) => { let c = 0; for (let i = 0; i < P.trace.length; i++) if (P.plan.ft[i] + P.offset <= ft + 1e-9) c++; else break; return c; };
  const partAt = ft => { let P = parts[0]; parts.forEach(p => { if (ft >= p.offset) P = p; }); return P; };
  let ovFrames = 0, layoutChecked = 0, cardLayoutBad = 0; const ovSeen = new Set(); let prevHash = null, prevFile = null, lastBeat = null, frames = [], bad = 0, checked = 0, flips = 0;
  const offByFrame = [], runStart = {}, runs = [], lastOff = {}; const cueLog = [], samples = [];
  const ACT = { 1: ['A', 'B', 'PH1', 'HUB'], 2: ['BOR1', 'BOR2', 'HUB'] };
  const t0 = Date.now();
  for (let k = 0; k < N; k++) {
    const ft = k / FPS, r = await page.evaluate(f => { const r = window.Stage.at(f); return { r: r, lab: window.Stage.labels(), ctr: window.Stage.counters() }; }, ft);
    const P = partAt(ft), key = r.r.part + ':' + r.r.beat;
    if (key !== lastBeat) { lastBeat = key; cueLog.push({ id: r.r.beat, t: ft, k }); say(`§FILM_CUE beat=${r.r.beat} id=${r.r.beat} t=${ft.toFixed(2)} trace_t=${r.r.clk === null || r.r.clk === undefined ? 'card' : Math.round(r.r.clk)} frame=${k}`); }
    if (r.r.hash !== prevHash) {
      if (r.r.card) { await imgs(); const ov = await page.evaluate(() => window.Stage.overflowCard()); if (ov.length) { cardLayoutBad++; if (cardLayoutBad <= 8) say(`§FILM_LAYOUT_BAD card=${r.r.card} ft=${ft.toFixed(2)} ${ov.join(' | ').slice(0, 300)}`); } }
      else { const ov = await page.evaluate(() => window.Stage.overflow()); if (ov.length) { ovFrames++; ovSeen.add(ov.join(' | ')); if (ovFrames <= 6) say(`§FILM_LAYOUT_BAD ft=${ft.toFixed(2)} ${ov.join(' | ').slice(0, 300)}`); } }
      layoutChecked++; const fn = path.join(FR, String(k).padStart(6, '0') + '.jpg'); await page.screenshot({ path: fn, type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 930 } }); prevFile = fn; prevHash = r.r.hash; }
    frames.push(prevFile);
    if (!r.r.card && ACT[P.n]) {
      offByFrame[k] = {}; Object.keys(r.lab).forEach(a => { offByFrame[k][a] = r.lab[a].off; });
      const nF = firedNode(P, ft); if (nF !== r.r.fired) { say(`§FILM_STATE_BAD fired page=${r.r.fired} node=${nF} ft=${ft.toFixed(2)}`); bad++; }
      ACT[P.n].forEach(a => { const exp = !Core.onlineAfter(P.trace, nF, a), L = r.lab[a]; checked++;
        if (!L || L.off !== exp || (exp ? L.text !== 'OFFLINE' : L.text !== 'ONLINE') || !L.visible) { bad++; say(`§FILM_STATE_BAD actor=${a} dom_off=${L && L.off} text=${L && L.text} expected_offline=${exp ? 1 : 0} ft=${ft.toFixed(2)} fired=${nF}`); }
        const kk = P.n + a; if (lastOff[kk] !== L.off) { flips++; say(`§FILM_STATE actor=${a} offline=${L.off ? 1 : 0} ft=${ft.toFixed(2)} trace_t=${r.r.clk !== null ? Math.round(r.r.clk) : 'na'} expected_offline=${exp ? 1 : 0} ${L.off === exp ? 'OK' : 'WRONG'}`);
          if (!L.off) runStart[kk] = k; else if (runStart[kk] !== undefined) { runs.push({ a, part: P.n, frames: k - runStart[kk], from: runStart[kk] / FPS }); delete runStart[kk]; } lastOff[kk] = L.off; } });
    }
    if (k % 600 === 0) console.log(`  frame ${k}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  [...ovSeen].forEach(x => say('§FILM_LAYOUT_DISTINCT ' + x.slice(0, 300)));
  say(`§FILM_LAYOUT_DONE changed_frames_checked=${layoutChecked} trace_frames_with_clipped_or_truncated_text=${ovFrames} card_frames_with_clipped_or_outside_text=${cardLayoutBad} ${ovFrames || cardLayoutBad ? 'FAIL' : 'PASS'}`);
  say(`§FILM_STATE_DONE frames_checked=${checked} flips=${flips} mismatches=${bad} ${bad ? 'FAIL' : checked ? 'PASS' : 'INCONCLUSIVE'}`);
  { let tot = 0, outside = 0; for (const P of parts) P.trace.forEach((e, i) => { if (!(Core.PIPEK.indexOf(e.kind) !== -1 || e.kind === 'accept' || e.kind === 'duplicate') || e.actor === 'PIPE') return; tot++;
      const kf = Math.ceil((P.plan.ft[i] + P.offset) * FPS - 1e-9), st = offByFrame[kf]; if (!st || st[e.actor] !== false) { outside++; say(`§FILM_PIPE_OUTSIDE part=${P.n} actor=${e.actor} kind=${e.kind} frame=${kf} dom_off=${st && st[e.actor]}`); } });
    const cmp = (domOff, exp) => domOff === exp; const ctrl = !cmp(true, false) && !cmp(false, true) && cmp(true, true);
    say(`§FILM_PIPE_IN_WINDOW shelf_events=${tot} shown_while_offline=${outside} control_detects_mismatch=${ctrl ? 1 : 0} ${outside === 0 && tot > 0 && ctrl ? 'PASS' : 'FAIL'}`); }
  let rb = 0; runs.forEach(w => { const sec = w.frames / FPS, ok = Math.abs(sec - Core.FLASH) <= 1 / FPS + 1e-9; if (!ok) rb++; say(`§FILM_FLASH part=${w.part} actor=${w.a} from=${w.from.toFixed(2)} length=${sec.toFixed(3)}s ${ok ? 'OK' : 'WRONG'}`); });
  const nWin = D.parts.reduce((n, p) => n + p.trace.filter(e => e.kind === 'online').length, 0);
  say(`§FILM_FLASH_DONE runs=${runs.length} trace_windows=${nWin} fixed=${Core.FLASH}s wrong=${rb} ${runs.length === nWin && !rb ? 'PASS' : 'FAIL'}`);
  const sample = async (what, P, ft, extra) => { const r = await page.evaluate(f => { const r = window.Stage.at(f); return { r, lab: window.Stage.labels(), peek: window.Stage.peek(f), dead: [...document.querySelectorAll('.card.dead')].map(x => x.id), hub: (document.getElementById('st_HUB') || {}).textContent || '', tag: [...document.querySelectorAll('.tag[id^="tg_"]')].map(x => x.id.slice(3) + ':' + x.style.display) }; }, ft);
    const nF = firedNode(P, ft); const out = ACT[P.n].map(a => `${a}=${r.lab[a].off ? 'OFF' : 'ON'}/${!Core.onlineAfter(P.trace, nF, a) ? 'OFF' : 'ON'}`); const ex = extra ? extra(r) : { txt: '', ok: true }; const ok = ACT[P.n].every(a => r.lab[a].off === !Core.onlineAfter(P.trace, nF, a)) && ex.ok;
    say(`§FILM_SAMPLE ${what} part=${P.n} ft=${ft.toFixed(2)} trace_t=${Math.round(r.r.clk)} dom/trace ${out.join(' ')} ${ex.txt} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok); return r; };
  for (const P of parts) for (const w of P.plan.win) await sample(`window actor=${w.actor}`, P, w.ftOn + P.offset + 1.0);
  const PP = parts[1], tp = PP.trace, pf = i => PP.plan.ft[i] + PP.offset;
  const iLD = tp.findIndex(e => e.kind === 'link-down'), iVF = tp.findIndex(e => e.kind === 'visit-failed'), iLU = tp.findIndex(e => e.kind === 'link-up');
  await sample('outage 17:59-18:30 (link down, A offline)', PP, (pf(iVF) + pf(iLU)) / 2, r => { const t = r.tag.filter(x => /^A:/.test(x)).join(''); return { txt: `link-tag=${t} expected=A:inline-block`, ok: t === 'A:inline-block' }; });
  { const q = (await page.evaluate(f => window.Stage.peek(f), pf(iVF) - 0.001)).queue.A; say(`§FILM_SAMPLE outage_queue ft=${pf(iVF).toFixed(2)} page_queue_A_before_failed_visit=${q} trace_queued=${tp[iVF].queued} ${q === tp[iVF].queued ? 'OK' : 'WRONG'}`); samples.push(q === tp[iVF].queued); }
  const iFA = tp.findIndex(e => e.kind === 'fail' && e.actor === 'A'), iFH = tp.findIndex(e => e.kind === 'fail' && e.actor === 'HUB'), iFP = tp.findIndex(e => e.kind === 'fail' && e.actor === 'PIPE');
  for (const [nm, i, want] of [['failure A (device lost)', iFA, 'c_A'], ['failure HUB (admin lost)', iFH, 'c_HUB'], ['failure PIPE (shelf lost)', iFP, 'c_SHELF']]) await sample(nm, PP, pf(i) + 0.6, r => ({ txt: `dead_cards=[${r.dead.join(',')}] expected_includes=${want}`, ok: r.dead.indexOf(want) !== -1 }));
  const iCO = tp.findIndex(e => e.kind === 'COLLISION'), iOV = tp.findIndex(e => e.kind === 'overspend');
  await sample('COLLISION flag', PP, pf(iCO) + 0.6, r => ({ txt: `hub_card='${r.hub.replace(/\s+/g, ' ').slice(0, 70)}' expects collision 1`, ok: /collision 1/.test(r.hub) })); await sample('FLAG overspend', PP, pf(iOV) + 0.6, r => ({ txt: `hub_card='${r.hub.replace(/\s+/g, ' ').slice(0, 70)}' expects overspend 1`, ok: /overspend 1/.test(r.hub) }));
  const pk = async ft => page.evaluate(f => window.Stage.peek(f), ft);
  { const a = (await pk(pf(iFA) - 0.001)).queue.A, ok = a === tp[iFA].unsent; say(`§FILM_SAMPLE unsent_before_loss page_queue_A=${a} trace_unsent=${tp[iFA].unsent} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok); }
  { const rbs = tp.map((e, i) => e.kind === 'rebuild' ? i : -1).filter(i => i >= 0); const b0 = await pk(pf(iFH) - 0.001), a0 = await pk(pf(rbs[0]) + 0.001), a1 = await pk(pf(rbs[1]) + 0.001);
    const ok = b0.recs === tp[rbs[0]].records && a0.recs === tp[rbs[0]].records && a1.recs === tp[rbs[1]].records && b0.shelf === a0.shelf && a1.mirror === b0.shelf;
    say(`§FILM_SAMPLE rebuild records_before=${b0.recs} rebuilt=${a0.recs}/${a1.recs} trace_records=${tp[rbs[0]].records} shelf_before=${b0.shelf} shelf_after=${a0.shelf} mirror_after_shelf_loss=${a1.mirror} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok); }
  { const F = X.F, bN = PP.plan.beat.find(b => b.id === 'numbers'), r = await page.evaluate(f => { window.Stage.at(f); return window.Stage.counters(); }, bN.start + 0.5 * (bN.end - bN.start) + PP.offset);
    const ok = r.local === F.d1Local && r.pipe === F.d1Pipe && r.hub === F.d1HubVisits && r.dev === F.d1DevVisits;
    say(`§FILM_COUNTERS pos day1 on screen local=${r.local} pipe=${r.pipe} admin_visits=${r.hub} device_visits=${r.dev} treat_log=${F.d1Local}/${F.d1Pipe}/${F.d1HubVisits}/${F.d1DevVisits} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok);
    const MP = parts[2], bM = MP.plan.beat.find(b => b.id === 'mfconfirm'), r2 = await page.evaluate(f => { window.Stage.at(f); return window.Stage.counters(); }, bM.end + MP.offset - 0.05);
    const ok2 = r2.local === F.mfLocal && r2.pipe === F.mfPipe && r2.hub === F.mfHubVisits && r2.dev === F.mfDevVisits;
    say(`§FILM_COUNTERS mf on screen local=${r2.local} pipe=${r2.pipe} admin_visits=${r2.hub} device_visits=${r2.dev} treat_log=${F.mfLocal}/${F.mfPipe}/${F.mfHubVisits}/${F.mfDevVisits} ${ok2 ? 'OK' : 'WRONG'}`); samples.push(ok2); }
  say(`§FILM_SAMPLES_DONE n=${samples.length} wrong=${samples.filter(x => !x).length} ${samples.every(x => x) ? 'PASS' : 'FAIL'}`);
  // ---------- CITATION / LOGO / WORDS witnesses: read back from the DOM at the end of every card beat (all reveals visible) ----------
  const claims = {}; Cards.CLAIM && Object.assign(claims, Cards.CLAIM);
  const audits = []; for (const P of parts) for (const b of P.plan.beat) if (b.card) { const ft = b.end + P.offset - 0.05; const a = await page.evaluate(f => { window.Stage.at(f); return window.Stage.imagesReady().then(() => ({ audit: window.Stage.cardAudit(), ov: window.Stage.overflowCard() })); }, ft); audits.push({ id: b.id, ...a }); }
  let nq = 0, qbad = 0, nc = 0, cbad = 0, hidden = 0; const shownClaims = new Set();
  audits.forEach(A => { A.audit.quotes.forEach(q => { nq++; shownClaims.add(q.id); const j = claims[q.id]; const ok = j && q.text === j.quote; if (!ok) { qbad++; say(`§CITE_QUOTE_BAD card=${A.id} claim=${q.id} shown="${q.text}" json="${j && j.quote}"`); } });
    A.audit.cites.forEach(c => { nc++; const j = claims[c.id], ds = Cards.shortDate(j.date_of_source); const ok = c.pub === j.publisher && c.ttl === j.title && c.dt === ds && (j.date_of_source === null ? c.dt === 'undated page' : j.date_of_source.indexOf(c.dt) !== -1 || (/^'/.test(j.date_of_source) && j.date_of_source.indexOf(c.dt) !== -1)); if (!ok) { cbad++; say(`§CITE_BAR_BAD card=${A.id} claim=${c.id} shown=${JSON.stringify(c)} json=${JSON.stringify([j.publisher, j.title, j.date_of_source])}`); } });
    A.audit.vis.forEach(v => { if (v !== 'visible') hidden++; }); });
  say(`§CITE_QUOTES shown=${nq} distinct_claims=${shownClaims.size} not_byte_equal_to_json=${qbad} ${qbad || !nq ? 'FAIL' : 'PASS'}`);
  say(`§CITE_BARS shown=${nc} publisher_title_date_mismatch=${cbad} ${cbad || !nc ? 'FAIL' : 'PASS'} (date shown must be contained in the JSON date string; null date shows "undated page")`);
  say(`§CITE_REVEAL elements_still_hidden_at_end_of_card=${hidden} ${hidden ? 'FAIL' : 'PASS'}`);
  { let nover = 0; audits.forEach(A => { if (A.ov.length) { nover++; say(`§FILM_LAYOUT_BAD end_of_card=${A.id} ${A.ov.join(' | ').slice(0, 300)}`); } }); say(`§FILM_CARD_LAYOUT cards=${audits.length} with_clipped_or_outside_text=${nover} ${nover ? 'FAIL' : 'PASS'}`); }
  { const cited = new Set(); shownClaims.forEach(id => cited.add(claims[id].source_url)); const listed = new Set(); audits.forEach(A => A.audit.urls.forEach(u => listed.add(u)));
    const missing = [...cited].filter(u => !listed.has(u)), extra = [...listed].filter(u => !cited.has(u)); say(`§CITE_SOURCES cited_urls=${cited.size} listed_on_sources_cards=${listed.size} missing=${missing.length} extra=${extra.length} ${missing.length || extra.length ? 'FAIL' : 'PASS'} ${missing.concat(extra).join(' ')}`); }
  { // logos: (1) every <img> loaded with natural size > 0 and undistorted; (2) its data-sha equals the index; (3) every image REQUESTED by the page: file hash on disk == index hash
    const LI = JSON.parse(fs.readFileSync(path.join(__dirname, 'film2_logos_index.json'), 'utf8')).entries, bySlug = {}, byPath = {}; LI.forEach(e => { bySlug[e.slug] = e; if (e.local_path) byPath[e.local_path] = e; if (e.use_instead) byPath[e.use_instead.local_path] = Object.assign({}, e, { sha256: e.use_instead.sha256 }); });
    let n = 0, badimg = 0, distort = 0, uni = 0; const seen = new Set();
    audits.forEach(A => A.audit.imgs.forEach(i => { n++; seen.add(i.slug); const e = bySlug[i.slug], want = e.use_instead ? e.use_instead.sha256 : e.sha256; if (!i.ok || i.sha !== want) { badimg++; say(`§LOGO_BAD card=${A.id} slug=${i.slug} loaded=${i.ok} sha_attr=${i.sha} index=${want}`); }
      const ra = i.rw / i.rh, na = i.w / i.h; if (i.fit === 'contain') uni++; if (i.rw && i.rh && i.fit !== 'contain' && Math.abs(ra - na) / na > 0.02) { distort++; say(`§LOGO_ASPECT_BAD slug=${i.slug} rendered=${i.rw}x${i.rh} natural=${i.w}x${i.h}`); } }));
    let reqBad = 0, reqN = 0; IMGREQ.forEach(p => { reqN++; const e = byPath[p]; if (!e) { reqBad++; say(`§LOGO_REQ_UNKNOWN ${p}`); return; } const h = sha(p); if (h !== e.sha256) { reqBad++; say(`§LOGO_REQ_HASH_BAD ${e.slug} disk=${h} index=${e.sha256}`); } });
    say(`§LOGO_DOM imgs_shown=${n} distinct=${seen.size} not_loaded_or_wrong_sha_attr=${badimg} aspect_distorted=${distort} scaled_uniformly_by_object_fit_contain=${uni} (never cropped or stretched) ${badimg || distort || !n ? 'FAIL' : 'PASS'}`);
    say(`§LOGO_REQUESTS image_requests=${reqN} disk_sha256_differs_from_index=${reqBad} ${reqBad || !reqN ? 'FAIL' : 'PASS'} (PowerSync: the clean alternate file; its sha256 was computed from the downloaded bytes)`);
    const plain = ['nostr', 'triplit', 'scuttlebutt']; const w = audits.find(A => A.id === 'wall'); const wt = w ? w.audit.text : ''; const okp = ['Nostr', 'Triplit', 'Secure Scuttlebutt'].every(t => wt.indexOf(t) !== -1) && ![...seen].some(s => /nostr|triplit|ssb|scuttlebutt/.test(s));
    say(`§LOGO_PLAINTEXT wall shows the names Nostr, Triplit, Secure Scuttlebutt as text and loads no image for them ${okp ? 'PASS' : 'FAIL'}`);
    const manyOk = audits.some(A => /© 2019 The Manyverse Authors, CC BY-SA 4.0/.test(A.audit.text)) && audits.some(A => /Logos and names are trademarks of their owners, shown to identify the projects discussed\./.test(A.audit.text));
    say(`§LOGO_CREDITS trademark line and Manyverse credit on screen ${manyOk ? 'PASS' : 'FAIL'}; Matrix logo loaded: ${seen.has('matrix') ? 'YES FAIL' : 'no PASS'}`); }
  { const texts = audits.map(A => A.audit.text).concat(D.parts.flatMap(p => p.notes.map(n => n.html.replace(/<[^>]+>/g, '')))).concat(D.parts.flatMap(p => p.plan.beat.map(b => (p.beats.find(x => x.id === b.id) || {}).title || ''))).concat([JSON.stringify(D.cards)]);
    const RE = [[/hiatus/i, 'hiatus'], [/fork/i, 'fork'], [/triplit[^.]{0,60}retired|retired[^.]{0,60}triplit/i, 'retired beside Triplit'], [/\bretired\b/i, 'retired'], [/unsolved/i, 'unsolved'], [/entirely/i, 'entirely'], [/unicenta/i, 'Unicenta'], [/flexible sync/i, 'Flexible Sync']];
    let hits = 0; RE.forEach(([re, nm]) => { const h = texts.filter(t => re.test(t)).length; if (h) { hits += h; say(`§WORDS_HIT ${nm} in ${h} text(s)`); } });
    say(`§WORDS_CHECK scanned=${texts.length} texts (all card text at end of card, all on-screen notes, strip titles, card HTML) forbidden_hits=${hits} ${hits ? 'FAIL' : 'PASS'}`); }
  D.parts.forEach(p => p.notes.forEach(n => say(`§FILM_NOTE part=${p.n} beat=${n.beat} card=${n.card} src="${n.src}" text="${n.html.replace(/<[^>]+>/g, '')}"`)));
  fs.writeFileSync(path.join(OUT, 'film.page.log'), PL.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'cards_audit.json'), JSON.stringify(audits, null, 1));
  const lines = []; let i = 0; while (i < frames.length) { let j = i; while (j + 1 < frames.length && frames[j + 1] === frames[i]) j++; lines.push(`file '${frames[i]}'`, `duration ${((j - i + 1) / FPS).toFixed(6)}`); i = j + 1; }
  lines.push(`file '${frames[frames.length - 1]}'`); fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'film_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', `fps=${FPS},scale=1920:930:flags=lanczos,pad=1920:1080:0:0:color=black,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-frames:v', String(N), mp4]);
  say(`§FILM_DONE frames=${N} distinct_images=${new Set(frames).size} dur=${(N / FPS).toFixed(2)}s out=${mp4}`);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({ total: D.total, frames: N, beats: cueLog }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§FILM_ERROR ' + (e.stack || e) + '\n'); process.exit(1); });
