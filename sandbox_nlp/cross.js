// cross.js — prove the decoder GENERALIZES across buildings (not Hospital-specific).
// Self-grading PER building: ground truth computed live from each DB. Classifies
// storey-scoping as exact / overmatch / MISS to expose naming drift.
// Run: node sandbox_nlp/cross.js
const path = require('path');
const Database = require('better-sqlite3');
const { decode } = require('./decoder.js');

const BUILDINGS = [
  ['Hospital',  'Hospital_meta.db'],
  ['Terminal',  'Terminal_extracted.db'],
  ['Clinic',    'Clinic_meta.db'],
  ['Duplex',    'Duplex_extracted.db'],
  ['LTU_AHouse','LTU_AHouse_extracted.db'],
  ['SampleHouse','SampleHouse_extracted.db'],
  ['HHS_Office','HHS_Office_Federated_extracted.db'],
];
const BDIR = path.resolve(__dirname, '../deploy/buildings');

// canonical noun filters (mirror decoder synonyms) for fair ground truth
const NOUN = {
  door: ['%door%', '%doorway%'], window: ['%window%'], wall: ['%wall%', '%partition%'],
  column: ['%column%', '%pillar%', '%post%'], beam: ['%beam%', '%member%'],
};
const nounLike = n => '(' + NOUN[n].map(() => 'LOWER(ifc_class) LIKE ?').join(' OR ') + ')';

function run(d, db) {
  if (d.kind === 'none') return { kind: 'none' };
  if (d.kind === 'cost') { const r = db.prepare(d.sql).get(...d.params); return { val: r.cost || 0 }; }
  if (d.kind === 'qto')  { const r = db.prepare(d.sql).get(...d.params); return { val: r.qty || 0 }; }
  if (d.kind === 'rank') { const r = db.prepare(d.sql).get(...d.params) || {}; return { label: r.label, n: r.count || 0 }; }
  if (d.kind === 'list') { return { n: db.prepare(d.countSql).get(...d.countParams).n }; }
  const rows = db.prepare(d.sql).all(...d.params);
  return { n: rows.reduce((s, r) => s + (r.count || 0), 0) };
}

