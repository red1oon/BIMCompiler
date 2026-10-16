// ⚠ DO NOT REMOVE — Witness tests TB1-TB11 (type binding). Spec: docs/DXF2BIM_SPEC.md §38. Read the log (test_types.log) after every run; exit code is not evidence.
'use strict';
const path = require('path'), fs = require('fs');
const T = require(path.join(__dirname, '../../deploy/dev/dxf2types.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const lines = []; let fails = 0;
const check = (id, issue, ok, d) => { if (!ok) fails++; const l = (ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d; lines.push(l); console.log(l); };
const J = JSON.stringify;
const RUN = { op_type: 'DXF_RUN', params: { run_id: 'R' }, input_guids: [], output_guid: null };
const wall = (g, h, t, extra) => ({ op_type: 'DXF_WALL', params: Object.assign({ handle: h, thickness: t, length: 3 }, extra || {}), input_guids: [], output_guid: g });
const open = (g, h, cat, w, hh, extra) => ({ op_type: 'DXF_OPENING', params: Object.assign({ handle: h, kind: 'opening', category: cat, width: w, height: hh, depth: 0.2 }, extra || {}), input_guids: [], output_guid: g });
const LIB = { wall: [{ id: 'W200', thickness: 0.2 }, { id: 'W100', thickness: 0.1 }], window: [{ id: 'WIN_A', width: 0.9, height: 1.2 }, { id: 'WIN_B', width: 0.9, height: 1.5 }, { id: 'WIN_C', width: 1.5, height: 1.2 }], door: [{ id: 'D90', width: 0.9, height: 2.1 }] };
const CFG = { bind: { size_tol: 0.005 } };
const gaps = (r, c) => r.gaps.filter(g => g.params.code === c), typ = (r, g) => r.ops.find(o => o.output_guid === g).params;

// TB1 explicit binding wins over label and size
{ const ops = [RUN, wall('w1', 'H1', 0.2, { label: 'W100' })];
  const r = T.bindTypes(ops, LIB, CFG, { bindings: [{ select: { handle: 'H1' }, type_id: 'W200' }] });
  check('TB1', 'explicit binding did not win over label/size', typ(r, 'w1').type.type_id === 'W200' && typ(r, 'w1').type.bind_source === 'explicit', J(typ(r, 'w1').type)); }
// TB2 label hit (size alone would be unbound: 0.15 matches nothing)
{ const r = T.bindTypes([RUN, wall('w1', 'H1', 0.15, { label: 'W100' })], LIB, { bind: { size_tol: 0.06 } }, {});
  check('TB2', 'label match not used', typ(r, 'w1').type && typ(r, 'w1').type.bind_source === 'label' && typ(r, 'w1').type.type_id === 'W100', J(typ(r, 'w1').type)); }
// TB3 size hit, exactly one candidate
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'door', 0.9, 2.1)], LIB, CFG, {});
  check('TB3', 'unique size candidate not bound', typ(r, 'o1').type && typ(r, 'o1').type.type_id === 'D90' && typ(r, 'o1').type.bind_source === 'size', J(typ(r, 'o1').type)); }
// TB4 two candidates in tolerance -> unbound, both listed (silent nearest pick)
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'window', 0.9, 1.35)], LIB, { bind: { size_tol: 0.2 } }, {});
  const g = gaps(r, 'GAP:type_unbound');
  check('TB4', 'ambiguous size picked a type silently', !typ(r, 'o1').type && g.length === 1 && J(g[0].params.candidates) === J(['WIN_A', 'WIN_B']), J(g.map(x => x.params.candidates))); }
// TB5 zero candidates
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'window', 3, 3)], LIB, CFG, {});
  const g = gaps(r, 'GAP:type_unbound');
  check('TB5', 'no-candidate element bound or lost without a gap', !typ(r, 'o1').type && g.length === 1 && g[0].params.candidates.length === 0, J(g.map(x => x.params))); }
