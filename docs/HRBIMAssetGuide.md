# HR_BIM_Asset — HR / Tenancy / Operate Module  *(ALPHA)*

> **⚠ DEMONSTRATOR — NOT OFFICIAL.** Every screen and every generated output (payslip, invoice, report, export,
> print) carries the **`CONTOH — TIDAK RASMI` / `SAMPLE — NOT OFFICIAL`** watermark. Demo values only — this is a
> demonstrator and a policy counter-proposal, **not** a certified/compliant production system.

**HR_BIM_Asset turns a finished building into its operate-phase (7D) cockpit.** Open any building in the Viewer
and a single toolbar pill lets you ask operational questions *on the geometry itself* — which units are occupied,
who is physically present, what equipment is due for service — each answered by a colour wash over the real rooms.

> **One model · a few lenses, each answering exactly one question · all off one signed op-log.**

This is a **task-oriented manual**. If you just want to *use* it, read **Getting started** and **Common tasks**.
If you want to know *how it works* (or you administer the data), read **Under the hood**.

---

## Getting started (about 5 minutes)

You need nothing but the Viewer and a building that carries some operate data (the **HHS office** sample does).

1. **Open the building.** In the Viewer, load a building (e.g. the *HHS Office* sample). Let the 3D model finish
   streaming in.
