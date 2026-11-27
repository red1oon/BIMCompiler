// ⚠ DO NOT REMOVE — Scope: writes trace6_DRAFT.json, a LAYOUT-ONLY sample to lay out stage6. Header.status = "DRAFT": it is NOT evidence, every event has wit="DRAFT", it contains no measured number, and film6_guard.js refuses it for recording.
// The hours come from the storyboard text of TEAMWORK_FRAMEWORK §42.1 (sales 09:10 to 11:40 offline, Visit 12:05, import 17:30, Import Payment 17:45, next morning 08:00); everything else is a placeholder positioned to exercise the stage.
'use strict';
const fs = require('fs'); let seq = 0;
const hm = (h, m, d) => (d ? 1440 : 0) + h * 60 + m;
const E = (t, beat, actor, kind, o) => Object.assign({ seq: ++seq, t_min: t, beat, actor, kind, wit: 'DRAFT' }, o || {});
const ev = [
  // Ch 1: the till sells, online or not
  E(hm(9, 0), 'ch1', 'till', 'offline'),
  E(hm(9, 10), 'ch1', 'till', 'local', { text: 'ticket A written', queue: 1 }),
  E(hm(9, 55), 'ch1', 'till', 'local', { text: 'ticket B written', queue: 1 }),
  E(hm(11, 40), 'ch1', 'till', 'local', { text: 'ticket C written', queue: 1 }),
  E(hm(12, 5), 'ch1', 'till', 'online'),
  E(hm(12, 5), 'ch1', 'till', 'send', { to: 'relay', label: 'I_Order', key: 'ticket A' }),
  E(hm(12, 5), 'ch1', 'till', 'send', { to: 'relay', label: 'I_Order', key: 'ticket B' }),
  E(hm(12, 6), 'ch1', 'till', 'send', { to: 'relay', label: 'I_Order', key: 'ticket C' }),
  // Ch 2: the borrower pays from a phone
  E(hm(10, 20), 'ch2', 'phone1', 'verify', { to: 'verifier', label: 'slip 1' }),
  E(hm(10, 20), 'ch2', 'verifier', 'ack', { to: 'phone1', status: 'approved', label: 'slip 1' }),
  E(hm(10, 21), 'ch2', 'phone1', 'local', { text: 'payment received', queue: 1, slip: 'received' }),
  E(hm(14, 0), 'ch2', 'phone2', 'offline'),
  E(hm(14, 5), 'ch2', 'phone2', 'local', { text: 'slip 2 saved, no ack yet', queue: 1, todo: 'set' }),
  E(hm(14, 5), 'ch2', 'phone2', 'note', { cls: 'bad', text: 'The slip service has not acknowledged this slip. When online, the check runs again by itself.' }),
  E(hm(16, 40), 'ch2', 'phone2', 'online'),
  E(hm(16, 40), 'ch2', 'phone2', 'verify', { to: 'verifier', label: 'slip 2' }),
  E(hm(16, 41), 'ch2', 'verifier', 'ack', { to: 'phone2', status: 'approved', label: 'slip 2' }),
  E(hm(16, 41), 'ch2', 'phone2', 'local', { text: 'to-do cleared, row updated', todo: 'clear', slip: 'received' }),
  E(hm(16, 55), 'ch2', 'phone1', 'send', { to: 'relay', label: 'I_Payment', key: 'slip 1' }),
  E(hm(16, 56), 'ch2', 'phone2', 'send', { to: 'relay', label: 'I_Payment', key: 'slip 2' }),
  // Ch 3: head office works when head office works
  E(hm(17, 30), 'ch3', 'clerk', 'deliver', { from: 'relay', label: 'I_Order', key: 'tickets' }),
  E(hm(17, 30), 'ch3', 'clerk', 'run', { process: 'Import Orders', text: 'order per ticket' }),
  E(hm(17, 32), 'ch3', 'clerk', 'note', { cls: 'bad', text: 'A ticket whose tenders do not add up stays whole, with its reason in I_ErrorMsg.' }),
  E(hm(17, 45), 'ch3', 'clerk', 'deliver', { from: 'relay', label: 'I_Payment', key: 'slips' }),
  E(hm(17, 45), 'ch3', 'clerk', 'run', { process: 'Import Payment', text: 'receipts allocated' }),
  E(hm(8, 0, 1), 'ch3', 'stock', 'run', { process: 'Replenish Report', text: 'quantities to order' }),
  E(hm(8, 5, 1), 'ch3', 'stock', 'run', { process: 'Material Movement', text: 'one movement' }),
  E(hm(8, 6, 1), 'ch3', 'stock', 'send', { to: 'relay', label: 'movement', key: 'branch' }),
  // Ch 4: the day comes back to every desk
  E(hm(8, 15, 1), 'ch4', 'till', 'deliver', { from: 'relay', label: 'movement', key: 'branch' }),
  E(hm(8, 15, 1), 'ch4', 'phone1', 'deliver', { from: 'relay', label: 'balance', key: 'loan 1' }),
  E(hm(8, 15, 1), 'ch4', 'phone2', 'refuse', { text: 'not addressed to this phone: refused locally', cls: 'n' }),
  E(hm(8, 20, 1), 'ch4', 'clerk', 'refuse', { text: 'Current record was changed by another user, please ReQuery', cls: 'bad' })
];
const trace = {
  header: { format: 'film6-trace/1', status: 'DRAFT', draft_notice: 'LAYOUT-ONLY SAMPLE. Not evidence, not measured, never to be published. The recorder must refuse it (film6_guard.js).', sample_day_label: 'sample day',
    axis: { from_min: 480, to_min: 1980 }, initial_online: { till: true, phone1: true, phone2: true, verifier: true, clerk: true, stock: true },
    beats: [{ id: 'ch1', title: 'Chapter 1 · The till sells, online or not', src: 'DRAFT' }, { id: 'ch2', title: 'Chapter 2 · The borrower pays from a phone', src: 'DRAFT' }, { id: 'ch3', title: 'Chapter 3 · Head office works when head office works', src: 'DRAFT' }, { id: 'ch4', title: 'Chapter 4 · The day comes back to every desk', src: 'DRAFT' }],
    sources: [{ witness: 'DRAFT (none)', log: 'none' }], schedule: 'DRAFT: hours from TEAMWORK_FRAMEWORK §42.1' },
  actors: [['till', 'Till', 'Unicenta-style station'], ['phone1', 'Borrower phone 1', 'its own loan only'], ['phone2', 'Borrower phone 2', 'its own loan only'], ['verifier', 'Slip-verify service', 'SlipOK is the sample'], ['clerk', 'Head-office clerk', 'role 102'], ['stock', 'Stock role', 'role 103'], ['relay', 'The relay', 'a dumb post box']].map(a => ({ id: a[0], name: a[1], sub: a[2] })),
  events: ev };
fs.writeFileSync(__dirname + '/trace6_DRAFT.json', JSON.stringify(trace, null, 1)); console.log('trace6_DRAFT.json: ' + ev.length + ' events, status=DRAFT');
