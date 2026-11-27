# # ⚠ DO NOT REMOVE — builds the PUBLIC film-path fixture exactly as bim-ootb viewer/tests/witness_film_path_vis.js fixture() does (pinned bim-ootb sha in evidence): a copy of the public
# Duplex DB plus WRITTEN test rows (not data): a 2-band cinema_path inside the house, 2 drawn_walk_line + 1 drawn_walk_marker ahead of band 0. $1 = db path, $2 = fwd|rev. Needs the sqlite3 CLI.
mk_fixture() {
  local db="$1" d0="0,1,0"; [ "$2" = rev ] && d0="0,-1,0"
  sqlite3 "$db" "CREATE TABLE cinema_path (seq INTEGER, ifc_x REAL, ifc_y REAL, ifc_z REAL, dir_x REAL, dir_y REAL, dir_z REAL, len REAL,
      total_sec REAL, dive_sec REAL, spin_sec REAL, out_sec REAL, rise_sec REAL, hold_sec REAL);
    INSERT INTO cinema_path VALUES (0, 2,-12,1.6, ${d0}, 8, 30,NULL,0,NULL,NULL,0), (1, 4,-8,1.6, 1,0,0, 4, 30,NULL,0,NULL,NULL,0);
    CREATE TABLE drawn_walk_line(sheet TEXT, piece TEXT, x0 REAL,y0 REAL,z0 REAL,x1 REAL,y1 REAL,z1 REAL, width_drawn_mm REAL, system TEXT, basis TEXT, label TEXT);
    INSERT INTO drawn_walk_line VALUES ('FIX','p1', 1.5,-4,2.5, 2.5,-4,2.5, 300,'SA','void-middle',NULL), ('FIX','p2', 1.5,-3,2.5, 2.5,-3,2.5, 300,'RA','void-middle',NULL);
    CREATE TABLE drawn_walk_marker(sheet TEXT, item TEXT, kind TEXT, x REAL,y REAL,z REAL, basis TEXT, label TEXT, ifc_class TEXT, object_type TEXT);
    INSERT INTO drawn_walk_marker VALUES ('FIX','m1','equipment', 2,-3.5,1.2,'owner-stated','fixture','IfcFireSuppressionTerminal',NULL);"
}
