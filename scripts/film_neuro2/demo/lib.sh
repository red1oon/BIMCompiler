# # ⚠ DO NOT REMOVE — shared helpers for the Part II demo scripts (NEURO_SYMBOLIC_ORDER_CONTRACT.md §22.8). Read the log after every run.
# Each demo: an EMPTY temp folder, only the files its beat downloads (from the LIVE site / the public bucket), then ONE command whose exact line,
# stdout, stderr and exit code are saved under scripts/film_neuro2/evidence/. HOME is pointed at the empty folder so no file of this machine's
# checkouts can be picked up by a fallback path (the Viewer tool otherwise falls back to ~/bim-ootb/buildings).
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EVID="${EVID:-$HERE/../evidence}"; mkdir -p "$EVID"
LIVE=https://red1oon.github.io/bim-ootb
OCI=https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o
export NODE_PATH=/home/red1/bim-compiler/node_modules
PUP_CACHE=/home/red1/.cache/puppeteer
demo_begin() {   # $1 = demo id
  ID="$1"; F="$(mktemp -d "${DEMO_TMP:-/tmp}/demo_${ID}_XXXXXX")"; : > "$EVID/${ID}.files"
  [ -z "$(ls -A "$F")" ] || { echo "§DEMO_FAIL folder not empty"; exit 4; }
  echo "§DEMO $ID folder=$F (empty at start)"
}
dl() {           # dl <site-relative path> [base url]  : one file into the folder, recorded with sha256
  local p="$1" base="${2:-$LIVE}"
  curl -fsS --retry 5 --retry-all-errors --retry-delay 2 --create-dirs -o "$F/$p" "$base/$p" || { echo "§DEMO_FAIL download $base/$p"; exit 4; }
  echo "$(sha256sum "$F/$p" | cut -c1-16)  $(stat -c %s "$F/$p")  $base/$p" >> "$EVID/${ID}.files"
}
dl_as() {        # dl_as <remote path> <local path> <base>
  curl -fsS --retry 5 --retry-all-errors --retry-delay 2 --create-dirs -o "$F/$2" "$3/$1" || { echo "§DEMO_FAIL download $3/$1"; exit 4; }
  echo "$(sha256sum "$F/$2" | cut -c1-16)  $(stat -c %s "$F/$2")  $3/$1" >> "$EVID/${ID}.files"
}
dl_viewer_tree() {   # the measured file list of the Viewer page (viewer_files.txt), 8 at a time
  export F LIVE; local tmp; tmp="$(mktemp)"
  xargs -P 4 -I{} sh -c 'curl -fsS --retry 5 --retry-all-errors --retry-delay 2 --create-dirs -o "$F/{}" "$LIVE/{}" || echo "FAIL {}"' < "$HERE/viewer_files.txt" > "$tmp"
  [ ! -s "$tmp" ] || { cat "$tmp"; echo "§DEMO_FAIL viewer tree download"; exit 4; }; rm -f "$tmp"
  ( cd "$F" && while read -r p; do echo "$(sha256sum "$p" | cut -c1-16)  $(stat -c %s "$p")  $LIVE/$p"; done < "$HERE/viewer_files.txt" ) >> "$EVID/${ID}.files"
}
run_saved() {    # run_saved <cwd-relative command words...> : saves cmd / stdout / stderr / exit
  printf '%s\n' "$*" > "$EVID/${ID}.cmd"
  local t0=$(date +%s)
  ( cd "$F" && HOME="$F" PUPPETEER_CACHE_DIR="$PUP_CACHE" "$@" > "$EVID/${ID}.stdout" 2> "$EVID/${ID}.stderr"; echo $? > "$EVID/${ID}.exit" ) || true
  echo "§DEMO $ID exit=$(cat "$EVID/${ID}.exit") stdout=$(stat -c %s "$EVID/${ID}.stdout")B files=$(wc -l < "$EVID/${ID}.files") secs=$(( $(date +%s)-t0 ))"
  # files left in the folder, not counting the browser's own profile dirs written under HOME (.cache .config .local)
  echo "$(cd "$F" && find . \( -path ./.cache -o -path ./.config -o -path ./.local \) -prune -o -type f -print | wc -l)" > "$EVID/${ID}.nfiles_after"
}
