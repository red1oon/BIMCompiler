---
review: machine
source_sha: 73eac880daff6273
lang: ja
---

# Fast Script ユーザーガイド

**BIM と ERP のアプリに、短いコマンドをひとつずつ、またはファイルに書いた数行を渡すと、アプリ自身の答えが返ってきます。同じ行が、端末を使うあなたにも AI にも使えます。**

これは**ひとつのドア**の案内です。ドアとは、アプリの手前に置かれた小さなスクリプトエンジンです。たとえば`modeller.lines building=HospitalGarage`のような行を書きます。ドアはその行を読み、決まった動詞の一覧と照らし合わせて確認し、アプリ自身のコードを呼び出して、確認されなかった項目と一緒に答えを返します。ドアの中に AI はありません。

![ひとつのドア。左側のアクターは同じ動詞を話します。ドアは解析し、確認し、結び付け、呼び出し、返信します。判断するのはアプリ自身のチェックです。](figs/one_door.svg)

図を左から右へ読んでください。

1. **アクター。** 行を送る主体と、行が届く経路です。現在は、ツール接続を通した AI か、端末の前にいる人です。メールボックス、電話、機器は計画中で、**まだ作られていません**。
2. **チャネル：動詞。** アクターが言えることすべての一覧です。各動詞には、わかりやすい説明、入力、そして*影響*クラス（harm）があります。一覧全体は[下記](#the-verbs)にあります。
3. **ひとつのドア：スクリプトエンジン。** 行を解析し、入力を確認し、その行を依頼した主体に結び付け、アプリを呼び出して、返信します。どのアクターも同じドアを通るので、同じ行は同じ答えになります。
4. **エンジン：アプリ。** 判断するのはアプリ自身のチェックです。新しい問題を加える変更は取り消され、その理由が返されます。

!!! warning "良い答えが意味しないこと"
    問題のない答えは、**安全、適合、良好のいずれも意味しません**。各答えには確認されなかった項目が並び、[確認されないこと](#what-is-not-checked)にもう一度まとめてあります。最終判断は構造技術者が行います。

**AI を使う新規の方へ。** AI をドアにつなぐ方法は、[AI Proposer ガイド](ProposerGuide.md#connect-your-ai)にあります。このページは、ご自身で書くコマンドやスクリプトと、返ってくる答えの読み方のためのものです。

## `red1` 早わかり

`red1`は近道の入口で、BIM と ERP のアプリに対するひとつのプロンプトです。短い言葉はそれぞれ、実行するドアの完全な行を（`→`の後に）表示するので、使いながら長い形を覚えられます。[red1 の詳しい説明](#the-red1-shell-short-words-at-one-prompt)は、このページの終わり近くにあります。

| 入力 | できること |
|---|---|
| `red1` | `red1>`プロンプトを開く（`node common/door/red1.js`、または一度`npm link`した後は`red1`） |
| `cd Duplex` · `cd Element` · `cd Order` · `cd ..` · `pwd` | 建物、その種類、または ERP の種類へ移動する。戻る。今いる場所を表示する |
| `count` · `ls` · `group storey` · `sum <column>` · `cat <id>` | ここで、数える、一覧する、まとめる、合計する、ひとつのレコードを表示する |
| `ls element_name=*bath*` | ワイルドカードで検索：`*`は任意の文字列、`?`は一文字、`[abc]`はそのうちのひとつ |
| `clash ARC MEP` · then `ls` · `ls *Bath*` | 衝突をファネルで描く。その行。一致する行 |
| `clash` | 建物の分野のメニューが開く：矢印キーまたは数字キー、そして Return |
| `next <number>` · `do complete <number>` | 伝票が今できること。それを実行する |
| `menu` · `help` · `help verbs` · `exit` | ERP メニュー。言葉の一覧。ドアのすべての動詞。終了 |
| `red1 'cd Duplex; count'` | 同じ言葉をスクリプトから、一回だけ実行 |

## ドアを入手する

Node 18 以上が必要です。この手順は Node 18.19 で実行しました。

**Modeller の動詞には六つのファイルが必要です。** 空のフォルダを作り、ブラウザエンジンをインストールして、ファイルをダウンロードします。

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

六つとも同じフォルダに置いてください。`door.js`は`verbs.json`から動詞の一覧を、`messages.json`から（`msg_core.js`を通して）メッセージを読み、`edit_cli.js`を実行し、これがライブの Modeller ページをウィンドウなしで開きます。ファイルが足りないと、ドアはどれが足りないかを知らせ、その`curl`の行を表示します。`bim_mcp.js`は AI をつなぐときだけ使います。このページのコマンドでは使いません。

**Viewer、オブジェクト、スケジュールの動詞には、完全なチェックアウトが必要です。** これらは六つのファイルには含まれません。`bim-ootb`リポジトリ全体（`git clone https://github.com/red1oon/bim-ootb`）を取得し、`node door.js`の代わりに、その最上位のフォルダから`node common/door/door.js`を実行してください。[動詞の表](#the-verbs)には、各動詞がどちらを必要とするかが書かれています。Viewer 用の一ファイル版ダウンロードは、まだ作られていません。

## 最初のコマンド

一行に動詞をひとつ、`key=value`の組を、`=`の前後に空白を入れずに書きます。HospitalGarage にグリッドを尋ねます。

<!-- run: lines cut=700 -->
```text
$ node door.js 'modeller.lines building=HospitalGarage'
{"request":"d-mwiqhn1b-3186337-1","verb":"modeller.lines","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[],"ms":15019,"model":{"grid_source":"column-derived","system":"column-framed","material":"RC","mixed":true,"girders":228,"rotation_deg":-2,"frame":"building","lines":[{"id":"gx0","axis":"x","pos":128.131,"world":132.184},{"id":"gx1","axis":"x","pos":129.223,"world":133.277},{"id":"gx2","axis":"x","pos":133.277,"world":137.334},{"id":"gx3","axis":"x","pos":133.795,"world":137.851},{"id":"gx4","axis":"x","pos":134.811,"world":138.868},{"id":"gx5","axis":"x","pos":145.987,"world":150.051},{"id":"gx6","axis":"x","pos":157.163,"world":161.234},{"id":"gx7…
```

Modeller と建物を開くので、10〜40秒かかります。表示されるのは、**エンベロープ**と呼ぶ一行の JSON です。ここでは先頭だけを示します。グリッドの線は収まりきらないほど多いためです。答えはアプリ自身のもので、`answer`の中にそのまま入っています。ここでは、建物自身のグリッド上で、`gx5`が 145.987 m、`gx6`が 157.163 m にあります。`status`は`ok`です。

!!! note "「request」はどこから来るのか"
    どの行にもリクエスト ID（`"request":"d-…"`）が付き、実行する前にジャーナルへ書き込まれます。保存先は`~/.cache/bim_door/journal.jsonl`です。同じ ID を二度送ると最初の答えが返るので、再試行で変更が繰り返されることはありません。ドアはまた、エラーストリームに`§DOOR …`の行をひとつ出力します。このガイドでは標準出力だけを示します。

## ひとつの動詞でリクエスト全体を

*「gx5 と gx6 の間のベイ（柱の間の区画）を幅 13 m にする」*のようなリクエストには、いくつかの手順があります。グリッドを読み、動かす量を求め、ずらしを試すことです。動詞`modeller.widen_bay`は、この三つをすべて行います。入力は二本の線と、希望する幅です。

<!-- run: widen -->
```text
$ node door.js 'modeller.widen_bay building=HospitalGarage from=gx5 to=gx6 target=13' > widen.json; echo "exit $?"
exit 3
```

終了コードが最初の答えです。`0`は ok、`3`はアプリが単純な「はい」ではない答えを返したこと（拒否、保留、または結論不能）、`1`はエラー、`2`は間違ったコマンドを意味します。次にファイルの中を見ましょう。最初にリクエスト全体があり、続いて二つの手順が、それぞれ自分のエンベロープとともに並びます。

<!-- run: widen_steps cut=200 -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' widen.json
"request":"d-mwiqhyza-3186904-1","verb":"modeller.widen_bay","actor":"human","status":"refused"
"request":"d-mwiqhyza-3186904-1.1","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwiqhyza-3186904-1.2","verb":"modeller.try_shift","actor":"human","status":"refused"
```

最初の手順でグリッドを読みました。今のベイは次のとおりです。

<!-- run: widen_read -->
```text
$ grep -o '"id":"gx[56]","axis":"x","pos":[0-9.]*' widen.json
"id":"gx5","axis":"x","pos":145.987
"id":"gx6","axis":"x","pos":157.163
```

つまり、ベイは 157.163 − 145.987 = **11.176 m** です。13 m にするには、線`gx6`とそれ以降のすべての線を **1.824 m** 動かす必要があります。ドアがそれを計算し、二番目の手順に渡しました。

<!-- run: widen_move -->
```text
$ grep -o '"move":[0-9.]*' widen.json | head -1
"move":1.824
```

アプリはずらしを試し、確認して、**止めました**。

<!-- run: widen_why -->
```text
$ grep -o '"why":"[^"]*"' widen.json | tail -1
"why":"line 2 (modeller.try_shift): stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m"
```

変更は行われ、判定され、取り消されました。保存されるものは何もありません。止めた根拠の数字は、アプリのレポートにあります。

<!-- run: widen_bay -->
```text
$ grep -o '"bay":"gx5-gx6"[^}]*' widen.json
"bay":"gx5-gx6","before":11.176,"after":13,"newly_over":true
```

ベイは 11.176 m から 13 m になり、この建物のコンクリート梁の上限 12 m を超えました（`limit`と`material`は建物自身から取得します）。これが Garage のリクエストの顛末のすべてです。13 m のベイには、もう一本の柱の列が必要です。

## スクリプト：複数の行、名前付きの結果 {#a-script-several-lines-a-named-result}

スクリプトは、一行にひとつのコマンドを書いたテキストファイルです。行は**名前**と`=`で始めることができ、その答えを下の行のために取っておけます。`--`以降はコメントです。次を`bay.door`として保存してください。

<!-- file: bay.door -->
```text
-- read the grid, then widen the bay between gx5 and gx6 to exactly 12 m
lines = modeller.lines building=HospitalGarage
modeller.try_shift building=HospitalGarage line=gx6 move={12 - (lines.model.lines[gx6].pos - lines.model.lines[gx5].pos)}
```

`--script`で実行します。

<!-- run: script -->
```text
$ node door.js --script bay.door > bay.json; echo "exit $?"
exit 0
```

`{ }`の中のテキストは算術式です。数、`+ - * /`、かっこ、名前付きの結果のフィールドを使えます。`lines.model.lines[gx6].pos`は、「`lines`という名前の答えの、`model`の下にある、`lines`のうち id が`gx6`の項目の、`pos`」という意味です。動詞が宣言したフィールドだけを読めます。それ以外の名前はエラーになり、その旨が表示されます。

算術は浮動小数点ではなく、**正確な十進数**で行います。浮動小数点を使うコンピュータでは、`12 - 11.176 = 0.8239999999999998`となります。ドアでは次のようになります。

<!-- run: script_move -->
```text
$ grep -o '"change":{"kind":"[^"]*","grid":"[^"]*","through":"[^"]*","lines":[0-9]*,"delta":[0-9.]*' bay.json
"change":{"kind":"block-shift","grid":"gx6","through":"gx16","lines":11,"delta":0.824
```

スクリプトは上から下へ実行され、**ok でない最初の行で止まります**。ここでは二つとも`ok`と答えます。

<!-- run: script_status -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' bay.json
"request":"d-mwiqis8z-3188092-2","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwiqj50r-3188092-3","verb":"modeller.try_shift","actor":"human","status":"ok"
```

ちょうど 12 m では、アプリは新しい問題を見つけません。上限を超える梁スパンの数は、変わらないままです。

<!-- run: script_span -->
```text
$ grep -o '"label":"Beam spans over limit","scope":"[^"]*","state":"JUDGED","before":[0-9]*,"after":[0-9]*,"delta":[0-9]*' bay.json
"label":"Beam spans over limit","scope":"228 walked girders, RC (mixed building)","state":"JUDGED","before":91,"after":91,"delta":0
```

このように、同じ建物でも、13 m を求めると止められ、12 m を求めるとそのまま成り立ちます。`ok`は建物が良いという約束ではありません。同じ[確認されないことの一覧](#what-is-not-checked)が当てはまります。

### 行の文法

| 部分 | 規則 |
|---|---|
| コマンド | `app.verb key=value key=value`、一行にひとつ |
| 空白を含む値 | 二重引用符で囲む：`text="a note"` |
| 名前付きの結果 | `name = app.verb …`。後の行は`name.field`を読む |
| 算術 | `{ … }`の中に、数、`+ - * /`、かっこ、結果のフィールド。正確な十進数 |
| コメント | `--`とその行の残り |
| 単位 | 行には書かない。動詞が、メートル、時間、日のいずれかを決める |
| それ以外 | コマンドではない。アクションとしてではなく、質問として返ってくる |

最後の行は意図的です。どの動詞にも一致しないテキストは、**決して推測されません**。

<!-- run: question -->
```text
$ node door.js 'please widen the bay'
{"request":"d-mwiqjlcw-3189389-1","verb":null,"actor":"human","status":"refused","answer":{"question":"I could not read that as a command. A command is app.verb key=value … Which one do you mean? Type help.","verbs":["modeller.lines","modeller.try_shift","viewer.counts","viewer.clashes","viewer.film_path","viewer.schedule_at","viewer.schedule_compare","modeller.widen_bay","modeller.walk","object.describe","object.read","object.history","object.update","object.attach","object.count","object.list","object.sum","object.group","witness.run","witness.last","legacy.status","legacy.query","mis.column","legacy.compare","idempiere.where","mis.pack","legacy.up","legacy.refresh","legacy.witness","legacy.check","legacy.plugin","model.open","model.convert","model.addbay","model.undo","model.save","model.close","erp.process","mis.lookup","viewer.cost","erp.find","erp.actions","erp.complete","erp.void","erp.close","erp.reverse","mis.describe","mis.read","mis.list","mis.sum","mis.group","mis.new","mis.update","mis.delete","mis.load","mis.add_window","ninja.exec","ninja.workflow","mis.diff","mis.menu","ninja.rollback","ninja.export","erp.column","erp.compare","erp.pack","erp.legacy_plugin","erp.describe","erp.read","erp.list","erp.sum","erp.group","erp.new"]},"why":"not a command: \"please widen the bay\"","notChecked":[],"ops":[],"next":[],"ms":8}
```

## 返信を読む

どのアクターからのどの行にも、同じエンベロープが返ります。次の順に読んでください。

| フィールド | 意味 |
|---|---|
| `status` | `ok`、`refused`、`claim`、`error`、`inconclusive`のいずれか。最初にこれを読む |
| `why` | status が`ok`でないときの理由 |
| `answer` | アプリ自身の答え。そのまま |
| `notChecked` | チェックが対象としなかったもの。必ず先へ伝える |
| `request`、`verb`、`actor` | どの行か、どの動詞か、誰が頼んだか |
| `ops` | 書き込まれたもの（書き込む動詞の場合） |
| `next` | 予約済み。今は空 |
| `ms` | かかった時間 |

五つの status を、実際の実行結果で示します。

**ok.** アプリが答え、何も保留されませんでした。このページ最初のコマンドがその例です。それでも、`notChecked`は読んでください。

**refused.** アプリが「はい」ではない答えを返しました。上の 13 m のリクエストがその例です。試され、判定され、取り消され、`why`が理由を述べます。拒否は答えであり、失敗ではありません。コマンドではないテキストも`refused`になります（上の質問）。

**error.** 行そのものが間違っています。入力の不足、未知の動詞、種類の違う値などです。何も実行されていません。

<!-- run: error -->
```text
$ node door.js 'modeller.lines'
{"request":"d-mwiqjlky-3189400-1","verb":"modeller.lines","actor":"human","status":"error","answer":null,"why":"missing input: building","notChecked":[],"ops":[],"next":[],"ms":6}
```

**claim.** 行は理解されましたが、アクターにそれを許可する証明がないため、ドアは**それを保留して実行しません**。これは AI のための安全規則で、アクターではなく動詞から決まります。[申請とは何か](#what-is-a-claim)を参照してください。

<!-- run: claim -->
```text
$ node door.js --actor ai --request ai-1 'object.update building=Duplex kind=Element uu=abc column=Name value=x'
{"request":"ai-1","verb":"object.update","actor":"ai","status":"claim","answer":null,"why":"actor ai has proof \"local-user\", which allows read/trial verbs; object.update is writes. Held as a claim, not run. A person confirms it with: door.js --confirm ai-1","notChecked":[],"ops":[],"next":[],"ms":11}
```

**inconclusive.** アプリは判定できず、そう答えます。これが`ok`に変えられることは決してありません。ここでは、Viewer には ARC と ZZZ の組に対する衝突ルールがありません。これにはチェックアウトが必要です。

<!-- run: inconclusive -->
```text
$ node common/door/door.js 'viewer.clashes building=Duplex discA=ARC discB=ZZZ'
{"request":"d-mwiqjly7-3189440-1","verb":"viewer.clashes","actor":"human","status":"inconclusive","answer":null,"why":"the Viewer could not answer (exit 1): the Viewer says INCONCLUSIVE: no rule for ARC/ZZZ in clash_rules.json","notChecked":[],"ops":[],"next":[],"ms":19539}
```

### 申請（claim）とは何か {#what-is-a-claim}

各動詞には**影響クラス**（harm class）があります。`read`（何も変えない）、`trial`（使い捨てのコピーに対して行う変更で、判定され、保存されない）、`writes`、`posts`、`sends`のいずれかです。このクラスは動詞の一覧に一度だけ書かれているので、どのアクターも言いくるめて回避することはできません。

各アクターには証明があります。端末の前にいる人は、すべてのクラスで信頼されます。**AI** が信頼されるのは`read`と`trial`だけです。見ることと試すことはできますが、AI からの`writes`、`posts`、`sends`の動詞は、上の`object.update`の行のように、申請として保留されます。知らない送信者からのメールのように、証明がまったくないアクターは、読むことだけができます。

<!-- run: claim_email -->
```text
$ node door.js --actor email --request mail-0 'modeller.try_shift building=HospitalGarage line=gx6 move=1.824'
{"request":"mail-0","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-0","notChecked":[],"ops":[],"next":[],"ms":7}
```

保留中の申請は、実行されず、キューに入らず、失われもしません。リクエスト ID の下で、ジャーナルに残ります。ドアは、誰かの代わりに何かを承認することはありません。

### 申請を承認する

人は、保留された申請を**リクエスト ID を指定して**通します。そのため、実行される行は、提案されたとおりの行になります。誰も打ち直しません。ここでは、メールが試行の移動を求め、保留されます。

<!-- run: confirm_claim -->
```text
$ node door.js --journal claims.jsonl --actor email --request mail-1 'modeller.try_shift building=HospitalGarage line=gx6 move=0.824'
{"request":"mail-1","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-1","notChecked":[],"ops":[],"next":[],"ms":7}
```

`--claims`は保留中のものを一覧します。

<!-- run: confirm_list -->
```text
$ node door.js --journal claims.jsonl --claims | grep -o '"actor":"[a-z]*","line":"[^"]*","verb":"[^"]*","harm":"[a-z]*"'
"actor":"email","line":"modeller.try_shift building=HospitalGarage line=gx6 move=0.824","verb":"modeller.try_shift","harm":"trial"
```

`--confirm`は記録された行を、あなたとして、一度だけ実行します。

<!-- run: confirm_run cut=200 -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1
{"request":"mail-1#confirmed","verb":"modeller.try_shift","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[{"tag":"EDIT_REPORT","version":1,"change":{"kind":"bloc…
```

返信は通常のものですが、承認した申請の名前が入っています。もう一度頼んでも何も実行されません。ドアは自分の記録から答えます。

<!-- run: confirm_again -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1 | grep -o '"confirms":"[^"]*"'
"confirms":"mail-1"
```

三つの規則が成り立ちます。承認できるのは端末の前にいる人だけで、`--actor ai --confirm …`は拒否され、申請は保留のままです。アプリは承認の時点でも判断するので、提案されてから間違ったものになった行は、アプリの理由とともに拒否されます。そして AI のツール接続には、承認コマンドそのものがありません。

**これが証明しないこと。** ドアは、ローカルの端末の前にいる人を信頼します。お使いのマシンでシェルコマンドの実行を許された AI は、あなたとして行を入力できるのと同じように、`--confirm`を自分で入力できてしまいます。それが問題になる場合は、AI のアクセスをツール接続だけにとどめてください。

## 自分のスクリプトからドアを使う

上のすべては`door.js`で、AI 接続が使うものと同じファイルです。ご自分のプログラムからは、これをコマンドとして呼び出し、その JSON を読みます。終了コード（`0`、`3`、`1`、`2`）が、答えと問題のどちらを読むべきかを示し、`status`がどちらかを示します。`--actor human`が既定です。`--actor ai`にすると、ドアはその行を AI のものとして扱います。

## ものが何かを尋ねる：`object.describe`

動詞は、モデル自身が何を持っているかを尋ねることもできます。`object.describe`は**リフレクション**（自己照会）です。モデル自身の辞書を読み、ある種類のオブジェクトにどんなプロパティがあるか、どんな子タブがあるか、どんな汎用メソッドが使えるかを答えます。読むのは辞書の行だけで、要素は開きません。チェックアウトが必要で、建物のモデルが自身の辞書を持っている必要があります（Duplex は持っています）。

<!-- run: describe cut=520 -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element'
{"request":"d-mwiqkdzw-3190928-1","verb":"object.describe","actor":"human","status":"ok","answer":{"kind":"Element","table":"elements_meta","uu":"3027c2ed-8cb6-5ccb-ae8c-fd7df2eca264","key":"elements_meta_uu","highVolume":true,"properties":[{"name":"guid","label":"GUID","type":"string","mandatory":true,"updateable":false,"key":false,"parent":false,"length":255,"displayed":true,"seq":10,"fieldReadOnly":true,"allowCopy":false},{"name":"ifc_class","label":"IFC Class","type":"list","mandatory":false,"updateable":true,"…
```

`Element`はどのメソッドを使えますか。

<!-- run: describe_methods -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element' | grep -o '"methods":\[[^]]*\]'
"methods":["read","update","attach","history"]
```

未知の種類はエラーになり、モデルにある種類が一覧されます。そのため、間違って推測しても、正しい名前がわかります。

## ものを数える：`object.count`

`object.count`は「いくつあるか」に答えます。モデルがある種類のレコードをいくつ持っているかです。Duplex は部屋を`Room`という種類で持っています。チェックアウトが必要です。

<!-- run: count_rooms -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room'
{"request":"d-mwiqkfde-3190996-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[],"count":5,"population":5,"verdict":"OK","summary":"5 Room"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":614}
```

`column=value`を加えると数を絞り込めます。列はその種類のプロパティでなければなりません（`object.describe`が一覧します）。答えには、絞り込む前の数である**母数**（population）が残ります。

<!-- run: count_storey -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room storey="Level 1"'
{"request":"d-mwiqkg0w-3191055-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[{"column":"storey","value":"Level 1"}],"count":2,"population":5,"verdict":"OK","summary":"2 Room where storey = Level 1 (of 5)"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":714}
```

その種類にない列は拒否され、答えがその名前と本当の列の一覧を示します。「一致なし」と読まれることは決してありません。

<!-- run: count_badcol cut=330 -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room floor=1'
{"request":"d-mwiqkgro-3191109-1","verb":"object.count","actor":"human","status":"refused","answer":{"refused":true,"reason":"kind Room has no property \"floor\"; none is close, its properties: guid, type, name, parent_guid, object_type, predefined_type, center_x, center_y, center_z, size_x, size_y, size_z, room_guid, elevation,…
```

部屋がひとつもないモデルは、`0`とは答えません。何も数えていないので、`inconclusive`と答えます。信頼できるゼロとは、空でない母数の中で絞り込んだ数のことです。

## ウォーカーが配置するもの：`modeller.walk`

Modeller には、ひとつの分野（discipline）の取り付け部品（スプリンクラー、照明、コンセント）を、実際の建物から測ったルールで配置する*ウォーカー*があります。`modeller.walk`はその**ドライラン**で、ウォーカーが何を配置するかを答え、何も変えません。モデルのファイルは、実行の後もバイト単位で同じで、答えもそう述べます。チェックアウトが必要です。完全な返信は長いので、ここでは主な数値を示します。

<!-- run: walk_fp -->
```text
$ node common/door/door.js 'modeller.walk building=Duplex discipline=FP' | grep -o '"rules":"[^"]*"\|"count":[0-9]*,"placed":[0-9]*,"provisional":[0-9]*\|"byClass":{[^}]*}\|"modelUnchanged":[a-z]*'
"rules":"duplex_rules.db"
"count":46,"placed":0,"provisional":46
"byClass":{"IfcFireSuppressionTerminal":45,"IfcAlarm":1}
"modelUnchanged":true
```

`count`は、ウォークが配置するすべてです。`provisional`は、ウォーカー自身が「最終ではない」とする位置で、たとえば上に天井が見つからない取り付け部品です。`rules`は、建物の種別が使うルールセットです。住宅は住宅用ルールを使います。何も配置しないウォークは、ウォーカーの理由とともに`inconclusive`と答えます。

## 行と行の間で Modeller を開いたままにする：`model.open`、`model.convert`、`model.addbay`、`model.undo`、`model.save`、`model.close`

これらの行は、バックグラウンドで開いたままにしてあるひとつの Modeller ページを操作します（画面なし、CPU 上、グラフィックスカードなし）。そのため、各行は直前の行が残したものに対して働きます。`model.open sheets=<folder or a.dxf,b.dxf> type="Farming Shed"`は 2D のシートを開き、`model.convert`は 3D モデルを作り（ページ自身の Convert）、`model.addbay end=high|low`は、同じ形のベイが繰り返す建物のその端にベイをひとつ加え、`model.undo`は直前の変更を戻し、`model.close`はページを止めます。作業はすべてページ自身の関数が行います。行は人が押すものを押し、ページ自身の答えを表示します。モデルは保存するまでそのページの中にあります。`model.save`はこのフォルダの`.db`ファイルに書き込み、`model.close`は、モデルが変わっていて保存先のファイルがわかっているとき、先に保存します。これらには`bim-ootb`のチェックアウトが必要で、実行するフォルダがセッションを保持します（ファイル`.model_session.json`。ポートはこのマシンだけで待ち受け、すべてのリクエストに一回限りのトークンが付きます）。

出会う規則：`model.open`より前の行は拒否されます（"no session: model.open first"）。二回目の`model.open`、二回目の`model.convert`、Convert より前の`model.addbay`も同じです。ベイが提供されるのは、建物の種類がそれを宣言しているときだけです（Farming Shed は宣言しています）。`type=`がないとベイは拒否され、その種類にはルールの宣言がないと告げられます。シートには印（マーキング）が付いていなければなりません。図面の素のシートは関門を通りません。各行は数秒かかります（ここでは、開くのに約 6 秒、変換に 3 秒、ベイに 3 秒。もっと大きなシート一式では、変換に最長 15 秒かかりました）。**保存：** ファイルは一度だけ、`model.open … file=shed.db`か最初の`model.save file=shed.db`で指定します。保存はページ自身の Save を実行します。最初に衝突チェックが行われ（赤（RED）の衝突があると、画面上と同じく保存は止まり、何も書き込まれません）、そのあとモデルがネイティブの`.db`として書き込まれます。この小屋では保存に約半秒かかり、答えには各手順の時間が示されます。未保存の変更があってファイルがない状態の`model.close`は拒否され、セッションは開いたままです。保存するか、`model.close discard=Y`で意図的に変更を捨ててください。何も作る前の保存は、ページ自身の言葉で拒否されます。

下のブロックは、`SHED_SHEETS`で指定した、印付きの小屋のシート 9 枚のフォルダを`shed/`にコピーし、行を次々に実行します。`SHED_SHEETS`は、ご自分の印付き`.dxf`シートのフォルダに設定してください。

<!-- run: model_ses cut=200 -->
```text
$ rm -rf shed shed.db; mkdir shed; cp "$SHED_SHEETS"/*.dxf shed/; D='node common/door/door.js --list'; eval "$D 'model.convert'" | grep -E '^error:'; eval "$D 'model.open sheets=shed type=\"Farming Shed\" file=shed.db'" | grep -E '^summary:'; eval "$D model.save" | grep -E '^error:'; eval "$D model.convert" | grep -E '^summary:'; eval "$D model.save" | grep -E '^(file|bytes|elements):'; eval "$D 'model.addbay end=high'" | grep -E '^(copies_by_class|summary):'; eval "$D model.undo" | grep -E '^summary:'; eval "$D model.close" | grep -E '^closed:'; ls -l shed.db | awk '{print "shed.db bytes: " $5}'; eval "$D model.undo" | grep -E '^error:'; rm -rf shed shed.db .model_session.log
error: no session in this folder: model.open first
error: nothing is open: model.open first
closed: true
error: no session in this folder: model.open first
```

`model.addbay end=low`は、反対側の端にベイを加えます（ヒンジは別で、コピーの数は同じ 29 です）。これらの行では確認されないこと：独立した数え直しに対する費用（別のテストが行います）と、ひとつのフォルダに複数のセッションがある場合です。

## 一覧、合計、グループ化：`erp.list`、`erp.sum`、`erp.group`

`count`は「いくつあるか」に答えます。読み取り専用の動詞がさらに三つあり、「どれか」「いくらか」「それぞれいくつか」に答えます。ERP の辞書にあるどの種類にも使えます（建物のモデルには、同じ三つが`object.list`、`object.sum`、`object.group`としてあります）。チェックアウトが必要です。

`erp.list`は行を表示します。列、フィルタ、並べ替えのすべてが辞書に照らして確認されるので、間違った名前はエラーになり、本当の名前が一覧されます。`column=value`を加えると一覧を絞り込めます。`limit`で別の指定をしない限り、一覧は最大 50 行を表示し（最大 1000 まで）、答えには必ず**合計**が付くので、短い一覧が全体と取り違えられることはありません。長い一覧は`offset`でページを送ります。

<!-- run: list_orders -->
```text
$ node common/door/door.js --list 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo  DocStatus  GrandTotal
80001       CO         100.7
80001       CO         100.7
800002      CO         2160
shown 3 of 14
```

`erp.sum`は数値の列を正確に合計します。小数は小数のまま加算され、浮動小数点にはならないので、金額がずれません。`erp.group`は、列の値ごとにレコードを数え、多いものから順に並べます。

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

レコードがまったくない種類は、`0`や空の一覧とは答えません。何も判定していないので、`inconclusive`と答えます。

## レコードを作る：`erp.new`

`erp.new`は、ERP 自身のウィンドウが作るのと同じやり方でレコードを作ります。種類と、わかっている列を指定すると、残りはウィンドウと同じやり方でエンジンが埋めます（既定値、取引先が持ち込む選択肢、連番からの Document No（伝票番号））。辞書にない列は拒否され、返信に本当の列が一覧されます。そのあとも空の必須列があれば、名前を挙げて拒否され、何も書き込まれません。返信は`number`から始まります。これは Document No で、次に使うものです。

販売または購買の伝票には`issotrx=Y`か`N`が必要です。取引先や製品は名前で指定してもかまいません。どのレコードにも一致しない名前、または複数に一致する名前は拒否されます。明細行は、伝票を番号で指定します。

<!-- run: new_order -->
```text
$ rm -f /tmp/fast_guide_new.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101'
{"request":"d-mwiqksoh-3192036-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":"50000","kind":"Order","table":"c_order","id":1500004,"docStatus":"DR","given":["IsSOTrx","C_DocTypeTarget_ID","C_BPartner_ID","SalesRep_ID"],"defaulted":52,"filled":["ad_client_id","ad_org_id","documentno","isselfservice","dateordered","datepromised","bill_bpartner_id","c_bpartner_location_id","bill_location_id","deliveryrule","priorityrule","m_warehouse_id","isdropship","deliveryviarule","freightcostrule","freightamt","ispriviledgedrate","shippingrateinquiry","invoicerule","m_pricelist_id","c_currency_id","c_conversiontype_id","isdiscountprinted","chargeamt","paymentrule","c_paymentterm_id","totallines","grandtotal","docstatus","c_doctype_id","ispayschedulevalid","copyfrom","docaction","posted","isdelivered","dateacct","amountrefunded","isapproved","processed","processing","istaxincluded","isinvoiced","isselected","isprinted","sendemail","istransferred","iscreditapproved","isactive","processedon","amounttendered","volume","weight"],"record":{"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-16 12:01:24","createdby":101,"updated":"2026-11-16 12:01:24","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-16 00:00:00","datepromised":"2026-11-16 00:00:00","dateprinted":null,"dateacct":"2026-11-16 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":0,"grandtotal":0,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c72be278-7cf1-4062-a2c4-e0dee631a168","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}],"next":[],"ms":8305}
```

<!-- run: new_line -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'erp.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2'
{"request":"d-mwiqkza1-3192368-1","verb":"erp.new","actor":"human","status":"ok","answer":{"number":null,"kind":"Sales Order Line","table":"c_orderline","id":120002710,"docStatus":null,"given":["M_Product_ID","QtyEntered","C_Order_ID"],"defaulted":31,"filled":["ad_client_id","ad_org_id","c_bpartner_id","c_bpartner_location_id","datepromised","dateordered","line","m_warehouse_id","m_attributesetinstance_id","c_uom_id","qtyordered","qtydelivered","qtyreserved","qtyinvoiced","priceentered","priceactual","pricelist","freightamt","c_tax_id","discount","linenetamt","qtylostsales","processed","createshipment","createproduction","rramt","pricecost","pricelimit","c_currency_id","isactive","isdescription"],"record":{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-16 12:01:34","createdby":101,"updated":"2026-11-16 12:01:34","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-16 00:00:00","datepromised":"2026-11-16 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"ebc4bda0-3e8c-426b-a9cd-1829c8c56a83","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}],"next":[],"ms":9220}
```

注文は、誰かが完了するまで下書きです。明細行に注文の番号を与えたので、二番目の手順なしで注文の合計が追随します。下のレコードの`totallines`と`grandtotal`は、明細行の金額（6）です。注文自身の明細行の一覧は、`erp.read`では埋められません。

<!-- run: new_read -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js --list 'erp.read kind=Order number=50000'
kind: Order
uu: 1500004
record: {"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-16 12:01:24","createdby":101,"updated":"2026-11-16 12:01:24","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"2026-11-16 00:00:00","datepromised":"2026-11-16 00:00:00","dateprinted":null,"dateacct":"2026-11-16 00:00:00","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":6,"grandtotal":6,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"c72be278-7cf1-4062-a2c4-e0dee631a168","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null}
children: [{"kind":"Sales Order Line","rows":[{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-16 12:01:34","createdby":101,"updated":"2026-11-16 12:01:34","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"2026-11-16 00:00:00","datepromised":"2026-11-16 00:00:00","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"ebc4bda0-3e8c-426b-a9cd-1829c8c56a83","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null}]},{"kind":"Order Tax","rows":[]},{"kind":"Order Payment Schedule","rows":[]},{"kind":"POS Payment","rows":[]}]
```

`erp.new`は`writes`の動詞です。端末の前にいる人が実行します。AI の`erp.new`は申請として保留され、人が承認するまで何も書き込まれません（「申請とは何か」を参照）。これらのブロックは一時的な op-log（`/tmp/fast_guide_new.ops`。最初に空にします）を使うので、実行してもご自身のデータには触れません。

## どのテーブルでも使う：`mis.*`の動詞

**MIS が土台です。ERP は、MIS に伝票の一生を足したものです。** レコードの一覧、読み取り、作成、変更、削除、読み込みは、辞書のどのテーブルでも同じです。顧客でも、製品でも、ご自分で作ったテーブルでも変わりません。これらの動詞は`mis.*`と呼ばれます。伝票だけが持つもの（完了、無効化、クローズ、取り消し）は`erp.*`のままです。古い名前の`erp.list`、`erp.read`、`erp.describe`、`erp.sum`、`erp.group`、`erp.new`も引き続き使えます。それぞれが`mis.*`の動詞の古い名前で、同じ答えを返すので、以前に書いたスクリプトは変更不要です。

書き込む`mis.*`の動詞はすべて、ERP 自身のウィンドウと同じことを行います。足もとのデータベースを直接編集することはありません。既定値とコールアウトが働き、チェックが働き、拒否には理由が付き、何かが拒否されたときは何も書き込まれません。

**まだ何が足りないか。** `mis.new … dry=Y`は、保存以外のすべてを実行し、何も書き込みません。既定値のあとでまだ空の必須列がどれかを答えるので、何を与えればよいかがわかります。

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

**作成、変更、読み取り。** 別のレコードを保持する列は、名前で指定できます。`mis.list … names=Y`は、ウィンドウのグリッドと同じように、そうした列を名前で表示します。

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
record: {"c_bpartner_id":1600010,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"2026-11-16 12:01:52","createdby":101,"updated":"2026-11-16 12:01:52","updatedby":101,"value":"GD100","name":"Guide Partner One","name2":null,"description":null,"issummary":"N","c_bp_group_id":103,"isonetime":"N","isprospect":"N","isvendor…
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

`mis.update`は、あなたが指定した列だけを送ります。レコードがすでに持っている値を与えても何も変わらず、答えは`noop`と告げます。ウィンドウが人に編集させない列（読み取り専用のフィールド、または完了した伝票のどの列でも）は拒否され、答えはその規則を挙げます。列を空にするには、値に`<null>`を使います。

**別のレコードを指す列**（取引先、製品、倉庫）は、存在し、かつあなたの会社が使えるレコードを指していなければなりません。`mis.new`はそうした列をすべて、`mis.update`は変更した列を確認し、間違っているものは、レガシー ERP 自身の言葉で拒否されます。たとえば`Cannot save record in C_Order: Foreign ID 999999 not found in C_BPartner_ID`や、別の会社のレコードに対する`Cross tenant ID … not allowed in …`です。ルックアップの検証ルール（ウィンドウが提示する一覧）の外の値は、拒否されません。そのルールはウィンドウが何を提示するかを決めるだけなので、レガシー ERP もそれを保存します。

**削除。** `mis.delete`は、ウィンドウの Delete（削除）です。ウィンドウが拒否するものを、エンジン自身の言葉で拒否し、何も書き込みません。標準の取引先は、ほかのレコードに使われています。

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

**CSV からまとめて読み込む。** `mis.load`は`.csv`（最初の行が列名で、一行にひとつのレコード）を読み、ERP 自身の Migrate Excel Data（Excel データの移行）プロセスをそれに対して実行します。このプロセスは「すべてか、何もしないか」なので、`mis.load`はまず**確認**し（`dry=Y`が既定）、何も書き込みません。行を数え、不良の行をひとつずつ挙げます。ご自分のファイルの隣に、`….rejected.csv`（不良の行とその理由）と`….ok.csv`（良い行）を書きます。

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

元のファイルを`dry=N`で読み込むと、不良の行がある間は拒否されます。不良の行を直すか、良い行を読み込んでください。これは別の「すべてか、何もしないか」の読み込みです。

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

AI の`mis.new`、`mis.update`、`mis.delete`、`mis.load`は、`erp.new`と同じく申請として保留されます。人が承認するまで何も書き込まれません。既存のレコードの一括更新は提供されていません。ウィンドウのチェックが働くように、レコードごとに`mis.update`を使ってください。

### ロールとしてレコードを見る・変更する

どの`mis.*`の動詞も`role=`を受け付けます。ERP のロールの id です。**ロールがなければ何もフィルタされません：** すべてのクライアントのすべてのレコードが見えます。ロールを指定すると、そのロールが付与されているウィンドウで得られるものが得られます。つまり、そのロール自身のクライアントと組織のレコードで、しかもアクセス行が許すレコードと列だけです。合計も、それらのレコードだけを数えます。ロールは行の中に明記します。サインインではありません。

<!-- run: mis_role -->
```text
$ for r in '' ' role=103' ' role=12000'; do BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list "mis.sum kind=C_Order column=GrandTotal$r" | grep -E '^(n|sum):' | tr '\n' ' '; echo; done
n: 43 sum: 74936.76 
n: 8 sum: 9914.07 
n: 27 sum: 55108.62
```

ロールのレコードの外にあるレコードは、存在しないレコードとまったく同じ答えになります。ロールが読み取りしかできない列は、変更できません。ロールがウィンドウを持たない種類は拒否されます。ロール 103 には、Tax を表示するウィンドウがありません。

<!-- run: mis_role_refuse cut=200 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_Tax role=103'
refused: true
reason: role 103 (GardenWorld User) is not granted a window that shows Tax (AD_Window_Access)
```

まだ判定されない規則が五つあり、そのひとつを使うロールは、半端に確認されるのではなく拒否されます。レコードの個人ロック、テーブルの検証ルール、組織がユーザーから決まるロール、組織ツリーの要約組織を持つロール、そして「従属エンティティ」のレコードアクセスです。`mis.load`はロールを受け付けません。

## 自分のテーブルを作る：`mis.add_window`

スプレッドシートで管理しているテーブルは、本物のウィンドウにできます。テーブル、フォーム、メニュー項目、ロールのアクセスが、コードを一行も書かずに揃います。列を小さな`.csv`に、一列につき一行で記述します。必須なのは`Column`だけです。キー、クライアントと組織、有効フラグ、監査用の列は自動で追加されます。

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

一行でウィンドウができます（この行を単独で実行できるように、シートはここでもう一度書き出しています。`common/`を含むフォルダから実行してください）。テーブルの名前はファイル名から付きます。`dry=Y`はシートを確認し、何も書き込みません。不備のあるシートは、すべての不備とその行とともに拒否され、何も書き込まれません。

<!-- run: win_add cut=200 -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; rm -f /tmp/fast_guide_win.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list 'mis.add_window file=AST_Asset.csv' | grep -E '^(table|window|columns|lists|ops):'
table: AST_Asset
window: {"id":7100001,"name":"AST Asset"}
columns: ["Name","PurchaseDate","Cost","Condition","IsInsured"]
lists: [{"column":"Condition","values":["GOOD","FAIR","POOR"]}]
ops: 47
```

新しい種類は、すべての`mis.*`の動詞でただちに使え、`mis.js`でも使えます。必須列は要求され、既定値は埋められ、シートの一覧にない値は拒否されます。

<!-- run: win_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list'; eval "$D 'mis.new kind=AST_Asset Name=Tractor Cost=1200.50'" | grep -E '^(number|filled):'; eval "$D 'mis.new kind=AST_Asset Cost=5'" | grep reason; eval "$D 'mis.new kind=AST_Asset Name=Plough Condition=BAD'" | grep reason; eval "$D 'mis.list kind=AST_Asset columns=Name,Cost,Condition'"; rm -f AST_Asset.csv
number: Tractor
filled: ["ad_client_id","ad_org_id","isactive","condition","isinsured"]
reason: mandatory and still empty after the defaults and callouts: Name (give them as column=value)
reason: Condition Invalid value - BAD - Reference_ID=9541005 - FAIR - GOOD - POOR; nothing was written
Name     Cost    Condition
Tractor  1200.5  GOOD
shown 1 of 1
```

型は String、Quantity、Amount、YesNo、Date、DateTime、Text、List です。名前が`_ID`で終わる列はそのテーブルへのルックアップで、`Is`で始まる列は yes/no です。マスターの下に付く明細テーブルにはワークブックが必要です。次の節で説明します。

## ひとつの行でワークブック全体を：`ninja.exec`

`.csv`からひとつのテーブルを作るのは、小さなケースです。**Ninja ワークブック**は、多くのテーブルを一度に保持し、どのテーブルがどのテーブルの下にあるかを示し、最初の行を持たせることもできます。一行ですべてができます。

ワークブックは普通のスプレッドシートファイル（`.xlsx`または`.xls`）です。

| シート | 保持するもの |
|---|---|
| `1_RO_ModelHeader` | セット全体の名前。`Name`の下の最初のセルに書く |
| `2_RO_ModelMaker` | テーブルごとに一行：`Master`（そのテーブルが下に付く先。なければ空）、`Name`（テーブル）、`ColumnSet`（その列。コンマで区切る） |
| テーブル名とまったく同じ名前のシート | 読み込む行。1 行目に列名を書く |

`ColumnSet`では、ただの名前はテキストです。接頭辞を付けると別の型になります。`D#`は日付、`A#`は金額、`Q#`は数量、`T#`は長いテキスト、`Y#`は yes/no、`L#Name=a/b/c`は固定値の一覧です。`Master`がワークブック内の別のテーブルであるテーブルは、そのテーブルのウィンドウのタブになります。

練習用のワークブックがドアに同梱されています。`common/door/samples/Ninja_Practice.xlsx`です（患者、患者の診察、診察で出す薬、部屋、そして Business Partner（取引先）の下に付く紹介状）。`dry=Y`は、それを読み、何が作られるかを答え、何も書き込みません。

<!-- run: nx_dry cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_ninja.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list 'ninja.exec file=Ninja_Practice.xlsx dry=Y' | grep -E '^(bundle|tables|dataSheets|skipped|dry):'
bundle: Practice
tables: [{"table":"PR_Patient","master":null,"columns":4,"lists":["BloodGroup"]},{"table":"PR_Visit","master":"PR_Patient","columns":5,"lists":[]},{"table":"PR_Medicine","master":"PR_Visit","columns":3,"lists":[]},{"table":"PR_Roo…
dataSheets: [{"sheet":"PR_Patient","rows":3},{"sheet":"PR_Room","rows":2}]
skipped: []
dry: true
```

`dry=Y`を付けずに同じ行を実行すると、実際に作られます。ウィンドウ、タブ、一覧、メニュー項目、ロールのアクセス、そしてデータのシートの行です。もう一度実行しても、何も書き込まれません。

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

すべてのテーブルは、`mis.*`の動詞でただちに使えます。マスターの下のレコードは、マスターの id を指定します（そのマスターを`mis.read`すると、その下にあるものが表示されます）。一覧にない値は拒否されます。

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
reason: BloodGroup Invalid value - Z - Reference_ID=9541005 - A - AB - B - O; nothing was written
```

**すでにあるテーブル。** ワークブックが、システムにすでにあるテーブルを指定したときは、何も二重には作られません。シートがそのテーブルに`Master`を与えていれば、そのテーブルは再利用されます。シートの列がそれに追加され、そのマスターの下のタブになります。シートが`Master`を与えていなければ、その行はそのままにされます。答えは両方を一覧します（`reused`、`leftAlone`）。これは iDempiere の Ninja が行うことです。再利用されたテーブルは自身の規則を保つので、そのレコードは、そのテーブル自身の必須列も埋めなければなりません。

ふたつのウィンドウに表示されるテーブルは、`window=`（その名前または id）で別のウィンドウを指定しない限り、そのテーブル自身のウィンドウを通して書き込まれます。もう一方のウィンドウに属する列を拒否した場合、どのウィンドウを指定すべきかが告げられます。

**すでにあるウィンドウのタブ。** `Master`は、ワークブックのテーブルである必要はありません。システムにすでにあるテーブルを指定すると、あなたのテーブルは、そのテーブルのウィンドウのタブになります。すでにあるタブの後ろに置かれ、独自のウィンドウやメニュー項目はできません。練習用ワークブックは、一行でこれを行います。`PR_Referral`の`Master`は`C_BPartner`なので、紹介状は Business Partner ウィンドウのタブになります。これも iDempiere の Ninja の規則です。

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

拒否されるもの（何も書き込まれません）：別のワークブックが作ったテーブルを指定する二つ目のワークブック、すべてのテーブルがすでにあり、マスターがないワークブック、ワークブックにも、ここにウィンドウのあるテーブルにも含まれない`Master`、そして知らない接頭辞のある`ColumnSet`です。名前がテーブルの名前と完全には一致しないシートは、読み飛ばされ、答えにその名前が挙がります。答えの`notChecked`には、判定されなかったものが一覧されます。

### 普通の CSV からひとつのテーブル：`ninja.exec file=<Table>.csv`

ワークブックの代わりの`.csv`は、ヘッダーがモデルになるひとつのテーブルで、古い Ninja が読むのと同じやり方で読まれます。テーブルはファイルの名前です（`table=`で別の名前を指定できます）。各ヘッダーのセルは、名前から型を決められ、最初に当てはまる規則が使われます。`Date`を含む → 日付、`Qty` → 数量、`Amount` → 金額、`Is`または`In`で始まる → Yes/No（したがって`Income`も、古い Ninja と同じく Yes/No になります）、`_ID`で終わる → ルックアップで、そのセルはレコードの Name、`=`と`/`を含む（`Plan=Basic/Gold`） → 一覧、それ以外 → テキスト。`C_BPartner_ID>Value`や`Code=X`のようなセルは、`>`や`=`の前の列を作ります。行がレコードです。テーブルとその行は一緒に作られます。ひとつでも読み込めない行があれば、何も作られず、答えにその行が挙がります。最初の二つの列がすでにある行は読み飛ばされるので、同じファイルをもう一度実行しても何も書き込まれず、行が増えたファイルでは新しい行だけが加わります。すでにあるテーブルに対しては、ファイルは行を加えるだけで、そのテーブルの列ではないヘッダーは拒否されます。

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

### テーブルに伝票の列を与える：`ninja.workflow`

機能は、あとから、ひとつのテーブルについて、ワークブックに触れずに有効にできます。`ninja.workflow`は、テーブルに五つの伝票列（`DocStatus`、`DocAction`、`Processed`、`DocumentNo`、`IsApproved`）を、その一覧と既定値とともに与え、そのタブに表示し、すでにあるレコードを埋めます。まず確認し、足りないものだけを加えるので、二回目の実行では何も書き込まれません。

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

そのようなテーブルで*完了（Complete）*が何をするかは、まだ答えません。答えの`notMade`が、まだ足りないものを挙げ、それまでは`erp.complete`が、わかりやすい言葉で拒否されます。システムに最初からあるテーブルは拒否されます。

### バンドルを元に戻す、ワークブックとして書き戻す：`ninja.rollback`、`ninja.export`

二つの行で、ワークブックの輪が閉じます。`ninja.rollback bundle=<name>`は、ひとつのワークブックが作ったすべて（そのウィンドウ、タブ、フィールド、列、テーブル、メニュー項目、そしてバンドル自身のメニューノード）を、ログのひとつのグループとしてまとめて無効にします。古い Ninja と同じく、レコードを持つテーブルがあると実行が止められ、そのテーブルとレコード数が挙げられます。`dry=Y`は、何が無効になるかを答えます。システムに最初からあるテーブルは自分自身を保ち、バンドルが加えたものだけを失います（Business Partner のタブはなくなり、Business Partner は残ります）。二回実行すると、二回目は何も書き込みません。そのあとで同じワークブックに`ninja.exec`を実行すると、バンドルが戻ります。`ninja.export`は、バンドル、ウィンドウ、またはテーブルを、`ninja.exec`が読めるワークブックとして書き戻します。テーブル、`Master`の結び付き、型付きの列、各一覧の値です。シートを編集して、もう一度実行できます。あるいはモデルをファイルとして別のマシンへ運べます。書き出すのはモデルだけで、行は決して書き出しません。すでにあるファイルは決して上書きされません。選択子（`bundle=`、`window=`、`table=`）がひとつ必要です。

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

エクスポートで持ち出されないもの：検証ルールとコールアウト（ステージャーはそれらをモデルに書き込んだことがありません）。ロールバックは行を無効にするだけで、削除はしないので、ログは履歴を保ちます。

## ひとつのレコードの下のレコードと、テーブルと照らし合わせるシート：`master=`、`mis.diff`

`mis.list`、`mis.sum`、`mis.group`の`master=Table/record`は、そのレコードの下にある行、つまりその下のタブが表示する行だけを残します。`mis.list kind=PR_Visit master=PR_Patient/Aminah`は、Aminah の診察です。スラッシュの後ろのレコードは、`mis.update number=`が読むのと同じように読まれる id、Document No、Name、または Value です。答えは、ふつうのフィルタ`PR_Patient_ID=1`と同じです。マスターの下のタブではないテーブルは、理由とともに拒否されます。存在しないレコードや、ふたつのレコードが共有している名前も同様です（その場合は id を指定してください）。何も下にないレコードは、空の質問ではなく、本当のゼロです。

`mis.diff kind=<table> file=<sheet.csv>`は、読み込む前に、シートをテーブルと比べ、何も書き込みません。シートの各行は、その Document No、なければ Name、なければ Value で照合され（`key=`で別の列を指定できます）、答えはそれらを分類します。`new`（そのキーを持つレコードがない）、`changed`（列が違う。保存された値とシートの値の両方が表示される）、`same`、そして`missing`（シートが言及していない有効なレコード）です。シートの中で繰り返されたキー、複数のレコードに一致するキー、キーのない行は、別に名前が挙げられ、比較されません。数値は数として等しいかが判定され（`1200.50`と`1200.5`）、日付は保存された日付と等しいかが判定され、ルックアップのセルは、保存された id が指すレコードの名前で比較されます。`mis.load`がその名前を見つけられるかどうかは、ここでは尋ねません。それは`mis.load dry=Y`が行います。

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

`mis.diff`が比較しないもの：シートが名前を挙げていない、テーブルの列です。キーはひとつの列です。二階層上のマスター（薬の患者）は拒否されます。それは薬のタブの親ではないからです。

### MIS の行のファイルを、まず試す：`--script … --dry`

繰り返したい設定（ワークブック、その最初のレコード、チェック）は、`--script`で実行する行のファイルです。[スクリプト](#a-script-several-lines-a-named-result)と同じく、ok でない最初の行で止まり、それ以降の行は実行されません。`--dry`を付けると、ファイル全体をまず試せます。ファイルは、op-log（`BIM_OBJECT_OPLOG`でその名前を指定する必要があります）とこのフォルダのファイルの使い捨てコピーの上で実行されるので、あとの行は、本番とまったく同じように、前の行が作ったものを見て、本番と同じ答えを得ます。最後にそのコピーは削除され、あなたの op-log、ファイル、ジャーナルは元のままです。サブフォルダのファイルはコピーされません。op-log の外で動く行（Modeller のセッション、レガシーサーバー、パック）は止められないので、ドライランでは拒否され、ファイルはそこで止まります。

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

## チートシート：MIS の行を練習する

ここにあるのはすべて、**ご自分のコピー**上の練習です。最初の行が、あなたの操作を保持するファイルを指定し、本物の会社の帳簿には何も届きません。そのファイルを削除すれば、何もないところからやり直せます。`common/`のあるフォルダ（`bim-ootb`のチェックアウト）から、行を実行してください。

| 手順 | これを入力 | 得られるもの |
|---|---|---|
| 準備 | `export BIM_OBJECT_OPLOG=~/practice.ops` | 以下のどの行も、その作業をこのファイルに保存する |
| やり直し | `rm -f ~/practice.ops` | 再び空の練習状態 |
| 入力を短くする | `alias d='node common/door/door.js --list'` | 以後、行は`d '<verb> <inputs>'`になる |
| 何があるか尋ねる | `d 'help all'` | すべての動詞とその入力 |
| 五つのテーブルを作る | `cp common/door/samples/Ninja_Practice.xlsx . ; d 'ninja.exec file=Ninja_Practice.xlsx'` | 患者、診察、薬、部屋、紹介状。患者 3 人と部屋 2 室を読み込み済み |
| 作る前に試す | `d 'ninja.exec file=Ninja_Practice.xlsx dry=Y'` | 何が作られるか。何も書き込まれない |
| ひとつのテーブルを作る | `d 'mis.add_window file=AST_Asset.csv'` | 列を書いた`.csv`からひとつのウィンドウ（上の節） |
| 一覧 | `d 'mis.list kind=PR_Patient'` | 行 |
| 一部の列を一覧 | `d 'mis.list kind=PR_Visit columns=Name,Fee'` | その列だけ |
| 何を持てるか | `d 'mis.describe kind=PR_Patient'` | その列、型、一覧 |
| 追加 | `d 'mis.new kind=PR_Patient Name=Devi BloodGroup=O'` | 新しいレコードとその id |
| マスターの下に追加 | `d 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'` | 患者 1 の診察 |
| もう一段下に追加 | `d 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'` | 診察 1 の薬 |
| 下にあるものと一緒に読む | `d 'mis.read kind=PR_Patient id=1'` | 患者とその診察 |
| 変更 | `d 'mis.update kind=PR_Patient id=1 BloodGroup=AB'` | 変更されたレコード |
| 拒否を見る | `d 'mis.update kind=PR_Patient id=1 BloodGroup=Z'` | 拒否：`Z`は一覧にない |
| 削除 | `d 'mis.delete kind=PR_Room id=2'` | レコードが消える |
| 合計 | `d 'mis.sum kind=PR_Visit column=Fee'` | 合計 |
| 列でまとめて数える | `d 'mis.group kind=PR_Patient by=BloodGroup'` | 値ごとの数 |
| 多くの行を読み込む | `d 'mis.load kind=PR_Room file=rooms.csv'` | プレビュー。読み込むには`dry=N`を加える |
| 画面で作業する | `node common/door/mis.js kind=PR_Patient` | キーで動く一覧。`+`で追加、Enter で編集 |
| 別のロールとして | 行に`role=102`を加える | そのロールが見られること、できること |
| システムのテーブルの下に追加 | `d 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'` | 取引先 112 の紹介状（Business Partner ウィンドウのタブ） |
| テーブルに伝票の列を与える | `d 'ninja.workflow table=PR_Visit'` | すべての診察に status（`DR`）が付く。古いものも新しいものも |
| ワークブックのバンドルを戻す | `d 'ninja.rollback bundle=Practice'` | 作ったものすべてが無効になる（テーブルにレコードがある間は止められる）。先に`dry=Y` |
| バンドルをワークブックとして書き戻す | `d 'ninja.export bundle=Practice file=Practice_out.xlsx'` | モデル。編集してまた実行できる |
| ひとつのレコードの下 | `d 'mis.list kind=PR_Visit master=PR_Patient/1'` | 患者 1 の診察だけ。`mis.sum`と`mis.group`でも使える |
| 読み込む前にシートを比べる | `d 'mis.diff kind=PR_Patient file=patients.csv'` | new、changed、same、missing の行。何も書き込まれない |
| Modeller を開いたままにする | `d 'model.open sheets=shed type="Farming Shed" file=shed.db'`、続いて`d model.convert`、`d 'model.addbay end=high'`、`d model.undo`、`d model.close` | 2D のシートが 3D になり、ベイがひとつ加わって取り消される。各行は数秒。close で shed.db に保存 |
| いまモデルを保存する | `d model.save`（最初のときは`d 'model.save file=shed.db'`） | 衝突チェックのあと、shed.db を書き込む。赤（RED）の衝突がある間は拒否 |
| 保存せずに閉じる | `d 'model.close discard=Y'` | 変更を意図的に捨てる（保存先ファイルがないとき、ふつうの close は拒否される） |
| ファイル全体をまず試す | `node common/door/door.js --list --script setup.door --dry` | 各行の本当の答え。何も残らない（`BIM_OBJECT_OPLOG`が必要） |
| CSV からひとつのテーブル | `d 'ninja.exec file=CL_Client.csv'` | ヘッダーからテーブルができ、その行が読み込まれる。もう一度実行すると新しい行だけが読み込まれる |
| 画面でメニュー | `d menu`（または`d 'menu role=102'`） | ERP メニュー。Enter でウィンドウの一覧を開き、Esc で戻り、`/`で検索 |
| メニュー項目を探す | `d 'mis.menu role=102 find=partner'` | 名前に "partner" を含む項目と、そのフォルダ |
| 別のウィンドウで作業する | `mis.new`、`mis.update`、`mis.delete`に`window=<name or id>`を加える | ふたつのウィンドウに表示されるテーブルについて、そのウィンドウのタブのフィールド |

**速度。** 大きなワークブックのあと、ドアは op-log が作ったものの画像を保持するので、後の行はすべての操作をもう一度適用しません。これが使われるのは、あなたの op-log ファイルが以前とまったく同じ内容で始まっている間だけで、`ERP_OPIMAGE=off`でオフにできます。

ご自分のワークブックの場合：練習用ファイルをコピーし、`2_RO_ModelMaker`の行をご自分のテーブルに変えます（`MY_`のようなご自分の接頭辞を付けると、すでにあるテーブルと区別できます。システムにすでにある名前は、二重に作られず再利用されます）。そして、先に`dry=Y`を付けて`ninja.exec`を実行してください。この表の行は、上の節で実行して見せた動詞です。表自体はこのページのテストでは再実行されません。再実行されるのは灰色のブロックです。

## 端末で作業する：`mis.js`

入力するより選びたい場合は、`mis.js`がポインターの付いた一覧を表示します。これは単なる入口です。どのキーも、上のドアの行の**ひとつ**にコンパイルされ、同じドアを通って実行され（ジャーナルへの記録と申請のチェックを受けます）、画面は実行する前にその行を表示します。上下キーでポインターが動きます。左右キーは、指している行のボタンの上を動きます（レコードでは`[U Edit] [D Delete] [C Copy]`。伝票では、エンジンが今許すアクション、たとえば`[C Complete] [V Void]`で、完了したあとは Delete がありません）。Enter は強調表示されたボタンを実行します。`+`は新しいレコードを始め、Delete は`y/N`を尋ね、Esc は何も書き込まずに戻ります。

端末では、矢印キーで描画します。`--plain`を付けると、パイプからキー名を読むので、スクリプト、スクリーンリーダー、AI にも、人が見るのとまったく同じものが見えます。

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

コマンドに`role=103`を加えると、画面が送るすべての行にそのロールが付き、見出しの行にその名前が出ます。ロールがなければ、見出しの行には何もフィルタされていないと表示されます。

フォームが尋ねるのは、エンジンが埋められないことだけです（上のドライラン）。入力するとそのフィールドが埋まり、Tab か Enter で次へ進み、最後のフィールドで Enter を押すと、実行される一行が表示されます。`=`で始まる行は、入力したテキストです。ここでは、セッション全体を、実行されたドアの行に絞って示します。

<!-- run: mis_form cut=200 -->
```text
$ printf '+\n=GD300\nTab\n=Guide Four\nEnter\ny\nEsc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner value=GD300 --plain 2>/dev/null | grep '^->'
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
-> mis.new kind=C_BPartner dry=Y
-> mis.new kind=C_BPartner Value=GD300 Name="Guide Four"
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
```

編集も同じように動きます。ウィンドウが人に編集させる列だけを表示し、ルックアップは名前で表し、変更したものだけを送ります。コピーは、指しているレコードから新しいレコードを始めるので、一意でなければならないものは変更してください（重複は拒否され、入力は残ります）。`MIS_SESSION_FILE=session.door`を設定すると、端末のセッションは、実行した行を一行ずつ、読んでも再実行してもよいスクリプトとして記録します。

### 画面でメニュー：`menu`と`mis.menu`

`node common/door/door.js menu`（チートシートのエイリアスでは`d menu`、red1 シェルでは`menu`）は、端末で ERP のメニューを開きます。ブラウザの ERP が表示するのと同じメニューで、フォルダも同じ順序です。ロールを加える（`d 'menu role=102'`）と、そのロールが開けるものだけが見えます。上下キーか番号で項目を選び、Enter でフォルダ、またはウィンドウの一覧画面（上の`mis.js`の画面で、ウィンドウの最初のタブのテーブルを表示）を開きます。Esc で上の階層に戻り、最上位では終了します。`/`で名前から項目を探し、`?`でキーの一覧を表示します。プロセス、レポート、フォームは、ブラウザの ERP で開くと表示するだけで、何も実行しません。このページのどこでもそうであるように、画面はあなたの代わりにドアの行を入力するだけで、実行する前にそれぞれを表示する（`->`の行）ので、画面で行うことは、入力することも、スクリプトに書くこともできます。

メニュー自体がドアの行で、`mis.menu [role=] [find=]`です。ここでは、入力したキーで画面を動かし（`--plain`が入力から読みます）、"partner" を探して、三番目の一致を開きます。

<!-- run: menu_screen cut=200 -->
```text
$ rm -f /tmp/fast_guide_menu.ops; printf '/\n=partner\nEnter\n3\nEsc\nEsc\nq\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_menu.ops node common/door/door.js 'menu role=102' --plain | grep -E '^(-> |key |Menu|find|> )'
-> mis.menu role=102
Menu   (role 102)   295 windows
> 1  ▸ System Admin
key /
Menu   (role 102)   295 windows
> 1  ▸ System Admin
find: _   (Enter search, Esc cancel)
key =partner
Menu   (role 102)   295 windows
> 1  ▸ System Admin
find: partner_   (Enter search, Esc cancel)
key Enter
-> mis.menu find=partner role=102
find "partner"   (role 102)   295 windows
> 1    System Admin > Data > Data Import > Import Business Partner
key 3
-> (open Business Partner Group: the list screen on C_BP_Group)
-> mis.describe kind=C_BP_Group role=102
-> mis.list kind=C_BP_Group columns=C_BP_Group_ID,Value,Name,Description names=Y limit=10 offset=0 role=102
key Esc
find "partner"   (role 102)   295 windows
> 3    Partner Relations > Business Partner Rules > Business Partner Group
key Esc
Menu   (role 102)   295 windows
> 1  ▸ System Admin
key q
Menu   (role 102)   295 windows
> 1  ▸ System Admin
```

## 答えの表示方法を選び、保存する

返信は、特に指定しない限り JSON のエンベロープです。三つのスイッチで、答えの行を、人や表計算ソフトが読める形で表示できます。ドアが記録するのは、引き続きエンベロープです。

- `--list`：桁をそろえた表。最後に`shown N of TOTAL`が付きます。ひとつのレコードだけの返信は、`field: value`の行で表示されます。
- `--csv`：行を CSV で出力します（RFC 4180：コンマ、引用符、改行を含むセルは引用符で囲まれ、数値はエンジンが返したとおりです）。
- `--out FILE`は、選んだ形式を、画面ではなくカレントフォルダのファイルに書きます。拒否、保留、または結論不能の行は、ファイルを書かず、そう告げます。

<!-- run: csv_orders -->
```text
$ node common/door/door.js --csv 'erp.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo,DocStatus,GrandTotal
80001,CO,100.7
80001,CO,100.7
800002,CO,2160
```

スクリプトでは、行の末尾に`> file`を付けると、その行の答えがスクリプトのフォルダのファイルに送られます（`>> file`は追記）。形式は名前に従います。`.csv`は CSV、`.json`はエンベロープ、それ以外は一覧です。スクリプトのフォルダの外に出るパスは拒否されます。

これらのスイッチは五つ目のファイル`render.js`にあります。ダウンロードで使う場合は、`door.js`の隣に置いてください。

```text
curl -O https://red1oon.github.io/bim-ootb/common/door/render.js
```

## ドアに尋ねる：`help`

`help`と入力すると、よく使うコマンドが、実行できる行として表示されます。`help erp`はひとつのアプリのすべての動詞を、`help erp.find`はひとつの動詞の全体（何をするか、各入力、何を変えうるか、誰が実行できるか）を、`help all`はすべてを一覧します。ヘルプは、下の表と同じ動詞の一覧から生成され、何も読まず、何も実行せず、ジャーナルにも記録されません。

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

## 開発者向け：ツインをレガシーと照合する

これらの動詞は、ERP のツインを本物の iDempiere と同じに保つ人のためのものです。bim-ootb のチェックアウトが必要で、最初の四つには、レガシーのテストスタック（docker の Postgres とパイロットサーバー）が動いていることと、その隣に iDempiere のソースがあることも必要です。一部が欠けているときは`inconclusive`と答え、どの部分かを告げます。見られなかったものについて、空の一覧や「同じ」と答えることはありません。

`legacy.status`は、スタックが動いているかを尋ねます。何も起動せず、止まっているものがあれば、それを起動するコマンドを表示します。

<!-- run: legacy_status -->
```text
$ node common/door/door.js --list 'legacy.status'
verdict: UP
postgres: {"container":"postgres","database":"idempiere_pilot","state":"ready"}
pilot: {"url":"http://localhost:8088/webui/","http":200,"state":"up"}
summary: legacy UP: postgres ready, pilot up
next: []
```

`erp.column`は「この列は誰が埋めるのか」に、ツインの辞書とレガシー側を並べて答えます。列の既定値、検証ルール、フィールドの既定値、ログインの既定値です（iDempiere は、参照先のテーブルの`IsDefault`の行を、ログイン時にコンテキストへ入れます）。両側が食い違うときは、`DIFFERENT`と、どの部分かを告げます。

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

`idempiere.where`は、iDempiere のソースから名前を探し、ファイル、行、その行のテキストを答えるので、レガシーの挙動についての主張は、その出どころを引用できます。`limit`で別の指定をしない限り 25 行を表示し、必ず合計を示します。`in=callout`は、パスにそのテキストを含むファイルだけを残します。

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

これらの隣に、さらに三つの動詞があります。`legacy.query table=c_order ad_client_id=11 limit=5`は、レガシーのテーブルから行を読みます（読み取り専用で、テーブルとすべての列はレガシーの辞書に照らして確認され、合計も必ず示されます）。`erp.compare kind=Order number=50000 legacy=50981`は、ツインのひとつのレコードと、レガシーの対応するレコードを読み、セルごとに比べます。レガシーが空でツインが既定値を持つセルには`NULL-VS-DEFAULT`というラベルが付き、その理由については何も述べません。`witness.run name=erp_new`は、ツリーからウィットネスを実行し、そのログ全体を保存し、自身の判定行（PASS、FAIL、または INCONCLUSIVE）で答えます。判定行を出さないウィットネスはエラーです。終了コードは証拠ではないからです。`witness.last`は、もう一度実行せずに、最後に記録された実行を読みます。

### レガシー iDempiere のプラグインを作る（OSGi と 2Pack）

本物の iDempiere サーバーに ERP のデータモデルを載せる人のためのものです。データモデルはワークブック（Excel）です。Application Dictionary のテーブルごとに一枚のシート（`AD_Table`、`AD_Column`、`AD_Window`、`AD_Tab`、`AD_Field`、`AD_Menu`など）があり、レコードごとに一行、最初の行が AD の列名で、各行に名前を付ける`Key`列があります。ワークブックの別の行を指すセルは`ref:<Key>`と書き、サーバーがすでに持っている行を指すセルは`existing:AD_Table:C_ProjectTask`と書きます。`Plugin`というシートが、プラグインの id、バージョン、説明を保持します。実例は BIM Document モデルで、`bim-ootb`リポジトリの`erp/plugins/models/BIM_Document.xlsx`です。

ひとつのワークブックから二つのものが作られ、両者は分けて扱われます。

| 作られるもの | 保持するもの | 置き場所 |
|---|---|---|
| **2Pack の zip** | メタデータのみ：辞書の行と、プロセスのクラス*名*。プログラムのコードはありません。パックのバージョンは一度適用されたら変更されないので、同じバージョンで行が違うものは拒否されます | プラグインの`META-INF`フォルダ。プラグインが起動するときに、iDempiere 自身のパックアクティベーターが拾います |
| **Java のモデルクラス** | ワークブックが作る各テーブルの`I_<Table>`と`X_<Table>`。iDempiere 自身のジェネレーターが書く形です | プラグインの`src`フォルダ |

ワークブックが作れないのはルールです。テーブルの伝票アクションと、プロセスのコードです。これらは、どの iDempiere プラグインでもそうであるように、プラグインの`src`フォルダに手で書きます。

ドアの動詞`erp.pack book=<workbook.xlsx> version=<x.y.z> out=<plugin>/META-INF`は、zip だけを書き、その sha256、辞書テーブルごとの行数、それが指すプロセスクラスの名前を答えます。同じバージョンと同じ行でもう一度実行すると`unchanged`と答えます。同じバージョンで編集されたワークブックは、リリース済みのパックは決して変更されないので、拒否されます。`java=<plugin>/src package=<java package>`を加えると、Java のモデルクラスも書かれます。人が実行します。AI の呼び出しは、人が承認するまで申請として保留されます。その下のスクリプトは、引き続き`node erp/tools/xlsx_pack.js`で、書き出すファイルごとに`§XLSX-PACK`の行を表示します。二つ目の動詞`erp.legacy_plugin book=<workbook.xlsx> version=<x.y.z>`は、ローカルのレガシーテスト環境での全行程を一行にしたものです。五つの行を実行し、ok でない最初の行で止まります。`legacy.up`（共有の docker Postgres が止まっていれば起動）、`erp.pack`（zip を作る）、`legacy.refresh`（基本のシードからテストデータベースを作り直し、プラグインをインストールし、サーバーを起動して、パックがインストールされるまで待つ。約二分）、`legacy.check`（ワークブックのすべての行を、テストデータベースから SQL で読み戻す）、`legacy.witness`（サーバー内のチェックをサーバーのコンソール経由で実行し、その判定と数を答える）です。各手順は単独でも実行できます。環境、そのデータベース、スクリプトは固定で、呼び出し側からは何も受け取らず、パイロットのデータベースは拒否されます。人が実行します。AI の呼び出しは、人が承認するまで申請として保留されます。

`legacy.check`は読み取り専用で、種類ごとに、いくつの行が見つかったかを、ワークブックが持つ数と並べて答えます。

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

`version=<x.y.z>`も与えると、プラグインにインストールされている 2Pack と、ワークブックから今作ったパックを比べ、違うときはそうはっきり告げます。リフレッシュは、コミットされているままのプラグインバンドルをインストールするので、バンドルを作り直すまでは両者がずれることがあります。

## ふつうのダウンロードで Viewer に尋ねる

二つの Viewer 動詞`viewer.counts`と`viewer.clashes`は、チェックアウトなしでも動きます。六つのファイルの隣に、さらに二つのファイルを置いてください。

```text
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_verbs.js
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_driver.js
```

ディスクにページのファイルがないときは、ツールは、サイトが提供している建物とともにライブの Viewer ページを、プロセッサ上の非表示のブラウザで開き、Viewer 自身の Find パネルに尋ねます。答えの`page`が、どのページが使われたかを告げます。

<!-- run: viewer_flat -->
```text
$ node door.js 'viewer.counts building=Duplex' | grep -o '"summary":"[^"]*"\|"page":"[a-z]*"'
"summary":"1119 elements: MEP 904, ARC 196, STR 19"
"page":"live"
```

約三十秒かかります。数値は提供されている建物のもので、チェックアウトにある古いコピーとは違うことがあります。スケジュールの動詞、`viewer.film_path`、オブジェクトの動詞、`modeller.walk`は、まだチェックアウトが必要です。表にそれが書かれています。

## red1 シェル：ひとつのプロンプトで短い言葉 {#the-red1-shell-short-words-at-one-prompt}

`red1`は、キーボードの前にいる人のためのドアです。`node common/door/red1.js`（またはチェックアウトで一度`npm link`した後は`red1`）と入力すると、`red1>`プロンプトが出ます。短い言葉はどれも、ドアのひとつの行になり、その行は実行される前に、`→`の後に表示されます。そのため、シェルは使いながら完全な行を教えてくれ、スクリプトや AI は、シェルなしで同じ行を実行できます。プロンプトに入力した完全なドアの行も、そのまま使えます。

`cd`は今いる場所を示すので、繰り返す必要がありません。建物（`cd Duplex`）、その種類（`cd Element`）、または ERP の種類（`cd Order`）です。プロンプトにそれが表示され（`red1 Duplex/Element>`）、`pwd`はそれをドアのキーとして表示します。一回だけの実行では、`;`が言葉を区切ります。

<!-- run: red1_lines -->
```text
$ node common/door/red1.js 'cd Duplex; cd Element; count discipline=ARC' 2>&1 | grep '^→'
→ object.describe building=Duplex kind=Element
→ object.count building=Duplex kind=Element discipline=ARC
```

プロンプトに入力した同じ言葉です（ここではパイプから与えているので、答えは描画されず、表示されます）。

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

**ワイルドカードで検索。** `*`は任意の文字列、`?`は一文字、`[abc]`はそのうちのひとつです。大文字小文字は区別されません。種類の中では、列を指定します。`ls element_name=*bath*`。同じフィルタは、すべての一覧の動詞（`mis.list`、`object.list`、`object.count`）で、建物と同じく ERP のテーブルでも使えます。ワイルドカードのない値は、これまでどおり完全一致です。

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

**衝突を描く。** 建物の中での`clash ARC MEP`は、Viewer に尋ね、答え自身の数値をファネルとして描きます（その部分が足し合わさるときだけ描画されます）。続く`ls`は、もう一度尋ねずに、同じ答えから衝突の行を一覧し、`ls *Bath*`は、どこかのセルが一致する行を残します。`clash`だけを入力すると、建物の分野のメニューが開きます（矢印キーか数字キー、そして Return。Esc で取り消し）。セッションの中では Viewer ページが開いたままなので、最初の行のあとは、衝突の答えが約一秒で返ります。

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

**伝票が次にできること。** ERP の種類の中で、`next <number>`は、エンジンが今許すアクションを描き、言葉を持つそれぞれのアクションについて、それを実行する行を指し示します。

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

`help`は言葉を一覧し、`help verbs`はドアのすべての動詞を一覧します。**JavaScript から**は、同じ動詞がひとつのオブジェクトとして、語彙から生成されます（新しい動詞に新しいコードは要りません）。

<!-- run: red1_api -->
```text
$ node -e "require('./common/door/red1.js').api().object.count({building:'Duplex',kind:'Element'}).then(e=>{console.log(e.line+' -> '+e.answer.summary);process.exit(0)})" 2>/dev/null
object.count building=Duplex kind=Element -> 1193 Element
```

**制限。** オブジェクトの言葉（`cd Element`、`ls`、`group`）には、オブジェクト辞書を持つモデルが必要です。ここにある建物のうち、持っているのは Duplex だけです。端末より長い一覧は、ページごとに止まります（Space、q）。パイプには、すべての行が渡されます。

## 動詞 {#the-verbs}

この表は、**語彙ファイル（`common/door/verbs.json`）から生成され**、テストが、動詞ごとに一致していることを確認します。AI のツールメニューが作られる元と同じ一覧です。*Harm*（影響）は上で説明しました。*Needs*（必要なもの）は、二つのダウンロードのどちらがその動詞を実行するかを示します。

<!-- GEN:verbs -->
| 動詞 | できること | 入力 | 影響 | 使える人 | 必要なもの |
|---|---|---|---|---|---|
| `modeller.lines` | グリッドを読む | `building` | read | human, ai | 6ファイルのダウンロード |
| `modeller.try_shift` | グリッド線のずらしを試す | `building`, `line`, `move` （メートル） | trial | human, ai | 6ファイルのダウンロード |
| `viewer.counts` | 要素を数える | `building`, `by` （任意） | read | human, ai | 6ファイル + Viewer の 2ファイル |
| `viewer.clashes` | 二つの分野の間の衝突を一覧する | `building`, `discA`, `discB`, `rows` （任意） | read | human, ai | 6ファイル + Viewer の 2ファイル |
| `viewer.film_path` | フィルムパスの可視性 | `db`, `path` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `viewer.schedule_at` | ある日のスケジュールの状態 | `building`, `day` （日数） | read | human, ai | bim-ootb のチェックアウト |
| `viewer.schedule_compare` | スケジュールエンジンを基準と比べる | `building`, `shift_hours` （時間） （任意） | read | human, ai | bim-ootb のチェックアウト |
| `modeller.widen_bay` | ベイを目標の幅に広げる | `building`, `from`, `to`, `target` （メートル） | trial | human, ai | 6ファイルのダウンロード |
| `modeller.walk` | ウォーカーが何を配置するか | `building`, `discipline` | read | human, ai | bim-ootb のチェックアウト |
| `object.describe` | オブジェクトの種類を説明する | `building`, `kind`, `uu` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `object.read` | オブジェクトを読む | `building`, `kind`, `uu` | read | human, ai | bim-ootb のチェックアウト |
| `object.history` | オブジェクトの履歴 | `building`, `kind`, `uu` | read | human, ai | bim-ootb のチェックアウト |
| `object.update` | オブジェクトのプロパティをひとつ変更する | `building`, `kind`, `uu`, `column`, `value` | writes | human, ai | bim-ootb のチェックアウト |
| `object.attach` | オブジェクトにファイルやメモを添付する | `building`, `kind`, `uu`, `file` （任意）, `text` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `object.count` | ある種類のレコードを数える | `building`, `kind`, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `object.list` | ある種類のレコードを一覧する | `building`, `kind`, `columns` （任意）, `sort` （任意）, `limit` （任意）, `offset` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `object.sum` | 列を合計する | `building`, `kind`, `column`, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `object.group` | 列で数える | `building`, `kind`, `by`, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `witness.run` | ウィットネスを実行し、その判定を読む | `name` | trial | human, ai | bim-ootb のチェックアウト |
| `witness.last` | 最後に記録されたウィットネスの実行を読む | `name` | read | human, ai | bim-ootb のチェックアウト |
| `legacy.status` | レガシーのテストスタックは動いているか | なし | read | human, ai | bim-ootb のチェックアウト |
| `legacy.query` | レガシーのテーブルの行を読む | `table`, `columns` （任意）, `sort` （任意）, `limit` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.column` | 列は誰が埋めるか：ツインとレガシーを並べて | `kind`, `column` | read | human, ai | bim-ootb のチェックアウト |
| `legacy.compare` | ツインとレガシーのひとつのレコードを比べる | `kind`, `number`, `legacy` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `idempiere.where` | iDempiere のソースから名前を探す | `symbol`, `in` （任意）, `limit` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.pack` | データモデルのワークブックから 2Pack の zip を作る | `book`, `version`, `out` （任意）, `java` （任意）, `package` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `legacy.up` | レガシーのテストスタック用の共有 docker Postgres を起動する | なし | writes | human, ai | bim-ootb のチェックアウト |
| `legacy.refresh` | 基本のシードからレガシーのテスト環境を更新する | なし | writes | human, ai | bim-ootb のチェックアウト |
| `legacy.witness` | レガシーのテスト環境でサーバー内のウィットネスを実行する | なし | trial | human, ai | bim-ootb のチェックアウト |
| `legacy.check` | ワークブックの行をレガシーのテストデータベースで確認する | `book`, `version` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `legacy.plugin` | データモデルのプラグインをレガシーのテスト環境に載せ、そこで確認する | `book`, `version` | writes | human, ai | bim-ootb のチェックアウト |
| `model.open` | Modeller で 2D のシートを開く | `sheets`, `type` （任意）, `file` （任意） | trial | human, ai | bim-ootb のチェックアウト |
| `model.convert` | 開いているシートを 3D モデルに変換する | なし | trial | human, ai | bim-ootb のチェックアウト |
| `model.addbay` | モデルにベイを加える | `end` | trial | human, ai | bim-ootb のチェックアウト |
| `model.undo` | モデルの直前の変更を元に戻す | なし | trial | human, ai | bim-ootb のチェックアウト |
| `model.save` | 開いているモデルを保存する | `file` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `model.close` | Modeller のセッションを閉じる | `discard` （任意） | trial | human, ai | bim-ootb のチェックアウト |
| `erp.process` | 辞書のプロセスを実行する | `name`, `record` （任意）, `kind` （任意）, `dry` （任意）, `role` （任意）, その他の`column=value`フィルタ（任意） | writes | human, ai | bim-ootb のチェックアウト |
| `mis.lookup` | 列またはプロセスのパラメータに使える値 | `column`, `kind` （任意）, `process` （任意）, `id` （任意）, `limit` （任意）, `role` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `viewer.cost` | 建物の中で選んだ部分のコスト | `building`, `by` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.find` | 伝票を探す | `kind`, `number` | read | human, ai | bim-ootb のチェックアウト |
| `erp.actions` | 伝票に対してできること | `kind`, `id` （任意）, `number` （任意）, `role` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.complete` | 伝票を完了する | `kind`, `id` （任意）, `number` （任意）, `role` （任意） | posts | human, ai | bim-ootb のチェックアウト |
| `erp.void` | 伝票を無効にする | `kind`, `id` （任意）, `number` （任意）, `role` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `erp.close` | 伝票をクローズする | `kind`, `id` （任意）, `number` （任意）, `role` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `erp.reverse` | 伝票を取り消す（修正する） | `kind`, `id` （任意）, `number` （任意）, `role` （任意） | posts | human, ai | bim-ootb のチェックアウト |
| `mis.describe` | ERP レコードの種類を説明する | `kind`, `role` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.read` | ERP レコードを読む | `kind`, `id` （任意）, `number` （任意）, `role` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.list` | レコードを一覧する | `kind`, `columns` （任意）, `sort` （任意）, `limit` （任意）, `offset` （任意）, `names` （任意）, `role` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.sum` | 列を合計する | `kind`, `column`, `role` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.group` | 列で数える | `kind`, `by`, `role` （任意）, `window` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.new` | レコードを作る | `kind`, `dry` （任意）, `role` （任意）, `window` （任意）, その他の`column=value`フィルタ（任意） | writes | human, ai | bim-ootb のチェックアウト |
| `mis.update` | レコードを変更する | `kind`, `id` （任意）, `number` （任意）, `role` （任意）, `window` （任意）, その他の`column=value`フィルタ（任意） | writes | human, ai | bim-ootb のチェックアウト |
| `mis.delete` | レコードを削除する | `kind`, `id` （任意）, `number` （任意）, `role` （任意）, `window` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `mis.load` | CSV からレコードを読み込む | `kind`, `file`, `dry` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `mis.add_window` | CSV からウィンドウを加える | `file`, `table` （任意）, `workflow` （任意）, `dry` （任意）, `master` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `ninja.exec` | Ninja ワークブックを実行する | `file`, `dry` （任意）, `data` （任意）, `table` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `ninja.workflow` | テーブルに伝票の列を与える | `table`, `dry` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `mis.diff` | CSV をテーブルと比べる | `kind`, `file`, `key` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `mis.menu` | メニューを読む | `role` （任意）, `find` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `ninja.rollback` | Ninja バンドルを元に戻す | `bundle`, `dry` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `ninja.export` | Ninja バンドルをワークブックとして書き戻す | `bundle` （任意）, `window` （任意）, `table` （任意）, `file` | writes | human, ai | bim-ootb のチェックアウト |
| `erp.column` | 列は誰が埋めるか：ツインとレガシーを並べて（mis.column の古い名前） | `kind`, `column` | read | human, ai | bim-ootb のチェックアウト |
| `erp.compare` | ツインとレガシーのひとつのレコードを比べる（legacy.compare の古い名前） | `kind`, `number`, `legacy` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.pack` | データモデルのワークブックから 2Pack の zip を作る（mis.pack の古い名前） | `book`, `version`, `out` （任意）, `java` （任意）, `package` （任意） | writes | human, ai | bim-ootb のチェックアウト |
| `erp.legacy_plugin` | データモデルのプラグインをレガシーのテスト環境に載せ、そこで確認する（legacy.plugin の古い名前） | `book`, `version` | writes | human, ai | bim-ootb のチェックアウト |
| `erp.describe` | ERP レコードの種類を説明する（mis.describe の古い名前） | `kind`, `role` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.read` | ERP レコードを読む（mis.read の古い名前） | `kind`, `id` （任意）, `number` （任意）, `role` （任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.list` | レコードを一覧する（mis.list の古い名前） | `kind`, `columns` （任意）, `sort` （任意）, `limit` （任意）, `offset` （任意）, `names` （任意）, `role` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.sum` | 列を合計する（mis.sum の古い名前） | `kind`, `column`, `role` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.group` | 列で数える（mis.group の古い名前） | `kind`, `by`, `role` （任意）, `window` （任意）, その他の`column=value`フィルタ（任意） | read | human, ai | bim-ootb のチェックアウト |
| `erp.new` | レコードを作る（mis.new の古い名前） | `kind`, `dry` （任意）, `role` （任意）, `window` （任意）, その他の`column=value`フィルタ（任意） | writes | human, ai | bim-ootb のチェックアウト |
<!-- /GEN:verbs -->

**現時点の範囲。** 一覧は意図的に小さくしてあります。62 の動詞が、Modeller のグリッド編集、そのウォーカー、行の間で開いたままにする Modeller、いくつかの Viewer への質問、スケジュール、汎用のオブジェクトの読み取り、数え上げ、書き込み、そして最初の ERP 伝票の動詞をカバーします。Viewer には人が押せるアクションが 64 あり、ドアが提供する Viewer の動詞は 6 つです。ERP には 1158 の伝票とプロセスがあり、ドアが提供するのは、伝票の一生のための ERP の動詞 7 つと、どのテーブルでも使える MIS の動詞 15 個で、以前の行がそのまま動くように 10 個の古い名前も残しています。したがって、これは始まりであり、メニューの全部ではありません。

## 確認されないこと {#what-is-not-checked}

返信には、そのチェックが対象としなかったものが一覧されます。Modeller の編集レポートでは、一覧は次のとおりです。

<!-- run: notchecked cut=520 -->
```text
$ grep -o '"notChecked":\[[^]]*\]' widen.json | tail -1
"notChecked":["duplicate ids","elements changed outside the edit's own list","floating or unsupported elements","grid lines placed on top of each other","invalid coordinates","real beams: only girders walked from columns are span-checked","unknown element types","wrong units or absurd sizes, unless they hit something","zero-size elements","load capacity","beam and column rules (Regulatory Report only)"]
```

同じ言葉は、どの答えにも当てはまります。重なりはまずバウンディングボックスで見ること、チェックは動いたものだけを対象とすること、そして**耐荷重は決して確認されません**。赤のない返信は、決して安全を意味しません。

## トラブルシューティング

| 見えるもの | すること |
|---|---|
| `edit_cli is not at …` | 六つのファイルのうちひとつが足りません。メッセージが`curl`の行を表示します |
| `puppeteer not found` | 同じフォルダで`npm install puppeteer@24`を実行します |
| `unknown verb` | メッセージがすべての動詞を一覧します。[表](#the-verbs)と綴りを照らし合わせてください |
| `missing input: …` | その動詞にはそのキーが必要です。表に入力が一覧されています |
| `The Viewer tools need a bim-ootb checkout` | 完全なチェックアウトから`node common/door/door.js`として実行します |
| `exit 1`と Chrome のメッセージ | Linux で Chrome のシステムライブラリが足りません。Puppeteer のトラブルシューティングページに一覧があります |

**計画しておくべき制限。** Modeller の呼び出しは、そのつど建物全体を開きます。HospitalGarage で約 10〜40 秒です。これは測定ツールであり、稼働時間を保証するサービスではありません。Modeller の行が複数あるスクリプトは、行ごとに建物を一度開きます。

## このページが正しさを保つ仕組み

上の灰色のブロックのコマンドはすべて実行され、その下の出力は、コマンドが表示したものです。**W-FAST-SCRIPT-GUIDE**というテストが、`bim-ootb`リポジトリで、それらをきれいな四ファイルのダウンロードからもう一度実行し、このページのすべての数値を実行結果と照らし合わせ、動詞の表が`verbs.json`と等しいことを確認します。ここの数値が古くなれば、そのテストは失敗します。

関連：[AI Proposer ガイド](ProposerGuide.md)（同じドアに AI をつなぐ方法と、AI がチェックで何をしたか）、そして[Modeller ガイド](ModellerGuide.md)。
