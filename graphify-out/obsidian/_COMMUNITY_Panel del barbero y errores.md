---
type: community
cohesion: 0.20
members: 10
---

# Panel del barbero y errores

**Cohesion:** 0.20 - loosely connected
**Members:** 10 nodes

## Members
- [[Botón wa.me]] - concept - README.md
- [[Clave de idempotencia al anotarse]] - concept - docs/seguridad.md
- [[Fallo 8 · Manejo de errores]] - concept - docs/seguridad.md
- [[Llamar siguiente con FOR UPDATE SKIP LOCKED]] - concept - docs/seguridad.md
- [[Límites del plan gratuito de Supabase]] - concept - README.md
- [[Panel del barbero]] - concept - README.md
- [[Pausa de la fila remota]] - rationale - README.md
- [[Roles dueno y barbero]] - concept - docs/seguridad.md
- [[Sentry]] - concept - docs/seguridad.md
- [[Siguiente (producto)]] - concept - README.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Panel_del_barbero_y_errores
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Base de datos, seguridad y tiempo real]]
- 4 edges to [[_COMMUNITY_Documentación, decisiones y piloto]]
- 3 edges to [[_COMMUNITY_Problema, evidencia y mercado]]
- 2 edges to [[_COMMUNITY_Stack, arquitectura y sprints]]

## Top bridge nodes
- [[Fallo 8 · Manejo de errores]] - degree 7, connects to 3 communities
- [[Siguiente (producto)]] - degree 5, connects to 2 communities
- [[Pausa de la fila remota]] - degree 4, connects to 2 communities
- [[Panel del barbero]] - degree 6, connects to 1 community
- [[Roles dueno y barbero]] - degree 2, connects to 1 community