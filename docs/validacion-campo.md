# Validación de campo

**Proyecto:** [Siguiente](../README.md) · **Fecha:** 25 de octubre de 2026 · **Estado:** pendiente
**Relacionado:** [Investigación](investigacion.md#8-lo-que-no-sabemos-y-cómo-lo-vamos-a-medir) · [Decisiones](decisiones.md) · [Plan de implementación](plan-implementacion.md) · [Bitácora](bitacora.md)

La investigación encontró evidencia fuerte del **mecanismo** (una fila larga y de duración desconocida espanta clientes), pero ningún dato de **cuánto** pasa en barberías hondureñas. Este plan cubre ese vacío en dos semanas y antes de escribir código.

---

## 1. Objetivos

1. Medir cuántos clientes se van por la espera en un sábado.
2. Saber qué parte de la clientela llega sin cita y cómo agendan los demás.
3. Conocer el ticket promedio y el modelo de pago a los barberos.
4. Obtener un rango de precio que el dueño pagaría.

## 2. Entrevistas a dueños

**Muestra:** 8 a 10 barberías en El Progreso y San Pedro Sula, combinando de 1 a 2 sillas, de 3 a 5 sillas, de barrio y de centro comercial.

**Reglas** (método *The Mom Test*): preguntar por hechos pasados y concretos, no por opiniones sobre el futuro. No mencionar la idea del producto hasta el final. No tomar un "qué buena idea" como validación.

### Guion (20 minutos)

**Contexto**
1. ¿Cuántos barberos trabajan aquí y qué días abren?
2. ¿Qué días y a qué horas se llena más?

**La fila** (P2)
3. Cuénteme el sábado pasado: ¿a qué hora se llenó y cuántas personas llegaron a estar esperando al mismo tiempo, como máximo?
4. ¿Vio a alguien irse sin cortarse? ¿Cuántos, más o menos? ¿Cómo lo sabe?
5. ¿Cómo deciden a quién le toca? ¿Ha habido discusiones por el turno?
6. ¿Algún cliente le escribe antes para preguntar cuánta gente hay?

**Citas** (P1)
7. ¿Atienden con cita? ¿Por dónde las reciben (WhatsApp, llamada, Instagram)?
8. La semana pasada, ¿cuántas citas no llegaron o cancelaron tarde?

**Caja y comisiones** (P3)
9. ¿Cómo le paga a los barberos? (comisión, porcentaje, renta de silla)
10. ¿Cómo sabe cuántos servicios hizo cada uno al final del día?

**Lo que ya probaron**
11. ¿Ha usado alguna app, lista en papel o grupo de WhatsApp para esto? ¿Por qué la dejó?

**Números**
12. ¿Cuánto cuesta el corte que más vende? ¿Cuántos cortes hacen en un sábado normal?

**Precio** (solo al final, después de describir Siguiente en dos frases)
13. ¿A qué precio al mes le parecería tan barato que dudaría de que funcione?
14. ¿A qué precio le parecería barato?
15. ¿A qué precio le parecería caro, pero lo pagaría?
16. ¿A qué precio no lo pagaría?
17. ¿Me dejaría probarlo gratis un mes en su barbería? (Un "sí" con fecha vale más que cualquier elogio).

### Registro por entrevista

| Campo | Valor |
|---|---|
| Barbería / zona | |
| Sillas | |
| % que llega sin cita (estimado del dueño) | |
| Máximo de personas esperando el sábado pasado | |
| Abandonos que recuerda (sábado pasado) | |
| Ticket del corte más vendido (L) | |
| Cortes en un sábado | |
| Canal de citas | |
| Modelo de pago al barbero | |
| Herramientas probadas | |
| Precios: muy barato / barato / caro / no pagaría (L) | |
| ¿Acepta piloto? ¿Fecha? | |

## 3. Hoja de observación (sábado)

Con permiso del dueño, un observador se sienta 3 horas en la franja más llena. **No se anotan nombres, fotos ni datos de clientes:** solo conteos.

| Hora | Personas esperando (conteo cada 15 min) | Llegadas | **Abandonos** | Notas |
|---|---|---|---|---|
| 09:00 | | | | |
| 09:15 | | | | |
| … | | | | |

**Abandono:** una persona que entra o se asoma y se va en menos de 5 minutos sin ser atendida, o que espera y se va antes de su turno.

**Espera de muestra:** cronometrar a 3 clientes desde que llegan hasta que se sientan en la silla.

Hacer el conteo en 3 barberías distintas, o 3 sábados en la misma, para no sacar conclusiones de un solo día.

## 4. Criterios de decisión (propuestos)

| Resultado | Decisión |
|---|---|
| Al menos 5 de 8 dueños recuerdan abandonos el sábado pasado **y** el conteo registra abandonos en al menos 2 de 3 sábados | **Seguir** con el MVP de fila virtual |
| Abandonos raros, pero la mayoría agenda por WhatsApp y reporta inasistencias | **Ajustar:** priorizar citas híbridas (P1) dentro del mismo producto |
| Abandonos raros y el dolor más repetido es el control de caja | **Ajustar:** empezar por cierre de caja y comisiones (P3) |
| Nadie acepta un piloto gratis | **Detener** y revisar el problema antes de programar |

Los umbrales son una propuesta del autor para evitar decidir por intuición. Se pueden ajustar, pero hay que fijarlos **antes** de salir al campo.

## 5. Cómo convertir los resultados en dinero

```text
Pérdida mensual estimada = abandonos por día pico × ticket promedio × días pico al mes
```

Los tres valores salen de la sección 2 y la sección 3. No se rellenan con supuestos. El resultado se compara con el precio del plan: si la pérdida mensual supera varias veces el precio, el argumento de venta se sostiene solo.

## 6. Resultados

*(Pendiente. Se completa al terminar el trabajo de campo y se registra en la [bitácora](bitacora.md)).*
