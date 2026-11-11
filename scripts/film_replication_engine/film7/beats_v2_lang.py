# ⚠ DO NOT REMOVE — film7 v2 translation table (ZH / TH / MS). Structure, ids, facts, images and timings come from beats_v2.py (EN, final); this file ONLY swaps text.
# Every {fact:id}/{id} placeholder is kept; no digit is typed in a voiced line. Spec: prompts/FILM_NARRATION.md §LANG-SPEC. READ the logs after every stage.
import copy, re
import beats_v2

# --- number spoken forms (digits, because the Edge voices read digits natively; structure = EN "N dollars and M cents") ---
def _money(v, unit, sub, minus):
    neg = v.startswith('-'); v = v.lstrip('-'); d, c = (v.split('.') + ['00'])[:2]; d, c = int(d), int(c.ljust(2, '0')[:2])
    if d == 0 and c == 0: return {'zh': '零', 'th': 'ศูนย์', 'ms': 'sifar'}[LANGKEY[0]]
    sep = '' if LANGKEY[0] == 'zh' else ' '; join = '' if LANGKEY[0] == 'zh' else ({'th': ' ', 'ms': ' dan '}[LANGKEY[0]])
    s = (f'{d}{sep}{unit}' if d else '')
    if c: s += (join if d else '') + f'{c}{sep}{sub}'
    return (minus if neg else '') + s
LANGKEY = ['']
UNITS = {'zh': ('美元', '美分', '负'), 'th': ('ดอลลาร์', 'เซนต์', 'ลบ '), 'ms': ('dolar', 'sen', 'tolak ')}
def make_spoken(lang, FACTS):
    LANGKEY[0] = lang
    def spoken(fid):
        f = FACTS[fid]; v = f['value']
        if f['kind'] == 'int': return str(int(v))
        if f['kind'] == 'money': LANGKEY[0] = lang; return _money(v, *UNITS[lang])
        raise ValueError(fid)
    return spoken

