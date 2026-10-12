// Generates legacy/parity_v2.xls (POI, so FORMULAS are real) — TEST FIXTURE in the Laos v2 Process layout (A annotation, B ROW, C SELECT, D TABLE, E JOIN, F WHERE, G ADDRESS, H Direction, I+ VALUES).
// Queries are plain SELECTs over REAL GardenWorld rows; nothing invented. Forces: V list + row insert (formula below start), > + column insert (formula right of start), S, bind #1/#2.
import java.io.*; import org.apache.poi.hssf.usermodel.*; import org.apache.poi.ss.usermodel.*;
public class MakeParityV2 {
 static String[][] P={ {"a.value","c_elementvalue a","","a.accounttype='E' AND a.isactive='Y' ORDER BY a.value","V"}, {"a.name","","","","V"}, {"a.c_elementvalue_id","","","","&gt;"},
  {"SUM(a.amtacctdr-a.amtacctcr)","fact_acct a","","a.datetrx BETWEEN #1 AND #2","S"}, {"a.name","c_bpartner a","","a.iscustomer='Y' AND a.isactive='Y' ORDER BY a.name","V"} };
 static void s(Sheet sh,int r,int c,String v){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); row.createCell(c).setCellValue(v);} 
 static void f(Sheet sh,int r,int c,String fm){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); row.createCell(c).setCellFormula(fm);} 
 static void layout(Sheet o){ s(o,0,0,"PARITY FIXTURE v2"); s(o,2,0,"Acct"); s(o,2,1,"Name"); s(o,2,2,"Total");
  f(o,4,0,"ROW()"); s(o,4,1,"Expense accounts"); f(o,4,2,"COUNTA(A4:A4)");
  f(o,2,4,"D3*2"); f(o,2,5,"E3+1");
  s(o,7,0,"Net movement"); f(o,7,2,"B9*1");
  s(o,9,0,"Customers"); f(o,9,4,"ROW()*1"); f(o,10,3,"COUNTA(D10:D10)"); }
 public static void main(String[] a) throws Exception { HSSFWorkbook w=new HSSFWorkbook();
  Sheet in=w.createSheet("Input"), pr=w.createSheet("Process"), ref=w.createSheet("Reference"), out=w.createSheet("Output"), bak=w.createSheet("BACKUP");
  s(in,0,0,"Input"); s(in,3,0,"@a.value@2"); s(in,3,1,"@a.name@3"); s(in,2,3,"@a.c_elementvalue_id@4"); s(in,8,1,"@SUM(a.amtacctdr-a.amtacctcr)@5"); s(in,9,3,"@a.name@6");
  String[] H={"ANNOTATION","ROW","SELECT","TABLE","JOIN","WHERE","ADDRESS","Direction","VALUES"}; for(int c=0;c<H.length;c++) s(pr,0,c,H[c]);
  for(int i=0;i<P.length;i++){ int r=i+1, row=r+1; Row R=pr.createRow(r);
   Cell an=R.createCell(0); an.setCellFormula("CONCATENATE(\"@\",C"+row+",\"@\",B"+row+")"); Cell rw=R.createCell(1); rw.setCellFormula("ROW()");
   s(pr,r,2,P[i][0]); if(!P[i][1].isEmpty()) s(pr,r,3,P[i][1]); if(!P[i][2].isEmpty()) s(pr,r,4,P[i][2]); if(!P[i][3].isEmpty()) s(pr,r,5,P[i][3]); s(pr,r,7,P[i][4].replace("&gt;",">")); }
  int e=P.length+1; Row E=pr.createRow(e); E.createCell(1).setCellFormula("ROW()"); s(pr,e,8,"END");
  s(ref,0,0,"ref"); layout(out); layout(bak);
  HSSFFormulaEvaluator.evaluateAllFormulaCells(w);   // fills cached results (annotation text) like Excel does on save
  try(FileOutputStream o=new FileOutputStream(a[0])){ w.write(o);} System.out.println("§FIXTURE_V2 written "+a[0]+" processRows="+P.length); }}
