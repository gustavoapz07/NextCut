---
type: community
cohesion: 0.18
members: 27
---

# Base de datos y seguridad

**Cohesion:** 0.18 - loosely connected
**Members:** 27 nodes

## Members
- [[ADR-004 · Sin pagos en línea en el MVP]] - rationale - docs/decisiones.md
- [[ADR-007 · Anotarse por Edge Function y tiempo real solo con señales]] - rationale - docs/decisiones.md
- [[Adivinar códigos de turno]] - concept - docs/seguridad.md
- [[Amenazas propias de una fila virtual]] - concept - docs/seguridad.md
- [[Bitácora de eventos (eventos_turno)]] - concept - docs/seguridad.md
- [[Canal público filabarberia_id (señal vacía)]] - rationale - docs/decisiones.md
- [[Clave publicable y clave secreta de Supabase]] - concept - docs/seguridad.md
- [[Edge Function unirse-a-fila]] - concept - docs/decisiones.md
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
- [[Pruebas pgTAP]] - concept - docs/seguridad.md
- [[Row Level Security (RLS)]] - concept - docs/seguridad.md
- [[Sprint 1 · Base de datos y seguridad]] - concept - docs/plan-implementacion.md
- [[Tabla turnos (codigo_publico aleatorio)]] - concept - README.md
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
- 19 edges to [[_COMMUNITY_Stack, arquitectura y Sprint 0]]
- 12 edges to [[_COMMUNITY_Documentación y decisiones]]
- 8 edges to [[_COMMUNITY_Antiabuso y monitoreo]]
- 6 edges to [[_COMMUNITY_Problema, evidencia y validación]]
- 3 edges to [[_COMMUNITY_Herramientas de desarrollo]]
- 2 edges to [[_COMMUNITY_Avisos y panel del barbero]]

## Top bridge nodes
- [[Funciones de la base (security definer)]] - degree 9, connects to 4 communities
- [[Amenazas propias de una fila virtual]] - degree 7, connects to 4 communities
- [[Fallo 2 · Endpoints expuestos]] - degree 19, connects to 3 communities
- [[Tabla turnos (codigo_publico aleatorio)]] - degree 9, connects to 3 communities
- [[Fallo 5 · Datos sensibles]] - degree 8, connects to 3 communities