-- Cierre del día y borrado de teléfonos (fallo 5): las dos tareas están programadas, el cierre
-- respeta la zona horaria de cada barbería y no toca a quien quedó en la silla, y el borrado solo
-- quita el teléfono de turnos cerrados y viejos. Los casos básicos están en 03_funciones.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into public.barberias (id, nombre, slug, zona_horaria) values
  ('71000000-0000-4000-8000-00000000000a', 'Cierre Honduras', 'cierre-honduras', 'America/Tegucigalpa'),
  ('71000000-0000-4000-8000-00000000000b', 'Cierre Kiritimati', 'cierre-kiritimati', 'Pacific/Kiritimati'),
  ('71000000-0000-4000-8000-00000000000c', 'Cierre Pago Pago', 'cierre-pago-pago', 'Pacific/Pago_Pago');
insert into public.barberos (id, barberia_id, nombre, silla) values
  ('72000000-0000-4000-8000-0000000000a1', '71000000-0000-4000-8000-00000000000a', 'Ana', 1),
  ('72000000-0000-4000-8000-0000000000a2', '71000000-0000-4000-8000-00000000000a', 'Beto', 2);
insert into public.servicios (id, barberia_id, nombre, duracion_min) values
  ('73000000-0000-4000-8000-0000000000a1', '71000000-0000-4000-8000-00000000000a', 'Corte', 30),
  ('73000000-0000-4000-8000-0000000000b1', '71000000-0000-4000-8000-00000000000b', 'Corte', 30),
  ('73000000-0000-4000-8000-0000000000c1', '71000000-0000-4000-8000-00000000000c', 'Corte', 30);

-- El día de hoy en una zona horaria, y un turno por nombre.
create function pg_temp.hoy(p_zona text) returns date language sql as $$
  select (now() at time zone p_zona)::date
$$;
create function pg_temp.turno(p_nombre text) returns public.turnos language sql as $$
  select * from public.turnos where nombre = p_nombre
$$;

