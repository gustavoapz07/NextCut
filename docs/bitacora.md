# Bitácora de cambios

**Proyecto:** [Siguiente](../README.md)

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
