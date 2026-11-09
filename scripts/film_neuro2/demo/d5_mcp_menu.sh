#!/bin/bash
# # ⚠ DO NOT REMOVE — demo d5: the connector's menu, `tools/list`, asked by a SCRIPTED JSON-RPC client, no AI (W-FILM-NEURO2-CLI, §22.8). Read evidence/ after every run.
# Downloads two files (bim_mcp.js, edit_cli.js, both live). The client is mcp_menu_client.js (ours, a test script, not downloaded).
set -e; . "$(dirname "$0")/lib.sh"; demo_begin d5_menu
dl_as modeller/tools/bim_mcp.js bim_mcp.js "$LIVE"; dl_as modeller/tools/edit_cli.js edit_cli.js "$LIVE"
cp "$HERE/mcp_menu_client.js" "$F/mcp_menu_client.js"   # the scripted client sits beside the server; it is the "AI" stand-in and is labelled so on screen
run_saved node mcp_menu_client.js node bim_mcp.js