// TB6 beyond tolerance via explicit bind: mismatch gap, geometry keeps measured value
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'window', 0.9, 1.98)], LIB, CFG, { bindings: [{ select: { handle: 'G1' }, type_id: 'WIN_A' }] });
  const g = gaps(r, 'GAP:type_size_mismatch'), p = typ(r, 'o1');
  check('TB6', 'library value overwrote the drawing or mismatch hidden', g.length === 1 && p.height === 1.98 && p.type.delta.height === 0.78 && p.type.delta.width === 0, J(g.map(x => x.params.delta)) + ' height=' + p.height); }
// TB7 schedule conflict reported with both numbers (Farmhouse: 60 in = 1.524 vs 78 in = 1.9812)
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'window', 0.8, 1.9812, { label: '1' })], LIB, CFG, { schedule: { '1': { width: 0.8, height: 1.524 } } });
  const g = gaps(r, 'GAP:schedule_conflict');
  check('TB7', 'schedule vs drawing conflict not reported', g.length === 1 && J(g[0].params.diff) === J({ height: { schedule: 1.524, measured: 1.9812 } }), J(g.map(x => x.params.diff))); }
// TB8 layer sum mismatch refuses
{ const lib = { wall: [{ id: 'WL', thickness: 0.2, layers: [{ material: 'a', thickness: 0.1 }, { material: 'b', thickness: 0.05 }] }] };
  const r = T.bindTypes([RUN, wall('w1', 'H1', 0.2)], lib, CFG, {});
  const g = gaps(r, 'GAP:layers_sum_mismatch');
  check('TB8', 'wall type bound although its layers do not add up to the measured thickness', !typ(r, 'w1').type && g.length === 1 && g[0].params.layers_sum === 0.15, J(g.map(x => x.params))); }
// TB9 order independence and determinism (canonical order = sort by op_type+guid/code)
{ const ops = [RUN, wall('w1', 'H1', 0.2), wall('w2', 'H2', 0.1), open('o1', 'G1', 'door', 0.9, 2.1), open('o2', 'G2', 'window', 3, 3)];
  const key = o => o.op_type + '|' + (o.output_guid || '') + '|' + (o.params.code || ''), canon = r => J(r.ops.slice().sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
  const base = canon(T.bindTypes(ops, LIB, CFG, {}));
  let ok = true, first = null; for (let i = 0; i < 20; i++) { const sh = ops.slice().sort(() => Math.random() - 0.5); const c = canon(T.bindTypes(sh, LIB, CFG, {})); if (c !== base) { ok = false; first = first || i; } }
  check('TB9', 'result depends on op order or run', ok && J(T.bindTypes(ops, LIB, CFG, {})) === J(T.bindTypes(ops, LIB, CFG, {})), '20 shuffles + repeat' + (ok ? '' : ' first diff at shuffle ' + first)); }
// TB10 missing size_tol -> no_dimension, nothing bound
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'door', 0.9, 2.1)], LIB, {}, {});
  check('TB10', 'size_tol defaulted instead of reported', !typ(r, 'o1').type && gaps(r, 'GAP:no_dimension').length === 1 && gaps(r, 'GAP:no_dimension')[0].params.need === 'bind.size_tol', J(r.gaps.map(g => g.params.code))); }
// TB11 clean line: input ops untouched; outline fields identical after binding; library not needed for the outline
{ const ops = [RUN, wall('w1', 'H1', 0.2), open('o1', 'G1', 'door', 0.9, 2.1)], before = J(ops);
  const r = T.bindTypes(ops, LIB, CFG, {});
  const strip = o => { const p = Object.assign({}, o.params); delete p.type; delete p.type_request; return J({ t: o.op_type, p: p, g: o.output_guid }); };
  check('TB11', 'binding changed the 2D→3D outline or mutated its input', J(ops) === before && r.ops.slice(0, 3).map(strip).join() === ops.map(strip).join(), 'input intact, outline fields equal'); }
// TB12 explicit binding to an id not in the library, and two conflicting bindings
{ const r1 = T.bindTypes([RUN, wall('w1', 'H1', 0.2)], LIB, CFG, { bindings: [{ select: { handle: 'H1' }, type_id: 'NOPE' }] });
  const r2 = T.bindTypes([RUN, wall('w1', 'H1', 0.2)], LIB, CFG, { bindings: [{ select: { handle: 'H1' }, type_id: 'W200' }, { select: { guid: 'w1' }, type_id: 'W100' }] });
  check('TB12', 'unknown or conflicting explicit binding accepted silently', gaps(r1, 'GAP:type_unknown').length === 1 && !typ(r1, 'w1').type && gaps(r2, 'GAP:type_binding_conflict').length === 1 && !typ(r2, 'w1').type, 'unknown=' + gaps(r1, 'GAP:type_unknown').length + ' conflict=' + gaps(r2, 'GAP:type_binding_conflict').length); }
