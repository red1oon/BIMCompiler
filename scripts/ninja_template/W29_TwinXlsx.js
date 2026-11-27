// W29 — the SQLite NinjaExcel end to end: .xlsx template -> engine (SQLite twin executor) -> styled .xlsx. usage: node W29_TwinXlsx.js <template.xlsx> <out.xlsx>   env FROM/TO/EXEC(sqlite|pg)
const E=require(process.env.EXCELJS||'/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js'),fs=require('fs'),cp=require('child_process');
const PF=require(__dirname+'/../../build/erp/ninja_preflight.js');
const L='/home/red1/Projects/ninja-template-data/'; let exec, TEX=null;
if((process.env.EXEC||'sqlite')==='sqlite'){ const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const db=new D((process.env.NT_TWIN||L+'legacy/twin_snapshot.db'),{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f)); TEX=PF.timed(T.sqliteExecutor(db),process.env.SQLMS?console.log:()=>{}); exec=PF.selectOnly(TEX); }
else exec=sql=>{ const r=cp.spawnSync('python3',[__dirname+'/pg_exec.py'],{input:sql,encoding:'utf8',maxBuffer:1<<28}); const j=JSON.parse(r.stdout); if(j.error) throw new Error(j.error); return j.rows; };
(async()=>{ const buf=fs.readFileSync(process.argv[2]); const m=await H.loadModel(E,buf); const t0=Date.now();
 if(!PF.report(PF.preflight(m))){ process.exit(3); }                    /* template check: refuse a faulty template with a clear message, log what was judged */
 const S=T.runTemplate(m,exec,{XLSX:X,clientId:Number(process.env.NT_CLIENT||11),orgId:Number(process.env.NT_ORG||0),from:process.env.FROM||'2006-12-01 00:00:00.0',to:process.env.TO||'2006-12-31 00:00:00.0'});
 const out=await H.saveModel(E,m,buf,['Output','Process']); fs.writeFileSync(process.argv[3],Buffer.from(out));
 if(TEX) TEX.summary(); console.log(`§TWIN_RUN ${process.argv[2].split('/').pop()} -> ${process.argv[3].split('/').pop()} statements=${S.sqlcount} addressLines=${S.log.filter(l=>/ Address is /.test(l)).length} ms=${Date.now()-t0} bytes=${out.byteLength}`);
})().catch(e=>{console.log('§TWIN_RUN ERROR',e.stack);process.exit(1)});
