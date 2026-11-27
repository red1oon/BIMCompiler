// Run an ExpenseReport process on the local clone via stock run_process. usage: [WSTYPE=..] [DFROM=..] [DTO=..] BRIDGE_BASE=http://localhost:8098 node run_er.js <xls path on server>
const ad=require('/home/red1/bim-compiler/scripts/bridge/ad_client.js');
(async()=>{const cfg=ad.cfgFromEnv();
 const r=await ad.runProcess(cfg,process.env.WSTYPE||'Bridge_RunProcess_ExpenseReport',{DateFrom:process.env.DFROM||'2026-01-01',DateTo:process.env.DTO||'2026-12-31',File_Directory:process.argv[2]});
 console.log('§ER_RUN ok='+r.ok+' summary='+r.summary+' error='+(r.error||'')+' logs='+JSON.stringify(r.logs||'').slice(0,400));})().catch(e=>console.log('§ER_RUN FAIL',e.kind,e.message));
