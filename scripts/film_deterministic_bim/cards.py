# Cards + stills for the "Deterministic BIM" film. Every number below is traced in the private project notes (§FILM_DETERMINISTIC_BIM).
import sys,os
from PIL import Image,ImageDraw,ImageFont
OUT=sys.argv[1]; SHOT1,SHOT2,FRAME,FRAME2,FRAME3=sys.argv[2:7]
BG=(11,15,23); CORAL=(255,107,120); OFF=(243,238,232); SKY=(125,211,252); GREY=(150,160,175)
FD='/usr/share/fonts/truetype/dejavu/'
def F(sz,b=False,m=False): return ImageFont.truetype(FD+('DejaVuSansMono-Bold.ttf' if m and b else 'DejaVuSansMono.ttf' if m else 'DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf'),sz)
def canvas(): im=Image.new('RGB',(1920,1080),BG); return im,ImageDraw.Draw(im)
def ctext(d,y,t,f,c): w=d.textlength(t,font=f); d.text(((1920-w)/2,y),t,font=f,fill=c)
def chapter(name,kick,l1,l2,plain):
    im,d=canvas(); ctext(d,300,kick,F(34,True),CORAL); ctext(d,370,l1,F(110,True),OFF)
    if l2: ctext(d,510,l2,F(110,True),CORAL)
    ctext(d,700,plain,F(40),GREY); im.save(f'{OUT}/{name}.png')
chapter('c0','BEHIND THE SCENES','Deterministic','BIM','Techniques behind the overlays')
# title plain line is replaced below with the local-first sentence on a second card line
im=Image.open(f'{OUT}/c0.png'); d=ImageDraw.Draw(im); d.rectangle([0,690,1920,760],fill=BG)
ctext(d,700,'Techniques behind the overlays',F(46),SKY); ctext(d,780,'Local-first code. No AI inside. Many layers.',F(36),GREY); im.save(f'{OUT}/c0.png')
chapter('c1','CHAPTER 1','The film setup',None,'One panel, eleven switches')
chapter('c2','CHAPTER 2','The Time Machine',None,'A schedule and a price, both computed')
chapter('c3','CHAPTER 3','Why a beam hangs',  'in the air','Measured, and not yet solved')
chapter('c5','CHAPTER 5','Structural and safety',None,'Rules that read the model')
chapter('c6','CHAPTER 6','Clash',None,'Two pieces, one space')
chapter('c7','CHAPTER 7','Measure',None,'Size read from the geometry')
chapter('c4','CHAPTER 4','What the IFC must carry',None,'Garbage in, garbage out')
def head(d,t,sub=None):
    d.text((110,95),t,font=F(64,True),fill=OFF)
    if sub: d.text((112,185),sub,font=F(30),fill=SKY)
# formula 1
im,d=canvas(); head(d,'How long does a piece take?','Install time and cost, from the rate table')
L=[('seconds per piece  =  28 800  ÷  pieces per crew-day',OFF),('',OFF),('a slab:   28 800  ÷  35   =   823 s',SKY),('',OFF),('labour hours  ×  standard rate   =   cost',OFF),('this film:   27 322 h   →   1 869 006',SKY)]
y=330
for t,c in L: d.text((150,y),t,font=F(46,m=True),fill=c); y+=78
d.text((110,820),'Standard example rates, editable.  A day is eight working hours (28 800 s).',font=F(30),fill=GREY)
im.save(f'{OUT}/f1.png')
# formula 2 CPM
im,d=canvas(); head(d,'Who goes first?','Critical-path pass, one pass over the graph')
d.text((150,330),'start(T)  =  max( crew free ,  finish of everything T waits for )',font=F(42,m=True),fill=OFF)
items=[('support','what holds it'),('host','what it sits in'),('trade order','structure before finishes'),('storey','the floor below first')]
y=470
for a,b in items:
    d.ellipse([160,y+10,190,y+40],fill=CORAL); d.text((220,y),a,font=F(44,True),fill=OFF); d.text((620,y+6),b,font=F(38),fill=SKY); y+=95
d.text((110,880),'No iteration, no guessing: same input, same answer.',font=F(34),fill=GREY)
im.save(f'{OUT}/f2.png')
# election
im,d=canvas(); head(d,'Who holds this beam up?','The election, simplified')
rows=[('class 0','a piece below, its top meets the beam base','bearing'),('class 1','a piece beside it, same level, spanning','embedded'),('class 2','anything else','carrier above')]
y=300
for a,b,c in rows:
    d.text((110,y),a,font=F(40,True),fill=CORAL); d.text((330,y+3),b,font=F(36),fill=OFF); d.text((1450,y+3),c,font=F(36),fill=SKY); y+=85
d.text((110,590),'Lowest class wins.  Structure outranks pipes.  ONE winner.',font=F(40,True),fill=OFF)
d.text((110,700),'midair   ⇔   start(support)  >  start(beam) + 1 s',font=F(46,m=True),fill=SKY)
d.text((110,820),'Judge: SupportSweep.midairAudit (support_sweep.js)',font=F(28),fill=GREY)
im.save(f'{OUT}/m1.png')
# lacks, with a drawing
im,d=canvas(); head(d,'What the formula lacks')
# beam on two columns
d.rectangle([160,330,260,520],fill=(90,100,115)); d.rectangle([760,330,860,520],fill=(90,100,115)); d.rectangle([130,270,890,330],fill=(190,150,110))
d.text((120,545),'elected',font=F(30,True),fill=CORAL); d.text((690,545),'ignored',font=F(30),fill=GREY)
d.line([210,325,210,260],fill=CORAL,width=6)
d.text((110,600),'A beam rests on two ends.\nThe election keeps one.',font=F(32),fill=OFF)
T=[('1','No written rule for which neighbours MUST stand first (sequence rule, open)'),('2','Storey heights are compiled from element centres, not read from the IFC elevation'),('3','The two IFC files state elevations in different units: metres and millimetres')]
y=290
for n,t in T:
    d.text((1000,y),n,font=F(48,True),fill=CORAL); 
    import textwrap
    for i,l in enumerate(textwrap.wrap(t,36)): d.text((1070,y+i*44),l,font=F(34),fill=OFF)
    y+=125
