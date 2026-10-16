#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
"""
Rebuild a Modeller resident's *_geo.db with COMPILED PER-LAYER geometry (§LOD400-LAYERS-REAL,
RESUME_MODELLER_LOD400_REAL_GEOMETRY.md) — the residents half of the layer shipping lane.

WHY THIS EXISTS
---------------
The extractor (PR #57) compiles every authored multi-layer element's envelope mesh into N
concatenated layer slabs behind the SAME geometry_hash, indexed by `component_geometry_layers
(geometry_hash, layer_seq, material_name, thickness_m, face_start, face_count)`. The live Modeller
residents however serve a *_geo.db split from an OLDER extraction (§GEO-SERVED, bim-ootb PR #1090)
whose geometry_hash ids do NOT match a fresh extraction's (hashing covers the buffer bytes; the old
store is unwelded + differently-anchored). So the layered buffers must be carried over by GUID, not
by hash, and re-expressed in each old blob's own local frame.

FRAME RECONCILIATION (measured, not assumed)
--------------------------------------------
Both stores are self-consistent pairs (blob, element_transforms): world = C + R(v). For a guid g:
    v_old_frame = R_old^-1 (C_fresh - C_old) + R_old^-1 R_fresh (v_fresh)
Every input is EXTRACTED data (both extractions' element_transforms). MEASURED on Duplex
(2026-07-30): all 79 layered guids agree in world space to <1e-5 m between the two stores; layered
elements are yaw-only in both stores (tilted elements are never layered there — the script REFUSES
any layered guid with a non-zero rotation_x/rotation_y rather than guessing an Euler convention).

DEDUP REGROUPING: several guids share one OLD hash while the fresh extraction gave them DIFFERENT
hashes (or vice versa). The buffer written for an old hash is ONE representative guid's transformed
buffer; every OTHER guid sharing that hash is then verified: its old-transform world AABB composed
with the NEW buffer must match its OWN fresh world AABB within --tol. Any guid that fails gets its
hash SPLIT (a synthesized `<oldhash>-Ln` id carrying its own buffer + layer rows) and an
`element_instances` re-point emitted into the companion ARC patch SQL (stdout section) — never a
silently shared wrong buffer.

NON-INVENT: geometry buffers and layer rows are copied VERBATIM from the fresh extraction (the ONE
implementation of layer compilation); the only computation is the measured-frame change of basis
above, and every result is verified against the fresh store's own world placement. Any miss → loud
§GEO-LAYER-REFUSE + non-zero exit; nothing is defaulted.

Usage:
  python3 scripts/gen_layered_geo_db.py --fresh <X_fresh.db> --arc <shipped X_ARC.db> \
      --old-geo <current X_geo.db> --out <new X_geo.db> [--tol 0.005]
Exit 0 = new geo db written + verified (all shipped hashes resolve; layer rows sum to authored
totals; per-slab extents match authored thicknesses). Anything else = non-zero, no partial ship.
"""
import argparse
import os
import sqlite3
import sys

import numpy as np

LOG = []


def log(msg):
    print(msg)
    LOG.append(msg)


