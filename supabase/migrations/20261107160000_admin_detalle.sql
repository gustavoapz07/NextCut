-- Panel del admin (ADR-018): el detalle de una barbería, con su dueño, sus barberos (y si tienen
-- cuenta) y sus servicios. Solo para el admin; no trae datos de los clientes, solo conteos.

create function public.admin_barberia(p_barberia uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_resultado jsonb;
begin
  if not privado.es_admin((select auth.uid())) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id', b.id,
    'nombre', b.nombre,
    'slug', b.slug,
    'zona', b.zona,
    'creado_en', b.creado_en,
    'fila_remota_activa', b.fila_remota_activa,
    'con_horario', b.horario is not null,
    'dueno_correo', (
      select u.email
      from public.miembros m
      join auth.users u on u.id = m.user_id
      where m.barberia_id = b.id and m.rol = 'dueno'
      order by u.created_at
      limit 1
    ),
    'barberos', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'nombre', x.nombre,
          'silla', x.silla,
          'activo', x.activo,
          'correo', u.email
        )
        order by x.activo desc, x.silla nulls last, x.nombre
      )
      from public.barberos x
      left join auth.users u on u.id = x.user_id
      where x.barberia_id = b.id
    ), '[]'::jsonb),
    'servicios', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'nombre', s.nombre,
          'duracion_min', s.duracion_min,
          'precio_ref', s.precio_ref,
          'activo', s.activo
        )
        order by s.activo desc, s.precio_ref, s.nombre
      )
      from public.servicios s
      where s.barberia_id = b.id
    ), '[]'::jsonb),
    'turnos_7_dias', (
      select count(*) from public.turnos t
      where t.barberia_id = b.id and t.creado_en > now() - interval '7 days'
    ),
    'atendidos_7_dias', (
      select count(*) from public.turnos t
      where t.barberia_id = b.id and t.estado = 'atendido'
        and t.creado_en > now() - interval '7 days'
    )
  )
  into v_resultado
  from public.barberias b
  where b.id = p_barberia;

  return v_resultado;
end;
$$;

revoke execute on function public.admin_barberia(uuid) from public, anon, authenticated;
grant execute on function public.admin_barberia(uuid) to authenticated, service_role;
