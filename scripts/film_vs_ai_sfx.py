#!/usr/bin/env python3
# Implementing prompts/FILM_VS_AI_SLOP.md §CUT v2 — Witness: §SFX line. Builds the camera-shutter track (one click at the start of each b1_N flash segment).
# usage: venv python scripts/film_vs_ai_sfx.py <cut_dir with list.txt> <out.wav>   (venv: ~/.local/share/film_narration/venv)
import re,subprocess,sys,numpy as np,soundfile as sf,os
C,OUT=sys.argv[1],sys.argv[2]
SRC=os.path.expanduser('~/Videos/OplogPic_camera_SLRburst2_bigsoundbank_2391_CC0.wav')   # CC0 (bigsoundbank 2391)
tmp=OUT+'.shutter.wav'; subprocess.run(['ffmpeg','-v','error','-y','-t','0.45','-i',SRC,'-af','afade=t=out:st=0.3:d=0.15',tmp],check=True)
sh,sr=sf.read(tmp); sh=sh.mean(1) if sh.ndim>1 else sh; os.remove(tmp)
t=0;starts=[]
for l in open(C+'/list.txt'):
    f=re.search(r"'(.*)'",l).group(1); n=os.path.basename(f)[:-4]
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode())
    if n.startswith('b1_') and n[3:].isdigit(): starts.append(t)
    t+=d
out=np.zeros(int((t+1)*sr))
for s0 in starts:
    i=int(s0*sr); out[i:i+len(sh)]+=sh[:len(out)-i]*0.9
sf.write(OUT,out,sr); print('§SFX shutter at',[round(x,2) for x in starts],'total',round(t,1))
