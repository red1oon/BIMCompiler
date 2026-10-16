#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — PoC for §29 §INDOOR_BEATS (prompts/MEP_CLASH_REVEAL_MOVIE.md).
 * Read the log after every run. Scope: HHS + Hospital. Selection only — draws nothing, resolves no
 * camera, casts no ray. Reports the four indoor candidates and applies §27.3c's datum-restatement
 * guard to the two that are prone to it.
 */
'use strict';
var fs=require('fs'), path=require('path'), OOTB='/home/red1/bim-ootb';
var initSqlJs=require(path.join(OOTB,'modeller','lib','sql-wasm.js'));
var wasm=fs.readFileSync(path.join(OOTB,'modeller','lib','sql-wasm.wasm'));
var DATUM_TOL=0.02;

function rows(db,q){ var r; try{ r=db.exec(q); }catch(e){ return []; } return r.length? r[0].values:[]; }
function med(a){ a=a.slice().sort(function(x,y){return x-y;}); return a.length? a[Math.floor(a.length/2)]:0; }

function datumFigures(db){
  var lv={};
  rows(db,"SELECT m.storey,t.center_z,t.bbox_x,t.bbox_y,t.bbox_z FROM elements_meta m "+
          "JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='IfcSlab'").forEach(function(v){
    var bx=+v[2],by=+v[3],bz=+v[4]; if(bz>=0.5*Math.min(bx,by)) return;
    var k=String(v[0]), a=bx*by; if(!(k in lv)||a>lv[k].a) lv[k]={z:+v[1],a:a};
  });
  var zs=Object.keys(lv).map(function(k){return lv[k].z;}).sort(function(a,b){return a-b;});
  var f=[]; for(var i=1;i<zs.length;i++){ var h=zs[i]-zs[i-1]; if(h>1.0) f.push(h); }
  if(zs.length>1) f.push(zs[zs.length-1]-zs[0]);
  return f;
}
function restates(v,figs){ for(var i=0;i<figs.length;i++) if(Math.abs(v-figs[i])<=DATUM_TOL*figs[i]) return figs[i]; return null; }

function typeHist(list){                      // §6 dedupe: the repeated size is ONE measure
  var h={}; list.forEach(function(d){ var k=d[0].toFixed(1)+'x'+d[1].toFixed(1); (h[k]=h[k]||[]).push(d); });
  return Object.keys(h).map(function(k){ return {k:k,n:h[k].length,d:h[k][0]}; })
               .sort(function(a,b){ return b.n-a.n; });
}

function run(SQL,bld){
  var p=path.join(OOTB,'buildings',bld+'_extracted.db');
  var sp=path.join(OOTB,'buildings',bld.indexOf('Hospital')===0?'Hospital_silent_local.db':bld+'_silent.db');
  if(!fs.existsSync(p)){ console.log('  SKIP '+bld); return; }
  var db=new SQL.Database(fs.readFileSync(p));
  var figs=datumFigures(db);
  console.log('\n── '+bld+' ──');
  console.log('  §INDOOR_DATUM figures(m)= '+figs.map(function(f){return f.toFixed(2);}).join(' · '));

  // 1. HALL — the walkable raster, and WHERE it lives
  var wr=[];
  if(fs.existsSync(sp)){
    var d2=new SQL.Database(fs.readFileSync(sp));
    wr=rows(d2,"SELECT storey,res,cols,rows FROM storey_walkable_raster");
    d2.close();
  }
  console.log('  §INDOOR_HALL walkableRaster in '+path.basename(sp)+': '+
    (wr.length? wr.length+' storeys @ res '+wr[0][1]+'m  ['+wr.map(function(v){return v[0]+' '+v[2]+'x'+v[3];}).join(' · ')+']'
              : 'ABSENT — VACUOUS, the hall beat cannot run on this building'));

  // 2. STAIR — rise is the trap, the going is the measure
  ['IfcStair','IfcStairFlight'].forEach(function(cls){
    var r=rows(db,"SELECT element_name,bbox_x,bbox_y,bbox_z FROM elements_meta m "+
      "JOIN element_transforms t USING(guid) WHERE ifc_class='"+cls+"'");
    if(!r.length){ console.log('  §INDOOR_STAIR '+cls+' VACUOUS — none'); return; }
    var rise=r.map(function(v){return +v[3];}), run_=r.map(function(v){return Math.max(+v[1],+v[2]);});
    var mr=med(rise), mg=med(run_), clash=restates(mr,figs);
    console.log('  §INDOOR_STAIR '+cls+' n='+r.length+' riseMedian='+(mr*1000).toFixed(0)+'mm'+
      (clash? ' ⛔ RESTATES the datum figure '+clash.toFixed(2)+'m — do NOT cue the rise' : ' (no datum clash)')+
      '  goingMedian='+(mg*1000).toFixed(0)+'mm ← cue this');
  });

  // 3. DOOR / WINDOW — the deduped type
  ['IfcDoor','IfcWindow'].forEach(function(cls){
    var r=rows(db,"SELECT bbox_x,bbox_y,bbox_z FROM elements_meta m JOIN element_transforms t USING(guid) "+
      "WHERE ifc_class='"+cls+"'");
    if(!r.length){ console.log('  §INDOOR_OPENING '+cls+' VACUOUS — none in this model'); return; }
    var leaves=r.map(function(v){ var d=[+v[0],+v[1],+v[2]].sort(function(a,b){return b-a;}); return [d[0],d[1]]; });
    var t=typeHist(leaves)[0];
    console.log('  §INDOOR_OPENING '+cls+' n='+r.length+' dominantType='+
      (t.d[0]*1000).toFixed(0)+' x '+(t.d[1]*1000).toFixed(0)+'mm x'+t.n+
      ' ('+(100*t.n/r.length).toFixed(0)+'% of the population)');
  });

  // 4. CLEAR HEIGHT — the only raycast; here we can only say what the TOTAL would restate
  console.log('  §INDOOR_HEIGHT total-height would restate a datum figure by construction '+
    '(storey heights above) — cue CLEAR height only. Needs a vertical cast: NOT resolvable here, INCONCLUSIVE.');
  db.close();
}

initSqlJs({wasmBinary:wasm}).then(function(SQL){
  console.log('═══ §INDOOR_BEATS PoC — hall · stair · opening · clear height. '+
    new Date().toISOString().slice(0,10)+' ═══');
  ['Hospital','HHS_Office_Federated'].forEach(function(b){ run(SQL,b); });
  console.log('\n═══ done ═══');
});
