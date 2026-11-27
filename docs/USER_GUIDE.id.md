---
description: Panduan pengguna BIM OOTB — lihat gedung IFC dalam 3D, buat geometri, dan jalankan Kernel-ERP, semuanya di sisi klien dalam satu tab browser tanpa instalasi.
review: machine
source_sha: d3494de4a72ae85a
lang: id
---
# BIM OOTB — Panduan Pengguna

Satu browser. **Lihat** sebuah gedung · **buat** geometri · **jalankan** ERP. Tanpa instalasi, semuanya di sisi klien.

!!! privacy "🔒 Jaminan Keamanan Data"
    **Tidak ada AI dan tidak ada LLM di dalam aplikasi ini. Data Anda tidak pernah meninggalkan browser Anda.** Berkas apa pun yang Anda jatuhkan
    ke dalam aplikasi tetap berada di dalam IndexedDB dan kernel milik browser Anda sendiri, dilindungi oleh keamanan
    browser standar — dan Anda menyimpannya kembali ke mesin Anda sendiri, kapan dan di mana pun Anda pilih. Setiap IFC yang Anda jatuhkan,
    setiap gedung yang Anda buka, setiap suntingan ERP tetap di sisi klien pada perangkat Anda sendiri — tidak ada yang diunggah ke
    kami, dan tidak ada model yang diberi data Anda. Halaman landing dan halaman Viewer menjalankan penghitung kunjungan sederhana
    (GoatCounter) — ia menghitung kunjungan halaman (alamat halaman mungkin disertakan), tidak pernah membaca atau mengirim isi sebuah berkas, dan tidak melakukan apa pun saat offline; ERP tidak memilikinya. Beberapa fitur opsional yang Anda picu sendiri — tautan berbagi (TinyURL), kode
    QR (qrserver.com) dan pemeriksaan pembaruan (GitHub) — memanggil layanan publik itu dan hanya mengirimkan URL
    atau permintaan yang dibutuhkan fitur tersebut, tidak pernah berkas Anda. Setiap hasil bersifat deterministik
    dan dapat ditelusuri ke satu baris kode terbuka yang dapat Anda baca.

    [**Baca jaminan lengkapnya — cara kerja model kepercayaan →**](EnterpriseAuthentication.md) · ingin
    menjalankannya sepenuhnya terputus dari jaringan setelah terpasang? [**Panduan Instalasi Sepenuhnya Offline / Air-Gapped
    →**](OFFLINE_INSTALL_GUIDE.md)

![Landing Matrix — pilih pintu Anda](assets/matrix_landing.png)

Mulailah di **[pintu depan → red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/)** — landing
Matrix (merah / biru → pemilih bulat). Pilih sebuah pintu, atau langsung lompat ke aplikasi mana pun lewat URL-nya di bawah.
**Beri bookmark pada yang mana pun**; tekan **Home** di permukaan mana pun untuk kembali ke pintu depan. Pada kunjungan ulang,
landing menampilkan peluncur ringkas `⋯`; **segarkan** untuk melihat pemilih bulat penuh lagi.

**Hanya butuh pekerjaan IFC singkat?** Tingkatkan ke IFC4.3, tarik satu item keluar menjadi IFC-nya sendiri, pisahkan per lantai, atau periksa kesehatan sebuah model — jatuhkan berkas, lalu ia berjalan. **[BIM Tools — Manual Pengguna →](BIMToolsGuide.md)**

Baru bergabung belakangan ini? Lihat **[Yang Baru](WhatsNew.md)** untuk catatan berjalan tentang perubahan yang telah dirilis.

