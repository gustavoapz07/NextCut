-- Super admin y cuentas con contraseña temporal (ADR-017): solo el admin da de alta barberías,
-- solo el dueño liga cuentas a sus sillas, y nadie con sesión usa las funciones de la Edge Function.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Datos: un admin, la dueña de A con un barbero con cuenta y una silla sin cuenta, y el dueño de B.
insert into auth.users (id, email) values
  ('f0000000-0000-4000-8000-0000000000ad', 'admin@admin.test'),
  ('f0000000-0000-4000-8000-0000000000a1', 'duena-a@admin.test'),
  ('f0000000-0000-4000-8000-0000000000a2', 'barbero-a@admin.test'),
  ('f0000000-0000-4000-8000-0000000000b1', 'dueno-b@admin.test'),
  ('f0000000-0000-4000-8000-0000000000c1', 'nueva@admin.test');
insert into privado.admins (user_id) values ('f0000000-0000-4000-8000-0000000000ad');

insert into public.barberias (id, nombre, slug) values
  ('f1000000-0000-4000-8000-00000000000a', 'Admin A', 'admin-a'),
  ('f1000000-0000-4000-8000-00000000000b', 'Admin B', 'admin-b');
insert into public.miembros (user_id, barberia_id, rol) values
  ('f0000000-0000-4000-8000-0000000000a1', 'f1000000-0000-4000-8000-00000000000a', 'dueno'),
  ('f0000000-0000-4000-8000-0000000000a2', 'f1000000-0000-4000-8000-00000000000a', 'barbero'),
  ('f0000000-0000-4000-8000-0000000000b1', 'f1000000-0000-4000-8000-00000000000b', 'dueno');
insert into public.barberos (id, barberia_id, user_id, nombre, silla, activo) values
  ('f2000000-0000-4000-8000-0000000000a1', 'f1000000-0000-4000-8000-00000000000a',
   'f0000000-0000-4000-8000-0000000000a2', 'Con Cuenta', 1, true),
  ('f2000000-0000-4000-8000-0000000000a2', 'f1000000-0000-4000-8000-00000000000a',
   null, 'Sin Cuenta', 2, true),
  ('f2000000-0000-4000-8000-0000000000a3', 'f1000000-0000-4000-8000-00000000000a',
   null, 'Inactivo', null, false);

-- Permisos de ejecución.
select ok(
  not has_function_privilege('authenticated', 'public.alta_barberia(uuid, text, text, text, uuid)', 'execute')
  and not has_function_privilege('authenticated', 'public.ligar_cuenta_barbero(uuid, uuid, uuid)', 'execute')
  and not has_function_privilege('authenticated', 'public.cuenta_para_restablecer(uuid, uuid, uuid)', 'execute')
  and not has_function_privilege('authenticated', 'public.cuenta_por_correo(text)', 'execute'),
  'el personal no ejecuta las funciones de la Edge Function cuentas'
);
select ok(
  has_function_privilege('service_role', 'public.alta_barberia(uuid, text, text, text, uuid)', 'execute'),
  'la Edge Function (clave secreta) sí'
);
select is(
  (select count(*)::int from information_schema.role_table_grants
   where table_schema = 'privado' and table_name = 'admins'
     and grantee in ('anon', 'authenticated')),
  0,
  'nadie con la clave publicable toca la lista de admins'
);

-- Alta de barbería (como la llama la Edge Function).
select throws_ok(
  $$ select public.alta_barberia('f0000000-0000-4000-8000-0000000000a1', 'Intrusa', 'intrusa',
     null, 'f0000000-0000-4000-8000-0000000000c1') $$,
  '42501', null, 'una dueña que no es admin no da de alta barberías'
);
select throws_ok(
  $$ select public.alta_barberia('f0000000-0000-4000-8000-0000000000ad', 'Repetida', 'admin-a',
     null, 'f0000000-0000-4000-8000-0000000000c1') $$,
  'P0001', 'slug_en_uso', 'no repite la dirección de otra barbería'
);
select throws_ok(
  $$ select public.admin_puede_crear('f0000000-0000-4000-8000-0000000000ad', 'admin-b') $$,
  'P0001', 'slug_en_uso', 'la revisión previa también avisa del slug repetido'
);
select lives_ok(
  $$ select public.alta_barberia('f0000000-0000-4000-8000-0000000000ad', 'Nueva', 'admin-nueva',
     'Centro', 'f0000000-0000-4000-8000-0000000000c1') $$,
  'el admin da de alta una barbería'
);
select is(
  (select m.rol::text from public.miembros m join public.barberias b on b.id = m.barberia_id
   where b.slug = 'admin-nueva' and m.user_id = 'f0000000-0000-4000-8000-0000000000c1'),
  'dueno', 'con su dueña'
);
select is(
  (select count(*)::int from public.servicios s join public.barberias b on b.id = s.barberia_id
   where b.slug = 'admin-nueva' and s.activo),
  1, 'y un servicio para que la fila funcione'
);

