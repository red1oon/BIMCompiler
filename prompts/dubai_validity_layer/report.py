import json,sys
for r in json.load(open(sys.argv[1])):
    v=r['validity']; print('\n==',r['file'],'| worker type:',r['type'],'| OVERALL',v['overall'],'|',v['headline']['text'])
    print('   ',' '.join(f"{c['id']}={c['status']}{'(w)' if c['severity']=='warning' else ''}" for c in v['checks']))
    for f in v['fix_list']:
        print(f"    fix#{f['priority']} {f['id']} [{f['severity']}, share {f['affected_share']}] {f['fix']}")
        if len(sys.argv)>2: print('        why:',f['why']); print('        impact:',f['impact'])