# --- per-language data: ALPHA label, cards, closing, credit, per-beat lab/strip/short/detail ---
T = {}
T['zh'] = dict(
 alpha='ALPHA · 测试提供的账目', cr='声音：合成语音（Microsoft Edge TTS，云端）', font='Noto-Sans-CJK-SC', fontb='Noto-Sans-CJK-SC-Bold',
 part2=dict(kicker='《离开其他系统，转向 Kernel ERP》第二部', l1='迁移', l2='会计'),
 closing=('健康的 ERP，是', '能把账带走的 ERP。'),
 beats=dict(
  bigpicture=dict(lab='迁移旧账本 · 旧版 iDempiere，账户查看器（只读）',
   short='M: 迁移能带过来全部主数据，但会计更复杂，因为事件要从上一个日历年度带过来。',
   detail='M: 迁移能带过来全部主数据，但会计更复杂，因为事件要从上一个日历年度带过来。'),
  legacy_ar=dict(lab='迁移旧账本 · 旧版 iDempiere，账户查看器（只读）', strip='客户欠款，净额：{ido_ar_total}',
   short='F: 这是旧账本? | M: 一个只读的旧版 iDempiere。客户欠 {fact:ido_ar_total}。',
   detail='F: 这就是旧账本吗? | M: 一个只读的旧版 iDempiere，在它自己的账户查看器里。客户净欠 {fact:ido_ar_total}。'),
  legacy_bank=dict(lab='旧版 iDempiere · 银行账户', strip='银行，净额：{ido_bank_total}',
   short='F: 那银行呢? | M: 净额 {fact:ido_bank_total}。',
   detail='F: 那银行呢? | M: 支票账户净额 {fact:ido_bank_total}。供应商被欠 {fact:ido_ap_total}。一共 {fact:ido_tb_accounts} 个科目。'),
  method=dict(lab='我们的孪生系统 · 一个文件，一份摘要，尚未写入任何内容',
   short='M: 方法是虚拟单笔交易法。目前还没有写入任何内容。',
   detail='M: 这个方法由澳大利亚 Adaxa 公司的 Steven Sackett 提出：期初分录先过清算科目，再为每一笔未结项目做一笔虚拟的销售或采购，账目就落在期末余额上。 | F: 那这里呢? | M: 一个文件，一份摘要，还没有写入任何内容。'),
  process=dict(lab='我们的孪生系统 · 处理', strip='账目已与来源核对：{ido_verify_judged} 项检查',
   short='F: 然后点处理? | M: 按一下，账目就核对完。',
   detail='F: 然后点处理? | M: 按一下。账目与来源核对，{fact:ido_verify_judged} 项检查，没有一项失败。'),
  twin_books=dict(lab='我们的孪生系统 · 试算表', strip='应收 {ido_ar_in} 已转入 · 过渡账户留有 {ido_ar_left}',
   short='F: 我们的账呢? | M: 一样，过渡账户留有 {fact:ido_ar_left}。',
   detail='F: 那我们的账呢? | M: 我们的试算表，数字一样。客户方面转入了 {fact:ido_ar_in} 的发票。{fact:ido_ar_left} 是一张欧元发票，留在过渡账户上，还没有换算。账是平的。'),
  aging=dict(lab='我们的孪生系统 · 未结项目（账龄）', strip='未结客户发票：{ido_ar_in}  ·  与旧系统核对了 {oi_judged} 个方面',
   short='F: 那还欠着什么? | M: 未结项目报表显示这张发票，{fact:ido_ar_in}。',
   detail='F: 那还欠着什么? | M: 我们的未结项目报表列出了转过来的客户发票：{fact:ido_ar_in}，和旧系统查看器显示的是同一张。报表本身与旧系统核对了 {fact:oi_judged} 个方面。'),
  odoo=dict(lab='Odoo 的文件 · 我们的孪生系统', strip='{odoo_open_docs} 份未结单据 · 客户欠 {odoo_ar_open} · 供应商被欠 {odoo_ap_open}',
   short='F: 那 Odoo 呢? | M: 一样，来自一个文件。',
   detail='F: 那 Odoo 呢? | M: 一样，来自一个导出文件。{fact:odoo_open_docs} 份未结单据；客户欠 {fact:odoo_ar_open}，供应商被欠 {fact:odoo_ap_open}。核对的是文件自己的行，不是 Odoo 的界面。'),
  sap=dict(lab='SAP Business One · 终端里的代理', strip='{sap_term_calls} 次调用，只读（终端打印的那一行）',
   short='F: SAP 呢? | M: Alpha 阶段，测试账。代理只读取。',
   detail='F: 那 SAP 呢? | M: Alpha 阶段，测试账。代理只读取：{fact:sap_term_calls} 次调用，什么都没写入。'),
  bc=dict(lab='Business Central · 我们的表单读取其 Excel 包 · ALPHA',
   short='F: 那 Business Central 呢? | M: 没有程序：用它的 Excel 包。',
   detail='F: 那 Business Central 呢? | M: 它没有可运行的程序。您导出它的配置包，一个 Excel 文件，我们的表单来读取。Alpha 阶段，测试账。'),
  sapbc=dict(lab=('SAP Business One · ALPHA', 'Business Central · ALPHA'), strip='测试账中，过渡账户留有 {sbo_ar_left}',
   short='M: 两个都载入了。过渡账户留有 {fact:sbo_ar_left}。',
   detail='M: Business Central 没有程序，只有它的 Excel 包。两者都载入我们的表单，测试账里过渡账户留有 {fact:sbo_ar_left}。'),
  trade=dict(lab='Odoo 迁入的公司 · 付款窗口：支付已迁移的发票', strip='付款 {mpay_amt}，经窗口完成 · 账目平衡于 {books_before_sale}',
   short='F: 能在上面交易吗? | M: 我们在窗口里付了一张已迁移的发票。',
   detail='F: 能在上面做交易吗? | M: 可以。在付款窗口里，我们支付一张已迁移的发票，{fact:mpay_amt}。保存、完成，发票显示已付，账目平衡于 {fact:books_before_sale}。接着，在同一家公司做一笔新的销售。'),
  sale_order=dict(lab='迁入的公司 · 一张新的销售订单，已完成', strip='订单总额 {ord_total}',
   short='M: 一张新销售订单：表头、一行、完成。',
   detail='M: 在迁入的公司里做一张新的销售订单：表头、一行、完成。订单总额 {fact:ord_total}。'),
  sale_ship_inv=dict(lab=('生成发货', '生成发票'), strip='发票 {ord_inv_total}，正是订单总额，已完成并已过账',
   short='M: 生成发货，再生成发票。',
   detail='F: 然后呢? | M: 生成发货，再生成发票。发票 {fact:ord_inv_total}，正是订单自己的总额，已完成并已过账。'),
  sale_paid=dict(lab='付款窗口：新发票已付', strip='账目 {books_before_sale} + 这笔销售每边 {sale_legs} = {ord_books}',
   short='M: 付款，发票显示已付。',
   detail='M: 在付款窗口付款，{fact:ord_pay_amt}：发票显示已付。这笔销售给账目每一边都加了 {fact:sale_legs}，所以现在平衡于 {fact:ord_books}。'),
  refusal=dict(lab='缺少一份单据：账目核对拒绝通过', strip='留在应收过渡账户上的金额：{rf_amount}',
   short='F: 如果缺一份单据? | M: 它拒绝，并说明差多少。',
   detail='F: 如果缺了一份单据呢? | M: 它会拒绝，并说明差多少：{fact:rf_amount} 卡在过渡账户上。修正文件，在同一家公司再运行一次。'),
  recovered=dict(lab='修正后的文件，同一家公司',
   short='M: 同一家公司，顺利完成。',
   detail='M: 同一家公司，文件修正后：顺利完成，并再次核对账目。同一个文件运行第二次，就提示无需处理。'),
  scope=dict(lab='我们的孪生系统 · 之后的账目',
   short='M: 余额和未结项目会转过来，历史留在原处。',
   detail='M: 转过来的是往后的余额和每一笔未结项目。已关闭的历史留在旧系统里，只读。挂账付款、外币和未结订单不会带入。'),
 ))
