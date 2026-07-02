// ⚠ DO NOT REMOVE — POC witness for HISTORY_KNOB_SIGNAL_TAP.md
// Scope: prove the §-tap + knob mechanism reconstructs MEANINGFUL history from ONE log stream,
//        with ZERO history-specific wiring in the actions. Read the §-log output before concluding.
// Witness: W-TAP-KNOB. Proves/disproves: "can a dial-able net over the §-stream yield clean history
//          while a noise floor (errors/no-ops/render-ticks) is excluded?"
// Run: node build/erp/post_poc/history_tap_poc.js

'use strict';

// ── 1) THE SINK (this is the whole "logging refactor" — one function) ───────────────
//    Actions call S(tag,label,payload). It STILL prints the § line you debug with today,
//    AND feeds the tap. No event bus, no per-feature coupling.
const HistoryTap = makeTap();
function S(tag, label, payload) {
  console.log(`§EVT ${tag}|${label}`);   // ← unchanged debugging surface
  HistoryTap.feed(tag, label, payload);  // ← the clean stream history subscribes to
}

// ── 2) THE TAP + KNOB (the subscriber; couples to nothing feature-specific) ─────────
function makeTap() {
  // Named stops → which §-tags enter history. Pattern SETS, not a brittle whitelist of labels.
  const STOPS = {
    low:  new Set(['KERNEL_OP', 'BUILDING_OPEN']),                                  // milestones
    mid:  null,  // = low + navigation
    high: null,  // = mid + toggles/aids
    max:  null,  // = nearly all (deny-list still applies)
  };
  STOPS.mid  = new Set([...STOPS.low,  'FOCUS', 'PICK', 'PHASE_LENS', 'FILTER', 'ROOM']);
  STOPS.high = new Set([...STOPS.mid,  'KBD_ROUTE', 'XRAY', 'MAT_SELECT', 'DEPTH']);
  // Noise floor: even 'max' never records these (pure spam / not user intent).
  const DENY = new Set(['RENDER_TICK', 'IDLE_GATE', 'HOVER', 'PANEL_BLUR']);

  let level = 'mid';
  const all = [];                        // every fed event (so re-dialing re-filters, no data loss)

  return {
    setKnob(l) { level = l; },
    feed(tag, label, payload) {
      all.push({ tag, label, payload: payload || null });
    },
    // History = filter the captured stream by the current knob. Re-dialing is instant, lossless.
    history() {
      const passSet = level === 'max' ? null : STOPS[level];
      return all.filter(e =>
        !DENY.has(e.tag) &&
        !isNoiseLabel(e.label) &&                    // intra-tag noise (e.g. KBD_ROUTE "pass-through")
        (passSet === null || passSet.has(e.tag))
      );
    },
  };
}

// Real intra-tag noise observed in the census: same tag, but the line is internal routing/error,
// not a user action. The §EVT convention lets actions simply NOT emit these — but we defend anyway.
function isNoiseLabel(label) {
  return /pass-through|no-op|error|blocked|unregistered|drop key/i.test(label);
}

// ── 3) A REALISTIC SESSION ──────────────────────────────────────────────────────────
//    Mix of the 3 converted actions (x-ray / pick / focus) + a real edit + genuine noise.
//    Labels are shaped like the ACTUAL census lines so this tests real fragility.
function runSession() {
  S('BUILDING_OPEN', 'Duplex');
  S('PICK',      'Door D-204', { guid: '3xK..204' });
  S('FOCUS',     'level 3');
  S('KBD_ROUTE', 'Alt+X → ghost-xray', { xray: true });   // ← the toggle today's push() MISSES
  S('RENDER_TICK', 'frame 1408');                          // noise (deny)
  S('KBD_ROUTE', 'palette active, pass-through key=k');    // noise (intra-tag label)
  S('PICK',      'Window W-11', { guid: '3xK..W11' });
  S('PANEL_BLUR','no-op (none focused)');                  // noise (deny + label)
  S('KERNEL_OP', 'committed id=op_88 (grid move)', { reversible: true });
  S('KBD_ROUTE', 'Alt+Z → xray', { xray: true });
  S('PHASE_LENS','Structural only');
  S('KERNEL_OP', 'compact prune error: ENOSPC');           // noise (error, not an action)
  S('FILTER',    'discipline = MEP');
}

// ── 4) WITNESS ───────────────────────────────────────────────────────────────────────
console.log('\n──────── raw §EVT stream (what actions print) ────────');
runSession();

const render = (lvl) => {
  HistoryTap.setKnob(lvl);
  const h = HistoryTap.history();
  console.log(`\n§W-TAP-KNOB knob=${lvl} entries=${h.length}`);
  h.forEach((e, i) => console.log(`  ${i + 1}. ${e.label}${e.payload ? '   ⟲' : ''}`));
  return h.length;
};

console.log('\n──────── reconstructed history at each knob stop ────────');
const nLow  = render('low');
const nMid  = render('mid');
const nHigh = render('high');
const nMax  = render('max');

// Assertions that NAME what they prove.
console.log('\n──────── §ASSERT (each names the issue it proves) ────────');
const histHigh = (HistoryTap.setKnob('high'), HistoryTap.history());
const labels = histHigh.map(e => e.label);
const a1 = labels.includes('Alt+X → ghost-xray');                       // the X/C gap is closed
const a2 = !labels.some(l => /pass-through|no-op|error|frame/i.test(l)); // noise excluded
const a3 = nLow < nMid && nMid < nHigh && nHigh <= nMax;                // knob is monotonic & real
const a4 = histHigh.find(e => e.label.startsWith('committed'))?.payload?.reversible === true; // kernel tier keeps replay payload
console.log(`§ASSERT toggle-captured(X/C gap closed) = ${a1}`);
console.log(`§ASSERT noise-excluded                  = ${a2}`);
console.log(`§ASSERT knob-monotonic ${nLow}<${nMid}<${nHigh}<=${nMax}        = ${a3}`);
console.log(`§ASSERT kernel-payload-preserved        = ${a4}`);
console.log(`\n§W-TAP-KNOB VERDICT = ${a1 && a2 && a3 && a4 ? 'PASS' : 'FAIL'}`);
