# Graph Report - NextCut  (2026-11-05)

## Corpus Check
- 126 files · ~115,047 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 2, .toml 2)

## Summary
- 1149 nodes · 2882 edges · 64 communities (48 shown, 16 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 177 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a8be9e7`
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
- lib/avisos.ts
- PantallaTv.tsx
- Variables de entorno
- Configuracion.tsx
- fila.ts
- cx
- concurrencia.mjs
- dueno.ts
- Stack v0.1 con versiones
- e2e/utilidades.ts
- panel.ts
- dueno.test.tsx
- FilaPublica.tsx
- Turno.tsx
- router.tsx
- LayoutDueno.tsx
- Fallo 2 · Endpoints expuestos
- public.estado_salud
- Unirse.tsx
- PanelBarbero.tsx
- webpush.ts
- imports
- errores.ts
- cx
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
- panel.test.tsx
- claves-vapid.mjs
- revisar-build.mjs
- ref_node_fs
- database.types.ts
- 20261102125411_pausa_automatica.sql
- revisar-produccion.mjs
- Tono

## God Nodes (most connected - your core abstractions)
1. `cx()` - 50 edges
2. `public.turnos` - 39 edges
3. `useTitulo()` - 34 edges
4. `Franjas()` - 33 edges
5. `Cargando()` - 23 edges
6. `PanelReal()` - 22 edges
7. `Seguridad` - 22 edges
8. `BotonMarca()` - 21 edges
9. `Plan de implementación` - 21 edges
10. `public.barberias` - 19 edges

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

## Communities (64 total, 16 thin omitted)

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
Cohesion: 0.09
Nodes (27): eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, miembros_barberia_idx, privado.es_dueno(), privado.es_miembro(), privado.proteger_eventos(), privado.registrar_evento_turno() (+19 more)

### Community 4 - "turno.ts"
Cohesion: 0.13
Nodes (15): Database, EstadoFila, EstadoTurno, ADR-0007, useSenalFila(), useTurno(), supabase, ACTIVOS (+7 more)

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.14
Nodes (26): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+18 more)

### Community 6 - "PantallaTv.tsx"
Cohesion: 0.12
Nodes (25): DatosTurno, useIntervalo(), useReloj(), barberia, Barbero, barberos, buscarServicio(), DOMINIO (+17 more)

### Community 7 - "lib/avisos.ts"
Cohesion: 0.15
Nodes (23): activadosAntes(), activarAvisos(), avisoLocal(), avisosActivos(), clavePublica(), confirmarEnElTelefono(), desdePantallaDeInicio(), DESPUES_DE (+15 more)

### Community 8 - "PantallaTv.tsx"
Cohesion: 0.15
Nodes (20): SinConexion(), Anuncio(), BANDA, ESTADO, PantallaTv(), TableroPrototipo(), TableroReal(), VistaTv (+12 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Configuracion.tsx"
Cohesion: 0.06
Nodes (65): claseCampo, BarraGuardar(), Cambiar, Campo(), Configuracion(), ConfiguracionPrototipo(), ConfiguracionReal(), guardar() (+57 more)

### Community 12 - "fila.ts"
Cohesion: 0.06
Nodes (36): ResumenBarbero, TONOS, ANUNCIO_MS, detectarLlamados(), LlamadosVistos, conLlamado(), libre(), useAnuncios() (+28 more)

### Community 13 - "cx"
Cohesion: 0.18
Nodes (15): Franjas(), FranjasProps, Marca(), AbrirMenu, MarcoPrototipo(), MenuPantallas(), CodigoQr(), Estilo (+7 more)

### Community 14 - "concurrencia.mjs"
Cohesion: 0.08
Nodes (29): admin, anotados, conteo, encabezados, inicio, rpc(), segundos, estado() (+21 more)

### Community 15 - "dueno.ts"
Cohesion: 0.09
Nodes (33): AccionesResumen, AlertaPico(), CLASES, FilaAhora(), FilaVista, HorasPico(), Indicador, minutosDesde() (+25 more)

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.27
Nodes (10): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Arquitectura, Cloudflare Workers (hosting estático) (+2 more)

### Community 20 - "e2e/utilidades.ts"
Cohesion: 0.23
Nodes (15): ADR-0014, anotarPorApi(), BARBERO_CLAVE, BARBERO_CORREO, cancelarPorApi(), CLAVE, datosTurno(), encabezados (+7 more)

### Community 21 - "panel.ts"
Cohesion: 0.14
Nodes (22): PanelBarbero(), PanelReal(), SinSilla(), BarberiaPanel, BarberoPanel, cargarPanel(), diaEn(), ejecutar() (+14 more)

### Community 22 - "dueno.test.tsx"
Cohesion: 0.18
Nodes (10): BARBERIA, CARLOS, comoDueno(), conConfiguracion(), falso, JORGE, REPORTE, turno() (+2 more)

### Community 23 - "FilaPublica.tsx"
Cohesion: 0.25
Nodes (16): BarraPoste(), FilaPrototipo(), FilaPublica(), FilaReal(), Tarjeta(), VistaFila(), useFilaPublica(), detalleBarbero() (+8 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.09
Nodes (34): Cargando(), Acciones, ADELANTE, aparecer, Atendido(), Cancelar(), COLOR_BARRA, ControlAvisos (+26 more)

### Community 25 - "router.tsx"
Cohesion: 0.14
Nodes (10): ErrorDeRuta(), ACTUALIZADO, Dato(), Privacidad(), Seccion(), raiz, configuracionDueno, qrDueno (+2 more)

### Community 27 - "LayoutDueno.tsx"
Cohesion: 0.17
Nodes (21): Poste(), BotonMarca(), destinoAlEntrar(), Entrar(), enviar(), Contexto, ContextoDueno, LayoutDueno() (+13 more)

### Community 28 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.08
Nodes (44): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Funciones de la base (security definer), Prueba de riesgo 3 · Turnstile + IP, Sprint 1 · Base de datos y seguridad, Adivinar códigos de turno, Amenazas propias de una fila virtual (+36 more)

### Community 32 - "Unirse.tsx"
Cohesion: 0.09
Nodes (34): NoEncontrado(), ApiTurnstile, cargarTurnstile(), Turnstile(), Window, Dato(), deslizar, Envio (+26 more)

### Community 33 - "PanelBarbero.tsx"
Cohesion: 0.15
Nodes (16): AccionesPanel, ActualVista, Anillo(), colaInicial, enSilla, Fase, METODOS, minutosDesde() (+8 more)

### Community 35 - "webpush.ts"
Cohesion: 0.06
Nodes (49): RFC-8188, RFC-8292, admin, clave, claves, Aviso, crearAviso(), decidirAviso() (+41 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 37 - "errores.ts"
Cohesion: 0.35
Nodes (9): cargar(), iniciarErrores(), limpiarEvento(), limpiarMiga(), limpiarTexto(), limpiarValor(), reportarError(), Sdk (+1 more)

### Community 38 - "cx"
Cohesion: 0.13
Nodes (27): Digito(), DIGITOS, NumeroAnimado(), Props, Avatar(), Boleto(), BotonPrincipal(), Confeti() (+19 more)

### Community 39 - "20261031132532_avisos_web_push.sql"
Cohesion: 0.12
Nodes (10): public.suscripciones_push, public.vencer_tolerancia(), privado.avisar_cambios(), privado.borrar_suscripcion_al_avanzar(), privado.con_aviso_pendiente(), privado.llamar_avisos(), public.avisos_pendientes(), public.reservar_aviso() (+2 more)

### Community 40 - "public.barberias"
Cohesion: 0.15
Nodes (18): barberias_senal, barberos_senal, barberos_user_idx, privado.puede_atender(), privado.senal_fila(), public.barberias, public.barberos, public.cerrar_dia() (+10 more)

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
Nodes (32): admin, consultarBase(), DependenciasSalud, esquemaEstado, manejarSalud(), Resultado, HORA, DatosUnirse (+24 more)

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

### Community 53 - "panel.test.tsx"
Cohesion: 0.20
Nodes (5): BARBERIA, BARBERO, falso, SERVICIOS, TurnoPersonal

### Community 54 - "claves-vapid.mjs"
Cohesion: 0.20
Nodes (5): archivo, carpeta, env, ENV_LOCAL, publica

### Community 55 - "revisar-build.mjs"
Cohesion: 0.22
Nodes (8): archivosDe(), buscarSecretos(), RAIZ, REGLAS, revisar(), rolDelJwt(), TEXTO, valoresProhibidos()

### Community 58 - "ref_node_fs"
Cohesion: 0.20
Nodes (3): ICONOS, poste, publico

### Community 59 - "database.types.ts"
Cohesion: 0.20
Nodes (9): CompositeTypes, Constants, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables, TablesInsert (+1 more)

### Community 61 - "revisar-produccion.mjs"
Cohesion: 0.28
Nodes (6): leerEnv(), leerPruebas(), RAIZ, revisarVariables(), produccion, pruebas

### Community 62 - "Tono"
Cohesion: 0.22
Nodes (7): VistaPanel, Miembro, VistaResumen, VistaFilaProps, Fuente, ResultadoUnirse, Tono

## Knowledge Gaps
- **30 isolated node(s):** `RFC-8291`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `RFC-8291` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 362 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `rpc()` connect `concurrencia.mjs` to `fila.ts`, `lib/avisos.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `RFC-8291`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._
- **Why does `cx()` connect `cx` to `Unirse.tsx`, `PanelBarbero.tsx`, `PantallaTv.tsx`, `Configuracion.tsx`, `Diagnostico.tsx`, `cx`, `dueno.ts`, `FilaPublica.tsx`, `Turno.tsx`, `LayoutDueno.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.12333333333333334 - nodes in this community are weakly interconnected._
- **Why does `useTitulo()` connect `FilaPublica.tsx` to `Unirse.tsx`, `PanelBarbero.tsx`, `cx`, `PantallaTv.tsx`, `PantallaTv.tsx`, `Configuracion.tsx`, `Diagnostico.tsx`, `cx`, `dueno.ts`, `panel.ts`, `Turno.tsx`, `router.tsx`, `LayoutDueno.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.08819345661450925 - nodes in this community are weakly interconnected._