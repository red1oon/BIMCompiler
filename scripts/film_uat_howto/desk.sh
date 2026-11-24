#!/bin/bash
# ⚠ DO NOT REMOVE — film "UAT, hands on" (prompts/FILM_UAT_GUIDE.md §5): the PRIVATE recording desktop. start|stop <workdir>. Xvfb :97 + openbox + headed Chrome (fresh profile, a fake HOME
# whose Downloads/ starts empty). Never the owner's screen or session bus (DBUS_SESSION_BUS_ADDRESS and XDG_RUNTIME_DIR are unset). stop kills ONLY what start started (pids in <workdir>/desk.pids).
W=$2; export DISPLAY=:97 HOME=$W/home; unset DBUS_SESSION_BUS_ADDRESS XDG_RUNTIME_DIR WAYLAND_DISPLAY
mine() { for p in /proc/[0-9]*; do grep -qz "^HOME=$W/home\$" $p/environ 2>/dev/null && echo ${p#/proc/}; done; }   # processes carrying the FAKE home only (the Files app's private session helpers)
stop_all() { [ -f $W/desk.pids ] && for p in $(tac $W/desk.pids); do kill $p 2>/dev/null; done; rm -f $W/desk.pids; for p in $(mine); do [ "$p" != "$$" ] && kill $p 2>/dev/null; done; sleep 2
  for m in $W/home/.gvfs $W/home/.cache/doc; do mountpoint -q $m 2>/dev/null && fusermount -u $m; done; echo "§DESK stopped left=$(mine | grep -v "^$$\$" | wc -l)"; }
if [ "$1" = stop ]; then stop_all; exit 0; fi
stop_all > /dev/null
rm -rf $W/home $W/prof; mkdir -p $W/home/Downloads $W/home/Desktop $W/prof/Default; : > $W/desk.pids
# FILM_UAT_GUIDE §5.30: the take's Chrome never offers to save a password and never runs the leak check (its 'Change your password' window / 'Save password?' bubble covered iDempiere's Home in rc6)
cat > $W/prof/Default/Preferences <<'J'
{"credentials_enable_service":false,"profile":{"password_manager_enabled":false,"password_manager_leak_detection":false},"safebrowsing":{"enabled":false},"autofill":{"profile_enabled":false,"credit_card_enabled":false}}
J
Xvfb :97 -screen 0 1920x1080x24 -nolisten tcp > $W/xvfb.log 2>&1 & echo $! >> $W/desk.pids; sleep 1
xsetroot -solid '#2b3440'
openbox > $W/openbox.log 2>&1 & echo $! >> $W/desk.pids; sleep 1
cd $W/home && google-chrome --user-data-dir=$W/prof --no-first-run --no-default-browser-check --password-store=basic --disable-features=Translate,PasswordLeakDetection,PasswordCheck --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --window-position=0,0 --window-size=1920,1080 \
  --remote-debugging-port=9333 --lang=en-US about:blank > $W/chrome.log 2>&1 & echo $! >> $W/desk.pids
for i in $(seq 1 40); do curl -s -m 1 localhost:9333/json/version > /dev/null && break; sleep 0.5; done
echo "§DESK started pids=$(tr '\n' ' ' < $W/desk.pids)"
