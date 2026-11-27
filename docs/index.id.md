---
description: Penampil IFC native-browser dan kernel ERP local-first — jatuhkan berkas IFC, lihat model BIM dalam 3D, jalankan ERP tanpa server berbasis event-sourcing. Tanpa instalasi, tanpa server, berlisensi MIT.
hide:
  - navigation
  - toc
review: machine
source_sha: eb68687f38713eb7
lang: id
---

# BIM Intent Compiler

**Konstruksi = BOM + (x, y, z).** Satu rumus yang menyatukan geometri, pengadaan, penjadwalan, kepatuhan, dan biaya — seperti E=mc² menyatukan massa dan energi. Lima domain yang oleh industri diperlakukan sebagai alat terpisah, vendor terpisah, anggaran terpisah — disatukan dalam rumus sepanjang satu inci.

Ia membaca BOM dan menghasilkan koordinat 3D terverifikasi — dengan cara yang sama seperti [sistem ERP](MANIFESTO.md) meledakkan BOM manufaktur menjadi perintah kerja. Hasilnya dirender langsung di [penampil browser BIM OOTB](https://red1oon.github.io/bim-ootb/) — tanpa instalasi, tanpa server, dua DB, satu browser. [Agnostik domain](ShipYard.md) — gedung, jembatan, [kapal](ShipYard.md), terowongan. **Tidak ada yang diciptakan. Tanpa AI, tanpa LLM di dalamnya. Murni aritmetika. Deterministik.**

<div style="max-width: 640px; margin: 28px auto; padding: 22px 32px; background: #d32f2f12; border: 2px solid #d32f2f; border-radius: 6px; text-align: center;">
<div style="font-size: 1.15em; font-weight: 700; color: #d32f2f; letter-spacing: 0.3px;">🚀 Baru di sini? Mulailah dengan Panduan Pengguna.</div>
<div style="margin-top: 8px; color: #455a64;">Satu browser — <b>lihat</b> sebuah gedung · <b>buat</b> geometri · <b>jalankan</b> ERP.</div>
<div style="margin-top: 14px;"><a href="USER_GUIDE/" style="display:inline-block; padding:9px 22px; background:#d32f2f; color:#fff; border-radius:4px; text-decoration:none; font-weight:700;">📖 Buka Panduan Pengguna →</a></div>
</div>

<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">"Apa yang seharusnya sudah lama dikerjakan <b style="color: #ff9800;">AUTODESK</b>, <b style="color: #ff9800;">PRIMAVERA</b> dan <b style="color: #ff9800;">SAP</b><br>bersama-sama — <i>tetapi saya tidak bisa menunggu.</i>"</span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">Redhuan D. Oon · ADempiere 2006 · iDempiere 2010 · BIM Compiler 2025</span>
</div>

Setiap alat yang ada dimulai dari geometri dan mengambil kuantitas di hilir — gambar dulu, hitung kemudian. Kompiler ini membalik arahnya: Bill of Materials adalah sumber kebenaran, dan geometri adalah keluaran hasil kompilasi. Pengadaan tidak mengikuti desain. Desain mengikuti pengadaan.

| | Gambar dulu, hitung kemudian | Hitung dulu, gambar kemudian |
|---|---|---|
| **Sumber kebenaran** | Model 3D (Revit, ArchiCAD) | Bill of Materials |
| **Kuantitas** | Diambil setelah desain | Melekat — BOM ADALAH kuantitasnya |
| **Ubah satu dinding** | Gambar ulang → ambil ulang QTO → estimasi ulang | Ubah satu baris BOM → kompilasi ulang |
| **Kepatuhan** | Pemeriksa terpisah (Solibri) | Mesin aturan yang sama |
| **Biaya** | Estimator terpisah | BOM yang sama × daftar harga |
| **Jadwal** | Alat terpisah (Primavera) | Pengurutan topologis pohon BOM |
| **Bukti** | Pemeriksaan visual | Deterministik — setiap elemen dapat ditelusuri ke sumbernya |

Dibangun di atas konvensi ERP [iDempiere](https://idempiere.org/) dan [SQLite](https://www.sqlite.org/), dirender native-browser dengan Three.js. Dari Kuala Lumpur, Malaysia — tempat BIM [diwajibkan](StrategicIndustryPositioning.md) untuk semua proyek ≥ RM10M sejak Juli 2025. Ini adalah hadiah dari Sang Pencipta, [Redhuan D. Oon](mailto:red1org@gmail.com), untuk dunia.

---

## Tiga aplikasi yang benar-benar Anda buka

<div class="grid cards" markdown>

-   **🧱 BIM Viewer**

    ---

    Jatuhkan IFC Anda sendiri → diekstrak ke SQLite langsung di browser; gabungkan disiplin, fly-through, matriks clash, mesin waktu 4D/5D — semuanya pada berkas yang sama. Desktop dan seluler, berfungsi offline.

    [:octicons-arrow-right-24: Panduan Viewer](BIMUserGuide.md) · [Buka](https://red1oon.github.io/bim-ootb/#buildings)

-   **✏️ DAGeVu Modeller**

    ---

    Buat geometri B-rep — sisipkan komponen pustaka, sketsa, ekstrusi, sapuan, sunting **3D Grid** — tempat op-log bertanda tangan *adalah* pohon fitur.

    [:octicons-arrow-right-24: Panduan Modeller](ModellerGuide.md) · [Buka](https://red1oon.github.io/bim-ootb/modeller/modeller.html)

-   **📊 Kernel-ERP**

    ---

    iDempiere asli di dalam browser — POS, laporan keuangan, seluruh Application Dictionary dari SQLite. Tanpa Java, tanpa server, tanpa instalasi.

    [:octicons-arrow-right-24: Panduan Kernel-ERP](ERPUserGuide.md) · [Kasir & Dapur (kembaran uniCenta)](TillUserGuide.md) · [Semua lensa](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Buka](https://red1oon.github.io/bim-ootb/erp/erp.html)

</div>

---

## Gagasan utama

<figure style="float: right; margin: -8px 0 8px 20px; max-width: 280px; text-align: center;">
  <img src="assets/images/GeneralTall.png" alt="Gedung bertingkat yang dikompilasi dari BOM — 6 disiplin dengan kode warna" width="280">
  <figcaption style="font-size: 0.75em; color: #666; margin-top: 4px;">Dikompilasi dari BOM. Warna = disiplin (STR, ARC, ELEC, FP, ACMV, SP).</figcaption>
</figure>

<div class="grid cards" markdown>

-   **Deteksi Clash — di Browser**

    ---

    Aturan pasangan disiplin, visualisasi fly-to, penggeser toleransi langsung, alur tinjauan di dalam viewer. Puluhan ribu elemen, tanpa server.

    [:octicons-arrow-right-24: Deteksi Clash](CLASH_DETECTION.md)

-   **Kernel-ERP — Sebuah Fold atas Op-Log Bertanda Tangan**

    ---

    C_Order, C_OrderLine, M_Product, M_BOM — di-fold dari oracle [iDempiere](https://idempiere.org/). State adalah fold deterministik atas log operasi bertanda tangan; bahkan sebuah `AD_Process` diturunkan ulang sebagai replay, bukan sebagai metode.

    [:octicons-arrow-right-24: Black Book](FoldEngineBlackBook.html) · [:octicons-arrow-right-24: Rosetta Lintas-ERP (termasuk SAP / ACDOCA)](ERPConceptRosetta.html) · [:octicons-arrow-right-24: Pandangan dunia ERP](MANIFESTO.md)

-   **Keamanan Perusahaan — Tanpa Server**

    ---

    Verifikasi kriptografis tanpa server pusat: atestasi HMAC, penandatanganan identitas Ed25519, integritas transport SHA-256. Data Anda tidak pernah meninggalkan browser Anda.

    [:octicons-arrow-right-24: Arsitektur Keamanan](EnterpriseAuthentication.md)

-   **Aturan Bisnis yang Dapat Disunting, Langsung**

    ---

    Holy Grail — ubah sebuah aturan, saksikan model dan ERP di-fold ulang. ERP spasial tempat [setiap rekaman memiliki tempat](SpatialERP_OOTB.md).

    [:octicons-arrow-right-24: Holy Grail](HolyGrail.md) · [:octicons-arrow-right-24: ERP Spasial](SpatialERP_OOTB.md)

</div>

<div style="clear: right;"></div>

---

## Peta dokumentasi

| Saya ingin… | Mulai dari sini |
|------------|-----------|
| **Mulai (semua orang mulai di sini)** | [📖 **Panduan Pengguna**](USER_GUIDE.md) |
| Melihat sebuah gedung di browser | [Panduan BIM Viewer](BIMUserGuide.md) |
| Membuat geometri | [Panduan DAGeVu Modeller](ModellerGuide.md) |
| Mengubah gambar 2D (DXF) menjadi model BIM 3D | [Gambar 2D → BIM (DXF2BIM)](DXF2BIMGuide.md) |
| Mendapat laporan pekerjaan sipil dari kumpulan IFC jalan | [Pekerjaan Sipil — Langkah demi Langkah](CivilWorksGuide.md) |
| Berkolaborasi pada sebuah permukaan (siapa mengerjakan apa, obrolan) | [Teams Overlay](TeamsOverlayGuide.md) |
| Melihat apa yang baru dirilis | [Yang Baru](WhatsNew.md) |
| Menjalankan ERP di browser | [Panduan Pengguna Kernel-ERP](ERPUserGuide.md) |
| Mengendalikan aplikasi dengan perintah satu baris (Anda atau AI) | [Panduan Fast Script](FastScriptGuide.md) |
| Memindahkan perusahaan dari Odoo, Business Central, atau SAP Business One | [Panduan Pengguna Migrasi](MigrationGuide.md) · [cara kerja pemindahan Odoo](OdooMigration.md) |
| Menjalankan kasir dan layar dapur | [Panduan Pengguna Kasir & Dapur](TillUserGuide.md) |
| Melihat sebuah gedung menjadi pesanan proyek dan dasbor CAPEX | [BIM → ERP dan Dasbor CAPEX](CapexDashboardGuide.md) · [Panduan UAT CAPEX](CapexUATGuide.md) |
| Membiarkan AI dari luar mengusulkan perubahan ke Modeller | [Panduan Pengusul AI](ProposerGuide.md) · [Pengungkapan defensif](AIProposerDefensiveDisclosure.md) |
| Membaca atau mengubah kode | [Panduan Pengembang](DeveloperGuide.md) |
| Mencoba prototipe (bukti konsep, hanya data contoh) | [Pelacakan halal](HalalTrace.md) · [buka](halal/index.html) · [Ritel berskala besar](RetailScaleStory.html) · [Glassbowl Gravity](glassbowl_gravity.html) · [Tur arsitektur](bim_architecture_viz.html) |
| Memahami pandangan dunia ERP | [MANIFESTO — baca lebih dulu](MANIFESTO.md) |
| Membandingkan dengan alat lain | [Perbandingan Fitur](FeatureComparison.md) · [Migrasi & Bandingkan (ERP)](MigrateComparisonPaper.md) |
| Melihat posisi ini di industri | [Posisi Strategis](StrategicIndustryPositioning.md) |
| Memahami bagaimana ini dibangun | [Vibe Programming — AI + Keahlian Domain](VibeProgramming.md) |
| Membuat geometri sebagai fold | [DAGeVu Modeller — Geometri sebagai Fold](ModellerKernelFold.md) |
| Berjalan ke elemen mana pun di dalam ruangan | [Cari & Navigasi — Pemanduan Arah Dalam Ruangan](RouteTemplate.md) |
| ERP terdistribusi / offline | [ERP Terdistribusi](DistributedERP.md) |
| Melampaui gedung | [Melampaui Gedung — ShipYard](ShipYard.md) |
| Berkontribusi | [Berkontribusi — mulai di sini](CONTRIBUTING.md) |

*Hak cipta (c) 2025-2026 Redhuan D. Oon. Berlisensi MIT.*
