// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// erp_relay_server.js — Implementing ERP.md §0.20 (the async server domain) — Witness: W-RELAY
// The HTTP form of the "Dumb Facilitator": the SAME contract as build/erp/erp_sequencer.js, over the
// wire + durable append. It SEQUENCES ops (assigns canonical total order, dedupes by op_uuid) and does
// NOTHING ELSE — no validation, no folding, no rule eval. Authority over EFFECTS stays in the
// deterministic kernel that replays this order on every device (docs/DistributedERP.md §0; the
// "asynchronous sequencing relay / dumb facilitator" of LocalFirstPriorArt.md §6).
//
// Endpoints (all JSON):
//   POST /push      body: {ops:[{op_uuid,timestamp,op_type,parameters,input_guids,output_guid,...,sig}]}
//                   → {accepted, skipped, head}   (idempotent by op_uuid — re-push is a no-op)
//                     gated mode adds {rejected, reasons:{<reason>:n}}; 403 when NOTHING in the push was
//                     admissible (accepted+skipped=0, rejected>0); 413 when a cap (body/ops) tripped.
//   GET  /snapshot?after=N  → {ops:[...], head}   (canonical ops with seq > N)
//   GET  /head      → {head}
//   GET  /health    → {ok:true, head, auth:{mode,...counters}}
//
// Durability: every accepted op is appended to a JSONL file (opts.persistPath) BEFORE the in-memory
// log grows, and replayed on boot — so a relay restart keeps the canonical order. NODE ONLY (server).
//
// ── ADMISSION GATE — Implementing prompts/BACKEND_SUBSTRATE_LANE.md §RELAY_AUTH §RA.2 — Witness: W-RELAY-AUTH ──
// S-1 (§MH.4) is an AVAILABILITY hole, not a forgery hole: a forged op already fails client-side verification on
// replay; what an anonymous party could do was FILL THE LOG. This gate closes that and NOTHING more — the relay
// stays untrusted by design (§RA.0): clients keep verifying on replay, nothing here is a source of truth.
// No new scheme (§RA.1): admission = the HQ-signed device roster that erp_key_epochs.js already is (verified
// under the PINNED key, never a key carried in the payload) + the op's own v2 content signature
// (kernel_ops.js T2/S8: sig attests sha256('cs2|'+_canonicalV2), params carry `_sigv:2` + `signed_by`=kid).
// Layered CHEAPEST FIRST (§RA.2) — verifying first would only trade a disk DoS for a CPU one:
//   L1 body cap (Content-Length / streamed bytes / ops-per-push) → L2 shape (op_uuid, _sigv:2, signed_by,
//   128-hex sig) → L3 roster membership (map lookup; REVOKED / superseded kids refused) → L4 op_uuid dedup
//   (unchanged; a replay is the cheapest rejection) → L5 ECDSA verify LAST (erp_snapshot_sign.verifyTip),
//   with a bounded (op_uuid|sig)-keyed failure cache so an identical bad op is never re-verified.
// Mode: opts.roster ABSENT → OPEN (the pre-gate behaviour, byte-identical `_accept`, logged loudly as S-1 OPEN —
//   W-RELAY runs this mode unmodified); opts.roster PRESENT → ROSTER (gated). An EMPTY roster is logged VACUOUS.
// Control ops at the relay (the N-writer form of erp_key_epochs' burn-not-reattribute model — every roster key
//   is admissible from the start, as in verifyMultiDeviceOps; ROTATE/REVOKE only ever REMOVE admissibility):
//   {kind:'REVOKE', revokedKid}  signed by an admissible kid → revokedKid's FUTURE ops refused; its PAST ops
//                                stay in the log (they really were authored). Permanent.
//   {kind:'ROTATE', newKid}      signed by the outgoing kid → the outgoing kid is superseded (cannot push again);
//                                newKid must be in the roster (HQ signed it in) and not revoked.
//   Both are re-derived from the persisted log on boot, against the CURRENT roster (a device HQ dropped from
//   the roster has its control ops voided) — so revocation survives a restart without re-verifying the log.
// v1 rows (no `_sigv:2`) are REFUSED, never verified: a v1 sig attests op_hash, a client-asserted value the
//   relay cannot recompute and that is not bound to op_uuid — a copied (op_hash,sig) pair on a fresh op_uuid
//   would "verify" and re-open S-1 (witnessed §RA-5b).
'use strict';
var http = require('http');
var fs = require('fs');

var SIG_HEX = /^[0-9a-f]{128}$/;          // raw r||s, 64 bytes — what erp_signer/erp_snapshot_sign emit
var MAX_UUID = 128, FAIL_CACHE_MAX = 10000;

