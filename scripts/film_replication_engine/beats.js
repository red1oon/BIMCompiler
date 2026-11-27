// ⚠ DO NOT REMOVE — Scope: the BEAT LIST of the film "No server in the sale path" (prompts/TEAMWORK_FRAMEWORK.md §16.19a v2), shared by the recorder and the narration builder.
// A beat = a card or a slice of the trace (selected by trace time, never by hand-picked index), a strip title, and the on-screen notes (every note is built from facts.json values, each tagged with its source).
// Decision recorded in §16.21: storyboard beats 7 and 8 reveal their result at HQ's 18:05 visit; the trace is chronological, so they are played as 7 (10:30, local), 8 (11:00, local) and a short
// settlement beat "8b" (18:00-18:05: the collision flag, then the overspend flag).
'use strict';
const { TD } = require('./facts.js');
const lo = null;
const POS = [
  { id: 'title', card: 'title' },
  { id: 'recap', card: 'recap' },
  { id: 'cast', title: '1 · The cast and the whole configuration. Every device starts OFFLINE.', src: 'flows.json · trace_film_pos.json', range: 'none' },
  { id: 'setup', title: '2 · Setup: HQ\'s one window, then Branch A\'s 09:00 visit', src: 'trace_film_pos.json', hi: TD(1, 9, 0) },
  { id: 'selling', title: '3 · A day of selling, all local: the shelf and HQ stay silent', src: 'trace_film_pos.json', hi: TD(1, 17, 20) },
  { id: 'outage', title: '4 · The link goes down at 18:00 · HQ\'s first activity of the day', src: 'trace_film_pos.json · treat.log W-TREAT-OFFLINE', hi: TD(1, 18, 50) },
  { id: 'day2', title: '5 · Day 2, 09:00: A\'s count meets HQ\'s · B sees nothing of A', src: 'trace_film_pos.json · treat.log W-TREAT-STOCKLOOP, W-TREAT-BLIND', hi: TD(2, 9, 0) },
  { id: 'lost', title: '6 · Failure 1: Branch A is lost, then folds back from the shelf', src: 'trace_film_pos.json · treat.log FILMDAY-POS-stock', hi: TD(2, 10, 20) },
  { id: 'reuse', title: '7 · A ticket number is reused (10:30)', src: 'trace_film_pos.json', hi: TD(2, 10, 30) },
  { id: 'rolled', title: '8 · A phone restored to an older copy redeems again at Branch B (11:00)', src: 'trace_film_pos.json · treat.log W-TREAT-CODE', hi: TD(2, 11, 0) },
  { id: 'settle', title: '8b · Settlement, 18:00–18:05: HQ\'s visit finds both', src: 'trace_film_pos.json', hi: TD(2, 18, 5) },
  { id: 'hqlost', title: '9 · Failure 2: the HQ device is lost (19:00) and rebuilt from the shelf', src: 'trace_film_pos.json · treat.log FILMDAY-POS-rebuild', hi: TD(2, 19, 0) },
  { id: 'shelflost', title: '10 · Failure 3: the shelf is lost (19:30); the mailbox device carries the rebuild', src: 'trace_film_pos.json · treat.log W-TREAT-PIPEFAIL', hi: Infinity },
  { id: 'numbers', title: '11 · Working day 1, from the panel (sample run)', src: 'treat.log §TREAT_PANEL pos day 1', range: 'end', focusDay: 1 }
];
const MF = [
  { id: 'part2', card: 'part2' },
  { id: 'mfcast', title: 'Part 2 · Micro Finance: two borrower phones, the shop desk, one public price', src: 'flows.json · trace_film_mf.json', hi: TD(1, 8, 30) },
  { id: 'mfprice', title: 'The price is fetched once; the fund value is worked out on the phone', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: TD(1, 9, 0) },
  { id: 'mfskip', title: 'The phone opens again at 14:00: the fetch is skipped', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: TD(1, 14, 0) },
  { id: 'mfpay', title: 'A payment slip, sent twice, stays one payment', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: TD(1, 15, 3) },
  { id: 'mfowing', title: 'The shop visits at 16:00: owing is derived, a confirmation is sent', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: TD(1, 16, 0) },
  { id: 'mfconfirm', title: 'The confirmation reaches that borrower only', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: Infinity },
  { id: 'close', card: 'close' }
];

// [from,to) index ranges from the trace time bounds; cards and 'none' beats take an empty range at the current cursor.
function ranges(trace, beats) {
  let cur = 0; const out = [];
  beats.forEach(b => {
    let from = cur, to = cur;
    if (b.range === 'none' || b.card || b.range === 'end') { /* empty */ if (b.range === 'end') { from = to = trace.length; } }
    else { let j = from; while (j < trace.length && trace[j].t <= b.hi) j++; to = j; }
    out.push(Object.assign({}, b, { from, to })); cur = to;
  });
  if (cur !== trace.length) throw new Error('beats do not cover the trace: ' + cur + ' of ' + trace.length);
  return out;
}

