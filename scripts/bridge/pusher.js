// Bridge pusher (UP). App-agnostic. Drains the outbox in seq order, ONE composite call (= one server transaction) per document.
// Failure semantics (P6/P7/P8/P13):
//   NOT_SENT  → stays QUEUED, attempts+1, capped (then PARKED)       AUTH → stop the whole drain at once (no retry loop ⇒ no lockout)
//   FAULT / server IsError → REJECTED with the server's message; next documents still flow (no poison)
//   AMBIGUOUS (timeout/reset after send) → PARKED, never auto-resent  (state SENDING is persisted BEFORE the call, so a crash does the same)
//   separateCall descriptors (spec §D7): call 1 saves (committed, id remembered, row stays QUEUED+completePending), call 2 = doc-action; same classification per call; a rejected call 2 keeps the saved draft visible
//   success → read-back check against `expect`; mismatch → DIVERGED (never silently fixed)
'use strict';
const { composite, docAction, query } = require('./ad_client');
const { build } = require('./doc_writer');

async function drain(cfg, store, descriptors, opts = {}) {
  const log = opts.log || (() => {});
  const maxAttempts = opts.maxAttempts ?? 3;
  const hooks = opts.hooks || {};
  const res = { sent: 0, confirmed: 0, rejected: 0, parked: 0, diverged: 0, requeued: 0, stopped: null };
  for (const row of store.queued()) {
    const d = descriptors[row.descriptor];
    if (!d) { store.set(row.uid, 'REJECTED', { error: `unknown descriptor '${row.descriptor}'` }); res.rejected++; continue; }
    const payload = JSON.parse(row.payload);
    let req;
    try { req = build(d, payload); }
    catch (e) { store.set(row.uid, 'REJECTED', { error: e.message }); res.rejected++; log(`§PUSH ${row.uid} REJECTED(local) ${e.message}`); continue; }

    const prior = row.refs ? JSON.parse(row.refs) : null;
    const resume = !!(prior && prior.completePending);                 // spec §D7: call 1 already committed — never re-send it (P7)
    let hid, lineIds;
    if (resume) { hid = prior.header; lineIds = prior.lines || []; }
    else {
      store.set(row.uid, 'SENDING', { bump: true });                   // persisted before the call
      if (hooks.beforeSend) await hooks.beforeSend(row.uid);
      let r;
      try { res.sent++; r = await composite(cfg, req.serviceType, req.operations); }
      catch (e) {
        if (e.kind === 'AUTH') { store.set(row.uid, 'QUEUED', { error: e.message }); res.stopped = 'AUTH'; log(`§PUSH STOP auth: ${e.message}`); break; }
        if (e.kind === 'NOT_SENT') {
          const a = store.get(row.uid).attempts;
          if (a >= maxAttempts) { store.set(row.uid, 'PARKED', { error: `not sent after ${a} attempts: ${e.message}` }); res.parked++; }
          else { store.set(row.uid, 'QUEUED', { error: e.message }); res.requeued++; }
          log(`§PUSH ${row.uid} NOT_SENT attempts=${a}`); continue;
        }
        if (e.kind === 'FAULT') { store.set(row.uid, 'REJECTED', { error: e.message }); res.rejected++; log(`§PUSH ${row.uid} REJECTED fault`); continue; }
        store.set(row.uid, 'PARKED', { error: `AMBIGUOUS: ${e.message}` }); res.parked++; log(`§PUSH ${row.uid} PARKED ambiguous`); continue;
      }
      if (hooks.afterResponse) await hooks.afterResponse(row.uid, r);   // test seam: simulate a crash after the server committed
      if (!r.ok) { store.set(row.uid, 'REJECTED', { error: r.error, refs: { rolledBack: r.rolledBack } }); res.rejected++; log(`§PUSH ${row.uid} REJECTED rolledBack=${r.rolledBack} ${r.error}`); continue; }
      hid = r.ids[0]; lineIds = r.ids.slice(1, 1 + req.nLines);
      store.map(row.uid, d.header.table, hid);
      lineIds.forEach(i => store.map(row.uid, d.lines.table, i));
    }
    if (req.followUp) {                                                // spec §D7: the doc-action as its OWN server transaction (call 2)
      const f = req.followUp;
      if (!resume) store.set(row.uid, 'QUEUED', { error: 'saved; completion pending', refs: { header: hid, lines: lineIds, completePending: true } });   // committed on legacy ⇒ remembered before call 2
      store.set(row.uid, 'SENDING', { bump: true });
      if (hooks.beforeFollowUp) await hooks.beforeFollowUp(row.uid);
      const keep = { header: hid, lines: lineIds, completePending: true };
      let r2;
      try { res.sent++; r2 = await docAction(cfg, f.serviceType, f.table, hid, f.action); }
      catch (e) {
        if (e.kind === 'AUTH') { store.set(row.uid, 'QUEUED', { error: e.message, refs: keep }); res.stopped = 'AUTH'; log(`§PUSH STOP auth: ${e.message}`); break; }
        if (e.kind === 'NOT_SENT') {
          const a = store.get(row.uid).attempts;
          if (a >= maxAttempts) { store.set(row.uid, 'PARKED', { error: `completion not sent after ${a} attempts: ${e.message}`, refs: keep }); res.parked++; }
          else { store.set(row.uid, 'QUEUED', { error: `saved; completion pending: ${e.message}`, refs: keep }); res.requeued++; }
          log(`§PUSH ${row.uid} COMPLETE_NOT_SENT attempts=${a}`); continue;
        }
        if (e.kind === 'FAULT') { store.set(row.uid, 'REJECTED', { error: e.message, refs: { header: hid, lines: lineIds, savedDraft: true } }); res.rejected++; log(`§PUSH ${row.uid} REJECTED fault on completion; draft ${hid} kept`); continue; }
        store.set(row.uid, 'PARKED', { error: `AMBIGUOUS: ${e.message}`, refs: keep }); res.parked++; log(`§PUSH ${row.uid} PARKED ambiguous completion`); continue;
      }
      if (!r2.ok) { store.set(row.uid, 'REJECTED', { error: r2.error, refs: { header: hid, lines: lineIds, savedDraft: true } }); res.rejected++; log(`§PUSH ${row.uid} REJECTED completion ${r2.error}; draft ${hid} kept`); continue; }
    }
    let state = 'CONFIRMED', err = null;
    if (d.expect) {                                                    // read-back (legacy truth), compare to what we expect
      const rb = (await query(cfg, d.expect.serviceType, `${d.header.table}_ID=${hid}`))[0];
      const diffs = [];
      if (!rb) diffs.push('document not found on read-back');
      else for (const [c, s] of Object.entries(d.expect.cols)) {
        const want = ('const' in s) ? s.const : String(s.path.split('.').reduce((a, k) => a == null ? undefined : a[k], payload));
        if (String(rb[c]) !== String(want)) diffs.push(`${c}: server=${rb[c]} expected=${want}`);
      }
      if (rb && rb.DocumentNo) store.setDocno(row.uid, d.header.table, rb.DocumentNo);
      if (diffs.length) { state = 'DIVERGED'; err = diffs.join('; '); }
    }
    store.set(row.uid, state, { error: err, refs: { header: hid, lines: lineIds } });
    if (state === 'CONFIRMED') res.confirmed++; else res.diverged++;
    log(`§PUSH ${row.uid} ${state} header=${hid} lines=${lineIds.length}${err ? ' ' + err : ''}`);
  }
  log(`§PUSH_SUMMARY ${JSON.stringify(res)}`);
  return res;
}
module.exports = { drain };
