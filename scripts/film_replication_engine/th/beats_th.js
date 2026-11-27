// ⚠ DO NOT REMOVE — Scope: Thai BEAT TITLES and Thai ON-SCREEN NOTES for the Thai cut (prompts/TEAMWORK_FRAMEWORK.md §16.22). The beat structure, trace ranges and anchors are the English ones (../beats.js, untouched);
// only the words change. Every number in a note is read from facts.json (R.F), exactly as in the English notes. Terms follow strings_th.js GLOSSARY.
'use strict';
const En = require('../beats.js'), T = require('./strings_th.js');
const retitle = list => list.map(b => (b.title ? Object.assign({}, b, { title: T.strip[b.id] }) : b));
const POS = retitle(En.POS), MF = retitle(En.MF);
const fmt = En.fmt;
function buildNotes(R, part, beats) {
  const F = R.F, tr = part === 1 ? R.pos : R.mf, notes = [];
  const B = id => beats.find(b => b.id === id);
  const find = (id, pred, nth) => { const b = B(id); let k = 0; for (let i = b.from; i < b.to; i++) if (pred(tr[i], i)) { if (k++ === (nth || 0)) return i; } throw new Error('note anchor not found in beat ' + id + ' (nth ' + (nth || 0) + ')'); };
  const add = (beat, after, card, html, cls, src) => notes.push({ beat, after, card, html, cls: cls || '', src });
  const atF = (beat, f, card, html, cls, src) => notes.push({ beat, atFrac: f, card, html, cls: cls || '', src });
  if (part === 1) {
    add('setup', find('setup', e => e.kind === 'send'), 'HUB', `ช่วงออนไลน์ที่ 1: วางบัญชีราคา และสต็อกเริ่มต้น <b>${F.openStock}</b> ของ A ไว้บนชั้นวาง (ตัวอย่าง)`, '', 'trace · witness source');
    add('setup', find('setup', e => e.actor === 'A' && e.kind === 'recv'), 'A', `A รับทั้งสองอย่างจากชั้นวาง แล้วกลับเป็นออฟไลน์`, '', 'trace');
    ['sale1', 'sale2', 'sale3'].forEach((k, q) => add('selling', find('selling', e => e.kind === 'local-sale', q), 'A', `ใบขายที่ ${q + 1}: ขาย <b>${F[k]}</b> ชิ้น (ตัวอย่าง) ไม่มีอะไรข้ามชั้นวาง`, '', 'trace'));
    add('selling', find('selling', e => e.kind === 'apply-code', 0), 'PH1', `สแกนรหัสสะสม A-1: เครดิต ${F.credit1 - F.earnDelta} → <b>${F.credit1}</b> อยู่บนโทรศัพท์ ไม่ผ่านชั้นวาง`, '', 'trace');
    add('selling', find('selling', e => e.kind === 'apply-code', 1), 'PH1', `สแกนรหัสใช้เครดิต A-2: เครดิต ${F.credit1} → <b>${F.credit2}</b>`, '', 'trace');
    add('selling', find('selling', e => e.kind === 'noop-code'), 'PH1', `สแกน A-2 ซ้ำ ไม่เกิดอะไรขึ้น`, '', 'trace');
    add('outage', find('outage', e => e.kind === 'visit-failed'), 'A', `ลิงก์ขาด แวะไม่สำเร็จ <b>${F.queuedOutage}</b> รายการรออยู่ในเครื่อง ไม่มีอะไรหาย`, 'bad', 'trace · treat.log W-TREAT-OFFLINE');
    add('outage', find('outage', e => e.actor === 'A' && e.kind === 'put', F.deliveredSales + F.deliveredCodes - 1), 'A', `18:30 ลิงก์กลับมา: ส่งบรรทัดการขาย <b>${F.deliveredSales}</b> บรรทัด และรหัส <b>${F.deliveredCodes}</b> รหัส`, 'ok', 'trace');
    add('outage', find('outage', e => e.actor === 'HUB' && e.kind === 'accept', F.hubAcceptsSales - 1), 'HUB', `รับบรรทัดการขาย <b>${F.hubAcceptsSales}</b> บรรทัด สต็อกที่คำนวณได้ ${F.openStock} − ${F.salesTotal} = <b>${F.hubStockAfterSales}</b>`, '', 'trace · derived');
    add('outage', find('outage', e => e.actor === 'HUB' && e.kind === 'send'), 'HUB', `${F.hubStockAfterSales} ต่ำกว่า ${F.minLevel}: กฎเรียก Generate Replenishment (ตัวแทนชั่วคราว) → เติมสต็อก <b>${F.replenQty}</b> ให้ A`, '', 'treat.log W-TREAT-STOCKLOOP');
    add('outage', find('outage', e => e.actor === 'PH1' && e.kind === 'put', F.phoneReports - 1), 'PH1', `รายงานรหัสที่สแกนไปแล้ว <b>${F.phoneReports}</b> รหัส`, '', 'trace');
    add('day2', find('day2', e => e.actor === 'A' && e.kind === 'recv'), 'A', `นับเองได้ <b>${F.stockMeet}</b> = ของ HQ <b>${F.stockMeet}</b>`, 'ok', 'treat.log FILMDAY-POS-stock');
    atF('day2', 0.55, 'B', `กล่องรับของ B: <b>${F.bInbox}</b> · B อ่านส่วนของ A บนชั้นวาง: ถูกปฏิเสธ (นอกขอบเขต)`, 'bad', 'treat.log W-TREAT-STOCKLOOP, W-TREAT-BLIND');
    add('lost', find('lost', e => e.kind === 'fail'), 'A', `เครื่องหาย ยังไม่ได้ส่ง: <b>${F.unsent}</b> หายไปพร้อมเครื่อง`, 'bad', 'trace');
    add('lost', find('lost', e => e.kind === 'restore'), 'A', `กู้คืน: ของตนเอง ${F.restoreOwn} ส่งถึง A ${F.restoreDown} นับ ${F.stockBefore} → <b>${F.stockAfter}</b> = HQ <b>${F.stockHubDay2}</b> รหัสถัดไป <b>${F.nextCode}</b>`, 'ok', 'trace · treat.log FILMDAY-POS-stock, W-TREAT-DEVICEFAIL');
    add('reuse', find('reuse', e => e.kind === 'local-sale'), 'A', `วันเดียวกัน เลขใบขายเดียวกัน แต่ <b>${F.reuseQty}</b> ชิ้น เนื้อหาต่างกัน`, '', 'trace');
    atF('rolled', 0.12, 'PH1', `กู้คืนจากสำเนาเก่า: โทรศัพท์แสดงเครดิต <b>${-F.rolledRedeem}</b> อีกครั้ง`, 'bad', 'trace apply-code B-1 (balance − delta)');
    add('rolled', find('rolled', e => e.kind === 'redeem'), 'B', `แคชเชียร์ B ออกรหัสใช้เครดิต <b>${F.rolledRedeem}</b>`, '', 'trace');
    add('settle', find('settle', e => e.kind === 'COLLISION'), 'HUB', `COLLISION (ชนกัน) ${F.reuseKey}: คีย์เดียวกัน เนื้อหาต่างกัน เก็บฉบับเดิมไว้`, 'bad', 'trace · treat.log FILMDAY-POS-code');
    add('settle', find('settle', e => e.kind === 'overspend'), 'HUB', `OVERSPEND (ใช้เกินยอด) ${F.overspendAccount}: ยอด <b>${F.overspendBalance}</b> ตรวจพบตอนปิดยอด: รายที่อาจขึ้นบัญชีดำ (FL-7)`, 'bad', 'trace · treat.log W-TREAT-CODE');
    add('hqlost', find('hqlost', e => e.kind === 'fail'), 'HUB', `เครื่องผู้ดูแลหาย ข้อมูลที่คำนวณไว้ถูกล้างทั้งหมด`, 'bad', 'trace');
    add('hqlost', find('hqlost', e => e.kind === 'rebuild'), 'HUB', `สร้างใหม่จากชั้นวาง: <b>${F.rebuildRecords}</b> รายการ เหมือนเดิม ออบเจกต์บนชั้นวาง ${F.shelfBefore} → <b>${F.shelfAfter}</b> ไม่ซ้ำ`, 'ok', 'trace · treat.log FILMDAY-POS-rebuild');
    add('shelflost', find('shelflost', e => e.actor === 'PIPE' && e.kind === 'fail'), 'SHELF', `ชั้นวางหลักหายไป เครื่องตู้จดหมายมีสำเนาที่อ่านไม่ได้`, 'bad', 'trace');
    add('shelflost', find('shelflost', e => e.kind === 'rebuild'), 'HUB', `สร้างใหม่จากเครื่องตู้จดหมาย: <b>${F.rebuildRecords}</b> รายการ เหมือนเดิม`, 'ok', 'trace · treat.log FILMDAY-POS-rebuild');
    atF('shelflost', 0.8, 'MIRROR', `กรณีเทียบ ไม่มีตู้จดหมาย: กู้ได้ <b>${F.controlRecovered}</b> จาก ${F.controlOf} รายการ`, 'bad', 'treat.log W-TREAT-PIPEFAIL');
  } else {
    add('mfcast', find('mfcast', e => e.kind === 'publish'), 'HUB', `ประกาศราคาทองวันนี้บนชั้นวาง: สาธารณะ ไม่ระบุผู้รับ`, '', 'trace');
    add('mfprice', find('mfprice', e => e.kind === 'pull' && e.flow === 'S2 gold-price'), 'BOR1', `ดึงครั้งเดียว: <b>${fmt(F.price)}</b> ต่อกรัม`, '', 'trace');
    add('mfprice', find('mfprice', e => e.kind === 'local-fund'), 'BOR1', `มูลค่าทอง ${F.grams} g × ${fmt(F.price)} = <b>${fmt(F.fundValue)}</b> คำนวณบนโทรศัพท์ (ตัวอย่าง)`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfskip', find('mfskip', e => e.kind === 'skip' && e.flow === 'S2 gold-price'), 'BOR1', `ข้าม: มีราคาวันนี้อยู่แล้ว`, '', 'trace');
    add('mfskip', find('mfskip', e => e.kind === 'local-fund'), 'BOR1', `มูลค่าทอง <b>${fmt(F.fundValue)}</b> อีกครั้ง คำนวณในเครื่อง`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'local-sale', 0), 'BOR1', `สลิปชำระเงิน SLIP-1 บันทึกบนโทรศัพท์`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'put', 0), 'BOR1', `ส่งตอนแวะ 15:01`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'local-sale', 1), 'BOR1', `สลิปใบเดิมอีกครั้ง`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'put', 1), 'SHELF', `ชื่อเดียวกัน จึงเป็น <b>${F.mfSlipNames}</b> ออบเจกต์: ชำระ <b>${F.mfPayRecs}</b> รายการ`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfowing', find('mfowing', e => e.kind === 'accept'), 'HUB', `ชำระ ${fmt(F.payAmt)}: ค้าง ${fmt(F.openOwing)} − ${fmt(F.payAmt)} = <b>${fmt(F.mfOwing)}</b> (ตัวอย่าง)`, 'ok', 'witness source · treat.log FILMDAY-MF');
    add('mfowing', find('mfowing', e => e.kind === 'send'), 'HUB', `ใบยืนยันส่งถึง BOR1 คนเดียว`, '', 'trace');
    add('mfconfirm', find('mfconfirm', e => e.actor === 'BOR1' && e.kind === 'recv'), 'BOR1', `ได้รับใบยืนยัน: ยอดค้าง <b>${fmt(F.mfOwing)}</b>`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfconfirm', find('mfconfirm', e => e.actor === 'BOR2' && e.kind === 'offline'), 'BOR2', `ดึงราคาแล้ว ใบยืนยันที่ได้รับ: <b>${F.mfConf2}</b>`, '', 'treat.log FILMDAY-MF');
  }
  return notes;
}
module.exports = { POS, MF, ranges: En.ranges, buildNotes, fmt };
