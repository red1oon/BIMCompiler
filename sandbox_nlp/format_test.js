// format_test.js — witness the formatResult() ship path (decode→run→UI summary+guids)
// against real Hospital_meta.db. Proves what the viewer's nlp.js will actually display.
const path = require('path');
const Database = require('better-sqlite3');
const { decode, formatResult } = require('./decoder.js');
const db = new Database(path.resolve(__dirname, '../deploy/buildings/Hospital_meta.db'), { readonly: true });
const storeys = db.prepare('SELECT DISTINCT storey FROM elements_meta WHERE storey IS NOT NULL').all().map(r => r.storey);

// sql.js-shape exec shim over better-sqlite3
const exec = (sql, params) => {
  const stmt = db.prepare(sql);
  const columns = stmt.columns().map(c => c.name);
  const values = stmt.raw().all(...(params || []));
  return values.length ? [{ columns, values }] : [];
};

const CASES = [
  ['show me all the doors', s => /^440 — /.test(s.summary) && s.guids.length === 440],
  ['how many windows',      s => /^131 — /.test(s.summary) && s.guids.length === 0],
  ['total cost',            s => /^RM 76,439,535 /.test(s.summary)],
  ['total area of walls',   s => /^49,906 m² — /.test(s.summary)],
  ['which floor has the most doors', s => /^Level 1 — /.test(s.summary)],
  ['doors and windows',     s => /^571 — /.test(s.summary) && s.guids.length === 571],
  ['doors not on level 1',  s => /^326 — /.test(s.summary)],
  ['banana milkshake',      s => s.kind === 'none'],
];

let pass = 0;
for (const [q, ok] of CASES) {
  const d = decode(q, { storeys });
  const f = formatResult(d, exec, { cur: 'RM', cur2: 'USD', rate: 3.91 });
  const good = ok(f);
  if (good) pass++;
  console.log(`${good ? '§OK ' : '§FAIL'} "${q}" → kind=${f.kind} guids=${f.guids.length} | ${f.summary}`);
}
console.log(`§FORMAT pass=${pass}/${CASES.length}`);
db.close();
process.exit(pass === CASES.length ? 0 : 1);
