// W30 — cell parity of the TWIN's output .xlsx vs the REAL Laos fork's output .xls (Output + Process): non-formula cells by value, formula cells by formula text.
const X=require('/home/red1/bim-compiler/node_modules/xlsx'); const [oracle,twin]=[process.argv[2],process.argv[3]]; const O={cellFormula:true,sheetStubs:true,cellDates:false};
const a=X.readFile(oracle,O), b=X.readFile(twin,O); const nf=f=>String(f).replace(/\s+/g,'').replace(/\$/g,'').toUpperCase(); let n=0,d=0; const ex=[];
for(const sn of ['Output','Process']){ const x=a.Sheets[sn],y=b.Sheets[sn]; const keys=new Set([...Object.keys(x),...Object.keys(y)].filter(k=>k[0]!=='!'));
 keys.forEach(k=>{ const p=x[k],q=y[k]; const bl=o=>!o||o.t==='z'||(o.t==='s'&&o.v===''); if(bl(p)&&bl(q))return; n++; let same;
  if(p&&q&&(p.f||q.f)) same=p.f&&q.f&&nf(p.f)===nf(q.f); else same=p&&q&&(p.t===q.t||(p.t==='n'&&q.t==='n'))&&(p.t==='n'?Math.abs(p.v-q.v)<1e-9:String(p.v)===String(q.v));
  if(!same){d++; if(ex.length<6)ex.push(`${sn}!${k} oracle=${JSON.stringify(p&&{t:p.t,v:p.v,f:p.f})} twin=${JSON.stringify(q&&{t:q.t,v:q.v,f:q.f})}`);} }); }
console.log(`§CELL_PARITY ${twin.split('/').pop()} cells=${n} diffs=${d}`); ex.forEach(e=>console.log('   '+e)); console.log('§CELL_PARITY_VERDICT '+(n===0?'INCONCLUSIVE':d===0?'PASS':'FAIL'));
