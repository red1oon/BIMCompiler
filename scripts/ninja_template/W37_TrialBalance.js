// W37 — TB-DEMO witness (spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §TB-DEMO). Issue it proves/disproves: "the Thai trial-balance template (by accounting period), run by the JS engine on GardenWorld postings,
// paints EVERY account's opening / debit / credit exactly as an independent SQL query says, the list grew to the full account count, the totals ranges cover the whole grown list,
// and the proof line (debits - credits) is 0". Independent oracle = a hand-written SQL aggregate in THIS file (not the template's own statement).
// Verdicts: PASS | FAIL | INCONCLUSIVE (empty population judged). usage: node W37_TrialBalance.js <parity_tb.xlsx>   env FROM TO NEG=wrongrange
const E=require(process.env.EXCELJS||'/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),fs=require('fs');
const H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js'),C=require(__dirname+'/../../build/erp/ninja_calc.js');
const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3'); const L=(process.env.NT_DATA||'/home/red1/Projects/ninja-template-data')+'/'; const db=new D(process.env.DB||(L+'legacy/twin_snapshot.db'),{readonly:true}); T.registerPgBuiltins((n,f)=>db.function(n,{varargs:true},f));
const CL=+(process.env.CLIENT||11); const FROM=process.env.FROM||'2003-01-01 00:00:00.0', TO=process.env.TO||'2003-12-31 00:00:00.0';
(async()=>{ const m=await H.loadModel(E,fs.readFileSync(process.argv[2])); T.runTemplate(m,T.sqliteExecutor(db),{XLSX:X,clientId:CL,orgId:0,from:FROM,to:TO}); const ev=C.evaluateSheet(m,'Output'); const ws=m.Sheets.Output; const g=k=>ws[k];
 // independent oracle
 const rows=db.prepare(`SELECT e.value v,e.name n,SUM(CASE WHEN SUBSTR(p.startdate,1,10)<SUBSTR(?,1,10) THEN a.amtacctdr-a.amtacctcr ELSE 0 END) op,SUM(CASE WHEN SUBSTR(p.startdate,1,10)>=SUBSTR(?,1,10) THEN a.amtacctdr ELSE 0 END) dr,SUM(CASE WHEN SUBSTR(p.startdate,1,10)>=SUBSTR(?,1,10) THEN a.amtacctcr ELSE 0 END) cr
   FROM fact_acct a JOIN c_elementvalue e ON e.c_elementvalue_id=a.account_id JOIN c_period p ON p.c_period_id=a.c_period_id WHERE a.ad_client_id=${CL} AND a.postingtype='A' AND SUBSTR(p.startdate,1,10)<=SUBSTR(?,1,10) GROUP BY e.value,e.name ORDER BY e.value`).all(FROM,FROM,FROM,TO);
 const n=rows.length; let bad=[]; const near=(a,b)=>Math.abs(a-b)<0.005;
 for(let i=0;i<n;i++){ const r=6+i; const v=[g('A'+r),g('B'+r),g('C'+r),g('D'+r),g('E'+r),g('F'+r)]; const o=rows[i];
  if(!v[0]||String(v[0].v)!==String(o.v)||String(v[1].v)!==o.n) bad.push(`row ${r} id/name ${v[0]&&v[0].v}/${v[1]&&v[1].v} vs ${o.v}/${o.n}`);
  else if(!near(v[2].v,o.op)||!near(v[3].v,o.dr)||!near(v[4].v,o.cr)||!near(v[5].v,o.op+o.dr-o.cr)) bad.push(`row ${r} ${o.v} got op=${v[2].v} dr=${v[3].v} cr=${v[4].v} cl=${v[5].v} want ${o.op} ${o.dr} ${o.cr} ${o.op+o.dr-o.cr}`); }
 const after=g('A'+(6+n+1)); const listClosed=!!after&&String(after.v)==='รวม'&&!g('A'+(6+n))||!!g('A'+(6+n+1));   // row right after the spacer is the totals row; nothing painted past the last account
 const tr=6+n+1, T_= ['C','D','E','F'].map(c=>g(c+tr)); let rangeOk=true; T_.forEach((c,i)=>{ const col='CDEF'[i]; const want=`SUM(${col}6:${col}${tr-1})`; let f=c&&c.f?c.f.replace(/\s/g,''):''; if(process.env.NEG==='wrongrange') f=`SUM(${col}6:${col}6)`; if(f!==want){rangeOk=false; bad.push(`totals ${col}${tr} formula ${f||'(none)'} want ${want}`);} });
 const sum=k=>rows.reduce((s,r)=>s+r[k],0), tdr=g('D'+tr)&&g('D'+tr).v, tcr=g('E'+tr)&&g('E'+tr).v, chk=g('D'+(tr+2))&&g('D'+(tr+2)).v;
 if(process.env.NEG==='wrongrange'){ bad.push('NEG: totals range replaced, expected to be caught by the range check above'); }
 if(!near(tdr,sum('dr'))||!near(tcr,sum('cr'))) bad.push(`totals dr=${tdr} cr=${tcr} vs SQL ${sum('dr')} ${sum('cr')}`);
 if(!near(chk,0)) bad.push(`proof line ${chk} != 0`);
 const open=g('C'+tr)&&g('C'+tr).v, close=g('F'+tr)&&g('F'+tr).v;
 console.log(`§TB_DEMO accounts=${n} period=${FROM.slice(0,10)}..${TO.slice(0,10)} totalDebit=${(+tdr).toFixed(2)} totalCredit=${(+tcr).toFixed(2)} proofDrMinusCr=${(+chk).toFixed(2)} openingTotal=${(+open).toFixed(2)} closingTotal=${(+close).toFixed(2)} formulasEvaluated=${ev.evaluated} errors=${ev.errors}`);
 console.log(`§TB_DEMO_FACT listRows=${n} totalsRow=${tr} cellsJudged=${n*6+4+1} mismatches=${bad.length}`); bad.slice(0,8).forEach(b=>console.log('   '+b));
 console.log('§TB_DEMO_VERDICT '+(n===0?'INCONCLUSIVE (no accounts judged)':bad.length||ev.errors?'FAIL':'PASS'));
})().catch(e=>{console.log('§TB_DEMO ERROR',e.stack);process.exit(1)});
