// ⚠ DO NOT REMOVE — CLIENT CONTEXT (spec prompts/SQLiteIDEMPIERE.md §SHOPDAY (1)/(4) + §SHOPDAY-BUILD-1). READ THE LOG: `§CTX` lines.
// One object holding every id the Bridge scenarios used to hard-code. DEFAULT = the GardenWorld demo client (client 11), so with SHOPDAY_CLIENT unset
// every consumer sees exactly the literals it had before. `SHOPDAY_CLIENT=<client Name>` makes init(cfg) re-resolve every key BY NATURAL KEY
// (Value/Name) through the WS read types -- never an invented literal. `resolve(cfg, ctxName)` is the witness path: it resolves every key and returns
// literal-vs-resolved rows without touching the live ctx.
// Natural keys below are what MSetup/InitialClientSetup gives a new client by name (§SHOPDAY (1) table); ids are only ever outputs of a lookup.
'use strict';
const { query } = require('./ad_client');

// ---- GardenWorld defaults (the literals that were scattered over cycle_o2c / cycle_p2p / witness_m3_gap / witness_fa_gap) ----
const ctx = {
  clientName: 'GardenWorld',
  client: 11, org: 11, org2: 12,
  role: 102, user: 101,
  wh: 103, wh2: 104, locator: 101,
  customer: 112, customerLoc: 108, customer2: 118, customer2Loc: 113, vendor: 120, vendorLoc: 114,
  prod: { oak: 123, mulch: 137, rake: 139, weeder: 141, azalea: 128, fertilizer: 136, patioSet: 145, standard: 122 },
  dt: { std: 132, pos: 135, po: 126, mmReceipt: 122, mmShipment: 120, arInvoice: 116, arReceipt: 119, apPayment: 125, requisition: 127, movement: 143, physInv: 144, glJournal: 115, apInvoice: 123 },
  pl: { sales: 101, purchase: 102 },
  costElement: { avgPO: 103 },
  schema: { primary: 101, second: 200000 },
  cur: 100, curSecond: 102,
  bank: 100, cashbook: 101, glcat: 108,
};
const DEFAULTS = JSON.parse(JSON.stringify(ctx));
// NEGATIVE-CONTROL hook (test only, always logged): BRIDGE_CTX_OVERRIDE='{"wh":999999}' makes a harness run on a deliberately wrong id -- it must never MATCH (§SHOPDAY-BUILD-1 A3)
if (process.env.BRIDGE_CTX_OVERRIDE) {
  const ov = JSON.parse(process.env.BRIDGE_CTX_OVERRIDE);
  for (const k of Object.keys(ov)) { const ks = k.split('.'), last = ks.pop(); ks.reduce((a, x) => a[x], ctx)[last] = ov[k]; console.log(`§CTX_OVERRIDE ${k}=${ov[k]} (negative control)`); }
}

