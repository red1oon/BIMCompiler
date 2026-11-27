#!/usr/bin/env python3
# Implementing prompts/FILM_VS_AI_SLOP.md §SCRIPT v1 + §DUEL_LEDGER — Witness: W-FILM-VS-AI (§CUT lines below)
# Silent rough cut v0: stills + text cards + AI duel clip + excerpts of the existing Hospital film. No narration yet.
import subprocess, os, sys, hashlib, json
from PIL import Image, ImageDraw, ImageFont
W,H,FPS=1920,1080,24
LANG=os.environ.get('FILM_LANG','en')
OUT=os.environ.get('FILM_OUT') or os.path.join(os.path.dirname(__file__),'..','build','film_vs_ai','cut'); OUT=os.path.abspath(OUT); os.makedirs(OUT,exist_ok=True)
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
MS={}
if LANG in ('ms','zh'):
    MS=__import__('film_vs_ai_'+LANG).MS
def tr(t):
    if LANG not in ('ms','zh') or not t: return t
    if t in MS: return MS[t]
    print('§TR_MISS',repr(t),flush=True); return t
SS=os.path.expanduser('~/Pictures/Screenshots'); HOSP=os.path.expanduser('~/Downloads/Hospital_FULL_HIRES.mp4')   # baked Hospital film, no audio, HUD only (no subtitles); user: originals = my resource
NARR=os.path.expanduser('~/Downloads/Hospital_narrated_dialogue_v3_AFTER_1920x1080_24fps_2026-10-03_0049.mp4')   # has the sun-azimuth panel + safety boxes (HIRES cut does not); burned subtitles kept
TOOLS=os.path.expanduser('~/Videos/BIM_Tools_narrated_chapters_AFTER.mp4')   # Duplex, 8 chapters, narrated (audio stripped, subtitles stay)
SHED=os.path.expanduser('~/Videos/DXF2BIM_Chapter_BricsCAD_Shed_to_Viewer_1920x1080_25fps_2026-10-19_v5_EN.mp4')   # 2D->BIM->4D/5D, audio stripped, subtitles stay
D4=os.path.expanduser('~/Videos/4D.mp4')   # screen recording, Time Machine / schedule editor / What-if (audio stripped)
AI=os.path.abspath(os.path.join(OUT,'..','duel_clips','wan22_run1.mp4'))
FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FR='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
if LANG=='zh': FB='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'; FR='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def FNT(path,size): return ImageFont.truetype(path,size,index=2) if path.endswith('.ttc') else ImageFont.truetype(path,size)   # index 2 = Noto Sans CJK SC
OV=json.load(open(os.path.join(OUT,'dur_override.json'))) if os.path.exists(os.path.join(OUT,'dur_override.json')) else {}
def log(m): print('§CUT',m,flush=True)
def run(a): subprocess.run(a,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
def card(name,lines,sub=None,hi=None):
    lines=[tr(x) for x in lines]; sub=[tr(x) for x in sub] if sub else sub
    im=Image.new('RGB',(W,H),(12,14,20)); d=ImageDraw.Draw(im); y=H//2-60*len(lines)//2-(40 if sub else 0)
    for i,t in enumerate(lines):
        f=FNT(FB,64 if len(t)<48 else 48); col=(255,214,102) if hi==i else (240,240,240)
        w=d.textlength(t,font=f); d.text(((W-w)/2,y),t,font=f,fill=col); y+=88
    if sub:
        f=FNT(FR,32)
        for t in sub:
            w=d.textlength(t,font=f); d.text(((W-w)/2,y+20),t,font=f,fill=(150,160,175)); y+=44
    p=f'{OUT}/{name}.png'; im.save(p); return p
def seg_img(png,dur,name,pad=True,label=None,fade=None):
    dur=OV.get(name,dur); o=f'{OUT}/{name}.mp4'
    vf=f'scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,fps={FPS},format=yuv420p'
    if fade: vf+=f',fade=t=in:st=0:d={fade[0]},fade=t=out:st={max(dur-fade[1],0)}:d={fade[1]}'
    if label: label=tr(label); vf+=f",drawtext=fontfile={FB}:text='{label}':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.6:boxborderw=14:x=40:y=H-90"
    run(['ffmpeg','-y','-loop','1','-t',str(dur),'-i',png,'-vf',vf,'-an','-c:v','libx264','-crf','18',o]); return o
def seg_vid(src,ss,dur,name,scale=True,label=None,mask=False):
    dur=OV.get(name,dur); o=f'{OUT}/{name}.mp4'; vf=f'tpad=stop_mode=clone:stop_duration=40,scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,fps={FPS},format=yuv420p'
    if mask: vf+=f',split=2[a][b];[b]crop={W}:170:0:{H-170},boxblur=28:4[c];[a][c]overlay=0:{H-170}'   # blur the source film burned-in subtitle band (it would collide with our captions)
    if label: label=tr(label); vf+=f",drawtext=fontfile={FB}:text='{label}':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.6:boxborderw=14:x=40:y=H-90"
    run(['ffmpeg','-y','-ss',str(ss),'-i',src,'-vf',vf,'-t',str(dur),'-an','-c:v','libx264','-crf','18',o]); return o

CORAL=(255,107,120); BLUE=(143,168,216); INK=(243,238,232); MUTE=(168,176,189); BG=(20,22,28)
def spaced(d,xy,t,f,fill,sp=4,anchor='l',W_=W):
    w=sum(d.textlength(c,font=f)+sp for c in t)-sp; x=xy[0] if anchor=='l' else (W_-w)/2 if anchor=='c' else xy[0]-w
    for c in t: d.text((x,xy[1]),c,font=f,fill=fill); x+=d.textlength(c,font=f)+sp
def chapter_card(name,num,kicker,l1,l2,sub):
    kicker=tr(kicker); l1=tr(l1); l2=tr(l2) if l2 else l2; sub=tr(sub)
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    spaced(d,(W-60,40),tr('BIM  ·  AI vs CODE  ·  HOSPITAL'),FNT(FB,20),MUTE,3,'r')
    spaced(d,(0,330),(f'第 {num} 章  ·  {kicker}' if LANG=='zh' else tr('CHAPTER')+f' {num}  ·  {kicker}'),FNT(FB,26),CORAL,5,'c')
    if l2 is None:   # one-line title 'I vs AI': I in ink, vs muted small, AI coral
        fb=FNT(FB,170); fv=FNT(FR,64); parts=[(tr('I'),fb,INK),(tr('  vs  '),fv,MUTE),('AI',fb,CORAL)]
        tw=sum(d.textlength(t,font=f) for t,f,_ in parts); x=(W-tw)/2
        for t,f,c in parts: d.text((x,420+(0 if f is fb else 70)),t,font=f,fill=c); x+=d.textlength(t,font=f)
        spaced(d,(0,680),sub,FNT(FR,32),MUTE,1,'c')
    else:
        spaced(d,(0,400),l1,FNT(FB,78),INK,6,'c'); spaced(d,(0,500),l2,FNT(FB,78),CORAL,6,'c')
        spaced(d,(0,640),sub,FNT(FR,32),MUTE,1,'c')
    p=f'{OUT}/{name}.png'; im.save(p); return p
def mark(d,cx,cy,state,col):
    r=13
    if state=='yes': d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=col)
    elif state=='no': d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=col,width=3)
    else:
        d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=col,width=3); d.pieslice((cx-r,cy-r,cx+r,cy+r),90,270,fill=col)
