// ⚠ DO NOT REMOVE — film "Help that answers, in the Viewer" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §17.1): adds to out/facts.json (made by shots.js) what the cards quote, none typed by hand:
//   the opening quote (the exact sentence in the saved McKinsey page, title / authors / date from the saved report PDF — the §11 film's copies), the witness verdict lines (W-CLASS-HELP, W-HOWTO,
//   W-HELP-DOCK, run on the SAME tree and copied into out/), the PR states (GitHub), the licence (the tree's LICENSE), the paper's own priority line (its saved copy). Copies the prior-art files the
//   guard checks into out/prior/. READ out/facts.log.
// Usage: node facts.js <bim-ootb main tree>   (env PRIOR_11 = the §11 film's prior folder, PRIOR_14 = this lane's bSDD/licence folder)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), L = (m) => console.log('§FACTS ' + m), fail = (m) => { L('FAIL ' + m); process.exit(1); };
const P11 = process.env.PRIOR_11 || path.join(os.homedir(), 'Videos', 'help_film_work', 'out', 'prior'), P14 = process.env.PRIOR_14 || path.join(os.homedir(), 'bim-compiler', 'build', 'bim_help_prior');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
fs.mkdirSync(path.join(OUT, 'prior'), { recursive: true });
[[P11, 'mckinsey_the_social_economy.html'], [P11, 'MGI_The_social_economy_Full_report.pdf'], [P11, 'spatial_compilation_paper.html'], [P14, 'bsdd_IfcWall_de-DE.json'], [P14, 'bsdd_IfcWall_zh-CN.json'], [P14, 'bsdd_IfcWall_EN.json'], [P14, 'cc_by-nd_4.0_legalcode.en.txt'], [P14, 'fetched_at.txt']]
  .forEach(([d, f]) => { if (!fs.existsSync(path.join(d, f))) fail('missing saved copy ' + path.join(d, f)); fs.copyFileSync(path.join(d, f), path.join(OUT, 'prior', f)); });
const flat = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ');
// 1. the opening quote (as the §11 film): the sentence as it stands on the saved page; the report's own title pages for title, authors, date
const page = flat(fs.readFileSync(path.join(OUT, 'prior', 'mckinsey_the_social_economy.html'), 'utf8'));
const qm = /The average interaction worker spends an estimated 28 percent of the workweek managing e-mail and nearly 20 percent looking for internal information or tracking down colleagues who can help with specific tasks\./.exec(page);
if (!qm) fail('the quote is not in the saved McKinsey page');
const pdf = spawnSync('pdftotext', ['-l', '3', path.join(OUT, 'prior', 'MGI_The_social_economy_Full_report.pdf'), '-'], { encoding: 'utf8' }).stdout.replace(/\s+/g, ' ');
const tm = /The social economy: Unlocking value and productivity through social technologies/.exec(pdf), dm = /July 2012/.exec(pdf), am = /Michael Chui James Manyika/.exec(pdf);
if (!tm || !dm || !am) fail('title / date / authors not on the report\'s title pages: ' + [!!tm, !!dm, !!am]);
F.quote = { text: qm[0], stat: 'nearly 20 percent', title: tm[0], date: dm[0], who: 'McKinsey Global Institute · Michael Chui, James Manyika et al.', url: 'mckinsey.com/…/our-insights/the-social-economy', fetched: '2026-11-16' };
L('quote ' + JSON.stringify(F.quote));
// 2. the witness verdicts on the same tree (their last line)
const v = (f, re) => { const p = path.join(OUT, f); if (!fs.existsSync(p)) fail('missing ' + f); return (fs.readFileSync(p, 'utf8').match(re) || [''])[0]; };
F.verdicts = { classHelp: v('witness_class_help_main.log', /§W-CLASS-HELP \S+/).slice(1), howto: v('witness_howto_main.log', /§W-HOWTO \S+/).slice(1), dock: v('witness_help_dock_main.log', /§W-HELP-DOCK \S+/).slice(1) };
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
