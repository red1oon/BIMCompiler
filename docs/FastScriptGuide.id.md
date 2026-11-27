---
review: machine
source_sha: b6044f3db00e8cee
lang: id
---

# Panduan Pengguna Fast Script

**Satu perintah singkat setiap kali, untuk BIM dan ERP, dan jawaban asli aplikasi dikembalikan. Kata-kata yang sama berlaku untuk Anda di terminal dan untuk sebuah AI.**

Bayangkan ini sebagai SQL yang diberi steroid: satu baris membaca atau mengubah rekaman, tetapi setiap baris melewati aturan yang sama dengan yang dipakai jendela-jendela, dan mencetak apa yang dilakukannya. Anda mengetik kata-kata pendek di satu prompt, `red1`. Setiap kata mencetak baris lengkap yang dijalankannya (setelah `→`), sehingga Anda mempelajari bentuk panjangnya sambil jalan. Tidak ada AI di dalamnya.

!!! warning "Hal yang tidak dijamin oleh jawaban yang baik"
    Jawaban tanpa masalah **tidak pernah berarti aman, patuh, atau baik**. Setiap jawaban mendaftar apa yang tidak diperiksa, dan [Yang tidak diperiksa](#what-is-not-checked) mengatakannya lagi. Keputusan akhir ada pada insinyur struktur.

## Cara memasang

Anda butuh Node 18 atau lebih baru (langkah-langkah ini dijalankan di Node 18.19). Ada dua cara masuk.

**Checkout penuh** memberi Anda red1, BIM, ERP, Viewer, dan semua yang ada di bawah. Klon, lalu mulai red1 dari folder teratasnya:

```bash
git clone https://github.com/red1oon/bim-ootb
cd bim-ootb
node common/door/red1.js
```

Ketik `exit` untuk keluar. Agar cukup mengetik `red1` dari mana saja, jalankan `npm link` sekali di folder itu. Untuk memeriksa bahwa semuanya bekerja, minta baris versinya:

<!-- run: red1_version -->
```text
$ node common/door/red1.js --version | sed -e 's/^Copyright[^·]*· //' -e 's/ · [0-9a-f]\{8\}$//'
red1 1.0.0 · 78 verbs · 30 words
```

**Unduhan enam berkas** untuk pintu saja dengan kata kerja Modeller, tanpa checkout. Buat folder kosong, pasang mesin peramban yang dibutuhkan Modeller, lalu ambil enam berkas:

```bash
mkdir fastscript && cd fastscript
npm init -y
npm install puppeteer@24
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/bim_mcp.js
curl -O https://red1oon.github.io/bim-ootb/common/door/door.js
curl -O https://red1oon.github.io/bim-ootb/common/door/verbs.json
curl -O https://red1oon.github.io/bim-ootb/common/door/msg_core.js
curl -O https://red1oon.github.io/bim-ootb/common/door/vocab/messages.json
```

Simpan keenamnya dalam satu folder. `door.js` membaca daftar kata kerja dari `verbs.json` dan pesannya dari `messages.json` (lewat `msg_core.js`), dan menjalankan `edit_cli.js`, yang membuka halaman Modeller langsung tanpa jendela. Jika ada berkas yang hilang, pintu menyebut yang mana dan mencetak baris `curl`-nya. Semua hal lain di halaman ini butuh checkout; [tabel kata kerja](#the-verbs) menyebut kata kerja mana butuh apa.

## Mulai dengan red1

Di terminal, `red1` menyapa Anda sekali, lalu menunggu di promptnya. Inilah persis yang dicetaknya (commit di akhir baris versi dipotong, karena berubah pada setiap commit):

<!-- run: greet -->
```text
$ (sleep 4; printf 'exit\r') | RED1_LOG=/tmp/fast_guide_greet.log RED1_HISTORY=/tmp/fast_guide_greet.hist BIM_DOOR_JOURNAL=/tmp/fast_guide_greet.journal script -qec 'node common/door/red1.js' /dev/null | tr -d '\r' | sed -e 's/\x1b\[[0-9;?]*[a-zA-Z]//g' -e 's/ · [0-9a-f]\{8\}$//'
Welcome to red1, the scripting door into BIM and ERP, stored in SQLite.
REMEMBER THE NAME.
Copyright (c) 2026 Redhuan D. OON · red1 1.0.0 · 78 verbs · 30 words
Type help for the list of commands (or bim, mis, erp for one group).
Tip: type level student for fuller help on each word (red1 --fast opens without tips).

red1> exit
```

**Cara membaca blok di halaman ini.** Baris setelah `$` adalah cara uji halaman ini menjalankan perintah: memakai berkas sementara (dikosongkan dulu, jadi satu jalannya tidak pernah menyentuh data Anda), memotong waktu tempuh dan menyembunyikan log. Di prompt Anda sendiri, Anda hanya mengetik kata-katanya, seperti `cd Duplex`. Di bawahnya persis apa yang dicetak red1.

Bacalah sebagai peta. Baris versi menyebut berapa banyak kata kerja pintu (bentuk panjang) dan kata pendek yang dimiliki red1. `help` menampilkan kata-kata pendek dalam tiga kelompok; `help bim`, `help mis`, atau `help erp` menampilkan satu kelompok:

| Kelompok | Untuk apa | Mulai dengan |
|---|---|---|
| **bim** | bangunan dan model: hitung, tabrakan, biaya, jadwal, Modeller | `cd Duplex` |
| **mis** | rekaman, tabel, berkas, dan buku kerja Ninja: daftar, buat, ubah, muat | `cd Order` |
| **erp** | dokumen dan proses: selesaikan, batalkan, tutup, jalankan proses, posting bangunan ke pesanannya | `cd Order` |

<!-- run: red1_help -->
```text
$ node common/door/red1.js help 2>/dev/null
red1: type a short word; red1 prints the full line it runs (→ …), then runs it.
  bim   buildings and models            start with: cd Duplex   (16 words)
  mis   records, tables, files, Ninja   start with: cd Order   (11 words)
  erp   documents and processes         start with: cd Order   (8 words)
  everywhere: cd <place> · #<number> · pwd · role <id> · login <user> · history [N] · report · exit
Type bim, mis or erp for its words · help <word> for one word (level student first for the full explanation) · help verbs for the full door lines.
```

Satu kelompok mendaftar kata-katanya, masing-masing dengan contoh yang bisa Anda ketik. `erp` yang paling pendek:

<!-- run: red1_help_erp -->
```text
$ node common/door/red1.js 'help erp' 2>/dev/null
erp: documents and processes (start with: cd Order)
 in a building:
  post discipline=ARC  post the building's priced selection to its ERP Project Order
  vo discipline=ARC    issue the change between the model and the Project Order as a Variation Order
 in an ERP kind:
  status                                              a Project's earned value (PV, EV, AC, SPI, CPI per phase)
  claim                                               bill the project's completed phases not yet billed
  do CO 50000                                         a document action
  run "Set Project Type" 990000 C_ProjectType_ID=103  run a process of the dictionary
  next 50000                                          what a document may do next
  ask "How do I close a Sales Order?"                 ask the help a question, in your language
```

Nama kelompok yang diketik sendiri (`bim`, `mis`, atau `erp`) mencetak daftar yang sama dan membawa Anda masuk ke kelompok itu: prompt menjadi `red1 erp>`, dan bantuan, Tab, serta saran abu-abu hanya menawarkan kata-kata kelompok itu. Ini tidak pernah menghentikan sebuah baris berjalan: baris pintu yang lengkap tetap berjalan dari kelompok mana pun. `cd ..` mundur satu langkah (keluar dari sebuah tempat, lalu keluar dari kelompok), dan Shift+Tab melakukan hal yang sama (red1 mencetak `→ cd ..`, sehingga sesi terbaca sebagai teks).

`help` tidak mencetak kata kerja pintu, hanya kata-katanya. `help verbs` mendaftar setiap kata kerja pintu dengan baris lengkapnya. Untuk bantuan lebih lengkap tentang satu kata, pindah ke tingkat Student: `level student` dalam sesi, atau `--level student` pada satu baris, lalu `help <word>` menjelaskan apa yang dilakukan kata itu, apa yang Anda ketik, apa yang diambil red1 dari tempat Anda berada, dan sebuah contoh. Teksnya adalah deskripsi kata kerja itu sendiri, jadi tidak bisa menyimpang dari tabel di akhir:

<!-- run: red1_help_student cut=170 -->
```text
$ node common/door/red1.js --level student 'help cost' 2>/dev/null
cost: the cost of a selection: cost [phase|task|storey|discipline|class] [column=value …]
  in a building: cost discipline   → viewer.cost
    what it does: Price a selection of a building's elements as the Viewer's Find panel does: quantities from the model × the rate pack, grouped by 4D phase, task, storey…
    you type: by (phase (default), task, storey, discipline or class.)
    taken from where you are: building
    e.g. in Duplex: viewer.cost building=Duplex by=discipline
```

**Bantuan dalam bahasa Anda sendiri.** `ask "<question>"` mengajukan pertanyaan ke bantuan yang sama dengan kotak pertanyaan ERP di browser, dengan kata-kata biasa, dan berfungsi di sebuah jenis ERP (`cd Order`). Jawabannya menyebut jendela, proses atau laporan dari menu Anda bila ada yang cocok (seperti kotak di peramban), aksi dokumen dan status yang mengizinkannya, baris perintah yang menjalankannya, dan bagian panduan. Dibaca dari kamus dan paket bahasa iDempiere yang diterbitkan; tidak ada AI di dalamnya, dan ia hanya membaca. Bahasanya adalah yang Anda pilih dengan `lang=zh_CN`, jika tidak preferensi tersimpan Anda saat Anda masuk (`login`), jika tidak `LANG` terminal Anda, jika tidak bahasa sistem. Teks yang tidak dicakup paket tetap dalam bahasa Inggris, seperti di legacy (deskripsi aksi di bawah). Di sini terminalnya berbahasa Tionghoa:

<!-- run: red1_ask_zh -->
```text
$ printf 'cd Order\nask "如何关闭销售订单？"\n' | LANG=zh_CN.UTF-8 node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
→ erp.ask question=如何关闭销售订单？
ok · erp.ask
窗口: 销售订单
进程: 由费用产生销售订单
文档动作: 结束 — Finally close this transaction. It cannot be re-activated.
  单据处于以下状态时可用: 完成, 等候付款
CLI: erp.close kind=Order number=<Document No>
指南: 1 · 销售订单 https://red1oon.github.io/BIMCompiler/ERPUserGuide/#1-sales-order

从菜单（⌂ → 销售）打开销售订单，建一两行，然后按处理按钮（§6）→ 完成。完成不只是改变状态：completeIt 会在同一个已签名的操作组里，接着生成后面的出货单和发票。
(由构建会话翻译，未经母语者审校)
```

ERP di browser memiliki bantuan yang sama di setiap field, langkah How To, dan kotak pertanyaan, dalam bahasa yang Anda pilih di kepalanya: lihat [Help on every field, and a question box](ERPUserGuide.md#help-on-every-field-and-a-question-box-live) di Panduan Pengguna ERP.

Sekarang satu kata. `cd` menyatakan di mana Anda berada, jadi Anda tidak mengulanginya. Setelah `cd Duplex` dan `cd Element`, sebuah `count` hanya butuh satu hal yang baru. Baris `→` adalah yang dikirim red1 ke pintu; baris itu adalah bentuk panjang dari kata tersebut:

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Teks abu-abu muncul setelah kursor saat Anda mengetik kata, tempat, atau kolom: sebuah saran dari kamus. **Tab** atau **→** menerimanya; **Return selalu menjalankan apa yang Anda ketik**, tidak pernah sarannya. Salah eja mendapat petunjuk, tidak pernah perbaikan diam-diam (`ls Valu=…` ditolak dan menyebut `Value`).

## Kata yang paling sering Anda pakai

Setiap bagian di bawah mengatakan apa yang akan Anda lakukan dan mengapa, lalu menunjukkan satu jalannya nyata dan apa yang perlu dilihat di dalamnya.

### bim: bangunan dan model

**Menghitung, menurut sebuah kolom.** `cd Duplex` lalu `cd Element` pergi ke elemen bangunan; `group storey` menghitungnya menurut sebuah kolom. Perhatikan kelompok dan jumlahnya, serta baris `→` yang menunjukkan kata kerja pintu di balik kata-kata itu:

<!-- run: red1_group -->
```text
$ printf 'cd Duplex\ncd Element\ngroup storey\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ object.describe building=Duplex kind=Element
Duplex/Element: 9 properties; ls shows elements_meta_uu, guid, ifc_class, element_name
→ object.group building=Duplex kind=Element by=storey
ok · object.group
5 groups over 1193 Element
storey   count
Unknown  1026
Level 2  83
Level 1  62
T/FDN    14
Roof     8
```

**Mencari, dengan karakter pengganti.** `ls` mendaftar apa yang ada di sini; tambahkan `column=value` untuk menyempitkan. `*` adalah rangkaian karakter apa pun, `?` satu karakter, `[abc]` salah satunya; huruf besar tidak berpengaruh. Perhatikan `shown 6 of 6`: red1 menyebut berapa baris yang cocok dan berapa yang ditampilkan.

<!-- run: red1_find -->
```text
$ printf 'cd Duplex\ncd Element\nls element_name=*bath*\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ object.describe building=Duplex kind=Element
Duplex/Element: 9 properties; ls shows elements_meta_uu, guid, ifc_class, element_name
→ object.list building=Duplex kind=Element columns=elements_meta_uu,guid,ifc_class,element_name limit=20 element_name=*bath*
ok · object.list
shown 6 of 6 Element
elements_meta_uu        guid                    ifc_class        element_name
0BTBFw6f90Nfh9rP1dlXre  0BTBFw6f90Nfh9rP1dlXre  IfcSpace         Bathroom 2
0BTBFw6f90Nfh9rP1dlXru  0BTBFw6f90Nfh9rP1dlXru  IfcSpace         Bathroom 1
0BTBFw6f90Nfh9rP1dl_3C  0BTBFw6f90Nfh9rP1dl_3C  IfcSpace         Bathroom 2
0BTBFw6f90Nfh9rP1dl_3P  0BTBFw6f90Nfh9rP1dl_3P  IfcSpace         Bathroom 1
1YLPoi73z0fvdanmaXQreg  1YLPoi73z0fvdanmaXQreg  IfcFlowTerminal  M_Bath Tub:1525 mmx760 mm - Private:1525 mmx760 mm - Private:582924
2h405XijT83A$BX7w5ki4b  2h405XijT83A$BX7w5ki4b  IfcFlowTerminal  M_Bath Tub:1525 mmx760 mm - Private:1525 mmx760 mm - Private:582931
```

**Tabrakan.** `clash ARC MEP` meminta Viewer untuk tumpang tindih antara dua disiplin dan menggambar angka jawabannya sendiri sebagai corong. Diketik sendiri, `clash` membuka menu disiplin bangunan. `ls` kemudian mendaftar 393 baris dari jawaban yang sama, tanpa bertanya lagi. Perhatikan bagaimana bagian-bagiannya berjumlah: 393 = 291 + 102.

<!-- run: red1_clash -->
```text
$ printf 'cd Duplex\nclash ARC MEP\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ viewer.clashes building=Duplex discA=ARC discB=MEP rows=all
ok · viewer.clashes
393 box overlaps  ARC x MEP  (at 25 mm)
├─ 291 clash at mesh level
│    └─ 156 of them one inside the other
├─ 102 cleared by the shape tests
│    ├─  76 turned boxes do not touch
│    └─  26 triangles do not touch
└─   0 not judged
ls lists the 393 rows
```

**Biaya.** `cost discipline` memberi harga elemen bangunan seperti panel Find di Viewer: kuantitas dari model dikali paket tarif. Jalannya ada di [Dari bangunan ke ordernya](#from-a-building-to-its-order-cost-the-offer-post), tempat ia berlanjut ke order.

### mis: rekaman, tabel, berkas

**Mencari rekaman.** Dalam jenis ERP seperti `Business Partner`, kata-kata yang sama bekerja seperti di bangunan: `ls`, `count`, `cat`, dengan karakter pengganti yang sama. `cd` menerima nama sebuah jenis, diberi tanda kutip bila mengandung spasi.

**Membuat satu dan mengubah satu.** `new` membuat rekaman seperti yang dilakukan jendela: Anda memberi kolom yang Anda tahu, mesin mengisi sisanya (nilai bawaan, nomor urut), dan kolom yang tidak ada di kamus ditolak dengan daftar kolom yang sebenarnya. `set <id> Column=value` mengubah satu. Perhatikan `id` dalam jawaban `new`, yang dipakai `set` berikutnya, `changed` dalam jawaban kedua, dan daftar di akhir. (Sebuah jawaban juga mendaftar setiap kolom yang diisi dan perubahan yang dibuat; baris-baris itu dihilangkan di sini.)

<!-- run: mis_edit -->
```text
$ printf 'cd "Business Partner"\nnew Value=GD100 Name="Guide Partner One"\nset 1600010 Description="first supplier"\nls Value=GD*\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis2.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|ok|refused|id|changed|shown|C_BPartner_ID|[0-9]{7} )'
→ mis.describe kind="Business Partner"
→ mis.new kind="Business Partner" Value=GD100 Name="Guide Partner One"
ok · mis.new
id: 1600010
→ mis.update kind="Business Partner" id=1600010 Description="first supplier"
ok · mis.update
id: 1600010
changed: ["description"]
→ mis.list kind="Business Partner" columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID limit=20 names=Y Value=GD*
ok · mis.list
shown 1 of 1 Business Partner
C_BPartner_ID  Value  Name               Logo_ID  C_BP_Group_ID
1600010        GD100  Guide Partner One           Standard Customers
```

`rm <id>` menghapus satu, dan `load <file.csv>` serta `diff <file.csv>` memuat baris dari berkas dan membandingkan berkas dengan rekaman. [Referensi](FastScriptReference.md) menunjukkan masing-masing dengan keluarannya.

### erp: dokumen dan proses

**Membuat dokumen dan menyelesaikannya.** `new` di `Order` membuat order draf dan mencetak nomornya. Satu baris pintu lengkap juga berjalan di prompt, jadi baris order ditambahkan dengan `mis.new` (satu produk dan satu kuantitas). `next <number>` menggambar apa yang boleh dilakukan dokumen sekarang, dan menunjuk setiap aksi yang punya kata ke baris yang menjalankannya. `do CO <number>` menyelesaikannya; kode DocAction legacy adalah `CO` selesaikan, `PR` siapkan, `VO` batalkan, `CL` tutup, `RC` balikkan, `RE` aktifkan kembali (`do complete`, `do void` … juga berjalan). Lihat nomor yang dicetak `new`, status di setiap pohon `next`, dan aksi yang berubah setelah `CO`. (`grep` hanya menyisakan baris-baris itu; jawaban lengkapnya juga mendaftar setiap kolom yang diisi.)

<!-- run: erp_order -->
```text
$ printf 'cd Order\nnew issotrx=Y C_DocTypeTarget_ID=132 C_BPartner_ID=112 SalesRep_ID=101\nmis.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2\nnext 50000\ndo CO 50000\nnext 50000\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_erp.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|ok|refused|number|Order [0-9]|[├└])'
→ mis.describe kind=Order
→ mis.new kind=Order issotrx=Y C_DocTypeTarget_ID=132 C_BPartner_ID=112 SalesRep_ID=101
ok · mis.new
number: 50000
→ mis.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2
ok · mis.new
→ erp.actions kind=Order number=50000
ok · erp.actions
Order 50000  status DR
├─ CO  → do complete 50000
├─ PR  → do prepare 50000
└─ VO  → do void 50000
→ erp.complete kind=Order number=50000
ok · erp.complete
→ erp.actions kind=Order number=50000
ok · erp.actions
Order 50000  status CO
├─ CL  → do close 50000
├─ VO  → do void 50000
└─ RE  → do reactivate 50000
```

**Menjalankan proses.** `run "<process>"` menjalankan satu proses dari kamus ERP, seperti tombol jendelanya. Parameter yang tidak Anda ketik ditanyakan satu per satu, menurut urutan baris parameter proses itu sendiri (Return mempertahankan nilai bawaan; pencarian membuka daftar pilihan yang dipersempit oleh aturan validasi kolom; `(leave it out)` melewati yang opsional). Lalu red1 mencetak baris lengkap `→ erp.process …` dan menjalankannya. Ringkasannya menyebut dokumen yang dibuat dan log proses, seperti dialog proses lama. Di sini proyeknya diketik dan tiga pertanyaan lain dijawab dengan Return. (Di terminal setiap pertanyaan menggambar daftar pilihannya; `grep` hanya menyimpan pertanyaan dan jawaban.) Perhatikan jawaban yang jujur: proyek Hospital pada data awal tidak punya harga pemasok, jadi **tidak ada pesanan pembelian yang dibuat**, dan log menyebut alasannya untuk setiap baris:

<!-- run: erp_po -->
```text
$ printf 'cd Project\nrun "Generate PO from Project" C_Project_ID=990000\n\n\n\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_erp2.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|run:|C_|Consolidate|ok|refused|Generate|  Product)'
→ mis.describe kind=Project
→ mis.list kind=AD_Process_Para columns=ColumnName,Name,IsMandatory,DefaultValue,SeqNo,AD_Reference_ID sort=SeqNo limit=50 master="Process/Generate PO from Project"
→ mis.lookup column=C_ProjectPhase_ID process="Generate PO from Project" limit=50 C_Project_ID=990000
run: pick Project Phase (C_ProjectPhase_ID, 7)
C_ProjectPhase_ID: left out
→ mis.lookup column=C_ProjectLine_ID process="Generate PO from Project" limit=50 C_Project_ID=990000
run: pick Project Line (C_ProjectLine_ID, 28)
C_ProjectLine_ID: left out
Consolidate to one Document (ConsolidateDocument)? [Y]
→ erp.process name="Generate PO from Project" kind=Project C_Project_ID=990000 ConsolidateDocument=Y
ok · erp.process
Generate PO from Project: done · no document made
  Product has no PO record  (×28)
```

Pada baris tunggal, atau untuk AI, tidak ada yang ditanyakan: parameter wajib yang hilang adalah penolakan yang menyebutnya. Proses yang belum punya port di kembaran ditolak dengan menyebut nama kelasnya, dan red1 mengatakannya.

**Menu, dan rekaman sebagai tempat.** `menu` menampilkan menu ERP sebagai tempat: `cd <folder>` masuk (awal namanya cukup bila hanya satu entri yang diawali begitu), entri jendela membawa Anda ke jenisnya, dan `cd ..` (atau Shift+Tab) naik satu folder. Prompt menunjukkan jalurnya. Setiap entri ditandai: ▸ folder (berapa entri isinya), W jendela (dan tabelnya), P proses, R laporan, X formulir, F alur kerja. `red1 menu` sendiri tetap membuka menu di layar penuh.

<!-- run: red1_menu_walk -->
```text
$ printf 'menu\ncd Quote\ncd "Sales Orders"\ncd "Sales Order"\npwd\n' | node common/door/red1.js 2>/dev/null
→ mis.menu
menu: 15 entries; cd <name> goes in, cd .. goes back
  ▸ System Admin (6)
  ▸ Application Dictionary (40)
  ▸ Partner Relations (7)
  ▸ Quote-to-Invoice (Sales) (6)
  ▸ Requisition-to-Invoice (Purchasing) (16)
  ▸ Returns (5)
  ▸ Open Items (Financial Movements and Aging) (32)
  ▸ Material Management and Pricing (22)
  ▸ Project Management (14)
  ▸ Performance Analysis and Accounting (17)
  ▸ Assets (6)
  ▸ Manufacturing (10)
  ▸ Maintenance Request (3)
  W Cost Center · C_CostCenter
  W Department · C_Department
Quote-to-Invoice (Sales): 6 entries; cd <name> goes in, cd .. goes back
  ▸ Sales and Marketing (9)
  ▸ Sales Orders (13)
  ▸ Shipments (7)
  ▸ Sales Invoices (5)
  ▸ Invoice Inquiry (13)
  ▸ Sales Management (6)
Quote-to-Invoice (Sales)/Sales Orders: 13 entries; cd <name> goes in, cd .. goes back
  W Sales Order · C_Order
  R Order Detail
  R Open Orders
  R Order Transactions
  P Quote convert
  P RePrice Order/Invoice
  P Generate PO from Sales Order
  P Reopen Order
  P Order Batch Process
  W POS Key Layout · C_POSKeyLayout
  P POS Key Generate
  W POS Terminal · C_POS
  W POS Payment · C_POSPayment
→ mis.describe kind=C_Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
menu="Quote-to-Invoice (Sales)/Sales Orders" kind=Order
```

Di dalam satu jenis, `cd <number>` masuk ke rekaman itu dan prompt tetap memegang jalur menu; `cd ..` keluar lagi (dari mana pun, `cd Order 100` melakukan hal yang sama). Di dalam rekaman, apa yang ditawarkan red1 adalah milik rekaman itu, dibaca dari kamus untuk jendelanya: setelah `do`, hanya aksi yang boleh dilakukannya sekarang, untuk peran Anda, dalam urutan tombol jendela itu sendiri; setelah `cd`, tab-tabnya; setelah `run`, tombol prosesnya sendiri (`run Co` dilengkapi menjadi `"Copy Lines"`); dan field-fieldnya sebagai kunci `Column=`. `do` dan `next` menyebut rekaman dengan id-nya, jadi nomor yang dipakai bersama dua rekaman (di sini 80000) tidak pernah jadi masalah. Satu aksi mencetak apa yang dilakukannya: perubahan status, dokumen yang disentuhnya, berapa perubahan yang disimpan, dan apa yang boleh dilakukan rekaman sekarang; Tab setelah `do ` lalu menawarkan kode-kode baru itu. Daftar folder dihilangkan dari blok di bawah:

<!-- run: red1_walk_record -->
```text
$ rm -f /tmp/fast_guide_walkrec.ops; printf 'menu\ncd Quote\ncd "Sales Orders"\ncd "Sales Order"\ncd 100\npwd\ndo RE\ndo CO\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_walkrec.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_walkrec.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -vE '^  [▸WRPXF] '
→ mis.menu
menu: 15 entries; cd <name> goes in, cd .. goes back
Quote-to-Invoice (Sales): 6 entries; cd <name> goes in, cd .. goes back
Quote-to-Invoice (Sales)/Sales Orders: 13 entries; cd <name> goes in, cd .. goes back
→ mis.describe kind=C_Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
→ mis.read kind=Order id=100
Order 80000: 4 tabs (Order Line, Order Tax, Payment Schedule, POS Payment); ls shows them, cd <tab> opens one, cat reads the record
→ erp.actions kind=Order id=100
it may do: CL, VO, RE (do <code>; next shows the tree)
menu="Quote-to-Invoice (Sales)/Sales Orders" kind=Order id=100
→ erp.reactivate kind=Order id=100
ok · erp.reactivate
Re-activate: done · Order 80000 CO → IP (In Progress) · grand total 50.35
  related: Invoice 2 (RE 2) · Shipment/Receipt 2 (RE 2)
86 change(s) kept · it may do: CO, PR, VO
→ erp.complete kind=Order id=100
ok · erp.complete
Complete: done · Order 80000 IP → CO (Completed) · grand total 50.35
  related: Invoice 3 (RE 2, CO 1) · Shipment/Receipt 3 (RE 2, CO 1)
59 change(s) kept · it may do: CL, VO, RE
```

**`#` menemukan dokumen dari nomornya.** `#80000` adalah Pencarian Dokumen iDempiere (kotak Pencarian Globalnya memakai `/80000`; di sini `/` adalah jalur, jadi dipakai `#`). Ini bekerja dari tempat mana pun. Nomor dicocokkan sebagai awalan, di klien login Anda, dan hanya di jendela yang boleh dibuka peran Anda. Satu dokumen yang ditemukan langsung dibuka. Bila ditemukan beberapa, masing-masing didaftar di bawah jendelanya dengan baris yang membukanya, sehingga order penjualan dan order pembelian tidak pernah tertukar. Kode di depan memilih pencarian lain: `#O 80000` order, `#BP Joe` mitra bisnis. `@` dicadangkan. Di bash, beri tanda kutip pada baris itu: di sana `#` memulai komentar.

<!-- run: red1_hash -->
```text
$ rm -f /tmp/fast_guide_hash.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_hash.ops node common/door/red1.js '#80000' 2>&1 | grep -v '^§'
→ erp.search text=80000
#80000: 4 documents in 2 window(s); none is opened, enter one with its line:
  Sales Order window (Order, Order Search):
    Order 80000  →  cd Order 100
  Purchase Order window (Order, Order Search):
    Order 800000  →  cd Order 104
    Order 800001  →  cd Order 105
    Order 800002  →  cd Order 106
```

**Melaporkan celah.** Beberapa jawaban menyatakan bahwa red1 kekurangan sesuatu, bukan Anda yang salah ketik. Mesin menandainya, dan dalam sesi red1 mencetak satu baris setelah jawaban. Salah ketik atau penolakan lama bukan celah dan tidak mencetak tambahan. `report` lalu menampilkan draf (barisnya, alasannya, versi red1, platform, baris log terakhir, jalur Anda disamarkan) dan menawarkan isu GitHub atau email; red1 tidak mengirim apa pun sendiri, peramban atau program surel Anda yang mengirim:

<!-- run: red1_gap -->
```text
$ printf 'cd Project\nrun "Renumber"\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Project
Project: 48 properties; ls shows C_Project_ID, Value, Name, Processed, SalesRep_ID
→ mis.list kind=AD_Process_Para columns=ColumnName,Name,IsMandatory,DefaultValue,SeqNo,AD_Reference_ID sort=SeqNo limit=50 master=Process/Renumber
run: Renumber has no parameter to ask (none in the dictionary)
→ erp.process name=Renumber kind=Project
refused · erp.process · Renumber was not run: it has no JS port yet (class org.compiere.process.DiscountSchemaReSeq)
This is a gap in red1, not your mistake. Type report to send it to us (email or GitHub issue).
```

### Dari bangunan ke pesanannya: biaya, tawaran, posting {#from-a-building-to-its-order-cost-the-offer-post}

Inilah rantai yang membawa sebuah bangunan ke Order Proyek ERP-nya. `cost discipline` mencetak kelompoknya dulu, lalu jumlah dan totalnya; `ls` mendaftar baris yang sudah diberi harga, dan biaya juga bisa dikelompokkan menurut `phase`, `task`, `storey` atau `class`. Karena bangunan belum punya order ERP, ia berakhir dengan tawaran, `Ready to post to ERP Project Order? y/N`, diikuti baris persis yang akan dijalankannya. Tawaran itu adalah langkah berikutnya milik mesin sendiri, tidak pernah diketik dengan tangan. Dalam sesi, `y` menjalankan tepat baris itu, dan `n` atau Return kosong tidak menjalankan apa pun; dalam baris sekali jalan atau untuk AI tidak ada yang ditanyakan dan barisnya ada di `next` jawaban. Menjawab `y` sama dengan `post`: ia melipat pilihan berharga bangunan ke dalam Order Proyek, dengan fase dan tugasnya diambil dari program 4D bangunan dan baris proyek, sebagai satu kelompok perubahan atau tidak sama sekali. Lihat apa yang dibuat, dan tawaran kedua, yaitu `cd project`:

<!-- run: chain_post -->
```text
$ rm -f /tmp/fast_guide_chain.ops; printf 'cd Duplex\ncost discipline\ny\nn\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_chain.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_chain.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ viewer.cost building=Duplex by=discipline
ok · viewer.cost
1190 elements · 1054482.08 total (71 with no rate); 3 with no size, not priced
discipline  elements  cost
ARC         267       532431.14
ELEC        81        283500.00
MEP         809       153825.40
PLB         14        49000.00
STR         19        35725.55
ls lists the 49 priced rows
Ready to post to ERP Project Order? y/N → erp.process name="Fold from BIM" Building=Duplex
→ erp.process name="Fold from BIM" Building=Duplex
ok · erp.process
Posted Duplex: Project 990001, PlannedAmt 1054482.08284, 81 change(s) · no document made
81 change(s) kept: create:c_project 1, create:c_projectphase 8, create:c_projecttask 19, create:c_projectline 43, create:m_product 7, create:m_product_category 1, create:m_product_category_acct 2
Open the project? y/N → cd project
not done: cd project
```

Jumlah yang diposting, 1054482.08284, adalah aturan baris milik pesanan (harga kali kuantitas, tidak dibulatkan). `cost` menghitung dengan baris yang sama dan menampilkan angkanya sampai sen mata uang pesanan (1054482.08), jadi yang Anda lihat sebelum `post` adalah isi pesanan. Kata `post` melakukan hal yang sama tanpa `cost` sebelumnya dan bertanya `run it? y/N` terlebih dahulu; memposting bangunan yang sudah ada di pesanannya tidak mengubah apa pun. Dari proyek baru, `run "Generate PO from Project"` adalah sisi pembelian dan menjawab seperti proyek Hospital di atas: produk yang dibuat oleh posting tidak punya harga pemasok. Langkah-langkah itu, dengan keluarannya, ada di [referensi](FastScriptReference.md).

## Semua kata

Kata-kata di atas adalah yang perlu dipelajari lebih dulu. Sisanya, masing-masing bentuk pendek dari sebuah kata kerja pintu (`help <word>` menunjukkan barisnya):

| Kata | Fungsinya |
|---|---|
| `pwd` · `cd ..` · `history` · `!!` · `!3` · `role <id>` · `login <user>` | di mana Anda berada; kembali; baris yang diketik (juga dari sesi sebelumnya, bernomor); jalankan lagi baris terakhir; jalankan baris 3; bertindak sebagai sebuah peran; menyatakan siapa Anda (hanya diminta di klien dengan lebih dari satu pengguna ber-email; rekaman baru membawa pengguna Anda) |
| `sum <column>` · `cat <id>` · `rm <id>` | menjumlahkan kolom; menampilkan satu rekaman; menghapus satu |
| `ninja <file>` · `load <file.csv>` · `diff <file.csv>` | menyiapkan buku kerja Ninja atau CSV; memuat baris dari berkas; membandingkan berkas dengan rekaman |
| `bim` · `mis` · `erp` | masuk ke sebuah kelompok: bantuan, Tab, dan saran hanya menawarkan kata-katanya (`cd ..` atau Shift+Tab keluar) |
| `menu` | menu ERP, dijelajahi seperti folder dengan `cd`; `red1 menu` membukanya di satu layar penuh |
| `cd Project 990000` · `cd 100` · `ls` · `cd Phase` | memasuki rekaman sebagai tempat (`cd <number>` di dalam jenisnya, juga dari penelusuran menu): `ls` mendaftar tab-nya beserta jumlah rekaman, `cd <tab>` membuka satu, `cd ..` naik kembali |
| `status` | dalam sebuah proyek: nilai hasil (earned value)-nya (PV, EV, AC, SPI, dan CPI per fase) |
| `vo` | dalam sebuah bangunan: perubahan antara model dan Project Order-nya, diterbitkan sebagai Variation Order (bertanya y/N; setujui dengan `do CO <number>`) |
| `claim` | dalam sebuah proyek: menagih fase yang sudah selesai dan belum ditagih, sebuah draf faktur dan pratinjau akuntansinya (bertanya y/N) |
| `grid` · `walk FP` · `day 5` · `compare 24` | garis grid bangunan; menelusuri sebuah disiplin; jadwal pada suatu hari; dua hari dibandingkan |
| `open marked` · `bay high` · `undo` · `save shed.db` · `close` | Modeller yang dibiarkan terbuka di antara baris |
| `help <word>` · `help verbs` · `level student` · `report` · `exit` | bantuan; setiap kata kerja pintu; bantuan lebih lengkap; celah ke pemilik; keluar |

## Yang tidak diperiksa {#what-is-not-checked}

Sebuah jawaban mendaftar apa yang tidak tercakup oleh pemeriksaannya. Kata-kata yang sama berlaku untuk setiap jawaban: tumpang tindih pertama-tama adalah kotak pembatas, pemeriksaan hanya mencakup apa yang bergerak, dan **daya dukung beban tidak pernah diperiksa**. Jawaban tanpa merah tidak pernah berarti aman. Daftar lengkap untuk laporan edit Modeller ada di [referensi](FastScriptReference.md#what-is-not-checked).

## Pemecahan masalah

| Yang Anda lihat | Yang harus dilakukan |
|---|---|
| `edit_cli is not at …` | Salah satu dari keenam berkas hilang. Pesannya mencetak baris `curl` |
| `puppeteer not found` | Jalankan `npm install puppeteer@24` di folder yang sama |
| `unknown verb` | Pesannya mendaftar setiap verb. Periksa ejaannya terhadap [tabel](#the-verbs) |
| `missing input: …` | Verb memerlukan kunci itu. Tabel mendaftar input-nya |
| `The Viewer tools need a bim-ootb checkout` | Jalankan sebagai `node common/door/door.js` dari checkout lengkap |
| `exit 1` dengan pesan Chrome | Pustaka sistem Chrome tidak ada di Linux. Halaman pemecahan masalah Puppeteer mendaftarkannya |

**Batas yang perlu direncanakan.** Setiap panggilan Modeller membuka seluruh bangunan: sekitar 10 sampai 40 detik pada HospitalGarage. Ini alat ukur, bukan layanan dengan jaminan uptime. Skrip dengan beberapa baris Modeller membuka bangunan satu kali per baris. **Apa yang Anda buat di `red1>` untuk sementara tetap di log perubahan milik red1 sendiri:** order yang dibuat di prompt tidak tampil di jendela ERP peramban, dan order yang dibuat di jendela tidak terlihat di prompt. Menyatukan keduanya adalah langkah berikutnya.


## Untuk pengembang

**Baris pintu.** Setiap kata menjadi satu baris pintu, `app.verb key=value key=value`, dan red1 mencetaknya setelah `→`. Anda bisa mengetik baris pintu langsung di prompt, atau sekali jalan: `red1 'object.count building=Duplex kind=Element'` mencetak jawabannya, dan `--json` mencetak seluruh amplopnya. Beberapa kata dalam satu baris tunggal dipisahkan dengan `;` (`red1 'cd Duplex; count'`); `red1 -f FILE` menjalankan berkas berisi baris, baris yang diawali `--` adalah komentar, dan `--dry` mencobanya lebih dulu. Pintu memeriksa setiap baris terhadap daftar kata kerja yang tetap, memanggil kode aplikasi itu sendiri, dan mengembalikan jawaban beserta apa yang tidak diperiksa. Baris yang tidak cocok dengan kata kerja mana pun tidak pernah ditebak; ia kembali sebagai pertanyaan.

![Satu pintu. Para aktor di kiri berbicara dengan kata kerja yang sama; pintu mengurai, memeriksa, mengikat, memanggil, dan menjawab; pemeriksaan milik aplikasi yang menentukan.](figs/one_door.svg)

Bacalah gambar dari kiri ke kanan: **aktor** (seseorang di terminal, atau AI lewat sambungan alat); **saluran**, satu daftar kata kerja, masing-masing dengan deskripsi sederhana, masukannya, dan kelas *bahaya*; **pintu**, yang mengurai, memeriksa, mengikat baris ke penanya, memanggil, dan menjawab; **aplikasi**, yang pemeriksaannya sendiri menentukan, dan perubahan yang menambah masalah baru dibatalkan beserta alasannya. Cara menyambungkan AI ada di [Panduan Pengusul AI](ProposerGuide.md#connect-your-ai).

Setiap verb memiliki **kelas bahaya** (harm class): `read` (tidak mengubah apa pun), `trial` (perubahan yang dibuat pada salinan sekali pakai, dinilai, tidak pernah disimpan), `writes`, `posts`, atau `sends`. Kelas itu ditulis sekali, di daftar verb, sehingga tidak ada aktor yang bisa berkelit darinya dengan kata-kata. Orang di terminal dipercaya untuk setiap kelas; AI hanya untuk `read` dan `trial`, jadi baris `writes` atau `posts` dari AI ditahan sebagai klaim yang dikonfirmasi oleh seseorang ([referensi](FastScriptReference.md) menunjukkan satu).

**Dari JavaScript**, kata kerja yang sama adalah satu objek, dibangkitkan dari kosakata (kata kerja baru tidak butuh kode baru):

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Batas.** Kata-kata objek (`cd Element`, `ls`, `group`) memerlukan model yang membawa kamus objek; dari bangunan-bangunan di sini, hanya Duplex yang memilikinya. Daftar yang lebih tinggi dari terminal berhenti di setiap halaman (Space, q); sebuah pipe mendapat setiap baris.

**Referensi.** Setiap perintah dengan keluaran nyatanya, cerita Modeller (bentang 13 m ditolak dengan alasan asli aplikasi), skrip dengan hasil bernama, buku kerja Ninja, terminal MIS, perbandingan dengan sistem lama, dan alur klaim serta konfirmasi ada di [Referensi Fast Script](FastScriptReference.md).

## Daftar verb {#the-verbs}

Tabel ini **dihasilkan dari berkas kosakata** (`common/door/verbs.json`) dan sebuah pengujian memeriksa bahwa keduanya cocok, verb demi verb. Ini adalah daftar yang sama yang menjadi dasar menu alat milik AI. *Harm* (bahaya) dijelaskan di atas; *Needs* (kebutuhan) menyatakan mana dari kedua unduhan itu yang menjalankan verb.

<!-- GEN:verbs -->
| Verb | Fungsinya | Input | Bahaya | Siapa yang boleh memakainya | Memerlukan |
|---|---|---|---|---|---|
| `modeller.lines` | Membaca grid | `building` | read | human, ai | unduhan 6 berkas |
| `modeller.try_shift` | Mencoba menggeser sebuah garis grid | `building`, `line`, `move` (meter) | trial | human, ai | unduhan 6 berkas |
| `viewer.counts` | Menghitung elemen | `building`, `by` (opsional) | read | human, ai | 6 berkas + 2 berkas Viewer |
| `viewer.clashes` | Mendaftar clash antara dua disiplin | `building`, `discA`, `discB`, `rows` (opsional) | read | human, ai | 6 berkas + 2 berkas Viewer |
| `viewer.film_path` | Visibilitas jalur film | `db`, `path` (opsional) | read | human, ai | checkout bim-ootb |
| `viewer.schedule_at` | Keadaan jadwal pada suatu hari | `building`, `day` (nomor hari) | read | human, ai | checkout bim-ootb |
| `viewer.schedule_compare` | Mesin jadwal terhadap acuannya | `building`, `shift_hours` (jam) (opsional) | read | human, ai | checkout bim-ootb |
| `modeller.widen_bay` | Melebarkan sebuah bay ke lebar sasaran | `building`, `from`, `to`, `target` (meter) | trial | human, ai | unduhan 6 berkas |
| `modeller.walk` | Apa yang akan ditempatkan walker | `building`, `discipline` | read | human, ai | checkout bim-ootb |
| `object.describe` | Menjelaskan satu jenis objek | `building`, `kind`, `uu` (opsional) | read | human, ai | checkout bim-ootb |
| `object.read` | Membaca sebuah objek | `building`, `kind`, `uu` | read | human, ai | checkout bim-ootb |
| `object.history` | Riwayat sebuah objek | `building`, `kind`, `uu` | read | human, ai | checkout bim-ootb |
| `object.update` | Mengubah satu properti sebuah objek | `building`, `kind`, `uu`, `column`, `value` | writes | human, ai | checkout bim-ootb |
| `object.attach` | Melampirkan berkas atau catatan ke sebuah objek | `building`, `kind`, `uu`, `file` (opsional), `text` (opsional) | writes | human, ai | checkout bim-ootb |
| `object.count` | Menghitung rekaman dari satu jenis | `building`, `kind`, filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `object.list` | Mendaftar rekaman dari satu jenis | `building`, `kind`, `columns` (opsional), `sort` (opsional), `limit` (opsional), `offset` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `object.sum` | Menjumlahkan sebuah kolom | `building`, `kind`, `column`, filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `object.group` | Menghitung menurut sebuah kolom | `building`, `kind`, `by`, filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `witness.run` | Menjalankan sebuah witness dan membaca putusannya | `name` | trial | human, ai | checkout bim-ootb |
| `witness.last` | Membaca jalannya witness yang terakhir tercatat | `name` | read | human, ai | checkout bim-ootb |
| `legacy.status` | Apakah tumpukan uji legacy hidup | tidak ada | read | human, ai | checkout bim-ootb |
| `legacy.query` | Membaca baris dari tabel legacy | `table`, `columns` (opsional), `sort` (opsional), `limit` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `mis.column` | Siapa yang mengisi sebuah kolom: kembaran dan legacy berdampingan | `kind`, `column` | read | human, ai | checkout bim-ootb |
| `legacy.compare` | Membandingkan satu rekaman pada kembaran dan pada legacy | `kind`, `number`, `legacy` (opsional) | read | human, ai | checkout bim-ootb |
| `idempiere.where` | Mencari sebuah nama dalam sumber iDempiere | `symbol`, `in` (opsional), `limit` (opsional) | read | human, ai | checkout bim-ootb |
| `mis.pack` | Membuat zip 2Pack dari buku kerja model data | `book`, `version`, `out` (opsional), `java` (opsional), `package` (opsional) | writes | human, ai | checkout bim-ootb |
| `legacy.up` | Menjalankan Postgres docker bersama untuk tumpukan uji legacy | tidak ada | writes | human, ai | checkout bim-ootb |
| `legacy.refresh` | Menyegarkan instance uji legacy dari seed dasar | tidak ada | writes | human, ai | checkout bim-ootb |
| `legacy.witness` | Menjalankan witness di dalam server pada instance uji legacy | tidak ada | trial | human, ai | checkout bim-ootb |
| `legacy.check` | Memeriksa baris sebuah buku kerja dalam basis data uji legacy | `book`, `version` (opsional) | read | human, ai | checkout bim-ootb |
| `legacy.plugin` | Memasang plugin model data pada instance uji legacy dan memeriksanya di sana | `book`, `version` | writes | human, ai | checkout bim-ootb |
| `model.open` | Membuka lembar 2D di Modeller | `sheets`, `type` (opsional), `file` (opsional) | trial | human, ai | checkout bim-ootb |
| `model.convert` | Mengonversi lembar yang terbuka menjadi model 3D | tidak ada | trial | human, ai | checkout bim-ootb |
| `model.addbay` | Menambah sebuah bay ke model | `end` | trial | human, ai | checkout bim-ootb |
| `model.undo` | Membatalkan perubahan model yang terakhir | tidak ada | trial | human, ai | checkout bim-ootb |
| `model.save` | Menyimpan model yang terbuka | `file` (opsional) | writes | human, ai | checkout bim-ootb |
| `model.close` | Menutup sesi Modeller | `discard` (opsional) | trial | human, ai | checkout bim-ootb |
| `erp.process` | Menjalankan sebuah proses dari kamus | `name`, `record` (opsional), `kind` (opsional), `dry` (opsional), `role` (opsional), filter `column=value` lainnya (opsional) | writes | human, ai | checkout bim-ootb |
| `erp.order_state` | Apa yang dipegang ERP untuk pilihan sebuah bangunan, dan apa yang sah berikutnya | `building`, filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `erp.project_status` | Status nilai hasil (earned value) sebuah proyek | `id` (opsional), `number` (opsional), `asof` (opsional) | read | human, ai | checkout bim-ootb |
| `erp.ask` | Mengajukan pertanyaan ke bantuan | `question`, `lang` (opsional), `role` (opsional) | read | human, ai | checkout bim-ootb |
| `mis.lookup` | Nilai yang sah untuk sebuah kolom atau parameter proses | `column`, `kind` (opsional), `process` (opsional), `id` (opsional), `limit` (opsional), `role` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `viewer.cost` | Biaya dari sebuah pilihan pada satu bangunan | `building`, `by` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `erp.find` | Mencari sebuah dokumen | `kind`, `number` | read | human, ai | checkout bim-ootb |
| `erp.search` | Mencari dokumen dari nomornya | `text`, `role` (opsional) | read | human, ai | checkout bim-ootb |
| `erp.actions` | Apa yang dapat dilakukan pada sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | read | human, ai | checkout bim-ootb |
| `erp.complete` | Menyelesaikan sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | posts | human, ai | checkout bim-ootb |
| `erp.void` | Membatalkan (void) sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | writes | human, ai | checkout bim-ootb |
| `erp.close` | Menutup sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | writes | human, ai | checkout bim-ootb |
| `erp.reverse` | Membalik - Mengoreksi sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | posts | human, ai | checkout bim-ootb |
| `erp.prepare` | Menyiapkan sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | writes | human, ai | checkout bim-ootb |
| `erp.reactivate` | Mengaktifkan kembali sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | writes | human, ai | checkout bim-ootb |
| `mis.describe` | Menjelaskan satu jenis rekaman ERP | `kind`, `role` (opsional) | read | human, ai | checkout bim-ootb |
| `mis.read` | Membaca sebuah rekaman ERP | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | read | human, ai | checkout bim-ootb |
| `mis.list` | Mendaftar rekaman | `kind`, `columns` (opsional), `sort` (opsional), `limit` (opsional), `offset` (opsional), `names` (opsional), `role` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `mis.sum` | Menjumlahkan sebuah kolom | `kind`, `column`, `role` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `mis.group` | Menghitung menurut sebuah kolom | `kind`, `by`, `role` (opsional), `window` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `mis.new` | Membuat sebuah rekaman | `kind`, `dry` (opsional), `role` (opsional), `window` (opsional), filter `column=value` lainnya (opsional) | writes | human, ai | checkout bim-ootb |
| `mis.update` | Mengubah sebuah rekaman | `kind`, `id` (opsional), `number` (opsional), `role` (opsional), `window` (opsional), filter `column=value` lainnya (opsional) | writes | human, ai | checkout bim-ootb |
| `mis.delete` | Menghapus sebuah rekaman | `kind`, `id` (opsional), `number` (opsional), `role` (opsional), `window` (opsional) | writes | human, ai | checkout bim-ootb |
| `mis.load` | Memuat rekaman dari sebuah CSV | `kind`, `file`, `dry` (opsional) | writes | human, ai | checkout bim-ootb |
| `mis.add_window` | Menambah sebuah jendela dari sebuah CSV | `file`, `table` (opsional), `workflow` (opsional), `dry` (opsional), `master` (opsional) | writes | human, ai | checkout bim-ootb |
| `ninja.exec` | Menjalankan sebuah buku kerja Ninja | `file`, `dry` (opsional), `data` (opsional), `table` (opsional) | writes | human, ai | checkout bim-ootb |
| `ninja.workflow` | Memberi sebuah tabel kolom dokumen | `table`, `dry` (opsional) | writes | human, ai | checkout bim-ootb |
| `mis.diff` | Membandingkan sebuah CSV dengan tabel | `kind`, `file`, `key` (opsional) | read | human, ai | checkout bim-ootb |
| `mis.menu` | Membaca menu | `role` (opsional), `find` (opsional) | read | human, ai | checkout bim-ootb |
| `ninja.rollback` | Membatalkan sebuah bundle Ninja | `bundle`, `dry` (opsional) | writes | human, ai | checkout bim-ootb |
| `ninja.export` | Menulis sebuah bundle Ninja kembali sebagai buku kerja | `bundle` (opsional), `window` (opsional), `table` (opsional), `file` | writes | human, ai | checkout bim-ootb |

Nama lama yang masih berjalan, masing-masing sama dengan verba yang ditunjuknya: `erp.column` → `mis.column` · `erp.compare` → `legacy.compare` · `erp.pack` → `mis.pack` · `erp.legacy_plugin` → `legacy.plugin` · `erp.describe` → `mis.describe` · `erp.read` → `mis.read` · `erp.list` → `mis.list` · `erp.sum` → `mis.sum` · `erp.group` → `mis.group` · `erp.new` → `mis.new`
<!-- /GEN:verbs -->

**Cakupan hari ini.** Daftarnya sengaja kecil: 68 verba mencakup penyuntingan grid Modeller, walker-nya dan Modeller yang tetap terbuka di antara baris, beberapa pertanyaan Viewer, jadwal, pembacaan, penghitungan dan penulisan objek generik, biaya suatu pilihan, verba dokumen ERP, dan setiap proses kamus ERP yang punya port. Viewer punya 64 aksi yang bisa ditekan orang, dan pintu menawarkan 6 verba Viewer. ERP punya 1158 dokumen dan proses, dan pintu menawarkan 13 verba ERP untuk siklus hidup dokumen dan 15 verba MIS yang bekerja pada tabel mana pun, serta menyimpan 10 nama lama agar baris-baris sebelumnya tetap berjalan (angka di baris versi sudah termasuk itu). Jadi ini sebuah awal, bukan seluruh menu.


## Bagaimana halaman ini tetap benar

Setiap perintah dalam blok abu-abu di halaman ini dan di [referensi](FastScriptReference.md) telah dijalankan, dan keluaran di bawahnya adalah apa yang dicetak perintah itu. Sebuah uji, **W-FAST-SCRIPT-GUIDE** di repositori `bim-ootb`, menjalankannya lagi dari unduhan dan checkout, memeriksa setiap angka di halaman ini terhadap hasil eksekusi, dan memeriksa bahwa tabel kata kerja sama dengan `verbs.json`. Jika sebuah angka di sini basi, uji itu gagal.

Terkait: [Panduan Pengusul AI](ProposerGuide.md) (menghubungkan AI ke pintu yang sama, dan apa yang dilakukan AI dengan pemeriksaannya), dan [Panduan Modeller](ModellerGuide.md).
