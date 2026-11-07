# Puesta en producción

**Proyecto:** [NextCut](../README.md)
**Relacionado:** [Plan de implementación](plan-implementacion.md) · [Seguridad](seguridad.md) · [Decisiones](decisiones.md) · [Bitácora](bitacora.md)

Esta guía sirve para montar la versión que usan las barberías reales, aparte de la de pruebas. Los pasos van en orden. Los que dicen **(Gus)** necesitan una cuenta o un permiso del autor; los demás los puede hacer el asistente.

| | Pruebas | Producción |
|---|---|---|
| Supabase | `siguiente-pruebas` (`bquvluxsqfacleumlnmi`) | `nextcut-produccion` (`ctexofluhhsnsxenblgp`, us-east-1) |
| Worker de Cloudflare | `nextcut` | `nextcut-produccion` |
| Variables del build | `.env.local` + `.env.pruebas` | `.env.production.local` (plantilla: [`.env.production.example`](../.env.production.example)) |
| Publicar | `npm run deploy:pruebas` | `npm run deploy:produccion` |
| Turnstile | clave de prueba (deja pasar todo) | widget real |

## Estado al 05/11/2026

| Paso | Estado |
|---|---|
| 0. Decisiones | Hecho: se pausó `cms-opalo` y producción usa `nextcut-produccion.gustavoapz07.workers.dev` (sin dominio propio) |
| 1. Proyecto de Supabase | Hecho. Las claves heredadas ya venían desactivadas (la API responde 401 con `anon`) |
| 2. Base y funciones | Hecho: 8 migraciones, 5 tareas de `pg_cron` y las 3 funciones publicadas. Hecho también lo de ADR-017 (07/11/2026): migración `super_admin`, función `cuentas` y el autor como admin. Panel propio del admin publicado (versión `23b55cb8`, ADR-018) |
| 3. Secretos | Hecho: los 5 secretos, cargados por el autor con `scripts/produccion/secretos.mjs` |
| 4. Vault | Hecho |
| 5. Auth | Hecho: Site URL, redirección `/**`, registro apagado y contraseña de 10 con letras y números |
| 6. Turnstile | Hecho: widget "NextCut produccion" (Managed) para el hostname de producción |
| 7. Variables | Hecho |
| 8. Publicar | Hecho: https://nextcut-produccion.gustavoapz07.workers.dev (versión `8f84aaea`) |
| 9. Barbería piloto | Ninguna todavía: la Barbería Demo se borró el 07/11/2026 (ADR-018). Las barberías se dan de alta en `/admin` |
| 10. Revisión | Pendiente, después del alta |

`npm run deploy:produccion` no publica si falta una variable, si alguna quedó con el valor de pruebas o si la clave de Turnstile es de prueba (`scripts/revisar-produccion.mjs`). Después revisa que el build no lleve claves secretas (`scripts/revisar-build.mjs`).

---

## 0. Decisiones antes de empezar (Gus)