insert into public.turnos (
  id, barberia_id, dia, numero, codigo_publico, secreto_hash, nombre, telefono, barbero_id,
  servicio_id, estado, creado_en, llamado_en, inicio_en, fin_en, monto, metodo_pago
) values
  ('74000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-00000000000a',
   pg_temp.hoy('America/Tegucigalpa') - 1, 1, 'CDAAAAAAA2', repeat('a', 64), 'Ayer Esperando',
   '+50499990001', null, '73000000-0000-4000-8000-0000000000a1', 'esperando',
   now() - interval '1 day', null, null, null, null, null),
  ('74000000-0000-4000-8000-000000000002', '71000000-0000-4000-8000-00000000000a',
   pg_temp.hoy('America/Tegucigalpa') - 1, 2, 'CDBAAAAAA2', repeat('a', 64), 'Ayer Llamado',
   '+50499990002', '72000000-0000-4000-8000-0000000000a1', '73000000-0000-4000-8000-0000000000a1',
   'llamado', now() - interval '1 day', now() - interval '1 day', null, null, null, null),
  ('74000000-0000-4000-8000-000000000003', '71000000-0000-4000-8000-00000000000a',
   pg_temp.hoy('America/Tegucigalpa') - 1, 3, 'CDCAAAAAA2', repeat('a', 64), 'Ayer En Silla',
   '+50499990003', '72000000-0000-4000-8000-0000000000a2', '73000000-0000-4000-8000-0000000000a1',
   'en_silla', now() - interval '1 day', now() - interval '1 day', now() - interval '1 day',
   null, null, null),
  ('74000000-0000-4000-8000-000000000004', '71000000-0000-4000-8000-00000000000a',
   pg_temp.hoy('America/Tegucigalpa'), 1, 'CDDAAAAAA2', repeat('a', 64), 'Hoy Esperando',
   '+50499990004', null, '73000000-0000-4000-8000-0000000000a1', 'esperando',
   now(), null, null, null, null, null),
  ('74000000-0000-4000-8000-000000000005', '71000000-0000-4000-8000-00000000000a',
   pg_temp.hoy('America/Tegucigalpa') - 100, 1, 'CDEAAAAAA2', repeat('a', 64), 'Viejo Atendido',
   '+50499990005', '72000000-0000-4000-8000-0000000000a1', '73000000-0000-4000-8000-0000000000a1',
   'atendido', now() - interval '100 days', now() - interval '100 days',
   now() - interval '100 days', now() - interval '100 days', 150, 'efectivo'),
  ('74000000-0000-4000-8000-000000000006', '71000000-0000-4000-8000-00000000000a',
   pg_temp.hoy('America/Tegucigalpa') - 100, 2, 'CDFAAAAAA2', repeat('a', 64), 'Viejo Cancelado',
   '+50499990006', null, '73000000-0000-4000-8000-0000000000a1', 'cancelado',
   now() - interval '100 days', null, null, now() - interval '100 days', null, null),
  ('74000000-0000-4000-8000-000000000007', '71000000-0000-4000-8000-00000000000a',
   pg_temp.hoy('America/Tegucigalpa') - 80, 1, 'CDGAAAAAA2', repeat('a', 64), 'Reciente Cancelado',
   '+50499990007', null, '73000000-0000-4000-8000-0000000000a1', 'cancelado',
   now() - interval '80 days', null, null, now() - interval '80 days', null, null),
  -- La misma fecha en las dos barberías del Pacífico: hoy en Pago Pago (UTC−11) es por lo menos
  -- ayer en Kiritimati (UTC+14), que va 25 horas adelante.
  ('74000000-0000-4000-8000-000000000008', '71000000-0000-4000-8000-00000000000b',
   pg_temp.hoy('Pacific/Pago_Pago'), 1, 'CDHAAAAAA2', repeat('a', 64), 'Kiri Esperando',
   null, null, '73000000-0000-4000-8000-0000000000b1', 'esperando',
   now(), null, null, null, null, null),
  ('74000000-0000-4000-8000-000000000009', '71000000-0000-4000-8000-00000000000c',
   pg_temp.hoy('Pacific/Pago_Pago'), 1, 'CDJAAAAAA2', repeat('a', 64), 'Pago Esperando',
   null, null, '73000000-0000-4000-8000-0000000000c1', 'esperando',
   now(), null, null, null, null, null);

insert into public.suscripciones_push (turno_id, endpoint, p256dh, auth) values
  ('74000000-0000-4000-8000-000000000001', 'https://fcm.googleapis.com/fcm/send/cierre-1',
   'B' || repeat('p', 86), repeat('q', 22)),
  ('74000000-0000-4000-8000-000000000004', 'https://fcm.googleapis.com/fcm/send/cierre-4',
   'B' || repeat('p', 86), repeat('q', 22));

-- ── Programadas con pg_cron ────────────────────────────────────────────────────────────────
select is(
  (select schedule from cron.job where jobname = 'cerrar-dia'),
  '1 * * * *', 'el cierre del día corre cada hora, al minuto 1'
);
select is(
  (select command from cron.job where jobname = 'cerrar-dia'),
  'select public.cerrar_dia()', 'y solo llama a cerrar_dia()'
);
select ok((select active from cron.job where jobname = 'cerrar-dia'), 'el cierre está activo');
select is(
  (select schedule from cron.job where jobname = 'borrar-telefonos-viejos'),
  '40 9 * * *', 'el borrado corre una vez al día, a las 3:40 a. m. de Honduras'
);
select is(
  (select command from cron.job where jobname = 'borrar-telefonos-viejos'),
  'select public.borrar_telefonos_viejos()', 'y usa el plazo de 90 días'
);
select ok(
  (select active from cron.job where jobname = 'borrar-telefonos-viejos'), 'el borrado está activo'
);
select is(
  (select count(*)::integer from cron.job where jobname in ('cerrar-dia', 'borrar-telefonos-viejos')),
  2, 'cada tarea existe una sola vez'
);