// TB13 class separation: a door sized like a library window must not bind to the window
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'door', 0.9, 1.2)], LIB, CFG, {});
  check('TB13', 'element bound to a type of another class', !typ(r, 'o1').type && gaps(r, 'GAP:type_unbound').length === 1, J(gaps(r, 'GAP:type_unbound').map(g => g.params.candidates))); }
// TB14 missing measured dimension: no half match (door height unknown must not bind on width alone)
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'door', 0.9, undefined)], LIB, CFG, {});
  const g = gaps(r, 'GAP:type_request_incomplete');
  check('TB14', 'element with a missing dimension was matched on the rest', !typ(r, 'o1').type && g.length === 1 && J(g[0].params.missing) === '["height"]' && gaps(r, 'GAP:type_unbound').length === 0, J(g.map(x => x.params.missing))); }
// TB15-TB20 preferred set (SPEC §42)
const SL = { window: [{ id: 'NOM_A', set: 'NOMINAL', width: 0.9, height: 1.2 }, { id: 'BBX_A', set: 'BBOX', width: 0.9, height: 1.2 }, { id: 'NOM_B', set: 'NOMINAL', width: 0.9, height: 1.5 }, { id: 'BBX_B', set: 'BBOX', width: 0.9, height: 1.5 }, { id: 'LONE', set: 'BBOX', width: 2, height: 2 }] };
const PC = pref => ({ bind: { size_tol: 0.005, prefer: pref } }), W = (w, h) => [RUN, open('o1', 'G1', 'window', w, h)];
{ const r = T.bindTypes(W(0.9, 1.2), SL, PC(['NOMINAL']), {}), t = typ(r, 'o1').type;
  check('TB15', 'preferred set did not break a same-size tie (or hid the other candidate)', !!t && t.type_id === 'NOM_A' && t.bind_source === 'size_prefer' && J(t.preferred_over) === '["BBX_A"]' && t.set === 'NOMINAL', J(t)); }
{ const lib = { window: [{ id: 'N1', set: 'NOMINAL', width: 0.9, height: 1.2 }, { id: 'N2', set: 'NOMINAL', width: 0.9, height: 1.2 }, { id: 'B1', set: 'BBOX', width: 0.9, height: 1.2 }] };
  const r = T.bindTypes(W(0.9, 1.2), lib, PC(['NOMINAL']), {}), g = gaps(r, 'GAP:type_unbound')[0];
  check('TB16', 'two candidates in the preferred set were resolved by guessing', !typ(r, 'o1').type && !!g && J(g.params.prefer_narrowed) === '["N1","N2"]' && J(g.params.candidates) === '["B1","N1","N2"]', g ? J(g.params) : 'no gap'); }
{ const r = T.bindTypes(W(2, 2), SL, PC(['NOMINAL']), {}), t = typ(r, 'o1').type;
  check('TB17', 'a single candidate outside the preferred set was refused or relabelled', !!t && t.type_id === 'LONE' && t.bind_source === 'size', J(t)); }
{ const r = T.bindTypes([RUN, open('o1', 'G1', 'window', 0.9, 1.2)], SL, PC(['NOMINAL']), { bindings: [{ select: { handle: 'G1' }, type_id: 'BBX_A' }] }), t = typ(r, 'o1').type;
  check('TB18', 'prefer overrode an explicit binding', !!t && t.type_id === 'BBX_A' && t.bind_source === 'explicit', J(t)); }
{ const a = typ(T.bindTypes(W(0.9, 1.2), SL, PC(['BBOX', 'NOMINAL']), {}), 'o1').type, b = typ(T.bindTypes(W(0.9, 1.2), SL, PC(['NOMINAL', 'BBOX']), {}), 'o1').type;
  check('TB19', 'order of the prefer list does not decide', a.type_id === 'BBX_A' && b.type_id === 'NOM_A', a.type_id + ' / ' + b.type_id); }
{ const r = T.bindTypes(W(0.9, 1.35), SL, PC(['NOMINAL']), {});
  check('TB20', 'prefer rescued a size mismatch', !typ(r, 'o1').type && gaps(r, 'GAP:type_unbound').length === 1 && gaps(r, 'GAP:type_unbound')[0].params.candidates.length === 0, J(gaps(r, 'GAP:type_unbound').map(g => g.params.candidates))); }
