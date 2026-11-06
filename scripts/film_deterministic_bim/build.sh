#!/bin/bash
# env: BAKE_MP4=<baked film> PY=<python with Pillow>; screenshots are read from ~/Pictures/Screenshots (names in this file)
# usage: build.sh <workdir> <durations.json|-> ; builds silent picture + cues.json. Read the printed §FILM_SEG lines.
set -e
W=$1; DJ=${2:--}; HERE=$(cd $(dirname $0); pwd); PY=${PY:-python3}   # needs Pillow
SRC=${BAKE_MP4:?set BAKE_MP4 to the baked film}; SH=$HOME/Pictures/Screenshots
mkdir -p $W/seg; cd $W
[ -f c7.png ] || { ffmpeg -v error -y -ss 22 -i $SRC -frames:v 1 frame22.png; ffmpeg -v error -y -ss 28 -i $SRC -frames:v 1 frame28.png; ffmpeg -v error -y -ss 84.9 -i $SRC -frames:v 1 frame85.png; $PY $HERE/cards.py $W "$SH/Screenshot from 2026-11-07 05-36-17.png" "$SH/Screenshot from 2026-11-07 04-32-23.png" $W/frame22.png $W/frame28.png $W/frame85.png; }
if [ "$DJ" = "-" ]; then echo '{}' > dur.json; else cp $DJ dur.json; fi
$PY - <<PY
import json,subprocess,os,sys
sys.argv=['x','dur.json']; exec(open('$HERE/segs.py').read())
t=0; cues={}; lst=[]
for beat,name,kind,arg,sec in PLAN:
    out=f'seg/{name}.mp4'
    if kind=='clip':
        ss,fac=arg; cmd=['ffmpeg','-v','error','-y','-ss',str(ss),'-t',str(sec/max(fac,1)),'-i','$SRC','-vf',('setpts=%s*PTS,'%fac if fac>1 else '')+'fps=24,format=yuv420p','-an','-c:v','libx264','-crf','17',out]
    else:
        cmd=['ffmpeg','-v','error','-y','-loop','1','-framerate','24','-t',str(sec),'-i',f'{arg}.png','-vf',f'fade=t=in:st=0:d=0.3,fade=t=out:st={sec-0.3}:d=0.3,format=yuv420p','-an','-c:v','libx264','-tune','stillimage','-crf','17',out]
    subprocess.run(cmd,check=True)
    n=int(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','csv=p=0',out]).decode().strip())
    dur=n/24.0
    cues.setdefault(beat,[round(t,3),0]); cues[beat][1]=round(t+dur,3)
    print(f'§FILM_SEG {name} frames={n} start={t:.3f} dur={dur:.3f}'); t+=dur; lst.append(f"file 'seg/{name}.mp4'")
open('list.txt','w').write('\n'.join(lst)); json.dump(cues,open('cues.json','w')); print('§FILM_TOTAL',round(t,3))
PY
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy silent.mp4
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,duration -of csv=p=0 silent.mp4
