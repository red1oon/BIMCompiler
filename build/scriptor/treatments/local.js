// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treatments/local.js — LOCAL: a DECLARED station-local table (prompts/TEAMWORK_FRAMEWORK.md §20a #2, §22.7). Runtime is unchanged — an undeclared table is already
// local (default-deny); the row only lets the compile report separate "declared local" from "unclassified". It moves nothing, so it has no visit hooks.
'use strict';
require('../treat.js').register('LOCAL', { needs: ['table'] });
