cd /tmp/wt-vs2
w=$1
timeout 2700 node erp/tests/$w.js > /home/red1/bim-compiler/build/scriptor/versioning_s2_s4/reg_s2/$w.log 2>&1; echo "$w exit=$?" >> /home/red1/bim-compiler/build/scriptor/versioning_s2_s4/reg_s2/_exits2.txt
