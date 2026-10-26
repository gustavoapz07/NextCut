---
type: community
cohesion: 0.24
members: 11
---

# Avisos y panel del barbero

**Cohesion:** 0.24 - loosely connected
**Members:** 11 nodes

## Members
- [[ADR-003 · Notificaciones sin API de WhatsApp]] - rationale - docs/decisiones.md
- [[Botón wa.me]] - concept - README.md
- [[Cambio de precios de WhatsApp (1102026)]] - concept - docs/investigacion.md
- [[Cuotas por barbería]] - concept - docs/seguridad.md
- [[Fallo 6 · Sin límite de tokens]] - concept - docs/seguridad.md
- [[Modelo de negocio (hipótesis)]] - rationale - README.md
- [[Notificaciones sin costo variable]] - rationale - README.md
- [[Panel del barbero]] - concept - README.md
- [[Resend (SMTP de Auth)]] - concept - docs/plan-implementacion.md
- [[Roles dueno y barbero]] - concept - docs/seguridad.md
- [[Sprint 3 · Barbero, TV y avisos]] - concept - docs/plan-implementacion.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Avisos_y_panel_del_barbero
SORT file.name ASC
```

## Connections to other communities
- 6 edges to [[_COMMUNITY_Stack, arquitectura y Sprint 0]]
- 4 edges to [[_COMMUNITY_Problema, evidencia y validación]]
- 4 edges to [[_COMMUNITY_Documentación y decisiones]]
- 2 edges to [[_COMMUNITY_Base de datos y seguridad]]
- 1 edge to [[_COMMUNITY_Antiabuso y monitoreo]]
- 1 edge to [[_COMMUNITY_Competencia y mercado]]

## Top bridge nodes
- [[Panel del barbero]] - degree 6, connects to 3 communities
- [[ADR-003 · Notificaciones sin API de WhatsApp]] - degree 7, connects to 2 communities
- [[Fallo 6 · Sin límite de tokens]] - degree 5, connects to 2 communities
- [[Cambio de precios de WhatsApp (1102026)]] - degree 4, connects to 2 communities
- [[Resend (SMTP de Auth)]] - degree 3, connects to 2 communities