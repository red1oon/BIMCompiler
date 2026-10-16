# Asset Classification & JKR / SKATA Compliance

> **Status: measurement works, certification does not.** BIM OOTB can tell you *how far* a model is
> from carrying compliant asset codes, with numbers you can reproduce. It cannot yet certify a model
> as SKATA-compliant, and it will refuse to pretend otherwise. Read [What this does not do](#what-this-does-not-do-yet)
> before quoting anything here to a client.

---

## Why asset codes exist at all

A building is tens of thousands of objects. To cost it, schedule it, procure it or maintain it, you
have to ask questions *across* those objects — what does the exterior enclosure cost, when is
sanitaryware installed, what do we service in year five. Free-text names cannot answer those:
`System Panel:Glazed SSG` does not aggregate with `Verglasung`. A **classification code** can.

Different standards organise the same building along different axes, and they are not competitors:

| Standard | Organises by | Typically used for |
|---|---|---|
| **MasterFormat** (CSI) | work result / trade | specifications, tendering |
| **UniFormat II** (ASTM E1557) | function / element | early cost estimating |
| **OmniClass** (CSI) | many faceted tables | attempts to span all axes |
| **Uniclass 2015** (NBS, UK) | systems, products, spaces | UK public work |
| **SKATA** (JKR, Malaysia) | government fixed-asset register | Malaysian public handover |

UniFormat exists so a quantity surveyor can price "exterior enclosure" *before* anyone decides brick or
curtain wall. MasterFormat cannot — it needs to know the trade first. The same wall legitimately carries
both codes.

## What SKATA is

**SKATA** — *Sistem Kod Aset Tak Alih* — is Malaysia's government fixed/immovable asset coding system,
published by JKR (Jabatan Kerja Raya). It is paired with **PeDATA**, which governs asset data collection
and labelling.

Since **1 July 2025**, BIM is mandatory for Malaysian projects of **RM10 million and above**, public and
private, under the Construction 4.0 Strategic Plan. Deliverables are expected to follow the CIDB BIM
Guidelines and hand over **LOD 500** models carrying asset data conforming to PeDATA and SKATA.

SKATA v2.0 defines **two** code families, which is the detail most tools get wrong:

- **DPA** — *Kod Daftar Premis Aset*. Location and ownership. **One code per building**, not per element.
  4–9 segments. The building form is `9 999 999 AAA 99 99 99 AA 9999` — agency group, ministry,
  department, country, state, district, mukim, premise category, ID (`9` = a digit, `A` = a letter).
- **DAK** — *Kod Daftar Aset Khusus*. Construction and components. 9–11 segments. This is the per-element
  code — the document calls it the labelling guide for assets and components.

SKATA is also **not self-contained**: it defers to two upstream standards, **DDSA** (Data Dictionary
Sektor Awam) and **MS 1759**, which are revised independently.

---

## How a building actually gets coded

The most common misconception is that classification is applied to a finished model. It is not.
**The code is set once on the family *type*, and every instance inherits it.**

```
 1. Classification table loaded into the authoring tool
      (Revit: Manage → Additional Settings → Assembly Code)
 2. "Assembly Code" set on each family TYPE          ← the only manual step
 3. Every instance of that type inherits it — free, forever
 4. IFC exporter writes IfcRelAssociatesClassification   ← silent-loss step
 5. BIM OOTB reads it back and reports on it
```

**Step 4 is where models quietly lose their codes.** If the exporter is not configured to write the
parameter out, the code exists in the authoring tool and is absent from the IFC — indistinguishable, on
inspection, from nobody having coded it at all.

**Step 2 is the entire workload, and it is far smaller than it looks.** Measured on a real 63,415-element
hospital model: **339 distinct family types**. The twenty largest types cover **61.7%** of all elements.
Nobody codes 63,415 things. They code a few hundred, once — and ideally in the project *template*, so
every future project inherits the work.

## Who does what

| Role (ISO 19650) | In practice |
|---|---|
| **Appointing Party** (the client, e.g. JKR) | writes the EIR — what data is required at handover |
| **Lead Appointed Party** | writes the BEP answering it |
| **Information Manager** | owns the CDE, enforces the standard |
| **BIM Manager** | **the real owner of compliance** — sets up templates and families so codes are automatic |
| **Modeller** | places elements; should never hand-type a code |
| **QS / cost manager** | consumes elemental codes to price |
| **FM / asset manager** | the eventual consumer, and the reason any of it exists |

Compliance is effectively decided by the BIM Manager at template setup — months before anyone notices —
and audited at handover, when it is expensive to fix. Everyone in between inherits a decision they did
not make.

---

## What BIM OOTB does today

**1. It reads the codes a model already carries.** Extraction recovers
`IfcRelAssociatesClassification` → `IfcClassificationReference`, handling both IFC4 (`Identification`)
and IFC2x3 (`ItemReference`). Handling only the IFC4 spelling makes every IFC2x3 model report as
entirely uncoded — a false clean bill of health, so both are read.

**2. It validates code shape against a pluggable scheme.** Schemes are JSON, keyed by locale, because a
code format is a jurisdiction artifact — the same building re-tendered elsewhere needs a different code
over identical geometry. Adding a jurisdiction is a data file, not a code change.

**3. It reports the gap at type level, ranked by leverage.** "234 of 339 types uncoded" is a worklist a
person can act on. "59,371 uncoded elements" is not.

**4. It proposes, and never assigns.** Every code carries a provenance stamp:

| Provenance | Meaning |
|---|---|
| `ifc:recovered` | authored in the model — trustworthy |
| `derived:sibling` | another type of the same IFC class in *this model* carries a code — a join, not a guess |
| `derived:ai` | no coded sibling; a reasoned proposal requiring review |

**A proposal is never exported as though it were authored.** In a schedule a wrong guess is
embarrassing; in a government asset register it is a false statement on a regulatory deliverable.

### A worked example

A real hospital model, measured:

| | Types | Elements |
|---|---|---|
| Already coded by the modeller | 27 | 4,546 — **7.1%** |
| Proposable by join alone | 179 | 24,759 — **38.7%** |
| Requiring a human decision | 162 | 34,612 — **54.2%** |

Two findings worth carrying into your own model. First, **re-extraction cannot fix this** — the missing
93% is not hidden in the IFC, it was never authored anywhere. Second, **the join must be reviewed, not
trusted**: 116 of those 179 proposals sit on IFC classes carrying more than one code, and in this model
that produced a proposal of *"Curtain Walls"* for 193 wooden doors, and *"Bath & Toilet Accessories"* for
a row of deciduous trees. Every such row is flagged in the output rather than hidden. That is why the
tool proposes and a person decides.

---

## What you actually do — step by step

Concretely, for a BIM Manager holding a model that has to go to JKR. Numbers below are the real ones
from the hospital model, so you can picture the shape of your own.

### Step 1 — Ask how bad it is (seconds)

```bash
python3 build/classification_checker.py --db buildings/YourBuilding.db
```

You get, in the log:

```
§CLASSIFY_CHECK[YourBuilding] locale=en-US scheme=uniformat status=verified-from-data
  §CLASSIFY_CODES coded=4546/63917 (7.11%) uncoded=59371 distinct=15 invalid=0
  §CLASSIFY_FACETS {"element":true,"space":false,"level":false}
  §CLASSIFY_VERDICT GREEN — 4546/4546 carried codes are well-formed, uncoded=59371
```

**Read both numbers.** `invalid=0` says the codes present are well-formed. `uncoded=59371` says almost
nothing is present. Those are different questions and only the second one decides whether you can hand
over.

### Step 2 — Turn 59,371 elements into a list a person can work

The gap is *not* 59,371 decisions. Codes live on family **types**, and instances inherit them. The
generator collapses the model to its types and ranks them by how many elements each one covers:

```bash
python3 build/measure_classification_tiers.py <scratch-dir>
→ build/classification_tier_worklist_YourBuilding.csv
```

For the hospital that is **341 uncoded types**, not 59,371 elements — and the top twenty of them cover
**61.7%** of the building. Your first afternoon is worth two-thirds of the job.

### Step 3 — Let the tool do the part it can prove

Each row is tiered, and the tool only claims what it can evidence:

```
rank,type_key,ifc_class,instances,tier,proposed_code,evidence_sibling_type,join_key_ambiguous
1,Pipe Types:Standard,IfcPipeSegment,5950,derived:sibling,D2090800,Pipe Types:Threaded…,NO
53,M_Single-Flush:0915x2032mm_Wood,IfcDoor,193,derived:sibling,B2020200,M_Curtain Wall Sgl Glass,YES
174,M_RPC Tree - Deciduous:Japanese Cherry,IfcBuildingElementProxy,10,derived:sibling,C1030220,Shower-Head…,YES
```

Row 1 is safe — the only code on that IFC class in your model, corroborated by 12,182 sibling elements.
Rows 53 and 174 are flagged `join_key_ambiguous=YES` because their class carries several codes, and they
are exactly the ones you would not want applied silently: *"Curtain Walls"* for a wooden door, *"Bath &
Toilet Accessories"* for a cherry tree.

**Sort by the flag.** Accept the clean ones in bulk, review the flagged ones, decide the rest.

### Step 4 — Fix the **template**, not the model

This is the step that pays for the other three. Take the confirmed type→code table into your authoring
tool and set `Assembly Code` on those types **in your project template** (`.rte`), not just this job's
model.

- Fixing the model helps **one** project.
- Fixing the template means every future project from it **starts** coded — step 1 on the next job
  reports 90%+ instead of 7%.

Then check the export mapping is on, or the codes stay in the authoring tool and never reach the IFC.

### Step 5 — Re-export and re-run step 1

Same command, and the coverage number is the proof. It is reproducible, so it survives being quoted at
a handover review.

### Where the work actually sits

| | Who | Effort on the hospital model |
|---|---|---|
| Find the gap, rank it | the tool | seconds |
| Propose what is provable | the tool | 179 types, 63 of them unambiguous |
| Decide the rest | **you** | ~162 types |
| Make it permanent | **you**, in the template | once |

**Today steps 1–3 are command-line scripts and step 4 is manual.** The in-app version — the gap surfaced
in the element info panel, proposals reviewable in the browser, one-click CSV round-trip — is designed
but not built. What exists now is the measurement and the worklist, which is the part that was hard.

## What this does not do (yet)

- **No SKATA verdict.** The shipped SKATA scheme is an explicitly-labelled example, and the checker
  **refuses to emit a verdict** against it. A checker that returns a confident answer for a placeholder
  format is worse than no checker. The primary JKR specification has been obtained and is being
  transcribed; until that is complete, no Malaysian compliance claim should be made from this tool.
- **PeDATA is not covered at all.**
- **Element codes only.** The scheme verified against real data (UniFormat) has no space or storey code.
  SKATA expects building, level, space *and* component codes — a wider surface than is implemented.
- **No authoring UI yet.** Gaps can be measured and proposals generated as a reviewable worklist; there
  is no in-app path to commit them.
- **Coverage is not validity.** A model where every carried code is well-formed will report as such even
  at 7% coverage. Read the coverage figure alongside, always.

## What it is genuinely good for now

Finding out, early and with reproducible numbers, **how far a model is from handover-ready** — while the
template is still open and the fix is a few hundred type edits rather than a handover crisis. That is a
real and unusual capability. It is not certification, and this page will say so until it is.

---

## Further reading

- [BIM Viewer Guide](BIMUserGuide.md) — the viewer these checks run against
- [4D/5D Analysis](4D5DAnalysis.md) — the other place classification codes pay off
- [Clash Detection](CLASH_DETECTION.md)

*Sources: [JKR BIM CPAB](https://jkrbim.my/) · SKATA v2.0, Urusetia JPAK, Pejabat Ketua Pengarah Kerja
Raya Malaysia. Mandate details are drawn from published secondary summaries and should be confirmed
against the primary circular before contractual use.*

---

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
