// W43 — a failing SQL in a template's Process sheet is reported to the user WITH the database's real message AND the statement that failed (legacy hid the real SQL error).
// Issue it proves/disproves: "a typo in a SELECT column surfaces as `SQL ERROR: no such column: el.valu` plus the full statement; a clean template raises nothing". INCONCLUSIVE if the corrupted cell was not found (vacuous).
// usage: node W43_SqlError.js <parity_tb.xlsx>      env NEG=1 -> the template is left clean, so the expected error must be ABSENT (gate must FAIL)
const E=require(process.env.EXCELJS||'/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),fs=require('fs');
const H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js');
const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const L=(process.env.NT_DATA||'/home/red1/Projects/ninja-template-data')+'/'; const db=new D(L+'legacy/twin_snapshot.db',{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f));
(async()=>{ const m=await H.loadModel(E,fs.readFileSync(process.argv[2])); const p=m.Sheets.Process; let hit=0;
 if(process.env.NEG!=='1') for(const k of Object.keys(p)){ if(p[k]&&p[k].v==='el.value'){ p[k].v='el.valu'; hit++; } }
 let msg=null; try{ T.runTemplate(m,T.sqliteExecutor(db),{XLSX:X,clientId:11,orgId:0,from:'2003-01-01 00:00:00.0',to:'2003-12-31 00:00:00.0'}); }catch(e){ msg=String(e.message); }
 const hasReal=!!msg&&/no such column: el\.valu/.test(msg), hasStmt=!!msg&&/statement: SELECT .*el\.valu/.test(msg.replace(/\n/g,' '));
 console.log(`§SQL_ERROR corruptedCells=${hit} raised=${msg!==null} realMessage=${hasReal} statementShown=${hasStmt}`); if(msg) console.log('   '+msg.split('\n').join('\n   ').slice(0,260));
 console.log('§SQL_ERROR_VERDICT '+(process.env.NEG!=='1'&&hit===0?'INCONCLUSIVE (nothing corrupted)':(hasReal&&hasStmt)?'PASS':'FAIL'));
})().catch(e=>{console.log('§SQL_ERROR ERROR',e.stack);process.exit(1)});
