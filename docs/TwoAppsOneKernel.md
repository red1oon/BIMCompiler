---
description: An ERP (iDempiere) and a BIM/CAD authoring tool (Bonsai) folded onto one browser-native SQLite-WASM kernel — measured, not asserted, why that shrinks the codebase instead of bloating it.
---

*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md) · companion to [Migrate & Compare](MigrateComparisonPaper.md) · [One Page InfoGraphics - Landscape](TwoAppsOneKernelInfographicLandscape.html)*

<style>
.tak-lede{font-size:1.08em;line-height:1.55;max-width:760px;margin:6px 0 22px}
.tak-lede b{color:#7cb342}

/* glance row */
.tak-glance{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:14px 0 26px}
.tak-gcard{border:1px solid rgba(128,128,128,.28);border-top:4px solid var(--gc);border-radius:10px;padding:14px 16px;background:rgba(128,128,128,.03)}
.tak-gcard .x{font-size:1.9em;font-weight:800;color:var(--gc);line-height:1}
.tak-gcard .lbl{font-size:.78em;text-transform:uppercase;letter-spacing:.05em;opacity:.65;margin-top:4px;font-weight:700}
.tak-gcard .d{font-size:.82em;opacity:.75;margin-top:6px;line-height:1.4}
.tak-gcard.erp{--gc:#ef5350}.tak-gcard.cad{--gc:#42a5f5}.tak-gcard.comb{--gc:#7cb342}

/* fold bars */
.tak-bars{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:8px 0 24px}
@media (max-width:640px){.tak-bars{grid-template-columns:1fr}}
.tak-barpanel h5{margin:0 0 8px;font-size:.85em;text-transform:uppercase;letter-spacing:.04em;opacity:.7}
.tak-track{height:26px;border-radius:5px;overflow:hidden;display:flex;background:rgba(128,128,128,.12);border:1px solid rgba(128,128,128,.25)}
.tak-seg{height:100%}
.tak-ourbar{margin-top:9px;height:26px;border-radius:5px;overflow:hidden;background:rgba(128,128,128,.12);border:1px solid rgba(128,128,128,.25);position:relative}
.tak-ourbar .fill{height:100%;background:#7cb342}
.tak-ourbar .fig{position:absolute;left:calc(100% + 8px);top:50%;transform:translateY(-50%);font-size:.82em;font-weight:700;white-space:nowrap}
.tak-legend{display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:8px;font-size:.76em;opacity:.85}
.tak-legend span{display:inline-flex;align-items:center;gap:5px}
.tak-legend i{width:9px;height:9px;border-radius:2px;display:inline-block}

/* maxims */
.tak-maxims{display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin:6px 0 6px}
@media (max-width:640px){.tak-maxims{grid-template-columns:1fr}}
.tak-max{border-left:3px solid #ffa000;padding:6px 0 6px 12px;font-size:.92em;line-height:1.42}
[data-md-color-scheme="slate"] .tak-max{border-left-color:#ffb74d}

/* fold reuse (same idiom as MigrateComparisonPaper) */
details.tak-fold{border:1px solid rgba(128,128,128,.25);border-radius:10px;margin:8px 0;background:rgba(128,128,128,.02)}
details.tak-fold>summary{cursor:pointer;padding:10px 15px;font-weight:700;font-size:.95em;list-style:none;display:flex;align-items:center;gap:9px;user-select:none}
details.tak-fold>summary::-webkit-details-marker{display:none}
details.tak-fold>summary::before{content:"▸";color:#7cb342;font-size:12px}
details.tak-fold[open]>summary::before{content:"▾"}
details.tak-fold>summary:hover{background:rgba(124,179,66,.07)}
details.tak-fold .bd{padding:2px 15px 14px;font-size:.92em}

.tak-cmp{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px}
@media (max-width:640px){.tak-cmp{grid-template-columns:1fr}}
.tak-cmp h6{margin:0 0 6px;font-size:.82em}
.tak-cmp pre{font-size:.78em;line-height:1.5;padding:10px 12px;border-radius:6px;overflow-x:auto}
.tak-cmp .leg pre{border-top:2px solid #ef5350}
.tak-cmp .our pre{border-top:2px solid #7cb342}

.tak-caveats{margin:0;padding-left:1.1em}
.tak-caveats li{margin-bottom:8px;font-size:.92em}
.tak-src{font-size:.78em;opacity:.7;line-height:1.6}
</style>

# Two Apps, One Kernel

<p class="tak-lede">An ERP (iDempiere, Java) and a BIM/CAD authoring tool (Bonsai, the Blender IFC add-on,
Python) are two independent, community-built, million-line-class stacks. We fold the working parts of
<b>both</b> onto one SQLite-WASM + Three.js kernel, in one browser tab, with no server underneath either
one. Here's the arithmetic — measured today, sourced below, not asserted.</p>

<div class="tak-glance">
  <div class="tak-gcard erp"><div class="x">~26×</div><div class="lbl">ERP fold</div><div class="d">1,427,147 Java LOC (iDempiere) → 55,283 JS LOC</div></div>
  <div class="tak-gcard cad"><div class="x">~4.5×</div><div class="lbl">CAD fold</div><div class="d">235,365 Python LOC (Bonsai add-on) → 52,267 JS LOC</div></div>
  <div class="tak-gcard comb"><div class="x">~15.5×</div><div class="lbl">Combined, one kernel</div><div class="d">1,662,512 LOC (two stacks) → 107,550 LOC (one runtime)</div></div>
</div>

<div class="tak-bars">
  <div class="tak-barpanel">
    <h5>iDempiere Java, by what it's for (1,427,147 LOC)</h5>
    <div class="tak-track">
      <div class="tak-seg" style="width:40.1%;background:#c98a4b" title="Generated X_*/I_* boilerplate — 572,590"></div>
      <div class="tak-seg" style="width:22.3%;background:#a8703a" title="OSGi, servlets, JDBC, installer, reports, acct/costing — 317,921"></div>
      <div class="tak-seg" style="width:13.9%;background:#8a5a30" title="M-class business rules (the bedrock) — 198,679"></div>
      <div class="tak-seg" style="width:13.3%;background:#b97a3d" title="ZK web UI — 189,786"></div>
      <div class="tak-seg" style="width:5.5%;background:#a8703a" title="Test suite — 78,389"></div>
      <div class="tak-seg" style="width:4.9%;background:#8a5a30" title="SvrProcess corpus, 476 procs — 69,782"></div>
    </div>
    <div class="tak-ourbar"><div class="fill" style="width:3.9%"></div><div class="fig">55,283 (3.9%) — our fold</div></div>
    <div class="tak-legend">
      <span><i style="background:#c98a4b"></i>generated boilerplate</span>
      <span><i style="background:#a8703a"></i>OSGi/servlets/JDBC/reports</span>
      <span><i style="background:#8a5a30"></i>M-class rules + processes</span>
      <span><i style="background:#b97a3d"></i>ZK UI</span>
    </div>
  </div>
  <div class="tak-barpanel">
    <h5>Bonsai add-on, Python (235,365 LOC)</h5>
    <div class="tak-track">
      <div class="tak-seg" style="width:100%;background:#8a5a30" title="Bonsai add-on source, src/bonsai/ — 235,365"></div>
    </div>
    <div class="tak-ourbar"><div class="fill" style="width:22.2%;background:#42a5f5"></div><div class="fig">52,267 (22%) — our fold</div></div>
    <div class="tak-legend"><span><i style="background:#8a5a30"></i>Bonsai add-on (no internal breakdown taken)</span></div>
  </div>
</div>

<div class="tak-maxims">
  <div class="tak-max">The server was never free. It was hidden — inside a JVM, an OSGi module graph, and a ZK widget tree, standing between a click and a 3,300-line class.</div>
  <div class="tak-max">Two apps, one kernel: an ERP and a BIM viewer don't need two servers when they already share one SQLite-WASM database and one render loop.</div>
  <div class="tak-max">The ERP ratio keeps <i>falling</i> as real coverage grows — 89×, 76×, 51×, now ~26× — because ceremony doesn't come back when you add a feature. Only logic does.</div>
  <div class="tak-max">~1% of the business logic ported, 100% of the offline behavior. The 99% that's gone was never the business — it was how the business talked to a server.</div>
  <div class="tak-max">The BIM community already asked this — "Mr IFC and Mrs SQLite," OSArch, 2023 — and set it down, keeping the Blender dependency. This is what happens if you don't set it down.</div>
</div>

<details class="tak-fold" markdown="1"><summary>Which pile did which job — and what stands in for it now</summary>
<div class="bd" markdown="1">

| Legacy layer | Its job | Now standing in | Why the layer disappears |
|---|---|---|---|
| JVM | run the compiled classes | the browser's own JS engine | already on every device — we ship none of it |
| OSGi | 60 plugins, loaded/wired/versioned independently | plain script includes | one page, one process — nothing to hot-swap |
| ZK UI (server widget tree + AJAX diff/patch) | push state from server to screen | Three.js scene graph + DOM | state is already on the screen's device |
| Servlets / RPC + session mgmt | carry every click to a server and back | kernel oplog — local, signed, hash-chained | the write happens on-device; sync is async, off the interaction path |
| PostgreSQL server (WAL, pooling, replication) | hold the Application Dictionary + transactions | SQLite-WASM, IndexedDB-backed | the DB ships as a file and runs in-process |
| Maven build + app server (3.7GB) | package/deploy the JVM app | static hosting (GH Pages / OCI) | the files are the deployment — no runtime build step |
| Blender's `bpy`/add-on registration, bmesh editing kernel | host Bonsai's authoring tools | Three.js WebGL scene + our own compiled-geometry DB | same idea, no desktop install |

</div>
</details>

<details class="tak-fold" markdown="1"><summary>Code, side by side — a fold we've actually shipped (<code>MOrder.completeIt()</code>)</summary>
<div class="bd" markdown="1">

Not a rewrite-from-scratch guess — the same order-completion decision tree. The line drop is
`getX()`/`setX()`/`saveEx()`/SQL/try-catch boilerplate falling away; the same four business decisions
remain in both columns. Witness `W-FOLD-COMPLETE`, `maxDiff=0c`. Full block-for-block listing: [ERP Rosetta
Stone §3](MigrateComparisonPaper.md#gap-in-code).

<div class="tak-cmp">
<div class="leg">
<h6><b>iDempiere</b> · Java, ~250 LOC</h6>
```java
if (!m_justPrepared) prepareIt();
if (fireDocValidate(BEFORE_COMPLETE) != null)
    return STATUS_Invalid;
if (!isApproved()) approveIt();
createCounterDoc();
shipment = createShipment(dt, getDateOrdered());
invoice  = createInvoice(dt, shipment, ...);
if (fireDocValidate(AFTER_COMPLETE) != null)
    return STATUS_Invalid;
setProcessed(true); setDocAction(Close);
return STATUS_Completed;
```
</div>
<div class="our">
<h6><b>our fold</b> · JS, ~50 LOC</h6>
```js
if (CrudOverlay.docActionOutcome(entry,order).to!=='CO')
    return {status};
if (!AdModelVal.fireHooks('BEFORE_COMPLETE',{...}).ok)
    return {blocked};
const childOps = [ ...buildDoc('M_InOut',...),
                   ...buildDoc('C_Invoice',...) ];
const post = postRecipe('C_Order',order,lines)...;
const group = [DOC_ACTION_CO, {op:'POST',post}, ...childOps];
return KernelOps.commitGroup(db, group);
```
</div>
</div>

</div>
</details>

<details class="tak-fold" markdown="1"><summary>What this is not</summary>
<div class="bd" markdown="1">

<ul class="tak-caveats">
<li><b>Not feature parity, either side.</b> Only ~1% of iDempiere's M-class business logic (104,940 LOC) is
actually ported — ~205 lines of transactional verbs plus ~830 lines of cited <code>beforeSave</code> hooks.
The win is delivery/definition, not a full re-implementation of the transactional server.</li>
<li><b>Bonsai still wins on authoring.</b> Manual IFC entity creation, arbitrary section planes, full PBR
rendering, BCF export, structural/energy links — the 52,267-line number is the logic footprint for what's
actually built (extract/view/query), not a claim of replacing Bonsai's authoring surface.</li>
<li><b>Neither number counts the engine underneath.</b> The browser's JS engine is pre-installed and free
for us; Blender's C++ core is pre-installed and free for Bonsai. This compares add-on/application logic to
add-on/application logic, not silicon to silicon.</li>
<li><b>LOC is a proxy, not a verdict.</b> Every count came from a real clone or checkout and a real
<code>wc -l</code>, dated and sourced below — but fewer lines isn't automatically better lines.</li>
</ul>

</div>
</details>

<p class="tak-src">
<b>Sources.</b> iDempiere — 1,427,147 Java LOC / 4,465 files, <code>~/idempiere-dev-setup/idempiere</code>,
measured 2026-06-08. Our ERP fold — 55,283 LOC / 297 files, dedup union of <code>bim-ootb:erp/</code>
(origin/main) + <code>bim-compiler:build/erp</code>-only files, non-lib non-min JS, measured 2026-08-07.
Bonsai — 235,365 Python LOC / 652 files, <code>src/bonsai/</code>,
<a href="https://github.com/IfcOpenShell/IfcOpenShell">github.com/IfcOpenShell/IfcOpenShell</a>@v0.8.0,
measured 2026-08-07 via sparse clone + <code>wc -l</code>. Our CAD fold — 52,267 LOC / 341 files,
<code>bim-ootb:modeller/+common/+hr_bim_asset/+geomapping/</code> (origin/main), measured 2026-08-07.
<code>MOrder.completeIt()</code> compare — <a href="MigrateComparisonPaper.md">Migrate &amp; Compare</a>,
witness <code>W-FOLD-COMPLETE</code>. Bonsai gap analysis — <code>internal/BonsaiGapAnalysis.md</code>,
prepared 2026-05-01. Not feature parity — delivery-and-definition size, measured and re-run-able, not a
demo number.
</p>
