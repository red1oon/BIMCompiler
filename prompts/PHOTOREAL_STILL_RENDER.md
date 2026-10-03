# ⚠ DO NOT REMOVE — Photoreal Still Render (Alt+S stills): CONSOLIDATED STATE (switched 2026-10-02, red1 go)
# SCOPE: the Alt+S still look (bim-ootb viewer). Read the log after every run; proof = § numbers, never red1's eyes (PRIMAL LAW).
# GPU: share with Alt+C allowed ("slower is OK") but keep the VRAM gate (wait while nvidia-smi used > 5.2 GB) — two red1 tab
#   crashes 2026-10-01 from VRAM exhaustion. red1 standing go: coordinate directly with the Alt+C session (ALTC_FOUNDATION.md).
# FULL HISTORY: prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-08-11_to_2026-10-02.md (9,471 lines; every `Lnnn` below is a line
#   there, ±30) and archive/PHOTOREAL_STILL_RENDER_full_history_2026-07-15_to_2026-08-11.md. New dated sections go at the END of THIS file.
# Dates are 2026 (MM-DD). bim-ootb = the viewer repo; sw vNNNN = its service-worker version.

## 1. SHIPPED / LIVE STATE
### 1a. Newest lane: bim-ootb `fix/sky-surface` (NOT merged to main / look / fast-bake / OCI)
- LATEST STATE §DEV RESUME 2026-10-02 03:15 L1962 (supersedes the 10-01 MORNING block): bim-ootb fix/sky-surface @f78a6579 sw v1536 (pushed); :8664 serves /tmp/wt-surf; light-field key 21324567:90186 (§SKY_FIELD_FURNITURE revert 233b6295); v1519 sidecars restored for stills (Clinic_meta / HHS_extracted / Terminal_meta / Hospital_meta) L1966.
- Shipped 10-01/02, default ON unless said L1969-1973: §IFC_SURFACE_NAMES (patches for 4 buildings), §WALL_TEXTURE (R5 plaster, x3 fine contrast), §FURNITURE_POLISH (rough 0.35, unmeasured: no furniture in test frame), §FLOOR_CONTACT (Terminal seats 1.09 -> 0.97 x open floor; truth ~0.6), §OBJECT_CONTACT (strength 0.5; beams/members/lights/diffusers excluded), §LOCAL_EXPOSURE_BILATERAL (halo 22 -> 0), §ZONE_EYE_SKIP_OPEN (HHS atrium dark band gone), §DOME_GLOW (round fixtures glow whole dome + limb darkening). OPT-IN: §FLOOR_F_SMOOTH.
- IN FLIGHT at handoff L1974-1981: film sidecar rebake chain (scratchpad e645a98a.../bake/chain.sh, NOLOCK + VRAM gate, NOCOPY): Hospital_silent -> HHS_silent -> Terminal_silent at 21324567:90186 into /tmp/wt-surf/buildings/patches, then restorecheck of 4 still DBs (rc_*.out). Per landed file: CHECK Hospital §SKY_FIELD_EXACT_ALL occluderTris ~ 5.8M (NOT 0), copy to /tmp/wt-fastbake/buildings/patches, message bim-compiler-20 the file + key (it merges fix/sky-surface into fix/fast-bake first, then releases the Hospital film bake). Degraded 10-01 file patches/Hospital_silent.db.lightfield.bin.degraded_occluders0: do not ship. §DOME_GLOW witness (c1/dm.sh: Clinic ...808307859 new vs &domeglow=0, domew.js -> §DOME_W meanCV / meanDarkShare per fixture): expect lower CV + dark share, then send commit f78a6579 to bim-compiler-20.
- Entries below dated 10-01 (@8325f5da sw v1525 etc.) are the older state of the same branch.
- §DEV RESUME 2026-10-01 MORNING L1965: fix/sky-surface @8325f5da sw v1525 pushed; :8664 serves /tmp/wt-surf. Hospital NOT re-baked (stale sidecar -> fast field; 49 min bake when red1 says).
- §SESSION 2026-10-02 L2000: sw v1529 -> v1534. §OBJECT_CONTACT v1529-31 (off in films, strength 0.5) L2001; §FLOOR_CONTACT sw v1528 (contact_floor.js; &floorcontact=0 off) L2035; §LOCAL_EXPOSURE_BILATERAL v1533 L2012; §FLOOR_F_SMOOTH v1534 L2017.
- Shipped 10-01 L1968-1972: §MEP_SERVICE_COLOUR v1/v2 (W-MEP-SERVICE-COLOUR PASS 9/9 @6d725a81 sw v1519 L2274), §PROXY_NAME_MAT, §LUMINAIRE_WHITE, §GLASS_TONE_STILL (k 0.3), §LAMPS_RATED_DEFAULT (EN scaling opt-in &lampen=1), §LOCAL_EXPOSURE (c 0.6, +-1 EV), &dusk=1.
- Opt-in / OFF by default L1973: §LAMP_SHADOW_TOPK (&lampshadow=K), §LAMP_CONTACT_SHADOW (&contact=1, @6957d81c sw v1524 L2383), §AO_LAMPS_FURNITURE (&aolampr=).
- §IFC_SURFACE_NAMES L2075: built @dc73f9fe sw v1526, v1527 (ifc_surface_names.js, import_worker/builder, scripts/ifc_surface_patch.js); render: §WALL_TEXTURE R5 (&r5tex=0 off), §FURNITURE_POLISH roughness 0.35 (&furnpolish=0) L2090.
- §SKY_FIELD_FURNITURE REVERTED v1532 L2007 (light_zones.js = 41144850^, key back to 21324567:90186); v1519 sidecars restored for stills; v1520 sidecars kept in e645a98a.../lf_backup_v1520.
- §DEV RESUME 09-30 NIGHT L2099: fix/sky-surface @22a8e253 sw v1515; Alt+S default 1440p (&stillres=window = old) L2101. Closed: cases 1, 2 (partly), 4, mirror (§MIRROR_OWN_MAT + §MIRROR_PARALLAX, stills only), §GI_REDIST_DEFAULT_OFF, §BEAM_UNDER_SLAB, §SKY_FIELD_OPEN_ROOF, §WINDOW_PULL.
- Version trail L2525-2695: v1506 §SKY_FIELD_EXACT_OPEN (exact only for OPEN cells; covered keep lattice + v1501 lower-only bound); v1507 §SKY_FIELD_SMOOTH (default on, &skysmooth=0); v1508 §MIRROR_OWN_MAT; v1509 §GI_REDISTRIBUTE default OFF (&giredist=1 on); v1510 §BEAM_UNDER_SLAB (IfcBeam polygonOffset(1,4)); v1511 §SKY_FIELD_OPEN_ROOF @157eee88; v1512 §WINDOW_PULL (&windowpull=0, ~0.9 s/press); v1513 Terminal closed @ede3c55c with case-4 §CSM_READBACK_GLASS merged.
- §LAMP_SHADOW_TOPK @81a1b359 sw v1516 default OFF L2150; §LAMPS_RATED_DEFAULT @2b91cc22 sw v1522 L2359; §LOCAL_EXPOSURE @723b2667 sw v1523 L2378.
- §LIGHT_FIELD_PATCH L2853: sidecar buildings/patches/<db>.lightfield.bin (gitignored, derived), LOCAL db URLs only; OCI "once light_zones.js stops changing" L2843. Sidecar name = file the viewer patches: <bld>_meta.db (Clinic/Hospital/Terminal), HHS _extracted.db L2855.
- §FIELD_KEY_CODE + §EXACT_WHEN_BAKED L3055-3058: key = hash of comment/whitespace-stripped light_zones.js; exact-all runs only if forced or loaded record built with it, else fast v1502 field.
- Sidecar keys: all 4 bakes 21324567:90186 at 09-30 night L2101; v1520 Clinic/HHS/Terminal key 1b214d46:90224 L1965 then superseded by revert L2007; re-bake _silent at 21324567:90186 (bake/chain.sh), handed to Alt+C session after its merge L2023.
- Older light-field/colour lane L3098-3279: v1488 §FAULT_TORCH_EXEMPT; v1490 §GI_CARRY; v1494 §GROUND_DOOR_CHECK; v1496 §GLASS_REFL_OPEN (look FF 7d9252d6); v1500 §METER_FIXFACE; §SKY_FIELD_EXACT SHIPPED 9d7ebc71 sw v1501 (+§GI_WAIT_BUDGET, §STILL_OVERLAY_GUARD). Release gate: look/combined-0925 FF'd to fix/alts-all-3 @0323302c sw v1478; §ALTS_ALL_VERDICT PASS (937 PASS), §BAKE_RELEASE_GATE PASS, §W_COLOUR_TRUTH_GPU 25/25 L3279.
### 1b. Look tree / main / held branches
- LIVE on main: PR bim-ootb#1783 merged 890e4c70 (look d0125d74 + Modeller), live sw v1449 L502. Look tree /tmp/wt-look (look/combined-0925) @48204a78 sw v1455 :8624 (09-30: still v1502, FF HELD pending Terminal tile question L2415). Recreate after reboot: `git worktree add /tmp/wt-look look/combined-0925` in ~/bim-ootb + `node ~/bin/serve_tree.js /tmp/wt-look 8624 &` L225.
- B1 §SKY_SHELL_RAYS L418: fable/b1-sky-field @808f578f sw v1457 (light_zones.js ?v=16); NOT merged, look NOT FF'd, no PR; READY TO FF except W6 (cost, see section 5). Attempt 1 §ZONE_CAP_CENTRE fix/zone-cap-centre 4ca8a627 sw v1456 KEPT (&capcentre=0 A/B).
- Branch fix/colour-truth @564066f5 sw v1476 (streaming.js ?v=78), pushed NOT merged: Z21 placeholder colour (0.920,0.900,0.850) -> STD_MAT class colour (A._isExporterPlaceholder; EXPORTER_PLACEHOLDER_MAT_NAMES={'tomt mönster'}), Z20 porcelain (roughness 0.08 metal 0 env 0.6), Z19 coloured IR (&ircol=0 off) L4288-4337. Merged into fix/alts-all-3 (sw v1478) L3767.
- fix/alts-all-3 @05d0ee7d then 0323302c sw v1478 NOT merged, no PR (viewer code last @b2daafd0) L3945. Fixes: ONE §METER per still on BOUND uniforms (SourcedLight.meterFinal) L3621; gi_still glass-array skip L3709; A._mepTradeHue, pipe/duct metalness 0 (&metalpbr=0) L3782; GI bounce bound k2=R/(1-R) (&gibound=0) L3816; A._repairDegenerateNormals O(tri) (&normrepair=0) L3827; _csmReadback own side (&csmsides=0) L3844; skyline seed A._photoPaintSeed (&photoseed=) L3915.
- Z9-Z12 SPECS on branches fix/z9-albedo-srgb (v1466), z10-ao-indirect (v1467), z11-bounce-linear (v1468), z12-ground-penumbra (v1469) from fix/light-law-module @39959e8a; switches &srgbfix=0, &aoindirect=0, &gialb=0, &groundlaw=0; Z11 composite-before-tone-curve and Z12 PCSS NOT BUILT L4049-4199. §LIGHT_LAW_MODULE (viewer/light_law.js, @39959e8a sw v1463) pure refactor PASS; Alt+C wiring NOT done L4389.
- Other unmerged branches: fix/cove-no-strip @fdecbd1c v1458 READY L4576; fix/meter-one-rule @1b5f1c0b v1461 -> v2 @53608f22 v1470 (supersedes §METER_ONE_RULE) L4465; fix/alts-torch @1dd60a62 v1472 PASS 7/7 (Petzl ACTIK 100 lm, 900 cd, 10.8 deg) L4525; fix/lamp-truth @c539f129 v1462 NOT READY alone L4367; fix/lamp-ao @af16db95 not merged L3172; fix/light-field-db @98677577 unfinished L3236; fix/bake-speed @9a271b18 v1479 unmerged L3258.
- Shipped 09-26/27 (FF'd into look) L227,L528-626: §CSM_NEAR_LEAK, &metermode=hist (non-default), §FAULT irOnly/hueCls, §COVE_IR, ghost-on-Esc M2, §GI_RECEIVER_QUANT, §STILL_POSE_HOST, §NO_PHOTO_PROPS, §STILL_ESC_LEAK, §ZONE_IDB_CACHE (v1433), §LAMP_LOOP, §STILL_LAMPS_OUTSIDE default 1, §LAMP_UNCAPPED, §GROUND_VIEW_FIELD (v1441), §LAMP_EN (v1442), §METER_ADAPT (v1445), §COVE_LIGHT (v1448).
- Defaults L46,L207,L538: IRC ON with MAX(IRC,SSGI) per fragment; sky = §SKY_VIEW_FIELD, portals retired (&portals=1 A/B); &metermode=avg default.
- Held, NOT merged L1110-1120,L1402: feat/film-parity @eb3a41c1 sw v1310 (fleet smoke 7/7; PR HELD by red1; defaults: film fill RESTORE, §LAMP_CAP_NEAREST OFF); feat/still-res @c8a624d8 (&stillres=window|1080p|1440p|4k; 4k cap bug).
- Live on main earlier: #1765 §STILL_EXIT_NAV v1295 L1230; #1766 §STILL_SHADOW_FIT v1298 L1274 (&shadowradius= default 1); #1767 §FRAME_REUSE_SANITY v1303 L1107; #1763 sw v1293 + hotfix #1764 v1294 L4675 (red1 "it works"); #1759 row probe v1235, #1760 film fill v1240 L4962; bounce LIVE on Alt+S sw v1234 (#1756-#1758; desktop+WebGPU+r186 only, else §GI_STILL_OFF) L5014.
- v1290 APPROVED defaults LOCKED L4918-4923 (bim-ootb 65c471b1): sky 2.0, base 0, lamps 16, lamprange 25 m, lampdecay 1.5, srgbfix OFF, bounce 1.0, ao 0.55, girecv 1, concrete 0.55/tile 4 m, portal 1 (budget 19 incl 8 shadowed), Fresnel glass ON, lampsout 0, skyocc not installed. §SURFACE_RULES R1-R9 DEFAULT ON L4968 (L5260 says OFF at 4c8c8d4f; see 7). §SUN_SHADOW_RESTORE default OFF/PARKED L5270.
- §SHADOW_SIZE_BY_ENVELOPE: 8192 only when 4096 texel > 0.12 m (env > 245) L5561. §SURFACE_R10 on feat/surface-r10 @ac6c5524 local L5001. §DLOD_TM_OWNERSHIP MERGED PR #1660 main fcd4720c sw v1141 L9059.
- Alt+S/Alt+C PRs on main (08/09): #1383 §TRINORM_LINEAR sw v1037; #1384 §SKY_SUNPOS_INIT sw v1038; #1385 Hospital data to OCI + patch; #1302 shadow bias; #1316 §MOVIE_SHADOW_TM sw v1004; #1331/#1334/#1335 §PHOTO_AO; #1575 PHOTO_ENVMAP_BOOST 3.0->2.0; #1579 CAM_LIGHT_COLOR 0xffdca8; #1601 §WALL_SIDE_AND_LIGHT_FLOOR sw v1119 (ambient 0.386 / hemi 0.617); #1621 §MEP_COLOR_SURVIVES_PHOTOREAL sw v1127; #1642 §BAKE_INTERIOR_TOPUP; §DUCT_SILHOUETTE (silhouette_refine.js, W-DUCT-SIL 10/10, sw v1129) L6003-8553. Layers 1-3 baseline; Layer 4 SSGI opt-in Alt+J only, excluded from MaxQ bake L7076.
- Films delivered ~/films/ 09-23/24: HHS 480p+1080p, Hospital 1080p L5125. Hospital re-bake ~/Downloads/Hospital_silent_bake_2026-09-05.mp4 (2937 frames, 9eb1f120, sw v1141) complete = red1's baseline L9168,L9289.

## 2. MEASURED FACTS (value + root cause)
- §DEV RESUME 10-01 L1993 (header): a shared GPU run beside an Alt+C bake can drop the bounce: 'GI_STILL_FAIL ... WebGPU error(s)' (e.g. 160,108 errors L2328). The prior-session tag §BOUNCE_SPLIT is NOT a section in the file; the 'GPU OOM from a parallel stills run' root cause given by the caller is not in the snapshot text.
- §MIRROR_STRIP L1987: v1525 bands mean L 197.5/171.9 vs 86.2 (blown 0%, was 78/70%); reflected ray hits same dark surfaces -> brightness is in the capture's lit value, not parallax. Parallax witness 512/512 px within 0.5 m, err 2.01->0.05 m L2634.
- §SKY_FIELD_FURNITURE revert cause L2007: occluderTris=0 (v1519 5,819,012) - furniture pushed soup over 6M budget; shellSoup drops ALL occluders over it L2287.
- §CONTACT_BRIGHT L2129: Terminal seats/open 1.07 default, 1.00 &lamps=0; lamps ~90% of hall floor light. §FLOOR_CONTACT L2029: under seats app/open 1.09, geometric visibility Vh seats 0.57, tables 0.70; kernel = textbook within 0.5% L2043. §SKY_FIELD_FURNITURE seats/open 1.08 = WITNESS FAIL L2302. §AO_LAMPS darkens under-furniture only 1-2% L3108.
- §LAMP_CONTACT_SHADOW L2326: len 0.5/thick 0.5 seats 0.92; notches present with &contact=0 -> 0.5 m cell steps, not contact L2333.
- HHS L2341-2356: lamps at ~13% of rated (§LAMP_EN); &lampen=0 Lavg +13%; truth grid shows daylight NOT over-read; &dusk=1 exposure 4.0->12.6, windows clipped 99.9%. §LOCAL_EXPOSURE HHS lamp-dominant px +0.64 EV, blown 0.41->0.08%, 885 ms L2379.
- §IFC_SURFACE_NAMES L2083: Clinic DB material_name 2430/2586 (before 0); patch 3,777 elements, 0.85 s, idempotent. Clinic walls style 'Default Wall' x1062 vs material 'Plasterboard | Metal - Stud Layer | Plasterboard' L2079.
- §SKY_FIELD_EXACT cause L2467-2719: exact all-cell field RAISES walls (exposure …038659 247->149, -0.73 EV): value right at cell centre but surfaces read it ~0.5 m off (fattened solids +0.43..0.59 m). Hospital lattice F 3-16x too high: one of 41 dirs (w 0.0886) credited via glass; exact 0.004-0.019. Build cost: Clinic 134 s, HHS 188 s, Hospital 1,146,922 cells 293.6 M rays 1,994 s (33 min) L2940.
- §SKY_FIELD_EXACT_OPEN L2530: covered px F identical 6/6 poses; dEV 0..0.009. §SKY_FIELD_SMOOTH: wall Lf jumps 738->337, blown 7.71->6.13% L2582; but doubles Clinic …142544 floor patchiness 5.4->10.1% L2639. §SKY_FIELD_OPEN_ROOF: roof brightness = ground bounce (rho 0.368 = earth 0.16 x display gain 2.3); groundview=0 metal 232->144 L2665.
- CASE 4 §CSM_READBACK_GLASS L2543: 65 R10 window arrays drawn solid -> zMax 6.6 m -> hall in no cascade box -> full sun; fix zMax 6.6->36.4, column std 31.4->5.1, blown 2.04->0%. §STILL_SHADOW_CASCADE uncovered=0 was scope-blind.
- MIRROR L2597: IfcFlowTerminal M_Mirror black because shared MEP mat + one 128 px env cube at building centre; §MIRROR_OWN_MAT Lf 7->40.5. §BEAM_UNDER_SLAB L2636: strip Lu 88->39 = coplanar depth fight beam/slab.
- Z18 L3322: stair-stepped teeth = §GLASS_SPEC_GATE binary mirror march; §SPEC_SMOOTH binary jump/cm 0.80->0.014 L3437. Z26 L3125: Clinic dark roof-glass = 0.5 m voxel thickening, glassReflDark 5/44->2/44. Z25 L3116: fixtures whole mesh emitted 6818 cd/m2 944/955 clipped; §FIXTURE_FACE housing 95.8->0%.
- Blowout L3078: auto-exposure normalises to mean ~106-122; dim interiors +6.5..+9.55 stops (x750); lux->L ~3x loss (303 lx predicted ~48 cd/m2 vs 16.5 measured).
- §METER L3601: meter render used DUMMY zone texture, every earlier "stable" EV wrong; BOUND inner 7.85, night 13.98. FIX 1 final EV100 pass1->bound: clinic 8.79->7.04, inner 9.68->7.85, Terminal 10.31->7.55 L3728.
- FIX 9 L3700: DEFECT 6 cause = gi_still.js `Array.isArray(m)` skip left R10 glazing in GI pass as solid wall. FIX 14 L3830: first-press black glass = NaN from 145 zero-length normals. FIX 16 L3846: plenum sun leak = csmReadback DoubleSide vs FrontSide still. FIX 17 L3921: G7 tr4 drift = skyline boxes re-rolled by Math.random.
- §RED1_STILLS_0928 L3990: HITOS ground z=27.63 vs true grade ~24.05-24.7 (~3.4-3.6 m too high; tools.js _calcGroundY top-5-by-area rule; data/heuristic defect).
- B1 L270-482: facade F 0.06-0.37 vs 64-ray truth 0.23-0.54 (thin features fattened to 0.5 m cell). W1 within +-0.1: Hospital 60.4->100%, Clinic 37.5->100%, Terminal 16.4->98.6%; W4 §GLARE 0/0/0; W6 FAIL: Hospital cold first press 11k -> ~20.6 s (+9.5 s, spec <= +5), Clinic 2,831->3,689, Terminal 8.0->10.7 s (64-ray pass 6.4 s, BVH 2.2 s).
- S1 §CSM_NEAR_LEAK L528: Clinic blown 9.83% real (cascade 0 box 1 m zMin floor; 6250->0, 9.67%->0.03%); Hospital 0.95% sunlit exterior through glass T 0.30 (physical); HHS 1.24% ELEC emissive (physical). §COVE_IR plenum dark 4.15->0% L549. §COVE_LIGHT Hospital inner room black px 45,980->~1,050 L703. §LAMP_LOOP first staged frame 157 s -> 7 s L626. §LAMP_UNCAPPED Terminal 861/861 lit, Hospital 1274/1274 (was 160) L657.
- §LIGHT_TRUTH_AUDIT L9295-9432: exposure applied 0.45 x0.85 = 0.3825; Eout 4.05 u = 92 klx; hemi sky 21.3 klx DHI/DNI 0.213 in cited 0.10-0.25; ground half 0.63x physical (-0.67 stop). 26 LIVE rows UNSOURCED; NO-OP rows #4,5,16 (delete). TOP-5 pale-bright/night-dark: (1) §METER D=CIECAM02 =1.000 outdoors -> all-shade view +2.4 stops (0.3825->2.05); (2) meter hides sky+glass; (3) base 0.45x0.85 mood anchor; (4) gi_still bounce after tone curve, albedo fixed 0.5, giIntensity 10; (5) IFC colours used as linear (loader.js:145, x2.3 mid-grey). Blotch rank: N8AO (32 px screen radius) > gi_still AO+bounce > per-zone flat IR/lamp scale > sky-field stencil > sun PCF per cascade > concrete triplanar > lamps decay 1.5.
- §STILL_SHADOW_FIT L1234: Hospital texel 0.088->0.022 m (3.94x), atrium 4.35x, Terminal hall 4.49x; mismatch 0, lost 0. §STILL_RES L1277: 1440p 2776x1440 PASS (refine 7.4 s, bounce 85.8 s); 4k capped 3998x2074 by MAX_PIXELS. §FILM_PARITY cost L1375: 1080p 0.93 s/frame control, +132 lamps 1.80, +bounce 1.93; first frame 111 s; film ~66 min vs ~32. §GI_FILM_BLANK_GRAB: Hospital 5-10/120 blank frames, guard -> 0 L1388.
- §SOURCED_LIGHT before L1551: lamp light leaked through wall/slab 54-87%; lamps 100-700x too strong; fixtures inside room rects 0 of 2275 -> room rects can't carry zones L1558. §SOURCED_DAYLIGHT v1 ADF FAILED (DFmax 125.6%) L1697. §GLASS_VEIL cause: two shared-material faces 2 cm apart, opacity 0.3 L1815. §LAMP_ZONE_PICK: fly-in 39% black; zone-1 lamps kept 123->20 L1851.
- §GI_BUILT L5349-5361: Alt+S first press HHS 127,065 -> 3,003 ms (cause: one synchronous WebGPU pipeline per render object); Hospital first press ~68 s L5623. §STILL_LAG L4872: press-2 bounce 10x slowdown with portals off -> kept WebGPU renderer. §GI_SHARED_ATTR_WIDEN: second renderer rewrote shared 16-bit index arrays to 32-bit; frames losing slabs 355->129->10->3 L5430. §GI_READBACK_ROWPAD: 256-B row alignment (864 px) L5493. §GI_STILL_ORIENT_GEOM: colour score picked upside-down 3/4 poses; rule decisive if hi>=3*lo && hi-lo>=0.1 L5611. §GI_ROW_PROBE: red1 desktop Clinic flipOut=true, opposite of headless L5551.
- §SUN_SHADOW_RESTORE INERT L5067: pass classed 0/1,439,424 shadowed (shader read RGBA8 colour not depthTexture). §SURFACE_RULES: Terminal roof layer 33,225/33,324; textured 46,729->32,921; HHS 5,600->278; Hospital 51,516->1,320 L5231. §SURFACE_R10 split fleet 1,346/1,405 (95.8%) L5289. §FLOOR_WASH: sRGB used as linear; &srgbfix=1 darkens approved looks (aerial 92.5->75.4) L4914.
- §TRINORM_LINEAR L5989,L6005: normFactor from sRGB bytes under-normalised 2.0-2.4x; valve black px 719->0 = real cause of §RED_GREY_MYSTERY (NOT normals). §SKY_SUNPOS_INIT L6041: sky band 192/192 black -> 0/192. §HOSPITAL_META_DB_STALE L6428: 56,751/63,415 null material_rgba -> regenerated 99.6% coloured.
- §MAIN_BUILDING_SHADOW L7299: shadow.bias is NORMALISED depth: 0.305 m toggleShadow vs 9.874 m photo path (32.4x); fix worldBias 0.836 m. §SUN_SHADOW_GRAZE_SCALE L6721: mask binary; kernel/strength changes meanAbsDiff=0. §PHOTO_SHADING_CEILING L7633: per-pixel shading attempts 1-7%; PHOTO_GRADE v1 pivot 17.6x wrong.
- §SUN_FILL_RATIO L8095: cause = HDRI env swap (unshadowed IBL) 76% of away-wall staged light; shipped separation 0.2526 Clinic / 0.2839 Hospital (corrected, supersedes 0.2388/0.2347) L8567. `pl=0.00000` was instrument artefact: interior pl share Hospital 29.4%, Clinic 21.8%. Interactive Alt+S never gets still near-field floor (effects.js:4918 guard false before :4945 builds _nightLights; maxLights 30, nearFadeFloor 0.3) L8613.
- §MEP_COLOR L8153: tint was no-op on 4/5 buildings (Hospital 41,987 MEP rgba 0.92,0.90,0.85); T=0.344 derived; witness 55/55 five buildings. §DUCT_SILHOUETTE L8484: ALPHA=0.5 derived; fleet refined Terminal 28 8.2x, JKR 74 10.55x, Clinic 59 5.45x, HHS 117 5.12x; 5 m gate +59.3 MB Hospital.
- §BAKE_INTERIOR_TOPUP §BIT.1 L8861: bake pose selected fixtures by frustum-centre only; empty set leaves slots 0 -> exterior lively / interior gloomy.
- §BME.8 L9059: ROOT CAUSE: dlod.js `_buildRefs()` ran after TM zeroed unplaced instances -> `_origMatrix` zero -> 24,992 "restored" to zero (InstancedMesh half only). Ownership witness RED on main @2ac311ac, GREEN on 9eb1f120 L9151. §BME.12: dlod cull spheres miss geometry at 357/3135 instances (§DCS, unfixed) L9212. §BME.13: two broken-index geometries (771efc52..., 8be27af9...; 7 MEP elems) = extraction defect; #1631 cleared L9251.
- §WEBGPU_SSGI_SPIKE L5642: realism-effects dead upstream (2024-02-03); three SSGINode needs r186; dual GPU context works L5692. §LTU_FLOOR_FLICKER L7098: z-fight and DLOD swap refuted; cause = transparent-sort instability (not fixed).

## 3. RED1 RULINGS (dated; direct quotes)
- PRIMAL/standing: proof = § numbers, never red1's eyes: "no more rely on my visuals" 09-26 L719; "no more time wasting outside WITNESS logging" 09-25 L90; "if u say near black, that is rejected" L6207.
- 09-25: "Alt+S the source of truth ... Alt+C merely inherits" L145/L1803. "research the industry's best practice first, or else we become prior art" L1410. "The paramount idea is bounce. If it is all washed, we cannot enjoy good bounce." / "light cannot leak through walls in real life except through glass." L1441. PR held: "establish the principles of lighting first" L1408.
- 09-25: only real sources; "not a knob bumped up by the number of lights"; no exposure/brightness knob, no lamp caps, no per-building values L1095,L1141. "darker is expected, but at least realistic" L57; 09-26 "darker is realistic" (meter counts all light, IRC_MAX) L673. Outside-looking-in APPROVED: interiors stay at outdoor exposure from outside, "exposure changes on entering" L139,L1842.
- 09-25/26: glow layers "I mean remove completely" L1869 (deleted); PHOTO PROPS remove completely L199. §BLACK_INTERIOR: "a dark place just gets ceiling perimeter back glow" L102; shafts/plenum "as long it's not left in the dark" L549. Lamps outside ON: "good to have them on and bright so outside view can be impressive" L650. "lamp strength should be commensurate with indoor space, a standard governs it" L681.
- 09-24: "The Alt-S, can we bump up its resolution?" L1252; approved v1290 look ref4 17:35 "I think this is the one" L4918; Fresnel "reflection has to follow the physics: a lit surface reflects well" L4868; round lamps "soft amber, rectangular ones white" L4827; "remove §STILL_GUARD ... let it load normally, it's a user learning curve" (keep §STILL_LOCK) L4693; Alt+S desktop-only by design L5625.
- 09-27: "launch a Fable agent to tackle the toughest layer" (overrides Sonnet-only for that task) L223; RULING "If original colors then OK"; outside very bright through openings WANTED "relative eye adjustment", do not cap L4555; LAW §LIGHT_ONE_SCALE "The laws of optical physics should be singular" L4346; "torch effect is more realistic" L4350; §COVE_NO_STRIP "need not have the actual lighting element. That be inventing objects ... Need not be accurate or bright" L4576; Z21 "MEP in Hospital even normal canvas, is all greyish" L4204; Z20 "at least toilet bowls should have porcelain white" L4238; "You have my confidence and mandate to chase paths till zero" L3296; RELEASE GATE: nothing handed to red1 until witness PASS, "let the WITNESS logging dig thoroughly to filter off any GIGO" L1955,L3490.
- 09-28: "lighting fixtures treatment as it is, is very nice now" -> keep 4 pi omni L3157. "rest on alt-s to see to alt-c first" L3290.
- 09-29: TEST EACH CASE TO ZERO; one building/one defect; no batch bakes L2993; precomputed light results into LOCAL DB copies first, OCI only after numbers stop moving L3089; "I am just worried of impact and bloat ops" -> "Yes" to §FIELD_KEY_CODE/§EXACT_WHEN_BAKED L3049; "a guard not to allow the canvas to be in x-ray or other overlay mode" L2755.
- 09-30: "we already know much from Hospital's many stills — abort and channel effort to a single catch-all approach"; ONE dev building (Clinic), bake others once at end L2441; "Agreed": v1502 default + exact only where lattice plainly wrong L2514; mirror "exploit [the glass reflection quality] and use the mirror finishing on those IFCs" L2599; "yes" giredist default off + §MIRROR_PARALLAX L2632; §WINDOW_PULL "As you know best" L2679. NIGHT RULING L2691: "if it is due to IFC element been not well put, then it is not our fault. Leave it be as a truth." (IFC-as-modelled is truth; renderer fixes only where model consistent and renderer arbitrary).
- 10-01: "resolve the light passing thru objects ... don't fix, find out first" L2158; "realistic coloring rather than plain all grey", follow industry L2198; "patch P1 and P2, tone down glass in stills" L2260; params should be DERIVED not authored L2336; stills = BRIGHT DAY, dusk is Alt+C's; "leave the lights on as normal practice when clients view property" L2357; seat shadows "stick to commonly easy" -> STOP chasing L1975; 15:00 re-prioritise: mirror LOW, HIGH = shadow under furniture then §IFC_SURFACE_NAMES; "Higher is the shadow under furniture on floor. It has to give some shadow play" L2025; "surfacing is bland when all greyish ... more realistic surface treatment" L2047/L2092; "that seating shadow not getting it. Study don't fix" L2390; "note what to patch but not bake yet as alt-c is using" L2244.
- 10-02: "full yes, all the way. Don't wait for me" + coordinate directly with Alt+C session (bim-compiler-20); GPU may be SHARED with Alt+C ("slower is OK") keeping VRAM gate (wait while nvidia-smi used > 5.2 GB) L1963-1965.
- 09-02/04: "it should be LIVELY. So far it has never been, though lighting has been BRIGHT" L8559; "No custom code to any particular building has been our rule" L8495; "the indoor is gloomy and not lively" L8835; "In the return to start, the whole buildup is supposed to be fully completed" L8965; 09-04 "the issue with Hospital is now solved ... we shall use that as the baseline" L9289; 09-02 MEP std colours Yellow/Blue/Green/Red, fire-red "is fine" L8125.
- 08-12 §SUN_START_TIME: fixed 6 h film, one setting start time, default 12:00, range 06:00-12:00 L6924. 08-15 "I rather u do not fix that script as i fear it is pivoting and drifting" (extraction) L6281; "Hospital 0.920,0.900,0.850 default: NO CHANGE!!!" L6635. 08-27 "we already got things too bright, shiny reflection, it be shadow effects for realism"; "Indoor lighting should have more warm lighting" L7561. 08-05 schedule accuracy over movie polish (weather is polish) L7055. 08-30 PHOTO_GRADE reverted on red1's call L7648.

## 4. DEAD ENDS (tried X; ruled out because Y)
- §SKY_FIELD_FURNITURE: furniture in sky soup; no gain, reverted v1532 (soup over 6M budget drops all occluders) L2007. §LAMP_SHADOW_TOPK share 13-20% no gain L2304; §AO_LAMPS_FURNITURE no gain L1974; §AO_LAMP_BUF fix/lamp-ao -0.7% only L3172; §LAMP_CONTACT_SHADOW hard jagged patches (binary occ) -> opt-in only L2383.
- §SKY_FIELD_SURFACE (floor/wall surface exact): witness FAIL, reverted, never committed L2494. §SKY_FIELD_EXACT all-cell: raises walls (see 2) L2467. §SOURCED_DAYLIGHT ADF FAILED -> §SKY_VIEW_FIELD L1697. B1: moving ray start / skipping own-wall voxels does not fix L377.
- Seat shadows: red1 premise "overlighting from outside" not supported by measurement (lamps larger) L2113,L2138. HHS "daylight over-read" disproved by truth grid L2352. Clinic corridor mottle: NOT sky field/groundview/indirect AO, unexplained L3021.
- §MIRROR: grab bars NOT mirror-finished before (earlier read wrong) L2615. Wall "blockiness" = metric artefact L2646. Z18 diffuse-grid stepping ruled out; &gridblend=1 not the fix L3321.
- Hypotheses retracted: tower blotch NOT portal shadows L39; rainbow edge = 8-bit near-black hue not zone mixing L613; first-press black glass NOT GLASS_ENV unbound/HalfFloat L3750; "Hospital atrium roof glass" false (no roof glazing) L1667; "ground shadow gap" = harness error L1379; §RED_GREY_MYSTERY degenerate-normals verdict WRONG (real = §TRINORM_LINEAR) L6021; `pl=0.00000` claims RETRACTED L8567; §BME.3 two retractions (178 IfcCurtainWall absent = missing glass; SFR map swap churn) L8983; §SDC_BOUNDS_STALE stale=14138 RETRACTED L9097; PHOTO_GRADE v1 wrong pivot, v2 invisible L7639; "interior small because no directional light" REFUTED L7660.
- §METER_ONE_RULE superseded by §METER_EV (CIECAM02 D = chromatic adaptation not exposure) L4465; §METER_EV v2 NOT READY as look L4496. &metermode avg/centre/zone all ~9 stops at Clinic S1, not the cause L538. §SUN_SHADOW_GRAZE_SCALE: first pixel-proof retracted (N8AO dither noise) L6747. §SFR m lever REJECT both buildings L8652. §SFR_LIVELY: colour lever at ceiling, exposure cannot add shape (multiplies before ACES) L8786-8832; type-rule-only 43-73% worse L8800.
- §D3 duct: curved-shell-only refine + T-junction closure abandoned (non-manifold 24->211) L8500; creaseDeg widening not the remedy L8388.
- §STILL_SHADOW_CASCADE: 4x4096 coarser than single 8192 on default exterior, declined L1074. §STILL_CULL built + REMOVED (0 culled of 25,040) L1243. §FILM_PARITY: nearest lamp cap OFF; §LAMP_LUX_CAP dead L1403. v1 bounce (second renderer re-render) dropped window lights; v2 starts from app frame L5359. Lightmaps rejected (no UV2) L5158. §SUN_SHADOW_RESTORE PARKED L5270.
- §SKY_SYNC_REGRESSION: sky-sync shipped unverified -> black sky, reverted #1381 L6094. §SUN_SHADOW_DROWNED/§XRAY witness flawed (counted isMesh+guid = 0) L7216. §PHOTO_SHADING_CEILING per-pixel knobs cannot create missing contrast; do not re-run L7668. Face-ground A/B byte-identical, red1 could not repro; closed L5801.
- §BME.13: #1631 DUCT_SILHOUETTE not the HHS cause; do not revert L9251. §BIT.0 RETRACTED lead Hospital_silent.db material_name NULL L8852.

## 5. OPEN ITEMS + NEXT STEP / RESUME
### 5a. Alt+S still look (fix/sky-surface), in order — §DEV RESUME 2026-10-02 03:15 L1982-1988
- (1) NEXT FIX: vault/wall junction 0.5 m staircase steps in the Clinic still (red1 Clinic ...881490077; in/out exposure fine, p1/p99 21/187, 0 clip) = sky-field cell family on curved surfaces; attribute with LEAK grid + edge census (c1/blk.py, pband.py) as done for HHS.
- (2) HHS floor still 40% patchy (mid-scale metric) after zone fix: lamps mask / IR / remaining eye-walk; per-term A/B again. (3) §FLOOR_CONTACT reaches ~1/4 of ray truth (seats 0.97 vs ~0.6): bounce/AO path suspected, measure per term. (4) §OBJECT_CONTACT vs a ray truth (wall points beside ducts). (5) Hospital red-block windows (probe did not count them as glass). (6) Clinic mirror LOW (ask red1 before more). (7) "Paint Finish" names read as bare metal in _surfSubstance (Terminal 157, Clinic ~700): red1 not yet answered whether to treat as paint.
- After Terminal bake lands: fix/sky-surface @f78a6579 merges into fix/fast-bake (done by Alt+C session bim-compiler-20, which then releases Hospital film bake); in-flight rebake chain details in section 1a. §DEV RESUME 10-01 L1976-1998: Clinic mirror ...729229470 strips low priority, needs GPU go for reflected-eye render + per-light A/B; 0.5 m cell steps L1 family; Terminal ceiling lights "should be bright": rerun ...753057418 &lampen=1 (stopped; airport-hall EN value uncited); Alt+C must merge fix/sky-surface (note in ALTC_FOUNDATION.md).
- Queued: floor-contact witness c1/fc.sh (seats/open <1.00, open floor +-3, red control &floorcontact=0) L2045; §FLOOR_F_SMOOTH A/B c1/fs.sh (HHS + Clinic ...728142544) L2018; §OBJECT_CONTACT not measured vs ray truth L2005; §LOCAL_EXPOSURE RED CONTROL not rendered L2380.
- Undiagnosed: L1 Clinic sconce patchy L2184; L2 HHS ground-floor lamps not lighting (hhs7 ...808472346) L2187; L3 cartoon colours: decision for red1 L2196; P3 IFC colours glass/green roof/blue ceilings (red1 to decide) L2254; P4 blown HHS highlights L2258; P5 ground texture blotchy L2279; Hospital window question: which low red-block windows L2022. §IFC_SURFACE_NAMES gaps: per-part colour needs re-extraction; file:// packager breaks importScripts; numeric A/B texw.js queued L2087-2093. §LIGHT_THROUGH_OBJECTS options: (1) baked per-lamp visibility, (2) furniture+MEP in field soup, (3) count unknown-zone fragments; per-building leak NOT measured L2175-2180.
- Case 3 HHS floor mottle: run queued cs/hhsfloor.sh (default / &giredist=0 / env 0) with band.py, NOT run L2434. Case 5 blowout review: trace lux vs L in Clinic corridor; exposure cap; room-use targets; EN 12464-1 (withEN=0 unknown=439); lamp shadow map; MEP into exact soup L2438,L3086. Glass reflects building shape: §GLASS_ENV one camera cube (Hospital wing shows sky), witness "sky shown where exact reflected ray hits geometry", first case ...667308830, NOT STARTED L2908; films lack GLASS_ENV/GLASS_REFL_OPEN L2926. UX: sidecar key mismatch must not be silent; add fieldSrc/exactAll/key to §STILL_POSE_PNG stamp L3047,L3074.
- Pending branches: fix/light-field-db witness unfinished (run viewer/tests/witness_light_field_db.js Clinic/Hospital under GPU flock, merge if GREEN) L3236; fix/lamp-shadow @295ac63f batch never ran L3236; Sonnet next: §MEP_SMOOTH_NORMALS 4.2 s + §NORMAL_REPAIR 2.5 s L3226. HITOS ground ~1 storey too high (tools.js _calcGroundY), no fix specified L3995. Terminal 2 tall shafts; camera-under-overhang metered inside L515.
### 5b. B1 / look decisions awaiting red1
- B1 (red1): accept one-time +9.5 s Hospital first Alt+S (cached after) or trade accuracy (boundary-only +2.7 s; Terminal loses space frame)? Then FF look, bump sw L479. B1 SEAM: directional half-space read (4x8-bit RGBA8UI 3D tex, +41 MB Hospital) vs open/covered seam L309. B1 next: widen SHELL_R to 3; attempt-1 leak A/B beyond named cells L449,L464.
- S4: outside still after inside still has 1,127-1,430 fringe px (ground 'earth' texture loads late; materials 105->109) L485-592. Ground albedo + tone-map shoulder vs window-exposure blend: red1 decisions pending L2671-2682. 'tomt mönster' treatment resolved by D2 (§COLOUR-TRUTH DECISIONS) L4300. Merge of fix/alts-all-3 to look: coordinator's call, decision pending L3914. Z22 bake-speed GPU witness NOT RUN (BEFORE /tmp/wt-all3 @05d0ee7d, AFTER /tmp/wt-speed @9a271b18) L4031. Z9-Z12 GPU witnesses queued (Z9 accept: p50 within +-15%, p5 lower; collapse >-30% = stop) L4072. §GLASS_VEIL, §METER_HIST (red1 A/B avg/centre/hist at cafe+stair), Clinic glass opaque, ENTRANCE_GLOW, film wiring of lamp pick open specs L20,L788.
### 5c. Alt+C / film
- Alt+C FIRST TASK: read-only review of cinema_maxq.js/cli_silent_bake.js/gi_film/tools.js vs Alt+S; update prompts/ALTC_SHOWSTOPPERS.md dated section L494; next session read ALTC_FOUNDATION.md "§STILL->FILM INHERITANCE 2026-09-30" L2408. Order: F0 gate hygiene + F8/F7 instruments -> lamp data for films -> per-shot meter freeze -> gi_film max(IR) -> 5 s clips -> S3 4D build-up L708. Alt+C rulings R1-R3 L594: meter every frame with capped adaptation speed + cited source; zone lighting only once ENCLOSED, fade few frames; Alt+S defines look, continuity > per-frame optimum, fixed seeds. Z22 bake speed (frame 0 = 181 s), §FILM_LAW S4, Z16 camera track L3293.
- §FILM_PARITY held; open: film ground warmer/darker than Alt+S (cause not found); fill ruling; branch fix/frame-reuse-sanity @eac0b2c6 (W-FRAME-REUSE PART F) must land before any full film with load path + Measure L1384-1399. §STILL_SHADOW_FIT skyline-footprint union fix open before films L1317. Film `_nightPLScale||1` ruling awaited L4952. Film interiors gloomier: one clip fill restored vs as-is, valid only if every §SUN_ARC_FILL_PIN matches L5036. Hospital 1080p film ending paused; resume command L5576. §SOURCED_LIGHT: no code at L1441-1548 specs; gate (a)-(e); mid-film lights-off narrowing spec L1488. Bounce as Alt+C film option: spec first L5008.
### 5d. Older lanes
- ⛔ U-11 (red1): accept `_nightPLScaleStill` 0.5 -> 1.0 (undo half §STAGED_PL_CUT)? Ground slab unmeasured L8775,L8939; §SUN_FILL_RATIO declared conflict: interior retention vs wall ratio, `m` is the one number to move L8332. §SFR_NEXT: (1) close instrument fault #4 (pool sum != census, likely city-prop point lights effects.js:660-723); (2) re-measure OPT_F/B/D; (3) move effects.js :4918 block below :4945 L8763.
- §BAKE_INTERIOR_TOPUP: Hospital frequency of inFrustum=0 poses NOT MEASURED (need next bake log) L8943. §BME open: 53 batched slots TM delta path leaves hidden (§DVS_END_DELTA_VS_FULL) L9128; §DCS cull spheres unfixed L9240; two broken-index geometries need extraction fix L9274; ⛔ HHS missing right-side ground-floor wall: need share URL (§HASH_PARSE cx,cy,cz,tx,ty,tz) L9245. §LIGHT_TRUTH_AUDIT: no fix implemented; proposes delete #3,4,5,16,#37; add `§COVE_QUAL withLamps= withSky= withDayIR= neither=` at sourced_light.js:998; one A/B per term at pose ...1790468672505 (N8AO needs one-line switch STILL_AO_ENABLED effects.js:4857) L9375,L9434.
- §PHOTO_SHADING_CEILING: material-identity palette (material_name; class/storey fallback for Hospital/Clinic/JKR) largest unbuilt win L7670. §PHOTO_REALISM_RETUNE item 1 not done L7550. §PHOTO_AO live confirm pending (next lever intensity only) L7537. Hospital 5,617 sheet elements + 303 mixed meshes stay DoubleSide L7803. §LTU_FLOOR_FLICKER NOT fixed: next = rerun static harness with small camera motion; no renderOrder fix without pixel proof L7142. §SUN_START_TIME spec feasible NOT STARTED L6947; §WEATHER_ADVANCED_MODE SPEC ONLY (phases overcast -> rain -> clouds -> snow, opt-in bake-only) L6869. §HOSPITAL_META_DB_STALE general staleness rule undecided (pre-deploy check / split_db.sh last step / drop split) L6481. Extraction colour gap (IfcRelAssociatesMaterial) PARKED by red1 L6283. §SHADOW_FRONTIER low priority L7190. Probe-grid: first step ONE measured 4 m sky-only Hospital bake L5185. R10 gaps (4) L4842.

## 6. LANDMINES / RULES NOT TO BREAK
- GPU: flock /tmp/claude-1000/gpu.lock for every headless run; Alt+C bakes do NOT take the lock (check nvidia-smi; VRAM gate: wait while used > 5.2 GB); 'Uncaptured WebGPU'/OOM > 0 = not evidence; red1's browser/Chrome shares the 8 GB card; two tab crashes 10-01 from VRAM exhaustion L1963,L2297,L3115,L4443.
- Stale code: bump sw.js CACHE_VERSION (+ ?v=) on every served change; stale tab / reused Chromium profile serves stale JS -> always fresh --profile for CLI bakes; probes bypass SW L261,L2987,L9099. Never bump sw before conflicts are resolved (conflict markers got cached under v1292) L4689. serve_tree reads files fresh: live-editing a served worktree changes every concurrent press L4686.
- Changing light_zones.js re-keys all 4 bakes (Hospital 48-49 min); stale sidecar -> fast field; occluder soup budget 6M tris, over it ALL occluders dropped (light_zones.js:1129); never reuse a zone/field cache written without the shell pass; only LOCAL db URLs use sidecars L2287-2288,L3686.
- Light count changes recompile ~110 materials (40-108 s): keep constant across frames; films: constant light count, portal shadow maps once per frame L1307,L4748.
- RELEASE GATE: nothing ships/hands to red1 without §BAKE_RELEASE_GATE PASS + §ALTS_ALL_VERDICT PASS on that exact commit L3490. Witness must print INCONCLUSIVE when VACUOUS/unsound; new eye-found defect class -> add §FAULT counter in same commit; read pose from PNG tEXt "bim-still-pose" L166-176.
- No per-building code, no invented constants (authored: contact len/thick, local exposure c 0.6, glass tone k 0.3, polish 0.35, R 0.5; MEP palette is AUTHORED not a standard); DB: material_name only from IFC, patch UPDATE only NULL/''/'≈ ' rows; no binary DBs L2077,L2321,L8130.
- v1290 approved defaults must not change without red1 L4866; ref PNGs protect in every change L4741; Alt+S gated `!A._maxqActive`; each lighting fn = BUILD (cached) + DECIDE (per frame, ray-free) L145,L204.
- Light-code rules: ONE three.js instance (private copy -> instanceof Light false -> black) L5412; DLOD must pause roof casters during Alt+S L5324; dlod.js <-> TM matrix one-owner rule L9082; never assign onBeforeCompile without composing original L6016; _sunArcStep after A.startStillRefine() L7160; one seed A._photoPaintSeed owns randomised presentation L3926; probe renders on frozen still: set _taaPass.accumulate=false; set sun BEFORE staging a comparison L1288,L1385; harness: fresh browser+profile per press, one condition per page load L3648,L7684; headless animate loop self-parks (§IDLE_GATE) L9139.
- Shadow: shadow.bias is unitless normalised depth, normalBias world units L7353; do not retune three intensity scales without rechecking sunFillRatio 2.155 vs TM L7396; read live A.sun direction L8033. Probes: pkill -f self-matches shell, kill by pid L722; one GPU browser at a time, own /tmp/wt-* + port, never edit /tmp/wt-look in place L166.
- Git/deploy: after `gh pr merge --auto --squash` push ALL commits BEFORE arming, verify via `git show origin/main:<path>` L6527; OCI DB objects gzip + content-encoding gzip, ship patches via oci_patch_gate L6055; one worktree per branch, /tmp dirs die on reboot L5402; model rule: Sonnet agents, Opus weekly limit resets Oct 2 16:00 L3277.
- Test rig: NVIDIA module/lib mismatch -> headless Vulkan lands on Intel iGPU until reboot L627; Headless Chrome 147 needs --use-angle=swiftshader (small) or --use-angle=gl (Hospital-scale) L5762,L7120.

## 7. CONTRADICTIONS — RESOLVED 2026-10-02 by the Alt+S session against the CODE (bim-ootb fix/sky-surface @f78a6579) + latest logs
- §IRC_MAX vs "IRC OFF": TWO mechanisms, both statements hold. V12 field IRC term (light_zones.js ircFlag): OFF by default, &irc=1 = A/B
  (log: "irc=off (default: the GI bounce carries it)"). §IRC_MAX v2 per-zone interreflected irradiance (sourced_light.js irOn, uSLIr):
  ON by default, &ir=0 = off.
- §STILL_RES: default 1440p (effects.js §STILL_RES_DEFAULT_1440, preset fallback '1440p'; red1 stills are 2776x1440). The older comment
  "default window (= today)" at effects.js:5649 is stale; &stillres=window = the quick size.
- §SURFACE_RULES: ON by default (streaming.js:895 A._surfRules = !?surf=off; live log "§SURFACE_RULES ON (default; ?surf=off ...)").
  The "OFF at 4c8c8d4f" line is history.
- Ground albedo: 0.36 (effects.js:2868 _photoGroundAlbedoGain 2.3 x texture mean 0.155; red1 07-28 ruling kept 09-30). The "x0.43"
  decision was not applied.
- §FILM_PARITY fill: films with parity on use the Alt+S law fill (ambient 0, §FILM_LAW S2); "restore 0.785/1.257" is opt-in only, NOT the
  law (effects.js:4271 log text). Alt+C session owns further detail (ALTC_FOUNDATION.md).
- lawHash: both older values are stale; current LIGHT_LAW lawHash=24b64dce (c1/cs/1790880387566_t2def.log, v1534).
- §SKY_FIELD_EXACT_ALL: runs only when FORCED (bake) or when the loaded field record was built with it (§EXACT_WHEN_BAKED,
  light_zones.js:773); fast field otherwise. Supersedes §SKY_FIELD_EXACT.
- Sidecar keys: CURRENT = 21324567:90186 (after the §SKY_FIELD_FURNITURE revert 233b6295). 1b214d46:90224 was the furniture code
  (10-01 -> 10-02 03:00); HHS_silent / Terminal_silent made on it are being rebaked at 21324567.
- B1 W2 3.86 % vs 1.64 / 2.13 %: NOT resolvable from code; the reproduced 1.64 / 2.13 % on the unchanged tree are the measured values,
  3.86 % is an unreproduced handoff figure — treat 3.86 as void.
- §BME header "READ §BME.10 newest at END" is stale: §BME.11 (L~9198) says §BAKE_MISSING_ELEMENTS IS SOLVED (re-bake complete Day
  310/310). Status = SOLVED.
- L6027 visual-confirm ask: void under the PRIMAL LAW (witness replaces every human visual check).
- §BOUNCE_SPLIT: lives in prompts/ALTC_FOUNDATION.md (commit 813713af3 "root cause GPU OOM from a parallel stills run, not v1532 lamps"),
  not in this file — the Alt+C lane's record. Same class as this file's 10-01 VRAM note (two red1 tab crashes from parallel headless runs).
- Corrected in this draft: "doubles HHS …142544" -> Clinic …142544 (original L2639 + 09-30 NIGHT block both say Clinic).
- Added to the ORIGINAL (was chat-only): §MIRROR_STRIP truth run (bands ≈ right, rest of mirror 7x too dark).

## 2026-10-02 ~04:00 — CLOSE-OUT of the overnight Opus session (resume HERE)
- Film sidecars DONE at key 21324567:90186, all restore PASS, 0 Uncaptured WebGPU: Hospital_silent (occluderTris 5,819,012, cells
  240,618, 41 min) placed at /tmp/wt-fastbake/buildings/patches/Hospital_silent.db.lightfield.bin; HHS_silent + Terminal_silent placed
  BESIDE the Alt+C session's files as *.lightfield.bin.k21324567 (it renames them after merging fix/sky-surface @f78a6579, then runs the
  Hospital film). Degraded 10-01 Hospital file kept as patches/Hospital_silent.db.lightfield.bin.degraded_occluders0 (never ship).
