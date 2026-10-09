// Bridge local store (SQLite via sql.js): outbox + state + id map. App-agnostic. Spec: prompts/SQLiteIDEMPIERE.md §17/§19/§20 (M1).
// States: QUEUED → SENDING (persisted BEFORE the call) → CONFIRMED | REJECTED | DIVERGED | PARKED.
// SENDING found at open() = a crash/ambiguity after the call began ⇒ PARKED (P7: undecidable ⇒ park, never guess).
'use strict';
const fs = require('fs');
const initSqlJs = require('sql.js');

async function open(file) {
  const SQL = await initSqlJs();
  const db = file && fs.existsSync(file) ? new SQL.Database(fs.readFileSync(file)) : new SQL.Database();
  db.run(`CREATE TABLE IF NOT EXISTS bridge_outbox(
    id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT UNIQUE NOT NULL, seq INTEGER NOT NULL, descriptor TEXT NOT NULL,
    payload TEXT NOT NULL, state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, error TEXT, refs TEXT,
    created TEXT NOT NULL, updated TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS bridge_idmap(uid TEXT NOT NULL, tbl TEXT NOT NULL, server_id INTEGER NOT NULL, docno TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS bridge_inbox(tbl TEXT NOT NULL, server_id INTEGER NOT NULL, status TEXT NOT NULL, local_ref TEXT, error TEXT, at TEXT NOT NULL, PRIMARY KEY(tbl,server_id))`);
  db.run(`CREATE TABLE IF NOT EXISTS bridge_kv(k TEXT PRIMARY KEY, v TEXT)`);
  const persist = () => { if (file) fs.writeFileSync(file, Buffer.from(db.export())); };
  const now = () => new Date().toISOString();
  const all = (sql, p = []) => { const st = db.prepare(sql); st.bind(p); const o = []; while (st.step()) o.push(st.getAsObject()); st.free(); return o; };

  const api = {
    db, persist, all,
    enqueue(uid, descriptor, payload) {
      const seq = (all('SELECT COALESCE(MAX(seq),0)+1 AS n FROM bridge_outbox')[0].n);
      db.run('INSERT INTO bridge_outbox(uid,seq,descriptor,payload,state,created,updated) VALUES(?,?,?,?,?,?,?)',
        [uid, seq, descriptor, JSON.stringify(payload), 'QUEUED', now(), now()]);
      persist(); return seq;
    },
    queued: () => all("SELECT * FROM bridge_outbox WHERE state='QUEUED' ORDER BY seq"),
    get: uid => all('SELECT * FROM bridge_outbox WHERE uid=?', [uid])[0],
    states: () => all('SELECT uid,seq,state,attempts,error FROM bridge_outbox ORDER BY seq'),
    set(uid, state, { error = null, refs = null, bump = false } = {}) {
      db.run('UPDATE bridge_outbox SET state=?, error=?, refs=COALESCE(?,refs), attempts=attempts+?, updated=? WHERE uid=?',
        [state, error, refs && JSON.stringify(refs), bump ? 1 : 0, now(), uid]);
      persist();
    },
    map(uid, tbl, serverId, docno) { db.run('INSERT INTO bridge_idmap VALUES(?,?,?,?)', [uid, tbl, serverId, docno || null]); persist(); },
    setDocno(uid, tbl, docno) { db.run('UPDATE bridge_idmap SET docno=? WHERE uid=? AND tbl=?', [docno, uid, tbl]); persist(); },
    idmap: uid => all('SELECT tbl,server_id,docno FROM bridge_idmap WHERE uid=?', [uid]),
    // DOWN side: what was applied locally from legacy (exactly-once guard) + small key/value (watermarks)
    inboxGet: (tbl, id) => all('SELECT * FROM bridge_inbox WHERE tbl=? AND server_id=?', [tbl, id])[0],
    inboxSet(tbl, id, status, localRef, error) {
      db.run('INSERT OR REPLACE INTO bridge_inbox VALUES(?,?,?,?,?,?)', [tbl, id, status, localRef || null, error || null, now()]); persist();
    },
    inbox: () => all('SELECT * FROM bridge_inbox ORDER BY server_id'),
    isOwnServerId: (tbl, id) => all('SELECT 1 FROM bridge_idmap WHERE tbl=? AND server_id=?', [tbl, id]).length > 0,
    kvGet: k => (all('SELECT v FROM bridge_kv WHERE k=?', [k])[0] || {}).v,
    kvSet(k, v) { db.run('INSERT OR REPLACE INTO bridge_kv VALUES(?,?)', [k, String(v)]); persist(); },
    // crash recovery: anything still SENDING is ambiguous ⇒ PARKED
    recover() {
      const s = all("SELECT uid FROM bridge_outbox WHERE state='SENDING'");
      for (const r of s) api.set(r.uid, 'PARKED', { error: 'AMBIGUOUS: process ended while a send was in flight; server outcome unknown (P7)' });
      return s.length;
    },
  };
  return api;
}
module.exports = { open };
