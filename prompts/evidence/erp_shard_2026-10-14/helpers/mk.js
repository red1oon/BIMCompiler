const D=require('/home/red1/bim-compiler/node_modules/better-sqlite3');
function mk(out,tables){require('fs').rmSync(out,{force:true});const db=new D(out);db.pragma('page_size=16384');db.pragma('journal_mode=OFF');db.exec("ATTACH '"+process.argv[2]+"' AS s");
 let n=0;for(const t of tables){const r=db.prepare("select sql from s.sqlite_master where type='table' and name=?").get(t);if(!r)continue;db.exec(r.sql);db.exec('INSERT INTO "'+t+'" SELECT * FROM s."'+t+'"');n++}
 console.log(out.split('/').pop(),'tables',n,'bytes',require('fs').statSync(out).size);}
const all=new D(process.argv[2],{readonly:true}).prepare("select name from sqlite_master where type='table'").all().map(r=>r.name);
const plan=['c_order','c_orderline','c_invoice','c_invoiceline','m_inout','m_inoutline','m_inoutconfirm','m_matchinv','m_matchpo','c_payment','c_allocationhdr','c_allocationline','gl_journal','gl_journalline','c_bankstatement','c_bankstatementline','m_movement','m_movementline','m_transaction','m_costdetail','fact_acct','ad_changelog','ad_session'];
mk(process.argv[3]+'/full16.db',all);mk(process.argv[3]+'/slim16.db',plan);
