#!/bin/bash
# POC build of org.idempiere.bimootb (owner staging: quick and dirty first; the Tycho/Maven pom.xml is the convention to evolve to).
# bim-compiler prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8 P1-P3. Output: <out>/org.idempiere.bimootb_13.1.0.<stamp>/  (unpacked — Eclipse-BundleShape: dir, as iDempiere's web bundles)
# Usage: tools/build_bundle_poc.sh <idempiere server dir (for the plugins/ jars)> <bim-ootb checkout> <out dir>
# The viewer file set is a RULE, not a hand list: all of viewer/ except viewer/tests/ and viewer/buildings/ (building DBs stream or come from BIMOOTB_BUILDINGS_BASE),
# plus every ../<dir>/<file> the viewer's own .js/.html reference and that exists — except ../erp/idempiere.html (the separate browser ERP app, not the viewer).
set -euo pipefail
SRV="$1"; OOTB="$2"; OUT="$3"; HERE="$(cd "$(dirname "$0")/.." && pwd)"; P="$SRV/plugins"
Z=$(ls -d "$P"/org.adempiere.ui.zk_*/ | head -1)
CP="$(ls "$P"/org.adempiere.base_*.jar | head -1):$Z:$(ls "$P"/zk_*.jar "$P"/zul_*.jar "$P"/zcommon_*.jar "$P"/zweb_*.jar | tr '\n' ':')$(ls "$Z"lib/*.jar | tr '\n' ':')"
STAMP=$(date +%Y%m%d%H%M); D="$OUT/org.idempiere.bimootb_13.1.0.$STAMP"; rm -rf "$D"; mkdir -p "$D"
javac --release 17 -nowarn -cp "$CP" -d "$D" "$HERE"/src/org/idempiere/bimootb/*.java
cp -r "$HERE/META-INF" "$HERE/OSGI-INF" "$HERE/WEB-INF" "$D/"
sed -i "s/^Bundle-Version: 13.1.0.qualifier/Bundle-Version: 13.1.0.$STAMP/" "$D/META-INF/MANIFEST.MF"
( cd "$OOTB" && find viewer -path viewer/tests -prune -o -path viewer/buildings -prune -o -type f -print ) > "$D/BUNDLE_CONTENTS.txt"
( cd "$OOTB/viewer" && grep -rhoE "\.\./(erp|common|modeller|capex)/[A-Za-z0-9_./-]+" --include=*.js --include=*.html --exclude-dir=tests --exclude-dir=buildings . \
    | sed 's/[),;]$//' | sort -u | while read -r r; do f="${r#../}"; [ "$f" = "erp/idempiere.html" ] && continue; [ -f "$OOTB/$f" ] && echo "$f"; done ) >> "$D/BUNDLE_CONTENTS.txt"
( cd "$OOTB" && tar cf - -T "$D/BUNDLE_CONTENTS.txt" ) | ( cd "$D" && tar xf - )
echo "§BIMOOTB_BUNDLE dir=$D files=$(wc -l < "$D/BUNDLE_CONTENTS.txt") viewer=$(grep -c '^viewer/' "$D/BUNDLE_CONTENTS.txt") siblings=$(grep -vc '^viewer/' "$D/BUNDLE_CONTENTS.txt") bytes=$(du -sb "$D" | cut -f1) classes=$(find "$D/org" -name '*.class' | wc -l) 2pack=$(ls "$D"/META-INF/2Pack_*.zip | xargs -n1 basename) ootb=$(git -C "$OOTB" rev-parse --short HEAD)"
