#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §22/§24 — Witness: W-E1 (levels), W-E2/E3 (openings vs plan), W-E5 (W3 high window rule), W-E6 (dimension entities = drawn values)
# §33: views, beam lines and heights come from <inferred.json> (infer_type.py); orientation is the template's, presumed.
# Usage: elev_emit.py <p4.svg> <p5.svg> <plan.dxf> <rosetta.json> <outdir> <pdf> <inferred.json>
import re,sys,json,math,collections,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
svg4,svg5,plandxf,rj,out=sys.argv[1:6]; R=json.load(open(rj)); K=R['sheet']['mm_per_pt_fitted']; log=lambda *a:print('§PDF',*a,flush=True)
os.makedirs(out,exist_ok=True)
def load(f):
    s=open(f).read(); P=[]
    for m in re.finditer(r'<path ([^>]*?)/>',s):
        a=m.group(1)
        if 'stroke="' not in a: continue
        t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
        tk=re.findall(r'[MLC]|-?[\d.]+',re.search(r' d="([^"]*)"',a).group(1)); pts=[];i=0;c=None
        while i<len(tk):
            if tk[i] in 'MLC': c=tk[i];i+=1;continue
            n=3 if c=='C' else 1; x,y=map(float,tk[i+2*(n-1):i+2*n]); i+=2*n; pts.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
        P.append((pts,'C' in re.search(r' d="([^"]*)"',a).group(1)))
    return P
