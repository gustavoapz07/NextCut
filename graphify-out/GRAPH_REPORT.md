# Graph Report - NextCut  (2026-10-28)

## Corpus Check
- 65 files · ~59,145 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 647 nodes · 1751 edges · 29 communities (23 shown, 6 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 158 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `982d7114`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Seguridad
- Arquitectura detallada
- 20261027140203_base_de_datos.sql
- eta.ts
- ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local
- database.types.ts
- ref_supabase_supabase_js
- Fallo 2 · Endpoints expuestos
- Variables de entorno
- Unirse.tsx
- concurrencia.mjs
- Unirse.tsx
- ADR-007 · Anotarse por Edge Function y tiempo real solo con señales
- router.test.tsx
- Stack v0.1 con versiones
- fila.spec.ts
- _shared/unirse.ts
- index.ts
- unirse.test.ts
- Turno.tsx
- manejarUnirse
- lib/unirse.ts
- imports

## God Nodes (most connected - your core abstractions)
1. `cx()` - 46 edges
2. `Franjas()` - 31 edges
3. `public.turnos` - 28 edges
4. `useTitulo()` - 24 edges
5. `Seguridad` - 22 edges
6. `Plan de implementación` - 20 edges
7. `Fallo 2 · Endpoints expuestos` - 19 edges
8. `Formulario()` - 18 edges
9. `Registro de decisiones` - 18 edges
10. `README de NextCut` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Modelo de negocio (hipótesis)` --references--> `Competencia`  [INFERRED]
  README.md → docs/investigacion.md
- `Integración y despliegue (local, vista previa, producción)` --conceptually_related_to--> `Cloudflare Workers (hosting estático)`  [INFERRED]
  docs/plan-implementacion.md → README.md
- `graphify (grafo de conocimiento)` --conceptually_related_to--> `Desarrollo local`  [INFERRED]
  docs/plan-implementacion.md → README.md
- `Variables de entorno (.env.local)` --conceptually_related_to--> `Fallo 1 · API keys en el código`  [INFERRED]
  README.md → docs/seguridad.md

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

## Communities (29 total, 6 thin omitted)

### Community 0 - "Investigación"
Cohesion: 0.08
Nodes (37): AgendaPro, Booksy, Cochrane 2013 · recordatorios por SMS, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Investigación, Escala de calidad de evidencia (A–O) (+29 more)

### Community 1 - "Seguridad"
Cohesion: 0.20
Nodes (23): Hallazgo: clave heredada anon activa, Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, Registro de decisiones, Nombre provisional "Siguiente" (alternativa descartada), Repositorio público gustavoapz07/NextCut (+15 more)

### Community 2 - "Arquitectura detallada"
Cohesion: 0.14
Nodes (21): Cambio de precios de WhatsApp (1/10/2026), Arquitectura detallada, Calendario de 8 semanas, Edge Function avisos, Módulo eta.ts compartido, pg_cron + pg_net, Playwright + axe, Prueba de riesgo 2 · Web Push (+13 more)

### Community 3 - "20261027140203_base_de_datos.sql"
Cohesion: 0.07
Nodes (46): barberias_senal, barberos_senal, barberos_user_idx, eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, miembros_barberia_idx, privado.es_dueno() (+38 more)

### Community 4 - "eta.ts"
Cohesion: 0.14
Nodes (18): BarberoEta, DURACION_POR_DEFECTO, DURACION_VALIDA, duracionDe(), EntradaEta, estimarNuevo(), minutosHastaLibre(), promedio() (+10 more)

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.19
Nodes (18): 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit), Otra cuenta de Supabase (alternativa descartada), pnpm (alternativa descartada) (+10 more)

### Community 6 - "database.types.ts"
Cohesion: 0.17
Nodes (11): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+3 more)

### Community 8 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.12
Nodes (30): Funciones de la base (security definer), Sprint 1 · Base de datos y seguridad, Adivinar códigos de turno, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), cancelar_turno(codigo, secreto), Clave de idempotencia al anotarse, Clave publicable y clave secreta de Supabase (+22 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Unirse.tsx"
Cohesion: 0.05
Nodes (102): ErrorDeRuta(), BarraPoste(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, BotonMarca() (+94 more)

### Community 12 - "concurrencia.mjs"
Cohesion: 0.19
Nodes (12): anotar(), barberiaId, barberos, comoUsuario(), conectar(), preparar(), pruebaConBloqueo(), pruebaDobleEnvio() (+4 more)

### Community 13 - "Unirse.tsx"
Cohesion: 0.05
Nodes (72): Cargando(), NoEncontrado(), SinConexion(), ApiTurnstile, cargarTurnstile(), Turnstile(), Window, Miembro (+64 more)

### Community 14 - "ADR-007 · Anotarse por Edge Function y tiempo real solo con señales"
Cohesion: 0.23
Nodes (13): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Sprint 0: base del proyecto, Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, suscribir_push(codigo, secreto, suscripcion), gitleaks (secretos), Prueba de riesgo 1 · Broadcast público (+5 more)

### Community 15 - "router.test.tsx"
Cohesion: 0.08
Nodes (4): raiz, rutas, { rpc, invoke }, ObservadorFalso

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.20
Nodes (13): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Borrado de teléfonos a los 90 días, gitleaks (+5 more)

### Community 20 - "fila.spec.ts"
Cohesion: 0.20
Nodes (4): datosTurno(), encabezados, Fila, hex()

### Community 21 - "_shared/unirse.ts"
Cohesion: 0.20
Nodes (9): encabezadosCors(), ERRORES_DE_LA_BASE, esquemaNombre, esquemaTelefono, esquemaTurnoCreado, esquemaUnirse, ESTADO_HTTP, RespuestaRpc (+1 more)

### Community 22 - "index.ts"
Cohesion: 0.22
Nodes (6): hmacHex(), verificarTurnstile(), admin, clave, origenes, ADR-0007

### Community 23 - "unirse.test.ts"
Cohesion: 0.25
Nodes (6): limpiarNombre(), obtenerIp(), enviar(), fila, peticion(), URL_TURNSTILE

### Community 24 - "Turno.tsx"
Cohesion: 0.09
Nodes (31): Boleto(), Acciones, ADELANTE, aparecer, Atendido(), Cancelar(), COLOR_BARRA, DatosTurno (+23 more)

### Community 25 - "manejarUnirse"
Cohesion: 0.39
Nodes (3): Dependencias, errorDeLaBase(), manejarUnirse()

### Community 33 - "lib/unirse.ts"
Cohesion: 0.21
Nodes (11): anotarse(), claveDe(), ErrorUnirse, esCodigo(), guardarSecreto(), leerSecreto(), MENSAJES, ADR-0007 (+3 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

## Knowledge Gaps
- **24 isolated node(s):** `ADR-0007`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `Docker local (alternativa descartada)` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 176 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cx()` connect `Unirse.tsx` to `Turno.tsx`, `Unirse.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `ADR-0007`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.07822410147991543 - nodes in this community are weakly interconnected._
- **Why does `Seguridad` connect `Seguridad` to `Investigación`, `Arquitectura detallada`, `Fallo 2 · Endpoints expuestos`, `ADR-007 · Anotarse por Edge Function y tiempo real solo con señales`, `Stack v0.1 con versiones`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.1383399209486166 - nodes in this community are weakly interconnected._
- **Why does `entradaEta()` connect `Unirse.tsx` to `Turno.tsx`, `manejarUnirse`, `_shared/unirse.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06885245901639345 - nodes in this community are weakly interconnected._