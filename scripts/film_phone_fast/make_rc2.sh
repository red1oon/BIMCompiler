#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — Scope: FILM-M1 "the phone, fast" rc2 in ONE command: record every role from ONE app tree, composite, voice (Kokoro, local), mix, assemble, witness.
# READ the log of every step after the run (the evidence lines are printed at the end; the full logs are in <work>/ and copied to scripts/film_phone_fast/logs/rc2/).
# Run: make_rc2.sh <app tree> <work dir> <out.mp4>          app tree = a clean read-only checkout of bim-ootb main (Duplex + the role-B building linked in viewer/buildings/)
#   env: SKIP_RECORD=1  reuse the recordings already in <work> (re-composite / re-voice only)     ROLES="A B HQ C S"  record only some roles
#        NO_VOICE=1     silent cut (also chosen automatically, with the reason printed, if Kokoro is not runnable)
#        OPENER_DIR=<rc1 work>/opener   for the frame=trailer parity samples of witness_stage.js (default: ~/Videos/film_m1_work/opener when present)
# CPU only, headless. Never edits the app tree. Media stays under ~/Videos (work dir + out.mp4), never in git.
# Recorder steps that depend on today's UI PATH to the Issue Log: role S s_send (Help → scroll → "Issues" row → ✕ of the Help list → #issues-send-hq) and role S s_get (key I → #issues-get-team);
#   role S s_replay (HQ: Z key opens the history bar; replayTeamWalk does not open it). Role A/B/S Walk (drawer row closes the drawer by itself: swipeIfOpen). Role C: Inspect → "Clash" row, matrix cell, clash row tap/long-press.
set -uo pipefail
APP=$(cd "$1" && pwd); mkdir -p "$2"; WORK=$(cd "$2" && pwd); OUT=$3
D=$(cd "$(dirname "$0")" && pwd); REPO=$(cd "$D/../.." && pwd); VENV=$HOME/.local/share/film_narration/venv/bin/python
ROLES=${ROLES:-"A B HQ C S"}; LOGD=$D/logs/rc2; mkdir -p "$LOGD"; mkdir -p "$(dirname "$OUT")"
export BIM_OOTB=$APP
step() { echo "§MAKE_RC2 step=$1 $(date +%H:%M:%S)"; }
# ---- 0 app tree ----
step app; echo "§MAKE_RC2 app=$APP head=$(git -C "$APP" rev-parse --short HEAD 2>/dev/null) dirty=$(git -C "$APP" status --short 2>/dev/null | wc -l)"
for f in Duplex_extracted.db; do [ -e "$APP/viewer/buildings/$f" ] || { echo "§MAKE_RC2 FATAL missing $APP/viewer/buildings/$f (link it: ln -s ~/bim-compiler/deploy/buildings/$f ...)"; exit 2; }; done
# ---- 1 record (one role at a time) ----
if [ -z "${SKIP_RECORD:-}" ]; then
  for r in $ROLES; do step "record_$r"; rm -rf "$WORK/$r"; mkdir -p "$WORK/$r"
    if [ "$r" = HQ ]; then node "$D/record_phone.js" "$WORK/HQ" HQ "$WORK/A/share_url.txt" > "$WORK/HQ.run.out" 2>&1
    else node "$D/record_phone.js" "$WORK/$r" "$r" > "$WORK/$r.run.out" 2>&1; fi
    rc=$?; echo "§MAKE_RC2 record $r exit=$rc $(grep -h '§M1_RECORD' "$WORK/$r/record.log" 2>/dev/null)"; [ $rc -eq 0 ] || { echo "§MAKE_RC2 FATAL recorder $r failed (see $WORK/$r.run.out)"; exit 3; }
  done
