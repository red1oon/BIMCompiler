#!/usr/bin/env bash
# rc2 plan (title card -> phone bodies -> end card), kept reproducible. Same as: PLAN_NAME=rc2 make_film.sh <app tree> <work dir> <out.mp4>
PLAN_NAME=rc2 exec "$(dirname "$0")/make_film.sh" "$@"
