# DXF2BIM sandbox tests

Spec: `docs/DXF2BIM_SPEC.md` · guide: `docs/DXF2BIM_USER_GUIDE.md`. Modules: `deploy/dev/dxf2*.js` (sandbox, not wired into the Modeller).

Run a suite: `node tests/dxf2bim/test_<name>.js` (writes `test_<name>.log`; read it, exit code is not evidence).

## Credits
The `farm_*` scripts and logs test against the **American Farmhouse** drawing set by **Jay Osborne**
(freefarmhouse.com), licensed CC BY-SA (the site links 3.0; the drawing itself links 4.0). The drawing
is NOT in this repo: download it into `tests/dxf2bim/external/farmhouse/` (git-ignored) to re-run them.
Derived results in the `farm_*` logs are shared under the same licence, with this attribution.
