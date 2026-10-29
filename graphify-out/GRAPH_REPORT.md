# Graph Report - NextCut  (2026-10-28)

## Corpus Check
- 74 files · ~66,183 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 727 nodes · 1989 edges · 34 communities (28 shown, 6 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 160 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `40ed457a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Seguridad
- Arquitectura detallada
- 20261027140203_base_de_datos.sql
- datos.ts
- ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local
- database.types.ts
- ref_supabase_supabase_js
- Fallo 2 · Endpoints expuestos
- Variables de entorno
- Unirse.tsx
- concurrencia.mjs
- Unirse.tsx
- panel.test.tsx
- eta.ts
- Stack v0.1 con versiones
- e2e/utilidades.ts
- FilaPublica.tsx
- PanelBarbero.tsx
- Unirse.tsx
- Turno.tsx
- enVivo.ts
- panel.ts
- Fallo 2 · Endpoints expuestos
- Configuracion.tsx
- Turnstile.tsx
- _shared/unirse.ts
- imports

## God Nodes (most connected - your core abstractions)
1. `cx()` - 47 edges
2. `Franjas()` - 31 edges
3. `public.turnos` - 28 edges
4. `useTitulo()` - 26 edges
5. `PanelReal()` - 22 edges
6. `Seguridad` - 22 edges
7. `Plan de implementación` - 20 edges
8. `Fallo 2 · Endpoints expuestos` - 19 edges
9. `Formulario()` - 18 edges
10. `Registro de decisiones` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Modelo de negocio (hipótesis)` --references--> `Competencia`  [INFERRED]
  README.md → docs/investigacion.md
- `Turnos fantasma` --semantically_similar_to--> `P1 Inasistencias (no-shows)`  [INFERRED] [semantically similar]
  docs/seguridad.md → docs/investigacion.md
- `Definición de abandono` --conceptually_related_to--> `Tasa de abandono`  [INFERRED]
  docs/validacion-campo.md → README.md
- `graphify (grafo de conocimiento)` --conceptually_related_to--> `Desarrollo local`  [INFERRED]
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

## Communities (34 total, 6 thin omitted)

### Community 0 - "Investigación"
Cohesion: 0.10
Nodes (34): AgendaPro, Booksy, Cochrane 2013 · recordatorios por SMS, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Investigación, Escala de calidad de evidencia (A–O) (+26 more)

### Community 1 - "Seguridad"
Cohesion: 0.24
Nodes (19): Hallazgo: clave heredada anon activa, Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, Registro de decisiones, Nombre provisional "Siguiente" (alternativa descartada), Repositorio público gustavoapz07/NextCut (+11 more)

### Community 2 - "Arquitectura detallada"
Cohesion: 0.13
Nodes (22): suscribir_push(codigo, secreto, suscripcion), Cambio de precios de WhatsApp (1/10/2026), Arquitectura detallada, Calendario de 8 semanas, Edge Function avisos, Módulo eta.ts compartido, pg_cron + pg_net, Playwright + axe (+14 more)

### Community 3 - "20261027140203_base_de_datos.sql"
Cohesion: 0.07
Nodes (46): barberias_senal, barberos_senal, barberos_user_idx, eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, miembros_barberia_idx, privado.es_dueno() (+38 more)

### Community 4 - "datos.ts"
Cohesion: 0.15
Nodes (20): useIntervalo(), usePantallaEncendida(), Barbero, barberos, buscarServicio(), filaInicial, IdBarbero, nombresNuevos (+12 more)

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.15
Nodes (24): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+16 more)

### Community 6 - "database.types.ts"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 7 - "ref_supabase_supabase_js"
Cohesion: 0.22
Nodes (6): EstadoSesion, MENSAJES_ENTRAR, ResultadoEntrar, supabase, resultado, supabase

