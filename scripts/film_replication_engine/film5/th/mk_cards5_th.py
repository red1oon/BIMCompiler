# ⚠ DO NOT REMOVE — Scope: builds film5/th/cards5_th.js from ../cards5.js by replacing every English UI string with its Thai text; each replacement must match exactly once (or the stated count), else the build stops.
# Same method as film2/th/mk_cards_th.py (TEAMWORK_FRAMEWORK.md §16.29). NOT translated (kept as in the source, like the earlier Thai cuts): file names and line citations in the source tags, ids and reason codes (bad-signature, plan-trust-stale ...),
# the verbatim app message “N changes wait for a translation rule from the team admin”, table names (c_order ...), PR numbers, DocumentEngine.java:272-276, product names (ERP, Modeller, Chromium, iDempiere, bim-ootb), the action name Complete.
# GLOSSARY (the one table a Thai reviewer corrects): app = แอป · admin = ผู้ดูแล · translation rule = กฎแปลงรูปแบบ · policy message = ข้อความนโยบาย · signature = ลายเซ็น · key = กุญแจ · primary/backup = กุญแจหลัก/สำรอง · key list = รายการกุญแจ ·
# check = การตรวจ · test suite = ชุดทดสอบ · deliberately broken copy = สำเนาที่จงใจทำให้เสีย · merged = รวมแล้ว · parked = พักไว้ · refused = ถูกปฏิเสธ · visit = แวะ · fold in = นำมารวมเข้า · thin = แบบบาง · evidence = หลักฐาน.
import os, sys
here = os.path.dirname(os.path.abspath(__file__)); s = open(os.path.join(here, '..', 'cards5.js'), encoding='utf8').read()
R = []
def r(a, b, n=1): R.append((a, b, n))
# ---- plumbing ----
r("const SERIES = 'THE TEAM FEATURE · TRUST AND THE THIN PIPE';", "const SERIES = 'ฟีเจอร์ทีม · ความเชื่อใจและท่อบาง';")
r("const CH = { 1: 'A RULE THAT CATCHES OLD APPS UP', 2: 'CHANGING WHO THE TEAM TRUSTS', 3: 'THE THIN PIPE', 4: 'WHERE THIS LEAVES US' };", "const CH = { 1: 'กฎที่ช่วยให้แอปเก่าตามทัน', 2: 'เปลี่ยนว่าทีมเชื่อใจใคร', 3: 'ท่อบาง', 4: 'สรุปว่าอยู่ตรงไหน' };")
r("<div class=\"tag\">CHAPTER ${n} · ${CH[n]}</div>", "<div class=\"tag\">ตอนที่ ${n} · ${CH[n]}</div>")
r("<div class=\"src\">source: ${esc(src)}</div>", "<div class=\"src\">แหล่งที่มา: ${esc(src)}</div>")
# ---- title ----
r("card('title', 'THE TEAM FEATURE · 25 AND 26 OCTOBER 2026', 'Trust and the thin pipe', 'Pieces of work on the Team feature, each measured by automatic checks.', 'A proof of concept. Every number on screen is read from a check log or from the project notes.');",
  "card('title', 'ฟีเจอร์ทีม · 25 และ 26 ตุลาคม 2026', 'ความเชื่อใจและท่อบาง', 'งานหลายชิ้นบนฟีเจอร์ทีม แต่ละชิ้นวัดด้วยการตรวจอัตโนมัติ', 'เป็นเพียงต้นแบบพิสูจน์แนวคิด ตัวเลขทุกตัวบนจออ่านมาจากบันทึกการตรวจหรือบันทึกโครงการ');")
# ---- chapter 1 ----
r("bx(968, 160, 760, 140,", "bx(968, 160, 760, 170,")
r("card('ch1_card', 'Chapter 1', 'A rule that catches old apps up', 'An admin publishes a signed translation rule. Devices on an older version adopt it on their next visit.');",
  "card('ch1_card', 'ตอนที่ 1', 'กฎที่ช่วยให้แอปเก่าตามทัน', 'ผู้ดูแลประกาศกฎแปลงรูปแบบที่เซ็นแล้ว เครื่องที่ใช้เวอร์ชันเก่ารับไปใช้ในการแวะครั้งถัดไป');")