-- ── Cierre del día ─────────────────────────────────────────────────────────────────────────
select ok(public.cerrar_dia() >= 3, 'cierra los turnos abiertos de un día anterior');
select is((pg_temp.turno('Ayer Esperando')).estado::text, 'abandono', 'quien esperaba desde ayer cuenta como abandono');
select ok((pg_temp.turno('Ayer Esperando')).fin_en is not null, 'con la hora del cierre');
select is((pg_temp.turno('Ayer Llamado')).estado::text, 'no_llego', 'quien fue llamado ayer queda como "no llegó"');
select is(
  (pg_temp.turno('Ayer En Silla')).estado::text, 'en_silla',
  'quien quedó en la silla no se toca: el barbero registra el cobro'
);
select is((pg_temp.turno('Hoy Esperando')).estado::text, 'esperando', 'quien espera hoy sigue en la fila');
select is(
  (pg_temp.turno('Kiri Esperando')).estado::text, 'abandono',
  'en Kiritimati (UTC+14) esa fecha ya pasó'
);
select is(
  (pg_temp.turno('Pago Esperando')).estado::text, 'esperando',
  'en Pago Pago (UTC−11) la misma fecha todavía es hoy'
);
select ok(
  exists (
    select 1 from public.eventos_turno e
    where e.turno_id = '74000000-0000-4000-8000-000000000001' and e.accion = 'abandono'
  ),
  'el abandono queda en la bitácora del turno'
);
select is(
  (select count(*)::integer from public.suscripciones_push where turno_id = '74000000-0000-4000-8000-000000000001'),
  0, 'la suscripción a avisos de un turno cerrado se borra'
);
select is(
  (select count(*)::integer from public.suscripciones_push where turno_id = '74000000-0000-4000-8000-000000000004'),
  1, 'la de quien espera hoy se queda'
);
select is(public.cerrar_dia(), 0, 'correrlo otra vez no cambia nada');

-- ── Borrado de teléfonos a los 90 días ─────────────────────────────────────────────────────
-- Un turno que sigue en la silla desde hace mucho conserva el teléfono hasta que se cierre.
update public.turnos set creado_en = now() - interval '100 days' where nombre = 'Ayer En Silla';

select ok(public.borrar_telefonos_viejos() >= 2, 'borra los teléfonos de turnos de hace más de 90 días');
select is((pg_temp.turno('Viejo Atendido')).telefono, null, 'el de un turno atendido');
select is((pg_temp.turno('Viejo Cancelado')).telefono, null, 'y el de uno cancelado');
select is(
  (pg_temp.turno('Viejo Atendido')).monto, 150.00::numeric,
  'el resto del turno queda igual para el reporte'
);
select is((pg_temp.turno('Reciente Cancelado')).telefono, '+50499990007', 'a los 80 días todavía no');
select is(
  (pg_temp.turno('Ayer En Silla')).telefono, '+50499990003',
  'un turno abierto conserva su teléfono aunque sea viejo'
);
select is(public.borrar_telefonos_viejos(), 0, 'correrlo otra vez no borra nada más');
select ok(public.borrar_telefonos_viejos(30) >= 1, 'con otro plazo');
select is((pg_temp.turno('Reciente Cancelado')).telefono, null, 'a los 30 días ya se borra');
select throws_ok(
  $$ select public.borrar_telefonos_viejos(0) $$,
  '22023', 'plazo_invalido', 'no acepta un plazo de cero días'
);

-- ── Permisos (fallo 7) ─────────────────────────────────────────────────────────────────────
select ok(
  not has_function_privilege('anon', 'public.cerrar_dia()', 'execute')
  and not has_function_privilege('authenticated', 'public.cerrar_dia()', 'execute')
  and not has_function_privilege('anon', 'public.borrar_telefonos_viejos(integer)', 'execute')
  and not has_function_privilege('authenticated', 'public.borrar_telefonos_viejos(integer)', 'execute'),
  'solo las corre la base: ni el público ni el personal'
);

select * from finish();
rollback;
