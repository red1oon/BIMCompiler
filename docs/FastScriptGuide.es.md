---
review: machine
source_sha: 37bce684713d1698
lang: es-419
---

# Guía del usuario de Fast Script

**Un comando corto cada vez, para BIM y ERP, y la respuesta propia de la aplicación de vuelta. Las mismas palabras sirven para usted en un terminal y para una IA.**

Piense en ello como SQL con esteroides: una línea lee o cambia registros, pero cada línea pasa por las mismas reglas que usan las ventanas e imprime lo que hizo. Usted escribe palabras cortas en un único prompt, `red1`. Cada palabra imprime la línea completa que ejecuta (tras `→`), así que va aprendiendo la forma larga sobre la marcha. No hay ninguna IA dentro.

!!! warning "Lo que una buena respuesta no significa"
    Una respuesta sin problemas **nunca significa segura, conforme ni buena**. Cada respuesta lista lo que no se comprobó, y [Lo que no se comprueba](#what-is-not-checked) lo repite. La última palabra la tiene un ingeniero estructural.

## Empiece con red1

En un terminal, `red1` le saluda una vez y luego espera en su prompt. Esto es exactamente lo que imprime (el commit al final de la línea de versión se ha cortado, porque cambia con cada commit):

<!-- run: greet -->
```text
$ (sleep 4; printf 'exit\r') | RED1_LOG=/tmp/fast_guide_greet.log RED1_HISTORY=/tmp/fast_guide_greet.hist BIM_DOOR_JOURNAL=/tmp/fast_guide_greet.journal script -qec 'node common/door/red1.js' /dev/null | tr -d '\r' | sed -e 's/\x1b\[[0-9;?]*[a-zA-Z]//g' -e 's/ · [0-9a-f]\{8\}$//'
Welcome to red1, the scripting door into BIM and ERP, stored in SQLite.
REMEMBER THE NAME.
Copyright (c) 2026 Redhuan D. OON · red1 1.0.0 · 74 verbs · 29 words
Type help for the list of commands (or bim, mis, erp for one group).
Tip: type level student for fuller help on each word (red1 --fast opens without tips).

red1> exit
```

Léalo como un mapa. La línea de versión dice cuántos verbos de la puerta (la forma larga) y palabras cortas tiene red1. `help` muestra las palabras cortas en tres grupos; escriba `bim`, `mis` o `erp` solo para ver un grupo:

| Grupo | Para qué sirve | Empiece con |
|---|---|---|
| **bim** | edificios y modelos: contar, choques, coste, calendario, el Modeller | `cd Duplex` |
| **mis** | registros, tablas, archivos y libros de Ninja: listar, crear, cambiar, cargar | `cd Order` |
| **erp** | documentos y procesos: completar, anular, cerrar, ejecutar un proceso, contabilizar un edificio en su pedido | `cd Order` |

<!-- run: red1_help -->
```text
$ node common/door/red1.js help 2>/dev/null
red1: type a short word; red1 prints the full line it runs (→ …), then runs it.
  bim   buildings and models             start with: cd Duplex   (16 words)
  mis   records, tables, files, Ninja    start with: cd Order   (11 words)
  erp   document actions (CO VO CL RC)   start with: cd Order   (7 words)
  everywhere: cd <place> · pwd · role <id> · history · report · exit
Type bim, mis or erp for its words · help <word> for one word (level student first for the full explanation) · help verbs for the full door lines.
```

`help` no imprime verbos de la puerta, solo las palabras. `help verbs` lista cada verbo de la puerta con su línea completa. Para una ayuda más completa sobre una palabra, pase al nivel Student: `level student` en una sesión, o `--level student` en una línea, y luego `help <word>` dice qué hace la palabra, qué escribe usted, qué toma red1 de dónde está, y un ejemplo. El texto es la descripción propia del verbo, así que no puede desviarse de la tabla del final:

<!-- run: red1_help_student cut=170 -->
```text
$ node common/door/red1.js --level student 'help cost' 2>/dev/null
cost: the cost of a selection: cost [phase|task|storey|discipline|class] [column=value …]
  in a building: cost discipline   → viewer.cost
    what it does: Price a selection of a building's elements as the Viewer's Find panel does: quantities from the model × the rate pack, grouped by 4D phase, task, storey…
    you type: by (phase (default), task, storey, discipline or class.)
    taken from where you are: building
    e.g. in Duplex: viewer.cost building=Duplex by=discipline
```

Ahora una palabra. `cd` dice dónde está usted, así que no hay que repetirlo. Tras `cd Duplex` y `cd Element`, un `count` solo necesita lo único que es nuevo. La línea `→` es lo que red1 envió a la puerta; esa línea es la forma larga de la palabra:

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Aparece texto gris tras el cursor mientras escribe una palabra, un lugar o una columna: una sugerencia del diccionario. **Tab** o **→** la acepta; **Return siempre ejecuta lo que usted escribió**, nunca la sugerencia. Una falta de ortografía recibe una pista, nunca una corrección silenciosa (`ls Valu=…` se rechaza y nombra `Value`).

## Cómo instalarlo

Necesita Node 18 o posterior (estos pasos se ejecutaron en Node 18.19). Hay dos formas de entrar.

**La copia completa** le da red1, BIM, ERP, el Viewer y todo lo que sigue. Clónela y luego inicie red1 desde su carpeta superior:

```bash
git clone https://github.com/red1oon/bim-ootb
cd bim-ootb
node common/door/red1.js
```

Escriba `exit` para salir. Para escribir solo `red1` desde cualquier sitio, ejecute `npm link` una vez en esa carpeta. Para comprobar que funciona, pida su línea de versión:

<!-- run: red1_version -->
```text
$ node common/door/red1.js --version | sed -e 's/^Copyright[^·]*· //' -e 's/ · [0-9a-f]\{8\}$//'
red1 1.0.0 · 74 verbs · 29 words
```

**La descarga de seis archivos** es para la puerta sola con los verbos del Modeller, sin copia completa. Cree una carpeta vacía, instale el motor de navegador que necesita el Modeller y descargue los seis archivos:

```bash
mkdir fastscript && cd fastscript
npm init -y
npm install puppeteer@24
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/bim_mcp.js
curl -O https://red1oon.github.io/bim-ootb/common/door/door.js
curl -O https://red1oon.github.io/bim-ootb/common/door/verbs.json
curl -O https://red1oon.github.io/bim-ootb/common/door/msg_core.js
curl -O https://red1oon.github.io/bim-ootb/common/door/vocab/messages.json
```

Mantenga los seis en la misma carpeta. `door.js` lee la lista de verbos de `verbs.json` y sus mensajes de `messages.json` (a través de `msg_core.js`), y ejecuta `edit_cli.js`, que abre la página del Modeller en vivo sin ventana. Si falta un archivo, la puerta dice cuál e imprime su línea `curl`. Todo lo demás de esta página necesita la copia completa; la [tabla de verbos](#the-verbs) dice qué verbo necesita qué.

## Las palabras que más usará

Cada parte de abajo dice qué va a hacer y por qué, y luego muestra una ejecución real y en qué fijarse. Cada bloque usa un op-log de prueba (el archivo donde el gemelo guarda sus cambios), vaciado antes, así que ejecutarlos no toca sus propios datos.

### bim: edificios y modelos

**Contar, por una columna.** `cd Duplex` y luego `cd Element` va a los elementos del edificio; `group storey` los cuenta por una columna. Fíjese en los grupos y sus cuentas, y en las líneas `→` que muestran los verbos de la puerta detrás de las palabras:

<!-- run: red1_group -->
```text
$ printf 'cd Duplex\ncd Element\ngroup storey\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ object.describe building=Duplex kind=Element
Duplex/Element: 9 properties; ls shows elements_meta_uu, guid, ifc_class, element_name
→ object.group building=Duplex kind=Element by=storey
ok · object.group
5 groups over 1193 Element
storey   count
Unknown  1026
Level 2  83
Level 1  62
T/FDN    14
Roof     8
```

**Buscar, con comodines.** `ls` lista lo que hay aquí; añada `column=value` para acotar. `*` es cualquier tramo de caracteres, `?` un carácter, `[abc]` uno de ellos; las mayúsculas no importan. Fíjese en `shown 6 of 6`: red1 dice cuántas filas coincidieron y cuántas muestra.

<!-- run: red1_find -->
```text
$ printf 'cd Duplex\ncd Element\nls element_name=*bath*\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ object.describe building=Duplex kind=Element
Duplex/Element: 9 properties; ls shows elements_meta_uu, guid, ifc_class, element_name
→ object.list building=Duplex kind=Element columns=elements_meta_uu,guid,ifc_class,element_name limit=20 element_name=*bath*
ok · object.list
shown 6 of 6 Element
elements_meta_uu        guid                    ifc_class        element_name
0BTBFw6f90Nfh9rP1dlXre  0BTBFw6f90Nfh9rP1dlXre  IfcSpace         Bathroom 2
0BTBFw6f90Nfh9rP1dlXru  0BTBFw6f90Nfh9rP1dlXru  IfcSpace         Bathroom 1
0BTBFw6f90Nfh9rP1dl_3C  0BTBFw6f90Nfh9rP1dl_3C  IfcSpace         Bathroom 2
0BTBFw6f90Nfh9rP1dl_3P  0BTBFw6f90Nfh9rP1dl_3P  IfcSpace         Bathroom 1
1YLPoi73z0fvdanmaXQreg  1YLPoi73z0fvdanmaXQreg  IfcFlowTerminal  M_Bath Tub:1525 mmx760 mm - Private:1525 mmx760 mm - Private:582924
2h405XijT83A$BX7w5ki4b  2h405XijT83A$BX7w5ki4b  IfcFlowTerminal  M_Bath Tub:1525 mmx760 mm - Private:1525 mmx760 mm - Private:582931
```

**Choques.** `clash ARC MEP` pide al Viewer los solapes entre dos disciplinas y dibuja las propias cifras de la respuesta como un embudo. Escrito solo, `clash` abre un menú de las disciplinas del edificio. `ls` lista después las 393 filas de la misma respuesta, sin volver a preguntar. Fíjese en cómo suman las partes: 393 = 291 + 102.

<!-- run: red1_clash -->
```text
$ printf 'cd Duplex\nclash ARC MEP\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ viewer.clashes building=Duplex discA=ARC discB=MEP rows=all
ok · viewer.clashes
393 box overlaps  ARC x MEP  (at 25 mm)
├─ 291 clash at mesh level
│    └─ 156 of them one inside the other
├─ 102 cleared by the shape tests
│    ├─  76 turned boxes do not touch
│    └─  26 triangles do not touch
└─   0 not judged
ls lists the 393 rows
```

**Coste.** `cost discipline` valora los elementos del edificio como el panel Buscar del Viewer: cantidades del modelo por la tarifa. Primero vienen los grupos, luego la cuenta y el total; `ls` lista las filas valoradas. También se puede agrupar por `phase`, `task`, `storey` o `class`. Fíjese en la última línea: como el edificio aún no tiene pedido ERP, red1 ofrece el siguiente paso. Esta sesión termina sin respuesta, así que no se contabiliza nada:

<!-- run: chain_cost -->
```text
$ rm -f /tmp/fast_guide_chain.ops; printf 'cd Duplex\ncost discipline\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_chain.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_chain.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ viewer.cost building=Duplex by=discipline
ok · viewer.cost
1190 elements · 1054482 total (71 with no rate); 3 with no size, not priced
discipline  elements  cost
ARC         267       532432
ELEC        81        283500
MEP         809       153825
PLB         14        49000
STR         19        35725
ls lists the 32 priced rows
Ready to post to ERP Project Order? y/N → erp.process name="Fold from BIM" Building=Duplex
```

### mis: registros, tablas, archivos

**Buscar registros.** En un tipo de ERP como `Business Partner` funcionan las mismas palabras que en un edificio: `ls`, `count`, `cat`, con los mismos comodines. `cd` toma el nombre de un tipo, entre comillas si tiene un espacio.

**Crear uno y cambiar uno.** `new` crea un registro como lo hace la ventana: usted da las columnas que conoce, el motor rellena el resto (valores por defecto, el número de secuencia), y una columna que el diccionario no tiene se rechaza con las reales listadas. `set <id> Column=value` cambia uno. Fíjese en el `id` de la respuesta de `new`, que es lo que usa `set` después, en `changed` de la segunda respuesta y en la lista del final. (Una respuesta también lista cada columna que rellenó y los cambios que hizo; esas líneas se omiten aquí.)

<!-- run: mis_edit -->
```text
$ printf 'cd "Business Partner"\nnew Value=GD100 Name="Guide Partner One"\nset 1600010 Description="first supplier"\nls Value=GD*\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis2.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|ok|refused|id|changed|shown|C_BPartner_ID|[0-9]{7} )'
→ mis.describe kind="Business Partner"
→ mis.new kind="Business Partner" Value=GD100 Name="Guide Partner One"
ok · mis.new
id: 1600010
→ mis.update kind="Business Partner" id=1600010 Description="first supplier"
ok · mis.update
id: 1600010
changed: ["description"]
→ mis.list kind="Business Partner" columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID limit=20 names=Y Value=GD*
ok · mis.list
shown 1 of 1 Business Partner
C_BPartner_ID  Value  Name               Logo_ID  C_BP_Group_ID
1600010        GD100  Guide Partner One           Standard Customers
```

`rm <id>` borra uno, y `load <file.csv>` y `diff <file.csv>` cargan filas de un archivo y comparan un archivo con los registros. [La referencia](FastScriptReference.md) muestra cada uno con su salida.

### erp: documentos y procesos

**Crear un documento y completarlo.** `new` en `Order` crea un pedido en borrador e imprime su número. Una línea completa de la puerta también funciona en el prompt, así que la línea del pedido se añade con `erp.new` (un producto y una cantidad). `next <number>` dibuja lo que el documento puede hacer ahora, y señala cada acción que tiene una palabra con la línea que la ejecuta. `do CO <number>` lo completa; los códigos DocAction heredados son `CO` completar, `VO` anular, `CL` cerrar, `RC` revertir (`do complete`, `do void` … también sirven). Fíjese en el número que imprime `new`, en el estado de cada árbol `next` y en las acciones que avanzaron tras `CO`. (El `grep` conserva solo esas líneas; las respuestas completas también listan cada columna rellenada.)

<!-- run: erp_order -->
```text
$ printf 'cd Order\nnew issotrx=Y C_DocTypeTarget_ID=132 C_BPartner_ID=112 SalesRep_ID=101\nerp.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2\nnext 50000\ndo CO 50000\nnext 50000\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_erp.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|ok|refused|number|Order [0-9]|[├└])'
→ mis.describe kind=Order
→ mis.new kind=Order issotrx=Y C_DocTypeTarget_ID=132 C_BPartner_ID=112 SalesRep_ID=101
ok · mis.new
number: 50000
→ erp.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2
ok · erp.new
number: 
→ erp.actions kind=Order number=50000
ok · erp.actions
Order 50000  status DR
├─ CO  → do complete 50000
├─ PR  (no red1 word for it yet)
└─ VO  → do void 50000
→ erp.complete kind=Order number=50000
ok · erp.complete
→ erp.actions kind=Order number=50000
ok · erp.actions
Order 50000  status CO
├─ CL  → do close 50000
├─ VO  → do void 50000
└─ RE  (no red1 word for it yet)
```

**Ejecutar un proceso.** `run "<process>"` ejecuta un proceso del diccionario ERP, como lo hace el botón de su ventana. Un parámetro que no escribe se pregunta, uno a uno, en el orden de las filas de parámetros del propio proceso (Return conserva el valor por defecto; una búsqueda abre una lista de selección acotada por la regla de validación de la columna; `(leave it out)` omite uno opcional). Luego red1 imprime la línea completa `→ erp.process …` y la ejecuta. El resumen nombra los documentos creados y el registro del proceso, como hace el diálogo de procesos heredado. Aquí el proyecto está escrito y las otras tres preguntas se responden con Return. (En un terminal cada pregunta dibuja su lista de selección; el `grep` conserva solo las preguntas y respuestas.) Fíjese en la respuesta honesta: el proyecto Hospital de la semilla no tiene precios de proveedor, así que **no se crea ningún pedido de compra**, y el registro dice por qué para cada línea:

<!-- run: erp_po -->
```text
$ printf 'cd Project\nrun "Generate PO from Project" C_Project_ID=990000\n\n\n\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_erp2.ops node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//' | grep -E '^(→|run:|C_|Consolidate|ok|refused|Generate|  Product)'
→ mis.describe kind=Project
→ mis.list kind=AD_Process_Para columns=ColumnName,Name,IsMandatory,DefaultValue,SeqNo,AD_Reference_ID sort=SeqNo limit=50 master="Process/Generate PO from Project"
→ mis.lookup column=C_ProjectPhase_ID process="Generate PO from Project" limit=50 C_Project_ID=990000
run: pick Project Phase (C_ProjectPhase_ID, 7)
C_ProjectPhase_ID: left out
→ mis.lookup column=C_ProjectLine_ID process="Generate PO from Project" limit=50 C_Project_ID=990000
run: pick Project Line (C_ProjectLine_ID, 28)
C_ProjectLine_ID: left out
Consolidate to one Document (ConsolidateDocument)? [Y]
→ erp.process name="Generate PO from Project" kind=Project C_Project_ID=990000 ConsolidateDocument=Y
ok · erp.process
Generate PO from Project: done · no document made
  Product has no PO record  (×28)
```

En una línea suelta, o para una IA, no se pregunta nada: un parámetro obligatorio ausente es un rechazo que lo nombra. Un proceso para el que el gemelo aún no tiene port se rechaza con el nombre de su clase, y red1 lo dice.

**Informar de una laguna.** Algunas respuestas dicen que a red1 le falta algo, en lugar de que usted se haya equivocado al escribir. El motor las marca, y en una sesión red1 imprime una línea tras la respuesta. Un error de tecleo o un rechazo heredado no es una laguna y no imprime nada extra. `report` muestra entonces un borrador (la línea, el motivo, la versión de red1, la plataforma, las últimas líneas del registro, sus rutas enmascaradas) y ofrece una incidencia de GitHub o un correo; red1 no envía nada por sí mismo, lo hace su propio navegador o programa de correo:

<!-- run: red1_gap -->
```text
$ printf 'cd Project\nrun "Renumber"\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Project
Project: 48 properties; ls shows C_Project_ID, Value, Name, Processed, SalesRep_ID
→ mis.list kind=AD_Process_Para columns=ColumnName,Name,IsMandatory,DefaultValue,SeqNo,AD_Reference_ID sort=SeqNo limit=50 master=Process/Renumber
run: Renumber has no parameter to ask (none in the dictionary)
→ erp.process name=Renumber kind=Project
refused · erp.process · Renumber was not run: it has no JS port yet (class org.compiere.process.DiscountSchemaReSeq)
{
 "refused": true,
 "reason": "Renumber was not run: it has no JS port yet (class org.compiere.process.DiscountSchemaReSeq)",
 "gap": true,
 "gapKind": "no-port"
}
This is a gap in red1, not your mistake. Type report to send it to us (email or GitHub issue).
```

### Del edificio a su pedido: coste, la oferta, contabilizar

Esta es la cadena que lleva un edificio a su pedido de proyecto ERP. Empezó arriba: `cost discipline` terminó con una oferta, `Ready to post to ERP Project Order? y/N`, seguida de la línea exacta que ejecutaría. La oferta es el siguiente paso propio del motor, nunca escrito a mano. En una sesión, `y` ejecuta exactamente esa línea, y `n` o un Return vacío no ejecuta nada; en una línea suelta o para una IA no se pregunta nada y la línea queda en el `next` de la respuesta. Responder `y` es `post`: pliega la selección valorada del edificio en un pedido de proyecto, con sus fases y tareas tomadas del programa 4D del edificio y las líneas de proyecto, como un grupo de cambios o ninguno. Fíjese en lo que se creó, y en la segunda oferta, que es `cd project`:

<!-- run: chain_post -->
```text
$ printf 'cd Duplex\ncost discipline\ny\nn\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_chain.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_chain.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
→ viewer.cost building=Duplex by=discipline
ok · viewer.cost
1190 elements · 1054482 total (71 with no rate); 3 with no size, not priced
discipline  elements  cost
ARC         267       532432
ELEC        81        283500
MEP         809       153825
PLB         14        49000
STR         19        35725
ls lists the 32 priced rows
Ready to post to ERP Project Order? y/N → erp.process name="Fold from BIM" Building=Duplex
→ erp.process name="Fold from BIM" Building=Duplex
ok · erp.process
Posted Duplex: Project 990001, PlannedAmt 1054482.22784, 81 change(s) · no document made
81 change(s) kept: create:c_project 1, create:c_projectphase 8, create:c_projecttask 19, create:c_projectline 43, create:m_product 7, create:m_product_category 1, create:m_product_category_acct 2
Open the project? y/N → cd project
not done: cd project
```

El importe contabilizado, 1054482.22784, conserva la regla de línea propia del pedido (precio por cantidad, sin redondear), mientras que `cost` redondea cada grupo a una unidad entera (1054482): la misma cifra a la unidad, no al céntimo. La palabra `post` hace lo mismo sin el `cost` previo y pregunta primero `run it? y/N`; contabilizar un edificio que ya está en su pedido no cambia nada. Desde el proyecto nuevo, `run "Generate PO from Project"` es el lado de compras y responde como el proyecto Hospital de arriba: los productos que creó la contabilización no llevan precio de proveedor. Esos pasos, con su salida, están en [la referencia](FastScriptReference.md).

## Todas las palabras

Las palabras de arriba son las que conviene aprender primero. Las demás, cada una una forma corta de un verbo de la puerta (`help <word>` muestra su línea):

| Palabra | Qué hace |
|---|---|
| `pwd` · `cd ..` · `history` · `role <id>` | dónde está; volver; las líneas escritas; actuar como un rol |
| `sum <column>` · `cat <id>` · `rm <id>` | sumar una columna; mostrar un registro; borrar uno |
| `ninja <file>` · `load <file.csv>` · `diff <file.csv>` | preparar un libro de Ninja o un CSV; cargar filas de un archivo; comparar un archivo con los registros |
| `menu` | el menú ERP, en una pantalla |
| `cd Project 990000` · `ls` · `cd Phase` | entrar en un registro como en un lugar: `ls` lista sus pestañas con su número de registros, `cd <tab>` abre una, `cd ..` vuelve arriba |
| `status` | en un proyecto: su valor ganado (PV, EV, AC, SPI y CPI por fase) |
| `vo` | en un edificio: el cambio entre el modelo y su orden de proyecto, emitido como orden de variación (Variation Order; pregunta y/N; se aprueba con `do CO <number>`) |
| `claim` | en un proyecto: facturar las fases terminadas aún no facturadas, un borrador de factura y la vista previa de su contabilidad (pregunta y/N) |
| `grid` · `walk FP` · `day 5` · `compare 24` | las líneas de rejilla del edificio; recorrer una disciplina; el calendario en un día; dos días comparados |
| `open marked` · `bay high` · `undo` · `save shed.db` · `close` | el Modeller mantenido abierto entre líneas |
| `help <word>` · `help verbs` · `level student` · `report` · `exit` | ayuda; cada verbo de la puerta; ayuda más completa; una laguna al propietario; salir |

## Para desarrolladores

**La línea de la puerta.** Cada palabra se convierte en una línea de la puerta, `app.verb key=value key=value`, y red1 la imprime tras `→`. Puede escribir una línea de la puerta directamente en el prompt, o de una sola vez: `red1 'object.count building=Duplex kind=Element'` imprime la respuesta, y `--json` imprime el sobre completo. Varias palabras en una línea suelta se separan con `;` (`red1 'cd Duplex; count'`); `red1 -f FILE` ejecuta un archivo de líneas, una línea que empieza por `--` es un comentario, y `--dry` la prueba antes. La puerta comprueba cada línea contra una lista fija de verbos, llama al código propio de la aplicación y devuelve la respuesta con lo que no se comprobó. Una línea que no coincide con ningún verbo nunca se adivina; vuelve como una pregunta.

![Una puerta. Los actores a la izquierda hablan los mismos verbos; la puerta analiza, comprueba, vincula, llama y responde; deciden las comprobaciones propias de la aplicación.](figs/one_door.svg)

Lea la imagen de izquierda a derecha: el **actor** (una persona en un terminal, o una IA mediante una conexión de herramientas); el **canal**, una lista de verbos, cada uno con una descripción sencilla, sus entradas y una clase de *daño*; la **puerta**, que analiza, comprueba, vincula la línea a quien pregunta, llama y responde; la **aplicación**, cuyas comprobaciones propias deciden, y un cambio que añade un problema nuevo se deshace con el motivo. Conectar una IA está en la [Guía del Proponente de IA](ProposerGuide.md#connect-your-ai).

Cada verbo tiene una **clase de daño** (harm class): `read` (no cambia nada), `trial` (un cambio hecho en una copia desechable, juzgado, nunca guardado), `writes`, `posts` o `sends`. La clase se escribe una sola vez, en la lista de verbos, así que ningún actor puede esquivarla con palabras. Una persona en la terminal tiene confianza para todas las clases; una IA solo para `read` y `trial`, así que una línea `writes` o `posts` de una IA queda retenida como una solicitud que una persona confirma ([la referencia](FastScriptReference.md) muestra una).

**Desde JavaScript** los mismos verbos son un solo objeto, generado del vocabulario (un verbo nuevo no necesita código nuevo):

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Límites.** Las palabras de objeto (`cd Element`, `ls`, `group`) necesitan un modelo que lleve el diccionario de objetos; de los edificios que hay aquí, solo el Duplex lo tiene. Una lista más alta que la terminal se detiene en cada página (Space, q); una tubería recibe todas las filas.

**La referencia.** Cada comando con su salida real, la historia del Modeller (un vano de 13 m rechazado con el motivo propio de la aplicación), scripts con resultados con nombre, libros de Ninja, el terminal MIS, la comparación con el sistema heredado y el flujo de reclamación y confirmación están en la [Referencia de Fast Script](FastScriptReference.md).

## Los verbos {#the-verbs}

Esta tabla se **genera a partir del archivo de vocabulario** (`common/door/verbs.json`) y una prueba verifica que coincida, verbo por verbo. Es la misma lista con la que se construye el menú de herramientas de la IA. La *clase de daño* se explicó arriba; *Necesita* dice cuál de las dos descargas ejecuta el verbo.

<!-- GEN:verbs -->
| Verbo | Qué hace | Entradas | Daño | Quién puede usarlo | Necesita |
|---|---|---|---|---|---|
| `modeller.lines` | Leer la cuadrícula | `building` | read | human, ai | la descarga de 6 archivos |
| `modeller.try_shift` | Probar el desplazamiento de una línea de la cuadrícula | `building`, `line`, `move` (metros) | trial | human, ai | la descarga de 6 archivos |
| `viewer.counts` | Contar elementos | `building`, `by` (opcional) | read | human, ai | los 6 archivos + los 2 archivos del Viewer |
| `viewer.clashes` | Listar las colisiones entre dos disciplinas | `building`, `discA`, `discB`, `rows` (opcional) | read | human, ai | los 6 archivos + los 2 archivos del Viewer |
| `viewer.film_path` | Visibilidad de la ruta de la película | `db`, `path` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `viewer.schedule_at` | Estado del cronograma en un día | `building`, `day` (número de día) | read | human, ai | una copia completa de bim-ootb |
| `viewer.schedule_compare` | Motor de cronograma frente a su referencia | `building`, `shift_hours` (horas) (opcional) | read | human, ai | una copia completa de bim-ootb |
| `modeller.widen_bay` | Ensanchar un vano hasta un ancho objetivo | `building`, `from`, `to`, `target` (metros) | trial | human, ai | la descarga de 6 archivos |
| `modeller.walk` | Qué colocaría el walker | `building`, `discipline` | read | human, ai | una copia completa de bim-ootb |
| `object.describe` | Describir un tipo de objeto | `building`, `kind`, `uu` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `object.read` | Leer un objeto | `building`, `kind`, `uu` | read | human, ai | una copia completa de bim-ootb |
| `object.history` | Historial de un objeto | `building`, `kind`, `uu` | read | human, ai | una copia completa de bim-ootb |
| `object.update` | Cambiar una propiedad de un objeto | `building`, `kind`, `uu`, `column`, `value` | writes | human, ai | una copia completa de bim-ootb |
| `object.attach` | Adjuntar un archivo o una nota a un objeto | `building`, `kind`, `uu`, `file` (opcional), `text` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `object.count` | Contar los registros de un tipo | `building`, `kind`, más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `object.list` | Listar registros de un tipo | `building`, `kind`, `columns` (opcional), `sort` (opcional), `limit` (opcional), `offset` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `object.sum` | Sumar una columna | `building`, `kind`, `column`, más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `object.group` | Contar por una columna | `building`, `kind`, `by`, más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `witness.run` | Ejecutar un testigo y leer su veredicto | `name` | trial | human, ai | una copia completa de bim-ootb |
| `witness.last` | Leer la última ejecución registrada de un testigo | `name` | read | human, ai | una copia completa de bim-ootb |
| `legacy.status` | ¿Está en marcha la pila de pruebas del legado? | ninguna | read | human, ai | una copia completa de bim-ootb |
| `legacy.query` | Leer filas de una tabla del legado | `table`, `columns` (opcional), `sort` (opcional), `limit` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.column` | Quién llena una columna: gemelo y legado lado a lado | `kind`, `column` | read | human, ai | una copia completa de bim-ootb |
| `legacy.compare` | Comparar un registro en el gemelo y en el legado | `kind`, `number`, `legacy` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `idempiere.where` | Buscar un nombre en el código fuente de iDempiere | `symbol`, `in` (opcional), `limit` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.pack` | Crear el zip 2Pack a partir de un libro de trabajo de modelo de datos | `book`, `version`, `out` (opcional), `java` (opcional), `package` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `legacy.up` | Iniciar el Postgres compartido en docker para la pila de pruebas del legado | ninguna | writes | human, ai | una copia completa de bim-ootb |
| `legacy.refresh` | Refrescar la instancia de pruebas del legado desde la semilla base | ninguna | writes | human, ai | una copia completa de bim-ootb |
| `legacy.witness` | Ejecutar el testigo dentro del servidor en la instancia de pruebas del legado | ninguna | trial | human, ai | una copia completa de bim-ootb |
| `legacy.check` | Verificar las filas de un libro de trabajo en la base de datos de pruebas del legado | `book`, `version` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `legacy.plugin` | Poner un plugin de modelo de datos en la instancia de pruebas del legado y verificarlo allí | `book`, `version` | writes | human, ai | una copia completa de bim-ootb |
| `model.open` | Abrir hojas 2D en el Modeller | `sheets`, `type` (opcional), `file` (opcional) | trial | human, ai | una copia completa de bim-ootb |
| `model.convert` | Convertir las hojas abiertas en un modelo 3D | ninguna | trial | human, ai | una copia completa de bim-ootb |
| `model.addbay` | Agregar un vano al modelo | `end` | trial | human, ai | una copia completa de bim-ootb |
| `model.undo` | Deshacer el último cambio del modelo | ninguna | trial | human, ai | una copia completa de bim-ootb |
| `model.save` | Guardar el modelo abierto | `file` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `model.close` | Cerrar la sesión del Modeller | `discard` (opcional) | trial | human, ai | una copia completa de bim-ootb |
| `erp.process` | Ejecutar un proceso del diccionario | `name`, `record` (opcional), `kind` (opcional), `dry` (opcional), `role` (opcional), más filtros `column=value` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `erp.order_state` | Lo que el ERP tiene para la selección de un edificio y qué es legal a continuación | `building`, más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.project_status` | El estado de valor ganado de un proyecto | `id` (opcional), `number` (opcional), `asof` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.lookup` | Los valores permitidos de una columna o de un parámetro de proceso | `column`, `kind` (opcional), `process` (opcional), `id` (opcional), `limit` (opcional), `role` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `viewer.cost` | El costo de una selección de un edificio | `building`, `by` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.find` | Buscar un documento | `kind`, `number` | read | human, ai | una copia completa de bim-ootb |
| `erp.actions` | Qué se puede hacer con un documento | `kind`, `id` (opcional), `number` (opcional), `role` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.complete` | Completar un documento | `kind`, `id` (opcional), `number` (opcional), `role` (opcional) | posts | human, ai | una copia completa de bim-ootb |
| `erp.void` | Anular un documento | `kind`, `id` (opcional), `number` (opcional), `role` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `erp.close` | Cerrar un documento | `kind`, `id` (opcional), `number` (opcional), `role` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `erp.reverse` | Revertir - Corregir un documento | `kind`, `id` (opcional), `number` (opcional), `role` (opcional) | posts | human, ai | una copia completa de bim-ootb |
| `mis.describe` | Describir un tipo de registro del ERP | `kind`, `role` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.read` | Leer un registro del ERP | `kind`, `id` (opcional), `number` (opcional), `role` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.list` | Listar registros | `kind`, `columns` (opcional), `sort` (opcional), `limit` (opcional), `offset` (opcional), `names` (opcional), `role` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.sum` | Sumar una columna | `kind`, `column`, `role` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.group` | Contar por una columna | `kind`, `by`, `role` (opcional), `window` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.new` | Crear un registro | `kind`, `dry` (opcional), `role` (opcional), `window` (opcional), más filtros `column=value` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `mis.update` | Cambiar un registro | `kind`, `id` (opcional), `number` (opcional), `role` (opcional), `window` (opcional), más filtros `column=value` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `mis.delete` | Eliminar un registro | `kind`, `id` (opcional), `number` (opcional), `role` (opcional), `window` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `mis.load` | Cargar registros desde un CSV | `kind`, `file`, `dry` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `mis.add_window` | Agregar una ventana desde un CSV | `file`, `table` (opcional), `workflow` (opcional), `dry` (opcional), `master` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `ninja.exec` | Ejecutar un libro de trabajo Ninja | `file`, `dry` (opcional), `data` (opcional), `table` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `ninja.workflow` | Dar a una tabla las columnas de documento | `table`, `dry` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `mis.diff` | Comparar un CSV con la tabla | `kind`, `file`, `key` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `mis.menu` | Leer el menú | `role` (opcional), `find` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `ninja.rollback` | Deshacer un paquete Ninja | `bundle`, `dry` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `ninja.export` | Escribir un paquete Ninja de vuelta como libro de trabajo | `bundle` (opcional), `window` (opcional), `table` (opcional), `file` | writes | human, ai | una copia completa de bim-ootb |
| `erp.column` | Quién llena una columna: gemelo y legado lado a lado (nombre antiguo de mis.column) | `kind`, `column` | read | human, ai | una copia completa de bim-ootb |
| `erp.compare` | Comparar un registro en el gemelo y en el legado (nombre antiguo de legacy.compare) | `kind`, `number`, `legacy` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.pack` | Crear el zip 2Pack a partir de un libro de trabajo de modelo de datos (nombre antiguo de mis.pack) | `book`, `version`, `out` (opcional), `java` (opcional), `package` (opcional) | writes | human, ai | una copia completa de bim-ootb |
| `erp.legacy_plugin` | Poner un plugin de modelo de datos en la instancia de pruebas del legado y verificarlo allí (nombre antiguo de legacy.plugin) | `book`, `version` | writes | human, ai | una copia completa de bim-ootb |
| `erp.describe` | Describir un tipo de registro del ERP (nombre antiguo de mis.describe) | `kind`, `role` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.read` | Leer un registro del ERP (nombre antiguo de mis.read) | `kind`, `id` (opcional), `number` (opcional), `role` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.list` | Listar registros (nombre antiguo de mis.list) | `kind`, `columns` (opcional), `sort` (opcional), `limit` (opcional), `offset` (opcional), `names` (opcional), `role` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.sum` | Sumar una columna (nombre antiguo de mis.sum) | `kind`, `column`, `role` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.group` | Contar por una columna (nombre antiguo de mis.group) | `kind`, `by`, `role` (opcional), `window` (opcional), más filtros `column=value` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `erp.new` | Crear un registro (nombre antiguo de mis.new) | `kind`, `dry` (opcional), `role` (opcional), `window` (opcional), más filtros `column=value` (opcional) | writes | human, ai | una copia completa de bim-ootb |
<!-- /GEN:verbs -->

**Cobertura actual.** La lista es pequeña a propósito: 64 verbos cubren las ediciones de rejilla del Modeller, su walker y un Modeller mantenido abierto entre líneas, unas pocas preguntas del Viewer, el calendario, la lectura, el recuento y la escritura genéricos de objetos, el coste de una selección, los verbos de documentos ERP y cualquier proceso del diccionario ERP que tenga un port. El Viewer tiene 64 acciones que una persona puede pulsar, y la puerta ofrece 6 verbos del Viewer. El ERP tiene 1158 documentos y procesos, y la puerta ofrece 9 verbos ERP para la vida de un documento y 15 verbos MIS que funcionan en cualquier tabla, y conserva 10 nombres antiguos para que las líneas anteriores sigan funcionando. Así que esto es un comienzo, no el menú completo.


## Lo que no se comprueba {#what-is-not-checked}

Una respuesta lista lo que su comprobación no cubrió. Las mismas palabras valen para cualquier respuesta: los solapes son primero cajas envolventes, una comprobación cubre solo lo que se movió, y **la capacidad de carga nunca se comprueba**. Una respuesta sin rojo nunca significa segura. La lista completa del informe de edición del Modeller está en [la referencia](FastScriptReference.md#what-is-not-checked).

## Solución de problemas

| Lo que ve | Qué hacer |
|---|---|
| `edit_cli is not at …` | Falta uno de los seis archivos. El mensaje imprime la línea `curl` |
| `puppeteer not found` | Ejecute `npm install puppeteer@24` en la misma carpeta |
| `unknown verb` | El mensaje lista todos los verbos. Compare la ortografía con la [tabla](#the-verbs) |
| `missing input: …` | El verbo necesita esa clave. La tabla lista las entradas |
| `The Viewer tools need a bim-ootb checkout` | Ejecútelo como `node common/door/door.js` desde una copia completa |
| `exit 1` con un mensaje de Chrome | Faltan las bibliotecas del sistema de Chrome en Linux. La página de solución de problemas de Puppeteer las lista |

**Límites a tener en cuenta.** Cada llamada al Modeller abre el edificio completo: unos 10 a 40 segundos en HospitalGarage. Esta es una herramienta de medición, no un servicio con disponibilidad garantizada. Un script con varias líneas del Modeller abre el edificio una vez por línea.


## Cómo se mantiene fiel esta página

Cada comando de un bloque gris de esta página y de la [referencia](FastScriptReference.md) se ejecutó, y la salida debajo es lo que imprimió el comando. Una prueba, **W-FAST-SCRIPT-GUIDE** en el repositorio `bim-ootb`, los ejecuta de nuevo desde la descarga y la copia completa, comprueba cada número de esta página contra las ejecuciones y comprueba que la tabla de verbos es igual a `verbs.json`. Si un número de aquí caduca, esa prueba falla.

Relacionado: la [Guía del proponente de IA](ProposerGuide.md) (conecte una IA a la misma puerta, y qué hizo una IA con las verificaciones), y la [guía del Modeller](ModellerGuide.md).
