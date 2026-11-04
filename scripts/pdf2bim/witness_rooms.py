#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §36 — Witnesses W-A1..W-A4. Issue: are the rooms and printed areas read from THIS drawing, can the reader refuse, and is its alphabet circular? Each can say NO-OP, VACUOUS or WRONG. Read the log.
# Usage: witness_rooms.py <plan.svg> <rosetta.effective.json> <template.json> <pdf> <06b log>
import sys,json,os,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT, tag_reader as TR
svg,rj,tj,pdf,lg=sys.argv[1:6]; R=json.load(open(rj)); T=TT.load(tj); RT=T['ruler']['room_tag']; K=R['sheet']['mm_per_pt_fitted']; fails=0
def say(n,v,m):
    global fails
    if v not in('PASS','FINDING'): fails+=1
    print('§A',n,v,m,flush=True)
L=open(lg,encoding='utf-8').read(); rows=re.findall(r'^§ROOM (\w+) printed (\S+) cell (\S+) .*?\| (.+?) \|',L,re.M); P=TT.stroked_paths(svg); W=TT.words(pdf,T['sheets']['plan']); B=TT.room_tags(P,T,K,TT.plan_frame(W,R,T)); xa,y5=TT.plan_origin(pdf,R,T); A,stray=TT.assign_tags(B,R,xa,y5,K)
if not B: say('W-A1','VACUOUS','no tag box found'); print('§A RESULT fails',fails); sys.exit(0)
bad=[k for k,v in A.items() if len(v)!=1]; rep=len(re.findall(r'FINDING (cell holds|a tag in no)',L))
say('W-A1','PASS' if not bad and not stray else ('FINDING' if rep==len(bad)+len(stray) else 'WRONG'),'tags %d, rooms %d, rooms without exactly one tag %s, stray %d, reported %d'%(len(B),len(R['rooms']),bad,len(stray),rep))
wrong=[r for r in rows if r[0]=='READ' and r[1]!='None' and abs(float(r[1])-float(r[2]))>=.005]; by={s:sum(1 for r in rows if r[0]==s) for s in('READ','FINDING','DEFAULT')}
say('W-A2','VACUOUS' if not rows else ('WRONG' if wrong or len(rows)!=len(R['rooms']) else ('PASS' if by['READ']==len(rows) else 'FINDING')),'%d rooms, by status %s, READ that differs from its cell %d'%(len(rows),by,len(wrong)))
judged=same=0; un=[]; diff=[]; margins=[]; strs=sorted({'%.2f'%r['printed_nominal'] for r in R['rooms'] if r.get('printed_nominal') is not None})
for r in R['rooms']:
    t=A[r['name']]
    if len(t)!=1 or t[0]['xm'] is None or r['printed_sqm'] is None: continue
    v='%.2f'%r['printed_sqm']; ink=TT.cell_ink(P,TT.area_cell(t[0]),T,K); G=TT.load_glyphs(T,tj,drop=r['name']); cands=sorted(set(strs)|{v}); c=TR.choose(ink,cands,G,RT['read_max_mm'],0)
    if v in c['unjudgeable']: un.append(r['name']+' '+v); continue
    judged+=1
    if c.get('best')==v: same+=1; margins.append(round(c['next_score']-c['score'],2) if c.get('next_score') is not None else None)
    else: diff.append((r['name'],v,c.get('best'),c.get('score')))
    print('§A   left out',r['name'],'reads',c.get('best'),c.get('score'),'next',c.get('next'),c.get('next_score'),flush=True)
ms=[m for m in margins if m is not None]
say('W-A3','NO-OP' if not judged else ('WRONG' if diff else 'PASS'),'own samples left out: %d judged, %d same, UNJUDGEABLE %s, differ %s'%(judged,same,un,diff))
say('W-A4','VACUOUS' if not ms else 'PASS','the drawn string beat every other string on the sheet in %d tags, smallest margin %s mm'%(len(ms),min(ms) if ms else None))
print('§A RESULT fails',fails)
