#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §23 — maps our PDF-*/ELEV-* layers to the importer's STD layer scheme, writes the roof sheet, adds the typed markings.
# Usage: to_std.py <plan.dxf(marked)> <elevdir> <rosetta.json> <outdir>
import sys,os,json,glob
plan,elevdir,rj,out=sys.argv[1:5]; R=json.load(open(rj)); os.makedirs(out,exist_ok=True)
LAY={'PDF-WALL':'A-WALL-FULL','PDF-WINDOW':'A-GLAZ','PDF-DOOR-SWING':'A-DOOR','PDF-COLUMN':'A-COLS','PDF-GRID':'A-GRID','PDF-TAG':'A-ANNO-NOTE','PDF-FIXTURE-ARC':'A-ANNO-NOTE',
     'ELEV-WALL':'A-WALL','ELEV-GLAZING':'A-GLAZ','ELEV-DOOR':'A-DOOR','ELEV-LEVEL':'A-ANNO-LEVL','ELEV-DIM':'A-ANNO-DIMS','ELEV-GRID':'A-GRID'}
def conv(src,marks,extra=None):
    d=open(src).read().split('\n'); i=0
    while i<len(d)-1:
        if d[i]=='8' and d[i+1] in LAY: d[i+1]=LAY[d[i+1]]
        i+=2
    j=max(k for k in range(len(d)-1) if d[k]=='ENDSEC' and d[k-1]=='0'); M=[]
    for n,m in enumerate(marks):
        if isinstance(m,tuple): M+=['0','TEXT','8','DXF2BIM-MARK','10',str(round(m[1],1)),'20',str(round(m[2],1)),'30','0','40','150','1',m[0]+' @BY=model']   # position-bound mark (@TAG at the opening's plan bbox centre)
        else: M+=['0','TEXT','8','DXF2BIM-MARK','10','-3000','20',str(-2500-300*n),'30','0','40','150','1',m+' @BY=user']
    return d[:j-1]+(extra or [])+M+d[j-1:]
gx=R['grid']['x']; W=gx['E']; H=R['grid']['y']['1']; ov=700   # eaves 700 per roof plan p3 (sections say 750: drafter inconsistency, yellow)
top_z=3.15+1.722   # beam level (3.15 m above ground) + 1722 mm (section A-A dimension)
def dim(p1,p2,anchor,rot,text): return ['0','DIMENSION','8','A-ANNO-DIMS','10',str(anchor[0]),'20',str(anchor[1]),'30','0','13',str(p1[0]),'23',str(p1[1]),'33','0','14',str(p2[0]),'24',str(p2[1]),'34','0','70','0','50',str(rot),'1',str(text)]
gy=R['grid']['y']; PD=[]
# plan dimension strings AS DRAWN on sheet 1 (values read in §17, checked by rosetta_verify G1): north chain above the plan, west chain left of it
for a,b,off in (('A','B',1),('A','C',2),('C','D',1),('D','E',1),('A','E',3)): PD+=dim((gx[a],0),(gx[b],0),((gx[a]+gx[b])/2,900+off*450),0,gx[b]-gx[a])
for a,b,off in (('5','4',1),('4','3',1),('5','3',2),('3','2',1),('2','1',1),('5','1',3)): PD+=dim((0,-gy[a]),(0,-gy[b]),(-900-off*450,-(gy[a]+gy[b])/2),90,gy[b]-gy[a])
# @TAG marks: family per opening (JSON library_binding); each opening takes the class of its NEAREST plan tag text (D#/W#)
import re,math
pl=open(plan).read().split('\n'); ents=[];i=0;inent=False
while i<len(pl)-1:
    if pl[i]=='2' and pl[i+1]=='ENTITIES': inent=True
    if inent and pl[i]=='0' and pl[i+1] in('LINE','ARC','TEXT'):
        ty=pl[i+1];g=[];j=i+2
        while pl[j]!='0': g.append((pl[j],pl[j+1])); j+=2
        ents.append((ty,dict(g)))
    i+=2
tags=[(float(d['10']),float(d['20']),d['1']) for ty,d in ents if ty=='TEXT' and d.get('8')=='PDF-TAG']
LB=R['library_binding']; TG=[]
def nearest(x,y,kinds):
    c=[t for t in tags if t[2][0] in kinds]; return min(c,key=lambda t:math.hypot(t[0]-x,t[1]-y))
# windows: 4 LINEs per rectangle on layer PDF-WINDOW, in order
wl=[tuple(float(d[k]) for k in ('10','20','11','21')) for ty,d in ents if ty=='LINE' and d.get('8')=='PDF-WINDOW']
for q in range(0,len(wl),4):
    xs=[v for a in wl[q:q+4] for v in (a[0],a[2])]; ys=[v for a in wl[q:q+4] for v in (a[1],a[3])]; cx,cy=(min(xs)+max(xs))/2,(min(ys)+max(ys))/2
    wide=max(max(xs)-min(xs),max(ys)-min(ys)); cls_={600:'W3',1200:'W2',1800:'W1'}[min((600,1200,1800),key=lambda w:abs(w-wide))]; t=(0,0,cls_); fam=LB[cls_]['family']   # class from the chain WIDTH = the schedule width (geometry, not the nearest text)
    # z = mid height above GROUND (m): floor level 0.15 + sill/head mid; high louvre W3 (sill 2000, head 2500) vs the others (sill 1000, head 2000)
    zmid=0.15+((2000+2500)/2 if t[2]=='W3' else (1000+2000)/2)/1000.0
    TG.append(('@TAG=window,%s'%fam,cx,cy))   # no z: tags are applied BEFORE elevation heights (dxf2bim_import l.391), a z would be tested against the config default sill; print('§PDF S2 window at',(round(cx),round(cy)),'width',round(wide),'nearest tag',t[2],'->',fam,'exact' if LB[t[2]]['exact'] else 'STAND-IN')
