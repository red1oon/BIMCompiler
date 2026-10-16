// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// room_graph_bridge.js — §R5-A + §R5-B/§STAKEHOLDER_STROLL S1
//   (prompts/Viewer/FLY_TOUR_CORRIDOR_GRAPH.md §R5-A, §STAKEHOLDER_STROLL S1)
//
// deploy/dev's tour.js is now bim-ootb's v19, whose graph route needs exactly TWO externals that
// this fork does not have: `A.getRoomGraph` and `A.ensureRooms`. In bim-ootb both live inside
// viewer/navigate_find.js (5252 lines — the Find panel, HBA overlay and lens stack, none of it on
// the path to "does this building show a highlight", and it additionally needs five APIs this fork
// lacks: activeGuidFilter, filterByGuids, buildingName, _hbaTenancySpec, _applyPendingPatch).
// So the two functions are ported HERE instead of dragging that file across. Measured scope call,
// recorded in the spec — not a silent narrowing.
//
// §R5-A shipped this file CODE-ONLY: `ensureRooms` only REPORTED (`selfHeal=none(R5-B)`), so every
// un-roomed building (SampleHouse and friends) fell to the legacy tour and could never be strolled.
// §STAKEHOLDER_STROLL S1 lands the missing half: the patch source + the lazy `lib/room_walker.js`
// walk + the rooms_meta stamp + the IDB persist, ported from bim-ootb `origin/main`
// `viewer/navigate_find.js` `_ensureRoomsCore()` — the ONE shared injection core, not a second
// dialect of it. Copied from origin/main, never from the local ~/bim-ootb checkout (41 commits
// behind at port time; §R5-A already got burned once by copying from a stale checkout).
//
// ⚠ THE STATE MACHINE IS THE WHOLE POINT — it is what makes injection safe on an authored building:
//   real (non-`RM_`) IfcSpace rows present  → 'none'      → return present, NEVER touched, and this
//                                                           is checked BEFORE `force` is consulted,
//                                                           so even a forced re-inject cannot
//                                                           overwrite real IFC extraction.
//   all rooms compiled (`RM_` guids)        → 'recompute' → only re-walks on force, or when the
//                                                           frame/version guards say the compiled
//                                                           set is objectively stale.
//   zero rooms                              → 'zero'      → inject (patch first, then walker).
// Gate 3 of S1 exists to keep that first line honest: Duplex ships 21 authored IfcSpaces
// (A101…A205, real IFC guids) and every one of them must survive this file running against it.
function setupRoomGraphBridge(A) {
  console.log('[R5A] §R5A_BRIDGE v2 (getRoomGraph + ensureRooms WITH self-heal — S1 injector)');

  // ── A.getRoomGraph — body ported verbatim from navigate_find.js `_roomGraphFor()`.
  // One graph per building, never two: the cache key is `activeBuilding`, so switching buildings
  // rebuilds and a repeat press reuses. Returns null when the module never loaded (a §LOAD_FAIL on
  // room_graph.js, or an older cached index.html) — tour.js treats null as "no route" and falls
  // through to the legacy centroid tour, which is the whole graceful-degradation contract.
  var _graphCache = null, _graphBld = null;
  A.getRoomGraph = function() {
    var RG = (typeof window !== 'undefined') && window.RoomGraph;
    if (!RG || !A.dbQuery) return null;
    if (_graphCache && _graphBld === A.activeBuilding) return _graphCache;
    var g = RG.buildGraph(A.dbQuery, { log: function(m) { console.log('[RP-PATH] ' + m); } });
    _graphCache = g; _graphBld = A.activeBuilding;
    return g;
  };
  // Invalidate when the db underneath changes (building switch handles itself via the key; this is
  // for an in-place db swap, e.g. a reload of the same building).
  A._roomGraphInvalidate = function() { _graphCache = null; _graphBld = null; };

  // ── lazy loader for the room_walker.js port. Shared by the version-check gate and the actual
  // compile below, so the script is fetched at most once per page whichever caller needs it first.
  // dev is a flat tree but keeps its third-party/engine scripts under lib/, same as bim-ootb.
  function _ensureRoomWalkerLoaded() {
    if (window.RoomWalker) return Promise.resolve();
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'lib/room_walker.js?v=3'; // v3: §ROOM_WALKER_VERSION_STAMP stages 1+2
      s.onload = function() { resolve(); };
      s.onerror = function() { reject(new Error('room_walker.js load failed')); };
      document.head.appendChild(s);
    }).then(function() {
      if (!window.RoomWalker) throw new Error('RoomWalker unavailable after load');
    });
  }

  // ── A.ensureRooms — ported from navigate_find.js `_ensureRoomsCore` (origin/main).
  // Same RESULT SHAPE tour.js already consumes ({status, source, rooms}) so no tour.js edit is
  // needed. Single-flight: the Fly prep and any other caller share one run rather than racing two
  // walkers over the same db.
  A.ensureRooms = function(opts) {
    if (A._ensureRoomsInflight) return A._ensureRoomsInflight;
    A._ensureRoomsInflight = _ensureRoomsCore(opts);
    A._ensureRoomsInflight.finally(function() { A._ensureRoomsInflight = null; });
    return A._ensureRoomsInflight;
  };
  async function _ensureRoomsCore(opts) {
    opts = opts || {};
    if (!A.db) return { status: 'error', message: 'no db', source: 'none', rooms: 0 };
    var state = 'zero', total = 0, compiled = 0;
    try {
      var scQ = A.db.exec("SELECT COUNT(*), COUNT(CASE WHEN guid LIKE 'RM\\_%' ESCAPE '\\' THEN 1 END)" +
        " FROM spatial_structure WHERE type='IfcSpace'");
      total = scQ.length ? scQ[0].values[0][0] : 0;
      compiled = scQ.length ? scQ[0].values[0][1] : 0;
      if (total === 0) state = 'zero';
      else if (total === compiled) state = 'recompute';
      else state = 'none'; // real extraction present
    } catch (e) { state = 'zero'; /* table missing on this building — same as zero */ }
    // §S1_ENSURE_ROOMS is the honest §-line: the classification is logged BEFORE anything is
    // written, so a log reader can see exactly which branch protected (or injected) the rooms.
    console.log('[S1] §S1_ENSURE_ROOMS bld=' + (A.activeBuilding || '') + ' rooms=' + total +
      ' compiled=' + compiled + ' state=' + state + ' force=' + (!!opts.force));

    // ── state 'none': REAL authored extraction. Returned here, above the force check, on purpose:
    // this is the single line that makes Gate 3 (Duplex's 21 authored IfcSpaces) hold.
    if (state === 'none') {
      console.log('[S1] §S1_AUTHORED_KEEP bld=' + (A.activeBuilding || '') + ' authored=' +
        (total - compiled) + '/' + total + ' — real extraction, injector will not touch it');
      return { status: 'present', real: true, rooms: total, source: 'none' };
    }
    if (state === 'recompute' && !opts.force) {
      // §PATCH-FRAME-GUARD (boot half): compiler-owned rooms sitting OUTSIDE the building's own
      // element extent are objective corruption, not user data — fall through and recompile.
      // Rooms without coordinates to compare keep the existing trust-present behavior.
      var inFrame = true;
      try {
        var _e0 = A.dbQuery("SELECT MIN(center_x),MAX(center_x),MIN(center_y),MAX(center_y)" +
          " FROM element_transforms WHERE center_x IS NOT NULL")[0];
        var _r0 = A.dbQuery("SELECT MIN(center_x),MAX(center_x),MIN(center_y),MAX(center_y)" +
          " FROM spatial_structure WHERE type='IfcSpace' AND center_x IS NOT NULL")[0];
        if (_e0 && _r0 && _r0[0] !== null && _e0[0] !== null) {
          inFrame = _r0[1] >= _e0[0] && _r0[0] <= _e0[1] &&
                    _r0[3] >= _e0[2] && _r0[2] <= _e0[3];
        }
      } catch (eIf) { /* inFrame stays true */ }
      // §ROOM_WALKER_VERSION_STAMP stage 4 — a compiled set stamped with an older algorithm
      // version (or no rooms_meta at all) is stale, same treatment as an out-of-frame one.
      // Loading room_walker.js to READ its version constant does not itself trigger a recompute.
      var versionStale = false, storedV = null;
      var _dbFileNow = (A.DB_URL || '').slice((A.DB_URL || '').lastIndexOf('/') + 1).split('?')[0];
      if (inFrame) {
        try {
          await _ensureRoomWalkerLoaded();
          var _rmv = A.dbQuery("SELECT version FROM rooms_meta WHERE id=1");
          storedV = _rmv.length ? _rmv[0][0] : null;
          versionStale = storedV !== window.RoomWalker.ROOM_WALKER_V;
        } catch (eV) { versionStale = true; /* no rooms_meta = compiled before this shipped */ }
        // console.log, never console.warn — a warn is invisible under a DevTools filter with
        // "Warnings" unchecked, which once made a correctly-firing recompile look like a no-op.
        if (versionStale) console.log('[S1] §S1_VERSION_STALE bld=' + (_dbFileNow || A.activeBuilding) +
          ' stored=' + storedV + ' current=' + (window.RoomWalker && window.RoomWalker.ROOM_WALKER_V) + ' — recompiling');
      }
      if (inFrame && !versionStale) return { status: 'present', real: false, rooms: total, source: 'none' };
      if (!inFrame) console.log('[S1] §S1_FRAME_STALE compiled rooms outside building extent — recompiling');
    }

    var bld = A.activeBuilding || '';
    var url = A.DB_URL || '';
    var dir = url.slice(0, url.lastIndexOf('/') + 1);
    var dbFile = url.slice(url.lastIndexOf('/') + 1).split('?')[0];
    var patchUrl = dir + 'patches/' + dbFile + '.sql';
    var source = null;
    try {
      // ── source 1: the curated patch (this is `_applyPendingPatch`'s sql.js run() semantics,
      // applied straight to the LIVE db rather than to a pre-load buffer).
      var applied = false;
      try {
        // a forced re-cure skips the patch: the patch is exactly what produced the rooms being
        // re-cured (or was frame-dropped already) — go straight to the walker.
        if (opts.skipPatch) throw new Error('skipPatch');
        var r = await fetch(patchUrl);
        if (r.ok) {
          var sqlText = await r.text();
          A.db.run(sqlText);
          applied = true;
          console.log('[S1] §S1_PATCH_APPLY ' + dbFile + ' applied (' + sqlText.length + ' bytes) from ' + patchUrl);
        } else {
          console.log('[S1] §S1_PATCH_NONE ' + dbFile + ' (' + r.status + ')');
        }
      } catch (e) { console.log('[S1] §S1_PATCH_ERR ' + (e && e.message)); }

      // `applied` only means the patch SQL ran without throwing — a patch can be 4 lines
      // regenerating storey_walkable_raster and carry NO compiled room data. Trusting `applied`
      // alone would skip the walker on a fresh db and then persist that regressed state into IDB.
      // Require actual compiled evidence: a `room_guid` column.
      var hasCompiledRooms = false;
      try {
        var ssColsCheck = A.dbQuery("PRAGMA table_info(spatial_structure)");
        hasCompiledRooms = ssColsCheck.some(function(c) { return c[1] === 'room_guid'; });
      } catch (eCols) { /* hasCompiledRooms stays false */ }

      // §PATCH-FRAME-GUARD (needle half): a patch fetched by dbFile NAME can belong to a different
      // building/frame than the db's actual content (observed live: an extracted-frame patch landed
      // on imported content ~550 m off the walls). Trust a patch only when its compiled rooms
      // actually sit ON this building — measured extent intersection, no thresholds.
      var frameOk = false;
      if (applied && hasCompiledRooms) {
        try {
          var _ext = A.dbQuery("SELECT MIN(center_x),MAX(center_x),MIN(center_y),MAX(center_y)" +
            " FROM element_transforms WHERE center_x IS NOT NULL")[0];
          var _rext = A.dbQuery("SELECT MIN(center_x),MAX(center_x),MIN(center_y),MAX(center_y)" +
            " FROM spatial_structure WHERE type='IfcSpace' AND center_x IS NOT NULL")[0];
          if (_ext && _rext && _rext[0] !== null && _ext[0] !== null) {
            frameOk = _rext[1] >= _ext[0] && _rext[0] <= _ext[1] &&
                      _rext[3] >= _ext[2] && _rext[2] <= _ext[3];
          }
        } catch (eFg) { /* frameOk stays false */ }
        if (!frameOk) {
          console.log('[S1] §S1_PATCH_MISMATCH patch rooms outside building extent — dropping patch rooms, walker takes over');
          try {
            A.db.run("DELETE FROM spatial_structure WHERE guid LIKE 'RM\\_%' ESCAPE '\\' OR guid LIKE 'STC\\_%' ESCAPE '\\';" +
                     "DELETE FROM rel_contained_in_space WHERE space_guid LIKE 'RM\\_%' ESCAPE '\\';");
          } catch (eDel) { console.log('[S1] §S1_PATCH_MISMATCH cleanup err ' + (eDel && eDel.message)); }
        }
      }

      if (applied && hasCompiledRooms && frameOk) {
        source = 'patch';
      } else {
        // ── source 2: the walker (any building). Compiles deterministically from walls/doors and
        // refuses honestly (roomsWritten=0) when the building has none — it never invents rooms.
        await _ensureRoomWalkerLoaded();
        window.RoomWalker.walk(A.db, { write: true });
        source = applied ? 'patch+walker' : 'walker';
      }

      var hasRoomGuidNow = false;
      try {
        var ssColsNow = A.dbQuery("PRAGMA table_info(spatial_structure)");
        hasRoomGuidNow = ssColsNow.some(function(c) { return c[1] === 'room_guid'; });
      } catch (eColsNow) { /* hasRoomGuidNow stays false */ }
      var cq = A.dbQuery("SELECT COUNT(*), COUNT(DISTINCT " + (hasRoomGuidNow ? 'room_guid' : 'guid') +
        ") FROM spatial_structure WHERE type='IfcSpace'");
      var rectsN = cq.length ? cq[0][0] : 0;
      var roomsN = cq.length ? cq[0][1] : 0;
      console.log('[S1] §S1_INJECT bld=' + bld + ' source=' + source + ' rooms=' + roomsN + ' rects=' + rectsN);

      // §ROOM_WALKER_VERSION_STAMP stage 4 — stamp rooms_meta after ANY inject source. writeRooms()
      // already stamps, but the patch source does NOT; without this a patch-carrying building
      // recomputes on EVERY load because rooms_meta stays absent and the version check re-fires
      // forever. Idempotent INSERT OR REPLACE.
      try {
        await _ensureRoomWalkerLoaded();
        var _rwvNow = (window.RoomWalker && window.RoomWalker.ROOM_WALKER_V) || '';
        A.db.run("CREATE TABLE IF NOT EXISTS rooms_meta (id INTEGER PRIMARY KEY CHECK(id=1), version TEXT, built_at TEXT, room_count INTEGER)");
        var _stmtRM = A.db.prepare("INSERT OR REPLACE INTO rooms_meta (id, version, built_at, room_count) VALUES (1, ?, ?, ?)");
        _stmtRM.run([_rwvNow, new Date().toISOString(), roomsN]); _stmtRM.free();
        console.log('[S1] §S1_STAMP rooms_meta version=' + _rwvNow + ' rooms=' + roomsN + ' source=' + source);
      } catch (eStamp) { console.log('[S1] §S1_STAMP_FAIL ' + (eStamp && eStamp.message)); }

      // ── persist the injected bytes into the SAME IDB cache slot the loader reads, so rooms
      // survive a reload without re-injecting. Never blocks the tour on failure.
      try {
        var outBuf = A.db.export().buffer;
        var cacheDb = A.openCacheDB ? await A.openCacheDB() : null;
        if (cacheDb) {
          await new Promise(function(resolve) {
            try {
              var tx = cacheDb.transaction(A.CACHE_STORE, 'readwrite');
              var req = tx.objectStore(A.CACHE_STORE).put(outBuf, url);
              req.onerror = function() { console.log('[S1] §S1_PERSIST idb=fail err=' + req.error); };
              tx.oncomplete = function() { console.log('[S1] §S1_PERSIST idb=ok bytes=' + outBuf.byteLength); resolve(); };
              tx.onerror = function() { console.log('[S1] §S1_PERSIST idb=fail tx-error'); resolve(); };
            } catch (e2) { console.log('[S1] §S1_PERSIST idb=fail ' + e2.message); resolve(); }
          });
        } else {
          console.log('[S1] §S1_PERSIST idb=fail no-cache-db');
        }
      } catch (e) { console.log('[S1] §S1_PERSIST idb=fail ' + (e && e.message)); }

      // The room graph was built (or cached) against the PRE-injection room set — bust it in the
      // same breath so the next Fly press plans against the fresh rooms. dev has only this one
      // room-graph cache; navigate_find's path/corridor-label/room-volume caches do not exist here.
      A._roomGraphInvalidate();
      if (A._tourCacheBust) A._tourCacheBust();
      return { status: 'injected', source: source, rooms: roomsN, rects: rectsN };
    } catch (e) {
      console.log('[S1] §S1_INJECT_ERR ' + (e && e.message));
      return { status: 'error', message: (e && e.message), source: 'none', rooms: 0 };
    }
  }
}
