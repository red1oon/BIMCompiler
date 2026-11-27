// Does build/erp/ninja_excel.js accept the customer's real templates (private)? Reports gate verdict + reasons. (read-only, no DB)
const XLSX=require('/home/red1/bim-compiler/node_modules/xlsx'); const N=require(__dirname+'/../../build/erp/ninja_excel.js');
for(const f of process.argv.slice(2)){ const wb=XLSX.readFile(f,{cellFormula:true,cellNF:false}); const m=N.readManifest(wb); const g=N.gate(m);
  const dirs={}; m.rows.forEach(r=>dirs[r.direction]=(dirs[r.direction]||0)+1);
  const reasons={}; g.errors.forEach(e=>{const k=e.replace(/Process row \d+/,'Process row N').replace(/\d+/g,'#').slice(0,90); reasons[k]=(reasons[k]||0)+1;});
  console.log(`§NINJA_GATE ${f.split('/').pop()} sheets=${wb.SheetNames.join(',')} processRows=${m.rows.length} directions=${JSON.stringify(dirs)} gateOk=${g.ok} errors=${g.errors.length}`);
  Object.entries(reasons).sort((a,b)=>b[1]-a[1]).slice(0,5).forEach(([k,v])=>console.log(`   ${v}x ${k}`)); }