SHC={'p'+TT.page_of(f):load(f) for f in (svg4,svg5)}; SH={k:[p for p,c in v] for k,v in SHC.items()}
# §29 W-C3: each view's own grid bubbles = stroked circles (r >= 9 pt) holding a text-layer word, above that view's beam line (the plan's labels are now read, so dxf2qualify G2/elev_grid_missing wants them on every face)
PDF=sys.argv[6]; import subprocess
def bubbles(sheet,row):
    b=subprocess.run(['pdftotext','-f',sheet[1:],'-l',sheet[1:],'-bbox',PDF,'-'],capture_output=True,text=True,check=True).stdout
    WD=[(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',b)]; o={}
    for pts,cv in SHC[sheet]:
        if not cv or len(pts)<4 or math.dist(pts[0],pts[-1])>=.3: continue
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];wd=max(xs)-min(xs);ht=max(ys)-min(ys);cx=(min(xs)+max(xs))/2;cy=(min(ys)+max(ys))/2
        if abs(wd-ht)<.3 and wd/2>=9 and abs(cy-row)<=wd/2:
            for w in WD:
                if math.hypot(w[1]-cx,w[2]-cy)<=wd/2: o[w[0]]=(cx,cy,wd/2)
    return o
GX,GY=R['grid']['x'],R['grid']['y']; WID=GX['E']; DEP=GY['1']
I=json.load(open(sys.argv[7])); VAL=lambda k:I['values'][k]['value']; BH,FG,RH=VAL('beam_above_ffl'),VAL('ffl_above_ground'),VAL('ridge_above_beam'); BL=I['template']['blanks']
# ox = pt x of the first grid label as drawn, beam = pt y of the BEAM/CEILING line: read by infer_type.py; which view is which face is the template's, presumed (§33). Checked by W-E1
views={}
for n_ in ('FRONT','REAR','RIGHT','LEFT'):
    v_=I['views'][n_]; x_='X' in v_['haxis']
    views[n_]=dict(sheet='p%s'%v_['sheet'],ox=v_['ox'],beam=v_['beam'],label_row=v_['label_row'],face=v_['face'],haxis=v_['haxis'],kind='x' if x_ else 'y',width=WID if x_ else DEP,axis=('H',-GY[v_['axis']]) if x_ else ('V',GX[v_['axis']]))
def Hlines(P):
    H=collections.defaultdict(float)
    for p in P:
        for a,b in zip(p,p[1:]):
            if abs(a[1]-b[1])<.15 and abs(a[0]-b[0])>0: H[round((a[1]+b[1])/2,1)]+=abs(a[0]-b[0])
    return sorted(y for y,l in H.items() if l>=300)
for n,v in views.items():
    P=SH[v['sheet']]; lh=Hlines(P); ffl=v['beam']+BH/K; hit=[y for y in lh if abs(y-ffl)<.3]; gl=[y for y in lh if abs(y-(ffl+FG/K))<.3]; v['ffl']=ffl
    log('W-E1',n,'beam',v['beam'],'FFL expected',round(ffl,2),'found',hit,'ground expected',round(ffl+FG/K,2),'found',gl,'PASS' if hit and gl else 'WRONG')
# ---- plan entities from our own DXF
rd=open(plandxf).read().split('\n'); arcs=[]; PW=[]; PM=[]; i=0; ent=False
while i<len(rd)-1:
    if rd[i]=='2' and rd[i+1]=='ENTITIES': ent=True
    if ent and rd[i]=='0' and rd[i+1] in('ARC','LINE','LWPOLYLINE'):
        ty=rd[i+1]; g=[];j=i+2
        while rd[j]!='0': g.append((rd[j],rd[j+1])); j+=2
        d=dict(g); lay=d.get('8')
        if ty=='ARC' and lay=='PDF-DOOR-SWING': arcs.append(tuple(float(d[k]) for k in ('10','20','40','50','51')))
        if ty=='LINE' and lay=='PDF-WINDOW': PM.append(tuple(float(d[k]) for k in ('10','20','11','21')))
        if ty=='LWPOLYLINE' and lay=='PDF-WALL':
            xs=[float(b) for a,b in g if a=='10']; ys=[float(b) for a,b in g if a=='20']; PW.append((min(xs),min(ys),max(xs),max(ys)))
    i+=2
def wallruns(o,ac):   # merged wall runs along the axis (footprints that straddle it)
    iv=sorted((r[0],r[2]) if o=='H' else (r[1],r[3]) for r in PW if ((r[3]-r[1])<=110 and abs((r[1]+r[3])/2-ac)<=60 and o=='H') or ((r[2]-r[0])<=110 and abs((r[0]+r[2])/2-ac)<=60 and o=='V'))
    r_=[]
    for a,b in iv:
        if r_ and a<=r_[-1][1]+1: r_[-1][1]=max(r_[-1][1],b)
        else: r_.append([a,b])
    return r_
def planwin(v):   # plan window rectangles on this wall axis (one rectangle per chain, as emitted) -> (centre along the wall, width) in plan mm
    o,ac=v['axis']; ch={}
    for a,b,c,d in PM:
        if o=='H' and abs(b-d)<1 and abs((b+d)/2-ac)<=250 and abs(c-a)>200: ch[(round((a+c)/2),round(abs(c-a)))]=1
        if o=='V' and abs(a-c)<1 and abs((a+c)/2-ac)<=250 and abs(d-b)>200: ch[(round((b+d)/2),round(abs(d-b)))]=1
    return sorted(ch)
def xdraw(v,plan_c):    # plan coordinate along the wall -> position as drawn on this elevation (mm from the first grid label)
    h=v['haxis']; return {'+X':plan_c,'-X':WID-plan_c,'+Y':DEP+plan_c,'-Y':-plan_c}[h]
def slat_windows(v):
    P=SH[v['sheet']]; ax,ffl=v['ox'],v['ffl']; y0,y1=v['beam']+.5,ffl-.5; V=[]
    for p in P:
        for a,b in zip(p,p[1:]):
            if abs(a[0]-b[0])<.15 and 15<=abs(a[1]-b[1])<=65 and y0<=min(a[1],b[1]) and max(a[1],b[1])<=y1: V.append((a[0],min(a[1],b[1]),max(a[1],b[1])))
    V.sort(); cl=[]
    for x,a0,a1 in V:
        if cl and x-cl[-1]['x1']<=4.5 and abs(a0-cl[-1]['y0'])<=1.5 and abs(a1-cl[-1]['y1'])<=1.5: cl[-1]['x1']=x;cl[-1]['n']+=1
        else: cl.append({'x0':x,'x1':x,'y0':a0,'y1':a1,'n':1})
    cl=[c for c in cl if c['n']>=3]; Wn=[]
    for c in cl:
        if (c['y1']-c['y0'])*K>=950: Wn.append([c])
        elif Wn: Wn[-1].append(c)
    return [(round((g[0]['x0']-ax)*K),round((g[-1]['x1']-ax)*K),round((ffl-g[0]['y1'])*K),round((ffl-g[0]['y0'])*K)) for g in Wn]
def w3_measure(v,xc):   # does the sheet show the schedule's W3 frame centred at xc (drawn mm) with its vertical edges? returns (sill, head) or None
    wd3,ht3=R['schedule_sizes_mm']['W3']
    P=SH[v['sheet']]; ax,ffl=v['ox'],v['ffl']; best=None
    for p in P:
        for a,b in zip(p,p[1:]):
            if abs(a[0]-b[0])<.15 and abs(abs(a[1]-b[1])*K-ht3)<=30:
                for cx in (a[0],):
                    if abs((cx-ax)*K-(xc-wd3/2))<=40 or abs((cx-ax)*K-(xc+wd3/2))<=40: best=(round((ffl-max(a[1],b[1]))*K),round((ffl-min(a[1],b[1]))*K))
    return best
SZ=R['schedule_sizes_mm']
def lw(layer,pts): return ['0','LWPOLYLINE','8',layer,'90',str(len(pts)),'70','1']+sum([['10',str(x),'20',str(y)] for x,y in pts],[])
def tx(x,y,t,h=150): return ['0','TEXT','8','DXF2BIM-MARK','10',str(x),'20',str(y),'30','0','40',str(h),'1',t]
def dim(layer,p1,p2,anchor,rot,text): return ['0','DIMENSION','8',layer,'10',str(anchor[0]),'20',str(anchor[1]),'30','0','13',str(p1[0]),'23',str(p1[1]),'33','0','14',str(p2[0]),'24',str(p2[1]),'34','0','70','0','50',str(rot),'1',str(text)]
ROOF_TOP=BH+RH
def w3_z(m,where):   # §33 fill rule: the high window's sill and head, measured on this view (or None) against the ruler
    a=TT.decide('high_window_sill',m[0] if m else None,BL['high_window_sill'],where); b=TT.decide('high_window_head',m[1] if m else None,BL['high_window_head'],where); return a['value'],b['value']
for n,v in views.items():
    o,ac=v['axis']; pw=planwin(v); W=[]; Dr=[]
    if v['kind']=='x' and n in('FRONT','REAR'):
        W=[]
        for x0,x1,s_,h_ in slat_windows(v):
            # the elevation window IS the plan window (centres agree to 1-4 mm, W-E3): take the plan chain's exact extent so the importer's span match (snap tolerance) holds; sill/head stay as measured on the sheet
            m=[(c,w) for c,w in pw if abs(xdraw(v,c)-(x0+x1)/2)<=60 and abs(w-(x1-x0))<=120]
            if m: c,w=m[0]; xc=xdraw(v,c); W.append((round(xc-w/2),round(xc+w/2),s_,h_)); log('W-E3b',n,'snapped slat window',(x0,x1),'->',(round(xc-w/2),round(xc+w/2)),'(plan chain',round(c),w,')')
            else: W.append((x0,x1,s_,h_)); log('W-E3b',n,'slat window with NO plan chain (kept as measured)',(x0,x1))
        for c,w in pw:       # plan windows not drawn as slats = louvre W3 (600 mm): sill/head measured on the left elevation (§24), checked here
            xc=xdraw(v,c)
            if not any(abs((x0+x1)/2-xc)<=60 for x0,x1,_,_ in W) and w==SZ['W3'][0]:
                m=w3_measure(v,xc); log('W-E5',n,'plan W3 at drawn x',round(xc),'vector 500 mm frame edges measured (sill,head):',m); W.append((round(xc-w/2),round(xc+w/2))+w3_z(m,n))
        runs=wallruns(o,ac)
        for cx,cy,r,a0,a1 in arcs:
            if abs(cy-ac)<=250:
                ends=[(cx+r*math.cos(math.radians(a)),cy+r*math.sin(math.radians(a))) for a in (a0,a1)]
                e=min(ends,key=lambda q:abs(q[1]-ac)); lo,hi=sorted((cx,e[0])); mid=(lo+hi)/2
                inwin=any(c_-w_/2-1<=mid<=c_+w_/2+1 for c_,w_ in pw)            # a gap already taken by a window chain is not a door
                if not any(a<=mid<=b for a,b in runs) and not inwin: Dr.append((xdraw(v,mid),r))
    else:   # side elevations: plan windows on the wall axis (louvre W3), sill/head from the measured rule
        for c,w in pw:
            xc=xdraw(v,c); m=w3_measure(v,xc); log('W-E5',n,'plan window width',w,'at drawn x',round(xc),'vector 500 mm frame edges measured (sill,head):',m); W.append((round(xc-w/2),round(xc+w/2))+w3_z(m,n))
    log('W-E2',n,'windows (x0,x1,sill,head) as drawn',W,'doors (centre,width)',[(round(c),round(w)) for c,w in Dr])
    width=v['width']; z0,z1,ztop=0,BH,ROOF_TOP
    o_=['0','SECTION','2','ENTITIES']
    o_+=lw('ELEV-WALL',[(0,z0),(width,z0),(width,z1),(0,z1)])        # z0 = floor level: the wall reader needs the elevation wall to START at the plan level (dxf2elev applyWallHeights)
    for x0,x1,s,h in W: o_+=lw('ELEV-GLAZING',[(x0,s),(x1,s),(x1,h),(x0,h)])
    for c,wd in Dr: o_+=lw('ELEV-DOOR',[(c-wd/2,0),(c+wd/2,0),(c+wd/2,SZ['D1'][1]),(c-wd/2,SZ['D1'][1])])
    for z in (-FG,0,BH,ztop): o_+=['0','LINE','8','ELEV-LEVEL','10','-500','20',str(z),'30','0','11',str(width+500),'21',str(z),'31','0']
    # height DIMENSIONs = the values filled from the sheets (FFL-beam, ground-FFL, beam-roof top)
    for a,b,t in ((-FG,0,FG),(0,BH,BH),(BH,ztop,RH)): o_+=dim('ELEV-DIM',(-800,a),(-800,b),(-1000,(a+b)/2),90,t)
    o_+=tx(-3000,-1000,'@VIEW=ELEV @BY=user')+tx(-3000,-1300,'@FACE=%s @BY=user'%v['face'])+tx(-3000,-1600,'@HAXIS=%s @BY=user'%v['haxis'])+tx(-3000,-1900,'@UNITS=mm @BY=user')
    zr=(FG+ztop)/1000; o_+=tx(-3000,-2200,'@ROOF=%s @BY=user'%zr)+tx(-1500,-FG,'@Z=0 @BY=user')+tx(-1500,0,'@Z=%s @BY=user'%(FG/1000))+tx(-1500,BH,'@Z=%s @BY=user'%((FG+BH)/1000))+tx(-1500,ztop,'@Z=%s @BY=user'%zr)
    names=(list('ABCDE'),GX) if v['kind']=='x' else (list('12345'),GY)
    for k,gv in (GX if v['kind']=='x' else GY).items():
        xd=xdraw(v,gv if v['kind']=='x' else -gv); o_+=tx(xd,-600,'@GRIDH=%s @BY=user'%k)
    BB=bubbles(v['sheet'],v['label_row']); res={}   # a label not read stays absent (the qualifier then says so): nothing is synthesised. Position = the dictionary axis, as @GRIDH; REAR is drawn A..E left to right over mirrored content (§22), so its residual is taken against the drawn order
    for k,gv in (GX if v['kind']=='x' else GY).items():
        if k not in BB: continue
        xd=xdraw(v,gv if v['kind']=='x' else -gv); cx,cy,r_=BB[k]; zc=round((v['ffl']-cy)*K,1); rm=round(r_*K,1); drawn=(cx-v['ox'])*K; res[k]=round(drawn-(gv if n=='REAR' else xd),1)
        o_+=['0','LINE','8','ELEV-GRID','10',str(xd),'20',str(-FG),'30','0','11',str(xd),'21',str(zc-rm),'31','0']+['0','CIRCLE','8','ELEV-GRID','10',str(xd),'20',str(zc),'30','0','40',str(rm)]+['0','TEXT','8','ELEV-GRID','10',str(xd),'20',str(zc),'30','0','40','150','1',k]
    log('W-C3',n,'bubbles read',len(BB),'of',len(GX if v['kind']=='x' else GY),'residual drawn vs dictionary mm',res,'PASS' if res and max(abs(x) for x in res.values())<=30 else 'WRONG')
    o_+=['0','ENDSEC','0','EOF']; fn=os.path.join(out,'elev_%s.dxf'%n.lower()); open(fn,'w').write('\n'.join(o_)+'\n'); log('W-E4 wrote',fn)
