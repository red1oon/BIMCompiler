#!/usr/bin/env python3
# Snapshot the tables the ExpenseReport templates read from the local clone idempiere_clone into a scratch SQLite "twin snapshot" (witness input only).
# numeric -> REAL (the twin's own convention for amounts), integers -> INTEGER, timestamps -> TEXT 'YYYY-MM-DD HH:MM:SS', everything else TEXT.
import sys, sqlite3, decimal, datetime, psycopg2, os
out = sys.argv[1]
if os.path.exists(out): os.remove(out)
TABLES = ['fact_acct','c_elementvalue','c_bpartner','ad_org','c_invoice','c_payment','c_doctype','gl_journal','m_inout','c_order'] + [t for t in os.environ.get('NT_EXTRA_TABLES','').split(',') if t]   # extra (customer-specific) tables come from the private env, never from the repo
pg = psycopg2.connect(host='localhost', port=5432, user='adempiere', password='adempiere', dbname=os.environ.get('NT_PGDB','idempiere_clone')); pg.set_session(readonly=True); cur = pg.cursor()
lite = sqlite3.connect(out)
def conv(v):
    if isinstance(v, decimal.Decimal): return float(v)
    if isinstance(v, datetime.datetime): return v.strftime('%Y-%m-%d %H:%M:%S')
    if isinstance(v, datetime.date): return v.strftime('%Y-%m-%d 00:00:00')
    if isinstance(v, bool): return 'Y' if v else 'N'
    return v
for t in TABLES:
    cur.execute("select column_name,data_type from information_schema.columns where table_schema='adempiere' and table_name=%s order by ordinal_position", (t,))
    cols = cur.fetchall()
    if not cols: print('§SNAP skip', t); continue
    def aff(dt):
        if dt in ('numeric','double precision','real'): return 'REAL'
        if dt in ('integer','bigint','smallint'): return 'INTEGER'
        return 'TEXT'
    lite.execute('create table if not exists _scale (tbl TEXT, col TEXT, scale INTEGER)'); lite.execute('create table if not exists _coltype (tbl TEXT, col TEXT, dt TEXT)')
    for c, d in cols: lite.execute('insert into _coltype values (?,?,?)', (t, c, d))
    for c, d in cols:
        if d == 'numeric':
            cur.execute('select coalesce(max(scale("%s")),0) from adempiere.%s' % (c, t)); lite.execute('insert into _scale values (?,?,?)', (t, c, cur.fetchone()[0]))
    lite.execute('create table %s (%s)' % (t, ','.join('"%s" %s' % (c, aff(d)) for c, d in cols)))
    cur.execute('select %s from adempiere.%s' % (','.join('"%s"' % c for c, _ in cols), t)); n = 0
    while True:
        rows = cur.fetchmany(5000)
        if not rows: break
        lite.executemany('insert into %s values (%s)' % (t, ','.join('?' * len(cols))), [[conv(v) for v in r] for r in rows]); n += len(rows)
    print('§SNAP', t, n)
# v_docno: SQLite mirror of the PG STAND-IN view (legacy/v_docno_standin.sql)
lite.execute("""create view v_docno as
 select 318 as table_id, i.c_invoice_id as doc_id, i.documentno, dt.name as docname, i.description from c_invoice i left join c_doctype dt on dt.c_doctype_id=i.c_doctype_id
 union all select 335, p.c_payment_id, p.documentno, dt.name, p.description from c_payment p left join c_doctype dt on dt.c_doctype_id=p.c_doctype_id
 union all select 224, j.gl_journal_id, j.documentno, dt.name, j.description from gl_journal j left join c_doctype dt on dt.c_doctype_id=j.c_doctype_id
 union all select 319, io.m_inout_id, io.documentno, dt.name, io.description from m_inout io left join c_doctype dt on dt.c_doctype_id=io.c_doctype_id
 union all select 259, o.c_order_id, o.documentno, dt.name, o.description from c_order o left join c_doctype dt on dt.c_doctype_id=o.c_doctype_id""")
lite.commit(); lite.close()
