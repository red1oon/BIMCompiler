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
def limits(items_shared, items_local):
    im=bg(NAVY); d=ImageDraw.Draw(im)
    text(d,(130,90),'What is shared, what is not',f(FH,96),CREAM)
    rr(d,(130,250,930,860),26,NAVY2,outline=ORANGE,width=3); rr(d,(990,250,1790,860),26,NAVY2,outline=LBLUE,width=3)
    text(d,(180,285),'SHARED',f(FH,40),ORANGE); y=350
    for l in items_shared:
        for k,ll in enumerate(wrap(d,l,f(FB,30),690)): text(d,(180,y),('\u2022 ' if k==0 else '   ')+ll,f(FB,30),(205,215,235)); y+=38
        y+=14
    text(d,(1040,285),'NOT YET',f(FH,40),LBLUE); y=350
    for l in items_local:
        for k,ll in enumerate(wrap(d,l,f(FB,30),690)): text(d,(1040,y),('\u2022 ' if k==0 else '   ')+ll,f(FB,30),(205,215,235)); y+=38
        y+=14
    return im
def close(lines):
    im=bg(NAVY); d=ImageDraw.Draw(im)
    text(d,(130,160),'CLOSE',f(FH,34),ORANGE); text(d,(130,215),'Witnessed,',f(FH,130),CREAM); text(d,(130,345),'not promised',f(FH,130),CREAM)
    for i,l in enumerate(wrap(d,'Every claim in this film is a test line that passed, or a number read from the live page. Part three adds a real building and the who-is-on-what label.',f(FB,34),640)): text(d,(130,560+i*46),l,f(FB,34),LBLUE)
    rr(d,(860,120,1800,890),24,NAVY2,outline=(60,82,130),width=2)
    y=150
    for hd,ls in lines:
        text(d,(900,y),hd,f(FM,26),ORANGE); y+=40
        for l in ls:
            for ll in wrap(d,l,f(FM,24),860): text(d,(900,y),ll,f(FM,24),CREAM); y+=34
            y+=8
        y+=18
    d.ellipse((130,790,260,920),fill=ORANGE2); d.line([(158,858),(192,890),(238,822)],fill=CREAM,width=13)
    return im
if __name__=='__main__':
    import json
    name=sys.argv[1]; out=sys.argv[2]
    if name=='limits': j=json.load(open(sys.argv[3])); limits(j['shared'],j['local']).save(out)
    elif name=='close': close(json.load(open(sys.argv[3]))).save(out)
