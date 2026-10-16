'use strict';
// rv_unposted.js -- parse the CAPTURED legacy view definition (rv_unposted.sql, from postgres pg_views) into one record per UNION branch.
// ONE definition for the harness (shopday_more.js localPeriodStatus) and for the list-equality witness (witness_rv_unposted_list.js). Nothing here is invented: every field is read from the text.
const fs = require('fs'), path = require('path');
function branches() {
  const txt = fs.readFileSync(path.join(__dirname, 'rv_unposted.sql'), 'utf8').split('\n').filter(l => !l.startsWith('--')).join('\n');
  return txt.split(/\n\s*UNION\s*\n/).map(b => {
    const sel = b.replace(/^\s*(?:\()?SELECT\s+/i, ''), colOf = alias => { const m = new RegExp('([\\w.\'():]+)(?:::\\w+)?\\s+AS\\s+' + alias + '\\b', 'i').exec(b); return m ? m[1] : null; };
    const from = /\sFROM\s+\(*\s*(\w+)/i.exec(b)[1], strip = e => e == null ? null : e.replace(/'?::.*$/, '').replace(/^'|'$/g, '').replace(/^\w+\./, '');
    const dc = colOf('dateacct'), dbt = colOf('docbasetype'), ds = colOf('docstatus');
    const lit = e => e && /^[A-Z]{2,3}'?(::|$)/.test(e) || e && /^'/.test(e);
    const dsLiteral = lit(ds) ? strip(ds) : null, dbtLiteral = lit(dbt) ? strip(dbt) : null;
    // dateacct/docstatus may be written without an alias (plain column): then the column IS the name
    const dateCol = dc ? strip(dc) : 'dateacct', joinDt = /JOIN\s+c_doctype\s+dt/i.test(b);
    return { table: from, dateCol, docbasetype: dbtLiteral, joinDoctype: joinDt && !dbtLiteral, docstatusFixed: dsLiteral, voTested: /docstatus\)?(?:::\w+)?\s*<>\s*'VO'/i.test(b) };
  });
}
module.exports = { branches };
if (require.main === module) console.log(JSON.stringify(branches(), null, 1));
