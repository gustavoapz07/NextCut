# Graph Report - NextCut  (2026-10-31)

## Corpus Check
- 93 files · ~84,172 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 923 nodes · 2409 edges · 57 communities (45 shown, 12 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3e3b3ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Seguridad
- Arquitectura detallada
- 20261027140203_base_de_datos.sql
- panel.test.tsx
- ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local
- PanelBarbero.tsx
- lib/avisos.ts
- Fallo 2 · Endpoints expuestos
- Variables de entorno
- Piezas.tsx
- concurrencia.mjs
- Unirse.tsx
- FilaPublica.tsx
- eta.ts
- Stack v0.1 con versiones
- e2e/utilidades.ts
- Configuracion.tsx
- LayoutDueno.tsx
- database.types.ts
- Turno.tsx
- turno.ts
- panel.ts
- Fallo 2 · Endpoints expuestos
- Fuente
- Turnstile.tsx
- _shared/unirse.ts
- _shared/avisos.ts
- imports
- webpush.ts
- avisos/index.ts
- 20261031132532_avisos_web_push.sql
- public.barberias
- dueno.ts
- tv.ts
- dueno.test.tsx
- fila.ts
- FilaPublica.tsx
- router.test.tsx
- 05_avisos.test.sql
- lib/unirse.ts
- public.miembros
- imports
- CodigoQr.tsx
- manejarUnirse
- main.tsx
- enVivo.ts
- ref_supabase_supabase_js

## God Nodes (most connected - your core abstractions)
1. `cx()` - 47 edges
2. `public.turnos` - 35 edges
3. `Franjas()` - 31 edges
4. `useTitulo()` - 29 edges
5. `PanelReal()` - 22 edges
6. `Seguridad` - 22 edges
7. `Cargando()` - 21 edges
8. `Plan de implementación` - 20 edges
9. `Fallo 2 · Endpoints expuestos` - 19 edges
10. `Formulario()` - 18 edges

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

## Communities (57 total, 12 thin omitted)

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
Cohesion: 0.10
Nodes (23): eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, privado.proteger_eventos(), privado.registrar_evento_turno(), privado.validar_cambio_turno(), public.empezar_turno(), public.eventos_turno (+15 more)

### Community 4 - "panel.test.tsx"
Cohesion: 0.11
Nodes (6): BARBERIA, BARBERO, falso, SERVICIOS, TurnoPersonal, ObservadorFalso

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.15
Nodes (24): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+16 more)

### Community 6 - "PanelBarbero.tsx"
Cohesion: 0.11
Nodes (31): Digito(), DIGITOS, NumeroAnimado(), Props, Avatar(), BotonPrincipal(), Toast(), ActualVista (+23 more)

### Community 7 - "lib/avisos.ts"
Cohesion: 0.14
Nodes (21): ControlAvisos, activarAvisos(), avisosActivos(), clavePublica(), desdePantallaDeInicio(), DESPUES_DE, disponibilidadAvisos, esIos() (+13 more)

