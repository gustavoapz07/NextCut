-- Tareas programadas con pg_cron (Supabase Cron). Sprint 3: "no llegó" automático.
create extension if not exists pg_cron with schema pg_catalog;

-- Cada minuto, quien fue llamado y no se sentó dentro de la tolerancia de su barbería pasa a
-- "no llegó". El cambio dispara la señal de la fila, así el panel, la TV y el cliente se enteran.
select cron.schedule(
  'vencer-tolerancia',
  '* * * * *',
  'select public.vencer_tolerancia()'
);

-- pg_cron guarda cada corrida en cron.job_run_details: con una tarea por minuto son 1440 filas al
-- día. Se conserva una semana. Corre a las 3:30 a. m. de Honduras (9:30 UTC).
select cron.schedule(
  'limpiar-historial-cron',
  '30 9 * * *',
  $$delete from cron.job_run_details where end_time < now() - interval '7 days'$$
);
