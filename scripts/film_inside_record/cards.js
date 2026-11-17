// ⚠ DO NOT REMOVE — film "Inside the Record" (prompts/FILM_COMMAND_LINE_ERP.md CH 3): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). Two frames (house style, FILM_NARRATION.md 1-6):
// ABOVE the REAL terminal (rec.py's pyte screens), at ONE font for the whole film (30 px, owner 2026-11-18: no per-beat shrinking), a window of ROWS rows that follows the terminal; an answer taller
// than the window SCROLLS up one row every SCROLLF frames, then holds; the pty has exactly the columns the strip holds, so long lines wrap where the terminal wraps them.
// BELOW the REAL ERP page on the same data (facts.js), CROPPED to the part that changes and scaled to fill the frame. Cover = the two-colour chapter card; end = prior art · costs · credentials.
// A typed character = 2 frames + a key sound; Return = 8 frames + its sound (the line as typed); the answer holds the rest of the beat. Usage: node cards.js <outDir>. READ THE LOG (§CARD, §CARD_T).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), R = require('./render.js'), N = require('./narr.js');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OD = process.env.OUTD || 'out', rec = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'rec', 'frames.json'), 'utf8')), F = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'facts.json'), 'utf8'));
const out = path.resolve(process.argv[2] || OD + '/cards'); fs.mkdirSync(out, { recursive: true });
const LG = ['zh', 'th'].indexOf(process.env.FILM_LANG) >= 0 ? process.env.FILM_LANG : 'en', tr = (en, zh, th) => ({ en, zh, th }[LG]);   // zh / th: translated by the build session (2026-11-18), NOT reviewed by a native speaker
const FONTS = { en: "'DejaVu Sans'", zh: "'Noto Sans CJK SC','DejaVu Sans'", th: "'Noto Sans Thai','DejaVu Sans'" }[LG];
const FONT = 30, LH = 38, ROWS = 10, SCROLLF = 6, CW = 0.602, LEFT = 30, STRIP_H = 420, BAR_H = 30, LOW_Y = STRIP_H + BAR_H, LOW_H = 450, CAP_Y = LOW_Y + LOW_H;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
if (Math.floor((1920 - 2 * LEFT) / (FONT * CW)) < rec.cols) { console.error('§CARDS_FAIL the pty has ' + rec.cols + ' columns, the strip holds ' + Math.floor((1920 - 2 * LEFT) / (FONT * CW)) + ' at ' + FONT + ' px'); process.exit(1); }
const frames = rec.frames.map((f, i) => Object.assign({ i }, f)), byStep = {}; frames.forEach(f => { (byStep[f.step] = byStep[f.step] || []).push(f); });
const firstState = Object.keys(F.states).map(k => F.states[k]).sort((a, b) => a.firstFrame - b.firstFrame)[0];
const stateAt = (i) => F.states[F.frameState[i]] || firstState;
const used = (f) => { let r = 0; f.text.forEach((l, y) => { if (l.trim()) r = y + 1; }); if (!f.hidden) r = Math.max(r, f.cy + 1); return r; };
const LABEL = { tree: (s) => s.path.length ? 'menu ▸ ' + s.path.join(' ▸ ') : 'menu', win: () => 'Sales Order window', rec: (s) => 'Order ' + s.number + ' · ' + (s.dom.chip || '') };
const CSS = `*{margin:0;padding:0;box-sizing:border-box} body{width:1920px;height:1080px;background:#0f172a;overflow:hidden;font-family:'DejaVu Sans',sans-serif}
.term{position:absolute;left:0;top:0;width:1920px;height:${STRIP_H}px;background:${R.BG};overflow:hidden}
.t{position:absolute;left:${LEFT}px;top:12px;font-family:'DejaVu Sans Mono',monospace;font-size:${FONT}px;line-height:${LH}px;color:${R.FG};white-space:pre} .r{height:${LH}px;white-space:pre}
.bar{position:absolute;left:0;top:${STRIP_H}px;width:1920px;height:${BAR_H}px;background:#1e293b;color:#94a3b8;font-family:${FONTS},sans-serif;font-size:20px;line-height:${BAR_H}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc} .bar i{float:right;font-style:normal;color:#fbbf24;font-weight:700;letter-spacing:2px}
.low{position:absolute;left:0;top:${LOW_Y}px;width:1920px;height:${LOW_H}px;display:flex;align-items:center;justify-content:center;background:#0f172a} .low img{display:block;border-radius:10px;box-shadow:0 0 0 2px #334155}`;
const imgs = {}; const img = (s) => imgs[s.key] || (imgs[s.key] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, OD, s.file)).toString('base64'));
const SPLIT = 9;   // a menu list longer than this is shown in two columns of the page's own rows, cut at a row boundary (a tall list would otherwise fill the frame at ~1x)
const cols2 = (s) => { if (s.kind !== 'tree' || !s.dom.rowsY || s.dom.rowsY.length <= SPLIT) return null; const n = s.dom.rowsY.length, k = Math.ceil(n / 2), cut = Math.round((s.dom.rowsY[k] + 10) * 2);   // +10 = the crop's pad; *2 = device scale
  const hA = cut, hB = s.px[1] - cut, h = Math.max(hA, hB), z = Math.min((1920 - 80) / (2 * s.px[0]), (LOW_H - 20) / h); return { cut, hA, hB, z, w: Math.round(s.px[0] * z) }; };
