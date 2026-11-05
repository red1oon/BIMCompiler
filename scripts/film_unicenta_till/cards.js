// ⚠ DO NOT REMOVE — Scope: the plain cards and chapter cards of "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34; FILM_NARRATION.md PLAYBOOK C picture rules). ImageMagick only, house typography, DejaVu Sans.
// Every digit on a card is a fact of out/facts.resolved.json (interpolated here, never typed) - guard.js scans the SPEC for strays. Chapter cards = plain #0b0f17, silent, no tags. Plain cards #0f172a, content above y=850 (bottom 230 px stay empty for subtitles).
// Usage: node cards.js render <outDir>   (writes <outDir>/<name>.png)   |   require('./cards.js').spec() for the guard.   READ THE LOG: out/cards.log
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), { LANG, SHARED, OUT } = require('./lang.js');
const FACTS = () => JSON.parse(fs.readFileSync(path.join(SHARED, 'facts.resolved.json'), 'utf8'));
// v4 (§34.G): FILM_LANG=zh renders every text through the translation table cards_zh.js (a missing entry THROWS: no card ever ships half-translated); CJK is drawn by ImageMagick with Noto Sans CJK SC (never ffmpeg drawtext).
const ZH = LANG !== 'en' ? require('./cards_' + LANG + '.js') : null, L = s => { if (!ZH) return s; if (!Object.prototype.hasOwnProperty.call(ZH, s)) throw new Error('§CARD_UNTRANSLATED ' + JSON.stringify(s)); return ZH[s]; };
// CJK glyph boxes are taller than DejaVu's: in zh the diagram labels shrink 10 % and the few tight title/sub pairs drop a little (numbers only; §CARD_FIT measures the widths)
const ZDY = { 'said plainly, so nobody finds it later': 16, 'The same till, now a browser tab: same operations, same books, same look as legacy.': 12, 'inside the shop': 10, '28  →  9': -30, '6  →  1': -30, 'step by step, then one click': 12, 'six screens, then one': 12, 'The parallel run compares the twin with real iDempiere, column by column': 10 }, zdy = t => (LANG === 'zh' && ZDY[t]) || 0;
const FONT = (bold) => LANG === 'zh' ? (bold ? 'Noto-Sans-CJK-SC-Bold' : 'Noto-Sans-CJK-SC') : (bold ? 'DejaVu-Sans-Bold' : 'DejaVu-Sans');
const CRL = '#ff9aa5', CORAL = '#FF6B78', OFF = '#F3EEE8', SKY = '#7dd3fc', MUT = '#C3C2B7', AMB = '#fbbf24', GRN = '#4ade80', INK = '#e2e8f0', BOXF = '#1e293b', BOXS = '#7dd3fc';
const box = (x, y, w, h, o) => ({ t: 'box', x, y, w, h, fill: (o && o.fill) || BOXF, stroke: (o && o.stroke) || BOXS });
const tx = (x, y, size, color, txt, o) => ({ t: 'text', x, y: y + zdy(txt) + (LANG === 'zh' && y === 92 && size === 26 ? 12 : 0), size, color, txt: L(txt), bold: !(o && o.light), center: o && o.center });
const arrow = (x1, y, x2, label) => ({ t: 'arrow', x1, y, x2, label });
// The AFTER diagram redrawn in the owner's own layout (p50 crop coordinates x,y in a 1781x767 panel, scaled by SC and placed at OX,OY), so BEFORE and AFTER read as a pair.
const PX = 180, PY = 140, SC = 1560 / 1781, GREENBG = '#aedc8a', DKG = '#4f7a28', YEL = '#ffff44', ORG = '#f96a00';
const gx = x => Math.round(PX + x * SC), gy = y => Math.round(PY + y * SC);
const prect = (x1, y1, x2, y2, fill) => ({ t: 'rect', x1: gx(x1), y1: gy(y1), x2: gx(x2), y2: gy(y2), fill });
const parrow = (pts, fill) => ({ t: 'poly', pts: pts.map(([x, y]) => gx(x) + ',' + gy(y)).join(' '), fill });
const ctx = (cx, y, size, color, txt, bold, mw) => ({ t: 'text', x: 0, y: gy(y) + zdy(txt), size: LANG === 'zh' ? Math.round(size * 0.9) : size, color, txt: L(txt), bold: bold !== false, cx: gx(cx), mw });
function afterDiagram() {
  return [prect(0, 0, 1781, 767, GREENBG), prect(35, 105, 347, 705, DKG), prect(777, 108, 1081, 700, DKG), prect(1466, 100, 1751, 707, DKG),
    prect(65, 272, 318, 603, YEL), prect(804, 283, 1057, 606, YEL), prect(1491, 278, 1727, 609, YEL),
    parrow([[352, 152], [728, 152], [728, 125], [775, 220], [728, 315], [728, 290], [352, 290]], ORG), parrow([[1087, 162], [1420, 162], [1420, 135], [1467, 232], [1420, 330], [1420, 303], [1087, 303]], ORG),
    parrow([[770, 548], [395, 548], [395, 525], [348, 605], [395, 692], [395, 668], [770, 668]], ORG), parrow([[1461, 532], [1135, 532], [1135, 508], [1087, 595], [1135, 685], [1135, 662], [1461, 662]], ORG),
    ctx(891, 20, 44, '#111111', 'HEAD OFFICE \u21c4 RELAY \u21c4 BROWSER TILL', false), ctx(191, 118, 30, '#ffffff', 'HEAD OFFICE'), ctx(930, 118, 30, '#ffffff', 'RELAY'), ctx(1608, 118, 26, '#ffffff', 'BROWSER TILL'),
    ctx(191, 305, 24, '#555555', 'MODEL', false), ctx(191, 350, 26, '#555555', 'Products'), ctx(191, 395, 26, '#555555', 'Prices'), ctx(191, 440, 26, '#555555', 'Stock'), ctx(191, 485, 26, '#555555', 'Day Close'),
    ctx(930, 385, 24, '#555555', 'MODEL', false), ctx(930, 430, 24, '#555555', 'sealed changes'), ctx(930, 475, 26, '#555555', 'a plain folder'),
    ctx(1608, 330, 24, '#555555', 'MODEL', false), ctx(1608, 375, 24, '#555555', 'own SQLite DB'), ctx(1608, 420, 26, '#555555', 'Sales, Tickets'), ctx(1608, 465, 26, '#555555', 'works offline'),
    ctx(552, 190, 22, '#ffffff', 'PROCESS', false), ctx(552, 225, 26, '#ffffff', 'SODA, morning batch'), ctx(1270, 190, 22, '#ffffff', 'PROCESS', false), ctx(1270, 225, 24, '#ffffff', 'Till fetches batch'),
    ctx(560, 565, 22, '#ffffff', 'PROCESS', false), ctx(560, 600, 26, '#ffffff', 'Branch Day Close'), ctx(1290, 555, 22, '#ffffff', 'PROCESS', false), ctx(1290, 590, 24, '#ffffff', 'EODA, day-end send')];
}