// ---- natural-key resolution table. get(c) = {type, where, col}; c = {client, wh, ...} resolved so far (order matters) ----
const q = s => `'${String(s).replace(/'/g, "''")}'`;
const cl = c => `AD_Client_ID=${c.client}`;
const byPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
// nk = natural key text per GardenWorld value (the names a fresh client gets from MSetup are given in §SHOPDAY (1); GardenWorld's own are measured on the pilot)
const N = {
  clientName: 'GardenWorld', orgValue: 'HQ', org2Value: 'Store Central', whName: 'HQ Warehouse', wh2Name: 'Store Central', locatorValue: 'Default HQ Locator',
  role: 'GardenWorld Admin', user: 'GardenAdmin', customer: 'Standard', customer2: 'JoeBlock', vendor: 'SeedFarm',
  prod: { oak: 'Oak', mulch: 'Mulch', rake: 'Rake-Bamboo', weeder: 'Weeder', azalea: 'Azalea Bush', fertilizer: 'Fertilizer#50', patioSet: 'PatioSet', standard: 'Standard' },
  dt: { std: 'Standard Order', pos: 'POS Order', po: 'Purchase Order', mmReceipt: 'MM Receipt', mmShipment: 'MM Shipment', arInvoice: 'AR Invoice', arReceipt: 'AR Receipt', apPayment: 'AP Payment', requisition: 'Purchase Requisition', movement: 'Material Movement', physInv: 'Material Physical Inventory', glJournal: 'GL Journal', apInvoice: 'AP Invoice' },
  salesPL: 'Standard', purchasePL: 'Purchase', bankAccountNo: '1234', cashbook: 'HQ CashBook', schema2Like: 'Second Schema%',
};
const T = [   // [ctx path, builder(c, N) -> {type, where, col, note?}]
  ['client', (c, n) => ({ type: 'QueryCBPartner', where: `AD_Client_ID IN (SELECT AD_Client_ID FROM AD_Client WHERE Name=${q(n.clientName)})`, col: 'AD_Client_ID', via: 'AD_Client.Name via a C_BPartner row of that client (no QueryADClient read type)' })],
  ['role', (c, n) => ({ type: 'QueryADRole', where: `Name=${q(n.role)} AND ${cl(c)}`, col: 'AD_Role_ID' })],
  ['user', (c, n) => ({ type: 'QueryADUser', where: `Name=${q(n.user)} AND ${cl(c)}`, col: 'AD_User_ID' })],
  ['org', (c, n) => ({ type: 'QueryCOrder', where: `${cl(c)} AND AD_Org_ID IN (SELECT AD_Org_ID FROM AD_Org WHERE Value=${q(n.orgValue)} AND ${cl(c)})`, col: 'AD_Org_ID', via: 'AD_Org.Value via a C_Order row of that org (no QueryADOrg read type)' })],
  ['org2', (c, n) => ({ type: 'QueryCOrder', where: `${cl(c)} AND AD_Org_ID IN (SELECT AD_Org_ID FROM AD_Org WHERE Value=${q(n.org2Value)} AND ${cl(c)})`, col: 'AD_Org_ID', via: 'AD_Org.Value via a C_Order row of that org (no QueryADOrg read type)' })],
  ['wh', (c, n) => ({ type: 'QueryMInOut', where: `${cl(c)} AND M_Warehouse_ID IN (SELECT M_Warehouse_ID FROM M_Warehouse WHERE Name=${q(n.whName)} AND ${cl(c)})`, col: 'M_Warehouse_ID', via: 'M_Warehouse.Name via an M_InOut row (no QueryMWarehouse read type)' })],
  ['wh2', (c, n) => ({ type: 'QueryMInOut', where: `${cl(c)} AND M_Warehouse_ID IN (SELECT M_Warehouse_ID FROM M_Warehouse WHERE Name=${q(n.wh2Name)} AND ${cl(c)})`, col: 'M_Warehouse_ID', via: 'M_Warehouse.Name via an M_InOut row (no QueryMWarehouse read type)' })],
  ['locator', (c, n) => ({ type: 'QueryStorage', where: `${cl(c)} AND M_Locator_ID IN (SELECT M_Locator_ID FROM M_Locator WHERE Value=${q(n.locatorValue)} AND M_Warehouse_ID IN (SELECT M_Warehouse_ID FROM M_Warehouse WHERE Name=${q(n.whName)} AND ${cl(c)}))`, col: 'M_Locator_ID', via: 'M_Locator.Value via an M_Storage row (no QueryMLocator read type)' })],
  ['customer', (c, n) => ({ type: 'QueryCBPartner', where: `Value=${q(n.customer)} AND ${cl(c)}`, col: 'C_BPartner_ID' })],
  ['customer2', (c, n) => ({ type: 'QueryCBPartner', where: `Value=${q(n.customer2)} AND ${cl(c)}`, col: 'C_BPartner_ID' })],
  ['vendor', (c, n) => ({ type: 'QueryCBPartner', where: `Value=${q(n.vendor)} AND ${cl(c)}`, col: 'C_BPartner_ID' })],
  ...Object.keys(N.prod).map(k => ['prod.' + k, (c, n) => ({ type: 'QueryMProduct', where: `Value=${q(n.prod[k])} AND ${cl(c)}`, col: 'M_Product_ID' })]),
  ...Object.keys(N.dt).map(k => ['dt.' + k, (c, n) => ({ type: 'QueryCDocType', where: `Name=${q(n.dt[k])} AND ${cl(c)}`, col: 'C_DocType_ID' })]),
  ['pl.sales', (c, n) => ({ type: 'QueryMPriceList', where: `Name=${q(n.salesPL)} AND IsSOPriceList='Y' AND ${cl(c)}`, col: 'M_PriceList_ID' })],
  ['pl.purchase', (c, n) => ({ type: 'QueryMPriceList', where: `Name=${q(n.purchasePL)} AND IsSOPriceList='N' AND ${cl(c)}`, col: 'M_PriceList_ID' })],
  ['costElement.avgPO', c => ({ type: 'QueryMCostElement', where: `CostingMethod='A' AND ${cl(c)}`, col: 'M_CostElement_ID' })],
  ['schema.primary', c => ({ type: 'QueryCAcctSchema', where: `${cl(c)} AND IsActive='Y' AND Name NOT LIKE 'Second%' AND Name NOT LIKE 'CP %'`, col: 'C_AcctSchema_ID', via: 'first active schema of the client that is not a Second*/copy schema (GardenWorld has 3 rows; a fresh client has 1)' })],
  ['schema.second', (c, n) => ({ type: 'QueryCAcctSchema', where: `${cl(c)} AND Name LIKE ${q(n.schema2Like)}`, col: 'C_AcctSchema_ID' })],
  ['cur', (c, n) => ({ type: 'QueryMPriceList', where: `Name=${q(n.salesPL)} AND IsSOPriceList='Y' AND ${cl(c)}`, col: 'C_Currency_ID', via: 'sales price list currency (no QueryCCurrency read type)' })],
  ['curSecond', c => ({ type: 'QueryCAcctSchema', where: `${cl(c)} AND Name LIKE ${q(N.schema2Like)}`, col: 'C_Currency_ID', via: 'second schema currency (no QueryCCurrency read type)' })],
  ['bank', (c, n) => ({ type: 'QueryCBankAccount', where: `AccountNo=${q(n.bankAccountNo)} AND ${cl(c)}`, col: 'C_BankAccount_ID' })],
  ['cashbook', (c, n) => ({ type: 'QueryCCashBook', where: `Name=${q(n.cashbook)} AND ${cl(c)}`, col: 'C_CashBook_ID' })],
];
// keys with NO read type on the pilot at all (resolving them needs a D6 config row + restart; out of scope of BUILD-1): reported, never faked
const NO_READ_TYPE = { customerLoc: 'C_BPartner_Location', customer2Loc: 'C_BPartner_Location', vendorLoc: 'C_BPartner_Location', glcat: 'GL_Category' };
const ALL_KEYS = () => { const out = []; (function walk(o, p) { for (const k in o) { const v = o[k]; if (v && typeof v === 'object') walk(v, p + k + '.'); else if (typeof v === 'number') out.push(p + k); } })(DEFAULTS, ''); return out; };

