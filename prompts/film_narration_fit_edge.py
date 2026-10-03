# Fitter v3-edge (Microsoft Edge neural TTS, cloud; Malay + Thai). Same fit / beat / chunk rules as
# film_narration_fit_kokoro_v3.py. Spec: FILM_NARRATION.md §4 2026-10-03 11:40.
# usage: fit_edge.py script.tsv tag ms|th|fr|es   (rate base = +0%; re-voice up to +10%)
# Malay: yes/no question gets the PSOLA rise only if the voice's own ending is below +1 st (measured first).
# Thai: tonal, so no pitch edit; §NARR_TONE is reported only.
# Clips cached in ~/.local/share/film_narration/cache_edge/<sha1>.wav keyed on (text, voice, rate%).
import sys,re,os,hashlib,asyncio,subprocess,numpy as np,soundfile as sf,parselmouth,edge_tts
from parselmouth.praat import call
src,tag,LANG=sys.argv[1],sys.argv[2],sys.argv[3]; base=1.0
# optional 4th arg: caption tsv (id <TAB> "F: … | M: …") — English captions over native audio, turn-for-turn
CAP={l.split('\t')[0]:[x.strip()[2:].strip() for x in l.rstrip('\n').split('\t')[1].split(' | ')] for l in open(sys.argv[4])} if len(sys.argv)>4 else None
CFG={'ms':dict(VOX={'F':'ms-MY-YasminNeural','M':'ms-MY-OsmanNeural'},
               WH=r'\b(apa|kenapa|mengapa|berapa|bagaimana|mana|siapa|bila)\b',pitch=True,font='DejaVu Sans',
               credit='Suara: dijana AI (Microsoft Edge TTS, awan)  ·  Skrip diarahkan oleh red1'),
     'fr':dict(VOX={'F':'fr-FR-DeniseNeural','M':'fr-FR-HenriNeural'},
               WH=r"(\bque\b|qu'|\bquoi\b|pourquoi|comment|combien|\boù\b|\bqui\b|\bquel|\bquand\b)",pitch=True,font='DejaVu Sans',
               credit='Voix : générées par IA (Microsoft Edge TTS, cloud)  ·  Script réalisé par red1'),
     'es':dict(VOX={'F':'es-ES-ElviraNeural','M':'es-ES-AlvaroNeural'},
               WH=r'(qué|por qué|cómo|cuánt[oa]s?|dónde|quién|cuál|cuándo)',pitch=True,font='DejaVu Sans',
               credit='Voces: generadas por IA (Microsoft Edge TTS, nube)  ·  Guion dirigido por red1'),
     'th':dict(VOX={'F':'th-TH-PremwadeeNeural','M':'th-TH-NiwatNeural'},
               WH=r'(อะไร|ทำไม|เท่าไร|เท่าไหร่|อย่างไร|ยังไง|ที่ไหน|ใคร|เมื่อไร|กี่)',pitch=False,font='Noto Sans Thai',
               credit='เสียง: สร้างโดย AI (Microsoft Edge TTS, คลาวด์)  ·  บทกำกับโดย red1')}[LANG]
VOX=CFG['VOX']; CACHE=os.path.expanduser('~/.local/share/film_narration/cache_edge'); os.makedirs(CACHE,exist_ok=True)
def tts(txt,voice,sp):
    rate=f'{round((sp-1)*100):+d}%'; h=hashlib.sha1(f'{txt}|{voice}|{rate}'.encode()).hexdigest(); w=f'{CACHE}/{h}.wav'
    if not os.path.exists(w):
        mp=w[:-4]+'.mp3'
        for attempt in range(3):   # cloud service: transient NoAudioReceived seen once; 3 tries then fail loud
            try: asyncio.run(edge_tts.Communicate(txt,voice,rate=rate).save(mp)); break
            except edge_tts.exceptions.NoAudioReceived as e:
                print(f'§EDGE_RETRY attempt={attempt+1} voice={voice} text="{txt}"',flush=True)
                if attempt==2: raise
        subprocess.run(['ffmpeg','-v','error','-y','-i',mp,'-ac','1','-ar','24000',w],check=True); os.remove(mp)
        print(f'§EDGE_CALL voice={voice} rate={rate} chars={len(txt)} -> {h[:10]}',flush=True)
    a,_=sf.read(w,dtype='float32')
    n=0
    while n<len(a) and abs(a[n])<0.01: n+=1
    return a[max(0,n-int(0.03*SR)):]   # Edge clips carry ~0.1-0.2 s lead-in silence; keep 30 ms
