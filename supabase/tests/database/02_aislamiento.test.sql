-- Aislamiento: el público no toca tablas y una barbería no ve ni toca otra (fallos 2 y 7).
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Datos: barbería A (dueña, dos barberos) y barbería B (dueño, un barbero sin cuenta).
insert into auth.users (id, email) values
  ('c0000000-0000-4000-8000-0000000000a1', 'duena-a@aislamiento.test'),
  ('c0000000-0000-4000-8000-0000000000a2', 'barbero-a1@aislamiento.test'),
  ('c0000000-0000-4000-8000-0000000000a3', 'barbero-a2@aislamiento.test'),
  ('c0000000-0000-4000-8000-0000000000b1', 'dueno-b@aislamiento.test');

insert into public.barberias (id, nombre, slug) values
  ('c1000000-0000-4000-8000-00000000000a', 'Aislamiento A', 'aislamiento-a'),
  ('c1000000-0000-4000-8000-00000000000b', 'Aislamiento B', 'aislamiento-b');

insert into public.miembros (user_id, barberia_id, rol) values
  ('c0000000-0000-4000-8000-0000000000a1', 'c1000000-0000-4000-8000-00000000000a', 'dueno'),
  ('c0000000-0000-4000-8000-0000000000a2', 'c1000000-0000-4000-8000-00000000000a', 'barbero'),
  ('c0000000-0000-4000-8000-0000000000a3', 'c1000000-0000-4000-8000-00000000000a', 'barbero'),
  ('c0000000-0000-4000-8000-0000000000b1', 'c1000000-0000-4000-8000-00000000000b', 'dueno');

insert into public.barberos (id, barberia_id, user_id, nombre, silla) values
  ('c2000000-0000-4000-8000-0000000000a1', 'c1000000-0000-4000-8000-00000000000a',
   'c0000000-0000-4000-8000-0000000000a2', 'Ana', 1),
  ('c2000000-0000-4000-8000-0000000000a2', 'c1000000-0000-4000-8000-00000000000a',
   'c0000000-0000-4000-8000-0000000000a3', 'Beto', 2),
  ('c2000000-0000-4000-8000-0000000000b1', 'c1000000-0000-4000-8000-00000000000b', null, 'Ciro', 1);

insert into public.servicios (id, barberia_id, nombre, duracion_min, precio_ref) values
  ('c3000000-0000-4000-8000-0000000000a1', 'c1000000-0000-4000-8000-00000000000a', 'Corte', 30, 150),
  ('c3000000-0000-4000-8000-0000000000b1', 'c1000000-0000-4000-8000-00000000000b', 'Corte', 30, 120);

select public.unirse_a_fila(
  'c1000000-0000-4000-8000-00000000000a', 'Iván Castro', 'c3000000-0000-4000-8000-0000000000a1',
  repeat('a', 32), null, '+50499990001'
);
select public.unirse_a_fila(
  'c1000000-0000-4000-8000-00000000000a', 'Rosa Mena', 'c3000000-0000-4000-8000-0000000000a1',
  repeat('b', 32)
);
select public.unirse_a_fila(
  'c1000000-0000-4000-8000-00000000000b', 'Pedro Pérez', 'c3000000-0000-4000-8000-0000000000b1',
  repeat('c', 32), null, '+50499990003'
);

-- El id real de un turno de B, para atacarlo después desde A.
select set_config(
  'prueba.turno_b',
  (select t.id::text from public.turnos t where t.barberia_id = 'c1000000-0000-4000-8000-00000000000b'),
  false
);

-- El público (clave publicable, sin sesión).
set role anon;
set request.jwt.claims to '{"role": "anon"}';

select throws_ok($$ select * from public.turnos $$, '42501', null, 'el público no lee turnos');
select throws_ok($$ select * from public.barberias $$, '42501', null, 'el público no lee barberías');
select throws_ok(
  $$ insert into public.turnos (barberia_id) values ('c1000000-0000-4000-8000-00000000000a') $$,
  '42501', null, 'el público no escribe en turnos'
);
select throws_ok(
  $$ select public.unirse_a_fila('c1000000-0000-4000-8000-00000000000a', 'Intruso',
       'c3000000-0000-4000-8000-0000000000a1', repeat('x', 32)) $$,
  '42501', null, 'el público no se salta la Edge Function para anotarse'
);
select throws_ok(
  $$ select public.llamar_siguiente('c2000000-0000-4000-8000-0000000000a1') $$,
  '42501', null, 'el público no llama turnos'
);
select ok(public.fila_publica('aislamiento-a') is not null, 'el público sí ve la fila pública');