-- Ligar cuentas a sillas.
select throws_ok(
  $$ select public.dueno_puede_ligar('f0000000-0000-4000-8000-0000000000b1',
     'f2000000-0000-4000-8000-0000000000a2') $$,
  '42501', null, 'el dueño de B no liga cuentas en las sillas de A'
);
select throws_ok(
  $$ select public.dueno_puede_ligar('f0000000-0000-4000-8000-0000000000a2',
     'f2000000-0000-4000-8000-0000000000a2') $$,
  '42501', null, 'un barbero tampoco'
);
select throws_ok(
  $$ select public.dueno_puede_ligar('f0000000-0000-4000-8000-0000000000a1',
     'f2000000-0000-4000-8000-0000000000a1') $$,
  'P0001', 'barbero_con_cuenta', 'una silla que ya tiene cuenta no se vuelve a ligar'
);
select throws_ok(
  $$ select public.dueno_puede_ligar('f0000000-0000-4000-8000-0000000000a1',
     'f2000000-0000-4000-8000-0000000000a3') $$,
  'P0001', 'barbero_inactivo', 'ni una que ya no atiende'
);
insert into auth.users (id, email) values ('f0000000-0000-4000-8000-0000000000a3', 'nuevo@admin.test');
select lives_ok(
  $$ select public.ligar_cuenta_barbero('f0000000-0000-4000-8000-0000000000a1',
     'f2000000-0000-4000-8000-0000000000a2', 'f0000000-0000-4000-8000-0000000000a3') $$,
  'la dueña liga una cuenta nueva a su silla'
);
select ok(
  exists (select 1 from public.miembros where user_id = 'f0000000-0000-4000-8000-0000000000a3'
          and barberia_id = 'f1000000-0000-4000-8000-00000000000a' and rol = 'barbero')
  and (select user_id from public.barberos where id = 'f2000000-0000-4000-8000-0000000000a2')
      = 'f0000000-0000-4000-8000-0000000000a3',
  'y la cuenta queda como barbero de esa silla'
);

-- Contraseñas nuevas.
select is(
  public.cuenta_para_restablecer('f0000000-0000-4000-8000-0000000000a1',
    'f2000000-0000-4000-8000-0000000000a1', null),
  'f0000000-0000-4000-8000-0000000000a2'::uuid,
  'la dueña le restablece la contraseña a su barbero'
);
select throws_ok(
  $$ select public.cuenta_para_restablecer('f0000000-0000-4000-8000-0000000000b1',
     'f2000000-0000-4000-8000-0000000000a1', null) $$,
  '42501', null, 'el dueño de B no toca a los barberos de A'
);
select throws_ok(
  $$ select public.cuenta_para_restablecer('f0000000-0000-4000-8000-0000000000a1', null,
     'f1000000-0000-4000-8000-00000000000b') $$,
  '42501', null, 'una dueña no le cambia la contraseña al dueño de otra barbería'
);
select is(
  public.cuenta_para_restablecer('f0000000-0000-4000-8000-0000000000ad', null,
    'f1000000-0000-4000-8000-00000000000b'),
  'f0000000-0000-4000-8000-0000000000b1'::uuid,
  'el admin sí, a cualquier dueño'
);

-- Con sesión: solo el admin ve la lista.
set role authenticated;
set request.jwt.claims to '{"sub": "f0000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select ok(not public.soy_admin(), 'la dueña no es admin');
select throws_ok($$ select public.admin_barberias() $$, '42501', null, 'y no ve la lista de barberías');
select throws_ok(
  $$ insert into privado.admins (user_id) values ('f0000000-0000-4000-8000-0000000000a1') $$,
  '42501', null, 'ni se puede nombrar admin'
);

reset role;
set role authenticated;
set request.jwt.claims to '{"sub": "f0000000-0000-4000-8000-0000000000ad", "role": "authenticated"}';
select ok(public.soy_admin(), 'el admin sí es admin');
select ok(
  jsonb_array_length(public.admin_barberias()) >= 3,
  'y ve todas las barberías con su dueño'
);

reset role;
select * from finish();
rollback;
