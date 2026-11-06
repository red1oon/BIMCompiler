#!/bin/bash
# verify_test_seal.sh — one-command tamper check for QA trust boundary
#
# PURPOSE: Detects unauthorized changes to test files, critical production
#          files, and the pre-commit hook. Part of the 4-layer QA defense:
#            Layer 1: This script (hash seal — catches accidental drift)
#            Layer 2: G4-TAMPER in RosettaStoneGateTest (catches code cheats)
#            Layer 3: Data integrity in pre-commit hook (catches data fraud)
#            Layer 4: Git diff review of [SEAL] commits (human check)
#
# USAGE:
#   bash scripts/verify_test_seal.sh            # quick: INTACT or BROKEN
#   bash scripts/verify_test_seal.sh --detail   # also shows which files changed
#
# RE-SEAL AFTER INTENTIONAL CHANGES:
#   1. Run tests + G4-TAMPER first (mvn test), verify GREEN
#   2. bash scripts/verify_test_seal.sh --detail  (see which files changed)
#   3. Update per-file hashes in docs/archive/TestArchitecture.md
#   4. Copy "Actual:" hash from output → update EXPECTED below + TestArchitecture.md
#   5. bash scripts/verify_test_seal.sh  (should now say INTACT)
#   6. git commit -m "[SEAL] Re-seal after <reason>"
#
# Sealed: 2026-11-07 (v20: 76 files — hook carries the NO-LFS guard; audit in prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §6.3)
# Manifest: docs/archive/TestArchitecture.md

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

EXPECTED="dbedb86a71ca9082965279310ec18d5e0474db3b60dfb6a9a1d83c544b46e10f"

FILES=(
  DAGCompiler/src/test/java/com/bim/compiler/contract/ArchitectureTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/RosettaPlacementTest.java
  DAGCompiler/src/test/java/com/bim/compiler/library/AnchorComputationTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/TranslationChainTest.java
  DAGCompiler/src/test/java/com/bim/compiler/coordinate/LocalCoordTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/PhantomLayoutTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/PlacementCollectorVisitorTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/BOMWalkerTest.java
  DAGCompiler/src/test/java/com/bim/compiler/library/StallDividerParamsTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/VerbStageTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/ExtractedGeometryTruthTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/EdgeVertexTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/OutputTemplateTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/BOMDigestVerifyTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/StructuralCrossCheckTest.java
  DAGCompiler/src/test/java/com/bim/compiler/arch/DriftGuardTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/CompilerContractTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/RosettaStoneGateTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/ExtractedBOMWalkTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/BomChainIntegrityTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/BOMChainMathTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/SpatialPlacementVisitorTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/StTemplatePipelineTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/BuildingRegistryTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/IntraBOMRelativeTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/MetadataIntegrityTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/DataIntegrityTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/FurnitureGeometryTest.java
  DAGCompiler/src/test/java/com/bim/compiler/contract/StackedDuplexWitnessTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/CheckBomVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/CoverWithRoofVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/RouteSprinklersVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/RosettaStoneTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/ConnectFittingsVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/CheckPlacementClashTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/CheckRoomComplianceTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/WireLightingVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/VerifyPlacementVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/TileSurfaceVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/ArrayVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/VerbStageIntegrationTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/VerbNodePersisterTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/PlaceBomVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/FloorVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/ConvenienceVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/VerbRegistryTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/ReportVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/F5IntegrationTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/HelloWorldVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/SyntheticBomPrimitiveTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/BuildingVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/UtilityVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/OverrideRoofVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/FixOpeningBboxVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/verb/BuildSpatialStructureVerbTest.java
  BIM_COBOL/src/test/java/com/bim/cobol/PrimeRuleWitnessTest.java
  ORMSandbox/src/test/java/com/bim/ormsandbox/EmptySpaceTest.java
  ORMSandbox/src/test/java/com/bim/ormsandbox/W_Verb_NodeTest.java
  ORMSandbox/src/test/java/com/bim/ormsandbox/BuildingInspectorTest.java
  ORMSandbox/src/test/java/com/bim/ormsandbox/OrderLineInterfaceContractTest.java
  TopologyMaker/src/test/java/com/bim/compiler/topologymaker/BasePOTest.java
  TopologyMaker/src/test/java/com/bim/compiler/topologymaker/TopologyBatchProcessTest.java
  DAGCompiler/src/main/java/com/bim/compiler/dsl/CompilationPipeline.java
  DAGCompiler/src/main/java/com/bim/compiler/dsl/BuildingCompiler.java
  BIM_COBOL/src/main/java/com/bim/cobol/verb/PlaceBomVerb.java
  BIM_COBOL/src/main/java/com/bim/cobol/verb/EnBlocVerb.java
  BIM_COBOL/src/main/java/com/bim/cobol/verb/WalkThruVerb.java
  ORMSandbox/src/main/java/com/bim/ormsandbox/po/MBOM.java
  ORMSandbox/src/main/java/com/bim/ormsandbox/po/MBOMLine.java
  scripts/run_tests.sh
  scripts/run_RosettaStones.sh
  scripts/lib_rosetta_helpers.sh
  scripts/rosetta_compile.sh
  scripts/rosetta_integrity.sh
  scripts/rosetta_fidelity.sh
  scripts/pre-commit
)

