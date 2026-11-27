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
  const lk = sp => sp.out || sp.table;   // spec §68: the same legacy table may be synced into two SQLite dbs (posting db + seed) ⇒ own patch name
  for (const sp of specs) {
    legacy[lk(sp)] = await D.discover(cfg, sp);
    const r = D.compare(legacy[lk(sp)], dbFor(sp), sp); total += r.legacy;
    if (r.missingCols.length) log(`§DD_COLUMNS ${sp.table} legacy-has-but-sqlite-lacks=[${r.missingCols.join(',')}] (needs ALTER via patch+loader, not a data patch)`);
    if (r.columnsOnly) { log(`§DD_TABLE ${sp.table} legacy_sample=${r.legacy} cols_compared=${r.columns} (columns-only: composite key)`); continue; }
    log(`§DD_TABLE ${sp.table} legacy=${r.legacy} local=${r.local} cols_compared=${r.columns} onlyLegacy=${r.onlyLegacy.length} onlyLocal=${r.onlyLocal.length} changed_cells=${r.changed.length}${r.onlyLocal.length ? ' onlyLocal_ids=' + r.onlyLocal.slice(0, 8).join(',') : ''}`);
    for (const c of r.changed.slice(0, 12)) log(`§DICT_GAP ${sp.table}#${c.id}.${c.col} legacy=${JSON.stringify(c.legacy)} sqlite=${JSON.stringify(c.local)}`);
    for (const row of r.onlyLegacy.slice(0, 5)) log(`§DICT_GAP ${sp.table}#${[].concat(sp.key).map(k => row[k.toLowerCase()]).join('|')} missing in SQLite`);
    fs.writeFileSync(path.join(__dirname, 'out', `dict_patch_${lk(sp)}.sql`), D.toPatch(r, sp));
    if (sp.addColumns || r.missingTable) fs.writeFileSync(path.join(__dirname, 'out', `dict_schema_${lk(sp)}.sql`), D.toSchemaPatch(r, sp));
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
  out('§DD_NO_DELETE', !/^\s*DELETE\b/im.test(patch) && !specs.filter(s => !s.columnsOnly).some(s => /^\s*DELETE\b/im.test(D.toPatch(D.compare(legacy[lk(s)], dbFor(s), s), s) + D.toSchemaPatch(D.compare(legacy[lk(s)], dbFor(s), s), s))), `generated patches contain no DELETE (onlyLocal rows: ${specs.filter(s => !s.columnsOnly).map(s => D.compare(legacy[lk(s)], dbFor(s), s).onlyLocal.length).join('/')} reported only)`);
  // ---- spec §37: SCHEMA patch (ALTER + legacy values) on the scratch glassbowl copy, loader-guarded, idempotent; composite-key negative control
  const schemaSpecs = specs.filter(x => x.addColumns && x.db === 'glassbowl');
  const applied = [];
  for (const x of schemaSpecs) { const r = D.compare(legacy[lk(x)], gdb, x); const st = D.applyPatch(gdb, D.toSchemaPatch(r, x) + D.toPatch(r, x)); applied.push(`${x.table}:+${st.altered}col/${st.ran}stmt`); }
  const after = schemaSpecs.map(x => { const r = D.compare(legacy[lk(x)], gdb, x); return { t: x.table, missingAdded: x.addColumns.filter(c => r.missingCols.includes(c.toLowerCase())), changed: r.changed.length, onlyLegacy: r.onlyLegacy.length }; });
  out('§DD_SCHEMA_PATCH', schemaSpecs.length > 0 && after.every(a => !a.missingAdded.length && !a.changed && !a.onlyLegacy),
    `applied ${applied.join(' ')}; re-diff: ${after.map(a => `${a.t} stillMissing=[${a.missingAdded}] changed=${a.changed} onlyLegacy=${a.onlyLegacy}`).join('; ')}`);
  const snap = () => JSON.stringify(schemaSpecs.map(x => gdb.prepare(`SELECT * FROM ${x.table}`).all()));
  const s1 = snap(); let reErr = null, st2 = [];
  try { for (const x of schemaSpecs) { const r0 = D.compare(legacy[lk(x)], gdb, x); st2.push(D.applyPatch(gdb, D.toSchemaPatch(Object.assign({}, r0, { missingCols: x.addColumns.map(c => c.toLowerCase()) }), x))); } } catch (e) { reErr = e.message; }
  out('§DD_SCHEMA_IDEMPOTENT', !reErr && s1 === snap() && st2.every(t => t.altered === 0 && t.skipped > 0), `second apply (ALTERs forced into the text): error=${reErr || 'none'} altered=${st2.map(t => t.altered).join('/')} skipped=${st2.map(t => t.skipped).join('/')} rows unchanged=${s1 === snap()}`);
  // spec §68: a table MISSING in a SQLite db (the seed has no ad_sysconfig) — the §49 CREATE patch on the scratch copy, re-diff clean, re-apply idempotent
  const createSpecs = specs.filter(x => x.db !== 'glassbowl' && !x.columnsOnly && D.compare(legacy[lk(x)], dbFor(x), x).missingTable);
  if (!createSpecs.length) out('§DD_CREATE_TABLE', 'INCONCLUSIVE', 'no spec table is missing in its SQLite db — nothing to create');
  else {
    const res = createSpecs.map(x => { const r = D.compare(legacy[lk(x)], db, x); const st = D.applyPatch(db, D.toSchemaPatch(r, x)); const r2 = D.compare(legacy[lk(x)], db, x);
      const snap1 = JSON.stringify(db.prepare(`SELECT * FROM ${x.table}`).all()); D.applyPatch(db, D.toSchemaPatch(r, x)); const same = snap1 === JSON.stringify(db.prepare(`SELECT * FROM ${x.table}`).all());
      return { t: lk(x), legacy: r.legacy, ran: st.ran, local: r2.local, gaps: r2.changed.length + r2.onlyLegacy.length, missingCols: r2.missingCols.length, same }; });
    out('§DD_CREATE_TABLE', res.every(a => a.legacy > 0 && a.local === a.legacy && !a.gaps && !a.missingCols && a.same),
      res.map(a => `${a.t}: legacy=${a.legacy} created+inserted stmts=${a.ran} local_after=${a.local} gaps_after=${a.gaps} missing_cols_after=${a.missingCols} reapply_unchanged=${a.same}`).join('; '));
  }
  const mc = specs.find(x => x.table === 'm_cost'), lrow = legacy.m_cost.find(r => Number(r.currentqty) > 0);
  if (mc && lrow) {
    gdb.prepare('UPDATE m_cost SET currentqty=currentqty+999 WHERE m_product_id=? AND c_acctschema_id=? AND m_costtype_id=? AND m_costelement_id=?').run(lrow.m_product_id, lrow.c_acctschema_id, lrow.m_costtype_id, lrow.m_costelement_id);
    const rc = D.compare(legacy.m_cost, gdb, mc), hit = rc.changed.find(c => c.col === 'currentqty');
    D.applyPatch(gdb, D.toPatch(rc, mc)); const rc2 = D.compare(legacy.m_cost, gdb, mc);
    out('§DD_COMPOSITE_DETECT', !!hit && hit.id === [lrow.m_product_id, lrow.c_acctschema_id, lrow.m_costtype_id, lrow.m_costelement_id].map(Number).join('|') && rc2.changed.length === 0,
      `corrupted m_cost[${hit && hit.id}].currentqty detected=${!!hit}; after patch changed=${rc2.changed.length}`);
  } else out('§DD_COMPOSITE_DETECT', 'INCONCLUSIVE', 'no legacy m_cost row with currentqty>0');
  log(`§DD_VERDICT ${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§DD_VERDICT FAIL exception ' + e.stack); process.exit(2); });
