#!/bin/bash
# narrate the Thai series segments (Edge TTS is intermittent: each item is retried until every row is fitted). outputs in ~/Videos/NinjaExcelReport_film/series_th/
S=~/bim-compiler/prompts/ninjaexcel_series; P=~/bim-compiler/prompts; V=~/Videos/NinjaExcelReport_film; O=$V/series_th; mkdir -p $O; cd $O; cp $P/film_narration_ass_head.txt ass_head.txt
run(){ tag=$1; tsv=$2; vid=$3; sec=$4; out=$5; rows=$(wc -l < $tsv); rm -f $out
  for i in $(seq 1 16); do
    FILM_SEC=$sec timeout 170 ~/.local/share/film_narration/venv/bin/python $P/film_narration_fit_edge.py $tsv $tag th > $tag.fit.log 2>&1
    if ! grep -q Traceback $tag.fit.log && [ "$(grep -c NARR_FIT $tag.fit.log)" -ge "$rows" ]; then break; fi; done
  FILM_SEC=$sec python3 $P/film_narration_mux.py $tag $vid $out > $tag.mux.log 2>&1
  echo "$tag tries=$i detail=$(grep -c ' -> DETAIL' $tag.fit.log)/$rows short/skip=$(grep -cE ' -> (SHORT|SKIP)' $tag.fit.log) | $(tail -1 $tag.mux.log | cut -c1-50)"; }
for c in closing:16 part2:17 compare:24 intro:26; do id=${c%%:*}; s=${c##*:}; run c_${id}_th $S/card_${id}_th.tsv $V/cards/card_${id}_th.mp4 $s $O/card_${id}_TH.mp4; done
run f2_th $S/film2_th.tsv $V/film2_raw2/NinjaExcelReport_film2_raw.mp4 213.7083 $O/film2_TH.mp4
echo THSERIES_DONE