// ---- LB1-LB11 labels and schedules (SPEC §44) ----
const mk = (raw, x, y, h) => ({ raw: raw, x: x || 0, y: y || 0, handle: h || '1' });
const desc = list => MK.describe(list.map((r, i) => mk(r[0], r[1], r[2], (i + 1).toString(16))));
const PL = u => [['@VIEW=PLAN'], ['@UNITS=' + u]];
const WIN = (g, x0, y0, x1, y1, extra) => open(g, g.toUpperCase(), 'window', x1 - x0, y1 - y0, Object.assign({ bbox: [x0, y0, x1, y1] }, extra || {}));
const SNAP = { snap_tol: 0.001 }, lbl = (r, g) => r.ops.find(o => o.output_guid === g).params.label;
// LB1 parse
{ const d1 = desc(PL('mm').concat([['@LABEL=window,500,300,DUPLEX_CASEMENT'], ['@LABEL=door,100,100,D, flush'], ['@SCHEDULE=1,window,762,1524'], ['@SCHEDULE=W2,wall,200'], ['@LABEL=window,500,300,DUPLEX_CASEMENT']]));
  const bad = ['@LABEL=gate,1,1,x', '@LABEL=window,1,1', '@LABEL=window,a,1,x', '@LABEL=window,1,,x', '@SCHEDULE=1,window,762', '@SCHEDULE=1,wall,1,2', '@SCHEDULE=,window,1,2'].map(r => desc(PL('mm').concat([[r]])).errors.some(e => e.code === 'MARK:malformed'));
  const c1 = desc(PL('mm').concat([['@LABEL=window,5,5,A'], ['@LABEL=window,5,5,B']])).errors.some(e => e.code === 'MARK:conflict'), c2 = desc(PL('mm').concat([['@SCHEDULE=1,window,1,2'], ['@SCHEDULE=1,window,1,3']])).errors.some(e => e.code === 'MARK:conflict');
  check('LB1', 'label/schedule markings read wrongly, accepted when malformed or conflicting, or duplicates not merged', J(d1.desc.labels.map(l => l.text)) === '["D, flush","DUPLEX_CASEMENT"]' && d1.desc.schedule.length === 2 && d1.desc.labels.length === 2 && !d1.errors.filter(e => e.code !== 'MARK:missing').length && bad.every(Boolean) && c1 && c2, 'labels=' + J(d1.desc.labels.map(l => l.text)) + ' malformed rejected=' + bad.filter(Boolean).length + '/7 conflicts=' + c1 + ',' + c2); }
// LB2 lands on exactly the window it points into
{ const ops = [RUN, WIN('w1', 0, 0, 1, 0.2), WIN('w2', 2, 0, 3, 0.2)], r = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=window,2.5,0.1,X']])).desc, MK.UNITS, SNAP);
  check('LB2', 'label landed on the wrong element or on several', lbl(r, 'w2') === 'X' && lbl(r, 'w1') === undefined && r.labelled === 1 && !r.gaps.length, 'w1=' + lbl(r, 'w1') + ' w2=' + lbl(r, 'w2')); }
// LB3 no element
{ const r = T.applyLabels([RUN, WIN('w1', 0, 0, 1, 0.2)], desc(PL('m').concat([['@LABEL=window,5,5,X']])).desc, MK.UNITS, SNAP);
  check('LB3', 'a label pointing at nothing was silently dropped or forced onto an element', lbl(r, 'w1') === undefined && r.gaps.length === 1 && r.gaps[0].params.code === 'GAP:label_unmatched', J(r.gaps.map(g => g.params.code))); }
