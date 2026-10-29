-- Barberías para la prueba de punta a punta (tests/e2e/) en el proyecto de pruebas de la nube.
-- No van en seed.sql porque ese archivo es solo para Supabase local y el CI.
-- Se puede correr las veces que haga falta: si ya existen, no cambia nada.
--
-- "Barbería Prueba" es la que usa el cliente de la prueba; "Prueba Dos" solo existe para
-- comprobar que no se puede pedir un servicio de otra barbería (fallo 3).
-- Nunca va en producción.

insert into public.barberias (id, nombre, slug, zona, max_fila, tolerancia_min) values
  ('e0000000-0000-4000-8000-000000000001', 'Barbería Prueba', 'barberia-prueba', 'Solo para pruebas', 30, 5),
  ('e0000000-0000-4000-8000-000000000002', 'Prueba Dos', 'prueba-dos', 'Solo para pruebas', 30, 5)
on conflict (id) do nothing;

insert into public.barberos (id, barberia_id, nombre, apodo, silla) values
  ('e1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'Carlos', 'El Profe', 1),
  ('e1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'Jorge', 'Rey del fade', 2),
  ('e1000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000002', 'Miguel', 'El Capi', 1)
on conflict (id) do nothing;

insert into public.servicios (id, barberia_id, nombre, duracion_min, precio_ref) values
  ('e2000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'Corte clásico', 30, 150),
  ('e2000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'Barba', 15, 100),
  ('e2000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000002', 'Corte', 30, 120)
on conflict (id) do nothing;
