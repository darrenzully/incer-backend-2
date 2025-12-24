-- Recalcula secuencias/identity luego de un seed manual.
-- Objetivo: evitar errores de clave duplicada cuando ya existen filas con IDs "altos".
--
-- Cómo ejecutar (ejemplo):
--   psql -h localhost -U postgres -d incer -f scripts/reset_sequences.sql
--
-- Nota: por defecto usa el schema actual (normalmente "public").

DO $$
DECLARE
  r record;
  v_max bigint;
  v_sql text;
BEGIN
  -- Busca columnas que usan secuencias (serial) o identity.
  FOR r IN
    SELECT
      c.table_schema,
      c.table_name,
      c.column_name,
      pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name), c.column_name) AS seq_name
    FROM information_schema.columns c
    WHERE c.table_schema = current_schema()
      AND (
        c.is_identity = 'YES'
        OR c.column_default LIKE 'nextval(%'
      )
  LOOP
    IF r.seq_name IS NULL THEN
      CONTINUE;
    END IF;

    -- max(id) de la tabla/columna
    v_sql := format('SELECT MAX(%I) FROM %I.%I', r.column_name, r.table_schema, r.table_name);
    EXECUTE v_sql INTO v_max;

    -- setval(seq, max, is_called)
    -- is_called = true => el próximo nextval devolverá max+1
    EXECUTE format(
      'SELECT setval(%L, %s, %s)',
      r.seq_name,
      COALESCE(v_max, 1),
      CASE WHEN v_max IS NULL OR v_max < 1 THEN 'false' ELSE 'true' END
    );

    RAISE NOTICE 'Sequence % reset to % for %.%.%', r.seq_name, COALESCE(v_max, 0), r.table_schema, r.table_name, r.column_name;
  END LOOP;
END $$;


