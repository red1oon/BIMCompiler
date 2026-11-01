#!/bin/bash
# ⚠ DO NOT REMOVE — Scope: measures the repo-map facts of the v4 developer film at the PINNED commits (git show <pin>:<file>), writes build/scriptor/film_v4/repo_facts.log. Read the log. BIMCompiler pin ca532b065, bim-ootb pin 6a8023a5.
cd "$(dirname "$0")/../.."; L=build/scriptor/film_v4/repo_facts.log; : > $L
BC=ca532b065; OO=6a8023a5; OOT=$HOME/bim-ootb
for f in scripts/witness_terms.js scripts/witness_cache.js scripts/witness_trace.js scripts/dev_env.js scripts/dev_env_fetch.js scripts/dev_env_publish.js scripts/witness_witness_cache.js scripts/witness_dev_env.js prompts/TEAMWORK_FRAMEWORK.md; do echo "§REPO_LINES BIMCompiler@$BC $f $(git show $BC:$f | wc -l)" >> $L; done
echo "§REPO_COUNT BIMCompiler@$BC scripts/witness_comm_*.js $(git ls-tree --name-only $BC scripts/ | grep -c '^scripts/witness_comm_.*\.js$')" >> $L
for f in common/comm/comm_store.js common/comm/comm_roster.js common/comm/comm_envelope.js common/comm/comm_pipe.js common/comm/team_keys.js erp/team_sync.js common/tests/witness_read_scope.js common/tests/witness_read_scope_github.js common/tests/witness_f1_mailbox.js; do echo "§REPO_LINES bim-ootb@$OO $f $(git -C $OOT show $OO:$f 2>/dev/null | wc -l)" >> $L; done
echo "§REPO_COUNT bim-ootb@$OO erp/tests/witness_team_*.js $(git -C $OOT ls-tree --name-only $OO erp/tests/ | grep -c '^erp/tests/witness_team_.*\.js$')" >> $L
ex() { echo "§REPO_EXCERPT $1@$2 $3:$4 $(git -C "$5" show $2:$3 | sed -n "${4}p" | sed 's/^ *//')" >> $L; }
ex BIMCompiler $BC scripts/witness_terms.js 147 .; ex BIMCompiler $BC scripts/witness_witness_cache.js 150 .; ex BIMCompiler $BC scripts/witness_cache.js 33 .; ex BIMCompiler $BC scripts/witness_cache.js 59 .
ex BIMCompiler $BC scripts/witness_trace.js 54 .; ex BIMCompiler $BC scripts/witness_trace.js 66 .; ex BIMCompiler $BC scripts/dev_env.js 45 .; ex BIMCompiler $BC scripts/dev_env.js 46 .; ex BIMCompiler $BC scripts/dev_env_fetch.js 33 .
for l in 61 78 545 585 999; do ex bim-ootb $OO common/comm/comm_store.js $l $OOT; done
echo "§REPO_PIN_CHECK BIMCompiler $(git cat-file -t $BC) bim-ootb $(git -C $OOT cat-file -t $OO)" >> $L
echo "§RUNNER1_UNTRACKED_LINES $(grep -c '§UNTRACKED' build/scriptor/dev_env/runner1.log)" >> $L
echo "§RUNNER2_UNTRACKED_MISSING $(grep -c '^§UNTRACKED .*manifest=missing' build/scriptor/dev_env/runner2.log)" >> $L
