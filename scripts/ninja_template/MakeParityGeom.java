// legacy/parity_geom.xls — GEOMETRY CALIBRATION fixture for the PDF renderer: varied column widths / row heights / fills / borders / alignment / wrap / merge / hidden column.
// One tiny statement paints a single value so the plugin runs end to end; everything else is layout. Real GardenWorld value only.
import java.io.*; import org.apache.poi.hssf.usermodel.*; import org.apache.poi.ss.usermodel.*; import org.apache.poi.ss.util.CellRangeAddress;
public class MakeParityGeom {
 static void s(Sheet sh,int r,int c,String v){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); row.createCell(c).setCellValue(v);} 
 static void st(Sheet sh,int r,int c,CellStyle q){ Row row=sh.getRow(r)==null?sh.createRow(r):sh.getRow(r); Cell cell=row.getCell(c)==null?row.createCell(c):row.getCell(c); cell.setCellStyle(q); }
 static void layout(Workbook w, Sheet o){
  Font b=w.createFont(); b.setBold(true); b.setFontName("Arial"); b.setFontHeightInPoints((short)12); Font n=w.createFont(); n.setFontName("Arial"); n.setFontHeightInPoints((short)9);
  CellStyle thin=w.createCellStyle(); thin.setFont(n); thin.setBorderTop(BorderStyle.THIN); thin.setBorderBottom(BorderStyle.THIN); thin.setBorderLeft(BorderStyle.THIN); thin.setBorderRight(BorderStyle.THIN);
  CellStyle fill=w.createCellStyle(); fill.setFont(b); fill.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex()); fill.setFillPattern(FillPatternType.SOLID_FOREGROUND); fill.setAlignment(HorizontalAlignment.CENTER); fill.setVerticalAlignment(VerticalAlignment.CENTER);
  CellStyle right=w.createCellStyle(); right.setFont(n); right.setAlignment(HorizontalAlignment.RIGHT); right.setBorderBottom(BorderStyle.MEDIUM);
  CellStyle wrap=w.createCellStyle(); wrap.setFont(n); wrap.setWrapText(true); wrap.setVerticalAlignment(VerticalAlignment.TOP); wrap.setBorderLeft(BorderStyle.DOUBLE);
  CellStyle num=w.createCellStyle(); num.setFont(n); num.setDataFormat(w.createDataFormat().getFormat("#,##0.00")); num.setAlignment(HorizontalAlignment.RIGHT);
  int[] wc={4,9,12,20,30,40,12}; for(int c=0;c<wc.length;c++) o.setColumnWidth(c,wc[c]*256); o.setColumnHidden(6,true);
  float[] hr={10f,12.75f,20f,30f,45f,12.75f}; for(int r=0;r<hr.length;r++){ Row row=o.createRow(r); row.setHeightInPoints(hr[r]); }
  s(o,0,0,"A"); s(o,0,1,"BBBB"); s(o,0,2,"CCCCCCCC"); s(o,0,3,"DDDDDDDDDDDD"); s(o,0,4,"EEEEEEEEEEEEEEEEEEEE"); s(o,0,5,"F");
  for(int c=0;c<6;c++){ s(o,1,c,"r2c"+(c+1)); st(o,1,c,thin); }
  s(o,2,0,"mid"); st(o,2,0,fill); st(o,2,1,fill); st(o,2,2,fill); o.addMergedRegion(new CellRangeAddress(2,2,0,2));
  s(o,3,3,"right-aligned"); st(o,3,3,right); Row r3=o.getRow(3); r3.createCell(4).setCellValue(12345.678); st(o,3,4,num);
  s(o,4,4,"this is a long wrapped text that should flow over several lines"); st(o,4,4,wrap);
  s(o,5,0,"\u0eaa\u0eb0\u0e9a\u0eb2\u0e8d\u0e94\u0eb5 Lao"); s(o,5,5,"hid"); s(o,5,6,"HIDDEN-COL"); }
 public static void main(String[] a) throws Exception { HSSFWorkbook w=new HSSFWorkbook();
  Sheet in=w.createSheet("Input"), pr=w.createSheet("Process"), ref=w.createSheet("Reference"), out=w.createSheet("Output"), bak=w.createSheet("BACKUP");
  s(in,0,0,"Input"); s(in,5,0,"@a.value@2"); String[] H={"ANNOTATION","ROW","SELECT","TABLE","JOIN","WHERE","ADDRESS","Direction","VALUES"}; for(int c=0;c<H.length;c++) s(pr,0,c,H[c]);
  Row R=pr.createRow(1); R.createCell(0).setCellFormula("CONCATENATE(\"@\",C2,\"@\",B2)"); R.createCell(1).setCellFormula("ROW()"); s(pr,1,2,"a.value"); s(pr,1,3,"c_elementvalue a"); s(pr,1,5,"a.value = '41000'"); s(pr,1,7,"S");
  Row E=pr.createRow(2); E.createCell(1).setCellFormula("ROW()"); s(pr,2,8,"END"); s(ref,0,0,"ref"); layout(w,out); layout(w,bak);
  HSSFFormulaEvaluator.evaluateAllFormulaCells(w);
  try(FileOutputStream o=new FileOutputStream(a[0])){ w.write(o);} System.out.println("§FIXTURE_GEOM written "+a[0]); }}
