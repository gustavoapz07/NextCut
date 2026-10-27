-- Sprint 1 · Base de datos y seguridad (docs/plan-implementacion.md, secciones 8 y 9).
--
-- Reglas de esta migración:
-- - RLS activo en todas las tablas y nada expuesto sin un GRANT explícito (fallo 2).
-- - El público no toca tablas: solo ejecuta fila_publica, ver_turno, cancelar_turno y
--   suscribir_push. Anotarse lo hace la Edge Function con la clave secreta (ADR-007).
-- - Cada función valida sus datos otra vez, aunque el cliente ya los haya validado (fallo 3).
-- - Funciones security definer con search_path vacío y nombres completos (fallo 7).
-- - eventos_turno es una bitácora de solo inserción alimentada por triggers (fallo 10).

-- ---------------------------------------------------------------------------------------------
-- Esquema privado para las funciones de apoyo: no se expone en la API.
-- ---------------------------------------------------------------------------------------------
create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to authenticated, service_role;

-- Nada nuevo en public queda accesible sin un GRANT explícito.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema privado revoke execute on functions from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------------------------
create type public.rol_miembro as enum ('dueno', 'barbero');
create type public.estado_turno as enum (
  'esperando', 'llamado', 'en_silla', 'atendido', 'cancelado', 'abandono', 'no_llego'
);
create type public.origen_turno as enum ('local', 'remoto');
create type public.metodo_pago as enum ('efectivo', 'transferencia', 'tarjeta');

-- ---------------------------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------------------------
create table public.barberias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 60),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40),
  zona text check (char_length(zona) <= 80),
  zona_horaria text not null default 'America/Tegucigalpa',
  fila_remota_activa boolean not null default true,
  max_fila integer not null default 20 check (max_fila between 1 and 100),
  tolerancia_min integer not null default 5 check (tolerancia_min between 1 and 30),
  creado_en timestamptz not null default now()
);

create table public.miembros (
  user_id uuid not null references auth.users (id) on delete cascade,
  barberia_id uuid not null references public.barberias (id) on delete cascade,
  rol public.rol_miembro not null,
  primary key (user_id, barberia_id)
);
create index miembros_barberia_idx on public.miembros (barberia_id);

create table public.barberos (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  nombre text not null check (char_length(nombre) between 2 and 40),
  apodo text check (char_length(apodo) <= 40),
  silla integer check (silla between 1 and 50),
  activo boolean not null default true,
  en_pausa boolean not null default false,
  unique (id, barberia_id),
  unique (barberia_id, user_id)
);
create index barberos_user_idx on public.barberos (user_id);

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 40),
  duracion_min integer not null check (duracion_min between 5 and 240),
  precio_ref numeric(10, 2) not null default 0 check (precio_ref >= 0),
  activo boolean not null default true,
  unique (id, barberia_id)
);
create index servicios_barberia_idx on public.servicios (barberia_id);

create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  barberia_id uuid not null references public.barberias (id) on delete cascade,
  -- Día de la barbería (en su zona horaria) y número visible en la TV, que no sirve para nada más.
  dia date not null,
  numero integer not null check (numero > 0),
  -- Código de la URL /t/:codigo: aleatorio, 10 caracteres sin letras confundibles.
  codigo_publico text not null unique check (codigo_publico ~ '^[A-HJ-NP-Z2-9]{10}$'),
  -- El cliente genera el secreto para cancelar; aquí solo se guarda su hash SHA-256.
  secreto_hash text not null check (secreto_hash ~ '^[0-9a-f]{64}$'),
  clave_idempotencia uuid unique,
  nombre text not null check (char_length(nombre) between 2 and 40 and nombre = btrim(nombre)),
  telefono text check (telefono ~ '^\+504[0-9]{8}$'),
  -- Null mientras espera "el primero libre"; se asigna al llamarlo.
  barbero_id uuid,
  servicio_id uuid not null,
  origen public.origen_turno not null default 'remoto',
  estado public.estado_turno not null default 'esperando',
  oculto boolean not null default false,
  estimado_min integer check (estimado_min between 0 and 600),
  ip_hash text check (char_length(ip_hash) between 16 and 128),
  creado_en timestamptz not null default now(),
  llamado_en timestamptz,
  inicio_en timestamptz,
  fin_en timestamptz,
  monto numeric(10, 2) check (monto >= 0 and monto <= 100000),
  metodo_pago public.metodo_pago,
  unique (barberia_id, dia, numero),
  -- Barbero y servicio siempre de la misma barbería (fallo 3).
  foreign key (barbero_id, barberia_id) references public.barberos (id, barberia_id),
  foreign key (servicio_id, barberia_id) references public.servicios (id, barberia_id),
  check (estado in ('esperando', 'cancelado', 'abandono') or barbero_id is not null),
  check (estado <> 'atendido' or (monto is not null and metodo_pago is not null and fin_en is not null))
);
create index turnos_fila_idx on public.turnos (barberia_id, estado, creado_en);
create index turnos_barbero_idx on public.turnos (barbero_id, barberia_id);
create index turnos_servicio_idx on public.turnos (servicio_id, barberia_id);
create index turnos_ip_idx on public.turnos (ip_hash, creado_en) where ip_hash is not null;
-- Un turno activo por teléfono en cada barbería (fallo 9).
create unique index turnos_telefono_activo_idx on public.turnos (barberia_id, telefono)
  where telefono is not null and estado in ('esperando', 'llamado', 'en_silla');
