-- Avisos por Web Push: solo servicios de push conocidos (SSRF), la base llama a la función de
-- avisos solo cuando hace falta, cada turno recibe como máximo 2 avisos (fallo 6) y solo la clave
-- secreta toca lo de los avisos (fallo 7). El cifrado y lo que manda la función se prueban con
-- Vitest (supabase/functions/_shared).
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Estas pruebas ponen su propia configuración; la del entorno vuelve con el rollback.
delete from vault.secrets where name in ('avisos_url', 'avisos_clave');

insert into auth.users (id, email) values
  ('e0000000-0000-4000-8000-0000000000a1', 'ana@avisos.test');
insert into public.barberias (id, nombre, slug, max_fila) values
  ('e1000000-0000-4000-8000-00000000000a', 'Avisos A', 'avisos-a', 50),
  ('e1000000-0000-4000-8000-00000000000b', 'Avisos B', 'avisos-b', 50);
insert into public.miembros (user_id, barberia_id, rol) values
  ('e0000000-0000-4000-8000-0000000000a1', 'e1000000-0000-4000-8000-00000000000a', 'barbero');
insert into public.barberos (id, barberia_id, user_id, nombre, silla) values
  ('e2000000-0000-4000-8000-0000000000a1', 'e1000000-0000-4000-8000-00000000000a',
   'e0000000-0000-4000-8000-0000000000a1', 'Ana', 3);
insert into public.servicios (id, barberia_id, nombre, duracion_min) values
  ('e3000000-0000-4000-8000-0000000000a1', 'e1000000-0000-4000-8000-00000000000a', 'Corte', 30);

select public.unirse_a_fila(
  'e1000000-0000-4000-8000-00000000000a', 'Pedro Ruiz', 'e3000000-0000-4000-8000-0000000000a1',
  repeat('p', 32)
);
select public.unirse_a_fila(
  'e1000000-0000-4000-8000-00000000000a', 'Óscar López', 'e3000000-0000-4000-8000-0000000000a1',
  repeat('a', 32)
);
select public.unirse_a_fila(
  'e1000000-0000-4000-8000-00000000000a', 'Marta Díaz', 'e3000000-0000-4000-8000-0000000000a1',
  repeat('b', 32)
);

-- Solo los turnos de esta prueba: la base puede tener otros con el mismo nombre.
create function pg_temp.codigo(p_nombre text) returns text language sql as $$
  select t.codigo_publico from public.turnos t
  where t.nombre = p_nombre and t.barberia_id = 'e1000000-0000-4000-8000-00000000000a'
$$;
create function pg_temp.id(p_nombre text) returns uuid language sql as $$
  select t.id from public.turnos t
  where t.nombre = p_nombre and t.barberia_id = 'e1000000-0000-4000-8000-00000000000a'
$$;
create function pg_temp.suscripcion(p_endpoint text, p_auth text default null) returns jsonb
language sql as $$
  select jsonb_build_object(
    'endpoint', p_endpoint,
    'keys', jsonb_build_object('p256dh', 'B' || repeat('p', 86), 'auth', coalesce(p_auth, repeat('q', 22)))
  )
$$;
create function pg_temp.en_cola() returns integer language sql as $$
  select count(*)::integer from net.http_request_queue where url = 'https://avisos.test/functions/v1/avisos'
$$;

select has_extension('pg_net', 'pg_net está activo');
select is(
  (select schedule || ' · ' || command from cron.job where jobname = 'revisar-avisos'),
  '* * * * * · select privado.revisar_avisos()', 'los avisos se revisan cada minuto'
);
select ok((select active from cron.job where jobname = 'revisar-avisos'), 'y la tarea está activa');

-- ── Solo servicios de push conocidos (SSRF y fallo 3) ───────────────────────────────────────
select is(
  public.suscribir_push(pg_temp.codigo('Óscar López'), repeat('a', 32),
    pg_temp.suscripcion('https://push.example.com/abc')),
  false, 'rechaza un endpoint que no es de un servicio de push'
);
select is(
  public.suscribir_push(pg_temp.codigo('Óscar López'), repeat('a', 32),
    pg_temp.suscripcion('https://fcm.googleapis.com.ataque.com/abc')),
  false, 'rechaza un dominio que solo empieza como el de Google'
);
select is(
  public.suscribir_push(pg_temp.codigo('Óscar López'), repeat('a', 32),
    pg_temp.suscripcion('https://fcm.googleapis.com/fcm/send/abc', '<script>alert(1)</script>')),
  false, 'rechaza claves que no son base64url'
);
select is(
  public.suscribir_push(pg_temp.codigo('Óscar López'), repeat('a', 32), '"hola"'::jsonb),
  false, 'rechaza algo que no es una suscripción'
);
select is(
  public.suscribir_push(pg_temp.codigo('Óscar López'), repeat('x', 32),
    pg_temp.suscripcion('https://fcm.googleapis.com/fcm/send/abc')),
  false, 'sin el secreto del turno no suscribe'
);
select throws_ok(
  $$ insert into public.suscripciones_push (turno_id, endpoint, p256dh, auth)
     values (pg_temp.id('Óscar López'), 'https://169.254.169.254/latest', 'B' || repeat('p', 86), repeat('q', 22)) $$,
  '23514', null, 'la tabla tampoco acepta otro endpoint aunque se escriba directo'
);
select is(
  public.suscribir_push(pg_temp.codigo('Óscar López'), repeat('a', 32),
    pg_temp.suscripcion('https://fcm.googleapis.com/fcm/send/abc')),
  true, 'acepta la suscripción de Chrome (Google)'
);
select is(
  public.suscribir_push(pg_temp.codigo('Marta Díaz'), repeat('b', 32),
    pg_temp.suscripcion('https://web.push.apple.com/QGuQyavXutnMH')),
  true, 'y la de un iPhone (Apple)'
);
select is(
  public.suscribir_push(pg_temp.codigo('Pedro Ruiz'), repeat('p', 32),
    pg_temp.suscripcion('https://updates.push.services.mozilla.com/wpush/v2/abc')),
  true, 'y la de Firefox (Mozilla)'
);

