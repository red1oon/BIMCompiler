# Fitter v2 (Kokoro, multi-speaker). Row = id cue end source SHORT DETAIL; turns "F: ... | M: ...".
# Rule: DETAIL at base speed if it fits room; else DETAIL re-voiced up to +10% speed; else SHORT; else SKIP.
import sys,numpy as np,soundfile as sf
from kokoro_onnx import Kokoro
K='/home/red1/.local/share/film_narration/kokoro/'
k=Kokoro(K+'kokoro-v1.0.onnx',K+'voices-v1.0.bin')
src,tag,base=sys.argv[1],sys.argv[2],float(sys.argv[3]); VOX={'F':'af_heart','M':'am_michael'}
FILM=206.79; PAD=0.3; GAP=0.18; SR=24000
def trim(a):
    n=len(a)
    while n>0 and abs(a[n-1])<0.01: n-=1
    return a[:min(len(a),n+int(0.06*SR))]
def say(turns,sp):
    out=[];marks=[];t=0.0
    for j,(who,txt) in enumerate(turns):
        a,_=k.create(txt,voice=VOX[who],speed=sp,lang='en-us'); a=trim(a)
        marks.append((t,t+len(a)/SR,who,txt)); out.append(a); t+=len(a)/SR
        if j<len(turns)-1: out.append(np.zeros(int(GAP*SR),np.float32)); t+=GAP
    return np.concatenate(out),marks
def parse(s): return [(x.strip()[0],x.strip()[2:].strip()) for x in s.split(' | ')]
plan=[]
for l in open(src):
    i,a,b,so,sh,de=l.rstrip('\n').split('\t'); a=float(a); b=float(b); room=b-a-PAD
    aud,mk=say(parse(de),base); d=len(aud)/SR; pick='DETAIL'
    if d>room:
        sp=base*d/room
        if sp<=base*1.10: aud,mk=say(parse(de),sp*1.01); d=len(aud)/SR; pick=f'DETAIL x{sp/base:.3f}'
    if d>room:
        aud,mk=say(parse(sh),base); d=len(aud)/SR; pick='SHORT'
        if d>room: pick='SKIP'
    print(f'§NARR_FIT {i} cue={a:.2f} room={room:.2f} dur={d:.2f} -> {pick} slack={room-d:+.2f} words={sum(len(t.split()) for *_,t in mk)}',flush=True)
    if pick!='SKIP':
        f=f'{tag}_{i}.wav'; sf.write(f,aud,SR); plan.append((i,a,f,[(a+s,a+e,w,t) for s,e,w,t in mk]))
def ts(x): return f'{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}'
hdr=open('ass_head.txt').read()
ev=[]
for i,a,f,mk in plan:
    for s,e,w,t in mk: ev.append(f'Dialogue: 0,{ts(s)},{ts(e+0.35)},{w},,0,0,0,,{t}')
ev.append(f'Dialogue: 0,{ts(FILM-8.0)},{ts(FILM-0.1)},Credit,,0,0,0,,Voices: AI-generated (Kokoro, local)  ·  Script directed by red1')
open(f'{tag}.ass','w').write(hdr+'\n'.join(ev)+'\n')
open(f'{tag}_plan.tsv','w').write(''.join(f'{i}\t{a:.3f}\t{f}\n' for i,a,f,_ in plan))
