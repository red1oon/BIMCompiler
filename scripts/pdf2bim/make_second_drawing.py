#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §40 — a second low-cost drawing in another hand, written from its own table. A TEST INSTRUMENT: not a real drafter's set, never evidence about one. Output: the PDF, and <out>.truth.json, which only the witness reads.
# Usage: make_second_drawing.py <out.pdf>
import sys,json,math
out=sys.argv[1]; SCALE=75; K=SCALE*25.4/72; PW,PH=1191,842
GX=dict(A=0,B=1500,C=3300,D=7200,E=10500); GY={'5':0,'4':1700,'3':3400,'2':6800,'1':9000}
TW=150; FFL=300; BEAM=2800; PITCH=30; EAVES=600; PEN_WALL=.5; PEN_THIN=.18; PEN_MID=.35; BUB=500
SZ=dict(D1=(1000,2100),D2=(900,2100),D3=(750,2100),W1=(1500,1200),W2=(1200,1200),W3=(600,600)); SILL=dict(W1=900,W2=900,W3=1800)
RUN=GY['3']+EAVES; RIDGE_ABOVE_BEAM=round(RUN*math.tan(math.radians(PITCH))+100)
PCOL=[GX['C']+150,GX['D']-150]; PORCH_FRONT=GY['1']+500; PSTEP=150; PHW=(PCOL[1]-PCOL[0])/2+300; PAPEX=BEAM+RIDGE_ABOVE_BEAM-RUN*math.tan(math.radians(PITCH))+PHW*math.tan(math.radians(PITCH))   # the porch's eave at the main eave
# openings: tag, axis ('x' = wall along X at y; 'y' = wall along Y at x), line, centre along the wall, room
OP=[('D1','x','2',GX['C']+1300),('D1','x','5',GX['B']+1700),('D2','x','3',GX['B']+900),('D2','y','D',GY['4']+800),('D2','y','D',GY['3']+800),('D3','y','B',850),('D3','y','B',GY['4']+850),
    ('W1','x','5',GX['C']+1950),('W2','x','2',1650),('W2','x','2',GX['D']-1000 if False else GX['C']+2900),('W2','x','2',GX['D']+1650),('W2','x','5',GX['D']+1650),('W3','x','5',750),('W3','y','A',GY['4']+850)]
ROOMS=[('TANDAS','A','B','5','4'),('BILIK MANDI','A','B','4','3'),('RUANG BASUH','B','C','4','3'),('DAPUR','B','D','5','4'),('RUANG MAKAN','C','D','4','3'),('BILIK 3','D','E','5','3'),('BILIK 2','D','E','3','2'),('BILIK UTAMA','A','C','3','2'),('RUANG TAMU','C','D','3','2')]
WALLS=[('x','5','A','E'),('x','2','A','E'),('x','3','A','C'),('x','3','D','E'),('x','4','A','B'),('y','A','5','2'),('y','E','5','2'),('y','B','5','3'),('y','D','5','2'),('y','C','3','2')]
class Pg:
    def __init__(s): s.c=['1 J 1 j']; s.lw=None
    def pen(s,w):
        if w!=s.lw: s.c.append('%.3f w'%w); s.lw=w
    def line(s,a,b,w=PEN_THIN,dash=None):
        s.pen(w)
        if dash: s.c.append('[%s] 0 d'%' '.join(str(d) for d in dash))
        s.c.append('%.3f %.3f m %.3f %.3f l S'%(a[0],PH-a[1],b[0],PH-b[1]))
        if dash: s.c.append('[] 0 d')
    def poly(s,p,w=PEN_THIN,close=True):
        s.pen(w); o=['%.3f %.3f m'%(p[0][0],PH-p[0][1])]+['%.3f %.3f l'%(q[0],PH-q[1]) for q in p[1:]]; s.c.append(' '.join(o)+(' h S' if close else ' S'))
    def rect(s,x0,y0,x1,y1,w=PEN_THIN): s.poly([(x0,y0),(x1,y0),(x1,y1),(x0,y1)],w)
    def arc(s,cx,cy,r,a0,a1,w=PEN_THIN):
        s.pen(w); n=max(1,round(abs(a1-a0)/90)); da=math.radians((a1-a0)/n); k=4/3*math.tan(da/4); o=[]
        for i in range(n):
            t0=math.radians(a0)+i*da; t1=t0+da; p0=(cx+r*math.cos(t0),cy+r*math.sin(t0)); p3=(cx+r*math.cos(t1),cy+r*math.sin(t1)); p1=(p0[0]-k*r*math.sin(t0),p0[1]+k*r*math.cos(t0)); p2=(p3[0]+k*r*math.sin(t1),p3[1]-k*r*math.cos(t1))
            if i==0: o.append('%.3f %.3f m'%(p0[0],PH-p0[1]))
            o.append('%.3f %.3f %.3f %.3f %.3f %.3f c'%(p1[0],PH-p1[1],p2[0],PH-p2[1],p3[0],PH-p3[1]))
        s.c.append(' '.join(o)+' S')
    def circle(s,cx,cy,r,w=PEN_THIN): s.arc(cx,cy,r,0,360,w)
    def text(s,t,x,y,sz=8,centre=True):
        ww=len(t)*sz*.5 if centre else 0; s.c.append('BT /F1 %.2f Tf %.3f %.3f Td (%s) Tj ET'%(sz,x-ww/2,PH-y-sz*.35 if centre else PH-y,t.replace('(','\\(').replace(')','\\)')))
