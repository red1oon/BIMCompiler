#!/bin/bash
# usage: film_nc_full_assemble.sh <out.mp4> <tp1> <ch1> <ch2> <ch2_card_start_sec> <ch3> <tp2>
# New-edition order (red1 2026-10-14): typed part 1 + chapter 1 + chapter 2 (WITHOUT its closing process card) + chapter 3 + the process card (cut from the end of chapter 2) + typed part 2.
# All inputs 1920x1080 24 fps h264 + aac 48 kHz mono. One ffmpeg concat filter (re-encode, crf 17); the chapter films themselves are never modified.
set -e
OUT=$1; TP1=$2; CH1=$3; CH2=$4; CUT=$5; CH3=$6; TP2=$7
[ -e "$OUT" ] && { echo "refusing to overwrite $OUT"; exit 1; }
ffmpeg -v error -y -i "$TP1" -i "$CH1" -i "$CH2" -i "$CH3" -i "$TP2" -filter_complex "
[0:v]setpts=PTS-STARTPTS[v0];[0:a]asetpts=PTS-STARTPTS[a0];
[1:v]setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1];
[2:v]trim=0:$CUT,setpts=PTS-STARTPTS[v2];[2:a]atrim=0:$CUT,asetpts=PTS-STARTPTS[a2];
[3:v]setpts=PTS-STARTPTS[v3];[3:a]asetpts=PTS-STARTPTS[a3];
[2:v]trim=$CUT,setpts=PTS-STARTPTS[v4];[2:a]atrim=$CUT,asetpts=PTS-STARTPTS[a4];
[4:v]setpts=PTS-STARTPTS[v5];[4:a]asetpts=PTS-STARTPTS[a5];
[v0][a0][v1][a1][v2][a2][v3][a3][v4][a4][v5][a5]concat=n=6:v=1:a=1[v][a]" -map "[v]" -map "[a]" -r 24 -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -ac 1 "$OUT"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
echo "dur=$D frames=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 -select_streams v:0 "$OUT")"
for f in "$TP1" "$CH1" "$CH2" "$CH3" "$TP2"; do printf "%s " "$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 -select_streams v:0 "$f")"; done; echo "(input frames: tp1 ch1 ch2 ch3 tp2)"
ffmpeg -hide_banner -i "$OUT" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i "$OUT" -af silencedetect=n=-40dB:d=4 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/long silence end=\1 dur=\2/'