- NEW LANDMINE: the §IFC_SURFACE_NAMES patches change the light-field FINGERPRINT (one term, Clinic 4595.804 -> 4612.364; most likely
  glass picked by material name) -> the stills sidecar is rejected ("§ZONE_IDB_CACHE miss … geometry changed") and the field rebuilds on
  every first Alt+S. Clinic_meta REBAKED (PASS, hit 30 ms). Hospital_meta REBAKING at close (session scratchpad e645a98a…/bake/
  hosp_meta.sh -> bake_Hospital_meta.out, rc_Hospital_extracted2.out): CHECK occluderTris ≈ 5.8M and restore PASS. HHS_extracted +
  Terminal_extracted still PASS. Old v1519 copies: …/bake/Clinic_meta.v1519.bak, Hospital_meta.v1519.bak. Rule: any DB content patch
  that touches glass/material classes needs a sidecar rebake + restorecheck in the same task.
- §DOME_GLOW: active on 155 round fixtures (Clinic …808307859), 0 shader errors; the uniformity probe (domew.js) caught only 2 non-round
  fixtures (CV 0.006 both arms) — NOT yet proven on a sconce: next = a pose framing a wall sconce, §DOME_W meanCV new vs &domeglow=0.
- OPEN list unchanged otherwise (see §5a): vault/wall 0.5 m staircase (Clinic …881490077) first.
- UPDATE 04:10: the Alt+C session's _silent DBs carry §IFC_SURFACE_NAMES patches (fix/fast-bake); my Hospital_silent sidecar was built
  WITHOUT them -> moved aside (fastbake …/Hospital_silent.db.lightfield.bin.stale_nonames). Their patches copied into wt-surf; REBAKING
  Hospital_silent with names (…/bake/hs2.sh -> bake_Hospital_silent.out, rc_Hospital_silent.out). Deliver to fastbake ONLY after
  restorecheck shows "§ZONE_IDB_CACHE hit" + occluderTris ≈ 5.8M, then message bim-compiler-20 (Hospital film held until then).
  HHS names do not move its fingerprint (their bake: hit) -> HHS .k21324567 stands; Terminal needed 0 name rows.
