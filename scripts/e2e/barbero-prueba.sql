-- Cuenta de barbero de prueba para "Barbería Prueba" (scripts/e2e/barberias-prueba.sql), en el
-- proyecto de pruebas de la nube. Liga la cuenta a Carlos (silla 1) para entrar al panel.
--
-- El correo y la contraseña NO van aquí: viven en .env.local (E2E_BARBERO_CORREO y
-- E2E_BARBERO_CLAVE). Para correrlo con psql:
--   psql "$URL_DE_LA_BASE" -v correo="$E2E_BARBERO_CORREO" -v clave="$E2E_BARBERO_CLAVE" -f scripts/e2e/barbero-prueba.sql
-- Se puede correr las veces que haga falta: si la cuenta existe, solo le cambia la contraseña.
-- Nunca va en producción (ahí las cuentas se crean por invitación, Sprint 4).

with cuenta as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  values (
    '00000000-0000-0000-0000-000000000000', 'e9000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', :'correo',
    extensions.crypt(:'clave', extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', ''
  )
  on conflict (id) do update
    set email = excluded.email, encrypted_password = excluded.encrypted_password, updated_at = now()
  returning id, email
)
insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
       'email', now(), now()
from cuenta
on conflict (provider_id, provider) do update set identity_data = excluded.identity_data;

insert into public.miembros (user_id, barberia_id, rol)
values ('e9000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'barbero')
on conflict do nothing;

update public.barberos
set user_id = 'e9000000-0000-4000-8000-000000000001'
where id = 'e1000000-0000-4000-8000-000000000001';
