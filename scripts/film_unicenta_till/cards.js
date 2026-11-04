// ⚠ DO NOT REMOVE — Scope: the plain cards and chapter cards of "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34; FILM_NARRATION.md PLAYBOOK C picture rules). ImageMagick only, house typography, DejaVu Sans.
// Every digit on a card is a fact of out/facts.resolved.json (interpolated here, never typed) - guard.js scans the SPEC for strays. Chapter cards = plain #0b0f17, silent, no tags. Plain cards #0f172a, content above y=850 (bottom 230 px stay empty for subtitles).
// Usage: node cards.js render <outDir>   (writes <outDir>/<name>.png)   |   require('./cards.js').spec() for the guard.   READ THE LOG: out/cards.log
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const FACTS = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'facts.resolved.json'), 'utf8'));
const CORAL = '#FF6B78', OFF = '#F3EEE8', SKY = '#7dd3fc', MUT = '#C3C2B7', AMB = '#fbbf24', GRN = '#4ade80', INK = '#e2e8f0', BOXF = '#1e293b', BOXS = '#7dd3fc';
const box = (x, y, w, h, o) => ({ t: 'box', x, y, w, h, fill: (o && o.fill) || BOXF, stroke: (o && o.stroke) || BOXS });
const tx = (x, y, size, color, txt, o) => ({ t: 'text', x, y, size, color, txt, bold: !(o && o.light), center: o && o.center });
const arrow = (x1, y, x2, label) => ({ t: 'arrow', x1, y, x2, label });
function spec() {
  const F = {}; const fr = FACTS(); Object.keys(fr).forEach(k => { F[k] = fr[k].value; });
  const chap = (k, l1, l2, pl) => ({ bg: '#0b0f17', ops: [{ t: 'ctext', y: 330, size: 34, color: CORAL, txt: k, spacing: 6 }, { t: 'ctext', y: 400, size: 120, color: OFF, txt: l1, bold: true }, { t: 'ctext', y: 540, size: 120, color: CORAL, txt: l2, bold: true }, { t: 'ctext', y: 700, size: 40, color: MUT, txt: pl }] });
  const C = {
    ch1: chap('THE TILL', 'A till you', 'already know', 'uniCenta layout and flow, in a browser tab'),
    ch2: chap('THE RESTAURANT', 'Kitchen', 'and tables', 'floor map, Send Order, the kitchen screen'),
    ch3: chap('THE BRANCH DAY', 'End of day,', 'once', 'three tills, one branch admin, one send'),
    ch4: chap('HEAD OFFICE', 'Head office,', 'next morning', 'one click closes the branch day'),
    ch5: chap('SODA', 'Only what', 'changed', 'the morning batch down to the tills'),
    ch6: chap('THE ORACLE', 'Same books', 'as legacy', 'compared with real iDempiere, column by column'),
    before: { bg: '#0f172a', ops: [tx(120, 110, 46, SKY, 'BEFORE  ·  the 2012 shape'), tx(120, 170, 30, MUT, 'The owner\'s POS integration of ' + F.year2012 + ': three things to install and keep running'),
      box(120, 300, 480, 300), tx(150, 350, 40, OFF, 'Desktop till'), tx(150, 410, 30, INK, 'own database'), tx(150, 455, 30, INK, 'on the till itself'),
      arrow(600, 450, 720, 'queue'), box(720, 300, 480, 300), tx(750, 350, 40, OFF, 'Message broker'), tx(750, 410, 30, INK, 'ActiveMQ, a server'), tx(750, 455, 30, INK, 'to run and watch'),
      arrow(1200, 450, 1320, 'import'), box(1320, 300, 480, 300), tx(1350, 350, 40, OFF, 'Head office'), tx(1350, 410, 30, INK, 'iDempiere server'), tx(1350, 455, 30, INK, 'database server too'),
      tx(120, 700, 28, MUT, 'Source: prompts/POS_PLUGIN_LOCAL_FIRST.md, the 2012 extraction (the owner\'s integration)')] },
    after: { bg: '#0f172a', ops: [tx(120, 110, 46, SKY, 'AFTER  ·  the same till, in a browser tab'), tx(120, 170, 30, MUT, 'Offline first. Nothing to install. Head office is a browser, or legacy iDempiere.'),
      box(120, 300, 480, 300, { stroke: GRN }), tx(150, 350, 40, OFF, 'Browser till'), tx(150, 410, 30, INK, 'own SQLite database'), tx(150, 455, 30, INK, 'works with no network'),
      arrow(600, 450, 720, 'sealed changes'), box(720, 300, 480, 300, { stroke: GRN }), tx(750, 350, 40, OFF, 'One plain relay'), tx(750, 410, 30, INK, 'a folder in the cloud'), tx(750, 455, 30, INK, 'no server logic'),
      arrow(1200, 450, 1320, 'fold'), box(1320, 300, 480, 300, { stroke: GRN }), tx(1350, 350, 40, OFF, 'Head office'), tx(1350, 410, 30, INK, 'a browser, or'), tx(1350, 455, 30, INK, 'legacy iDempiere'),
      tx(120, 700, 28, MUT, 'Same operations, same books, same look and feel as legacy: no accepted divergence')] },
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
      tx(120, 280, 30, OFF, 'Prior art: the owner\'s ' + F.year2012 + ' Openbravo / uniCenta to iDempiere integration, with Ghintech'),
      tx(120, 345, 30, OFF, 'uniCenta oPOS (GPL): layout and flow followed. No code or artwork copied.'),
      tx(120, 410, 30, OFF, 'Product pictures: Fluent Emoji (MIT licence)'),
      tx(120, 475, 30, OFF, 'Legacy iDempiere is the oracle for every comparison'),
      tx(120, 600, 30, MUT, 'github.com/red1oon/BIMCompiler   ·   red1org@gmail.com')] }
  };
  return C;
}
function render(outDir) {
  fs.mkdirSync(outDir, { recursive: true }); const C = spec();
  for (const [name, c] of Object.entries(C)) {
    const a = ['-size', '1920x1080', 'xc:' + c.bg, '-font', 'DejaVu-Sans']; let n = 0;
    for (const o of c.ops) {
      if (o.t === 'box') a.push('-fill', o.fill, '-stroke', o.stroke, '-strokewidth', '3', '-draw', `roundrectangle ${o.x},${o.y} ${o.x + o.w},${o.y + o.h} 22,22`);
      else if (o.t === 'arrow') { a.push('-stroke', SKY, '-strokewidth', '5', '-fill', SKY, '-draw', `line ${o.x1 + 8},${o.y} ${o.x2 - 22},${o.y}`, '-draw', `polygon ${o.x2 - 8},${o.y} ${o.x2 - 30},${o.y - 14} ${o.x2 - 30},${o.y + 14}`);
        a.push('-stroke', 'none', '-fill', MUT, '-font', 'DejaVu-Sans', '-pointsize', '22', '-gravity', 'NorthWest', '-annotate', `+${o.x1 + 6}+${o.y - 52}`, o.label); }
      else if (o.t === 'text') a.push('-stroke', 'none', '-fill', o.color, '-font', o.bold ? 'DejaVu-Sans-Bold' : 'DejaVu-Sans', '-pointsize', String(o.size), '-gravity', 'NorthWest', '-annotate', `+${o.x}+${o.y}`, o.txt);
      else if (o.t === 'ctext') a.push('-stroke', 'none', '-fill', o.color, '-font', o.bold ? 'DejaVu-Sans-Bold' : 'DejaVu-Sans', '-pointsize', String(o.size), '-kerning', String(o.spacing || 0), '-gravity', 'North', '-annotate', `+0+${o.y}`, o.txt);
      n++;
    }
    const f = path.join(outDir, name + '.png'); a.push(f); execFileSync('convert', a);
    const sub = execFileSync('convert', [f, '-crop', '1920x230+0+850', '+repage', '-format', '%[fx:mean]', 'info:']).toString(), bg = execFileSync('convert', ['-size', '1x1', 'xc:' + c.bg, '-format', '%[fx:mean]', 'info:']).toString();
    console.log(`§CARD ${name} ops=${n} subtitle_zone_mean=${(+sub).toFixed(5)} bg_mean=${(+bg).toFixed(5)} ${Math.abs(sub - bg) < 1e-4 ? 'EMPTY' : 'NOT-EMPTY'}`);
  }
}
if (require.main === module && process.argv[2] === 'render') render(path.resolve(process.argv[3] || 'out/cards'));
module.exports = { spec, render };
