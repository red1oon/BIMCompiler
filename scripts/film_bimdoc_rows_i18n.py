# ⚠ DO NOT REMOVE — film_bimdoc_rows_i18n.py: the BIM Document film dialogue in Chinese (zh) and Malay (ms), row for row with scripts/film_bimdoc_rows.py (FILM_NARRATION.md §BIMDOC-FILM-ZH-MS).
# Same ids, same cues (copied from the English final TSV), same fact sources, same turn count. Numbers are spoken as words of the language (Chinese numerals / Malay number words) and
# the film witness reads them back (FILM_LANG=zh|ms). Chinese avoids 一/两 in any phrase that is not a counted number (it would read as the number 1/2); Malay uses "sebuah" for "a single".
# Malay VOICE says E-R-P (owner 2026-11-09: "use E-R-P to avoid single syllable audio"); its CAPTION keeps ERP (the fitter's caption TSV).
# usage: python3 film_bimdoc_rows_i18n.py <zh|ms> <english final.tsv> <out.tsv> [<caption.tsv>]
import sys
ROWS = {
 'zh': {
  'ch': ("F: 在这之前是什么？ | M: 从 BIM 推送的项目订单。",
         "F: 在这之前发生了什么？ | M: 在之前的影片里，我们把 BIM 模型构件推送到 ERP，成为项目订单。 | F: 那现在呢？ | M: 现在，项目的后台文档也接了进来，成为新的 BIM 数据记录集：BIM 文档。"),
  'before': ("F: 项目和空页签？ | M: 图纸没人跟踪。",
         "F: 两个阶段，BIM 文档页签却是空的？ | M: 对。图纸都是没人跟踪的文件。"),
  'card': ("F: 什么把图纸连到发票？ | M: 整条链路。",
         "F: 图纸和发票靠什么相连？ | M: 整条链路：图纸、BIM 文档、项目任务、发票。"),
  'after': ("F: 之后呢？ | M: 三张里两张已签发。",
         "F: 那这个项目之后呢？ | M: 现在它有了登记册。三张平面图里有两张已签发。 | F: 那阶段呢？ | M: 阶段显示四个里有三个。 | F: 这些是谁算出来的？ | M: 没人输入。它们是计算列，在任务上，也在阶段上。"),
  'b1': ("F: 阶段从哪来？ | M: 来自项目类型。",
         "F: 它的阶段从哪里来？ | M: 来自项目类型。这个类型是 Consulting。运行它，会把三个阶段和两个任务复制到项目里。"),
  'b1r': ("F: 现在有几个阶段？ | M: 五个。",
         "F: 现在项目有几个阶段？ | M: 五个：自己的两个，加类型的三个。"),
  'b2': ("F: 图纸呢？ | M: 每张图纸是任务下的记录。",
         "F: 那图纸呢？放在哪里？ | M: 每张图纸都成为任务下的记录，有编号、标题、专业和文件类型。"),
  'b2n': ("F: 手动输入？ | M: 这里是的。",
         "F: 那是手动输入的吗？ | M: 这张图纸我来输入，其他的也照样录入。 | F: 那项目和阶段呢？ | M: 它们来自录入图纸时所在的任务。"),
  'b2r': ("F: 这个任务有几张？ | M: 三张。",
         "F: 这个任务上有几张图纸？ | M: 三张。登记册显示三行，任务统计出三项交付物。 | F: 这是系统算的，还是你算的？ | M: 系统算的。这是任务上的计算列，没人输入。"),
  'b3': ("F: 文件怎么放进来？ | M: 用附件按钮。",
         "F: 图纸文件本身呢？ | M: 用附件按钮放到这行。测试图纸，七十九字节，指纹以 c、八、二、五、四、零 开头。"),
  'b4': ("F: 能在这里打开吗？ | M: 可以，在 Modeller 中。",
         "F: 能从这里打开吗？ | M: 从齿轮菜单，像其他流程那样，在 Modeller 中打开。Modeller 记录的指纹相同，以 c、八、二、五、四、零 开头。"),
  'b5': ("F: 谁说就绪？ | M: 操作栏：先审，再施工。",
         "F: 谁来决定图纸已经就绪？ | M: 文档操作栏。草稿先送审，然后发布施工。 | F: 有记录吗？ | M: 每个步骤都是记录下来的状态转换，操作栏只提供合法的步骤。"),
  'b6': ("F: 修订呢？ | M: 第一版作废。",
         "F: 图纸改了怎么办？ | M: 修订版是新的记录。把第二版发布施工，第一版就变成已作废，并链接到新记录。"),
  'b7': ("F: 工时呢？ | M: 记在任务上。",
         "F: 工时呢？ | M: 记在这个任务上。三条工时记录，任务显示已登记七小时。"),
  'b8': ("F: 谁输入进度？ | M: 没人，是计算的。",
         "F: 进度呢？谁输入？ | M: 没人，这些列是计算的。这个任务：三张里一张已签发，挣得八小时。 | F: 阶段呢？ | M: 四张里两张已签发，挣得二十二小时。"),
  'b9': ("F: 钱呢？ | M: 勾选阶段，生成订单。",
         "F: 那什么时候变成钱？ | M: 把阶段勾选为完成。这个阶段已定价：八小时，单价五十。 | F: 然后呢？ | M: 运行它的生成订单。它会生成一张订单，一行，金额四百。"),
  'b9i': ("F: 发票呢？ | M: 完成订单，发票随之而来。",
         "F: 那发票呢？ | M: 完成订单，发票随之生成。 | F: 能从订单跳到发票吗？ | M: 能，Zoom Across 会带你过去。 | F: 金额相同吗？ | M: 逐行对应。八小时，单价五十，四百。 | F: 所以账单跟着图纸走。 | M: 是的，通过项目任务。"),
  'b10': ("F: 数量会变吗？ | M: 从二到三。",
         "F: 图纸数量会跟着变吗？ | M: 再签发一张图纸，已签发数量就前进一格，从二到三。"),
  'end': ("F: 进度计划呢？ | M: 4D 计划读回项目订单。",
         "F: 那进度计划呢？ | M: 4D 进度计划已经读回项目订单：按阶段对比计划成本与承诺成本。 | F: 以前有人做过吗？ | M: BIM 加 ERP，有，在服务器上。在单个浏览器内核里、用单条签名日志做到的，据我们所知还没有。 | F: 这是真实项目吗？ | M: 不是，是测试数据。"),
 },
 'ms': {
  'ch': ("F: Apa sebelum ini? | M: Project Order, dihantar dari BIM.",
         "F: Apa yang berlaku sebelum ini? | M: Dalam filem terdahulu, kami menghantar elemen model BIM ke E-R-P, sebagai Project Order. | F: Dan sekarang? | M: Sekarang dokumen pejabat belakang projek turut disertakan, sebagai set rekod BIM baharu: BIM Document."),
  'before': ("F: Projek, dan tab kosong? | M: Lukisan tidak dijejak.",
         "F: Dua fasa, tab BIM Document kosong? | M: Ya. Lukisannya fail tak dijejak."),
  'card': ("F: Apa penghubungnya? | M: Sebuah rantaian.",
         "F: Apa penghubung lukisan dan invois? | M: Sebuah rantaian: helaian, BIM Document, tugas, invois."),
  'after': ("F: Selepas itu? | M: Dua daripada tiga dikeluarkan.",
         "F: Projek sama, selepas itu? | M: Kini ada daftar. Dua daripada tiga helaian dikeluarkan. | F: Fasanya? | M: Tiga daripada empat. | F: Siapa mengiranya? | M: Tiada siapa. Lajur dikira, pada tugas dan fasa."),
  'b1': ("F: Dari mana fasanya? | M: Daripada jenis projek.",
         "F: Dari mana datangnya fasa-fasa itu? | M: Daripada jenis projek. Jenis ini ialah Consulting. Menjalankannya menyalin tiga fasa dan dua tugasnya ke dalam projek."),
  'b1r': ("F: Berapa fasa sekarang? | M: Lima.",
         "F: Berapa fasa sekarang? | M: Lima: dua sendiri, tambah tiga."),
  'b2': ("F: Lukisannya? | M: Setiap helaian ialah baris di bawah tugas.",
         "F: Dan lukisannya? Ke mana perginya? | M: Setiap helaian menjadi baris di bawah tugas, dengan nombor, tajuk, disiplin dan jenis fail."),
  'b2n': ("F: Anda taip? | M: Di sini, ya.",
         "F: Anda taip? | M: Saya taip helaian ini, yang lain sama. | F: Projek dan fasanya? | M: Daripada tugas helaian itu."),
  'b2r': ("F: Berapa pada tugas ini? | M: Tiga.",
         "F: Berapa helaian di tugas ini? | M: Tiga. Daftar tunjuk tiga baris, tugas kira tiga serahan. | F: Sistem yang kira, atau anda? | M: Sistem. Lajur dikira, tiada siapa menaip."),
  'b3': ("F: Bagaimana fail masuk? | M: Butang lampiran.",
         "F: Failnya? | M: Butang lampiran. Tujuh puluh sembilan bait, cap jari bermula c, lapan, dua, lima, empat, kosong."),
  'b4': ("F: Boleh buka dari sini? | M: Dalam Modeller, ya.",
         "F: Boleh saya buka dari sini? | M: Dari menu gear, seperti proses lain. Buka dalam Modeller. Dan Modeller merekodkan cap jari yang sama, bermula c, lapan, dua, lima, empat, kosong."),
  'b5': ("F: Siapa kata sedia? | M: Bar tindakan: semakan, kemudian pembinaan.",
         "F: Siapa tentukan helaian sedia? | M: Bar tindakan dokumen. Draf ke semakan, kemudian ke pembinaan. | F: Direkodkan? | M: Setiap langkah direkod, dan bar hanya tawarkan yang sah."),
  'b6': ("F: Dan revisi? | M: Revisi satu digantikan.",
         "F: Bila lukisan berubah? | M: Revisi ialah baris baharu. Keluarkan revisi dua, dan revisi satu digantikan, dipautkan ke baris baharu."),
  'b7': ("F: Jam kerja? | M: Ditempah pada tugas.",
         "F: Jam kerja? | M: Ditempah pada tugas: tiga baris masa, tujuh jam."),
  'b8': ("F: Siapa taip kemajuan? | M: Tiada siapa. Ia dikira.",
         "F: Siapa taip kemajuan? | M: Tiada siapa, ia dikira. Tugas ini: satu daripada tiga dikeluarkan, lapan jam. | F: Fasanya? | M: Dua daripada empat, dua puluh dua jam."),
  'b9': ("F: Dan wangnya? | M: Tandakan fasa, Generate Order.",
         "F: Dan bila ia menjadi wang? | M: Tandakan fasa sebagai selesai. Peringkat ini sudah berharga: lapan jam pada lima puluh. | F: Kemudian? | M: Jalankan Generate Order. Ia membuat pesanan dengan satu baris, empat ratus."),
  'b9i': ("F: Invoisnya? | M: Lengkapkan pesanan, invois menyusul.",
         "F: Invoisnya? | M: Lengkapkan pesanan, invois menyusul. | F: Boleh capai dari pesanan? | M: Ya, melalui Zoom Across. | F: Amaun sama? | M: Baris demi baris. Lapan pada lima puluh, empat ratus. | F: Jadi bil ikut lukisan. | M: Melalui tugas projek, ya."),
  'b10': ("F: Kiraan bergerak? | M: Dua kepada tiga.",
         "F: Kiraan turut bergerak? | M: Satu lagi helaian, kiraan naik satu, dua kepada tiga."),
  'end': ("F: Dan jadualnya? | M: Jadual 4D membaca semula Project Order.",
         "F: Dan jadualnya? | M: Jadual 4D sudah membaca semula Project Order: kos dirancang berbanding kos komited, fasa demi fasa. | F: Pernahkah orang lain melakukannya? | M: BIM dengan E-R-P, ya, pada pelayan. Dalam sebuah kernel pelayar, pada sebuah log bertandatangan, kami tidak tahu sesiapa. | F: Adakah ini projek sebenar? | M: Tidak. Data ujian."),
 },
}
if __name__ == '__main__':
    lang, en, out = sys.argv[1:4]; cap = sys.argv[4] if len(sys.argv) > 4 else None; R = ROWS[lang]
    rows = [l.split('\t') for l in open(en).read().split('\n') if l]
    miss = [r[0] for r in rows if r[0] not in R]; assert not miss, f'{lang} lacks rows {miss}'
    lines, caps = [], []
    for r in rows:
        short, detail = R[r[0]]
        assert detail.count('|') == r[5].count('|'), f'{lang} {r[0]}: {detail.count("|")+1} turns vs English {r[5].count("|")+1}'
        lines.append('\t'.join(r[:4] + [short, detail]))
        caps.append(r[0] + '\t' + detail.replace('E-R-P', 'ERP'))
    open(out, 'w').write('\n'.join(lines) + '\n')
    if cap: open(cap, 'w').write('\n'.join(caps) + '\n')
    print(f'§LANG-TSV lang={lang} rows={len(lines)} (ids, cues, sources and turn counts = English){" caption=" + cap if cap else ""}')
