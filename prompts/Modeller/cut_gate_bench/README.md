<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — reproduction scripts for prompts/Modeller/CUT_GATE_CSG_SPEC.md

Never run with committed DBs — none are committed here (DB policy, CLAUDE.md). Reproduce:

```
# 1. fetch the LIVE Duplex geo store read-only (never commit it)
curl -sS -o Duplex_geo.db "https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/modeller/Duplex_geo.db?v=6"
# 2. copy the checked-in ARC db from a bim-ootb checkout + apply its self-heal patch (same as the live client)
cp ~/bim-ootb/modeller/Duplex_ARC.db .
sqlite3 Duplex_ARC.db < ~/bim-ootb/modeller/patches/Duplex_ARC.db.sql

# 3. classify the wallish candidates (task 1) — writes classify_result.json
python3 classify.py

# 4. verify per-layer box fidelity (task 3) — reads classify_result.json
python3 verify_layers_are_boxes.py
python3 verify_slab_stack.py

# 5. export the 50 refusing meshes (task 2) — run from THIS directory, writes bench/meshes.json
python3 export_meshes.py

# 6. benchmark candidate A — run from bench/ (never commit node_modules or meshes.json)
cd bench && npm install three three-bvh-csg && node bench_csg.js
# reads ./meshes.json (from step 5), writes ./bench_result.json
```

`run_output/` holds this session's actual run output (§-tagged, read per the Log Mandate) and the resulting
JSON summaries (`classify_result.json`, `bench_result.json` — small, metadata/scalars only, no raw mesh
data, safe to commit). Full findings and the architecture call: `../CUT_GATE_CSG_SPEC.md`.

## Candidate B real-kernel timing (§5 of the spec)

`bench/occt_test.mjs` times the ACTUAL production OCCT-WASM kernel (`modeller/lib/kernel/`) doing box
cuts — the same call `kernel.cut()` every existing box-wall cut already makes. The kernel's `.js`/`.wasm`
files are bim-ootb's own vendored binaries (22MB `.wasm`, not duplicated here) — to reproduce, copy the
kernel directory next to this script and convert its ESM re-exports to `.mjs` (Node's CJS-by-default `.js`
resolution otherwise misparses the emscripten module):
```
mkdir -p bench/occt
cp ~/bim-ootb/modeller/lib/kernel/{occt-wasm.js,occt-wasm.wasm,index.js,types.js,raw-types.js,svg.js,xcaf-document.js} bench/occt/
cd bench/occt
for f in index types raw-types svg xcaf-document occt-wasm; do cp "$f.js" "$f.mjs"; done
sed -i "s/from \"\.\/types\.js\"/from '.\/types.mjs'/; s/from \"\.\/raw-types\.js\"/from '.\/raw-types.mjs'/; s/from \"\.\/svg\.js\"/from '.\/svg.mjs'/; s/from \"\.\/xcaf-document\.js\"/from '.\/xcaf-document.mjs'/" index.mjs
sed -i 's/from "\.\/types\.js"/from ".\/types.mjs"/' xcaf-document.mjs
sed -i 's#await import(/\* webpackIgnore: true \*/ "\./occt-wasm\.js")#await import(/* webpackIgnore: true */ "./occt-wasm.mjs")#' index.mjs
cd .. && node occt_test.mjs
```
