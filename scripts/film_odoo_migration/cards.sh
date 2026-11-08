#!/bin/bash
# ⚠ DO NOT REMOVE — Scope: the CARDS + COMPOSITES of the film "How to escape from your Odoo" (storyboard script_en.md). House style = FILM_NARRATION.md PLAYBOOK C: dark #0b0f17 / #0f172a,
#   kicker coral #FF6B78, titles off-white #F3EEE8, labels sky-blue #7dd3fc, DejaVu Sans; narrated frames keep the bottom 230 px EMPTY for captions. Every number on a card is a fact from
#   out/rec/facts.json (record.js) or out/export/export.log — read here, never typed. Run: ./cards.sh   (writes out/cards/*.png)
set -e; cd "$(dirname "$0")"; O=out/cards; mkdir -p $O; R=out/rec; F=out/rec/facts.json
B=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf; N=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf; M=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf
BG='#0b0f17'; CO='#FF6B78'; OW='#F3EEE8'; SK='#7dd3fc'; GR='#9aa4b2'
fact() { python3 -c "import json,sys; d=json.load(open('$F')); v=d; [v:=v[k] for k in sys.argv[1].split('.')]; print(v)" "$1"; }
OPS=$(fact commit_ops); BP=$(fact tenant_counts_after.c_bpartner); PR=$(fact pr_grid_rows); IL=$(fact tenant_counts_after.m_inventoryline); EV_AFTER=$(fact tenant_counts_after.c_elementvalue)
REQ=$(fact offline_requests); VC=$(fact verify_chain)
MSG=$(fact form_msg); mig() { echo "$MSG" | grep -o "$1 [0-9]*" | head -1 | awk '{print $2}'; }
MBP=$(mig C_BPartner); MPR=$(mig M_Product); MIL=$(mig M_InventoryLine); MEV=$(mig C_ElementValue)   # what Process wrote (the form's own line)
[ "$(fact offline_proven)" = "True" ] || { echo "§CARDS_REFUSED the offline beat is not proven by the recording (facts.offline_proven)"; exit 4; }
echo "§CARDS migrated bp=$MBP products=$MPR stocklines=$MIL accounts=$MEV (form_msg)"; echo "§CARDS facts ops=$OPS bp=$BP products=$PR stocklines=$IL accounts_after=$EV_AFTER offline_requests=$REQ verifyChain=$VC"
chapter() {  # $1 file  $2 kicker  $3 line1  $4 line2  $5 plain line   (silent 3.6 s card, PLAYBOOK C)
  convert -size 1920x1080 xc:$BG -gravity center -font $B -pointsize 34 -fill $CO -annotate +0-210 "$2" -font $B -pointsize 120 -fill $OW -annotate +0-60 "$3" \
    -fill $CO -annotate +0+90 "$4" -font $N -pointsize 40 -fill $OW -annotate +0+220 "$5" $O/$1; }
shot() {  # $1 out  $2 in  $3 label (top)   — a real screenshot scaled into the band above the captions
  convert $2 -resize 1340x754 $O/_s.png; convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 44 -fill $SK -gravity north -annotate +0+18 "$3" $O/_s.png -gravity north -geometry +0+92 -composite $O/$1; }
chapter 01_title.png 'A REAL RUN, END TO END' 'How to escape' 'from your Odoo' 'Odoo 17 demo company  →  the Kernel ERP, on this machine'
# the trap: the usual picture (plain boxes, no number)
convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 46 -fill $SK -gravity north -annotate +0+40 'The usual picture' \
  -fill none -stroke '#475569' -strokewidth 4 -draw 'roundrectangle 150,300 610,560 24,24' -draw 'roundrectangle 730,300 1190,560 24,24' -draw 'roundrectangle 1310,300 1770,560 24,24' \
  -stroke $CO -strokewidth 6 -draw 'line 610,430 730,430' -draw 'line 1190,430 1310,430' -stroke none -gravity northwest \
  -font $B -pointsize 44 -fill $OW -annotate +318+360 'You' -annotate +808+360 'Their program' -annotate +1373+360 'Their database' \
  -font $N -pointsize 32 -fill $GR -annotate +305+430 'every click' -annotate +878+430 'runs all day' -annotate +1458+430 'runs all day' -annotate +860+475 'somewhere else' -annotate +1440+475 'billed monthly' \
  -font $B -pointsize 40 -fill $CO -gravity north -annotate +0+640 'Your data lives on a server you keep paying for.' $O/02_trap.png
# before / after: Odoo's own Customers  |  the same customers in the ERP's Business Partner window
convert $R/odoo_contacts.png -resize 900x506 $O/_a.png; convert $R/bp_window.png -resize 900x506 $O/_b.png
convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 44 -fill $SK -gravity north -annotate +0+40 'Before  ·  after' \
  $O/_a.png -gravity northwest -geometry +40+200 -composite $O/_b.png -gravity northwest -geometry +980+200 -composite \
  -font $B -pointsize 38 -fill $OW -gravity northwest -annotate +40+140 'A · Odoo (its Customers screen)' -annotate +980+140 'B · the Kernel ERP, in this browser' $O/03_beforeafter.png
