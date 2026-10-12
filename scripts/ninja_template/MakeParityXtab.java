// legacy/parity_xtab.xls — TEST FIXTURE: Laos v2 layout, cross-tab `X+` block shaped like MOES_cashflow rows 51-58 (axis row C3, label row, join row, amount row "C3+"). Real GardenWorld rows only.
import java.io.*; import org.apache.poi.hssf.usermodel.*; import org.apache.poi.ss.usermodel.*;
public class MakeParityXtab {
 static String[][] P={
  {"a.value","c_elementvalue a","","a.value IN ('12110','14120','41000','51100') ORDER BY a.value",">"},
  {"el.value as acctno","fact_acct a","","a.postingtype='A' AND a.datetrx BETWEEN #1 AND #2 AND el.value IN ('12110','14120','41000','51100')","V"},
  {"sum(a.amtacctdr-a.amtacctcr) as amt","INNER JOIN c_elementvalue el ON el.c_elementvalue_id=a.account_id","","GROUP BY el.value ORDER BY el.value","C3+"} };
 static void s(Sheet sh,int r,int c,String v){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); row.createCell(c).setCellValue(v);} 
 static void layout(Sheet o){ s(o,0,0,"XTAB FIXTURE"); s(o,2,0,"Account"); s(o,4,0,"Amount"); s(o,5,0,"Check"); }
 public static void main(String[] a) throws Exception { HSSFWorkbook w=new HSSFWorkbook();
  Sheet in=w.createSheet("Input"), pr=w.createSheet("Process"), ref=w.createSheet("Reference"), out=w.createSheet("Output"), bak=w.createSheet("BACKUP");
  s(in,0,0,"Input"); s(in,2,2,"@a.value@2"); s(in,4,2,"@sum(a.amtacctdr-a.amtacctcr) as amt@4");
  String[] H={"ANNOTATION","ROW","SELECT","TABLE","JOIN","WHERE","ADDRESS","Direction","VALUES"}; for(int c=0;c<H.length;c++) s(pr,0,c,H[c]);
  for(int i=0;i<P.length;i++){ int r=i+1,row=r+1; Row R=pr.createRow(r); R.createCell(0).setCellFormula("CONCATENATE(\"@\",C"+row+",\"@\",B"+row+")"); R.createCell(1).setCellFormula("ROW()");
   if(!P[i][0].isEmpty()) s(pr,r,2,P[i][0]); if(!P[i][1].isEmpty()) s(pr,r,3,P[i][1]); if(!P[i][3].isEmpty()) s(pr,r,5,P[i][3]); s(pr,r,7,P[i][4]); }
  int e=P.length+1; Row E=pr.createRow(e); E.createCell(1).setCellFormula("ROW()"); s(pr,e,8,"END"); s(ref,0,0,"ref"); layout(out); layout(bak);
  HSSFFormulaEvaluator.evaluateAllFormulaCells(w);
  try(FileOutputStream o=new FileOutputStream(a[0])){ w.write(o);} System.out.println("§FIXTURE_XTAB written "+a[0]); }}