- 04:25: both Hospital rebakes RESTARTED DETACHED (setsid nohup, survive the session exit): session scratchpad e645a98a…/bake/
  hosp_meta.detached.log (+ bake_Hospital_meta.out, rc_Hospital_extracted2.out) and hs2.detached.log (+ bake_Hospital_silent.out,
  rc_Hospital_silent.out). ~41 min each from 04:25. Check `ps -eo cmd | grep bake_` before starting any new Hospital bake.

## 2026-10-02 — §LIGHT_FIELD_IDLE_BAKE — SPEC (red1: "lazy load it when idle" + "status message when user drops or opens an IFC set … pulse when active")
- WHY (code-read, fix/sky-surface @f78a6579): a user's dropped/opened IFC never gets the exact sky field — §EXACT_WHEN_BAKED
  (light_zones.js:773) runs §SKY_FIELD_EXACT_ALL only when forced (bake script) or when the loaded record already has it; imports get
  the fast v1502 field (the blockier one). The pass is synchronous on the main thread (build()/field()), so it cannot simply be started
  in idle time: Hospital 33 min unbaked would freeze the viewer.
- WHAT:
  (1) WORKER: the exact pass moves into a Web Worker. Input = the shell pass's soup (boundary + occluder triangles, glass T per pane,
      typed arrays, transferred), grid dims/org/cell, the READ/target cell list, the fixed direction set. Output = per-cell F (and Gd for
      §SKY_FIELD_OPEN_ROOF targets) in chunks of K cells. Same maths as today: worker result for a cell must equal the main-thread value
      bit-for-bit (same direction set, same order). First step = confirm the soup/BVH has no THREE object dependency (code-read); if it
      does, flatten it before transfer.
  (2) IDLE + POLITE: start after the model has loaded AND the fast field exists (first Alt+S done or build() run), only while no
      Alt+S/Alt+C/§MAXQ render is active (pause on press, resume after); &idlebake=0 / APP._idleBake=false = never. One worker per tab.
  (3) RESUMABLE: finished chunks are written to IndexedDB under the SAME key as §ZONE_IDB_CACHE (SRC code hash + geometry fp) plus a
      done-cell bitmap; a reload resumes at the first undone chunk; a key change discards partial work (logged).
  (4) SWAP: when every target cell is done, the field record gets skyExactAll.on = true and replaces the fast field; the NEXT Alt+S uses
      it (never mid-render); a model save writes it into light_field_cache (§LIGHT_FIELD_DB S5 path) so a reopened .db starts exact.
  (5) STATUS (bottom bar, #status in #status-bar-wrap — reuse A.status + the schedule_inject.js progress-bar idiom, no new widget):
      on drop/open of an IFC set (or a .db without an exact field), once the idle bake is able to start:
      "Preparing realistic lighting in the background — n %" ; paused: "… paused while rendering" ; done: "Realistic lighting ready —
      saved with the model on next save" (self-clears after 5 s, the rule_checklist.js/dlod_nav.js convention: clear only if not
      overwritten). While the worker is ACTIVE the status text PULSES (CSS opacity animation on a class, removed when paused/done/failed;
      prefers-reduced-motion = no pulse). Other modules writing A.status win; the bake re-asserts its line on its next progress tick only
      if the bar is empty.
  (6) Already exact (sidecar / saved .db / IDB record with skyExactAll.on) -> no worker, no status line.
