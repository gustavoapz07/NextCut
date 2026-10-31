-- La cuenta de prueba de Carlos (scripts/e2e/barbero-prueba.sql) pasa a ser también la dueña de
-- "Barbería Prueba": el caso común de la barbería chica donde el dueño también corta. Con ella se
-- prueba el panel del dueño (/dueno) sin crear otra cuenta con contraseña. Sigue atendiendo en la
-- silla 1: `puede_atender` deja pasar al barbero en persona, y el dueño es miembro de la barbería.
--
-- Va después de barbero-prueba.sql. Se puede correr las veces que haga falta.
-- Nunca va en producción (ahí las cuentas se crean por invitación, Sprint 4).

update public.miembros
set rol = 'dueno'
where user_id = 'e9000000-0000-4000-8000-000000000001'
  and barberia_id = 'e0000000-0000-4000-8000-000000000001';
