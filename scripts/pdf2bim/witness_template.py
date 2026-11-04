#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §33 — W-T1 (every blank filled, with a status), W-T2 (the typed numbers are gone). W-T3..T6 need other runs: witness_ruler.sh.
# Usage: witness_template.py <outdir> <template.json>
import sys,os,re,json,collections
O,tj=sys.argv[1:3]; T=json.load(open(tj)); fails=0; here=os.path.dirname(os.path.abspath(__file__))
def say(n,v,m):
    global fails
    if v!='PASS': fails+=1
    print('§T',n,v,m,flush=True)
rec=collections.defaultdict(list)
for lg in ('03b_infer_type.log','08_elev_emit.log'):
    p=os.path.join(O,'logs',lg)
    if os.path.exists(p):
        for m in re.finditer(r'^§INFER (\S+) (READ|FINDING|DEFAULT) value (\S+) measured (\S+)',open(p,encoding='utf-8').read(),re.M): rec[m.group(1)].append((m.group(2),m.group(3),m.group(4)))
want=[k for k in T['blanks']]; miss=[k for k in want if not rec[k]]
if not any(rec.values()): say('W-T1','VACUOUS','no §INFER record in the logs')
elif miss: say('W-T1','WRONG','blanks with no record: %s'%miss)
else: say('W-T1','PASS','%d blanks, %d records, by status %s'%(len(want),sum(map(len,rec.values())),dict(collections.Counter(r[0] for v in rec.values() for r in v))))
for k in want: print('§T   blank',k,collections.Counter(r[0] for r in rec[k]).most_common(),'measured',[r[2] for r in rec[k]][:4],flush=True)
g1=[l for l in open(os.path.join(O,'logs','02_rosetta_verify.log'),encoding='utf-8') if l.startswith('§PDF G1 ') and ('PASS' in l or 'WRONG' in l)]
say('W-T1b','VACUOUS' if not g1 else ('WRONG' if any('WRONG' in l for l in g1) else 'PASS'),'the grid labels fit the dictionary: %d G1 lines, %d WRONG'%(len(g1),sum('WRONG' in l for l in g1)))
# §39: a stage's own WRONG must reach a verdict. REAR's W-E1 said WRONG on the taller wall from §35 on, in a log nothing judged
own=[]
for lg in sorted(os.listdir(os.path.join(O,'logs'))):
    if re.match(r'(0\d|10|11)',lg): own+=[lg+': '+l[:110] for l in open(os.path.join(O,'logs',lg),encoding='utf-8') if re.search(r' WRONG\b',l)]
say('W-T1c','WRONG' if own else 'PASS','stages 00-11 say WRONG on %d lines %s'%(len(own),own[:3]))
# the literals the RESUME block names as typed by hand; comments are not code
SCAN={'roof_emit.py':['EAVE=750','4872','4865','4722','246.3','426.4','3250.3','6650.8','TW=100','0.05,3.15','words(3)','words(6)','300<a','340<a','cy>250'],
      'elev_emit.py':['246.3','426.4','251.8','168.4','156.5','160.0','285.6','423.4','3000+1722','4.872','3.15','0.15','60<=beam'],
      'to_std.py':['3.15','1.722','LEVEL=0.15'],'section_emit.py':['3.15','0.15','10.14','w[1]<100','y<150','y>250'],
      'emit_dxf_p1.py':['160<=','<=445','170<=','<=420','w[2]<100','w[1]<100',"'-f','1'"],'openings_p1.py':['160<=','<=445',"'-f','1'"],'walls_p1.py':['w[2]<100','w[1]<100',"'-f','1'",'!=3.0']}
found=[]; scanned=0
for fn,lits in SCAN.items():
    p=os.path.join(here,fn)
    if not os.path.exists(p): continue
    scanned+=1
    for i,l in enumerate(open(p,encoding='utf-8'),1):
        code=l.split('   #')[0]
        if code.lstrip().startswith('#'): continue
        found+=[(fn,i,x) for x in lits if x in code]
if not scanned: say('W-T2','NO-OP','none of the scanned scripts exists')
elif found: say('W-T2','WRONG','typed numbers still in the code: %s'%found[:12])
else: say('W-T2','PASS','%d scripts, %d literals, none found'%(scanned,sum(map(len,SCAN.values()))))
say('RESULT','PASS' if not fails else 'WRONG','fails %d'%fails)
