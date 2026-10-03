# Fitter v1: real clip durations (Jenny), DETAIL if it fits room, else SHORT, else SKIP. Writes plan + ASS captions.
import subprocess
V='/home/red1/.local/share/film_narration'; VOICE=V+'/voices/en_GB-jenny_dioco-medium.onnx'; FILM=206.79; PAD=0.3
def tts(txt,out):
    subprocess.run([V+'/venv/bin/piper','-m',VOICE,'--length-scale','1.4','--sentence-silence','0.5','-f',out],input=txt.encode(),capture_output=True,check=True)
    import wave,array
    w=wave.open(out); p=w.getparams(); a=array.array('h',w.readframes(p.nframes)); w.close()
    n=len(a)
    while n>0 and abs(a[n-1])<300: n-=1          # strip trailing silence (sentence-silence tail)
    n=min(len(a),n+int(0.08*p.framerate))
    w=wave.open(out,'wb'); w.setparams(p); w.writeframes(a[:n].tobytes()); w.close()
    return n/p.framerate
plan=[]
for l in open('hospital_script.tsv'):
    i,a,b,src,short,detail=l.rstrip('\n').split('\t'); a=float(a); b=float(b); room=b-a-PAD
    dd=tts(detail,f'jenny/{i}_d.wav'); ds=tts(short,f'jenny/{i}_s.wav')
    if dd<=room: p,t,d,f='DETAIL',detail,dd,f'jenny/{i}_d.wav'
    elif dd<=room*1.10:   # rule: speed a DETAIL up by <=10% (pitch kept) before falling back to SHORT
        k=dd/room; subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',f'jenny/{i}_d.wav','-af',f'atempo={k:.4f}',f'jenny/{i}_dt.wav'],check=True)
        p,t,d,f=f'DETAIL x{k:.3f}',detail,room,f'jenny/{i}_dt.wav'
    elif ds<=room: p,t,d,f='SHORT',short,ds,f'jenny/{i}_s.wav'
    else: p,t,d,f='SKIP',short,ds,None
    print(f'§NARR_FIT {i} cue={a:.2f} room={room:.2f} detail={dd:.2f} short={ds:.2f} -> {p}'+(f' end={a+d:.2f} slack={room-d:+.2f}' if f else ''),flush=True)
    if f: plan.append((i,a,a+d,t,f))
def ts(x): return f'{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}'
hdr='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,DejaVu Sans,46,&H00FFFFFF,&H00FFFFFF,&H90000000,&H00000000,0,0,0,0,100,100,0,0,1,2.6,0,2,260,260,48,1
Style: Credit,DejaVu Sans,30,&H00DDDDDD,&H00FFFFFF,&H90000000,&H00000000,0,1,0,0,100,100,0,0,1,2,0,8,200,200,36,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
ev=[f'Dialogue: 0,{ts(a)},{ts(max(e+0.4,a+1.5))},Cap,,0,0,0,,{t}' for _,a,e,t,_ in plan]
ev.append(f'Dialogue: 0,{ts(FILM-8.0)},{ts(FILM-0.1)},Credit,,0,0,0,,Voice: AI-generated (Piper, local)  ·  Script directed by red1')
open('hospital.ass','w').write(hdr+'\n'.join(ev)+'\n')
open('hospital_plan.tsv','w').write(''.join(f'{i}\t{a:.3f}\t{e:.3f}\t{f}\t{t}\n' for i,a,e,t,f in plan))
