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

## 2026-10-31 · Diagnóstico de avisos en el teléfono y actualización automática

- **Qué pasó con el A55:** después de recargar, el autor ve los botones pero no le llega ninguna notificación, y tiene Chrome y los ajustes como se le indicó. El registro de `unirse-a-fila` (que guarda cada intento, también los rechazados) muestra que sus intentos que llegaron al servidor son el #12 (12:47) y el #13 (12:51); después, ningún intento más desde su teléfono. El #13 sigue en la fila y su "ya casi" salió a las 12:52, aceptado por Google. Desde el servidor no se puede ver si ese aviso llegó al teléfono, así que hacía falta mirar dentro del teléfono.
- **`/diagnostico`** (sin enlace en ninguna pantalla): muestra el navegador y el sistema, si la conexión es segura, el permiso del sitio, el estado del service worker, el servicio de la suscripción, si se abrió desde la pantalla de inicio y los últimos 10 avisos que llegaron al teléfono, con la hora y si se pudieron mostrar. Un botón muestra un aviso local y revisa si el navegador lo tiene a la vista: si lo tiene y la persona no lo ve, lo esconde Android; si no, el navegador bloquea el sitio. Nada sale del teléfono; la idea es mandar una captura.
- **Registro en el service worker** (`app/public/sw.js`): cada aviso que llega queda anotado en el teléfono (Cache Storage, los últimos 10, solo hora, título y resultado) y se avisa a las páginas abiertas. Si `showNotification` falla, queda el error. La app sigue sin guardarse en caché.
- **Actualización automática** (`app/src/lib/version.ts`): al volver a la pestaña y cada 15 minutos, la app compara el paquete del `index.html` publicado con el que está corriendo y recarga si cambió, salvo con un campo de texto en uso o en el formulario para anotarse. Así un teléfono con la pestaña abierta (o la TV encendida todo el día) no se queda con una versión vieja, que es lo que le pasó al autor con "Probar el aviso".
- **Pruebas:** 229 de Vitest (13 nuevas). Publicado y revisado en Chrome contra la app publicada: el diagnóstico muestra el permiso, el service worker activo y la suscripción en `fcm.googleapis.com`; el aviso de prueba queda a la vista; y "Ya casi te toca · Turno #18" aparece en el registro como "mostrado" a los 30 segundos. Turnos de prueba cancelados.
- **Siguiente:** el autor abre `/diagnostico` en el A55 (eso también le instala el service worker nuevo) y manda una captura. Después se vuelve a mandar el "ya casi" de su turno #13 y se mira si queda en el registro del teléfono.

## 2026-10-31 · La causa en el A55: el permiso de la app agregada a la pantalla de inicio

- **Qué mostró `/diagnostico` en el A55:** Chrome 156, conexión segura, service worker activo, **permiso del sitio "todavía no se pidió"**, **ninguna suscripción**, **abierta desde la pantalla de inicio** y ningún aviso recibido. El aviso de prueba falló con "No notification permission has been granted for this origin".
- **Causa:** en Android, una página agregada a la pantalla de inicio se vuelve una app aparte (NextCut) y Chrome le pasa a esa app el permiso de notificaciones del sitio. Ese permiso nunca se dio, así que la suscripción del turno #13, creada antes, quedó sin permiso y el navegador la borró. Eso explica que Google aceptara los avisos y el teléfono no mostrara nada. Al tocar "Avisarme", el permiso se pedía y volvía sin respuesta (sin pregunta a la vista), y la página regresaba al mismo botón sin explicar nada.
- **Cambios:**
  - Si el permiso vuelve sin respuesta, la página lo dice y explica qué revisar; con la app agregada a la pantalla de inicio, que hay que activar las notificaciones de la app NextCut en los ajustes del teléfono.
  - Si el teléfono había activado los avisos de ese turno y el permiso ya no está, lo dice desde que abre la página.
  - Al abrir un turno con los avisos activos, la página revisa que la suscripción siga ahí; si el navegador la borró, se vuelve a suscribir sola (con el permiso dado, sin preguntar).
  - `/diagnostico`: si falta el permiso, explica dónde activarlo (la app NextCut o el sitio en Chrome) y tiene un botón para pedirlo. Ya no muestra "Android 10": Chrome manda ese número en todos los teléfonos para no revelar la versión real.
- **Pruebas:** 233 de Vitest (5 nuevas). Publicado y revisado en la app publicada: sin permiso, el diagnóstico muestra "Falta el permiso" con la guía y el botón; el recorrido de activar y recargar sigue igual. Sin errores de consola.
- **Siguiente:** en el A55, activar las notificaciones de la app NextCut (Ajustes → Aplicaciones → NextCut → Notificaciones), revisar con `/diagnostico` y abrir el turno #13 para que se vuelva a suscribir. Después se vuelve a mandar su "ya casi" y se mira el registro del teléfono.

## 2026-10-31 · El aviso llega a un Samsung A55: prueba de riesgo 2 en Android

