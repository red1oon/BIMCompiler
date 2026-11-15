---
description: BIM OOTB ユーザーガイドです。IFC の建物を 3D で見て、ジオメトリを作り、Kernel-ERP を動かします。すべてクライアント側で、ひとつのブラウザタブの中で、インストール不要です。
review: machine
source_sha: d3494de4a72ae85a
lang: ja
---
# BIM OOTB — ユーザーガイド

ひとつのブラウザで、建物を**見て**、ジオメトリを**作り**、ERP を**動かします**。インストール不要で、すべてクライアント側です。

!!! privacy "🔒 データセキュリティの保証"
    **このアプリに AI も LLM もありません。あなたのデータがブラウザの外に出ることはありません。** アプリにドロップした
    ファイルは、ブラウザ自身の IndexedDB とカーネルの中にとどまり、標準のブラウザセキュリティで守られます。
    保存するときは、あなた自身のマシンに、あなたが選んだ時と場所で書き戻します。ドロップしたすべての IFC、
    開いたすべての建物、行ったすべての ERP の編集は、あなた自身のデバイス上のクライアント側にとどまります。
    私たちにアップロードされるものはなく、あなたのデータをモデルに与えることもありません。ランディングページと Viewer ページには簡単な訪問カウンター
    （GoatCounter）があります。数えるのはページの訪問（ページのアドレスを含む場合があります）だけで、ファイルの中身を読むことも送ることもなく、オフラインでは何もしません。ERP にはありません。ご自身で操作する一部の任意機能、つまり共有リンク（TinyURL）、QR
    コード（qrserver.com）、更新の確認（GitHub）は、その公開サービスを呼び出し、その機能に必要な URL
    やリクエストだけを送ります。ファイルは送りません。すべての結果は決定的で、
    読めるオープンなコードの一行にたどれます。

    [**完全な保証を読む — 信頼モデルのしくみ →**](EnterpriseAuthentication.md) · インストール後にネットワークから
    完全に切り離して動かしたい場合は、[**完全オフライン / エアギャップ インストール
    ガイド →**](OFFLINE_INSTALL_GUIDE.md)

![Matrix ランディング — ドアを選びます](assets/matrix_landing.png)

**[フロントドア → red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/)** から始めてください。Matrix
ランディング（赤 / 青 → ラウンドセレクター）です。ドアを選ぶか、下のアプリの URL から直接どれかへ移動します。
**どれもブックマークできます**。どの画面でも **Home** を押すと、フロントドアに戻ります。再訪問のときは、
ランディングにコンパクトな`⋯`ランチャーが表示されます。**更新**すると、またフルのラウンドセレクターになります。

**ちょっとした IFC の作業だけですか？** IFC4.3 へのアップグレード、ひとつの要素を取り出して別の IFC にする、階ごとの分割、モデルの健全性チェックができます。ファイルをドロップすれば実行されます。**[BIM ツール — ユーザーマニュアル →](BIMToolsGuide.md)**

最近はじめて使う方は、**[新着情報](WhatsNew.md)** で、リリースされた変更の記録を確認してください。

