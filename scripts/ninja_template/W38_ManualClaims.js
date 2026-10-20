// W38 — evidence for three claims made in docs/NinjaExcelReport_UserManual.md (spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §TB-DEMO / §MANUAL). Each line names the claim it proves or disproves.
//  CLAIM_NO_OVERWRITE : running a template never modifies the template file (legacy rewrote it in place) -> sha256 of the file before == after a full run+save to ANOTHER path.
//  CLAIM_NAME_ERROR   : a formula using an unsupported function shows #NAME?, never a silent 0.
//  CLAIM_BACKUP_RULE  : text typed by hand into Output is discarded on every run (Output is rebuilt from BACKUP) - documented behaviour users must know.
// usage: node W38_ManualClaims.js <parity_tb.xlsx>
const E=require(process.env.EXCELJS||'/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),fs=require('fs'),cr=require('crypto'),os=require('os'),path=require('path');
const H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js'),C=require(__dirname+'/../../build/erp/ninja_calc.js');
const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const L=(process.env.NT_DATA||'/home/red1/Projects/ninja-template-data')+'/'; const db=new D(L+'legacy/twin_snapshot.db',{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f));
const sha=b=>cr.createHash('sha256').update(b).digest('hex'); const FROM='2006-12-01 00:00:00.0', TO='2006-12-31 00:00:00.0'; const res=[]; let fail=0; const v=(k,ok,m)=>{ res.push(`§${k} ${ok?'PASS':'FAIL'} ${m}`); if(!ok) fail++; };
(async()=>{ const f=process.argv[2]; const buf=fs.readFileSync(f); const NEG=process.env.NEG==='1'; const before=sha(NEG?Buffer.concat([buf,Buffer.from('x')]):buf); const out=path.join(os.tmpdir(),'w38_out_'+process.pid+'.xlsx');
 // 1 no overwrite
 const m=await H.loadModel(E,buf); T.runTemplate(m,T.sqliteExecutor(db),{XLSX:X,clientId:11,orgId:0,from:FROM,to:TO}); fs.writeFileSync(out,Buffer.from(await H.saveModel(E,m,buf,['Output','Process']))); const after=sha(fs.readFileSync(f));
 v('CLAIM_NO_OVERWRITE',before===after&&fs.statSync(out).size>0,`template sha256 before=${before.slice(0,12)} after=${after.slice(0,12)} outputBytes=${fs.statSync(out).size}`); fs.unlinkSync(out);
 // 2 #NAME?
 const m2=await H.loadModel(E,buf); const ws=m2.Sheets.Output; ws['K1']={t:'n',v:0,f:NEG?'SUM(1,2)':'FANCYFUNC(1,2)'}; ws['K2']={t:'n',v:0,f:'SUM(1,2)'}; const ev=C.evaluateSheet(m2,'Output');
 v('CLAIM_NAME_ERROR',ws.K1.t==='e'&&ws.K1.v==='#NAME?'&&ws.K2.v===3&&ev.errors>=1,`unsupported FANCYFUNC -> t=${ws.K1.t} v=${ws.K1.v}; SUM(1,2)=${ws.K2.v}; errors=${ev.errors}`);
 // 3 BACKUP rule
 const m3=await H.loadModel(E,buf); const bak=m3.Sheets.BACKUP.A1&&m3.Sheets.BACKUP.A1.v; m3.Sheets.Output.A1={t:'s',v:'HAND TYPED'}; m3.Sheets.Output.Z99={t:'s',v:'HAND TYPED TOO'}; T.runTemplate(m3,T.sqliteExecutor(db),{XLSX:X,clientId:11,orgId:0,from:FROM,to:TO});
 const o=m3.Sheets.Output; v('CLAIM_BACKUP_RULE',!!bak&&o.A1&&o.A1.v===(NEG?'HAND TYPED':bak)&&!o.Z99,`Output!A1 after run='${o.A1&&o.A1.v}' (BACKUP='${bak}'); stray Z99 present=${!!o.Z99}`);
 res.forEach(r=>console.log(r)); console.log('§MANUAL_CLAIMS_VERDICT '+(fail?'FAIL':'PASS'));
})().catch(e=>{console.log('§MANUAL_CLAIMS ERROR',e.stack);process.exit(1)});
