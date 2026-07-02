// run_witness.js — ISOLATED witness: typed NL → SQL → real Hospital_meta.db result.
// Proves the decoder deciphers natural typed text into correct queried output.
// Whitebox §-log first (per CLAUDE.md). Run: node sandbox_nlp/run_witness.js
//
// # ⚠ DO NOT REMOVE — scope: prove typed-text decode against Hospital. Read the log
// after every run; exit code is not evidence. No invented values — all from the DB.

const path = require('path');
const Database = require('better-sqlite3');
const { decode } = require('./decoder.js');

const DB_PATH = path.resolve(__dirname, '../deploy/buildings/Hospital_meta.db');
const db = new Database(DB_PATH, { readonly: true });
console.log('§DB_OPEN ' + DB_PATH);
console.log('§DB_ROWS elements_meta=' + db.prepare('SELECT COUNT(*) n FROM elements_meta').get().n
          + ' qto_cache=' + db.prepare('SELECT COUNT(*) n FROM qto_cache').get().n);

// The phrasings a real user would TYPE — deliberately messy/natural, not the rigid
// "count doors" DSL. Each must decode to a correct, traceable result.
const QUERIES = [
  'show me all the doors',
  'how many doors are there',
  'count doors',
  'show windows',
  'list all the walls',
  'how many beams',
  'where are the columns',
  'total cost',
  "what's the total cost",
  'how much do the doors cost',
  'cost of structural',
  'show me the pipes on level 3',
  'doors on level 2',
  'show electrical',
  'what disciplines are there',
  'how many storeys',
  'show me the sprinklers',
  'highlight all light fixtures',
  'count ducts',
  'banana milkshake',   // negative: must NOT match → §NONE
];

let pass = 0, none = 0;
for (const q of QUERIES) {
  const d = decode(q);
  if (d.kind === 'none') {
    console.log(`§NONE   "${q}" → ${d.desc}`);
    none++;
    continue;
  }
  try {
    let summary;
    if (d.kind === 'cost') {
      const r = db.prepare(d.sql).get(...d.params);
      summary = `RM ${(r.cost || 0).toLocaleString()} over ${r.elems || 0} elems`;
    } else if (d.kind === 'list') {
      const n = db.prepare(d.countSql).get(...d.countParams).n;
      const rows = db.prepare(d.sql).all(...d.params);
      summary = `${n} elements (showing ${rows.length}) e.g. ${rows.slice(0, 1).map(x => x.ifc_class).join(',')}`;
    } else { // count / group
      const rows = db.prepare(d.sql).all(...d.params);
      const tot = rows.reduce((s, r) => s + (r.count || 0), 0);
      summary = `${tot} total — ${rows.slice(0, 4).map(r => (r.ifc_class || r.discipline || r.storey) + ':' + r.count).join(', ')}`;
    }
    console.log(`§OK [${d.kind}] "${q}" → ${d.desc} → ${summary}`);
    pass++;
  } catch (e) {
    console.log(`§ERR    "${q}" → SQL failed: ${e.message}`);
  }
}
console.log(`§SUMMARY pass=${pass} none=${none}/${QUERIES.length} (1 negative expected)`);
db.close();
