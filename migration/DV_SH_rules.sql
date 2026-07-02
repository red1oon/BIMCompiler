-- ════════════════════════════════════════════════════════
-- SH: Sample House (SampleHouse)
-- Source: DAGCompiler/lib/output/samplehouse.db
-- Generated: 2026-06-22 23:06
-- ════════════════════════════════════════════════════════

-- §1: Structural dimensions per (ifc_class, storey)
-- Use: identify typical element sizes for validation rules

-- ifc_class            storey        cnt  avg_W_mm  avg_D_mm  avg_H_mm  min_W_mm  max_W_mm
-- -------------------  ------------  ---  --------  --------  --------  --------  --------
-- IfcFlowTerminal      ROOM GF       43   264.0     252.0     154.0     70.0      1200.0  
-- IfcMember            Unknown       20   499.0     581.0     1226.0    30.0      1603.0  
-- IfcFurniture         Ground Floor  14   1143.0    802.0     984.0     427.0     2287.0  
-- IfcOpeningElement    Unknown       7    1320.0    439.0     1596.0    95.0      1810.0  
-- IfcPlate             Unknown       6    829.0     955.0     3027.0    25.0      1633.0  
-- IfcWindow            Ground Floor  4    1860.0    353.0     1210.0    1860.0    1860.0  
-- IfcCovering          Ground Floor  3    6071.0    3690.0    57.0      4453.0    9308.0  
-- IfcDoor              Ground Floor  3    739.0     653.0     2133.0    178.0     1860.0  
-- IfcWall              Ground Floor  3    7797.0    2127.0    2884.0    290.0     14145.0 
-- IfcWallStandardCase  Ground Floor  2    2274.0    2803.0    2335.0    95.0      4453.0  

-- §2: Material distribution

-- ifc_class            material_name                                  cnt
-- -------------------  ---------------------------------------------  ---
-- IfcMember            Aluminium                                      20 
-- IfcFurniture         Wood - Birch                                   8  
-- IfcPlate             Glass                                          6  
-- IfcWindow            Window Frame                                   4  
-- IfcCovering          Compound Ceiling:Plain                         3  
-- IfcDoor              Door - Handle                                  3  
-- IfcFurniture         Metal - Chrome                                 3  
-- IfcWall              Brick, Common                                  3  
-- IfcWallStandardCase  Basic Wall:Wall-Partn_12P-70MStd-12P           2  
-- IfcFurniture         Laminate, Ivory, Matte                         1  
-- IfcFurniture         Textile - White                                1  
-- IfcFurniture         Wood - Mahogany                                1  
-- IfcRoof              Concrete, Sand/Cement Screed                   1  
-- IfcSlab              Floor:Floor-Grnd-Susp_65Scr-80Ins-100Blk-75PC  1  
-- IfcSlab              Floor:Simple floor                             1  

-- §3: Spacing patterns (adjacent element gaps)
-- Elements of the same ifc_class on the same storey, sorted by X


-- §4: IFC class inventory

-- ifc_class            discipline  cnt
-- -------------------  ----------  ---
-- IfcFlowTerminal      ELEC        28 
-- IfcMember            STR         20 
-- IfcFurniture         ARC         14 
-- IfcFlowTerminal      FP          12 
-- IfcOpeningElement    ARC         7  
-- IfcPlate             STR         6  
-- IfcWindow            ARC         4  
-- IfcCovering          ARC         3  
-- IfcDoor              ARC         3  
-- IfcFlowTerminal      ACMV        3  
-- IfcWall              STR         3  
-- IfcSlab              STR         2  
-- IfcWallStandardCase  STR         2  
-- IfcRoof              ARC         1  

-- §5: Candidate validation rules for ERP.db
-- Review and adjust before applying. Rule IDs are placeholders.

-- Rule: IfcFlowTerminal_ROOM_GF (43 instances, avg 264.0x252.0x154.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcFlowTerminal_ROOM_GF', 'IfcFlowTerminal', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcFlowTerminal on ROOM GF: 43 instances, avg W=264.0 D=252.0 H=154.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '264.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '252.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '154.0');

-- Rule: IfcMember_Unknown (20 instances, avg 499.0x581.0x1226.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcMember_Unknown', 'IfcMember', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcMember on Unknown: 20 instances, avg W=499.0 D=581.0 H=1226.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '499.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '581.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '1226.0');

-- Rule: IfcFurniture_Ground_Floor (14 instances, avg 1143.0x802.0x984.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcFurniture_Ground_Floor', 'IfcFurniture', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcFurniture on Ground Floor: 14 instances, avg W=1143.0 D=802.0 H=984.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '1143.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '802.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '984.0');

-- Rule: IfcOpeningElement_Unknown (7 instances, avg 1320.0x439.0x1596.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcOpeningElement_Unknown', 'IfcOpeningElement', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcOpeningElement on Unknown: 7 instances, avg W=1320.0 D=439.0 H=1596.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '1320.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '439.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '1596.0');

-- Rule: IfcPlate_Unknown (6 instances, avg 829.0x955.0x3027.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcPlate_Unknown', 'IfcPlate', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcPlate on Unknown: 6 instances, avg W=829.0 D=955.0 H=3027.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '829.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '955.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '3027.0');

-- Rule: IfcWindow_Ground_Floor (4 instances, avg 1860.0x353.0x1210.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcWindow_Ground_Floor', 'IfcWindow', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcWindow on Ground Floor: 4 instances, avg W=1860.0 D=353.0 H=1210.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '1860.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '353.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '1210.0');

-- Rule: IfcCovering_Ground_Floor (3 instances, avg 6071.0x3690.0x57.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcCovering_Ground_Floor', 'IfcCovering', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcCovering on Ground Floor: 3 instances, avg W=6071.0 D=3690.0 H=57.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '6071.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '3690.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '57.0');

-- Rule: IfcDoor_Ground_Floor (3 instances, avg 739.0x653.0x2133.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcDoor_Ground_Floor', 'IfcDoor', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcDoor on Ground Floor: 3 instances, avg W=739.0 D=653.0 H=2133.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '739.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '653.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '2133.0');

-- Rule: IfcWall_Ground_Floor (3 instances, avg 7797.0x2127.0x2884.0 mm)
-- INSERT INTO ad_val_rule (rule_name, ifc_class, check_method, severity, is_active,
--     description, provenance)
-- VALUES ('IfcWall_Ground_Floor', 'IfcWall', 'DIMENSION_RANGE', 'WARNING', 1,
--     'IfcWall on Ground Floor: 3 instances, avg W=7797.0 D=2127.0 H=2884.0mm',
--     'SampleHouse');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_width_mm', '7797.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_depth_mm', '2127.0');
-- INSERT INTO ad_val_rule_param (ad_val_rule_id, param_name, param_value)
-- VALUES (last_insert_rowid(), 'typical_height_mm', '2884.0');


