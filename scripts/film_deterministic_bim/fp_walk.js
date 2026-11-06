// Runs the REAL Modeller walker (disc_walker.js dwWalk FP) on a SCRATCH COPY of the film DB. Source DB never written.
'use strict';
var fs=require('fs'),path=require('path'); var initSqlJs=require('/home/red1/bim-compiler/node_modules/sql.js');
var OOTB='/home/red1/bim-ootb', DW=require(OOTB+'/modeller/disc_walker.js');
var SRC=process.argv[2], OUT=process.argv[3], RULES=process.argv[4]||'terminal_rules.db';
(async function(){
  var SQL=await initSqlJs();
  var rules=new SQL.Database(new Uint8Array(fs.readFileSync(OOTB+'/modeller/'+RULES)));
  var db=new SQL.Database(new Uint8Array(fs.readFileSync(SRC)));          // scratch copy in memory
  var q=function(s){var r=db.exec(s);return r.length?r[0].values:[]};
  console.log('§FPW before: elements='+q("select count(*) from elements_meta")[0][0]+' FireSuppressionTerminal='+q("select count(*) from elements_meta where ifc_class='IfcFireSuppressionTerminal'")[0][0]+' coverings='+q("select count(*) from elements_meta where ifc_class='IfcCovering'")[0][0]+' rooms='+q("select count(*) from spatial_structure where type='IfcSpace'")[0][0]);
  DW.dwOpen(rules); console.log('§FPW rules='+RULES+' roster='+JSON.stringify(DW.disciplines()));
  var r=DW.dwWalk('FP',db,'Film');
  console.log('§FPW walk placed='+r.placed+' refused='+r.refused+' reason='+(r.reason||'-')+' keys='+Object.keys(r).join(','));
  console.log('§FPW after: FireSuppressionTerminal='+q("select count(*) from elements_meta where ifc_class='IfcFireSuppressionTerminal'")[0][0]+' IfcAlarm='+q("select count(*) from elements_meta where ifc_class='IfcAlarm'")[0][0]+' elements='+q("select count(*) from elements_meta")[0][0]);
  var P=r.placements||[]; console.log('§FPW placement0='+JSON.stringify(P[0]||{}).slice(0,400));
  fs.writeFileSync(process.env.FP_JSON||'fp_placements.json',JSON.stringify({placed:r.placed,hostBind:r.hostBind,storeys:r.storeys,placements:P.map(function(p){return {x:p.x,y:p.y,z:p.z,ifc:p.ifc_class||p.ifc,storey:p.storey,host:p.host,hostGuid:p.hostGuid,bound:p.bound,keys:undefined}})}));
  if(OUT&&process.argv[5]==='save') fs.writeFileSync(OUT,Buffer.from(db.export()));
})().catch(function(e){console.log('§FPW ERROR '+(e&&e.stack||e));process.exit(1)});
