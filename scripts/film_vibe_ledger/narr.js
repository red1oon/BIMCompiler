// ⚠ DO NOT REMOVE — film "Vibe coding, honestly" (prompts/FILM_VIBE_CODING_LEDGER.md): the beats and their narration (F asks what a newcomer would ask, M answers in one or two plain sentences).
// Every figure goes through n('<fact key>', mode), which spells the value from out/facts.json in words and records [key, value, mode, words] in the beat's `says`. guard.js re-spells each one and
// FAILS a number word that is not a recorded fact. READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'facts.json'), 'utf8'));
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = n => { n = Math.round(Number(n)); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
  if (n < 1e6) return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + words(n % 1000) : ''); return words(Math.floor(n / 1e6)) + ' million' + (n % 1e6 ? ' ' + words(n % 1e6) : ''); };
// mode: int (exact) · k (rounded to thousands: "seventy thousand") · m1 (millions, one decimal: "one point four million") · r (rounded to a whole number) · word (the fact already IS a word)
const LANG = process.env.FILM_LANG || 'en';
// Mandarin speaks figures as digits (Edge reads them natively); rounded figures in 万 (ten thousands): 316459 -> 32万, 1427147 -> 143万
const speakZh = (val, mode) => { const x = Number(val); if (mode === 'word') return { three: '3' }[val] || (() => { throw new Error('zh: no digit for the word ' + val); })();
  if (mode === 'k' || mode === 'm1') return Math.round(x / 1e4) + '万'; if (mode === 'r') return String(Math.round(x)); if (!Number.isInteger(x)) throw new Error('int mode on ' + val); return String(x); };
const speakEn = (val, mode) => { const x = Number(val);
  if (mode === 'word') return String(val); if (mode === 'k') return words(Math.round(x / 1000)) + ' thousand'; if (mode === 'r') return words(Math.round(x));
  if (mode === 'm1') { const m = (Math.round(x / 1e5) / 10).toFixed(1).split('.'); return words(+m[0]) + ' point ' + ONES[+m[1]] + ' million'; } if (!Number.isInteger(x)) throw new Error('int mode on ' + val); return words(x); };
const speak = LANG === 'zh' ? speakZh : speakEn;
const ROADMAP = [['CI', 'the full witness suite in CI ({ci} of the scripts run there today)'], ['B1', 'the module manifests (the Modeller\'s first: its build spec is written)'], ['C–E', 'named parts, an owner table and a proof map: designed only']];
const val = k => { if (k === 'roadmap.items') return String(ROADMAP.length); if (k === 'size.app.files') return String(+F.v['size.app_js.files'].val + +F.v['size.app_html.files'].val); if (k === 'erp.month') return String(+/--since=\d{4}-(\d{2})/.exec(F.cmds.v1.cmd)[1]); if (k === 'readme.old') return F.cmds.c3.out[0].match(/About ([\d,]+)/)[1].replace(/,/g, '');
  if (!F.v[k]) throw new Error('no fact ' + k); return F.v[k].val; };
const mk = (id, build, extra) => { const says = [], n = (k, mode) => { const v = val(k), sp = speak(v, mode || 'int'); says.push([k, v, mode || 'int', sp]); return sp; };
  const cap = t => t.replace(/(^F: |M: |[.?!] )([a-z])(?!Dempiere)/g, (m, a, b) => a + b.toUpperCase());   // never 'IDempiere'
  return Object.assign({ id, text: cap(build(n)), says }, extra || {}); };