ROWS=[('Output traces to model elements',('no','pixels only','1,2'),('yes','ids and counts','3')),
('Same input, same output',('part','pinned seed, one host','4'),('yes','same drawings, same model','5')),
('Source code can be read',('part','open weights exist','6'),('yes','MIT licence','7')),
('Runs with outside requests blocked',('no','hosted service','4'),('yes','viewer boot + import','8')),
('Your model stays on your machine',('no','our frame was uploaded','4'),('yes','local first','8')),
('Survives a vendor shutting down',('no','Sora app + API closing','9'),('yes','MIT, self-hostable','7')),
('Schedule, cost, clash from one model',('no','none found','10'),('yes','4D, 5D, clash','11')),
('Looks gorgeous in seconds',('yes','','12'),('no','we lose this','13')),
('Starts from a prompt, no model',('yes','','12'),('no','needs a model','13'))]
CITES=['1 Cumberland, practitioner blog, 3 Aug 2026','2 Revit AI plugin review: Veras output is an image, dancumberlandlabs.com','3 Hospital bake HUD: 270 mesh-true clashes','4 Our duel, 2 Nov 2026: Wan 2.2 free demo, ledger in repo',
'5 DXF2BIM shed film: same drawings, same model, no AI on drawings','6 HF model card: Wan2.2-I2V-A14B, Apache-2.0 (weights, not an explanation)','7 LICENSE files, bim-ootb and bim-compiler: MIT',
'8 NO_AI_INSIDE_WITNESS: §NOAI_NETWORK PASS, 2 Oct 2026 (viewer boot + import)','9 The Decoder, 28 Mar 2026: Sora app dark 26 Apr, API 24 Sep','10 Our search found none; absence is not proof',
'11 DXF2BIM shed film v5: 5D cost, 4D schedule','12 Vendor roundups: Krea, Gendo, 2026','13 Our own concession']
def graph_card(name):
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    d.text((70,34),tr('What a pretty picture cannot tell you'),font=FNT(FB,46),fill=INK)
    d.text((70,96),tr('AI video tools vs this pipeline. Each cell cites its source (numbers at the bottom).'),font=FNT(FR,24),fill=MUTE)
    xa,xo=1130,1570; fh=FNT(FB,26)
    f=FNT(FB,26)
    d.text((xa-130,150),tr('AI VIDEO TOOLS'),font=f,fill=BLUE); d.text((xo-110,150),tr('THIS PIPELINE'),font=f,fill=CORAL)
    y=215; fl=FNT(FR,29); ft=FNT(FR,21)
    for lab,a,o in ROWS:
        d.line((70,y-24,W-70,y-24),fill=(40,44,54),width=2)
        d.text((70,y-14),tr(lab),font=fl,fill=INK)
        for cx,(st,tx,ct),col in ((xa-110,a,BLUE),(xo-110,o,CORAL)):
            mark(d,cx,y,st,col); d.text((cx+26,y-13),(tr(tx)+'  ['+ct+']') if tx else '['+ct+']',font=ft,fill=MUTE)
        y+=54
    d.line((70,y-24,W-70,y-24),fill=(40,44,54),width=2)
    d.text((70,y-6),tr('filled = yes     half = partly     ring = no'),font=ft,fill=MUTE)
    fs=FNT(FR,17); cy=y+30
    for i,c in enumerate(CITES):
        col,row=divmod(i,7); d.text((70+col*930,cy+row*23),'['+c.split(' ',1)[0]+'] '+c.split(' ',1)[1][:96],font=fs,fill=MUTE)
    p=f'{OUT}/{name}.png'; im.save(p); return p
