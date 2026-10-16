// Probe: what does the SHIPPED grid layer give on Hospital (and the fleet) for a PLAN beat?
// Reads only. No invention: every number is GridDims' own output.
'use strict';
var fs=require('fs'), path=require('path');
global.window = global.window || {};
var OOTB='/home/red1/bim-ootb';
require(path.join(OOTB,'viewer','grid_dims.js'));
var GridDims=window.window? window.GridDims : window.GridDims;
var rules=JSON.parse(fs.readFileSync(path.join(OOTB,'viewer','grid_rules.json'),'utf8'));
var initSqlJs=require(path.join(OOTB,'modeller','lib','sql-wasm.js'));
var wasmBinary=fs.readFileSync(path.join(OOTB,'modeller','lib','sql-wasm.wasm'));
var BLDGS=['Hospital_extracted.db','HHS_Office_Federated_extracted.db','Duplex_extracted.db','Clinic_extracted.db'];
// silence GridDims' own chatter, keep our § lines
var realLog=console.log; var quiet=false;
console.log=function(){ if(!quiet) realLog.apply(console,arguments); };
initSqlJs({wasmBinary:wasmBinary}).then(function(SQL){
  realLog('=== §PLAN_GRID_PROBE — shipped GridDims on the fleet, '+new Date().toISOString().slice(0,10)+' ===');
  BLDGS.forEach(function(n){
    var p=path.join(OOTB,'buildings',n);
    if(!fs.existsSync(p)){ realLog('  SKIP '+n+' (absent)'); return; }
    var db=new SQL.Database(fs.readFileSync(p));
    var t0=Date.now(); quiet=true;
    var g,dims,err=null;
    try{ g=GridDims.detectGrids(db,null,rules); dims=GridDims.generateDimensions(g); }
    catch(e){ err=e.message; }
    quiet=false; var ms=Date.now()-t0;
    if(err){ realLog('  §PLAN_GRID '+n+' ERROR='+err); return; }
    var bays=dims.filter(function(d){return d.tier===1;});
    var over=dims.filter(function(d){return d.tier===2;});
    var pitch=bays.map(function(d){return Math.abs(d.distance);}).sort(function(a,b){return a-b;});
    var med=pitch.length?pitch[Math.floor(pitch.length/2)]:0;
    // wall count for context
    var wc=0; try{ var r=db.exec("SELECT COUNT(*) FROM elements_meta WHERE ifc_class LIKE 'IfcWall%'"); wc=r.length?r[0].values[0][0]:0; }catch(e){}
    realLog('  §PLAN_GRID '+n+' xLines='+g.xLines.length+' yLines='+g.yLines.length+
      ' bayDims='+bays.length+' overallDims='+over.length+
      ' medianBay='+(med*1000).toFixed(0)+'mm walls='+wc+' ms='+ms);
    realLog('     bays(mm)= '+bays.map(function(d){return (Math.abs(d.distance)*1000).toFixed(0);}).join(' | '));
    realLog('     overall(mm)= '+over.map(function(d){return d.axis+':'+(Math.abs(d.distance)*1000).toFixed(0);}).join(' | '));
    db.close();
  });
  realLog('=== §PLAN_GRID_PROBE done ===');
});
