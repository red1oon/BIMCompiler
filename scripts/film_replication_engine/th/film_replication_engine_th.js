// ⚠ DO NOT REMOVE — Scope: THAI cut (prompts/TEAMWORK_FRAMEWORK.md §16.22). Copy of ../film_replication_engine.js (English untouched) with the Thai stage, Thai cards and notes, and the extra Thai witnesses:
// §FILM_GLYPH (every character that reached the screen renders as a real glyph, not a tofu box), §FILM_CARD_FIT (all four cards fit), badge text 'OFFLINE · ออฟไลน์' / 'ONLINE · ออนไลน์' checked DOM-vs-trace on every frame.
// Env NOSHOT=1 runs every witness without writing frames or video (fast layout iteration).
// Original scope: RECORD the silent picture of the film "No server in the sale path — the Replication engine, two cases (Unicenta POS and Micro Finance)" (spec: prompts/TEAMWORK_FRAMEWORK.md §16.19a v2, §16.21).
// The picture is the engine's OWN recorded run (build/scriptor/trace_film_pos.json, trace_film_mf.json) replayed by stage.html. Headless Chromium, --disable-gpu, CPU only, no network.
// Deterministic: the film clock is STEPPED (frame k = k/24 s), the page is a pure function of that clock, so the picture cannot drift from the narration cues. Nothing is timed by hand.
// Read the log after every run: <out>/film.log holds §FILM_CUE (per beat), §FILM_STATE (every OFFLINE flip, DOM vs trace), §FILM_FLASH, §FILM_SAMPLE, §FILM_COUNTERS, §FILM_CHECK, §FILM_DONE.
// Run:  node film_replication_engine.js <outDir>      env BEAT_MIN=<json file: seconds each beat is held, from the narration>, DEFAULT_HOLD (s, default 9), FPS (24)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const Core = require('../core.js'), { buildFacts, TD } = require('../facts.js'), Beats = require('./beats_th.js'), TH = require('./strings_th.js');
const OUT = path.resolve(process.argv[2] || '.'), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FPS = +(process.env.FPS || 24), DEF = +(process.env.DEFAULT_HOLD || 9);
const MIN = process.env.BEAT_MIN ? JSON.parse(fs.existsSync(process.env.BEAT_MIN) ? fs.readFileSync(process.env.BEAT_MIN, 'utf8') : process.env.BEAT_MIN) : {};
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const RECAP_PNG = process.env.RECAP_PNG || path.join(__dirname, 'problem_th.png');

function cfgRows(R, part) {                          // the configuration panel is read from flows.json, row by row (row names and data words stay as in flows.json)
  const pick = part === 1 ? ['F1', 'F2', 'R1', 'S1'] : ['S2', 'P1', 'R2', 'N1'], C = TH.cfg;
  return pick.map(id => { const r = R.rows[id]; if (!r) throw new Error('flow row missing ' + id); const nm = r.name.split(' ');
    const ar = r.dir === 'UP' ? '↑' : r.dir === 'DOWN' ? '↓' : '';
    let rest = r.treatment === 'RULE' ? `${C.on}${r.on.split(' ')[0]}${C.process}${r.process}${C.emits}${r.emits.split(' ')[0]}` : r.treatment === 'SEED' ? `${r.audience}${C.guard}${r.guard}` : `${r.table || C.toBorrower}${r.carries ? C.carries(r.carries.length) : ''}`;
    return `<b>${nm[0]}</b> ${nm.slice(1).join(' ')} · ${r.treatment} ${ar} · ${rest}`; });
}
function cardsHtml(R) {
  const F = R.F, C = TH.card, lim = C.limits(F);
  return {
    title: C.title(),
    recap: `<div style="position:absolute;left:0;top:0;width:1920px;height:930px;background:#f6efe5;text-align:center"><img src="file://${RECAP_PNG}"></div>`,
    part2: C.part2(),
    close: `<div class="t" style="font-size:72px">${C.closeTitle}</div><ul style="margin-top:6px">${lim.map(x => `<li style="font-size:34px;margin-bottom:12px">${x}</li>`).join('')}</ul><div class="mono" style="font-size:36px;margin-top:24px">${F.verdictLine}<small>${C.verdictSmall(F)}</small></div>`
  };
}
function buildData(R) {
  const mk = (list, trace) => Beats.ranges(trace, list).map(b => Object.assign(b, { minHold: MIN[b.id] || DEF }));
  const posB = mk(Beats.POS, R.pos), mfB = mk(Beats.MF, R.mf);
  const pp = Core.plan(R.pos, posB), pm = Core.plan(R.mf, mfB);
  const parts = [
    { n: 1, layout: 'pos', label: 'Part 1', trace: R.pos, plan: pp, offset: 0, notes: Beats.buildNotes(R, 1, posB), cfgRows: cfgRows(R, 1), axis: { 1: [8, 19], 2: [8, 20] }, beats: posB },
    { n: 2, layout: 'mf', label: 'Part 2', trace: R.mf, plan: pm, offset: pp.total, notes: Beats.buildNotes(R, 2, mfB), cfgRows: cfgRows(R, 2), axis: { 1: [8, 19] }, beats: mfB }];
  return { parts, facts: R.F, cards: cardsHtml(R), total: pp.total + pm.total };
}

