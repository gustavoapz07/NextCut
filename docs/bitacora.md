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