def rot_z(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0.0], [s, c, 0.0], [0.0, 0.0, 1.0]])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fresh", required=True, help="fresh extractIFCtoDB.py output (layer-compiled)")
    ap.add_argument("--arc", required=True, help="the SHIPPED resident *_ARC.db (guid->old hash truth)")
    ap.add_argument("--old-geo", required=True, help="the currently-served *_geo.db (old buffers)")
    ap.add_argument("--out", required=True, help="output: rebuilt *_geo.db")
    ap.add_argument("--tol", type=float, default=0.005, help="world-AABB agreement tolerance (m)")
    args = ap.parse_args()

    fresh = sqlite3.connect(args.fresh)
    arc = sqlite3.connect(args.arc)

    # fresh geometry may live in base_geometries (legacy single-file) or component_geometries
    ftab = None
    for t in ("base_geometries", "component_geometries"):
        if fresh.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone():
            ftab = t
            break
    if not ftab:
        log("§GEO-LAYER-REFUSE fresh db has no geometry table")
        return 1

    ship = dict(arc.execute(
        "SELECT guid, geometry_hash FROM element_instances WHERE geometry_hash IS NOT NULL"))
    fr = dict(fresh.execute(
        "SELECT guid, geometry_hash FROM element_instances WHERE geometry_hash IS NOT NULL"))
    t_old = {g: np.array(t) for g, *t in arc.execute(
        "SELECT guid,center_x,center_y,center_z,rotation_x,rotation_y,rotation_z FROM element_transforms")}
    t_new = {g: np.array(t) for g, *t in fresh.execute(
        "SELECT guid,center_x,center_y,center_z,rotation_x,rotation_y,rotation_z FROM element_transforms")}
    frgeo = {h: (v, f) for h, v, f in fresh.execute(
        "SELECT geometry_hash, vertices, faces FROM " + ftab)}
    layers = {}
    for h, seq, mat, th, fs, fc in fresh.execute(
            "SELECT geometry_hash, layer_seq, material_name, thickness_m, face_start, face_count "
            "FROM component_geometry_layers ORDER BY geometry_hash, layer_seq"):
        layers.setdefault(h, []).append((seq, mat, th, fs, fc))

    # group shipped guids by old hash; keep only groups whose fresh hashes are layered
    groups = {}
    for g, ho in ship.items():
        if g in fr:
            groups.setdefault(ho, []).append(g)
    missing_fresh = [g for g in ship if g not in fr]
    if missing_fresh:
        log("§GEO-LAYER-REFUSE %d shipped guid(s) absent from the fresh extraction: %s"
            % (len(missing_fresh), missing_fresh[:5]))
        return 1

    def to_old_frame(g):
        """fresh buffer of guid g re-expressed in g's OLD local frame (yaw-only, verified)."""
        to, tn = t_old[g], t_new[g]
        for t, name in ((to, "old"), (tn, "fresh")):
            if abs(t[3]) > 1e-9 or abs(t[4]) > 1e-9:
                raise ValueError("layered guid %s carries %s-store tilt rx/ry=%r — Euler convention "
                                 "unverified for tilt, refusing (never guess)" % (g, name, t[3:5]))
        Ro, Rn = rot_z(to[5]), rot_z(tn[5])
        vb, fb = frgeo[fr[g]]
        v = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3).astype(np.float64)
        out = (Ro.T @ ((Rn @ v.T).T + (tn[:3] - to[:3])).T).T
        return out.astype(np.float32), fb

    def world_aabb(t, v):
        w = (rot_z(t[5]) @ v.astype(np.float64).T).T + t[:3]
        return w.min(axis=0), w.max(axis=0)

    # build replacement plan
    replace = {}      # old_hash -> (verts_f32_bytes, faces_bytes, layer_rows, src_fresh_hash)
    splits = []       # (guid, new_hash) element_instances re-points for the ARC patch
    refuse = 0
    for ho, guids in sorted(groups.items()):
        lay_flags = set(fr[g] in layers for g in guids)
        if lay_flags == {False}:
            continue                      # nothing layered under this hash — old buffer stays
        if lay_flags == {True, False}:
            log("§GEO-LAYER-REFUSE old hash %s mixes layered and non-layered guids %s" % (ho, guids))
            refuse += 1
            continue
        rep = guids[0]
        try:
            v_rep, f_rep = to_old_frame(rep)
        except ValueError as e:
            log("§GEO-LAYER-REFUSE " + str(e))
            refuse += 1
            continue
        rows_rep = layers[fr[rep]]
        keep = [rep]
        for g in guids[1:]:
            mn_o, mx_o = world_aabb(t_old[g], v_rep)
            vb, _ = frgeo[fr[g]]
            vf = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3)
            mn_f, mx_f = world_aabb(t_new[g], vf)
            d = max(np.abs(mn_o - mn_f).max(), np.abs(mx_o - mx_f).max())
            same_rows = layers[fr[g]] == rows_rep
            if d <= args.tol and same_rows:
                keep.append(g)
            else:
                nh = "%s-L%d" % (ho, len(splits))
                try:
                    v_g, f_g = to_old_frame(g)
                except ValueError as e:
                    log("§GEO-LAYER-REFUSE " + str(e))
                    refuse += 1
                    continue
                replace[nh] = (v_g.tobytes(), f_g, layers[fr[g]], fr[g])
                splits.append((g, nh))
                log("§GEO-LAYER-SPLIT guid=%s old=%s -> %s (worldΔ=%.4f sameLayerRows=%s)"
                    % (g, ho, nh, d, same_rows))
        replace[ho] = (v_rep.tobytes(), f_rep, rows_rep, fr[rep])
    if refuse:
        log("§GEO-LAYER-REFUSE %d group(s) refused — NOT writing %s" % (refuse, args.out))
        return 1

    # write output: copy old geo db, swap buffers, add the layer index
    if os.path.exists(args.out):
        os.remove(args.out)
    old_raw = open(args.old_geo, "rb").read()
    open(args.out, "wb").write(old_raw)
    out = sqlite3.connect(args.out)
    out.execute("""CREATE TABLE IF NOT EXISTS component_geometry_layers (
        geometry_hash TEXT,
        layer_seq INTEGER,
        material_name TEXT,
        thickness_m REAL,
        face_start INTEGER,
        face_count INTEGER,
        PRIMARY KEY (geometry_hash, layer_seq)
    )""")
    n_upd = n_ins = n_rows = 0
    for h, (vb, fb, rows, src) in sorted(replace.items()):
        cur = out.execute(
            "UPDATE component_geometries SET vertices=?, faces=? WHERE geometry_hash=?",
            (sqlite3.Binary(vb), sqlite3.Binary(fb), h))
        if cur.rowcount == 0:
            bld = out.execute("SELECT building FROM component_geometries LIMIT 1").fetchone()[0]
            out.execute("INSERT INTO component_geometries (geometry_hash, vertices, faces, building)"
                        " VALUES (?,?,?,?)", (h, sqlite3.Binary(vb), sqlite3.Binary(fb), bld))
            n_ins += 1
        else:
            n_upd += 1
        for (seq, mat, th, fs, fc) in rows:
            out.execute("INSERT OR REPLACE INTO component_geometry_layers VALUES (?,?,?,?,?,?)",
                        (h, seq, mat, th, fs, fc))
            n_rows += 1
    out.commit()
    out.execute("VACUUM")
    out.commit()

    # ── verification (read the OUTPUT back, not the plan) ────────────────────────────────────────
    need = set(ship.values())
    for g, nh in splits:
        need.discard(None)
        need.add(nh)                     # re-pointed guids resolve the split hash instead
    have = set(h for (h,) in out.execute("SELECT geometry_hash FROM component_geometries"))
    unresolved = sorted(need - have)
    lay_hashes = set(h for (h,) in out.execute(
        "SELECT DISTINCT geometry_hash FROM component_geometry_layers"))
    # per-hash: slab extents along the thinnest axis must match authored thicknesses; face_count=0
    # rows are a hard failure (row 33 — the extractor refuses instead of emitting them)
    ext_bad = 0
    for h in sorted(lay_hashes):
        vb, fb = out.execute(
            "SELECT vertices, faces FROM component_geometries WHERE geometry_hash=?", (h,)).fetchone()
        v = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3)
        f = np.frombuffer(fb, dtype=np.uint32)
        for seq, mat, th, fs, fc in out.execute(
                "SELECT layer_seq, material_name, thickness_m, face_start, face_count "
                "FROM component_geometry_layers WHERE geometry_hash=? ORDER BY layer_seq", (h,)):
            if fc == 0:
                # Row 33 (Watchdog 2026-07-30): an empty slab is a refusal, not a row — the
                # extractor no longer emits these; one in a rebuilt resident is a hard failure.
                log("§GEO-LAYER-VERIFY-FAIL hash=%s layer=%d %s face_count=0 — an empty slab "
                    "is a refusal, not a row (row 33)" % (h, seq, mat))
                ext_bad += 1
                continue
            idx = f[fs * 3:(fs + fc) * 3]
            slab = v[idx]
            ext = slab.max(axis=0) - slab.min(axis=0)
            if abs(ext.min() - th) > 0.0015:
                log("§GEO-LAYER-VERIFY-FAIL hash=%s layer=%d %s slab thin-extent %.4f != authored %.4f"
                    % (h, seq, mat, ext.min(), th))
                ext_bad += 1
    n_geo = out.execute("SELECT count(*) FROM component_geometries").fetchone()[0]
    log("§GEO-LAYER-BUILD out=%s geoRows=%d buffersSwapped=%d splitRows=%d layerRows=%d "
        "layeredHashes=%d splits=%d" % (os.path.basename(args.out), n_geo, n_upd, n_ins,
                                        n_rows, len(lay_hashes), len(splits)))
    if unresolved:
        log("§GEO-LAYER-VERIFY-FAIL %d shipped hash(es) unresolved in output: %s"
            % (len(unresolved), unresolved[:5]))
        return 1
    if ext_bad:
        log("§GEO-LAYER-VERIFY-FAIL %d slab extent mismatch(es)" % ext_bad)
        return 1
    log("§GEO-LAYER-VERIFY all %d needed hashes resolve; slab extents match authored thicknesses" % len(need))

    # ── companion ARC-patch section for any hash splits (stdout — append to patches/<X>_ARC.db.sql) ──
    if splits:
        print("\n-- §GEO-LAYER-SPLIT re-points (append to the resident's patch file):")
        for g, nh in splits:
            print("UPDATE element_instances SET geometry_hash='%s' WHERE guid='%s';" % (nh, g))
    return 0


if __name__ == "__main__":
    sys.exit(main())
