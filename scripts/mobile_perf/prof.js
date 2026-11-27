// Attribute boot CPU (MOBILE_PERF P0): JS sampling profile from navigation to STOP ms, self-time by script file + top functions.
const puppeteer=require(process.argv[2]+'/tools/node_modules/puppeteer-core');
const [,, S, port, tag, STOP]=process.argv;
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-first-run','--user-data-dir='+S+'/profp_'+tag+'_'+Date.now()]});
 const p=await b.newPage(); const c=await p.target().createCDPSession();
 await c.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.emulate({viewport:{width:412,height:823,deviceScaleFactor:1.75,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36'});
 await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval',{interval:1000}); await c.send('Profiler.start');
 p.goto(`http://localhost:${port}/viewer/viewer.html?db=buildings/Duplex_extracted.db`).catch(()=>{});
 await new Promise(r=>setTimeout(r,+STOP));
 const {profile}=await c.send('Profiler.stop');
 const byId=new Map(profile.nodes.map(n=>[n.id,n])); const self=new Map(); const dt=profile.timeDeltas;
 profile.samples.forEach((id,i)=>self.set(id,(self.get(id)||0)+(dt[i]||0)));
 const file={}, fn={}; for(const [id,us] of self){const n=byId.get(id),cf=n.callFrame,f=(cf.url||'('+cf.functionName+')').split('/').pop()||'(native)';
   file[f]=(file[f]||0)+us; const k=f+':'+(cf.functionName||'anon')+':'+(cf.lineNumber+1); fn[k]=(fn[k]||0)+us;}
 const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>k+'='+Math.round(v/1000)).join(' | ');
 console.log(`§P0_PROF build=${tag} window_ms=${STOP} BY_FILE(ms): `+top(file,14));
 console.log(`§P0_PROF build=${tag} TOP_FN(ms): `+top(fn,14));
 await b.close();
})();
