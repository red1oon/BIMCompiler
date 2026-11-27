import java.io.*; import java.util.*; import org.apache.poi.ss.usermodel.*;
public class W31_Where { public static void main(String[] a) throws Exception { Workbook w=WorkbookFactory.create(new FileInputStream(a[0])); Sheet s=w.getSheet("Output"); List<String> fill=new ArrayList<>(), bord=new ArrayList<>();
 for(Row r:s) for(Cell c:r){ CellStyle st=c.getCellStyle(); if(st.getFillPattern()!=FillPatternType.NO_FILL) fill.add(c.getAddress().formatAsString()); else if(st.getBorderTop()==BorderStyle.THIN) bord.add(c.getAddress().formatAsString()); }
 System.out.println("§WHERE fill("+fill.size()+")="+fill.subList(0,Math.min(fill.size(),14))+" thinBordered("+bord.size()+") first="+bord.subList(0,Math.min(bord.size(),6))+" last="+bord.subList(Math.max(0,bord.size()-6),bord.size())); }}
