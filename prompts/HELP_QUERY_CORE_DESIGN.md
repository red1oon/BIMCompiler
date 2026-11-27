# ⚠ DO NOT REMOVE — HELP_QUERY_CORE_DESIGN: the ONE query core (design only, no code)
**Scope:** the design of the one deterministic retrieval core called by the Viewer help panel, the Modeller help panel, the ERP help box and the `red1` shell. It answers `prompts/VOCAB_MESSAGE_CATALOG.md` §18 (decisions D1-D8). Nothing here is built. No AI inside, offline, nothing new loaded in the browser, vocabulary from the dictionary, no per-window code (CLAUDE.md AD-LAYER LAW).
**Rule for every session that builds from this file: read the log after every run.** An exit code is not evidence. A witness that judged nothing prints `INCONCLUSIVE`, never `PASS`.
**Marks:** every statement is **MEASURED** (read in a file, the source is given) or **PROPOSED** (a design choice, not yet proven). A number without a source is a PROPOSED parameter or budget, never a result.
**Read at:** bim-compiler `origin/master` `088905a73`, bim-ootb `origin/main` `0add6f60`, legacy `~/idempiere-dev-setup/idempiere/` (2026-11-17). Written by one bounded Fable agent (12 tool calls, 9 files read, 3 legacy greps); reviewed by the Opus session before any build.

---

## 1. Summary

PROPOSED: one pure JS file, `common/help/help_query.js`, holds the whole ranker and runs unchanged in the page and in Node, as `assist_core.js` already does (MEASURED: `common/door/assist_core.js` header, "runs unchanged in Node and in the page"). Each app gives it generic **records** (id, kind, name, other names, description, help, target, gate) built at build time into a lazy `index.json` beside the help pack. The core never sees a table or a window. A query is folded, split into words by one rule that never calls `Intl.Segmenter` at run time (the segmenter runs once, at build time, in pinned Node, and only makes a word list), ranked by one BM25 whose scores are **integers** (no `Math.log` at run time), and ordered by a total tie-break, so the browser and the shell give the byte-identical list. A second file, `common/help/help_grammar.js`, reads the leading character: `?` help, `#<number>` a document, everything else text. "Did you mean" is a separate line from the existing `AssistCore.nearest()`. "Open document" and "new window" only OPEN, through the existing role gate; they never write. **One new fact changes an agreed point:** legacy iDempiere has a global search, and its document-search prefix is `/` (MEASURED: `GlobalSearch.java:62`), not `#`. That is owner question 1.

---

## 2. The decision table

