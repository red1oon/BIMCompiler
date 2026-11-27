---
description: ブラウザで動く IFC ビューアと、ローカルファースト ERP カーネルです。IFC ファイルをドロップして BIM モデルを 3D で見て、サーバーレスでイベントソース型の ERP を動かせます。インストールもサーバーも不要で、MIT ライセンスです。
hide:
  - navigation
  - toc
review: machine
source_sha: eb68687f38713eb7
lang: ja
---

# BIM Intent Compiler

**Construction = BOM + (x, y, z)**。この一つの式が、ジオメトリ、調達、スケジュール、コンプライアンス、コストをひとつにまとめます。E=mc² が質量とエネルギーをひとつにしたのと同じです。業界が別々のツール、別々のベンダー、別々の予算で扱ってきた五つの領域を、一インチほどの式でひとつにします。

BOM を読み取り、検証済みの 3D 座標を出力します。[ERP システム](MANIFESTO.md)が製造 BOM を作業指示に展開するのと同じ方法です。出力は [BIM OOTB ブラウザビューア](https://red1oon.github.io/bim-ootb/)にそのまま描画されます。インストールもサーバーも不要で、DB が二つ、ブラウザがひとつです。[特定の分野に限りません](ShipYard.md)。建物、橋、[船](ShipYard.md)、トンネルを扱えます。**何も作り話はありません。内部に AI も LLM もありません。純粋な算術で、決定的です。**

<div style="max-width: 640px; margin: 28px auto; padding: 22px 32px; background: #d32f2f12; border: 2px solid #d32f2f; border-radius: 6px; text-align: center;">
<div style="font-size: 1.15em; font-weight: 700; color: #d32f2f; letter-spacing: 0.3px;">🚀 はじめての方は、ユーザーガイドからどうぞ。</div>
<div style="margin-top: 8px; color: #455a64;">ひとつのブラウザで、建物を<b>見て</b>、ジオメトリを<b>作り</b>、ERP を<b>動かします</b>。</div>
<div style="margin-top: 14px;"><a href="USER_GUIDE/" style="display:inline-block; padding:9px 22px; background:#d32f2f; color:#fff; border-radius:4px; text-decoration:none; font-weight:700;">📖 ユーザーガイドを開く →</a></div>
</div>

<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">「<b style="color: #ff9800;">AUTODESK</b> と <b style="color: #ff9800;">PRIMAVERA</b> と <b style="color: #ff9800;">SAP</b> が、とっくの昔に<br>力を合わせてやるべきだったこと。 — <i>でも、私は待てませんでした。</i>」</span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">Redhuan D. Oon · ADempiere 2006 · iDempiere 2010 · BIM Compiler 2025</span>
</div>

既存のツールはどれも、ジオメトリから始めて、数量を後から取り出します。先に描き、後から数えます。このコンパイラは向きを逆にします。部材表（BOM）が唯一の真実の源で、ジオメトリはコンパイルされた出力です。調達は設計に従いません。設計が調達に従います。

| | 先に描き、後から数える | 先に数え、後から描く |
|---|---|---|
| **真実の源** | 3D モデル（Revit、ArchiCAD） | 部材表（BOM） |
| **数量** | 設計の後に取り出す | 最初から備わっている。BOM そのものが数量 |
| **壁を変更する** | 描き直す → QTO を取り出し直す → 見積もり直す | BOM の一行を変える → 再コンパイル |
| **コンプライアンス** | 別のチェッカー（Solibri） | 同じルールエンジン |
| **コスト** | 別の積算ツール | 同じ BOM × 価格表 |
| **スケジュール** | 別のツール（Primavera） | BOM ツリーのトポロジカルソート |
| **証明** | 目視確認 | 決定的。すべての要素が出どころにたどれる |

[iDempiere](https://idempiere.org/) ERP の規約と [SQLite](https://www.sqlite.org/) の上に作られ、Three.js でブラウザネイティブに描画されます。マレーシアのクアラルンプール発です。ここでは 2025年七月から、RM10M 以上のすべてのプロジェクトで BIM が[義務化](StrategicIndustryPositioning.md)されています。これは、作者である [Redhuan D. Oon](mailto:red1org@gmail.com) から世界への贈り物です。

---

## 実際に開く三つのアプリ

<div class="grid cards" markdown>

-   **🧱 BIM Viewer**

    ---

    あなたの IFC をドロップすると、ブラウザの中でそのまま SQLite に取り出されます。分野の統合、フライスルー、衝突マトリクス、4D/5D タイムマシンがあり、すべて同じファイルの上で使えます。デスクトップでもモバイルでも、オフラインで動きます。

    [:octicons-arrow-right-24: Viewer ガイド](BIMUserGuide.md) · [開く](https://red1oon.github.io/bim-ootb/#buildings)

-   **✏️ DAGeVu Modeller**

    ---

    B-rep ジオメトリを作ります。ライブラリの部品を挿入し、スケッチし、押し出し、スイープし、**3D グリッド**を編集します。署名付きの op-log が、そのままフィーチャツリーです。

    [:octicons-arrow-right-24: Modeller ガイド](ModellerGuide.md) · [開く](https://red1oon.github.io/bim-ootb/modeller/modeller.html)

-   **📊 Kernel-ERP**

    ---

    ブラウザで動く本物の iDempiere です。POS、財務諸表、SQLite から読み込まれるアプリケーション辞書の全体があります。Java もサーバーもインストールも不要です。

    [:octicons-arrow-right-24: Kernel-ERP ガイド](ERPUserGuide.md) · [レジとキッチン（uniCenta のツイン）](TillUserGuide.md) · [すべてのレンズ](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [開く](https://red1oon.github.io/bim-ootb/erp/erp.html)

</div>

---

## 主な考え方

<figure style="float: right; margin: -8px 0 8px 20px; max-width: 280px; text-align: center;">
  <img src="assets/images/GeneralTall.png" alt="BOM からコンパイルされた複数階の建物。6 つの分野を色分けしています" width="280">
  <figcaption style="font-size: 0.75em; color: #666; margin-top: 4px;">BOM からコンパイルされたものです。色は分野を表します（STR、ARC、ELEC、FP、ACMV、SP）。</figcaption>
</figure>

<div class="grid cards" markdown>

-   **衝突検出 — ブラウザの中で**

    ---

    分野の組み合わせごとのルール、該当箇所へ飛ぶ可視化、その場で動かせる許容値スライダー、ビューア内のレビューワークフローがあります。数万の要素を、サーバーなしで扱います。

    [:octicons-arrow-right-24: 衝突検出](CLASH_DETECTION.md)

-   **Kernel-ERP — 署名付き op-log の上のフォールド**

    ---

    C_Order、C_OrderLine、M_Product、M_BOM は、[iDempiere](https://idempiere.org/) のオラクルからフォールドされます。状態は、署名付きの操作ログの上の決定的なフォールドです。`AD_Process` でさえ、メソッドではなくリプレイとして導き直されます。

    [:octicons-arrow-right-24: ブラックブック](FoldEngineBlackBook.html) · [:octicons-arrow-right-24: ERP 間ロゼッタ（SAP / ACDOCA を含む）](ERPConceptRosetta.html) · [:octicons-arrow-right-24: ERP の世界観](MANIFESTO.md)

-   **エンタープライズセキュリティ — サーバーは不要**

    ---

    中央サーバーなしの暗号による検証です。HMAC 認証、Ed25519 による本人署名、SHA-256 による転送の完全性を備えます。あなたのデータがブラウザの外に出ることはありません。

    [:octicons-arrow-right-24: セキュリティアーキテクチャ](EnterpriseAuthentication.md)

-   **編集できるビジネスルール、その場で**

    ---

    聖杯です。ルールを変えると、モデルと ERP が再びフォールドされるのを見られます。[すべてのレコードに場所がある](SpatialERP_OOTB.md)、空間 ERP です。

    [:octicons-arrow-right-24: 聖杯](HolyGrail.md) · [:octicons-arrow-right-24: 空間 ERP](SpatialERP_OOTB.md)

</div>

<div style="clear: right;"></div>

---

## ドキュメントマップ

| 目的 | ここから |
|------------|-----------|
| **始める（全員ここから）** | [📖 **ユーザーガイド**](USER_GUIDE.md) |
| ブラウザで建物を見る | [BIM Viewer ガイド](BIMUserGuide.md) |
| ジオメトリを作る | [DAGeVu Modeller ガイド](ModellerGuide.md) |
| 2D 図面（DXF）を 3D の BIM モデルにする | [2D 図面 → BIM（DXF2BIM）](DXF2BIMGuide.md) |
| 道路 IFC セットから土木工事のレポートを得る | [土木工事 — ステップごとに](CivilWorksGuide.md) |
| ひとつの画面で共同作業する（誰が何をしたか、チャット） | [チームオーバーレイ](TeamsOverlayGuide.md) |
| 最近リリースされたものを見る | [新着情報](WhatsNew.md) |
| ブラウザの ERP を動かす | [Kernel-ERP ユーザーガイド](ERPUserGuide.md) |
| 一行のコマンドでアプリを操作する（あなたでも AI でも） | [Fast Script ガイド](FastScriptGuide.md) |
| Odoo、Business Central、SAP Business One から会社を移行する | [移行ユーザーガイド](MigrationGuide.md) · [Odoo の移行のしくみ](OdooMigration.md) |
| レジとキッチン画面を動かす | [レジ・キッチン ユーザーガイド](TillUserGuide.md) |
| 建物がプロジェクト注文と CAPEX ダッシュボードになるのを見る | [BIM → ERP と CAPEX ダッシュボード](CapexDashboardGuide.md) · [CAPEX UAT ガイド](CapexUATGuide.md) |
| 外部の AI に Modeller への変更を提案させる | [AI Proposer ガイド](ProposerGuide.md) · [防衛的開示](AIProposerDefensiveDisclosure.md) |
| コードを読む、または変更する | [開発者ガイド](DeveloperGuide.md) |
| プロトタイプを試す（概念実証、サンプルデータのみ） | [ハラール トラック＆トレース](HalalTrace.md) · [開く](halal/index.html) · [大規模リテール](RetailScaleStory.html) · [Glassbowl Gravity](glassbowl_gravity.html) · [アーキテクチャツアー](bim_architecture_viz.html) |
| ERP の世界観を理解する | [MANIFESTO — 最初にお読みください](MANIFESTO.md) |
| ほかのツールと比べる | [機能比較](FeatureComparison.md) · [移行と比較（ERP）](MigrateComparisonPaper.md) |
| 業界のどこに位置するかを見る | [戦略的ポジショニング](StrategicIndustryPositioning.md) |
| どう作られたかを知る | [バイブプログラミング — AI とドメインの専門知識](VibeProgramming.md) |
| ジオメトリをフォールドとして作る | [DAGeVu Modeller — フォールドとしてのジオメトリ](ModellerKernelFold.md) |
| 屋内のどの要素にも歩いて行く | [検索とナビゲーション — 屋内ウェイファインディング](RouteTemplate.md) |
| 分散 / オフラインの ERP | [分散 ERP](DistributedERP.md) |
| 建物の先へ | [建物を超えて — ShipYard](ShipYard.md) |
| 貢献する | [貢献 — ここから](CONTRIBUTING.md) |

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
