# Graph Report - NextCut  (2026-10-26)

## Corpus Check
- 9 files · ~17,307 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 225 nodes · 540 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.87)
- Token cost: 278,458 input · 0 output

## Community Hubs (Navigation)
- Problema, evidencia y mercado
- Base de datos, seguridad y tiempo real
- Herramientas y entorno de desarrollo
- Código de la app
- Bitácora, decisiones y nombre
- Avisos, arquitectura y sprints
- Cliente de Supabase y prueba de riesgo
- Antiabuso, errores y lanzamiento
- Stack, hosting y costos
- Variables de entorno

## God Nodes (most connected - your core abstractions)
1. `Seguridad` - 22 edges
2. `Plan de implementación` - 20 edges
3. `Fallo 2 · Endpoints expuestos` - 19 edges
4. `Registro de decisiones` - 18 edges
5. `README de NextCut` - 18 edges
6. `Investigación` - 17 edges
7. `Validación de campo` - 15 edges
8. `ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local` - 14 edges
9. `Bitácora de cambios` - 14 edges
10. `Stack v0.1 con versiones` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Prueba de riesgo 2 · Web Push` --references--> `Web Push (PWA)`  [INFERRED]
  docs/plan-implementacion.md → README.md
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Stack v0.1 con versiones` --conceptually_related_to--> `Cloudflare Turnstile`  [INFERRED]
  docs/plan-implementacion.md → README.md
- `Arquitectura` --references--> `Stack v0.1 con versiones`  [INFERRED]
  README.md → docs/plan-implementacion.md
- `graphify (grafo de conocimiento)` --conceptually_related_to--> `Desarrollo local`  [INFERRED]
  docs/plan-implementacion.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de anotarse en la fila (Turnstile → Edge Function → Postgres → señal)** — docs_decisiones_edge_function_unirse_a_fila, readme_cloudflare_turnstile, docs_plan_implementacion_funciones_base, docs_plan_implementacion_broadcast_senales, docs_decisiones_adr_007 [EXTRACTED 1.00]
- **Revisiones antes de cada commit (Lefthook + Biome + gitleaks + hooks de graphify)** — docs_plan_implementacion_lefthook, docs_plan_implementacion_biome, docs_plan_implementacion_gitleaks, docs_plan_implementacion_graphify [EXTRACTED 1.00]
- **Mecanismo de avisos al cliente (por evento y por reloj)** — docs_plan_implementacion_edge_function_avisos, docs_plan_implementacion_pg_cron, docs_plan_implementacion_modulo_eta, readme_web_push, docs_decisiones_suscribir_push [INFERRED 0.85]
- **Canales de aviso sin costo variable del MVP** — readme_notificaciones_sin_costo, readme_web_push, readme_boton_wa_me, docs_decisiones_adr_003 [EXTRACTED 1.00]
- **Stack de la arquitectura con costo inicial $0** — readme_arquitectura, readme_supabase, readme_cloudflare_workers, readme_cloudflare_turnstile, readme_sentry [EXTRACTED 1.00]
- **Cuidado de claves y secretos (fallo 1) a lo largo de la bitácora** — docs_bitacora_clave_anon_heredada, docs_bitacora_nextcut_repositorio, docs_bitacora_arreglo_ci_gitleaks, docs_seguridad_f01_api_keys, readme_variables_entorno [INFERRED 0.85]
- **Comparación de problemas candidatos** — docs_investigacion_p1_inasistencias, docs_investigacion_p2_fila_incierta, docs_investigacion_p3_caja_comisiones, docs_investigacion_p4_captacion_retencion, docs_investigacion_matriz_decision [EXTRACTED 1.00]
- **Superficie pública del rol anon** — docs_seguridad_ver_turno, docs_seguridad_cancelar_turno, docs_decisiones_suscribir_push, docs_seguridad_vista_fila_publica [EXTRACTED 1.00]
- **Ciclo de validación de campo** — docs_validacion_campo_entrevistas_duenos, docs_validacion_campo_hoja_observacion, docs_validacion_campo_formula_perdida, docs_validacion_campo_criterios_decision [EXTRACTED 1.00]