r("'An older app parks what it cannot read'", "'แอปเก่าพักสิ่งที่อ่านไม่ออกไว้ก่อน'")
r("'A change written in a newer shape arrives at a device that does not know that shape yet.'", "'การเปลี่ยนแปลงที่เขียนด้วยรูปแบบใหม่ ไปถึงเครื่องที่ยังไม่รู้จักรูปแบบนั้น'")
r("<h3>Newer app</h3><div class=\"sb\">The admin's device</div><div class=\"tx\">Writes a change in the newer shape.</div>", "<h3>แอปเวอร์ชันใหม่</h3><div class=\"sb\">เครื่องของผู้ดูแล</div><div class=\"tx\">เขียนการเปลี่ยนแปลงด้วยรูปแบบใหม่</div>")
r("chip('SENT', 'cy')", "chip('ส่งแล้ว', 'cy')")
r("<h3>Older app</h3><div class=\"sb\">A device that has not been updated: the change is set aside. ${chip('PARKED', 'am')}</div>", "<h3>แอปเวอร์ชันเก่า</h3><div class=\"sb\">เครื่องที่ยังไม่ได้อัปเดต: การเปลี่ยนแปลงถูกพักไว้ ${chip('พักไว้', 'am')}</div>")
r("<div class=\"sb\">What the older app tells its user.</div>", "<div class=\"sb\">ข้อความจริงที่แอปเก่าบอกผู้ใช้</div>")
r("<h3>How a rule used to arrive</h3><div class=\"tx\">Only through the app's own settings, which means a new app build.</div><div class=\"tx\" style=\"color:#FFEB3B\">An admin had no way to hand a waiting device the rule.</div>",
  "<h3>กฎเคยมาถึงด้วยวิธีใด</h3><div class=\"tx\">ผ่านการตั้งค่าของแอปเองเท่านั้น ซึ่งหมายถึงต้องสร้างแอปเวอร์ชันใหม่</div><div class=\"tx\" style=\"color:#FFEB3B\">ผู้ดูแลไม่มีทางส่งกฎให้เครื่องที่กำลังรออยู่</div>")
r("'The admin publishes the rule, devices adopt it'", "'ผู้ดูแลประกาศกฎ เครื่องอื่นรับไปใช้'")
r("'The signed rule rides inside the team policy message that devices already exchange.'", "'กฎที่เซ็นแล้วเดินทางไปในข้อความนโยบายของทีมที่เครื่องต่าง ๆ แลกเปลี่ยนกันอยู่แล้ว'")
r("['The owner signs the rule', 'offline, with the owner’s key']", "['เจ้าของเซ็นกฎ', 'แบบออฟไลน์ ด้วยกุญแจของเจ้าของ']")
r("['An admin device publishes it', 'inside the team’s policy message']", "['เครื่องผู้ดูแลประกาศกฎ', 'ไปในข้อความนโยบายของทีม']")
r("['Other devices pick it up', 'on their next visit, no new app build']", "['เครื่องอื่นรับกฎไป', 'ในการแวะครั้งถัดไป ไม่ต้องสร้างแอปใหม่']")
r("['The waiting change is read', 'the parked change is folded in']", "['อ่านการเปลี่ยนแปลงที่รออยู่', 'สิ่งที่พักไว้ถูกนำมารวมเข้า']")
r("STEP ${i + 1}", "ขั้นที่ ${i + 1}")
r("<h3>Nothing new is fetched</h3><div class=\"tx\">The rule travels in the bundles the devices already exchange, so it needs no fetch protocol and no new object names.</div>",
  "<h3>ไม่มีอะไรต้องดึงเพิ่ม</h3><div class=\"tx\">กฎเดินทางไปในชุดข้อมูลที่เครื่องแลกเปลี่ยนกันอยู่แล้ว จึงไม่ต้องมีโปรโตคอลดึงข้อมูล และไม่ต้องตั้งชื่อออบเจกต์ใหม่</div>")
