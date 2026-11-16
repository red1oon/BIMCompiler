---
review: machine
source_sha: 276f5bede717d2ac
lang: fr
---

# Guide de l'utilisateur Fast Script

**Donnez aux applications BIM et ERP une courte commande à la fois, ou quelques lignes dans un fichier, et recevez la réponse propre à l'application. Les mêmes lignes fonctionnent pour vous dans un terminal et pour une IA.**

Voici le guide de l'**unique porte** : un petit moteur de scripts placé devant les applications. Vous écrivez une ligne comme `modeller.lines building=HospitalGarage`. La porte la lit, la vérifie par rapport à une liste fixe de verbes, appelle le code propre à l'application et rend la réponse avec ce qui n'a pas été vérifié. Il n'y a aucune IA dans la porte.

![Une porte. Les acteurs à gauche parlent avec les mêmes verbes ; la porte analyse, vérifie, lie, appelle et répond ; ce sont les vérifications propres à l'application qui décident.](figs/one_door.svg)

Lisez l'image de gauche à droite.

1. **Acteur.** Celui qui envoie la ligne, et la façon dont elle arrive. Aujourd'hui, c'est une IA par une connexion d'outils, ou une personne à un terminal. Une boîte aux lettres, un téléphone et un appareil sont prévus et **pas encore construits**.
2. **Canal : les verbes.** Une liste de tout ce qu'un acteur peut dire. Chaque verbe a une description simple, ses entrées et une classe de *risque*. Vous trouverez la liste complète [ci-dessous](#the-verbs).
3. **Une porte : le moteur de scripts.** Il analyse la ligne, vérifie les entrées, lie la ligne à celui qui la demande, appelle l'application et répond. Chaque acteur passe par la même porte, donc la même ligne donne la même réponse.
4. **Moteur : l'application.** Ce sont les vérifications propres à l'application qui décident. Un changement qui ajoute un nouveau problème est annulé, et la raison est renvoyée.

!!! warning "Ce qu'une bonne réponse ne signifie pas"
    Une réponse sans problème **ne signifie jamais qu'elle est sûre, conforme ou bonne**. Chaque réponse liste ce qui n'a pas été vérifié, et [Ce qui n'est pas vérifié](#what-is-not-checked) le liste de nouveau. Un ingénieur en structures a le dernier mot.

**Nouveau ici, avec une IA ?** La connexion d'une IA à la porte est expliquée dans le [Guide du proposeur d'IA](ProposerGuide.md#connect-your-ai). Cette page s'adresse aux commandes et aux scripts que vous écrivez vous-même, et à la lecture de ce qui revient.

## `red1` en un coup d'œil

`red1` est l'entrée rapide : une seule invite pour les applications BIM et ERP. Chaque mot court imprime la ligne complète de la porte qu'il exécute (après `→`), si bien que vous apprenez la forme longue au fur et à mesure. La [section complète sur red1](#the-red1-shell-short-words-at-one-prompt) se trouve vers la fin de cette page.

| Tapez | Ce que cela fait |
|---|---|
| `red1` | ouvre l'invite `red1>` (`node common/door/red1.js`, ou `red1` après un seul `npm link`) |
| `cd Duplex` · `cd Element` · `cd Order` · `cd ..` · `pwd` | aller à un bâtiment, à un type d'objet de celui-ci, ou à un type ERP ; revenir en arrière ; où vous êtes |
| `count` · `ls` · `group storey` · `sum <column>` · `cat <id>` | compter, lister, regrouper, additionner, afficher un enregistrement, ici |
| `ls element_name=*bath*` | Rechercher avec des jokers : `*` toute suite de caractères, `?` un caractère, `[abc]` l'un d'eux |
| `clash ARC MEP` · puis `ls` · `ls *Bath*` | les conflits dessinés en entonnoir ; leurs lignes ; les lignes qui correspondent |
| `clash` | un menu des disciplines du bâtiment s'ouvre : flèches ou un chiffre, puis Entrée |
| `next <number>` · `do complete <number>` | ce qu'un document peut faire maintenant ; le faire |
| `menu` · `help` · `help verbs` · `exit` | le menu de l'ERP ; les mots ; tous les verbes de la porte ; quitter |
| `red1 'cd Duplex; count'` | les mêmes mots depuis un script, en une seule fois |

## Obtenir la porte

Il vous faut Node 18 ou plus récent. Ces étapes ont été exécutées sur Node 18.19.

**Les verbes du Modeller demandent six fichiers.** Créez un dossier vide, installez le moteur de navigateur et téléchargez les fichiers :

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

Gardez les six dans le même dossier. `door.js` lit la liste des verbes dans `verbs.json` et ses messages dans `messages.json` (via `msg_core.js`), et exécute `edit_cli.js`, qui ouvre la page Modeller en ligne sans fenêtre. Si un fichier manque, la porte dit lequel et affiche sa ligne `curl`. `bim_mcp.js` ne sert qu'à connecter une IA ; les commandes de cette page ne l'utilisent pas.

**Les verbes du Viewer, des objets et du planning demandent une copie complète.** Ils ne sont pas dans les six fichiers. Récupérez le dépôt `bim-ootb` entier (`git clone https://github.com/red1oon/bim-ootb`) et lancez `node common/door/door.js` depuis son dossier racine au lieu de `node door.js`. Le [tableau des verbes](#the-verbs) indique, pour chaque verbe, lequel des deux il demande. Un téléchargement en un seul fichier pour le Viewer n'est pas encore construit.

## Votre première commande

Une ligne, un verbe, des paires `key=value` sans espace autour du `=`. Demandez sa grille au HospitalGarage :

<!-- run: lines cut=700 -->
```text
$ node door.js 'modeller.lines building=HospitalGarage'
{"request":"d-mwhmmeq9-2276636-1","verb":"modeller.lines","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[],"ms":16010,"model":{"grid_source":"column-derived","system":"column-framed","material":"RC","mixed":true,"girders":228,"rotation_deg":-2,"frame":"building","lines":[{"id":"gx0","axis":"x","pos":128.131,"world":132.184},{"id":"gx1","axis":"x","pos":129.223,"world":133.277},{"id":"gx2","axis":"x","pos":133.277,"world":137.334},{"id":"gx3","axis":"x","pos":133.795,"world":137.851},{"id":"gx4","axis":"x","pos":134.811,"world":138.868},{"id":"gx5","axis":"x","pos":145.987,"world":150.051},{"id":"gx6","axis":"x","pos":157.163,"world":161.234},{"id":"gx7…
```

Cela ouvre le Modeller et le bâtiment, donc cela prend 10 à 40 secondes. Ce que vous voyez est une ligne de JSON, une **enveloppe**. Seul le début est montré ici ; la grille a plus de lignes qu'il n'en tient. La réponse est celle de l'application, inchangée, dans `answer`. Ici `gx5` est à 145.987 m et `gx6` à 157.163 m sur la grille propre au bâtiment. `status` vaut `ok`.

!!! note "D'où vient la 'request' ?"
    Chaque ligne reçoit un identifiant de requête (`"request":"d-…"`) et est écrite dans un journal avant son exécution, dans `~/.cache/bim_door/journal.jsonl`. Envoyez deux fois le même identifiant et vous recevez la première réponse, donc une nouvelle tentative ne répète jamais une modification. La porte imprime aussi une ligne `§DOOR …` sur le flux d'erreur ; ce guide ne montre que la sortie standard.

## Un verbe pour toute une demande

Une demande comme *« faire passer la travée entre gx5 et gx6 à 13 m de large »* comprend plusieurs étapes : lire la grille, calculer le déplacement, essayer le décalage. Le verbe `modeller.widen_bay` fait les trois. Ses entrées sont les deux lignes et la largeur voulue :

<!-- run: widen -->
```text
$ node door.js 'modeller.widen_bay building=HospitalGarage from=gx5 to=gx6 target=13' > widen.json; echo "exit $?"
exit 3
```

Le code de sortie est la première réponse : `0` signifie ok, `3` signifie que l'application a donné une réponse qui n'est pas un simple oui (refusée, retenue ou non concluante), `1` signifie une erreur et `2` une commande erronée. Regardez maintenant dans le fichier. La requête entière vient d'abord, puis ses deux étapes, chacune avec sa propre enveloppe :

<!-- run: widen_steps cut=200 -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' widen.json
"request":"d-mwhmmrdh-2276921-1","verb":"modeller.widen_bay","actor":"human","status":"refused"
"request":"d-mwhmmrdh-2276921-1.1","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmmrdh-2276921-1.2","verb":"modeller.try_shift","actor":"human","status":"refused"
```

La première étape a lu la grille. Elle a trouvé la travée telle qu'elle est maintenant :

<!-- run: widen_read -->
```text
$ grep -o '"id":"gx[56]","axis":"x","pos":[0-9.]*' widen.json
"id":"gx5","axis":"x","pos":145.987
"id":"gx6","axis":"x","pos":157.163
```

La travée mesure donc 157.163 − 145.987 = **11.176 m**. Pour atteindre 13 m, la ligne `gx6`, et toutes les lignes qui la suivent, doivent se déplacer de **1.824 m**. La porte l'a calculé, et la deuxième étape l'a transmis :

<!-- run: widen_move -->
```text
$ grep -o '"move":[0-9.]*' widen.json | head -1
"move":1.824
```

L'application a essayé le décalage, l'a vérifié, et **l'a arrêté** :

<!-- run: widen_why -->
```text
$ grep -o '"why":"[^"]*"' widen.json | tail -1
"why":"line 2 (modeller.try_shift): stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m"
```

La modification a été faite, jugée puis annulée. Rien n'est jamais enregistré. Les chiffres derrière l'arrêt se trouvent dans le rapport de l'application :

<!-- run: widen_bay -->
```text
$ grep -o '"bay":"gx5-gx6"[^}]*' widen.json
"bay":"gx5-gx6","before":11.176,"after":13,"newly_over":true
```

La travée est passée de 11.176 m à 13 m, au-delà de la limite de 12 m de ce bâtiment pour une poutre en béton (`limit` et `material` viennent du bâtiment lui-même). Voilà toute l'histoire de la demande pour le Garage : une travée de 13 m demande une ligne de poteaux de plus.

## Un script : plusieurs lignes, un résultat nommé {#a-script-several-lines-a-named-result}

Un script est un fichier texte avec une commande par ligne. Une ligne peut commencer par un **nom** et un `=`, ce qui conserve sa réponse pour les lignes suivantes. Tout ce qui suit `--` est un commentaire. Enregistrez ceci sous le nom `bay.door` :

<!-- file: bay.door -->
```text
-- read the grid, then widen the bay between gx5 and gx6 to exactly 12 m
lines = modeller.lines building=HospitalGarage
modeller.try_shift building=HospitalGarage line=gx6 move={12 - (lines.model.lines[gx6].pos - lines.model.lines[gx5].pos)}
```

Lancez-le avec `--script` :

<!-- run: script -->
```text
$ node door.js --script bay.door > bay.json; echo "exit $?"
exit 0
```

Le texte entre `{ }` est de l'arithmétique. Elle peut utiliser des nombres, `+ - * /`, des parenthèses et des champs d'un résultat nommé. `lines.model.lines[gx6].pos` signifie : dans la réponse nommée `lines`, sous `model`, l'entrée de `lines` dont l'id est `gx6`, son `pos`. Seuls les champs que le verbe déclare peuvent être lus ; tout autre nom est une erreur qui le dit.

L'arithmétique est en **décimal exact**, pas en virgule flottante. Un ordinateur qui utilise la virgule flottante obtient `12 - 11.176 = 0.8239999999999998`. La porte obtient ceci :

<!-- run: script_move -->
```text
$ grep -o '"change":{"kind":"[^"]*","grid":"[^"]*","through":"[^"]*","lines":[0-9]*,"delta":[0-9.]*' bay.json
"change":{"kind":"block-shift","grid":"gx6","through":"gx16","lines":11,"delta":0.824
```

Un script s'exécute de haut en bas et **s'arrête à la première ligne qui n'est pas ok**. Ici, les deux répondent `ok` :

<!-- run: script_status -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' bay.json
"request":"d-mwhmni28-2277438-2","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwhmntjy-2277438-3","verb":"modeller.try_shift","actor":"human","status":"ok"
```

À exactement 12 m, l'application ne trouve aucun nouveau problème : le nombre de portées de poutres au-delà de la limite reste ce qu'il était.

<!-- run: script_span -->
```text
$ grep -o '"label":"Beam spans over limit","scope":"[^"]*","state":"JUDGED","before":[0-9]*,"after":[0-9]*,"delta":[0-9]*' bay.json
"label":"Beam spans over limit","scope":"228 walked girders, RC (mixed building)","state":"JUDGED","before":91,"after":91,"delta":0
```

Ainsi, le même bâtiment, pour 13 m, est arrêté, et pour 12 m, tient. Un `ok` n'est pas une promesse que le bâtiment est bon : la même [liste de ce qui n'est pas vérifié](#what-is-not-checked) s'applique.

### La grammaire des lignes

| Élément | Règle |
|---|---|
| Une commande | `app.verb key=value key=value`, une par ligne |
| Une valeur avec des espaces | la mettre entre guillemets doubles : `text="a note"` |
| Un résultat nommé | `name = app.verb …` ; les lignes suivantes lisent `name.field` |
| Arithmétique | `{ … }` avec des nombres, `+ - * /`, des parenthèses et des champs de résultat ; décimaux exacts |
| Un commentaire | `--` et le reste de la ligne |
| Unités | jamais écrites sur la ligne ; le verbe dit mètres, heures ou jours |
| Tout le reste | pas une commande : cela revient sous forme de question, pas d'action |

La dernière ligne du tableau est voulue. Un texte qui ne correspond à aucun verbe n'est **jamais deviné** :

<!-- run: question -->
```text
$ node door.js 'please widen the bay'
{"request":"d-mwhmo809-2277927-1","verb":null,"actor":"human","status":"refused","answer":{"question":"I could not read that as a command. A command is app.verb key=value … Which one do you mean? Type help.","verbs":["modeller.lines","modeller.try_shift","viewer.counts","viewer.clashes","viewer.film_path","viewer.schedule_at","viewer.schedule_compare","modeller.widen_bay","modeller.walk","object.describe","object.read","object.history","object.update","object.attach","object.count","object.list","object.sum","object.group","witness.run","witness.last","legacy.status","legacy.query","mis.column","legacy.compare","idempiere.where","mis.pack","legacy.up","legacy.refresh","legacy.witness","legacy.check","legacy.plugin","model.open","model.convert","model.addbay","model.undo","model.save","model.close","erp.find","erp.actions","erp.complete","erp.void","erp.close","erp.reverse","mis.describe","mis.read","mis.list","mis.sum","mis.group","mis.new","mis.update","mis.delete","mis.load","mis.add_window","ninja.exec","ninja.workflow","mis.diff","mis.menu","ninja.rollback","ninja.export","erp.column","erp.compare","erp.pack","erp.legacy_plugin","erp.describe","erp.read","erp.list","erp.sum","erp.group","erp.new"]},"why":"not a command: \"please widen the bay\"","notChecked":[],"ops":[],"next":[],"ms":0}
```

## Lire la réponse

Chaque ligne, de chaque acteur, reçoit la même enveloppe. Lisez ces champs dans l'ordre.

| Champ | Signification |
|---|---|
| `status` | `ok`, `refused`, `claim`, `error` ou `inconclusive`. À lire en premier |
| `why` | la raison, quand le statut n'est pas `ok` |
| `answer` | la réponse propre à l'application, inchangée |
| `notChecked` | ce que la vérification n'a pas couvert. À toujours transmettre |
| `request`, `verb`, `actor` | quelle ligne, quel verbe, qui a demandé |
| `ops` | ce qui a été écrit, pour un verbe qui écrit |
| `next` | réservé ; vide aujourd'hui |
| `ms` | combien de temps cela a pris |

Les cinq statuts, chacun tiré d'une vraie exécution :

**ok.** L'application a répondu et rien n'a été retenu. La première commande de cette page en est une. Même alors, lisez `notChecked`.

**refused.** L'application a donné une réponse qui n'est pas un oui. La demande de 13 m ci-dessus en est une : elle a été essayée, jugée et annulée, et `why` dit pourquoi. Un refus est une réponse, pas un échec. Un texte qui n'est pas une commande est aussi `refused` (la question ci-dessus).

**error.** La ligne elle-même est fausse : une entrée manquante, un verbe inconnu, une valeur d'un mauvais genre. Rien n'a été exécuté.

<!-- run: error -->
```text
$ node door.js 'modeller.lines'
{"request":"d-mwhmo856-2277937-1","verb":"modeller.lines","actor":"human","status":"error","answer":null,"why":"missing input: building","notChecked":[],"ops":[],"next":[],"ms":2}
```

**claim.** La ligne est comprise, mais l'acteur n'a aucune preuve qui l'autorise, donc la porte **la retient et ne l'exécute pas**. C'est la règle de sécurité pour une IA, et elle vient du verbe, pas de l'acteur. Voir [Qu'est-ce qu'une demande retenue](#what-is-a-claim).

<!-- run: claim -->
```text
$ node door.js --actor ai --request ai-1 'object.update building=Duplex kind=Element uu=abc column=Name value=x'
{"request":"ai-1","verb":"object.update","actor":"ai","status":"claim","answer":null,"why":"actor ai has proof \"local-user\", which allows read/trial verbs; object.update is writes. Held as a claim, not run. A person confirms it with: door.js --confirm ai-1","notChecked":[],"ops":[],"next":[],"ms":5}
```

**inconclusive.** L'application n'a pas pu juger, et le dit. Ce n'est jamais transformé en `ok`. Ici, le Viewer n'a aucune règle de conflit pour la paire ARC et ZZZ. Celle-ci demande une copie complète :

<!-- run: inconclusive -->
```text
$ node common/door/door.js 'viewer.clashes building=Duplex discA=ARC discB=ZZZ'
{"request":"d-mwhmo8hh-2277957-1","verb":"viewer.clashes","actor":"human","status":"inconclusive","answer":null,"why":"the Viewer could not answer (exit 1): the Viewer says INCONCLUSIVE: no rule for ARC/ZZZ in clash_rules.json","notChecked":[],"ops":[],"next":[],"ms":24342}
```

### Qu'est-ce qu'une demande retenue {#what-is-a-claim}

Chaque verbe a une **classe de risque** : `read` (ne change rien), `trial` (un changement fait sur une copie jetable, jugé, jamais enregistré), `writes`, `posts` ou `sends`. La classe est écrite une seule fois, dans la liste des verbes, donc aucun acteur ne peut la contourner par de belles paroles.

Chaque acteur a une preuve. Une personne au terminal est de confiance pour toutes les classes. Une **IA** n'est de confiance que pour `read` et `trial` : elle peut regarder et elle peut essayer, mais un verbe `writes`, `posts` ou `sends` venant d'une IA est retenu comme demande, comme l'a été la ligne `object.update` ci-dessus. Un acteur sans aucune preuve, comme un courriel d'un expéditeur inconnu, peut lire et rien d'autre :

<!-- run: claim_email -->
```text
$ node door.js --actor email --request mail-0 'modeller.try_shift building=HospitalGarage line=gx6 move=1.824'
{"request":"mail-0","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-0","notChecked":[],"ops":[],"next":[],"ms":2}
```

Une demande retenue n'est ni exécutée, ni mise en file d'attente, ni perdue : elle est dans le journal, sous son identifiant de requête. La porte ne confirme rien au nom de qui que ce soit.

### Confirmer une demande retenue

Une personne laisse passer une demande retenue **par son identifiant de requête**, de sorte que la ligne exécutée est exactement la ligne proposée. Personne ne la retape. Ici, un courriel demande un essai de déplacement et il est retenu :

<!-- run: confirm_claim -->
```text
$ node door.js --journal claims.jsonl --actor email --request mail-1 'modeller.try_shift building=HospitalGarage line=gx6 move=0.824'
{"request":"mail-1","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-1","notChecked":[],"ops":[],"next":[],"ms":2}
```

`--claims` liste ce qui est retenu :

<!-- run: confirm_list -->
```text
$ node door.js --journal claims.jsonl --claims | grep -o '"actor":"[a-z]*","line":"[^"]*","verb":"[^"]*","harm":"[a-z]*"'
"actor":"email","line":"modeller.try_shift building=HospitalGarage line=gx6 move=0.824","verb":"modeller.try_shift","harm":"trial"
```

`--confirm` exécute la ligne enregistrée, en votre nom, une seule fois :

<!-- run: confirm_run cut=200 -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1
{"request":"mail-1#confirmed","verb":"modeller.try_shift","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[{"tag":"EDIT_REPORT","version":1,"change":{"kind":"bloc…
```

La réponse est la réponse ordinaire, et elle nomme la demande qu'elle a confirmée. Redemander n'exécute rien : la porte répond à partir de son enregistrement.

<!-- run: confirm_again -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1 | grep -o '"confirms":"[^"]*"'
"confirms":"mail-1"
```

Trois règles s'appliquent. Seule une personne au terminal peut confirmer : `--actor ai --confirm …` est refusé et la demande reste retenue. L'application décide encore au moment de confirmer, donc une ligne devenue fausse depuis sa proposition est refusée avec la raison de l'application. Et la connexion d'outils d'une IA n'a aucune commande de confirmation.

**Ce que cela ne prouve pas.** La porte fait confiance à celui qui est au terminal local. Une IA autorisée à exécuter des commandes shell sur votre machine pourrait taper elle-même `--confirm`, comme elle pourrait taper une ligne en votre nom. Si cela compte, gardez l'accès d'une IA limité à sa connexion d'outils.

## Utiliser la porte depuis votre propre script

Tout ce qui précède est `door.js`, le même fichier que celui qu'utilise la connexion d'IA. Depuis votre propre programme, appelez-le comme une commande et lisez son JSON : le code de sortie (`0`, `3`, `1`, `2`) dit s'il faut lire une réponse ou un problème, et `status` dit lequel. `--actor human` est la valeur par défaut ; `--actor ai` fait traiter la ligne par la porte comme celle d'une IA.

## Demander ce qu'est une chose : `object.describe`

Un verbe peut aussi demander au modèle lui-même ce qu'il contient. `object.describe` est de la **réflexion** : il lit le dictionnaire propre au modèle et dit quelles propriétés a un type d'objet, quels onglets enfants, et quelles méthodes génériques sont permises pour lui. Il ne lit que des lignes du dictionnaire ; aucun élément n'est ouvert. Il demande une copie complète, et un bâtiment dont le modèle porte son propre dictionnaire (le Duplex en a un).

<!-- run: describe cut=520 -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element'
{"request":"d-mwhmp6f0-2278556-1","verb":"object.describe","actor":"human","status":"ok","answer":{"kind":"Element","table":"elements_meta","uu":"3027c2ed-8cb6-5ccb-ae8c-fd7df2eca264","key":"elements_meta_uu","highVolume":true,"properties":[{"name":"guid","label":"GUID","type":"string","mandatory":true,"updateable":false,"key":false,"parent":false,"length":255,"displayed":true,"seq":10,"fieldReadOnly":true,"allowCopy":false},{"name":"ifc_class","label":"IFC Class","type":"list","mandatory":false,"updateable":true,"…
```

Quelles méthodes un `Element` peut-il utiliser ?

<!-- run: describe_methods -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element' | grep -o '"methods":\[[^]]*\]'
"methods":["read","update","attach","history"]
```

Un type inconnu est une erreur qui liste les types que le modèle possède, si bien qu'une mauvaise supposition enseigne le bon nom.

## Compter des choses : `object.count`

`object.count` répond à « combien » : combien d'enregistrements d'un type le modèle contient. Le Duplex nomme ses pièces du type `Room`. Il demande une copie complète.

<!-- run: count_rooms -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room'
{"request":"d-mwhmp7mf-2278599-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[],"count":5,"population":5,"verdict":"OK","summary":"5 Room"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":594}
```

Ajoutez `column=value` pour restreindre le compte. La colonne doit être une propriété du type (`object.describe` les liste), et la réponse garde la **population**, le nombre avant restriction :

<!-- run: count_storey -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room storey="Level 1"'
{"request":"d-mwhmp87z-2278619-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[{"column":"storey","value":"Level 1"}],"count":2,"population":5,"verdict":"OK","summary":"2 Room where storey = Level 1 (of 5)"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":569}
```

Une colonne que le type n'a pas est une erreur qui la nomme et liste les vraies. Elle n'est jamais lue comme « aucune correspondance » :

<!-- run: count_badcol cut=330 -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room floor=1'
{"request":"d-mwhmp8u8-2278641-1","verb":"object.count","actor":"human","status":"error","answer":null,"why":"the object engine could not answer (exit 1): kind Room has no property \"floor\" (its properties: guid, type, name, parent_guid, object_type, predefined_type, center_x, center_y, center_z, size_x, size_y, size_z, room_gu…
```

Un modèle sans aucune pièce ne répond pas `0`. Il répond `inconclusive`, parce que rien n'a été compté. Un zéro fiable est un compte restreint à l'intérieur d'une population qui n'est pas vide.

## Ce que le walker poserait : `modeller.walk`

Le Modeller a un *walker* qui pose les équipements d'une discipline (sprinklers, luminaires, prises) selon des règles mesurées sur de vrais bâtiments. `modeller.walk` en est un **essai à blanc** : il dit ce que le walker poserait et ne change rien. Le fichier du modèle est identique, octet pour octet, ensuite, et la réponse le dit. Il demande une copie complète. La réponse complète est longue, donc ceci montre ses principaux chiffres :

<!-- run: walk_fp -->
```text
$ node common/door/door.js 'modeller.walk building=Duplex discipline=FP' | grep -o '"rules":"[^"]*"\|"count":[0-9]*,"placed":[0-9]*,"provisional":[0-9]*\|"byClass":{[^}]*}\|"modelUnchanged":[a-z]*'
"rules":"duplex_rules.db"
"count":46,"placed":0,"provisional":46
"byClass":{"IfcFireSuppressionTerminal":45,"IfcAlarm":1}
"modelUnchanged":true
```

`count` est tout ce que le parcours poserait. `provisional` désigne les positions que le walker lui-même marque comme non définitives, par exemple un équipement sans plafond trouvé au-dessus. `rules` est le jeu de règles que la classe du bâtiment utilise : une maison suit les règles résidentielles. Un parcours qui ne pose rien répond `inconclusive` avec la raison du walker.

## Garder un Modeller ouvert entre les lignes : `model.open`, `model.convert`, `model.addbay`, `model.undo`, `model.save`, `model.close`

Ces lignes pilotent UNE seule page Modeller gardée ouverte en arrière-plan (sans interface, sur le processeur, sans carte graphique), si bien que chaque ligne agit sur ce que la ligne précédente a laissé. `model.open sheets=<folder or a.dxf,b.dxf> type="Farming Shed"` ouvre les feuilles 2D, `model.convert` produit le modèle 3D (le Convert propre à la page), `model.addbay end=high|low` ajoute une travée à cette extrémité d'un bâtiment à travées répétées, `model.undo` annule le dernier changement, et `model.close` arrête la page. La page fait tout le travail avec ses propres fonctions ; la ligne appuie sur ce qu'une personne appuierait et affiche la réponse propre à la page. Le modèle vit dans cette page jusqu'à ce que vous l'enregistriez : `model.save` l'écrit dans un fichier `.db` de ce dossier, et `model.close` enregistre d'abord quand le modèle a changé et qu'un fichier d'enregistrement est connu. Ces lignes demandent une copie complète de `bim-ootb`, et le dossier d'où vous les lancez contient la session (un fichier `.model_session.json` ; le port n'écoute que sur cette machine et chaque requête porte un jeton à usage unique).

Règles que vous rencontrerez : une ligne avant `model.open` est refusée (« no session: model.open first »), et il en va de même pour un second `model.open`, un second `model.convert`, et `model.addbay` avant Convert. Une travée n'est proposée que lorsque le type de bâtiment en déclare une (Farming Shed le fait) ; sans `type=`, la travée est refusée, avec le message que le type ne déclare aucune règle. Les feuilles doivent porter leurs marquages : de simples feuilles d'un dessin ne passent pas le contrôle d'entrée. Chaque ligne prend quelques secondes (ici : ouverture environ 6 s, conversion 3 s, une travée 3 s ; sur un plus grand jeu de feuilles, la conversion a pris jusqu'à 15 s). **Enregistrement :** nommez le fichier une seule fois, sur `model.open … file=shed.db` ou sur le premier `model.save file=shed.db`. Un enregistrement lance le Save propre à la page : d'abord la vérification des conflits (un conflit RED bloque l'enregistrement, comme à l'écran, et rien n'est écrit), puis le modèle est écrit en `.db` natif. Sur ce hangar, un enregistrement prend environ une demi-seconde, et la réponse donne le temps de chaque étape. `model.close` avec des changements non enregistrés et sans fichier est refusé et la session reste ouverte : enregistrez, ou utilisez `model.close discard=Y` pour abandonner les changements volontairement. Un enregistrement avant que quoi que ce soit ait été fait est refusé, dans les mots de la page.

Le bloc ci-dessous copie un dossier de 9 feuilles marquées d'un hangar, nommé par `SHED_SHEETS`, dans `shed/`, et exécute les lignes l'une après l'autre ; réglez `SHED_SHEETS` sur votre propre dossier de feuilles `.dxf` marquées.

<!-- run: model_ses cut=200 -->
```text
$ rm -rf shed shed.db; mkdir shed; cp "$SHED_SHEETS"/*.dxf shed/; D='node common/door/door.js --list'; eval "$D 'model.convert'" | grep -E '^error:'; eval "$D 'model.open sheets=shed type=\"Farming Shed\" file=shed.db'" | grep -E '^summary:'; eval "$D model.save" | grep -E '^error:'; eval "$D model.convert" | grep -E '^summary:'; eval "$D model.save" | grep -E '^(file|bytes|elements):'; eval "$D 'model.addbay end=high'" | grep -E '^(copies_by_class|summary):'; eval "$D model.undo" | grep -E '^summary:'; eval "$D model.close" | grep -E '^closed:'; ls -l shed.db | awk '{print "shed.db bytes: " $5}'; eval "$D model.undo" | grep -E '^error:'; rm -rf shed shed.db .model_session.log
error: no session in this folder: model.open first
error: nothing is open: model.open first
closed: true
error: no session in this folder: model.open first
```

`model.addbay end=low` ajoute la travée à l'autre extrémité (une autre charnière, les mêmes 29 copies). Non vérifié par ces lignes : le coût par rapport à un décompte indépendant (un test séparé s'en charge), et plus d'une session dans un même dossier.

## Listes, sommes et regroupements : `erp.list`, `erp.sum`, `erp.group`

`count` répond à « combien ». Trois autres verbes en lecture seule répondent à « lesquels », « combien au total » et « combien de chaque ». Ils acceptent tout type du dictionnaire de l'ERP (et les trois mêmes existent pour le modèle d'un bâtiment sous les noms `object.list`, `object.sum`, `object.group`). Ils demandent une copie complète.

`erp.list` montre des lignes. Chaque colonne, filtre et tri est vérifié par rapport au dictionnaire, donc un mauvais nom est une erreur qui liste les vrais. Ajoutez `column=value` pour restreindre la liste. La liste montre au plus 50 lignes sauf si `limit` dit autre chose (jusqu'à 1000), et la réponse porte toujours le **total**, de sorte qu'une liste courte n'est jamais prise pour le tout. Parcourez une longue liste page par page avec `offset` :

<!-- run: list_orders -->
```text
$ node common/door/door.js --list 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo  DocStatus  GrandTotal
80001       CO         100.7
80001       CO         100.7
800002      CO         2160
shown 3 of 14
```

`erp.sum` additionne exactement une colonne numérique. Les décimaux sont additionnés comme décimaux, jamais en virgule flottante, si bien que l'argent ne dérive pas. `erp.group` compte les enregistrements pour chaque valeur d'une colonne, les plus fréquentes d'abord :

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

Un type sans aucun enregistrement ne répond pas `0` ni une liste vide. Il répond `inconclusive`, parce que rien n'a été jugé.

## Créer un enregistrement : `erp.new`

`erp.new` crée un enregistrement comme le fait la fenêtre propre à l'ERP. Vous nommez le type et les colonnes que vous connaissez ; le moteur remplit le reste comme le fait la fenêtre (valeurs par défaut, les choix qu'un tiers apporte avec lui, le Document No (numéro de document) issu de la séquence). Une colonne que le dictionnaire n'a pas est refusée et la réponse liste les vraies. Une colonne obligatoire encore vide après cela est refusée par son nom, et rien n'est écrit. La réponse commence par `number` : le Document No, que vous utilisez ensuite.

Un document de vente ou d'achat demande `issotrx=Y` ou `N`. Un tiers ou un produit peut être donné par son nom ; un nom qui ne correspond à aucun enregistrement, ou à plusieurs, est refusé. Une ligne nomme son document par son numéro :

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

La commande reste un brouillon tant que personne ne la complète. Comme la ligne a reçu le numéro de la commande, les totaux de la commande suivent sans seconde étape : `totallines` et `grandtotal` dans l'enregistrement ci-dessous sont le montant de la ligne (6). La liste des lignes propres à la commande n'est pas remplie par `erp.read`.

<!-- run: new_read -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js --list 'erp.read kind=Order number=50000'
kind: Order
uu: 1500004
record: {"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:44","createdby":101,"updated":"2026-11-15 17:25:44","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","dateprinted":null,"dateacct":"2026-11-15 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":6,"grandtotal":6,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c1be6519-1439-4618-a5b3-7c7af36acfe9","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null}
children: [{"kind":"Sales Order Line","rows":[{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-15 17:25:52","createdby":101,"updated":"2026-11-15 17:25:52","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-15 00:00:00","datepromised":"2026-11-15 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"337b125f-adeb-4412-bbb9-5584c995f8fa","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null}]},{"kind":"Order Tax","rows":[]},{"kind":"Order Payment Schedule","rows":[]},{"kind":"POS Payment","rows":[]}]
```

`erp.new` est un verbe `writes`. Une personne au terminal l'exécute. Le `erp.new` d'une IA est retenu comme demande et rien n'est écrit tant qu'une personne ne le confirme (voir « Qu'est-ce qu'une demande retenue »). Ces blocs utilisent un journal d'opérations (op-log) jetable (`/tmp/fast_guide_new.ops`, vidé d'abord), donc les exécuter ne touche pas à vos propres données.

## Travailler avec n'importe quelle table : les verbes `mis.*`

**MIS est la base. L'ERP, c'est MIS plus la vie d'un document.** Lister, lire, créer, modifier, supprimer et charger des enregistrements se fait de la même façon sur chaque table du dictionnaire, un client, un produit, une table que vous avez créée vous-même. Ces verbes s'appellent `mis.*`. Ce que seul un document possède (compléter, annuler, clore, extourner) reste `erp.*`. Les anciens noms `erp.list`, `erp.read`, `erp.describe`, `erp.sum`, `erp.group` et `erp.new` fonctionnent toujours : chacun est un ancien nom de son verbe `mis.*` et donne la même réponse, donc un script que vous avez écrit plus tôt ne change pas.

Chaque verbe `mis.*` qui écrit fait ce que fait la fenêtre propre à l'ERP. Il ne modifie pas la base de données en dessous. Les valeurs par défaut et les callouts (calculs à la saisie) s'exécutent, les vérifications s'exécutent, un refus dit pourquoi, et rien n'est écrit dès que quelque chose est refusé.

**Que manque-t-il encore ?** `mis.new … dry=Y` exécute tout sauf l'enregistrement et n'écrit rien. Il répond quelles colonnes obligatoires sont encore vides après les valeurs par défaut, pour que vous sachiez quoi donner :

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

**Créer, modifier, lire.** Une colonne qui contient un autre enregistrement peut être donnée par son nom. `mis.list … names=Y` montre ces colonnes sous forme de noms, comme le fait la grille de la fenêtre :

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

`mis.update` n'envoie que les colonnes que vous donnez ; donner les valeurs qu'un enregistrement a déjà ne change rien et la réponse dit `noop`. Une colonne que la fenêtre ne laisserait pas une personne modifier (un champ en lecture seule, ou toute colonne d'un document complété) est refusée, et la réponse nomme la règle. Videz une colonne avec la valeur `<null>`.

**Une colonne qui pointe vers un autre enregistrement** (un tiers, un produit, un entrepôt) doit nommer un enregistrement qui existe et que votre entreprise peut utiliser. `mis.new` vérifie chacune de ces colonnes et `mis.update` celles que vous changez, et une colonne erronée est refusée avec les propres mots de l'ERP legacy (l'iDempiere d'origine), par exemple `Cannot save record in C_Order: Foreign ID 999999 not found in C_BPartner_ID`, ou `Cross tenant ID … not allowed in …` pour un enregistrement d'une autre entreprise. Une valeur hors de la règle de validation d'une liste de choix (la liste qu'une fenêtre proposerait) n'est PAS refusée : l'ERP legacy l'enregistre aussi, puisque la règle ne décide que de ce que la fenêtre propose.

**Supprimer.** `mis.delete` est le Delete de la fenêtre. Il refuse ce que la fenêtre refuse, avec les mots du moteur, et n'écrit rien. Le tiers standard est utilisé par d'autres enregistrements :

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

**Charger plusieurs enregistrements depuis un CSV.** `mis.load` lit un `.csv` (la première ligne contient les noms de colonnes, un enregistrement par ligne) et lui applique le processus Migrate Excel Data (migration de données Excel) propre à l'ERP. Ce processus est tout ou rien, donc `mis.load` commence par **vérifier** (`dry=Y`, la valeur par défaut) et n'écrit rien : il compte les lignes et nomme chaque ligne fautive. À côté de votre fichier, il écrit `….rejected.csv` (les lignes fautives et pourquoi) et `….ok.csv` (les bonnes) :

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

Charger l'original avec `dry=N` est refusé tant qu'une ligne est fautive. Corrigez les lignes fautives, ou chargez les bonnes, ce qui est un chargement séparé, tout ou rien :

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

Un `mis.new`, `mis.update`, `mis.delete` ou `mis.load` d'une IA est retenu comme demande, comme `erp.new` : rien n'est écrit tant qu'une personne ne le confirme. La mise à jour en masse d'enregistrements existants n'est pas proposée ; utilisez `mis.update` pour chacun, afin que les vérifications de la fenêtre s'exécutent.

### Voir et modifier des enregistrements comme un rôle

Chaque verbe `mis.*` accepte `role=`, l'id d'un rôle de l'ERP. **Sans rôle, rien n'est filtré :** vous voyez chaque enregistrement de chaque client. Avec un rôle, vous obtenez ce que ce rôle obtient dans la fenêtre qui lui est accordée : les enregistrements de son propre client et de ses organisations, et seulement les enregistrements et colonnes que ses lignes d'accès permettent. Les totaux ne comptent que ces enregistrements. Le rôle est indiqué sur la ligne. Ce n'est pas une connexion.

<!-- run: mis_role -->
```text
$ for r in '' ' role=103' ' role=12000'; do BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list "mis.sum kind=C_Order column=GrandTotal$r" | grep -E '^(n|sum):' | tr '\n' ' '; echo; done
n: 43 sum: 74936.76 
n: 8 sum: 9914.07 
n: 27 sum: 55108.62
```

Un enregistrement hors des enregistrements du rôle reçoit exactement la même réponse qu'un enregistrement qui n'existe pas. Une colonne que le rôle peut seulement lire ne peut pas être modifiée. Un type pour lequel le rôle n'a aucune fenêtre est refusé ; le rôle 103 n'a aucune fenêtre qui montre Tax (taxe) :

<!-- run: mis_role_refuse cut=200 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_Tax role=103'
refused: true
reason: role 103 (GardenWorld User) is not granted a window that shows Tax (AD_Window_Access)
```

Cinq règles ne sont pas encore jugées, et un rôle qui en utilise une est refusé au lieu d'être à moitié vérifié : un verrou personnel sur un enregistrement, une règle de validation de table, un rôle dont les organisations viennent de l'utilisateur, un rôle avec une organisation de synthèse dans un arbre d'organisations, et l'accès aux enregistrements des « entités dépendantes ». `mis.load` ne prend aucun rôle.

## Créer une table à vous : `mis.add_window`

Une table que vous gardez dans un tableur peut devenir une vraie fenêtre : une table, un formulaire, une entrée de menu et un accès par rôle, sans code écrit pour elle. Décrivez ses colonnes dans un petit `.csv`, une ligne par colonne. Seul `Column` est obligatoire. La clé, le client et l'organisation, l'indicateur actif et les colonnes d'audit sont ajoutés pour vous :

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

Une ligne crée la fenêtre (la feuille est réécrite ici pour que la ligne puisse être exécutée seule, depuis le dossier qui contient `common/`). La table porte le nom du fichier. `dry=Y` vérifie la feuille et n'écrit rien. Une feuille fautive est refusée avec chaque faute et sa ligne, et rien n'est écrit :

<!-- run: win_add cut=200 -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; rm -f /tmp/fast_guide_win.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list 'mis.add_window file=AST_Asset.csv' | grep -E '^(table|window|columns|lists|ops):'
table: AST_Asset
window: {"id":7100001,"name":"AST Asset"}
columns: ["Name","PurchaseDate","Cost","Condition","IsInsured"]
lists: [{"column":"Condition","values":["GOOD","FAIR","POOR"]}]
ops: 47
```

Le nouveau type fonctionne d'emblée avec chaque verbe `mis.*`, et avec `mis.js`. Une colonne obligatoire est demandée, une valeur par défaut est remplie, et une valeur hors de la liste de la feuille est refusée :

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

Les types sont String, Quantity, Amount, YesNo, Date, DateTime, Text et List. Une colonne dont le nom se termine par `_ID` est une recherche vers cette table, et une colonne qui commence par `Is` est un oui/non. Une table de détail sous un maître vient avec un classeur : c'est la section suivante.

## Un classeur entier en une ligne : `ninja.exec`

Une table issue d'un `.csv` est le petit cas. Un **classeur Ninja** contient de nombreuses tables à la fois, dit quelle table se trouve sous quelle autre, et peut porter leurs premières lignes. Une seule ligne fait tout cela.

Le classeur est un fichier de tableur ordinaire (`.xlsx` ou `.xls`) :

| Feuille | Ce qu'elle contient |
|---|---|
| `1_RO_ModelHeader` | le nom de l'ensemble, dans la première cellule sous `Name` |
| `2_RO_ModelMaker` | une ligne par table : `Master` (la table sous laquelle elle se trouve, ou vide), `Name` (la table), `ColumnSet` (ses colonnes, séparées par des virgules) |
| une feuille nommée exactement comme une table | des lignes à charger : la ligne 1 contient les noms de colonnes |

Dans `ColumnSet`, un nom simple est du texte. Un préfixe donne un autre type : `D#` une date, `A#` un montant, `Q#` une quantité, `T#` un texte long, `Y#` un oui/non, et `L#Name=a/b/c` une liste de valeurs fixes. Une table dont le `Master` est une autre table du classeur devient un onglet de la fenêtre de cette table.

Un classeur d'entraînement est livré avec la porte : `common/door/samples/Ninja_Practice.xlsx` (un patient, les visites du patient, les médicaments d'une visite, une salle, et une orientation (referral) qui se trouve sous Business Partner (tiers)). `dry=Y` le lit, dit ce qu'il créerait et n'écrit rien :

<!-- run: nx_dry cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_ninja.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list 'ninja.exec file=Ninja_Practice.xlsx dry=Y' | grep -E '^(bundle|tables|dataSheets|skipped|dry):'
bundle: Practice
tables: [{"table":"PR_Patient","master":null,"columns":4,"lists":["BloodGroup"]},{"table":"PR_Visit","master":"PR_Patient","columns":5,"lists":[]},{"table":"PR_Medicine","master":"PR_Visit","columns":3,"lists":[]},{"table":"PR_Roo…
dataSheets: [{"sheet":"PR_Patient","rows":3},{"sheet":"PR_Room","rows":2}]
skipped: []
dry: true
```

Sans `dry=Y`, la même ligne le crée : les fenêtres, les onglets, la liste, les entrées de menu, l'accès par rôle, puis les lignes des feuilles de données. Exécutez-la une seconde fois et elle n'écrit rien :

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

Chaque table fonctionne d'emblée avec les verbes `mis.*`. Un enregistrement sous un maître nomme l'id du maître (`mis.read` du maître montre alors ce qui se trouve dessous), et une valeur hors d'une liste est refusée :

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

**Une table qui existe déjà.** Quand le classeur nomme une table que le système possède déjà, rien n'est fait deux fois. Si la feuille donne un `Master` à cette table, la table est réutilisée : les colonnes de la feuille lui sont ajoutées et elle devient un onglet sous ce maître. Si la feuille ne lui donne aucun `Master`, la ligne est laissée telle quelle. La réponse liste les deux (`reused`, `leftAlone`). C'est ce que fait le Ninja d'iDempiere. Une table réutilisée garde ses propres règles, donc un enregistrement de celle-ci doit encore remplir les colonnes obligatoires propres à cette table.

Une table affichée dans deux fenêtres est écrite par sa propre fenêtre, sauf si vous nommez l'autre avec `window=` (son nom ou son id). Un refus pour une colonne qui appartient à l'autre fenêtre vous dit quelle fenêtre nommer.

**Un onglet sur une fenêtre qui existe déjà.** Un `Master` n'a pas à être une table du classeur. Nommez une table que le système possède déjà et votre table devient un onglet de la fenêtre de CETTE table, après les onglets déjà présents, sans fenêtre ni entrée de menu propre. Le classeur d'entraînement le fait avec une seule ligne : `PR_Referral`, dont le `Master` est `C_BPartner`, de sorte qu'une orientation est un onglet de la fenêtre Business Partner. C'est aussi la règle du Ninja d'iDempiere :

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

Ce qu'il refuse, sans rien écrire : un second classeur qui nomme des tables qu'un autre classeur a créées, un classeur dont toutes les tables existent déjà sans maître, un `Master` qui n'est ni dans le classeur ni une table ayant une fenêtre ici, et un `ColumnSet` avec un préfixe qu'il ne connaît pas. Une feuille dont le nom n'est pas exactement celui d'une table est ignorée et nommée dans la réponse. Le `notChecked` de la réponse liste ce qui n'a pas été jugé.

### Une table depuis un CSV simple : `ninja.exec file=<Table>.csv`

Un `.csv` au lieu d'un classeur est UNE table dont l'en-tête est le modèle, lu comme l'ancien Ninja en lit un. La table porte le nom du fichier (`table=` en nomme une autre). Chaque cellule d'en-tête tire son type de son nom, par la première règle qui convient : elle contient `Date` → une date ; `Qty` → une quantité ; `Amount` → un montant ; elle commence par `Is` ou `In` → oui/non (donc `Income` est aussi oui/non, comme dans l'ancien Ninja) ; elle se termine par `_ID` → une recherche, dont les cellules sont le Name de l'enregistrement ; elle contient `=` et `/` (`Plan=Basic/Gold`) → une liste ; tout le reste → du texte. Une cellule comme `C_BPartner_ID>Value` ou `Code=X` crée la colonne située avant le `>` ou le `=`. Les lignes sont les enregistrements. La table et ses lignes sont créées ensemble : si une ligne ne se charge pas, rien n'est créé et la réponse nomme la ligne. Une ligne dont les deux premières colonnes existent déjà est ignorée, donc le même fichier relancé n'écrit rien, et un fichier avec plus de lignes n'ajoute que les nouvelles. Sur une table déjà présente, le fichier ne fait qu'ajouter des lignes, et un en-tête qui n'est pas une colonne de cette table est refusé.

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

### Donner à une table les colonnes de document : `ninja.workflow`

Une fonction peut être activée plus tard, pour une seule table, sans toucher au classeur. `ninja.workflow` donne à une table les cinq colonnes de document (`DocStatus`, `DocAction`, `Processed`, `DocumentNo`, `IsApproved`) avec leurs listes et valeurs par défaut, les affiche sur ses onglets, et remplit les enregistrements déjà présents. Il regarde d'abord et n'ajoute que ce qui manque, donc une seconde exécution n'écrit rien :

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

Il ne dit pas encore ce que *Complete* fait sur une telle table : le `notMade` de la réponse nomme ce qui manque encore, et `erp.complete` est refusé en termes clairs d'ici là. Une table livrée avec le système est refusée.

### Annuler un lot, et le réécrire sous forme de classeur : `ninja.rollback`, `ninja.export`

Deux lignes bouclent la boucle autour d'un classeur. `ninja.rollback bundle=<name>` désactive tout ce qu'un classeur a créé (ses fenêtres, onglets, champs, colonnes, tables et entrées de menu, et le nœud de menu propre au lot) en un seul groupe du journal. Comme dans l'ancien Ninja, une table qui contient des enregistrements le bloque, et il nomme la table et son nombre d'enregistrements ; `dry=Y` dit ce qui serait désactivé. Une table livrée avec le système se conserve et ne perd que ce que le lot lui a ajouté (un onglet sur Business Partner disparaît, Business Partner reste). Exécuté deux fois, le second passage n'écrit rien ; `ninja.exec` sur le même classeur ensuite ramène le lot. `ninja.export` réécrit un lot, une fenêtre ou une table sous forme de classeur que `ninja.exec` lit : tables, liens `Master`, colonnes avec leurs types et valeurs de chaque liste. Modifiez la feuille et relancez-la, ou emportez le modèle sur une autre machine sous forme de fichier. Il n'écrit que le modèle, jamais des lignes ; un fichier qui existe n'est jamais écrasé ; un sélecteur (`bundle=`, `window=` ou `table=`) est obligatoire.

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

Non repris par l'export : les règles de validation et les callouts (le stager ne les a jamais écrits dans le modèle). Un rollback désactive des lignes, il ne les supprime pas, donc le journal garde son historique.

## Les enregistrements sous un enregistrement, et une feuille contre la table : `master=`, `mis.diff`

`master=Table/record` sur `mis.list`, `mis.sum` ou `mis.group` ne garde que les lignes sous cet enregistrement, les lignes qu'un onglet situé dessous affiche : `mis.list kind=PR_Visit master=PR_Patient/Aminah` donne les visites d'Aminah. L'enregistrement après la barre oblique est un id, ou un Document No, un Name ou une Value, lus comme `mis.update number=` les lit. La réponse est la même que celle du simple filtre `PR_Patient_ID=1`. Une table qui n'est pas un onglet sous le maître est refusée avec la raison, de même qu'un enregistrement qui n'existe pas ou un nom que deux enregistrements partagent (donnez alors l'id). Un enregistrement sans rien dessous donne un vrai zéro, pas une question vide.

`mis.diff kind=<table> file=<sheet.csv>` compare une feuille avec la table avant que vous ne la chargiez, et n'écrit rien. Chaque ligne de la feuille est appariée par son Document No, sinon son Name, sinon sa Value (`key=` nomme une autre colonne), et la réponse les trie : `new` (aucun enregistrement n'a cette clé), `changed` (une colonne diffère ; la valeur stockée et celle de la feuille sont toutes deux montrées), `same`, et `missing` (enregistrements actifs que la feuille ne mentionne pas). Une clé répétée dans la feuille, une clé qui correspond à plusieurs enregistrements et une ligne sans clé sont nommées à part et non comparées. Un nombre est égal en tant que nombre (`1200.50` et `1200.5`), une date est égale à la date stockée, et une cellule de recherche est comparée par le nom de l'enregistrement vers lequel pointe l'id stocké. Savoir si `mis.load` trouverait ce nom n'est pas demandé ici : `mis.load dry=Y` s'en charge.

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

Non comparé par `mis.diff` : une colonne de la table que la feuille ne nomme pas. La clé est une seule colonne. Un maître situé deux niveaux plus haut (le patient d'un médicament) est refusé : ce n'est pas le parent d'onglet du médicament.

### Un fichier de lignes MIS, essayé d'abord : `--script … --dry`

Une mise en place que vous voulez répéter (un classeur, ses premiers enregistrements, une vérification) est un fichier de lignes exécuté avec `--script`, comme dans [Un script](#a-script-several-lines-a-named-result) : il s'arrête à la première ligne qui n'est pas ok, et les lignes suivantes ne sont pas exécutées. Ajoutez `--dry` pour essayer d'abord le fichier entier. Le fichier s'exécute alors sur une copie jetable de votre journal d'opérations (`BIM_OBJECT_OPLOG` doit le nommer) et des fichiers de ce dossier, de sorte qu'une ligne ultérieure voit ce qu'une ligne antérieure a fait, exactement comme dans l'exécution réelle, et obtient la réponse de l'exécution réelle. À la fin, la copie est supprimée : votre journal d'opérations, vos fichiers et le journal sont comme avant. Les fichiers des sous-dossiers ne sont pas copiés. Une ligne qui agit hors du journal d'opérations (une session Modeller, un serveur legacy, un pack) ne peut pas être retenue, donc dans un essai à blanc elle est refusée et le fichier s'arrête là.

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

## Aide-mémoire : s'entraîner aux lignes MIS

Tout ici est un entraînement sur **votre propre copie** : la première ligne nomme un fichier qui garde ce que vous faites, et rien n'atteint les livres d'une vraie entreprise. Supprimez ce fichier pour recommencer de zéro. Lancez les lignes depuis le dossier qui contient `common/` (une copie complète de `bim-ootb`).

| Étape | Tapez ceci | Ce que vous obtenez |
|---|---|---|
| Mise en place | `export BIM_OBJECT_OPLOG=~/practice.ops` | chaque ligne ci-dessous garde désormais son travail dans ce fichier |
| Recommencer | `rm -f ~/practice.ops` | de nouveau un entraînement vide |
| Écrire moins | `alias d='node common/door/door.js --list'` | une ligne devient alors `d '<verb> <inputs>'` |
| Demander ce qui existe | `d 'help all'` | chaque verbe avec ses entrées |
| Créer cinq tables | `cp common/door/samples/Ninja_Practice.xlsx . ; d 'ninja.exec file=Ninja_Practice.xlsx'` | des patients, des visites, des médicaments, des salles et des orientations, avec 3 patients et 2 salles chargés |
| Essayer avant de créer | `d 'ninja.exec file=Ninja_Practice.xlsx dry=Y'` | ce qu'il créerait ; rien n'est écrit |
| Créer une table | `d 'mis.add_window file=AST_Asset.csv'` | une fenêtre à partir d'un `.csv` de ses colonnes (section ci-dessus) |
| Lister | `d 'mis.list kind=PR_Patient'` | les lignes |
| Lister quelques colonnes | `d 'mis.list kind=PR_Visit columns=Name,Fee'` | seulement ces colonnes |
| Ce qu'elle peut contenir | `d 'mis.describe kind=PR_Patient'` | ses colonnes, types et listes |
| Ajouter | `d 'mis.new kind=PR_Patient Name=Devi BloodGroup=O'` | un nouvel enregistrement et son id |
| Ajouter sous un maître | `d 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'` | une visite du patient 1 |
| Ajouter un niveau plus loin | `d 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'` | un médicament de la visite 1 |
| Lire un enregistrement avec ce qui se trouve dessous | `d 'mis.read kind=PR_Patient id=1'` | le patient et les visites |
| Modifier | `d 'mis.update kind=PR_Patient id=1 BloodGroup=AB'` | l'enregistrement modifié |
| Voir un refus | `d 'mis.update kind=PR_Patient id=1 BloodGroup=Z'` | refusé : `Z` n'est pas dans la liste |
| Supprimer | `d 'mis.delete kind=PR_Room id=2'` | l'enregistrement a disparu |
| Additionner | `d 'mis.sum kind=PR_Visit column=Fee'` | le total |
| Compter selon une colonne | `d 'mis.group kind=PR_Patient by=BloodGroup'` | un compte par valeur |
| Charger plusieurs lignes | `d 'mis.load kind=PR_Room file=rooms.csv'` | un aperçu ; ajoutez `dry=N` pour charger |
| Travailler sur un écran | `node common/door/mis.js kind=PR_Patient` | une liste dans laquelle on se déplace avec les touches ; `+` ajoute, Entrée modifie |
| Comme un autre rôle | ajoutez `role=102` à une ligne | ce que ce rôle peut voir et faire |
| Ajouter sous une table du système | `d 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'` | une orientation chez le tiers 112 (un onglet de la fenêtre Business Partner) |
| Donner à une table les colonnes de document | `d 'ninja.workflow table=PR_Visit'` | un statut sur chaque visite (`DR`), anciennes et nouvelles |
| Annuler le lot d'un classeur | `d 'ninja.rollback bundle=Practice'` | tout ce qu'il a créé est désactivé (bloqué tant qu'une table contient des enregistrements) ; `dry=Y` d'abord |
| Réécrire un lot sous forme de classeur | `d 'ninja.export bundle=Practice file=Practice_out.xlsx'` | le modèle, à modifier et relancer |
| Sous un enregistrement | `d 'mis.list kind=PR_Visit master=PR_Patient/1'` | uniquement les visites du patient 1 ; aussi sur `mis.sum` et `mis.group` |
| Comparer une feuille avant de charger | `d 'mis.diff kind=PR_Patient file=patients.csv'` | lignes nouvelles, modifiées, identiques et manquantes ; rien n'est écrit |
| Garder un Modeller ouvert | `d 'model.open sheets=shed type="Farming Shed" file=shed.db'` puis `d model.convert`, `d 'model.addbay end=high'`, `d model.undo`, `d model.close` | les feuilles 2D rendues en 3D, une travée ajoutée puis retirée ; chaque ligne prend quelques secondes ; la fermeture enregistre dans shed.db |
| Enregistrer le modèle maintenant | `d model.save` (ou `d 'model.save file=shed.db'` la première fois) | la vérification des conflits, puis shed.db écrit ; refusé tant qu'un conflit RED subsiste |
| Fermer sans enregistrer | `d 'model.close discard=Y'` | les changements abandonnés volontairement (une fermeture simple est refusée quand il n'y a pas de fichier d'enregistrement) |
| Essayer d'abord un fichier entier | `node common/door/door.js --list --script setup.door --dry` | la vraie réponse de chaque ligne ; rien n'est conservé (demande `BIM_OBJECT_OPLOG`) |
| Une table depuis un CSV | `d 'ninja.exec file=CL_Client.csv'` | la table à partir de l'en-tête, ses lignes chargées ; relancé, seules les nouvelles lignes se chargent |
| Le menu à l'écran | `d menu` (ou `d 'menu role=102'`) | le menu de l'ERP ; Entrée ouvre la liste d'une fenêtre, Échap revient en arrière, `/` cherche |
| Trouver une entrée de menu | `d 'mis.menu role=102 find=partner'` | les entrées dont le nom contient « partner », avec leurs dossiers |
| Travailler dans une autre fenêtre | ajoutez `window=<name or id>` à `mis.new`, `mis.update` ou `mis.delete` | les champs de l'onglet de cette fenêtre, pour une table affichée dans deux fenêtres |

**Vitesse.** Après un gros classeur, la porte garde une image de ce que le journal d'opérations a créé, si bien qu'une ligne ultérieure n'applique pas de nouveau chaque opération ; cette image n'est utilisée que tant que votre fichier de journal d'opérations commence exactement comme avant, et `ERP_OPIMAGE=off` la désactive.

Un classeur à vous : copiez le fichier d'entraînement, changez les lignes de `2_RO_ModelMaker` pour vos tables (un préfixe à vous, comme `MY_`, les distingue des tables déjà présentes ; un nom que le système possède déjà est réutilisé, pas créé deux fois), et lancez-y `ninja.exec` avec `dry=Y` d'abord. Les lignes de ce tableau sont les verbes montrés en exécution dans les sections ci-dessus ; le tableau lui-même n'est pas relancé par le test de cette page, contrairement aux blocs gris.

## Travailler au terminal : `mis.js`

Si vous préférez choisir plutôt que taper, `mis.js` affiche une liste avec un pointeur. C'est seulement une interface : chaque touche se compile en **une** des lignes de la porte ci-dessus, passe par la même porte (journalisée, avec contrôle des demandes retenues), et l'écran imprime la ligne avant de l'exécuter. Haut et Bas déplacent le pointeur. Gauche et Droite se déplacent le long des boutons de la ligne pointée (`[U Edit] [D Delete] [C Copy]` pour un enregistrement ; pour un document, les actions que le moteur permet maintenant, comme `[C Complete] [V Void]`, et plus de Delete une fois qu'il est complété). Entrée exécute le bouton en surbrillance. `+` démarre un nouvel enregistrement, Delete demande `y/N`, et Échap annule et n'écrit rien.

Dans un terminal, il dessine avec les flèches. Avec `--plain`, il lit des noms de touches depuis un tube, donc un script, un lecteur d'écran et une IA voient exactement ce que voit une personne :

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

Ajoutez `role=103` à la commande et chaque ligne que l'écran envoie porte ce rôle ; la ligne d'en-tête le nomme. Sans rôle, la ligne d'en-tête dit que rien n'est filtré.

Un formulaire ne demande que ce que le moteur ne peut pas remplir (l'essai à blanc ci-dessus). Taper remplit le champ, Tab ou Entrée passe au suivant, et Entrée sur le dernier champ montre la seule ligne qu'il va exécuter. Une ligne qui commence par `=` est du texte tapé. Voici toute la session, réduite aux lignes de la porte qu'elle a exécutées :

<!-- run: mis_form cut=200 -->
```text
$ printf '+\n=GD300\nTab\n=Guide Four\nEnter\ny\nEsc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner value=GD300 --plain 2>/dev/null | grep '^->'
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
-> mis.new kind=C_BPartner dry=Y
-> mis.new kind=C_BPartner Value=GD300 Name="Guide Four"
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
```

Modifier fonctionne de la même façon : cela ne montre que les colonnes que la fenêtre laisse modifier à une personne, avec les recherches sous forme de noms, et n'envoie que ce que vous avez changé. Copier démarre un nouvel enregistrement à partir de celui qui est pointé, donc vous devez changer ce qui doit être unique (un doublon est refusé et votre saisie est conservée). Définissez `MIS_SESSION_FILE=session.door` et une session de terminal enregistre les lignes qu'elle a exécutées, une par ligne, sous forme de script que vous pouvez lire et relancer.

### Le menu à l'écran : `menu` et `mis.menu`

`node common/door/door.js menu` (avec l'alias de l'aide-mémoire, `d menu` ; dans le shell red1, `menu`) ouvre le menu de l'ERP dans le terminal, le même menu que montre l'ERP du navigateur, avec les mêmes dossiers dans le même ordre. Ajoutez un rôle (`d 'menu role=102'`) et vous ne voyez que ce que ce rôle peut ouvrir. Haut et Bas, ou un numéro, choisissent une entrée ; Entrée ouvre un dossier, ou l'écran de liste d'une fenêtre (l'écran `mis.js` ci-dessus, sur la table du premier onglet de la fenêtre) ; Échap remonte d'un niveau, et depuis le haut il quitte ; `/` cherche une entrée par son nom ; `?` montre les touches. Un processus, un rapport ou un formulaire indique qu'il s'ouvre dans l'ERP du navigateur, et n'exécute rien. Comme partout sur cette page, l'écran ne fait que taper des lignes de la porte pour vous, et il imprime chacune avant de l'exécuter (les lignes `->`), donc ce que vous faites à l'écran, vous pouvez aussi le taper, ou le mettre dans un script.

Le menu lui-même est une ligne de la porte, `mis.menu [role=] [find=]`. Ici, l'écran est piloté avec des touches tapées (`--plain` les lit depuis l'entrée), en cherchant « partner » et en ouvrant la troisième correspondance :

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

## Choisir comment la réponse s'affiche, et la conserver

La réponse est l'enveloppe JSON sauf si vous demandez autre chose. Trois options montrent les lignes d'une réponse sous une forme qu'une personne ou un tableur peut lire ; l'enveloppe reste ce que la porte enregistre :

- `--list` : un tableau aligné, terminé par `shown N of TOTAL`. Une réponse qui est un seul enregistrement montre des lignes `field: value`.
- `--csv` : les lignes en CSV (RFC 4180 : une cellule contenant une virgule, un guillemet ou un saut de ligne est entre guillemets ; les nombres sont exactement ceux renvoyés par le moteur).
- `--out FILE` écrit la forme choisie dans un fichier du dossier courant au lieu de l'écran. Une ligne refusée, retenue ou non concluante n'écrit aucun fichier et le dit.

<!-- run: csv_orders -->
```text
$ node common/door/door.js --csv 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo,DocStatus,GrandTotal
80001,CO,100.7
80001,CO,100.7
800002,CO,2160
```

Dans un script, terminez une ligne par `> file` pour envoyer la réponse de cette ligne dans un fichier du dossier du script (`>> file` y ajoute). La forme suit le nom : `.csv` donne du CSV, `.json` donne l'enveloppe, tout autre nom donne la liste. Un chemin qui sort du dossier du script est refusé.

Ces options se trouvent dans un cinquième fichier, `render.js` ; placez-le à côté de `door.js` quand vous les utilisez depuis un téléchargement :

```text
curl -O https://red1oon.github.io/bim-ootb/common/door/render.js
```

## Interroger la porte : `help`

Tapez `help` pour voir les commandes courantes, chacune sous forme de ligne que vous pouvez exécuter. `help erp` liste chaque verbe d'une application, `help erp.find` montre un verbe en entier (ce qu'il fait, chaque entrée, ce qu'il peut changer, qui peut l'exécuter), et `help all` liste tout. L'aide est générée à partir de la même liste de verbes que le tableau ci-dessous, ne lit rien, n'exécute rien et n'est pas enregistrée dans le journal.

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

## Pour les développeurs : vérifier le jumeau par rapport au legacy

Ces verbes sont destinés à la personne qui maintient le jumeau ERP égal au vrai iDempiere. Ils demandent une copie complète de bim-ootb, et pour les quatre premiers la pile de test legacy en marche (un Postgres docker et le serveur pilote) et le code source d'iDempiere à côté. Quand une partie manque, ils répondent `inconclusive` et disent laquelle : ils ne répondent jamais une liste vide ou « identique » pour quelque chose qu'ils n'ont pas pu regarder.

`legacy.status` demande si la pile est en marche. Il ne démarre rien ; quand quelque chose est arrêté, il imprime les commandes qui le démarrent :

<!-- run: legacy_status -->
```text
$ node common/door/door.js --list 'legacy.status'
verdict: UP
postgres: {"container":"postgres","database":"idempiere_pilot","state":"ready"}
pilot: {"url":"http://localhost:8088/webui/","http":200,"state":"up"}
summary: legacy UP: postgres ready, pilot up
next: []
```

`erp.column` répond à « qui remplit cette colonne », à partir du dictionnaire du jumeau et de celui du legacy côte à côte : la valeur par défaut de la colonne, la règle de validation, la valeur par défaut du champ, et la valeur par défaut à la connexion (iDempiere place la ligne `IsDefault` d'une table référencée dans le contexte à la connexion). Quand les deux côtés divergent, il dit `DIFFERENT` et quelle partie :

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

`idempiere.where` trouve un nom dans le code source d'iDempiere et répond le fichier, la ligne et le texte de la ligne, de sorte qu'une affirmation sur le comportement du legacy puisse citer sa provenance. Il montre 25 lignes sauf si `limit` dit autre chose et donne toujours le total ; `in=callout` ne garde que les fichiers dont le chemin contient ce texte :

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

Trois autres verbes se tiennent à côté de ceux-ci. `legacy.query table=c_order ad_client_id=11 limit=5` lit des lignes d'une table legacy (lecture seule ; la table et chaque colonne sont vérifiées par rapport au dictionnaire du legacy, et le total est toujours donné). `erp.compare kind=Order number=50000 legacy=50981` lit un enregistrement sur le jumeau et celui qui lui correspond sur le legacy et les compare cellule par cellule ; une cellule où le legacy est vide et où le jumeau contient une valeur par défaut est étiquetée `NULL-VS-DEFAULT` et rien n'est dit sur la raison. `witness.run name=erp_new` exécute un témoin (witness) de l'arborescence, garde tout son journal, et répond avec sa propre ligne de verdict (PASS, FAIL ou INCONCLUSIVE) ; un témoin qui n'imprime aucune ligne de verdict est une erreur, parce qu'un code de sortie n'est pas une preuve, et `witness.last` lit la dernière exécution enregistrée sans la relancer.

### Fabriquer un plugin pour un iDempiere legacy (OSGi et 2Pack)

Pour la personne qui met un modèle de données ERP sur un vrai serveur iDempiere. Le modèle de données est un classeur (Excel) : une feuille par table de l'Application Dictionary (`AD_Table`, `AD_Column`, `AD_Window`, `AD_Tab`, `AD_Field`, `AD_Menu`, etc.), une ligne par enregistrement, la première ligne contenant les noms de colonnes AD, et une colonne `Key` qui nomme chaque ligne. Une cellule qui pointe vers une autre ligne du classeur s'écrit `ref:<Key>` ; une cellule qui pointe vers une ligne que le serveur possède déjà s'écrit `existing:AD_Table:C_ProjectTask`. Une feuille `Plugin` porte l'id, la version et la description du plugin. L'exemple traité est le modèle BIM Document, `erp/plugins/models/BIM_Document.xlsx` dans le dépôt `bim-ootb`.

Deux choses sont produites à partir du seul classeur, et elles sont tenues séparées :

| Produit | Ce qu'il contient | Où il va |
|---|---|---|
| **Le zip 2Pack** | Des métadonnées seulement : les lignes du dictionnaire, et les *noms* de classe de tout processus. Aucun code de programme. Une version de pack est appliquée une fois et jamais modifiée, donc la même version avec des lignes différentes est refusée | Le dossier `META-INF` du plugin, où l'activateur de pack propre à iDempiere le prend quand le plugin démarre |
| **Les classes de modèle Java** | `I_<Table>` et `X_<Table>` pour chaque table que le classeur crée, sous la forme qu'écrit le générateur propre à iDempiere | Le dossier `src` du plugin |

Ce que le classeur ne peut pas produire, ce sont les règles : l'action de document de la table, et le code de tout processus. Celles-ci s'écrivent à la main dans le dossier `src` du plugin, comme dans tout plugin iDempiere.

Le verbe de la porte `erp.pack book=<workbook.xlsx> version=<x.y.z> out=<plugin>/META-INF` n'écrit que le zip, et répond avec son sha256, les lignes par table du dictionnaire et les noms des classes de processus vers lesquelles il pointe. Relancé avec la même version et les mêmes lignes, il répond `unchanged` ; la même version avec un classeur modifié est refusée, parce qu'un pack publié n'est jamais modifié. Ajoutez `java=<plugin>/src package=<java package>` et les classes de modèle Java sont écrites aussi. Une personne l'exécute ; l'appel d'une IA est retenu comme demande jusqu'à ce qu'une personne confirme. Le script sous-jacent reste `node erp/tools/xlsx_pack.js`, qui imprime une ligne `§XLSX-PACK` pour chaque fichier qu'il écrit. Le second verbe, `erp.legacy_plugin book=<workbook.xlsx> version=<x.y.z>`, est tout le parcours sur l'instance de test legacy locale en une seule ligne. Il exécute cinq lignes, et la première qui n'est pas ok l'arrête : `legacy.up` (démarrer le Postgres docker partagé s'il est arrêté), `erp.pack` (créer le zip), `legacy.refresh` (reconstruire la base de test à partir de la graine de base, installer le plugin, démarrer le serveur et attendre que le pack soit installé, environ deux minutes), `legacy.check` (relire chaque ligne du classeur depuis la base de test par SQL) et `legacy.witness` (lancer la vérification dans le serveur via la console du serveur et répondre avec son verdict et ses comptes). Chaque étape peut être exécutée seule. L'instance, sa base de données et les scripts sont fixes : rien n'est pris de l'appelant, et les bases de données du pilote sont refusées. Une personne l'exécute ; l'appel d'une IA est retenu comme demande jusqu'à ce qu'une personne confirme.

`legacy.check` est celui qui est en lecture seule, et il répond combien de lignes de chaque type ont été trouvées par rapport au nombre que le classeur contient :

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

Donnez-lui aussi `version=<x.y.z>` et il compare le 2Pack installé dans le plugin avec le pack qui vient d'être créé à partir du classeur, et dit clairement quand ils diffèrent : le refresh installe le bundle du plugin tel qu'il est enregistré dans le dépôt, donc les deux peuvent diverger jusqu'à ce que le bundle soit reconstruit.

## Questions Viewer à partir d'un téléchargement simple

Deux verbes Viewer, `viewer.counts` et `viewer.clashes`, fonctionnent aussi sans copie complète. Placez deux fichiers de plus à côté des six :

```text
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_verbs.js
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_driver.js
```

Sans fichiers de page sur votre disque, l'outil ouvre la page Viewer en ligne avec le bâtiment que le site sert, dans un navigateur caché sur le processeur, et interroge le panneau Find propre au Viewer. `page` dans la réponse dit quelle page a été utilisée :

<!-- run: viewer_flat -->
```text
$ node door.js 'viewer.counts building=Duplex' | grep -o '"summary":"[^"]*"\|"page":"[a-z]*"'
"summary":"1119 elements: MEP 904, ARC 196, STR 19"
"page":"live"
```

Cela prend environ une demi-minute. Les chiffres sont ceux du bâtiment servi, donc ils peuvent différer d'une copie plus ancienne dans une copie complète. Les verbes de planning, `viewer.film_path`, les verbes d'objet et `modeller.walk` demandent toujours une copie complète ; le tableau dit lesquels.

## Le shell red1 : des mots courts à une seule invite {#the-red1-shell-short-words-at-one-prompt}

`red1` est la porte pour une personne au clavier. Tapez `node common/door/red1.js` (ou `red1`, après un seul `npm link` dans la copie) et vous obtenez une invite `red1>`. Chaque mot court devient UNE ligne de la porte, et cette ligne est imprimée, après `→`, avant son exécution. Ainsi le shell enseigne la ligne complète au fur et à mesure, et un script ou une IA peut exécuter la même ligne sans aucun shell. Une ligne complète de la porte tapée à l'invite fonctionne toujours telle quelle.

`cd` dit où vous êtes, donc vous ne le répétez pas : un bâtiment (`cd Duplex`), un type de celui-ci (`cd Element`), ou un type ERP (`cd Order`). L'invite l'affiche (`red1 Duplex/Element>`), et `pwd` l'imprime sous forme de clés de la porte. Dans une exécution unique, `;` sépare les mots :

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

Les mêmes mots tapés à l'invite (ici alimentés par un tube, donc la réponse est imprimée, pas dessinée) :

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

**Rechercher, avec des jokers.** `*` est toute suite de caractères, `?` un caractère, `[abc]` l'un d'eux ; les majuscules ne comptent pas. Dans un type, nommez la colonne : `ls element_name=*bath*`. Le même filtre fonctionne sur chaque verbe de liste (`mis.list`, `object.list`, `object.count`), pour les tables ERP comme pour les bâtiments. Une valeur sans joker reste une correspondance exacte.

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

**Conflits, dessinés.** `clash ARC MEP` dans un bâtiment interroge le Viewer et dessine les chiffres propres à la réponse sous forme d'entonnoir (dessiné seulement quand ses parties s'additionnent). `ls` liste ensuite les lignes de conflit de la même réponse, sans redemander, et `ls *Bath*` garde les lignes où une cellule correspond. Tapé seul, `clash` ouvre un menu des disciplines du bâtiment (flèches ou un chiffre, puis Entrée ; Échap annule). Dans une session, la page Viewer reste ouverte, donc après la première ligne un conflit répond en environ une seconde.

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

**Ce qu'un document peut faire ensuite.** Dans un type ERP, `next <number>` dessine les actions que le moteur permet maintenant, et pointe chacune de celles qui ont un mot vers la ligne qui l'exécute :

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

`help` liste les mots ; `help verbs` liste chaque verbe de la porte. **Depuis JavaScript**, les mêmes verbes forment un seul objet, généré à partir du vocabulaire (un nouveau verbe ne demande aucun nouveau code) :

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**Limites.** Les mots d'objet (`cd Element`, `ls`, `group`) demandent un modèle qui porte le dictionnaire d'objets ; parmi les bâtiments ici, seul Duplex en a un. Une liste plus haute que le terminal s'arrête à chaque page (Espace, q) ; un tube reçoit chaque ligne.

## Les verbes {#the-verbs}

Ce tableau est **généré à partir du fichier de vocabulaire** (`common/door/verbs.json`) et un test vérifie qu'il correspond, verbe par verbe. C'est la même liste dont est construit le menu d'outils de l'IA. Le *risque* est expliqué plus haut ; *Nécessite* dit lequel des deux téléchargements exécute le verbe.

<!-- GEN:verbs -->
| Verbe | Ce qu'il fait | Entrées | Risque | Qui peut l'utiliser | Nécessite |
|---|---|---|---|---|---|
| `modeller.lines` | Lire la grille | `building` | read | human, ai | le téléchargement de 6 fichiers |
| `modeller.try_shift` | Essayer le décalage d'une ligne de grille | `building`, `line`, `move` (mètres) | trial | human, ai | le téléchargement de 6 fichiers |
| `viewer.counts` | Compter les éléments | `building`, `by` (facultatif) | read | human, ai | les 6 fichiers + les 2 fichiers du Viewer |
| `viewer.clashes` | Lister les conflits entre deux disciplines | `building`, `discA`, `discB`, `rows` (facultatif) | read | human, ai | les 6 fichiers + les 2 fichiers du Viewer |
| `viewer.film_path` | Visibilité du parcours du film | `db`, `path` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `viewer.schedule_at` | État du planning à un jour donné | `building`, `day` (numéro du jour) | read | human, ai | une copie complète de bim-ootb |
| `viewer.schedule_compare` | Moteur de planning comparé à sa référence | `building`, `shift_hours` (heures) (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `modeller.widen_bay` | Élargir une travée à une largeur cible | `building`, `from`, `to`, `target` (mètres) | trial | human, ai | le téléchargement de 6 fichiers |
| `modeller.walk` | Ce que le walker poserait | `building`, `discipline` | read | human, ai | une copie complète de bim-ootb |
| `object.describe` | Décrire un type d'objet | `building`, `kind`, `uu` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `object.read` | Lire un objet | `building`, `kind`, `uu` | read | human, ai | une copie complète de bim-ootb |
| `object.history` | Historique d'un objet | `building`, `kind`, `uu` | read | human, ai | une copie complète de bim-ootb |
| `object.update` | Modifier une propriété d'un objet | `building`, `kind`, `uu`, `column`, `value` | writes | human, ai | une copie complète de bim-ootb |
| `object.attach` | Joindre un fichier ou une note à un objet | `building`, `kind`, `uu`, `file` (facultatif), `text` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `object.count` | Compter les enregistrements d'un type | `building`, `kind`, autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `object.list` | Lister les enregistrements d'un type | `building`, `kind`, `columns` (facultatif), `sort` (facultatif), `limit` (facultatif), `offset` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `object.sum` | Additionner une colonne | `building`, `kind`, `column`, autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `object.group` | Compter selon une colonne | `building`, `kind`, `by`, autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `witness.run` | Exécuter un témoin et lire son verdict | `name` | trial | human, ai | une copie complète de bim-ootb |
| `witness.last` | Lire la dernière exécution enregistrée d'un témoin | `name` | read | human, ai | une copie complète de bim-ootb |
| `legacy.status` | La pile de test legacy est-elle en marche ? | aucune | read | human, ai | une copie complète de bim-ootb |
| `legacy.query` | Lire des lignes d'une table legacy | `table`, `columns` (facultatif), `sort` (facultatif), `limit` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.column` | Qui remplit une colonne : jumeau et legacy côte à côte | `kind`, `column` | read | human, ai | une copie complète de bim-ootb |
| `legacy.compare` | Comparer un enregistrement sur le jumeau et sur le legacy | `kind`, `number`, `legacy` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `idempiere.where` | Trouver un nom dans le code source d'iDempiere | `symbol`, `in` (facultatif), `limit` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.pack` | Créer le zip 2Pack à partir d'un classeur de modèle de données | `book`, `version`, `out` (facultatif), `java` (facultatif), `package` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `legacy.up` | Démarrer le Postgres docker partagé pour la pile de test legacy | aucune | writes | human, ai | une copie complète de bim-ootb |
| `legacy.refresh` | Rafraîchir l'instance de test legacy à partir de la graine de base | aucune | writes | human, ai | une copie complète de bim-ootb |
| `legacy.witness` | Exécuter le témoin dans le serveur sur l'instance de test legacy | aucune | trial | human, ai | une copie complète de bim-ootb |
| `legacy.check` | Vérifier les lignes d'un classeur dans la base de test legacy | `book`, `version` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `legacy.plugin` | Installer un plugin de modèle de données sur l'instance de test legacy et l'y vérifier | `book`, `version` | writes | human, ai | une copie complète de bim-ootb |
| `model.open` | Ouvrir des feuilles 2D dans le Modeller | `sheets`, `type` (facultatif), `file` (facultatif) | trial | human, ai | une copie complète de bim-ootb |
| `model.convert` | Convertir les feuilles ouvertes en modèle 3D | aucune | trial | human, ai | une copie complète de bim-ootb |
| `model.addbay` | Ajouter une travée au modèle | `end` | trial | human, ai | une copie complète de bim-ootb |
| `model.undo` | Annuler la dernière modification du modèle | aucune | trial | human, ai | une copie complète de bim-ootb |
| `model.save` | Enregistrer le modèle ouvert | `file` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `model.close` | Fermer la session Modeller | `discard` (facultatif) | trial | human, ai | une copie complète de bim-ootb |
| `erp.find` | Trouver un document | `kind`, `number` | read | human, ai | une copie complète de bim-ootb |
| `erp.actions` | Ce qui peut être fait à un document | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `erp.complete` | Compléter un document | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif) | posts | human, ai | une copie complète de bim-ootb |
| `erp.void` | Annuler un document | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `erp.close` | Clore un document | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `erp.reverse` | Extourner - Corriger un document | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif) | posts | human, ai | une copie complète de bim-ootb |
| `mis.describe` | Décrire un type d'enregistrement ERP | `kind`, `role` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.read` | Lire un enregistrement ERP | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.list` | Lister des enregistrements | `kind`, `columns` (facultatif), `sort` (facultatif), `limit` (facultatif), `offset` (facultatif), `names` (facultatif), `role` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.sum` | Additionner une colonne | `kind`, `column`, `role` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.group` | Compter selon une colonne | `kind`, `by`, `role` (facultatif), `window` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.new` | Créer un enregistrement | `kind`, `dry` (facultatif), `role` (facultatif), `window` (facultatif), autres filtres `column=value` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `mis.update` | Modifier un enregistrement | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif), `window` (facultatif), autres filtres `column=value` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `mis.delete` | Supprimer un enregistrement | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif), `window` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `mis.load` | Charger des enregistrements depuis un CSV | `kind`, `file`, `dry` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `mis.add_window` | Ajouter une fenêtre à partir d'un CSV | `file`, `table` (facultatif), `workflow` (facultatif), `dry` (facultatif), `master` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `ninja.exec` | Exécuter un classeur Ninja | `file`, `dry` (facultatif), `data` (facultatif), `table` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `ninja.workflow` | Donner à une table les colonnes de document | `table`, `dry` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `mis.diff` | Comparer un CSV avec la table | `kind`, `file`, `key` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `mis.menu` | Lire le menu | `role` (facultatif), `find` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `ninja.rollback` | Annuler un lot Ninja | `bundle`, `dry` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `ninja.export` | Réécrire un lot Ninja sous forme de classeur | `bundle` (facultatif), `window` (facultatif), `table` (facultatif), `file` | writes | human, ai | une copie complète de bim-ootb |
| `erp.column` | Qui remplit une colonne : jumeau et legacy côte à côte (ancien nom de mis.column) | `kind`, `column` | read | human, ai | une copie complète de bim-ootb |
| `erp.compare` | Comparer un enregistrement sur le jumeau et sur le legacy (ancien nom de legacy.compare) | `kind`, `number`, `legacy` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `erp.pack` | Créer le zip 2Pack à partir d'un classeur de modèle de données (ancien nom de mis.pack) | `book`, `version`, `out` (facultatif), `java` (facultatif), `package` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
| `erp.legacy_plugin` | Installer un plugin de modèle de données sur l'instance de test legacy et l'y vérifier (ancien nom de legacy.plugin) | `book`, `version` | writes | human, ai | une copie complète de bim-ootb |
| `erp.describe` | Décrire un type d'enregistrement ERP (ancien nom de mis.describe) | `kind`, `role` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `erp.read` | Lire un enregistrement ERP (ancien nom de mis.read) | `kind`, `id` (facultatif), `number` (facultatif), `role` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `erp.list` | Lister des enregistrements (ancien nom de mis.list) | `kind`, `columns` (facultatif), `sort` (facultatif), `limit` (facultatif), `offset` (facultatif), `names` (facultatif), `role` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `erp.sum` | Additionner une colonne (ancien nom de mis.sum) | `kind`, `column`, `role` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `erp.group` | Compter selon une colonne (ancien nom de mis.group) | `kind`, `by`, `role` (facultatif), `window` (facultatif), autres filtres `column=value` (facultatif) | read | human, ai | une copie complète de bim-ootb |
| `erp.new` | Créer un enregistrement (ancien nom de mis.new) | `kind`, `dry` (facultatif), `role` (facultatif), `window` (facultatif), autres filtres `column=value` (facultatif) | writes | human, ai | une copie complète de bim-ootb |
<!-- /GEN:verbs -->

**Couverture actuelle.** La liste est volontairement petite : 59 verbes couvrent les modifications de grille du Modeller, son walker et un Modeller gardé ouvert entre les lignes, quelques questions Viewer, le planning, la lecture, le comptage et l'écriture génériques d'objets, et les premiers verbes de document ERP. Le Viewer a 64 actions qu'une personne peut presser, et la porte offre 5 verbes Viewer. L'ERP a 1157 documents et processus, et la porte offre 6 verbes ERP pour la vie d'un document et 14 verbes MIS qui fonctionnent sur n'importe quelle table, et garde 10 anciens noms pour que les lignes antérieures fonctionnent encore. Ceci est donc un début, pas le menu complet.

## Ce qui n'est pas vérifié {#what-is-not-checked}

Une réponse liste ce que sa vérification n'a pas couvert. Pour le rapport de modification du Modeller, la liste est :

<!-- run: notchecked cut=520 -->
```text
$ grep -o '"notChecked":\[[^]]*\]' widen.json | tail -1
"notChecked":["duplicate ids","elements changed outside the edit's own list","floating or unsupported elements","grid lines placed on top of each other","invalid coordinates","real beams: only girders walked from columns are span-checked","unknown element types","wrong units or absurd sizes, unless they hit something","zero-size elements","load capacity","beam and column rules (Regulatory Report only)"]
```

Les mêmes mots s'appliquent à toute réponse : les chevauchements sont d'abord des boîtes englobantes, une vérification ne couvre que ce qui a bougé, et **la capacité portante n'est jamais vérifiée**. Une réponse sans rouge ne signifie jamais sûr.

## Dépannage

| Ce que vous voyez | Que faire |
|---|---|
| `edit_cli is not at …` | Un des six fichiers manque. Le message affiche la ligne `curl` |
| `puppeteer not found` | Lancez `npm install puppeteer@24` dans le même dossier |
| `unknown verb` | Le message liste chaque verbe. Vérifiez l'orthographe par rapport au [tableau](#the-verbs) |
| `missing input: …` | Le verbe a besoin de cette clé. Le tableau liste les entrées |
| `The Viewer tools need a bim-ootb checkout` | Lancez-le avec `node common/door/door.js` depuis une copie complète |
| `exit 1` avec un message Chrome | Les bibliothèques système de Chrome manquent sous Linux. La page de dépannage de Puppeteer les liste |

**Limites à prévoir.** Chaque appel Modeller ouvre le bâtiment entier : environ 10 à 40 secondes sur le HospitalGarage. C'est un outil de mesure, pas un service avec disponibilité garantie. Un script avec plusieurs lignes Modeller ouvre le bâtiment une fois par ligne.

## Comment cette page reste vraie

Chaque commande d'un bloc gris ci-dessus a été exécutée, et la sortie en dessous est ce que la commande a imprimé. Un test, **W-FAST-SCRIPT-GUIDE** dans le dépôt `bim-ootb`, les relance depuis un téléchargement propre de quatre fichiers, vérifie chaque nombre de cette page par rapport aux exécutions, et vérifie que le tableau des verbes est égal à `verbs.json`. Si un nombre ici devient périmé, ce test échoue.

Voir aussi : le [Guide du proposeur d'IA](ProposerGuide.md) (connecter une IA à la même porte, et ce qu'une IA a fait des vérifications), et le [Guide du Modeller](ModellerGuide.md).
