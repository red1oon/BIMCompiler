// ⚠ DO NOT REMOVE — film 6 PROMO: how many frames of a beat pass before its voice may start (tsv.js, beatlen.js, flowcheck.js all use this one function). A typed beat: through its LAST Return key (K2: no voice over the typing). A beat that only moves the pointer: through the first pointer move and its ripple, the voice starts when the pointer HOLDS (F5: never inside a travel animation). A beat with neither: 0 (the strip lead of 0.8 s applies).
'use strict';
exports.lead = es => { let lastR = -1, firstPop = -1; es.forEach((e, i) => { if (e.key === 'r') lastR = i; if (e.kind === 'popup' && firstPop < 0) firstPop = i; });
  if (lastR >= 0) return es.slice(0, lastR + 1).reduce((s, e) => s + (e.frames || 0), 0); if (firstPop >= 0) return es.slice(0, firstPop).reduce((s, e) => s + (e.frames || 0), 0); return 0; };
exports.fixed = es => es.reduce((s, e) => s + (e.frames || 0), 0);