reset role;

-- La dueña de A.
set role authenticated;
set request.jwt.claims to '{"sub": "c0000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';

select is((select count(*)::int from public.turnos), 2, 'la dueña de A ve solo los 2 turnos de A');
select is(
  (select count(*)::int from public.turnos where barberia_id = 'c1000000-0000-4000-8000-00000000000b'),
  0, 'la dueña de A no ve los turnos de B'
);
select is((select count(*)::int from public.barberias), 1, 'la dueña de A ve solo su barbería');
select results_eq(
  $$ with u as (
       update public.barberias set nombre = 'Hackeada'
       where id = 'c1000000-0000-4000-8000-00000000000b' returning 1
     ) select count(*)::int from u $$,
  $$ values (0) $$,
  'la dueña de A no edita la barbería B'
);
select throws_ok(
  $$ insert into public.servicios (barberia_id, nombre, duracion_min)
     values ('c1000000-0000-4000-8000-00000000000b', 'Intruso', 30) $$,
  '42501', null, 'la dueña de A no agrega servicios en B'
);
select lives_ok(
  $$ insert into public.servicios (barberia_id, nombre, duracion_min)
     values ('c1000000-0000-4000-8000-00000000000a', 'Barba', 20) $$,
  'la dueña de A sí agrega servicios en A'
);
select throws_ok(
  $$ update public.turnos set nombre = 'Otro nombre' $$,
  '42501', null, 'nadie edita turnos directo: solo con las funciones'
);
select throws_ok(
  $$ select * from public.suscripciones_push $$,
  '42501', null, 'nadie lee las suscripciones push'
);
select ok((select count(*) from public.eventos_turno) > 0, 'la dueña lee la bitácora de A');
select is(
  (select count(*)::int from public.eventos_turno
   where barberia_id = 'c1000000-0000-4000-8000-00000000000b'),
  0, 'pero no la de B'
);
select throws_ok(
  $$ select public.reporte_dia('c1000000-0000-4000-8000-00000000000b') $$,
  '42501', 'sin_permiso', 'la dueña de A no ve el reporte de B'
);
select lives_ok(
  $$ select public.reporte_dia('c1000000-0000-4000-8000-00000000000a') $$,
  'la dueña de A ve su propio reporte'
);
select throws_ok(
  $$ select public.renombrar_turno(current_setting('prueba.turno_b')::uuid, 'Cliente') $$,
  '42501', 'sin_permiso', 'la dueña de A no renombra turnos de B aunque conozca su id'
);

reset role;

-- Un barbero de A.
set role authenticated;
set request.jwt.claims to '{"sub": "c0000000-0000-4000-8000-0000000000a2", "role": "authenticated"}';

select is((select count(*)::int from public.turnos), 2, 'el barbero ve los turnos de su barbería');
select is((select count(*)::int from public.eventos_turno), 0, 'el barbero no lee la bitácora');
select is((select count(*)::int from public.miembros), 1, 'el barbero solo ve su propia membresía');
select results_eq(
  $$ with u as (update public.barberias set max_fila = 99 returning 1) select count(*)::int from u $$,
  $$ values (0) $$,
  'el barbero no cambia la configuración de la barbería'
);
select throws_ok(
  $$ insert into public.barberos (barberia_id, nombre)
     values ('c1000000-0000-4000-8000-00000000000a', 'Nuevo') $$,
  '42501', null, 'el barbero no agrega barberos'
);
select throws_ok(
  $$ select public.pausar_fila_remota('c1000000-0000-4000-8000-00000000000a', true) $$,
  '42501', 'sin_permiso', 'el barbero no pausa la fila remota'
);
select throws_ok(
  $$ select public.llamar_siguiente('c2000000-0000-4000-8000-0000000000b1') $$,
  '42501', 'sin_permiso', 'el barbero de A no llama turnos de B'
);

reset role;

-- El dueño de B.
set role authenticated;
set request.jwt.claims to '{"sub": "c0000000-0000-4000-8000-0000000000b1", "role": "authenticated"}';

select is((select count(*)::int from public.turnos), 1, 'el dueño de B ve solo su turno');
select is(
  (select count(*)::int from public.miembros), 1, 'el dueño de B no ve los miembros de A'
);
select throws_ok(
  $$ select public.llamar_siguiente('c2000000-0000-4000-8000-0000000000a1') $$,
  '42501', 'sin_permiso', 'el dueño de B no llama turnos de A'
);

reset role;

select * from finish();
rollback;
