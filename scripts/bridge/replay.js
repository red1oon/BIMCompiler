// Bridge DOWN replay. App-agnostic. Tracker events (AD_ChangeLog) → for documents that reached a replay status, read the whole
// document from legacy (header + lines) and hand it to the app's LOCAL doc engine via rules.apply(doc). Exactly-once via bridge_inbox.
// Spec: prompts/SQLiteIDEMPIERE.md §4, §21 (twin), §20 M2.
//   rules = { table, lineTable, headerRead, lineRead, lineParent, replayOn:['CO',…], apply: async doc => localRef }
// Own-echo: a document the Bridge itself pushed (server id in bridge_idmap) is never replayed back.
'use strict';
const { query } = require('./ad_client');

function createReplayer(cfg, store, tracker, rules, opts = {}) {
  const log = opts.log || (() => {});
  const wmKey = `wm:${rules.table}`;
  if (store.kvGet(wmKey) && !tracker.state.wm) tracker.state.wm = +store.kvGet(wmKey);   // resume after restart (window + inbox dedupe cover the overlap)

  async function readDoc(id) {
    const header = (await query(cfg, rules.headerRead, `${rules.table}_ID=${id}`))[0];
    const lines = header ? await query(cfg, rules.lineRead, `${rules.lineParent}=${id}`) : [];
    return { table: rules.table, id, header, lines };
  }

  async function run() {
    const p = await tracker.poll();
    const res = { events: p.events.length, candidates: 0, applied: 0, ownSkipped: 0, duplicate: 0, failed: 0, notReady: 0 };
    for (const e of p.events) {
      if (e.table !== rules.table || !e.docStatus || !rules.replayOn.includes(e.docStatus.to)) continue;
      res.candidates++;
      if (store.isOwnServerId(rules.table, e.record)) { res.ownSkipped++; log(`§REPLAY ${rules.table}#${e.record} OWN-ECHO skipped`); continue; }
      const prior = store.inboxGet(rules.table, e.record);
      if (prior && prior.status === 'APPLIED') { res.duplicate++; log(`§REPLAY ${rules.table}#${e.record} already applied (dedupe)`); continue; }
      let doc;
      try { doc = await readDoc(e.record); } catch (err) { store.inboxSet(rules.table, e.record, 'FAILED', null, err.message); res.failed++; continue; }
      if (!doc.header) { store.inboxSet(rules.table, e.record, 'FAILED', null, 'document not readable on legacy'); res.failed++; continue; }
      if (!rules.replayOn.includes(String(doc.header.DocStatus))) { res.notReady++; log(`§REPLAY ${rules.table}#${e.record} now ${doc.header.DocStatus}, not replayed`); continue; }
      try {
        const ref = await rules.apply(doc);
        store.inboxSet(rules.table, e.record, 'APPLIED', ref);
        res.applied++; log(`§REPLAY ${rules.table}#${e.record} APPLIED lines=${doc.lines.length} → ${ref}`);
      } catch (err) {
        store.inboxSet(rules.table, e.record, 'FAILED', null, err.message); res.failed++; log(`§REPLAY ${rules.table}#${e.record} FAILED ${err.message}`);
      }
    }
    store.kvSet(wmKey, tracker.state.wm);
    log(`§REPLAY_SUMMARY ${JSON.stringify(res)} wm=${tracker.state.wm}`);
    return res;
  }
  return { run, readDoc };
}
module.exports = { createReplayer };
