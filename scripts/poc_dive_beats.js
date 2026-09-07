#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — PoC for §27 §DIVE_BEATS (prompts/MEP_CLASH_REVEAL_MOVIE.md).
 * Read the log after every run. Scope: HHS + Hospital ONLY — the two buildings with a stored
 * cinema_path (`*_silent*.db`), so the dive window is READ, never assumed.
 *
 * Allocates the dive stretch to at most three cues — floor plate (§26), beam, column — each a
 * §14 slot, none overlapping. SELECTION ONLY: draws nothing, resolves no camera. Frustum is
 * plan.poseAt in the viewer (§16). No GPU, no browser, no scene.
 */
'use strict';
var fs=require('fs'), path=require('path'), OOTB='/home/red1/bim-ootb';
var initSqlJs=require(path.join(OOTB,'modeller','lib','sql-wasm.js'));
var wasm=fs.readFileSync(path.join(OOTB,'modeller','lib','sql-wasm.wasm'));

var TINT=2.0, GAP=0.5, SLOT=TINT+GAP;   // §14: 0.6 in / 1.0 hold / 0.6 out + 0.5 clear = 2.5s
var BUCKET=0.1;                         // 100mm dedupe bucket — the drawing unit, not a tuned value
var DATUM_TOL=0.02;                     // 2% — a column within this of a datum figure RESTATES it

function sem(raw){ if(!raw) return null; var p=String(raw).split(':');
  return (p.length>=3? p.slice(1,p.length-1).join(':') : String(raw)).trim(); }

function loadPath(bld,SQL){
  var out={wps:[],total:null,dive:null,src:'NONE'};
  fs.readdirSync(path.join(OOTB,'buildings')).forEach(function(f){
    if(out.src!=='NONE') return;
    if(f.indexOf(bld)!==0 || f.indexOf('silent')<0 || !/\.db$/.test(f)) return;
    try{
      var d=new SQL.Database(fs.readFileSync(path.join(OOTB,'buildings',f)));
      var q=d.exec("SELECT ifc_x,ifc_y,ifc_z,dir_x,dir_y,dir_z,total_sec,dive_sec FROM cinema_path ORDER BY seq");
      if(q.length&&q[0].values.length){
        q[0].values.forEach(function(v){ out.wps.push({x:+v[0],y:+v[1],z:+v[2],dx:+v[3],dy:+v[4],dz:+v[5]}); });
        out.total=+q[0].values[0][6]; out.dive=+q[0].values[0][7]; out.src=f;
      }
      d.close();
    }catch(e){}
  });
  return out;
}

function rows(db,sql,args){ var r; try{ r=db.exec(sql,args); }catch(e){ return []; } return r.length? r[0].values:[]; }

function elems(db,cls){
  return rows(db,"SELECT m.guid,m.element_name,m.storey,t.center_x,t.center_y,t.center_z,"+
    "t.bbox_x,t.bbox_y,t.bbox_z FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid "+
    "WHERE m.ifc_class='"+cls+"'").map(function(v){
      var bx=+v[6],by=+v[7],bz=+v[8], vert=bz>Math.max(bx,by);
      return {guid:v[0],name:sem(v[1]),storey:v[2],cx:+v[3],cy:+v[4],cz:+v[5],
              bx:bx,by:by,bz:bz,vert:vert,len:vert?bz:Math.max(bx,by)};
    });
}

// The datum's own figures: storey elevations from the slabs, and the L-first→L-last overall.
function datumFigures(db){
  var lv={};
  elems(db,'IfcSlab').forEach(function(s){
    if(s.bz>=0.5*Math.min(s.bx,s.by)) return;
    var k=String(s.storey); if(!(k in lv)||s.bx*s.by>lv[k].a) lv[k]={z:s.cz,a:s.bx*s.by};
  });
  var zs=Object.keys(lv).map(function(k){return lv[k].z;}).sort(function(a,b){return a-b;});
  var out=[];
  for(var i=1;i<zs.length;i++){ var h=zs[i]-zs[i-1]; if(h>1.0) out.push(h); }
  if(zs.length>1) out.push(zs[zs.length-1]-zs[0]);
  return out;
}
function restatesDatum(len,figs){
  for(var i=0;i<figs.length;i++) if(Math.abs(len-figs[i])<=DATUM_TOL*figs[i]) return figs[i];
  return null;
}

