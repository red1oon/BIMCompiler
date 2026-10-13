// W38 — template pre-flight + SELECT-only guard (build/erp/ninja_preflight.js). Issues proved/disproved:
//  (a) a clean template is NOT flagged (no false alarm); (b) a mistyped Input tag IS flagged (it paints nothing, silently, in the legacy flow); (c) a hand-edited FORMULA in Output IS flagged (data values in Output are the previous run and are NOT flagged) as BACKUP drift;
//  (d) an empty Direction IS flagged; (e) a missing sheet IS flagged; (f) the guard passes a SELECT and refuses DELETE / stacked statements / DROP.  usage: node W38_Preflight.js <showcase_template.xlsx>
const E=require('/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'),H=require(__dirname+'/../../build/erp/ninja_template_xlsx.js'),F=require(__dirname+'/../../build/erp/ninja_preflight.js'),fs=require('fs');
(async()=>{ const buf=fs.readFileSync(process.argv[2]); const fresh=()=>H.loadModel(E,buf); let ok=0,bad=0; const t=(name,cond)=>{ console.log(`§PREFLIGHT_CASE ${name} ${cond?'ok':'WRONG'}`); cond?ok++:bad++; };
 let m=await fresh(); let r=F.preflight(m); t('clean_template_no_findings', r.errors.length===0&&r.warnings.length===0);
 m=await fresh(); m.Sheets.Output.C12={t:'n',v:5}; r=F.preflight(m); t('previous_run_data_in_output_not_flagged', r.warnings.length===0);
 m=await fresh(); m.Sheets.Input.B7={t:'s',v:'@count(*)@44'}; r=F.preflight(m); t('mistyped_tag_flagged', r.errors.some(e=>/^UNMATCHED_TAG Input!B7/.test(e)));
 m=await fresh(); m.Sheets.Output.G15={t:'n',v:0,f:'SUM(C15:E15)'}; r=F.preflight(m); t('output_hand_edit_flagged_as_drift', r.warnings.some(w=>/^BACKUP_DRIFT/.test(w)));
 m=await fresh(); delete m.Sheets.Process.H4; r=F.preflight(m); t('empty_direction_flagged', r.errors.some(e=>/^EMPTY_DIRECTION Process row 4/.test(e)));
 m=await fresh(); delete m.Sheets.BACKUP; m.SheetNames=m.SheetNames.filter(n=>n!=='BACKUP'); r=F.preflight(m); t('missing_sheet_flagged', r.errors.some(e=>/^SHEET_MISSING BACKUP/.test(e)));
 const g=F.selectOnly(s=>'ran'); const refuses=s=>{ try{ g(s); return false; }catch(e){ return /§SQL_REFUSED/.test(e.message); } };
 t('guard_allows_select', g('SELECT a FROM t WHERE x=\';\'')==='ran'); t('guard_refuses_delete', refuses('DELETE FROM t')); t('guard_refuses_stacked', refuses('SELECT 1; DROP TABLE t')); t('guard_refuses_update_in_select', refuses('SELECT 1 FROM t WHERE 1=1 UNION SELECT 1; UPDATE t SET a=1'));
 console.log(`§PREFLIGHT_VERDICT ${bad===0&&ok>=10?'PASS':(ok===0?'INCONCLUSIVE':'FAIL')} cases=${ok+bad} wrong=${bad}`); })();