## 画面を選ぶ

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg> __BIM Viewer__

    **あなたの IFC をドロップ**すると、ブラウザの中でそのまま SQLite に取り出されます。分野の統合、フライスルー、衝突マトリクス、4D/5D タイムマシン、ERP プロジェクト注文があり、すべて同じファイルの上で使えます。デスクトップでもモバイルでも、オフラインで動きます。

    _フロントドア → **Buildings / IFC** アイコン（上）_ · [開く](https://red1oon.github.io/bim-ootb/#buildings) · [ガイド](BIMUserGuide.md) · [土木工事（道路モデル）](CivilWorksGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg> __DAGeVu Modeller__

    B-rep ジオメトリを作ります。ライブラリの部品を挿入し、スケッチし、押し出し、スイープします。署名付きの op-log が、そのままフィーチャツリーです。初期段階で作業中、デスクトップ向けです。

    _フロントドア → **BIM Modeller** アイコン（上）_ · [開く](https://red1oon.github.io/bim-ootb/modeller/modeller.html) · [ガイド](ModellerGuide.md) · [AI Proposer ガイド](ProposerGuide.md) · [2D 図面 → BIM（DXF2BIM）](DXF2BIMGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> __Kernel-ERP__

    ブラウザで動く本物の iDempiere です。POS、財務諸表、SQLite から読み込まれるアプリケーション辞書の全体があります。Java もサーバーもインストールも不要です。

    _フロントドア → **ERP** アイコン（上）_ · [開く](https://red1oon.github.io/bim-ootb/erp/erp.html) · [ガイド](ERPUserGuide.md) · [レジとキッチン（POS、uniCenta のツイン）](TillUserGuide.md) · [ほかのレンズ](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Odoo / Business Central から移行する](MigrationGuide.md) · [コマンドライン（Fast Script）](FastScriptGuide.md) · [チームオーバーレイ](TeamsOverlayGuide.md)

</div>

> **ERP の実務に携わる方** — 導入担当者、パワーユーザー、開発者、ほかの ERP プロジェクトの方は、
> **[移行と比較](MigrateComparisonPaper.md)** から始めてください。Kernel-ERP が稼働中の iDempiere（と Odoo）の
> テナントをひとつの署名付き op-log にどうフォールドするか、従来のスタックと並べて通用する点、そして正直な不足点を説明しています。

## アプリごとに独自のアドレス

どのアプリも、独自のアドレスを持つ別のページです。ひとつ開いても、そのアプリだけが読み込まれ、ほかは読み込まれないので、
小さな作業は小さいままです。たとえばレジは、3D ビューアを読み込みません。

| アプリ | アドレス | 初回訪問でダウンロードされる量 |
|---|---|---|
| フロントドア | [red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/) | 約 0.1 MB |
| BIM Viewer | […/viewer/viewer.html](https://red1oon.github.io/bim-ootb/viewer/viewer.html) | 約 3 MB と、開く建物 |
| DAGeVu Modeller | […/modeller/modeller.html](https://red1oon.github.io/bim-ootb/modeller/modeller.html) | 約 1.3 MB |
| ERP スタートページ（バブル） | […/erp/erp.html](https://red1oon.github.io/bim-ootb/erp/erp.html) | 約 0.1 MB |
| ERP フォーム（iDempiere のルック） | […/erp/idempiere.html](https://red1oon.github.io/bim-ootb/erp/idempiere.html) | 約 1.4 MB と、ERP のデータベース約 7 MB |
| レジ · キッチン画面 | […/erp/till.html](https://red1oon.github.io/bim-ootb/erp/till.html) · […/erp/kitchen.html](https://red1oon.github.io/bim-ootb/erp/kitchen.html) | 約 0.1 MB · 0.1 MB 未満 |

ERP フォームのページは、初回訪問のあとデータベースをブラウザに保存するので、次回からは再びダウンロードしません。
*サイズは 2026-11-08 に、公開ファイルから数えたものです（圧縮後、ネットワークで送られる形）。*

## チームで作業する

複数の人、またはあなた自身の複数のデバイスが、**データベースサーバーもアプリケーションサーバーもなし**に、同じレコード（ERP の注文、
Modeller の建物）を扱えます。**Team** ピル（二つの頭のアイコン。Modeller では Team アイコン）を押して**チームモードをオンにします**。
最初のデバイスが**チームを開始**し、ほかのデバイスは**参加**してそこで承認され、全員が
**Visit** を押して自分の変更を送り、ほかの人の変更を受け取ります。用意済みの
お試しの場があるので、何も設定せずに、一回の完全なサイクルを試せます。

[:octicons-arrow-right-24: チームガイド](https://red1oon.github.io/bim-ootb/erp/team_guide.html) ·
[規約を検証する方法](TermsHowToVerify.md) ·
[チームオーバーレイ（ALPHA のデモンストレーター：誰が何をしたかのドット、チャット、グラフ）](TeamsOverlayGuide.md)

## フロントドアにはほかにも

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> __About & Install__

    BIM OOTB とは何か、そしてどう手元に残すかです。これは**摩擦のない PWA**で、ブラウザが*インストール*（ホーム画面に追加）できるので、**オフラインで、サーバーなし**で動きます。同じボックスに **Run it yourself (DIY)** タブがあり、ワンステップのインストールスクリプトと README をダウンロードして、スタック全体を自分のマシンにセルフホストできます。

    _フロントドア → **About** アイコン（上）_ · [セルフホストガイド](SYSTEMS_INSTALLER_GUIDE.md) ·
    [完全オフライン / エアギャップ インストール](OFFLINE_INSTALL_GUIDE.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> __Clear Cache__

    スタート画面に戻します。消すのは**ブラウザ内の建物データ**だけです。つまり、キャッシュされた建物と、ドロップしたものの`.db`に保存しなかった IFC シーンで、赤 / 青のゲートに戻ります。インストール済みのアプリ、そのオフラインデータ、ご自身で保存した`.db`ファイルは**そのまま残ります**。

    _フロントドア → **Trash** アイコン（上）_

</div>

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