### Community 8 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (20): Funciones de la base (security definer), Riesgos técnicos, Sprint 1 · Base de datos y seguridad, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), Clave de idempotencia al anotarse, Clave publicable y clave secreta de Supabase, Fallo 7 · Permisos excesivos (+12 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Piezas.tsx"
Cohesion: 0.16
Nodes (21): ErrorDeRuta(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, BotonMarca(), MarcoPrototipo() (+13 more)

### Community 12 - "concurrencia.mjs"
Cohesion: 0.19
Nodes (12): anotar(), barberiaId, barberos, comoUsuario(), conectar(), preparar(), pruebaConBloqueo(), pruebaDobleEnvio() (+4 more)

### Community 13 - "Unirse.tsx"
Cohesion: 0.15
Nodes (24): Dato(), deslizar, Envio, Espera, Formulario(), elegirYSeguir(), ir(), FormularioReal() (+16 more)

### Community 14 - "FilaPublica.tsx"
Cohesion: 0.18
Nodes (24): NoEncontrado(), Marquesina(), SinConexion(), ResumenPrototipo(), FilaReal(), leerDatos(), Turno(), TurnoPrototipo() (+16 more)

### Community 15 - "eta.ts"
Cohesion: 0.15
Nodes (16): BarberoEta, DURACION_POR_DEFECTO, DURACION_VALIDA, duracionDe(), minutosHastaLibre(), promedio(), RECIENTES_MAXIMO, RECIENTES_MINIMO (+8 more)

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.27
Nodes (10): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Arquitectura, Cloudflare Workers (hosting estático) (+2 more)

### Community 20 - "e2e/utilidades.ts"
Cohesion: 0.09
Nodes (23): ADR-0014, archivo, carpeta, env, ENV_LOCAL, publica, ICONOS, poste (+15 more)

### Community 21 - "Configuracion.tsx"
Cohesion: 0.08
Nodes (40): useToast(), VistaPanel, Campo(), Configuracion(), DatosBarberia(), Deslizador(), DIAS, Equipo() (+32 more)

### Community 22 - "LayoutDueno.tsx"
Cohesion: 0.14
Nodes (21): Cargando(), destinoAlEntrar(), Entrar(), enviar(), PanelBarbero(), SinSilla(), Contexto, ContextoDueno (+13 more)

### Community 23 - "database.types.ts"
Cohesion: 0.17
Nodes (11): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+3 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.10
Nodes (31): Boleto(), Confeti(), Acciones, ADELANTE, aparecer, Atendido(), BotonAvisos(), Cancelar() (+23 more)

### Community 25 - "turno.ts"
Cohesion: 0.25
Nodes (8): ConAudioViejo, crearContexto(), prepararSonido(), tocarTonos(), avisarQueToca(), esquemaTurnoPublico, EstadoDelTurno, ESTADOS_TURNO

### Community 27 - "panel.ts"
Cohesion: 0.11
Nodes (27): AccionesPanel, minutosDesde(), PanelReal(), vistaTurno(), BarberiaPanel, BarberoPanel, cargarPanel(), DatosPanel (+19 more)

### Community 28 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (26): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Prueba de riesgo 1 · Broadcast público, Prueba de riesgo 3 · Turnstile + IP, Adivinar códigos de turno, Borrado de teléfonos a los 90 días, cancelar_turno(codigo, secreto) (+18 more)

### Community 32 - "Turnstile.tsx"
Cohesion: 0.33
Nodes (4): ApiTurnstile, cargarTurnstile(), Turnstile(), Window

### Community 33 - "_shared/unirse.ts"
Cohesion: 0.10
Nodes (22): DatosUnirse, encabezadosCors(), ERRORES_DE_LA_BASE, esquemaNombre, esquemaTelefono, esquemaTurnoCreado, esquemaUnirse, ESTADO_HTTP (+14 more)

### Community 35 - "_shared/avisos.ts"
Cohesion: 0.10
Nodes (20): Aviso, crearAviso(), decidirAviso(), DependenciasAvisos, esquemaCuerpo, esquemaPendiente, estimados(), manejarAvisos() (+12 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 37 - "webpush.ts"
Cohesion: 0.14
Nodes (26): RFC-8188, RFC-8292, base64url(), Bytes, cifrar(), desdeBase64url(), endpointPermitido(), enviarPush() (+18 more)

### Community 38 - "avisos/index.ts"
Cohesion: 0.33
Nodes (3): admin, clave, claves

### Community 39 - "20261031132532_avisos_web_push.sql"
Cohesion: 0.12
Nodes (10): public.suscripciones_push, public.vencer_tolerancia(), privado.avisar_cambios(), privado.borrar_suscripcion_al_avanzar(), privado.con_aviso_pendiente(), privado.llamar_avisos(), public.avisos_pendientes(), public.reservar_aviso() (+2 more)

### Community 40 - "public.barberias"
Cohesion: 0.15
Nodes (17): barberias_senal, barberos_senal, barberos_user_idx, privado.puede_atender(), privado.senal_fila(), public.barberias, public.barberos, public.cerrar_dia() (+9 more)

### Community 41 - "dueno.ts"
Cohesion: 0.14
Nodes (18): ResumenReal(), BarberiaDueno, BarberoDueno, cargarResumen(), DatosResumen, ejecutar(), ErrorDueno, esquemaReporte (+10 more)

### Community 42 - "tv.ts"
Cohesion: 0.28
Nodes (11): VistaTv, tonoDe(), ANUNCIO_MS, columnasTv(), ColumnaTv, detectarLlamados(), Llamado, LlamadosVistos (+3 more)

### Community 43 - "dueno.test.tsx"
Cohesion: 0.14
Nodes (13): BARBERIA, CARLOS, comoDueno(), falso, JORGE, REPORTE, turno(), minutosDesde() (+5 more)

### Community 44 - "fila.ts"
Cohesion: 0.27
Nodes (9): detalleBarbero(), ResumenBarbero, resumirFila(), TONOS, EntradaEta, Estimado, BarberoPublico, esquemaBarbero (+1 more)

### Community 45 - "FilaPublica.tsx"
Cohesion: 0.35
Nodes (9): BarraPoste(), FilaPrototipo(), FilaPublica(), Tarjeta(), VistaFila(), duracion(), fechaLarga(), numero (+1 more)

### Community 46 - "router.test.tsx"
Cohesion: 0.25
Nodes (7): TurnoPublico, conLlamado(), libre(), { rpc, invoke }, filaDeEjemplo(), hace(), turnoDeEjemplo()

### Community 47 - "05_avisos.test.sql"
Cohesion: 0.33
Nodes (3): pg_temp.codigo(), pg_temp.en_cola(), pg_temp.id()

### Community 48 - "lib/unirse.ts"
Cohesion: 0.24
Nodes (10): anotarse(), claveDe(), ErrorUnirse, esCodigo(), guardarSecreto(), leerSecreto(), MENSAJES, ADR-0007 (+2 more)

### Community 49 - "public.miembros"
Cohesion: 0.40
Nodes (4): miembros_barberia_idx, privado.es_dueno(), privado.es_miembro(), public.miembros

### Community 50 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 51 - "CodigoQr.tsx"
Cohesion: 0.28
Nodes (6): CodigoQr(), Estilo, ESTILOS, useContextoDueno(), Resumen(), vars()

### Community 52 - "manejarUnirse"
Cohesion: 0.39
Nodes (3): Dependencias, errorDeLaBase(), manejarUnirse()

### Community 54 - "enVivo.ts"
Cohesion: 0.33
Nodes (6): EstadoFila, EstadoTurno, ADR-0007, useSenalFila(), useTurno(), ACTIVOS

## Knowledge Gaps
- **30 isolated node(s):** `RFC-8291`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `RFC-8291` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 271 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `entradaEta()` connect `tv.ts` to `_shared/unirse.ts`, `_shared/avisos.ts`, `fila.ts`, `Unirse.tsx`, `manejarUnirse`, `Turno.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `RFC-8291`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.09615384615384616 - nodes in this community are weakly interconnected._
- **Why does `cx()` connect `PanelBarbero.tsx` to `Piezas.tsx`, `FilaPublica.tsx`, `FilaPublica.tsx`, `Unirse.tsx`, `CodigoQr.tsx`, `Configuracion.tsx`, `LayoutDueno.tsx`, `Turno.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Why does `useTitulo()` connect `FilaPublica.tsx` to `PanelBarbero.tsx`, `dueno.ts`, `Piezas.tsx`, `FilaPublica.tsx`, `Unirse.tsx`, `CodigoQr.tsx`, `Configuracion.tsx`, `LayoutDueno.tsx`, `Turno.tsx`, `panel.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.10227272727272728 - nodes in this community are weakly interconnected._