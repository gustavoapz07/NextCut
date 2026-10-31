-- Funciones: validación (fallo 3), privacidad (fallo 5), permisos del barbero (fallo 7),
-- idempotencia (fallo 8), límites (fallo 9) y bitácora (fallo 10).
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email) values
  ('d0000000-0000-4000-8000-0000000000a1', 'duena@funciones.test'),
  ('d0000000-0000-4000-8000-0000000000a2', 'ana@funciones.test'),
  ('d0000000-0000-4000-8000-0000000000a3', 'beto@funciones.test');

insert into public.barberias (id, nombre, slug, max_fila) values
  ('d1000000-0000-4000-8000-00000000000a', 'Funciones A', 'funciones-a', 50),
  ('d1000000-0000-4000-8000-00000000000b', 'Funciones B', 'funciones-b', 50);

insert into public.miembros (user_id, barberia_id, rol) values
  ('d0000000-0000-4000-8000-0000000000a1', 'd1000000-0000-4000-8000-00000000000a', 'dueno'),
  ('d0000000-0000-4000-8000-0000000000a2', 'd1000000-0000-4000-8000-00000000000a', 'barbero'),
  ('d0000000-0000-4000-8000-0000000000a3', 'd1000000-0000-4000-8000-00000000000a', 'barbero');

insert into public.barberos (id, barberia_id, user_id, nombre, silla) values
  ('d2000000-0000-4000-8000-0000000000a1', 'd1000000-0000-4000-8000-00000000000a',
   'd0000000-0000-4000-8000-0000000000a2', 'Ana', 1),
  ('d2000000-0000-4000-8000-0000000000a2', 'd1000000-0000-4000-8000-00000000000a',
   'd0000000-0000-4000-8000-0000000000a3', 'Beto', 2),
  ('d2000000-0000-4000-8000-0000000000b1', 'd1000000-0000-4000-8000-00000000000b', null, 'Ciro', 1);

insert into public.servicios (id, barberia_id, nombre, duracion_min, precio_ref) values
  ('d3000000-0000-4000-8000-0000000000a1', 'd1000000-0000-4000-8000-00000000000a', 'Corte', 30, 150),
  ('d3000000-0000-4000-8000-0000000000b1', 'd1000000-0000-4000-8000-00000000000b', 'Corte', 30, 120);

select public.unirse_a_fila(
  'd1000000-0000-4000-8000-00000000000a', 'Óscar López', 'd3000000-0000-4000-8000-0000000000a1',
  repeat('a', 32), null, '+50499990011'
);
select public.unirse_a_fila(
  'd1000000-0000-4000-8000-00000000000a', 'Marta Díaz', 'd3000000-0000-4000-8000-0000000000a1',
  repeat('b', 32)
);

-- ── Validación al anotarse (fallo 3) ───────────────────────────────────────────────────────
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', repeat('x', 500),
       'd3000000-0000-4000-8000-0000000000a1', repeat('a', 32)) $$,
  '22023', 'nombre_invalido', 'rechaza un nombre de 500 caracteres'
);
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', ' A ',
       'd3000000-0000-4000-8000-0000000000a1', repeat('a', 32)) $$,
  '22023', 'nombre_invalido', 'rechaza un nombre de una letra'
);
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Ana Pérez',
       'd3000000-0000-4000-8000-0000000000a1', repeat('a', 32), null, '+15551234567') $$,
  '22023', 'telefono_invalido', 'rechaza un teléfono de otro país'
);
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Ana Pérez',
       'd3000000-0000-4000-8000-0000000000b1', repeat('a', 32)) $$,
  '22023', 'servicio_invalido', 'rechaza un servicio de otra barbería'
);
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Ana Pérez',
       'd3000000-0000-4000-8000-0000000000a1', repeat('a', 32),
       'd2000000-0000-4000-8000-0000000000b1') $$,
  '22023', 'barbero_invalido', 'rechaza un barbero de otra barbería'
);
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Ana Pérez',
       'd3000000-0000-4000-8000-0000000000a1', 'corto') $$,
  '22023', 'secreto_invalido', 'rechaza un secreto para cancelar demasiado corto'
);
select lives_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', '<script>alert(1)</script>',
       'd3000000-0000-4000-8000-0000000000a1', repeat('d', 32)) $$,
  'acepta texto con etiquetas, porque la interfaz lo muestra como texto'
);
select is(
  (select t.nombre from public.turnos t where t.secreto_hash = privado.hash_secreto(repeat('d', 32))),
  '<script>alert(1)</script>',
  'y lo guarda tal cual, sin interpretarlo'
);
select lives_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Carlos 💈 Mejía',
       'd3000000-0000-4000-8000-0000000000a1', repeat('e', 32)) $$,
  'acepta emojis en el nombre'
);

