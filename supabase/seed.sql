-- Datos de prueba para `supabase db reset` (local y CI). No se cargan en la nube.
-- Dos barberías para probar el aislamiento: La Navaja (3 barberos) y El Faro (1 barbero).
--
-- Usuarios de Auth solo con las columnas que existen antes de que arranque el servicio de Auth,
-- porque `supabase start` carga este archivo antes de levantarlo. Las cuentas para entrar con
-- correo y contraseña en local se agregan en el Sprint 3, junto con el login.
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  '{"provider": "email", "providers": ["email"]}', '{}'
from (values
  ('10000000-0000-4000-8000-000000000001'::uuid, 'dueno@lanavaja.test'),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'carlos@lanavaja.test'),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'jorge@lanavaja.test'),
  ('10000000-0000-4000-8000-000000000004'::uuid, 'kevin@lanavaja.test'),
  ('20000000-0000-4000-8000-000000000001'::uuid, 'dueno@elfaro.test')
) as u (id, email);

-- Barberías
insert into public.barberias (id, nombre, slug, zona, max_fila, tolerancia_min) values
  ('a0000000-0000-4000-8000-000000000001', 'La Navaja', 'la-navaja', 'Col. Palmira, Tegucigalpa', 20, 5),
  ('b0000000-0000-4000-8000-000000000001', 'El Faro', 'el-faro', 'Barrio Abajo, Tegucigalpa', 15, 5);

insert into public.miembros (user_id, barberia_id, rol) values
  ('10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'dueno'),
  ('10000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'barbero'),
  ('10000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'barbero'),
  ('10000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'barbero'),
  ('20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'dueno');

insert into public.barberos (id, barberia_id, user_id, nombre, apodo, silla) values
  ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000002', 'Carlos', 'El Profe', 1),
  ('a1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000003', 'Jorge', 'Rey del fade', 2),
  ('a1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000004', 'Kevin', 'Mano rápida', 3),
  ('b1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   null, 'Miguel', 'El Capi', 1);

insert into public.servicios (id, barberia_id, nombre, duracion_min, precio_ref) values
  ('a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Corte clásico', 25, 150),
  ('a2000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Fade', 35, 180),
  ('a2000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Corte + barba', 45, 230),
  ('a2000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Barba', 15, 100),
  ('a2000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Cejas o diseño', 10, 50),
  ('b2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Corte', 30, 120),
  ('b2000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Barba', 20, 80);

-- Una fila de ejemplo, creada con la misma función que usa la Edge Function.
select public.unirse_a_fila(
  'a0000000-0000-4000-8000-000000000001', t.nombre, t.servicio, repeat('s', 31) || t.n::text,
  t.barbero, t.telefono, t.origen::public.origen_turno
)
from (values
  (1, 'Luis Rivera', 'a2000000-0000-4000-8000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, null, 'local'),
  (2, 'Andrea Mejía', 'a2000000-0000-4000-8000-000000000002'::uuid, 'a1000000-0000-4000-8000-000000000002'::uuid, '+50499990002', 'remoto'),
  (3, 'José Pineda', 'a2000000-0000-4000-8000-000000000004'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid, null, 'local'),
  (4, 'Daniel Hernández', 'a2000000-0000-4000-8000-000000000004'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, '+50499990004', 'remoto'),
  (5, 'Kenia Alvarado', 'a2000000-0000-4000-8000-000000000005'::uuid, null, null, 'local')
) as t (n, nombre, servicio, barbero, telefono, origen)
order by t.n;

select public.unirse_a_fila(
  'b0000000-0000-4000-8000-000000000001', 'Roberto Zelaya',
  'b2000000-0000-4000-8000-000000000001', repeat('f', 32), null, '+50499990010', 'remoto'
);
