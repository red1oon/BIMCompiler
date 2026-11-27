#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — film 6 PROMO: runs the ONE shoot (shoot.js: every scene, one VS Code session) under the GPU lock (/tmp/claude-1000/gpu.lock, the same lock a bake holds) so no bake can start beside it; shoot.js itself also refuses while a `node cli_silent_bake` runs. READ out/shoot.log.
cd "$(dirname "$0")"; rm -f out/shoot.log out/scene.json; rm -rf out/stills; mkdir -p out/stills
echo "queued $(date +%T)" > out/gpu_queue.log
export FILM_DISPLAY=:143 FILM_DRIVER_PORT=8791 FILM_DEBUG_PORT=9381 FILM_PORT=8661   # our own display and ports: another session already holds :97
exec flock /tmp/claude-1000/gpu.lock bash -c 'echo "got the lock $(date +%T)" >> out/gpu_queue.log; node shoot.js; echo "exit=$?"; echo ALLDONE'