### Community 8 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (20): Funciones de la base (security definer), Riesgos técnicos, Sprint 1 · Base de datos y seguridad, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), Clave de idempotencia al anotarse, Clave publicable y clave secreta de Supabase, Fallo 7 · Permisos excesivos (+12 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Unirse.tsx"
Cohesion: 0.08
Nodes (55): ErrorDeRuta(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, BotonMarca(), MarcoPrototipo() (+47 more)

### Community 12 - "concurrencia.mjs"
Cohesion: 0.19
Nodes (12): anotar(), barberiaId, barberos, comoUsuario(), conectar(), preparar(), pruebaConBloqueo(), pruebaDobleEnvio() (+4 more)

### Community 13 - "Unirse.tsx"
Cohesion: 0.17
Nodes (15): Boleto(), Dato(), Formulario(), elegirYSeguir(), ir(), Imprimiendo(), Opcion(), PasoBarbero() (+7 more)

### Community 14 - "panel.test.tsx"
Cohesion: 0.20
Nodes (5): BARBERIA, BARBERO, falso, SERVICIOS, TurnoPersonal

### Community 15 - "eta.ts"
Cohesion: 0.05
Nodes (43): VistaTv, detalleBarbero(), ResumenBarbero, resumirFila(), TONOS, ANUNCIO_MS, columnasTv(), ColumnaTv (+35 more)

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.27
Nodes (10): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Arquitectura, Cloudflare Workers (hosting estático) (+2 more)

### Community 20 - "e2e/utilidades.ts"
Cohesion: 0.23
Nodes (14): anotarPorApi(), BARBERO_CLAVE, BARBERO_CORREO, cancelarPorApi(), CLAVE, datosTurno(), encabezados, Fila (+6 more)

### Community 21 - "FilaPublica.tsx"
Cohesion: 0.23
Nodes (15): BarraPoste(), FilaPrototipo(), FilaPublica(), Tarjeta(), VistaFila(), PantallaTv(), TableroPrototipo(), duracion() (+7 more)

### Community 22 - "PanelBarbero.tsx"
Cohesion: 0.13
Nodes (18): AccionesPanel, ActualVista, colaInicial, enSilla, Fase, METODOS, minutosDesde(), PanelBarbero() (+10 more)

### Community 23 - "Unirse.tsx"
Cohesion: 0.22
Nodes (20): Cargando(), NoEncontrado(), SinConexion(), FilaReal(), TurnoReal(), deslizar, Envio, Espera (+12 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.09
Nodes (35): Anillo(), TarjetaActual(), Acciones, ADELANTE, aparecer, Atendido(), Cancelar(), COLOR_BARRA (+27 more)

### Community 25 - "enVivo.ts"
Cohesion: 0.16
Nodes (15): EstadoFila, EstadoTurno, ADR-0007, useSenalFila(), useTurno(), ConAudioViejo, crearContexto(), prepararSonido() (+7 more)

### Community 27 - "panel.ts"
Cohesion: 0.16
Nodes (19): PanelReal(), BarberiaPanel, BarberoPanel, cargarPanel(), diaEn(), ejecutar(), empezarTurno(), ErrorAccion (+11 more)

### Community 28 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (26): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Prueba de riesgo 1 · Broadcast público, Prueba de riesgo 3 · Turnstile + IP, Adivinar códigos de turno, Borrado de teléfonos a los 90 días, cancelar_turno(codigo, secreto) (+18 more)

### Community 30 - "Configuracion.tsx"
Cohesion: 0.11
Nodes (22): Toast(), useToast(), PanelPrototipo(), VistaPanel, vistaPrototipo(), Campo(), Configuracion(), DatosBarberia() (+14 more)

### Community 32 - "Turnstile.tsx"
Cohesion: 0.33
Nodes (4): ApiTurnstile, cargarTurnstile(), Turnstile(), Window

### Community 33 - "_shared/unirse.ts"
Cohesion: 0.06
Nodes (34): anotarse(), claveDe(), ErrorUnirse, esCodigo(), leerSecreto(), MENSAJES, ADR-0007, CodigoError (+26 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

## Knowledge Gaps
- **24 isolated node(s):** `ADR-0007`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `Booksy` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 190 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cx()` connect `Unirse.tsx` to `Unirse.tsx`, `FilaPublica.tsx`, `PanelBarbero.tsx`, `Unirse.tsx`, `Turno.tsx`, `Configuracion.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `ADR-0007`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.09615384615384616 - nodes in this community are weakly interconnected._
- **Why does `entradaEta()` connect `eta.ts` to `Turno.tsx`, `_shared/unirse.ts`, `Unirse.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Why does `Seguridad` connect `Seguridad` to `Investigación`, `Arquitectura detallada`, `ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local`, `Fallo 2 · Endpoints expuestos`, `Fallo 2 · Endpoints expuestos`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06885245901639345 - nodes in this community are weakly interconnected._