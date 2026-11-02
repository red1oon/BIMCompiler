// ⚠ DO NOT REMOVE — Scope: build facts.json for the film "No server in the sale path" (spec prompts/TEAMWORK_FRAMEWORK.md §16.19a, §16.21).
// EVERY number the film speaks or shows comes from here, and every fact names its source: a trace event (build/scriptor/trace_film_*.json), a line of
// build/scriptor/treat.log, a line of build/scriptor/s1.log, or a constant read from the engine's own witness source (scripts/witness_scriptor_treat.js, read-only).
// A fact that cannot be read from its source THROWS (house rule: no invented values). Cross-checks between sources are also asserted here.
// Read the log after every run: this module prints §FACT lines when run directly:  node facts.js
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const Core = require('./core.js');
const ROOT = path.resolve(__dirname, '..', '..');
const SC = path.join(ROOT, 'build', 'scriptor');
const rd = f => fs.readFileSync(f, 'utf8');
const TD = (d, h, m) => Date.UTC(2026, 9, 24 + d, h, m);

function buildFacts() {
  const pos = JSON.parse(rd(path.join(SC, 'trace_film_pos.json'))), mf = JSON.parse(rd(path.join(SC, 'trace_film_mf.json')));
  const flows = JSON.parse(rd(path.join(SC, 'flows.json')));
  const TL = rd(path.join(SC, 'treat.log')), S1 = rd(path.join(SC, 's1.log')), WS = rd(path.join(ROOT, 'scripts', 'witness_scriptor_treat.js'));
  const F = {}, SRC = {};
  const put = (k, v, src) => { if (v === undefined || v === null || (typeof v === 'number' && isNaN(v))) throw new Error('fact ' + k + ' unreadable from ' + src); F[k] = v; SRC[k] = src; return v; };
  const grab = (txt, re, what) => { const m = re.exec(txt); if (!m) throw new Error('not found in source: ' + what + ' ' + re); return m; };
  const evs = (tr, p) => tr.filter(p);
  const eq = (a, b, what) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('cross-check failed: ' + what + ' ' + JSON.stringify(a) + ' != ' + JSON.stringify(b)); };

  // ---- verdict ----
  const verdict = grab(TL, /^(§TREAT_VERDICT .*)$/m, '§TREAT_VERDICT')[1]; if (!/^§TREAT_VERDICT PASS /.test(verdict)) throw new Error('treat.log verdict is not PASS: ' + verdict);
  put('verdictLine', verdict.replace(/ \(sample data;.*$/, ''), 'treat.log §TREAT_VERDICT'); put('verdictFull', verdict, 'treat.log §TREAT_VERDICT');
  put('judged', +grab(verdict, /judged=(\d+)/, 'judged')[1], 'treat.log §TREAT_VERDICT');
  // ---- engine size and rows ----
  const sz = grab(TL, /§TREAT_SIZE .*treat\.js=(\d+) sim\.js=(\d+)/, '§TREAT_SIZE');
  put('engineLines', +sz[1] + +sz[2], 'treat.log §TREAT_SIZE treat.js+sim.js');
  // v2 (§16.25): §TREAT_SIZE counts ONLY treat.js + sim.js (the core). The treatments moved to build/scriptor/treatments/*.js, so the whole engine is counted here from the files, by the recorded command.
  const CMD = "grep -vE '^[[:space:]]*($|//|/\\*|\\*)' <file> | wc -l      (non-blank, non-comment lines; run from build/scriptor/)";
  const cnt = f => rd(path.join(SC, f)).split('\n').filter(l => !/^\s*($|\/\/|\/\*|\*)/.test(l)).length;
  const cnt2 = f => +execFileSync('bash', ['-c', "grep -vE '^[[:space:]]*($|//|/\\*|\\*)' " + f + ' | wc -l'], { cwd: SC, encoding: 'utf8' }).trim();
  const LC = {}; ['treat.js', 'sim.js', 'treatments/fact.js', 'treatments/instrument.js', 'treatments/seed.js', 'treatments/rule.js', 'treatments/local.js', 'scope.js', 'flow.js', 'compile.js'].forEach(f => { LC[f] = cnt(f); eq(LC[f], cnt2(f), 'node count == grep count ' + f); });
  put('linesCore', LC['treat.js'] + LC['sim.js'], 'count: treat.js ' + LC['treat.js'] + ' + sim.js ' + LC['sim.js']); eq(F.linesCore, F.engineLines, 'core count == treat.log §TREAT_SIZE (treat.js + sim.js only)');
  put('linesComponents', ['fact', 'instrument', 'seed', 'rule', 'local'].reduce((n, k) => n + LC['treatments/' + k + '.js'], 0), 'count: build/scriptor/treatments/{fact,instrument,seed,rule,local}.js');
  put('linesEngine', F.linesCore + F.linesComponents, 'count: core + components'); put('linesToolchain', LC['scope.js'] + LC['flow.js'] + LC['compile.js'], 'count: scope.js ' + LC['scope.js'] + ' + flow.js ' + LC['flow.js'] + ' + compile.js ' + LC['compile.js']);
  eq(F.linesToolchain, +grab(S1, /S1_ZERO_CODE_NUMBERS [^\n]*total=(\d+)/, 'toolchain total')[1], 'toolchain count == s1.log §S1_ZERO_CODE_NUMBERS');
  put('lineCommand', CMD, 'facts.js (the counting command, recorded)'); F.lineEach = LC; SRC.lineEach = CMD;
  const tin = grab(TL, /§TREAT_INPUT rows=(\d+) treatments=(\{[^}]*\})/, '§TREAT_INPUT');
  put('rows', +tin[1], 'treat.log §TREAT_INPUT'); put('treatments', Object.keys(JSON.parse(tin[2])).length, 'treat.log §TREAT_INPUT (keys)');
  // ---- wire width (s1.log) ----
  const wm = grab(S1, /W-FLOW-MINIMAL — F1 (\d+)\/(\d+) cols/, 'W-FLOW-MINIMAL');
  put('wireCols', +wm[1], 's1.log W-FLOW-MINIMAL'); put('tableCols', +wm[2], 's1.log W-FLOW-MINIMAL');
  // ---- sample constants read from the engine's own witness source ----
  const mm = grab(WS, /var MIN = (\d+), MAX = (\d+);/, 'MIN/MAX re-order levels');
  put('minLevel', +mm[1], 'witness_scriptor_treat.js var MIN'); put('maxLevel', +mm[2], 'witness_scriptor_treat.js var MAX');
  put('openStock', +grab(WS, /st\[stn\]\[p\] === undefined\) st\[stn\]\[p\] = (\d+);/, 'initial stock')[1], 'witness_scriptor_treat.js GenerateReplenishment (initial stock movement)');
  put('openOwing', +grab(WS, /o\[b\] === undefined\) o\[b\] = (\d+);/, 'opening owing')[1], 'witness_scriptor_treat.js ApplyPayment (sample opening balance)');
  put('payAmt', +grab(WS, /PayAmt: (\d+) \}\);\s*w\.setTime\(TD\(1, 15, 1\)\)/, 'PayAmt')[1], 'witness_scriptor_treat.js filmMF (the slip amount)');
  // ---- treat.log fact lines ----
  const st = grab(TL, /FILMDAY-POS-stock — the branch's advisory stock meets the hub's \((\d+) = (\d+)\); lost with (\d+) unsent sale, it read (\d+) before and (\d+) after fold-back.*branch (\d+) = hub (\d+)/, 'FILMDAY-POS-stock');
  put('stockMeet', +st[1], 'treat.log FILMDAY-POS-stock'); eq(+st[1], +st[2], 'branch stock = hub stock'); put('stockBefore', +st[4], 'treat.log FILMDAY-POS-stock'); put('stockAfter', +st[5], 'treat.log FILMDAY-POS-stock'); eq(+st[6], +st[7], 'day-2 branch = hub'); put('stockHubDay2', +st[7], 'treat.log FILMDAY-POS-stock');
  const sl = grab(TL, /W-TREAT-STOCKLOOP — 3 sale lines up -> hub derived stock 10 -> 1 replenishment \(qty (\d+)\) to branch A only \(B inbox (\d+)\)/, 'W-TREAT-STOCKLOOP');
  put('replenQty', +sl[1], 'treat.log W-TREAT-STOCKLOOP'); put('bInbox', +sl[2], 'treat.log W-TREAT-STOCKLOOP');
  put('blindThrew', /a deliberate read of another branch's prefix THREW/.test(TL) ? 1 : 0, 'treat.log W-TREAT-BLIND'); if (!F.blindThrew) throw new Error('W-TREAT-BLIND did not say THREW');
  put('nextCode', grab(TL, /the cashier's next code id is (\S+) \(no id reuse\)/, 'next code id')[1], 'treat.log W-TREAT-DEVICEFAIL');
  put('collisionCount', +grab(TL, /ticket-number reuse -> (\d+) collision/, 'collision count')[1], 'treat.log FILMDAY-POS-code');
  put('rebuildIdentical', /FILMDAY-POS-rebuild — the admin device rebuilt from the shelf: identical; then the primary shelf lost, mirror carried it: identical/.test(TL) ? 1 : 0, 'treat.log FILMDAY-POS-rebuild'); if (!F.rebuildIdentical) throw new Error('FILMDAY-POS-rebuild not identical');
  const pf = grab(TL, /control without a mirror: (\d+) of (\d+) records recoverable/, 'W-TREAT-PIPEFAIL control');
  put('controlRecovered', +pf[1], 'treat.log W-TREAT-PIPEFAIL'); put('controlOf', +pf[2], 'treat.log W-TREAT-PIPEFAIL');
  const mfl = grab(TL, /FILMDAY-MF — fund value (\d+) computed on the phone from one price fetch \((\d+) pull, (\d+) later skips of the gold price\); the slip sent twice = (\d+) payment; owing (\d+); confirmation to BOR1 (\d+), BOR2 (\d+)/, 'FILMDAY-MF');
  put('mfFund', +mfl[1], 'treat.log FILMDAY-MF'); put('mfPulls', +mfl[2], 'treat.log FILMDAY-MF'); put('mfSkips', +mfl[3], 'treat.log FILMDAY-MF'); put('mfPayRecs', +mfl[4], 'treat.log FILMDAY-MF');
  put('mfOwing', +mfl[5], 'treat.log FILMDAY-MF'); put('mfConf1', +mfl[6], 'treat.log FILMDAY-MF'); put('mfConf2', +mfl[7], 'treat.log FILMDAY-MF');
  const pp = grab(TL, /§TREAT_PANEL pos day 1 \(normal working day\) local=(\d+) pipe=(\d+) hubEvents=(\d+) hubVisits=(\d+) deviceVisits=(\d+)/, '§TREAT_PANEL pos');
  const pm = grab(TL, /§TREAT_PANEL mf day 1 local=(\d+) pipe=(\d+) hubEvents=(\d+) hubVisits=(\d+) deviceVisits=(\d+)/, '§TREAT_PANEL mf');
  const wo = grab(TL, /W-TREAT-OFFLINE — online windows POS (\{[^}]*\}), MF (\{[^}]*\})/, 'W-TREAT-OFFLINE');
  const ou = grab(TL, /outage: (\d+) failed visit with (\d+) facts queued, (\d+) pipe puts during it, then (\d+) sale lines accepted once \((\d+) duplicates\)/, 'outage');
  put('outageQueuedLog', +ou[2], 'treat.log W-TREAT-OFFLINE'); put('outagePutsDuring', +ou[3], 'treat.log W-TREAT-OFFLINE'); put('outageDelivered', +ou[4], 'treat.log W-TREAT-OFFLINE'); put('outageDup', +ou[5], 'treat.log W-TREAT-OFFLINE');

  // ---- trace-derived ----
  const d1 = e => e.t < TD(2, 0, 0);
  const a1 = Core.activity(pos.filter(d1)), am = Core.activity(mf);
  eq([a1.local, a1.pipe, a1.hub, a1.hubVisits, a1.visits], [+pp[1], +pp[2], +pp[3], +pp[4], +pp[5]], 'POS day-1 panel: trace recomputation == §TREAT_PANEL');
  eq([am.local, am.pipe, am.hub, am.hubVisits, am.visits], [+pm[1], +pm[2], +pm[3], +pm[4], +pm[5]], 'MF panel: trace recomputation == §TREAT_PANEL');
  put('d1Local', a1.local, 'trace_film_pos day 1 (== treat.log §TREAT_PANEL)'); put('d1Pipe', a1.pipe, 'trace_film_pos day 1 (== §TREAT_PANEL)'); put('d1HubEvents', a1.hub, 'trace_film_pos day 1 (== §TREAT_PANEL)');
  put('d1HubVisits', a1.hubVisits, 'trace_film_pos day 1 (== §TREAT_PANEL)'); put('d1DevVisits', a1.visits, 'trace_film_pos day 1 (== §TREAT_PANEL)');
  put('mfLocal', am.local, 'trace_film_mf (== §TREAT_PANEL)'); put('mfPipe', am.pipe, 'trace_film_mf (== §TREAT_PANEL)'); put('mfHubVisits', am.hubVisits, 'trace_film_mf (== §TREAT_PANEL)'); put('mfDevVisits', am.visits, 'trace_film_mf (== §TREAT_PANEL)');
  const sales = evs(pos, e => e.kind === 'local-sale' && d1(e)), stocks = evs(pos, e => e.kind === 'local-stock' && d1(e));
  eq(sales.map(e => e.qty), [3, 3, 2], 'day-1 sale quantities'); eq(stocks.map(e => e.qty), [7, 4, 2], 'day-1 stock counts');
  put('sale1', sales[0].qty, 'trace local-sale 10:15'); put('sale2', sales[1].qty, 'trace local-sale 13:40'); put('sale3', sales[2].qty, 'trace local-sale 17:20');
  put('stock1', stocks[0].qty, 'trace local-stock 10:15'); put('stock2', stocks[1].qty, 'trace local-stock 13:40'); put('stock3', stocks[2].qty, 'trace local-stock 17:20');
  eq(stocks[0].qty + sales[0].qty, F.openStock, 'opening stock (witness source) == first stock count + first sale (trace)');
  eq(F.openStock, F.stockMeet, 'opening stock == day-2 meeting count (treat.log "10 = 10")');
  put('salesTotal', sales.reduce((n, e) => n + e.qty, 0), 'trace local-sale (sum)');
  put('hubStockAfterSales', F.openStock - F.salesTotal, 'derived: opening stock - sales'); eq(F.maxLevel - F.hubStockAfterSales, F.replenQty, 'replenishment = MAX - derived stock (treat.log qty)');
  const earn = evs(pos, e => e.kind === 'earn')[0], redeems = evs(pos, e => e.kind === 'redeem');
  put('earnDelta', earn.delta, 'trace earn A-1'); put('redeemDelta', redeems[0].delta, 'trace redeem A-2');
  const ap = evs(pos, e => e.kind === 'apply-code' && e.actor === 'PH1'); put('credit1', ap[0].balance, 'trace apply-code A-1'); put('credit2', ap[1].balance, 'trace apply-code A-2');
  put('noopCount', evs(pos, e => e.kind === 'noop-code').length, 'trace noop-code');
  const vf = evs(pos, e => e.kind === 'visit-failed')[0]; eq(vf.queued, F.outageQueuedLog, 'queued at the outage: trace == treat.log');
  put('queuedOutage', vf.queued, 'trace visit-failed A 18:00');
  const put1830 = evs(pos, e => e.kind === 'put' && e.t === TD(1, 18, 30));
  put('deliveredSales', put1830.filter(e => /^F1/.test(e.flow)).length, 'trace put A 18:30 (F1)'); put('deliveredCodes', put1830.filter(e => /^I1/.test(e.flow)).length, 'trace put A 18:30 (I1)');
  eq(F.deliveredSales + F.deliveredCodes, F.queuedOutage, 'delivered at 18:30 == queued at 18:00'); eq(F.deliveredSales, F.outageDelivered, 'delivered sales: trace == treat.log');
  put('hubAcceptsSales', evs(pos, e => e.kind === 'accept' && e.actor === 'HUB' && /^F1/.test(e.flow) && e.t === TD(1, 18, 35)).length, 'trace HUB accept 18:35');
  put('phoneReports', evs(pos, e => e.kind === 'put' && e.actor === 'PH1' && e.t === TD(1, 18, 45)).length, 'trace put PH1 18:45');
  const fl = evs(pos, e => e.kind === 'fail' && e.actor === 'A')[0], rs = evs(pos, e => e.kind === 'restore')[0];
  put('unsent', fl.unsent, 'trace fail A 10:20'); put('restoreOwn', rs.own, 'trace restore A'); put('restoreDown', rs.down, 'trace restore A');
  eq(stocks.length ? pos.filter(e => e.kind === 'local-stock' && e.t === TD(2, 10, 10))[0].qty : 0, F.stockBefore, 'stock before the loss: trace 10:10 == treat.log');
  put('reuseQty', pos.filter(e => e.kind === 'local-sale' && e.t === TD(2, 10, 30))[0].qty, 'trace local-sale A 10:30'); put('reuseKey', pos.filter(e => e.kind === 'local-sale' && e.t === TD(2, 10, 30))[0].key, 'trace local-sale A 10:30');
  const col = evs(pos, e => e.kind === 'COLLISION' && e.t === TD(2, 18, 5)); eq(col.length, F.collisionCount, 'collisions at 18:05: trace == treat.log'); eq(col[0].key, F.reuseKey, 'collision key == reused ticket key');
  const ov = evs(pos, e => e.kind === 'overspend')[0]; put('overspendBalance', ov.balance, 'trace overspend HUB 18:05'); put('overspendAccount', ov.account, 'trace overspend HUB 18:05');
  put('rolledRedeem', pos.filter(e => e.kind === 'redeem' && e.actor === 'B')[0].delta, 'trace redeem B 11:00');
  const rb = evs(pos, e => e.kind === 'rebuild'); put('rebuildRecords', rb[0].records, 'trace rebuild HUB 19:00'); eq(rb[1].records, rb[0].records, 'both rebuilds: same record count');
  // records the hub held before the loss = distinct accepted (flow|key) before 19:00
  const held = new Set(); pos.filter(e => e.t <= TD(2, 18, 5)).forEach(e => { if (e.kind === 'accept') held.add(e.flow + '|' + e.key); });
  eq(held.size, F.rebuildRecords, 'records held before the loss (trace accepts) == records rebuilt'); put('recordsBefore', held.size, 'trace accepts before 19:00');
  // shelf object count before and after the rebuild (names are the shelf's own keys; a re-send of an existing name adds nothing)
  const shelf = new Set(), nameOf = e => e.kind === 'put' ? e.name : e.kind === 'send' ? 'd/' + e.to + '/' + e.flow + '/' + e.key : e.kind === 'publish' ? (e.audience === 'public' ? 'pub/' : 'seed/') + e.flow + '/latest' : null;
  let before = null, after = null; pos.forEach(e => { const n = nameOf(e); if (n && e.t <= TD(2, 19, 0) && !(e.t === TD(2, 19, 0) && e.kind === 'send')) shelf.add(n); if (e.kind === 'fail' && e.actor === 'HUB' && before === null) before = shelf.size; if (e.kind === 'rebuild' && after === null) { const n2 = new Set(shelf); pos.filter(x => x.t === TD(2, 19, 0)).forEach(x => { const nn = nameOf(x); if (nn) n2.add(nn); }); after = n2.size; } });
  put('shelfBefore', before, 'trace: distinct shelf names before HUB fail 19:00'); put('shelfAfter', after, 'trace: distinct shelf names after the rebuild'); eq(F.shelfBefore, F.shelfAfter, 'shelf objects before == after rebuild (no duplicates)');
  const gf = evs(mf, e => e.kind === 'local-fund')[0]; put('grams', gf.grams, 'trace_film_mf local-fund'); put('price', gf.price, 'trace_film_mf local-fund'); put('fundValue', gf.value, 'trace_film_mf local-fund'); eq(gf.value, F.mfFund, 'fund value: trace == treat.log'); eq(gf.grams * gf.price, gf.value, 'grams x price = value');
  put('mfPullsTrace', evs(mf, e => e.kind === 'pull' && e.actor === 'BOR1' && e.flow === 'S2 gold-price').length, 'trace_film_mf pull BOR1'); eq(F.mfPullsTrace, F.mfPulls, 'gold price pulls: trace == treat.log');
  put('mfSlipPuts', evs(mf, e => e.kind === 'put').length, 'trace_film_mf put (same slip twice)'); put('mfSlipNames', new Set(evs(mf, e => e.kind === 'put').map(e => e.name)).size, 'trace_film_mf distinct shelf names'); eq(F.mfSlipNames, F.mfPayRecs, 'one shelf name == one payment');
  eq(F.openOwing - F.payAmt, F.mfOwing, 'owing: opening - payment (witness source) == treat.log');
  put('flashSec', Core.FLASH, 'film plan constant (core.js FLASH): fixed on-screen length of an ONLINE window');
  // ---- OFFLINE windows: independent counts ----
  const wcount = tr => { const n = {}; tr.forEach(e => { if (e.kind === 'online') n[e.actor] = (n[e.actor] || 0) + 1; }); return n; };
  eq(wcount(pos), JSON.parse(wo[1]), 'online windows POS: trace == treat.log'); eq(wcount(mf), JSON.parse(wo[2]), 'online windows MF: trace == treat.log');
  put('windowsPos', Object.values(wcount(pos)).reduce((a, b) => a + b, 0), 'trace online events (== treat.log W-TREAT-OFFLINE)'); put('windowsMf', Object.values(wcount(mf)).reduce((a, b) => a + b, 0), 'trace online events (== treat.log W-TREAT-OFFLINE)');
  const rows = {}; flows.forEach(r => { rows[r.name.split(' ')[0]] = r; });
  return { F: F, SRC: SRC, pos: pos, mf: mf, flows: flows, rows: rows, verdict: verdict };
}
module.exports = { buildFacts, TD };
if (require.main === module) { const r = buildFacts(); Object.keys(r.F).forEach(k => console.log('§FACT ' + k + '=' + JSON.stringify(r.F[k]) + '  <- ' + r.SRC[k])); console.log('§FACTS_DONE n=' + Object.keys(r.F).length + ' (all cross-checks passed)'); }
