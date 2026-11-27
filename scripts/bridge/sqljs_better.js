// ⚠ DO NOT REMOVE — Scope: TEAMWORK_FRAMEWORK.md §45.15b (an apple-for-apple beat 10). A better-sqlite3-shaped adapter over sql.js — SQLite compiled to
// WebAssembly, the engine the browser twin runs — so the parallel run's SQLite side can be timed on WASM instead of native SQLite. Only the surface the
// m3 harness + doc_poster use: new Database(file), prepare(sql).get/all/run, exec, transaction. The sql.js module must be initialised first:
// global.__SQLJS = await initSqlJs(...). Opt-in only (M3_SQLJS=1 in witness_m3_gap.js); the default stays native.
'use strict';
const fs = require('fs');
function params(a) { if (a.length === 1 && Array.isArray(a[0])) return a[0]; if (a.length === 1 && a[0] && typeof a[0] === 'object') { const o = {}; Object.keys(a[0]).forEach(k => { o[/^[:@$]/.test(k) ? k : '@' + k] = a[0][k]; o[':' + k] = a[0][k]; o['$' + k] = a[0][k]; }); return o; } return a; }
function norm(v) { return v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : typeof v === 'bigint' ? Number(v) : v; }
class Database {
  constructor(file) { if (!global.__SQLJS) throw new Error('sqljs_better: global.__SQLJS not initialised'); this.db = new global.__SQLJS.Database(file && fs.existsSync(file) ? fs.readFileSync(file) : undefined); }
  prepare(sql) { const db = this.db;
    const bind = (st, a) => { const p = params(a); if (Array.isArray(p)) { if (p.length) st.bind(p.map(norm)); } else { const q = {}; Object.keys(p).forEach(k => { q[k] = norm(p[k]); }); st.bind(q); } };
    return {
      get: (...a) => { const st = db.prepare(sql); try { bind(st, a); return st.step() ? st.getAsObject() : undefined; } finally { st.free(); } },
      all: (...a) => { const st = db.prepare(sql), o = []; try { bind(st, a); while (st.step()) o.push(st.getAsObject()); return o; } finally { st.free(); } },
      run: (...a) => { const st = db.prepare(sql); try { bind(st, a); st.step(); } finally { st.free(); } const r = db.exec('SELECT changes() c, last_insert_rowid() i'); const v = r.length ? r[0].values[0] : [0, 0]; return { changes: v[0], lastInsertRowid: v[1] }; } }; }
  exec(sql) { this.db.exec(sql); return this; }
  transaction(fn) { const self = this; return function (...a) { self.db.exec('BEGIN'); try { const r = fn.apply(this, a); self.db.exec('COMMIT'); return r; } catch (e) { try { self.db.exec('ROLLBACK'); } catch (x) {} throw e; } }; }
  close() { this.db.close(); }
}
module.exports = Database;
