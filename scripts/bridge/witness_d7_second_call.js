// ⚠ DO NOT REMOVE — D7 witness (spec prompts/SQLiteIDEMPIERE.md §D7): descriptor option docAction.separateCall = "save, then complete in a second call".
// Fault-injected fetch, NO pilot needed. READ THE LOG after every run (exit code is not evidence).
// Issue each assertion proves/disproves (all of them on the generic pusher, not on any model):
//  §D7_SHAPE      option ON ⇒ call 1 has NO setDocAction operation and call 2 is the stock set_docaction with the header id; OFF ⇒ exactly one composite, no call 2 (negative control)
//  §D7_IDEMPOTENT call 2 NOT_SENT ⇒ row stays QUEUED+completePending, re-drain sends call 2 ONLY (call 1 count stays 1), then CONFIRMED
//  §D7_CAP        call 2 NOT_SENT beyond maxAttempts ⇒ PARKED with the header id remembered (nothing lost, no duplicate)
//  §D7_REJECT     call 2 IsError ⇒ REJECTED with the server text, draft id kept in refs, later documents still flow
//  §D7_AMBIGUOUS  call 2 timeout/reset after send ⇒ PARKED, never auto-resent
//  §D7_CRASH      process ends between SENDING and the reply of call 2 ⇒ recover() PARKS it, no resend
//  §D7_AUTH       call 2 auth fault ⇒ drain stops, row QUEUED+completePending
'use strict';
const store = require('./store'), { drain } = require('./pusher');
let fails = 0, judged = 0;
const out = (tag, ok, msg) => { judged++; console.log(`${tag} ${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) fails++; };
const mk = sep => ({ x: { composite: 'Svc', header: { serviceType: 'MkH', table: 'T_Doc', fields: { Name: { path: 'n' } } },
  lines: { serviceType: 'MkL', table: 'T_Line', parent: 'T_Doc_ID', from: 'lines', fields: { V: { path: 'v' } } },
  docAction: { serviceType: 'Act', table: 'T_Doc', action: 'CO', ...(sep ? { separateCall: true } : {}) } } });
const cfg = { base: 'http://x', login: { user: 'u' } };
const pay = n => ({ n, lines: [{ v: 1 }] });
let id = 500;
// script: behaviour of call 2 per test
async function run(sep, act, opts = {}, uids = ['d1']) {
  const calls = { c1: 0, c2: 0, c1ops: [], c2body: [] };
  const real = global.fetch;
  global.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    if (String(url).includes('composite_operation')) {
      calls.c1++; const ops = body.CompositeRequest.operations.operation; calls.c1ops.push(ops.map(o => o.TargetPort));
      const resp = ops.map(() => ({ '@RecordID': ++id })); return { text: async () => JSON.stringify({ CompositeResponses: { CompositeResponse: { StandardResponse: resp } } }) };
    }
    calls.c2++; calls.c2body.push(body); const a = act(calls.c2);
    if (a === 'notsent') { const e = new TypeError('fetch failed'); e.cause = { code: 'ECONNREFUSED' }; throw e; }
    if (a === 'reset') { const e = new TypeError('fetch failed'); e.cause = { code: 'ECONNRESET' }; throw e; }
    if (a === 'auth') return { text: async () => JSON.stringify({ StandardResponse: { '@IsError': true, Error: 'Error logging in' } }) };
    if (a === 'err') return { text: async () => JSON.stringify({ StandardResponse: { '@IsError': true, Error: 'Document must balance' } }) };
    return { text: async () => JSON.stringify({ StandardResponse: { '@RecordID': 1 } }) };
  };
  const s = await store.open(); uids.forEach(u => s.enqueue(u, 'x', pay(u)));
  try { const r = await drain(cfg, s, mk(sep), { log: () => {}, ...opts }); return { s, r, calls, restore: () => { global.fetch = real; } }; }
  finally { global.fetch = real; }
}
(async () => {
  let t = await run(true, () => 'ok');
  out('§D7_SHAPE', t.calls.c1 === 1 && t.calls.c2 === 1 && !t.calls.c1ops[0].includes('setDocAction') && t.calls.c2body[0].ModelSetDocActionRequest.ModelSetDocAction.recordID === t.s.idmap('d1')[0].server_id && t.calls.c2body[0].ModelSetDocActionRequest.ModelSetDocAction.docAction === 'CO' && t.s.get('d1').state === 'CONFIRMED',
    `ON: composite ops=${t.calls.c1ops[0]} call2=${t.calls.c2} recordID=${t.calls.c2body[0].ModelSetDocActionRequest.ModelSetDocAction.recordID} state=${t.s.get('d1').state}`);
  t = await run(false, () => 'ok');
  out('§D7_SHAPE_OFF_CONTROL', t.calls.c1 === 1 && t.calls.c2 === 0 && t.calls.c1ops[0].includes('setDocAction'), `OFF: composite ops=${t.calls.c1ops[0]} call2=${t.calls.c2} (must be 0, one composite incl. setDocAction)`);
  // idempotent resume: first drain call 2 NOT_SENT, second drain ok
  t = await run(true, n => 'notsent');
  const st1 = t.s.get('d1'), r1 = JSON.parse(st1.refs);
  const real = global.fetch; let c1b = 0;
  global.fetch = async (url, init) => { if (String(url).includes('composite_operation')) c1b++; return { text: async () => JSON.stringify({ StandardResponse: { '@RecordID': 1 } }) }; };
  const r2 = await drain(cfg, t.s, mk(true), { log: () => {} }); global.fetch = real;
  out('§D7_IDEMPOTENT', st1.state === 'QUEUED' && r1.completePending && r1.header && c1b === 0 && t.s.get('d1').state === 'CONFIRMED' && t.s.idmap('d1').filter(x => x.tbl === 'T_Doc').length === 1,
    `after NOT_SENT: state=${st1.state} completePending=${r1.completePending} header=${r1.header}; re-drain call1=${c1b} (must be 0) final=${t.s.get('d1').state} header_maps=${t.s.idmap('d1').filter(x => x.tbl === 'T_Doc').length}`);
  // cap
  t = await run(true, () => 'notsent', { maxAttempts: 2 });
  global.fetch = () => { const e = new TypeError('f'); e.cause = { code: 'ECONNREFUSED' }; throw e; };
  await drain(cfg, t.s, mk(true), { log: () => {}, maxAttempts: 2 }); global.fetch = real;
  const rc = JSON.parse(t.s.get('d1').refs);
  out('§D7_CAP', t.s.get('d1').state === 'PARKED' && rc.header && rc.completePending, `state=${t.s.get('d1').state} attempts=${t.s.get('d1').attempts} header kept=${rc.header}`);
  // reject + no poison
  t = await run(true, n => (n === 1 ? 'err' : 'ok'), {}, ['bad', 'next']);
  const rr = JSON.parse(t.s.get('bad').refs);
  out('§D7_REJECT', t.s.get('bad').state === 'REJECTED' && /balance/.test(t.s.get('bad').error) && rr.savedDraft && rr.header && t.s.get('next').state === 'CONFIRMED', `bad=${t.s.get('bad').state} (${t.s.get('bad').error}) draft=${rr.header} next=${t.s.get('next').state}`);
  // ambiguous
  t = await run(true, () => 'reset');
  const c2a = t.calls.c2; const again = await (async () => { let n = 0; global.fetch = async () => { n++; return { text: async () => '{}' }; }; await drain(cfg, t.s, mk(true), { log: () => {} }); global.fetch = real; return n; })();
  out('§D7_AMBIGUOUS', t.s.get('d1').state === 'PARKED' && /AMBIGUOUS/.test(t.s.get('d1').error) && again === 0, `state=${t.s.get('d1').state} calls_on_redrain=${again} (must be 0)`);
  // crash between SENDING and reply
  const s = await store.open(); s.enqueue('k', 'x', pay('k'));
  global.fetch = async (url) => String(url).includes('composite_operation') ? { text: async () => JSON.stringify({ CompositeResponses: { CompositeResponse: { StandardResponse: [{ '@RecordID': 7 }, { '@RecordID': 8 }] } } }) } : (() => { throw new Error('SIMULATED CRASH'); })();
  try { await drain(cfg, s, mk(true), { log: () => {}, hooks: { beforeFollowUp: async () => { throw new Error('SIMULATED CRASH'); } } }); } catch (e) { /* crash */ }
  global.fetch = real; const n = s.recover(); let again2 = 0; global.fetch = async () => { again2++; return { text: async () => '{}' }; }; await drain(cfg, s, mk(true), { log: () => {} }); global.fetch = real;
  out('§D7_CRASH', n === 1 && s.get('k').state === 'PARKED' && again2 === 0, `recovered=${n} state=${s.get('k').state} resend_calls=${again2}`);
  // auth
  t = await run(true, () => 'auth', {}, ['a1', 'a2']);
  out('§D7_AUTH', t.r.stopped === 'AUTH' && t.s.get('a1').state === 'QUEUED' && JSON.parse(t.s.get('a1').refs).completePending && t.calls.c2 === 1 && t.s.get('a2').state === 'QUEUED', `stopped=${t.r.stopped} a1=${t.s.get('a1').state} call2=${t.calls.c2} a2=${t.s.get('a2').state}`);
  const v = !judged ? 'INCONCLUSIVE' : fails ? 'FAIL' : 'PASS';
  console.log(`§D7_VERDICT ${v} judged=${judged} fails=${fails}`); process.exit(fails || !judged ? 1 : 0);
})().catch(e => { console.log('§D7_VERDICT FAIL exception ' + e.stack); process.exit(2); });
