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

## 2026-10-28 · Sprint 3: la pantalla de TV con datos reales

- **Qué:** `/b/:slug/tv` muestra la fila real de la barbería, anuncia cada llamado y mantiene la pantalla encendida ([plan](plan-implementacion.md#sprint-3--barbero-tv-y-avisos-semana-5)). `/b/la-navaja/tv` sigue con el prototipo.
- **Columnas** (`app/src/lib/tv.ts`): una por barbero, tantas como tenga la barbería. Cada una muestra si está libre, llamando, atendiendo o en pausa, y el número en grande. "Sigue" sale de la misma simulación del estimado ([ADR-012](decisiones.md#adr-012--cómo-se-calcula-el-estimado-de-espera)), así un turno de "el primero libre" aparece una sola vez, con el barbero que probablemente lo atienda. Un barbero libre muestra "LIBRE" en grande en vez de un número (el "—" gigante se veía como una barra blanca).
- **Anuncios:** cuando un barbero llama a alguien aparece a pantalla completa "Turno #9 · Luis P. · Pasa con Carlos · silla 1" durante 4,5 segundos. Si llegan varios a la vez, salen en orden. Al encender la TV no anuncia lo que ya estaba llamado. El nombre se recuerda de la fila, porque al llamarlo ya no está en ella.
- **Sonido:** botón "Activar sonido de los anuncios" en la esquina; los navegadores no dejan sonar nada hasta que alguien toca la pantalla una vez. Los tonos pasaron a `lib/sonido.ts`, compartidos con el aviso de "te toca" del cliente.
- **Pantalla encendida:** `usePantallaEncendida` pide Wake Lock y lo vuelve a pedir cuando la página vuelve a estar visible.
- **QR y marquesina:** usan la dirección real de la página (en producción, el dominio) con `?origen=qr`.
- **Probado en el navegador (1280×720):** la TV de "Barbería Prueba" con Carlos y Jorge, sus "sigue" y la fila. Desde el panel de Carlos se llamó al #9 y la TV mostró el anuncio unos 5 segundos (verificado en el DOM cada 100 ms; con el panel del navegador oculto, las capturas no siempre muestran el cuadro más reciente).
- **Pruebas:** 117 en total. Nuevas: columnas y detección de llamados (`tv.test.ts`, incluida la secuencia llamado → libre → nuevo llamado), y la TV del prototipo, la real y la de una barbería inexistente en las rutas.
- **Hallazgos:**
  - El límite de 5 turnos por IP cada 10 minutos frenó la creación de datos de prueba (`limite_ip`), como debe ser. Para seguir probando se creó un turno directo en la base con `unirse_a_fila`, sin hash de IP.
  - Los nombres con tilde que se mandaron con `curl` desde la terminal de Windows llegaron con otra codificación ("Jos� P."). Es un problema de esa terminal, no de la app: se corrigieron en la base, y los datos de prueba con tildes se crean por SQL o con Playwright.
- **Pendiente:** las conexiones públicas de Realtime duran hasta 24 horas; supabase-js se reconecta y la TV recarga al reconectar, más la recarga de respaldo cada 60 s. Conviene revisarlo en el piloto con una TV encendida todo el día.

## 2026-10-28 · Sprint 3: "no llegó" automático con pg_cron

- **Qué:** quien fue llamado y no se sentó dentro de la tolerancia de su barbería queda como "no llegó" sin que el barbero toque nada ([plan](plan-implementacion.md#sprint-3--barbero-tv-y-avisos-semana-5)).
- **Migración** `20261029012938_tareas_programadas` (aplicada en `siguiente-pruebas` con el MCP; el archivo lleva la misma versión, como pide [ADR-011](decisiones.md#adr-011--detalles-de-la-base-de-datos-del-sprint-1)):
  - activa `pg_cron`;
  - `vencer-tolerancia` corre `select public.vencer_tolerancia()` cada minuto. La función ya existía y estaba probada en `03_funciones`;
  - `limpiar-historial-cron` borra a diario, a las 3:30 a. m. de Honduras, las corridas de más de una semana. Con una tarea por minuto, `cron.job_run_details` sumaría 1440 filas al día.
- **Prueba en la nube:** se dejó un turno de "Barbería Prueba" como llamado hace 6 minutos (la tolerancia es de 5). La tarea de las 01:31 UTC lo pasó a `no_llego` y un segundo después la página del cliente cambió sola de "¡Te toca!" a "Se pasó tu turno". El turno quedó con sus 3 eventos en la bitácora, el panel de Carlos volvió a "Silla libre" y el historial de pg_cron muestra las corridas como `succeeded`.
- **Pruebas:** `supabase/tests/database/04_tareas.test.sql` (6 pruebas pgTAP) revisa que `pg_cron` esté activo, que la tarea corra cada minuto, esté activa y llame solo a la función, y que la limpieza diaria exista una sola vez. Corre en el CI con Supabase local.
- **Siguiente:** del Sprint 3 solo faltan los avisos por Web Push (necesitan la clave VAPID en los secretos de Supabase y probar en teléfonos reales). `cerrar_dia()` y `borrar_telefonos_viejos()` siguen para el Sprint 4, con el mismo mecanismo.

## 2026-10-31 · Sprint 3: avisos por Web Push

- **Qué:** la última tarea del [Sprint 3](plan-implementacion.md#sprint-3--barbero-tv-y-avisos-semana-5). El cliente toca "Avisarme cuando falten 15 min" en su turno y recibe como máximo 2 avisos: "ya casi" cuando el estimado llega a 15 minutos y "te toca" cuando el barbero lo llama ([ADR-014](decisiones.md#adr-014--avisos-por-web-push-sin-librerías-ni-caché)).
- **Avance del MVP:** 23 de las 35 tareas de los sprints 0 a 4, cerca de **66 %**. Lo que sigue en orden: cargar las claves de los avisos y probarlos en teléfonos (necesita la app en HTTPS), y después el Sprint 4 (dueño, antiabuso y lanzamiento).
- **Cifrado** (`supabase/functions/_shared/webpush.ts`): aes128gcm (RFC 8291) y VAPID con ES256 (RFC 8292) solo con WebCrypto, sin dependencias. Reproduce byte por byte el ejemplo del apéndice A de la RFC 8291. Solo acepta endpoints de Google, Mozilla, Apple y Microsoft (SSRF).
- **Lógica** (`_shared/avisos.ts`) y **Edge Function `avisos`** (desplegada en `siguiente-pruebas`, versión 1, `verify_jwt = false`): lee lo pendiente con la clave que manda la base, calcula el estimado con `eta.ts`, reserva cada aviso antes de mandarlo, borra las suscripciones vencidas (404/410) y reintenta al minuto siguiente solo las fallas pasajeras. Probada en la nube: rechaza otro método (405), sin clave (401) y, sin claves VAPID, no hace nada.
- **Migración** `20261031132532_avisos_web_push` (aplicada en `siguiente-pruebas` con el MCP): pg_net; columnas `aviso_casi_en` y `aviso_llamado_en`; regla de servicios de push conocidos en la tabla y en `suscribir_push`; trigger por sentencia que llama a la función cuando cambia un estado y tarea `revisar-avisos` de pg_cron cada minuto, las dos solo si hay algo pendiente; borrado de la suscripción al sentarse o cerrar el turno; funciones solo para la clave secreta. Dirección y clave de la función en Vault.
- **Navegador:** `app/src/lib/avisos.ts` (permiso, service worker, suscripción y `suscribir_push` con el secreto del turno), botón real en `/t/:codigo` con sus estados (activando, activos, bloqueados, error y, en Safari de iPhone, cómo agregar la página a la pantalla de inicio), `app/public/sw.js` sin caché, manifiesto e íconos PNG generados con `scripts/iconos.mjs`. Con los avisos activos, la página dice que se puede cerrar.
- **Pruebas:** 193 de Vitest (76 nuevas: cifrado, firma, envío, decisiones de la función, módulo del navegador y la página real con Web Push simulado) y 50 pgTAP nuevas en `05_avisos.test.sql`, todas en verde en `siguiente-pruebas` dentro de una transacción que se deshizo. Se cambió el endpoint de `03_funciones` a uno de Google, porque `push.example.com` ya no se acepta. Los permisos del público y del personal no cambiaron (revisado contra `01_permisos`). `npm run check` pasa.
- **Verificado en el navegador (375 px):** el prototipo `/t/K7P2Q` activa sus avisos simulados igual que antes; `sw.js` y el manifiesto se sirven, sin errores de consola ni scroll lateral.
- **Security Advisor:** sin cambios; las 4 funciones nuevas no aparecen como expuestas.
- **Hallazgos:**
  - El modo automático de Claude Code no deja escribir secretos en Vault ni en Supabase. La configuración la hace el autor (ver "Pendiente").
  - La revisión de claves secretas del build encuentra `sb_secret_` en el paquete de supabase-js cuando se construye en la laptop: es la librería comprobando el prefijo de una clave, no una clave, y ya pasaba antes de este cambio. El CI pasa esa revisión.
  - Una prueba pgTAP buscaba turnos por nombre y en `siguiente-pruebas` había otro "Marta Díaz": los ayudantes ahora filtran por la barbería de la prueba.
- **Pendiente:**
  1. Crear en Vault `avisos_url` y `avisos_clave` (SQL en el editor de Supabase).
  2. `npx supabase login` y `node scripts/claves-vapid.mjs` (carga `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` en Supabase y la pública en `.env.local`).
  3. Probar en Chrome de escritorio y, con la app en HTTPS (Worker de Cloudflare), en Android y iPhone: eso cierra la prueba de riesgo 2 y la salida del Sprint 3.

## 2026-10-31 · Los avisos llegan a Chrome: prueba de riesgo 2 en escritorio

- **Qué:** con las claves cargadas, los avisos llegaron de punta a punta a Chrome de escritorio. Es la mitad de escritorio de la [prueba de riesgo 2](plan-implementacion.md#sprint-0--entorno-y-pruebas-de-riesgo-semanas-12-en-paralelo-a-la-validación); faltan Android y iPhone.
- **Configuración** (hecha por el autor en `siguiente-pruebas`): `avisos_url` y `avisos_clave` en Vault, `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` en los secretos de las Edge Functions con `scripts/claves-vapid.mjs`, y la clave pública en `.env.local`. Se comprobó que la clave pública de `.env.local` es la misma de Supabase comparando huellas SHA-256, sin mostrarla.
- **Prueba nueva** (`tests/e2e/avisos.spec.ts`, solo en la laptop porque el Chromium del CI no tiene servicio de push): un cliente se anota con Carlos, activa los avisos y recibe "Ya casi te toca" en el siguiente minuto (pg_cron), y "¡Te toca!" cuando Carlos lo llama desde el panel (trigger), unos 7 segundos después. Pasa por la base, pg_net, la función `avisos`, el servicio de push de Google y el service worker. Al final cancela el turno.
- **Hallazgos:**
  - Los contextos normales de Playwright son tipo incógnito, y Chrome no deja usar Web Push en incógnito ("Registration failed - permission denied"). La prueba usa un perfil persistente y quita `--disable-background-networking` para que Chrome escuche a Google.
  - Con el permiso de notificaciones que concede Playwright (temporal, de la sesión), Google respondió 410 en 2 de 4 corridas: Chrome daba de baja la suscripción al repasar los permisos. Con el permiso guardado en el perfil, como cuando una persona acepta el cuadro, pasaron las 2 corridas siguientes y los 4 avisos fueron aceptados. A un cliente real no debería pasarle, porque su permiso queda guardado; se confirma con la prueba en teléfonos.
  - Para encontrarlo, la función ahora registra las suscripciones vencidas con el servicio y el código de Google (nunca el endpoint). Versión 3 de `avisos` desplegada.
  - Antes, un envío desde la laptop con el mismo código y claves de prueba de un solo uso fue aceptado (201) y Chrome mostró la notificación: el cifrado y la firma están bien.
- **Pruebas:** 193 de Vitest (la de suscripción vencida revisa el registro nuevo). La base quedó limpia: 0 suscripciones y 0 turnos activos en "Barbería Prueba".
- **Siguiente:** publicar la app en HTTPS (Worker de Cloudflare) para probar en Android y iPhone, y con eso cerrar la prueba de riesgo 2 y la salida del Sprint 3. Después, el Sprint 4.

## 2026-10-31 · Sprint 4: el panel del dueño con datos reales

- **Qué:** las dos primeras piezas del [Sprint 4](plan-implementacion.md#sprint-4--dueño-antiabuso-y-lanzamiento-semana-6): el resumen del día y el QR del dueño leen la barbería real, con la pausa de la fila remota y renombrar u ocultar turnos.
- **Avance del MVP:** 25 de las 35 tareas de los sprints 0 a 4, cerca de **71 %**. La salida del Sprint 3 sigue esperando la prueba de avisos en teléfonos (necesita la app en HTTPS); mientras, se avanzó con lo que no depende de eso.
- **Rutas:** `/dueno` es el panel real y pide sesión (`/entrar?siguiente=/dueno` lleva de vuelta). El prototipo pasa a `/demo/dueno`, como `/demo/panel`; el menú de pantallas apunta ahí. En el panel real todavía no aparece la configuración: llega en el siguiente paso.
- **Datos** (`app/src/lib/dueno.ts`): la barbería de la que la cuenta es dueña (`miembros` con rol `dueno`); el reporte de `reporte_dia` validado con zod; los barberos y los turnos activos con el nombre completo (RLS: solo su barbería). Se actualiza con la señal de la fila y, con la página oculta, cada 30 segundos. Una cuenta que no es dueña ve "Solo para dueños" y un enlace a su panel.
- **Resumen:** misma pantalla para el prototipo y la base, como la fila pública y el panel. Con datos reales: turnos del día, cobros por cliente, espera y error del estimado ("—" si todavía no hay con qué calcularlos), abandonos separados en "no llegó" y "canceló", por barbero y horas pico de la primera a la última hora con turnos, sin huecos. La fila muestra a quien espera o fue llamado.
- **Acciones:** el interruptor llama a `pausar_fila_remota`; renombrar (`renombrar_turno`) guarda una sola vez aunque coincidan Enter, el botón y perder el foco, y Escape descarta; ocultar llama a `ocultar_turno`. Los rechazos de la base se explican en un aviso.
- **QR:** el cartel y el enlace para Instagram usan la barbería real y la dirección donde corre la app (en producción, el dominio). El de la bio va sin `?origen=qr`, porque quien lo abre no está en el local.
- **Login:** `?siguiente=` solo acepta `/panel` y `/dueno` (con una sección), nunca otra página ni otro sitio.
- **Cuenta de prueba:** `scripts/e2e/dueno-prueba.sql` hace dueña de "Barbería Prueba" a la cuenta de Carlos, el caso de la barbería chica donde el dueño también corta. Sigue atendiendo en la silla 1. Así no hizo falta crear otra cuenta con contraseña.
- **Pruebas:** 206 de Vitest (13 nuevas del panel del dueño: sin sesión, cuenta que no es dueña, reporte, fila, día sin turnos, pausar, ocultar, renombrar una sola vez, Escape, rechazo de la base, QR y los ayudantes de horas y del login). `npm run check` pasa.
- **Revisado en Chrome con datos reales** (script con dos turnos de prueba y la cuenta de `.env.local`): entrar lleva de vuelta a `/dueno`; sin scroll lateral a 375 px; ocultar y renombrar quedan en la base y en la bitácora (`oculto`, `renombrado`); con la fila remota pausada, `fila_publica` lo refleja y el nombre del turno oculto no sale; al final la fila remota quedó abierta y los turnos cancelados. Sin errores de consola. También en escritorio a 1280 px y el QR.
- **Siguiente:** la configuración real (barberos, servicios, horario, tamaño de la fila y tolerancia). La invitación por correo necesita el SMTP de Resend.

## 2026-10-31 · La app publicada en Cloudflare y el CI de gitleaks

- **Qué:** la app quedó publicada con HTTPS en **https://nextcut.gustavoapz07.workers.dev** (Worker `nextcut`, recursos estáticos), conectada al proyecto de pruebas. Es lo que hacía falta para probar los avisos en teléfonos. Se subieron a GitHub los commits del día.
- **Publicar:** `npm run deploy:pruebas` arma la app en modo `pruebas` (`.env.pruebas`, versionado porque solo tiene valores públicos) con la clave de sitio de prueba de Turnstile, que siempre pasa. No baja la protección: `siguiente-pruebas` ya usaba la clave secreta de prueba. La CLI de Cloudflare quedó con sesión (`wrangler login`, aprobado por el autor).
- **Revisado:** `/`, `/b/barberia-prueba`, `/t/K7P2Q` y `/dueno` responden 200 (la SPA resuelve las rutas), `sw.js` sale como JavaScript y el manifiesto como `application/manifest+json`. En Chrome a 375 px la fila real de "Barbería Prueba" carga desde Supabase, sin errores de consola.
- **Falta:** que `unirse-a-fila` acepte el origen nuevo. Hoy su CORS solo deja pasar `http://localhost:5173`, así que desde la app publicada todavía no se puede anotar. El modo automático de Claude Code no deja cambiar secretos de Supabase: lo carga el autor con `npx supabase secrets set "ORIGENES_PERMITIDOS=http://localhost:5173,https://nextcut.gustavoapz07.workers.dev" --project-ref bquvluxsqfacleumlnmi`.
- **CI ([corrida #15](https://github.com/gustavoapz07/NextCut/actions/runs/41229808916)):** lint, tipos, pruebas, build y la base (incluidas las 50 pruebas pgTAP de los avisos con Supabase local) pasaron; gitleaks falló. El detalle solo se ve con sesión en GitHub, así que se reprodujo su regla `generic-api-key` en Node sobre las líneas nuevas: marcaba el secreto de autenticación del ejemplo de la RFC 8291 (`auth: "BTBZ…"`, público, en 5 pruebas) y un comentario con el nombre `VAPID_PUBLIC_KEY`. Ninguno es una clave. `.gitleaks.toml` mantiene todas las reglas y solo deja pasar esos valores del ejemplo de la RFC y los nombres de las variables. La revisión semanal de todo el historial también los va a encontrar, por eso va en la configuración y no en una excepción de un commit.
- **Siguiente:** cargar `ORIGENES_PERMITIDOS` y probar los avisos en Android (Chrome) y en iPhone (Safari, con la página en la pantalla de inicio). Con eso se cierran la prueba de riesgo 2 y la salida del Sprint 3.

## 2026-10-31 · Anotarse y recibir avisos desde la app publicada

- **Qué:** con `ORIGENES_PERMITIDOS` cargado por el autor, `unirse-a-fila` acepta `https://nextcut.gustavoapz07.workers.dev` y `http://localhost:5173`, y sigue rechazando cualquier otro origen (revisado con `curl`).
- **Recorrido en Chrome contra la app publicada** (perfil persistente con el permiso de notificaciones guardado): anotarse por el formulario con Carlos (Turnstile de prueba y la Edge Function), activar los avisos (suscripción en `fcm.googleapis.com`) y recibir "Ya casi te toca · Turno #11" a los 63 segundos, por el reloj de pg_cron. Al final el turno quedó cancelado. Sin errores de consola.
- **CI:** la corrida del commit `d005d5e` pasó completa, gitleaks incluido. La revisión de todo el historial (manual o la de los lunes) confirmará que `.gitleaks.toml` cubre los commits anteriores.
- **Detalle visto:** con el barbero libre, la página del turno dice "Cuando Carlos termine, te llama", aunque Carlos no tenga a nadie.
- **Siguiente:** la prueba en Android y en iPhone (con la página en la pantalla de inicio), que cierra la prueba de riesgo 2 y la salida del Sprint 3.

## 2026-10-31 · Prueba en un Samsung A55 y aviso de prueba al activar

- **Qué pasó:** el autor se anotó desde un Samsung Galaxy A55 5G y nunca vio el aviso. En la base, sus dos turnos (#12 y #13) quedaron suscritos en `fcm.googleapis.com` y la función mandó "ya casi" a las 12:48 y a las 12:52; Google aceptó los dos (`enviados: 1`). El aviso salió y llegó a Google: lo que faltó fue que el teléfono lo mostrara. Lo más probable es un ajuste del teléfono (las notificaciones de Chrome en Android, las del sitio en Chrome o el ahorro de batería de Samsung), o que se usara Samsung Internet. Queda por confirmar con el autor.
- **Aviso de prueba al activar** (`app/src/lib/avisos.ts`): en cuanto se activan los avisos, el teléfono muestra "Avisos activados" sin pasar por el servidor. Si no aparece, el bloqueo está en el teléfono o en el navegador y la persona se entera en ese momento, no cuando ya le toca. Lleva la etiqueta del turno, así "ya casi" lo reemplaza. Si el teléfono no deja mostrarlo, los avisos quedan activos igual.
- **Texto del barbero libre:** con el turno siguiente, la página decía "Cuando Carlos termine, te llama" aunque Carlos no tuviera a nadie. Ahora distingue: "Carlos está libre: te llama en cualquier momento", "Carlos está en pausa: te llama cuando vuelva" o "Cuando Carlos termine con el #N, te llama"; si todavía no llegó la fila, deja el texto general.
- **Pruebas:** 212 de Vitest (6 nuevas: el aviso de prueba, que no bloquea si falla, que no sale si la base rechaza la suscripción, y los tres textos del barbero).
- **Publicado y revisado en Chrome contra `nextcut.gustavoapz07.workers.dev`:** anotado con Jorge (libre), la página dice "Jorge está libre: te llama en cualquier momento", "Avisos activados" aparece al activar y "Ya casi te toca · Turno #14" lo reemplaza a los 9 segundos. Turno cancelado al final; sin errores de consola.
- **Siguiente:** repetir en el A55 con la versión nueva. Si "Avisos activados" no aparece, revisar los ajustes del teléfono; si aparece pero "ya casi" no, el problema está en la entrega de Google al teléfono.

## 2026-10-31 · Segundo intento en el A55 y "Probar el aviso"

- **Qué pasó:** el autor volvió a probar y no vio ningún aviso. En la base no hubo ningún turno ni suscripción nueva desde las 12:51: el intento no llegó al servidor. Su turno #13 ya había recibido "ya casi" a las 12:52, y ese aviso sale una sola vez por turno (fallo 6). Al volver a abrir esa página, el botón ya decía "Te avisamos…" y no había nada que activar ni mandar, así que tampoco podía salir "Avisos activados".
- **"Probar el aviso":** con los avisos activos, la página del turno ofrece un botón que muestra en el teléfono "Así te llega el aviso", sin pasar por el servidor. Si no aparece, la página explica que hay que activar las notificaciones del navegador en los ajustes del teléfono. Si el navegador perdió la suscripción, vuelve a aparecer "Avisarme" para activarlos de nuevo. Sirve para el diagnóstico y para los clientes del piloto.
- **Pruebas:** 216 de Vitest (4 nuevas). Publicado y revisado en Chrome contra la app publicada: "Avisos activados" al activar, "Así te llega el aviso" al probar y "Ya casi te toca · Turno #15" a los 12 segundos. Turno cancelado al final.
- **Siguiente:** en el A55, abrir de nuevo el turno #13 (o anotarse otra vez) y tocar "Probar el aviso". Si no aparece, son los ajustes del teléfono o del navegador; si aparece, el problema está en la entrega de Google y se sigue por ahí.
