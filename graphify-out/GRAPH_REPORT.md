# Graph Report - NextCut  (2026-11-07)

## Corpus Check
- 138 files · ~126,144 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 2, .toml 2)

## Summary
- 1257 nodes · 3166 edges · 75 communities (55 shown, 20 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 176 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b2877f2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Seguridad
- Arquitectura detallada
- 20261027140203_base_de_datos.sql
- turno.ts
- ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local
- datos.ts
- LayoutDueno.tsx
- webpush.ts
- Variables de entorno
- Configuracion.tsx
- lib/cuentas.ts
- useTitulo
- concurrencia.mjs
- PanelBarbero.tsx
- Stack v0.1 con versiones
- e2e/utilidades.ts
- panel.ts
- Resumen.tsx
- database.types.ts
- Turno.tsx
- public.barberos
- ref_vitest
- Fallo 2 · Endpoints expuestos
- public.estado_salud
- Unirse.tsx
- _shared/cuentas.ts
- _shared/avisos.ts
- imports
- errores.ts
- fila.ts
- 20261031132532_avisos_web_push.sql
- public.barberias
- imports
- secretos.mjs
- Diagnostico.tsx
- _shared/unirse.ts
- public.unirse_a_fila
- 05_avisos.test.sql
- 07_cierre_y_borrado.test.sql
- imports
- Puesta en producción
- Tasa de abandono
- ref_zod
- claves-vapid.mjs
- revisar-build.mjs
- revisar-produccion.mjs
- cuentas/index.ts
- 20261102125411_pausa_automatica.sql
- dueno.ts
- eta.ts
- Dependencias
- Turnstile.tsx
- tv.ts
- imports
- ref_supabase_supabase_js
- dueno.test.tsx
- _shared/cuentas.test.ts
- sonido.ts
- ObservadorFalso
- ref_node_fs

## God Nodes (most connected - your core abstractions)
1. `cx()` - 51 edges
2. `useTitulo()` - 40 edges
3. `public.turnos` - 39 edges
4. `Franjas()` - 31 edges
5. `Cargando()` - 29 edges
6. `BotonMarca()` - 26 edges
7. `PanelReal()` - 24 edges
8. `Seguridad` - 22 edges
9. `public.barberias` - 21 edges
10. `public.barberos` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Waitwhile` --semantically_similar_to--> `Fila virtual híbrida`  [INFERRED] [semantically similar]
  docs/investigacion.md → README.md
- `Modelo de negocio (hipótesis)` --references--> `Competencia`  [INFERRED]
  README.md → docs/investigacion.md
- `Turnos fantasma` --semantically_similar_to--> `P1 Inasistencias (no-shows)`  [INFERRED] [semantically similar]
  docs/seguridad.md → docs/investigacion.md
- `Tasa de abandono` --conceptually_related_to--> `P2 Fila física incierta`  [INFERRED]
  README.md → docs/investigacion.md
- `Fórmula de pérdida mensual` --conceptually_related_to--> `Métricas de éxito`  [INFERRED]
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

## Communities (75 total, 20 thin omitted)

### Community 0 - "Investigación"
Cohesion: 0.12
Nodes (25): AgendaPro, Booksy, Cochrane 2013 · recordatorios por SMS, Competencia, Contexto Honduras 2026, DataReportal Digital 2026 Honduras, Investigación, Escala de calidad de evidencia (A–O) (+17 more)

### Community 1 - "Seguridad"
Cohesion: 0.23
Nodes (21): Hallazgo: clave heredada anon activa, Bitácora de cambios, 2026-10-25 · Investigación inicial, 2026-10-26 · Plan de implementación y graphify automático, 2026-10-26 · El producto pasa a llamarse NextCut y se publica el repositorio, Registro de decisiones, Nombre provisional "Siguiente" (alternativa descartada), Repositorio público gustavoapz07/NextCut (+13 more)

### Community 2 - "Arquitectura detallada"
Cohesion: 0.12
Nodes (22): suscribir_push(codigo, secreto, suscripcion), Cambio de precios de WhatsApp (1/10/2026), Arquitectura detallada, Calendario de 8 semanas, Edge Function avisos, Módulo eta.ts compartido, pg_cron + pg_net, Playwright + axe (+14 more)

### Community 3 - "20261027140203_base_de_datos.sql"
Cohesion: 0.10
Nodes (23): eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, privado.proteger_eventos(), privado.registrar_evento_turno(), privado.validar_cambio_turno(), public.empezar_turno(), public.eventos_turno (+15 more)

### Community 4 - "turno.ts"
Cohesion: 0.23
Nodes (10): Database, EstadoFila, EstadoTurno, ADR-0007, supabase, ACTIVOS, esquemaTurnoPublico, EstadoDelTurno (+2 more)

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.14
Nodes (26): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+18 more)

### Community 6 - "datos.ts"
Cohesion: 0.12
Nodes (35): ResumenPrototipo(), FilaPrototipo(), FilaPublica(), Anuncio(), BANDA, ColumnaBarbero(), ESTADO, PantallaTv() (+27 more)

### Community 7 - "LayoutDueno.tsx"
Cohesion: 0.13
Nodes (17): Boleto, LETRA_N, ElegirSilla(), SinSilla(), Estilo, ESTILOS, Contexto, ContextoDueno (+9 more)

### Community 8 - "webpush.ts"
Cohesion: 0.06
Nodes (53): activadosAntes(), activarAvisos(), avisoLocal(), avisosActivos(), clavePublica(), confirmarEnElTelefono(), desdePantallaDeInicio(), DESPUES_DE (+45 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Configuracion.tsx"
Cohesion: 0.05
Nodes (73): Toast(), useToast(), PanelPrototipo(), vistaPrototipo(), BarraGuardar(), Cambiar, Campo(), Configuracion() (+65 more)

### Community 12 - "lib/cuentas.ts"
Cohesion: 0.13
Nodes (19): nuevaClaveDueno(), NuevaBarberia(), enviar(), BarberiaAdmin, crearBarberia(), ErrorCuentas, esCodigo(), esquemaBarberias (+11 more)

### Community 13 - "useTitulo"
Cohesion: 0.14
Nodes (33): ClaveTemporal(), copiar(), mensajeDeAcceso(), BotonMarca(), Cargando(), BotonPrincipal(), claseCampo, CambiarClave() (+25 more)

### Community 14 - "concurrencia.mjs"
Cohesion: 0.08
Nodes (28): admin, anotados, conteo, encabezados, inicio, segundos, estado(), hashDe() (+20 more)

### Community 15 - "PanelBarbero.tsx"
Cohesion: 0.09
Nodes (34): Digito(), DIGITOS, NumeroAnimado(), Props, Avatar(), ActualVista, Anillo(), BotonAccion() (+26 more)

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.27
Nodes (10): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Arquitectura, Cloudflare Workers (hosting estático) (+2 more)

### Community 20 - "e2e/utilidades.ts"
Cohesion: 0.25
Nodes (15): ADR-0014, anotarPorApi(), BARBERO_CLAVE, BARBERO_CORREO, cancelarPorApi(), CLAVE, datosTurno(), encabezados (+7 more)

### Community 21 - "panel.ts"
Cohesion: 0.07
Nodes (34): BARBERIA, BARBERO, falso, SERVICIOS, AccionesPanel, minutosDesde(), PanelReal(), useSillaElegida() (+26 more)

### Community 22 - "Resumen.tsx"
Cohesion: 0.12
Nodes (28): ErrorDeRuta(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, MarcoPrototipo(), MenuPantallas() (+20 more)

### Community 23 - "database.types.ts"
Cohesion: 0.20
Nodes (9): CompositeTypes, Constants, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables, TablesInsert (+1 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.08
Nodes (41): Confeti(), Acciones, ADELANTE, aparecer, Atendido(), BotonAvisos(), Cancelar(), COLOR_BARRA (+33 more)

### Community 25 - "public.barberos"
Cohesion: 0.15
Nodes (17): barberos_senal, barberos_user_idx, miembros_barberia_idx, privado.es_dueno(), privado.es_miembro(), privado.puede_atender(), privado.senal_fila(), public.barberos (+9 more)

### Community 27 - "ref_vitest"
Cohesion: 0.21
Nodes (7): ANUNCIO_MS, conLlamado(), libre(), { rpc, invoke }, filaDeEjemplo(), hace(), turnoDeEjemplo()

### Community 28 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.08
Nodes (44): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Funciones de la base (security definer), Prueba de riesgo 3 · Turnstile + IP, Sprint 1 · Base de datos y seguridad, Adivinar códigos de turno, Amenazas propias de una fila virtual (+36 more)

### Community 32 - "Unirse.tsx"
Cohesion: 0.12
Nodes (35): BarraPoste(), NoEncontrado(), Boleto(), SinConexion(), FilaReal(), Tarjeta(), VistaFila(), Dato() (+27 more)

### Community 33 - "_shared/cuentas.ts"
Cohesion: 0.17
Nodes (13): correoRepetido(), encabezadosCors(), errorDeLaBase(), ERRORES_DE_LA_BASE, esquemaCorreo, esquemaCuentas, esquemaSlug, ESTADO_HTTP (+5 more)

### Community 35 - "_shared/avisos.ts"
Cohesion: 0.10
Nodes (20): Aviso, crearAviso(), decidirAviso(), DependenciasAvisos, esquemaCuerpo, esquemaPendiente, estimados(), manejarAvisos() (+12 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 37 - "errores.ts"
Cohesion: 0.18
Nodes (11): cargar(), iniciarErrores(), limpiarEvento(), limpiarMiga(), limpiarTexto(), limpiarValor(), reportarError(), Sdk (+3 more)

### Community 38 - "fila.ts"
Cohesion: 0.27
Nodes (9): ResumenBarbero, resumirFila(), TONOS, EntradaEta, Estimado, BarberoPublico, esquemaBarbero, esquemaFilaPublica (+1 more)

### Community 39 - "20261031132532_avisos_web_push.sql"
Cohesion: 0.12
Nodes (10): public.suscripciones_push, public.vencer_tolerancia(), privado.avisar_cambios(), privado.borrar_suscripcion_al_avanzar(), privado.con_aviso_pendiente(), privado.llamar_avisos(), public.avisos_pendientes(), public.reservar_aviso() (+2 more)

### Community 40 - "public.barberias"
Cohesion: 0.17
Nodes (14): barberias_senal, public.barberias, public.cerrar_dia(), public.fila_publica(), public.reporte_dia(), public.servicios, public.terminar_turno(), public.unirse_a_fila() (+6 more)

### Community 41 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 43 - "secretos.mjs"
Cohesion: 0.18
Nodes (6): archivo, carpeta, ensayo, ENV_PRODUCCION, secretos, vapidPublica

### Community 44 - "Diagnostico.tsx"
Cohesion: 0.14
Nodes (22): Diagnostico(), pedir(), probar(), explicar(), Fila(), hora(), Nivel, PERMISOS (+14 more)

### Community 45 - "_shared/unirse.ts"
Cohesion: 0.06
Nodes (38): FormularioReal(), Fuente, anotarse(), claveDe(), ErrorUnirse, esCodigo(), guardarSecreto(), leerSecreto() (+30 more)

### Community 46 - "public.unirse_a_fila"
Cohesion: 0.17
Nodes (3): privado.senal_fila(), public.fila_publica(), public.unirse_a_fila()

### Community 47 - "05_avisos.test.sql"
Cohesion: 0.33
Nodes (3): pg_temp.codigo(), pg_temp.en_cola(), pg_temp.id()

### Community 50 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 51 - "Puesta en producción"
Cohesion: 0.15
Nodes (13): 0. Decisiones antes de empezar (Gus), 10. Revisar antes de imprimir el QR, 1. Proyecto de Supabase (Gus), 2. Base de datos y funciones, 3. Secretos de las funciones (Gus), 4. Vault: dirección y clave de los avisos, 5. Auth (Gus), 6. Turnstile (Gus) (+5 more)

### Community 52 - "Tasa de abandono"
Cohesion: 0.28
Nodes (7): Waitwhile, Definición de abandono, Alcance del MVP (v0.1), Hoja de ruta v0.1–v0.3, Métricas de éxito, Reporte del día para el dueño, Tasa de abandono

### Community 53 - "ref_zod"
Cohesion: 0.20
Nodes (6): consultarBase(), DependenciasSalud, esquemaEstado, manejarSalud(), Resultado, HORA

### Community 54 - "claves-vapid.mjs"
Cohesion: 0.20
Nodes (5): archivo, carpeta, env, ENV_LOCAL, publica

### Community 55 - "revisar-build.mjs"
Cohesion: 0.22
Nodes (8): archivosDe(), buscarSecretos(), RAIZ, REGLAS, revisar(), rolDelJwt(), TEXTO, valoresProhibidos()

### Community 58 - "revisar-produccion.mjs"
Cohesion: 0.17
Nodes (8): leerEnv(), leerPruebas(), RAIZ, revisarVariables(), produccion, pruebas, cargaInicial(), raiz()

### Community 59 - "cuentas/index.ts"
Cohesion: 0.20
Nodes (5): admin, clave, origenes, ADR-0017, admin

### Community 61 - "dueno.ts"
Cohesion: 0.13
Nodes (19): ResumenReal(), BarberiaDueno, BarberoDueno, cargarResumen(), DatosResumen, ejecutar(), ErrorDueno, esquemaReporte (+11 more)

### Community 62 - "eta.ts"
Cohesion: 0.15
Nodes (17): BarberoEta, DURACION_POR_DEFECTO, DURACION_VALIDA, duracionDe(), estimarNuevo(), minutosHastaLibre(), promedio(), RECIENTES_MAXIMO (+9 more)

### Community 65 - "Turnstile.tsx"
Cohesion: 0.33
Nodes (4): ApiTurnstile, cargarTurnstile(), Turnstile(), Window

### Community 66 - "tv.ts"
Cohesion: 0.31
Nodes (9): VistaTv, tonoDe(), columnasTv(), ColumnaTv, detectarLlamados(), Llamado, LlamadosVistos, useAnuncios() (+1 more)

### Community 67 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 70 - "dueno.test.tsx"
Cohesion: 0.14
Nodes (14): BARBERIA, CARLOS, comoDueno(), conConfiguracion(), falso, JORGE, REPORTE, turno() (+6 more)

### Community 71 - "_shared/cuentas.test.ts"
Cohesion: 0.33
Nodes (3): claveTemporal(), altaValida, Rpc

### Community 72 - "sonido.ts"
Cohesion: 0.60
Nodes (4): ConAudioViejo, crearContexto(), prepararSonido(), tocarTonos()

### Community 74 - "ref_node_fs"
Cohesion: 0.40
Nodes (3): boleto, ICONOS, publico

## Knowledge Gaps
- **38 isolated node(s):** `ADR-0017`, `ADR-0017`, `ADR-0017`, `ADR-0017`, `RFC-8291` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 402 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTitulo()` connect `datos.ts` to `Unirse.tsx`, `LayoutDueno.tsx`, `Configuracion.tsx`, `Diagnostico.tsx`, `useTitulo`, `PanelBarbero.tsx`, `panel.ts`, `Resumen.tsx`, `Turno.tsx`, `dueno.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `ADR-0017`, `ADR-0017`, `ADR-0017` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._
- **Why does `cx()` connect `PanelBarbero.tsx` to `Unirse.tsx`, `datos.ts`, `LayoutDueno.tsx`, `Configuracion.tsx`, `Diagnostico.tsx`, `useTitulo`, `Resumen.tsx`, `Turno.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.12333333333333334 - nodes in this community are weakly interconnected._
- **Why does `ObservadorFalso` connect `ObservadorFalso` to `ref_vitest`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.10227272727272728 - nodes in this community are weakly interconnected._