-- ── Sin la dirección y la clave en Vault (Supabase local y CI) no se llama a nada ────────────
select lives_ok(
  $$ select public.cancelar_turno(pg_temp.codigo('Pedro Ruiz'), repeat('p', 32)) $$,
  'sin configuración, un cambio de turno funciona igual'
);
select is(pg_temp.en_cola(), 0, 'y no manda ninguna solicitud');
select is(
  (select count(*)::integer from public.suscripciones_push where turno_id = pg_temp.id('Pedro Ruiz')),
  0, 'al cancelar se borra la suscripción'
);
select throws_ok(
  $$ select public.avisos_pendientes(repeat('f', 64)) $$,
  '42501', 'sin_permiso', 'sin clave en Vault nadie lee los avisos pendientes'
);

select vault.create_secret('https://avisos.test/functions/v1/avisos', 'avisos_url');
select vault.create_secret(repeat('f', 64), 'avisos_clave');

-- ── La función lee lo pendiente solo con la clave de Vault ──────────────────────────────────
select throws_ok(
  $$ select public.avisos_pendientes(repeat('0', 64)) $$,
  '42501', 'sin_permiso', 'con otra clave no devuelve nada'
);
select throws_ok(
  $$ select public.avisos_pendientes(null) $$,
  '42501', 'sin_permiso', 'sin clave tampoco'
);
select is(
  jsonb_array_length(public.avisos_pendientes(repeat('f', 64))), 2,
  'con la clave ve los dos turnos suscritos que esperan'
);
select is(
  jsonb_array_length(public.avisos_pendientes(repeat('f', 64), 'e1000000-0000-4000-8000-00000000000b')), 0,
  'y filtra por barbería'
);
select ok(
  not exists (
    select 1 from jsonb_array_elements(public.avisos_pendientes(repeat('f', 64))) p
    where p ? 'telefono' or p ->> 'nombre' is not null
  ),
  'sin teléfonos ni nombres (fallo 5)'
);
select is(
  (select p ->> 'barbero' from jsonb_array_elements(public.avisos_pendientes(repeat('f', 64))) p
   where p ->> 'codigo' = pg_temp.codigo('Óscar López')),
  null, 'con "el primero libre" todavía no hay barbero'
);

-- ── El reloj llama solo si hay algo pendiente ──────────────────────────────────────────────
select isnt(privado.revisar_avisos(), null, 'con avisos pendientes, el reloj llama a la función');
select is(pg_temp.en_cola(), 1, 'una solicitud a la dirección de Vault');
select is(
  (select headers ->> 'x-avisos-clave' from net.http_request_queue
   where url = 'https://avisos.test/functions/v1/avisos' order by id desc limit 1),
  repeat('f', 64), 'con la clave en el encabezado'
);
select is(
  (select convert_from(body, 'utf8')::jsonb from net.http_request_queue
   where url = 'https://avisos.test/functions/v1/avisos' order by id desc limit 1),
  '{}'::jsonb, 'y sin barbería: revisa todas'
);

-- ── "Ya casi": se reserva una sola vez ─────────────────────────────────────────────────────
select is(public.reservar_aviso(pg_temp.id('Óscar López'), 'casi'), true, 'reserva el aviso de 15 minutos');
select is(public.reservar_aviso(pg_temp.id('Óscar López'), 'casi'), false, 'y no lo reserva dos veces');
select is(
  public.reservar_aviso(pg_temp.id('Óscar López'), 'llamado'), false,
  'no reserva "te toca" mientras espera'
);
select throws_ok(
  $$ select public.reservar_aviso(pg_temp.id('Óscar López'), 'otro') $$,
  '22023', 'tipo_invalido', 'solo hay dos tipos de aviso'
);
select is(public.liberar_aviso(pg_temp.id('Óscar López'), 'casi'), true, 'tras una falla se libera');
select is(public.reservar_aviso(pg_temp.id('Óscar López'), 'casi'), true, 'y se puede volver a reservar');
select is(
  (select jsonb_agg(p ->> 'codigo') from jsonb_array_elements(public.avisos_pendientes(repeat('f', 64))) p),
  jsonb_build_array(pg_temp.codigo('Marta Díaz')),
  'quien ya recibió "ya casi" y sigue esperando no tiene nada pendiente'
);