- **Qué:** con las notificaciones de la app NextCut activadas en los ajustes de Android, el autor abrió su turno #13 en el A55. La página vio que los avisos estaban activos pero el navegador ya no tenía suscripción, y se volvió a suscribir sola (13:45:33, suscripción nueva en `fcm.googleapis.com`). A las 13:46:00 el reloj de pg_cron mandó "ya casi", Google lo aceptó y **el aviso apareció en el teléfono**.
- **Antes, la prueba que lo confirmó:** al volver a mandar el "ya casi" a la suscripción vieja (13:44), Google respondió **410**: Chrome la había borrado cuando el permiso pasó a la app de la pantalla de inicio. La función registró "suscripción vencida" con el código y la quitó de la base, como debe.
- **Para el piloto:** si un cliente de Android agrega la página a la pantalla de inicio, esa app tiene su propio permiso de notificaciones. La página del turno ahora lo explica y se resuscribe sola cuando vuelve el permiso; `/diagnostico` sirve para revisarlo con el teléfono del cliente.
- **Prueba de riesgo 2:** pasa en Chrome de escritorio y en Android. Falta el iPhone (Safari, con la página agregada a la pantalla de inicio, iOS 16.4 o superior). Con eso se cierra también la salida del Sprint 3.
- **Nota:** el turno #13 del autor sigue en la fila de Carlos. Sirve para probar el "¡Te toca!" llamándolo desde el panel, o se puede cancelar.

## 2026-10-31 · Sprint 4: la configuración del dueño con datos reales

