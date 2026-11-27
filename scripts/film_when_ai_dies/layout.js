// ⚠ DO NOT REMOVE — film "When AI Dies": the geometry shared by cards.js (which cuts the pictures) and guard.js (which checks every cut lies inside its picture). Source px of the 1440x900 VS Code stills.
'use strict';
const SC = 1920 / 1440, TOP = 250, BAR = 30, MH = 610;
const erpBand = tip => { const ZE = 1.5, x0 = Math.max(0, Math.min(1920 - 1920 / ZE, Math.round(tip.x + tip.w / 2 - 1920 / ZE / 2))), cy = tip.y + tip.h / 2, y0 = Math.max(0, Math.min(1080 - MH / ZE, Math.round(cy - MH / ZE / 2))); return { x0, y0, zoom: ZE, w: 1920 / ZE, h: MH / ZE }; };
module.exports = { erpBand, SC, TOP, BAR, MH, CROP: { before: 46, q1_refs: 290, q3_hover: 160, q4_warn: 200, q5_idle: 443, q5_checking: 443, q5_ready: 443, q5_written: 443, passenger: 40 }, TOPCROP: { q2_line: 360, q5_written: 190 }, WIN: { w: 1440, h: 900 } };
