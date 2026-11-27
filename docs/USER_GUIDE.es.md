---
description: "Guía del usuario de BIM OOTB: vea edificios IFC en 3D, cree geometría y ejecute Kernel-ERP, todo del lado del cliente en una sola pestaña del navegador, sin instalación."
review: machine
source_sha: d3494de4a72ae85a
lang: es-419
---
# BIM OOTB — Guía del usuario

Un navegador. **Vea** un edificio · **cree** geometría · **ejecute** el ERP. Sin instalación, todo del lado del cliente.

!!! privacy "🔒 Garantía de seguridad de los datos"
    **Esta aplicación no tiene ninguna IA ni ningún LLM. Sus datos nunca salen de su navegador.** Todo archivo que usted suelte
    en la aplicación permanece dentro del IndexedDB y del kernel de su propio navegador, protegido por la seguridad estándar del
    navegador, y usted lo guarda de vuelta en su propia máquina, cuando y donde decida. Cada IFC que suelta,
    cada edificio que abre, cada edición del ERP permanece del lado del cliente, en su propio dispositivo: no se sube nada a
    nosotros, y ningún modelo recibe sus datos. La página de inicio y la página del visor ejecutan un contador de visitas sencillo
    (GoatCounter): cuenta las visitas a la página (puede incluirse la dirección de la página), nunca lee ni envía el contenido de un archivo, y no hace nada sin conexión; el ERP no tiene ninguno. Algunas funciones opcionales que usted mismo activa (enlaces para compartir (TinyURL), códigos
    QR (qrserver.com) y la comprobación de actualizaciones (GitHub)) llaman a ese servicio público y le envían solo la URL
    o la solicitud que esa función necesita, nunca su archivo. Cada resultado es determinista
    y se remonta a una línea de código abierto que usted puede leer.

    [**Lea la garantía completa: cómo funciona el modelo de confianza →**](EnterpriseAuthentication.md) · ¿quiere
    ejecutarla totalmente aislada de la red una vez instalada? [**Guía de instalación totalmente sin conexión / con aislamiento de red
    →**](OFFLINE_INSTALL_GUIDE.md)

![La portada Matrix: elija su puerta](assets/matrix_landing.png)

Comience en la **[puerta de entrada → red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/)**: la
portada Matrix (roja / azul → selector redondo). Elija una puerta, o vaya directamente a cualquier aplicación por su URL, más abajo.
**Guarde cualquiera de ellas como favorito**; presione **Inicio** en cualquier superficie para volver a la puerta de entrada. En una visita posterior
la portada muestra el lanzador compacto `⋯`; **actualice la página** para ver otra vez el selector redondo completo.

**¿Solo necesita una tarea rápida con un IFC?** Actualice a IFC4.3, extraiga un elemento a su propio IFC, divida por nivel o revise el estado de un modelo: suelte un archivo y se ejecuta. **[Herramientas BIM: manual del usuario →](BIMToolsGuide.md)**

¿Es nuevo desde hace poco? Consulte **[Novedades](WhatsNew.md)** para ver un registro continuo de los cambios publicados.

