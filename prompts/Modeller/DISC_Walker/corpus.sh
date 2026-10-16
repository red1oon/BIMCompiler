#!/bin/bash
# 7-building regression corpus + the four Hospital raster variants, one command.
# $1 = worktree to test.  Writes a log; read the log, never the terminal (Log Mandate).
WT="$1"; OUT="${2:-/dev/stdout}"
B=~/bim-ootb/buildings; M=~/bim-ootb/modeller
node "$(dirname "$0")/pathab.js" "$WT" \
  "$B/Terminal_meta.db::Terminal_meta" \
  "$B/HHS_Office_Federated_extracted.db::HHS_Federated" \
  "$M/Clinic_ARC.db::Clinic_ARC" \
  "$M/Duplex_ARC.db::Duplex_ARC" \
  "$M/SampleHouse_extracted.db::SampleHouse" \
  "$M/SampleCastle_ARC_extracted.db::SampleCastle" \
  "$HOME/Projects/BIM_DB/Hospital.db::Hospital_noraster" \
  "/tmp/hosp-local/Hospital_RASTER.db::Hosp_STALE_raster" \
  "/tmp/hosp-local/Hospital_REBUILT.db::Hosp_OWN_raster" \
  "/tmp/hosp-local/Hospital_EXTR_PATCHED.db::Hospital_extracted" > "$OUT" 2>&1
