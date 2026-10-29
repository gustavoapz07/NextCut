# Bitácora de cambios

**Proyecto:** [NextCut](../README.md)

Cada cambio del proyecto queda aquí, enlazado al documento que afecta. El grafo de `graphify-out/` se regenera después de cada entrada.

---

## 2026-10-25 · Investigación inicial y elección del problema

- **Qué:** se investigaron cuatro problemas recurrentes de las barberías y se eligió la fila física incierta.
- **Archivos creados:**
  - [README](../README.md): producto Siguiente, alcance del MVP, arquitectura, métricas y hoja de ruta.
  - [Investigación](investigacion.md): evidencia calificada por calidad, competencia y matriz de decisión con sensibilidad.
  - [Validación de campo](validacion-campo.md): guion de entrevistas, hoja de conteo y criterios para seguir o ajustar.
  - [Seguridad](seguridad.md): auditoría de los 10 fallos y amenazas propias de una fila virtual.
  - [Decisiones](decisiones.md): ADR-001 a ADR-004.
- **Decisiones:** ADR-001 (problema), ADR-002 (stack), ADR-003 (notificaciones), ADR-004 (sin pagos en línea).
- **Auditoría:** se volvieron a comprobar contra su fuente las cifras de la investigación; la matriz y los costos de WhatsApp se calcularon con un script; se validaron los enlaces internos, las tablas y los 3 diagramas Mermaid (todos renderizan).
- **Grafo:** Graphify 0.9.95 generó 79 nodos, 156 relaciones y 9 comunidades. Bóveda de Obsidian en `graphify-out/obsidian/` y vista interactiva en `graphify-out/graph.html`.
- **Archivos de soporte:** `.gitignore` con `.env*` excluido desde el inicio (fallo de seguridad 1).
- **Siguiente paso:** salir al campo (8 a 10 entrevistas y 3 conteos de sábado) antes de escribir código.

## 2026-10-26 · Plan de implementación y graphify automático

- **Qué:** se escribió el plan principal de la v0.1 con el stack, las herramientas, la arquitectura detallada y 4 sprints más el piloto. Se instaló graphify en el proyecto para que el grafo se actualice solo.
- **Archivos creados:**
  - [Plan de implementación](plan-implementacion.md): versiones del stack al 26/10/2026, herramientas de desarrollo y de IA, arquitectura, funciones de la base con sus permisos, sprints con criterio de salida, pruebas, despliegue, riesgos, recortes y costos.
  - `CLAUDE.md`, `.claude/` (skill de graphify, hooks y `settings.json`), `.graphifyignore` y `.gitattributes`.
- **Archivos modificados:** [Decisiones](decisiones.md) (ADR-005 a ADR-007; el hosting de ADR-002 queda reemplazado), [Seguridad](seguridad.md) (fallos 2 y 7 según ADR-007), [README](../README.md) (estado, hosting, estructura y desarrollo local) y `.gitignore`.
- **Decisiones:** ADR-005 (Cloudflare Workers en lugar de Pages), ADR-006 (herramientas: TypeScript 7, Biome, Vitest, pgTAP, Playwright, Lefthook, gitleaks y GitHub Actions) y ADR-007 (anotarse pasa por una Edge Function y el tiempo real solo manda señales).
- **Fuentes nuevas:** documentación de Cloudflare ("Start new projects with Workers"), de Supabase (claves nuevas, que reemplazan a `anon` y `service_role` a fines de 2026; Broadcast desde la base; Edge Functions programadas; precios) y versiones de npm del 26/10/2026.
- **Graphify:** versión 0.9.95 instalada a nivel de proyecto (`graphify install --project`). Se inicializó el repositorio de git en la rama `main` para instalar los hooks `post-commit`, `post-checkout`, `post-merge` y `post-rewrite`, que reconstruyen el grafo del código después de cada commit. Para los documentos, `.claude/hooks/graphify_sync.py` anota los que cambian y, al final de cada turno de Claude Code, pide reextraerlos con `/graphify . --update` (se apaga con `GRAPHIFY_AUTO_SYNC=0`).
- **Siguiente paso:** la validación de campo sigue siendo la condición para construir. En paralelo se puede hacer el Sprint 0 (entorno y 3 pruebas de riesgo técnico).