const ch = (id) => ({ id, hold: 3.6 });
const beats = [
  { id: 'cover', hold: 4.2 },
  mk('before', n => 'F: Is vibe coding a good idea? | M: The industry is not so sure. In the biggest developer survey of the year, ' + n('so.distrust') + ' percent distrust the accuracy of A.I. tools, and only ' + n('so.trust') + ' percent trust it. One security study found risky flaws in ' + n('vc.flaw') + ' percent of its tests of A.I. code.'),
  mk('after', n => 'F: So why this project? | M: One person, a machine, and an A.I., all in the open. That is ' + n('commits') + ' commits since May. | F: Checked by hand? | M: By scripts. That is the whole story.'),
  ch('ch1'),
  mk('u1', n => 'F: Tell me what is unique about it. | M: One browser tab runs a building viewer, a modeller and a full E.R.P. No server, no install, no build step. The whole app has ' + n('deps') + ' runtime dependency: the database engine.'),
  mk('u2', n => 'F: How do the viewer and the E.R.P. share their data? | M: Through one signed log. Every change is a record, signed and chained to the one before. This check plants forged and revoked records, and each is rejected. | F: How many checks? | M: ' + n('rv.checks') + ', and all of them pass.'),
  ch('ch2'),
  mk('v1', n => 'F: Why does vibe coding work here? | M: Because an A.I. copies patterns well. The E.R.P. follows ' + n('erp.years') + ' years of open iDempiere code, and it sailed: ' + n('erp.june') + ' E.R.P. commits in June alone. | F: And the geometry? | M: No pattern to copy. Ask whether a wall sits on a slab, and the A.I. guesses.'),
  mk('v2', n => 'F: So who checks the guesses? | M: Witness scripts. This repo has ' + n('witness.files') + ' of them. Each one states a claim as numbers, and must say so when it judged nothing.'),
  ch('ch3'),
  mk('s1', n => 'F: Does it scale? | M: About ' + n('size.app_js.lines', 'k') + ' lines of app code, with no build step, and nearly as many lines of witnesses beside it. | F: What holds it together? | M: A pure core of ' + n('pure.files') + ' files that may not read the clock or the network. C.I. checks it on every push, and finds ' + n('pure.forbidden') + ' breaks.'),
  mk('s2', n => 'F: What is not there yet? | M: The next guardrails are only designed: a module list per app, named parts, an owner table. The E.R.P. already caches ' + n('precache.erp') + ' files for offline use, so those lists matter. And one check takes about ' + n('c7.s') + ' seconds, so C.I. skips it.'),
  ch('ch4'),
  mk('l1', n => 'F: How does it compare with iDempiere, where it came from? | M: iDempiere is about ' + n('idem.lines', 'm1') + ' lines of Java, on a server, with PostgreSQL. The Kernel E.R.P. folds it into about ' + n('erp.lines', 'k') + ' lines of JavaScript, in the tab. | F: Are the books the same? | M: On every scenario compared, ' + n('par.match') + ' of them, to the cent. But only ' + n('par.tables') + ' of ' + n('par.tables_of') + ' document tables are covered so far.'),
  mk('l2', n => 'F: And Odoo, or E.R.P. Next? Are they P.H.P.? | M: No, both are Python on the server, and both already write much of their screen in JavaScript: Odoo about ' + n('lang.odoo.js', 'r') + ' percent. But their books still need a server and a database server. Ours stay in the tab.'),
  mk('l3', n => 'F: So is the legacy worse? | M: Not at all. Java gives iDempiere types, a compiler and a debugger, which catch mistakes before they run. Odoo has about ' + n('stars.odoo', 'k') + ' stars on GitHub; this project has ' + n('stars.ours') + '. We trade that for no server, and fill the gap with witnesses.'),
  ch('ch5'),
  mk('c1', n => 'F: Did it ever go wrong? | M: Yes, the way vibe coding goes wrong everywhere. Witnesses that passed without judging anything. One session that took back the same finding ' + n('retract.times', 'word') + ' times. A sales cycle marked tested, broken on every window. | F: So what is different? | M: Each failure became a written rule that the next session must read.'),
  mk('c2', n => 'F: Do the checks block a bad commit? | M: Only some. C.I. runs ' + n('ci.total') + ' of the ' + n('witness.files') + ' witnesses. The rest, the geometry ones too, run before a commit, by habit: a promise kept by people and sessions, not by a machine.'),
  mk('c3', n => 'F: And the numbers in your own README? | M: They drifted. It said about ' + n('readme.old') + ' files of app code. Counted with the project\'s own tool: ' + n('size.app.files') + '. | F: Fixed? | M: The same day. And an A.I. review we read had already repeated our first wrong number.'),
  mk('c5', n => 'F: No server means nothing to attack? | M: Smaller, but still there. It still fetches building files from cloud storage, falls back to a public library site, relays team messages through GitHub and Gmail, and talks to the legacy E.R.P.\'s web services. The signing keys live in the tab. | F: And for a newcomer? | M: Steep. A geometry kernel, the iDempiere dictionary as JavaScript, and verbs of its own.'),
  mk('aid', n => 'F: And if the A.I. goes away? | M: Then the editor must know the code. That is the film When A.I. Dies: the real VS Code with its A.I. switched off, still answering from what the repo generates. The link is on the card.'),
  mk('roadmap', n => 'F: What is not built yet? | M: ' + n('roadmap.items') + ' things. The full witness suite in C.I. The module lists. And named parts, an owner table and a proof map, which are only designed.'),
  mk('close', n => 'F: So, does vibe coding work? | M: Here, yes, because nothing is taken on trust. The A.I. writes fast, the witnesses check every claim as numbers, and the weak spots are written down. | F: Where do I read more? | M: The Vibe Programming page. The link and the sources are on this card.')
];
// MANDARIN: the same beats, ids and facts. "A-I", "E-R-P", "P-H-P" are written letter by letter in the VOICE; tsv.js writes the caption copy with AI / ERP / PHP. Translated by the build session, not reviewed by a native speaker.
const ZH = [
  { id: 'cover', hold: 4.2 },
  mk('before', n => 'F: 凭感觉写代码，是个好主意吗？ | M: 业界并不确定。在今年最大的开发者调查里，' + n('so.distrust') + '% 的人不信任 A-I 工具的准确性，只有 ' + n('so.trust') + '% 的人信任。一项安全研究发现，在 ' + n('vc.flaw') + '% 的 A-I 代码测试里，都有危险的安全漏洞。'),
  mk('after', n => 'F: 那为什么做这个项目？ | M: 一个人，一台机器，一个 A-I，全部公开。到现在一共 ' + n('commits') + ' 次提交。 | F: 靠人手检查？ | M: 靠脚本检查。这就是全部的故事。'),
  ch('ch1'),
  mk('u1', n => 'F: 说说它有什么独特之处。 | M: 一个浏览器标签页里，运行着建筑查看器、建模器和完整的 E-R-P。没有服务器，不用安装，不用构建。整个应用只有 ' + n('deps') + ' 个运行时依赖：数据库引擎。'),
  mk('u2', n => 'F: 查看器和 E-R-P 怎么共享数据？ | M: 通过一份签名的日志。每个改动都是一条记录，签了名，并和前一条链在一起。这个检查故意放进伪造的和已吊销的记录，每一条都被拒绝。 | F: 有多少项检查？ | M: ' + n('rv.checks') + ' 项，全部通过。'),
  ch('ch2'),
  mk('v1', n => 'F: 为什么凭感觉写代码在这里行得通？ | M: 因为 A-I 擅长照着模式写。E-R-P 跟随 ' + n('erp.years') + ' 年开源的 iDempiere 代码，一帆风顺：光是 ' + n('erp.month') + '月 就有 ' + n('erp.june') + ' 次 E-R-P 提交。 | F: 那几何呢？ | M: 没有模式可以照着写。问它墙是不是坐在楼板上，A-I 就只能猜。'),
  mk('v2', n => 'F: 那谁来检查这些猜测？ | M: 见证脚本。这个仓库里有 ' + n('witness.files') + ' 个。每一个都把一个说法写成数字来检查；如果什么都没有判断，就必须如实说出来。'),
  ch('ch3'),
  mk('s1', n => 'F: 它能扩展吗？ | M: 大约 ' + n('size.app_js.lines', 'k') + ' 行应用代码，不用构建，旁边还有差不多一样多的见证代码。 | F: 靠什么撑住？ | M: 一个由 ' + n('pure.files') + ' 个文件组成的纯核心，不许读时钟，也不许连网。每次推送，持续集成都会检查，发现的违规是 ' + n('pure.forbidden') + ' 处。'),
  mk('s2', n => 'F: 还缺什么？ | M: 下一批护栏只是设计：每个应用一份模块清单、命名的部件、负责人表。E-R-P 已经为离线使用缓存了 ' + n('precache.erp') + ' 个文件，所以这些清单很重要。还有一项检查要大约 ' + n('c7.s') + ' 秒，所以持续集成把它跳过了。'),
  ch('ch4'),
  mk('l1', n => 'F: 和它的来源 iDempiere 比起来怎么样？ | M: iDempiere 大约有 ' + n('idem.lines', 'm1') + ' 行 Java 代码，跑在服务器上，用 PostgreSQL。Kernel E-R-P 把它折叠成大约 ' + n('erp.lines', 'k') + ' 行 JavaScript，就在标签页里。 | F: 账是一样的吗？ | M: 在对比过的每个场景里都一样，一共 ' + n('par.match') + ' 个，精确到分。但是 ' + n('par.tables_of') + ' 张单据表里，目前只覆盖了 ' + n('par.tables') + ' 张。'),
  mk('l2', n => 'F: 那 Odoo 或者 E-R-P Next 呢？它们是 P-H-P 吗？ | M: 不是，它们都是服务器上的 Python，而且屏幕部分都已经大量用 JavaScript 来写：Odoo 大约 ' + n('lang.odoo.js', 'r') + '%。但它们的账仍然需要一台服务器和一台数据库服务器。我们的账留在标签页里。'),
  mk('l3', n => 'F: 那旧系统是不是更差？ | M: 完全不是。Java 给了 iDempiere 类型、编译器和调试器，能在运行之前抓住错误。Odoo 在 GitHub 上大约有 ' + n('stars.odoo', 'k') + ' 颗星，这个项目有 ' + n('stars.ours') + ' 颗。我们用这些换来了不需要服务器，再用见证脚本补上差距。'),
  ch('ch5'),
  mk('c1', n => 'F: 它出过问题吗？ | M: 出过，就像凭感觉写代码在哪里都会出的问题。见证脚本什么都没判断，就报告通过。一个会话把同一个结论收回了 ' + n('retract.times', 'word') + ' 次。一个标着已测试的销售流程，每个窗口都是坏的。 | F: 那有什么不同？ | M: 每一次失败都变成一条写下来的规则，下一个会话必须先读。'),
  mk('c2', n => 'F: 这些检查能挡住坏的提交吗？ | M: 只能挡住一部分。持续集成运行 ' + n('witness.files') + ' 个见证脚本里的 ' + n('ci.total') + ' 个。其余的，包括几何的那些，都是提交之前凭习惯运行：一个靠人和会话遵守的承诺，不是靠机器。'),
  mk('c3', n => 'F: 那你们自己 README 里的数字呢？ | M: 它们漂移了。上面写着大约 ' + n('readme.old') + ' 个应用代码文件。用项目自己的工具数出来，是 ' + n('size.app.files') + ' 个。 | F: 改了吗？ | M: 当天就改了。而且我们读到的一篇 A-I 评论，已经照抄了我们最早那个错误的数字。'),
  mk('c5', n => 'F: 没有服务器，就没有可以攻击的东西了？ | M: 更小了，但还在。它仍然从云存储取建筑文件，会退回到公共的程序库网站，通过 GitHub 和 Gmail 转发团队消息，还要和旧 E-R-P 的网络服务通信。签名的密钥就放在标签页里。 | F: 对新手来说呢？ | M: 很陡。一个几何内核，用 JavaScript 写的 iDempiere 数据字典，还有它自己的一套动词。'),
  mk('aid', n => 'F: 如果 A-I 走了呢？ | M: 那编辑器就必须懂代码。这就是另一部影片《When A-I Dies》：真正的 VS Code，关掉了 A-I 功能，仍然根据仓库生成的内容回答问题。链接在卡片上。'),
  mk('roadmap', n => 'F: 还有什么没做？ | M: ' + n('roadmap.items') + ' 样。持续集成里的完整见证套件。模块清单。还有命名的部件、负责人表和证明图，这些都只是设计。'),
  mk('close', n => 'F: 那么，凭感觉写代码行得通吗？ | M: 在这里行得通，因为没有任何东西是凭信任接受的。A-I 写得快，见证脚本把每个说法都当作数字来检查，弱点也都写了下来。 | F: 在哪里读更多？ | M: Vibe Programming 那一页。链接和来源都在这张卡片上。')
];
if (LANG === 'zh' && ZH.map(b => b.id).join() !== beats.map(b => b.id).join()) throw new Error('zh beats differ from the English beats');
module.exports = { beats: LANG === 'zh' ? ZH : beats, words, speak, ROADMAP, F, val, lang: LANG };
