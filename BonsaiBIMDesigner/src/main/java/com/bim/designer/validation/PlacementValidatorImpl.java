package com.bim.designer.validation;

import com.bim.orm.BIMLogger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/**
 * PlacementValidatorImpl -- loads AD_Val_Rule + AD_Val_Rule_Param per jurisdiction,
 * caches rules in memory, validates PlacementRequest against them.
 *
 * <p>Rules are indexed by m_product_category_id for O(1) lookup. Rules without a
 * m_product_category_id param apply to ALL categories (stored under key "*").
 *
 * <p>Only COMPLIANCE rules with min/max threshold params are evaluated here.
 * CLASH and CLEARANCE rules require spatial queries and are out of scope.
 */
public class PlacementValidatorImpl implements PlacementValidator {

    private static final String TAG = "PlacementValidator";

    /** Cached rule with its threshold parameters. */
    record CachedRule(
            int ruleId,
            String name,
            String standardRef,
            Map<String, Double> thresholds,   // param_name -> numeric value
            Map<String, String> stringParams,  // non-numeric params (check_method, ifc_class, verdict)
            int dependsOn                     // FK to parent rule, 0 = root
    ) {
        /** Backward-compatible constructor — no stringParams. */
        CachedRule(int ruleId, String name, String standardRef,
                   Map<String, Double> thresholds, int dependsOn) {
            this(ruleId, name, standardRef, thresholds, Map.of(), dependsOn);
        }

        /** @return the check_method if present, else null */
        String checkMethod() {
            return stringParams.get("check_method");
        }

        /** @return the verdict override if present (WARN vs BLOCK), else null */
        String verdictOverride() {
            return stringParams.get("verdict");
        }
    }

    /** Wildcard key for rules that apply to all categories. */
    private static final String WILDCARD = "*";

    /** Dimension deviation ratio threshold: flag if actual/typical > MAX or < 1/MAX. */
    private static final double DIM_RANGE_RATIO = 5.0;

    /** Rules keyed by m_product_category_id (or "*" for any-category rules). */
    private Map<String, List<CachedRule>> rulesByCategory = Map.of();

    /** Mined dimension rules from ERP.db, keyed by ifc_class. */
    private Map<String, List<CachedRule>> minedRulesByClass = Map.of();

    private boolean active;
    private String jurisdiction;
    private FacilityType facilityType = FacilityType.BUILDING;

    // ── Interface implementation ─────────────────────────────────────

    @Override
    public void activate(String jurisdiction, Connection valConn) {
        activate(jurisdiction, FacilityType.BUILDING, valConn);
    }

    @Override
    public void activate(String jurisdiction, FacilityType facilityType, Connection valConn) {
        Objects.requireNonNull(jurisdiction, "jurisdiction");
        Objects.requireNonNull(facilityType, "facilityType");
        Objects.requireNonNull(valConn, "valConn");

        this.jurisdiction = jurisdiction;
        this.facilityType = facilityType;
        if (facilityType.isInfrastructure()) {
            this.rulesByCategory = loadInfraRules(facilityType.provenance(), valConn);
        } else {
            this.rulesByCategory = loadRules(jurisdiction, valConn);
        }
        this.active = true;
    }

    @Override
    public void deactivate() {
        this.active = false;
        this.jurisdiction = null;
        this.rulesByCategory = Map.of();
        this.minedRulesByClass = Map.of();
    }

    @Override
    public void activateMinedRules(Connection discConn) {
        Objects.requireNonNull(discConn, "discConn");
        this.minedRulesByClass = loadMinedRules(discConn);
        BIMLogger.info(TAG, "Loaded {} mined dimension rules across {} IFC classes",
                minedRulesByClass.values().stream().mapToInt(List::size).sum(),
                minedRulesByClass.size());
    }

    @Override
    public boolean isActive() {
        return active;
    }

    @Override
    public String getJurisdiction() {
        return jurisdiction;
    }

