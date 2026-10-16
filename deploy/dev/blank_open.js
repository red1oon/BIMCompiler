// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// blank_open.js — Blank-viewer local file Open (drag-drop / picker), A.BLANK_MODE only.
// Implementing prompts/Viewer/BLANK_VIEWER_LANDING_CARD.md §2 — Witness: witness_blank_viewer_card.js
function setupBlankOpen(A) {
  if (!A.BLANK_MODE) return;

  function overlayEl() { return document.getElementById('blank-open-overlay'); }
  function showOverlay() { var el = overlayEl(); if (el) el.style.display = 'flex'; }
  function hideOverlay() { var el = overlayEl(); if (el) el.style.display = 'none'; }

  // Reuses A.init()'s existing single-DB load path (streaming.js) by pointing A.DB_URL at a local
  // blob: URL — a blob: URL doesn't match the _extracted.db/.db split-detection regexes there, so it
  // falls straight into the monolith branch, the correct behaviour for a raw opened .db file. No
  // duplicate DB-loading logic here.
  A.openLocalFile = async function(file) {
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext !== 'db' && ext !== 'sqlite') {
      A.status.textContent = 'IFC import isn’t wired in Blank Viewer yet — use the landing page’s Drop IFC zone, then reopen that building.';
      console.log('§BLANK_OPEN_UNSUPPORTED ext=' + ext + ' file=' + file.name);
      return;
    }
    hideOverlay();
    A.DB_URL = URL.createObjectURL(file);
    console.log('§BLANK_OPEN file=' + file.name + ' size=' + file.size);
    await A.init();
  };

  showOverlay();
  var input = document.getElementById('blank-open-input');
  if (input) {
    input.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) A.openLocalFile(e.target.files[0]);
    });
  }
  var dz = overlayEl();
  if (dz) {
    dz.addEventListener('dragover', function(e) { e.preventDefault(); dz.classList.add('drag'); });
    dz.addEventListener('dragleave', function() { dz.classList.remove('drag'); });
    dz.addEventListener('drop', function(e) {
      e.preventDefault();
      dz.classList.remove('drag');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) A.openLocalFile(e.dataTransfer.files[0]);
    });
  }
  console.log('§BLANK_MODE_UI wired=1');
}
