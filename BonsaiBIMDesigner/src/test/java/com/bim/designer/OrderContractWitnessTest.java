package com.bim.designer;

import com.bim.cobol.VerbContext;
import com.bim.cobol.VerbResult;
import com.bim.cobol.verb.CheckBomVerb;
import com.bim.cobol.verb.CheckClashVerb;
import com.bim.cobol.verb.CheckPlacementVerb;
import com.bim.cobol.verb.SnapToGridVerb;
import com.bim.designer.api.DesignerAPI.Adjustment;
import com.bim.backoffice.model.DesignBBox;
import com.bim.designer.api.DesignerAPI.PlaceItemRequest;
import com.bim.designer.api.DesignerAPI.PlaceItemResponse;
import com.bim.designer.api.DesignerAPI.SnapOptions;
import com.bim.designer.api.DesignerAPI.SnapResponse;
import com.bim.designer.api.DesignerAPIImpl;
import com.bim.designer.dao.StubDataSeeder;
import com.bim.designer.validation.PlacementRequest;
import com.bim.designer.validation.PlacementValidatorImpl;
import com.bim.designer.validation.ValidationVerdict;
import com.bim.eyes.proof.EyesProofRunner;
import com.bim.eyes.proof.ProofReport;
import com.bim.eyes.proof.ProofResult;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Implementing prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §4.1.
 * Witnesses: W-ORDER-REJECT-COVERAGE, W-ORDER-SNAP-LOSSLESS-LOG.
 *
 * <p>ISSUE PROVED OR DISPROVED: "every defect class an external proposer can submit is rejected by a
 * named gate" and "snapping never hides an out-of-tolerance order". Both tables are pinned: a green run
 * means the table in the prompts file is still accurate, NOT that orders are safe.
 */
class OrderContractWitnessTest {

    private static final String ROOT = System.getProperty("bim.fixture.root", ".");
    private static final Path DUPLEX = Path.of(ROOT, "DAGCompiler/lib/input/Duplex_extracted.db");
    private static final Path RULES = Path.of(ROOT, "library/validation.db");
    private static final String GUID = "ORDER_WITNESS_INJECTED";

    /** One injected element, in metres, in the fixture's own columns. */
    private record Box(String ifcClass, String discipline, String storey,
                       double minX, double maxX, double minY, double maxY, double minZ, double maxZ) {}

    private static Box anchor(Connection c, String ifcClass) throws SQLException {
        try (Statement st = c.createStatement();
             ResultSet r = st.executeQuery("SELECT m.storey, x.minX, x.maxX, x.minY, x.maxY, x.minZ, x.maxZ"
                     + " FROM elements_meta m JOIN elements_rtree x ON m.id = x.id"
                     + " WHERE m.ifc_class = '" + ifcClass + "' AND m.storey <> 'Unknown' ORDER BY m.id LIMIT 1")) {
            assertTrue(r.next(), "fixture has no " + ifcClass);
            return new Box(ifcClass, "ARC", r.getString(1), r.getDouble(2), r.getDouble(3),
                    r.getDouble(4), r.getDouble(5), r.getDouble(6), r.getDouble(7));
        }
    }

    private static void inject(Path db, Box b) throws SQLException {
        try (Connection c = DriverManager.getConnection("jdbc:sqlite:" + db);
             PreparedStatement m = c.prepareStatement("INSERT INTO elements_meta"
                     + " (id, guid, discipline, ifc_class, element_name, storey) VALUES (900001, ?, ?, ?, ?, ?)");
             PreparedStatement x = c.prepareStatement("INSERT INTO elements_rtree"
                     + " (id, minX, maxX, minY, maxY, minZ, maxZ) VALUES (900001, ?, ?, ?, ?, ?, ?)")) {
            m.setString(1, GUID);
            m.setString(2, b.discipline());
            m.setString(3, b.ifcClass());
            m.setString(4, GUID);
            m.setString(5, b.storey());
            m.executeUpdate();
            double[] v = {b.minX(), b.maxX(), b.minY(), b.maxY(), b.minZ(), b.maxZ()};
            for (int i = 0; i < 6; i++) x.setDouble(i + 1, v[i]);
            x.executeUpdate();
        }
    }

