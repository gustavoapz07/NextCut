-- Permisos generales (fallos 2 y 7 de docs/seguridad.md).
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'RLS activo en todas las tablas de public'
);

select is(
  (select count(*)::int from information_schema.role_table_grants
   where grantee = 'anon' and table_schema = 'public'),
  0,
  'el público no tiene permisos sobre ninguna tabla'
);

select set_eq(
  $$ select p.proname::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute') $$,
  array['fila_publica', 'ver_turno', 'cancelar_turno', 'suscribir_push'],
  'el público solo ejecuta las 4 funciones públicas'
);

select set_eq(
  $$ select p.proname::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'execute') $$,
  array[
    'fila_publica', 'ver_turno', 'cancelar_turno', 'suscribir_push', 'llamar_siguiente',
    'empezar_turno', 'terminar_turno', 'marcar_no_llego', 'pausar_barbero', 'pausar_fila_remota',
    'renombrar_turno', 'ocultar_turno', 'reporte_dia'
  ],
  'el personal no ejecuta unirse_a_fila ni las tareas programadas'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.unirse_a_fila(uuid, text, uuid, text, uuid, text, public.origen_turno, text, uuid, integer)',
    'execute'
  ),
  'la clave secreta (Edge Function) sí puede anotar'
);

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'privado') and p.prosecdef
     and not coalesce(p.proconfig @> array['search_path=""'], false)),
  0,
  'toda función security definer fija un search_path vacío'
);

select * from finish();
rollback;
