# Registro de decisiones (ADR)

**Proyecto:** [Siguiente](../README.md)
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
- **Consecuencias:** si alguna herramienta necesita la API de TypeScript, se usa un alias a `@typescript/typescript6` solo para ella. Hace falta Docker Desktop para correr Supabase en local.

## ADR-007 · Anotarse pasa por una Edge Function y el tiempo real solo manda señales

- **Fecha:** 26/10/2026 · **Estado:** aceptada (sujeta a las pruebas de riesgo del Sprint 0)
- **Contexto:** el diseño de [seguridad](seguridad.md) dejaba que el público llamara `unirse_a_fila` directo. Turnstile se verifica en una Edge Function, así que cualquiera podría saltárselo llamando a la API. Además, el público no puede leer la tabla `turnos`, así que no puede suscribirse a sus cambios en tiempo real.
- **Decisión:**
  1. `unirse_a_fila` solo la ejecuta la clave secreta. El formulario llama a la Edge Function `unirse-a-fila`, que verifica Turnstile y el límite por IP antes de llamarla.
  2. Un trigger publica en el canal público `fila:<barberia_id>` una señal vacía cada vez que la fila cambia. Cada pantalla vuelve a pedir sus datos con sus permisos.
  3. La pantalla de TV usa la vista pública y no lleva token, porque esa vista no tiene datos privados.
  4. Se agrega `suscribir_push(codigo, secreto, suscripcion)` para que el cliente guarde su suscripción de Web Push.
- **Alternativas:** *validar Turnstile dentro de Postgres:* exigiría llamadas HTTP síncronas desde la base. *Mandar los datos de la fila por el canal:* expondría nombres a cualquiera que escuche.
- **Consecuencias:** anotarse cuesta una invocación de Edge Function (500,000 al mes en el plan gratuito). Si el Broadcast público no llega a clientes sin sesión (prueba de riesgo 1), la página consulta cada 10–20 segundos, que ya existe como respaldo.