-- Un barbero atiende a una persona a la vez.
create unique index turnos_barbero_activo_idx on public.turnos (barbero_id)
  where estado in ('llamado', 'en_silla');

create table public.eventos_turno (
  id bigint generated always as identity primary key,
  turno_id uuid not null references public.turnos (id) on delete cascade,
  barberia_id uuid not null references public.barberias (id) on delete cascade,
  actor uuid,
  accion text not null,
  detalle jsonb not null default '{}',
  fecha timestamptz not null default now()
);
create index eventos_turno_turno_idx on public.eventos_turno (turno_id);
create index eventos_turno_barberia_idx on public.eventos_turno (barberia_id, fecha);

create table public.suscripciones_push (
  turno_id uuid primary key references public.turnos (id) on delete cascade,
  endpoint text not null check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  p256dh text not null check (char_length(p256dh) between 20 and 200),
  auth text not null check (char_length(auth) between 10 and 100),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Funciones de apoyo (esquema privado)
-- ---------------------------------------------------------------------------------------------
create function privado.es_miembro(p_barberia uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.miembros m
    where m.barberia_id = p_barberia and m.user_id = (select auth.uid())
  );
$$;

create function privado.es_dueno(p_barberia uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.miembros m
    where m.barberia_id = p_barberia and m.user_id = (select auth.uid()) and m.rol = 'dueno'
  );
$$;

-- El barbero en persona (con su cuenta y miembro de la barbería) o el dueño de esa barbería.
create function privado.puede_atender(p_barbero uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.barberos b
    where b.id = p_barbero
      and (
        (b.user_id = (select auth.uid()) and privado.es_miembro(b.barberia_id))
        or privado.es_dueno(b.barberia_id)
      )
  );
$$;

-- 10 caracteres de un alfabeto de 32 símbolos: 256 es múltiplo de 32, así que no hay sesgo.
create function privado.codigo_aleatorio()
returns text
language plpgsql volatile set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(10);
  resultado text := '';
begin
  for i in 0..9 loop
    resultado := resultado || substr(alfabeto, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return resultado;
end;
$$;

-- "óscar lópez" → "Óscar L.": lo único que se muestra en pantallas públicas (fallo 5).
create function privado.nombre_corto(p_nombre text)
returns text
language sql immutable set search_path = ''
as $$
  select case
    when array_length(partes, 1) >= 2 then initcap(partes[1]) || ' ' || upper(left(partes[2], 1)) || '.'
    else initcap(partes[1])
  end
  from (select regexp_split_to_array(btrim(p_nombre), '\s+') as partes) s;
$$;

create function privado.hash_secreto(p_secreto text)
returns text
language sql immutable set search_path = ''
as $$
  select encode(extensions.digest(p_secreto, 'sha256'), 'hex');
$$;

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

-- Reglas que se cumplen aunque alguien actualice la tabla sin pasar por las funciones.
create function privado.validar_cambio_turno()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  -- Un turno cerrado no se edita; solo se permite borrar su teléfono (privacidad).
  if old.estado in ('atendido', 'cancelado', 'abandono', 'no_llego') then
    if (to_jsonb(new) - 'telefono') is distinct from (to_jsonb(old) - 'telefono')
       or (new.telefono is not null and new.telefono is distinct from old.telefono) then
      raise exception 'turno_cerrado' using errcode = 'P0001';
    end if;
    return new;
  end if;

  if new.estado is distinct from old.estado and not (
    (old.estado = 'esperando' and new.estado in ('llamado', 'cancelado', 'abandono'))
    or (old.estado = 'llamado' and new.estado in ('en_silla', 'no_llego', 'cancelado'))
    or (old.estado = 'en_silla' and new.estado = 'atendido')
  ) then
    raise exception 'cambio_de_estado_invalido' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger turnos_validar_cambio
  before update on public.turnos
  for each row execute function privado.validar_cambio_turno();

-- Bitácora: cada alta, cambio de estado, renombre u ocultamiento queda registrado.
create function privado.registrar_evento_turno()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_accion text;
  v_detalle jsonb := '{}';
begin
  if tg_op = 'INSERT' then
    v_accion := 'creado';
    v_detalle := jsonb_build_object(
      'origen', new.origen, 'barbero_id', new.barbero_id, 'servicio_id', new.servicio_id
    );
  elsif new.estado is distinct from old.estado then
    v_accion := new.estado::text;
    v_detalle := jsonb_build_object('de', old.estado, 'barbero_id', new.barbero_id);
    if new.estado = 'atendido' then
      v_detalle := v_detalle || jsonb_build_object(
        'monto', new.monto, 'metodo_pago', new.metodo_pago, 'servicio_id', new.servicio_id
      );
    end if;
  elsif new.nombre is distinct from old.nombre then
    v_accion := 'renombrado';
    v_detalle := jsonb_build_object('antes', old.nombre);
  elsif new.oculto is distinct from old.oculto then
    v_accion := case when new.oculto then 'oculto' else 'visible' end;
  else
    return null;
  end if;

  insert into public.eventos_turno (turno_id, barberia_id, actor, accion, detalle)
  values (new.id, new.barberia_id, (select auth.uid()), v_accion, v_detalle);
  return null;
end;
$$;

create trigger turnos_registrar_evento
  after insert or update on public.turnos
  for each row execute function privado.registrar_evento_turno();

-- La bitácora no se edita. Solo se borra en cascada, si se borra el turno o la barbería.
create function privado.proteger_eventos()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' or pg_trigger_depth() = 1 then
    raise exception 'bitacora_inmutable' using errcode = 'P0001';
  end if;
  return old;
end;
$$;

create trigger eventos_turno_inmutable
  before update or delete on public.eventos_turno
  for each row execute function privado.proteger_eventos();

-- Tiempo real: solo una señal vacía en el canal público fila:<barberia_id> (ADR-007).
-- Cada pantalla vuelve a pedir sus datos con sus propios permisos.
create function privado.senal_fila()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_fila jsonb := to_jsonb(coalesce(new, old));
  v_barberia text := case when tg_table_name = 'barberias' then v_fila ->> 'id' else v_fila ->> 'barberia_id' end;
begin
  perform realtime.send('{}'::jsonb, 'cambio', 'fila:' || v_barberia, false);
  return null;
end;
$$;

create trigger turnos_senal after insert or update or delete on public.turnos
  for each row execute function privado.senal_fila();
create trigger barberos_senal after insert or update or delete on public.barberos
  for each row execute function privado.senal_fila();
create trigger servicios_senal after insert or update or delete on public.servicios
  for each row execute function privado.senal_fila();
create trigger barberias_senal after update on public.barberias
  for each row execute function privado.senal_fila();

-- ---------------------------------------------------------------------------------------------
-- RLS: denegación por defecto; leer solo lo de tu barbería y configurar solo si eres el dueño.
-- ---------------------------------------------------------------------------------------------
alter table public.barberias enable row level security;
alter table public.miembros enable row level security;
alter table public.barberos enable row level security;
alter table public.servicios enable row level security;
alter table public.turnos enable row level security;
alter table public.eventos_turno enable row level security;
alter table public.suscripciones_push enable row level security;

create policy "miembros leen su barbería" on public.barberias
  for select to authenticated using (privado.es_miembro(id));
create policy "el dueño edita su barbería" on public.barberias
  for update to authenticated using (privado.es_dueno(id)) with check (privado.es_dueno(id));

create policy "cada quien ve sus membresías y el dueño las de su barbería" on public.miembros
  for select to authenticated
  using (user_id = (select auth.uid()) or privado.es_dueno(barberia_id));

create policy "miembros leen barberos" on public.barberos
  for select to authenticated using (privado.es_miembro(barberia_id));
create policy "el dueño agrega barberos" on public.barberos
  for insert to authenticated with check (privado.es_dueno(barberia_id));
create policy "el dueño edita barberos" on public.barberos
  for update to authenticated
  using (privado.es_dueno(barberia_id)) with check (privado.es_dueno(barberia_id));
create policy "el dueño quita barberos" on public.barberos
  for delete to authenticated using (privado.es_dueno(barberia_id));

create policy "miembros leen servicios" on public.servicios
  for select to authenticated using (privado.es_miembro(barberia_id));
create policy "el dueño agrega servicios" on public.servicios
  for insert to authenticated with check (privado.es_dueno(barberia_id));
create policy "el dueño edita servicios" on public.servicios
  for update to authenticated
  using (privado.es_dueno(barberia_id)) with check (privado.es_dueno(barberia_id));
create policy "el dueño quita servicios" on public.servicios
  for delete to authenticated using (privado.es_dueno(barberia_id));

-- Los turnos solo se leen; todo cambio pasa por las funciones.
create policy "miembros leen los turnos de su barbería" on public.turnos
  for select to authenticated using (privado.es_miembro(barberia_id));

create policy "el dueño lee la bitácora" on public.eventos_turno
  for select to authenticated using (privado.es_dueno(barberia_id));

-- suscripciones_push: sin políticas. Solo la lee la Edge Function de avisos.

revoke all on all tables in schema public from anon, authenticated;
grant select, update on public.barberias to authenticated;
grant select on public.miembros to authenticated;
grant select, insert, update, delete on public.barberos, public.servicios to authenticated;
grant select on public.turnos, public.eventos_turno to authenticated;
grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------------------------------
-- Funciones públicas (sin sesión)
-- ---------------------------------------------------------------------------------------------

-- Todo lo que muestran la página de la fila y la TV, en una sola llamada y sin datos privados.
create function public.fila_publica(p_slug text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'barberia', jsonb_build_object(
      'id', b.id, 'nombre', b.nombre, 'slug', b.slug, 'zona', b.zona,
      'fila_remota_activa', b.fila_remota_activa, 'max_fila', b.max_fila,
      'tolerancia_min', b.tolerancia_min
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

-- La página /t/:codigo: estado, posición y datos para el estimado. Sin teléfono.
create function public.ver_turno(p_codigo text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'numero', t.numero,
    'nombre', privado.nombre_corto(t.nombre),
    'estado', t.estado,
    'barbero_id', t.barbero_id,
    'barbero', ba.nombre,
    'silla', ba.silla,
    'servicio_id', t.servicio_id,
    'servicio', s.nombre,
    'duracion_min', s.duracion_min,
    'precio_ref', s.precio_ref,
    'estimado_min', t.estimado_min,
    'creado_en', t.creado_en,
    'llamado_en', t.llamado_en,
    'inicio_en', t.inicio_en,
    'fin_en', t.fin_en,
    'adelante', (
      select count(*)
      from public.turnos o
      where o.barberia_id = t.barberia_id
        and o.estado = 'esperando'
        and (o.creado_en, o.numero) < (t.creado_en, t.numero)
        and (t.barbero_id is null or o.barbero_id is null or o.barbero_id = t.barbero_id)
    ),
    'barberia', jsonb_build_object(
      'nombre', b.nombre, 'slug', b.slug, 'tolerancia_min', b.tolerancia_min
    )
  )
  from public.turnos t
  join public.barberias b on b.id = t.barberia_id
  join public.servicios s on s.id = t.servicio_id
  left join public.barberos ba on ba.id = t.barbero_id
  where p_codigo ~ '^[A-Za-z0-9]{10}$' and t.codigo_publico = upper(p_codigo);
$$;

create function public.cancelar_turno(p_codigo text, p_secreto text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  update public.turnos t
  set estado = 'cancelado', fin_en = now()
  where p_codigo ~ '^[A-Za-z0-9]{10}$'
    and t.codigo_publico = upper(p_codigo)
    and t.secreto_hash = privado.hash_secreto(coalesce(p_secreto, ''))
    and t.estado in ('esperando', 'llamado')
  returning t.id into v_id;
  return v_id is not null;
end;
$$;

create function public.suscribir_push(p_codigo text, p_secreto text, p_suscripcion jsonb)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
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
  values (
    v_id,
    p_suscripcion ->> 'endpoint',
    p_suscripcion -> 'keys' ->> 'p256dh',
    p_suscripcion -> 'keys' ->> 'auth'
  )
  on conflict (turno_id) do update
  set endpoint = excluded.endpoint, p256dh = excluded.p256dh, auth = excluded.auth,
      creado_en = now();
  return true;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Anotarse: solo con la clave secreta, desde la Edge Function, después de Turnstile.
-- ---------------------------------------------------------------------------------------------
create function public.unirse_a_fila(
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
-- Funciones del barbero
-- ---------------------------------------------------------------------------------------------
create function privado.datos_turno_personal(p_turno public.turnos)
returns jsonb
language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_turno.id, 'numero', p_turno.numero, 'nombre', p_turno.nombre,
    'telefono', p_turno.telefono, 'barbero_id', p_turno.barbero_id,
    'servicio_id', p_turno.servicio_id, 'origen', p_turno.origen, 'estado', p_turno.estado,
    'creado_en', p_turno.creado_en, 'llamado_en', p_turno.llamado_en,
    'inicio_en', p_turno.inicio_en, 'fin_en', p_turno.fin_en,
    'monto', p_turno.monto, 'metodo_pago', p_turno.metodo_pago
  );
$$;

-- "Llamar siguiente": el más antiguo de su fila o de "el primero libre". SKIP LOCKED evita que
-- dos barberos que presionan a la vez se lleven al mismo cliente (fallo 8).
create function public.llamar_siguiente(p_barbero_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_barbero public.barberos;
  v_turno public.turnos;
begin
  if not privado.puede_atender(p_barbero_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  select * into v_barbero from public.barberos b where b.id = p_barbero_id;
  if not v_barbero.activo or v_barbero.en_pausa then
    raise exception 'barbero_en_pausa' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.turnos t
    where t.barbero_id = v_barbero.id and t.estado in ('llamado', 'en_silla')
  ) then
    raise exception 'barbero_ocupado' using errcode = 'P0001';
  end if;

  select * into v_turno
  from public.turnos t
  where t.barberia_id = v_barbero.barberia_id
    and t.estado = 'esperando'
    and (t.barbero_id = v_barbero.id or t.barbero_id is null)
  order by t.creado_en, t.numero
  limit 1
  for update skip locked;

  if not found then
    return null;
  end if;

  update public.turnos t
  set estado = 'llamado', barbero_id = v_barbero.id, llamado_en = now()
  where t.id = v_turno.id
  returning * into v_turno;
  return privado.datos_turno_personal(v_turno);
end;
$$;

create function public.empezar_turno(p_turno_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_turno public.turnos;
begin
  select * into v_turno from public.turnos t where t.id = p_turno_id for update;
  if not found or v_turno.barbero_id is null or not privado.puede_atender(v_turno.barbero_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if v_turno.estado <> 'llamado' then
    raise exception 'estado_invalido' using errcode = 'P0001';
  end if;
  update public.turnos t set estado = 'en_silla', inicio_en = now()
  where t.id = v_turno.id
  returning * into v_turno;
  return privado.datos_turno_personal(v_turno);
end;
$$;

create function public.terminar_turno(
  p_turno_id uuid,
  p_monto numeric,
  p_metodo_pago public.metodo_pago,
  p_servicio_id uuid default null
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_turno public.turnos;
begin
  select * into v_turno from public.turnos t where t.id = p_turno_id for update;
  if not found or v_turno.barbero_id is null or not privado.puede_atender(v_turno.barbero_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if v_turno.estado <> 'en_silla' then
    raise exception 'estado_invalido' using errcode = 'P0001';
  end if;
  if p_monto is null or p_monto < 0 or p_monto > 100000 then
    raise exception 'monto_invalido' using errcode = '22023';
  end if;
  if p_metodo_pago is null then
    raise exception 'metodo_invalido' using errcode = '22023';
  end if;
  if p_servicio_id is not null and not exists (
    select 1 from public.servicios s
    where s.id = p_servicio_id and s.barberia_id = v_turno.barberia_id
  ) then
    raise exception 'servicio_invalido' using errcode = '22023';
  end if;

  update public.turnos t
  set estado = 'atendido', fin_en = now(), monto = round(p_monto, 2),
      metodo_pago = p_metodo_pago, servicio_id = coalesce(p_servicio_id, t.servicio_id)
  where t.id = v_turno.id
  returning * into v_turno;
  delete from public.suscripciones_push sp where sp.turno_id = v_turno.id;
  return privado.datos_turno_personal(v_turno);
end;
$$;

create function public.marcar_no_llego(p_turno_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_turno public.turnos;
begin
  select * into v_turno from public.turnos t where t.id = p_turno_id for update;
  if not found or v_turno.barbero_id is null or not privado.puede_atender(v_turno.barbero_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if v_turno.estado <> 'llamado' then
    raise exception 'estado_invalido' using errcode = 'P0001';
  end if;
  update public.turnos t set estado = 'no_llego', fin_en = now()
  where t.id = v_turno.id
  returning * into v_turno;
  delete from public.suscripciones_push sp where sp.turno_id = v_turno.id;
  return privado.datos_turno_personal(v_turno);
end;
$$;

create function public.pausar_barbero(p_barbero_id uuid, p_en_pausa boolean)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if p_en_pausa is null or not privado.puede_atender(p_barbero_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  update public.barberos b set en_pausa = p_en_pausa where b.id = p_barbero_id;
  return p_en_pausa;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Funciones del dueño
-- ---------------------------------------------------------------------------------------------
create function public.pausar_fila_remota(p_barberia_id uuid, p_pausada boolean)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if p_pausada is null or not privado.es_dueno(p_barberia_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  update public.barberias b set fila_remota_activa = not p_pausada where b.id = p_barberia_id;
  return p_pausada;
end;
$$;

create function public.renombrar_turno(p_turno_id uuid, p_nombre text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_turno public.turnos;
  v_nombre text := btrim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g'));
begin
  select * into v_turno from public.turnos t where t.id = p_turno_id for update;
  if not found or not privado.es_dueno(v_turno.barberia_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if char_length(v_nombre) not between 2 and 40 then
    raise exception 'nombre_invalido' using errcode = '22023';
  end if;
  update public.turnos t set nombre = v_nombre where t.id = v_turno.id;
  return true;
end;
$$;

create function public.ocultar_turno(p_turno_id uuid, p_oculto boolean)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_turno public.turnos;
begin
  select * into v_turno from public.turnos t where t.id = p_turno_id for update;
  if not found or p_oculto is null or not privado.es_dueno(v_turno.barberia_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  update public.turnos t set oculto = p_oculto where t.id = v_turno.id;
  return p_oculto;
end;
$$;

-- Reporte del día: atendidos, ingresos, espera, error del estimado, abandonos y horas pico.
create function public.reporte_dia(p_barberia_id uuid, p_fecha date default null)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_zona text;
  v_fecha date;
  v_reporte jsonb;
begin
  if not privado.es_dueno(p_barberia_id) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  select b.zona_horaria into v_zona from public.barberias b where b.id = p_barberia_id;
  v_fecha := coalesce(p_fecha, (now() at time zone v_zona)::date);

  with dia as (
    select t.*, extract(epoch from (t.llamado_en - t.creado_en)) / 60 as espera
    from public.turnos t
    where t.barberia_id = p_barberia_id and t.dia = v_fecha
  )
  select jsonb_build_object(
    'fecha', v_fecha,
    'turnos', count(*),
    'atendidos', count(*) filter (where estado = 'atendido'),
    'ingresos', coalesce(sum(monto) filter (where estado = 'atendido'), 0),
    'espera_promedio_min', round(avg(espera) filter (where llamado_en is not null)),
    'error_estimado_min', round(avg(abs(espera - estimado_min))
      filter (where llamado_en is not null and estimado_min is not null)),
    'abandonos', count(*) filter (where estado in ('cancelado', 'abandono', 'no_llego')),
    'no_llegaron', count(*) filter (where estado = 'no_llego'),
    'en_fila', count(*) filter (where estado = 'esperando'),
    'por_metodo', (
      select coalesce(jsonb_object_agg(m.metodo_pago, m.total), '{}'::jsonb)
      from (
        select d.metodo_pago, sum(d.monto) as total from dia d
        where d.estado = 'atendido' group by d.metodo_pago
      ) m
    ),
    'por_barbero', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'barbero_id', ba.id, 'nombre', ba.nombre,
        'atendidos', (select count(*) from dia d where d.barbero_id = ba.id and d.estado = 'atendido'),
        'ingresos', (select coalesce(sum(d.monto), 0) from dia d where d.barbero_id = ba.id and d.estado = 'atendido'),
        'espera_promedio_min', (select round(avg(d.espera)) from dia d where d.barbero_id = ba.id and d.llamado_en is not null)
      ) order by ba.silla nulls last, ba.nombre), '[]'::jsonb)
      from public.barberos ba
      where ba.barberia_id = p_barberia_id
    ),
    'por_hora', (
      select coalesce(jsonb_agg(jsonb_build_object('hora', h.hora, 'turnos', h.turnos) order by h.hora), '[]'::jsonb)
      from (
        select extract(hour from d.creado_en at time zone v_zona)::int as hora, count(*) as turnos
        from dia d group by 1
      ) h
    )
  )
  into v_reporte
  from dia;
  return v_reporte;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Tareas programadas (pg_cron las llamará desde los sprints 3 y 4)
-- ---------------------------------------------------------------------------------------------

-- "No llegó" automático cuando vence la tolerancia.
create function public.vencer_tolerancia()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_total integer;
begin
  with vencidos as (
    update public.turnos t
    set estado = 'no_llego', fin_en = now()
    from public.barberias b
    where b.id = t.barberia_id
      and t.estado = 'llamado'
      and t.llamado_en < now() - make_interval(mins => b.tolerancia_min)
    returning t.id
  )
  select count(*) into v_total from vencidos;
  delete from public.suscripciones_push sp
  using public.turnos t
  where t.id = sp.turno_id and t.estado = 'no_llego';
  return v_total;
end;
$$;

-- Al cerrar el día: quien seguía esperando cuenta como abandono y quien fue llamado, como no llegó.
create function public.cerrar_dia()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_total integer;
begin
  with cerrados as (
    update public.turnos t
    set estado = case when t.estado = 'esperando' then 'abandono'::public.estado_turno
                      else 'no_llego'::public.estado_turno end,
        fin_en = now()
    from public.barberias b
    where b.id = t.barberia_id
      and t.estado in ('esperando', 'llamado')
      and t.dia < (now() at time zone b.zona_horaria)::date
    returning t.id
  )
  select count(*) into v_total from cerrados;
  delete from public.suscripciones_push sp
  using public.turnos t
  where t.id = sp.turno_id and t.estado in ('abandono', 'no_llego');
  return v_total;
end;
$$;

-- Teléfonos borrados a los 90 días (plazo propuesto, fallo 5).
create function public.borrar_telefonos_viejos(p_dias integer default 90)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_total integer;
begin
  if p_dias is null or p_dias < 1 then
    raise exception 'plazo_invalido' using errcode = '22023';
  end if;
  with borrados as (
    update public.turnos t
    set telefono = null
    where t.telefono is not null
      and t.estado not in ('esperando', 'llamado', 'en_silla')
      and t.creado_en < now() - make_interval(days => p_dias)
    returning t.id
  )
  select count(*) into v_total from borrados;
  return v_total;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Permisos de ejecución: nadie ejecuta nada que no se le haya concedido aquí (fallo 7).
-- ---------------------------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema privado from public, anon, authenticated;

grant execute on function privado.es_miembro(uuid), privado.es_dueno(uuid) to authenticated;

grant execute on function
  public.fila_publica(text),
  public.ver_turno(text),
  public.cancelar_turno(text, text),
  public.suscribir_push(text, text, jsonb)
to anon, authenticated;

grant execute on function
  public.llamar_siguiente(uuid),
  public.empezar_turno(uuid),
  public.terminar_turno(uuid, numeric, public.metodo_pago, uuid),
  public.marcar_no_llego(uuid),
  public.pausar_barbero(uuid, boolean),
  public.pausar_fila_remota(uuid, boolean),
  public.renombrar_turno(uuid, text),
  public.ocultar_turno(uuid, boolean),
  public.reporte_dia(uuid, date)
to authenticated;

grant execute on all functions in schema public to service_role;
grant execute on all functions in schema privado to service_role;
