// ⚠ DO NOT REMOVE — Scope: FILM-M1 compositor — turn the recorded parts into the film's 1920×1080 frames (MOBILE_PERF.md §FILM-M1 R4/R5).
// READ <work>/stage/render_stage.log after every run. Issue this proves: only beats whose evidence line was present (manifest ok=true)
// reach the film (§STAGE_DROPPED lists the rest), every caption names its source (§STAGE_CAPTION) and every number in it came from a recording log
// (a caption whose log line is missing is dropped: §STAGE_CAPTION_DROPPED), and frames planned == written.
// Run: node render_stage.js <work> [frame=phone|trailer]   (work holds A/ B/ C/ HQ/ S/ from record_phone.js; frame=trailer ALSO needs opener/ from render_opener.js with FILM_ID=m1)
//   frame=phone (DEFAULT, rc2): real phone body + browser-window frame on a neutral background, title/end cards drawn by stage.html (no opener/ needed).
//   frame=trailer: the rc1 device (dusk landscape, stick figure zoom) kept selectable and unchanged. Env FRAME=... works too; PLAN_ONLY=1 prints §STAGE_PLAN and exits.
// ALL timings, sources, beat filters, hold scales, layouts, captions and the numbers in them live in ONE place: PLAN below (override per film by <work>/plan.json).
//   Segment kinds (frame=phone):
//     card   {title, sub, dur, fadeIn, handoff, handoffLayout}   title card (fades into the NEXT play segment's first phone frame) | end card (textDelay, textFade, devFade: devices of the previous segment fade out)
//     play   {src:'A'|'B'|'C'|…, slot:'A'|'B', layout, beats:[ids], hold:{default|<beat id>|<frame label>: scale}, maxHold, stills:{A,hq}, morph:{from,frames}, labels}
//            ONE single-screen recording; `beats` keeps only those beat ids ('ready' = frames before the first beat), only if their manifest beat is ok; each frame holds
//            ceil(hold × scale) film frames (≤ maxHold). `stills` = frames the other devices show (src, screen, at:'first'|'last'). `morph` = glide in from another layout.
//     timed  {src:'S', layout, beats, hold, maxHold, lead, morph, labels}   TWO screens recorded on ONE clock t (ms): events from both screens are played in true t order,
//            the screen that is not acting holds its latest frame, idle gaps are never shown (a frame lasts its own hold, not the wait before the next one).
//   Captions: plan.caps["<src>:<frame label>"] = {text, sub, source, needs:[fact names]}; ${fact} placeholders are filled from plan.facts (regex on a recording's record.log).
'use strict';
const os = require('os'), fs = require('fs'), path = require('path');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const ARG = Object.fromEntries(process.argv.slice(3).filter(a => a.includes('=')).map(a => a.split('=')));
const FRAME = ARG.frame || process.env.FRAME || 'phone';
if (!['phone', 'trailer'].includes(FRAME)) { console.error('frame must be phone|trailer'); process.exit(2); }
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
// ---- facts: name -> [recording, regex (on that recording's record.log), capture group (0 = presence only)] ----
// recording = A|B|C|HQ|S. Every number or word a caption speaks is one of these (or a measured MOBILE_PERF table row, marked so in the caption's `source`).
const FACTS = {
  xray_on:      ['A', '§WALK_XRAY_AUTO on', 0],
  xray_off:     ['A', '§WALK_XRAY_AUTO restored off', 0],
  sheet_bottom: ['A', '§SHEET_OPEN id=navigate-drawer-panel n=1 layer=top sheet=bottom', 0],
  sheet_swipe:  ['A', '§SHEET_CLOSE id=navigate-drawer-panel via=swipe', 0],
  sheet_back:   ['A', '§SHEET_CLOSE id=settings-panel via=back', 0],
  walk_trace:   ['A', '§WALK_TRACE i=\\d+ why=step', 0],
  snap:         ['A', '§SNAP \\w+', 0],
  issue_saved:  ['A', '§ISSUE_SAVED \\w+', 0],
  b_xray_on:    ['B', '§WALK_XRAY_AUTO on', 0],
  b_issue:      ['B', '§ISSUE_SAVED \\w+', 0],
  clash_filter: ['C', '§CLASH_MATRIX_FILTER (\\w+ vs \\w+) page=1'],
  clash_count:  ['C', '\\[clash_run\\] pair=\\S+ matrix_count=(\\d+)'],
  clash_showing:['C', '§CLASH_REVEAL storey=\\S+ showing=(\\d+)'],
  clash_overlap:['C', '§CLASH_DETAIL guidA=\\S+ guidB=\\S+ overlap=([\\d.]+)m'],
  clash_classes:['C', '§M1_CLASH pair=\\S+ idx=\\d+ classes=(\\w+\\|\\w+)'],
  clash_hl:     ['C', '§M1_CLASH .* highlights=(\\d+) tgt_err_m=[\\d.]+ checks=all_pass'],
  clash_tgt_err:['C', '§M1_CLASH .* tgt_err_m=([\\d.]+) checks=all_pass'],
  clash_saved:  ['C', '§CLASH_SNAG_SAVED guid_a=\\S+ guid_b=\\S+', 0],
  clash_fallback:['C', '§CLASH_SNAG_SHARE_PANEL shown \\(desktop fallback\\)', 0],
  clash_link:   ['C', '§M1_SHARE url=\\S+ carries=#clash=\\S+ overlap_mm=\\d+ severity=.* idb_clash_rows=(\\d+) checks=all_pass'],
  send_via:     ['S', '§HQ_SEND via=(team) drop='],
  send_status:  ['S', '§M1_SYNC_SEND status="([^"]+)" share_sheet=none'],
  get_added:    ['S', '§HQ_GET drops=\\d+ new=\\d+ issues_added=(\\d+)'],
  get_from:     ['S', '§M1_SYNC issue_from=(\\S+) photo_equal=true'],
  replay_points:['S', '§HQ_REPLAY kid=\\S+ points=(\\d+)'],
  scrub_points: ['S', '§M1_SYNC_SCRUB points=(\\d+) max_err_m=[\\d.]+'],
  scrub_err:    ['S', '§M1_SYNC_SCRUB points=\\d+ max_err_m=([\\d.]+)'],
};
// ---- captions: "<recording>:<frame label>" -> {text, sub, source, needs}. A caption is shown from its first frame until the next caption; a label with no entry keeps the one before. ----
const CAPS = {
  'A:ready':         { text: 'Ready to touch at once.', sub: 'Longest freeze after the model arrives: 5.6 s → 0.6 s (measured on a phone profile).', source: 'MOBILE_PERF §2026-11-27 LEVELS, P3 row' },
  'A:fab':           { text: 'Panels open in under 0.1 s.', sub: 'Slowest first open 74 ms (Settings), measured on a phone profile at 4× CPU slowdown.', source: 'MOBILE_PERF §P6 W-MOBILE-PANELS (open painted 9.5–74 ms)' },
  'A:nav_open':      { text: 'Panels open as bottom sheets.', sub: 'Navigate and Settings, from the pill rail.', source: '§SHEET_OPEN … layer=top sheet=bottom', needs: ['sheet_bottom'] },
  'A:nav_swipe':     { text: 'Swipe down to close.', sub: 'One panel at a time.', source: '§SHEET_CLOSE via=swipe', needs: ['sheet_swipe'] },
  'A:settings_open': { text: 'Android Back closes it.', sub: 'The page stays.', source: '§SHEET_CLOSE via=back', needs: ['sheet_back'] },
  'A:walk_start':    { text: 'Walk: X-Ray turns itself on.', sub: 'It switches back off when the walk stops.', source: '§WALK_XRAY_AUTO on / restored off', needs: ['xray_on', 'xray_off'] },
  'A:walk_steps':    { text: 'Every step on the record.', sub: 'Steps simulated here; a phone counts them as you walk.', source: '§WALK_TRACE', needs: ['walk_trace'] },
  'A:snag':          { text: 'Snag the element.', sub: 'Element, storey and time stamped on the photo, saved to the Issue Log (simulated camera).', source: '§SNAP + §ISSUE_SAVED', needs: ['snap', 'issue_saved'] },
  'C:clash_run':     { text: 'Clash Matrix: ${clash_filter}.', sub: '${clash_count} clashes in that pair; the list shows ${clash_showing}.', source: '§CLASH_MATRIX_FILTER ${clash_filter}; [clash_run] matrix_count=${clash_count}; §CLASH_REVEAL showing=${clash_showing}' },
  'C:clash_pick':    { text: 'Tap a clash.', sub: 'Overlap ${clash_overlap} m. The camera target lands on it: error ${clash_tgt_err} m.', source: '§CLASH_DETAIL overlap=${clash_overlap}m; §M1_CLASH tgt_err_m=${clash_tgt_err}' },
  'C:clash_detail':  { text: 'Both elements, highlighted.', sub: '${clash_classes}; ${clash_hl} highlights on the model.', source: '§M1_CLASH classes=${clash_classes} highlights=${clash_hl} checks=all_pass' },
  'C:clash_snag':    { text: 'Long-press: snag the clash.', sub: 'A photo with the clash strip (simulated camera), then Share.', source: '§CLASH_SNAG_SAVED', needs: ['clash_saved'] },
  'C:clash_share':   { text: 'Share: the desktop-style panel.', sub: 'This browser has no phone share sheet, so the app shows its own panel. A real phone shows its own share sheet.', source: '§CLASH_SNAG_SHARE_PANEL shown (desktop fallback)', needs: ['clash_fallback'] },
  'C:clash_saved':   { text: 'Saved to the Issue Log, with a link.', sub: 'The link carries the clash, the camera and the tolerance; ${clash_link} clash stored.', source: '§CLASH_SNAG_SAVED; §M1_SHARE idb_clash_rows=${clash_link}', needs: ['clash_saved'] },
  'S:s_send':        { text: 'Phone: Send to HQ.', sub: '"${send_status}" Through the team folder, no share sheet.', source: '§HQ_SEND via=${send_via}; §M1_SYNC_SEND status="${send_status}" share_sheet=none' },
  'S:s_get':         { text: 'HQ gets the report.', sub: '${get_added} issue from ${get_from}, photo identical. Recorded in sequence: sent first, then fetched.', source: '§HQ_GET issues_added=${get_added}; §M1_SYNC issue_from=${get_from} photo_equal=true' },
  'S:s_replay':      { text: 'HQ replays the phone’s walk.', sub: '${replay_points} points from ${get_from}.', source: '§HQ_REPLAY points=${replay_points} from=${get_from}' },
  'S:s_scrub':       { text: 'Scrub: the camera matches.', sub: 'At each of ${scrub_points} points, HQ’s camera vs the phone’s record: max error ${scrub_err} m.', source: '§M1_SYNC_SCRUB points=${scrub_points} max_err_m=${scrub_err}' },
  'B:b_walk':        { text: 'Site B walks its own site.', sub: '${siteB} walk, X-Ray on by itself.', source: '§WALK_XRAY_AUTO on (B)', needs: ['b_xray_on'] },
  'B:b_snag':        { text: 'Site B snags its own.', sub: '${siteB} walk, X-Ray on by itself, stamped photo to its Issue Log.', source: '§WALK_XRAY_AUTO on + §ISSUE_SAVED (B)', needs: ['b_xray_on', 'b_issue'] },
};
// ---- the segment plan (data, not code) ----
const L3 = { A: 'Site A · Duplex', D: 'HQ · desktop', B: 'Site B · ${siteB}' }, L2 = { A: 'Site A · Duplex', D: 'HQ · desktop' };
const MID = [   // the middle of the film, identical in every plan: real phone bodies (frame=phone)
  // 2 — Fast: model ready, panels as bottom sheets, swipe / Back close
  { id: 'fast', kind: 'play', src: 'A', layout: 'phone', beats: ['ready', 'fab', 'nav_open', 'nav_swipe', 'settings_open', 'settings_back'], hold: { default: 1 } },
  // 3 — Walk: X-Ray on by itself, steps, snag (A's share / walk_stop / scrub are not in this cut: the HQ link + replay come from role S, which shows them for real)
  { id: 'walk', kind: 'play', src: 'A', layout: 'phone', beats: ['walk_start', 'walk_steps', 'snag'], hold: { default: 1, walk_steps: 0.8, snag: 0.85 } },
  // 4 — Clash in detail
  { id: 'clash', kind: 'play', src: 'C', layout: 'phone', beats: ['clash_run', 'clash_pick', 'clash_detail', 'clash_snag_or_share'], hold: { default: 0.7, clash_pick: 1, clash_share: 0.9 }, maxHold: 36 },
  // 5 — report arrives at HQ: S's phone sends, HQ gets / replays / scrubs; true t order
  { id: 'hq', kind: 'timed', src: 'S', layout: 'phone+desktop', beats: ['s_send', 's_get', 's_replay', 's_scrub'], hold: { default: 1 }, maxHold: 60, lead: 15, morph: { from: 'phone', frames: 24 }, labels: L2 },
  // 6 — two sites: Site B snags its own (A and HQ show their last frames from role S)
  { id: 'sites', kind: 'play', src: 'B', slot: 'B', layout: 'phone+desktop+phone', beats: ['b_walk', 'b_snag'], hold: { default: 0.6 }, maxHold: 24,
    stills: { A: { src: 'S', screen: 'phone', at: 'last' }, hq: { src: 'S', screen: 'hq', at: 'last' } }, morph: { from: 'phone+desktop', frames: 24 }, labels: L3 },
];
const PLANS = {
  // rc2: title card -> phone bodies -> end card (kept reproducible: PLAN_NAME=rc2 or plan=rc2)
  rc2: { facts: FACTS, caps: CAPS, segments: [
    { id: 'intro', kind: 'card', dur: 3.2, title: 'The phone, fast.', sub: 'Walk the site, snag it, send it to HQ.', fadeIn: 6, handoff: 0.6, handoffLayout: 'phone' },
    ...MID,
    { id: 'outro', kind: 'card', dur: 4.0, title: 'Fast on the phone.', sub: 'Every step on the record.', textDelay: 6, textFade: 12, devFade: 15 } ] },
  // hybrid (rc3, DEFAULT): chapter card -> trailer zoom into the site figure's phone -> 0.5 s cross-fade into the REAL phone body (same rect) -> middle -> cross-fade to the trailer
  // outro (overview, links green, the closing line) -> the last card (what you saw / prior art / credentials). Chapter + last card = PNGs from cards_m1.js, the opener frames from render_opener.js (FILM_ID=m1).
  hybrid: { facts: FACTS, caps: CAPS, segments: [
    { id: 'chapter', kind: 'still', src: 'cards/chapter.png', dur: 3.6, fadeIn: 12, bgColor: '#0b0f17' },
    { id: 'opener', kind: 'opener', dir: 'opener/intro', xfade: 12 },
    { ...MID[0], xfade: 15, handoffBox: 'opener/boxes.json' }, ...MID.slice(1),
    { id: 'outro', kind: 'opener', dir: 'opener/outro', xfade: 15 },
    { id: 'close', kind: 'still', src: 'cards/close.png', dur: 10, xfade: 12, bgColor: '#0b0f17' } ] },
};
const PLAN_NAME = ARG.plan || process.env.PLAN_NAME || 'hybrid';
if (!PLANS[PLAN_NAME]) { console.error('plan must be one of ' + Object.keys(PLANS)); process.exit(2); }
const DEFAULT_PLAN = PLANS[PLAN_NAME];

