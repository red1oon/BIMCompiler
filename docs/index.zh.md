---
description: 浏览器原生的 IFC 查看器和本地优先的 ERP 内核——拖入一个 IFC 文件，就能在 3D 中查看 BIM 模型，并运行无服务器、基于事件溯源的 ERP。无需安装，无需服务器，MIT 许可。
hide:
  - navigation
  - toc
review: machine
source_sha: eb68687f38713eb7
lang: zh-CN
---

# BIM Intent Compiler

**Construction = BOM + (x, y, z)。** 一个公式，统一了几何、采购、进度、合规与成本——就像 E=mc² 统一了质量与能量。业界把这五个领域当作不同的工具、不同的供应商、不同的预算——而它们被统一在一个一英寸长的公式里。

它读取一份 BOM，生成经过验证的 3D 坐标——就像 [ERP 系统](MANIFESTO.md)把制造 BOM 展开成工单一样。输出会实时显示在 [BIM OOTB 浏览器查看器](https://red1oon.github.io/bim-ootb/)中——无需安装，无需服务器，两个数据库，一个浏览器。[不限领域](ShipYard.md)——建筑、桥梁、[船舶](ShipYard.md)、隧道。**不虚构任何东西。内部没有 AI，没有 LLM。纯算术。结果确定。**

<div style="max-width: 640px; margin: 28px auto; padding: 22px 32px; background: #d32f2f12; border: 2px solid #d32f2f; border-radius: 6px; text-align: center;">
<div style="font-size: 1.15em; font-weight: 700; color: #d32f2f; letter-spacing: 0.3px;">🚀 第一次来？请先看用户指南。</div>
<div style="margin-top: 8px; color: #455a64;">一个浏览器——<b>查看</b>建筑 · <b>编写</b>几何 · <b>运行</b> ERP。</div>
<div style="margin-top: 14px;"><a href="USER_GUIDE/" style="display:inline-block; padding:9px 22px; background:#d32f2f; color:#fff; border-radius:4px; text-decoration:none; font-weight:700;">📖 打开用户指南 →</a></div>
</div>

<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">“<b style="color: #ff9800;">AUTODESK</b>、<b style="color: #ff9800;">PRIMAVERA</b> 和 <b style="color: #ff9800;">SAP</b> 早就该一起做的事<br>——<i>可我等不及了。</i>”</span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">Redhuan D. Oon · ADempiere 2006 · iDempiere 2010 · BIM Compiler 2025</span>
</div>

现有的每一种工具都从几何入手，再向下游提取工程量——先画，后数。这个编译器把方向反过来：物料清单（BOM）是事实的来源，几何是编译出来的输出。采购不跟着设计走。设计跟着采购走。

| | 先画，后数 | 先数，后画 |
|---|---|---|
| **事实的来源** | 3D 模型（Revit、ArchiCAD） | 物料清单 |
| **工程量** | 设计之后再提取 | 与生俱来——BOM 就是工程量 |
| **改一面墙** | 重画 → 重新提取工程量 → 重新估算 | 改一行 BOM → 重新编译 |
| **合规** | 另一个检查器（Solibri） | 同一个规则引擎 |
| **成本** | 另一个估算工具 | 同一份 BOM × 价目表 |
| **进度** | 另一个工具（Primavera） | BOM 树的拓扑排序 |
| **证明** | 目视检查 | 结果确定——每个构件都可追溯到来源 |

基于 [iDempiere](https://idempiere.org/) ERP 的约定和 [SQLite](https://www.sqlite.org/) 构建，用 Three.js 在浏览器中原生渲染。来自马来西亚吉隆坡——自 2025 年七月起，那里要求所有价值不低于 RM10M 的项目使用 [BIM](StrategicIndustryPositioning.md)。这是创作者 [Redhuan D. Oon](mailto:red1org@gmail.com) 送给世界的礼物。

---

## 你真正会打开的三个应用

<div class="grid cards" markdown>

-   **🧱 BIM Viewer**

    ---

    拖入你自己的 IFC → 直接在浏览器里提取成 SQLite；合并各专业、漫游、碰撞矩阵、4D/5D 时间机——全都在同一个文件上。桌面和手机都能用，可离线工作。

    [:octicons-arrow-right-24: Viewer 指南](BIMUserGuide.md) · [打开](https://red1oon.github.io/bim-ootb/#buildings)

-   **✏️ DAGeVu Modeller**

    ---

    编写 B-rep 几何——插入库中零件、草图、拉伸、扫掠、编辑 **3D 网格**——其中带签名的操作日志*就是*特征树。

    [:octicons-arrow-right-24: Modeller 指南](ModellerGuide.md) · [打开](https://red1oon.github.io/bim-ootb/modeller/modeller.html)

-   **📊 Kernel-ERP**

    ---

    浏览器里的真正 iDempiere——POS、财务报表，以及来自 SQLite 的完整应用字典。没有 Java，没有服务器，无需安装。

    [:octicons-arrow-right-24: Kernel-ERP 指南](ERPUserGuide.md) · [收银台与厨房（uniCenta 孪生）](TillUserGuide.md) · [所有视角](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [打开](https://red1oon.github.io/bim-ootb/erp/erp.html)

</div>

---

## 核心理念

<figure style="float: right; margin: -8px 0 8px 20px; max-width: 280px; text-align: center;">
  <img src="assets/images/GeneralTall.png" alt="由 BOM 编译出的多层建筑——6 个专业用颜色区分" width="280">
  <figcaption style="font-size: 0.75em; color: #666; margin-top: 4px;">由 BOM 编译而成。颜色 = 专业（STR、ARC、ELEC、FP、ACMV、SP）。</figcaption>
</figure>

<div class="grid cards" markdown>

-   **碰撞检测——在浏览器里**

    ---

    按专业配对的规则、飞到碰撞处的可视化、实时的容差滑块、查看器内的审查流程。数万个构件，零服务器。

    [:octicons-arrow-right-24: 碰撞检测](CLASH_DETECTION.md)

-   **Kernel-ERP——对带签名操作日志的一次折叠**

    ---

    C_Order、C_OrderLine、M_Product、M_BOM——都是从 [iDempiere](https://idempiere.org/) 这个参照标准折叠而来。状态是对带签名操作日志的确定性折叠；就连 `AD_Process` 也是作为一次重放重新推导出来的，而不是一个方法。

    [:octicons-arrow-right-24: 黑皮书](FoldEngineBlackBook.html) · [:octicons-arrow-right-24: 跨 ERP 罗塞塔（含 SAP / ACDOCA）](ERPConceptRosetta.html) · [:octicons-arrow-right-24: ERP 世界观](MANIFESTO.md)

-   **企业级安全——无需服务器**

    ---

    没有中央服务器的密码学验证：HMAC 证明、Ed25519 身份签名、SHA-256 传输完整性。你的数据从不离开你的浏览器。

    [:octicons-arrow-right-24: 安全架构](EnterpriseAuthentication.md)

-   **可编辑的业务规则，实时生效**

    ---

    圣杯——改一条规则，看着模型和 ERP 重新折叠。空间 ERP，[每条记录都有位置](SpatialERP_OOTB.md)。

    [:octicons-arrow-right-24: 圣杯](HolyGrail.md) · [:octicons-arrow-right-24: 空间 ERP](SpatialERP_OOTB.md)

</div>

<div style="clear: right;"></div>

---

## 文档地图

| 我想要…… | 从这里开始 |
|------------|-----------|
| **快速上手（大家都从这里开始）** | [📖 **用户指南**](USER_GUIDE.md) |
| 在浏览器里查看建筑 | [BIM Viewer 指南](BIMUserGuide.md) |
| 编写几何 | [DAGeVu Modeller 指南](ModellerGuide.md) |
| 把 2D 图纸（DXF）变成 3D BIM 模型 | [2D 图纸 → BIM（DXF2BIM）](DXF2BIMGuide.md) |
| 从道路 IFC 文件集得到土木工程报告 | [土木工程——分步指南](CivilWorksGuide.md) |
| 在同一个界面上协作（谁做了什么、聊天） | [团队叠加层](TeamsOverlayGuide.md) |
| 看看最近发布了什么 | [最新动态](WhatsNew.md) |
| 运行浏览器版 ERP | [Kernel-ERP 用户指南](ERPUserGuide.md) |
| 用一行命令驱动这些应用（你自己或 AI） | [Fast Script 指南](FastScriptGuide.md) |
| 把公司从 Odoo、Business Central 或 SAP Business One 迁进来 | [迁移用户指南](MigrationGuide.md) · [Odoo 迁移是怎么做的](OdooMigration.md) |
| 运行收银台和厨房屏 | [收银台与厨房用户指南](TillUserGuide.md) |
| 看一栋建筑变成项目订单和 CAPEX 仪表板 | [BIM → ERP 与 CAPEX 仪表板](CapexDashboardGuide.md) · [CAPEX UAT 指南](CapexUATGuide.md) |
| 让外部 AI 向 Modeller 提出修改建议 | [AI 提议者指南](ProposerGuide.md) · [防御性披露](AIProposerDefensiveDisclosure.md) |
| 阅读或修改代码 | [开发者指南](DeveloperGuide.md) |
| 试用原型（概念验证，仅限示例数据） | [清真溯源](HalalTrace.md) · [打开](halal/index.html) · [大规模零售](RetailScaleStory.html) · [Glassbowl Gravity](glassbowl_gravity.html) · [架构之旅](bim_architecture_viz.html) |
| 了解 ERP 世界观 | [MANIFESTO——请先读](MANIFESTO.md) |
| 与其他工具比较 | [功能对比](FeatureComparison.md) · [迁移与对比（ERP）](MigrateComparisonPaper.md) |
| 看看它在行业中的位置 | [战略定位](StrategicIndustryPositioning.md) |
| 了解它是怎么做出来的 | [Vibe Programming——AI + 领域专长](VibeProgramming.md) |
| 把几何当作折叠来编写 | [DAGeVu Modeller——作为折叠的几何](ModellerKernelFold.md) |
| 在室内走到任意构件 | [查找与导航——室内寻路](RouteTemplate.md) |
| 分布式 / 离线 ERP | [分布式 ERP](DistributedERP.md) |
| 超越建筑 | [超越建筑——ShipYard](ShipYard.md) |
| 参与贡献 | [参与贡献——从这里开始](CONTRIBUTING.md) |

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
