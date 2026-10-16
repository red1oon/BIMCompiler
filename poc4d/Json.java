// Json.java — minimal JSON reader for the POC. Mechanical, no dependencies, no invention.
// Exists so the model reads viewer/rates/4D_template.json and sequence_rules.json AS SHIPPED,
// instead of the POC re-typing their contents and drifting from them.
import java.util.*;

public final class Json {
  private final String s; private int i;
  private Json(String s) { this.s = s; }
  public static Object parse(String text) { Json p = new Json(text); p.ws(); return p.value(); }

  private void ws() { while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++; }
  private Object value() {
    char c = s.charAt(i);
    switch (c) {
      case '{': return obj();
      case '[': return arr();
      case '"': return str();
      case 't': i += 4; return Boolean.TRUE;
      case 'f': i += 5; return Boolean.FALSE;
      case 'n': i += 4; return null;
      default:  return num();
    }
  }
  private Map<String,Object> obj() {
    Map<String,Object> m = new LinkedHashMap<>(); i++; ws();
    if (s.charAt(i) == '}') { i++; return m; }
    while (true) {
      ws(); String k = str(); ws(); i++;              // ':'
      ws(); m.put(k, value()); ws();
      if (s.charAt(i) == ',') { i++; continue; }
      i++; return m;                                   // '}'
    }
  }
  private List<Object> arr() {
    List<Object> a = new ArrayList<>(); i++; ws();
    if (s.charAt(i) == ']') { i++; return a; }
    while (true) {
      ws(); a.add(value()); ws();
      if (s.charAt(i) == ',') { i++; continue; }
      i++; return a;                                   // ']'
    }
  }
  private String str() {
    StringBuilder b = new StringBuilder(); i++;         // opening quote
    while (s.charAt(i) != '"') {
      char c = s.charAt(i++);
      if (c != '\\') { b.append(c); continue; }
      char e = s.charAt(i++);
      switch (e) {
        case 'n': b.append('\n'); break;  case 't': b.append('\t'); break;
        case 'r': b.append('\r'); break;  case 'b': b.append('\b'); break;
        case 'f': b.append('\f'); break;
        case 'u': b.append((char) Integer.parseInt(s.substring(i, i + 4), 16)); i += 4; break;
        default:  b.append(e);
      }
    }
    i++; return b.toString();
  }
  private Double num() {
    int st = i;
    while (i < s.length() && "+-.eE0123456789".indexOf(s.charAt(i)) >= 0) i++;
    return Double.valueOf(s.substring(st, i));
  }

  // typed accessors — fail loudly rather than silently defaulting
  @SuppressWarnings("unchecked")
  public static Map<String,Object> o(Object v) { return (Map<String,Object>) v; }
  @SuppressWarnings("unchecked")
  public static List<Object> a(Object v) { return (List<Object>) v; }
  public static String st(Object v) { return (String) v; }
  public static double d(Object v) { return ((Double) v).doubleValue(); }
  public static String esc(String v) {
    return v == null ? "" : v.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