// ---------------- recordings ----------------
let PLAN = DEFAULT_PLAN, siteB = '?';
const _m = {}, _l = {};
const SRC_DIR = (src, screen) => src === 'S' ? 'S/' + (screen || 'phone') : src;
const LOG_OF = src => src === 'S' ? 'S/record.log' : src + '/record.log';
const logText = src => _l[src] !== undefined ? _l[src] : (_l[src] = fs.existsSync(path.join(W, LOG_OF(src))) ? fs.readFileSync(path.join(W, LOG_OF(src)), 'utf8') : '');
// every frame of one screen, with the beat range it belongs to ('ready' = before the first beat) and that beat's ok flag
function framesOf(src, screen) {
  const dir = SRC_DIR(src, screen); if (_m[dir]) return _m[dir];
  const m = J(dir + '/manifest.json');
  return _m[dir] = m.frames.map((f, i) => { const b = m.beats.find(b => i >= b.frames[0] && i < b.frames[1]);
    return { i, file: dir + '/' + f.f, label: f.beat, rb: b ? b.id : 'ready', ok: b ? b.ok : true, hold: f.hold, tap: f.tap || null, t: f.t, src, screen: screen || null }; });
}
const beatsOf = (src, screen) => J(SRC_DIR(src, screen) + '/manifest.json').beats;
// facts → values; template fill; a caption with a missing fact is dropped, never softened
const factVals = {}, factShown = new Set();
function fact(name) { if (name in factVals) return factVals[name];
  const d = (PLAN.facts || {})[name]; let v = null;
  if (d) { const m = new RegExp(d[1], 'm').exec(logText(d[0])); if (m) v = d[2] === 0 ? 'yes' : m[d[2] == null ? 1 : d[2]]; }
  return factVals[name] = v; }