-- ── Idempotencia (fallo 8) ─────────────────────────────────────────────────────────────────
select is(
  (select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Doble Toque',
     'd3000000-0000-4000-8000-0000000000a1', repeat('f', 32), null, null, 'remoto', null,
     'd4000000-0000-4000-8000-000000000001') ->> 'codigo'),
  (select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Doble Toque',
     'd3000000-0000-4000-8000-0000000000a1', repeat('f', 32), null, null, 'remoto', null,
     'd4000000-0000-4000-8000-000000000001') ->> 'codigo'),
  'la misma clave de idempotencia devuelve el mismo turno'
);
select is(
  (select count(*)::int from public.turnos
   where clave_idempotencia = 'd4000000-0000-4000-8000-000000000001'),
  1, 'y crea un solo turno'
);

-- ── Límites (fallo 9) ──────────────────────────────────────────────────────────────────────
select lives_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Gabriel Soto',
       'd3000000-0000-4000-8000-0000000000a1', repeat('g', 32), null, '+504 8888-7777') $$,
  'acepta un teléfono con espacios y guiones'
);
select is(
  (select t.telefono from public.turnos t where t.secreto_hash = privado.hash_secreto(repeat('g', 32))),
  '+50488887777', 'y lo guarda limpio'
);
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Gabriel Otra Vez',
       'd3000000-0000-4000-8000-0000000000a1', repeat('h', 32), null, '+50488887777') $$,
  'P0001', 'telefono_con_turno', 'un solo turno activo por teléfono'
);
select lives_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Cliente ' || g,
       'd3000000-0000-4000-8000-0000000000a1', repeat('i', 31) || g, null, null, 'remoto',
       'hash-de-ip-de-prueba-01')
     from generate_series(1, 5) g $$,
  'pasan 5 turnos desde la misma IP'
);
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Cliente Seis',
       'd3000000-0000-4000-8000-0000000000a1', repeat('j', 32), null, null, 'remoto',
       'hash-de-ip-de-prueba-01') $$,
  'P0001', 'limite_ip', 'el sexto desde la misma IP en 10 minutos no pasa'
);

update public.barberias
set max_fila = (
  select count(*) from public.turnos t
  where t.barberia_id = 'd1000000-0000-4000-8000-00000000000a' and t.estado = 'esperando'
)
where id = 'd1000000-0000-4000-8000-00000000000a';
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Uno Más',
       'd3000000-0000-4000-8000-0000000000a1', repeat('k', 32)) $$,
  'P0001', 'fila_llena', 'con la fila llena nadie más se anota'
);
update public.barberias set max_fila = 50, fila_remota_activa = false
where id = 'd1000000-0000-4000-8000-00000000000a';
select throws_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'Desde Casa',
       'd3000000-0000-4000-8000-0000000000a1', repeat('l', 32)) $$,
  'P0001', 'fila_remota_pausada', 'con la fila remota pausada no se anota desde el celular'
);
select lives_ok(
  $$ select public.unirse_a_fila('d1000000-0000-4000-8000-00000000000a', 'En El Local',
       'd3000000-0000-4000-8000-0000000000a1', repeat('m', 32), null, null, 'local') $$,
  'pero en el local sí'
);
update public.barberias set fila_remota_activa = true
where id = 'd1000000-0000-4000-8000-00000000000a';

