---
description: BIM OOTB 用户指南——在 3D 中查看 IFC 建筑、编写几何，并运行 Kernel-ERP，全部在客户端的一个浏览器标签页里完成，零安装。
review: machine
source_sha: d3494de4a72ae85a
lang: zh-CN
---
# BIM OOTB——用户指南

一个浏览器。**查看**建筑 · **编写**几何 · **运行** ERP。零安装，全部在客户端。

!!! privacy "🔒 数据安全保证"
    **这个应用里没有 AI，也没有 LLM。你的数据从不离开你的浏览器。** 你拖入应用的任何文件，
    都留在浏览器自己的 IndexedDB 和内核之中，受标准浏览器安全机制保护——
    而且由你决定何时、存到哪里，把它存回你自己的机器。你拖入的每个 IFC、
    打开的每栋建筑、做的每次 ERP 编辑，都只留在你自己设备的客户端——没有任何东西上传给
    我们，也没有任何模型会拿到你的数据。着陆页和 Viewer 页面运行一个简单的访问计数器
    （GoatCounter）——它只统计页面访问次数（可能包含页面地址），从不读取或发送文件内容，离线时也不工作；ERP 里没有这个计数器。你自己触发的少数可选功能——分享链接（TinyURL）、二维码
    （qrserver.com）和更新检查（GitHub）——会调用对应的公共服务，只发送该功能所需的网址
    或请求，绝不发送你的文件。每个结果都是确定的，
    并且可追溯到一行你能读到的开源代码。

    [**阅读完整的保证——信任模型如何运作 →**](EnterpriseAuthentication.md) · 想在安装之后
    完全断开网络运行？[**完全离线 / 物理隔离安装
    指南 →**](OFFLINE_INSTALL_GUIDE.md)

![Matrix 着陆页——选择你的入口](assets/matrix_landing.png)

从**[前门 → red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/)** 开始——
Matrix 着陆页（红 / 蓝 → 圆形选择器）。选一个入口，或者直接用下面的网址跳到任意应用。
**给它们中的任何一个加书签**；在任何界面上按 **Home** 都能回到前门。再次访问时，
着陆页会显示精简的 `⋯` 启动器；**刷新**即可再次看到完整的圆形选择器。

**只是想快速处理一件 IFC 的小事？** 升级到 IFC4.3、把某一项单独拉出来做成自己的 IFC、按楼层拆分，或者检查模型是否健康——拖入文件，它就会运行。**[BIM 工具——用户手册 →](BIMToolsGuide.md)**

最近才来？请看 **[最新动态](WhatsNew.md)**，那里持续记录已发布的改动。

