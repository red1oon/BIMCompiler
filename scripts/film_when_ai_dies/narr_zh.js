// ⚠ DO NOT REMOVE — film "When AI Dies", the MANDARIN narration (FILM_LANG=zh): the SAME beats, cues and facts as narr.js; every figure still comes from facts_view.js through n('<fact key>') as plain digits.
// "A-I" and "E-R-P" are written letter by letter in the VOICE (single syllables are unclear), and tsv.js writes the caption copy with AI / ERP (PLAYBOOK C, Malay note). Voices: Edge zh-CN Xiaoxiao (F) / Yunxi (M), no pitch rise (tonal).
// Translated by the build session, not reviewed by a native speaker.
'use strict';
module.exports = (V, ROADMAP, mk) => [
  { id: 'cover', hold: 4.2 },
  mk('before', n => 'F: 如果 A-I 助手突然不回答了呢？ | M: 那凭感觉写代码也就停了。这是真正的编辑器，设置里已经关掉了 A-I 功能，只装了 ' + n('ext.count') + ' 个插件，它只负责读代码仓库。'),
  mk('q1', n => 'F: 这个字段在哪里用到？ | M: 按 Shift F12。应用里设置或读取它的每个地方，一共 ' + n('refs.places') + ' 处，分布在 ' + n('refs.files') + ' 个文件里，不管写成什么名字。单靠编辑器自己，只找到 ' + n('refs.builtin_defs') + ' 个其他定义。', { plain: ['twelve'] }),
  mk('q2', n => 'F: 我改一个字段时，会运行什么？ | M: 在 E-R-P 窗口里把鼠标放上去。' + n('erp.layers') + ' 层代码，按触发顺序排列：数据字典、值变化时的回调、选择器的规则、保存时的钩子。按 Alt 加 1，编辑器就打开那一行。 | F: 它会出错吗？ | M: 在 ' + n('erp.fields') + ' 个字段上检查过，错误的行有 ' + n('erp.wrong_line') + ' 行。', { plain: ['one'] }),
  mk('q3', n => 'F: 这一行上次打印了什么？ | M: 把鼠标放在标签上，它显示最近一次的值，这里是 ' + n('tag.hosted_total') + ' 个依附在宿主上的构件，还有它来自的日志和提交。如果代码之后改过，它会说明为什么不显示。'),
  mk('q4', n => 'F: 我是不是在破坏重放？ | M: 在核心文件里敲一个时钟调用。编辑器会画下划线，说明原因，并告诉你该改调用什么。持续集成会因为同样的调用而失败，被监视的核心文件有 ' + n('purity.core_files') + ' 个。'),
  mk('q5', n => 'F: 我发布对了吗？ | M: 按 Bump。它在后台检查，变成实心，再按一次就写入缓存版本，加 ' + n('bump.step') + '。对于 E-R-P 文件，它还会加上与旧系统对照的关卡，这个关卡自己的测试通过了 ' + n('bump.parity_judged') + ' 项检查。'),
  mk('why', n => 'F: 它为什么不会弄错我的代码？ | M: 它不存有任何代码知识。它只读仓库自己生成的文件，不知道的时候会直说。我们没有切断网络，而是列出了它的代码里每一个能连网的地方。' + n('off.features') + ' 个功能，' + n('off.net') + ' 个入口。只有检查线上网站和部署会连接 GitHub。'),
  mk('passenger', n => 'F: 那 A-I 助手回来了呢？ | M: 它像乘客一样搭便车。这个命令把打开文件的事实复制出来，' + n('ctx.lines') + ' 行，给它阅读。编辑器不调用任何模型。'),
  mk('roadmap', n => 'F: 还有什么没做？ | M: ' + n('roadmap.items') + ' 样，而且只是设计。下一个是建模器的模块清单，然后是命名的部件、负责人表和证明图。'),
  mk('close', n => 'F: 那 A-I 不在的时候，还剩下什么？ | M: 你的工具所知道的：用在哪里，运行什么，打印过什么，重放会不会坏，发布对不对。 | F: 在哪里读更多？ | M: 开发者指南的 X0 Navigator 一节。链接和前人的工作都在这张卡上，但指南是英文的。')
];
