#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q.10. Read the log after every run; it changes nothing.
// READ-ONLY: §STRUCT_NO_SUPPORT elements — what do they touch (below/embedded/above), and do they start before their first contact?
const fs=require('fs'),vm=require('vm'),path=require('path'),cp=require('child_process');
const REPO=path.join(process.env.HOME,'bim-ootb');const src=f=>cp.execFileSync('git',['-C',REPO,'show','origin/main:viewer/'+f],{maxBuffer:1<<26}).toString();
const ctx={console:{log(){}}};ctx.global=ctx;ctx.window=ctx;vm.createContext(ctx);['schedule_gate.js','cpm_schedule.js','support_sweep.js'].forEach(f=>vm.runInContext(src(f),ctx));
const SG=ctx.ScheduleGate,SS=ctx.SupportSweep,EPS=SG.EPS,GAP=SG.GAP;const inc=(o,k)=>{o[k]=(o[k]||0)+1};const show=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · ')||'none';
const rel=(A,T)=>(A.bz<T.bz-EPS&&A.tz>=T.bz-GAP)?'below':(A.bz<=T.bz+EPS&&A.tz>=T.tz-EPS)?'embed':'above';
for(const dir of process.argv.slice(2)){const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));
 const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e}));
 const G=SS.contactGraph(items),des=SS.designatedSupport(items,G),ns=des.structNoSupport||[];
 const shape={},before={},belowCls={};let strict=0;
 ns.forEach(i=>{const T=items[i],c=G.contacts[i]||[];const rs=new Set(c.map(j=>rel(items[j],T)));
  const k=rs.has('below')?'has non-pool contact BELOW':rs.has('embed')?'embedded only':rs.has('above')?'contacts ABOVE only':'no contacts';inc(shape,k);
  const first=Math.min(...c.map(j=>items[j].s));if(c.length&&T.s<first-1){strict++;inc(before,T.cls+' / '+k)}
  if(rs.has('below'))c.forEach(j=>{if(rel(items[j],T)==='below')inc(belowCls,items[j].cls)});});
 console.log('§NOSUP '+r.bld+' structNoSupport='+ns.length+' | '+show(shape));
 console.log('   starts before EVERY contact (the independent judge\'s strict midair)='+strict+' : '+show(before));
 console.log('   classes of the non-pool contacts below: '+show(belowCls));}