// LB4 two overlapping elements
{ const ops = [RUN, WIN('w1', 0, 0, 1, 0.2), WIN('w2', 0.5, 0, 1.5, 0.2)], r = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=window,0.75,0.1,X']])).desc, MK.UNITS, SNAP);
  check('LB4', 'ambiguous label point labelled one of several elements', lbl(r, 'w1') === undefined && lbl(r, 'w2') === undefined && r.gaps.length === 1 && r.gaps[0].params.code === 'GAP:label_ambiguous' && J(r.gaps[0].params.guids) === '["w1","w2"]', J(r.gaps.map(g => g.params.code))); }
// LB5 door by hinge disc; a window at the same point is not a door
{ const dr = open('d1', 'D1', 'door', 0.9, 2.1, { hinge: [1, 1] }), ops = [RUN, dr, WIN('w1', 0.9, 0.9, 1.1, 1.1)];
  const r = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=door,1.5,1,DD']])).desc, MK.UNITS, SNAP), r2 = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=door,3,3,DD']])).desc, MK.UNITS, SNAP);
  check('LB5', 'door label outside its swing disc accepted, or class not respected', lbl(r, 'd1') === 'DD' && lbl(r, 'w1') === undefined && r2.gaps.length === 1 && r2.gaps[0].params.code === 'GAP:label_unmatched', 'inside=' + lbl(r, 'd1') + ' outside gaps=' + J(r2.gaps.map(g => g.params.code))); }
// LB6 unit independence: 500 mm == 19.685039 in
{ const ops = [RUN, WIN('w1', 0.4, 0, 0.6, 0.2), WIN('w2', 2, 0, 3, 0.2)];
  const a = T.applyLabels(ops, desc(PL('mm').concat([['@LABEL=window,500,100,X']])).desc, MK.UNITS, SNAP), b = T.applyLabels(ops, desc(PL('in').concat([['@LABEL=window,19.6850394,3.9370079,X']])).desc, MK.UNITS, SNAP);
  check('LB6', 'label point changed element with the drawing units', lbl(a, 'w1') === 'X' && lbl(b, 'w1') === 'X' && lbl(a, 'w2') === undefined && lbl(b, 'w2') === undefined, 'mm→' + lbl(a, 'w1') + ' in→' + lbl(b, 'w1')); }
// LB7 end to end: two same-size products of one set told apart by the label (Duplex 819x759)
{ const lib = { window: [{ id: 'SMALL_FIXED', set: 'NOM', width: 0.819, height: 0.759 }, { id: 'CASEMENT', set: 'NOM', width: 0.819, height: 0.759 }] };
  const ops = [RUN, WIN('w1', 0, 0, 0.819, 0.2, { height: 0.759 }), WIN('w2', 2, 0, 2.819, 0.2, { height: 0.759 })];
  const before = T.bindTypes(ops, lib, PC(['NOM']), {}), l = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=window,0.4,0.1,CASEMENT']])).desc, MK.UNITS, SNAP), after = T.bindTypes(l.ops.filter(o => o.op_type !== 'DXF_GAP'), lib, PC(['NOM']), {});
  check('LB7', 'label did not separate two same-size products, or the unlabelled one was bound by guess', !typ(before, 'w1').type && typ(after, 'w1').type && typ(after, 'w1').type.type_id === 'CASEMENT' && typ(after, 'w1').type.bind_source === 'label' && !typ(after, 'w2').type && gaps(after, 'GAP:type_unbound').length === 1, 'w1=' + J(typ(after, 'w1').type) + ' w2 bound=' + !!typ(after, 'w2').type); }
// LB8 schedule 60 in vs measured 78 in, through inches
{ const d = desc(PL('in').concat([['@SCHEDULE=1,window,30,60'], ['@LABEL=window,5,5,1']])).desc, sch = T.scheduleFromDesc(d, MK.UNITS);
  const ops = [RUN, WIN('w1', 0, 0, 0.762, 0.2, { height: 1.9812 })], inch = 0.0254;
  const l = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=window,0.3,0.1,1']])).desc, MK.UNITS, SNAP), r = T.bindTypes(l.ops, { window: [] }, CFG, { schedule: sch }), g = gaps(r, 'GAP:schedule_conflict');
  check('LB8', 'schedule vs measured conflict missed or reported in the wrong unit', sch['1'].height === 1.524 && sch['1'].width === 0.762 && g.length === 1 && J(g[0].params.diff) === J({ height: { schedule: 1.524, measured: 1.9812 } }), 'schedule(m)=' + J(sch['1']) + ' diff=' + J(g.map(x => x.params.diff))); }
