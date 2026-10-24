#!/bin/bash
# build.sh <recdir> <workdir> <final.mp4> : everything after the take (TEAMWORK_FRAMEWORK §15.14). Needs rec.js's output dir (videos.json, cues.json) and the card inputs in <workdir>:
#   card_recap.png (= ~/Videos/ServerDead_desktop_work/work/cards/problem.png, cmp-identical), limits.json, close.json.  Output log lines are the evidence.
set -e
REC=$1; W=$2; FINAL=$3; H=$(cd "$(dirname "$0")" && pwd); PY=~/.local/share/film_narration/venv/bin/python; mkdir -p "$W"
cp "$H"/{assemble.py,bgmake.py,cards.py,cuecheck.py,loud2.py,mk.py,overlay_ass.py,plan.py,reftimes.py,sync.py,film_checks.sh,ass_head.txt} "$W"/   # ass_head.txt = THIS film's (Num/Note/Tag/Spd styles), NOT prompts/film_narration_ass_head.txt
python3 "$H/sync.py" "$REC"
cd "$W"; [ -f bg.png ] || python3 bgmake.py
python3 cards.py limits card_limits.png limits.json; python3 cards.py close card_close.png close.json; rm -f asm/c_card_*.mp4
python3 assemble.py "$REC" plan.py asm | head -14
T=$(python3 -c "import json;print(json.load(open('asm/timeline.json'))['total_frames']/25)")
python3 mk.py asm "$REC" part3.tsv > mk.log
FILM_SEC=$T $PY /home/red1/bim-compiler/prompts/film_narration_fit_kokoro_v3.py part3.tsv part3 1.15 > fit.log 2>&1
grep -E "NARR_FIT" fit.log | grep -v "DETAIL " || true; echo "WRONG tones: $(grep -c WRONG fit.log)"
python3 overlay_ass.py asm/timeline.json "$REC/cues.json" part3.ass final_raw.ass
sed 's/  ·  Script directed by red1//' final_raw.ass > final.ass; cp part3_plan.tsv final_plan.tsv; rm -f mux1.mp4
FILM_SEC=$T python3 /home/red1/bim-compiler/prompts/film_narration_mux.py final asm/silent.mp4 mux1.mp4 > mux1.log 2>&1; tail -1 mux1.log
rm -f "$FINAL"; python3 loud2.py mux1.mp4 "$FINAL" | tail -1
bash film_checks.sh "$FINAL" asm/silent.mp4 > film_checks.log 2>&1
grep -E "frames|I:|LRA|Peak" film_checks.log | cut -c1-120
grep -E "silence_duration" film_checks.log | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \(.*\)/\2 @\1/' | sort -rn | head -3
$PY cuecheck.py part3 part3.tsv.refs.json > cuecheck.log 2>&1; tail -1 cuecheck.log