def bubble(p,x,y,t): p.circle(x,y,BUB/K,.25); p.text(t,x,y,9)
def grid(p,X,Y):
    x0,x1=X(0),X(GX['E']); y0,y1=Y(0),Y(GY['1']); m=1400/K
    for k,v in GX.items(): p.line((X(v),y0-m),(X(v),y1+m/2),PEN_THIN,(8,2,1,2)); bubble(p,X(v),y0-m-BUB/K,k)
    for k,v in GY.items(): p.line((x0-m,Y(v)),(x1+m/2,Y(v)),PEN_THIN,(8,2,1,2)); bubble(p,x0-m-BUB/K,Y(v),k)
def title(p,t,no):
    p.rect(30,30,PW-30,PH-30,.5); p.text('LOW COST HOUSE TYPE B',PW-200,PH-90,9); p.text(t,PW-200,PH-70,8); p.text('SHEET '+no,PW-200,PH-50,8); p.text('SCALE 1:%d'%SCALE,PW-200,PH-110,8)
def opening_on(line,axis):
    return [o for o in OP if o[1]==axis and o[2]==line]
def plan():
    p=Pg(); X0,Y0=170,170; X=lambda v:X0+v/K; Y=lambda v:Y0+v/K; grid(p,X,Y); h=TW/2
    for ax,l,a,b in WALLS:
        if ax=='x':
            ya=GY[l]; s,e=GX[a]-h,GX[b]+h; cuts=sorted((c-SZ[t][0]/2,c+SZ[t][0]/2) for t,_,_,c in opening_on(l,'x') if GX[a]<=c<=GX[b]); last=s
            for u,v in cuts+[(e,e)]:
                if u>last: p.line((X(last),Y(ya-h)),(X(u),Y(ya-h)),PEN_WALL); p.line((X(last),Y(ya+h)),(X(u),Y(ya+h)),PEN_WALL); p.line((X(u),Y(ya-h)),(X(u),Y(ya+h)),PEN_WALL)
                last=v
        else:
            xa=GX[l]; s,e=GY[a]-h,GY[b]+h; cuts=sorted((c-SZ[t][0]/2,c+SZ[t][0]/2) for t,_,_,c in opening_on(l,'y') if GY[a]<=c<=GY[b]); last=s
            for u,v in cuts+[(e,e)]:
                if u>last: p.line((X(xa-h),Y(last)),(X(xa-h),Y(u)),PEN_WALL); p.line((X(xa+h),Y(last)),(X(xa+h),Y(u)),PEN_WALL); p.line((X(xa-h),Y(u)),(X(xa+h),Y(u)),PEN_WALL)
                last=v
    for t,ax,l,c in OP:
        w=SZ[t][0]
        if t[0]=='W':
            if ax=='x':
                y=GY[l]; p.rect(X(c-w/2),Y(y-h),X(c+w/2),Y(y+h),PEN_MID); p.line((X(c-w/2),Y(y-25)),(X(c+w/2),Y(y-25)),PEN_THIN); p.line((X(c-w/2),Y(y+25)),(X(c+w/2),Y(y+25)),PEN_THIN); tx,ty=X(c),Y(y-420 if l=='5' else y+420)
            else:
                x=GX[l]; p.rect(X(x-h),Y(c-w/2),X(x+h),Y(c+w/2),PEN_MID); p.line((X(x-25),Y(c-w/2)),(X(x-25),Y(c+w/2)),PEN_THIN); p.line((X(x+25),Y(c-w/2)),(X(x+25),Y(c+w/2)),PEN_THIN); tx,ty=X(x-420),Y(c)
        else:
            if ax=='x':
                y=GY[l]; hx=c-w/2; sgn=1 if l=='5' else -1; p.line((X(hx),Y(y)),(X(hx),Y(y+sgn*w)),PEN_MID); a0=0 if sgn>0 else -90; p.arc(X(hx),Y(y),w/K,a0,a0+90,PEN_MID); tx,ty=X(c+100),Y(y+sgn*420)
            else:
                x=GX[l]; hy=c-w/2; sgn=1 if l=='D' else -1 if False else 1; p.line((X(x),Y(hy)),(X(x+sgn*w),Y(hy)),PEN_MID); p.arc(X(x),Y(hy),w/K,0,90,PEN_MID); tx,ty=X(x+420),Y(c+100)
        p.circle(tx,ty,180/K,.18); p.text(t,tx,ty,6)
    for n,a,b,c,d in ROOMS:
        cx,cy=(GX[a]+GX[b])/2,(GY[c]+GY[d])/2; ar=(GX[b]-GX[a])*(GY[d]-GY[c])/1e6; p.text(n,X(cx),Y(cy-120),7); p.text('%.2f m2'%ar,X(cx),Y(cy+120),6)
    cx,cy=(GX['C']+GX['D'])/2,(GY['2']+GY['1'])/2; p.text('ANJUNG',X(cx),Y(cy-120),7); p.text('%.2f m2'%((PCOL[1]-PCOL[0])*(GY['1']-GY['2'])/1e6),X(cx),Y(cy+120),6)
    for x in PCOL:
        p.rect(X(x-100),Y(GY['1']-100),X(x+100),Y(GY['1']+100),PEN_WALL); p.circle(X(x+450),Y(GY['1']+350),180/K,.18); p.text('C1',X(x+450),Y(GY['1']+350),6)
    p.line((X(PCOL[0]-150),Y(PORCH_FRONT-200)),(X(PCOL[1]+150),Y(PORCH_FRONT-200)),PEN_MID)
    for k,yy in (('A',(GY['4']+GY['3'])/2+500),):
        p.circle(X(-2600),Y(yy),400/K,.25); p.text(k,X(-2600),Y(yy),9); p.circle(X(GX['E']+1400),Y(yy),400/K,.25); p.text(k,X(GX['E']+1400),Y(yy),9)
    p.text('FLOOR PLAN',X(3000),Y(GY['1']+1900),12); p.text('scale 1:%d'%SCALE,X(3000),Y(GY['1']+2400),9); title(p,'FLOOR PLAN','1/8'); return p