## Communities (11 total, 2 thin omitted)

### Community 0 - "Problema, evidencia y mercado"
Cohesion: 0.09
Nodes (33): AgendaPro, Booksy, Cochrane 2013 · recordatorios por SMS, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Investigación, Escala de calidad de evidencia (A–O) (+25 more)

### Community 1 - "Base de datos, seguridad y tiempo real"
Cohesion: 0.12
Nodes (33): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, suscribir_push(codigo, secreto, suscripcion), Funciones de la base (security definer), Prueba de riesgo 3 · Turnstile + IP, Sprint 1 · Base de datos y seguridad (+25 more)

### Community 2 - "Herramientas y entorno de desarrollo"
Cohesion: 0.13
Nodes (27): Hallazgo: clave heredada anon activa, 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+19 more)

### Community 3 - "Código de la app"
Cohesion: 0.11
Nodes (6): ErrorDeRuta(), NoEncontrado(), Inicio(), roles, raiz, rutas

### Community 4 - "Bitácora, decisiones y nombre"
Cohesion: 0.27
Nodes (19): Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, Registro de decisiones, Nombre provisional "Siguiente" (alternativa descartada), Repositorio público gustavoapz07/NextCut, Posibles usos previos de NextCut en el sector (+11 more)

### Community 5 - "Avisos, arquitectura y sprints"
Cohesion: 0.16
Nodes (18): Cambio de precios de WhatsApp (1/10/2026), Arquitectura detallada, Calendario de 8 semanas, Edge Function avisos, Módulo eta.ts compartido, pg_cron + pg_net, Playwright + axe, Sprint 2 · Cliente: fila pública y turno en vivo (+10 more)

### Community 6 - "Cliente de Supabase y prueba de riesgo"
Cohesion: 0.12
Nodes (13): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+5 more)

### Community 7 - "Antiabuso, errores y lanzamiento"
Cohesion: 0.14
Nodes (16): Sprint 4 · Dueño, antiabuso y lanzamiento, Supabase MCP, Borrado de teléfonos a los 90 días, Clave de idempotencia al anotarse, Fallo 8 · Manejo de errores, Fallo 9 · Rate limiting, Fallo 10 · Monitoreo, logs y alertas, gitleaks (+8 more)

### Community 8 - "Stack, hosting y costos"
Cohesion: 0.26
Nodes (9): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Cloudflare Workers (hosting estático), Límites del plan gratuito de Supabase (+1 more)

## Knowledge Gaps
- **20 isolated node(s):** `PHP + MySQL (alternativa descartada)`, `pnpm (alternativa descartada)`, `Docker local (alternativa descartada)`, `Otra cuenta de Supabase (alternativa descartada)`, `Nombre provisional "Siguiente" (alternativa descartada)` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 48 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Seguridad` connect `Bitácora, decisiones y nombre` to `Problema, evidencia y mercado`, `Base de datos, seguridad y tiempo real`, `Herramientas y entorno de desarrollo`, `Avisos, arquitectura y sprints`, `Antiabuso, errores y lanzamiento`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Fallo 2 · Endpoints expuestos` (e.g. with `Edge Function unirse-a-fila` and `Canal público fila:<barberia_id> (señal vacía)`) actually correct?**
  _`Fallo 2 · Endpoints expuestos` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PHP + MySQL (alternativa descartada)`, `pnpm (alternativa descartada)`, `Docker local (alternativa descartada)` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Problema, evidencia y mercado` be split into smaller, more focused modules?**
  _Cohesion score 0.09041835357624832 - nodes in this community are weakly interconnected._
- **Why does `Investigación` connect `Problema, evidencia y mercado` to `Bitácora, decisiones y nombre`, `Avisos, arquitectura y sprints`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `README de NextCut` (e.g. with `Graphify automático (hooks de git y graphify_sync.py)` and `graphify (grafo de conocimiento)`) actually correct?**
  _`README de NextCut` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Base de datos, seguridad y tiempo real` be split into smaller, more focused modules?**
  _Cohesion score 0.11746031746031746 - nodes in this community are weakly interconnected._