// ---- on-screen notes (all values from facts) ----
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function buildNotes(R, part, beats) {              // beats = ranges() output; returns [{beat, after|atFrac, card, html, cls, src}]
  const F = R.F, tr = part === 1 ? R.pos : R.mf, notes = [];
  const B = id => beats.find(b => b.id === id);
  const find = (id, pred, nth) => { const b = B(id); let k = 0; for (let i = b.from; i < b.to; i++) if (pred(tr[i], i)) { if (k++ === (nth || 0)) return i; } throw new Error('note anchor not found in beat ' + id + ' (nth ' + (nth || 0) + ')'); };
  const add = (beat, after, card, html, cls, src) => notes.push({ beat, after, card, html, cls: cls || '', src });
  const atF = (beat, f, card, html, cls, src) => notes.push({ beat, atFrac: f, card, html, cls: cls || '', src });
  if (part === 1) {
    add('setup', find('setup', e => e.kind === 'send'), 'HUB', `Window 1: the price list and an opening stock of <b>${F.openStock}</b> for A go on the shelf (sample).`, '', 'trace · witness source');
    add('setup', find('setup', e => e.actor === 'A' && e.kind === 'recv'), 'A', `A takes both from the shelf, then is OFFLINE again.`, '', 'trace');
    let n = 0;
    ['sale1', 'sale2', 'sale3'].forEach((k, q) => add('selling', find('selling', e => e.kind === 'local-sale', q), 'A', `Ticket ${q + 1}: <b>${F[k]}</b> units sold (sample). Nothing crosses the shelf.`, '', 'trace'));
    add('selling', find('selling', e => e.kind === 'apply-code', 0), 'PH1', `Scan earn code A-1: credit ${F.credit1 - F.earnDelta} → <b>${F.credit1}</b>. On the phone; no shelf.`, '', 'trace');
    add('selling', find('selling', e => e.kind === 'apply-code', 1), 'PH1', `Scan redeem code A-2: credit ${F.credit1} → <b>${F.credit2}</b>.`, '', 'trace');
    add('selling', find('selling', e => e.kind === 'noop-code'), 'PH1', `The second scan of A-2 does nothing.`, '', 'trace');
    add('outage', find('outage', e => e.kind === 'visit-failed'), 'A', `Link down. The visit fails; <b>${F.queuedOutage}</b> items wait on the device. Nothing is lost.`, 'bad', 'trace · treat.log W-TREAT-OFFLINE');
    add('outage', find('outage', e => e.actor === 'A' && e.kind === 'put', F.deliveredSales + F.deliveredCodes - 1), 'A', `18:30, link back: <b>${F.deliveredSales}</b> sale lines and <b>${F.deliveredCodes}</b> codes delivered.`, 'ok', 'trace');
    add('outage', find('outage', e => e.actor === 'HUB' && e.kind === 'accept', F.hubAcceptsSales - 1), 'HUB', `Accepts <b>${F.hubAcceptsSales}</b> sale lines. Derived stock ${F.openStock} − ${F.salesTotal} = <b>${F.hubStockAfterSales}</b>.`, '', 'trace · derived');
    add('outage', find('outage', e => e.actor === 'HUB' && e.kind === 'send'), 'HUB', `${F.hubStockAfterSales} is below ${F.minLevel}: the rule runs Generate Replenishment (stand-in) → movement of <b>${F.replenQty}</b> for A.`, '', 'treat.log W-TREAT-STOCKLOOP');
    add('outage', find('outage', e => e.actor === 'PH1' && e.kind === 'put', F.phoneReports - 1), 'PH1', `Reports the <b>${F.phoneReports}</b> codes it applied.`, '', 'trace');
    add('day2', find('day2', e => e.actor === 'A' && e.kind === 'recv'), 'A', `Own count <b>${F.stockMeet}</b> = HQ's <b>${F.stockMeet}</b>.`, 'ok', 'treat.log FILMDAY-POS-stock');
    atF('day2', 0.55, 'B', `B's inbox: <b>${F.bInbox}</b>. B reads A's shelf prefix: REFUSED (out-of-scope).`, 'bad', 'treat.log W-TREAT-STOCKLOOP, W-TREAT-BLIND');
    add('lost', find('lost', e => e.kind === 'fail'), 'A', `DEVICE LOST. Not yet sent: <b>${F.unsent}</b>. It is gone with the device.`, 'bad', 'trace');
    add('lost', find('lost', e => e.kind === 'restore'), 'A', `Restored: ${F.restoreOwn} own objects, ${F.restoreDown} addressed to A. Count ${F.stockBefore} → <b>${F.stockAfter}</b> = HQ's <b>${F.stockHubDay2}</b>. Next code <b>${F.nextCode}</b>.`, 'ok', 'trace · treat.log FILMDAY-POS-stock, W-TREAT-DEVICEFAIL');
    add('reuse', find('reuse', e => e.kind === 'local-sale'), 'A', `Same date, same ticket number, but <b>${F.reuseQty}</b> units: different content.`, '', 'trace');
    atF('rolled', 0.12, 'PH1', `Restored from an older copy: the phone shows credit <b>${-F.rolledRedeem}</b> again.`, 'bad', 'trace apply-code B-1 (balance − delta)');
    add('rolled', find('rolled', e => e.kind === 'redeem'), 'B', `B's cashier issues a redeem code of <b>${F.rolledRedeem}</b>.`, '', 'trace');
    add('settle', find('settle', e => e.kind === 'COLLISION'), 'HUB', `COLLISION on ${F.reuseKey}: same key, different content. The original is kept.`, 'bad', 'trace · treat.log FILMDAY-POS-code');
    add('settle', find('settle', e => e.kind === 'overspend'), 'HUB', `OVERSPEND on ${F.overspendAccount}: balance <b>${F.overspendBalance}</b>. Caught at settlement: blacklist candidate (FL-7).`, 'bad', 'trace · treat.log W-TREAT-CODE');
    add('hqlost', find('hqlost', e => e.kind === 'fail'), 'HUB', `ADMIN DEVICE LOST. All derived state is wiped.`, 'bad', 'trace');
    add('hqlost', find('hqlost', e => e.kind === 'rebuild'), 'HUB', `Rebuilt from the shelf: <b>${F.rebuildRecords}</b> records, identical. Shelf objects ${F.shelfBefore} → <b>${F.shelfAfter}</b>: no duplicates.`, 'ok', 'trace · treat.log FILMDAY-POS-rebuild');
    add('shelflost', find('shelflost', e => e.actor === 'PIPE' && e.kind === 'fail'), 'SHELF', `The primary shelf is gone. The mailbox device holds a blind copy.`, 'bad', 'trace');
    add('shelflost', find('shelflost', e => e.kind === 'rebuild'), 'HUB', `Rebuilt from the mailbox device: <b>${F.rebuildRecords}</b> records, identical.`, 'ok', 'trace · treat.log FILMDAY-POS-rebuild');
    atF('shelflost', 0.8, 'MIRROR', `Control, no mailbox: <b>${F.controlRecovered}</b> of ${F.controlOf} records recoverable.`, 'bad', 'treat.log W-TREAT-PIPEFAIL');
  } else {
    add('mfcast', find('mfcast', e => e.kind === 'publish'), 'HUB', `Publishes today's gold price on the shelf: public, no address.`, '', 'trace');
    add('mfprice', find('mfprice', e => e.kind === 'pull' && e.flow === 'S2 gold-price'), 'BOR1', `One fetch: <b>${fmt(F.price)}</b> per gram.`, '', 'trace');
    add('mfprice', find('mfprice', e => e.kind === 'local-fund'), 'BOR1', `Fund value ${F.grams} g × ${fmt(F.price)} = <b>${fmt(F.fundValue)}</b>, worked out on the phone (sample).`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfskip', find('mfskip', e => e.kind === 'skip' && e.flow === 'S2 gold-price'), 'BOR1', `Skipped: today's price is already held.`, '', 'trace');
    add('mfskip', find('mfskip', e => e.kind === 'local-fund'), 'BOR1', `Fund value <b>${fmt(F.fundValue)}</b> again, computed locally.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'local-sale', 0), 'BOR1', `Payment slip SLIP-1 saved on the phone.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'put', 0), 'BOR1', `Sent at the 15:01 visit.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'local-sale', 1), 'BOR1', `The same slip again.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'put', 1), 'SHELF', `Same name, so <b>${F.mfSlipNames}</b> object: <b>${F.mfPayRecs}</b> payment.`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfowing', find('mfowing', e => e.kind === 'accept'), 'HUB', `Payment ${fmt(F.payAmt)}: owing ${fmt(F.openOwing)} − ${fmt(F.payAmt)} = <b>${fmt(F.mfOwing)}</b> (sample).`, 'ok', 'witness source · treat.log FILMDAY-MF');
    add('mfowing', find('mfowing', e => e.kind === 'send'), 'HUB', `Confirmation addressed to BOR1 only.`, '', 'trace');
    add('mfconfirm', find('mfconfirm', e => e.actor === 'BOR1' && e.kind === 'recv'), 'BOR1', `Confirmation received: owing <b>${fmt(F.mfOwing)}</b>.`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfconfirm', find('mfconfirm', e => e.actor === 'BOR2' && e.kind === 'offline'), 'BOR2', `Fetched the price. Confirmations for it: <b>${F.mfConf2}</b>.`, '', 'treat.log FILMDAY-MF');
  }
  return notes;
}
module.exports = { POS, MF, ranges, buildNotes, fmt };
