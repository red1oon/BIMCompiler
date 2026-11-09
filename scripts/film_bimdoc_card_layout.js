// ⚠ DO NOT REMOVE — W-CARD-LAYOUT (FILM_NARRATION.md §BIMDOC-FILM-V3): the BIM Document film's chapter/closing cards, rendered at 1920x1080, every text block inside the frame and no two overlapping. Run: node scripts/film_bimdoc_card_layout.js scripts/film_bimdoc.js — READ the §CARD-LAYOUT lines.
// W-CARD-LAYOUT: does any text block of the chapter/closing card overflow the 1920x1080 frame or overlap another block? (numbers, not a look)
const fs = require('fs'), { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const src = fs.readFileSync(process.argv[2], 'utf8'), grab = (n) => { const m = new RegExp('const ' + n + ' = ([\\s\\S]*?);\\n\\s*(?:const|//|\\()').exec(src); return m[1]; };
const CARD_CSS = eval(grab('CARD_CSS')); const CARD_CH = eval(grab('CARD_CH')), CARD_END = eval(grab('CARD_END'));
(async () => { const b = await chromium.launch({ args: ['--disable-gpu'] }); const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage(); let bad = 0;
  for (const [n, h] of [['ch', CARD_CH], ['end', CARD_END]]) { await p.setContent(h);
    const r = await p.evaluate(() => [...document.querySelectorAll('.k,.t,.pp,.src,.p')].map(e => { const x = e.getBoundingClientRect(); return { c: e.className, x: Math.round(x.left), y: Math.round(x.top), r: Math.round(x.right), b: Math.round(x.bottom), over: e.scrollWidth > e.clientWidth + 1 }; }));
    const out = r.filter(e => e.x < 0 || e.y < 0 || e.r > 1920 || e.b > 1080 || e.over), ov = [];
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) { const a = r[i], c = r[j]; if (a.x < c.r && c.x < a.r && a.y < c.b && c.y < a.b) ov.push(a.c + '×' + c.c); }
    if (out.length || ov.length) bad++;
    console.log('§CARD-LAYOUT card=' + n + ' blocks=' + JSON.stringify(r) + ' outside=' + JSON.stringify(out) + ' overlaps=' + JSON.stringify(ov) + ' -> ' + (out.length || ov.length ? 'FAIL' : 'PASS')); }
  console.log('§CARD-LAYOUT VERDICT ' + (bad ? 'FAIL' : 'PASS')); await b.close(); })();
