// ⚠ DO NOT REMOVE — DICT_DIFF witness (gap-fix loop class DATA, spec §26): legacy dictionary rows (WS) vs SQLite seed → patch → applied to a SCRATCH copy.
// READ THE LOG. The shared seeds are NEVER modified; the generated patch is written to scripts/bridge/out/ for review.
//  §DD_FINDINGS    real differences between the pilot legacy and ad_seed_fullwidth.db (the product; reported, not asserted)
//  §DD_DETECT      a deliberately corrupted cell + a deleted row in the scratch copy are both detected (negative control)
//  §DD_PATCH_FIX   the generated patch repairs exactly those, from LEGACY values; a re-diff shows them gone
//  §DD_IDEMPOTENT  applying the patch twice changes nothing more
//  §DD_NO_DELETE   rows only SQLite has are reported, never deleted
const fs = require('fs'), os = require('os'), path = require('path');
const Database = require('better-sqlite3');
const { cfgFromEnv } = require('./ad_client');
const D = require('./dict_diff');
const specs = require('./dict_spec.json');
const log = l => console.log(l);
let fails = 0, incon = 0;
const out = (tag, ok, msg) => { log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };

(async () => {
  const cfg = cfgFromEnv();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dd-')); const scratch = path.join(tmp, 'seed.db');
  fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_seed_fullwidth.db'), scratch);
  const db = new Database(scratch);
  const gbScratch = path.join(tmp, 'gb.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'glassbowl_data.db'), gbScratch); const gdb = new Database(gbScratch);
  const dbFor = sp => (sp.db === 'glassbowl' ? gdb : db);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });

  // ---- real findings
  const legacy = {}; let total = 0;
  for (const sp of specs) {
    legacy[sp.table] = await D.discover(cfg, sp);
    const r = D.compare(legacy[sp.table], dbFor(sp), sp); total += r.legacy;
    if (r.missingCols.length) log(`§DD_COLUMNS ${sp.table} legacy-has-but-sqlite-lacks=[${r.missingCols.join(',')}] (needs ALTER via patch+loader, not a data patch)`);
    if (r.columnsOnly) { log(`§DD_TABLE ${sp.table} legacy_sample=${r.legacy} cols_compared=${r.columns} (columns-only: composite key)`); continue; }
    log(`§DD_TABLE ${sp.table} legacy=${r.legacy} local=${r.local} cols_compared=${r.columns} onlyLegacy=${r.onlyLegacy.length} onlyLocal=${r.onlyLocal.length} changed_cells=${r.changed.length}${r.onlyLocal.length ? ' onlyLocal_ids=' + r.onlyLocal.slice(0, 8).join(',') : ''}`);
    for (const c of r.changed.slice(0, 12)) log(`§DICT_GAP ${sp.table}#${c.id}.${c.col} legacy=${JSON.stringify(c.legacy)} sqlite=${JSON.stringify(c.local)}`);
    for (const row of r.onlyLegacy.slice(0, 5)) log(`§DICT_GAP ${sp.table}#${row[sp.key.toLowerCase()]} missing in SQLite`);
    fs.writeFileSync(path.join(__dirname, 'out', `dict_patch_${sp.table}.sql`), D.toPatch(r, sp));
  }
  if (!total) out('§DD_FINDINGS', 'INCONCLUSIVE', 'legacy returned 0 dictionary rows — nothing judged');
  else log(`§DD_FINDINGS (see §DD_TABLE/§DICT_GAP above; patches written to scripts/bridge/out/dict_patch_*.sql, NOT applied to any shared seed)`);

  // ---- negative control on the doctype table: corrupt one cell, delete one row
  const sp = specs[0], k = sp.key.toLowerCase();   // negative control runs on c_doctype (first spec)
  const base = D.compare(legacy[sp.table], db, sp);
  const baseKeys = new Set(base.changed.map(c => c.id + '.' + c.col)); const baseOnly = base.onlyLegacy.length;
  const pick = legacy[sp.table].find(r => String(r[k]) === '135');
  const victim = legacy[sp.table].find(r => String(r[k]) !== '135' && String(r[k]) !== '132' && !base.onlyLegacy.includes(r) && !base.changed.some(c => c.id === String(r[k])));
  const wasVal = db.prepare('SELECT isautogenerateinout v FROM c_doctype WHERE c_doctype_id=135').get().v;
  db.prepare("UPDATE c_doctype SET isautogenerateinout=? WHERE c_doctype_id=135").run(wasVal === 'Y' ? 'N' : 'Y');
  db.prepare('DELETE FROM c_doctype WHERE c_doctype_id=?').run(Number(victim[k]));
  const r1 = D.compare(legacy[sp.table], db, sp);
  const det1 = r1.changed.some(c => c.id === '135' && c.col === 'isautogenerateinout'), det2 = r1.onlyLegacy.some(r => String(r[k]) === String(victim[k]));
  out('§DD_DETECT', det1 && det2, `corrupted 135.isautogenerateinout (was ${wasVal}) detected=${det1}; deleted doctype ${victim[k]} detected=${det2}`);
  const patch = D.toPatch(r1, sp);
  db.exec(patch);
  const r2 = D.compare(legacy[sp.table], db, sp);
  const fixed = r2.changed.every(c => baseKeys.has(c.id + '.' + c.col)) && r2.onlyLegacy.length === baseOnly;
  const val = db.prepare('SELECT isautogenerateinout v FROM c_doctype WHERE c_doctype_id=135').get().v;
  out('§DD_PATCH_FIX', fixed && val === wasVal && !!db.prepare('SELECT 1 FROM c_doctype WHERE c_doctype_id=?').get(Number(victim[k])),
    `after patch: 135.isautogenerateinout=${val} (legacy value ${pick.isautogenerateinout}), doctype ${victim[k]} restored, remaining diffs == pre-existing real findings (${r2.changed.length} cells, ${r2.onlyLegacy.length} rows)`);
  const before = JSON.stringify(db.prepare('SELECT * FROM c_doctype ORDER BY c_doctype_id').all());
  db.exec(patch);
  out('§DD_IDEMPOTENT', before === JSON.stringify(db.prepare('SELECT * FROM c_doctype ORDER BY c_doctype_id').all()), 'second apply of the same patch changed nothing');
  out('§DD_NO_DELETE', !/\bDELETE\b/i.test(patch) && !specs.filter(s => !s.columnsOnly).some(s => /\bDELETE\b/i.test(D.toPatch(D.compare(legacy[s.table], dbFor(s), s), s))), `generated patches contain no DELETE (onlyLocal rows: ${specs.filter(s => !s.columnsOnly).map(s => D.compare(legacy[s.table], dbFor(s), s).onlyLocal.length).join('/')} reported only)`);
  log(`§DD_VERDICT ${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§DD_VERDICT FAIL exception ' + e.stack); process.exit(2); });
