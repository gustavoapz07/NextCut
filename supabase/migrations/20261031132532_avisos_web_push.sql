-- Sprint 3 · Avisos por Web Push (plan de implementación, sección 6, punto 4).
--
-- - La base llama a la Edge Function `avisos` con pg_net cuando cambia el estado de un turno y,
--   cada minuto, con pg_cron, porque el estimado baja aunque nadie toque nada. Solo llama si hay
--   alguien suscrito con un aviso pendiente.
-- - La dirección de la función y su clave viven en Vault (`avisos_url` y `avisos_clave`), nunca en
--   el repositorio. Sin ellas (Supabase local y CI) la base no llama a nada.
-- - Máximo 2 avisos por turno (fallo 6): "ya casi" y "te toca". Cada uno se reserva una sola vez,
--   aunque el trigger y el reloj corran a la vez.
-- - Solo se aceptan suscripciones de servicios de push conocidos: la función le manda una
--   solicitud al endpoint que dio el navegador, y sin esta regla serviría para pegarle a cualquier
--   dirección (SSRF).

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------------------------------------
-- Suscripciones
-- ---------------------------------------------------------------------------------------------
create function privado.endpoint_push_valido(p_endpoint text)
returns boolean
language sql immutable set search_path = ''
as $$
  select p_endpoint is not null
    and char_length(p_endpoint) <= 1000
    and p_endpoint ~ ('^https://(fcm\.googleapis\.com|android\.googleapis\.com'
      || '|([a-z0-9-]+\.)*push\.services\.mozilla\.com|web\.push\.apple\.com'
      || '|[a-z0-9-]+\.notify\.windows\.com)/');
$$;

alter table public.suscripciones_push
  add column aviso_casi_en timestamptz,
  add column aviso_llamado_en timestamptz,
  add constraint suscripciones_push_servicio_conocido
    check (privado.endpoint_push_valido(endpoint)),
  add constraint suscripciones_push_claves_base64url
    check (p256dh ~ '^[A-Za-z0-9_-]+={0,2}$' and auth ~ '^[A-Za-z0-9_-]+={0,2}$');

-- Mismas reglas que la tabla, para responder `false` en vez de un error (fallo 3). Los avisos ya
-- enviados se conservan al cambiar de navegador: volver a suscribirse no da avisos de más.
create or replace function public.suscribir_push(p_codigo text, p_secreto text, p_suscripcion jsonb)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_endpoint text := p_suscripcion ->> 'endpoint';
  v_p256dh text := p_suscripcion -> 'keys' ->> 'p256dh';
  v_auth text := p_suscripcion -> 'keys' ->> 'auth';
begin
  if not privado.endpoint_push_valido(v_endpoint)
     or v_p256dh is null or char_length(v_p256dh) not between 20 and 200
     or v_p256dh !~ '^[A-Za-z0-9_-]+={0,2}$'
     or v_auth is null or char_length(v_auth) not between 10 and 100
     or v_auth !~ '^[A-Za-z0-9_-]+={0,2}$' then
    return false;
  end if;

  select t.id into v_id
  from public.turnos t
  where p_codigo ~ '^[A-Za-z0-9]{10}$'
    and t.codigo_publico = upper(p_codigo)
    and t.secreto_hash = privado.hash_secreto(coalesce(p_secreto, ''))
    and t.estado in ('esperando', 'llamado');
  if v_id is null then
    return false;
  end if;

  insert into public.suscripciones_push (turno_id, endpoint, p256dh, auth)
  values (v_id, v_endpoint, v_p256dh, v_auth)
  on conflict (turno_id) do update
  set endpoint = excluded.endpoint, p256dh = excluded.p256dh, auth = excluded.auth,
      creado_en = now();
  return true;
end;
$$;

-- Después de sentarse ya no hay nada que avisar: la suscripción se borra en cualquier cierre
-- (en la silla, atendido, cancelado, no llegó o abandono), pase por la función que pase.
create function privado.borrar_suscripcion_al_avanzar()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.suscripciones_push sp where sp.turno_id = new.id;
  return null;
end;
$$;

create trigger turnos_borrar_suscripcion
  after update of estado on public.turnos
  for each row
  when (new.estado not in ('esperando', 'llamado'))
  execute function privado.borrar_suscripcion_al_avanzar();

-- ---------------------------------------------------------------------------------------------
-- Llamar a la función de avisos
-- ---------------------------------------------------------------------------------------------

-- La solicitud sale cuando termina la transacción (si se deshace, no sale) y el barbero no la
-- espera. Devuelve el id de pg_net, o null si la base no tiene la dirección y la clave.
create function privado.llamar_avisos(p_barberia uuid)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  v_url text;
  v_clave text;
begin
  select s.decrypted_secret into v_url from vault.decrypted_secrets s where s.name = 'avisos_url';
  select s.decrypted_secret into v_clave from vault.decrypted_secrets s where s.name = 'avisos_clave';
  if v_url is null or v_clave is null then
    return null;
  end if;
  return net.http_post(
    url := v_url,
    body := case when p_barberia is null then '{}'::jsonb
                 else jsonb_build_object('barberia_id', p_barberia) end,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-avisos-clave', v_clave),
    timeout_milliseconds := 10000
  );
end;
$$;

-- Turnos con suscripción y un aviso por mandar: "te toca" si está llamado, "ya casi" si espera.
create function privado.con_aviso_pendiente(p_barberia uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.suscripciones_push sp
    join public.turnos t on t.id = sp.turno_id
    where (p_barberia is null or t.barberia_id = p_barberia)
      and sp.aviso_llamado_en is null
      and (t.estado = 'llamado' or (t.estado = 'esperando' and sp.aviso_casi_en is null))
  );
