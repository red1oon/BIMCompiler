import json,sys,statistics as st
for f in sys.argv[1:]:
    try: line=[l for l in open(f,errors='ignore') if l.startswith('§LEAK_GRID')][0]
    except IndexError: print(f,'NO GRID'); continue
    j=json.loads(line.split(' ',1)[1]); g=[r for r in j['rows'] if r['k']=='floor']
    oom=sum(1 for l in open(f,errors='ignore') if 'Uncaptured WebGPU' in l)
    bb=[r for r in g if r['Lf']>=200 and r['sunOpaqueAt'] is not None]; lit=[r for r in g if r['sunOpaqueAt'] is None and r['NdotSun']>0]
    print(f.split('/')[-1],'oom',oom,'floor',len(g),'bright+blocked',len(bb),'sunReach',len(lit),'floor median',st.median([r['Lf'] for r in g]) if g else '-')
