// ⚠ DO NOT REMOVE — Scope: the BEAT LISTS of Film 2 "Keeping the bloat off" (prompts/TEAMWORK_FRAMEWORK.md §16.23 v2, §16.24). Parts: 0 = cards (opener, Part 1, Part 2), 1 = the POS sample day (Film 1's engine trace,
// beats merged), 2 = the Micro Finance sample day, 3 = limits and sources. Trace beats are selected by trace time, never by hand-picked index. `read` = the least seconds a card is held so its text can be read.
'use strict';
const { TD } = require('../facts.js'), { ranges, fmt } = require('../beats.js');
const CARDS0 = [['title', 6], ['wall', 8], ['c1', 12], ['c2', 11], ['c3', 13], ['c4', 12], ['c5', 12], ['c6', 14], ['d_tables', 10], ['d_source', 12], ['d_edges', 11], ['d_orderline', 12], ['d_computed', 11], ['d_honest', 11],
  ['r_strategy', 11], ['r_row', 11], ['r_zero', 12], ['r_dry', 12], ['r_bloat', 11], ['r_ledger', 13]].map(([id, read]) => ({ id, card: id, read }));
const POS = [
  { id: 'cast', title: '1 · The cast and the whole configuration. Every device starts OFFLINE.', src: 'flows.json · trace_film_pos.json', range: 'none' },
  { id: 'setup', title: '2 · Setup: HQ\'s one window, then Branch A\'s 09:00 visit', src: 'trace_film_pos.json', hi: TD(1, 9, 0) },
  { id: 'selling', title: '3 · A day of selling, all local: the shelf and HQ stay silent', src: 'trace_film_pos.json', hi: TD(1, 17, 20) },
  { id: 'outage', title: '4 · The link goes down at 18:00 · HQ\'s first activity of the day', src: 'trace_film_pos.json · treat.log W-TREAT-OFFLINE', hi: TD(1, 18, 50) },
  { id: 'lostA', title: '5 · Day 2: A\'s count meets HQ\'s, then Branch A is lost and folds back from the shelf', src: 'trace_film_pos.json · treat.log FILMDAY-POS-stock, W-TREAT-BLIND', hi: TD(2, 10, 20) },
  { id: 'concept', card: 'concept', read: 16 },
  { id: 'rolled', title: '6 · A ticket number is reused (10:30); an older phone redeems again at B (11:00)', src: 'trace_film_pos.json · treat.log W-TREAT-CODE', hi: TD(2, 11, 0) },
  { id: 'settle', title: '7 · Settlement, 18:00–18:05: HQ\'s visit finds both', src: 'trace_film_pos.json', hi: TD(2, 18, 5) },
  { id: 'hqlost', title: '8 · The HQ device is lost (19:00) and rebuilt; then the shelf is lost and the mailbox device carries it', src: 'trace_film_pos.json · treat.log FILMDAY-POS-rebuild', hi: Infinity },
  { id: 'numbers', title: '9 · Working day 1, from the panel (sample run)', src: 'treat.log §TREAT_PANEL pos day 1', range: 'end', focusDay: 1 }
];
const MF = [
  { id: 'mfprice', title: 'Micro Finance · the public price is fetched once; the fund value is worked out on the phone', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: TD(1, 14, 0) },
  { id: 'mfpay', title: 'A payment slip, sent twice, stays one payment; the shop derives what is owing', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: TD(1, 16, 0) },
  { id: 'mfconfirm', title: 'The confirmation reaches that borrower only', src: 'trace_film_mf.json · treat.log FILMDAY-MF', hi: Infinity }
];
const CARDS3 = [['limits', 18], ['src1', 9], ['src2', 10]].map(([id, read]) => ({ id, card: id, read }));
function buildNotes(R, part, beats) {
  const F = R.F, tr = part === 1 ? R.pos : R.mf, notes = [];
  const B = id => beats.find(b => b.id === id);
  const find = (id, pred, nth) => { const b = B(id); let k = 0; for (let i = b.from; i < b.to; i++) if (pred(tr[i], i)) { if (k++ === (nth || 0)) return i; } throw new Error('note anchor not found in beat ' + id + ' (nth ' + (nth || 0) + ')'); };
  const add = (beat, after, card, html, cls, src) => notes.push({ beat, after, card, html, cls: cls || '', src });
  const atF = (beat, f, card, html, cls, src) => notes.push({ beat, atFrac: f, card, html, cls: cls || '', src });
  if (part === 1) {
    add('setup', find('setup', e => e.kind === 'send'), 'HUB', `Window 1: the price list and an opening stock of <b>${F.openStock}</b> for A go on the shelf (sample).`, '', 'trace · witness source');
    add('setup', find('setup', e => e.actor === 'A' && e.kind === 'recv'), 'A', `A takes both from the shelf, then is OFFLINE again.`, '', 'trace');
    ['sale1', 'sale2', 'sale3'].forEach((k, q) => add('selling', find('selling', e => e.kind === 'local-sale', q), 'A', `Ticket ${q + 1}: <b>${F[k]}</b> units sold (sample). Nothing crosses the shelf.`, '', 'trace'));
    add('selling', find('selling', e => e.kind === 'apply-code', 0), 'PH1', `Scan earn code A-1: credit ${F.credit1 - F.earnDelta} → <b>${F.credit1}</b>. On the phone; no shelf.`, '', 'trace');
    add('selling', find('selling', e => e.kind === 'apply-code', 1), 'PH1', `Scan redeem code A-2: credit ${F.credit1} → <b>${F.credit2}</b>.`, '', 'trace');
    add('selling', find('selling', e => e.kind === 'noop-code'), 'PH1', `The second scan of A-2 does nothing.`, '', 'trace');
    add('outage', find('outage', e => e.kind === 'visit-failed'), 'A', `Link down. The visit fails; <b>${F.queuedOutage}</b> items wait on the device. Nothing is lost.`, 'bad', 'trace · treat.log W-TREAT-OFFLINE');
    add('outage', find('outage', e => e.actor === 'A' && e.kind === 'put', F.deliveredSales + F.deliveredCodes - 1), 'A', `18:30, link back: <b>${F.deliveredSales}</b> sale lines and <b>${F.deliveredCodes}</b> codes delivered.`, 'ok', 'trace');
    add('outage', find('outage', e => e.actor === 'HUB' && e.kind === 'accept', F.hubAcceptsSales - 1), 'HUB', `Accepts <b>${F.hubAcceptsSales}</b> sale lines. Derived stock ${F.openStock} − ${F.salesTotal} = <b>${F.hubStockAfterSales}</b>.`, '', 'trace · derived');
    add('outage', find('outage', e => e.actor === 'HUB' && e.kind === 'send'), 'HUB', `${F.hubStockAfterSales} is below ${F.minLevel}: the rule runs Generate Replenishment (stand-in) → movement of <b>${F.replenQty}</b> for A.`, '', 'treat.log W-TREAT-STOCKLOOP');
    add('outage', find('outage', e => e.actor === 'PH1' && e.kind === 'put', F.phoneReports - 1), 'PH1', `Reports the <b>${F.phoneReports}</b> codes it applied.`, '', 'trace');
    add('lostA', find('lostA', e => e.actor === 'A' && e.kind === 'recv'), 'A', `Own count <b>${F.stockMeet}</b> = HQ's <b>${F.stockMeet}</b>.`, 'ok', 'treat.log FILMDAY-POS-stock');
    atF('lostA', 0.3, 'B', `B's inbox: <b>${F.bInbox}</b>. B reads A's shelf prefix: REFUSED (out-of-scope).`, 'bad', 'treat.log W-TREAT-STOCKLOOP, W-TREAT-BLIND');
    add('lostA', find('lostA', e => e.kind === 'fail'), 'A', `DEVICE LOST. Not yet sent: <b>${F.unsent}</b>. It is gone with the device.`, 'bad', 'trace');
    add('lostA', find('lostA', e => e.kind === 'restore'), 'A', `Restored: ${F.restoreOwn} own objects, ${F.restoreDown} addressed to A. Count ${F.stockBefore} → <b>${F.stockAfter}</b> = HQ's <b>${F.stockHubDay2}</b>. Next code <b>${F.nextCode}</b>.`, 'ok', 'trace · treat.log FILMDAY-POS-stock, W-TREAT-DEVICEFAIL');
    add('rolled', find('rolled', e => e.kind === 'local-sale'), 'A', `Same date, same ticket number, but <b>${F.reuseQty}</b> units: different content.`, '', 'trace');
    atF('rolled', 0.55, 'PH1', `Restored from an older copy: the phone shows credit <b>${-F.rolledRedeem}</b> again.`, 'bad', 'trace apply-code B-1 (balance − delta)');
    add('rolled', find('rolled', e => e.kind === 'redeem'), 'B', `B's cashier issues a redeem code of <b>${F.rolledRedeem}</b>.`, '', 'trace');
    add('settle', find('settle', e => e.kind === 'COLLISION'), 'HUB', `COLLISION on ${F.reuseKey}: same key, different content. The original is kept.`, 'bad', 'trace · treat.log FILMDAY-POS-code');
    add('settle', find('settle', e => e.kind === 'overspend'), 'HUB', `OVERSPEND on ${F.overspendAccount}: balance <b>${F.overspendBalance}</b>. Caught at settlement: blacklist candidate (FL-7).`, 'bad', 'trace · treat.log W-TREAT-CODE');
    add('hqlost', find('hqlost', e => e.kind === 'fail'), 'HUB', `ADMIN DEVICE LOST. All derived state is wiped.`, 'bad', 'trace');
    add('hqlost', find('hqlost', e => e.kind === 'rebuild'), 'HUB', `Rebuilt from the shelf: <b>${F.rebuildRecords}</b> records, identical. Shelf objects ${F.shelfBefore} → <b>${F.shelfAfter}</b>: no duplicates.`, 'ok', 'trace · treat.log FILMDAY-POS-rebuild');
    add('hqlost', find('hqlost', e => e.actor === 'PIPE' && e.kind === 'fail'), 'SHELF', `The primary shelf is gone. The mailbox device holds a blind copy.`, 'bad', 'trace');
    add('hqlost', find('hqlost', e => e.kind === 'rebuild', 1), 'HUB', `Rebuilt from the mailbox device: <b>${F.rebuildRecords}</b> records, identical.`, 'ok', 'trace · treat.log FILMDAY-POS-rebuild');
    atF('hqlost', 0.88, 'MIRROR', `Control, no mailbox: <b>${F.controlRecovered}</b> of ${F.controlOf} records recoverable.`, 'bad', 'treat.log W-TREAT-PIPEFAIL');
  } else {
    add('mfprice', find('mfprice', e => e.kind === 'publish'), 'HUB', `Publishes today's gold price on the shelf: public, no address.`, '', 'trace');
    add('mfprice', find('mfprice', e => e.kind === 'pull' && e.flow === 'S2 gold-price'), 'BOR1', `One fetch: <b>${fmt(F.price)}</b> per gram.`, '', 'trace');
    add('mfprice', find('mfprice', e => e.kind === 'local-fund', 0), 'BOR1', `Fund value ${F.grams} g × ${fmt(F.price)} = <b>${fmt(F.fundValue)}</b>, worked out on the phone (sample).`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfprice', find('mfprice', e => e.kind === 'skip' && e.flow === 'S2 gold-price'), 'BOR1', `Skipped: today's price is already held.`, '', 'trace');
    add('mfprice', find('mfprice', e => e.kind === 'local-fund', 1), 'BOR1', `Fund value <b>${fmt(F.fundValue)}</b> again, computed locally.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'local-sale', 0), 'BOR1', `Payment slip SLIP-1 saved on the phone.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'put', 0), 'BOR1', `Sent at the 15:01 visit.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'local-sale', 1), 'BOR1', `The same slip again.`, '', 'trace');
    add('mfpay', find('mfpay', e => e.kind === 'put', 1), 'SHELF', `Same name, so <b>${F.mfSlipNames}</b> object: <b>${F.mfPayRecs}</b> payment.`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfpay', find('mfpay', e => e.actor === 'HUB' && e.kind === 'accept'), 'HUB', `Payment ${fmt(F.payAmt)}: owing ${fmt(F.openOwing)} − ${fmt(F.payAmt)} = <b>${fmt(F.mfOwing)}</b> (sample).`, 'ok', 'witness source · treat.log FILMDAY-MF');
    add('mfpay', find('mfpay', e => e.actor === 'HUB' && e.kind === 'send'), 'HUB', `Confirmation addressed to BOR1 only.`, '', 'trace');
    add('mfconfirm', find('mfconfirm', e => e.actor === 'BOR1' && e.kind === 'recv'), 'BOR1', `Confirmation received: owing <b>${fmt(F.mfOwing)}</b>.`, 'ok', 'trace · treat.log FILMDAY-MF');
    add('mfconfirm', find('mfconfirm', e => e.actor === 'BOR2' && e.kind === 'offline'), 'BOR2', `Fetched the price. Confirmations for it: <b>${F.mfConf2}</b>.`, '', 'treat.log FILMDAY-MF');
  }
  return notes;
}
module.exports = { CARDS0, POS, MF, CARDS3, ranges, buildNotes };
