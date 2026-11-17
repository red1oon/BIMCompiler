#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q.13. Read the log after every run; it changes nothing.
// usage: VIEWER=<bim-ootb checkout>/viewer node scripts/probe_4d_judged_coverage.js <cacheDir> [...]
// READ-ONLY: is a low midair count real? — how much of the population is JUDGED (has an elected support), and what the rest is.
const fs=require('fs'),path=require('path');const V=process.env.VIEWER;
global.ScheduleGate=require(V+'/schedule_gate.js');const CP=require(V+'/cpm_schedule.js');global.CpmSchedule=CP;const SS=require(V+'/support_sweep.js');const SG=global.ScheduleGate;
const q=console.log;const quiet=f=>{console.log=()=>{};try{return f()}finally{console.log=q}};
for(const dir of process.argv.slice(2)){const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));
 const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e}));
 const G=quiet(()=>SS.contactGraph(items)),des=quiet(()=>SS.designatedSupport(items,G)),ma=quiet(()=>SS.midairAudit(items));
 let judged=0,seed=0,noContact=0,other=0;const ns=(des.structNoSupport||[]).length,co=(des.contactOnly||[]).length;
 items.forEach((T,i)=>{if(des[i]>=0){judged++;return}if(T.seq===1||T.phase==='Substructure')seed++;else if(!G.contacts[i])noContact++;else other++});
 const piles={};Object.values(r.play).forEach(p=>{const m=Math.floor(p.s/60000);piles[m]=(piles[m]||0)+1});let in20=0;Object.values(piles).forEach(c=>{if(c>=20)in20+=c});let secs=0;r.els.forEach(e=>secs+=e.installSecs||0);
 console.log('§COVERAGE '+r.bld+' n='+items.length+' JUDGED='+judged+' ('+(100*judged/items.length).toFixed(1)+'%) midair='+ma.midair+' | unjudged: groundSeeds='+seed+' noContactAtAll='+noContact+' structNoSupport(named)='+ns+' contactOnly(named)='+co+' other='+(other-ns-co)+' | orphans='+ma.orphans+' pilesGE20='+in20+' installSecs='+Math.round(secs));}
