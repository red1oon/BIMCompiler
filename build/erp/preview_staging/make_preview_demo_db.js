'use strict';
var Database = require('better-sqlite3');
var seed = new Database('/home/red1/bim-compiler/build/erp/ad_full.db', { readonly: true });
var roles = seed.prepare("SELECT ad_role_id, isshowacct FROM ad_role WHERE isshowacct IS NOT NULL").all();
seed.close();
var db = new Database('/tmp/wt-preview/erp/tests/fixtures/preview_demo.db');
db.exec("DROP TABLE IF EXISTS ad_role");
db.exec("CREATE TABLE ad_role (ad_role_id INTEGER, isshowacct TEXT)");
var ins = db.prepare("INSERT INTO ad_role (ad_role_id, isshowacct) VALUES (?,?)");
db.transaction(function(rs){ rs.forEach(function(r){ ins.run(r.ad_role_id, r.isshowacct); }); })(roles);
var got = db.prepare("SELECT ad_role_id id, isshowacct FROM ad_role ORDER BY ad_role_id").all();
console.log('  demo ad_role: ' + got.map(function(r){return r.id+'='+r.isshowacct;}).join(' ') +
            ' | c_order=' + db.prepare("SELECT count(*) c FROM c_order").get().c +
            ' fact_acct=' + db.prepare("SELECT count(*) c FROM fact_acct").get().c);
db.close();