def simple_plan(t,no):
    p=Pg(); X0,Y0=170,170; X=lambda v:X0+v/K; Y=lambda v:Y0+v/K; grid(p,X,Y)
    for ax,l,a,b in WALLS:
        if ax=='x': p.line((X(GX[a]),Y(GY[l])),(X(GX[b]),Y(GY[l])),PEN_THIN)
        else: p.line((X(GX[l]),Y(GY[a])),(X(GX[l]),Y(GY[b])),PEN_THIN)
    p.text(t,X(3000),Y(GY['1']+1900),12); title(p,t,no); return p
def roofplan():
    p=simple_plan('ROOF PLAN','3/8'); X0,Y0=170,170; X=lambda v:X0+v/K; Y=lambda v:Y0+v/K; x0,x1=-EAVES,GX['E']+EAVES; y0,y1=-EAVES,GY['2']+EAVES; a,b=PCOL[0]-300,PCOL[1]+300; f=PORCH_FRONT
    p.poly([(X(x0),Y(y0)),(X(x1),Y(y0)),(X(x1),Y(y1)),(X(b),Y(y1)),(X(b),Y(f)),(X(a),Y(f)),(X(a),Y(y1)),(X(x0),Y(y1))],PEN_MID)
    p.line((X(x0),Y(GY['3'])),(X(x1),Y(GY['3'])),PEN_MID,(6,3)); pc=(a+b)/2; p.line((X(pc),Y(f)),(X(pc),Y(y1-(b-a)/2)),PEN_MID,(6,3)); p.line((X(a),Y(y1)),(X(pc),Y(y1-(b-a)/2)),PEN_MID); p.line((X(b),Y(y1)),(X(pc),Y(y1-(b-a)/2)),PEN_MID); p.text('%d DEG'%PITCH,X(2000),Y(1500),8); return p
