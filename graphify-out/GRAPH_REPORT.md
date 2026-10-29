# Graph Report - NextCut  (2026-10-28)

## Corpus Check
- 62 files · ~57,693 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 635 nodes · 1740 edges · 22 communities (14 shown, 8 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 158 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a4636330`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- enVivo.ts
- main.tsx
- 20261027140203_base_de_datos.sql
- Turnstile.tsx
- database.types.ts
- ref_supabase_supabase_js
- Fallo 2 · Endpoints expuestos
- Variables de entorno
- Unirse.tsx
- concurrencia.mjs
- FilaPublica.tsx
- ref_vitest
- router.test.tsx
- Turno.tsx
- _shared/unirse.ts
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
- `Turnos fantasma` --semantically_similar_to--> `P1 Inasistencias (no-shows)`  [INFERRED] [semantically similar]
  docs/seguridad.md → docs/investigacion.md
- `Definición de abandono` --conceptually_related_to--> `Tasa de abandono`  [INFERRED]
  docs/validacion-campo.md → README.md
- `ADR-003 · Notificaciones sin API de WhatsApp` --references--> `Web Push (PWA)`  [INFERRED]
  docs/decisiones.md → README.md
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

## Communities (22 total, 8 thin omitted)

### Community 0 - "Investigación"
Cohesion: 0.05
Nodes (85): Hallazgo: clave heredada anon activa, Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato) (+77 more)

### Community 1 - "enVivo.ts"
Cohesion: 0.17
Nodes (13): Database, EstadoFila, EstadoTurno, ADR-0007, useFilaPublica(), useSenalFila(), useTurno(), supabase (+5 more)

### Community 3 - "20261027140203_base_de_datos.sql"
Cohesion: 0.07
Nodes (46): barberias_senal, barberos_senal, barberos_user_idx, eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, miembros_barberia_idx, privado.es_dueno() (+38 more)

### Community 5 - "Turnstile.tsx"
Cohesion: 0.33
Nodes (4): ApiTurnstile, cargarTurnstile(), Turnstile(), Window

### Community 6 - "database.types.ts"
Cohesion: 0.20
Nodes (9): CompositeTypes, Constants, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables, TablesInsert (+1 more)

### Community 8 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.06
Nodes (70): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), suscribir_push(codigo, secreto, suscripcion), Vercel (alternativa descartada) (+62 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Unirse.tsx"
Cohesion: 0.05
Nodes (99): ErrorDeRuta(), BarraPoste(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, BotonMarca() (+91 more)

### Community 12 - "concurrencia.mjs"
Cohesion: 0.19
Nodes (12): anotar(), barberiaId, barberos, comoUsuario(), conectar(), preparar(), pruebaConBloqueo(), pruebaDobleEnvio() (+4 more)

### Community 13 - "FilaPublica.tsx"
Cohesion: 0.08
Nodes (44): Miembro, FilaPrototipo(), FilaPublica(), FilaReal(), Tarjeta(), VistaFila(), VistaFilaProps, FormularioReal() (+36 more)

### Community 19 - "router.test.tsx"
Cohesion: 0.33
Nodes (5): TurnoPublico, { rpc, invoke }, filaDeEjemplo(), hace(), turnoDeEjemplo()

### Community 24 - "Turno.tsx"
Cohesion: 0.06
Nodes (59): Confeti(), SinConexion(), Anillo(), TarjetaActual(), Acciones, ADELANTE, aparecer, Atendido() (+51 more)

### Community 33 - "_shared/unirse.ts"
Cohesion: 0.06
Nodes (37): Fuente, anotarse(), claveDe(), ErrorUnirse, esCodigo(), guardarSecreto(), leerSecreto(), MENSAJES (+29 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

## Knowledge Gaps
- **24 isolated node(s):** `ADR-0007`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `Nombre provisional "Siguiente" (alternativa descartada)` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 168 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cx()` connect `Unirse.tsx` to `Turno.tsx`, `FilaPublica.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `ADR-0007`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.0504950495049505 - nodes in this community are weakly interconnected._
- **Why does `Seguridad` connect `Investigación` to `Fallo 2 · Endpoints expuestos`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06885245901639345 - nodes in this community are weakly interconnected._
- **Why does `entradaEta()` connect `FilaPublica.tsx` to `Turno.tsx`, `_shared/unirse.ts`, `Unirse.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `Fallo 2 · Endpoints expuestos` be split into smaller, more focused modules?**
  _Cohesion score 0.05789473684210526 - nodes in this community are weakly interconnected._