1. **Espacio en Supabase:** la cuenta gratuita ya usa sus 2 proyectos. Hay que pausar uno (`cms-opalo`) o pagar Pro (USD 25 al mes) ([plan, sección 15](plan-implementacion.md#15-decisiones-pendientes)).
2. **Dominio:** decidido el 05/11/2026: `nextcut-produccion.gustavoapz07.workers.dev`, gratis. En esta guía `<dominio>` es esa dirección. El QR impreso apunta ahí: si algún día se compra un dominio propio, hay que reimprimir el QR de cada barbería, y no conviene cambiar el subdominio `gustavoapz07` de la cuenta de Cloudflare.
3. **Contacto de privacidad:** el correo o WhatsApp que aparece en `/privacidad` para pedir que se borren los datos. Es opcional; sin él, la página remite a la barbería.

## 1. Proyecto de Supabase (Gus)

1. Crear el proyecto `nextcut-produccion` en `us-east-1`, con una contraseña de base fuerte guardada en el gestor de contraseñas.
2. En **Settings → API Keys**, desactivar las claves heredadas (`anon` y `service_role`). La app solo usa la publicable y la secreta.
3. Anotar el *project ref* (los 20 caracteres de la URL). En esta guía aparece como `<ref>`.

## 2. Base de datos y funciones

```bash
npx supabase link --project-ref <ref>
npx supabase db push --linked
npx supabase functions deploy --project-ref <ref> --use-api
```

No hace falta la contraseña de la base: con la sesión de `npx supabase login`, la CLI entra con un rol temporal ("Initialising login role...").

- `db push` aplica todas las migraciones: tablas, RLS, funciones y las tareas de `pg_cron` (el "no llegó" automático, los avisos, el cierre del día y el borrado de teléfonos).
- `functions deploy` publica `unirse-a-fila`, `avisos`, `salud` y `cuentas`, con `verify_jwt = false` según `supabase/config.toml`. `cuentas` usa el mismo `ORIGENES_PERMITIDOS`.
- **Al terminar, volver a enlazar pruebas** (`npx supabase link --project-ref bquvluxsqfacleumlnmi`), para que el próximo `db push` no vaya a producción sin querer.
- `seed.sql` no se carga en la nube: producción empieza vacía.

## 3. Secretos de las funciones (Gus)

El modo automático de Claude Code no deja cargar secretos, así que los carga el autor. Para producción hay un solo comando, que pide la Secret Key de Turnstile sin mostrarla, genera lo demás y lo guarda todo:

```bash
node scripts/produccion/secretos.mjs
```

Los comandos sueltos, por si hace falta cambiar uno solo:

```bash
# Clave secreta del widget de Turnstile (paso 6)
npx supabase secrets set TURNSTILE_SECRET=<secreta-de-turnstile> --project-ref <ref>
```

```bash
# Orígenes que pueden anotarse: solo el dominio de producción (sin barra al final)
npx supabase secrets set "ORIGENES_PERMITIDOS=https://<dominio>" --project-ref <ref>
```

```bash
# Sal para el hash de la IP (ADR-013, punto 5): se genera y se guarda sin mostrarla
npx supabase secrets set "IP_SALT=$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64url'))")" --project-ref <ref>
```

```bash
# Claves VAPID de los avisos: guarda las dos en Supabase e imprime la pública para el paso 7
node scripts/claves-vapid.mjs <ref>
```

## 4. Vault: dirección y clave de los avisos

En el editor SQL del proyecto de producción ([ADR-014](decisiones.md#adr-014--avisos-por-web-push-sin-librerías-ni-caché), punto 4). La clave se genera dentro de la base y nadie la ve:

```sql
select vault.create_secret('https://<ref>.supabase.co/functions/v1/avisos', 'avisos_url');
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'avisos_clave');
```

Sin estos dos secretos la app funciona, pero no manda avisos.

## 5. Auth (Gus)

En **Authentication**:

- **URL Configuration:** *Site URL* `https://<dominio>` y el mismo dominio en *Redirect URLs*.
- **Sign In / Providers → Email:** apagar *Allow new users to sign up*. Las cuentas del personal se crean a mano (paso 9) hasta que existan las invitaciones por correo. Subir la contraseña mínima a 10 caracteres y pedir letras y números.
- La protección contra contraseñas filtradas solo existe en Pro. Si se paga Pro, encenderla.

## 6. Turnstile (Gus)

En Cloudflare → **Turnstile → Add widget**: modo *Managed*, con el dominio de producción como hostname. La clave del sitio va en `.env.production.local` y la secreta en `TURNSTILE_SECRET` (paso 3).

## 7. Variables del build

Copiar `.env.production.example` como `.env.production.local` y llenarla: URL y clave publicable del paso 1, clave de sitio de Turnstile del paso 6, clave pública VAPID del paso 3 y, si hay, el contacto de privacidad y el DSN de Sentry.

## 8. Publicar

```bash
npm run deploy:produccion
```

La primera vez, Wrangler crea el Worker `nextcut-produccion` y muestra su dirección `workers.dev`. Para un dominio propio, el dominio tiene que estar en Cloudflare. Se agrega en `wrangler.jsonc`, dentro de `env.produccion`, y se vuelve a publicar:

```jsonc
"routes": [{ "pattern": "<dominio>", "custom_domain": true }]
```

Si el dominio cambia, hay que actualizar `ORIGENES_PERMITIDOS`, la *Site URL* de Auth y el hostname del widget de Turnstile.

## 9. Barbería piloto

**Desde el panel de admin ([ADR-017](decisiones.md#adr-017--super-admin-y-cuentas-con-contraseña-temporal-sin-correo)):**

1. **(Gus, una sola vez)** Nombrar admin a tu cuenta con [`scripts/produccion/hacer-admin.sql`](../scripts/produccion/hacer-admin.sql) en el editor SQL de producción.
2. Entrar en `/entrar`: el admin cae en `/admin`. Llenar "Nueva barbería" (nombre, dirección, zona y correo del dueño) y mandarle al dueño por WhatsApp el mensaje con la contraseña temporal. No se vuelve a mostrar.
3. El dueño entra, elige su contraseña, agrega a sus barberos en **Configuración → Barberos** (con "Crear cuenta" si cada uno va a usar la suya), ajusta servicios y horario y descarga el QR en `/dueno/qr`.

**Con SQL, para cargar todo de una vez:** llenar [`scripts/produccion/alta-barberia.sql`](../scripts/produccion/alta-barberia.sql) (nombre, slug, horario, barberos y servicios) después de crear las cuentas en **Authentication → Users → Add user** con *Auto Confirm User*, y correrlo una vez en el editor SQL. Si algo está mal, no guarda nada.

## 10. Revisar antes de imprimir el QR

- [ ] `https://<ref>.supabase.co/functions/v1/salud` responde 200 con `"tareas":"ok"`. Si responde 503, `pg_cron` no está corriendo.
- [ ] Security Advisor sin avisos nuevos, aparte de los aceptados en [ADR-011](decisiones.md#adr-011--detalles-de-la-base-de-datos-del-sprint-1).
- [ ] Desde un celular con datos móviles: escanear el QR, anotarse, ver el turno en vivo y cancelarlo.
- [ ] Desde el panel: llamar, empezar y terminar un turno, y verlo en el reporte del día.
- [ ] Los avisos llegan a un Android con la página abierta en Chrome.
- [ ] La pantalla `/b/<slug>/tv` se actualiza sola.
- [ ] `/privacidad` muestra el contacto correcto.
- [ ] Al tocar el logo, lleva al inicio y no abre el menú de pantallas de demostración.
- [ ] **(Gus)** Monitor de UptimeRobot con la URL de `salud`, cada 5 minutos ([ADR-016](decisiones.md#adr-016--sentry-bajo-demanda-y-endpoint-de-salud-con-el-reloj-de-pg_cron)).
- [ ] Cancelar los turnos de prueba antes de abrir, para que no cuenten en el reporte del primer día.