-- ── Privacidad de las funciones públicas (fallo 5) ─────────────────────────────────────────
select ok(public.fila_publica('funciones-a')::text not like '%+504%', 'la fila pública no trae teléfonos');
select ok(
  public.fila_publica('funciones-a')::text like '%Óscar L.%'
  and public.fila_publica('funciones-a')::text not like '%López%',
  'muestra "Óscar L.", nunca el apellido completo'
);
select ok(public.fila_publica('no-existe') is null, 'una barbería que no existe no devuelve nada');
select ok(
  public.ver_turno((select t.codigo_publico from public.turnos t where t.nombre = 'Óscar López'))::text
    not like '%+504%',
  'ver_turno no trae el teléfono'
);
select is(
  (public.ver_turno((select t.codigo_publico from public.turnos t where t.nombre = 'Marta Díaz'))
     ->> 'adelante')::int,
  1, 'ver_turno cuenta quién va adelante'
);
select ok(public.ver_turno('../../etc') is null, 'ver_turno ignora códigos con formato inválido');

-- ── Cancelar y avisos ──────────────────────────────────────────────────────────────────────
select is(
  public.cancelar_turno((select t.codigo_publico from public.turnos t where t.nombre = 'Marta Díaz'), repeat('z', 32)),
  false, 'cancelar con un secreto equivocado no hace nada'
);
select is(
  public.cancelar_turno((select t.codigo_publico from public.turnos t where t.nombre = 'Marta Díaz'), repeat('b', 32)),
  true, 'con el secreto correcto sí cancela'
);
select is(
  (select t.estado::text from public.turnos t where t.nombre = 'Marta Díaz'),
  'cancelado', 'y el turno queda cancelado'
);
select is(
  public.suscribir_push(
    (select t.codigo_publico from public.turnos t where t.nombre = 'Óscar López'), repeat('a', 32),
    jsonb_build_object(
      'endpoint', 'https://fcm.googleapis.com/fcm/send/abc',
      'keys', jsonb_build_object('p256dh', repeat('p', 40), 'auth', repeat('q', 16))
    )
  ),
  true, 'el cliente guarda su suscripción de avisos'
);

-- ── El barbero atiende (fallos 7 y 8) ──────────────────────────────────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "d0000000-0000-4000-8000-0000000000a2", "role": "authenticated"}';

select is(
  public.llamar_siguiente('d2000000-0000-4000-8000-0000000000a1') ->> 'nombre',
  'Óscar López', 'Ana llama al primero de la fila'
);
select throws_ok(
  $$ select public.llamar_siguiente('d2000000-0000-4000-8000-0000000000a1') $$,
  'P0001', 'barbero_ocupado', 'no puede llamar a otro mientras atiende'
);
select throws_ok(
  $$ select public.llamar_siguiente('d2000000-0000-4000-8000-0000000000a2') $$,
  '42501', 'sin_permiso', 'no llama por la silla de otro barbero'
);
select throws_ok(
  $$ select public.terminar_turno(
       (select t.id from public.turnos t where t.nombre = 'Óscar López'), 150, 'efectivo') $$,
  'P0001', 'estado_invalido', 'no termina un turno que no empezó'
);
select lives_ok(
  $$ select public.empezar_turno((select t.id from public.turnos t where t.nombre = 'Óscar López')) $$,
  'empieza el turno'
);

reset role;
set role authenticated;
set request.jwt.claims to '{"sub": "d0000000-0000-4000-8000-0000000000a3", "role": "authenticated"}';