function fill(tpl, needs) { let miss = null; const out = String(tpl).replace(/\$\{(\w+)\}/g, (_, n) => { if (n === 'siteB') return siteB; const v = fact(n); if (v == null) { miss = n; return ''; } needs.add(n); return v; }); return { out, miss }; }
function resolveCap(key, c) {
  const needs = new Set(c.needs || []); const t = fill(c.text, needs), s = fill(c.sub || '', needs), so = fill(c.source || '', needs);
  const miss = t.miss || s.miss || so.miss || [...needs].find(n => fact(n) == null) || null;
  if (miss) { say(`§STAGE_CAPTION_DROPPED key=${key} missing_fact=${miss} (its log line is not in the recording: the caption is not shown)`); return null; }
  for (const n of needs) if (!factShown.has(n)) { factShown.add(n); say(`§STAGE_FACT ${n}=${fact(n)} (${(PLAN.facts[n] || [])[0]} record.log)`); }
  return { text: t.out, sub: s.out, source: so.out }; }
const capBoxFor = L => L.includes('+desktop') ? (L.endsWith('+phone') ? { x: 504, y: 860, w: 912, subDy: 66, align: 'center' } : { x: 620, y: 850, w: 1140, subDy: 66, align: 'center' }) : { x: 90, y: 330, w: 560, subDy: 150 };
const hasD = L => L.includes('+desktop');
const holdN = (f, P) => { const H = P.hold || {}, sc = H[f.label] != null ? H[f.label] : H[f.rb] != null ? H[f.rb] : H.default != null ? H.default : 1;
  let n = Math.max(1, Math.ceil(f.hold * sc - 1e-9)); if (P.maxHold) n = Math.min(n, P.maxHold); return n; };
