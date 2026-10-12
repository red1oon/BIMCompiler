// W20 — PARITY: build/erp/ninja_template.js (JS twin engine) vs the REAL Laos fork run on the local clone (legacy/oracle_fork_*.xls + server log).
// Judges Process + Output sheets cell by cell (type/value/formula) and the "Address is" log lines. INCONCLUSIVE when the oracle painted nothing.
const X=require('/home/red1/bim-compiler/node_modules/xlsx'); const cp=require('child_process'); const T=require('/home/red1/bim-compiler/build/erp/ninja_template.js');
const name=process.argv[2]||'MOES_sofp'; const L='/home/red1/Projects/LaosExpenseReport/';
const OPT={cellFormula:true,cellStyles:true,sheetStubs:true,cellDates:false,raw:false};
const G=require('./golden_lib.js'); const tpl=X.readFile(process.env.TPL||(L+'source/'+name+'.xls'),OPT), oracle=G.loadCells(name);   /* oracle = frozen TEXT golden of the real plugin's output */
const NEG=process.env.NEG||'';
let SQ=null; if(process.env.EXEC==='sqlite'){ const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const db=new D(L+'legacy/twin_snapshot.db',{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f)); SQ=T.sqliteExecutor(db); if(process.env.NEG==='noscale'){ SQ=sql=>db.prepare(T.pgToSqlite(sql)).raw().all().map(r=>r.map(v=>T.typedFromSqlite(v))); } }   /* NEG=noscale: scale-blind executor, must FAIL */   // EXEC=sqlite: engine runs on the SQLite twin snapshot, judged against the SAME Postgres-run oracle
function exec(sql){ if(SQ) return SQ(sql); if(NEG==='client'&&sql.includes('AD_Client_ID=11')) sql=sql.replace('AD_Client_ID=11','AD_Client_ID=12'); const r=cp.spawnSync('python3',[L+'witness/pg_exec.py'],{input:sql,encoding:'utf8',maxBuffer:1<<28}); if(r.status!==0) throw new Error('pg_exec: '+r.stderr); const j=JSON.parse(r.stdout); if(j.error) throw new Error('SQL error: '+j.error+' | '+sql.slice(0,300)); let rows=j.rows; if(NEG==='droprow'&&rows.length>3&&/c_elementvalue a/.test(sql)) rows=rows.slice(1); return rows; }
const S=T.runTemplate(tpl,exec,{XLSX:X,clientId:11,orgId:0,from:process.env.FROM||'2026-05-01 00:00:00.0',to:process.env.TO||'2026-05-31 00:00:00.0'});
function norm(c){ if(!c) return null; if(c.t==='z') return {t:'z'}; return {t:c.t,v:c.t==='n'?Number(c.v):String(c.v),f:c.f||null}; }
let tot=0,bad=0,shown=0,painted=0; const rep={};
['Process','Output'].forEach(sn=>{ const a=tpl.Sheets[sn], b=oracle.Sheets[sn]; const keys=new Set([...Object.keys(a||{}),...Object.keys(b||{})].filter(k=>k[0]!=='!'));
  let n=0,d=0; keys.forEach(k=>{ const x=norm(a&&a[k]), y=norm(b&&b[k]); const blank=o=>!o||o.t==='z'||(o.t==='s'&&o.v===''); if(blank(x)&&blank(y)) return; n++; if(sn==='Process'&&/^[A-Z]+\d+$/.test(k)&&k.charCodeAt(0)>=73&&y&&y.t!=='z') painted++;
    const nf=f=>String(f||'').replace(/\s+/g,'').toUpperCase(); const same=x&&y&&((x.f||y.f)?nf(x.f)===nf(y.f):(x.t===y.t&&x.v===y.v)); if(!same){ d++; if(shown++<14) console.log(`   DIFF ${sn}!${k} js=${JSON.stringify(x)} oracle=${JSON.stringify(y)}`);} }); rep[sn]={cells:n,diff:d}; tot+=n; bad+=d; });
const olog=G.loadLog(name);
const jlog=S.log.filter(l=>/ Address is | CROSSTAB |>>formula>>|CANNOT SHIFT|CROSS TAB CANVAS/.test(l));
let logSame=olog.length===jlog.length&&olog.every((l,i)=>l===jlog[i]);
console.log(`§PARITY executor=${SQ?'SQLITE-TWIN':'POSTGRES'}`);
console.log(`§PARITY ${name} statements=${S.sqlcount} nothing=${S.nothingReturned} jsLogLines=${jlog.length} oracleLogLines=${olog.length} logIdentical=${logSame}`);
console.log(`§PARITY ${name} Process cells=${rep.Process.cells} diff=${rep.Process.diff} | Output cells=${rep.Output.cells} diff=${rep.Output.diff}`);
const verdict=olog.length===0?'INCONCLUSIVE (oracle wrote 0 values)':(bad===0&&logSame?'PASS':'FAIL');
const rn=a=>a.filter(l=>/This row is null/.test(l)).length; const orow='n/a(golden)', jrow=rn(S.log);
console.log(`§ROWNULL_DIAG (diagnostic line only, no cell data; POI keeps empty row objects SheetJS does not) oracle=${orow} js=${jrow}`);
console.log(`§PARITY_VERDICT ${name} ${verdict} cellsCompared=${tot} diffs=${bad}`);
if(!logSame){ for(let i=0;i<Math.min(5,Math.max(olog.length,jlog.length));i++) if(olog[i]!==jlog[i]) console.log(`   LOGDIFF[${i}] js=${jlog[i]} | oracle=${olog[i]}`); }
