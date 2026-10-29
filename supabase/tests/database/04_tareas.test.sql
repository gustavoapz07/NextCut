-- Tareas programadas: el "no llegó" automático corre cada minuto y el historial de pg_cron no
-- crece sin límite. Lo que hace vencer_tolerancia() se prueba en 03_funciones.
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

select has_extension('pg_cron', 'pg_cron está activo');

select is(
  (select schedule from cron.job where jobname = 'vencer-tolerancia'),
  '* * * * *', 'vencer_tolerancia corre cada minuto'
);
select is(
  (select command from cron.job where jobname = 'vencer-tolerancia'),
  'select public.vencer_tolerancia()', 'y solo llama a la función'
);
select ok(
  (select active from cron.job where jobname = 'vencer-tolerancia'),
  'la tarea está activa'
);
select is(
  (select schedule from cron.job where jobname = 'limpiar-historial-cron'),
  '30 9 * * *', 'el historial de pg_cron se limpia una vez al día'
);
select is(
  (select count(*)::integer from cron.job where jobname in ('vencer-tolerancia', 'limpiar-historial-cron')),
  2, 'cada tarea existe una sola vez'
);

select * from finish();
rollback;
