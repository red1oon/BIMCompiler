SELECT count(*) AS unconstrained_numeric_columns FROM information_schema.columns WHERE table_schema='adempiere' AND data_type='numeric' AND numeric_precision IS NULL;
DO $$ DECLARE r record; n bigint; tot bigint := 0; cols int := 0;
BEGIN
  FOR r IN SELECT c.table_name t, c.column_name col FROM information_schema.columns c JOIN information_schema.tables x ON x.table_schema=c.table_schema AND x.table_name=c.table_name AND x.table_type='BASE TABLE'
           WHERE c.table_schema='adempiere' AND c.data_type='numeric' LOOP
    EXECUTE format('SELECT count(*) FROM adempiere.%I WHERE %I IS NOT NULL AND length(regexp_replace(trim_scale(%I)::text, ''[^0-9]'', '''', ''g'')) - (CASE WHEN abs(%I) < 1 AND %I <> 0 THEN length(regexp_replace(split_part(trim_scale(%I)::text, ''.'', 2), ''[1-9].*$'', '''')) ELSE 0 END) > 15', r.t, r.col, r.col, r.col, r.col, r.col) INTO n;
    IF n > 0 THEN RAISE NOTICE 'WIDE % . % rows=%', r.t, r.col, n; tot := tot + n; cols := cols + 1; END IF;
  END LOOP;
  RAISE NOTICE 'TOTAL columns_with_wide_values=% wide_values=%', cols, tot;
END $$;