r("'Two signatures, not one'", "'ต้องมีลายเซ็นสองชั้น ไม่ใช่ชั้นเดียว'")
r("'A stolen admin device alone is not enough to introduce a rule.'", "'เครื่องผู้ดูแลที่ถูกขโมยเพียงเครื่องเดียวไม่พอที่จะใส่กฎเข้ามา'")
r("<h3>Gate 1: the policy message</h3><div class=\"tx\">Proves that an enrolled admin device sent it.</div>", "<h3>ด่านที่ 1: ข้อความนโยบาย</h3><div class=\"tx\">พิสูจน์ว่าเครื่องผู้ดูแลที่ลงทะเบียนไว้เป็นผู้ส่ง</div>")
r("<h3>Gate 2: the rule itself</h3><div class=\"tx\">Must carry the owner’s signature, checked against the key list pinned when the team was founded.</div>", "<h3>ด่านที่ 2: ตัวกฎเอง</h3><div class=\"tx\">ต้องมีลายเซ็นของเจ้าของ ตรวจกับรายการกุญแจที่ปักไว้ตอนตั้งทีม</div>")
r("['Unsigned rule', 'refused outright', 'unsigned']", "['กฎที่ไม่มีลายเซ็น', 'ถูกปฏิเสธทันที', 'unsigned']")
r("['Rule edited after signing', 'refused', 'bad-signature']", "['กฎที่ถูกแก้หลังเซ็น', 'ถูกปฏิเสธ', 'bad-signature']")
r("['Signed by a key that is not on the list', 'refused', 'untrusted-signer']", "['เซ็นด้วยกุญแจที่ไม่อยู่ในรายการ', 'ถูกปฏิเสธ', 'untrusted-signer']")
r("['Sent by a device that is not an admin', 'refused', 'not-admin']", "['ส่งโดยเครื่องที่ไม่ใช่ผู้ดูแล', 'ถูกปฏิเสธ', 'not-admin']")
r("chip('REFUSED', 'or')", "chip('ถูกปฏิเสธ', 'or')", 2)
r("`Tested with ${F.devices} real browsers`", "`ทดสอบกับเบราว์เซอร์จริง ${F.devices} ตัว`")
r("'One admin, one joiner on an older shape, and a late joiner.'", "'ผู้ดูแลหนึ่งเครื่อง ผู้เข้าร่วมที่ใช้รูปแบบเก่าหนึ่งเครื่อง และผู้เข้าร่วมทีหลัง'")
r("<div class=\"sb\">Admin</div>", "<div class=\"sb\">ผู้ดูแล</div>")
r("chip('PUBLISHES THE SIGNED RULE', 'cy wr')", "chip('ประกาศกฎที่เซ็นแล้ว', 'cy wr')")
r("<div class=\"sb\">Joiner, older shape</div>", "<div class=\"sb\">ผู้เข้าร่วม รูปแบบเก่า</div>")
r("chip('PARKED: WAITING FOR A RULE', 'am wr')", "chip('พักไว้: รอกฎ', 'am wr')")
r("chip('CHANGE READ AFTER A SINGLE VISIT', 'gd wr')", "chip('อ่านการเปลี่ยนแปลงได้หลังแวะครั้งเดียว', 'gd wr')")
r("<div class=\"sb\">Late joiner</div>", "<div class=\"sb\">ผู้เข้าร่วมทีหลัง</div>")
r("chip('ADOPTS THE RULE ON ITS FIRST VISITS', 'gd wr')", "chip('รับกฎไปใช้ในการแวะครั้งแรก ๆ', 'gd wr')")
r("<h3>${F.devices} real browsers (Chromium), one shared folder</h3><div class=\"tx\">A single visit by the joiner is enough: the rule is loaded and the parked change is folded in straight away.</div>",
  "<h3>เบราว์เซอร์จริง ${F.devices} ตัว (Chromium) ใช้โฟลเดอร์ร่วมกัน</h3><div class=\"tx\">ผู้เข้าร่วมแวะครั้งเดียวก็พอ: กฎถูกโหลดและสิ่งที่พักไว้ถูกนำมารวมเข้าทันที</div>")
