package com.bim.designer.api;

import com.bim.compiler.dsl.BuildingRegistry;
import com.bim.compiler.dsl.BuildingRegistry.BuildingEntry;
import com.bim.compiler.dsl.CompilationPipeline;
import com.bim.compiler.dsl.VerbExecutor;
import com.bim.designer.assembly.AssemblyBuilderService;
import com.bim.designer.compile.ChangeSet;
import com.bim.designer.compile.IncrementalCompiler;
import com.bim.designer.compile.RoomLayoutGenerator;
import com.bim.backoffice.dao.ChangelogDAO;
import com.bim.backoffice.dao.CostDAO;
import com.bim.backoffice.dao.FacilityMgmtDAO;
import com.bim.backoffice.dao.PortfolioDAO;
import com.bim.backoffice.dao.ScheduleDAO;
import com.bim.backoffice.dao.SustainabilityDAO;
import com.bim.backoffice.model.DesignBBox;
import com.bim.designer.dao.DesignerDAO;
import com.bim.designer.dao.DesignerDAO.BuildingTypeRow;
import com.bim.designer.dao.DesignerDAO.CategoryRow;
import com.bim.designer.dao.MEPBOMQuery;
import com.bim.designer.dao.WorkOutputDAO;
import com.bim.ormsandbox.po.MBOM;
import com.bim.ormsandbox.po.MBOMLine;
import com.bim.designer.validation.FacilityType;
import com.bim.designer.validation.GradingStrategy;
import com.bim.designer.validation.PlacementContext;
import com.bim.designer.validation.PlacementRequest;
import com.bim.designer.validation.PlacementValidator;
import com.bim.designer.validation.PlacementValidatorImpl;
import com.bim.designer.validation.TerrainSnap;
import com.bim.designer.validation.ValidationVerdict;
import com.bim.cobol.VerbContext;
import com.bim.cobol.VerbRegistry;
import com.bim.cobol.VerbResult;
import com.bim.orm.BIMLogger;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Default implementation of {@link DesignerAPI}.
 *
 * <p>Three-layer separation:
 * <ol>
 *   <li><b>API layer</b> (this class) — orchestrates requests, maps DAO rows
 *       to API records, catches exceptions, returns typed responses</li>
 *   <li><b>DAO layer</b> ({@link DesignerDAO}) — SQL queries against BOM.db,
 *       returns raw row records, never closes connections</li>
 *   <li><b>Compile layer</b> ({@link IncrementalCompiler}) — scope detection
 *       and pipeline delegation</li>
 * </ol>
 *
 * <p>This class never reads YAML content. It delegates building discovery
 * to the DAO (which reads C_DocType) and verb dispatch to the compile layer
 * (which uses VerbRegistry). YAML restructuring cannot break this class.
 *
 * <p><b>Stub mode:</b> When the underlying pipeline is not yet wired,
 * {@link #compile} and {@link #executeVerb} return structured stub responses
 * for demo/POC purposes. The DAO queries work against any valid BOM.db —
 * including the POC schema created by {@code DesignerServerTest}.
 */
public class DesignerAPIImpl implements DesignerAPI {

    private static final Logger LOG = Logger.getLogger(DesignerAPIImpl.class.getName());
    private static final String TAG = "DesignerAPI";

    private final Connection bomConn;
    private final DesignerDAO dao;
    private final IncrementalCompiler incrementalCompiler;
    private final PlacementValidator validator;

    /** Lazily opened work_output.db connections, keyed by buildingId. */
    private final java.util.Map<String, Connection> workOutputConns = new java.util.concurrent.ConcurrentHashMap<>();

    /** Lazily initialised assembly builder (reads component_library.db). */
    private volatile AssemblyBuilderService assemblyService;

    /** Lazily opened component_library.db for 6D/7D queries. */
    private volatile Connection compLibConn;

    /** Lazily initialised changelog DAOs, keyed by buildingId. */
    private final java.util.Map<String, ChangelogDAO> changelogDaos = new java.util.concurrent.ConcurrentHashMap<>();

    /** Lazily opened ERP.db for MEP BOM queries (Click-to-Place §18.8). */
    private volatile Connection discValConn;

    /** Lazily initialised MEP BOM query (reads ad_space_type_mep_bom). */
    private volatile MEPBOMQuery mepBomQuery;

    /**
     * @param bomConn  JDBC connection to BOM.db (caller owns lifecycle)
     */
    public DesignerAPIImpl(Connection bomConn) {
        this(bomConn, new PlacementValidatorImpl());
    }

    /**
     * @param bomConn   JDBC connection to BOM.db (caller owns lifecycle)
     * @param validator PlacementValidator instance (injectable for testing)
     */
    public DesignerAPIImpl(Connection bomConn, PlacementValidator validator) {
        this.bomConn = bomConn;
        this.dao = new DesignerDAO(bomConn);
        this.incrementalCompiler = new IncrementalCompiler();
        this.validator = validator;
    }

    /**
     * Get or create a work_output.db connection for a building.
     * Lazily initialises schema on first access.
     */
    private WorkOutputDAO getWorkOutputDAO(String buildingId) throws Exception {
        Connection woConn = workOutputConns.computeIfAbsent(buildingId, id -> {
            try {
                String dbPath = WorkOutputDAO.dbPathFor(id);
                Connection c = DriverManager.getConnection("jdbc:sqlite:" + dbPath);
                WorkOutputDAO initDao = new WorkOutputDAO(c);
                initDao.initSchema();
                BIMLogger.info(TAG, "Opened work_output.db: {}", dbPath);
                return c;
            } catch (Exception e) {
                throw new RuntimeException("Failed to open work_output.db for " + id, e);
            }
        });
        return new WorkOutputDAO(woConn);
    }

    // ── Compilation ─────────────────────────────────────────────────

    // Implementing BIM_Designer_SRS.md §22 — Witness: W-COMPILE-1
    @Override
    public CompileResponse compile(CompileRequest request) {
        long t0 = System.currentTimeMillis();
        String previousBomDb = System.getProperty("bom.db");
        try {
            String bomDbPath = request.bomDbPath();

            // If BOM DB file doesn't exist or is empty, fall back to DAO-based stub
            // (supports in-memory test mode where bomDbPath is synthetic)
            File bomDbFile = new File(bomDbPath);
            if (!bomDbFile.exists() || bomDbFile.length() == 0) {
                return compileStub(request, t0);
            }

            // Set system property — pipeline internals read bom.db for connections
            System.setProperty("bom.db", bomDbPath);

            // Load BuildingEntry from the BOM DB's C_DocType
            BuildingEntry entry = loadBuildingEntry(bomDbPath, request.buildingId());
            if (entry == null) {
                return CompileResponse.failure("Unknown building in BOM DB: " + request.buildingId());
            }

            // Ensure output directory exists
            String outputDir = request.outputDir();
            if (outputDir != null && !outputDir.isBlank()) {
                new File(outputDir).mkdirs();
            }

            LOG.info(() -> String.format("COMPILE %s from %s [%s/%s] ...",
                    request.buildingId(), bomDbPath,
                    entry.mProductCategoryId(), entry.docSubType()));

            // Run the real 9-stage compilation pipeline
            CompilationPipeline.PipelineResult result = CompilationPipeline.run(entry);

            long elapsed = System.currentTimeMillis() - t0;
            LOG.info(() -> String.format("COMPILE %s → %d elements in %dms, digest=%s",
                    request.buildingId(), result.elementCount(), elapsed,
                    result.spatialDigest() != null
                            ? result.spatialDigest().substring(0, Math.min(16, result.spatialDigest().length())) + "..."
                            : "null"));

            return CompileResponse.success(
                    result.elementCount(),
                    elapsed,
                    entry.outputDbPath(),
                    result.spatialDigest()
            );
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Compile failed for " + request.buildingId(), e);
            return CompileResponse.failure(e.getMessage());
        } finally {
            // Restore previous bom.db property
            if (previousBomDb != null) {
                System.setProperty("bom.db", previousBomDb);
            } else {
                System.clearProperty("bom.db");
            }
        }
    }

    /**
     * Load a BuildingEntry directly from a BOM DB file, bypassing BuildingRegistry's
     * cached static DB_PATH. This allows compile() to work with any BOM DB path
     * without depending on when BuildingRegistry was class-loaded.
     */
    private static BuildingEntry loadBuildingEntry(String bomDbPath, String buildingId) {
        String sql = """
                SELECT d.Value AS C_DocType_ID, d.ProjectName, d.Name,
                       mpc.Value AS MProductCategoryId,
                       COALESCE(d.doc_sub_type, b.doc_sub_type) AS DocSubType,
                       d.OutputDbPath, d.ReferenceDbPath, d.IsActive, d.SeqNo,
                       d.ExpectedElements, d.Provenance, d.Description,
                       d.GeometryFailThreshold,
                       COALESCE(b.aabb_width_mm, 0) AS AabbWidthMm,
                       COALESCE(b.aabb_depth_mm, 0) AS AabbDepthMm,
                       COALESCE(b.aabb_height_mm, 0) AS AabbHeightMm,
                       NULL AS Jurisdiction, NULL AS CodeEdition
                -- Implementing DISC_VALIDATION_DB_SRS.md §10.4.5 — Witness: W-TREE-1
                FROM C_DocType d
                LEFT JOIN m_bom b ON b.doc_sub_type = d.doc_sub_type
                  AND b.bom_id NOT IN (SELECT child_product_id FROM m_bom_line WHERE is_active = 1) AND b.is_active = 1
                LEFT JOIN M_Product_Category mpc ON b.m_product_category_id = mpc.M_Product_Category_ID
                WHERE d.ProjectName = ?
                """;
        try (Connection conn = DriverManager.getConnection("jdbc:sqlite:" + bomDbPath);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, buildingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new BuildingEntry(
                            rs.getString("C_DocType_ID"),
                            rs.getString("ProjectName"),
                            rs.getString("Name"),
                            rs.getString("MProductCategoryId"),
                            rs.getString("DocSubType"),
                            rs.getString("OutputDbPath"),
                            rs.getString("ReferenceDbPath"),
                            rs.getInt("IsActive") == 1,
                            rs.getInt("SeqNo"),
                            rs.getInt("ExpectedElements"),
                            rs.getString("Provenance"),
                            rs.getString("Description"),
                            rs.getInt("GeometryFailThreshold"),
                            rs.getDouble("AabbWidthMm"),
                            rs.getDouble("AabbDepthMm"),
                            rs.getDouble("AabbHeightMm"),
                            rs.getString("Jurisdiction"),
                            rs.getString("CodeEdition")
                    );
                }
            }
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to load BuildingEntry from " + bomDbPath, e);
        }
        return null;
    }

    /**
     * Stub compile for test mode — returns DAO-based response when BOM DB file
     * doesn't exist on disk (e.g., in-memory test with StubDataSeeder).
     */
    private CompileResponse compileStub(CompileRequest request, long t0) {
        try {
            BuildingTypeRow bt = dao.getBuildingType(request.buildingId());
            if (bt == null) {
                return CompileResponse.failure("Unknown building: " + request.buildingId());
            }
            long elapsed = System.currentTimeMillis() - t0;
            LOG.info(() -> String.format("COMPILE %s → %d elements (stub) in %dms",
                    request.buildingId(), bt.expectedElements(), elapsed));
            return CompileResponse.success(
                    bt.expectedElements(),
                    elapsed,
                    request.outputDir() + bt.projectName().toLowerCase() + ".db",
                    "stub-digest-" + bt.projectName()
            );
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Compile stub failed", e);
            return CompileResponse.failure(e.getMessage());
        }
    }

    @Override
    public CompileResponse compileIncremental(CompileRequest request, ChangeSet changes) {
        CompileResponse scoped = incrementalCompiler.compile(request, changes);
        if (scoped != null) return scoped;
        // Sentinel null = fall back to full compile
        return compile(request);
    }

    // ── Create new building ───────────────────────────────────────────

    @Override
    public CreateNewResponse createNew(CreateNewRequest request) {
        long t0 = System.currentTimeMillis();
        try {
            LOG.info(() -> String.format(
                    "CREATE_NEW name=%s type=%s jurisdiction=%s site=%.0fx%.0f rooms=%dBR+%dBT storeys=%d",
                    request.buildingName(), request.buildingType(), request.jurisdiction(),
                    request.siteWidthMm(), request.siteDepthMm(),
                    request.numBedrooms(), request.numBathrooms(), request.storeys()));

            var bboxes = RoomLayoutGenerator.generate(request);

            // Estimate element count: per room = ~7 elements (4 walls + slab + door + window)
            long roomCount = bboxes.stream().filter(b -> "ROOM".equals(b.bomType())).count();
            int estimatedElements = (int) roomCount * 7;

            long elapsed = System.currentTimeMillis() - t0;

            LOG.info(() -> String.format(
                    "CREATE_NEW → %d bboxes (%d rooms, ~%d elements) in %dms",
                    bboxes.size(), roomCount, estimatedElements, elapsed));

            return CreateNewResponse.success(
                    estimatedElements,
                    elapsed,
                    "layout-" + request.buildingName().replaceAll("\\s+", "_"),
                    bboxes
            );
        } catch (Exception e) {
            LOG.log(Level.WARNING, "createNew failed", e);
            return CreateNewResponse.failure(e.getMessage());
        }
    }

    // ── Selection Cascade — Room Auto-Suggest (BBC.md §3.5) ──────────

    // Implementing GENERATIVE_ROOM_SRS.md §3 — Witness: W-GEN-1
    @Override
    public SuggestRoomContentsResponse suggestRoomContents(List<DesignBBox> rooms) {
        try {
            List<RoomSuggestion> suggestions = new ArrayList<>();
            int matched = 0;
            int totalRooms = 0;

            for (DesignBBox room : rooms) {
                if (!"ROOM".equals(room.bomType()) || room.category() == null) continue;
                totalRooms++;

                int slotW = (int) (room.maxX() - room.minX());
                int slotD = (int) (room.maxY() - room.minY());
                int slotH = (int) (room.maxZ() - room.minZ());

                var matches = dao.findMatchingSets(room.category(), slotW, slotD, slotH);

                if (!matches.isEmpty()) {
                    var best = matches.get(0);
                    suggestions.add(new RoomSuggestion(
                            room.bomId(), room.category(),
                            best.bomId(), best.bomName(),
                            best.childCount(), matches.size()));
                    matched++;
                    LOG.info(() -> String.format("SUGGEST %s → %s (%d children, %d candidates)",
                            room.category(), best.bomId(), best.childCount(), matches.size()));
                } else {
                    suggestions.add(new RoomSuggestion(
                            room.bomId(), room.category(),
                            null, null, 0, 0));
                    LOG.info(() -> String.format("SUGGEST %s → NO MATCH (manual selection required)",
                            room.category()));
                }
            }

            return new SuggestRoomContentsResponse(true, suggestions, matched, totalRooms, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "suggestRoomContents failed", e);
            return new SuggestRoomContentsResponse(false, List.of(), 0, 0, e.getMessage());
        }
    }

    // ── Auto-Populate + ASI Authoring (BIM_Designer_SRS.md §28) ────

    // Implementing BIM_Designer_SRS.md §28.3 — Witness: W-ASI-AUTO-1
    @Override
    public AutoPopulateResponse autoPopulate(String buildingId, List<DesignBBox> rooms) {
        try {
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            woDao.initASISchema();

            int roomsFilled = 0;
            int linesCreated = 0;
            int asiCreated = 0;
            List<String> warnings = new ArrayList<>();

            for (DesignBBox room : rooms) {
                if (!"ROOM".equals(room.bomType()) || room.category() == null) continue;

                int slotW = (int) (room.maxX() - room.minX());
                int slotD = (int) (room.maxY() - room.minY());
                int slotH = (int) (room.maxZ() - room.minZ());

                // Step 3: Selection Cascade — find best-matching SET BOM
                var matches = dao.findMatchingSets(room.category(), slotW, slotD, slotH);
                if (matches.isEmpty()) {
                    warnings.add(room.category() + ": no matching SET BOM found");
                    continue;
                }

                var bestSet = matches.get(0);
                roomsFilled++;

                // Expand SET children → C_OrderLine per element
                var setChildren = dao.getBomLines(bestSet.bomId());

                for (var child : setChildren) {
                    if ("PHANTOM".equals(child.componentType())) continue;

                    // Create C_OrderLine for this element
                    DesignBBox itemBbox = new DesignBBox(
                            child.childProductId(),
                            child.childProductId(),
                            "LEAF",
                            room.category(),
                            null, null, room.bomId(),
                            room.minX() + child.dx() * 1000.0,
                            room.minY() + child.dy() * 1000.0,
                            room.minZ() + child.dz() * 1000.0,
                            room.minX() + child.dx() * 1000.0 + child.allocatedWidthMm(),
                            room.minY() + child.dy() * 1000.0 + child.allocatedDepthMm(),
                            room.minZ() + child.dz() * 1000.0 + child.allocatedHeightMm()
                    );
                    int orderLineId = woDao.insertOrderLine(buildingId, itemBbox);
                    linesCreated++;

                    // Step 4: ASI auto-computation for IsInstanceAttribute=1 products
                    String attrSetId = woDao.resolveAttributeSetForProduct(
                            child.childProductId());
                    if (woDao.isInstanceAttribute(attrSetId)) {
                        // Compute stretch factors from slot vs SET AABB
                        java.util.Map<String, String> asiValues =
                                computeASIDefaults(attrSetId, child, bestSet, slotW, slotD, slotH);
                        if (!asiValues.isEmpty()) {
                            int asiId = woDao.createASI(attrSetId, asiValues);
                            woDao.linkASI(orderLineId, asiId);
                            asiCreated++;
                        }
                    }
                }

                LOG.info(() -> String.format("AUTO_POPULATE %s → %s (%d children)",
                        room.category(), bestSet.bomId(), setChildren.size()));
            }

            BIMLogger.info(TAG, "AUTO_POPULATE {} → {} rooms, {} lines, {} ASIs",
                    buildingId, roomsFilled, linesCreated, asiCreated);

            return new AutoPopulateResponse(true, roomsFilled, linesCreated,
                    asiCreated, warnings, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "autoPopulate failed", e);
            return new AutoPopulateResponse(false, 0, 0, 0, List.of(), e.getMessage());
        }
    }

    /**
     * Compute default ASI values based on product type and room dimensions.
     * BBC.md §3.5.1: stretch walls to room width, pipes to run length, etc.
     */
    private java.util.Map<String, String> computeASIDefaults(
            String attrSetId,
            DesignerDAO.BomLineRow child,
            DesignerDAO.SetMatchRow set,
            int slotW, int slotD, int slotH) {

        var values = new java.util.LinkedHashMap<String, String>();
        double scaleW = set.aabbWidthMm() > 0 ? (double) slotW / set.aabbWidthMm() : 1.0;
        double scaleD = set.aabbDepthMm() > 0 ? (double) slotD / set.aabbDepthMm() : 1.0;
        double scaleH = set.aabbHeightMm() > 0 ? (double) slotH / set.aabbHeightMm() : 1.0;

        switch (attrSetId) {
            case "BIM_Wall" -> {
                // Walls stretch along their longest allocated dimension
                int allocW = child.allocatedWidthMm();
                int allocD = child.allocatedDepthMm();
                if (allocW >= allocD) {
                    values.put("length_mm", String.valueOf((int) (allocW * scaleW)));
                } else {
                    values.put("length_mm", String.valueOf((int) (allocD * scaleD)));
                }
                values.put("height_mm", String.valueOf((int) (child.allocatedHeightMm() * scaleH)));
            }
            case "BIM_Pipe", "BIM_Conduit", "BIM_Duct" -> {
                int allocW = child.allocatedWidthMm();
                int allocD = child.allocatedDepthMm();
                int runLength = (int) (Math.max(allocW, allocD) * Math.max(scaleW, scaleD));
                values.put("length_mm", String.valueOf(runLength));
            }
            case "BIM_Slab" -> {
                double areaM2 = (slotW / 1000.0) * (slotD / 1000.0);
                values.put("area_m2", String.format("%.2f", areaM2));
            }
            case "BIM_Beam" -> {
                values.put("span_mm", String.valueOf(slotW));
            }
            case "BIM_Column" -> {
                values.put("height_mm", String.valueOf(slotH));
            }
            case "BIM_Door" -> {
                values.put("swing_side", "1");
                values.put("face_anchor", "INT");
            }
            case "BIM_Window" -> {
                values.put("sill_height_mm", "900");
                values.put("face_anchor", "EXT");
            }
            default -> { /* BIM_Component, BIM_Fitting — no ASI */ }
        }
        return values;
    }

    // Implementing BIM_Designer_SRS.md §28.8 — Witness: W-ASI-READ-1
    @Override
    public ASIResponse readASI(String buildingId, int orderLineId) {
        try {
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            woDao.initASISchema();

            int asiId = woDao.getASIForOrderLine(orderLineId);
            if (asiId < 0) {
                // No ASI — determine if this product type even needs one
                WorkOutputDAO.OrderLineRow line = woDao.getOrderLine(orderLineId);
                if (line == null) {
                    return new ASIResponse(false, orderLineId, null, false,
                            List.of(), "OrderLine not found");
                }
                String attrSetId = woDao.resolveAttributeSetForProduct(line.familyRef());
                boolean isInstance = woDao.isInstanceAttribute(attrSetId);
                return new ASIResponse(true, orderLineId, attrSetId, isInstance,
                        List.of(), null);
            }

            var fields = woDao.readASI(asiId);
            if (fields.isEmpty()) {
                return new ASIResponse(true, orderLineId, null, false,
                        List.of(), null);
            }

            String setName = fields.get(0).attributeSetName();
            boolean isInstance = fields.get(0).isInstanceAttribute();
            List<ASIField> apiFields = fields.stream()
                    .map(f -> new ASIField(f.name(), f.value(), f.valueType(), true))
                    .toList();

            return new ASIResponse(true, orderLineId, setName, isInstance,
                    apiFields, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "readASI failed", e);
            return new ASIResponse(false, orderLineId, null, false,
                    List.of(), e.getMessage());
        }
    }

    // Implementing BIM_Designer_SRS.md §28.8 — Witness: W-ASI-EDIT-1
    @Override
    public ASIResponse updateASI(String buildingId, int orderLineId,
                                  String attributeName, String value) {
        try {
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            woDao.initASISchema();

            int asiId = woDao.getASIForOrderLine(orderLineId);
            if (asiId < 0) {
                // No ASI yet — create one from the product's attribute set template
                WorkOutputDAO.OrderLineRow line = woDao.getOrderLine(orderLineId);
                if (line == null) {
                    return new ASIResponse(false, orderLineId, null, false,
                            List.of(), "OrderLine not found");
                }
                String attrSetId = woDao.resolveAttributeSetForProduct(line.familyRef());
                var initialValues = new java.util.LinkedHashMap<String, String>();
                initialValues.put(attributeName, value);
                asiId = woDao.createASI(attrSetId, initialValues);
                woDao.linkASI(orderLineId, asiId);
            } else {
                woDao.updateASIAttribute(asiId, attributeName, value);
            }

            // Return fresh state
            return readASI(buildingId, orderLineId);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "updateASI failed", e);
            return new ASIResponse(false, orderLineId, null, false,
                    List.of(), e.getMessage());
        }
    }

    // ── Building discovery (YAML-opaque — reads C_DocType via DAO) ──

    // Implementing INFRA_DESIGNER_SRS.md §0.1 — Witness: W-INFRA-LIST-1
    @Override
    public List<BuildingTypeInfo> listBuildingTypes() {
        try {
            return dao.listBuildingTypes().stream()
                    .map(r -> new BuildingTypeInfo(
                            r.docTypeId(), r.name(), r.docSubType(),
                            r.expectedElements(),
                            r.aabbWidthMm(), r.aabbDepthMm(), r.aabbHeightMm(),
                            deriveFacilityType(r.mProductCategoryId(), r.docSubType())
                    ))
                    .toList();
        } catch (Exception e) {
            LOG.log(Level.WARNING, "listBuildingTypes failed", e);
            return List.of();
        }
    }

    /**
     * Map M_Product_Category + doc_sub_type to FacilityType string for the API.
     * IN = infrastructure — derive specific type from doc_sub_type (BR/RD/RL).
     * All others = null (BUILDING default).
     *
     * // Implementing INFRA_DESIGNER_SRS.md §0.1
     */
    static String deriveFacilityType(String mProductCategoryId, String docSubType) {
        if (!"IN".equals(mProductCategoryId)) return null;  // null = BUILDING
        if (docSubType == null) return "BRIDGE";      // safe default for infra
        return switch (docSubType) {
            case "BR" -> "BRIDGE";
            case "RD" -> "ROAD";
            case "RL" -> "RAILWAY";
            default   -> "BRIDGE";  // unknown infra subtype → default
        };
    }

    @Override
    public List<CategoryInfo> listCategories(String docSubType) {
        try {
            return dao.listCategories(docSubType).stream()
                    .map(r -> new CategoryInfo(r.categoryName(), r.bomType(), r.bomCount()))
                    .toList();
        } catch (Exception e) {
            LOG.log(Level.WARNING, "listCategories failed", e);
            return List.of();
        }
    }

    // Implementing INFRA_DESIGNER_SRS.md §0.2 — Witness: W-INFRA-SEG-1
    @Override
    public List<SegmentInfo> listSegments(String buildingBomId) {
        try {
            return dao.listSegments(buildingBomId).stream()
                    .map(r -> new SegmentInfo(
                            r.bomId(), r.name(), r.productCategory(),
                            r.elementCount(), r.disciplines()))
                    .toList();
        } catch (Exception e) {
            LOG.log(Level.WARNING, "listSegments failed for " + buildingBomId, e);
            return List.of();
        }
    }

    @Override
    public List<FacilityTypeInfo> listFacilityTypes() {
        List<FacilityTypeInfo> result = new ArrayList<>();
        for (FacilityType ft : FacilityType.values()) {
            result.add(new FacilityTypeInfo(ft.name(), ft.isInfrastructure(), ft.provenance()));
        }
        return result;
    }

    // ── FL-2: Flywheel Advisory Panel (§27) ─────────────────────────
    // Implementing BIM_Designer_SRS.md §27 — Witness: W-FL-ADVISORY-1

    @Override
    public ListAdvisoriesResponse listAdvisories(String buildingId) {
        try {
            Connection dvConn = getDiscValidationConn();
            if (dvConn == null) {
                return new ListAdvisoriesResponse(false, List.of(), 0, 0, 0,
                        "ERP.db not available");
            }

            // Resolve building_type from buildingId (C_DocType lookup)
            String buildingType = dao.resolveBuildingType(buildingId);
            if (buildingType == null) {
                buildingType = buildingId; // fallback: treat as building_type directly
            }

            String sql = "SELECT advisory_id, building_type, element_ref, layer, severity, "
                       + "rule_name, message, actual_value, expected_min, expected_max, suggestion "
                       + "FROM W_Validation_Advisory WHERE building_type = ? ORDER BY advisory_id";

            List<Advisory> advisories = new ArrayList<>();
            int info = 0, warning = 0, suggestion = 0;

            try (PreparedStatement ps = dvConn.prepareStatement(sql)) {
                ps.setString(1, buildingType);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        String sev = rs.getString("severity");
                        switch (sev) {
                            case "INFO" -> info++;
                            case "WARNING" -> warning++;
                            case "SUGGESTION" -> suggestion++;
                        }
                        advisories.add(new Advisory(
                                rs.getInt("advisory_id"),
                                rs.getString("building_type"),
                                rs.getString("element_ref"),
                                rs.getString("layer"),
                                sev,
                                rs.getString("rule_name"),
                                rs.getString("message"),
                                rs.getObject("actual_value") != null ? rs.getDouble("actual_value") : null,
                                rs.getObject("expected_min") != null ? rs.getDouble("expected_min") : null,
                                rs.getObject("expected_max") != null ? rs.getDouble("expected_max") : null,
                                rs.getString("suggestion")));
                    }
                }
            }

            return new ListAdvisoriesResponse(true, advisories, info, warning, suggestion, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "listAdvisories failed", e);
            return new ListAdvisoriesResponse(false, List.of(), 0, 0, 0, e.getMessage());
        }
    }

    /**
     * Get or lazily open ERP.db connection.
     * Reuses existing discValConn if already opened by getMEPBOMQuery().
     */
    private Connection getDiscValidationConn() {
        if (discValConn != null) return discValConn;
        synchronized (this) {
            if (discValConn != null) return discValConn;
            try {
                String dbPath = "library/ERP.db";
                if (!new File(dbPath).exists()) {
                    BIMLogger.warn(TAG, "ERP.db not found at {}", dbPath);
                    return null;
                }
                discValConn = DriverManager.getConnection("jdbc:sqlite:" + dbPath);
                BIMLogger.info(TAG, "Opened ERP.db for advisory queries");
                return discValConn;
            } catch (Exception e) {
                BIMLogger.warn(TAG, "Failed to open ERP.db: {}", e.getMessage());
                return null;
            }
        }
    }

    // ── FL-3 prep: suggestDimensions (§27, FL-F-05) ─────────────────
    // Implementing BIM_Designer_SRS.md §27, FL-F-05 — Witness: W-FL-CALIBRATE-1

    @Override
    public SuggestDimensionsResponse suggestDimensions(String ifcClass) {
        try {
            Connection dvConn = getDiscValidationConn();
            if (dvConn == null || ifcClass == null || ifcClass.isBlank()) {
                return new SuggestDimensionsResponse(true, ifcClass,
                        0, 0, 0, 0, 0, 0, 0, List.of(), null);
            }

            // Aggregate mined typical W/D/H from ad_val_rule + ad_val_rule_param
            String sql =
                    "SELECT p.param_name, CAST(p.param_value AS REAL) "
                  + "FROM ad_val_rule r "
                  + "JOIN ad_val_rule_param p ON p.ad_val_rule_id = r.ad_val_rule_id "
                  + "WHERE r.is_active = 1 AND r.check_method = 'DIMENSION_RANGE' "
                  + "AND r.ifc_class = ?";

            double minW = Double.MAX_VALUE, maxW = 0;
            double minD = Double.MAX_VALUE, maxD = 0;
            double minH = Double.MAX_VALUE, maxH = 0;
            int observations = 0;

            try (PreparedStatement ps = dvConn.prepareStatement(sql)) {
                ps.setString(1, ifcClass);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        String param = rs.getString(1);
                        double val = rs.getDouble(2);
                        if (val <= 0) continue;
                        observations++;
                        switch (param) {
                            case "typical_width_mm"  -> { minW = Math.min(minW, val); maxW = Math.max(maxW, val); }
                            case "typical_depth_mm"  -> { minD = Math.min(minD, val); maxD = Math.max(maxD, val); }
                            case "typical_height_mm" -> { minH = Math.min(minH, val); maxH = Math.max(maxH, val); }
                        }
                    }
                }
            }

            if (observations == 0) {
                return new SuggestDimensionsResponse(true, ifcClass,
                        0, 0, 0, 0, 0, 0, 0, List.of(), null);
            }

            // Fix sentinel values
            if (minW == Double.MAX_VALUE) minW = 0;
            if (minD == Double.MAX_VALUE) minD = 0;
            if (minH == Double.MAX_VALUE) minH = 0;

            // Find nearest M_Products from component_library.db
            List<NearestProduct> products = List.of();
            try {
                Connection libConn = getCompLibConn();
                double midW = (minW + maxW) / 2.0;
                double midD = (minD + maxD) / 2.0;
                double midH = (minH + maxH) / 2.0;

                String prodSql =
                        "SELECT m.value AS product_id, m.name, "
                      + "cd.allocated_width_mm, cd.allocated_depth_mm, cd.allocated_height_mm "
                      + "FROM M_Product m "
                      + "JOIN component_definitions cd ON cd.m_product_id = m.m_product_id "
                      + "WHERE cd.allocated_width_mm BETWEEN ? AND ? "
                      + "AND cd.allocated_depth_mm BETWEEN ? AND ? "
                      + "AND cd.allocated_height_mm BETWEEN ? AND ? "
                      + "ORDER BY ABS(cd.allocated_width_mm - ?) + ABS(cd.allocated_depth_mm - ?) "
                      + "+ ABS(cd.allocated_height_mm - ?) "
                      + "LIMIT 5";

                List<NearestProduct> prods = new ArrayList<>();
                try (PreparedStatement ps = libConn.prepareStatement(prodSql)) {
                    ps.setDouble(1, minW * 0.5);
                    ps.setDouble(2, maxW * 2.0);
                    ps.setDouble(3, minD * 0.5);
                    ps.setDouble(4, maxD * 2.0);
                    ps.setDouble(5, minH * 0.5);
                    ps.setDouble(6, maxH * 2.0);
                    ps.setDouble(7, midW);
                    ps.setDouble(8, midD);
                    ps.setDouble(9, midH);
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            prods.add(new NearestProduct(
                                    rs.getString("product_id"),
                                    rs.getString("name"),
                                    rs.getDouble("allocated_width_mm"),
                                    rs.getDouble("allocated_depth_mm"),
                                    rs.getDouble("allocated_height_mm")));
                        }
                    }
                }
                products = prods;
            } catch (Exception e) {
                BIMLogger.warn(TAG, "Product lookup for suggestDimensions skipped: {}", e.getMessage());
            }

            return new SuggestDimensionsResponse(true, ifcClass,
                    minW, maxW, minD, maxD, minH, maxH,
                    observations, products, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "suggestDimensions failed", e);
            return new SuggestDimensionsResponse(false, ifcClass,
                    0, 0, 0, 0, 0, 0, 0, List.of(), e.getMessage());
        }
    }

    // ── Design Mode — Snap + Validate (§17.10) ────────────────────

    // Implementing BBC.md §4, BIM_Designer_SRS.md §17, CORE_SRS.md §3.1
    // Witness: W-SNAP-1, W-SNAP-FIX-1, W-INFRA-UI-FILTER
    @Override
    public SnapResponse snap(java.util.List<DesignBBox> bboxes, SnapOptions options) {
        long t0 = System.currentTimeMillis();
        try {
            String jurisdiction = options.jurisdiction();
            int gridMm = options.gridMm();
            String fixRule = options.fixRule();
            String fixBomId = options.fixBomId();
            String facilityType = options.facilityType();
            PlacementContext terrainCtx = options.terrainContext();
            TerrainSnap terrainSnap = options.terrainSnap();
            GradingStrategy grading = options.gradingStrategy();

            BIMLogger.info(TAG, "SNAP {} bboxes, jurisdiction={}, grid={}mm, fixRule={}, fixBomId={}, facility={}, terrain={}, grading={}",
                    bboxes.size(), jurisdiction, gridMm, fixRule, fixBomId, facilityType,
                    terrainCtx != null ? terrainCtx.contextType() : "none",
                    grading != null ? grading : "contour(default)");

            // Activate facility-type-scoped rules if specified
            if (facilityType != null) {
                activateForFacilityType(jurisdiction, facilityType);
            }

            // Click-to-fix: pre-process target bbox if fixRule and fixBomId are set
            List<DesignBBox> inputBboxes = bboxes;
            if (fixRule != null && fixBomId != null && validator.isActive()) {
                inputBboxes = applyClickToFix(bboxes, fixRule, fixBomId, gridMm);
            }

            List<DesignBBox> adjusted = new ArrayList<>(inputBboxes.size());
            List<Adjustment> adjustments = new ArrayList<>();

            for (DesignBBox bb : inputBboxes) {
                // Validate ROOM (building), SEGMENT, LEAF (infrastructure) bomTypes
                // Implementing INFRA_DESIGNER_SRS.md §2.2 — Witness: W-INFRA-SNAP-1
                if (!"ROOM".equals(bb.bomType())
                        && !"SEGMENT".equals(bb.bomType())
                        && !"LEAF".equals(bb.bomType())) {
                    adjusted.add(bb);
                    continue;
                }

                double w = bb.maxX() - bb.minX();
                double d = bb.maxY() - bb.minY();
                double h = bb.maxZ() - bb.minZ();
                final double submittedW = w;
                final double submittedD = d;

                // Grid snap
                if (gridMm > 0) {
                    double snappedW = Math.round(w / gridMm) * gridMm;
                    double snappedD = Math.round(d / gridMm) * gridMm;
                    if (snappedW != w) {
                        adjustments.add(new Adjustment(bb.bomId(), "GRID_SNAP", "width",
                                w, snappedW));
                        w = snappedW;
                    }
                    if (snappedD != d) {
                        adjustments.add(new Adjustment(bb.bomId(), "GRID_SNAP", "depth",
                                d, snappedD));
                        d = snappedD;
                    }
                }

                // Terrain Z adjustment — snap bbox to terrain surface
                // GradingStrategy controls design Z: CONTOUR follows terrain,
                // STRAIGHT uses fixed level, BLEND interpolates between them.
                // Default (null grading) = CONTOUR (follow terrain exactly).
                // Implementing INFRA_DESIGNER_SRS.md §I-4+§6 — Witness: W-SNAP-TERRAIN-1
                double minZ = bb.minZ();
                if (terrainCtx != null && terrainSnap != null) {
                    double centreX = (bb.minX() + bb.minX() + w) / 2.0;
                    double centreY = (bb.minY() + bb.minY() + d) / 2.0;

                    // Apply grading strategy to modify the terrain context's Z
                    double terrainZ = terrainCtx.elevationAt(centreX, centreY);
                    double designZ = (grading != null)
                            ? grading.designZAt(terrainZ)
                            : terrainZ;  // null grading = pure contour

                    // TerrainSnap computes final Z from design elevation
                    // (ON_SURFACE adds offset, ABOVE adds clearance, etc.)
                    double newBaseZ = switch (terrainSnap.mode()) {
                        case ON_SURFACE -> designZ + terrainSnap.offsetMm();
                        case ABOVE      -> designZ + terrainSnap.offsetMm();
                        case BELOW      -> designZ - terrainSnap.offsetMm() - h;
                        case PIER       -> designZ;
                    };

                    if (Math.abs(newBaseZ - minZ) > 0.1) {
                        adjustments.add(new Adjustment(bb.bomId(), "TERRAIN_Z", "minZ",
                                minZ, newBaseZ));
                    }
                    minZ = newBaseZ;
                }

                // PlacementValidator check
                if (validator.isActive()) {
                    PlacementRequest req = new PlacementRequest(
                            bb.category(), bb.ifcClass(), null,
                            w, d, h,
                            bb.minX(), bb.minY(), minZ,
                            "SNAP", 0, bb.storey());

                    ValidationVerdict verdict = validator.validate(req);
                    if (verdict.isBlocked()) {
                        // Report the violation as an adjustment (delta display: UX-F-19)
                        adjustments.add(new Adjustment(bb.bomId(),
                                verdict.ruleName(), "min_dim",
                                verdict.actualValue(), verdict.requiredValue()));

                        BIMLogger.warn(TAG, "SNAP BLOCK {}: {} ({:.0f} < {:.0f})",
                                bb.bomId(), verdict.ruleName(),
                                verdict.actualValue(), verdict.requiredValue());
                    } else if (submittedW != w || submittedD != d) {
                        // prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §6.2 — rounding must not hide a submitted size that broke a rule.
                        ValidationVerdict submitted = validator.validate(new PlacementRequest(
                                bb.category(), bb.ifcClass(), null,
                                submittedW, submittedD, h,
                                bb.minX(), bb.minY(), minZ,
                                "SNAP", 0, bb.storey()));
                        if (submitted.isBlocked()) {
                            adjustments.add(new Adjustment(bb.bomId(),
                                    submitted.ruleName(), "pre_snap",
                                    submitted.actualValue(), submitted.requiredValue()));
                            BIMLogger.warn(TAG, "§SNAP_ROUNDED_PAST_RULE {}: {} submitted {} required {}",
                                    bb.bomId(), submitted.ruleName(),
                                    submitted.actualValue(), submitted.requiredValue());
                        }
                    }
                }

                adjusted.add(new DesignBBox(
                        bb.bomId(), bb.name(), bb.bomType(), bb.category(),
                        bb.ifcClass(), bb.storey(), bb.parentBomId(),
                        bb.minX(), bb.minY(), minZ,
                        bb.minX() + w, bb.minY() + d, minZ + h));
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "SNAP complete: {} adjustments in {}ms",
                    adjustments.size(), elapsed);

            return new SnapResponse(true, adjusted, adjustments, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Snap failed", e);
            BIMLogger.error(TAG, "SNAP failed: {}", e.getMessage());
            return new SnapResponse(false, java.util.List.of(), java.util.List.of(), e.getMessage());
        }
    }

    /**
     * Click-to-fix: force the target bbox to meet the rule's minimum.
     * Returns a new list with the fixed bbox replacing the original.
     */
    private List<DesignBBox> applyClickToFix(List<DesignBBox> bboxes,
                                              String fixRule, String fixBomId, int gridMm) {
        List<DesignBBox> result = new ArrayList<>(bboxes.size());
        for (DesignBBox bb : bboxes) {
            if (!bb.bomId().equals(fixBomId) || !"ROOM".equals(bb.bomType())) {
                result.add(bb);
                continue;
            }

            double w = bb.maxX() - bb.minX();
            double d = bb.maxY() - bb.minY();
            double h = bb.maxZ() - bb.minZ();

            double required = validator.getMinimumForRule(bb.category(), fixRule);
            if (required < 0) {
                BIMLogger.warn(TAG, "CLICK_TO_FIX no rule found: {} for {}", fixRule, bb.category());
                result.add(bb);
                continue;
            }

            // Apply fix based on rule parameter type
            switch (fixRule) {
                case "min_dim_mm" -> {
                    // Expand the smaller dimension to meet minimum
                    if (w <= d && w < required) {
                        w = required;
                    } else if (d < required) {
                        d = required;
                    }
                }
                case "min_width_mm" -> {
                    if (w < required) w = required;
                }
                case "min_height_mm" -> {
                    if (h < required) h = required;
                }
                case "min_area_m2" -> {
                    // Expand width proportionally to meet area
                    double currentArea = (w * d) / 1_000_000.0;
                    if (currentArea < required) {
                        double factor = Math.sqrt(required / currentArea);
                        w *= factor;
                        d *= factor;
                    }
                }
                default -> {
                    BIMLogger.warn(TAG, "CLICK_TO_FIX unknown param: {}", fixRule);
                    result.add(bb);
                    continue;
                }
            }

            // Round to grid after fix
            if (gridMm > 0) {
                w = Math.ceil(w / gridMm) * gridMm;
                d = Math.ceil(d / gridMm) * gridMm;
            }

            BIMLogger.info(TAG, "CLICK_TO_FIX {} rule={} → w={:.0f} d={:.0f}",
                    fixBomId, fixRule, w, d);

            result.add(new DesignBBox(
                    bb.bomId(), bb.name(), bb.bomType(), bb.category(),
                    bb.ifcClass(), bb.storey(), bb.parentBomId(),
                    bb.minX(), bb.minY(), bb.minZ(),
                    bb.minX() + w, bb.minY() + d, bb.minZ() + h));
        }
        return result;
    }

    // Implementing BIM_Designer_SRS.md §17, CORE_SRS.md §3.1
    // Witness: W-JURISDICTION-1, W-INFRA-UI-FILTER
    @Override
    public JurisdictionResponse setJurisdiction(String jurisdiction, List<DesignBBox> bboxes,
                                                 String facilityType) {
        long t0 = System.currentTimeMillis();
        try {
            BIMLogger.info(TAG, "SET_JURISDICTION {} facility={} ({} bboxes)",
                    jurisdiction, facilityType, bboxes.size());

            // Activate validator with facility type if specified
            if (facilityType != null) {
                activateForFacilityType(jurisdiction, facilityType);
            }

            // Re-validate all ROOM/SEGMENT/LEAF bboxes against current rules
            List<RuleVerdict> verdicts = new ArrayList<>();

            if (validator.isActive()) {
                for (DesignBBox bb : bboxes) {
                    if (!"ROOM".equals(bb.bomType())
                            && !"SEGMENT".equals(bb.bomType())
                            && !"LEAF".equals(bb.bomType())) continue;

                    double w = bb.maxX() - bb.minX();
                    double d = bb.maxY() - bb.minY();
                    double h = bb.maxZ() - bb.minZ();

                    PlacementRequest req = new PlacementRequest(
                            bb.category(), bb.ifcClass(), null,
                            w, d, h,
                            bb.minX(), bb.minY(), bb.minZ(),
                            "SNAP", 0, bb.storey());

                    ValidationVerdict verdict = validator.validate(req);
                    verdicts.add(new RuleVerdict(
                            bb.bomId(),
                            verdict.ruleName() != null ? verdict.ruleName() : "ALL_RULES",
                            verdict.result().name(),
                            verdict.actualValue(),
                            verdict.requiredValue()));
                }
            }

            int ruleCount = validator.isActive() ? validator.getRuleCount() : 0;
            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "SET_JURISDICTION {} → {} verdicts, {} rules in {}ms",
                    jurisdiction, verdicts.size(), ruleCount, elapsed);

            return new JurisdictionResponse(true, jurisdiction, ruleCount, verdicts, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "setJurisdiction failed", e);
            BIMLogger.error(TAG, "SET_JURISDICTION failed: {}", e.getMessage());
            return new JurisdictionResponse(false, jurisdiction, 0, List.of(), e.getMessage());
        }
    }

    /**
     * Activate the PlacementValidator for a given facility type.
     * Opens a connection to validation.db, activates with the correct FacilityType,
     * and closes the connection (rules are cached in memory).
     *
     * // Implementing CORE_SRS.md §3.1 — Witness: W-INFRA-UI-FILTER
     */
    private void activateForFacilityType(String jurisdiction, String facilityTypeStr) {
        FacilityType ft = FacilityType.BUILDING;
        if (facilityTypeStr != null) {
            try {
                ft = FacilityType.valueOf(facilityTypeStr);
            } catch (IllegalArgumentException e) {
                BIMLogger.warn(TAG, "Unknown facilityType '{}', defaulting to BUILDING", facilityTypeStr);
            }
        }

        try (Connection valConn = DriverManager.getConnection("jdbc:sqlite:library/validation.db")) {
            validator.activate(jurisdiction, ft, valConn);
        } catch (Exception e) {
            BIMLogger.error(TAG, "Failed to activate validator for facilityType {}: {}",
                    facilityTypeStr, e.getMessage());
        }

        // DV010: load mined dimension rules from ERP.db
        try (Connection discConn = DriverManager.getConnection("jdbc:sqlite:library/ERP.db")) {
            validator.activateMinedRules(discConn);
        } catch (Exception e) {
            BIMLogger.warn(TAG, "Mined rules not loaded (ERP.db): {}", e.getMessage());
        }

        BIMLogger.info(TAG, "Activated validator: jurisdiction={}, facilityType={}, rules={}",
                jurisdiction, ft, validator.getRuleCount());
    }

    // Implementing G4_SRS §2.2 — Witness: W-SAVE-1
    @Override
    public SaveResponse save(String buildingId, java.util.List<DesignBBox> bboxes, String variantLabel) {
        long t0 = System.currentTimeMillis();
        try {
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);

            // Ensure master order exists (idempotent)
            // Find site dims from the BUILDING bbox
            double siteW = 0, siteD = 0, siteH = 0;
            for (DesignBBox bb : bboxes) {
                if ("BUILDING".equals(bb.bomType())) {
                    siteW = bb.maxX() - bb.minX();
                    siteD = bb.maxY() - bb.minY();
                    siteH = bb.maxZ() - bb.minZ();
                    break;
                }
            }
            woDao.ensureMasterOrder(buildingId, null, siteW, siteD, siteH);

            // Read old state for changelog diff (interceptor pattern — TIER1_SRS §3.4)
            java.util.List<DesignBBox> oldBboxes = java.util.List.of();
            try {
                java.util.List<VariantInfo> variants = woDao.listVariants(buildingId);
                if (!variants.isEmpty()) {
                    oldBboxes = woDao.recall(variants.get(0).variantId());
                }
            } catch (Exception ex) {
                // First save — no previous state, ok
            }

            // Save as new sub-order + W_Variant
            String variantId = woDao.save(buildingId, bboxes, variantLabel);
            String outputPath = WorkOutputDAO.dbPathFor(buildingId);

            // Log changelog diff (interceptor — TIER1_SRS §3.4, Witness: W-AUDIT-INTERCEPT-1)
            try {
                ChangelogDAO clDao = getChangelogDAO(buildingId);
                clDao.logSave(buildingId, variantId, oldBboxes, bboxes);
            } catch (Exception ex) {
                BIMLogger.warn(TAG, "Changelog logging failed (non-fatal): {}", ex.getMessage());
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "SAVE {} → {} ({} bboxes, label={}) in {}ms",
                    buildingId, variantId, bboxes.size(), variantLabel, elapsed);

            return new SaveResponse(true, variantId, outputPath, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Save failed", e);
            BIMLogger.error(TAG, "SAVE failed for {}: {}", buildingId, e.getMessage());
            return new SaveResponse(false, null, null, e.getMessage());
        }
    }

    // Implementing G4_SRS §2.3 — Witness: W-RECALL-1
    @Override
    public RecallResponse recall(String buildingId, String variantId) {
        try {
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            List<DesignBBox> bboxes = woDao.recall(variantId);

            if (bboxes.isEmpty()) {
                BIMLogger.warn(TAG, "RECALL {} variant={} — no lines found",
                        buildingId, variantId);
                return new RecallResponse(false, java.util.List.of(), null,
                        "Variant not found or empty: " + variantId);
            }

            // Find label from variants list
            String label = null;
            for (VariantInfo vi : woDao.listVariants(buildingId)) {
                if (vi.variantId().equals(variantId)) {
                    label = vi.label();
                    break;
                }
            }

            BIMLogger.info(TAG, "RECALL {} variant={} → {} bboxes (label={})",
                    buildingId, variantId, bboxes.size(), label);

            return new RecallResponse(true, bboxes, label, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Recall failed", e);
            BIMLogger.error(TAG, "RECALL failed for {}: {}", buildingId, e.getMessage());
            return new RecallResponse(false, java.util.List.of(), null, e.getMessage());
        }
    }

    @Override
    public java.util.List<VariantInfo> listVariants(String buildingId) {
        try {
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            List<VariantInfo> variants = woDao.listVariants(buildingId);
            BIMLogger.info(TAG, "LIST_VARIANTS {} → {} variants", buildingId, variants.size());
            return variants;
        } catch (Exception e) {
            LOG.log(Level.WARNING, "listVariants failed", e);
            BIMLogger.error(TAG, "LIST_VARIANTS failed for {}: {}", buildingId, e.getMessage());
            return java.util.List.of();
        }
    }

    // Implementing BIM_Designer.md §17.10.4 — Witness: W-PROMOTE-1
    @Override
    public PromoteResponse promote(PromoteRequest request) {
        try {
            String buildingId = request.buildingId();
            BIMLogger.info(TAG, "PROMOTE building={} owner={}", buildingId, request.owner());

            // 1. Pre-check: master C_Order must be AP (approve first)
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            String docStatus = woDao.getMasterDocStatus(buildingId);
            if (!"AP".equals(docStatus)) {
                BIMLogger.warn(TAG, "PROMOTE blocked — DocStatus={} (need AP)", docStatus);
                return new PromoteResponse(false, buildingId, 0,
                        List.of(), "Approve design first (current status: "
                        + (docStatus != null ? docStatus : "none") + ")");
            }

            // 2. Get current bboxes from work_output.db
            List<DesignBBox> bboxes = getCurrentBboxes(buildingId);
            if (bboxes.isEmpty()) {
                return new PromoteResponse(false, buildingId, 0,
                        List.of(), "No saved design for building: " + buildingId);
            }

            // 3. Dangle check: ITEM bboxes referencing non-existent products
            List<String> dangles = new ArrayList<>();
            for (DesignBBox bb : bboxes) {
                if ("ITEM".equals(bb.bomType())) {
                    try {
                        var product = dao.getProduct(bb.name());
                        if (product == null) {
                            dangles.add(bb.bomId() + " -> " + bb.name());
                        }
                    } catch (Exception e) {
                        dangles.add(bb.bomId() + " -> " + bb.name());
                    }
                }
            }
            if (!dangles.isEmpty()) {
                BIMLogger.warn(TAG, "PROMOTE dangles: {}", dangles);
                return new PromoteResponse(false, buildingId, 0, dangles,
                        "Dangling product references — resolve before promoting");
            }

            // 4. Write m_bom + m_bom_line into BOM.db
            int entriesCreated = 0;

            // Build parent map: bomId → promoted bom_id
            java.util.Map<String, String> promotedBomIds = new java.util.LinkedHashMap<>();

            // 4a. Write m_bom for BUILDING/FLOOR/ROOM bboxes
            String insertBom = """
                    INSERT OR IGNORE INTO m_bom (bom_id, Value, bom_name, description,
                        bom_type, group_by, m_product_category_id, entity_type,
                        aabb_width_mm, aabb_depth_mm, aabb_height_mm,
                        doc_sub_type, origin_x, origin_y, origin_z)
                    VALUES (?, ?, ?, 'GENERATIVE', ?, ?,
                        (SELECT M_Product_Category_ID FROM M_Product_Category WHERE Value = ?),
                        'U', ?, ?, ?, ?, ?, ?, ?)
                    """;
            try (PreparedStatement ps = bomConn.prepareStatement(insertBom)) {
                for (DesignBBox bb : bboxes) {
                    String bt = bb.bomType();
                    if ("BUILDING".equals(bt) || "FLOOR".equals(bt) || "ROOM".equals(bt)) {
                        String promBomId = bb.bomId() + "_GEN";
                        promotedBomIds.put(bb.bomId(), promBomId);

                        ps.setString(1, promBomId);  // bom_id
                        ps.setString(2, promBomId);  // Value
                        ps.setString(3, bb.name());
                        ps.setString(4, bt);
                        ps.setString(5, "ROOM".equals(bt) ? "ROOM" : "BUILDING");
                        ps.setString(6, bb.category());
                        double w = bb.maxX() - bb.minX();
                        double d = bb.maxY() - bb.minY();
                        double h = bb.maxZ() - bb.minZ();
                        ps.setInt(7, (int) w);
                        ps.setInt(8, (int) d);
                        ps.setInt(9, (int) h);
                        ps.setString(10, request.provenance());
                        ps.setDouble(11, bb.minX() / 1000.0);
                        ps.setDouble(12, bb.minY() / 1000.0);
                        ps.setDouble(13, bb.minZ() / 1000.0);
                        ps.addBatch();
                        entriesCreated++;
                    }
                }
                ps.executeBatch();
            }

            // 4b. Write m_bom_line for child bboxes (FLOOR→BUILDING, ROOM→FLOOR, ITEM→ROOM)
            //     parentBomId may be null (recall() doesn't preserve it), so infer
            //     parent from bom_type hierarchy: FLOOR→BUILDING, ROOM→FLOOR, ITEM→ROOM
            DesignBBox buildingBb = null;
            java.util.Map<String, DesignBBox> floorByStorey = new java.util.LinkedHashMap<>();
            for (DesignBBox bb : bboxes) {
                if ("BUILDING".equals(bb.bomType())) buildingBb = bb;
                else if ("FLOOR".equals(bb.bomType())) floorByStorey.put(bb.storey(), bb);
            }

            String insertLine = """
                    INSERT INTO m_bom_line (bom_id, M_BOM_ID, child_product_id, role,
                        component_type, entity_type,
                        allocated_width_mm, allocated_depth_mm, allocated_height_mm,
                        dx, dy, dz, storey)
                    VALUES (?, (SELECT M_BOM_ID FROM m_bom WHERE Value = ?), ?, ?, ?, 'U', ?, ?, ?, ?, ?, ?, ?)
                    """;
            try (PreparedStatement ps = bomConn.prepareStatement(insertLine)) {
                for (DesignBBox bb : bboxes) {
                    // Infer parent: use explicit parentBomId if available, else by type hierarchy
                    String parentBomId = bb.parentBomId();
                    DesignBBox parentBb = null;
                    if (parentBomId != null) {
                        for (DesignBBox p : bboxes) {
                            if (p.bomId().equals(parentBomId)) { parentBb = p; break; }
                        }
                    } else {
                        // Infer: FLOOR→BUILDING, ROOM/ITEM→FLOOR (by storey or first floor)
                        if ("FLOOR".equals(bb.bomType())) {
                            parentBb = buildingBb;
                            parentBomId = buildingBb != null ? buildingBb.bomId() : null;
                        } else if ("ROOM".equals(bb.bomType()) || "ITEM".equals(bb.bomType())) {
                            // Try storey match first, then spatial containment, then first floor
                            parentBb = bb.storey() != null ? floorByStorey.get(bb.storey()) : null;
                            if (parentBb == null) {
                                // Find floor that spatially contains this bbox (by Z overlap)
                                for (DesignBBox f : floorByStorey.values()) {
                                    if (bb.minZ() >= f.minZ() && bb.maxZ() <= f.maxZ()) {
                                        parentBb = f; break;
                                    }
                                }
                            }
                            if (parentBb == null && !floorByStorey.isEmpty()) {
                                parentBb = floorByStorey.values().iterator().next();
                            }
                            parentBomId = parentBb != null ? parentBb.bomId() : null;
                        }
                    }

                    String parentPromId = parentBomId != null
                            ? promotedBomIds.get(parentBomId) : null;
                    if (parentPromId == null) continue; // root BUILDING has no parent line

                    double relDx = parentBb != null ? (bb.minX() - parentBb.minX()) / 1000.0 : bb.minX() / 1000.0;
                    double relDy = parentBb != null ? (bb.minY() - parentBb.minY()) / 1000.0 : bb.minY() / 1000.0;
                    double relDz = parentBb != null ? (bb.minZ() - parentBb.minZ()) / 1000.0 : bb.minZ() / 1000.0;

                    ps.setString(1, parentPromId);  // bom_id
                    ps.setString(2, parentPromId);  // M_BOM_ID subquery
                    ps.setString(3, bb.name());
                    ps.setString(4, bb.category() != null ? bb.category() : bb.bomType());
                    ps.setString(5, "ITEM".equals(bb.bomType()) ? "BUY" : "MAKE");
                    ps.setInt(6, (int) (bb.maxX() - bb.minX()));
                    ps.setInt(7, (int) (bb.maxY() - bb.minY()));
                    ps.setInt(8, (int) (bb.maxZ() - bb.minZ()));
                    ps.setDouble(9, relDx);
                    ps.setDouble(10, relDy);
                    ps.setDouble(11, relDz);
                    ps.setString(12, bb.storey());
                    ps.addBatch();
                    entriesCreated++;
                }
                ps.executeBatch();
            }

            // 5. Freeze: transition master C_Order AP → CO
            woDao.setMasterDocStatus(buildingId, "CO");

            BIMLogger.info(TAG, "PROMOTE {} → {} entries created, status=CO",
                    buildingId, entriesCreated);
            return new PromoteResponse(true, buildingId, entriesCreated,
                    List.of(), null);

        } catch (Exception e) {
            LOG.log(Level.WARNING, "Promote failed", e);
            BIMLogger.error(TAG, "PROMOTE failed: {}", e.getMessage());
            return new PromoteResponse(false, null, 0, List.of(), e.getMessage());
        }
    }

    // ── BOM Chooser (§17.18) ──────────────────────────────────────────

    // Implementing BIM_Designer.md §17.18 — Witness: W-BROWSE-1
    @Override
    public BrowseItemsResponse browseItems(BrowseItemsRequest request) {
        long t0 = System.currentTimeMillis();
        try {
            int limit = request.limit() > 0 ? request.limit() : 20;
            int offset = Math.max(0, request.offset());

            BIMLogger.info(TAG, "BROWSE search={} category={} building={} container={}x{}x{} offset={} limit={}",
                    request.search(), request.category(), request.buildingType(),
                    request.containerWidthMm(), request.containerDepthMm(), request.containerHeightMm(),
                    offset, limit);

            // Query products
            var productRows = dao.browseProducts(
                    request.search(), request.category(), request.buildingType(),
                    offset, limit);

            // Total count for pagination
            int totalCount = dao.countProducts(
                    request.search(), request.category(), request.buildingType());

            // Compute fit status per item
            List<BrowseItem> items = new ArrayList<>(productRows.size());
            for (var row : productRows) {
                String fitStatus = computeFitStatus(
                        row.widthMm(), row.depthMm(), row.heightMm(),
                        request.containerWidthMm(), request.containerDepthMm(),
                        request.containerHeightMm());

                items.add(new BrowseItem(
                        row.productId(),
                        row.productId(),  // name = productId for now
                        row.productType(),
                        row.widthMm(), row.depthMm(), row.heightMm(),
                        row.ifcClass(),
                        fitStatus
                ));
            }

            // Category counts with fits breakdown
            var catRows = dao.categoryCounts(request.search(), request.buildingType());
            List<CategoryCount> categories = new ArrayList<>(catRows.size());
            for (var cat : catRows) {
                // Count how many items in this category fit the container
                int fitsCount = countFitting(request.search(), cat.productType(),
                        request.buildingType(),
                        request.containerWidthMm(), request.containerDepthMm(),
                        request.containerHeightMm());
                categories.add(new CategoryCount(cat.productType(), cat.count(), fitsCount));
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "BROWSE → {} items (total={}, {} categories) in {}ms",
                    items.size(), totalCount, categories.size(), elapsed);

            return new BrowseItemsResponse(true, items, totalCount, categories, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "browseItems failed", e);
            BIMLogger.error(TAG, "BROWSE failed: {}", e.getMessage());
            return new BrowseItemsResponse(false, List.of(), 0, List.of(), e.getMessage());
        }
    }

    /**
     * Container fit check per §17.18.3.
     * Items that don't fit are shown (not hidden) — fit status is information, not a gate.
     */
    public static String computeFitStatus(double itemW, double itemD, double itemH,
            double contW, double contD, double contH) {
        if (contW <= 0 || contD <= 0 || contH <= 0) return "FITS"; // no container = no check
        if (itemW > contW) return "TOO_WIDE";
        if (itemD > contD) return "TOO_DEEP";
        if (itemH > contH) return "TOO_TALL";
        double minClearance = Math.min(contW - itemW, Math.min(contD - itemD, contH - itemH));
        if (minClearance < 100) return "TIGHT";
        return "FITS";
    }

    /** Count fitting products in a category — queries all items and checks AABB. */
    private int countFitting(String search, String category, String buildingType,
            double contW, double contD, double contH) throws Exception {
        if (contW <= 0 || contD <= 0 || contH <= 0) {
            // No container specified — all items "fit"
            return dao.countProducts(search, category, buildingType);
        }
        // Query all items in category (no pagination) to check fit
        var rows = dao.browseProducts(search, category, buildingType, 0, Integer.MAX_VALUE);
        int fits = 0;
        for (var row : rows) {
            if (row.widthMm() <= contW && row.depthMm() <= contD && row.heightMm() <= contH) {
                fits++;
            }
        }
        return fits;
    }

    // ── Find Similar (§25.3 — JEPA-inspired embedding similarity) ──

    // Implementing BIM_Designer_SRS.md §25.3 — Witness: W-EMB-SIM-1
    @Override
    public FindSimilarResponse findSimilar(FindSimilarRequest request) {
        long t0 = System.currentTimeMillis();
        try {
            int limit = request.limit() > 0 ? request.limit() : 10;

            BIMLogger.info(TAG, "FIND_SIMILAR product={} container={}x{}x{} limit={}",
                    request.productId(),
                    request.containerWidthMm(), request.containerDepthMm(),
                    request.containerHeightMm(), limit);

            var similarRows = dao.findSimilar(request.productId(), limit,
                    request.containerWidthMm(), request.containerDepthMm(),
                    request.containerHeightMm());

            List<SimilarItem> items = new ArrayList<>(similarRows.size());
            for (var row : similarRows) {
                var p = row.product();
                String fitStatus = computeFitStatus(
                        p.widthMm(), p.depthMm(), p.heightMm(),
                        request.containerWidthMm(), request.containerDepthMm(),
                        request.containerHeightMm());

                items.add(new SimilarItem(
                        p.productId(), p.productId(), p.productType(),
                        p.widthMm(), p.depthMm(), p.heightMm(),
                        p.ifcClass(), fitStatus,
                        row.similarity()));
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "FIND_SIMILAR → {} items in {}ms",
                    items.size(), elapsed);

            return new FindSimilarResponse(true, items, request.productId(), null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "findSimilar failed", e);
            BIMLogger.error(TAG, "FIND_SIMILAR failed: {}", e.getMessage());
            return new FindSimilarResponse(false, List.of(), request.productId(), e.getMessage());
        }
    }

    // ── ORDER View + BOM Outliner — G-9 (§17.11, §17.19) ──────────

    // Implementing BIM_Designer.md §17.11 — Witness: W-OV-LIST-1
    @Override
    public ListOrderLinesResponse listOrderLines(String buildingId) {
        try {
            BIMLogger.info(TAG, "LIST_ORDER_LINES building={}", buildingId);
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            var rows = woDao.listOrderLines(buildingId);

            var lines = rows.stream().map(r -> new OrderLineInfo(
                    r.orderLineId(), r.familyRef(), r.hostType(), r.productCategory(),
                    r.dx(), r.dy(), r.dz(),
                    r.widthMm(), r.depthMm(), r.heightMm(),
                    r.qty(), r.validationStatus(), r.parentOrderLineId()
            )).toList();

            BIMLogger.info(TAG, "LIST_ORDER_LINES → {} lines", lines.size());
            return new ListOrderLinesResponse(true, lines, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "listOrderLines failed", e);
            BIMLogger.error(TAG, "LIST_ORDER_LINES failed: {}", e.getMessage());
            return new ListOrderLinesResponse(false, List.of(), e.getMessage());
        }
    }

    // Implementing BIM_Designer.md §17.11, UX-F-26 — Witness: W-OV-UPDATE-1
    @Override
    public UpdateOrderLineResponse updateOrderLine(int orderLineId, String buildingId,
                                                    String field, String value) {
        try {
            BIMLogger.info(TAG, "UPDATE_ORDER_LINE id={} field={} value={}", orderLineId, field, value);
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);

            boolean updated = woDao.updateOrderLine(orderLineId, field, value);
            if (!updated) {
                return new UpdateOrderLineResponse(false, null,
                        "Field not editable or line not found: " + field);
            }

            var row = woDao.getOrderLine(orderLineId);
            if (row == null) {
                return new UpdateOrderLineResponse(false, null,
                        "OrderLine not found after update: " + orderLineId);
            }

            var info = new OrderLineInfo(
                    row.orderLineId(), row.familyRef(), row.hostType(), row.productCategory(),
                    row.dx(), row.dy(), row.dz(),
                    row.widthMm(), row.depthMm(), row.heightMm(),
                    row.qty(), row.validationStatus(), row.parentOrderLineId());

            BIMLogger.info(TAG, "UPDATE_ORDER_LINE → ok, id={}", orderLineId);
            return new UpdateOrderLineResponse(true, info, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "updateOrderLine failed", e);
            BIMLogger.error(TAG, "UPDATE_ORDER_LINE failed: {}", e.getMessage());
            return new UpdateOrderLineResponse(false, null, e.getMessage());
        }
    }

    // Implementing GENERATIVE_HOUSE_SRS.md §2.1 TC-4 — Witness: W-SWAP-1
    @Override
    public UpdateOrderLineResponse swapProduct(int orderLineId, String buildingId,
                                               String newProductId) {
        try {
            BIMLogger.info(TAG, "SWAP_PRODUCT id={} new={}", orderLineId, newProductId);
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);

            boolean updated = woDao.swapProduct(orderLineId, newProductId);
            if (!updated) {
                return new UpdateOrderLineResponse(false, null,
                        "OrderLine not found or inactive: " + orderLineId);
            }

            var row = woDao.getOrderLine(orderLineId);
            if (row == null) {
                return new UpdateOrderLineResponse(false, null,
                        "OrderLine not found after swap: " + orderLineId);
            }

            var info = new OrderLineInfo(
                    row.orderLineId(), row.familyRef(), row.hostType(), row.productCategory(),
                    row.dx(), row.dy(), row.dz(),
                    row.widthMm(), row.depthMm(), row.heightMm(),
                    row.qty(), row.validationStatus(), row.parentOrderLineId());

            BIMLogger.info(TAG, "SWAP_PRODUCT → ok, id={} now={}", orderLineId, newProductId);
            return new UpdateOrderLineResponse(true, info, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "swapProduct failed", e);
            BIMLogger.error(TAG, "SWAP_PRODUCT failed: {}", e.getMessage());
            return new UpdateOrderLineResponse(false, null, e.getMessage());
        }
    }

    // Implementing BIM_Designer.md §17.19 — Witness: W-OV-TREE-1
    @Override
    public BomTreeResponse getBomTree(String buildingId) {
        try {
            BIMLogger.info(TAG, "GET_BOM_TREE building={}", buildingId);
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            var rows = woDao.listOrderLines(buildingId);

            // Build tree from flat list using Parent_OrderLine_ID
            java.util.Map<Integer, java.util.List<WorkOutputDAO.OrderLineRow>> childrenMap
                    = new java.util.LinkedHashMap<>();
            java.util.List<WorkOutputDAO.OrderLineRow> roots = new java.util.ArrayList<>();

            for (var row : rows) {
                if (row.parentOrderLineId() == 0) {
                    roots.add(row);
                } else {
                    childrenMap.computeIfAbsent(row.parentOrderLineId(),
                            k -> new java.util.ArrayList<>()).add(row);
                }
            }

            var treeRoots = roots.stream()
                    .map(r -> buildTreeNode(r, childrenMap))
                    .toList();

            BIMLogger.info(TAG, "GET_BOM_TREE → {} roots, {} total nodes",
                    treeRoots.size(), rows.size());
            return new BomTreeResponse(true, treeRoots, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "getBomTree failed", e);
            BIMLogger.error(TAG, "GET_BOM_TREE failed: {}", e.getMessage());
            return new BomTreeResponse(false, List.of(), e.getMessage());
        }
    }

    private BomTreeNode buildTreeNode(WorkOutputDAO.OrderLineRow row,
                                       java.util.Map<Integer, java.util.List<WorkOutputDAO.OrderLineRow>> childrenMap) {
        var childRows = childrenMap.getOrDefault(row.orderLineId(), List.of());
        var children = childRows.stream()
                .map(c -> buildTreeNode(c, childrenMap))
                .toList();
        return new BomTreeNode(
                row.orderLineId(), row.familyRef(), row.hostType(), row.productCategory(),
                row.widthMm(), row.depthMm(), row.heightMm(),
                row.qty(), row.validationStatus(), children);
    }

    // ── BOM Drop — Template-First Building Design (§28) ──────────

    // Implementing GENERATIVE_HOUSE_SRS.md §2.1, BIM_Designer_SRS.md §28.1
    // Witness: W-DROP-1
    @Override
    public BomDropResponse bomDrop(String buildingProductId) {
        try {
            BIMLogger.info(TAG, "BOM_DROP product={}", buildingProductId);

            // 1. Check IsBOM — product must have a matching m_bom entry
            MBOM rootBom = new MBOM(bomConn);
            if (!rootBom.loadByValue(buildingProductId)) {
                return new BomDropResponse(false, null, 0, null, 0,
                        "Product has no BOM (IsBOM=false): " + buildingProductId);
            }

            // 2. Create C_Order for this BOM Drop session
            WorkOutputDAO woDao = getWorkOutputDAO(buildingProductId);
            String orderId = woDao.createBomDropOrder(buildingProductId,
                    rootBom.getAabbWidthMm(), rootBom.getAabbDepthMm(),
                    rootBom.getAabbHeightMm());

            // 3. Explode BOM tree recursively into C_OrderLine hierarchy
            //    iDempiere pattern: walk m_bom/m_bom_line, insert C_OrderLine
            //    per node. IsBOM products (matching m_bom) recurse; others are LEAF.
            int[] leafCount = {0};
            BomTreeNode tree = explodeBomTree(woDao, orderId, buildingProductId,
                    0, "BUILDING", rootBom.getProductCategory(), 0, leafCount);

            BIMLogger.info(TAG, "BOM_DROP → order={} root_line={} leaves={}",
                    orderId, tree != null ? tree.orderLineId() : 0, leafCount[0]);

            return new BomDropResponse(true, orderId,
                    tree != null ? tree.orderLineId() : 0,
                    tree, leafCount[0], null);

        } catch (Exception e) {
            LOG.log(Level.WARNING, "bomDrop failed", e);
            BIMLogger.error(TAG, "BOM_DROP failed: {}", e.getMessage());
            return new BomDropResponse(false, null, 0, null, 0, e.getMessage());
        }
    }

    // ── Add Discipline — Rule-Driven OrderLine Mutation (§14.3 Session A) ─

    // Implementing ProjectOrderBlueprint.md §14.3 Session A — Witness: W-DM-TC5-1
    @Override
    public AddDisciplineResponse addDiscipline(String buildingId, String orderId,
                                                String discipline, String jurisdiction) {
        try {
            BIMLogger.info(TAG, "ADD_DISCIPLINE building={} order={} disc={} juris={}",
                    buildingId, orderId, discipline, jurisdiction);

            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            Connection woConn = workOutputConns.get(buildingId);
            Connection dvConn = getDiscValidationConn();
            if (dvConn == null) {
                return new AddDisciplineResponse(false, 0, 0, discipline,
                        "ERP.db not available");
            }

            OrderMutationService mutationService = new OrderMutationService();
            OrderMutationService.AddDisciplineResult result =
                    mutationService.addDiscipline(woConn, dvConn, orderId, discipline, jurisdiction);

            return new AddDisciplineResponse(true,
                    result.linesCreated(), result.roomsProcessed(),
                    result.discipline(), null);

        } catch (Exception e) {
            LOG.log(Level.WARNING, "addDiscipline failed", e);
            BIMLogger.error(TAG, "ADD_DISCIPLINE failed: {}", e.getMessage());
            return new AddDisciplineResponse(false, 0, 0, discipline, e.getMessage());
        }
    }

    /**
     * Recursively explode a BOM tree into C_OrderLine rows.
     *
     * <p>iDempiere BOM Drop pattern: for each m_bom_line child, check if
     * the child_product_id has a matching m_bom entry (IsBOM). If yes,
     * it is a sub-assembly — insert C_OrderLine and recurse. If no,
     * it is a leaf product — insert C_OrderLine as LEAF.
     * PHANTOM components are skipped (no output).
     *
     * @param woDao            WorkOutputDAO for C_OrderLine insertion
     * @param orderId          C_Order_ID
     * @param bomId            current BOM to explode
     * @param parentLineId     parent C_OrderLine_ID (0 = root)
     * @param hostType         BUILDING | FLOOR | ROOM | LEAF
     * @param productCategory      M_Product_Category for this node
     * @param depth            recursion depth (0 = root)
     * @param leafCount        mutable counter for leaf elements
     * @return BomTreeNode for the Outliner
     */
    private BomTreeNode explodeBomTree(WorkOutputDAO woDao, String orderId,
                                        String bomId, int parentLineId,
                                        String hostType, String productCategory,
                                        int depth, int[] leafCount) throws Exception {
        if (depth > 20) {
            BIMLogger.warn(TAG, "BOM_DROP max depth exceeded at {}", bomId);
            return null;
        }

        // Load BOM to get AABB
        MBOM bom = new MBOM(bomConn);
        if (!bom.loadByValue(bomId)) return null;

        // Insert C_OrderLine for this BOM node
        int lineId = woDao.insertBomDropLine(orderId, parentLineId,
                bomId, hostType, productCategory,
                0, 0, 0,  // root/assembly offsets — tack is relative
                bom.getAabbWidthMm(), bom.getAabbDepthMm(), bom.getAabbHeightMm(),
                1);

        // Walk m_bom_line children
        List<MBOMLine> lines = MBOMLine.getByBom(bomConn, bomId);
        List<BomTreeNode> children = new java.util.ArrayList<>();

        for (MBOMLine line : lines) {
            String childProductId = line.getChildProductId();
            if (childProductId == null) continue;

            // Check IsBOM — does child_product_id have a matching m_bom entry?
            MBOM childBom = new MBOM(bomConn);
            boolean isBom = childBom.loadByValue(childProductId);

            if (isBom) {
                // Sub-assembly — recurse (iDempiere BOM explosion)
                String childHostType = deriveHostType(depth + 1);
                BomTreeNode child = explodeBomTree(woDao, orderId,
                        childProductId, lineId,
                        childHostType, childBom.getProductCategory(),
                        depth + 1, leafCount);
                if (child != null) children.add(child);

            } else if ("PHANTOM".equals(line.getComponentType())) {
                // PHANTOM — skip, no C_OrderLine (filler element)
                continue;

            } else if ("MAKE".equals(line.getComponentType())) {
                // Dangling MAKE reference — component_type says sub-assembly
                // but no m_bom entry exists. Skip (same as BOMWalker).
                BIMLogger.warn(TAG, "BOM_DROP dangling MAKE: {} in BOM {} — skipping",
                        childProductId, bomId);
                continue;

            } else {
                // Leaf product — insert C_OrderLine as LEAF
                int qty = line.getQty();
                int leafLineId = woDao.insertBomDropLine(orderId, lineId,
                        childProductId, "LEAF", productCategory,
                        line.getDx(), line.getDy(), line.getDz(),
                        line.getAllocatedWidthMm(), line.getAllocatedDepthMm(),
                        line.getAllocatedHeightMm(),
                        qty);
                leafCount[0] += qty;

                children.add(new BomTreeNode(
                        leafLineId, childProductId, "LEAF", productCategory,
                        line.getAllocatedWidthMm(), line.getAllocatedDepthMm(),
                        line.getAllocatedHeightMm(),
                        qty, "UNCHECKED", List.of()));
            }
        }

        return new BomTreeNode(lineId, bomId, hostType, productCategory,
                bom.getAabbWidthMm(), bom.getAabbDepthMm(), bom.getAabbHeightMm(),
                1, "UNCHECKED", children);
    }

    /**
     * Derive host_type from BOM tree depth.
     * Level 0 = BUILDING (root), level 1 = FLOOR, level 2+ = ROOM.
     */
    private static String deriveHostType(int depth) {
        return switch (depth) {
            case 0 -> "BUILDING";
            case 1 -> "FLOOR";
            default -> "ROOM";
        };
    }

    // ── Place Item + Layout Editing (§15, §16) ─────────────────────

    // Implementing BIM_Designer_SRS.md §15 — Witness: W-PLACE-1, W-CTP-3
    @Override
    public PlaceItemResponse placeItem(PlaceItemRequest request) {
        long t0 = System.currentTimeMillis();
        try {
            BIMLogger.info(TAG, "PLACE_ITEM product={} room={} offset=({},{},{})",
                    request.productId(), request.roomBomId(),
                    request.offsetXMm(), request.offsetYMm(), request.offsetZMm());

            // 1. Look up product dimensions
            var product = dao.getProduct(request.productId());
            if (product == null) {
                BIMLogger.warn(TAG, "PLACE_ITEM product not found: {}", request.productId());
                return new PlaceItemResponse(false, 0, null,
                        "Product not found: " + request.productId());
            }

            // 2. Find the target room bbox
            DesignBBox roomBbox = null;
            if (request.currentBboxes() != null) {
                for (DesignBBox bb : request.currentBboxes()) {
                    if (bb.bomId().equals(request.roomBomId())) {
                        roomBbox = bb;
                        break;
                    }
                }
            }
            if (roomBbox == null) {
                BIMLogger.warn(TAG, "PLACE_ITEM room not found: {}", request.roomBomId());
                return new PlaceItemResponse(false, 0, null,
                        "Room not found in bboxes: " + request.roomBomId());
            }

            // 3. Compute item position: room origin + offset
            double itemMinX = roomBbox.minX() + request.offsetXMm();
            double itemMinY = roomBbox.minY() + request.offsetYMm();
            double itemMinZ = roomBbox.minZ() + request.offsetZMm();
            double itemMaxX = itemMinX + product.widthMm();
            double itemMaxY = itemMinY + product.depthMm();
            double itemMaxZ = itemMinZ + product.heightMm();

            // 4. Create new DesignBBox for the placed item
            String itemBomId = "ITEM_" + request.productId() + "_" +
                    System.currentTimeMillis() % 100000;
            DesignBBox itemBbox = new DesignBBox(
                    itemBomId,
                    request.productId(),
                    "ITEM",
                    product.productType(),
                    product.ifcClass(),
                    roomBbox.storey(),
                    request.roomBomId(),
                    itemMinX, itemMinY, itemMinZ,
                    itemMaxX, itemMaxY, itemMaxZ);

            // 5. Persist to work_output.db as C_OrderLine (§15 persistence)
            int orderLineId = 0;
            try {
                WorkOutputDAO woDao = getWorkOutputDAO(request.buildingId());
                orderLineId = woDao.insertOrderLine(
                        request.buildingId(), itemBbox);
                BIMLogger.info(TAG, "PLACE_ITEM persisted orderLineId={}", orderLineId);
            } catch (Exception ex) {
                // Persistence is best-effort — item still placed in viewport
                BIMLogger.warn(TAG, "PLACE_ITEM persistence failed (non-fatal): {}",
                        ex.getMessage());
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "PLACE_ITEM → {} at ({},{},{}) size {}x{}x{} in {}ms",
                    itemBomId, itemMinX, itemMinY, itemMinZ,
                    product.widthMm(), product.depthMm(), product.heightMm(), elapsed);

            return new PlaceItemResponse(true, orderLineId, itemBbox, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "placeItem failed", e);
            BIMLogger.error(TAG, "PLACE_ITEM failed: {}", e.getMessage());
            return new PlaceItemResponse(false, 0, null, e.getMessage());
        }
    }

    // Implementing BIM_Designer_SRS.md §2 UX-F-25 — Witness: W-PLACE-SET
    @Override
    public PlaceSetResponse placeSet(PlaceSetRequest request) {
        long t0 = System.currentTimeMillis();
        try {
            String cat = request.categoryValue();
            if (cat == null || cat.isBlank()) {
                return new PlaceSetResponse(false, 0, List.of(), List.of(),
                        "categoryValue is required");
            }

            BIMLogger.info(TAG, "PLACE_SET category={} room={} building={}",
                    cat, request.roomBomId(), request.buildingId());

            // Query products by category (product_type = categoryValue)
            var products = dao.browseProducts(null, cat, null, 0, Integer.MAX_VALUE);
            if (products.isEmpty()) {
                return new PlaceSetResponse(false, 0, List.of(), List.of(),
                        "No products found for category: " + cat);
            }

            List<DesignBBox> placedBboxes = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            List<DesignBBox> currentBboxes = request.currentBboxes() != null
                    ? new ArrayList<>(request.currentBboxes()) : new ArrayList<>();

            for (int i = 0; i < products.size(); i++) {
                var product = products.get(i);
                // Stagger items along X axis within the room
                double offsetX = i * 500.0;  // 500mm spacing

                PlaceItemResponse resp = placeItem(new PlaceItemRequest(
                        request.buildingId(), request.roomBomId(),
                        product.productId(),
                        offsetX, 0, 0,
                        currentBboxes));

                if (resp.success() && resp.bbox() != null) {
                    placedBboxes.add(resp.bbox());
                    currentBboxes.add(resp.bbox());
                } else {
                    errors.add(product.productId() + ": " +
                            (resp.error() != null ? resp.error() : "unknown"));
                }
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "PLACE_SET → {} placed, {} errors in {}ms",
                    placedBboxes.size(), errors.size(), elapsed);

            return new PlaceSetResponse(true, placedBboxes.size(),
                    placedBboxes, errors, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "placeSet failed", e);
            return new PlaceSetResponse(false, 0, List.of(), List.of(), e.getMessage());
        }
    }

    // ── Click-to-Place — G-8 Interactive Discipline Placement (§18.8) ──

    // Implementing BIM_Designer.md §18.8 — Witness: W-CTP-1, W-CTP-2, W-CTP-MEP-1, W-CTP-MULTI-1
    @Override
    public ClickToPlaceResponse clickToPlace(ClickToPlaceRequest request) {
        long t0 = System.currentTimeMillis();
        try {
            double cx = request.clickXMm(), cy = request.clickYMm(), cz = request.clickZMm();
            String discipline = request.discipline() != null ? request.discipline() : "ARC";

            BIMLogger.info(TAG, "CLICK_TO_PLACE at ({},{},{}) discipline={}",
                    cx, cy, cz, discipline);

            // 1. Resolve click to room: find the ROOM bbox containing (cx, cy, cz)
            DesignBBox targetRoom = null;
            if (request.currentBboxes() != null) {
                for (DesignBBox bb : request.currentBboxes()) {
                    if (!"ROOM".equals(bb.bomType())) continue;
                    if (cx >= bb.minX() && cx <= bb.maxX()
                            && cy >= bb.minY() && cy <= bb.maxY()
                            && cz >= bb.minZ() && cz <= bb.maxZ()) {
                        targetRoom = bb;
                        break;
                    }
                }
            }

            if (targetRoom == null) {
                BIMLogger.warn(TAG, "CLICK_TO_PLACE no room at ({},{},{})", cx, cy, cz);
                return new ClickToPlaceResponse(false, null, discipline, List.of(),
                        "No room found at click position (" + cx + ", " + cy + ", " + cz + ")");
            }

            BIMLogger.info(TAG, "CLICK_TO_PLACE resolved room={} category={}",
                    targetRoom.bomId(), targetRoom.category());

            double contW = targetRoom.maxX() - targetRoom.minX();
            double contD = targetRoom.maxY() - targetRoom.minY();
            double contH = targetRoom.maxZ() - targetRoom.minZ();

            // 2. Query MEP requirements from ERP.db (data-driven)
            List<MEPRequirementInfo> mepReqs = List.of();
            if (!"ARC".equals(discipline)) {
                mepReqs = queryMEPRequirements(targetRoom.category(), discipline);
            }

            // 3. Place items — multi-item for MEP, single for ARC
            List<DesignBBox> placedItems = new ArrayList<>();
            List<MEPRequirementInfo> updatedReqs = new ArrayList<>();

            if (!mepReqs.isEmpty()) {
                // MEP discipline: place ALL required products for this discipline
                for (MEPRequirementInfo req : mepReqs) {
                    int qtyToPlace = Math.max(req.qtyNormal(), 1);
                    int placed = 0;

                    // Browse catalog for this MEP product
                    var browseResult = browseItems(new BrowseItemsRequest(
                            req.mepProductId(), null, null,
                            contW, contD, contH, 0, 5));

                    if (browseResult.success() && !browseResult.items().isEmpty()) {
                        BrowseItem catalogItem = browseResult.items().get(0);

                        for (int i = 0; i < qtyToPlace; i++) {
                            // Compute position from placement_rule + host_surface
                            double[] offset = computePlacementOffset(
                                    req.placementRule(), req.hostSurface(),
                                    contW, contD, contH, i, qtyToPlace);

                            PlaceItemResponse placeResp = placeItem(new PlaceItemRequest(
                                    request.buildingId(), targetRoom.bomId(),
                                    catalogItem.productId(),
                                    offset[0], offset[1], offset[2],
                                    request.currentBboxes()));

                            if (placeResp.success() && placeResp.bbox() != null) {
                                placedItems.add(placeResp.bbox());
                                placed++;
                            }
                        }
                    }

                    // Track coverage: qtyPlaced vs qtyNormal
                    updatedReqs.add(new MEPRequirementInfo(
                            req.mepProductId(), req.qtyNormal(), placed,
                            req.placementRule(), req.hostSurface(),
                            req.buildingCode(), req.codeClause()));
                }

                BIMLogger.info(TAG, "CLICK_TO_PLACE MEP: {} requirements, {} items placed for {}/{}",
                        mepReqs.size(), placedItems.size(), targetRoom.category(), discipline);
            } else {
                // ARC discipline or no MEP data: browse by keyword, single item
                String productTypeFilter = arcProductKeyword(targetRoom.category());
                double offsetX = cx - targetRoom.minX();
                double offsetY = cy - targetRoom.minY();
                double offsetZ = cz - targetRoom.minZ();

                var browseResult = browseItems(new BrowseItemsRequest(
                        productTypeFilter, null, null,
                        contW, contD, contH, 0, 5));

                if (!browseResult.success() || browseResult.items().isEmpty()) {
                    browseResult = browseItems(new BrowseItemsRequest(
                            "", null, null, contW, contD, contH, 0, 5));
                }

                if (browseResult.success() && !browseResult.items().isEmpty()) {
                    BrowseItem seedItem = browseResult.items().get(0);
                    PlaceItemResponse placeResp = placeItem(new PlaceItemRequest(
                            request.buildingId(), targetRoom.bomId(),
                            seedItem.productId(),
                            offsetX, offsetY, offsetZ,
                            request.currentBboxes()));
                    if (placeResp.success() && placeResp.bbox() != null) {
                        placedItems.add(placeResp.bbox());
                    }
                }
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "CLICK_TO_PLACE → {} items in room={} discipline={} in {}ms",
                    placedItems.size(), targetRoom.bomId(), discipline, elapsed);

            return new ClickToPlaceResponse(true, targetRoom.bomId(), discipline,
                    placedItems, updatedReqs.isEmpty() ? mepReqs : updatedReqs, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "clickToPlace failed", e);
            BIMLogger.error(TAG, "CLICK_TO_PLACE failed: {}", e.getMessage());
            return new ClickToPlaceResponse(false, null,
                    request.discipline(), List.of(), e.getMessage());
        }
    }

    /**
     * Compute placement offset (relative to room origin) from placement_rule + host_surface.
     *
     * <p>Placement rules define WHERE in the room the item goes:
     * <ul>
     *   <li>CEILING_CENTER → centre of room at ceiling height</li>
     *   <li>CEILING_GRID → evenly distributed grid at ceiling (for qty > 1)</li>
     *   <li>WALL_ENTRY → near the room entry (minX wall, centred Y, handle height)</li>
     *   <li>WALL_SPACED → evenly spaced along the longest wall</li>
     *   <li>WALL_BACK → against the back wall (maxY)</li>
     *   <li>WALL_SIDE → against a side wall (minX or maxX)</li>
     *   <li>WALL_HIGH → high on wall (for aircon points)</li>
     *   <li>WALL_SINK → near counter (mid-Y, counter height)</li>
     *   <li>FLOOR_LOW → at floor level, low point (for floor traps)</li>
     *   <li>AUTO → centred in room at appropriate height for host_surface</li>
     * </ul>
     *
     * @param rule       placement_rule from ad_space_type_mep_bom
     * @param surface    host_surface: CEILING, WALL, FLOOR
     * @param roomW      room width (X extent) in mm
     * @param roomD      room depth (Y extent) in mm
     * @param roomH      room height (Z extent) in mm
     * @param index      item index (0-based) within this product's qty
     * @param totalQty   total quantity being placed
     * @return [offsetX, offsetY, offsetZ] relative to room origin
     */
    public static double[] computePlacementOffset(String rule, String surface,
                                            double roomW, double roomD, double roomH,
                                            int index, int totalQty) {
        double cx = roomW / 2, cy = roomD / 2;

        return switch (rule != null ? rule : "AUTO") {
            case "CEILING_CENTER" -> new double[]{cx, cy, roomH - 50};  // 50mm below ceiling
            case "CEILING_GRID" -> {
                // Distribute items in a grid pattern across the ceiling
                int cols = (int) Math.ceil(Math.sqrt(totalQty));
                int row = index / cols, col = index % cols;
                double spacingX = roomW / (cols + 1);
                double spacingY = roomD / (Math.ceil((double) totalQty / cols) + 1);
                yield new double[]{spacingX * (col + 1), spacingY * (row + 1), roomH - 50};
            }
            case "WALL_ENTRY" -> new double[]{100, cy, 1200};  // near entry wall, handle height
            case "WALL_EXIT" -> new double[]{roomW - 100, cy, 1200};
            case "WALL_SPACED" -> {
                // Evenly spaced along the longest wall
                double spacing = roomW / (totalQty + 1);
                yield new double[]{spacing * (index + 1), 100, 300};  // 300mm = outlet height
            }
            case "WALL_BACK" -> new double[]{cx, roomD - 200, 0};  // against back wall, on floor
            case "WALL_SIDE" -> new double[]{100, cy, 800};  // against side wall, counter height
            case "WALL_HIGH" -> new double[]{cx, 100, roomH - 300};  // high on wall
            case "WALL_SINK", "COUNTER_SINK", "COUNTER_BACK" -> new double[]{cx, 100, 900};  // counter height
            case "WALL_COOKER" -> new double[]{roomW - 200, 100, 900};
            case "WALL_LOW" -> new double[]{cx, 100, 300};
            case "WALL_ANY" -> new double[]{roomW / (totalQty + 1) * (index + 1), 100, 1200};
            case "FLOOR_LOW" -> new double[]{cx, cy, 0};  // floor level
            default -> {
                // AUTO: use host_surface to determine Z
                double z = switch (surface != null ? surface : "WALL") {
                    case "CEILING" -> roomH - 50;
                    case "FLOOR" -> 0;
                    default -> 1200;  // mid-wall height
                };
                yield new double[]{cx, cy, z};
            }
        };
    }

    /**
     * Query MEP requirements from ERP.db ad_space_type_mep_bom.
     * Returns empty list if ERP.db is unavailable (graceful degradation).
     */
    private List<MEPRequirementInfo> queryMEPRequirements(String roomCategory, String discipline) {
        try {
            MEPBOMQuery query = getMEPBOMQuery();
            if (query == null) return List.of();

            var reqs = query.queryForDiscipline(roomCategory, discipline);
            List<MEPRequirementInfo> result = new ArrayList<>(reqs.size());
            for (var r : reqs) {
                result.add(new MEPRequirementInfo(
                        r.mepProductId(), r.qtyNormal(),
                        r.placementRule(), r.hostSurface(),
                        r.buildingCode(), r.codeClause()));
            }
            return result;
        } catch (Exception e) {
            BIMLogger.warn(TAG, "MEP BOM query failed (non-fatal): {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Lazily open ERP.db and create MEPBOMQuery.
     * Returns null if the DB file doesn't exist (graceful degradation).
     */
    private MEPBOMQuery getMEPBOMQuery() {
        if (mepBomQuery != null) return mepBomQuery;
        synchronized (this) {
            if (mepBomQuery != null) return mepBomQuery;
            try {
                String dbPath = "library/ERP.db";
                if (!new File(dbPath).exists()) {
                    BIMLogger.warn(TAG, "ERP.db not found at {}", dbPath);
                    return null;
                }
                discValConn = DriverManager.getConnection("jdbc:sqlite:" + dbPath);
                mepBomQuery = new MEPBOMQuery(discValConn);
                BIMLogger.info(TAG, "Opened ERP.db for MEP BOM queries");
                return mepBomQuery;
            } catch (Exception e) {
                BIMLogger.warn(TAG, "Failed to open ERP.db: {}", e.getMessage());
                return null;
            }
        }
    }

    /**
     * ARC discipline keyword for room category (furniture from M_Product catalog).
     */
    private static String arcProductKeyword(String roomCategory) {
        return switch (roomCategory != null ? roomCategory : "") {
            case "BEDROOM" -> "BED";
            case "KITCHEN" -> "SINK";
            case "BATHROOM" -> "TOILET";
            case "LIVING" -> "SOFA";
            default -> "";
        };
    }

    // Implementing BIM_Designer_SRS.md §16 — Witness: W-LAYOUT-1
    @Override
    public LayoutResponse addRoom(String buildingId, String category, String storey) {
        long t0 = System.currentTimeMillis();
        try {
            BIMLogger.info(TAG, "ADD_ROOM building={} category={} storey={}",
                    buildingId, category, storey);

            // Retrieve current bboxes from work_output.db or create minimal set
            List<DesignBBox> currentBboxes = getCurrentBboxes(buildingId);
            if (currentBboxes.isEmpty()) {
                BIMLogger.warn(TAG, "ADD_ROOM no current bboxes for {}", buildingId);
                return new LayoutResponse(false, List.of(), 0,
                        "No current layout for building: " + buildingId);
            }

            // Count current rooms by category to build CreateNewRequest params
            int numBed = 0, numBath = 0;
            boolean hasLiving = false, hasKitchen = false;
            String targetStorey = storey != null ? storey : "GF";
            double siteW = 0, siteD = 0;
            int storeyCount = 0;
            String buildingName = buildingId;

            for (DesignBBox bb : currentBboxes) {
                if ("BUILDING".equals(bb.bomType())) {
                    siteW = bb.maxX() - bb.minX();
                    siteD = bb.maxY() - bb.minY();
                    buildingName = bb.name();
                } else if ("FLOOR".equals(bb.bomType())) {
                    storeyCount++;
                } else if ("ROOM".equals(bb.bomType())) {
                    switch (bb.category()) {
                        case "BEDROOM"  -> numBed++;
                        case "BATHROOM" -> numBath++;
                        case "LIVING"   -> hasLiving = true;
                        case "KITCHEN"  -> hasKitchen = true;
                    }
                }
            }

            // Increment the target category
            switch (category) {
                case "BEDROOM"  -> numBed++;
                case "BATHROOM" -> numBath++;
                // LIVING and KITCHEN are fixed at 1 each in the layout generator
            }

            // Divide counts by storey count to get per-storey values
            int effectiveStoreys = Math.max(1, storeyCount);
            int perStoreyBed = (int) Math.ceil((double) numBed / effectiveStoreys);
            int perStoreyBath = (int) Math.ceil((double) numBath / effectiveStoreys);

            // Regenerate layout
            CreateNewRequest regen = new CreateNewRequest(
                    buildingName, "REGEN", "MY",
                    siteW, siteD,
                    perStoreyBed, perStoreyBath, effectiveStoreys);
            var newBboxes = RoomLayoutGenerator.generate(regen);

            int roomCount = (int) newBboxes.stream()
                    .filter(b -> "ROOM".equals(b.bomType())).count();

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "ADD_ROOM → {} bboxes ({} rooms) in {}ms",
                    newBboxes.size(), roomCount, elapsed);

            return new LayoutResponse(true, newBboxes, roomCount, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "addRoom failed", e);
            BIMLogger.error(TAG, "ADD_ROOM failed: {}", e.getMessage());
            return new LayoutResponse(false, List.of(), 0, e.getMessage());
        }
    }

    // Implementing BIM_Designer_SRS.md §16 — Witness: W-LAYOUT-2
    @Override
    public LayoutResponse removeRoom(String buildingId, String roomBomId) {
        long t0 = System.currentTimeMillis();
        try {
            BIMLogger.info(TAG, "REMOVE_ROOM building={} room={}", buildingId, roomBomId);

            List<DesignBBox> currentBboxes = getCurrentBboxes(buildingId);
            if (currentBboxes.isEmpty()) {
                BIMLogger.warn(TAG, "REMOVE_ROOM no current bboxes for {}", buildingId);
                return new LayoutResponse(false, List.of(), 0,
                        "No current layout for building: " + buildingId);
            }

            // Find the room to remove and verify it exists
            DesignBBox targetRoom = null;
            for (DesignBBox bb : currentBboxes) {
                if (bb.bomId().equals(roomBomId) && "ROOM".equals(bb.bomType())) {
                    targetRoom = bb;
                    break;
                }
            }
            if (targetRoom == null) {
                BIMLogger.warn(TAG, "REMOVE_ROOM room not found: {}", roomBomId);
                return new LayoutResponse(false, currentBboxes,
                        (int) currentBboxes.stream().filter(b -> "ROOM".equals(b.bomType())).count(),
                        "Room not found: " + roomBomId);
            }

            // Recount rooms without the target
            int numBed = 0, numBath = 0;
            double siteW = 0, siteD = 0;
            int storeyCount = 0;
            String buildingName = buildingId;

            for (DesignBBox bb : currentBboxes) {
                if ("BUILDING".equals(bb.bomType())) {
                    siteW = bb.maxX() - bb.minX();
                    siteD = bb.maxY() - bb.minY();
                    buildingName = bb.name();
                } else if ("FLOOR".equals(bb.bomType())) {
                    storeyCount++;
                } else if ("ROOM".equals(bb.bomType()) && !bb.bomId().equals(roomBomId)) {
                    switch (bb.category()) {
                        case "BEDROOM"  -> numBed++;
                        case "BATHROOM" -> numBath++;
                    }
                }
            }

            int effectiveStoreys = Math.max(1, storeyCount);
            int perStoreyBed = (int) Math.ceil((double) numBed / effectiveStoreys);
            int perStoreyBath = (int) Math.ceil((double) numBath / effectiveStoreys);

            // Regenerate layout with decremented counts
            CreateNewRequest regen = new CreateNewRequest(
                    buildingName, "REGEN", "MY",
                    siteW, siteD,
                    perStoreyBed, perStoreyBath, effectiveStoreys);
            var newBboxes = RoomLayoutGenerator.generate(regen);

            int roomCount = (int) newBboxes.stream()
                    .filter(b -> "ROOM".equals(b.bomType())).count();

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "REMOVE_ROOM → {} bboxes ({} rooms) in {}ms",
                    newBboxes.size(), roomCount, elapsed);

            return new LayoutResponse(true, newBboxes, roomCount, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "removeRoom failed", e);
            BIMLogger.error(TAG, "REMOVE_ROOM failed: {}", e.getMessage());
            return new LayoutResponse(false, List.of(), 0, e.getMessage());
        }
    }

    // Implementing BIM_Designer_SRS.md §16 — Witness: W-LAYOUT-3
    @Override
    public LayoutResponse addStorey(String buildingId) {
        long t0 = System.currentTimeMillis();
        try {
            BIMLogger.info(TAG, "ADD_STOREY building={}", buildingId);

            List<DesignBBox> currentBboxes = getCurrentBboxes(buildingId);
            if (currentBboxes.isEmpty()) {
                BIMLogger.warn(TAG, "ADD_STOREY no current bboxes for {}", buildingId);
                return new LayoutResponse(false, List.of(), 0,
                        "No current layout for building: " + buildingId);
            }

            // Parse current layout state
            int numBed = 0, numBath = 0;
            double siteW = 0, siteD = 0;
            int storeyCount = 0;
            String buildingName = buildingId;

            for (DesignBBox bb : currentBboxes) {
                if ("BUILDING".equals(bb.bomType())) {
                    siteW = bb.maxX() - bb.minX();
                    siteD = bb.maxY() - bb.minY();
                    buildingName = bb.name();
                } else if ("FLOOR".equals(bb.bomType())) {
                    storeyCount++;
                } else if ("ROOM".equals(bb.bomType()) && "GF".equals(bb.storey())) {
                    // Count GF rooms only (will be cloned for new storey)
                    switch (bb.category()) {
                        case "BEDROOM"  -> numBed++;
                        case "BATHROOM" -> numBath++;
                    }
                }
            }

            int newStoreyCount = storeyCount + 1;

            // Regenerate with one more storey
            CreateNewRequest regen = new CreateNewRequest(
                    buildingName, "REGEN", "MY",
                    siteW, siteD,
                    numBed, numBath, newStoreyCount);
            var newBboxes = RoomLayoutGenerator.generate(regen);

            int roomCount = (int) newBboxes.stream()
                    .filter(b -> "ROOM".equals(b.bomType())).count();

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "ADD_STOREY → {} storeys, {} bboxes ({} rooms) in {}ms",
                    newStoreyCount, newBboxes.size(), roomCount, elapsed);

            return new LayoutResponse(true, newBboxes, roomCount, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "addStorey failed", e);
            BIMLogger.error(TAG, "ADD_STOREY failed: {}", e.getMessage());
            return new LayoutResponse(false, List.of(), 0, e.getMessage());
        }
    }

    /**
     * Get current bboxes for a building — tries work_output.db latest variant,
     * falls back to empty list. Used by layout editing operations.
     */
    private List<DesignBBox> getCurrentBboxes(String buildingId) {
        try {
            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            var variants = woDao.listVariants(buildingId);
            if (!variants.isEmpty()) {
                String latestVariantId = variants.get(0).variantId();
                return woDao.recall(latestVariantId);
            }
        } catch (Exception e) {
            BIMLogger.warn(TAG, "getCurrentBboxes fallback for {}: {}", buildingId, e.getMessage());
        }
        return List.of();
    }

    // ── Approve gate (§18) ───────────────────────────────────────────

    // Implementing BIM_Designer_SRS.md §18.1 — Witness: W-APPROVE-1
    @Override
    public ApproveResponse approve(String buildingId) {
        long t0 = System.currentTimeMillis();
        try {
            BIMLogger.info(TAG, "APPROVE building={}", buildingId);

            // 1. Get latest bboxes from work_output.db
            List<DesignBBox> bboxes = getCurrentBboxes(buildingId);
            if (bboxes.isEmpty()) {
                BIMLogger.warn(TAG, "APPROVE no bboxes for {}", buildingId);
                return new ApproveResponse(false, "NO_DATA", 0, 0,
                        List.of(), List.of(), "No saved design for building: " + buildingId);
            }

            // 2. For each ROOM bbox: create PlacementRequest
            List<PlacementRequest> requests = new ArrayList<>();
            List<DesignBBox> roomBboxes = new ArrayList<>();
            for (DesignBBox bb : bboxes) {
                if (!"ROOM".equals(bb.bomType())) continue;
                double w = bb.maxX() - bb.minX();
                double d = bb.maxY() - bb.minY();
                double h = bb.maxZ() - bb.minZ();
                requests.add(new PlacementRequest(
                        bb.category(), bb.ifcClass(), null,
                        w, d, h,
                        bb.minX(), bb.minY(), bb.minZ(),
                        "APPROVE", 0, bb.storey()));
                roomBboxes.add(bb);
            }

            // 3. Collect all RuleResults via InferenceEngine
            List<com.bim.designer.validation.InferenceEngine.RuleResult> ruleResults;
            if (validator instanceof PlacementValidatorImpl pvi && validator.isActive()) {
                ruleResults = pvi.validateAll(requests);
            } else {
                // No active validator — all pass trivially
                ruleResults = List.of();
            }

            // 4. Tally results and collect blockers
            int passed = 0;
            int total = ruleResults.size();
            List<Blocker> blockers = new ArrayList<>();

            for (var result : ruleResults) {
                if (result.isPassed()) {
                    passed++;
                } else if (result.isBlocked()) {
                    // Find the corresponding room bbox by scanning roomBboxes
                    String bomId = roomBboxes.isEmpty() ? "unknown" : roomBboxes.get(0).bomId();
                    blockers.add(new Blocker(
                            bomId, result.ruleName(),
                            result.actualValue(), result.requiredValue(),
                            String.format("%s: %.1f < %.1f (%s)",
                                    result.ruleName(), result.actualValue(),
                                    result.requiredValue(), result.standardRef())));
                }
                // SKIP results don't count as passed or blocked
            }

            // 5. Check for dangles: ITEM bboxes referencing non-existent products
            List<String> dangles = new ArrayList<>();
            for (DesignBBox bb : bboxes) {
                if ("ITEM".equals(bb.bomType())) {
                    try {
                        var product = dao.getProduct(bb.name());
                        if (product == null) {
                            dangles.add(bb.bomId() + " -> " + bb.name());
                        }
                    } catch (Exception e) {
                        dangles.add(bb.bomId() + " -> " + bb.name());
                    }
                }
            }

            // 6. Determine status
            String status;
            boolean success;
            if (blockers.isEmpty() && dangles.isEmpty()) {
                status = "AP";
                success = true;
                // Persist AP status on master C_Order for promote gate
                try {
                    WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
                    woDao.setMasterDocStatus(buildingId, "AP");
                } catch (Exception ex) {
                    BIMLogger.warn(TAG, "APPROVE could not persist AP status: {}", ex.getMessage());
                }
            } else {
                status = "BLOCKED";
                success = false;
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "APPROVE {} → status={}, passed={}/{}, dangles={}, blockers={} in {}ms",
                    buildingId, status, passed, total, dangles.size(), blockers.size(), elapsed);

            return new ApproveResponse(success, status, passed, total,
                    dangles, blockers, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Approve failed", e);
            BIMLogger.error(TAG, "APPROVE failed for {}: {}", buildingId, e.getMessage());
            return new ApproveResponse(false, "ERROR", 0, 0,
                    List.of(), List.of(), e.getMessage());
        }
    }

    // ── Assembly Builder (§18.2 Principle 4, G-7) ────────────────────

    /**
     * Lazily open ERP.db for 6D/7D DAO queries (M_Product master catalog).
     */
    private Connection getCompLibConn() throws Exception {
        if (compLibConn == null) {
            synchronized (this) {
                if (compLibConn == null) {
                    String libPath = "library/ERP.db";
                    compLibConn = DriverManager.getConnection("jdbc:sqlite:" + libPath);
                    BIMLogger.info(TAG, "Opened ERP.db for 6D/7D queries");
                }
            }
        }
        return compLibConn;
    }

    /**
     * Get or create a ChangelogDAO for a building's work_output.db.
     */
    private ChangelogDAO getChangelogDAO(String buildingId) throws Exception {
        return changelogDaos.computeIfAbsent(buildingId, id -> {
            try {
                Connection woConn = workOutputConns.get(id);
                if (woConn == null) {
                    // Force work_output.db open
                    getWorkOutputDAO(id);
                    woConn = workOutputConns.get(id);
                }
                ChangelogDAO dao = new ChangelogDAO(woConn);
                dao.initSchema();
                return dao;
            } catch (Exception e) {
                throw new RuntimeException("Failed to create ChangelogDAO for " + id, e);
            }
        });
    }

    /**
     * Lazily open component_library.db and create AssemblyBuilderService.
     */
    private AssemblyBuilderService getAssemblyService() throws Exception {
        if (assemblyService == null) {
            synchronized (this) {
                if (assemblyService == null) {
                    String libPath = "library/component_library.db";
                    Connection libConn = DriverManager.getConnection("jdbc:sqlite:" + libPath);
                    assemblyService = new AssemblyBuilderService(libConn);
                    BIMLogger.info(TAG, "Opened component_library.db for assembly builder");
                }
            }
        }
        return assemblyService;
    }

    // Implementing ASSEMBLY_BUILDER_SRS.md §3.1 — Witness: W-ASM-LIST-1
    @Override
    public AssemblyListResponse listAssemblyTemplates(String category) {
        try {
            return getAssemblyService().listAssemblyTemplates(category);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "listAssemblyTemplates failed", e);
            return new AssemblyListResponse(false, List.of(), e.getMessage());
        }
    }

    // Implementing ASSEMBLY_BUILDER_SRS.md §3.1 — Witness: W-ASM-DETAIL-1
    @Override
    public AssemblyDetailResponse getAssemblyDetail(String layerSetName) {
        try {
            return getAssemblyService().getAssemblyDetail(layerSetName);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "getAssemblyDetail failed", e);
            return new AssemblyDetailResponse(false, layerSetName, null,
                    List.of(), 0, 0, null, e.getMessage());
        }
    }

    // Implementing ASSEMBLY_BUILDER_SRS.md §3.1 — Witness: W-ASM-BROWSE-1
    @Override
    public BrowseAssemblyLayersResponse browseAssemblyLayers(BrowseAssemblyLayersRequest request) {
        try {
            return getAssemblyService().browseAssemblyLayers(request);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "browseAssemblyLayers failed", e);
            return new BrowseAssemblyLayersResponse(false, request.layerSetName(),
                    request.layerSequence(), List.of(), e.getMessage());
        }
    }

    // Implementing ASSEMBLY_BUILDER_SRS.md §3.1 — Witness: W-ASM-SWAP-1
    @Override
    public AssemblyDetailResponse swapLayer(SwapLayerRequest request) {
        try {
            return getAssemblyService().swapLayer(request);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "swapLayer failed", e);
            return new AssemblyDetailResponse(false, request.layerSetName(), null,
                    List.of(), 0, 0, null, e.getMessage());
        }
    }

    // ── Variant comparison (§19) ─────────────────────────────────────

    // Implementing BIM_Designer_SRS.md §19 — Witness: W-COMPARE-1
    @Override
    public CompareVariantsResponse compareVariants(String buildingId, List<String> variantIds) {
        long t0 = System.currentTimeMillis();
        try {
            BIMLogger.info(TAG, "COMPARE_VARIANTS building={} variants={}",
                    buildingId, variantIds.size());

            if (variantIds == null || variantIds.size() < 2) {
                return new CompareVariantsResponse(false, List.of(), List.of(),
                        "At least 2 variant IDs required for comparison");
            }

            WorkOutputDAO woDao = getWorkOutputDAO(buildingId);
            List<VariantStats> stats = new ArrayList<>();
            List<List<DesignBBox>> allBboxes = new ArrayList<>();

            for (String variantId : variantIds) {
                List<DesignBBox> vBboxes = woDao.recall(variantId);
                allBboxes.add(vBboxes);

                // Compute stats
                int roomCount = 0;
                double totalArea = 0;
                for (DesignBBox bb : vBboxes) {
                    if ("ROOM".equals(bb.bomType())) {
                        roomCount++;
                        double w = bb.maxX() - bb.minX();
                        double d = bb.maxY() - bb.minY();
                        totalArea += (w * d) / 1_000_000.0;
                    }
                }

                // Find label
                String label = null;
                for (VariantInfo vi : woDao.listVariants(buildingId)) {
                    if (vi.variantId().equals(variantId)) {
                        label = vi.label();
                        break;
                    }
                }

                // Quick compliance check (if validator is active)
                int rulesPassed = 0;
                String compliance = "UNKNOWN";
                if (validator.isActive() && validator instanceof PlacementValidatorImpl pvi) {
                    List<PlacementRequest> requests = new ArrayList<>();
                    for (DesignBBox bb : vBboxes) {
                        if (!"ROOM".equals(bb.bomType())) continue;
                        double w = bb.maxX() - bb.minX();
                        double d = bb.maxY() - bb.minY();
                        double h = bb.maxZ() - bb.minZ();
                        requests.add(new PlacementRequest(
                                bb.category(), bb.ifcClass(), null,
                                w, d, h, bb.minX(), bb.minY(), bb.minZ(),
                                "COMPARE", 0, bb.storey()));
                    }
                    var results = pvi.validateAll(requests);
                    rulesPassed = (int) results.stream()
                            .filter(com.bim.designer.validation.InferenceEngine.RuleResult::isPassed)
                            .count();
                    boolean anyBlock = results.stream()
                            .anyMatch(com.bim.designer.validation.InferenceEngine.RuleResult::isBlocked);
                    compliance = anyBlock ? "BLOCKED" : "AP";
                }

                stats.add(new VariantStats(variantId, label, roomCount,
                        totalArea, compliance, rulesPassed));
            }

            // Compute field-level diffs between first two variants
            List<FieldDiff> diffs = new ArrayList<>();
            if (allBboxes.size() >= 2) {
                List<DesignBBox> v1 = allBboxes.get(0);
                List<DesignBBox> v2 = allBboxes.get(1);

                // Match rooms by bomId
                java.util.Map<String, DesignBBox> v1Map = new java.util.LinkedHashMap<>();
                for (DesignBBox bb : v1) {
                    if ("ROOM".equals(bb.bomType())) v1Map.put(bb.bomId(), bb);
                }

                for (DesignBBox bb2 : v2) {
                    if (!"ROOM".equals(bb2.bomType())) continue;
                    DesignBBox bb1 = v1Map.get(bb2.bomId());
                    if (bb1 == null) continue;

                    double w1 = bb1.maxX() - bb1.minX();
                    double w2 = bb2.maxX() - bb2.minX();
                    if (Math.abs(w1 - w2) > 0.1) {
                        diffs.add(new FieldDiff(bb1.bomId(), "width", w1, w2));
                    }

                    double d1 = bb1.maxY() - bb1.minY();
                    double d2 = bb2.maxY() - bb2.minY();
                    if (Math.abs(d1 - d2) > 0.1) {
                        diffs.add(new FieldDiff(bb1.bomId(), "depth", d1, d2));
                    }

                    double h1 = bb1.maxZ() - bb1.minZ();
                    double h2 = bb2.maxZ() - bb2.minZ();
                    if (Math.abs(h1 - h2) > 0.1) {
                        diffs.add(new FieldDiff(bb1.bomId(), "height", h1, h2));
                    }
                }
            }

            long elapsed = System.currentTimeMillis() - t0;
            BIMLogger.info(TAG, "COMPARE_VARIANTS → {} variants, {} diffs in {}ms",
                    stats.size(), diffs.size(), elapsed);

            return new CompareVariantsResponse(true, stats, diffs, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "compareVariants failed", e);
            BIMLogger.error(TAG, "COMPARE_VARIANTS failed: {}", e.getMessage());
            return new CompareVariantsResponse(false, List.of(), List.of(), e.getMessage());
        }
    }

    // ── Verb dispatch ───────────────────────────────────────────────

    // Implementing BBC.md §6 — Witness: W-VERB-DISPATCH-1
    @Override
    public VerbResponse executeVerb(String buildingId, String verbLine) {
        try {
            VerbRegistry registry = VerbRegistry.createDefault();
            VerbContext ctx = VerbContext.ofBom(bomConn);
            VerbResult<?> result = registry.dispatch(ctx, verbLine);

            BIMLogger.fine(TAG, "Designer dispatch: {} → {}",
                    verbLine, result.summary());

            return new VerbResponse(result.pass(), result.verb(),
                    result.summary(), result.pass() ? null : result.summary());
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Verb execution failed: " + verbLine, e);
            return new VerbResponse(false, null, null, e.getMessage());
        }
    }

    // ── Verb Emission — GUI → VerbStage Pipeline (§33) ──────────────

    // Implementing BBC.md §6 — GUI emits BIM COBOL verbs, never direct SQL
    // Implementing BIM_Designer_SRS.md §33 — Verb Emission Protocol
    // Witness: W-EMIT-1, W-EMIT-2, W-EMIT-3
    @Override
    public VerbExecutor.ExecutionReport emitVerbs(String buildingId, List<String> verbLines) {
        if (verbLines == null || verbLines.isEmpty()) {
            return new VerbExecutor.ExecutionReport(0, 0, 0, List.of());
        }

        // SPI: discover VerbExecutor implementation (same as VerbStage)
        VerbExecutor executor = java.util.ServiceLoader.load(VerbExecutor.class)
                .findFirst().orElse(null);

        if (executor == null) {
            BIMLogger.warn(TAG, "No VerbExecutor on classpath — cannot emit verbs");
            return new VerbExecutor.ExecutionReport(0, verbLines.size(), 0,
                    List.of("[FAIL] No VerbExecutor implementation on classpath"));
        }

        try {
            // Output connection: use work_output.db for this building
            Connection woConn = workOutputConns.computeIfAbsent(buildingId, id -> {
                try {
                    String dbPath = WorkOutputDAO.dbPathFor(id);
                    Connection c = DriverManager.getConnection("jdbc:sqlite:" + dbPath);
                    WorkOutputDAO initDao = new WorkOutputDAO(c);
                    initDao.initSchema();
                    return c;
                } catch (Exception e) {
                    throw new RuntimeException("Failed to open work_output.db for " + id, e);
                }
            });

            // Ensure W_Verb_Node tables exist for VerbNodePersister
            ensureVerbNodeSchema(woConn);

            woConn.setAutoCommit(false);
            VerbExecutor.ExecutionReport report =
                    executor.execute(bomConn, woConn, buildingId, verbLines);
            woConn.commit();

            BIMLogger.info(TAG, "emitVerbs({}) — {} pass, {} fail, {} nodes",
                    buildingId, report.passCount(), report.failCount(), report.totalNodes());

            return report;
        } catch (Exception e) {
            LOG.log(Level.WARNING, "emitVerbs failed for " + buildingId, e);
            return new VerbExecutor.ExecutionReport(0, verbLines.size(), 0,
                    List.of("[FAIL] " + e.getMessage()));
        }
    }

    /**
     * Ensure W_Verb_Node + W_Verb_NodeProduct tables exist on the output connection.
     * VerbNodePersister (called by BimCobolVerbExecutor) writes to these tables.
     * Safe to call repeatedly (IF NOT EXISTS).
     */
    private void ensureVerbNodeSchema(Connection conn) throws java.sql.SQLException {
        try (java.sql.Statement s = conn.createStatement()) {
            s.execute("""
                CREATE TABLE IF NOT EXISTS c_order (
                    C_Order_ID TEXT PRIMARY KEY
                )
            """);
            s.execute("""
                CREATE TABLE IF NOT EXISTS W_Verb_Node (
                    W_Verb_Node_ID  INTEGER PRIMARY KEY AUTOINCREMENT,
                    C_Order_ID        TEXT NOT NULL,
                    SeqNo             INTEGER NOT NULL DEFAULT 10,
                    Name              TEXT NOT NULL,
                    Description       TEXT NOT NULL,
                    S_Resource_ID     INTEGER,
                    M_Product_ID      TEXT,
                    IsActive          INTEGER DEFAULT 1,
                    DocStatus         TEXT DEFAULT 'DR'
                        CHECK(DocStatus IN ('DR','IP','CO','VO')),
                    last_result       TEXT,
                    element_count     INTEGER DEFAULT 0,
                    Created           TEXT DEFAULT (datetime('now')),
                    Updated           TEXT DEFAULT (datetime('now'))
                )
            """);
            s.execute("""
                CREATE TABLE IF NOT EXISTS W_Verb_NodeProduct (
                    W_Verb_NodeProduct_ID  INTEGER PRIMARY KEY AUTOINCREMENT,
                    W_Verb_Node_ID         INTEGER NOT NULL
                        REFERENCES W_Verb_Node(W_Verb_Node_ID),
                    Name                     TEXT NOT NULL,
                    Value                    TEXT NOT NULL,
                    ValueType                TEXT DEFAULT 'TEXT'
                        CHECK(ValueType IN ('TEXT','REAL','INTEGER')),
                    UNIQUE(W_Verb_Node_ID, Name)
                )
            """);
        }
    }

    // ── WF-BB §26 — Wireframe-First Interaction Protocol ──────────────

    @Override
    public ElementMetadataResponse getElementMetadata(String bomId, String buildingId) {
        // Implementing BIM_Designer_SRS.md §26.6 — Witness: W-WF-PEEK
        BIMLogger.info(TAG, "getElementMetadata bomId=" + bomId);
        try {
            // Query from the active building's saved design bboxes
            if (buildingId != null && !buildingId.isEmpty()) {
                List<DesignBBox> bboxes = getCurrentBboxes(buildingId);
                for (var bb : bboxes) {
                    if (bomId.equals(bb.bomId())) {
                        double w = bb.maxX() - bb.minX();
                        double d = bb.maxY() - bb.minY();
                        double h = bb.maxZ() - bb.minZ();
                        return new ElementMetadataResponse(
                                true, bomId, bb.name(),
                                bb.category() != null ? bb.category() : bb.bomType(),
                                new Dimensions(w, d, h),
                                null,  // material — TODO: query from library
                                null,  // constructionSystem
                                null,  // productId
                                null,  // costUnit
                                null,  // currency
                                List.of(),  // compliance — TODO: run validator
                                null);
                    }
                }
            }
            // Fallback: stub
            return new ElementMetadataResponse(
                    true, bomId, bomId, "UNKNOWN",
                    new Dimensions(0, 0, 0),
                    null, null, null, null, null, List.of(), null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "getElementMetadata error", e);
            return new ElementMetadataResponse(
                    false, bomId, null, null, null,
                    null, null, null, null, null, null, e.getMessage());
        }
    }

    @Override
    public ChainResponse getChain(String guid) {
        // Implementing BIM_Designer_SRS.md §26.12.1 — Witness: W-WF-CHAIN
        // Stub: returns single-element chain (no connectivity data yet)
        BIMLogger.info(TAG, "getChain guid=" + guid);
        return new ChainResponse(true, List.of(guid), null, null);
    }

    @Override
    public CostOfChangeResponse costOfChange(com.google.gson.JsonObject rawRequest) {
        // Implementing BIM_Designer_SRS.md §26.12.3 — Witness: W-WF-COST
        try {
            String buildingId = rawRequest != null && rawRequest.has("buildingId")
                    ? rawRequest.get("buildingId").getAsString() : null;
            if (buildingId == null || buildingId.isBlank()) {
                return new CostOfChangeResponse(false, 0.0, 0, 0.0, 0.0, "MYR",
                        List.of(), List.of(), "buildingId is required");
            }

            Connection clConn = getCompLibConn();
            CostDAO costDao = new CostDAO();
            CostDAO.CostSummary baseline = costDao.costBreakdown(bomConn, clConn, buildingId);

            BIMLogger.info(TAG, "costOfChange buildingId={}, materialTotal={}, lines={}",
                    buildingId, baseline.materialTotal(), baseline.lines().size());

            return new CostOfChangeResponse(
                    true,
                    baseline.materialTotal(),
                    baseline.lines().size(),
                    baseline.laborTotal(),
                    0.0,  // costDelta=0 — no diff yet (baseline only)
                    "MYR",
                    List.of(), List.of(), null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "costOfChange failed", e);
            return new CostOfChangeResponse(false, 0.0, 0, 0.0, 0.0, "MYR",
                    List.of(), List.of(), e.getMessage());
        }
    }

    @Override
    public MoveChainResponse moveChain(com.google.gson.JsonObject rawRequest) {
        // Implementing BIM_Designer_SRS.md §26.12/§26.13 — Witness: W-WF-DRAG-COMMIT
        // Stub: accepts the move, no actual DB write yet
        BIMLogger.info(TAG, "moveChain (stub)");
        return new MoveChainResponse(
                true, List.of(), 0.0, "MYR", null, null);
    }

    // ── 6D Sustainability (TIER1_SRS §1) ────────────────────────────

    // Implementing TIER1_SRS.md §1.4 — Witness: W-6D-CARBON-4
    @Override
    public CarbonFootprintResponse carbonFootprint(String buildingId) {
        try {
            Connection clConn = getCompLibConn();
            SustainabilityDAO sDao = new SustainabilityDAO();
            SustainabilityDAO.CarbonSummary summary =
                    sDao.carbonFootprint(bomConn, clConn, buildingId);

            List<CarbonLineInfo> lines = summary.lines().stream()
                    .map(l -> new CarbonLineInfo(l.bomId(), l.productName(),
                            l.material(), l.qty(), l.carbonPerUnit(),
                            l.totalCarbon(), l.recyclability(), l.eolStrategy()))
                    .toList();

            return new CarbonFootprintResponse(true,
                    summary.totalCarbonKg(), summary.carbonPerSqM(),
                    summary.grossFloorAreaSqM(), lines,
                    summary.byDiscipline(), summary.byMaterial(), null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "carbonFootprint failed", e);
            return new CarbonFootprintResponse(false, 0, 0, 0,
                    List.of(), java.util.Map.of(), java.util.Map.of(), e.getMessage());
        }
    }

    // ── 7D Facility Management (TIER1_SRS §2) ──────────────────────

    // Implementing TIER1_SRS.md §2.4 — Witness: W-7D-FM-5
    @Override
    public MaintenanceScheduleResponse maintenanceSchedule(String buildingId) {
        try {
            Connection clConn = getCompLibConn();
            FacilityMgmtDAO fmDao = new FacilityMgmtDAO();
            FacilityMgmtDAO.MaintenanceSchedule sched =
                    fmDao.maintenanceSchedule(bomConn, clConn, buildingId);

            List<MaintenanceItemInfo> items = sched.items().stream()
                    .map(i -> new MaintenanceItemInfo(i.bomId(), i.productName(),
                            i.location(), i.discipline(), i.intervalMonths(),
                            i.lifespanYears(), i.qtyInBuilding()))
                    .toList();

            return new MaintenanceScheduleResponse(true, buildingId,
                    sched.totalAssets(), sched.annualMaintenanceEvents(),
                    sched.byInterval(), items, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "maintenanceSchedule failed", e);
            return new MaintenanceScheduleResponse(false, buildingId,
                    0, 0, java.util.Map.of(), List.of(), e.getMessage());
        }
    }

    @Override
    public LifecycleCostResponse lifecycleCost(String buildingId, int horizonYears) {
        try {
            Connection clConn = getCompLibConn();
            FacilityMgmtDAO fmDao = new FacilityMgmtDAO();
            FacilityMgmtDAO.LifecycleSummary summary =
                    fmDao.lifecycleCost(bomConn, clConn, buildingId, horizonYears);

            List<LifecycleItemInfo> items = summary.items().stream()
                    .map(i -> new LifecycleItemInfo(i.productName(), i.material(),
                            i.lifespanYears(), i.qty(),
                            i.replacementCostUnit(), i.totalReplacementCost()))
                    .toList();

            return new LifecycleCostResponse(true, buildingId,
                    summary.totalReplacementCost(), summary.costByDecade(),
                    items, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "lifecycleCost failed", e);
            return new LifecycleCostResponse(false, buildingId,
                    0, java.util.Map.of(), List.of(), e.getMessage());
        }
    }

    // ── Audit Trail (TIER1_SRS §3) ─────────────────────────────────

    // Implementing TIER1_SRS.md §3.5 — Witness: W-AUDIT-WIRE-1
    @Override
    public ChangelogResponse changelog(String buildingId, int limit) {
        try {
            ChangelogDAO clDao = getChangelogDAO(buildingId);
            List<ChangelogDAO.ChangeEntry> entries = clDao.getChangelog(buildingId, limit);

            List<ChangeEntryInfo> infos = entries.stream()
                    .map(e -> new ChangeEntryInfo(e.changelogId(), e.buildingId(),
                            e.userId(), e.timestamp(), e.action(),
                            e.entityType(), e.entityId(), e.fieldName(),
                            e.oldValue(), e.newValue(), e.bomId()))
                    .toList();

            return new ChangelogResponse(true, infos, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "changelog failed", e);
            return new ChangelogResponse(false, List.of(), e.getMessage());
        }
    }

    @Override
    public UndoResponse undoChanges(String buildingId, int count) {
        try {
            ChangelogDAO clDao = getChangelogDAO(buildingId);
            int reverted = clDao.undoChanges(buildingId, count);
            return new UndoResponse(true, reverted, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "undoChanges failed", e);
            return new UndoResponse(false, 0, e.getMessage());
        }
    }

    // ── 4D Construction Schedule ────────────────────────────────────

    @Override
    public ScheduleResponse constructionSchedule(String buildingId, String projectStartDate) {
        try {
            Connection clConn = getCompLibConn();
            ScheduleDAO sDao = new ScheduleDAO();
            ScheduleDAO.ScheduleSummary summary =
                    sDao.constructionSchedule(bomConn, clConn, buildingId,
                            projectStartDate != null ? projectStartDate : "2026-04-01");

            List<ScheduleTaskInfo> tasks = summary.tasks().stream()
                    .map(t -> new ScheduleTaskInfo(t.taskId(), t.taskName(),
                            t.phase(), t.discipline(), t.sequence(), t.durationDays(),
                            t.startDate(), t.finishDate(), t.laborResource(),
                            t.crewSize(), t.dependency(), t.qty(), t.uom(),
                            t.isCritical()))
                    .toList();

            return new ScheduleResponse(true, buildingId,
                    summary.projectStartDate(), summary.projectFinishDate(),
                    summary.totalDays(), summary.totalTasks(),
                    summary.totalLaborDays(), tasks,
                    summary.tasksByPhase(), summary.laborDaysByResource(), null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "constructionSchedule failed", e);
            return new ScheduleResponse(false, buildingId,
                    null, null, 0, 0, 0,
                    List.of(), java.util.Map.of(), java.util.Map.of(), e.getMessage());
        }
    }

    // ── 5D Cost Breakdown ───────────────────────────────────────────

    @Override
    public CostBreakdownResponse costBreakdown(String buildingId) {
        try {
            Connection clConn = getCompLibConn();
            CostDAO cDao = new CostDAO();
            CostDAO.CostSummary summary = cDao.costBreakdown(bomConn, clConn, buildingId);

            List<CostLineInfo> lines = summary.lines().stream()
                    .map(l -> new CostLineInfo(l.bomId(), l.productName(),
                            l.discipline(), l.qty(), l.uom(),
                            l.materialCost(), l.laborCost(), l.equipmentCost(),
                            l.totalCost(), l.laborResource(), l.laborDays()))
                    .toList();

            return new CostBreakdownResponse(true, buildingId,
                    summary.grandTotal(), summary.materialTotal(),
                    summary.laborTotal(), summary.equipmentTotal(),
                    summary.materialPct(), summary.laborPct(), summary.equipmentPct(),
                    lines, summary.byDiscipline(), summary.byPhase(),
                    summary.byResource(), null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "costBreakdown failed", e);
            return new CostBreakdownResponse(false, buildingId,
                    0, 0, 0, 0, 0, 0, 0,
                    List.of(), java.util.Map.of(), java.util.Map.of(),
                    java.util.Map.of(), e.getMessage());
        }
    }

    // ── Portfolio / Back-Office ─────────────────────────────────────

    @Override
    public PortfolioResponse portfolio() {
        try {
            Connection clConn = getCompLibConn();
            PortfolioDAO pDao = new PortfolioDAO();
            PortfolioDAO.PortfolioSummary summary =
                    pDao.analysePortfolio("library", clConn);

            List<ProjectRowInfo> rows = summary.projects().stream()
                    .map(p -> new ProjectRowInfo(p.projectId(), p.projectName(),
                            p.facilityType(), p.docStatus(), p.bomLineCount(),
                            p.elementCount(), p.materialCostRm(), p.laborCostRm(),
                            p.equipmentCostRm(), p.totalCostRm(), p.carbonKg(),
                            p.carbonPerSqM(), p.scheduleDays(), p.laborDays(),
                            p.maintenanceAssets(), p.annualMaintEvents(),
                            p.lifespanAvgYears()))
                    .toList();

            return new PortfolioResponse(true, summary.totalProjects(),
                    summary.totalCostRm(), summary.totalCarbonKg(),
                    summary.totalBomLines(), summary.avgCostPerProject(),
                    summary.avgCarbonPerSqM(), summary.byFacilityType(),
                    summary.costByFacilityType(), rows, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "portfolio failed", e);
            return new PortfolioResponse(false, 0, 0, 0, 0, 0, 0,
                    java.util.Map.of(), java.util.Map.of(), List.of(), e.getMessage());
        }
    }

    @Override
    public KanbanResponse kanban() {
        try {
            Connection clConn = getCompLibConn();
            PortfolioDAO pDao = new PortfolioDAO();
            List<PortfolioDAO.KanbanCard> cards = pDao.kanbanBoard("library", clConn);

            List<KanbanCardInfo> infos = cards.stream()
                    .map(c -> new KanbanCardInfo(c.projectId(), c.projectName(),
                            c.status(), c.progress(), c.estCostRm(),
                            c.bomLines(), c.blockers()))
                    .toList();

            return new KanbanResponse(true, infos, null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "kanban failed", e);
            return new KanbanResponse(false, List.of(), e.getMessage());
        }
    }

    @Override
    public BalancedScorecardResponse balancedScorecard() {
        try {
            Connection clConn = getCompLibConn();
            PortfolioDAO pDao = new PortfolioDAO();
            PortfolioDAO.BalancedScorecard bsc = pDao.balancedScorecard("library", clConn);

            java.util.function.Function<List<PortfolioDAO.KpiEntry>, List<KpiInfo>> map =
                    list -> list.stream()
                            .map(k -> new KpiInfo(k.name(), k.value(), k.target(),
                                    k.unit(), k.status()))
                            .toList();

            return new BalancedScorecardResponse(true,
                    map.apply(bsc.financial()), map.apply(bsc.client()),
                    map.apply(bsc.process()), map.apply(bsc.learning()), null);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "balancedScorecard failed", e);
            return new BalancedScorecardResponse(false,
                    List.of(), List.of(), List.of(), List.of(), e.getMessage());
        }
    }
}
