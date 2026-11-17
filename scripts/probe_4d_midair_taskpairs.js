#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q.9. Read the log after every run; it changes nothing.
// READ-ONLY: for cross-task midair, which (element task <- support task) pairs carry it, and is there a template edge between them?
const fs=require('fs'),vm=require('vm'),path=require('path'),cp=require('child_process');
const REPO=path.join(process.env.HOME,'bim-ootb');const src=f=>cp.execFileSync('git',['-C',REPO,'show','origin/main:viewer/'+f],{maxBuffer:1<<26}).toString();
const ctx={console:{log(){}}};ctx.global=ctx;ctx.window=ctx;vm.createContext(ctx);['schedule_gate.js','cpm_schedule.js','support_sweep.js'].forEach(f=>vm.runInContext(src(f),ctx));
const SS=ctx.SupportSweep;const inc=(o,k)=>{o[k]=(o[k]||0)+1};
for(const dir of process.argv.slice(2)){const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));
 const taskOf={},T={};r.tasks.forEach(t=>{T[t.id]=t;t.guids.forEach(g=>{taskOf[g]=t.id})});
 const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e,task:taskOf[e.guid]}));
 const G=SS.contactGraph(items),des=SS.designatedSupport(items,G),mid=new Set(SS.midairAudit(items).guids);
 const pr={},win={};let tStartLater=0,tOverlap=0,n=0;
 items.forEach((x,i)=>{if(!mid.has(x.guid))return;const A=items[des[i]];if(A.task===x.task)return;n++;const k=x.task+'  <-  '+A.task;inc(pr,k);
  const a=T[x.task],b=T[A.task];if(a&&b){const as=a.sDays,ae=a.eDays,bs=b.sDays,be=b.eDays;win[k]="el "+as+"-"+ae+"d sup "+bs+"-"+be+"d"; if(bs>=ae)tStartLater++;else tOverlap++}});
 console.log('§TASKPAIR '+r.bld+' crossTaskMidair='+n+' distinctPairs='+Object.keys(pr).length+' support TASK starts at/after element TASK ENDS='+tStartLater+' windows overlap='+tOverlap);
 Object.entries(pr).sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(e=>console.log('   '+e[1]+'  '+e[0]+'  '+JSON.stringify(win[e[0]])));}