- § LINES: §IDLE_BAKE start bld= cells= key= ; §IDLE_BAKE progress done=/total= ms= ; §IDLE_BAKE pause|resume why= ;
  §IDLE_BAKE done cells= ms= swapped=1 ; §IDLE_BAKE discard why= (key change) ; §IDLE_BAKE skip why= (already exact / &idlebake=0).
- WITNESS (W-IDLE-BAKE, Clinic — 2.5 min bake):
  (a) PARITY: worker F per target cell == forced main-thread exact pass (max |dF| = 0 over all cells; INCONCLUSIVE if cells = 0).
  (b) NON-BLOCKING: during the bake, main-thread longest task < 100 ms (PerformanceObserver longtask), viewer frame loop keeps ticking.
  (c) RESUME: kill the page at ~50 %, reload -> §IDLE_BAKE start reports done > 0 and finishes; final field == (a).
  (d) SWAP: Alt+S after done logs §SKY_FIELD_EXACT_ALL on cache=… and the LEAK grid F equals the baked-sidecar arm at the same pose.
  (e) PAUSE: Alt+S mid-bake -> §IDLE_BAKE pause then resume; the still uses the fast field (no mid-render swap).
  (f) STATUS: the #status text + pulse class present while active, absent when paused/done (DOM read, not a screenshot);
      reduced-motion -> class present, animation none.
  (g) SAVE: save -> reopen the .db -> §LIGHT_FIELD_DB restore + §IDLE_BAKE skip why=already exact.
