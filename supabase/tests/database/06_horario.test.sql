-- Horario de la barbería: solo horarios válidos (fallo 3), fuera de horario la fila en línea se
-- cierra sola pero en el local se sigue anotando, la fila pública dice si está abierta y el dueño
-- lo edita con su sesión.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email) values
  ('f0000000-0000-4000-8000-0000000000a1', 'duena@horario.test');
insert into public.barberias (id, nombre, slug, max_fila) values
  ('f1000000-0000-4000-8000-00000000000a', 'Horario A', 'horario-a', 50);
insert into public.miembros (user_id, barberia_id, rol) values
  ('f0000000-0000-4000-8000-0000000000a1', 'f1000000-0000-4000-8000-00000000000a', 'dueno');
insert into public.servicios (id, barberia_id, nombre, duracion_min) values
  ('f3000000-0000-4000-8000-0000000000a1', 'f1000000-0000-4000-8000-00000000000a', 'Corte', 30);

create function pg_temp.lunes_a_viernes() returns jsonb language sql as $$
  select '{"1": {"abre": "09:00", "cierra": "19:00"}, "2": {"abre": "09:00", "cierra": "19:00"},
           "3": {"abre": "09:00", "cierra": "19:00"}, "4": {"abre": "09:00", "cierra": "19:00"},
           "5": {"abre": "09:00", "cierra": "19:00"}, "6": null, "7": null}'::jsonb
$$;
create function pg_temp.siempre_cerrada() returns jsonb language sql as $$
  select '{"1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null}'::jsonb
$$;

-- ── Solo horarios válidos (fallo 3) ────────────────────────────────────────────────────────
select ok(privado.horario_valido(null), 'sin horario es válido (siempre abierta)');
select ok(privado.horario_valido(pg_temp.lunes_a_viernes()), 'un horario de lunes a viernes es válido');
select ok(not privado.horario_valido('{"8": null}'), 'no hay día 8');
select ok(
  not privado.horario_valido('{"1": {"abre": "19:00", "cierra": "09:00"}}'),
  'no se cierra antes de abrir'
);
select ok(
  not privado.horario_valido('{"1": {"abre": "9:00", "cierra": "19:00"}}'),
  'la hora va con dos dígitos'
);
select ok(
  not privado.horario_valido('{"1": {"abre": "09:00", "cierra": "19:00", "nota": "x"}}'),
  'no acepta campos de más'
);
select ok(not privado.horario_valido('[]'), 'tiene que ser un objeto');
select throws_ok(
  $$ update public.barberias set horario = '{"1": {"abre": "25:00", "cierra": "26:00"}}'
     where id = 'f1000000-0000-4000-8000-00000000000a' $$,
  '23514', null, 'la tabla rechaza un horario inválido'
);

-- ── Abierta o cerrada, en la zona horaria de la barbería (UTC-6) ───────────────────────────
select is(
  privado.abierta_en(pg_temp.lunes_a_viernes(), 'America/Tegucigalpa', '2026-11-02 14:59:00+00'),
  false, 'lunes 8:59 en Honduras: todavía cerrada'
);
select is(
  privado.abierta_en(pg_temp.lunes_a_viernes(), 'America/Tegucigalpa', '2026-11-02 15:00:00+00'),
  true, 'lunes 9:00: abierta'
);
select is(
  privado.abierta_en(pg_temp.lunes_a_viernes(), 'America/Tegucigalpa', '2026-11-03 00:59:00+00'),
  true, 'lunes 18:59: abierta'
);
select is(
  privado.abierta_en(pg_temp.lunes_a_viernes(), 'America/Tegucigalpa', '2026-11-03 01:00:00+00'),
  false, 'lunes 19:00: ya cerró'
);
select is(
  privado.abierta_en(pg_temp.lunes_a_viernes(), 'America/Tegucigalpa', '2026-11-07 16:00:00+00'),
  false, 'el sábado no abre'
);
select is(
  privado.abierta_en(null, 'America/Tegucigalpa', now()), true, 'sin horario, siempre abierta'
);

-- ── Fuera de horario la fila en línea se cierra sola ───────────────────────────────────────
update public.barberias set horario = pg_temp.siempre_cerrada()
where id = 'f1000000-0000-4000-8000-00000000000a';

select is(
  (public.fila_publica('horario-a') -> 'barberia' ->> 'abierta')::boolean,
  false, 'la fila pública dice que está cerrada'
);
select is(
  public.fila_publica('horario-a') -> 'barberia' -> 'horario',
  pg_temp.siempre_cerrada(), 'y manda el horario para decir cuándo abre'
);
select throws_ok(
  $$ select public.unirse_a_fila('f1000000-0000-4000-8000-00000000000a', 'Ana Pérez',
       'f3000000-0000-4000-8000-0000000000a1', repeat('a', 32)) $$,
  'P0001', 'fuera_de_horario', 'cerrada, no se anota desde el celular'
);
select lives_ok(
  $$ select public.unirse_a_fila('f1000000-0000-4000-8000-00000000000a', 'Beto Ruiz',
       'f3000000-0000-4000-8000-0000000000a1', repeat('b', 32), null, null, 'local') $$,
  'pero en el local, con el QR de la puerta, sí'
);

update public.barberias set horario = null where id = 'f1000000-0000-4000-8000-00000000000a';
select is(
  (public.fila_publica('horario-a') -> 'barberia' ->> 'abierta')::boolean,
  true, 'sin horario vuelve a estar abierta'
);
select lives_ok(
  $$ select public.unirse_a_fila('f1000000-0000-4000-8000-00000000000a', 'Carla Díaz',
       'f3000000-0000-4000-8000-0000000000a1', repeat('c', 32)) $$,
  'y se anota desde el celular'
);

-- ── El dueño lo edita con su sesión (RLS y la revisión de la tabla) ────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "f0000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select lives_ok(
  $$ update public.barberias set horario = '{
       "1": {"abre": "09:00", "cierra": "19:00"}, "2": {"abre": "09:00", "cierra": "19:00"},
       "3": {"abre": "09:00", "cierra": "19:00"}, "4": {"abre": "09:00", "cierra": "19:00"},
       "5": {"abre": "09:00", "cierra": "19:00"}, "6": null, "7": null}'::jsonb
     where id = 'f1000000-0000-4000-8000-00000000000a' $$,
  'el dueño guarda el horario'
);
select throws_ok(
  $$ update public.barberias set horario = '{"1": {"abre": "19:00", "cierra": "09:00"}}'
     where id = 'f1000000-0000-4000-8000-00000000000a' $$,
  '23514', null, 'y la base le rechaza uno inválido'
);
reset role;
select is(
  (select horario from public.barberias where id = 'f1000000-0000-4000-8000-00000000000a'),
  pg_temp.lunes_a_viernes(), 'quedó guardado el horario válido'
);

-- ── Permisos (fallo 7) ─────────────────────────────────────────────────────────────────────
select ok(
  not has_function_privilege('anon', 'privado.abierta_en(jsonb, text, timestamptz)', 'execute')
  and not has_function_privilege('authenticated', 'privado.abierta_en(jsonb, text, timestamptz)', 'execute')
  and not has_function_privilege('anon', 'privado.horario_valido(jsonb)', 'execute'),
  'el público no ejecuta las funciones del horario'
);

select * from finish();
rollback;
