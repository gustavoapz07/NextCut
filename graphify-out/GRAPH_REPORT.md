# Graph Report - Software Barbería  (2026-10-26)

## Corpus Check
- 6 files · ~14,300 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 149 nodes · 401 edges · 8 communities
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.88)
- Token cost: 250,813 input · 0 output

## Community Hubs (Navigation)
- Investigación y documentación
- Base de datos y seguridad
- Stack, hosting y antiabuso
- Avisos, tiempo real y privacidad
- Producto y competencia
- Herramientas de desarrollo
- Validación, piloto y métricas
- Validación de entrada

## God Nodes (most connected - your core abstractions)
1. `Plan de implementación` - 22 edges
2. `Seguridad` - 22 edges
3. `Fallo 2 · Endpoints expuestos` - 18 edges
4. `Investigación` - 15 edges
5. `README de Siguiente` - 15 edges
6. `Registro de decisiones` - 15 edges
7. `2026-10-26 · Plan de implementación y graphify automático` - 14 edges
8. `Fallo 7 · Permisos excesivos` - 14 edges
9. `Validación de campo` - 14 edges
10. `ADR-007 · Anotarse por Edge Function y tiempo real solo con señales` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Turnos fantasma` --semantically_similar_to--> `P1 Inasistencias (no-shows)`  [INFERRED] [semantically similar]
  docs/seguridad.md → docs/investigacion.md
- `Siguiente (producto)` --conceptually_related_to--> `P2 Fila física incierta`  [INFERRED]
  README.md → docs/investigacion.md
- `Siguiente (producto)` --references--> `Problema elegido`  [INFERRED]
  README.md → docs/investigacion.md
- `ADR-001 · Problema: fila física incierta` --references--> `Fila virtual híbrida`  [INFERRED]
  docs/decisiones.md → README.md

## Hyperedges (group relationships)
- **Comparación de problemas candidatos** — docs_investigacion_p1_inasistencias, docs_investigacion_p2_fila_incierta, docs_investigacion_p3_caja_comisiones, docs_investigacion_p4_captacion_retencion, docs_investigacion_matriz_decision [EXTRACTED 1.00]
- **Secuencia de sprints hasta el piloto** — docs_plan_implementacion_sprint_0, docs_plan_implementacion_sprint_1, docs_plan_implementacion_sprint_2, docs_plan_implementacion_sprint_3, docs_plan_implementacion_sprint_4, docs_plan_implementacion_piloto [EXTRACTED 1.00]
- **Pipeline de CI en cada PR** — docs_decisiones_biome, docs_plan_implementacion_typescript_7, docs_plan_implementacion_vitest, docs_seguridad_pruebas_pgtap, docs_plan_implementacion_playwright, docs_seguridad_gitleaks [EXTRACTED 1.00]
- **Flujo para anotarse en la fila** — docs_decisiones_edge_function_unirse_a_fila, readme_cloudflare_turnstile, docs_plan_implementacion_funciones_base, docs_plan_implementacion_broadcast_senales [EXTRACTED 1.00]
- **Flujo seguro para anotarse a la fila** — docs_decisiones_edge_function_unirse_a_fila, readme_cloudflare_turnstile, docs_seguridad_unirse_a_fila, docs_seguridad_clave_idempotencia, docs_decisiones_canal_fila_broadcast [INFERRED 0.85]
- **Superficie pública del rol anon** — docs_seguridad_ver_turno, docs_seguridad_cancelar_turno, docs_decisiones_suscribir_push, docs_seguridad_vista_fila_publica [EXTRACTED 1.00]
- **Ciclo de validación de campo** — docs_validacion_campo_entrevistas_duenos, docs_validacion_campo_hoja_observacion, docs_validacion_campo_formula_perdida, docs_validacion_campo_criterios_decision [EXTRACTED 1.00]

## Communities (8 total, 0 thin omitted)

### Community 0 - "Investigación y documentación"
Cohesion: 0.19
Nodes (26): Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, Registro de decisiones, Cochrane 2013 · recordatorios por SMS, Investigación, Escala de calidad de evidencia (A–O), Lu et al. 2013 · efecto de las filas en las compras (+18 more)

### Community 1 - "Base de datos y seguridad"
Cohesion: 0.14
Nodes (27): Edge Function unirse-a-fila, suscribir_push(codigo, secreto, suscripcion), Funciones de la base (security definer), Sprint 1 · Base de datos y seguridad, Adivinar códigos de turno, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), cancelar_turno(codigo, secreto) (+19 more)

### Community 2 - "Stack, hosting y antiabuso"
Cohesion: 0.15
Nodes (19): PHP + MySQL (alternativa descartada), Vercel (alternativa descartada), Calendario de 8 semanas, Costos en planes gratuitos, Resend (SMTP de Auth), Sprint 0 · Entorno y pruebas de riesgo, Sprint 4 · Dueño, antiabuso y lanzamiento, Stack v0.1 con versiones (+11 more)

### Community 3 - "Avisos, tiempo real y privacidad"
Cohesion: 0.13
Nodes (20): Cambio de precios de WhatsApp (1/10/2026), Arquitectura detallada, Decisiones pendientes, Edge Function avisos, Módulo eta.ts compartido, pg_cron + pg_net, Riesgos técnicos, Sprint 3 · Barbero, TV y avisos (+12 more)

### Community 4 - "Producto y competencia"
Cohesion: 0.17
Nodes (12): AgendaPro, Booksy, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Fresha, Squire, Waitwhile (+4 more)

### Community 5 - "Herramientas de desarrollo"
Cohesion: 0.29
Nodes (11): Graphify automático (hooks de git y graphify_sync.py), Biome (lint y formato), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit), TypeScript 7, Herramientas de desarrollo, Lefthook (hooks de git) (+3 more)

### Community 6 - "Validación, piloto y métricas"
Cohesion: 0.29
Nodes (11): Piloto (2 sábados en 1 barbería), Definición de abandono, Entrevistas a dueños (Mom Test), Fórmula de pérdida mensual, Hoja de observación de sábado, Piloto gratis de un mes, Preguntas de precio, Registro por entrevista (+3 more)

### Community 7 - "Validación de entrada"
Cohesion: 0.40
Nodes (6): Playwright + axe, Sprint 2 · Cliente: fila pública y turno en vivo, Esquemas zod compartidos (react-hook-form + zod), Fallo 3 · Input sin validar, Nombre ofensivo o XSS en la TV, Validación con zod y dentro de la función

## Knowledge Gaps
- **14 isolated node(s):** `Zenoti encuesta a clientes 2025`, `Cochrane 2013 · recordatorios por SMS`, `Booksy`, `Squire`, `DataReportal Digital 2026 Honduras` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 15 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Seguridad` connect `Investigación y documentación` to `Base de datos y seguridad`, `Stack, hosting y antiabuso`, `Avisos, tiempo real y privacidad`, `Herramientas de desarrollo`, `Validación de entrada`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Fallo 2 · Endpoints expuestos` (e.g. with `Edge Function unirse-a-fila` and `Canal público fila:<barberia_id> (señal vacía)`) actually correct?**
  _`Fallo 2 · Endpoints expuestos` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Zenoti encuesta a clientes 2025`, `Cochrane 2013 · recordatorios por SMS`, `Booksy` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Base de datos y seguridad` be split into smaller, more focused modules?**
  _Cohesion score 0.14022988505747128 - nodes in this community are weakly interconnected._
- **Why does `Plan de implementación` connect `Investigación y documentación` to `Base de datos y seguridad`, `Stack, hosting y antiabuso`, `Avisos, tiempo real y privacidad`, `Herramientas de desarrollo`, `Validación, piloto y métricas`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Should `Avisos, tiempo real y privacidad` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Why does `Investigación` connect `Investigación y documentación` to `Producto y competencia`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._