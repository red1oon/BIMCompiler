# Contributing

This project is **open source (MIT)** and built to be pushed forward by a crowd. The
fastest way in is **data and content** — most needs no engine knowledge and lands in an
afternoon.

**One rule: extract or compile, never invent.** Every value must trace to a real source.

## Good first issues — pick one

1. **Add a rate template** — copy a per-country rates JSON, swap in your jurisdiction's
   published unit rates. (~17 countries shipped; the world has ~195.) — *hours*
2. **Add a test building** — drop any IFC; it self-verifies through the Rosetta gates. PR
   the file + the gate result. — *minutes*
3. **Add a product catalog** — `M_Product` rows for a region so costing prices real
   products, not generic IFC classes. — *hours*
4. **Add a locale** — 18 languages auto-detected; add one more string file. — *hours*
5. **Add a format importer** — one isolated importer per new format. — *1–2 days*
6. **Improve IFC export fidelity** — carry Psets / openings / type objects through export
   (a scoped code gap). — *a few days*

Items 1–4 are the true low-hanging fruit: no core code, fully parallel.

## Flow

**Open an issue on the tracker first** (what, how to reproduce, the source) → fork → branch `add-<thing>` →
one small change → run the area's witness and paste the `§` log (or show data loading) → open a PR with
"what + source" and `Fixes #<issue>`. No CLA. Full flow: [Developer Guide §9](docs/DeveloperGuide.md).

## Avoid

Invented data · sprawling multi-thing PRs · touching `deploy/live/`.

Full guide and the project's landed-vs-frontier map:
**https://red1oon.github.io/BIMCompiler/CONTRIBUTING/**

*Copyright (c) 2025–2026 Redhuan D. Oon. MIT Licensed.*