2. **Find the `FM / Operate` pill.** Look on the right-hand toolbar for a **building glyph**. It appears **only**
   when the building has operate data — if you don't see it, there's nothing to operate yet (see
   [Troubleshooting](#troubleshooting)).
3. **Open the drawer.** Tap the pill. A small **FM / Operate** drawer opens listing the lenses. Lenses with data
   are bright and clickable; lenses with no data for *this* building are **greyed and marked "no data"**.
4. **Turn on a lens.** Tap **Occupancy**. The entry shows a blue **● on**, the rooms tint by status, and the
   status bar reads e.g. *“HR · occupancy · 11 units lit”*.
5. **Turn it off.** Tap the lens again (or pick another). The model is restored **exactly** — overlays never
   leave residue and never disturb other panels.

![The Occupancy lens applied on the HHS office building — the FM / Operate drawer open, Occupancy active, rooms tinted by lease status across all three storeys](img/hba_occupancy_live.png)

That's the whole interaction model: **open → pill → drawer → toggle a lens**. Everything below is variations on it.

---

## Common tasks

### See which rooms are occupied
1. Open the **FM / Operate** drawer → tap **Occupancy**.
2. Read the wash:

   | Colour | Meaning |
   |---|---|
   | 🟢 green | **occupied** — an active booking covers now |
   | 🟡 amber | **expiring** — the lease ends within the horizon |
   | ⚪ grey | **vacant** — *no* booking (vacancy is read from the absence of one, never a faked tenant) |
   | 🟣 purple | **unavailable** — a maintenance / renovation blackout |
3. The status bar tells you how many units lit. Toggle off to restore.

> **Tenancy is part of Occupancy.** An earlier alpha had a separate *Tenancy* lens; it's now folded in. Occupancy
> replays each room's signed booking log (`ASSIGN` / `RELEASE` / `UNAVAIL`), so it *is* the lease-status superset.

### See who is physically here right now
1. Open the drawer → tap **Presence**.
2. Zones tint by **live headcount density** (blue, deepening with people):

   | Colour | Headcount |
   |---|---|
   | light blue | **1** present |
   | mid blue | **2–4** present |
   | deep blue | **5+** present |

   Headcount comes from **signed check-ins** at real building zones — a zone with no check-in is honestly empty.

### Spot equipment that needs service
1. Open the drawer → tap **Assets / IoT**.
2. Equipment tints **ok (green) · due (amber) · overdue (red)**, driven by each asset's next-due date and cycle.
3. If this entry is **greyed “no data”**, the building simply carries no asset/IoT records — nothing is faked.

### Classify spaces
1. Open the drawer → tap **Unit class**.
2. Spaces tint **residential (green) · commercial (orange) · office (indigo) · unclassified (grey)**.
3. The class is never guessed — see [How a space gets its class](#how-a-space-gets-its-class-non-invent).

### Read the numbers (Dashboard)
1. Open the drawer → tap **Dashboard**.
2. An additive charts pane opens (it never touches the 3D scene): **per-storey utilization**, **availability over
   time**, and an **open-ticket aging** doughnut, with KPI tiles. Every number is a read-only fold of the same
   signed op-log — nothing is entered by hand.

![The occupancy / availability dashboard — KPIs, per-storey utilization, ticket-aging doughnut, all watermarked](img/hba_occupancy_dashboard.png)

---

## A building with no rooms? Aisle-zones

Not every building has `IfcSpace` rooms. A **warehouse** like the *GardenWorld* sample has none — just elements
grouped into **aisles**. The module detects this and falls back to **aisle-as-zone**: each aisle becomes a zone,
its members are the real elements parked in that aisle, and the same lenses light it. Below, Occupancy is on (two
aisles lit) while *Unit class* and *Assets / IoT* are greyed because this warehouse carries neither.

![GardenWorld warehouse with the FM / Operate drawer — Occupancy lit on aisle-zones; Unit class and Assets / IoT greyed “no data”](img/hba_gardenworld_aisles.png)

Nothing is invented to make this work: the aisle labels and the element guids are all read from the model.

---

## The lenses at a glance (reference)

| Lens | The one question | Colour legend |
|---|---|---|
| **Occupancy** | *Is this unit occupied — and what's its lease status?* | occupied `#2e7d32` · expiring `#f9a825` · vacant `#9e9e9e` · unavailable `#8e24aa` |
| **Presence** | *Who is physically here right now?* | 1 `#90caf9` · 2–4 `#1976d2` · 5+ `#0d47a1` |
| **Unit class** | *What is this space?* | residential `#43a047` · commercial `#fb8c00` · office `#3949ab` · unclassified `#9e9e9e` |
| **Assets / IoT** | *What equipment needs service?* | ok `#2e7d32` · due `#f9a825` · overdue `#c62828` |
| **Dashboard** | *Give me the numbers.* | opens the charts pane (no 3D wash) |

**Wake-aware, always.** The `FM` pill appears only when the building has *some* operate data; inside the drawer
each lens is enabled only when *its* data exists here. No data → greyed “no data” → no clutter, nothing faked.

**Watermark.** Every screen and export carries `CONTOH — TIDAK RASMI` / `SAMPLE — NOT OFFICIAL`. The demo values
are illustrative; any real statutory rate or fee sits behind a research gate and is never shipped as fact.

---

## Under the hood — the data model

You don't need this to *use* the lenses, but it explains why every wash is trustworthy.

- **One signed op-log.** Everything — bookings, check-ins, tickets — is an append-only **signed `kernel_op`**.
  Each op chains to the previous (`verifyChain`); amending a signed op breaks the chain. The lenses are pure
  **replays** of this log, so two reads give a bit-identical result and a vacant room is vacant from the *absence*
  of an op — never a fabricated value.

- **Records (the “WHAT”).** A handful of AD-defined models seed the demo: **Tenancy** (a lease), **Strata**
  (ownership/parcel), **Asset** (equipment, linking a `bim_guid` to an `iot_device` + a service schedule), and
  **Request** (a maintenance/service ticket). Each carries the **guid** of the room or element it concerns.

- **How a unit binds to the model (the “WHERE”).** A record lights a unit **only** when its guid **resolves to a
  real mesh** in the loaded building. An `IfcSpace` room usually isn't drawn as its own mesh, so the lens resolves
  and tints it through its **rendered contained members** (`rel_contained_in_space`). A guid that resolves to
  nothing is honestly **un-linked** — shown nowhere, never a faked tint. For a room-less building the same join
  runs over **aisle-zones** (see above).

- **Occupancy = a signed resource ledger (`S_Resource`-style).** A room is a *resource*; you **`ASSIGN`** a party
  to it for a period, **`RELEASE`** it early, or mark it **`UNAVAIL`** for a blackout. *Availability at any month*
  is the replay of that ledger — which is exactly what the Occupancy lens and the dashboard read.

- **The periodic RUN engine (the “HOW”).** One generic engine — **`(period × parties × element-rules) → signed
  lines → GL`** — serves four profiles, so tenancy is “payroll inverted”, not a new build:

  | Profile | Parties | Cash direction | Statement |
  |---|---|---|---|
  | `payroll` | employees | OUT | payslip |
  | `tenancy` | active leases | IN (AR) | rent invoice |
  | `strata` | owners / parcels | IN (AR) | fee notice |
  | `maintenance` | assets | COST | work order |

  Every line **cites the rule it came from and recomputes exactly** (glass-box), and every run posts a **balanced**
  journal. The module boots and runs **standalone** on its own seed — no ERP required — and only lights up two
  dotted-line adapters (GL posting, `C_BPartner.isEmployee`) when an ERP *is* present.

### How a space gets its class (non-invent)
Class is resolved by strict priority and **never guessed**: (1) a *real* `IfcSpace` `predefined_type` from the
model, when present; else (2) the **declared class on the lease record** (a watermarked business datum); else
(3) **unclassified**. The HHS office sample carries no IFC space-type, so its demo leases declare their class —
the room guids are real, the labels are sample lease declarations.

---

## Troubleshooting

| Symptom | What it means | What to do |
|---|---|---|
| **No `FM / Operate` pill** | The building has **no operate data that resolves to a real element** (no lease/asset/check-in binds to a drawn guid). | Expected on a bare model. Load a building with operate records (e.g. the HHS sample), or seed records bound to real guids. |
| **A lens is greyed “no data”** | That lens's data type isn't present here (e.g. no IoT assets → *Assets / IoT* greyed). | Normal and honest — the lens won't fabricate data to look busy. |
| **A room I expected isn't lit** | Either its guid doesn't resolve to a drawn element, or it's genuinely **vacant** (no booking). | Check the record's guid exists in the model; remember vacancy is the *absence* of a booking, not an error. |
| **The dashboard shows fewer storeys than the building has** | Only storeys whose rooms carry op-log data appear. | Seed bookings/check-ins across the other storeys — the dashboard reads whatever the log contains. |
| **Toggled a lens off and the colours look odd** | Overlays restore on toggle-off; a stuck state is rare. | Toggle the lens off again, or reopen the drawer — the scene restores fully (zero residue by design). |

---

## The money + contract side (when ERP is loaded)

The **deal and money** half of a tenancy — the lease as a signed **agreement**, the **rent run → AR**
(`C_Invoice → C_Payment → allocation → GL`), the **Request/ticket** workflow, and the product catalog (rental vs
purchase, installment schedules) — lives in the **[Kernel-ERP guide → Tenancy](ERPUserGuide.md#hr-tenancy)**. HR
supplies the **people + access** (party = `C_BPartner`, signed check-in, capability tokens); the Viewer supplies
the **spatial** lenses above; ERP supplies the **money**. One lease threads all three over the shared BIM model
and the one signed op-log.

---

*Spec: `prompts/RESUME_HR_BIM_ASSET.md` (§FM-FAMILY · §REAL-BIND · §AISLE-ZONES · §RICH-DEMO · §BINDING · §CLASS ·
§PILLAR 1–4). Back to the [BIM Viewer Guide](BIMUserGuide.md).*