# Check all files exist
MISSING=0
for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "MISSING: $f"
    MISSING=$((MISSING + 1))
  fi
done
if [ "$MISSING" -gt 0 ]; then
  echo "SEAL BROKEN — $MISSING file(s) missing from trust boundary"
  exit 1
fi

# Check that the installed hook matches the tracked copy.
# --git-path, not .git/hooks: in a worktree .git is a file, and every commit there read "missing".
HOOK_PATH=$(git rev-parse --git-path hooks/pre-commit)
if [ -f "$HOOK_PATH" ] && [ -f scripts/pre-commit ]; then
  HOOK_HASH=$(sha256sum "$HOOK_PATH" | awk '{print $1}')
  TRACKED_HASH=$(sha256sum scripts/pre-commit | awk '{print $1}')
  if [ "$HOOK_HASH" != "$TRACKED_HASH" ]; then
    echo "SEAL BROKEN — $HOOK_PATH diverged from scripts/pre-commit"
    echo "  Hook:    $HOOK_HASH"
    echo "  Tracked: $TRACKED_HASH"
    echo "  Fix: cp scripts/pre-commit $HOOK_PATH"
    exit 1
  fi
elif [ ! -f "$HOOK_PATH" ]; then
  echo "SEAL BROKEN — $HOOK_PATH is missing"
  echo "  Fix: cp scripts/pre-commit $HOOK_PATH && chmod +x $HOOK_PATH"
  exit 1
fi

# Compute super-hash
ACTUAL=$(sha256sum "${FILES[@]}" | sha256sum | awk '{print $1}')

if [ "$ACTUAL" = "$EXPECTED" ]; then
  echo "SEAL INTACT — ${#FILES[@]} files, super-hash matches"
  echo "  $ACTUAL"
  exit 0
fi

echo "SEAL BROKEN — trust boundary tampered"
echo "  Expected: $EXPECTED"
echo "  Actual:   $ACTUAL"

# Detail mode: show which files changed
if [ "${1:-}" = "--detail" ]; then
  echo ""
  echo "Changed files:"
  # Read expected hashes from TestArchitecture.md
  for f in "${FILES[@]}"; do
    FHASH=$(sha256sum "$f" | awk '{print $1}')
    SHORT=$(echo "$FHASH" | cut -c1-8)
    BASENAME=$(basename "$f")
    # Check if this short hash appears in the manifest
    if ! grep -q "$SHORT" docs/archive/TestArchitecture.md 2>/dev/null; then
      echo "  CHANGED: $BASENAME ($SHORT)"
    fi
  done
fi

exit 1
