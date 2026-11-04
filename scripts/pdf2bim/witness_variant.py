#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §35 — judges one different-drawing run, from its logs and IFC. Issue: did the code pick out what differs and adjust, without touching the template or the dictionary? Run WITHOUT -I.
# Usage: witness_variant.py Z|B|H|S|NOFILL <outdir>
import sys,os,re,json,ifcopenshell
import ifcopenshell.util.placement as PL
M,O=sys.argv[1:3]; fails=0
def say(n,c,m):
    global fails
    if not c: fails+=1
    print('§V',M,n,'PASS' if c else 'WRONG',m,flush=True)
rd=lambda n:open(os.path.join(O,'logs',n),encoding='utf-8').read() if os.path.exists(os.path.join(O,'logs',n)) else ''
ifcf=os.path.join(O,'tbkltn_p1.ifc')
if not os.path.exists(ifcf): say('IFC',M=='NOFILL','no IFC written'); print('§V',M,'RESULT fails',fails); sys.exit(0)
f=ifcopenshell.open(ifcf)
def bb(c):
    p=[]
    for e in f.by_type(c):
        if not e.Representation: continue
        T=PL.get_local_placement(e.ObjectPlacement)
        for r in e.Representation.Representations:
            for it in r.Items:
                if it.is_a()=='IfcTriangulatedFaceSet':
                    for x,y,z in it.Coordinates.CoordList: p.append(tuple(float(T[i][0]*x+T[i][1]*y+T[i][2]*z+T[i][3]) for i in range(3)))
    return ([round(min(q[i] for q in p),3) for i in range(3)],[round(max(q[i] for q in p),3) for i in range(3)]) if p else (None,None)
W=bb('IfcWall'); Rf=bb('IfcRoof'); n=len([e for e in f.by_type('IfcProduct') if e.Representation]); fl=rd('00_fill_blanks.log')+rd('03b_infer_type.log')+rd('08_elev_emit.log')
st={m.group(1):(m.group(2),m.group(3)) for m in re.finditer(r'^§INFER (\S+) (READ|FINDING|DEFAULT) value (.+?) measured',fl,re.M)}
find={k:v[1] for k,v in st.items() if v[0]=='FINDING'}; dflt=[k for k,v in st.items() if v[0]=='DEFAULT']
print('§V',M,'walls',W,'roof',Rf,'products',n,'| FINDING',find,'DEFAULT',dflt,flush=True)
rl={m.group(1):m.group(2) for m in re.finditer(r'^§R (W-R\d) (\w+)',rd('16_witness_roof.log'),re.M)}; wl={m.group(1):m.group(2) for m in re.finditer(r'^§W (W-W\d) (\w+)',rd('16b_witness_windows.log'),re.M)}; print('§V',M,'roof witnesses',rl,'window witnesses',wl,flush=True)
ver=re.search(r'§LIB accepted (\d+) .*?verdict (\S+)',rd('11_lib_probe.log')); blk=re.search(r'§LIB blocking (\d+)',rd('11_lib_probe.log')); print('§V',M,'verdict',ver.group(2) if ver else None,'blocking',blk.group(1) if blk else None,'accepted',ver.group(1) if ver else None,flush=True)
ok_v=ver and ver.group(2)=='qualifies' and n==72
win=wl.get('W-W1')=='PASS' and wl.get('W-W2')=='PASS'
if M in('Z','S'):
    say('V1 no dimension differs: every one READ (S: K differs, and only K)',set(find)==({'K'} if M=='S' else set()) and not dflt,'FINDING %s DEFAULT %s'%(find,dflt))
    say('V2 the same house within 10 mm',W[1] and abs(W[1][0]-9.95)<=.01 and abs(W[0][1]+8.55)<=.01 and abs(W[1][2]-4.847)<=.02 and abs(Rf[1][0]-10.65)<=.01 and abs(Rf[1][2]-4.872)<=.01,'walls %s roof %s'%(W,Rf))
    say('V3 it qualifies with 72 elements, windows in their holes',ok_v and win,'')
    if M=='S':
        k=re.search(r'§INFER K \w+ value ([\d.]+)',fl); say('V4 K read at the new scale',k and abs(float(k.group(1))-35.87/.9)<=.15,'K %s (35.87/0.9 = %.2f)'%(k and k.group(1),35.87/.9))
if M=='B':
    say('V1 the one changed dimension is found, and only it',find=={'grid_x_E':'10500'},str(find))
    say('V2 the model follows: walls to 10.55, roof to 11.25',W[1] and abs(W[1][0]-10.55)<=.01 and abs(Rf[1][0]-11.25)<=.01,'walls %s roof %s'%(W,Rf))
    say('V3 it qualifies with 72 elements, windows still in their holes',ok_v and win,'')
    say('V4 roof form holds: planes, pitch, no wall through it (W-R2 holds this drawing\'s literal 10.65)',all(rl.get(k)=='PASS' for k in('W-R1','W-R3','W-R5','W-R6','W-R7','W-R8','W-R9')),str(rl))
if M=='H':
    say('V1 the one changed dimension is found, and only it',find=={'beam_above_ffl':'3300'},str(find))
    say('V2 the model follows: wall top 3.45, ridge 5.172',W[1] and abs(W[1][2]-5.147)<=.02 and abs(Rf[1][2]-5.172)<=.01,'walls %s roof %s'%(W,Rf))
    say('V3 it qualifies with 72 elements, windows still in their holes',ok_v and win,'')
    say('V4 no wall through the roof, pitch holds',rl.get('W-R3')=='PASS' and rl.get('W-R5')=='PASS' and rl.get('W-R8')=='PASS',str(rl))
if M=='NOFILL':
    # the falsifier: B's drawing with the dictionary's fixed grid must NOT give B's house
    right=bool(W[1] and Rf[1] and abs(W[1][0]-10.55)<=.01 and abs(Rf[1][0]-11.25)<=.01 and ok_v and win)
    say('F without fill_blanks the wider bay is not built',not right,'walls %s roof %s verdict %s'%(W,Rf,ver and ver.group(2)))
print('§V',M,'RESULT fails',fails)
