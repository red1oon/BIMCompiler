#!/bin/bash
# usage: mkopen.sh <lang en|th> <speech_open> <speech_mit> <tsv> <captions 0|1> <out opener mp4>
set -e
L=$1; SO=$2; SM=$3; TSV=$4; CAP=$5; OUT=$6; W=~/Videos/open2_work; cd $W
TXT="An exciting beginning: the core of iDempiere, its trade cycle and accounting, ported onto SQLite WASM, with screens built in the browser from its own Application Dictionary. No Postgres in Docker. No Java, Maven or JVM hell. No server to lag. AI helps resolve the issues, every fix proved against a running iDempiere, with no backdoors and no custom code per window."
prep() { # tag open|mit
  local tag=$1 id=$2 sp=$3 start=$4 tail=$5 tot; tot=$(python3 -c "print(round($start+$sp+$tail,2))")
  printf "§ERP_FILM_BEAT id=$id t=$start lang=$L\n§ERP_FILM_BEAT id=end t=$tot lang=$L\n" > beats_${L}_$tag.log
  rm -rf fit_${L}_$tag; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats_${L}_$tag.log fit_${L}_$tag $tot > fit_${L}_$tag.log 2>&1; grep -q "lang=$L wrong=0 rc=0" fit_${L}_$tag.log && break; sleep 3; done
  grep -E "POLY_TONE" fit_${L}_$tag.log
  ( cd fit_${L}_$tag; python3 - <<PY
s=open('poly.ass').read().split('\n')
if $CAP==0: s=[l for l in s if not l.startswith('Dialogue:')]
else: s=[l.replace(',48,1',',22,1') if l.startswith('Style:') else l for l in s]   # captions at the very bottom: clear of the pasted tiles
open('poly.ass','w').write('\n'.join(s)+'\n')
PY
  )
  echo $tot
}
# 1. opening card
python3 ~/bim-compiler/prompts/film_ransom_open_card.py "$TXT" $SO ${L}_silent_open.mp4 ${L}_ticks.wav 0.6 2.5 | grep -E "RANSOM done"
TOT1=$(prep open open $SO 0.6 2.5 | tail -1)
( cd fit_${L}_open; rm -f ../${L}_open_part.mp4; SFX_WAV=../${L}_ticks.wav SFX_VOL=0.35 FILM_SEC=$TOT1 python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../${L}_silent_open.mp4 ../${L}_open_part.mp4 | cut -c1-90 )
# 2. MIT continuation from the last frame
ffmpeg -v error -y -sseof -0.1 -i ${L}_silent_open.mp4 -frames:v 1 ${L}_lastframe.png
RANSOM_BASE=${L}_lastframe.png RANSOM_Y=890 python3 ~/bim-compiler/prompts/film_ransom_open_card.py "All work is MIT licensed in GitHub" $SM ${L}_silent_mit.mp4 ${L}_ticks_mit.wav 0.4 3.0 | grep -E "RANSOM done|assert|Error"
TOT2=$(prep mit mit $SM 0.4 3.0 | tail -1)
( cd fit_${L}_mit; rm -f ../${L}_mit_part.mp4; SFX_WAV=../${L}_ticks_mit.wav SFX_VOL=0.35 FILM_SEC=$TOT2 python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../${L}_silent_mit.mp4 ../${L}_mit_part.mp4 | cut -c1-90 )
# 3. chain
rm -f $OUT; ffmpeg -v error -y -i ${L}_open_part.mp4 -i ${L}_mit_part.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 $OUT
echo "opener $L: dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT) frames=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1)"
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