// LB9 element already carries a different label
{ const r = T.applyLabels([RUN, WIN('w1', 0, 0, 1, 0.2, { label: 'OLD' })], desc(PL('m').concat([['@LABEL=window,0.5,0.1,NEW']])).desc, MK.UNITS, SNAP);
  check('LB9', 'an existing label was overwritten', lbl(r, 'w1') === 'OLD' && r.gaps.length === 1 && r.gaps[0].params.code === 'GAP:label_conflict', J(r.gaps.map(g => g.params.code)) + ' label=' + lbl(r, 'w1')); }
// LB10 order independence of markers and ops
{ const marks = [['@LABEL=window,0.5,0.1,A'], ['@LABEL=window,2.5,0.1,B'], ['@LABEL=window,9,9,C']], ops = [RUN, WIN('w1', 0, 0, 1, 0.2), WIN('w2', 2, 0, 3, 0.2)];
  const canon = r => J(r.ops.slice().sort((a, b) => (a.op_type + (a.output_guid || '') + (a.params.code || '') + J(a.params.point || '')) < (b.op_type + (b.output_guid || '') + (b.params.code || '') + J(b.params.point || '')) ? -1 : 1));
  const base = canon(T.applyLabels(ops, desc(PL('m').concat(marks)).desc, MK.UNITS, SNAP)); let ok = true;
  for (let i = 0; i < 20; i++) { const m2 = marks.slice().sort(() => Math.random() - 0.5), o2 = ops.slice().sort(() => Math.random() - 0.5); if (canon(T.applyLabels(o2, desc(PL('m').concat(m2)).desc, MK.UNITS, SNAP)) !== base) ok = false; }
  check('LB10', 'labelling depends on marker or op order', ok, '20 shuffles'); }
// LB11 schedule entry of another class is ignored
{ const r = T.bindTypes([RUN, WIN('w1', 0, 0, 1, 0.2, { height: 1.2, label: '1' })], { window: [] }, CFG, { schedule: { '1': { class: 'door', width: 5, height: 5 } } });
  check('LB11', 'a door schedule entry produced a conflict on a window', gaps(r, 'GAP:schedule_conflict').length === 0, 'conflicts=' + gaps(r, 'GAP:schedule_conflict').length); }
// LB12 class separation: a window sits inside its wall's footprint; a wall label there must reach the wall only, a window label the window only
{ const ops = [RUN, wall('wl', 'W1', 0.2, { rect: [0, 0, 4, 0.2] }), WIN('w1', 1, 0, 2, 0.2)];
  const a = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=wall,1.5,0.1,WT']])).desc, MK.UNITS, SNAP), b = T.applyLabels(ops, desc(PL('m').concat([['@LABEL=window,1.5,0.1,WN']])).desc, MK.UNITS, SNAP);
  check('LB12', 'label reached an element of another class (window inside wall footprint)', lbl(a, 'wl') === 'WT' && lbl(a, 'w1') === undefined && !a.gaps.length && lbl(b, 'w1') === 'WN' && lbl(b, 'wl') === undefined && !b.gaps.length, 'wall label→wall=' + lbl(a, 'wl') + ' window=' + lbl(a, 'w1') + ' | window label→window=' + lbl(b, 'w1') + ' wall=' + lbl(b, 'wl')); }
