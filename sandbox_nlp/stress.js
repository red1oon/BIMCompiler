// stress.js — HARD test of the typed-NL decoder vs real Hospital_meta.db.
// Self-grading: where an intent has a known ground-truth SQL, we compute it directly
// and flag SILENT-WRONG (decoder answered, but answered wrong) — the dangerous case.
// Categories probe coverage AND breaking points. Run: node sandbox_nlp/stress.js
const path = require('path');
const Database = require('better-sqlite3');
const { decode } = require('./decoder.js');
const db = new Database(path.resolve(__dirname, '../deploy/buildings/Hospital_meta.db'), { readonly: true });

const one = (sql, p = []) => db.prepare(sql).get(...p);
const all = (sql, p = []) => db.prepare(sql).all(...p);

// run a decoded query → normalized {n, val, kind, label}
function exec(d) {
  if (d.kind === 'none') return { kind: 'none' };
  if (d.kind === 'cost') { const r = one(d.sql, d.params); return { kind: 'cost', val: r.cost || 0, n: r.elems || 0 }; }
  if (d.kind === 'qto')  { const r = one(d.sql, d.params); return { kind: 'qto', val: r.qty || 0, n: r.elems || 0 }; }
  if (d.kind === 'rank') { const r = one(d.sql, d.params) || {}; return { kind: 'rank', n: r.count || 0, label: r.label }; }
  if (d.kind === 'list') { return { kind: 'list', n: one(d.countSql, d.countParams).n }; }
  const rows = all(d.sql, d.params); // group/count
  return { kind: d.kind, n: rows.reduce((s, r) => s + (r.count || 0), 0), rows: rows.length };
}

// ground truth helpers
const GT = {
  ifcCount: (like) => one(`SELECT COUNT(*) n FROM elements_meta WHERE LOWER(ifc_class) LIKE ?`, [like]).n,
  doorCost: () => Math.round(one(`SELECT SUM(COALESCE(material_cost,0)+COALESCE(labour_cost,0)+COALESCE(equipment_cost,0)) c FROM qto_cache WHERE LOWER(ifc_class) LIKE '%door%'`).c),
};

let P = 0, N = 0, W = 0;
function grade(q, expect) {
  const d = decode(q);
  const r = exec(d);
  let tag, detail = `kind=${r.kind} n=${r.n ?? '-'}${r.val !== undefined ? ' val=' + r.val : ''}`;
  if (expect === 'none') {
    if (r.kind === 'none') { tag = '✓NONE'; P++; } else { tag = '✗SHOULD-REJECT'; W++; }
  } else if (r.kind === 'none') {
    tag = '✗MISS'; N++;                                   // decoder gave up
  } else if (typeof expect === 'number') {
    if ((r.n === expect) || (r.val === expect)) { tag = '✓'; P++; }
    else { tag = `✗WRONG(want ${expect})`; W++; }          // silent-wrong — the danger
  } else { tag = '·OK'; P++; }                             // ran, no ground-truth asserted
  console.log(`${tag.padEnd(16)} "${q}"  →  ${decode(q).desc}  [${detail}]`);
}

console.log('=== A. element counts — natural phrasing variants (all must = ground truth) ===');
const doors = GT.ifcCount('%door%'), walls = GT.ifcCount('%wall%'), windows = GT.ifcCount('%window%');
console.log(`(ground truth: doors=${doors} walls=${walls} windows=${windows})`);
['count doors','how many doors','how many doors are there','show me all the doors',
 'i want to see all doors','doors','DOORS!!!','how many   doors',  'cnt doors',
 'how many windows','number of windows','show windows'].forEach(q =>
  grade(q, /door/i.test(q) ? doors : windows));

console.log('\n=== B. cost (qto_cache authoritative) ===');
grade('total cost', 76439535);
grade("what's the total cost of this building", 76439535);
grade('how much do the doors cost', GT.doorCost());
grade('door cost', GT.doorCost());
grade('price of doors', GT.doorCost());

console.log('\n=== C. scoped: storey / discipline ===');
const doorsL2 = one(`SELECT COUNT(*) n FROM elements_meta WHERE LOWER(ifc_class) LIKE '%door%' AND LOWER(storey) LIKE '% 2'`).n;
grade('doors on level 2', doorsL2);
grade('show me the doors on level 2', doorsL2);
grade('level 2 doors', doorsL2);
const elec = one(`SELECT COUNT(*) n FROM elements_meta WHERE discipline='ELEC'`).n;
grade('show electrical', elec);
grade('list all electrical elements', elec);

console.log('\n=== D. meta questions ===');
grade('what disciplines are there', 'ok');
grade('how many storeys', 'ok');
grade('list the floors', 'ok');

console.log('\n=== E. v2 HARDENED — the cases that were silently wrong (now asserted) ===');
const dw = one(`SELECT COUNT(*) n FROM elements_meta WHERE LOWER(ifc_class) LIKE '%door%' OR LOWER(ifc_class) LIKE '%window%'`).n;
const drange = one(`SELECT COUNT(*) n FROM elements_meta WHERE LOWER(ifc_class) LIKE '%door%' AND (LOWER(storey) LIKE '% 2' OR LOWER(storey) LIKE '% 3' OR LOWER(storey) LIKE '% 4')`).n;
const wallArea = Math.round(one(`SELECT SUM(qty) q FROM qto_cache WHERE LOWER(ifc_class) LIKE '%wall%' AND uom='M2'`).q);
const pipeLen = Math.round(one(`SELECT SUM(qty) q FROM qto_cache WHERE LOWER(ifc_class) LIKE '%pipe%' AND uom='M'`).q);
const doorsNotL1 = one(`SELECT COUNT(*) n FROM elements_meta WHERE LOWER(ifc_class) LIKE '%door%' AND LOWER(storey) NOT LIKE '% 1'`).n;
grade('doors and windows', dw);                       // compound
grade('show me doors and windows', dw);
grade('doors between level 2 and 4', drange);         // range
grade('total area of walls', wallArea);               // REAL area from qto_cache
grade('how much pipe length is there', pipeLen);      // REAL length
grade('which floor has the most doors', 114);         // rank by storey (Level 1)
grade('most common element', 14452);                  // rank ifc (IfcPipeSegment)
grade('doors not on level 1', doorsNotL1);            // negation
grade('biggest room', 'none');                        // honestly unanswerable → reject

console.log('\n=== F. must-reject garbage ===');
['banana milkshake','asdfqwer','the the the','42'].forEach(q => grade(q, 'none'));

console.log(`\n§SCORE pass/ok=${P}  miss(gave-up)=${N}  wrong(silent or bad-reject)=${W}`);
db.close();
