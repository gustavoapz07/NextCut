# Registro de decisiones (ADR)

**Proyecto:** [NextCut](../README.md)
**Relacionado:** [Investigación](investigacion.md) · [Seguridad](seguridad.md) · [Plan de implementación](plan-implementacion.md) · [Bitácora](bitacora.md)

Cada decisión importante queda aquí con su contexto, las alternativas consideradas y sus consecuencias. Si una decisión cambia, no se borra: se marca como reemplazada y se agrega una nueva.

---

## ADR-001 · Problema a resolver: la fila física incierta

- **Fecha:** 25/10/2026 · **Estado:** aceptada (sujeta a la [validación de campo](validacion-campo.md))
- **Contexto:** se compararon cuatro problemas recurrentes de las barberías con evidencia pública ([investigación, sección 6](investigacion.md#6-matriz-de-decisión)).
- **Decisión:** resolver la fila incierta de las barberías de orden de llegada con una fila virtual híbrida.
- **Alternativas:**
  - *Inasistencias (P1):* bien documentado, pero ya resuelto por la competencia y con remedios de costo variable en Honduras. Pasa a la v0.2.
  - *Caja y comisiones (P3):* sin datos públicos. Se cubre como subproducto y se valida en las entrevistas.
  - *Captación (P4):* depende de datos que todavía no existen. Pasa a la v0.3.
- **Consecuencias:** el argumento de venta se basa en abandonos, que hoy nadie mide; por eso la validación de campo es obligatoria antes de programar.

## ADR-002 · Stack: Supabase + Cloudflare Pages

- **Fecha:** 25/10/2026 · **Estado:** aceptada · el hosting lo reemplaza [ADR-005](#adr-005--hosting-en-cloudflare-workers-en-lugar-de-pages)
- **Contexto:** se necesita tiempo real (fila en vivo), aislamiento estricto entre barberías (SaaS multiinquilino) y costo inicial de $0. El autor tiene conocimientos básicos de JavaScript, PHP y MySQL y desarrolla con asistentes de IA.
- **Decisión:** frontend React + Vite + TypeScript como PWA en Cloudflare Pages; backend en Supabase (Postgres con RLS, Auth, Realtime y Edge Functions).
- **Alternativas:**
  - *PHP + MySQL:* stack conocido, pero el tiempo real requiere un servidor de websockets o consultas constantes, el hosting gratuito con PHP es limitado y el aislamiento dependería de que cada consulta filtre bien.
  - *Vercel en lugar de Cloudflare Pages:* el plan Hobby prohíbe el uso comercial.
- **Consecuencias:** hay que aprender RLS y funciones de Postgres. Los límites del plan gratuito (200 conexiones de tiempo real simultáneas, pausa tras una semana sin actividad) obligan a usar tiempo real solo donde hace falta. Al crecer, Supabase Pro cuesta desde USD 25 al mes.

## ADR-003 · Notificaciones sin API de WhatsApp en el MVP

- **Fecha:** 25/10/2026 · **Estado:** aceptada
- **Contexto:** desde el 1/10/2026 Meta cobra las plantillas de utilidad dentro de la ventana de atención (USD 0.0113 por mensaje en "Resto de Latinoamérica") y los mensajes de servicio por encima de 1,000 al mes por número.
- **Decisión:** el MVP avisa con la página del turno en vivo, notificaciones push web y un botón `wa.me` que envía el mensaje desde el celular de la barbería.
- **Alternativas:** API de WhatsApp desde el inicio (costo variable desde el primer aviso) o SMS (también con costo).
- **Consecuencias:** en iPhone, el push web solo funciona si el cliente agrega la página a la pantalla de inicio (iOS 16.4 o superior), así que la página en vivo y el botón `wa.me` son el respaldo. La API de WhatsApp llega en la v0.3 como complemento pagado con tope de gasto.

## ADR-004 · Sin pagos en línea ni depósitos en el MVP

- **Fecha:** 25/10/2026 · **Estado:** aceptada
- **Contexto:** los depósitos son la herramienta más fuerte contra las inasistencias, pero exigen una pasarela de pago en Honduras, comisiones y manejo de reembolsos. Además, guardar datos de pago aumenta la superficie de ataque.
- **Decisión:** el barbero solo **registra** el monto y el método de pago (efectivo, transferencia o tarjeta). No se procesan pagos.
- **Consecuencias:** el reporte de ingresos depende de que el barbero registre bien; la bitácora de eventos y la vista del dueño lo controlan. Los depósitos se evaluarán con las citas en la v0.2.

## ADR-005 · Hosting en Cloudflare Workers en lugar de Pages

- **Fecha:** 26/10/2026 · **Estado:** aceptada · reemplaza la parte de hosting de [ADR-002](#adr-002--stack-supabase--cloudflare-pages)
- **Contexto:** la documentación de Cloudflare Pages dice ahora "Start new projects with Workers". Pages sigue con soporte y sin fecha de cierre, pero las funciones nuevas llegan a Workers, que ya sirve sitios estáticos ([guía oficial](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)).
- **Decisión:** la PWA se sirve como recursos estáticos de un Worker, con un `wrangler.jsonc` que apunta a `dist/` y `not_found_handling: "single-page-application"`. Se despliega con Wrangler desde GitHub Actions.
- **Alternativas:** *seguir en Pages:* funciona hoy, pero obligaría a migrar más adelante. *Vercel:* el plan Hobby sigue prohibiendo el uso comercial.
- **Consecuencias:** un archivo de configuración más. Las solicitudes a recursos estáticos siguen siendo gratuitas, y las vistas previas por PR salen de `wrangler versions upload`. Queda pendiente revisar los términos de uso comercial del plan gratuito.

## ADR-006 · Herramientas de desarrollo y pruebas

- **Fecha:** 26/10/2026 · **Estado:** aceptada
- **Contexto:** el autor desarrolla solo y con asistentes de IA, así que necesita pocas herramientas, rápidas y que atrapen errores antes de producción. TypeScript 7 (julio de 2026) trae un compilador nativo mucho más rápido, pero todavía no expone API para otras herramientas, y typescript-eslint depende de ella.
- **Decisión:** npm con un solo `package.json`; TypeScript 7 para revisar tipos; **Biome** para lint y formato; Vitest para pruebas unitarias; pgTAP (`supabase test db`) para RLS y funciones; Playwright con axe de punta a punta; Lefthook y gitleaks antes de cada commit; GitHub Actions para CI y despliegue. Detalle en el [plan de implementación](plan-implementacion.md#4-herramientas-de-desarrollo).
- **Alternativas:** *ESLint + Prettier:* dos herramientas y, con reglas de tipos, dependen de la API que TypeScript 7 no tiene. *Husky:* cambia la carpeta de hooks de git y chocaría con los hooks de graphify. *pnpm:* no aporta lo suficiente en un solo paquete.
- **Consecuencias:** si alguna herramienta necesita la API de TypeScript, se usa un alias a `@typescript/typescript6` solo para ella. Supabase en local exigía Docker Desktop; [ADR-008](#adr-008--desarrollo-contra-supabase-en-la-nube-sin-docker-local) lo reemplaza por un proyecto en la nube.

## ADR-007 · Anotarse pasa por una Edge Function y el tiempo real solo manda señales

- **Fecha:** 26/10/2026 · **Estado:** aceptada · prueba de riesgo 1 superada el 26/10/2026: el Broadcast público llega a un cliente anónimo y el canal privado lo rechaza
- **Contexto:** el diseño de [seguridad](seguridad.md) dejaba que el público llamara `unirse_a_fila` directo. Turnstile se verifica en una Edge Function, así que cualquiera podría saltárselo llamando a la API. Además, el público no puede leer la tabla `turnos`, así que no puede suscribirse a sus cambios en tiempo real.
- **Decisión:**
  1. `unirse_a_fila` solo la ejecuta la clave secreta. El formulario llama a la Edge Function `unirse-a-fila`, que verifica Turnstile y el límite por IP antes de llamarla.
  2. Un trigger publica en el canal público `fila:<barberia_id>` una señal vacía cada vez que la fila cambia. Cada pantalla vuelve a pedir sus datos con sus permisos.
  3. La pantalla de TV usa la vista pública y no lleva token, porque esa vista no tiene datos privados.
  4. Se agrega `suscribir_push(codigo, secreto, suscripcion)` para que el cliente guarde su suscripción de Web Push.
- **Alternativas:** *validar Turnstile dentro de Postgres:* exigiría llamadas HTTP síncronas desde la base. *Mandar los datos de la fila por el canal:* expondría nombres a cualquiera que escuche.
- **Consecuencias:** anotarse cuesta una invocación de Edge Function (500,000 al mes en el plan gratuito). La consulta cada 10–20 segundos queda como respaldo cuando la página no está visible o se cae la conexión.

## ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local

- **Fecha:** 26/10/2026 · **Estado:** aceptada · cambia el entorno de desarrollo de [ADR-006](#adr-006--herramientas-de-desarrollo-y-pruebas) y del [plan](plan-implementacion.md#11-integración-y-despliegue)
- **Contexto:** Supabase en local necesita Docker Desktop. En la laptop de desarrollo (Windows 11 Home) eso exige instalar WSL con permisos de administrador, aceptar el acuerdo de Docker y reservar varios GB de imágenes y memoria. La cuenta gratuita de Supabase permite 2 proyectos activos, y ya los ocupaban otros proyectos del autor.
- **Decisión:** se desarrolla contra el proyecto `siguiente-pruebas` (us-east-1, plan gratuito). Para liberar el espacio se pausó el proyecto `melarlab`, que conserva sus datos y se puede reactivar.
  - Las migraciones siguen siendo archivos en `supabase/migrations/` y se aplican con `supabase db push --linked`.
  - Los tipos se generan desde el proyecto (`supabase gen types --project-id`).
  - Las Edge Functions se despliegan con `supabase functions deploy --use-api`, que empaqueta en los servidores de Supabase.
  - Las pruebas pgTAP corren en CI, donde los runners de GitHub sí tienen Docker (`supabase start` + `supabase test db`).
- **Alternativas:** *Docker local:* más pesado y con más pasos en esta máquina. *Plan Pro (USD 25 al mes):* contradice el costo cero del MVP. *Otra cuenta de Supabase para saltar el límite:* probablemente va contra los términos de uso.
- **Consecuencias:**
  - Hace falta internet para desarrollar.
  - `supabase db reset --linked` borra el proyecto de pruebas; se acepta porque es solo de pruebas y `seed.sql` lo reconstruye.
  - El proyecto gratuito se pausa tras una semana sin uso y hay que reactivarlo desde el panel.
  - Las Edge Functions se prueban desplegadas y la lógica pura (como `eta.ts`) con Vitest.
  - Las pruebas de la base dependen de CI, así que el repositorio tiene que estar en GitHub antes del Sprint 1.
  - Antes del piloto hará falta otro espacio gratuito para producción: pausar otro proyecto o pagar Pro.

## ADR-009 · Nombre del producto: NextCut

- **Fecha:** 26/10/2026 · **Estado:** aceptada
- **Contexto:** "Siguiente" era un nombre provisional, tomado del "¡siguiente!" que se oye en toda barbería. El autor creó el repositorio público `gustavoapz07/NextCut` y eligió ese nombre para el software.
- **Decisión:** el producto se llama **NextCut** ("el siguiente corte"). Cambian el README, la documentación, la interfaz, `package.json`, el nombre del Worker de Cloudflare (`nextcut`) y el `project_id` local de Supabase.
  - El proyecto de Supabase en la nube conserva el nombre `siguiente-pruebas`: es solo una etiqueta y su referencia no cambia.
  - Las entradas pasadas de la [bitácora](bitacora.md) no se reescriben, porque registran lo que pasó en su momento.
- **Alternativas:** mantener el nombre provisional.
- **Consecuencias:**
  - El nombre está en inglés para un mercado hispanohablante; conviene ver cómo lo reciben los dueños en las entrevistas de [validación](validacion-campo.md).
  - Una búsqueda del 26/10/2026 encontró posibles usos de "NextCut" en el mismo sector: una plataforma de citas para barberías en Düsseldorf (dato de un directorio de empresas, sin verificar) y una app de reservas para salones en el portafolio de una agencia. Antes de invertir en marca (dominio, registro de marca en Honduras, material impreso), hay que revisar disponibilidad.

## ADR-010 · Prototipo de diseño antes de la validación e identidad visual

- **Fecha:** 27/10/2026 · **Estado:** aceptada · cambia el orden del [plan de implementación](plan-implementacion.md#9-sprints)
- **Contexto:** el plan pedía validar en campo antes de construir. El autor decidió dejar por ahora la validación y el resto del Sprint 0, y concentrarse en diseñar y desarrollar, empezando por definir cómo se ve el producto.
- **Decisión:**
  1. Se construye un **prototipo navegable sin backend** de todas las pantallas de la v0.1: portada, fila pública (`/b/:slug`), anotarse (`/b/:slug/unirse`), turno en vivo (`/t/:codigo`), TV (`/b/:slug/tv`), entrar (`/entrar`), panel del barbero (`/panel`) y dueño (`/dueno`, `/dueno/configuracion`, `/dueno/qr`). Los datos son de ejemplo (`app/src/prototipo/`) y una simulación mueve la fila sola para mostrar el tiempo real.
  2. **Identidad:** los tres colores del poste de barbería en tonos profundos (rojo `#b8312a`, azul `#2c4d96`) sobre papel hueso `#f3eee4` y tinta azul noche `#0d1430`, con modo oscuro. Las franjas del poste en movimiento son el motivo principal: logo, barras de progreso, bordes y transiciones.
  3. **Tipografía:** Big Shoulders Display (condensada, de rótulo) para titulares, con contraste de pesos (black y light) como acento, y Bricolage Grotesque para el texto. Las dos van empaquetadas en la app con Fontsource, sin pedir nada a Google.
  4. **Movimiento:** `motion` para contadores que ruedan, listas que se reordenan, pasos que se deslizan y celebraciones. Todo respeta "reducir movimiento" del sistema. Íconos con `lucide-react` y QR con `qrcode.react`.
- **Alternativas:** *Instrument Serif como cursiva de acento:* se probó y se descartó; junto con el rojo y el azul eléctricos de la primera versión, el conjunto se veía chillón. *Diseñar en Figma primero:* más lento para probar animaciones y tiempo real.
- **Consecuencias:**
  - Las pantallas quedan listas para conectarlas a Supabase en los sprints 1 a 4, pero el riesgo de construir algo que las barberías no usen sigue abierto mientras no haya validación.
  - `motion` suma unos 50 kB comprimidos al JavaScript del cliente; cada pantalla se carga por separado para que el cliente no descargue el panel ni el reporte.

## ADR-011 · Detalles de la base de datos del Sprint 1

- **Fecha:** 27/10/2026 · **Estado:** aceptada · ajusta la [sección 8 del plan](plan-implementacion.md#8-funciones-de-la-base-y-quién-las-ejecuta)
- **Contexto:** al escribir la migración aparecieron decisiones que el plan no fijaba, y el Security Advisor de Supabase marca como riesgo algunas que son parte del diseño.
- **Decisión:**
  1. **`fila_publica(slug)` es una función, no una vista.** Una vista que salta RLS es un error para el Security Advisor, y la función exige el slug: nadie puede listar las filas de todas las barberías con una sola consulta. Devuelve en una llamada todo lo que necesitan la página pública y la TV (barbería, barberos, servicios y fila), sin teléfonos y con "Óscar L." en vez del nombre completo.
  2. **El cliente genera el secreto para cancelar** y la base solo guarda su hash SHA-256. Así un doble envío del formulario devuelve el mismo turno (idempotencia) sin que el cliente pierda su secreto.
  3. **La Edge Function manda el hash de la IP, nunca la IP.** El límite de 5 turnos cada 10 minutos cuenta sobre ese hash.
  4. **`barberos.user_id` liga cada silla con su cuenta.** Por eso `pausar_barbero` recibe el id del barbero: lo puede usar el propio barbero o el dueño.
  5. **Se guarda `estimado_min` al anotarse**, para que el reporte del día mida el error del estimado.
  6. **Reglas que se cumplen aunque alguien escriba directo en la tabla:** los estados solo avanzan en orden, un turno cerrado no se edita (solo se le puede borrar el teléfono), un barbero tiene una sola persona en mano y un teléfono tiene un solo turno activo por barbería.
  7. **La señal de tiempo real se omite si `realtime.send` todavía no existe**, como pasa en Supabase local mientras carga los datos de prueba. En la nube siempre existe.
  8. **Avisos del Security Advisor aceptados:** las funciones `security definer` que ejecutan `anon` y `authenticated` son la API pública a propósito ([ADR-007](#adr-007--anotarse-pasa-por-una-edge-function-y-el-tiempo-real-solo-manda-señales)) y cada una valida por dentro; `suscripciones_push` no tiene políticas porque solo la lee la clave secreta.
  9. **Las migraciones se aplicaron con el MCP de Supabase**, porque la CLI no quedó instalada en la laptop (npm 11 bloqueó su script de instalación). Cada archivo lleva la misma versión que registró la base, para que la CLI no vea diferencias después. En CI se usa la acción oficial `supabase/setup-cli`.
- **Alternativas:** *vista `fila_publica` con `security_invoker`:* el público tendría que leer `turnos` directo. *Secreto generado por la base:* rompe la idempotencia o obliga a guardar el secreto en claro.
- **Consecuencias:** el frontend llama a funciones RPC en vez de leer tablas (salvo el personal, que lee su barbería con RLS). Los tipos generados (`app/src/lib/database.types.ts`) ya incluyen todas las funciones.
