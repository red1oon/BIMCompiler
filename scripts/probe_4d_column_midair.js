#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q.7 (columns vs the slab
// they stand on). Proves or disproves: "a column judged midair appears before its own floor" — by naming
// the elected relation, and whether that slab is filed in the SAME task as the column. Read the log
// after every run; it changes nothing. Owners CALLED (§I), loaded from bim-ootb origin/main via git show,
// over the PERSISTED run.json + witness.log (PRIMAL LAW 5). Self-check: recount == playStats.midairPlayed.
// usage: node scripts/probe_4d_column_midair.js <cacheDir> [...]   (BIM_OOTB=~/bim-ootb, REF=origin/main)
const fs=require('fs'),vm=require('vm'),path=require('path'),cp=require('child_process');
const REPO=process.env.BIM_OOTB||(process.env.HOME+'/bim-ootb'), REF=process.env.REF||'origin/main'; const src=f=>cp.execFileSync('git',['-C',REPO,'show',REF+':viewer/'+f],{maxBuffer:1<<26}).toString();
console.log('§COL_MIDAIR_SRC judge=bim-ootb '+REF+'@'+cp.execFileSync('git',['-C',REPO,'rev-parse','--short',REF]).toString().trim());
const ctx={console:{log(){}}}; ctx.global=ctx; ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(src('schedule_gate.js'),ctx); vm.runInContext(src('cpm_schedule.js'),ctx); vm.runInContext(src('support_sweep.js'),ctx);   // cpm_schedule = the support-relation owner (§I.1a)
const SG=ctx.ScheduleGate, SS=ctx.SupportSweep, EPS=SG.EPS, GAP=SG.GAP;
const rel=(A,T)=>(A.bz<T.bz-EPS&&A.tz>=T.bz-GAP)?0:(A.bz<=T.bz+EPS&&A.tz>=T.tz-EPS)?1:2; const RN=['bearing-below','embedded','carrier-above'];
const inc=(o,k)=>{o[k]=(o[k]||0)+1;}; const show=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · ')||'none';
const band=(lad,z)=>{let b=0; for(let i=0;i<lad.length;i++) if(z>=lad[i]) b=i; return b;};
for(const dir of process.argv.slice(2)){
  const r=JSON.parse(fs.readFileSync(path.join(dir,'run.json'))); const log=fs.readFileSync(path.join(dir,'witness.log'),'utf8');
  const taskOf={},lvlOfTask={}; r.tasks.forEach(t=>{t.guids.forEach(g=>taskOf[g]=t.id); lvlOfTask[t.id]=t.storey;});
  const items=r.els.filter(e=>r.play[e.guid]).map(e=>Object.assign({},e,{s:r.play[e.guid].s,e:r.play[e.guid].e,task:taskOf[e.guid]}));
  const G=SS.contactGraph(items),des=SS.designatedSupport(items,G),ma=SS.midairAudit(items),mid=new Set(ma.guids);
  console.log('§COL_MIDAIR '+r.bld+' db='+r.dbFile+' codeKey='+r.codeKey+' layer=played midair='+ma.midair+' persisted='+r.playStats.midairPlayed+' selfcheck='+(ma.midair===r.playStats.midairPlayed?'MATCH':'MISMATCH'));
  const sm=(log.match(/§STOREY_DATUM mode=(\S+) source=(\S+)/)||[]); const usedSrc=sm[2]||null; const seen={};
  const used=(r.storeys||[]).filter(s=>usedSrc&&s[usedSrc]!=null&&!(seen[s.name+'@'+s[usedSrc]])&&(seen[s.name+'@'+s[usedSrc]]=1)).map(s=>({n:s.name,z:s[usedSrc],src:(sm[1]||'?')+'/'+usedSrc})).sort((a,b)=>a.z-b.z);
  const floor={}; (log.match(/§STOREY_DATUM_FLOOR st=.*$/gm)||[]).forEach(l=>{const m=l.match(/st=(.+?) walls=\d+ meanCentreZ=([\d.-]+) meanBaseZ=([\d.-]+)/); if(m) floor[m[1]]={c:+m[2],b:+m[3]};});
  console.log('   ladder USED for banding ('+(used[0]?used[0].src:'none')+'): '+used.map(s=>s.n+'@'+s.z.toFixed(2)).join(' ')||'none');
  console.log('   same storeys, logged §STOREY_DATUM_FLOOR: '+(Object.keys(floor).map(k=>k+' centre='+floor[k].c.toFixed(2)+' FLOOR='+floor[k].b.toFixed(2)).join(' | ')||'none logged'));
  const all={},bad={}; let cols=0,noSup=0,nMid=0; const geo={same:[],other:[]}, perTask={}; const cs={n:0,mid:0,sameTask:0,sameTaskMid:0,slabTaskEarlier:0,slabTaskEarlierMid:0,slabTaskLater:0,slabTaskLaterMid:0}, lead=[];
  const usedZ=used.map(s=>s.z), floorZ=used.map(s=>floor[s.n]?floor[s.n].b:null); const haveFloor=floorZ.length>0&&floorZ.every(z=>z!=null);
  const wi={pairs:0,nowSame:0,nowSlabLower:0,nowSlabHigher:0,floorSame:0,floorSlabLower:0,floorSlabHigher:0};
  const tIdx={}; r.tasks.forEach((t,i)=>tIdx[t.id]=t.sDays);
  items.forEach((T,i)=>{ if(T.cls!=='IfcColumn') return; cols++; if(des[i]<0){noSup++;return;}
    const A=items[des[i]],k=rel(A,T),m=mid.has(T.guid); inc(all,RN[k]+'<-'+A.cls); if(m){nMid++; inc(bad,RN[k]+'<-'+A.cls);}
    if(k===0&&A.cls==='IfcSlab'){ cs.n++; if(m){cs.mid++; lead.push((A.s-T.s)/86400000);}
      (A.task===T.task?geo.same:geo.other).push(T.bz-A.tz); if(A.task===T.task){const pk=T.task; perTask[pk]=perTask[pk]||{n:0,mid:0}; perTask[pk].n++; if(m)perTask[pk].mid++;}
      if(A.task===T.task){cs.sameTask++; if(m)cs.sameTaskMid++;} else if(tIdx[A.task]<tIdx[T.task]){cs.slabTaskEarlier++; if(m)cs.slabTaskEarlierMid++;} else {cs.slabTaskLater++; if(m)cs.slabTaskLaterMid++;}
      if(usedZ.length){ wi.pairs++; const cb=band(usedZ,T.bz), sb=band(usedZ,A.bz); if(sb===cb)wi.nowSame++; else if(sb<cb)wi.nowSlabLower++; else wi.nowSlabHigher++;
        if(haveFloor){ const srt=floorZ.slice().sort((a,b)=>a-b); const cb2=band(srt,T.bz), sb2=band(srt,A.bz); if(sb2===cb2)wi.floorSame++; else if(sb2<cb2)wi.floorSlabLower++; else wi.floorSlabHigher++; } } }
  });
  if(!cols){console.log('   IfcColumn total=0 VACUOUS'); continue;}
  lead.sort((a,b)=>a-b); const q=p=>lead.length?lead[Math.floor(p*(lead.length-1))].toFixed(1):'n/a';
  console.log('   IfcColumn total='+cols+' noElectedSupport='+noSup+' midair='+nMid);
  console.log('   elected support, ALL columns   : '+show(all));
  console.log('   elected support, MIDAIR columns: '+show(bad));
  console.log('   column standing on a slab n='+cs.n+' midair='+cs.mid+' daysBeforeSlab p50='+q(.5)+' p90='+q(.9)+' max='+q(1));
  console.log('      slab in the SAME task as the column: n='+cs.sameTask+' midair='+cs.sameTaskMid+' | slab in an EARLIER-starting task: n='+cs.slabTaskEarlier+' midair='+cs.slabTaskEarlierMid+' | slab in a LATER-starting task: n='+cs.slabTaskLater+' midair='+cs.slabTaskLaterMid);
  const med=x=>{x=x.slice().sort((p,q)=>p-q); return x.length?x[Math.floor((x.length-1)/2)].toFixed(2):'n/a';};
  console.log('      same-task pairs by task: '+(Object.entries(perTask).map(e=>e[0].replace('TASK_','')+' n='+e[1].n+' midair='+e[1].mid).join(' · ')||'none')+' | colBase-slabTop median: sameTask='+med(geo.same)+'m otherTask='+med(geo.other)+'m');
  console.log('      band of slab vs band of column, by BASE z, ladder USED : same='+wi.nowSame+' slabLower='+wi.nowSlabLower+' slabHigher='+wi.nowSlabHigher+' (pairs='+wi.pairs+')');
  console.log('      same test on the logged FLOOR datums (what-if, nothing run): '+(haveFloor?'same='+wi.floorSame+' slabLower='+wi.floorSlabLower+' slabHigher='+wi.floorSlabHigher:'UNJUDGED — no §STOREY_DATUM_FLOOR line for every used storey'));
}
