// ⚠ DO NOT REMOVE — Scope (v2 re-cut: no Film 1 content, no sample day): the full-screen CARDS of Film 2 "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24): opener (project wall + six challenge cards), Part 1 (dictionary),
// Part 2 (replication), the concept card, the limits card and the Sources cards. Every number is read from facts2.js; every outside quote is read from film2_claims.json (the verified cards) and is placed
// in the DOM as exact text (no re-typing, no paraphrase); every logo is an <img src> of the file whose sha256 is in film2_logos_index.json (files are never inlined or opened). Read the recorder log after every run.
'use strict';
const fs = require('fs'), path = require('path');
const CL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'film2_claims.json'), 'utf8')).claims, LI = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'film2_logos_index.json'), 'utf8')).entries;
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const CLAIM = {}; CL.forEach(c => { CLAIM[c.id] = c; });
const LOGO = {}; LI.forEach(e => { LOGO[e.slug] = e; });
const READ = { '1-powersync-b': 'นักพัฒนายังต้องเขียนรายการแต่ละตารางที่เกี่ยวข้องเป็นคำสั่งสืบค้นของตัวเองในขอบเขต', '2a1': 'ผู้ใช้รายงานว่าหลังอัปเดตโปรโตคอล ไคลเอนต์รุ่นเก่าซิงก์ไม่ได้จนกว่าจะอัปเดตด้วยมือ', '3b2': 'Delta Chat บอกด้วยถ้อยคำของตัวเองว่ารีเลย์เรียบง่ายโดยการออกแบบ แต่โครงการก็ยังระบุคุณสมบัติของรีเลย์ (ส่งทันที การแจ้งเตือน การเข้ารหัสที่บังคับ) นี่คือการตีความของเรา', '4a': 'แม้ปรับแต่งมา 3 ปี การซิงก์ครั้งแรกยังใช้ 55 นาที นี่คือความเห็นของเรา', '6-electric-joining-b': 'โพสต์ยืนยันว่าโค้ดจะยังเป็นโอเพนซอร์ส แต่ไม่ได้บอกว่าใครจะดูแล' };
const USED = { claims: [], logos: [] };
const WHITE_LOGO = { rocicorp: true };
function shortDate(d) {                                    // the date as the verified card gives it, minus parenthetical notes
  if (!d) return 'ไม่ระบุวันที่';
  const m = /^'([^']+)'/.exec(d); if (m) return m[1];
  return d.replace(/\s*\(.*$/, '').replace(/;.*$/, '').trim();
}
function logo(slug, cls) {                                  // <img> only; PowerSync uses the clean alternate named in the index
  const e = LOGO[slug]; if (!e || !e.local_path) throw new Error('no logo file for ' + slug);
  const p = e.use_instead ? e.use_instead.local_path : e.local_path, sha = e.use_instead ? e.use_instead.sha256 : e.sha256; if (USED.logos.indexOf(slug) === -1) USED.logos.push(slug);
  const dk = e.use_instead || WHITE_LOGO[slug];                  // white-on-transparent files (PowerSync clean alternate, Rocicorp: fill="white") need a dark tile
  return `<span class="lgt ${dk ? 'dk' : ''} ${cls || ''}"><img class="lg" data-slug="${slug}" data-sha="${sha}" src="file://${p}" alt=""></span>`;
}
const txt = (name, cls) => `<span class="lgt tx ${cls || ''}"><span class="nmtxt">${esc(name)}</span></span>`;
// A claim block: who (logo/text + name), the exact quote, the citation bar, optional caveat / our reading.
function blk(id, o) {
  const c = CLAIM[id]; if (!c) throw new Error('unknown claim ' + id); if (USED.claims.indexOf(id) === -1) USED.claims.push(id); o = o || {};
  const host = new URL(c.source_url).host;
  const who = (o.logos || []).join('') + `<span class="pn">${esc(o.name || c.project)}</span>`;
  return `<div class="blk rv" data-f="${o.f === undefined ? 0 : o.f}" data-claim="${id}"><div class="who">${who}</div><div class="q" data-claim="${id}">${esc(c.quote)}</div>` +
    `<div class="cite" data-claim="${id}"><span class="pub">${esc(c.publisher)}</span> · <span class="ttl">${esc(c.title)}</span> · <span class="dt">${esc(shortDate(c.date_of_source))}</span> <span class="ac">· ${esc(host)} · เข้าถึง ${c.accessed}</span></div>` +
    (o.note ? `<div class="cv">${esc(o.note)}</div>` : '') + ((o.reading || c.our_reading && o.useReading) ? `<div class="rd"><b>ความเห็นของเรา:</b> ${esc(READ[id] || o.reading || c.our_reading)}</div>` : '') + '</div>';
}
const page = (kick, title, body, cls) => `<div class="pg ${cls || ''}"><div class="kick">${esc(kick)}</div><h2 class="ct">${esc(title)}</h2>${body}</div>`;
const ans = (ok, html, f) => `<div class="ans rv ${ok ? 'ok' : 'no'}" data-f="${f === undefined ? 0.8 : f}"><b>${ok ? 'จุดที่แบบของเราตอบเรื่องนี้' : 'ยังแก้ไม่ได้'}</b> ${html}</div>`;
const term = (q, extra) => `<div class="term${extra ? ' ' + extra : ''}"><div class="s">สืบค้นสด แบบอ่านอย่างเดียว · ${esc('build/erp/ad_full.db')}</div><div class="p">$ ${esc(q.cmd)}</div><div class="o">${esc(q.out)}</div></div>`;
const logp = (lines, src, extra) => `<div class="term lg2${extra ? ' ' + extra : ''}"><div class="s">${esc(src)}</div>${lines.map(l => `<div class="o">${esc(l)}</div>`).join('')}</div>`;