segs=[]
segs.append(seg_img(chapter_card('chap0','1','THE CLAIM','I vs AI',None,'What it might be, or what it is. One of them you can check.'),3.2,'chap0',fade=(0.4,0.3)))
# Beat 1 — FLASH: six strongest Alt+S stills, 0.7 s each, hard cuts, no caption. (toilet still dropped: weakest)
DL=os.path.expanduser('~/Downloads')   # fresh Alt+S stills red1 tested 2026-11-02 04:40-04:45 (2776x1440): Hospital exterior w/ sky + 3 atrium views (red FP pipe, spiral stair)
NEW=['1793565907375','1793565635195','1793565667102','1793565742688']
OLD=['1791066758986','1791059434614','1791064205967']
flash=[f'{DL}/bounce_still_{b}.png' for b in NEW]+[f'{SS}/bounce_still_{b}.png' for b in OLD]
for i,p in enumerate(flash):
    log(f'flash {os.path.basename(p)} sha={hashlib.sha256(open(p,"rb").read()).hexdigest()[:12]}'); segs.append(seg_img(p,0.7,f'b1_{i}',fade=(0.06,0.14)))
segs.append(seg_img(card('b1_f',['F: "Wow. AI is super cool!"']),2.0,'b1_F'))
segs.append(seg_img(card('b1_m',['M: "Wait... are they real?','Can they show us the numbers?"']),2.5,'b1_M'))
segs.append(seg_img(card('b2',['AI is nice, isn\'t it?','Just that it isn\'t.','This is all from...'],['six buildings, one pipeline'],hi=1),3.0,'b2'))
segs.append(seg_img(card('b3',['JavaScript  +  ThreeJS','+  a SQLite database in WebAssembly','No AI model anywhere in the pipeline.'],hi=2),3.5,'b3'))
# Beat 4 — concession + why
segs.append(seg_img(card('b4',['AI beats me on beauty in five seconds.','It can start from nothing. I cannot.'],['(we say it first, on purpose)']),3.0,'b4a'))
segs.append(seg_img(card('b4b',['Do you want AI to draw','what a building might look like?','Or code that draws what it is?'],hi=2),3.0,'b4b'))
segs.append(seg_img(card('b5a',['"AI-generated responses are based on','patterns and probabilities.','It cannot guarantee accuracy."'],['Autodesk Assistant help page, fetched 2026-11-02','(the Assistant, not Forma or Veras)']),4.5,'b5a'))
segs.append(seg_img(card('b5b',['"Generative AI lives in latent space.','Buildings live in physical space."'],['Dan Cumberland, practitioner blog, 3 Aug 2026']),3.5,'b5b'))
# Beat 6 — the duel, as logged
segs.append(seg_img(card('d0',['We tried one. Free demo, no login.','Our Hospital frame in. One prompt.'],['Wan 2.2 on Hugging Face ZeroGPU - 2 Nov 2026 - seed pinned']),2.5,'d0'))
segs.append(seg_vid(AI,0,3.56,'d1',label='AI result: 3.56 s clip, 832x544, wait 64.6 s'))
segs.append(seg_img(card('d2',['Same input, same seed, run twice:','identical file. Honest result: repeatable.','But: 3.56 s per clip, 832x544, ~64 s each.'],['Our 206 s Hospital film = about 58 such clips (arithmetic from the measured wait)','Earlier demo: "No GPU was available after 60s. Create a free account"','4 of 5 listed image-to-video demos were dead that day']),5.5,'d2'))
# Beat 7 — ours: baked Hospital + the glory (azimuth, exit path) + Time Machine
segs.append(seg_vid(HOSP,0,5.0,'h_open',label='Ours: Hospital, baked once - same file every time'))
segs.append(seg_vid(HOSP,123,6.0,'h_clash',label='Clash HUD from the bake: 270 mesh-true clashes flagged'))
segs.append(seg_vid(HOSP,158,6.0,'h_parade',label='By trade and pair, read from the model'))
segs.append(seg_vid(NARR,52,10.0,'h_glory',mask=True,label='Sun azimuth and altitude per day - Safety: longest path to exit (bake HUD)'))
segs.append(seg_vid(D4,14,5.0,'t_sched',label='Time Machine: the schedule editor (existing recording)'))
segs.append(seg_vid(D4,48,6.0,'t_whatif',label='What-if schedule on the same Hospital (existing recording)'))
# Beat 7d — 2D -> BIM -> 4D/5D/reporting, no AI in the code (Shed film, 2026-10-19 v5)
segs.append(seg_img(card('s0',['2D drawings to a model, a schedule and a cost.','No AI in the code.'],['BricsCAD shed set - from the DXF2BIM film (existing recording)'],hi=1),3.0,'s0'))
segs.append(seg_vid(SHED,240,8.0,'s_5d',mask=True,label='5D: cost by discipline from the model quantities (rate-based estimate, not a tender)'))
segs.append(seg_vid(SHED,256,8.0,'s_4d',mask=True,label='4D: a schedule generated when the model has none (default sequence, 194 days)'))
segs.append(seg_vid(SHED,296,7.0,'s_card',mask=True,label='From the film: "no AI on your drawings" - same drawings, same model'))
# Beat 7a — the simple kit
segs.append(seg_vid(TOOLS,31,6.0,'k_upg',mask=True,label='U: IFC2X3 -> IFC4.3, 38898 -> 38603 entities, 28 dropped, 110 ms - PASS'))
segs.append(seg_vid(TOOLS,143,5.0,'k_split',mask=True,label='K: split into 4 storey files - PASS'))
segs.append(seg_img(card('pro',['This is how professionals work:','fast, repeatable, sequenced.','Skills their learning can wrap around -','not out of their control.'],['when you know the code, you shortcut right away'],hi=0),5.5,'pro'))
segs.append(seg_img(f'{SS}/7.png',5.0,'altc_panel',label='Alt+C panel: path, tick-boxes, Go - 281.6 s film = 4225 frames to bake, saved in the building file'))
segs.append(seg_img(f'{SS}/5.png',3.5,'inspect_4d5d',label='Inspect menu: Time Machine, 4D / 5D, Clash Matrix, Section Cut, Earthworks'))
# Beat 8 — prep + security + open source
segs.append(seg_img(card('c1',['Alt+C opens in about 3 seconds.','Fast work: press OK. Shaping it: seconds to a minute.','Then the bake runs - up to an hour. You walk away.','No prompt. No API call. No credits. Nothing to phish.'],['prep times: red1\'s own timing (not yet from a film log); the path is deterministic and previewable before the bake','bake wall-clock from our bake logs: light field 26-49 min, orbit ~10 min'],hi=0),7.0,'c1'))
segs.append(seg_img(card('p2',['To ask an AI, your model leaves your machine.','Our own duel sent a Hospital frame to a third-party host.','Ours: the building is a file you hold.'],['AEC security guidance: BIM uploads carry full geometry, MEP and security-sensitive room layouts (Nomic, 2026)','A door you do not control - not a proven breach'],hi=2),5.5,'p2'))
segs.append(seg_img(card('p3',['Calling an API you cannot inspect','is a risk, anywhere.','Ours: MIT licence. Read it. Fork it. Break it.'],['Closed AI services: no code to read.','Even open-weight models (our demo: Wan 2.2, Apache-2.0) publish weights, not an explanation of any one output.'],hi=2),5.0,'p3'))
segs.append(seg_img(card('sh',['With AI, it can all be shut off tomorrow.','Sora: app dark 26 Apr 2026, API 24 Sep 2026.','Ours: a browser tab. No install. MIT. Examinable.'],['The Decoder, 28 Mar 2026: "The web and app version goes dark on April 26, 2026, with the Sora API following on September 24, 2026."','In our own duel: 4 of 5 listed free demos were dead on the day'],hi=0),6.0,'sh'))
# Beat 7c — fast collage (1.3 s each) + Find Panel stills
V=os.path.expanduser('~/Videos')
COL=[('DXF2BIM_2D_Wand_Hospital_1920x1080_2026-10-22.mp4',22,'2D drawing set <-> BIM: Hospital'),
('ERP_DepthCycle_POSOrder_narrated_AFTER_1920x1080_24fps_2026-10-13.mp4',66,'ERP: shipment completed'),
('ERPSpatial.mp4',52,'ERP linked to the 3D model'),
('ERPSpatial.mp4',136,'ERP dashboards'),
('TheServerIsDead_ERP_Desktop_narrated_2026-10-24_v2.mp4',36,'Team ERP, no app server'),
('Chainage_from_model_letters_narrated_v2_AFTER.mp4',60,'Road chainage read from the model'),
('Earthworks_cutfill_SILENT.mp4',56,'Cut and fill from the model'),
('Civil_Works_Road_Report_narrated_AFTER.mp4',60,'Road report: checks with a rule behind each'),
('Shed_SubmissionPack_Film_1920x1080_2026-11-01.mp4',112,'Submission pack report with its sources'),
('DXF2BIM_Viewer_Tour_1920x1080_25fps_2026-10-19_v5_EN.mp4',58,'Viewer: sun, storeys, disciplines')]
segs.append(seg_img(card('col0',['All of it local-first.'],['Viewer boot + import ran with every outside request blocked: §NOAI_NETWORK PASS (2 Oct 2026).','Optional share / QR features are user-triggered and disclosed.']),3.0,'col0'))
for i,(f,t,lab) in enumerate(COL):
    segs.append(seg_vid(f'{V}/{f}',t,1.3,f'col_{i:02d}',label=lab,mask=True))
FD=os.path.abspath(os.path.join(OUT,'..','..','..','site','img','viewer'))
for k in ('frontview','sideview','topview'):
    segs.append(seg_img(f'{FD}/find-room-path-hospital-{k}.png',1.5,f'find_{k}'))
segs.append(seg_img(graph_card('graph'),12.0,'graph'))
segs.append(seg_img(card('end',['AI draws what a building might be.','We show what it is.','Re-run it yourself: the ledger is public.'],hi=1),4.0,'end'))
lst=f'{OUT}/list.txt'; open(lst,'w').write(''.join(f"file '{s}'\n" for s in segs))
final=f'{OUT}/FilmVsAI_v0_silent_1920x1080_24fps.mp4'
run(['ffmpeg','-y','-f','concat','-safe','0','-i',lst,'-c','copy',final])
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',final]).decode())
log(f'FINAL {final} segs={len(segs)} dur={dur:.1f}s sha={hashlib.sha256(open(final,"rb").read()).hexdigest()[:12]}')
