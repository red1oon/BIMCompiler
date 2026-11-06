# Plan-view of the REAL walker output (fp_placements.json) over the model's own element boxes, one storey. + steps card.
import sys,json,sqlite3
from PIL import Image,ImageDraw,ImageFont
OUT,DB,PJ=sys.argv[1:4]; STOREY=sys.argv[4]   # storey name exactly as in elements_meta.storey
BG=(11,15,23);CORAL=(255,107,120);OFF=(243,238,232);SKY=(125,211,252);GREY=(150,160,175)
FD='/usr/share/fonts/truetype/dejavu/'
def F(s,b=False,m=False): return ImageFont.truetype(FD+('DejaVuSansMono.ttf' if m else 'DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf'),s)
def canvas(): im=Image.new('RGB',(1920,1080),BG); return im,ImageDraw.Draw(im)
def ctext(d,y,t,f,c): w=d.textlength(t,font=f); d.text(((1920-w)/2,y),t,font=f,fill=c)
# chapter card
im,d=canvas(); ctext(d,300,'CHAPTER 8',F(34,True),CORAL); ctext(d,370,'Fire protection',F(110,True),OFF); ctext(d,510,'when the IFC has none',F(110,True),CORAL); ctext(d,700,'The Modeller walker injects it',F(40),GREY); im.save(f'{OUT}/c8.png')
J=json.load(open(PJ)); P=[p for p in J['placements'] if p['storey']==STOREY]
c=sqlite3.connect(DB)
rows=c.execute("select r.minX,r.maxX,r.minY,r.maxY from elements_meta m join elements_rtree r on r.id=m.rowid where m.storey=? and m.ifc_class in ('IfcWall','IfcWallStandardCase','IfcSlab','IfcColumn','IfcBeam')",(STOREY,)).fetchall()
xs=[r[0] for r in rows]+[r[1] for r in rows]+[p['x'] for p in P]; ys=[r[2] for r in rows]+[r[3] for r in rows]+[p['y'] for p in P]
x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys); W,H=1120,500; s=min(W/(x1-x0),H/(y1-y0))
def T(x,y): return (110+(x-x0)*s, 240+H-(y-y0)*s)
im,d=canvas(); d.text((110,70),'The walk, on this model',font=F(60,True),fill=OFF); d.text((112,150),f'One storey · plan view · every dot is one placement the walker returned',font=F(28),fill=SKY)
for r in rows:
    a=T(r[0],r[3]); b=T(r[1],r[2]); d.rectangle([a[0],a[1],b[0],b[1]],outline=(70,80,95),fill=(26,32,42))
ns=na=0
for p in P:
    px,py=T(p['x'],p['y']); 
    if p['ifc']=='IfcFireSuppressionTerminal': d.ellipse([px-4,py-4,px+4,py+4],fill=CORAL); ns+=1
    else: d.rectangle([px-5,py-5,px+5,py+5],fill=SKY); na+=1
# right panel: building-wide counts (from the same run)
hb=J['hostBind']; X=1330
d.text((X,260),'Whole building',font=F(34,True),fill=CORAL)
L=[(f"{J['placed']:,} placed",OFF,40),(f"{hb['floating']:,} sprinklers",CORAL,34),(f"   {hb['bound']} on a real ceiling",OFF,30),(f"   {hb['refused']:,} flagged, no ceiling",OFF,30),(f"{J['placed']-hb['floating']} alarms",SKY,34),(f"15 storeys walked",GREY,30)]
y=330
for t,c2,sz in L: d.text((X,y),t,font=F(sz),fill=c2); y+=62
d.text((X,y+30),f'This floor: {ns} sprinklers',font=F(28,True),fill=OFF); d.text((X,y+72),f'and {na} alarms',font=F(28,True),fill=OFF)
d.text((110,775),'Scratch copy of the model; the source file is not written.  Source: disc_walker.js dwWalk FP (§WALK-HOSTBIND)',font=F(24),fill=GREY)
im.save(f'{OUT}/fp1.png')
# steps card
im,d=canvas(); d.text((110,95),'How the walker decides',font=F(64,True),fill=OFF); d.text((112,185),'Nothing is invented: every value is read, measured or counted',font=F(30),fill=SKY)
S=[('1','Read the rooms, ceilings and envelope from the IFC'),('2','Look up the measured rule: class, density, host, size'),('3','Place:  density × floor area, inside the envelope'),('4','Bind to a real ceiling, or flag it. Count is kept'),('5','Write to the Modeller edit log, then out as IFC products')]
y=290
for n,t in S:
    d.ellipse([130,y,190,y+60],fill=CORAL); d.text((150,y+8),n,font=F(40,True),fill=BG); d.text((230,y+8),t,font=F(40),fill=OFF); y+=105
d.text((110,820),'Export path: bonsai_ifc.js writes IfcFireSuppressionTerminal as itself.  Built, not yet run on this model.',font=F(26),fill=GREY)
im.save(f'{OUT}/fp2.png'); im,d=canvas(); ctext(d,230,'STILL IMPROVING',F(34,True),CORAL); ctext(d,300,'The walker is not finished',F(84,True),OFF)
import textwrap
y=470
for t,c2,sz in [('We are still improving the walker as we speak,',OFF,46),('based on more information that accompanies the IFC.',OFF,46),('',OFF,30),('We welcome any contribution',SKY,50),('to make this engine better.',SKY,50)]:
    ctext(d,y,t,F(sz,sz>=50),c2); y+=70
im.save(f'{OUT}/w.png')
print('fp cards ok',ns,na,len(rows))
