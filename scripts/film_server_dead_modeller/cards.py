# Cards for "The Server is Dead - the Modeller" (style reference: Essentials v2: navy 18,33,60 / cream / orange). Text only from sources named in the TSV; no invented figures.
import sys, re
from PIL import Image, ImageDraw, ImageFont
W, H = 1920, 1080
NAVY=(18,33,60); CREAM=(245,240,232); ORANGE=(232,152,74); ORANGE2=(222,122,44); CARD=(252,251,245); INK=(24,36,64); GREY=(70,84,110); LBLUE=(190,205,230); NAVY2=(30,48,86)
FH='/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf'
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
FBB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
FM='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
def f(p,s): return ImageFont.truetype(p,s)
def text(d,xy,t,font,fill,sp=0,anchor='la'):
    d.text(xy,t,font=font,fill=fill,anchor=anchor)
def wrap(d,t,font,maxw):
    out=[];cur=''
    for w in t.split():
        c=(cur+' '+w).strip()
        if d.textlength(c,font=font)<=maxw: cur=c
        else: out.append(cur);cur=w
    if cur: out.append(cur)
    return out
def rr(d,box,r,fill,outline=None,width=2): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)
def cube(d,x,y,s,top,left,right,outline=None):   # simple iso block, anchor = bottom centre
    dx=int(s*0.87);dy=int(s*0.5)
    d.polygon([(x,y-s-dy*2),(x+dx,y-s-dy),(x,y-s),(x-dx,y-s-dy)],fill=top)
    d.polygon([(x-dx,y-s-dy),(x,y-s),(x,y),(x-dx,y-dy)],fill=left)
    d.polygon([(x+dx,y-s-dy),(x,y-s),(x,y),(x+dx,y-dy)],fill=right)
def laptop(d,x,y,w,h,screen=CREAM):  # top-left x,y
    rr(d,(x,y,x+w,y+h),14,NAVY2,outline=LBLUE,width=4)
    rr(d,(x+14,y+14,x+w-14,y+h-14),6,screen)
    d.polygon([(x-30,y+h+8),(x+w+30,y+h+8),(x+w+10,y+h+26),(x-10,y+h+26)],fill=LBLUE)
def mailbox(d,cx,cy):
    d.rectangle((cx-9,cy,cx+9,cy+170),fill=LBLUE)
    rr(d,(cx-64,cy-84,cx+64,cy+6),44,ORANGE2); d.rectangle((cx-64,cy-40,cx+64,cy+6),fill=ORANGE2)
    rr(d,(cx-40,cy-38,cx+40,cy-22),8,NAVY); d.rectangle((cx+60,cy-110,cx+100,cy-84),fill=ORANGE)
def envelope(d,x,y,rot=0):
    rr(d,(x,y,x+70,y+48),4,CREAM); d.line([(x,y),(x+35,y+26),(x+70,y)],fill=GREY,width=3)
def bg(c): return Image.new('RGB',(W,H),c)
def title():
    im=bg(NAVY); d=ImageDraw.Draw(im)
    text(d,(130,200),'A PROOF OF CONCEPT',f(FH,34),ORANGE)
    text(d,(130,260),'The Server',f(FH,150),CREAM); text(d,(130,410),'is Dead',f(FH,150),CREAM); text(d,(130,560),'the Modeller',f(FH,150),ORANGE)
    text(d,(130,770),'No DB server. No app server.',f(FBB,50),CREAM); text(d,(130,835),'Just a data relay.',f(FBB,50),CREAM)
    for i,l in enumerate(wrap(d,'Two people, one building model. A block is drawn on one screen and moved on another; the model stays in step.',f(FB,32),900)): text(d,(130,925+i*44),l,f(FB,32),LBLUE)
    laptop(d,1010,420,300,200); laptop(d,1470,420,300,200)
    cube(d,1160,590,50,(214,225,240),(150,170,205),(176,196,225)); cube(d,1620,590,50,(214,225,240),(150,170,205),(176,196,225))
    mailbox(d,1390,360); envelope(d,1210,330); envelope(d,1520,300)
    text(d,(1160,660),'User A',f(FBB,30),LBLUE,anchor='ma'); text(d,(1620,660),'User B',f(FBB,30),LBLUE,anchor='ma')
    return im