    @Override
    public ValidationVerdict validate(PlacementRequest request) {
        if (!active) {
            return ValidationVerdict.pass();
        }

        // Check category-specific rules first, then wildcard rules
        // Return first BLOCK immediately; collect worst WARN otherwise
        ValidationVerdict worst = ValidationVerdict.pass();

        ValidationVerdict v = checkCategory(request, request.productCategory());
        if (v.isBlocked()) return v;
        if (v.isWarning()) worst = v;

        v = checkCategory(request, WILDCARD);
        if (v.isBlocked()) return v;
        if (v.isWarning() && !worst.isWarning()) worst = v;

        // DV010: mined dimension range check (advisory only)
        v = checkDimensionRange(request);
        if (v.isWarning() && !worst.isWarning()) worst = v;

        return worst;
    }

    // ── Rule loading ─────────────────────────────────────────────────

    /**
     * Loads all active COMPLIANCE rules for a jurisdiction (building mode).
     * Excludes infrastructure rules (provenance LIKE 'Infra_%').
     * Groups them by m_product_category_id (or "*" if no category filter).
     */
    private Map<String, List<CachedRule>> loadRules(String jurisdiction, Connection conn) {
        Map<String, List<CachedRule>> result = new HashMap<>();

        // Step 1: load all active COMPLIANCE rules for this jurisdiction, excluding infra
        String ruleSQL =
                "SELECT ad_val_rule_id, name, standard_ref, "
              + "COALESCE(depends_on, 0) "
              + "FROM AD_Val_Rule "
              + "WHERE jurisdiction = ? AND is_active = 1 AND rule_type = 'COMPLIANCE' "
              + "AND provenance NOT LIKE 'Infra_%'";

        try (PreparedStatement ps = conn.prepareStatement(ruleSQL)) {
            ps.setString(1, jurisdiction);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int ruleId = rs.getInt(1);
                    String name = rs.getString(2);
                    String stdRef = rs.getString(3);
                    int dependsOn = rs.getInt(4);

                    // Step 2: load params for this rule
                    Map<String, String> allParams = loadParams(conn, ruleId);

                    // Step 3: separate m_product_category_id, thresholds, and string params
                    String category = allParams.getOrDefault("m_product_category_id", WILDCARD);
                    Map<String, Double> thresholds = new HashMap<>();
                    Map<String, String> stringParams = new HashMap<>();
                    for (var e : allParams.entrySet()) {
                        if ("m_product_category_id".equals(e.getKey())) continue;
                        if (isNumeric(e.getValue())) {
                            thresholds.put(e.getKey(), Double.parseDouble(e.getValue()));
                        } else {
                            stringParams.put(e.getKey(), e.getValue());
                        }
                    }

                    if (!thresholds.isEmpty() || !stringParams.isEmpty()) {
                        CachedRule rule = new CachedRule(ruleId, name, stdRef,
                                thresholds, stringParams, dependsOn);
                        // A rule may name several categories, e.g. BATHROOM,KITCHEN,LAUNDRY,CORRIDOR
                        for (String key : category.split(",")) {
                            result.computeIfAbsent(key.trim(), k -> new ArrayList<>()).add(rule);
                        }
                    }
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to load validation rules for " + jurisdiction, e);
        }

        return result;
    }

