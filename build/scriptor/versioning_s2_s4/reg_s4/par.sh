cd /tmp/wt-vs4
w=$1
timeout 3000 node erp/tests/$w.js > /home/red1/bim-compiler/build/scriptor/versioning_s2_s4/reg_s4/$w.log 2>&1; echo "$w exit=$?" >> /home/red1/bim-compiler/build/scriptor/versioning_s2_s4/reg_s4/_exits.txt
