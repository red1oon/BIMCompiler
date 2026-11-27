# ⚠ DO NOT REMOVE — Scope: FILM-M1 — place each fitted narration clip (<tag>_<id>.wav from film_narration_fit_kokoro_v3.py) at its cue start
# in one film-length track. Issue it proves: no clip overlaps the next cue and none runs past the film (§MIX_CLIP ... OK/OVERLAP).
# Run (film_narration venv): python mix_narration.py <cues.tsv> <tag> <film_seconds> <out.wav>
import sys,os,numpy as np,soundfile as sf
cues,tag,film,out=sys.argv[1],sys.argv[2],float(sys.argv[3]),sys.argv[4]; SR=24000
track=np.zeros(int(film*SR)+SR,np.float32); n=bad=0
for l in open(cues):
    i,a,b=l.split('\t')[:3]; a=float(a); b=float(b); f=f'{tag}_{i}.wav'
    if not os.path.exists(f): print(f'§MIX_CLIP {i} SKIPPED (no fit)'); continue
    x,sr=sf.read(f,dtype='float32'); assert sr==SR; s=int(a*SR); track[s:s+len(x)]+=x; e=a+len(x)/SR; n+=1
    ok=e<=b+0.05 and e<=film; bad+=not ok
    print(f'§MIX_CLIP {i} start={a:.2f} end={e:.2f} cue_end={b:.2f} {"OK" if ok else "OVERLAP"}')
track=track[:int(film*SR)]; pk=float(np.abs(track).max()) or 1.0; track*=min(1.0,0.89/pk)
sf.write(out,track,SR); print(f'§MIX clips={n} overlaps={bad} seconds={film:.2f} peak_scaled_to=0.89 {"OK" if bad==0 else "FAIL"}')