const fit = (s) => { const k = Math.min((1920 - 40) / s.px[0], (LOW_H - 20) / s.px[1]); return [Math.round(s.px[0] * k), Math.round(s.px[1] * k), +(k * 2).toFixed(2)]; };   // k*2 = the zoom over the page's own CSS pixels (captured at device scale 2)
function lowHtml(s, w, h) {
  const c = cols2(s); if (!c) return '<img src="' + img(s) + '" style="width:' + w + 'px;height:' + h + 'px">';
  const part = (y0, hh) => '<div style="width:' + c.w + 'px;height:' + Math.round(hh * c.z) + 'px;overflow:hidden;border-radius:10px;box-shadow:0 0 0 2px #334155;align-self:flex-start"><img src="' + img(s) + '" style="width:' + c.w + 'px;height:' + Math.round(s.px[1] * c.z) + 'px;margin-top:' + (-Math.round(y0 * c.z)) + 'px;box-shadow:none;border-radius:0"></div>';
  return '<div style="display:flex;gap:40px;align-items:flex-start;margin-top:' + Math.round((LOW_H - Math.max(c.hA, c.hB) * c.z) / 2) + 'px;align-self:flex-start">' + part(0, c.hA) + part(c.cut, c.hB) + '</div>';
}
function split(f, top, cursor, s) {
  const win = { rows: f.rows.slice(top, top + ROWS), cx: f.cx, cy: f.cy - top, hidden: f.hidden || f.cy < top || f.cy >= top + ROWS }, [w, h] = fit(s);
  return '<!doctype html><html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body><div class="term"><div class="t">' + R.lines(win, { cursor }).join('') + '</div></div>' +
    '<div class="bar">▼ <b>' + tr('the ERP window', 'ERP 窗口', 'หน้าต่าง ERP') + '</b>' + tr(', opened on the same data', '，在同一份数据上打开', ' เปิดบนข้อมูลเดียวกัน') + ' · ' + esc(LABEL[s.kind](s)) + '<i>' + tr('PROTOTYPE', '原型', 'ต้นแบบ') + '</i></div><div class="low">' + lowHtml(s, w, h) + '</div></body></html>';
}
// ── the cards ──
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONTS},sans-serif;overflow:hidden} .mantra{margin-top:70px;text-align:center} .ml{font-size:30px;font-style:italic;color:#F3EEE8;line-height:1.32} .ml .mt{font-style:normal;color:#94a3b8;font-size:24px;margin-left:22px} .mby{font-size:24px;color:#FF6B78;margin-top:4px;letter-spacing:3px} .glink{text-align:center;font-size:28px;color:#94a3b8;margin-top:26px} .glink b{color:#7dd3fc;font-family:'DejaVu Sans Mono',monospace} .ch{text-align:center;margin-top:300px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:128px;font-weight:700;margin-top:36px;line-height:1.1} .t2{font-size:44px;color:#94a3b8;margin-top:34px}
.ttl{text-align:center;font-size:52px;font-weight:700;margin-top:40px} .cols{display:flex;gap:30px;margin:40px 50px 0 50px} .col{flex:1;background:#111827;border:2px solid #334155;border-radius:18px;padding:22px 26px} .col h2{font-size:30px;letter-spacing:5px;color:#FF6B78;margin-bottom:14px} .col p{font-size:23px;line-height:1.36;color:#e2e8f0;margin-bottom:11px} .col b{color:#7dd3fc} .col .s{color:#94a3b8;font-size:19px}`;
const card = (inner) => '<!doctype html><html><head><meta charset="utf-8"><style>' + CH + '</style></head><body>' + inner + '</body></html>';
const PA = require('./priorart.json'), pr = (F.proof || []).map(p => '<b>W-' + esc(p.name.replace(/_/g, '-').toUpperCase()) + '</b> ' + p.pass + '/' + p.fail + ' ' + esc(p.verdict)).join('<br>');
const a5 = F.a5 || { cases: {} }, a5c = Object.keys(a5.cases).map(k => esc(k) + ' ' + a5.cases[k].match + '/' + a5.cases[k].n).join('<br>');
// red1's three-line mantra (owner, 2026-11-18: "add my Red1 3 line mantra to the last card bottom empty space"; the wording of prompts/FILM_NARRATION.md "The Three-Body Problem of IT", owner: "the one beginning with 'Information is Free,...'").
// His words stay in English in every cut; a translated cut adds its translation under each line.
const MANTRA = [['Information is free — you have to know.', '信息是免费的——你必须知道。', 'ข้อมูลนั้นฟรี — คุณต้องรู้'], ['People are not — you have to pay.', '人不是免费的——你必须付费。', 'คนนั้นไม่ฟรี — คุณต้องจ่าย'], ['Contributors are priceless — you have to be.', '贡献者是无价的——你必须成为其中一员。', 'ผู้ร่วมสร้างนั้นล้ำค่า — คุณต้องเป็นหนึ่งในนั้น']];
const GUIDE = 'red1oon.github.io/BIMCompiler/' + (LG === 'zh' ? 'zh/' : '') + 'FastScriptGuide/';   // owner 2026-11-18: "slip in the link on last card"; the guide in the cut's language where one exists (no Thai page: the English one)
const linkHtml = '<div class="glink">' + tr('the guide', '指南', 'คู่มือ') + ': <b>' + GUIDE + '</b></div>';
const mantraHtml = '<div class="mantra">' + MANTRA.map(m => '<div class="ml">' + esc(m[0]) + (LG !== 'en' ? '<span class="mt">' + esc(m[LG === 'zh' ? 1 : 2]) + '</span>' : '') + '</div>').join('') + '<div class="mby">— red1</div></div>';
const PAT = (p) => LG === 'en' ? p : Object.assign({}, p, p[LG] || {});
const CARDS = {
  cover: card('<div class="ch"><div class="k">' + tr('COMMAND LINE ERP  ·  CH 3', '命令行 ERP  ·  第 3 章', 'ERP บรรทัดคำสั่ง  ·  ตอนที่ 3') + '</div><div class="t1">' + tr('Inside the Record', '走进单据', 'ข้างในเอกสาร') + '</div><div class="t2">' + tr('Fast Script ERP, part two', '极速脚本 ERP，第二部', 'ERP สคริปต์เร็ว ภาคสอง') + '</div></div>'),
  end: card('<div class="ttl">' + tr('What we learned from, what it costs, who stands behind it', '向谁学习 · 花费多少 · 谁在背后', 'เรียนรู้จากใคร · ต้นทุนเท่าไร · ใครอยู่เบื้องหลัง') + '</div><div class="cols">' +
    '<div class="col"><h2>' + tr('PRIOR ART', '前人成果', 'งานก่อนหน้า') + '</h2>' + PA.map(p0 => { const p = PAT(p0); return '<p><b>' + esc(p.who) + '</b>: ' + esc(p.what) + '<br><span class="s">→ ' + esc(p.took) + '</span></p>'; }).join('') + '</div>' +
    '<div class="col"><h2>' + tr('COSTS', '成本', 'ต้นทุน') + '</h2><p>' + tr('re-activate <b>' + F.costs.re + ' ms</b>, complete <b>' + F.costs.co + ' ms</b>, measured in this film', '重新激活 <b>' + F.costs.re + ' ms</b>，完成 <b>' + F.costs.co + ' ms</b>，本片实测', 'เปิดใช้งานใหม่ <b>' + F.costs.re + ' ms</b> ทำให้เสร็จ <b>' + F.costs.co + ' ms</b> วัดในวิดีโอนี้') + '</p><p>' +
      tr(F.costs.lines + ' door lines, ' + (F.costs.linesMs / 1000).toFixed(1) + ' s in all, on this laptop\'s CPU', '共 ' + F.costs.lines + ' 行命令，总计 ' + (F.costs.linesMs / 1000).toFixed(1) + ' 秒，在这台笔记本的 CPU 上', 'คำสั่ง ' + F.costs.lines + ' บรรทัด รวม ' + (F.costs.linesMs / 1000).toFixed(1) + ' วินาที บน CPU ของแล็ปท็อปเครื่องนี้') + '</p><p>' +
      tr('no server, no licence fee', '无服务器，无许可费', 'ไม่มีเซิร์ฟเวอร์ ไม่มีค่าลิขสิทธิ์') + ' · Node ' + esc(F.costs.node) + '</p>' +
      '<p class="s">' + tr('real key sounds: eklee, cut by qubodup, OpenGameArt, CC BY 3.0', '真实按键声：eklee，由 qubodup 剪辑，OpenGameArt，CC BY 3.0', 'เสียงคีย์จริง: eklee ตัดโดย qubodup, OpenGameArt, CC BY 3.0') + '</p>' + (LG !== 'en' ? '<p class="s">' + tr('', '中文由构建会话翻译，未经母语者审校', 'ภาษาไทยแปลโดยเซสชันที่สร้าง ยังไม่ได้ตรวจโดยเจ้าของภาษา') + '</p>' : '') + '</div>' +
    '<div class="col"><h2>' + tr('CREDENTIALS', '凭证', 'หลักฐาน') + '</h2><p><b>bim-ootb</b> ' + tr('#3166 history · #3179 record and menu · #3194 re-activate · #3224 this film\'s fixes', '#3166 历史 · #3179 记录与菜单 · #3194 重新激活 · #3224 本片发现的修复', '#3166 ประวัติ · #3179 เอกสารและเมนู · #3194 เปิดใช้งานใหม่ · #3224 การแก้ไขจากวิดีโอนี้') + '</p><p>' +
      tr('run during this build:', '本次构建中运行：', 'รันระหว่างการสร้างนี้:') + '<br>' + pr + '</p><p>' + tr('against legacy iDempiere, fields equal:', '对照旧版 iDempiere，相同的字段：', 'เทียบกับ iDempiere รุ่นเดิม ฟิลด์ที่ตรงกัน:') + '<br>' + a5c + '</p><p class="s">' + esc(F.credits.copyright) + ' · ' + esc(F.credits.licence) + '</p></div></div>' + mantraHtml + linkHtml)
};
(async () => {
  { const st = await new Promise(r => require('https').get('https://' + GUIDE, res => { r(res.statusCode); res.resume(); }).on('error', () => r(0))); console.log('§CARD_LINK https://' + GUIDE + ' status=' + st); if (st !== 200) { console.error('§CARDS_FAIL the guide link on the end card does not answer 200'); process.exit(1); } }
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}, seen = new Map(); let n = 0, keys = 0, rets = 0, scrolls = 0, overflow = 0; const fontsSeen = new Set();
  const shot = async (html, name) => { if (seen.has(html)) return seen.get(html); await pg.setContent(html, { waitUntil: 'load' }); await pg.screenshot({ path: path.join(out, name) }); seen.set(html, name); n++; return name; };
  let top = 0;
  for (const bt of N.beats) {
    const id = bt.id; plan[id] = [];
    if (CARDS[id]) { const nm = await shot(CARDS[id], id + '_001.png'); plan[id].push({ file: nm, frames: null });
      const ck = await pg.evaluate(() => { const cols = Array.from(document.querySelectorAll('.col')), cb = cols.length ? Math.max(...cols.map(e => e.getBoundingClientRect().bottom)) : 0, mt = document.querySelector('.mantra'), mr = mt && mt.getBoundingClientRect();
        const bad = Array.from(document.querySelectorAll('.col,.ttl,.t1,.t2,.k,.col p')).filter(e => (e.classList.contains('col') && e.scrollHeight > e.clientHeight + 2) || e.getBoundingClientRect().bottom > 1080 - 150 || e.getBoundingClientRect().right > 1920).map(e => e.className + ' bottom=' + Math.round(e.getBoundingClientRect().bottom));
        const gl = document.querySelector('.glink'), gr = gl && gl.getBoundingClientRect(); if (gl && (gr.bottom > 1076 || (mr && gr.top < mr.bottom))) bad.push('glink bottom=' + Math.round(gr.bottom));
        if (mt && (mr.top < cb + 8 || mr.bottom > 1078 || Array.from(mt.querySelectorAll('.ml')).some(e => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect().width > 1880; }))) bad.push('mantra');
        return { bad, mantra: mt ? 'top=' + Math.round(mr.top) + ' bottom=' + Math.round(mr.bottom) + ' cols_bottom=' + Math.round(cb) + (gl ? ' link_bottom=' + Math.round(gr.bottom) : '') : null }; });   // the end beat carries no voice: the mantra may sit in the caption band, never over the columns or off the frame
      const ovl = ck.bad, ov = ovl.length; if (ov) overflow++; if (ck.mantra) console.log('§CARD_MANTRA ' + ck.mantra);
      console.log('§CARD beat=' + id + ' card overflow=' + ov + (ov ? ' ' + JSON.stringify(ovl) : '') + ' (a column that overflows, anything in the caption band or past the right edge)'); continue; }
    const FR = byStep[id]; if (!FR || !FR.length) throw new Error('no recording for beat ' + id);
    let i = 0; const add = async (f, t, frames, key, cursor) => { const name = id + '_' + String(++i).padStart(3, '0') + '.png'; plan[id].push(Object.assign({ file: await shot(split(f, t, cursor, stateAt(f.i)), name), frames }, key ? { key } : {})); if (key === 'k') keys++; if (key === 'r') rets++; fontsSeen.add(FONT); };
    const goTo = async (f, frames, key, cursor, last) => {   // the window follows the terminal; a jump down is scrolled, one row per SCROLLF frames; Ctrl-L (the screen cleared) jumps back
      const want = Math.max(0, used(f) - ROWS);
      if (want < top) top = want;
      while (top < want) { top++; scrolls++; await add(f, top, SCROLLF, null, cursor); }
      await add(f, top, last ? null : frames, key, cursor);
    };
    let lastK = null;
    for (let j = 0; j < FR.length; j++) { const f = FR[j], lastOfBeat = j === FR.length - 1;
      if (f.kind === 'k') { lastK = f; await goTo(f, /^[A-Z][a-z]+$/.test(f.what) && f.what.length > 1 ? 10 : 2, 'k', true, false); }
      else if (f.kind === 'r') { if (f.what === 'Return' && lastK && FR[j - 1] && FR[j - 1].kind === 'k' && FR[j - 1].what.length === 1) await goTo(lastK, 8, 'r', false, false); else await goTo(f, 8, 'r', true, false); }
      else if (f.kind === 'a') await goTo(f, 30, null, true, lastOfBeat);
    }
    console.log('§CARD beat=' + id + ' stills=' + plan[id].length + ' font=' + FONT + 'px rows_shown=' + ROWS + ' top_at_end=' + top + ' lower=' + stateAt(FR[FR.length - 1].i).key);
  }
  Object.keys(F.states).forEach(k => { const s2 = F.states[k], c = cols2(s2), f2 = fit(s2); console.log('§CARD_Z state=' + k + ' zoom=' + (c ? (c.z * 2).toFixed(2) + 'x in two columns' : f2[2] + 'x') + ' shown=' + (c ? 2 * c.w + 'x' + Math.round(Math.max(c.hA, c.hB) * c.z) : f2[0] + 'x' + f2[1])); });
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1));
  console.log('§CARD_T fonts=' + JSON.stringify([...fontsSeen]) + ' pty_cols=' + rec.cols + ' strip_cols=' + Math.floor((1920 - 2 * LEFT) / (FONT * CW)) + ' scroll_stills=' + scrolls + ' (one row every ' + SCROLLF + ' frames)');
  console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' pngs=' + n + ' key_stills=' + keys + ' return_stills=' + rets + ' card_overflow=' + overflow);
  if (overflow || fontsSeen.size !== 1) process.exit(1);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
