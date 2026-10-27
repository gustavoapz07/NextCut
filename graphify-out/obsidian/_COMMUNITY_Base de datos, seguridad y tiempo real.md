---
type: community
cohesion: 0.12
members: 36
---

# Base de datos, seguridad y tiempo real

**Cohesion:** 0.12 - loosely connected
**Members:** 36 nodes

## Members
- [[ADR-004 · Sin pagos en línea en el MVP]] - rationale - docs/decisiones.md
- [[ADR-007 · Anotarse por Edge Function y tiempo real solo con señales]] - rationale - docs/decisiones.md
- [[Adivinar códigos de turno]] - concept - docs/seguridad.md
- [[Amenazas propias de una fila virtual]] - concept - docs/seguridad.md
- [[Arquitectura]] - concept - README.md
- [[Bitácora de eventos (eventos_turno)]] - concept - docs/seguridad.md
- [[Canal público filabarberia_id (señal vacía)]] - concept - docs/decisiones.md
- [[Clave publicable y clave secreta de Supabase]] - concept - docs/seguridad.md
- [[Cloudflare Turnstile]] - concept - README.md
- [[Edge Function unirse-a-fila]] - concept - docs/decisiones.md
- [[Estados de un turno]] - concept - README.md
- [[Fallo 2 · Endpoints expuestos]] - concept - docs/seguridad.md
- [[Fallo 5 · Datos sensibles]] - concept - docs/seguridad.md
- [[Fallo 7 · Permisos excesivos]] - concept - docs/seguridad.md
- [[Fuga de datos entre barberías]] - concept - docs/seguridad.md
- [[Funciones de la base (security definer)]] - concept - docs/plan-implementacion.md
- [[Funciones security definer con search_path fijo]] - concept - docs/seguridad.md
- [[Función unirse_a_fila]] - concept - docs/seguridad.md
- [[Ley de protección de datos de Honduras (pendiente)]] - concept - docs/seguridad.md
- [[Modelo de datos]] - concept - README.md
- [[Montos alterados por el barbero]] - concept - docs/seguridad.md
- [[Pausa de la fila remota]] - concept - README.md
- [[Prueba de riesgo 1 superada (Broadcast público con clave publicable)]] - concept - docs/bitacora.md
- [[Prueba de riesgo 3 · Turnstile + IP]] - concept - docs/plan-implementacion.md
- [[Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP)]] - concept - docs/bitacora.md
- [[Row Level Security (RLS)]] - concept - docs/seguridad.md
- [[Sentry (errores sin datos personales)]] - concept - README.md
- [[Sprint 1 · Base de datos y seguridad]] - concept - docs/plan-implementacion.md
- [[Tabla turnos (codigo_publico aleatorio)]] - concept - README.md
- [[Tiempo real solo con señales (Broadcast)]] - rationale - docs/plan-implementacion.md
- [[Turnos fantasma]] - concept - docs/seguridad.md
- [[Vista fila_publica]] - concept - docs/seguridad.md
- [[cancelar_turno(codigo, secreto)]] - concept - docs/seguridad.md
- [[codigo_publico aleatorio]] - concept - docs/seguridad.md
- [[suscribir_push(codigo, secreto, suscripcion)]] - concept - docs/decisiones.md
- [[ver_turno(codigo)]] - concept - docs/seguridad.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Base_de_datos_seguridad_y_tiempo_real
SORT file.name ASC
```

## Connections to other communities
- 14 edges to [[_COMMUNITY_Herramientas y entorno de desarrollo]]
- 13 edges to [[_COMMUNITY_Bitácora, decisiones y nombre]]
- 11 edges to [[_COMMUNITY_Antiabuso, errores y lanzamiento]]
- 10 edges to [[_COMMUNITY_Avisos, arquitectura y sprints]]
- 7 edges to [[_COMMUNITY_Stack, hosting y costos]]
- 3 edges to [[_COMMUNITY_Problema, evidencia y mercado]]

## Top bridge nodes
- [[Fallo 2 · Endpoints expuestos]] - degree 19, connects to 3 communities
- [[ADR-007 · Anotarse por Edge Function y tiempo real solo con señales]] - degree 13, connects to 3 communities
- [[Fallo 7 · Permisos excesivos]] - degree 13, connects to 3 communities
- [[Arquitectura]] - degree 10, connects to 3 communities
- [[Edge Function unirse-a-fila]] - degree 9, connects to 3 communities