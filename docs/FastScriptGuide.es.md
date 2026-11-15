---
review: machine
source_sha: 276f5bede717d2ac
lang: es-419
---

# Guía del usuario de Fast Script

**Dé a las aplicaciones BIM y ERP una orden corta a la vez, o unas pocas líneas en un archivo, y reciba la respuesta propia de la aplicación. Las mismas líneas le sirven a usted en una terminal y a una IA.**

Esta es la guía de la **única puerta**: un pequeño motor de scripts que se sitúa frente a las aplicaciones. Usted escribe una línea como `modeller.lines building=HospitalGarage`. La puerta la lee, la verifica contra una lista fija de verbos, llama al propio código de la aplicación y devuelve la respuesta junto con lo que no se verificó. No hay ninguna IA en la puerta.

![Una puerta. Los actores de la izquierda hablan con los mismos verbos; la puerta analiza, verifica, enlaza, llama y responde; deciden las verificaciones propias de la aplicación.](figs/one_door.svg)

Lea la imagen de izquierda a derecha.

1. **Actor.** Quien envía la línea y la forma en que llega. Hoy es una IA a través de una conexión de herramientas, o una persona en una terminal. Un buzón de correo, un teléfono y un dispositivo están planificados y **aún no están construidos**.
2. **Canal: los verbos.** Una lista de todo lo que un actor puede decir. Cada verbo tiene una descripción sencilla, sus entradas y una clase de *daño*. Encontrará la lista completa [más abajo](#the-verbs).
3. **Una puerta: el motor de scripts.** Analiza la línea, verifica las entradas, enlaza la línea con quien la pide, llama a la aplicación y responde. Todos los actores pasan por la misma puerta, así que la misma línea da la misma respuesta.
4. **Motor: la aplicación.** Deciden las verificaciones propias de la aplicación. Un cambio que agrega un problema nuevo se deshace, y el motivo se devuelve.

!!! warning "Lo que una buena respuesta no significa"
    Una respuesta sin problemas **nunca significa que sea segura, conforme o buena**. Cada respuesta lista lo que no se verificó, y [Lo que no se verifica](#what-is-not-checked) lo lista de nuevo. Un ingeniero estructural tiene la última palabra.

**¿Es nuevo aquí, con una IA?** Conectar una IA a la puerta se explica en la [Guía del proponente de IA](ProposerGuide.md#connect-your-ai). Esta página es para los comandos y scripts que usted mismo escribe, y para leer lo que devuelven.

## `red1` de un vistazo

`red1` es la entrada corta: un solo prompt para las aplicaciones BIM y ERP. Cada palabra corta imprime la línea completa de la puerta que ejecuta (después de `→`), así usted aprende la forma larga sobre la marcha. La [sección completa de red1](#the-red1-shell-short-words-at-one-prompt) está cerca del final de esta página.

| Escriba | Qué hace |
|---|---|
| `red1` | abre el prompt `red1>` (`node common/door/red1.js`, o `red1` después de ejecutar `npm link` una vez) |
| `cd Duplex` · `cd Element` · `cd Order` · `cd ..` · `pwd` | ir a un edificio, a un tipo dentro de él o a un tipo del ERP; volver; dónde está |
| `count` · `ls` · `group storey` · `sum <column>` · `cat <id>` | contar, listar, agrupar, sumar, mostrar un registro, aquí |
| `ls element_name=*bath*` | Buscar con comodines: `*` cualquier tramo, `?` un carácter, `[abc]` uno de ellos |
| `clash ARC MEP` · luego `ls` · `ls *Bath*` | colisiones dibujadas como un embudo; sus filas; las filas que coinciden |
| `clash` | se abre un menú con las disciplinas del edificio: flechas o un dígito, luego Return |
| `next <number>` · `do complete <number>` | qué puede hacer ahora un documento; hacerlo |
| `menu` · `help` · `help verbs` · `exit` | el menú del ERP; las palabras; todos los verbos de la puerta; salir |
| `red1 'cd Duplex; count'` | las mismas palabras desde un script, de una sola vez |

## Obtenga la puerta

Necesita Node 18 o superior. Estos pasos se ejecutaron en Node 18.19.

**Los verbos del Modeller necesitan cuatro archivos.** Cree una carpeta vacía, instale el motor del navegador y descárguelos:

```bash
mkdir fastscript && cd fastscript
npm init -y
npm install puppeteer@24
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/bim_mcp.js
curl -O https://red1oon.github.io/bim-ootb/common/door/door.js
curl -O https://red1oon.github.io/bim-ootb/common/door/verbs.json
```

Mantenga los cuatro en la misma carpeta. `door.js` lee la lista de verbos de `verbs.json` y ejecuta `edit_cli.js`, que abre la página en vivo del Modeller sin ventana. Si falta un archivo, la puerta dice cuál y muestra su línea `curl`. `bim_mcp.js` sirve solo para conectar una IA; los comandos de esta página no lo usan.

**Los verbos del Viewer, de objetos y de cronograma necesitan una copia completa (checkout).** No están en los cuatro archivos. Obtenga todo el repositorio `bim-ootb` (`git clone https://github.com/red1oon/bim-ootb`) y ejecute `node common/door/door.js` desde su carpeta superior, en lugar de `node door.js`. La [tabla de verbos](#the-verbs) indica, para cada verbo, cuál de las dos opciones necesita. Todavía no existe una descarga de un solo archivo para el Viewer.

## Su primer comando

Una línea, un verbo, pares `key=value` sin espacios alrededor del `=`. Pídale a HospitalGarage su cuadrícula:

<!-- run: lines cut=700 -->
```text
$ node door.js 'modeller.lines building=HospitalGarage'
{"request":"d-mwhmmeq9-2276636-1","verb":"modeller.lines","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[],"ms":16010,"model":{"grid_source":"column-derived","system":"column-framed","material":"RC","mixed":true,"girders":228,"rotation_deg":-2,"frame":"building","lines":[{"id":"gx0","axis":"x","pos":128.131,"world":132.184},{"id":"gx1","axis":"x","pos":129.223,"world":133.277},{"id":"gx2","axis":"x","pos":133.277,"world":137.334},{"id":"gx3","axis":"x","pos":133.795,"world":137.851},{"id":"gx4","axis":"x","pos":134.811,"world":138.868},{"id":"gx5","axis":"x","pos":145.987,"world":150.051},{"id":"gx6","axis":"x","pos":157.163,"world":161.234},{"id":"gx7…
```

Abre el Modeller y el edificio, por lo que tarda de 10 a 40 segundos. Lo que usted ve es una línea de JSON, un **sobre** (envelope). Aquí solo se muestra el comienzo; la cuadrícula tiene más líneas de las que caben. La respuesta es la de la propia aplicación, sin cambios, dentro de `answer`. Aquí `gx5` está a 145.987 m y `gx6` a 157.163 m en la cuadrícula propia del edificio. `status` es `ok`.

!!! note "¿De dónde sale el 'request'?"
    Cada línea recibe un id de petición (`"request":"d-…"`) y se escribe en una bitácora antes de ejecutarse, en `~/.cache/bim_door/journal.jsonl`. Si envía el mismo id dos veces, recibe la primera respuesta, de modo que un reintento nunca repite un cambio. La puerta también imprime una línea `§DOOR …` en el flujo de errores; esta guía solo muestra la salida estándar.

## Un verbo para una petición completa

Una petición como *"haga que el vano entre gx5 y gx6 mida 13 m de ancho"* son varios pasos: leer la cuadrícula, calcular el movimiento, probar el desplazamiento. El verbo `modeller.widen_bay` hace los tres. Sus entradas son las dos líneas y el ancho que usted quiere:

<!-- run: widen -->
```text
$ node door.js 'modeller.widen_bay building=HospitalGarage from=gx5 to=gx6 target=13' > widen.json; echo "exit $?"
exit 3
```

El código de salida es la primera respuesta: `0` significa ok, `3` significa que la aplicación dio una respuesta que no es un sí simple (rechazada, retenida o no concluyente), `1` significa un error y `2` significa un comando equivocado. Ahora mire dentro del archivo. Primero viene la petición completa, luego sus dos pasos, cada uno con su propio sobre:

<!-- run: widen_steps cut=200 -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' widen.json
"request":"d-mwhmmrdh-2276921-1","verb":"modeller.widen_bay","actor":"human","status":"refused"
"request":"d-mwhmmrdh-2276921-1.1","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmmrdh-2276921-1.2","verb":"modeller.try_shift","actor":"human","status":"refused"
```

El primer paso leyó la cuadrícula. Encontró el vano tal como está ahora:

<!-- run: widen_read -->
```text
$ grep -o '"id":"gx[56]","axis":"x","pos":[0-9.]*' widen.json
"id":"gx5","axis":"x","pos":145.987
"id":"gx6","axis":"x","pos":157.163
```

Así que el vano mide 157.163 − 145.987 = **11.176 m**. Para llegar a 13 m, la línea `gx6`, y todas las que le siguen, deben moverse **1.824 m**. La puerta lo calculó, y el segundo paso lo transmitió:

<!-- run: widen_move -->
```text
$ grep -o '"move":[0-9.]*' widen.json | head -1
"move":1.824
```

La aplicación probó el desplazamiento, lo verificó y **lo detuvo**:

<!-- run: widen_why -->
```text
$ grep -o '"why":"[^"]*"' widen.json | tail -1
"why":"line 2 (modeller.try_shift): stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m"
```

El cambio se hizo, se juzgó y se deshizo. Nunca se guarda nada. Los números detrás de la detención están en el informe de la aplicación:

<!-- run: widen_bay -->
```text
$ grep -o '"bay":"gx5-gx6"[^}]*' widen.json
"bay":"gx5-gx6","before":11.176,"after":13,"newly_over":true
```

El vano pasó de 11.176 m a 13 m, por encima del límite de 12 m de este edificio para una viga de concreto (`limit` y `material` provienen del propio edificio). Esa es toda la historia de la petición del Garage: un vano de 13 m necesita otra línea de columnas.

## Un script: varias líneas, un resultado con nombre {#a-script-several-lines-a-named-result}

Un script es un archivo de texto con un comando por línea. Una línea puede comenzar con un **nombre** y un `=`, que conserva su respuesta para las líneas siguientes. Todo lo que sigue a `--` es un comentario. Guarde esto como `bay.door`:

<!-- file: bay.door -->
```text
-- read the grid, then widen the bay between gx5 and gx6 to exactly 12 m
lines = modeller.lines building=HospitalGarage
modeller.try_shift building=HospitalGarage line=gx6 move={12 - (lines.model.lines[gx6].pos - lines.model.lines[gx5].pos)}
```

Ejecútelo con `--script`:

<!-- run: script -->
```text
$ node door.js --script bay.door > bay.json; echo "exit $?"
exit 0
```

El texto dentro de `{ }` es aritmética. Puede usar números, `+ - * /`, paréntesis y campos de un resultado con nombre. `lines.model.lines[gx6].pos` significa: en la respuesta llamada `lines`, bajo `model`, la entrada de `lines` cuyo id es `gx6`, su `pos`. Solo se pueden leer los campos que el verbo declara; cualquier otro nombre es un error que lo dice.

La aritmética es **decimal exacta**, no de punto flotante. Una computadora que usa punto flotante obtiene `12 - 11.176 = 0.8239999999999998`. La puerta obtiene esto:

<!-- run: script_move -->
```text
$ grep -o '"change":{"kind":"[^"]*","grid":"[^"]*","through":"[^"]*","lines":[0-9]*,"delta":[0-9.]*' bay.json
"change":{"kind":"block-shift","grid":"gx6","through":"gx16","lines":11,"delta":0.824
```

Un script se ejecuta de arriba abajo y **se detiene en la primera línea que no es ok**. Aquí ambas responden `ok`:

<!-- run: script_status -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' bay.json
"request":"d-mwhmni28-2277438-2","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmntjy-2277438-3","verb":"modeller.try_shift","actor":"human","status":"ok"
```

Con exactamente 12 m la aplicación no encuentra ningún problema nuevo: el número de luces de viga por encima del límite se mantiene igual.

<!-- run: script_span -->
```text
$ grep -o '"label":"Beam spans over limit","scope":"[^"]*","state":"JUDGED","before":[0-9]*,"after":[0-9]*,"delta":[0-9]*' bay.json
"label":"Beam spans over limit","scope":"228 walked girders, RC (mixed building)","state":"JUDGED","before":91,"after":91,"delta":0
```

Así que el mismo edificio, al pedir 13 m, se detiene, y al pedir 12 m, se sostiene. Un `ok` no es una promesa de que el edificio sea bueno: se aplica la misma [lista de lo que no se verifica](#what-is-not-checked).

### La gramática de las líneas

| Parte | Regla |
|---|---|
| Un comando | `app.verb key=value key=value`, uno por línea |
| Un valor con espacios | póngalo entre comillas dobles: `text="a note"` |
| Un resultado con nombre | `name = app.verb …`; las líneas siguientes leen `name.field` |
| Aritmética | `{ … }` con números, `+ - * /`, paréntesis y campos de resultados; decimales exactos |
| Un comentario | `--` y el resto de la línea |
| Unidades | nunca se escriben en la línea; el verbo dice metros, horas o días |
| Cualquier otra cosa | no es un comando: vuelve como una pregunta, no como una acción |

La última fila es deliberada. El texto que no coincide con ningún verbo **nunca se adivina**:

<!-- run: question -->
```text
$ node door.js 'please widen the bay'
{"request":"d-mwhmo809-2277927-1","verb":null,"actor":"human","status":"refused","answer":{"question":"I could not read that as a command. A command is app.verb key=value … Which one do you mean? Type help.","verbs":["modeller.lines","modeller.try_shift","viewer.counts","viewer.clashes","viewer.film_path","viewer.schedule_at","viewer.schedule_compare","modeller.widen_bay","modeller.walk","object.describe","object.read","object.history","object.update","object.attach","object.count","object.list","object.sum","object.group","witness.run","witness.last","legacy.status","legacy.query","mis.column","legacy.compare","idempiere.where","mis.pack","legacy.up","legacy.refresh","legacy.witness","legacy.check","legacy.plugin","model.open","model.convert","model.addbay","model.undo","model.save","model.close","erp.find","erp.actions","erp.complete","erp.void","erp.close","erp.reverse","mis.describe","mis.read","mis.list","mis.sum","mis.group","mis.new","mis.update","mis.delete","mis.load","mis.add_window","ninja.exec","ninja.workflow","mis.diff","mis.menu","ninja.rollback","ninja.export","erp.column","erp.compare","erp.pack","erp.legacy_plugin","erp.describe","erp.read","erp.list","erp.sum","erp.group","erp.new"]},"why":"not a command: \"please widen the bay\"","notChecked":[],"ops":[],"next":[],"ms":0}
```

## Leer la respuesta

Cada línea, de cualquier actor, recibe el mismo sobre. Léalo en este orden.

| Campo | Significado |
|---|---|
| `status` | `ok`, `refused`, `claim`, `error` o `inconclusive`. Léalo primero |
| `why` | el motivo, cuando el estado no es `ok` |
| `answer` | la respuesta propia de la aplicación, sin cambios |
| `notChecked` | lo que la verificación no cubrió. Transmítalo siempre |
| `request`, `verb`, `actor` | qué línea, qué verbo, quién preguntó |
| `ops` | lo que se escribió, para un verbo que escribe |
| `next` | reservado; vacío por ahora |
| `ms` | cuánto tardó |

Los cinco estados, cada uno de una ejecución real:

**ok.** La aplicación respondió y no se retuvo nada. El primer comando de esta página es uno. Aun así, lea `notChecked`.

**refused.** La aplicación dio una respuesta que no es un sí. La petición de 13 m de arriba es una: se probó, se juzgó y se deshizo, y `why` dice por qué. Un rechazo es una respuesta, no un fallo. El texto que no es un comando también es `refused` (la pregunta de arriba).

**error.** La línea misma está mal: falta una entrada, un verbo desconocido, un valor de tipo equivocado. No se ejecutó nada.

<!-- run: error -->
```text
$ node door.js 'modeller.lines'
{"request":"d-mwhmo856-2277937-1","verb":"modeller.lines","actor":"human","status":"error","answer":null,"why":"missing input: building","notChecked":[],"ops":[],"next":[],"ms":2}
```

**claim.** La línea se entiende, pero el actor no tiene una prueba que la permita, así que la puerta **la retiene y no la ejecuta**. Esta es la regla de seguridad para una IA, y proviene del verbo, no del actor. Vea [Qué es una solicitud retenida](#what-is-a-claim).

<!-- run: claim -->
```text
$ node door.js --actor ai --request ai-1 'object.update building=Duplex kind=Element uu=abc column=Name value=x'
{"request":"ai-1","verb":"object.update","actor":"ai","status":"claim","answer":null,"why":"actor ai has proof \"local-user\", which allows read/trial verbs; object.update is writes. Held as a claim, not run. A person confirms it with: door.js --confirm ai-1","notChecked":[],"ops":[],"next":[],"ms":5}
```

**inconclusive.** La aplicación no pudo juzgar, y lo dice. Nunca se convierte en un `ok`. Aquí el Viewer no tiene ninguna regla de colisión para el par ARC y ZZZ. Este necesita una copia completa:

<!-- run: inconclusive -->
```text
$ node common/door/door.js 'viewer.clashes building=Duplex discA=ARC discB=ZZZ'
{"request":"d-mwhmo8hh-2277957-1","verb":"viewer.clashes","actor":"human","status":"inconclusive","answer":null,"why":"the Viewer could not answer (exit 1): the Viewer says INCONCLUSIVE: no rule for ARC/ZZZ in clash_rules.json","notChecked":[],"ops":[],"next":[],"ms":24342}
```

### Qué es una solicitud retenida {#what-is-a-claim}

Cada verbo tiene una **clase de daño**: `read` (no cambia nada), `trial` (un cambio hecho sobre una copia desechable, juzgado, nunca guardado), `writes`, `posts` o `sends`. La clase se escribe una sola vez, en la lista de verbos, de modo que ningún actor pueda esquivarla con palabras.

Cada actor tiene una prueba. A una persona en la terminal se le confía toda clase. A una **IA** se le confía solo `read` y `trial`: puede mirar y puede probar, pero un verbo `writes`, `posts` o `sends` de una IA se retiene como solicitud, como ocurrió con la línea `object.update` de arriba. Un actor sin ninguna prueba, como un correo de un remitente desconocido, puede leer y nada más:

<!-- run: claim_email -->
```text
$ node door.js --actor email --request mail-0 'modeller.try_shift building=HospitalGarage line=gx6 move=1.824'
{"request":"mail-0","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-0","notChecked":[],"ops":[],"next":[],"ms":2}
```

Una solicitud retenida no se ejecuta, no se pone en cola y no se pierde: está en la bitácora, bajo su id de petición. La puerta no confirma nada en nombre de nadie.

### Confirmar una solicitud retenida

Una persona deja pasar una solicitud retenida **por su id de petición**, de modo que la línea que se ejecuta es exactamente la línea que se propuso. Nadie la vuelve a escribir. Aquí un correo pide un movimiento de prueba y queda retenido:

<!-- run: confirm_claim -->
```text
$ node door.js --journal claims.jsonl --actor email --request mail-1 'modeller.try_shift building=HospitalGarage line=gx6 move=0.824'
{"request":"mail-1","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-1","notChecked":[],"ops":[],"next":[],"ms":2}
```

`--claims` lista lo que está retenido:

<!-- run: confirm_list -->
```text
$ node door.js --journal claims.jsonl --claims | grep -o '"actor":"[a-z]*","line":"[^"]*","verb":"[^"]*","harm":"[a-z]*"'
"actor":"email","line":"modeller.try_shift building=HospitalGarage line=gx6 move=0.824","verb":"modeller.try_shift","harm":"trial"
```

`--confirm` ejecuta la línea registrada, como usted, una sola vez:

<!-- run: confirm_run cut=200 -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1
{"request":"mail-1#confirmed","verb":"modeller.try_shift","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[{"tag":"EDIT_REPORT","version":1,"change":{"kind":"bloc…
```

La respuesta es la normal, y nombra la solicitud que confirmó. Preguntar de nuevo no ejecuta nada: la puerta responde desde su registro.

<!-- run: confirm_again -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1 | grep -o '"confirms":"[^"]*"'
"confirms":"mail-1"
```

Se cumplen tres reglas. Solo una persona en la terminal puede confirmar: `--actor ai --confirm …` se rechaza y la solicitud sigue retenida. La aplicación aún decide en el momento de confirmar, de modo que una línea que dejó de ser correcta desde que se propuso se rechaza con el motivo de la aplicación. Y la conexión de herramientas de una IA no tiene ningún comando de confirmación.

**Lo que esto no prueba.** La puerta confía en quien esté en la terminal local. Una IA a la que se le permite ejecutar comandos de shell en su máquina podría escribir `--confirm` ella misma, igual que podría escribir una línea como si fuera usted. Si esto le importa, limite el acceso de una IA a su conexión de herramientas.

## Use la puerta desde un script propio

Todo lo anterior es `door.js`, el mismo archivo que usa la conexión de la IA. Desde su propio programa, llámelo como un comando y lea su JSON: el código de salida (`0`, `3`, `1`, `2`) dice si debe leer una respuesta o un problema, y `status` dice cuál. `--actor human` es el valor por defecto; `--actor ai` hace que la puerta trate la línea como si fuera de una IA.

## Pregunte qué es algo: `object.describe`

Un verbo también puede preguntarle al propio modelo qué contiene. `object.describe` es **reflexión**: lee el diccionario del modelo y dice qué propiedades tiene un tipo de objeto, qué pestañas hijas y qué métodos genéricos le son legales. Lee solo filas del diccionario; no se abre ningún elemento. Necesita una copia completa, y un edificio cuyo modelo lleve su propio diccionario (el Duplex lo tiene).

<!-- run: describe cut=520 -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element'
{"request":"d-mwhmp6f0-2278556-1","verb":"object.describe","actor":"human","status":"ok","answer":{"kind":"Element","table":"elements_meta","uu":"3027c2ed-8cb6-5ccb-ae8c-fd7df2eca264","key":"elements_meta_uu","highVolume":true,"properties":[{"name":"guid","label":"GUID","type":"string","mandatory":true,"updateable":false,"key":false,"parent":false,"length":255,"displayed":true,"seq":10,"fieldReadOnly":true,"allowCopy":false},{"name":"ifc_class","label":"IFC Class","type":"list","mandatory":false,"updateable":true,"…
```

¿Qué métodos puede usar un `Element`?

<!-- run: describe_methods -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element' | grep -o '"methods":\[[^]]*\]'
"methods":["read","update","attach","history"]
```

Un tipo desconocido es un error que lista los tipos que tiene el modelo, de modo que una suposición equivocada enseña el nombre correcto.

## Cuente cosas: `object.count`

`object.count` responde "cuántos": cuántos registros de un tipo contiene el modelo. El Duplex nombra sus habitaciones como el tipo `Room`. Necesita una copia completa.

<!-- run: count_rooms -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room'
{"request":"d-mwhmp7mf-2278599-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[],"count":5,"population":5,"verdict":"OK","summary":"5 Room"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":594}
```

Agregue `column=value` para acotar el conteo. La columna debe ser una propiedad del tipo (`object.describe` las lista), y la respuesta conserva la **población**, el número antes de acotar:

<!-- run: count_storey -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room storey="Level 1"'
{"request":"d-mwhmp87z-2278619-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[{"column":"storey","value":"Level 1"}],"count":2,"population":5,"verdict":"OK","summary":"2 Room where storey = Level 1 (of 5)"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":569}
```

Una columna que el tipo no tiene es un error que la nombra y lista las reales. Nunca se lee como "ninguna coincidencia":

<!-- run: count_badcol cut=330 -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room floor=1'
{"request":"d-mwhmp8u8-2278641-1","verb":"object.count","actor":"human","status":"error","answer":null,"why":"the object engine could not answer (exit 1): kind Room has no property \"floor\" (its properties: guid, type, name, parent_guid, object_type, predefined_type, center_x, center_y, center_z, size_x, size_y, size_z, room_gu…
```

Un modelo sin ninguna habitación no responde `0`. Responde `inconclusive`, porque no se contó nada. Un cero confiable es un conteo acotado dentro de una población que no está vacía.

## Lo que colocaría el walker: `modeller.walk`

El Modeller tiene un *walker* (recorredor) que coloca los accesorios de una disciplina (rociadores, luces, tomacorrientes) con reglas medidas de edificios reales. `modeller.walk` es una **ejecución en seco** de él: dice qué colocaría el walker y no cambia nada. El archivo del modelo es el mismo, byte por byte, después, y la respuesta lo dice. Necesita una copia completa. La respuesta completa es larga, así que esto muestra sus números principales:

<!-- run: walk_fp -->
```text
$ node common/door/door.js 'modeller.walk building=Duplex discipline=FP' | grep -o '"rules":"[^"]*"\|"count":[0-9]*,"placed":[0-9]*,"provisional":[0-9]*\|"byClass":{[^}]*}\|"modelUnchanged":[a-z]*'
"rules":"duplex_rules.db"
"count":46,"placed":0,"provisional":46
"byClass":{"IfcFireSuppressionTerminal":45,"IfcAlarm":1}
"modelUnchanged":true
```

`count` es todo lo que el recorrido colocaría. `provisional` son las posiciones que el propio walker marca como no definitivas, por ejemplo un accesorio sin cielo raso encontrado encima. `rules` es el conjunto de reglas que usa la clase del edificio: una casa recorre las reglas residenciales. Un recorrido que no coloca nada responde `inconclusive` con el motivo del walker.

## Mantenga un Modeller abierto entre líneas: `model.open`, `model.convert`, `model.addbay`, `model.undo`, `model.save`, `model.close`

Estas líneas manejan UNA página del Modeller mantenida abierta en segundo plano (sin ventana, en la CPU, sin tarjeta gráfica), de modo que cada línea actúa sobre lo que dejó la línea anterior. `model.open sheets=<folder or a.dxf,b.dxf> type="Farming Shed"` abre las hojas 2D, `model.convert` crea el modelo 3D (el propio Convert [convertir] de la página), `model.addbay end=high|low` agrega un vano en ese extremo de un edificio de vanos repetidos, `model.undo` deshace el último cambio y `model.close` detiene la página. La página hace todo el trabajo con sus propias funciones; la línea presiona lo que presiona una persona e imprime la propia respuesta de la página. El modelo vive en esa página hasta que usted lo guarda: `model.save` lo escribe en un archivo `.db` en esta carpeta, y `model.close` guarda primero cuando el modelo cambió y se conoce un archivo de guardado. Necesitan una copia completa de `bim-ootb`, y la carpeta desde la que las ejecuta contiene la sesión (un archivo `.model_session.json`; el puerto escucha solo en esta máquina y cada petición lleva un token de un solo uso).

Reglas que encontrará: una línea antes de `model.open` se rechaza ("no session: model.open first"), y también un segundo `model.open`, un segundo `model.convert` y `model.addbay` antes de Convert. Un vano se ofrece solo cuando el tipo de edificio declara uno (Farming Shed [cobertizo agrícola] lo hace); sin `type=` el vano se rechaza, diciendo que el tipo no declara ninguna regla. Las hojas deben llevar sus marcas: las hojas planas de un dibujo no pasan la compuerta. Cada línea tarda unos segundos (aquí: abrir unos 6 s, convertir 3 s, un vano 3 s; en un conjunto de hojas más grande convertir tardó hasta 15 s). **Guardar:** nombre el archivo una vez, en `model.open … file=shed.db` o en el primer `model.save file=shed.db`. Un guardado ejecuta el propio Save (guardar) de la página: primero la verificación de colisiones (una colisión RED bloquea el guardado, como en pantalla, y no se escribe nada), luego el modelo se escribe como un `.db` nativo. En este cobertizo un guardado tarda alrededor de medio segundo, y la respuesta da el tiempo de cada paso. `model.close` con cambios sin guardar y sin archivo se rechaza y la sesión sigue abierta: guarde, o use `model.close discard=Y` para descartar los cambios a propósito. Un guardado antes de que se haya hecho algo se rechaza, con las palabras de la propia página.

El bloque de abajo copia una carpeta de 9 hojas marcadas de un cobertizo, nombrada por `SHED_SHEETS`, en `shed/`, y ejecuta las líneas una tras otra; defina `SHED_SHEETS` con su propia carpeta de hojas `.dxf` marcadas.

<!-- run: model_ses cut=200 -->
```text
$ rm -rf shed shed.db; mkdir shed; cp "$SHED_SHEETS"/*.dxf shed/; D='node common/door/door.js --list'; eval "$D 'model.convert'" | grep -E '^error:'; eval "$D 'model.open sheets=shed type=\"Farming Shed\" file=shed.db'" | grep -E '^summary:'; eval "$D model.save" | grep -E '^error:'; eval "$D model.convert" | grep -E '^summary:'; eval "$D model.save" | grep -E '^(file|bytes|elements):'; eval "$D 'model.addbay end=high'" | grep -E '^(copies_by_class|summary):'; eval "$D model.undo" | grep -E '^summary:'; eval "$D model.close" | grep -E '^closed:'; ls -l shed.db | awk '{print "shed.db bytes: " $5}'; eval "$D model.undo" | grep -E '^error:'; rm -rf shed shed.db .model_session.log
error: no session in this folder: model.open first
error: nothing is open: model.open first
closed: true
error: no session in this folder: model.open first
```

`model.addbay end=low` agrega el vano en el otro extremo (una bisagra distinta, las mismas 29 copias). Lo que estas líneas no verifican: el costo contra un conteo independiente (otra prueba lo hace), y más de una sesión en una carpeta.

## Listas, sumas y grupos: `erp.list`, `erp.sum`, `erp.group`

`count` responde "cuántos". Tres verbos más, de solo lectura, responden "cuáles", "cuánto" y "cuántos de cada uno". Aceptan cualquier tipo del diccionario del ERP (y los mismos tres existen para el modelo de un edificio como `object.list`, `object.sum`, `object.group`). Necesitan una copia completa.

`erp.list` muestra filas. Cada columna, filtro y orden se verifica contra el diccionario, de modo que un nombre equivocado es un error que lista los reales. Agregue `column=value` para acotar la lista. La lista muestra como máximo 50 filas a menos que `limit` diga otra cosa (hasta 1000), y la respuesta siempre lleva el **total**, así que una lista corta nunca se confunde con el todo. Recorra una lista larga con `offset`:

<!-- run: list_orders -->
```text
$ node common/door/door.js --list 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo  DocStatus  GrandTotal
80001       CO         100.7
80001       CO         100.7
800002      CO         2160
shown 3 of 14
```

`erp.sum` suma una columna numérica de forma exacta. Los decimales se suman como decimales, nunca como punto flotante, de modo que el dinero no se desvía. `erp.group` cuenta los registros por cada valor de una columna, del más común al menos común:

<!-- run: sum_orders -->
```text
$ node common/door/door.js --list 'erp.sum kind=Order column=GrandTotal docstatus=CO'
kind: Order
table: C_Order
column: GrandTotal
filters: [{"column":"DocStatus","value":"CO"}]
n: 14
sum: 19505.9
population: 44
verdict: OK
summary: 19505.9 = sum of GrandTotal over 14 Order
```

<!-- run: group_orders -->
```text
$ node common/door/door.js --list 'erp.group kind=Order by=DocStatus'
DocStatus  count
IP         22
CO         14
DR         6
CL         2
shown 4 of 4
```

Un tipo sin ningún registro no responde `0` ni una lista vacía. Responde `inconclusive`, porque no se juzgó nada.

## Cree un registro: `erp.new`

`erp.new` crea un registro como lo crea la propia ventana del ERP. Usted nombra el tipo y las columnas que conoce; el motor llena el resto como lo hace la ventana (valores por defecto, las opciones que trae consigo un socio, el Document No [número de documento] de la secuencia). Una columna que el diccionario no tiene se rechaza y la respuesta lista las reales. Una columna obligatoria que sigue vacía después de eso se rechaza por nombre, y no se escribe nada. La respuesta empieza con `number`: el Document No, que es lo que usted usa a continuación.

Un documento de Venta o de Compra necesita `issotrx=Y` o `N`. Un socio o un producto puede indicarse por nombre; un nombre que no coincide con ningún registro, o con más de uno, se rechaza. Una línea nombra su documento por número:

<!-- run: new_order -->
```text
$ rm -f /tmp/fast_guide_new.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101'
{"request":"d-mwhmq2lp-2280086-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":"50000","kind":"Order","table":"c_order","id":1500004,"docStatus":"DR","given":["IsSOTrx","C_DocTypeTarget_ID","C_BPartner_ID","SalesRep_ID"],"defaulted":52,"filled":["ad_client_id","ad_org_id","documentno","isselfservice","dateordered","datepromised","bill_bpartner_id","c_bpartner_location_id","bill_location_id","deliveryrule","priorityrule","m_warehouse_id","isdropship","deliveryviarule","freightcostrule","freightamt","ispriviledgedrate","shippingrateinquiry","invoicerule","m_pricelist_id","c_currency_id","c_conversiontype_id","isdiscountprinted","chargeamt","paymentrule","c_paymentterm_id","totallines","grandtotal","docstatus","c_doctype_id","ispayschedulevalid","copyfrom","docaction","posted","isdelivered","dateacct","amountrefunded","isapproved","processed","processing","istaxincluded","isinvoiced","isselected","isprinted","sendemail","istransferred","iscreditapproved","isactive","processedon","amounttendered","volume","weight"],"record":{"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:44","createdby":101,"updated":"2026-11-15 17:25:44","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","dateprinted":null,"dateacct":"2026-11-15 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":0,"grandtotal":0,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c1be6519-1439-4618-a5b3-7c7af36acfe9","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}],"next":[],"ms":6973}
```

<!-- run: new_line -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2'
{"request":"d-mwhmq849-2280142-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":null,"kind":"Sales Order Line","table":"c_orderline","id":120002710,"docStatus":null,"given":["M_Product_ID","QtyEntered","C_Order_ID"],"defaulted":31,"filled":["ad_client_id","ad_org_id","c_bpartner_id","c_bpartner_location_id","datepromised","dateordered","line","m_warehouse_id","m_attributesetinstance_id","c_uom_id","qtyordered","qtydelivered","qtyreserved","qtyinvoiced","priceentered","priceactual","pricelist","freightamt","c_tax_id","discount","linenetamt","qtylostsales","processed","createshipment","createproduction","rramt","pricecost","pricelimit","c_currency_id","isactive","isdescription"],"record":{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:52","createdby":101,"updated":"2026-11-15 17:25:52","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"337b125f-adeb-4412-bbb9-5584c995f8fa","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}],"next":[],"ms":7403}
```

El pedido es un borrador hasta que alguien lo completa. Como a la línea se le dio el número del pedido, los totales del pedido la siguen sin un segundo paso: `totallines` y `grandtotal` en el registro de abajo son el importe de la línea (6). La lista de las propias líneas del pedido no la llena `erp.read`.

<!-- run: new_read -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js --list 'erp.read kind=Order number=50000'
kind: Order
uu: 1500004
record: {"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:44","createdby":101,"updated":"2026-11-15 17:25:44","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","dateprinted":null,"dateacct":"2026-11-15 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":6,"grandtotal":6,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c1be6519-1439-4618-a5b3-7c7af36acfe9","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null}
children: [{"kind":"Sales Order Line","rows":[{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:52","createdby":101,"updated":"2026-11-15 17:25:52","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"337b125f-adeb-4412-bbb9-5584c995f8fa","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null}]},{"kind":"Order Tax","rows":[]},{"kind":"Order Payment Schedule","rows":[]},{"kind":"POS Payment","rows":[]}]
```

`erp.new` es un verbo `writes`. Lo ejecuta una persona en la terminal. El `erp.new` de una IA se retiene como solicitud y no se escribe nada hasta que una persona lo confirme (vea "Qué es una solicitud retenida"). Estos bloques usan un op-log desechable (`/tmp/fast_guide_new.ops`, vaciado primero), de modo que ejecutarlos no toca sus propios datos.

## Trabaje con cualquier tabla: los verbos `mis.*`

**MIS es la base. El ERP es MIS más la vida de un documento.** Listar, leer, crear, cambiar, eliminar y cargar registros es igual en toda tabla del diccionario, un cliente, un producto, una tabla que usted mismo creó. Esos verbos se llaman `mis.*`. Lo que solo tiene un documento (completar, anular, cerrar, revertir) sigue siendo `erp.*`. Los nombres antiguos `erp.list`, `erp.read`, `erp.describe`, `erp.sum`, `erp.group` y `erp.new` siguen funcionando: cada uno es un nombre antiguo de su verbo `mis.*` y da la misma respuesta, de modo que un script que usted escribió antes no cambia.

Todo verbo `mis.*` que escribe hace lo que hace la propia ventana del ERP. No edita la base de datos por debajo. Se ejecutan los valores por defecto y los callouts, se ejecutan las verificaciones, un rechazo dice por qué, y no se escribe nada cuando algo se rechaza.

**¿Qué falta todavía?** `mis.new … dry=Y` ejecuta todo menos el guardado y no escribe nada. Responde qué columnas obligatorias siguen vacías después de los valores por defecto, para que usted sepa qué dar:

<!-- run: mis_dry cut=330 -->
```text
$ rm -f /tmp/fast_guide_mis.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.new kind=C_BPartner dry=Y'
dry: true
kind: Business Partner
table: c_bpartner
mandatory: ["Value","Name"]
needs: []
given: []
defaulted: 32
filled: ["ad_client_id","ad_org_id","c_bp_group_id","iscustomer","isvendor","isemployee","isprospect","issalesrep","so_creditlimit","totalopenbalance","istaxexempt","ispotaxexempt","issummary","isactive","c_paymentterm_id","m_pricelist_id","flatdiscount","c_dunning_id","shelflifeminpct","ismanufacturer","is1099vendor","documentc…
ops: []
```

**Crear, cambiar, leer.** Una columna que contiene otro registro puede darse por su nombre. `mis.list … names=Y` muestra esas columnas como nombres, como lo hace la cuadrícula de la ventana:

<!-- run: mis_new cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.new kind=C_BPartner Value=GD100 Name="Guide Partner One"'
number: Guide Partner One
kind: Business Partner
table: c_bpartner
id: 1600010
docStatus: 
given: ["Value","Name"]
defaulted: 32
filled: ["ad_client_id","ad_org_id","c_bp_group_id","iscustomer","isvendor","isemployee","isprospect","issalesrep","so_creditlimit","totalopenbalance","istaxexempt","ispotaxexempt","issummary","isactive","c_paymentterm_id","m_pricelist_id","flatdiscount","c_dunning_id","shelflifeminpct","ismanufacturer","is1099vendor","documentc…
record: {"c_bpartner_id":1600010,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:26:07","createdby":101,"updated":"2026-11-15 17:26:07","updatedby":101,"value":"GD100","name":"Guide Partner One","name2":null,"description":null,"issummary":"N","c_bp_group_id":103,"isonetime":"N","isprospect":"N","isvendor…
ops: [{"op_type":"CRUD_CREATE","table":"c_bpartner"},{"op_type":"CRUD_CREATE","table":"ad_treenodebp"},{"op_type":"CRUD_CREATE","table":"c_bp_customer_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_customer_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_vendor_acct"},{"op_type":"CRUD_CREATE","table":"c_bp_vendor_acct"}]
```

<!-- run: mis_update cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.update kind=C_BPartner number="Guide Partner One" description="first supplier"' | grep -E '^(noop|given|changed|derived):'
noop: false
given: ["Description"]
changed: ["description"]
derived: []
```

<!-- run: mis_list -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_BPartner value=GD100 columns=Value,Name,Description,C_BP_Group_ID names=Y'
Value  Name               Description     C_BP_Group_ID
GD100  Guide Partner One  first supplier  Standard Customers
shown 1 of 1
```

`mis.update` envía solo las columnas que usted da; dar los valores que un registro ya tiene no cambia nada y la respuesta dice `noop`. Una columna que la ventana no dejaría editar a una persona (un campo de solo lectura, o cualquier columna de un documento completado) se rechaza, y la respuesta nombra la regla. Borre el contenido de una columna con el valor `<null>`.

**Una columna que apunta a otro registro** (un socio de negocio, un producto, un almacén) debe nombrar un registro que exista y que su empresa pueda usar. `mis.new` verifica cada una de esas columnas y `mis.update` las que usted cambia, y una incorrecta se rechaza con las propias palabras del ERP legado, por ejemplo `Cannot save record in C_Order: Foreign ID 999999 not found in C_BPartner_ID`, o `Cross tenant ID … not allowed in …` para un registro de otra empresa. Un valor fuera de la regla de validación de una búsqueda (la lista que ofrecería una ventana) NO se rechaza: el ERP legado también lo guarda, ya que la regla solo decide qué ofrece la ventana.

**Eliminar.** `mis.delete` es el Delete (eliminar) de la ventana. Rechaza lo que rechaza la ventana, con las palabras del propio motor, y no escribe nada. El socio estándar lo usan otros registros:

<!-- run: mis_refuse cut=300 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.delete kind=C_BPartner id=112'
refused: true
reason: Business Partner Standard is not deleted: Record not deleted - dependent record found; nothing was written
```

<!-- run: mis_delete cut=300 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.delete kind=C_BPartner number="Guide Partner One"' | grep -E '^(gone|opSummary):'
gone: true
opSummary: {"delete:c_bp_customer_acct":2,"delete:c_bp_vendor_acct":2,"delete:c_bpartner":1,"delete:ad_treenodebp":1}
```

**Cargar muchos desde un CSV.** `mis.load` lee un `.csv` (la primera línea son los nombres de las columnas, un registro por línea) y ejecuta sobre él el propio proceso Migrate Excel Data (migrar datos de Excel) del ERP. Ese proceso es todo o nada, así que `mis.load` primero **verifica** (`dry=Y`, el valor por defecto) y no escribe nada: cuenta las líneas y nombra cada una incorrecta. Junto a su archivo escribe `….rejected.csv` (las líneas incorrectas y por qué) y `….ok.csv` (las buenas):

<!-- run: mis_load cut=330 -->
```text
$ printf 'Value,Name,C_BP_Group_ID\nGD201,Guide Two,Standard Customers\nGD202,Guide Three,Nowhere\n' > /tmp/fast_guide_mis.csv; rm -f /tmp/fast_guide_mis.rejected.csv /tmp/fast_guide_mis.ok.csv; BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.load kind=C_BPartner file=/tmp/fast_guide_mis.csv'
kind: Business Partner
table: c_bpartner
file: /tmp/fast_guide_mis.csv
rows: 2
ok: 1
rejected: [{"row":2,"why":["C_BP_Group_ID: no C_BP_Group with Name=\"Nowhere\""]}]
unplaced: []
dry: true
loaded: false
files: {"rejected":"/tmp/fast_guide_mis.rejected.csv","ok":"/tmp/fast_guide_mis.ok.csv"}
summary: Nothing migrated: 1 row error(s). c_bpartner row 3 C_BP_Group_ID: no C_BP_Group with Name="Nowhere"
```

<!-- run: mis_rejected -->
```text
$ cat /tmp/fast_guide_mis.rejected.csv
Value,Name,C_BP_Group_ID,rejected_because
GD202,Guide Three,Nowhere,"C_BP_Group_ID: no C_BP_Group with Name=""Nowhere"""
```

Cargar el original con `dry=N` se rechaza mientras haya alguna línea incorrecta. Corrija las líneas incorrectas, o cargue las buenas, que es una carga aparte de todo o nada:

<!-- run: mis_load_ok cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.load kind=C_BPartner dry=N file=/tmp/fast_guide_mis.ok.csv'
kind: Business Partner
table: c_bpartner
file: /tmp/fast_guide_mis.ok.csv
rows: 1
ok: 1
rejected: []
unplaced: []
dry: false
loaded: true
files: {}
summary: No worksheets : 1(C_BPartner = 1 records) 
ops: 6
opSummary: {"create:c_bpartner":1,"create:ad_treenodebp":1,"create:c_bp_customer_acct":2,"create:c_bp_vendor_acct":2}
keys: [1600010]
```

El `mis.new`, `mis.update`, `mis.delete` o `mis.load` de una IA se retiene como solicitud, como `erp.new`: no se escribe nada hasta que una persona lo confirme. No se ofrece la actualización masiva de registros existentes; use `mis.update` en cada uno, para que se ejecuten las verificaciones de la ventana.

### Vea y cambie registros como un rol

Todo verbo `mis.*` acepta `role=`, el id de un rol del ERP. **Sin un rol no se filtra nada:** usted ve todos los registros de todos los clientes. Con un rol obtiene lo que ese rol obtiene en la ventana que se le concede: los registros de su propio cliente y sus organizaciones, y solo los registros y columnas que permiten sus filas de acceso. Los totales cuentan solo esos registros. El rol se indica en la línea. No es un inicio de sesión.

<!-- run: mis_role -->
```text
$ for r in '' ' role=103' ' role=12000'; do BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list "mis.sum kind=C_Order column=GrandTotal$r" | grep -E '^(n|sum):' | tr '\n' ' '; echo; done
n: 43 sum: 74936.76 
n: 8 sum: 9914.07 
n: 27 sum: 55108.62
```

Un registro fuera de los registros del rol responde exactamente como un registro que no existe. Una columna que el rol solo puede leer no puede cambiarse. Un tipo para el que el rol no tiene ventana se rechaza; el rol 103 no tiene ninguna ventana que muestre Tax (impuesto):

<!-- run: mis_role_refuse cut=200 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_Tax role=103'
refused: true
reason: role 103 (GardenWorld User) is not granted a window that shows Tax (AD_Window_Access)
```

Cinco reglas aún no se juzgan, y un rol que use alguna de ellas se rechaza en lugar de verificarse a medias: un bloqueo personal sobre un registro, una regla de validación de tabla, un rol cuyas organizaciones provienen del usuario, un rol con una organización resumen en un árbol de organizaciones, y el acceso a registros de "entidades dependientes". `mis.load` no acepta rol.

## Cree una tabla propia: `mis.add_window`

Una tabla que usted guarda en una hoja de cálculo puede convertirse en una ventana real: una tabla, un formulario, una entrada de menú y acceso por rol, sin escribir código para ella. Describa sus columnas en un pequeño `.csv`, una línea por columna. Solo `Column` es obligatoria. La clave, el cliente y la organización, la marca de activo y las columnas de auditoría se agregan por usted:

<!-- run: win_sheet -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; cat AST_Asset.csv
Column,Type,Length,Mandatory,Default,List,Help
Name,String,60,Y,,,Its name
PurchaseDate,Date,,,,,When it was bought
Cost,Amount,,,,,
Condition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",
IsInsured,,,,,,
```

Una línea crea la ventana (aquí la hoja se escribe de nuevo para que la línea pueda ejecutarse sola, desde la carpeta que contiene `common/`). La tabla recibe el nombre del archivo. `dry=Y` verifica la hoja y no escribe nada. Una hoja defectuosa se rechaza con cada falla y su línea, y no se escribe nada:

<!-- run: win_add cut=200 -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; rm -f /tmp/fast_guide_win.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list 'mis.add_window file=AST_Asset.csv' | grep -E '^(table|window|columns|lists|ops):'
table: AST_Asset
window: {"id":7100001,"name":"AST Asset"}
columns: ["Name","PurchaseDate","Cost","Condition","IsInsured"]
lists: [{"column":"Condition","values":["GOOD","FAIR","POOR"]}]
ops: 47
```

El nuevo tipo funciona con todos los verbos `mis.*` a la vez, y con `mis.js`. Se exige una columna obligatoria, se llena un valor por defecto, y se rechaza un valor fuera de la lista de la hoja:

<!-- run: win_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list'; eval "$D 'mis.new kind=AST_Asset Name=Tractor Cost=1200.50'" | grep -E '^(number|filled):'; eval "$D 'mis.new kind=AST_Asset Cost=5'" | grep reason; eval "$D 'mis.new kind=AST_Asset Name=Plough Condition=BAD'" | grep reason; eval "$D 'mis.list kind=AST_Asset columns=Name,Cost,Condition'"; rm -f AST_Asset.csv
number: Tractor
filled: ["ad_client_id","ad_org_id","isactive","condition","isinsured"]
reason: mandatory and still empty after the defaults and callouts: Name (give them as column=value)
reason: Condition Invalid value - BAD - Reference_ID=200277 - FAIR - GOOD - POOR; nothing was written
Name     Cost    Condition
Tractor  1200.5  GOOD
shown 1 of 1
```

Los tipos son String, Quantity, Amount, YesNo, Date, DateTime, Text y List. Una columna cuyo nombre termina en `_ID` es una búsqueda en esa tabla, y una que empieza con `Is` es de sí/no. Una tabla de detalle bajo un maestro viene con un libro de trabajo: la sección siguiente.

## Un libro de trabajo completo en una línea: `ninja.exec`

Una tabla desde un `.csv` es el caso pequeño. Un **libro de trabajo Ninja** contiene muchas tablas a la vez, dice qué tabla va bajo cuál, y puede llevar sus primeras filas. Una línea lo crea todo.

El libro de trabajo es un archivo de hoja de cálculo común (`.xlsx` o `.xls`):

| Hoja | Qué contiene |
|---|---|
| `1_RO_ModelHeader` | el nombre de todo el conjunto, en la primera celda bajo `Name` |
| `2_RO_ModelMaker` | una fila por tabla: `Master` (la tabla bajo la que va, o vacío), `Name` (la tabla), `ColumnSet` (sus columnas, separadas por comas) |
| una hoja con el nombre exacto de una tabla | filas para cargar: la fila 1 contiene los nombres de las columnas |

En `ColumnSet`, un nombre simple es texto. Un prefijo da otro tipo: `D#` una fecha, `A#` un importe, `Q#` una cantidad, `T#` un texto largo, `Y#` un sí/no, y `L#Name=a/b/c` una lista de valores fijos. Una tabla cuyo `Master` es otra tabla del libro de trabajo se convierte en una pestaña de la ventana de esa tabla.

Con la puerta se entrega un libro de práctica: `common/door/samples/Ninja_Practice.xlsx` (un paciente, las visitas del paciente, los medicamentos de una visita, una habitación, y una derivación que va bajo Business Partner [socio de negocio]). `dry=Y` lo lee, dice qué crearía y no escribe nada:

<!-- run: nx_dry cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_ninja.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list 'ninja.exec file=Ninja_Practice.xlsx dry=Y' | grep -E '^(bundle|tables|dataSheets|skipped|dry):'
bundle: Practice
tables: [{"table":"PR_Patient","master":null,"columns":4,"lists":["BloodGroup"]},{"table":"PR_Visit","master":"PR_Patient","columns":5,"lists":[]},{"table":"PR_Medicine","master":"PR_Visit","columns":3,"lists":[]},{"table":"PR_Roo…
dataSheets: [{"sheet":"PR_Patient","rows":3},{"sheet":"PR_Room","rows":2}]
skipped: []
dry: true
```

Sin `dry=Y` la misma línea lo crea: las ventanas, las pestañas, la lista, las entradas de menú, el acceso por rol, y luego las filas de las hojas de datos. Si la ejecuta una segunda vez no escribe nada:

<!-- run: nx_run cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(windows|detailTabs|dataSheets|ops):'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(alreadyStaged|ops|summary):'
dataSheets: [{"sheet":"PR_Patient","rows":3,"loaded":3,"ops":3},{"sheet":"PR_Room","rows":2,"loaded":2,"ops":2}]
windows: [{"id":7100001,"name":"PR Patient"},{"id":7100004,"name":"PR Room"}]
detailTabs: 3
ops: 151
alreadyStaged: true
ops: 0
summary: this workbook is already staged (5 tables); nothing was written
```

Toda tabla funciona de inmediato con los verbos `mis.*`. Un registro bajo un maestro nombra el id del maestro (`mis.read` del maestro muestra entonces lo que hay debajo), y un valor fuera de una lista se rechaza:

<!-- run: nx_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list'; eval "$D 'mis.list kind=PR_Patient'"; eval "$D 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'" | grep -E '^(number|id):'; eval "$D 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'" | grep -E '^(number|id):'; eval "$D 'mis.list kind=PR_Visit columns=Name,Fee,PR_Patient_ID'"; eval "$D 'mis.update kind=PR_Patient id=1 BloodGroup=Z'" | grep reason; rm -f Ninja_Practice.xlsx
PR_Patient_ID  Name
1              Aminah
2              Boon
3              Chandra
shown 3 of 3
number: Checkup
id: 1
number: Paracetamol
id: 1
Name     Fee  PR_Patient_ID
Checkup  50   1
shown 1 of 1
reason: BloodGroup Invalid value - Z - Reference_ID=200277 - A - AB - B - O; nothing was written
```

**Una tabla que ya existe.** Cuando el libro de trabajo nombra una tabla que el sistema ya tiene, nada se crea dos veces. Si la hoja le da a esa tabla un `Master`, la tabla se reutiliza: las columnas de la hoja se le agregan y se convierte en una pestaña bajo ese maestro. Si la hoja no le da `Master`, la fila se deja intacta. La respuesta lista ambas (`reused`, `leftAlone`). Esto es lo que hace el Ninja de iDempiere. Una tabla reutilizada conserva sus propias reglas, así que un registro de ella aún debe llenar las propias columnas obligatorias de esa tabla.

Una tabla mostrada en dos ventanas se escribe a través de su propia ventana a menos que usted nombre la otra con `window=` (su nombre o su id). Un rechazo por una columna que pertenece a la otra ventana le dice qué ventana nombrar.

**Una pestaña en una ventana que ya existe.** Un `Master` no tiene que ser una tabla del libro de trabajo. Nombre una tabla que el sistema ya tiene y su tabla se convierte en una pestaña de la ventana de ESA tabla, después de las pestañas que ya hay, sin ventana ni entrada de menú propias. El libro de práctica lo hace con una fila: `PR_Referral`, cuyo `Master` es `C_BPartner`, de modo que una derivación es una pestaña de la ventana Business Partner. Esta es también la regla del Ninja de iDempiere:

<!-- run: nx_att cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_att.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_att.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^(attached|detailTabs):'; eval "$D 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'" | grep -E '^(number|id):'; eval "$D 'mis.list kind=PR_Referral columns=Name,C_BPartner_ID names=Y'"; rm -f Ninja_Practice.xlsx
attached: [{"table":"PR_Referral","master":"C_BPartner","window":"Business Partner","windowId":123}]
detailTabs: 3
number: Checkup
id: 1
Name     C_BPartner_ID
Checkup  Standard
shown 1 of 1
```

Lo que rechaza, sin escribir nada: un segundo libro de trabajo que nombra tablas que creó otro libro, un libro cuyas tablas ya existen todas y sin maestro, un `Master` que no está en el libro ni es una tabla con una ventana aquí, y un `ColumnSet` con un prefijo que no conoce. Una hoja cuyo nombre no es exactamente el de una tabla se omite y se nombra en la respuesta. El `notChecked` de la respuesta lista lo que no se juzgó.

### Una tabla desde un CSV simple: `ninja.exec file=<Table>.csv`

Un `.csv` en lugar de un libro de trabajo es UNA tabla cuyo encabezado es el modelo, leído como lo lee el Ninja anterior. La tabla es el nombre del archivo (`table=` nombra otra). Cada celda del encabezado toma su tipo de su nombre, por la primera regla que se cumpla: contiene `Date` → una fecha; `Qty` → una cantidad; `Amount` → un importe; empieza con `Is` o `In` → Sí/No (así `Income` también es Sí/No, como en el Ninja anterior); termina en `_ID` → una búsqueda, cuyas celdas son el Name del registro; contiene `=` y `/` (`Plan=Basic/Gold`) → una lista; cualquier otra cosa → texto. Una celda como `C_BPartner_ID>Value` o `Code=X` crea la columna anterior al `>` o al `=`. Las líneas son las filas. La tabla y sus filas se crean juntas: si una línea no se carga, no se crea nada y la respuesta nombra la línea. Una línea cuyas dos primeras columnas ya existen se omite, de modo que el mismo archivo ejecutado otra vez no escribe nada, y un archivo con más líneas agrega solo las nuevas. En una tabla que ya existe, el archivo solo agrega líneas, y un encabezado que no es una columna de ella se rechaza.

<!-- run: nx_csv cut=200 -->
```text
$ printf 'Name,Join Date,Visits Qty,Fee Amount,IsMember,Plan=Basic/Gold\nAmir,2026-01-05,2,50,Y,Ba\nBea,2026-01-06,1,80,N,Go\n' > CL_Client.csv; rm -f /tmp/fast_guide_csv.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_csv.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^(tables|dataSheets):'; eval "$D 'mis.list kind=CL_Client columns=Name,JoinDate,VisitsQty,FeeAmount,IsMember,Plan'"; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^(ops|summary):'; printf 'Cara,2026-01-07,3,50,N,Ba\n' >> CL_Client.csv; eval "$D 'ninja.exec file=CL_Client.csv'" | grep -E '^summary:'; rm -f CL_Client.csv
tables: [{"table":"CL_Client","master":null,"columns":6,"lists":["Plan"]}]
dataSheets: [{"sheet":"CL_Client","rows":2,"loaded":2,"ops":2}]
Name  JoinDate             VisitsQty  FeeAmount  IsMember  Plan
Amir  2026-01-05 00:00:00  2          50         Y         Ba
Bea   2026-01-06 00:00:00  1          80         N         Go
shown 2 of 2
ops: 0
summary: every line of CL_Client.csv is there already (2 skipped); nothing was written
summary: 1 line loaded into CL_Client, 2 skipped (already there)
```

### Dé a una tabla las columnas de documento: `ninja.workflow`

Una función puede activarse después, para una tabla, sin tocar el libro de trabajo. `ninja.workflow` da a una tabla las cinco columnas de documento (`DocStatus`, `DocAction`, `Processed`, `DocumentNo`, `IsApproved`) con sus listas y valores por defecto, las muestra en sus pestañas y llena los registros que ya existen. Mira primero y agrega solo lo que falta, de modo que una segunda ejecución no escribe nada:

<!-- run: nx_wf cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_wf.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_wf.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^ops:'; eval "$D 'mis.new kind=PR_Visit Name=Before PR_Patient_ID=1'" | grep -E '^number:'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(added|fields|rowsFilled|ops):'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(alreadyDone|ops):'; eval "$D 'mis.new kind=PR_Visit Name=After PR_Patient_ID=1'" | grep -E '^docStatus:'; eval "$D 'mis.list kind=PR_Visit columns=Name,DocStatus,DocAction,Processed'"; eval "$D 'erp.complete kind=PR_Visit id=1'" | grep reason; rm -f Ninja_Practice.xlsx
ops: 151
number: Before
added: ["DocStatus","DocAction","Processed","DocumentNo","IsApproved"]
fields: 5
rowsFilled: 1
ops: 11
alreadyDone: true
ops: 0
docStatus: DR
Name    DocStatus  DocAction  Processed
Before  DR         CO         N
After   DR         CO         N
shown 2 of 2
reason: Complete was not done: PR Visit has the document columns but no document class yet, so nothing says what Complete does on it (DocStatus stays DR)
```

Aún no dice qué hace *Complete* (completar) en una tabla así: el `notMade` de la respuesta nombra lo que todavía falta, y `erp.complete` se rechaza con palabras claras hasta entonces. Una tabla que vino con el sistema se rechaza.

### Deshaga un paquete y escriba uno de vuelta como libro de trabajo: `ninja.rollback`, `ninja.export`

Dos líneas cierran el ciclo de un libro de trabajo. `ninja.rollback bundle=<name>` desactiva todo lo que creó un libro de trabajo (sus ventanas, pestañas, campos, columnas, tablas y entradas de menú, y el propio nodo de menú del paquete) en un grupo del registro. Como en el Ninja anterior, una tabla que contiene registros lo bloquea, y nombra la tabla y su número de registros; `dry=Y` dice qué se desactivaría. Una tabla que vino con el sistema se conserva y pierde solo lo que el paquete le agregó (una pestaña en Business Partner se va, Business Partner se queda). Ejecutado dos veces, la segunda no escribe nada; `ninja.exec` sobre el mismo libro de trabajo después trae de vuelta el paquete. `ninja.export` escribe un paquete, una ventana o una tabla de vuelta como un libro de trabajo que `ninja.exec` lee: tablas, vínculos `Master`, columnas con sus tipos y los valores de cada lista. Edite la hoja y ejecútela de nuevo, o lleve el modelo a otra máquina como un archivo. Escribe solo el modelo, nunca filas; un archivo que ya existe nunca se sobrescribe; se requiere un selector (`bundle=`, `window=` o `table=`).

<!-- run: nx_rb cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_rb.ops Practice_out.xlsx; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_rb.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx data=N'" | grep -E '^ops:'; eval "$D 'ninja.export bundle=Practice file=Practice_out.xlsx'" | grep -E '^(file|lists|summary):'; eval "$D 'ninja.rollback bundle=Practice dry=Y'" | grep -E '^(dry|wouldSwitchOff):'; eval "$D 'ninja.rollback bundle=Practice'" | grep -E '^(ops|summary):'; eval "$D 'ninja.rollback bundle=Practice'" | grep -E '^(alreadyDone|ops):'; eval "$D 'ninja.export bundle=Practice file=Practice_out.xlsx'" | grep reason; rm -f Ninja_Practice.xlsx Practice_out.xlsx
ops: 151
file: Practice_out.xlsx
lists: 1
summary: wrote the model of 5 tables to Practice_out.xlsx
dry: true
wouldSwitchOff: 119
ops: 119
summary: Practice is rolled back: 119 dictionary rows switched off
ops: 0
alreadyDone: true
reason: Practice_out.xlsx exists already and is never overwritten. Nothing was written
```

La exportación no lleva: reglas de validación y callouts (el cargador nunca los escribió en el modelo). Un rollback desactiva filas, no las elimina, de modo que el registro conserva su historia.

## Los registros bajo un registro, y una hoja contra la tabla: `master=`, `mis.diff`

`master=Table/record` en `mis.list`, `mis.sum` o `mis.group` conserva solo las filas bajo ese registro, las filas que muestra una pestaña bajo él: `mis.list kind=PR_Visit master=PR_Patient/Aminah` son las visitas de Aminah. El registro después de la barra es un id, o un Document No, Name o Value, leído como lo lee `mis.update number=`. La respuesta es la misma que la del filtro simple `PR_Patient_ID=1`. Una tabla que no es una pestaña bajo el maestro se rechaza con el motivo, y también un registro que no existe o un nombre que comparten dos registros (entonces dé el id). Un registro sin nada debajo es un cero verdadero, no una pregunta vacía.

`mis.diff kind=<table> file=<sheet.csv>` compara una hoja con la tabla antes de cargarla, y no escribe nada. Cada línea de la hoja se empareja por su Document No, si no por Name, si no por Value (`key=` nombra otra columna), y la respuesta las clasifica: `new` (ningún registro tiene esa clave), `changed` (una columna difiere; se muestran el valor almacenado y el de la hoja), `same`, y `missing` (registros activos que la hoja no menciona). Una clave repetida en la hoja, una clave que coincide con varios registros y una línea sin clave se nombran aparte y no se comparan. Un número es igual como número (`1200.50` y `1200.5`), una fecha es igual a la fecha almacenada, y una celda de búsqueda se compara por el nombre del registro al que apunta el id almacenado. Si `mis.load` encontraría ese nombre no se pregunta aquí: eso lo hace `mis.load dry=Y`.

<!-- run: mis_md cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; printf 'Name,BloodGroup\nAminah,A\nBoon,B\nDevi,O\n' > patients.csv; rm -f /tmp/fast_guide_md.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_md.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^ops:'; eval "$D 'mis.update kind=PR_Patient number=Aminah BloodGroup=A'" | grep -E '^changed:'; for v in 'Name=Checkup PR_Patient_ID=1 Fee=50' 'Name=Follow-up PR_Patient_ID=1 Fee=30' 'Name=Checkup PR_Patient_ID=2 Fee=50'; do eval "$D 'mis.new kind=PR_Visit $v'" | grep -E '^id:'; done; eval "$D 'mis.list kind=PR_Visit master=PR_Patient/Aminah columns=Name,Fee'"; eval "$D 'mis.sum kind=PR_Visit column=Fee master=PR_Patient/1'" | grep -E '^summary:'; eval "$D 'mis.group kind=PR_Visit by=Name master=PR_Patient/2'"; eval "$D 'mis.list kind=PR_Visit master=PR_Room/1'" | grep -E '^reason:'; eval "$D 'mis.diff kind=PR_Patient file=patients.csv'" | grep -E '^(new|changed|missing|ops|summary):'; rm -f Ninja_Practice.xlsx patients.csv
ops: 151
changed: ["bloodgroup"]
id: 1
id: 2
id: 3
Name       Fee
Checkup    50
Follow-up  30
shown 2 of 2
summary: 80 = sum of Fee over 2 PR Visit
Name     count
Checkup  1
shown 1 of 1
reason: PR Visit is not a detail of PR Room: it has no link column PR_Room_ID (the parent link of a tab). Nothing was listed
new: [{"row":3,"key":"Devi"}]
changed: [{"row":2,"key":"Boon","changes":[{"column":"BloodGroup","table":"","sheet":"B"}]}]
missing: ["Chandra"]
ops: 0
summary: 1 new, 1 changed, 1 the same, 1 in the table and not in the file; nothing was written
```

`mis.diff` no compara: una columna de la tabla que la hoja no nombra. La clave es una columna. Un maestro dos niveles más arriba (el paciente de un medicamento) se rechaza: no es el padre de pestaña del medicamento.

### Un archivo de líneas MIS, probado primero: `--script … --dry`

Una configuración que usted quiere repetir (un libro de trabajo, sus primeros registros, una verificación) es un archivo de líneas ejecutado con `--script`, como en [Un script](#a-script-several-lines-a-named-result): se detiene en la primera línea que no es ok, y las líneas siguientes no se ejecutan. Agregue `--dry` para probar primero todo el archivo. El archivo se ejecuta entonces sobre una copia desechable de su op-log (`BIM_OBJECT_OPLOG` debe nombrarlo) y de los archivos de esta carpeta, de modo que una línea posterior ve lo que creó una anterior, exactamente como en la ejecución real, y obtiene la respuesta de la ejecución real. Al final la copia se elimina: su op-log, sus archivos y la bitácora quedan como estaban. Los archivos de subcarpetas no se copian. Una línea que actúa fuera del op-log (una sesión del Modeller, un servidor legado, un paquete) no puede contenerse, así que en una ejecución en seco se rechaza y el archivo se detiene allí.

<!-- run: script_dry cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; printf -- '-- the tables, a patient, a visit of hers, and the fees under her\nninja.exec file=Ninja_Practice.xlsx data=N\nmis.new kind=PR_Patient Name=Devi BloodGroup=O\nmis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50\nmis.sum kind=PR_Visit column=Fee master=PR_Patient/Devi\n' > setup.door; rm -f /tmp/fast_guide_dry.ops; export BIM_OBJECT_OPLOG=/tmp/fast_guide_dry.ops; node common/door/door.js --list --script setup.door --dry | grep -E '^(tablesMade|id|summary):'; test -e /tmp/fast_guide_dry.ops && echo 'op-log: written' || echo 'op-log: not written'; node common/door/door.js --list --script setup.door | grep -E '^summary:'; echo "op-log: $(wc -l < /tmp/fast_guide_dry.ops) ops"; rm -f Ninja_Practice.xlsx setup.door
tablesMade: 5
id: 1
id: 1
summary: 50 = sum of Fee over 1 PR Visit
op-log: not written
summary: 50 = sum of Fee over 1 PR Visit
op-log: 153 ops
```

## Hoja de referencia: practique las líneas MIS

Todo lo de aquí es práctica en **su propia copia**: la primera línea nombra un archivo que conserva lo que usted hace, y nada llega a los libros de una empresa real. Elimine ese archivo para empezar de nuevo desde cero. Ejecute las líneas desde la carpeta que contiene `common/` (una copia completa de `bim-ootb`).

| Paso | Escriba esto | Qué obtiene |
|---|---|---|
| Preparar | `export BIM_OBJECT_OPLOG=~/practice.ops` | cada línea siguiente guarda su trabajo en ese archivo |
| Empezar de nuevo | `rm -f ~/practice.ops` | otra vez una práctica vacía |
| Escribir menos | `alias d='node common/door/door.js --list'` | luego una línea es `d '<verb> <inputs>'` |
| Preguntar qué existe | `d 'help all'` | todos los verbos con sus entradas |
| Crear cinco tablas | `cp common/door/samples/Ninja_Practice.xlsx . ; d 'ninja.exec file=Ninja_Practice.xlsx'` | pacientes, visitas, medicamentos, habitaciones y derivaciones, con 3 pacientes y 2 habitaciones cargados |
| Probar antes de crear | `d 'ninja.exec file=Ninja_Practice.xlsx dry=Y'` | qué crearía; no se escribe nada |
| Crear una tabla | `d 'mis.add_window file=AST_Asset.csv'` | una ventana desde un `.csv` de sus columnas (sección de arriba) |
| Listar | `d 'mis.list kind=PR_Patient'` | las filas |
| Listar algunas columnas | `d 'mis.list kind=PR_Visit columns=Name,Fee'` | solo esas columnas |
| Qué puede contener | `d 'mis.describe kind=PR_Patient'` | sus columnas, tipos y listas |
| Agregar | `d 'mis.new kind=PR_Patient Name=Devi BloodGroup=O'` | un registro nuevo y su id |
| Agregar bajo un maestro | `d 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'` | una visita del paciente 1 |
| Agregar un nivel más abajo | `d 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'` | un medicamento de la visita 1 |
| Leer uno con lo que hay debajo | `d 'mis.read kind=PR_Patient id=1'` | el paciente y las visitas |
| Cambiar | `d 'mis.update kind=PR_Patient id=1 BloodGroup=AB'` | el registro cambiado |
| Ver un rechazo | `d 'mis.update kind=PR_Patient id=1 BloodGroup=Z'` | rechazado: `Z` no está en la lista |
| Eliminar | `d 'mis.delete kind=PR_Room id=2'` | el registro desaparece |
| Sumar | `d 'mis.sum kind=PR_Visit column=Fee'` | el total |
| Contar por una columna | `d 'mis.group kind=PR_Patient by=BloodGroup'` | un conteo por valor |
| Cargar muchas filas | `d 'mis.load kind=PR_Room file=rooms.csv'` | una vista previa; agregue `dry=N` para cargar |
| Trabajar en una pantalla | `node common/door/mis.js kind=PR_Patient` | una lista por la que se mueve con las teclas; `+` agrega, Enter edita |
| Como otro rol | agregue `role=102` a una línea | lo que ese rol puede ver y hacer |
| Agregar bajo una tabla del sistema | `d 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'` | una derivación en el socio de negocio 112 (una pestaña de la ventana Business Partner) |
| Dar a una tabla las columnas de documento | `d 'ninja.workflow table=PR_Visit'` | un estado en cada visita (`DR`), antigua y nueva |
| Deshacer el paquete de un libro de trabajo | `d 'ninja.rollback bundle=Practice'` | todo lo que creó queda desactivado (se bloquea mientras una tabla tenga registros); primero `dry=Y` |
| Escribir un paquete de vuelta como libro de trabajo | `d 'ninja.export bundle=Practice file=Practice_out.xlsx'` | el modelo, para editarlo y ejecutarlo de nuevo |
| Bajo un registro | `d 'mis.list kind=PR_Visit master=PR_Patient/1'` | solo las visitas del paciente 1; también en `mis.sum` y `mis.group` |
| Comparar una hoja antes de cargar | `d 'mis.diff kind=PR_Patient file=patients.csv'` | líneas nuevas, cambiadas, iguales y faltantes; no se escribe nada |
| Mantener un Modeller abierto | `d 'model.open sheets=shed type="Farming Shed" file=shed.db'` luego `d model.convert`, `d 'model.addbay end=high'`, `d model.undo`, `d model.close` | las hojas 2D pasadas a 3D, un vano agregado y deshecho; cada línea tarda unos segundos; close guarda en shed.db |
| Guardar el modelo ahora | `d model.save` (o `d 'model.save file=shed.db'` la primera vez) | la verificación de colisiones, luego se escribe shed.db; se rechaza mientras haya una colisión RED |
| Cerrar sin guardar | `d 'model.close discard=Y'` | los cambios se descartan a propósito (un close simple se rechaza cuando no hay archivo de guardado) |
| Probar primero un archivo completo | `node common/door/door.js --list --script setup.door --dry` | la respuesta real de cada línea; nada se conserva (necesita `BIM_OBJECT_OPLOG`) |
| Una tabla desde un CSV | `d 'ninja.exec file=CL_Client.csv'` | la tabla a partir del encabezado, sus líneas cargadas; si se ejecuta otra vez, solo se cargan las líneas nuevas |
| El menú en una pantalla | `d menu` (o `d 'menu role=102'`) | el menú del ERP; Enter abre la lista de una ventana, Esc vuelve, `/` busca |
| Encontrar una entrada del menú | `d 'mis.menu role=102 find=partner'` | las entradas cuyo nombre contiene "partner", con sus carpetas |
| Trabajar en otra ventana | agregue `window=<name or id>` a `mis.new`, `mis.update` o `mis.delete` | los campos de la pestaña de esa ventana, para una tabla mostrada en dos ventanas |

**Velocidad.** Después de un libro de trabajo grande, la puerta conserva una imagen de lo que el op-log ha creado, de modo que una línea posterior no aplica de nuevo cada operación; se usa solo mientras el archivo de su op-log todavía comienza exactamente como antes, y `ERP_OPIMAGE=off` la desactiva.

Un libro de trabajo propio: copie el archivo de práctica, cambie las filas de `2_RO_ModelMaker` por sus tablas (un prefijo propio, como `MY_`, las mantiene separadas de las tablas que ya existen; un nombre que el sistema ya tiene se reutiliza, no se crea dos veces), y ejecute `ninja.exec` sobre él con `dry=Y` primero. Las líneas de esta tabla son los verbos mostrados en funcionamiento en las secciones de arriba; la prueba de esta página no vuelve a ejecutar la tabla misma, los bloques grises sí.

## Trabaje en la terminal: `mis.js`

Si prefiere elegir en lugar de escribir, `mis.js` muestra una lista con un puntero. Es solo una interfaz: cada tecla se compila en **una** de las líneas de la puerta de arriba, se ejecuta por la misma puerta (con bitácora y verificación de solicitudes retenidas), y la pantalla imprime la línea antes de ejecutarla. Arriba y Abajo mueven el puntero. Izquierda y Derecha se mueven por los botones de la fila señalada (`[U Edit] [D Delete] [C Copy]` para un registro; para un documento, las acciones que el motor permite ahora, como `[C Complete] [V Void]`, y ningún Delete una vez completado). Enter ejecuta el botón resaltado. `+` inicia un registro nuevo, Delete pregunta `y/N`, y Esc sale y no escribe nada.

En una terminal dibuja con las teclas de flecha. Con `--plain` lee nombres de teclas desde una tubería (pipe), de modo que un script, un lector de pantalla y una IA ven exactamente lo que ve una persona:

<!-- run: mis_screen cut=150 -->
```text
$ printf 'Down Right Esc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner name=Standard limit=3 --plain 2>/dev/null
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=3 offset=0 name=Standard
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
 > 112            Standard  Standard           Standard Customers >[U Edit]< [D Delete] [C Copy]
   1300112        Standard  Standard           Standard Customers
the line it will run: mis.read kind=C_BPartner id=112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Down
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers >[U Edit]< [D Delete] [C Copy]
the line it will run: mis.read kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Right
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers [U Edit] >[D Delete]< [C Copy]
the line it will run: mis.delete kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
key Esc
C_BPartner (name=Standard)   shown 1-2 of 2   [+ New]   no role: nothing is filtered
   C_BPartner_ID  Value     Name      Logo_ID  C_BP_Group_ID     
   112            Standard  Standard           Standard Customers
 > 1300112        Standard  Standard           Standard Customers [U Edit] >[D Delete]< [C Copy]
the line it will run: mis.delete kind=C_BPartner id=1300112
 Up/Down row   Left/Right chip   Enter run   + new   PageDown next   Esc quit
```

Agregue `role=103` al comando y cada línea que envía la pantalla lleva ese rol; la línea de encabezado lo nombra. Sin rol, la línea de encabezado dice que no se filtra nada.

Un formulario pide solo lo que el motor no puede llenar (la ejecución en seco de arriba). Al escribir se llena el campo, Tab o Enter avanza, y Enter en el último campo muestra la única línea que se ejecutará. Una línea que empieza con `=` es texto escrito. Aquí está toda la sesión, reducida a las líneas de la puerta que ejecutó:

<!-- run: mis_form cut=200 -->
```text
$ printf '+\n=GD300\nTab\n=Guide Four\nEnter\ny\nEsc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner value=GD300 --plain 2>/dev/null | grep '^->'
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
-> mis.new kind=C_BPartner dry=Y
-> mis.new kind=C_BPartner Value=GD300 Name="Guide Four"
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
```

Edit funciona igual: muestra solo las columnas que la ventana permite editar a una persona, con las búsquedas como nombres, y envía solo lo que usted cambió. Copy inicia un registro nuevo a partir del señalado, de modo que usted debe cambiar lo que debe ser único (un duplicado se rechaza y se conserva lo que escribió). Defina `MIS_SESSION_FILE=session.door` y una sesión de terminal registra las líneas que ejecutó, una por línea, como un script que usted puede leer y ejecutar de nuevo.

### El menú en una pantalla: `menu` y `mis.menu`

`node common/door/door.js menu` (con el alias de la hoja de referencia, `d menu`; en el shell red1, `menu`) abre el menú del ERP en la terminal, el mismo menú que muestra el ERP del navegador, con las mismas carpetas en el mismo orden. Agregue un rol (`d 'menu role=102'`) y verá solo lo que ese rol puede abrir. Arriba y Abajo, o un número, eligen una entrada; Enter abre una carpeta, o la pantalla de lista de una ventana (la pantalla de `mis.js` de arriba, sobre la tabla de la primera pestaña de la ventana); Esc sube un nivel, y desde la cima sale; `/` busca una entrada por nombre; `?` muestra las teclas. Un proceso, un informe o un formulario dice que se abre en el ERP del navegador, y no ejecuta nada. Como en toda esta página, la pantalla solo escribe líneas de la puerta por usted, y imprime cada una antes de ejecutarla (las líneas `->`), de modo que lo que hace en la pantalla también puede escribirlo, o ponerlo en un script.

El menú mismo es una línea de la puerta, `mis.menu [role=] [find=]`. Aquí la pantalla se maneja con teclas escritas (`--plain` las lee de la entrada), buscando "partner" y abriendo la tercera coincidencia:

<!-- run: menu_screen cut=200 -->
```text
$ rm -f /tmp/fast_guide_menu.ops; printf '/\n=partner\nEnter\n3\nEsc\nEsc\nq\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_menu.ops node common/door/door.js 'menu role=102' --plain | grep -E '^(-> |key |Menu|find|> )'
-> mis.menu role=102
Menu   (role 102)   294 windows
> 1  ▸ System Admin
key /
Menu   (role 102)   294 windows
> 1  ▸ System Admin
find: _   (Enter search, Esc cancel)
key =partner
Menu   (role 102)   294 windows
> 1  ▸ System Admin
find: partner_   (Enter search, Esc cancel)
key Enter
-> mis.menu find=partner role=102
find "partner"   (role 102)   294 windows
> 1    System Admin > Data > Data Import > Import Business Partner
key 3
-> (open Business Partner Group: the list screen on C_BP_Group)
-> mis.describe kind=C_BP_Group role=102
-> mis.list kind=C_BP_Group columns=C_BP_Group_ID,Value,Name,Description names=Y limit=10 offset=0 role=102
key Esc
find "partner"   (role 102)   294 windows
> 3    Partner Relations > Business Partner Rules > Business Partner Group
key Esc
Menu   (role 102)   294 windows
> 1  ▸ System Admin
key q
Menu   (role 102)   294 windows
> 1  ▸ System Admin
```

## Elija cómo se muestra la respuesta, y consérvela

La respuesta es el sobre JSON a menos que usted pida otra cosa. Tres opciones muestran las filas de una respuesta como algo que una persona o una hoja de cálculo puede leer; el sobre sigue siendo lo que la puerta registra:

- `--list`: una tabla alineada, que termina con `shown N of TOTAL`. Una respuesta que es un solo registro muestra líneas `field: value`.
- `--csv`: las filas como CSV (RFC 4180: una celda con una coma, una comilla o un salto de línea va entre comillas; los números son exactamente los que devolvió el motor).
- `--out FILE` escribe la forma elegida en un archivo de la carpeta actual en lugar de la pantalla. Una línea que se rechaza, se retiene o es no concluyente no escribe ningún archivo y lo dice.

<!-- run: csv_orders -->
```text
$ node common/door/door.js --csv 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo,DocStatus,GrandTotal
80001,CO,100.7
80001,CO,100.7
800002,CO,2160
```

En un script, termine una línea con `> file` para enviar la respuesta de esa línea a un archivo en la carpeta del script (`>> file` agrega a él). La forma sigue al nombre: `.csv` es CSV, `.json` es el sobre, cualquier otra cosa es la lista. Una ruta que sale de la carpeta del script se rechaza.

Estas opciones viven en un quinto archivo, `render.js`; póngalo junto a `door.js` cuando las use desde una descarga:

```text
curl -O https://red1oon.github.io/bim-ootb/common/door/render.js
```

## Pregunte a la puerta: `help`

Escriba `help` para ver los comandos comunes, cada uno como una línea que usted puede ejecutar. `help erp` lista todos los verbos de una aplicación, `help erp.find` muestra un verbo completo (qué hace, cada entrada, qué puede cambiar, quién puede ejecutarlo), y `help all` lista todo. La ayuda se genera a partir de la misma lista de verbos que la tabla de abajo, no lee nada, no ejecuta nada y no se registra en la bitácora.

<!-- run: help_verb -->
```text
$ node common/door/door.js 'help erp.find'
erp.find — Find a document

Find a document by its number, the way a window's Find does (DocumentNo, else Name or Value). Returns every match with its key, DocStatus and DocAction. Nothing is changed. Kinds: any document table of the dictionary (34).

Inputs:
  kind (required, string) e.g. Order — The kind of document, as the dictionary names it (an AD_Table with a DocAction column), e.g. "Order". 34 kinds exist; an unknown kind or a table that is not a document is refused naming the reason.
  number (required, string) e.g. 50000 — The document number (DocumentNo) as shown in the window; if two documents carry it, name one with id.

Harm: read (reads only)
Who may run it: human, ai
Example: erp.find kind=Order number=50000
```

## Para desarrolladores: verifique el gemelo contra el legado

Estos verbos son para quien mantiene el gemelo del ERP igual al iDempiere real. Necesitan una copia completa de bim-ootb, y para los cuatro primeros la pila de pruebas del legado en ejecución (un Postgres en docker y el servidor piloto) y el código fuente de iDempiere a su lado. Cuando falta una parte responden `inconclusive` y dicen cuál: nunca responden una lista vacía o "igual" para algo que no pudieron mirar.

`legacy.status` pregunta si la pila está en marcha. No inicia nada; cuando algo está caído imprime los comandos que lo inician:

<!-- run: legacy_status -->
```text
$ node common/door/door.js --list 'legacy.status'
verdict: UP
postgres: {"container":"postgres","database":"idempiere_pilot","state":"ready"}
pilot: {"url":"http://localhost:8088/webui/","http":200,"state":"up"}
summary: legacy UP: postgres ready, pilot up
next: []
```

`erp.column` responde "quién llena esta columna", desde el diccionario del gemelo y el del legado lado a lado: el valor por defecto de la columna, la regla de validación, el valor por defecto del campo y el valor por defecto del inicio de sesión (iDempiere pone la fila `IsDefault` de una tabla referenciada en el contexto al iniciar sesión). Cuando los dos lados discrepan dice `DIFFERENT` y qué parte:

<!-- run: column_docaction -->
```text
$ node common/door/door.js --list 'erp.column kind=Order column=DocAction'
kind: Order
table: C_Order
column: DocAction
twin: {"found":true,"table":"C_Order","column":"DocAction","reference":28,"mandatory":"Y","updateable":"Y","defaultValue":"CO","validationRule":null,"fieldDefaults":[],"loginDefault":null,"filledBy":"the column default CO"}
legacy: {"found":true,"table":"C_Order","column":"DocAction","reference":28,"mandatory":"Y","updateable":"Y","defaultValue":"CO","validationRule":null,"fieldDefaults":[],"loginDefault":null,"filledBy":"the column default CO"}
differs: []
verdict: SAME
notChecked: []
summary: C_Order.DocAction: SAME; twin fills it by the column default CO; legacy by the column default CO
```

`idempiere.where` busca un nombre en el código fuente de iDempiere y responde el archivo, la línea y el texto de la línea, de modo que una afirmación sobre el comportamiento del legado pueda citar de dónde proviene. Muestra 25 líneas a menos que `limit` diga otra cosa y siempre da el total; `in=callout` conserva solo los archivos cuya ruta contiene ese texto:

<!-- run: where_invoicerule -->
```text
$ node common/door/door.js --list 'idempiere.where symbol=InvoiceRule in=CalloutOrder limit=2'
symbol: InvoiceRule
hits: [{"file":"org.adempiere.base.callout/src/org/compiere/model/CalloutOrder.java","line":50,"text":"*\t\t- InvoiceRule/DeliveryRule/PaymentRule"},{"file":"org.adempiere.base.callout/src/org/compiere/model/CalloutOrder.java","line":131,"text":"mTab.setValue (\"InvoiceRule\", X_C_Order.INVOICERULE_Immediate);"}]
shown: 2
total: 20
files: 1
verdict: OK
summary: InvoiceRule: 20 lines in 1 files (showing 2)
```

Tres verbos más están junto a estos. `legacy.query table=c_order ad_client_id=11 limit=5` lee filas de una tabla del legado (solo lectura; la tabla y cada columna se verifican contra el diccionario del legado, y siempre se da el total). `erp.compare kind=Order number=50000 legacy=50981` lee un registro en el gemelo y el correspondiente en el legado y los compara celda por celda; una celda donde el legado está vacío y el gemelo tiene un valor por defecto se etiqueta `NULL-VS-DEFAULT` y no se dice nada sobre por qué. `witness.run name=erp_new` ejecuta un testigo del árbol, conserva todo su log y responde su propia línea de veredicto (PASS, FAIL o INCONCLUSIVE); un testigo que no imprime una línea de veredicto es un error, porque un código de salida no es evidencia, y `witness.last` lee la última ejecución registrada sin ejecutarla de nuevo.

### Cree un plugin para un iDempiere legado (OSGi y 2Pack)

Para quien pone un modelo de datos de ERP en un servidor iDempiere real. El modelo de datos es un libro de trabajo (Excel): una hoja por tabla del Application Dictionary (`AD_Table`, `AD_Column`, `AD_Window`, `AD_Tab`, `AD_Field`, `AD_Menu`, etcétera), una fila por registro, la primera fila con los nombres de columna AD, y una columna `Key` que nombra cada fila. Una celda que apunta a otra fila del libro de trabajo se lee `ref:<Key>`; una que apunta a una fila que el servidor ya tiene se lee `existing:AD_Table:C_ProjectTask`. Una hoja `Plugin` lleva el id, la versión y la descripción del plugin. El ejemplo trabajado es el modelo BIM Document, `erp/plugins/models/BIM_Document.xlsx` en el repositorio `bim-ootb`.

Del único libro de trabajo se hacen dos cosas, y se mantienen separadas:

| Se crea | Qué contiene | Adónde va |
|---|---|---|
| **El zip 2Pack** | Solo metadatos: las filas del diccionario y los *nombres* de clase de cualquier proceso. Ningún código de programa. Una versión de pack se aplica una vez y nunca se cambia, así que la misma versión con filas distintas se rechaza | La carpeta `META-INF` del plugin, donde el propio activador de packs de iDempiere lo toma cuando el plugin arranca |
| **Las clases del modelo Java** | `I_<Table>` y `X_<Table>` para cada tabla que crea el libro de trabajo, con la forma en que las escribe el propio generador de iDempiere | La carpeta `src` del plugin |

Lo que el libro de trabajo no puede crear son las reglas: la acción de documento de la tabla, y el código de cualquier proceso. Esos se escriben a mano en la carpeta `src` del plugin, como en cualquier plugin de iDempiere.

El verbo de la puerta `erp.pack book=<workbook.xlsx> version=<x.y.z> out=<plugin>/META-INF` escribe solo el zip, y responde su sha256, las filas por tabla del diccionario y los nombres de las clases de proceso a las que apunta. Ejecutado de nuevo con la misma versión y las mismas filas responde `unchanged`; la misma versión con un libro de trabajo editado se rechaza, porque un pack publicado nunca se cambia. Agregue `java=<plugin>/src package=<java package>` y también se escriben las clases del modelo Java. Lo ejecuta una persona; la llamada de una IA se retiene como solicitud hasta que una persona la confirme. El script de fondo sigue siendo `node erp/tools/xlsx_pack.js`, que imprime una línea `§XLSX-PACK` por cada archivo que escribe. El segundo verbo, `erp.legacy_plugin book=<workbook.xlsx> version=<x.y.z>`, es la ruta completa en la instancia de pruebas del legado local en una sola línea. Ejecuta cinco líneas, y la primera que no es ok lo detiene: `legacy.up` (iniciar el Postgres compartido en docker si está detenido), `erp.pack` (crear el zip), `legacy.refresh` (reconstruir la base de datos de pruebas desde la semilla base, instalar el plugin, iniciar el servidor y esperar hasta que el pack esté instalado, unos dos minutos), `legacy.check` (leer de vuelta cada fila del libro de trabajo desde la base de datos de pruebas con SQL) y `legacy.witness` (ejecutar la verificación dentro del servidor por la consola del servidor y responder su veredicto y sus conteos). Cada paso puede ejecutarse solo. La instancia, su base de datos y los scripts son fijos: no se toma nada de quien llama, y las bases de datos del piloto se rechazan. Lo ejecuta una persona; la llamada de una IA se retiene como solicitud hasta que una persona la confirme.

`legacy.check` es el de solo lectura, y responde cuántas filas de cada tipo se encontraron frente a cuántas contiene el libro de trabajo:

<!-- run: legacy_check -->
```text
$ node common/door/door.js --list 'legacy.check book=erp/plugins/models/BIM_Document.xlsx'
database: idempiere_bimdoc
book: erp/plugins/models/BIM_Document.xlsx
checks: [{"what":"AD_Table rows","expected":1,"found":1,"ok":true},{"what":"physical tables","expected":1,"found":1,"ok":true},{"what":"AD_Column rows","expected":34,"found":34,"ok":true},{"what":"AD_Window rows","expected":1,"found":1,"ok":true},{"what":"AD_Tab rows","expected":3,"found":3,"ok":true},{"what":"AD_Menu rows","expected":1,"found":1,"ok":true},{"what":"AD_Process rows with the same class name","expected":2,"found":2,"ok":true},{"what":"AD_Reference rows","expected":4,"found":4,"ok":true}]
pack: {"compared":false,"note":"no version given: the installed pack was not compared with a fresh one"}
missing: []
verdict: ALL-FOUND
summary: test DB idempiere_bimdoc: ALL-FOUND (8/8 kinds of row); no version given: the installed pack was not compared with a fresh one
```

Dele también `version=<x.y.z>` y compara el 2Pack instalado en el plugin con el pack recién hecho a partir del libro de trabajo, y dice con claridad cuando difieren: el refresh instala el paquete del plugin tal como está confirmado en el repositorio, de modo que los dos pueden divergir hasta que se reconstruya el paquete.

## Preguntas al Viewer desde una descarga simple

Dos verbos del Viewer, `viewer.counts` y `viewer.clashes`, también funcionan sin una copia completa. Ponga dos archivos más junto a los cuatro:

```text
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_verbs.js
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_driver.js
```

Sin archivos de página en su disco, la herramienta abre la página en vivo del Viewer con el edificio que sirve el sitio, en un navegador oculto sobre el procesador, y consulta el propio panel Find (buscar) del Viewer. `page` en la respuesta dice qué página se usó:

<!-- run: viewer_flat -->
```text
$ node door.js 'viewer.counts building=Duplex' | grep -o '"summary":"[^"]*"\|"page":"[a-z]*"'
"summary":"1119 elements: MEP 904, ARC 196, STR 19"
"page":"live"
```

Tarda alrededor de medio minuto. Los números son los del edificio servido, por lo que pueden diferir de una copia más antigua en una copia completa. Los verbos de cronograma, `viewer.film_path`, los verbos de objetos y `modeller.walk` todavía necesitan una copia completa; la tabla dice cuál.

## El shell red1: palabras cortas en un solo prompt {#the-red1-shell-short-words-at-one-prompt}

`red1` es la puerta para una persona ante un teclado. Escriba `node common/door/red1.js` (o `red1`, después de ejecutar `npm link` una vez en la copia completa) y obtendrá un prompt `red1>`. Cada palabra corta se convierte en UNA línea de la puerta, y esa línea se imprime, después de `→`, antes de ejecutarse. Así el shell le enseña la línea completa sobre la marcha, y un script o una IA puede ejecutar la misma línea sin ningún shell. Una línea completa de la puerta escrita en el prompt sigue funcionando tal cual.

`cd` dice dónde está, de modo que usted no lo repite: un edificio (`cd Duplex`), un tipo de él (`cd Element`), o un tipo del ERP (`cd Order`). El prompt lo muestra (`red1 Duplex/Element>`), y `pwd` lo imprime como claves de la puerta. En una ejecución de un solo disparo, `;` separa las palabras:

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Las mismas palabras escritas en el prompt (aquí alimentadas desde una tubería, de modo que la respuesta se imprime, no se dibuja):

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

**Buscar, con comodines.** `*` es cualquier tramo de caracteres, `?` un carácter, `[abc]` uno de ellos; las mayúsculas no importan. En un tipo, nombre la columna: `ls element_name=*bath*`. El mismo filtro funciona en todo verbo de lista (`mis.list`, `object.list`, `object.count`), tanto para tablas del ERP como para edificios. Un valor sin comodín sigue siendo una coincidencia exacta.

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

**Colisiones, dibujadas.** `clash ARC MEP` en un edificio consulta al Viewer y dibuja los propios números de la respuesta como un embudo (se dibuja solo cuando sus partes suman). `ls` luego lista las filas de colisión de la misma respuesta, sin preguntar de nuevo, y `ls *Bath*` conserva las filas donde alguna celda coincide. Escrito solo, `clash` abre un menú de las disciplinas del edificio (teclas de flecha o un dígito, luego Return; Esc cancela). En una sesión la página del Viewer queda abierta, así que después de la primera línea una colisión responde en alrededor de un segundo.

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

**Qué puede hacer un documento a continuación.** En un tipo del ERP, `next <number>` dibuja las acciones que el motor permite ahora, y señala cada una que tiene una palabra hacia la línea que la ejecuta:

<!-- run: red1_next -->
```text
$ printf 'cd Order\nnext S00002\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Order
Order: 93 properties; ls shows C_Order_ID, DocumentNo, DocStatus, Processed, POReference, Description
→ erp.actions kind=Order number=S00002
ok · erp.actions
Order S00002  status DR
├─ CO  → do complete S00002
├─ PR  (no red1 word for it yet)
└─ VO  → do void S00002
```

`help` lista las palabras; `help verbs` lista todos los verbos de la puerta. **Desde JavaScript**, los mismos verbos son un solo objeto, generado a partir del vocabulario (un verbo nuevo no necesita código nuevo):

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Límites.** Las palabras de objeto (`cd Element`, `ls`, `group`) necesitan un modelo que lleve el diccionario de objetos; de los edificios que hay aquí, solo el Duplex lo tiene. Una lista más alta que la terminal se detiene en cada página (Space, q); una tubería recibe todas las filas.

## Los verbos {#the-verbs}

Esta tabla se **genera a partir del archivo de vocabulario** (`common/door/verbs.json`) y una prueba verifica que coincida, verbo por verbo. Es la misma lista con la que se construye el menú de herramientas de la IA. La *clase de daño* se explicó arriba; *Necesita* dice cuál de las dos descargas ejecuta el verbo.

<!-- GEN:verbs -->
| Verbo | Qué hace | Entradas | Daño | Quién puede usarlo | Necesita |
|---|---|---|---|---|---|
| `modeller.lines` | Leer la cuadrícula | `building` | read | human, ai | la descarga de 4 archivos |
| `modeller.try_shift` | Probar el desplazamiento de una línea de la cuadrícula | `building`, `line`, `move` (metros) | trial | human, ai | la descarga de 4 archivos |
| `viewer.counts` | Contar elementos | `building`, `by` (opcional) | read | human, ai | los 4 archivos + los 2 archivos del Viewer |
| `viewer.clashes` | Listar las colisiones entre dos disciplinas | `building`, `discA`, `discB`, `rows` (opcional) | read | human, ai | los 4 archivos + los 2 archivos del Viewer |
| `viewer.film_path` | Visibilidad de la ruta de la película | `db`, `path` (opcional) | read | human, ai | una copia completa de bim-ootb |
| `viewer.schedule_at` | Estado del cronograma en un día | `building`, `day` (número de día) | read | human, ai | una copia completa de bim-ootb |
| `viewer.schedule_compare` | Motor de cronograma frente a su referencia | `building`, `shift_hours` (horas) (opcional) | read | human, ai | una copia completa de bim-ootb |
| `modeller.widen_bay` | Ensanchar un vano hasta un ancho objetivo | `building`, `from`, `to`, `target` (metros) | trial | human, ai | la descarga de 4 archivos |
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

**Cobertura actual.** La lista es pequeña a propósito: 59 verbos cubren las ediciones de cuadrícula del Modeller, su walker y un Modeller mantenido abierto entre líneas, unas pocas preguntas del Viewer, el cronograma, la lectura, el conteo y la escritura genéricos de objetos, y los primeros verbos de documento del ERP. El Viewer tiene 64 acciones que una persona puede presionar, y la puerta ofrece 5 verbos del Viewer. El ERP tiene 1157 documentos y procesos, y la puerta ofrece 6 verbos del ERP para la vida de un documento y 14 verbos MIS que funcionan en cualquier tabla, y conserva 10 nombres antiguos para que las líneas anteriores sigan ejecutándose. Así que esto es un comienzo, no el menú completo.

## Lo que no se verifica {#what-is-not-checked}

Una respuesta lista lo que su verificación no cubrió. Para el informe de edición del Modeller la lista es:

<!-- run: notchecked cut=520 -->
```text
$ grep -o '"notChecked":\[[^]]*\]' widen.json | tail -1
"notChecked":["duplicate ids","elements changed outside the edit's own list","floating or unsupported elements","grid lines placed on top of each other","invalid coordinates","real beams: only girders walked from columns are span-checked","unknown element types","wrong units or absurd sizes, unless they hit something","zero-size elements","load capacity","beam and column rules (Regulatory Report only)"]
```

Las mismas palabras se aplican a cualquier respuesta: las superposiciones son primero cajas delimitadoras, una verificación cubre solo lo que se movió, y **la capacidad de carga nunca se verifica**. Una respuesta sin rojo nunca significa que sea segura.

## Solución de problemas

| Lo que ve | Qué hacer |
|---|---|
| `edit_cli is not at …` | Falta uno de los cuatro archivos. El mensaje imprime la línea `curl` |
| `puppeteer not found` | Ejecute `npm install puppeteer@24` en la misma carpeta |
| `unknown verb` | El mensaje lista todos los verbos. Compare la ortografía con la [tabla](#the-verbs) |
| `missing input: …` | El verbo necesita esa clave. La tabla lista las entradas |
| `The Viewer tools need a bim-ootb checkout` | Ejecútelo como `node common/door/door.js` desde una copia completa |
| `exit 1` con un mensaje de Chrome | Faltan las bibliotecas del sistema de Chrome en Linux. La página de solución de problemas de Puppeteer las lista |

**Límites a tener en cuenta.** Cada llamada al Modeller abre el edificio completo: unos 10 a 40 segundos en HospitalGarage. Esta es una herramienta de medición, no un servicio con disponibilidad garantizada. Un script con varias líneas del Modeller abre el edificio una vez por línea.

## Cómo se mantiene fiel esta página

Cada comando de un bloque gris de arriba se ejecutó, y la salida debajo es lo que el comando imprimió. Una prueba, **W-FAST-SCRIPT-GUIDE** en el repositorio `bim-ootb`, los ejecuta de nuevo desde una descarga limpia de cuatro archivos, verifica cada número de esta página contra las ejecuciones, y verifica que la tabla de verbos sea igual a `verbs.json`. Si un número de aquí queda obsoleto, esa prueba falla.

Relacionado: la [Guía del proponente de IA](ProposerGuide.md) (conecte una IA a la misma puerta, y qué hizo una IA con las verificaciones), y la [guía del Modeller](ModellerGuide.md).
