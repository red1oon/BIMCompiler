// Bridge change-log tracker (plugin-agnostic). Spec: prompts/SQLiteIDEMPIERE.md §4/§12, witness W10.
// Reads AD_ChangeLog through the QueryChangeLog WS type; watermark + trailing re-read window + dedupe on
// (AD_ChangeLog_ID, AD_Column_ID); groups column rows into per-save events; reconstructs doc-action transitions.
'use strict';
const { query } = require('./ad_client');

function createTracker(cfg, opts = {}) {
  const win = opts.window ?? 200;                    // trailing ids re-read each poll (late-commit guard)
  const state = opts.state || { wm: 0, seen: new Set() };
  const colName = new Map();                         // AD_Column_ID -> {name, table}
  const tblName = new Map();
  const log = opts.log || (() => {});

  async function resolve(rowsIn) {
    const needC = [...new Set(rowsIn.map(r => r.AD_Column_ID))].filter(i => !colName.has(i));
    if (needC.length) {
      for (const r of await query(cfg, 'QueryADColumn', `AD_Column_ID IN (${needC.join(',')})`))
        colName.set(r.AD_Column_ID, r.ColumnName);
    }
    const needT = [...new Set(rowsIn.map(r => r.AD_Table_ID))].filter(i => !tblName.has(i));
    if (needT.length) {
      for (const r of await query(cfg, 'QueryADTable', `AD_Table_ID IN (${needT.join(',')})`))
        tblName.set(r.AD_Table_ID, r.TableName);
    }
  }

  // own = written by this Bridge's WS login (user + ws_ trxname) -> not to be re-applied downward
  const isOwn = r => r.CreatedBy === opts.ownUserId && typeof r.TrxName === 'string' && r.TrxName.startsWith('ws_');

  function group(newRows) {
    const ev = new Map();
    for (const r of newRows) {
      let e = ev.get(r.AD_ChangeLog_ID);
      if (!e) {
        e = { id: r.AD_ChangeLog_ID, table: tblName.get(r.AD_Table_ID), tableId: r.AD_Table_ID, record: r.Record_ID,
              session: r.AD_Session_ID, trx: r.TrxName, user: r.CreatedBy, event: r.EventChangeLog,
              created: r.Created, own: isOwn(r), changes: [] };
        ev.set(r.AD_ChangeLog_ID, e);
      }
      e.changes.push({ col: colName.get(r.AD_Column_ID), colId: r.AD_Column_ID, old: r.OldValue, new: r.NewValue });
    }
    for (const e of ev.values()) {
      const ds = e.changes.find(c => c.col === 'DocStatus');
      if (ds) e.docStatus = { from: ds.old, to: ds.new };
    }
    return [...ev.values()].sort((a, b) => a.id - b.id);
  }

  // returns { fresh: rows never seen, reread: rows seen again in window, events, wm }
  async function poll() {
    const from = Math.max(0, state.wm - win);
    // spec §76 (P17, P13): the FIRST poll (no watermark) used to read the WHOLE change log in one WS answer — at 79 713 rows the server fails writing it (HTTP 500,
    // JAXRSUtils "Problem with writing the data", pilot log 07:33:13). A baseline only needs the tail: rows older than (max − window) are consumed, never returned.
    const filter = state.wm === 0 && !opts.fullHistory ? `AD_ChangeLog_ID > (SELECT COALESCE(MAX(AD_ChangeLog_ID),0) - ${win} FROM AD_ChangeLog)` : `AD_ChangeLog_ID > ${from}`;
    const got = await query(cfg, 'QueryChangeLog', filter);
    const fresh = [];
    for (const r of got) {
      const k = `${r.AD_ChangeLog_ID}:${r.AD_Column_ID}`;
      if (state.seen.has(k)) continue;
      state.seen.add(k); fresh.push(r);
      if (r.AD_ChangeLog_ID > state.wm) state.wm = r.AD_ChangeLog_ID;
    }
    await resolve(fresh);
    const events = group(fresh);
    log(`§CL_POLL from=${from} got=${got.length} fresh=${fresh.length} reread=${got.length - fresh.length} events=${events.length} wm=${state.wm}`);
    return { fresh, reread: got.length - fresh.length, events, wm: state.wm };
  }

  return { poll, state, isOwn, window: win };
}

module.exports = { createTracker };
