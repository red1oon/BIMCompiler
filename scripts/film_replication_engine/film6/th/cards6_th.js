// ⚠ DO NOT REMOVE — Scope: THAI copy of ../cards6.js (English untouched): every on-screen string Thai, numbers still V('<fact id>'), quotes of the claims ledger stay in their ORIGINAL English (a quotation is not translated) with a Thai lead-in. Legacy window / process names and product names stay English. Original scope: the chapter / limits / why / offer cards of Film 6 "No Server to Keep Alive — and the Books Still Close" (TEAMWORK_FRAMEWORK §42.1-§42.3), in the Civil Works chapter-card palette (palette.json, copied from film5).
// NO NUMBER IS TYPED HERE: every figure is V('<fact id>') from facts6_resolve.js output (facts6.resolved.json); a pending fact renders as a visible amber "[pending <owner>]" and is counted by the layout check (§CARD_PENDING). Quotes are Q('<claim id>') from claims6.json (<= 25 words, source printed under them).
// Read logs/cards6_check.log after every run. Cards are 1920x930 (the picture area; subtitles sit in the band below).
'use strict';
const fs = require('fs'), path = require('path');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nf = v => (/^-?\d+$/.test(v) ? Number(v).toLocaleString('en-US') : v);
const CSS = `
:root{--bg:#080A0E;--panel:#1A1A19;--line:#6B6A63;--ink:#FFFFFF;--ink2:#C3C2B7;--cy:#4FC3F7;--ye:#FFEB3B;--gd:#0CA30C;--am:#FAB219;--or:#FF8C1A}
*{box-sizing:border-box;margin:0}
html,body{width:1920px;height:930px;overflow:hidden;background:var(--bg);color:var(--ink);font-family:'Noto Sans Thai','Noto Sans','DejaVu Sans',sans-serif}
.pg{position:absolute;left:0;top:0;width:1920px;height:930px;background-color:var(--bg);background-image:linear-gradient(rgba(26,26,25,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,25,.9) 1px,transparent 1px);background-size:80px 80px}
.tag{position:absolute;left:96px;top:34px;font:700 22px/1 'Noto Sans Thai','Noto Sans';letter-spacing:4px;color:var(--ink2);white-space:nowrap}
.ser{position:absolute;right:96px;top:34px;font:700 22px/1 'Noto Sans Thai','Noto Sans';letter-spacing:4px;color:var(--ink2);white-space:nowrap}
.col{position:absolute;left:96px;top:84px;width:1728px;height:728px;display:flex;flex-direction:column;gap:26px;overflow:hidden}
.cardblk{width:1728px;padding-left:36px;border-left:8px solid var(--cy);flex:none}
.cardblk.free{position:absolute;left:96px;top:250px}.cardblk.free .t{font-size:84px}
.cardblk .k{font:400 36px/1.2 'Noto Sans Thai','Noto Sans';color:var(--ink2);letter-spacing:2px}
.cardblk .t{font:700 60px/1.12 'Noto Sans Thai','Noto Sans';color:var(--ink);margin-top:10px}
.cardblk .s{font:400 32px/1.3 'Noto Sans Thai','Noto Sans';color:var(--ye);margin-top:14px;width:1600px}
.grid{width:1728px;display:grid;gap:22px;flex:none}
.grid.c2{grid-template-columns:1fr 1fr}.grid.c3{grid-template-columns:1fr 1fr 1fr}.grid.c1{grid-template-columns:1fr}
.bx{background:var(--panel);border:2px solid var(--line);border-radius:14px;padding:16px 22px;min-width:0}
.bx.cy{border-color:var(--cy)}.bx.gd{border-color:var(--gd)}.bx.am{border-color:var(--am)}.bx.or{border-color:var(--or)}
.bx h3{font:700 30px/1.2 'Noto Sans Thai','Noto Sans';color:var(--ink)}
.bx .q{font:400 25px/1.35 'Noto Sans Thai','Noto Sans';color:var(--ink);margin-top:8px}
.bx .sb{font:400 22px/1.35 'Noto Sans Thai','Noto Sans';color:var(--ink2);margin-top:8px}
.bx .big{font:800 56px/1.1 'Noto Sans Thai','Noto Sans';color:var(--ink);margin-top:6px}
.bx .big.cy{color:var(--cy)}.bx .big.or{color:var(--or)}.bx .big.ye{color:var(--ye)}
.bx .mono{font:400 20px/1.35 'DejaVu Sans Mono',monospace;color:var(--ink2);margin-top:8px}
.chip{display:inline-block;font:800 20px/1 'Noto Sans Thai','Noto Sans';letter-spacing:1px;padding:7px 12px;border-radius:8px;color:#080A0E;background:var(--cy);white-space:nowrap}
.chip.gd{background:var(--gd)}.chip.am{background:var(--am)}.chip.or{background:var(--or)}
.pend{color:var(--am);font-weight:800}
.take{position:absolute;left:132px;top:820px;width:1692px;font:400 34px/1.3 'Noto Sans Thai','Noto Sans';color:var(--cy)}
.src{position:absolute;left:96px;top:868px;width:1728px;font:400 19px/1.3 'DejaVu Sans Mono',monospace;color:var(--ink2);white-space:nowrap;overflow:hidden}
table.tb{border-collapse:collapse;width:100%}
table.tb td,table.tb th{font:400 23px/1.25 'Noto Sans Thai','Noto Sans';padding:7px 12px;border-bottom:1px solid var(--line);text-align:left;color:var(--ink);vertical-align:top}
table.tb th{font:700 20px/1.3 'Noto Sans Thai','Noto Sans';color:var(--ink2);letter-spacing:1px}
.final{position:absolute;left:0;top:0;width:1920px;height:930px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.final .qq{font:700 78px/1.2 'Noto Sans Thai','Noto Sans';color:var(--ink);width:1500px}
.final .em{font:400 54px/1.2 'Noto Sans Thai','Noto Sans';color:var(--cy);margin-top:70px}
.why{position:absolute;left:96px;top:84px;width:1728px}
.why .w{font:700 52px/1.15 'Noto Sans Thai','Noto Sans';color:var(--ink);padding-left:28px;border-left:8px solid var(--cy);margin-bottom:26px}
.why .w small{display:block;font:400 25px/1.3 'Noto Sans Thai','Noto Sans';color:var(--ink2);margin-top:4px}
.why .mit{font:700 40px/1.2 'Noto Sans Thai','Noto Sans';color:var(--ye);margin-left:36px}
`;
function build(X, CL) {
  const V = id => { const f = X[id]; if (!f) throw new Error('§CARD_FAIL unknown fact ' + id); if (f.status !== 'now') return `<span class="pend">[pending ${esc(f.owner || '?')}]</span>`; return esc(nf(f.value)); };
  const claim = Object.fromEntries(CL.claims.map(c => [c.id, c]));
  const Q = id => { const c = claim[id]; if (!c) throw new Error('§CARD_FAIL unknown claim ' + id); if (c.status.startsWith('UNCONFIRMED')) throw new Error('§CARD_FAIL claim is UNCONFIRMED, cannot go on a card: ' + id); return `<div class="q">“${esc(c.quote)}”</div><div class="sb">${esc(c.source)} · ${esc(c.url.replace(/^https?:\/\//, ''))}</div>`; };
  const page = (n, kick, title, sub, body, take, src) => `<div class="pg"><div class="tag">บทที่ ${esc(n)} · ${esc(kick)}</div><div class="ser">ไม่ต้องเฝ้าเซิร์ฟเวอร์ · ข้อมูลตัวอย่าง</div><div class="col"><div class="cardblk"><div class="k">บทที่ ${esc(n)}</div><div class="t">${esc(title)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}</div>${body || ''}</div>${take ? `<div class="take">${esc(take)}</div>` : ''}${src ? `<div class="src">ที่มา: ${esc(src)}</div>` : ''}</div>`;
  const bx = (cls, inner) => `<div class="bx ${cls || ''}">${inner}</div>`;
  const C = {};
  C.title = `<div class="pg"><div class="tag">ข้อมูลตัวอย่าง · วันทำงานตัวอย่าง</div><div class="ser">TEAMWORK FRAMEWORK §42</div><div class="cardblk free"><div class="k">ERP · LOCAL FIRST</div><div class="t" style="font-size:78px">ไม่ต้องเฝ้าเซิร์ฟเวอร์ — แต่ยังปิดบัญชีได้</div><div class="s">การนำเข้าข้อมูลมาตรฐานของ ERP แบบ local first: Unicenta POS และ Micro Finance</div></div></div>`;
  C.ch0 = page('0', 'เซิร์ฟเวอร์อยู่ตรงไหน', 'เซิร์ฟเวอร์อยู่ตรงไหน', 'SQLite ก็ถูกถามแบบเดียวกัน และวิศวกรเรียกคำตอบว่า local-first',
    `<div class="grid c2">${bx('cy', '<h3>SQLite</h3>' + Q('sqlite-serverless'))}${bx('cy', '<h3>Local-first software (บทความ)</h3>' + Q('lf-secondary'))}</div>`, 'เซิร์ฟเวอร์เก็บสำเนารอง ส่วนฐานข้อมูลอยู่ที่โต๊ะทำงาน', 'claims6.json: sqlite-serverless, lf-secondary (ข้อความอ้างอิงเป็นภาษาอังกฤษตามต้นฉบับ)');
  C.ch0b = page('0', 'ตารางนำเข้า', 'ตารางนำเข้าคือร่องรอยการตรวจสอบบัญชี', `พจนานุกรมของระบบมีตารางนำเข้า ${'@@dict_i_tables@@'} ตาราง และ ${'@@dict_import_procs@@'} โปรเซสที่สร้างบนคลาส Import`,
    `<div class="grid c2">${bx('cy', '<h3>วิกิ iDempiere</h3>' + Q('idem-imp-a'))}${bx('cy', '<h3>Oracle Retail Sales Audit (ค้าปลีก)</h3>' + Q('resa-load'))}${bx('cy', '<h3>Dynamics 365 Commerce (ค้าปลีก)</h3>' + Q('d365-valid'))}${bx('cy', '<h3>ERPNext POS (จุดขาย)</h3>' + Q('erpnext-subledger'))}</div>`, 'ข้อมูลจากภายนอกลงตารางนำเข้าก่อน แล้วผู้มีบทบาทที่กำหนดเป็นผู้นำเข้า', 'claims6.json: idem-imp-a, resa-load, d365-valid, erpnext-subledger; facts: dict_i_tables, dict_import_procs');
  C.ch1 = page('1', 'เครื่องคิดเงินขายต่อ', 'เครื่องคิดเงินขายต่อ ไม่ว่าออนไลน์หรือไม่', 'ใบขายแต่ละใบถูกเขียนที่เครื่องเป็นแถวนำเข้า ยังไม่มีอะไรลงบัญชี',
    `<div class="grid c3">${bx('or', `<h3>เครื่องคิดเงิน: OFFLINE · ออฟไลน์</h3><div class="big or">${V('poss_decl_lines')}</div><div class="sb">รายการ I_Order ที่ประกาศไว้</div>`)}${bx('or', `<h3>เครื่องคิดเงิน: OFFLINE · ออฟไลน์</h3><div class="big or">${V('poss_decl_tenders')}</div><div class="sb">ยอดชำระ I_Payment ที่ประกาศไว้ ยังไม่มีออร์เดอร์หรือการรับชำระ</div>`)}${bx('cy', `<h3>ใบขายตัวอย่าง</h3><div class="big cy">${V('poss_k1_total')}</div><div class="sb">= ${V('poss_k1_tender_a')} + ${V('poss_k1_tender_b')} จากยอดชำระ</div>`)}</div>`, 'ตอนถูกตัดการเชื่อมต่อ เครื่องเก็บใบขายไว้ @@foff_tickets@@ ใบ การแวะครั้งเดียวทีหลังส่งไปครบพอดี ไม่เคยต้องใช้เวลาจริง', 'W-POS-SALES VIEW/deposit, VIEW/totals (pos_sales.log) · W-FILM-OFFLINE');
  C.ch2 = page('2', 'ผู้กู้', 'ผู้กู้จ่ายเงินจากโทรศัพท์', 'ตรวจใน W-MF-SEED บนข้อมูล GardenWorld: ลูกค้าจริงสองราย โทรศัพท์สองเครื่อง',
    `<div class="grid c3">${bx('gd', '<h3>โทรศัพท์: ONLINE · ออนไลน์</h3><div class="sb">ตัวตรวจสอบตรวจสลิปแล้ว โทรศัพท์แสดง “ได้รับเงินแล้ว” ก่อนการแวะใดๆ</div><div style="margin-top:12px"><span class="chip gd">ตรวจแล้ว</span></div>')}${bx('or', '<h3>โทรศัพท์: OFFLINE · ออฟไลน์</h3><div class="sb">ยังเขียนแถวข้อมูลไว้ โทรศัพท์บอกชื่อบริการที่ยังไม่ตอบรับ เก็บรายการที่ต้องทำ และตรวจใหม่เองเมื่อออนไลน์</div><div style="margin-top:12px"><span class="chip gd">ตรวจแล้ว</span></div>')}${bx('cy', `<h3>ใบแจ้งหนี้และสลิป</h3><div class="q">${V('mf_inv_total')} · สลิป ${V('mf_slip1_amt')}</div><div class="sb">ยอดคงค้าง ${V('mf_open_after_slip1')} คำนวณขึ้นใหม่ ไม่ได้คัดลอก</div>`)}</div>`, 'ตัวตรวจสอบคือแถวอะแดปเตอร์ SlipOK เป็นตัวอย่าง สลิปที่ถูกปฏิเสธไม่เคยแสดงว่าจ่ายแล้ว', 'W-MF-SEED V1, V2, V3, V4, S1, B1 (mf_seed.log)');
  C.ch3 = page('3', 'สำนักงานใหญ่', 'สำนักงานใหญ่ทำงานเมื่อถึงเวลาทำงาน', 'ทุกขั้นเป็นหน้าต่างและโปรเซสของ legacy ที่ผู้ตรวจสอบบัญชีรู้จักอยู่แล้ว',
    `<div class="grid c2">${bx('gd', `<h3>เมนูเป็นไปตามพจนานุกรม</h3><div class="big">${V('hq_menu_x')} จาก ${V('hq_menu_n')}</div><div class="sb">รายการเมนูตรงกัน ตามบทบาท</div>`)}${bx('or', `<h3>ใบขายที่ยอดไม่ตรงยังอยู่ครบ</h3><div class="q">ยอดชำระ ${V('poss_mis_tenders_total')} · ใบแจ้งหนี้ ${V('poss_mis_lines_total')} · เอกสารที่สร้าง ${V('poss_mis_docs')}</div><div class="sb">ทุกแถวเก็บเหตุผลไว้ (I_ErrorMsg)</div>`)}${bx('cy', `<h3>Replenish Report → ใบเคลื่อนย้ายสินค้าใบเดียว</h3><div class="q">จำนวน ${V('hq_qty_123')} / ${V('hq_qty_130')} / ${V('hq_qty_134')} · รายการเคลื่อนย้าย ${V('hq_mv_lines')}</div>`)}${bx('gd', `<h3>บัญชีลงตัว</h3><div class="q">รายการบัญชีแยกประเภทที่เพิ่ม ${V('poss_fact_added')} = ${V('poss_fact_own')}</div><div class="sb">ผลของชุดนำเข้า เทียบกับเอกสารของใบขายนั้นเอง</div>`)}</div>`, 'รันซ้ำ: รอบหลังนำเข้าได้ ' + '@@poss_rerun_new@@' + ' ใบ', 'W-POS-SALES; W-HQ-CLERK H3, H9, H10 (hq_clerk.log)');
  C.ch4 = page('4', 'เฉพาะเหตุการณ์ที่เดินทาง', 'วันทำงานกลับมาถึงทุกโต๊ะ', 'รายการสินค้าขึ้นไป ใบเคลื่อนย้ายสินค้ากลับลงมา นอกนั้นไม่มี',
    `<div class="grid c3">${bx('or', `<h3>เครื่องคิดเงิน แบบสำนักงาน</h3><div class="big or">${V('ppb_before_ops')} การทำงาน</div><div class="sb">${V('ppb_before_bytes')} ไบต์</div>`)}${bx('cy', `<h3>เครื่องคิดเงิน แผนแบบจุดขาย</h3><div class="big cy">${V('ppb_after_ops')} การทำงาน</div><div class="sb">${V('ppb_after_bytes')} ไบต์: แถวเติมสต็อก</div>`)}${bx('gd', `<h3>ผู้กู้อีกคน</h3><div class="big">${V('ppb_b2_in')} จาก ${V('ppb_b2_delivered')}</div><div class="sb">รับเข้า; ของผู้กู้คนแรกเป็น ${V('ppb_b2_foreign')}</div>`)}${bx('am', '<h3>อยู่ในการ์ดข้อจำกัด</h3><div class="sb">ตัวกลางยังส่งให้ แต่ละเครื่องปฏิเสธเองในเครื่อง การซ่อนไบต์ที่ตัวกลางต้องปิดผนึกกลุ่มผู้รับ</div>')}${bx('cy', `<h3>การบันทึกที่ล้าสมัยได้ข้อความของ legacy เอง</h3><div class="q">“${V('so_conflict_msg')}”</div>`)}</div>`, '', 'W-POS-PLAN browser (pos_plan.log); W-TEAM-SO (team_so.log)');
  C.ch4c = page('4c', 'ไม่ต้องตรวจแบบเรียลไทม์', 'การคืนสินค้ากับสะสมแต้ม ไม่ต้องตรวจแบบเรียลไทม์', 'เครดิตสะสมอยู่ที่โทรศัพท์ของผู้ซื้อ เครื่องคิดเงินต่างเครื่องจึงไม่มียอดร่วมให้แย่งกัน',
    `<div class="grid c3">${bx('gd', `<h3>สะสม · ใช้ · สแกนซ้ำ</h3><div class="big">${V('tc_earn')} · ${V('tc_redeem')} · ${V('tc_second')}</div><div class="sb">การสแกนซ้ำไม่ทำให้เกิดอะไร</div>`)}${bx('or', `<h3>โทรศัพท์ที่ถูกย้อนกลับไปสถานะเก่า</h3><div class="big or">${V('tc_overspend')}</div><div class="sb">ถูกทำเครื่องหมายตอนปิดยอด: ตรวจพบตอนสิ้นวัน ไม่ได้ป้องกัน</div>`)}${bx('gd', `<h3>การคืน = รายการติดลบในออร์เดอร์</h3><div class="big">${V('ret_order_total')}</div><div class="sb">Import Orders รับได้ เมื่อทำให้สมบูรณ์ ของกลับเข้าสต็อก (สต็อก +${V('ret_onhand')}) และใบแจ้งหนี้เป็นยอดติดลบ การเชื่อมกับใบขายเดิม การนับเงินสด และกฎย้อนรายการ ยังเป็นข้อกำหนด ยังไม่ได้สร้าง</div>`)}</div>`, 'สิ่งที่อาจผิดพลาดมีน้อย มีขอบเขตตามนโยบาย และตรวจพบตอนสิ้นวัน', 'W-TREAT-CODE (scriptor_treat.log); W-POS-RETURN (pos_return.log); TEAMWORK_FRAMEWORK §39 R5, §42.2');
  const PR = (name, built, wit, st) => `<tr><td>${esc(name)}</td><td>${built}</td><td>${wit}</td></tr>`;
  C.ch5 = page('5', 'แนวปฏิบัติที่ดี', 'สร้างแบบที่ซอฟต์แวร์ดีควรสร้าง', '', `<div style="width:1728px;flex:none"><table class="tb"><tr><th>หลักการ</th><th>สิ่งที่เราสร้าง</th><th>ตรวจโดย</th></tr>` +
    PR('แยกหน้าที่ให้ชัด', `เครื่องคิดเงิน ${V('ppb_before_ops')} → ${V('ppb_after_ops')} การทำงาน`, 'W-POS-PLAN') +
    PR('หนึ่งงานมีตัวทำเพียงตัวเดียว', `ตัวทำงานเอกสาร ${V('wx_judged')} ข้อ · บัสเหตุการณ์ ${V('bus_judged')} ข้อ`, 'W-UPS-E2-HOST · W-BUS') +
    PR('เปิดต่อการขยาย ปิดต่อการแก้', 'การนำเข้าการขายเป็นปลั๊กอิน แฮชฐานเหมือนเดิม', 'W-POS-SALES') +
    PR('สิทธิ์น้อยที่สุด', `${V('grant_judged')} ข้อ`, 'W-PLUGIN-GRANT') +
    PR('รันซ้ำได้ผลเท่าเดิม', `รอบหลังนำเข้าได้ ${V('poss_rerun_new')}`, 'W-POS-SALES RERUN') +
    PR('ทดสอบตัวทดสอบ', `โค้ดที่จงใจทำให้พังถูกจับได้ ${V('mfs_mut_killed')}/${V('mfs_mut_total')} · ${V('hq_mut_killed')}/${V('hq_mut_total')} · ${V('ppb_mut_killed')}/${V('ppb_mut_total')}`, 'W-MF-SEED · W-HQ-CLERK · W-POS-PLAN') +
    PR('เขียนให้ยึดอินเทอร์เฟซ', 'ใส่อะแดปเตอร์ตัวตรวจสอบตัวใหม่ได้ โดยไม่ต้องแก้โค้ดนอกอะแดปเตอร์', 'W-MF-SEED V4') +
    PR('ผลลัพธ์เดียวกันทุกเครื่อง', `ตัดสินผู้ทำเอกสารตามกฎ ณ ขณะนั้น ${V('exe_judged')} ข้อ · ส่งตามเมื่อผูกเครื่อง ${V('pp_judged')} ข้อ`, 'W-UPS-E3 · W-POS-PLAN') +
    PR('ตัวอ่านเดียวสำหรับสิ่งที่เครื่องถืออยู่', `${V('tipr_judged')} ข้อ จับโค้ดที่ทำให้พังได้ ${V('tipr_mut_killed')}`, 'W-TIPR') +
    PR('ลบให้มากเท่าที่เพิ่ม', `<span class="chip am">ยังไม่ถึง</span> เพิ่ม ${V('pr_added')} · ลบ ${V('pr_deleted')}`, 'ผลต่างที่รวมแล้ว, PR 2431') + `</table></div>`, '', 'TEAMWORK_FRAMEWORK §42.3 (หลักการที่ไม่มีการตรวจจะไม่ถูกอ้าง); facts6.spec.json');
  C.limits = page('L', 'ข้อจำกัด', 'ข้อจำกัด พูดตรงๆ', 'ระบุจากบันทึกการตรวจรอบสุดท้ายในวันที่บันทึกภาพ',
    `<div class="grid c2">${bx('am', '<h3>ยังไม่ได้สร้าง</h3><div class="sb">แอปเครื่องคิดเงินแบบแยก: ใบขายเข้าทางหน้าต่างนำเข้า แถวยอดชำระถูกเขียนที่เครื่อง แต่แสดงเฉพาะรายการสินค้าที่เดินทางขึ้น การซ่อนไบต์ที่ตัวกลางต้องปิดผนึกกลุ่มผู้รับ</div>')}${bx('am', '<h3>เป็นข้อกำหนด ยังไม่ได้สร้าง</h3><div class="sb">การเชื่อมการคืนกับใบขายเดิม (G-11) การนับเงินสดและกฎย้อนรายการของการคืน (G-13) รหัสใช้ครั้งเดียวและเพดานต่อเครื่อง (G-14)</div>')}${bx('am', `<h3>ตัวเลขตรงๆ</h3><div class="sb">รอบนี้เพิ่ม ${V('pr_added')} บรรทัด และลบ ${V('pr_deleted')} บรรทัด งบ “ลบให้มากเท่าที่เพิ่ม” ยังไม่ถึง และ Import Payment ของ legacy ไม่มีตัวกันซ้ำของตัวเอง</div>`)}${bx('am', '<h3>วิธีการ</h3><div class="sb">พฤติกรรมของ legacy อ่านจากซอร์สโค้ด ไม่ได้เทียบข้างกันตรงๆ เพราะฐานข้อมูล legacy ใช้งานไม่ได้ตอนบันทึกภาพ</div>')}</div>`, '', 'TEAMWORK_FRAMEWORK §41.1, §42.2; facts pr_added, pr_deleted (git diff --shortstat)');
  C.earlier = `<div class="pg"><div class="tag">ฉากหลัง</div><div class="ser">ไม่ต้องเฝ้าเซิร์ฟเวอร์</div><div class="cardblk free"><div class="k">ภาพยนตร์ก่อนหน้านี้ ไม่ทำซ้ำในเรื่องนี้</div><div class="s" style="color:var(--ink)">No server in the sale path<br>Keeping the bloat off the pipe<br>Trust and the thin pipe<br>The server is dead</div></div></div>`;
  C.why = `<div class="pg"><div class="tag">ทำไมเราทำแบบนี้</div><div class="ser">ไม่ต้องเฝ้าเซิร์ฟเวอร์</div><div class="why"><div class="w">เข้ากันได้กับของเดิม<small>ตารางนำเข้าและโปรเซสที่คนของคุณรู้จักอยู่แล้ว ระบบคู่แฝดที่ไม่ต่างจาก legacy เลย</small></div><div class="w">ยั่งยืน<small>ไม่มีเซิร์ฟเวอร์ให้ต้องเฝ้า กฎคือแถวข้อมูล การลบถูกนับ</small></div><div class="w">ทำงานร่วมกันได้<small>ตารางนำเข้าเดียวกับที่ตัวโหลดไฟล์ ไฟล์ธนาคาร หรือเครื่องคิดเงินใดๆ เขียนลงไป อินเทอร์เฟซตัวตรวจสอบมาตรฐานเดียว</small></div><div class="w">อธิปไตยข้อมูล<small>ข้อมูลอยู่บนอุปกรณ์ของคุณเอง</small><span class="mit">ใบอนุญาต MIT</span></div></div></div>`;
  C.offer = `<div class="pg"><div class="final"><div class="qq">คุณนึกออกไหม ว่ามีสถานการณ์ใดที่ระบบนี้จะล้มเหลว</div><div class="em">red1org@gmail.com</div></div></div>`;
  // fact placeholders that must live inside static strings
  Object.keys(C).forEach(k => { C[k] = C[k].replace(/@@([a-z0-9_]+)@@/g, (m, id) => V(id)); });
  return { C, CSS, ORDER: ['title', 'ch0', 'earlier', 'ch0b', 'ch1', 'ch2', 'ch3', 'ch4', 'ch4c', 'ch5', 'limits', 'why', 'offer'] };
}
module.exports = { build, CSS };
