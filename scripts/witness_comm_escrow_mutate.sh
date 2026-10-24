#!/bin/bash
# ⚠ DO NOT REMOVE — mutation checks for W-ESCROW / W-INVARIANTS-CHAOS (TEAMWORK_FRAMEWORK §13.12.J.3). Read the log: each mutant must make its witness go RED
# (a witness that stays green on a broken engine proves nothing). A mutant whose sed matched nothing prints NOT APPLIED and counts as INCONCLUSIVE.
# Run: bash scripts/witness_comm_escrow_mutate.sh 2>&1 | tee build/comm/logs/witness_comm_escrow_mutations.log
cd "$(dirname "$0")/.." || exit 1
T=$(mktemp -d); trap 'rm -rf $T' EXIT
run() { # label, witness-script, args...
  local lbl=$1 w=$2; shift 2
  out=$("$@" node scripts/$w 2>&1 </dev/null); code=$?
  echo "   [$lbl] exit=$code red=$(echo "$out" | grep -c '🔴') | $(echo "$out" | grep -E '^§W-' | cut -c1-110)"
  echo "$out" | grep '🔴' | head -3 | cut -c1-200 | sed 's/^/        /'
}
runc() { out=$(env COMM_DIR=$T/m node scripts/witness_comm_invariants_chaos.js 6 2>&1 </dev/null); code=$?
  echo "   [CHAOS-N6] exit=$code red=$(echo "$out" | grep -c '🔴') | $(echo "$out" | grep -E '^§W-' | cut -c1-110)"; echo "$out" | grep '🔴' | head -3 | cut -c1-200 | sed 's/^/        /'; }
mut2() { rm -rf $T/m; mkdir -p $T/m; cp build/comm/*.js $T/m/; cp $T/m/$2 $T/before.js; sed -i "$3" $T/m/$2
  if cmp -s $T/before.js $T/m/$2; then echo "MUTANT $1: NOT APPLIED (sed matched nothing) — INCONCLUSIVE"; return; fi
  echo "MUTANT $1"; case $4 in *e*) run W-ESCROW witness_comm_escrow.js env COMM_DIR=$T/m;; esac; case $4 in *c*) runc;; esac; }
echo "CONTROL (unmutated engine):"; run W-ESCROW witness_comm_escrow.js env; out=$(node scripts/witness_comm_invariants_chaos.js 6 2>&1 </dev/null); echo "   [CHAOS-N6] exit=$? $(echo "$out" | grep -E '^§W-' | cut -c1-110)"
mut2 "escrow check removed (nothing is ever exceeded)"                  comm_store.js "s/if (sp.qty > cv || sp.qty > run) return lose(h, 'escrow-exceeded');/if (false) return lose(h, 'escrow-exceeded');/" ec
mut2 "TRANSFER conservation removed (the receiver is not credited)"     comm_store.js 's/r.d\[sp.to\].i += sp.qty; eff\[h\] = /eff[h] = /' ec
mut2 "causal test removed (only the running balance judges)"            comm_store.js "s/if (sp.qty > cv || sp.qty > run)/if (sp.qty > run)/" e
mut2 "running test removed (only the author's view judges)"             comm_store.js "s/if (sp.qty > cv || sp.qty > run)/if (sp.qty > cv)/" e
mut2 "owner check removed (any device may spend any desk)"              comm_store.js "s/if (!ADM.deskOwner(roster, env.author, desk)) return lose(h, 'escrow-not-owner');//" ec
mut2 "duplicate-document check removed"                                 comm_store.js "s/if (r.k\[dk\]) return lose(h, 'escrow-duplicate-doc');//" ec
mut2 "OPEN admin check removed (anyone may open a resource)"            comm_store.js "s/if (!roster.roleAt(env.author, env.seq).comm_admin) return lose(h, 'escrow-not-admin');//" e
mut2 "OPEN need not be in the causal past"                              comm_store.js "s/if (!r || !(a\[r.oh\] || (baseE\[resh\] \&\& baseE\[resh\].oh === r.oh))) return/if (!r) return/" e
mut2 "escrow state not carried in the checkpoint"                       comm_store.js "s/if (res.escrow \&\& Object.keys(res.escrow).length) st.escrow = res.escrow;//" e
mut2 "escrow key written even when unused (not additive)"               comm_store.js "s/if (res.escrow \&\& Object.keys(res.escrow).length) st.escrow = res.escrow;/st.escrow = res.escrow || {};/" e
mut2 "escrow ops handed to the kernel (placedEnvelopes)"                comm_store.js "s/ \&\& !ESC\[p.env.body.op_type\]; });/; });/" ec
echo "MUTANT ledger made dependent on arrival order (MUTATE=ledger-order, witness-side)"; runc_env() { out=$(env MUTATE=ledger-order node scripts/witness_comm_invariants_chaos.js 6 2>&1 </dev/null); code=$?
  echo "   [CHAOS-N6] exit=$code red=$(echo "$out" | grep -c '🔴') | $(echo "$out" | grep -E '^§W-' | cut -c1-110)"; echo "$out" | grep '🔴' | head -3 | cut -c1-200 | sed 's/^/        /'; }; runc_env
