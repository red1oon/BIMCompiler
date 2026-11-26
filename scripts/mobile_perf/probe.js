// P0 probe (MOBILE_PERF.md §D): same phone emulation as Lighthouse mobile (Moto G Power profile), CPU 4x, no net throttle, cold profile.
// Issue it exposes: does the Nov build reach a drawn model later than May, and how much main-thread blocking does boot cost.
const puppeteer=require(process.argv[2]+'/tools/node_modules/puppeteer-core');
const [,, S, port, tag]=process.argv; const T_END=+process.env.T_END||120000;
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-first-run','--user-data-dir='+S+'/prof_'+tag+'_'+Date.now()]});
 const p=await b.newPage(); const c=await p.target().createCDPSession();
 await c.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.emulate({viewport:{width:412,height:823,deviceScaleFactor:1.75,isMobile:true,hasTouch:true},
   userAgent:'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36'});
 await p.evaluateOnNewDocument(()=>{window.__lt=[];window.__raf=0;
   try{new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({type:'longtask',buffered:true});}catch(e){}
   const tick=()=>{__raf++;requestAnimationFrame(tick)};requestAnimationFrame(tick);});
 const t0=Date.now(); const ev=[];
 p.on('console',m=>{const t=m.text(); if(/§(DB_LOADED|POSITIONS_LOADED|SPLIT_GEO_LOADED|UPGRADE_THREE_DONE|MAIN_JS|DB_LOAD_STEP|MERGE_DONE|STREAM|FIRST)|rror/.test(t)) ev.push((Date.now()-t0)+'ms '+t.slice(0,140));});
 p.on('pageerror',e=>ev.push((Date.now()-t0)+'ms PAGEERROR '+String(e.message).slice(0,140)));
 await p.goto(`http://localhost:${port}/viewer/viewer.html?db=buildings/Duplex_extracted.db`,{waitUntil:'domcontentloaded',timeout:120000}).catch(e=>ev.push('goto '+e.message));
 let firstTri=null, lastRaf=0, samples=[];
 while(Date.now()-t0<T_END){ await new Promise(r=>setTimeout(r,500));
  const s=await p.evaluate(()=>{const A=window.APP||{},r=A.renderer,i=r&&r.info&&r.info.render;let m=0;A.scene&&A.scene.traverse&&A.scene.traverse(o=>{if(o.isMesh||o.isInstancedMesh||o.isBatchedMesh)m++});
    return {tri:i?i.triangles:-1,calls:i?i.calls:-1,meshes:m,raf:window.__raf,lt:window.__lt.length}}).catch(e=>({err:e.message}));
  const t=Date.now()-t0; if(firstTri===null&&s.tri>0) firstTri=t; samples.push([t,s]); }
 const lt=await p.evaluate(()=>window.__lt).catch(()=>[]);
 const blk=lt.reduce((a,[,d])=>a+Math.max(0,d-50),0), lastLt=lt.length?lt[lt.length-1]:null;
 const tail=samples.slice(-10); const fps=(tail[tail.length-1][1].raf-tail[0][1].raf)/((tail[tail.length-1][0]-tail[0][0])/1000);
 ev.forEach(e=>console.log('§P0_EV build='+tag+' '+e));
 console.log(`§P0_PROBE build=${tag} first_tri_ms=${firstTri} longtasks=${lt.length} blocking_ms(sum dur-50)=${blk} longest_ms=${Math.max(0,...lt.map(x=>x[1]))} last_longtask_end_ms=${lastLt?lastLt[0]+lastLt[1]:0} steady_raf_per_s=${fps.toFixed(1)} final=${JSON.stringify(samples[samples.length-1][1])}`);
 console.log('§P0_LT build='+tag+' '+lt.slice(0,40).map(x=>x[0]+'+'+x[1]).join(' '));
 await b.close();
})();
