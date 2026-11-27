// W42 — Sales Register template (spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §UC-SET). Issue it proves/disproves: "the register's list is PUSHED DOWN to hold one row per completed sales invoice (any count),
// every row equals an independent SQL read, the totals/COUNT ranges grow to cover the whole list, and the painted total + count equal the SQL's". Pushing is judged on the row count AND the range text.
// usage: DB=<sqlite> CLIENT=11 FROM=YYYY-MM-DD TO=YYYY-MM-DD node W42_Register.js <parity_reg.xlsx>   NEG=wrongrange -> must FAIL; no invoices in range -> INCONCLUSIVE
const E=require(process.env.EXCELJS||'/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),fs=require('fs');
const H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js'),C=require(__dirname+'/../../build/erp/ninja_calc.js');
const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const L=(process.env.NT_DATA||'/home/red1/Projects/ninja-template-data')+'/';
const db=new D(process.env.DB||(L+'legacy/twin_snapshot.db'),{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f));
const CL=+(process.env.CLIENT||11), FROM=(process.env.FROM||'2002-01-01').slice(0,10), TO=(process.env.TO||'2003-12-31').slice(0,10);
(async()=>{ const m=await H.loadModel(E,fs.readFileSync(process.argv[2])); const t0=Date.now(); T.runTemplate(m,T.sqliteExecutor(db),{XLSX:X,clientId:CL,orgId:0,from:FROM+' 00:00:00.0',to:TO+' 00:00:00.0'}); const ms=Date.now()-t0; const ev=C.evaluateSheet(m,'Output'); const ws=m.Sheets.Output; const g=k=>ws[k];
 const rows=db.prepare(`SELECT a.documentno d,SUBSTR(a.dateinvoiced,1,10) dt,bp.name n,a.grandtotal t FROM c_invoice a JOIN c_bpartner bp ON bp.c_bpartner_id=a.c_bpartner_id WHERE a.ad_client_id=? AND a.issotrx='Y' AND a.docstatus='CO' AND SUBSTR(a.dateinvoiced,1,10)>=? AND SUBSTR(a.dateinvoiced,1,10)<=? ORDER BY a.dateinvoiced,a.documentno`).all(CL,FROM,TO);
 const n=rows.length, bad=[], near=(a,b)=>Math.abs(a-b)<0.005;
 for(let i=0;i<n;i++){ const r=6+i,o=rows[i]; const v=['A','B','C','D'].map(c=>g(c+r)); if(!v[0]||String(v[0].v)!==String(o.d)||String(v[1].v)!==o.dt||String(v[2].v)!==o.n||!near(+v[3].v,+o.t)) bad.push(`row ${r}: got ${v.map(x=>x&&x.v)} want ${o.d} ${o.dt} ${o.n} ${o.t}`); }
 const tr=6+n+1, want=`SUM(D6:D${tr-1})`; let f=g('D'+tr)&&g('D'+tr).f?g('D'+tr).f.replace(/\s/g,''):''; if(process.env.NEG==='wrongrange') f='SUM(D6:D6)'; if(f!==want) bad.push(`total formula ${f||'(none)'} want ${want}`);
 const cf=g('D'+(tr+2))&&g('D'+(tr+2)).f?g('D'+(tr+2)).f.replace(/\s/g,''):''; if(cf!==`COUNT(D6:D${tr-1})`) bad.push(`count formula ${cf} want COUNT(D6:D${tr-1})`);
 const sum=rows.reduce((a,r)=>a+r.t,0), pt=g('D'+tr)&&g('D'+tr).v, pc=g('D'+(tr+2))&&g('D'+(tr+2)).v; if(!near(+pt,sum)) bad.push(`total ${pt} vs ${sum}`); if(+pc!==n) bad.push(`count ${pc} vs ${n}`);
 console.log(`§REGISTER invoices=${n} period=${FROM}..${TO} total=${(+pt).toFixed(2)} count=${pc} totalsRow=${tr} rowsPushed=${n} runMs=${ms} formulasEvaluated=${ev.evaluated} errors=${ev.errors}`);
 console.log(`§REGISTER_FACT rowsJudged=${n} mismatches=${bad.length}`); bad.slice(0,6).forEach(b=>console.log('   '+b));
 console.log('§REGISTER_VERDICT '+(n===0?'INCONCLUSIVE (no invoices in range)':(bad.length||ev.errors)?'FAIL':'PASS'));
})().catch(e=>{console.log('§REGISTER ERROR',e.stack);process.exit(1)});
