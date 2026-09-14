# What's New

*← Back to [User Guide](USER_GUIDE.md) · [Home](index.md)*

A running log of shipped, user-visible changes across the Modeller, Viewer, ERP/POS, and HBA facilities
module. Internal engineering work (kernel hardening, data-model migrations, CI fixes) isn't listed here —
only things you'd actually notice using the app. See each app's guide for full how-to detail.

## 2026-08-16

**BIM Viewer**
- **Discipline Reveal** in the Film-Maker (**Alt+C**) now flies smoothly back to the start of the
  walk instead of cutting there instantly, orders its discipline-by-discipline parade smallest
  elements first with MEP last, and cross-blends briefly between each discipline instead of
  swapping instantly. See
  **[Discipline Reveal — walk it twice, once dressed, once bare](BIMUserGuide.md#discipline-reveal--walk-it-twice-once-dressed-once-bare)**.

## 2026-08-12

**BIM Viewer**
- **Buildings now cast their real shadow in a recorded film.** The main building and its rooftop plant
  previously cast nothing during a film bake — only the distant skyline did. Shadows now fall correctly
  from the whole model, throughout the sun's noon-to-dusk travel, while the 4D construction reveal runs.
- The Film-Maker's sun/sky/shadow behaviour is now documented — see
  **[Sun, sky and shadow while the film records](BIMUserGuide.md#sun-sky-and-shadow-while-the-film-records)**.
- **Alt+S** (photographic still) and **Alt+J** (optional bounce light) are now listed in the Viewer
  cheat-sheet.

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
