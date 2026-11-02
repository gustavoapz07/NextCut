# Graph Report - NextCut  (2026-11-01)

## Corpus Check
- 103 files · ~99,391 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 4, .toml 2, .example 1)

## Summary
- 1026 nodes · 2673 edges · 58 communities (46 shown, 12 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 171 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd26a471`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Seguridad
- Arquitectura detallada
- 20261027140203_base_de_datos.sql
- turno.ts
- ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local
- Unirse.tsx
- lib/avisos.ts
- Fallo 2 · Endpoints expuestos
- Variables de entorno
- Configuracion.tsx
- eta.ts
- Cargando
- concurrencia.mjs
- Resumen.tsx
- Stack v0.1 con versiones
- e2e/utilidades.ts
- panel.ts
- avisos/index.ts
- database.types.ts
- Turno.tsx
- webpush.ts
- PanelBarbero.tsx
- Fallo 2 · Endpoints expuestos
- dueno.test.tsx
- PantallaTv.tsx
- unirse.test.ts
- _shared/avisos.ts
- imports
- ref_vitest
- useTitulo
- 20261031132532_avisos_web_push.sql
- public.barberias
- dueno.ts
- lib/unirse.ts
- panel.test.tsx
- Diagnostico.tsx
- fila.ts
- public.unirse_a_fila
- 05_avisos.test.sql
- _shared/unirse.ts
- public.miembros
- imports
- tv.ts
- unirse-a-fila/index.ts
- TableroReal
- NumeroAnimado
- ref_supabase_supabase_js

## God Nodes (most connected - your core abstractions)
1. `cx()` - 50 edges
2. `public.turnos` - 37 edges
3. `useTitulo()` - 32 edges
4. `Franjas()` - 31 edges
5. `Cargando()` - 23 edges
6. `PanelReal()` - 22 edges
7. `Seguridad` - 22 edges
8. `Plan de implementación` - 20 edges
9. `BotonMarca()` - 19 edges
10. `Fallo 2 · Endpoints expuestos` - 19 edges

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

## Communities (58 total, 12 thin omitted)

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
Cohesion: 0.09
Nodes (25): eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, privado.proteger_eventos(), privado.registrar_evento_turno(), privado.validar_cambio_turno(), public.empezar_turno(), public.eventos_turno (+17 more)

### Community 4 - "turno.ts"
Cohesion: 0.24
Nodes (9): EstadoFila, EstadoTurno, ADR-0007, ACTIVOS, cancelarTurno(), esquemaTurnoPublico, EstadoDelTurno, ESTADOS_TURNO (+1 more)

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.15
Nodes (24): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+16 more)

### Community 6 - "Unirse.tsx"
Cohesion: 0.08
Nodes (46): ApiTurnstile, cargarTurnstile(), Turnstile(), Window, VistaPanel, Miembro, VistaResumen, FilaPrototipo() (+38 more)

### Community 7 - "lib/avisos.ts"
Cohesion: 0.15
Nodes (23): activadosAntes(), activarAvisos(), avisoLocal(), avisosActivos(), clavePublica(), confirmarEnElTelefono(), desdePantallaDeInicio(), DESPUES_DE (+15 more)

### Community 8 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (20): Funciones de la base (security definer), Riesgos técnicos, Sprint 1 · Base de datos y seguridad, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), Clave de idempotencia al anotarse, Clave publicable y clave secreta de Supabase, Fallo 7 · Permisos excesivos (+12 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Configuracion.tsx"
Cohesion: 0.06
Nodes (58): Cambiar, Campo(), guardar(), DatosBarberia(), DatosBasicos(), DatosReales(), Deslizador(), DIAS (+50 more)

### Community 12 - "eta.ts"
Cohesion: 0.15
Nodes (16): BarberoEta, DURACION_POR_DEFECTO, DURACION_VALIDA, duracionDe(), minutosHastaLibre(), promedio(), RECIENTES_MAXIMO, RECIENTES_MINIMO (+8 more)

### Community 13 - "Cargando"
Cohesion: 0.29
Nodes (6): Cargando(), SinConexion(), PanelBarbero(), TurnoReal(), useSenalFila(), useTurno()

### Community 14 - "concurrencia.mjs"
Cohesion: 0.19
Nodes (12): anotar(), barberiaId, barberos, comoUsuario(), conectar(), preparar(), pruebaConBloqueo(), pruebaDobleEnvio() (+4 more)

### Community 15 - "Resumen.tsx"
Cohesion: 0.13
Nodes (18): Avatar(), Equipo(), useContextoDueno(), AccionesResumen, CLASES, FilaAhora(), FilaVista, HorasPico() (+10 more)

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.27
Nodes (10): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Arquitectura, Cloudflare Workers (hosting estático) (+2 more)

### Community 20 - "e2e/utilidades.ts"
Cohesion: 0.10
Nodes (23): ADR-0014, archivo, carpeta, env, ENV_LOCAL, publica, ICONOS, poste (+15 more)

### Community 21 - "panel.ts"
Cohesion: 0.12
Nodes (24): PanelReal(), SinSilla(), BarberiaPanel, BarberoPanel, cargarPanel(), DatosPanel, diaEn(), ejecutar() (+16 more)

### Community 22 - "avisos/index.ts"
Cohesion: 0.33
Nodes (3): admin, clave, claves

### Community 23 - "database.types.ts"
Cohesion: 0.17
Nodes (11): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+3 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.06
Nodes (62): Boleto(), Confeti(), Acciones, ADELANTE, aparecer, Atendido(), BotonAvisos(), Cancelar() (+54 more)

### Community 25 - "webpush.ts"
Cohesion: 0.13
Nodes (27): RFC-8188, RFC-8292, base64url(), Bytes, cifrar(), ClavesVapid, desdeBase64url(), endpointPermitido() (+19 more)

### Community 27 - "PanelBarbero.tsx"
Cohesion: 0.16
Nodes (17): AccionesPanel, ActualVista, Anillo(), BotonAccion(), colaInicial, enSilla, Fase, HojaTerminar() (+9 more)

### Community 28 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (26): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Prueba de riesgo 1 · Broadcast público, Prueba de riesgo 3 · Turnstile + IP, Adivinar códigos de turno, Borrado de teléfonos a los 90 días, cancelar_turno(codigo, secreto) (+18 more)

### Community 30 - "dueno.test.tsx"
Cohesion: 0.18
Nodes (10): BARBERIA, CARLOS, comoDueno(), conConfiguracion(), falso, JORGE, REPORTE, turno() (+2 more)

### Community 32 - "PantallaTv.tsx"
Cohesion: 0.06
Nodes (64): ErrorDeRuta(), BarraPoste(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, BotonMarca() (+56 more)

### Community 33 - "unirse.test.ts"
Cohesion: 0.18
Nodes (9): Dependencias, encabezadosCors(), limpiarNombre(), manejarUnirse(), obtenerIp(), enviar(), fila, peticion() (+1 more)

### Community 35 - "_shared/avisos.ts"
Cohesion: 0.10
Nodes (19): Aviso, crearAviso(), decidirAviso(), DependenciasAvisos, esquemaCuerpo, esquemaPendiente, estimados(), manejarAvisos() (+11 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 37 - "ref_vitest"
Cohesion: 0.29
Nodes (6): conLlamado(), libre(), { rpc, invoke }, filaDeEjemplo(), hace(), turnoDeEjemplo()

### Community 38 - "useTitulo"
Cohesion: 0.29
Nodes (10): Toast(), useToast(), PanelPrototipo(), vistaPrototipo(), BarraGuardar(), Configuracion(), ConfiguracionPrototipo(), ConfiguracionReal() (+2 more)

### Community 39 - "20261031132532_avisos_web_push.sql"
Cohesion: 0.12
Nodes (10): public.suscripciones_push, public.vencer_tolerancia(), privado.avisar_cambios(), privado.borrar_suscripcion_al_avanzar(), privado.con_aviso_pendiente(), privado.llamar_avisos(), public.avisos_pendientes(), public.reservar_aviso() (+2 more)

### Community 40 - "public.barberias"
Cohesion: 0.21
Nodes (15): barberias_senal, barberos_senal, barberos_user_idx, privado.puede_atender(), privado.senal_fila(), public.barberias, public.barberos, public.cerrar_dia() (+7 more)

### Community 41 - "dueno.ts"
Cohesion: 0.14
Nodes (18): ResumenReal(), BarberiaDueno, BarberoDueno, cargarResumen(), DatosResumen, ejecutar(), ErrorDueno, esquemaReporte (+10 more)

### Community 42 - "lib/unirse.ts"
Cohesion: 0.22
Nodes (10): anotarse(), claveDe(), ErrorUnirse, esCodigo(), leerSecreto(), MENSAJES, ADR-0007, CodigoError (+2 more)

### Community 43 - "panel.test.tsx"
Cohesion: 0.09
Nodes (6): BARBERIA, BARBERO, falso, SERVICIOS, TurnoPersonal, ObservadorFalso

### Community 44 - "Diagnostico.tsx"
Cohesion: 0.17
Nodes (18): Diagnostico(), pedir(), probar(), explicar(), Fila(), hora(), Nivel, PERMISOS (+10 more)

### Community 45 - "fila.ts"
Cohesion: 0.23
Nodes (10): detalleBarbero(), ResumenBarbero, resumirFila(), TONOS, EntradaEta, Estimado, estimarNuevo(), BarberoPublico (+2 more)

### Community 47 - "05_avisos.test.sql"
Cohesion: 0.33
Nodes (3): pg_temp.codigo(), pg_temp.en_cola(), pg_temp.id()

### Community 48 - "_shared/unirse.ts"
Cohesion: 0.20
Nodes (9): errorDeLaBase(), ERRORES_DE_LA_BASE, esquemaNombre, esquemaTelefono, esquemaTurnoCreado, esquemaUnirse, ESTADO_HTTP, RespuestaRpc (+1 more)

### Community 49 - "public.miembros"
Cohesion: 0.40
Nodes (4): miembros_barberia_idx, privado.es_dueno(), privado.es_miembro(), public.miembros

### Community 50 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 51 - "tv.ts"
Cohesion: 0.42
Nodes (7): ANUNCIO_MS, columnasTv(), detectarLlamados(), LlamadosVistos, useAnuncios(), entradaEta(), FilaPublica

### Community 52 - "unirse-a-fila/index.ts"
Cohesion: 0.25
Nodes (6): hmacHex(), verificarTurnstile(), admin, clave, origenes, ADR-0007

### Community 53 - "TableroReal"
Cohesion: 0.43
Nodes (6): TableroReal(), usePantallaEncendida(), ConAudioViejo, crearContexto(), prepararSonido(), tocarTonos()

### Community 54 - "NumeroAnimado"
Cohesion: 0.50
Nodes (4): Digito(), DIGITOS, NumeroAnimado(), Props

## Knowledge Gaps
- **30 isolated node(s):** `RFC-8291`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `RFC-8291` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 300 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `entradaEta()` connect `tv.ts` to `unirse.test.ts`, `_shared/avisos.ts`, `Unirse.tsx`, `fila.ts`, `_shared/unirse.ts`, `Turno.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `RFC-8291`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.09615384615384616 - nodes in this community are weakly interconnected._
- **Why does `cx()` connect `PantallaTv.tsx` to `useTitulo`, `Unirse.tsx`, `Configuracion.tsx`, `Diagnostico.tsx`, `Resumen.tsx`, `NumeroAnimado`, `Turno.tsx`, `PanelBarbero.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Why does `useTitulo()` connect `useTitulo` to `PantallaTv.tsx`, `Unirse.tsx`, `dueno.ts`, `Configuracion.tsx`, `Diagnostico.tsx`, `Cargando`, `Resumen.tsx`, `panel.ts`, `TableroReal`, `Turno.tsx`, `PanelBarbero.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.09411764705882353 - nodes in this community are weakly interconnected._