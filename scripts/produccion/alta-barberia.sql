-- Da de alta una barbería en producción, con su dueño, barberos y servicios (docs/produccion.md).
-- Mientras no existan las invitaciones por correo, así se carga la barbería piloto.
--
-- Antes de correrlo:
--   1. Crear la cuenta del dueño en Supabase: Authentication → Users → Add user → Create new user,
--      con su correo, una contraseña de al menos 10 caracteres y "Auto Confirm User" marcado.
--      Igual para cada barbero que vaya a entrar con su propia cuenta (es opcional: el dueño puede
--      atender cualquier silla desde su panel).
--   2. Cambiar los valores de la sección "Datos de la barbería".
--
-- Se corre una vez, en el editor SQL del proyecto de producción. Todo pasa en una transacción:
-- si algo está mal (correo que no existe, slug repetido, un dato fuera de rango), no queda nada a
-- medias. Al terminar muestra el enlace público y el del QR.

do $$
declare
  -- ===== Datos de la barbería =====================================================
  v_nombre        text    := 'Barbería Ejemplo';            -- de 2 a 60 caracteres
  v_slug          text    := 'barberia-ejemplo';            -- la dirección: /b/<slug>. Minúsculas, números y guiones
  v_zona          text    := 'Barrio El Centro, El Progreso'; -- opcional (null)
  v_correo_dueno  text    := 'dueno@ejemplo.com';           -- la cuenta creada en el paso 1
  v_max_fila      integer := 20;                            -- de 1 a 100
  v_tolerancia    integer := 5;                             -- minutos antes de "no llegó", de 1 a 30
  -- Por día ISO ("1" lunes … "7" domingo): {"abre": "HH:MM", "cierra": "HH:MM"} o null si no abre.
  -- null en vez del objeto completo: siempre abierta.
  v_horario       jsonb   := '{
    "1": {"abre": "09:00", "cierra": "19:00"},
    "2": {"abre": "09:00", "cierra": "19:00"},
    "3": {"abre": "09:00", "cierra": "19:00"},
    "4": {"abre": "09:00", "cierra": "19:00"},
    "5": {"abre": "09:00", "cierra": "19:00"},
    "6": {"abre": "08:00", "cierra": "20:00"},
    "7": null
  }';
  -- Barberos: nombre, apodo (o null), silla y el correo de su cuenta (o null si no tiene).
  v_barberos      jsonb   := '[
    {"nombre": "Carlos", "apodo": null, "silla": 1, "correo": null},
    {"nombre": "Jorge",  "apodo": null, "silla": 2, "correo": null}
  ]';
  -- Servicios: el primero es el que usa el estimado de quien todavía no se anota (ADR-012).
  v_servicios     jsonb   := '[
    {"nombre": "Corte",         "duracion_min": 30, "precio_ref": 150},
    {"nombre": "Corte + barba", "duracion_min": 45, "precio_ref": 220},
    {"nombre": "Barba",         "duracion_min": 15, "precio_ref": 80}
  ]';
  -- ==================================================================================

  v_barberia uuid;
  v_dueno    uuid;
  v_cuenta   uuid;
  b          jsonb;
  s          jsonb;
begin
  select id into v_dueno from auth.users where lower(email) = lower(v_correo_dueno);
  if v_dueno is null then
    raise exception 'No existe la cuenta %: créala primero en Authentication → Users.', v_correo_dueno;
  end if;
  if exists (select 1 from public.barberias where slug = v_slug) then
    raise exception 'Ya hay una barbería con el slug %.', v_slug;
  end if;
  if jsonb_array_length(v_servicios) = 0 or jsonb_array_length(v_barberos) = 0 then
    raise exception 'Hace falta al menos un barbero y un servicio.';
  end if;

  insert into public.barberias (nombre, slug, zona, max_fila, tolerancia_min, horario)
  values (v_nombre, v_slug, v_zona, v_max_fila, v_tolerancia, v_horario)
  returning id into v_barberia;

  insert into public.miembros (user_id, barberia_id, rol) values (v_dueno, v_barberia, 'dueno');

  for s in select * from jsonb_array_elements(v_servicios) loop
    insert into public.servicios (barberia_id, nombre, duracion_min, precio_ref)
    values (v_barberia, s ->> 'nombre', (s ->> 'duracion_min')::int, (s ->> 'precio_ref')::numeric);
  end loop;

  for b in select * from jsonb_array_elements(v_barberos) loop
    v_cuenta := null;
    if b ->> 'correo' is not null then
      select id into v_cuenta from auth.users where lower(email) = lower(b ->> 'correo');
      if v_cuenta is null then
        raise exception 'No existe la cuenta % del barbero %.', b ->> 'correo', b ->> 'nombre';
      end if;
      -- El dueño que también corta ya es miembro; los demás entran como barberos.
      insert into public.miembros (user_id, barberia_id, rol)
      values (v_cuenta, v_barberia, 'barbero')
      on conflict (user_id, barberia_id) do nothing;
    end if;
    insert into public.barberos (barberia_id, user_id, nombre, apodo, silla)
    values (v_barberia, v_cuenta, b ->> 'nombre', b ->> 'apodo', (b ->> 'silla')::int);
  end loop;

  raise notice 'Lista: % (%). Fila pública: /b/% · QR de la puerta: /b/%?origen=qr · TV: /b/%/tv',
    v_nombre, v_barberia, v_slug, v_slug, v_slug;
end
$$;
