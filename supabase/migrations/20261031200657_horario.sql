-- Sprint 4 · Horario de la barbería (plan de implementación, sección 9).
--
-- - `barberias.horario`: por día de la semana ISO ("1" lunes … "7" domingo), `{"abre": "09:00",
--   "cierra": "19:00"}` o `null` si ese día no abre. Sin horario (`null`) la barbería se considera
--   siempre abierta, así nada de lo que ya existe cambia.
-- - Fuera de horario la fila en línea se cierra sola: `unirse_a_fila` rechaza los turnos remotos.
--   Quien está en el local (QR de la puerta) se puede anotar igual, como con la fila pausada.
-- - `fila_publica` dice si está abierta ahora, en la zona horaria de la barbería, y manda el horario
--   para que la página diga cuándo abre.

-- ---------------------------------------------------------------------------------------------
-- Validación (fallo 3)
-- ---------------------------------------------------------------------------------------------
create function privado.horario_valido(p_horario jsonb)
returns boolean
language sql immutable set search_path = ''
as $$
  select p_horario is null or (
    jsonb_typeof(p_horario) = 'object'
    and not exists (select 1 from jsonb_object_keys(p_horario) k where k !~ '^[1-7]$')
    and not exists (
      select 1
      from jsonb_each(p_horario) e
      where not (
        jsonb_typeof(e.value) = 'null'
        or (
          jsonb_typeof(e.value) = 'object'
          and (select count(*) from jsonb_object_keys(e.value)) = 2
          and (e.value ->> 'abre') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
          and (e.value ->> 'cierra') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
          and (e.value ->> 'abre') < (e.value ->> 'cierra')
        )
      )
    )
  );
$$;

alter table public.barberias
  add column horario jsonb,
  add constraint barberias_horario_valido check (privado.horario_valido(horario));

-- ¿Abierta en ese momento? Con la hora como parámetro para poder probarla.
create function privado.abierta_en(p_horario jsonb, p_zona text, p_momento timestamptz)
returns boolean
language sql stable set search_path = ''
as $$
  select case
    when p_horario is null then true
    else coalesce((
      select (f.franja ->> 'abre') <= to_char(l.hora, 'HH24:MI')
         and to_char(l.hora, 'HH24:MI') < (f.franja ->> 'cierra')
      from (select p_momento at time zone p_zona as hora) l
      cross join lateral (
        select p_horario -> extract(isodow from l.hora)::int::text as franja
      ) f
      where jsonb_typeof(f.franja) = 'object'
    ), false)
  end;
$$;

-- ---------------------------------------------------------------------------------------------
-- La fila pública dice si está abierta y manda el horario
-- ---------------------------------------------------------------------------------------------
create or replace function public.fila_publica(p_slug text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'barberia', jsonb_build_object(
      'id', b.id, 'nombre', b.nombre, 'slug', b.slug, 'zona', b.zona,
      'fila_remota_activa', b.fila_remota_activa, 'max_fila', b.max_fila,
      'tolerancia_min', b.tolerancia_min, 'zona_horaria', b.zona_horaria,
      'horario', b.horario,
      'abierta', privado.abierta_en(b.horario, b.zona_horaria, now())
    ),
    'barberos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ba.id, 'nombre', ba.nombre, 'apodo', ba.apodo, 'silla', ba.silla,
        'en_pausa', ba.en_pausa,
        'atendiendo', (
          select jsonb_build_object(
            'numero', t.numero, 'estado', t.estado, 'servicio_id', t.servicio_id,
            'desde', coalesce(t.inicio_en, t.llamado_en)
          )
          from public.turnos t
          where t.barbero_id = ba.id and t.estado in ('llamado', 'en_silla')
          limit 1
        )
      ) order by ba.silla nulls last, ba.nombre)
      from public.barberos ba
      where ba.barberia_id = b.id and ba.activo
    ), '[]'::jsonb),
    'servicios', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'nombre', s.nombre, 'duracion_min', s.duracion_min, 'precio_ref', s.precio_ref
      ) order by s.precio_ref, s.nombre)
      from public.servicios s
      where s.barberia_id = b.id and s.activo
    ), '[]'::jsonb),
    'fila', coalesce((
      select jsonb_agg(jsonb_build_object(
        'numero', t.numero,
        'nombre', case when t.oculto then null else privado.nombre_corto(t.nombre) end,
        'barbero_id', t.barbero_id, 'servicio_id', t.servicio_id, 'creado_en', t.creado_en
      ) order by t.creado_en, t.numero)
      from public.turnos t
      where t.barberia_id = b.id and t.estado = 'esperando'
    ), '[]'::jsonb)
  )
  from public.barberias b
  where b.slug = p_slug;
$$;

