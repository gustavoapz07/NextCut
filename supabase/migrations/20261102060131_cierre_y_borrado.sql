-- Tareas programadas del Sprint 4: el cierre del día y el borrado de teléfonos (fallo 5). Las dos
-- funciones existen desde la migración base; aquí solo se programan. Lo que hacen se prueba en
-- 03_funciones y en 07_cierre_y_borrado.

-- Cada hora, al minuto 1. `cerrar_dia()` solo toca turnos de un día anterior al de cada barbería
-- en su zona horaria, así que correr cada hora cierra el día poco después de la medianoche de
-- cualquier zona (en Honduras, a las 00:01). Quien seguía esperando cuenta como abandono y quien
-- fue llamado, como no llegó. Quien quedó en la silla no se toca: el barbero registra el cobro.
select cron.schedule(
  'cerrar-dia',
  '1 * * * *',
  'select public.cerrar_dia()'
);

-- Una vez al día, a las 3:40 a. m. de Honduras (9:40 UTC), 10 minutos después de limpiar el
-- historial de pg_cron. Borra el teléfono de los turnos cerrados de hace más de 90 días.
select cron.schedule(
  'borrar-telefonos-viejos',
  '40 9 * * *',
  'select public.borrar_telefonos_viejos()'
);
