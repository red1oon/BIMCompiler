#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q.13. Read the log after every run; it changes nothing.
// usage: VIEWER=<bim-ootb checkout>/viewer node scripts/probe_4d_one_lift.js <cacheDir> [...]
// READ-ONLY: how many elements are judged as ring (one-lift) members, do ring members really share a start on the played layer, max lift size, stacking.
const fs=require('fs'),path=require('path');const V=process.env.VIEWER;
global.ScheduleGate=require(V+'/schedule_gate.js');const CP=require(V+'/cpm_schedule.js');global.CpmSchedule=CP;const SS=require(V+'/support_sweep.js');
const q=console.log;const quiet=f=>{console.log=()=>{};try{return f()}finally{console.log=q}};
for(const dir of process.argv.slice(2)){const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json')));
 const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e}));
 const G=quiet(()=>SS.contactGraph(items)),des=quiet(()=>SS.designatedSupport(items,G)),ring=CP.electionRings(des);
 const size={};let members=0,sameStart=0,diffStart=0,max=0;items.forEach((T,i)=>{if(ring[i]<0)return;members++;size[ring[i]]=(size[ring[i]]||0)+1;const A=items[des[i]];if(Math.abs(A.s-T.s)<=1)sameStart++;else diffStart++});
 Object.values(size).forEach(v=>{if(v>max)max=v});const piles={};Object.values(r.play).forEach(p=>{const m=Math.floor(p.s/60000);piles[m]=(piles[m]||0)+1});let in20=0,mp=0;Object.values(piles).forEach(c=>{if(c>=20)in20+=c;if(c>mp)mp=c});
 console.log('§RING '+r.bld+' judged='+items.length+' ringMembers='+members+' ('+(100*members/items.length).toFixed(1)+'%) rings='+ring.count+' maxRingSize='+max+' membersSharingStartWithSupport='+sameStart+' notSharing='+diffStart+' | maxPile='+mp+' elementsInPiles>=20='+in20);}