FILM=206.79; PAD=0.3; SR=24000; SPK={'F':1.03,'M':0.97}; RISE_ST=5.0; RISE_SPAN=0.6; CHUNK_GAP=0.12
WH=re.compile(CFG['WH'],re.I)
def gap(prev):
    p=prev.rstrip(); return 0.40 if p.endswith('?') else 0.35 if p.endswith('...') else 0.28 if p.endswith('!') else 0.22
def trim(a):
    n=len(a)
    while n>0 and abs(a[n-1])<0.01: n-=1
    return a[:min(len(a),n+int(0.06*SR))]
def f0(a):
    w=int(0.04*SR); out=[]
    for o in range(0,len(a)-w,w//2):
        x=a[o:o+w]-a[o:o+w].mean()
        if np.sqrt((x*x).mean())<0.02: continue
        c=np.correlate(x,x,'full')[w-1:]; c/=c[0]+1e-9
        lo,hi=SR//400,SR//70; seg=c[lo:hi]; m=seg.max()
        if m<0.5: continue
        for j in range(1,len(seg)-1):
            if seg[j]>=0.85*m and seg[j]>=seg[j-1] and seg[j]>=seg[j+1]: break
        out.append(SR/(lo+j))
    return np.array(out)
def end_delta(p):
    n=max(2,len(p)//4); return 12*np.log2(np.median(p[-n:])/np.median(p[:-n]))
def selftest():
    t=np.arange(int(1.2*SR))/SR
    for name,fr in [('flat200',200+0*t),('rise200-280',200+80*t/1.2),('fall220-160',220-60*t/1.2)]:
        ph=2*np.pi*np.cumsum(fr)/SR; a=0.3*sum(np.sin(h*ph)/h for h in range(1,6))
        exp=12*np.log2(fr[-int(0.3*SR):].mean()/fr[:-int(0.3*SR)].mean()); got=end_delta(f0(a))
        print(f'§F0_SELFTEST {name} endDelta={got:+.1f}st expected={exp:+.1f}st {"OK" if abs(got-exp)<0.5 else "WRONG"}',flush=True)
def qrise(a,st=RISE_ST):
    s=parselmouth.Sound(a.astype(np.float64),SR)
    man=call(s,'To Manipulation',0.01,75,400); pt=call(man,'Extract pitch tier'); n=call(pt,'Get number of points')
    if n<4: return a,False
    ts=[call(pt,'Get time from index',i) for i in range(1,n+1)]; fs=[call(pt,'Get value at index',i) for i in range(1,n+1)]
    tend=ts[-1]; t0=tend-RISE_SPAN; fref=fs[next((i for i,t in enumerate(ts) if t>=t0),0)]
    call(pt,'Remove points between',t0,tend+1)
    for q in range(11):
        u=q/10; call(pt,'Add point',t0+u*(tend-t0),fref*2**(st*u*u*(3-2*u)/12))
    call([pt,man],'Replace pitch tier')
    b=np.asarray(call(man,'Get resynthesis (overlap-add)').values[0],np.float32)
    return b[:len(a)],True
def chunks(txt):   # each question sentence voiced alone; runs of other sentences stay together (keeps their flow)
    out=[]
    for sen in [x for x in re.split(r'(?<=[.?!])\s+',txt.strip()) if x]:
        if sen.endswith('?') or not out or out[-1].endswith('?'): out.append(sen)
        else: out[-1]+=' '+sen
    return out
def voice(txt,who,sp):
    parts=[];info=[]
    for c in chunks(txt):
        a=trim(tts(c,VOX[who],sp*SPK[who]))
        kind='WH' if c.endswith('?') and WH.search(c) else 'YN' if c.endswith('?') else '!' if c.endswith('!') else '.'
        rose=0
        p0=f0(a); own=end_delta(p0) if len(p0)>=6 else None
        if kind=='YN' and CFG['pitch'] and own is not None and own<1.0:   # raise until the end measurably rises (+1 st), 3 st steps, cap 11 st
            a0=a; st=RISE_ST
            while True:
                a,rose=qrise(a0,st); p=f0(a)
                if len(p)<6 or end_delta(p)>=1.0 or st>=11: break
                st+=3
            rose=st if rose else 0
        info.append((c,kind,rose,a,own)); parts.append(a); parts.append(np.zeros(int(CHUNK_GAP*SR),np.float32))
    return np.concatenate(parts[:-1]),info
def say(turns,sp):
    out=[];marks=[];t=0.0
    for j,(who,txt) in enumerate(turns):
        a,info=voice(txt,who,sp)
        marks.append((t,t+len(a)/SR,who,txt,info)); out.append(a); t+=len(a)/SR
        if j<len(turns)-1: g=gap(txt); out.append(np.zeros(int(g*SR),np.float32)); t+=g
    return np.concatenate(out),marks
def parse(s): return [(x.strip()[0],x.strip()[2:].strip()) for x in s.split(' | ')]
selftest()
plan=[]
for l in open(src):
    i,a,b,so,sh,de=l.rstrip('\n').split('\t'); a=float(a); b=float(b); room=b-a-PAD
    aud,mk=say(parse(de),base); d=len(aud)/SR; pick='DETAIL'; d_detail=d
    if d>room:
        sp=base*d/room
        if sp<=base*1.10: aud,mk=say(parse(de),sp*1.01); d=len(aud)/SR; pick=f'DETAIL x{sp/base:.3f}'
    if d>room:
        aud,mk=say(parse(sh),base); d=len(aud)/SR; pick='SHORT'
        if d>room: pick='SKIP'
    print(f'§NARR_FIT {i} cue={a:.2f} room={room:.2f} dur={d:.2f} -> {pick} slack={room-d:+.2f} detailDur={d_detail:.2f} words={sum(len(m[3].split()) for m in mk)}',flush=True)
    if pick=='SKIP': continue
    f=f'{tag}_{i}.wav'; sf.write(f,aud,SR); plan.append((i,a,f,[(a+s,a+e,w,t) for s,e,w,t,_ in mk]))
    for j,(_,_,w,_,info) in enumerate(mk):
        for c,kind,rose,au,own in info:
            own_s='n/a' if own is None else f'{own:+.1f}st'
            if kind=='.': continue
            p=f0(au)
            if len(p)<6: print(f'§NARR_TONE {i}#{j} {w} {kind} INCONCLUSIVE voicedFrames={len(p)} "{c}"'); continue
            d_=end_delta(p); want=('rise' if kind=='YN' else 'any') if CFG['pitch'] else 'report'
            ok='OK' if want in('any','report') or d_>0 else 'WRONG'
            print(f'§NARR_TONE {i}#{j} {w} {kind} own={own_s} rose={rose}st endDelta={d_:+.1f}st want={want} {ok} "{c}"',flush=True)
def ts(x): return f'{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}'
hdr=open('ass_head.txt').read() if CAP else open('ass_head.txt').read().replace('DejaVu Sans',CFG['font']); ev=[]
for i,a,f,mk in plan:
    cap=CAP.get(i) if CAP else None
    if CAP and (cap is None or len(cap)!=len(mk)):
        print(f'§CAPTION_MISMATCH {i} turns={len(mk)} captions={0 if cap is None else len(cap)} -> native text kept',flush=True); cap=None
    for j,(s,e,w,t) in enumerate(mk): ev.append(f'Dialogue: 0,{ts(s)},{ts(e+0.35)},{w},,0,0,0,,{cap[j] if cap else t}')
ev.append(f'Dialogue: 0,{ts(FILM-8.0)},{ts(FILM-0.1)},Credit,,0,0,0,,'+('Voices: AI-generated (Microsoft Edge TTS, cloud)  ·  Script directed by red1' if CAP else CFG['credit']))
open(f'{tag}.ass','w').write(hdr+'\n'.join(ev)+'\n')
open(f'{tag}_plan.tsv','w').write(''.join(f'{i}\t{a:.3f}\t{f}\n' for i,a,f,_ in plan))
