// Spec: prompts/SQLiteIDEMPIERE.md §FIXTURE-SHIPPED-SEED-2026-10-11. One loader for the AD-window-path scratch DB:
// the SHIPPED bim-ootb erp/ad_seed.db + its self-heal patch erp/patches/ad_seed.db.sql (what idempiere.html does on boot),
// SQL functions registered (callouts/sqlfn.js), a scratch copy only (shipped file never written).
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const Database = require('better-sqlite3');
function registerUdfs(OOTB, db) {
  let n = 0, why = null;
  try {
    const A = require(path.join(OOTB, 'erp/ad_callout.js')); require(path.join(OOTB, 'erp/callouts/sqlfn.js'));
    A.RUNTIME.registerSqlFunctions((nm, f) => { db.function(nm, { varargs: true }, (...a) => f(...a)); n++; });
  } catch (e) { why = e.message; }
  return { n, why };
}
// better-sqlite3 forbids a query on a connection that is mid-statement; sql.js (the shipped host) allows it, and the pricing UDFs (bomPriceStd...) query
// from INSIDE a running statement. Fallback: re-entrant reads go to a lazily-taken snapshot connection (reference data only; the snapshot is retaken per call).
function reentrant(db, OOTB) {
  return (sql, p) => { try { return db.prepare(sql).all(...(p || [])); }
    catch (e) { if (!/busy executing/.test(e.message)) throw e; const snap = new Database(db.serialize()); if (OOTB) registerUdfs(OOTB, snap); try { return snap.prepare(sql).all(...(p || [])); } finally { snap.close(); } } };
}
function loadShipped(OOTB, log) {
  const seed = path.join(OOTB, 'erp/ad_seed.db'), patch = path.join(OOTB, 'erp/patches/ad_seed.db.sql');
  const f0 = path.join(os.tmpdir(), 'ad-shipped-' + process.pid + '.db'); fs.copyFileSync(seed, f0);
  const db = new Database(f0);
  let ok = 0, fail = 0;
  if (fs.existsSync(patch)) fs.readFileSync(patch, 'utf8').split(/;\s*\n/).forEach(st => { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (!st) return; try { db.exec(st); ok++; } catch (e) { fail++; } });
  const { n: udf, why: udfWhy } = registerUdfs(OOTB, db);
  const prices = db.prepare('SELECT COUNT(*) n FROM m_productprice').get().n;
  const rq = reentrant(db, OOTB);
  const q = (sql, p) => { try { return rq(sql, p).map(r => { const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; }); } catch (e) { return []; } };
  (log || console.log)(`§FIXTURE_SHIPPED seed=${seed} patch_stmts_ok=${ok} failed=${fail} sql_functions=${udf}${udfWhy ? ' (UDF load failed: ' + udfWhy + ')' : ''} product_prices=${prices} ${prices > 0 ? 'FIXTURE_HAS_PRICES' : 'INCONCLUSIVE:fixture has no product prices'}`);
  return { db, q, prices, udf };
}
module.exports = { loadShipped, registerUdfs, reentrant };
