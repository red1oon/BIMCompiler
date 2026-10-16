# ⚠ DO NOT REMOVE — scope: W-MODEL-ORACLE. The WHOLE-DB footprint of one document: every row in every table reachable from
# a root row via <table>_id FKs (downward) + (AD_Table_ID,Record_ID) generic refs + allocation/cash headers upward. READ-ONLY.
# Usage: DB=idempiere_pilot ROWS=1 python3 closure.py c_order:<id>  → JSON {table: count} (+ full rows with ROWS=1). Read the output.
# closure.py — the WHOLE-DB footprint of a document: every row in every table reachable from a root row
# via <table>_id FK columns (downward) + (ad_table_id, record_id) generic refs. Read-only.
import sys, psycopg2, json, os
db = os.environ.get('DB','idempiere')
cn = psycopg2.connect(host='localhost', user='adempiere', password='adempiere', dbname=db); cur = cn.cursor()
cur.execute("set search_path=adempiere")
cur.execute("select c.table_name, c.column_name from information_schema.columns c join information_schema.tables t on t.table_name=c.table_name and t.table_schema=c.table_schema where c.table_schema='adempiere' and t.table_type='BASE TABLE'")
cols = {}
for t, c in cur.fetchall(): cols.setdefault(t, set()).add(c)
cur.execute("select lower(tablename), ad_table_id from ad_table"); tid = dict(cur.fetchall())
# downstream-generating parents only (don't walk into master data like c_bpartner/m_product)
DOCS = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else {'c_order','c_orderline','m_inout','m_inoutline','c_invoice','c_invoiceline','c_payment','c_allocationhdr','c_cashline','m_transaction','c_pospayment','m_costdetail'}
root_t, root_id = sys.argv[1].split(':')
STOP = set(x for x in os.environ.get('STOP', '').split(',') if x)   # other documents' headers: neither included nor walked through
found = {root_t: {int(root_id)}}; queue = [(root_t, int(root_id))]
while queue:
    t, i = queue.pop()
    if t not in DOCS: continue
    fk = t + '_id'
    for t2, cs in cols.items():
        hits = []
        if fk in cs and t2 != t:
            pk = t2 + '_id' if (t2 + '_id') in cs else None
            cur.execute(f"select {pk or 'ctid::text'} from {t2} where {fk}=%s", (i,)); hits = [r[0] for r in cur.fetchall()]
        if 'record_id' in cs and 'ad_table_id' in cs and t in tid:
            pk = t2 + '_id' if (t2 + '_id') in cs else None
            cur.execute(f"select {pk or 'ctid::text'} from {t2} where ad_table_id=%s and record_id=%s", (tid[t], i)); hits += [r[0] for r in cur.fetchall()]
        hits = [int(h) if not isinstance(h, str) else h for h in hits]
        for h in hits:
            if f'{t2}:{h}' in STOP: continue
            s = found.setdefault(t2, set())
            if h not in s:
                s.add(h)
                if isinstance(h, int): queue.append((t2, h))
# upward: allocation headers / cash journals / payments the lines hang off, then walk them too
UP = {'c_allocationline': ['c_allocationhdr_id','c_payment_id'], 'c_cashline': ['c_cash_id'], 'c_bankstatementline': ['c_bankstatement_id']}
changed = True
while changed:
    changed = False
    for lt, pcs in UP.items():
        for lid in list(found.get(lt, [])):
            for pc in pcs:
                cur.execute(f"select {pc} from {lt} where {lt}_id=%s", (lid,)); r = cur.fetchone()
                if r and r[0]:
                    pt = pc[:-3]; s = found.setdefault(pt, set())
                    if int(r[0]) not in s:
                        s.add(int(r[0])); changed = True
                        DOCS.add(pt); queue.append((pt, int(r[0])))
    while queue:
        t, i = queue.pop()
        if t not in DOCS: continue
        fk = t + '_id'
        for t2, cs in cols.items():
            hits = []
            if fk in cs and t2 != t:
                pk = t2 + '_id' if (t2 + '_id') in cs else None
                cur.execute(f"select {pk or 'ctid::text'} from {t2} where {fk}=%s", (i,)); hits = [r[0] for r in cur.fetchall()]
            if 'record_id' in cs and 'ad_table_id' in cs and t in tid:
                pk = t2 + '_id' if (t2 + '_id') in cs else None
                cur.execute(f"select {pk or 'ctid::text'} from {t2} where ad_table_id=%s and record_id=%s", (tid[t], i)); hits += [r[0] for r in cur.fetchall()]
            hits = [int(h) if not isinstance(h, str) else h for h in hits]
            for h in hits:
                if f'{t2}:{h}' in STOP: continue
                s = found.setdefault(t2, set())
                if h not in s:
                    s.add(h); changed = True
                    if isinstance(h, int): queue.append((t2, h))
print(json.dumps({k: len(v) for k, v in sorted(found.items())}))
if os.environ.get('IDS'): print(json.dumps({k: sorted(map(str,v)) for k, v in sorted(found.items())}))
if os.environ.get('ROWS'):
    out = {}
    for t, ids in found.items():
        cur.execute(f"select column_name, data_type from information_schema.columns where table_schema='adempiere' and table_name='{t}' order by ordinal_position")
        cd = cur.fetchall(); pk = t + '_id' if any(c == t + '_id' for c, _ in cd) else None
        sel = ', '.join((f"to_char({c},'YYYY-MM-DD HH24:MI:SS" + (".MS" if c in ('created', 'updated') else "") + "')" if (d.startswith('timestamp') or d == 'date') else f'"{c}"') for c, d in cd)
        ints = [i for i in ids if isinstance(i, int)]
        if pk and ints: cur.execute(f"select {sel} from {t} where {pk} = any(%s)", (ints,))
        else: cur.execute(f"select {sel} from {t} where ctid::text = any(%s)", ([str(i) for i in ids],))
        rows = []
        for r in cur.fetchall():
            o = {}
            for (c, _), v in zip(cd, r):
                if hasattr(v, 'as_integer_ratio') and not isinstance(v, (int, float)): v = float(v)
                if isinstance(v, bool): v = 'Y' if v else 'N'
                o[c] = v
            rows.append(o)
        out[t] = rows
    print(json.dumps(out, default=str))