for ty,d in ents:
    if ty=='ARC' and d.get('8')=='PDF-DOOR-SWING':
        r=float(d['40'])
        if min(abs(r-(R['schedule_sizes_mm'][k][0]-off)) for k in ('D1','D2','D3') for off in (0,80))>25: print('§PDF S2 arc r',round(r),'is not a schedule door width (900/750, or the clear-opening radius 820/670): not tagged'); continue   # emit_dxf_p1 writes the schedule width as the leaf radius
        hx,hy=float(d['10']),float(d['20']); m=math.radians((float(d['50'])+((float(d['51'])-float(d['50']))%360)/2)); cx,cy=hx+r/2*round(math.sqrt(2)*math.cos(m)),hy+r/2*round(math.sqrt(2)*math.sin(m)); t=nearest(cx,cy,'D'); fam=LB[t[2]]['family']   # tag point = the swing's plan bbox centre
        TG.append(('@TAG=door,%s'%fam,cx,cy)); print('§PDF S2 door arc r',round(r),'at',(round(cx),round(cy)),'nearest tag',t[2],'->',fam,'exact' if LB[t[2]]['exact'] else 'STAND-IN')
SZ=R['schedule_sizes_mm']; SCH=['@SCHEDULE=%s,door,%d,%d'%(LB[k]['family'],SZ[k][0],SZ[k][1]) for k in ('D1','D2','D3')]   # the PDF's own door schedule (p8 text layer), keyed by the family label the @TAG gives each door
open(os.path.join(out,'plan.dxf'),'w').write('\n'.join(conv(plan,['@UNITS=mm','@SET=STD','@LEVEL=0.15']+SCH+TG,PD)))
for f in sorted(glob.glob(os.path.join(elevdir,'elev_*.dxf'))): open(os.path.join(out,os.path.basename(f)),'w').write('\n'.join(conv(f,['@SET=STD'])))
# roof sheet: main gable outline only (porch gable not drawn: yellow)
# the importer's roof outline must EQUAL the top storey's wall envelope (dxf2shell roofPlan: GAP:roof_outline_mismatch otherwise): eaves (700 on the roof plan, 750 on the sections) and the porch gable are beyond this lane's basic roof -> yellow, not drawn
WX=[];WY=[]
_g=[];_in=False;_i=0;_pl=open(plan).read().split('\n')
while _i<len(_pl)-1:
    if _pl[_i]=='2' and _pl[_i+1]=='ENTITIES': _in=True
    if _in and _pl[_i]=='0' and _pl[_i+1]=='LWPOLYLINE':
        _g=[];_j=_i+2
        while _pl[_j]!='0': _g.append((_pl[_j],_pl[_j+1])); _j+=2
        if dict(_g).get('8')=='PDF-WALL': WX+= [float(b) for a,b in _g if a=='10']; WY+=[float(b) for a,b in _g if a=='20']
    _i+=2
pts=[(min(WX),max(WY)),(max(WX),max(WY)),(max(WX),min(WY)),(min(WX),min(WY))]
poly=['0','LWPOLYLINE','8','A-ROOF','90',str(len(pts)),'70','1']+sum([['10',str(x),'20',str(y)] for x,y in pts],[])
rf=['0','SECTION','2','ENTITIES']+poly+['0','ENDSEC','0','EOF']
mk=['@UNITS=mm','@SET=STD','@VIEW=ROOF','@NAME=ROOF PLAN','@LEVEL=3.15','@ROOF=%s'%round(top_z,3)]
for k,v in gx.items(): mk.append('@GRIDX=%s'%k)
M=[]
for n,m in enumerate(mk):
    x=-3000 if not m.startswith('@GRIDX') else gx[m.split('=')[1]]; y=-2500-300*n if not m.startswith('@GRIDX') else 600
    M+=['0','TEXT','8','DXF2BIM-MARK','10',str(x),'20',str(y),'30','0','40','150','1',m+' @BY=user']
for k,v in R['grid']['y'].items(): M+=['0','TEXT','8','DXF2BIM-MARK','10','-600','20',str(-v),'30','0','40','150','1','@GRIDY=%s @BY=user'%k]
rf=rf[:-4]+M+rf[-4:]
open(os.path.join(out,'roof.dxf'),'w').write('\n'.join(rf)+'\n')
print('§PDF S1 wrote plan (+',len(PD)//21,'DIMENSIONs), elevations',len(glob.glob(os.path.join(out,'elev_*.dxf'))),', roof into',out,'| roof outline',pts,'LEVEL 3.15 ROOF',round(top_z,3))