### D1 Index: one record shape
| | |
|---|---|
| **Options** | (a) keep one index per app, each with its own shape (today); (b) ONE generic record, built by a thin adapter per app, the core sees records only; (c) SQLite FTS tables. |
| **Chosen** | **(b)**. PROPOSED. |
| **Why** | MEASURED: today there are two unlike matchers. `erp/help_search.js` `makeIndex` takes windows / tables / actions / statuses / how-to as separate inputs and ranks ONLY the how-to rows (`N = howto.length`). `common/help/help_panel.js` `renderList` is a substring filter (`indexOf(f)`) over name, seq, children, CLI titles and `howto.text`. Two engines for one job breaks AD-LAYER LAW 5. (c) is closed: MEASURED VOCAB §16, the browser SQLite 3.38.5 has no FTS5, the CLI has. |
| **Fields and weights** | name `n` and other names `a` weight 3; description `d` weight 2; help `h` weight 1 (PROPOSED parameters; the order name > description > help is §16's). Character-pair terms (D2) weight 1 in every field. Weights live in the pack header, not in the code. |
| **Where built** | PROPOSED: build time, Node, pinned, by `common/help/tools/build_help_index.js`. It calls one adapter per app (`erp/tools/help_records.js`, `viewer/tools/help_records.js`, `modeller/tools/help_records.js`). An adapter only LISTS records from its sources (ERP: the dictionary rows + the help pack; Viewer: the pills, `viewer/help/howto.json`, the class text; Modeller: its pills and guide sections). |
| **Where it lives** | PROPOSED: a lazy sibling of the help pack, `…/help/<lang>/index.json`, fetched through the existing loader (MEASURED: `erp/erp_i18n.js:58` `loadHelp`, path `i18n/help/<code>/help.json`). Committed (Pages serves tracked files only). |
| **Records added at run time** | PROPOSED: an adapter may hand the core extra records read from the live dictionary (a window staged by a plugin is not in a build-time pack). The core indexes them with the same code. This keeps the Ninja rule: a staged module needs no host code. |
| **Evidence it is generic** | W-HQ-GENERIC (§5): the core's source holds none of the dictionary's table names, no window id, and no branch on a record kind except the sort order read from the pack's `kinds` list. |
| **Falsifier** | Add one `c_order` string or one `kind === 'window'` branch to the core: W-HQ-GENERIC must FAIL. Also W-HQ-SELF: every record must find itself by its own name; with the name field dropped (`HQ_BREAK=noname`) it must FAIL. |
| **Found on the way** | MEASURED: `erp/tools/build_help_pack.js` holds a hand list `HOWTO` of four windows (143, 169, 167, 195). It is a build-tool list, not UI code, but it is a hand list. The ERP adapter should read the how-to rows as records and not add a second list. |

### D2 Words: how a query becomes terms
| | |
|---|---|
| **Options** | (a) call `Intl.Segmenter` at run time in both places; (b) character pairs only for zh / ja / th; (c) `Intl.Segmenter` ONCE at build time to make a word list, then at run time split by longest match against that list, with character pairs for what is left. |
| **Chosen** | **(c)**. PROPOSED. |
| **Why** | MEASURED VOCAB §16: browsers ship different ICU dictionaries, so (a) can split one text two ways; Thai is measured in Node only. (b) loses real words (§16 shows `如何|创建|销售|订单`). (c) makes the two environments agree **by construction**: the segmenter never runs at query time. MEASURED: the longest-match idea is already in the code, `erp/help_search.js` `ask`, CJK branch ("at each position the longest phrase whose flat text starts there"), and so are the pairs (`pairs()`). |
| **The rule (PROPOSED, the same for a record's text and for a query)** | 1. **Fold:** ~~Unicode NFKC~~ **CORRECTED at build (bim-ootb #3192): NFKD, lower case, strip U+0300-U+036F, then NFC** — NFKC keeps precomposed accents, so the strip never fired (W-HQ-WORDS W3: 307 of 307 accented names stayed accented); then lower case with `toLowerCase()` (never `toLocaleLowerCase`), then delete the combining marks U+0300 to U+036F only (accents; NOT all marks, which would strip Thai vowels and tones). Legacy also deletes accents (MEASURED: `MenuSearchController.java:594`, `Util.deleteAccents`). `Util.deleteAccents` itself was not read: confirm its exact range before the build. 2. **Runs:** split into runs of a no-space script (kana, CJK ideographs, Thai) and runs of everything else. MEASURED: today's `CJK` regexp in `help_search.js` has kana and ideographs and no Thai. The script list is data in the pack header. 3. **Spaced runs** (en, ms, de, fr, es, id): split on anything that is not a letter, digit or `_` (MEASURED: this is `words()` today). No stemming, no stop list. 4. **No-space runs:** at each position take the longest word of the pack's `vocab` list that starts there; characters between matches form pairs (each two neighbours); one lone character gives no term (the name tier of D3 still finds it). |
| **The word list** | PROPOSED: `vocab` = the distinct word-like segments (2 characters or more) that pinned Node's `Intl.Segmenter` gives over every name, description and help of the language's records. It is stored once per language in the pack header, with the Node and ICU versions that made it. Only the list is stored, not a split per record. |
| **No stop list** | MEASURED: `help_search.js` has an English-only `STOP` string. PROPOSED: delete it. A common word has a low BM25 weight already, and a hand list per language would be invented vocabulary. |
| **Falsifier** | W-HQ-WORDS: for every record name of every built language (N from the packs), the browser's terms equal Node's terms, compared as one hash. Red control `HQ_BREAK=nodict` set in ONE environment (the word list ignored, pairs only): any name with a listed word of 3+ characters then splits differently, and the witness must FAIL. The same witness also REPORTS (a number, not a verdict) how many names the browser's own live `Intl.Segmenter` would split differently from the pack: that measures the risk that option (a) carried. |

### D3 Rank: one BM25, integer scores, a total order
| | |
|---|---|
| **Options** | (a) keep "BM25-like" on how-to rows only (today); (b) BM25 with floating-point scores computed at query time; (c) BM25 with field weights where the weight of each (term, record) is an INTEGER made by code that uses only + − × ÷. |
| **Chosen** | **(c)**, k1 = 1.2, b = 0.75 (PROPOSED parameters, §16's values; no measurement here argues for others). |
| **Why integers** | The claim to prove is "byte-identical in two environments". IEEE + − × ÷ are exactly defined; `Math.log` is left to each engine by the language standard (PROPOSED reasoning from the standard, not measured here). MEASURED: today's score uses `Math.log(1 + (N - df + 0.5) / (df + 0.5))` at query time, plus `+100` for the matched window. So: the core carries its own natural-log routine written with + − × ÷ only (a fixed number of series terms), computes `weight = round(1,000,000 × idf × tfPart)` once when the index is made, and a query only ADDS integers. The sum is exact. |
| **The formula (PROPOSED)** | For a term t and a record r: `wtf` = the sum over fields of fieldWeight × count of t in the field; `len` = the sum over fields of fieldWeight × number of terms; `tfPart = wtf × (k1 + 1) / (wtf + k1 × (1 − b + b × len / avgLen))`; `idf = ln(1 + (N − df + 0.5) / (df + 0.5))` (today's form). N and df are counted over ALL records of the pack, before the role filter, so one pack gives one set of numbers for every role. |
| **Tiers before the score** | PROPOSED: tier 0 the folded query equals a name; tier 1 a name starts with it; tier 2 a name contains it and the query has 3+ characters; tier 3 the rest. Tiers 1 and 2 are legacy's own menu filter (MEASURED: `MenuSearchController.java:586-607`, "startsWith if length of compare is < 3, otherwise contains"), so everything legacy's menu search would show is in our list (D7). The name scan is a plain loop over the names (thousands of rows). |
| **Total tie-break** | tier ↑, score ↓, kind order ↑ (the pack's `kinds` list), folded name by UTF-16 code unit ↑ (plain `<`, never `localeCompare`; this is also legacy's `String.compareTo`, MEASURED `MenuSearchController.java:187-190`), record id ↑. Ids are unique in a pack, so the order is total. Pseudo-code in §4. |
| **Role gate** | PROPOSED: the adapter gives `allowed(gate)`. The core drops a record the role may not open AFTER ranking. MEASURED: today the page passes the role's menu windows (`indexFrom` `windowIds`), and the door has `rc.gateWindow(id).allowed` (`common/door/object_cli.js:155`). |
| **Evidence browser == Node** | W-HQ-RANK-TWIN: the same pack, the same query list, the core run in Node and in a headless page; the two result lists (ids + tiers + integer scores) hashed and compared. **N comes from the dictionary:** every window name, every process name, every action and status name, in every built language, plus each multi-word name's first word alone, plus each how-to title. |
| **Falsifier** | `HQ_BREAK=revtie` in ONE environment (the last tie-break key reversed): the hashes must differ. If the query list has no tie group at all the witness prints `INCONCLUSIVE`. Second: W-HQ-BM25 recomputes the score of each top hit with a plain floating-point BM25 inside the witness and needs agreement within one part in a million; `HQ_BREAK=k1` (k1 changed in the core) must FAIL it. |

### D4 Grammar: the leading characters
| | |
|---|---|
| **Options** | (a) Odoo's four prefixes (`/ @ # ?`); (b) the agreed two, `?` and `#<number>`, plain text otherwise; (c) no prefixes. |
| **Chosen** | **(b)**. MEASURED as agreed: VOCAB §16 item 7 and CLI_ERP_IVR §41 (owner "Agree on all"). The grammar and the collision table are §3. |
| **Why** | MEASURED: `?` already means help at the start of a red1 line (`common/door/red1.js:40`, `/^\s*(help|\?)/`); `/` separates path segments in the shell; `@` is unused and reserved (§41). |
| **Where it lives** | PROPOSED: ONE file, `common/help/help_grammar.js`, pure, `parse(line) → {kind, text | number | ch}`. It reads a finished input string only. It never listens to keys. |
| **What each caller adds** | The **shell** handles its own words and paths first, then calls `parse` for a line that starts with `?` or `#` (§41 is the CLI session's spec). The **box / panel** calls `parse` on its input value: `text` and `help` both run the query (in a help box `?` is accepted and dropped, so the shell habit works); `doc` goes to D6; `reserved` shows the catalog's message. |
| **Falsifier** | W-PREFIX (box side, the name §16 item 7 gave): the table of §3 as cases, each input → the expected kind. Red control `HQ_BREAK=anyhash` (a `#` anywhere starts a document): the URL case and the "question with a `#`" case must FAIL. |
| **Open** | Legacy's prefix for document search is `/`. See D7 and owner question 1. |

### D5 Did you mean
| | |
|---|---|
| **Options** | (a) merge `nearest()` results into the ranked list; (b) a separate "Did you mean" line above the list; (c) fix the query silently and run it. |
| **Chosen** | **(b)**. PROPOSED. (c) is forbidden: suggest only, never auto-run (MEASURED: §16 item 1, CLI_ERP_IVR §42 and D14, `assist_core.js` header "A wrong name is answered by a suggestion, never by a silent fix"). |
| **Why not merged** | A ranked hit has a score from the index; a suggestion has an edit distance. One sorted list of two unlike numbers would need an invented exchange rate. A separate line also keeps D3's list byte-identical with or without the suggester. |
| **The rule (PROPOSED)** | The line shows when the ranked list is empty, or when a query word has no posting. Candidates: (1) the whole folded query against the record names of the language; (2) each word with no posting against the distinct words of those names. Both through `AssistCore.nearest(typed, names, n)`, the one suggester (MEASURED: §42 S2, "Names are passed in; the function holds none"). **n = 3**, the function's own default (MEASURED: `n = n || 3`). Choosing a suggestion puts it in the box and runs that query: the person's act, not the program's. |
| **2-character rule until §42 S3 lands** | MEASURED: with today's limit `max(2, floor(len/3))` a 2-character typed name matches every short name (zh mean 51 suggestions) and top-1 is right 46/49 (zh), 14/15 (ja), so not always. PROPOSED: for a typed text of 2 characters or fewer, drop every suggestion whose `how` is `nearest`; keep `case` and `prefix`. The name tiers of D3 already serve short text. The guard is one named constant, removed in the PR that follows S3's merge. |
| **Evidence** | MEASURED (§16): on names of 3+ characters top-1 is right, de 354/354, zh 214/216, ja 292/293. |
| **Falsifier** | W-HQ-DYM: N misspellings made from the pack's own names (one character changed mid-name, the method already measured) must each show their source name in the line; a made-up word shows nothing; a 2-character typo shows no `nearest` entry; the op count written is 0; one `grep` finds no second edit-distance function under `erp/` or `common/help/`. Red control `HQ_BREAK=nodym`. |

### D6 Actions: "open document <number>" and "new <window>"
| | |
|---|---|
| **Options** | (a) free text that guesses an intent; (b) two exact rules, each ending in an OPEN that the person confirms, through the existing gate; (c) leave actions to the shell only. |
| **Chosen** | **(b)**. PROPOSED. |
| **`#<number>`** | The whole line is `#` + one run without spaces. The resolver looks the number up across the document kinds, as §41 says (`erp.find number=…`; MEASURED: `erp.find` and `erp.read` exist in `common/door/verbs.json`, "by its number (DocumentNo, else Name or Value…)"). One hit: a card with Open; Enter opens the record in its window. Two or more: a list, the person picks (as `cd` asks, §41). None: a refusal that names the number. A hit whose window the role may not open is not shown and not counted. Reading only. |
| **`new <window>`** | Legacy shape first: MEASURED, legacy's menu search has a new-record button on a window result (`MenuSearchController.java:435-451`, `onSelect(selected, newRecord)`). PROPOSED: every window result carries New when, and only when, the role has the window read-write (MEASURED: the door's own refusal text, `common/door/erp_cli.js:475`, `AD_Window_Access.IsReadWrite=N`). Typed form: the first word equals the catalog's word for New in the screen language or in English, and the rest resolves to exactly one window at tier 0 or 1; then that window is shown first with New chosen. Enter opens the window on a new, unsaved row. In the shell the core returns the `erp.new …` line to PRINT (MEASURED: `erp.new` exists); the person runs it (D14). |
| **Must NOT** | Write anything. Zero ops before the person's own Save or own Enter on a printed line. No second access check: the core calls the adapter's `allowed(gate)`, which is the existing gate. No list of windows or document types in code. |
| **X of N** | W-HQ-DOC: N = the dictionary's tables that have a DocumentNo column and a window (counted by the witness from `ad_seed.db`). For each, one seeded document is found by `#<its number>` and opened. W-HQ-NEW: N = the active windows of the dictionary; for each, with a read-write role New is offered and opens an unsaved row; with a read-only role New is absent. Both print X of N and the op count (must be 0). |
| **Falsifier** | `HQ_BREAK=nogate`: a role without access now sees the document / the New button, and both witnesses must FAIL. An unknown number (`#99999999`, §41's own case) must be refused naming the number. |

### D7 Twin and legacy
| | |
|---|---|
| **What legacy has (MEASURED, 3 greps)** | **A global search exists.** `org.adempiere.ui.zk/WEB-INF/src/org/adempiere/webui/apps/GlobalSearch.java:44`. (1) **Menu search**, `MenuSearchController.java:74`: the label, lower-cased and accents deleted (`:594`, `:599`), matches by `startsWith` when the typed text is shorter than 3, else `contains` (`:586-607`); results sorted by label (`:187-190`); a new-record path (`:435-451`). Labels only: no description, no help, no ranking. (2) **Document search**, `DocumentSearchController.java:76`: started by the prefix **`/`** (`GlobalSearch.java:62` `PREFIX_DOCUMENT_SEARCH = "/"`, `:216`); `/TransactionCode text` picks one definition (`:190-192`, `:613-617`); definitions are `AD_SearchDefinition` rows (`:601`, `:623`); a hit is kept only if the role has the window (`:606`, `:630` `role.getWindowAccess`); results sorted by window name then label (`:174-183`). (3) The same `/` in the menu tree search, `TreeSearchPanel.java:107`. |
| **In the twin today** | MEASURED: one `git grep` over `erp/` and `common/` on bim-ootb `origin/main` found `GlobalSearch`, `MenuSearchController`, `DocumentSearchController` nowhere in the JS, and `ad_searchdefinition` only in table lists (`erp/ad_ddl_notnull.js:208`). So **no port of legacy's global search was found.** That is a twin gap for the ERP parity lane, not a decision of this design. |
| **Options** | (a) the help box copies legacy's global search and nothing more; (b) the core gives legacy's filter exactly as its own function, for the port to call, and the help box is the twin showing MORE; (c) ignore legacy. |
| **Chosen** | **(b)**. PROPOSED. The core exports `legacyFilter(names, typed)`: exactly the `:586-607` rule and the `:187-190` order. A future port of GlobalSearch calls it (one implementation, AD-LAYER LAW 5). The help box is not legacy's box; legacy has no question box. |
| **Where the design differs, and why MORE is allowed** | 1. **Description and help are searched.** Legacy matches labels only. The help box may find more, and every label legacy would show is still there (tiers 1 and 2 of D3). 2. **Order.** Legacy sorts by label; the help box ranks. In the port of GlobalSearch the order stays legacy's (`legacyFilter`). 3. **Prefix.** Legacy `/`, agreed here `#`. This is the one difference that is not "more": it is the same need with another key. It goes to the owner (question 1); the design does not accept it on its own. 4. **Document search source.** Legacy reads `AD_SearchDefinition`; D6 follows §41 (`erp.find number=`). The port must read `AD_SearchDefinition` as legacy does; whether the seed has such rows was not read. 5. **Shape.** Cards and panels keep today's shapes (owner's D3: shape stays legacy's); this design changes what is found and in what order, not how a result looks. |
| **Falsifier** | W-HQ-LEGACY-SUPERSET: for each window name of the role's menu (N from the dictionary) and two probes made from it (its first 2 characters; a 3-character slice from its middle), the set that legacy's rule gives is inside the core's result. Red control `HQ_BREAK=nolegacytier` (tiers 1 and 2 off): a 2-character probe then finds nothing by score alone and the witness must FAIL. Where behaviour is in doubt, the same probes run against real iDempiere through the bridge, not a guess (AD-LAYER LAW 7). |

### D8 Cost
MEASURED baselines (VOCAB §10 and §12 results): help pack raw de 523 KB, fr 452 KB, zh 189 KB, ja 60 KB (before names and how-to were added); gzip download de 152 KB, fr 133 KB, zh 60 KB, ja 19 KB; heap of a German session with the pack +1.29 MB (forced GC, one run). `viewer/help/howto.json` is 11,927 bytes.
| Cost | Budget (PROPOSED, not measured) | How it will be measured |
|---|---|---|
| Pack bytes added per language | `index.json` at most 100 KB raw. Field help texts are not copied: a record points into the pack's `texts` by index, as `fields` do today. | The builder prints `§HQ_INDEX lang=… records=… vocab=… bytes=… gzip=…` per language; W-HQ-COST reads the log. |
| Build time | at most 10 s for all languages of one app | the builder's own wall clock in the same `§` line |
| Index made in memory on open | at most 150 ms, once, on first use of the box (never at page load) | `performance.now()` around the make, `§HQ_READY ms=… terms=… postings=…` |
| Per query | at most 16 ms (one frame), 95th percentile over the W-HQ-RANK-TWIN query list, on a phone-class run (CPU slowed 4×) | `§HQ_QUERY n=… p50=… p95=…` printed by the witness run |
| Heap | at most +2 MB after the index is made | `performance.memory` after a forced GC, with and without the index, the method §11 used; `INCONCLUSIVE` where `performance.memory` is absent |
PROPOSED rule (CLAUDE.md PERF BUDGET): the index is made only when the box is first used; one copy of each text (records point into `texts`); postings are typed arrays; closing the panel may drop the index. **Falsifier:** W-HQ-COST fails on any budget line exceeded; with `HQ_BREAK=eager` (index made at page load) the "never at page load" check must FAIL.

---

## 3. The grammar and the collision table

**The grammar (PROPOSED; 9 lines).** The first character is read after Unicode NFKC, so the full-width `？` and `＃` of an input method count as `?` and `#`.
```
line     := ws* ( help | doc | reserved | text )
help     := '?' ws* rest            ; '?' is the FIRST non-space character
doc      := '#' number ws* END      ; '#' is the FIRST character and the line is the number only
number   := one or more characters that are not a space and not '#'
reserved := '@' rest                ; refused: reserved, no meaning yet (CLI_ERP_IVR §41)
text     := anything else           ; includes '#' followed by a space, and '#x more words'
rest     := any characters, may be empty
; '/' has NO meaning in this grammar: the shell reads paths before it calls parse; a box treats it as text
; a '?' that is not the first character is punctuation and is dropped by the word split
```

| Collision | What happens | Source / status |
|---|---|---|
| bash reads an unquoted `#` as a comment (`red1 #50000`) | The core never receives it. `#` must be quoted in a one-line call; the guide says so. Inside the `red1>` prompt there is no collision. | MEASURED: CLI_ERP_IVR §41 |
| A literal `?` in a question ("how do I void an order?") | Not first, so it is punctuation; the word split drops it. | MEASURED: `help_search.js` `words()` drops non-letters |
| A question that starts with `?` in a help box | `help` and `text` do the same in a box: the `?` is dropped and the rest is the query. | PROPOSED |
| Spanish `¿Cómo…?` | `¿` is not `?`; the line is text. | PROPOSED |
| A URL with a fragment (`https://…/Guide/#save`) | `#` is not first: text. | PROPOSED; W-PREFIX case |
| A pasted path or URL starting with `/` | text in a box. In the shell `/` stays the path separator. | MEASURED: §41, VOCAB §16 item 7 |
| `# heading`, `#1 priority today` | `#` + space, or more than one run: text, not a document. | PROPOSED; W-PREFIX case |
| A document number with letters or a dash (`#SO-1001`) | A number is any run without spaces, so it is a document. | PROPOSED (legacy document numbers may carry a prefix; not read here) |
| `#` alone | A short usage message from the catalog; nothing is searched. | PROPOSED |
| `@name` | `reserved` in the box and in the shell: the same refusal. | MEASURED: §41 "`@x` is refused as reserved" |
| The Modeller's `?` key toggles the panel | The grammar reads the input VALUE, never a key press. With `cfg.noAutoFocus` the box is not focused on open, so `?` still toggles; a `?` typed IN the box is the prefix. | MEASURED: VOCAB §14.5 RESULT step 2 (`noAutoFocus`, W-HELP-DOCK-M M9, "the agreed `?` prefix is not blocked") |
| The Viewer focuses the box on open | `?` typed there goes into the box (the prefix); F1, Esc and × close the panel. | MEASURED: `help_panel.js` header + §14.5 RESULT |
| `#<number>` in the Viewer / Modeller, where there are no documents | DECIDED (owner 2026-11-17, Q2 (a)): selects + frames the element whose IFC id is that number in the open model; a model with no IFC ids answers "no element #<number>". | DECIDED |
| Legacy's `/` for document search | Not in this grammar. DECIDED (owner 2026-11-17, Q1 (a)): `/TransactionCode` only inside a port of legacy's GlobalSearch box. | MEASURED: `GlobalSearch.java:62` |

---

## 4. The record shape and the pack layout

**One record (PROPOSED).** Short keys keep the pack small. No field names a table or a window; `go` and `gate` are opaque to the core and are read only by the app's adapter.
```json
{
  "id": "erp/window/143",
  "k": "window",
  "n": "Auftrag",
  "a": ["Sales Order"],
  "d": 1207,
  "h": 1208,
  "go":   { "act": "open", "ref": 143 },
  "gate": ["window", 143],
  "x":    { "howto": 1, "cli": "erp.new kind=Order" }
}
```
- `id` unique in the pack, the last tie-break key. `k` one of the pack's `kinds`. `n` the name in the pack's language; `a` other names that also match (MEASURED: today the language's name is shown and the English one is also matched, `indexFrom`).
- `d`, `h`: a string, or an integer that points into the help pack's `texts` (no second copy). `x`: extras the card shows; never indexed.
- Kinds, by app (PROPOSED; the list and its order are data in the header): ERP `window, process, doctype, action, status, howto`; Viewer `pill, howto, class`; Modeller `pill, guide`.
- The example's values are an illustration of the shape, not extracted rows.

**The index file header (PROPOSED).**
```json
{
  "v": 1, "app": "erp", "lang": "de_DE", "spec": "prompts/HELP_QUERY_CORE_DESIGN.md",
  "built": { "tool": "build_help_index.js", "node": "<version>", "icu": "<version>" },
  "bm25": { "k1": 1.2, "b": 0.75, "scale": 1000000 },
  "weights": { "n": 3, "a": 3, "d": 2, "h": 1, "pair": 1 },
  "kinds": ["window", "process", "doctype", "action", "status", "howto"],
  "nospace": "<the script ranges read as no-space runs>",
  "vocab": ["…"],
  "records": [ ]
}
```
Postings are NOT stored: both environments make them from `records` with the same code on first use (D8). That keeps the pack small and lets run-time records (D1) join the same index.

**Layout (PROPOSED).**
```
common/help/help_query.js          the core: fold, words, index, BM25 integers, tiers, tie-break, legacyFilter
common/help/help_grammar.js        the leading characters (parse)
common/help/tools/build_help_index.js   the one builder (Node, pinned)
erp/tools/help_records.js          adapter: lists ERP records           -> erp/i18n/help/<lang>/index.json
viewer/tools/help_records.js       adapter: pills, howto.json, classes  -> viewer/help/index/<locale>.json
modeller/tools/help_records.js     adapter: pills, guide sections       -> modeller/help/index/<locale>.json
common/door/assist_core.js         unchanged: nearest() (the CLI session's file)
```
The lazy files are fetched once per chosen language and must stay usable offline; if they enter `sw.js`, expect the usual `CACHE_VERSION` conflict (keep both precache additions, take the higher version).

**The tie-break (pseudo-code, PROPOSED; the only code in this file).**
```
function compare(x, y):                      # x, y = {rec, tier, score}; score is an integer
    if x.tier  != y.tier:  return x.tier - y.tier            # 0 exact name, 1 starts, 2 contains (3+ chars), 3 rest
    if x.score != y.score: return y.score - x.score          # higher first; integers, so no rounding
    kx = kindOrder[x.rec.k]; ky = kindOrder[y.rec.k]         # position in the pack header's "kinds"
    if kx != ky:           return kx - ky
    nx = fold(x.rec.n);    ny = fold(y.rec.n)
    if nx != ny:           return (nx < ny) ? -1 : 1         # UTF-16 code units; never localeCompare
    return (x.rec.id < y.rec.id) ? -1 : 1                    # ids are unique: the order is total

function tierOf(q, rec):                     # q = folded query, spaces collapsed
    best = 3
    for name in [rec.n] + rec.a:
        f = fold(name)
        if f == q:                              return 0
        if f.startsWith(q):                     best = min(best, 1)
        else if len(q) >= 3 and f.contains(q):  best = min(best, 2)
    return best

function query(q, allowed):
    terms = words(q)                          # D2: the same rule as for the records
    out = []
    for rec in records:
        t = tierOf(fold(q), rec)
        s = sum(weight[term][rec] for term in distinct(terms))   # integers made when the index was made
        if t < 3 or s > 0: out.append({rec, tier: t, score: s})
    out.sort(compare)
    return [h for h in out if allowed(h.rec.gate)]                # the role gate, after ranking
```

---

## 5. The witness list
Every witness prints X of N with N from the dictionary or the pack, a `§` line per claim, and `INCONCLUSIVE` when N is 0 or nothing was judged. Start from `bim-ootb/witness_kit/contract.js`. All PROPOSED; none exists.

| Witness | Claim | N comes from | Red control (must FAIL) |
|---|---|---|---|
| W-HQ-GENERIC | The core names no table, no window id and has no branch on a kind. | every table name and window id of `ad_seed.db`, searched in the core's source | a `c_order` string or a `kind === 'window'` branch added |
| W-HQ-SELF | Every record is found by its own name at tier 0. | the records of each built pack | `HQ_BREAK=noname` |
| W-HQ-WORDS | The browser and Node split every name into the same terms. Reports how many names the browser's live segmenter would split otherwise. | every record name, every built language | `HQ_BREAK=nodict` in one environment |
| W-HQ-BM25 | The integer score equals a plain BM25 recomputed in the witness, within one part in a million. | the top hit of every query of W-HQ-RANK-TWIN | `HQ_BREAK=k1` |
| W-HQ-RANK-TWIN | Browser list == Node list, byte for byte (ids, tiers, scores). | every window, process, action and status name × built languages, each first word alone, each how-to title | `HQ_BREAK=revtie` in one environment; no tie group = INCONCLUSIVE |
| W-HQ-LEGACY-SUPERSET | What legacy's menu filter shows is inside our list; `legacyFilter` gives legacy's set and order. | the role's menu windows × 2 probes each | `HQ_BREAK=nolegacytier` |
| W-PREFIX (box) | Each row of §3 parses to its kind; the Modeller `?` toggle still works (M9 green). | the rows of the §3 table | `HQ_BREAK=anyhash` |
| W-HQ-DYM | A one-character typo of a name shows that name; a made-up word shows nothing; 2 characters show no `nearest`; nothing runs; no second edit-distance function. | the names of each pack (3+ characters), plus the 2-character names | `HQ_BREAK=nodym` |
| W-HQ-DOC | `#<number>` opens the document; no access = not shown; unknown = refused naming the number; 0 ops. | the dictionary's tables with a DocumentNo column and a window | `HQ_BREAK=nogate` |
| W-HQ-NEW | New is offered exactly where the role has read-write; it opens an unsaved row; 0 ops. | the active windows of the dictionary | `HQ_BREAK=nogate` |
| W-HQ-COST | The five budgets of D8 hold; the index is not made at page load. | the `§HQ_*` log lines | `HQ_BREAK=eager` |
Kept green throughout (existing): W-HELP-SHOWCASE, W-ERP-ASK, W-HOWTO, W-HELP-DOCK, W-HELP-DOCK-M, W-CLASS-HELP, W-RED1-ASSIST.

---

## 6. Build order (each step one PR; spec section first, then code)
1. **The grammar.** `common/help/help_grammar.js` + W-PREFIX (box side). Small and already agreed; nothing calls it yet. (Needs owner question 1 answered only if `/` is to be added.)
2. **The core and the ERP index.** `help_query.js`, the builder, the ERP adapter, `index.json` for en_US and the four pack languages. Not wired. Witnesses: GENERIC, SELF, WORDS, BM25, RANK-TWIN, COST (build lines).
3. **Wire the ERP box and `erp.ask`.** Both call the core. **Deletion budget:** from `erp/help_search.js` remove the ranking loop, `pairs()`, the `STOP` list, the shared-word window fallback and the `+100` bonus; state lines + / −. The card stays. Witnesses: LEGACY-SUPERSET, COST (query lines); W-HELP-SHOWCASE and W-ERP-ASK stay green.
4. **Viewer and Modeller.** Two adapters; `help_panel.js` `renderList` calls the core and its substring filter is deleted. W-HOWTO, W-HELP-DOCK, W-HELP-DOCK-M stay green; RANK-TWIN gains the BIM names.
5. **Did you mean.** The separate line through `AssistCore.nearest`. W-HQ-DYM. If §42 S3 has merged, without the 2-character guard; else with it, and a one-line follow-up removes it.
6. **Actions.** `#<number>` and New in the box and the panel; the shell side is the CLI session's §41. W-HQ-DOC, W-HQ-NEW.
Handed to another lane, not a step here: the port of legacy's GlobalSearch box (menu tab, `/` document tab, `AD_SearchDefinition`), which D7 found missing. It calls `legacyFilter`.

---

## 7. Owner questions (three; each is a choice this design cannot derive)

**ANSWERED 2026-11-17 (owner: *"agree with you"* to Q1, *"agree with all, proceed to implement"* to Q2; full record in VOCAB_MESSAGE_CATALOG.md §18 RESULT):** Q1 = `#` in the help box and shell, `/` only in a legacy GlobalSearch port · Q2 = `#<number>` selects the IFC element in the Viewer/Modeller · Q3 = DEFAULT taken (no advice was shown): Thai after the packed languages.
1. **`/` or `#` for a document in the ERP.** Legacy iDempiere already has this feature and its key is `/` (`GlobalSearch.java:62`; `/TransactionCode text`, `DocumentSearchController.java:613-617`). `#<number>` was agreed (§16 item 7, §41) before that was read, and in the shell `/` is the path separator. Which holds for the ERP box: (a) `#` in the help box and the shell, and `/` only inside the port of legacy's own search box; (b) the ERP box accepts both, `/` exactly as legacy; (c) other?
2. **`#<number>` in the Viewer and the Modeller.** There are no documents there. Should it (a) mean nothing ("no documents in this app"), or (b) select the element with that number (an IFC file writes its entity ids as `#123`)?
3. **Thai.** D2 covers Thai by design, but there is no Thai help pack and Thai was measured in Node only (§16). Is Thai in the first build (it then needs a pack and a browser check first), or after the languages that have packs?

## STATUS
2026-11-17: DESIGN WRITTEN, nothing built, no witness run. Every D has a chosen option; UNDECIDED points are the three questions above plus: `Util.deleteAccents`'s exact range (not read), whether `ad_seed.db` has `AD_SearchDefinition` rows (not read), and all D8 numbers (budgets, to be measured in steps 2 and 3).