// LB13-LB15 z-qualified labels (SPEC §44 L1b): stacked windows share one plan footprint
const STK = (extra) => [RUN, WIN('s1', 0, 0, 0.8, 0.4, { sill: 0.1, height: 0.75 }), WIN('s2', 0, 0, 0.8, 0.4, { sill: 0.9, height: 0.75 }), WIN('s3', 0, 0, 0.8, 0.4, { sill: 1.7, height: 0.75 })];
{ const lv = 3.1, l = (z) => T.applyLabels(STK(), desc(PL('m').concat([['@LABEL=window,0.4,0.2,z=' + z + ',MID']])).desc, MK.UNITS, { snap_tol: 0.001, level: lv });
  const a = l(4.3), b = l(3.3), noz = T.applyLabels(STK(), desc(PL('m').concat([['@LABEL=window,0.4,0.2,MID']])).desc, MK.UNITS, SNAP);
  check('LB13', 'z did not pick exactly one of three stacked windows, or a plan point alone labelled one of them', lbl(a, 's2') === 'MID' && lbl(a, 's1') === undefined && lbl(a, 's3') === undefined && lbl(b, 's1') === 'MID' && lbl(b, 's2') === undefined && noz.gaps.length === 1 && noz.gaps[0].params.code === 'GAP:label_ambiguous' && J(noz.gaps[0].params.guids) === '["s1","s2","s3"]', 'z=4.3→' + ['s1', 's2', 's3'].map(g => lbl(a, g)) + ' z=3.3→' + ['s1', 's2', 's3'].map(g => lbl(b, g)) + ' no z gaps=' + J(noz.gaps.map(g => g.params.code))); }
{ const r = T.applyLabels(STK(), desc(PL('m').concat([['@LABEL=window,0.4,0.2,z=9,MID']])).desc, MK.UNITS, { snap_tol: 0.001, level: 3.1 }), r2 = T.applyLabels(STK(), desc(PL('m').concat([['@LABEL=window,0.4,0.2,z=4.3,MID']])).desc, MK.UNITS, SNAP);
  check('LB14', 'z outside every interval labelled something, or a z label without level was applied', r.gaps.length === 1 && r.gaps[0].params.code === 'GAP:label_unmatched' && r.labelled === 0 && r2.gaps.length === 1 && r2.gaps[0].params.code === 'GAP:no_dimension' && r2.labelled === 0, J(r.gaps.map(g => g.params.code)) + ' / no level: ' + J(r2.gaps.map(g => g.params.code))); }
{ const d = desc(PL('m').concat([['@LABEL=window,1,1,z=2.5,A'], ['@LABEL=window,1,1,z=3.5,B'], ['@LABEL=window,1,1,C'], ['@LABEL=window,1,1,z=2.5,A']]));
  const bad = ['@LABEL=window,1,1,z=abc,X', '@LABEL=window,1,1,z=,X', '@LABEL=window,1,1,z=2'].map(r => desc(PL('m').concat([[r]])).errors.some(e => e.code === 'MARK:malformed'));
  const conf = desc(PL('m').concat([['@LABEL=window,1,1,z=2.5,A'], ['@LABEL=window,1,1,z=2.5,B']])).errors.some(e => e.code === 'MARK:conflict');
  check('LB15', 'z field parsed wrongly: same point different z merged, bad z accepted, or same z+point conflict missed', d.desc.labels.length === 3 && J(d.desc.labels.map(q => q.z)) === J([undefined, 2.5, 3.5]) && bad.every(Boolean) && conf, 'labels=' + J(d.desc.labels.map(q => q.text + '@' + q.z)) + ' bad rejected=' + bad.filter(Boolean).length + '/3 conflict=' + conf); }
// LB16 a door classified from a drawn gap has a bbox but no hinge: the label point inside its bbox must reach it (Farmhouse, SPEC §55)
{ const dg = open('dg', 'DG', 'door', 0.9525, 2.1336, { bbox: [1, 0, 1.9525, 0.0889] }), r = T.applyLabels([RUN, dg, WIN('w1', 3, 0, 4, 0.2)], desc(PL('m').concat([['@LABEL=door,1.5,0.04,A']])).desc, MK.UNITS, SNAP), r2 = T.applyLabels([RUN, dg], desc(PL('m').concat([['@LABEL=door,2.5,0.04,A']])).desc, MK.UNITS, SNAP);
  check('LB16', 'a door without hinge (gap-classified) could not be labelled by a point in its bbox, or a point outside it was accepted', lbl(r, 'dg') === 'A' && !r.gaps.length && r2.gaps.length === 1 && r2.gaps[0].params.code === 'GAP:label_unmatched', 'inside=' + lbl(r, 'dg') + ' outside gaps=' + J(r2.gaps.map(g => g.params.code))); }