## Elija una superficie

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg> __Visor BIM__

    **Suelte su propio IFC** → se extrae a SQLite directamente en el navegador; combine disciplinas, recorrido virtual, matriz de colisiones, máquina del tiempo 4D/5D, orden de proyecto del ERP, todo sobre el mismo archivo. Escritorio y móvil, funciona sin conexión.

    _Puerta de entrada → el ícono **Edificios / IFC** (arriba)_ · [Abrir](https://red1oon.github.io/bim-ootb/#buildings) · [Guía](BIMUserGuide.md) · [Obras civiles (modelos de carreteras)](CivilWorksGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/></svg> __DAGeVu Modeller__

    Cree geometría B-rep: inserte piezas de la biblioteca, dibuje, extruya, barra, donde el registro de operaciones firmado *es* el árbol de características. Temprano/en desarrollo; escritorio.

    _Puerta de entrada → el ícono **BIM Modeller** (arriba)_ · [Abrir](https://red1oon.github.io/bim-ootb/modeller/modeller.html) · [Guía](ModellerGuide.md) · [Guía del proponente de IA](ProposerGuide.md) · [Planos 2D → BIM (DXF2BIM)](DXF2BIMGuide.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> __Kernel-ERP__

    iDempiere real en el navegador: punto de venta, estados financieros, todo el Diccionario de Aplicación desde SQLite. Sin Java, sin servidor, sin instalación.

    _Puerta de entrada → el ícono **ERP** (arriba)_ · [Abrir](https://red1oon.github.io/bim-ootb/erp/erp.html) · [Guía](ERPUserGuide.md) · [Caja y cocina (POS, gemelo de uniCenta)](TillUserGuide.md) · [Otras vistas](ERPUserGuide.md#other-views-of-the-same-log-the-lens-family) · [Migrar desde Odoo / Business Central](MigrationGuide.md) · [Línea de comandos (Fast Script)](FastScriptGuide.md) · [Superposición de equipos](TeamsOverlayGuide.md)

</div>

> **Profesionales de ERP** (implementadores, usuarios avanzados, desarrolladores y otros proyectos de ERP): comiencen con
> **[Migrar y comparar](MigrateComparisonPaper.md)**: cómo Kernel-ERP pliega un tenant vivo de iDempiere (y de Odoo)
> sobre un solo registro de operaciones firmado, qué resiste la comparación con un sistema heredado, y las carencias honestas.

## Cada aplicación tiene su propia dirección

Cada aplicación es una página aparte con su propia dirección. Al abrir una se carga solo esa aplicación, no las demás, de modo que un
trabajo pequeño sigue siendo pequeño. La caja, por ejemplo, nunca carga el visor 3D.

| Aplicación | Dirección | Descargado en una primera visita |
|---|---|---|
| Puerta de entrada | [red1oon.github.io/bim-ootb](https://red1oon.github.io/bim-ootb/) | unos 0.1 MB |
| Visor BIM | […/viewer/viewer.html](https://red1oon.github.io/bim-ootb/viewer/viewer.html) | unos 3 MB, más el edificio que abra |
| DAGeVu Modeller | […/modeller/modeller.html](https://red1oon.github.io/bim-ootb/modeller/modeller.html) | unos 1.3 MB |
| Página de inicio del ERP (burbujas) | […/erp/erp.html](https://red1oon.github.io/bim-ootb/erp/erp.html) | unos 0.1 MB |
| Formularios del ERP (el aspecto de iDempiere) | […/erp/idempiere.html](https://red1oon.github.io/bim-ootb/erp/idempiere.html) | unos 1.4 MB, más unos 7 MB de la base de datos del ERP |
| Caja · Pantalla de cocina | […/erp/till.html](https://red1oon.github.io/bim-ootb/erp/till.html) · […/erp/kitchen.html](https://red1oon.github.io/bim-ootb/erp/kitchen.html) | unos 0.1 MB · menos de 0.1 MB |

La página de formularios del ERP guarda su base de datos en su navegador después de la primera visita, de modo que las visitas posteriores no
la descargan otra vez. *Tamaños contados el 2026-11-08 a partir de los archivos publicados (comprimidos, tal como se envían por la red).*

## Trabajo en equipo

Varias personas, o varios de sus propios dispositivos, pueden trabajar sobre los mismos registros (órdenes en el ERP, el edificio
en el Modeller) **sin servidor de base de datos y sin servidor de aplicaciones**. Presione el botón **Equipo** (las dos cabezas;
en el Modeller, el ícono Equipo) y **Active el modo de equipo**; el primer dispositivo **Inicia un equipo**, los demás **Se unen**
y se aprueban allí, y todos presionan **Visitar** para enviar sus cambios y recibir los de los demás. Un lugar de
prueba ya preparado le permite probar un ciclo completo sin configurar nada.

[:octicons-arrow-right-24: Guía de equipo](https://red1oon.github.io/bim-ootb/erp/team_guide.html) ·
[Cómo verificar los términos](TermsHowToVerify.md) ·
[Superposición de equipos (demostrador ALPHA: puntos de quién hizo qué, chat, gráficos)](TeamsOverlayGuide.md)

## También en la puerta de entrada

<div class="grid cards" markdown>

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> __Acerca de e instalación__

    Qué es BIM OOTB y cómo conservarlo. Es una **PWA sin fricción**: su navegador puede *instalarla* (agregar a la pantalla de inicio) para que funcione **sin conexión, sin servidor**. La misma caja tiene una pestaña **Ejecútelo usted mismo (DIY)**: descargue un script de instalación de un solo paso y un README para alojar toda la pila en su propia máquina.

    _Puerta de entrada → el ícono **Acerca de** (arriba)_ · [Guía de autoalojamiento](SYSTEMS_INSTALLER_GUIDE.md) ·
    [Instalación totalmente sin conexión / con aislamiento de red](OFFLINE_INSTALL_GUIDE.md)

-   <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-5px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> __Borrar caché__

    Restablece la pantalla de inicio. Borra solo los **datos de edificios dentro del navegador** (edificios en caché y cualquier escena IFC que haya soltado pero nunca guardado en un `.db`) y lo devuelve a la puerta roja / azul. **Conserva** la aplicación instalada, sus datos sin conexión y cualquier archivo `.db` que usted mismo haya guardado.

    _Puerta de entrada → el ícono **Papelera** (arriba)_

</div>

*Copyright (c) 2025-2026 Redhuan D. Oon. Licencia MIT.*
