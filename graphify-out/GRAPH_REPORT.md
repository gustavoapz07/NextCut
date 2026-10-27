# Graph Report - NextCut  (2026-10-27)

## Corpus Check
- 46 files · ~44,744 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 487 nodes · 1382 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 151 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5e5428d3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Fallo 2 · Endpoints expuestos
- Herramientas y entorno de desarrollo
- 20261027140203_base_de_datos.sql
- Turno.tsx
- Seguridad
- Cliente de Supabase y prueba de riesgo
- Arquitectura detallada
- Fallo 7 · Permisos excesivos
- Variables de entorno
- cx
- concurrencia.mjs
- Stack v0.1 con versiones
- Sprint 4 · Dueño, antiabuso y lanzamiento
- ObservadorFalso

## God Nodes (most connected - your core abstractions)
1. `cx()` - 46 edges
2. `Franjas()` - 31 edges
3. `public.turnos` - 28 edges
4. `Seguridad` - 22 edges
5. `useTitulo()` - 21 edges
6. `Plan de implementación` - 20 edges
7. `Fallo 2 · Endpoints expuestos` - 19 edges
8. `Registro de decisiones` - 18 edges
9. `README de NextCut` - 18 edges
10. `PanelBarbero()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Modelo de negocio (hipótesis)` --references--> `Competencia`  [INFERRED]
  README.md → docs/investigacion.md
- `Turnos fantasma` --semantically_similar_to--> `P1 Inasistencias (no-shows)`  [INFERRED] [semantically similar]
  docs/seguridad.md → docs/investigacion.md
- `graphify (grafo de conocimiento)` --conceptually_related_to--> `Desarrollo local`  [INFERRED]
  docs/plan-implementacion.md → README.md
- `Stack v0.1 con versiones` --conceptually_related_to--> `Cloudflare Turnstile`  [INFERRED]
  docs/plan-implementacion.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ciclo de validación de campo** — docs_validacion_campo_entrevistas_duenos, docs_validacion_campo_hoja_observacion, docs_validacion_campo_formula_perdida, docs_validacion_campo_criterios_decision [EXTRACTED 1.00]
- **Comparación de problemas candidatos** — docs_investigacion_p1_inasistencias, docs_investigacion_p2_fila_incierta, docs_investigacion_p3_caja_comisiones, docs_investigacion_p4_captacion_retencion, docs_investigacion_matriz_decision [EXTRACTED 1.00]
- **Flujo de anotarse en la fila (Turnstile → Edge Function → Postgres → señal)** — docs_decisiones_edge_function_unirse_a_fila, readme_cloudflare_turnstile, docs_plan_implementacion_funciones_base, docs_plan_implementacion_broadcast_senales, docs_decisiones_adr_007 [EXTRACTED 1.00]
- **Canales de aviso sin costo variable del MVP** — readme_notificaciones_sin_costo, readme_web_push, readme_boton_wa_me, docs_decisiones_adr_003 [EXTRACTED 1.00]
- **Stack de la arquitectura con costo inicial $0** — readme_arquitectura, readme_supabase, readme_cloudflare_workers, readme_cloudflare_turnstile, readme_sentry [EXTRACTED 1.00]
- **Revisiones antes de cada commit (Lefthook + Biome + gitleaks + hooks de graphify)** — docs_plan_implementacion_lefthook, docs_plan_implementacion_biome, docs_plan_implementacion_gitleaks, docs_plan_implementacion_graphify [EXTRACTED 1.00]
- **Superficie pública del rol anon** — docs_seguridad_ver_turno, docs_seguridad_cancelar_turno, docs_decisiones_suscribir_push, docs_seguridad_vista_fila_publica [EXTRACTED 1.00]
- **Cuidado de claves y secretos (fallo 1) a lo largo de la bitácora** — docs_bitacora_clave_anon_heredada, docs_bitacora_nextcut_repositorio, docs_bitacora_arreglo_ci_gitleaks, docs_seguridad_f01_api_keys, readme_variables_entorno [INFERRED 0.85]
- **Mecanismo de avisos al cliente (por evento y por reloj)** — docs_plan_implementacion_edge_function_avisos, docs_plan_implementacion_pg_cron, docs_plan_implementacion_modulo_eta, readme_web_push, docs_decisiones_suscribir_push [INFERRED 0.85]

## Communities (19 total, 4 thin omitted)

