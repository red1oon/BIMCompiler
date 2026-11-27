// legacy/parity_reg.xls — PUBLIC DEMO TEMPLATE + TEST FIXTURE: Thai SALES REGISTER (one row per completed sales invoice, total + document count) over REAL GardenWorld invoices.
// Spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §UC-SET. Challenge it solves: a register that GROWS as documents are entered - the list is pushed down row by row, formulas below follow.
import java.io.*; import org.apache.poi.hssf.usermodel.*; import org.apache.poi.ss.usermodel.*;
public class MakeParityReg {
 static String[][] P={
  {"a.name","ad_client a","","","S"},
  {"CONCAT(to_char(DATE #1, 'DD/MM/YYYY'),' - ',to_char(DATE #2, 'DD/MM/YYYY'))","ad_org a","","","S"},
  {"a.documentno","c_invoice a","","a.issotrx='Y' AND a.docstatus='CO' AND SUBSTR(a.dateinvoiced,1,10) >= SUBSTR(#1,1,10) AND SUBSTR(a.dateinvoiced,1,10) <= SUBSTR(#2,1,10) ORDER BY a.dateinvoiced, a.documentno","V"},
  {"SUBSTR(a.dateinvoiced,1,10)","","","","V"},
  {"bp.name","INNER JOIN c_bpartner bp ON bp.c_bpartner_id=a.c_bpartner_id","","","V"},
  {"a.grandtotal","","","","V"} };
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
 static void layout(Sheet o){ int[] W={16,14,36,18}; for(int c=0;c<4;c++) o.setColumnWidth(c,W[c]*256);
  s(o,0,0,"ทะเบียนการขาย (Sales Register)"); sty(o,0,0,4); s(o,1,0,"บริษัท : "); s(o,2,0,"ช่วงวันที่ : ");
  String[] H={"เลขที่เอกสาร","วันที่","ลูกค้า","ยอดรวม"}; for(int c=0;c<4;c++){ s(o,4,c,H[c]); sty(o,4,c,0);}
  sty(o,5,0,1); sty(o,5,1,1); sty(o,5,2,1); sty(o,5,3,2);
  for(int c=0;c<4;c++){ f(o,6,c,"CONCATENATE(\"\")"); }      // spacer row: a formula under each token column marks the list end; the list grows into it
  f(o,7,0,"CONCATENATE(\"รวม\")"); f(o,7,1,"CONCATENATE(\"\")"); f(o,7,2,"CONCATENATE(\"\")"); f(o,7,3,"SUM(D6:D7)"); for(int c=0;c<4;c++) sty(o,7,c,3);
  s(o,9,2,"จำนวนเอกสาร (ใบ)"); f(o,9,3,"COUNT(D6:D7)"); sty(o,9,3,1); }
 public static void main(String[] a) throws Exception { HSSFWorkbook w=new HSSFWorkbook();
  Sheet in=w.createSheet("Input"), pr=w.createSheet("Process"), ref=w.createSheet("Reference"), out=w.createSheet("Output"), bak=w.createSheet("BACKUP");
  s(in,0,0,"Input"); s(in,1,1,"@a.name@2"); s(in,2,1,"@CONCAT(to_char(DATE #1, 'DD/MM/YYYY'),' - ',to_char(DATE #2, 'DD/MM/YYYY'))@3"); s(in,5,0,"@a.documentno@4"); s(in,5,1,"@SUBSTR(a.dateinvoiced,1,10)@5"); s(in,5,2,"@bp.name@6"); s(in,5,3,"@a.grandtotal@7");
  String[] H={"ANNOTATION","ROW","SELECT","TABLE","JOIN","WHERE","ADDRESS","Direction","VALUES"}; for(int c=0;c<H.length;c++) s(pr,0,c,H[c]);
  for(int i=0;i<P.length;i++){ int r=i+1,row=r+1; Row R=pr.createRow(r);
   R.createCell(0).setCellFormula("CONCATENATE(\"@\",C"+row+",\"@\",B"+row+")"); R.createCell(1).setCellFormula("ROW()");
   s(pr,r,2,P[i][0]); if(!P[i][1].isEmpty()) s(pr,r,3,P[i][1]); if(!P[i][2].isEmpty()) s(pr,r,4,P[i][2]); if(!P[i][3].isEmpty()) s(pr,r,5,P[i][3]); s(pr,r,7,P[i][4]); }
  int e=P.length+1; Row E=pr.createRow(e); E.createCell(1).setCellFormula("ROW()"); s(pr,e,8,"END");
  s(ref,0,0,"ref"); mk(w); layout(out); layout(bak);
  HSSFFormulaEvaluator.evaluateAllFormulaCells(w);
  try(FileOutputStream o=new FileOutputStream(a[0])){ w.write(o);} System.out.println("§FIXTURE_REG written "+a[0]+" processRows="+P.length); }}
