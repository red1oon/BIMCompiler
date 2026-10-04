# ⚠ DO NOT REMOVE — scope: W-MODEL-ORACLE pre-state builder (prompts/ERP_MODEL_LAYER.md §WITNESS). READ-ONLY on Postgres.
# Copies every table the model layer reads or writes from the PRISTINE reference DB `idempiere` (= the pilot copy's
# state before the pilot ran) into a SQLite file, column names lower-case, so the JS model runs on exactly that state.
# Usage: python3 dump_prestate.py <out.db> [db=idempiere]   — read the printed §-lines.
import sys, sqlite3, psycopg2, decimal, datetime
out = sys.argv[1]; dbn = sys.argv[2] if len(sys.argv) > 2 else 'idempiere'
TABLES = '''c_order c_orderline c_ordertax c_invoice c_invoiceline c_invoicetax m_inout m_inoutline m_inoutlinema m_transaction
m_storageonhand m_storagereservation m_storagereservationlog m_costdetail m_cost m_costqueue m_costhistory m_costelement m_costtype
c_payment c_allocationhdr c_allocationline c_bpartner c_bp_group c_bpartner_location ad_user c_doctype ad_sequence m_product m_product_category
m_attributeset m_warehouse m_locator c_tax c_currency m_pricelist c_bankaccount c_paymentterm c_payschedule c_period c_year c_periodcontrol
c_acctschema ad_clientinfo ad_client ad_workflow ad_wf_node ad_wf_nodenext ad_wf_process ad_wf_activity ad_wf_eventaudit ad_process
m_matchpo m_matchinv c_paymentallocate c_orderlandedcost c_orderpayschedule c_invoicepayschedule c_pos
fact_acct c_validcombination c_elementvalue c_bp_customer_acct c_bp_vendor_acct c_bp_group_acct m_product_acct m_product_category_acct c_tax_acct
c_bankaccount_acct c_acctschema_default c_acctschema_gl c_conversion_rate c_conversiontype ad_orginfo gl_category ad_message
ad_sequence_no t_fact_acct_history m_product_po c_orderlandedcostallocation ad_org m_rma m_rmaline
c_uom c_uom_conversion c_payselection c_payselectionline c_payselectioncheck c_bp_bankaccount ad_sysconfig c_projectissue m_inventory m_inventoryline m_movement m_movementline m_production m_productionline'''.split()
cn = psycopg2.connect(host='localhost', user='adempiere', password='adempiere', dbname=dbn); cur = cn.cursor(); cur.execute('set search_path=adempiere')
lite = sqlite3.connect(out)
def conv(v):
    if isinstance(v, decimal.Decimal): return int(v) if v == v.to_integral_value() and abs(v) < 2**53 else float(v)
    if isinstance(v, (datetime.datetime, datetime.date)): return v.strftime('%Y-%m-%d %H:%M:%S') if isinstance(v, datetime.datetime) else v.strftime('%Y-%m-%d 00:00:00')
    if isinstance(v, bool): return 'Y' if v else 'N'
    return v
def copy(t, where='', cols=None):
    cur.execute(f"select column_name from information_schema.columns where table_schema='adempiere' and table_name='{t}' order by ordinal_position")
    allc = [r[0] for r in cur.fetchall()]
    cur.execute(f"select column_name, data_type from information_schema.columns where table_schema='adempiere' and table_name='{t}'")
    typ = dict(cur.fetchall())
    if not allc: print(f'§PRESTATE table={t} ABSENT-IN-PG'); return
    cs = cols or allc
    lite.execute(f'DROP TABLE IF EXISTS {t}')
    lite.execute(f"CREATE TABLE {t} ({', '.join('"'+c+'"' for c in cs)})")
    sel = ', '.join(f"to_char({c},'YYYY-MM-DD HH24:MI:SS') as \"{c}\"" if typ.get(c,'').startswith('timestamp') or typ.get(c)=='date' else '"'+c+'"' for c in cs)
    cur.execute(f"select {sel} from {t} {where}")
    rows = [tuple(conv(v) for v in r) for r in cur.fetchall()]
    lite.executemany(f"INSERT INTO {t} VALUES ({', '.join('?'*len(cs))})", rows)
    print(f'§PRESTATE table={t} rows={len(rows)}')
for t in TABLES:
    cur.execute(f"select 1 from information_schema.columns where table_schema='adempiere' and table_name='{t}' and column_name='ad_client_id'")
    copy(t, 'where ad_client_id in (0,11)' if cur.fetchone() else '')
copy('ad_table', '', ['ad_table_id', 'tablename', 'ischangelog'])
copy('ad_column', '', ['ad_column_id', 'ad_table_id', 'columnname', 'iskey', 'isparent', 'defaultvalue', 'columnsql', 'isactive', 'ad_process_id', 'ad_reference_id', 'ismandatory'])
lite.commit(); print('§PRESTATE done db=' + dbn + ' out=' + out)
# DDL defaults (PO.saveNew omits null columns → the column DEFAULT applies). Shipped to the page the same way
# (erp/patches/ad_seed.db.sql ad_ddl_default rows, build_ad_seed_patch.sh) so the model applies them identically.
lite.execute('DROP TABLE IF EXISTS ad_ddl_default'); lite.execute('CREATE TABLE ad_ddl_default (tablename, columnname, defaultvalue)')
cur.execute("select table_name, column_name, column_default from information_schema.columns where table_schema='adempiere' and column_default is not null and table_name = any(%s)", (TABLES,))
dd = []
for t, c, d in cur.fetchall():
    v = d.split('::')[0].strip()
    if v.startswith('(') and v.endswith(')'): v = v[1:-1]
    if v.startswith("'") and v.endswith("'"): v = v[1:-1]
    elif not __import__('re').match(r'^-?\d+(\.\d+)?$', v): continue      # functions (now(), nextval, uuid) are not data defaults
    dd.append((t, c, v))
lite.executemany('INSERT INTO ad_ddl_default VALUES (?,?,?)', dd); lite.commit(); print('§PRESTATE ad_ddl_default rows=' + str(len(dd)))