T['th'] = dict(
 alpha='ALPHA · บัญชีทดสอบ', cr='เสียง: สังเคราะห์ (Microsoft Edge TTS, คลาวด์)', font='Noto-Sans-Thai-Regular', fontb='Noto-Sans-Thai-Bold',
 part2=dict(kicker='ตอนที่ 2 ของ "ทิ้งระบบอื่น มาใช้ Kernel ERP"', l1='การย้าย', l2='งานบัญชี'),
 closing=('ERP ที่สุขภาพดี คือ ERP', 'ที่คุณเอาออกไปได้'),
 beats=dict(
  bigpicture=dict(lab='ย้ายบัญชีเก่า · iDempiere รุ่นเดิม ตัวดูบัญชี (อ่านอย่างเดียว)',
   short='M: การย้ายนำข้อมูลหลักมาได้ทั้งหมด แต่งานบัญชีซับซ้อนกว่า เพราะต้องนำรายการจากปีปฏิทินก่อนหน้ามาด้วย',
   detail='M: การย้ายนำข้อมูลหลักมาได้ทั้งหมด แต่งานบัญชีซับซ้อนกว่า เพราะต้องนำรายการจากปีปฏิทินก่อนหน้ามาด้วย'),
  legacy_ar=dict(lab='ย้ายบัญชีเก่า · iDempiere รุ่นเดิม ตัวดูบัญชี (อ่านอย่างเดียว)', strip='ลูกค้าค้างชำระ สุทธิ: {ido_ar_total}',
   short='F: นี่คือบัญชีเก่าใช่ไหม? | M: iDempiere รุ่นเดิม อ่านอย่างเดียว ลูกค้าค้าง {fact:ido_ar_total}',
   detail='F: นี่คือบัญชีเก่าใช่ไหม? | M: iDempiere รุ่นเดิม อ่านอย่างเดียว ในตัวดูบัญชีของมันเอง ลูกค้าค้างชำระสุทธิ {fact:ido_ar_total}'),
  legacy_bank=dict(lab='iDempiere รุ่นเดิม · บัญชีธนาคาร', strip='ธนาคาร สุทธิ: {ido_bank_total}',
   short='F: แล้วธนาคารล่ะ? | M: สุทธิ {fact:ido_bank_total}',
   detail='F: แล้วธนาคารล่ะ? | M: บัญชีกระแสรายวันสุทธิ {fact:ido_bank_total} ผู้ขายถูกค้างจ่าย {fact:ido_ap_total} รวม {fact:ido_tb_accounts} บัญชี'),
  method=dict(lab='แฝดของเรา · หนึ่งไฟล์ หนึ่งสรุป ยังไม่เขียนอะไร',
   short='M: วิธีนี้คือรายการเดียวสมมติ ยังไม่เขียนอะไร',
   detail='M: วิธีนี้คิดโดย Steven Sackett แห่ง Adaxa ออสเตรเลีย ใบสำคัญเปิดบัญชีผ่านบัญชีพัก แล้วขายหรือซื้อสมมติหนึ่งรายการต่อรายการค้างหนึ่งรายการ บัญชีจึงลงที่ยอดปิด | F: แล้วตรงนี้? | M: หนึ่งไฟล์ หนึ่งสรุป ยังไม่เขียนอะไร'),
  process=dict(lab='แฝดของเรา · ประมวลผล', strip='ตรวจบัญชีกับต้นทางแล้ว: {ido_verify_judged} รายการ',
   short='F: แล้วประมวลผล? | M: กดครั้งเดียว ตรวจบัญชีเสร็จ',
   detail='F: แล้วประมวลผล? | M: กดครั้งเดียว ตรวจบัญชีกับต้นทาง {fact:ido_verify_judged} รายการ ไม่ผิดเลย'),
  twin_books=dict(lab='แฝดของเรา · งบทดลอง', strip='ลูกหนี้ {ido_ar_in} ย้ายมาแล้ว · บัญชีพักคงเหลือ {ido_ar_left}',
   short='F: แล้วบัญชีของเรา? | M: เหมือนกัน บัญชีพักเหลือ {fact:ido_ar_left}',
   detail='F: แล้วบัญชีของเรา? | M: งบทดลองของเรา ตัวเลขเหมือนกัน ลูกหนี้ย้ายมาเป็นใบแจ้งหนี้ {fact:ido_ar_in} ส่วน {fact:ido_ar_left} เป็นใบแจ้งหนี้ยูโร ค้างที่บัญชีพัก ยังไม่แปลงค่า บัญชีสมดุล'),
  aging=dict(lab='แฝดของเรา · รายการค้าง (อายุหนี้)', strip='ใบแจ้งหนี้ลูกค้าค้าง: {ido_ar_in}  ·  ตรวจกับระบบเดิม {oi_judged} แบบ',
   short='F: แล้วอะไรยังค้าง? | M: รายงานรายการค้างแสดงใบแจ้งหนี้ {fact:ido_ar_in}',
   detail='F: แล้วอะไรยังค้าง? | M: รายงานรายการค้างแสดงใบแจ้งหนี้ลูกค้าที่ย้ายมา {fact:ido_ar_in} ใบเดียวกับในตัวดูบัญชีเก่า และตรวจรายงานกับระบบเดิม {fact:oi_judged} แบบ'),
  odoo=dict(lab='ไฟล์ของ Odoo · แฝดของเรา', strip='เอกสารค้าง {odoo_open_docs} ฉบับ · ลูกค้าค้าง {odoo_ar_open} · ผู้ขายถูกค้างจ่าย {odoo_ap_open}',
   short='F: แล้ว Odoo? | M: เหมือนกัน จากไฟล์เดียว',
   detail='F: แล้ว Odoo? | M: เหมือนกัน จากไฟล์ส่งออกไฟล์เดียว เอกสารค้าง {fact:odoo_open_docs} ฉบับ ลูกค้าค้าง {fact:odoo_ar_open} ผู้ขายถูกค้างจ่าย {fact:odoo_ap_open} ตรวจกับแถวในไฟล์เอง ไม่ใช่หน้าจอ Odoo'),
  sap=dict(lab='SAP Business One · ตัวแทนในเทอร์มินัล', strip='เรียก {sap_term_calls} ครั้ง อ่านอย่างเดียว (บรรทัดที่เทอร์มินัลพิมพ์)',
   short='F: แล้ว SAP ล่ะ? | M: อัลฟา บนบัญชีทดสอบ ตัวแทนอ่านอย่างเดียว',
   detail='F: แล้ว SAP ล่ะ? | M: อัลฟา บนบัญชีทดสอบ ตัวแทนอ่านอย่างเดียว เรียก {fact:sap_term_calls} ครั้ง ไม่เขียนอะไร'),
  bc=dict(lab='Business Central · ฟอร์มของเราอ่านแพ็กเกจ Excel · ALPHA',
   short='F: แล้ว Business Central? | M: ไม่มีโปรแกรม ใช้แพ็กเกจ Excel',
   detail='F: แล้ว Business Central? | M: ไม่มีโปรแกรมให้รัน ส่งออกแพ็กเกจตั้งค่าเป็นไฟล์ Excel แล้วฟอร์มของเรามาอ่าน อัลฟา บนบัญชีทดสอบ'),
  sapbc=dict(lab=('SAP Business One · ALPHA', 'Business Central · ALPHA'), strip='บัญชีพักคงเหลือ {sbo_ar_left} ในบัญชีทดสอบ',
   short='M: โหลดได้ทั้งสอง บัญชีพักเหลือ {fact:sbo_ar_left}',
   detail='M: Business Central ไม่มีโปรแกรม มีแต่แพ็กเกจ Excel ทั้งสองโหลดเข้าฟอร์มของเราได้ และบัญชีพักเหลือ {fact:sbo_ar_left} ของบัญชีทดสอบ'),
  trade=dict(lab='บริษัทที่ย้ายจาก Odoo · หน้าต่างการชำระเงิน: จ่ายใบแจ้งหนี้ที่ย้ายมา', strip='ชำระ {mpay_amt} เสร็จสิ้นผ่านหน้าต่าง · บัญชีสมดุลที่ {books_before_sale}',
   short='F: ซื้อขายต่อได้ไหม? | M: เราจ่ายใบแจ้งหนี้ที่ย้ายมาในหน้าต่างแล้ว',
   detail='F: ซื้อขายต่อได้ไหม? | M: ได้ ในหน้าต่างการชำระเงิน เราจ่ายใบแจ้งหนี้ที่ย้ายมา {fact:mpay_amt} บันทึก เสร็จสิ้น ขึ้นว่าจ่ายแล้ว บัญชีสมดุลที่ {fact:books_before_sale} ต่อไปคือขายใหม่ในบริษัทเดิม'),
  sale_order=dict(lab='บริษัทที่ย้ายมา · ใบสั่งขายใหม่ เสร็จสิ้น', strip='ยอดรวมใบสั่ง {ord_total}',
   short='M: ใบสั่งขายใหม่ หัวเอกสาร หนึ่งบรรทัด เสร็จสิ้น',
   detail='M: ใบสั่งขายใหม่ในบริษัทที่ย้ายมา หัวเอกสาร หนึ่งบรรทัด เสร็จสิ้น ยอดรวม {fact:ord_total}'),
  sale_ship_inv=dict(lab=('สร้างการจัดส่ง', 'สร้างใบแจ้งหนี้'), strip='ใบแจ้งหนี้ {ord_inv_total} เท่ายอดใบสั่ง เสร็จสิ้นและลงบัญชีแล้ว',
   short='M: สร้างการจัดส่ง แล้วสร้างใบแจ้งหนี้',
   detail='F: แล้วต่อ? | M: สร้างการจัดส่ง แล้วสร้างใบแจ้งหนี้ ใบแจ้งหนี้ {fact:ord_inv_total} เท่ายอดใบสั่ง เสร็จสิ้นและลงบัญชีแล้ว'),
  sale_paid=dict(lab='หน้าต่างการชำระเงิน: จ่ายใบแจ้งหนี้ใหม่แล้ว', strip='บัญชี {books_before_sale} + ยอดขายข้างละ {sale_legs} = {ord_books}',
   short='M: จ่ายแล้ว ใบแจ้งหนี้ขึ้นว่าจ่ายแล้ว',
   detail='M: จ่ายในหน้าต่างการชำระเงิน {fact:ord_pay_amt} ใบแจ้งหนี้ขึ้นว่าจ่ายแล้ว ยอดขายเพิ่มข้างละ {fact:sale_legs} บัญชีจึงสมดุลที่ {fact:ord_books}'),
  refusal=dict(lab='เอกสารหาย: การตรวจบัญชีปฏิเสธ', strip='ค้างอยู่ที่บัญชีพักลูกหนี้: {rf_amount}',
   short='F: ถ้าเอกสารหาย? | M: ปฏิเสธ และบอกว่าขาดเท่าไร',
   detail='F: ถ้าเอกสารหาย? | M: ปฏิเสธ และบอกว่าขาดเท่าไร ค้างที่บัญชีพัก {fact:rf_amount} แก้ไฟล์ แล้วรันอีกครั้งในบริษัทเดิม'),
  recovered=dict(lab='ไฟล์ที่แก้แล้ว บริษัทเดิม',
   short='M: บริษัทเดิม เสร็จสมบูรณ์',
   detail='M: บริษัทเดิม ไฟล์ที่แก้แล้ว เสร็จสมบูรณ์ และตรวจบัญชีอีกครั้ง ไฟล์เดิมรันซ้ำ ก็ไม่มีอะไรต้องทำ'),
  scope=dict(lab='แฝดของเรา · บัญชีหลังย้าย',
   short='M: ยอดคงเหลือและรายการค้างย้ายมา ประวัติอยู่เดิม',
   detail='M: ที่ย้ายมาคือยอดยกไปและรายการค้างทุกรายการ ประวัติที่ปิดแล้วอยู่ในระบบเดิม อ่านอย่างเดียว การรับชำระล่วงหน้า สกุลเงินต่างประเทศ และใบสั่งค้างไม่ได้ย้ายมา'),
 ))
