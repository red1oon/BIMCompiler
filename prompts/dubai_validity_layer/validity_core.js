/**
 * OpenBIM Readiness Toolkit — VALIDITY LAYER core (additive; see prompts/TOOLKIT_VALIDITY_LAYER.md)
 * Pure JS, no network, no web-ifc, no DOM. Streams the file as bytes (never builds one giant string);
 * memory = two id bitmaps + one Set of GlobalId strings. Output = counts/verdicts only (no GUID, no name, no free text).
 * INDICATIVE, NOT A CERTIFICATION — the full schema check is the buildingSMART Validation Service / ifcopenshell.
 * Usage (worker or node): var r = VALIDITY.run(uint8array, VALIDITY_TABLES);
 */
(function (root) {
  'use strict';
  var NOTE = 'Indicative, not a certification. For the full schema check use the buildingSMART Validation Service.';
  var ACCEPTED = ['IFC2X3', 'IFC4', 'IFC4X3_ADD2'];                    // IFC101 (ifc-gherkin-rules)
  var GUID_ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
  var MAX_ID = 100000000;                                              // bitmap ceiling (100 MB per map); above -> V-REF INCONCLUSIVE
  var guidOk = new Uint8Array(128); for (var gi = 0; gi < GUID_ALPHA.length; gi++) guidOk[GUID_ALPHA.charCodeAt(gi)] = 1;
  var dec = new TextDecoder('latin1');

  function mk(id, status, severity, layer, feedback, ev) { return { id: id, status: status, severity: severity, layer: layer, feedback: feedback, evidence: ev || {} }; }

  /* split "(a,b,(c,d),'x,y')" content into top-level args (strings/parens aware); also collect #refs outside strings */
  function parseArgs(s, from, refs) {
    var args = [], depth = 0, st = from + 1, inStr = false, n = s.length, i = from;
    for (; i < n; i++) {
      var c = s.charCodeAt(i);
      if (inStr) { if (c === 39) { if (s.charCodeAt(i + 1) === 39) i++; else inStr = false; } continue; }
      if (c === 39) { inStr = true; continue; }
      if (c === 40) { depth++; continue; }
      if (c === 41) { depth--; if (depth === 0) { args.push(s.substring(st, i).trim()); break; } continue; }
      if (c === 44 && depth === 1) { args.push(s.substring(st, i).trim()); st = i + 1; continue; }
      if (c === 35 && refs) { var j = i + 1, v = 0; while (j < n) { var d = s.charCodeAt(j); if (d < 48 || d > 57) break; v = v * 10 + d - 48; j++; } if (j > i + 1) refs.push(v); i = j - 1; }
    }
    return args;
  }

  function run(u8, TABLES) {
    var res = { version: 1, note: NOTE, bytes: u8.length, checks: [] };
    var n = u8.length;
    /* ---- pass 1: statement scanner over bytes -------------------------------------------- */
    var stm = [];                     // envelope statements (non-entity), keyword only
    var defined = new Uint8Array(1 << 16), referenced = new Uint8Array(1 << 16), maxId = 0, idOverflow = false;
    var dupIds = 0, entities = 0, complexSkipped = 0;
    var sect = 'NONE';                // NONE|HEADER|DATA|AFTER
    var env = { isoStart: false, headerOpen: false, headerClosed: false, dataOpen: false, dataClosed: false, footer: false, trailingGarbage: false, fileSchema: null, unterminatedTail: false, firstNonSpace: null, outOfOrder: 0 };
    var guids = new Set(), tables = null, tableName = null;
    var C = { guidJudged: 0, guidSyntaxBad: 0, guidDup: 0, guidFirstIds: [], ctxJudged: 0, ctxNull: 0, ctxFirstIds: [], arityJudged: 0, arityBad: 0, unknownType: 0, unknownTypes: {}, attrJudged: 0, mandNull: 0, starBad: 0, abstractInst: 0,
              mandNullByType: {}, arityByType: {}, starByType: {}, project: 0, building: 0, storey: 0, site: 0, unitsNull: 0, projectIds: [] };
    var projectUnitsRef = -1;
    var buf = [];                     // bytes of the current statement collected as chunks [start,end)
    var inStr = false, inCom = false, stStart = -1, i = 0;
    function ensure(id) {
      if (id > MAX_ID) { idOverflow = true; return false; }
      if (id >= defined.length) { var nl = Math.min(MAX_ID + 1, Math.max(id + 1, defined.length * 2)); var a = new Uint8Array(nl); a.set(defined); defined = a; var b = new Uint8Array(nl); b.set(referenced); referenced = b; }
      return true;
    }
    function resolveTables() {
      if (tables || !TABLES) return;
      var fs = env.fileSchema ? env.fileSchema[0] : null;
      if (fs && TABLES[fs]) { tables = TABLES[fs]; tableName = fs; }
    }
    function statement(s) {                       // s: full statement text without ';'
      var t = s.replace(/^\s+/, '');
      if (t.charCodeAt(0) === 35) { entity(t); return; }
      var kw = t.replace(/\s+$/, '');
      var up = kw.toUpperCase();
      if (up === 'ISO-10303-21') { if (env.isoStart || stmCount > 0) env.outOfOrder++; env.isoStart = true; sect = 'NONE'; }
      else if (up === 'HEADER') { env.headerOpen = true; sect = 'HEADER'; }
      else if (up === 'DATA' || /^DATA\s*\(/.test(up)) { env.dataOpen = true; sect = 'DATA'; resolveTables(); }
      else if (up === 'ENDSEC') { if (sect === 'HEADER') { env.headerClosed = true; sect = 'NONE'; } else if (sect === 'DATA') { env.dataClosed = true; sect = 'AFTER'; } else env.outOfOrder++; }
      else if (up === 'END-ISO-10303-21') { env.footer = true; sect = 'AFTER'; }
      else if (sect === 'HEADER' && /^FILE_SCHEMA\s*\(/.test(up)) {
        var m = kw.match(/^FILE_SCHEMA\s*\(\s*\(([^)]*)\)/i); env.fileSchema = m ? m[1].split(',').map(function (x) { return x.trim().replace(/^'|'$/g, '').toUpperCase(); }).filter(Boolean) : [];
      }
      else if (sect === 'AFTER' || sect === 'NONE') env.trailingGarbage = true;
      stmCount++;
    }
    var stmCount = 0;
    function entity(t) {
      var eq = t.indexOf('='); if (eq < 0) { env.outOfOrder++; return; }
      var id = parseInt(t.substring(1, eq), 10);
      if (!(id >= 0)) return;
      entities++;
      if (ensure(id)) { if (defined[id]) dupIds++; defined[id] = 1; if (id > maxId) maxId = id; }
      var p = eq + 1; while (p < t.length && t.charCodeAt(p) <= 32) p++;
      if (t.charCodeAt(p) === 40) { complexSkipped++; var rr = []; parseArgs(t, p, rr); for (var q = 0; q < rr.length; q++) if (ensure(rr[q])) referenced[rr[q]] = 1; return; }
      var po = t.indexOf('(', p); if (po < 0) return;
      var type = t.substring(p, po).trim().toUpperCase();
      var refs = []; var args = parseArgs(t, po, refs);
      for (var r = 0; r < refs.length; r++) if (ensure(refs[r])) referenced[refs[r]] = 1;
      if (!tables) return;
      var def = tables[type];
      if (!def) { C.unknownType++; C.unknownTypes[type] = (C.unknownTypes[type] || 0) + 1; return; }
      var rooted = def.charCodeAt(0) === 82, repr = def.charCodeAt(1) === 80, abs = def.charCodeAt(2) === 65, fl = def.substring(3);
      if (abs) C.abstractInst++;
      C.arityJudged++;
      var arityOk = args.length === fl.length;
      if (!arityOk) { C.arityBad++; C.arityByType[type] = (C.arityByType[type] || 0) + 1; }
      for (var k = 0; arityOk && k < fl.length; k++) {      // slot checks meaningless when arity is wrong
        var a = args[k], f = fl.charCodeAt(k);
        if (repr && k === 0) continue;                              // handled by V-CTX
        if (rooted && k === 0) continue;                            // handled by V-GUID
        C.attrJudged++;
        if (a === '$' && f === 109) { C.mandNull++; C.mandNullByType[type] = (C.mandNullByType[type] || 0) + 1; }
        else if (a === '*' && f !== 100) { C.starBad++; C.starByType[type] = (C.starByType[type] || 0) + 1; }
      }
      if (rooted) {
        var g = args[0];
        if (g !== undefined && g !== '$' && g !== '*') {
          C.guidJudged++;
          var bad = true;
          if (g.length === 24 && g.charCodeAt(0) === 39 && g.charCodeAt(23) === 39) {
            bad = false; var c0 = g.charCodeAt(1);
            if (c0 < 48 || c0 > 51) bad = true;
            for (var z = 1; z <= 22 && !bad; z++) { var cc = g.charCodeAt(z); if (cc > 127 || !guidOk[cc]) bad = true; }
          }
          if (bad) { C.guidSyntaxBad++; if (C.guidFirstIds.length < 3) C.guidFirstIds.push(id); }
          if (guids.has(g)) { C.guidDup++; } else guids.add(g);
        } else if (g === '*') { /* derived-in-root is not a thing; ignored */ }
      }
      if (repr) {
        C.ctxJudged++;
        if (!(args[0] && args[0].charCodeAt(0) === 35)) { C.ctxNull++; if (C.ctxFirstIds.length < 3) C.ctxFirstIds.push(id); }
      }
      if (type === 'IFCPROJECT') { C.project++; if (C.projectIds.length < 1) { C.projectIds.push(id); } var u = args[8]; if (!(u && u.charCodeAt(0) === 35)) C.unitsNull++; else projectUnitsRef = parseInt(u.substring(1), 10); }
      else if (type === 'IFCBUILDING') C.building++;
      else if (type === 'IFCBUILDINGSTOREY') C.storey++;
      else if (type === 'IFCSITE') C.site++;
    }

    /* the byte scanner: finds ';' outside strings and comments; decodes only one statement at a time */
    var first = true;
    for (i = 0; i < n; i++) {
      var c = u8[i];
      if (inCom) { if (c === 42 && u8[i + 1] === 47) { inCom = false; i++; } continue; }
      if (inStr) { if (c === 39) { if (u8[i + 1] === 39) i++; else inStr = false; } continue; }
      if (stStart < 0) {
        if (c <= 32) continue;
        if (c === 47 && u8[i + 1] === 42) { inCom = true; i++; continue; }
        stStart = i; if (env.firstNonSpace === null) env.firstNonSpace = String.fromCharCode(c);
      }
      if (c === 39) { inStr = true; continue; }
      if (c === 47 && u8[i + 1] === 42) { inCom = true; i++; continue; }
      if (c === 59) { statement(dec.decode(u8.subarray(stStart, i))); stStart = -1; }
    }
    if (stStart >= 0 && inCom === false) {            // bytes after the last ';' that are not whitespace/comments
      var tail = dec.decode(u8.subarray(stStart, n)).replace(/\s+$/, '');
      if (tail.length) env.unterminatedTail = true;
    }
    if (inStr) env.unterminatedTail = true;
    resolveTables();

    /* ---- verdicts ------------------------------------------------------------------------ */
    function top(o) { var k = Object.keys(o).sort(function (a, b) { return o[b] - o[a] || (a < b ? -1 : 1); }).slice(0, 12), r = {}; k.forEach(function (x) { r[x] = o[x]; }); return r; }
    var CHK = res.checks;
    var isStep = env.isoStart;
    /* V-STEP */
    var miss = [];
    if (!env.isoStart) miss.push('does not start with "ISO-10303-21;"');
    if (env.isoStart && !env.headerOpen) miss.push('no HEADER section');
    if (env.headerOpen && !env.headerClosed) miss.push('HEADER not closed by ENDSEC');
    if (env.isoStart && !env.dataOpen) miss.push('no DATA section');
    if (env.dataOpen && !env.dataClosed) miss.push('DATA section never closed by ENDSEC (file looks truncated)');
    if (env.isoStart && env.dataClosed && !env.footer) miss.push('missing END-ISO-10303-21 footer');
    if (env.unterminatedTail) miss.push('the file ends in the middle of a statement (no closing ";")');
    if (env.trailingGarbage) miss.push('unexpected text outside the HEADER/DATA sections');
    if (env.outOfOrder) miss.push('section markers out of order (' + env.outOfOrder + ')');
    var stepEv = { iso_start: env.isoStart, header_closed: env.headerClosed, data_open: env.dataOpen, data_closed: env.dataClosed, footer: env.footer, unterminated_tail: env.unterminatedTail, problems: miss.length };
    if (!isStep && entities === 0) CHK.push(mk('V-STEP', 'FAIL', 'error', 'STEP syntax (buildingSMART syntax layer)', 'This is not a STEP physical file: it does not start with "ISO-10303-21;", so nothing else could be judged.', stepEv));
    else if (miss.length) CHK.push(mk('V-STEP', 'FAIL', 'error', 'STEP syntax (buildingSMART syntax layer)', 'The file envelope is broken: ' + miss.join('; ') + '.', stepEv));
    else CHK.push(mk('V-STEP', 'PASS', 'error', 'STEP syntax (buildingSMART syntax layer)', 'The ISO-10303-21 envelope is complete (header, closed DATA section, footer).', stepEv));

    var notStep = !isStep && entities === 0;
    function inc(id, layer, why) { CHK.push(mk(id, 'INCONCLUSIVE', 'error', layer, why, {})); }

    /* V-SCHEMA */
    var L_SCH = 'Schema version (buildingSMART IFC Schema / IFC101)';
    if (notStep) inc('V-SCHEMA', L_SCH, 'Not judged: the file is not STEP.');
    else if (!env.fileSchema || !env.fileSchema.length) CHK.push(mk('V-SCHEMA', 'FAIL', 'error', L_SCH, 'No FILE_SCHEMA found in the header, so the IFC version is unknown.', { file_schema: null }));
    else {
      var badS = env.fileSchema.filter(function (x) { return ACCEPTED.indexOf(x) < 0; });
      CHK.push(badS.length ? mk('V-SCHEMA', 'FAIL', 'error', L_SCH, 'The schema identifier is not one of IFC2X3, IFC4 or IFC4X3_ADD2.', { file_schema: env.fileSchema.length, not_accepted: badS.length })
                           : mk('V-SCHEMA', 'PASS', 'error', L_SCH, 'The schema identifier (' + env.fileSchema.join(', ') + ') is an official buildingSMART version.', { file_schema: env.fileSchema.length, not_accepted: 0 }));
    }
    res.schema = env.fileSchema && env.fileSchema.length ? env.fileSchema.join(',') : null;

    /* V-REF */
    var L_REF = 'Entity references (EXPRESS referential integrity)';
    if (notStep || entities === 0) inc('V-REF', L_REF, notStep ? 'Not judged: the file is not STEP.' : 'Not judged: the DATA section holds no entities.');
    else if (idOverflow) inc('V-REF', L_REF, 'Not judged: an entity number exceeds the ' + MAX_ID + ' memory ceiling of this check.');
    else {
      var dangling = 0, refTotal = 0;
      for (var q = 1; q < referenced.length; q++) if (referenced[q]) { refTotal++; if (!defined[q]) dangling++; }
      var ev = { entities: entities, distinct_refs: refTotal, dangling_refs: dangling, duplicate_instance_ids: dupIds };
      CHK.push((dangling || dupIds) ? mk('V-REF', 'FAIL', 'error', L_REF, dangling + ' referenced entity number(s) do not exist in the file' + (dupIds ? ' and ' + dupIds + ' entity number(s) are defined twice' : '') + (dangling ? ' (typical of a truncated or damaged file)' : '') + '.', ev)
                               : mk('V-REF', 'PASS', 'error', L_REF, 'All ' + refTotal + ' referenced entities exist and no entity number is defined twice.', ev));
    }

    var noTables = !tables;
    var whyNoTab = notStep ? 'Not judged: the file is not STEP.' : (!env.fileSchema ? 'Not judged: no FILE_SCHEMA.' : 'Not judged: schema ' + (env.fileSchema[0] || '?') + ' has no table in this layer (supports IFC2X3, IFC4, IFC4X3_ADD2).');
    /* V-GUID */
    var L_G = 'GlobalId (PJS003 syntax; IfcRoot.UR1 uniqueness)';
    if (noTables) inc('V-GUID', L_G, whyNoTab);
    else if (C.guidJudged === 0) inc('V-GUID', L_G, 'Not judged: no rooted entity with a GlobalId was found.');
    else {
      var evg = { judged: C.guidJudged, invalid_syntax: C.guidSyntaxBad, duplicates: C.guidDup, first_entity_ids: C.guidFirstIds };
      CHK.push((C.guidSyntaxBad || C.guidDup) ? mk('V-GUID', 'FAIL', 'error', L_G, [C.guidSyntaxBad ? C.guidSyntaxBad + ' of ' + C.guidJudged + ' GlobalIds are not valid 22-character IFC identifiers' : '', C.guidDup ? C.guidDup + ' GlobalId(s) repeat an earlier one (they must be unique)' : ''].filter(Boolean).join('; ') + '.', evg)
                                       : mk('V-GUID', 'PASS', 'error', L_G, 'All ' + C.guidJudged + ' GlobalIds are valid 22-character identifiers and unique.', evg));
    }
    /* V-CTX */
    var L_C = 'Representation context (IfcRepresentation.ContextOfItems not optional)';
    if (noTables) inc('V-CTX', L_C, whyNoTab);
    else if (C.ctxJudged === 0) inc('V-CTX', L_C, 'Not judged: the file holds no shape representations.');
    else CHK.push(C.ctxNull ? mk('V-CTX', 'FAIL', 'error', L_C, C.ctxNull + ' of ' + C.ctxJudged + ' shape representations have no representation context (required by the schema).', { judged: C.ctxJudged, null_context: C.ctxNull, first_entity_ids: C.ctxFirstIds })
                            : mk('V-CTX', 'PASS', 'error', L_C, 'All ' + C.ctxJudged + ' shape representations point to a representation context.', { judged: C.ctxJudged, null_context: 0 }));
    /* V-ARITY */
    var L_A = 'Entity known to schema + argument count (Schema Compliance, attributes)';
    if (noTables) inc('V-ARITY', L_A, whyNoTab);
    else if (C.arityJudged + C.unknownType === 0) inc('V-ARITY', L_A, 'Not judged: no entity instances.');
    else {
      var bad = C.arityBad + C.unknownType + C.abstractInst;
      var eva = { by_type: top(C.arityByType), judged: C.arityJudged + C.unknownType, wrong_argument_count: C.arityBad, unknown_entity_type: C.unknownType, abstract_instantiated: C.abstractInst, complex_instances_skipped: complexSkipped };
      CHK.push(bad ? mk('V-ARITY', 'FAIL', 'error', L_A, [C.arityBad ? C.arityBad + ' entities have the wrong number of attributes for ' + tableName : '', C.unknownType ? C.unknownType + ' entities are not defined in ' + tableName : '', C.abstractInst ? C.abstractInst + ' abstract entities are instantiated' : ''].filter(Boolean).join('; ') + '.', eva)
                     : mk('V-ARITY', 'PASS', 'error', L_A, 'All ' + (C.arityJudged) + ' entities are known to ' + tableName + ' with the right number of attributes.', eva));
    }
    /* V-ATTR */
    var L_T = 'Attribute population (mandatory attribute not null; "*" only where derived)';
    if (noTables) inc('V-ATTR', L_T, whyNoTab);
    else if (C.attrJudged === 0) inc('V-ATTR', L_T, 'Not judged: no attribute slots could be examined.');
    else {
      var evt = { star_by_type: top(C.starByType), mandatory_null_by_type: top(C.mandNullByType), judged_slots: C.attrJudged, mandatory_null: C.mandNull, star_in_explicit: C.starBad };
      CHK.push((C.mandNull || C.starBad) ? mk('V-ATTR', 'FAIL', 'error', L_T, [C.mandNull ? C.mandNull + ' mandatory attributes are empty ($)' : '', C.starBad ? C.starBad + ' non-derived attributes hold "*"' : ''].filter(Boolean).join('; ') + '.', evt)
                                        : mk('V-ATTR', 'PASS', 'error', L_T, 'No mandatory attribute is empty and no "*" is misplaced in ' + C.attrJudged + ' slots examined.', evt));
    }
    /* V-REQ (warnings: industry practice / toolkit convention, never schema errors) */
    var L_Q = 'Project/spatial skeleton (PJS101 industry practice; toolkit M4 convention)';
    if (notStep || entities === 0) inc('V-REQ', L_Q, notStep ? 'Not judged: the file is not STEP.' : 'Not judged: the DATA section holds no entities.');
    else if (noTables) inc('V-REQ', L_Q, whyNoTab);
    else {
      var pr = [];
      if (C.project !== 1) pr.push(C.project + ' IfcProject instance(s), expected exactly 1');
      if (C.building < 1) pr.push('no IfcBuilding');
      if (C.storey < 1) pr.push('no IfcBuildingStorey');
      if (C.project === 1 && C.unitsNull) pr.push('the IfcProject has no unit assignment');
      var evq = { ifcproject: C.project, ifcsite: C.site, ifcbuilding: C.building, ifcbuildingstorey: C.storey, project_units_missing: C.unitsNull };
      CHK.push(pr.length ? mk('V-REQ', 'FAIL', 'warning', L_Q, 'Warning (industry practice, not a schema error): ' + pr.join('; ') + '.', evq)
                         : mk('V-REQ', 'PASS', 'warning', L_Q, 'One IfcProject with units, and at least one IfcBuilding and IfcBuildingStorey.', evq));
    }
    /* ---- value-add: why / fix / impact per finding, prioritised fix list, transparent headline ---- */
    var ADV = {
      'V-STEP': { tier: 1, why: 'The file is cut short or is not a STEP file, so some of the model is simply missing and every count in this report may be too low.', fix: 'Re-export or re-download the IFC and compare the file size with the original; do not edit it in a text editor.', impact: 'The readiness census silently under-counts a truncated file (a truncated sample returned verdict "done" with 18 of 20 elements and no error).', ref: 'prompts/IFC_COMPLIANCE_SELFCHECK.md section 8.2' },
      'V-REF': { tier: 1, why: 'Some objects point at things that are not in the file, so relationships are broken or the file was cut.', fix: 'Re-export the model; if it happens again, report it to the authoring-tool vendor.', impact: 'The readiness census silently under-counts a damaged file (the truncated sample passed as "done" while 3 references pointed at entities that were cut off).', ref: 'prompts/IFC_COMPLIANCE_SELFCHECK.md section 8.2' },
      'V-SCHEMA': { tier: 2, why: 'The file does not say which official IFC version it uses, so receiving software cannot know how to read it.', fix: 'Export as IFC2X3, IFC4 or IFC4X3_ADD2 from your authoring tool.', impact: 'Conformance defect; the toolkit reads IFC2X3, IFC4 and IFC4X3 only (metrics_worker.js lines 98-100).', ref: 'metrics_worker.js:98-100; ifc-gherkin-rules IFC101' },
      'V-ARITY': { tier: 2, why: 'Objects carry the wrong number of attributes for their IFC version, so strict readers cannot map the fields.', fix: 'Update the exporter or choose the export schema it was written for; report the entity types shown to the tool vendor.', impact: 'Conformance defect reported by ifcopenshell.validate and the service Schema Compliance layer; no Compiler/toolkit code path found that consumes it.', ref: 'prompts/IFC_COMPLIANCE_SELFCHECK.md section 8.3' },
      'V-ATTR': { tier: 2, why: 'Required fields are left empty or filled with a placeholder where the standard does not allow it.', fix: 'Fill the required attributes in the authoring tool, or update the exporter so it writes them.', impact: 'Conformance defect reported by ifcopenshell.validate and the service Schema Compliance layer; no Compiler/toolkit code path found that consumes it.', ref: 'prompts/IFC_COMPLIANCE_SELFCHECK.md section 8.3' },
      'V-CTX': { tier: 2, why: 'Shapes are not linked to a geometric context (model/plan, precision), which every shape must be.', fix: 'Make the exporter write an IfcGeometricRepresentationContext and reference it from each shape.', impact: 'Conformance defect reported by ifcopenshell.validate and by the service Schema Compliance layer; no Compiler/toolkit code path found that consumes it.', ref: 'prompts/IFC_COMPLIANCE_SELFCHECK.md section 8.3' },
      'V-GUID': { tier: 3, why: 'Object identifiers are malformed or repeated, so the same id can mean two objects.', fix: 'Regenerate GlobalIds with a standard IFC GUID generator (22 characters, first character 0-3) and never copy an element without giving it a new id.', impact: 'The viewer uses the GlobalId as the element identity and stores edits per guid, so elements sharing an id share one edit record.', ref: 'bim-ootb viewer/import_worker.js:421; viewer/edit_delta_viewer.js:49-50' },
      'V-REQ': { tier: 4, why: 'The model lacks the usual Project > Building > Storey skeleton that tools use to organise it.', fix: 'Add the missing spatial levels and place every element in a storey in the authoring tool.', impact: 'Elements without a storey become "Unknown" and the 4D author must guess the storey from height instead of reading the model; the toolkit counts them as orphans.', ref: 'bim-ootb viewer/import_worker.js:300,424; viewer/schedule_author.js:320-326; metrics_worker.js:255-263' }
    };
    var VS_BSI = {
      service_gives_that_this_does_not: ['EXPRESS entity WHERE rules and global rules', 'inverse-attribute checks', 'attribute type, enumeration and select value checks', 'the full Implementer Agreement and Informal Proposition catalogue (this layer implements only GlobalId syntax and parts of the schema-version and project rules)', 'a formal, citable validation report'],
      this_layer_adds: ['runs offline in the browser, nothing is uploaded', 'instant first pass', 'plain-English why / fix / downstream impact for each finding', 'a prioritised fix order and a transparent headline']
    };
    CHK.forEach(function (c) {
      var a = ADV[c.id]; if (!a) return;
      c.tier = a.tier;
      if (c.status === 'FAIL') {
        c.why = a.why; c.fix = a.fix; c.impact = a.impact; c.impact_ref = a.ref;
        if (c.id === 'V-GUID' && !c.evidence.duplicates) { c.impact = 'Malformed but unique ids: strict importers may reject or remap them; no Compiler/toolkit code path found that fails on them (the viewer keeps the id as written).'; c.impact_ref = 'bim-ootb viewer/import_worker.js:421'; }
        if (c.id === 'V-REQ' && c.evidence.ifcbuildingstorey > 0) { c.impact = 'Organisational convention (industry practice); no Compiler/toolkit code path found that fails on it.'; c.impact_ref = 'ifc-gherkin-rules PJS101; metrics_worker.js M4'; }
      }
    });
    function share(c) { if (c.id === 'V-REQ') return 1; var e = c.evidence, j = e.judged || e.judged_slots || e.entities || 1;
      var bad = (e.invalid_syntax || 0) + (e.duplicates || 0) + (e.null_context || 0) + (e.wrong_argument_count || 0) + (e.unknown_entity_type || 0) + (e.abstract_instantiated || 0) + (e.mandatory_null || 0) + (e.star_in_explicit || 0) + (e.dangling_refs || 0) + (e.duplicate_instance_ids || 0) + (e.problems || 0);
      return Math.min(1, bad / j); }
    var failing = CHK.filter(function (c) { return c.status === 'FAIL'; });
    res.fix_list = failing.slice().sort(function (x, y) { return (x.tier - y.tier) || (share(y) - share(x)); })
      .map(function (c, k) { return { priority: k + 1, id: c.id, severity: c.severity, tier: c.tier, affected_share: +share(c).toFixed(3), fix: c.fix, why: c.why, impact: c.impact }; });
    /* roll-up: only error-severity FAILs decide overall; never PASS when nothing beyond the envelope was judged */
    var errJudged = CHK.filter(function (c) { return c.severity === 'error' && c.status !== 'INCONCLUSIVE'; });
    var errPass = errJudged.filter(function (c) { return c.status === 'PASS'; });
    var fails = CHK.filter(function (c) { return c.status === 'FAIL' && c.severity === 'error'; });
    var warns = CHK.filter(function (c) { return c.status === 'FAIL' && c.severity === 'warning'; });
    var passes = CHK.filter(function (c) { return c.status === 'PASS'; });
    var core = ['V-STEP', 'V-REF', 'V-ARITY'].every(function (id) { return CHK.filter(function (c) { return c.id === id; })[0].status === 'PASS'; });
    res.overall = fails.length ? 'FAIL' : (core ? 'PASS' : 'INCONCLUSIVE');
    var nInc = CHK.filter(function (c) { return c.status === 'INCONCLUSIVE'; }).length;
    res.counts = { pass: passes.length, fail: fails.length, warning: warns.length, inconclusive: nInc };
    res.headline = { formula: 'readiness = P / J, P = error-severity checks PASS, J = error-severity checks judged (PASS+FAIL); INCONCLUSIVE excluded; warnings never lower it', P: errPass.length, J: errJudged.length,
      text: res.overall === 'INCONCLUSIVE' ? 'Not enough of the file could be judged (' + errPass.length + ' passed, ' + nInc + ' not judged)' : errPass.length + ' of ' + errJudged.length + ' checks passed (' + nInc + ' not judged, ' + warns.length + ' warning' + (warns.length === 1 ? '' : 's') + ')', overall: res.overall };
    res.summary = res.overall === 'PASS' ? 'No validity defects found by this indicative layer (' + errPass.length + ' of ' + errJudged.length + ' checks passed).' :
      res.overall === 'FAIL' ? fails.length + ' validity check(s) failed: ' + fails.map(function (c) { return c.id; }).join(', ') + '.' : 'Validity could not be judged: too little of the file could be examined.';
    res.vs_buildingsmart = VS_BSI;
    res.entities = entities;
    return res;
  }
  var api = { run: run, NOTE: NOTE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.VALIDITY = api;
})(typeof self !== 'undefined' ? self : this);
