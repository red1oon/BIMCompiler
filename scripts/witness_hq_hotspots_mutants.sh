#!/bin/bash
# ⚠ DO NOT REMOVE — mutants of W-HQ-HOTSPOTS (bim-compiler prompts/TEAMWORK_FRAMEWORK.md §45.7). READ THE LOG: a mutant is KILLED only when the witness prints its own FAIL line for the claim named below;
#   a crash is NOT a kill. Each mutant is a COPY (never a symlink) of the fixed tree's erp/ + common/, patched by exact-text replacement that must APPLY (count == 1) or the mutant is reported NOT-APPLIED.
# Usage: scripts/witness_hq_hotspots_mutants.sh <fixed tree> <main tree> <workdir> [mutant ...]
FIX=$1; BASE=$2; W=$3; shift 3; BC=$(cd "$(dirname "$0")/.." && pwd); mkdir -p "$W"
declare -A FILE=( [hs1-percall]=erp/ad_callout.js [hs1-never]=erp/ad_callout.js [hs2-perrow]=erp/team_sync.js [hs3-nopush]=erp/plugins/pos_import_sales.mjs [hs3-noindex]=erp/ad_index_overlay.js )
declare -A FROM=( [hs1-percall]="if (e && e.key === key) return e.ctx;" [hs1-never]="var key = [o.client, o.org, o.role, o.user, o.wh == null ? '' : o.wh, o.language || '', d].join('|')," [hs2-perrow]="return relPersons || (relPersons = (await S.order()).roster.persons); }" [hs3-nopush]="return orig.call(this, table, where, orderBy, Object.assign({}, opts, { ids: Object.keys(ids[t]) }));" [hs3-noindex]="var t0 = Date.now(), made = 0, have = 0, skip = 0, tables = {}, haveIdx = {};" )
declare -A TO=( [hs1-percall]="if (false && e && e.key === key) return e.ctx;" [hs1-never]="var key = [o.client, o.user].join('|')," [hs2-perrow]="return (await S.order()).roster.persons; }" [hs3-nopush]="return orig.call(this, table, where, orderBy).filter((r) => ids[t][String(r[this.idCol(t)])]);" [hs3-noindex]="if (true) return { created: 0, present: 0, skipped: 0, ms: 0 }; var t0 = Date.now(), made = 0, have = 0, skip = 0, tables = {}, haveIdx = {};" )
declare -A ONLY=( [hs1-percall]=hs1 [hs1-never]=hs1 [hs2-perrow]=hs2 [hs3-nopush]=hs3 [hs3-noindex]=hs3 )
declare -A WANT=( [hs1-percall]="HS1-C1" [hs1-never]="HS1-C3" [hs2-perrow]="HS2-C5" [hs3-nopush]="HS3-C7" [hs3-noindex]="HS3-C9" )
LIST=${@:-hs1-percall hs1-never hs2-perrow hs3-nopush hs3-noindex}
for m in $LIST; do
  D=$W/$m; rm -rf "$D"; mkdir -p "$D"; cp -r "$FIX/erp" "$D/erp"; cp -r "$FIX/common" "$D/common"
  python3 - "$D/${FILE[$m]}" "${FROM[$m]}" "${TO[$m]}" <<'PY'
import sys
p, a, b = sys.argv[1:4]; s = open(p).read(); n = s.count(a)
if n != 1: print('§MUTANT NOT-APPLIED (pattern count=%d) %s' % (n, p)); sys.exit(3)
open(p, 'w').write(s.replace(a, b)); print('§MUTANT-APPLIED %s' % p)
PY
  [ $? -ne 0 ] && continue
  diff -rq "$FIX/erp" "$D/erp" | sed 's/^/§MUTANT-DIFF /'
  node "$BC/scripts/witness_hq_hotspots.js" "$D" --base "$BASE" --only ${ONLY[$m]} > "$W/$m.log" 2>&1
  if grep -q "^§HS FAIL ${WANT[$m]}" "$W/$m.log"; then echo "§MUTANT $m KILLED by ${WANT[$m]}"; else echo "§MUTANT $m SURVIVED (no FAIL line for ${WANT[$m]}; see $W/$m.log)"; fi
done