// pick a screen's frames by beat filter (ok beats only); `dropped` = requested beats that are not ok or absent
function select(src, screen, P) {
  const all = framesOf(src, screen), want = P.beats ? new Set(P.beats) : null, bs = beatsOf(src, screen), notOk = new Set(bs.filter(b => !b.ok).map(b => b.id));
  const have = new Set(all.map(f => f.rb)); const missing = want ? [...want].filter(b => !have.has(b)) : [];
  return { frames: all.filter(f => f.ok && (!want || want.has(f.rb))), dropped: (want ? [...want] : [...notOk]).filter(b => notOk.has(b) || missing.includes(b)) };
}
const stillOf = s => { const fr = framesOf(s.src, s.screen), f = s.at === 'first' ? fr[0] : fr[fr.length - 1]; return f; };
const USED = [];
const useBeats = (src, frames) => { for (const b of new Set(frames.map(f => f.rb))) if (b !== 'ready' && !USED.some(u => u.src === src && u.beat === b)) USED.push({ src, beat: b }); };

(async () => {
  const PLAN_RAW = fs.existsSync(path.join(W, 'plan.json')) ? J('plan.json') : DEFAULT_PLAN;
  PLAN = Object.assign({}, DEFAULT_PLAN, Array.isArray(PLAN_RAW) ? { segments: PLAN_RAW } : PLAN_RAW);
  say(`§STAGE_FRAME_MODE frame=${FRAME} plan=${FRAME === 'trailer' ? 'n/a (rc1 device, fixed)' : fs.existsSync(path.join(W, 'plan.json')) ? 'plan.json' : PLAN_NAME}`);
  const D = [], seg = {}, beatAt = {}, TL = [], mark = n => { seg[n] = D.length; };
  const dbB = (logText('B').match(/db=buildings\/(\w+?)_extracted/) || [])[1] || '?';
  siteB = ({ HHS_Office_Federated: 'Office', Hospital: 'Hospital', Duplex: 'Duplex', Terminal: 'Terminal' })[dbB] || dbB;
  say(`§STAGE_SITE_B db=${dbB} label=${siteB}`);
  if (FRAME === 'trailer') {
    // frame=trailer (rc1, unchanged): reads the rc1 recordings A / B / HQ and the opener stills; captions = the frozen CAP table above
    const A = J('A/manifest.json'), B = J('B/manifest.json'), HQ = J('HQ/manifest.json'), box = J('opener/boxes.json').phone;
    const logA = logText('A'), logHQ = logText('HQ');
    const nScrub = +((logA.match(/§M1_SCRUB walk_events=(\d+)/) || [])[1] || 0), hqDist = (logHQ.match(/dist_m=([\d.]+) SAME_VIEW/) || [])[1], nameB = siteB;
    if (nScrub) CAP.scrub = ['Replay: scrub the walk back.', nScrub + ' walk events in the history bar.', '§M1_SCRUB walk_events=' + nScrub];
    const okA = new Set(A.beats.filter(b => b.ok).map(b => b.id)), okB = new Set(B.beats.filter(b => b.ok).map(b => b.id));
    say(`§STAGE_DROPPED A=[${A.beats.filter(b => !b.ok).map(b => b.id)}] B=[${B.beats.filter(b => !b.ok).map(b => b.id)}]`);
    // site B is the supporting beat: its holds play at half length so it does not linger (owner: no slow parts)
    const expand = (m, ok, div) => { const out = []; for (const f of m.frames) { if (f.beat !== 'ready' && !ok.has(f.beat)) continue;
      for (let k = 0; k < Math.ceil(f.hold / (div || 1)); k++) out.push({ src: f.f, beat: f.beat, tap: k < 6 ? f.tap : null }); } return out; };
    const fa = expand(A, okA).map(f => ({ ...f, src: 'A/' + f.src })), fb = expand(B, okB, 2).map(f => ({ ...f, src: 'B/' + f.src }));
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
    D.forEach(d => { d.frame = 'trailer'; });
  } else {
    // ---------- frame=phone: every descriptor names a layout; stage.html draws the phone body / window frame ----------
    const labelsOf = P => { if (!P.labels) return null; const o = {}; for (const k in P.labels) o[k] = fill(P.labels[k], new Set()).out; return o; };
    const built = []; let prevLast = null;
    for (const P of PLAN.segments) {
      if (P.kind === 'card') { built.push({ P }); continue; }
      if (P.kind === 'still' || P.kind === 'opener') {   // full-frame pictures: a held PNG (chapter / last card) or the trailer opener's rendered frames
        const imgs = P.kind === 'still' ? Array.from({ length: Math.round(P.dur * FPS) }, () => P.src) : pngs(P.dir);
        if (!imgs.length) throw new Error('segment ' + P.id + ': no pictures');
        const descs = imgs.map((f, i) => ({ frame: 'phone', layout: 'phone', bgColor: P.bgColor || '#000', under: { src: url(f), a: P.fadeIn && i < P.fadeIn ? +((i + 1) / P.fadeIn).toFixed(3) : 1 } }));
        built.push({ P, descs, marks: {}, tl: imgs.map(f => ({ phase: 'image', img: f })), imgs: imgs.map(f => url(f)), lastImg: url(imgs[imgs.length - 1]), imgSeg: true }); prevLast = descs[descs.length - 1]; continue; }
      const Lyt = P.layout, descs = [], marks = {}, tl = [], slot = P.slot || 'A', labels = labelsOf(P), st = P.stills || {};
      const note = (f, at) => { for (const k of [f.rb, f.label]) if (k && !(k in marks)) marks[k] = at; };
      let cur = null, since = 0, curKey = null;
      const capStep = (f, key) => { if (!(key in PLAN.caps) || !PLAN.caps[key] || key === curKey) return;   // a caption starts at its first frame and runs until the next one
        curKey = key; cur = resolveCap(key, PLAN.caps[key]); since = 0; if (cur) say(`§STAGE_CAPTION beat=${f.label} text="${cur.text}" source="${cur.source}" sub="${cur.sub}"`); };
      const capFields = () => ({ cap: cur && cur.text, sub: cur && cur.sub, capBox: capBoxFor(Lyt), capAlpha: Math.min(1, since / 8) });
      if (P.kind === 'play') {
        const sel = select(P.src, null, P); useBeats(P.src, sel.frames);
        say(`§STAGE_DROPPED src=${P.src} seg=${P.id} beats=[${sel.dropped}] (manifest ok=false or absent: not shown)`);
        const fr = sel.frames; if (!fr.length) throw new Error('segment ' + P.id + ': no frames after the beat filter');
        const aS = st.A ? { src: url(stillOf(st.A).file) } : (slot === 'A' ? null : prevLast && prevLast.A && { src: prevLast.A.src });
        const hS = st.hq ? url(stillOf(st.hq).file) : (prevLast && prevLast.hq);
        const mkd = (own, extra) => { const d = { frame: 'phone', layout: Lyt }; if (slot === 'A') d.A = own; else { d.A = aS; d[slot] = own; }
          if (hasD(Lyt) && hS) d.hq = hS; if (labels) d.labels = labels; return Object.assign(d, extra); };
        if (P.morph) { const first = { src: url(fr[0].file) };
          for (let i = 0; i < P.morph.frames; i++) { const u = ease(i / (P.morph.frames - 1)); descs.push(mkd(first, { morph: { from: P.morph.from, u }, labelA: +u.toFixed(3) })); tl.push({ phase: 'morph', u }); } }
        for (const f of fr) { const n = holdN(f, P); capStep(f, P.src + ':' + f.label); note(f, descs.length);
          for (let k = 0; k < n; k++) { since++; descs.push(mkd({ src: url(f.file), tap: k < 6 ? f.tap : null }, capFields())); tl.push({ src: P.src, file: f.file, label: f.label, beat: f.rb, k }); } }
      } else if (P.kind === 'timed') {
        // two screens, one clock: merge by t; the idle screen holds its latest frame
        const scr = { A: select(P.src, 'phone', P), hq: select(P.src, 'hq', P) }, dropped = (P.beats || []).filter(b => [scr.A, scr.hq].every(x => x.dropped.includes(b)) || [['phone', 'A'], ['hq', 'hq']].some(([sc]) => beatsOf(P.src, sc).some(x => x.id === b && !x.ok)));   // a beat lives on ONE screen: absent from the other is normal
        useBeats(P.src, [...scr.A.frames, ...scr.hq.frames]); say(`§STAGE_DROPPED src=${P.src} seg=${P.id} beats=[${dropped}] (manifest ok=false or absent: not shown)`);
        const ev = [...scr.A.frames.map(f => ({ f, s: 'A' })), ...scr.hq.frames.map(f => ({ f, s: 'hq' }))].sort((a, b) => a.f.t - b.f.t);
        if (!ev.length) throw new Error('segment ' + P.id + ': no events after the beat filter');
        const t0 = ev[0].f.t, init = s => { const fr = framesOf(P.src, s === 'A' ? 'phone' : 'hq'), before = fr.filter(f => f.t < t0); return before.length ? before[before.length - 1] : fr[0]; };
        const now = { A: init('A'), hq: init('hq') };
        say(`§STAGE_TIMED seg=${P.id} events=${ev.length} t_first=${t0} t_last=${ev[ev.length - 1].f.t} initial_phone=${now.A.file}@t${now.A.t} initial_hq=${now.hq.file}@t${now.hq.t}`);
        const mkd = extra => Object.assign({ frame: 'phone', layout: Lyt, A: { src: url(now.A.file) }, hq: url(now.hq.file), labels }, extra);
        if (P.morph) for (let i = 0; i < P.morph.frames; i++) { const u = ease(i / (P.morph.frames - 1));
          const a = prevLast && prevLast.A ? { src: prevLast.A.src } : { src: url(now.A.file) }; descs.push(mkd({ A: a, morph: { from: P.morph.from, u }, labelA: +u.toFixed(3) })); tl.push({ phase: 'morph', u }); }
        for (let i = 0; i < (P.lead || 0); i++) { descs.push(mkd({})); tl.push({ phase: 'lead', phone: now.A.file, hq: now.hq.file }); }
        for (const e of ev) { now[e.s] = e.f; const f = e.f, n = holdN(f, P); capStep(f, P.src + ':' + f.label); note(f, descs.length);
          for (let k = 0; k < n; k++) { since++; descs.push(mkd(Object.assign(capFields(), { A: { src: url(now.A.file), tap: e.s === 'A' && k < 6 ? now.A.tap : null } })));
            tl.push({ phase: 'event', t: f.t, scr: e.s, phone: now.A.file, hq: now.hq.file, label: f.label, beat: f.rb, k }); } }
      } else throw new Error('unknown segment kind ' + P.kind);
      built.push({ P, descs, marks, tl }); prevLast = descs[descs.length - 1];
    }
    // ---- assembly in plan order; cards look at their neighbours ----
    built.forEach((b, bi) => {
      const P = b.P; mark(P.id);
      if (P.kind === 'card') {
        const N = Math.round(P.dur * FPS), H = Math.round((P.handoff || 0) * FPS), nxt = built.slice(bi + 1).find(x => x.descs), prv = built.slice(0, bi).reverse().find(x => x.descs);
        for (let i = 0; i < N; i++) {
          if (P.handoffLayout) {   // title card in: text fades up, the next segment's first phone frame fades in over the last `handoff` seconds
            const hu = H ? Math.max(0, (i - (N - H) + 1) / H) : 0, a = Math.min(1, (i + 1) / (P.fadeIn || 1));
            const d = { frame: 'phone', layout: P.handoffLayout, cards: [{ title: P.title, sub: P.sub, a: +(a * (1 - hu)).toFixed(3) }] };
            if (hu > 0) { d.A = { src: nxt.descs[0].A.src }; d.dev = +hu.toFixed(3); }
            D.push(d);
          } else {                 // end card out: devices fade away, the closing text fades in
            const ld = prv.descs[prv.descs.length - 1], dv = Math.max(0, 1 - i / (P.devFade || 1)), a = Math.max(0, Math.min(1, (i - (P.textDelay || 0)) / (P.textFade || 1)));
            const d = { frame: 'phone', layout: ld.layout, cards: [{ title: P.title, sub: P.sub, a: +a.toFixed(3) }] };
            if (dv > 0) { Object.assign(d, { A: ld.A, hq: ld.hq, B: ld.B, dev: +dv.toFixed(3) }); }
            D.push(d);
          }
          TL.push({ seg: P.id, phase: 'card' });
        }
        return;
      }
      for (const k in b.marks) if (!(k in beatAt)) beatAt[k] = D.length + b.marks[k];
      // cross-fades (P.xfade = N frames): into a segment that follows a PICTURE segment, the old picture sits on top and fades out (a_i = 1-(i+1)/(N+1)); into a picture segment that follows
      // phone bodies, the new picture fades in on top of the previous segment's last descriptor (a_i = (i+1)/(N+1)). Never between two device segments.
      const prev = built[bi - 1], N = P.xfade || 0, xf = (i) => (N && i < N && prev && prev.descs) ? (prev.lastImg ? 'out' : b.imgSeg ? 'in' : null) : null;
      b.descs.forEach((d, i) => { const k = xf(i); let dd = d, t = Object.assign({ seg: P.id }, b.tl[i]);
        if (k === 'out') { dd = Object.assign({}, d, { over: { src: prev.lastImg, a: +(1 - (i + 1) / (N + 1)).toFixed(4) } }); t.xfade = { i, N, kind: 'out', from: prev.lastImg, handoff: !!P.handoffBox }; }
        if (k === 'in') { const base = Object.assign({}, prev.descs[prev.descs.length - 1]); delete base.over; dd = Object.assign(base, { over: { src: b.imgs[i], a: +((i + 1) / (N + 1)).toFixed(4) } }); t.xfade = { i, N, kind: 'in', to: b.imgs[i] }; }
        D.push(dd); TL.push(t); });
    });
  }
  const segs = Object.entries(seg).map(([k, v], i, a) => `${k}=${(((i + 1 < a.length ? a[i + 1][1] : D.length) - v) / FPS).toFixed(2)}s`);
  say(`§STAGE_PLAN frames=${D.length} seconds=${(D.length / FPS).toFixed(2)} ${segs.join(' ')}`);
  fs.writeFileSync(path.join(OUT, 'segments.json'), JSON.stringify({ seg, beatAt, frames: D.length, fps: FPS, frame: FRAME }));
  if (FRAME === 'phone') { fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify(TL.map((t, i) => Object.assign({ f: i }, t))));
    fs.writeFileSync(path.join(OUT, 'used_beats.json'), JSON.stringify(USED)); fs.writeFileSync(path.join(OUT, 'plan_used.json'), JSON.stringify(PLAN)); say(`§STAGE_USED beats=${USED.map(u => u.src + ':' + u.beat).join(',')}`); }
  if (process.env.PLAN_ONLY) { say('§STAGE_PLAN_ONLY (no frames rendered)'); fs.writeFileSync(path.join(OUT, 'render_stage.log'), LOG.join('\n') + '\n'); return; }

  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.join(__dirname, 'stage.html'));
  let prev = null, rendered = 0, broken = 0, rings = 0, ringsExpected = 0, lastRings = 0, framesLogged = new Set(), frameFail = 0;
  const tapOf = d => (d.A && d.A.tap ? 1 : 0) + (d.B && d.B.tap ? 1 : 0);
  // measure a phone-frame descriptor from the DOM (the numbers that go in §STAGE_FRAME)
  const measure = () => page.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; };
    return { screens: [...document.querySelectorAll('.pscr')].map(e => ({ role: e.dataset.role, scr: R(e), img: R(e.querySelector('img')), outer: R(e.parentNode), rs: getComputedStyle(e).borderTopLeftRadius, ro: getComputedStyle(e.parentNode).borderTopLeftRadius })),
      wins: [...document.querySelectorAll('.win')].map(e => ({ win: R(e), content: R(e.querySelector('.wscr')), img: R(e.querySelector('.wscr img')), url: e.querySelector('.url').textContent })) }; });
  const f4 = a => a.map(v => +v.toFixed(2)).join(',');
  // the hand-off from the trailer opener into the REAL phone body: the opener's phone box must be the phone layout's screen rect, numerically (§STAGE_HANDOFF)
  const hIdx = FRAME === 'phone' ? TL.findIndex(t => t.xfade && t.xfade.handoff) : -1; let handoffEqual = null;
  for (let i = 0; i < D.length; i++) {
    const out = path.join(OUT, String(i).padStart(5, '0') + '.png'), key = JSON.stringify(D[i]);
    if (key === prev) { fs.copyFileSync(path.join(OUT, String(i - 1).padStart(5, '0') + '.png'), out); rings += lastRings; ringsExpected += FRAME === 'phone' ? tapOf(D[i]) : 0; continue; }
    await page.evaluate(d => window.STAGE.render(d), D[i]);
    broken += await page.evaluate(async () => { const im = [...document.images]; await Promise.all(im.map(x => x.decode().catch(() => {}))); return im.filter(x => !x.naturalWidth).length; });
    if (FRAME === 'phone') {
      lastRings = await page.evaluate(() => document.querySelectorAll('.pring').length); rings += lastRings; ringsExpected += tapOf(D[i]);
      const d = D[i], steady = !d.morph && (d.dev == null || d.dev === 1) && d.A && !framesLogged.has(d.layout);
      if (steady) { framesLogged.add(d.layout); const m = await measure(), nat = 456 / 933;
        for (const sc of m.screens) { const err = Math.abs(sc.scr[2] / sc.scr[3] / nat - 1) * 100, same = sc.img.every((v, j) => Math.abs(v - sc.scr[j]) <= 1), ok = err <= 0.5 && same; if (!ok) frameFail++;
          say(`§STAGE_FRAME kind=phone layout=${d.layout} role=${sc.role} screen_rect=${f4(sc.scr)} outer_rect=${f4(sc.outer)} radii=screen:${sc.rs}/outer:${sc.ro} bezel=16 aspect_err=${err.toFixed(4)}% img_eq_screen=${same} ${ok ? 'OK' : 'FAIL'}`); }
        for (const w of m.wins) { const err = Math.abs(w.img[2] / w.img[3] / (16 / 9) - 1) * 100, ok = err <= 0.5 && w.url === 'HQ'; if (!ok) frameFail++;
          say(`§STAGE_FRAME kind=desktop layout=${d.layout} window_rect=${f4(w.win)} content_rect=${f4(w.content)} url_text="${w.url}" aspect_err=${err.toFixed(4)}% ${ok ? 'OK' : 'FAIL'}`); } }
    }
    if (i === hIdx) { const seg0 = PLAN.segments.find(x => x.id === TL[i].seg), ob = J(seg0.handoffBox).phone, m = await measure(), sc = m.screens.find(x => x.role === 'A').scr, lay = await page.evaluate(() => window.STAGE.layout('phone').phone);
      const box = [ob.x, ob.y, ob.w, ob.h], lr_ = [lay.x, lay.y, lay.w, lay.h], eq = box.every((v, j) => Math.abs(v - lr_[j]) <= 0.5) && box.every((v, j) => Math.abs(v - sc[j]) <= 0.5); handoffEqual = eq;
      say(`§STAGE_HANDOFF opener_box=${f4(box)} layout_rect=${f4(lr_)} screen_rect=${f4(sc)} crossfade_frames=${TL[i].xfade.N} equal=${eq} ${eq ? 'OK' : 'FAIL'}`); }
    await page.screenshot({ path: out }); prev = key; rendered++;
  }
  await browser.close();
  const got = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).length;
  say(`§STAGE_FRAMES planned=${D.length} written=${got} rendered_unique=${rendered} ${got === D.length ? 'OK' : 'MISMATCH'}`);
  if (FRAME === 'phone') { say(`§STAGE_FRAME_CHECK layouts=${framesLogged.size} fails=${frameFail} ${frameFail === 0 && framesLogged.size ? 'OK' : 'FAIL'}`);
    say(`§STAGE_TAP drawn=${rings} expected=${ringsExpected} ${rings === ringsExpected && rings > 0 ? 'OK' : 'FAIL'}`); } else say('§STAGE_FRAME kind=trailer (rc1 device, unchanged; not measured)');
  if (hIdx >= 0 && handoffEqual !== true) say('§STAGE_HANDOFF FAIL (rect not equal or not measured)');
  say(`§STAGE_IMG broken=${broken} ${broken === 0 ? 'OK' : 'FAIL'}`);
  say(`§STAGE_PAGEERRORS n=${errs.length}${errs.length ? ' ' + errs.join(' | ') : ''}`);
  fs.writeFileSync(path.join(OUT, 'render_stage.log'), LOG.join('\n') + '\n');
})().catch(e => { say('§STAGE_FATAL ' + e.stack); fs.writeFileSync(path.join(OUT, 'render_stage.log'), LOG.join('\n') + '\n'); process.exit(1); });
