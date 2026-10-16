// Poc4D.java — the 4D schedule as a COMPOSITE. Reference implementation for the JS port.
//   Run:  java -cp . Poc4D.java            (hell fixture)
//         java -cp . Poc4D.java coherent   (coherent fixture — must be 0/0)
//
// ⚠ DO NOT REMOVE — SCOPE. Proves STRUCTURE, ORDER, CAPACITY and DURATION. Reads the SHIPPED
// viewer/rates/4D_template.json and viewer/rates/sequence_rules.json — nothing about the programme
// or the classification is re-typed here. Read the §POC_ log after every run.
//
// THE MODEL — one type, two rules.
//   Node { children[], work }
//   STRUCTURE  an element attaches at the deepest node that fully contains it
//   TIME       siblings run in order; a parent spans its children
// Composite's non-uniform depth absorbs the unlevelled and the level-spanning: neither is a special
// case, and no call site tests for a missing level (Null Object by structure). A Leaf is a node
// with NO INTERNAL ORDER — the recursion's termination rule, so no invented "assembly" taxonomy.
// Geometry decides WHERE TO SPLIT a cell into ordered layers (a deterministic partition); it never
// elects which of N candidates supports a given element. That election is what four rounds of
// patching failed to fix in the JS (4D_BAR_MODEL.md §14-§18).
//
// PRODUCT = THE TREE. The JSON below is its serialisation. tasks/task_elements/kernel_ops/Gantt/5D
// are PROJECTIONS produced by one visitor each, write-only, never authoritative — the only shape in
// which "two representations disagree" (the rescale, deriveZones' envelope, the two clocks) is
// unexpressible. NOTE there are NO EDGES in the output: sibling order IS the order, so
// task_sequences is derived, and the template's own "100% restatement, 0% logic" tautology cannot
// recur.
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Poc4D {

  // ── the one type ───────────────────────────────────────────────────────────────────────────
  static abstract class Node {
    final String id, kind;
    Node(String id, String kind) { this.id = id; this.kind = kind; }
    abstract double layout(double t0);
    abstract double start(); abstract double finish();
    List<Node> children() { return List.of(); }
  }

  static final class Leaf extends Node {
    final Elem e; double s, f;
    Leaf(Elem e) { super(e.guid, "element"); this.e = e; }
    double layout(double t0) { s = t0; f = t0 + e.workDays; return f; }
    double start() { return s; } double finish() { return f; }
  }

  /** Siblings run IN ORDER; the parent spans them. `lanes` = crews working concurrently. */
  static final class Group extends Node {
    final List<Node> kids = new ArrayList<>();
    final int lanes;
    Group(String id, String kind) { this(id, kind, 1); }
    Group(String id, String kind, int lanes) { super(id, kind); this.lanes = Math.max(1, lanes); }
    List<Node> children() { return kids; }
    Group add(Node n) { kids.add(n); return this; }
    double layout(double t0) {
      double[] lane = new double[lanes];
      Arrays.fill(lane, t0);
      for (Node k : kids) {
        int b = 0;
        for (int i = 1; i < lanes; i++) if (lane[i] < lane[b]) b = i;
        lane[b] = k.layout(lane[b]);
      }
      double mx = t0; for (double l : lane) mx = Math.max(mx, l);
      return mx;
    }
    double start()  { return kids.stream().mapToDouble(Node::start).min().orElse(0); }
    double finish() { return kids.stream().mapToDouble(Node::finish).max().orElse(0); }
  }

  static final class Elem {
    String guid, cls, name, storey, phase, trade;
    double cx, cy, cz, bx, by, bz, workDays;
    double x0() { return cx - bx / 2; }  double x1() { return cx + bx / 2; }
    double y0() { return cy - by / 2; }  double y1() { return cy + by / 2; }
    double z0() { return cz - bz / 2; }  double z1() { return cz + bz / 2; }
  }

  // Shipped constants (schedule_gate.js), not re-typed by feel.
  static final double EPS = 0.05, GAP = 0.5;

  /** §POC_BEARS_BOUND (found by this sandbox, 2026-08-26). The SHIPPED predicate is
   *  `S.bz < T.bz - EPS && S.tz >= T.bz - GAP` — it bounds the support's BASE below the target but
   *  never bounds its TOP. A 6.4m riser then "bears" every element above its base: 5 of 17 false
   *  edges on 20 elements here. A real bearing contact has the support's TOP at the target's BASE. */
  static boolean bears(Elem s, Elem t) {
    if (s == t) return false;
    boolean xy = s.x0() <= t.x1() && s.x1() >= t.x0() && s.y0() <= t.y1() && s.y1() >= t.y0();
    return xy && s.z0() < t.z0() - EPS && s.z1() >= t.z0() - GAP && s.z1() <= t.z0() + GAP;
  }

  // ── shipped inputs ─────────────────────────────────────────────────────────────────────────
  static Map<String,Object> TEMPLATE, RULES;
  static List<String> PHASES = new ArrayList<>();
  static Map<String,Object> SEQ_RULES, LABOR, SEQ_DEFAULT;
  static double SHIFT_HOURS;

  static void loadShipped() throws IOException {
    String env = System.getenv("RATES_DIR");
    Path base = env != null ? Paths.get(env)
        : Paths.get(System.getProperty("user.home"), "bim-ootb", "viewer", "rates");
    TEMPLATE = Json.o(Json.parse(Files.readString(base.resolve("4D_template.json"))));
    // NOTE: sequence_rules.json is the MIRROR of rates.js's executed literal (rates.js says so, and
    // they drifted once — resynced 2026-08-13). The JS port must read the EXECUTED table.
    RULES = Json.o(Json.parse(Files.readString(base.resolve("sequence_rules.json"))));
    SEQ_RULES = Json.o(RULES.get("SEQUENCE_RULES"));
    SEQ_DEFAULT = Json.o(RULES.get("SEQUENCE_DEFAULT"));
    LABOR = Json.o(RULES.get("LABOR_RATES"));
    for (Object p : Json.a(TEMPLATE.get("phases"))) PHASES.add(Json.st(Json.o(p).get("name")));
    SHIFT_HOURS = Json.d(Json.o(TEMPLATE.get("calendar")).get("hours_per_shift"));
  }

  static Map<String,Object> ruleFor(String cls) {
    Object r = SEQ_RULES.get(cls);
    return r != null ? Json.o(r) : SEQ_DEFAULT;
  }

  /** duration_rule: work content / (shift * crews). Productivity is units/shift from LABOR_RATES,
   *  longest matching class key — the same "best prefix" rule schedule_author._installSecs uses. */
  static double workDaysOf(Elem e) {
    Object tr = LABOR.get(e.trade);
    if (tr == null) return 1.0 / 8;                      // no trade table: nominal, reported below
    Map<String,Object> t = Json.o(tr);
    Map<String,Object> prod = Json.o(t.get("productivity"));
    double best = 0; int bestLen = -1;
    for (Map.Entry<String,Object> en : prod.entrySet())
      if (e.cls.contains(en.getKey()) && en.getKey().length() > bestLen) {
        bestLen = en.getKey().length(); best = Json.d(en.getValue());
      }
    if (best <= 0) best = 10;                            // sequence_rules default_productivity
    return 1.0 / best;                                   // one element's share of a crew-day
  }

  static int crewsOf(String trade) {
    Object tr = LABOR.get(trade);
    if (tr == null) return 1;
    Object mc = Json.o(tr).get("max_crews");
    return mc == null ? 1 : (int) Json.d(mc);
  }

  public static void main(String[] args) throws IOException {
    loadShipped();
    boolean coherent = args.length > 0 && args[0].equals("coherent");
    List<Elem> els = coherent ? Sandbox.coherent() : Sandbox.hell();
    for (Elem e : els) {
      Map<String,Object> r = ruleFor(e.cls);
      e.phase = Json.st(r.get("phase"));
      e.trade = r.get("resource") == null ? "LABORER" : Json.st(r.get("resource"));
      e.workDays = workDaysOf(e);
    }
    System.out.println("§POC_FIXTURE " + (coherent ? "COHERENT (expect 0 violations AND 0 defects)"
        : "HELL (expect 0 violations, N named defects)") + " n=" + els.size());
    System.out.println("§POC_SHIPPED template=" + Json.st(Json.o(TEMPLATE.get("meta")).get("version"))
        + " phases=" + PHASES + " shiftHours=" + SHIFT_HOURS);

    Map<String, double[]> bands = levelBands(els);
    List<String> levels = new ArrayList<>(bands.keySet());

    Group building = new Group("BUILDING", "building");
    Map<String, List<Elem>> report = new LinkedHashMap<>();

    // §POC_TREE_SHAPE — LEVEL-major with phases inside, which is what 4D_template.json declares
    // (within_level chains phases inside a level; across_levels ladders each phase one level down).
    // v1 nested PHASE over LEVEL and produced 17 bearing violations: all-Superstructure-before-
    // all-Architecture puts the L2 slab before the L1 walls it rests on. Levels are siblings in
    // order (= the ladder); phases are siblings in order inside each (= the chain). One rule, two
    // depths — the two edge lists were never two things.
    for (String lv : levels) {
      Group level = new Group(lv, "level");
      for (String ph : PHASES) {
        List<Elem> cell = pick(els, ph, lv, bands, levels);
        if (!cell.isEmpty()) level.add(cellNode(lv + " / " + ph, cell, report));
      }
      if (!level.kids.isEmpty()) building.add(level);
    }
    Group hi = new Group("<building-scope>", "level");
    for (String ph : PHASES) {
      List<Elem> cell = pick(els, ph, null, bands, levels);
      if (!cell.isEmpty()) hi.add(cellNode("<building-scope> / " + ph, cell, report));
    }
    if (!hi.kids.isEmpty()) building.add(hi);

    building.layout(0);
    List<String> defects = audit(building, els, report);
    emitJson(building, defects, coherent);
  }

  static List<Elem> pick(List<Elem> els, String ph, String lv,
                         Map<String,double[]> bands, List<String> levels) {
    List<Elem> out = new ArrayList<>();
    for (Elem e : els) {
      if (!e.phase.equals(ph)) continue;
      String c = containingLevel(e, bands, levels);
      if (lv == null ? c == null : lv.equals(c)) out.add(e);
    }
    return out;
  }

  /** A cell splits into ORDERED LAYERS — topological layers of its own bearing relation. Within a
   *  layer nothing bears anything, so members run concurrently up to the trade's real crew cap. */
  static Node cellNode(String id, List<Elem> cell, Map<String, List<Elem>> report) {
    report.put(id, cell);
    List<List<Elem>> layers = topoLayers(cell);
    Group g = new Group(id, "phase");
    int i = 0;
    for (List<Elem> layer : layers) {
      // §POC_CREW_LANES — lanes are a CAPACITY, not a headcount. v1 used layer.size() (infinite
      // crews) and 4 elements started at one instant, which is the stacking hell wearing a
      // "parallel layer" label. max_crews comes from LABOR_RATES, per trade, per layer.
      int cap = layer.stream().mapToInt(e -> crewsOf(e.trade)).max().orElse(1);
      Group lg = new Group(id + " · layer " + (++i), "layer", cap);
      for (Elem e : layer) lg.add(new Leaf(e));
      g.add(lg);
    }
    return g;
  }

  static List<List<Elem>> topoLayers(List<Elem> cell) {
    List<List<Elem>> out = new ArrayList<>();
    List<Elem> left = new ArrayList<>(cell);
    while (!left.isEmpty()) {
      List<Elem> free = new ArrayList<>();
      for (Elem t : left) {
        boolean blocked = false;
        for (Elem s : left) if (bears(s, t)) { blocked = true; break; }
        if (!blocked) free.add(t);
      }
      if (free.isEmpty()) { out.add(new ArrayList<>(left)); break; }   // cycle: reported, not looped
      out.add(free);
      left.removeAll(free);
    }
    return out;
  }

  /** §POC_LEVEL_IS_A_DATUM — a level is its FLOOR up to the next level's floor. v1 took the band as
   *  the envelope of its members, so one 6.4m riser labelled L1 stretched L1 over L2 and every L2
   *  element fell out to building scope. The project already logs this: "zone is a median-Z
   *  INFERENCE, not IFC truth" (§ZONE_INDEX, HHS 30.8% noStorey). Bands disjoint by construction,
   *  so "which level contains this" has exactly one answer. */
  static Map<String, double[]> levelBands(List<Elem> els) {
    Map<String, Double> floor = new LinkedHashMap<>();
    for (Elem e : els) { if (e.storey != null) floor.merge(e.storey, e.z0(), Math::min); }
    List<String> ordered = new ArrayList<>(floor.keySet());
    ordered.sort(Comparator.comparingDouble(floor::get));
    Map<String, double[]> b = new LinkedHashMap<>();
    for (int i = 0; i < ordered.size(); i++)
      b.put(ordered.get(i), new double[]{ floor.get(ordered.get(i)),
            i + 1 < ordered.size() ? floor.get(ordered.get(i + 1)) : Double.MAX_VALUE });
    return b;
  }

  static String containingLevel(Elem e, Map<String,double[]> bands, List<String> levels) {
    if (e.storey == null) return null;                       // no address -> attaches higher
    String byBase = null, byTop = null;
    for (String l : levels) {
      double[] bd = bands.get(l);
      if (e.z0() >= bd[0] - EPS && e.z0() < bd[1] - EPS) byBase = l;
      if (e.z1() >  bd[0] + EPS && e.z1() <= bd[1] + EPS) byTop = l;
    }
    if (byBase == null) return null;
    if (byTop != null && !byTop.equals(byBase)) return null;  // spans bands -> attaches higher
    return byBase;
  }

  // ── audit: geometry's ONLY other job. §5.1 — name defects, never schedule around them ────────
  static List<String> audit(Group building, List<Elem> els, Map<String,List<Elem>> report) {
    List<Leaf> leaves = new ArrayList<>(); collect(building, leaves);
    Map<String,Leaf> byGuid = new HashMap<>(); for (Leaf l : leaves) byGuid.put(l.e.guid, l);
    Map<String,String> cellOf = new HashMap<>();
    for (Map.Entry<String,List<Elem>> en : report.entrySet())
      for (Elem e : en.getValue()) cellOf.put(e.guid, en.getKey());

    int viol = 0; List<String> defects = new ArrayList<>();
    for (Elem t : els) for (Elem s : els) {
      if (!bears(s, t)) continue;
      Leaf ls = byGuid.get(s.guid), lt = byGuid.get(t.guid);
      if (ls == null || lt == null || lt.s >= ls.f - 1e-9) continue;
      String cs = cellOf.get(s.guid), ct = cellOf.get(t.guid);
      if (cs != null && cs.equals(ct)) {
        viol++;
        System.out.println("   §POC_VIOLATION " + t.name + " before " + s.name + " in " + cs);
      } else {
        defects.add(s.name + " (" + cs + ") bears " + t.name + " (" + ct + ")");
      }
    }
    Map<Double,Integer> hist = new TreeMap<>();
    for (Leaf l : leaves) hist.merge(l.s, 1, Integer::sum);
    int maxPile = hist.values().stream().mapToInt(Integer::intValue).max().orElse(0);

    System.out.println("§POC_STACKING maxSimultaneousStarts=" + maxPile
        + " (bounded by LABOR_RATES max_crews, never by cell size)");
    System.out.println("§POC_VIOLATIONS total=" + viol
        + " (same-cell — the model must prevent these; MUST BE 0)");
    System.out.println("§POC_DATA_DEFECTS total=" + defects.size()
        + " (bearing element classified AFTER what it carries — §5.1: named, never scheduled around)");
    for (String d : defects) System.out.println("   §POC_DEFECT " + d);
    System.out.println("§POC_SPAN days=" + String.format("%.2f", building.finish())
        + " leaves=" + leaves.size() + "/" + els.size());
    if (viol != 0) System.out.println("§POC_VERDICT FAIL");
    else System.out.println("§POC_VERDICT PASS (violations=0; defects are input quality, reported)");
    return defects;
  }

  // ── PROJECTIONS. One walk, one visitor per consumer. WRITE-ONLY: no visitor reads another's
  // output and none recomputes order. An edit moves a node and every projection is RECOMPUTED,
  // never patched — which is why _tmRescaleToTaskWindow cannot come back.
  interface Visitor { default void group(Group g, int depth) {} default void leaf(Leaf l, Group parent) {} }

  static void fold(Node n, Group parent, int depth, Visitor v) {
    if (n instanceof Leaf l) { v.leaf(l, parent); return; }
    Group g = (Group) n; v.group(g, depth);
    for (Node k : g.kids) fold(k, g, depth + 1, v);
  }

  /** OpsVisitor — leaves become kernel_ops ELEMENT_PLACE rows. The movie is exactly the leaves in
   *  start order; there is no second timeline to reconcile against. */
  static final class OpsVisitor implements Visitor {
    final List<String> rows = new ArrayList<>();
    public void leaf(Leaf l, Group parent) {
      rows.add("{\"guid\": \"" + l.e.guid + "\", \"start_ts\": " + String.format("%.4f", l.s)
        + ", \"end_ts\": " + String.format("%.4f", l.f) + ", \"task\": \"" + Json.esc(parent.id)
        + "\", \"cls\": \"" + l.e.cls + "\", \"trade\": \"" + l.e.trade + "\"}");
    }
  }

  /** TasksVisitor — composites become tasks; leaf->parent becomes task_elements. task_sequences is
   *  NOT emitted: sibling order is the order, so an edge list would restate what the tree says. */
  static final class TasksVisitor implements Visitor {
    final List<String> tasks = new ArrayList<>(), links = new ArrayList<>();
    public void group(Group g, int depth) {
      tasks.add("{\"task_id\": \"" + Json.esc(g.id) + "\", \"kind\": \"" + g.kind
        + "\", \"depth\": " + depth + ", \"start\": " + String.format("%.4f", g.start())
        + ", \"finish\": " + String.format("%.4f", g.finish()) + ", \"lanes\": " + g.lanes + "}");
    }
    public void leaf(Leaf l, Group parent) {
      links.add("{\"task_id\": \"" + Json.esc(parent.id) + "\", \"guid\": \"" + l.e.guid + "\"}");
    }
  }

  static void collect(Node n, List<Leaf> out) {
    if (n instanceof Leaf l) { out.add(l); return; }
    for (Node k : n.children()) collect(k, out);
  }

  // ── the product: the TREE, serialised ──────────────────────────────────────────────────────
  static void emitJson(Group building, List<String> defects, boolean coherent) throws IOException {
    StringBuilder b = new StringBuilder();
    b.append("{\n  \"provenance\": {\n");
    b.append("    \"model\": \"composite\",\n");
    b.append("    \"template\": \"4D_template.json v")
     .append(Json.st(Json.o(TEMPLATE.get("meta")).get("version"))).append("\",\n");
    b.append("    \"rules\": \"sequence_rules.json (MIRROR of rates.js — JS port must read the executed table)\",\n");
    b.append("    \"fixture\": \"").append(coherent ? "coherent" : "hell").append("\",\n");
    b.append("    \"unit\": \"crew-days\",\n");
    b.append("    \"edges\": \"none — sibling order IS the order; task_sequences is derived\"\n  },\n");
    b.append("  \"defects\": [");
    for (int i = 0; i < defects.size(); i++)
      b.append(i > 0 ? ",\n    " : "\n    ").append('"').append(Json.esc(defects.get(i))).append('"');
    b.append(defects.isEmpty() ? "" : "\n  ").append("],\n");
    OpsVisitor ops = new OpsVisitor(); fold(building, null, 0, ops);
    TasksVisitor tv = new TasksVisitor(); fold(building, null, 0, tv);
    b.append("  \"kernel_ops\": [\n    ").append(String.join(",\n    ", ops.rows)).append("\n  ],\n");
    b.append("  \"tasks\": [\n    ").append(String.join(",\n    ", tv.tasks)).append("\n  ],\n");
    b.append("  \"task_elements\": [\n    ").append(String.join(",\n    ", tv.links)).append("\n  ],\n");
    b.append("  \"task_sequences\": \"derived — sibling order IS the order\",\n");
    System.out.println("§POC_PROJECTIONS kernel_ops=" + ops.rows.size() + " tasks=" + tv.tasks.size()
        + " task_elements=" + tv.links.size() + " task_sequences=0 (derived)");
    b.append("  \"tree\":\n");
    node(building, 2, b);
    b.append("\n}\n");
    Path out = Paths.get(System.getProperty("user.home"), "bim-compiler", "poc4d",
        coherent ? "4d_coherent.json" : "4d_hell.json");
    Files.writeString(out, b.toString());
    System.out.println("§POC_JSON " + out + " bytes=" + b.length());
  }

  static void node(Node n, int ind, StringBuilder b) {
    String p = " ".repeat(ind);
    b.append(p).append("{\"id\": \"").append(Json.esc(n.id)).append("\", \"kind\": \"").append(n.kind)
     .append("\", \"start\": ").append(String.format("%.4f", n.start()))
     .append(", \"finish\": ").append(String.format("%.4f", n.finish()));
    if (n instanceof Leaf l) {
      b.append(", \"guid\": \"").append(l.e.guid).append("\", \"cls\": \"").append(l.e.cls)
       .append("\", \"trade\": \"").append(l.e.trade)
       .append("\", \"name\": \"").append(Json.esc(l.e.name)).append("\"}");
      return;
    }
    Group g = (Group) n;
    b.append(", \"lanes\": ").append(g.lanes).append(", \"children\": [\n");
    for (int i = 0; i < g.kids.size(); i++) {
      node(g.kids.get(i), ind + 2, b);
      b.append(i + 1 < g.kids.size() ? ",\n" : "\n");
    }
    b.append(p).append("]}");
  }

  // ── the sandbox ────────────────────────────────────────────────────────────────────────────
  static final class Sandbox {
    static Elem e(String cls, String name, String storey, double cx, double cy, double cz,
                  double bx, double by, double bz) {
      Elem x = new Elem(); x.cls = cls; x.name = name; x.storey = storey;
      x.cx = cx; x.cy = cy; x.cz = cz; x.bx = bx; x.by = by; x.bz = bz; return x;
    }
    static List<Elem> id(List<Elem> r, String pre) {
      int i = 0; for (Elem x : r) x.guid = String.format(pre + "%03d", i++); return r;
    }
    /** HELL — each row reproduces a NAMED, MEASURED defect. Citations in the JS twin,
     *  witness_kit/generators/sandbox_model.js. */
    static List<Elem> hell() { return id(new ArrayList<>(List.of(
      e("IfcFooting","Footing L1","L1", 0,0,-0.50, 4.0,4.0,1.00),
      e("IfcColumn","Column L1","L1", -1.8,0,1.50, 0.4,0.4,3.00),
      e("IfcSlab","Slab L1","L1", 0,0,3.10, 4.0,4.0,0.20),
      e("IfcWallStandardCase","Wall lower L1","L1", 0,-1.9,-0.50, 4.0,0.2,1.00),
      e("IfcWallStandardCase","Wall upper L1","L1", 0,-1.9,1.50, 4.0,0.2,3.00),
      e("IfcWallStandardCase","Wall N L1","L1", 0,1.9,1.50, 4.0,0.2,3.00),
      e("IfcWallStandardCase","Wall E L1","L1", 1.9,0,1.50, 0.2,4.0,3.00),
      e("IfcWallStandardCase","Wall W L1","L1", -1.9,0,1.50, 0.2,4.0,3.00),
      e("IfcDoor","Door L1","L1", 0,-1.9,1.05, 0.9,0.2,2.10),
      e("IfcFlowSegment","Duct L1","L1", 0,0,2.75, 3.0,0.3,0.30),
      e("IfcFlowTerminal","Light L1","L1", 0.8,0.8,2.92, 0.6,0.6,0.06),
      e("IfcCovering","Floor fin L1","L1", 0,0,0.02, 4.0,4.0,0.02),
      e("IfcColumn","Column L2","L2", -1.8,0,4.80, 0.4,0.4,3.00),
      e("IfcSlab","Slab L2","L2", 0,0,6.30, 4.0,4.0,0.20),
      e("IfcWallStandardCase","Wall S L2","L2", 0,-1.9,4.80, 4.0,0.2,3.00),
      e("IfcFlowSegment","Duct L2","L2", 0,0,5.95, 3.0,0.3,0.30),
      e("IfcCovering","Floor fin L2","L2", 0,0,3.22, 4.0,4.0,0.02),
      e("IfcBuildingElementProxy","Unlevelled proxy",null, 1.5,1.5,2.00, 0.3,0.3,1.00),
      e("IfcFlowSegment","Riser L1-L2","L1", 1.7,1.7,3.10, 0.2,0.2,6.40),
      e("IfcBuildingElementProxy","Orphan","L2", 3.6,3.6,5.00, 0.2,0.2,0.40))), "SBX");
    }
    /** COHERENT — the same building modelled correctly: a floor slab sits at its level's DATUM
     *  (walls stand ON it). The hell fixture puts it at the ceiling, so it is really the level
     *  above's floor wearing this level's label — the storey-labelling defect the project logs as
     *  §GANTT_STOREY_Z reassigned=2120. Two changes, both real building logic. Proves the model
     *  reaches 0 violations AND 0 defects on coherent input, without which "0 violations" would
     *  only mean the failures had been renamed. */
    static List<Elem> coherent() { return id(new ArrayList<>(List.of(
      e("IfcFooting","Footing L1","L1", 0,0,-0.50, 4.0,4.0,1.00),
      e("IfcSlab","Floor slab L1","L1", 0,0,0.10, 4.0,4.0,0.20),
      e("IfcColumn","Column L1","L1", -1.8,0,1.90, 0.4,0.4,3.40),
      e("IfcWallStandardCase","Wall lower L1","L1", 0,-1.9,0.70, 4.0,0.2,1.00),
      e("IfcWallStandardCase","Wall upper L1","L1", 0,-1.9,2.40, 4.0,0.2,2.40),
      e("IfcWallStandardCase","Wall N L1","L1", 0,1.9,1.90, 4.0,0.2,3.40),
      e("IfcWallStandardCase","Wall E L1","L1", 1.9,0,1.90, 0.2,4.0,3.40),
      e("IfcDoor","Door L1","L1", 0,-1.9,1.25, 0.9,0.2,2.10),
      e("IfcFlowSegment","Duct L1","L1", 0,0,3.30, 3.0,0.3,0.30),
      e("IfcFlowTerminal","Light L1","L1", 0.8,0.8,3.52, 0.6,0.6,0.06),
      e("IfcCovering","Floor fin L1","L1", 0,0,0.22, 4.0,4.0,0.04),
      e("IfcSlab","Floor slab L2","L2", 0,0,3.70, 4.0,4.0,0.20),
      e("IfcColumn","Column L2","L2", -1.8,0,5.50, 0.4,0.4,3.40),
      e("IfcWallStandardCase","Wall S L2","L2", 0,-1.9,5.50, 4.0,0.2,3.40),
      e("IfcFlowSegment","Duct L2","L2", 0,0,6.90, 3.0,0.3,0.30),
      e("IfcCovering","Floor fin L2","L2", 0,0,3.82, 4.0,4.0,0.04),
      e("IfcBuildingElementProxy","Unlevelled proxy",null, 1.5,1.5,2.00, 0.3,0.3,1.00),
      e("IfcFlowSegment","Riser L1-L2","L1", 1.7,1.7,3.60, 0.2,0.2,7.00),
      e("IfcBuildingElementProxy","Orphan","L2", 3.6,3.6,5.00, 0.2,0.2,0.40))), "COH");
    }
  }
}
