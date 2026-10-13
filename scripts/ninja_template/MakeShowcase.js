// MakeShowcase.js — SHOWCASE template ("Trial Balance by Source Document"): a professionally designed Excel layout (colour bands, KPI boxes, zebra grid, totals, signature boxes).
// The DESIGN is plain Excel formatting owned by the report author (BACKUP sheet); the Process sheet only says which SQL fills which cell. GardenWorld rows only.
// usage: node MakeShowcase.js <out.xlsx>
const E=require('/home/red1/Projects/ninja-template-data/nm/node_modules/exceljs'); const wb=new E.Workbook();
const NAVY='FF1F3864',TEAL='FF0F7C8C',ORG='FFED7D31',GRN='FF2E8B57',PUR='FF7030A0',LB='FFDDEBF7',GOLD='FFFFF2CC',GREY='FFF2F2F2',WHITE='FFFFFFFF',ZEB='FFF7FAFD';
const fill=c=>({type:'pattern',pattern:'solid',fgColor:{argb:c}}), thin=c=>({style:'thin',color:{argb:c||'FFBFBFBF'}}), box=(s,c)=>({top:{style:s,color:{argb:c}},bottom:{style:s,color:{argb:c}},left:{style:s,color:{argb:c}},right:{style:s,color:{argb:c}}});
const NUM='#,##0.00;-#,##0.00';
const ACC="('12110','14120','41000','51100')";
function layout(ws,tags){
  ws.getColumn(1).width=2; ws.getColumn(2).width=30; for(let c=3;c<=6;c++) ws.getColumn(c).width=17; ws.getColumn(7).width=19; ws.getColumn(8).width=2;
  const t=(a,tag,txt)=>{ if(!tags||!tag) return tags?tag:txt; const n=/@(\d+)$/.exec(tag)[1]; return {formula:'Process!A'+n,result:tag}; };   // Input cell = Excel LINK to the Process row's annotation (=Process!A9), not typed text                                     // Input holds @sql@row tags where Output will hold data
  const set=(a,v,st)=>{ const c=ws.getCell(a); c.value=v; Object.assign(c,{}); if(st) c.style=Object.assign({},c.style,st); return c; };
  ws.getRow(2).height=38; ws.mergeCells('B2:G2'); set('B2','TRIAL BALANCE BY SOURCE DOCUMENT',{font:{name:'Arial',size:20,bold:true,color:{argb:WHITE}},fill:fill(NAVY),alignment:{horizontal:'center',vertical:'middle'}});
  ws.getRow(3).height=22; ws.mergeCells('B3:G3'); set('B3',t('B3','@a.name@2',null),{font:{name:'Arial',size:12,bold:true,color:{argb:WHITE}},fill:fill(TEAL),alignment:{horizontal:'center',vertical:'middle'}});
  ws.mergeCells('B4:G4'); set('B4',t('B4',"@CONCAT(to_char(DATE #1, 'DD/MM/YYYY'),' - ',to_char(DATE #2, 'DD/MM/YYYY'))@3",null),{font:{name:'Arial',size:10,italic:true,color:{argb:'FF404040'}},fill:fill(GREY),alignment:{horizontal:'center'}});
  // KPI boxes
  [['B6:C6','B7:C7','POSTINGS','B7','@count(*)@4',ORG,'#,##0'],['D6:E6','D7:E7','TOTAL DEBIT','D7','@sum(a.amtacctdr)@5',GRN,NUM],['F6:G6','F7:G7','TOTAL CREDIT','F7','@sum(a.amtacctcr)@6',PUR,NUM]].forEach(k=>{
    ws.mergeCells(k[0]); ws.mergeCells(k[1]); const l=k[0].split(':')[0];
    set(l,k[2],{font:{name:'Arial',size:9,bold:true,color:{argb:WHITE}},fill:fill(k[5]),alignment:{horizontal:'center',vertical:'middle'}});
    set(k[3],t(k[3],k[4],null),{font:{name:'Arial',size:16,bold:true,color:{argb:k[5]}},numFmt:k[6],alignment:{horizontal:'center',vertical:'middle'}});
    const [a,b]=k[1].split(':'); const cols=[a[0],b[0]]; cols.forEach((cc,i)=>{ const cell=ws.getCell(cc+'7'); cell.border={top:{style:'medium',color:{argb:k[5]}},bottom:{style:'medium',color:{argb:k[5]}},left:i==0?{style:'medium',color:{argb:k[5]}}:undefined,right:i==1?{style:'medium',color:{argb:k[5]}}:undefined}; }); });
  ws.getRow(6).height=18; ws.getRow(7).height=34;
  // grid header
  const H={font:{name:'Arial',size:10,bold:true,color:{argb:WHITE}},fill:fill(NAVY),alignment:{horizontal:'center',vertical:'middle'},border:box('thin','FF1F3864')};
  set('B10','Source table  \\  Account',H); ws.getRow(10).height=22;
  for(const c of 'CDEF') set(c+'10',t(c+'10','@a.value@7',null),H);
  set('G10','TOTAL',Object.assign({},H,{fill:fill(ORG)}));
  const N={font:{name:'Arial',size:8,italic:true,color:{argb:'FF404040'}},fill:fill(LB),alignment:{horizontal:'center',vertical:'middle',wrapText:true},border:box('thin','FFBFBFBF')}; ws.getRow(11).height=26;
  set('B11','Account name',N); for(const c of 'CDEF') set(c+'11',t(c+'11','@a.name@8',null),N); set('G11',null,N);
  for(let r=12;r<=14;r++){ const z=(r%2==0)?ZEB:WHITE; set('B'+r,t('B'+r,r==12?'@DISTINCT CAST(a.ad_table_id AS VARCHAR)@9':null,null),{font:{name:'Arial',size:10,bold:true,color:{argb:NAVY}},fill:fill(LB),alignment:{horizontal:'center'},border:box('thin','FFBFBFBF')});
    for(const c of 'CDEF') set(c+r,t(c+r,(r==12&&c=='C')?'@sum(a.amtacctdr-a.amtacctcr)@12':null,null),{font:{name:'Arial',size:10},fill:fill(z),numFmt:NUM,alignment:{horizontal:'right'},border:box('thin','FFBFBFBF')});
    set('G'+r,{formula:`SUM(C${r}:F${r})`,result:0},{font:{name:'Arial',size:10,bold:true},fill:fill(GOLD),numFmt:NUM,alignment:{horizontal:'right'},border:box('thin','FFBFBFBF')}); }
  ws.getRow(15).height=22; set('B15','TOTAL',{font:{name:'Arial',size:10,bold:true,color:{argb:WHITE}},fill:fill(NAVY),alignment:{horizontal:'center',vertical:'middle'},border:box('thin','FF1F3864')});
  for(const c of 'CDEFG') set(c+'15',{formula:`SUM(${c}12:${c}14)`,result:0},{font:{name:'Arial',size:10,bold:true},fill:fill(GOLD),numFmt:NUM,alignment:{horizontal:'right'},border:{top:{style:'medium',color:{argb:NAVY}},bottom:{style:'double',color:{argb:NAVY}},left:thin(),right:thin()}});
  ws.mergeCells('B17:G17'); set('B17','Every figure above is a live query result; the layout, colours and totals are the accountant’s own Excel.',{font:{name:'Arial',size:8,italic:true,color:{argb:'FF7F7F7F'}},alignment:{horizontal:'center'}});
  ws.getRow(19).height=16; ws.getRow(20).height=40; [['B','Prepared by'],['D','Reviewed by'],['F','Approved by']].forEach(([c,l])=>{ const c2=String.fromCharCode(c.charCodeAt(0)+1); ws.mergeCells(`${c}19:${c2}19`); ws.mergeCells(`${c}20:${c2}20`);
    set(c+'19',l,{font:{name:'Arial',size:9,bold:true,color:{argb:NAVY}},fill:fill(LB),alignment:{horizontal:'center'}});
    [c,c2].forEach((x,i)=>{ ws.getCell(x+'20').border={bottom:{style:'thin',color:{argb:NAVY}},left:i==0?{style:'thin',color:{argb:NAVY}}:undefined,right:i==1?{style:'thin',color:{argb:NAVY}}:undefined}; ws.getCell(x+'19').border={top:{style:'thin',color:{argb:NAVY}},left:i==0?{style:'thin',color:{argb:NAVY}}:undefined,right:i==1?{style:'thin',color:{argb:NAVY}}:undefined}; }); });
}
wb.views=[{activeTab:4}];
const inp=wb.addWorksheet('Input'), pr=wb.addWorksheet('Process'), ref=wb.addWorksheet('Reference'), out=wb.addWorksheet('Output'), bak=wb.addWorksheet('BACKUP');
layout(inp,true); layout(out,false); layout(bak,false); ref.getCell('A1').value='ref';
const W="a.postingtype='A' AND a.datetrx BETWEEN #1 AND #2 AND el.value IN "+ACC, J='INNER JOIN c_elementvalue el ON el.c_elementvalue_id=a.account_id', G='GROUP BY el.value, a.ad_table_id ORDER BY el.value, a.ad_table_id';
const FILT="a.postingtype='A' AND a.datetrx BETWEEN #1 AND #2 AND a.account_id IN (SELECT c_elementvalue_id FROM c_elementvalue WHERE value IN "+ACC+")";
// [select, table/join, where, direction]  — Process row number = index+2 (the @…@N tag in Input)
const P=[ ['a.name','ad_client a','','S'],                                                                                       //2  organisation band
 ["CONCAT(to_char(DATE #1, 'DD/MM/YYYY'),' - ',to_char(DATE #2, 'DD/MM/YYYY'))",'','','S'],                                       //3  period
 ['count(*)','fact_acct a',FILT,'S'], ['sum(a.amtacctdr)','','','S'], ['sum(a.amtacctcr)','','','S'],                              //4-6 KPI boxes
 ['a.value','c_elementvalue a',"a.value IN "+ACC+" ORDER BY a.value",'>'], ['a.name','','','>'],                                  //7-8 account header + names
 ['DISTINCT CAST(a.ad_table_id AS VARCHAR)','fact_acct a',FILT+' ORDER BY 1','V'],                                                //9  y axis
 ['el.value as acctno','fact_acct a',W,'V'], ['CAST(a.ad_table_id AS VARCHAR) as tbl',J,G,'V'],                                   //10-11 keys
 ['sum(a.amtacctdr-a.amtacctcr)','','','C10+B12'] ];                                                                              //12 measure -> grid
['ANNOTATION','ROW','SELECT','TABLE','JOIN','WHERE','ADDRESS','Direction','VALUES'].forEach((h,i)=>pr.getCell(1,i+1).value=h);
P.forEach((p,i)=>{ const r=i+2; pr.getCell(r,1).value={formula:`CONCATENATE("@",C${r},"@",B${r})`,result:`@${p[0]}@${r}`}; pr.getCell(r,2).value={formula:'ROW()',result:r}; pr.getCell(r,3).value=p[0]; if(p[1]) pr.getCell(r,4).value=p[1]; if(p[2]) pr.getCell(r,6).value=p[2]; pr.getCell(r,8).value=p[3]; });
pr.getCell(P.length+2,2).value={formula:'ROW()',result:P.length+2}; pr.getCell(P.length+2,9).value='END';
wb.xlsx.writeFile(process.argv[2]).then(()=>console.log('§SHOWCASE written',process.argv[2]));