-- ---------------------------------------------------------------------------------------------
-- Anotarse: fuera de horario, solo en el local
-- ---------------------------------------------------------------------------------------------
create or replace function public.unirse_a_fila(
  p_barberia_id uuid,
  p_nombre text,
  p_servicio_id uuid,
  p_secreto text,
  p_barbero_id uuid default null,
  p_telefono text default null,
  p_origen public.origen_turno default 'remoto',
  p_ip_hash text default null,
  p_clave uuid default null,
  p_estimado_min integer default null
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_barberia public.barberias;
  v_nombre text := btrim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g'));
  v_telefono text := nullif(regexp_replace(coalesce(p_telefono, ''), '[\s-]', '', 'g'), '');
  v_existente public.turnos;
  v_dia date;
  v_numero integer;
  v_codigo text;
  v_id uuid;
begin
  -- El bloqueo de la barbería ordena las altas: número, tamaño de la fila e idempotencia.
  select * into v_barberia from public.barberias b where b.id = p_barberia_id for update;
  if not found then
    raise exception 'barberia_no_existe' using errcode = 'P0002';
  end if;

  if p_clave is not null then
    select * into v_existente from public.turnos t where t.clave_idempotencia = p_clave;
    if found then
      return jsonb_build_object('codigo', v_existente.codigo_publico, 'numero', v_existente.numero);
    end if;
  end if;

  if char_length(v_nombre) not between 2 and 40 then
    raise exception 'nombre_invalido' using errcode = '22023';
  end if;
  if v_telefono is not null and v_telefono !~ '^\+504[0-9]{8}$' then
    raise exception 'telefono_invalido' using errcode = '22023';
  end if;
  if p_secreto is null or char_length(p_secreto) not between 32 and 128 then
    raise exception 'secreto_invalido' using errcode = '22023';
  end if;
  if p_estimado_min is not null and p_estimado_min not between 0 and 600 then
    raise exception 'estimado_invalido' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.servicios s
    where s.id = p_servicio_id and s.barberia_id = v_barberia.id and s.activo
  ) then
    raise exception 'servicio_invalido' using errcode = '22023';
  end if;
  if p_barbero_id is not null and not exists (
    select 1 from public.barberos ba
    where ba.id = p_barbero_id and ba.barberia_id = v_barberia.id and ba.activo
  ) then
    raise exception 'barbero_invalido' using errcode = '22023';
  end if;

  if p_origen = 'remoto' and not v_barberia.fila_remota_activa then
    raise exception 'fila_remota_pausada' using errcode = 'P0001';
  end if;
  -- Fuera de horario la fila en línea se cierra sola; en el local (QR de la puerta) sí se anota.
  if p_origen = 'remoto'
     and not privado.abierta_en(v_barberia.horario, v_barberia.zona_horaria, now()) then
    raise exception 'fuera_de_horario' using errcode = 'P0001';
  end if;
  if (
    select count(*) from public.turnos t
    where t.barberia_id = v_barberia.id and t.estado = 'esperando'
  ) >= v_barberia.max_fila then
    raise exception 'fila_llena' using errcode = 'P0001';
  end if;
  if v_telefono is not null and exists (
    select 1 from public.turnos t
    where t.barberia_id = v_barberia.id
      and t.telefono = v_telefono
      and t.estado in ('esperando', 'llamado', 'en_silla')
  ) then
    raise exception 'telefono_con_turno' using errcode = 'P0001';
  end if;
  -- 5 turnos por IP cada 10 minutos (fallo 9). La Edge Function manda el hash, nunca la IP.
  if p_ip_hash is not null and (
    select count(*) from public.turnos t
    where t.ip_hash = p_ip_hash and t.creado_en > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'limite_ip' using errcode = 'P0001';
  end if;

  v_dia := (now() at time zone v_barberia.zona_horaria)::date;
  select coalesce(max(t.numero), 0) + 1 into v_numero
  from public.turnos t
  where t.barberia_id = v_barberia.id and t.dia = v_dia;

  loop
    v_codigo := privado.codigo_aleatorio();
    exit when not exists (select 1 from public.turnos t where t.codigo_publico = v_codigo);
  end loop;

  insert into public.turnos (
    barberia_id, dia, numero, codigo_publico, secreto_hash, clave_idempotencia, nombre, telefono,
    barbero_id, servicio_id, origen, ip_hash, estimado_min
  )
  values (
    v_barberia.id, v_dia, v_numero, v_codigo, privado.hash_secreto(p_secreto), p_clave, v_nombre,
    v_telefono, p_barbero_id, p_servicio_id, p_origen, p_ip_hash, p_estimado_min
  )
  returning id into v_id;

  return jsonb_build_object('codigo', v_codigo, 'numero', v_numero);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Permisos (fallo 7)
-- ---------------------------------------------------------------------------------------------
revoke execute on function
  privado.horario_valido(jsonb),
  privado.abierta_en(jsonb, text, timestamptz)
from public, anon, authenticated;

-- El dueño edita su barbería directo (RLS), y la revisión de la tabla llama a esta función.
grant execute on function privado.horario_valido(jsonb) to authenticated, service_role;
grant execute on function privado.abierta_en(jsonb, text, timestamptz) to service_role;