    /** Runs every DB-reading gate; returns only what names the injected guid. */
    private static String judge(String defect, Box b, Path scratch) throws Exception {
        Path db = scratch.resolve(defect + ".db");
        Files.copy(DUPLEX, db, StandardCopyOption.REPLACE_EXISTING);
        inject(db, b);

        VerbResult<CheckPlacementVerb.PlacementCheckPayload> placement =
                new CheckPlacementVerb().execute(VerbContext.ofBom(null), db.toString(), "TIER", "ALL");
        TreeSet<String> placementHits = new TreeSet<>();
        for (CheckPlacementVerb.ProofResult r : placement.payload().results()) {
            if (r.pass()) continue;
            if (GUID.equals(r.element()) || (r.evidence() != null && r.evidence().contains(GUID))) {
                placementHits.add(r.proofId());
            }
        }

        VerbResult<CheckClashVerb.ClashCheckPayload> clash =
                new CheckClashVerb().execute(VerbContext.ofBom(null), db.toString(), "CLEARANCE", "0");
        long clashHits = clash.payload().clashes().stream()
                .filter(r -> GUID.equals(r.mepGuid()) || GUID.equals(r.structuralGuid())).count();

        ProofReport eyes = EyesProofRunner.proveFromDB(db.toString(), "Duplex", EyesProofRunner.RelationalContext.EMPTY);
        TreeSet<String> eyesHits = new TreeSet<>();
        for (ProofResult r : eyes.results()) {
            if (r.status() != ProofResult.Status.VIOLATED) continue;
            if (GUID.equals(r.element()) || (r.evidence() != null && r.evidence().contains(GUID))) {
                eyesHits.add(r.proofId());
            }
        }

        String verdict = (!placementHits.isEmpty() || !eyesHits.isEmpty()) ? "FAILS"
                : clashHits > 0 ? "DETECT_ONLY" : "NONE";
        System.out.printf("§ORDER_COVERAGE defect=%s verdict=%s checkPlacement=%s checkClash=%d(verbPass=%s) eyes=%s%n",
                defect, verdict, placementHits, clashHits, clash.pass(), eyesHits);
        return verdict;
    }

    private static void requireFixture(Path p) throws Exception {
        boolean usable = Files.exists(p) && Files.size(p) > 0;
        if (!usable) System.out.printf("§ORDER_WITNESS verdict=INCONCLUSIVE reason=fixture_missing path=%s%n", p);
        Assumptions.assumeTrue(usable, "fixture missing: " + p);
    }