select throws_ok(
  $$ select public.terminar_turno(
       (select t.id from public.turnos t where t.nombre = 'Óscar López'), 150, 'efectivo') $$,
  '42501', 'sin_permiso', 'un barbero no cierra el turno de otro'
);

reset role;
set role authenticated;
set request.jwt.claims to '{"sub": "d0000000-0000-4000-8000-0000000000a2", "role": "authenticated"}';

select throws_ok(
  $$ select public.terminar_turno(
       (select t.id from public.turnos t where t.nombre = 'Óscar López'), -5, 'efectivo') $$,
  '22023', 'monto_invalido', 'rechaza un monto negativo'
);
select throws_ok(
  $$ select public.terminar_turno(
       (select t.id from public.turnos t where t.nombre = 'Óscar López'), 150, 'efectivo',
       'd3000000-0000-4000-8000-0000000000b1') $$,
  '22023', 'servicio_invalido', 'rechaza cerrar con un servicio de otra barbería'
);
select lives_ok(
  $$ select public.terminar_turno(
       (select t.id from public.turnos t where t.nombre = 'Óscar López'), 180, 'transferencia') $$,
  'termina el turno con monto y método de pago'
);
select throws_ok(
  $$ select public.terminar_turno(
       (select t.id from public.turnos t where t.nombre = 'Óscar López'), 10, 'efectivo') $$,
  'P0001', 'estado_invalido', 'un turno atendido no se vuelve a cerrar'
);
select lives_ok(
  $$ select public.pausar_barbero('d2000000-0000-4000-8000-0000000000a1', true) $$,
  'Ana se pone en pausa'
);
select throws_ok(
  $$ select public.llamar_siguiente('d2000000-0000-4000-8000-0000000000a1') $$,
  'P0001', 'barbero_en_pausa', 'en pausa no llama a nadie'
);
select lives_ok(
  $$ select public.pausar_barbero('d2000000-0000-4000-8000-0000000000a1', false) $$,
  'y vuelve'
);

reset role;

select is(
  (select count(*)::int from public.suscripciones_push sp
   join public.turnos t on t.id = sp.turno_id where t.nombre = 'Óscar López'),
  0, 'al cerrar el turno se borra su suscripción de avisos'
);

-- ── Bitácora y turnos cerrados (fallos 7 y 10) ─────────────────────────────────────────────
select set_eq(
  $$ select e.accion from public.eventos_turno e
     join public.turnos t on t.id = e.turno_id where t.nombre = 'Óscar López' $$,
  array['creado', 'llamado', 'en_silla', 'atendido'],
  'la bitácora registra cada paso del turno'
);
select is(
  (select e.actor from public.eventos_turno e join public.turnos t on t.id = e.turno_id
   where t.nombre = 'Óscar López' and e.accion = 'atendido'),
  'd0000000-0000-4000-8000-0000000000a2'::uuid,
  'y quién cerró el turno'
);
select is(
  (select (e.detalle ->> 'monto')::numeric from public.eventos_turno e
   join public.turnos t on t.id = e.turno_id
   where t.nombre = 'Óscar López' and e.accion = 'atendido'),
  180::numeric, 'y el monto registrado'
);
select throws_ok(
  $$ update public.eventos_turno set accion = 'otro' $$,
  'P0001', 'bitacora_inmutable', 'la bitácora no se edita'
);
select throws_ok(
  $$ delete from public.eventos_turno $$,
  'P0001', 'bitacora_inmutable', 'ni se borra'
);
select throws_ok(
  $$ update public.turnos set monto = 1 where nombre = 'Óscar López' $$,
  'P0001', 'turno_cerrado', 'nadie edita un turno atendido, ni desde la base'
);
select lives_ok(
  $$ update public.turnos set telefono = null where nombre = 'Óscar López' $$,
  'de un turno cerrado solo se puede borrar el teléfono'
);
select throws_ok(
  $$ update public.turnos set estado = 'atendido' where nombre = 'Doble Toque' $$,
  'P0001', 'cambio_de_estado_invalido', 'no se salta estados (de esperando a atendido)'
);

