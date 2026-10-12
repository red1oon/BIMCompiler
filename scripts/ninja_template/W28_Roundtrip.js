// W28 — host roundtrip: xlsx -> engine cell model -> xlsx (engine NOT run). Style + value parity must be 100%: proves the adapter loses nothing.
const E=require(process.env.EXCELJS||'/home/red1/Projects/LaosExpenseReport/nm/node_modules/exceljs'),H=require('/home/red1/bim-compiler/build/erp/ninja_template_xlsx.js'),fs=require('fs');
(async()=>{ const inp=process.argv[2], out=process.argv[3]; const buf=fs.readFileSync(inp); const m=await H.loadModel(E,buf);
 const outBuf=await H.saveModel(E,m,buf,['Output','Process']); fs.writeFileSync(out,Buffer.from(outBuf));
 const m2=await H.loadModel(E,fs.readFileSync(out)); let n=0,d=0; const ex=[];
 for(const sn of ['Output','Process']){ const a=m.Sheets[sn],b=m2.Sheets[sn]; for(const k of new Set([...Object.keys(a),...Object.keys(b)])){ if(k[0]==='!')continue; const x=a[k],y=b[k]; const blank=o=>!o||o.t==='z'; if(blank(x)&&blank(y))continue; n++; const same=x&&y&&x.t===y.t&&x.v===y.v&&(x.f||'')===(y.f||'')&&(x.z||'')===(y.z||'');   /* styles are judged by W27 (POI), not by ExcelJS JSON */ if(!same){d++; if(ex.length<4)ex.push(sn+'!'+k+' '+JSON.stringify(x)+' | '+JSON.stringify(y));} } }
 console.log(`§ROUNDTRIP ${inp.split('/').pop()} cells=${n} diffs=${d} sheets=${m.SheetNames.join(',')}`); ex.forEach(e=>console.log('   '+e)); console.log('§ROUNDTRIP_VERDICT '+(n===0?'INCONCLUSIVE':d===0?'PASS':'FAIL'));
})().catch(e=>{console.log('§ROUNDTRIP ERROR',e.stack);process.exit(1)});
