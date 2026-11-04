#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §35 — judges one different-drawing run, from its logs and IFC. Issue: did the code pick out what differs and adjust, without touching the template or the dictionary? Run WITHOUT -I.
# Usage: witness_variant.py Z|B|H|S|T|G|NOFILL|FR <outdir>   (FR: the §37 falsifier, on the reference outdir)
import sys,os,re,json,ifcopenshell
import ifcopenshell.util.placement as PL
M,O=sys.argv[1:3]; fails=0
S_=os.path.dirname(os.path.abspath(__file__))
def say(n,c,m):
    global fails
    if not c: fails+=1
    print('§V',M,n,'PASS' if c else 'WRONG',m,flush=True)
if M=='FR':
    # §37: the same IFC judged against values that are not this run's: the witness must say WRONG, or it only agrees with itself
    import json,subprocess,tempfile
    I=json.load(open(os.path.join(O,'inferred.json'))); I['values']['beam_above_ffl']['value']+=100; tf=tempfile.NamedTemporaryFile('w',suffix='.json',delete=False); json.dump(I,tf); tf.close()
    o=subprocess.run([sys.executable,os.path.join(S_,'witness_house_roof.py'),O,tf.name],capture_output=True,text=True).stdout; os.unlink(tf.name); v={m.group(1):m.group(2) for m in re.finditer(r'^§R (W-R\d) (\w+)',o,re.M)}
    say('F2 beam + 100 in the values, the same IFC: W-R1, W-R6, W-R9 say WRONG',all(v.get(k)=='WRONG' for k in('W-R1','W-R6','W-R9')),str(v)); print('§V',M,'RESULT fails',fails); sys.exit(0)
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
rm=[(a,b_,c,d) for a,b_,c,d in re.findall(r'^§ROOM (\w+) printed (\S+) cell (\S+) .*?\| (.+?) \|',rd('06b_read_rooms.log'),re.M)]; print('§V',M,'rooms',{k:sum(1 for r in rm if r[0]==k) for k in('READ','FINDING','DEFAULT')},'findings',[(r[3],r[1],r[2]) for r in rm if r[0]=='FINDING'],flush=True)
def rooms(want):
    "V5: exactly these rooms FINDING, with these printed values; every other READ"
    got={r[3]:(float(r[1]),float(r[2])) for r in rm if r[0]=='FINDING'}; say('V5 rooms: exactly the expected FINDINGs, the rest READ',got==want and sum(1 for r in rm if r[0]=='READ')==10-len(want),str(got))
def same_as_control():
    h=lambda d:re.search(r'hash (\S+)',open(os.path.join(d,'logs','18_geom_hash.log')).read()); a,b=h(os.path.join(os.path.dirname(O),'Z')),h(O); say('V6 tags only: the same geometry as the control Z',a and b and a.group(1)==b.group(1),'%s %s'%(a and a.group(1),b and b.group(1)))
if M in('Z','H','S'): rooms({})
if M=='B': rooms({'BILIK 3':(9.61,11.47),'BILIK 2':(9.61,11.47)})
if M=='T':
    rooms({'DAPUR':(11.47,8.25),'RUANG TAMU':(8.25,11.47)}); same_as_control()
    say('V7 it still qualifies with 72 elements',ok_v and win,'')
if M=='G':
    say('V5 another font: nothing READ, nothing guessed, every printed value null',len(rm)==10 and all(r[0]=='DEFAULT' and r[1]=='None' for r in rm),str([(r[3],r[0],r[1]) for r in rm])); same_as_control()
    a3=re.search(r'^§A W-A3 (\S+)',rd('06c_witness_rooms.log'),re.M); say('V8 W-A3 says NO-OP: nothing was judged',a3 and a3.group(1)=='NO-OP',a3 and a3.group(1))
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
    say('V4 every roof witness passes on this drawing\'s own values (§37)',len(rl)==9 and all(v=='PASS' for v in rl.values()),str(rl))
if M=='H':
    say('V1 the one changed dimension is found, and only it',find=={'beam_above_ffl':'3300'},str(find))
    say('V2 the model follows: wall top 3.45, ridge 5.172',W[1] and abs(W[1][2]-5.147)<=.02 and abs(Rf[1][2]-5.172)<=.01,'walls %s roof %s'%(W,Rf))
    say('V3 it qualifies with 72 elements, windows still in their holes',ok_v and win,'')
    say('V4 every roof witness passes on this drawing\'s own values (§37)',len(rl)==9 and all(v=='PASS' for v in rl.values()),str(rl))
if M=='NOFILL':
    # the falsifier: B's drawing with the dictionary's fixed grid must NOT give B's house
    right=bool(W[1] and Rf[1] and abs(W[1][0]-10.55)<=.01 and abs(Rf[1][0]-11.25)<=.01 and ok_v and win)
    say('F without fill_blanks the wider bay is not built',not right,'walls %s roof %s verdict %s'%(W,Rf,ver and ver.group(2)))
print('§V',M,'RESULT fails',fails)