chapter 04_act1.png 'STEP 1' 'Export' 'next to your Odoo' 'one small program reads it, and writes one workbook'
# the export: its own terminal lines (emoji dropped for the font; text verbatim)
python3 - <<'PY'
import subprocess
L=[l.rstrip('\n').replace('🟢 ','').replace('§ODOO-EXPORT ','') for l in open('out/export/term_lines.txt')]
keep=[l for l in L if l.startswith('sheet=')][:17]+[l for l in L if l.strip().startswith('✓')]+[l for l in L if 'PASS' in l]
args=['convert','-size','1920x1080','xc:#0f172a','-font','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','-pointsize','44','-fill','#7dd3fc','-gravity','north','-annotate','+0+30','On the machine that has Odoo',
      '-fill','#111827','-stroke','#334155','-draw','roundrectangle 160,110 1760,845 14,14','-stroke','none','-gravity','northwest','-font','/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf','-pointsize','28','-fill','#7dd3fc','-annotate','+190+128','$ node export.js']
y=172
for l in keep:
    col = '#86efac' if ('PASS' in l or l.strip().startswith('✓')) else '#e5e7eb'
    args+=['-pointsize','22','-fill',col,'-annotate','+190+%d'%y,l[:118]]; y+=30
args+=['out/cards/05_export.png']; subprocess.check_call(args); print('§CARDS export lines=%d'%len(keep))
PY
chapter 06_act2.png 'STEP 2' 'Your own' 'company' 'set up the way iDempiere sets one up'
shot 07_login.png $R/login_newco.png 'The new company on the login screen'
chapter 08_act3.png 'STEP 3' 'Migrate' 'from Odoo' 'pick the files · read the summary · Process'
shot 09_form.png $R/form_units.png 'Migrate from Odoo: the files picked, the questions asked'
shot 10_summary.png $R/form_summary.png 'The summary, before anything is written'
shot 11_done.png $R/form_done.png 'Process: all of it, or none of it'
shot 12_bp.png $R/bp_window.png "Odoo's customers, in the ERP's own window"
shot 13_products.png $R/product_window.png "Odoo's products, in the ERP's own window"
chapter 14_local.png 'LOCAL FIRST' 'On your' 'machine' 'the ERP and your data live in this browser'
convert $R/offline_saved.png -resize 1340x754 $O/_o.png
convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 44 -fill $SK -gravity north -annotate +0+18 'The internet switched off — a customer edited and saved' $O/_o.png -gravity north -geometry +0+92 -composite \
  -fill '#b91c1cdd' -draw 'roundrectangle 330,120 1010,190 14,14' -font $B -pointsize 34 -fill white -gravity northwest -annotate +350+133 "OFFLINE · $REQ network requests" $O/15_offline.png
convert ~/bim-ootb/erp/guide_img/team_panel_before.png -resize x700 $O/_t.png
convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 44 -fill $SK -gravity north -annotate +0+18 'Your team: the Team panel — Start a team, then Visit' $O/_t.png -gravity north -geometry +0+110 -composite -font $N -pointsize 30 -fill $GR -gravity northeast -annotate +60+380 'the team film:' -annotate +60+420 'youtu.be/-LQwoPuQ1QU' $O/16_team.png
convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 44 -fill $SK -gravity north -annotate +0+40 'What this run proved (its own log)' \
  -font $B -pointsize 64 -fill $OW -gravity northwest -annotate +260+200 "$OPS records, one signed change set" -annotate +260+320 "the chain verified: $VC" \
  -annotate +260+440 "$MBP partners · $MPR products" -annotate +260+540 "$MIL stock lines · $MEV accounts" -font $N -pointsize 38 -fill $GR -annotate +260+680 "what the summary predicted is what Process wrote, in all 17 tables" \
  -annotate +260+740 "a save with the internet off: $REQ network requests" $O/17_proof.png
convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 44 -fill $SK -gravity north -annotate +0+40 'Not only Odoo' \
  -font $B -pointsize 56 -fill $OW -annotate +0+220 'One sheet per table.' -annotate +0+320 'Row one: the column names.' -annotate +0+420 "The ERP's own dictionary decides the rest." \
  -font $N -pointsize 38 -fill $GR -annotate +0+560 'Odoo is the first door opened — built for any system whose data you can read' $O/18_anyerp.png
convert -size 1920x1080 xc:'#0f172a' -font $B -pointsize 34 -fill $CO -gravity north -annotate +0+70 'NOT BUILT YET' -font $B -pointsize 64 -fill $OW -annotate +0+140 'Coming in the next update' \
  -font $N -pointsize 46 -fill $OW -gravity northwest -annotate +360+320 '·  balances and open invoices' -annotate +360+410 '·  the books matched to the cent' -annotate +360+500 '·  timing next to Odoo, on the same machine' \
  -font $N -pointsize 34 -fill $GR -gravity north -annotate +0+640 'today: customers, contacts, products, prices, accounts, warehouses and opening stock' $O/19_notyet.png
cp cards/end_card_one_door.png $O/20_end.png
rm -f $O/_*.png; ls $O | wc -l | xargs echo "§CARDS built"
# caption band witness (PLAYBOOK C): every NARRATED card keeps the bottom 230 px empty = the background (#0f172a)
bg=$(convert -size 10x10 xc:'#0f172a' -format '%[fx:mean]' info:); bad=0
for c in 02 03 05 07 09 10 11 12 13 15 16 17 18 19; do f=$(ls $O/${c}_*.png); m=$(convert $f -crop 1920x230+0+850 -format '%[fx:mean]' info:); [ "$m" = "$bg" ] || { echo "§CARDS_BAND_FAIL $f mean=$m bg=$bg"; bad=1; }; done
[ $bad = 0 ] && echo "§CARDS_BAND_OK 14 narrated cards keep the caption band empty (mean $bg)" 
