// W49 — pre-flight SLOW-STATEMENT GUARD (build/erp/ninja_preflight.js timed({slowMs}) + verdict()). Issues proved/disproved (spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §SLOW-GUARD):
//  (a) with fact_acct_record_id present, the MOES cashflow + sofp reports on the Laos copy run with ZERO slow statements AND produce real PDFs whose text is arithmetically consistent (PASS);
//  (b) NEGATIVE CONTROL: with the index dropped the guard must say FAIL (a statement hits the DB timeout) - proves the guard can see the 229 s defect; the index is re-created in finally;
//  (c) VACUOUS: a guard that judged no statement says INCONCLUSIVE, never PASS.
// usage: NT_PGPASS=.. node W49_SlowGuard.js <outdir>     DB = local docker copy laos-restore on port 55432 ONLY (it is mutated by (b)); anything else is refused.
const E=require('/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),X=require('/home/red1/bim-compiler/node_modules/xlsx'),H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),T=require(__dirname+'/../../build/erp/ninja_template.js'),PF=require(__dirname+'/../../build/erp/ninja_preflight.js'),fs=require('fs'),cp=require('child_process');
const OUT=process.argv[2]||'/tmp/ninja_template_out'; fs.mkdirSync(OUT,{recursive:true});
const L='/home/red1/Projects/ninja-template-data/legacy/xlsx/', PORT=process.env.NT_PGPORT||'55432', DOCKER='laos-restore';
if(PORT!=='55432'){ console.log('§SLOW_GUARD_REFUSED this witness drops an index; only the local copy on port 55432 is allowed'); process.exit(2); }
const BASE={...process.env,NT_PGPORT:PORT,NT_PGUSER:'postgres',NT_PGDB:'leasing',NT_PGPASS:process.env.NT_PGPASS||'',NT_CLIENT:process.env.NT_CLIENT||'',NT_ORG:process.env.NT_ORG||'',EXEC:'pg',FROM:'2025-01-01 00:00:00.0',TO:'2025-12-31 00:00:00.0'};
const psql=q=>cp.spawnSync('docker',['exec',DOCKER,'psql','-U','postgres','-d','leasing','-Atc',q],{encoding:'utf8'});
const hasIdx=()=>psql("select count(*) from pg_indexes where schemaname='adempiere' and tablename='fact_acct' and indexdef ~ '\\(record_id\\)'").stdout.trim()!=='0';
let ok=0,bad=0; const t=(n,c,extra)=>{ console.log(`§SLOW_GUARD_CASE ${n} ${c?'ok':'WRONG'}${extra?' '+extra:''}`); c?ok++:bad++; };
const pgexec=(timeoutMs)=>sql=>{ const r=cp.spawnSync('python3',[__dirname+'/pg_exec.py'],{input:sql,encoding:'utf8',maxBuffer:1<<28,env:{...BASE,NT_STMT_MS:String(timeoutMs)}}); const j=JSON.parse(r.stdout); if(j.error) throw new Error(j.error); return j.rows; };
async function run(name,slowMs,timeoutMs){ const buf=fs.readFileSync(L+name+'.xlsx'),m=await H.loadModel(E,buf); const g=PF.timed(pgexec(timeoutMs),console.log,{slowMs}); let err=null,S=null;
  try{ S=T.runTemplate(m,PF.selectOnly(g),{XLSX:X,clientId:+BASE.NT_CLIENT,orgId:+BASE.NT_ORG,from:BASE.FROM,to:BASE.TO}); }catch(e){ err=e.message.split('\n')[0]; console.log('§SLOW_GUARD_RUN_STOPPED '+name+' '+err); }
  g.summary(); return {verdict:g.verdict(),err,S}; }
function pdf(name){ const out=`${OUT}/${name}_Laos_2025.pdf`; try{fs.unlinkSync(out);}catch(e){}
  const r=cp.spawnSync('node',[__dirname+'/W33_PdfRender.js',L+name+'.xlsx',out,'excel'],{encoding:'utf8',env:{...BASE,NT_STMT_MS:'60000'}}); console.log(r.stdout.trim());
  const size=fs.existsSync(out)?fs.statSync(out).size:0; const txt=size?cp.spawnSync('pdftotext',['-layout',out,'-'],{encoding:'utf8'}).stdout:''; return {out,size,txt}; }
const num=s=>Number(s.replace(/,/g,'')); const lastNum=(txt,re)=>{ const l=txt.split('\n').find(x=>re.test(x)); if(!l) return null; const n=l.match(/-?[\d,]+\.\d\d/g); return n?num(n[n.length-1]):null; };
(async()=>{
 const had=hasIdx(); if(!had){ psql('CREATE INDEX IF NOT EXISTS fact_acct_record_id ON adempiere.fact_acct (record_id)'); }
 t('index_present_for_positive_case',hasIdx());
 try{
  // (a) positive: both reports, real PDFs
  for(const n of ['MOES_cashflow','MOES_sofp']){ const r=await run(n,5000,60000); t(`${n}_guard_PASS`,r.verdict==='PASS'&&!r.err);
    const p=pdf(n); t(`${n}_pdf_written`,p.size>20000,`bytes=${p.size} file=${p.out}`);
    if(n==='MOES_cashflow'){ const I=lastNum(p.txt,/^\s*I\.\s+\S*.*I\.1 \+ I\.2/),II=lastNum(p.txt,/^\s*II\.\s+.*II\.1 \+ II\.2/),III=lastNum(p.txt,/^\s*III\.\s/); console.log(`§SLOW_GUARD_PDF_MATH I=${I} II=${II} III=${III}`); t('cashflow_pdf_III_equals_I_minus_II',I!=null&&II!=null&&III!=null&&Math.abs((I-II)-III)<0.005); } }
  // (b) negative control: drop the index, the guard must FAIL
  psql('DROP INDEX adempiere.fact_acct_record_id'); t('index_dropped_for_negative_control',!hasIdx());
  const neg=await run('MOES_cashflow',5000,8000); t('NEG_no_index_guard_FAIL',neg.verdict==='FAIL');
 } finally { psql('CREATE INDEX IF NOT EXISTS fact_acct_record_id ON adempiere.fact_acct (record_id)'); console.log('§SLOW_GUARD_RESTORE index_present='+hasIdx()); }
 // (c) vacuous
 const v=PF.timed(()=>[],()=>{},{slowMs:5000}); t('VACUOUS_no_statement_is_INCONCLUSIVE',v.verdict()==='INCONCLUSIVE');
 console.log(`§SLOW_GUARD_VERDICT_W49 ${bad===0?'PASS':'FAIL'} ok=${ok} bad=${bad}`); process.exit(bad?1:0);
})().catch(e=>{console.log('§SLOW_GUARD ERROR',e.stack);process.exit(1)});