-- ── El dueño modera la fila ────────────────────────────────────────────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "d0000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';

select lives_ok(
  $$ select public.renombrar_turno(
       (select t.id from public.turnos t where t.nombre = '<script>alert(1)</script>'), 'Cliente') $$,
  'la dueña renombra un turno'
);
select lives_ok(
  $$ select public.ocultar_turno(
       (select t.id from public.turnos t where t.nombre = 'Carlos 💈 Mejía'), true) $$,
  'y oculta otro'
);
select throws_ok(
  $$ select public.renombrar_turno(
       (select t.id from public.turnos t where t.nombre = 'Cliente'), repeat('x', 41)) $$,
  '22023', 'nombre_invalido', 'el nuevo nombre también se valida'
);
select is(
  (public.reporte_dia('d1000000-0000-4000-8000-00000000000a') ->> 'atendidos')::int,
  1, 'el reporte cuenta el turno atendido'
);
select is(
  (public.reporte_dia('d1000000-0000-4000-8000-00000000000a') ->> 'ingresos')::numeric,
  180::numeric, 'y sus ingresos'
);

reset role;

select ok(
  public.fila_publica('funciones-a')::text not like '%<script>%'
  and public.fila_publica('funciones-a')::text not like '%Mejía%',
  'la fila pública ya no muestra el nombre renombrado ni el oculto'
);
select is(
  (select count(*)::int from public.eventos_turno where accion in ('renombrado', 'oculto')
   and barberia_id = 'd1000000-0000-4000-8000-00000000000a'),
  2, 'renombrar y ocultar quedan en la bitácora'
);

-- ── No llegó y tolerancia ──────────────────────────────────────────────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "d0000000-0000-4000-8000-0000000000a3", "role": "authenticated"}';

select is(
  public.llamar_siguiente('d2000000-0000-4000-8000-0000000000a2') ->> 'nombre',
  'Cliente', 'Beto llama al siguiente'
);
select lives_ok(
  $$ select public.marcar_no_llego((select t.id from public.turnos t where t.nombre = 'Cliente')) $$,
  'y lo marca como "no llegó"'
);

reset role;
set role authenticated;
set request.jwt.claims to '{"sub": "d0000000-0000-4000-8000-0000000000a2", "role": "authenticated"}';

select ok(
  public.llamar_siguiente('d2000000-0000-4000-8000-0000000000a1') is not null,
  'Ana llama a otro cliente'
);

reset role;

update public.turnos set llamado_en = now() - interval '10 minutes'
where barbero_id = 'd2000000-0000-4000-8000-0000000000a1' and estado = 'llamado';
select is(public.vencer_tolerancia(), 1, 'si pasa la tolerancia, queda como "no llegó" solo');

-- ── Cierre del día y borrado de teléfonos ──────────────────────────────────────────────────
update public.turnos set dia = dia - 1 where nombre = 'Doble Toque';
select ok(public.cerrar_dia() >= 1, 'al cerrar el día, quien seguía esperando ayer');
select is(
  (select t.estado::text from public.turnos t where t.nombre = 'Doble Toque'),
  'abandono', 'cuenta como abandono'
);

update public.turnos set creado_en = now() - interval '100 days' where nombre = 'Gabriel Soto';
select public.cancelar_turno(
  (select t.codigo_publico from public.turnos t where t.nombre = 'Gabriel Soto'), repeat('g', 32)
);
select is(public.borrar_telefonos_viejos(), 1, 'borra el teléfono de los turnos de hace más de 90 días');
select is(
  (select t.telefono from public.turnos t where t.nombre = 'Gabriel Soto'),
  null, 'y el turno queda sin teléfono'
);

select * from finish();
rollback;
