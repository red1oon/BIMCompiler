#!/bin/bash
# ⚠ DO NOT REMOVE — mutation checks for W-BASE-HASH / W-BASE-EDIT (TEAMWORK_FRAMEWORK §13.12.I.2). Read the log: each mutant must make
# scripts/witness_comm_base.js go RED (a witness that stays green on a broken engine proves nothing).
# Run: bash scripts/witness_comm_base_mutate.sh 2>&1 | tee build/comm/logs/witness_comm_base_mutations.log
cd "$(dirname "$0")/.." || exit 1
T=$(mktemp -d); trap 'rm -rf $T' EXIT
mut() { # name, file, sed-expression
  rm -rf $T/m; mkdir -p $T/m; cp build/comm/*.js $T/m/
  cp $T/m/$2 $T/before.js; sed -i "$3" $T/m/$2
  if cmp -s $T/before.js $T/m/$2; then echo "MUTANT $1: NOT APPLIED (sed matched nothing) — INCONCLUSIVE"; return; fi
  out=$(COMM_DIR=$T/m node scripts/witness_comm_base.js 2>&1); code=$?
  echo "MUTANT $1: exit=$code  $(echo "$out" | grep -c '🔴') red lines | $(echo "$out" | grep '§W-BASE-HASH' | cut -c1-80)"
  echo "$out" | grep '🔴' | head -3 | cut -c1-170 | sed 's/^/      /'
}
echo "CONTROL (unmutated):"; out=$(node scripts/witness_comm_base.js 2>&1); echo "  exit=$? $(echo "$out" | grep '§W-BASE-HASH' | cut -c1-80)"
mut "baseRow lookup broken (the base row is never consulted)" comm_store.js 's/opts.baseRow \&\& roster.base) {/opts.baseRow \&\& roster.base \&\& false) {/'
mut "baseRow answer thrown away (scope always null)"            comm_store.js 's/sc = bl.sc; bmiss = !bl.found;/sc = null; bmiss = !bl.found;/'
mut "base-row-missing collapsed into scope-unknown"            comm_store.js 's/bmiss = !bl.found;/bmiss = false;/'
mut "checkBase always ok"                                        comm_store.js 's/if (have === want \&\& bytesOk) return/if (true) return/'
mut "checkBase ignores the hash (compares bytes only)"          comm_store.js 's/if (have === want \&\& bytesOk)/if (bytesOk)/'
mut "base-skew rule removed"                                     comm_admit.js "s/if (ctx.base \&\& env.manifest !== ctx.base) return/if (false) return/"
mut "author() never stamps the base"                             comm_store.js "s/manifest: spec.manifest || stamp || 'm0'/manifest: spec.manifest || 'm0'/"
mut "genesis base not folded into the roster"                    comm_roster.js 's/base: baseOf(gen.env.body.params.base),/base: null,/'
mut "base not put into the genesis params (space id ignores it)" comm_store.js 's/if (nsOpts \&\& nsOpts.base !== undefined \&\& nsOpts.base !== null) {/if (false) {/'
