# Graph Report - Software Barbería  (2026-10-26)

## Corpus Check
- 8 files · ~16,787 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 215 nodes · 511 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 74% EXTRACTED · 26% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.85)
- Token cost: 242,231 input · 0 output

## Community Hubs (Navigation)
- Base de datos, seguridad y tiempo real
- Problema, evidencia y mercado
- Herramientas y entorno de desarrollo
- Código de la app
- Stack, arquitectura y sprints
- Documentación, decisiones y piloto
- Cliente de Supabase y prueba de riesgo
- Panel del barbero y errores
- Variables de entorno

## God Nodes (most connected - your core abstractions)
1. `Plan de implementación` - 27 edges
2. `Seguridad` - 23 edges
3. `README de Siguiente` - 22 edges
4. `Fallo 2 · Endpoints expuestos` - 18 edges
5. `Investigación` - 17 edges
6. `Registro de decisiones` - 16 edges
7. `Validación de campo` - 15 edges
8. `ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local` - 15 edges
9. `2026-10-26 · Sprint 0: base del proyecto` - 15 edges
10. `Fallo 7 · Permisos excesivos` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Turnos fantasma` --semantically_similar_to--> `P1 Inasistencias (no-shows)`  [INFERRED] [semantically similar]
  docs/seguridad.md → docs/investigacion.md
- `Definición de abandono` --conceptually_related_to--> `Tasa de abandono`  [INFERRED]
  docs/validacion-campo.md → README.md
- `Desarrollo local` --conceptually_related_to--> `Pruebas pgTAP`  [INFERRED]
  README.md → docs/seguridad.md
- `Row Level Security (RLS)` --conceptually_related_to--> `Supabase (Postgres, Auth, Realtime, Edge Functions)`  [INFERRED]
  docs/seguridad.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ciclo de validación de campo** — docs_validacion_campo_entrevistas_duenos, docs_validacion_campo_hoja_observacion, docs_validacion_campo_formula_perdida, docs_validacion_campo_criterios_decision [EXTRACTED 1.00]
- **Comparación de problemas candidatos** — docs_investigacion_p1_inasistencias, docs_investigacion_p2_fila_incierta, docs_investigacion_p3_caja_comisiones, docs_investigacion_p4_captacion_retencion, docs_investigacion_matriz_decision [EXTRACTED 1.00]
- **Superficie pública del rol anon** — docs_seguridad_ver_turno, docs_seguridad_cancelar_turno, docs_decisiones_suscribir_push, docs_seguridad_vista_fila_publica [EXTRACTED 1.00]
- **Desarrollo en la nube con pgTAP en CI** — docs_decisiones_adr_008, docs_decisiones_proyecto_siguiente_pruebas, docs_plan_implementacion_proyecto_pruebas, docs_plan_implementacion_entornos_despliegue, docs_seguridad_pruebas_pgtap [INFERRED 0.85]
- **Flujo para anotarse en la fila** — docs_decisiones_edge_function_unirse_a_fila, readme_cloudflare_turnstile, docs_seguridad_f09_rate_limiting, docs_plan_implementacion_funciones_base, docs_plan_implementacion_broadcast_senales [INFERRED 0.85]
- **Revisiones antes de cada commit** — docs_plan_implementacion_lefthook, docs_plan_implementacion_biome, docs_plan_implementacion_gitleaks, docs_plan_implementacion_graphify [EXTRACTED 1.00]
- **Canales de aviso gratuitos del MVP** — readme_notificaciones_sin_costo, readme_web_push, readme_boton_wa_me, docs_decisiones_adr_003 [EXTRACTED 1.00]
- **Stack del MVP con costo inicial $0** — readme_arquitectura, readme_supabase, readme_cloudflare_workers, readme_cloudflare_turnstile, readme_sentry [EXTRACTED 1.00]
- **Avance del Sprint 0** — docs_plan_implementacion_sprint_0, docs_bitacora_sprint_0_base_proyecto, docs_bitacora_sin_docker_prueba_riesgo_1, docs_bitacora_pruebas_riesgo_sprint_0, docs_bitacora_prueba_riesgo_1_broadcast [EXTRACTED 1.00]

## Communities (10 total, 2 thin omitted)

### Community 0 - "Base de datos, seguridad y tiempo real"
Cohesion: 0.10
Nodes (40): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, suscribir_push(codigo, secreto, suscripcion), Prueba de riesgo 1 · Broadcast público, Sprint 1 · Base de datos y seguridad (+32 more)

### Community 1 - "Problema, evidencia y mercado"
Cohesion: 0.10
Nodes (32): AgendaPro, Booksy, Cochrane 2013 · recordatorios por SMS, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Investigación, Escala de calidad de evidencia (A–O) (+24 more)

### Community 2 - "Herramientas y entorno de desarrollo"
Cohesion: 0.11
Nodes (29): Hallazgo: clave heredada anon activa, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit), Otra cuenta de Supabase (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada) (+21 more)

### Community 3 - "Código de la app"
Cohesion: 0.11
Nodes (6): ErrorDeRuta(), NoEncontrado(), Inicio(), roles, raiz, rutas

### Community 4 - "Stack, arquitectura y sprints"
Cohesion: 0.17
Nodes (18): 2026-10-26 · Sprint 0: base del proyecto, PHP + MySQL (alternativa descartada), Vercel (alternativa descartada), Arquitectura detallada, Edge Function avisos, Integración y despliegue (local, vista previa, producción), pg_cron + pg_net, Resend (SMTP de Auth) (+10 more)

### Community 5 - "Documentación, decisiones y piloto"
Cohesion: 0.21
Nodes (18): Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, Registro de decisiones, Cambio de precios de WhatsApp (1/10/2026), Definición de terminado, Plan de implementación, Piloto (2 sábados en 1 barbería) (+10 more)

### Community 6 - "Cliente de Supabase y prueba de riesgo"
Cohesion: 0.12
Nodes (13): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+5 more)

### Community 7 - "Panel del barbero y errores"
Cohesion: 0.20
Nodes (9): Clave de idempotencia al anotarse, Fallo 8 · Manejo de errores, Llamar siguiente con FOR UPDATE SKIP LOCKED, Roles dueno y barbero, Sentry, Botón wa.me, Límites del plan gratuito de Supabase, Panel del barbero (+1 more)

## Knowledge Gaps
- **17 isolated node(s):** `Booksy`, `Squire`, `DataReportal Digital 2026 Honduras`, `Zenoti encuesta a clientes 2025`, `Registro por entrevista` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 45 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Seguridad` connect `Documentación, decisiones y piloto` to `Base de datos, seguridad y tiempo real`, `Problema, evidencia y mercado`, `Herramientas y entorno de desarrollo`, `Stack, arquitectura y sprints`, `Panel del barbero y errores`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Fallo 2 · Endpoints expuestos` (e.g. with `Canal público fila:<barberia_id> (señal vacía)` and `Tabla turnos (codigo_publico aleatorio)`) actually correct?**
  _`Fallo 2 · Endpoints expuestos` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Booksy`, `Squire`, `DataReportal Digital 2026 Honduras` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Base de datos, seguridad y tiempo real` be split into smaller, more focused modules?**
  _Cohesion score 0.09513742071881606 - nodes in this community are weakly interconnected._
- **Why does `Investigación` connect `Problema, evidencia y mercado` to `Documentación, decisiones y piloto`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Should `Problema, evidencia y mercado` be split into smaller, more focused modules?**
  _Cohesion score 0.09957325746799431 - nodes in this community are weakly interconnected._
- **Why does `Plan de implementación` connect `Documentación, decisiones y piloto` to `Base de datos, seguridad y tiempo real`, `Problema, evidencia y mercado`, `Herramientas y entorno de desarrollo`, `Stack, arquitectura y sprints`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._