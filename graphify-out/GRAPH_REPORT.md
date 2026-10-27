# Graph Report - NextCut  (2026-10-27)

## Corpus Check
- 40 files · ~34,076 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 406 nodes · 1230 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 151 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0819871f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Problema, evidencia y mercado
- Fallo 2 · Endpoints expuestos
- Herramientas y entorno de desarrollo
- Piezas.tsx
- Turno.tsx
- cx
- Cliente de Supabase y prueba de riesgo
- Franjas
- Variables de entorno
- PanelBarbero.tsx
- Unirse.tsx
- ObservadorFalso
- FilaPublica.tsx
- PantallaTv.tsx

## God Nodes (most connected - your core abstractions)
1. `cx()` - 46 edges
2. `Franjas()` - 31 edges
3. `Seguridad` - 22 edges
4. `useTitulo()` - 21 edges
5. `Plan de implementación` - 20 edges
6. `Fallo 2 · Endpoints expuestos` - 19 edges
7. `Registro de decisiones` - 18 edges
8. `README de NextCut` - 18 edges
9. `PanelBarbero()` - 17 edges
10. `Investigación` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `graphify (grafo de conocimiento)` --conceptually_related_to--> `Desarrollo local`  [INFERRED]
  docs/plan-implementacion.md → README.md
- `Definición de abandono` --conceptually_related_to--> `Tasa de abandono`  [INFERRED]
  docs/validacion-campo.md → README.md
- `ADR-003 · Notificaciones sin API de WhatsApp` --references--> `Web Push (PWA)`  [INFERRED]
  docs/decisiones.md → README.md
- `Sentry (errores sin datos personales)` --conceptually_related_to--> `Fallo 5 · Datos sensibles`  [INFERRED]
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

## Communities (15 total, 1 thin omitted)

### Community 0 - "Problema, evidencia y mercado"
Cohesion: 0.06
Nodes (67): Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, Registro de decisiones, Nombre provisional "Siguiente" (alternativa descartada), PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada) (+59 more)

### Community 1 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.06
Nodes (65): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, suscribir_push(codigo, secreto, suscripcion), Arquitectura detallada, Calendario de 8 semanas, Edge Function avisos (+57 more)

### Community 2 - "Herramientas y entorno de desarrollo"
Cohesion: 0.16
Nodes (23): Hallazgo: clave heredada anon activa, 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+15 more)

### Community 3 - "Piezas.tsx"
Cohesion: 0.20
Nodes (15): BotonMarca(), BotonPrincipal(), claseCampo, EnlacePrincipal(), Marquesina(), PIEZAS, RellenoPrincipal(), TONOS (+7 more)

### Community 4 - "Turno.tsx"
Cohesion: 0.14
Nodes (23): Confeti(), ADELANTE, aparecer, Atendido(), Cancelado(), COLOR_BARRA, DURACION, EnSilla() (+15 more)

### Community 5 - "cx"
Cohesion: 0.21
Nodes (13): FranjasProps, Marca(), AbrirMenu, MenuPantallas(), CodigoQr(), Estilo, ESTILOS, LayoutDueno() (+5 more)

### Community 6 - "Cliente de Supabase y prueba de riesgo"
Cohesion: 0.12
Nodes (13): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+5 more)

### Community 7 - "Franjas"
Cohesion: 0.44
Nodes (6): ErrorDeRuta(), Franjas(), Poste(), Cargando(), MarcoPrototipo(), NoEncontrado()

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "PanelBarbero.tsx"
Cohesion: 0.07
Nodes (49): Toast(), useToast(), Anillo(), BotonAccion(), colaInicial, enSilla, Fase, HojaTerminar() (+41 more)

### Community 12 - "Unirse.tsx"
Cohesion: 0.24
Nodes (17): Boleto(), Dato(), deslizar, esPreferencia(), Formulario(), elegirYSeguir(), ir(), Imprimiendo() (+9 more)

### Community 15 - "ObservadorFalso"
Cohesion: 0.09
Nodes (3): raiz, rutas, ObservadorFalso

### Community 17 - "FilaPublica.tsx"
Cohesion: 0.50
Nodes (6): BarraPoste(), Fila(), FilaPublica(), duracion(), numero, rango()

### Community 18 - "PantallaTv.tsx"
Cohesion: 0.17
Nodes (20): Digito(), DIGITOS, NumeroAnimado(), Props, Avatar(), FilaAhora(), HorasPico(), Indicador (+12 more)

## Knowledge Gaps
- **20 isolated node(s):** `Nombre provisional "Siguiente" (alternativa descartada)`, `Booksy`, `Squire`, `Cuotas por barbería`, `Fallo 4 · Prompt débil` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 95 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Seguridad` connect `Problema, evidencia y mercado` to `Fallo 2 · Endpoints expuestos`, `Herramientas y entorno de desarrollo`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `Nombre provisional "Siguiente" (alternativa descartada)`, `Booksy`, `Squire` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Problema, evidencia y mercado` be split into smaller, more focused modules?**
  _Cohesion score 0.059876543209876544 - nodes in this community are weakly interconnected._
- **Why does `cx()` connect `cx` to `Piezas.tsx`, `Turno.tsx`, `Franjas`, `PanelBarbero.tsx`, `Unirse.tsx`, `FilaPublica.tsx`, `PantallaTv.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Fallo 2 · Endpoints expuestos` be split into smaller, more focused modules?**
  _Cohesion score 0.06128364389233954 - nodes in this community are weakly interconnected._
- **Should `Turno.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14492753623188406 - nodes in this community are weakly interconnected._
- **Should `Cliente de Supabase y prueba de riesgo` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._