T['ms'] = dict(
 alpha='ALPHA · lejar ujian', cr='Suara: sintetik (Microsoft Edge TTS, awan)', font='DejaVu-Sans', fontb='DejaVu-Sans-Bold',
 part2=dict(kicker='Bahagian II: Meninggalkan Yang Lain untuk Kernel ERP', l1='Migrasi', l2='Perakaunan'),
 closing=('ERP yang sihat ialah ERP', 'yang boleh anda bawa keluar.'),
 beats=dict(
  bigpicture=dict(lab='Memindahkan buku lama · iDempiere lama, Account Viewer (baca sahaja)',
   short='M: Migrasi boleh membawa semua data induk, tetapi perakaunan lebih rumit, kerana peristiwa dibawa dari Tahun Kalendar sebelumnya.',
   detail='M: Migrasi boleh membawa semua data induk, tetapi perakaunan lebih rumit, kerana peristiwa dibawa dari Tahun Kalendar sebelumnya.'),
  legacy_ar=dict(lab='Memindahkan buku lama · iDempiere lama, Account Viewer (baca sahaja)', strip='pelanggan berhutang, bersih: {ido_ar_total}',
   short='F: Ini buku lama? | M: iDempiere lama, baca sahaja. Pelanggan berhutang {fact:ido_ar_total}.',
   detail='F: Ini buku lama? | M: iDempiere lama, baca sahaja, dalam Account Viewer sendiri. Pelanggan berhutang {fact:ido_ar_total} bersih.'),
  legacy_bank=dict(lab='iDempiere lama · akaun bank', strip='bank, bersih: {ido_bank_total}',
   short='F: Dan bank? | M: {fact:ido_bank_total}, bersih.',
   detail='F: Dan bank? | M: Akaun semasa bersih {fact:ido_bank_total}. Pembekal dihutangi {fact:ido_ap_total}. Semuanya {fact:ido_tb_accounts} akaun.'),
  method=dict(lab='Kembar kami · satu fail, satu ringkasan, belum ditulis apa-apa',
   short='M: Kaedahnya transaksi tunggal fantom. Belum ada apa-apa ditulis.',
   detail='M: Kaedah ini dicipta oleh Steven Sackett dari Adaxa Australia: jurnal pembukaan melalui akaun penjelasan, kemudian satu jualan atau belian fantom bagi setiap item terbuka, supaya buku mendarat pada baki penutup. | F: Dan di sini? | M: Satu fail, satu ringkasan, belum ditulis apa-apa.'),
  process=dict(lab='Kembar kami · Proses', strip='buku disemak dengan sumber: {ido_verify_judged} semakan',
   short='F: Kemudian Proses? | M: Satu tekan, buku disemak.',
   detail='F: Kemudian Proses? | M: Satu tekan. Buku disemak dengan sumber, {fact:ido_verify_judged} semakan, tiada yang gagal.'),
  twin_books=dict(lab='Kembar kami · Imbangan Duga', strip='belum terima {ido_ar_in} dipindahkan · akaun penjelasan menyimpan {ido_ar_left}',
   short='F: Dan buku kita? | M: Sama, {fact:ido_ar_left} kekal pada akaun penjelasan.',
   detail='F: Dan buku kita? | M: Imbangan duga kita, angka yang sama. Pelanggan dipindahkan {fact:ido_ar_in} invois. {fact:ido_ar_left} ialah invois euro, kekal pada akaun penjelasan, belum ditukar. Buku seimbang.'),
  aging=dict(lab='Kembar kami · Item Terbuka (Penuaan)', strip='invois pelanggan terbuka: {ido_ar_in}  ·  disemak {oi_judged} cara dengan sistem lama',
   short='F: Dan apa yang masih belum dibayar? | M: Laporan item terbuka menunjukkan invois, {fact:ido_ar_in}.',
   detail='F: Dan apa yang masih belum dibayar? | M: Laporan item terbuka menyenaraikan invois pelanggan yang dipindahkan: {fact:ido_ar_in}, invois yang sama dengan paparan lama. Laporan itu disemak dengan sistem lama dalam {fact:oi_judged} cara.'),
  odoo=dict(lab='Fail Odoo · kembar kami', strip='{odoo_open_docs} dokumen terbuka · pelanggan berhutang {odoo_ar_open} · pembekal dihutangi {odoo_ap_open}',
   short='F: Dan Odoo? | M: Sama, daripada satu fail.',
   detail='F: Dan Odoo? | M: Sama, daripada satu fail eksport. {fact:odoo_open_docs} dokumen terbuka; pelanggan berhutang {fact:odoo_ar_open}, pembekal dihutangi {fact:odoo_ap_open}. Disemak dengan baris fail itu sendiri, bukan skrin Odoo.'),
  sap=dict(lab='SAP Business One · ejen, dalam terminal', strip='{sap_term_calls} panggilan, baca sahaja (baris yang dicetak terminal)',
   short='F: SAP? | M: Alfa, pada lejar ujian. Ejen hanya membaca.',
   detail='F: Dan SAP? | M: Alfa, lejar ujian. Ejen hanya membaca: {fact:sap_term_calls} panggilan, tiada ditulis.'),
  bc=dict(lab='Business Central · borang kami membaca pakej Excel · ALPHA',
   short='F: Dan Business Central? | M: Tiada program: pakej Excelnya.',
   detail='F: Dan Business Central? | M: Tiada program. Anda eksport pakej konfigurasinya, fail Excel, dan borang kami membacanya. Alfa, lejar ujian.'),
  sapbc=dict(lab=('SAP Business One · ALPHA', 'Business Central · ALPHA'), strip='akaun penjelasan menyimpan {sbo_ar_left} dalam lejar ujian',
   short='M: Kedua-duanya dimuat. Akaun penjelasan menyimpan {fact:sbo_ar_left}.',
   detail='M: Kedua-duanya dimuat ke borang kami, dan akaun penjelasan menyimpan {fact:sbo_ar_left} daripada lejar ujian.'),
  trade=dict(lab='Syarikat yang dipindahkan dari Odoo · tetingkap Bayaran: membayar invois yang dipindahkan', strip='bayaran {mpay_amt} selesai melalui tetingkap · buku seimbang pada {books_before_sale}',
   short='F: Boleh berdagang? | M: Kami bayar invois yang dipindahkan dalam tetingkap.',
   detail='F: Boleh berdagang di atasnya? | M: Boleh. Dalam tetingkap Bayaran kami bayar invois yang dipindahkan, {fact:mpay_amt}. Ia selesai, invois ditunjuk telah dibayar, dan buku seimbang pada {fact:books_before_sale}. Kini jualan baharu, dalam syarikat yang sama.'),
  sale_order=dict(lab='Syarikat yang dipindahkan · pesanan jualan BARU, Selesai', strip='jumlah pesanan {ord_total}',
   short='M: Pesanan jualan baharu: pengepala, satu baris, Selesai.',
   detail='M: Pesanan jualan baharu dalam syarikat itu: pengepala, satu baris, Selesai. Jumlah pesanan {fact:ord_total}.'),
  sale_ship_inv=dict(lab=('Jana Penghantaran', 'Jana Invois'), strip='invois {ord_inv_total}, jumlah pesanan, Selesai dan disiarkan',
   short='M: Jana penghantaran, kemudian invois.',
   detail='F: Kemudian? | M: Jana penghantaran, kemudian invois. Invois {fact:ord_inv_total}, jumlah pesanan, selesai dan disiarkan.'),
  sale_paid=dict(lab='Tetingkap Bayaran: invois baharu dibayar', strip='buku {books_before_sale} + jualan {sale_legs} setiap belah = {ord_books}',
   short='M: Bayar, dan invois ditunjuk telah dibayar.',
   detail='M: Bayar dalam tetingkap Bayaran, {fact:ord_pay_amt}: invois ditunjuk telah dibayar. Jualan menambah {fact:sale_legs} pada setiap belah buku, jadi kini seimbang pada {fact:ord_books}.'),
  refusal=dict(lab='Dokumen hilang: semakan buku menolak', strip='tinggal pada akaun penjelasan belum terima: {rf_amount}',
   short='F: Jika dokumen hilang? | M: Ia menolak dan menyebut berapa banyak.',
   detail='F: Jika dokumen hilang? | M: Ia menolak dan menyebut berapa banyak: {fact:rf_amount} tersangkut pada akaun penjelasan. Betulkan fail, jalankan semula dalam syarikat yang sama.'),
  recovered=dict(lab='Fail yang dibetulkan, syarikat yang sama',
   short='M: Syarikat yang sama, ia selesai.',
   detail='M: Syarikat yang sama, fail dibetulkan: selesai dan buku disemak semula. Fail sama dua kali: tiada apa-apa untuk dibuat.'),
  scope=dict(lab='Kembar kami · buku selepas itu',
   short='M: Baki dan item terbuka dipindahkan. Sejarah kekal.',
   detail='M: Yang dipindahkan ialah baki ke hadapan dan setiap item terbuka. Sejarah ditutup kekal dalam sistem lama, baca sahaja. Bayaran pendahuluan, mata wang asing dan pesanan terbuka tidak dibawa.'),
 ))

def build(lang):
    """Return (ALPHA, ITEMS, CLOSING_TEXT, cfg) = beats_v2 structure with the text swapped. Same ids, order, images (file names), src, alpha flags."""
    t = T[lang]; items = []
    for kind, name, d in beats_v2.ITEMS:
        d = copy.deepcopy(d)
        if kind == 'card':
            if name == 'part2': d.update(t['part2'])
            else: d.update(l1=t['closing'][0], l2=t['closing'][1])
        else:
            b = t['beats'][name]; im = list(d['image'])
            if im[0] == 'shot': im[2] = b['lab']
            else: im[2], im[4] = b['lab']
            d['image'] = tuple(im); d['short'] = b['short']; d['detail'] = b['detail']
            if 'strip' in d: d['strip'] = b['strip']
            elif 'strip' in b: raise SystemExit(f'§FILM-MA-LANG strip given for {name} where EN has none')
        items.append((kind, name, d))
    return t['alpha'], items, t['closing'][0] + ' ' + t['closing'][1], t