// resolve every key in `names` (default N = GardenWorld) for the client whose name is names.clientName. Returns {rows:[{key, literal, resolved, status, via, n}], ctxOut}
async function resolve(cfg, names = N) {
  const out = JSON.parse(JSON.stringify(DEFAULTS)); const rows = [];
  const lcfg = { ...cfg, login: { ...cfg.login } };
  // the tenant id is itself looked up first (from the role named for the client); everything else is filtered by it
  const c = { client: null };
  for (const [path, build] of T) {
    const lit = byPath(DEFAULTS, path);
    const b = build(c, names); let res = null, status, nrows = 0;
    try {
      if (path !== 'client' && c.client == null) throw new Error('client unresolved');
      const r = await query(lcfg, b.type, b.where);
      nrows = r.length;
      if (!nrows) status = 'UNRESOLVED';   // natural key matched nothing (or the fixture row the sub-select needs does not exist)
      else { const vals = [...new Set(r.map(x => Number(x[b.col])))].sort((a, z) => a - z); res = vals[0]; status = vals.length > 1 ? 'AMBIGUOUS' : (res === lit ? 'EQ' : 'NE'); if (vals.length > 1 && res === lit) status = 'AMBIGUOUS'; }
    } catch (e) { status = 'UNRESOLVED'; b.via = (b.via ? b.via + '; ' : '') + e.message.replace(/\s+/g, ' ').slice(0, 110); }
    if (path === 'client') c.client = res;
    if (res != null) setPath(out, path, res); else setPath(out, path, undefined);
    rows.push({ key: path, literal: lit, resolved: res, status, via: `${b.type} where ${b.where}${b.via ? ' [' + b.via + ']' : ''}`, n: nrows });
  }
  for (const k of Object.keys(NO_READ_TYPE)) rows.push({ key: k, literal: DEFAULTS[k], resolved: null, status: 'NO_READ_TYPE', via: `needs read type for ${NO_READ_TYPE[k]} (D6 config row + restart)`, n: 0 });
  return { rows, ctxOut: out };
}
const logRows = (rows, log = console.log) => rows.forEach(r => log(`§CTX ${r.key} literal=${r.literal} resolved=${r.resolved} ${r.status} n=${r.n} via=${r.via}`));

// Live context: unset SHOPDAY_CLIENT => unchanged defaults, no WS call. Set => re-resolve by natural key for that client name and OVERWRITE ctx in place
// (unresolved keys become undefined, never the GardenWorld default: a fresh client must not silently run on demo ids).
async function init(cfg, log = console.log) {
  const name = process.env.SHOPDAY_CLIENT;
  if (!name) { log('§CTX_MODE default=GardenWorld (SHOPDAY_CLIENT unset) keys=' + ALL_KEYS().length); return ctx; }
  const names = JSON.parse(JSON.stringify(N)); names.clientName = name;
  // fresh-client natural keys per §SHOPDAY (1): admin role "<ClientName> Admin", user "<ClientName>Admin", org Value SHOP, MSetup warehouse/locator names are read from the row, not assumed
  names.role = `${name} Admin`; names.user = `${name}Admin`;
  const { rows, ctxOut } = await resolve(cfg, names); logRows(rows, log);
  Object.assign(ctx, ctxOut); ctx.clientName = name;
  log(`§CTX_MODE client=${name} resolved=${rows.filter(r => r.status === 'EQ' || r.status === 'NE').length} unresolved=${rows.filter(r => r.status !== 'EQ' && r.status !== 'NE').length}`);
  return ctx;
}
module.exports = { ctx, DEFAULTS, N, T, resolve, logRows, init, ALL_KEYS, NO_READ_TYPE };