    /**
     * Loads active rules for an infrastructure provenance (bridge/road/rail).
     * Scoped by provenance, not jurisdiction. Infra rules use rule_types like
     * DIMENSION, MIN_COUNT, RATIO — not COMPLIANCE — so no rule_type filter.
     */
    private Map<String, List<CachedRule>> loadInfraRules(String provenance, Connection conn) {
        Map<String, List<CachedRule>> result = new HashMap<>();

        String ruleSQL =
                "SELECT ad_val_rule_id, name, standard_ref, "
              + "COALESCE(depends_on, 0) "
              + "FROM AD_Val_Rule "
              + "WHERE provenance = ? AND is_active = 1";

        try (PreparedStatement ps = conn.prepareStatement(ruleSQL)) {
            ps.setString(1, provenance);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int ruleId = rs.getInt(1);
                    String name = rs.getString(2);
                    String stdRef = rs.getString(3);
                    int dependsOn = rs.getInt(4);

                    Map<String, String> allParams = loadParams(conn, ruleId);
                    String category = allParams.getOrDefault("m_product_category_id", WILDCARD);
                    Map<String, Double> thresholds = new HashMap<>();
                    Map<String, String> stringParams = new HashMap<>();
                    for (var e : allParams.entrySet()) {
                        if ("m_product_category_id".equals(e.getKey())) continue;
                        if (isNumeric(e.getValue())) {
                            thresholds.put(e.getKey(), Double.parseDouble(e.getValue()));
                        } else {
                            stringParams.put(e.getKey(), e.getValue());
                        }
                    }

                    if (!thresholds.isEmpty() || !stringParams.isEmpty()) {
                        CachedRule rule = new CachedRule(ruleId, name, stdRef,
                                thresholds, stringParams, dependsOn);
                        result.computeIfAbsent(category, k -> new ArrayList<>()).add(rule);
                    }
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to load infra validation rules for " + provenance, e);
        }

        return result;
    }

    /**
     * Loads mined DIMENSION_RANGE rules from ERP.db (DV010).
     * Groups by ifc_class for O(1) lookup during validation.
     *
     * // Implementing DISC_VALIDATION_DB_SRS.md §DV010 — Witness: W-DV-MINED-WIRE
     */
    private Map<String, List<CachedRule>> loadMinedRules(Connection conn) {
        Map<String, List<CachedRule>> result = new HashMap<>();

        String ruleSQL =
                "SELECT ad_val_rule_id, rule_name, ifc_class, check_method, severity, description "
              + "FROM ad_val_rule WHERE is_active = 1";

        try (PreparedStatement ps = conn.prepareStatement(ruleSQL);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                int ruleId = rs.getInt(1);
                String ruleName = rs.getString(2);
                String ifcClass = rs.getString(3);
                String checkMethod = rs.getString(4);
                String severity = rs.getString(5);

                // Load params (typical_width_mm, typical_depth_mm, typical_height_mm)
                Map<String, String> allParams = loadMinedParams(conn, ruleId);
                Map<String, Double> thresholds = new HashMap<>();
                for (var e : allParams.entrySet()) {
                    if (isNumeric(e.getValue())) {
                        thresholds.put(e.getKey(), Double.parseDouble(e.getValue()));
                    }
                }

                Map<String, String> stringParams = new HashMap<>();
                stringParams.put("check_method", checkMethod);
                if (severity != null) stringParams.put("verdict", severity.equals("BLOCK") ? "BLOCK" : "WARN");

                if (!thresholds.isEmpty()) {
                    CachedRule rule = new CachedRule(ruleId, ruleName, null,
                            thresholds, stringParams, 0);
                    result.computeIfAbsent(ifcClass, k -> new ArrayList<>()).add(rule);
                }
            }
        } catch (SQLException e) {
            BIMLogger.warn(TAG, "Failed to load mined rules from ERP.db: {}", e.getMessage());
            return Map.of();
        }

