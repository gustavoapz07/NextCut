-- Pausa automática ante picos (fallos 9 y 10): con demasiados turnos en línea en 5 minutos la fila
-- en línea se pausa sola, queda en la bitácora y el dueño la vuelve a abrir sin que se pause de
-- nuevo con el siguiente turno. Los turnos del QR de la puerta no cuentan ni se detienen.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email) values
  ('80000000-0000-4000-8000-0000000000a1', 'duena@pico.test');
insert into public.barberias (id, nombre, slug, max_fila) values
  ('81000000-0000-4000-8000-00000000000a', 'Pico A', 'pico-a', 100);
insert into public.barberias (id, nombre, slug, max_fila, pico_turnos) values
  ('81000000-0000-4000-8000-00000000000b', 'Pico B', 'pico-b', 100, 3);
insert into public.miembros (user_id, barberia_id, rol) values
  ('80000000-0000-4000-8000-0000000000a1', '81000000-0000-4000-8000-00000000000a', 'dueno');
insert into public.servicios (id, barberia_id, nombre, duracion_min) values
  ('83000000-0000-4000-8000-0000000000a1', '81000000-0000-4000-8000-00000000000a', 'Corte', 30),
  ('83000000-0000-4000-8000-0000000000b1', '81000000-0000-4000-8000-00000000000b', 'Corte', 30);

-- Anotarse como lo hace la Edge Function, en línea o con el QR de la puerta.
create function pg_temp.anotar(barberia uuid, nombre text, origen public.origen_turno default 'remoto')
returns jsonb language sql as $$
  select public.unirse_a_fila(
    barberia, nombre,
    (select s.id from public.servicios s where s.barberia_id = barberia),
    repeat('a', 32), p_origen => origen
  )
$$;
create function pg_temp.barberia(p_id uuid) returns public.barberias language sql as $$
  select * from public.barberias where id = p_id
$;

-- ── El límite ──────────────────────────────────────────────────────────────────────────────
select is(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).pico_turnos, 10,
  'por omisión, 10 turnos en línea en 5 minutos'
);
select throws_ok(
  $$ update public.barberias set pico_turnos = 2 where id = '81000000-0000-4000-8000-00000000000a' $$,
  '23514', null, 'el límite no baja de 3'
);
select throws_ok(
  $$ update public.barberias set pico_turnos = 101 where id = '81000000-0000-4000-8000-00000000000a' $$,
  '23514', null, 'ni pasa de 100'
);

-- ── El pico pausa la fila en línea ─────────────────────────────────────────────────────────
select pg_temp.anotar('81000000-0000-4000-8000-00000000000a', 'Cliente ' || i)
from generate_series(1, 9) i;
select ok(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).fila_remota_activa,
  'con 9 turnos en línea en 5 minutos sigue abierta'
);
select pg_temp.anotar('81000000-0000-4000-8000-00000000000a', 'Local ' || i, 'local')
from generate_series(1, 5) i;
select ok(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).fila_remota_activa,
  'los turnos del QR de la puerta no cuentan'
);

select lives_ok(
  $$ select pg_temp.anotar('81000000-0000-4000-8000-00000000000a', 'Cliente 10') $$,
  'el turno que llega al límite entra'
);
select ok(
  not (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).fila_remota_activa,
  'y la fila en línea se pausa sola'
);
select ok(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).pausa_automatica_en is not null,
  'marcada como pausa automática'
);
select is(
  (select e.detalle from public.eventos_turno e
   where e.barberia_id = '81000000-0000-4000-8000-00000000000a' and e.accion = 'pausa_automatica'),
  '{"turnos": 10, "minutos": 5}'::jsonb, 'queda en la bitácora con cuántos turnos fueron'
);
select is(
  (select t.nombre from public.eventos_turno e join public.turnos t on t.id = e.turno_id
   where e.barberia_id = '81000000-0000-4000-8000-00000000000a' and e.accion = 'pausa_automatica'),
  'Cliente 10', 'en el turno que llegó al límite'
);
select throws_ok(
  $$ select pg_temp.anotar('81000000-0000-4000-8000-00000000000a', 'Cliente 11') $$,
  'P0001', 'fila_remota_pausada', 'el siguiente turno en línea ya no entra'
);
select lives_ok(
  $$ select pg_temp.anotar('81000000-0000-4000-8000-00000000000a', 'Local 6', 'local') $$,
  'en el local se siguen anotando'
);
select ok(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000b')).fila_remota_activa,
  'la otra barbería sigue abierta'
);

