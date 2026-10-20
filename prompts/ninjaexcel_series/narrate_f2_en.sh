#!/bin/bash
P=~/bim-compiler/prompts; V=~/Videos/NinjaExcelReport_film; O=$V/series_en; cd $O; rm -f f2_en_* f2_en.ass film2_EN.mp4
FILM_SEC=213.7083 ~/.local/share/film_narration/venv/bin/python $P/film_narration_fit_kokoro_v3.py $P/ninjaexcel_series/film2_en.tsv f2_en 1.15 > f2_en.fit.log 2>&1
FILM_SEC=213.7083 python3 $P/film_narration_mux.py f2_en $V/film2_raw2/NinjaExcelReport_film2_raw.mp4 $O/film2_EN.mp4 > f2_en.mux.log 2>&1
grep -E "NARR_FIT|WRONG" f2_en.fit.log | sed 's/§NARR_FIT //' | cut -c1-110; tail -1 f2_en.mux.log | cut -c1-60
