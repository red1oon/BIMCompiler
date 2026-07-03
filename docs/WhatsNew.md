# What's New

*← Back to [User Guide](USER_GUIDE.md) · [Home](index.md)*

A running log of shipped, user-visible changes across the Modeller, Viewer, ERP/POS, and HBA facilities
module. Internal engineering work (kernel hardening, data-model migrations, CI fixes) isn't listed here —
only things you'd actually notice using the app. See each app's guide for full how-to detail.

## 2026-07-03

**Modeller**
- Press **`T`** or **`S`** with an element selected to jump straight to the rotate ring or scale cubes,
  without first tapping Move.
- The Outliner now dims non-matching elements on the canvas while you filter, auto-expands to reveal a
  selected row's ancestors, and shows a highlighted outline around whatever's selected.
- Elements now cast real shadows on the canvas.
- A floating readout follows your cursor mid-drag on Move/Scale/Rotate, showing the live delta before you
  release.
- New **BCF 2.1 export** — share your current view and selection as a `.bcfzip` file that opens correctly
  in other BIM tools (Navisworks, Solibri, BIMcollab, Revit, Trimble Connect).

**HBA facilities module**
- **Presence** now reflects real attendance sessions (hours worked, confirmed/unconfirmed) instead of a
  simplified stand-in — see [HR/BIM Asset Guide](HRBIMAssetGuide.md).
- New **BOM pane** — every room's assembly (contained elements + recipe quantities), deep-linking into
  iDempiere's Bill of Materials window.

**ERP / POS**
- New **Kitchen Display** — a live queue of orders waiting to be served, oldest first.
- **Generate Replenishment** is now a staged, reviewable action: generate a suggestion list, edit or
  deselect rows, then confirm — nothing reorders automatically after a sale anymore.

---

*Older changes aren't yet backfilled into this log — check each guide's own content for anything not listed
above.*
