// ⚠ DO NOT REMOVE — SCOPE: ERP_DEPTH_FILM.md §FN-CENSUS stage 1. Read the log (scripts/bridge/out/fn_census.json + § lines) after every run.
// Census of the legacy pilot's PL/pgSQL functions vs the JS twin (bim-ootb). Read-only on the pilot (docker exec postgres psql).
// usage: node scripts/bridge/fn_census_legacy.js [bim-ootb dir=~/bim-ootb]
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const OOTB = process.argv[2] || path.join(os.homedir(), 'bim-ootb');
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-F', '\t', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8', maxBuffer: 1 << 26 }).replace(/^SET\n/, '');
const INFRA = 'altercolumn add_missing_translations update_sequences register_migration_script role_access_update migr_fix_payment_cashline delete_ad_archive_binary delete_ad_attachment_binary delete_ad_image_binary forbid_multiple_rows_in_dbreplicasyncverifier'.split(' ');
const SHIM = 'nvl instr charat round trunc adddays subtractdays add_months getdate firstof daysbetween'.split(' ');
const BUSINESS = 'acctbalance bompricelimit bompricelist bompricestd bomqtyavailable bomqtyonhand bomqtyonhandforreservation bomqtyordered bomqtyreserved bpartnerremitlocation currencybase currencyconvert currencyconvertinvoice currencyconvertpayment currencyrate currencyround documentno generate_uuid get1099bucket get_sysconfig invoicediscount invoiceopen invoiceopentodate invoicepaid invoicepaidtodate invoicewriteoff isintersectcsv ismemberofacctschema nextbusinessday nextid nextidfunc paymentallocated paymentavailable paymenttermdiscount paymenttermduedate paymenttermduedays prodqtyordered prodqtyreserved productattribute torecordid'.split(' ');
const cls = n => /^uuid_/.test(n) || INFRA.includes(n) ? 'INFRA' : SHIM.includes(n) ? 'SHIM' : BUSINESS.includes(n) ? 'BUSINESS' : 'UNCLASSIFIED';
const rows = pg("select p.proname, pg_get_function_identity_arguments(p.oid), md5(p.prosrc) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='adempiere' order by 1,2").trim().split('\n').filter(Boolean).map(l => l.split('\t'));
const sqlfn = fs.readFileSync(path.join(OOTB, 'erp/callouts/sqlfn.js'), 'utf8');
const udf = new Set((sqlfn.match(/ARITY = \{([\s\S]*?)\};/) || ['', ''])[1].match(/\b[a-z_0-9]+(?=:\s*\[)/g) || []);
const jsFiles = execFileSync('bash', ['-c', `cd ${OOTB} && ls erp/*.js erp/callouts/*.js erp/processes/*.js | grep -v -E 'min\\.js|sql-wasm'`], { encoding: 'utf8' }).trim().split('\n');
const src = jsFiles.map(f => [f, fs.readFileSync(path.join(OOTB, f), 'utf8')]);
const out = [], fnNames = [...new Set(rows.map(r => r[0]))];
for (const n of fnNames) {
  const c = cls(n), refs = src.filter(([f, s]) => new RegExp('\\b' + n + '\\b', 'i').test(s)).map(([f]) => f);
  const port = udf.has(n) ? 'sqlfn.js UDF' : refs.length ? 'referenced in ' + refs.length + ' file(s)' : 'NONE';
  out.push({ name: n, overloads: rows.filter(r => r[0] === n).length, cls: c, port, refs: refs.slice(0, 6) });
}
const by = k => out.filter(o => o.cls === k);
const gaps = by('BUSINESS').filter(o => o.port === 'NONE').map(o => o.name);
console.log(`§FN_CENSUS pg_proc=${rows.length} distinct=${fnNames.length} INFRA=${by('INFRA').length} SHIM=${by('SHIM').length} BUSINESS=${by('BUSINESS').length} UNCLASSIFIED=${by('UNCLASSIFIED').length} sqlfnUDF=${udf.size}`);
console.log(`§FN_CENSUS BUSINESS ported-as-UDF=${by('BUSINESS').filter(o => o.port === 'sqlfn.js UDF').length} referenced-only=${by('BUSINESS').filter(o => /^referenced/.test(o.port)).length} NONE=${gaps.length} [${gaps.join(', ')}]`);
by('UNCLASSIFIED').forEach(o => console.log('§FN_CENSUS UNCLASSIFIED ' + o.name));
const verdict = rows.length === 0 ? 'INCONCLUSIVE' : by('UNCLASSIFIED').length ? 'FAIL' : gaps.length ? 'RED' : 'PASS';
console.log('§FN_CENSUS verdict=' + verdict + (verdict === 'RED' ? ' (BUSINESS functions with no JS reference - stage 2)' : ''));
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out/fn_census.json'), JSON.stringify({ date: new Date().toISOString(), rows: out }, null, 1));