def elev(p,name,ox,fl,face):
    Z=lambda z:fl-z/K; xw=GX['E'] if face in('F','R') else GY['2']; XV=lambda v:ox+v/K; lab=GX if face in('F','R') else GY; order=list(lab)
    for z,w in ((-FFL,PEN_WALL),(0,PEN_MID),(BEAM,PEN_MID)): p.line((XV(-2000),Z(z)),(XV(xw+2000),Z(z)),w)
    p.line((XV(0),Z(-FFL)),(XV(0),Z(BEAM)),PEN_MID); p.line((XV(xw),Z(-FFL)),(XV(xw),Z(BEAM)),PEN_MID); ridge=BEAM+RIDGE_ABOVE_BEAM; tan=math.tan(math.radians(PITCH))
    if face in('F','R'):
        p.line((XV(-EAVES),Z(ridge-RUN*tan+0)),(XV(xw+EAVES),Z(ridge-RUN*tan+0)),PEN_MID); p.line((XV(-EAVES),Z(ridge)),(XV(xw+EAVES),Z(ridge)),PEN_MID); p.line((XV(-EAVES),Z(ridge-RUN*tan)),(XV(-EAVES),Z(ridge)),PEN_MID); p.line((XV(xw+EAVES),Z(ridge-RUN*tan)),(XV(xw+EAVES),Z(ridge)),PEN_MID)
    else:
        m=GY['3']; p.line((XV(-EAVES),Z(ridge-RUN*tan)),(XV(m),Z(ridge)),PEN_MID); p.line((XV(xw+EAVES),Z(ridge-RUN*tan)),(XV(m),Z(ridge)),PEN_MID)
    for k in order:
        v=lab[k]; xx=XV(xw-v if face=='S+' else v); p.line((xx,Z(-FFL-300)),(xx,Z(ridge+500)),PEN_THIN,(8,2,1,2)); bubble(p,xx,Z(ridge+500)-BUB/K,k)
    p.text(name,XV(xw/2),Z(-1100),11)
def elevations(faces,no):
    p=Pg(); rows=[('REAR','R',300),('FRONT','F',660)] if faces=='FR' else [('RIGHT','S+',300),('LEFT','S',660)]
    for nm,fc,fl in rows:
        ox=230; elev(p,nm+' ELEVATION',ox,fl,fc); Z=lambda z:fl-z/K; XV=lambda v:ox+v/K
        for t,ax,l,c in OP:
            if nm=='FRONT' and ax=='x' and l=='2': u=c
            elif nm=='REAR' and ax=='x' and l=='5': u=GX['E']-c
            elif nm=='LEFT' and ax=='y' and l=='A': u=c
            elif nm=='RIGHT' and ax=='y' and l=='E': u=GY['2']-c
            else: continue
            w,h=SZ[t]
            if t[0]=='W':
                s=SILL[t]; p.rect(XV(u-w/2),Z(s),XV(u+w/2),Z(s+h),PEN_MID); p.line((XV(u),Z(s)),(XV(u),Z(s+h)),PEN_THIN)
            else:
                p.line((XV(u-w/2),Z(0)),(XV(u-w/2),Z(h)),PEN_MID); p.line((XV(u+w/2),Z(0)),(XV(u+w/2),Z(h)),PEN_MID); p.line((XV(u-w/2),Z(h)),(XV(u+w/2),Z(h)),PEN_MID); p.line((XV(u-w/2+50),Z(0)),(XV(u-w/2+50),Z(h-50)),PEN_THIN); p.line((XV(u+w/2-50),Z(0)),(XV(u+w/2-50),Z(h-50)),PEN_THIN); p.line((XV(u-w/2+50),Z(h-50)),(XV(u+w/2-50),Z(h-50)),PEN_THIN)
        if nm=='FRONT':
            for x in PCOL: p.rect(XV(x-100),Z(-PSTEP),XV(x+100),Z(BEAM),PEN_MID)
            pc=(PCOL[0]+PCOL[1])/2; hw=(PCOL[1]-PCOL[0])/2+300; p.line((XV(pc-hw),Z(PAPEX-hw*math.tan(math.radians(PITCH)))),(XV(pc),Z(PAPEX)),PEN_MID); p.line((XV(pc+hw),Z(PAPEX-hw*math.tan(math.radians(PITCH)))),(XV(pc),Z(PAPEX)),PEN_MID); p.line((XV(PCOL[0]-150),Z(-PSTEP)),(XV(PCOL[1]+150),Z(-PSTEP)),PEN_MID)
    title(p,'ELEVATIONS',no); return p
