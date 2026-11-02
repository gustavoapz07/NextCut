# Seguridad: auditoría del diseño

**Proyecto:** [NextCut](../README.md) · **Fecha:** 25 de octubre de 2026 · **Fase:** Sprint 2 · cliente (actualizado el 28/10/2026)
**Relacionado:** [Decisiones](decisiones.md) · [Investigación](investigacion.md) · [Plan de implementación](plan-implementacion.md) · [Bitácora](bitacora.md)

El diseño se revisó contra los 10 fallos de seguridad más comunes en apps con APIs y agentes. Cada control tiene una **prueba** que debe pasar antes de lanzar. El estado se actualiza en cada fase.

**Estados:** 🟦 diseñado · 🟨 implementado sin prueba · 🟩 probado · ⬜ no aplica todavía

---

## Amenazas propias de una fila virtual

Antes de la lista general, estos son los abusos más probables en este producto:

| Amenaza | Ejemplo | Impacto | Control principal |
|---|---|---|---|
| **Inundar la fila** | Un bot o un competidor crea 50 turnos falsos | La barbería parece llena y los clientes reales se van | Turnstile, límites por IP y teléfono, pausa automática (#9) |
| **Turnos fantasma** | Alguien se anota desde lejos y no llega | Retrasa a todos | Tolerancia de "no llegó" configurable; teléfonos con muchos "no llegó" quedan marcados |
| **Adivinar códigos de turno** | Cambiar `/t/1234` por `/t/1235` para ver o cancelar turnos ajenos | Ver nombres o cancelar a otros | Códigos aleatorios largos y un secreto aparte para cancelar (#2, #5) |
| **Nombre ofensivo o con código en la TV** | Un nombre con groserías o con `<script>` | Pena pública o XSS persistente en la pantalla del local | El texto se muestra siempre como texto, límite de largo y botón del dueño para ocultar o renombrar (#3) |
| **Montos alterados** | Un barbero registra menos de lo cobrado | Pérdida para el dueño (el problema P3) | Bitácora inmutable de eventos; el barbero no puede editar un turno cerrado (#7, #10) |
| **Una barbería ve datos de otra** | Error en un filtro | Fuga de datos entre clientes del SaaS | RLS en la base, no filtros en el frontend (#2, #7) |
| **Usar los avisos para atacar otra dirección (SSRF)** | Registrar como "suscripción" una URL interna o de un tercero | La función de avisos le manda solicitudes a esa dirección | Solo endpoints de Google, Mozilla, Apple y Microsoft, en la base y en la función ([ADR-014](decisiones.md#adr-014--avisos-por-web-push-sin-librerías-ni-caché)); probado con pgTAP y Vitest |

---

## Los 10 fallos

### 1. API keys en el código · 🟦

- **Riesgo:** subir al repositorio la clave secreta de Supabase o de Turnstile da control total de la base.
- **Controles:**
  - El frontend solo lleva la **clave publicable** de Supabase, que es pública por diseño y depende de RLS.
  - La clave secreta (service role), `TURNSTILE_SECRET` y `VAPID_PRIVATE_KEY` viven solo en los secretos de las Edge Functions.
  - `.env*` en `.gitignore`, con un `.env.example` sin valores.
  - `gitleaks` en pre-commit y en CI; escaneo de secretos de GitHub activado.
  - Si una clave se filtra, se rota de inmediato y se registra en la bitácora.
- **Prueba:** `gitleaks detect` pasa en CI. Buscar en el build de producción que no aparezca `service_role` ni `sb_secret`.

### 2. Endpoints expuestos en la web pública · 🟩

- **Riesgo:** con la API de Supabase, cualquier tabla sin RLS queda abierta a internet.
- **Controles:**
  - RLS activo en **todas** las tablas, con denegación por defecto.
  - El público (rol `anon`) no toca tablas. Solo puede ejecutar `ver_turno(codigo)`, `cancelar_turno(codigo, secreto)` y `suscribir_push(codigo, secreto, suscripcion)`, además de leer la vista `fila_publica`, que no tiene teléfonos ni nombres completos.
  - Para anotarse, el formulario llama a la Edge Function `unirse-a-fila`, que verifica Turnstile y el límite por IP y solo entonces ejecuta `unirse_a_fila` con la clave secreta. Así nadie se salta Turnstile llamando a la API ([ADR-007](decisiones.md#adr-007--anotarse-pasa-por-una-edge-function-y-el-tiempo-real-solo-manda-señales)).
  - El tiempo real solo publica una señal vacía ("la fila cambió") en un canal público; los datos se vuelven a pedir con los permisos de cada pantalla.
  - `codigo_publico` aleatorio de al menos 10 caracteres; el número que se ve en la TV es aparte y no sirve para nada.
  - Revisión con el Security Advisor de Supabase antes de cada despliegue.
- **Prueba (pgTAP):** `anon` no puede hacer `select` en `turnos`; un usuario de la barbería A no lee ni modifica filas de la barbería B.

### 3. Input sin validar · 🟩 (base, Edge Function, formulario y prueba de punta a punta del 28/10/2026)

- **Riesgo:** datos basura, inyección o XSS en la pantalla del local.
- **Controles:**
  - Esquemas con zod en el cliente y **validación otra vez dentro de la función** de la base: nombre de 2 a 40 caracteres, teléfono `^\+504[0-9]{8}$` opcional, servicio y barbero de la misma barbería.
  - `CHECK` en las columnas y consultas parametrizadas (nunca SQL armado con texto).
  - React escapa el texto por defecto; queda prohibido `dangerouslySetInnerHTML`.
  - El dueño puede ocultar o renombrar un turno desde el panel.
- **Prueba:** enviar nombres de 500 caracteres, `<script>alert(1)</script>`, emojis, teléfonos de otros países y un `servicio_id` de otra barbería. Todo debe rechazarse o mostrarse como texto.

### 4. Prompt débil · ⬜

- **Estado:** el MVP no usa IA.
- **Regla para cuando la haya** (por ejemplo, un asistente que responda "¿cuánta gente hay?"): prompt de sistema con un rol cerrado; el modelo solo recibe datos de **una** barbería; herramientas de solo lectura y en lista blanca; respuestas validadas contra un esquema; batería de pruebas de inyección de prompt antes de activarlo.

### 5. Datos sensibles · 🟩 (pantallas públicas probadas; borrado a los 90 días programado y probado el 02/11/2026; falta confirmar el plazo con los dueños)

- **Riesgo:** exponer teléfonos o hábitos de los clientes.
- **Controles:**
  - Se pide lo mínimo: nombre y, opcional, teléfono.
  - La vista pública y la TV muestran "Carlos M." y el número de turno.
  - El teléfono solo lo ve el personal de esa barbería.
  - El teléfono de cada turno cerrado se borra 90 días después de esa visita: `borrar_telefonos_viejos()` corre cada día a las 3:40 a. m. con `pg_cron` (plazo propuesto, a confirmar con los dueños). Un turno abierto conserva el teléfono hasta que se cierre.
  - Solo HTTPS. Aviso de privacidad corto en el formulario.
  - Honduras no tiene todavía una ley de protección de datos personales vigente (estaba pendiente en agosto de 2026), pero se aplican sus principios de todos modos: finalidad, mínimo necesario y derecho a borrar.
- **Prueba:** revisar la respuesta de `fila_publica` y de `ver_turno`; ninguna debe contener teléfonos. El borrado se prueba en `07_cierre_y_borrado` (pgTAP).

### 6. Sin límite de tokens · ⬜ (equivalente sin IA: 🟨 — máximo de 2 avisos por turno probado el 31/10/2026; faltan las cuotas por barbería)

- **Estado:** sin IA no hay tokens. El riesgo equivalente es el **costo variable sin techo**.
- **Controles:** cuotas por barbería (turnos por día según el plan y tamaño máximo de la fila), máximo de 2 avisos push por turno (cada uno se reserva una sola vez en la base, [ADR-014](decisiones.md#adr-014--avisos-por-web-push-sin-librerías-ni-caché)), la base solo llama a la función de avisos cuando hay algo pendiente y, en el complemento de WhatsApp, presupuesto mensual con alerta al 80 % y corte al 100 %. Con IA: `max_tokens` por solicitud y presupuesto mensual por barbería.
- **Prueba:** crear turnos hasta superar la cuota; el sistema debe rechazar con un mensaje claro. Los avisos: `supabase/tests/database/05_avisos.test.sql` (un turno recibe "ya casi" y "te toca" una sola vez cada uno, aunque cambie de navegador).

### 7. Permisos excesivos · 🟩

- **Controles:**
  - Roles: `dueno` (todo en su barbería) y `barbero` (solo sus turnos y su pausa). La pantalla de TV usa la vista pública sin token, porque esa vista no tiene datos privados ([ADR-007](decisiones.md#adr-007--anotarse-pasa-por-una-edge-function-y-el-tiempo-real-solo-manda-señales)).
  - Un turno cerrado no se edita; las correcciones se hacen como un evento nuevo que el dueño ve.
  - La clave secreta solo existe en Edge Functions.
  - Funciones `security definer` con `search_path` fijo y `revoke all ... from public`; solo se concede `execute` al rol que la necesita.
- **Prueba (pgTAP):** un barbero no puede cerrar el turno de otro ni editar un turno `atendido`; el público no puede ejecutar `unirse_a_fila` directo ni escribir en ninguna tabla; ni el público ni el personal tocan las funciones de los avisos, que solo ejecuta la clave secreta.

### 8. Manejo de errores · 🟩 (concurrencia e idempotencia probadas en el CI el 27/10/2026; los mensajes genéricos del formulario se revisan en el Sprint 2)

- **Controles:**
  - El usuario ve mensajes genéricos ("No pudimos anotarte, intenta de nuevo") con un código corto; el detalle va a los logs.
  - Sin trazas de error en producción y sin datos personales en Sentry.
  - "Llamar siguiente" es una transacción con `FOR UPDATE SKIP LOCKED`, para que dos barberos no llamen al mismo cliente.
  - Clave de idempotencia al anotarse, para que un doble toque no cree dos turnos.
- **Prueba:** dos barberos presionan "Llamar siguiente" a la vez y cada uno recibe un cliente distinto; un doble envío del formulario crea un solo turno.

### 9. Rate limiting · 🟩 (límites por IP, teléfono y tamaño de la fila, pausa automática y prueba de carga probados; Turnstile y la IP real probados en la nube)

- **Controles:**
  - Cloudflare Turnstile en el formulario, verificado en una Edge Function.
  - Un turno activo por teléfono por barbería.
  - Máximo de 5 turnos por IP cada 10 minutos (contador en Postgres).
  - Tamaño máximo de la fila configurable.
  - **Pausa automática** de la fila en línea si entran 10 turnos en línea en 5 minutos (el dueño elige de 3 a 50), con aviso en su resumen. Los turnos del QR de la puerta no cuentan ([ADR-015](decisiones.md#adr-015--pausa-automática-de-la-fila-en-línea-ante-picos)). Se prueba en `08_pausa_automatica` (pgTAP).
- **Prueba:** un script que intenta 50 turnos en un minuto; deben pasar como máximo los permitidos y debe saltar la alerta.
  - `scripts/carga.mjs` (en la CI, contra la base): 50 intentos a la vez desde 50 IPs distintas dejan entrar 10, pausan la fila en línea y dejan una sola alerta; desde una IP entran 5.
  - `scripts/carga-api.mjs` (a mano, contra la Edge Function publicada): el 02/11/2026, 50 intentos en 10 segundos desde una IP, cada uno con `x-forwarded-for` y `x-real-ip` falsos. Entraron 5 y 45 recibieron `limite_ip`; los 5 quedaron con el mismo hash de IP.

### 10. Monitoreo, logs y alertas · 🟨 (bitácora y alerta de pico probadas; faltan Sentry y el endpoint de salud)

- **Controles:**
  - Tabla `eventos_turno` como bitácora de solo inserción (quién, qué y cuándo).
  - Sentry para errores del frontend.
  - Monitor de disponibilidad gratuito sobre un endpoint de salud.
  - Alertas al dueño: pico anómalo de turnos y fila remota pausada. Por ahora en el resumen del panel; todavía no por push ni por correo.
  - Revisión semanal de los logs y de los avisos del Security Advisor de Supabase.
- **Prueba:** provocar un pico y un error; deben aparecer en los logs y llegar la alerta.

---

## Pendientes antes del piloto

- [x] Escribir las pruebas pgTAP de RLS (#2 y #7): `supabase/tests/database/`, 101 pruebas en verde el 27/10/2026.
- [ ] Configurar `gitleaks` en pre-commit y CI (#1).
- [x] Prueba de carga del formulario con límites activos (#9): 02/11/2026, en la CI y contra la Edge Function publicada.
- [ ] Confirmar con los dueños el plazo de borrado de teléfonos (#5).
- [ ] Revisar los términos de uso comercial de Cloudflare Workers ([ADR-005](decisiones.md#adr-005--hosting-en-cloudflare-workers-en-lugar-de-pages)) y del plan gratuito de Supabase.