// dedupe to a length TYPE (§6: 440 doors at 1,083mm are ONE measure)
function typeOf(cands){
  var b={}; cands.forEach(function(c){ var k=Math.round(c.len/BUCKET)*BUCKET; (b[k]=b[k]||[]).push(c); });
  var best=null; Object.keys(b).forEach(function(k){ if(!best||b[k].length>b[best].length) best=k; });
  return {mm:Math.round(+best*1000), n:b[best].length, members:b[best]};
}

function run(SQL,bld){
  var dbf=path.join(OOTB,'buildings',bld+'_extracted.db');
  var cdir=path.join(process.env.HOME,'.cache','bim4d',bld);
  if(!fs.existsSync(dbf)||!fs.existsSync(cdir)){ console.log('  SKIP '+bld); return; }
  var sub=fs.readdirSync(cdir).filter(function(x){return fs.statSync(path.join(cdir,x)).isDirectory();});
  sub.sort(function(a,c){return fs.statSync(path.join(cdir,c)).mtimeMs-fs.statSync(path.join(cdir,a)).mtimeMs;});
  var r4=JSON.parse(fs.readFileSync(path.join(cdir,sub[0],'run.json'),'utf8'));
  var db=new SQL.Database(fs.readFileSync(dbf));
  var P=loadPath(bld,SQL);

  // ⚠ THE CLOCK. Hospital's bake is MEASURED at 4,699 frames @ 24 fps = 195.79 s (§MAXQ_START) and
  // its dive_sec 18.29 = 0.094 x 195.8 exactly (§CINEMA_BEATS) => dive_sec is in BAKE seconds.
  // HHS has NO such measurement: 1.85/61.04 = 0.030, which matches no beat fraction. So HHS's film
  // length is UNVERIFIED and every HHS second below is reported against total_sec, flagged.
  var film = (bld.indexOf('Hospital')===0) ? 195.8 : P.total;
  var clock = (bld.indexOf('Hospital')===0) ? 'bake MEASURED 195.8s (4699f@24fps)'
                                            : 'total_sec '+P.total.toFixed(2)+'s ⚠ UNVERIFIED as the bake clock';
  var play=r4.play, ss=[],ee=[];
  for(var k in play){ ss.push(play[k].s); ee.push(play[k].e); }
  var t0=Math.min.apply(null,ss), t1=Math.max.apply(null,ee), span=t1-t0;
  var sec=function(g){ var p=play[g]; return p? (p.s-t0)/span*film : null; };

  console.log('\n── '+bld+' ──');
  console.log('  §DIVE_BEATS_CLOCK path='+P.src+' waypoints='+P.wps.length+' dive='+P.dive.toFixed(2)+'s  film='+clock);
  var slots=Math.floor(P.dive/SLOT);
  console.log('  §DIVE_BEATS_BUDGET diveSec='+P.dive.toFixed(2)+' slotSec='+SLOT.toFixed(1)+
    ' => '+slots+' non-overlapping slot(s) (§14 one cue at a time)');

  var picks={};
  var figs=datumFigures(db);
  console.log('  §DIVE_BEATS_DATUM figures(m)= '+figs.map(function(f){return f.toFixed(2);}).join(' · ')+
    '   (a column within '+(DATUM_TOL*100)+'% of one RESTATES the datum)');

  ['IfcBeam','IfcColumn'].forEach(function(cls){
    var all=elems(db,cls).filter(function(c){ c.sec=sec(c.guid); return c.sec!=null; });
    if(!all.length){ console.log('  §DIVE_BEATS_'+cls+' VACUOUS — none in this model'); return; }
    var inDive=all.filter(function(c){ return c.sec<P.dive; });
    var T=typeOf(all);
    var pool=(cls==='IfcColumn')? inDive.filter(function(c){ return !restatesDatum(c.len,figs); }) : inDive;
    var lost=inDive.length-pool.length;
    pool.sort(function(a,b){ return b.len-a.len; });
    console.log('  §DIVE_BEATS_'+cls+' n='+all.length+' inDive='+inDive.length+
      ' typeLen='+T.mm+'mm x'+T.n+' longestInDive='+(pool[0]?Math.round(pool[0].len*1000)+'mm':'—')+
      (lost?' rejectedAsDatumRestatement='+lost:''));
    if(pool[0]) console.log('      best: '+Math.round(pool[0].len*1000)+'mm @'+pool[0].sec.toFixed(2)+
      's  '+(pool[0].vert?'VERT':'HORZ')+'  storey='+pool[0].storey+'  ['+pool[0].name+']');
    else console.log('      NOTHING in the dive'+(lost?' after datum-restatement rejection':'')+' — and it says so');
    picks[cls]=pool;
  });

  // ── SLOT ALLOCATION — §14, one cue on screen at a time. The plate (§26) is ANCHORED at its own
  //    second; beam and column are PLACED, so they take the best instance in a still-free slot.
  // ⚠ THE PLATE IS §26's DECISION — LONGEST HOLD, NOT LARGEST AREA. Re-deriving it here first
  //    produced Level 2 (8,963 m²) over §26's Level 1 (8,899 m²): a 74 m² area difference
  //    overriding a settled rule. CLAUDE.md §0 — call the owner, do not re-derive.
  var plates=elems(db,'IfcSlab').filter(function(c){
    c.sec=sec(c.guid); c.area=c.bx*c.by;
    return c.bz<0.5*Math.min(c.bx,c.by) && c.sec!=null; });
  var amax=Math.max.apply(null,plates.map(function(c){return c.area;}));
  var pool=plates.filter(function(c){return c.area>=0.25*amax;}).sort(function(a,b){return a.sec-b.sec;});
  pool.forEach(function(c,i){ c.hold=(i+1<pool.length)? pool[i+1].sec-c.sec : Infinity; });
  var slab=pool.filter(function(c){ return c.sec<P.dive && c.hold>=2.0; })
               .sort(function(a,b){ return b.hold-a.hold; })[0] || null;
  var slabAfter=!slab? pool.filter(function(c){return c.hold>=2.0;})
               .sort(function(a,b){return b.hold-a.hold;})[0] : null;
  var taken=[];
  function free(t){ return taken.every(function(w){ return t+SLOT<=w[0] || t>=w[1]; }); }
  function claim(t,who){ taken.push([t,t+SLOT,who]); }
  var plan=[];
  if(P.dive<SLOT){
    console.log('  ⛔ §DIVE_BEATS_NOFIT dive '+P.dive.toFixed(2)+'s < one '+SLOT.toFixed(1)+
      's slot — NO cue can complete inside this dive. Nothing is squeezed (§14).');
    if(slabAfter) console.log('      the plate still qualifies AFTER the dive: '+slabAfter.sec.toFixed(2)+
      's · '+Math.round(slabAfter.area)+' m² · ['+slabAfter.name+']');
    console.log('  §DIVE_BEATS_PLAN slots=0 allocated=0 — INCONCLUSIVE for the dive stretch on this building');
    db.close(); return;
  }
  if(slab){ claim(slab.sec,'plate'); plan.push({t:slab.sec,what:'floor plate',
    v:Math.round(slab.area)+' m² · '+slab.bx.toFixed(2)+' × '+slab.by.toFixed(2)+' m',n:slab.name}); }
  ['IfcColumn','IfcBeam'].forEach(function(cls){
    var got=(picks[cls]||[]).filter(function(c){ return free(c.sec); })[0];
    if(got){ claim(got.sec,cls); plan.push({t:got.sec,what:cls.replace('Ifc','').toLowerCase(),
      v:Math.round(got.len*1000)+' mm',n:got.name}); }
    else plan.push({t:null,what:cls.replace('Ifc','').toLowerCase(),v:null,n:null});
  });
  plan.sort(function(a,b){ return (a.t==null?1e9:a.t)-(b.t==null?1e9:b.t); });
  console.log('  §DIVE_BEATS_PLAN slots='+slots+' allocated='+taken.length);
  plan.forEach(function(x){
    if(x.t==null){ console.log('      ——— '+x.what+': NO free slot — DROPPED, not squeezed (§14)'); return; }
    console.log('      '+x.t.toFixed(2)+'s → '+x.t.toFixed(2)+'–'+(x.t+TINT).toFixed(2)+'s  '+
      x.what.padEnd(12)+x.v.padEnd(26)+'['+x.n+']');
  });
  db.close();
}

initSqlJs({wasmBinary:wasm}).then(function(SQL){
  console.log('═══ §DIVE_BEATS PoC — HHS + Hospital (the two with a stored path). '+
    new Date().toISOString().slice(0,10)+' ═══');
  ['Hospital','HHS_Office_Federated'].forEach(function(b){ run(SQL,b); });
  console.log('\n═══ done ═══');
});