## Pilih sebuah permukaan

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg> __BIM Viewer__

    **Jatuhkan IFC Anda sendiri** → diekstrak ke SQLite langsung di browser; gabungkan disiplin, fly-through, matriks clash, mesin waktu 4D/5D, Pesanan Proyek ERP — semuanya pada berkas yang sama. Desktop dan seluler, berfungsi offline.

    _Pintu depan → ikon **Buildings / IFC** (di atas)_ · [Buka](https://red1oon.github.io/bim-ootb/#buildings) · [Panduan](BIMUserGuide.md) · [Pekerjaan Sipil (model jalan)](CivilWorksGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg> __DAGeVu Modeller__

    Buat geometri B-rep — sisipkan komponen pustaka, sketsa, ekstrusi, sapuan — tempat op-log bertanda tangan *adalah* pohon fitur. Tahap awal/dalam pengerjaan; desktop.

    _Pintu depan → ikon **BIM Modeller** (di atas)_ · [Buka](https://red1oon.github.io/bim-ootb/modeller/modeller.html) · [Panduan](ModellerGuide.md) · [Panduan Pengusul AI](ProposerGuide.md) · [Gambar 2D → BIM (DXF2BIM)](DXF2BIMGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> __Kernel-ERP__

    iDempiere asli di dalam browser — POS, laporan keuangan, seluruh Application Dictionary dari SQLite. Tanpa Java, tanpa server, tanpa instalasi.

    _Pintu depan → ikon **ERP** (di atas)_ · [Buka](https://red1oon.github.io/bim-ootb/erp/erp.html) · [Panduan](ERPUserGuide.md) · [Kasir & Dapur (POS, kembaran uniCenta)](TillUserGuide.md) · [Lensa lainnya](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Migrasi dari Odoo / Business Central](MigrationGuide.md) · [Baris perintah (Fast Script)](FastScriptGuide.md) · [Teams overlay](TeamsOverlayGuide.md)

</div>

> **Praktisi ERP** — implementator, pengguna mahir, pengembang, dan proyek ERP lainnya — mulailah dengan
> **[Migrasi & Bandingkan](MigrateComparisonPaper.md)**: bagaimana Kernel-ERP me-fold tenant iDempiere (dan Odoo)
> yang aktif ke dalam satu op-log bertanda tangan, apa yang sebanding dengan tumpukan sistem lama, dan celah-celah yang diakui secara jujur.

## Setiap aplikasi punya alamatnya sendiri

Setiap aplikasi adalah halaman terpisah dengan alamatnya sendiri. Membuka satu aplikasi hanya memuat aplikasi itu, bukan yang lain, sehingga
pekerjaan kecil tetap kecil. Kasir, misalnya, tidak pernah memuat penampil 3D.

| Aplikasi | Alamat | Diunduh pada kunjungan pertama |
|---|---|---|
| Pintu depan | [red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/) | sekitar 0.1 MB |
| BIM Viewer | […/viewer/viewer.html](https://red1oon.github.io/bim-ootb/viewer/viewer.html) | sekitar 3 MB, ditambah gedung yang Anda buka |
| DAGeVu Modeller | […/modeller/modeller.html](https://red1oon.github.io/bim-ootb/modeller/modeller.html) | sekitar 1.3 MB |
| Halaman awal ERP (gelembung) | […/erp/erp.html](https://red1oon.github.io/bim-ootb/erp/erp.html) | sekitar 0.1 MB |
| Formulir ERP (tampilan iDempiere) | […/erp/idempiere.html](https://red1oon.github.io/bim-ootb/erp/idempiere.html) | sekitar 1.4 MB, ditambah sekitar 7 MB untuk database ERP |
| Kasir · Layar dapur | […/erp/till.html](https://red1oon.github.io/bim-ootb/erp/till.html) · […/erp/kitchen.html](https://red1oon.github.io/bim-ootb/erp/kitchen.html) | sekitar 0.1 MB · di bawah 0.1 MB |

Halaman formulir ERP menyimpan databasenya di browser Anda setelah kunjungan pertama, sehingga kunjungan berikutnya tidak
mengunduhnya lagi. *Ukuran dihitung pada 2026-11-08 dari berkas yang dipublikasikan (terkompresi, seperti yang dikirim melalui jaringan).*

## Bekerja sebagai tim

Beberapa orang — atau beberapa perangkat Anda sendiri — dapat bekerja pada rekaman yang sama (pesanan di ERP, gedung
di Modeller) tanpa **server database dan tanpa server aplikasi**. Tekan pil **Team** (dua kepala;
di Modeller, ikon Team) lalu **Turn on team mode**; perangkat pertama **Starts a team**, yang lain **Join**
dan disetujui di sana, lalu semua orang menekan **Visit** untuk mengirim perubahan mereka dan mengambil perubahan yang lain. Tempat
uji siap pakai memungkinkan Anda mencoba satu siklus penuh tanpa menyiapkan apa pun.

[:octicons-arrow-right-24: Panduan Tim](https://red1oon.github.io/bim-ootb/erp/team_guide.html) ·
[Cara memverifikasi ketentuan](TermsHowToVerify.md) ·
[Teams overlay (demonstrator ALPHA: titik siapa-mengerjakan-apa, obrolan, grafik)](TeamsOverlayGuide.md)

## Juga di pintu depan

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> __Tentang & Instal__

    Apa itu BIM OOTB, dan bagaimana menyimpannya. Ini adalah **PWA tanpa hambatan** — browser Anda dapat *memasangnya* (tambahkan ke layar utama) sehingga berjalan **offline, tanpa server**. Kotak yang sama memiliki tab **Run it yourself (DIY)**: unduh skrip instalasi satu langkah + README untuk meng-host seluruh tumpukan di mesin Anda sendiri.

    _Pintu depan → ikon **About** (di atas)_ · [Panduan hosting mandiri](SYSTEMS_INSTALLER_GUIDE.md) ·
    [Instalasi sepenuhnya offline / air-gapped](OFFLINE_INSTALL_GUIDE.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> __Hapus Cache__

    Mengatur ulang ke layar awal. Hanya menghapus **data gedung di dalam browser** — gedung yang di-cache dan adegan IFC apa pun yang Anda jatuhkan tetapi tidak pernah disimpan ke berkas `.db` — lalu mengembalikan Anda ke gerbang merah / biru. **Mempertahankan** aplikasi terpasang, data offline-nya, dan berkas `.db` apa pun yang Anda simpan sendiri.

    _Pintu depan → ikon **Trash** (di atas)_

</div>

*Hak cipta (c) 2025-2026 Redhuan D. Oon. Berlisensi MIT.*
