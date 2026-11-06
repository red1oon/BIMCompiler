# Postscript cards: "Why is our browser so fast?" Every figure is traced in the private project notes (§FILM_DETERMINISTIC_BIM).
import sys
from PIL import Image,ImageDraw,ImageFont
OUT,SHOT=sys.argv[1:3]
BG=(11,15,23);CORAL=(255,107,120);OFF=(243,238,232);SKY=(125,211,252);GREY=(150,160,175)
FD='/usr/share/fonts/truetype/dejavu/'
def F(s,b=False,m=False): return ImageFont.truetype(FD+('DejaVuSansMono.ttf' if m else 'DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf'),s)
def canvas(): im=Image.new('RGB',(1920,1080),BG); return im,ImageDraw.Draw(im)
def ctext(d,y,t,f,c): w=d.textlength(t,font=f); d.text(((1920-w)/2,y),t,font=f,fill=c)
im,d=canvas(); ctext(d,300,'POSTSCRIPT',F(34,True),CORAL); ctext(d,370,'Why is our browser',F(110,True),OFF); ctext(d,510,'so fast?',F(110,True),CORAL); ctext(d,700,'SQLite in WebAssembly · kernel op-log · three.js',F(40),GREY); im.save(f'{OUT}/c9.png')
def head(d,t,sub): d.text((110,95),t,font=F(64,True),fill=OFF); d.text((112,185),sub,font=F(30),fill=SKY)
im,d=canvas(); head(d,'Four layers, all in the page','No application server and no database server in between')
R=[('SQLite → WebAssembly','the model is one file, opened in the page; a question is a query'),('Kernel op-log','every edit is a signed entry; save the small changes, not the whole file'),('three.js','draws the shapes on your graphics card'),('Local first','your copy stays on your device; the network only carries small changes')]
y=290
for a,b in R:
    d.ellipse([130,y+8,170,y+48],fill=CORAL); d.text((210,y),a,font=F(44,True),fill=OFF); d.text((210,y+62),b,font=F(30),fill=SKY); y+=140
im.save(f'{OUT}/ps1.png')
im,d=canvas(); head(d,'The numbers behind it','Measured, not promised')
N=[('~ 6 ms','one draw of a 22-million-vertex model, laptop RTX 4060'),('~ 170 MB','of memory per million vertices (0.173 GB, fitted on 3 buildings)'),('994 ms','734 candidate clash pairs checked, in the page (this film)'),('170 MB','the whole model of this film: one SQLite file, 6,461 elements')]
y=290
for a,b in N:
    d.text((130,y),a,font=F(56,True,True),fill=CORAL); d.text((600,y+12),b,font=F(32),fill=OFF); y+=125
d.text((110,800),'Sources: docs/BrowserScaleBenchmark.md · CLAUDE.md §PERF BUDGET · §CLASH_NARROWPHASE ms=994 · model file size',font=F(24),fill=GREY)
im.save(f'{OUT}/ps2.png')
sh=Image.open(SHOT).convert('RGB'); sh=sh.crop((0,0,sh.width,884)); s=min(1500/sh.width,690/sh.height); sh=sh.resize((int(sh.width*s),int(sh.height*s)),Image.LANCZOS)
im,d=canvas(); im.paste(sh,((1920-sh.width)//2,30))
ctext(d,745,'Illustration, not live data: invented names',F(28),GREY)
ctext(d,785,'More: https://youtu.be/1SQgi18XkaQ',F(36,True),SKY)
im.save(f'{OUT}/ps3.png'); im,d=canvas(); ctext(d,120,'THE BET',F(34,True),CORAL)
ctext(d,200,'That is why we are betting on this as the future.',F(54,True),OFF)
ctext(d,300,'We are the first to string all this proven tech into a single kernel.',F(42),OFF)
ctext(d,420,'Help us break it',F(120,True),CORAL); ctext(d,560,'so we can fix it.',F(120,True),CORAL)
d.line([460,720,1460,720],fill=(60,70,85),width=2)
ctext(d,745,'Project creator: Redhuan D. OON',F(46,True),SKY)
ctext(d,815,'ADempiere 2006  ·  iDempiere 2012  ·  Kernel BIM-ERP 2026',F(36),OFF)
ctext(d,880,'MIT LICENSED',F(40,True),CORAL)
im.save(f'{OUT}/end.png')
print('ps cards ok')
