# BIM Intent Compiler — Systems Installer Guide

*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*

> **Foundation:** BBC · DATA_MODEL · BIM_COBOL · [MANIFESTO](MANIFESTO.md) · TestArchitecture

!!! note "BIM OOTB now runs in the browser — you probably don't need this guide"
    The product is **browser-based**: open the [front door](https://red1oon.github.io/bim-ootb/), or
    use the front door's **About → Run it yourself (DIY)** to download a one-step self-host script. **Zero
    Java, zero install.** See the **[User Guide](USER_GUIDE.md)**.

    This page is the **legacy / advanced path**: building the original **Java compiler + back-office +
    Blender** toolchain from source — only needed to compile buildings from raw IFC or run the server-side
    nD reporting stack. Most users can skip it entirely.

<div class="bim-banner" markdown>
<b>Legacy full-platform setup from source — Java, Maven, SQLite, Blender.</b> Prerequisites, build steps, and verification for developers building the original compiler/back-office toolchain.
</div>

**Audience:** Developers building the **Java** compiler + back-office from source (the browser app needs none of this).

**For WAN/Docker deployment** of the back-office server, see DEPLOYMENT.md.

---

## 1. Prerequisites

| Component | Version | Purpose | Check |
|-----------|---------|---------|-------|
| Java (JDK) | 17+ | Compiler, servers, all backend logic | `java --version` |
| Maven | 3.8+ | Build system, dependency management | `mvn --version` |
| SQLite | 3.40+ | Database engine (bundled via JDBC, CLI for inspection) | `sqlite3 --version` |
| Python | 3.10+ | IFC extraction (IfcOpenShell), Blender addon | `python3 --version` |
| Blender | 4.2+ | 3D viewport (BIM Designer GUI) | `blender --version` |
| Git | 2.30+ | Source control, LFS for binary assets | `git --version` |
| Docker | 24+ | WAN deployment (optional) | `docker --version` |
| IfcOpenShell | 0.8+ | IFC file parsing and extraction | `python3 -c "import ifcopenshell"` |
| Bonsai | 0.8+ | Blender BIM addon (federation viewer) | Bundled with IfcOpenShell |

**Tested on:** Ubuntu 24.04 (Linux 6.17), OpenJDK 17.0.18, Maven 3.8.7, Blender 5.0.1, IfcOpenShell 0.8.4, Bonsai 0.8.4-alpha.

---

## 2. Clone and Build

```bash
# 2.1 Clone the repository
git clone git@github.com:red1oon/BIMCompiler.git
cd BIMCompiler

# 2.2 Compile all 10 modules
mvn compile -q

# 2.3 Verify — run the full test gate
./scripts/run_tests.sh
```

**Expected output:** ~382 PASS, ~94 intentional RED (pre-existing calibration items — see `scripts/run_tests.sh` header for breakdown).

**Module build order** (Maven reactor handles this automatically):

```
orm-core          → base ORM, BIMLogger
ORMSandbox        → DAO smoke tests
DAGCompiler       → 11-stage compilation pipeline
2D_Layout         → floor plan generation
TopologyMaker     → grid strategy, PO lifecycle
BIM_COBOL         → 77 domain verbs, witness engine
IFCtoBOM          → IFC extraction to BOM database
BIMBackOffice     → ERP reporting, sessions, portfolio
BIMEyes           → geometric comprehension, shape proofs
BonsaiBIMDesigner → GUI server, validation, assembly
```

---

## 3. Database Files

The `library/` directory contains all SQLite databases. These ship with the repo.

### 3.1 Core Databases (required)

| File | Size | Purpose |
|------|------|---------|
| `component_library.db` | ~230 MB | Master catalog: 35 component types, 23,888 component definitions + geometries, thermal properties (80 tables) |
| `ERP.db` | ~18 MB | Discipline validation rules, IFC class mapping, MEP metadata (52 tables) |
| `validation.db` | ~80 KB | Compliance thresholds: clash, occupancy & validation rules + results (9 tables) |

### 3.2 Per-Building BOM Databases (one per building)

| File | Building | Elements | Purpose |
|------|----------|----------|---------|
| `SH_BOM.db` | Sample House | — | Hello-world residential |
| `FK_BOM.db` | FZK Haus | 82 | Small residential |
| `DX_BOM.db` | Duplex | 1,099 | Multi-unit residential |
| `TE_BOM.db` | Terminal | 48,428 | Commercial airport terminal |
| `BR_BOM.db` | Bridge | 48 | Infrastructure |
| `RD_BOM.db` | Road | 53 | Infrastructure |
| `RL_BOM.db` | Rail | 73 | Infrastructure |
| `IN_BOM.db` | Infrastructure (combined) | 174 | Multi-facility infrastructure |
| `DM_BOM.db` | DemoHouse | — | Generative template |

### 3.3 Working Databases (generated at runtime)

| File | Created By | Purpose |
|------|-----------|---------|
| `work_*.db` | BonsaiBIMDesigner | Design variants, C_Order snapshots |
| `_*_compile.db` | DAGCompiler | Temporary compile output (per run) |
| `output_template.db` | Pipeline | Schema template for fresh output DBs |

### 3.4 Inspecting Databases

```bash
# List tables
sqlite3 library/SH_BOM.db ".tables"

# Check BOM hierarchy
sqlite3 library/SH_BOM.db "SELECT bom_type, name, m_product_category_id FROM m_bom"

# Check product catalog
sqlite3 library/component_library.db "SELECT COUNT(*) FROM component_definitions"

# Check validation rules
sqlite3 library/ERP.db "SELECT COUNT(*) FROM AD_Val_Rule"
```

---

## 4. Running the Servers

### 4.1 BIM Designer Server (TCP, port 9876)

For Blender addon clients — single-user design mode:

```bash
mvn exec:java -pl BonsaiBIMDesigner \
    -Dexec.mainClass="com.bim.designer.api.DesignerServer" \
    -Dexec.args="library 9876" -q
```

Or from compiled classes:

```bash
java -cp "BonsaiBIMDesigner/target/classes:BIMBackOffice/target/classes:DAGCompiler/target/classes:BIM_COBOL/target/classes:IFCtoBOM/target/classes:orm-core/target/classes:$(mvn -q dependency:build-classpath -pl BonsaiBIMDesigner -Dmdep.outputFile=/dev/stdout)" \
    com.bim.designer.api.DesignerServer library 9876
```

**Protocol:** ndjson over TCP. One JSON object per line, newline-delimited.

### 4.2 Back Office Server (HTTP, port 9877)

For multi-project ERP reporting, portfolio, 4D-7D queries:

```bash
java -cp "BIMBackOffice/target/classes:orm-core/target/classes:$(mvn -q dependency:build-classpath -pl BIMBackOffice -Dmdep.outputFile=/dev/stdout)" \
    com.bim.backoffice.server.BackOfficeServer library 9877
```

**Verify:**

```bash
curl http://localhost:9877/api/health
curl http://localhost:9877/api/portfolio
curl http://localhost:9877/api/cost?id=SH
```

### 4.3 Datasette — Database Browser & ERD (HTTP, port 8001)

Interactive SQL browser for all project databases. Provides table browsing, ad-hoc SQL queries,
JSON API, and CSV export — no Java or SQLite CLI needed.

**Install (one-time, in project venv):**

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install datasette
```

**Launch:**

```bash
source .venv/bin/activate
datasette library/component_library.db \
          library/ERP.db \
          library/SH_BOM.db library/DX_BOM.db library/TE_BOM.db \
          library/BR_BOM.db library/RD_BOM.db library/RL_BOM.db \
          --port 8001 --host 127.0.0.1 \
          --setting sql_time_limit_ms 5000 &
```

**Browse:**
- Home page: `http://localhost:8001/` — lists all databases and tables
- Table view: `http://localhost:8001/component_library/M_Product` — paginated rows
- SQL console: `http://localhost:8001/component_library?sql=SELECT+COUNT(*)+FROM+M_Product`
- JSON API: append `.json` to any URL for machine-readable output

**Datasette reads SQLite files live** — no restart needed after migrations or recompiles.
Changes to `component_library.db`, `ERP.db`, or `*_BOM.db` are visible immediately.

### 4.4 All Servers (typical setup)

Run in separate terminals or background:

```bash
# Terminal 1: Designer (for Blender)
mvn exec:java -pl BonsaiBIMDesigner \
    -Dexec.mainClass="com.bim.designer.api.DesignerServer" \
    -Dexec.args="library 9876" -q &

# Terminal 2: Back Office (for browser/API clients)
java -cp "BIMBackOffice/target/classes:orm-core/target/classes:$(mvn -q dependency:build-classpath -pl BIMBackOffice -Dmdep.outputFile=/dev/stdout)" \
    com.bim.backoffice.server.BackOfficeServer library 9877 &

# Terminal 3: Datasette (database browser)
source .venv/bin/activate
datasette library/*.db --port 8001 --host 127.0.0.1 \
    --setting sql_time_limit_ms 5000 &
```

---

## 5. Running the Compilation Pipeline

### 5.1 Rosetta Stone Buildings (full pipeline)

```bash
# Compile all Rosetta Stone buildings (SH, DX, TE, infrastructure)
./scripts/run_RosettaStones.sh classify_sh.yaml    # Sample House
./scripts/run_RosettaStones.sh classify_dx.yaml    # Duplex
./scripts/run_RosettaStones.sh classify_te.yaml    # Terminal
./scripts/run_RosettaStones.sh classify_in.yaml    # Infrastructure
```

### 5.2 Onboarding a New IFC Building

To add a new building to the pipeline (zero code changes required):

```bash
# Generate skeleton YAML + DSL from an extracted reference DB
mvn exec:java -pl IFCtoBOM \
    -Dexec.mainClass="com.bim.ifctobom.NewBuildingGenerator" \
    -Dexec.args="--prefix XX --type BuildingType --name 'Name'" -q
```

Then follow the 8-step process in **IFC_ONBOARDING_RUNBOOK.md** —
from IFC extraction through gate verification. Proven on 5 Rosetta Stone buildings.

**Quick version** (if YAML + DSL already exist):

```bash
./scripts/run_RosettaStones.sh classify_xx.yaml
```

Output: `library/XX_BOM.db` (per-building BOM dictionary).

### 5.3 DAGCompiler (compile BOM to output)

```bash
mvn exec:java -pl DAGCompiler \
    -Dexec.mainClass="com.bim.compiler.CompilationPipeline" \
    -Dbom.db="library/SH_BOM.db" -q
```

---

## 6. Blender + Bonsai Integration (legacy)

!!! warning "Superseded by the browser Modeller"
    The desktop **BIM Designer** (Blender + Bonsai + the Java DesignerServer below) has been **replaced by
    the in-browser [DAGeVu Modeller](ModellerGuide.md)** — author geometry over a signed op-log, no Blender,
    no server. This section is kept only for the original Blender-based federation workflow.

The legacy BIM Designer GUI runs inside Blender via the [Bonsai](https://bonsaibim.org/) addon
(the open-source OpenBIM toolset). Two components work together:

1. **Federation Module** — IFC spatial database, clash detection, MEP routing, 4D/5D,
   digital twin. Pure Python, runs inside Blender. No server needed.
2. **BIM Designer Server** — Java compilation backend (TCP :9876). Blender sends
   ndjson commands, Java returns BOM data, compiled geometry, and validation results.

### 6.1 Federation Module Setup

The Federation module lives in a separate repo (fork of IfcOpenShell/Bonsai):

```bash
# 1. Clone the federation branch
git clone -b feature/IFC4_DB git@github.com:red1oon/IfcOpenShell.git ~/IfcOpenShell

# 2. Install system dependency (R-tree spatial index)
sudo apt install libspatialindex-dev    # Ubuntu/Debian
# brew install spatialindex              # macOS

# 3. Install Python dependency
pip install rtree

# 4. Register the federation module in Bonsai
# Edit: ~/IfcOpenShell/src/bonsai/bonsai/bim/__init__.py
# Add to the modules dict:  "federation": None
```

**Addon path:** `~/IfcOpenShell/src/bonsai/bonsai/bim/module/federation/`
**Documentation:** `federation/README.md` (750 lines — full user guide, CLI examples)

### 6.2 Blender Addon Activation

1. Open Blender → Edit → Preferences → Add-ons
2. Point to the Bonsai addon directory (`~/IfcOpenShell/src/bonsai/`)
3. Enable "Bonsai BIM" addon
4. The Federation module registers automatically (~260 Blender classes)
5. Verify: Federation panels appear in the N-panel sidebar

### 6.3 Federation Features (no server required)

The Federation module preprocesses IFC files into SQLite databases for sub-100ms
spatial queries inside Blender:

```bash
# Preprocess IFC files (can run standalone, outside Blender)
python3 -m bonsai.bim.module.federation.core.federation_preprocessor \
    model1.ifc model2.ifc --output federation.db
```

| Feature | Panel | Status |
|---------|-------|--------|
| Multi-model spatial index | Setup | Production |
| Clash detection + BCF export | Clash | Production |
| MEP conduit routing | MEP | Production |
| 4D construction scheduling | 4D | Production |
| 5D cost (Bill of Quantities) | 5D | Production |
| Digital Twin (sensors, assets) | Digital Twin | Beta |
| NLP natural language queries | NLP | Beta |
| PDF → BIM terrain extraction | Setup | Beta |

### 6.4 Connecting Blender to the BIM Designer Server

Start the Java server (§4.1), then connect from Blender:

```python
# In Blender's Python console or addon:
import socket, json

sock = socket.create_connection(("127.0.0.1", 9876))
request = json.dumps({"action": "listBuildings"}) + "\n"
sock.sendall(request.encode())
response = sock.makefile().readline()
print(json.loads(response))
```

**Protocol:** ndjson over TCP. One JSON object per line, newline-delimited.
Server actions: `compile`, `createNew`, `verb`, `snap`, `save`, `recall`, `promote`.
See the wire protocol spec for the full wire protocol spec.

### 6.5 Putting It All Together

A typical development setup runs 4 services:

```
┌─────────────────┐     TCP :9876      ┌──────────────────────┐
│  Blender 4.2+   │ ◄──── ndjson ────► │  BIM Designer Server │
│  + Bonsai addon │                    │  (Java, mvn exec)    │
│  + Federation   │                    └──────────┬───────────┘
└────────┬────────┘                               │
         │ local files                    reads   │
         ▼                                        ▼
┌─────────────────┐                    ┌──────────────────────┐
│  federation.db  │                    │  library/*.db        │
│  (IFC spatial)  │                    │  component_library.db│
└─────────────────┘                    │  ERP.db, validation  │
                                       │  *_BOM.db files      │
  http://localhost:8001                └──────────────────────┘
┌─────────────────┐                               │
│  Datasette      │ ◄── reads SQLite files ───────┘
│  (DB browser)   │
└─────────────────┘

  http://localhost:9877
┌─────────────────┐
│  BackOffice     │ ◄── portfolio, cost, 4D-7D reports
│  (HTTP API)     │
└─────────────────┘
```

---

## 7. Test Suites

### 7.1 Full Gate

```bash
./scripts/run_tests.sh          # All suites
```

### 7.2 Individual Modules

```bash
./scripts/run_tests.sh dag      # DAGCompiler (pipeline + gates)
./scripts/run_tests.sh orm      # ORMSandbox (DAO layer)
./scripts/run_tests.sh topology # TopologyMaker (grid strategy)
./scripts/run_tests.sh cobol    # BIM_COBOL (verb witnesses)
```

### 7.3 BonsaiBIMDesigner (408 tests)

```bash
mvn test -pl BonsaiBIMDesigner 2>&1 | tail -5
```

### 7.4 BIMBackOffice (14 tests)

```bash
mvn test -pl BIMBackOffice 2>&1 | tail -5
```

### 7.5 Tamper Seal Verification

```bash
./scripts/verify_test_seal.sh
```

Checks SHA256 fingerprints of 68 critical files. If any have changed since the last seal ceremony, the seal breaks.

---

## 8. WAN Deployment (Docker)

See DEPLOYMENT.md for full instructions. Quick summary:

```bash
# Generate TLS certificates
./deploy/generate-certs.sh

# Set session signing secret
export BIM_SESSION_SECRET="your-secret-here"

# Launch
docker-compose up -d

# Verify
curl -k https://your-server/api/health
```

**Architecture:**

```
Internet → nginx:443 (TLS) → BackOfficeServer:9877 (HTTP) → SQLite DBs
                                      ↓
                               SessionManager
                               (HMAC tokens, per-DB write locks, WAL mode)
```

---

## 9. Migration Scripts

SQL migrations are in `migration/` — **append-only, never modify existing**.

| Migration | Purpose |
|-----------|---------|
| `ASM001_material_thermal.sql` | Thermal conductivity table for U-value calculation |
| `ASM003_ac11_materials.sql` | AC11 material properties |
| `DV006b_infra_bridge_rules_fix.sql` | Bridge validation rules fix |
| `DV007_infra_road_rules.sql` | Road discipline rules (10 rules) |
| `DV008_infra_rail_rules.sql` | Rail discipline rules (7 rules) |

**Running a migration:**

```bash
sqlite3 library/ERP.db < migration/DV007_infra_road_rules.sql
```

---

## 10. Directory Structure

```
BIMCompiler/
├── orm-core/              # Base ORM, BIMLogger, shared utilities
├── ORMSandbox/            # DAO smoke tests, BuildingInspector
├── DAGCompiler/           # 11-stage compilation pipeline (G1-G6 gates)
├── 2D_Layout/             # Floor plan generation
├── TopologyMaker/         # Grid strategy, production order lifecycle
├── BIM_COBOL/             # 77 domain verbs, witness engine
├── IFCtoBOM/              # IFC extraction → BOM database pipeline
├── BIMBackOffice/         # ERP reporting, sessions, portfolio, 4D-7D
├── BIMEyes/               # Geometric comprehension: 28 shape proofs
├── BonsaiBIMDesigner/     # GUI server, validation, assembly, placement
├── library/               # SQLite databases (product catalog, BOMs)
├── migration/             # SQL migration scripts (append-only)
├── scripts/               # Build, test, and audit shell scripts
├── deploy/                # nginx config, TLS cert generator
├── docs/                  # All specifications and analysis documents
├── docker-compose.yml     # WAN deployment
├── Dockerfile             # Multi-stage build
└── pom.xml                # Parent POM (10 modules)
```

---

## 11. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `mvn compile` fails | Missing JDK 17 | Install OpenJDK 17: `sudo apt install openjdk-17-jdk` |
| `sqlite3: command not found` | SQLite CLI not installed | `sudo apt install sqlite3` |
| Port 9876/9877 in use | Server already running | `lsof -i :9876` then kill the process |
| `ClassNotFoundException` | Incomplete build | `mvn compile -q` (compile all modules first) |
| Test seal BROKEN | Files changed since last seal | Expected during development; run `./scripts/verify_test_seal.sh` to see which files |
| `No such database: XX_BOM.db` | BOM not extracted yet | Run `./scripts/run_RosettaStones.sh classify_xx.yaml` |
| IfcOpenShell import error | Python package missing | `pip install ifcopenshell` or use conda |
| Blender addon not showing | Addon not enabled | Blender → Preferences → Add-ons → search "Bonsai" → enable |
| CORS errors in browser | Direct access without proxy | Use nginx proxy (see DEPLOYMENT.md) or add `--cors` flag |
| `HMAC signing failed` | JDK crypto issue | Ensure standard JDK (not headless-minimal) |

---

## 12. Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BIM_SESSION_SECRET` | (random per JVM) | HMAC-SHA256 key for session token signing |
| `BIM_LIBRARY_DIR` | `./library` | Path to database directory |
| `BIM_LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARN, ERROR) |

---

## 13. Verification Checklist

After installation, verify each layer:

```bash
# 1. Build compiles
mvn compile -q && echo "BUILD OK"

# 2. Databases accessible
sqlite3 library/component_library.db "SELECT COUNT(*) FROM component_definitions"
# Expected: 23,888

# 3. Tests pass
mvn test -pl BIMBackOffice -Dtest="BackOfficeServerTest" 2>&1 | grep "Tests run"
# Expected: Tests run: 14, Failures: 0

# 4. Designer server starts
timeout 5 mvn exec:java -pl BonsaiBIMDesigner \
    -Dexec.mainClass="com.bim.designer.api.DesignerServer" \
    -Dexec.args="library 9876" -q &
sleep 2 && echo '{"action":"listBuildings"}' | nc -w2 localhost 9876
kill %1 2>/dev/null

# 5. Back Office server starts
curl -s http://localhost:9877/api/health 2>/dev/null | grep -q "UP" && echo "BACKOFFICE OK"

# 6. Rosetta Stone compiles
./scripts/run_RosettaStones.sh classify_sh.yaml 2>&1 | tail -3
```

---

## 14. ERD Diagrams & Database Browsing

### 14.1 Datasette — Live Database ERD (port 8001)

Datasette (§4.3) serves as the **live ERD and data browser**. Every table's schema, foreign keys,
and row counts are visible at `http://localhost:8001/`. No manual refresh needed — Datasette
reads SQLite files directly, so schema changes from migrations or table drops are reflected
immediately.

| URL | What it shows |
|-----|---------------|
| `http://localhost:8001/` | All databases, table counts |
| `http://localhost:8001/component_library` | All 80 tables with row counts and schema |
| `http://localhost:8001/ERP` | All 52 discipline-validation & MEP metadata tables |
| `http://localhost:8001/SH_BOM` | Sample House BOM structure |
| `http://localhost:8001/component_library/M_Product` | Paginated product catalog rows |

### 14.2 Interactive Architecture Viz (HTML)

One interactive ERD in `database/` — clickable tables with detail panels, compilation pipeline, BOM tree:

| File | Content | How to View |
|------|---------|-------------|
| `database/bim_architecture_viz.html` | 4-DB architecture, clickable tables, pipeline steps, BOM tree | Open in any browser |

**Full schema reference:** `database/DATABASE_SCHEMA.md` — complete table inventory with purpose, Java access, and review status.

**Serving on a network:**

```bash
cd database && python3 -m http.server 8080
# Browse: http://localhost:8080/bim_architecture_viz.html
```

### When to refresh

The architecture viz is **hand-authored HTML** — update when tables are added/dropped.
For live schema inspection, use Datasette instead (§4.3).

```bash
# Schema snapshot for comparison
sqlite3 library/component_library.db ".schema" > database/schema_snapshot_component_library.sql
```

---

## 15. Database Schema Reference

Full table inventory with purpose, Java access patterns, and review status:
**[`database/DATABASE_SCHEMA.md`](https://github.com/red1oon/BIMCompiler/blob/master/database/DATABASE_SCHEMA.md)**

Quick summary: component_library.db (80 tables), ERP.db (52 tables),
validation.db (9 tables), {PREFIX}_BOM.db (~11 tables per building), output.db (written fresh each compile).

---

## 16. Docker — What to Containerize

### What Docker is for

Docker wraps the **Back Office HTTP server** for WAN deployment. This is the only component that needs containerization — it's a stateless API server with SQLite databases mounted as a volume.

### What Docker is NOT for

| Component | Why not Docker |
|-----------|---------------|
| Blender + BIM Designer | Desktop GUI, needs OpenGL/GPU, user interaction |
| IFCtoBOM extraction | Batch CLI, runs once per building, needs local IFC files |
| DAGCompiler pipeline | Batch CLI, runs once per compile, development tool |
| Test suites | Development-time only, need full Maven + JDK |
| Migration scripts | One-shot `sqlite3` commands, run locally |

### Docker architecture

```
┌─────────────────────────────────────────────────┐
│                  WAN / Internet                  │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │   nginx:443 (TLS)     │  ← docker-compose service
         │   SSL termination     │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  BackOfficeServer     │  ← docker-compose service
         │  :9877 (HTTP)         │
         │  HMAC session tokens  │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  /data/library/       │  ← bind-mounted volume
         │  component_library.db │
         │  ERP.db, validation   │
         │  *_BOM.db files       │
         └───────────────────────┘
```

### Quick start

```bash
# 1. Build
docker-compose build

# 2. Set HMAC secret (production — don't skip this)
export BIM_SESSION_SECRET="$(openssl rand -hex 32)"

# 3. Generate TLS certs (if not using Let's Encrypt)
./deploy/generate-certs.sh

# 4. Launch
docker-compose up -d

# 5. Verify
curl -k https://localhost/api/health
docker-compose logs -f backoffice
```

### Updating databases in Docker

The `library/` directory is bind-mounted, so database updates are live:

```bash
# Run a migration against the mounted volume
sqlite3 ./library/ERP.db < migration/DV008_infra_rail_rules.sql

# Recompile a building (output goes to same library/)
./scripts/run_RosettaStones.sh classify_sh.yaml

# No container restart needed — SQLite reads see changes immediately
```

---

*For the project overview paper, see [BIMERPPaper.md](BIMERPPaper.md).*
*For the end-user installer specification, see [INSTALLER_SPEC.md](https://github.com/red1oon/BIMCompiler/blob/master/internal/INSTALLER_SPEC.md).*
*For the WAN/Docker deployment guide, see DEPLOYMENT.md.*

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