## 2026-10-26 · Sprint 0: base del proyecto

- **Qué:** se creó la base técnica del [plan de implementación](plan-implementacion.md#sprint-0--entorno-y-pruebas-de-riesgo-semanas-12-en-paralelo-a-la-validación): app, herramientas, configuración de Supabase y Cloudflare, y CI.
- **App:** React 19.3 + Vite 8.3 + TypeScript 7.0 + Tailwind 4.3 + React Router 8.5 en `app/`, con página de inicio, página de "no encontrado" y mensaje de error genérico (fallo 8). Las variables y el build quedan en la raíz.
- **Herramientas:** Biome 2.6 (con `noDangerouslySetInnerHtml` como error, fallo 3), Vitest 5 con Testing Library, Lefthook 2 (Biome y gitleaks antes del commit; tipos y pruebas antes del push), conviviendo con los hooks de graphify.
- **Supabase:** `supabase/config.toml` con `auto_expose_new_tables = false` (ninguna tabla queda en la API sin permiso explícito, fallo 2), Storage apagado y Auth apuntando a Vite.
- **Cloudflare:** `wrangler.jsonc` con recursos estáticos, respaldo de SPA y telemetría de Wrangler apagada.
- **CI:** `.github/workflows/ci.yml` con Biome, tipos, Vitest, build, búsqueda de claves secretas en el build (fallo 1) y gitleaks.
- **npm 11:** los scripts de instalación de lefthook, esbuild y workerd quedaron aprobados en `allowScripts`; al actualizar esos paquetes hay que aprobarlos de nuevo.
- **Verificado:** `npm run check` pasa (2 pruebas); la página se revisó en 375 px en modo claro y oscuro sin errores de consola; el Worker local devuelve la app con código 200 en rutas profundas (`/b/demo`) y React Router muestra "no encontrado".
- **Pendiente del Sprint 0:** instalar Docker Desktop y gitleaks, crear el repositorio en GitHub, los dos proyectos de Supabase y el Worker en Cloudflare, y las 3 pruebas de riesgo (Broadcast público, Web Push y Turnstile con IP).

## 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1

- **Qué:** se dejó de lado Docker local y se creó el proyecto de Supabase de pruebas en la nube ([ADR-008](decisiones.md#adr-008--desarrollo-contra-supabase-en-la-nube-sin-docker-local)). Con él se hizo la primera prueba de riesgo del Sprint 0.
- **Por qué:** Docker Desktop en Windows 11 Home exigía instalar WSL con permisos de administrador y aceptar su acuerdo, y su motor no arrancaba. Supabase en la nube cubre lo mismo sin instalar nada.
- **Proyecto:** `siguiente-pruebas` (us-east-1, plan gratuito, USD 0). La cuenta ya tenía sus 2 proyectos gratuitos ocupados, así que se pausó `melarlab`, que conserva sus datos y se puede reactivar. El Security Advisor no reporta nada.
- **App:** cliente de Supabase (`app/src/lib/supabase.ts`) con la clave publicable, tipos generados desde el proyecto y variables tipadas. `.env.local` queda fuera del repositorio.
- **Prueba de riesgo 1 · superada:** una señal enviada desde Postgres con `realtime.send(..., private => false)` llegó a un cliente anónimo que solo tenía la clave publicable, y ese mismo cliente fue rechazado al intentar entrar a un canal privado ("Unauthorized"). Confirma [ADR-007](decisiones.md#adr-007--anotarse-pasa-por-una-edge-function-y-el-tiempo-real-solo-manda-señales). Script reproducible: `scripts/spikes/broadcast-publico.mjs`.
- **Hallazgo:** el proyecto nuevo trae activa la clave heredada `anon`. Hay que desactivarla en el panel (Settings > API Keys), junto con `service_role`.
- **Pendiente del Sprint 0:** instalar gitleaks, crear el repositorio en GitHub (CI y pgTAP dependen de eso), el proyecto de producción, el Worker en Cloudflare y las pruebas de riesgo 2 (Web Push) y 3 (Turnstile con IP).

## 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio

- **Qué:** el software se llama **NextCut** ([ADR-009](decisiones.md#adr-009--nombre-del-producto-nextcut)) y el proyecto vive ahora en la carpeta `NextCut/`, conectado al repositorio público [gustavoapz07/NextCut](https://github.com/gustavoapz07/NextCut).
- **Renombre:** README, documentación, interfaz (título, favicon y encabezado), prueba del inicio, `package.json`, Worker de Cloudflare (`nextcut`) y `project_id` local de Supabase. Se conservan el nombre del proyecto en la nube (`siguiente-pruebas`) y las entradas pasadas de esta bitácora.
- **Repositorio:** antes de publicar se revisaron los 287 archivos (sin secretos, rutas locales ni la clave publicable) y se reescribieron los commits con el correo privado de GitHub (`318105393+gustavoapz07@users.noreply.github.com`), para que el Gmail no quede en el historial público. GitHub Desktop había creado un repositorio nuevo con un commit inicial propio (solo `.gitattributes`); en la carpeta local se reemplazó por el historial del proyecto y el `.git` de GitHub Desktop quedó respaldado.
- **Supabase:** las claves heredadas (`anon` y `service_role`) del proyecto de pruebas quedaron desactivadas.
- **Publicación:** el historial se subió con `git push --force-with-lease`, que reemplazó el commit inicial de GitHub Desktop.
- **CI:** en el primer push, el trabajo de gitleaks falló con código 1. Era un error de ejecución, no una fuga: gitleaks usa el código 2 cuando encuentra secretos. En un push, la acción revisa desde el padre del primer commit nuevo, y en una historia nueva ese primer commit es la raíz, que no tiene padre. Se agregó una ejecución manual y otra semanal (lunes 3:00 a. m. en Honduras) que revisan todo el historial, y el push siguiente pasó completo: lint, tipos, pruebas, build, claves en el build y gitleaks.
- **Grafo:** los documentos que solo cambiaron el nombre en el encabezado se actualizaron sin reextracción con IA; README, plan, decisiones y esta bitácora sí se reextrajeron.

## 2026-10-27 · Prototipo de diseño de todas las pantallas

- **Qué:** se construyó el prototipo navegable de la v0.1 sin backend, para definir el diseño antes de conectar Supabase ([ADR-010](decisiones.md#adr-010--prototipo-de-diseño-antes-de-la-validación-e-identidad-visual)). La validación de campo y el resto del Sprint 0 quedan en pausa por decisión del autor.
- **Pantallas:** portada con índice del prototipo, fila pública, anotarse en 4 pasos, turno en vivo (en fila, ya casi, te toca, en la silla, listo y cancelado, con un simulador para recorrerlos), TV con anuncio de turno, entrar, panel del barbero con sus cuatro botones y cierre de turno, resumen del día, configuración y cartel con QR imprimible. Una pestaña en el borde derecho salta entre pantallas.
- **Identidad:** franjas del poste en movimiento, Big Shoulders Display con contraste de pesos para titulares y Bricolage Grotesque para el texto. Paleta de rojo y azul profundos sobre hueso y azul noche, con modo oscuro.
- **Ajuste tras la primera revisión:** el autor sintió el conjunto algo chillón y no le gustó Instrument Serif. Se quitó la serif (los acentos pasan a la display en peso fino), se oscurecieron el rojo (`#d62c26` → `#b8312a`) y el azul (`#2546e8` → `#2c4d96`) y se quitaron el destello continuo del botón principal, su resplandor rojo y el pulso de los botones del panel.
- **Dependencias nuevas:** `motion`, `lucide-react`, `qrcode.react` y las tipografías de Fontsource. Las 3 alertas de `npm audit` ya existían y vienen de `wrangler`.
- **Pruebas:** 11 pruebas de rutas (cada pantalla abre y una barbería inexistente da "no encontrado"); `npm run check` pasa. Revisado en el navegador a 375 px y la TV en horizontal, sin errores de consola.
- **Siguiente paso:** cerrar el diseño con el autor y empezar a conectar las pantallas a Supabase (Sprint 1: base de datos y seguridad).

## 2026-10-27 · Limpieza del prototipo: sin etiquetas, sin avisos y sin letras cortadas

- **Qué:** a pedido del autor se quitaron las etiquetas tipo píldora ("En vivo", "Prototipo v0.1", "Más rápido", "Turnstile", "Pendiente/Activo"), los separadores ✦ de las cintas y los textos que avisaban que es un prototipo (párrafo y pie de la portada, atajos del login, nota del dominio en el QR, "Se abriría WhatsApp" en el panel y los `?origen=` que se mostraban al dueño).
- **Etiquetas en mayúsculas espaciadas:** pasan a texto normal ("Te toca en", "Código", "Monto cobrado", "Silla 1"…), que se lee mejor y no se ve de plantilla.
- **Navegación entre pantallas:** desaparecen la pestaña lateral (tapaba texto) y la barra del simulador del turno. El menú con todas las pantallas se abre tocando el logo de NextCut, y cada estado del turno tiene su acceso directo (`/t/K7P2Q?estado=fila|casi|llamado|silla|listo|cancelado`); sin el parámetro el turno sigue avanzando solo.
- **Letras cortadas:** un script revisó cada pantalla en iframes de 320, 360 y 375 px, la TV en 1280×720, 1920×1080 y 1024×768, y el escritorio en 1280×800, buscando texto recortado por un contenedor, truncado con "…" o fuera de la pantalla. Se corrigieron "SIGUIENTE" (login), "CANCELADO", "¡QUEDASTE FINO!" y "DISFRUTA" (turno), que no cabían a 360 px; los campos de hora de Configuración, que ensanchaban la página; las pestañas de Configuración, que se cortaban en el borde; el confeti y el halo de "TÚ", que generaban scroll lateral; los nombres y apodos truncados; y el interlineado de todos los titulares, que sube de 0.78–0.85 a 0.9. Las cintas en movimiento se desvanecen en los bordes. Resultado final: ningún hallazgo.
- **Pruebas:** 15 pruebas de rutas, incluidos los estados del turno; `npm run check` pasa.

## 2026-10-27 · Sprint 1: base de datos y seguridad

- **Qué:** la base de la v0.1 con sus reglas de acceso, funciones y pruebas ([plan](plan-implementacion.md#sprint-1--base-de-datos-y-seguridad-semana-3), [ADR-011](decisiones.md#adr-011--detalles-de-la-base-de-datos-del-sprint-1)).
- **Migraciones** (`supabase/migrations/`, aplicadas en `siguiente-pruebas`):
  - `20261027140203_base_de_datos`: tablas del modelo de datos con sus `CHECK`, RLS con denegación por defecto en todas, funciones del público, del barbero, del dueño y de las tareas programadas, bitácora de solo inserción con triggers, señal de tiempo real y límites (5 turnos por IP cada 10 minutos, un turno activo por teléfono, tamaño máximo de la fila y fila remota pausada).
  - `20261027142713_senal_sin_realtime`: la señal se omite si Realtime todavía no está listo (local).
- **Datos de prueba** (`supabase/seed.sql`, solo local y CI): La Navaja con Carlos, Jorge y Kevin, y El Faro con un barbero, para probar el aislamiento.
- **Pruebas:** 101 pruebas pgTAP en `supabase/tests/database/`, todas en verde contra el proyecto de pruebas dentro de una transacción que se deshizo (no quedó ningún dato). Cubren permisos, aislamiento entre barberías, validación de datos, privacidad de las pantallas públicas, idempotencia, límites, el flujo del barbero, la bitácora y las tareas programadas. El script `scripts/concurrencia.mjs` prueba "llamar siguiente" con varios barberos a la vez y el doble envío; necesita dos conexiones reales, así que corre en el CI.
- **CI:** nuevo trabajo "Base de datos (pgTAP y concurrencia)" con Supabase local en el runner de GitHub. Pasó en la [corrida #5](https://github.com/gustavoapz07/NextCut/actions/runs/40522147570) (commit `62c0ff1`, 1 min 40 s): Supabase levantó en 59 s, pgTAP tardó 16 s y la concurrencia pasó sus tres casos (un cliente en mano no se repite, seis barberos a la vez reciben seis clientes distintos y el doble envío crea un solo turno). El registro completo solo se ve con sesión de administrador en GitHub; el resultado se confirmó con el estado de cada paso en la API pública.
- **Security Advisor:** sin errores. Los avisos que quedan son parte del diseño (ADR-011, punto 8). El de rendimiento solo marca índices sin uso, porque la base está vacía.
- **Seguridad:** los fallos 2, 7 y 8 pasan a 🟩; 3, 5, 9 y 10 a 🟨 ([seguridad](seguridad.md)).
- **Tipos:** `app/src/lib/database.types.ts` regenerado desde la base.
- **Dependencia nueva:** `pg` (desarrollo), para el script de concurrencia.
- **Avisos del CI:** la acción `supabase/setup-cli@v1` todavía usa Node 20, que GitHub está retirando, y `ubuntu-latest` pasa a Ubuntu 26. Por ahora no hay que hacer nada.
- **Siguiente paso:** el Sprint 2 (conectar la fila pública, anotarse con Turnstile y el turno en vivo).

## 2026-10-28 · Sprint 2: estimado y fila pública conectada a la base

- **Qué:** las dos primeras piezas del [Sprint 2](plan-implementacion.md#sprint-2--cliente-fila-pública-y-turno-en-vivo-semana-4): el módulo del estimado y la página `/b/:slug` con datos reales ([ADR-012](decisiones.md#adr-012--cómo-se-calcula-el-estimado-de-espera)).
- **Estimado** (`supabase/functions/_shared/eta.ts`): simula la fila como `llamar_siguiente` (cada barbero que queda libre toma el turno más antiguo que sea suyo o de "el primero libre"), con promedio de los últimos 20 servicios desde 5, pausas, barberos inactivos y rango redondeado a 5 minutos. TypeScript sin dependencias, listo para la Edge Function `avisos`. 29 pruebas.
- **Datos de la fila** (`app/src/lib/fila.ts`): esquema zod de lo que devuelve `fila_publica`, conversión al estimado y resumen por barbero.
- **En vivo** (`app/src/lib/enVivo.ts`): escucha el canal público `fila:<id>` solo con la página visible, junta las señales seguidas en una recarga, recarga al reconectar y cada 60 s como respaldo, y descarta respuestas viejas que lleguen tarde. Con la página oculta se desconecta (y puede consultar cada cierto tiempo, para la página del turno).
- **Página pública:** se separó en una vista que solo dibuja y dos fuentes: el prototipo (sigue en `/b/la-navaja`, con datos simulados) y la base (cualquier otro slug). Con datos reales muestra cargando, "no encontrado", error con botón de reintentar, fila vacía, barberos en pausa con "—" y la fila en línea pausada o llena (sin botón para anotarse).
- **Ganchos:** `useIntervalo`, `useTitulo` y `useReloj` pasan de `prototipo/simulacion.ts` a `lib/ganchos.ts`, para que el código real no dependa del prototipo.
- **Dependencia nueva:** `zod` 4.6, como pedía el plan. El paquete de la página pública pesa 84 kB comprimido (supabase-js y zod incluidos).
- **Pruebas:** 53 en total. Las de rutas simulan Supabase (en el CI no hay `.env.local`) y cubren la fila real, la fila pausada y el error de conexión. `npm run check` pasa.
- **Verificado en el navegador:** el prototipo se ve igual a 375 px y sin errores de consola. Una barbería que no existe consulta `fila_publica` en el proyecto de pruebas (respuesta 200) y muestra "no encontrado". La vista con datos reales no se revisó en pantalla porque el proyecto de pruebas no tiene barberías; la cubren las pruebas.
- **Pendiente del Sprint 2:** duraciones recientes en `fila_publica`, formulario con zod y Turnstile, Edge Function `unirse-a-fila`, página `/t/:codigo` con datos reales, `?origen=qr` y la prueba de Playwright.

## 2026-10-28 · Sprint 2: anotarse con Turnstile y la Edge Function unirse-a-fila

- **Qué:** el formulario de `/b/:slug/unirse` crea turnos reales a través de la Edge Function `unirse-a-fila` ([ADR-013](decisiones.md#adr-013--detalles-de-anotarse-en-la-fila)).
- **Edge Function** (`supabase/functions/unirse-a-fila/`): valida con zod, verifica Turnstile con la IP y una clave de idempotencia, lee la fila para guardar el estimado del turno, manda el hash de la IP (nunca la IP) y llama a `unirse_a_fila` con la clave secreta. Responde solo `{ codigo, numero }` o un código de error corto. La lógica está en `_shared/unirse.ts` para probarla con Vitest.
- **Desplegada** en `siguiente-pruebas` (versión 1, `verify_jwt = false`). Probado con `curl`: CORS responde a `localhost:5173`, acepta la clave publicable y, como todavía no tiene `TURNSTILE_SECRET`, rechaza todo sin dar detalles.
- **Formulario:** misma interfaz para el prototipo y la base. Con datos reales muestra los barberos y servicios de la barbería, el estimado de cada uno, Turnstile en el último paso, errores entendibles (fila llena, teléfono con turno, demasiados intentos…) y el número que tocó. Guarda el secreto para cancelar en el teléfono.
- **QR de la puerta:** la página pública pasa `?origen=qr` al formulario y el turno queda como `local`; con el QR se puede anotar aunque la fila en línea esté pausada.
- **Compartido:** el esquema de `fila_publica` pasó a `_shared/filaPublica.ts` para que lo usen la página y la función. `SinConexion` y los colores de los barberos quedaron como piezas compartidas.
- **Pruebas:** 90 en total. 33 de la Edge Function (incluidos los casos del fallo 3: nombres de 500 caracteres, `<script>`, emojis, teléfonos de otros países, ids inventados y errores de la base sin filtrar detalles) y 4 de rutas nuevas, entre ellas un recorrido completo del formulario con Turnstile y la función simulados. `npm run check` pasa.
- **Verificado en el navegador:** el formulario del prototipo llega al turno #33 como antes, y una barbería real que no existe consulta `fila_publica` y muestra "no encontrado".
- **Hallazgo:** las herramientas de edición convertían en caracteres invisibles reales los escapes Unicode de una expresión regular (los que invierten el texto, U+202A a U+202E). Se reescribieron como texto ASCII y se revisó que ningún archivo de `app/` ni `supabase/` tenga caracteres invisibles.
- **Pendiente:** cargar `TURNSTILE_SECRET` en `siguiente-pruebas` para cerrar la prueba de riesgo 3 (y ver qué encabezado trae la IP real); la página `/t/:codigo` con datos reales (hoy un código real cae en "no encontrado"); duraciones recientes en `fila_publica`; y la prueba de Playwright.

## 2026-10-28 · Prueba de riesgo 3 superada: Turnstile y la IP real

- **Qué:** con `TURNSTILE_SECRET` cargado en `siguiente-pruebas` (la clave de prueba de Cloudflare), se probó la Edge Function desplegada sin crear datos: con un token de prueba y una barbería inventada responde 404 `no_existe`, o sea que Turnstile ya la dejó pasar ([ADR-013](decisiones.md#adr-013--detalles-de-anotarse-en-la-fila)).
- **IP real:** se hicieron llamadas marcadas en la URL, una normal y otra con `X-Forwarded-For` y `X-Real-IP` falsos (`203.0.113.7`). En los registros de la función, `cf-connecting-ip` y `x-real-ip` traen la IP real en las dos, nunca la falsa. Una llamada que intentó mandar `CF-Connecting-IP` la bloqueó Cloudflare antes de llegar (error 1000). `x-forwarded-for` no aparece en los registros, así que no se puede confirmar que sea confiable.
- **Cambio:** `obtenerIp` ya no usa `x-forwarded-for`; toma `cf-connecting-ip` y, si falta, `x-real-ip`. Una prueba nueva confirma que un `x-forwarded-for` solo no cuenta como IP. 63 pruebas de las Edge Functions en verde.
- **Despliegue:** versión 3 de `unirse-a-fila`. La versión 2 falló porque Supabase reusó la ruta absoluta del mapa de imports de la versión 1; se arregla pasando `import_map_path: deno.json` en cada despliegue.
- **Sprint 0:** las pruebas de riesgo 1 y 3 están superadas; falta la 2 (Web Push).
- **Pendiente para producción:** crear el widget de Turnstile en Cloudflare y cargar sus claves reales.

## 2026-10-28 · Sprint 2: la página del turno con datos reales

- **Qué:** `/t/:codigo` muestra el turno real y se mantiene al día ([plan](plan-implementacion.md#sprint-2--cliente-fila-pública-y-turno-en-vivo-semana-4)). Con esto quedan hechas las seis tareas del Sprint 2; falta su criterio de salida (la prueba de Playwright).
- **Datos** (`app/src/lib/turno.ts` y `useTurno` en `enVivo.ts`): esquema zod de `ver_turno`. Mientras el turno está activo también se pide `fila_publica`, que da el estimado (con `eta.ts`) y el canal de la barbería. Con la página visible escucha la señal; oculta, consulta cada 20 segundos. Un turno cerrado ya no pide la fila ni escucha nada.
- **Pantallas:** en fila (con las iniciales de quienes van antes y "+N" si son más de tres), ya casi, te toca (con la cuenta regresiva desde la hora real en que lo llamaron y la tolerancia de la barbería), en la silla, listo (cuánto esperó y cuánto se estimó), cancelado, "se pasó tu turno" (`no_llego`) y "fila cerrada" (`abandono`).
- **Te toca:** suena dos tonos y vibra una vez por llamada. Si la persona no ha tocado la página (abrió el enlace de cero), el navegador lo bloquea, así que ni se intenta.
- **Cancelar:** mantener presionado llama a `cancelar_turno` con el secreto que guardó el formulario en el teléfono. Sin ese secreto (otro teléfono) la página explica dónde cancelar. El botón ya no se reinicia cuando la pantalla se redibuja cada segundo.
- **Prototipo:** `/t/K7P2Q` sigue simulado, con sus estados por `?estado=`. El botón de avisos por Web Push y "Ya voy en camino" quedan solo ahí hasta el Sprint 3.
- **Pruebas:** 97 en total; 6 nuevas de la página real (en fila, cancelar con secreto, sin secreto, te toca, se pasó el turno y código inexistente). `npm run check` pasa.
- **Verificado en el navegador:** el prototipo se ve igual en "en fila" y "te toca", y un código real consulta `ver_turno` en el proyecto de pruebas y muestra "no encontrado".
- **Siguiente:** la prueba de Playwright que cierra el Sprint 2 (necesita una barbería de prueba en `siguiente-pruebas` o Supabase local en el CI) y las duraciones recientes en `fila_publica`.

## 2026-10-28 · Prueba de punta a punta: sale el Sprint 2

- **Qué:** la prueba de Playwright que pide la [salida del Sprint 2](plan-implementacion.md#sprint-2--cliente-fila-pública-y-turno-en-vivo-semana-4) pasa contra `siguiente-pruebas`.
- **Barberías de prueba:** `scripts/e2e/barberias-prueba.sql` crea "Barbería Prueba" (`/b/barberia-prueba`, con Carlos, Jorge, corte y barba) y "Prueba Dos" (`prueba-dos`, solo para el caso de otra barbería). Se cargó en `siguiente-pruebas` con el MCP de Supabase; se puede volver a correr sin duplicar nada. Con ella ya se puede ver la fila real en el navegador.
- **Prueba** (`tests/e2e/fila.spec.ts`, `npm run test:e2e`), en un Pixel 7 simulado:
  1. Un turno de "<script>alert(1)</script>" se anota por la Edge Function y la fila pública lo muestra como texto, sin abrir ningún diálogo.
  2. Un cliente con un emoji en el nombre se anota por el formulario, pasa Turnstile (clave de prueba) y llega a su turno.
  3. Se cancela el turno de adelante y la página baja la posición sola, por la señal de tiempo real.
  4. El cliente cancela el suyo manteniendo presionado.
  5. La Edge Function rechaza un nombre de 500 caracteres, un teléfono de otro país y un servicio o un barbero de otra barbería (este último lo rechaza la base).
- **Resultado:** 2 de 2 en 20 segundos, a la primera. En la base, los dos turnos quedaron cancelados, con 2 eventos cada uno, la IP solo como hash, los nombres tal cual y el estimado correcto (0 y 15 minutos).
- **Herramientas:** `@playwright/test` 1.64.1, la versión del plan. En la laptop usa el Chrome instalado (sin descargar navegadores); en el CI usaría el Chromium de Playwright. Corre de a una, porque cada corrida saca 2 turnos y el límite es de 5 por IP cada 10 minutos.
- **Seguridad:** el fallo 3 pasa a 🟩.
- **Pendiente:** correr la prueba en el CI (con Supabase local o contra `siguiente-pruebas`), sumar axe para accesibilidad y las duraciones recientes en `fila_publica`.

## 2026-10-28 · Sprint 3: login y panel del barbero conectados

- **Qué:** las tres primeras tareas del [Sprint 3](plan-implementacion.md#sprint-3--barbero-tv-y-avisos-semana-5): entrar con correo y contraseña, el panel del barbero con sus cuatro botones y el aviso por WhatsApp.
- **Sesión** (`app/src/lib/sesion.ts`): `signInWithPassword` de Supabase Auth, con mensajes para contraseña equivocada, demasiados intentos y sin conexión. `/entrar` lleva al panel si ya hay sesión, y `/panel` manda a `/entrar` si no la hay. "¿Olvidaste tu contraseña?" ahora explica que se la pidan al dueño: recuperarla por correo necesita el SMTP de Resend.
- **Panel** (`app/src/lib/panel.ts`): lee con la sesión del barbero (RLS: solo su barbería) su silla, los servicios, los turnos activos y lo atendido hoy (según la zona horaria de la barbería). Se actualiza con la señal de la fila. Cada botón llama a su función de la base (`llamar_siguiente`, `empezar_turno`, `marcar_no_llego`, `terminar_turno`, `pausar_barbero`) y los rechazos se explican ("ya tienes a alguien en la silla", "ese turno ya cambió"…). Una cuenta sin silla ve un mensaje en vez de un panel vacío. Botón para salir.
- **WhatsApp:** con un cliente llamado, el botón abre `wa.me` con el mensaje escrito ("Luis, ya te toca en Barbería Prueba. Te esperamos en la silla 1."). Si no dejó número, lo dice.
- **Prototipo:** el panel simulado pasa a `/demo/panel`; el menú de pantallas apunta ahí.
- **Cuenta de prueba:** `scripts/e2e/barbero-prueba.sql` crea por SQL una cuenta de barbero en `siguiente-pruebas` ligada a Carlos de "Barbería Prueba". El correo y la contraseña (generada al azar) viven solo en `.env.local` (`E2E_BARBERO_CORREO` y `E2E_BARBERO_CLAVE`), nunca en el repositorio. En producción las cuentas se crearán por invitación (Sprint 4).
- **Probado en el navegador (localhost, celular de 375 px):** entrar con la cuenta de prueba, llamar al #3, ver el enlace de WhatsApp, empezar y terminar con tarjeta; en otra pestaña, la página del cliente pasó sola por "¡Te toca!", "Disfruta tu corte" y "¡Quedaste fino!". En la base: atendido, L 150, tarjeta y los 4 eventos de la bitácora.
- **Ajuste:** "Registrado" convierte el monto a número antes de sumar, por si `numeric` llega como texto.
- **Pruebas:** 105 de Vitest (7 nuevas del login y el panel, con un Supabase falso que simula sesión y tablas) y 3 de Playwright, con la nueva `tests/e2e/barbero.spec.ts`: dos celulares, el barbero llama, empieza y termina, y el cliente lo ve. Las funciones compartidas de las pruebas de punta a punta pasaron a `tests/e2e/utilidades.ts`.
- **Pendiente del Sprint 3:** pantalla de TV, Web Push con la Edge Function `avisos`, `vencer_tolerancia()` con `pg_cron` y el SMTP de Resend.
