---
description: How a WASM event-sourced browser engine reproduces legacy ERP (iDempiere, Odoo) document folds to the cent — local-first, serverless, no database server.
---

*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*

<style>
/* drop the MkDocs auto-injected nav-title H1 — the banner below IS the title */
.md-typeset h1{display:none}
/* side-by-side architecture A/B — network divide is the star */
.sxs{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0}.sxs>div{flex:1 1 330px;min-width:270px;overflow:auto}.sxs h5{margin:0 0 4px;font-size:11.5px;text-transform:uppercase;letter-spacing:.4px;opacity:.7}
.arch{display:flex;gap:16px;flex-wrap:wrap;margin:20px 0 6px;align-items:stretch}
.arch .col{flex:1 1 320px;border-radius:12px;border:1px solid;display:flex;flex-direction:column;overflow:hidden}
.arch .leg{border-color:rgba(239,83,80,.45);background:rgba(239,83,80,.05)}
.arch .our{border-color:rgba(124,179,66,.5);background:rgba(124,179,66,.06)}
.arch .hd{padding:9px 13px;font-size:11.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid rgba(128,128,128,.18)}
.arch .leg .hd{color:#ef5350}
.arch .our .hd{color:#7cb342}
.arch .badge{font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:.2px;white-space:nowrap}
.arch .leg .badge{background:rgba(239,83,80,.16);color:#ef5350;border:1px solid rgba(239,83,80,.4)}
.arch .our .badge{background:rgba(124,179,66,.18);color:#7cb342;border:1px solid rgba(124,179,66,.45)}
.arch .zone{padding:12px 13px;display:flex;flex-direction:column;gap:6px;align-items:center}
.arch .local{min-height:172px}
.arch .remote{background:rgba(128,128,128,.05);justify-content:center;min-height:96px}
.arch .znote{font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;opacity:.5;font-weight:800;align-self:flex-start}
.arch .node{font-size:12.5px;line-height:1.32;text-align:center;border-radius:8px;padding:6px 11px;border:1px solid;width:100%;max-width:240px}
.arch .leg .node{border-color:rgba(239,83,80,.35);background:rgba(239,83,80,.07)}
.arch .our .node{border-color:rgba(124,179,66,.4);background:rgba(124,179,66,.09)}
.arch .node.truth{font-weight:800;border-width:2px}
.arch .node small{display:block;opacity:.7;font-weight:400;font-size:11px;margin-top:1px}
.arch .arr{font-size:13px;line-height:.5;opacity:.5}
.arch .leg .arr{color:#ef5350}.arch .our .arr{color:#7cb342}
.arch .net{padding:6px 13px;text-align:center;font-size:9.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;border-top:2px dashed;border-bottom:2px dashed}
.arch .leg .net{color:#ef5350;border-color:rgba(239,83,80,.6);background:rgba(239,83,80,.11)}
.arch .our .net{color:#9e9e9e;border-color:rgba(128,128,128,.4);background:rgba(128,128,128,.06)}
.arch .cross{display:flex;justify-content:center;gap:16px;margin-top:3px;font-size:12px;letter-spacing:.3px}
.arch .leg .cross b{color:#ef5350}
.arch .our .cross b{color:#bdbdbd;font-weight:600}
/* Kill-points comparison table — color the three lanes, accent the verdict */
.killtable table{border-collapse:separate;border-spacing:0;width:100%;display:table;margin:14px 0}
.killtable td,.killtable th{border:0;padding:9px 12px;vertical-align:top;font-size:12.5px;line-height:1.42}
.killtable thead th{font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid rgba(128,128,128,.25);font-weight:800}
.killtable thead th:nth-child(2){color:#ef5350}
.killtable thead th:nth-child(3){color:#7cb342}
.killtable thead th:nth-child(4){color:#ffa000}
.killtable tbody tr:nth-child(even) td{background:rgba(128,128,128,.04)}
.killtable td:nth-child(1){font-weight:700}
.killtable td:nth-child(2){color:#c62828;background:rgba(239,83,80,.06)}
.killtable td:nth-child(3){background:rgba(124,179,66,.07)}
.killtable td:nth-child(4){font-weight:800;color:#ef8e00;border-left:2px solid rgba(255,160,0,.4)}
[data-md-color-scheme="slate"] .killtable td:nth-child(2){color:#ef9a9a}
[data-md-color-scheme="slate"] .killtable td:nth-child(4){color:#ffb74d}
/* shared data-table polish — used across the vitals / DR / conversion tables */
.dtbl table{border-collapse:separate;border-spacing:0;width:100%;display:table;margin:14px 0;font-size:12.5px}
.dtbl td,.dtbl th{border:0;padding:8px 11px;vertical-align:top;line-height:1.42}
.dtbl thead th{font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;font-weight:800;border-bottom:2px solid rgba(128,128,128,.25)}
.dtbl tbody tr:nth-child(even) td{background:rgba(128,128,128,.04)}
.dtbl td:first-child{font-weight:700}
/* highlight the winning "Ours" column when it is the last column */
.hl-last thead th:last-child{color:#7cb342}
.hl-last td:last-child{background:rgba(124,179,66,.08)!important;border-left:2px solid rgba(124,179,66,.35)}
/* DR backup table: col 2 = ours (green) · col 3 = ratio (amber) */
.hl23 thead th:nth-child(2){color:#7cb342}
.hl23 thead th:nth-child(3){color:#ffa000}
.hl23 td:nth-child(2){background:rgba(124,179,66,.08)!important}
.hl23 td:nth-child(3){font-weight:800;color:#ef8e00;border-left:2px solid rgba(255,160,0,.4)}
[data-md-color-scheme="slate"] .hl23 td:nth-child(3){color:#ffb74d}
/* highlight the win column when it is column 2 (3-col "what a server used to do") */
.hl-2 thead th:nth-child(2){color:#7cb342}
.hl-2 td:nth-child(2){background:rgba(124,179,66,.08)!important;border-left:2px solid rgba(124,179,66,.35)}
/* deleted-server fan-out — one dead node redistributes to four owners-of-nothing */
.fan{margin:18px 0;text-align:center}
.fan .dead{display:inline-block;border:3px dashed rgba(211,47,47,.7);background:rgba(239,83,80,.10);color:#ef5350;font-weight:800;font-size:13px;padding:9px 18px;border-radius:10px;line-height:1.25;letter-spacing:.3px}
.fan .dead small{display:block;font-weight:700;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;margin-top:1px}
.fan .redist{font-size:9.5px;text-transform:uppercase;letter-spacing:1.5px;opacity:.5;font-weight:800;margin:9px 0 2px}
.fan .spokes{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:11px;margin-top:6px}
.fan .spoke{border:1px solid rgba(128,128,128,.25);border-top:3px solid var(--sc);background:rgba(128,128,128,.04);border-radius:9px;padding:10px 12px;line-height:1.3;text-align:center}
.fan .spoke b{color:var(--sc);display:block;font-size:12.5px;font-weight:800}
.fan .spoke small{display:block;opacity:.7;font-weight:400;font-size:11px;margin-top:3px}
.fan .spoke .jobs{list-style:none;margin:9px 0 0;padding:9px 0 0;border-top:1px solid rgba(128,128,128,.2);text-align:left}
.fan .spoke .jobs li{font-size:11.5px;line-height:1.34;margin:0 0 8px;padding-left:13px;position:relative;font-weight:400}
.fan .spoke .jobs li:last-child{margin-bottom:0}
.fan .spoke .jobs li::before{content:"";position:absolute;left:0;top:6px;width:5px;height:5px;border-radius:50%;background:var(--sc);opacity:.75}
.fan .spoke .jobs b{font-weight:700}
.fan .spoke .jobs a{font-size:10.5px;font-weight:700;color:var(--sc);text-decoration:none;border-bottom:1px dotted var(--sc);white-space:nowrap}
.fan .spoke .jobs .off{opacity:.5;font-style:italic}
/* git ∷ ours parallel — same shape, one addition */
.gitmap{margin:16px 0;border:1px solid rgba(124,179,66,.4);border-radius:12px;overflow:hidden}
.gitmap .gm-h,.gitmap .row{display:grid;grid-template-columns:1fr 34px 1fr;align-items:center}
.gitmap .gm-h{background:rgba(128,128,128,.06);border-bottom:1px solid rgba(128,128,128,.18);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}
.gitmap .gm-h>div{padding:9px 13px}
.gitmap .gm-h .l{color:#78909c;text-align:right}
.gitmap .gm-h .r{color:#7cb342}
.gitmap .row{font-size:12.5px;line-height:1.35;border-top:1px solid rgba(128,128,128,.1)}
.gitmap .row>div{padding:8px 13px}
.gitmap .row .l{text-align:right;opacity:.72}
.gitmap .eq{text-align:center;color:#7cb342;font-size:14px;padding:0!important}
.gitmap .row .eq{opacity:.3;font-size:12px}
.gitmap .row .r{background:rgba(124,179,66,.06);font-weight:600}
.gitmap .gm-add{padding:9px 14px;background:rgba(255,160,0,.12);border-top:2px solid rgba(255,160,0,.4);font-size:12px;line-height:1.4;text-align:center}
.gitmap .gm-add b{color:#ef8e00}
[data-md-color-scheme="slate"] .gitmap .gm-add b{color:#ffb74d}
@media (max-width:520px){.gitmap .gm-h,.gitmap .row{grid-template-columns:1fr}.gitmap .eq{display:none}.gitmap .gm-h .l,.gitmap .row .l{text-align:left}.gitmap .row .r{border-top:1px dashed rgba(124,179,66,.3)}}
.gitline{margin:14px 0;padding:11px 16px;border-left:4px solid #7cb342;background:rgba(124,179,66,.08);border-radius:0 8px 8px 0;font-size:13px;line-height:1.5}
.gitline b{color:#7cb342;letter-spacing:.3px}
.gitline a{color:#7cb342;font-weight:700;text-decoration:none;border-bottom:1px dotted #7cb342;white-space:nowrap}
/* foldable later chapters */
details.fold{border:1px solid rgba(128,128,128,.25);border-radius:10px;margin:7px 0;background:rgba(128,128,128,.02)}
details.fold>summary{cursor:pointer;padding:12px 16px;font-weight:800;font-size:15px;list-style:none;display:flex;align-items:center;gap:10px;user-select:none;border-radius:10px}
details.fold[open]>summary{border-bottom:1px solid rgba(128,128,128,.18);border-radius:10px 10px 0 0}
details.fold>summary::-webkit-details-marker{display:none}
details.fold>summary::before{content:"▸";color:#7cb342;font-size:13px;transition:transform .15s ease;display:inline-block}
details.fold[open]>summary::before{transform:rotate(90deg)}
details.fold>summary:hover{background:rgba(124,179,66,.07)}
details.fold>summary .hint{font-weight:400;font-size:12px;opacity:.55;margin-left:auto}
details.fold .fbd{padding:6px 16px 14px}
/* "At a glance" stat cards — whole card is a link */
.glance-card{flex:1 1 150px;border-radius:12px;padding:10px 8px;text-align:center;text-decoration:none;color:inherit;display:block;transition:transform .12s ease,box-shadow .12s ease}
.glance-card:hover{transform:translateY(-3px);box-shadow:0 6px 18px rgba(0,0,0,.18)}
/* "Proven ideas" pillar cards — one per row of the old table */
.pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:18px 0}
.pillar{border:1px solid var(--pc);border-radius:12px;background:var(--pcbg);display:flex;flex-direction:column;overflow:hidden}
.pillar .bd{padding:14px 16px 6px}
.pillar svg{width:28px;height:28px;color:var(--pc);margin-bottom:8px;display:block}
.pillar .title{font-size:15px;font-weight:800;line-height:1.2}
.pillar .by{font-size:12px;color:var(--pc);font-weight:700;margin:3px 0 9px}
.pillar .proved{font-size:13px;line-height:1.45;opacity:.85}
.pillar .use{margin-top:auto;padding:9px 16px;border-top:1px solid var(--pc);background:var(--pcft);font-size:12.5px;line-height:1.45}
.pillar .use b{color:var(--pc)}
.pillar .use a{color:var(--pc);font-weight:700;text-decoration:none;border-bottom:1px dotted var(--pc)}
.pillar .use code{font-size:11px}
/* Facebook-style BLURBS — visible posts, NOT collapsed folds. blurb → Read more (inline) → Serious read (the vault) */
.blurb{border:1px solid rgba(128,128,128,.22);border-left:4px solid #7cb342;border-radius:10px;padding:13px 18px;margin:12px 0;background:rgba(124,179,66,.045)}
.blurb .hook{font-size:17px;font-weight:800;line-height:1.26}
.blurb .teaser{font-size:13.5px;line-height:1.52;margin:6px 0 0;opacity:.92}
.blurb .moretoggle{position:absolute;opacity:0;width:0;height:0;pointer-events:none}
.blurb .rest{display:none;font-size:13px;line-height:1.56}
.blurb .moretoggle:checked ~ .rest{display:block;margin-top:8px}
.blurb .morelnk{display:inline-block;margin-top:9px;cursor:pointer;font-size:12px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#42a5f5;border:1px solid rgba(66,165,245,.5);border-radius:6px;padding:3px 10px}
.blurb .morelnk:hover{background:rgba(66,165,245,.12)}
.blurb .morelnk::before{content:"Read more  ▾"}
.blurb .moretoggle:checked ~ .morelnk::before{content:"Read less  ▴"}
.blurb .serious{display:inline-block;margin-top:11px;font-size:11.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#ef8e00;text-decoration:none}
.blurb .serious::after{content:"  ⟶"}
.blurb .serious:hover{text-decoration:underline}
/* migration status strip — 4-state honesty panel (green=folds today · amber=extraction · red=fold gap · blue=deleted by architecture) */
.status3{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:16px 0}
.status3 .band{border:1px solid var(--bc);border-top:4px solid var(--bc);border-radius:11px;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}
.status3 .bh{padding:11px 14px 8px}
.status3 .tag{font-size:10px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--bc);display:flex;align-items:center;gap:6px}
.status3 .ttl{font-size:14.5px;font-weight:800;line-height:1.2;margin:4px 0 2px}
.status3 .gloss{font-size:11.5px;opacity:.72;line-height:1.38}
.status3 ul{list-style:none;margin:8px 0 0;padding:9px 14px 13px;border-top:1px solid rgba(128,128,128,.18)}
.status3 li{font-size:12px;line-height:1.34;margin:0 0 7px;padding-left:14px;position:relative}
.status3 li:last-child{margin-bottom:0}
.status3 li::before{content:"";position:absolute;left:0;top:6px;width:5px;height:5px;border-radius:50%;background:var(--bc);opacity:.8}
.status3 li b{font-weight:700}
.status3 .foot{margin-top:auto;padding:8px 14px;background:var(--ft);font-size:11px;font-weight:700;color:var(--bc);border-top:1px solid var(--bc)}
.status3 .green{--bc:#7cb342;--bg:rgba(124,179,66,.07);--ft:rgba(124,179,66,.14)}
.status3 .amberx{--bc:#ffa000;--bg:rgba(255,160,0,.06);--ft:rgba(255,160,0,.13)}
.status3 .redf{--bc:#ef5350;--bg:rgba(239,83,80,.06);--ft:rgba(239,83,80,.13)}
.status3 .bluen{--bc:#42a5f5;--bg:rgba(66,165,245,.06);--ft:rgba(66,165,245,.13)}
.statuslead{border-left:4px solid #7cb342;background:rgba(124,179,66,.07);border-radius:0 8px 8px 0;padding:11px 16px;font-size:13px;margin:10px 0 2px}
.statuslead b{color:#7cb342}
/* DNA click-popover — anchored on the headline's "1% codebase is DNA" phrase */
.dnapop-wrap{position:relative}
.dnapop-ck{position:absolute;opacity:0;width:0;height:0;pointer-events:none}
.dnapop-bg{display:none}
.dnapop-ck:checked ~ .dnapop-bg{display:block;position:fixed;inset:0;z-index:998;background:rgba(0,0,0,.45);cursor:default}
.dnapop-card{display:none}
.dnapop-ck:checked ~ .dnapop-card{display:block}
.dnapop-card{position:absolute;left:50%;top:calc(100% + 14px);transform:translateX(-50%);z-index:999;width:min(560px,92vw);text-align:left;background:#1a212a;border:1px solid #2f3a45;border-top:3px solid #ffb74d;border-radius:12px;padding:16px 30px 16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.55);color:#cdd6df;font-size:13px;line-height:1.5;font-weight:400;letter-spacing:normal;text-transform:none}
.dnapop-card h4{margin:0 0 8px;font-size:14.5px;color:#ffcc80;font-weight:800;letter-spacing:.2px}
.dnapop-card b{color:#fff;font-weight:700}
.dnapop-card code{background:rgba(128,128,128,.2);padding:1px 5px;border-radius:4px;font-size:.86em;color:#e7edf3}
.dnapop-card ul{margin:8px 0 0;padding-left:18px}
.dnapop-card li{margin:0 0 7px}
.dnapop-card .src{display:block;margin-top:10px;font-size:11.5px;color:#90a4ae}
.dnapop-card .src a{color:#8fc3f7}
.dnapop-x{position:absolute;top:7px;right:12px;color:#90a4ae;font-size:15px;cursor:pointer;font-weight:700;line-height:1}
.dnapop-trig{cursor:pointer}
</style>

<div style="max-width:760px;margin:24px auto 8px;padding:30px 40px;background:#263238;border-left:4px solid #ff9800;text-align:center;border-radius:4px" markdown="0">
<span style="font-size:2.4em;font-weight:800;line-height:1.15;color:#eceff1;letter-spacing:0.3px">The Server Is Dead</span>
<br><span style="font-size:1.05em;font-weight:600;line-height:1.35;color:#ffcc80;margin-top:12px;display:inline-block">The DB is the log is the kernel — in the browser</span>
<br><span style="font-size:0.8em;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;margin-top:14px;display:inline-block">Already proven by<br><b style="font-size:1.2em;letter-spacing:2.5px;color:#ffffff">Pacioli &nbsp;·&nbsp; Torvalds &nbsp;·&nbsp; Hipp</b></span>
<br><span class="dnapop-wrap" style="margin-top:16px;display:inline-block"><a href="https://red1oon.github.io/bim-ootb/" title="Try It Live." style="text-decoration:none"><b style="font-size:1.12em;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;background:linear-gradient(135deg,#aab3b8 0%,#838c92 30%,#c2cace 52%,#7c858b 74%,#a7b0b5 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;opacity:.72;filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))">Assembled by RED1, </b></a><input type="checkbox" id="dnapop1" class="dnapop-ck"><label for="dnapop1" class="dnapop-trig" title="Why 1% is the DNA"><b style="font-size:1.12em;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;background:linear-gradient(135deg,#aab3b8 0%,#838c92 30%,#c2cace 52%,#7c858b 74%,#a7b0b5 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;opacity:.72;filter:drop-shadow(0 1px 1px rgba(0,0,0,.3));border-bottom:1px dotted rgba(176,190,197,.55)">1% codebase is DNA, the rest — noise</b></label><label for="dnapop1" class="dnapop-bg" title="close"></label><span class="dnapop-card"><label for="dnapop1" class="dnapop-x" title="close">&#10005;</label><h4>Why MOrder is the DNA — what 1% buys you</h4>Examining the <b>MOrder cycle</b> (&#8776;3,287 lines &mdash; ~0.2% of the codebase) gives you the whole organism, because MOrder is the <b>archetype</b>. From that one class you read:<ul><li><b>How it ORMs</b> &mdash; every table is <code>X_&lt;Table&gt;</code> (generated boilerplate) <b>+</b> <code>M&lt;Table&gt;</code> (logic subclass); <code>MOrder extends X_Order</code> &mdash; the idiom for all 925 tables.</li><li><b>The document lifecycle</b> &mdash; <code>DocAction</code> (<code>prepareIt</code> &middot; <code>completeIt</code> &middot; <code>voidIt</code> &hellip;) walked by the <code>DocumentEngine</code> FSM.</li><li><b>The posting idiom</b> &mdash; <code>Doc_Order</code> turns the document into <code>fact_acct</code> lines; every document has a <code>Doc_*</code> poster of the same shape.</li><li><b>How it treats its model</b> &mdash; model-driven: the AD describes it as data; the class enforces <code>beforeSave</code> + binds callouts; the poster derives the GL.</li></ul>Proven, not assumed: the other ~25 document classes are <b>isomorphs of MOrder</b>, each walked as a measured delta and diffed to zero. The ~5 deep exceptions: <code>MInOut</code> in-transit &middot; <code>MPayment</code> allocation &middot; <code>MProduction</code> BOM &middot; <code>MInventory</code> count &middot; <code>MAllocationHdr</code> headerless.<span class="src">Source: <a href="../ERP_MODEL_ARCHETYPE/">ERP_MODEL_ARCHETYPE.md</a></span></span></span>
</div>

 

<div style="display:flex;gap:10px;flex-wrap:wrap;margin:16px 0" markdown="0">
  <a class="glance-card" href="#dr-tco" style="background:rgba(255,160,0,.12);border:1px solid rgba(255,160,0,.5)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-label="cost savings" role="img" style="width:100%;height:72px;color:#ffa000;display:block;margin:0 auto 6px"><path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/><path d="M16 10h.01"/><path d="M2 8v1a2 2 0 0 0 2 2h1"/></svg>
    <div style="font-size:19px;font-weight:800;line-height:1.1;color:#ffa000">≥30×</div>
    <div style="font-size:12px;margin-top:6px;opacity:.85">less disaster-recovery storage at equal guarantee (<b>TCO</b>)</div>
  </a>
  <a class="glance-card" href="#no-server" style="background:rgba(124,179,66,.12);border:1px solid rgba(124,179,66,.45)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-label="zero network round-trips" role="img" style="width:100%;height:72px;color:#7cb342;display:block;margin:0 auto 6px"><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/></svg>
    <div style="font-size:19px;font-weight:800;line-height:1.1;color:#7cb342">0</div>
    <div style="font-size:12px;margin-top:6px;opacity:.85">network round-trips on the read / fold path</div>
  </a>
  <a class="glance-card" href="#speed" style="background:rgba(255,112,67,.12);border:1px solid rgba(255,112,67,.45)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-label="speed" role="img" style="width:100%;height:72px;color:#ff7043;display:block;margin:0 auto 6px"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
    <div style="font-size:19px;font-weight:800;line-height:1.1;color:#ff7043">~53×</div>
    <div style="font-size:12px;margin-top:6px;opacity:.85">faster bootstrap from a signed checkpoint vs genesis replay</div>
  </a>
  <a class="glance-card" href="#realistic-conversion-estimate-loc" style="background:rgba(66,165,245,.12);border:1px solid rgba(66,165,245,.45)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-label="code bloat" role="img" style="width:100%;height:72px;color:#42a5f5;display:block;margin:0 auto 6px"><path d="M11 21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1"/><path d="M16 16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1"/><path d="M21 6a2 2 0 0 0-.586-1.414l-2-2A2 2 0 0 0 17 2h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1z"/></svg>
    <div style="font-size:19px;font-weight:800;line-height:1.1;color:#42a5f5">≈21×</div>
    <div style="font-size:12px;margin-top:6px;opacity:.85">less code at full iDempiere parity <i>(conservative)</i> — <i>≈51× engine-shell delivered today</i></div>
  </a>
  <a class="glance-card" href="#dr-tco" style="background:rgba(171,71,188,.12);border:1px solid rgba(171,71,188,.45)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-label="database backup" role="img" style="width:100%;height:72px;color:#ab47bc;display:block;margin:0 auto 6px"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
    <div style="font-size:19px;font-weight:800;line-height:1.1;color:#ab47bc">192 GB→0.78 GB</div>
    <div style="font-size:12px;margin-top:6px;opacity:.85"><b>Back up the recipe, not the result.</b></div>
  </a>
</div>
 
<span id="status"></span>

<p style="margin:16px 0;font-size:15px"><a href="migrate_status_panel.html"><b>What is Done and Pending</b> — the four-state migration honesty map &nbsp;🟢🟠🔴🔵&nbsp; ↗</a></p>

---

## But ERP is tough — an aircraft carrier is about to go into a bathtub

<div class="cf" markdown="0">
<style>
.cf{margin:14px 0 24px;padding:14px 16px 10px;border:1px solid #2b3947;border-radius:14px;background:linear-gradient(100deg,rgba(124,179,66,.07),rgba(66,165,245,.05))}
.cf-by{display:block;text-align:center;font-weight:850;font-size:clamp(18px,3.6vw,27px);letter-spacing:.3px;color:#ffcc80!important;text-decoration:none!important;margin:2px 0 4px}
.cf-by:hover{text-decoration:underline!important;text-underline-offset:3px}
.cf svg{display:block;width:100%;height:auto;max-height:240px}
.cf .lbl{font:800 11px system-ui,sans-serif;fill:#7e8b98;letter-spacing:.6px}
.cf .hq{fill:url(#cfg);stroke:rgba(124,179,66,.5);stroke-width:1.4}
.cf .hqt{font:850 14px system-ui,sans-serif;fill:#fff}
.cf .hqs{font:800 9px system-ui,sans-serif;fill:#9fd17a;letter-spacing:.5px}
.cf .till rect{fill:#212a34;stroke:#2b3947;stroke-width:1}
.cf .till .scr{fill:rgba(124,179,66,.25)}
.cf .wire{stroke:#2b3947;stroke-width:1.3;fill:none}
.cf .chip{fill:#39434f;stroke:rgba(148,163,177,.38);stroke-width:1.2}
.cf .chipt{font:800 13px system-ui,sans-serif;fill:#e7edf3}
.cf .chips{font:800 9px system-ui,sans-serif;fill:#aab6c1;letter-spacing:.6px}
.cf .ph{font:800 11px system-ui,sans-serif;letter-spacing:.7px}
.cf .foot{text-align:center;font-size:11.5px;color:#8a97a4;margin:6px 0 2px}
.cf .foot a{color:#9fc3ea}
</style>
<a class="cf-by" href="../RetailScaleStory.html" title="The full animated, plain-English one-pager — bar charts, legacy side-by-side, and a benchmark you can run (W-POS-WAN-SCALE).">And the carrier floats at 10,000 tills!</a>
<svg class="flowsvg" viewBox="0 0 960 300" role="img" aria-label="A day in two messages: each morning replenishment flows from the HQ warehouse out to the tills, then stops; at night each till sends one report back to HQ.">
<style>
.flowsvg .tl rect{fill:#212a34;stroke:#2b3947;stroke-width:1}
.flowsvg .tl .s{fill:rgba(124,179,66,.25)}
.flowsvg .w{stroke:#2b3947;stroke-width:1.4;fill:none}
.flowsvg .ob{fill:#1c2530;stroke:rgba(124,179,66,.55);stroke-width:1.5}
.flowsvg .ot{font:850 16px system-ui,sans-serif;fill:#fff}
.flowsvg .os{font:800 10px system-ui,sans-serif;letter-spacing:.6px}
.flowsvg .lb{font:800 11px system-ui,sans-serif;fill:#7e8b98;letter-spacing:.7px}
.flowsvg .ch{fill:#ff9800;stroke:#ffb74d;stroke-width:1.5}
.flowsvg .cht{font:850 15px system-ui,sans-serif;fill:#3a1d00}
.flowsvg .chs{font:800 10px system-ui,sans-serif;fill:#6b3b00;letter-spacing:1.5px}
.flowsvg .ph{font:800 12px system-ui,sans-serif;letter-spacing:.8px}
</style>
<defs><g id="ftl"><rect width="48" height="38" rx="5"/><rect class="s" x="7" y="7" width="34" height="16" rx="2"/><rect x="13" y="29" width="22" height="4" rx="2" fill="#394552"/></g></defs>
<text class="lb" x="20" y="28">10,000 TILLS · STORES ON A WAN</text>
<use href="#ftl" class="tl" x="24" y="44"/><use href="#ftl" class="tl" x="128" y="44"/><use href="#ftl" class="tl" x="232" y="44"/>
<use href="#ftl" class="tl" x="24" y="102"/><use href="#ftl" class="tl" x="128" y="102"/><use href="#ftl" class="tl" x="232" y="102"/>
<use href="#ftl" class="tl" x="24" y="160"/><use href="#ftl" class="tl" x="128" y="160"/><use href="#ftl" class="tl" x="232" y="160"/>
<use href="#ftl" class="tl" x="24" y="218"/><use href="#ftl" class="tl" x="128" y="218"/><use href="#ftl" class="tl" x="232" y="218"/>
<path class="w" d="M280,63 C470,63 600,150 770,150"/>
<path class="w" d="M280,121 C470,121 640,150 770,150"/>
<path class="w" d="M280,179 C470,179 660,150 770,150"/>
<path class="w" d="M280,237 C470,237 600,150 770,150"/>
<rect class="ob" x="772" y="96" width="168" height="108" rx="14"/>
<text class="ot" x="856" y="140" text-anchor="middle">HEAD OFFICE</text>
<text class="os" x="856" y="160" text-anchor="middle" fill="#9fd17a">· WAREHOUSE ·</text>
<text class="os" x="856" y="178" text-anchor="middle" fill="#8fb3d8">BOOKS TO THE PENNY</text>
<rect class="ch" x="390" y="10" width="220" height="46" rx="23"/>
<text class="cht" x="500" y="33" text-anchor="middle">2 messages a day</text>
<text class="chs" x="500" y="48" text-anchor="middle">PER TILL</text>
<circle class="am" r="5" fill="#ffa000" style="filter:drop-shadow(0 0 4px rgba(255,160,0,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="1;1;0;0" keyTimes="0;.07;.32;1" path="M280,63 C470,63 600,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.07;.09;.30;.32;1" values="0;0;1;1;0;0"/></circle>
<circle class="am" r="5" fill="#ffa000" style="filter:drop-shadow(0 0 4px rgba(255,160,0,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="1;1;0;0" keyTimes="0;.12;.37;1" path="M280,121 C470,121 640,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.12;.14;.35;.37;1" values="0;0;1;1;0;0"/></circle>
<circle class="am" r="5" fill="#ffa000" style="filter:drop-shadow(0 0 4px rgba(255,160,0,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="1;1;0;0" keyTimes="0;.17;.42;1" path="M280,179 C470,179 660,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.17;.19;.40;.42;1" values="0;0;1;1;0;0"/></circle>
<circle class="am" r="5" fill="#ffa000" style="filter:drop-shadow(0 0 4px rgba(255,160,0,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="1;1;0;0" keyTimes="0;.22;.47;1" path="M280,237 C470,237 600,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.22;.24;.45;.47;1" values="0;0;1;1;0;0"/></circle>
<circle class="bl" r="5" fill="#42a5f5" style="filter:drop-shadow(0 0 4px rgba(66,165,245,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;.57;.82;1" path="M280,63 C470,63 600,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.57;.59;.80;.82;1" values="0;0;1;1;0;0"/></circle>
<circle class="bl" r="5" fill="#42a5f5" style="filter:drop-shadow(0 0 4px rgba(66,165,245,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;.62;.87;1" path="M280,121 C470,121 640,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.62;.64;.85;.87;1" values="0;0;1;1;0;0"/></circle>
<circle class="bl" r="5" fill="#42a5f5" style="filter:drop-shadow(0 0 4px rgba(66,165,245,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;.67;.92;1" path="M280,179 C470,179 660,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.67;.69;.90;.92;1" values="0;0;1;1;0;0"/></circle>
<circle class="bl" r="5" fill="#42a5f5" style="filter:drop-shadow(0 0 4px rgba(66,165,245,.85))"><animateMotion dur="7s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;.72;.97;1" path="M280,237 C470,237 600,150 770,150"/><animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.72;.74;.95;.97;1" values="0;0;1;1;0;0"/></circle>
<text class="ph" x="500" y="292" text-anchor="middle" fill="#ffa000">☀ MORNING — REPLENISHMENT OUT (HQ → TILLS)<animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.04;.07;.49;.52;1" values="0;0;1;1;0;0"/></text>
<text class="ph" x="500" y="292" text-anchor="middle" fill="#42a5f5">🌙 NIGHT — REPORTS IN (TILLS → HQ)<animate attributeName="opacity" dur="7s" repeatCount="indefinite" keyTimes="0;.54;.57;.97;.99;1" values="0;0;1;1;0;0"/></text>
</svg>
<div class="foot"><a href="../RetailScaleStory.html">See the full animated one-pager →</a> &nbsp;·&nbsp; proof you can run: <code>W-POS-WAN-SCALE</code></div>
</div>

<details class="fold" markdown="0">
<summary>The six interlocked things it takes &nbsp;<span style="display:inline-flex;gap:6px;align-items:center;vertical-align:middle">
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#ffa000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/></svg>
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#7cb342" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg>
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#ff7043" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#42a5f5" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v8l3-3 3 3V2"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#ab47bc" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#26a69a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></svg>
</span></summary>
<div class="fbd" markdown="0">

<div class="pillars" markdown="0">

  <div class="pillar" style="--pc:#ffa000;--pcbg:rgba(255,160,0,.07);--pcft:rgba(255,160,0,.16)">
    <div class="bd">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/></svg>
      <div class="title">Double-entry ledger</div>
      <div class="by">Luca Pacioli · codified 1494</div>
      <div class="proved">The books are a <i>fold</i> of postings — Σdebit ≡ Σcredit.</div>
    </div>
    <div class="use">▸ Our journal is a fold — ΣDr ≡ ΣCr <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_postings.js"><code>poc_postings.js</code></a></div>
  </div>

  <div class="pillar" style="--pc:#7cb342;--pcbg:rgba(124,179,66,.08);--pcft:rgba(124,179,66,.16)">
    <div class="bd">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg>
      <div class="title">The log is the truth</div>
      <div class="by">Linus Torvalds · git, 2005</div>
      <div class="proved">Hash-chained, signable history no central machine owns; the host is disposable.</div>
    </div>
    <div class="use">▸ The signed op-log + <code>verifyChain()</code> — “the host is a Git remote.”</div>
  </div>

  <div class="pillar" style="--pc:#ff7043;--pcbg:rgba(255,112,67,.08);--pcft:rgba(255,112,67,.16)">
    <div class="bd">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
      <div class="title">Event sourcing / replay</div>
      <div class="by">Martin Fowler · Greg Young · 2005</div>
      <div class="proved">State = deterministic <i>replay</i> of an append-only log.</div>
    </div>
    <div class="use">▸ The kernel folds the log <a href="OpLogERP.md"><code>OpLogERP.md</code></a></div>
  </div>

  <div class="pillar" style="--pc:#42a5f5;--pcbg:rgba(66,165,245,.08);--pcft:rgba(66,165,245,.16)">
    <div class="bd">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v8l3-3 3 3V2"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
      <div class="title">The active data dictionary</div>
      <div class="by">Jörg Janke · Compiere → iDempiere</div>
      <div class="proved">An app can describe <i>itself</i> as data — tables, windows, rules.</div>
    </div>
    <div class="use">▸ The 925-table AD rides as <b>data</b>, folded through 5 relations + verbs.</div>
  </div>

  <div class="pillar" style="--pc:#ab47bc;--pcbg:rgba(171,71,188,.09);--pcft:rgba(171,71,188,.17)">
    <div class="bd">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
      <div class="title">Hash trees + public-key signatures</div>
      <div class="by">Merkle · Diffie–Hellman · RSA</div>
      <div class="proved">A fact can carry its own integrity <i>and</i> authenticity anywhere.</div>
    </div>
    <div class="use">▸ ECDSA-P256 signed ops; tamper caught on replay <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_sign.js"><code>poc_sign.js</code></a> · <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_chain.js"><code>poc_chain.js</code></a></div>
  </div>

  <div class="pillar" style="--pc:#26a69a;--pcbg:rgba(38,166,154,.09);--pcft:rgba(38,166,154,.17)">
    <div class="bd">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></svg>
      <div class="title">SQLite, embeddable</div>
      <div class="by">D. Richard Hipp</div>
      <div class="proved">A full SQL engine with <i>no server</i> — and now WASM.</div>
    </div>
    <div class="use">▸ Folds the log locally, inside the browser tab.</div>
  </div>

</div>

</div>

</details>

---

## Thesis — ERP as git

A classic ERP is a **server of record**: every read, write and posting is a round-trip to a machine that *owns the truth*. We keep the accounting and the document flow but **delete that server**. The truth becomes a *signed, hash-chained op-log*; the live numbers are a deterministic **fold** of it, replayed by a SQLite-WASM kernel **in the browser**. The host turns disposable (a Git remote); the user owns the log; period-end **compaction** is a *signed checkpoint* carrying balances forward — not a batch job with a down-window (the close *postings* are themselves folds, still being built).

The browser client that renders this is now branded **Kernel-ERP** — the product name; "folded from the iDempiere oracle" and "iDempiere-faithful" remain accurate *descriptions* of what the engine does (the oracle of record is a real iDempiere, the `idempiere_test` Postgres, diffed to the cent). By deliberate design the surface is **indistinguishable from real iDempiere**: classic ADWindow chrome only — one toolbar (New / Copy / Save / Save&New / Delete / Ignore / Process), folder tabs, the standard header — with everything *not* native to iDempiere moved off onto a single `⋯` pill rail (share / home / graph / kanban / POS / Ninja / history). Editing is in-place (form-view edits inline, no modal); *Zoom Across* is a real where-used drill, the *Process* button greys when a record has none, and leaving an unsaved record raises the native dirty-exit prompt — all diffed against the iDempiere source, not approximated (`W-ZOOM-ACROSS`, `W-DIRTY-GATE`).

A claim about **substrate and delivery**, not features — the legacy stacks have vastly more. What we show: the *architecture* folds the same transactions with **zero network on the read/fold path** — proven by folding a **live Odoo**, **iDempiere's own flows** (it's the AD we render), and a **SAP Business One** flow (mock export) into the same six verbs. S/4HANA is still pending a real oracle.

<div class="gitline" markdown="1">**ERP as git** — what git did to source code, we do to transactions: the log is the truth, every client folds the whole history, and the host is a *disposable remote*. The one thing git lacks — invariant enforcement (no double-spend) — we add. [See the full git ∷ ours parallel ↓](#erp-as-git)</div>

---

<span id="fold-chess"></span>

## What a *fold* is — the chess scoresheet

You don't store the chessboard — you store the **move list**, and replay it. The position is a deterministic *fold* of those moves: lose the board, keep the sheet, rebuild it exactly; anyone who replays the same moves reaches the same position. Our ERP is identical — the **signed op-log is the move list, the live balances are the board.** A fold, never a stored snapshot.

<figure style="text-align:center;margin:18px 0">
  <img src="../img/chessfolding.jpg" alt="A chess scoresheet folds back into the board position" style="max-width:460px;width:100%;border-radius:8px">
  <figcaption style="font-size:0.85em;opacity:.8;margin-top:6px">The scoresheet (the log) folds back into the position (the state) — lose the board, keep the sheet, rebuild it exactly.</figcaption>
</figure>

---

## The kill points — what the architecture actually deletes

> **The shocker, in one line:** there is **no server of record.** The browser holds the kernel; a signed,
> hash-chained log holds the truth; the host (if any) is a disposable relay. Every row below follows from that.

<div class="killtable" markdown="1">

| What changes | Legacy ERP | Our WASM event-source | The cut |
|---|---|---|---|
| **The server of record** | a machine that *owns the truth* — JVM + Postgres + 3.7 GB build [^bloat] | **✗ none** — the browser runs the kernel; the signed log is the truth [^own] | **the whole tier is deleted** |
| **Read / fold round-trips** | 1 network hop per interaction [^arch] | **0** — the kernel answers locally [^noround] | network off the hot path |
| **Ownership / trust** | the server DB owns your record [^arch] | **you own a signed op-log**; the host is disposable [^own] | trust model inverted |
| **Document schema** | ≈925 AD tables, each a hand-written model class [^bloat2] | **5 core relations** (containers · items · documents · document_lines · journal) + verbs — the rest of the AD rides as **data** [^reduce] | hardcoded schema, *not* ERP scope (the AD is unchanged — it's the seed) |
| **Runtime code** | 1,427,147 Java LOC / 4,465 files [^bloat] | **28,184 JS LOC / 132 files** (the engine shell + flows folded so far) [^bloat] | ≈51× built-so-far · **~21× at conservative full parity** [below](#realistic-conversion-estimate-loc) |
| **Bootstrap** (open the books) | re-query the server [^arch] | **signed checkpoint** — 0.90 ms vs 47.70 ms genesis [^drive] | ≈53× |
| **Seed DB** | 45.2 MB dump [^bloat] | **26.1 MB** full-width self-describing AD (was 12.7 MB sliced — completeness chosen over ratio) [^bloat] | ≈1.7× |
| **Live DB → SQLite** | 143 MB Postgres [^bloat2] | **43 MB** SQLite (gzip 11.7 MB) [^bloat2] | ≈3.3× |
| **Backup / DR** | backup rotation, 30–50 copies = many× the state; restore = down-window [^tco] | **the recipe is the backup** — one signed log ×3 replicas, restore = replay, unbounded restore points [^tco][^blackout] | at least 30× less DR storage (strategy-dependent); **0 branch downtime** |
| **Report scratch tables** | reports `INSERT` ~15 `T_*` temp tables to read them back (`T_Report`, `T_InventoryValue`, `T_Aging`…) | **in-memory fold, 0 temp rows** — `foldStatement` proven `maxDiff=0c` (BS + IS + CF) + `foldPrint` (invoice `PrintData` tree, 8/8) + NinjaExcel template xlsx delivery (W-NINJA, `maxDiff=0c`); 13 remaining `T_*` folds pending per-report witness | the *materialize-then-read* tier deleted (proven for all 3 financial statements + document print + xlsx template) [below](#temp-tables) |

</div>

## How it differs — the architecture

<div class="arch" markdown="0">

  <div class="col leg">
    <div class="hd"><span>Legacy · server of record</span><span class="badge">≥1 round-trip / gesture</span></div>
    <div class="zone local">
      <div class="znote">browser · thin client</div>
      <div class="node">user gesture</div>
      <div class="arr">▼</div>
      <div class="node">renders only the row it’s sent back</div>
    </div>
    <div class="net">— network —<div class="cross"><b>▼ request</b><b>▲ rendered row</b></div></div>
    <div class="zone remote">
      <div class="znote">server of record · owns the truth</div>
      <div class="node">app server</div>
      <div class="arr">▼</div>
      <div class="node truth">database<small>owns the truth</small></div>
      <div class="arr">▼</div>
      <div class="node">posting / validation</div>
    </div>
  </div>

  <div class="col our">
    <div class="hd"><span>Ours · the browser is the server</span><span class="badge">0 round-trips · read/fold</span></div>
    <div class="zone local">
      <div class="znote">browser · local &amp; complete</div>
      <div class="node">user gesture → op</div>
      <div class="arr">▼</div>
      <div class="node truth">local WASM kernel<small>commit · hash-chain · sign — the log is the truth</small></div>
      <div class="arr">▼</div>
      <div class="node">replay / fold <small>SQLite-WASM, in-memory → paint · 0 network</small></div>
    </div>
    <div class="net">— network · crossed only later —<div class="cross"><b>⇣ async · disposable</b></div></div>
    <div class="zone remote">
      <div class="znote">owns nothing</div>
      <div class="node">dumb facilitator<small>disposable host</small></div>
    </div>
  </div>

</div>

**Legacy:** every read & write is a network round-trip; the DB owns the truth; period close is a server batch
job with a down-window. **Ours:** state = a deterministic fold of the signed op-log — **0 network on the
read/fold path**; the host is disposable (Git-like), the log is the truth; period close is a *signed checkpoint*.
Source: `docs/DistributedERP.md` §0 (lines 53–85, server→serverless table) + §10 (lines 467–468).

---

## But where's the server? — what replaced each job {#no-server}

*If you deleted the server, who does its work?* "Serverless" doesn't mean no machine ever talks to another — it means **no server of record, no machine that owns the truth.** Every job the server did still happens; each moved onto the **signed log**, the **kernel on each client**, the **user's own channel**, or a **dumb facilitator that owns nothing**.

*Every job the server did still happens — it just moves to one of four owners that own nothing, each proven by a POC in* `scripts/`[^poc]. *For an independent read of how well those proof scripts are built — separation, determinism, non-invention, adversarial falsifiers, and a per-script PASS scoreboard — see the* **Fold-Engine code-quality scorecard** *(all 18 witnesses green).*

<div class="fan" markdown="0">
  <div class="dead">✗ server of record<small>deleted</small></div>
  <div class="redist">▾ &nbsp; every job redistributes to four things that own nothing &nbsp; ▾</div>
  <div class="spokes">
    <div class="spoke" style="--sc:#7cb342"><b>the signed op-log</b>
      <ul class="jobs">
        <li>Hold the authoritative state <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_distributed.js">poc_distributed.js</a></li>
        <li>Merge concurrent edits <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_distributed.js">poc_distributed.js</a></li>
        <li>Reconcile discrepancies <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_postings.js">poc_postings.js</a></li>
      </ul>
    </div>
    <div class="spoke" style="--sc:#42a5f5"><b>the kernel on each client</b>
      <ul class="jobs">
        <li>Run / validate business logic <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_kernel.js">poc_kernel.js</a></li>
        <li>Mint record IDs <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_distributed.js">poc_distributed.js</a></li>
        <li>Prevent double-write <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_distributed.js">poc_distributed.js</a></li>
      </ul>
    </div>
    <div class="spoke" style="--sc:#ab47bc"><b>signatures + hash-chain</b>
      <ul class="jobs">
        <li>Detect tampering <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_chain.js">poc_chain.js</a></li>
        <li>Authenticate / authorise <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_sign.js">poc_sign.js</a></li>
      </ul>
    </div>
    <div class="spoke" style="--sc:#ff7043"><b>user’s channel + dumb facilitator</b>
      <ul class="jobs">
        <li>Durably store / back up <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_persist.js">poc_persist.js</a></li>
        <li>Sequence multi-party order <a href="https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_remote_pos.js">poc_remote_pos.js</a></li>
        <li><span class="off">Be always-on — nothing; work offline</span></li>
      </ul>
    </div>
  </div>
</div>

<span id="erp-as-git"></span>

**The analogy: git.** No central machine owns your code history — every clone has it all, verifies it, rebuilds from it; GitHub is a *convenience*, not the truth. **We do to transactions what git did to source code** — the same shape, line for line:

<div class="gitmap" markdown="0">
  <div class="gm-h"><div class="l">git · source code</div><div class="eq">≅</div><div class="r">ours · ERP transactions</div></div>
  <div class="row"><div class="l">hash-chained, signed commit history</div><div class="eq">≅</div><div class="r">hash-chained, signed op-log</div></div>
  <div class="row"><div class="l">every clone holds the whole history</div><div class="eq">≅</div><div class="r">every client folds the whole log</div></div>
  <div class="row"><div class="l">verifies it · rebuilds from it</div><div class="eq">≅</div><div class="r"><code>verifyChain()</code> · folds the live state</div></div>
  <div class="row"><div class="l">GitHub = a convenience, not the truth</div><div class="eq">≅</div><div class="r">the host = a disposable relay, not the truth</div></div>
  <div class="gm-add"><b>+ the one thing git lacks, we add:</b> invariant enforcement — no double-spend — via the owner-gate + a single compare-and-set op-class</div>
</div>

**Live now — concurrent editing no longer loses writes.** With no server refereeing saves, the browser
sidecar op-log is **append-only**: two windows or two people editing the same record each add a signed
op, none overwriting another (witnessed **10 windows at once → 10/10 edits survive**, chain intact), and
across machines a shared relay folds every device's log into **one identical signed history** (witnessed
**10 devices → all converge to the same signed tip, 0 lost**). *Open piece:* cross-device *document-action*
attribution (Complete/Void/Close re-signed under the merging device's key) awaits opt-in per-step signing
— field edits are covered, same-device workflows unaffected. See the [Done & Pending map](migrate_status_panel.html).

Full doctrine + the hard multi-writer cases (shared stock, credit limits, client version skew): [DistributedERP.md](DistributedERP.md) §0, §9.

---

<div class="blurb" markdown="0">
  <div class="hook">Zero round-trips on the read path. Up to ~50,000× faster cross-region.</div>
  <div class="teaser">An ERP normally crosses the network for every gesture. The kernel answers locally and relays later — so the real win isn’t faster storage, it’s no network on the hot path.
    <input type="checkbox" id="m-vitals" class="moretoggle">
    <span class="rest">On-box, durable Postgres beats us per-op (5.24 ms vs 208 ms for 1,000 ops) — and we say so. But an ERP is never on-box: every interaction crosses the network to the server of record, RTT-bound, and blocks when offline. Our kernel answers locally (~0.01 ms/op) and relays async, so per sale the legacy round-trip costs <b>256–674×</b> at 0.5 ms LAN and <b>~8,500–50,000×</b> cross-region, while ours stays flat. Bootstrap from a signed checkpoint is <b>~53×</b> faster than genesis replay (0.90 ms vs 47.70 ms); batched commit hits <b>~22,500 ops/s</b>; the fold stays linear to <b>20M ops</b>. On footprint: a 26.1 MB full-width seed (1.7× smaller than the 45.2 MB dump) and 28,184 JS LOC against 1,427,147 Java. The win isn’t faster storage — it’s <b>zero network on the hot path.</b> <a class="serious" href="#v-vitals">Serious read</a></span>
    <label for="m-vitals" class="morelnk"></label>
  </div>
</div>

<div class="blurb" markdown="0">
  <span id="dr-tco"></span>
  <div class="hook">Back up the recipe, not the result. 244× less DR storage.</div>
  <div class="teaser">Like a <a href="#fold-chess">chess scoresheet</a>, the op-log stores the <i>moves</i>, not the board — so meeting the same backup guarantee (restore any of the last 50 days, survive primary loss) costs a sliver of the space.
    <input type="checkbox" id="m-dr" class="moretoggle">
    <span class="rest">Hold the durability guarantee constant — restore to any of the last 50 days, RPO ≤ 24 h, survive primary loss — and ask only what it costs over a year of 50-branch ops. A standard weekly-full + daily-incremental rotation needs <b>192 GB</b>; the 50-day op-log needs <b>0.78 GB</b> — <b>244×</b> less (30× even against a storage-minimal 1-full-plus-50-diffs scheme), because a snapshot must keep re-storing the whole database while the op-log never stores a base image. Per device it stays tiny: a branch carries ~13 MB, only the single full-replica bucket holds the whole recipe (~0.8 GB for 50 days). And recovery is brutal-simple — lose the relay entirely, no backup, and 50 branches rebuild the consolidated books <i>to the cent</i> from their own slices, to an identical signed tip. Unit costs measured on the real kernel; legacy figures derived on constants chosen conservative for us. <a class="serious" href="#v-dr">Serious read</a></span>
    <label for="m-dr" class="morelnk"></label>
  </div>
</div>

<div class="blurb" markdown="0">
  <div class="hook">Matched against the iDempiere oracle on 43 surfaces — to the cent. 1% is the DNA, the rest is noise — not feature parity, by design.</div>
  <div class="teaser">Every fold is diffed against real iDempiere output (<code>maxDiff=0c</code>), each carrying a load-bearing falsifier; money is exact decimal, not float.
    <input type="checkbox" id="m-method" class="moretoggle">
    <span class="rest">The engine’s output is diffed against real iDempiere output, not asserted — <b>43 surfaces</b> oracle-equivalent: <b>16 cent/unit-exact folds</b> (<code>maxDiff=0c</code> — the whole order→ship→invoice→match→pay→allocate trade loop, inventory movement→on-hand→replenish, inter-org GL + FX, and reverse/void, in <b>both</b> USD and EUR schemas), <b>6 declarative engines</b> diffed against the live iDempiere Postgres / its compiled classes to diff=0 (the last one — the workflow state engine — fell 2026-06-12 to 11 real traces; <b>no declarative surface remains undiffed</b>), and <b>21 model-layer surfaces</b> — the <code>beforeSave</code> + DocAction-FSM walk of <i>every</i> document class (MOrder archetype → the deep family → the full isomorph tail; legal-action sets and transitions diffed against a runtime parse of the actual <code>DocumentEngine.java</code>, saves replayed against the stored seed rows). Each witness carries a load-bearing <b>§FALSIFIER</b> — corrupt the rule and the diff <i>must</i> go non-zero — so a pass can’t be a tautology. Money never touches float: amounts accumulate as integer cents, the only non-integer steps multiply in <code>BigInt</code> off the exact-decimal rate, rounded HALF_UP — bit-equal to Java <code>BigDecimal</code>. But this is plainly <b>not feature parity</b>: only ~1% of the M-class logic is ported. The win is delivery/definition — the AD is self-describing, the whole server/build stack is gone. <a class="serious" href="#v-method">Serious read</a></span>
    <label for="m-method" class="morelnk"></label>
  </div>
</div>

<span id="temp-tables"></span>
<div class="blurb" markdown="0">
  <div class="hook">Legacy writes data just to read it. The fold writes zero temp rows.</div>
  <div class="teaser">iDempiere ships ~15 <code>T_*</code> scratch tables — a report <code>INSERT</code>s rows into a temp table, then reads them back. A fold computes the cells in memory and discards them.
    <input type="checkbox" id="m-scratch" class="moretoggle">
    <span class="rest">iDempiere reporting creates data in order to read it: a process <code>INSERT</code>s aggregated rows into a per-run temp table, then the print format reads them back. There are ~15 such scratch tables — <code>T_Report</code> (57 refs), <code>T_InventoryValue</code> (53), <code>T_CashFlow</code> (22), <code>T_TrialBalance</code>, <code>T_Aging</code>… A fold deletes the whole tier: because state is a deterministic reduce over the journal, the report computes its cells in memory and paints them — <b>zero temp rows.</b> Proven, not asserted: <code>foldStatement</code> reproduces all three seed statements — Balance Sheet, Income Statement, Cash Flow — to the cent (<b>W-PA-REPORT</b>, <code>maxDiff=0c</code>) by replacing <code>T_Report</code> with an in-memory matrix; <code>foldPrint</code> reproduces the real Invoice print tree across all 8 seed invoices (<b>W-PRINTFORMAT</b>); and <b>NinjaExcel</b> delivers a third path — a user-authored .xlsx template (3-sheet: BACKUP / Input / Process) filled from the same fold engine, verify-by-example against the BACKUP column to the cent (<b>W-NINJA</b>, <code>maxDiff=0c</code>, 9 cells); a phrase-to-SQL compiler (<b>W-NINJA-RULE</b>) builds Process rows from natural-language phrases using only vocabulary extracted from the AD dictionary — no LLM — sample-falsified so a plausible-but-wrong phrase is caught. The remaining 13 <code>T_*</code> scratch folds are structurally the same — named here, each pending its own witness. <a class="serious" href="#v-scratch">Serious read</a></span>
    <label for="m-scratch" class="morelnk"></label>
  </div>
</div>

<div class="blurb" markdown="0">
  <div class="hook">A full migrated Odoo client behind one URL — 38 partners · 35 products · 27 orders, no install.</div>
  <div class="teaser">The resident demo tenant carries the whole Odoo catalog and opens from a single link with no server. Separately, the <i>live</i> extraction agent still pulls one order-to-cash chain — that gap is extractor wiring, not engine.
    <input type="checkbox" id="m-gap" class="moretoggle">
    <span class="rest">The bundled Odoo demo tenant is the <b>full catalog — 38 partners · 35 products · 27 sale orders</b> (<code>build/erp/12-odoo.db</code>), installed lazily when you pick it from a <b>five-tenant front door</b> — no dialog, no <code>?shard=</code>, no server (P0, erp sw v692). Separately, the <b>live JSON-RPC migrate agent</b> against a running Odoo 17 currently pulls <b>1 of 27</b> sale orders (one order-to-cash chain) and <b>no master data</b> — the rest (the other 26 orders, the 13 POs, real payments) is the <b>extraction</b> gap: the engine already folds these flows (each with a passing witness), the records just aren’t wired into the live extractor yet. The smaller <b>fold</b> gap is now narrow — analytic accounting (data-blocked: 0 analytic postings) and Odoo’s server actions (all 64 are Python <code>code</code> type — no declarative subset to interpret). The coverage-by-capability table, the block-for-block <code>completeIt</code> listing, the full LOC-to-parity estimate (~25× conservative, 76× for the shell built so far), and the open caveats are all below. <a class="serious" href="#v-gap">Serious read</a></span>
    <label for="m-gap" class="morelnk"></label>
  </div>
</div>

<div class="blurb" markdown="0">
  <div class="hook">Snap-and-sell POS, a warehouse-walk app, and a BIM→ERP project push. Same ledger, no new server — all LIVE.</div>
  <div class="teaser">Migration is the on-ramp, not the destination. The kernel has already folded forward into three op-log-native flows — all shipped and running on the same ledger.
    <input type="checkbox" id="m-roadmap" class="moretoggle">
    <span class="rest">Migration is the on-ramp, not the destination — and the downstream flows are <b>no longer roadmap: they run LIVE today</b> on the same ledger, no new server. (1) <b>uniCenta POS reborn</b> — ring → ONE signed group (order + shipment + invoice, all-or-none) → BOM backflush → replenishment <i>enacted to closure</i> (suggestion → PO → receipt → on-hand rises → suggestion clears); the live ring folds to the cent (<code>§POS-CENT maxDiff=0c</code>) and void/reverse nets postings to 0c with on-hand restored — and the till now runs the whole shop: snap + scan + key the price and a new product registers as ONE signed group then sells immediately (<code>§POS-IMPORT</code>); hold/recall parks a real DR order in the same ledger the Sales-Order window reads (no private store); and a "with-pick" shipment doctype gates completion behind the warehouse confirm — on-hand moves at the pick, not the promise (W-WH-CONFIRM, W-POS-DELIVERLATER) — <a href="../POS_ADDON_SPEC/">POS Addon Spec</a> · <a href="../ERPUserGuide/">User Guide</a>. (2) A phone-first <b>warehouse pick walk</b> — the warehouse compiled as a BIM-like model, fly-to the bin, QR scan as the one clean act, every pick a signed op; on-hand and the ERP window agree to the unit (W-WH-LIVE) — <a href="../SPATIAL_PICKING_SPEC/">Spatial Picking Spec</a>. (3) <b>BIM → Project Order</b> — a priced building selection folds into a real iDempiere <code>C_Project</code> tree (phases · tasks · priced lines): on the Duplex, 6 phases · 9 tasks · 16 issued lines whose <code>PlannedAmt</code> folds to the 5D golden <b>to the cent</b> (<code>§PROJ_FOLD plannedAmt==golden</code>, BigDecimal), phase <code>SeqNo</code> tracing to <code>sequence_rules.json</code>, the <code>› ERP</code> button wired live (W-PROJ-FOLD/PUSH/SEQ, PR #316) — <a href="BIMtoProject.md">BIM → Project blueprint</a>. The first two are the two ERP objectives in the bim-ootb README; all three are the same fold, delivered precisely because the kernel is identical whether migrating an existing ERP or running a new app on it. <a class="serious" href="#v-roadmap">Serious read</a></span>
    <label for="m-roadmap" class="morelnk"></label>
  </div>
</div>

<details class="fold" markdown="1"><summary>You Are Not Seriously Gonna Read This</summary>
<div class="fbd" markdown="1">

The long read — the same topics as the blurbs above, in full: the tables, the witnesses, the honest caveats. Each **Serious read →** lands here.

### Disaster recovery &amp; TCO — serious read {#v-dr}

**The 244× storage math.**

The fair comparison holds the **durability guarantee constant** — *restore to any of the last 50 days · RPO ≤ 24 h · survive primary loss* — and asks only: **what does it cost to meet it**, amortised over a year of 50-branch ops? Unit costs are **measured** on the real kernel (314 B/op uncompacted snapshot; fold, restore-to-arbitrary-op, and per-branch additivity all witnessed); the year-level figures are **derived** over modelled constants for the traditional side (no Postgres on the bench), each chosen **conservative for us** — `230 B/row` and `5 rows/op` are *low* versus Postgres+index and real iDempiere, so the real gap is wider, not narrower (constants named in GAPS #7 below). [^tco]

**Durable storage to meet the 50-day SLA** (Retail, 1k sales/branch/day, one durable copy each):

<div class="dtbl hl23" markdown="1">

| Backup strategy | Traditional | Ours (50-day op-log) | ratio |
|---|---|---|---|
| weekly full + daily incremental (standard DBA) | 192 GB | 0.78 GB | **244×** |
| minimal: 1 full + 50 diffs (storage-min, replay-heavy restore) | 24 GB | 0.78 GB | 30× |

</div>

Incremental backup barely shrinks the gap — the **weekly fulls dominate.** Only the storage-minimal scheme reaches ~30×, and *its* restore is replay-heavy. The structural reason: a snapshot scheme must periodically re-store the **whole database**; the op-log **never stores a base image** (the deltas *are* the system). And the advantage **grows with business age** — their fulls grow yearly while the op-log's 50-day window stays constant (`§VOL`).

**Who carries the whole log?** Per-device storage — does every device carry it? **No.**

<div class="dtbl" markdown="1">

| Role | Stores | Resident | Bounded by |
|---|---|---|---|
| **Edge / branch** | engine shard + own open-period ops + last checkpoint | **~13 MB** | period-close + gravity shard ([DistributedERP §13](DistributedERP.md)) |
| **Facilitator / relay** | open-period union (ordering only) | ~16 MB/day, disposable | reconstructible from the edges |
| **Full-replica (bucket)** | the whole compacted recipe | ~0.8 GB (50-day) – ~5.7 GB/yr | **one per business, not per device** |

</div>

**Recovery &amp; the honest trades** — all witnessed [^blackout][^tco]:

- **Total relay loss, no backup** rebuilds consolidated state from the branches' *own* slices — `§BLACKOUT-RESUME`: 50 branches, a fresh empty relay, an **identical signed tip**, books to the cent, idempotent re-push. The only loss is a bounded, ledger-reconciled CAS-arbitration sliver (the one shared op-class, §5); `§ORDER-HONEST` shows disjoint folds commute but cross-branch CAS order is *not* reconstructible from signed logs alone (honest correction to "total order is reconstructible").
- **Consolidated restore is additive** — per-branch folds combine (`maxDiff=0c`), so 12.5M ops at 5k/branch/day restore in **~0.5 s 50-way-parallel**; only the contended op-class needs merge logic.
- **0 branch downtime trades against a double-sale risk** — but only for stock that is *not* physically partitioned (≤0.1% of ops; located stock can't double-sell — the scan is possession), and it is value-tier-bounded (high-value blocked → 0, low-value → a receivable). Traditional avoids it only by **requiring connectivity** (then the branch stops when the link drops — the very downtime we removed) or by **allowing offline POS** (carrying the same risk).
- **"0 always-on server-hours" is 0 always-on compute-VM, not 0 cost** — object storage, the CAS touch, and the intermittent relay remain, itemised: storage-priced + pay-per-invocation, no OS / patch / licence. An illustrative annual bill (public list prices, volatile; **excluding** DB licence + DBA labour, which widen it) runs **>10× cheaper**, compute-dominated.

> **What breaks first as this scales?** A quantitative limits analysis — max in-memory DB before OOM, genesis vs checkpoint re-fold time, writer-conflict probability at 50+ devices, OPFS vs IndexedDB, and the mobile ceilings — is worked end-to-end in **Fold-Engine Constraints Analysis**. Short version: single-writer-per-shard is the only *hard* limit; the mobile genesis re-fold (~25 s @ 100M ops) and the ~200 MB mobile memory ceiling bite first, and both are already ~90% handled by the checkpoint design above.


### Vitals — speed, footprint, ownership — serious read {#v-vitals}


Three tables, not one wall. Columns are **architecture**, not a feature scorecard; numbers measured on *this* box / browser unless marked. **"n/a — architectural"** = the legacy stack has no comparable number because the property is structural (it always needs a server).

### A · Speed & latency {#speed}

<div class="dtbl hl-last" markdown="1">

| Vital | iDempiere | Odoo | SAP | Our WASM event-source |
|---|---|---|---|---|
| **Period-end carry-forward** | server batch job + down-window (per-row `saveEx` ≈ ~1M round-trips on a 40-yr depreciation run) [^dep] | server batch job [^arch] | server batch job [^arch] | **signed checkpoint = balance b/f** (the compaction step — accrual/FX/depreciation postings are themselves folds), no down-window; 40k-op close-fold ≈ **2.68 s**, archived 40000→live 1, reconcile **maxDiff=0c** [^pclose][^drive] |
| **Server round-trip** (read/fold) | round-trip per interaction [^arch] | round-trip per interaction [^arch] | round-trip per interaction [^arch] | **0 — the kernel answers locally** [^noround] |
| **Bootstrap** (open the books) | re-query the server [^arch] | re-query the server [^arch] | re-query the server [^arch] | **~53× faster from checkpoint** — 0.90 ms vs 47.70 ms genesis replay, same result [^drive] |
| **Commit throughput** (5000 ops) | n/a — architectural [^arch] | n/a [^arch] | n/a [^arch] | batch `commitGroup` **~22,492 ops/s = 2.4× naive** [^sync] |
| **Fold/append ceiling** | n/a — architectural [^arch] | n/a [^arch] | n/a [^arch] | **linear to 20,000,000 ops** (~437 B/op; fold ~40M ops/s hot) [^ceiling] |
| **Storage primitive** (1000 ops, 1 commit) | Postgres WAL+fsync **5.24 ms** (0.0052 ms/op) [^bench] | (same engine) [^arch] | n/a [^arch] | sql.js +sha256 chain **208.45 ms** — slower per-op, buys **no server**; Postgres crash-durability DEFERRED to the install — but multi-writer **concurrency is now handled** browser-side (append-only log + relay convergence, no lost writes) [^bench] |

</div>

> **Where we actually beat them: the network.** The storage-primitive row above is *on-box*, where durable Postgres wins per-op — and we say so. But an ERP is never on-box: every interaction crosses a network to the server of record, which pays a round-trip **per interaction** (RTT-bound — and it **blocks when offline**). Our kernel answers locally (~0.01 ms/op) and relays asynchronously — **0 round-trips on the read/fold path.** That is the whole win: not faster storage, **no network on the hot path.** A remote-POS drive puts numbers on it — locals measured, network leg modelled, legacy excludes iDempiere ORM/OSGi so it's a *floor* [^rpos]: per sale, legacy is RTT-bound — **~256–674× at 0.5 ms LAN, ~8,500–50,000× at 50 ms cross-region** — while ours stays flat at local speed. The iDempiere 40-year depreciation run shows where that cost really sits: per-row `saveEx` ≈ **~1M round-trips** [^dep].

### B · Footprint & bloat

<div class="dtbl hl-last" markdown="1">

| Vital | iDempiere | Odoo | SAP | Our WASM event-source |
|---|---|---|---|---|
| **DB seed** | `Adempiere_pg.dmp` **45.2 MB** [^bloat] | n/a — diff schema [^arch] | n/a [^arch] | `erp/ad_seed.db` **26.1 MB** (≈**1.7× smaller**, full-width — the earlier 12.7 MB column-slice was 3.5× but left windows unreachable; completeness won); the 26.1 MB IS the self-describing AD [^bloat] |
| **Runtime LOC** | **1,427,147 Java LOC** / 4,465 files + JVM + Postgres + 3.7 GB build [^bloat] | n/a — diff codebase [^arch] | n/a [^arch] | **28,184 JS LOC** / 132 files, static + SQLite-WASM, offline (≈**51× fewer** built-so-far; **~21× at conservative full parity**, zero server/JVM/DB) [^bloat] |
| **Live DB → SQLite** | Postgres **143 MB** on-disk (GardenWorld) [^bloat2] | n/a [^arch] | n/a [^arch] | **43 MB SQLite** (925 tables, 187,133 rows ≈ **3.3×**); gzip 11.7 MB (3.7×) [^bloat2] |

</div>

### C · Migration & ownership

<div class="dtbl hl-last" markdown="1">

| Vital | iDempiere | Odoo | SAP | Our WASM event-source |
|---|---|---|---|---|
| **Migration fold** (does the legacy flow fold into our verbs?) | **native** — it renders this AD; handlers diffed cell-by-cell vs an iDempiere oracle (`diff_oracle.log`; one GL cell needs live docker) | **PROVEN vs LIVE Odoo 17** — SO S00023, 5/5 hops, newVerbs=[], GL ΣDr==ΣCr 5002.50 [^odoo] | **B1 PROVEN vs a MOCK export** (5/5, journal 770.00); **S/4HANA NOT-RUN — gated on a real oracle** [^b1][^sap] | every hop maps to `CREATE_DOCUMENT / CREATE_LINE / SET_STATUS / POST / ALLOCATE` [^odoo][^b1] |
| **Data ownership / durability** | server DB owns the record [^arch] | server DB owns the record [^arch] | server DB owns the record [^arch] | **user-owned signed op-log**; host disposable (Git analogy); tamper caught by `verifyChain()`, forgery by ECDSA-P256 sig [^own][^pclose] |

</div>



### Method &amp; honesty — serious read {#v-method}

<span id="method"></span>

**What is measured (real, on this box / browser):**
- Period-close fold, balance-b/f, reconcile-to-0c, tamper/forgery rejection, determinism — on the
  **real kernel** ([`scripts/test_kernel_period_close.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/test_kernel_period_close.js)) and against **real double-entry POST ops**
  ([`scripts/test_integ_postings_reconcile.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/test_integ_postings_reconcile.js)).
- Browser-measured 40k-op close-fold timing, bootstrap 53× speedup, reconcile maxDiff=0
  (`build/erp/period_close_drive.log`, an in-browser drive).
- Storage primitive sql.js-vs-Postgres (`build/erp/bench_oplog_pg.log`), batch throughput
  (`build/erp/sync_poc_smoke.log`), volume ceiling to 20M ops (`build/erp/poc_volume_ceiling.log`).
- **Persistence-path caveat (honest):** the storage-primitive figure above is the *batched* engine
  (1000 ops, one commit, in-memory). The *live per-Save* path is separate: it once re-exported the whole
  sidecar DB to IndexedDB on every save (O(total size) per Save — an un-benchmarked tax that grew with
  history), and is now an **O(1) append** of one signed op record as of the append-only fix (erp sw v766,
  W-OPLOG-APPEND). So the shipped product now tracks the batched curve rather than diverging from it as
  the log grows.
- Bloat figures `du`/`wc`/sqlite-measured 2026-06-06 (`internal/BLOAT_MEASUREMENT.md`, summarised in
  the bloat memory).
- The Odoo fold is against a **running Odoo 17** instance (`build/erp/odoo_fold_live.log`,
  `§ODOO-FOLD-LIVE PASS`).
- **Engine output == real iDempiere output — 43 surfaces oracle-diffed, not asserted** (16 cent-exact · 6 declarative · 21 model-layer), **+ 3 rule-consistent**, each carrying a load-bearing **§FALSIFIER** so a passing diff can't be a tautology. Full surface-by-surface enumeration, witnesses, and the live-Postgres diffs → `ERP_COVERAGE_MATRIX.md` §Equivalence + `FoldEngineQuality.md`. How a `save`/`completeIt`/`Doc_*` posting maps from your iDempiere code → `ERP Rosetta Stone`.
**`maxDiff=0c` is *exact*, not "close enough" — the money-math holy war, settled.** Money never touches float: amounts accumulate as **integer cents**, and the only non-integer steps (FX, proportional tax) multiply in **`BigInt` off the exact-decimal rate**, rounded `HALF_UP` — unit-proven **bit-equal to Java `BigDecimal`** ([`build/erp/bigdecimal.js`](https://github.com/red1oon/BIMCompiler/blob/feat/erp-substrate-phase012/build/erp/bigdecimal.js), `poc_money_fold.js`). The lesson: **the discipline ports, the language doesn't matter** — exact decimal money is a ~140-line library, not a reason to keep the server. (The mechanism — why `set`+`save` becomes an op and how the fold stays exact — is the [Fold Engine Black Book](FoldEngineBlackBook.html).) **What this costs to *change* — and why the op-log is a fixed substrate, not a per-rule tax** (the elementary "lock a field read-only" change matrix, the imperative-vs-declarative gradient, and the cost equation) → [`Cross-ERP Rosetta Stone §7–§8`](ERPConceptRosetta.html#cost-of-change).

**What is architectural (a property, not a number):**
- "0 round-trip" — *structural* (no server of record on the read/fold path), not a benchmark. Honest counter: server-removal only wins over a network; on-box, durable Postgres is *faster* per-op (it buys durability + concurrency we defer).
- Most ERP cells are *n/a — architectural*: the legacy stack exposes no comparable single number (throughput ceiling, batch-vs-naive) — server-bound by design.

**NOT feature parity — plainly.** iDempiere, Odoo and SAP have *vastly* more features, localisations and integrations. The ~28K LOC renders the dictionary and folds the paths built so far (the order→ship→invoice→match→pay→allocate trade loop, inventory movement→on-hand→replenish, GL posting incl. inter-org + FX + `reverseCorrect`/void, signed rule-edit, period-close, **and the `beforeSave`+DocAction-FSM model layer of every document class** — **43 surfaces now oracle-equivalent to real iDempiere**) — it does **not** re-implement the full transactional server. **Only ~1% of the M-class business logic is ported** (the `M*.java` model logic = 104,940 code-LOC; ~205 LOC of transactional verbs folded + ≈830 LOC of cited `beforeSave` regions ported as hooks across 16 document classes) — the engine is the *host*, the M-class logic is the work still ahead. The win is **delivery/definition**: the AD-interpreter is lean because the AD is self-describing, and the whole server/build stack is gone. That self-description is load-bearing for breadth, not just one curated surface: CRUD generality (#348) derives each table's editability — column type, read-only, defaults — **from its own Application Dictionary rows**, so any table is editable per its own dictionary rather than hand-curated screen by screen. Each transactional verb still has to be folded deterministically. See `feedback_erp_perf_claims`.



### Report scratch tables — serious read {#v-scratch}


Legacy ERP reporting **creates data in order to read it.** A financial report does not query the journal directly — a
process first `INSERT`s aggregated rows into a per-run *temp table*, then the print format reads that table back.
iDempiere ships a whole family of these scratch tables — **~15** across the codebase: `T_Report` (financial statements,
57 refs), `T_InventoryValue` (53), `T_CashFlow` (22), `T_TrialBalance` (12), `T_ReportStatement` (12), `T_InvoiceGL`
(11), **`T_Aging`** (10 — AR/AP aging), `T_Reconciliation` (9), `T_BankRegister` (8)… *(counts: `grep -roE "T_[A-Z]\w+"
org.compiere --include=*.java` over the iDempiere source.)*

A **fold deletes this tier.** Because state is a deterministic reduce over the journal, the report computes its cells
**in memory** and paints them — **zero temp rows written.** So the answer to *"does a report engine create more data
when it is only fetching?"* is: legacy does (scratch rows); the fold does **not** — a fetch is a projection of existing
truth, materialised only in memory and discarded.

**Proven — not asserted (the discipline of this paper):** `foldStatement` reproduces iDempiere's `FinReport` for
**all three seed statements** to the cent — **Balance Sheet, Income Statement and Statement of Cash Flows**,
`maxDiff = 0c` (108 + 148 + 140 segment cells), witness **`W-PA-REPORT`**
(`scripts/poc_pa_report.js` → `build/erp/poc_pa_report.log`), diffed against an independent live `idempiere_test`
re-derivation — by replacing `T_Report` with an in-memory `cells` matrix. **No `T_Report`, no temp rows**, identical
totals. And the *document* half: `foldPrint` reproduces the `PrintData` master-detail row tree + break subtotals for
the real **Invoice Header → Invoice LineTax** format across **all 8 seed invoices**, `maxDiff = 0c` against live base
tables **and the stored `c_invoice.grandtotal` that real iDempiere wrote** — witness **`W-PRINTFORMAT`**
(`scripts/poc_printformat.js` → `build/erp/poc_printformat.log`), three load-bearing falsifiers.

**A third delivery mode is now proven — NinjaExcel.** Where `foldStatement` paints cells in the browser and `foldPrint` drives a formatted document, **NinjaExcel** fills a user-authored .xlsx template: a 3-sheet workbook (BACKUP = stored oracle columns; Input = date-range bindings; Process = SQL row descriptors with `@token@` placeholders). The NinjaExcel engine reads the manifest, validates completeness (`gate()` refuses dangling binds, empty TABLE fields, uncovered `@token@` holes — 3/3 falsifiers each produce a named error; run on a gated manifest throws), fills cells via an independent SQL path, then verifies `maxDiff=0c` against the BACKUP column — **W-NINJA**, 9 cells, 4 `grandtotal` amounts + count. A deliberate wrong binding (swapped `documentno`) is falsified (`maxDiff=5035c`), proving the equality oracle is load-bearing. A phrase-to-SQL compiler (**W-NINJA-RULE**) extends this further: a human phrase such as "SUM GrandTotal of Invoices, completed, is Sales Transaction, from 2002-01-01 to 2003-12-31" resolves to SQL candidate(s) using only vocabulary extracted from `ad_table` / `ad_column` / `ad_ref_list` — zero LLM, zero hardcoded strings. The sample falsifies wrong candidates (wrong status → 0 accepted); unknown entities are explicitly refused. The browser pill (W-NINJA-RULE-UI) runs the same compile→falsify→human-pick loop live: `maxDiff=0c` after the human picks the date column from a tie. The discipline is the same as `foldStatement` and `foldPrint`: a phrase that cannot be falsified is not a rule; the oracle kills it before it runs.

**Generalises to (candidate — each pending its OWN witness, claimed only as it lands):** the same materialize-then-read
pattern underlies every other member of the family, so Aging (`T_Aging`), Inventory Value, Cash Flow, Trial Balance and
the rest are *structurally* the same fold — a pure aggregation that needs no scratch table. They are **not yet built or
diffed**; this paper claims the deletion **only for the three financial statements, the document print, and the NinjaExcel template delivery above.** Aging in particular folds over
*open items* + a due-date-bucketing function (not the GL), so it is a distinct verb on distinct seed data — named here,
not claimed. This narrows **GAP #8 to its tail**: reporting parity is now *witnessed* for all 3 financial statements,
the master-detail document print (`foldPrint`, W-PRINTFORMAT), and template xlsx delivery (NinjaExcel, W-NINJA); what stays open is the remaining `T_*` family
(Aging, Inventory Value, …), the unexercised `PrintDataGroup` functions (group-by/count/avg — implemented, no seed
format uses them) and pixel layout (a stated non-goal — DOM is the render).



### Gap Analysis — serious read {#v-gap}

> Functional gaps are tracked below; the **operational** limits (what the browser substrate itself can take before it breaks — memory, fold time, device-scale conflict) are quantified separately in the **Fold-Engine Constraints Analysis**.

<span id="gap-analysis"></span>

#### In plain words — start here {#gap-plain}

**The objective.** Not "re-clone all of iDempiere." It is: *the engine works, and each customer's actually-used screens
run identically to the original — to the cent.* "Finished" is measured **per deployment** (a tenant's live surface),
not against all 496 of iDempiere's programs. By that measure the hard part is done; the rest is routine and on-demand.

iDempiere is a library of ~496 pre-written programs, one per business document. We did not rewrite them. We built one
small **engine** that treats every document as *data + one shared recipe*, and records every action in a **signed
journal** — only ever added to, never erased (the way accountants have worked since 1494). The current state of the
books is *computed* from that journal on demand; change anything and the journal grows, nothing is overwritten — so it
is auditable, reversible, serverless, and runs in a browser.

**Is it finished?** Depends what "finished" means. The **engine is proven**: for every flow we have folded, its output
is *identical to real iDempiere, to the cent.* We have folded the flows a real business uses — order→ship→invoice→pay,
inventory, GL. The other programs are **not lost**: they are either plumbing we no longer need, rules that have become
data, or flows we fold **when a customer needs them** — each proven the same way.

**One word, two jobs — the thing outsiders trip on.** "Fold" means two different things. *Fold-to-run* = compute the
current books from the journal in the browser; automatic, instant, done. *Fold-to-build* = translate one iDempiere
program's rule into the engine and prove it matches, to the cent; that is human work, and it is what "not yet done"
refers to. So fetching the whole database gives you the **data, not the logic** — a document type whose recipe has not
been written yet will not process, even with all its data present. Nothing is lost; the recipe simply has to be written
and proven. That is development, not a browser refresh. What follows is the technical version of exactly that.

Against a live Odoo 17 instance, the migrate currently pulls **one of 27 sale orders** (a single order-to-cash chain,
S00023) and **no master data.** Everything else constitutes the gap, which divides into two categories:

- **Extraction gap** *(the majority).* Data the migrate could pull but does not yet. The engine already folds these
  flows — order-to-cash, procure-to-pay with three-way match, GL journals, reversal and void — each backed by a passing
  witness; the records are simply not yet wired into the extractor. This is extraction work, not engine development.
- **Fold gap** *(the smaller remainder).* Capabilities the engine cannot yet compute even when the data is present:
  cost-valued inventory posting, financial-report and print-format mapping, aging, analytic accounting, and
  server-action interpretation.

The sections below proceed from overview to detail: **(1)** coverage by capability, **(2)** a proven fold in code,
**(3)** an unbuilt fold, **(4)** the code-size estimate for full parity, and **(5)** the open caveats that lack a
measured benchmark.

**Data shape** — how the live `odoodemo` models thread through a few document types, collapse onto the five core
relations, and fold:

```text
ODOO  odoodemo · live (real counts)   →  5 core relations  →  fold (proven)      captured today
───────────────────────────────────     ────────────────     ───────────────    ──────────────
MASTER  partner ×38 · product ×30/35     containers · items   (master —          ░ 0 pulled
        cat ×9 · uom ×28 · account ×47                         no fold needed)     ◄ the P0 gap
        journal ×8 · tax ×2 · terms ×11

DOCS    sale.order ×27 (lines ×56)       documents +          completeIt  →      ▓ 1 of 27
        purchase.order ×13               document_lines       W-FOLD-COMPLETE     (S00023 chain)
        stock.picking ×31                (O2C / P2P spine)    fact_acct  0c ✓     ░ 26 + all 13 PO
        account.move ×34

JRNL    account.move.line ×99            journal              posting  →         ▓ ~4 of 99
        payment ×3 · reconcile 1+3                            GL  ΣDr==ΣCr ✓      ░ the rest

  ▓ pulled & folded (engine proven)     ░ EXTRACTION gap — pull the data; the fold already exists
```

*Read left to right: the source's many models thread through a few document types, which collapse onto five relations;
the fold is already witnessed. The gap (mostly ░) is therefore remaining data to extract, not engine capability to build.*

<details class="fold" markdown="1"><summary>1 · Coverage by capability — source ERP vs. our fold</summary>
<div class="fbd" markdown="1">

*Axis = **capability**, not table-by-table (the three schemas don't align). The **Odoo column is real `search_count`**
from the live `odoodemo` (Odoo 17) instance our agent folds (`build/erp/odoo_survey.json`); iDempiere = the seeded
GardenWorld client; OOTB = our ~28K-LOC engine. **EXTRACTION** = data the migrate could pull but doesn't yet ·
**FOLD** = a capability the engine can't compute even if pulled.*

| Capability | iDempiere (GardenWorld) | Odoo (`odoodemo`, live) | OOTB — ours (✓ = proven[^folds]) | Migrate GAP |
|---|---|---|---|---|
| Partners / customers | `C_BPartner` | **38** (4 cust) | master (fold n/a) | 38 not pulled · **EXTRACTION** |
| Products + cat + UoM | `M_Product` | **30/35** · 9 cat · 28 uom | inline refs only | not pulled as master · **EXTRACTION** |
| Chart of accounts | `C_ElementValue` (tree) | **47** accounts | `foldStatement` expands COA tree | 47 not pulled (takes inline resolved strings) · **EXTRACTION** |
| Journals / taxes / terms | `GL_Journal`/`C_Tax` | 8 / 2 / 11 | tax rides inline | not pulled as master · **EXTRACTION** |
| Sales O2C (order→ship→invoice) | `C_Order` chain | **27** SO (22 conf) | ✓ — W-FOLD-COMPLETE `maxDiff=0c` | **1 of 27 pulled** · EXTRACTION (loop the proven fold) |
| Purchase P2P (PO→receipt→bill→match) | `C_Order` PO + `M_MatchInv` | **13** PO / **6** bills | ✓ — W-FOLD-AP-INVOICE/MATCHINV; adapter `buildBuyEvents` written | **0 pulled — adapter unused** · EXTRACTION |
| Inventory moves + on-hand | `M_InOut`/`M_Movement` | 31 pick · 59 move · **43** quant · 13 valuation | movement fold PROVEN; cost-valued GL deferred | quants/moves not pulled · EXTRACTION **+** cost-GL FOLD |
| Customer invoices (AR) | `C_Invoice` SO | **7** posted | ✓ `maxDiff=0c` | **1 of 7 pulled** · EXTRACTION |
| Vendor bills (AP) | `C_Invoice` PO | **6** (5 posted) | ✓ — W-FOLD-AP-INVOICE | **0 pulled** · EXTRACTION |
| Credit notes / reverse-void | `reverseCorrect`/void | **7** refunds | ✓ — W-FOLD-REVERSE | docs not pulled · EXTRACTION |
| Payments + reconciliation | `C_Payment`/`C_AllocationHdr` | **3** pay · 1+3 reconcile | ✓ — W-FOLD-PAYMENT/ALLOC | **synthesised, not real** — 3 real pay/reconcile not pulled · EXTRACTION |
| Manual GL journals | `GL_Journal` | **13** entries | ✓ — W-FOLD-GLJOURNAL (inter-org) | **0 pulled** · EXTRACTION |
| Financial statements BS/P&L/CF | `PA_Report`→`T_Report` (15-table `T_*` tier) | **3** account.report (BS/P&L code-side v17) | ✓ BS+IS+CF `maxDiff=0c` — W-PA-REPORT (iDempiere-side) | Odoo report defs unmapped · **FOLD** |
| AR/AP Aging | `Aging`→`T_Aging` | on-the-fly wizard (no stored rows) | not built | distinct fold (open-items+date buckets) · **FOLD** |
| Document print / layout | `AD_PrintFormat` (`'P'` grids-in-grids) | **41** QWeb defs | `foldReceipt` (W-PROC); ✓ `foldPrint` `maxDiff=0c` — W-PRINTFORMAT (8/8 invoices, iDempiere-side) | Odoo QWeb defs unmapped · **FOLD** |
| Workflow / automation | `AD_Workflow` | 64 server actions · 18 cron | ✓ `ad_workflow.js` walk + replay — W-WF-HARDEN (11 real traces diff=0, iDempiere-side) | no Odoo server-action interpreter · **FOLD** |
| Analytic / cost centres | acct dims / `C_Project` | **19** analytic accts | not built | no analytic fold · **FOLD** |

**Prioritised extraction backlog (to pull the full Odoo dataset)** — tracked in `prompts/MIGRATE_INSTALL_TENANT.md §RESUME`
and the machine-readable `build/erp/odoo_survey.json`:
1. **Master-data pass (P0)** — partners 38 · products 30/35 + cat 9 + UoM 28 · COA 47 · journals 8 · taxes 2 · terms 11 · companies 2. Pure `search_read` dumps; every document dangles without it.
2. **Loop all 22 confirmed SOs** (today 1/27) — fold path already proven.
3. **Wire the existing buy-side adapter** → 6 POs + 6 vendor bills + 3-way match (code written, unused).
4. **Pull real payments + reconciles** (3 + 1/3) instead of the synthetic ALLOCATE.
5. **Manual journals (13) + credit notes (7)** → the already-proven GL-journal / reverse-void folds.
6. **Inventory state** — on-hand quants 43 + valuation 13 as opening balances (cost-valued GL is itself a fold gap).
7. **Fold gaps (defer)** — financial-report defs (3) + QWeb print (41) + aging + server actions (64): mapping/interpreter work, not extraction.

Every migrated row must trace to a real Odoo record (NON-INVENT) — the survey counts above are both the **extraction
targets** and the **§-witness oracles** (`records pulled == live search_count`). Capability-coverage detail (per AD
surface, with witnesses) → ERP Coverage Matrix; the `T_*` reporting-tier subset → [§ temp-tables](#temp-tables).

</div>
</details>

<span id="gap-in-code"></span>
*The next two folds show the contrast in code — a fold we have completed (`completeIt`, shipped, with its full listing)
and one we have not (`T_Aging`, proposed). The line-count reduction comes from dropping the getX/setX/saveEx, SQL, and
try-catch boilerplate — only the business decisions remain.*

<details class="fold" markdown="1"><summary>2 · A proven fold in code — <code>MOrder.completeIt()</code></summary>
<div class="fbd" markdown="1">
<div class="sxs" markdown="1">
<div markdown="1">
##### iDempiere · `MOrder.completeIt()` — Java, ~250 LOC
```java
if (!m_justPrepared) prepareIt();                  // re-check → InProgress unless ready
if (fireDocValidate(BEFORE_COMPLETE) != null)      // model validators (first error aborts)
    return STATUS_Invalid;
if (!isApproved()) approveIt();                    // implicit approval
createCounterDoc();                                // intercompany
shipment = createShipment(dt, getDateOrdered());   // auto-generate the delivery
invoice  = createInvoice(dt, shipment, …);         // auto-generate the invoice
if (fireDocValidate(AFTER_COMPLETE) != null) return STATUS_Invalid;
setProcessed(true); setDocAction(Close);
return STATUS_Completed;        // Doc_Order posts fact_acct later, at post time
```
</div>
<div markdown="1">
##### OOTB · `completeIt` fold — JS, ~50 LOC
```js
if (CrudOverlay.docActionOutcome(entry,order).to!=='CO') return {status};
if (!AdModelVal.fireHooks('BEFORE_COMPLETE',{…}).ok) return {blocked};   // same validators
const childOps = [ ...buildDoc('M_InOut',…),                            // ship + invoice =
                   ...buildDoc('C_Invoice',…) ];                       //   the SAME verb, recursed
const post  = postRecipe('C_Order',order,lines)…;                      // DR/CR derived, ΣDR==ΣCR
const group = [DOC_ACTION_CO, {op:'POST',post}, ...childOps];
return KernelOps.commitGroup(db, group);   // ONE signed, hash-chained op-group · all-or-none
```
</div>
</div>

`createShipment`/`createInvoice` become **`buildDoc(…)` recursion** (the MOrder archetype one level down), and the books
are a **FOLD of the emitted ops**, not in-place `saveEx()`.

**Full block-for-block listing** — the shipped `completeIt` annotated against
`org.compiere.model.MOrder.completeIt()`, the primitives it stands on, and the *what-it-demonstrates* read
(~50 JS vs ~250 Java; `createShipment`/`createInvoice` = `buildDoc` recursion; both folds in one function) —
now lives in its natural home: **ERP Rosetta Stone §3 — Worked example**.
Witness **W-FOLD-COMPLETE** `maxDiff=0c`.[^folds] Code-quality scorecard: `FoldEngineQuality.md`.
</div>
</details>
<details class="fold" markdown="1"><summary>3 · An unbuilt fold — the <code>T_Aging</code> aging report</summary>
<div class="fbd" markdown="1">
<div class="sxs" markdown="1">
<div markdown="1">
##### iDempiere · `Aging.doIt()` → fills the `T_Aging` scratch table
```java
sql = "SELECT … oi.DueDate, oi.DaysDue, GrandTotal, OpenAmt FROM <open invoices>";
rs  = DB.prepareStatement(sql).executeQuery();     // one pass over open items
while (rs.next()) {
  if (bpKeyChanged) {
    aging.saveEx();                                 // ← INSERT a T_Aging ROW (scratch)
    aging = new MAging(…, DueDate, IsSOTrx);
  }
  aging.add(DueDate, DaysDue, GrandTotal, OpenAmt); // bucket the open amount
}
aging.saveEx();                                     // final T_Aging row written
// MAging.add(): daysDue<=0→Due0 · >=-7→Due0_7 · [-31,-60]→Due31_60 · <=-91→Due91_Plus …
```
</div>
<div markdown="1">
##### OOTB · `foldAging` — PROPOSED, ~12 LOC (not built)
```js
// PROPOSED · NOT BUILT — the T_Aging FOLD gap. Folds OPEN ITEMS, not the GL. 0 temp rows.
function foldAging(openItems, asOf) {
  const out = {};                                   // bpId → {Due0,Due0_7,Due31_60,…} cents
  for (const it of openItems) {                     // host-injected open C_Invoice rows
    const daysDue = days(asOf, it.dueDate);          // SAME DaysDue as Aging.java
    const b = out[it.bpId] ??= zeroBuckets();
    if (daysDue <= 0)                 add(b,'Due0',     it.openAmt);  // SAME boundaries
    if (daysDue >= -7)                add(b,'Due0_7',   it.openAmt);  //   as MAging.add()
    if (daysDue<=-31 && daysDue>=-60) add(b,'Due31_60', it.openAmt);
  }
  return out;                                        // in-memory — no T_Aging; the temp tier is gone
}
```
</div>
</div>

**Status.** `foldAging` is a *candidate* fold — it mirrors `MAging.add()`'s exact bucket boundaries, but it is **not a
shipped witness.** It needs the open-item extraction (Odoo stores no aging; it computes it in an on-the-fly wizard,
while iDempiere derives it from `C_Invoice` open amounts). Tracked: matrix **GAP item 13** · [§ temp-tables](#temp-tables).

</div>
</details>

<details class="fold" markdown="1"><summary>4 · Code size for full parity (LOC estimate)</summary>
<div class="fbd" markdown="1">
<span id="realistic-conversion-estimate-loc"></span>

51× is honest for the engine **shell** folded today (28,184 JS LOC, re-measured 2026-06-12 — down from 76× as real coverage grew, exactly as a non-overclaim should move) — but it measures the *thinnest, highest-compression* slice (order-to-cash + posting), where iDempiere is mostly generated boilerplate and ZK UI that collapse to ~0. It does **not** extrapolate to a full port: only **~1% of the `M*` business logic (104,940 code-LOC) is actually ported**. **We headline the *conservative* ~21× to avoid overclaiming.**

> **Exhaustive coverage map → ERP Coverage Matrix.** Two axes, both measured from real `ad_full.db` queries (not asserted): the **interpreter-coverage ladder** — **6 covered / 33 partial / 3 gap** of 42 surfaces (closed for every seed-data surface; the first six flipped to *covered* 2026-06-11 when the live UI itself became the witness — the `W-AD-*-LIVE` family) — and the **equivalence axis** — **43 surfaces match the real iDempiere oracle** (16 cent-exact · 6 declarative diffed to the *live* Postgres · 21 model-layer `beforeSave`+FSM walks) **+ 3 rule-consistent**, each with a load-bearing §FALSIFIER. The surface-by-surface breakdown, witnesses, and M-class denominator live in the matrix + ERP_MODEL_ARCHETYPE.md (MOrder archetype + ~25 deltas, deepest deltas fold `maxDiff=0c`). The buckets below are measured, not asserted.

Splitting all 1,427,147 Java LOC by fate [^split]:

<div class="dtbl" markdown="1">

| Fate | ~LOC | Share | What |
|---|---|---|---|
| **Deleted outright** | ~490K | 34% | ZK web UI (190K), tests (78K), server-side HTML lib (44K), print/report + Jasper (38K), import/migration (25K), webservices, app-server daemon, installer, JDBC drivers, OSGi/HTTP plumbing |
| **Generic-replaced** by the interpreter | ~735K | 52% | generated models `X_*`/`I_*` (573K) + PO / dictionary / runtime core (`Env`, `DB`, `GridField`, util… ~162K) — a new table is *data*, not code |
| **Irreducible — must be folded** | ~200K **(~6.2 MB src)** | 14% | `M*` model logic, `Doc_*` posting, the acct / costing / tax / payment / allocation / matching engines, callouts, validators, document `process/` |

</div>

**Read it:** ~86% is UI, boilerplate, or server plumbing the browser deletes outright. Even the irreducible 14% is ceremony-heavy — in the `M*` models a third is blank/comment/signatures and most of the rest is generic accessor/lifecycle code the dictionary already handles; the *behavioural* logic (state transitions, posting math, tax rounding) is a minority.

**And the irreducible 14% is not one up-front lump.** A large slice of it is the **SvrProcess corpus** — `org.compiere.process.*`, ~54K LOC across **476** `AD_Process` reports/procedures. We do **not** port that corpus to reach parity; we built and proved the **dispatch *mechanism*** (`ad_process.js`, W-PROC: `classname`→handler-registry→`prepare`/validate-params→`doIt`, a port of `ProcessUtil.startJavaProcess` + `SvrProcess.startProcess`) and fold individual procs **on demand** — when a customer actually invokes that report or routine, gated on need + an oracle, never as a sequencing prerequisite. The remaining procs are **named-deferred, not blocking** — *the deliverable is the mechanism, not the corpus* (coverage matrix §A/§B). So ~54K of the ~200K "must-fold" bucket amortises over real demand rather than gating the conversion estimate.

**The process *fold* lane — a server action re-derived from the log.** The point is sharper than dispatch: an iDempiere "process" (its server-side document actions and reports) is re-expressed as an **op-log fold** — its result is a deterministic *re-derivation* by replaying the signed log, requiring **no new primitive verb** (`newVerbs=0`) and gated to the already-ported `DOC_FAMILY` (the consequences are *extracted* from the iDempiere source, never invented). A demand audit of the live corpus sorts the **451 actually-used** processes (the exact subset a real role can reach, `W-PROC-PICKER` vs the live oracle, `diff=0`) into three kinds — **148 KIND-1** (reports), **16 KIND-2** (document generators), **287 KIND-3** (the rest). Shipped folds so far: the **KIND-2 document generators** — `ProjectGenOrder` (AD_Process 164, project → Sales Order, #352), `InOutGenerate` (118, confirmed Sales Order → `M_InOut` shipment, #355) and `InvoiceGenerate` (119, confirmed Sales Order → `C_Invoice`, #358) — each folding through the same `buildDoc` recursion as `completeIt`; and a run of **KIND-1 report folds** — `M_InOut` (117), `M_Movement` (290), `M_Inventory` (291), `C_Project` Print (217), `PP_Order` (53028) and the `C_Payment` voucher (313) — each `W-PROC-*` diffed to the cent against the iDempiere print/report output. These join `foldStatement` / `foldPrint` / NinjaExcel as proof that the *process tier* folds, not just the document tier.

Folding that behavioural core into declarative verbs compresses ~5–8× (no Java/OSGi ceremony, no per-field getters) — though **costing and MRP fold least cleanly** (stateful cost rollups, landed cost), pulling toward the conservative end:

<div class="dtbl hl-last" markdown="1">

| Scenario | irreducible folded | ÷ ratio | full JS (+ engine 28,184) | overall |
|---|---|---|---|---|
| Optimistic | 150K | 8× | **~47K** | ~30× |
| Mid | 175K | 6.5× | **~55K** | ~26× |
| **Conservative (headline)** | 200K | ~5× | **~68K** | **~21×** |

</div>

**Realistic full parity — we headline the *conservative* ≈ 68K JS LOC ≈ ~21×** (mid ~55K/~26×, optimistic ~47K/~30×) — vs ~51× for the engine shell folded so far. Leading with the conservative bound is the point: it does not overclaim. The fold ratio is the one estimated input (GAPS #6); every LOC count is measured (incl. the M-class denominator — `M*.java` 104,940 code-LOC, ~1% folded/ported: ~205 LOC of transactional verbs + ≈830 LOC of cited `beforeSave` regions).

??? note "Full breakdown by iDempiere module (org.adempiere.base, org.adempiere.ui.zk, …) — expand"

    Measured 2026-06-08 [^split]. Fate = **DELETED** (no equivalent in a browser substrate) · **GENERIC** (the interpreter renders it from the dictionary) · **FOLD** (re-expressed as verbs / handlers). Buckets are disjoint and sum to 1,427,147.

    | iDempiere module / package | LOC | Fate |
    |---|---:|---|
    | **org.adempiere.base** | **959,659** | *mixed — split below* |
    | &nbsp;&nbsp;`X_*` generated models | 345,490 | GENERIC |
    | &nbsp;&nbsp;`I_*` interfaces | 227,100 | GENERIC |
    | &nbsp;&nbsp;`M*` business models | 198,679 | FOLD (behavioural subset) |
    | &nbsp;&nbsp;`Doc_*` posting | 12,789 | FOLD |
    | &nbsp;&nbsp;acct · wf · process engines | 28,686 | FOLD |
    | &nbsp;&nbsp;PO · GridField · Env · DB · util · OSGi core | 116,302 | GENERIC |
    | &nbsp;&nbsp;print · report · impexp · db-conn | 30,613 | DELETED |
    | **org.adempiere.ui.zk** — ZK web client | 189,786 | DELETED |
    | **org.idempiere.test** | 78,389 | DELETED |
    | **org.apache.ecs** — server-side HTML lib | 43,816 | DELETED |
    | **org.adempiere.ui** — shared UI base | 18,349 | DELETED |
    | **org.adempiere.pipo** + .handlers — 2-way migration | 16,713 | DELETED |
    | **org.idempiere.webservices** — SOAP/REST | 11,572 | DELETED |
    | **org.adempiere.server** — scheduler / daemon | 11,285 | DELETED |
    | **org.adempiere.install** — installer | 10,366 | DELETED |
    | **org.adempiere.base.callout** | 8,997 | FOLD |
    | **org.compiere.db.{oracle,postgresql}.provider** — JDBC | 7,185 | DELETED |
    | **org.adempiere.replication[.server]** | 3,410 | DELETED |
    | **org.adempiere.report.jasper** | 3,354 | DELETED |
    | **org.idempiere.printformat.editor** | 2,752 | DELETED |
    | **org.adempiere.eclipse.equinox.http.servlet** — OSGi HTTP | 2,677 | DELETED |
    | tablepartition · hazelcast · keikai · felix.webconsole · sso.oidc · plugin.utils · payment.processor · event.test | 5,144 | DELETED |
    | … + ~40 smaller modules (UI widgets, adapters, gateways) | 53,693 | mostly DELETED |
    | **Total** | **1,427,147** | |

</div>
</details>

<details class="fold" markdown="1"><summary>5 · Open caveats — claims without a measured benchmark</summary>
<div class="fbd" markdown="1">

1. **SAP S/4HANA fold** — BLOCKED. `build/erp/sap_fold.log` says `§SAP-FOLD NOT-RUN (skeleton ready;
   gated on oracle access)`. No real SAP O2C+FI export has been folded; only **SAP Business One (B1)
   against a hand-authored MOCK** has (`build/erp/b1_fold.log`). The "SAP" column is therefore
   *partly mock, partly not-run* — never present S/4HANA as proven. The *plan* is published and the
   target fixed: the **ACDOCA Fold Plan** documents how S/4HANA's Universal
   Journal (`ACDOCA`) + document-flow graph (`VBFA`) map onto the engine's own one-journal/op-log
   shape, and the **[Cross-ERP Rosetta Stone](ERPConceptRosetta.html)** now carries an SAP/ACDOCA
   column in its concept matrix — but both are *doctrine ahead of a run*, not evidence. The fold stays
   **NOT claimed** until a real S/4HANA oracle is folded `newVerbs=0`.
2. **Odoo / SAP server-side period-close timing & down-window** — no measured number; marked
   *architectural*. We have our own 2.68 s/40k-op figure but no head-to-head legacy batch-close time.
3. **Odoo / SAP server round-trip latency (ms)** — not measured here. The closest real datum is the
   iDempiere depreciation run (`DepreciationPerf.md`: per-row `saveEx` ≈ ~1M round-trips), and the
   `feedback_erp_perf_claims` matrix (REMOTE per-txn 2–5 orders, RTT-bound) — both iDempiere-flavoured,
   not Odoo/SAP. Cite as illustrative, not as an Odoo/SAP measurement.
4. **Postgres per-op floor vs our per-op** is a *primitive-only* comparison (no callouts/posting/JVM on
   either side) — `bench_oplog_pg.log` states this explicitly; do not extrapolate to whole-document cost.
5. **Live-DB → SQLite (143 MB → 43 MB)** was measured on a static dump + repo (Docker Postgres was NOT
   running at measure time) — see the bloat memory caveat.
6. **Full-conversion LOC (~68K / ~21×)** — the per-bucket LOC are *measured* (`find`/`wc` on
   `~/idempiere-dev-setup/idempiere`, 2026-06-08), but the **5–8× fold-compression ratio** on the irreducible
   business core — and the share of `M*` that is real logic vs accessor/lifecycle ceremony — are **estimates** (no
   full port exists to measure them). Headline the **conservative ~21×** forecast (range ~21–30×); ~51× is the
   *measured built-so-far* engine shell (28,184 LOC, 2026-06-12), a high-compression slice (~1% of the M-class logic) that does not extrapolate.
7. **DR / TCO model constants** — the unit costs (314 B/op snapshot; fold, restore-to-op, per-branch additivity)
   are **measured**; the year-level storage/compute/bill figures are **derived** over modelled constants for the
   traditional side (no Postgres on the bench): `DB_BYTES_PER_ROW=230` (SQLite, no index — Postgres+index ≈ 1.5–3×
   higher), `ROWS_PER_OP=5` (real iDempiere order-complete ≈ 10–20), `IO_RESTORE=200 MB/s`, `3 always-on VMs`. All
   chosen **conservative for us** (a higher real value widens the gap, not narrows it). The illustrative bill uses
   **public list prices (~Jan-2026, volatile)** and **excludes DB licence + DBA labour**. The ratios use the
   **uncompacted** 314 B/op (no shorthand) — the compression ladder (~90 B/op) widens them ~3.5×. Witness:
   `build/erp/poc_tco_skeptic.log`.
8. **Financial Reporting — `PA_Report` statements + `AD_PrintFormat` (witnessed core, named tail).** The
   metadata-driven report layer is **LANDED `maxDiff=0c` (2026-06-11)**: `W-PA-REPORT` folds the seed's 3 real
   user-defined Financial Reports — *Balance Sheet / Income Statement / Cash Flows* (**113** `PA_ReportLine` ·
   **17** `PA_ReportColumn` · **93** `PA_ReportSource`) — driven from the `PA_*` metadata itself, not hardcoded,
   proven on the in-app bundle-alone path; and `W-PRINTFORMAT` (`foldPrint`) reproduces the real Invoice
   master-detail `PrintData` tree, 8/8 seed invoices vs live base tables + the stored grandtotal real iDempiere
   wrote. Both are the strong **fold-vs-independent-product** class, not a tautology (the Trial-Balance base case
   `ΣDr=ΣCr=46574.97`, `test_report_fin.js` §REPORT-FIN, came first). The Jasper / `ReportEngine` stack (~38K LOC)
   stays *deleted* — reports render as a browser fold of the journal, not a server print pipeline. The honest
   REMAINDER: the other 13 `T_*` scratch-table folds (each pending its own witness), unexercised
   group-by/count/avg break functions (implemented, no seed format uses them), pixel layout (non-goal — DOM is
   the render). Spec + verdicts: `ReportingFold.md`.

</div>
</details>



### Roadmap — serious read {#v-roadmap}


Migration is the on-ramp, not the destination. The kernel folds forward into new op-log-native apps —
the same ledger, no new server. **Both shipped 2026-06 and run LIVE on GitHub Pages:**

1. **uniCenta POS reborn — LIVE → POS Addon Spec** — the 2012 Unicenta/AutoBOMOrder
   loop with the middleware deleted, now witnessed end-to-end on the live app: ring → ONE signed group
   (WR order + shipment + invoice, all-or-none, hash-chained) → BOM backflush → **replenishment enacted
   to closure** (suggestion → PO to a real seed vendor → receipt → on-hand rises to the unit → the
   suggestion clears, `newVerbs=[]`); the live ring posts **to the cent** (`§POS-CENT maxDiff=0c`) and
   **void/reverse** nets postings to 0c with on-hand restored. Doctrine in The POS Lens;
   **user guide → [ERP User Guide](ERPUserGuide.md).**
2. **Warehouse mobile walk — LIVE → Spatial Picking Spec** — a phone-first
   pick *"walk the aisles"* app over the same tenant: the warehouse compiled as a BIM-like model (the
   same BOM recursion that compiles a building), fly-to + lens to the next bin, QR scan as the one
   clean act, every pick a signed op; `qtyOnHand` and the ERP window agree **to the unit** (W-WH-LIVE).
3. **BIM → Project Order — LIVE → [spec](BIMtoProject.md)** — the fold generalizes *beyond
   accounting*. Any selection in the BIM Find panel folds into an iDempiere `C_Project` (4D schedule
   from `sequence_rules.json`, 5D cost from the active rate pack) → Generate-PO; delivery
   (`C_ProjectIssue`) folds **back** as an *"Actual"* schedule for a split-screen
   as-planned-vs-as-built Time Machine; rollback is the *same* history dots (`crudFoldBack`), scoped
   to the project. The same kernel that migrates an ERP now folds a *building*. The **Find→ERP
   deep-link is wired live** — a priced selection pushes its Project into Kernel-ERP as an order, with
   status + audio on every push outcome (#401); the Hospital BIM Project Order now ships *baked into
   the GardenWorld seed* (`W-GW-HOSP-FOLD`, #415) so it opens with the tenant. Note: an earlier
   *in-window 3D embed* (the viewer fused inside the ERP's Project window) was deliberately **retired**
   (`W-STRIP-EMBED`, #409) — cross-surface flow now goes forward as a loosely-coupled cross-tab message
   + URL cold-launch, BIM and ERP staying *separate surfaces over one signed op-log*, not a fused viewer.
   That loose coupling is now a **closed 360 loop** (PR #462, LIVE): the project plays as a **4D/5D
   construction twin** — the Time Machine reads the *stored* `PlannedAmt`↔`CommittedAmt` variance off the
   records (not a re-computation; `W-PC-TWIN-SOURCE`), a stacked **cost-element S-curve** folds the
   manufacturing orders as the cursor scrubs (16 `PP_Order`s, every Material/Labor/Burden/Overhead bucket
   summing to the phase's `PlannedAmt` **to the rupiah**; `W-SHOP-SCURVE`), and selecting a model element
   **lights its matching `C_ProjectLine` back in the ERP** over the shared `Connect` bus (`W-CONNECT-ERP`)
   — one identity across viewer and ERP, no server. The manufacturing orders also fall into the standard
   **kanban** (drag = a signed `SET_STATUS`, no special-casing) and a general **pivot** cross-tab, both the
   same fold rather than new code. This unifies onto one op-log what is normally four tools — Primavera
   (schedule/EVM) · Unifier (cost) · Synchro (4D) · CostX (5D); the honest claim is the *unification + the
   log-native what-if*, **not** a CPM scheduling engine (no resource levelling / critical-path depth).
4. **System Administration as op-logged genesis — LIVE** — the same fold reaches *upstream*, to where a
   tenant is born. We reproduce iDempiere's System Administrator (role 0 / System) on the engine, with
   its **Initial Tenant Setup** rewritten as genesis: the wizard **births a tenant as a signed op-log
   and posts it to the cent, in-browser** (#356), and a born tenant becomes a login-able **resident
   client** (#359). The canonical path is System-only — System login → menu *"Initial Tenant Setup"* →
   the wizard embedded in the chrome, gated so a client admin cannot mint companies (`W-GENESIS-SYSADMIN-LIVE`,
   #397). Two surfaces iDempiere's own System role has no serverless analogue for were added: a **System
   Monitor + login-info panel** (#406) and a **Plugins & Releases** page — a gated release/update surface
   iDempiere lacks (#408) — plus a surgical **"Reset demo/seed ERPs"** that rebuilds only the seed band and
   keeps born tenants (`W-SEED-RESET`, #413). The point is the same one fold: a company's *birth* is just
   the genesis of its own op-log.

Items 1–2 are the two ERP objectives stated in the [bim-ootb README](https://github.com/red1oon/bim-ootb#roadmap);
both **landed downstream of the migration this paper measures** — possible precisely because the
kernel is the same fold whether it is migrating an existing ERP or running a new app on it. Item 3 is
the **shared BIM↔ERP objective** — a single parallel op|view history timeline across the BIM building
and the ERP context — now **wired live** (the in-window viewer embed was tried then retired in favour of
loose cross-surface coupling). Item 4 carries that same op-log discipline *upstream*, to a tenant's birth.
(The wider roadmap also carries one BIM-only objective: a 2D grid *editor*.)


</div>
</details>

<details class="fold" markdown="1"><summary>Further Reading</summary>
<div class="fbd" markdown="1">

The on-ramp ends here. To see *how* each claim is built:

- **ERP.md** — the **"AD-in-a-browser" blueprint**: how the iDempiere Application Dictionary is
  folded from SQLite and rendered as a live client, the six verbs (`CREATE_DOCUMENT / CREATE_LINE /
  SET_STATUS / POST / ALLOCATE / MATCH`) every document flow reduces to, and the full engine reference.
  *Start here if you want the whole architecture.*
- **[HolyGrail.md](HolyGrail.md)** — the **end-state vision and its "hard parts"**: multi-site sync, durability
  on disposable hosts, and compaction = the period-close *signed checkpoint = balance b/f* you just saw.
  *Read this for where the whole effort is converging and why these were the hard problems.*
- **OpLogERP.md** — the **event-sourcing model in one page**: why the authoritative state is a
  *signed, hash-chained op-log* and the current numbers are a deterministic **fold** of it — not a row in a
  server DB. *The shortest explanation of "the log is the truth."*
- **[DistributedERP.md](DistributedERP.md)** — the **serverless / secured doctrine + adversarial contention map**:
  the server→serverless table behind the "0 round-trip" claim, the Git-remote "host is disposable" analogy,
  and the honest counter-arguments. *Read this for the distributed-systems reasoning and the proof scripts.*
- **[BIMERPPaper.md](BIMERPPaper.md)** — the **"why / provenance" piece** (Redhuan Oon, 30 years of ERP):
  the motivation, the lineage from iDempiere/Adempiere/Compiere, and what problem this is really solving.

</div>
</details>

<details class="fold" markdown="1"><summary>Status</summary>
<div class="fbd" markdown="1">

DRAFT (2026-06-08, currency pass 2026-06-21: the Kernel-ERP rebrand + iDempiere-fidelity surface, the AD_Process fold lane, genesis / System Admin, the live BIM→Project push, and the closed 360 BIM↔ERP loop — 4D/5D variance twin + shopfloor cost-element S-curve + cross-surface record-light). The evaluator-facing companion to the deep papers (ERP.md · [DistributedERP.md](DistributedERP.md) · [BIMERPPaper.md](BIMERPPaper.md)). Every number here traces to a real source file (path cited per cell); where no head-to-head number exists, the cell says so — nothing is invented.

</div>
</details>

---

## Footnote sources

[^folds]: **✓ = oracle-equivalent fold, witnessed `maxDiff=0c`** against real GardenWorld data (the 16 green fold witnesses + 4 declarative diffs). Engine + witnesses on branch `feat/erp-substrate-phase012`: [`scripts/` (poc_fold_*.js · poc_pa_report.js)](https://github.com/red1oon/BIMCompiler/tree/feat/erp-substrate-phase012/scripts) + [`build/erp/`](https://github.com/red1oon/BIMCompiler/tree/feat/erp-substrate-phase012/build/erp); each carries a load-bearing §FALSIFIER and is graded in FoldEngineQuality.md. "adapter written/unused", "spec'd", and "not built" mean exactly that — code present but not wired, design only, or absent.

[^pclose]: `build/erp/test_kernel_period_close.log` — `§PCLOSE-FOLD` archived=15→live=1, `§PCLOSE-RECONCILE … maxDiff=0c`, tamper/forgery/determinism all PASS on the real kernel.
[^drive]: `build/erp/period_close_drive.log` — in-browser drive: `close N=20000 closeFold=2681.8ms archived=40000 live=1`; `bootstrap fromCkpt=0.90ms fromGenesis=47.70ms speedup=53.0x same=true`; `reconcile maxDiff=0c`.
[^tco]: `build/erp/poc_tco_skeptic.log` — `W-TCO-HARDENED` (`scripts/poc_tco_skeptic.js`): measured 314 B/op snapshot + fold/restore; two backup strategies (Retail) weekly-incremental **244×** / minimal 30×; per-branch-fold additivity `maxDiff=0c`; billable-resource inventory (>10× cheaper excl. licence + labour); double-sale trade bounded to the ≤0.1% shared op-class, value-tiered. Model constants per GAPS #7 (conservative for us).
[^blackout]: `build/erp/poc_blackout_resume.log` — `W-BLACKOUT` (`scripts/poc_blackout_resume.js`): 50 branches, total blackout + relay drive lost (no backup), rebuilt from each branch's own slice to an **identical signed tip**, books `maxDiff=0c`, idempotent re-push (`acc=0`); the CAS-arbitration sliver is named + ledger-routed; `§ORDER-HONEST` — disjoint folds commute, cross-branch CAS order is not reconstructible from signed logs alone.
[^noround]: `docs/DistributedERP.md` §0 (server→serverless table, lines 53–85) + §10 lines 467–468 ("no per-interaction network round-trip (the kernel answers locally)").
[^bench]: `build/erp/bench_oplog_pg.log` — N=1000 ops, one atomic commit: sql.js 208.45 ms (0.2084 ms/op, incl. sha256 chain); Postgres durable WAL+fsync 5.24 ms (0.0052 ms/op). Explicitly "NOT a head-to-head".
[^rpos]: `build/erp/poc_remote_pos.log` — `§RPOS`: local op-group fold **0.01 ms/sale** (167,219 sales/s). Networked legacy per sale = RTT + measured Postgres per-doc; **locals MEASURED, the network leg is a transparent model**, and legacy EXCLUDES iDempiere ORM/OSGi so it is a *floor*: LAN 0.5 ms → 256–674×, metro 10 ms → 1,844–10,205×, cross-region 50 ms → 8,533–50,338×, intercontinental 150 ms → 25,255–150,669×.
[^dep]: `docs/DepreciationPerf.md` — iDempiere 40-year asset depreciation: per-row `saveEx` through the PO layer ≈ ~2 DB round-trips × ~480 periods/asset ≈ ~960/asset → a base of thousands of assets ≈ **~1M round-trips** (recalled ~20 min). The cost is the round-trips, not the maths.
[^sync]: `build/erp/sync_poc_smoke.log` — 5,000 events: naive 9,390 ops/s; batch commitGroup 22,492 ops/s = 2.4× (corroborated `sync_poc_prod_smoke.log`).
[^ceiling]: `build/erp/poc_volume_ceiling.log` — append/fold stay LINEAR; largestFit=20,000,000 ops, ~437 B/op retained; fold ~40.8M ops/s hot at 5M.
[^bloat]: bloat memory (`reference_bloat_reduction.md`, Java side measured 2026-06-06 from `~/idempiere-dev-setup/idempiere`; JS side re-measured 2026-06-12 as the dedup union of `build/erp` + `origin/main:erp` non-lib non-min JS) — seed 45.2 MB → 26.1 MB full-width (≈1.7×; the earlier 12.7 MB/3.5× column-slice left windows unreachable — completeness won, bim-ootb #265); 1,427,147 Java LOC → 28,184 JS LOC / 132 files engine shell (≈51× built-so-far — was 76× at 18,614/60, the ratio falls as real coverage grows; ~21× at conservative full parity, ~68K JS). Full evidence `internal/BLOAT_MEASUREMENT.md`.
[^bloat2]: same memory — LIVE GardenWorld DB Postgres 143 MB on-disk → 43 MB SQLite (925 tables, 187,133 rows, ≈3.3×); gzip 11.7 MB (3.7×).
[^odoo]: `build/erp/odoo_fold_live.log` — `§ODOO-FOLD-LIVE PASS`: live odoodemo (Odoo 17, :8069) SO S00023, 5/5 hops mapped, newVerbs=[], total 5002.50 == oracle, GL ΣDr==ΣCr.
[^b1]: `build/erp/b1_fold.log` — `§B1-FOLD PASS`: SAP Business One O2C + OJDT/JDT1, 5/5 hops, journal 770.00==770.00. Source = a hand-authored MOCK Service-Layer shape (user-authorized 2026-06-05), NOT a real export.
[^sap]: `build/erp/sap_fold.log` — `§SAP-FOLD NOT-RUN` / `BLOCKED — awaiting a REAL SAP oracle. No fold claimed.` (S/4HANA).
[^own]: `docs/DistributedERP.md` §0 lines 74–80 (the Git analogy — log is truth, host disposable) + the signed-checkpoint/tamper proofs in [^pclose].
[^arch]: Architectural property of a server-of-record ERP — no comparable single measured number in this repo; stated as structure, not benchmarked. Honest-caveat doctrine: `feedback_erp_perf_claims`.
[^poc]: The server→serverless mapping + per-line proofs: `docs/DistributedERP.md` §0 ("From server to serverless — what moved where"). POCs live in `scripts/poc_*.js` ([`poc_distributed.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_distributed.js), [`poc_kernel.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_kernel.js), [`poc_chain.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_chain.js), [`poc_sign.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_sign.js), [`poc_persist.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_persist.js), [`poc_remote_pos.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_remote_pos.js), [`poc_postings.js`](https://github.com/red1oon/BIMCompiler/blob/master/scripts/poc_postings.js)); witnessed logs under `build/erp/`.
[^reduce]: The ≈925-table → 5-relation reduction: `docs/DistributedERP.md` §"domain reduction" ("iDempiere AD (925 tables, `M*` classes) → 5 tables + deterministic verbs") + `docs/OpLogERP.md` ("≈925 tables reduce to five relations plus verbs") + `docs/ERP.md` §12 (the 5 core tables) + `docs/FeatureComparison.md` ("5 core tables: containers, items, documents, document_lines, journal").
[^split]: iDempiere swept 2026-06-08 via `find … -exec cat {} + | wc -l` over `~/idempiere-dev-setup/idempiere` (4,465 files, 1,427,147 LOC; same tree as [^bloat]). Key buckets: generated `X_*`=345,490, `I_*`=227,100; ZK web UI=189,786; tests=78,389; base `M*` models=198,679; `Doc_*` posting=12,789; acct engine=21,443; tree-wide `process/`=69,782; costing=22,056; payment=7,359; tax=2,507; matching=1,959; allocation=1,472; callouts=10,340; validators=3,336; plus server-side HTML lib 43,816, print/report+Jasper ~21K, import/migration ~25K, webservices/server/installer/JDBC/OSGi. Disjoint buckets sum to 1,427,147. The 5–8× fold ratio and the ceremony fraction of `M*` are estimates (GAPS #6), not measured.
