# Graph Report - NextCut  (2026-11-02)

## Corpus Check
- 118 files · ~108,366 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 4, .toml 2, .example 1)

## Summary
- 1097 nodes · 2793 edges · 55 communities (40 shown, 15 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 177 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d634adc`
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
- lib/avisos.ts
- Fallo 2 · Endpoints expuestos
- Variables de entorno
- Configuracion.tsx
- fila.ts
- cx
- concurrencia.mjs
- Resumen.tsx
- Stack v0.1 con versiones
- e2e/utilidades.ts
- panel.ts
- PantallaTv.tsx
- database.types.ts
- Turno.tsx
- Turnstile.tsx
- LayoutDueno.tsx
- Fallo 2 · Endpoints expuestos
- public.estado_salud
- Unirse.tsx
- _shared/unirse.ts
- webpush.ts
- imports
- errores.ts
- ref_motion
- 20261031132532_avisos_web_push.sql
- public.barberias
- imports
- Diagnostico.tsx
- ref_zod
- public.unirse_a_fila
- 05_avisos.test.sql
- 07_cierre_y_borrado.test.sql
- imports
- sonido.ts
- sesion.ts
- 20261102125411_pausa_automatica.sql

## God Nodes (most connected - your core abstractions)
1. `cx()` - 50 edges
2. `public.turnos` - 39 edges
3. `useTitulo()` - 32 edges
4. `Franjas()` - 31 edges
5. `Cargando()` - 23 edges
6. `PanelReal()` - 22 edges
7. `Seguridad` - 22 edges
8. `Plan de implementación` - 20 edges
9. `BotonMarca()` - 19 edges
10. `public.barberias` - 19 edges

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

## Communities (55 total, 15 thin omitted)

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
Nodes (27): eventos_turno_barberia_idx, eventos_turno_inmutable, eventos_turno_turno_idx, miembros_barberia_idx, privado.es_dueno(), privado.es_miembro(), privado.proteger_eventos(), privado.registrar_evento_turno() (+19 more)

### Community 4 - "turno.ts"
Cohesion: 0.23
Nodes (10): EstadoFila, EstadoTurno, ADR-0007, useSenalFila(), useTurno(), supabase, ACTIVOS, esquemaTurnoPublico (+2 more)

### Community 5 - "ADR-008 · Desarrollo contra Supabase en la nube, sin Docker local"
Cohesion: 0.15
Nodes (24): Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP), 2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1, 2026-10-26 · Sprint 0: base del proyecto, Biome (lint y formato), Docker local (alternativa descartada), ESLint + Prettier (alternativa descartada), Husky (alternativa descartada), Lefthook (revisiones antes de cada commit) (+16 more)

### Community 6 - "datos.ts"
Cohesion: 0.13
Nodes (22): DatosTurno, barberia, Barbero, barberos, buscarServicio(), DOMINIO, filaInicial, IdBarbero (+14 more)

### Community 7 - "lib/avisos.ts"
Cohesion: 0.13
Nodes (25): ControlAvisos, activadosAntes(), activarAvisos(), avisoLocal(), avisosActivos(), clavePublica(), confirmarEnElTelefono(), desdePantallaDeInicio() (+17 more)

### Community 8 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (20): Funciones de la base (security definer), Riesgos técnicos, Sprint 1 · Base de datos y seguridad, Amenazas propias de una fila virtual, Bitácora de eventos (eventos_turno), Clave de idempotencia al anotarse, Clave publicable y clave secreta de Supabase, Fallo 7 · Permisos excesivos (+12 more)

### Community 9 - "Variables de entorno"
Cohesion: 0.50
Nodes (3): @fontsource-variable/big-shoulders-display, ImportMeta, ImportMetaEnv

### Community 11 - "Configuracion.tsx"
Cohesion: 0.06
Nodes (64): BarraGuardar(), Cambiar, Campo(), Configuracion(), ConfiguracionPrototipo(), ConfiguracionReal(), guardar(), DatosBarberia() (+56 more)

### Community 12 - "fila.ts"
Cohesion: 0.06
Nodes (45): VistaTv, detalleBarbero(), ResumenBarbero, resumirFila(), tonoDe(), TONOS, TurnoPublico, ANUNCIO_MS (+37 more)

### Community 13 - "cx"
Cohesion: 0.13
Nodes (28): ErrorDeRuta(), Franjas(), FranjasProps, Poste(), Marca(), AbrirMenu, MarcoPrototipo(), MenuPantallas() (+20 more)

### Community 14 - "concurrencia.mjs"
Cohesion: 0.08
Nodes (29): admin, anotados, conteo, encabezados, inicio, rpc(), segundos, estado() (+21 more)

### Community 15 - "Resumen.tsx"
Cohesion: 0.05
Nodes (53): VistaPanel, Miembro, useContextoDueno(), BARBERIA, CARLOS, comoDueno(), conConfiguracion(), falso (+45 more)

### Community 19 - "Stack v0.1 con versiones"
Cohesion: 0.27
Nodes (10): PHP + MySQL (alternativa descartada), Supabase Pro a USD 25 al mes (alternativa descartada), Vercel (alternativa descartada), Costos en planes gratuitos, Resend (SMTP de Auth), Stack v0.1 con versiones, Arquitectura, Cloudflare Workers (hosting estático) (+2 more)

### Community 20 - "e2e/utilidades.ts"
Cohesion: 0.09
Nodes (23): ADR-0014, archivo, carpeta, env, ENV_LOCAL, publica, ICONOS, poste (+15 more)

### Community 21 - "panel.ts"
Cohesion: 0.06
Nodes (50): Toast(), useToast(), BARBERIA, BARBERO, falso, SERVICIOS, AccionesPanel, ActualVista (+42 more)

### Community 22 - "PantallaTv.tsx"
Cohesion: 0.21
Nodes (17): NoEncontrado(), SinConexion(), UnirseReal(), Anuncio(), BANDA, ColumnaBarbero(), ESTADO, PantallaTv() (+9 more)

### Community 23 - "database.types.ts"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 24 - "Turno.tsx"
Cohesion: 0.10
Nodes (35): Confeti(), Acciones, ADELANTE, aparecer, Atendido(), BotonAvisos(), Cancelar(), COLOR_BARRA (+27 more)

### Community 25 - "Turnstile.tsx"
Cohesion: 0.33
Nodes (4): ApiTurnstile, cargarTurnstile(), Turnstile(), Window

### Community 27 - "LayoutDueno.tsx"
Cohesion: 0.21
Nodes (17): BotonMarca(), Cargando(), destinoAlEntrar(), Entrar(), enviar(), Contexto, ContextoDueno, LayoutDueno() (+9 more)

### Community 28 - "Fallo 2 · Endpoints expuestos"
Cohesion: 0.13
Nodes (26): Prueba de riesgo 1 superada (Broadcast público con clave publicable), Canal público fila:<barberia_id> (señal vacía), Edge Function unirse-a-fila, Prueba de riesgo 1 · Broadcast público, Prueba de riesgo 3 · Turnstile + IP, Adivinar códigos de turno, Borrado de teléfonos a los 90 días, cancelar_turno(codigo, secreto) (+18 more)

### Community 32 - "Unirse.tsx"
Cohesion: 0.13
Nodes (34): BarraPoste(), Avatar(), Boleto(), FilaPrototipo(), FilaPublica(), FilaReal(), Tarjeta(), VistaFila() (+26 more)

### Community 33 - "_shared/unirse.ts"
Cohesion: 0.07
Nodes (35): anotarse(), claveDe(), ErrorUnirse, esCodigo(), guardarSecreto(), leerSecreto(), MENSAJES, ADR-0007 (+27 more)

### Community 35 - "webpush.ts"
Cohesion: 0.06
Nodes (49): RFC-8188, RFC-8292, admin, clave, claves, Aviso, crearAviso(), decidirAviso() (+41 more)

### Community 36 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 37 - "errores.ts"
Cohesion: 0.18
Nodes (11): cargar(), iniciarErrores(), limpiarEvento(), limpiarMiga(), limpiarTexto(), limpiarValor(), reportarError(), Sdk (+3 more)

### Community 38 - "ref_motion"
Cohesion: 0.50
Nodes (4): Digito(), DIGITOS, NumeroAnimado(), Props

### Community 39 - "20261031132532_avisos_web_push.sql"
Cohesion: 0.12
Nodes (10): public.suscripciones_push, public.vencer_tolerancia(), privado.avisar_cambios(), privado.borrar_suscripcion_al_avanzar(), privado.con_aviso_pendiente(), privado.llamar_avisos(), public.avisos_pendientes(), public.reservar_aviso() (+2 more)

### Community 40 - "public.barberias"
Cohesion: 0.15
Nodes (18): barberias_senal, barberos_senal, barberos_user_idx, privado.puede_atender(), privado.senal_fila(), public.barberias, public.barberos, public.cerrar_dia() (+10 more)

### Community 41 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 44 - "Diagnostico.tsx"
Cohesion: 0.14
Nodes (22): Diagnostico(), pedir(), probar(), explicar(), Fila(), hora(), Nivel, PERMISOS (+14 more)

### Community 45 - "ref_zod"
Cohesion: 0.20
Nodes (6): consultarBase(), DependenciasSalud, esquemaEstado, manejarSalud(), Resultado, HORA

### Community 46 - "public.unirse_a_fila"
Cohesion: 0.17
Nodes (3): privado.senal_fila(), public.fila_publica(), public.unirse_a_fila()

### Community 47 - "05_avisos.test.sql"
Cohesion: 0.33
Nodes (3): pg_temp.codigo(), pg_temp.en_cola(), pg_temp.id()

### Community 50 - "imports"
Cohesion: 0.50
Nodes (3): imports, @supabase/supabase-js, zod

### Community 53 - "sonido.ts"
Cohesion: 0.60
Nodes (4): ConAudioViejo, crearContexto(), prepararSonido(), tocarTonos()

### Community 55 - "sesion.ts"
Cohesion: 0.15
Nodes (6): EstadoSesion, MENSAJES_ENTRAR, ResultadoEntrar, resultado, supabase, admin

## Knowledge Gaps
- **30 isolated node(s):** `RFC-8291`, `ADR-0007`, `ADR-0007`, `ADR-0007`, `RFC-8291` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 330 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `rpc()` connect `concurrencia.mjs` to `fila.ts`, `lib/avisos.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `RFC-8291`, `ADR-0007`, `ADR-0007` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Investigación` be split into smaller, more focused modules?**
  _Cohesion score 0.09615384615384616 - nodes in this community are weakly interconnected._
- **Why does `cx()` connect `cx` to `Unirse.tsx`, `ref_motion`, `Configuracion.tsx`, `Diagnostico.tsx`, `Resumen.tsx`, `panel.ts`, `PantallaTv.tsx`, `Turno.tsx`, `LayoutDueno.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `Arquitectura detallada` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Why does `useTitulo()` connect `PantallaTv.tsx` to `Unirse.tsx`, `datos.ts`, `Configuracion.tsx`, `Diagnostico.tsx`, `cx`, `Resumen.tsx`, `panel.ts`, `Turno.tsx`, `LayoutDueno.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `20261027140203_base_de_datos.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.08819345661450925 - nodes in this community are weakly interconnected._