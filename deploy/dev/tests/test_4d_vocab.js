#!/usr/bin/env node
/**
 * BIM OOTB — 4D VOCABULARY dump (Node).
 * Implementing 4D_CAPTURE_AND_FALLBACK.md §5.2 — Witness W-VOCAB
 *
 * Purpose: derive the widened schema FROM EVIDENCE (n=1 corpus = Hospital 2.0.ifc),
 * not intuition. Dumps the FULL field set the expert encoded but T1 dropped:
 *   - IfcWorkSchedule / IfcWorkCalendar (+WorkingTimes)
 *   - IfcTaskTime  → which of the ~20 attributes are actually populated (float/baseline/critical)
 *   - IfcRelNests  → the WBS hierarchy (parent→children, depth, roots) = wbs_parent vocabulary
 *   - IfcTask      → predefined-type split (summary vs leaf), TaskTime coverage
 *   - IfcRelSequence → sequence-type + lag distribution
 *   - resource reality (IfcResource / IfcRelAssignsToControl) — present or absent?
 *
 * Run: node --max-old-space-size=8192 deploy/dev/tests/test_4d_vocab.js \
 *        "$HOME/Downloads/Hospital 2.0.ifc" 2>&1 | tee deploy/dev/tests/4d_vocab.log
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const WebIFC = require('web-ifc');

const ifcPath = process.argv[2] || path.join(os.homedir(), 'Downloads', 'Hospital 2.0.ifc');

// value helper: web-ifc gives {value:x,type:n} for set attrs, null for unset ($)
function v(attr) {
  if (attr === null || attr === undefined) return null;
  if (typeof attr === 'object' && 'value' in attr) return attr.value;
  return attr;
}
function isSet(attr) { var x = v(attr); return x !== null && x !== undefined && x !== ''; }

async function main() {
  if (!fs.existsSync(ifcPath)) { console.error('§FATAL file not found: ' + ifcPath); process.exit(1); }
  console.log('§VOCAB_START ifc=' + path.basename(ifcPath));
  const ifcApi = new WebIFC.IfcAPI();
  await ifcApi.Init();
  const modelID = ifcApi.OpenModel(new Uint8Array(fs.readFileSync(ifcPath)), {
    COORDINATE_TO_ORIGIN: false, USE_FAST_BOOLS: true, OPTIMIZE_PROFILES: true,
  });
  if (modelID < 0) { console.error('§PARSE_FAIL'); process.exit(1); }
  console.log('§PARSE_OK modelID=' + modelID);

  function getAll(type) {
    var ids = ifcApi.GetLineIDsWithType(modelID, type), out = [];
    for (var i = 0; i < ids.size(); i++) { try { out.push(ifcApi.GetLine(modelID, ids.get(i))); } catch(e){} }
    return out;
  }

  // ── 1. IfcWorkSchedule ──
  var scheds = getAll(WebIFC.IFCWORKSCHEDULE);
  scheds.forEach(function(s){
    console.log('§WS name="' + v(s.Name) + '" predefinedType=' + v(s.PredefinedType) +
      ' status=' + v(s.Status) + ' creationDate=' + v(s.CreationDate) +
      ' startTime=' + v(s.StartTime) + ' finishTime=' + v(s.FinishTime));
  });

  // ── 2. IfcWorkCalendar (+WorkingTimes) ──
  var cals = getAll(WebIFC.IFCWORKCALENDAR);
  console.log('§CAL_COUNT ' + cals.length);
  cals.forEach(function(c){
    var wt = c.WorkingTimes ? (Array.isArray(c.WorkingTimes) ? c.WorkingTimes : [c.WorkingTimes]) : [];
    var ex = c.ExceptionTimes ? (Array.isArray(c.ExceptionTimes) ? c.ExceptionTimes : [c.ExceptionTimes]) : [];
    console.log('§CAL name="' + v(c.Name) + '" predefinedType=' + v(c.PredefinedType) +
      ' workingTimes=' + wt.length + ' exceptionTimes=' + ex.length);
    wt.slice(0,3).forEach(function(ref){
      try { var w = ifcApi.GetLine(modelID, v(ref));
        var rp = isSet(w.RecurrencePattern) ? ifcApi.GetLine(modelID, v(w.RecurrencePattern)) : null;
        console.log('  §WT name="' + v(w.Name) + '" start=' + v(w.StartTime) + ' finish=' + v(w.FinishTime) +
          ' recurrence=' + (rp ? (rp.constructor && rp.constructor.name) + ' type=' + v(rp.RecurrenceType) : 'none'));
      } catch(e){ console.log('  §WT <unreadable>'); }
    });
  });

  // ── 3. IfcTask + predefined-type split + TaskTime coverage ──
  var tasks = getAll(WebIFC.IFCTASK);
  var byType = {}, withTime = 0, withId = 0, withWbsName = 0;
  var taskTimes = [];
  tasks.forEach(function(t){
    var pt = v(t.PredefinedType) || 'NULL'; byType[pt] = (byType[pt]||0)+1;
    if (isSet(t.Identification)) withId++;
    if (isSet(t.IsMilestone)) {}
    if (isSet(t.TaskTime)) { withTime++; try { taskTimes.push(ifcApi.GetLine(modelID, v(t.TaskTime))); } catch(e){} }
  });
  console.log('§TASK_COUNT ' + tasks.length + ' withTaskTime=' + withTime + ' withIdentification=' + withId);
  console.log('§TASK_TYPES ' + JSON.stringify(byType));

  // ── 4. IfcTaskTime — populate-rate per attribute (the heart of W-VOCAB) ──
  console.log('§TT_COUNT ' + taskTimes.length);
  var attrKeys = {};
  taskTimes.forEach(function(tt){
    Object.keys(tt).forEach(function(k){
      if (k === 'expressID' || k === 'type') return;
      if (!attrKeys[k]) attrKeys[k] = { set: 0, example: null };
      if (isSet(tt[k])) { attrKeys[k].set++; if (attrKeys[k].example === null) attrKeys[k].example = v(tt[k]); }
    });
  });
  Object.keys(attrKeys).forEach(function(k){
    var a = attrKeys[k];
    console.log('§TT_ATTR ' + k + ' populated=' + a.set + '/' + taskTimes.length +
      ' example=' + JSON.stringify(a.example));
  });

  // ── 5. IfcRelNests — WBS hierarchy ──
  var nests = getAll(WebIFC.IFCRELNESTS);
  var childToParent = {}, parentToKids = {}, taskName = {};
  tasks.forEach(function(t){ taskName[t.expressID] = v(t.Name); });
  nests.forEach(function(n){
    var parent = v(n.RelatingObject);
    var kids = n.RelatedObjects ? (Array.isArray(n.RelatedObjects)?n.RelatedObjects:[n.RelatedObjects]) : [];
    if (!parentToKids[parent]) parentToKids[parent] = [];
    kids.forEach(function(k){ var kid = v(k); childToParent[kid] = parent; parentToKids[parent].push(kid); });
  });
  var roots = tasks.filter(function(t){ return childToParent[t.expressID] === undefined; });
  function depth(id, seen){ seen = seen || {}; if (seen[id]) return 0; seen[id]=1;
    var kids = parentToKids[id] || []; var m = 0; kids.forEach(function(k){ m = Math.max(m, depth(k, seen)); }); return 1+m; }
  var maxDepth = roots.reduce(function(m,r){ return Math.max(m, depth(r.expressID)); }, 0);
  console.log('§NESTS_COUNT ' + nests.length + ' roots=' + roots.length + ' maxDepth=' + maxDepth +
    ' tasksWithParent=' + Object.keys(childToParent).length);
  // print one example branch from a root
  function branch(id, ind){ ind = ind || 0; if (ind > 5) return;
    console.log('  §WBS ' + '  '.repeat(ind) + (taskName[id] || ('#'+id)));
    (parentToKids[id] || []).slice(0,3).forEach(function(k){ branch(k, ind+1); }); }
  if (roots.length) { console.log('§WBS_TREE (root + up to 3 kids per level):'); branch(roots[0].expressID); }

  // ── 6. IfcRelSequence — type + lag distribution ──
  var seqs = getAll(WebIFC.IFCRELSEQUENCE);
  var seqType = {}, withLag = 0;
  seqs.forEach(function(s){ var t = v(s.SequenceType)||'NULL'; seqType[t]=(seqType[t]||0)+1; if (isSet(s.TimeLag)) withLag++; });
  console.log('§SEQ_COUNT ' + seqs.length + ' withLag=' + withLag + ' types=' + JSON.stringify(seqType));

  // ── 7. Resource reality ──
  var res = getAll(WebIFC.IFCRESOURCE).length + getAll(WebIFC.IFCCONSTRUCTIONEQUIPMENTRESOURCE).length +
            getAll(WebIFC.IFCLABORRESOURCE).length + getAll(WebIFC.IFCCONSTRUCTIONMATERIALRESOURCE).length;
  var ctrlRels = 0; try { ctrlRels = getAll(WebIFC.IFCRELASSIGNSTOCONTROL).length; } catch(e){}
  console.log('§RESOURCE resources=' + res + ' relAssignsToControl=' + ctrlRels +
    '  (note: if 0, "resource" is OUR concept not the IFC\'s — template-supplied)');

  ifcApi.CloseModel(modelID);
  console.log('§VOCAB_DONE');
}
main().catch(function(e){ console.error('§FATAL', e.message, e.stack); process.exit(1); });