// v3 (2026-11-05, POS_PLUGIN_LOCAL_FIRST.md §34.E): the EXPAND slide. The right-hand stack of the AFTER opens into a BRANCH: several tills, each air-gapped on its own localhost, joined by a branch relay;
// one MAIN TILL holds HQ's stock figure, collects the others' order lines, and alone talks to the internet relay (EODA up, SODA down). DESIGN drawn, no number on any of these cards (nothing is measured yet).
const pframe = (x1, y1, x2, y2, color, w) => ({ t: 'frame', x1: gx(x1), y1: gy(y1), x2: gx(x2), y2: gy(y2), color, w });
const harrow = (xa, xb, yc, dir, fill) => { const base = xb - dir * 42, h = 14, hh = 32;
  return parrow([[xa, yc - h], [base, yc - h], [base, yc - hh], [xb, yc], [base, yc + hh], [base, yc + h], [xa, yc + h]], fill || ORG); };
const TX = [780, 1025, 1270, 1515], TW = 215, DKR = '#b3122a';
// o: relay (branch relay bar + connectors), arrows ('on' | 'off'), labels (SODA/EODA words), main (till A is the MAIN TILL), collect (connectors coral = order lines flow to the main till), note (lines in the branch foot)
function branchDiagram(o) {
  const ops = [prect(0, 0, 1781, 767, GREENBG), prect(35, 105, 270, 705, DKG), prect(380, 108, 600, 700, DKG), prect(760, 105, 1751, 707, DKG),
    prect(55, 272, 250, 603, YEL), prect(400, 283, 580, 606, YEL)];
  if (o.arrows === 'on') { ops.push(harrow(275, 375, 200, 1), harrow(375, 275, 560, -1), harrow(605, 755, 215, 1), harrow(755, 605, 345, -1)); }
  ops.push(ctx(891, 20, 40, '#111111', 'HEAD OFFICE ⇄ INTERNET RELAY ⇄ BRANCH', false), ctx(152, 118, 24, '#ffffff', 'HEAD OFFICE'), ctx(490, 118, 28, '#ffffff', 'RELAY'), ctx(1255, 118, 30, '#ffffff', 'BRANCH'),
    ctx(152, 305, 24, '#555555', 'MODEL', false), ctx(152, 350, 26, '#555555', 'Products'), ctx(152, 395, 26, '#555555', 'Prices'), ctx(152, 440, 26, '#555555', 'Stock'), ctx(152, 485, 26, '#555555', 'Day Close'),
    ctx(490, 330, 24, '#555555', 'INTERNET', false), ctx(490, 380, 20, '#555555', 'sealed changes'), ctx(490, 425, 22, '#555555', 'a plain folder'));
  if (o.labels) ops.push(ctx(680, 172, 17, '#111111', 'SODA, down'), ctx(680, 374, 17, '#111111', 'EODA, up'));
  for (let i = 0; i < 4; i++) { const mainTill = o.main && i === 0, x = TX[i], cx = x + TW / 2, y2 = mainTill ? 432 : 360;
    ops.push(prect(x, 160, x + TW, y2, YEL));
    if (mainTill) ops.push(pframe(x, 160, x + TW, y2, DKR, 7), ctx(cx, 170, 26, DKR, 'MAIN TILL', true, TW - 14));
    ops.push(ctx(cx, mainTill ? 215 : 180, 28, '#555555', 'TILL ' + 'ABCD'[i], true, TW - 14), ctx(cx, mainTill ? 262 : 230, 24, '#555555', 'localhost', true, TW - 14), ctx(cx, mainTill ? 300 : 268, 24, '#555555', 'air-gapped', true, TW - 14), ctx(cx, mainTill ? 338 : 306, 21, '#555555', 'own SQLite DB', false, TW - 14));
    if (mainTill) ops.push(ctx(cx, 370, 20, DKR, 'HQ stock figure', true, TW - 14), ctx(cx, 398, 20, DKR, '+ order lines', true, TW - 14));
    if (o.relay) ops.push(prect(cx - 6, y2, cx + 6, 470, o.collect && i > 0 ? CRL : (o.collect ? DKR : ORG)));
  }
  if (o.relay) ops.push(prect(780, 470, 1730, 545, '#0e7490'), ctx(1255, 485, 30, '#ffffff', 'BRANCH RELAY'), ctx(1255, 520, 20, '#e0f2fe', 'inside the shop', false));
  (o.note || []).forEach((n, i) => ops.push(ctx(1255, 575 + i * 42, 24, '#ffffff', n, i === 0)));
  return ops; }