// ---- AL1-AL6 schedule allowance (SPEC §57) ----
const AWIN = (w, h) => [RUN, WIN('w1', 0, 0, w, 0.2, { height: h, label: '1' })];
const SCH = { '1': { class: 'window', width: 0.762, height: 1.524 } }, ACFG = { bind: { size_tol: 0.005 } }, confl = r => gaps(r, 'GAP:schedule_conflict');
{ const d1 = desc(PL('in').concat([['@ALLOWANCE=window,1.5,0'], ['@ALLOWANCE=door,1.5,0'], ['@ALLOWANCE=window,1.5,0']]));
  const bad = ['@ALLOWANCE=gate,1,1', '@ALLOWANCE=window,1', '@ALLOWANCE=window,a,1', '@ALLOWANCE=window,1,'].map(r => desc(PL('in').concat([[r]])).errors.some(e => e.code === 'MARK:malformed'));
  const conf = desc(PL('in').concat([['@ALLOWANCE=window,1.5,0'], ['@ALLOWANCE=window,2,0']])).errors.some(e => e.code === 'MARK:conflict');
  check('AL1', 'allowance marking parsed wrongly, accepted when malformed, or conflict missed', J(d1.desc.allowance) === '{"window":{"w":1.5,"h":0},"door":{"w":1.5,"h":0}}' && !d1.errors.filter(e => e.code !== 'MARK:missing').length && bad.every(Boolean) && conf, 'allowance=' + J(d1.desc.allowance) + ' malformed rejected=' + bad.filter(Boolean).length + '/4 conflict=' + conf); }
// AL2/AL3: schedule 30x60 in; measured 31.5 wide (30 + 1.5) and 60 high
{ const al = { window: { width: 0.0381, height: 0 } }, ok = T.bindTypes(AWIN(0.8001, 1.524), { window: [] }, ACFG, { schedule: SCH, allowance: al }), off = T.bindTypes(AWIN(0.8001 + 0.01, 1.524), { window: [] }, ACFG, { schedule: SCH, allowance: al });
  check('AL2', 'a measured size equal to schedule + allowance was reported as a conflict', confl(ok).length === 0, 'conflicts=' + confl(ok).length);
  check('AL3', 'a measured size beyond tolerance from schedule + allowance was not reported, or the diff lacks schedule/allowance/measured', confl(off).length === 1 && J(confl(off)[0].params.diff) === J({ width: { schedule: 0.762, measured: 0.8101, allowance: 0.0381 } }), J(confl(off).map(g => g.params.diff))); }
// AL4 a door allowance must not be applied to a window
{ const r = T.bindTypes(AWIN(0.8001, 1.524), { window: [] }, ACFG, { schedule: SCH, allowance: { door: { width: 0.0381, height: 0 } } });
  check('AL4', 'a door allowance excused a window conflict', confl(r).length === 1 && J(Object.keys(confl(r)[0].params.diff)) === '["width"]', J(confl(r).map(g => g.params.diff))); }
// AL5 inches → metres through the marking
{ const d = desc(PL('in').concat([['@ALLOWANCE=window,1.5,0.5']])).desc, a = T.allowanceFromDesc(d, MK.UNITS);
  check('AL5', 'allowance in inches not converted to metres', a.window.width === 0.0381 && a.window.height === 0.0127 && !a.door, J(a)); }
// AL6 no allowance → exactly as before; height allowance applies only to height
{ const a = T.bindTypes(AWIN(0.8001, 1.9812), { window: [] }, ACFG, { schedule: SCH }), b = T.bindTypes(AWIN(0.8001, 1.9812), { window: [] }, ACFG, { schedule: SCH, allowance: { window: { width: 0.0381, height: 0 } } });
  check('AL6', 'without allowance the conflicts changed, or a width allowance hid the height conflict', J(Object.keys(confl(a)[0].params.diff)) === '["width","height"]' && J(Object.keys(confl(b)[0].params.diff)) === '["height"]' && confl(b)[0].params.diff.height.allowance === 0, J(confl(a).map(g => Object.keys(g.params.diff))) + ' / ' + J(confl(b).map(g => g.params.diff))); }
console.log('SUMMARY fail=' + fails); lines.push('SUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_types.log'), lines.join('\n') + '\n');