    @Test
    @DisplayName("W-ORDER-REJECT-COVERAGE: which gate fires for each defect class a proposer can submit")
    void rejectCoverage() throws Exception {
        requireFixture(DUPLEX);
        requireFixture(RULES);

        Box wall, slab, beam;
        int population;
        try (Connection c = DriverManager.getConnection("jdbc:sqlite:" + DUPLEX);
             Statement st = c.createStatement();
             ResultSet r = st.executeQuery("SELECT COUNT(*) FROM elements_meta")) {
            population = r.getInt(1);
            wall = anchor(c, "IfcWallStandardCase");
            slab = anchor(c, "IfcSlab");
            beam = anchor(c, "IfcBeam");
        }
        System.out.printf("§ORDER_WITNESS population=%d fixture=%s%n", population, DUPLEX);
        Assumptions.assumeTrue(population > 0, "empty population");

        Path scratch = Files.createTempDirectory("order_contract_");
        Map<String, String> got = new LinkedHashMap<>();
        String st = wall.storey();
        // Clear of the building in plan, inside the storey's Z range, so only the named defect is in play.
        double y = 300, z = wall.minZ();

        // Controls: if these two break, every NONE below is meaningless.
        got.put("CONTROL_clean", judge("CONTROL_clean",
                new Box("IfcFurniture", "ARC", st, 300, 301, y, y + 1, z, z + 1), scratch));
        got.put("D1_overlap_same_class", judge("D1_overlap_same_class",
                new Box(wall.ifcClass(), "ARC", st, wall.minX() + 0.05, wall.maxX() + 0.05,
                        wall.minY(), wall.maxY(), wall.minZ(), wall.maxZ()), scratch));

        got.put("D2_overlap_door_in_slab", judge("D2_overlap_door_in_slab",
                new Box("IfcDoor", "ARC", slab.storey(), slab.minX(), slab.minX() + 1,
                        slab.minY(), slab.minY() + 0.2, slab.minZ(), slab.maxZ()), scratch));
        got.put("D3_overlap_pipe_in_beam", judge("D3_overlap_pipe_in_beam",
                new Box("IfcPipeSegment", "SP", beam.storey(), beam.minX(), beam.maxX(),
                        beam.minY(), beam.maxY(), beam.minZ(), beam.maxZ()), scratch));
        got.put("D3b_overlap_pipe_in_wall", judge("D3b_overlap_pipe_in_wall",
                // A 100 mm box at mid-wall, so a slab or beam touching the wall's ends cannot be what fires.
                new Box("IfcPipeSegment", "SP", wall.storey(),
                        (wall.minX() + wall.maxX()) / 2 - 0.05, (wall.minX() + wall.maxX()) / 2 + 0.05,
                        (wall.minY() + wall.maxY()) / 2 - 0.05, (wall.minY() + wall.maxY()) / 2 + 0.05,
                        (wall.minZ() + wall.maxZ()) / 2 - 0.05, (wall.minZ() + wall.maxZ()) / 2 + 0.05), scratch));

        // Unsupported. The band check derives its range from all elements of the storey INCLUDING this one.
        got.put("D4a_unsupported_column_50m_up", judge("D4a_unsupported_column_50m_up",
                new Box("IfcColumn", "STR", st, wall.minX(), wall.minX() + 0.3,
                        wall.minY(), wall.minY() + 0.3, wall.minZ() + 50, wall.minZ() + 53), scratch));
        got.put("D4b_unsupported_beam_200m_away", judge("D4b_unsupported_beam_200m_away",
                new Box("IfcBeam", "STR", st, 200, 205, y, y + 0.3, z + 2, z + 2.5), scratch));

        // Unit errors: mm written into metre columns, then the reverse.
        got.put("D5a_mm_as_m_3100", judge("D5a_mm_as_m_3100",
                new Box("IfcWall", "ARC", st, 0, 3100, y, y + 0.2, z, z + 2.8), scratch));
        got.put("D5b_mm_as_m_800", judge("D5b_mm_as_m_800",
                new Box("IfcWall", "ARC", st, 0, 800, y, y + 0.2, z, z + 2.8), scratch));
        got.put("D5c_m_as_km", judge("D5c_m_as_km",
                new Box("IfcWall", "ARC", st, 300, 300.0031, y, y + 0.0002, z, z + 0.0028), scratch));

        // Unknown type / duplicate position.
        got.put("D7b_unknown_ifc_class", judge("D7b_unknown_ifc_class",
                new Box("IfcNonsense", "ARC", st, 300, 301, y, y + 1, z, z + 1), scratch));
        got.put("D8b_duplicate_position", judge("D8b_duplicate_position",
                new Box(wall.ifcClass(), "ARC", st, wall.minX(), wall.maxX(),
                        wall.minY(), wall.maxY(), wall.minZ(), wall.maxZ()), scratch));

        // D8a: duplicate guid, at the schema.
        Path dup = scratch.resolve("D8a.db");
        Files.copy(DUPLEX, dup, StandardCopyOption.REPLACE_EXISTING);
        String existing;
        try (Connection c = DriverManager.getConnection("jdbc:sqlite:" + dup);
             Statement s = c.createStatement();
             ResultSet r = s.executeQuery("SELECT guid FROM elements_meta LIMIT 1")) {
            existing = r.getString(1);
        }
        String d8a = "NONE";
        String d8aWhy = "";
        try (Connection c = DriverManager.getConnection("jdbc:sqlite:" + dup);
             PreparedStatement p = c.prepareStatement("INSERT INTO elements_meta (id, guid, discipline, ifc_class)"
                     + " VALUES (900002, ?, 'ARC', 'IfcWall')")) {
            p.setString(1, existing);
            p.executeUpdate();
        } catch (SQLException e) {
            d8a = "FAILS";
            d8aWhy = e.getMessage();
        }
        got.put("D8a_duplicate_guid", d8a);
        System.out.printf("§ORDER_COVERAGE defect=D8a_duplicate_guid verdict=%s gate=elements_meta.guid_UNIQUE evidence=\"%s\"%n", d8a, d8aWhy);

        // Validator path: the interface a proposer's placement would actually be judged through.
        try (Connection val = DriverManager.getConnection("jdbc:sqlite:" + RULES)) {
            PlacementValidatorImpl v = new PlacementValidatorImpl();
            v.activate("MY", val);
            got.put("D5d_metres_in_mm_field", validatorVerdict("D5d_metres_in_mm_field", v, "BEDROOM", "IfcSpace", 3.1, 3.1, 2.8));
            got.put("D5e_mm_as_m_x1000", validatorVerdict("D5e_mm_as_m_x1000", v, "BEDROOM", "IfcSpace", 3_100_000, 3_100_000, 2_800_000));
            got.put("D7a_unknown_category", validatorVerdict("D7a_unknown_category", v, "NONSENSE_TYPE", "IfcNonsense", 5000, 5000, 3000));
            // False-reject probe: 2000x3000 is legal for a KITCHEN (4.5 m2, 1500 mm). A BLOCK here means another category's rule judged it.
            got.put("V1_legal_kitchen", validatorVerdict("V1_legal_kitchen", v, "KITCHEN", "IfcSpace", 2000, 3000, 2800));
        }

        // Unknown product, through the Designer API and through CHECK BOM.
        try (Connection c = DriverManager.getConnection("jdbc:sqlite::memory:")) {
            StubDataSeeder.seed(c);
            PlaceItemResponse resp = new DesignerAPIImpl(c).placeItem(
                    new PlaceItemRequest("X", "ROOM", "NO_SUCH_PRODUCT", 0, 0, 0, List.of()));
            String d7c = resp.success() ? "NONE" : "FAILS";
            got.put("D7c_unknown_product_placeItem", d7c);
            System.out.printf("§ORDER_COVERAGE defect=D7c_unknown_product_placeItem verdict=%s success=%s%n", d7c, resp.success());

            VerbResult<CheckBomVerb.BomCheckPayload> bom =
                    new CheckBomVerb().execute(VerbContext.ofBom(c), "NO_SUCH_BOM");
            String d7d = bom.pass() ? "NONE" : "FAILS";
            got.put("D7d_unknown_bom_checkBom", d7d);
            System.out.printf("§ORDER_COVERAGE defect=D7d_unknown_bom_checkBom verdict=%s summary=\"%s\"%n", d7d, bom.summary());
        }

        // The harness itself: a blind harness makes every NONE worthless.
        assertEquals("NONE", got.get("CONTROL_clean"), "clean control fired: harness cannot tell clean from defective");
        assertEquals("FAILS", got.get("D1_overlap_same_class"), "positive control silent: harness is blind");

        Map<String, String> recorded = new LinkedHashMap<>();
        recorded.put("CONTROL_clean", "NONE");
        recorded.put("D1_overlap_same_class", "FAILS");
        recorded.put("D2_overlap_door_in_slab", "NONE");
        recorded.put("D3_overlap_pipe_in_beam", "DETECT_ONLY");
        recorded.put("D3b_overlap_pipe_in_wall", "NONE");
        recorded.put("D4a_unsupported_column_50m_up", "NONE");
        recorded.put("D4b_unsupported_beam_200m_away", "NONE");
        recorded.put("D5a_mm_as_m_3100", "FAILS");
        recorded.put("D5b_mm_as_m_800", "NONE");
        recorded.put("D5c_m_as_km", "FAILS");
        recorded.put("D7b_unknown_ifc_class", "NONE");
        recorded.put("D8b_duplicate_position", "FAILS");
        recorded.put("D8a_duplicate_guid", "FAILS");
        recorded.put("D5d_metres_in_mm_field", "FAILS");
        recorded.put("D5e_mm_as_m_x1000", "NONE");
        recorded.put("D7a_unknown_category", "NONE");
        recorded.put("V1_legal_kitchen", "NONE"); // fixed by V016 (§6.1); FAILS here means the local validation.db lacks V016
        recorded.put("D7c_unknown_product_placeItem", "FAILS");
        recorded.put("D7d_unknown_bom_checkBom", "FAILS");
        long none = got.entrySet().stream()
                .filter(e -> e.getKey().startsWith("D") && "NONE".equals(e.getValue())).count();
        long defects = got.keySet().stream().filter(k -> k.startsWith("D")).count();
        System.out.printf("§ORDER_COVERAGE_SUMMARY defects=%d none=%d verdict=%s claim=every_defect_class_rejected%n",
                defects, none, none == 0 ? "PROVED" : "DISPROVED");
        assertEquals(recorded, got, "coverage changed: update prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §3.1");
    }