## 选择一个界面

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg> __BIM Viewer__

    **拖入你自己的 IFC** → 直接在浏览器里提取成 SQLite；合并各专业、漫游、碰撞矩阵、4D/5D 时间机、ERP 项目订单——全都在同一个文件上。桌面和手机都能用，可离线工作。

    _前门 → **Buildings / IFC** 图标（见上）_ · [打开](https://red1oon.github.io/bim-ootb/#buildings) · [指南](BIMUserGuide.md) · [土木工程（道路模型）](CivilWorksGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg> __DAGeVu Modeller__

    编写 B-rep 几何——插入库中零件、草图、拉伸、扫掠——其中带签名的操作日志*就是*特征树。早期 / 开发中；桌面。

    _前门 → **BIM Modeller** 图标（见上）_ · [打开](https://red1oon.github.io/bim-ootb/modeller/modeller.html) · [指南](ModellerGuide.md) · [AI 提议者指南](ProposerGuide.md) · [2D 图纸 → BIM（DXF2BIM）](DXF2BIMGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> __Kernel-ERP__

    浏览器里的真正 iDempiere——POS、财务报表，以及来自 SQLite 的完整应用字典。没有 Java，没有服务器，无需安装。

    _前门 → **ERP** 图标（见上）_ · [打开](https://red1oon.github.io/bim-ootb/erp/erp.html) · [指南](ERPUserGuide.md) · [收银台与厨房（POS，uniCenta 孪生）](TillUserGuide.md) · [其他视角](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [从 Odoo / Business Central 迁移](MigrationGuide.md) · [命令行（Fast Script）](FastScriptGuide.md) · [团队叠加层](TeamsOverlayGuide.md)

</div>

> **ERP 从业者**——实施顾问、高级用户、开发者，以及其他 ERP 项目——请先看
> **[迁移与对比](MigrateComparisonPaper.md)**：Kernel-ERP 如何把一个在线的 iDempiere（以及 Odoo）
> 租户折叠到一份带签名的操作日志上，哪些方面经得起与传统系统的比较，以及坦白的差距。

## 每个应用都有自己的地址

每个应用都是一个独立的页面，有自己的地址。打开一个，只加载那一个应用，不加载其他的，所以
小任务就保持小。比如收银台，从不加载 3D 查看器。

| 应用 | 地址 | 首次访问下载量 |
|---|---|---|
| 前门 | [red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/) | 约 0.1 MB |
| BIM Viewer | […/viewer/viewer.html](https://red1oon.github.io/bim-ootb/viewer/viewer.html) | 约 3 MB，外加你打开的建筑 |
| DAGeVu Modeller | […/modeller/modeller.html](https://red1oon.github.io/bim-ootb/modeller/modeller.html) | 约 1.3 MB |
| ERP 起始页（气泡） | […/erp/erp.html](https://red1oon.github.io/bim-ootb/erp/erp.html) | 约 0.1 MB |
| ERP 表单（iDempiere 外观） | […/erp/idempiere.html](https://red1oon.github.io/bim-ootb/erp/idempiere.html) | 约 1.4 MB，外加 ERP 数据库的约 7 MB |
| 收银台 · 厨房屏 | […/erp/till.html](https://red1oon.github.io/bim-ootb/erp/till.html) · […/erp/kitchen.html](https://red1oon.github.io/bim-ootb/erp/kitchen.html) | 约 0.1 MB · 不到 0.1 MB |

ERP 表单页在首次访问之后，会把它的数据库保存在你的浏览器里，所以之后再访问就不用
重新下载。*大小统计于 2026-11-08，来自已发布的文件（压缩后，即网络上实际传输的大小）。*

## 作为团队协作

几个人——或者你自己的几台设备——可以在**没有数据库服务器、也没有应用服务器**的情况下，处理同一批记录（ERP 里的订单、Modeller 里的建筑）。
按下 **Team** 药丸按钮（两个人头；
在 Modeller 里是 Team 图标），再按**开启团队模式**；第一台设备**创建团队**，其他设备**加入**，
并在那里获得批准，然后每个人按下 **Visit**，发送自己的改动并取回别人的改动。
一个现成的试用场所，让你不用做任何设置就能试一遍完整的周期。

[:octicons-arrow-right-24: 团队指南](https://red1oon.github.io/bim-ootb/erp/team_guide.html) ·
[如何核实条款](TermsHowToVerify.md) ·
[团队叠加层（ALPHA 演示：谁做了什么的圆点、聊天、图表）](TeamsOverlayGuide.md)

## 前门上的其他入口

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> __About & Install__

    BIM OOTB 是什么，以及怎样留住它。它是一个**零摩擦的 PWA**——你的浏览器可以*安装*它（添加到主屏幕），让它**离线运行，无需服务器**。同一个窗口里还有一个**自己运行**（DIY）标签页：下载一个一步到位的安装脚本和 README，把整套系统部署到你自己的机器上。

    _前门 → **About** 图标（见上）_ · [自托管指南](SYSTEMS_INSTALLER_GUIDE.md) ·
    [完全离线 / 物理隔离安装](OFFLINE_INSTALL_GUIDE.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> __Clear Cache__

    重置到起始画面。只清除**浏览器内的建筑数据**——缓存的建筑，以及你拖入但从未存成 `.db` 的任何 IFC 场景——并带你回到红 / 蓝入口。**保留**已安装的应用、它的离线数据，以及你自己保存的任何 `.db` 文件。

    _前门 → **Trash** 图标（见上）_

</div>

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