const NOTE_FRAME = { exp2: ['Each till runs from its own copy, on its own localhost', 'no public address, no server to reach'], exp3: ['A dumb mailbox on the shop\'s own network', 'it carries the shop\'s own traffic, nothing else'],
  exp4: ['MAIN TILL: HQ\'s stock figure + the others\' order lines', 'Only the main till talks to the internet relay', 'Branch relay down? Every till keeps selling'],
  day1: ['SELLING: every till rings on its own localhost', 'nothing goes out to the internet while they sell'], day2: ['COLLECTING: the main till collects each till\'s order lines', 'since that till\'s last timestamp, never a line twice', 'running record: HQ stock figure minus the collected lines'],
  day3: ['END OF DAY: the main till\'s EODA is the single send', 'to the internet relay; head office picks it up from there'] };
function spec() {
  const F = {}; const fr = FACTS(); Object.keys(fr).forEach(k => { F[k] = fr[k].value; });
  const chap = (k, l1, l2, pl, sz) => ({ bg: '#0b0f17', ops: [{ t: 'ctext', y: 330, size: 34, color: CORAL, txt: L(k), spacing: 6 }, { t: 'ctext', y: 400, size: sz || 120, color: OFF, txt: L(l1), bold: true }, { t: 'ctext', y: 540, size: sz || 120, color: CORAL, txt: L(l2), bold: true }, { t: 'ctext', y: 700, size: 40, color: MUT, txt: L(pl) }] });
  const C = {
    // v4 (§34.G, owner 2026-11-05): the OPENING card, two-tone house typography: kicker coral, line 1 off-white, line 2 coral, the owner's sub line kept as he wrote it. Silent, 3.6 s, plain #0b0f17.
    ch0: chap('THE SQLITE WASM TILL', 'Unicenta POS integration', 'REBORN', 'Red1\'s ' + F.owner_2013 + ' work is now in local first SQLite WASM version', 100),
    ch1: chap('THE TILL', 'A till you', 'already know', 'uniCenta layout and flow, in a browser tab'),
    ch2: chap('THE RESTAURANT', 'Kitchen', 'and tables', 'floor map, Send Order, the kitchen screen'),
    ch3: chap('THE BRANCH DAY', 'End of day,', 'once', 'each till rings on its own, the main till collects, a single send'),
    ch4: chap('HEAD OFFICE', 'Head office,', 'next morning', 'one click closes the branch day'),
    ch5: chap('SODA', 'Only what', 'changed', 'the morning batch down to the tills'),
    ch6: chap('THE ORACLE', 'Same books', 'as legacy', 'compared with real iDempiere, column by column'),
    orig: { bg: '#0f172a', ops: [tx(120, 36, 44, SKY, F.year2011 + '  ·  Openbravo POS, from RED1\'s integration guide'), tx(120, 92, 26, MUT, 'The original sales screen of the owner\'s guide (copyleft RED1): Tools tiles, a ticket of Hoe and Rake-Bamboo'),
      { t: 'img', file: 'p23_screen.png', x: 240, y: 135, w: 1440 }] },
    before: { bg: '#0f172a', ops: [tx(120, 36, 44, SKY, 'BEFORE  ·  the owner\'s integration, ' + F.year2012), tx(120, 92, 26, MUT, 'Diagram: "ERP to POS integration model", from RED1\'s integration guide of ' + F.year2011 + ' (copyleft RED1)'),
      { t: 'img', file: 'p50_diagram.png', x: 180, y: 140, w: 1560 }] },
    after: { bg: '#0f172a', ops: [tx(120, 36, 44, GRN, 'AFTER  ·  the same three stacks, nothing to install'), tx(120, 92, 26, MUT, 'Same layout as the owner\'s diagram. Still delayed (end of day up, start of day down); no broker server to run.')].concat(afterDiagram()) },
    exp1: { bg: '#0f172a', ops: [tx(120, 36, 44, GRN, 'EXPAND  ·  the right-hand stack opens up into a branch'), tx(120, 92, 26, MUT, 'The AFTER diagram again, same three stacks. Watch the browser till on the right.')].concat(afterDiagram(), [pframe(1456, 90, 1761, 717, CORAL, 8)]) },
    exp2: { bg: '#0f172a', ops: [tx(120, 36, 44, GRN, 'EXPAND  ·  several tills, each air-gapped on its own localhost'), tx(120, 92, 26, MUT, 'The design of a branch, in the same layout as the owner\'s diagram.')].concat(branchDiagram({ arrows: 'on', note: NOTE_FRAME.exp2 })) },
    exp3: { bg: '#0f172a', ops: [tx(120, 36, 44, GRN, 'EXPAND  ·  a branch relay joins them, inside the shop'), tx(120, 92, 26, MUT, 'The design of a branch, in the same layout as the owner\'s diagram.')].concat(branchDiagram({ arrows: 'on', relay: true, note: NOTE_FRAME.exp3 })) },
    exp4: { bg: '#0f172a', ops: [tx(120, 36, 44, GRN, 'EXPAND  ·  one MAIN TILL talks to the internet relay'), tx(120, 92, 26, MUT, 'EODA goes up, SODA comes down: the same delayed relay as before, once per branch.')].concat(branchDiagram({ arrows: 'on', relay: true, labels: true, main: true, note: NOTE_FRAME.exp4 })) },
    day1: { bg: '#0f172a', ops: [tx(120, 36, 44, SKY, 'END OF DAY  ·  every till rings on its own'), tx(120, 92, 26, MUT, 'Design of the branch day. Nothing leaves the shop while the tills sell.')].concat(branchDiagram({ arrows: 'off', relay: false, note: NOTE_FRAME.day1 })) },
    day2: { bg: '#0f172a', ops: [tx(120, 36, 44, SKY, 'END OF DAY  ·  the main till collects'), tx(120, 92, 26, MUT, 'Design of the branch day. The collecting runs on the shop\'s own relay only.')].concat(branchDiagram({ arrows: 'off', relay: true, main: true, collect: true, note: NOTE_FRAME.day2 })) },
    day3: { bg: '#0f172a', ops: [tx(120, 36, 44, SKY, 'END OF DAY  ·  the main till\'s EODA is the one send'), tx(120, 92, 26, MUT, 'Design of the branch day. Head office picks the day up from the internet relay.')].concat(branchDiagram({ arrows: 'on', relay: true, labels: true, main: true, collect: true, note: NOTE_FRAME.day3 })) },
    gs: { bg: '#0f172a', ops: [tx(120, 110, 46, SKY, 'Branch Day Close  ·  before and after'),
      box(120, 220, 800, 330), tx(160, 270, 36, SKY, 'CLICKS'), tx(160, 360, 110, OFF, F.dc_before_g + '  →  ' + F.dc_after_g), tx(160, 480, 28, MUT, 'step by step, then one click'),
      box(1000, 220, 800, 330), tx(1040, 270, 36, SKY, 'SCREENS'), tx(1040, 360, 110, OFF, F.dc_before_s + '  →  ' + F.dc_after_s), tx(1040, 480, 28, MUT, 'six screens, then one'),
      tx(120, 610, 34, INK, 'Books: row difference ' + F.dc_rowdiff + ' against the step-by-step run'), tx(120, 665, 34, INK, 'Parts of the bill-of-materials item leave stock: ' + F.bom_a + ' · ' + F.bom_b + ' · ' + F.bom_c),
      tx(120, 740, 26, MUT, 'Counts are read off the menu path (model-derived), not a recording. Sources: §22, §25.R')] },
    match: { bg: '#0f172a', ops: [tx(120, 100, 46, SKY, 'Same books as legacy iDempiere'), tx(120, 160, 28, MUT, 'The parallel run compares the twin with real iDempiere, column by column'),
      tx(120, 230, 30, SKY, 'ITEM'), tx(900, 230, 30, SKY, 'RESULT'), tx(1200, 230, 30, SKY, 'WHAT WAS COMPARED'),
      tx(120, 290, 36, OFF, 'Replenish movement'), tx(900, 290, 36, GRN, 'MATCH'), tx(1200, 296, 26, INK, F.par_hdr + ' header + ' + F.par_line + ' line columns'),
      tx(120, 360, 36, OFF, 'Move confirmation'), tx(900, 360, 36, GRN, 'MATCH'), tx(1200, 366, 26, INK, 'created, then after Complete'),
      tx(120, 430, 36, OFF, 'Difference documents'), tx(900, 430, 36, GRN, 'MATCH'), tx(1200, 436, 26, INK, 'same lines, same warehouses'),
      tx(120, 500, 36, OFF, 'Storage'), tx(900, 500, 36, GRN, 'MATCH'), tx(1200, 506, 26, INK, 'same transactions, same delta'),
      tx(120, 570, 36, OFF, 'Price stamp'), tx(900, 570, 36, AMB, 'NOT COMPARED'), tx(1200, 576, 26, INK, 'legacy web service cannot edit it'),
      tx(120, 700, 26, MUT, 'Source: bridge run_all, cycle witness_soda_receipt_parity.js (§28.2.R). Legacy side = the pilot iDempiere.')] },
    notyet: { bg: '#0f172a', ops: [tx(120, 110, 56, AMB, 'NOT BUILT YET'), tx(120, 175, 28, MUT, 'said plainly, so nobody finds it later'),
      tx(120, 270, 31, OFF, '•  Decimals in text: legacy writes ' + F.open_dec + ', the twin writes ' + F.open_dec2 + '. A difference, not accepted (OPEN-1).'),
      tx(120, 360, 31, OFF, '•  Price-change stamp: not compared with legacy (OPEN-2).'),
      tx(120, 450, 31, OFF, '•  A pair of tills on one table over a real relay: not proven.'),
      tx(120, 540, 31, OFF, '•  Memory with all the pictures loaded: not measured.'),
      tx(120, 700, 26, MUT, 'Sources: §28.3, §32.R')] },
    credits: { bg: '#0f172a', ops: [tx(120, 105, 52, SKY, 'uniCenta POS, reborn'), tx(120, 175, 36, CORAL, 'The same till, now a browser tab: same operations, same books, same look as legacy.'),
      tx(120, 280, 30, OFF, 'Prior art: the owner\'s own ' + F.year2012 + ' Openbravo POS \u2192 ADempiere / iDempiere integration over ActiveMQ,'),
      tx(120, 325, 30, OFF, 'the delayed EODA / SODA relay (copyleft RED1)'),
      tx(120, 400, 30, OFF, 'uniCenta oPOS (GPL): layout and flow followed. No code or artwork copied.'),
      tx(120, 465, 30, OFF, 'Product pictures: Fluent Emoji (MIT licence)'),
      tx(120, 530, 30, OFF, 'Legacy iDempiere is the oracle for every comparison'),
      tx(120, 640, 30, MUT, 'github.com/red1oon/BIMCompiler   ·   red1org@gmail.com')] }
  };
  return C;
}
// width of a text op as ImageMagick will draw it (the same font and size); the card is refused when a text leaves the page or its box (§CARD_FIT)
const widthOf = (o) => +execFileSync('convert', ['-font', FONT(o.bold), '-pointsize', String(o.size), '-kerning', String(o.spacing || 0), 'label:' + o.txt, '-format', '%w', 'info:']).toString();
function render(outDir) {
  fs.mkdirSync(outDir, { recursive: true }); const C = spec();
  for (const [name, c] of Object.entries(C)) {
    const a = ['-size', '1920x1080', 'xc:' + c.bg, '-font', FONT(false)]; let n = 0, over = [];
    for (const o of c.ops) {
      if (o.t === 'text' || o.t === 'ctext') { const w = widthOf(o); const lo = o.cx !== undefined ? o.cx - w / 2 : o.t === 'ctext' ? 960 - w / 2 : o.x, hi = lo + w, lim = o.mw && w > o.mw; if (lo < 40 || hi > 1880 || lim) over.push(JSON.stringify(o.txt) + ' w=' + Math.round(w) + (lim ? ' > box ' + o.mw : ' spans ' + Math.round(lo) + '..' + Math.round(hi))); }
      if (o.t === 'box') a.push('-fill', o.fill, '-stroke', o.stroke, '-strokewidth', '3', '-draw', `roundrectangle ${o.x},${o.y} ${o.x + o.w},${o.y + o.h} 22,22`);
      else if (o.t === 'arrow') { a.push('-stroke', SKY, '-strokewidth', '5', '-fill', SKY, '-draw', `line ${o.x1 + 8},${o.y} ${o.x2 - 22},${o.y}`, '-draw', `polygon ${o.x2 - 8},${o.y} ${o.x2 - 30},${o.y - 14} ${o.x2 - 30},${o.y + 14}`);
        a.push('-stroke', 'none', '-fill', MUT, '-font', FONT(false), '-pointsize', '22', '-gravity', 'NorthWest', '-annotate', `+${o.x1 + 6}+${o.y - 52}`, o.label); }
      else if (o.t === 'rect') a.push('-stroke', 'none', '-fill', o.fill, '-draw', `rectangle ${o.x1},${o.y1} ${o.x2},${o.y2}`);
      else if (o.t === 'frame') a.push('-stroke', o.color, '-strokewidth', String(o.w || 6), '-fill', 'none', '-draw', `rectangle ${o.x1},${o.y1} ${o.x2},${o.y2}`);
      else if (o.t === 'poly') a.push('-stroke', 'none', '-fill', o.fill, '-draw', `polygon ${o.pts}`);
      else if (o.t === 'img') a.push('(', path.join(SHARED, 'pdf', o.file), '-filter', 'Lanczos', '-resize', o.w + 'x', ')', '-gravity', 'NorthWest', '-geometry', `+${o.x}+${o.y}`, '-composite');
      else if (o.t === 'text' && o.cx !== undefined) a.push('-stroke', 'none', '-fill', o.color, '-font', FONT(o.bold), '-pointsize', String(o.size), '-gravity', 'North', '-annotate', `${o.cx - 960 >= 0 ? '+' : ''}${o.cx - 960}+${o.y}`, o.txt);
      else if (o.t === 'text') a.push('-stroke', 'none', '-fill', o.color, '-font', FONT(o.bold), '-pointsize', String(o.size), '-gravity', 'NorthWest', '-annotate', `+${o.x}+${o.y}`, o.txt);
      else if (o.t === 'ctext') a.push('-stroke', 'none', '-fill', o.color, '-font', FONT(o.bold), '-pointsize', String(o.size), '-kerning', String(o.spacing || 0), '-gravity', 'North', '-annotate', `+0+${o.y}`, o.txt);
      n++;
    }
    const f = path.join(outDir, name + '.png'); a.push(f); execFileSync('convert', a);
    const sub = execFileSync('convert', [f, '-crop', '1920x230+0+850', '+repage', '-format', '%[fx:mean]', 'info:']).toString(), bg = execFileSync('convert', ['-size', '1x1', 'xc:' + c.bg, '-format', '%[fx:mean]', 'info:']).toString();
    console.log(`§CARD_FIT ${name} ${over.length ? 'OVERFLOW ' + over.join(' ; ') : 'ok'}`);
    console.log(`§CARD ${name} ops=${n} subtitle_zone_mean=${(+sub).toFixed(5)} bg_mean=${(+bg).toFixed(5)} ${Math.abs(sub - bg) < 1e-4 ? 'EMPTY' : 'NOT-EMPTY'}`);
  }
}
if (require.main === module && process.argv[2] === 'render') render(path.resolve(process.argv[3] || path.join(OUT, 'cards')));
module.exports = { spec, render };
