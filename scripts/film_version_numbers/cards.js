// ⚠ DO NOT REMOVE — film 6 PROMO "CH 0 · Built to be read" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6 PROMO SPEC; layout from film 4 LAYOUT v4, checks from film 5): the frames (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). READ out/cards.log after every run.
// VS CODE FILLS THE FRAME: every scene frame is the REAL VS Code window (a 1920x850 still shot by shoot.js, shown at its own size, never scaled: blue frame + tag "IN VS CODE"), under a 30 px PROGRESS STRIP and above a 30 px caption bar; where a line is typed, a green frame + tag
// "IN THE TERMINAL" round the terminal panel's REAL rectangle. The real app (or the file as the browser gets it) appears only as an INSET (672x320, violet frame + tag "IN THE VIEWER" / "IN THE BROWSER") where the change shows. The cover is the hook still with a title panel laid over it (no strip);
// the last card is full-screen text (no strip). The bottom 170 px stay empty for the captions. §VSC_FRAME marks every frame whose top area is the VS Code window (record.js sums them: §VSC_SHARE).
// FIVE FIXED CUES, the same for the same thing in every frame and on the last card (constants below; guard check C): EDITOR blue + arrow pointer · TERMINAL green · VIEWER violet (the app) · BROWSER violet (the file as the browser gets it) · ANSWER amber.
// MOTION (film 4 SCRIPT v4 item 5): the pointer is DRAWN along an eased path from a rest point to the target's REAL pixel rectangle (out/scene.json, read by shoot.js from the editor's own layout and cross-checked against the pixels by pointer.py), holds with a ripple, and THEN the result still (the real next state) appears.
// Every picture, line and number is read from out/; nothing is typed in here. Writes out/cards/plan.json and out/pointer_plan.json.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), SC = JSON.parse(fs.readFileSync(path.join(OUT, 'scene.json'), 'utf8')), NARR = require('./narr.js'), TY = require('./typed.js');
const SHOOT = fs.readFileSync(path.join(OUT, 'shoot.log'), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = f => pics[f] || (pics[f] = b64(f));
const CUE = { editor: { color: '#38bdf8', tag: 'IN VS CODE' }, term: { color: '#4ade80', tag: 'IN THE TERMINAL' }, view: { color: '#c084fc', tag: 'IN THE VIEWER' }, browser: { color: '#c084fc', tag: 'IN THE BROWSER' }, answer: { color: '#fbbf24' } };
const STEPS = ['1 Read = run', '2 The editor knows', '3 Refused', '4 Proven'];
const STRIP = 30, BAR = 30, VH = 850, IW = 672, IH = 320, IX = 1200, IY = STRIP + VH - IH - 40, REST = { x: 1560, y: 560 };
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden;position:relative}
.strip{position:absolute;left:0;top:0;width:1920px;height:${STRIP}px;display:flex;background:#0b1220;border-bottom:1px solid #1f2a3d} .strip span{flex:1;text-align:center;font-size:16px;line-height:${STRIP - 1}px;color:#64748b;white-space:nowrap} .strip span.on{background:#e2e8f0;color:#0b0f17;font-weight:700}
.vsc{position:absolute;left:0;width:1920px;height:${VH}px;overflow:hidden;background:#1e1e1e} .vsc img{position:absolute;left:0;top:0;width:1920px}
.fr-e{position:absolute;left:0;width:1920px;height:${VH}px;border:4px solid ${CUE.editor.color};z-index:5;pointer-events:none} .tag-e{position:absolute;right:10px;background:${CUE.editor.color};color:#04121f;font-weight:700;font-size:17px;padding:2px 10px;z-index:6}
.fr-t{position:absolute;border:4px solid ${CUE.term.color};z-index:5;pointer-events:none} .tag-t{position:absolute;background:${CUE.term.color};color:#04120a;font-weight:700;font-size:17px;padding:2px 10px;z-index:6}
.inset{position:absolute;left:${IX}px;top:${IY}px;width:${IW}px;height:${IH}px;overflow:hidden;background:#fff;z-index:4;border:4px solid ${CUE.view.color}} .inset img{position:absolute;left:-4px;top:-4px;width:${IW}px;height:${IH}px} .tag-v{position:absolute;left:${IX + 8}px;top:${IY - 30}px;background:${CUE.view.color};color:#1a0b2e;font-weight:700;font-size:17px;padding:2px 10px;z-index:6}
.bar{position:absolute;left:0;width:1920px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:18px;line-height:${BAR}px;padding:0 220px 0 28px;text-overflow:ellipsis;letter-spacing:1px;white-space:nowrap;overflow:hidden} .bar b{color:#7dd3fc} .bar i{color:#c084fc;font-style:normal;font-weight:700}
.ptr{position:absolute;z-index:8;width:28px;height:36px} .rip{position:absolute;z-index:7;border:3px solid ${CUE.editor.color};border-radius:50%} .ambbox{position:absolute;z-index:7;border:3px solid ${CUE.answer.color};border-radius:6px;box-shadow:0 0 14px ${CUE.answer.color}}`;
const stripHtml = step => '<div class="strip" data-step="' + step + '">' + STEPS.map((s, i) => '<span' + (step === i + 1 ? ' class="on"' : '') + '>' + esc(s) + '</span>').join('') + '</div>';
const png = name => path.join(OUT, 'stills', name + '.png'), dims = f => { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
// one scene frame: vsc = { still, term, over }, view = { still, kind: 'viewer'|'browser', over }, bar = [left, right]
const frame = (step, vsc, view, bar) => { const g = dims(png(vsc.still)); if (g.w !== 1920 || g.h !== VH) throw new Error('still ' + vsc.still + ' is ' + g.w + 'x' + g.h + ', the layout needs 1920x' + VH);
  let h = stripHtml(step) + `<div class="vsc" style="top:${STRIP}px" data-src="editor"><img src="${img(png(vsc.still))}"></div><div class="fr-e" style="top:${STRIP}px"></div><div class="tag-e" data-cue="editor" style="top:${STRIP + VH + 2}px">${CUE.editor.tag}</div>`;
  if (vsc.term) { const t = vsc.term; h += `<div class="fr-t" data-src="terminal" style="left:${t.x}px;top:${STRIP + t.y}px;width:${t.w}px;height:${t.h}px"></div><div class="tag-t" data-cue="terminal" style="left:${t.x + t.w - 200}px;top:${STRIP + t.y + t.h - 34}px">${CUE.term.tag}</div>`; }
  if (view) { const vg = dims(png(view.still)); if (vg.w !== IW || vg.h !== IH) throw new Error('inset ' + view.still + ' is ' + vg.w + 'x' + vg.h + ', needs ' + IW + 'x' + IH); const C = view.kind === 'browser' ? CUE.browser : CUE.view;
    h += `<div class="inset" data-src="viewer"><img src="${img(png(view.still))}"></div><div class="tag-v" data-cue="${view.kind === 'browser' ? 'browser' : 'view'}">${C.tag}</div>` + (view.over || ''); }
  h += (vsc.over || '') + `<div class="bar" style="top:${STRIP + VH}px">${bar[0]}${bar[1] ? ' &nbsp;·&nbsp; ' + bar[1] : ''}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${h}</body></html>`; };
const ptrSvg = (x, y) => `<svg class="ptr" style="left:${(x - 2).toFixed(1)}px;top:${(y - 2).toFixed(1)}px" viewBox="0 0 28 36" data-tip="${x.toFixed(1)},${y.toFixed(1)}"><path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill="#fff" stroke="#000" stroke-width="2"/></svg>`;
const rip = (c, r, o) => `<div class="rip" style="left:${(c.x - r).toFixed(1)}px;top:${(c.y - r).toFixed(1)}px;width:${2 * r}px;height:${2 * r}px;opacity:${o}"></div>`;
const ambBox = (r, o, keep) => `<div class="ambbox" data-keep="${keep || 'amber'}" style="left:${(r.x - 5).toFixed(1)}px;top:${(r.y - 4).toFixed(1)}px;width:${(r.w + 10).toFixed(1)}px;height:${(r.h + 8).toFixed(1)}px;opacity:${o}"></div>`;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const toCard = r => ({ x: r.x, y: r.y + STRIP, w: r.w, h: r.h }), toInset = r => ({ x: r.x + IX, y: r.y + IY, w: r.w, h: r.h });   // a rectangle in a VS Code still / in an inset picture -> the card
const pointerPlan = { strip: STRIP, rest: REST, moves: [] };
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden;position:relative}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:92px;font-weight:700;margin-top:18px;line-height:1.15} .s{font-size:38px;line-height:1.35;color:#cbd5e1;margin:26px auto 0;max-width:1100px}
.vsc{position:absolute;left:0;top:0;width:1920px;height:${VH}px;overflow:hidden;background:#1e1e1e} .vsc img{position:absolute;left:0;top:0;width:1920px}
.fr-e{position:absolute;left:0;top:0;width:1920px;height:${VH}px;border:4px solid ${CUE.editor.color};z-index:5;pointer-events:none} .tag-e{position:absolute;right:10px;top:${VH + 6}px;background:${CUE.editor.color};color:#04121f;font-weight:700;font-size:17px;padding:2px 10px;z-index:6}
.pn{position:absolute;left:300px;top:150px;width:1320px;height:470px;background:rgba(11,15,23,0.99);border:3px solid #FF6B78;border-radius:12px;z-index:7;text-align:center;padding-top:62px}`;
const full = inner => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`, CO = '<span style="color:#FF6B78">', CE = '</span>';
const stepOf = id => (NARR.beats.find(b => b.id === id) || {}).step || 0;
const cards = {};
// the cover: the hook still (the repo, opened in VS Code) with the title panel laid over it; no strip, the editor tag at the bottom right of the window
{ const hook = SC.beats.cover.items[0].still, g = dims(png(hook)); if (g.w !== 1920 || g.h !== VH) throw new Error('hook still size');
  cards.cover = [{ html: full(`<div class="vsc" data-src="editor"><img src="${img(png(hook))}"></div><div class="fr-e"></div><div class="tag-e" data-cue="editor">${CUE.editor.tag}</div><div class="pn"><div class="ch"><div class="k">CH 0</div><div class="t1">Built ${CO}to be read${CE}</div><div class="s">this codebase in VS Code</div></div></div>`), frames: null, kind: 'cover' }]; }
for (const id of Object.keys(SC.beats)) {
  if (id === 'cover') continue;
  const B = SC.beats[id], step = stepOf(id), A = []; const OV = it => (it.view ? { still: it.view, kind: it.viewKind || 'viewer' } : null);
  for (const it of B.items) {
    const bar = [it.view ? '▲ <b>VS Code</b> &nbsp;·&nbsp; ' + esc(it.label || '') : '▲ <b>VS Code</b>', it.view ? (it.viewKind === 'browser' ? '▼ <i>the file as the browser gets it</i>' : '▼ <i>the Viewer</i>, a headless browser') : esc(it.label || '')];
    const fr = (still, over, view, viewOver, term) => frame(step, { still, term: term || null, over: over || '' }, view ? Object.assign({}, view, { over: viewOver || '' }) : null, bar);
    const vOf = (name, kind) => name ? { still: name, kind: kind || it.viewKind || 'viewer' } : null;
    if (it.kind === 'still') A.push({ html: fr(it.still, '', vOf(it.view)), frames: it.frames || null, kind: 'still' });
    if (it.kind === 'type') {
      const vA = vOf(it.viewAns || it.view), v0 = vOf(it.view), vp = it.viewPulse ? toInset(it.viewPulse) : null;
      const amb = o => (it.pulse ? ambBox(toCard(it.pulse), o, 'answer-' + it.id) : ''), ambV = o => (vp ? ambBox(vp, o, 'answer-view-' + it.id) : '');
      A.push({ html: fr(it.start, '', v0, '', it.term), frames: it.first ? 14 : 4, kind: 'type' });
      it.keys.forEach(k => A.push({ html: fr(k, '', v0, '', it.term), frames: 1, kind: 'type', key: 'k' }));
      A.push({ html: fr(it.ret, '', v0, '', it.term), frames: 8, kind: 'type', key: 'r' });
      if (it.running) it.running.forEach(r => A.push({ html: fr(r, '', v0, '', it.term), frames: 8, kind: 'run' }));
      if (it.pulse || vp) [1, 0.35, 1].forEach(o => A.push({ html: fr(it.ans, amb(o), vA, ambV(o), it.term), frames: 5, kind: 'pulse' }));
      A.push({ html: fr(it.ans, (it.pulse || vp) ? amb(0.7) : '', vA, vp ? ambV(0.7) : '', it.term), frames: it.hold || 28, kind: 'answer' });
    }
    if (it.kind === 'ptr') {   // the pointer travels over the PRE still to the target's real rectangle, ripples, THEN the POST still (the real next state) appears
      const T = it.target; if (!T) throw new Error('beat ' + id + ' item ' + it.id + ' has no target rectangle'); const tc = { x: T.x + T.w / 2, y: STRIP + T.y + T.h / 2 }, N = 29, rest = it.rest || REST, vp = it.viewPulse ? toInset(it.viewPulse) : null;
      for (let i = 0; i <= N; i++) { const e = ease(i / N), x = rest.x + (tc.x - rest.x) * e, y = rest.y + (tc.y - rest.y) * e; A.push({ html: fr(it.pre, ptrSvg(x, y) + `<div data-keep="target-${it.id}" style="position:absolute;left:${T.x}px;top:${STRIP + T.y}px;width:${T.w}px;height:${T.h}px"></div>`, null), frames: 1, kind: 'move' }); pointerPlan.moves.push({ id: it.id, kind: 'move', i, x, y }); }
      [8, 16, 24, 32, 40].forEach((r, i) => { A.push({ html: fr(it.pre, ptrSvg(tc.x, tc.y) + rip(tc, r, (1 - i / 5).toFixed(2)), null), frames: 2, kind: 'ripple' }); pointerPlan.moves.push({ id: it.id, kind: 'ripple', i, x: tc.x, y: tc.y }); });
      A.push({ html: fr(it.post, ptrSvg(tc.x, tc.y) + (it.pulse ? ambBox(toCard(it.pulse), 1, 'answer-' + it.id) : ''), vOf(it.view), vp ? ambBox(vp, 1, 'answer-view-' + it.id) : ''), frames: it.frames === undefined ? null : it.frames, kind: 'popup' });
      pointerPlan.moves.push({ id: it.id, kind: 'popup', x: tc.x, y: tc.y, target: T, pre: it.pre, post: it.post });
    }
    if (it.kind === 'pulse') { const vr = it.viewRect ? toInset(it.viewRect) : null;
      [1, 0.35, 1].forEach(o => A.push({ html: fr(it.still, it.rect ? ambBox(toCard(it.rect), o, 'answer-' + it.id) : '', vOf(it.view), vr ? ambBox(vr, o, 'answer-view-' + it.id) : ''), frames: 5, kind: 'pulse' }));
      A.push({ html: fr(it.still, it.rect ? ambBox(toCard(it.rect), 0.7, 'answer-' + it.id) : '', vOf(it.view), vr ? ambBox(vr, 0.7, 'answer-view-' + it.id) : ''), frames: it.frames === undefined ? null : it.frames, kind: 'answer', w: it.w }); }
  }
  if (A.length && !A.some(x => x.frames == null)) A[A.length - 1].frames = null;   // a beat's last picture holds for the rest of the beat (the voice may outlast the typing)
  cards[id] = A; }

// the last card: what the film showed (every figure from its log), prior art, credentials, the guide link, the key sounds, what is drawn
{ const PA = require('./priorart.json'), C = F.credentials, ch = F.change, W = ch.witness, hv = n => ((new RegExp('§HOVER ' + n + ' .* text="(.*)"$', 'm').exec(SHOOT) || [])[1] || '').replace(/\\"/g, '"');
  const harm = (/^§HARM (.*)$/m.exec(SHOOT) || [])[1] || '', hf = k => (new RegExp('(?:^| )' + k + '=(\\S+)').exec(harm) || [])[1];
  const css = `<style>.lc{margin:96px 56px 0} .lc h1{font-size:42px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:600px 600px 560px;gap:34px;margin-top:20px}
    .col h2{font-size:20px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.32;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:56px;bottom:190px;font-size:17px;color:#94a3b8;width:1800px;line-height:1.4}</style>`;
  const saw = ['<b>1 Read = run</b><br>package.json: ' + F.b5.deps + ' dependencies, <i>' + F.b5.bundlers + '</i> bundlers, <i>' + F.b5.bundlerConfigs + '</i> bundler configs, no build script · the deploy strips whitespace: ' + esc(F.s1.minifyLine.replace(/^§PAYLOAD-MIN /, '')),
    '<b>2 The editor knows</b><br>Code Facts hovers: a shared name and a § tag, read-only, no network', '<b>3 Refused</b><br>' + esc(F.press.file) + ' saved: the warning, Bump, ' + esc(F.press.swFile) + ' CACHE_VERSION ' + F.press.sw_before + ' to ' + F.press.sw_after + '; the app offered the update (toast=' + hf('toast') + ') and showed the new words after it',
    '<b>4 Proven</b><br>the ' + F.s4.oldOf + ' new checks fail on the old code (' + F.s4.oldFailed + ' of ' + F.s4.oldOf + '), on the new code <i>claims=' + F.s4.claims + ' red=' + F.s4.red + '</i>; ' + ch.handBefore + ' hand-kept version numbers removed, ' + ch.handAfter + ' left'];
  const pa = PA.items.map(i => '<b>' + esc(i.name) + '</b><br>' + esc(i.does) + '<br><i>→ ' + esc(i.took) + '</i>');
  const cred = ['<b>bim-ootb</b> ' + Object.keys(C.ootb).map(n => '#' + n).join(' ') + ' merged', '<b>Witnessed</b><br>' + esc(['claims', 'red', 'outside_owned', 'verdict'].map(k => k + '=' + ((new RegExp(' ' + k + '=(\\S+)').exec(W.line) || [])[1])).join(' ')), '<b>Decisions</b><br>BIMCompiler ' + Object.keys(C.decisions).map(n => '#' + n).join(' '), '<b>Developer Guide</b><br>red1oon.github.io/BIMCompiler/DeveloperGuide/#51-any-edit-to-a-file-the-browser-loads'];
  const col = (h, rs) => '<div class="col"><h2>' + h + '</h2>' + rs.map(r => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full(css + '<div class="lc"><h1>What you saw, ' + CO + 'what it borrows' + CE + ', who stands behind it</h1><div class="cols">' + col('what you saw', saw) + col('prior art', pa) + col('credentials', cred) +
    '</div><div class="cr">Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real VS Code ' + esc(SC.vscode || '') + ' (throwaway profile, presentation settings only) and the real Viewer (headless on the CPU), shot from bim-ootb trees at ' + TY.SHA.after + ' and the one before it · the pointer path is drawn between real positions (the editor\'s own rectangles); windows, lines and numbers are real</div></div>'), frames: null, kind: 'close' }]; }

const order = NARR.beats.map(b => b.id);
console.log('§CUE_CONST editor=' + CUE.editor.color + '/' + CUE.editor.tag + ' terminal=' + CUE.term.color + '/' + CUE.term.tag + ' viewer=' + CUE.view.color + '/' + CUE.view.tag + ' browser=' + CUE.browser.color + '/' + CUE.browser.tag + ' answer=' + CUE.answer.color + ' steps=' + STEPS.length);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0, cueBad = 0, edFrames = 0, tmFrames = 0, vwFrames = 0, stripBad = 0, tagBad = 0, vscFrames = 0, insetBad = 0; const stripFrames = { Y: 0, N: 0 };
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(4, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate((CUE, expectStrip) => { const lc = document.querySelector('.lc'), chE = document.querySelector('.ch'), pn = document.querySelector('.pn'), imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .ch > div, .bar')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);
          const ed = document.querySelectorAll('[data-src="editor"]').length, tm = document.querySelectorAll('[data-src="terminal"]').length, vw = document.querySelectorAll('[data-src="viewer"]').length;
          const edEl = document.querySelector('.vsc'), edR = edEl && edEl.getBoundingClientRect(), vscFull = !!edR && edR.width >= 1900 && edR.height >= 840 && edR.top <= 40;   // the top area IS the real VS Code window
          const tags = Array.from(document.querySelectorAll('[data-cue]')).map(e => [e.getAttribute('data-cue'), e.textContent.trim(), getComputedStyle(e).backgroundColor]);
          const rgb = h => { const v = parseInt(h.slice(1), 16); return 'rgb(' + (v >> 16) + ', ' + ((v >> 8) & 255) + ', ' + (v & 255) + ')'; };
          const okTag = (kind, want) => { const ts = tags.filter(x => x[0] === kind); return ts.length === 1 && ts[0][1] === want.tag && ts[0][2] === rgb(want.color); };
          const kinds = Array.from(new Set(tags.map(x => x[0]))), want = { editor: CUE.editor, terminal: CUE.term, view: CUE.view, browser: CUE.browser };
          const cueOk = kinds.every(k => okTag(k, want[k])) && (ed ? kinds.includes('editor') : true) && (tm ? kinds.includes('terminal') : true) && (vw ? (kinds.includes('view') || kinds.includes('browser')) : true);
          const sEl = document.querySelector('.strip'), sR = sEl && sEl.getBoundingClientRect(); let stripOverlap = 0, stripWhat = '';   // CHECK S: the strip only where it should be; nothing visible inside its rows
          if (sEl) document.querySelectorAll('body *').forEach(e => { if (e.closest('.strip')) return; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return; const r = e.getBoundingClientRect(); let top = r.top, bottom = r.bottom, left = r.left, right = r.right;
            for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const ac = getComputedStyle(a); if (ac.overflow !== 'visible') { const ar = a.getBoundingClientRect(); top = Math.max(top, ar.top); bottom = Math.min(bottom, ar.bottom); left = Math.max(left, ar.left); right = Math.min(right, ar.right); } }
            if (right - left < 1 || bottom - top < 1) return; const ov = Math.min(bottom, sR.bottom) - Math.max(top, sR.top); if (ov > 0.5 && ov > stripOverlap) { stripOverlap = ov; stripWhat = (e.className && e.className.baseVal === undefined ? '.' + e.className : e.tagName) + ' y=' + top.toFixed(0) + '..' + bottom.toFixed(0); } });
          // CHECK G (film 5): no cue tag may touch a rectangle that is the point of a frame (data-keep: the pointer's target, the amber answer). CHECK I: the inset must not cover one either (the amber boxes inside the inset itself are its own)
          const hit = [], keeps = Array.from(document.querySelectorAll('[data-keep]')).map(e => [e.getAttribute('data-keep'), e.getBoundingClientRect()]), insR = (document.querySelector('.inset') || { getBoundingClientRect: () => null }).getBoundingClientRect();
          document.querySelectorAll('[data-cue]').forEach(t => { const tr = t.getBoundingClientRect(); keeps.forEach(([k, r]) => { if (r.width > 0 && r.right > tr.left && r.left < tr.right && r.bottom > tr.top && r.top < tr.bottom) hit.push(t.getAttribute('data-cue') + '>' + k); }); });
          const insHit = []; if (insR) keeps.forEach(([k, r]) => { if (!/^answer-view/.test(k) && r.width > 0 && r.right > insR.left && r.left < insR.right && r.bottom > insR.top && r.top < insR.bottom) insHit.push(k); });
          const bar = document.querySelector('.bar'), endY = bar ? bar.getBoundingClientRect().bottom : edR ? edR.bottom : 0;
          const over = Math.max(lc ? lc.getBoundingClientRect().bottom - (1080 - 170) : 0, lc ? 80 - lc.getBoundingClientRect().top : 0,   /* the mux burns a credit line into the top 80 px of the last frames (found by eye: it ran through the heading) */ endY - (1080 - 170), pn ? pn.getBoundingClientRect().bottom - 850 : 0,
            chE ? (() => { const r = Array.from(chE.children).map(e => e.getBoundingClientRect()); let o = 0; for (let i = 1; i < r.length; i++) o = Math.max(o, r[i - 1].bottom - r[i].top); return o; })() : 0,
            chE && pn ? Array.from(chE.children).reduce((w, e) => { const rg = document.createRange(); rg.selectNodeContents(e); const pr = pn.getBoundingClientRect(); return Array.from(rg.getClientRects()).reduce((mm, r) => Math.max(mm, 60 + pr.left - r.left, r.right - (pr.right - 60)), w); }, 0) : 0,
            chE && pn ? Array.from(chE.children).reduce((b, e) => Math.max(b, e.getBoundingClientRect().bottom), 0) - (pn.getBoundingClientRect().bottom - 30) : 0, wide);   // cover: the title text keeps 60 px inside its panel and 30 px above its bottom edge, no two lines overlap
          return { hit, insHit, strip: !!sEl, stripOverlap, stripWhat, stripOk: (!!sEl) === expectStrip && stripOverlap === 0, over, loaded: imgs.every(i => i.complete && i.naturalWidth > 0), ed, tm, vw, cueOk, vscFull }; }, CUE, !['cover', 'close'].includes(c.kind));
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); if (!m.cueOk) { cueBad++; console.log('§CUE_FAIL beat=' + id + ' file=' + name); } if (m.hit.length) { tagBad++; console.log('§TAG_OVERLAP beat=' + id + ' file=' + name + ' tag>point=' + m.hit.join(',')); } if (m.insHit.length) { insetBad++; console.log('§INSET_OVERLAP beat=' + id + ' file=' + name + ' inset covers ' + m.insHit.join(',')); }
        if (!m.stripOk) { stripBad++; console.log('§STRIP_FAIL beat=' + id + ' file=' + name + ' kind=' + c.kind + ' strip=' + (m.strip ? 'Y' : 'N') + ' expected=' + (['cover', 'close'].includes(c.kind) ? 'N' : 'Y') + ' overlap_px=' + m.stripOverlap.toFixed(1) + (m.stripWhat ? ' by ' + m.stripWhat : '')); }
        if (['cover', 'close'].includes(c.kind)) console.log('§CARD_STRIP beat=' + id + ' file=' + name + ' strip=' + (m.strip ? 'Y' : 'N') + ' overlap_px=' + m.stripOverlap.toFixed(1)); stripFrames[m.strip ? 'Y' : 'N']++; if (m.ed) edFrames++; if (m.tm) tmFrames++; if (m.vw) vwFrames++; if (m.vscFull) vscFrames++;
        if (m.over > 0) console.log('§CARD_OVER beat=' + id + ' file=' + name + ' kind=' + c.kind + ' overflow_px=' + m.over.toFixed(1)); worst = Math.max(worst, m.over); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = { name, vsc: m.vscFull }; n++; }
      const e = { file: made[c.html].name, frames: c.frames, kind: c.kind || 'card', vsc: made[c.html].vsc }; if (c.w) e.w = c.w; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); fs.writeFileSync(path.join(OUT, 'pointer_plan.json'), JSON.stringify(pointerPlan, null, 1));
  console.log('§CARD_STRIP_ALL unique_frames=' + n + ' with_strip=' + stripFrames.Y + ' without_strip=' + stripFrames.N + ' bad=' + stripBad);
  console.log('§CUE_CHECK unique_frames=' + n + ' editor_frames=' + edFrames + ' terminal_frames=' + tmFrames + ' viewer_frames=' + vwFrames + ' bad=' + cueBad);
  console.log('§TAG_CHECK unique_frames=' + n + ' overlaps=' + tagBad); console.log('§INSET_CHECK unique_frames=' + n + ' overlaps=' + insetBad); console.log('§VSC_FRAME unique_frames=' + n + ' top_area_is_vscode=' + vscFrames);
  console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
