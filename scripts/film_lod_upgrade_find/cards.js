// ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" (prompts/FILM_LOD_UPGRADE_FIND.md). READ the log (§CARD / §CARDS_DONE); an overflow prints TOO-TALL / TOO-WIDE and fails the build.
// The stills (1920x1080 PNG, headless Chrome on the CPU). House split screen: the terminal strip above (each line TYPED, one still per character, then the real answer lines, scrolled slowly when they are taller than the
// strip, ONE font size for the whole film) and the real app below: the Modeller or the Viewer, cropped and zoomed to the part that changes (the capture is device scale 2; the crops are named in §CARD). The bottom 230 px
// stay empty for the captions. Every line, count and picture is read from out/facts.json and the capture folder; nothing is typed in by hand. Usage: node cards.js <work dir> <out cards dir>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { pathToFileURL } = require('url');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUTD = path.resolve(process.env.OUTD || path.join(__dirname, 'out')), F = JSON.parse(fs.readFileSync(path.join(OUTD, 'facts.json'), 'utf8'));
const WORK = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || path.join(OUTD, 'cards')); fs.mkdirSync(out, { recursive: true });
const V = JSON.parse(fs.readFileSync(path.join(WORK, 'viewer.json'), 'utf8')), PA = JSON.parse(fs.readFileSync(path.join(WORK, 'pill_A.json'), 'utf8')), PB = JSON.parse(fs.readFileSync(path.join(WORK, 'pill_B.json'), 'utf8'));   // rc3: the Upgrade pill captures (capture_pill.js)
const BLANK = (() => { try { return JSON.parse(fs.readFileSync(path.join(WORK, 'blank_frames.json'), 'utf8')); } catch (e) { return {}; } })();   // rc4 S2
const FONT = "'DejaVu Sans'", url = (rel) => pathToFileURL(path.join(WORK, rel)).href;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nf = (n) => Number(n).toLocaleString('en-US');
const ROW = 44, TERM_H = 262 - 28;   // one row of the terminal (31 px x 1.42) and the height inside its padding
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden;position:relative}
.term{position:absolute;left:28px;right:28px;top:14px;height:262px;background:#0b0f17;border:2px solid #334155;border-radius:14px;padding:14px 26px;font-family:'DejaVu Sans Mono',monospace;font-size:31px;line-height:44px;overflow:hidden}
.scr{position:relative} .cmd{color:#F3EEE8;white-space:pre-wrap;overflow-wrap:anywhere} .cmd:before{content:'$ ';color:#4ade80} .cmdf:before{content:'Find \\25B8  ';color:#4ade80} .cmdc:before{content:'click \\25B8  ';color:#4ade80}
.ans{color:#fbbf24;white-space:pre-wrap;overflow-wrap:anywhere} .ans b{color:#7dd3fc;font-weight:700} .ans .tag{color:#7dd3fc} .ok{color:#4ade80;font-weight:700} .no{color:#f87171;font-weight:700}
.cur{display:inline-block;width:17px;height:32px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:282px;height:30px;background:#1e293b;color:#94a3b8;font-size:20px;line-height:30px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc;font-weight:700} .bar i{float:right;font-style:normal;color:#fbbf24;font-weight:700;letter-spacing:2px}
.lf{position:absolute;left:0;top:312px;width:1920px;height:537px;background:#0b0f17;overflow:hidden} .lf div{position:absolute;background-repeat:no-repeat}
.lp{left:0;top:0;width:560px;height:537px;background:#0f172a;border-right:3px solid #334155} .big{color:#F3EEE8;font-size:34px;line-height:46px} .big b{color:#7dd3fc} .am{color:#fbbf24} .mono{font-family:'DejaVu Sans Mono',monospace}`;
const BAR = { modA: 'the Modeller</b>, opened on the architecture model as extracted from the author\'s IFC: the Upgrade button', modB: 'the Modeller</b>, opened on JPAM_base.db, the combined model with no added part: the Upgrade button', view: 'the Viewer</b>, opened on JPAM_film.db, parts view on' };
const hl = (s) => esc(s).replace(/-&gt; (PASS|INCONCLUSIVE)\s*$/, '<span class="ok">-&gt; $1</span>').replace(/-&gt; FAIL\s*$/, '<span class="no">-&gt; FAIL</span>').replace(/^(§[A-Z0-9_]+)/, '<span class="tag">$1</span>');
const barHtml = (kind, extra) => '<div class="bar">▼ <b>' + BAR[kind] + (extra ? ' · <b>' + extra + '</b>' : '') + '<i>Palm Jebel Ali Mosque</i></div>';
const termHtml = (o) => { const cmd = o.cmd.slice(0, o.k == null ? o.cmd.length : o.k); return '<div class="term"><div class="scr" style="top:-' + (o.off || 0) + 'px"><div class="cmd' + (o.find ? ' cmdf' : '') + (o.click ? ' cmdc' : '') + '">' + esc(cmd) + (o.done ? '' : '<span class="cur"></span>') + '</div>' + (o.done ? (o.ans || []).map((a) => '<div class="ans">' + a + '</div>').join('') : '') + '</div></div>'; };
const page = (inner, kind) => '<!doctype html><html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + inner + '</body></html>';
// ---- the lower frames (crops of the capture; every number on them is read from viewer.json / modeller.json)
const SC = { x0: 50, y0: 196, w: 830 }, ZS = 1360 / SC.w, ZP = 2.0;   // the Viewer's scene pane (CSS px of the 1280x720 capture) and the panel zoom
const bg = (rel, z, x0, y0) => 'background-image:url(' + url(rel) + ');background-size:' + (1280 * z) + 'px ' + (720 * z) + 'px;background-position:' + (-x0 * z) + 'px ' + (-y0 * z) + 'px';
const scenePane = (rel) => '<div style="left:560px;top:0;width:1360px;height:537px;' + bg(rel, ZS, SC.x0, SC.y0) + '"></div>';
const slice = (rel, y0, h, top) => '<div style="left:0;top:' + top + 'px;width:560px;height:' + (h * ZP) + 'px;' + bg(rel, ZP, 988, y0) + '"></div>';
const lfModeller = (rel) => '<div class="lf"><div style="left:0;top:0;width:1920px;height:537px;' + bg(rel, 1.5, 0, 181) + '"></div></div>';
const lfFindBefore = (b) => '<div class="lf"><div class="lp"></div>' + slice(b.before, 54, 268, 0) + scenePane(b.before) + '</div>';
const lfFindResult = (b, total, kindWord) => '<div class="lf"><div class="lp"></div>' + slice(b.result, 56, 38, 0) + slice(b.result, 412, 160, 90) + '<div class="am big" style="left:20px;top:430px;width:520px;height:100px;background:none"><span class="mono">' + esc(b.panel.count) + '</span> in the panel<br>' + nf(total) + ' ' + esc(kindWord) + ' in the model</div>' + scenePane(b.result) + '</div>';
const flyNums = (cam, tg) => { const d3 = (a, c) => Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]); return { cam: d3(cam.p, tg), tgt: d3(cam.t, tg) }; };
const lfFindFly = (b, rel, cam, kindWord, storey) => { const n = flyNums(cam, b.target.true_c); return '<div class="lf"><div class="lp"></div>' + slice(rel, 56, 38, 0) + slice(rel, 412, 66, 90) + '<div class="big" style="left:20px;top:250px;width:520px;height:280px;background:none">' + esc(b.target.cls) + '<br>' + esc(storey) + '<br><span class="am mono">camera ' + n.cam.toFixed(2) + ' m<br>target ' + n.tgt.toFixed(4) + ' m</span><br>from the part\'s own bounds</div>' + scenePane(rel) + '</div>'; };
const lfViewerWhole = () => '<div class="lf"><div class="lp"></div><div class="big" style="left:24px;top:26px;width:520px;height:480px;background:none"><span class="am">PARTS VIEW</span><br><b>' + nf(F.viewer.hostsHidden) + '</b> hosts hidden<br><b>' + nf(F.viewer.partsShown) + '</b> parts shown<br><span class="mono" style="font-size:26px;line-height:36px">isolate ' + nf(F.viewer.isolate_start) + ' of ' + nf(F.viewer.elements) + ' elements</span></div>' + scenePane(V.whole) + '</div>';

// ---- rc3: the Upgrade pill beats (clicked, not typed). Left: the dialog row the click is on, at zoom; right: the Modeller's scene (left of the dialog while it is open, centred on the canvas while framing)
const OUTL = 242;   // the Outliner's right edge (CSS px of the 1280x720 capture)
// rc4 S3: the dialog comes from its own clip (<shot>.panel.png); the scene shot has the dialog hidden, so the scene pane shows the whole canvas right of the Outliner
const clipOf = (rel) => rel && fs.existsSync(path.join(WORK, rel + '.panel.png')) ? rel + '.panel.png' : null;
const panelPane = (rel, panel, row) => { const c = clipOf(rel); if (!c) return ''; const z = 560 / panel.w, h = 537 / z, y0 = row ? Math.max(0, Math.min(row.y - panel.y - 24, row.y - panel.y + row.h + 16 - h)) : 0;
  return '<div style="left:0;top:0;width:560px;height:537px;background-image:url(' + url(c) + ');background-repeat:no-repeat;background-size:' + (panel.w * z) + 'px ' + (panel.h * z) + 'px;background-position:0px ' + (-y0 * z) + 'px"></div>'; };
const SZ = 1360 / (1280 - OUTL);
const sceneBox = (rel) => '<div style="left:560px;top:0;width:1360px;height:537px;' + bg(rel, SZ, OUTL, 360 - 537 / SZ / 2) + '"></div>';
const lfPill = (rel, J, row, mid, leftRel) => '<div class="lf"><div class="lp"></div>' + panelPane(clipOf(rel) ? rel : leftRel, J.rects.panel, row) + sceneBox(rel) + '</div>';
const PZ = 560 / PB.rects.panel.w;
// rc4 S1: the toolbar with the arrow ringed, before the dialog opens (how to reach the pill)
const lfPillIcon = (rel, J) => { const pr = J.rects.pill, z = 1.75, x0 = 1280 - 320, y0 = 0; return '<div class="lf"><div class="lp"></div><div style="left:0;top:0;width:560px;height:537px;' + bg(rel, z, x0, y0) + '"></div>'
  + '<div style="left:' + ((pr.x - x0) * z - 10) + 'px;top:' + ((pr.y - y0) * z - 10) + 'px;width:' + (pr.w * z + 20) + 'px;height:' + (pr.h * z + 20) + 'px;border:6px solid #fbbf24;border-radius:50%;background:none"></div>'
  + '<div class="am big" style="left:20px;top:440px;width:520px;height:90px;background:none">the arrow: <b>Upgrade</b></div>' + sceneBox(rel) + '</div>'; };
const P = F.pill, pageLine = (l) => '<span>' + hl(String(l || '').replace(/^§LODUP (?=§)/, '')) + '</span>';
const CLICK = { mod_open: ['B', 'Upgrade (the arrow, top right)'], mod_layers: ['A', 'Run · Layers'], mod_joints: ['B', 'Run · Steel joints'], mod_gussets: ['B', 'Run · Bracing gussets'], mod_beambars: ['B', 'Load schedule… · Run · Beam rebar (schedule)'], mod_ifc: ['B', 'Add-on IFC · Load frame… · Add-on IFC'] };
const LIVE_SPEED = 4;   // the beam rebar run is shown 4 times faster than it ran (said on the bar)
function pillBeat(id) {
  const [m, label] = CLICK[id], J = m === 'A' ? PA : PB, b = J.beats[id], kind = 'mod' + m, list = [];
  const add = (ans, lf, frames, extra, click) => list.push({ ans, lf, frames, extra, click });
  const fr = (pfx) => b.frames.map((f) => f);
  if (id === 'mod_open') {
    const rowsTxt = b.panel.rows.map((r) => '<b>' + esc(r.label) + '</b>: applies to <b>' + esc(String(r.applies).trim()) + '</b>');
    add([], lfPillIcon(b.before, J), 42, 'the Upgrade pill: the up arrow at the top right of the toolbar'); add([], lfPillIcon(b.before, J), 6, 'the Upgrade pill: the up arrow at the top right of the toolbar', true);
    add([pageLine(b.lines.find((l) => /§LODUP_PANEL open=true/.test(l)))].concat(rowsTxt), lfPill(b.after, J, null, false), null);
    return { id, kind, label, list };
  }
  const ansRun = { mod_layers: [P.lines.layers_built, P.lines.layers, b.lines.find((l) => /§LODUP_YIELD/.test(l))], mod_joints: [P.lines.joints_rules, P.lines.joints_clear, P.lines.joints, 'configuration only, capacity not checked'],
    mod_gussets: [P.lines.gussets, b.lines.find((l) => /§LODUP_GUSSET_RULES/.test(l)), 'configuration only, capacity not checked'], mod_beambars: [P.lines.beambars_built, P.lines.beambars, P.lines.beambars_yield] }[id];
  if (id === 'mod_ifc') {
    add([], lfPill(b.before, J, b.row_before, false), 30, 'shown: only the ' + P.ifc.elements + ' added parts (the model hidden with the Outliner eye): every one goes in the file'); add([], lfPill(b.before, J, b.row_before, false), 6, 'shown: only the ' + P.ifc.elements + ' added parts (the model hidden with the Outliner eye): every one goes in the file', true);
    add([pageLine(P.lines.ifc_refused)], lfPill(b.refused, J, b.row_refused, false), 60, 'shown: only the ' + P.ifc.elements + ' added parts (the model hidden with the Outliner eye): every one goes in the file');
    add([pageLine(P.lines.ifc_refused), '<b>Load frame…</b> ' + esc(P.ifc.frame_text || '') + ' <span class="tag">(storey heights only: no site placement, no shift)</span>'], lfPill(b.framed, J, b.row_framed, false), 48, 'shown: only the ' + P.ifc.elements + ' added parts (the model hidden with the Outliner eye): every one goes in the file');
    add([pageLine(P.lines.ifc_refused), '<b>Load frame…</b> ' + esc(P.ifc.frame_text || ''), pageLine(P.lines.ifc_mesh), pageLine(P.lines.ifc), '<span class="tag">downloaded file, witness_lodup_ifc_check.py:</span> ' + P.ifc.check.map((l) => esc(l.replace(/^§LODUP_IFC_PY_(\w+) .*-> (\w+)$/, '$1 $2'))).join(' · '), '<b>saved as</b> <span class="tag">' + esc(P.ifc.file || '') + '</span> (' + P.ifc.mb + ' MB, the browser\'s download folder)'], lfPill(b.after, J, b.row_after, false), null, 'shown: only the ' + P.ifc.elements + ' added parts (the model hidden with the Outliner eye): every one goes in the file');
    return { id, kind, label, list };
  }
  const ans = ansRun.filter(Boolean).map((l) => /^§/.test(l) ? pageLine(l) : '<b>' + esc(l) + '</b>');
  if (id === 'mod_beambars') ans.push('<span class="tag">the schedule check (the rule run\'s own log, the same ' + P.beambars.sets + ' sets):</span> ' + hl(F.lines.PJRB_STATED.text));
  add([], lfPill(b.before, J, b.row_before, false), 18); add([], lfPill(b.before, J, b.row_before, false), 6, null, true);
  if (id === 'mod_beambars') {
    add(['<b>' + esc((b.panel_loaded.rows.find((r) => r.id === 'beambars') || {}).text || '') + '</b>'], lfPill(b.loaded, J, b.row_loaded, false), 36);
    b.live.forEach((x, i) => { const nx = b.live[i + 1], dt = (nx ? nx.t : b.run_s) - x.t; add(['<b>' + esc(x.status || '') + '</b>'], lfPill(x.f, J, b.row_loaded, false), Math.max(1, Math.round(dt * 24 / LIVE_SPEED)), 'run shown ' + LIVE_SPEED + 'x faster (' + b.run_s.toFixed(0) + ' s)'); });
  }
  add(ans, lfPill(b.after_panel, J, b.row_after, false), 36);
  b.frames.forEach((f) => add(ans, lfPill(f, J, b.row_after, true, b.after_panel), 1));
  add(ans, lfPill(b.after, J, b.row_after, true, b.after_panel), null);
  return { id, kind, label, list };
}
// ---- the terminal answers (verbatim log lines; the Find answers are read from the panel and the DB)
const cmdAns = (c) => c.answers.map((l) => '<span>' + hl(l) + '</span>');
const kindWord = { find_layer: 'layer parts', find_fin: 'fin plates', find_rebar: 'bar sets', find_gusset: 'gusset parts' }, termKey = { find_layer: 'layer', find_fin: 'Fin plate', find_rebar: 'reinforcing', find_gusset: 'gusset' };
const findAns = (id) => { const b = V.beats[id], t = F.find[termKey[id]]; return ['<b>' + esc(b.panel.count) + '</b> in the panel · <b>' + nf(t.total) + '</b> ' + esc(kindWord[id]) + ' in the model (counted on the database)', 'flying to <b>' + esc(b.target.cls) + '</b> · ' + esc(b.target.storey), esc(b.target.name)].concat(['isolated: <b>' + b.iso.siblings + '</b> parts of the same host' + (b.iso.host ? ' + its host' : '') + ' · pulled back with the wheel']).concat(id === 'find_fin' ? ['the Find landed <b>' + (b.fly.miss_m * 1000).toFixed(0) + ' mm</b> from the part\'s own bounds centre (' + F.centre['GEN-CR-'].n + ' connection parts re-centred, each on its own bounds)'] : []); };
// ---- the beats' stills
const stills = {}, B = {};
const MODB = { mod_conn: 'conn', mod_layers: 'layers', mod_rebar: 'rebar', mod_gusset: 'gusset' };
const SCROLL_PX = 3, HOLD = 12;
function typedBeat(id, o) {   // o: {cmd, find, ans[], kind, before(lf html), fly: [{lf html}], after(lf html)}
  const st = [], t = (k, done, off) => page(termHtml({ cmd: o.cmd, k, done, ans: o.ans, off, find: o.find }) + barHtml(o.kind) + o.before);
  st.push({ html: t(0, false, 0), frames: 14 });
  for (let k = 1; k <= o.cmd.length; k++) st.push({ html: t(k, false, 0), frames: 1, key: 'k' });
  st.push({ html: t(o.cmd.length, false, 0), frames: 8, key: 'r' });
  B[id] = { o, t, st }; return B[id];
}
// ---- build every beat
const MODFLY = (b, id) => b.frames.map((f) => ({ lf: lfModeller(f) }));
function build() {
  Object.keys(CLICK).forEach((id) => { B[id] = { pill: pillBeat(id) }; });
  Object.keys(termKey).forEach((id) => { const b = V.beats[id], tk = termKey[id], total = F.find[tk].total, o = { cmd: tk, find: true, kind: 'view', ans: findAns(id), before: lfFindBefore(b) }; const bt = typedBeat(id, o);
    bt.result = lfFindResult(b, total, kindWord[id]); const BL = BLANK; bt.fly = b.fly.frames.map((f, i) => ({ f, i })).filter((x) => !(BL[x.f] != null && BL[x.f] < 0.02)).map((x) => ({ lf: lfFindFly(b, x.f, b.fly.cams[x.i], kindWord[id], b.target.storey), n: 1 }));
    console.log('§FILM_BLANK_DROP beat=' + id + ' fly_frames=' + b.fly.frames.length + ' dropped=' + (b.fly.frames.length - bt.fly.length) + ' (the isolated part is under 2 % of the scene: empty sky; blank_scan.py viewer)');
    let lastCam = b.fly.cams[b.fly.cams.length - 1];
    bt.afterLf = lfFindFly(b, b.after, lastCam, kindWord[id], b.target.storey); bt.find = true; });
}
// ---- the full cards
const CH = `.ch{text-align:center;padding-top:200px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:104px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .p{font-size:32px;color:#94a3b8;margin-top:44px}
.w{position:absolute;left:70px;right:70px;top:34px} .w .k{font-size:28px;letter-spacing:5px} .w h1{font-size:60px;margin-top:12px;color:#F3EEE8;line-height:1.1}
.r{display:flex;align-items:baseline;margin-top:20px;border-bottom:2px solid #1e293b;padding-bottom:12px} .r .n{width:210px;text-align:right;font-size:70px;font-weight:700;color:#7dd3fc;padding-right:34px} .r .d{flex:1;font-size:36px;color:#F3EEE8;line-height:1.25} .r .d small{display:block;font-size:27px;color:#94a3b8;margin-top:4px}
.cmp .r{margin-top:8px;padding-bottom:4px} .cmp .r .n{font-size:50px} .cmp .r .d{font-size:30px} .cmp .r .d small{font-size:21px;margin-top:0} .cmp h1{font-size:52px}
.red{color:#f87171;font-weight:700} .sm{font-size:21px;color:#94a3b8;margin-top:16px;font-family:'DejaVu Sans Mono',monospace;line-height:1.35;word-break:break-all}
.two{display:flex;gap:46px;margin-top:20px} .two>div{flex:1;font-size:24px;line-height:1.28;color:#F3EEE8} .two h3{font-size:25px;color:#FF6B78;letter-spacing:3px;margin-bottom:8px} .two .g{color:#94a3b8} .two .y{color:#fbbf24} .two .ok{color:#4ade80;font-weight:700}`;
const fullPage = (inner) => '<!doctype html><html><head><meta charset="utf-8"><style>' + CSS.replace(/\.bar\{[^}]*\}/, '') + CH + '</style></head><body>' + inner + '</body></html>';
const verdict = (tag) => { const m = /-> (\w+)\s*$/.exec((F.lines[tag] || {}).text || ''); return m ? m[1] : '?'; };
const orig = F.counts.elements - F.counts.added;
const CARDS = {
  cover: '<div class="ch"><div class="k">LOD 400 UPGRADE  ·  CH 1</div><div class="t1">Finding the added work</div><div class="p">Palm Jebel Ali Mosque  ·  rule-based detail on the author\'s own model</div></div>',
  added: '<div class="w"><div class="k">WHAT THE UPGRADE BUTTON ADDED</div><h1>Palm Jebel Ali Mosque</h1>'
    + '<div class="r"><div class="n">' + F.counts.layer + '</div><div class="d">layer parts<small>walls, floors and ceilings split into their material layers</small></div></div>'
    + '<div class="r"><div class="n">' + F.counts.conn + '</div><div class="d">fin plates, bolts and welds<small>' + F.conn.joints + ' steel joints · configuration only, capacity not checked</small></div></div>'
    + '<div class="r"><div class="n">' + F.counts.rebar + '</div><div class="d">reinforcing bar sets<small>' + F.rebar.beams + ' concrete beams, from the S-401 schedule · <span class="red">schedule check ' + F.rebar.stated_verdict + ': ' + F.rebar.mismatches + ' sets on ' + F.rebar.beams_affected + ' beams differ</span></small></div></div>'
    + '<div class="r"><div class="n">' + F.counts.gusset + '</div><div class="d">gusset parts<small>' + F.gusset.generated + ' of ' + F.gusset.total + ' brace ends · configuration only, capacity not checked</small></div></div>'
    + '<div class="sm">' + F.counts.layer + ' + ' + F.counts.conn + ' + ' + F.counts.rebar + ' + ' + F.counts.gusset + ' = <span style="color:#fbbf24">' + F.counts.added + ' parts added</span> · ' + nf(orig) + ' original elements + ' + F.counts.added + ' = ' + nf(F.counts.elements) + '  (§FILMDB_COUNTS ' + verdict('FILMDB_COUNTS') + ')</div><div class="sm">the button made ' + F.pill.same_parts.made + ' parts, the very ' + F.pill.same_parts.film_db + ' GUIDs of the film DB the Viewer opens next (§FILM_RC3_SAME_PARTS ' + (F.pill.same_parts.ok ? 'PASS' : 'FAIL') + ')</div></div>',
  gus_card: '<div class="w cmp"><div class="k">GUSSET  ·  1 OF 57</div><h1>One gusset was built</h1>'
    + '<div class="r"><div class="n">' + F.gusset.total + '</div><div class="d">brace ends judged</div></div>'
    + '<div class="r"><div class="n">' + F.gusset.generated + '</div><div class="d">built<small>configuration only, capacity not checked</small></div></div>'
    + [['REFUSED_CLASH', 'would clash with a neighbouring element'], ['NO_ROOM', 'no room for the first bolt at the end of the angle'], ['NO_ATTACHMENT', 'nothing to attach to within reach'], ['GAP_TOO_LARGE', 'gap too large for a filler']].map(([k, w]) => '<div class="r"><div class="n" style="color:#f87171">' + F.gusset.refused[k] + '</div><div class="d">refused: ' + w + '<small>' + k + '</small></div></div>').join('')
    + '<div class="sm">' + F.gusset.generated + ' + ' + Object.values(F.gusset.refused).join(' + ') + ' = ' + (F.gusset.generated + F.gusset.refused_sum) + '</div><div class="sm">' + esc(F.lines.GUS_COUNTS.text) + '</div></div>',
  close: (() => { const vs = (t) => t + ' ' + verdict(t), g = F.guide;
    return '<div class="w"><div class="k">WHAT THIS FILM READ AND USED</div><h1>Added by rule, found by Find</h1><div class="two">'
    + '<div><h3>PRIOR ART READ</h3><span class="g">bim-ootb viewer/nf_panel_search.js</span>: Find\'s own search and its fly-to step (0.02 per frame), reused for the frames<br><span class="g">viewer/parts_view.js</span>: a host that has parts is hidden<br><span class="g">modeller/modeller.html</span>: the Modeller\'s own 1100 ms framing<br><span class="g">modeller/lod/</span>: the Upgrade button, the same rules as the Python runs<br><span class="g">AISC 360-16 J2.4, J5.2</span>: read by the upgrade lane (LOD400 scope §8)<br><span class="g">scripts/film_cli_in_action</span>: the split screen and typed-line house style'
    + '<h3 style="margin-top:14px">KEY SOUNDS</h3>eklee, qubodup (CC BY 3.0, opengameart.org)</div>'
    + '<div><h3>CREDENTIALS</h3>bim-ootb <span class="y">#3219</span> unique ids on Save as IFC · <span class="y">#3223</span> parts view · <span class="y">#3231</span> Find keeps it, space in the box · <span class="y">#3232</span> Modeller seeds the parts · Upgrade button <span class="y">#3238 #3241 #3243 #3248 #3252 #3260 #3268 #3276 #3282</span><br>BIMCompiler <span class="y">#910</span> rebar from schedules · <span class="y">#919</span> PJAM beam rebar · <span class="y">#924</span> gussets · <span class="y">#927</span> add-on IFC · <span class="y">#928</span> weld winding<br>'
    + '<span class="g">verdicts, read from the logs:</span><br>' + ['FILMDB_IDENT', 'FILMDB_COUNTS', 'JPAM_IDENT', 'CONN_RULES', 'PJRB_INSIDE', 'GUS_RULES', 'GUS_COUNTS'].map((t) => '<span class="' + (verdict(t) === 'PASS' ? 'ok' : 'red') + '">' + vs(t) + '</span>').join(' · ')
    + '<br><span class="red">' + vs('PJRB_STATED') + '</span> <span class="g">(' + F.rebar.mismatches + ' sets, ' + F.rebar.beams_affected + ' beams)</span><br><span class="g">this film:</span> <span class="ok">§FILM_PANEL_CHECK ' + Object.keys(V.beats).filter((k) => V.beats[k].panel_check.ok).length + '/' + Object.keys(V.beats).length + ' PASS</span> · camera on the part ' + Object.keys(V.beats).filter((k) => V.beats[k].fly.miss_m <= 0.06).length + '/' + Object.keys(V.beats).length + ' <span class="ok">(fin plate: the Find landed ' + (V.beats.find_fin.fly.miss_m * 1000).toFixed(0) + ' mm from the part)</span>'
    + '<h3 style="margin-top:14px">GUIDE</h3>' + (g.covers_the_added_work ? '<span class="ok">The Modeller guide has the Upgrade section</span> (packs, Run, Rules, Load schedule, change list, Add-on IFC)<br><span class="g">§FILM_GUIDE http=' + g.http + ' section anchor=' + (g.anchor_find_panel ? 'Y' : 'N') + '</span>' : '<span class="y">No guide section covers this yet</span>: the guide\'s LOD400 Upgrade section describes the geometry weld only. A gap to close before posting.<br><span class="g">§FILM_GUIDE ' + esc(g.url) + ' http=' + g.http + ' anchor=' + (g.anchor_find_panel ? 'Y' : 'N') + ' (Find panel only)</span>') + '</div></div>' + (g.covers_the_added_work ? '<div style="position:absolute;left:0;right:0;top:766px;font-size:28px;color:#7dd3fc;border-top:2px solid #1e293b;padding-top:10px;font-family:DejaVu Sans Mono,monospace">Guide: ' + esc(g.link) + '</div>' : '') + '</div>'; })()
};
// ---- render
(async () => {
  build();
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const tmp = path.join(out, '_tmp.html'), plan = {}; let n = 0, tall = 0, keys = 0, rets = 0, maxRows = 0;
  const shot = async (html, name, check) => { fs.writeFileSync(tmp, html); await pg.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
    const m = await pg.evaluate(() => { const t = document.querySelector('.term'), s = document.querySelector('.scr'), w = document.querySelector('.w, .ch'); let over = 0, wide = 0; if (w) { over = -9999; document.querySelectorAll('.w *, .ch *').forEach((e) => { const r = e.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect(); if (tr.right > 1900) wide = Math.max(wide, tr.right - 1900); if (r.bottom > 850 && r.bottom - 850 > over) { over = r.bottom - 850; window.__lowest = e.tagName + '.' + e.className + ' bottom=' + Math.round(r.bottom) + ' text=' + e.textContent.slice(0, 40); } }); }
      return { lowest: window.__lowest || '', sh: s ? s.scrollHeight : 0, termOver: t ? t.scrollWidth - t.clientWidth : 0, over, wide, imgs: Array.from(document.querySelectorAll('[style*=url]')).length }; });
    await pg.screenshot({ path: path.join(out, name) }); n++; return m; };
  for (const id of require('./narr.js').beats.map((x) => x.id)) {
    if (process.env.ONLY && process.env.ONLY.split(',').indexOf(id) < 0) continue;
    const st = []; plan[id] = st;
    if (CARDS[id]) { const m = await shot(fullPage(CARDS[id]), id + '_001.png'); const bad = Math.max(m.over, m.wide) > 0; if (m.over < -9000) m.over = 0; if (bad) tall++; console.log('§CARD beat=' + id + ' stills=1 overflow_px=' + Math.max(0, Math.round(Math.max(m.over, m.wide))) + (bad ? ' TOO-TALL lowest=' + m.lowest : '') + ' (full card, content above y=850)'); st.push({ file: id + '_001.png', frames: null }); continue; }
    if (id === 'viewer') { const m = await shot(page(termHtml({ cmd: '', k: 0, done: true, ans: [] }).replace('<div class="term">', '<div class="term" style="display:none">') + barHtml('view') + lfViewerWhole()), id + '_001.png'); console.log('§CARD beat=viewer stills=1 crop=scene(' + SC.x0 + ',' + SC.y0 + ',' + SC.w + ')@' + ZS.toFixed(3) + ' whole mosque, parts view ' + F.viewer.hostsHidden + '/' + F.viewer.partsShown); st.push({ file: id + '_001.png', frames: null }); continue; }
    const bt = B[id]; if (!bt) throw new Error('no beat builder for ' + id);
    if (bt.pill) { const pb = bt.pill, nm = (i) => id + '_' + String(i).padStart(3, '0') + '.png'; let i = 0, off = 0, rowsMax = 0, over = 0, scrolled = 0;
      for (let k = 0; k < pb.list.length; k++) { const x = pb.list[k], html = (o) => page(termHtml({ cmd: pb.label, k: pb.label.length, done: true, ans: x.ans, off: o, click: true }).replace('<span class="cur"></span>', '') + barHtml(pb.kind, x.extra) + x.lf);
        i++; const m = await shot(html(off), nm(i)); rowsMax = Math.max(rowsMax, Math.ceil(m.sh / ROW)); over = Math.max(over, m.termOver); const e = { file: nm(i), frames: x.frames }; if (x.click) e.click = true; st.push(e);
        const maxOff = Math.max(0, m.sh - TERM_H); if (maxOff > off && x.frames !== 1 && x.frames !== null) { const S = Math.ceil((maxOff - off) / SCROLL_PX); for (let f = 1; f <= S; f++) { off = Math.min(maxOff, off + SCROLL_PX); i++; await shot(html(off), nm(i)); st.push({ file: nm(i), frames: 1 }); scrolled++; } }
        else if (x.frames === null && maxOff > off) { st[st.length - 1].frames = HOLD; const S = Math.ceil((maxOff - off) / SCROLL_PX); for (let f = 1; f <= S; f++) { off = Math.min(maxOff, off + SCROLL_PX); i++; await shot(html(off), nm(i)); st.push({ file: nm(i), frames: 1 }); scrolled++; } st[st.length - 1].frames = null; } }
      if (over > 0) tall++; maxRows = Math.max(maxRows, rowsMax);
      console.log('§CARD beat=' + id + ' stills=' + st.length + ' clicked="' + pb.label + '" (not typed: no key sound; the voice starts at the click still) terminal_rows=' + rowsMax + ' (strip holds ' + Math.floor(TERM_H / ROW) + ') scroll_frames=' + scrolled + ' cmd_overflow_px=' + Math.max(0, over) + (over > 0 ? ' TOO-WIDE' : '') + ' crop=dialog row@' + PZ.toFixed(3) + ' + scene@' + SZ.toFixed(3));
      continue; }
    const o = bt.o, name = (i) => id + '_' + String(i).padStart(3, '0') + '.png'; let i = 0, worstRows = 0, worstOver = 0;
    // typing stills (+ return)
    for (const s of bt.st) { i++; const m = await shot(s.html, name(i)); worstOver = Math.max(worstOver, m.termOver); const e = { file: name(i), frames: s.frames }; if (s.key) { e.key = s.key; if (s.key === 'k') keys++; else rets++; } st.push(e); }
    // answers: measured once at offset 0, then the scroll
    const termWith = (off, lf) => page(termHtml({ cmd: o.cmd, k: o.cmd.length, done: true, ans: o.ans, off, find: o.find }) + barHtml(o.kind) + lf);
    const first = bt.modeller ? bt.fly[0].lf : bt.result; i++; const m0 = await shot(termWith(0, first), name(i)); const H = m0.sh, maxOff = Math.max(0, H - TERM_H); worstRows = Math.max(worstRows, Math.ceil(H / ROW)); worstOver = Math.max(worstOver, m0.termOver);
    if (bt.modeller) { st.push({ file: name(i), frames: 1 }); for (let f = 1; f < bt.fly.length; f++) { i++; await shot(termWith(0, bt.fly[f].lf), name(i)); st.push({ file: name(i), frames: bt.fly[f].n }); } }
    else { st.push({ file: name(i), frames: 30 }); for (let f = 0; f < bt.fly.length; f++) { i++; await shot(termWith(0, bt.fly[f].lf), name(i)); st.push({ file: name(i), frames: bt.fly[f].n }); } }
    i++; await shot(termWith(0, bt.afterLf), name(i)); st.push({ file: name(i), frames: maxOff ? HOLD : 1 });
    if (maxOff) { const S = Math.ceil(maxOff / SCROLL_PX); for (let f = 1; f <= S; f++) { i++; await shot(termWith(Math.min(maxOff, f * SCROLL_PX), bt.afterLf), name(i)); st.push({ file: name(i), frames: 1 }); } }
    st[st.length - 1].frames = null;   // the last still holds for the rest of the beat
    maxRows = Math.max(maxRows, worstRows); if (worstOver > 0) tall++;
    console.log('§CARD beat=' + id + ' stills=' + st.length + ' typed=' + o.cmd.length + ' terminal_rows=' + worstRows + ' (strip holds ' + Math.floor(TERM_H / ROW) + ') scroll_px=' + maxOff + ' scroll_frames=' + (maxOff ? Math.ceil(maxOff / SCROLL_PX) : 0) + ' cmd_overflow_px=' + Math.max(0, worstOver) + (worstOver > 0 ? ' TOO-WIDE' : '') + ' crop=' + (bt.modeller ? 'window band(0,181,1280,358)@1.5' : 'panel slices@2.0 + scene(' + SC.x0 + ',' + SC.y0 + ',' + SC.w + ')@' + ZS.toFixed(3)));
  }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); try { fs.unlinkSync(tmp); } catch (e) { /* none */ }
  console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall + ' key_stills=' + keys + ' return_stills=' + rets + ' max_terminal_rows=' + maxRows + ' font=31px (one size for the whole film)');
  process.exit(tall ? 1 : 0);
})().catch((e) => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
