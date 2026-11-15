---
review: machine
source_sha: 276f5bede717d2ac
lang: id
---

# Panduan Pengguna Fast Script

**Berikan kepada aplikasi BIM dan ERP satu perintah pendek setiap kali, atau beberapa baris dalam sebuah berkas, lalu terima jawaban asli dari aplikasi itu. Baris yang sama berlaku untuk Anda di terminal dan untuk AI.**

Ini adalah panduan untuk **satu pintu**: sebuah mesin skrip kecil yang berdiri di depan aplikasi. Anda menulis baris seperti `modeller.lines building=HospitalGarage`. Pintu membacanya, memeriksanya terhadap daftar verb yang tetap, memanggil kode milik aplikasi itu sendiri, lalu mengembalikan jawabannya bersama hal-hal yang tidak diperiksa. Tidak ada AI di dalam pintu.

![Satu pintu. Para aktor di kiri memakai verb yang sama; pintu mengurai, memeriksa, mengikat, memanggil, dan membalas; pemeriksaan milik aplikasi yang memutuskan.](figs/one_door.svg)

Bacalah gambar dari kiri ke kanan.

1. **Aktor.** Siapa pun yang mengirim baris itu, dan cara baris itu sampai. Saat ini berupa AI melalui koneksi alat, atau seseorang di terminal. Kotak surat, ponsel, dan perangkat sudah direncanakan tetapi **belum dibuat**.
2. **Kanal: verb.** Satu daftar semua hal yang boleh diucapkan seorang aktor. Setiap verb memiliki deskripsi sederhana, inputnya, dan kelas *bahaya*. Anda akan menemukan seluruh daftarnya [di bawah](#the-verbs).
3. **Satu pintu: mesin skrip.** Ia mengurai baris, memeriksa input, mengikat baris itu pada siapa yang meminta, memanggil aplikasi, dan membalas. Setiap aktor melewati pintu yang sama, sehingga baris yang sama memberi jawaban yang sama.
4. **Mesin: aplikasi.** Pemeriksaan milik aplikasi yang memutuskan. Perubahan yang menambah masalah baru dibatalkan, dan alasannya dikembalikan.

!!! warning "Hal yang tidak dijamin oleh jawaban yang baik"
    Jawaban tanpa masalah **tidak pernah berarti aman, patuh, atau baik**. Setiap jawaban mencantumkan apa yang tidak diperiksa, dan [Apa yang tidak diperiksa](#what-is-not-checked) mencantumkannya sekali lagi. Seorang insinyur struktur memiliki keputusan akhir.

**Baru di sini, dengan AI?** Cara menghubungkan AI ke pintu ada di [Panduan Pengusul AI](ProposerGuide.md#connect-your-ai). Halaman ini untuk perintah dan skrip yang Anda tulis sendiri, dan untuk membaca apa yang dikembalikan.

## `red1` sekilas

`red1` adalah jalan masuk singkat: satu prompt untuk aplikasi BIM dan ERP. Setiap kata pendek mencetak baris pintu lengkap yang dijalankannya (setelah `→`), sehingga Anda mempelajari bentuk panjangnya sambil jalan. [Bagian red1 lengkap](#the-red1-shell-short-words-at-one-prompt) ada di dekat akhir halaman ini.

| Ketik | Fungsinya |
|---|---|
| `red1` | membuka prompt `red1>` (`node common/door/red1.js`, atau `red1` setelah `npm link` sekali) |
| `cd Duplex` · `cd Element` · `cd Order` · `cd ..` · `pwd` | pergi ke sebuah bangunan, ke satu jenis di dalamnya, atau ke satu jenis ERP; kembali; di mana Anda berada |
| `count` · `ls` · `group storey` · `sum <column>` · `cat <id>` | menghitung, mendaftar, mengelompokkan, menjumlahkan, menampilkan satu rekaman, di sini |
| `ls element_name=*bath*` | Cari dengan wildcard: `*` untuk sebarang rangkaian, `?` untuk satu karakter, `[abc]` untuk salah satunya |
| `clash ARC MEP` · lalu `ls` · `ls *Bath*` | clash digambar sebagai corong; baris-barisnya; baris yang cocok |
| `clash` | sebuah menu disiplin bangunan terbuka: tombol panah atau satu angka, lalu Return |
| `next <number>` · `do complete <number>` | apa yang boleh dilakukan sebuah dokumen sekarang; lakukanlah |
| `menu` · `help` · `help verbs` · `exit` | menu ERP; daftar kata; semua verb pintu; keluar |
| `red1 'cd Duplex; count'` | kata-kata yang sama dari sebuah skrip, sekali jalan |

## Dapatkan pintu

Anda memerlukan Node 18 atau yang lebih baru. Langkah-langkah ini dijalankan di Node 18.19.

**Verb Modeller memerlukan empat berkas.** Buat folder kosong, pasang mesin browser, lalu unduh berkas-berkasnya:

```bash
mkdir fastscript && cd fastscript
npm init -y
npm install puppeteer@24
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/bim_mcp.js
curl -O https://red1oon.github.io/bim-ootb/common/door/door.js
curl -O https://red1oon.github.io/bim-ootb/common/door/verbs.json
```

Simpan keempatnya di folder yang sama. `door.js` membaca daftar verb dari `verbs.json` dan menjalankan `edit_cli.js`, yang membuka halaman Modeller yang aktif tanpa jendela. Jika ada berkas yang hilang, pintu menyebutkan berkas mana dan mencetak baris `curl`-nya. `bim_mcp.js` hanya untuk menghubungkan AI; perintah di halaman ini tidak memakainya.

**Verb Viewer, objek, dan jadwal memerlukan checkout lengkap.** Verb-verb itu tidak ada dalam keempat berkas tadi. Ambil seluruh repositori `bim-ootb` (`git clone https://github.com/red1oon/bim-ootb`) lalu jalankan `node common/door/door.js` dari folder paling atasnya, bukan `node door.js`. [Tabel verb](#the-verbs) menyebutkan, untuk setiap verb, mana dari keduanya yang diperlukan. Unduhan satu berkas untuk Viewer belum dibuat.

## Perintah pertama Anda

Satu baris, satu verb, pasangan `key=value` tanpa spasi di sekitar `=`. Tanyakan kepada HospitalGarage tentang grid-nya:

<!-- run: lines cut=700 -->
```text
$ node door.js 'modeller.lines building=HospitalGarage'
{"request":"d-mwhmmeq9-2276636-1","verb":"modeller.lines","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[],"ms":16010,"model":{"grid_source":"column-derived","system":"column-framed","material":"RC","mixed":true,"girders":228,"rotation_deg":-2,"frame":"building","lines":[{"id":"gx0","axis":"x","pos":128.131,"world":132.184},{"id":"gx1","axis":"x","pos":129.223,"world":133.277},{"id":"gx2","axis":"x","pos":133.277,"world":137.334},{"id":"gx3","axis":"x","pos":133.795,"world":137.851},{"id":"gx4","axis":"x","pos":134.811,"world":138.868},{"id":"gx5","axis":"x","pos":145.987,"world":150.051},{"id":"gx6","axis":"x","pos":157.163,"world":161.234},{"id":"gx7…
```

Perintah itu membuka Modeller dan bangunannya, sehingga memerlukan 10 sampai 40 detik. Yang Anda lihat adalah satu baris JSON, sebuah **envelope** (amplop). Hanya bagian awalnya yang ditampilkan di sini; grid-nya memiliki lebih banyak garis daripada yang muat. Jawabannya adalah jawaban asli aplikasi, tidak diubah, di dalam `answer`. Di sini `gx5` berada di 145.987 m dan `gx6` di 157.163 m pada grid milik bangunan itu sendiri. `status` adalah `ok`.

!!! note "Dari mana asal 'request'?"
    Setiap baris mendapat id request (`"request":"d-…"`) dan ditulis ke sebuah jurnal sebelum dijalankan, di `~/.cache/bim_door/journal.jsonl`. Kirim id yang sama dua kali dan Anda mendapat jawaban pertama kembali, sehingga percobaan ulang tidak pernah mengulang sebuah perubahan. Pintu juga mencetak satu baris `§DOOR …` pada aliran error; panduan ini hanya menampilkan standard output.

## Satu verb untuk satu permintaan utuh

Permintaan seperti *"buat bay antara gx5 dan gx6 selebar 13 m"* terdiri dari beberapa langkah: membaca grid, menghitung pergeseran, mencoba pergeseran itu. Verb `modeller.widen_bay` melakukan ketiganya. Inputnya adalah kedua garis dan lebar yang Anda inginkan:

<!-- run: widen -->
```text
$ node door.js 'modeller.widen_bay building=HospitalGarage from=gx5 to=gx6 target=13' > widen.json; echo "exit $?"
exit 3
```

Kode keluar adalah jawaban pertama: `0` berarti ok, `3` berarti aplikasi memberi jawaban yang bukan sekadar "ya" (ditolak, ditahan, atau inconclusive), `1` berarti error dan `2` berarti perintah yang salah. Sekarang lihat isi berkasnya. Seluruh permintaan muncul lebih dulu, lalu kedua langkahnya, masing-masing dengan envelope-nya sendiri:

<!-- run: widen_steps cut=200 -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' widen.json
"request":"d-mwhmmrdh-2276921-1","verb":"modeller.widen_bay","actor":"human","status":"refused"
"request":"d-mwhmmrdh-2276921-1.1","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmmrdh-2276921-1.2","verb":"modeller.try_shift","actor":"human","status":"refused"
```

Langkah pertama membaca grid. Langkah itu menemukan bay saat ini:

<!-- run: widen_read -->
```text
$ grep -o '"id":"gx[56]","axis":"x","pos":[0-9.]*' widen.json
"id":"gx5","axis":"x","pos":145.987
"id":"gx6","axis":"x","pos":157.163
```

Jadi bay itu 157.163 − 145.987 = **11.176 m**. Untuk mencapai 13 m, garis `gx6` dan setiap garis sesudahnya harus bergeser **1.824 m**. Pintu menghitungnya, dan langkah kedua meneruskannya:

<!-- run: widen_move -->
```text
$ grep -o '"move":[0-9.]*' widen.json | head -1
"move":1.824
```

Aplikasi mencoba pergeseran itu, memeriksanya, dan **menghentikannya**:

<!-- run: widen_why -->
```text
$ grep -o '"why":"[^"]*"' widen.json | tail -1
"why":"line 2 (modeller.try_shift): stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m"
```

Perubahan itu dibuat, dinilai, lalu dibatalkan. Tidak ada yang pernah disimpan. Angka-angka di balik penghentian itu ada di laporan aplikasi:

<!-- run: widen_bay -->
```text
$ grep -o '"bay":"gx5-gx6"[^}]*' widen.json
"bay":"gx5-gx6","before":11.176,"after":13,"newly_over":true
```

Bay berubah dari 11.176 m menjadi 13 m, melewati batas 12 m milik bangunan ini untuk balok beton (`limit` dan `material` berasal dari bangunan itu sendiri). Itulah seluruh cerita permintaan Garage: bay 13 m memerlukan satu garis kolom lagi.

## Sebuah skrip: beberapa baris, sebuah hasil bernama {#a-script-several-lines-a-named-result}

Skrip adalah berkas teks dengan satu perintah per baris. Sebuah baris boleh diawali **nama** dan tanda `=`, yang menyimpan jawabannya untuk baris-baris di bawahnya. Apa pun setelah `--` adalah komentar. Simpan ini sebagai `bay.door`:

<!-- file: bay.door -->
```text
-- read the grid, then widen the bay between gx5 and gx6 to exactly 12 m
lines = modeller.lines building=HospitalGarage
modeller.try_shift building=HospitalGarage line=gx6 move={12 - (lines.model.lines[gx6].pos - lines.model.lines[gx5].pos)}
```

Jalankan dengan `--script`:

<!-- run: script -->
```text
$ node door.js --script bay.door > bay.json; echo "exit $?"
exit 0
```

Teks di dalam `{ }` adalah aritmetika. Boleh memakai angka, `+ - * /`, tanda kurung, dan bidang dari hasil bernama. `lines.model.lines[gx6].pos` berarti: pada jawaban bernama `lines`, di bawah `model`, entri `lines` yang id-nya `gx6`, yaitu `pos`-nya. Hanya bidang yang dideklarasikan verb yang dapat dibaca; nama lain apa pun adalah error yang menyatakan hal itu.

Aritmetikanya **desimal eksak**, bukan floating point. Komputer yang memakai floating point mendapat `12 - 11.176 = 0.8239999999999998`. Pintu mendapat ini:

<!-- run: script_move -->
```text
$ grep -o '"change":{"kind":"[^"]*","grid":"[^"]*","through":"[^"]*","lines":[0-9]*,"delta":[0-9.]*' bay.json
"change":{"kind":"block-shift","grid":"gx6","through":"gx16","lines":11,"delta":0.824
```

Skrip berjalan dari atas ke bawah dan **berhenti pada baris pertama yang tidak ok**. Di sini keduanya menjawab `ok`:

<!-- run: script_status -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' bay.json
"request":"d-mwhmni28-2277438-2","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmntjy-2277438-3","verb":"modeller.try_shift","actor":"human","status":"ok"
```

Tepat pada 12 m, aplikasi tidak menemukan masalah baru: jumlah bentang balok yang melewati batas tetap seperti semula.

<!-- run: script_span -->
```text
$ grep -o '"label":"Beam spans over limit","scope":"[^"]*","state":"JUDGED","before":[0-9]*,"after":[0-9]*,"delta":[0-9]*' bay.json
"label":"Beam spans over limit","scope":"228 walked girders, RC (mixed building)","state":"JUDGED","before":91,"after":91,"delta":0
```

Jadi bangunan yang sama, bila diminta 13 m, dihentikan, dan bila diminta 12 m, tetap bertahan. Sebuah `ok` bukan janji bahwa bangunan itu baik: [daftar hal yang tidak diperiksa](#what-is-not-checked) yang sama berlaku.

### Tata bahasa baris

| Bagian | Aturan |
|---|---|
| Sebuah perintah | `app.verb key=value key=value`, satu per baris |
| Nilai dengan spasi | taruh dalam tanda kutip ganda: `text="a note"` |
| Hasil bernama | `name = app.verb …`; baris berikutnya membaca `name.field` |
| Aritmetika | `{ … }` dengan angka, `+ - * /`, tanda kurung, dan bidang hasil; desimal eksak |
| Komentar | `--` dan sisa baris |
| Satuan | tidak pernah ditulis pada baris; verb menyatakan meter, jam, atau hari |
| Hal lain apa pun | bukan perintah: dikembalikan sebagai pertanyaan, bukan sebagai tindakan |

Baris terakhir itu disengaja. Teks yang tidak cocok dengan verb mana pun **tidak pernah ditebak**:

<!-- run: question -->
```text
$ node door.js 'please widen the bay'
{"request":"d-mwhmo809-2277927-1","verb":null,"actor":"human","status":"refused","answer":{"question":"I could not read that as a command. A command is app.verb key=value … Which one do you mean? Type help.","verbs":["modeller.lines","modeller.try_shift","viewer.counts","viewer.clashes","viewer.film_path","viewer.schedule_at","viewer.schedule_compare","modeller.widen_bay","modeller.walk","object.describe","object.read","object.history","object.update","object.attach","object.count","object.list","object.sum","object.group","witness.run","witness.last","legacy.status","legacy.query","mis.column","legacy.compare","idempiere.where","mis.pack","legacy.up","legacy.refresh","legacy.witness","legacy.check","legacy.plugin","model.open","model.convert","model.addbay","model.undo","model.save","model.close","erp.find","erp.actions","erp.complete","erp.void","erp.close","erp.reverse","mis.describe","mis.read","mis.list","mis.sum","mis.group","mis.new","mis.update","mis.delete","mis.load","mis.add_window","ninja.exec","ninja.workflow","mis.diff","mis.menu","ninja.rollback","ninja.export","erp.column","erp.compare","erp.pack","erp.legacy_plugin","erp.describe","erp.read","erp.list","erp.sum","erp.group","erp.new"]},"why":"not a command: \"please widen the bay\"","notChecked":[],"ops":[],"next":[],"ms":0}
```

## Membaca balasan

Setiap baris, dari setiap aktor, mendapat envelope yang sama. Bacalah dengan urutan ini.

| Bidang | Arti |
|---|---|
| `status` | `ok`, `refused`, `claim`, `error` atau `inconclusive`. Baca ini lebih dulu |
| `why` | alasannya, bila statusnya bukan `ok` |
| `answer` | jawaban asli aplikasi, tidak diubah |
| `notChecked` | apa yang tidak tercakup oleh pemeriksaan. Selalu teruskan |
| `request`, `verb`, `actor` | baris yang mana, verb yang mana, siapa yang meminta |
| `ops` | apa yang ditulis, untuk verb yang menulis |
| `next` | dicadangkan; kosong saat ini |
| `ms` | berapa lama waktunya |

Kelima status, masing-masing dari proses yang sungguh dijalankan:

**ok.** Aplikasi menjawab dan tidak ada yang ditahan. Perintah pertama di halaman ini adalah contohnya. Bahkan begitu, bacalah `notChecked`.

**refused.** Aplikasi memberi jawaban yang bukan "ya". Permintaan 13 m di atas adalah contohnya: permintaan itu dicoba, dinilai, dan dibatalkan, dan `why` menyebutkan alasannya. Penolakan adalah jawaban, bukan kegagalan. Teks yang bukan perintah juga `refused` (pertanyaan di atas).

**error.** Barisnya sendiri salah: input yang hilang, verb yang tidak dikenal, nilai dengan jenis yang salah. Tidak ada yang dijalankan.

<!-- run: error -->
```text
$ node door.js 'modeller.lines'
{"request":"d-mwhmo856-2277937-1","verb":"modeller.lines","actor":"human","status":"error","answer":null,"why":"missing input: building","notChecked":[],"ops":[],"next":[],"ms":2}
```

**claim.** Baris itu dipahami, tetapi aktor tidak memiliki bukti yang mengizinkannya, sehingga pintu **menahannya dan tidak menjalankannya**. Ini adalah aturan keselamatan untuk AI, dan berasal dari verb, bukan dari aktor. Lihat [Apa itu klaim](#what-is-a-claim).

<!-- run: claim -->
```text
$ node door.js --actor ai --request ai-1 'object.update building=Duplex kind=Element uu=abc column=Name value=x'
{"request":"ai-1","verb":"object.update","actor":"ai","status":"claim","answer":null,"why":"actor ai has proof \"local-user\", which allows read/trial verbs; object.update is writes. Held as a claim, not run. A person confirms it with: door.js --confirm ai-1","notChecked":[],"ops":[],"next":[],"ms":5}
```

**inconclusive.** Aplikasi tidak dapat menilai, dan menyatakannya. Status ini tidak pernah diubah menjadi `ok`. Di sini Viewer tidak memiliki aturan clash untuk pasangan ARC dan ZZZ. Yang ini memerlukan checkout:

<!-- run: inconclusive -->
```text
$ node common/door/door.js 'viewer.clashes building=Duplex discA=ARC discB=ZZZ'
{"request":"d-mwhmo8hh-2277957-1","verb":"viewer.clashes","actor":"human","status":"inconclusive","answer":null,"why":"the Viewer could not answer (exit 1): the Viewer says INCONCLUSIVE: no rule for ARC/ZZZ in clash_rules.json","notChecked":[],"ops":[],"next":[],"ms":24342}
```

### Apa itu klaim {#what-is-a-claim}

Setiap verb memiliki **kelas bahaya**: `read` (tidak mengubah apa pun), `trial` (perubahan yang dibuat pada salinan sementara, dinilai, tidak pernah disimpan), `writes`, `posts` atau `sends`. Kelas itu ditulis sekali, di daftar verb, sehingga tidak ada aktor yang bisa mengakalinya.

Setiap aktor memiliki bukti. Seseorang di terminal dipercaya untuk setiap kelas. Sebuah **AI** dipercaya hanya untuk `read` dan `trial`: ia boleh melihat dan boleh mencoba, tetapi verb `writes`, `posts` atau `sends` dari AI ditahan sebagai klaim, seperti baris `object.update` di atas. Aktor tanpa bukti sama sekali, misalnya surel dari pengirim yang tidak dikenal, boleh membaca dan tidak boleh yang lain:

<!-- run: claim_email -->
```text
$ node door.js --actor email --request mail-0 'modeller.try_shift building=HospitalGarage line=gx6 move=1.824'
{"request":"mail-0","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-0","notChecked":[],"ops":[],"next":[],"ms":2}
```

Klaim yang ditahan tidak dijalankan, tidak diantrekan, dan tidak hilang: ia ada di jurnal, di bawah id request-nya. Pintu tidak mengonfirmasi apa pun atas nama siapa pun.

### Konfirmasi sebuah klaim

Seseorang meloloskan klaim yang ditahan **menurut id request-nya**, sehingga baris yang dijalankan persis baris yang diusulkan. Tidak ada yang mengetik ulang. Di sini sebuah surel meminta pergeseran uji coba dan ditahan:

<!-- run: confirm_claim -->
```text
$ node door.js --journal claims.jsonl --actor email --request mail-1 'modeller.try_shift building=HospitalGarage line=gx6 move=0.824'
{"request":"mail-1","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-1","notChecked":[],"ops":[],"next":[],"ms":2}
```

`--claims` mendaftar apa yang sedang ditahan:

<!-- run: confirm_list -->
```text
$ node door.js --journal claims.jsonl --claims | grep -o '"actor":"[a-z]*","line":"[^"]*","verb":"[^"]*","harm":"[a-z]*"'
"actor":"email","line":"modeller.try_shift building=HospitalGarage line=gx6 move=0.824","verb":"modeller.try_shift","harm":"trial"
```

`--confirm` menjalankan baris yang tercatat, sebagai Anda, satu kali:

<!-- run: confirm_run cut=200 -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1
{"request":"mail-1#confirmed","verb":"modeller.try_shift","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[{"tag":"EDIT_REPORT","version":1,"change":{"kind":"bloc…
```

Balasannya biasa saja, dan menyebut klaim yang dikonfirmasinya. Meminta lagi tidak menjalankan apa pun: pintu menjawab dari catatannya.

<!-- run: confirm_again -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1 | grep -o '"confirms":"[^"]*"'
"confirms":"mail-1"
```

Tiga aturan berlaku. Hanya seseorang di terminal yang boleh mengonfirmasi: `--actor ai --confirm …` ditolak dan klaim tetap ditahan. Aplikasi tetap memutuskan pada saat konfirmasi, sehingga baris yang sejak diusulkan telah menjadi salah ditolak dengan alasan dari aplikasi. Dan koneksi alat milik AI tidak memiliki perintah konfirmasi sama sekali.

**Apa yang tidak dibuktikan oleh hal ini.** Pintu memercayai siapa pun yang berada di terminal lokal. AI yang diizinkan menjalankan perintah shell di mesin Anda dapat mengetik `--confirm` sendiri, sama seperti ia dapat mengetik sebuah baris sebagai Anda. Pertahankan akses AI pada koneksi alatnya saja bila hal itu penting.

## Pakai pintu dari skrip Anda sendiri

Semua yang di atas adalah `door.js`, berkas yang sama yang dipakai koneksi AI. Dari program Anda sendiri, panggil sebagai perintah dan baca JSON-nya: kode keluar (`0`, `3`, `1`, `2`) menunjukkan apakah yang dibaca adalah jawaban atau masalah, dan `status` menunjukkan yang mana. `--actor human` adalah bawaan; `--actor ai` membuat pintu memperlakukan baris itu sebagai baris milik AI.

## Tanyakan apa itu sesuatu: `object.describe`

Sebuah verb juga dapat menanyakan kepada model itu sendiri apa isinya. `object.describe` adalah **refleksi**: ia membaca kamus milik model dan menyebutkan properti apa yang dimiliki satu jenis objek, tab anak apa, dan metode generik apa yang sah baginya. Ia hanya membaca baris kamus; tidak ada elemen yang dibuka. Ia memerlukan checkout, dan bangunan yang modelnya membawa kamusnya sendiri (Duplex demikian).

<!-- run: describe cut=520 -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element'
{"request":"d-mwhmp6f0-2278556-1","verb":"object.describe","actor":"human","status":"ok","answer":{"kind":"Element","table":"elements_meta","uu":"3027c2ed-8cb6-5ccb-ae8c-fd7df2eca264","key":"elements_meta_uu","highVolume":true,"properties":[{"name":"guid","label":"GUID","type":"string","mandatory":true,"updateable":false,"key":false,"parent":false,"length":255,"displayed":true,"seq":10,"fieldReadOnly":true,"allowCopy":false},{"name":"ifc_class","label":"IFC Class","type":"list","mandatory":false,"updateable":true,"…
```

Metode apa yang boleh dipakai sebuah `Element`?

<!-- run: describe_methods -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element' | grep -o '"methods":\[[^]]*\]'
"methods":["read","update","attach","history"]
```

Jenis yang tidak dikenal adalah error yang mendaftar jenis-jenis yang dimiliki model, sehingga tebakan yang salah mengajarkan nama yang benar.

## Hitung sesuatu: `object.count`

`object.count` menjawab "berapa banyak": berapa banyak rekaman dari satu jenis yang dimuat model. Duplex menamai ruangannya sebagai jenis `Room`. Ia memerlukan checkout.

<!-- run: count_rooms -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room'
{"request":"d-mwhmp7mf-2278599-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[],"count":5,"population":5,"verdict":"OK","summary":"5 Room"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":594}
```

Tambahkan `column=value` untuk mempersempit hitungan. Kolom itu harus properti dari jenisnya (`object.describe` mendaftarnya), dan jawabannya menyimpan **populasi**, yaitu angka sebelum dipersempit:

<!-- run: count_storey -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room storey="Level 1"'
{"request":"d-mwhmp87z-2278619-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[{"column":"storey","value":"Level 1"}],"count":2,"population":5,"verdict":"OK","summary":"2 Room where storey = Level 1 (of 5)"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":569}
```

Kolom yang tidak dimiliki jenis itu adalah error yang menyebut namanya dan mendaftar kolom yang sebenarnya. Tidak pernah dibaca sebagai "tidak ada yang cocok":

<!-- run: count_badcol cut=330 -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room floor=1'
{"request":"d-mwhmp8u8-2278641-1","verb":"object.count","actor":"human","status":"error","answer":null,"why":"the object engine could not answer (exit 1): kind Room has no property \"floor\" (its properties: guid, type, name, parent_guid, object_type, predefined_type, center_x, center_y, center_z, size_x, size_y, size_z, room_gu…
```

Model tanpa satu ruangan pun tidak menjawab `0`. Ia menjawab `inconclusive`, karena tidak ada yang dihitung. Nol yang dapat Anda percaya adalah hitungan yang dipersempit di dalam populasi yang tidak kosong.

## Apa yang akan ditempatkan walker: `modeller.walk`

Modeller memiliki sebuah *walker* yang menempatkan perlengkapan satu disiplin (sprinkler, lampu, stopkontak) menurut aturan yang diukur dari bangunan nyata. `modeller.walk` adalah **dry run** (uji coba tanpa menyimpan) darinya: ia menyebutkan apa yang akan ditempatkan walker dan tidak mengubah apa pun. Berkas model sama persis, byte demi byte, sesudahnya, dan jawabannya menyatakan hal itu. Ia memerlukan checkout. Balasan lengkapnya panjang, jadi di sini hanya angka-angka utamanya yang ditampilkan:

<!-- run: walk_fp -->
```text
$ node common/door/door.js 'modeller.walk building=Duplex discipline=FP' | grep -o '"rules":"[^"]*"\|"count":[0-9]*,"placed":[0-9]*,"provisional":[0-9]*\|"byClass":{[^}]*}\|"modelUnchanged":[a-z]*'
"rules":"duplex_rules.db"
"count":46,"placed":0,"provisional":46
"byClass":{"IfcFireSuppressionTerminal":45,"IfcAlarm":1}
"modelUnchanged":true
```

`count` adalah semua yang akan ditempatkan oleh walk itu. `provisional` adalah posisi yang oleh walker sendiri ditandai belum final, misalnya perlengkapan yang tidak menemukan plafon di atasnya. `rules` adalah kumpulan aturan yang dipakai kelas bangunan itu: rumah memakai aturan residensial. Walk yang tidak menempatkan apa pun menjawab `inconclusive` dengan alasan dari walker.

## Biarkan Modeller tetap terbuka di antara baris: `model.open`, `model.convert`, `model.addbay`, `model.undo`, `model.save`, `model.close`

Baris-baris ini mengendalikan SATU halaman Modeller yang dibiarkan terbuka di latar belakang (headless, di CPU, tanpa kartu grafis), sehingga setiap baris bekerja pada apa yang ditinggalkan baris sebelumnya. `model.open sheets=<folder or a.dxf,b.dxf> type="Farming Shed"` membuka lembar 2D, `model.convert` membuat model 3D (tombol Convert milik halaman itu sendiri), `model.addbay end=high|low` menambah satu bay di ujung tersebut pada bangunan dengan bay berulang, `model.undo` membatalkan perubahan terakhir, dan `model.close` menghentikan halaman itu. Halaman itu mengerjakan semuanya dengan fungsinya sendiri; baris itu menekan apa yang ditekan seseorang dan mencetak jawaban halaman itu sendiri. Model hidup di halaman itu sampai Anda menyimpannya: `model.save` menulisnya ke berkas `.db` di folder ini, dan `model.close` menyimpan lebih dulu bila model berubah dan sebuah berkas simpan sudah diketahui. Semuanya memerlukan checkout `bim-ootb`, dan folder tempat Anda menjalankannya menyimpan sesi (berkas `.model_session.json`; port itu hanya mendengarkan di mesin ini dan setiap request membawa token sekali pakai).

Aturan yang akan Anda temui: baris sebelum `model.open` ditolak ("no session: model.open first"), begitu juga `model.open` kedua, `model.convert` kedua, dan `model.addbay` sebelum Convert. Sebuah bay hanya ditawarkan bila jenis bangunan menyatakannya (Farming Shed menyatakannya); tanpa `type=`, bay ditolak dengan menyebut bahwa jenis itu tidak menyatakan aturan apa pun. Lembar-lembarnya harus membawa tandanya: lembar polos dari sebuah gambar tidak lolos gerbang. Setiap baris memakan beberapa detik (di sini: open sekitar 6 detik, convert 3 detik, sebuah bay 3 detik; pada kumpulan lembar yang lebih besar, convert memakan sampai 15 detik). **Menyimpan:** namai berkasnya sekali, pada `model.open … file=shed.db` atau pada `model.save file=shed.db` yang pertama. Penyimpanan menjalankan Save milik halaman itu sendiri: pemeriksaan clash lebih dulu (clash RED menghalangi penyimpanan, seperti di layar, dan tidak ada yang ditulis), lalu model ditulis sebagai `.db` asli. Pada shed ini, sebuah penyimpanan memakan sekitar setengah detik, dan jawabannya memberi waktu tiap langkah. `model.close` dengan perubahan yang belum disimpan dan tanpa berkas ditolak dan sesi tetap terbuka: simpan, atau `model.close discard=Y` untuk membuang perubahan dengan sengaja. Penyimpanan sebelum ada yang dibuat ditolak, dengan kata-kata dari halaman itu.

Blok di bawah menyalin sebuah folder berisi 9 lembar bertanda dari sebuah shed, yang ditunjuk oleh `SHED_SHEETS`, ke dalam `shed/`, lalu menjalankan baris-barisnya satu demi satu; atur `SHED_SHEETS` ke folder Anda sendiri yang berisi lembar `.dxf` bertanda.

<!-- run: model_ses cut=200 -->
```text
$ rm -rf shed shed.db; mkdir shed; cp "$SHED_SHEETS"/*.dxf shed/; D='node common/door/door.js --list'; eval "$D 'model.convert'" | grep -E '^error:'; eval "$D 'model.open sheets=shed type=\"Farming Shed\" file=shed.db'" | grep -E '^summary:'; eval "$D model.save" | grep -E '^error:'; eval "$D model.convert" | grep -E '^summary:'; eval "$D model.save" | grep -E '^(file|bytes|elements):'; eval "$D 'model.addbay end=high'" | grep -E '^(copies_by_class|summary):'; eval "$D model.undo" | grep -E '^summary:'; eval "$D model.close" | grep -E '^closed:'; ls -l shed.db | awk '{print "shed.db bytes: " $5}'; eval "$D model.undo" | grep -E '^error:'; rm -rf shed shed.db .model_session.log
error: no session in this folder: model.open first
error: nothing is open: model.open first
closed: true
error: no session in this folder: model.open first
```

`model.addbay end=low` menambah bay di ujung yang lain (engsel yang berbeda, 29 salinan yang sama). Tidak diperiksa oleh baris-baris ini: biayanya terhadap hitungan independen (pengujian terpisah yang melakukannya), dan lebih dari satu sesi dalam satu folder.

## Daftar, jumlah, dan kelompok: `erp.list`, `erp.sum`, `erp.group`

`count` menjawab "berapa banyak". Tiga verb baca-saja lainnya menjawab "yang mana saja", "berapa total" dan "berapa banyak untuk masing-masing". Ketiganya menerima jenis apa pun dari kamus ERP (dan ketiga verb yang sama ada untuk model sebuah bangunan sebagai `object.list`, `object.sum`, `object.group`). Semuanya memerlukan checkout.

`erp.list` menampilkan baris. Setiap kolom, filter, dan urutan diperiksa terhadap kamus, sehingga nama yang salah adalah error yang mendaftar nama yang sebenarnya. Tambahkan `column=value` untuk mempersempit daftar. Daftar menampilkan paling banyak 50 baris kecuali `limit` menyatakan lain (sampai 1000), dan jawabannya selalu membawa **total**, sehingga daftar yang pendek tidak pernah disangka keseluruhannya. Telusuri daftar yang panjang dengan `offset`:

<!-- run: list_orders -->
```text
$ node common/door/door.js --list 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo  DocStatus  GrandTotal
80001       CO         100.7
80001       CO         100.7
800002      CO         2160
shown 3 of 14
```

`erp.sum` menjumlahkan sebuah kolom angka secara eksak. Desimal dijumlahkan sebagai desimal, tidak pernah sebagai floating point, sehingga uang tidak bergeser. `erp.group` menghitung rekaman untuk setiap nilai dari sebuah kolom, yang paling umum lebih dulu:

<!-- run: sum_orders -->
```text
$ node common/door/door.js --list 'erp.sum kind=Order column=GrandTotal docstatus=CO'
kind: Order
table: C_Order
column: GrandTotal
filters: [{"column":"DocStatus","value":"CO"}]
n: 14
sum: 19505.9
population: 44
verdict: OK
summary: 19505.9 = sum of GrandTotal over 14 Order
```

<!-- run: group_orders -->
```text
$ node common/door/door.js --list 'erp.group kind=Order by=DocStatus'
DocStatus  count
IP         22
CO         14
DR         6
CL         2
shown 4 of 4
```

Jenis tanpa satu rekaman pun tidak menjawab `0` atau daftar kosong. Ia menjawab `inconclusive`, karena tidak ada yang dinilai.

## Buat sebuah rekaman: `erp.new`

`erp.new` membuat rekaman dengan cara jendela milik ERP membuatnya. Anda menyebut jenis dan kolom yang Anda ketahui; mesin mengisi sisanya seperti yang dilakukan jendela (nilai bawaan, pilihan yang dibawa seorang mitra, Document No dari urutan nomor). Kolom yang tidak dimiliki kamus ditolak dan balasannya mendaftar kolom yang sebenarnya. Kolom wajib yang masih kosong sesudah itu ditolak menurut namanya, dan tidak ada yang ditulis. Balasan dimulai dengan `number`: Document No, yang Anda pakai berikutnya.

Dokumen Sales atau Purchase (penjualan atau pembelian) memerlukan `issotrx=Y` atau `N`. Seorang mitra atau produk boleh diberikan dengan nama; nama yang tidak cocok dengan rekaman mana pun, atau cocok dengan lebih dari satu, ditolak. Sebuah baris menyebut dokumennya dengan nomor:

<!-- run: new_order -->
```text
$ rm -f /tmp/fast_guide_new.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101'
{"request":"d-mwhmq2lp-2280086-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":"50000","kind":"Order","table":"c_order","id":1500004,"docStatus":"DR","given":["IsSOTrx","C_DocTypeTarget_ID","C_BPartner_ID","SalesRep_ID"],"defaulted":52,"filled":["ad_client_id","ad_org_id","documentno","isselfservice","dateordered","datepromised","bill_bpartner_id","c_bpartner_location_id","bill_location_id","deliveryrule","priorityrule","m_warehouse_id","isdropship","deliveryviarule","freightcostrule","freightamt","ispriviledgedrate","shippingrateinquiry","invoicerule","m_pricelist_id","c_currency_id","c_conversiontype_id","isdiscountprinted","chargeamt","paymentrule","c_paymentterm_id","totallines","grandtotal","docstatus","c_doctype_id","ispayschedulevalid","copyfrom","docaction","posted","isdelivered","dateacct","amountrefunded","isapproved","processed","processing","istaxincluded","isinvoiced","isselected","isprinted","sendemail","istransferred","iscreditapproved","isactive","processedon","amounttendered","volume","weight"],"record":{"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:44","createdby":101,"updated":"2026-11-15 17:25:44","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","dateprinted":null,"dateacct":"2026-11-15 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":0,"grandtotal":0,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c1be6519-1439-4618-a5b3-7c7af36acfe9","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}],"next":[],"ms":6973}
```

<!-- run: new_line -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2'
{"request":"d-mwhmq849-2280142-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":null,"kind":"Sales Order Line","table":"c_orderline","id":120002710,"docStatus":null,"given":["M_Product_ID","QtyEntered","C_Order_ID"],"defaulted":31,"filled":["ad_client_id","ad_org_id","c_bpartner_id","c_bpartner_location_id","datepromised","dateordered","line","m_warehouse_id","m_attributesetinstance_id","c_uom_id","qtyordered","qtydelivered","qtyreserved","qtyinvoiced","priceentered","priceactual","pricelist","freightamt","c_tax_id","discount","linenetamt","qtylostsales","processed","createshipment","createproduction","rramt","pricecost","pricelimit","c_currency_id","isactive","isdescription"],"record":{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:52","createdby":101,"updated":"2026-11-15 17:25:52","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"337b125f-adeb-4412-bbb9-5584c995f8fa","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}],"next":[],"ms":7403}
```

Pesanan itu berupa draf sampai seseorang menyelesaikannya. Karena baris itu diberi nomor pesanan, total pesanan mengikuti tanpa langkah kedua: `totallines` dan `grandtotal` dalam rekaman di bawah adalah jumlah baris itu (6). Daftar baris milik pesanan itu sendiri tidak diisi oleh `erp.read`.

<!-- run: new_read -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js --list 'erp.read kind=Order number=50000'
kind: Order
uu: 1500004
record: {"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:44","createdby":101,"updated":"2026-11-15 17:25:44","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","dateprinted":null,"dateacct":"2026-11-15 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":6,"grandtotal":6,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c1be6519-1439-4618-a5b3-7c7af36acfe9","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null}
children: [{"kind":"Sales Order Line","rows":[{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:52","createdby":101,"updated":"2026-11-15 17:25:52","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"337b125f-adeb-4412-bbb9-5584c995f8fa","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null}]},{"kind":"Order Tax","rows":[]},{"kind":"Order Payment Schedule","rows":[]},{"kind":"POS Payment","rows":[]}]
```

`erp.new` adalah verb `writes`. Seseorang di terminal yang menjalankannya. `erp.new` milik AI ditahan sebagai klaim dan tidak ada yang ditulis sampai seseorang mengonfirmasinya (lihat "Apa itu klaim"). Blok-blok ini memakai op-log sementara (`/tmp/fast_guide_new.ops`, dikosongkan lebih dulu), sehingga menjalankannya tidak menyentuh data Anda sendiri.

## Bekerja dengan tabel apa pun: verb `mis.*`

**MIS adalah dasarnya. ERP adalah MIS ditambah daur hidup sebuah dokumen.** Mendaftar, membaca, membuat, mengubah, menghapus, dan memuat rekaman adalah sama pada setiap tabel dalam kamus: seorang pelanggan, sebuah produk, tabel yang Anda buat sendiri. Verb-verb itu disebut `mis.*`. Yang hanya dimiliki sebuah dokumen (selesaikan, batalkan, tutup, balikkan) tetap `erp.*`. Nama-nama lama `erp.list`, `erp.read`, `erp.describe`, `erp.sum`, `erp.group` dan `erp.new` masih berfungsi: masing-masing adalah nama lama untuk verb `mis.*`-nya dan memberi jawaban yang sama, sehingga skrip yang Anda tulis sebelumnya tidak berubah.

Setiap verb `mis.*` yang menulis melakukan apa yang dilakukan jendela milik ERP. Ia tidak mengedit basis data di bawahnya. Nilai bawaan dan callout dijalankan, pemeriksaan dijalankan, sebuah penolakan menyebut alasannya, dan tidak ada yang ditulis bila ada yang ditolak.

**Apa yang masih kurang?** `mis.new … dry=Y` menjalankan semuanya kecuali penyimpanan dan tidak menulis apa pun. Ia menjawab kolom wajib mana yang masih kosong sesudah nilai bawaan, sehingga Anda tahu apa yang harus diberikan:

<!-- run: mis_dry cut=330 -->
```text
$ rm -f /tmp/fast_guide_mis.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.new kind=C_BPartner dry=Y'
dry: true
kind: Business Partner
table: c_bpartner
mandatory: ["Value","Name"]
needs: []
given: []
defaulted: 32
filled: ["ad_client_id","ad_org_id","c_bp_group_id","iscustomer","isvendor","isemployee","isprospect","issalesrep","so_creditlimit","totalopenbalance","istaxexempt","ispotaxexempt","issummary","isactive","c_paymentterm_id","m_pricelist_id","flatdiscount","c_dunning_id","shelflifeminpct","ismanufacturer","is1099vendor","documentc…
ops: []
```

**Buat, ubah, baca.** Kolom yang memuat rekaman lain boleh diberikan dengan namanya. `mis.list … names=Y` menampilkan kolom semacam itu sebagai nama, seperti yang dilakukan grid milik jendela:

<!-- run: mis_new cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.new kind=C_BPartner Value=GD100 Name="Guide Partner One"'
number: Guide Partner One
kind: Business Partner
table: c_bpartner
id: 1600010
docStatus: 
given: ["Value","Name"]
defaulted: 32
filled: ["ad_client_id","ad_org_id","c_bp_group_id","iscustomer","isvendor","isemployee","isprospect","issalesrep","so_creditlimit","totalopenbalance","istaxexempt","ispotaxexempt","issummary","isactive","c_paymentterm_id","m_pricelist_id","flatdiscount","c_dunning_id","shelflifeminpct","ismanufacturer","is1099vendor","documentc…
record: {"c_bpartner_id":1600010,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:26:07","createdby":101,"updated":"2026-11-15 17:26:07","updatedby":101,"value":"GD100","name":"Guide Partner One","name2":null,"description":null,"issummary":"N","c_bp_group_id":103,"isonetime":"N","isprospect":"N","isvendor…
ops: [{"op_type":"CRUD_CREATE","table":"c_bpartner"},{"op_type":"CRUD_CREATE","table":"ad_treenodebp"},{"op_type":"CRUD_CREATE","table":"c_bp_customer_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_customer_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_vendor_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_vendor_acct"}]
```

<!-- run: mis_update cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.update kind=C_BPartner number="Guide Partner One" description="first supplier"' | grep -E '^(noop|given|changed|derived):'
noop: false
given: ["Description"]
changed: ["description"]
derived: []
```

<!-- run: mis_list -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_BPartner value=GD100 columns=Value,Name,Description,C_BP_Group_ID names=Y'
Value  Name               Description     C_BP_Group_ID
GD100  Guide Partner One  first supplier  Standard Customers
shown 1 of 1
```

`mis.update` hanya mengirim kolom yang Anda berikan; memberikan nilai yang sudah dimiliki sebuah rekaman tidak mengubah apa pun dan jawabannya menyatakan `noop`. Kolom yang tidak diizinkan jendela untuk diedit seseorang (bidang baca-saja, atau kolom apa pun dari dokumen yang sudah selesai) ditolak, dan jawabannya menyebut aturannya. Kosongkan sebuah kolom dengan nilai `<null>`.

**Kolom yang menunjuk ke rekaman lain** (seorang mitra bisnis, sebuah produk, sebuah gudang) harus menyebut rekaman yang ada dan boleh dipakai perusahaan Anda. `mis.new` memeriksa setiap kolom semacam itu dan `mis.update` memeriksa kolom yang Anda ubah, dan yang salah ditolak dengan kata-kata milik ERP legacy sendiri, misalnya `Cannot save record in C_Order: Foreign ID 999999 not found in C_BPartner_ID`, atau `Cross tenant ID … not allowed in …` untuk rekaman milik perusahaan lain. Nilai di luar aturan validasi sebuah lookup (daftar yang akan ditawarkan sebuah jendela) TIDAK ditolak: ERP legacy juga menyimpannya, karena aturan itu hanya menentukan apa yang ditawarkan jendela.

**Hapus.** `mis.delete` adalah Delete milik jendela. Ia menolak apa yang ditolak jendela, dengan kata-kata milik mesin sendiri, dan tidak menulis apa pun. Mitra standar dipakai oleh rekaman lain:

<!-- run: mis_refuse cut=300 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.delete kind=C_BPartner id=112'
refused: true
reason: Business Partner Standard is not deleted: Record not deleted - dependent record found; nothing was written
```

<!-- run: mis_delete cut=300 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.delete kind=C_BPartner number="Guide Partner One"' | grep -E '^(gone|opSummary):'
gone: true
opSummary: {"delete:c_bp_customer_acct":2,"delete:c_bp_vendor_acct":2,"delete:c_bpartner":1,"delete:ad_treenodebp":1}
```

**Muat banyak dari sebuah CSV.** `mis.load` membaca sebuah `.csv` (baris pertama adalah nama kolom, satu rekaman per baris) dan menjalankan proses Migrate Excel Data (Migrasi Data Excel) milik ERP sendiri atasnya. Proses itu bersifat semua atau tidak sama sekali, sehingga `mis.load` lebih dulu **memeriksa** (`dry=Y`, bawaannya) dan tidak menulis apa pun: ia menghitung baris dan menyebut setiap baris yang buruk. Di samping berkas Anda, ia menulis `….rejected.csv` (baris yang buruk dan sebabnya) dan `….ok.csv` (baris yang baik):

<!-- run: mis_load cut=330 -->
```text
$ printf 'Value,Name,C_BP_Group_ID\nGD201,Guide Two,Standard Customers\nGD202,Guide Three,Nowhere\n' > /tmp/fast_guide_mis.csv; rm -f /tmp/fast_guide_mis.rejected.csv /tmp/fast_guide_mis.ok.csv; BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.load kind=C_BPartner file=/tmp/fast_guide_mis.csv'
kind: Business Partner
table: c_bpartner
file: /tmp/fast_guide_mis.csv
rows: 2
ok: 1
rejected: [{"row":2,"why":["C_BP_Group_ID: no C_BP_Group with Name=\"Nowhere\""]}]
unplaced: []
dry: true
loaded: false
files: {"rejected":"/tmp/fast_guide_mis.rejected.csv","ok":"/tmp/fast_guide_mis.ok.csv"}
summary: Nothing migrated: 1 row error(s). c_bpartner row 3 C_BP_Group_ID: no C_BP_Group with Name="Nowhere"
```

<!-- run: mis_rejected -->
```text
$ cat /tmp/fast_guide_mis.rejected.csv
Value,Name,C_BP_Group_ID,rejected_because
GD202,Guide Three,Nowhere,"C_BP_Group_ID: no C_BP_Group with Name=""Nowhere"""
```

Memuat berkas aslinya dengan `dry=N` ditolak selama ada baris yang buruk. Perbaiki baris yang buruk, atau muat yang baik, yang merupakan pemuatan semua-atau-tidak-sama-sekali tersendiri:

<!-- run: mis_load_ok cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.load kind=C_BPartner dry=N file=/tmp/fast_guide_mis.ok.csv'
kind: Business Partner
table: c_bpartner
file: /tmp/fast_guide_mis.ok.csv
rows: 1
ok: 1
rejected: []
unplaced: []
dry: false
loaded: true
files: {}
summary: No worksheets : 1(C_BPartner = 1 records) 
ops: 6
opSummary: {"create:c_bpartner":1,"create:ad_treenodebp":1,"create:c_bp_customer_acct":2,"create:c_bp_vendor_acct":2}
keys: [1600010]
```

`mis.new`, `mis.update`, `mis.delete` atau `mis.load` milik AI ditahan sebagai klaim, seperti `erp.new`: tidak ada yang ditulis sampai seseorang mengonfirmasinya. Memperbarui rekaman yang ada secara massal tidak ditawarkan; pakai `mis.update` untuk masing-masing, sehingga pemeriksaan jendela dijalankan.

### Melihat dan mengubah rekaman sebagai sebuah peran

Setiap verb `mis.*` menerima `role=`, id sebuah peran di ERP. **Tanpa peran tidak ada yang disaring:** Anda melihat setiap rekaman dari setiap klien. Dengan sebuah peran Anda mendapat apa yang didapat peran itu di jendela yang diberikan kepadanya: rekaman milik klien dan organisasinya sendiri, dan hanya rekaman serta kolom yang diizinkan baris aksesnya. Total hanya menghitung rekaman-rekaman itu. Peran dinyatakan pada baris. Ini bukan sebuah login.

<!-- run: mis_role -->
```text
$ for r in '' ' role=103' ' role=12000'; do BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list "mis.sum kind=C_Order column=GrandTotal$r" | grep -E '^(n|sum):' | tr '\n' ' '; echo; done
n: 43 sum: 74936.76 
n: 8 sum: 9914.07 
n: 27 sum: 55108.62
```

Rekaman di luar rekaman milik peran dijawab persis seperti rekaman yang tidak ada. Kolom yang hanya boleh dibaca oleh peran tidak dapat diubah. Jenis yang tidak memiliki jendela bagi peran itu ditolak; peran 103 tidak memiliki jendela yang menampilkan Tax (Pajak):

<!-- run: mis_role_refuse cut=200 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_Tax role=103'
refused: true
reason: role 103 (GardenWorld User) is not granted a window that shows Tax (AD_Window_Access)
```

Lima aturan belum dinilai, dan peran yang memakai salah satunya ditolak alih-alih diperiksa setengah-setengah: kunci pribadi pada sebuah rekaman, aturan validasi tabel, peran yang organisasinya berasal dari pengguna, peran dengan organisasi ringkasan dalam pohon organisasi, dan akses rekaman "dependent entities". `mis.load` tidak menerima peran.

## Buat tabel Anda sendiri: `mis.add_window`

Tabel yang Anda simpan di spreadsheet dapat menjadi jendela sungguhan: sebuah tabel, sebuah form, sebuah entri menu, dan akses peran, tanpa kode yang ditulis untuknya. Gambarkan kolom-kolomnya dalam sebuah `.csv` kecil, satu baris per kolom. Hanya `Column` yang wajib. Kunci, klien dan organisasi, penanda aktif, dan kolom audit ditambahkan untuk Anda:

<!-- run: win_sheet -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; cat AST_Asset.csv
Column,Type,Length,Mandatory,Default,List,Help
Name,String,60,Y,,,Its name
PurchaseDate,Date,,,,,When it was bought
Cost,Amount,,,,,
Condition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",
IsInsured,,,,,,
```

Satu baris membuat jendelanya (lembar ditulis lagi di sini agar baris itu dapat dijalankan sendiri, dari folder yang berisi `common/`). Tabel dinamai menurut berkasnya. `dry=Y` memeriksa lembar dan tidak menulis apa pun. Lembar yang cacat ditolak dengan setiap cacat beserta barisnya, dan tidak ada yang ditulis:

<!-- run: win_add cut=200 -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; rm -f /tmp/fast_guide_win.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list 'mis.add_window file=AST_Asset.csv' | grep -E '^(table|window|columns|lists|ops):'
table: AST_Asset
window: {"id":7100001,"name":"AST Asset"}
columns: ["Name","PurchaseDate","Cost","Condition","IsInsured"]
lists: [{"column":"Condition","values":["GOOD","FAIR","POOR"]}]
ops: 47
```

Jenis baru itu langsung berfungsi dengan setiap verb `mis.*`, dan dengan `mis.js`. Kolom wajib diminta, nilai bawaan diisi, dan nilai di luar daftar milik lembar ditolak:

<!-- run: win_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list'; eval "$D 'mis.new kind=AST_Asset Name=Tractor Cost=1200.50'" | grep -E '^(number|filled):'; eval "$D 'mis.new kind=AST_Asset Cost=5'" | grep reason; eval "$D 'mis.new kind=AST_Asset Name=Plough Condition=BAD'" | grep reason; eval "$D 'mis.list kind=AST_Asset columns=Name,Cost,Condition'"; rm -f AST_Asset.csv
number: Tractor
filled: ["ad_client_id","ad_org_id","isactive","condition","isinsured"]
reason: mandatory and still empty after the defaults and callouts: Name (give them as column=value)
reason: Condition Invalid value - BAD - Reference_ID=200277 - FAIR - GOOD - POOR; nothing was written
Name     Cost    Condition
Tractor  1200.5  GOOD
shown 1 of 1
```

Jenisnya adalah String, Quantity, Amount, YesNo, Date, DateTime, Text dan List. Kolom yang namanya berakhiran `_ID` adalah lookup ke tabel itu, dan yang diawali `Is` adalah ya/tidak. Tabel detail di bawah sebuah master datang bersama sebuah buku kerja: bagian berikutnya.

## Seluruh buku kerja dalam satu baris: `ninja.exec`

Satu tabel dari sebuah `.csv` adalah kasus kecil. Sebuah **buku kerja Ninja** memuat banyak tabel sekaligus, menyatakan tabel mana berada di bawah tabel mana, dan dapat membawa baris-baris pertamanya. Satu baris membuat semuanya.

Buku kerja adalah berkas spreadsheet biasa (`.xlsx` atau `.xls`):

| Lembar | Isinya |
|---|---|
| `1_RO_ModelHeader` | nama seluruh kumpulan, di sel pertama di bawah `Name` |
| `2_RO_ModelMaker` | satu baris per tabel: `Master` (tabel tempat ia berada di bawahnya, atau kosong), `Name` (tabelnya), `ColumnSet` (kolom-kolomnya, dipisahkan koma) |
| lembar yang namanya persis sama dengan sebuah tabel | baris untuk dimuat: baris 1 berisi nama kolom |

Dalam `ColumnSet`, nama polos adalah teks. Sebuah awalan memberi jenis lain: `D#` tanggal, `A#` jumlah uang, `Q#` kuantitas, `T#` teks panjang, `Y#` ya/tidak, dan `L#Name=a/b/c` daftar nilai tetap. Tabel yang `Master`-nya adalah tabel lain dalam buku kerja menjadi tab pada jendela tabel itu.

Sebuah buku kerja latihan disertakan bersama pintu: `common/door/samples/Ninja_Practice.xlsx` (seorang pasien, kunjungan pasien itu, obat-obatan dalam sebuah kunjungan, sebuah ruangan, dan sebuah rujukan yang berada di bawah Business Partner (Mitra Bisnis)). `dry=Y` membacanya, menyebut apa yang akan dibuatnya dan tidak menulis apa pun:

<!-- run: nx_dry cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_ninja.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list 'ninja.exec file=Ninja_Practice.xlsx dry=Y' | grep -E '^(bundle|tables|dataSheets|skipped|dry):'
bundle: Practice
tables: [{"table":"PR_Patient","master":null,"columns":4,"lists":["BloodGroup"]},{"table":"PR_Visit","master":"PR_Patient","columns":5,"lists":[]},{"table":"PR_Medicine","master":"PR_Visit","columns":3,"lists":[]},{"table":"PR_Roo…
dataSheets: [{"sheet":"PR_Patient","rows":3},{"sheet":"PR_Room","rows":2}]
skipped: []
dry: true
```

Tanpa `dry=Y`, baris yang sama membuatnya: jendela, tab, daftar, entri menu, akses peran, lalu baris-baris lembar data. Jalankan untuk kedua kalinya dan tidak ada yang ditulis:

<!-- run: nx_run cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(windows|detailTabs|dataSheets|ops):'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(alreadyStaged|ops|summary):'
dataSheets: [{"sheet":"PR_Patient","rows":3,"loaded":3,"ops":3},{"sheet":"PR_Room","rows":2,"loaded":2,"ops":2}]
windows: [{"id":7100001,"name":"PR Patient"},{"id":7100004,"name":"PR Room"}]
detailTabs: 3
ops: 151
alreadyStaged: true
ops: 0
summary: this workbook is already staged (5 tables); nothing was written
```

Setiap tabel langsung berfungsi dengan verb `mis.*`. Rekaman di bawah sebuah master menyebut id master itu (`mis.read` pada master kemudian menunjukkan apa yang ada di bawahnya), dan nilai di luar daftar ditolak:

<!-- run: nx_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list'; eval "$D 'mis.list kind=PR_Patient'"; eval "$D 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'" | grep -E '^(number|id):'; eval "$D 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'" | grep -E '^(number|id):'; eval "$D 'mis.list kind=PR_Visit columns=Name,Fee,PR_Patient_ID'"; eval "$D 'mis.update kind=PR_Patient id=1 BloodGroup=Z'" | grep reason; rm -f Ninja_Practice.xlsx
PR_Patient_ID  Name
1              Aminah
2              Boon
3              Chandra
shown 3 of 3
number: Checkup
id: 1
number: Paracetamol
id: 1
Name     Fee  PR_Patient_ID
Checkup  50   1
shown 1 of 1
reason: BloodGroup Invalid value - Z - Reference_ID=200277 - A - AB - B - O; nothing was written
```

**Tabel yang sudah ada.** Bila buku kerja menyebut tabel yang sudah dimiliki sistem, tidak ada yang dibuat dua kali. Jika lembar memberi tabel itu sebuah `Master`, tabel itu dipakai ulang: kolom-kolom lembar ditambahkan padanya dan ia menjadi tab di bawah master tersebut. Jika lembar tidak memberinya `Master`, barisnya dibiarkan. Jawabannya mendaftar keduanya (`reused`, `leftAlone`). Inilah yang dilakukan Ninja milik iDempiere. Tabel yang dipakai ulang mempertahankan aturannya sendiri, sehingga rekamannya tetap harus mengisi kolom wajib milik tabel itu sendiri.

Tabel yang ditampilkan di dua jendela ditulis melalui jendelanya sendiri kecuali Anda menyebut yang lain dengan `window=` (namanya atau id-nya). Penolakan untuk kolom yang milik jendela lain memberi tahu Anda jendela mana yang harus disebut.

**Tab pada jendela yang sudah ada.** Sebuah `Master` tidak harus berupa tabel dalam buku kerja. Sebut tabel yang sudah dimiliki sistem dan tabel Anda menjadi tab pada jendela tabel ITU, sesudah tab-tab yang sudah ada, tanpa jendela atau entri menu sendiri. Buku kerja latihan melakukannya dengan satu baris: `PR_Referral`, yang `Master`-nya adalah `C_BPartner`, sehingga sebuah rujukan adalah tab pada jendela Business Partner. Ini juga aturan Ninja milik iDempiere:

<!-- run: nx_att cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_att.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_att.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(attached|detailTabs):'; eval "$D 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'" | grep -E '^(number|id):'; eval "$D 'mis.list kind=PR_Referral columns=Name,C_BPartner_ID names=Y'"; rm -f Ninja_Practice.xlsx
attached: [{"table":"PR_Referral","master":"C_BPartner","window":"Business Partner","windowId":123}]
detailTabs: 3
number: Checkup
id: 1
Name     C_BPartner_ID
Checkup  Standard
shown 1 of 1
```

Yang ditolaknya, tanpa menulis apa pun: buku kerja kedua yang menyebut tabel yang dibuat buku kerja lain, buku kerja yang seluruh tabelnya sudah ada tanpa master, sebuah `Master` yang bukan berada di dalam buku kerja maupun tabel yang punya jendela di sini, dan sebuah `ColumnSet` dengan awalan yang tidak dikenalnya. Lembar yang namanya tidak persis sama dengan nama sebuah tabel dilewati dan disebut dalam jawaban. `notChecked` pada jawaban mendaftar apa yang tidak dinilai.

### Satu tabel dari CSV biasa: `ninja.exec file=<Table>.csv`

Sebuah `.csv` sebagai ganti buku kerja adalah SATU tabel yang headernya adalah modelnya, dibaca seperti cara Ninja yang lebih lama membacanya. Tabelnya adalah nama berkas (`table=` menamai yang lain). Setiap sel header mengambil jenisnya dari namanya, menurut aturan pertama yang cocok: mengandung `Date` → tanggal; `Qty` → kuantitas; `Amount` → jumlah uang; diawali `Is` atau `In` → Ya/Tidak (jadi `Income` juga Ya/Tidak, seperti pada Ninja yang lebih lama); berakhiran `_ID` → lookup, yang selnya adalah Name dari rekaman; memuat `=` dan `/` (`Plan=Basic/Gold`) → daftar; selain itu → teks. Sel seperti `C_BPartner_ID>Value` atau `Code=X` membuat kolom sebelum `>` atau `=`. Baris-barisnya adalah rekamannya. Tabel dan barisnya dibuat bersamaan: jika satu baris tidak termuat, tidak ada yang dibuat dan jawabannya menyebut baris itu. Baris yang dua kolom pertamanya sudah ada dilewati, sehingga berkas yang sama dijalankan lagi tidak menulis apa pun, dan berkas dengan lebih banyak baris hanya menambah yang baru. Pada tabel yang sudah ada, berkas hanya menambah baris, dan header yang bukan kolom tabel itu ditolak.

<!-- run: nx_csv cut=200 -->
```text
$ printf 'Name,Join Date,Visits Qty,Fee Amount,IsMember,Plan=Basic/Gold\nAmir,2026-01-05,2,50,Y,Ba\nBea,2026-01-06,1,80,N,Go\n' > CL_Client.csv; rm -f /tmp/fast_guide_csv.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_csv.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^(tables|dataSheets):'; eval "$D 'mis.list kind=CL_Client columns=Name,JoinDate,VisitsQty,FeeAmount,IsMember,Plan'"; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^(ops|summary):'; printf 'Cara,2026-01-07,3,50,N,Ba\n' >> CL_Client.csv; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^summary:'; rm -f CL_Client.csv
tables: [{"table":"CL_Client","master":null,"columns":6,"lists":["Plan"]}]
dataSheets: [{"sheet":"CL_Client","rows":2,"loaded":2,"ops":2}]
Name  JoinDate             VisitsQty  FeeAmount  IsMember  Plan
Amir  2026-01-05 00:00:00  2          50         Y         Ba
Bea   2026-01-06 00:00:00  1          80         N         Go
shown 2 of 2
ops: 0
summary: every line of CL_Client.csv is there already (2 skipped); nothing was written
summary: 1 line loaded into CL_Client, 2 skipped (already there)
```

### Beri sebuah tabel kolom dokumen: `ninja.workflow`

Sebuah fitur dapat dinyalakan kemudian, untuk satu tabel, tanpa menyentuh buku kerja. `ninja.workflow` memberi sebuah tabel lima kolom dokumen (`DocStatus`, `DocAction`, `Processed`, `DocumentNo`, `IsApproved`) beserta daftar dan nilai bawaannya, menampilkannya pada tab-tabnya, dan mengisi rekaman yang sudah ada. Ia memeriksa dulu dan hanya menambah apa yang kurang, sehingga jalannya yang kedua tidak menulis apa pun:

<!-- run: nx_wf cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_wf.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_wf.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^ops:'; eval "$D 'mis.new kind=PR_Visit Name=Before PR_Patient_ID=1'" | grep -E '^number:'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(added|fields|rowsFilled|ops):'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(alreadyDone|ops):'; eval "$D 'mis.new kind=PR_Visit Name=After PR_Patient_ID=1'" | grep -E '^docStatus:'; eval "$D 'mis.list kind=PR_Visit columns=Name,DocStatus,DocAction,Processed'"; eval "$D 'erp.complete kind=PR_Visit id=1'" | grep reason; rm -f Ninja_Practice.xlsx
ops: 151
number: Before
added: ["DocStatus","DocAction","Processed","DocumentNo","IsApproved"]
fields: 5
rowsFilled: 1
ops: 11
alreadyDone: true
ops: 0
docStatus: DR
Name    DocStatus  DocAction  Processed
Before  DR         CO         N
After   DR         CO         N
shown 2 of 2
reason: Complete was not done: PR Visit has the document columns but no document class yet, so nothing says what Complete does on it (DocStatus stays DR)
```

Ia belum menyatakan apa yang dilakukan *Complete* pada tabel semacam itu: `notMade` pada jawaban menyebut apa yang masih kurang, dan `erp.complete` ditolak dengan kata-kata yang jelas sampai saat itu. Tabel yang datang bersama sistem ditolak.

### Batalkan sebuah bundle, dan tulis satu kembali sebagai buku kerja: `ninja.rollback`, `ninja.export`

Dua baris menutup lingkaran pada sebuah buku kerja. `ninja.rollback bundle=<name>` mematikan segala sesuatu yang dibuat sebuah buku kerja (jendela, tab, bidang, kolom, tabel, dan entri menunya, serta simpul menu milik bundle itu sendiri) dalam satu kelompok log. Seperti pada Ninja yang lebih lama, tabel yang menyimpan rekaman menghalanginya, dan ia menyebut tabel serta jumlah rekamannya; `dry=Y` menyebut apa yang akan dimatikan. Tabel yang datang bersama sistem tetap ada dan hanya kehilangan apa yang ditambahkan bundle padanya (tab pada Business Partner hilang, Business Partner tetap). Dijalankan dua kali, yang kedua tidak menulis apa pun; `ninja.exec` pada buku kerja yang sama sesudahnya mengembalikan bundle itu. `ninja.export` menulis sebuah bundle, sebuah jendela, atau sebuah tabel kembali sebagai buku kerja yang dibaca `ninja.exec`: tabel, tautan `Master`, kolom beserta jenisnya, dan nilai tiap daftar. Edit lembarnya lalu jalankan lagi, atau bawa modelnya ke mesin lain sebagai berkas. Ia hanya menulis model, tidak pernah baris; berkas yang sudah ada tidak pernah ditimpa; satu penyeleksi (`bundle=`, `window=` atau `table=`) wajib.

<!-- run: nx_rb cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_rb.ops Practice_out.xlsx; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_rb.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx data=N'" | grep -E '^ops:'; eval "$D 'ninja.export bundle=Practice file=Practice_out.xlsx'" | grep -E '^(file|lists|summary):'; eval "$D 'ninja.rollback bundle=Practice dry=Y'" | grep -E '^(dry|wouldSwitchOff):'; eval "$D 'ninja.rollback bundle=Practice'" | grep -E '^(ops|summary):'; eval "$D 'ninja.rollback bundle=Practice'" | grep -E '^(alreadyDone|ops):'; eval "$D 'ninja.export bundle=Practice file=Practice_out.xlsx'" | grep reason; rm -f Ninja_Practice.xlsx Practice_out.xlsx
ops: 151
file: Practice_out.xlsx
lists: 1
summary: wrote the model of 5 tables to Practice_out.xlsx
dry: true
wouldSwitchOff: 119
ops: 119
summary: Practice is rolled back: 119 dictionary rows switched off
ops: 0
alreadyDone: true
reason: Practice_out.xlsx exists already and is never overwritten. Nothing was written
```

Tidak dibawa oleh ekspor: aturan validasi dan callout (stager tidak pernah menuliskannya ke dalam model). Sebuah rollback mematikan baris, tidak menghapusnya, sehingga log menyimpan riwayatnya.

## Rekaman di bawah satu rekaman, dan sebuah lembar terhadap tabel: `master=`, `mis.diff`

`master=Table/record` pada `mis.list`, `mis.sum` atau `mis.group` hanya mempertahankan baris di bawah rekaman itu, yaitu baris yang ditampilkan sebuah tab di bawahnya: `mis.list kind=PR_Visit master=PR_Patient/Aminah` adalah kunjungan milik Aminah. Rekaman setelah garis miring adalah sebuah id, atau Document No, Name atau Value, dibaca seperti `mis.update number=` membacanya. Jawabannya sama dengan filter biasa `PR_Patient_ID=1`. Tabel yang bukan tab di bawah master itu ditolak dengan alasannya, begitu juga rekaman yang tidak ada atau nama yang dipakai bersama oleh dua rekaman (maka berikan id). Rekaman tanpa apa pun di bawahnya adalah nol yang sebenarnya, bukan pertanyaan kosong.

`mis.diff kind=<table> file=<sheet.csv>` membandingkan sebuah lembar dengan tabel sebelum Anda memuatnya, dan tidak menulis apa pun. Setiap baris lembar dicocokkan dengan Document No-nya, kalau tidak ada dengan Name, kalau tidak ada dengan Value (`key=` menyebut kolom lain), dan jawabannya mengurutkannya: `new` (tidak ada rekaman dengan kunci itu), `changed` (sebuah kolom berbeda; nilai tersimpan dan nilai lembar sama-sama ditampilkan), `same`, dan `missing` (rekaman aktif yang tidak disebut lembar). Kunci yang berulang dalam lembar, kunci yang cocok dengan beberapa rekaman, dan baris tanpa kunci disebut tersendiri dan tidak dibandingkan. Angka dianggap sama sebagai angka (`1200.50` dan `1200.5`), tanggal sama dengan tanggal tersimpan, dan sel lookup dibandingkan menurut nama rekaman yang ditunjuk id tersimpan. Apakah `mis.load` akan menemukan nama itu tidak ditanyakan di sini: `mis.load dry=Y` yang melakukannya.

<!-- run: mis_md cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; printf 'Name,BloodGroup\nAminah,A\nBoon,B\nDevi,O\n' > patients.csv; rm -f /tmp/fast_guide_md.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_md.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^ops:'; eval "$D 'mis.update kind=PR_Patient number=Aminah BloodGroup=A'" | grep -E '^changed:'; for v in 'Name=Checkup PR_Patient_ID=1 Fee=50' 'Name=Follow-up PR_Patient_ID=1 Fee=30' 'Name=Checkup PR_Patient_ID=2 Fee=50'; do eval "$D 'mis.new kind=PR_Visit $v'" | grep -E '^id:'; done; eval "$D 'mis.list kind=PR_Visit master=PR_Patient/Aminah columns=Name,Fee'"; eval "$D 'mis.sum kind=PR_Visit column=Fee master=PR_Patient/1'" | grep -E '^summary:'; eval "$D 'mis.group kind=PR_Visit by=Name master=PR_Patient/2'"; eval "$D 'mis.list kind=PR_Visit master=PR_Room/1'" | grep -E '^reason:'; eval "$D 'mis.diff kind=PR_Patient file=patients.csv'" | grep -E '^(new|changed|missing|ops|summary):'; rm -f Ninja_Practice.xlsx patients.csv
ops: 151
changed: ["bloodgroup"]
id: 1
id: 2
id: 3
Name       Fee
Checkup    50
Follow-up  30
shown 2 of 2
summary: 80 = sum of Fee over 2 PR Visit
Name     count
Checkup  1
shown 1 of 1
reason: PR Visit is not a detail of PR Room: it has no link column PR_Room_ID (the parent link of a tab). Nothing was listed
new: [{"row":3,"key":"Devi"}]
changed: [{"row":2,"key":"Boon","changes":[{"column":"BloodGroup","table":"","sheet":"B"}]}]
missing: ["Chandra"]
ops: 0
summary: 1 new, 1 changed, 1 the same, 1 in the table and not in the file; nothing was written
```

Tidak dibandingkan oleh `mis.diff`: kolom tabel yang tidak disebut lembar. Kuncinya satu kolom. Master dua tingkat ke atas (pasien dari sebuah obat) ditolak: ia bukan induk tab milik obat itu.

### Sebuah berkas baris MIS, dicoba lebih dulu: `--script … --dry`

Penyiapan yang ingin Anda ulangi (sebuah buku kerja, rekaman pertamanya, sebuah pemeriksaan) adalah berkas baris yang dijalankan dengan `--script`, seperti pada [Sebuah skrip](#a-script-several-lines-a-named-result): ia berhenti pada baris pertama yang tidak ok, dan baris sesudahnya tidak dijalankan. Tambahkan `--dry` untuk mencoba seluruh berkas lebih dulu. Berkas itu kemudian berjalan pada salinan sekali pakai dari op-log Anda (`BIM_OBJECT_OPLOG` harus menyebut namanya) dan dari berkas-berkas di folder ini, sehingga baris yang berikutnya melihat apa yang dibuat baris sebelumnya, persis seperti pada jalan yang sebenarnya, dan mendapat jawaban jalan yang sebenarnya. Pada akhirnya salinan itu dihapus: op-log, berkas, dan jurnal Anda tetap seperti sebelumnya. Berkas di subfolder tidak disalin. Baris yang bertindak di luar op-log (sebuah sesi Modeller, sebuah server legacy, sebuah pack) tidak dapat ditahan, sehingga pada dry run ia ditolak dan berkas berhenti di situ.

<!-- run: script_dry cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; printf -- '-- the tables, a patient, a visit of hers, and the fees under her\nninja.exec file=Ninja_Practice.xlsx data=N\nmis.new kind=PR_Patient Name=Devi BloodGroup=O\nmis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50\nmis.sum kind=PR_Visit column=Fee master=PR_Patient/Devi\n' > setup.door; rm -f /tmp/fast_guide_dry.ops; export BIM_OBJECT_OPLOG=/tmp/fast_guide_dry.ops; node common/door/door.js --list --script setup.door --dry | grep -E '^(tablesMade|id|summary):'; test -e /tmp/fast_guide_dry.ops && echo 'op-log: written' || echo 'op-log: not written'; node common/door/door.js --list --script setup.door | grep -E '^summary:'; echo "op-log: $(wc -l < /tmp/fast_guide_dry.ops) ops"; rm -f Ninja_Practice.xlsx setup.door
tablesMade: 5
id: 1
id: 1
summary: 50 = sum of Fee over 1 PR Visit
op-log: not written
summary: 50 = sum of Fee over 1 PR Visit
op-log: 153 ops
```

## Lembar ringkas: latihan baris-baris MIS

Semua yang ada di sini adalah latihan pada **salinan Anda sendiri**: baris pertama menyebut sebuah berkas yang menyimpan apa yang Anda lakukan, dan tidak ada yang sampai ke pembukuan perusahaan sungguhan. Hapus berkas itu untuk memulai lagi dari nol. Jalankan baris-barisnya dari folder yang berisi `common/` (sebuah checkout `bim-ootb`).

| Langkah | Ketik ini | Hasilnya |
|---|---|---|
| Siapkan | `export BIM_OBJECT_OPLOG=~/practice.ops` | setiap baris di bawah ini sekarang menyimpan pekerjaannya di berkas itu |
| Mulai dari awal | `rm -f ~/practice.ops` | latihan yang kosong lagi |
| Persingkat pengetikan | `alias d='node common/door/door.js --list'` | lalu sebuah baris menjadi `d '<verb> <inputs>'` |
| Tanyakan apa yang ada | `d 'help all'` | setiap verb beserta inputnya |
| Buat lima tabel | `cp common/door/samples/Ninja_Practice.xlsx . ; d 'ninja.exec file=Ninja_Practice.xlsx'` | pasien, kunjungan, obat, ruangan, dan rujukan, dengan 3 pasien dan 2 ruangan yang termuat |
| Coba sebelum membuat | `d 'ninja.exec file=Ninja_Practice.xlsx dry=Y'` | apa yang akan dibuat; tidak ada yang ditulis |
| Buat satu tabel | `d 'mis.add_window file=AST_Asset.csv'` | satu jendela dari sebuah `.csv` berisi kolom-kolomnya (bagian di atas) |
| Daftar | `d 'mis.list kind=PR_Patient'` | baris-barisnya |
| Daftar beberapa kolom | `d 'mis.list kind=PR_Visit columns=Name,Fee'` | hanya kolom-kolom itu |
| Apa yang dapat dimuatnya | `d 'mis.describe kind=PR_Patient'` | kolom, jenis, dan daftarnya |
| Tambah | `d 'mis.new kind=PR_Patient Name=Devi BloodGroup=O'` | sebuah rekaman baru dan id-nya |
| Tambah di bawah sebuah master | `d 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'` | sebuah kunjungan milik pasien 1 |
| Tambah satu tingkat lebih jauh | `d 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'` | sebuah obat milik kunjungan 1 |
| Baca satu beserta isi di bawahnya | `d 'mis.read kind=PR_Patient id=1'` | pasien dan kunjungan-kunjungannya |
| Ubah | `d 'mis.update kind=PR_Patient id=1 BloodGroup=AB'` | rekaman yang telah diubah |
| Lihat sebuah penolakan | `d 'mis.update kind=PR_Patient id=1 BloodGroup=Z'` | ditolak: `Z` tidak ada dalam daftar |
| Hapus | `d 'mis.delete kind=PR_Room id=2'` | rekaman itu hilang |
| Jumlahkan | `d 'mis.sum kind=PR_Visit column=Fee'` | totalnya |
| Hitung menurut sebuah kolom | `d 'mis.group kind=PR_Patient by=BloodGroup'` | jumlah per nilai |
| Muat banyak baris | `d 'mis.load kind=PR_Room file=rooms.csv'` | sebuah pratinjau; tambahkan `dry=N` untuk memuat |
| Bekerja di layar | `node common/door/mis.js kind=PR_Patient` | sebuah daftar yang Anda gerakkan dengan tombol; `+` menambah, Enter mengedit |
| Sebagai peran lain | tambahkan `role=102` ke sebuah baris | apa yang boleh dilihat dan dilakukan peran itu |
| Tambah di bawah tabel milik sistem | `d 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'` | sebuah rujukan pada mitra bisnis 112 (sebuah tab pada jendela Business Partner) |
| Beri sebuah tabel kolom dokumen | `d 'ninja.workflow table=PR_Visit'` | sebuah status pada setiap kunjungan (`DR`), yang lama dan yang baru |
| Batalkan bundle sebuah buku kerja | `d 'ninja.rollback bundle=Practice'` | segala yang dibuatnya dimatikan (terhalang selama sebuah tabel menyimpan rekaman); `dry=Y` dulu |
| Tulis sebuah bundle kembali sebagai buku kerja | `d 'ninja.export bundle=Practice file=Practice_out.xlsx'` | modelnya, untuk diedit dan dijalankan lagi |
| Di bawah satu rekaman | `d 'mis.list kind=PR_Visit master=PR_Patient/1'` | hanya kunjungan milik pasien 1; juga pada `mis.sum` dan `mis.group` |
| Bandingkan sebuah lembar sebelum memuat | `d 'mis.diff kind=PR_Patient file=patients.csv'` | baris baru, berubah, sama, dan hilang; tidak ada yang ditulis |
| Biarkan sebuah Modeller terbuka | `d 'model.open sheets=shed type="Farming Shed" file=shed.db'` lalu `d model.convert`, `d 'model.addbay end=high'`, `d model.undo`, `d model.close` | lembar 2D dijadikan 3D, satu bay ditambah lalu ditarik kembali; setiap baris beberapa detik; close menyimpan ke shed.db |
| Simpan model sekarang | `d model.save` (atau `d 'model.save file=shed.db'` pada kali pertama) | pemeriksaan clash, lalu shed.db ditulis; ditolak selama clash RED masih ada |
| Tutup tanpa menyimpan | `d 'model.close discard=Y'` | perubahan dibuang dengan sengaja (close biasa ditolak bila tidak ada berkas simpan) |
| Coba seluruh berkas lebih dulu | `node common/door/door.js --list --script setup.door --dry` | jawaban asli setiap baris; tidak ada yang disimpan (memerlukan `BIM_OBJECT_OPLOG`) |
| Satu tabel dari sebuah CSV | `d 'ninja.exec file=CL_Client.csv'` | tabel dari headernya, barisnya dimuat; dijalankan lagi, hanya baris baru yang dimuat |
| Menu di layar | `d menu` (atau `d 'menu role=102'`) | menu ERP; Enter membuka daftar sebuah jendela, Esc kembali, `/` mencari |
| Cari sebuah entri menu | `d 'mis.menu role=102 find=partner'` | entri yang namanya memuat "partner", beserta folder-foldernya |
| Bekerja di jendela lain | tambahkan `window=<name or id>` ke `mis.new`, `mis.update` atau `mis.delete` | bidang-bidang tab jendela itu, untuk tabel yang ditampilkan di dua jendela |

**Kecepatan.** Setelah sebuah buku kerja besar, pintu menyimpan sebuah citra dari apa yang telah dibuat op-log, sehingga baris berikutnya tidak menerapkan ulang setiap op; citra itu dipakai hanya selama berkas op-log Anda masih diawali persis seperti semula, dan `ERP_OPIMAGE=off` mematikannya.

Sebuah buku kerja milik Anda sendiri: salin berkas latihan, ganti baris-baris `2_RO_ModelMaker` dengan tabel Anda (awalan milik Anda sendiri, seperti `MY_`, memisahkannya dari tabel yang sudah ada; nama yang sudah dimiliki sistem dipakai ulang, tidak dibuat dua kali), dan jalankan `ninja.exec` padanya dengan `dry=Y` lebih dulu. Baris-baris pada tabel ini adalah verb yang ditunjukkan berjalan di bagian-bagian di atas; tabelnya sendiri tidak dijalankan ulang oleh pengujian halaman ini, yang dijalankan ulang adalah blok-blok abu-abu.

## Bekerja di terminal: `mis.js`

Jika Anda lebih suka memilih daripada mengetik, `mis.js` menampilkan sebuah daftar dengan sebuah penunjuk. Ia hanya sebuah front end: setiap tombol dikompilasi menjadi **satu** dari baris pintu di atas, berjalan melalui pintu yang sama (dijurnal, diperiksa klaimnya), dan layar mencetak baris itu sebelum menjalankannya. Up dan Down menggerakkan penunjuk. Left dan Right bergerak di sepanjang tombol pada baris yang ditunjuk (`[U Edit] [D Delete] [C Copy]` untuk sebuah rekaman; untuk sebuah dokumen, tindakan yang kini diizinkan mesin, seperti `[C Complete] [V Void]`, dan tidak ada Delete setelah dokumen selesai). Enter menjalankan tombol yang disorot. `+` memulai rekaman baru, Delete menanyakan `y/N`, dan Esc mundur dan tidak menulis apa pun.

Pada terminal, ia menggambar dengan tombol panah. Dengan `--plain`, ia membaca nama tombol dari sebuah pipe, sehingga sebuah skrip, sebuah pembaca layar, dan sebuah AI melihat persis apa yang dilihat seseorang:

<!-- run: mis_screen cut=150 -->
```text
$ printf 'Down Right Esc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner name=Standard limit=3 --plain 2>/dev/null
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=3 offset=0 name=Standard
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
 > 112            Standard  Standard           Standard Customers >[U Edit]< [D Delete] [C Copy]
   1300112        Standard  Standard           Standard Customers
the line it will run: mis.read kind=C_BPartner id=112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Down
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers >[U Edit]< [D Delete] [C Copy]
the line it will run: mis.read kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Right
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers [U Edit] >[D Delete]< [C Copy]
the line it will run: mis.delete kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Esc
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers [U Edit] >[D Delete]< [C Copy]
the line it will run: mis.delete kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
```

Tambahkan `role=103` pada perintah dan setiap baris yang dikirim layar membawa peran itu; baris kepala menyebutnya. Tanpa peran, baris kepala menyatakan bahwa tidak ada yang disaring.

Sebuah form hanya menanyakan apa yang tidak dapat diisi mesin (dry run di atas). Mengetik mengisi bidang, Tab atau Enter melanjutkan, dan Enter pada bidang terakhir menampilkan satu baris yang akan dijalankannya. Baris yang diawali `=` adalah teks yang diketik. Inilah seluruh sesinya, diringkas menjadi baris pintu yang dijalankannya:

<!-- run: mis_form cut=200 -->
```text
$ printf '+\n=GD300\nTab\n=Guide Four\nEnter\ny\nEsc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner value=GD300 --plain 2>/dev/null | grep '^->'
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
-> mis.new kind=C_BPartner dry=Y
-> mis.new kind=C_BPartner Value=GD300 Name="Guide Four"
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
```

Edit bekerja dengan cara yang sama: ia hanya menampilkan kolom yang boleh diedit seseorang menurut jendela, dengan lookup sebagai nama, dan hanya mengirim apa yang Anda ubah. Copy memulai rekaman baru dari rekaman yang ditunjuk, sehingga Anda harus mengubah apa yang harus unik (duplikat ditolak dan ketikan Anda dipertahankan). Atur `MIS_SESSION_FILE=session.door` dan sebuah sesi terminal mencatat baris yang dijalankannya, satu per baris, sebagai skrip yang dapat Anda baca dan jalankan lagi.

### Menu di layar: `menu` dan `mis.menu`

`node common/door/door.js menu` (dengan alias dari lembar ringkas, `d menu`; di shell red1, `menu`) membuka menu ERP di terminal, menu yang sama dengan yang ditampilkan ERP di browser, dengan folder yang sama dalam urutan yang sama. Tambahkan sebuah peran (`d 'menu role=102'`) dan Anda hanya melihat apa yang boleh dibuka peran itu. Up dan Down, atau sebuah angka, memilih sebuah entri; Enter membuka sebuah folder, atau layar daftar sebuah jendela (layar `mis.js` di atas, pada tabel milik tab pertama jendela itu); Esc kembali naik, dan dari puncak ia keluar; `/` mencari sebuah entri menurut nama; `?` menampilkan tombol-tombolnya. Sebuah proses, laporan, atau form menyatakan bahwa ia terbuka di ERP browser, dan tidak menjalankan apa pun. Seperti di mana-mana pada halaman ini, layar hanya mengetikkan baris pintu untuk Anda, dan mencetak setiap baris sebelum menjalankannya (baris `->`), sehingga apa yang Anda lakukan di layar dapat juga Anda ketik, atau Anda taruh dalam sebuah skrip.

Menu itu sendiri adalah sebuah baris pintu, `mis.menu [role=] [find=]`. Di sini layar dikendalikan dengan tombol yang diketik (`--plain` membacanya dari input), mencari "partner" dan membuka kecocokan ketiga:

<!-- run: menu_screen cut=200 -->
```text
$ rm -f /tmp/fast_guide_menu.ops; printf '/\n=partner\nEnter\n3\nEsc\nEsc\nq\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_menu.ops node common/door/door.js 'menu role=102' --plain | grep -E '^(-> |key |Menu|find|> )'
-> mis.menu role=102
Menu   (role 102)   294 windows
> 1  ▸ System Admin
key /
Menu   (role 102)   294 windows
> 1  ▸ System Admin
find: _   (Enter search, Esc cancel)
key =partner
Menu   (role 102)   294 windows
> 1  ▸ System Admin
find: partner_   (Enter search, Esc cancel)
key Enter
-> mis.menu find=partner role=102
find "partner"   (role 102)   294 windows
> 1    System Admin > Data > Data Import > Import Business Partner
key 3
-> (open Business Partner Group: the list screen on C_BP_Group)
-> mis.describe kind=C_BP_Group role=102
-> mis.list kind=C_BP_Group columns=C_BP_Group_ID,Value,Name,Description names=Y limit=10 offset=0 role=102
key Esc
find "partner"   (role 102)   294 windows
> 3    Partner Relations > Business Partner Rules > Business Partner Group
key Esc
Menu   (role 102)   294 windows
> 1  ▸ System Admin
key q
Menu   (role 102)   294 windows
> 1  ▸ System Admin
```

## Pilih cara jawaban ditampilkan, dan simpan

Balasan berupa envelope JSON kecuali Anda meminta yang lain. Tiga saklar menampilkan baris-baris sebuah jawaban sebagai sesuatu yang dapat dibaca seseorang atau sebuah spreadsheet; envelope tetap menjadi yang dicatat pintu:

- `--list`: tabel yang rata, diakhiri `shown N of TOTAL`. Balasan yang berupa satu rekaman menampilkan baris `field: value`.
- `--csv`: baris-barisnya sebagai CSV (RFC 4180: sel yang berisi koma, tanda kutip, atau baris baru diberi tanda kutip; angka persis seperti yang dikembalikan mesin).
- `--out FILE` menulis bentuk yang dipilih ke sebuah berkas di folder saat ini sebagai ganti layar. Baris yang ditolak, ditahan, atau inconclusive tidak menulis berkas dan menyatakannya.

<!-- run: csv_orders -->
```text
$ node common/door/door.js --csv 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo,DocStatus,GrandTotal
80001,CO,100.7
80001,CO,100.7
800002,CO,2160
```

Dalam sebuah skrip, akhiri sebuah baris dengan `> file` untuk mengirim jawaban baris itu ke sebuah berkas di folder skrip (`>> file` menambahkannya). Bentuknya mengikuti namanya: `.csv` adalah CSV, `.json` adalah envelope, yang lain adalah daftar. Jalur yang keluar dari folder skrip ditolak.

Saklar-saklar ini berada di berkas kelima, `render.js`; letakkan di samping `door.js` bila Anda memakainya dari sebuah unduhan:

```text
curl -O https://red1oon.github.io/bim-ootb/common/door/render.js
```

## Tanyakan kepada pintu: `help`

Ketik `help` untuk melihat perintah umum, masing-masing sebagai baris yang dapat Anda jalankan. `help erp` mendaftar setiap verb dari satu aplikasi, `help erp.find` menampilkan satu verb secara utuh (apa yang dilakukannya, setiap input, apa yang boleh diubahnya, siapa yang boleh menjalankannya), dan `help all` mendaftar semuanya. Help dihasilkan dari daftar verb yang sama dengan tabel di bawah, tidak membaca apa pun, tidak menjalankan apa pun, dan tidak dicatat dalam jurnal.

<!-- run: help_verb -->
```text
$ node common/door/door.js 'help erp.find'
erp.find — Find a document

Find a document by its number, the way a window's Find does (DocumentNo, else Name or Value). Returns every match with its key, DocStatus and DocAction. Nothing is changed. Kinds: any document table of the dictionary (34).

Inputs:
  kind (required, string) e.g. Order — The kind of document, as the dictionary names it (an AD_Table with a DocAction column), e.g. "Order". 34 kinds exist; an unknown kind or a table that is not a document is refused naming the reason.
  number (required, string) e.g. 50000 — The document number (DocumentNo) as shown in the window; if two documents carry it, name one with id.

Harm: read (reads only)
Who may run it: human, ai
Example: erp.find kind=Order number=50000
```

## Untuk pengembang: periksa kembaran terhadap legacy

Verb-verb ini untuk orang yang menjaga kembaran ERP tetap sama dengan iDempiere yang asli. Mereka memerlukan sebuah checkout bim-ootb, dan untuk keempat yang pertama, tumpukan uji legacy yang berjalan (sebuah Postgres docker dan server pilot) serta sumber iDempiere di sampingnya. Bila ada bagian yang hilang, mereka menjawab `inconclusive` dan menyebut bagian mana: mereka tidak pernah menjawab daftar kosong atau "sama" untuk sesuatu yang tidak dapat mereka lihat.

`legacy.status` menanyakan apakah tumpukan itu hidup. Ia tidak memulai apa pun; bila ada yang mati, ia mencetak perintah yang memulainya:

<!-- run: legacy_status -->
```text
$ node common/door/door.js --list 'legacy.status'
verdict: UP
postgres: {"container":"postgres","database":"idempiere_pilot","state":"ready"}
pilot: {"url":"http://localhost:8088/webui/","http":200,"state":"up"}
summary: legacy UP: postgres ready, pilot up
next: []
```

`erp.column` menjawab "siapa yang mengisi kolom ini", dari kamus kembaran dan legacy berdampingan: nilai bawaan kolom, aturan validasi, nilai bawaan bidang, dan nilai bawaan login (iDempiere memasukkan baris `IsDefault` dari tabel yang dirujuk ke dalam konteks saat login). Bila kedua sisi tidak sepakat, ia menyatakan `DIFFERENT` dan bagian mana:

<!-- run: column_docaction -->
```text
$ node common/door/door.js --list 'erp.column kind=Order column=DocAction'
kind: Order
table: C_Order
column: DocAction
twin: {"found":true,"table":"C_Order","column":"DocAction","reference":28,"mandatory":"Y","updateable":"Y","defaultValue":"CO","validationRule":null,"fieldDefaults":[],"loginDefault":null,"filledBy":"the column default CO"}
legacy: {"found":true,"table":"C_Order","column":"DocAction","reference":28,"mandatory":"Y","updateable":"Y","defaultValue":"CO","validationRule":null,"fieldDefaults":[],"loginDefault":null,"filledBy":"the column default CO"}
differs: []
verdict: SAME
notChecked: []
summary: C_Order.DocAction: SAME; twin fills it by the column default CO; legacy by the column default CO
```

`idempiere.where` mencari sebuah nama dalam sumber iDempiere dan menjawab berkas, baris, dan teks baris itu, sehingga klaim tentang perilaku legacy dapat mengutip dari mana asalnya. Ia menampilkan 25 baris kecuali `limit` menyatakan lain dan selalu memberi total; `in=callout` hanya mempertahankan berkas yang jalurnya memuat teks itu:

<!-- run: where_invoicerule -->
```text
$ node common/door/door.js --list 'idempiere.where symbol=InvoiceRule in=CalloutOrder limit=2'
symbol: InvoiceRule
hits: [{"file":"org.adempiere.base.callout/src/org/compiere/model/CalloutOrder.java","line":50,"text":"*\t\t- InvoiceRule/DeliveryRule/PaymentRule"},{"file":"org.adempiere.base.callout/src/org/compiere/model/CalloutOrder.java","line":131,"text":"mTab.setValue (\"InvoiceRule\", X_C_Order.INVOICERULE_Immediate);"}]
shown: 2
total: 20
files: 1
verdict: OK
summary: InvoiceRule: 20 lines in 1 files (showing 2)
```

Tiga verb lain berada di samping ini. `legacy.query table=c_order ad_client_id=11 limit=5` membaca baris dari tabel legacy (baca-saja; tabel dan setiap kolom diperiksa terhadap kamus legacy, dan total selalu diberikan). `erp.compare kind=Order number=50000 legacy=50981` membaca satu rekaman pada kembaran dan yang cocok pada legacy lalu membandingkannya sel demi sel; sel yang kosong pada legacy dan berisi nilai bawaan pada kembaran diberi label `NULL-VS-DEFAULT` dan tidak ada yang dikatakan tentang sebabnya. `witness.run name=erp_new` menjalankan sebuah witness dari pohon kode, menyimpan seluruh lognya, dan menjawab baris putusannya sendiri (PASS, FAIL atau INCONCLUSIVE); witness yang tidak mencetak baris putusan adalah error, karena kode keluar bukan bukti, dan `witness.last` membaca jalan terakhir yang tercatat tanpa menjalankannya lagi.

### Buat sebuah plugin untuk iDempiere legacy (OSGi dan 2Pack)

Untuk orang yang memasang model data ERP pada server iDempiere yang sungguhan. Model data itu adalah sebuah buku kerja (Excel): satu lembar per tabel Application Dictionary (`AD_Table`, `AD_Column`, `AD_Window`, `AD_Tab`, `AD_Field`, `AD_Menu`, dan seterusnya), satu baris per rekaman, baris pertama berisi nama kolom AD, dan sebuah kolom `Key` yang menamai setiap baris. Sel yang menunjuk ke baris lain dalam buku kerja berbunyi `ref:<Key>`; sel yang menunjuk ke baris yang sudah dimiliki server berbunyi `existing:AD_Table:C_ProjectTask`. Sebuah lembar `Plugin` membawa id, versi, dan deskripsi plugin. Contoh yang dikerjakan adalah model BIM Document, `erp/plugins/models/BIM_Document.xlsx` di repositori `bim-ootb`.

Dua hal dibuat dari satu buku kerja itu, dan keduanya dipisahkan:

| Dibuat | Isinya | Tujuannya |
|---|---|---|
| **Zip 2Pack** | Hanya metadata: baris-baris kamus, dan *nama* kelas dari setiap proses. Tidak ada kode program. Sebuah versi pack diterapkan sekali dan tidak pernah diubah, sehingga versi yang sama dengan baris yang berbeda ditolak | Folder `META-INF` milik plugin, tempat pack activator milik iDempiere sendiri mengambilnya ketika plugin dimulai |
| **Kelas model Java** | `I_<Table>` dan `X_<Table>` untuk setiap tabel yang dibuat buku kerja, dalam bentuk yang ditulis generator milik iDempiere sendiri | Folder `src` milik plugin |

Yang tidak dapat dibuat oleh buku kerja adalah aturannya: aksi dokumen milik tabel, dan kode proses apa pun. Itu ditulis dengan tangan di folder `src` milik plugin, seperti pada plugin iDempiere mana pun.

Verb pintu `erp.pack book=<workbook.xlsx> version=<x.y.z> out=<plugin>/META-INF` hanya menulis zip-nya, dan menjawab sha256-nya, jumlah baris per tabel kamus, dan nama kelas proses yang ditunjuknya. Dijalankan lagi dengan versi dan baris yang sama, ia menjawab `unchanged`; versi yang sama dengan buku kerja yang diedit ditolak, karena pack yang sudah dirilis tidak pernah diubah. Tambahkan `java=<plugin>/src package=<java package>` dan kelas model Java juga ditulis. Seseorang yang menjalankannya; panggilan oleh AI ditahan sebagai klaim sampai seseorang mengonfirmasi. Skrip di baliknya tetap `node erp/tools/xlsx_pack.js`, yang mencetak baris `§XLSX-PACK` untuk setiap berkas yang ditulisnya. Verb kedua, `erp.legacy_plugin book=<workbook.xlsx> version=<x.y.z>`, adalah seluruh rutenya pada instance uji legacy lokal dalam satu baris. Ia menjalankan lima baris, dan yang pertama yang tidak ok menghentikannya: `legacy.up` (jalankan Postgres docker bersama bila sedang berhenti), `erp.pack` (buat zip), `legacy.refresh` (bangun ulang basis data uji dari seed dasar, pasang plugin, jalankan server dan tunggu sampai pack terpasang, sekitar dua menit), `legacy.check` (baca setiap baris buku kerja kembali dari basis data uji dengan SQL) dan `legacy.witness` (jalankan pemeriksaan di dalam server melalui konsol server dan jawab putusan serta jumlahnya). Setiap langkah dapat dijalankan sendiri. Instance, basis datanya, dan skripnya tetap: tidak ada yang diambil dari pemanggil, dan basis data pilot ditolak. Seseorang yang menjalankannya; panggilan oleh AI ditahan sebagai klaim sampai seseorang mengonfirmasi.

`legacy.check` adalah yang baca-saja, dan ia menjawab berapa banyak baris dari setiap jenis yang ditemukan dibandingkan dengan berapa yang dimuat buku kerja:

<!-- run: legacy_check -->
```text
$ node common/door/door.js --list 'legacy.check book=erp/plugins/models/BIM_Document.xlsx'
database: idempiere_bimdoc
book: erp/plugins/models/BIM_Document.xlsx
checks: [{"what":"AD_Table rows","expected":1,"found":1,"ok":true},{"what":"physical tables","expected":1,"found":1,"ok":true},{"what":"AD_Column rows","expected":34,"found":34,"ok":true},{"what":"AD_Window rows","expected":1,"found":1,"ok":true},{"what":"AD_Tab rows","expected":3,"found":3,"ok":true},{"what":"AD_Menu rows","expected":1,"found":1,"ok":true},{"what":"AD_Process rows with the same class name","expected":2,"found":2,"ok":true},{"what":"AD_Reference rows","expected":4,"found":4,"ok":true}]
pack: {"compared":false,"note":"no version given: the installed pack was not compared with a fresh one"}
missing: []
verdict: ALL-FOUND
summary: test DB idempiere_bimdoc: ALL-FOUND (8/8 kinds of row); no version given: the installed pack was not compared with a fresh one
```

Beri juga `version=<x.y.z>` dan ia membandingkan 2Pack yang terpasang di plugin dengan pack yang baru dibuat dari buku kerja, dan menyatakan dengan jelas bila keduanya berbeda: refresh memasang bundle plugin sebagaimana yang di-commit, sehingga keduanya dapat bergeser sampai bundle dibangun ulang.

## Pertanyaan Viewer dari unduhan biasa

Dua verb Viewer, `viewer.counts` dan `viewer.clashes`, juga berfungsi tanpa checkout. Letakkan dua berkas lagi di samping keempat berkas tadi:

```text
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_verbs.js
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_driver.js
```

Tanpa berkas halaman di disk Anda, alat itu membuka halaman Viewer yang aktif dengan bangunan yang disajikan situs, di browser tersembunyi pada prosesor, dan bertanya kepada panel Find (Cari) milik Viewer sendiri. `page` pada jawaban menyatakan halaman mana yang dipakai:

<!-- run: viewer_flat -->
```text
$ node door.js 'viewer.counts building=Duplex' | grep -o '"summary":"[^"]*"\|"page":"[a-z]*"'
"summary":"1119 elements: MEP 904, ARC 196, STR 19"
"page":"live"
```

Memakan waktu sekitar setengah menit. Angkanya adalah angka bangunan yang disajikan, sehingga bisa berbeda dari salinan yang lebih lama dalam sebuah checkout. Verb jadwal, `viewer.film_path`, verb objek, dan `modeller.walk` masih memerlukan checkout; tabel menyebutkan yang mana.

## Shell red1: kata-kata pendek pada satu prompt {#the-red1-shell-short-words-at-one-prompt}

`red1` adalah pintu bagi orang di depan papan ketik. Ketik `node common/door/red1.js` (atau `red1`, setelah `npm link` sekali di dalam checkout) dan Anda mendapat prompt `red1>`. Setiap kata pendek menjadi SATU baris pintu, dan baris itu dicetak, setelah `→`, sebelum dijalankan. Jadi shell mengajarkan baris lengkapnya sambil jalan, dan sebuah skrip atau sebuah AI dapat menjalankan baris yang sama tanpa shell sama sekali. Baris pintu lengkap yang diketik pada prompt tetap berfungsi apa adanya.

`cd` menyatakan di mana Anda berada, sehingga Anda tidak mengulanginya: sebuah bangunan (`cd Duplex`), satu jenis di dalamnya (`cd Element`), atau satu jenis ERP (`cd Order`). Prompt menampilkannya (`red1 Duplex/Element>`), dan `pwd` mencetaknya sebagai kunci pintu. Pada sekali jalan, `;` memisahkan kata-katanya:

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Kata-kata yang sama yang diketik ke prompt (di sini dialirkan dari sebuah pipe, sehingga jawabannya dicetak, tidak digambar):

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

**Cari, dengan wildcard.** `*` adalah sebarang rangkaian karakter, `?` satu karakter, `[abc]` salah satunya; huruf besar tidak berpengaruh. Pada sebuah jenis, sebut kolomnya: `ls element_name=*bath*`. Filter yang sama berfungsi pada setiap verb daftar (`mis.list`, `object.list`, `object.count`), untuk tabel ERP seperti untuk bangunan. Nilai tanpa wildcard tetap merupakan kecocokan persis.

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

**Clash, digambar.** `clash ARC MEP` dalam sebuah bangunan bertanya kepada Viewer dan menggambar angka-angka milik jawaban itu sebagai corong (digambar hanya bila bagian-bagiannya berjumlah pas). `ls` kemudian mendaftar baris clash dari jawaban yang sama, tanpa bertanya lagi, dan `ls *Bath*` mempertahankan baris yang sebagian selnya cocok. Diketik sendirian, `clash` membuka menu disiplin bangunan (tombol panah atau sebuah angka, lalu Return; Esc membatalkan). Dalam sebuah sesi, halaman Viewer tetap terbuka, sehingga setelah baris pertama sebuah clash dijawab dalam sekitar satu detik.

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

**Apa yang boleh dilakukan sebuah dokumen berikutnya.** Pada sebuah jenis ERP, `next <number>` menggambar tindakan yang kini diizinkan mesin, dan menunjuk setiap tindakan yang memiliki sebuah kata ke baris yang menjalankannya:

<!-- run: red1_next -->
```text
$ printf 'cd Order\nnext S00002\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
→ erp.actions kind=Order number=S00002
ok · erp.actions
Order S00002  status DR
├─ CO  → do complete S00002
├─ PR  (no red1 word for it yet)
└─ VO  → do void S00002
```

`help` mendaftar kata-katanya; `help verbs` mendaftar setiap verb pintu. **Dari JavaScript**, verb yang sama adalah satu objek, dihasilkan dari kosakata (sebuah verb baru tidak memerlukan kode baru):

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Batas.** Kata-kata objek (`cd Element`, `ls`, `group`) memerlukan model yang membawa kamus objek; dari bangunan-bangunan di sini, hanya Duplex yang memilikinya. Daftar yang lebih tinggi dari terminal berhenti di setiap halaman (Space, q); sebuah pipe mendapat setiap baris.

## Daftar verb {#the-verbs}

Tabel ini **dihasilkan dari berkas kosakata** (`common/door/verbs.json`) dan sebuah pengujian memeriksa bahwa keduanya cocok, verb demi verb. Ini adalah daftar yang sama yang menjadi dasar menu alat milik AI. *Harm* (bahaya) dijelaskan di atas; *Needs* (kebutuhan) menyatakan mana dari kedua unduhan itu yang menjalankan verb.

<!-- GEN:verbs -->
| Verb | Fungsinya | Input | Bahaya | Siapa yang boleh memakainya | Memerlukan |
|---|---|---|---|---|---|
| `modeller.lines` | Membaca grid | `building` | read | human, ai | unduhan 4 berkas |
| `modeller.try_shift` | Mencoba menggeser sebuah garis grid | `building`, `line`, `move` (meter) | trial | human, ai | unduhan 4 berkas |
| `viewer.counts` | Menghitung elemen | `building`, `by` (opsional) | read | human, ai | 4 berkas + 2 berkas Viewer |
| `viewer.clashes` | Mendaftar clash antara dua disiplin | `building`, `discA`, `discB`, `rows` (opsional) | read | human, ai | 4 berkas + 2 berkas Viewer |
| `viewer.film_path` | Visibilitas jalur film | `db`, `path` (opsional) | read | human, ai | checkout bim-ootb |
| `viewer.schedule_at` | Keadaan jadwal pada suatu hari | `building`, `day` (nomor hari) | read | human, ai | checkout bim-ootb |
| `viewer.schedule_compare` | Mesin jadwal terhadap acuannya | `building`, `shift_hours` (jam) (opsional) | read | human, ai | checkout bim-ootb |
| `modeller.widen_bay` | Melebarkan sebuah bay ke lebar sasaran | `building`, `from`, `to`, `target` (meter) | trial | human, ai | unduhan 4 berkas |
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
| `erp.find` | Mencari sebuah dokumen | `kind`, `number` | read | human, ai | checkout bim-ootb |
| `erp.actions` | Apa yang dapat dilakukan pada sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | read | human, ai | checkout bim-ootb |
| `erp.complete` | Menyelesaikan sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | posts | human, ai | checkout bim-ootb |
| `erp.void` | Membatalkan (void) sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | writes | human, ai | checkout bim-ootb |
| `erp.close` | Menutup sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | writes | human, ai | checkout bim-ootb |
| `erp.reverse` | Membalik - Mengoreksi sebuah dokumen | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | posts | human, ai | checkout bim-ootb |
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
| `erp.column` | Siapa yang mengisi sebuah kolom: kembaran dan legacy berdampingan (nama lama dari mis.column) | `kind`, `column` | read | human, ai | checkout bim-ootb |
| `erp.compare` | Membandingkan satu rekaman pada kembaran dan pada legacy (nama lama dari legacy.compare) | `kind`, `number`, `legacy` (opsional) | read | human, ai | checkout bim-ootb |
| `erp.pack` | Membuat zip 2Pack dari buku kerja model data (nama lama dari mis.pack) | `book`, `version`, `out` (opsional), `java` (opsional), `package` (opsional) | writes | human, ai | checkout bim-ootb |
| `erp.legacy_plugin` | Memasang plugin model data pada instance uji legacy dan memeriksanya di sana (nama lama dari legacy.plugin) | `book`, `version` | writes | human, ai | checkout bim-ootb |
| `erp.describe` | Menjelaskan satu jenis rekaman ERP (nama lama dari mis.describe) | `kind`, `role` (opsional) | read | human, ai | checkout bim-ootb |
| `erp.read` | Membaca sebuah rekaman ERP (nama lama dari mis.read) | `kind`, `id` (opsional), `number` (opsional), `role` (opsional) | read | human, ai | checkout bim-ootb |
| `erp.list` | Mendaftar rekaman (nama lama dari mis.list) | `kind`, `columns` (opsional), `sort` (opsional), `limit` (opsional), `offset` (opsional), `names` (opsional), `role` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `erp.sum` | Menjumlahkan sebuah kolom (nama lama dari mis.sum) | `kind`, `column`, `role` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `erp.group` | Menghitung menurut sebuah kolom (nama lama dari mis.group) | `kind`, `by`, `role` (opsional), `window` (opsional), filter `column=value` lainnya (opsional) | read | human, ai | checkout bim-ootb |
| `erp.new` | Membuat sebuah rekaman (nama lama dari mis.new) | `kind`, `dry` (opsional), `role` (opsional), `window` (opsional), filter `column=value` lainnya (opsional) | writes | human, ai | checkout bim-ootb |
<!-- /GEN:verbs -->

**Cakupan saat ini.** Daftarnya kecil dengan sengaja: 59 verb mencakup pengeditan grid Modeller, walker-nya dan sebuah Modeller yang dibiarkan terbuka di antara baris, beberapa pertanyaan Viewer, jadwal, pembacaan objek generik, penghitungan dan penulisan, serta verb dokumen ERP yang pertama. Viewer memiliki 64 tindakan yang dapat ditekan seseorang, dan pintu menawarkan 5 verb Viewer. ERP memiliki 1157 dokumen dan proses, dan pintu menawarkan 6 verb ERP untuk daur hidup sebuah dokumen dan 14 verb MIS yang berfungsi pada tabel apa pun, serta mempertahankan 10 nama lama agar baris-baris sebelumnya tetap berjalan. Jadi ini sebuah permulaan, bukan menu yang lengkap.

## Apa yang tidak diperiksa {#what-is-not-checked}

Sebuah balasan mendaftar apa yang tidak tercakup oleh pemeriksaannya. Untuk laporan edit milik Modeller, daftarnya adalah:

<!-- run: notchecked cut=520 -->
```text
$ grep -o '"notChecked":\[[^]]*\]' widen.json | tail -1
"notChecked":["duplicate ids","elements changed outside the edit's own list","floating or unsupported elements","grid lines placed on top of each other","invalid coordinates","real beams: only girders walked from columns are span-checked","unknown element types","wrong units or absurd sizes, unless they hit something","zero-size elements","load capacity","beam and column rules (Regulatory Report only)"]
```

Kata-kata yang sama berlaku untuk jawaban apa pun: tumpang tindih pada awalnya adalah kotak pembatas, sebuah pemeriksaan hanya mencakup apa yang bergerak, dan **kapasitas beban tidak pernah diperiksa**. Balasan tanpa warna merah tidak pernah berarti aman.

## Pemecahan masalah

| Yang Anda lihat | Yang harus dilakukan |
|---|---|
| `edit_cli is not at …` | Salah satu dari keempat berkas hilang. Pesannya mencetak baris `curl` |
| `puppeteer not found` | Jalankan `npm install puppeteer@24` di folder yang sama |
| `unknown verb` | Pesannya mendaftar setiap verb. Periksa ejaannya terhadap [tabel](#the-verbs) |
| `missing input: …` | Verb memerlukan kunci itu. Tabel mendaftar input-nya |
| `The Viewer tools need a bim-ootb checkout` | Jalankan sebagai `node common/door/door.js` dari checkout lengkap |
| `exit 1` dengan pesan Chrome | Pustaka sistem Chrome tidak ada di Linux. Halaman pemecahan masalah Puppeteer mendaftarkannya |

**Batas yang perlu direncanakan.** Setiap panggilan Modeller membuka seluruh bangunan: sekitar 10 sampai 40 detik pada HospitalGarage. Ini alat ukur, bukan layanan dengan jaminan uptime. Skrip dengan beberapa baris Modeller membuka bangunan satu kali per baris.

## Bagaimana halaman ini tetap benar

Setiap perintah dalam blok abu-abu di atas telah dijalankan, dan keluaran di bawahnya adalah apa yang dicetak perintah itu. Sebuah pengujian, **W-FAST-SCRIPT-GUIDE** di repositori `bim-ootb`, menjalankannya lagi dari unduhan empat berkas yang bersih, memeriksa setiap angka di halaman ini terhadap hasil jalannya, dan memeriksa bahwa tabel verb sama dengan `verbs.json`. Bila sebuah angka di sini menjadi usang, pengujian itu gagal.

Terkait: [Panduan Pengusul AI](ProposerGuide.md) (menghubungkan AI ke pintu yang sama, dan apa yang dilakukan AI dengan pemeriksaannya), dan [Panduan Modeller](ModellerGuide.md).
