// W40 — RECORDED-ANSWER REPLAY (user, 2026-10-14: "reverse engineer the data values ... as long as it hits all the process and cells"; the MOES workbook is granted correct for Laos, we only test COVERAGE).
// The workbook's saved Process VALUES are what the customer's server returned; the saved Output is what was painted. A stand-in executor replays those recorded values; the engine does everything else
// (links Input->Process addresses, paint S/V/>/+, row/column growth, formula shift, recalc). Judged: (1) every saved ADDRESS is re-derived from the Input links, (2) every non-empty saved Output cell is compared.
// NOT judged: the SQL itself. Verdicts PASS / FAIL / INCONCLUSIVE (coverage below 100% of addressed Process rows or no recorded values). usage: node W47_Replay.js <migrated.xlsx>
const E=require('/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js'),C=require(__dirname+'/../../build/erp/ninja_calc.js'),fs=require('fs');
const VCOL=8, name=process.argv[2].split('/').pop();
const addr=(r,c)=>{let s='',n=c+1;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s+(r+1)};
const ad=a=>{const m=/^([A-Z]+)(\d+)$/.exec(a);let c=0;for(const ch of m[1])c=c*26+ch.charCodeAt(0)-64;return{r:+m[2]-1,c:c-1}};
(async()=>{ const buf=fs.readFileSync(process.argv[2]); const saved=await H.loadModel(E,buf), work=await H.loadModel(E,buf);
 const sp=saved.Sheets.Process, so=JSON.parse(JSON.stringify(saved.Sheets.Output));
 const physRows=()=>[...new Set(Object.keys(sp).filter(k=>k[0]!=='!').map(k=>ad(k).r))].sort((a,b)=>a-b);
 const rows=physRows(); const get=(r,c)=>{const x=sp[addr(r,c)];return x&&x.t!=='z'&&x.v!==''?x:null};
 // 1. recorded answers exist at all?
 let recorded=0; rows.forEach(r=>{ if(get(r,VCOL)) recorded++; });
 let st=null; let replayed=0, cols=0;
 const exec=sql=>{ replayed++; const first=st.lastrowwrite, last=st.lastrowread; let n=0; for(let i=first;i<last&&i<rows.length;i++){ const c2=get(rows[i],2); if(c2&&String(c2.v).trim()!=='') n++; } if(n===0) n=1;
   const out=[]; for(let v=VCOL;v<255;v++){ const head=get(rows[first],v); if(!head||String(head.v)==='END') break; const rec=[]; for(let k=0;k<n&&first+k<rows.length;k++){ const c=get(rows[first+k],v); if(!c||String(c.v)==='NULL'||String(c.v)==='END') rec.push(c&&String(c.v)==='NULL'?null:null); else rec.push(c.t==='n'?{k:'n',s:String(c.v)}:{k:'s',s:String(c.v)}); } out.push(rec); cols++; }
   return out.length?out:[]; };
 const S=T.runTemplate(work,exec,{XLSX:X,clientId:11,orgId:0,from:'2025-01-01 00:00:00.0',to:'2025-12-31 00:00:00.0',onState:(s)=>{st=s;}});
 C.evaluateSheet(work,'Output');
 // 2. address coverage: every saved ADDRESS (Process col G) re-derived by the engine from the Input links
 let addrSaved=0,addrSame=0; const wp=work.Sheets.Process; rows.forEach(r=>{ const a=get(r,6); if(!a) return; addrSaved++; const b=wp[addr(r,6)]; if(b&&String(b.v)===String(a.v)) addrSame++; else if(addrSaved-addrSame<=5) console.log(`   ADDR row ${r+1} saved=${a.v} ours=${b&&b.v}`); });
 // 3. Output cell coverage
 const inMergeSlave=k=>{ const p=ad(k); return (so['!merges']||[]).some(m=>p.r>=m.s.r&&p.r<=m.e.r&&p.c>=m.s.c&&p.c<=m.e.c&&!(p.r===m.s.r&&p.c===m.s.c)); };   /* merged-cell slaves just mirror the master: not separate cells */
 let cells=0,same=0,diffs=[]; const wo=work.Sheets.Output; Object.keys(so).filter(k=>k[0]!=='!').forEach(k=>{ const x=so[k]; if(!x||x.t==='z'||x.v===''||x.v==null||inMergeSlave(k)) return; cells++; const y=wo[k]; let ok=false;
   if(y&&y.t!=='z'){ if(x.t==='n'&&y.t==='n') ok=Math.abs(x.v-y.v)<0.005; else ok=String(x.v)===String(y.v); } if(ok) same++; else diffs.push(`${k} saved=${x.v} ours=${y&&y.v}`); });
 console.log(`§REPLAY ${name} processRows=${rows.length} recordedAnswerRows=${recorded} statements=${S.sqlcount} replayed=${replayed} answerColumns=${cols}`);
 console.log(`§REPLAY ${name} addresses saved=${addrSaved} reDerived=${addrSame} | outputCells saved=${cells} same=${same} differ=${diffs.length}`);
 diffs.slice(0,12).forEach(d=>console.log('   DIFF '+d));
 let fdiff=0; const fl=[]; Object.keys(so).filter(k=>k[0]!=='!').forEach(k=>{ const x=so[k],y=wo[k]; const fx=(x&&x.f||'').replace(/\s+/g,''), fy=(y&&y.f||'').replace(/\s+/g,''); if(fx!==fy){ fdiff++; if(fl.length<6) fl.push(`${k} saved=${fx||'-'} ours(BACKUP)=${fy||'-'}`); } });
 console.log(`§REPLAY ${name} formulas differing saved-Output vs BACKUP-cloned=${fdiff}`+(fdiff?' e.g. '+fl.join(' ; '):''));
 const v=(recorded===0||addrSaved===0)?'INCONCLUSIVE (no recorded answers or addresses)':(addrSame<addrSaved?`FAIL (${addrSaved-addrSame} address(es) not re-derived)`:(diffs.length===0?'PASS':'FAIL'));
 console.log(`§REPLAY_VERDICT ${name} ${v} coverage=addresses ${addrSame}/${addrSaved}, outputCells ${same}/${cells}`); })().catch(e=>{console.log('§REPLAY ERROR',e.stack);process.exit(1)});
