// legacy/parity_tb.xls — PUBLIC DEMO TEMPLATE + TEST FIXTURE: Thai trial balance (opening / movement / closing) over REAL GardenWorld postings.
// Spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §TB-DEMO. Challenge it solves: opening balance (everything before #1), debit/credit movement (#1..#2), closing balance per account,
// one row per account that has postings (list grows), totals + a proof line (debits = credits). Labels: Thai. No customer data, no invented values.
import java.io.*; import org.apache.poi.hssf.usermodel.*; import org.apache.poi.ss.usermodel.*;
public class MakeParityTB {
 static String[][] P={
  {"CONCAT(to_char(DATE #1, 'DD/MM/YYYY'),' - ',to_char(DATE #2, 'DD/MM/YYYY'))","ad_org a","","a.ad_org_id=11","S"},
  {"el.value","fact_acct a","","a.postingtype='A' AND a.dateacct <= #2 GROUP BY el.value, el.name ORDER BY el.value","V"},
  {"el.name","INNER JOIN c_elementvalue el ON el.c_elementvalue_id=a.account_id","","","V"},
  {"SUM(CASE WHEN a.dateacct < #1 THEN a.amtacctdr-a.amtacctcr ELSE 0 END)","","","","V"},
  {"SUM(CASE WHEN a.dateacct >= #1 THEN a.amtacctdr ELSE 0 END)","","","","V"},
  {"SUM(CASE WHEN a.dateacct >= #1 THEN a.amtacctcr ELSE 0 END)","","","","V"} };
 static void s(Sheet sh,int r,int c,String v){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); row.createCell(c).setCellValue(v);}
 static void f(Sheet sh,int r,int c,String fm){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); row.createCell(c).setCellFormula(fm);}
 static CellStyle[] ST; static void mk(Workbook w){ Font b=w.createFont(); b.setBold(true); b.setFontName("Arial"); b.setFontHeightInPoints((short)10); Font n=w.createFont(); n.setFontName("Arial"); n.setFontHeightInPoints((short)9);
  Font t=w.createFont(); t.setBold(true); t.setFontName("Arial"); t.setFontHeightInPoints((short)14);
  CellStyle h=w.createCellStyle(); h.setFont(b); h.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex()); h.setFillPattern(FillPatternType.SOLID_FOREGROUND); h.setBorderBottom(BorderStyle.MEDIUM); h.setAlignment(HorizontalAlignment.CENTER);
  CellStyle l=w.createCellStyle(); l.setFont(n); l.setBorderTop(BorderStyle.THIN); l.setBorderBottom(BorderStyle.THIN); l.setBorderLeft(BorderStyle.THIN); l.setBorderRight(BorderStyle.THIN);
  CellStyle m=w.createCellStyle(); m.cloneStyleFrom(l); m.setDataFormat(w.createDataFormat().getFormat("#,##0.00;(#,##0.00);-"));
  CellStyle tot=w.createCellStyle(); tot.setFont(b); tot.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex()); tot.setFillPattern(FillPatternType.SOLID_FOREGROUND); tot.setBorderTop(BorderStyle.DOUBLE); tot.setDataFormat(w.createDataFormat().getFormat("#,##0.00;(#,##0.00);-"));
  CellStyle ti=w.createCellStyle(); ti.setFont(t);
  ST=new CellStyle[]{h,l,m,tot,ti}; }
 static void sty(Sheet sh,int r,int c,int k){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); Cell cell=row.getCell(c)==null?row.createCell(c):row.getCell(c); cell.setCellStyle(ST[k]); }
 static void layout(Sheet o){ int[] W={12,40,16,16,16,16}; for(int c=0;c<6;c++) o.setColumnWidth(c,W[c]*256);
  s(o,0,0,"งบทดลอง (Trial Balance)"); sty(o,0,0,4);
  s(o,2,0,"ช่วงวันที่ : ");
  String[] H={"รหัสบัญชี","ชื่อบัญชี","ยอดยกมา","เดบิต","เครดิต","ยอดคงเหลือ"}; for(int c=0;c<6;c++){ s(o,4,c,H[c]); sty(o,4,c,0);} 
  // list start row (idx 5): token cells A..E + closing formula F. Row under it (idx 6) = totals: a formula in each token column marks where the list stops and is pushed down.
  sty(o,5,0,1); sty(o,5,1,1); for(int c=2;c<=4;c++) sty(o,5,c,2); f(o,5,5,"C6+D6-E6"); sty(o,5,5,2);
  for(int c=0;c<6;c++){ f(o,6,c,"CONCATENATE(\"\")"); }   // spacer row: a formula under each token column marks the list end; the list grows into it
  f(o,7,0,"CONCATENATE(\"รวม\")"); f(o,7,1,"CONCATENATE(\"\")"); f(o,7,2,"SUM(C6:C7)"); f(o,7,3,"SUM(D6:D7)"); f(o,7,4,"SUM(E6:E7)"); f(o,7,5,"SUM(F6:F7)"); for(int c=0;c<6;c++) sty(o,7,c,3);
  s(o,9,1,"ผลต่างเดบิต - เครดิต (ต้องเป็น 0)"); f(o,9,3,"D8-E8"); sty(o,9,3,2); }
 public static void main(String[] a) throws Exception { HSSFWorkbook w=new HSSFWorkbook();
  Sheet in=w.createSheet("Input"), pr=w.createSheet("Process"), ref=w.createSheet("Reference"), out=w.createSheet("Output"), bak=w.createSheet("BACKUP");
  s(in,0,0,"Input"); s(in,2,1,"@CONCAT(to_char(DATE #1, 'DD/MM/YYYY'),' - ',to_char(DATE #2, 'DD/MM/YYYY'))@2"); s(in,5,0,"@el.value@3"); s(in,5,1,"@el.name@4"); s(in,5,2,"@SUM(CASE WHEN a.dateacct < #1 THEN a.amtacctdr-a.amtacctcr ELSE 0 END)@5"); s(in,5,3,"@SUM(CASE WHEN a.dateacct >= #1 THEN a.amtacctdr ELSE 0 END)@6"); s(in,5,4,"@SUM(CASE WHEN a.dateacct >= #1 THEN a.amtacctcr ELSE 0 END)@7");
  String[] H={"ANNOTATION","ROW","SELECT","TABLE","JOIN","WHERE","ADDRESS","Direction","VALUES"}; for(int c=0;c<H.length;c++) s(pr,0,c,H[c]);
  for(int i=0;i<P.length;i++){ int r=i+1,row=r+1; Row R=pr.createRow(r);
   R.createCell(0).setCellFormula("CONCATENATE(\"@\",C"+row+",\"@\",B"+row+")"); R.createCell(1).setCellFormula("ROW()");
   s(pr,r,2,P[i][0]); if(!P[i][1].isEmpty()) s(pr,r,3,P[i][1]); if(!P[i][2].isEmpty()) s(pr,r,4,P[i][2]); if(!P[i][3].isEmpty()) s(pr,r,5,P[i][3]); s(pr,r,7,P[i][4]); }
  int e=P.length+1; Row E=pr.createRow(e); E.createCell(1).setCellFormula("ROW()"); s(pr,e,8,"END");
  s(ref,0,0,"ref"); mk(w); layout(out); layout(bak);
  HSSFFormulaEvaluator.evaluateAllFormulaCells(w);
  try(FileOutputStream o=new FileOutputStream(a[0])){ w.write(o);} System.out.println("§FIXTURE_TB written "+a[0]+" processRows="+P.length); }}
