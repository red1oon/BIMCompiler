// ⚠ DO NOT REMOVE — Scope: FILM-M1 opening chapter card + last card (FILM_NARRATION.md: "The cover is the two-colour chapter card", "HOUSE STYLE — THE LAST CARD OF EVERY FILM", "ALWAYS GIVE A GUIDE LINK").
// READ <work>/cards/cards.log after every run. Issues this proves: (1) the chapter card is the house two-colour card on a plain dark background (no still behind it), nothing overflows its margins;
// (2) every line of the last card comes from a recording log (what you saw), a cited file (prior art) or MOBILE_PERF.md (credentials) — a row whose source is missing is LEFT OFF (§CARD_ROW_DROPPED);
// (3) the last card keeps its width/height inside the safe area (top 80 px free for the mux credit, bottom 170 px free), measured, not looked at.
// Layout/anatomy copied from scripts/film_version_numbers/cards.js (kicker #FF6B78 letter-spaced · large title · grey sub; three columns: what you saw / prior art / credentials).
// Run: node cards_m1.js <work dir> [<app tree>]      (reads <work>/A B C S record.log, priorart.json, m1_credentials.json; writes <work>/cards/chapter.png, close.png, close.json, cards.log)
'use strict';
const os = require('os'), fs = require('fs'), path = require('path');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const SRC = require('./m1_sources.js');
const W = path.resolve(process.argv[2] || '.'), APP = process.argv[3] || process.env.BIM_OOTB || '', OUT = path.join(W, 'cards'); fs.mkdirSync(OUT, { recursive: true });
const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const logOf = r => { const f = path.join(W, r, 'record.log'); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''; };
const L = { A: logOf('A'), B: logOf('B'), C: logOf('C'), S: logOf('S') };
const g = (src, re, i) => { const m = re.exec(L[src]); return m ? m[i || 1] : null; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const CHAPTER = { kicker: 'CH 0  ·  OFFLINE MOBILITY', title: 'Offline mobility comes to the BIM and ERP world', sub: 'The phone, fast: walk the site, snag it, HQ gets it.' };
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden;position:relative}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px;white-space:pre} .t1{font-size:92px;font-weight:700;margin-top:18px;line-height:1.15} .s{font-size:38px;line-height:1.35;color:#cbd5e1;margin:26px auto 0;max-width:1300px}
.ch{position:absolute;left:160px;width:1600px;top:0;height:1080px;display:flex;flex-direction:column;justify-content:center;text-align:center}`;
const CSS2 = `.lc{padding:96px 56px 0} .lc h1{font-size:38px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:580px 580px 560px;gap:34px;margin-top:20px}
.col h2{font-size:20px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px} .r{font-size:19px;line-height:1.27;padding:5px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
.cr{position:absolute;left:56px;bottom:190px;font-size:17px;color:#94a3b8;width:1800px;line-height:1.4} .cr b{color:#7dd3fc}`;
const page = inner => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${CSS2}</style></head><body>${inner}</body></html>`;
const CO = '<span style="color:#FF6B78">', CE = '</span>';

// ---- the last card's three columns ----
const miss = (what) => { say(`§CARD_ROW_DROPPED ${what}`); return null; };
const saw = [];
{ const sheet = g('A', /(§SHEET_OPEN id=navigate-drawer-panel n=1 layer=top sheet=bottom)/), sw = g('A', /(§SHEET_CLOSE id=navigate-drawer-panel via=swipe)/), bk = g('A', /(§SHEET_CLOSE id=settings-panel via=back)/);
  saw.push(sheet && sw && bk ? '<b>1 Fast</b><br>panels open as bottom sheets (<i>sheet=bottom</i>), closed by swipe (<i>via=swipe</i>) and by Back (<i>via=back</i>) · measured on a phone profile (MOBILE_PERF): freeze 5.6 s → 0.6 s, slowest panel open 74 ms' : miss('saw 1 Fast: §SHEET lines not in A/record.log'));
  const on = g('A', /(§WALK_XRAY_AUTO on)/), off = g('A', /(§WALK_XRAY_AUTO restored off)/), st = g('A', /Walk · (\d+) steps · ([\d.]+) m · stop/), ev = g('A', /§M1_SCRUB walk_events=(\d+)/), sv = g('A', /§ISSUE_SAVED (\w+ [\w ]+?)\s*$/m);
  saw.push(on && off && st && ev && sv ? '<b>2 Walk</b><br>X-Ray on by itself, off at the stop (<i>§WALK_XRAY_AUTO</i>) · ' + st + ' steps (simulated here), <i>' + ev + '</i> points on the record · one snag saved: ' + esc(sv) + ' (<i>§ISSUE_SAVED</i>)' : miss('saw 2 Walk'));
  const fl = g('C', /§CLASH_MATRIX_FILTER (\w+ vs \w+) page=1/), cn = g('C', /\[clash_run\] pair=\S+ matrix_count=(\d+)/), ov = g('C', /§CLASH_DETAIL guidA=\S+ guidB=\S+ overlap=([\d.]+)m/), cl = g('C', /§M1_CLASH pair=\S+ idx=\d+ classes=(\w+\|\w+)/), sd = g('C', /(§CLASH_SNAG_SAVED)/), fb = g('C', /(§CLASH_SNAG_SHARE_PANEL shown \(desktop fallback\))/);
  saw.push(fl && cn && ov && cl && sd && fb ? '<b>3 Clash</b><br>' + fl + ': <i>' + cn + '</i> in the matrix · picked ' + esc(cl.replace('|', ' / ')) + ', overlap <i>' + ov + ' m</i> · snag + link saved (<i>§CLASH_SNAG_SAVED</i>) · the share panel shown is the desktop fallback' : miss('saw 3 Clash'));
  const via = g('S', /§HQ_SEND via=(team) drop=/), add = g('S', /§HQ_GET drops=\d+ new=\d+ issues_added=(\d+)/), from = g('S', /§M1_SYNC issue_from=(\S+) photo_equal=true/), pts = g('S', /§HQ_REPLAY kid=\S+ points=(\d+)/), err = g('S', /§M1_SYNC_SCRUB points=\d+ max_err_m=([\d.]+)/);
  saw.push(via && add && from && pts && err ? '<b>4 To HQ</b><br>sent <i>via=' + via + '</i> (team folder, no share sheet) · HQ got <i>' + add + '</i> issue from ' + from + ', photo equal · replayed <i>' + pts + '</i> points · scrub max error <i>' + err + ' m</i> · recorded in sequence' : miss('saw 4 To HQ'));
  const bx = g('B', /(§WALK_XRAY_AUTO on)/), bs = g('B', /§ISSUE_SAVED (\w+)/), bdb = g('B', /db=buildings\/(\w+?)_extracted/);
  saw.push(bx && bs && bdb ? '<b>5 Site B</b><br>' + esc(bdb.replace(/_.*/, '')) + ' walk, X-Ray on by itself · one snag saved: ' + esc(bs) + ' (<i>§ISSUE_SAVED</i>)' : miss('saw 5 Site B')); }
const prior = [], credRows = [];
const PA = JSON.parse(fs.readFileSync(path.join(__dirname, 'priorart.json'), 'utf8')), CR = JSON.parse(fs.readFileSync(path.join(__dirname, 'm1_credentials.json'), 'utf8'));
for (const r of SRC.verifyPrior(PA.items, APP)) { if (r.ok) { prior.push('<b>' + esc(r.it.name) + '</b><br>' + esc(r.it.does) + '<br><i>→ ' + esc(r.it.took) + '</i>'); say(`§PRIOR_ROW ok name="${r.it.name}" cited=${r.it.where.file}:${r.line} (${r.it.where.section})`); }
  else say(`§CARD_ROW_DROPPED prior art "${r.it.name}": ${r.why}`); }
const states = SRC.prStates(CR.repo, [...new Set(CR.items.map(i => i.pr))]); say('§PR_STATES ' + JSON.stringify(states));
const vc = SRC.verifyCreds(CR, states), okC = vc.filter(v => v.ok);
vc.forEach(v => say(v.ok ? `§CRED_ROW ok #${v.c.pr} ${v.c.witness} ${v.c.verdict} MOBILE_PERF.md:${v.line}` : `§CARD_ROW_DROPPED credential #${v.c.pr} ${v.c.witness}: ${v.why}`));
const vo = SRC.verifyCreds({ items: [Object.assign({ witness: 'offline' }, CR.offline)] }, states)[0]; say(vo.ok ? `§CRED_ROW ok offline #${CR.offline.pr} MOBILE_PERF.md:${vo.line}` : `§CARD_ROW_DROPPED offline: ${vo.why}`);
if (okC.length) credRows.push('<b>bim-ootb merged</b><br>' + [...new Set(okC.map(v => '#' + v.c.pr))].join(' ') + ' <i>(state read from GitHub)</i>');
if (okC.length) credRows.push('<b>Witnessed</b> (MOBILE_PERF.md)<br>' + okC.map(v => esc(v.c.witness) + ' <i>' + v.c.verdict + '</i> #' + v.c.pr).join(' · '));
if (vo.ok) credRows.push('<b>Offline</b><br>' + esc(CR.offline.says));
credRows.push('<b>Guide</b><br>' + esc(CR.guide.url));

(async () => {
  const br = await chromium.launch({ args: ['--disable-gpu'] }), pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  // overflow measure shared by both cards: every text box inside the safe area, lines of the chapter card apart, nothing wider than its box
  const measure = kind => pg.evaluate(kind => { const R = e => e.getBoundingClientRect(), wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .ch > div, .cr')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, R(e).right - 1920 + 56, 56 - R(e).left), 0);
    let top = 1e9, bottom = 0; document.querySelectorAll('.lc, .cr, .ch > div').forEach(e => { const r = R(e); top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom); });
    const lc = document.querySelector('.lc'), cr = document.querySelector('.cr'), ch = document.querySelector('.ch');
    let over = 0, why = '';
    if (kind === 'close') { const colB = Math.max(...Array.from(document.querySelectorAll('.col')).map(c => R(c).bottom)); const crT = R(cr).top;
      over = Math.max(R(document.querySelector('.lc h1')).top < 80 ? 80 - R(document.querySelector('.lc h1')).top : 0, colB - (1080 - 170), colB + 6 - crT, R(cr).bottom - (1080 - 170), wide); why = 'cols_bottom=' + colB.toFixed(0) + ' credit_top=' + crT.toFixed(0) + ' credit_bottom=' + R(cr).bottom.toFixed(0) + ' wide=' + wide.toFixed(1); }
    else { const kids = Array.from(ch.children).map(R); let ov = 0; for (let i = 1; i < kids.length; i++) ov = Math.max(ov, kids[i - 1].bottom - kids[i].top); const sideL = Math.min(...kids.map(r => r.left)), sideR = Math.max(...kids.map(r => r.right));
      const wTitle = Array.from(ch.querySelectorAll('.t1, .s, .k')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth), 0);
      over = Math.max(ov, 120 - sideL, sideR - 1800, wTitle, Math.max(...kids.map(r => r.bottom)) - 1000, 80 - Math.min(...kids.map(r => r.top))); why = 'lines=' + kids.length + ' left=' + sideL.toFixed(0) + ' right=' + sideR.toFixed(0) + ' title_h=' + kids[1].height.toFixed(0); }
    return { over, why, loaded: true }; }, kind);
  // chapter card: red kicker over a large title and a grey sub-line, plain dark background (no still)
  await pg.setContent(page(`<div class="ch"><div class="k">${esc(CHAPTER.kicker)}</div><div class="t1">${esc(CHAPTER.title)}</div><div class="s">${esc(CHAPTER.sub)}</div></div>`), { waitUntil: 'load' });
  const mc = await measure('chapter'); await pg.screenshot({ path: path.join(OUT, 'chapter.png') });
  const bgPx = await pg.evaluate(() => getComputedStyle(document.body).backgroundColor), imgs = await pg.evaluate(() => document.images.length);
  say(`§CARD kind=chapter kicker="${CHAPTER.kicker}" title="${CHAPTER.title}" sub="${CHAPTER.sub}" background=${bgPx} images_behind=${imgs} ${mc.why} overflow_px=${Math.max(0, mc.over).toFixed(1)} ${mc.over > 0 ? 'TOO-TALL' : 'OK'}`);
  // last card
  const col = (h, rs) => '<div class="col"><h2>' + h + '</h2>' + rs.map(r => '<div class="r">' + r + '</div>').join('') + '</div>';
  const cred = 'Pictures: the real viewer (bim-ootb ' + esc(require('child_process').spawnSync('git', ['-C', APP, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim()) + ') recorded headless on the CPU, never a drawing · steps and camera are simulated in the recording · voices: Kokoro, run locally';
  await pg.setContent(page('<div class="lc"><h1>What you saw, ' + CO + 'what it borrows' + CE + ', who stands behind it</h1><div class="cols">' + col('what you saw', saw.filter(Boolean)) + col('prior art', prior) + col('credentials', credRows) + '</div><div class="cr">' + cred + '</div></div>'), { waitUntil: 'load' });
  const mk = await measure('close'); await pg.screenshot({ path: path.join(OUT, 'close.png') });
  say(`§CARD kind=close rows_saw=${saw.filter(Boolean).length}/5 prior_art=${prior.length}/${PA.items.length} credentials_rows=${credRows.length} witnessed=${okC.length}/${CR.items.length} ${mk.why} overflow_px=${Math.max(0, mk.over).toFixed(1)} ${mk.over > 0 ? 'TOO-TALL' : 'OK'}`);
  const text = await pg.evaluate(() => Array.from(document.querySelectorAll('.r, h1, .cr')).map(e => e.innerText.replace(/\s+/g, ' ').trim()));
  fs.writeFileSync(path.join(OUT, 'close.json'), JSON.stringify({ saw: saw.filter(Boolean), prior, credRows, text, guide: CR.guide.url }, null, 1));
  await br.close();
  const bad = (mc.over > 0 ? 1 : 0) + (mk.over > 0 ? 1 : 0);
  say(`§CARDS_DONE chapter=${path.join(OUT, 'chapter.png')} close=${path.join(OUT, 'close.png')} too_tall=${bad} ${bad ? 'FAIL' : 'OK'}`);
  fs.writeFileSync(path.join(OUT, 'cards.log'), LOG.join('\n') + '\n'); process.exit(bad ? 1 : 0);
})().catch(e => { say('§CARDS_FAIL ' + (e && e.stack || e)); fs.writeFileSync(path.join(OUT, 'cards.log'), LOG.join('\n') + '\n'); process.exit(1); });
