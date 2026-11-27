// ⚠ DO NOT REMOVE — Scope: renders the Film 6 cards (cards6.js) to PNG stills (cards/<id>.png) and runs the layout witnesses on the DOM: text inside the safe box, no clipped/overflowing block, no overlapping blocks, WCAG contrast >= 4.5 per text run, every colour in the Civil Works palette.
// CONTROLS: four planted faults (low contrast, overlap, off-canvas text, off-palette colour) must each be detected, or the run prints INCONCLUSIVE. Headless Chrome --disable-gpu, CPU only. READ THE LOG (logs/cards6_check.log): §CARD_* lines.
// Usage: node cards6_render.js [outDir=cards]     facts: facts6.resolved.json (node facts6_resolve.js --json facts6.resolved.json)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path');
const Cards = require('./cards6.js'), PAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'palette.json'), 'utf8'));
const X = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts6.resolved.json'), 'utf8')), CL = JSON.parse(fs.readFileSync(path.join(__dirname, 'claims6.json'), 'utf8'));
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'cards')); fs.mkdirSync(OUT, { recursive: true });
const hex2rgb = h => { const m = /^#(..)(..)(..)$/.exec(h); return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]; };
const PALSET = new Set(Object.values(PAL.colours).map(c => hex2rgb(c.hex).join(',')));
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const say = s => console.log(s);
// the DOM probe runs in the page; it returns raw measurements, the verdicts are computed here
function probe() {
  const out = { runs: [], blocks: [], clipped: [], offsafe: [], colours: [], pend: 0 };
  const rgb = s => { const m = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?/.exec(s); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.99) return c.slice(0, 3); } return [8, 10, 14]; };
  const SAFE = { l: 48, r: 1872, t: 24, b: 906 };
  document.querySelectorAll('.pg *').forEach(el => {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    if (el.classList.contains('pend')) out.pend++;
    if (own) { const r = document.createRange(); r.selectNodeContents(el); const rects = Array.from(r.getClientRects()).filter(q => q.width > 0);
      const c = rgb(cs.color); out.runs.push({ text: own.slice(0, 50), color: c.slice(0, 3), bg: bgOf(el), size: parseFloat(cs.fontSize), weight: +cs.fontWeight || 400 });
      rects.forEach(q => { if (q.left < SAFE.l || q.right > SAFE.r || q.top < SAFE.t || q.bottom > SAFE.b) out.offsafe.push({ text: own.slice(0, 40), l: Math.round(q.left), r: Math.round(q.right), t: Math.round(q.top), b: Math.round(q.bottom) }); }); }
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' || el.scrollHeight > el.clientHeight + 1 && cs.overflowY !== 'visible' && el.clientHeight > 0) out.clipped.push((el.className || el.tagName) + ' ' + el.textContent.slice(0, 30));
    [['color', cs.color], ['background-color', cs.backgroundColor], ['border-top-color', cs.borderTopWidth !== '0px' ? cs.borderTopColor : null], ['border-left-color', cs.borderLeftWidth !== '0px' ? cs.borderLeftColor : null]].forEach(([k, v]) => { const c = v && rgb(v); if (c && c[3] > 0.05 && (k === 'color' ? own : true)) out.colours.push({ k, c: c.slice(0, 3), who: (el.className || el.tagName) + '' }); });
    if (el.matches('.bx, .take, .src, .cardblk, table.tb, .final, .why')) { const q = el.getBoundingClientRect(); out.blocks.push({ name: (el.className || el.tagName) + '', l: q.left, r: q.right, t: q.top, b: q.bottom }); }
  });
  return out;
}
function verdicts(id, m) {
  const bad = [];
  m.runs.forEach(r => { const ratio = contrast(r.color, r.bg); const large = r.size >= 24 || (r.size >= 18.66 && r.weight >= 700); const need = 4.5; if (ratio < need) bad.push(`contrast ${ratio.toFixed(2)} < ${need} "${r.text}"`); });
  m.offsafe.forEach(o => bad.push(`outside safe box "${o.text}" l=${o.l} r=${o.r} t=${o.t} b=${o.b}`));
  m.clipped.forEach(c => bad.push('clipped/overflowing: ' + c));
  m.colours.forEach(c => { if (!PALSET.has(c.c.join(',')) && !(c.k === 'background-color' && c.c.join(',') === '8,10,14')) bad.push(`off-palette ${c.k} rgb(${c.c}) on ${c.who}`); });
  const B = m.blocks.filter(b => !/cardblk|why/.test(b.name) || true);
  for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) { const a = B[i], b = B[j]; const ov = Math.min(a.r, b.r) - Math.max(a.l, b.l) > 2 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 2; const nested = (a.l <= b.l && a.r >= b.r && a.t <= b.t && a.b >= b.b) || (b.l <= a.l && b.r >= a.r && b.t <= a.t && b.b >= a.b);
    if (ov && !nested) bad.push(`overlap ${a.name} x ${b.name}`); }
  const minC = Math.min(...m.runs.map(r => contrast(r.color, r.bg)));
  return { bad, minC, nRuns: m.runs.length };
}
(async () => {
  const B = Cards.build(X, CL); const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'] });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 })).newPage(); let pageErr = 0; page.on('pageerror', e => { pageErr++; say('§CARD_ERROR pageerror ' + e); });
  const html = body => `<!doctype html><html><head><meta charset="utf-8"><style>${B.CSS}</style></head><body>${body}</body></html>`;
  // ---- controls ----
  const good = B.C.ch1; const faults = {
    lowContrast: good.replace('</div></div>', '<div style="position:absolute;left:200px;top:700px;font:400 30px Noto Sans;color:#6B6A63">low contrast text</div></div></div>'),
    overlap: good.replace('<div class="take">', '<div class="bx" style="position:absolute;left:300px;top:800px;width:600px;height:80px">overlaps the takeaway</div><div class="take">'),
    offCanvas: good.replace('</div></div>', '<div style="position:absolute;left:1700px;top:700px;font:400 40px Noto Sans;color:#fff;white-space:nowrap">text running off the right edge</div></div></div>'),
    offPalette: good.replace('</div></div>', '<div style="position:absolute;left:200px;top:700px;font:400 30px Noto Sans;color:#ff00ff">magenta</div></div></div>') };
  let ctlOK = true; const want = { lowContrast: /contrast/, overlap: /overlap/, offCanvas: /outside safe box/, offPalette: /off-palette/ };
  for (const k of Object.keys(faults)) { await page.setContent(html(faults[k])); const v = verdicts('ctl', await page.evaluate(probe)); const hit = v.bad.some(b => want[k].test(b)); say(`§CARD_CONTROL ${k} ${hit ? 'DETECTED' : 'NOT DETECTED'}`); if (!hit) ctlOK = false; }
  await page.setContent(html(good)); const v0 = verdicts('ctl', await page.evaluate(probe)); say(`§CARD_CONTROL unplanted ch1 flagged=${v0.bad.length} (the same card without the fault; real run below)`);
  // ---- the cards ----
  let totalBad = 0, pendTotal = 0; const summary = [];
  for (const id of B.ORDER) {
    await page.setContent(html(B.C[id])); await page.waitForTimeout(50); const m = await page.evaluate(probe); const v = verdicts(id, m); pendTotal += m.pend;
    const file = path.join(OUT, id + '.png'); await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1920, height: 930 } });
    fs.writeFileSync(path.join(OUT, id + '.html'), html(B.C[id]));
    say(`§CARD ${id} runs=${v.nRuns} min_contrast=${v.minC.toFixed(2)} pending_placeholders=${m.pend} problems=${v.bad.length} png=${path.relative(__dirname, file)}`); v.bad.forEach(b => say(`  §CARD_PROBLEM ${id}: ${b}`)); totalBad += v.bad.length;
    summary.push({ id, minC: v.minC, pend: m.pend, problems: v.bad.length });
  }
  await browser.close();
  say(`§CARD_PENDING total pending placeholders on cards = ${pendTotal} (each is a fact still waiting on its owner; the card shows it in amber)`);
  const nonVac = summary.length > 0 && summary.every(s => s.minC > 0);
  say(`§CARD_VERDICT ${!ctlOK || !nonVac ? 'INCONCLUSIVE (a control did not detect its fault)' : totalBad ? 'FAIL' : 'PASS'} cards=${summary.length} problems=${totalBad} pageerrors=${pageErr} lowest_contrast=${Math.min(...summary.map(s => s.minC)).toFixed(2)}`);
  process.exit(totalBad || !ctlOK ? 1 : 0);
})();
