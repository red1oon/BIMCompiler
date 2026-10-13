// W23 — stone 2b: do the statements ninja_template.js builds PREPARE on the SQLite twin schema? (syntax/dialect only; data parity is a separate gate)
const X=require('/home/red1/bim-compiler/node_modules/xlsx'),T=require(__dirname+'/../../build/erp/ninja_template.js'),D=require('/home/red1/bim-compiler/node_modules/better-sqlite3');
const L='/home/red1/Projects/ninja-template-data/'; const db=new D(process.env.TWIN||__dirname+'/../../build/erp/ad_full.db',{readonly:true});
const files=process.argv.slice(2); let tot=0,ok=0; const cls={};
for(const f of files){ const wb=X.readFile(f,{cellFormula:true,cellStyles:true,sheetStubs:true}); const S=T.runTemplate(wb,()=>[],{XLSX:X,clientId:11,from:'2026-05-01 00:00:00.0',to:'2026-05-31 00:00:00.0'});
  let fok=0; S.sqls.forEach((q,i)=>{ tot++; try{ db.prepare(q); ok++; fok++; }catch(e){ const m=e.message.replace(/"[^"]*"/g,'"?"').slice(0,70); const k=m.replace(/\d+/g,'#'); (cls[k]=cls[k]||{n:0,ex:q.slice(0,160),file:f.split('/').pop()}).n++; } });
  console.log(`§DIALECT ${f.split('/').pop()} statements=${S.sqls.length} prepare-ok=${fok}`); }
console.log(`§DIALECT_TOTAL statements=${tot} ok=${ok} fail=${tot-ok}`);
Object.entries(cls).sort((a,b)=>b[1].n-a[1].n).forEach(([k,v])=>console.log(`  ${v.n}x ${k}\n      e.g. ${v.ex}`));
