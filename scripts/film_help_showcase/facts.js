// ⚠ DO NOT REMOVE — film "Help that answers" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11): adds to out/facts.json (made by shots.js) what the cards quote, none typed by hand:
//   the opening quote (the exact sentence in the McKinsey page copy saved in out/prior/, its title, authors and date from the saved report PDF), the witness verdict lines (logs run on the same main tree,
//   copied into out/), the PR states (GitHub), the licence (the tree's LICENSE), the paper's own priority line (its saved copy). READ out/facts.log.
// Usage: node facts.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), L = (m) => console.log('§FACTS ' + m), fail = (m) => { L('FAIL ' + m); process.exit(1); };
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const flat = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ');
// 1. the opening quote: the sentence as it stands on the saved page; the report's own title page (pdftotext of the saved PDF) for title, authors, date
const page = flat(fs.readFileSync(path.join(OUT, 'prior', 'mckinsey_the_social_economy.html'), 'utf8'));
const qm = /The average interaction worker spends an estimated 28 percent of the workweek managing e-mail and nearly 20 percent looking for internal information or tracking down colleagues who can help with specific tasks\./.exec(page);
if (!qm) fail('the quote is not in the saved McKinsey page');
const pdf = spawnSync('pdftotext', ['-l', '3', path.join(OUT, 'prior', 'MGI_The_social_economy_Full_report.pdf'), '-'], { encoding: 'utf8' }).stdout.replace(/\s+/g, ' ');
const tm = /The social economy: Unlocking value and productivity through social technologies/.exec(pdf), dm = /July 2012/.exec(pdf), am = /Michael Chui James Manyika/.exec(pdf);
if (!tm || !dm || !am) fail('title / date / authors not on the report\'s title pages: ' + [!!tm, !!dm, !!am]);
F.quote = { text: qm[0], stat: 'nearly 20 percent', title: tm[0], date: dm[0], who: 'McKinsey Global Institute · Michael Chui, James Manyika et al.', url: 'mckinsey.com/…/our-insights/the-social-economy', fetched: '2026-11-16' };
L('quote ' + JSON.stringify(F.quote));
// 2. the witness verdicts on the same tree
const v = (f, re) => (fs.readFileSync(path.join(OUT, f), 'utf8').match(re) || [''])[0];
F.verdicts = { erpAsk: fs.existsSync(path.join(OUT, 'witness_erp_ask_main.log')) ? v('witness_erp_ask_main.log', /§WITNESS_ERP_ASK pass=\d+ fail=\d+ inconclusive=\d+ verdict=\S+/).replace('§WITNESS_', 'W-').replace(/_/g, '-') : null, fieldHelp: v('witness_field_help_main.log', /§WITNESS_FIELD_HELP pass=\d+ fail=\d+ inconclusive=\d+ verdict=\S+/).replace('§WITNESS_', 'W-').replace(/_/g, '-'),
  showcase: v('witness_help_showcase_main.log', /§WITNESS_HELP_SHOWCASE pass=\d+ fail=\d+ inconclusive=\d+ verdict=\S+/).replace('§WITNESS_', 'W-').replace(/_/g, '-') };
L('verdicts ' + JSON.stringify(F.verdicts));
// 3. credentials
const pr = (n) => (spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }).stdout || '').trim();
const paper = flat(fs.readFileSync(path.join(OUT, 'prior', 'spatial_compilation_paper.html'), 'utf8'));
const PRS = (process.env.PRS || '3126,3128').split(',').map(Number);   // the PRs the film shows (the v2 cut adds #3133 and the erp.ask PR)
F.credentials = { licence: fs.readFileSync(path.join(TREE, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', prs: PRS.map((n) => ({ n, state: pr(n) })), pr3126: pr(3126), pr3128: pr(3128), paperPriority: (/Priority date: (\d{4}-\d\d-\d\d)/.exec(paper) || [])[1] || null };
L('credentials ' + JSON.stringify(F.credentials));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
const ok = /PASS$/.test(F.verdicts.fieldHelp) && /PASS$/.test(F.verdicts.showcase) && (F.verdicts.erpAsk == null || /PASS$/.test(F.verdicts.erpAsk)) && F.credentials.prs.every((x) => /^MERGED/.test(x.state)) && F.credentials.licence === 'MIT License' && !!F.credentials.paperPriority;
L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