let gTotals = { pass: 0, fail: 0, storeyDrift: 0 };
for (const [name, file] of BUILDINGS) {
  const db = new Database(path.join(BDIR, file), { readonly: true });
  const hasQto = db.prepare("SELECT 1 FROM sqlite_master WHERE name='qto_cache'").get();
  // the app would load this once; hand the decoder the building's real storey strings
  const storeys = db.prepare('SELECT DISTINCT storey FROM elements_meta WHERE storey IS NOT NULL').all().map(r => r.storey);
  const ctx = { storeys };
  let pass = 0, fail = 0; const fails = [];
  const assert = (label, got, want) => {
    if (got === want) { pass++; } else { fail++; fails.push(`${label}: got ${got} want ${want}`); }
  };

  // 1. element counts — building-agnostic (IFC standard classes)
  for (const n of ['door', 'window', 'wall', 'column', 'beam']) {
    const gt = db.prepare(`SELECT COUNT(*) c FROM elements_meta WHERE ${nounLike(n)}`).get(...NOUN[n]).c;
    assert(`count ${n}s`, run(decode(`how many ${n}s`), db).n, gt);
    assert(`show ${n}s`, run(decode(`show me all the ${n}s`), db).n, gt);
  }
  // 2. compound
  {
    const gt = db.prepare(`SELECT COUNT(*) c FROM elements_meta WHERE ${nounLike('door')} OR ${nounLike('window')}`).get(...NOUN.door, ...NOUN.window).c;
    assert('doors and windows', run(decode('doors and windows'), db).n, gt);
  }
  // 3. rank — most common element
  {
    const gt = db.prepare(`SELECT ifc_class FROM elements_meta GROUP BY ifc_class ORDER BY COUNT(*) DESC LIMIT 1`).get().ifc_class;
    assert('most common element', run(decode('most common element'), db).label, gt);
  }
  // 4. cost + qto (only if qto_cache present)
  if (hasQto) {
    const gtCost = Math.round(db.prepare(`SELECT SUM(COALESCE(material_cost,0)+COALESCE(labour_cost,0)+COALESCE(equipment_cost,0)) c FROM qto_cache`).get().c || 0);
    assert('total cost', run(decode('total cost'), db).val, gtCost);
    const wa = db.prepare(`SELECT SUM(qty) q FROM qto_cache WHERE ${nounLike('wall')} AND uom='M2'`).get(...NOUN.wall).q;
    if (wa) assert('wall area', run(decode('total area of walls'), db).val, Math.round(wa));
  }
  // 5. STOREY SCOPING — the drift test, now with the building's real storey list (ctx).
  const topStorey = db.prepare(`SELECT storey, COUNT(*) c FROM elements_meta WHERE ${nounLike('wall')} AND storey IS NOT NULL AND storey!='Unknown' GROUP BY storey ORDER BY c DESC LIMIT 1`).get(...NOUN.wall);
  let storeyLine = '  storey-scope: (no storey to test)';
  if (topStorey) {
    const S = topStorey.storey;
    const ORDW = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7 };
    let ref = null, target = null;
    const num = S.match(/(\d+)/), ow = S.toLowerCase().match(/\b(first|second|third|fourth|fifth|sixth|seventh)\b/);
    if (num && +num[1] > 0) { ref = 'level ' + parseInt(num[1], 10); target = { kind: 'num', n: +num[1] }; }
    else if (ow) { ref = 'level ' + ORDW[ow[1]]; target = { kind: 'num', n: ORDW[ow[1]] }; }
    else if (/ground|tanah|jalan/i.test(S) || (num && +num[1] === 0)) { ref = 'ground floor'; target = { kind: 'ground' }; }
    else if (/roof|bumbung/i.test(S)) { ref = 'roof'; target = { kind: 'roof' }; }
    if (ref) {
      const ordRe = target.kind === 'num' && ORDW && Object.keys(ORDW).find(k => ORDW[k] === target.n);
      // GT = walls over EVERY storey the user's ref legitimately means (exact-string match, same rule)
      const meant = storeys.filter(s => { const dg = (s.match(/\d+/g) || []).map(Number);
        if (target.kind === 'num') return dg.includes(target.n) || (ordRe && new RegExp('\\b' + ordRe + '\\b', 'i').test(s));
        if (target.kind === 'ground') return dg.includes(0) || /ground|tanah|jalan/i.test(s);
        return /roof|bumbung/i.test(s); });
      const want = meant.length ? db.prepare(`SELECT COUNT(*) c FROM elements_meta WHERE ${nounLike('wall')} AND storey IN (${meant.map(() => '?').join(',')})`).get(...NOUN.wall, ...meant).c : 0;
      const got = run(decode(`walls on ${ref}`, ctx), db).n;
      const ok = got === want && got > 0;
      const tag = ok ? '✓ exact' : got === 0 ? '✗ MISS' : `⚠ ${got} vs ${want}`;
      if (!ok) gTotals.storeyDrift++;
      storeyLine = `  storey-scope: "walls on ${ref}" → ${got}  (storeys ${JSON.stringify(meant)} = ${want})  ${tag}`;
    } else {
      storeyLine = `  storey-scope: "${S}" — no level/ground/roof phrasing`; gTotals.storeyDrift++;
    }
  }

  const em = db.prepare('SELECT COUNT(*) c FROM elements_meta').get().c;
  console.log(`\n■ ${name} (${em.toLocaleString()} elems${hasQto ? ', +qto' : ''}) — ${pass}/${pass + fail} pass`);
  console.log(storeyLine);
  fails.forEach(f => console.log('  ✗ ' + f));
  gTotals.pass += pass; gTotals.fail += fail;
  db.close();
}
console.log(`\n§CROSS pass=${gTotals.pass} fail=${gTotals.fail} storeyDriftMisses=${gTotals.storeyDrift}/${BUILDINGS.length}`);
