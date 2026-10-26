---
type: community
cohesion: 0.15
members: 24
---

# Stack, hosting y antiabuso

**Cohesion:** 0.15 - loosely connected
**Members:** 24 nodes

## Members
- [[ADR-002 · Stack Supabase + Cloudflare Pages]] - rationale - docs/decisiones.md
- [[ADR-005 · Hosting en Cloudflare Workers]] - rationale - docs/decisiones.md
- [[Arquitectura]] - concept - README.md
- [[Calendario de 8 semanas]] - concept - docs/plan-implementacion.md
- [[Claves nuevas de Supabase (sb_publishable  sb_secret)]] - rationale - docs/plan-implementacion.md
- [[Cloudflare Turnstile]] - concept - README.md
- [[Cloudflare Workers (hosting estático)]] - concept - README.md
- [[Costos en planes gratuitos]] - concept - docs/plan-implementacion.md
- [[Fallo 10 · Monitoreo, logs y alertas]] - concept - docs/seguridad.md
- [[Fallo 9 · Rate limiting]] - concept - docs/seguridad.md
- [[Inundación de la fila]] - concept - docs/seguridad.md
- [[PHP + MySQL (alternativa descartada)]] - concept - docs/decisiones.md
- [[Pausa automática de la fila remota]] - concept - docs/seguridad.md
- [[Pausa de la fila remota]] - concept - README.md
- [[Recortes si no alcanza el tiempo]] - rationale - docs/plan-implementacion.md
- [[Resend (SMTP de Auth)]] - concept - docs/plan-implementacion.md
- [[Sentry (errores sin datos personales)]] - concept - README.md
- [[Sprint 0 · Entorno y pruebas de riesgo]] - concept - docs/plan-implementacion.md
- [[Sprint 4 · Dueño, antiabuso y lanzamiento]] - concept - docs/plan-implementacion.md
- [[Stack v0.1 con versiones]] - concept - docs/plan-implementacion.md
- [[Supabase (Postgres, Auth, Realtime, Edge Functions)]] - concept - README.md
- [[Supabase MCP]] - concept - docs/plan-implementacion.md
- [[Vercel (alternativa descartada)]] - concept - docs/decisiones.md
- [[Workers en lugar de Pages]] - rationale - docs/plan-implementacion.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Stack_hosting_y_antiabuso
SORT file.name ASC
```

## Connections to other communities
- 18 edges to [[_COMMUNITY_Investigación y documentación]]
- 10 edges to [[_COMMUNITY_Base de datos y seguridad]]
- 9 edges to [[_COMMUNITY_Avisos, tiempo real y privacidad]]
- 3 edges to [[_COMMUNITY_Herramientas de desarrollo]]
- 2 edges to [[_COMMUNITY_Producto y competencia]]
- 1 edge to [[_COMMUNITY_Validación, piloto y métricas]]
- 1 edge to [[_COMMUNITY_Validación de entrada]]

## Top bridge nodes
- [[Stack v0.1 con versiones]] - degree 10, connects to 3 communities
- [[Fallo 9 · Rate limiting]] - degree 8, connects to 3 communities
- [[ADR-002 · Stack Supabase + Cloudflare Pages]] - degree 10, connects to 2 communities
- [[Fallo 10 · Monitoreo, logs y alertas]] - degree 8, connects to 2 communities
- [[ADR-005 · Hosting en Cloudflare Workers]] - degree 7, connects to 2 communities