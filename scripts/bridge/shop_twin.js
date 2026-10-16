// ⚠ DO NOT REMOVE -- SQLite SHOP TWIN (prompts/SQLiteIDEMPIERE.md §SHOPDAY-RUN-1 Stage 2). READ THE LOG: §SHOPDAY_* lines; exit code is not evidence.
// The SQLite side of a fresh client's day: an in-memory db born from the extracted MSetup template (client_template.js), plus MASTER creation that
// reproduces what legacy's PO save does -- AD column defaults (dictionary ad_full.db) and the afterSave side effects PORTED from the Java (cited per hook):
//   PO.insert_Accounting :4907-4990 (copy the base table's Account-type columns per acct schema), PO.insert_Tree :5030-5099, MCost.create :775-852.
// NOT shipped code: bim-ootb's shipped model layer (ad_modelval.js) has no master afterSave hooks => numbered gap G-SD2 (shipped change = its own PR).
'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const T = require('./client_template');
const fs = require('fs'), zlib = require('zlib');
const DDLF = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'ddl_defaults.json.gz')))), DDL = DDLF.defaults;   // physical column DEFAULTs of the legacy schema (pilot/extract_ddl_defaults.js)
const DICT = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
const lc = s => String(s).toLowerCase();

class ShopTwin {
  constructor(tplInst, o) {   // o = { clientId, orgId, userId, today }
    this.o = o; this.client = o.clientId; this.db = new Database(':memory:'); T.fold(tplInst, this.db); this.seq = 2000000; this.unsupported = new Set(); this.log = o.log || console.log;
    this.stamp = o.today + ' 00:00:00';
  }
  nid() { return ++this.seq; }
  cols(t) {   // physical columns = the LEGACY schema's (the checked-in dictionary db is older than the pilot: it lacks columns); ref 25 (Account) from the dictionary or the *_acct name rule
    const phys = DDLF.cols[lc(t)]; if (!phys) throw new Error('§TWIN no physical table ' + t);
    const dict = new Map(DICT.prepare('SELECT lower(c.columnname) n, c.ad_reference_id ref FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id WHERE upper(t.tablename)=upper(?)').all(t).map(r => [r.n, r.ref]));
    return phys.map(n => ({ name: n, ref: dict.has(n) ? dict.get(n) : (/_acct$/.test(n) ? 25 : null), pk: n === lc(t) + '_id' }));
  }
  ensure(t) { const cs = this.cols(t); if (!cs.length) throw new Error('§TWIN no dictionary columns for ' + t); this.db.exec(`CREATE TABLE IF NOT EXISTS ${t}(${cs.map(c => c.name).join(',')})`); return cs; }
  // PO.save of a NEW record, in legacy's order: setStandardDefaults (PO.java:1973-2000) -> the class constructor defaults (HOOK.defaults) -> caller's fields
  // -> saveNew (PO.java:3520-3608: PK from sequence, Value/DocumentNo from AD_Sequence when empty) -> beforeSave -> INSERT (unset columns get the DDL DEFAULT, because
  // PO.doInsert omits NULLs) -> afterSave. NB: AD_Column.DefaultValue is NOT applied (loadDefaults = setStandardDefaults only, PO.java:1964) -- it is UI (GridField) only.
  insert(t, given, extra = {}) {
    const cs = this.ensure(t), TN = (DICT.prepare('SELECT tablename n FROM ad_table WHERE upper(tablename)=upper(?)').get(t) || { n: t }).n, g = {}; for (const k in given) g[lc(k)] = given[k];
    const tn = lc(t), hook = HOOKS[tn] || {}, ddl = DDL[tn] || {}, have = new Set(cs.map(c => c.name)), row = {};
    for (const c of cs) {   // setStandardDefaults
      let v = null;
      if (/tedby$/.test(c.name)) v = this.o.userId; else if (/^(created|updated)$/.test(c.name)) v = this.stamp; else if (c.pk) v = 0; else if (c.name === 'isactive') v = 'Y';
      else if (c.name === 'ad_client_id') v = this.client; else if (c.name === 'ad_org_id') v = this.o.orgId; else if (/^(processed|processing|posted)$/.test(c.name)) v = 'N';
      row[c.name] = v;
    }
    if (hook.defaults) hook.defaults(row);
    for (const k in g) { if (!have.has(k)) throw new Error(`§TWIN ${t}.${k} is not a physical column`); row[k] = g[k]; }
    // saveNew
    const pk = cs.find(c => c.pk); if (pk && !(pk.name in g)) row[pk.name] = extra.pk != null ? extra.pk : this.nid();
    const uu = cs.find(c => /_uu$/.test(c.name)); if (uu) row[uu.name] = 'uu-' + (pk ? row[pk.name] : this.nid()) + '-' + t;
    if (have.has('documentno') && (row.documentno == null || row.documentno === '') && !/^t_/.test(tn)) { row.documentno = this.docNoOf(row, TN); }
    if (have.has('value') && (row.value == null || row.value === '') && !/^(t_.*|ad_sysconfig|m_attributeinstance|ad_tableattribute)$/.test(tn)) row.value = this.seqNext('DocumentNo_' + TN);
    if (hook.before) hook.before(this, row);
    // PO.save :2552-2573: org 0 for System-level tables
    const al = DICT.prepare('SELECT accesslevel a FROM ad_table WHERE upper(tablename)=upper(?)').get(t); if (al && String(al.a) === '4' && row.ad_org_id) row.ad_org_id = 0;
    // DB DEFAULT for what is still unset
    for (const c of cs) if (row[c.name] == null && c.name in ddl) row[c.name] = ddl[c.name] === '@NOW' ? this.stamp : ddl[c.name];
    for (const k in extra) if (k !== 'pk') row[k] = extra[k];
    this.db.prepare(`INSERT INTO ${t}(${Object.keys(row).join(',')}) VALUES (${Object.keys(row).map(() => '?').join(',')})`).run(Object.values(row).map(v => v === undefined ? null : v));
    const id = pk ? row[pk.name] : null; if (hook.after) hook.after(this, id, row);
    return id;
  }
  // MSequence.getDocumentNo(clientId, tableName) (named sequence 'DocumentNo_<Table>'): prefix + next + suffix, then CurrentNext += IncrementNo
  seqNext(name) {
    const sq = this.one('SELECT * FROM ad_sequence WHERE ad_client_id=? AND name=? AND isactive=? AND isautosequence=?', this.client, name, 'Y', 'Y');
    if (!sq) return null;
    const v = String(sq.prefix || '') + sq.currentnext + String(sq.suffix || '');
    this.db.prepare('UPDATE ad_sequence SET currentnext=currentnext+incrementno WHERE ad_sequence_id=?').run(sq.ad_sequence_id); return v;
  }
  docNoOf(row, t) {   // DB.getDocumentNo(C_DocType_ID,...) when the row has a doctype with a controlled sequence, else the table sequence (PO.java:3566-3580)
    const dtc = row.c_doctypetarget_id != null ? row.c_doctypetarget_id : row.c_doctype_id;
    if (dtc != null) { const dt = this.one('SELECT * FROM c_doctype WHERE c_doctype_id=?', dtc); if (dt && dt.isdocnocontrolled === 'Y' && dt.docnosequence_id) { const sq = this.one('SELECT name FROM ad_sequence WHERE ad_sequence_id=?', dt.docnosequence_id); const v = this.seqNextById(dt.docnosequence_id); if (v != null) return v; } }
    return this.seqNext('DocumentNo_' + t);
  }
  seqNextById(id) { const sq = this.one('SELECT * FROM ad_sequence WHERE ad_sequence_id=?', id); if (!sq) return null; const v = String(sq.prefix || '') + sq.currentnext + String(sq.suffix || ''); this.db.prepare('UPDATE ad_sequence SET currentnext=currentnext+incrementno WHERE ad_sequence_id=?').run(id); return v; }
  // PO.insert_Accounting: copy every Account-type (reference 25) column of the base table per schema, for this row
  insertAccounting(t, id, acctTable, baseTable, whereSql) {
    const acctCols = this.cols(acctTable), accts = acctCols.filter(c => c.ref === 25).map(c => c.name).sort();
    this.ensure(acctTable); this.ensure(baseTable);
    const pkCol = lc(t) + '_id';
    const base = this.db.prepare(`SELECT * FROM ${baseTable} p WHERE p.ad_client_id=? ${whereSql ? 'AND ' + whereSql : ''} AND NOT EXISTS (SELECT 1 FROM ${acctTable} e WHERE e.c_acctschema_id=p.c_acctschema_id AND e.${pkCol}=?)`).all(this.client, id);
    for (const b of base) {
      const r = {}; for (const c of acctCols) r[c.name] = null;
      Object.assign(r, { [pkCol]: id, c_acctschema_id: b.c_acctschema_id, ad_client_id: b.ad_client_id, ad_org_id: 0, isactive: 'Y', created: this.stamp, createdby: this.o.userId, updated: this.stamp, updatedby: this.o.userId });
      for (const a of accts) r[a] = b[a];
      const uu = acctCols.find(c => /_uu$/.test(c.name)); if (uu) r[uu.name] = 'uu-' + this.nid() + '-' + acctTable;
      this.db.prepare(`INSERT INTO ${acctTable}(${Object.keys(r).join(',')}) VALUES (${Object.keys(r).map(() => '?').join(',')})`).run(Object.values(r));
    }
    return base.length;
  }
  // PO.insert_Tree for the standard (IsAllNodes) trees of a TreeType
  insertTree(id, treeType, nodeTable) {
    this.ensure(nodeTable);
    const trees = this.db.prepare("SELECT ad_tree_id FROM ad_tree WHERE ad_client_id=? AND isactive='Y' AND isallnodes='Y' AND treetype=?").all(this.client, treeType);
    for (const tr of trees) {
      if (this.db.prepare(`SELECT 1 FROM ${nodeTable} WHERE ad_tree_id=? AND node_id=?`).get(tr.ad_tree_id, id)) continue;
      const cs = this.cols(nodeTable), r = {}; for (const c of cs) r[c.name] = null;
      Object.assign(r, { ad_client_id: this.client, ad_org_id: 0, isactive: 'Y', created: this.stamp, createdby: this.o.userId, updated: this.stamp, updatedby: this.o.userId, ad_tree_id: tr.ad_tree_id, node_id: id, parent_id: 0, seqno: 999 });
      const uu = cs.find(c => /_uu$/.test(c.name)); if (uu) r[uu.name] = 'uu-' + this.nid() + '-' + nodeTable;
      this.db.prepare(`INSERT INTO ${nodeTable}(${Object.keys(r).join(',')}) VALUES (${Object.keys(r).map(() => '?').join(',')})`).run(Object.values(r));
    }
  }
  // dump in client_template shape (lower-case columns), for the tables asked
  dump(tables) {
    const out = { clientId: this.client, tables: {} };
    for (const t of tables) {
      const ex = this.db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t); if (!ex) continue;
      const cols = this.db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name), rows = this.db.prepare(`SELECT * FROM ${t}`).all().map(r => cols.map(c => r[c]));
      if (rows.length) out.tables[t] = { cols, rows };
    }
    return out;
  }
  one(sql, ...p) { return this.db.prepare(sql).get(...p); }
}