-- ── La dueña la vuelve a abrir ─────────────────────────────────────────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "80000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select is(
  public.pausar_fila_remota('81000000-0000-4000-8000-00000000000a', false), false,
  'la dueña la vuelve a abrir'
);
reset role;
select ok(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).fila_remota_activa,
  'la fila en línea queda abierta'
);
select is(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).pausa_automatica_en, null,
  'y ya no figura como pausa automática'
);

-- En la prueba todo pasa en el mismo instante: el reloj se mueve hacia atrás para que la
-- reapertura quede hace 1 minuto y los turnos de antes, hace 2.
update public.barberias set fila_remota_reanudada_en = now() - interval '1 minute'
where id = '81000000-0000-4000-8000-00000000000a';
update public.turnos set creado_en = now() - interval '2 minutes'
where barberia_id = '81000000-0000-4000-8000-00000000000a';

select pg_temp.anotar('81000000-0000-4000-8000-00000000000a', 'Otra ' || i)
from generate_series(1, 9) i;
select ok(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).fila_remota_activa,
  'después de abrirla, los turnos de antes no cuentan: 9 nuevos no la pausan'
);
select pg_temp.anotar('81000000-0000-4000-8000-00000000000a', 'Otra 10');
select ok(
  not (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).fila_remota_activa,
  'un pico nuevo la vuelve a pausar'
);

set role authenticated;
set request.jwt.claims to '{"sub": "80000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select public.pausar_fila_remota('81000000-0000-4000-8000-00000000000a', false);
select public.pausar_fila_remota('81000000-0000-4000-8000-00000000000a', true);
reset role;
select is(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).pausa_automatica_en, null,
  'si la pausa la dueña, no figura como automática'
);

-- ── Solo cuentan los últimos 5 minutos y el límite de cada barbería ────────────────────────
select pg_temp.anotar('81000000-0000-4000-8000-00000000000b', 'Viejo ' || i)
from generate_series(1, 2) i;
update public.turnos set creado_en = now() - interval '6 minutes'
where barberia_id = '81000000-0000-4000-8000-00000000000b';
select pg_temp.anotar('81000000-0000-4000-8000-00000000000b', 'Nuevo 1');
select ok(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000b')).fila_remota_activa,
  'los turnos de hace más de 5 minutos no cuentan'
);
select pg_temp.anotar('81000000-0000-4000-8000-00000000000b', 'Nuevo ' || i)
from generate_series(2, 3) i;
select ok(
  not (pg_temp.barberia('81000000-0000-4000-8000-00000000000b')).fila_remota_activa,
  'con su límite de 3, la otra barbería se pausa al tercero'
);

-- ── Permisos (fallo 7) ─────────────────────────────────────────────────────────────────────
set role authenticated;
set request.jwt.claims to '{"sub": "80000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select lives_ok(
  $$ update public.barberias set pico_turnos = 20 where id = '81000000-0000-4000-8000-00000000000a' $$,
  'la dueña cambia su límite'
);
reset role;
select is(
  (pg_temp.barberia('81000000-0000-4000-8000-00000000000a')).pico_turnos, 20, 'y queda guardado'
);
select ok(
  not has_function_privilege('anon', 'privado.pausar_ante_pico()', 'execute')
  and not has_function_privilege('authenticated', 'privado.pausar_ante_pico()', 'execute'),
  'nadie ejecuta la función de la pausa por su cuenta'
);

select * from finish();
rollback;