d.text((110,740),'Open question: which SET of supporters must be in place, readable from the IFC alone?',font=F(34,True),fill=SKY)
im.save(f'{OUT}/m2.png')
# IFC table
im,d=canvas(); head(d,'What the IFC must carry','metadata  →  what it drives  →  in this model')
rows=[('Shape + position  (x, y, z)','supports, clashes, distances','6,461 elements · 6,156 shapes'),
('Material','colour and finish','105 material names'),
('Family  (IFC class)','trade, sequence, rate','21 classes'),
('Property sets','ratings, finishes, room data','19,457 sets in 2 files'),
('Storeys','levels, tasks, order','8 + 11 declared · m vs mm'),
('Geo-reference','sun path, north','24.974° N · 54.998° E · north 0°')]
y=250; d.line([110,y-12,1810,y-12],fill=GREY,width=2)
for a,b,c in rows:
    d.text((110,y),a,font=F(36,True),fill=OFF); d.text((720,y+3),b,font=F(32),fill=SKY); d.text((1290,y+3),c,font=F(32),fill=OFF); y+=90
    d.line([110,y-14,1810,y-14],fill=(40,48,60),width=2)
d.text((110,790),'No map conversion in either file: location comes from the site record.  Counts read from the files, not estimated.',font=F(26),fill=GREY)
im.save(f'{OUT}/t1.png')
# final card
im,d=canvas(); ctext(d,150,'WHY IT IS OPEN',F(34,True),CORAL)
ctext(d,215,'A standard becomes a convention',F(78,True),OFF); ctext(d,310,'when anyone can read it.',F(78,True),CORAL)
d.text((200,400),'ISO 16739-1:2024',font=F(42,True),fill=SKY); d.text((200,455),'Industry Foundation Classes (IFC) — Part 1: Data schema. Buildings and infrastructure. Published 22 March 2024.',font=F(28),fill=OFF)
d.text((200,530),'ISO 19650-1:2018',font=F(42,True),fill=SKY); d.text((200,585),'Information management using BIM — Part 1: Concepts and principles. Reviewed and confirmed 2024.',font=F(28),fill=OFF)
ctext(d,690,'The purpose of this project: open the whole process to the long tail of users.',F(34,True),OFF)
ctext(d,745,'Local first · no AI inside · MIT licence',F(30),GREY)
im.save(f'{OUT}/z.png')
# screenshots: fit 1504x850 top, plus crops
def fit(src,box,name,W=1920,H=850,top=40):
    im=Image.open(src).convert('RGB'); 
    if box: im=im.crop(box)
    s=min(W/im.width,H/im.height); im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    c=Image.new('RGB',(1920,1080),BG); c.paste(im,((1920-im.width)//2,top)); c.save(f'{OUT}/{name}.png')
fit(SHOT1,None,'s1full'); fit(SHOT1,(1105,198,1530,405),'s1tog',H=700,top=120)
fit(SHOT2,None,'s2full'); fit(SHOT2,(14,236,462,812),'s2gantt'); fit(SHOT2,(480,8,806,602),'s2dash')
# freeze frame with a note box
im=Image.open(FRAME).convert('RGB').resize((1920,1080)); ov=Image.new('RGBA',(1920,1080),(0,0,0,0)); od=ImageDraw.Draw(ov)
od.rounded_rectangle([60,130,1180,420],radius=18,fill=(11,15,23,225))
im=Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB'); d=ImageDraw.Draw(im)
d.text((95,150),'MIDAIR AUDIT  ·  played layer',font=F(34,True),fill=CORAL)
d.text((95,215),'384 of 6,461 elements start before what holds them',font=F(34),fill=OFF)
d.text((95,275),'163 of them are beams (of 3,760)',font=F(34,True),fill=SKY)
d.text((95,345),'Separate geometry check: 37 beams have nothing under either end',font=F(26),fill=GREY)
im.save(f'{OUT}/frz.png')
def note(frame,name,lines):
    im=Image.open(frame).convert('RGB').resize((1920,1080)); ov=Image.new('RGBA',(1920,1080),(0,0,0,0)); od=ImageDraw.Draw(ov)
    od.rounded_rectangle([60,480,1180,480+60+len(lines)*62],radius=18,fill=(11,15,23,230))
    im=Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB'); d=ImageDraw.Draw(im)
    for i,(t,c,sz) in enumerate(lines): d.text((95,500+i*62),t,font=F(sz,i==0),fill=c)
    im.save(f'{OUT}/{name}.png')
note(FRAME2,'frz2',[('CLASH  ·  candidate pairs to real clashes',CORAL,34),('734 candidate pairs  →  83 true clashes',OFF,36),('649 false positives thrown out by the real-shape test',SKY,30),('(2 flat contacts excluded)',GREY,26)])
note(FRAME3,'frz3',[('MEASURE  ·  read from the geometry',CORAL,34),('552,881 m³ measured volume',OFF,36),('115.8 × 85.5 × 55.8 m envelope',SKY,34),('81 doors counted',OFF,34)])
print('cards ok')
