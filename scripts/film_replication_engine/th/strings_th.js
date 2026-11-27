// ⚠ DO NOT REMOVE — Scope: ALL on-screen Thai text of the Thai cut of "No server in the sale path" (spec prompts/TEAMWORK_FRAMEWORK.md §16.22 and §16.19a/§16.21 for the English cut).
// Browser + Node (UMD). Ids, object names and trace names (A, B, HQ, PH1, o/A/..., F1, R1, COLLISION, §-lines) are NOT translated. Numbers never live here: they come from facts.json.
// GLOSSARY below is the ONE table a Thai reviewer corrects (it is printed into the film record §16.22). The strings in this file and in th/beats_th.js / th/film_replication_engine_th_tsv.js are written with exactly these terms.
// Read the log after every run: the recorder prints §TH_GLOSSARY_USE (how often each glossary term is used on screen and in speech).
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.TH = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // [English, Thai on screen, note]
  var GLOSSARY = [
    ['HQ (head office, the admin device)', 'HQ (สำนักงานใหญ่) · เครื่องผู้ดูแล', 'id "HQ" stays; spoken as "HQ"'],
    ['branch', 'สาขา', ''],
    ['till (the sales device of a branch)', 'เครื่องคิดเงิน', ''],
    ['shelf (stores named objects, reads none)', 'ชั้นวาง', 'object on the shelf = ออบเจกต์ (ไฟล์ที่ตั้งชื่อไว้)'],
    ['mailbox device (blind copy of the shelf)', 'เครื่องตู้จดหมาย', 'สำเนาชั้นวางที่อ่านเนื้อหาไม่ได้'],
    ['visit (a device or HQ calls at the shelf)', 'แวะ / การแวะ', ''],
    ['fact (a number or record read from a log)', 'ข้อเท็จจริง', 'screen only, "facts.json" stays'],
    ['collision (same ticket key, different content)', 'ชนกัน', 'flag name COLLISION stays'],
    ['overspend', 'ใช้เกินยอด', 'flag name OVERSPEND stays'],
    ['fold-back (a lost device re-reads its own part of the shelf)', 'ดึงคืน', ''],
    ['rebuild (HQ re-derives its state from the shelf)', 'สร้างใหม่', ''],
    ['advisory copy (own count, not the master)', 'ค่าอ้างอิง', ''],
    ['sample (made-up number)', 'ตัวอย่าง', ''],
    ['OFFLINE / ONLINE (the red / green label)', 'OFFLINE · ออฟไลน์ / ONLINE · ออนไลน์', 'both words shown, as requested'],
    ['online window (the short time a device is online)', 'ช่วงออนไลน์', ''],
    ['settlement (HQ closes the books on a visit)', 'ปิดยอด', ''],
    ['caught at settlement: blacklist candidate', 'ตรวจพบตอนปิดยอด: รายที่อาจขึ้นบัญชีดำ', 'no legal wording'],
    ['ticket (a sale ticket)', 'ใบขาย', ''],
    ['credit / earn code / redeem code', 'เครดิต / รหัสสะสม / รหัสใช้เครดิต', ''],
    ['fund value (value of the gold held)', 'มูลค่าทอง', ''],
    ['replenishment', 'เติมสต็อก', 'process name Generate Replenishment stays'],
    ['stand-in (a stub process)', 'ตัวแทนชั่วคราว', ''],
    ['replication engine', 'เอนจินทำสำเนาข้อมูล', ''],
    ['lost (device / shelf)', 'หาย', ''],
    ['restore', 'กู้คืน', '']
  ];
  var T = {
    glossary: GLOSSARY,
    appTitle: 'ไม่มีเซิร์ฟเวอร์ในเส้นทางการขาย', sample: 'ข้อมูลตัวอย่าง · SAMPLE DATA',
    offline: 'OFFLINE · ออฟไลน์', online: 'ONLINE · ออนไลน์',
    part1: 'ตอนที่ 1 · Unicenta POS', part2: 'ตอนที่ 2 · Micro Finance',
    day: function (n) { return 'วันที่ ' + n; }, endOfDay: function (n) { return 'สิ้นวันที่ ' + n; },
    months: { 9: 'ต.ค.' },
    noLink: 'ไม่มีลิงก์', source: 'ที่มา: ',
    lost: { dev: 'เครื่องหาย', hub: 'ผู้ดูแลหาย' }, shelfLost: 'ชั้นวางหาย', zeroObjects: '0 ออบเจกต์', empty: '(ว่าง)', earlier: function (n) { return '… ก่อนหน้า ' + n; },
    objects: function (n) { return n + ' ออบเจกต์'; },
    cards: {
      pos: { A: ['สาขา A', 'เครื่องคิดเงิน'], B: ['สาขา B', 'เครื่องคิดเงิน'], HUB: ['HQ สำนักงานใหญ่', 'เครื่องผู้ดูแล'], PH1: ['โทรศัพท์ลูกค้า', 'เครดิตสะสม'], SHELF: ['ชั้นวาง', 'เก็บของที่ตั้งชื่อไว้ แต่ไม่อ่านเนื้อหา'], MIRROR: ['เครื่องตู้จดหมาย', 'สำเนาชั้นวางที่อ่านไม่ได้'] },
      mf: { BOR1: ['ผู้กู้ 1', 'โทรศัพท์ ทองของตนเอง'], BOR2: ['ผู้กู้ 2', 'โทรศัพท์ ทองของตนเอง'], HUB: ['เคาน์เตอร์ร้าน', 'เครื่องผู้ดูแล'], PRICE: ['ราคาทองสาธารณะ', 'ค่าเดียว ใครก็อ่านได้'], SHELF: ['ชั้นวาง', 'เก็บของที่ตั้งชื่อไว้ แต่ไม่อ่านเนื้อหา'] }
    },
    cfgTitle: 'การตั้งค่า: แถวของโฟลว์ (flows.json) เท่านั้น',
    lanes: [['ADMIN', 'งานของ HQ'], ['PIPE', 'ของที่ผ่านชั้นวาง'], ['USER', 'งานในเครื่อง']],
    ctr: { local: 'งานในเครื่อง', pipe: 'ผ่านชั้นวาง', hub: 'HQ แวะ', dev: 'เครื่องแวะ', run: function (d) { return 'รอบตัวอย่างนี้ วันที่ ' + d; }, ratio: 'ในเครื่อง : ผ่านชั้นวาง = ' },
    ghost: function (a) { return 'วันที่ 1: ' + a.local + ' ในเครื่อง · ' + a.pipe + ' ผ่านชั้นวาง · ' + a.hubVisits + ' HQ แวะ · ' + a.visits + ' เครื่องแวะ'; },
    focus: function (d, c) { return 'วันทำงานที่ ' + d + ' · HQ แวะชั้นวาง ' + c.hubVisits + ' ครั้ง · เครื่องอื่นแวะ ' + c.visits + ' ครั้ง · สาขากับโทรศัพท์ทำงานในเครื่อง ' + c.local + ' อย่าง (รอบตัวอย่าง)'; },
    nothingYet: 'ยังไม่มี', cashierList: 'รายชื่อแคชเชียร์',
    price: { perGram: 'ต่อกรัม (ตัวอย่าง) · รายวัน · สาธารณะ', none: 'ยังไม่ประกาศ' },
    pill: { code: 'รหัส ', again: ' (ซ้ำ)', copy: 'สำเนา' },
    // card status
    st: {
      A: function (stock, q, codes) { return '<div>สต็อก (นับเอง ค่าอ้างอิง): <b>' + stock + '</b></div><div>รอส่ง: <b>' + q + '</b></div><div><i>รหัสที่ออก: ' + (codes || 'ไม่มี') + '</i></div>'; },
      B: function (inbox, q, codes) { return '<div>กล่องรับของ: <b>' + inbox + '</b> ออบเจกต์</div><div>รอส่ง: <b>' + q + '</b></div><div><i>รหัสที่ออก: ' + (codes || 'ไม่มี') + '</i></div>'; },
      PH1: function (cr, q, codes) { return '<div>เครดิตบนโทรศัพท์: <b>' + cr + '</b></div><div>รอส่ง: <b>' + q + '</b></div><div><i>รหัสที่สแกน: ' + (codes || 'ไม่มี') + '</i></div>'; },
      HUB: function (recs, col, over, visits) { return '<div>รายการที่เก็บ: <b>' + recs + '</b></div><div>ธง: ชนกัน <b>' + col + '</b> · ใช้เกินยอด <b>' + over + '</b></div><div><i>แวะแล้ว: ' + visits + ' ครั้ง</i></div>'; },
      BOR1: function (g, price, fund, owing, q) { return '<div>ทอง ' + g + ' · ราคา ' + price + ' · มูลค่า ' + fund + '</div><div>ยอดค้าง (จากร้าน): <b>' + owing + '</b></div><div>รอส่ง: <b>' + q + '</b></div>'; },
      BOR2: function (price, conf, q) { return '<div>ราคาที่ดึงมา: <b>' + price + '</b></div><div>ใบยืนยันที่ได้รับ: <b>' + conf + '</b></div><div>รอส่ง: <b>' + q + '</b></div>'; }
    },
    // log lines (trace kind names put/recv/pull/send/publish/accept stay English)
    lg: {
      linkDown: 'ลิงก์ขาด', linkUp: 'ลิงก์กลับมา', visitFailed: 'แวะไม่สำเร็จ: ไม่มีลิงก์', sale: 'ขาย x', stock: 'นับสต็อก ', fund: 'ทอง ', code: 'รหัส ', scan: 'สแกน ', scanCredit: ' -> เครดิต ', scanAgain: ' ซ้ำ: ไม่เกิดอะไร',
      skip: ' มีอยู่แล้ว', dup: 'duplicate ข้ามไป ', visit: 'แวะ', visitRebuild: 'แวะเพื่อสร้างใหม่', adminLost: 'เครื่องผู้ดูแลหาย: ล้างสถานะ', devLost: 'เครื่องหาย ยังไม่ได้ส่ง ', restored: 'กู้คืน: ของตนเอง ', addressed: ' ส่งถึง ', rebuilt: 'สร้างใหม่: ', records: ' รายการ', pub: ' (สาธารณะ)'
    },
    strip: {
      cast: '1 · ผู้เล่นและการตั้งค่าทั้งหมด ทุกเครื่องเริ่มต้นที่ออฟไลน์',
      setup: '2 · เริ่มต้น: ช่วงออนไลน์ช่วงเดียวของ HQ แล้วสาขา A แวะตอน 09:00',
      selling: '3 · ขายทั้งวันในเครื่อง: ชั้นวางและ HQ เงียบอยู่',
      outage: '4 · ลิงก์ขาดตอน 18:00 · กิจกรรมแรกของ HQ ในวันนี้',
      day2: '5 · วันที่ 2 เวลา 09:00: ตัวเลขของ A ตรงกับ HQ · B ไม่เห็นอะไรของ A',
      lost: '6 · ความผิดพลาดที่ 1: สาขา A หาย แล้วดึงคืนจากชั้นวาง',
      reuse: '7 · เลขใบขายถูกใช้ซ้ำ (10:30)',
      rolled: '8 · โทรศัพท์ที่กู้คืนจากสำเนาเก่า ใช้เครดิตซ้ำที่สาขา B (11:00)',
      settle: '8b · ปิดยอด 18:00–18:05: HQ แวะมาแล้วพบทั้งสองเรื่อง',
      hqlost: '9 · ความผิดพลาดที่ 2: เครื่อง HQ หาย (19:00) แล้วสร้างใหม่จากชั้นวาง',
      shelflost: '10 · ความผิดพลาดที่ 3: ชั้นวางหาย (19:30) เครื่องตู้จดหมายช่วยสร้างใหม่',
      numbers: '11 · วันทำงานที่ 1 จากแผงตัวเลข (รอบตัวอย่าง)',
      mfcast: 'ตอนที่ 2 · Micro Finance: โทรศัพท์ผู้กู้สองเครื่อง เคาน์เตอร์ร้านหนึ่งเครื่อง ราคาสาธารณะหนึ่งราคา',
      mfprice: 'ดึงราคาครั้งเดียว แล้วคำนวณมูลค่าทองบนโทรศัพท์',
      mfskip: 'โทรศัพท์เปิดอีกครั้งตอน 14:00: ข้ามการดึงราคา',
      mfpay: 'สลิปชำระเงินที่ส่งสองครั้ง ยังเป็นการชำระครั้งเดียว',
      mfowing: 'ร้านแวะตอน 16:00: คำนวณยอดค้าง แล้วส่งใบยืนยัน',
      mfconfirm: 'ใบยืนยันถึงผู้กู้คนนั้นคนเดียว'
    },
    // closing / title cards
    card: {
      title: function () { return '<div class="k" style="margin-top:150px">เอนจินทำสำเนาข้อมูล · THE REPLICATION ENGINE · สองกรณี</div><h1>ไม่มีเซิร์ฟเวอร์<br>ในเส้นทางการขาย</h1><h2>Unicenta POS และ Micro Finance</h2><div class="sub">การรันจริงที่เอนจินบันทึกไว้ นำมาเล่นซ้ำ ตัวเลขทุกตัวมาจากล็อกของมัน</div><div class="note">ข้อมูลตัวอย่างตลอดทั้งเรื่อง</div>'; },
      part2: function () { return '<div class="k" style="margin-top:190px">ตอนที่ 2</div><h1>Micro Finance</h1><h2>เอนจินเดิม แถวใหม่</h2><div class="sub">โทรศัพท์ผู้กู้เก็บทองของตนเอง เคาน์เตอร์ร้านหนึ่งเครื่อง ราคาสาธารณะหนึ่งราคาต่อวัน</div><div class="note">ข้อมูลตัวอย่าง</div>'; },
      closeTitle: 'ข้อจำกัดตามจริง',
      limits: function (F) { return [
        'ข้อมูลตัวอย่าง: ปริมาณและราคาทุกตัวในเรื่องนี้สมมติขึ้นสำหรับการรันนี้',
        'ยังไม่ได้เข้ารหัสในการรันนี้: การปิดผนึกเป็นอีกชั้นหนึ่ง ที่ทดสอบแยกต่างหาก',
        'ทดสอบแค่ตรรกะ: ฮับเดียวในหน่วยความจำ กับพจนานุกรมที่แทนชั้นวาง ยังไม่มีโทรศัพท์จริง',
        'กระบวนการตัวแทนชั่วคราว (Generate Replenishment, Apply Payment) แทนของจริงในเคอร์เนล',
        'ช่วงออนไลน์มีความยาวศูนย์บนนาฬิกาจำลอง แต่ละช่วงแสดงบนจอคงที่ ' + F.flashSec.toFixed(1) + ' วินาที',
        'ลำดับการเล่นซ้ำเรียงตามชื่อออบเจกต์แบบตัวอักษร: "10" มาก่อน "2" ถูกต้องเฉพาะกับคีย์ตัวอย่างนี้']; },
      verdictSmall: function (F) { return 'อ่านจาก build/scriptor/treat.log หลังการรันนี้ · เอนจินมี ' + F.engineLines + ' บรรทัด · ข้อมูลตัวอย่าง'; }
    },
    cfg: { on: 'เมื่อ ', process: ' → ประมวลผล ', emits: ' → ออก ', guard: ' · เงื่อนไข ', toBorrower: 'ส่งถึงผู้กู้', carries: function (n) { return ' · ส่ง ' + n + ' คอลัมน์ที่ระบุ'; } }
  };
  return T;
});
