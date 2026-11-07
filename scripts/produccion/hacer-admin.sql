-- Nombra super admin a una cuenta (ADR-017): podrá entrar a /admin, dar de alta barberías con su
-- dueño y ponerle una contraseña nueva al dueño que la olvide.
--
-- Nadie se puede nombrar admin desde la app: solo así, en el editor SQL del proyecto.
-- La cuenta tiene que existir (Authentication → Users). Se puede correr las veces que haga falta.

insert into privado.admins (user_id)
select id from auth.users where lower(email) = lower('tu-correo@ejemplo.com')
on conflict (user_id) do nothing
returning user_id;

-- Si no devuelve ninguna fila, el correo no tiene cuenta o ya era admin. Para revisar:
-- select u.email, a.creado_en from privado.admins a join auth.users u on u.id = a.user_id;
--
-- Para quitarle el permiso:
-- delete from privado.admins where user_id = (select id from auth.users where email = '...');