    private static String validatorVerdict(String defect, PlacementValidatorImpl v, String category, String ifcClass,
                                           double w, double d, double h) {
        ValidationVerdict verdict = v.validate(new PlacementRequest(category, ifcClass, "ARC", w, d, h, 0, 0, 0, "SNAP", 0, "Level 1"));
        String out = verdict.isBlocked() ? "FAILS" : verdict.isWarning() ? "DETECT_ONLY" : "NONE";
        System.out.printf("§ORDER_COVERAGE defect=%s verdict=%s gate=PlacementValidator result=%s rule=%s actual=%s required=%s rules=%d%n",
                defect, out, verdict.result(), verdict.ruleName(), verdict.actualValue(), verdict.requiredValue(), v.getRuleCount());
        return out;
    }

    private static DesignBBox room(String id, double w, double d) {
        return new DesignBBox(id, id, "ROOM", "BEDROOM", "IfcSpace", "Level 1", "ROOT", 0, 0, 0, w, d, 2800);
    }

    private static long gridAdjustments(SnapResponse r) {
        return r.adjustments().stream().filter(a -> "GRID_SNAP".equals(a.rule())).count();
    }

    @Test
    @DisplayName("W-ORDER-SNAP-LOSSLESS-LOG: does snapping hide an order that was out of tolerance")
    void snapLosslessLog() throws Exception {
        requireFixture(RULES);
        try (Connection val = DriverManager.getConnection("jdbc:sqlite:" + RULES)) {
            PlacementValidatorImpl v = new PlacementValidatorImpl();
            v.activate("MY", val);
            assertTrue(v.getRuleCount() > 0, "no rules loaded: every verdict below would be vacuous");
            DesignerAPIImpl api = new DesignerAPIImpl(null, v);

            // S1: 2800 breaks the 3000 minimum. Grid 500 rounds it to 3000 BEFORE the validator sees it.
            // 4500 keeps the area clear of every area rule, so only the rounded dimension is in play.
            ValidationVerdict raw = v.validate(new PlacementRequest("BEDROOM", "IfcSpace", "ARC", 2800, 4500, 2800, 0, 0, 0, "SNAP", 0, "Level 1"));
            SnapResponse s1 = api.snap(List.of(room("S1", 2800, 4500)), new SnapOptions("MY", 500));
            boolean s1Flagged = s1.adjustments().stream().anyMatch(a -> !"GRID_SNAP".equals(a.rule()));
            boolean s1Hidden = raw.isBlocked() && !s1Flagged && s1.success();
            System.out.printf("§ORDER_SNAP_WITNESS case=S1_rounded_past_minimum verdict=%s rawResult=%s rawRule=%s snappedWidth=%.1f adjustments=%s%n",
                    s1Hidden ? "WRONG" : "OK", raw.result(), raw.ruleName(),
                    s1.bboxes().get(0).maxX() - s1.bboxes().get(0).minX(), s1.adjustments());

            // S2: 10002 mm vs a 1 mm tolerance. snap() has no tolerance input: it moves 2 mm and succeeds.
            SnapResponse s2 = api.snap(List.of(room("S2", 10002, 4000)), new SnapOptions("MY", 1000));
            double s2Width = s2.bboxes().get(0).maxX() - s2.bboxes().get(0).minX();
            boolean s2Rejected = !s2.success();
            System.out.printf("§ORDER_SNAP_WITNESS case=S2_10002_vs_1mm_tolerance verdict=%s success=%s width=%.1f moved_mm=%.1f gridAdjustments=%d%n",
                    s2Rejected ? "OK" : "WRONG", s2.success(), s2Width, 10002 - s2Width, gridAdjustments(s2));

            // S3: the verb form of the same order, metres. Rounds UP: 998 mm away, verb still passes.
            VerbResult<SnapToGridVerb.GridSnapPayload> s3 = new SnapToGridVerb().execute(VerbContext.ofBom(null), "(10.002,5.0,0)", "SPACING", "1000");
            assertTrue(s3.payload() != null, "S3 never reached the snap: " + s3.summary());
            System.out.printf("§ORDER_SNAP_WITNESS case=S3_verb_10_002_spacing_1000 verdict=%s pass=%s summary=\"%s\"%n",
                    s3.pass() ? "WRONG" : "OK", s3.pass(), s3.summary());

            // S4: lossless log. 0.4 mm is dropped by the mm conversion before the verb compares anything.
            VerbResult<SnapToGridVerb.GridSnapPayload> s4 = new SnapToGridVerb().execute(VerbContext.ofBom(null), "(10.0004,5.0,0)", "SPACING", "1");
            assertTrue(s4.payload() != null, "S4 never reached the snap: " + s4.summary());
            System.out.printf("§ORDER_SNAP_WITNESS case=S4_sub_mm_rounding_unlogged verdict=%s adjustments=%s summary=\"%s\"%n",
                    s4.payload().adjustments().isEmpty() ? "WRONG" : "OK", s4.payload().adjustments(), s4.summary());

            // S5: a BLOCK that survives snapping is still returned with success=true.
            SnapResponse s5 = api.snap(List.of(room("S5", 2000, 2000)), new SnapOptions("MY", 0));
            Adjustment s5Rule = s5.adjustments().stream().filter(a -> !"GRID_SNAP".equals(a.rule())).findFirst().orElse(null);
            boolean s5Rejected = !s5.success() || s5.bboxes().isEmpty();
            System.out.printf("§ORDER_SNAP_WITNESS case=S5_block_returned_as_success verdict=%s success=%s returned=%d rule=%s%n",
                    s5Rejected ? "OK" : "WRONG", s5.success(), s5.bboxes().size(), s5Rule == null ? null : s5Rule.rule());

            // S6: NO-OP. Already on grid, nothing to snap: must not read as a pass of anything.
            SnapResponse s6 = api.snap(List.of(room("S6", 4000, 4000)), new SnapOptions("MY", 500));
            System.out.printf("§ORDER_SNAP_WITNESS case=S6_on_grid verdict=NO-OP gridAdjustments=%d%n", gridAdjustments(s6));

            // S7: VACUOUS. Validator off: snap still answers success with nothing judged.
            SnapResponse s7 = new DesignerAPIImpl(null, new PlacementValidatorImpl())
                    .snap(List.of(room("S7", 2000, 2000)), new SnapOptions("MY", 0));
            System.out.printf("§ORDER_SNAP_WITNESS case=S7_validator_inactive verdict=VACUOUS success=%s adjustments=%d%n",
                    s7.success(), s7.adjustments().size());

            // S8: click-to-fix control (§6.2). A fix must land on the requirement and not read as a rounded-up violation.
            SnapResponse s8 = api.snap(List.of(room("S8", 2000, 4000)), new SnapOptions("MY", 500, "min_dim_mm", "S8", null));
            double s8Width = s8.bboxes().get(0).maxX() - s8.bboxes().get(0).minX();
            long s8PreSnap = s8.adjustments().stream().filter(a -> "pre_snap".equals(a.field())).count();
            System.out.printf("§ORDER_SNAP_WITNESS case=S8_click_to_fix verdict=%s width=%.1f preSnapEntries=%d%n",
                    s8Width == 3000 && s8PreSnap == 0 ? "OK" : "WRONG", s8Width, s8PreSnap);
            assertEquals(3000, s8Width, 0.01, "S8 click-to-fix no longer reaches the required width");
            assertEquals(0, s8PreSnap, "S8 click-to-fix was flagged as a rounded-up violation");

            List<String> wrong = new ArrayList<>();
            if (s1Hidden) wrong.add("S1");
            if (!s2Rejected) wrong.add("S2");
            if (s3.pass()) wrong.add("S3");
            if (s4.payload().adjustments().isEmpty()) wrong.add("S4");
            if (!s5Rejected) wrong.add("S5");
            System.out.printf("§ORDER_SNAP_WITNESS_SUMMARY wrong=%s verdict=%s claim=snap_never_hides_out_of_tolerance_order%n",
                    wrong, wrong.isEmpty() ? "PROVED" : "DISPROVED");

            assertEquals(0, gridAdjustments(s6), "S6 NO-OP control moved something");
            assertEquals(0, s7.adjustments().size(), "S7 VACUOUS control judged something with the validator off");
            assertFalse(wrong.isEmpty(), "snap defects gone: update prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §3.4");
            assertEquals(List.of("S2", "S3", "S4", "S5"), wrong, "snap table changed: update §3.4");
        }
    }
}
