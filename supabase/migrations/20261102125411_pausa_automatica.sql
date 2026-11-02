-- Pausa automática ante picos (fallos 9 y 10, Sprint 4): si entran demasiados turnos en línea en
-- 5 minutos, la fila en línea se pausa sola y el resumen del dueño lo avisa. Solo cuentan los
-- turnos remotos: quien se anota con el QR de la puerta está en el local, y la pausa tampoco lo
-- detiene (ADR-013, punto 9). El turno que llega al límite sí entra; los siguientes reciben
-- `fila_remota_pausada`, como con la pausa del dueño.

alter table public.barberias
  -- Cuántos turnos en línea en 5 minutos pausan la fila en línea.
  add column pico_turnos integer not null default 10 check (pico_turnos between 3 and 100),
  -- Cuándo se pausó sola. Null si está abierta o si la pausó el dueño.
  add column pausa_automatica_en timestamptz,
  -- Cuándo el dueño la volvió a abrir: los turnos de antes ya no cuentan para el pico, así no se
  -- vuelve a pausar con el siguiente turno.
  add column fila_remota_reanudada_en timestamptz;

create or replace function public.pausar_fila_remota(p_barberia_id uuid, p_pausada boolean)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if p_pausada is null or not privado.es_dueno(p_barberia_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  update public.barberias b
  set fila_remota_activa = not p_pausada,
      pausa_automatica_en = null,
      fila_remota_reanudada_en = case when p_pausada then b.fila_remota_reanudada_en else now() end
  where b.id = p_barberia_id;
  return p_pausada;
end;
$$;

-- Corre después de cada turno remoto, dentro de `unirse_a_fila`, que ya tiene bloqueada la fila
-- de la barbería: dos turnos al mismo tiempo no se saltan el conteo.
create function privado.pausar_ante_pico()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_barberia public.barberias;
  v_recientes integer;
begin
  select * into v_barberia from public.barberias b where b.id = new.barberia_id;
  if not v_barberia.fila_remota_activa then
    return null;
  end if;

  select count(*) into v_recientes
  from public.turnos t
  where t.barberia_id = new.barberia_id
    and t.origen = 'remoto'
    and t.creado_en > greatest(
      now() - interval '5 minutes',
      coalesce(v_barberia.fila_remota_reanudada_en, '-infinity'::timestamptz)
    );
  if v_recientes < v_barberia.pico_turnos then
    return null;
  end if;

  update public.barberias b
  set fila_remota_activa = false, pausa_automatica_en = now()
  where b.id = new.barberia_id;
  -- Queda en la bitácora, en el turno que llegó al límite (fallo 10).
  insert into public.eventos_turno (turno_id, barberia_id, actor, accion, detalle)
  values (
    new.id, new.barberia_id, null, 'pausa_automatica',
    jsonb_build_object('turnos', v_recientes, 'minutos', 5)
  );
  return null;
end;
$$;

create trigger turnos_pausar_ante_pico
  after insert on public.turnos
  for each row
  when (new.origen = 'remoto')
  execute function privado.pausar_ante_pico();

revoke execute on function privado.pausar_ante_pico() from public, anon, authenticated;