def sections():
    p=Pg()
    for nm,fl,lab,w in (('SECTION A-A',300,GX,GX['E']),('SECTION B-B',660,GY,GY['1'])):
        ox=230; Z=lambda z:fl-z/K; XV=lambda v:ox+v/K
        for z,pw in ((-FFL,PEN_WALL),(0,PEN_MID),(BEAM,PEN_MID)): p.line((XV(-2000),Z(z)),(XV(w+2000),Z(z)),pw)
        ridge=BEAM+RIDGE_ABOVE_BEAM; tan=math.tan(math.radians(PITCH))
        if lab is GY:
            m=GY['3']; e=GY['2']+EAVES; p.line((XV(-EAVES),Z(ridge-RUN*tan)),(XV(m),Z(ridge)),PEN_MID); p.line((XV(e),Z(ridge-RUN*tan)),(XV(m),Z(ridge)),PEN_MID); p.line((XV(GY['2']+TW/2),Z(-PSTEP)),(XV(GY['1']-100+100),Z(-PSTEP)),PEN_MID)
        for k,v in lab.items(): p.line((XV(v),Z(-FFL-300)),(XV(v),Z(ridge+500)),PEN_THIN,(8,2,1,2)); bubble(p,XV(v),Z(ridge+500)-BUB/K,k)
        p.text(nm,XV(w/2),Z(-1100),11)
    title(p,'SECTIONS','6/8'); return p
def schedule():
    p=Pg(); title(p,'SCHEDULE','8/8'); y=120
    for refs,typ,loc,un in ((('D1','D2','D3'),('Timber door metal frame','Flush door','Flush door'),('Ruang Tamu & Dapur','Bilik Utama, Bilik 2 & Bilik 3','Bilik Mandi & Tandas'),(2,3,2)),(('W1','W2','W3'),('Alum. 2 panel sliding','Alum. 2 panel sliding','Alum. top hung'),('Dapur','Ruang Tamu, Bilik Utama, Bilik 2 & Bilik 3','Tandas & Bilik Mandi'),(1,4,2))):
        for lab,vals,dy in (('REFERENCES',refs,0),('TYPE',typ,25),('SIZE',['%dMM X %dMM'%SZ[r] for r in refs],50),('LOCATION',loc,75),('UNITS',['%d NOS'%u for u in un],100)):
            p.text(lab,80,y+dy,9,False)
            for i,v in enumerate(vals): p.text(str(v),240+i*260,y+dy,9,False)
        y+=220
    return p
pages=[plan(),simple_plan('ELECTRICAL LAYOUT','2/8'),roofplan(),elevations('FR','4/8'),elevations('SS','5/8'),sections(),simple_plan('PLUMBING LAYOUT','7/8'),schedule()]
objs=[];kids=[]
def add(s): objs.append(s); return len(objs)
font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); par=add('')
for p in pages:
    c='\n'.join(p.c); st=add('<< /Length %d >>\nstream\n%s\nendstream'%(len(c),c)); kids.append(add('<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %d %d] /Contents %d 0 R /Resources << /Font << /F1 %d 0 R >> >> >>'%(par,PW,PH,st,font)))
objs[par-1]='<< /Type /Pages /Kids [%s] /Count %d >>'%(' '.join('%d 0 R'%k for k in kids),len(kids)); root=add('<< /Type /Catalog /Pages %d 0 R >>'%par); o=b'%PDF-1.4\n'; xr=[]
for i,s in enumerate(objs,1): xr.append(len(o)); o+=('%d 0 obj\n%s\nendobj\n'%(i,s)).encode('latin-1')
x=len(o); o+=('xref\n0 %d\n0000000000 65535 f \n'%(len(objs)+1)).encode()+b''.join(('%010d 00000 n \n'%v).encode() for v in xr)+('trailer << /Size %d /Root %d 0 R >>\nstartxref\n%d\n%%%%EOF\n'%(len(objs)+1,root,x)).encode(); open(out,'wb').write(o)
json.dump(dict(K=K,grid_x=GX,grid_y=GY,wall=TW,ffl=FFL,beam=BEAM,pitch=PITCH,eaves=EAVES,ridge_above_beam=RIDGE_ABOVE_BEAM,sizes=SZ,sills=SILL,openings=OP,rooms=[(n,round((GX[b]-GX[a])*(GY[d]-GY[c])/1e6,2)) for n,a,b,c,d in ROOMS]),open(out+'.truth.json','w'))
print('§2D wrote',out,'pages',len(pages),'K',round(K,3),'ridge_above_beam',RIDGE_ABOVE_BEAM)
