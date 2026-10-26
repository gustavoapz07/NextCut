---
type: community
cohesion: 0.14
members: 30
---

# Base de datos y seguridad

**Cohesion:** 0.14 - loosely connected
**Members:** 30 nodes

## Members
- [[ADR-004 · Sin pagos en línea en el MVP]] - rationale - docs/decisiones.md
- [[ADR-007 · Anotarse por Edge Function y tiempo real solo con señales]] - rationale - docs/decisiones.md
- [[Adivinar códigos de turno]] - concept - docs/seguridad.md
- [[Amenazas propias de una fila virtual]] - concept - docs/seguridad.md
- [[Bitácora de eventos (eventos_turno)]] - concept - docs/seguridad.md
- [[Canal público filabarberia_id (señal vacía)]] - rationale - docs/decisiones.md
- [[Clave de idempotencia al anotarse]] - concept - docs/seguridad.md
- [[Clave publicable y clave secreta de Supabase]] - concept - docs/seguridad.md
- [[Edge Function unirse-a-fila]] - concept - docs/decisiones.md
- [[Fallo 2 · Endpoints expuestos]] - concept - docs/seguridad.md
- [[Fallo 7 · Permisos excesivos]] - concept - docs/seguridad.md
- [[Fallo 8 · Manejo de errores]] - concept - docs/seguridad.md
- [[Fuga de datos entre barberías]] - concept - docs/seguridad.md
- [[Funciones de la base (security definer)]] - concept - docs/plan-implementacion.md
- [[Funciones security definer con search_path fijo]] - concept - docs/seguridad.md
- [[Función unirse_a_fila]] - concept - docs/seguridad.md
- [[Llamar siguiente con FOR UPDATE SKIP LOCKED]] - concept - docs/seguridad.md
- [[Modelo de datos]] - concept - README.md
- [[Montos alterados por el barbero]] - concept - docs/seguridad.md
- [[Row Level Security (RLS)]] - concept - docs/seguridad.md
- [[Security Advisor de Supabase]] - concept - docs/seguridad.md
- [[Sentry]] - concept - docs/seguridad.md
- [[Sprint 1 · Base de datos y seguridad]] - concept - docs/plan-implementacion.md
- [[Tabla turnos (codigo_publico aleatorio)]] - concept - README.md
- [[Turnos fantasma]] - concept - docs/seguridad.md
- [[Vista fila_publica]] - concept - docs/seguridad.md
- [[cancelar_turno(codigo, secreto)]] - concept - docs/seguridad.md
- [[codigo_publico aleatorio]] - concept - docs/seguridad.md
- [[suscribir_push(codigo, secreto, suscripcion)]] - concept - docs/decisiones.md
- [[ver_turno(codigo)]] - concept - docs/seguridad.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Base_de_datos_y_seguridad
SORT file.name ASC
```

## Connections to other communities
- 19 edges to [[_COMMUNITY_Investigación y documentación]]
- 10 edges to [[_COMMUNITY_Stack, hosting y antiabuso]]
- 9 edges to [[_COMMUNITY_Avisos, tiempo real y privacidad]]
- 4 edges to [[_COMMUNITY_Herramientas de desarrollo]]
- 2 edges to [[_COMMUNITY_Validación de entrada]]
- 2 edges to [[_COMMUNITY_Producto y competencia]]

## Top bridge nodes
- [[Funciones de la base (security definer)]] - degree 9, connects to 4 communities
- [[Fallo 7 · Permisos excesivos]] - degree 14, connects to 3 communities
- [[Edge Function unirse-a-fila]] - degree 8, connects to 3 communities
- [[Amenazas propias de una fila virtual]] - degree 7, connects to 3 communities
- [[Fallo 2 · Endpoints expuestos]] - degree 18, connects to 2 communities