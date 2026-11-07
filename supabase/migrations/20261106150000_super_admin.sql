-- Super admin y cuentas sin correo (ADR-017).
--
-- - privado.admins: las cuentas que dan de alta barberías. Se agregan a mano con SQL
--   (scripts/produccion/hacer-admin.sql); nadie se puede nombrar admin desde la app.
-- - Crear cuentas y cambiar contraseñas lo hace la Edge Function `cuentas` con la clave secreta,
--   porque necesita la API de administración de Auth. Las funciones que la acompañan solo las
--   ejecuta service_role y vuelven a revisar quién pide qué: la Edge Function les pasa el id de
--   quien llamó, que sacó de su sesión, nunca del cuerpo de la petición.
-- - El admin ve la lista de barberías con `admin_barberias`, que revisa por dentro que sea admin.

create table privado.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  creado_en timestamptz not null default now()
);
alter table privado.admins enable row level security;
revoke all on privado.admins from public, anon, authenticated;

create function privado.es_admin(p_usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from privado.admins a where a.user_id = p_usuario);
$$;

-- ---------------------------------------------------------------------------------------------
-- Para la sesión del admin (authenticated)
-- ---------------------------------------------------------------------------------------------

/** ¿La cuenta con la sesión abierta es admin? Solo responde por sí misma. */
create function public.soy_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.es_admin((select auth.uid()));
$$;

/** Todas las barberías con el correo de su dueño. Solo para el admin. */
create function public.admin_barberias()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not privado.es_admin((select auth.uid())) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'nombre', b.nombre,
        'slug', b.slug,
        'zona', b.zona,
        'creado_en', b.creado_en,
        'dueno_correo', (
          select u.email
          from public.miembros m
          join auth.users u on u.id = m.user_id
          where m.barberia_id = b.id and m.rol = 'dueno'
          order by u.created_at
          limit 1
        ),
        'barberos', (
          select count(*) from public.barberos x where x.barberia_id = b.id and x.activo
        )
      )
      order by b.creado_en desc
    )
    from public.barberias b
  ), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Para la Edge Function `cuentas` (service_role)
-- ---------------------------------------------------------------------------------------------

