import sys,json
for l in sys.stdin:
    if l.startswith('FILE'): print(l.strip().split('/')[-1])
    else:
        r=json.loads(l); print(' overall',r['overall'],r['counts'],'|',r['headline']['text'])
        for c in r['checks']: print('  ',c['id'],c['status'],c['severity'],'|',c['feedback'], json.dumps(c['evidence'])[:160])
