---
type: community
cohesion: 0.10
members: 44
---

# Base de datos, seguridad y tiempo real

**Cohesion:** 0.10 - loosely connected
**Members:** 44 nodes

## Members
- [[2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1]] - document - docs/bitacora.md
- [[ADR-004 · Sin pagos en línea en el MVP]] - rationale - docs/decisiones.md
- [[ADR-007 · Anotarse por Edge Function y tiempo real solo con señales]] - rationale - docs/decisiones.md
- [[Adivinar códigos de turno]] - concept - docs/seguridad.md
- [[Amenazas propias de una fila virtual]] - concept - docs/seguridad.md
- [[Bitácora de eventos (eventos_turno)]] - concept - docs/seguridad.md
- [[Borrado de teléfonos a los 90 días]] - concept - docs/seguridad.md
- [[Canal público filabarberia_id (señal vacía)]] - concept - docs/decisiones.md
- [[Clave publicable y clave secreta de Supabase]] - concept - docs/seguridad.md
- [[Cloudflare Turnstile]] - concept - README.md
- [[Edge Function unirse-a-fila]] - concept - docs/decisiones.md
- [[Estados de un turno]] - concept - README.md
- [[Fallo 10 · Monitoreo, logs y alertas]] - concept - docs/seguridad.md
- [[Fallo 2 · Endpoints expuestos]] - concept - docs/seguridad.md
- [[Fallo 5 · Datos sensibles]] - concept - docs/seguridad.md
- [[Fallo 7 · Permisos excesivos]] - concept - docs/seguridad.md
- [[Fallo 9 · Rate limiting]] - concept - docs/seguridad.md
- [[Fuga de datos entre barberías]] - concept - docs/seguridad.md
- [[Funciones de la base (security definer)]] - rationale - docs/plan-implementacion.md
- [[Funciones security definer con search_path fijo]] - concept - docs/seguridad.md
- [[Función unirse_a_fila]] - concept - docs/seguridad.md
- [[Inundación de la fila]] - concept - docs/seguridad.md
- [[Ley de protección de datos de Honduras (pendiente)]] - concept - docs/seguridad.md
- [[Modelo de datos]] - concept - README.md
- [[Montos alterados por el barbero]] - concept - docs/seguridad.md
- [[Nombre ofensivo o XSS en la TV]] - concept - docs/seguridad.md
- [[Pausa automática de la fila remota]] - concept - docs/seguridad.md
- [[Pendientes antes del piloto]] - document - docs/seguridad.md
- [[Prueba de riesgo 1 superada (Broadcast público con clave publicable)]] - concept - docs/bitacora.md
- [[Prueba de riesgo 1 · Broadcast público]] - concept - docs/plan-implementacion.md
- [[Pruebas de riesgo del Sprint 0 (Broadcast público, Web Push, Turnstile con IP)]] - concept - docs/bitacora.md
- [[Pruebas pgTAP]] - concept - docs/seguridad.md
- [[Row Level Security (RLS)]] - concept - docs/seguridad.md
- [[Security Advisor de Supabase]] - concept - docs/seguridad.md
- [[Sprint 1 · Base de datos y seguridad]] - document - docs/plan-implementacion.md
- [[Tabla turnos (codigo_publico aleatorio)]] - concept - README.md
- [[Tiempo real solo con señales (Broadcast)]] - rationale - docs/plan-implementacion.md
- [[Turnos fantasma]] - concept - docs/seguridad.md
- [[Vista fila_publica]] - concept - docs/seguridad.md
- [[cancelar_turno(codigo, secreto)]] - concept - docs/seguridad.md
- [[codigo_publico aleatorio]] - concept - docs/seguridad.md
- [[gitleaks]] - concept - docs/seguridad.md
- [[suscribir_push(codigo, secreto, suscripcion)]] - concept - docs/decisiones.md
- [[ver_turno(codigo)]] - concept - docs/seguridad.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Base_de_datos_seguridad_y_tiempo_real
SORT file.name ASC
```

## Connections to other communities
- 19 edges to [[_COMMUNITY_Documentación, decisiones y piloto]]
- 16 edges to [[_COMMUNITY_Stack, arquitectura y sprints]]
- 15 edges to [[_COMMUNITY_Herramientas y entorno de desarrollo]]
- 5 edges to [[_COMMUNITY_Panel del barbero y errores]]
- 3 edges to [[_COMMUNITY_Problema, evidencia y mercado]]

## Top bridge nodes
- [[2026-10-26 · Desarrollo sin Docker y prueba de riesgo 1]] - degree 11, connects to 3 communities
- [[Fallo 2 · Endpoints expuestos]] - degree 18, connects to 2 communities
- [[Fallo 7 · Permisos excesivos]] - degree 13, connects to 2 communities
- [[Fallo 5 · Datos sensibles]] - degree 10, connects to 2 communities
- [[Pruebas pgTAP]] - degree 10, connects to 2 communities