fi
for r in A B C HQ S; do cp "$WORK/$r/record.log" "$LOGD/record_$r.log" 2>/dev/null; done
# ---- 2 plan + narration cues ----
step plan; PLAN_ONLY=1 node "$D/render_stage.js" "$WORK" frame=phone > "$WORK/plan_only.out" 2>&1 || { cat "$WORK/plan_only.out"; exit 4; }
FRAMES=$(python3 -c "import json;print(json.load(open('$WORK/stage/segments.json'))['frames'])"); SEC=$(python3 -c "print('%.4f'%($FRAMES/30))")   # exact film length (a rounded-down value cuts the last frame at the mux)
NARR=""; if [ -z "${NO_VOICE:-}" ]; then
  if [ ! -x "$VENV" ] || ! "$VENV" -c "import kokoro_onnx,parselmouth,soundfile" 2>/dev/null || [ ! -f "$HOME/.local/share/film_narration/kokoro/kokoro-v1.0.onnx" ]; then
    echo "§NARRATION SKIPPED (Kokoro not runnable here: needs $VENV with kokoro_onnx + parselmouth + soundfile and ~/.local/share/film_narration/kokoro/kokoro-v1.0.onnx) - silent cut only"
  else
    step voice; mkdir -p "$WORK/fit"; cp "$REPO/prompts/film_narration_ass_head.txt" "$WORK/fit/ass_head.txt"
    python3 "$D/make_cues.py" "$WORK" "$D/narration_en.tsv" > "$WORK/fit/cues.tsv" 2> "$WORK/fit/cues.log"; cat "$WORK/fit/cues.log"
    ( cd "$WORK/fit" && FILM_SEC=$SEC "$VENV" "$REPO/prompts/film_narration_fit_kokoro_v3.py" cues.tsv m1 1.0 > fit.log 2>&1 ); tail -n 40 "$WORK/fit/fit.log" | grep -E "§NARR_FIT|§NARR_TONE" | cut -c1-200
    ( cd "$WORK/fit" && "$VENV" "$D/mix_narration.py" cues.tsv m1 "$SEC" narration.wav > mix.log 2>&1 ); cat "$WORK/fit/mix.log"
    # loudness: the track is normalised (EBU R128, two-pass linear loudnorm) to rc1's delivered level, -16.9 LUFS; true peak <= -1.5 dBFS
    ( cd "$WORK/fit" && M=$(ffmpeg -nostats -i narration.wav -af loudnorm=I=-16.9:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
      g() { echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
      ffmpeg -v error -y -i narration.wav -af "loudnorm=I=-16.9:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 24000 -t "$SEC" narration_ln.wav
      echo "§MIX_LOUDNORM before=$(g input_i) LUFS peak=$(g input_tp) dBTP -> target -16.9 LUFS (linear, 2 pass)" >> mix.log ); tail -1 "$WORK/fit/mix.log"
    NARR=$WORK/fit/narration_ln.wav; cp "$WORK/fit/fit.log" "$LOGD/fit.log"; cp "$WORK/fit/mix.log" "$LOGD/mix.log"; cp "$WORK/fit/cues.tsv" "$LOGD/cues.tsv"
  fi
fi
# ---- 3 assemble (full render + encode + mux) ----
step assemble; FRAME=phone "$D/assemble.sh" "$WORK" "$OUT" $NARR > "$WORK/assemble.run.out" 2>&1; cat "$WORK/stage/render_stage.log" | grep -E "§STAGE_(PLAN|TAP|IMG|PAGEERRORS|FRAMES|FRAME_CHECK|CAPTION_DROPPED)"; grep "§ASSEMBLE" "$WORK/assemble.run.out"
cp "$WORK/stage/render_stage.log" "$LOGD/render_stage.log"; cp "$WORK/assemble.log" "$LOGD/assemble.log" 2>/dev/null
# ---- 4 loudness ----
if [ -n "$NARR" ]; then I=$(ffmpeg -nostats -i "$OUT" -af ebur128 -f null - 2>&1 | grep -A2 "Integrated loudness" | grep "I:" | awk '{print $2}'); echo "§LOUDNESS integrated=${I} LUFS (rc1: -16.9)" | tee "$LOGD/loudness.log"; fi
# ---- 5 witness of the stage (frame=phone + the new segment kinds + frame=trailer parity) ----
step witness; OD=${OPENER_DIR:-}; [ -z "$OD" ] && [ -d "$HOME/Videos/film_m1_work/opener" ] && OD=$HOME/Videos/film_m1_work/opener
git -C "$REPO" show origin/film/m1-clash-beat:scripts/film_phone_fast/stage.html > "$WORK/stage_rc1_unmodified.html" 2>/dev/null
OPENER_DIR=$OD node "$D/witness_stage.js" "$WORK" "$WORK/stage_rc1_unmodified.html" > "$WORK/witness_stage.run.out" 2>&1; grep -E "§WITNESS_STAGE|§WIT \(i\) RED|§WIT RED|DISCRIMINATION|page_errors" "$WORK/witness_stage.run.out"; cp "$WORK/witness_stage.log" "$LOGD/witness_stage.log" 2>/dev/null
echo "§MAKE_RC2 done out=$OUT $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$OUT")"
