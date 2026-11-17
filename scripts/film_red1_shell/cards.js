// ⚠ DO NOT REMOVE — film "Remember The Name - red1" (prompts/CLI_ERP_IVR.md §22.13; prompts/FILM_COMMAND_LINE_ERP.md "CH red1"): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu).
// ONE FULL-FRAME TERMINAL (owner 2026-11-15: terminal only, no Viewer frame, room to show answers without scrolling off). Every still is a REAL screen of the real shell, kept after each key by rec.py (out/rec/frames.json);
// nothing is typed in by hand. A beat's stills are drawn at the largest font in which the beat's whole used area (its columns x rows, over all its screens) fits above the caption band: a zoom on the used corner of
// the 220 x 50 terminal, one size per beat, so nothing in a beat jumps. A typed character = 2 frames and a key sound; the Return key = 8 frames and its sound, drawn on the screen as typed (before the answer);
// the answer holds the rest of the beat. Usage: node cards.js <outDir>. READ THE LOG (§CARD lines: font, columns, rows; TOO-SMALL when a beat would need a font under 13 px).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), R = require('./render.js'), N = require('./narr.js');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OD = process.env.OUTD || 'out', rec = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'rec', 'frames.json'), 'utf8')), out = path.resolve(process.argv[2] || OD + '/cards'); fs.mkdirSync(out, { recursive: true });
const AREA_W = 1860, AREA_H = 880, MIN_FONT = 13, MAX_FONT = 26, CW = 0.602, LH = 1.27;
const byStep = {}; rec.frames.forEach(f => { (byStep[f.step] = byStep[f.step] || []).push(f); });
const order = rec.frames.map(f => f.step).filter((s, i, a) => a.indexOf(s) === i);
const used = (f) => { let c = 0, r = 0; f.text.forEach((l, y) => { if (l.trim()) { c = Math.max(c, l.length); r = Math.max(r, y + 1); } }); if (!f.hidden) { c = Math.max(c, f.cx + 1); r = Math.max(r, f.cy + 1); } return [c, r]; };
const CHCSS = `*{margin:0;padding:0;box-sizing:border-box} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:300px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:136px;font-weight:700;margin-top:40px;line-height:1.1} .t2{font-size:44px;color:#94a3b8;margin-top:36px} .m{font-family:'DejaVu Sans Mono',monospace}`;
const card = (inner) => '<!doctype html><html><head><meta charset="utf-8"><style>' + CHCSS + '</style></head><body>' + inner + '</body></html>';
const cards = {
  cover: card('<div class="ch"><div class="k">KEYBOARD ONLY  ·  BIM</div><div class="t1">Remember The Name</div><div class="t2 m">red1</div></div>'),
  end: card('<div class="ch"><div class="t1 m" style="font-size:200px;margin-top:60px">red1</div><div class="t2">a shell for the BIM side</div></div>')
};
function screenHtml(f, fs_, cursor) {   // the 220x50 grid drawn at font fs_, from its top-left corner
  const h = R.html(f, { cursor }); return h.replace(/font-size:22px;line-height:28px/, 'font-size:' + fs_ + 'px;line-height:' + Math.round(fs_ * LH) + 'px').replace(/\.r\{height:28px/, '.r{height:' + Math.round(fs_ * LH) + 'px').replace(/left:33px;top:14px/, 'left:30px;top:16px');
}
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}, seen = new Map(); let n = 0, small = 0, keys = 0, rets = 0, prev = rec.frames[0];
  const shot = async (html, name) => { if (seen.has(html)) return seen.get(html); await pg.setContent(html, { waitUntil: 'load' }); await pg.screenshot({ path: path.join(out, name) }); seen.set(html, name); n++; return name; };
  for (const bt of N.beats) {
    const id = bt.id; plan[id] = [];
    if (cards[id]) { plan[id].push({ file: await shot(cards[id], id + '_001.png'), frames: null }); console.log('§CARD beat=' + id + ' card'); continue; }
    const F = byStep[id]; if (!F || !F.length) throw new Error('no recording for beat ' + id);
    // the font of the beat: the used area over the screen before it and every screen of it
    const clears = F[0].what === 'CtrlL';   // a beat that opens with Control-L: the old screen is gone at its first key, so it is neither drawn nor counted
    let cols = 1, rows = 1; (clears ? F : [prev].concat(F)).forEach(f => { const u = used(f); cols = Math.max(cols, u[0]); rows = Math.max(rows, u[1]); });
    cols += 2; rows += 1; const fsz = Math.min(MAX_FONT, Math.floor(AREA_W / (cols * CW)), Math.floor(AREA_H / (rows * LH)));
    if (fsz < MIN_FONT) small++; let i = 0; const add = async (f, frames, key, cursor) => { const name = id + '_' + String(++i).padStart(3, '0') + '.png'; plan[id].push(Object.assign({ file: await shot(screenHtml(f, fsz, cursor), name), frames }, key ? { key } : {})); if (key === 'k') keys++; if (key === 'r') rets++; };
    if (!clears) await add(prev, 12, null, true);   // the screen before the first key
    let lastK = null;
    for (let j = 0; j < F.length; j++) { const f = F[j], lastOfBeat = j === F.length - 1;
      if (f.kind === 'k') { lastK = f; await add(f, /^[A-Z][a-z]+$/.test(f.what) && f.what.length > 1 ? 10 : 2, 'k', true); }   // a typed character: 2 frames; a named key (Down, CtrlL): 10 so the change is seen
      else if (f.kind === 'r') { if (f.what === 'Return' && lastK && F[j - 1] && F[j - 1].kind === 'k' && F[j - 1].what.length === 1) await add(lastK, 8, 'r', false);   // Return after a typed line: the line as typed, then the answer
        else await add(f, 8, 'r', true); }   // Return / Esc on a menu: the screen the key produced
      else if (f.kind === 'a') await add(f, lastOfBeat ? null : 30, null, true);
    }
    console.log('§CARD beat=' + id + ' stills=' + plan[id].length + ' used_cols=' + (cols - 2) + ' used_rows=' + (rows - 1) + ' font=' + fsz + 'px' + (fsz < MIN_FONT ? ' TOO-SMALL' : '')); prev = F[F.length - 1];
  }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' pngs=' + n + ' too_small=' + small + ' key_stills=' + keys + ' return_stills=' + rets);
  if (small) process.exit(1);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
