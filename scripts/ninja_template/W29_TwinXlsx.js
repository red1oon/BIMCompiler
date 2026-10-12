// W29 — the SQLite NinjaExcel end to end: .xlsx template -> engine (SQLite twin executor) -> styled .xlsx. usage: node W29_TwinXlsx.js <template.xlsx> <out.xlsx>   env FROM/TO/EXEC(sqlite|pg)
const E=require(process.env.EXCELJS||'/home/red1/Projects/LaosExpenseReport/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),H=require('/home/red1/bim-compiler/build/erp/ninja_template_xlsx.js'),T=require('/home/red1/bim-compiler/build/erp/ninja_template.js'),fs=require('fs'),cp=require('child_process');
const L='/home/red1/Projects/LaosExpenseReport/'; let exec;
if((process.env.EXEC||'sqlite')==='sqlite'){ const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const db=new D(L+'legacy/twin_snapshot.db',{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f)); exec=T.sqliteExecutor(db); }
else exec=sql=>{ const r=cp.spawnSync('python3',[L+'witness/pg_exec.py'],{input:sql,encoding:'utf8',maxBuffer:1<<28}); const j=JSON.parse(r.stdout); if(j.error) throw new Error(j.error); return j.rows; };
(async()=>{ const buf=fs.readFileSync(process.argv[2]); const m=await H.loadModel(E,buf); const t0=Date.now();
 const S=T.runTemplate(m,exec,{XLSX:X,clientId:11,orgId:0,from:process.env.FROM||'2006-12-01 00:00:00.0',to:process.env.TO||'2006-12-31 00:00:00.0'});
 const out=await H.saveModel(E,m,buf,['Output','Process']); fs.writeFileSync(process.argv[3],Buffer.from(out));
 console.log(`§TWIN_RUN ${process.argv[2].split('/').pop()} -> ${process.argv[3].split('/').pop()} statements=${S.sqlcount} addressLines=${S.log.filter(l=>/ Address is /.test(l)).length} ms=${Date.now()-t0} bytes=${out.byteLength}`);
})().catch(e=>{console.log('§TWIN_RUN ERROR',e.stack);process.exit(1)});
