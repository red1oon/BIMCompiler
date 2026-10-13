// Builds film3_en.tsv from the recorder's own log (cue = real beat/ring time + offset). Every number spoken is in FACTS and checked against §FILM3_FACT lines: a mismatch aborts. usage: node film3_make_tsv.js <film3.log> > film3_en.tsv
const fs = require('fs'); const log = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const T = {}; const facts = {}; let endT = 0;
log.forEach(l => { let m; if ((m = /§FILM3_BEAT id=(\w+) t=([\d.]+)/.exec(l))) { T['B:' + m[1]] = +m[2]; if (m[1] === 'end') endT = +m[2]; } else if ((m = /§FILM3_RING t=([\d.]+) (.*)/.exec(l))) T['R:' + m[2]] = +m[1]; else if ((m = /§FILM3_FACT (\S+?)=(.*)/.exec(l))) facts[m[1]] = m[2]; });
const at = k => { const key = Object.keys(T).find(x => x === k || (k.startsWith('R:') && x.startsWith(k))); if (!key) throw new Error('no anchor ' + k); return T[key]; };
// [id, anchor, offset, source facts, "F: .. | M: .." ]
const ROWS = [
 ['hook', 'B:hook', 0.4, 'pdf.page', "M: This is a finished report. One page, made from Excel. | F: Who designed it? | M: The accountant."],
 ['design1', 'B:design', 0.3, 'design.mergedRegions design.distinctFillColours', "F: So where does the look come from? | M: One sheet, named BACKUP. Plain Excel. Sixteen merged regions, ten fill colours."],
 ['design2', 'R:another fill', 0.1, '', "M: The title band is one merged cell with a fill. The boxes are fills, with thick borders."],
 ['design3', 'R:header colours', 0.1, '', "F: And the grid? | M: Header colours, zebra rows, number formats."],
 ['design4', 'R:totals row', 0.1, '', "M: A double rule under the totals. Signature boxes. Nothing here you have not already used."],
 ['rules1', 'B:rules', 0.3, 'process.rules', "F: And the numbers? | M: A second sheet, named Process. One row for every question."],
 ['rules2', 'R:SELECT', 0.1, '', "M: Select says what to ask. Table and where say which rows."],
 ['rules3', 'R:Direction', 0.1, '', "M: And Direction says where the answer goes."],
 ['rules4', 'R:S =', 0.1, '', "M: S puts one value into one cell."],
 ['rules5', 'R:> =', 0.1, '', "M: Greater-than runs a list across the sheet."],
 ['rules6', 'R:V =', 0.1, '', "F: And a whole grid? | M: V runs a list down. And C ten plus B twelve fills the grid: accounts across, source tables down."],
 ['link1', 'B:link', 0.3, '', "F: But which cell does each rule fill?"],
 ['link2', 'R:this cell', 0.1, 'input.linkFormula input.cellShows', "M: An ordinary Excel link. This Input cell holds equals Process A four. It shows that rule's name: the select text between at signs, plus its row number."],
 ['link3', 'R:select text', 0.1, 'process.annotationFormula', "M: Column A in Process builds the name with a concatenate formula. Nothing is typed twice. | F: So if I move the cell? | M: The link follows."],
 ['run1', 'B:run', 0.4, 'run.addressLines process.rules process.statements', "M: Now run. The engine checks the template, then finds every linked cell. Thirty-one of them. | F: And the questions? | M: Five queries answer the eleven rules. Then it paints, and the totals recalculate."],
 ['src1', 'R:company', 0.1, '', "M: The company name: from the client table."],
 ['src2', 'R:period', 0.1, '', "M: The period: the two dates you pick."],
 ['src3', 'R:three boxes ←', 0.1, 'kpi.postings kpi.debit kpi.credit', "M: Three answers fill the boxes. Forty-eight postings. Debit, two thousand three hundred sixty-one point one four. Credit, two thousand six hundred six point two seven."],
 ['src4', 'R:account numbers', 0.1, '', "M: The account numbers and names: from the account table."],
 ['src5', 'R:rows ←', 0.1, '', "M: The rows: the source table of each posting."],
 ['src6', 'R:grid ←', 0.1, '', "F: And the grid? | M: One rule fills it, accounts against source tables."],
 ['src7', 'R:totals ←', 0.1, '', "M: The totals are plain Excel sums. Excel does that part."],
 ['empty1', 'B:empty', 0.3, 'grid.cells grid.filled grid.empty', "F: Why are some cells blank? | M: Seven of the twelve have no posting. Blank means nothing happened. We never invent a zero."],
 ['edit1', 'B:edit', 0.3, '', "F: What if I change a rule? | M: Drop one account from the rule list, in Process only. Nothing else is touched."],
 ['edit2', 'B:edit', 9.0, 'edit.grandTotalBefore edit.grandTotalAfter edit.accountsAfter', "M: The grid is three accounts now, and the grand total moves from minus two hundred forty-five point one three, to three hundred eighty-eight point two eight. | F: And it was checked? | M: Against independent SQL."],
 ['trust1', 'B:trust', 0.3, 'pdf.cellsMissing', "F: How do we know it is right? | M: Every line here is a test that ran."],
 ['trust2', 'B:trust', 6.5, '', "M: The grid matches independent SQL. All fifty-seven cells are in the PDF. The template checks pass."],
 ['close1', 'B:close', 0.4, '', "M: Your Excel. Your design. Our data."] ];
const need = { 'design.mergedRegions': '16', 'design.distinctFillColours': '10', 'process.rules': '11', 'process.statements': '5', 'run.addressLines': '31', 'kpi.postings': '48', 'kpi.debit': '2361.14', 'kpi.credit': '2606.27', 'grid.cells': '12', 'grid.filled': '5', 'grid.empty': '7', 'edit.grandTotalBefore': '-245.13', 'edit.grandTotalAfter': '388.28', 'edit.accountsAfter': '3', 'pdf.cellsMissing': '0' };
Object.keys(need).forEach(k => { if (facts[k] !== need[k]) { console.error('§FILM3_TSV FACT MISMATCH ' + k + ' spoken=' + need[k] + ' log=' + facts[k]); process.exit(2); } });
if (!/cells=57/.test(log.join('\n'))) { console.error('§FILM3_TSV spoken "fifty-seven cells" not in log'); process.exit(2); }
const rows = ROWS.map(r => [r[0], +(at(r[1]) + r[2]).toFixed(2)]); const out = [];
ROWS.forEach((r, i) => { const cue = rows[i][1], nxt = i + 1 < rows.length ? rows[i + 1][1] - 0.25 : endT - 0.3; out.push([r[0], cue.toFixed(2), Math.max(nxt, cue + 1).toFixed(2), '§FILM3_FACT ' + (r[3] || 'beat'), r[4], r[4]].join('\t')); });
console.log(out.join('\n')); console.error('§FILM3_TSV rows=' + out.length + ' factsChecked=' + Object.keys(need).length + ' OK');
