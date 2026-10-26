---
type: community
cohesion: 0.21
members: 12
---

# Antiabuso y monitoreo

**Cohesion:** 0.21 - loosely connected
**Members:** 12 nodes

## Members
- [[Clave de idempotencia al anotarse]] - concept - docs/seguridad.md
- [[Fallo 10 · Monitoreo, logs y alertas]] - concept - docs/seguridad.md
- [[Fallo 8 · Manejo de errores]] - concept - docs/seguridad.md
- [[Fallo 9 · Rate limiting]] - concept - docs/seguridad.md
- [[Inundación de la fila]] - concept - docs/seguridad.md
- [[Llamar siguiente con FOR UPDATE SKIP LOCKED]] - concept - docs/seguridad.md
- [[Pausa automática de la fila remota]] - concept - docs/seguridad.md
- [[Pausa de la fila remota]] - rationale - README.md
- [[Security Advisor de Supabase]] - concept - docs/seguridad.md
- [[Sentry]] - concept - docs/seguridad.md
- [[Sprint 4 · Dueño, antiabuso y lanzamiento]] - concept - docs/plan-implementacion.md
- [[Supabase MCP]] - concept - docs/plan-implementacion.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Antiabuso_y_monitoreo
SORT file.name ASC
```

## Connections to other communities
- 8 edges to [[_COMMUNITY_Base de datos y seguridad]]
- 5 edges to [[_COMMUNITY_Stack, arquitectura y Sprint 0]]
- 5 edges to [[_COMMUNITY_Documentación y decisiones]]
- 2 edges to [[_COMMUNITY_Problema, evidencia y validación]]
- 1 edge to [[_COMMUNITY_Avisos y panel del barbero]]
- 1 edge to [[_COMMUNITY_Herramientas de desarrollo]]

## Top bridge nodes
- [[Fallo 8 · Manejo de errores]] - degree 8, connects to 4 communities
- [[Sprint 4 · Dueño, antiabuso y lanzamiento]] - degree 7, connects to 3 communities
- [[Fallo 9 · Rate limiting]] - degree 6, connects to 3 communities
- [[Pausa de la fila remota]] - degree 5, connects to 3 communities
- [[Fallo 10 · Monitoreo, logs y alertas]] - degree 7, connects to 2 communities