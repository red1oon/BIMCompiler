#!/bin/bash
# POC build of org.idempiere.bimootb (owner staging: quick and dirty first; the Tycho/Maven pom.xml is the convention to evolve to).
# bim-compiler prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8 P1-P3. Output: TWO unpacked bundles in <out>/ —
#   org.idempiere.bimootb_13.1.0.<stamp>/        META-INF/2Pack_*.zip only, no Java (Incremental2PackActivator applies each pack once, by the version in its FILE name; §8.10:
#     2Pack_13.1.0 = the push setup, 2Pack_13.1.1 = the BIM Model link field + the retired BIM tab made inactive; the bundle version stays 13.1.0 so the UAT Guide's LA1/LA2 read the same)
#   org.idempiere.bimootb.viewer_13.1.0.<stamp>/ the static viewer at /bimootb (requires nothing: a web bundle that required ui.zk failed to start —
#     Jetty's websocket initialiser found ZK's ServerPushEndPoint through the dependency and could not load it; §8.4)
# Usage: tools/build_bundle_poc.sh <idempiere server dir (for the plugins/ jars)> <bim-ootb checkout> <out dir>
# The viewer file set is a RULE, not a hand list: all of viewer/ except viewer/tests/ and viewer/buildings/ (building DBs stream or come from BIMOOTB_BUILDINGS_BASE),
# plus every ../<any dir>/<file> the viewer's own .js/.html reference and that exists — except ../buildings/ (building DBs) and ../erp/idempiere.html (the separate browser ERP app).
# (Was a fixed list erp|common|modeller|capex: the page then 404'd 21 ../hr_bim_asset/*.js — found by the headless browser check, §8.8.)
set -euo pipefail
SRV="$1"; OOTB="$2"; OUT="$3"; HERE="$(cd "$(dirname "$0")/.." && pwd)"; P="$SRV/plugins"
[ -d "$P" ] || { echo "no plugins/ folder under $SRV (the first argument is <your iDempiere>/server)" >&2; exit 2; }   # no Java to compile since §8.10; the argument is still checked
STAMP=$(date +%Y%m%d%H%M); J="$OUT/org.idempiere.bimootb_13.1.0.$STAMP"; D="$OUT/org.idempiere.bimootb.viewer_13.1.0.$STAMP"; mkdir -p "$J" "$D"
cp -r "$HERE/META-INF" "$J/"
V="$HERE/../org.idempiere.bimootb.viewer"; cp -r "$V/META-INF" "$V/WEB-INF" "$D/"
sed -i "s/^Bundle-Version: 13.1.0.qualifier/Bundle-Version: 13.1.0.$STAMP/" "$J/META-INF/MANIFEST.MF" "$D/META-INF/MANIFEST.MF"
( cd "$OOTB" && find viewer -path viewer/tests -prune -o -path viewer/buildings -prune -o -type f -print ) > "$D/BUNDLE_CONTENTS.txt"
( cd "$OOTB/viewer" && grep -rhoE "\.\./[A-Za-z0-9_-]+/[A-Za-z0-9_./-]+" --include=*.js --include=*.html --exclude-dir=tests --exclude-dir=buildings . \
    | sed 's/[),;]$//' | sort -u | while read -r r; do f="${r#../}"; [ "$f" = "erp/idempiere.html" ] && continue; case "$f" in buildings/*) continue;; esac; if [ -f "$OOTB/$f" ]; then echo "$f"; fi; done ) >> "$D/BUNDLE_CONTENTS.txt"
( cd "$OOTB" && tar cf - -T "$D/BUNDLE_CONTENTS.txt" ) | ( cd "$D" && tar xf - )
echo "§BIMOOTB_BUNDLE dir=$D files=$(wc -l < "$D/BUNDLE_CONTENTS.txt") viewer=$(grep -c '^viewer/' "$D/BUNDLE_CONTENTS.txt") siblings=$(grep -vc '^viewer/' "$D/BUNDLE_CONTENTS.txt") bytes=$(du -sb "$D" | cut -f1) 2pack=$(ls "$J"/META-INF/2Pack_*.zip | xargs -n1 basename | sort -V | head -1) update=$(ls "$J"/META-INF/2Pack_*.zip | xargs -n1 basename | sort -V | tail -n +2 | paste -sd, -) tab_bundle=$J ootb=$(git -C "$OOTB" rev-parse --short HEAD)"
