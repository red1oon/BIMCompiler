#!/bin/bash
# ⚠ DO NOT REMOVE — FILM v2 ONE PAGE: run the witnesses whose verdict lines the credits card quotes. READ every log; an exit code is not evidence.
# Usage: OOTB=<bim-ootb worktree at origin/main> LOGD=<dir> ./witnesses.sh        (headless, CPU only, DBUS unset, no paid call)
set -u; OOTB=${OOTB:?set OOTB}; LOGD=${LOGD:?set LOGD}; mkdir -p $LOGD; cd $OOTB
LIVE=https://red1oon.github.io/bim-ootb/
env -u DBUS_SESSION_BUS_ADDRESS EDSHEET_URL=${LIVE}pdf/ node pdf/tests/witness_edit_sheet.js > $LOGD/w_edsheet_live.log 2>&1
env -u DBUS_SESSION_BUS_ADDRESS NINJAPDF_LIVE=$LIVE node erp/tests/witness_ninja_pdf.js > $LOGD/w_ninjapdf_live.log 2>&1
env -u DBUS_SESSION_BUS_ADDRESS PDFM_URL=${LIVE}pdf/ node pdf/tests/witness_pdf_mobile.js > $LOGD/w_pdfm_live.log 2>&1
env -u DBUS_SESSION_BUS_ADDRESS node erp/tests/witness_file_it.js > $LOGD/w_fileit_local.log 2>&1
env -u DBUS_SESSION_BUS_ADDRESS DOORERP_SKIP_OLD=1 node erp/tests/witness_door_erp.js > $LOGD/w_doorerp_local.log 2>&1
echo "§WITNESSES_DONE" > $LOGD/w_done.flag