### Community 0 - "Investigación"
Cohesion: 0.09
Nodes (33): AgendaPro, Booksy, Cochrane 2013 · recordatorios por SMS, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Investigación, Escala de calidad de evidencia (A–O) (+25 more)

### Community 1 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.15
Nodes (22): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Prueba de riesgo 1 · Broadcast público, Prueba de riesgo 3 · Turnstile + IP, Adivinar códigos de turno, cancelar_turno(codigo, secreto), codigo_publico aleatorio (+14 more)

### Community 2 - "Herramientas y entorno de desarrollo"
Cohesion: 0.15
Nodes (24): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+16 more)

### Community 3 - "20261027140203_base_de_datos.sql"
Cohesion: 0.07
Nodes (46): barberias_senal, barberos_senal, barberos_user_idx, eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, miembros_barberia_idx, privado.es_dueno() (+38 more)

### Community 4 - "Turno.tsx"
Cohesion: 0.06
Nodes (66): Boleto(), Confeti(), terminar(), ADELANTE, aparecer, Atendido(), Cancelado(), COLOR_BARRA (+58 more)

### Community 5 - "Seguridad"
Cohesion: 0.20
Nodes (23): Hallazgo: clave heredada anon activa, Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, Registro de decisiones, Nombre provisional "Siguiente" (alternativa descartada), Repositorio público gustavoapz07/NextCut (+15 more)

### Community 6 - "Cliente de Supabase y prueba de riesgo"
Cohesion: 0.12
Nodes (13): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+5 more)

### Community 7 - "Arquitectura detallada"
Cohesion: 0.16
Nodes (18): suscribir_push(codigo, secreto, suscripcion), Cambio de precios de WhatsApp (1/10/2026), Arquitectura detallada, Edge Function avisos, Módulo eta.ts compartido, pg_cron + pg_net, Playwright + axe, Prueba de riesgo 2 · Web Push (+10 more)

### Community 8 - "Fallo 7 · Permisos excesivos"
Cohesion: 0.18
Nodes (18): Funciones de la base (security definer), Sprint 1 · Base de datos y seguridad, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), Clave de idempotencia al anotarse, Clave publicable y clave secreta de Supabase, Fallo 7 · Permisos excesivos, Fallo 8 · Manejo de errores (+10 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "cx"
Cohesion: 0.06
Nodes (83): ErrorDeRuta(), BarraPoste(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, BotonMarca() (+75 more)

### Community 12 - "concurrencia.mjs"
Cohesion: 0.19
Nodes (12): anotar(), barberiaId, barberos, comoUsuario(), conectar(), preparar(), pruebaConBloqueo(), pruebaDobleEnvio() (+4 more)

### Community 13 - "Stack v0.1 con versiones"
Cohesion: 0.26
Nodes (9): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Cloudflare Workers (hosting estático), Límites del plan gratuito de Supabase (+1 more)

### Community 14 - "Sprint 4 · Dueño, antiabuso y lanzamiento"
Cohesion: 0.29
Nodes (8): Sprint 4 · Dueño, antiabuso y lanzamiento, Supabase MCP, Borrado de teléfonos a los 90 días, Fallo 9 · Rate limiting, gitleaks, Inundación de la fila, Pausa automática de la fila remota, Pendientes antes del piloto

### Community 15 - "ObservadorFalso"
Cohesion: 0.09
Nodes (3): raiz, rutas, ObservadorFalso

## Knowledge Gaps
- **20 isolated node(s):** `Nombre provisional "Siguiente" (alternativa descartada)`, `PHP + MySQL (alternativa descartada)`, `Booksy`, `Squire`, `Cuotas por barbería` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 118 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Seguridad` connect `Seguridad` to `Investigación`, `Fallo 2 · Endpoints expuestos`, `Herramientas y entorno de desarrollo`, `Arquitectura detallada`, `Fallo 7 · Permisos excesivos`, `Sprint 4 · Dueño, antiabuso y lanzamiento`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `Nombre provisional "Siguiente" (alternativa descartada)`, `PHP + MySQL (alternativa descartada)`, `Booksy` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.0858974358974359 - nodes in this community are weakly interconnected._
- **Why does `Investigación` connect `Investigación` to `Seguridad`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06885245901639345 - nodes in this community are weakly interconnected._
- **Why does `cx()` connect `cx` to `Turno.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `Turno.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0635814889336016 - nodes in this community are weakly interconnected._