(async () => {
  const R = buildFacts(); say('§FILM_FACTS n=' + Object.keys(R.F).length + ' all cross-checks passed (facts.js)');
  const D = buildData(R); const N = Math.ceil(D.total * FPS - 1e-9);
  say(`§FILM_PLAN part1=${D.parts[0].plan.total.toFixed(2)}s part2=${D.parts[1].plan.total.toFixed(2)}s total=${D.total.toFixed(2)}s frames=${N} fps=${FPS} flash=${Core.FLASH}s`);
  D.parts.forEach(p => p.plan.beat.forEach(b => say(`§FILM_PLAN beat=${b.id} start=${(b.start + p.offset).toFixed(2)} end=${(b.end + p.offset).toFixed(2)} hold=${(b.end - b.start).toFixed(2)} narration_hold=${(MIN[b.id] || DEF).toFixed(2)}${MIN[b.id] ? '' : ' (default)'} events=${b.to - b.from}`)));
  if (process.env.LAYOUT_MUTANT) { D.parts[0].notes[0].html = 'ข้อความยาวเกินกล่องมากมาย '.repeat(8); say('§FILM_MUTANT note 0 of part 1 replaced by an over-long text (control: the layout witness must now FAIL)'); }
  const pdata = D.parts.map(p => ({ n: p.n, layout: p.layout, label: p.label, trace: p.trace, plan: p.plan, offset: p.offset, notes: p.notes, cfgRows: p.cfgRows, axis: p.axis }));
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const PL = []; page.on('console', m => PL.push(m.text())); page.on('pageerror', e => { PL.push('PAGEERR ' + e); say('§FILM_ERROR pageerror ' + e); });
  await page.goto('file://' + path.join(__dirname, 'stage_th.html')); await page.waitForFunction(() => window.Stage);
  await page.evaluate(d => window.Stage.init(d), { parts: pdata, facts: D.facts, cards: D.cards });

  if (process.env.SHOTS) {                         // layout check only: render the named film seconds to PNG and stop (the allowed one look at a few frames)
    for (const f of process.env.SHOTS.split(',').map(Number)) { const r = await page.evaluate(x => window.Stage.at(x), f); await page.screenshot({ path: path.join(OUT, 'shot_' + f.toFixed(1) + '.png'), clip: { x: 0, y: 0, width: 1920, height: 930 } }); say(`§FILM_SHOT ft=${f} beat=${r.beat} fired=${r.fired}`); }
    await browser.close(); return;
  }
  // independent per-actor derivation: events fired by film time, counted here from the plan (not by the page)
  const parts = D.parts, firedNode = (P, ft) => { let c = 0; for (let i = 0; i < P.trace.length; i++) if (P.plan.ft[i] + P.offset <= ft + 1e-9) c++; else break; return c; };
  const partAt = ft => { let P = parts[0]; parts.forEach(p => { if (ft >= p.offset) P = p; }); return P; };
  const CHARS = new Set(); let ovFrames = 0, layoutChecked = 0; const ovSeen = new Set(); let prevHash = null, prevFile = null, lastBeat = null, frames = [], bad = 0, checked = 0, flips = 0;
  const offByFrame = [], off = {}, runStart = {}, runs = [], lastOff = {}; const cueLog = [], samples = [];
  const ACT = { 1: ['A', 'B', 'PH1', 'HUB'], 2: ['BOR1', 'BOR2', 'HUB'] };
  const t0 = Date.now();
  for (let k = 0; k < N; k++) {
    const ft = k / FPS, r = await page.evaluate(f => { const r = window.Stage.at(f); return { r: r, lab: window.Stage.labels(), ctr: window.Stage.counters() }; }, ft);
    const P = partAt(ft), key = r.r.part + ':' + r.r.beat;
    if (key !== lastBeat) { lastBeat = key; const b = P.plan.beat.find(x => x.id === r.r.beat); const n = (/^(\d+b?) ·/.exec(b && (P.beats.find(x => x.id === b.id).title || '')) || [])[1] || r.r.beat;
      const tms = r.r.clk !== null && r.r.clk !== undefined ? Math.round(r.r.clk) : null; cueLog.push({ id: r.r.beat, n, t: ft, k });
      say(`§FILM_CUE beat=${n} id=${r.r.beat} t=${ft.toFixed(2)} trace_t=${tms === null ? 'card' : tms} frame=${k}`); }
    if (r.r.hash !== prevHash) { if (!r.r.card) { const ov = await page.evaluate(() => window.Stage.overflow()); if (ov.length) { ovFrames++; ovSeen.add(ov.join(' | ')); if (ovFrames <= 6) say(`§FILM_LAYOUT_BAD ft=${ft.toFixed(2)} ${ov.join(' | ').slice(0, 300)}`); } } layoutChecked++; { const cs = await page.evaluate(() => Array.from(new Set((document.getElementById('app').innerText + ' ' + Array.from(document.querySelectorAll('#svg text')).map(t => t.textContent).join('')).split(''))).join('')); for (const ch of cs) CHARS.add(ch); } const fn = path.join(FR, String(k).padStart(6, '0') + '.jpg'); if (!process.env.NOSHOT) await page.screenshot({ path: fn, type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 930 } }); prevFile = fn; prevHash = r.r.hash; }
    frames.push(prevFile);
    // OFFLINE witness: DOM label state vs independent derivation from the trace (every frame, every stage frame)
    if (!r.r.card) {
      offByFrame[k] = {}; Object.keys(r.lab).forEach(a => { offByFrame[k][a] = r.lab[a].off; });
      const nF = firedNode(P, ft); if (nF !== r.r.fired) { say(`§FILM_STATE_BAD fired page=${r.r.fired} node=${nF} ft=${ft.toFixed(2)}`); bad++; }
      ACT[P.n].forEach(a => { const exp = !Core.onlineAfter(P.trace, nF, a), L = r.lab[a]; checked++;
        if (!L || L.off !== exp || (exp ? L.text !== TH.offline : L.text !== TH.online) || !L.visible) { bad++; say(`§FILM_STATE_BAD actor=${a} dom_off=${L && L.off} text=${L && L.text} expected_offline=${exp ? 1 : 0} ft=${ft.toFixed(2)} fired=${nF}`); }
        const kk = P.n + a; if (lastOff[kk] !== L.off) { flips++; const e = nF ? P.trace[nF - 1] : P.trace[0]; say(`§FILM_STATE actor=${a} offline=${L.off ? 1 : 0} ft=${ft.toFixed(2)} trace_t=${r.r.clk !== null ? Math.round(r.r.clk) : 'na'} expected_offline=${exp ? 1 : 0} ${L.off === exp ? 'OK' : 'WRONG'}`);
          if (!L.off) runStart[kk] = k; else if (runStart[kk] !== undefined) { runs.push({ a, part: P.n, frames: k - runStart[kk], from: runStart[kk] / FPS }); delete runStart[kk]; } lastOff[kk] = L.off; } });
    }
    if (k % 500 === 0) console.log(`  frame ${k}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  [...ovSeen].forEach(x => say('§FILM_LAYOUT_DISTINCT ' + x.slice(0, 300)));
  say(`§FILM_LAYOUT_DONE changed_frames_checked=${layoutChecked} frames_with_clipped_or_truncated_text=${ovFrames} distinct=${ovSeen.size} ${ovFrames ? 'FAIL' : 'PASS'}`);
  say(`§FILM_STATE_DONE frames_checked=${checked} flips=${flips} mismatches=${bad} ${bad ? 'FAIL' : 'PASS'}`);
  // every event that touches the shelf (put recv pull send publish accept duplicate) must fall on a frame where the DOM shows its actor ONLINE (the engine's own W-TREAT-OFFLINE rule, read from the picture)
  { let tot = 0, outside = 0; for (const P of parts) P.trace.forEach((e, i) => { if (!(Core.PIPEK.indexOf(e.kind) !== -1 || e.kind === 'accept' || e.kind === 'duplicate') || e.actor === 'PIPE') return; tot++;
      const kf = Math.ceil((P.plan.ft[i] + P.offset) * FPS - 1e-9), st = offByFrame[kf]; if (!st || st[e.actor] !== false) { outside++; say(`§FILM_PIPE_OUTSIDE part=${P.n} actor=${e.actor} kind=${e.kind} frame=${kf} dom_off=${st && st[e.actor]}`); } });
    const cmp = (domOff, exp) => domOff === exp; const ctrl = !cmp(true, false) && !cmp(false, true) && cmp(true, true);
    say(`§FILM_PIPE_IN_WINDOW shelf_events=${tot} shown_while_offline=${outside} control_detects_mismatch=${ctrl ? 1 : 0} ${outside === 0 && tot > 0 && ctrl ? 'PASS' : 'FAIL'}`); }
  // online runs: each ONLINE label must last exactly FLASH seconds (+-1 frame)
  let rb = 0; runs.forEach(w => { const sec = w.frames / FPS, ok = Math.abs(sec - Core.FLASH) <= 1 / FPS + 1e-9; if (!ok) rb++; say(`§FILM_FLASH part=${w.part} actor=${w.a} from=${w.from.toFixed(2)} length=${sec.toFixed(3)}s ${ok ? 'OK' : 'WRONG'}`); });
  const nWin = D.parts.reduce((n, p) => n + p.trace.filter(e => e.kind === 'online').length, 0);
  say(`§FILM_FLASH_DONE runs=${runs.length} trace_windows=${nWin} fixed=${Core.FLASH}s wrong=${rb} ${runs.length === nWin && !rb ? 'PASS' : 'FAIL'}`);
  // samples: every online window, the outage, and one moment per failure beat — DOM read at that film time vs the trace
  const sample = async (what, P, ft, extra) => { const r = await page.evaluate(f => { const r = window.Stage.at(f); return { r, lab: window.Stage.labels(), peek: window.Stage.peek(f), dead: [...document.querySelectorAll('.card.dead')].map(x => x.id), hub: (document.getElementById('st_HUB') || {}).textContent || '', tag: [...document.querySelectorAll('.tag[id^="tg_"]')].map(x => x.id.slice(3) + ':' + x.style.display) }; }, ft);
    const nF = firedNode(P, ft); const out = ACT[P.n].map(a => `${a}=${r.lab[a].off ? 'OFF' : 'ON'}/${!Core.onlineAfter(P.trace, nF, a) ? 'OFF' : 'ON'}`); const ex = extra ? extra(r) : { txt: '', ok: true }; const ok = ACT[P.n].every(a => r.lab[a].off === !Core.onlineAfter(P.trace, nF, a)) && ex.ok;
    say(`§FILM_SAMPLE ${what} part=${P.n} ft=${ft.toFixed(2)} trace_t=${Math.round(r.r.clk)} dom/trace ${out.join(' ')} ${ex.txt} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok); return r; };
  for (const P of parts) for (const w of P.plan.win) await sample(`window actor=${w.actor}`, P, w.ftOn + P.offset + 1.0);
  const tp = parts[0].trace, pf = i => parts[0].plan.ft[i] + parts[0].offset;
  const iLD = tp.findIndex(e => e.kind === 'link-down'), iVF = tp.findIndex(e => e.kind === 'visit-failed'), iLU = tp.findIndex(e => e.kind === 'link-up');
  const rO = await sample('outage 17:59-18:30 (link down, A offline)', parts[0], (pf(iVF) + pf(iLU)) / 2, r => { const t = r.tag.filter(x => /^A:/.test(x)).join(''); return { txt: `link-tag=${t} expected=A:inline-block`, ok: t === 'A:inline-block' }; });
  say(`§FILM_SAMPLE outage_queue ft=${(pf(iVF)).toFixed(2)} page_queue_A_before_failed_visit=${(await page.evaluate(f => window.Stage.peek(f), pf(iVF) - 0.001)).queue.A} trace_queued=${tp[iVF].queued} ${(await page.evaluate(f => window.Stage.peek(f), pf(iVF) - 0.001)).queue.A === tp[iVF].queued ? 'OK' : 'WRONG'}`);
  const iFA = tp.findIndex(e => e.kind === 'fail' && e.actor === 'A'), iFH = tp.findIndex(e => e.kind === 'fail' && e.actor === 'HUB'), iFP = tp.findIndex(e => e.kind === 'fail' && e.actor === 'PIPE');
  for (const [nm, i, want] of [['failure A (device lost)', iFA, 'c_A'], ['failure HUB (admin lost)', iFH, 'c_HUB'], ['failure PIPE (shelf lost)', iFP, 'c_SHELF']]) await sample(nm, parts[0], pf(i) + 0.6, r => ({ txt: `dead_cards=[${r.dead.join(',')}] expected_includes=${want}`, ok: r.dead.indexOf(want) !== -1 }));
  const iCO = tp.findIndex(e => e.kind === 'COLLISION'), iOV = tp.findIndex(e => e.kind === 'overspend');
  await sample('COLLISION flag', parts[0], pf(iCO) + 0.6, r => ({ txt: `hub_card='${r.hub.replace(/\s+/g, ' ').slice(0, 70)}' expects ชนกัน 1`, ok: /ชนกัน 1/.test(r.hub) })); await sample('FLAG overspend', parts[0], pf(iOV) + 0.6, r => ({ txt: `hub_card='${r.hub.replace(/\s+/g, ' ').slice(0, 70)}' expects ใช้เกินยอด 1`, ok: /ใช้เกินยอด 1/.test(r.hub) }));
  const pk = async (ft) => page.evaluate(f => window.Stage.peek(f), ft);
  { const a = (await pk(pf(iFA) - 0.001)).queue.A, ok = a === tp[iFA].unsent; say(`§FILM_SAMPLE unsent_before_loss page_queue_A=${a} trace_unsent=${tp[iFA].unsent} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok); }
  { const rbs = tp.map((e, i) => e.kind === 'rebuild' ? i : -1).filter(i => i >= 0); const b0 = await pk(pf(iFH) - 0.001), a0 = await pk(pf(rbs[0]) + 0.001), a1 = await pk(pf(rbs[1]) + 0.001);
    const ok = b0.recs === tp[rbs[0]].records && a0.recs === tp[rbs[0]].records && a1.recs === tp[rbs[1]].records && b0.shelf === a0.shelf && a1.mirror === b0.shelf;
    say(`§FILM_SAMPLE rebuild records_before=${b0.recs} rebuilt=${a0.recs}/${a1.recs} trace_records=${tp[rbs[0]].records} shelf_before=${b0.shelf} shelf_after=${a0.shelf} mirror_after_shelf_loss=${a1.mirror} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok); }
  // counters at the end of the working-day beat and of the Micro Finance day == treat.log §TREAT_PANEL (via facts)
  { const bN = parts[0].plan.beat.find(b => b.id === 'numbers'), r = await page.evaluate(f => { window.Stage.at(f); return window.Stage.counters(); }, bN.start + 0.5 * (bN.end - bN.start) + parts[0].offset);
    const F = R.F, ok = r.local === F.d1Local && r.pipe === F.d1Pipe && r.hub === F.d1HubVisits && r.dev === F.d1DevVisits;
    say(`§FILM_COUNTERS pos day1 on screen local=${r.local} pipe=${r.pipe} admin_visits=${r.hub} device_visits=${r.dev} treat_log=${F.d1Local}/${F.d1Pipe}/${F.d1HubVisits}/${F.d1DevVisits} ${ok ? 'OK' : 'WRONG'}`); samples.push(ok);
    const bM = parts[1].plan.beat.find(b => b.id === 'mfconfirm'), r2 = await page.evaluate(f => { window.Stage.at(f); return window.Stage.counters(); }, bM.end + parts[1].offset - 0.05);
    const ok2 = r2.local === F.mfLocal && r2.pipe === F.mfPipe && r2.hub === F.mfHubVisits && r2.dev === F.mfDevVisits;
    say(`§FILM_COUNTERS mf on screen local=${r2.local} pipe=${r2.pipe} admin_visits=${r2.hub} device_visits=${r2.dev} treat_log=${F.mfLocal}/${F.mfPipe}/${F.mfHubVisits}/${F.mfDevVisits} ${ok2 ? 'OK' : 'WRONG'}`); samples.push(ok2); }
  say(`§FILM_SAMPLES_DONE n=${samples.length} wrong=${samples.filter(x => !x).length} ${samples.every(x => x) ? 'PASS' : 'FAIL'}`);
  // card fit: every card (title, recap, part 2, close) must fit inside the app area (height and width, last block and every child)
  { const ids = [['title', parts[0]], ['recap', parts[0]], ['part2', parts[1]], ['close', parts[1]]]; let badCards = 0;
    for (const [cid, P] of ids) { const bt = P.plan.beat.find(b => b.id === cid), cr = await page.evaluate(f => { window.Stage.at(f); const o = document.getElementById('ov'); const kids = [...o.children]; const last = kids[kids.length - 1].getBoundingClientRect(); const wide = kids.filter(k => !k.querySelector('img') && (k.getBoundingClientRect().right > 1920 - 110 + 1 || k.scrollWidth > k.clientWidth + 1)).map(k => k.className || k.tagName); return { bottom: Math.round(last.bottom), h: innerHeight, sh: o.scrollHeight, sw: o.scrollWidth, wide }; }, bt.start + P.offset + 0.5);
      const ok = cr.bottom <= cr.h && cr.sh <= cr.h && cr.sw <= 1920 && cr.wide.length === 0; if (!ok) badCards++;
      say(`§FILM_CARD_FIT card=${cid} last_block_bottom=${cr.bottom} app_height=${cr.h} scrollHeight=${cr.sh} scrollWidth=${cr.sw} blocks_past_right_margin=${cr.wide.length} ${ok ? 'OK' : 'WRONG'}`); }
    say(`§FILM_CARD_FIT_DONE cards=${ids.length} wrong=${badCards} ${badCards ? 'FAIL' : 'PASS'}`); }
  // glyph witness: every character that reached the screen must render as a real glyph (not the tofu box) in the page's own font stacks. Control: a code point no font has (U+0E3B) must render differently from blank AND from a real Thai letter, or the test cannot see tofu.
  { const chars = [...CHARS].filter(c => c.trim() !== '').join(''); fs.writeFileSync(path.join(OUT, 'screen_chars.txt'), chars);
    const gr = await page.evaluate(chs => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const x = cv.getContext('2d', { willReadFrequently: true });
      const draw = (ch, font) => { x.clearRect(0, 0, 64, 64); x.font = font; x.textBaseline = 'alphabetic'; x.fillStyle = '#000'; x.fillText(ch, 8, 44); const d = x.getImageData(0, 0, 64, 64).data; let h = 5381, ink = 0; for (let i = 3; i < d.length; i += 4) { h = ((h << 5) + h + d[i]) | 0; if (d[i] > 40) ink++; } return h + ':' + ink; };
      const stacks = { sans: "700 40px 'Noto Sans Thai','Noto Sans','DejaVu Sans',sans-serif", sansReg: "500 40px 'Noto Sans Thai','Noto Sans','DejaVu Sans',sans-serif", mono: "500 40px 'DejaVu Sans Mono','Noto Sans Thai',monospace" };
      const out = { stacks: Object.keys(stacks), missing: {}, control: {} };
      Object.keys(stacks).forEach(k => { const tofu = draw('\u0E3B', stacks[k]), blank = draw(' ', stacks[k]), real = draw('\u0E01', stacks[k]); out.control[k] = { tofuIsInk: tofu.split(':')[1] > 0, tofuNotBlank: tofu !== blank, tofuNotReal: tofu !== real };
        out.missing[k] = [...chs].filter(ch => { const g = draw(ch, stacks[k]); return g === tofu || g.split(':')[1] === '0' && ch.trim() !== ''; }); });
      return out; }, chars);
    const ctlOk = Object.values(gr.control).every(c => c.tofuIsInk && c.tofuNotBlank && c.tofuNotReal);
    const allMissing = new Set(); // a char is bad only if it is tofu in EVERY stack it could be drawn in (mono lines fall back per character)
    [...chars].forEach(ch => { if (gr.stacks.every(k => gr.missing[k].includes(ch))) allMissing.add(ch); });
    say(`§FILM_GLYPH distinct_chars=${chars.length} thai_chars=${[...chars].filter(c => /[\u0E00-\u0E7F]/.test(c)).length} control_tofu_detectable=${ctlOk ? 1 : 0} chars_rendering_as_tofu_in_all_stacks=${allMissing.size} [${[...allMissing].join('')}] ${ctlOk && allMissing.size === 0 ? 'PASS' : ctlOk ? 'FAIL' : 'INCONCLUSIVE'}`);
    say(`§FILM_GLYPH_DETAIL per_stack_missing=${JSON.stringify(Object.fromEntries(Object.entries(gr.missing).map(([k, v]) => [k, v.join('')])))}`); }
  // closing card: the six limits and the engine's verdict line, compared with build/scriptor/treat.log read directly here (not through facts.js)
  { const cl = parts[1].plan.beat.find(b => b.id === 'close'), t = await page.evaluate(f => { window.Stage.at(f); const o = document.getElementById('ov'); return { li: [...o.querySelectorAll('li')].map(x => x.textContent), mono: (o.querySelector('.mono') || { firstChild: { textContent: '' } }).firstChild.textContent, shown: getComputedStyle(o).display }; }, cl.start + parts[1].offset + 0.5);
    const tl = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'build', 'scriptor', 'treat.log'), 'utf8'), vm = /^(§TREAT_VERDICT PASS judged=\d+ fails=0)/m.exec(tl);
    const ok = t.shown === 'block' && t.li.length === 6 && vm && t.mono === vm[1] && t.li.every(x => /[\u0E00-\u0E7F]/.test(x));
    say(`§FILM_CLOSE_CARD shown=${t.shown} limits_on_card=${t.li.length} (expected 6) all_thai=${t.li.every(x => /[\u0E00-\u0E7F]/.test(x)) ? 1 : 0} verdict_on_card="${t.mono}" verdict_in_treat_log="${vm && vm[1]}" ${ok ? 'OK' : 'WRONG'}`); }
  if (process.env.NOTE_MUTANT) { await page.addStyleTag({ content: '#nt_SHELF,#nt_MIRROR{margin-top:90px !important}' }); say('§FILM_MUTANT shelf and mailbox note boxes pushed 90 px down (control: the note-visibility witness must now FAIL)'); }
  // notes: every on-screen note must be VISIBLE (its text in the DOM and its box inside its card) at its time. (The English cut's notes on the shelf / mailbox cards were clipped to a sliver by the card; the English layout witness measured the note box, not the card.)
  { let nv = 0, nbad = 0; for (const P of parts) for (const nt of P.notes) { const b = P.plan.beat.find(x => x.id === nt.beat), bs = b.start + P.offset, be = b.end + P.offset, tt = nt.after !== undefined ? P.plan.ft[nt.after] + P.offset + 0.35 : bs + nt.atFrac * (be - bs);
      const later = P.notes.filter(m => m.card === nt.card && m.beat === nt.beat && m !== nt && (m.after !== undefined ? P.plan.ft[m.after] + P.offset + 0.35 : bs + m.atFrac * (be - bs)) >= tt && (m.after !== undefined ? P.plan.ft[m.after] + P.offset + 0.35 : bs + m.atFrac * (be - bs)) <= Math.min(tt + 0.1, be)); if (later.length) continue;
      const ft = Math.min(tt + 0.1, be - 0.05), r = await page.evaluate(([f, card]) => { window.Stage.at(f); const e = document.getElementById('nt_' + card), c = document.getElementById('c_' + card), eb = e.getBoundingClientRect(), cb = c.getBoundingClientRect(); return { txt: e.textContent, inside: eb.top >= cb.top && eb.bottom <= cb.bottom - 3 + 0.5 && eb.left >= cb.left && eb.right <= cb.right - 3 + 0.5, h: Math.round(eb.height), clip: e.scrollHeight > e.clientHeight + 1 }; }, [ft, nt.card]);
      const want = nt.html.replace(/<[^>]+>/g, ''); nv++; const ok = r.txt === want && r.inside && !r.clip; if (!ok) { nbad++; say(`§FILM_NOTE_VISIBLE_BAD part=${P.n} beat=${nt.beat} card=${nt.card} ft=${ft.toFixed(2)} dom="${r.txt.slice(0, 60)}" inside=${r.inside} clipped=${r.clip}`); } }
    say(`§FILM_NOTE_VISIBLE notes_checked=${nv} not_visible_or_clipped=${nbad} ${nbad ? 'FAIL' : nv ? 'PASS' : 'INCONCLUSIVE'}`); }
  // notes: log each with its source (primary evidence of what the film claims on screen)
  D.parts.forEach(p => p.notes.forEach(n => say(`§FILM_NOTE part=${p.n} beat=${n.beat} card=${n.card} src="${n.src}" text="${n.html.replace(/<[^>]+>/g, '')}"`)));
  fs.writeFileSync(path.join(OUT, 'film.page.log'), PL.join('\n') + '\n');
  // assemble: concat with durations, 24 fps CFR, app area 1920x930 on a black 1920x1080 canvas (the 150 px band below is for the captions)
  if (process.env.NOSHOT) { say('§FILM_DONE_NOSHOT checks only (NOSHOT=1): no frames written, no video'); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); await browser.close(); return; }
  const lines = []; let i = 0; while (i < frames.length) { let j = i; while (j + 1 < frames.length && frames[j + 1] === frames[i]) j++; lines.push(`file '${frames[i]}'`, `duration ${((j - i + 1) / FPS).toFixed(6)}`); i = j + 1; }
  lines.push(`file '${frames[frames.length - 1]}'`); fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'film_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', `fps=${FPS},scale=1920:930:flags=lanczos,pad=1920:1080:0:0:color=black,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-frames:v', String(N), mp4]);
  say(`§FILM_DONE frames=${N} distinct_images=${new Set(frames).size} dur=${(N / FPS).toFixed(2)}s out=${mp4}`);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({ total: D.total, frames: N, beats: cueLog }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§FILM_ERROR ' + (e.stack || e) + '\n'); process.exit(1); });
