import java.io.*; import java.util.*; import org.apache.poi.hssf.usermodel.*; import org.apache.poi.ss.usermodel.*;
public class W26_Features { public static void main(String[] a) throws Exception { try(HSSFWorkbook w=new HSSFWorkbook(new FileInputStream(a[0]))){
 for(String sn:new String[]{"Output","BACKUP"}){ HSSFSheet s=w.getSheet(sn); int hid=0,custW=0,custH=0,cf=0; Set<String> fonts=new TreeSet<>(); int maxc=0;
  for(Row r:s){ if(r.getHeight()!=s.getDefaultRowHeight()) custH++; for(Cell c:r){ maxc=Math.max(maxc,c.getColumnIndex()); HSSFFont f=((HSSFCell)c).getCellStyle().getFont(w); fonts.add(f.getFontName()+"/"+f.getFontHeightInPoints()+(f.getBold()?"b":"")); } }
  for(int c=0;c<=maxc;c++){ if(s.isColumnHidden(c)) hid++; if(s.getColumnWidth(c)!=s.getDefaultColumnWidth()*256) custW++; }
  cf=s.getSheetConditionalFormatting().getNumConditionalFormattings(); HSSFPrintSetup ps=s.getPrintSetup(); org.apache.poi.ss.util.PaneInformation pi=s.getPaneInformation();
  List<? extends HSSFShape> sh=s.getDrawingPatriarch()==null?new ArrayList<>():s.getDrawingPatriarch().getChildren();
  System.out.println("§FEATURES "+new File(a[0]).getName()+" "+sn+" merged="+s.getNumMergedRegions()+" hiddenCols="+hid+" customColWidths="+custW+" customRowHeights="+custH+" condFormats="+cf+" shapes/pictures="+sh.size()+" freeze="+(pi!=null)+" landscape="+ps.getLandscape()+" paper="+ps.getPaperSize()+" fitW/H="+ps.getFitWidth()+"/"+ps.getFitHeight()+" fitToPage="+s.getFitToPage()+" gridlines="+s.isDisplayGridlines()+" printArea="+(w.getPrintArea(w.getSheetIndex(s))!=null)+" fonts="+fonts); } }}}