- ORDER: after the Clinic vault/wall staircase (§5a item 1). Not built yet.

## 2026-10-02 — §BAKE_RESOURCE_GUARD — SPEC (red1: "mem hog guard, to halt when insufficient resources on machine to say 'cannot bake movie due to ..'")
- WHY: two red1 tab crashes 10-01 from VRAM exhaustion (parallel headless runs on the shared 8 GB card); no guard exists today — code
  grep (fix/sky-surface @f78a6579): only heap LOGGING (city.js §CITY_MEM, tools.js, clash_narrow.js performance.memory), nothing halts.
- SCOPE: every long job a user can start in the viewer — Alt+C movie bake (MaxQ), §LIGHT_FIELD_IDLE_BAKE, Alt+S still at 1440p/4k —
  plus cli_silent_bake.js (headless). One shared check function, one message format.
- WHAT THE BROWSER CAN READ (no invented signals): performance.memory (Chromium: usedJSHeapSize / jsHeapSizeLimit),
  navigator.deviceMemory (coarse GB, capped at 8), navigator.hardwareConcurrency, WebGPU adapter.limits + device.lost +
  'uncaptured error' OutOfMemory, WebGL context-lost. VRAM free is NOT readable in a browser. The CLI can read os.freemem() and
  nvidia-smi memory.used/total.
- REQUIRED BUDGET = MEASURED, not authored: first run memdiag.js (§MEM_* heap/VRAM lines) per building for each job (movie / idle bake /
  still), record peak heap + peak VRAM vs triangle count in this file; the guard's need = that measured slope x the loaded model's
  triangle count (+ the measured fixed part). Until measured, the PRE-check logs only (§BAKE_GUARD would-block=…) and never blocks.
- BEHAVIOUR:
  (1) PRE-CHECK before start: heap headroom (jsHeapSizeLimit - used) < need, or deviceMemory < need -> do not start; status line
      "Cannot bake movie: not enough memory on this machine (needs ~X GB, ~Y GB free). Close other tabs or use a smaller model."
      (job word = movie / realistic lighting / 4k still). CLI: os.freemem / nvidia-smi free < need -> exit 2 with the same sentence.
  (2) WATCHDOG while running (each progress tick): heap used > 90 % of jsHeapSizeLimit, or any WebGPU OOM / device.lost / WebGL
      context-lost -> HALT cleanly (stop frame loop, release render targets, keep frames already written), status line
      "Movie bake stopped: ran out of memory at frame N of M (GPU memory full)" — the cause named from the signal that fired.
      Idle bake: pause (not discard) and resume on the next idle when headroom returns.
  (3) No silent degrade: a halt is never turned into a lower-quality continue without saying so.
- § LINES: §BAKE_GUARD pre job= need= free= heapLimit= devMem= verdict=ok|block|log-only ; §BAKE_GUARD halt job= signal= frame= ;
  §BAKE_GUARD resume job= (idle bake).
- WITNESS (W-BAKE-GUARD): (a) forced low limit (APP._bakeGuardNeedGB = huge) -> pre-check blocks, status text matches, no frames
  rendered; (b) injected device.lost / synthetic OOM mid-movie -> halt at that frame, frames before it intact, status names the
  signal; (c) normal Clinic movie with real limits -> verdict=ok, 0 halts (NO-OP guard proven not to block real work);
  (d) VACUOUS guard: performance.memory absent (non-Chromium) -> verdict prints INCONCLUSIVE (heap unknown), never ok.
- ORDER: with §LIGHT_FIELD_IDLE_BAKE (shares the status line), after the Clinic staircase. Not built yet.

## 2026-10-02 ~05:15 — Clinic vault/wall staircase (§5a item 1): CPU read of the baked grid (GPU held by Alt+C Hospital film ~3 h)
- Hospital rebakes DONE + PASS (04:25): Hospital_meta + Hospital_silent occluderTris 5,819,012, restorecheck §W_LIGHT_FIELD_PATCH PASS,
  "§ZONE_IDB_CACHE hit src=db", 0 Uncaptured. Hospital_silent copied to /tmp/wt-fastbake/buildings/patches (04:51, md5 a815d168
  confirmed by bim-compiler-8e = the Alt+C session now; it merged f78a6579 into fix/fast-bake sw v1544 and started the Hospital 24 fps
  bake 04:51, holding gpu.lock ~3 h — "no headless GPU work until it lands"). LANDMINE HIT AGAIN: a `while pgrep -f "<pattern>"` wait
  loop matches its own bash -c line and never exits (cost ~25 min); wait on pids, never on pgrep -f / pkill -f of a string in the same command.
- Tool: session scratchpad de8632cc…/lfdec.js decodes a .lightfield.bin (LFP1 -> gzip -> LFC1, packRecord layout) in node; slice.js /
  fslice.js print zone / F / Gd cross-sections (idx = x + nx*(y + ny*z)). Clinic grid 198x39x246, cell 0.5, org (-44.80,-6.97,-52.92).
- MEASURED (red1 pose cam (-11.9,9.6,-1.9) -> +x, vault hall = zone 27, slices x = -8/-5/-2/1/4, z -6..4, y >= 3):
  (a) F (sky view) inside the hall = 0.00-0.01 in EVERY cell, both sides of every slice, although the hall has clerestory glazing on both
      walls (y 6.3-8.3); the cells just outside read F 0.08-0.32. F cannot make the steps (it is flat 0). Whether F = 0 under glazing is
      right is a SEPARATE question (logged, not judged here).
  (b) Gd (ground-view field) jumps cell to cell exactly at the vault/wall junction: x=-2, y 8.28/8.78: 26 | 0 | 20 | 8 (%), 1 cell apart,
      vs 0-2 % in the hall below. The trilinear stencil renormalises over non-solid cells, so on a curved surface the set of solid cells
      changes in 0.5 m steps -> the Gd jump shows as a 0.5 m staircase. HYPOTHESIS (not proven): §GROUND_VIEW_FIELD Gd is the stepping term.
- NEXT (when the GPU frees): c1/vs.sh arms def / &groundview=0 / &skyfield=0 at …881490077 with LEAK 140x73 -> blk.py-style census of
  edges >= 15 Lf on the same element along the vault/wall band; the term whose arm removes the edges owns them. Then fix + witness.

## 2026-10-02 ~07:40 — Clinic staircase ROOT CAUSE + §WIND_FLIP — SPEC
- MEASURED (c1/vs.sh 3 arms at …881490077, OOM 0, §GI_STILL 1 each): band y>=6 same-element edges (|dLf|>=15) def 651 / &groundview=0
  624 / &skyfield=0 851 -> NOT the sky / ground fields (Gd hypothesis of 05:15 WITHDRAWN). No direct sun on the band (CPU sun ray:
  rayLit 0 of 3,345 px). On ONE element (IfcRoof 0rgLSgKBf54Qc3od1vyY2Z) Lf follows the CPU zone exactly: zone 27 (hall) median 201,
  zone 184 median 76 -> the steps are a ZONE boundary drawn on the 0.5 m cell outline.
