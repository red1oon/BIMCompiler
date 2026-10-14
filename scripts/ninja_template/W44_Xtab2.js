// W37 — TWO-AXIS CROSS-TAB. Issue (NINJAEXCEL_TEMPLATE_ENGINE.md §XTAB2): is a `C3+B4` block a real matrix (x across, y down, empty where no rows)?
// Judges every grid cell against an INDEPENDENT SQL SUM per (account, source table) pair on the twin snapshot. Not a legacy-oracle comparison (no golden yet) — the verdict line says so.
// usage: node W44_Xtab2.js <parity_xtab2.xls> [NEG=swap]   INCONCLUSIVE when the grid is empty / no pair populated.
const X=require('/home/red1/bim-compiler/node_modules/xlsx'),D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'),T=require(__dirname+'/../../build/erp/ninja_template.js');
const db=new D('/home/red1/Projects/ninja-template-data/legacy/twin_snapshot.db',{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f));
const tpl=X.readFile(process.argv[2],{cellFormula:true,cellStyles:true,sheetStubs:true});
T.runTemplate(tpl,T.sqliteExecutor(db),{XLSX:X,clientId:11,orgId:0,from:'2006-12-01 00:00:00.0',to:'2006-12-31 00:00:00.0'});
const o=tpl.Sheets.Output, get=a=>o[a]&&o[a].t!=='z'?o[a]:null;
if(process.env.NEG==='swap'){ const t=o.C3.v; o.C3.v=o.D3.v; o.D3.v=t; }   // negative control: transpose two x-axis labels
const xs=['C','D','E','F'].map(c=>[c,get(c+'3')&&get(c+'3').v]), ys=[4,5,6].map(r=>[r,get('B'+r)&&get('B'+r).v]);
let cells=0,filled=0,empty=0,diffs=0,expFilled=0;
for(const [c,acct] of xs) for(const [r,tbl] of ys){ cells++;
  const q=db.prepare(`SELECT sum(a.amtacctdr-a.amtacctcr) s,count(*) n FROM fact_acct a JOIN c_elementvalue el ON el.c_elementvalue_id=a.account_id WHERE a.AD_Client_ID=11 AND a.postingtype='A' AND a.datetrx BETWEEN '2006-12-01' AND '2006-12-31' AND el.value=? AND CAST(a.ad_table_id AS INTEGER)=CAST(? AS INTEGER)`).get(acct,tbl);
  const cell=get(c+r), want=q.n?Math.round(q.s*100)/100:null, got=cell?Math.round(cell.v*100)/100:null;
  if(want!==null) expFilled++; if(got!==null) filled++; else empty++;
  if(want!==got){ diffs++; console.log(`   DIFF ${c}${r} acct=${acct} tbl=${tbl} sql=${want} sheet=${got}`); } }
console.log(`§XTAB2 grid=${xs.length}x${ys.length} cells=${cells} filled=${filled} empty=${empty} expectedFilled=${expFilled} diffs=${diffs} oracle=independent-SQL(no legacy golden yet)`);
const v=(expFilled<2||empty<1)?'INCONCLUSIVE (grid not sparse/populated enough to judge)':(diffs===0?'PASS':'FAIL');
console.log(`§XTAB2_VERDICT ${v} cells=${cells} diffs=${diffs}`);
