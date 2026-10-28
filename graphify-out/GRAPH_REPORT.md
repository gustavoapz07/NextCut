# Graph Report - NextCut  (2026-10-28)

## Corpus Check
- 61 files · ~54,825 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 612 nodes · 1666 edges · 37 communities (30 shown, 7 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 158 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `869228b3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Piezas.tsx
- Herramientas y entorno de desarrollo
- 20261027140203_base_de_datos.sql
- PanelBarbero.tsx
- Unirse.tsx
- Cliente de Supabase y prueba de riesgo
- Arquitectura detallada
- Fallo 7 · Permisos excesivos
- Variables de entorno
- Franjas
- concurrencia.mjs
- eta.ts
- Sprint 4 · Dueño, antiabuso y lanzamiento
- ObservadorFalso
- fila.ts
- ref_supabase_supabase_js
- ADR-007 · Anotarse por Edge Function y tiempo real solo con señales
- main.tsx
- Turno.tsx
- PantallaTv.tsx
- Seguridad
- cx
- Stack v0.1 con versiones
- lib/unirse.ts
- _shared/unirse.ts
- index.ts
- manejarUnirse
- unirse.test.ts
- CodigoQr.tsx
- fila.test.ts
- imports

## God Nodes (most connected - your core abstractions)
1. `cx()` - 46 edges
2. `Franjas()` - 31 edges
3. `public.turnos` - 28 edges
4. `useTitulo()` - 23 edges
5. `Seguridad` - 22 edges
6. `Plan de implementación` - 20 edges
7. `Fallo 2 · Endpoints expuestos` - 19 edges
8. `Formulario()` - 18 edges
9. `Registro de decisiones` - 18 edges
10. `README de NextCut` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Sentry (errores sin datos personales)` --conceptually_related_to--> `Fallo 5 · Datos sensibles`  [INFERRED]
  README.md → docs/seguridad.md
- `Modelo de negocio (hipótesis)` --references--> `Competencia`  [INFERRED]
  README.md → docs/investigacion.md
- `graphify (grafo de conocimiento)` --conceptually_related_to--> `Desarrollo local`  [INFERRED]
  docs/plan-implementacion.md → README.md
- `Definición de abandono` --conceptually_related_to--> `Tasa de abandono`  [INFERRED]
  docs/validacion-campo.md → README.md

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

## Communities (37 total, 7 thin omitted)

### Community 0 - "Investigación"
Cohesion: 0.08
Nodes (34): AgendaPro, Booksy, Cochrane 2013 · recordatorios por SMS, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Investigación, Escala de calidad de evidencia (A–O) (+26 more)

### Community 1 - "Piezas.tsx"
Cohesion: 0.16
Nodes (19): Avatar(), claseCampo, PIEZAS, Toast(), TONOS, useToast(), Campo(), Configuracion() (+11 more)

### Community 2 - "Herramientas y entorno de desarrollo"
Cohesion: 0.19
Nodes (18): 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit), Otra cuenta de Supabase (alternativa descartada), pnpm (alternativa descartada) (+10 more)

### Community 3 - "20261027140203_base_de_datos.sql"
Cohesion: 0.07
Nodes (46): barberias_senal, barberos_senal, barberos_user_idx, eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, miembros_barberia_idx, privado.es_dueno() (+38 more)

### Community 4 - "PanelBarbero.tsx"
Cohesion: 0.16
Nodes (21): Anillo(), colaInicial, enSilla, Fase, Metodo, METODOS, TarjetaActual(), Barbero (+13 more)

### Community 5 - "Unirse.tsx"
Cohesion: 0.08
Nodes (46): Cargando(), NoEncontrado(), SinConexion(), ApiTurnstile, cargarTurnstile(), Turnstile(), Window, Miembro (+38 more)

### Community 6 - "Cliente de Supabase y prueba de riesgo"
Cohesion: 0.17
Nodes (11): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+3 more)

### Community 7 - "Arquitectura detallada"
Cohesion: 0.13
Nodes (22): suscribir_push(codigo, secreto, suscripcion), Cambio de precios de WhatsApp (1/10/2026), Arquitectura detallada, Calendario de 8 semanas, Edge Function avisos, Módulo eta.ts compartido, pg_cron + pg_net, Piloto (2 sábados en 1 barbería) (+14 more)

