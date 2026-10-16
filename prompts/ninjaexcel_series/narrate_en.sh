#!/bin/bash
# narrate the English series segments: film 2 + the four cards (Kokoro). usage: narrate_en.sh  (outputs in ~/Videos/NinjaExcelReport_film/series_en/)
S=~/bim-compiler/prompts/ninjaexcel_series; P=~/bim-compiler/prompts; V=~/Videos/NinjaExcelReport_film; O=$V/series_en; mkdir -p $O; cd $O; cp $P/film_narration_ass_head.txt ass_head.txt
run(){ tag=$1; tsv=$2; vid=$3; sec=$4; out=$5; rm -f $out
  rm -f ${tag}_* $tag.ass
  FILM_SEC=$sec ~/.local/share/film_narration/venv/bin/python $P/film_narration_fit_kokoro_v3.py $tsv $tag 1.15 > $tag.fit.log 2>&1
  FILM_SEC=$sec python3 $P/film_narration_mux.py $tag $vid $out > $tag.mux.log 2>&1
  echo "$tag fit: $(grep -c ' -> DETAIL' $tag.fit.log) detail, $(grep -c WRONG $tag.fit.log) wrong, $(grep -cE ' -> (SHORT|SKIP)' $tag.fit.log) short/skip | $(tail -1 $tag.mux.log | cut -c1-60)"; }
run f2_en $S/film2_en.tsv $V/film2_raw2/NinjaExcelReport_film2_raw.mp4 213.7083 $O/film2_EN.mp4
for c in intro:26 part2:17 compare:24 closing:16; do id=${c%%:*}; s=${c##*:}; run c_${id}_en $S/card_${id}_en.tsv $V/cards/card_${id}_en.mp4 $s $O/card_${id}_EN.mp4; done
