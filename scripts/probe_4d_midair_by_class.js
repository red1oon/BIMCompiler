#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q.9. Read the log after every run; it changes nothing.
// READ-ONLY once-over (2026-11-17): proves/disproves "the remaining played-layer midair is beams" by naming, per class,
// the elected relation + same/cross task + lead; and counts elements shown while their elected support is unfinished (D4 preview).
// Owners called (SupportSweep via cpm_schedule), persisted cache only.
const fs=require('fs'),vm=require('vm'),path=require('path'),cp=require('child_process');
const REPO=path.join(process.env.HOME,'bim-ootb'),REF='origin/main';
const src=f=>cp.execFileSync('git',['-C',REPO,'show',REF+':viewer/'+f],{maxBuffer:1<<26}).toString();
const ctx={console:{log(){}}};ctx.global=ctx;ctx.window=ctx;vm.createContext(ctx);
['schedule_gate.js','cpm_schedule.js','support_sweep.js'].forEach(f=>vm.runInContext(src(f),ctx));
const SG=ctx.ScheduleGate,SS=ctx.SupportSweep,EPS=SG.EPS,GAP=SG.GAP;
const rel=(A,T)=>(A.bz<T.bz-EPS&&A.tz>=T.bz-GAP)?'below':(A.bz<=T.bz+EPS&&A.tz>=T.tz-EPS)?'embed':'above';
const inc=(o,k,v)=>{o[k]=(o[k]||0)+(v||1)};const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n||12).map(e=>e[0]+' '+e[1]).join(' · ')||'none';
for(const dir of process.argv.slice(2)){
 const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));
 const taskOf={};r.tasks.forEach(t=>t.guids.forEach(g=>{taskOf[g]=t.id}));
 const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e,task:taskOf[e.guid]}));
 const G=SS.contactGraph(items),des=SS.designatedSupport(items,G),ma=SS.midairAudit(items),mid=new Set(ma.guids);
 console.log('§ONCE '+r.bld+' codeKey='+r.codeKey+' judged='+items.length+' midair='+ma.midair+' persisted='+r.playStats.midairPlayed+(ma.midair===r.playStats.midairPlayed?' MATCH':' MISMATCH')+' orphans='+ma.orphans);
 const byCls={},byRel={},pair={},task={},lead=[];let fsFail=0,fsFailStruct=0,judged=0,unj=0,unjStruct=0,sub1h=0;const fsCls={};
 items.forEach((T,i)=>{const a=des[i];if(a<0){unj++;if(SG.supportPool(T))unjStruct++;return}judged++;const A=items[a],rl=rel(A,T);
  if(mid.has(T.guid)){inc(byCls,T.cls);inc(byRel,rl);inc(pair,T.cls+'<-'+rl+'<-'+A.cls);inc(task,T.task===A.task?'sameTask':'crossTask');const d=(A.s-T.s)/864e5;lead.push(d);if(d<1/24)sub1h++}
  if(rl!=='embed'&&A.e>T.s+1){fsFail++;inc(fsCls,T.cls);if(SG.supportPool(T))fsFailStruct++}});
 lead.sort((a,b)=>a-b);const q=p=>lead.length?lead[Math.floor(p*(lead.length-1))].toFixed(2):'n/a';
 console.log('   midair by class   : '+top(byCls,14));
 console.log('   midair by relation: '+top(byRel)+' | '+top(task)+' | lead days p50='+q(.5)+' p90='+q(.9)+' max='+q(1)+' | lead<1h='+sub1h);
 console.log('   midair top pairs  : '+top(pair,12));
 console.log('   UNJUDGED (no elected support)='+unj+' of which structural(pool)='+unjStruct);
 console.log('   D4 preview (finish-test, bearing+hanging; elected support END > element START): '+fsFail+' of '+judged+' structuralT='+fsFailStruct+' | '+top(fsCls,8));
}