$$;

-- Un cambio de estado mueve la fila de esa barbería: alguien pudo quedar a 15 minutos o ser llamado.
-- Es por sentencia, así `vencer_tolerancia()` con varios turnos llama una vez por barbería.
create function privado.avisar_cambios()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_barberia uuid;
begin
  for v_barberia in
    select distinct n.barberia_id
    from nuevos n
    join anteriores a on a.id = n.id
    where n.estado is distinct from a.estado
  loop
    if privado.con_aviso_pendiente(v_barberia) then
      perform privado.llamar_avisos(v_barberia);
    end if;
  end loop;
  return null;
end;
$$;

create trigger turnos_avisos
  after update on public.turnos
  referencing old table as anteriores new table as nuevos
  for each statement execute function privado.avisar_cambios();

-- El reloj: cada minuto, solo si hay algo pendiente en alguna barbería.
create function privado.revisar_avisos()
returns bigint
language plpgsql security definer set search_path = ''
as $$
begin
  if not privado.con_aviso_pendiente(null) then
    return null;
  end if;
  return privado.llamar_avisos(null);
end;
$$;

select cron.schedule('revisar-avisos', '* * * * *', 'select privado.revisar_avisos()');

-- ---------------------------------------------------------------------------------------------
-- Funciones de la Edge Function avisos (solo la clave secreta)
-- ---------------------------------------------------------------------------------------------

-- Valida la clave que mandó la base y devuelve lo que hay por avisar, sin teléfonos.
create function public.avisos_pendientes(p_clave text, p_barberia uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_clave text;
begin
  select s.decrypted_secret into v_clave from vault.decrypted_secrets s where s.name = 'avisos_clave';
  if v_clave is null or p_clave is null or p_clave <> v_clave then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'turno_id', t.id, 'codigo', t.codigo_publico, 'numero', t.numero, 'estado', t.estado,
      'barberia', jsonb_build_object(
        'id', b.id, 'slug', b.slug, 'nombre', b.nombre, 'tolerancia_min', b.tolerancia_min
      ),
      'barbero', ba.nombre, 'silla', ba.silla,
      'endpoint', sp.endpoint, 'p256dh', sp.p256dh, 'auth', sp.auth,
      'aviso_casi', sp.aviso_casi_en is not null,
      'aviso_llamado', sp.aviso_llamado_en is not null
    ) order by t.creado_en, t.numero)
    from public.suscripciones_push sp
    join public.turnos t on t.id = sp.turno_id
    join public.barberias b on b.id = t.barberia_id
    left join public.barberos ba on ba.id = t.barbero_id
    where (p_barberia is null or t.barberia_id = p_barberia)
      and sp.aviso_llamado_en is null
      and (t.estado = 'llamado' or (t.estado = 'esperando' and sp.aviso_casi_en is null))
  ), '[]'::jsonb);
end;
$$;

-- Marca el aviso antes de mandarlo. Devuelve false si ya estaba marcado o si el turno ya no
-- está en el estado del aviso: así nunca sale dos veces.
create function public.reservar_aviso(p_turno uuid, p_tipo text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_tipo = 'casi' then
    update public.suscripciones_push sp set aviso_casi_en = now()
    from public.turnos t
    where sp.turno_id = p_turno and t.id = sp.turno_id and t.estado = 'esperando'
      and sp.aviso_casi_en is null and sp.aviso_llamado_en is null
    returning sp.turno_id into v_id;
  elsif p_tipo = 'llamado' then
    update public.suscripciones_push sp set aviso_llamado_en = now()
    from public.turnos t
    where sp.turno_id = p_turno and t.id = sp.turno_id and t.estado = 'llamado'
      and sp.aviso_llamado_en is null
    returning sp.turno_id into v_id;
  else
    raise exception 'tipo_invalido' using errcode = '22023';
  end if;
  return v_id is not null;
end;
$$;

-- Tras una falla pasajera del servicio de push, el aviso vuelve a quedar pendiente.
create function public.liberar_aviso(p_turno uuid, p_tipo text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_tipo = 'casi' then
    update public.suscripciones_push sp set aviso_casi_en = null
    where sp.turno_id = p_turno returning sp.turno_id into v_id;
  elsif p_tipo = 'llamado' then
    update public.suscripciones_push sp set aviso_llamado_en = null
    where sp.turno_id = p_turno returning sp.turno_id into v_id;
  else
    raise exception 'tipo_invalido' using errcode = '22023';
  end if;
  return v_id is not null;
end;
$$;

-- El navegador ya no existe (404 o 410 del servicio de push).
create function public.borrar_suscripcion(p_turno uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  delete from public.suscripciones_push sp where sp.turno_id = p_turno returning sp.turno_id into v_id;
  return v_id is not null;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Permisos (fallo 7)
-- ---------------------------------------------------------------------------------------------
revoke execute on function
  public.avisos_pendientes(text, uuid),
  public.reservar_aviso(uuid, text),
  public.liberar_aviso(uuid, text),
  public.borrar_suscripcion(uuid),
  privado.endpoint_push_valido(text),
  privado.borrar_suscripcion_al_avanzar(),
  privado.llamar_avisos(uuid),
  privado.con_aviso_pendiente(uuid),
  privado.avisar_cambios(),
  privado.revisar_avisos()
from public, anon, authenticated;

grant execute on function
  public.avisos_pendientes(text, uuid),
  public.reservar_aviso(uuid, text),
  public.liberar_aviso(uuid, text),
  public.borrar_suscripcion(uuid),
  -- La revisión de la tabla llama a esta función cuando la clave secreta escribe directo.
  privado.endpoint_push_valido(text)
to service_role;
