#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY step-attribution probe for prompts/4D_MODEL_INTEGRITY.md §Q.11. Read the log after every run.
// usage: VIEWER=<dir of the AFTER code viewer/> node scripts/probe_4d_step_attribution.js <beforeDir> <afterDir> [...pairs]
// READ-ONLY: D1 gate-2 attribution — for elements midair AFTER but not BEFORE: what was elected before, what is elected now,
// is the new support a promoted wall, relation, same/cross task.
const fs=require('fs'),vm=require('vm'),path=require('path');
const load=()=>{const ctx={console:{log(){}}};ctx.global=ctx;ctx.window=ctx;vm.createContext(ctx);['schedule_gate.js','cpm_schedule.js','support_sweep.js'].forEach(f=>vm.runInContext(fs.readFileSync((process.env.VIEWER||path.join(process.env.HOME,'bim-ootb','viewer'))+'/'+f,'utf8'),ctx));return ctx};
const ctx=load(),SG=ctx.ScheduleGate,SS=ctx.SupportSweep,EPS=SG.EPS,GAP=SG.GAP;
const rel=(A,T)=>(A.bz<T.bz-EPS&&A.tz>=T.bz-GAP)?'below':(A.bz<=T.bz+EPS&&A.tz>=T.tz-EPS)?'embed':'above';
const inc=(o,k)=>{o[k]=(o[k]||0)+1};const show=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n||10).map(e=>e[0]+' '+e[1]).join(' · ')||'none';
const one=dir=>{const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));const taskOf={};r.tasks.forEach(t=>t.guids.forEach(g=>{taskOf[g]=t.id}));
 const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e,task:taskOf[e.guid]}));
 const G=SS.contactGraph(items),des=SS.designatedSupport(items,G),mid=new Set(SS.midairAudit(items).guids);const by={};items.forEach((x,i)=>{by[x.guid]={x,sup:des[i]>=0?items[des[i]]:null}});return{r,by,mid}};
const a=process.argv.slice(2);for(let i=0;i<a.length;i+=2){const B=one(a[i]),A=one(a[i+1]);const neu=[...A.mid].filter(g=>!B.mid.has(g));
 const m={},cell={},same={};let viaPromoted=0,supChanged=0;
 neu.forEach(g=>{const n=A.by[g],o=B.by[g];const S=n.sup;const prom=S.cls.indexOf('IfcWall')===0&&S.seq===2&&B.by[S.guid].x.seq!==2;if(prom)viaPromoted++;
  if(!o.sup||o.sup.guid!==S.guid)supChanged++;
  inc(m,n.x.cls+'<-'+rel(S,n.x)+'<-'+S.cls+(prom?'(PROMOTED)':'')+(n.x.task===S.task?' same':' cross'));
  inc(same,(n.x.seq===S.seq?'sameSeq':'diffSeq')+'/'+(n.x.resource===S.resource?'sameCrew':'diffCrew')+'/'+(n.x.task===S.task?'sameTask':'crossTask'));});
 console.log('§D1_ATTR '+A.r.bld+' newlyMidair='+neu.length+' supportIsPromotedWall='+viaPromoted+' electedSupportChanged='+supChanged+' | elementItselfPromoted='+neu.filter(g=>A.by[g].x.seq===2&&B.by[g].x.seq!==2).length);
 console.log('   '+show(m,12));console.log('   '+show(same,8));}