### Community 8 - "Fallo 7 · Permisos excesivos"
Cohesion: 0.11
Nodes (31): Funciones de la base (security definer), Sprint 1 · Base de datos y seguridad, Adivinar códigos de turno, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), cancelar_turno(codigo, secreto), Clave de idempotencia al anotarse, Clave publicable y clave secreta de Supabase (+23 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Franjas"
Cohesion: 0.16
Nodes (23): ErrorDeRuta(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, BotonMarca(), MarcoPrototipo() (+15 more)

### Community 12 - "concurrencia.mjs"
Cohesion: 0.19
Nodes (12): anotar(), barberiaId, barberos, comoUsuario(), conectar(), preparar(), pruebaConBloqueo(), pruebaDobleEnvio() (+4 more)

### Community 13 - "eta.ts"
Cohesion: 0.15
Nodes (16): BarberoEta, DURACION_POR_DEFECTO, DURACION_VALIDA, duracionDe(), minutosHastaLibre(), promedio(), RECIENTES_MAXIMO, RECIENTES_MINIMO (+8 more)

### Community 14 - "Sprint 4 · Dueño, antiabuso y lanzamiento"
Cohesion: 0.29
Nodes (8): Sprint 4 · Dueño, antiabuso y lanzamiento, Supabase MCP, Borrado de teléfonos a los 90 días, Fallo 9 · Rate limiting, gitleaks, Inundación de la fila, Pausa automática de la fila remota, Pendientes antes del piloto

### Community 15 - "ObservadorFalso"
Cohesion: 0.17
Nodes (3): rutas, { rpc, invoke }, ObservadorFalso

### Community 19 - "fila.ts"
Cohesion: 0.19
Nodes (14): EstadoFila, ADR-0007, useSenalFila(), ResumenBarbero, resumirFila(), TONOS, EntradaEta, Estimado (+6 more)

### Community 21 - "ADR-007 · Anotarse por Edge Function y tiempo real solo con señales"
Cohesion: 0.22
Nodes (14): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Sprint 0: base del proyecto, Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, gitleaks (secretos), Prueba de riesgo 1 · Broadcast público, Prueba de riesgo 3 · Turnstile + IP (+6 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.13
Nodes (24): Confeti(), ADELANTE, aparecer, Atendido(), Cancelado(), COLOR_BARRA, DatosTurno, DURACION (+16 more)

### Community 25 - "PantallaTv.tsx"
Cohesion: 0.18
Nodes (20): Digito(), DIGITOS, NumeroAnimado(), Props, Marquesina(), FilaAhora(), HorasPico(), Indicador (+12 more)

### Community 26 - "Seguridad"
Cohesion: 0.26
Nodes (19): Hallazgo: clave heredada anon activa, Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, Registro de decisiones, Nombre provisional "Siguiente" (alternativa descartada), Repositorio público gustavoapz07/NextCut (+11 more)

### Community 27 - "cx"
Cohesion: 0.21
Nodes (13): BarraPoste(), Boleto(), BotonAccion(), HojaTerminar(), PanelBarbero(), terminar(), Esperando(), FilaVisual() (+5 more)

### Community 28 - "Stack v0.1 con versiones"
Cohesion: 0.26
Nodes (9): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Cloudflare Workers (hosting estático), Límites del plan gratuito de Supabase (+1 more)

### Community 29 - "lib/unirse.ts"
Cohesion: 0.22
Nodes (10): anotarse(), claveDe(), ErrorUnirse, esCodigo(), leerSecreto(), MENSAJES, ADR-0007, CodigoError (+2 more)

### Community 30 - "_shared/unirse.ts"
Cohesion: 0.20
Nodes (8): ERRORES_DE_LA_BASE, esquemaNombre, esquemaTelefono, esquemaTurnoCreado, esquemaUnirse, ESTADO_HTTP, RespuestaRpc, ADR-0007

### Community 31 - "index.ts"
Cohesion: 0.22
Nodes (6): hmacHex(), verificarTurnstile(), admin, clave, origenes, ADR-0007

### Community 32 - "manejarUnirse"
Cohesion: 0.33
Nodes (4): Dependencias, encabezadosCors(), errorDeLaBase(), manejarUnirse()

### Community 33 - "unirse.test.ts"
Cohesion: 0.25
Nodes (6): limpiarNombre(), obtenerIp(), enviar(), fila, peticion(), URL_TURNSTILE

### Community 34 - "CodigoQr.tsx"
Cohesion: 0.29
Nodes (4): CodigoQr(), Estilo, ESTILOS, DOMINIO

### Community 35 - "fila.test.ts"
Cohesion: 0.60
Nodes (3): detalleBarbero(), filaDeEjemplo(), hace()

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

## Knowledge Gaps
- **24 isolated node(s):** `ADR-0007`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `Nombre provisional "Siguiente" (alternativa descartada)` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 159 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cx()` connect `cx` to `Piezas.tsx`, `CodigoQr.tsx`, `PanelBarbero.tsx`, `Unirse.tsx`, `Franjas`, `Turno.tsx`, `PantallaTv.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `ADR-0007`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.08292682926829269 - nodes in this community are weakly interconnected._
- **Why does `Seguridad` connect `Seguridad` to `Investigación`, `Arquitectura detallada`, `Fallo 7 · Permisos excesivos`, `Sprint 4 · Dueño, antiabuso y lanzamiento`, `ADR-007 · Anotarse por Edge Function y tiempo real solo con señales`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06885245901639345 - nodes in this community are weakly interconnected._
- **Why does `estimarNuevo()` connect `fila.ts` to `manejarUnirse`, `eta.ts`, `Unirse.tsx`, `_shared/unirse.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `Unirse.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08082706766917293 - nodes in this community are weakly interconnected._