// ---- afterSave hooks: PORTS of the Java (the shipped model layer has none for masters: G-SD2) ----
const HOOKS = {
  c_bpartner: {
    defaults(r) { Object.assign(r, { iscustomer: 'Y', isprospect: 'Y', sendemail: 'N', isonetime: 'N', isvendor: 'N', issummary: 'N', isemployee: 'N', issalesrep: 'N', istaxexempt: 'N', ispotaxexempt: 'N', isdiscountprinted: 'N',   // MBPartner.setInitialDefaults :276-304
      so_creditlimit: 0, so_creditused: 0, totalopenbalance: 0, socreditstatus: 'X', firstsale: null, actuallifetimevalue: 0, potentiallifetimevalue: 0, acqusitioncost: 0, shareofcustomer: 0, salesvolume: 0 }); },
    after(tw, id, row) {   // MBPartner.afterSave :976-990 (new): insert_Tree(BPartner), insert_Accounting(C_BP_Customer_Acct / C_BP_Vendor_Acct from C_BP_Group_Acct of the BP's group)
      tw.insertTree(id, 'BP', 'ad_treenodebp');
      const w = `p.c_bp_group_id=${row.c_bp_group_id}`;
      tw.insertAccounting('c_bpartner', id, 'c_bp_customer_acct', 'c_bp_group_acct', w);
      tw.insertAccounting('c_bpartner', id, 'c_bp_vendor_acct', 'c_bp_group_acct', w);
    } },
  m_cost: { defaults(r) { Object.assign(r, { m_attributesetinstance_id: 0, currentcostprice: 0, futurecostprice: 0, currentqty: 0, cumulatedamt: 0, cumulatedqty: 0 }); } },   // MCost.setInitialDefaults :1619-1627
  m_costelement: { before(tw, row) { row.ad_org_id = 0; } },   // MCostElement.beforeSave (org 0): see MCostElement.java
  c_location: { before(tw, row) { row.ad_org_id = 0; } },                                                                        // MLocation.beforeSave :721-722
  c_bankaccount: { after(tw, id) { tw.insertAccounting('c_bankaccount', id, 'c_bankaccount_acct', 'c_acctschema_default', null); } },   // MBankAccount.afterSave :220-226
  c_tax: { after(tw, id) { tw.insertAccounting('c_tax', id, 'c_tax_acct', 'c_acctschema_default', null); } },                           // MTax.afterSave :400-407
  m_product: { after(tw, id, row) {   // MProduct.afterSave :866-905 (new): M_Product_Acct from the category's acct rows, product tree, MCost.create (standard-costing element)
    tw.insertAccounting('m_product', id, 'm_product_acct', 'm_product_category_acct', `p.m_product_category_id=${row.m_product_category_id}`);
    tw.insertTree(id, 'PR', 'ad_treenodepr');
    tw.mcostCreate(id, row);
  } },
};
ShopTwin.prototype.mcostCreate = function (id, prod) {   // MCost.create(MProduct) :775-852 with COSTINGLEVEL Client (:790-795); other levels are listed, not guessed
  const ce = this.db.prepare("SELECT * FROM m_costelement WHERE ad_client_id=? AND isactive='Y' AND costingmethod='S' AND costelementtype='M' ORDER BY m_costelement_id").get(this.client);
  if (!ce) { this.log('§TWIN MCost.create: no Standard Costing element'); return; }
  for (const as of this.db.prepare("SELECT * FROM c_acctschema WHERE ad_client_id=? AND isactive='Y'").all(this.client)) {
    const level = as.costinglevel || 'C';   // product/category override (MProduct.getCostingLevel) not modelled: DIFF would show
    if (level !== 'C') { this.unsupported.add('MCost.create costinglevel=' + level); continue; }
    this.insert('m_cost', { m_product_id: id, c_acctschema_id: as.c_acctschema_id, ad_org_id: 0, m_costelement_id: ce.m_costelement_id, m_attributesetinstance_id: 0, m_costtype_id: as.m_costtype_id });
  }
};
module.exports = { ShopTwin, DICT };
