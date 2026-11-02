-- Endpoint de salud (fallos 7 y 10): `estado_salud` dice si la base responde y si el reloj de
-- pg_cron corrió hace poco, sin datos de ninguna barbería, y solo la llama la clave secreta.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

select ok((public.estado_salud() ->> 'base')::boolean, 'la base responde');
select is(
  jsonb_typeof(public.estado_salud() -> 'tareas'), 'boolean',
  'dice si el reloj de pg_cron corrió en los últimos 3 minutos'
);
select is(
  (select array_agg(k order by k) from jsonb_object_keys(public.estado_salud()) k),
  array['base', 'tareas'], 'y nada más: ningún dato de las barberías'
);
select ok(
  has_function_privilege('service_role', 'public.estado_salud()', 'execute'),
  'la Edge Function (clave secreta) la puede llamar'
);
select ok(
  not has_function_privilege('anon', 'public.estado_salud()', 'execute')
  and not has_function_privilege('authenticated', 'public.estado_salud()', 'execute'),
  'el público y el personal no'
);

select * from finish();
rollback;
