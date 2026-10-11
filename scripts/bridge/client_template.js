// §SHOPDAY-RUN-1 R1.2 -- the SQLite side of "create a client": a born-tenant TEMPLATE EXTRACTED from what legacy MSetup/InitialClientSetup
// actually produced (every table with rows for the client, all columns), instantiated with the SAME facts the legacy process received.
// EXTRACT-NEVER-INVENT (CLAUDE.md prime rule): no hand-authored defaults. Cardinal rule: the result must equal a legacy run with those facts;
// that is proven by instantiating the template of client A with the facts of client B and comparing to legacy's real client B
// (witness_sd00.js `§SD00_CROSS`). Extraction reads the pilot DB with psql SELECT (admin lane: a System WS session is client-filtered).
'use strict';
const cp = require('child_process');
const DENY = /^(ad_session|ws_|ad_changelog|ad_pinstance|ad_userpreference|c_acctprocessorlog|r_requestprocessorlog|ad_issue|ad_note|ad_attachment|ad_system)/i;
const IDCOL = /(_id|_uu)$/i, AUDIT = /^(created|updated|createdby|updatedby)$/i, SECRET = /^(password|salt|ldapuser)$/i;

function pg(sql) {
  const r = cp.spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', process.env.PILOT_PG_DB || 'idempiere_pilot', '-At', '-v', 'ON_ERROR_STOP=1'],
    { input: 'set search_path=adempiere;\n' + sql, encoding: 'utf8', maxBuffer: 1 << 29 });
  if (r.status !== 0) throw new Error('§TPL psql failed: ' + (r.stderr || '').slice(0, 300));
  return r.stdout.split('\n').filter(l => l && l !== 'SET');
}
function extract(clientId) {
  const tabs = pg(`select table_name from information_schema.columns where table_schema='adempiere' and column_name='ad_client_id' and table_name in (select tablename from pg_tables where schemaname='adempiere') order by 1`).filter(t => !DENY.test(t));
  const out = { clientId, tables: {} };
  const counts = pg(tabs.map(t => `select '${t}', count(*) from ${t} where ad_client_id=${clientId}`).join(' union all ')).map(l => l.split('|'));
  for (const [t, n] of counts) {
    if (!+n) continue;
    const rows = JSON.parse(pg(`select coalesce(json_agg(t),'[]'::json) from (select * from ${t} where ad_client_id=${clientId} order by 1) t`).join(''));
    const cols = Object.keys(rows[0]), sec = cols.map(c => SECRET.test(c));   // password hashes/salts never leave the DB into a template (nulled; they are random per run anyway)
    out.tables[t] = { cols, rows: rows.map(r => Object.values(r).map((v, i) => sec[i] ? null : v)) };
  }
  return out;
}
// facts = { clientId, name, orgValue, orgName, adminUser, normalUser, currencyId, countryId, regionId, address1, city, postal, today(YYYY-MM-DD), year, currencyDesc? }
function instantiate(tpl, from, to) {
  if (from.year !== to.year) throw new Error(`§TPL REFUSED: template year ${from.year} != target year ${to.year} (periods/year rows are year-specific; re-extract)`);
  const delta = to.clientId - from.clientId;
  const lower8 = u => u.toLowerCase().slice(0, 8);
  const subs = new Map([[from.adminUser, to.adminUser], [from.normalUser, to.normalUser], [lower8(from.adminUser), lower8(to.adminUser)], [lower8(from.normalUser), lower8(to.normalUser)],
    [from.name, to.name], [from.orgName, to.orgName], [from.orgValue, to.orgValue], [from.address1, to.address1], [from.city, to.city], [from.postal, to.postal]]);
  if (from.currencyDesc && to.currencyDesc) subs.set(from.currencyDesc, to.currencyDesc);
  const dateSubs = from.today !== to.today ? [[from.today, to.today], [mdy(from.today), mdy(to.today)]] : [];
  const keys = [...subs.keys()].filter(k => k).sort((a, b) => b.length - a.length);
  const re = new RegExp(keys.map(k => k.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')).join('|'), 'g');
  const numMap = { c_currency_id: [from.currencyId, to.currencyId], c_country_id: [from.countryId, to.countryId], c_region_id: [from.regionId, to.regionId] };
  const out = { clientId: to.clientId, tables: {} }, OWN = owned(tpl), TT = treeTypes(tpl);
  for (const [t, d] of Object.entries(tpl.tables)) {
    const ci = d.cols.map(c => c.toLowerCase());
    out.tables[t] = { cols: d.cols, rows: d.rows.map(row => row.map((v, i) => {
      const c = ci[i];
      if (typeof v === 'string') {
        let s = v.replace(re, m => subs.get(m)); for (const [a, b] of dateSubs) s = s.split(a).join(b);
        s = s.split(`** ${from.clientId} **`).join(`** ${to.clientId} **`);                      // print formats are named '<format> ** <AD_Client_ID> ** - Copy Record'
        if (t === 'ad_preference' && c === 'value') {                                               // (attribute,value) polymorphic table: the value of an *_ID attribute is a key
          const at = String(row[ci.indexOf('attribute')]).toLowerCase();
          if (/^\d+$/.test(s)) { if (at === 'c_country_id' && +s === from.countryId) return String(to.countryId); if (at === 'c_currency_id' && +s === from.currencyId) return String(to.currencyId); if (/_id$/.test(at) && OWN[refTable('ad_preference', at)] && OWN[refTable('ad_preference', at)].has(s)) return String(+s + delta); }
        }
        if (ci.indexOf(t + '_id') >= 0 && s === String(row[ci.indexOf(t + '_id')]) && /^\d+$/.test(s)) return String(+s + delta);
        if (t === 'ad_user' && c === 'value') return lower8(row[ci.indexOf('name')].replace(re, m => subs.get(m)));   // MUser derives Value from the name (validated on 3 users, 2 clients)
        if ((t === 'c_taxcategory' || t === 'c_taxcategory_trl') && c === 'name' && TAXCAT_RULE.test(v)) return to.countryId === 100 ? 'Sales Tax' : 'Standard';   // MSetup.java:1233-1235: COUNTRY_US => 'Sales Tax' else the translated 'Standard'
        return s;
      }
      if (typeof v === 'number') {
        if (numMap[c] && v === numMap[c][0]) return numMap[c][1];
        if (c === 'ad_client_id') return to.clientId;
        if ((c === t + '_id' || /_id$|_acct$/.test(c)) && OWN[refTable(t, c, row, ci, TT)] && OWN[refTable(t, c, row, ci, TT)].has(String(v))) return v + delta;   // an OWNED row (own pk or a reference to one) => shift; system dictionary keys stay
      }
      if (v === null && numMap[c] && from[{ c_region_id: 'regionId' }[c] || ''] === null && to.regionId) return to.regionId;
      return v;
    })) };
  }
  return out;
}
const TAXCAT_RULE = /^(Sales Tax|Standard)$/;
const mdy = iso => { const [y, m, d] = iso.split('-').map(Number); return `${m}/${d}/${y}`; };

// ---- SQLite side --------------------------------------------------------------------------------------------------------------------
function fold(tpl, db) {   // untyped columns like the seed tables; schema = the legacy column list (so nothing is "missing" by construction)
  let n = 0;
  for (const [t, d] of Object.entries(tpl.tables)) {
    db.exec(`CREATE TABLE IF NOT EXISTS ${t}(${d.cols.map(c => c.toLowerCase()).join(',')})`);
    const ins = db.prepare(`INSERT INTO ${t}(${d.cols.map(c => c.toLowerCase()).join(',')}) VALUES (${d.cols.map(() => '?').join(',')})`);
    db.exec('BEGIN'); for (const r of d.rows) { ins.run(r.map(v => v === null || typeof v === 'number' ? v : typeof v === 'string' ? v.replace(/^(\d{4}-\d\d-\d\d)T(\d\d:\d\d:\d\d)(\.\d+)?$/, '$1 $2') : String(v))); n++; } db.exec('COMMIT');   // timestamps in the WS text form
  }
  return n;
}
// Canonical multiset of a table's rows: ids never compared by value. Every FK is resolved to the LABEL of the row it points to (name/value of the
// referenced row; *_acct -> the account's Value), so the wiring (which account / sequence / doctype a row points at) IS compared. FK-looking columns
// that cannot be resolved are listed in `unresolved` (never silently dropped).
const ALIAS = { m_productfreight_id: 'm_product', invoice_printformat_id: 'ad_printformat', order_printformat_id: 'ad_printformat', remittance_printformat_id: 'ad_printformat', shipment_printformat_id: 'ad_printformat', ad_printformatchild_id: 'ad_printformat', ad_printformat_id: 'ad_printformat', supervisor_id: 'ad_user', org_id: 'ad_org', account_id: 'c_elementvalue', ad_org_id: 'ad_org', ad_orgtrx_id: 'ad_org', docnosequence_id: 'ad_sequence', c_doctypeshipment_id: 'c_doctype', c_doctypeinvoice_id: 'c_doctype', c_doctypetarget_id: 'c_doctype', c_doctypeproforma_id: 'c_doctype', c_doctypedifference_id: 'c_doctype',
  ad_tree_menu_id: 'ad_tree', ad_tree_org_id: 'ad_tree', ad_tree_bpartner_id: 'ad_tree', ad_tree_product_id: 'ad_tree', ad_tree_project_id: 'ad_tree', ad_tree_salesregion_id: 'ad_tree', ad_tree_activity_id: 'ad_tree', ad_tree_campaign_id: 'ad_tree',
  c_bpartnercashtrx_id: 'c_bpartner', c_bpartner_id: 'c_bpartner', salesrep_id: 'ad_user', ad_user_id: 'ad_user', createdby: null, updatedby: null, m_warehouse_id: 'm_warehouse', c_acctschema1_id: 'c_acctschema', c_acctschema_id: 'c_acctschema',
  c_elementvalue_id: 'c_elementvalue', node_id: null, parent_id: null, c_period_id: 'c_period', c_year_id: 'c_year', c_calendar_id: 'c_calendar', m_locator_id: 'm_locator', m_product_category_id: 'm_product_category', c_bp_group_id: 'c_bp_group', c_tax_id: 'c_tax', ad_role_id: 'ad_role', ad_tree_id: 'ad_tree', m_costelement_id: 'm_costelement', m_costtype_id: 'm_costtype', c_element_id: 'c_element', gl_category_id: 'gl_category', m_discountschema_id: 'm_discountschema', c_cashbook_id: 'c_cashbook', ad_printform_id: 'ad_printform', c_location_id: 'c_location', ad_sequence_id: 'ad_sequence', c_doctype_id: 'c_doctype', c_taxcategory_id: 'c_taxcategory', m_pricelist_id: 'm_pricelist', m_pricelist_version_id: 'm_pricelist_version', c_paymentterm_id: 'c_paymentterm' };
const ALIAS_T = { 'ad_treenodebp.node_id': 'c_bpartner', 'ad_treenodebp.parent_id': 'c_bpartner', 'ad_treenodepr.node_id': 'm_product', 'ad_treenodepr.parent_id': 'm_product', 'ad_treenode.node_id': 'ad_menu', 'ad_treenode.parent_id': 'ad_menu' };
const TREE_TABLE = { EV: 'c_elementvalue', OO: 'ad_org', BP: 'c_bpartner', PR: 'm_product', AY: 'c_activity', MC: 'c_campaign', PJ: 'c_project', SR: 'c_salesregion', MM: 'ad_menu', U1: null, U2: null, U3: null, U4: null };
function treeTypes(tpl) { const d = tpl.tables.ad_tree; if (!d) return new Map(); const ci = d.cols.map(c => c.toLowerCase()), a = ci.indexOf('ad_tree_id'), b = ci.indexOf('treetype'); return new Map(d.rows.map(r => [String(r[a]), r[b]])); }
// ad_treenode is polymorphic: node_id/parent_id point into the table its tree's TreeType names (ad_tree.treetype)
const refTable = (t, c, row, ci, TT) => (t === 'ad_treenode' && (c === 'node_id' || c === 'parent_id') && row) ? (TREE_TABLE[TT.get(String(row[ci.indexOf('ad_tree_id')]))] || null) : /_acct$/.test(c) ? 'c_validcombination' : (t + '.' + c in ALIAS_T ? ALIAS_T[t + '.' + c] : (c in ALIAS ? ALIAS[c] : c.replace(/_id$/, '')));
function owned(tpl) {   // ids this client OWNS: every table's own pk (+ validcombination); a reference is shifted/resolved only when it points at an owned row
  const O = {};
  for (const [t, d] of Object.entries(tpl.tables)) { const pk = d.cols.map(c => c.toLowerCase()).indexOf(t + '_id'); if (pk >= 0) O[t] = new Set(d.rows.map(r => String(r[pk]))); }
  return O;
}
function labels(tpl) {
  const L = {};
  for (const [t, d] of Object.entries(tpl.tables)) {
    const ci = d.cols.map(c => c.toLowerCase()), pk = ci.indexOf(t + '_id'); if (pk < 0) continue;
    const ni = ['name', 'value'].map(c => ci.indexOf(c)).filter(i => i >= 0);
    L[t] = new Map(d.rows.map(r => [String(r[pk]), t + ':' + (ni.length ? ni.map(i => r[i]).filter(x => String(x) !== String(r[pk])).join('/') : '#')]));
  }
  const vc = tpl.tables.c_validcombination, ev = L.c_elementvalue;
  if (vc && ev) { const ci = vc.cols.map(c => c.toLowerCase()), pk = ci.indexOf('c_validcombination_id'), ac = ci.indexOf('account_id'); L.c_validcombination = new Map(vc.rows.map(r => [String(r[pk]), 'VC:' + (ev.get(String(r[ac])) || '?')])); }
  return L;
}
function canon(tpl, t, drop, unresolved) {
  const d = tpl.tables[t], L = labels(tpl), ci = d.cols.map(c => c.toLowerCase()), TT = treeTypes(tpl);
  return d.rows.map(r => {
    const parts = [];
    ci.forEach((c, i) => {
      let v = r[i];
      if (AUDIT.test(c) || SECRET.test(c) || (drop && drop.test(c)) || c === t + '_id' || c.endsWith('_uu')) return;
      if (typeof v === 'string' && v === String(r[ci.indexOf(t + '_id')]) && ci.indexOf(t + '_id') >= 0) { parts.push(c + '=#OWNID'); return; }   // Value that IS the row's own id (gl_category) -- allocation, not content
      if (/_acct$/.test(c)) v = v === null ? null : (L.c_validcombination.get(String(v)) || (unresolved.add(t + '.' + c), '?' + v));
      else if (/_id$/.test(c) && v !== null && refTable(t, c, r, ci, TT) === null) return;
      else if (/_id$/.test(c) && v !== null && c !== 'ad_client_id') {
        const ref = refTable(t, c, r, ci, TT);
        if (ref === null) return;
        if (L[ref] && L[ref].has(String(v))) v = L[ref].get(String(v));   // an owned row: compared by its label, never by id
        /* else a system dictionary key (ad_table, ad_window, c_currency, ...): compared by value */
      } else if (t === 'ad_preference' && c === 'value') { const at = String(r[ci.indexOf('attribute')]).toLowerCase(), ref = refTable('ad_preference', at); if (L[ref] && L[ref].has(String(v))) v = L[ref].get(String(v)); }
      parts.push(c + '=' + (v === null ? '' : /^-?\d+(\.0+)?$/.test(String(v)) ? String(Number(v)) : /^\d{4}-\d\d-\d\dT\d\d:/.test(String(v)) ? String(v).replace('T', ' ').replace(/\.\d+$/, '') : String(v)));
    });
    return parts.join('|');
  }).sort();
}
function compareTemplates(a, b, drop) {   // a = SQLite-side (instantiated), b = legacy-extracted
  const res = [], unresolved = new Set(); const names = [...new Set([...Object.keys(a.tables), ...Object.keys(b.tables)])].sort();
  for (const t of names) {
    const A = a.tables[t], B = b.tables[t];
    if (!A || !B) { res.push({ table: t, a: A ? A.rows.length : 0, b: B ? B.rows.length : 0, only: !A ? 'legacy' : 'local' }); continue; }
    const ca = canon(a, t, drop, unresolved), cb = canon(b, t, drop, unresolved), cnt = new Map();
    for (const x of cb) cnt.set(x, (cnt.get(x) || 0) + 1);
    const onlyLocal = []; for (const x of ca) { if (cnt.get(x)) cnt.set(x, cnt.get(x) - 1); else onlyLocal.push(x); }
    const onlyLegacy = []; for (const [x, k] of cnt) for (let i = 0; i < k; i++) onlyLegacy.push(x);
    res.push({ table: t, a: A.rows.length, b: B.rows.length, onlyLocal, onlyLegacy });
  }
  res.unresolved = [...unresolved].sort();
  return res;
}
module.exports = { extract, instantiate, fold, compareTemplates, pg };
