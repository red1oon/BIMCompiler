// ⚠ DO NOT REMOVE — Witness tests TG1-TG11 (tags: canned labels placed on the drawing). Spec: docs/DXF2BIM_SPEC.md §52. Read test_tags.log after every run; exit code is not evidence.
'use strict';
const path = require('path'), fs = require('fs');
const T = require(path.join(__dirname, '../../deploy/dev/dxf2types.js')), MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const lines = []; let fails = 0; const J = JSON.stringify;
const check = (id, issue, ok, d) => { if (!ok) fails++; const l = (ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d; lines.push(l); console.log(l); };
const RUN = { op_type: 'DXF_RUN', params: { run_id: 'R' }, input_guids: [], output_guid: null };
const win = (g, x0, y0, x1, y1, extra) => ({ op_type: 'DXF_OPENING', params: Object.assign({ handle: g.toUpperCase(), kind: 'window', width: x1 - x0, height: 0.75, sill: 0.1, depth: y1 - y0, bbox: [x0, y0, x1, y1], face: 'minY' }, extra || {}), input_guids: [], output_guid: g });
const mk = (raw, x, y, h) => ({ raw: raw, x: x || 0, y: y || 0, handle: h });
const desc = list => MK.describe(list.map((r, i) => mk(r[0], r[1], r[2], (i + 1).toString(16))));
const PLAN = [['@VIEW=PLAN'], ['@UNITS=mm'], ['@LEVEL=3.1'], ['@GRIDX=A', 0, 0], ['@GRIDX=B', 5000, 0], ['@GRIDY=1', 0, 0], ['@GRIDY=2', 0, 4000]];
const ELEVM = [['@VIEW=ELEV'], ['@FACE=minY'], ['@HAXIS=+X'], ['@UNITS=mm'], ['@GRIDH=A', 0, 0], ['@GRIDH=B', 5000, 0], ['@Z=0', 0, 0], ['@Z=3', 0, 3000]];
const planDesc = extra => desc(PLAN.concat(extra)).desc, elevDesc = extra => desc(ELEVM.concat(extra)).desc;
const MAP = (() => { const a = MK.align(planDesc([]), elevDesc([]), 0.001); if (!a.ok) throw new Error('align failed ' + J(a.errors)); return a.map; })();
const OPT = { snap_tol: 0.001, level: 3.1 }, lbl = (r, g) => r.ops.find(o => o.output_guid === g).params.label, codes = r => r.gaps.map(g => g.params.code);
// three stacked windows at plan x 0.0..0.8 m (sills 0.1, 0.9, 1.7 above level 3.1 → absolute z 3.2 / 4.0 / 4.8), plus a second spot at x 2..3
const STK = () => [RUN, win('s1', 0, 0, 0.8, 0.4, { sill: 0.1 }), win('s2', 0, 0, 0.8, 0.4, { sill: 0.9 }), win('s3', 0, 0, 0.8, 0.4, { sill: 1.7 }), win('t1', 2, 0, 3, 0.4, { sill: 0.1 })];
// TG1
{ const d = planDesc([['@TAG=window,CAS', 400, 200], ['@TAG=wall,W417', 10, 10], ['@TAG=window,CAS', 400, 200], ['@TAG=window,z=4.1,CAS', 400, 200], ['@TAG=door,D, flush', 0, 0]]);
  const bad = ['@TAG=gate,X', '@TAG=window', '@TAG=window,', '@TAG=window,z=abc,X', '@TAG=window,z=,X'].map(r => planDesc([[r, 1, 1]]).tags.length === 0 && desc(PLAN.concat([[r, 1, 1]])).errors.some(e => e.code === 'MARK:malformed'));
  const conf = desc(PLAN.concat([['@TAG=window,A', 5, 5], ['@TAG=window,B', 5, 5]])).errors.some(e => e.code === 'MARK:conflict');
  const ez = desc(ELEVM.concat([['@TAG=window,z=1,X', 5, 5]])), ezOk = ez.errors.some(e => e.code === 'MARK:malformed') && ez.desc.tags.length === 0;
  check('TG1', 'tag markings parsed wrongly: duplicates not merged, bad input accepted, conflict missed, or z accepted in an elevation', d.tags.length === 4 && J(d.tags.map(t => t.text)) === '["D, flush","W417","CAS","CAS"]' && bad.every(Boolean) && conf && ezOk, 'tags=' + J(d.tags.map(t => t.class + ':' + t.text + '@' + t.z)) + ' malformed rejected=' + bad.filter(Boolean).length + '/5 conflict=' + conf + ' elev z rejected=' + ezOk); }
// TG2 plan tag at its insertion point (x 2.5 m, y 0.2 m in mm) labels the element under it
{ const r = T.applyTags(STK(), [{ desc: planDesc([['@TAG=window,CAS', 2500, 200]]) }], MK.UNITS, OPT);
  check('TG2', 'a tag did not label the element under its insertion point (or labelled another)', lbl(r, 't1') === 'CAS' && lbl(r, 's1') === undefined && r.labelled === 1 && !r.gaps.length && r.ops.find(o => o.output_guid === 't1').params.label_source === 'tag', 't1=' + lbl(r, 't1') + ' labelled=' + r.labelled + ' gaps=' + J(codes(r))); }
// TG3 plan tag with z picks one stacked window; without z it is ambiguous
{ const a = T.applyTags(STK(), [{ desc: planDesc([['@TAG=window,z=4.1,CAS', 400, 200]]) }], MK.UNITS, OPT), b = T.applyTags(STK(), [{ desc: planDesc([['@TAG=window,CAS', 400, 200]]) }], MK.UNITS, OPT);
  check('TG3', 'z did not pick one of three stacked windows, or a tag without z labelled one of them', lbl(a, 's2') === 'CAS' && lbl(a, 's1') === undefined && lbl(a, 's3') === undefined && J(codes(b)) === '["GAP:label_ambiguous"]' && lbl(b, 's1') === undefined, 'z=4.1 → s2=' + lbl(a, 's2') + ' | no z gaps=' + J(codes(b))); }
// TG4 vocabulary alias resolves to the library id
{ const r = T.applyTags(STK(), [{ desc: planDesc([['@TAG=window,CAS', 2500, 200]]) }], MK.UNITS, Object.assign({ vocab: { CAS: 'DUPLEX_CASEMENT', FIX: 'DUPLEX_SMALL_FIXED' } }, OPT));
  check('TG4', 'canned alias not resolved to the library id', lbl(r, 't1') === 'DUPLEX_CASEMENT', 't1=' + lbl(r, 't1')); }
// TG5 text not in vocabulary (typo, case) → gap, nothing labelled
{ const v = { CAS: 'DUPLEX_CASEMENT' }, a = T.applyTags(STK(), [{ desc: planDesc([['@TAG=window,Cas', 2500, 200]]) }], MK.UNITS, Object.assign({ vocab: v }, OPT)), b = T.applyTags(STK(), [{ desc: planDesc([['@TAG=window,CAS', 2500, 200]]) }], MK.UNITS, OPT);
  check('TG5', 'a tag text outside the vocabulary was accepted, or matching is not case-sensitive', lbl(a, 't1') === undefined && a.labelled === 0 && J(codes(a)) === '["GAP:label_unknown_text"]' && lbl(b, 't1') === 'CAS', 'typo gaps=' + J(codes(a)) + ' no-vocab label=' + lbl(b, 't1')); }
// TG6 elevation tag picks the right stacked window by height: elevation y in mm above level 0 → z; windows absolute z: s1 3.2-3.95, s2 4.0-4.75, s3 4.8-5.55; use z 4.3 m → elevation y 4300? map.zOf(y): @Z=0 at y 0 and @Z=3 at y 3000 → z = y/1000
{ const tag = (h, y) => elevDesc([['@TAG=window,CAS', h, y]]), r = T.applyTags(STK(), [{ desc: tag(400, 4300), map: MAP }], MK.UNITS, OPT), r2 = T.applyTags(STK(), [{ desc: tag(400, 3500), map: MAP }], MK.UNITS, OPT);
  check('TG6', 'an elevation tag did not pick the stacked window at its height', lbl(r, 's2') === 'CAS' && lbl(r, 's1') === undefined && lbl(r, 's3') === undefined && lbl(r2, 's1') === 'CAS' && lbl(r2, 's2') === undefined && !r.gaps.length, 'y=4.3→' + ['s1', 's2', 's3'].map(g => lbl(r, g)) + ' y=3.5→' + ['s1', 's2', 's3'].map(g => lbl(r2, g))); }
// TG7 elevation of another face does not label (windows are on face minY)
{ const dMax = desc(ELEVM.map(m => m[0] === '@FACE=minY' ? ['@FACE=maxY'] : m).concat([['@TAG=window,CAS', 400, 4300]])).desc, r = T.applyTags(STK(), [{ desc: dMax, map: MAP }], MK.UNITS, OPT);
  check('TG7', 'a tag on the elevation of another face labelled a window of this face', r.labelled === 0 && J(codes(r)) === '["GAP:label_unmatched"]', 'labelled=' + r.labelled + ' gaps=' + J(codes(r))); }
// TG8 height with no opening, and a position along the wall with no opening
{ const a = T.applyTags(STK(), [{ desc: elevDesc([['@TAG=window,CAS', 400, 9000]]), map: MAP }], MK.UNITS, OPT), b = T.applyTags(STK(), [{ desc: elevDesc([['@TAG=window,CAS', 4000, 3500]]), map: MAP }], MK.UNITS, OPT);
  check('TG8', 'an elevation tag with no opening at that height/position was dropped silently or forced', J(codes(a)) === '["GAP:label_unmatched"]' && J(codes(b)) === '["GAP:label_unmatched"]' && a.labelled === 0 && b.labelled === 0, 'height miss=' + J(codes(a)) + ' position miss=' + J(codes(b))); }
// TG9 end to end: two same-size products told apart by tags, then bound; the untagged one stays unbound
{ const lib = { window: [{ id: 'SMALL_FIXED', set: 'NOM', width: 0.8, height: 0.75 }, { id: 'CASEMENT', set: 'NOM', width: 0.8, height: 0.75 }] };
  const ops = [RUN, win('w1', 0, 0, 0.8, 0.4), win('w2', 2, 0, 2.8, 0.4)], t = T.applyTags(ops, [{ desc: planDesc([['@TAG=window,CASEMENT', 2400, 200]]) }], MK.UNITS, OPT), b = T.bindTypes(t.ops, lib, { bind: { size_tol: 0.005, prefer: ['NOM'] } }, {});
  const typ = g => b.ops.find(o => o.output_guid === g).params.type;
  check('TG9', 'tag did not separate two same-size products, or the untagged one was bound by guess', !!typ('w2') && typ('w2').type_id === 'CASEMENT' && typ('w2').bind_source === 'label' && !typ('w1') && b.gaps.filter(g => g.params.code === 'GAP:type_unbound').length === 1, 'w2=' + J(typ('w2')) + ' w1 bound=' + !!typ('w1')); }
// TG10 order independence of tags and ops
{ const tags = [['@TAG=window,A', 400, 200], ['@TAG=window,B', 2500, 200], ['@TAG=window,C', 9000, 9000]], canon = r => J(r.ops.slice().sort((a, b) => (a.op_type + (a.output_guid || '') + (a.params.code || '') + J(a.params.tag || '')) < (b.op_type + (b.output_guid || '') + (b.params.code || '') + J(b.params.tag || '')) ? -1 : 1));
  const base = canon(T.applyTags(STK(), [{ desc: planDesc(tags.map(t => t.slice(0, 3))) }], MK.UNITS, OPT)); let ok = true;
  for (let i = 0; i < 20; i++) { const sh = tags.slice().sort(() => Math.random() - 0.5), o = STK().sort(() => Math.random() - 0.5); if (canon(T.applyTags(o, [{ desc: planDesc(sh) }], MK.UNITS, OPT)) !== base) ok = false; }
  check('TG10', 'tag labelling depends on marker or op order', ok, '20 shuffles; base has ' + (base.match(/label_unmatched/g) || []).length + ' unmatched'); }
// TG11 a tag and an existing @LABEL with different texts on one element
{ const ops = STK().map(o => o.output_guid === 't1' ? Object.assign({}, o, { params: Object.assign({}, o.params, { label: 'OLD' }) }) : o), r = T.applyTags(ops, [{ desc: planDesc([['@TAG=window,NEW', 2500, 200]]) }], MK.UNITS, OPT);
  check('TG11', 'a tag overwrote an existing label', lbl(r, 't1') === 'OLD' && J(codes(r)) === '["GAP:label_conflict"]', 'label=' + lbl(r, 't1') + ' gaps=' + J(codes(r))); }
console.log('SUMMARY fail=' + fails); lines.push('SUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_tags.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