- **Qué:** `/dueno/configuracion` edita la barbería real ([plan](plan-implementacion.md#sprint-4--dueño-antiabuso-y-lanzamiento-semana-6)). El prototipo sigue en `/demo/dueno/configuracion`, con las mismas pestañas y la misma barra de "Tienes cambios sin guardar".
- **Secciones:**
  - **Barbería:** nombre y zona. El enlace de la fila se muestra pero no se cambia, para que los QR impresos sigan funcionando.
  - **Barberos:** nombre, apodo y silla; agregar; quitar (queda en "Ya no atienden", porque los turnos pasados lo nombran) y volver a agregar. Dice quién tiene cuenta para el panel. La invitación por correo queda para cuando esté el SMTP de Resend.
  - **Servicios:** nombre, duración (de 5 en 5, de 5 a 240 minutos) y precio; agregar; quitar (queda en "Ya no se ofrecen") y volver a ofrecer.
  - **Reglas de la fila:** tamaño máximo y tolerancia. Las protecciones (un turno activo por teléfono, 5 turnos por conexión cada 10 minutos, nada de teléfonos en pantallas públicas) se muestran como siempre activas: en el prototipo eran interruptores, pero apagarlas debilitaría controles de seguridad.
- **Cómo guarda** (`app/src/lib/configuracion.ts`): se edita un borrador; al guardar se valida con las mismas reglas que los CHECK de la base y se explica el primer problema ("dos barberos activos tienen la misma silla", "deja al menos un servicio activo"…). Después se manda solo lo que cambió, con el texto limpio. RLS deja escribir solo al dueño; cada escritura pide de vuelta la fila, porque con RLS una actualización ajena no da error, solo no cambia nada. Tras guardar se recarga, así un error a la mitad muestra lo que sí quedó.
- **Login:** el panel del dueño manda a `/entrar?siguiente=` con la sección pedida. Antes siempre volvía al resumen.
- **Pruebas:** 252 de Vitest (21 nuevas: validación, cambios entre lo guardado y el borrador, la pantalla con datos reales, guardar solo lo que cambió, agregar un barbero en la siguiente silla libre, quitar sin borrar, no guardar con errores, descartar, protecciones fijas y la vuelta después de entrar).
- **Revisado en Chrome contra la app publicada,** con la cuenta de prueba: entrar vuelve a `/dueno/configuracion`; Barba de 15 a 20 minutos y de vuelta; agregar a un barbero y quitarlo; la tolerancia de 5 a 6 y de vuelta. Sin scroll lateral a 375 px ni errores de consola. La base quedó como estaba; el barbero de prueba, sin turnos, se borró a mano.
- **Falta de la configuración:** el horario (no existe en la base; para que cierre la fila remota sola hay que tocar `unirse_a_fila` y la fila pública) y la invitación por correo.

## 2026-11-01 · El horario cierra la fila en línea sola

- **Qué:** cada barbería puede tener un horario por día de la semana: a qué hora abre y cierra, o si ese día no abre. Fuera de horario, la fila en línea se cierra sola. El QR de la puerta (`?origen=qr`) sigue dejando anotarse. Sin horario todo sigue como antes: la fila en línea queda abierta hasta que el dueño la pausa.
- **Base** (migración `20261031200657_horario.sql`): columna `barberias.horario` (jsonb) con un CHECK (`privado.horario_valido`: días del 1 al 7, horas en formato HH:MM y la hora de cerrar después de la de abrir). `privado.abierta_en` decide usando la zona horaria de la barbería. `fila_publica` ahora manda `horario`, `zona_horaria` y `abierta`. `unirse_a_fila` rechaza los turnos remotos fuera de horario con `fuera_de_horario`, y la Edge Function `unirse-a-fila` (versión 6) lo devuelve como 409.
- **Página pública:** fuera de horario dice "Cerrado ahora", cuándo vuelve a abrir ("Abre mañana a las 9:00 a. m.", hoy o el día que toque) y que quien ya está en el local se anote con el QR. Abierta, muestra "Abierto hasta 7:00 p. m.". El texto sale de `supabase/functions/_shared/horario.ts`; si se puede anotar o no, lo decide la base.
- **Configuración:** en la pestaña Barbería hay una tarjeta "Horario". Un interruptor la activa, empezando de lunes a sábado de 9:00 a 19:00. Cada día se abre o se cierra y se le cambian las horas. Un día que cierra antes de abrir se marca en rojo y no se guarda.
- **Pruebas:** 286 de Vitest (34 nuevas) y 24 de pgTAP (`06_horario`), que pasan en la nube. Las pruebas encontraron un punto de más en "9:00 a. m.." y se corrigió.
- **Revisado en la app publicada** con la Barbería Prueba, un domingo a las 19:00:
  - Con el horario de lunes a sábado, la página dijo "Cerrado ahora · Abre mañana a las 9:00 a. m." y no mostró el botón para anotarse.
  - Con `?origen=qr`, el botón siguió.
  - La Edge Function respondió 409 `fuera_de_horario` a un turno remoto.
  - Con el domingo de 18:00 a 23:00, mostró "Abierto hasta 11:00 p. m.".
  - El horario se puso y se quitó directo en la base. La pantalla del dueño se probó con Vitest, no entrando con la cuenta de prueba a la app publicada.
- **Falta de la configuración:** la invitación por correo (necesita el SMTP de Resend).

## 2026-11-02 · El día se cierra solo y los teléfonos se borran a los 90 días

- **Qué:** se programaron con `pg_cron` las dos funciones que existían desde la migración base (migración `20261102060131_cierre_y_borrado.sql`). No se cambió ninguna función.
- **`cerrar-dia`** corre cada hora, al minuto 1. `cerrar_dia()` solo toca los turnos de un día anterior al de cada barbería en su zona horaria, así que el día se cierra poco después de la medianoche de cualquier zona (en Honduras, a las 00:01):
  - Quien seguía esperando cuenta como abandono y entra en el reporte de ese día.
  - Quien fue llamado y no se sentó queda como "no llegó".
  - Quien quedó en la silla no se toca, porque el cobro lo registra el barbero.
  - La suscripción a avisos de los turnos cerrados se borra.
- **`borrar-telefonos-viejos`** corre cada día a las 3:40 a. m. de Honduras (9:40 UTC). Borra el teléfono de los turnos cerrados de hace más de 90 días. El resto del turno se queda para el reporte. El fallo 5 de [seguridad](seguridad.md) pasa a 🟩; falta confirmar el plazo con los dueños.
- **Pruebas:** 30 de pgTAP nuevas (`07_cierre_y_borrado`), que pasan en la nube. Comprueban:
  - las dos tareas: horario, comando, que estén activas y que no estén repetidas;
  - la zona horaria: la misma fecha se cierra en Kiritimati (UTC+14) y sigue abierta en Pago Pago (UTC−11);
  - que no se toca a quien está en la silla ni a quien espera hoy, que el abandono queda en la bitácora del turno y que correrlo dos veces no cambia nada;
  - el plazo de 90 días, que un turno abierto conserva el teléfono y que no se acepta un plazo de cero días;
  - que ni el público ni el personal pueden ejecutar las funciones.
- **En la nube:** la única fila vieja era un turno de prueba del 31/10 en la Barbería Prueba. La primera corrida (1:01 a. m. del 02/11) lo cierra como abandono.
- **Anotado:** el hash de la IP de cada turno no se borra. La base no deja editar un turno cerrado salvo para quitarle el teléfono, así que borrarlo necesita cambiar esa regla. Queda para la revisión de antiabuso.

## 2026-11-02 · La fila en línea se pausa sola ante un pico

- **Qué:** si entran 10 turnos en línea en 5 minutos, la fila en línea se pausa sola y el resumen del dueño lo avisa. Los turnos del QR de la puerta no cuentan y siguen entrando. Las reglas están en [ADR-015](decisiones.md#adr-015--pausa-automática-de-la-fila-en-línea-ante-picos).
- **Base** (migración `20261102125411_pausa_automatica.sql`):
  - columnas nuevas en `barberias`: `pico_turnos` (10 por omisión, de 3 a 100), `pausa_automatica_en` y `fila_remota_reanudada_en`;
  - el trigger `turnos_pausar_ante_pico` cuenta los turnos en línea de los últimos 5 minutos después de cada uno. Al llegar al límite pausa la fila en línea y deja el evento `pausa_automatica` en la bitácora del turno;
  - `pausar_fila_remota` borra la marca de pausa automática y, al abrir, reinicia el conteo.
- **Panel del dueño:** en el resumen aparece un recuadro con la hora de la pausa ("La fila en línea se pausó sola a las 9:03 a. m."), qué pasó y un botón para abrirla. En Configuración → Reglas de la fila hay un deslizador para el límite (de 3 a 50 turnos).
- **Pruebas:**
  - 24 de pgTAP nuevas (`08_pausa_automatica`), que pasan en la nube;
  - 7 de Vitest nuevas (293 en total).
  - `03_funciones` sube el límite de su barbería a 100: anota más de 10 turnos en línea seguidos para probar el límite por IP y la fila llena, y la pausa los habría tapado.
- **Probado en vivo** por la Edge Function real, con la Barbería Prueba y el límite en 3:
  - entraron 3 turnos en línea y el 4.º recibió 409 `fila_remota_pausada`;
  - el del local entró igual y la página publicada mostró "La fila en línea está pausada";
  - la bitácora guardó la pausa en el 3.er turno.
  - Después se cancelaron los 4 turnos de prueba y la barbería volvió a 10 con la fila abierta. El evento de la pausa sigue en la bitácora, porque no se borra.
- **Hallazgo en la CI:** Vitest fallaba en GitHub desde `cd26a47` (31/10), aunque pasaba en local. `configuracion.test.ts` importaba el cliente de Supabase, que se detiene sin `.env.local`, y la CI no lo tiene. Se arregló simulando el cliente (commit `916225a`). Las pruebas de la base sí pasaban en la CI, incluidas las del cierre del día.
- **Cierre del día en la nube:** la primera corrida (1:01 a. m. del 02/11) cerró el turno de prueba que esperaba desde el 31/10, y desde entonces corre cada hora sin errores. El borrado de las 3:40 a. m. también corrió.
- **Falta:** avisarle al dueño por push o por correo, y la prueba de carga de 50 turnos en un minuto.

## 2026-11-02 · Prueba de carga: 50 intentos en un minuto

- **Qué:** la prueba de carga del Sprint 4 en dos partes. Desde una sola computadora todos los intentos salen de la misma IP, y el límite por IP frena antes de que la pausa automática pueda saltar. Por eso el caso de muchas IPs se prueba en la base.
- **`scripts/carga.mjs`** (`npm run test:carga`, nuevo paso de la CI después del de concurrencia): manda 50 intentos a `unirse_a_fila` al mismo tiempo, repartidos en 20 conexiones.
  - Desde 50 IPs distintas entran exactamente 10, los otros 40 reciben `fila_remota_pausada`, la fila en línea queda pausada y la alerta queda una sola vez en la bitácora. En el local se siguen anotando.
  - Desde una sola IP entran exactamente 5, los otros 45 reciben `limite_ip` y la pausa no salta.
  - Antes de subirlo se simularon los dos casos en orden en la nube, dentro de una transacción que se deshizo, con el mismo resultado. La versión con conexiones simultáneas corre en la CI.
- **`scripts/carga-api.mjs`** (a mano, contra la Edge Function publicada y la Barbería Prueba): manda 50 intentos en tandas de 5, cada uno con `x-forwarded-for` y `x-real-ip` falsos.
  - Resultado del 02/11/2026: tardaron 9,9 segundos, entraron 5, los otros 45 recibieron 429 `limite_ip` y la fila en línea siguió abierta.
  - Los 5 quedaron con el mismo hash de IP, así que las IP falsas no sirvieron. El script canceló los 5 al final.
- **CI:** con el arreglo de la prueba de la pausa automática (`2ca90d9`) los tres trabajos de la CI quedaron en verde por primera vez desde el 31/10.
- **Seguridad:** el fallo 9 pasa a 🟩 y la prueba de carga sale de los pendientes antes del piloto.

## 2026-11-02 · Endpoint de salud y Sentry sin datos personales

- **Qué:** la Edge Function `salud` para UptimeRobot, y Sentry para los errores del frontend, listo para encenderse con un DSN. Las reglas están en [ADR-016](decisiones.md#adr-016--sentry-bajo-demanda-y-endpoint-de-salud-con-el-reloj-de-pg_cron).
- **Salud:**
  - migración `20261102134455_salud.sql`: `estado_salud()`, que solo puede llamar la clave secreta, dice si la base responde y si `vencer_tolerancia` corrió bien en los últimos 3 minutos;
  - Edge Function `salud` (versión 1, sin JWT), con la lógica en `supabase/functions/_shared/salud.ts`. Responde 200 o 503, acepta GET y HEAD, espera 5 segundos como máximo y no da detalles del error;
  - probada en la nube: GET dio 200 con `{"estado":"ok","base":"ok","tareas":"ok"}` en 1,4 segundos, HEAD dio 200 sin cuerpo y POST dio 405.
- **Sentry** (`@sentry/react` 11.8.0, la versión más nueva con más de dos semanas):
  - `app/src/lib/errores.ts` no carga nada sin `VITE_SENTRY_DSN`. Con DSN baja el SDK cuando la página termina de cargar o con el primer error de una ruta, y `ErrorDeRuta` reporta los errores de las rutas;
  - cada evento sale sin usuario, IP, cookies, encabezados ni parámetros de URL. Los códigos de turno pasan a `/t/:codigo`, los teléfonos y correos se reemplazan, y se descartan las migas de clics y de consola;
  - **hallazgo:** con `import("@sentry/react")` el archivo de Sentry pesaba 148 KB comprimido, porque traía el SDK entero (grabación de sesiones, trazas). `app/src/lib/sentry.ts` solo exporta `init` y `captureException`, y bajó a 30 KB. La carga inicial creció medio KB;
  - en la versión publicada (`6d1465e4`), sin DSN, la página no hizo ninguna petición a Sentry ni mostró errores en la consola.
- **Pruebas:** 24 de Vitest nuevas (317 en total): 8 de `salud` y 16 de la limpieza de errores. También 5 de pgTAP (`09_salud`), que pasan en la nube.
- **Dependencias:** `npm audit` no encuentra vulnerabilidades en las de producción. Las 3 que reporta son de `wrangler` (herramienta de despliegue) y ya estaban.
- **Falta (lo hace Gus):**
  - crear el proyecto de React en Sentry, poner su DSN en `.env.pruebas` y activar "Prevent Storing of IP Addresses";
  - crear el monitor de UptimeRobot con la URL de `salud`, cada 5 minutos.

## 2026-11-04 · Security Advisor y revisión del build

- **Qué:** la penúltima tarea del Sprint 4: revisar el Security Advisor de Supabase y buscar claves secretas en el build de producción. El fallo 1 de [seguridad](seguridad.md) pasa a 🟩.
- **Security Advisor** (`siguiente-pruebas`), sin hallazgos nuevos en la base:
  - las 4 funciones que ejecuta el público (`fila_publica`, `ver_turno`, `cancelar_turno`, `suscribir_push`) y las 9 del personal son las de [ADR-011](decisiones.md#adr-011--detalles-de-la-base-de-datos-del-sprint-1), punto 8. Las 9 del personal revisan el permiso por dentro;
  - `suscripciones_push` sin políticas, también aceptado ahí;
  - revisado a mano: las 9 funciones internas de `public` (`unirse_a_fila`, `cerrar_dia`, `estado_salud`…) solo las ejecuta la clave secreta, todas tienen `search_path` vacío, las 7 tablas tienen RLS y el público no lee ninguna. De `privado`, el personal solo ejecuta `es_miembro` y `es_dueno`, que usan las políticas;
  - **aviso nuevo de Auth:** la protección contra contraseñas filtradas (HaveIBeenPwned) está apagada. Solo existe en el plan Pro, así que queda para cuando se pague Pro;
  - rendimiento: dos índices sin uso (`miembros_barberia_idx`, `turnos_servicio_idx`). Se quedan: sirven a las llaves foráneas y el proyecto de pruebas casi no tiene tráfico.
- **Hallazgo en la CI:** el paso "El build no contiene claves secretas" pasaba sin revisar nada útil.
  - La CI compila sin `VITE_SUPABASE_URL`, `supabase.ts` lanza el error al cargar y Vite quita `supabase-js` entero (unos 200 KB). El build revisado no era el que se publica.
  - Con las variables reales, el mismo `grep "sb_secret_"` habría fallado: `supabase-js` trae ese texto para reconocer el prefijo de las claves.
- **`scripts/revisar-build.mjs`** (`npm run revisar:build`) reemplaza el `grep`. Busca claves `sb_secret_` completas, JWT con rol `service_role`, llaves privadas PEM, archivos `.map` y el valor de cada variable sin prefijo `VITE_` de los `.env` (por ejemplo la clave del barbero de prueba). Nunca imprime lo que encuentra.
  - Corre en la CI, ahora con un build que lleva valores de ejemplo para que incluya `supabase-js`, y dentro de `npm run check`, `npm run deploy` y `npm run deploy:pruebas`: si encuentra algo, no se publica.
  - Probado con los builds `production` y `pruebas` reales (39 archivos, sin hallazgos) y con uno al que se le plantaron una clave y un `.map` (3 fallas).
- **Pruebas:** 8 de Vitest nuevas (325 en total).
- **Falta (lo decide Gus):** en `supabase/config.toml` las contraseñas piden 6 caracteres como mínimo y sin requisitos, y el registro público de cuentas está encendido; falta mirar si la nube tiene lo mismo (Authentication → Sign In / Providers). Una cuenta nueva no ve nada sin membresía, pero conviene subir el mínimo y apagar el registro cuando lleguen las invitaciones por correo.

## 2026-11-04 · Producción lista para montarse y aviso de privacidad

- **Qué:** todo lo de producción que no necesita cuentas nuevas, para instalar la barbería piloto en cuanto existan el proyecto de Supabase y el dominio. La guía completa está en [produccion.md](produccion.md).
- **Aviso de privacidad** (`/privacidad`, `app/src/features/legal/Privacidad.tsx`):
  - dice qué se guarda (nombre, teléfono opcional, el turno, el hash de la IP y la suscripción de avisos), para qué y cuánto dura, qué no se hace y qué servicios participan;
  - el enlace está bajo el campo del teléfono, donde la persona da el dato, y abre en otra pestaña para no perder el formulario. También está en el pie del inicio;
  - el contacto para pedir que se borren los datos sale de `VITE_CONTACTO_PRIVACIDAD`; sin él, la página remite a la barbería.
- **Producción aparte de pruebas:**
  - `wrangler.jsonc` tiene el entorno `produccion` (Worker `nextcut-produccion`). Antes, `npm run deploy` publicaba sobre el mismo Worker que pruebas. Ese comando se cambia por `npm run deploy:produccion`;
  - **hallazgo:** Vite también carga `.env.local` (pruebas) al armar producción. Si a `.env.production.local` le faltaba una variable, el sitio de producción quedaba conectado a la base de pruebas sin aviso. `scripts/revisar-produccion.mjs` frena la publicación en ese caso, y también si falta una variable o si la clave de Turnstile es de prueba. Hoy, sin `.env.production.local`, frena con 4 problemas, como debe;
  - plantilla `.env.production.example` con las variables y de dónde sale cada una;
  - `supabase/config.toml` declara `salud` sin JWT, como ya estaba publicada en pruebas, para que un `functions deploy` a producción la deje igual.
- **Menú de demos fuera de producción:** al tocar el logo se abría el menú con todas las pantallas de demostración. En producción el logo lleva al inicio y Vite quita el menú del build. Comprobado en los dos builds. En desarrollo y en pruebas se queda.
- **Alta de la barbería piloto:** `scripts/produccion/alta-barberia.sql` crea barbería, dueño, barberos y servicios en una transacción, a partir de una cuenta creada en Supabase Auth. Probado en `siguiente-pruebas` dentro de una transacción deshecha: quedaron 3 servicios, 2 barberos y el dueño, `fila_publica` respondió y no quedó nada guardado.
- **Pruebas:** 8 de Vitest nuevas (333 en total): 6 de la revisión de variables y 2 de las rutas del aviso. Revisado en el navegador a 375 px: sin scroll lateral ni errores en la consola.
- **Falta (Gus):** decidir el espacio en Supabase y el dominio, y después seguir los pasos 1, 3, 5 y 6 de [produccion.md](produccion.md). Lo demás lo puede hacer el asistente.

## 2026-11-05 · Proyecto de producción en Supabase

- **Qué:** con `cms-opalo` pausado por el autor, se creó `nextcut-produccion` (`ctexofluhhsnsxenblgp`, us-east-1, plan gratuito, USD 0). Pasos 1, 2 y 4 de [produccion.md](produccion.md).
- **Base:** `npx supabase db push --linked` aplicó las 8 migraciones con sus mismas versiones.
  - **Hallazgo:** la CLI 2.122 ya no pide la contraseña de la base: con la sesión de `supabase login` entra con un rol temporal. Las migraciones de producción van con la CLI y no con el MCP, como se hizo en pruebas ([ADR-011](decisiones.md#adr-011--detalles-de-la-base-de-datos-del-sprint-1), punto 9), así las versiones coinciden sin tocarlas a mano.
  - Al terminar, la CLI quedó enlazada otra vez a `siguiente-pruebas`.
- **Funciones:** `unirse-a-fila`, `avisos` y `salud` publicadas con `functions deploy --use-api`.
- **Vault:** `avisos_url` y `avisos_clave` creados con SQL; la clave se generó dentro de la base.
- **Revisado:**
  - las 5 tareas de `pg_cron` existen;
  - las 7 tablas tienen RLS; el público ejecuta 4 funciones y el personal 13, igual que en pruebas;
  - el Security Advisor marca solo lo aceptado en ADR-011;
  - `salud` respondió 200 con `"tareas":"ok"`;
  - `unirse-a-fila` responde `{"error":"error"}`, porque todavía no tiene `TURNSTILE_SECRET` (falla cerrada, [ADR-013](decisiones.md#adr-013--detalles-de-anotarse-en-la-fila), punto 4);
  - `avisos` rechaza a quien no trae la clave (401).
- **`.env.production.local`** (no se sube) tiene la URL y la clave publicable. `scripts/revisar-produccion.mjs` ya solo frena por Turnstile y VAPID.
- **Falta (Gus):** elegir el dominio, desactivar las claves heredadas (`anon` sigue activa), crear el widget de Turnstile, cargar los secretos (paso 3) y configurar Auth (paso 5).
- **Dominio (decisión del autor):** producción se queda en `nextcut-produccion.gustavoapz07.workers.dev`, sin dominio propio. Los pasos de Turnstile, `ORIGENES_PERMITIDOS` y Auth usan esa dirección.
- **Configuración en los paneles** (con Claude in Chrome, en la sesión del autor):
  - Supabase Auth: Site URL de producción, redirección `https://nextcut-produccion.gustavoapz07.workers.dev/**`, registro de cuentas apagado y contraseña mínima de 10 caracteres con letras y números. Cada cambio se comprobó recargando la página;
  - las claves heredadas ya venían desactivadas en el proyecto nuevo: la API rechaza la `anon` con 401 y acepta la publicable;
  - Cloudflare: widget de Turnstile "NextCut produccion", modo Managed, sin pre-autorización. Su clave del sitio quedó en `.env.production.local`; la secreta no pasó por el asistente.
- **`scripts/produccion/secretos.mjs`:** pide la Secret Key de Turnstile sin mostrarla, genera `IP_SALT` y las claves VAPID, guarda los 5 secretos con la CLI y escribe la pública VAPID en `.env.production.local`. Ensayado con `--sin-guardar`: la clave no aparece en pantalla y rechaza una vacía o igual a la del sitio.
- **Publicada:** con los secretos cargados por el autor (`TURNSTILE_SECRET`, `ORIGENES_PERMITIDOS`, `IP_SALT` y las claves VAPID), `npm run deploy:produccion` pasó las dos revisiones y publicó `nextcut-produccion` (versión `8f84aaea`) en https://nextcut-produccion.gustavoapz07.workers.dev. Revisado desde afuera:
  - el inicio, `/privacidad` y las rutas de la SPA responden 200;
  - el build apunta al proyecto de producción y no tiene rastros del de pruebas;
  - `unirse-a-fila` acepta el origen de producción y rechaza otros (CORS), y Turnstile rechaza un token falso con 403. La clave secreta es la real: la de prueba lo habría dejado pasar;
  - en el navegador, el logo lleva al inicio sin el menú de demos y la consola no muestra errores.
- **Cuentas:** existe una cuenta confirmada, creada por el autor, todavía sin barbería.
- **Siguiente:** los datos de la barbería piloto para correr `scripts/produccion/alta-barberia.sql`.
- **Barbería de demostración** para las visitas a barberías: "Barbería Demo" (`/b/demo`, El Progreso), sin horario para que la fila esté abierta a cualquier hora, con 3 barberos sin cuenta (Carlos, Jorge y Kevin), 4 servicios (Corte L 150, Fade L 180, Corte + barba L 230 y Barba L 100) y la cuenta del autor como dueño. Revisado en la app publicada a 375 px: la fila pública, el formulario y `/entrar` cargan sin errores ni scroll lateral. No se anotó ningún turno de prueba en producción.
- **CI:** los commits `0a8be9e` y `fa3e58c` llegaron a GitHub. GitHub respondió dos veces `fatal error in commit_refs`, pero uno de los intentos sí había entrado. La CI pasó completa, incluida la revisión nueva del build con `supabase-js` adentro.

## 2026-11-06 · El dueño elige en qué silla atender

- **Qué:** al entrar con la cuenta de la Barbería Demo, el panel decía "Tu cuenta no tiene silla". El panel solo buscaba el barbero ligado a la cuenta, y el dueño no tenía uno. La base ya dejaba que el dueño atendiera cualquier silla de su barbería (`privado.puede_atender`), pero la pantalla no lo aprovechaba. La guía y `alta-barberia.sql` ya lo daban por hecho.
- **Panel** (`app/src/lib/panel.ts` y `PanelBarbero.tsx`):
  - si la cuenta es dueña y no tiene silla propia, el panel muestra las sillas de su barbería para elegir y un enlace al resumen del dueño;
  - la silla elegida queda en la URL (`/panel?silla=<id>`), así sobrevive a recargar. Una silla de otra barbería o inactiva vuelve a la lista;
  - el dueño ve "Cambiar silla" en el panel, aunque tenga una silla propia; un barbero que no es dueño no lo ve.
  - No cambian los permisos: cada acción la vuelve a revisar la base.
- **Pruebas:** 2 de Vitest nuevas (335 en total) y una de Playwright (`tests/e2e/dueno-silla.spec.ts`): con la cuenta de prueba, el dueño entra a su silla, cambia a otra y la silla elegida sigue después de recargar. `barbero.spec.ts` sigue pasando.
- **Publicado** en producción con la aprobación del autor (versión `79e70a82`). El archivo del panel en línea ya trae la pantalla para elegir silla.


## 2026-11-06 · Super admin y cuentas con contraseña temporal

- **Qué:** para dar de alta barberías durante las visitas sin abrir el editor SQL. Decisión en [ADR-017](decisiones.md#adr-017--super-admin-y-cuentas-con-contraseña-temporal-sin-correo); reemplaza la invitación por correo del Sprint 4.
- **Base** (`supabase/migrations/20261106150000_super_admin.sql`): tabla `privado.admins`, `soy_admin` y `admin_barberias` para la sesión del admin, y las funciones que usa la Edge Function, solo para `service_role`, que vuelven a revisar si quien pide es admin o dueño.
- **Edge Function `cuentas`** (`supabase/functions/cuentas/`, lógica en `_shared/cuentas.ts`): crea la barbería con su dueño, la cuenta de un barbero ligada a su silla, y pone contraseñas nuevas. Revisa la sesión con Auth, crea las cuentas ya confirmadas y devuelve una contraseña temporal una sola vez. Si algo falla después de crear la cuenta, la borra.
- **App:**
  - `/admin`: alta de barberías (la dirección se arma sola con el nombre) y lista con el correo del dueño, cuántos barberos tiene y "Nueva contraseña para el dueño";
  - Configuración → Barberos: "Crear cuenta" en cada silla sin cuenta y "Nueva contraseña" en las que tienen; en la del propio dueño dice "Es tu cuenta";
  - `/cambiar-clave`: quien entra con contraseña temporal elige la suya (10 o más, con letras y números) antes de llegar a su panel;
  - al entrar, el admin va a `/admin` si no pidió otra página;
  - el mensaje con la contraseña se copia listo para WhatsApp.
- **Script:** [`scripts/produccion/hacer-admin.sql`](../scripts/produccion/hacer-admin.sql) nombra admin a una cuenta. [produccion.md](produccion.md#9-barbería-piloto) explica el alta nueva.
- **Pruebas:** 26 de Vitest nuevas (361 en total). Revisado en el navegador contra la base de pruebas: sin sesión `/admin` y `/cambiar-clave` mandan a entrar; en Configuración aparecen "Es tu cuenta" y "Crear cuenta"; `/cambiar-clave` a 375 px sin scroll lateral; consola sin errores.
- **En pruebas** (07/11/2026, con permiso del autor): `db push` aplicó la migración y `functions deploy cuentas --use-api` publicó la función. Probado de punta a punta en `localhost:5173` con la cuenta de prueba nombrada admin por un rato:
  - el admin entra y cae en `/admin`; crea "Prueba Admin Él" (la dirección salió sola: `prueba-admin-el`) y recibe la contraseña temporal del dueño;
  - el dueño entra con ella, pasa por `/cambiar-clave` y llega a su configuración; agrega a Kevin, le crea la cuenta y la silla queda con "Nueva contraseña";
  - Kevin entra con su temporal, la cambia y ve "Hola, Kevin" en la silla 1;
  - con la sesión de Kevin, la función responde 403 a crear una barbería y a restablecer una contraseña, y no se creó ninguna cuenta;
  - consola sin errores. Al terminar se borraron la barbería y las 2 cuentas, y la cuenta de prueba dejó de ser admin.
- **Ajuste:** el panel del barbero manda a `/entrar?siguiente=/panel`; antes, sin destino, un admin habría terminado en `/admin`.
- **En producción** (07/11/2026, con permiso del autor): `db push` enlazado a `nextcut-produccion` aplicó la migración, `functions deploy cuentas --use-api` publicó la función (responde 401 sin sesión y acepta solo el origen de producción) y la cuenta del autor quedó como admin en `privado.admins`. La CLI quedó enlazada otra vez a `siguiente-pruebas`.
- **App publicada** (07/11/2026), después del commit de la paleta neutra (`5b2877f`): `npm run check` pasó completo (361 pruebas) y `npm run deploy:produccion` publicó `nextcut-produccion` (versión `e8c9d19b`). Revisado desde afuera: `/admin` sin sesión manda a `/entrar?siguiente=/admin` y la consola no muestra errores.
- **Corrección (07/11/2026):** al autor, que también es dueño de la Barbería Demo, la app lo llevaba a `/dueno`. Solo iba a `/admin` justo después de escribir la contraseña y sin destino pedido; con la sesión ya abierta, o entrando desde un enlace a `/dueno`, nunca. Ahora:
  - `/entrar` con la sesión abierta y sin destino pedido manda al admin a `/admin`;
  - el panel del dueño muestra "Administración" (en la barra lateral y en el encabezado del celular) cuando la cuenta es admin. Solo pregunta si es admin cuando la cuenta ya es dueña;
  - `soyAdmin` responde "no" si no hay conexión, en vez de fallar.
  Probado en local contra pruebas, con la cuenta de prueba como admin un momento: entrando por `/dueno` aparece "Administración", `/entrar` lleva a `/admin`, y sin admin el enlace desaparece. 361 pruebas. Publicado en producción (versión `1919b2fb`).
- **Falta (Gus):** dar de alta la primera barbería real desde `/admin`.

## 2026-11-06 · Paleta neutra y carga inicial

- **Qué:** rediseño de color pedido por el autor: menos chillón, mismas tipografías. Decisión en [ADR-018](decisiones.md#adr-018--paleta-monocroma-con-ladrillo-y-marino).
- **Paleta** (`app/src/index.css`): monocromo gris y grafito con ladrillo (`#a63d30`) y marino (`#2f4b73`) como acentos, elegidos por el autor entre cuatro parejas (la primera, arcilla y pizarra, se veía demasiado café); token nuevo `primario` / `sobre-primario` para la acción principal.
- **Pantallas:**
  - botón principal, "Llamar siguiente", imprimir cartel, guardar e invitar pasan de rojo a grafito;
  - "El primero libre" (fila pública) y la animación de "¡Listo!" al anotarse pasan de azul y rojo a grafito;
  - en el resumen del dueño, "Atendidos" va en grafito e "Ingresos" en blanco; solo "En fila ahora" lleva pizarra;
  - los colores escritos a mano (barra del navegador por estado del turno, QR, favicon, manifiesto, sombras) siguen la paleta nueva, y los íconos PNG se regeneraron.
- **Arreglo:** en el celular, la pastilla blanca de la pestaña activa del dueño quedaba flotando sobre el resumen y tapaba "Abandonos". La barra de abajo ahora es `layoutRoot` de motion.
- **Logo nuevo:** el boleto del turno (muescas, línea punteada, la "N" recortada y un punto ladrillo) reemplaza al poste mínimo, que se sentía genérico. El autor lo eligió entre cuatro ideas. Cambian `Marca.tsx` (exporta también `Boleto`), `favicon.svg`, `scripts/iconos.mjs` y los íconos PNG regenerados. Revisado en la fila, el turno, el panel, el dueño, el cartel QR y la TV, en claro y oscuro.
- **Carga:** el build precarga las dos fuentes en su versión latina y abre la conexión con Supabase desde el HTML (plugin `cargaInicial` en `vite.config.ts`). El resto ya estaba bien repartido: cada pantalla carga aparte.
- **Pruebas:** lint, tipos y Vitest (361) pasan. Revisado en el navegador a 375 px en claro y oscuro (fila pública, anotarse, turno, panel del barbero, entrar) y a 1280 px (TV, resumen y QR del dueño).

