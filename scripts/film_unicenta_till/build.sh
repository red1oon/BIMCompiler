#!/bin/bash
# ⚠ DO NOT REMOVE — build "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34 / §34.G) end to end, CPU only (CUDA hidden from TTS, Chrome --disable-gpu). READ every log under out*/ after a run; exit codes are not evidence.
# v2 (§34.D): pdfcrop first (owner's guide p23 screen + p50 diagram, generated, PDF not committed). resolve (every number from a named § log) -> guard -> cards -> voice measure -> beat lengths -> [record] -> assemble -> fit -> [mux + witnesses of the cut].
# v3 (§34.E/§34.F): slide 3 EXPAND (b0c); BEAT3=stills|live.   v4 (§34.G): FILM_LANG=en|zh|ms (out/ | out_zh/ | out_ms/; recorded clips + facts shared in out/); NEW opening card c0; BEAT3=live default (beat 3 recorded on the §38 main till + branch relay: ONLY=b3a,b3b RECORD=1 -> out/rec_b3 -> copy seg_tills/seg_admin to out/rec);
#   the VOICE text spells acronyms (voice.js), the CAPTION keeps them (<lang>_cap.tsv = the fitter's 4th argument); zh: captions split to <= 20 chars before the mux.
# MODE=A (Phase A): stops after the narration fit on dry-run timings, NO final mux.   MODE=B: mux to $OUTMP4 (never overwritten).  Recording: ROOT = the bim-ootb worktree served to the browser (RECORD=1 [ONLY=..]).
set -e; cd "$(dirname "$0")"; LANG_="${FILM_LANG:-en}"; export FILM_LANG="$LANG_"; [ "$LANG_" = en ] && OUTD=out || OUTD=out_$LANG_; mkdir -p out $OUTD/work/fm $OUTD/work/fit $OUTD/cards; MODE="${MODE:-A}"; export ROOT="${ROOT:-/tmp/wt-film-ootb-v4}" CUDA_VISIBLE_DEVICES="" BEAT3="${BEAT3:-live}"; echo "§BEAT3 mode=$BEAT3 lang=$LANG_ out=$OUTD"
HERE=$(pwd); PY=~/.local/share/film_narration/venv/bin/python; MUX=$HERE/../film_replication_engine/film6/fit6/mux_two_pass.py; EDGE=$HERE/../../prompts/film_narration_fit_edge.py; SPLIT=$HERE/../../prompts/film_zh_caption_split.py; FITK=$HERE/../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py
TAGN=narration_$LANG_
fitter() { # fitter <tag> : run in a work dir holding narration_<lang>.tsv + narration_<lang>_cap.tsv. EN = Kokoro (CPU, local); zh/ms = Edge TTS (Microsoft cloud, the PLAYBOOK's accepted path)
  if [ "$LANG_" = en ]; then $PY $FITK $TAGN.tsv $1 1.15 ${TAGN}_cap.tsv; else CAP_NATIVE=1 $PY $EDGE $TAGN.tsv $1 $LANG_ ${TAGN}_cap.tsv; fi; }
case "$LANG_" in en) LN=en;; zh) LN=zh;; ms) LN=ms;; esac
OUTMP4="${OUTMP4:-$HOME/Videos/UnicentaPOS_SQLiteWASM_narrated_$(echo $LANG_ | tr a-z A-Z)_AFTER_$(date +%F)_v$([ $LANG_ = en ] && echo 4 || echo 1).mp4}"
[ "$MODE" = B ] && [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
[ -s out/pdf/p50_diagram.png ] || node pdfcrop.js out/pdf > out/pdfcrop.log 2>&1 || { echo "§PDFCROP_FAIL see out/pdfcrop.log"; exit 3; }
node resolve.js > out/resolve.log 2>&1 || { echo "§RESOLVE_FAIL see out/resolve.log"; exit 3; }
node guard.js > $OUTD/guard.log 2>&1 || { echo "§GUARD_FAIL see $OUTD/guard.log"; exit 3; }
node cards.js render $OUTD/cards > $OUTD/cards.log 2>&1 || { echo "§CARDS_FAIL see $OUTD/cards.log"; exit 3; }; grep -q NOT-EMPTY $OUTD/cards.log && { echo "§CARD_SUBTITLE_ZONE_NOT_EMPTY"; exit 3; }; grep -q OVERFLOW $OUTD/cards.log && { echo "§CARD_OVERFLOW see $OUTD/cards.log"; exit 3; }
node tsv.js measure $OUTD/work > $OUTD/tsv_measure.log 2>&1
cp ../../prompts/film_narration_ass_head.txt $OUTD/work/fm/ass_head.txt; (cd $OUTD/work/fm && rm -f *.wav && cp ../$TAGN.tsv ../${TAGN}_cap.tsv . && FILM_SEC=400 fitter m > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js $OUTD/fit_measure.log $OUTD/beatmin.json > $OUTD/beatmin.log 2>&1 || { echo "§BEATMIN_FAIL see $OUTD/beatmin.log"; exit 3; }
if [ -n "$RECORD" ]; then mkdir -p out/rec_b3; [ -z "$FAST" ] || export FAST; ONLY="${ONLY:-b3a,b3b}" node record.js out/rec_b3 $OUTD/beatmin.json > out/record_b3.log 2>&1; fi
if [ -n "$PARTIAL" ] || [ "$MODE" = A ]; then export PARTIAL=1; fi
node assemble.js $OUTD $OUTD/beatmin.json > $OUTD/assemble.log 2>&1 || { echo "§ASSEMBLE_FAIL see $OUTD/assemble.log"; exit 4; }
F=$OUTD/film_silent.mp4; [ -e $F ] || F=$OUTD/film_partial.mp4
node tsv.js build $OUTD/work $OUTD/timeline.json > $OUTD/tsv_build.log 2>&1
cp ../../prompts/film_narration_ass_head.txt $OUTD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $F)
(cd $OUTD/work/fit && rm -f *.wav && cp ../$TAGN.tsv ../${TAGN}_cap.tsv . && FILM_SEC=$D fitter $LN > ../../fit.log 2>&1)
grep -c "^§NARR_FIT.* -> DETAIL" $OUTD/fit.log | sed 's/^/§FIT_DETAIL_ROWS /'; grep "^§NARR_FIT" $OUTD/fit.log | grep -v "> DETAIL" | sed 's/^/§FIT_NOT_DETAIL /' || true
grep -c "§NARR_TONE.*WRONG" $OUTD/fit.log | sed 's/^/§TONE_WRONG /' || true
[ "$MODE" = A ] && { echo "§PHASE_A_DONE fit on dry-run timings; no mux"; exit 0; }
[ "$F" = $OUTD/film_silent.mp4 ] || { echo "§MUX_REFUSED the film has holes ($OUTD/assemble.log)"; exit 6; }
[ "$LANG_" = zh ] && (cd $OUTD/work/fit && python3 $SPLIT $LN.ass $LN.split.ass 20 | tee ../../zh_caption_split.log && mv $LN.split.ass $LN.ass)
(cd $OUTD/work/fit && FILM_SEC=$D python3 $MUX $LN $HERE/$F "$OUTMP4" | tee ../../mux.log)
echo "§BUILD_DONE $OUTMP4"
