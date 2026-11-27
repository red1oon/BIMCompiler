---
description: "Visor IFC nativo del navegador y kernel ERP local primero: suelte un archivo IFC, vea un modelo BIM en 3D y ejecute un ERP sin servidor basado en eventos. Sin instalación, sin servidor, con licencia MIT."
hide:
  - navigation
  - toc
review: machine
source_sha: eb68687f38713eb7
lang: es-419
---

# BIM Intent Compiler

**Construcción = BOM + (x, y, z).** Una fórmula que unifica geometría, adquisiciones, programación, cumplimiento y costo, tal como E=mc² unificó masa y energía. Cinco dominios que la industria trata como herramientas separadas, proveedores separados y presupuestos separados, unificados en una fórmula de una pulgada.

Lee un BOM y produce coordenadas 3D verificadas, de la misma forma en que un [sistema ERP](MANIFESTO.md) descompone un BOM de manufactura en órdenes de trabajo. El resultado se dibuja en vivo en el [visor de navegador BIM OOTB](https://red1oon.github.io/bim-ootb/): sin instalación, sin servidor, dos bases de datos, un navegador. [Agnóstico del dominio](ShipYard.md): edificios, puentes, [barcos](ShipYard.md), túneles. **Nada inventado. Ninguna IA, ningún LLM en su interior. Aritmética pura. Determinista.**

<div style="max-width: 640px; margin: 28px auto; padding: 22px 32px; background: #d32f2f12; border: 2px solid #d32f2f; border-radius: 6px; text-align: center;">
<div style="font-size: 1.15em; font-weight: 700; color: #d32f2f; letter-spacing: 0.3px;">🚀 ¿Es nuevo aquí? Comience con la Guía del usuario.</div>
<div style="margin-top: 8px; color: #455a64;">Un navegador: <b>vea</b> un edificio · <b>cree</b> geometría · <b>ejecute</b> el ERP.</div>
<div style="margin-top: 14px;"><a href="USER_GUIDE/" style="display:inline-block; padding:9px 22px; background:#d32f2f; color:#fff; border-radius:4px; text-decoration:none; font-weight:700;">📖 Abrir la Guía del usuario →</a></div>
</div>

<div style="max-width: 620px; margin: 32px auto; padding: 24px 40px; background: #263238; border-left: 4px solid #ff9800; text-align: center; border-radius: 4px;">
<span style="font-size: 1.3em; line-height: 1.7; color: #eceff1; letter-spacing: 0.3px;">"Lo que <b style="color: #ff9800;">AUTODESK</b>, <b style="color: #ff9800;">PRIMAVERA</b> y <b style="color: #ff9800;">SAP</b> debieron haber hecho<br>juntas hace mucho tiempo, <i>pero yo no pude esperar.</i>"</span>
<br><span style="font-size: 0.75em; letter-spacing: 1.5px; text-transform: uppercase; color: #78909c; margin-top: 12px; display: inline-block;">Redhuan D. Oon · ADempiere 2006 · iDempiere 2010 · BIM Compiler 2025</span>
</div>

Todas las herramientas existentes comienzan con la geometría y extraen las cantidades después: primero dibujar, después contar. Este compilador invierte la dirección: la lista de materiales es la fuente de verdad y la geometría es el resultado compilado. Las adquisiciones no siguen al diseño. El diseño sigue a las adquisiciones.

| | Primero dibujar, después contar | Primero contar, después dibujar |
|---|---|---|
| **Fuente de verdad** | Modelo 3D (Revit, ArchiCAD) | Lista de materiales |
| **Cantidades** | Extraídas después del diseño | Inherentes: el BOM ES la cantidad |
| **Cambiar un muro** | Redibujar → volver a extraer el QTO → volver a estimar | Cambiar una línea del BOM → recompilar |
| **Cumplimiento** | Verificador aparte (Solibri) | El mismo motor de reglas |
| **Costo** | Estimador aparte | El mismo BOM × lista de precios |
| **Programación** | Herramienta aparte (Primavera) | Orden topológico del árbol del BOM |
| **Prueba** | Inspección visual | Determinista: cada elemento se remonta a una fuente |

Construido sobre las convenciones del ERP [iDempiere](https://idempiere.org/) y [SQLite](https://www.sqlite.org/), y dibujado de forma nativa en el navegador con Three.js. Desde Kuala Lumpur, Malasia, donde BIM es [obligatorio](StrategicIndustryPositioning.md) para todos los proyectos ≥ RM10M desde julio de 2025. Es el regalo al mundo de su Creador, [Redhuan D. Oon](mailto:red1org@gmail.com).

---

## Las tres aplicaciones que realmente abre

<div class="grid cards" markdown>

-   **🧱 Visor BIM**

    ---

    Suelte su propio IFC → se extrae a SQLite directamente en el navegador; combine disciplinas, recorrido virtual, matriz de colisiones, máquina del tiempo 4D/5D, todo sobre el mismo archivo. Escritorio y móvil, funciona sin conexión.

    [:octicons-arrow-right-24: Guía del visor](BIMUserGuide.md) · [Abrir](https://red1oon.github.io/bim-ootb/#buildings)

-   **✏️ DAGeVu Modeller**

    ---

    Cree geometría B-rep: inserte piezas de la biblioteca, dibuje, extruya, barra, edite la **cuadrícula 3D**, donde el registro de operaciones firmado *es* el árbol de características.

    [:octicons-arrow-right-24: Guía del Modeller](ModellerGuide.md) · [Abrir](https://red1oon.github.io/bim-ootb/modeller/modeller.html)

-   **📊 Kernel-ERP**

    ---

    iDempiere real en el navegador: punto de venta, estados financieros, todo el Diccionario de Aplicación desde SQLite. Sin Java, sin servidor, sin instalación.

    [:octicons-arrow-right-24: Guía de Kernel-ERP](ERPUserGuide.md) · [Caja y cocina (gemelo de uniCenta)](TillUserGuide.md) · [Todas las vistas](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Abrir](https://red1oon.github.io/bim-ootb/erp/erp.html)

</div>

---

## Las ideas principales

<figure style="float: right; margin: -8px 0 8px 20px; max-width: 280px; text-align: center;">
  <img src="assets/images/GeneralTall.png" alt="Edificio de varios pisos compilado desde un BOM: 6 disciplinas codificadas por color" width="280">
  <figcaption style="font-size: 0.75em; color: #666; margin-top: 4px;">Compilado desde un BOM. Color = disciplina (STR, ARC, ELEC, FP, ACMV, SP).</figcaption>
</figure>

<div class="grid cards" markdown>

-   **Detección de colisiones en el navegador**

    ---

    Reglas por par de disciplinas, visualización con vuelo hacia el elemento, control deslizante de tolerancia en vivo, flujo de revisión dentro del visor. Decenas de miles de elementos, cero servidores.

    [:octicons-arrow-right-24: Detección de colisiones](CLASH_DETECTION.md)

-   **Kernel-ERP: un pliegue sobre un registro de operaciones firmado**

    ---

    C_Order, C_OrderLine, M_Product, M_BOM, plegados desde el oráculo de [iDempiere](https://idempiere.org/). El estado es un pliegue determinista sobre un registro de operaciones firmado; incluso un `AD_Process` se vuelve a derivar como una repetición, no como un método.

    [:octicons-arrow-right-24: Libro negro](FoldEngineBlackBook.html) · [:octicons-arrow-right-24: Rosetta entre ERP (incl. SAP / ACDOCA)](ERPConceptRosetta.html) · [:octicons-arrow-right-24: Visión del mundo ERP](MANIFESTO.md)

-   **Seguridad empresarial: no se requiere servidor**

    ---

    Verificación criptográfica sin servidor central: atestación HMAC, firma de identidad Ed25519, integridad de transporte SHA-256. Sus datos nunca salen de su navegador.

    [:octicons-arrow-right-24: Arquitectura de seguridad](EnterpriseAuthentication.md)

-   **Reglas de negocio editables, en vivo**

    ---

    El Santo Grial: cambie una regla y observe cómo el modelo y el ERP se vuelven a plegar. ERP espacial donde [cada registro tiene un lugar](SpatialERP_OOTB.md).

    [:octicons-arrow-right-24: El Santo Grial](HolyGrail.md) · [:octicons-arrow-right-24: ERP espacial](SpatialERP_OOTB.md)

</div>

<div style="clear: right;"></div>

---

## Mapa de la documentación

| Quiero… | Comience aquí |
|------------|-----------|
| **Ponerme en marcha (todos comienzan aquí)** | [📖 **Guía del usuario**](USER_GUIDE.md) |
| Ver un edificio en el navegador | [Guía del visor BIM](BIMUserGuide.md) |
| Crear geometría | [Guía de DAGeVu Modeller](ModellerGuide.md) |
| Convertir planos 2D (DXF) en un modelo BIM 3D | [Planos 2D → BIM (DXF2BIM)](DXF2BIMGuide.md) |
| Obtener informes de obras civiles a partir de un conjunto IFC de carreteras | [Obras civiles, paso a paso](CivilWorksGuide.md) |
| Colaborar sobre una superficie (quién hizo qué, chat) | [Superposición de equipos](TeamsOverlayGuide.md) |
| Ver lo que se publicó recientemente | [Novedades](WhatsNew.md) |
| Ejecutar el ERP en el navegador | [Guía del usuario de Kernel-ERP](ERPUserGuide.md) |
| Manejar las aplicaciones con comandos de una línea (usted o una IA) | [Guía de Fast Script](FastScriptGuide.md) |
| Trasladar una empresa desde Odoo, Business Central o SAP Business One | [Guía de migración](MigrationGuide.md) · [cómo funciona el traslado de Odoo](OdooMigration.md) |
| Ejecutar una caja y una pantalla de cocina | [Guía del usuario de caja y cocina](TillUserGuide.md) |
| Ver cómo un edificio se convierte en una orden de proyecto y un tablero de CAPEX | [BIM → ERP y el tablero de CAPEX](CapexDashboardGuide.md) · [Guía de UAT de CAPEX](CapexUATGuide.md) |
| Dejar que una IA externa proponga cambios al Modeller | [Guía del proponente de IA](ProposerGuide.md) · [Divulgación defensiva](AIProposerDefensiveDisclosure.md) |
| Leer o cambiar el código | [Guía del desarrollador](DeveloperGuide.md) |
| Probar los prototipos (pruebas de concepto, solo datos de muestra) | [Rastreo halal](HalalTrace.md) · [abrirlo](halal/index.html) · [Comercio minorista a escala](RetailScaleStory.html) · [Glassbowl Gravity](glassbowl_gravity.html) · [Recorrido de la arquitectura](bim_architecture_viz.html) |
| Entender la visión del mundo ERP | [MANIFESTO: léalo primero](MANIFESTO.md) |
| Comparar con otras herramientas | [Comparación de funciones](FeatureComparison.md) · [Migrar y comparar (ERP)](MigrateComparisonPaper.md) |
| Ver dónde encaja esto en la industria | [Posicionamiento estratégico](StrategicIndustryPositioning.md) |
| Entender cómo se construyó | [Programación intuitiva: IA + experiencia del dominio](VibeProgramming.md) |
| Crear geometría como un pliegue | [DAGeVu Modeller: la geometría como un pliegue](ModellerKernelFold.md) |
| Llegar a cualquier elemento en interiores | [Buscar y navegar: orientación en interiores](RouteTemplate.md) |
| ERP distribuido / sin conexión | [ERP distribuido](DistributedERP.md) |
| Ir más allá de los edificios | [Más allá de los edificios: ShipYard](ShipYard.md) |
| Contribuir | [Contribuir: comience aquí](CONTRIBUTING.md) |

*Copyright (c) 2025-2026 Redhuan D. Oon. Licencia MIT.*
