// ⚠ DO NOT REMOVE — film "When AI Dies", the MANDARIN (Simplified) card texts (FILM_LANG=zh). Same keys as i18n.js: t() throws on a missing one. Translated by the build session, NOT reviewed by a native speaker (the last card says so).
// Code, § lines, file names, key names and proper names (VS Code, ERP, GitHub, Bump, X0 Navigator, Modeller, bim-ootb) stay as the evidence has them.
'use strict';
const ZH = {
  'cover.kicker': '当 AI 失效的时候', 'cover.t1': '凭感觉写代码的日子可能要结束了', 'cover.t2': '除非你的编辑器懂你的代码', 'cover.line': '这部片子里没有 AI 助手：真正的 VS Code，AI 功能已关闭，用的是真正的 bim-ootb 代码',
  'cmd.before': '# 助手没了。改问编辑器。', 'cmd.q1': '# APP.db 在哪里用到？', 'cmd.q2': '# 我改这个字段时，会运行什么？', 'cmd.q3': '# 这一行上次打印了什么？', 'cmd.q4': 'Date.now()', 'cmd.q5': '# 做完了。bump 一下。', 'cmd.passenger': '# AI 回来了。给它事实，不要给它猜测。',
  'bar.top': '键入的一行，和编辑器的回答', 'bar.bottom': '真正的 VS Code，AI 功能已关闭', 'bar.erp': '真正的 ERP 页面，开发者悬停提示由书签脚本加载',
  'st.before': '这个配置档自己的 settings.json', 'st.q1': 'Shift+F12：引用面板', 'st.q2a': '把鼠标放在销售订单窗口的一个字段上', 'st.q2b': 'Alt+1：编辑器打开它指出的那一行', 'st.q3': '悬停在标签上：最近的值、它的日志、它的提交',
  'st.q4': '核心文件里的时钟调用：下划线和它的说明', 'st.q5a': '文件改了：Bump 按钮在等待', 'st.q5b': 'Bump：正在后台检查', 'st.q5c': 'Bump ✓：检查通过，再按一次才会写入', 'st.q5d': '已写入：缓存版本加一',
  'st.passenger': 'Context for this file，在代码旁边打开',
  'a.before.set': '从 VS Code 读取：chat.disableAIFeatures = {v}', 'a.before.ext': '不是内置的插件：{n} 个',
  'a.q1.key': 'Shift+F12  ->  {places} 处，分布在 {files} 个文件里', 'a.q1.def': '编辑器自带的 JavaScript 支持：其他定义 {n} 个',
  'a.q2.hover': '悬停 {field}  ->  {layers} 层，按触发顺序', 'a.q2.key': '{key} 打开 {at}',
  'a.q3.val': '最近的值，来自保存的日志，并证明仍与代码一致', 'a.q3.src': '它来自的日志和提交',
  'a.q4.warn': '{file}:{line}  警告 {code}', 'a.q4.why': '原因，以及该改调用什么，就在下面的提示里',
  'a.q5.idle': '功能完成后按 Bump', 'a.q5.chk': '正在后台检查：你可以继续工作', 'a.q5.ready': '真正的检查通过了；还没有写入任何东西',
  'a.pass.cmd': 'X0 Navigator: Context for this file', 'a.pass.res': '已复制 {n} 行给助手，并在代码旁边打开', 'a.pass.note': 'X0 不调用任何模型：你把这一块贴到哪里都行',
  'why.h1': '它不会跑偏：X0 不存有你的代码知识', 'why.sub': '它只读仓库自己生成并检查的文件，不知道的时候会直说。',
  'why.proof': '诚实的证据：我们没有切断网络，而是列出了它的代码里每一个能连网的入口', 'why.und': '帮助理解代码的功能', 'why.ship': 'Run and Ship 功能（它们会连接 GitHub，指南里也这样写）',
  'why.doors': '{n} 个入口', 'why.red': '红色对照：在 tag hover 的副本里故意放进的 fetch() 被数出来了', 'why.setting': '以及这个配置档自己的设置', 'why.iso': '没有任何东西送到浏览器，没有依赖',
  'rm.kicker': '尚未构建', 'rm.title': '只做了设计的部分', 'rm.foot': '这部片子只展示已经构建并合并的内容。设计见 prompts/CODE_ARCHITECTURE_DESIGN.md 的 B 到 E 部分。',
  'rm.B1': 'Modeller 的模块清单（下一步：构建规格已写好；B0 是检查，已构建）', 'rm.C': '共享对象的命名部件，每个部件有唯一的负责人', 'rm.D': '负责人表：哪个文件回答哪个问题', 'rm.E': '证明图：哪个测试证明哪条规则',
  'cl.h1a': '我们学到了什么，', 'cl.h1b': '谁为它担保', 'cl.col1': '前人的工作：学到的一课', 'cl.col2': '凭据', 'cl.col3': '延伸阅读',
  'cl.pr': '已合并到 bim-ootb：{list}', 'cl.wit': '本次构建中通过的测试', 'cl.limit': '局限，直说', 'cl.limit1': 'Bump 测试里与旧系统对照的那一行这次被跳过了（它会写入测试服务器）', 'cl.limit2': '对网络入口的检查读的是代码，不是真的切断网络',
  'cl.guide': '开发者指南，X0 Navigator 一节（英文）', 'cl.guide2': '这份指南是英文的', 'cl.keys': '键盘声：eklee 和 qubodup，OpenGameArt "Single Key Press Sounds"，CC BY 3.0 · 画面：真正的 VS Code 和真正的 ERP 页面，在 CPU 上运行，没有用 GPU',
  'pr.2985': '引用', 'pr.3055': 'ERP 悬停', 'pr.2970': '标签的最近值', 'pr.3209': '核心纯净性', 'pr.3162': 'Bump', 'pr.2966': '文件上下文',
  'pa.0.does': '预先算好的转储，不用运行服务器就能回答跳转定义和引用', 'pa.0.took': '答案来自事先生成的文件，不是来自实时运行的模型',
  'pa.1.does': '放在源码旁边的索引文件，编辑器按它查找', 'pa.1.took': '仓库可以重新生成的索引；是查找，不是猜测',
  'pa.2.does': '需要重放的代码，不能读时钟，也不能对外调用', 'pa.2.took': '核心文件警告背后的规则',
  'pa.3.does': '你输入的同时，在代码旁边显示实时运行的值', 'pa.3.took': '代码行旁边的值；这里只显示保存下来的值，并证明它来自这份代码',
  'feat.references': '引用', 'feat.field_hover_and_f12': '字段悬停和 F12', 'feat.tag_hover': '标签悬停', 'feat.value_beside_the_code': '代码旁的值', 'feat.purity_warning': '核心纯净性警告', 'feat.context_for_a_file': '文件上下文', 'feat.fetch_back': 'Fetch back', 'feat.deploy_main_now': 'Deploy main now', 'feat.memory_of_the_pages': '页面的内存',
  'cl.tr': '由制作本片的会话翻译，未经母语者审阅'
};
module.exports = { zh: ZH };