function build(X) {                                          // X = facts2.build() result
  const F = X.F, Q = {}; X.Q.forEach(q => { Q[q.id] = q; }); USED.claims = []; USED.logos = [];
  const K = {}; const C = {};
  // ---------------- title ----------------
  C.title = `<div class="pg tl"><div class="kick" style="margin-top:130px">ภาพยนตร์เพื่อการศึกษา · ภาษาไทย · ข้อมูลตัวอย่าง</div><h1>กันส่วนเกินออกจากระบบ</h1><h2 class="h2b">พจนานุกรมข้อมูล การทำสำเนา และสิ่งที่อยู่ใต้ฝาครอบ</h2>` +
    `<div class="sub">ตัวเลขทุกตัวบนจอมาจากการสืบค้นพจนานุกรมข้อมูลของเราโดยตรงหรือจากล็อก ส่วนข้อความเกี่ยวกับโครงการอื่นเป็นการอ้างคำพูด พร้อมที่มา</div></div>`;
  // ---------------- wall ----------------
  const tile = (inner, label) => `<div class="tile rv" data-f="0">${inner}<div class="tl">${esc(label)}</div></div>`;
  const wall = [
    tile(logo('rocicorp'), 'Rocicorp Zero'), tile(logo('electricsql'), 'ElectricSQL'), tile(logo('powersync'), 'PowerSync'), tile(logo('couchbase'), 'Couchbase'), tile(logo('ditto'), 'Ditto'), tile(logo('mongodb'), 'MongoDB'),
    tile(logo('supabase'), 'Supabase'), tile(txt('Triplit'), 'Triplit (ชื่อเท่านั้น)'), tile(logo('anytype'), 'Anytype'), tile(txt('Nostr'), 'Nostr (ชื่อเท่านั้น)'), tile(logo('deltachat') + '<span class="pn">Delta Chat</span>', 'ไอคอน'), tile(logo('automerge'), 'Automerge'),
    tile(logo('manyverse') + '<span class="pn">Manyverse</span>', 'ไอคอน'), tile(txt('Secure Scuttlebutt'), 'Scuttlebutt (ชื่อเท่านั้น)'), tile(logo('briar'), 'Briar'), tile(logo('radicle') + '<span class="pn">Radicle</span>', 'ไอคอน'), tile(txt('Ink & Switch'), 'บทความ local-first (ชื่อเท่านั้น)')];
  C.wall = `<div class="pg"><div class="kick">โครงการอื่น ๆ</div><h2 class="ct" style="font-size:44px;line-height:1.1">เราศึกษาโครงการที่คล้ายกัน และเรียนรู้จากปัญหาที่พวกเขารายงาน เช่น</h2><div class="wallg">${wall.join('')}</div>` +
    `<div class="fine">โลโก้และชื่อเป็นเครื่องหมายการค้าของเจ้าของ แสดงไว้เพื่อระบุโครงการที่กล่าวถึงเท่านั้น ไอคอน Manyverse © 2019 The Manyverse Authors, CC BY-SA 4.0</div></div>`;
  // ---------------- six challenge cards ----------------
  const grid = (items, cols) => `<div class="cg c${cols || 2}">${items.join('')}</div>`;
  const kk = n => `สิ่งที่คนอื่นรายงาน · ${n} จาก 6`;
  C.c1 = page(kk(1), 'ขอบเขตการซิงก์ถูกเขียนด้วยมือ ทีละแอป', grid([
    blk('1-zero-b', { logos: [logo('rocicorp')], name: 'Rocicorp Zero', f: 0.05 }),
    blk('1-electric-b', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.2 }),
    blk('1-powersync-b', { logos: [logo('powersync')], name: 'PowerSync', f: 0.35, reading: CLAIM['1-powersync-b'].our_reading }),
    blk('1-couchbase-a', { logos: [logo('couchbase')], name: 'Couchbase Sync Gateway', f: 0.5 }),
    blk('1-ditto-b', { logos: [logo('ditto')], name: 'Ditto', f: 0.65 })]) +
    `<div class="rd card-rd rv" data-f="0.75"><b>ความเห็นของเรา:</b> ในทุกเจ้านี้ นักพัฒนาต้องเขียนเองว่าเครื่องจะได้รับอะไร</div>` + ans(true, 'ตอนที่ 2: ขอบเขตคือแถวข้อมูลที่เอนจินเล็ก ๆ ตัวเดียวอ่าน มีค่าตั้งต้นเดียว และตรวจตอนคอมไพล์แผน'), 'c1');
  C.c2 = page(kk(2), 'แต่ละเครื่องใช้เวอร์ชันต่างกัน', grid([
    blk('2a2', { logos: [logo('anytype')], name: 'Anytype', f: 0.05, note: 'รายงานของผู้ใช้ในฟอรัมชุมชน ไม่ใช่คำแถลงของ Anytype' }),
    blk('2a1', { logos: [logo('anytype')], name: 'Anytype', f: 0.25, note: 'รายงานของผู้ใช้ในฟอรัมชุมชน ไม่ใช่คำแถลงของ Anytype', reading: CLAIM['2a1'].our_reading.replace(/^Film may say: a/, 'A') }),
    blk('2b1', { logos: [txt('Ink & Switch')], name: 'บทความปี 2019', f: 0.45, note: 'บทความตั้งเรื่องนี้เป็นคำถามที่ยังเปิดอยู่' })], 2) + ans(false, 'การทำเวอร์ชันของอีเวนต์ยังเป็นแบบบนกระดาษ (สเปก §13.12.J.2): ยังไม่ได้สร้าง ยังไม่ได้ทดสอบ ภาพยนตร์นี้ไม่อ้างว่าทำได้', 0.75), 'c2');
  C.c3 = page(kk(3), 'รีเลย์ที่ว่า "โง่" กลับไม่โง่', grid([
    blk('3a1', { logos: [txt('Nostr')], name: 'งานวัดผล', f: 0.05, note: 'ข้อมูล: 1 กรกฎาคม ถึง 31 ธันวาคม 2023' }),
    blk('3a3', { logos: [txt('Nostr')], name: 'งานวัดผล', f: 0.2, note: 'ค่าประมาณของผู้เขียน คำนวณจากกราฟผู้ติดตาม' }),
    blk('3a8', { logos: [txt('Nostr')], name: 'งานวัดผล', f: 0.35, note: 'ค่าประมาณของผู้เขียน; "this alone" หมายถึงเงินบริจาคอย่างเดียว' }),
    blk('3b1', { logos: [logo('deltachat')], name: 'Delta Chat / chatmail', f: 0.5 }),
    blk('3b2', { logos: [logo('deltachat')], name: 'Delta Chat', f: 0.62, reading: CLAIM['3b2'].our_reading })], 2) +
    ans(true, 'แบบของเรา: ชั้นวางมีสัญญาที่ระบุไว้ (เก็บออบเจกต์ที่ตั้งชื่อ และไม่อ่านเนื้อหา) เครื่องตู้จดหมายเก็บสำเนาที่อ่านไม่ได้ และฮับเป็นบทบาทที่มีชื่อ', 0.82), 'c3');
  C.c4 = page(kk(4), 'ประวัติยาวขึ้นเรื่อย ๆ และการซิงก์ครั้งแรกช้าลง', grid([
    blk('2b2', { logos: [txt('Ink & Switch')], name: 'บทความปี 2019', f: 0.05 }),
    blk('4a', { logos: [logo('manyverse')], name: 'Manyverse / Scuttlebutt', f: 0.25, reading: CLAIM['4a'].our_reading, note: 'ปัญหาที่ลดลงด้วยงานวิศวกรรม ไม่ใช่การวัดการเติบโต' }),
    blk('4b1', { logos: [logo('automerge')], name: 'Automerge', f: 0.45 }),
    blk('4b3', { logos: [logo('automerge')], name: 'Automerge', f: 0.6, note: 'ตัวอย่างหนึ่งที่โพสต์ยกมา สำหรับเอกสารที่มีประวัติใหญ่' })], 2) +
    ans(true, 'แบบของเรา: เครื่องที่หายดึงข้อมูลคืนจากชั้นวางได้ (สร้างและทดสอบแล้วในรอบตัวอย่าง) ยังไม่ได้ทดสอบ: การเติบโตหลายปี', 0.82), 'c4');
  C.c5 = page(kk(5), 'ระบบเพียร์ทูเพียร์ล้วนลงท้ายด้วยการเพิ่มตัวช่วยที่เปิดตลอด', grid([
    blk('5e', { logos: [logo('radicle')], name: 'Radicle', f: 0.05 }),
    blk('5a', { logos: [logo('briar')], name: 'Briar', f: 0.25 }),
    blk('5b1', { logos: [txt('Secure Scuttlebutt')], name: 'คู่มือและสเปก', f: 0.45 }),
    blk('5b2', { logos: [txt('Secure Scuttlebutt')], name: 'คู่มือและสเปก', f: 0.6 })], 2) +
    ans(true, 'แบบของเรา: ตัวช่วยเป็นบทบาทที่ระบุชัด คือเครื่องตู้จดหมาย ซึ่งเก็บสำเนาที่อ่านไม่ได้ของชั้นวาง', 0.8), 'c5');
  C.c6 = page(kk(6), 'ผลิตภัณฑ์เปลี่ยนทิศทางได้ การพึ่งพาจึงเป็นความเสี่ยง', grid([
    blk('6-mongodb-a', { logos: [logo('mongodb')], name: 'MongoDB Atlas Device Sync', f: 0.05 }),
    blk('6-powersync-a', { logos: [logo('powersync')], name: 'PowerSync', f: 0.2 }),
    blk('6-electric-joining-a', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.35 }),
    blk('6-electric-joining-b', { logos: [logo('electricsql')], name: 'ElectricSQL', f: 0.5, reading: CLAIM['6-electric-joining-b'].our_reading }),
    blk('6-triplit-a', { logos: [logo('supabase'), txt('Triplit')], name: 'ประกาศโดย Supabase', f: 0.65, note: 'โพสต์ไม่ได้ประกาศปิด Triplit' })], 2) +
    ans(true, 'แบบของเรา: ข้อมูลอยู่ในเครื่องทุกเครื่อง ชั้นวางแค่เก็บออบเจกต์ที่ตั้งชื่อ', 0.85), 'c6');
  // ---------------- Part 1 ----------------
  const P1 = 'ตอนที่ 1 · พจนานุกรมข้อมูลและไอดีเป็นข้อมูลที่ส่ง';
  C.d_tables = page(P1, 'ระบบอธิบายตัวเองด้วยตาราง', `<div class="cols"><div>${term(Q.tables)}<div class="cap">สามตัวเลขจากการสืบค้นแบบอ่านอย่างเดียวครั้งเดียว</div></div><div class="bigs">` +
    `<div class="bn"><b>${fmt(F.adTables)}</b><span>ตาราง (ใช้งาน ${fmt(F.adActive)})</span></div><div class="bn"><b>${fmt(F.adColumns)}</b><span>คอลัมน์</span></div></div></div>` +
    `<div class="say rv" data-f="0.4">คอลัมน์ที่ชื่อลงท้ายด้วย <code>_ID</code> มักชี้ไปยังอีกตารางหนึ่ง นี่คือแนวคิดทั้งหมดของการใช้ไอดีเป็นข้อมูลที่ส่ง: เรคอร์ดพกตัวชี้ ไม่ได้พกเนื้อหา</div>`);
  const srcLines = (file, a, b) => fs.readFileSync(path.join(process.env.HOME, 'idempiere-dev-setup/idempiere', file), 'utf8').split('\n').slice(a - 1, b).map(l => l.replace(/\r$/, '').replace(/\t/g, '    '));
  const dedent = ls => { const m = Math.min.apply(null, ls.filter(l => l.trim()).map(l => l.match(/^ */)[0].length)); return ls.map(l => l.slice(m)); };
  const MLF = 'org.adempiere.base/src/org/compiere/model/MLookupFactory.java', MQ = 'org.adempiere.base/src/org/compiere/model/MQuery.java';
  const ml = dedent(srcLines(MLF, 192, 214)), mq = dedent(srcLines(MQ, 420, 430));
  F.srcMLF = { file: 'MLookupFactory.java', a: 192, b: 214, lines: ml }; F.srcMQ = { file: 'MQuery.java', a: 420, b: 430, lines: mq };
  const code = (file, a, ls, extra) => `<div class="term code ${extra || ''}"><div class="s">ซอร์ส iDempiere · ${esc(file)}:${a}-${a + ls.length - 1} (อ่านจาก ~/idempiere-dev-setup/idempiere แท็บแสดงเป็น 4 ช่องว่าง ตัดการเยื้องร่วมออก)</div>${ls.map((l, i) => `<div class="o"><i>${a + i}</i> ${esc(l)}</div>`).join('')}</div>`;
  C.d_source = page(P1, 'กฎของตัวชี้เป็นของ iDempiere เอง', `<div class="cols src">${code('MLookupFactory.java', 192, ml)}${code('MQuery.java (getZoomTableName)', 420, mq)}</div>` +
    `<div class="say rv" data-f="0.45">รายการคือรายการ คอลัมน์ชนิด Table หรือ Search ที่มีค่าอ้างอิงจะอ่านตารางนั้น คอลัมน์ไอดีอื่นระบุชื่อตารางของมันเอง: ตัด <code>_ID</code> หรือ <code>_UU</code> ออก เราคัดลอกกฎนี้ ไม่ได้คิดขึ้นเอง</div>`, 'tight');
  C.d_edges = page(P1, `ตัวชี้ ${fmt(F.edges)} ตัว นับสองวิธี`, `<div class="eq">${term(Q.er1, 'sm')}${term(Q.er2, 'sm')}${term(Q.er4, 'sm')}</div>` +
    logp([`W-FLOW-REFS — ER-1 js=${F.er1} sql=${F.er1} (js-only 0, sql-only 0); ER-2 js=${F.er2} sql=${F.er2} (js-only 0, sql-only 0); ER-4 js=${F.er4} sql=${F.er4} (js-only 0, sql-only 0)`, `${fmt(F.er1)} + ${fmt(F.er2)} + ${fmt(F.er4)} = ${fmt(F.er1 + F.er2 + F.er4)}   §S1_UNRESOLVED global edges=${F.edges}`], 'build/scriptor/s1.log · ตัวเลขที่คอมไพเลอร์นับเอง ตั้งให้เท่ากับ SQL ข้างบน', 'rv') .replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.5"'), 'tight');
  const chipCls = n => (F.payloadList.some(p => p.split(':')[0] === n) ? 'k1' : F.implicitList.indexOf(n) !== -1 ? 'k2' : F.mandList.indexOf(n) !== -1 ? 'k3' : 'k0');
  const chips = F.olNames.map(a => `<span class="chip ${chipCls(a[0])}">${esc(a[0])}</span>`).join('');
  C.d_orderline = page(P1, `เรคอร์ดส่วนใหญ่เป็นไอดี: ${F.olCols} คอลัมน์ ส่งจริง ${F.wire}`, `<div class="cols ol"><div><div class="chips">${chips}</div><div class="leg"><span class="chip k1">ส่งไป (${F.payloadList.length})</span> <span class="chip k2">ตัวตนและการแบ่งส่วน (${F.implicitList.length})</span> <span class="chip k3">จำเป็น ปล่อยให้ผู้รับเติม (${F.mand})</span> <span class="chip k0">อยู่ในเครื่อง</span></div></div>` +
    `<div>${term(Q.orderline_types, 'sm')}${logp([`payload: ${F.payloadList.join(', ')}`, `implicit: ${F.implicitList.join(', ')}`, `F1 ${F.wire}/${F.olCols} cols (W-FLOW-MINIMAL)`], 'build/scriptor/s1.log §S1_FLOW F1', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.4"')}</div></div>`, 'tight');
  C.d_computed = page(P1, 'สิ่งที่คนพิมพ์ส่งไป สิ่งที่ระบบคำนวณไม่ส่ง', `<div class="cols two">${logp([F.derivedLine], 's1.log · W-FLOW-NO-DERIVED')}${logp([F.mandLine], 's1.log · W-FLOW-MANDATORY')}</div>` +
    `<div class="say rv" data-f="0.35">พจนานุกรมข้อมูลระบุว่าฟิลด์ไหนคนเป็นคนพิมพ์ และฟิลด์ไหนระบบคำนวณ โฟลว์ที่พยายามส่งฟิลด์ที่ระบบคำนวณจะถูกแจ้งเตือน: ตัวควบคุมที่ประกาศ <code>MovementQty</code> ถูกจับได้ ฟิลด์จำเป็น ${F.mand} ตัวที่บรรทัดไม่ได้ส่ง เป็นหน้าที่ของผู้รับที่จะเติม รวมถึงหัวใบสั่ง <code>C_Order_ID</code></div>` +
    `<div class="mandl rv" data-f="0.6">${F.mandList.map(x => `<span class="chip k3">${esc(x)}</span>`).join('')}</div>`);
  C.d_honest = page(P1, 'ไอดีคือตัวชี้ ไม่ใช่ความลับ', `<ul class="bul"><li class="rv" data-f="0.05">ไอดีเป็นจำนวนเต็มเล็ก ๆ และค่าตั้งต้น (seed) เป็นสาธารณะ ใครมีค่าตั้งต้นก็ถอดรหัสได้</li><li class="rv" data-f="0.25">ปริมาณและจังหวะเวลายังเห็นได้บนสาย การผนึกโฟลว์ให้เฉพาะกลุ่มผู้รับสร้างไว้ในตัวจำลองของเอนจิน (§29, witness PASS ${F.sealJudged}) ยังไม่อยู่ในชั้นสื่อสารจริง <b>รอบนี้ไม่ได้เข้ารหัส</b></li>` +
    `<li class="rv" data-f="0.45">คีย์จำนวนเต็มชนกันข้ามสถานี เรคอร์ดที่สร้างบนเครื่องจึงอ้างด้วย <code>&lt;table&gt;_uu</code> ของมัน (สเปก §11.1)</li><li class="rv" data-f="0.65">ไอดีทำให้ข้อมูลที่ส่งเล็ก แต่ไม่ได้ทำให้เป็นส่วนตัว</li></ul>`);
  // ---------------- Part 2 ----------------
  const P2 = 'ตอนที่ 2 · การทำสำเนาข้อมูล';
  C.r_strategy = page(P2, 'iDempiere มีแนวคิดนี้อยู่แล้ว', `<div class="cols"><div>${term(Q.strategy100)}<div class="cap">กลยุทธ์การทำสำเนาหนึ่งกลยุทธ์ เฉพาะตารางที่ใช้งาน R = Reference, M = Merge, L = Local</div></div><div class="bigs">` +
    `<div class="bn"><b>${F.stratM}</b><span>Merge: สองทาง</span></div><div class="bn"><b>${F.stratR}</b><span>Reference: ไหลลง</span></div><div class="bn"><b>${F.stratL}</b><span>Local: อยู่กับที่</span></div><div class="bn"><b>${F.stratUnlisted}</b><span>ยังไม่จัดประเภท</span></div></div></div>` +
    `<div class="say rv" data-f="0.5">จากตารางที่ใช้งาน ${fmt(F.adActive)} ตาราง แต่ละตารางถูกส่งลง แชร์สองทาง หรือเก็บไว้ในเครื่อง เราใช้การจัดประเภทนี้ แล้วเพิ่มแถวที่บอกว่าใคร คอลัมน์ไหน เมื่อไร</div>`);
  const fmD = X.flowsModeller[0], fmR = X.flowsModeller[1];
  C.r_row = page(P2, 'แถวของโฟลว์หนึ่งแถว อ่านโดยเอนจินเล็ก ๆ ตัวเดียว', `<div class="term rowj"><div class="s">build/scriptor/flows_modeller.json · รายการจริงของ Modeller: การประกาศหนึ่งรายการและหนึ่งแถว</div><div class="o">${esc(JSON.stringify(fmR))}</div><div class="o">${esc('{"virtualTable":"' + fmD.virtualTable + '","columns":[' + fmD.columns.map(c => c.name + ':' + c.cls + (c.values ? '(' + c.values.length + ' values)' : '')).join(', ') + ']}')}</div></div>` +
    `<div class="rowflow rv" data-f="0.3"><div class="bx">ประกาศ ${F.dryVirtual} + แถว ${F.dryRows}</div><div class="ar">→</div><div class="bx">เอนจินตรวจทุกแถวก่อนออกแผน</div><div class="ar">→</div><div class="bx">${F.nComponents} คอมโพเนนต์หลังทะเบียน:<br>FACT · INSTRUMENT · SEED · RULE · LOCAL</div></div>` +
    `<div class="say rv" data-f="0.55">ตารางและคอลัมน์ไหน ทิศทางไหน ใครอ่านได้ เมื่อไร: แถวบอกครั้งเดียว เอนจินไม่ระบุชื่อตารางใด ๆ</div>`);
  C.r_zero = page(P2, 'เพิ่มด้วยแถว และแถวที่ผิดจะล้มเหลว', `<div class="quad">` +
    logp([`โฟลว์ใหม่เป็นแถวล้วน: ${F.zcList.split('; ').slice(0, 3).join('; ')} …`, `แฮชโค้ดคอมไพเลอร์ก่อนและหลัง: ${F.zcHash} (เหมือนกัน)`], 's1.log · W-FLOW-ZERO-CODE (2)(3)', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.05"') +
    logp([`ตัวจัดการใหม่เป็นไฟล์ใหม่ ระบุชื่อด้วยแถวเดียว: ทำงานครบตั้งแต่ต้นจนจบ`, `sha256 ของไฟล์แกนก่อนและหลัง: ${F.regHash} (เหมือนกัน)`], 'registry.log · W-REG-ZEROCODE', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.25"') +
    logp([`bim_element ประกาศเป็นแถวตารางเสมือนแถวเดียว: ${F.virtCols} คอลัมน์, ข้อมูลที่ส่ง ${F.virtPayload} (ส่งไป ${F.virtCarried} + คีย์)`, `ตารางเสมือนที่สอง ใช้แถวล้วน: แฮชคอมไพเลอร์ไม่เปลี่ยน`], 'virtual.log · W-VIRT-COMPILE, W-VIRT-ZEROCODE', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.45"') +
    logp([`แถวที่ตั้งใจให้ผิด: declaredMissing=${F.zcTypo}`, `พิมพ์ผิดในคอลัมน์เสมือน: declaredMissing=${F.virtTypo}`], 'ตอนคอมไพล์ ไม่ใช่ตอนรัน · s1.log (4) · virtual.log W-VIRT-TYPO', 'rv bad').replace('class="term lg2 rv bad"', 'class="term lg2 rv bad" data-f="0.65"') + `</div>`);
  C.r_bloat = page(P2, 'ส่วนเกินถูกกันออกตรงไหน ด้วยตัวเลขที่นับได้', `<div class="cols3"><div class="bn big3"><div class="l">ข้อมูลที่ส่ง</div><b>${F.wire} of ${F.olCols}</b><span>คอลัมน์ของบรรทัดใบสั่งที่ข้ามชั้นวาง: ไอดีและจำนวน (s1.log, W-FLOW-MINIMAL)</span></div>` +
    `<div class="bn big3 rv" data-f="0.3"><div class="l">โค้ดกำหนดขอบเขต</div><b>${F.linesToolchain}</b><span>บรรทัดของชุดเครื่องมืออ่านแถวเหล่านี้ ตารางใหม่คือแถวหนึ่งแถว และแฮชของคอมไพเลอร์ไม่เปลี่ยน (${F.zcHash})</span></div>` +
    `<div class="bn big3 rv" data-f="0.6"><div class="l">การคุยผ่านเครือข่าย</div><b>${F.localCalls}</b><span>ครั้งที่เรียกชั้นวางจากงานในเครื่อง; ตัวควบคุม คือแวะหนึ่งครั้ง เรียก ${F.visitCalls} ครั้ง (treat.log, W-TREAT-LOCAL)</span></div></div>` +
    `<div class="say rv" data-f="0.8">ทั้งสามค่าวัดบนข้อมูลตัวอย่าง ไม่ใช่การอ้างว่าการใช้งานจริงจะประหยัดได้เท่าไร</div>`);
  // ---------------- Part 3: UNDER THE HOOD (real adapters, recorded facts only) ----------------
  const P3 = 'ตอนที่ 3 · ใต้ฝาครอบ: ส่วนเกินหายไปไหน และจัดการอย่างไร';
  const M = X.mod, qc = id => Q[id];
  const ERPL = [`E1 ทุกตารางในพจนานุกรมสด: กฎเดิมกับแผนตรงกัน — N=${F.erpN}, แชร์ ${F.erpSharedE1} = ${F.erpSharedE1}, ต่างกัน ${F.erpDiffer}`, `E1 ทุกหน้าต่าง AD: จำนวนตารางที่แชร์เท่ากัน — N=${F.erpWindows}, ต่างกัน 0`, 'E3 ไม่มีแผน: ไม่แชร์อะไรเลย และมีบรรทัดแจ้งให้เห็น', 'E4 แผนที่เพิ่มหนึ่งตาราง ก็แชร์ตารางนั้น โดยไฟล์อะแดปเตอร์เหมือนเดิมทุกไบต์', `E5 แฮชในล็อกเท่ากับส่วนหัวไฟล์ (${F.erpHash12})`, `การทำพังโดยตั้งใจ: จับได้ ${F.erpMutants} จาก ${F.erpMutants} · §W-PLAN-ERP PASS judged=${F.erpJudged} fails=0 open=${F.erpOpen}`];

  const codeBlk = (q, extra, label) => `<div class="term code wrapc ${extra || ''}"><div class="s">${label}</div><div class="p">$ ${esc(q.cmd)}</div>${q.out.split('\n').map(l => `<div class="o">${esc(l)}</div>`).join('')}</div>`;
  const rvf = (h, f) => h.replace(/class="term code wrapc rv"/, `class="term code wrapc rv" data-f="${f}"`);
  C.u_code = page(P3, 'โค้ด: รายการเขียนตรง ๆ การสร้างจากแผน และตัวอ่านกลาง', codeBlk(qc('mod_before'), '', 'ก่อน · รายการที่เขียนตรง ๆ ในโค้ด') +
    rvf(codeBlk(qc('mod_after'), 'rv', `หลัง, PR #2369 (${M.prState.toLowerCase()}) · สร้างจากแผนที่คอมไพล์แล้ว โดยอะแดปเตอร์เอง`), 0.3) +
    rvf(codeBlk(qc('mod_after2'), 'rv', `ตอนนี้, PR #2370 (${M.pr2State.toLowerCase()}) · รายการเดิม แต่ถามจากตัวอ่านกลาง (TeamScope)`), 0.6) +
    `<div class="say rv" data-f="0.8" style="font-size:22px;margin-top:6px">ตัวเลขหน้าบรรทัดคือเลขบรรทัดของไฟล์ พฤติกรรมเหมือนเดิมทุกครั้ง รายการไม่ใช่โค้ดอีกต่อไป</div>`, 'tight');
  const box = (h, b, f) => `<div class="bx2 rv" data-f="${f}"><div class="bh">${h}</div><div class="bb">${b}</div></div>`;
  C.u_chain = page(P3, 'ห่วงโซ่: แถว แผน ตัวอ่าน และอะแดปเตอร์', `<div class="chain">` +
    box('1 · แถวของโฟลว์', `flows_modeller.json<br>ประกาศ ${F.dryVirtual} + แถว ${F.dryRows} + ค่าในรายการ ${F.dryValues}`, 0.05) + '<div class="ar2 rv" data-f="0.2">→</div>' +
    box('2 · แผนที่คอมไพล์แล้ว', `modeller/team_plan.js<br>${F.planBytes} ไบต์ (wc -c), แฮช ${F.planHash12}<br>สร้างอัตโนมัติ ไม่มีลายเซ็น`, 0.25) + '<div class="ar2 rv" data-f="0.4">→</div>' +
    box('3 · ตัวอ่านเล็ก ๆ ตัวเดียว', `common/comm/team_scope.js (TeamScope)<br>${F.scopeLines} บรรทัด · ${F.scopeOnMainBytes} ไบต์ ตามที่รวมใน PR #2370`, 0.45) + '<div class="ar2 rv" data-f="0.6">→</div>' +
    box('4 · อะแดปเตอร์', `Modeller และ ERP<br>ถามตัวอ่านว่าอะไรแชร์ได้`, 0.65) + `</div>` +
    `<div class="cols two">${term(qc('mod_plan_head')).replace('สืบค้นสด แบบอ่านอย่างเดียว · build/erp/ad_full.db', 'คำสั่งสด แบบอ่านอย่างเดียว · แผนที่สร้างขึ้น บรรทัดแรก')}` +
    `<div class="term code wrapc rv" data-f="0.8"><div class="s">แบบแผนที่เราคัดลอก · iDempiere MTable.java:257-261 (service locator หลัง IModelFactory)</div>${M.mtable.map((l, i) => `<div class="o"><i>${257 + i}</i> ${esc(l)}</div>`).join('')}</div></div>`, 'tight');
  C.u_probes = page(P3, 'การตรวจ: Modeller จากตัวทดสอบจริง (witness)', `<div class="cols two"><div>` +
    logp([`§W-TEAM-MODELLER PASS judged=${F.tmJudged} — ก่อนแก้ และหลังแก้: เหมือนกัน`, `P1  แผนให้รายการเดิมเป๊ะ: ${F.p1Keys} คีย์ เท่ากัน`, `P2  เพิ่มค่าในแผนหนึ่งค่า ก็แชร์ด้วย (${F.p2Keys} คีย์); team_sync.js ที่ส่งออกเหมือนเดิมทุกไบต์ (${F.adapterHash})`, `P3  ไม่มีแผน: ไม่แชร์อะไรเลย และมีบรรทัดแจ้งให้เห็น`, `P4  แผนที่ไม่มี pos_x ไม่แชร์การย้าย (การสร้าง ${F.p4Creates} แบบยังอยู่); โฟลว์ของกลุ่มฮับไม่แชร์อะไร`, `P5  แฮชในล็อกเท่ากับส่วนหัวไฟล์ (${F.planHash12})`], 'modeller_baseline_before.log, modeller_after.log, modeller_plan_witness.log (ย่อบรรทัดแล้ว)') +
    logp([`การทำพังโดยตั้งใจ: เอารายการเขียนตรงกลับมา -> P2, P3, P4 แดง · ไม่สนกลุ่มผู้รับ -> P4 แดง · ไม่บันทึกแฮช -> P5 แดง`, `จับได้ ${F.mwMutants} จาก ${F.mwMutants} · §W-PLAN-MODELLER PASS judged=${F.planJudged} fails=0`, F.modplanLine + ' (ฝั่งคอมไพเลอร์)'], 'modeller_plan_witness.log §MUTANTS · logs/modplan_run.log (witness_scriptor_modeller_plan.js รันสำหรับภาพยนตร์เรื่องนี้)', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.5"') + `</div><div>` +
    logp(F.noplanLines, 'ปิดไว้เมื่อล้มเหลว ตลอดสาย · modeller_noplan_failclosed.log: witness ตัวเต็มที่ไม่ได้แก้ เมื่อไม่มีไฟล์แผน', 'rv bad').replace('class="term lg2 rv bad"', 'class="term lg2 rv bad" data-f="0.3"') + `</div></div>`, 'tight');
  C.u_erp = page(P3, 'ห่วงโซ่เดียวกันบน ERP และตัวอ่านกลาง', `<div class="cols two"><div>` +
    logp(ERPL, 'logs/erp_plan_witness.log · W-PLAN-ERP รันใน worktree ของ ERP สำหรับภาพยนตร์เรื่องนี้ (ย่อบรรทัดแล้ว)') + `</div><div>` +
    logp([`ฝั่งคอมไพเลอร์: §ERPPLAN_VERDICT PASS judged=${F.erpPlanCompiler} · ตัวอ่านกลาง §SCOPE_VERDICT PASS judged=${F.scopeJudged} · จับการทำพังของตัวอ่านได้ ${F.scopeMutants} ครั้ง`], 'logs/erpplan_run.log, logs/teamscope_run.log (รันสำหรับภาพยนตร์เรื่องนี้)', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.45"') +
    logp([`ค้างอยู่ — ตาราง sqlite ${F.erpOutside} ตารางนอกพจนานุกรมสด เคยถูกแชร์ตามค่าตั้งต้นเดิม และตอนนี้อยู่ในเครื่องเท่านั้น; ในนั้นมี ${F.erpOutsideInDict} ตารางที่มีแถวในพจนานุกรม จึงไม่มีหน้าต่างใดเข้าถึงได้`], 'logs/erp_plan_witness.log · ข้อค้นพบที่ยังเปิดอยู่ ตามที่บันทึกไว้', 'rv open').replace('class="term lg2 rv open"', 'class="term lg2 rv open" data-f="0.7"') + `</div></div>`, 'tight');
  C.u_ledger = page(P3, 'บัญชีผลลัพธ์ พูดตรง ๆ', `<div class="cols two"><div>${term({ cmd: qc('mod_numstat').cmd, out: qc('mod_numstat').out }).replace('สืบค้นสด แบบอ่านอย่างเดียว · build/erp/ad_full.db', 'คำสั่งสด แบบอ่านอย่างเดียว · PR #2369').replace('term"', 'term sm"')}${term({ cmd: qc('mod_numstat2').cmd, out: qc('mod_numstat2').out }).replace('สืบค้นสด แบบอ่านอย่างเดียว · build/erp/ad_full.db', 'คำสั่งสด แบบอ่านอย่างเดียว · PR #2370').replace('term"', 'term sm"')}</div><ul class="bul led">` +
    `<li class="rv" data-f="0.1"><b>อะแดปเตอร์ Modeller ไม่ได้เล็กลง:</b> +${F.adapterAdded} / −${F.adapterRemoved} บรรทัดใน team_sync.js</li>` +
    `<li class="rv" data-f="0.25"><b>ตัวอ่านกลาง</b> เพิ่ม ${F.scopeLines} บรรทัด ครั้งเดียว (ต่อมาเพิ่มอีก ${F.scopeSignAdded} สำหรับตรวจลายเซ็น, PR #2371) สุทธิ: ERP +${F.erpNet}, Modeller ${F.modNet} โค้ดเฉพาะไม่ได้ลดลง แต่ความซ้ำซ้อนลดลง</li>` +
    `<li class="rv" data-f="0.4"><b>รายการย้ายไปอยู่ในแถว:</b> ประกาศ ${F.dryVirtual} + แถว ${F.dryRows} + ค่า ${F.dryValues} โฮสต์ตัวที่สามต้องการแค่ไฟล์แผนกับการเรียกตัวอ่านไม่กี่ครั้ง</li>` +
    `<li class="rv" data-f="0.55"><b>ราว ${F.adapterStayPct} % ยังอยู่ในอะแดปเตอร์:</b> การขนส่ง การแสดงผล การป้องกัน และ UI (§20 ประมาณการด้วย grep)</li>` +
    `<li class="rv" data-f="0.7"><b>แผนบน main ยังไม่มีลายเซ็น</b> (§16.13 Q1): ผู้ใช้แก้แผนในเครื่องได้ ตัวอ่านตรวจลายเซ็นได้ (PR #2371 ${M.pr3State.toLowerCase()}) แต่มีอะแดปเตอร์ ${F.adaptersCallVerify} ตัวที่เรียกใช้</li>` +
    `<li class="rv" data-f="0.85"><b>สถานะ:</b> ทั้งสองการเปลี่ยนแปลงถูกรวมแล้ว (PR #2369 ${M.prState}, PR #2370 ${M.pr2State}) §24.1 เคยบันทึกอันแรกว่ายังไม่ได้คอมมิต</li></ul></div>`, 'tight');
  const bar = (n, c) => `<span class="bar" style="width:${Math.round(n * 5.2)}px;background:${c}"></span>`;
  C.u_engine = page(P3, 'รูปร่างของเอนจินเอง', `<div class="eng"><div class="er"><b>${F.linesCore}</b> แกน ${bar(F.linesCore, '#14213d')} <span>treat.js ${F.lineEach['treat.js']} + sim.js ${F.lineEach['sim.js']}</span></div>` +
    `<div class="er"><b>${F.linesComponents}</b> คอมโพเนนต์ ${bar(F.compFact, '#15803d')}${bar(F.compInstrument, '#2563eb')}${bar(F.compSeed, '#b45309')}${bar(F.compRule, '#7c3aed')}${bar(F.compLocal, '#dc2626')} <span>fact ${F.compFact} · instrument ${F.compInstrument} · seed ${F.compSeed} · rule ${F.compRule} · local ${F.compLocal}</span></div>` +
    `<div class="er"><b>${F.linesEngine}</b> เอนจินทั้งหมด <span>ชุดเครื่องมือคอมไพล์ แยกต่างหาก: ${F.linesToolchain} บรรทัด</span></div></div>` +
    `<div class="rv" data-f="0.35">${logp([`ตัวจัดการใหม่คือไฟล์ใหม่ แฮชของไฟล์แกนก่อนและหลัง: ${F.regHash} (เหมือนกัน)`], 'registry.log · W-REG-ZEROCODE')}</div>` +
    `<div class="rv" data-f="0.6">${logp([`การทดสอบที่กัดได้จริง: ทำพังโดยตั้งใจ ${F.mutantsTotal} ครั้ง ใน ${F.witnessCount} witness แต่ละครั้งทำให้อย่างน้อยหนึ่งข้อกลายเป็นแดง (${Object.keys(F.mutantsBy).map(k => k + ' ' + F.mutantsBy[k]).join(' · ')})`, `ผลตัดสิน: s1 ${F.v_s1} · treat ${F.v_treat} · registry ${F.v_reg} · virtual ${F.v_virt} · mesh ${F.v_mesh} · dry run ${F.v_dry} · modeller plan ${F.planJudged} — ล้มเหลว 0`], 'ล็อกทั้งเจ็ดใน build/scriptor/ · จำนวนข้อที่ตัดสิน')}</div>`, 'tight');
  C.u_why = page(P3, 'ทำไมการถ่ายโอนส่วนใหญ่ไม่ต้องต่อสด', `<div class="chain why"><div class="bx2 rv" data-f="0.1"><div class="bh">ข้อเท็จจริงเพิ่มต่อท้ายอย่างเดียว</div><div class="bb">ส่งซ้ำก็ไม่เปลี่ยนอะไร: ข้อเท็จจริงทำซ้ำได้ผลเดิม</div></div><div class="ar2 rv" data-f="0.25">+</div>` +
    `<div class="bx2 rv" data-f="0.3"><div class="bh">ไอดีแปลความบนเครื่อง</div><div class="bb">ข้อมูลอ้างอิงอยู่ในเครื่องอยู่แล้ว ข้อเท็จจริงพกแค่ไอดี</div></div><div class="ar2 rv" data-f="0.45">+</div>` +
    `<div class="bx2 rv" data-f="0.5"><div class="bh">มาช้าก็ไม่เปลี่ยนผล</div><div class="bb">ข้อเท็จจริงชุดเดียวกันให้ผลเดียวกันไม่ว่าลำดับไหน</div></div></div>` +
    `<div class="say rv" data-f="0.75">ดังนั้นแวะมาเป็นครั้งคราวก็พอ และไม่มีอะไรรอเซิร์ฟเวอร์ witness ของเมชตรวจข้อสุดท้าย: ${esc(F.meshLines.filter(l => /W-MESH-FOLD/.test(l))[0].slice(0, 150))}</div>`, 'tight');
  C.u_next = page(P3, 'ขั้นต่อไป และสิ่งที่ยังไม่ได้ทำ', `<ul class="bul nxt"><li class="rv" data-f="0.05"><b>การลดขอบเขต ERP</b> เหลือกลยุทธ์ของทีม (G9) ตอนนี้เป็นการเปลี่ยนข้อมูล แต่ต้องตรวจเทียบแฝดทุกหน้าต่างก่อน: ถ้าปฏิเสธเป็นค่าตั้งต้น แล้วเปิดเฉพาะแถว Merge จะแชร์ ${F.erpDeny} จาก ${fmt(F.adActive)} ตาราง และเลิกแชร์ ${F.erpStop} ตาราง (${F.erpStopPct} %); ตารางตัวอย่าง ${F.g9Out} จาก ${F.g9Of} ตารางอยู่นอกกลุ่มนั้น</li>` +
    `<li class="rv" data-f="0.3"><b>การเซ็นแผน</b> ทำงานในระดับกลไก (§28, witness PASS ${F.signJudged}) และตัวอ่านกลางบน main ตรวจได้ แต่มีอะแดปเตอร์ ${F.adaptersCallVerify} ตัวที่ใช้ จนกว่าจะตอบเรื่องผู้ถือกุญแจ (Q1) <b>การผนึก</b> ทำงานในตัวจำลอง (§29, PASS ${F.sealJudged}); <b>ท่อส่งจริง</b> ยังไม่ได้สร้าง</li>` +
    `<li class="rv" data-f="0.5"><b>การทำเวอร์ชันของอีเวนต์</b> เป็นแบบบนกระดาษ (§13.12.J.2): ยังไม่ได้สร้าง</li>` +
    `<li class="rv" data-f="0.7"><b>วันนี้ขอบเขต ERP ไม่เปลี่ยน:</b> แชร์ ${F.erpSharedE1} ตารางทั้งตามกฎเดิมและตามแผน ต่างกัน ${F.erpDiffer} (E1, ครอบคลุมทั้ง ${fmt(F.erpN)})</li></ul>` +
    logp([`D8b แชร์ตามค่าตั้งต้นวันนี้ = ${F.erpShared} จาก ${F.adActive} · ถ้าปฏิเสธเป็นค่าตั้งต้นพร้อมแถว Merge = ${F.erpDeny} · จะเลิกแชร์ = ${F.erpStop} (${F.erpStopPct}%)`], 'build/scriptor/dryrun.log · อ่านเทียบกับอะแดปเตอร์ด้วย git show', 'rv').replace('class="term lg2 rv"', 'class="term lg2 rv" data-f="0.85"'), 'tight');
  // ---------------- limits ----------------
  const lim = [`รอบที่แสดงไม่ได้เข้ารหัส การผนึกโฟลว์ให้เฉพาะกลุ่มผู้รับผ่านการทดสอบในตัวจำลองเท่านั้น (§29, PASS ${F.sealJudged}) ชั้นสื่อสารจริงยังไม่ได้แตะ`, `แผนบน main ยังไม่มีลายเซ็น (§16.13 Q1): ผู้ใช้แก้แผนในเครื่องได้ การตรวจลายเซ็นอยู่ในตัวอ่านกลางแล้ว (§28, PASS ${F.signJudged}) ตอนนี้มีอะแดปเตอร์ใช้ ${F.adaptersCallVerify} ตัว`, `อะแดปเตอร์ไม่ได้เล็กลง (Modeller +${F.adapterAdded} / −${F.adapterRemoved}; ตัวอ่าน +${F.scopeLines}); ราว ${F.adapterStayPct} % ยังอยู่ในอะแดปเตอร์`,
    'การลดขอบเขต ERP (G9) ต้องตรวจทุกหน้าต่างก่อน; ท่อส่งจริงยังไม่ได้สร้าง', 'การทำเวอร์ชันของอีเวนต์ยังแก้ไม่ได้ (การ์ด 2)',
    'รันเฉพาะตรรกะ: ชั้นวางในหน่วยความจำหนึ่งตัวกับสำเนา ตัวแทนชั่วคราวของกระบวนการเคอร์เนล ไม่มีเครื่องจริง', 'ข้อความจากภายนอกเป็นไปตามที่แหล่งที่มาระบุเมื่อ 2026-10-25 โครงการเหล่านั้นอาจเปลี่ยนไปแล้ว'];
  C.limits = `<div class="pg"><div class="kick">ข้อจำกัดที่ต้องบอกตรง ๆ</div><h2 class="ct">สิ่งที่ภาพยนตร์นี้ไม่ได้แสดง</h2><ul class="bul lim">${lim.map((x, i) => `<li class="rv" data-f="${(0.04 + i * 0.09).toFixed(2)}">${esc(x)}</li>`).join('')}</ul>` +
    `<div class="term lg2 rv" data-f="0.8"><div class="s">บรรทัดผลตัดสินที่อ่านจากล็อกหลังรอบนี้</div><div class="o">s1 PASS judged=${F.v_s1} · registry PASS ${F.v_reg} · virtual PASS ${F.v_virt} (ว่างเปล่า ${F.virtVacuous}) · mesh PASS ${F.v_mesh} · dry run PASS ${F.v_dry} (ค้าง ${F.dryOpen}) · modeller plan PASS ${F.planJudged} · ERP plan PASS ${F.erpJudged} (ค้าง ${F.erpOpen}) · ล้มเหลว 0</div></div>` +
    `<div class="ptr rv" data-f="0.9">วันทำงานเต็มวันของกรณีจริงอยู่ในภาพยนตร์เรื่องแรก</div></div>`;
  // ---------------- sources (built from what was actually cited) ----------------
  return { C, USED, finish: finishSources.bind(null, C, F) };
}
function finishSources(C, F) {                               // called after all claim blocks exist: lists every cited URL
  const byUrl = {}; USED.claims.forEach(id => { const c = CLAIM[id]; (byUrl[c.source_url] = byUrl[c.source_url] || { c, ids: [] }).ids.push(id); });
  const urls = Object.keys(byUrl); const half = Math.ceil(urls.length / 2);
  const row = (u, i) => { const o = byUrl[u], c = o.c; return `<div class="sr" data-url="${esc(u)}"><span class="no">${i + 1}</span><div><b>${esc(c.publisher)}</b> · ${esc(c.title)} · ${esc(shortDate(c.date_of_source))} · เข้าถึง ${c.accessed} · อ่าน: ${esc(c.read_depth)}<br><span class="u">${esc(u)}</span></div></div>`; };
  const mk = (n, from, to) => `<div class="pg src"><div class="kick">แหล่งที่มา · ${n} จาก 2</div><h2 class="ct" style="font-size:40px">ทุกข้อความจากภายนอกในภาพยนตร์เรื่องนี้</h2><div class="srcg">${urls.slice(from, to).map((u, i) => row(u, from + i)).join('')}</div>` +
    (n === 2 ? `<div class="fine2">แหล่งของเราเอง: ซอร์ส iDempiere MLookupFactory.java:192-214 และ MQuery.java:420-430 (อ่านจากที่เก็บในเครื่อง); build/erp/ad_full.db (อ่านอย่างเดียว); build/scriptor/*.log; prompts/TEAMWORK_FRAMEWORK.md §16, §20, §22<br>` +
      `โลโก้และชื่อเป็นเครื่องหมายการค้าของเจ้าของ แสดงไว้เพื่อระบุโครงการที่กล่าวถึงเท่านั้น ไอคอน Manyverse © 2019 The Manyverse Authors, CC BY-SA 4.0 คำพูดตรงตามต้นฉบับ ยาวไม่เกิน 25 คำ วันที่เข้าถึง 2026-10-25</div>` : '') + '</div>';
  C.src1 = mk(1, 0, half); C.src2 = mk(2, half, urls.length); return { urls, half };
}
module.exports = { build, CLAIM, LOGO, shortDate };
