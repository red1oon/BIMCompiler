// ⚠ DO NOT REMOVE — film "Fast Script ERP": the process of beat 7, picked the way common/door/tests/witness_red1_report.js picks it (no name written by hand): the first ACTIVE process with a class, no JS port, and no mandatory parameter
// without a default, in AD_Process_ID order, from the dictionary (erp/ad_seed.db) and the ports loaded (erp/processes/*.js). Prints one line: name<TAB>classname<TAB>the number of such processes. Usage: node noport.js <bim-ootb checkout>
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.resolve(process.argv[2] || '/tmp/wt-film-fse-ootb');
(async () => {
  const AP = require(path.join(ROOT, 'erp/ad_process.js')); fs.readdirSync(path.join(ROOT, 'erp/processes')).filter(f => /\.js$/.test(f)).forEach(f => { try { require(path.join(ROOT, 'erp/processes', f)); } catch (e) { /* skip */ } });
  const SQL = await require(path.join(ROOT, 'modeller/lib/sql-wasm.js'))({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller/lib/sql-wasm.wasm')) }), db = new SQL.Database(fs.readFileSync(path.join(ROOT, 'erp/ad_seed.db')));
  const r = db.exec("SELECT p.name, p.classname FROM ad_process p WHERE p.isactive='Y' AND p.classname IS NOT NULL AND p.classname<>'' AND NOT EXISTS (SELECT 1 FROM ad_process_para pp WHERE pp.ad_process_id=p.ad_process_id AND pp.isactive='Y' AND pp.ismandatory='Y' AND (pp.defaultvalue IS NULL OR pp.defaultvalue='')) ORDER BY p.ad_process_id");
  const hits = (r.length ? r[0].values : []).filter(x => !(AP.JAVA && AP.JAVA[x[1]]) && !AP.hasHandler(x[1]));
  if (!hits.length) { console.log('NONE'); process.exit(2); }
  console.log(hits[0][0] + '\t' + hits[0][1] + '\t' + hits.length);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
