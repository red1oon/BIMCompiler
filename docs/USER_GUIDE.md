---
description: BIM OOTB user guide — view IFC buildings in 3D, author geometry, and run the Kernel-ERP, all client-side in one browser tab with zero install.
---
# BIM OOTB — User Guide

One browser. **View** a building · **author** geometry · **run** the ERP. Zero install, all client-side.

!!! privacy "🔒 Data Security Guarantee"
    **There is no AI and no LLM in this app. Your data never leaves your browser.** Any file you drop
    into the app stays inside your browser's own IndexedDB and kernel, protected by standard browser
    security — and you save it back to your own machine, when and where you choose. Every IFC you drop,
    every building you open, every ERP edit stays client-side on your own device — nothing is uploaded to
    us, nothing is tracked, nothing phones home, and no model is fed your data. Every result is deterministic
    and traces to a line of open code you can read.

    [**Read the full guarantee — how the trust model works →**](EnterpriseAuthentication.md)

![The Matrix landing — choose your door](assets/matrix_landing.png)

Start at the **[front door → red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/)** — the
Matrix landing (red / blue → round selector). Pick a door, or jump straight to any app by its URL below.
**Bookmark any of them**; press **Home** on any surface to come back to the front door. On a return visit
the landing shows the compact `⋯` launcher; **refresh** for the full round selector again.

New here recently? Check **[What's New](WhatsNew.md)** for a running log of shipped changes.

## Pick a surface

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg> __BIM Viewer__

    **Drop your own IFC** → extracted to SQLite right in the browser; merge disciplines, fly-through, clash matrix, 4D/5D time-machine, ERP Project Order — all on the same file. Desktop and mobile, works offline.

    _Front door → the **Buildings / IFC** icon (above)_ · [Open](https://red1oon.github.io/bim-ootb/#buildings) · [Guide](BIMUserGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg> __DAGeVu Modeller__

    Author B-rep geometry — insert library parts, sketch, extrude, sweep — where the signed op-log *is* the feature tree. Early/WIP; desktop.

    _Front door → the **BIM Modeller** icon (above)_ · [Open](https://red1oon.github.io/bim-ootb/viewer/modeller.html) · [Guide](ModellerGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> __Kernel-ERP__

    Real iDempiere in the browser — POS, financial statements, the full Application Dictionary from SQLite. No Java, no server, no install.

    _Front door → the **ERP** icon (above)_ · [Open](https://red1oon.github.io/bim-ootb/erp/erp.html) · [Guide](ERPUserGuide.md)

</div>

> **ERP practitioners** — implementers, power users, developers, and other ERP projects — start with
> **[Migrate & Compare](MigrateComparisonPaper.md)**: how Kernel-ERP folds a live iDempiere (and Odoo)
> tenant onto one signed op-log, what stands comparison with a legacy stack, and the honest gaps.

## Also on the front door

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> __About & Install__

    What BIM OOTB is, and how to keep it. It's a **frictionless PWA** — your browser can *install* it (add to home screen) so it runs **offline, no server**. The same box has a **Run it yourself (DIY)** tab: download a one-step install script + README to self-host the whole stack on your own machine.

    _Front door → the **About** icon (above)_ · [Self-host guide](SYSTEMS_INSTALLER_GUIDE.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> __Clear Cache__

    Resets to the start screen. Clears only the **in-browser building data** — cached buildings and any IFC scene you dropped in but never saved to a `.db` — and returns you to the red / blue gate. **Keeps** the installed app, its offline data, and any `.db` file you saved yourself.

    _Front door → the **Trash** icon (above)_

</div>

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
