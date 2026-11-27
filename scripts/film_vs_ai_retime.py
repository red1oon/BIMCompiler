#!/usr/bin/env python3
# Implementing prompts/FILM_VS_AI_SLOP.md §NARRATION — Witness: W-FILM-VS-AI-RETIME (§RETIME lines).
# mode "plan": read detail durations (probe fit) + current segment durations -> dur_override.json (picture waits for the voice).
# mode "tsv" : after rebuild, write cues/ends of the dialogue TSV from the real segment timeline.
import sys,json,os,re,subprocess
OUT=os.environ.get('FILM_OUT','/home/red1/bim-compiler/build/film_vs_ai/cut'); TSV=os.environ.get('FILM_TSV','/home/red1/bim-compiler/prompts/film_narration_vs_ai_dialogue_v1.tsv')
PROBE=os.environ.get('FILM_PROBE','/home/red1/bim-compiler/build/film_vs_ai/work/detail_durs.txt')
G={'open':['b1_F','b1_M'],'tease':['b2'],'reveal':['b3'],'concede':['b4a'],'why':['b4b'],'autodesk':['b5a'],'latent':['b5b'],'duel0':['d0'],'duel1':['d1'],'duel2':['d2'],
'ours':['h_open'],'clash':['h_clash'],'trade':['h_parade'],'glory':['h_glory'],'tm':['t_sched'],'whatif':['t_whatif'],'twod':['s0'],'fiveD':['s_5d'],'fourD':['s_4d'],'noai':['s_card'],
'upg':['k_upg'],'split':['k_split'],'pro':['pro'],'altc':['altc_panel'],'menu':['inspect_4d5d'],'prep':['c1'],'door':['p2'],'mit':['p3'],'shut':['sh'],'local':['col0'],
'collage':['col_%02d'%i for i in range(10)],'find':['find_frontview','find_sideview','find_topview'],'graph':['graph'],'end':['end']}
def durs():
    t=0;res={}
    for l in open(f'{OUT}/list.txt'):
        f=re.search(r"'(.*)'",l).group(1)
        d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode())
        res[os.path.basename(f)[:-4]]=(t,t+d); t+=d
    return res
mode=sys.argv[1]; D=durs()
if mode=='plan':
    det={l.split()[0]:float(l.split()[1]) for l in open(PROBE)}; ov={}
    for k,segs in G.items():
        cur=sum(D[s][1]-D[s][0] for s in segs); need=det[k]+0.7
        if need>cur: ov[segs[-1]]=round(D[segs[-1]][1]-D[segs[-1]][0]+need-cur,2)
        print(f'§RETIME {k} cur={cur:.1f} need={need:.1f}',('EXTEND '+segs[-1]+' -> %.2f'%ov[segs[-1]]) if segs[-1] in ov else 'ok')
    json.dump(ov,open(f'{OUT}/dur_override.json','w'),indent=1)
else:
    rows=[l.rstrip('\n').split('\t') for l in open(TSV)]
    for r in rows:
        segs=G[r[0]]; r[1]='%.3f'%(D[segs[0]][0]+0.15); r[2]='%.3f'%D[segs[-1]][1]
    open(TSV,'w').write('\n'.join('\t'.join(r) for r in rows)+'\n')
    print('§RETIME tsv written, film end %.1f'%max(v[1] for v in D.values()))
