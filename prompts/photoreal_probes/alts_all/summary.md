# §ALTS_ALL GPU run — 2026-09-27 (summary; full write-up: PHOTOREAL_STILL_RENDER.md "§ALTS_ALL RESULT (GPU)")
- Tree: bim-ootb fix/alts-all viewer @e0d2082b (sw v1474, lawHash dc0e8638); harness fixes e5417ab3 ad6e40aa f49048f2 1bf2831f (tests/ only).
- Final judge: `§ALTS_ALL_SUMMARY records=28 bakes=A,C,E,T,B,altc PASS=565 FAIL=8 INCONCLUSIVE=0 VACUOUS=0 NO-OP=2 SCOPE-BLIND=1 WARN=41`
- `§ALTS_ALL_VERDICT FAIL` · `§BAKE_RELEASE_GATE FAIL` → RELEASE GATE FAIL.
- FAIL: G4 band at clinic/inner/term (dark), night/p672 (clip), plenum (+G3 EV jump 2.55): lamp remeter re-reads the stage-meter frame
  (bandL equal to 4 digits; torch build's 3rd render read the staged scene: clinic exposure ratio 3.57 = bandL ratio).
- NO-OP: torch (&torch=0) at inner and night (PNG diff below noise; film |A-T| ≤ 0.28/255).
- SCOPE-BLIND: &gridblend=1 (default off). FAIL: Alt+C programs 137→139 at f85 (camera cut + lamp top-up).
- PASS: Z8 GZ cells 0.406/0.438 (truth 0.43/0.40), Z9/Z10/Z11/Z12/meterband/B1/Z8/specsmooth arms; film A/C/E/T/B rows.
- Setup causes seen: WebGPU OOM (red1 desktop Chrome 3.2 GB of 8 GB) on 5 presses; HospitalAjaibPath.db 404 in /tmp/wt-all bakes A/C
  (symlink needed); B reference judged vs this tree (judge fixed); BVH CDN fail at p2; Alt+C editor waited for OK (harness fixed).
- Files: alts_all.json (final rows), judge_final.log, pass1_run.log, pass2_run.log. Raw records: /tmp/alts_all/raw (not committed).
