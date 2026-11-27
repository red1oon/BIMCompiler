const fs=require('fs'),S=process.argv[2];
for (const b of ['818','851']) for (const i of [1,2,3]) {
  const r=JSON.parse(fs.readFileSync(`${S}/lh_${b}_${i}.json`)); const a=r.audits;
  const mw={}; (a['mainthread-work-breakdown'].details.items||[]).forEach(x=>mw[x.group]=Math.round(x.duration));
  const reqs=a['network-requests'].details.items; const js=reqs.filter(x=>x.resourceType==='Script');
  const db=reqs.find(x=>/Duplex_extracted\.db/.test(x.url));
  console.log(`§P0_LH build=${b} run=${i} runtimeError=${r.runtimeError?r.runtimeError.code:'none'} warnings=${(r.runWarnings||[]).length}`+
   ` TBT_ms=${Math.round(a['total-blocking-time'].numericValue)} FCP_ms=${Math.round(a['first-contentful-paint'].numericValue)} TTI_ms=${Math.round(a['interactive'].numericValue)}`+
   ` LCP_ms=${Math.round(a['largest-contentful-paint'].numericValue)} bootup_ms=${Math.round(a['bootup-time'].numericValue)} mainthread_ms=${Math.round(a['mainthread-work-breakdown'].numericValue)}`+
   ` scriptEval_ms=${mw.scriptEvaluation} parseCompile_ms=${mw.scriptParseCompile} js_reqs=${js.length} js_KB=${Math.round(js.reduce((s,x)=>s+x.resourceSize,0)/1024)}`+
   ` total_KB=${Math.round(a['total-byte-weight'].numericValue/1024)} db_req=${db?db.statusCode:'NONE'}`);
}
