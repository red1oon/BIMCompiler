// W40 — the NinjaExcel Report run IN A REAL BROWSER (headless Chromium, CPU only, --disable-gpu) over the ERP's own client db (sql.js), judged against an independent SQL oracle.
// Issue it proves/disproves: "ExcelJS + PDFKit + the engine load and run in a plain browser page (no build step), paint the Thai trial balance from the db the ERP actually ships,
// produce an .xlsx whose every account row equals an independent SQL aggregate, and a one-page PDF that contains the Thai headings, every account code and the totals".
// usage: node W40_BrowserReport.js <bim-ootb worktree> [template.xlsx]   env FROM TO (YYYY-MM-DD) DB (relative to erp/) NEG=1 (oracle perturbed -> must FAIL)
const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process'),os=require('os');
const { chromium } = require(os.homedir()+'/bim-ootb/tests/node_modules/playwright');
const E=require(process.env.EXCELJS||os.homedir()+'/Projects/ninja-template-data/nm/node_modules/exceljs');
const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3');
const ROOT=path.resolve(process.argv[2]), TPL=process.argv[3]||path.join(ROOT,'erp/ninja_tb_sample.xlsx'), DBREL=process.env.DB||'erp/ad_seed.db';
const FROM=(process.env.FROM||'2003-01-01').slice(0,10), TO=(process.env.TO||'2003-12-31').slice(0,10);
const MIME={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.ttf':'font/ttf','.json':'application/json','.xlsx':'application/octet-stream','.db':'application/octet-stream'};
const srv=http.createServer((q,r)=>{ const p=decodeURIComponent(q.url.split('?')[0]); if(p==='/probe.html'){ r.writeHead(200,{'Content-Type':'text/html'}); return r.end('<!doctype html><meta charset=utf-8><body>probe'); }
  fs.readFile(path.join(ROOT,p),(e,b)=>{ if(e){r.writeHead(404);return r.end('404 '+p);} r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'}); r.end(b); }); });
(async()=>{ await new Promise(r=>srv.listen(0,r)); const port=srv.address().port; const base=`http://127.0.0.1:${port}/`;
 const br=await chromium.launch({args:['--disable-gpu']}); const pg=await br.newPage(); const logs=[]; pg.on('console',m=>{ const t=m.text(); if(t.startsWith('§')) logs.push(t); }); pg.on('pageerror',e=>logs.push('§PAGEERROR '+e.message));
 await pg.goto(base+'probe.html'); const tplB64=fs.readFileSync(TPL).toString('base64');
 const res=await pg.evaluate(async({base,dbrel,tplB64,from,to})=>{
   const ld=s=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=()=>no(new Error(s));document.head.appendChild(e);});
   await ld(base+'erp/lib/sql-wasm-fts5.js'); const SQL=await initSqlJs({locateFile:()=>base+'erp/lib/sql-wasm-fts5.wasm'});
   const db=new SQL.Database(new Uint8Array(await (await fetch(base+dbrel)).arrayBuffer()));
   await ld(base+'erp/xlsx.mini.min.js'); await ld(base+'erp/ninja_report.js');
   const tpl=Uint8Array.from(atob(tplB64),c=>c.charCodeAt(0));
   const t0=performance.now(); const out=await NinjaReport.run({db,template:tpl,from,to,base:base+'erp/',XLSX:window.XLSX});
   const b64=u=>{let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
   return {facts:out.facts,xlsx:b64(out.xlsx),pdf:b64(out.pdf),ms:Math.round(performance.now()-t0)};
 },{base,dbrel:DBREL,tplB64,from:FROM,to:TO}).catch(e=>({error:String(e)}));
 await br.close(); srv.close(); logs.forEach(l=>console.log(l));
 if(res.error){ console.log('§BROWSER_REPORT ERROR '+res.error); console.log('§BROWSER_REPORT_VERDICT FAIL'); process.exit(1); }
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'w40-')); fs.writeFileSync(tmp+'/o.xlsx',Buffer.from(res.xlsx,'base64')); fs.writeFileSync(tmp+'/o.pdf',Buffer.from(res.pdf,'base64'));
 // oracle
 const db=new D(path.join(ROOT,DBREL),{readonly:true}); const CL=res.facts.client, F=FROM+' 00:00:00.0', T=TO+' 00:00:00.0';
 const rows=db.prepare(`SELECT e.value v,e.name n,SUM(CASE WHEN SUBSTR(p.startdate,1,10)<SUBSTR(?,1,10) THEN a.amtacctdr-a.amtacctcr ELSE 0 END) op,SUM(CASE WHEN SUBSTR(p.startdate,1,10)>=SUBSTR(?,1,10) THEN a.amtacctdr ELSE 0 END) dr,SUM(CASE WHEN SUBSTR(p.startdate,1,10)>=SUBSTR(?,1,10) THEN a.amtacctcr ELSE 0 END) cr FROM fact_acct a JOIN c_elementvalue e ON e.c_elementvalue_id=a.account_id JOIN c_period p ON p.c_period_id=a.c_period_id WHERE a.ad_client_id=${CL} AND a.postingtype='A' AND SUBSTR(p.startdate,1,10)<=SUBSTR(?,1,10) GROUP BY e.value,e.name ORDER BY e.value`).all(F,F,F,T);
 if(process.env.NEG==='1'&&rows.length) rows[0].dr+=1;
 const w=new E.Workbook(); await w.xlsx.readFile(tmp+'/o.xlsx'); const s=w.getWorksheet('Output'); const val=c=>{const v=s.getCell(c).value; return v&&typeof v==='object'&&'result' in v?v.result:v;}; const near=(a,b)=>Math.abs(a-b)<0.005; const bad=[];
 rows.forEach((o,i)=>{ const r=6+i; if(String(val('A'+r))!==String(o.v)||String(val('B'+r))!==o.n||!near(+val('C'+r),o.op)||!near(+val('D'+r),o.dr)||!near(+val('E'+r),o.cr)) bad.push(`row ${r} ${o.v}: got ${val('A'+r)} ${val('C'+r)} ${val('D'+r)} ${val('E'+r)} want ${o.op} ${o.dr} ${o.cr}`); });
 const n=rows.length, tr=6+n+1, sdr=rows.reduce((a,r)=>a+r.dr,0), scr=rows.reduce((a,r)=>a+r.cr,0); const f=c=>{const v=s.getCell(c).value; return v&&v.formula;};
 if(f('D'+tr)!==`SUM(D6:D${tr-1})`) bad.push('totals range '+f('D'+tr)); const td=val('D'+tr), tc=val('E'+tr); const xmlOf=cp.spawnSync('sh',['-c',`unzip -p ${tmp}/o.xlsx 'xl/worksheets/*.xml'`],{encoding:'utf8',maxBuffer:1<<26}).stdout; const pm=new RegExp(`<c r="D${tr+2}"[^>]*><f>[^<]*</f><v>([^<]*)</v>`).exec(xmlOf); const pf=pm?+pm[1]:NaN;   /* ExcelJS's reader drops a cached 0; the raw XML is the evidence */ const dr0=rows.reduce((a,r)=>a+r.dr,0);
 if(!near(+td,sdr)||!near(+tc,scr)) bad.push(`totals ${td}/${tc} vs ${sdr}/${scr}`); if(!near(+pf,0)) bad.push('proof '+pf);
 const txt=cp.spawnSync('pdftotext',[tmp+'/o.pdf','-'],{encoding:'utf8'}).stdout.replace(/\s+/g,''); const must=['งบทดลอง','รหัสบัญชี','ยอดยกมา','เดบิต','เครดิต','ยอดคงเหลือ','รวม',...rows.map(r=>r.v), ...rows.map(r=>r.n.replace(/\s+/g,''))]; const miss=must.filter(t=>!txt.includes(t));
 const pages=(cp.spawnSync('pdfinfo',[tmp+'/o.pdf'],{encoding:'utf8'}).stdout.match(/Pages:\s+(\d+)/)||[])[1];
 console.log(`§BROWSER_REPORT client=${CL} period=${FROM}..${TO} accounts=${n} totalDebit=${(+td).toFixed(2)} totalCredit=${(+tc).toFixed(2)} proof=${(+pf).toFixed(2)} statements=${res.facts.statements} runMs=${res.facts.runMs} totalMs=${res.ms} xlsxBytes=${res.facts.pdfBytes?Buffer.from(res.xlsx,'base64').length:0} pdfBytes=${res.facts.pdfBytes} pdfPages=${pages} formulaErrors=${res.facts.formulaErrors}`);
 console.log(`§BROWSER_REPORT_FACT rowsJudged=${n} mismatches=${bad.length} pdfMissingStrings=${miss.length}${miss.length?' e.g. '+miss.slice(0,5).join('|'):''}`); bad.slice(0,6).forEach(b=>console.log('   '+b));
 console.log('§BROWSER_REPORT_VERDICT '+(n===0?'INCONCLUSIVE (no accounts judged)':(bad.length||miss.length||pages!=='1'||res.facts.formulaErrors)?'FAIL':'PASS'));
})().catch(e=>{console.log('§BROWSER_REPORT ERROR',e.stack);process.exit(1);});
