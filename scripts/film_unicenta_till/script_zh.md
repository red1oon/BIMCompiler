<!-- ⚠ DO NOT REMOVE — Scope: Mandarin narration source of the film "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34.G; PLAYBOOK C "Mandarin / CJK version"). Same ids, cues, turn count and facts as script_en.md; numbers in Chinese numerals, each one a fact of facts.spec.json (field "zh"). The text is the CAPTION; tsv.js derives the voice (ERP, POS, ActiveMQ spoken as letters). READ THE LOG after every run. -->
# 分镜 — 旁白（v1，ZH）

| # | Beat | On screen | Narration |
|---|---|---|---|
| 1 | b0a Before | (see script_en.md) | "F: 开始之前，所有者在二零一一年做了什么？ | M: 这是所有者自己画的图：ERP，中间是 ActiveMQ 消息队列，还有 POS。三个部分异步工作。队列只负责存放数据，而且它是需要自己安装、自己运行的服务器。" |
| 2 | b0b After | (see script_en.md) | "F: 那现在有什么不同？ | M: 还是这三个部分，还是延迟交换：日终上传，日初下载。收银台是离线也能工作的浏览器标签页，中间只是个普通信箱，不用运行服务器，总部则是浏览器，或者原来的 iDempiere。" |
| 3 | b1p Original | (see script_en.md) | "F: 等等，那个界面也有同样的 Tools 图块，Hoe 和 Rake。 | M: 是的。那是二零一一年所有者指南里，Openbravo 的收银台，那张小票上有两把锄头和三把竹耙。现在它在浏览器标签页里。" |
| 4 | b1a Know | (see script_en.md) | "F: 这真的像 uniCenta 吗？ | M: 收银员登录后，在 Register 菜单里，选 Sales，就看到熟悉的销售界面。二十五项 uniCenta 日常任务，二十五项全部通过对照检查。" |
| 5 | b1b Sale | (see script_en.md) | "F: 那收银卖东西呢？ | M: 两棵玫瑰，加锄头和庭院椅，全部是真实点击。现金和刷卡合并付款，然后是小票。" |
| 6 | b1c Fold | (see script_en.md) | "F: 图片目录占的地方不小吧？ | M: 所以轻点就能折叠起来，需要时再展开。" |
| 7 | b2a Floor | (see script_en.md) | "F: 餐厅呢？ | M: 楼面图把每张餐桌连同椅子都画出来。打开餐桌，加上订单，按下 Send Order，厨房屏幕上就出现订单卡片。" |
| 8 | b2b Bump | (see script_en.md) | "F: 这要多少网络流量？ | M: 打开餐桌只写入一次，点选商品不写入。送达一份订单需要三十八次中继请求，不管有一行还是八行。 | F: 厨师做好之后呢？ | M: 厨师把卡片划掉，收银台显示已就绪，预订的餐桌也以同样的方式登记入座。" |
| 9 | b3a Tills | (see script_en.md) | "F: 几台收银台，几次日结。总部能从它们那里听到什么？ | M: 销售时总部什么也听不到。三台收银台，各自在 localhost 上，收了五张小票，向互联网发出的请求是零。主收银台通过分店中继，按时间戳收集它们的八行订单，绝不重复收取。" |
| 10 | b3b Main till | (see script_en.md) | "F: 那么谁和总部联系？ | M: 只有主收银台，而且只发一次。它的屏幕列出每台的小票，分店合计等于各台自己日结的总和。然后向互联网中继发送一次，总部从那里取走。" |
| 11 | b4a Close | (see script_en.md) | "F: 那到了次日早上，在总部呢？ | M: 点击 Branch Day Close。它导入当天的销售，并按店员同样的顺序执行补货。" |
| 12 | b4b Count | (see script_en.md) | "F: 以前这要多少步？ | M: 六个屏幕上二十八次点击。现在一个屏幕上九次点击。这个次数是从菜单路径读出来的，不是录屏。 | F: 账目相同吗？ | M: 逐行完全吻合。在检验过的测试里，与逐步操作相比的差异为零；而在收银台卖出的物料清单商品，会扣除它的部件：六、二十四和一千五百。" |
| 13 | b5a Price | (see script_en.md) | "F: 价格变动怎样到达各收银台？ | M: 通过早间批次，而且只发有变化的部分。总部改了一个价格，只发出一行，其余二十六个保持原样。" |
| 14 | b5b Receive | (see script_en.md) | "F: 收货入库呢？ | M: 发出五件，到了三件，报废一件。确认会随下次日终发送上传。总部库存从二十变成十五，门店从四变成六。" |
| 15 | b6 Legacy | (see script_en.md) | "F: 这些和 iDempiere 对照过吗？ | M: 对照过，我们让双方都运行并比较。补货移动、移动确认、差异单据和库存存储，四项全部吻合。其中包括移动的四十二个表头列，和二十一个明细列。价格时间戳没有对照。" |
| 16 | b7 NotYet | (see script_en.md) | "F: 还有什么没做完？ | M: 四件事。原版在文本里写九点零，我们写九，这个差异我们不接受，会在我们这边修正。价格变更的时间戳无法对照，因为原版的网络服务不能编辑那张表。收银台之间通过真实中继共用餐桌，还没有证明。还有加载全部图片后的内存占用，还没有测量。" |
| 17 | b8 Credits | (see script_en.md) | "F: 这是建立在谁的基础上的？ | M: 所有者自己二零一一年的集成，是在先成果：它经 ActiveMQ，把 Openbravo POS，与 ADempiere、iDempiere 连起来，也就是延迟的日终、日初中继。我们沿用 uniCenta 界面和流程，没有复制任何代码或美术资源。商品图片是 Fluent Emoji，采用 M.I.T. 许可证。承诺：操作相同，账目相同，外观与原版相同，无需安装。" |
| 18 | b0c Expand | (see script_en.md) | "F: 那么整家店是什么样子？ | M: 收银台展开成了分店。好几台收银台，各自在 localhost 上物理隔离，没有公网地址。 | F: 它们怎么协作？ | M: 店里有个小小的分店中继把它们连起来，只传递店内自己的数据。 | F: 那谁和总部联系？ | M: 只有主收银台。它持有总部的库存数，并收集其他台的订单行。它的日终数据上传，日初数据下载。如果分店中继断了，每台收银台照常销售。" |
