#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §29 — Witnesses W-C1..W-C6. Issue: which of the 16 emission-fixable Level C rows did the emission changes really close, and which merely changed name? Reads the run's own logs and typed sheets. Exit code is not evidence.
# Usage: witness_level_c.py <outdir>
import sys,re,json,os
O=sys.argv[1]; rd=lambda n:open(os.path.join(O,'logs',n),encoding='utf-8').read()
L=rd('11_lib_probe.log'); E=rd('06_emit_dxf_p1.log'); S=rd('09b_section_emit.log'); I=rd('12_ifc_check.log')
BL=json.loads(re.search(r'§LIB blocking \d+ (\{.*\})',L).group(1)); TOTAL=int(re.search(r'§LIB blocking (\d+)',L).group(1)); ELS=json.loads(re.search(r'§LIB els \d+ (\{.*\})',L).group(1))
rows=lambda code:sum(v for k,v in BL.items() if k.startswith(code+'|')); cls=lambda c:sum(v for k,v in ELS.items() if k.endswith('/'+c))
d=open(os.path.join(O,'typed','plan.dxf')).read().split('\n'); ents=[]; i=0; on=False
while i<len(d)-1:
    if d[i]=='2' and d[i+1]=='ENTITIES': on=True
    if on and d[i]=='0' and d[i+1] in('LINE','ARC','TEXT','LWPOLYLINE','CIRCLE','DIMENSION'):
        j=i+2; g=[]
        while d[j]!='0': g.append((d[j],d[j+1])); j+=2
        ents.append((d[i+1],g,dict(g)))
    i+=2
arcs=[e for e in ents if e[0]=='ARC']; door=[e for e in arcs if e[2]['8']=='A-DOOR']; other=[e for e in arcs if e[2]['8']!='A-DOOR']
fails=0
def say(n,v,msg):
    global fails
    if v not in('PASS','FINDING'): fails+=1
    print('§WC',n,v,msg,flush=True)
# W-C1
if not arcs: say('W-C1','VACUOUS','no arcs in the plan')
else: say('W-C1','PASS' if len(door)==7 and len(other)==1 and rows('GAP:no_elevation_height')==0 else 'WRONG','door arcs %d (schedule 7), non-door arcs %d, total %d (drawn 8), no_elevation_height %d'%(len(door),len(other),len(arcs),rows('GAP:no_elevation_height')))
# W-C2
piers=[float(x) for x in re.findall(r'E2k hinge-side pier \(T junction\) added ([\d.]+)',E)]
oldok=all(any(abs(p-q)<.11 for p in piers) for q in (92.1,87.7,140.2)); new=[p for p in piers if 139<=p<=140.1 or 90<=p<=90.5]
r2=(rows('GAP:fill_no_void'),rows('GAP:opening_gap_unbounded'),rows('GAP:no_host_cut'))
say('W-C2','PASS' if r2==(0,0,0) and cls('IfcDoor')==7 and oldok and len(new)==2 and len(piers)==5 else 'WRONG','fill_no_void/unbounded/no_host_cut %s, IfcDoor %d, piers %s (old kept %s, new at B/3 and C/3 %s)'%(r2,cls('IfcDoor'),piers,oldok,new))
# W-C3
m=re.search(r'W-C3 grid bubbles read (\d+) of (\d+)',E); nb=int(m.group(1)) if m else 0
if nb==0: say('W-C3','VACUOUS','no bubble read from the sheet')
else:
    other_grid={k.split('|')[0]:v for k,v in BL.items() if 'grid_' in k and not k.startswith(('QF:grid_unlabelled','QF:grid_label_series','QF:grid_off_axis'))}
    good=nb==10 and rows('QF:grid_unlabelled')==0 and rows('QF:grid_label_series')==10 and not other_grid
    say('W-C3','FINDING' if good else 'WRONG','bubbles %d/10, grid_unlabelled %d, grid_label_series %d, other grid rows %s: labels now READ; NET 0 rows, predicted: G2 wants numbers on constant-X, the drawing has letters; not relabelled'%(nb,rows('QF:grid_unlabelled'),rows('QF:grid_label_series'),other_grid))
# W-C4
cen=[float(c) for c in re.findall(r"W-C4 column rect .*?centre \([-\d.]+, ([-\d.]+)\)",E)]; on1=[c for c in cen if abs(c+8500)<=10]
if not cen: say('W-C4','VACUOUS','no column rect emitted')
else: say('W-C4','PASS' if rows('QF:grid_off_axis')==0 and len(on1)==2 else 'WRONG','grid_off_axis %d, column centres on grid 1 within 10 mm: %s of %s'%(rows('QF:grid_off_axis'),on1,cen))
# W-C5
dep=re.findall(r'W-C5 (A-A|B-B) .*?depth mm ([\d.]+) vs drawn (\d+) (PASS|WRONG)',S); sb=re.search(r"IfcSlab facesets (\d+) \[[-\d.]+, [-\d.]+, ([-\d.]+)\] \[[-\d.]+, [-\d.]+, ([-\d.]+)\]",I)
if len(dep)<2: say('W-C5','VACUOUS','sections judged: %s'%dep)
else:
    z=(float(sb.group(2)),float(sb.group(3))) if sb else None
    say('W-C5','PASS' if all(x[3]=='PASS' for x in dep) and rows('GAP:slab_no_underside')==0 and cls('IfcSlab')==1 and z==(0.0,0.15) else 'WRONG','depths %s, slab_no_underside %d, IfcSlab %d, DIRECT z %s (floor build-up, YELLOW; structure is Engr\'s detail, note G1)'%([(a,b) for a,b,_,_ in dep],rows('GAP:slab_no_underside'),cls('IfcSlab'),z))
# W-C6
wb=re.search(r"IfcWall facesets \d+ (\[.*?\]) (\[.*?\])",I); wall=(json.loads(wb.group(1)),json.loads(wb.group(2))) if wb else None
BASE=82
if TOTAL>=BASE: say('W-C6','NO-OP','blocking %d, baseline %d'%(TOTAL,BASE))
else: say('W-C6','PASS' if wall==([-0.05,-6.25,0.15],[9.95,0.05,3.15]) else 'WRONG','blocking %d (was %d), wall DIRECT bbox %s, elements %s'%(TOTAL,BASE,wall,ELS))
print('§WC remaining rows',json.dumps(BL)); print('§WC RESULT','fails',fails,'(FINDING = read correctly, row stands as a true fact about the drawing)')
