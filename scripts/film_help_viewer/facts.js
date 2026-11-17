// ⚠ DO NOT REMOVE — film "Help that answers, in the Viewer" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §17.1): adds to out/facts.json (made by shots.js) what the cards quote, none typed by hand:
//   the opening quote (v3, §17.2 item 5: Jakob Nielsen, usability heuristic 10 'Help and documentation', the exact two sentences in the saved Nielsen Norman Group page; title, author, date read from the same copy), the witness verdict lines (W-CLASS-HELP, W-HOWTO,
//   W-HELP-DOCK, run on the SAME tree and copied into out/), the PR states (GitHub), the licence (the tree's LICENSE), the paper's own priority line (its saved copy). Copies the prior-art files the
//   guard checks into out/prior/. READ out/facts.log.
// Usage: node facts.js <bim-ootb main tree>   (env PRIOR_11 = the folder holding the saved paper page, PRIOR_14 = this lane's bSDD/licence folder, PRIOR_17 = the saved Nielsen Norman Group page)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), L = (m) => console.log('§FACTS ' + m), fail = (m) => { L('FAIL ' + m); process.exit(1); };
const P11 = process.env.PRIOR_11 || path.join(os.homedir(), 'Videos', 'help_viewer_film_work', 'prior'), P17 = process.env.PRIOR_17 || P11, P14 = process.env.PRIOR_14 || path.join(os.homedir(), 'bim-compiler', 'build', 'bim_help_prior');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
fs.mkdirSync(path.join(OUT, 'prior'), { recursive: true });
[[P17, 'nngroup_ten_usability_heuristics.html'], [P17, 'nngroup_fetched_at.txt'], [P11, 'spatial_compilation_paper.html'], [P14, 'bsdd_IfcWall_de-DE.json'], [P14, 'bsdd_IfcWall_zh-CN.json'], [P14, 'bsdd_IfcWall_EN.json'], [P14, 'cc_by-nd_4.0_legalcode.en.txt'], [P14, 'fetched_at.txt']]
  .forEach(([d, f]) => { if (!fs.existsSync(path.join(d, f))) fail('missing saved copy ' + path.join(d, f)); fs.copyFileSync(path.join(d, f), path.join(OUT, 'prior', f)); });
const flat = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ');
// 1. the opening quote (v3): the two sentences as they stand on the saved Nielsen Norman Group page; the article's own title, its author and dates from the same copy. Never paraphrased.
const raw = fs.readFileSync(path.join(OUT, 'prior', 'nngroup_ten_usability_heuristics.html'), 'utf8'), page = flat(raw).replace(/&#x27;|&#39;|&rsquo;|’/g, "'");
const QT = "Help and documentation content should be easy to search and focused on the user's task. Keep it concise, and list concrete steps that need to be carried out.";
if (page.indexOf(QT) < 0) fail('the quote is not verbatim in the saved Nielsen Norman Group page');
const ttl = /<title>([^<]*?)\s*-\s*NN\/G<\/title>/.exec(raw), who = /Jakob Nielsen\s+Jakob Nielsen\s+(\w+ \d+, \d{4})\s+(?:·|&centerdot;)\s+Last reviewed (\w+\.? \d+, \d{4})/.exec(page);
if (!ttl || !who) fail('title / author / dates not on the saved page: ' + [!!ttl, !!who]);
if (!/10: Help and Documentation/.test(page)) fail('the quote is not under heuristic 10 on the saved page');
F.quote = { text: QT, stat: 'easy to search and focused on the user\'s task', title: ttl[1] + ' · heuristic 10, Help and Documentation', date: who[1] + ' (last reviewed ' + who[2] + ')', who: 'Jakob Nielsen · Nielsen Norman Group', url: 'nngroup.com/articles/ten-usability-heuristics/',
  fetched: new Date(fs.readFileSync(path.join(OUT, 'prior', 'nngroup_fetched_at.txt'), 'utf8').trim()).toISOString().slice(0, 10) };
L('quote ' + JSON.stringify(F.quote));
// 2. the witness verdicts on the same tree (their last line)
const v = (f, re) => { const p = path.join(OUT, f); if (!fs.existsSync(p)) fail('missing ' + f); return (fs.readFileSync(p, 'utf8').match(re) || [''])[0]; };
// W-HOWTO: the film relies on H2 H3 H4a-H4e (guide links exist, CLI lines, the pills on the page, 'native', Find's CLI lines, German labels), NOT on H1 (the shipped howto.json == the generator run on TODAY's live guide).
// 2026-11-17 H1 FAILs on clean main: the live guide gained a 'Help' section, which now wins a tie for Save/Open (generator rule 'most mentions, ties: first in the page'). Not this lane's film to fix; the card names the checks it uses, never 'W-HOWTO PASS'.
const hw = fs.readFileSync(path.join(OUT, 'witness_howto_main.log'), 'utf8'), HK = ['H2', 'H3', 'H4a', 'H4b', 'H4c', 'H4d', 'H4e'], hok = HK.every((k) => new RegExp('(?:§PASS|  PASS) ' + k + '\\b').test(hw)), h1 = /§FAIL H1|PASS H1/.exec(hw);
F.verdicts = { classHelp: v('witness_class_help_main.log', /§W-CLASS-HELP \S+/).slice(1), howto: hok ? 'W-HOWTO H2 H3 H4a-H4e PASS' : 'W-HOWTO checks NOT all PASS', howtoH1: h1 ? h1[0].replace('§', '') : 'H1 not found', dock: v('witness_help_dock_main.log', /§W-HELP-DOCK \S+/).slice(1) };
F.verdictTree = (fs.readFileSync(path.join(OUT, 'witness_tree.txt'), 'utf8') || '').trim();
L('verdicts ' + JSON.stringify(F.verdicts) + ' tree=' + F.verdictTree + ' (shots tree ' + F.tree + ')');
// 3. credentials: the PRs the film shows, the licence, the paper's priority date
const pr = (n) => (spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }).stdout || '').trim();
const paper = flat(fs.readFileSync(path.join(OUT, 'prior', 'spatial_compilation_paper.html'), 'utf8'));
const PRS = (process.env.PRS || '3150,3152,3156,3160,3165').split(',').map(Number);   // class text, its languages, How To, the dock, the shared panel
F.credentials = { licence: fs.readFileSync(path.join(TREE, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', prs: PRS.map((n) => ({ n, state: pr(n) })), paperPriority: (/Priority date: (\d{4}-\d\d-\d\d)/.exec(paper) || [])[1] || null,
  bsddFetched: new Date(fs.readFileSync(path.join(OUT, 'prior', 'fetched_at.txt'), 'utf8').trim().split('\n')[0]).toISOString().slice(0, 10) };
L('credentials ' + JSON.stringify(F.credentials));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
const ok = ['classHelp', 'howto', 'dock'].every((k) => /PASS$/.test(F.verdicts[k])) && F.verdictTree === F.tree && F.credentials.prs.every((x) => /^MERGED/.test(x.state)) && F.credentials.licence === 'MIT License' && !!F.credentials.paperPriority;
L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
