#!/usr/bin/env python3
# Executor for the parity witness: reads SQL on stdin, prints rows as JSON with Java-like typing (n=number,s=string,t=timestamp). DB = local clone idempiere_clone ONLY.
import sys, json, decimal, datetime, psycopg2
sql = sys.stdin.read()
con = psycopg2.connect(host='localhost', port=5432, user='adempiere', password='adempiere', dbname=__import__('os').environ.get('NT_PGDB','idempiere_clone')); con.set_session(readonly=True)
cur = con.cursor()
try:
    cur.execute(sql); rows = cur.fetchall()
except Exception as e:
    print(json.dumps({'error': str(e)})); sys.exit(0)
def ts(d):
    s = d.strftime('%Y-%m-%d %H:%M:%S'); f = ('%06d' % d.microsecond).rstrip('0') if isinstance(d, datetime.datetime) else ''
    return s + '.' + (f or '0')
def typed(v):
    if v is None: return None
    if isinstance(v, bool): return {'k': 's', 's': 'Y' if v else 'N'}
    if isinstance(v, decimal.Decimal): return {'k': 'n', 's': format(v, 'f')}
    if isinstance(v, (int, float)): return {'k': 'n', 's': repr(v)}
    if isinstance(v, datetime.datetime): return {'k': 't', 's': ts(v)}
    if isinstance(v, datetime.date): return {'k': 't', 's': ts(datetime.datetime(v.year, v.month, v.day))}
    return {'k': 's', 's': str(v)}
print(json.dumps({'rows': [[typed(v) for v in r] for r in rows]}))