- WHY two zones: the camera (zone 184, cell 65,33,102) stands in the end bay behind IfcWall 0lHL5LPIr3RuynIxjjrPON "Interior -
  Partition (92mm Stud)" (arched top, face 31.8 m² of a 34.0 m² bbox: solid, no opening), which the zone grid correctly rasterises as
  SOLID at x≈-7.3. The RENDER does not draw it: probe (c1/wallvis.js) Mesh visible, opaque, side FrontSide; DB winding: its -x face's
  24 triangles have n.x>0 like the +x face -> both faces back-facing from the camera side -> culled -> the wall is invisible and red1
  sees the hall "through" it, lit by two zones.
- FLEET CENSUS (session scratchpad wind.py: weld 1e-4 m, conflict = undirected edge used by exactly 2 triangles in the SAME direction),
  FRONT_SIDE classes only: Clinic 748 / 3,126 elements (IfcBeam 461, IfcCovering 250/250, IfcWall 15/15, IfcRailing 11, IfcFooting 7,
  IfcMember 3, IfcPlate 1); HHS 136 / 2,648; Hospital 3 / 37,249 (matches §WALL_WINDING_MEASURE's 0.003 %). §WALL_SIDE (09-01) was
  measured on Terminal + Hospital only — its premise "winding is consistent" is FALSE for Clinic and HHS.
- SPEC §WIND_FLIP: (1) A.blobToGeometry (scene.js, the one decode choke point) counts conflict edges per geometry (same weld + rule)
  -> geo.userData.windFlip. (2) _getMaterial gets a windFlip flag: a FrontSide class whose bucket holds ANY flagged geometry gets
  DoubleSide (three flips the normal for back faces, so flipped triangles shade correctly); cacheKey + '|wf'. Batched, instanced and
  frame callers pass it. (3) &windflip=0 / APP._windFlip=false = off (old behaviour). (4) § line: §WIND_FLIP geos= flagged=
  conflictEdges= ms= ; buckets doubled= (at flush).
- WITNESS W-WIND-FLIP: (a) Clinic flagged geometries > 0 and the partition's hash flagged; Hospital flagged <= 5; check ms;
  (b) at …881490077 the CPU LEAK raycast hits 0lHL5LPIr3RuynIxjjrPON (rows > 0) on the default arm and 0 on &windflip=0 (red
  control); (c) roof element 0rgL…2Z: rows in zone 27 seen from zone 184 drop to 0 on the default arm (the zone step is no longer
  visible); (d) §FAULT unchanged, OOM 0. NOTE for red1: this pose will then show the partition (the real end wall), not the hall.

## 2026-10-02 ~09:00 — §WIND_FLIP SHIPPED (bim-ootb fix/sky-surface @436b85cc sw v1546) + §ALTS_MEM_LIFECYCLE — SPEC
- §WIND_FLIP baked: viewer/wind_flip.js (one rule) + scripts/wind_flip_patch.js -> patches/<db>.sql geometry_wind_flip (rule-checked,
  '__census__' row). Census: Clinic 477/9,230 geometries, HHS 2,801/4,710, Hospital 127/20,609, Terminal 0/9,394. Witness (Clinic
  …881490077): partition LEAK px 0 -> 6,027, hall-zone roof px 835 -> 0, baked path ms=0, ZONE_IDB_CACHE hit, 0 Uncaptured; Hospital
  …848782458 table rows=127, §FAULT identical on/off (irOnly=1 BOTH arms -> pre-existing vs red1 v1531's 0, not this change; open).
  HHS …880424616: table rows=2801, bucketsDoubled=127, all fields cache=hit. Gap: a user IFC's saved .db does not get the table yet.
- HHS press cost (headless 2776x1440, one run): GI 12.1 s, refine 11.7 s, SOURCED_LIGHT 4.1 s, local exposure 2.9 s, object contact
  2.2 s, rest ~5 s => ~38 s per press. Cache-hit lines' ms (249 s exact-all, 43 s glass) are BAKE times, not this press.
  No § line separates shader compile — first-vs-warm split unknown.
- SPEC §ALTS_MEM_LIFECYCLE (red1 2026-10-02: "mem hog check … when we move to another ops, does it clean up?"): one page, one pose:
  LOADED -> PRESS1 -> ESC1 -> PRESS2 -> ESC2; at each mark after a forced GC (CDP HeapProfiler.collectGarbage): jsHeapUsedMB,
  chromeRssMB, gpu process MB (nvidia-smi), renderer.info.memory geometries/textures, renderer.info.programs.length; press wall ms
  (Alt+S -> §GI_STILL result). Verdicts: LEAK if ESC2 - ESC1 > 5 % of LOADED heap or gpu, or textures/programs grow ESC1 -> ESC2;
  CLEANUP ratio = (PRESS - ESC) / (PRESS - LOADED) per metric; FIRST-TIME cost = press1 ms - press2 ms. Arms: default, &windflip=0.
  INCONCLUSIVE if any mark is missing or the GPU process is not found.
- 08:35 QUEUED (detached, survives session exit): c1/ml.sh waits for the Alt+C Hospital 24 fps bake (pid 1115790, ~3 h) to EXIT, then
  runs §ALTS_MEM_LIFECYCLE on HHS …880424616 (arms on / &windflip=0) under flock -> c1/cs/memlife_hhs_{on,off}.log (+ ml.out).
  Tool c1/memlife.js. READ those logs first on resume; verdict rules in the spec above.
- 09:20 §ALTS_MEM_LIFECYCLE RESULT (HHS …880424616, c1/cs/memlife_hhs_{on,off}.log, errors 0, ZONE_IDB_CACHE hit, §STILL_EXIT tornDown=1):
  | mark | on: heapMB gpuMB tex prog | off (&windflip=0) |
  | LOADED | 27.9 245 277 18 | 27.8 246 277 17 |
  | PRESS1 | 48.7 2085 318 128 (41.1 s) | 48.3 2086 318 123 (41.1 s) |
  | ESC1 | 48.0 1109 301 128 | 47.7 1071 301 123 |
  | PRESS2 | 48.8 2101 318 133 (11.0 s) | 48.5 2102 318 128 (9.0 s) |
  | ESC2 | 48.4 1133 301 131 | 48.2 1133 301 126 |
  FIRST-TIME cost = 30-32 s of a 41 s press (press 2 = 9-11 s): ~105-110 shader programs built on press 1 (18 -> 128).
  §WIND_FLIP: +5 programs, first press equal (41.1 / 41.1 s); press 2 11.0 vs 9.0 s from ONE run each — not separable from noise.
  CLEANUP: Esc frees ~1.0 GB of the 1.84 GB GPU the press adds; ~0.86 GB STAYS (GPU cleanup 53 %); heap +20 MB stays; textures
  277 -> 301 (+24) and geometries 434 -> 459 (+25) stay after Esc. Round 2 adds 0 textures / 0 geometries; gpuMB +24 (on) / +62 (off)
  — over the spec's 5 % rule (12 MB) but gpuMB is WHOLE-CARD minus baseline and an unrelated headless test (modeller
  witness_history_threads.js, outside the lock) was running -> leak verdict INCONCLUSIVE; needs a 5-round run on a quiet GPU.
  NEXT: name what holds the 0.86 GB after Esc (render targets / GI buffers / light-field textures kept for reuse = intended cache, or leak).
- 09:40 WHAT HOLDS GPU AFTER Esc (HHS, c1/cs/memlife_hhs_rel{,2}.log): __giStillRelease() frees 0.30 GB (ESC2 1133 -> 832 MB above the
  pre-launch card baseline; heap 48.5 -> 44.8 MB) = the §GI_CARRY WebGPU renderer + building copy kept ON PURPOSE (gi_still.js:62/808,
  released only by Alt+Shift+S / __giStillRelease / §GI_CARRY FAIL). Enumerable WebGL side after Esc: composer RTs 2 x 22.5 MB +
  envMap RT 12 MB; NO light shadow maps in the scene; CSM state idle. ~0.53 GB above LOADED still unattributed (driver/Chrome pool vs
  the +24 textures / +25 geometries renderer.info keeps). 5-round plateau test (c1/r5.sh -> cs/memlife_hhs_r5.log) QUEUED behind the
  Alt+C HHS film bake (pid 1166155): flat ESC3..ESC5 = pool, rising = leak.
- 10:44 5-ROUND RESULT (c1/cs/memlife_hhs_r5.log, after the Alt+C HHS bake exited, errors 0): gpuMB after Esc 1070 / 1132 / 1329 /
  1353 / 1350; at press 2085 / 2101 / 2174 / 2322 / 2339; textures 301 and geometries 459 constant every round; heap after Esc
  48.0 / 48.4 / 48.9 / 49.1 / 49.3 MB (+0.3 MB/round). Press 29.1 s then 9.0 s x4. VERDICT: GPU PLATEAU (~1.35 GB after round 3,
  rounds 4-5 within ±3 MB) = allocator pool, not a leak; one step +197 MB at round 3 unexplained. Heap creep 0.3 MB/round = small,
  not yet attributed. Whole-card metric (other GPU users not excluded).
- 11:00 HHS 24 fps film (Alt+C, ~/Downloads/HHS_Office_Federated_silent_full_AFTER_1920x1080_24fps_2026-10-02_0934.mp4) — Alt+S review
  exchanged with bim-compiler-8e (logs/code only): first film on key 21324567 + §ZONE_EYE_SKIP_OPEN + §WIND_FLIP (2,801 rows);
  IFC names already in 02:30. INHERITANCE GAP: §DOME_GLOW / §FIXTURE_FACE is Alt+S-only (effects.js startStillRefine
  `!A._maxqActive` gate; 0 §FIXTURE_FACE lines in both film logs) -> red1 decision. Proposed still witnesses for the film speed
  recipe (gi8: |dLf| + new edges + floor-patchy vs default-twice; 6/6: flat-wall local std) and a §WIND_FLIP film line + flagged-element
  raycast count along the path — NOT RUN, waiting for red1. Open for red1: auto-release §GI_CARRY (0.30 GB) on switching to a heavy mode.
- 11:55 LTU_AHouse film prep (asked by bim-compiler-8e; film DB = ~/Downloads/LTU_AHouse.db, linked as wt-fastbake buildings/
  LTU_AHouse_silent.db). Read-only census (session scratchpad wfcount.js, shipped wind_flip.js rule): 104,340 geometries, 13,572
  flagged; single-sided-class elements 752/34,081 (IfcCovering 706, IfcSlab 43, IfcWall 2, IfcBeam 1). material_name empty
  58,827/122,667. Sources: DAGCompiler/lib/input/IFC/LTU_AHouse_merged.ifc + internal/UNMERGED/LTU_AHouse_*.ifc.
  JOB (on red1's go, after the Alt+C Hospital bake ~14:30): write §IFC_SURFACE_NAMES + §WIND_FLIP blocks into
  patches/LTU_AHouse_silent.db.sql FIRST (names move the fingerprint), then bake the sidecar at 21324567, restorecheck must say hit.
- 13:30 LTU step (1) DONE: bim-ootb fix/sky-surface @00524a4f (pushed; Alt+C merged it into fix/fast-bake as 35886fab):
  patches/LTU_AHouse_silent.db.sql = GEOREF/raster + §IFC_SURFACE_NAMES (updates=2; keptAuthored 36,967; MEP IFCs unnamed) +
  §WIND_FLIP (13,572 geometries). wt-surf buildings/LTU_AHouse_silent.db -> ~/Downloads/LTU_AHouse.db.
  Steps (2)+(3) QUEUED DETACHED: c1/ltu.sh waits for the Alt+C Hospital bake pid 1205250 to exit, then under gpu.lock: sidecar bake
  (cs/ltu_bake.out) -> restorecheck (cs/ltu_rc.out) -> Alt+S at cinema pin 0 (c1/ltu_alts.js -> cs/ltu_alts.log). Copies the sidecar to
  /tmp/wt-fastbake ONLY if occluderTris>0 + PASS + cache hit. Summary: c1/ltu.out. Then message bim-compiler-8e key/occluderTris/hit line.

## 2026-10-02 ~13:40 — CLOSE-OUT (red1 shutting down) — RESUME HERE
- SHIPPED this session (bim-ootb fix/sky-surface, all pushed, 0 unpushed): 436b85cc §WIND_FLIP (sw v1546; Clinic vault/wall staircase =
  invisible flipped-winding partition, fixed) + baked patches 4 buildings; 00524a4f LTU_AHouse_silent patches (names + WIND_FLIP).
  Alt+C merged both into fix/fast-bake (5f5eeecc / 35886fab). Hospital_meta + Hospital_silent sidecars rebaked 04:25 PASS (5.82M occl).
- IF THE MACHINE REBOOTED: /tmp dies -> c1/ltu.sh (LTU steps 2+3) and its logs are gone, the wt-surf link
  buildings/LTU_AHouse_silent.db -> ~/Downloads/LTU_AHouse.db is gone, :8664 is down. Restart: `git worktree add /tmp/wt-surf
  fix/sky-surface` in ~/bim-ootb (or reuse), `node ~/bin/serve_tree.js /tmp/wt-surf 8664 &`, re-link the LTU DB, re-copy
  sidecars from ~/bim-ootb? (NO — sidecars are gitignored and live only in /tmp/wt-surf/buildings/patches: after a reboot ALL .lightfield.bin
  must be REBAKED: Clinic 2.5 min, HHS ~5, Terminal ~?, Hospital 41 min, LTU unknown). Then redo LTU (2)+(3) (bake -> restorecheck hit +
  occluderTris>0 -> Alt+S at cinema pin 0 -> copy to wt-fastbake -> message the Alt+C session key/occluderTris/hit line).
- IF NOT REBOOTED: read c1/ltu.out (LTU_DONE line) + cs/ltu_{bake.out,rc.out,alts.log}; tell Alt+C.
- OPEN (red1 decisions): (a) films inherit §DOME_GLOW/§FIXTURE_FACE? (Alt+S-only gate effects.js startStillRefine); (b) run the film
  speed-recipe still witnesses (gi8 banding, 6/6 wall noise) + §WIND_FLIP film-path pixel count; (c) auto-release §GI_CARRY 0.30 GB on
  switching to a heavy mode. Not decided: GI half-res / adaptive refine speed specs (press ~38 s @1440p, first press +20-30 s shaders).
- OPEN (work): Hospital irOnly=1 at …848782458 (both windflip arms; red1 v1531 had 0); heap +0.3 MB per Alt+S round unattributed;
  +0.2 GB GPU step at round 3; user-IFC save does not write geometry_wind_flip; §5a items 2-7 unchanged; specs §LIGHT_FIELD_IDLE_BAKE +
  §BAKE_RESOURCE_GUARD written, not built.

## 2026-10-03 ~00:30 — REBOOT RECOVERY + ANALYSIS of red1's 31 stills (10-02 13:24–21:07), read from the PNGs' tEXt only
- Machine rebooted 10-03 00:09. /tmp/wt-surf re-created at fix/sky-surface @00524a4f (clean), LTU link restored, :8664 up (200).
  ALL .lightfield.bin sidecars gone (none in wt-surf/buildings/patches) — rebake waits on GPU turn with Alt+C (not pushed, red1).
- Source: each still's `bim-still-pose` tEXt (= §FAULT + §FAULT_GI of that press, gi_still.js:1149). All sw v1546, 2776x1440,
  sunI 4.4, film=false. Mix: Hospital 18, HHS 9, Clinic 4. Table + pixel stats: session scratchpad stills_press.txt (python, CPU only).
  red1 verdict on the look: "mostly good". Findings below are from the numbers, not the eye.
- F1 VACUOUS OK (Primal Law 4): …939387300 (Clinic) and …945504612 (Hospital) have samples=0 yet fault=false -> printed OK on an
  empty population. Also thin: …945010042 samples=7, …945422410 11, …938847337 18. FIX (spec): still_fault.js:172 must emit
  INCONCLUSIVE when samples==0 (and say n when < ~20); fault stays boolean only when something was judged.
- F2 Hospital irOnly — the open item is BIGGER than "1": …945705039 cam [7.7,-11.3,-24.4] irOnly=92/144 (ceil 27), zonePass=0
  (lampList mean 13.3) -> that zone draws NO own-zone lamp, lit by bounce only. NOT a fault by rule (still_fault.js:159 counts it,
  :172 does not gate on it) so the PNG says OK. All other Hospital stills irOnly=0 with zonePass 162–185. Next: name the zone id at
  that pose + why SourcedLight gives it 0 lamps (no IfcLightFixture in the zone vs lamps dropped by zone assignment).
- F3 HHS irOnly 16 / 28 at …944536750 / …944593799 (cam z≈21.5), zonePass 5 of list 8–10: a sparsely-lamped zone; same question.
- F4 glassReflDark (camera outside, glass reflection gate dark): HHS …944262945 80/107 (75 %), …944295992 32/51 (63 %) — large;
  the rest 1–6 (HHS …943066001 6/187, …944235102 4/319, Hospital 1–3). Two big HHS cases are adjacent poses (cam ≈ [-9.7,±3,-17.7]).
  Next: read which glass/sky directions fail there (spec<0.3) — CPU mirror of the shader, no GPU needed.
- F5 Clinic glassLow=1 on ALL 4 Clinic presses: one visible glazing material T_eff<0.7 -> every Clinic still is FAULT for the same
  single material. Next: name it (still_fault.js:69 loop) — real tinted glass (then exempt with a cited value) or a mis-tagged material.
- F6 Exposure jumps press-to-press (logged, not a fault): -3.84 (…945821680), +3.64 (…945504612), +2.22, +2.03, +1.67 stops.
  Each is vs the PREVIOUS pose, so not a defect by itself; no cited limit exists (still_fault.js:168).
- F7 One dark frame: Clinic …939357212 (cam y 7.4) mean luma 47 vs 104–157 for all others, p1=6.3, 1.1 % px <8; §FAULT clean,
  expStep 0. Either a correctly dark space or exposure did not adapt — needs the zone/lux at that pose.
- F8 §FAULT_GI giAdapter='|||' on all 31: GPUAdapterInfo fields all empty (gi_still.js:769) -> field carries no information.
  blownPct ≤0.01, darkPct ≤0.35, hueNoise 0 everywhere = GI pass clean.
- NOT IN THE PNG: press wall time / cost — PNG has no timing; needs the console §GI_STILL line (not saved by the still).
  Proposal: add press ms to the pose JSON so a saved still is self-timing.
- 01:00 LIGHT FIXES (no GPU; red1 "u may fix light work that does not lock GPU") — bim-ootb fix/sky-surface @d3bb44a7 sw v1547, PUSHED:
  §FAULT_VACUOUS (still_fault.js: out.verdict FAULT/OK/INCONCLUSIVE; no fault + samples=0 -> INCONCLUSIVE), §FAULT_GI S4b
  (gi_still.js: all-empty adapter -> null -> 'n/a'), §STILL_PRESS_TIME (saved PNG pose gets pressS + passes from the result bar).
  Witness = replay of the shipped verdict rule over the 31 PNGs (scratchpad vacuous_replay.log): OK 18 / FAULT 12 / INCONCLUSIVE 1
  (…945504612, was printed OK). Clinic …939387300 stays FAULT (samples=0 but glassLow judged). NOT yet run in a browser (GPU busy).
- F5 narrowed (DB read, Clinic_extracted.db elements_meta.material_rgba): materials with alpha in (0.3, 0.95) -> T<0.7 are ONLY
  0.980,0.957,0.882,0.490 = 8x IfcFlowTerminal "M_Sconce Light - Sphere" (T 0.51) and 1.000,0.737,0.475,0.600 = 22x IfcOpeningElement.
  Clinic has NO low-T glazing (windows/plates are alpha 0.10 / 0.25). So glassLow=1 is most likely the sconce shade — still_fault.js:68
  filters by transparency only while its own header (:10) says "glazing materials". Fix = restrict glassLow to glazing classes; needs
  a browser run to confirm which mesh carries the class -> after the GPU frees.
- wt-surf hygiene: a 0-byte buildings/Clinic_extracted.db (created 00:19 BY THIS SESSION: `sqlite3 Clinic_extracted.db` on a missing path creates an empty file — query DBs by absolute ~/bim-ootb/buildings path, never a bare name inside a served tree) shadowed serve_tree's fallback -> Clinic on
  :8664 would have loaded empty. Removed (no process held it); :8664 now serves 'SQLite format 3' for Clinic.
- ~04:00 Alt+C (bim-compiler-d1) merged fix/sky-surface @d3bb44a7 into fix/fast-bake as 393e0f0f, sw v1556 (verified: d3bb44a7 is an ancestor,
  CACHE_VERSION v1556 on origin). Alt+C delivered the Hospital and LTU films; the new sidecars Hospital_silent + LTU_AHouse_silent .lightfield.bin
  (key 21324567:90186, restorecheck PASS per Alt+C) are in /tmp/wt-fastbake/buildings/patches. gpu.lock FREE (flock -n ok).
  Alt+S GPU QUEUE, waiting on red1's go: (1) rebake wt-surf sidecars for the still DBs (Clinic ~2.5 min, HHS ~5, Hospital ~41, Terminal ?);
  (2) one browser press to show the v1547 lines (§FAULT verdict, PNG pressS); (3) F2 zone id + lamp count at the Hospital pose …945705039;
  F4 dark-glass directions at HHS …944262945; F5 confirm the sconce shade is the material behind glassLow.
- red1 2026-10-03: "The pictures are already very much better as it is, minus a few quirks, which needs your good time to abstract
  out as we do not want band aid fixes." RULE for F2/F4/F5/F7: each quirk is fixed only after its cause is stated as ONE rule that holds
  on every building (Clinic, HHS, Hospital, Terminal, LTU census, read from DB/log), and the fix goes in the function that owns it. No
  per-building exemption, no per-pose threshold. Each fix must show it changes the count on all buildings, not just the pose it came from.
  Applies to tooling too: the _meta/_extracted sidecar-name symlinks (10-03) are a band-aid -> bake.js must write the name the viewer requests.
- 08:50 REBAKE DONE (red1 go): wt-surf sidecars Clinic/HHS/Terminal/Hospital _extracted, key 21324567:90186, restorecheck PASS cached=true
  all 4 (Clinic needed the _meta name; bake 2/2.6/4.4/26.9 min). Re-shoots (scratchpad s/press.log, sw v1557, 2776x1440):
  Clinic …939357212 pressS 18.8 FAULT glassLowWho=["Mesh/d48376b9 T=0.51"] (= alpha 0.49 = the sconce sphere: F5 CONFIRMED);
  HHS …944262945 pressS 11.2 FAULT glassReflDark=79/106; Hospital …945705039 pressS 107.8 OK irOnly=93 -> irOnlyZones=136:93pts/0lamps;
  Hospital …945504612 pressS 101.3 INCONCLUSIVE (samples=0). giAdapter headless = 'nvidia|lovelace||' (red1's browser gave '|||').
- §LAMP_ZONE_CENSUS (s/census.log, after one Alt+S per building; 0.5 m cells; room = >=10 m³): zones with 0 bound lamps,
  "lamp in box up to 3 m above" / "none": Hospital 68 / 185 of 542 rooms (3.6 % / 3.2 % of room volume); HHS 1 / 14 of 84;
  Clinic 32 / 22 of 281; Terminal 3 / 10 of 60. Lamps in SOLID / outside: Hospital 0/0, HHS 6/3, Clinic 7/3, Terminal 3/4.
  ⚠ the "lamp in box" test is LOOSE: it catches stacked zones (Hospital z18/z19 share an XZ box) and zone 1 = 5,957 m³ (HHS) /
  5,523 m³ (Clinic), which takes 152 / 1,001 'near' lamps that atLamp binds DOWN through the ceiling panel to the room below (by design).
  So no binding-loss defect is proven. Hospital zone 136 (156 m³, the …945705039 eye zone): 0 lamps; nearest 4 at 3.1–3.4 m, y=-12.62,
  bound to zone 135 (below the eye y=-11.3) -> 136 has no fixture of its own in the data; bounce-only there is what the IFC gives.
  F2 = NOT a renderer defect on current evidence. Open: is 136 a plenum/void the camera sits in (box height not logged yet).

## 2026-10-03 — §GLASS_PLANAR_REFL — SPEC (red1: "Only big flaw is the mirror reflection … a joined wing or slab is not indicative but
## often the same clear skyline as if that part of the building is not there.")
- ROOT CAUSE (code read, wt-surf @58416ed0): exterior glass reflection = three's env radiance (sky only) x ONE scalar keep from
  slSpecKeep (sourced_light.js:235) / §GLASS_REFL_OPEN table (light_zones.js:923: 12 az x 25 el, 7.5 deg, per glass cell side).
  A blocker in the reflected direction can only SCALE the sky (T x rho x F); it never contributes its own image. So a wing reads as the
  same skyline, dimmer at most; small blockers vanish below the 7.5 deg table step. F4 (glassReflDark 79/106 at HHS …944262945) is
  this mechanism's other face (sky scaled to dark). Not a tuning problem: a scalar gate cannot form an image.
- RULE (general, any IFC): a flat pane is a plane mirror; what it shows = the scene rendered from the camera mirrored in that plane.
  Building glazing is overwhelmingly planar (curtain walls, windows), and the planes come from the geometry, not the building.
- MECHANISM (Alt+S stills only; films/nav untouched; &planarrefl=0 = today's path):
  1. Planes: the §GLASS_FRESNEL glazing clones (GLAZE_CLASSES + R10 panes, glass_fresnel.js — the existing owner) -> their visible
     triangles grouped by plane (normal within 2 deg, offset within 0.10 m), ranked by on-screen area. Top K (budget, measured) get a
     mirror; the rest keep today's path, counted.
  2. Per plane: render the scene from the mirrored camera with an oblique near plane at the glass (standard planar reflector), half res,
     glass hidden in that pass. Store plane id per pane material/group.
  3. Glass clone shader: on its plane, specular env term := the reflection RT sampled at the fragment's screen position (x Schlick F, as
     now); the sky-env x keep path stays for panes without a plane slot. One shader branch in the existing clone, no new material class.
- WITNESS §GLASS_REFL_TRUTH (numbers, not eyes): on the 32x18 outside-glass grid still_fault.js already walks, cast the exact reflected
  ray (three Raycaster on the scene, not the voxel grid). hitSamples = rays that meet opaque geometry. Today: every hit sample shows sky
  -> report skyWhereHit = hitSamples (baseline). After: for a mirrored pane, the reflection RT's depth at that texel must equal the ray's
  hit distance within 5 % -> depthAgree / hitSamples. INCONCLUSIVE when hitSamples = 0. Run on all 4 buildings + HHS …944262945.
  Cost line: per press K, ms per mirror render, total.
- RISKS to measure, not assume: K vs press time (Hospital press already 101–108 s); planes cut by the view edge (RT sized to the pane's
  screen box); curved/faceted glass falls back (counted); interior mirrors (§MIRROR_OWN_MAT cube capture) stay as they are.
- STATUS: spec only. Changes how every exterior pane renders -> waits for red1's go.

## 2026-10-03 ~09:30 — CLOSE-OUT (red1 closing the machine) — RESUME HERE
- SHIPPED today (bim-ootb fix/sky-surface, pushed, 0 unpushed): d3bb44a7 v1547 §FAULT_VACUOUS / §FAULT_GI S4b / §STILL_PRESS_TIME;
  58416ed0 v1557 §FAULT_WHO (+ still_fault ?v=13, gi_still ?v=50). Witnessed in 4 re-shoots (s/press.log, summary above).
  Alt+C merged d3bb44a7 into fix/fast-bake (393e0f0f v1556) and will merge 58416ed0 as v1559+ (both branches used v1557).
- Prompts written: this file (F1–F8 analysis, census, §GLASS_PLANAR_REFL spec) + prompts/FILM_NARRATION.md (plan-first narration lane,
  for another session; first deliverable = §PLAN only, red1 reviews; AI-voice vs 'No AI inside' is red1's call).
- WAITING ON red1: GO for §GLASS_PLANAR_REFL (the only big flaw per red1: exterior glass shows sky where a wing/slab should be).
  On go: build in /tmp/wt-surf glass_fresnel.js (owner of the glazing clones) + witness §GLASS_REFL_TRUTH first (baseline skyWhereHit),
  GPU under /tmp/claude-1000/gpu.lock, coordinate with Alt+C (bim-compiler-d1).
- Other open (no-band-aid rule above): F4 = same mechanism as the mirror flaw (fold into §GLASS_PLANAR_REFL); F5 fix = glassLow judged on
  glazing classes only (GLAZE_CLASSES, glass_fresnel.js) not transparency; F7 Clinic dark frame unexplained; Hospital zone 136 box height;
  bake.js sidecar name must follow the viewer's request (_meta vs _extracted) instead of the 10-03 symlinks.
- AFTER A REBOOT (/tmp dies): `git worktree add /tmp/wt-surf fix/sky-surface` in ~/bim-ootb (prune first), `node ~/bin/serve_tree.js
  /tmp/wt-surf 8664 &`, relink buildings/LTU_AHouse_silent.db -> ~/Downloads/LTU_AHouse.db, rebake sidecars (Clinic 2 / HHS 2.6 /
  Terminal 4.4 / Hospital 27 min with a copy of Alt+C's bake.js + restorecheck.js), symlink Clinic/Terminal/Hospital _meta.db.lightfield.bin
  -> _extracted. NEVER run sqlite3 on a bare DB name inside a served tree (creates a 0-byte file that shadows serve_tree's fallback).
  After a plain suspend: nothing to do; :8664 survives.

## 2026-10-03 ~11:15 — REBOOT RECOVERY (machine up 11:05)
- /tmp/wt-surf re-created at fix/sky-surface @58416ed0 (clean, 0 unpushed), :8664 up (index.html / viewer/sw.js 200, v1557; bare "/" is 404 by
  design — serve_tree has no dir index), LTU_AHouse_silent.db relinked, Clinic_extracted.db serves 'SQLite format 3'. gpu.lock FREE.
- Alt+C merged 58416ed0 into fix/fast-bake as d304efd3 (sw v1560).
- ALL wt-surf .lightfield.bin sidecars gone again -> rebake (~36 min GPU) waits on red1's go. §GLASS_PLANAR_REFL still waits on red1's go.

## 2026-10-03 ~13:00 — §GLASS_PLANAR_REFL — red1 GO; SPEC v2 (root cause corrected from a full read of glass_fresnel.js @58416ed0)
- CORRECTION to v1 "ROOT CAUSE": the clones' env is NOT sky-only. §GLASS_ENV (glass_fresnel.js:100-156, called effects.js:6086) already
  renders the staged scene into a cube FROM THE CAMERA POSITION; the clones sample it by reflected direction, then x slMirK = slSpecKeep
  (sourced_light.js:459). Two faults stack: (1) PARALLAX — the cube is centred on the eye, not the pane; a wing next to the pane lies in
  the reflected direction as seen from the PANE but in a different direction from the eye, so the lookup returns sky behind the eye; (2) the
  gate then SCALES that wrong sample down where the reflected ray is blocked (F4 glassReflDark). Result = the dimmed clear skyline red1 saw.
  A cube from one point is exact only for infinitely far content — a facade 10-50 m away is not. Rule unchanged: a flat pane is a plane mirror.
- MECHANISM v2 (glass_fresnel.js, the owner; Alt+S only, after GlassFresnel.capture; &planarrefl=0 = today; &planark=N, default 6):
  P1 planes: every triangle of the swapped glazing meshes (Mesh + InstancedMesh per instance; BatchedMesh counted as fallback in v1) in world
     space, normal oriented to the eye, merged when normal within 2 deg and offset within 0.10 m (both faces of a pane = one plane).
     Rank by projected screen area (triangles fully in front of the eye). Top K mirrored; rest counted (fallback = today's cube path).
  P2 render: one HalfFloat atlas RT, 3x2 tiles, each tile = half the drawing-buffer size. Per plane: mirrored camera (three Reflector
     construction: reflected position/target/up, same projection) + oblique near plane at the glass (Lengyel), glass + mirrors hidden,
     same FIX-14 re-pass rule as the cube capture (repeat while a material's uniforms object rekeyed, max 3).
  P3 shader: clone onBeforeCompile appends after #include <lights_fragment_maps>: for k < uGfK, the fragment is on plane k when
     |n.p + d| < 0.10 m (view space); uv = proj(uGfTex[k] * p) in [0,1] -> radiance := atlas(tile k, uv). No slMirK there: the mirror pass
     already lit what it shows, a blocker shows itself. Off a slot = today's cube x gate, unchanged.
- still_fault: glassReflDark must not count a sample whose pane is mirrored (the gate no longer applies there) -> glassReflMirrored.
- WITNESS §GLASS_REFL_TRUTH (&refltruth=1, adds one distance render per plane): 32x18 grid; first hit = glazing clone -> reflected ray
  from the hit point, scene raycast without glass -> hitDist. hitSamples = rays that meet geometry; onSlot = those whose point lies on a
  mirrored plane. Distance render (MeshDistanceMaterial from the mirrored eye, same oblique clip) read at the sample's uv must equal
  |eye-X| + hitDist within 5 % -> depthAgree/onSlot. INCONCLUSIVE when onSlot = 0. Baseline (&planarrefl=0): onSlot 0 by construction,
  so the before number is hitSamples itself (rays where today's pane shows the eye-centred cube instead of the blocker).
  Cost line §GLASS_PLANAR: K, planes total, tris, per-mirror ms, total ms.

## 2026-10-03 ~14:40 — §INDOOR_SHADOW_STUDY — SPEC (red1: "shadows are jagged.. the PerfectIndoor.png virtues has to be studied what has changed")
- Evidence pair: ~/Downloads/PerfectIndoor.png (2026-09-25 05:27, 2776x1440, NO pose tEXt — predates §STILL pose tagging) vs red1's
  bounce_still_1791009120422.png (v1561, same Hospital atrium, cam [-13.857,3.573,36.133] tgt [4.087,-8.018,-22.315], sun [0,3535,-3535],
  sunI 4.4, pressS 16.2, §FAULT OK). Old: crisp straight beam shadows on the blue shaft wall. New: soft dark blotches + axis-aligned
  steps on the same wall. Live code on 09-25 05:27 sat just after §STILL_SHADOW_FIT (v1298, 21ffe710, "~4x finer shadow edges") and
  §STILL_RES (v1299); fix/sky-surface has 198 viewer commits since.
- METRICS (numbers, not eyes), on the blue-wall ROI of a 1685x874 page screenshot, rows clear of the beams: luma mean; BLOTCH = std of
  luma after a 9 px box blur (low-frequency patches); EDGE = p99 |grad luma| (crisp shadow edges); STEP = share of strong-gradient px
  whose gradient is axis-aligned within 5 deg (grid steps).
- STEP 1, layer isolation at red1's pose on v1561: baseline, then one switch off each: &sourced=0, &skyfield=0, &bounce=0, &localexp=0,
  &ao=0, &shadowfit=0. The layer whose removal drops BLOTCH/STEP and raises EDGE owns the defect; its § lines are read from the same log.
- STEP 2 (after 1): render the same pose on the 09-25 code (v1298/1299 commit, own worktree) -> the same metrics = the "virtue" numbers;
  bisect commits between only if STEP 1 does not name the owner.
- Rule (no band-aid): the fix goes in the owning function and must move the metrics on every building, not just this pose.
- FOUND in the archive (full_history 2026-08-11_to_2026-10-02 L55-75): PerfectIndoor.png = the OLD baseline, "old lighting" = before
  §SOURCED_LIGHT (feat/sourced-light, v1337). Its numbers then: 8-bit mean 124, p5 55, p95 203, >=235 2.0 %, sat 21.2, RGB [115,129,128].
  red1 replaced it 09-25 with bounce_still_1790307025522 (v1337, "darker is expected, but at least realistic"). The v1337 known-defect
  list already named "(3) jagged/blocky sun-shadow edges + base gap" and "stair-stepped shadow of the stair flights" — i.e. the steps
  arrived WITH §SOURCED_LIGHT (zone-grid gating), not later. STEP 1's &sourced=0 arm is therefore the first number to read.
- 15:40 STEP 1 RESULTS (scratchpad s/study_*.{log,png}, v1561, red1's pose, Hospital camZone=1 = the 26,184 m² atrium zone).
  Blue-wall ROI (upper | lower): base blot 14.2 | 7.3; &sourced=0 10.4 | 10.3; &skyfield=0 9.8 | 12.3; &localexp=0 6.3 | 10.6;
  &bounce=0 16.8 | 8.9; &ao=0 15.8 | 8.7; &shadowfit=0 14.6 | 7.2; &skyexactall=0 14.4 | 7.5. No arm restores crisp beam shadows.
  RETRACTED (same session): "256-ray exact-field noise makes the blotches" — &skyexactall=0 leaves blot unchanged (14.4).
  Screenshot metrics cannot separate sky field / sourced / local exposure (they interact). NEXT = per-term linear readback along a line
  across the blue wall (Z18 method, probes b1/t3*.js): F, local-exposure dEV, sun direct (castShadow A/B), IR, AO -> the stepping/blotching
  term owns it; same readback answers whether direct sun reaches that wall at all (PerfectIndoor's crisp beam shadows need it).
- OUTSIDE jaggies (red1: "known symptom… carried into Alt+C") — MEASURED at red1's outside Hospital pose (s/patch_on.log):
  §STILL_SHADOW_CASCADE mode=single (D8: cascade worst texel 0.1700 > single 0.0810 at 8192), texel 0.081 m, texelPerPixel=4.56 -> every
  sun-shadow edge steps by ~4-5 screen px. Near cascade would be 0.0398 m. LTU: env 967, texelPerM 2.1 (0.48 m). Proposed rule (not
  built, red1's call — changes every still + film): choose cascades by shadow texels PER SCREEN PIXEL per region (target <= 1), not by
  the worst cascade's metres.
- WALL PATCHES (red1 …1791008799450, Hospital outside, top-centre wall): mirror off vs on |diff| ROI mean 0.55, 0.27 % px > 8 ->
  pre-existing, NOT §GLASS_PLANAR_REFL.
- LTU inside (cam [-16.481,-0.263,-9.602]): §GI_STILL underlay mean=0 (empty app frame), composite mean 1.5-1.7, with AND without the
  mirror -> pre-existing blank grab. §FAULT_GI printed OK at 74-78 % black = Primal Law 4 breach -> §FAULT_GI_BLANK (gi_still ?v=51,
  sw v1562): underlay mean < 1 = FAULT. Verify run queued. Root cause of the blank grab: open.
- 17:25 §INDOOR_SHADOW_STUDY STEP 2 — PerfectIndoor's "virtue" = SUN POSITION, not a lost renderer feature.
  Per-term readback (s/wall_probe.json, t3w.js): blue wall normal ~+z (eye-facing), default sun el 45 az 180 (scene.js:286, dir
  [0.001,0.705,-0.709]) -> N.L -0.71: the default sun cannot light that wall. Glass is not the blocker (§SUN_GLASS_CASTERS 137 pure-glass
  meshes discarded from the depth pass). Sun-reach raycast (s/sunrays.json, 395 wall points, glass skipped): lit only for az 270-330
  (three spherical az; west side) at low sun — el 30: 224/118/25 of 395 at az 270/300/330; el 45: 150/75/5; el 60: 39/3/0; el 75: 0;
  az 0-60 and 180: 0. Blockers include IfcBeam = the beam shadows. Render at el 30 az 270 (s/sun_w270.png, MINGUID=60000 load gate):
  crisp diagonal beam shadows on the wall = the PerfectIndoor look, with today's code. Blotches (upper wall rank-corr full~F 0.89,
  ~Gd 0.86) are the sky-light terms varying across one flat wall in zone 1; only 5 of 43 big F jumps sit on 0.5 m cell edges -> not
  grid steps. Sun-shadow edge quality indoors: near cascade texelPerPixel 3.43-4.18 (same coarseness class as outside) — an edge-profile
  witness (per-row FWHM along the shadow edge, as measure_shadow_edge.py did) is the right instrument, not the gradient-angle share.
  DECISIONS for red1: (a) a default/still sun that lights interiors (today az 180 lights none of this atrium wall); (b) cascade choice
  by texel-per-pixel (outside + inside jaggies); (c) blotch: is per-wall sky-term variation wanted (physical) or a smoothing target.
- 21:05 TOILET MIRRORS on the planar path (bim-ootb fix/sky-surface eb0e958f, sw v1563): §MIRROR_OWN_MAT mirror meshes join the plane set;
  their onBeforeCompile calls GlassFresnel.patchShader before the box-chunk expansion (cache key slMirrorBox2). Clinic toilet (red1's
  trashed …1790729229470 pose, cam [18.713,-1.578,7.893] tgt [20.821,-2.684,8.418]): §GLASS_REFL_TRUTH mirror samples 28, on a mirrored
  plane with depth agreeing 0/28 -> 28/28, 53 ms. OPEN: brightness truth (Oct 1: rest-of-mirror 7x too dark under the cube path) not
  re-measured — needs mirtruth-style M/T ratio (expect ~0.843 = mirror colour).
- SHIPPED today (fix/sky-surface, all pushed): 897b83e0 v1561 §GLASS_PLANAR_REFL · 5cae78f1 v1562 §FAULT_GI_BLANK · eb0e958f v1563 mirrors.
