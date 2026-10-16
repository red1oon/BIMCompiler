#!/usr/bin/env bash
# parity.sh — THE GATE. The Java is the oracle; the JS is a port. Byte-identical JSON or RED.
# A port that "works" but emits different bytes is a second design, which is what this whole lane
# has been paying for. Read the output, do not trust the exit code alone.
set -u
cd "$(dirname "$0")"
javac -d . Json.java Poc4D.java || { echo "§PARITY_FAIL javac"; exit 2; }
fail=0
for fx in "" coherent; do
  name="${fx:-hell}"
  java -cp . Poc4D $fx > "/tmp/poc4d_java_$name.log" 2>&1 || { echo "§PARITY_FAIL java $name"; exit 2; }
  node poc4d.js $fx      > "/tmp/poc4d_js_$name.log"   2>&1 || { echo "§PARITY_FAIL node $name"; exit 2; }
  jj="4d_$name.json"; jsj="4d_$name.js.json"
  if diff -q "$jj" "$jsj" >/dev/null 2>&1; then
    echo "§PARITY_JSON $name IDENTICAL ($(wc -c < "$jj") bytes)"
  else
    echo "§PARITY_JSON $name DIFFERS"; diff "$jj" "$jsj" | head -20; fail=1
  fi
  # the verdict lines must agree too — same numbers, not just same tree
  a=$(grep -E '^§POC_(STACKING|VIOLATIONS|DATA_DEFECTS|SPAN|VERDICT)' "/tmp/poc4d_java_$name.log")
  b=$(grep -E '^§POC_(STACKING|VIOLATIONS|DATA_DEFECTS|SPAN|VERDICT)' "/tmp/poc4d_js_$name.log")
  if [ "$a" = "$b" ]; then echo "§PARITY_LOG  $name IDENTICAL"
  else echo "§PARITY_LOG  $name DIFFERS"; diff <(echo "$a") <(echo "$b"); fail=1; fi
done
echo "§PARITY_VERDICT $([ $fail -eq 0 ] && echo PASS || echo FAIL)"
exit $fail
