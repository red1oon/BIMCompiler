// legacy_link — THE one entry point any part of the SQLite side uses to reach legacy iDempiere through its WebServices (spec §53).
// App-agnostic facade over transport / outbox / pusher / tracker / replay / reconcile. Nothing here knows what a document IS; apps pass
// descriptors (what to write) and rules (how to apply what legacy did). Isomorphic: no Node-only API at module level (fetch, sql.js, injected persistence).
//   const link = await createLink({ cfg, persistence, descriptors, log })
//   link.submit(name, payload[, uid])  → queued (local-first, never blocks on the network)      link.drain()   → push outbox (one composite WS call per document)
//   link.baseline(rules) / link.pull(rules) → DOWN (change log → read document → rules.apply)    link.read(readType, filter) → rows (read-only WS types)
//   link.compare(scenarios, spec, quirks)  → parallel-run reconcile (CARDINAL RULE enforced)      link.status() → outbox/inbox state for any UI
'use strict';
const ad = require('./ad_client');
const store = require('./store');
const { drain } = require('./pusher');
const { createTracker } = require('./changelog_tracker');
const { createReplayer } = require('./replay');
const R = require('./reconcile');

async function createLink({ cfg, persistence, descriptors = {}, ownUserId, log = () => {}, window }) {
  const s = await store.open(persistence);
  const recovered = s.recover();                                   // crash recovery: SENDING ⇒ PARKED (P7)
  if (recovered) log(`§LINK recovered=${recovered} in-flight sends parked`);
  let n = 0;
  const replayers = new Map();
  const replayerFor = rules => {
    const k = rules.table;
    if (!replayers.has(k)) replayers.set(k, createReplayer(cfg, s, createTracker(cfg, { ownUserId, log, window }), rules, { log }));
    return replayers.get(k);
  };
  return {
    store: s,
    submit(name, payload, uid) {
      if (!descriptors[name]) throw new Error(`§LINK unknown descriptor '${name}'`);
      const id = uid || `u${Date.now().toString(36)}-${++n}`;
      s.enqueue(id, name, payload); log(`§LINK queued ${id} (${name})`); return id;
    },
    drain: opts => drain(cfg, s, descriptors, { log, ...opts }),
    baseline: rules => replayerFor(rules).baseline(),
    pull: rules => replayerFor(rules).run(),
    read: (readType, filter) => ad.query(cfg, readType, filter),
    compare: (scenarios, spec, quirks) => R.run(scenarios, spec, quirks, { log }),
    status() {
      const by = {}; for (const r of s.states()) by[r.state] = (by[r.state] || 0) + 1;
      return { outbox: by, parked: s.states().filter(r => r.state === 'PARKED' || r.state === 'REJECTED').map(r => ({ uid: r.uid, state: r.state, error: r.error })), inbox: s.inbox().length };
    },
  };
}
module.exports = { createLink };