        return result;
    }

    private Map<String, String> loadMinedParams(Connection conn, int ruleId) throws SQLException {
        Map<String, String> params = new LinkedHashMap<>();
        String sql = "SELECT param_name, param_value FROM ad_val_rule_param WHERE ad_val_rule_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, ruleId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    params.put(rs.getString(1), rs.getString(2));
                }
            }
        }
        return params;
    }

    private Map<String, String> loadParams(Connection conn, int ruleId) throws SQLException {
        Map<String, String> params = new LinkedHashMap<>();
        String sql = "SELECT name, value FROM AD_Val_Rule_Param WHERE ad_val_rule_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, ruleId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    params.put(rs.getString(1), rs.getString(2));
                }
            }
        }
        return params;
    }

    // ── Validation logic ─────────────────────────────────────────────

    private ValidationVerdict checkCategory(PlacementRequest req, String categoryKey) {
        List<CachedRule> rules = rulesByCategory.get(categoryKey);
        if (rules == null) return ValidationVerdict.pass();

        for (CachedRule rule : rules) {
            // DV-F-01: check_method dispatch — if present, use named evaluator
            String checkMethod = rule.checkMethod();
            if (checkMethod != null) {
                ValidationVerdict v = dispatchCheckMethod(checkMethod, rule, req);
                if (v != null && (v.isBlocked() || v.isWarning())) return v;
                continue;  // check_method handled this rule entirely
            }

            // Fallback: threshold comparison (existing logic)
            for (var entry : rule.thresholds.entrySet()) {
                String paramName = entry.getKey();
                double required = entry.getValue();

                Double actual = extractActual(req, paramName);
                if (actual == null) continue; // param not applicable to this request type

                if (actual < required) {
                    return makeVerdict(rule, paramName, actual, required);
                }
            }
        }
        return ValidationVerdict.pass();
    }

    // ── check_method dispatch (DV-F-01) ──────────────────────────────

    /**
     * Dispatch to named check_method evaluator.
     * Returns null if the check_method is not applicable to single-element validation
     * (batch methods like NN_CENTROID_DISTANCE are handled by validateBatch).
     *
     * // Implementing DocAction_SRS §3.1 — Witness: W-DV-CHECK-DISPATCH
     */
    private ValidationVerdict dispatchCheckMethod(String method, CachedRule rule, PlacementRequest req) {
        return switch (method) {
            // P0: Single-element check methods
            case "M_PRODUCT_CROSS_SECTION" -> checkProductCrossSection(rule, req);

            // P1: Batch methods — skip in single-element validation (handled in validateBatch)
            case "NN_CENTROID_DISTANCE",
                 "CENTRELINE_CLEARANCE",
                 "ROUTE_SEGMENT_SUM",
                 "PER_STOREY_Z_CONSISTENCY",
                 "BEAM_LENGTH_VS_BAY",
                 "CENTROID_DEPTH_VS_HOST_CENTER",
                 "AABB_PROXIMITY",
                 "TILE_VERB_FIDELITY" -> null;  // deferred to batch validation

            default -> {
                // DV-E-02: unknown check_method → log WARN, skip
                BIMLogger.warn(TAG, "Unknown check_method '{}' in rule {} — skipping",
                        method, rule.name);
                yield null;
            }
        };
    }

    /**
     * DV-F-05: M_PRODUCT_CROSS_SECTION — validate pipe/conduit diameter.
     * cross_section = MIN(width, depth) from PlacementRequest product dimensions.
     */
    private ValidationVerdict checkProductCrossSection(CachedRule rule, PlacementRequest req) {
        double crossSection = Math.min(req.widthMm(), req.depthMm());
        Double minDiameter = rule.thresholds.get("min_main_diameter_mm");
        if (minDiameter != null && crossSection < minDiameter) {
            return makeVerdict(rule, "min_main_diameter_mm", crossSection, minDiameter);
        }
        Double minBranch = rule.thresholds.get("min_branch_diameter_mm");
        if (minBranch != null && crossSection < minBranch) {
            return makeVerdict(rule, "min_branch_diameter_mm", crossSection, minBranch);
        }
        return null;  // PASS (no violation)
    }

    /**
     * Make verdict respecting verdict override (WARN vs BLOCK).
     * DV-F-11: Rules with verdict=WARN param never return BLOCK.
     */
    private ValidationVerdict makeVerdict(CachedRule rule, String paramName,
                                           double actual, double required) {
        String message = String.format("%s: %.1f < required %.1f (%s)",
                paramName, actual, required, rule.standardRef);
        if ("WARN".equals(rule.verdictOverride())) {
            return ValidationVerdict.warn(rule.name, rule.standardRef, actual, required, message);
        }
        return ValidationVerdict.block(rule.name, rule.standardRef, actual, required, message);
    }

    /**
     * Maps a rule param name to the corresponding request value.
     * Returns null if the param is not a dimension check (e.g. ifc_class filter).
     *
     * Building rules: min_area_m2, min_dim_mm, min_height_mm, min_width_mm
     * Infrastructure rules: width_mm, depth_mm, height_mm, thickness_mm
     *
     * // Implementing INFRA_DESIGNER_SRS.md §2.3 — Witness: W-INFRA-SNAP-1
     */
    private Double extractActual(PlacementRequest req, String paramName) {
        return switch (paramName) {
            // Building (existing)
            case "min_area_m2"   -> req.areaSqM();
            case "min_dim_mm"    -> req.minDimMm();
            case "min_height_mm", "height_mm" -> req.heightMm();
            case "min_width_mm", "width_mm" -> req.widthMm();
            // Infrastructure dimension checks
            case "depth_mm"      -> req.depthMm();
            case "thickness_mm"  -> req.heightMm();  // layer thickness = height of course bbox
            case "avg_width_mm"  -> req.widthMm();
            case "avg_depth_mm"  -> req.depthMm();
            case "avg_height_mm" -> req.heightMm();
            case "total_depth_mm" -> req.depthMm();
            default -> null;   // ifc_class, material, spacing, z-range, etc. not checked here
        };
    }

    /**
     * DV010: Check element dimensions against mined typical dimensions.
     * Compares request W/D/H against observed ranges for its ifc_class.
     * Returns WARN if any dimension deviates by more than DIM_RANGE_RATIO.
     * Never returns BLOCK — mined rules are advisory only.
     *
     * // Implementing DISC_VALIDATION_DB_SRS.md §DV010 — Witness: W-DV-MINED-WIRE
     */
    private ValidationVerdict checkDimensionRange(PlacementRequest req) {
        if (minedRulesByClass.isEmpty() || req.ifcClass() == null) {
            return ValidationVerdict.pass();
        }

        List<CachedRule> rules = minedRulesByClass.get(req.ifcClass());
        if (rules == null || rules.isEmpty()) {
            return ValidationVerdict.pass();
        }

        // Aggregate min/max typical across all buildings for this ifc_class
        double minW = Double.MAX_VALUE, maxW = 0;
        double minD = Double.MAX_VALUE, maxD = 0;
        double minH = Double.MAX_VALUE, maxH = 0;

        for (CachedRule rule : rules) {
            Double tw = rule.thresholds.get("typical_width_mm");
            Double td = rule.thresholds.get("typical_depth_mm");
            Double th = rule.thresholds.get("typical_height_mm");
            if (tw != null && tw > 0) { minW = Math.min(minW, tw); maxW = Math.max(maxW, tw); }
            if (td != null && td > 0) { minD = Math.min(minD, td); maxD = Math.max(maxD, td); }
            if (th != null && th > 0) { minH = Math.min(minH, th); maxH = Math.max(maxH, th); }
        }

        // Check if request dimensions are within [min/ratio, max*ratio]
        if (maxW > 0 && req.widthMm() > 0) {
            if (req.widthMm() > maxW * DIM_RANGE_RATIO || req.widthMm() < minW / DIM_RANGE_RATIO) {
                return ValidationVerdict.warn(
                        "DIMENSION_RANGE_W:" + req.ifcClass(), null,
                        req.widthMm(), maxW,
                        String.format("%s width %.0fmm outside mined range [%.0f-%.0f]mm (×%.1f tolerance)",
                                req.ifcClass(), req.widthMm(), minW, maxW, DIM_RANGE_RATIO));
            }
        }
        if (maxD > 0 && req.depthMm() > 0) {
            if (req.depthMm() > maxD * DIM_RANGE_RATIO || req.depthMm() < minD / DIM_RANGE_RATIO) {
                return ValidationVerdict.warn(
                        "DIMENSION_RANGE_D:" + req.ifcClass(), null,
                        req.depthMm(), maxD,
                        String.format("%s depth %.0fmm outside mined range [%.0f-%.0f]mm (×%.1f tolerance)",
                                req.ifcClass(), req.depthMm(), minD, maxD, DIM_RANGE_RATIO));
            }
        }
        if (maxH > 0 && req.heightMm() > 0) {
            if (req.heightMm() > maxH * DIM_RANGE_RATIO || req.heightMm() < minH / DIM_RANGE_RATIO) {
                return ValidationVerdict.warn(
                        "DIMENSION_RANGE_H:" + req.ifcClass(), null,
                        req.heightMm(), maxH,
                        String.format("%s height %.0fmm outside mined range [%.0f-%.0f]mm (×%.1f tolerance)",
                                req.ifcClass(), req.heightMm(), minH, maxH, DIM_RANGE_RATIO));
            }
        }

        return ValidationVerdict.pass();
    }

    @Override
    public int getRuleCount() {
        int compliance = (int) rulesByCategory.values().stream().flatMap(List::stream).distinct().count();
        int mined = minedRulesByClass.values().stream().mapToInt(List::size).sum();
        return compliance + mined;
    }

    @Override
    public double getMinimumForRule(String category, String paramName) {
        // Check category-specific rules, then wildcard
        double val = findMinimum(category, paramName);
        if (val >= 0) return val;
        return findMinimum(WILDCARD, paramName);
    }

    private double findMinimum(String categoryKey, String paramName) {
        List<CachedRule> rules = rulesByCategory.get(categoryKey);
        if (rules == null) return -1;
        for (CachedRule rule : rules) {
            Double threshold = rule.thresholds.get(paramName);
            if (threshold != null) return threshold;
        }
        return -1;
    }

    private static boolean isNumeric(String s) {
        try {
            Double.parseDouble(s);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    // ── Inference Engine integration ──────────────────────────────────

    /**
     * Validate all requests using the InferenceEngine (dependency-ordered).
     * Returns full rule results including SKIP for downstream failures.
     *
     * // Implementing BIM_Designer_SRS.md §19 — Witness: W-INF-DEP-1
     */
    public List<InferenceEngine.RuleResult> validateAll(List<PlacementRequest> requests) {
        if (!active || requests == null || requests.isEmpty()) {
            return List.of();
        }

        InferenceEngine engine = new InferenceEngine();
        List<InferenceEngine.RuleResult> allResults = new ArrayList<>();

        for (PlacementRequest req : requests) {
            // Gather applicable rules for this request's category
            List<InferenceEngine.CachedRuleExt> extRules = new ArrayList<>();

            // Category-specific rules
            List<CachedRule> catRules = rulesByCategory.get(req.productCategory());
            if (catRules != null) {
                for (CachedRule r : catRules) {
                    extRules.add(toExt(r));
                }
            }

            // Wildcard rules
            List<CachedRule> wildRules = rulesByCategory.get(WILDCARD);
            if (wildRules != null) {
                for (CachedRule r : wildRules) {
                    extRules.add(toExt(r));
                }
            }

            if (!extRules.isEmpty()) {
                List<InferenceEngine.RuleResult> results = engine.evaluate(extRules, req);
                allResults.addAll(results);
            }
        }

        BIMLogger.info(TAG, "validateAll: {} requests, {} total rule results",
                requests.size(), allResults.size());
        return allResults;
    }

    // ── Batch validation (spatial check_methods) ─────────────────────

    /**
     * Validate a batch of placements using spatial check_methods (DV-F-02, DV-F-03).
     * Single-element checks are NOT re-run here — use validate() for those.
     *
     * <p>Spatial checks require multiple elements on the same storey:
     * <ul>
     *   <li>NN_CENTROID_DISTANCE — nearest-neighbour for same-class elements</li>
     *   <li>CENTRELINE_CLEARANCE — cross-discipline clearance</li>
     *   <li>PER_STOREY_Z_CONSISTENCY — Z deviation for same-class per storey</li>
     * </ul>
     *
     * @param requests all elements to check (grouped internally by storey/class)
     * @return list of validation results for spatial violations only
     *
     * // Implementing DocAction_SRS §3.1 — Witness: W-DV-BATCH-1
     */
    public List<ValidationVerdict> validateBatch(List<PlacementRequest> requests) {
        if (!active || requests == null || requests.isEmpty()) {
            return List.of();
        }

        List<ValidationVerdict> results = new ArrayList<>();

        // Collect spatial rules (those with check_method params)
        List<CachedRule> spatialRules = new ArrayList<>();
        for (var entry : rulesByCategory.entrySet()) {
            for (CachedRule rule : entry.getValue()) {
                if (rule.checkMethod() != null) {
                    spatialRules.add(rule);
                }
            }
        }

        for (CachedRule rule : spatialRules) {
            String method = rule.checkMethod();
            switch (method) {
                case "NN_CENTROID_DISTANCE" -> {
                    // DV-F-02: Group by (storey, ifc_class), check NN spacing
                    String targetClass = rule.stringParams.get("ifc_class");
                    results.addAll(checkNNDistance(rule, requests, targetClass));
                }
                case "CENTRELINE_CLEARANCE" -> {
                    // DV-F-03: Cross-discipline clearance
                    String discA = rule.stringParams.get("discipline_a");
                    String discB = rule.stringParams.get("discipline_b");
                    results.addAll(checkClearance(rule, requests, discA, discB));
                }
                case "PER_STOREY_Z_CONSISTENCY" -> {
                    // DV-F-06: Z deviation per storey
                    String targetClass = rule.stringParams.get("ifc_class");
                    results.addAll(checkZConsistency(rule, requests, targetClass));
                }
                default -> {
                    // Other batch methods deferred to Phase 2+
                }
            }
        }

        BIMLogger.info(TAG, "validateBatch: {} elements, {} spatial violations",
                requests.size(), results.stream().filter(v -> !v.result().equals(ValidationVerdict.Result.PASS)).count());
        return results;
    }

    // ── Spatial check_method implementations ─────────────────────────

    /**
     * DV-F-02: NN_CENTROID_DISTANCE — nearest-neighbour distance check.
     * Groups elements by (storey, ifc_class), computes planar XY NN distance.
     */
    private List<ValidationVerdict> checkNNDistance(CachedRule rule,
            List<PlacementRequest> requests, String targetClass) {

        List<ValidationVerdict> results = new ArrayList<>();
        Double minSpacing = rule.thresholds.get("min_spacing_mm");
        Double maxSpacing = rule.thresholds.get("max_spacing_mm");

        // Group by storey
        Map<String, List<PlacementRequest>> byStorey = new HashMap<>();
        for (PlacementRequest req : requests) {
            if (targetClass != null && !targetClass.equals(req.ifcClass())) continue;
            byStorey.computeIfAbsent(req.storey(), k -> new ArrayList<>()).add(req);
        }

        for (var entry : byStorey.entrySet()) {
            List<PlacementRequest> group = entry.getValue();
            if (group.size() < 2) continue;

            for (int i = 0; i < group.size(); i++) {
                double nn = SpatialPredicates.nnDistance(group, group.get(i));
                if (minSpacing != null && nn < minSpacing) {
                    results.add(makeVerdict(rule, "min_spacing_mm", nn, minSpacing));
                } else if (maxSpacing != null && nn > maxSpacing) {
                    results.add(makeVerdict(rule, "max_spacing_mm", nn, maxSpacing));
                }
            }
        }
        return results;
    }

    /**
     * DV-F-03: CENTRELINE_CLEARANCE — cross-discipline clearance.
     * clearance = centroid_2D_dist - radius_a - radius_b.
     */
    private List<ValidationVerdict> checkClearance(CachedRule rule,
            List<PlacementRequest> requests, String discA, String discB) {

        List<ValidationVerdict> results = new ArrayList<>();
        Double minClearance = rule.thresholds.get("min_clearance_mm");
        if (minClearance == null) return results;

        // Group by storey, then filter by discipline
        Map<String, List<PlacementRequest>> byStorey = new HashMap<>();
        for (PlacementRequest req : requests) {
            if (discA != null && discB != null) {
                if (!discA.equals(req.discipline()) && !discB.equals(req.discipline())) continue;
            }
            byStorey.computeIfAbsent(req.storey(), k -> new ArrayList<>()).add(req);
        }

        for (var group : byStorey.values()) {
            for (int i = 0; i < group.size(); i++) {
                for (int j = i + 1; j < group.size(); j++) {
                    PlacementRequest a = group.get(i);
                    PlacementRequest b = group.get(j);
                    // Cross-discipline check: only check pairs across different disciplines
                    if (a.discipline() != null && a.discipline().equals(b.discipline())) continue;

                    double clearance = SpatialPredicates.centreClearance(a, b);
                    if (clearance < minClearance) {
                        results.add(makeVerdict(rule, "min_clearance_mm", clearance, minClearance));
                    }
                }
            }
        }
        return results;
    }

    /**
     * DV-F-06: PER_STOREY_Z_CONSISTENCY — Z deviation per storey for same-class elements.
     */
    private List<ValidationVerdict> checkZConsistency(CachedRule rule,
            List<PlacementRequest> requests, String targetClass) {

        List<ValidationVerdict> results = new ArrayList<>();
        Double maxDeviation = rule.thresholds.get("max_z_deviation_mm");
        if (maxDeviation == null) return results;

        // Group by (storey, ifc_class)
        Map<String, List<PlacementRequest>> byGroup = new HashMap<>();
        for (PlacementRequest req : requests) {
            if (targetClass != null && !targetClass.equals(req.ifcClass())) continue;
            String key = req.storey() + "|" + req.ifcClass();
            byGroup.computeIfAbsent(key, k -> new ArrayList<>()).add(req);
        }

        for (var group : byGroup.values()) {
            if (group.size() < 2) continue;
            double stddev = SpatialPredicates.zStdDev(group);
            if (stddev > maxDeviation) {
                results.add(makeVerdict(rule, "max_z_deviation_mm", stddev, maxDeviation));
            }
        }
        return results;
    }

    // ── CachedRule → CachedRuleExt conversion ────────────────────────

    private static InferenceEngine.CachedRuleExt toExt(CachedRule r) {
        return new InferenceEngine.CachedRuleExt(
                r.ruleId(), r.name(), r.standardRef(),
                r.thresholds(), r.stringParams(), r.dependsOn());
    }

    /**
     * Build proof tree from validateAll results.
     */
    public InferenceEngine.ProofTree buildProofTree(List<InferenceEngine.RuleResult> results) {
        return new InferenceEngine().buildProofTree(results);
    }

    /** @return the active facility type */
    public FacilityType getFacilityType() {
        return facilityType;
    }

    /**
     * Inject pre-built rules for testing (no DB needed).
     * Package-private — used only by CheckMethodDispatchTest.
     */
    void setRulesForTest(Map<String, List<CachedRule>> rules) {
        this.rulesByCategory = rules;
        this.active = true;
        this.jurisdiction = "TEST";
    }

    /**
     * Get all cached rules as flat list (for testing/inspection).
     */
    public List<CachedRule> getAllRulesFlat() {
        return rulesByCategory.values().stream().flatMap(List::stream).distinct().toList();
    }
}