-- ── El barbero llama: la base avisa a la función con la barbería ────────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "e0000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select is(
  public.llamar_siguiente('e2000000-0000-4000-8000-0000000000a1') ->> 'nombre',
  'Óscar López', 'Ana llama a Óscar'
);
reset role;

select is(pg_temp.en_cola(), 2, 'el cambio de estado manda otra solicitud');
select is(
  (select convert_from(body, 'utf8')::jsonb from net.http_request_queue
   where url = 'https://avisos.test/functions/v1/avisos' order by id desc limit 1),
  jsonb_build_object('barberia_id', 'e1000000-0000-4000-8000-00000000000a'),
  'solo de su barbería'
);
select is(
  (select p ->> 'estado' || ' · ' || (p ->> 'barbero') || ' · ' || (p ->> 'silla')
   from jsonb_array_elements(public.avisos_pendientes(repeat('f', 64))) p
   where p ->> 'codigo' = pg_temp.codigo('Óscar López')),
  'llamado · Ana · 3', 'Óscar queda pendiente de "te toca", con su barbero y su silla'
);

-- ── "Te toca": máximo 2 avisos por turno (fallo 6) ─────────────────────────────────────────
select is(public.reservar_aviso(pg_temp.id('Óscar López'), 'llamado'), true, 'reserva "te toca"');
select is(public.reservar_aviso(pg_temp.id('Óscar López'), 'llamado'), false, 'una sola vez');
select is(
  public.reservar_aviso(pg_temp.id('Óscar López'), 'casi'), false,
  'ya llamado no recibe "ya casi"'
);
select is(
  (select count(*)::integer from public.suscripciones_push
   where turno_id = pg_temp.id('Óscar López')
     and aviso_casi_en is not null and aviso_llamado_en is not null),
  1, 'Óscar recibió sus 2 avisos y nada más'
);
select is(
  public.suscribir_push(pg_temp.codigo('Óscar López'), repeat('a', 32),
    pg_temp.suscripcion('https://fcm.googleapis.com/fcm/send/otro-navegador')),
  true, 'puede cambiar de navegador'
);
select is(
  (select aviso_llamado_en is not null from public.suscripciones_push
   where turno_id = pg_temp.id('Óscar López')),
  true, 'pero los avisos enviados siguen contando'
);

-- ── Al sentarse ya no hay nada que avisar ──────────────────────────────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "e0000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select lives_ok(
  $$ select public.empezar_turno((select t.id from public.turnos t
       where t.nombre = 'Óscar López' and t.barberia_id = 'e1000000-0000-4000-8000-00000000000a')) $$,
  'Óscar se sienta'
);
reset role;
select is(
  (select count(*)::integer from public.suscripciones_push where turno_id = pg_temp.id('Óscar López')),
  0, 'y se borra su suscripción'
);
select is(public.borrar_suscripcion(pg_temp.id('Marta Díaz')), true, 'un navegador vencido se borra');
select is(public.borrar_suscripcion(pg_temp.id('Marta Díaz')), false, 'una sola vez');
select is(privado.revisar_avisos(), null, 'sin suscripciones pendientes, el reloj no llama a nada');

-- ── Permisos (fallo 7) ─────────────────────────────────────────────────────────────────────
select ok(
  not has_function_privilege('anon', 'public.avisos_pendientes(text, uuid)', 'execute')
  and not has_function_privilege('authenticated', 'public.avisos_pendientes(text, uuid)', 'execute')
  and not has_function_privilege('anon', 'public.reservar_aviso(uuid, text)', 'execute')
  and not has_function_privilege('authenticated', 'public.reservar_aviso(uuid, text)', 'execute')
  and not has_function_privilege('anon', 'public.liberar_aviso(uuid, text)', 'execute')
  and not has_function_privilege('authenticated', 'public.borrar_suscripcion(uuid)', 'execute')
  and not has_function_privilege('anon', 'privado.llamar_avisos(uuid)', 'execute')
  and not has_function_privilege('authenticated', 'privado.revisar_avisos()', 'execute'),
  'ni el público ni el personal tocan los avisos'
);
select ok(
  has_function_privilege('service_role', 'public.avisos_pendientes(text, uuid)', 'execute')
  and has_function_privilege('service_role', 'public.reservar_aviso(uuid, text)', 'execute')
  and has_function_privilege('service_role', 'public.liberar_aviso(uuid, text)', 'execute')
  and has_function_privilege('service_role', 'public.borrar_suscripcion(uuid)', 'execute'),
  'la Edge Function sí, con la clave secreta'
);

select * from finish();
rollback;
