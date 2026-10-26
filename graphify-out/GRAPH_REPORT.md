# Graph Report - Software Barbería  (2026-10-26)

## Corpus Check
- 11 files · ~15,282 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 180 nodes · 465 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 114 edges (avg confidence: 0.88)
- Token cost: 112,764 input · 0 output

## Community Hubs (Navigation)
- Stack, arquitectura y Sprint 0
- Problema, evidencia y validación
- Base de datos y seguridad
- Código de la app
- Documentación y decisiones
- Antiabuso y monitoreo
- Avisos y panel del barbero
- Herramientas de desarrollo
- Competencia y mercado

## God Nodes (most connected - your core abstractions)
1. `Plan de implementación` - 23 edges
2. `Seguridad` - 22 edges
3. `Fallo 2 · Endpoints expuestos` - 19 edges
4. `Investigación` - 15 edges
5. `ADR-007 · Anotarse por Edge Function y tiempo real solo con señales` - 15 edges
6. `Validación de campo` - 15 edges
7. `2026-10-26 · Sprint 0: base del proyecto` - 15 edges
8. `Registro de decisiones` - 14 edges
9. `Fallo 7 · Permisos excesivos` - 13 edges
10. `README de Siguiente` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Definición de abandono` --conceptually_related_to--> `Tasa de abandono`  [INFERRED]
  docs/validacion-campo.md → README.md
- `ADR-001 · Problema: fila física incierta` --references--> `Fila virtual híbrida`  [INFERRED]
  docs/decisiones.md → README.md
- `Cloudflare Turnstile` --conceptually_related_to--> `Fallo 2 · Endpoints expuestos`  [INFERRED]
  README.md → docs/seguridad.md
- `Desarrollo local` --conceptually_related_to--> `Pruebas pgTAP`  [INFERRED]
  README.md → docs/seguridad.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ciclo de validación de campo** — docs_validacion_campo_entrevistas_duenos, docs_validacion_campo_hoja_observacion, docs_validacion_campo_formula_perdida, docs_validacion_campo_criterios_decision [EXTRACTED 1.00]
- **Comparación de problemas candidatos** — docs_investigacion_p1_inasistencias, docs_investigacion_p2_fila_incierta, docs_investigacion_p3_caja_comisiones, docs_investigacion_p4_captacion_retencion, docs_investigacion_matriz_decision [EXTRACTED 1.00]
- **Flujo para anotarse en la fila** — docs_decisiones_edge_function_unirse_a_fila, readme_cloudflare_turnstile, docs_plan_implementacion_funciones_base, docs_plan_implementacion_broadcast_senales [EXTRACTED 1.00]
- **Pipeline de CI en cada PR** — docs_decisiones_biome, docs_plan_implementacion_typescript_7, docs_plan_implementacion_vitest, docs_seguridad_pruebas_pgtap, docs_plan_implementacion_playwright, docs_seguridad_gitleaks [EXTRACTED 1.00]
- **Secuencia de sprints hasta el piloto** — docs_plan_implementacion_sprint_0, docs_plan_implementacion_sprint_1, docs_plan_implementacion_sprint_2, docs_plan_implementacion_sprint_3, docs_plan_implementacion_sprint_4, docs_plan_implementacion_piloto [EXTRACTED 1.00]
- **Superficie pública del rol anon** — docs_seguridad_ver_turno, docs_seguridad_cancelar_turno, docs_decisiones_suscribir_push, docs_seguridad_vista_fila_publica [EXTRACTED 1.00]
- **Flujo seguro para anotarse a la fila** — docs_decisiones_edge_function_unirse_a_fila, readme_cloudflare_turnstile, docs_seguridad_unirse_a_fila, docs_seguridad_clave_idempotencia, docs_decisiones_canal_fila_broadcast [INFERRED 0.85]
- **Stack de la arquitectura v0.1 (Cloudflare + Supabase + Sentry)** — readme_cloudflare_workers, readme_cloudflare_turnstile, readme_supabase, readme_sentry, readme_arquitectura [EXTRACTED 1.00]
- **Canales de aviso gratuitos del MVP** — readme_notificaciones_sin_costo, readme_web_push, readme_boton_wa_me, readme_panel_barbero [EXTRACTED 1.00]
- **Controles de Lefthook antes del commit y del push** — docs_plan_implementacion_lefthook, docs_plan_implementacion_vitest, docs_plan_implementacion_typescript_7 [EXTRACTED 1.00]

## Communities (10 total, 1 thin omitted)

### Community 0 - "Stack, arquitectura y Sprint 0"
Cohesion: 0.13
Nodes (27): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Sprint 0: base del proyecto, Arquitectura detallada, Calendario de 8 semanas, Edge Function avisos, Herramientas de desarrollo, Lefthook (hooks de git), Módulo eta.ts compartido (+19 more)

### Community 1 - "Problema, evidencia y validación"
Cohesion: 0.13
Nodes (26): Cochrane 2013 · recordatorios por SMS, Escala de calidad de evidencia (A–O), Lu et al. 2013 · efecto de las filas en las compras, Maister · psicología de las filas, P1 Inasistencias (no-shows), P2 Fila física incierta, P3 Caja y comisiones, P4 Captación y retención (+18 more)

### Community 2 - "Base de datos y seguridad"
Cohesion: 0.18
Nodes (24): Edge Function unirse-a-fila, suscribir_push(codigo, secreto, suscripcion), Funciones de la base (security definer), Sprint 1 · Base de datos y seguridad, Adivinar códigos de turno, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), cancelar_turno(codigo, secreto) (+16 more)

### Community 3 - "Código de la app"
Cohesion: 0.11
Nodes (6): ErrorDeRuta(), NoEncontrado(), Inicio(), roles, raiz, rutas

### Community 4 - "Documentación y decisiones"
Cohesion: 0.24
Nodes (19): Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, Registro de decisiones, PHP + MySQL (alternativa descartada), Vercel (alternativa descartada), Investigación, Lo que no sabemos (+11 more)

### Community 5 - "Antiabuso y monitoreo"
Cohesion: 0.21
Nodes (11): Sprint 4 · Dueño, antiabuso y lanzamiento, Supabase MCP, Clave de idempotencia al anotarse, Fallo 8 · Manejo de errores, Fallo 9 · Rate limiting, Fallo 10 · Monitoreo, logs y alertas, Inundación de la fila, Llamar siguiente con FOR UPDATE SKIP LOCKED (+3 more)

### Community 6 - "Avisos y panel del barbero"
Cohesion: 0.24
Nodes (8): Cambio de precios de WhatsApp (1/10/2026), Resend (SMTP de Auth), Sprint 3 · Barbero, TV y avisos, Cuotas por barbería, Fallo 6 · Sin límite de tokens, Roles dueno y barbero, Botón wa.me, Panel del barbero

### Community 7 - "Herramientas de desarrollo"
Cohesion: 0.31
Nodes (8): Biome (lint y formato), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit), TypeScript 7, Borrado de teléfonos a los 90 días, gitleaks, Pendientes antes del piloto

### Community 8 - "Competencia y mercado"
Cohesion: 0.22
Nodes (9): AgendaPro, Booksy, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Fresha, Squire, Waitwhile (+1 more)

## Knowledge Gaps
- **14 isolated node(s):** `Booksy`, `Squire`, `DataReportal Digital 2026 Honduras`, `Zenoti encuesta a clientes 2025`, `Registro por entrevista` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 27 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Seguridad` connect `Documentación y decisiones` to `Stack, arquitectura y Sprint 0`, `Base de datos y seguridad`, `Antiabuso y monitoreo`, `Avisos y panel del barbero`, `Herramientas de desarrollo`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Fallo 2 · Endpoints expuestos` (e.g. with `Edge Function unirse-a-fila` and `Canal público fila:<barberia_id> (señal vacía)`) actually correct?**
  _`Fallo 2 · Endpoints expuestos` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Booksy`, `Squire`, `DataReportal Digital 2026 Honduras` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Stack, arquitectura y Sprint 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13306451612903225 - nodes in this community are weakly interconnected._
- **Why does `Investigación` connect `Documentación y decisiones` to `Competencia y mercado`, `Problema, evidencia y validación`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `ADR-007 · Anotarse por Edge Function y tiempo real solo con señales` (e.g. with `Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP)` and `Plan de implementación`) actually correct?**
  _`ADR-007 · Anotarse por Edge Function y tiempo real solo con señales` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Problema, evidencia y validación` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._