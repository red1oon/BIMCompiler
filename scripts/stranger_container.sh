#!/bin/bash
# ⚠ DO NOT REMOVE — Scope: W-STRANGER in a clean container, prompts/TEAMWORK_FRAMEWORK.md §50.3. READ THE LOG after every run — the exit code is not evidence.
# Runs ONLY the developers page's commands (https://red1oon.github.io/bim-ootb/erp/team_developers.html) inside node:22-bookworm as the image's
# `node` user: fresh public clones, npm install, dev_env_fetch, terms runner (--browser 0 --fresh 1). The only mount is the log dir.
# NOT another machine: same kernel / CPU / network. Different distro, Node major, empty $HOME, no /home/red1.
# Usage: scripts/stranger_container.sh <logdir>     then: node scripts/stranger_compare.js <logdir> <host terms.json>
set -u
L=$(readlink -f "${1:?logdir}"); mkdir -p "$L"; chmod 777 "$L"
IMG=${IMG:-node:22-bookworm}
{ echo "§SC_HOST os=$(. /etc/os-release; echo "$PRETTY_NAME") node=$(node -v) at=$(date -u +%FT%TZ) image=$IMG"; } > "$L/host.txt"
docker run --rm --user node -e HOME=/home/node -v "$L":/out -w /home/node "$IMG" bash -c '
  set -u
  echo "§SC_ENV os=$(. /etc/os-release; echo "$PRETTY_NAME") node=$(node -v) user=$(id -un) home=$HOME pwd=$(pwd)"
  ls -d /home/red1 2>/dev/null && echo "§SC_ENV DEFECT /home/red1 exists in the container" || echo "§SC_ENV /home/red1 absent"
  t=$(date +%s); git clone -q https://github.com/red1oon/BIMCompiler.git && git clone -q https://github.com/red1oon/bim-ootb.git; echo "§SC_STEP clone exit=$? s=$(( $(date +%s)-t ))"
  echo "§SC_HEADS BIMCompiler=$(git -C BIMCompiler rev-parse --short HEAD) bim-ootb=$(git -C bim-ootb rev-parse --short HEAD)"
  cd BIMCompiler
  t=$(date +%s); npm install --no-audit --no-fund > /out/npm_install.log 2>&1; echo "§SC_STEP npm_install exit=$? s=$(( $(date +%s)-t ))"
  t=$(date +%s); node scripts/dev_env_fetch.js --root-bim-ootb ../bim-ootb > /out/dev_env_fetch.log 2>&1; echo "§SC_STEP dev_env_fetch exit=$? s=$(( $(date +%s)-t ))"
  t=$(date +%s); (cd ../bim-ootb/tests && npm install --no-audit --no-fund) > /out/npm_install_ootb.log 2>&1; echo "§SC_STEP npm_install_ootb_tests exit=$? s=$(( $(date +%s)-t ))"      # §50.3 fix (c): the developers page now says this is needed for the bim-ootb layer too
  t=$(date +%s); node scripts/witness_terms.js --browser 0 --ootb ../bim-ootb --fresh 1 --logs /out/terms --json /out/terms.json > /out/terms_runner.log 2>&1; echo "§SC_STEP terms_runner exit=$? s=$(( $(date +%s)-t ))"
  grep -h "§TERMS_VERDICT\|§TERMS_PORTABLE" /out/terms_runner.log
' > "$L/container.log" 2>&1
echo "§SC_DOCKER exit=$?" >> "$L/container.log"