// The gate's own dependencies are loaded ONLY when a roster is given — OPEN mode touches none of this.
function _gateDeps(opts) {
  if (typeof global !== 'undefined' && typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
  var K = opts.kernel || (global.window && global.window.KernelOps) || null;
  if (!K) { global.window = global.window || { APP: {} }; require('./kernel_ops.js'); K = global.window.KernelOps; }
  if (global.window && !global.window.KernelOps) global.window.KernelOps = K;   // erp_key_epochs resolves the kernel via window
  if (!K || !K._contentHash || !K._isV2) throw new Error('erp_relay_server: gate needs KernelOps ≥ v11 (_contentHash/_isV2)');
  return { K: K, EP: require('./erp_key_epochs.js'), SIGN: require('./erp_snapshot_sign.js') };
}

function createRelayServer(opts) {
  opts = opts || {};
  var port = opts.port || 8140;
  var persistPath = opts.persistPath || null;
  var gated = !!opts.roster;
  var maxBody = opts.maxBody || (gated ? (1 << 20) : 5e7);   // OPEN keeps the original 50MB guard; gated: 1 MiB
  var maxOps  = opts.maxOps  || 500;                          // gated only (measured: a signed op is ~0.5 KB → 500 ≈ 250 KB)

  var log = [];                    // canonical ordered ops, each tagged with monotonic seq
  var seen = Object.create(null);  // op_uuid → true (idempotency set)

  // ── gate state (ROSTER mode only) ──
  var deps = gated ? _gateDeps(opts) : null;
  var pubByKid = null;                       // kid → pubJwk, from the VERIFIED roster (set in listen())
  var revoked = Object.create(null);         // kid → seq of the REVOKE that burned it (permanent)
  var superseded = Object.create(null);      // kid → seq of the ROTATE that retired it
  var failCache = new Map();                 // 'op_uuid|sig' → true  (bounded; success is cached by `seen`)
  var stats = { mode: gated ? 'ROSTER' : 'OPEN', devices: 0, verify_attempts: 0, verify_ms: 0,
                rejected_total: 0, rejected_requests: 0, reasons: {} };

  // ── boot: replay the durable JSONL so canonical order survives a restart ──
  if (persistPath && fs.existsSync(persistPath)) {
    fs.readFileSync(persistPath, 'utf8').split('\n').forEach(function (line) {
      if (!line.trim()) return;
      try { var op = JSON.parse(line); if (!seen[op.op_uuid]) { seen[op.op_uuid] = true; log.push(op); } } catch (e) {}
    });
    // re-number seq densely after replay (file is the source of truth for membership, seq is derived)
    log.forEach(function (op, i) { op.seq = i + 1; });
    console.log('§RELAY boot replayed=' + log.length + ' from ' + persistPath);
  }

  function _append(appended) {
    if (persistPath && appended.length) {
      // durable append BEFORE acknowledging (write-ahead): a crash after this still has the ops on disk
      fs.appendFileSync(persistPath, appended.map(function (o) { return JSON.stringify(o); }).join('\n') + '\n');
    }
  }

  // OPEN mode — the pre-gate _accept, unchanged (W-RELAY's contract: dedup by op_uuid + durable append).
  function _accept(ops) {
    var accepted = 0, skipped = 0, appended = [];
    (ops || []).forEach(function (op) {
      if (!op || !op.op_uuid) { skipped++; return; }
      if (seen[op.op_uuid]) { skipped++; return; }   // idempotent — never double-sequence
      seen[op.op_uuid] = true;
      var rec = JSON.parse(JSON.stringify(op)); rec.seq = log.length + 1;
      log.push(rec); appended.push(rec); accepted++;
    });
    _append(appended);
    return { accepted: accepted, skipped: skipped, head: log.length };
  }

  // ── ROSTER mode helpers ──
  function _params(op) { try { var p = JSON.parse(op.parameters); return (p && typeof p === 'object') ? p : null; } catch (e) { return null; } }
  function _admissible(kid) { return !!pubByKid[kid] && revoked[kid] == null && superseded[kid] == null; }
  // apply a control op's state effect at the seq it was admitted (also used on boot replay)
  function _applyControl(p, seq) {
    if (!p || !p.kind) return;
    if (p.kind === 'REVOKE' && p.revokedKid) revoked[p.revokedKid] = seq;
    else if (p.kind === 'ROTATE' && p.signed_by) superseded[p.signed_by] = seq;
  }
  function _rebuildControlState() {
    revoked = Object.create(null); superseded = Object.create(null);
    var applied = 0;
    log.forEach(function (op) {
      var p = _params(op); if (!p || !p.kind) return;
      if (!pubByKid[p.signed_by]) return;     // a device HQ dropped from the roster has its control ops voided
      _applyControl(p, op.seq); applied++;
    });
    return applied;
  }
  function _reject(reason) { stats.rejected_total++; stats.reasons[reason] = (stats.reasons[reason] || 0) + 1; return reason; }

  // L2 — shape: every field the later layers touch must be present and well-formed. No crypto, no lookups.
  function _shape(op) {
    if (!op || typeof op !== 'object') return 'shape';
    if (typeof op.op_uuid !== 'string' || !op.op_uuid || op.op_uuid.length > MAX_UUID) return 'shape';
    if (typeof op.parameters !== 'string') return 'shape';
    if (!deps.K._isV2(op.parameters)) return 'not_content_signed';      // v1 / unsigned rows: refused, never verified
    var p = _params(op); if (!p) return 'shape';
    if (typeof p.signed_by !== 'string' || !p.signed_by) return 'shape';
    if (typeof op.sig !== 'string' || !SIG_HEX.test(op.sig)) return 'shape';
    if (p.kind === 'ROTATE' && (typeof p.newKid !== 'string' || !p.newKid)) return 'shape';
    if (p.kind === 'REVOKE' && (typeof p.revokedKid !== 'string' || !p.revokedKid)) return 'shape';
    return null;
  }
  // L3 — roster: a map lookup. The signer must be a roster device that is neither revoked nor superseded; a
  // control op's target must be a roster device too (a REVOKE/ROTATE naming a stranger is meaningless).
  function _roster(p) {
    if (!pubByKid[p.signed_by]) return 'unknown_kid';
    if (revoked[p.signed_by] != null) return 'revoked_kid';
    if (superseded[p.signed_by] != null) return 'superseded_kid';
    if (p.kind === 'ROTATE' && (!pubByKid[p.newKid] || revoked[p.newKid] != null)) return 'rotate_target_not_admissible';
    if (p.kind === 'REVOKE' && !pubByKid[p.revokedKid]) return 'revoke_target_unknown';
    return null;
  }
  // L5 — ECDSA, last. The message is what the v2 sig attests (kernel_ops _sigBase): sha256('cs2|'+_canonicalV2).
  async function _verify(op, p) {
    var key = op.op_uuid + '|' + op.sig;
    if (failCache.has(key)) return false;                       // identical bad op: cached, no ECDSA
    var msg = await deps.K._contentHash(op);
    var t0 = Date.now();
    stats.verify_attempts++;
    var ok = await deps.SIGN.verifyTip(msg, op.sig, pubByKid[p.signed_by]);
    stats.verify_ms += Date.now() - t0;
    if (!ok) {
      if (failCache.size >= FAIL_CACHE_MAX) failCache.delete(failCache.keys().next().value);   // bounded — the cache must not become the DoS
      failCache.set(key, true);
    }
    return ok;
  }

  // ROSTER mode — the layered gate. Ops are processed in push order; a rejected op never touches log/disk.
  async function _admit(ops) {
    var accepted = 0, skipped = 0, rejected = 0, reasons = {}, appended = [];
    function rej(r) { rejected++; reasons[r] = (reasons[r] || 0) + 1; _reject(r); }
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      var s = _shape(op); if (s) { rej(s); continue; }                       // L2
      var p = _params(op);
      var r = _roster(p); if (r) { rej(r); continue; }                       // L3
      if (seen[op.op_uuid]) { skipped++; continue; }                         // L4 — idempotent, before any crypto
      if (!(await _verify(op, p))) { rej('bad_sig'); continue; }             // L5
      seen[op.op_uuid] = true;
      var rec = JSON.parse(JSON.stringify(op)); rec.seq = log.length + 1;
      log.push(rec); appended.push(rec); accepted++;
      _applyControl(p, rec.seq);                                             // REVOKE/ROTATE take effect from the NEXT op
    }
    _append(appended);
    return { accepted: accepted, skipped: skipped, rejected: rejected, reasons: reasons, head: log.length };
  }

  function _cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
  }
  function _send(res, code, obj) { _cors(res); res.statusCode = code; res.end(JSON.stringify(obj)); }
  function _auth() { return { mode: stats.mode, devices: stats.devices, verify_attempts: stats.verify_attempts,
    verify_ms: stats.verify_ms, rejected_total: stats.rejected_total, rejected_requests: stats.rejected_requests, reasons: stats.reasons }; }

  var server = http.createServer(function (req, res) {
    var u = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') { _cors(res); res.statusCode = 204; return res.end(); }

    if (req.method === 'GET' && u.pathname === '/health') return _send(res, 200, gated ? { ok: true, head: log.length, auth: _auth() } : { ok: true, head: log.length });
    if (req.method === 'GET' && u.pathname === '/head')   return _send(res, 200, { head: log.length });
    if (req.method === 'GET' && u.pathname === '/snapshot') {
      var after = Number(u.searchParams.get('after') || 0);
      return _send(res, 200, { ops: log.filter(function (o) { return o.seq > after; }), head: log.length });
    }
    if (req.method === 'POST' && u.pathname === '/push') {
      var body = '', done = false;
      function capTrip(what) {   // L1 — refuse BEFORE parsing; the body is discarded, nothing downstream runs
        if (done) return; done = true;
        stats.rejected_requests++; _reject(what);
        console.log('§RELAY push REFUSED ' + what + ' (cap) head=' + log.length);
        _send(res, 413, { error: what, head: log.length });
        req.destroy();
      }
      if (gated) {
        var cl = Number(req.headers['content-length']);
        if (cl > maxBody) return capTrip('body_too_large');
      }
      req.on('data', function (c) {
        body += c;
        if (body.length > maxBody) { if (gated) capTrip('body_too_large'); else req.destroy(); }   // OPEN: original 50MB guard, unchanged
      });
      req.on('end', function () {
        if (done) return;
        var ops; try { ops = JSON.parse(body || '{}').ops; } catch (e) { return _send(res, 400, { error: 'bad json' }); }
        if (!gated) {
          var r = _accept(ops);
          console.log('§RELAY push accepted=' + r.accepted + ' skipped=' + r.skipped + ' head=' + r.head);
          return _send(res, 200, r);
        }
        if (!Array.isArray(ops)) return _send(res, 400, { error: 'ops must be an array' });
        if (ops.length > maxOps) return capTrip('too_many_ops');
        _admit(ops).then(function (r) {
          var code = (r.rejected > 0 && r.accepted + r.skipped === 0) ? 403 : 200;
          if (code === 403) stats.rejected_requests++;
          console.log('§RELAY push accepted=' + r.accepted + ' skipped=' + r.skipped + ' rejected=' + r.rejected +
                      (r.rejected ? ' reasons=' + JSON.stringify(r.reasons) : '') + ' head=' + r.head + ' verify_attempts=' + stats.verify_attempts);
          _send(res, code, r);
        }, function (e) { _send(res, 500, { error: 'admit failed: ' + (e && e.message) }); });
      });
      return;
    }
    _send(res, 404, { error: 'not found' });
  });

  // listen — in ROSTER mode the roster is verified under the PINNED HQ key FIRST; an unverifiable roster is not a
  // gate, so the relay refuses to start rather than run open by accident.
  async function _arm() {
    if (!gated) { console.log('§RELAY_AUTH mode=OPEN — S-1 OPEN: /push admits anyone who reaches it (pass opts.roster to gate)'); return; }
    var rv = await deps.EP.verifyRoster(opts.roster, { hqPub: opts.hqPub });
    if (!rv.ok) throw new Error('erp_relay_server: roster refused — ' + rv.why);
    pubByKid = rv.roster.devices || {};
    stats.devices = Object.keys(pubByKid).length;
    var applied = _rebuildControlState();
    console.log('§RELAY_AUTH mode=ROSTER devices=' + stats.devices + ' control_ops_replayed=' + applied +
                ' revoked=' + Object.keys(revoked).length + ' superseded=' + Object.keys(superseded).length +
                ' caps body=' + maxBody + 'B ops=' + maxOps + ' verify=ECDSA-P256(content-hash) hq=' + (opts.hqPub ? 'explicit' : 'pinned'));
    if (stats.devices === 0) console.log('§RELAY_AUTH VACUOUS devices=0 — the gate rejects everything; this is not a working relay');
  }

  return {
    listen: function () {
      return _arm().then(function () {
        return new Promise(function (r) { server.listen(port, function () { console.log('§RELAY listening :' + port + (persistPath ? ' persist=' + persistPath : ' (in-memory)')); r(); }); });
      });
    },
    close:  function () { return new Promise(function (r) { server.close(function () { r(); }); }); },
    head:   function () { return log.length; },
    stats:  function () { return JSON.parse(JSON.stringify(_auth())); },   // W-RELAY-AUTH reads the counters in-process
    url:    'http://localhost:' + port
  };
}

if (typeof module !== 'undefined' && module.exports) { module.exports = { createRelayServer: createRelayServer }; }
