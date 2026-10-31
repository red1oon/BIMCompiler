#!/bin/bash
# film_checks.sh <final.mp4> <silent.mp4> : the numeric witness for the film (PRIMAL LAW: numbers, not a look). Output is the log.
F=$1; S=$2
echo "§CHECK file=$F"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,duration -of compact "$F"
echo -n "§CHECK frames final="; ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$F"
echo -n "§CHECK frames silent source="; ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$S"
echo "§CHECK silencedetect n=-40dB:d=2 (gaps >= 2 s):"; ffmpeg -hide_banner -i "$F" -af silencedetect=n=-40dB:d=2 -vn -f null - 2>&1 | grep -E "silence_start|silence_duration"
echo "§CHECK ebur128:"; ffmpeg -hide_banner -i "$F" -af ebur128=peak=true -vn -f null - 2>&1 | tail -14 | grep -E "I:|LRA:|Peak:"
