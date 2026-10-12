// W24 — stone 2b: for every statement ninja_template.js builds, compare the PG clone result with the SQLite twin-snapshot result (same rows, dialect adapter on).
// Verdicts per statement: SAME | SQLITE_ERROR | ROWCOUNT | VALUES ; statements where PG returned nothing are counted as NOT-JUDGED (INCONCLUSIVE for value parity).
const X=require('/home/red1/bim-compiler/node_modules/xlsx'),cp=require('child_process'),T=require('/home/red1/bim-compiler/build/erp/ninja_template.js'),D=require('/home/red1/bim-compiler/node_modules/better-sqlite3');
const L='/home/red1/Projects/LaosExpenseReport/'; const db=new D(L+'legacy/twin_snapshot.db',{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f));
function pg(sql){ const r=cp.spawnSync('python3',[L+'witness/pg_exec.py'],{input:sql,encoding:'utf8',maxBuffer:1<<28}); const j=JSON.parse(r.stdout); if(j.error) throw new Error('PG: '+j.error); return j.rows; }
const EX=T.sqliteExecutor(db);
function lite(sql){ if(process.env.NEG==='noscale'){ const rows=db.prepare(T.pgToSqlite(sql)).raw().all(); return rows.map(r=>r.map(v=>T.typedFromSqlite(v))); } return EX(sql); }   // NEG=noscale = the old scale-blind adapter (must FAIL on parity_v2)
const f=process.argv[2]; const from=process.env.FROM||'2026-05-01 00:00:00.0', to=process.env.TO||'2026-05-31 00:00:00.0';
const wb=X.readFile(f,{cellFormula:true,cellStyles:true,sheetStubs:true}); const res={SAME:0,SQLITE_ERROR:0,ROWCOUNT:0,VALUES:0,NOTJUDGED:0}; const errs={}; const ex=[]; let n=0;
T.runTemplate(wb,(sql)=>{ n++; const a=pg(sql); let b,verdict; try{ b=lite(sql); }catch(e){ verdict='SQLITE_ERROR'; const k=e.message.replace(/"[^"]*"/g,'"?"').slice(0,60); errs[k]=(errs[k]||0)+1; }
  if(!verdict){ if(a.length===0&&b.length===0){verdict='NOTJUDGED';} else if(a.length!==b.length){verdict='ROWCOUNT'; ex.push(`#${n} rows pg=${a.length} sqlite=${b.length}`);} else { const sa=JSON.stringify(a.map(r=>r.map(v=>v&&v.s))), sb=JSON.stringify(b.map(r=>r.map(v=>v&&v.s))); if(sa===sb) verdict='SAME'; else { verdict='VALUES'; for(let i=0;i<a.length&&ex.length<6;i++){ const x=JSON.stringify(a[i].map(v=>v&&v.s)), y=JSON.stringify(b[i].map(v=>v&&v.s)); if(x!==y){ex.push(`#${n} row${i} pg=${x.slice(0,90)} sqlite=${y.slice(0,90)}`);break;} } } } }
  res[verdict]++; return a; },{XLSX:X,clientId:11,from,to});
const judged=res.SAME+res.ROWCOUNT+res.VALUES;
console.log(`§TWIN_STMT ${f.split('/').pop()} statements=${n} ${JSON.stringify(res)} judged=${judged}`);
Object.entries(errs).forEach(([k,v])=>console.log(`   ${v}x SQLITE_ERROR ${k}`)); ex.slice(0,6).forEach(e=>console.log('   '+e));
console.log(`§TWIN_STMT_VERDICT ${f.split('/').pop()} ${judged===0?'INCONCLUSIVE (PG returned nothing everywhere)':(res.SQLITE_ERROR+res.ROWCOUNT+res.VALUES===0?'PASS':'FAIL')}`);
