// Headless harness: runs the REAL worker (new with validity layer, or --orig = the owner's unmodified one) on IFC files.
// Software GL / no GPU needed (the worker uses no GL). Read-only on everything it serves. Never touches Dubai endpoints.
// Usage: node run_validity.js [--orig] [--json out.json] file.ifc ...
// Env: WEBIFC_LIB (dir holding web-ifc-api-iife.js + web-ifc.wasm; default /tmp/wt-noai/viewer/lib)
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const puppeteer=require('/home/red1/bim-compiler/node_modules/puppeteer');
let args=process.argv.slice(2),orig=false,jsonOut=null;
if(args[0]==='--orig'){orig=true;args.shift();}
if(args[0]==='--json'){jsonOut=args[1];args=args.slice(2);}
const HERE=__dirname, LIB=process.env.WEBIFC_LIB||'/tmp/wt-noai/viewer/lib';
const WORKER=orig?'/home/red1/Projects/Dubai/plan/readiness/metrics_worker.js':path.join(HERE,'metrics_worker.js');
const MIME={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm'};
function resolve(p){ // virtual layout: /readiness/<worker+validity files>, /viewer/lib/<web-ifc>
  if(p==='/readiness/blank.html') return null;
  if(p==='/readiness/metrics_worker.js') return WORKER;
  if(p==='/readiness/validity_core.js'||p==='/readiness/validity_tables.js') return path.join(HERE,path.basename(p));
  if(p.startsWith('/viewer/lib/')) return path.join(LIB,path.basename(p));
  return undefined;}
const srv=http.createServer((q,r)=>{const p=decodeURIComponent(q.url.split('?')[0]);const f=resolve(p);
  if(f===null){r.writeHead(200,{'Content-Type':'text/html'});r.end('<html></html>');return;}
  if(!f||!fs.existsSync(f)||p.includes('..')){r.writeHead(404);r.end('404');return;}
  r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
 const br=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-gpu','--use-gl=swiftshader']});
 const pg=await br.newPage();const wlog=[];
 pg.on('workercreated',w=>{});pg.on('console',m=>wlog.push(m.text()));
 await pg.goto('http://localhost:'+port+'/readiness/blank.html',{waitUntil:'domcontentloaded'});
 const out=[];
 for(const f of args){
  const b64=fs.readFileSync(f).toString('base64');const t0=Date.now();
  const res=await pg.evaluate((b64,name)=>new Promise(resolve=>{
    const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const w=new Worker('/readiness/metrics_worker.js');let n=0;const t=setTimeout(()=>{w.terminate();resolve({type:'timeout'});},240000);
    w.onmessage=e=>{const d=e.data;if(d.type==='progress'){n++;return;}clearTimeout(t);w.terminate();resolve({type:d.type,metrics:d.metrics,message:d.message,validity:d.validity,keys:Object.keys(d)});};
    w.onerror=e=>{clearTimeout(t);resolve({type:'workererror',message:String(e.message)});};
    w.postMessage({arrayBuffer:u.buffer,filename:name},[u.buffer]);
  }),b64,path.basename(f));
  res.file=path.basename(f);res.bytes=fs.statSync(f).size;res.ms=Date.now()-t0;out.push(res);
  console.log('FILE '+res.file+' size='+res.bytes+' ms='+res.ms+' type='+res.type+' keys='+JSON.stringify(res.keys));
  if(res.validity)console.log('§VL_RESULT file='+res.file+' overall='+res.validity.overall+' headline="'+res.validity.headline.text+'" checks='+res.validity.checks.map(c=>c.id+':'+c.status).join(','));
  console.log('RESULT '+JSON.stringify(res));
 }
 await br.close();srv.close();
 if(jsonOut)fs.writeFileSync(jsonOut,JSON.stringify(out,null,1));
})().catch(e=>{console.log('FATAL '+e.stack);process.exit(1)});