r("EACH OF THE TWO HOSTS (ERP, MODELLER)", "แอปแต่ละตัว (ERP, Modeller)")
r("<div class=\"lab\">checks passed · failed</div>", "<div class=\"lab\">ผ่านการตรวจ · ไม่ผ่าน</div>")
r("${F.pubMut} of ${F.pubMut}</div><div class=\"lab\">deliberately broken copies caught</div>", "${F.pubMut} จาก ${F.pubMut}</div><div class=\"lab\">สำเนาที่จงใจทำให้เสียถูกจับได้</div>")
r("'Merged, with stated limits'", "'รวมแล้ว พร้อมข้อจำกัดที่ระบุไว้'")
r("'Merged into the ERP and the Modeller (bim-ootb pull request #'", "'รวมเข้า ERP และ Modeller แล้ว (bim-ootb pull request #'")
r("chip('MERGED', 'gd')", "chip('รวมแล้ว', 'gd')", 3)
r("engine checks passed · failed, and ${F.verMut} of ${F.verMut} broken copies caught", "การตรวจของเอนจินผ่าน · ไม่ผ่าน และจับสำเนาเสียได้ ${F.verMut} จาก ${F.verMut}")
r("browser test suites passed · failed, with 0 page errors", "ชุดทดสอบบนเบราว์เซอร์ผ่าน · ไม่ผ่าน และไม่มีข้อผิดพลาดของหน้า")
r("chip('NOT BUILT', 'am')", "chip('ยังไม่ได้สร้าง', 'am')")
r("An admin screen to publish a rule: today it is a call in code.", "หน้าจอให้ผู้ดูแลประกาศกฎ: ตอนนี้ต้องเรียกผ่านโค้ด")
r("A tool to sign a rule: the owner’s key signs offline.", "เครื่องมือเซ็นกฎ: กุญแจของเจ้าของเซ็นแบบออฟไลน์")
r("A way to withdraw a published rule: it stays for good, and a team can hold at most ${F.maxSets}.", "วิธีถอนกฎที่ประกาศไปแล้ว: กฎอยู่ถาวร และทีมเก็บได้สูงสุด ${F.maxSets} ชุด")
# ---- chapter 2 ----
r("card('ch2_card', 'Chapter 2', 'Changing who the team trusts', 'A signed statement adds a key, or lets the backup key replace a lost one.');", "card('ch2_card', 'ตอนที่ 2', 'เปลี่ยนว่าทีมเชื่อใจใคร', 'คำแถลงที่เซ็นแล้วเพิ่มกุญแจได้ หรือให้กุญแจสำรองมาแทนกุญแจที่หาย');")
r("'The trusted keys were fixed at founding'", "'กุญแจที่เชื่อถือถูกกำหนดตายตัวตั้งแต่ตั้งทีม'")
r("'Until now, a lost or leaked primary key meant founding a new team.'", "'ที่ผ่านมา กุญแจหลักที่หายหรือรั่ว หมายถึงต้องตั้งทีมใหม่'")
r("<h3>Trusted keys, pinned when the team was founded</h3>", "<h3>กุญแจที่เชื่อถือ ปักไว้ตอนตั้งทีม</h3>")
r("kc('K0', 'primary')}${kc('K1', 'backup')", "kc('K0', 'กุญแจหลัก')}${kc('K1', 'สำรอง')")
r("Primary lost or leaked: the only way out was to found a new team.", "กุญแจหลักหายหรือรั่ว: ทางออกเดียวคือตั้งทีมใหม่")
r("<h3>Now: a signed statement</h3><div class=\"tx\">The new list: ${F.keysMin} to ${F.keysMax} keys.</div>", "<h3>ตอนนี้: คำแถลงที่เซ็นแล้ว</h3><div class=\"tx\">รายการใหม่: กุญแจ ${F.keysMin} ถึง ${F.keysMax} ดอก</div>")
r("A fingerprint of the list in force, so an old statement cannot be replayed.", "ลายนิ้วมือของรายการที่ใช้อยู่ เพื่อไม่ให้เอาคำแถลงเก่ามาใช้ซ้ำ")
r("A signature from a key that is already on that list.", "ลายเซ็นจากกุญแจที่อยู่ในรายการนั้นแล้ว")
r("Sent by an admin device: the same two-signature idea as for rules.", "ส่งโดยเครื่องผู้ดูแล: แนวคิดลายเซ็นสองชั้นเดียวกับกฎ")
r("'A rotation, step by step'", "'การหมุนเวียนกุญแจ ทีละขั้น'")
r("'The primary adds a key. Later the backup replaces a lost primary.'", "'กุญแจหลักเพิ่มกุญแจใหม่ ต่อมากุญแจสำรองมาแทนกุญแจหลักที่หาย'")
r("<h3>The list in force</h3>", "<h3>รายการที่ใช้อยู่</h3>")
r("lst([['K0', 'primary'], ['K1', 'backup']])", "lst([['K0', 'กุญแจหลัก'], ['K1', 'สำรอง']])")
r("lst([['K0', 'primary'], ['K1', 'backup'], ['K2', 'added', 'new']])", "lst([['K0', 'กุญแจหลัก'], ['K1', 'สำรอง'], ['K2', 'เพิ่มใหม่', 'new']])")
r("lst([['K0', 'dropped', 'gone'], ['K1', 'backup'], ['K3', 'new', 'new']])", "lst([['K0', 'ถูกถอน', 'gone'], ['K1', 'สำรอง'], ['K3', 'ใหม่', 'new']])")
r("At founding: the primary and the backup.", "ตอนตั้งทีม: กุญแจหลักและกุญแจสำรอง")
r("The primary signs a statement that adds another key.", "กุญแจหลักเซ็นคำแถลงที่เพิ่มกุญแจอีกดอก")
r("The primary is lost: the backup signs a new list that leaves it out.", "กุญแจหลักหาย: กุญแจสำรองเซ็นรายการใหม่ที่ไม่มีกุญแจหลักนั้น")
r("A PLAN SIGNED BY THE OLD PRIMARY", "แผนที่เซ็นด้วยกุญแจหลักเดิม")
r("A PLAN SIGNED BY THE NEW KEY", "แผนที่เซ็นด้วยกุญแจใหม่")
r("chip('UNTRUSTED', 'or')", "chip('ไม่เชื่อถือ', 'or')", 2)
r("chip('OK', 'gd')", "chip('ใช้ได้', 'gd')", 2)
r("'plan-trust-untrusted-signer': 'Signed by a key that is not on the list'", "'plan-trust-untrusted-signer': 'เซ็นด้วยกุญแจที่ไม่อยู่ในรายการ'")
r("'plan-trust-signature': 'Keys edited after signing'", "'plan-trust-signature': 'กุญแจถูกแก้หลังเซ็น'")
r("'plan-trust-stale': 'An old statement replayed after a newer one'", "'plan-trust-stale': 'เอาคำแถลงเก่ามาใช้ซ้ำหลังมีคำแถลงใหม่'")
r("'bad-policy:planTrust': 'A private key hidden in the key list'", "'bad-policy:planTrust': 'กุญแจส่วนตัวซ่อนอยู่ในรายการกุญแจ'")
r("'not-admin': 'A valid statement sent by a device that is not an admin'", "'not-admin': 'คำแถลงที่ถูกต้อง แต่ส่งโดยเครื่องที่ไม่ใช่ผู้ดูแล'")
r("'epoch-stale': 'A valid statement inside an out-of-date policy'", "'epoch-stale': 'คำแถลงที่ถูกต้อง แต่อยู่ในนโยบายที่ล้าสมัย'")
r("'plan-trust-unpinned': 'A team founded with no list cannot gain one'", "'plan-trust-unpinned': 'ทีมที่ตั้งโดยไม่มีรายการ จะมีรายการทีหลังไม่ได้'")
r("`${F.refusals} refusals, each on both devices`", "`ปฏิเสธ ${F.refusals} กรณี บนเครื่องทั้งคู่`")
r("'Every one of these was refused on both devices.'", "'ทุกกรณีถูกปฏิเสธบนเครื่องทั้งคู่'")
r("<div class=\"lab\">of ${F.refusals} refused</div>", "<div class=\"lab\">จาก ${F.refusals} ถูกปฏิเสธ</div>")
r("`${F.ptJudged} checks, none failed`", "`${F.ptJudged} การตรวจ ไม่มีที่ล้มเหลว`")
r("'The checks were written first, and they failed before the build.'", "'เขียนการตรวจไว้ก่อน และมันล้มเหลวก่อนสร้างจริง'")
r("<div class=\"lab\">checks passed · ${F.ptFails} failed</div>", "<div class=\"lab\">ผ่านการตรวจ · ล้มเหลว ${F.ptFails}</div>")
r("${F.redArms} checks failed before the build, as they should.", "${F.redArms} การตรวจล้มเหลวก่อนสร้าง ซึ่งเป็นสิ่งที่ควรเป็น")
r("<h3>${F.plantrustMut} of ${F.plantrustMut} deliberately broken copies caught</h3>", "<h3>จับสำเนาที่จงใจทำให้เสียได้ ${F.plantrustMut} จาก ${F.plantrustMut}</h3>")
r("Each broken copy turned at least one check red.", "สำเนาเสียแต่ละชุดทำให้การตรวจอย่างน้อยหนึ่งข้อเป็นสีแดง")
r("<h3>Order does not matter</h3><div class=\"tx\">A third device that receives the same ${F.reverseOps} messages in reverse order ends with the same list.</div>", "<h3>ลำดับไม่สำคัญ</h3><div class=\"tx\">เครื่องที่สามที่ได้รับข้อความชุดเดียวกัน ${F.reverseOps} ข้อความ ในลำดับย้อนกลับ ได้รายการเดียวกัน</div>")
r("'The apps follow, with no code change'", "'แอปตามไปเอง โดยไม่ต้องแก้โค้ด'")
r("'Each app re-checks the plan after every visit, using the list now in force.'", "'แอปแต่ละตัวตรวจแผนซ้ำหลังการแวะทุกครั้ง โดยใช้รายการที่มีผลอยู่ตอนนี้'")
r("['ERP host', 'Modeller host']", "['แอป ERP', 'แอป Modeller']")
r("Open under the founding key K1: plan accepted.", "เปิดอยู่ภายใต้กุญแจตั้งทีม K1: ยอมรับแผน")
r("An owner-signed policy moves the list to K2.", "นโยบายที่เจ้าของเซ็นย้ายรายการไปเป็น K2")
r("A plan signed by K1: ${chip('ไม่เชื่อถือ', 'or')} the scope closes.", "แผนที่เซ็นด้วย K1: ${chip('ไม่เชื่อถือ', 'or')} ขอบเขตถูกปิด")
r("A plan signed by K2: ${chip('ใช้ได้', 'gd')}", "แผนที่เซ็นด้วย K2: ${chip('ใช้ได้', 'gd')}")
r("<div class=\"lab\">host checks passed · failed (was ${F.hostsWas})</div>", "<div class=\"lab\">การตรวจของแอปผ่าน · ล้มเหลว (เดิม ${F.hostsWas})</div>")
r("${F.regression} older engine checks unchanged.", "การตรวจเดิมของเอนจิน ${F.regression} ข้อ ไม่เปลี่ยน")
r("${F.suiteN} browser test suites, 0 failed, 0 page errors.", "ชุดทดสอบบนเบราว์เซอร์ ${F.suiteN} ชุด ล้มเหลว 0 ไม่มีข้อผิดพลาดของหน้า 0")
r("chip('MERGED · PULL REQUEST #' + F.pr2, 'gd')", "chip('รวมแล้ว · PULL REQUEST #' + F.pr2, 'gd')")
r("'What is still open'", "'สิ่งที่ยังเปิดอยู่'")
r("'Stated in the project notes at the time of the merge.'", "'ระบุไว้ในบันทึกโครงการ ณ เวลาที่รวมโค้ด'")
r("chip('OPEN', 'am')", "chip('ยังเปิดอยู่', 'am')", 2)
r("A rule signed by a key that a rotation later drops stays loaded on devices that already loaded it. A fresh device refuses it, so the two read that change differently.", "กฎที่เซ็นด้วยกุญแจซึ่งการหมุนเวียนถอนออกภายหลัง ยังคงถูกโหลดอยู่บนเครื่องที่โหลดไปแล้ว เครื่องใหม่จะปฏิเสธกฎนั้น ทำให้สองฝ่ายอ่านการเปลี่ยนแปลงเดียวกันต่างกัน")
r("No tool yet to build and sign the statement, and no admin screen.", "ยังไม่มีเครื่องมือสร้างและเซ็นคำแถลง และยังไม่มีหน้าจอผู้ดูแล")
r("chip('BY DESIGN', 'cy')", "chip('ตั้งใจให้เป็น', 'cy')")
r("A team founded with no list cannot gain one: an admin device could pin its own key. It must be founded again.", "ทีมที่ตั้งโดยไม่มีรายการจะมีรายการทีหลังไม่ได้ เพราะเครื่องผู้ดูแลอาจปักกุญแจของตัวเอง ต้องตั้งทีมใหม่")
# ---- chapter 3: REPLACED (FL-8). The English Chapter 3 block (from "// ---------- chapter 3" to "// ---------- chapter 4") is cut out whole and ONE page is put in its place. Every claim traces to X.SUP (facts5_th.js §SUP_TRACE). ----
CH3_NEW = r"""// ---------- chapter 3: replaced by ONE card (FL-8: one DocAction executor per document) ----------
  const SUP = X.SUP;
  C.ch3_super = page(3, 'แนวคิดนี้ถูกแทนที่แล้ว', 'แนวคิดที่ให้เครื่องที่สองคำนวณผลของ Complete เอง ถูกถอนแล้ว',
    bx(0, 0, 1728, 128, `<div style="display:flex;align-items:center;gap:26px"><div>${chip('ถูกแทนที่แล้ว', 'or')}</div><div><h3>เครื่องที่สองคำนวณผลของ Complete เอง</h3><div class="sb">ถูกถอนแล้ว · แทนที่ด้วยกฎผู้ดำเนินการเดียวต่อเอกสาร</div></div></div>`, 'or', 0.06) +
    bx(0, 150, 840, 200, `<h3>HQ ดำเนินการครั้งเดียว</h3><div class="tx">HQ (สำนักงานใหญ่) ดำเนินการ Complete และลงบัญชีเพียงครั้งเดียว</div><div class="sb">เอกสารแต่ละใบมีผู้ดำเนินการ DocAction เพียงคนเดียว</div>`, 'gd', 0.3) +
    bx(888, 150, 840, 200, `<h3>เครื่องที่จุดขาย</h3><div class="tx">แจ้งรายการเท่านั้น และรับกลับเฉพาะสิ่งที่ต้องใช้</div><div class="sb">ไม่มีเครื่องอื่นรัน Complete หรือลงบัญชีซ้ำ</div>`, 'cy', 0.55) +
    bx(0, 372, 1728, 96, `<div class="tx" style="margin-top:0;color:#FFEB3B">ภาพยนตร์เรื่องหลังจะแสดงให้เห็นว่ามันทำงานจริง</div>`, 'am', 0.8),
    `TEAMWORK_FRAMEWORK.md line ${SUP.superseded.n} (SUPERSEDED, §36.1); TEAMWORK_FRAMEWORK.md line ${SUP.fl8.n} (FL-8, §16.0a); TEAMWORK_FRAMEWORK.md line ${SUP.direction.n} (§37 / §38 film direction)`, 'ch3_super');

  """
