// Node harness for the core only (fast). Usage: node run_core.js file...  (prints JSON per file)
const fs=require('fs'),V=require('./validity_core.js'),T=require('./validity_tables.js');
for(const f of process.argv.slice(2)){const b=fs.readFileSync(f);const t=Date.now();const r=V.run(new Uint8Array(b.buffer,b.byteOffset,b.length),T);
 console.log('FILE '+f+' bytes='+b.length+' ms='+(Date.now()-t)+' rssMB='+Math.round(process.memoryUsage().rss/1e6));console.log(JSON.stringify(r));}
