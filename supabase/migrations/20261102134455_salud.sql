-- Endpoint de salud (fallo 10, Sprint 4): la Edge Function `salud` pregunta si la base responde
-- y si el reloj de pg_cron sigue corriendo. `vencer_tolerancia` corre cada minuto; si no corrió
-- bien en los últimos 3 minutos, el "no llegó" automático y los avisos están detenidos aunque la
-- app se vea bien. No devuelve datos de ninguna barbería.
create function public.estado_salud()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'base', true,
    'tareas', exists (
      select 1
      from cron.job_run_details d
      join cron.job j on j.jobid = d.jobid
      where j.jobname = 'vencer-tolerancia'
        and d.status = 'succeeded'
        and d.end_time > now() - interval '3 minutes'
    )
  );
$$;

-- Solo la Edge Function, con la clave secreta (fallo 7).
revoke execute on function public.estado_salud() from public, anon, authenticated;
grant execute on function public.estado_salud() to service_role;