/** Antes de crear la cuenta del dueño: que pida un admin y que el slug esté libre. */
create function public.admin_puede_crear(p_admin uuid, p_slug text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not privado.es_admin(p_admin) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if exists (select 1 from public.barberias where slug = p_slug) then
    raise exception 'slug_en_uso';
  end if;
end;
$$;

/** Antes de crear la cuenta de un barbero: que pida el dueño y que la silla no tenga cuenta. */
create function public.dueno_puede_ligar(p_dueno uuid, p_barbero uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_barbero public.barberos;
begin
  select * into v_barbero from public.barberos where id = p_barbero;
  if v_barbero.id is null or not exists (
    select 1 from public.miembros m
    where m.user_id = p_dueno and m.barberia_id = v_barbero.barberia_id and m.rol = 'dueno'
  ) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if not v_barbero.activo then
    raise exception 'barbero_inactivo';
  end if;
  if v_barbero.user_id is not null then
    raise exception 'barbero_con_cuenta';
  end if;
end;
$$;

/**
 * Crea la barbería con su dueño y un servicio para empezar, en una transacción. El dueño cambia
 * el servicio y agrega a sus barberos desde la configuración.
 */
create function public.alta_barberia(
  p_admin uuid,
  p_nombre text,
  p_slug text,
  p_zona text,
  p_dueno uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barberia uuid;
begin
  if not privado.es_admin(p_admin) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(p_slug) not between 3 and 40 then
    raise exception 'slug_invalido';
  end if;
  if exists (select 1 from public.barberias where slug = p_slug) then
    raise exception 'slug_en_uso';
  end if;
  if p_nombre is null or char_length(p_nombre) not between 2 and 60 then
    raise exception 'nombre_invalido';
  end if;
  if p_zona is not null and char_length(p_zona) > 80 then
    raise exception 'zona_invalida';
  end if;
  if not exists (select 1 from auth.users where id = p_dueno) then
    raise exception 'cuenta_invalida';
  end if;

  insert into public.barberias (nombre, slug, zona)
  values (p_nombre, p_slug, nullif(p_zona, ''))
  returning id into v_barberia;

  insert into public.miembros (user_id, barberia_id, rol) values (p_dueno, v_barberia, 'dueno');

  insert into public.servicios (barberia_id, nombre, duracion_min, precio_ref)
  values (v_barberia, 'Corte', 30, 150);

  return jsonb_build_object('id', v_barberia, 'slug', p_slug);
end;
$$;

/** Liga una cuenta nueva a la silla de un barbero. Solo el dueño de esa barbería. */
create function public.ligar_cuenta_barbero(p_dueno uuid, p_barbero uuid, p_cuenta uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbero public.barberos;
begin
  select * into v_barbero from public.barberos where id = p_barbero for update;
  if v_barbero.id is null or not exists (
    select 1 from public.miembros m
    where m.user_id = p_dueno and m.barberia_id = v_barbero.barberia_id and m.rol = 'dueno'
  ) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  if not v_barbero.activo then
    raise exception 'barbero_inactivo';
  end if;
  if v_barbero.user_id is not null then
    raise exception 'barbero_con_cuenta';
  end if;

  update public.barberos set user_id = p_cuenta where id = p_barbero;
  insert into public.miembros (user_id, barberia_id, rol)
  values (p_cuenta, v_barbero.barberia_id, 'barbero')
  on conflict (user_id, barberia_id) do nothing;
end;
$$;

/**
 * La cuenta a la que `p_quien` le puede poner una contraseña nueva:
 * - con `p_barbero`: la del barbero, si `p_quien` es dueño de su barbería;
 * - con `p_barberia`: la del dueño, si `p_quien` es admin.
 */
create function public.cuenta_para_restablecer(p_quien uuid, p_barbero uuid, p_barberia uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_cuenta uuid;
begin
  if p_barbero is not null then
    select b.user_id into v_cuenta
    from public.barberos b
    where b.id = p_barbero
      and exists (
        select 1 from public.miembros m
        where m.user_id = p_quien and m.barberia_id = b.barberia_id and m.rol = 'dueno'
      );
  elsif p_barberia is not null and privado.es_admin(p_quien) then
    select m.user_id into v_cuenta
    from public.miembros m
    join auth.users u on u.id = m.user_id
    where m.barberia_id = p_barberia and m.rol = 'dueno'
    order by u.created_at
    limit 1;
  end if;
  if v_cuenta is null then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  -- El dueño no le cambia la contraseña a otro dueño, ni a sí mismo por aquí.
  if p_barbero is not null and (v_cuenta = p_quien or exists (
    select 1 from public.miembros m where m.user_id = v_cuenta and m.rol = 'dueno'
  )) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  return v_cuenta;
end;
$$;

/** El id de la cuenta con ese correo, para reusarla como dueña de otra barbería. */
create function public.cuenta_por_correo(p_correo text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(trim(p_correo)) limit 1;
$$;

-- ---------------------------------------------------------------------------------------------
-- Permisos (fallo 7): nadie ejecuta nada que no se conceda aquí.
-- ---------------------------------------------------------------------------------------------
revoke execute on function
  privado.es_admin(uuid),
  public.soy_admin(),
  public.admin_barberias(),
  public.admin_puede_crear(uuid, text),
  public.dueno_puede_ligar(uuid, uuid),
  public.alta_barberia(uuid, text, text, text, uuid),
  public.ligar_cuenta_barbero(uuid, uuid, uuid),
  public.cuenta_para_restablecer(uuid, uuid, uuid),
  public.cuenta_por_correo(text)
from public, anon, authenticated;

grant execute on function public.soy_admin(), public.admin_barberias() to authenticated;

grant execute on function
  privado.es_admin(uuid),
  public.soy_admin(),
  public.admin_barberias(),
  public.admin_puede_crear(uuid, text),
  public.dueno_puede_ligar(uuid, uuid),
  public.alta_barberia(uuid, text, text, text, uuid),
  public.ligar_cuenta_barbero(uuid, uuid, uuid),
  public.cuenta_para_restablecer(uuid, uuid, uuid),
  public.cuenta_por_correo(text)
to service_role;
grant select, insert, delete on privado.admins to service_role;
