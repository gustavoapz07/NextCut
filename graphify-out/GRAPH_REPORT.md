# Graph Report - NextCut  (2026-11-07)

## Corpus Check
- 143 files · ~132,363 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 2, .toml 2)

## Summary
- 1305 nodes · 3327 edges · 79 communities (60 shown, 19 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 176 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d799c104`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Investigación
- Seguridad
- Arquitectura detallada
- 20261027140203_base_de_datos.sql
- turno.ts
- ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local
- PantallaTv.tsx
- useTitulo
- webpush.ts
- Variables de entorno
- Configuracion.tsx
- lib/cuentas.ts
- Entrar.tsx
- concurrencia.mjs
- Resumen.tsx
- Stack v0.1 con versiones
- e2e/utilidades.ts
- PanelBarbero.tsx
- cx
- database.types.ts
- Turno.tsx
- public.barberos
- panel.ts
- Fallo 2 · Endpoints expuestos
- public.estado_salud
- Unirse.tsx
- _shared/cuentas.ts
- _shared/avisos.ts
- imports
- errores.ts
- Cargando
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
- PantallaTv.tsx
- revisar-build.mjs
- revisar-produccion.mjs
- lib/unirse.ts
- 20261102125411_pausa_automatica.sql
- dueno.ts
- fila.ts
- panel.test.tsx
- Turnstile.tsx
- manejarUnirse
- imports
- avisos/index.ts
- dueno.test.tsx
- CambiarClave.tsx
- vite.config.ts
- lib/avisos.ts
- FilaPublica.tsx
- lib/cuentas.test.ts
- claves-vapid.mjs
- Tono

## God Nodes (most connected - your core abstractions)
1. `cx()` - 56 edges
2. `useTitulo()` - 43 edges
3. `public.turnos` - 40 edges
4. `Cargando()` - 34 edges
5. `Franjas()` - 31 edges
6. `BotonMarca()` - 26 edges
7. `PanelReal()` - 25 edges
8. `public.barberos` - 22 edges
9. `Seguridad` - 22 edges
10. `ResumenReal()` - 21 edges

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

## Communities (79 total, 19 thin omitted)

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
Cohesion: 0.16
Nodes (12): Database, EstadoFila, EstadoTurno, ADR-0007, supabase, ACTIVOS, esquemaTurnoPublico, EstadoDelTurno (+4 more)

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.14
Nodes (26): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+18 more)

### Community 6 - "PantallaTv.tsx"
Cohesion: 0.11
Nodes (30): Resumen(), ResumenPrototipo(), DatosTurno, leerDatos(), TurnoPrototipo(), TableroPrototipo(), useIntervalo(), barberia (+22 more)

### Community 7 - "useTitulo"
Cohesion: 0.13
Nodes (21): Boleto, LETRA_N, Marca(), NoEsAdmin(), ElegirSilla(), CodigoQr(), Estilo, ESTILOS (+13 more)

### Community 8 - "webpush.ts"
Cohesion: 0.14
Nodes (26): RFC-8188, RFC-8292, base64url(), Bytes, cifrar(), desdeBase64url(), endpointPermitido(), enviarPush() (+18 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Configuracion.tsx"
Cohesion: 0.06
Nodes (69): BarraGuardar(), Cambiar, Campo(), Configuracion(), ConfiguracionPrototipo(), ConfiguracionReal(), guardar(), CuentaBarbero() (+61 more)

### Community 12 - "lib/cuentas.ts"
Cohesion: 0.10
Nodes (35): claseCampo, Aviso(), Barberias(), Creada, Dato(), Detalle(), nuevaClaveDueno(), DetalleBarberiaAdmin() (+27 more)

### Community 13 - "Entrar.tsx"
Cohesion: 0.26
Nodes (12): ConSesion(), destinoFinal(), Entrar(), enviar(), pasandoPorClave(), ADR-0017, ADR-0018, destinoDelAdmin() (+4 more)

### Community 14 - "concurrencia.mjs"
Cohesion: 0.08
Nodes (28): admin, anotados, conteo, encabezados, inicio, segundos, estado(), hashDe() (+20 more)

### Community 15 - "Resumen.tsx"
Cohesion: 0.14
Nodes (18): AccionesResumen, AlertaPico(), CLASES, FilaAhora(), FilaVista, HorasPico(), Indicador, minutosDesde() (+10 more)

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.27
Nodes (10): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Arquitectura, Cloudflare Workers (hosting estático) (+2 more)

### Community 20 - "e2e/utilidades.ts"
Cohesion: 0.25
Nodes (15): ADR-0014, anotarPorApi(), BARBERO_CLAVE, BARBERO_CORREO, cancelarPorApi(), CLAVE, datosTurno(), encabezados (+7 more)

### Community 21 - "PanelBarbero.tsx"
Cohesion: 0.12
Nodes (22): Toast(), useToast(), AccionesPanel, ActualVista, Anillo(), colaInicial, enSilla, Fase (+14 more)

### Community 22 - "cx"
Cohesion: 0.11
Nodes (31): BarraPoste(), Franjas(), FranjasProps, Poste(), AbrirMenu, MarcoPrototipo(), MenuPantallas(), NoEncontrado() (+23 more)

### Community 23 - "database.types.ts"
Cohesion: 0.20
Nodes (9): CompositeTypes, Constants, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables, TablesInsert (+1 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.09
Nodes (36): Confeti(), TarjetaActual(), Acciones, ADELANTE, aparecer, Atendido(), BotonAvisos(), Cancelar() (+28 more)

### Community 25 - "public.barberos"
Cohesion: 0.13
Nodes (19): barberos_senal, barberos_user_idx, miembros_barberia_idx, privado.es_dueno(), privado.es_miembro(), privado.puede_atender(), public.barberos, public.miembros (+11 more)

### Community 27 - "panel.ts"
Cohesion: 0.15
Nodes (18): BarberiaPanel, BarberoPanel, cargarPanel(), diaEn(), ejecutar(), ELEGIR_SILLA, empezarTurno(), ErrorAccion (+10 more)

### Community 28 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.08
Nodes (44): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Funciones de la base (security definer), Prueba de riesgo 3 · Turnstile + IP, Sprint 1 · Base de datos y seguridad, Adivinar códigos de turno, Amenazas propias de una fila virtual (+36 more)

### Community 32 - "Unirse.tsx"
Cohesion: 0.16
Nodes (23): Boleto(), Dato(), deslizar, Envio, Espera, Formulario(), elegirYSeguir(), ir() (+15 more)

### Community 33 - "_shared/cuentas.ts"
Cohesion: 0.07
Nodes (24): admin, clave, origenes, ADR-0017, claveTemporal(), CodigoCuentas, CODIGOS_CUENTAS, correoRepetido() (+16 more)

### Community 35 - "_shared/avisos.ts"
Cohesion: 0.10
Nodes (20): Aviso, crearAviso(), decidirAviso(), DependenciasAvisos, esquemaCuerpo, esquemaPendiente, estimados(), manejarAvisos() (+12 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 37 - "errores.ts"
Cohesion: 0.13
Nodes (17): ErrorDeRuta(), cargar(), iniciarErrores(), limpiarEvento(), limpiarMiga(), limpiarTexto(), limpiarValor(), reportarError() (+9 more)

### Community 38 - "Cargando"
Cohesion: 0.24
Nodes (14): AlPanelSiEsAdmin(), ADR-0018, Cargando(), activa(), LayoutAdmin(), LayoutReal(), resorte, SECCIONES (+6 more)

### Community 39 - "20261031132532_avisos_web_push.sql"
Cohesion: 0.12
Nodes (10): public.suscripciones_push, public.vencer_tolerancia(), privado.avisar_cambios(), privado.borrar_suscripcion_al_avanzar(), privado.con_aviso_pendiente(), privado.llamar_avisos(), public.avisos_pendientes(), public.reservar_aviso() (+2 more)

### Community 40 - "public.barberias"
Cohesion: 0.19
Nodes (13): barberias_senal, privado.senal_fila(), public.barberias, public.cerrar_dia(), public.fila_publica(), public.reporte_dia(), public.servicios, public.terminar_turno() (+5 more)

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
Cohesion: 0.10
Nodes (20): ERRORES_DE_LA_BASE, esquemaNombre, esquemaTelefono, esquemaTurnoCreado, esquemaUnirse, ESTADO_HTTP, hmacHex(), limpiarNombre() (+12 more)

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
Cohesion: 0.15
Nodes (7): admin, consultarBase(), DependenciasSalud, esquemaEstado, manejarSalud(), Resultado, HORA

### Community 54 - "PantallaTv.tsx"
Cohesion: 0.19
Nodes (18): BotonMarca(), Marquesina(), Inicio(), Anuncio(), BANDA, ColumnaBarbero(), ESTADO, PantallaTv() (+10 more)

### Community 55 - "revisar-build.mjs"
Cohesion: 0.18
Nodes (10): archivosDe(), buscarSecretos(), leerEnv(), RAIZ, REGLAS, revisar(), rolDelJwt(), TEXTO (+2 more)

### Community 58 - "revisar-produccion.mjs"
Cohesion: 0.20
Nodes (7): boleto, ICONOS, publico, RAIZ, revisarVariables(), produccion, pruebas

### Community 59 - "lib/unirse.ts"
Cohesion: 0.15
Nodes (13): Fuente, anotarse(), claveDe(), ErrorUnirse, esCodigo(), guardarSecreto(), leerSecreto(), MENSAJES (+5 more)

### Community 61 - "dueno.ts"
Cohesion: 0.11
Nodes (22): ResumenReal(), BarberiaDueno, BarberoDueno, cargarResumen(), DatosResumen, ejecutar(), ErrorDueno, esquemaReporte (+14 more)

### Community 62 - "fila.ts"
Cohesion: 0.06
Nodes (44): VistaTv, detalleBarbero(), ResumenBarbero, resumirFila(), tonoDe(), TONOS, ANUNCIO_MS, columnasTv() (+36 more)

### Community 64 - "panel.test.tsx"
Cohesion: 0.20
Nodes (5): BARBERIA, BARBERO, falso, SERVICIOS, TurnoPersonal

### Community 65 - "Turnstile.tsx"
Cohesion: 0.33
Nodes (4): ApiTurnstile, cargarTurnstile(), Turnstile(), Window

### Community 66 - "manejarUnirse"
Cohesion: 0.33
Nodes (4): Dependencias, encabezadosCors(), errorDeLaBase(), manejarUnirse()

### Community 67 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 69 - "avisos/index.ts"
Cohesion: 0.40
Nodes (3): admin, clave, claves

### Community 70 - "dueno.test.tsx"
Cohesion: 0.18
Nodes (10): BARBERIA, CARLOS, comoDueno(), conConfiguracion(), falso, JORGE, REPORTE, turno() (+2 more)

### Community 71 - "CambiarClave.tsx"
Cohesion: 0.46
Nodes (7): BotonPrincipal(), CambiarClave(), enviar(), ADR-0017, destinoAlEntrar(), cambiarClave(), problemaClave()

### Community 73 - "lib/avisos.ts"
Cohesion: 0.15
Nodes (23): activadosAntes(), activarAvisos(), avisoLocal(), avisosActivos(), clavePublica(), confirmarEnElTelefono(), desdePantallaDeInicio(), DESPUES_DE (+15 more)

### Community 74 - "FilaPublica.tsx"
Cohesion: 0.20
Nodes (16): Digito(), DIGITOS, NumeroAnimado(), Props, SinConexion(), FilaPrototipo(), FilaPublica(), FilaReal() (+8 more)

### Community 76 - "lib/cuentas.test.ts"
Cohesion: 0.60
Nodes (3): ClaveTemporal(), copiar(), mensajeDeAcceso()

### Community 77 - "claves-vapid.mjs"
Cohesion: 0.20
Nodes (5): archivo, carpeta, env, ENV_LOCAL, publica

### Community 78 - "Tono"
Cohesion: 0.33
Nodes (7): VistaPanel, Miembro, VistaResumen, ServicioSilla, SillaVista, VistaFilaProps, Tono

## Knowledge Gaps
- **43 isolated node(s):** `ADR-0018`, `ADR-0017`, `ADR-0017`, `ADR-0018`, `ADR-0018` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 418 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cx()` connect `cx` to `Unirse.tsx`, `Cargando`, `CambiarClave.tsx`, `useTitulo`, `FilaPublica.tsx`, `Configuracion.tsx`, `Diagnostico.tsx`, `Resumen.tsx`, `PanelBarbero.tsx`, `PantallaTv.tsx`, `Turno.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `ADR-0018`, `ADR-0017`, `ADR-0017` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._
- **Why does `useTitulo()` connect `useTitulo` to `Unirse.tsx`, `Cargando`, `CambiarClave.tsx`, `PantallaTv.tsx`, `FilaPublica.tsx`, `Configuracion.tsx`, `lib/cuentas.ts`, `Entrar.tsx`, `Diagnostico.tsx`, `Resumen.tsx`, `PanelBarbero.tsx`, `cx`, `PantallaTv.tsx`, `Turno.tsx`, `dueno.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.12333333333333334 - nodes in this community are weakly interconnected._
- **Why does `Cargando()` connect `Cargando` to `Unirse.tsx`, `errores.ts`, `CambiarClave.tsx`, `useTitulo`, `FilaPublica.tsx`, `Configuracion.tsx`, `lib/cuentas.ts`, `Entrar.tsx`, `Resumen.tsx`, `PanelBarbero.tsx`, `cx`, `PantallaTv.tsx`, `Turno.tsx`, `dueno.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.10227272727272728 - nodes in this community are weakly interconnected._