def how():
    im=bg(CREAM); d=ImageDraw.Draw(im)
    text(d,(130,110),'What you are watching',f(FH,100),INK)
    cols=[('REAL','The Modeller','The Modeller you see is the real application, running in two browser windows on this one desktop.',NAVY,CREAM,ORANGE),
          ('TEST BENCH','Pairing + Team chip','The pairing page and the small Team chip at the bottom-left of each window are a test bench. In daily work you would only see the chip.',CARD,INK,ORANGE2),
          ('HOW IT IS DRIVEN','Honest footage','Blocks are drawn by the Modeller\'s own command. Every move is a real drag of the Move gizmo. No phone is needed: the second user is a second window.',CARD,INK,ORANGE2)]
    x=130; w=520; gap=40
    for k,(tag,hd,body,bgc,fg,acc) in enumerate(cols):
        xx=x+k*(w+gap); rr(d,(xx,300,xx+w,860),26,bgc,outline=(214,206,190) if bgc==CARD else None)
        text(d,(xx+40,345),tag,f(FH,36),acc); text(d,(xx+40,410),hd,f(FH,56),fg)
        for i,l in enumerate(wrap(d,body,f(FB,31),w-80)): text(d,(xx+40,500+i*44),l,f(FB,31),(205,215,235) if bgc==NAVY else GREY)
    text(d,(130,905),'Proof of concept: the same post-office idea as the orders film, applied to a model. One fresh team space for everything you see.',f(FB,28),GREY)
    return im
def limits(nshared,nall):
    im=bg(NAVY); d=ImageDraw.Draw(im)
    text(d,(130,100),'What is shared today',f(FH,100),CREAM)
    rr(d,(130,270,930,880),26,NAVY2,outline=ORANGE,width=3); rr(d,(990,270,1790,880),26,NAVY2,outline=LBLUE,width=3)
    text(d,(180,310),'SHARED',f(FH,40),ORANGE); text(d,(180,375),'Draw a block. Move it.',f(FH,66),CREAM)
    y=490
    for l in ['Create and move travel between the screens.','Each person works on their own copy and syncs at the post box.','Same block, same direction: a warning, not a silent winner.']:
        for ll in wrap(d,l,f(FB,32),700): text(d,(180,y),ll,f(FB,32),(205,215,235)); y+=40
        y+=40
    text(d,(1040,310),'STAYS ON YOUR DEVICE',f(FH,40),LBLUE); text(d,(1040,375),'Almost every other tool.',f(FH,66),CREAM)
    L2=['%d of %d operation types are shared; %d stay local. The corner chip counts them.'%(nshared,nall,nall-nshared),'Not shared yet: undo of a shared edit, edits to a seeded building, who may touch which floor or trade.','One app per team space. A chooser button for a warning is still to be built.']
    y=490
    for l in L2:
        for ll in wrap(d,l,f(FB,32),700): text(d,(1040,y),ll,f(FB,32),(205,215,235)); y+=40
        y+=30
    return im
def close(lines):
    im=bg(NAVY); d=ImageDraw.Draw(im)
    text(d,(130,160),'CLOSE',f(FH,34),ORANGE); text(d,(130,215),'Witnessed,',f(FH,130),CREAM); text(d,(130,345),'not promised',f(FH,130),CREAM)
    for i,l in enumerate(wrap(d,'Every claim in this film is a test line that passed, or a number read from the live page. The ERP and the Modeller use the same post office.',f(FB,34),640)): text(d,(130,560+i*46),l,f(FB,34),LBLUE)
    rr(d,(860,120,1800,900),24,NAVY2,outline=(60,82,130),width=2)
    text(d,(900,150),'W-TEAM-MODELLER  (run for this film)',f(FM,26),ORANGE)
    y=215
    for l in lines:
        for ll in wrap(d,l,f(FM,25),860): text(d,(900,y),ll,f(FM,25),CREAM); y+=38
        y+=14
    d.ellipse((130,790,260,920),fill=ORANGE2); d.line([(158,858),(192,890),(238,822)],fill=CREAM,width=13)
    return im
if __name__=='__main__':
    import json
    name=sys.argv[1]; out=sys.argv[2]
    if name=='title': title().save(out)
    elif name=='how': how().save(out)
    elif name=='limits': a,b=sys.argv[3:5]; limits(int(a),int(b)).save(out)
    elif name=='close': close(json.load(open(sys.argv[3]))).save(out)
