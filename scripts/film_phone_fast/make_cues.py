# ⚠ DO NOT REMOVE — Scope: FILM-M1 narration cues. Turns narration_en.tsv (beat-keyed) into the Kokoro fitter's rows
# (id cue end source SHORT DETAIL) using stage/segments.json beat starts — no hand-typed times. Read the § lines it prints.
# Run: python3 make_cues.py <work> <narration.tsv> > cues.tsv
import json,sys
w,src=sys.argv[1],sys.argv[2]; S=json.load(open(w+'/stage/segments.json')); fps=S['fps']
at=dict(S['beatAt']); at['intro']=S['seg']['intro']+3; at['outro']=S['seg']['outro']+18   # intro: after the world appears; outro: as the line shows
rows=[l.rstrip('\n').split('\t') for l in open(src) if l.strip()]
keep=[r for r in rows if r[1] in at]
for r in rows:
    if r[1] not in at: print(f'§CUE_DROPPED id={r[0]} beat={r[1]} (beat not in the film)',file=sys.stderr)
keep.sort(key=lambda r: at[r[1]])
for i,r in enumerate(keep):
    a=at[r[1]]/fps; b=(at[keep[i+1][1]]/fps) if i+1<len(keep) else S['frames']/fps
    print(f'{r[0]}\t{a:.2f}\t{b:.2f}\t{r[2]}\t{r[3]}\t{r[4]}')
    print(f'§CUE id={r[0]} start={a:.2f} end={b:.2f} room={b-a:.2f}',file=sys.stderr)