CH3_FROM = "// ---------- chapter 3 ----------"
CH3_TO = "// ---------- chapter 4 ----------"

# ---- chapter 4 ----
r("card('ch4_card', 'Chapter 4', 'Where this leaves us', 'Merged and checked on real devices, and one piece that is evidence only.');", "card('ch4_card', 'ตอนที่ 4', 'สรุปว่าอยู่ตรงไหน', 'รวมแล้วและตรวจบนเครื่องจริง ส่วนอีกชิ้นถูกแทนที่แล้ว');")
r("'The ledger', 'What is merged, and what is not.'", "'บัญชีสรุป', 'อะไรรวมแล้ว และอะไรยังไม่รวม'")
r("<h3>Publish signed rules</h3><div class=\"sb\">${F.verJudged} engine checks, ${F.pubJudged} + ${F.pubJudged} host checks</div>", "<h3>ประกาศกฎที่เซ็นแล้ว</h3><div class=\"sb\">การตรวจเอนจิน ${F.verJudged} ข้อ การตรวจแอป ${F.pubJudged} + ${F.pubJudged} ข้อ</div>")
r("<h3>Change the trusted keys</h3><div class=\"sb\">${F.ptJudged} engine checks, ${F.hostsJudged} host checks</div>", "<h3>เปลี่ยนกุญแจที่เชื่อถือ</h3><div class=\"sb\">การตรวจเอนจิน ${F.ptJudged} ข้อ การตรวจแอป ${F.hostsJudged} ข้อ</div>")
r("<h3>The thin pipe</h3><div class=\"sb\">${F.thinDerivable} of ${F.thinN} kinds identical · ${F.bytesSaving}% fewer bytes · ${F.mustBuild} things to build first</div>", "<h3>ท่อบาง</h3><div class=\"sb\">เครื่องที่สองคำนวณผลเอง · ถูกแทนที่ด้วยกฎผู้ดำเนินการเดียว</div>")
r("chip('EVIDENCE ONLY · NOTHING SHIPPED', 'am')", "chip('ถูกแทนที่แล้ว', 'am')")
r("Whether to go thin is the owner’s decision.", "ภาพยนตร์เรื่องหลังจะแสดงให้เห็นว่ามันทำงานจริง")
r("'Where every number comes from', 'The frozen copies read for this film, and whether the live file has changed since.'", "'ตัวเลขทุกตัวมาจากไหน', 'สำเนาที่ตรึงไว้ซึ่งอ่านสำหรับภาพยนตร์เรื่องนี้ และไฟล์จริงเปลี่ยนไปหรือไม่'")
r("${i.key === 'tf' ? ' (lines 4018 to 4068)' : ''}", "${i.note || ''}")
r("frozen copy sha256 ${i.sha16}…", "สำเนาที่ตรึงไว้ sha256 ${i.sha16}…")
r("'LIVE FILE UNCHANGED' : 'LIVE FILE CHANGED'", "'ไฟล์จริงไม่เปลี่ยน' : 'ไฟล์จริงเปลี่ยนแล้ว'")
r("Reading only: no engine, host or prompt file was changed to make this film.", "เลขบรรทัดที่อ้างอิงคือบรรทัดของไฟล์จริงตอนนี้ และข้อความตรงกับสำเนาที่ตรึงไว้ · อ่านอย่างเดียว ไม่มีไฟล์ใดถูกแก้เพื่อทำภาพยนตร์เรื่องนี้")
# the English chapter-3 block is cut out and CH3_NEW put in its place; the ledger source tag cites the SUP lines instead of the G9 / thin-derive lines
a0 = s.index(CH3_FROM); a1 = s.index(CH3_TO)
assert a0 > 0 and a1 > a0 and s.count(CH3_FROM) == 1 and s.count(CH3_TO) == 1
print(f'§CARDS_TH chapter3_block_removed chars={a1 - a0}')
s = s[:a0] + CH3_NEW + s[a1:]
LEDGER_OLD = "S.pr1.replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line ') + ', ' + S.pr2.replace(/^.*:/, 'line ') + '; ' + D.g9Src.replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line ') + ' (not decided)'"
LEDGER_NEW = "S.pr1.replace('TEAMWORK_FRAMEWORK.md:', 'TEAMWORK_FRAMEWORK.md line ') + ', ' + S.pr2.replace(/^.*:/, 'line ') + '; TEAMWORK_FRAMEWORK.md line ' + X.SUP.superseded.n + ' (SUPERSEDED)'"
assert s.count(LEDGER_OLD) == 1; s = s.replace(LEDGER_OLD, LEDGER_NEW)
r("'film5/inputs (checksums), film5/logs/facts.log (every number with its source line)'", "'film5/inputs, film5/th/inputs (checksums); film5/th/logs/facts.log (every number with its source line)'")
bad = 0
for a, b, n in R:
    c = s.count(a)
    if c != n: bad += 1; print(f'§CARDS_TH_MISMATCH expected {n} found {c}: {a[:90]}')
    s = s.replace(a, b)
if bad: sys.exit(1)
s = s.replace('// ⚠ DO NOT REMOVE — Scope: the cards (HTML) of Film 5', '// ⚠ GENERATED by film5/th/mk_cards5_th.py from ../cards5.js — do not edit by hand. Scope (original): the cards (HTML) of Film 5', 1)
open(os.path.join(here, 'cards5_th.js'), 'w', encoding='utf8').write(s)
print(f'§CARDS_TH replacements={len(R)} applied_ok out=cards5_th.js')
