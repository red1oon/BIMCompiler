#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q.13. Read the log after every run; it changes nothing.
// usage: VIEWER=<bim-ootb checkout>/viewer node scripts/probe_4d_residue.js <cacheDir> [...]
// READ-ONLY residue attribution with the CURRENT owners (VIEWER=): top (T<-rel<-S) pairs, same/cross task, lead, sub-hour count.
const fs=require('fs'),path=require('path');const V=process.env.VIEWER;
global.ScheduleGate=require(V+'/schedule_gate.js');const CP=require(V+'/cpm_schedule.js');global.CpmSchedule=CP;const SS=require(V+'/support_sweep.js');const SG=global.ScheduleGate;
const q=console.log;const quiet=f=>{console.log=()=>{};try{return f()}finally{console.log=q}};const inc=(o,k)=>{o[k]=(o[k]||0)+1};const show=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n).map(e=>e[0]+' '+e[1]).join(' · ')||'none';
for(const dir of process.argv.slice(2)){const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));const taskOf={};r.tasks.forEach(t=>t.guids.forEach(g=>{taskOf[g]=t.id}));
 const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e}));
 const G=quiet(()=>SS.contactGraph(items)),des=quiet(()=>SS.designatedSupport(items,G)),mid=new Set(quiet(()=>SS.midairAudit(items)).guids);
 const _ring=CP.electionRings(des);const pr={},tp={};let sub=0,n=0,sameT=0;const leads=[];
 items.forEach((T,i)=>{if(!mid.has(T.guid))return;const A=items[des[i]];n++;const emb=CP.supportIsEmbedded(A,T);const rel=emb?'embed':(A.bz<T.bz-SG.EPS&&A.tz>=T.bz-SG.GAP?'below':'above');
  const same=taskOf[T.guid]===taskOf[A.guid];if(same)sameT++;inc(pr,T.cls.replace('Ifc','')+'<-'+rel+'<-'+A.cls.replace('Ifc','')+(same?' same':' X'));
  if(!same)inc(tp,String(taskOf[T.guid]).replace('TASK_','')+' <- '+String(taskOf[A.guid]).replace('TASK_',''));
  const lead=((emb?A.s:A.e)-T.s)/864e5;leads.push(lead);if(lead<1/24)sub++;});
 leads.sort((a,b)=>a-b);const p=x=>leads.length?leads[Math.floor(x*(leads.length-1))].toFixed(2):'-';
 console.log('§RESID '+r.bld+' midair='+n+' sameTask='+sameT+' crossTask='+(n-sameT)+' gap<1h='+sub+' gapDays p50='+p(.5)+' p90='+p(.9)+' max='+p(1));
 console.log('   pairs: '+show(pr,9));console.log('   cross-task: '+show(tp,4));}
