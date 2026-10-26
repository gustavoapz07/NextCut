# Investigación: qué problema de las barberías vale la pena resolver

**Proyecto:** [Siguiente](../README.md) · **Autor:** Gustavo Pérez · **Fecha:** 25 de octubre de 2026
**Relacionado:** [Validación de campo](validacion-campo.md) · [Decisiones](decisiones.md) · [Seguridad](seguridad.md) · [Bitácora](bitacora.md)

---

## 1. Resumen

Comparamos cuatro problemas recurrentes de las barberías con datos públicos y los puntuamos con una matriz de decisión. El que gana, en todos los escenarios de pesos que probamos, es **la fila física incierta**: en las barberías que atienden por orden de llegada, el cliente no sabe cuánto va a esperar, una parte se va sin cortarse y esa venta perdida no queda registrada en ningún lado.

La solución elegida es una **fila virtual híbrida**: el cliente se anota desde un QR o un enlace, ve su posición y el tiempo estimado en vivo y recibe un aviso cuando le toca. Cada turno cerrado registra barbero, servicio y monto, así que el dueño obtiene como subproducto el control de servicios por barbero (el segundo problema de la matriz).

Lo más importante que **todavía no sabemos** es cuántos clientes se van por la espera en barberías hondureñas. No encontramos ese dato publicado, así que antes de programar hay que medirlo en el campo ([plan de validación](validacion-campo.md)).

---

## 2. Método

1. Lista de problemas candidatos a partir de blogs del sector, reportes de plataformas y estudios académicos.
2. Para cada problema buscamos evidencia de **frecuencia** y de **consecuencia económica**.
3. Cada dato lleva una calificación de calidad, porque no todas las fuentes valen lo mismo:

| Código | Tipo de fuente | Cómo usarla |
|---|---|---|
| **A** | Estudio revisado por pares o revisión sistemática | Evidencia fuerte, aunque sea de otro sector |
| **B** | Datos de plataforma, encuesta o estadística con alcance declarado | Evidencia útil; ojo con el país y el sesgo del proveedor |
| **C** | Afirmación de un proveedor o estimación sin metodología | Solo como indicio |
| **D** | Nota periodística o testimonio | Contexto, no cifra |
| **F** | Documentación oficial (precios, términos) | Dato verificable a la fecha |
| **T** | Marco teórico | Explica el mecanismo, no mide |
| **O** | Observación directa nuestra | Dato verificable a la fecha |

4. Matriz de decisión ponderada con análisis de sensibilidad (sección 6), calculada con un script, no a mano.

---

## 3. Contexto: Honduras en octubre de 2026

| Dato | Valor | Calidad | Fuente |
|---|---|---|---|
| Población | 11.1 millones | B | [DataReportal, Digital 2026: Honduras](https://datareportal.com/reports/digital-2026-honduras) |
| Usuarios de internet | 8.00 millones (72.4 %) | B | DataReportal |
| Conexiones móviles | 7.48 millones (67.7 % de la población) | B | DataReportal |
| Identidades en redes sociales | 5.26 millones (47.6 %) | B | DataReportal |
| Barberías hondureñas en Fresha | **8** en todo el país (4 en Tegucigalpa, 2 en SPS, 1 en La Ceiba, 1 en La Masica) | O | [Fresha, barberías en Honduras](https://www.fresha.com/lp/en/bt/barbers/in/honduras), consultado el 25/10/2026 |
| Tipo de cambio de referencia | L 27.0071 por USD (venta, 7/9/2026) | F | [El Heraldo, con dato del BCH](https://www.elheraldo.hn/portada/precio-dolar-hoy-lunes-7-septiembre-honduras-FI31934818) |
| Ley de protección de datos personales | Pendiente de dictamen en el Congreso (agosto 2026) | D | [La Tribuna](https://www.latribuna.hn/2026/08/10/y-la-ley-de-proteccion-de-datos/) |
| Modelo de pago al barbero | Comisión del 50 % por corte (caso de Tegucigalpa, 2014) | D | [El Heraldo, 2014](https://www.elheraldo.hn/alfrente/698591-468/barberos-de-oro-maestros-del-peine-y-las-tijeras) |

**Lectura:** siete de cada diez hondureños están en internet, pero casi ninguna barbería usa las plataformas globales de reservas (Fresha muestra 8 en todo el país). Es un indicio de mercado poco atendido, no una prueba: puede haber barberías usando otras herramientas, papel o WhatsApp.

**Cambio reciente que afecta el diseño:** desde el **1 de octubre de 2026**, Meta cobra en WhatsApp Business Platform las plantillas de utilidad enviadas dentro de la ventana de atención y los mensajes de servicio por encima de 1,000 al mes por número ([Meta](https://developers.facebook.com/docs/whatsapp/pricing), F). Para Honduras, dentro de la región "Resto de Latinoamérica", la plantilla de utilidad cuesta **USD 0.0113** por mensaje ([Contactship](https://contactship.ai/en/blog/whatsapp-business-api-pricing-latin-america-2026), C; Meta remite a su tabla oficial de tarifas). Eso equivale a unos **L 0.31 por aviso**. Por ejemplo, 1,040 avisos al mes costarían cerca de **USD 11.75 (≈ L 317)**. Por eso el MVP no depende de la API de WhatsApp ([ADR-003](decisiones.md#adr-003--notificaciones-sin-api-de-whatsapp-en-el-mvp)).

---

## 4. Problemas candidatos y su evidencia

### P1. Inasistencias y citas informales (no-shows)

El cliente agenda por WhatsApp o llamada y no llega, o cancela tarde. La silla queda vacía.

| Evidencia | Calidad | Fuente |
|---|---|---|
| Barberías de Norteamérica: 4 % de inasistencias y 4 % de cancelaciones en 2025, es decir, ~8 % de las citas reservadas se pierden antes de ocurrir | B | [Zenoti, Benchmark 2026](https://www.zenoti.com/es/thecheckin/barbershop-trends-2026) |
| De las citas de salón reagendadas una vez, el 72 % se terminó cancelando (salones en general, incluye barberías) | B | Zenoti, Benchmark 2026 |
| "La industria" está entre 5 % y 15 % de inasistencias | C | [Squire](https://getsquire.com/business-edge/how-to-reduce-barbershop-no-shows) (sin fuente) |
| Peluquerías en Mallorca: los plantones suponen "un 20 % de pérdidas" al año; responden cobrando 20–25 % por adelantado | D | [Última Hora, dic. 2025](https://www.ultimahora.es/noticias/local/2025/12/03/2523639/peluquerias-centros-estetica-mallorca-explotan-contra-plantones-cobran-por-adelantado-parte-del-servicio.html) |
| Recordatorios por SMS en citas médicas: asistencia 67.8 % sin recordatorio vs. 78.6 % con SMS (RR 1.14; IC 95 % 1.03–1.26; 7 estudios, 5,841 personas) | A | [Cochrane CD007458, 2013](https://www.cochrane.org/CD007458/EPOC_mobile-phone-text-messaging-reminders-attendance-healthcare-appointments) |
| Depósitos: "95 % de caída" de inasistencias y cancelaciones | C | [Zenoti](https://www.zenoti.com/thecheckin/barbershop-walk-in-vs-appointment-guide) (dato de su propio producto) |

**Lectura:** es un problema real y bien documentado, pero **ya lo resuelven todos los competidores** (recordatorios, depósitos, políticas de cancelación). Además, las dos herramientas que mejor funcionan cuestan dinero en Honduras: recordatorios por WhatsApp (desde oct. 2026) y depósitos con pasarela de pago. Y solo aplica a la parte de la clientela que agenda.

### P2. Fila física incierta: clientes que se van sin ser atendidos

En la barbería por orden de llegada, el cliente llega, cuenta a los que esperan y decide si se queda. No sabe cuánto falta. El que se va no deja rastro.

| Evidencia | Calidad | Fuente |
|---|---|---|
| Con video y datos de caja en un supermercado de Chile: cuando la fila llega a 15 personas o más, la probabilidad de compra baja de 30 % a 27 %, alrededor de **10 % menos ventas**. Los clientes reaccionan al **largo de la fila**, no a lo rápido que avanza | A | [Lu, Musalem, Olivares y Schilkrut, *Management Science* 59(8), 2013](https://ideas.repec.org/a/inm/ormnsc/v59y2013i8p1743-1763.html) · [resumen de Columbia](https://business.columbia.edu/insights/brand-talk/research-cost-queue) |
| "Las esperas inciertas se sienten más largas que las esperas conocidas y finitas"; también las no explicadas y las injustas | T | [Maister, *The Psychology of Waiting Lines*](https://davidmaister.com/blog/201/The-Psychology-of-Waiting-Lines.html) |
| En barberías de calle o de centro comercial, los walk-ins serían entre 70 % y 90 % de la clientela | C | [Zenoti](https://www.zenoti.com/thecheckin/barbershop-walk-in-vs-appointment-guide) (FAQ, sin fuente) |
| El 80 % de los clientes habituales de barbería dejó de reservar alguna vez porque era muy difícil; el 40 % "siempre" necesita reservar fuera del horario | B | [Zenoti, encuesta 2025, +1,000 clientes de EE. UU.](https://www.zenoti.com/es/thecheckin/barbershop-booking-software-trends) |
| El 75 % de los clientes habituales dice ser más leal a los negocios que facilitan agendar y comunicarse | B | Zenoti, encuesta 2025 |
| Utilización de barberos: mediana 56 %, top 10 % 75 % (hay horas de silla vacía incluso en negocios con software) | B | Zenoti, Benchmark 2026 |
| Fila virtual en Argentina (FilaVirtual): más de 1 millón de usuarios activos y 9,000 sucursales en 2020; muestra que el público latino adopta el formato | D | [iProUP, 2020](https://www.iproup.com/innovacion/15443-como-funciona-filavirtual-app-argentina-para-turnos-digitales) |

**Lectura:** el mecanismo está respaldado por evidencia fuerte (A + T): una fila larga y de duración desconocida espanta clientes. Lo que no tenemos es la cifra para barberías hondureñas. El estudio de Lu et al. es de un supermercado y su efecto puede ser mayor o menor en una barbería, donde la espera es más larga (minutos u horas, no segundos) pero el cliente está más comprometido con el servicio.

### P3. Control de caja y comisiones

El dueño paga por comisión (en el caso documentado, 50 % por corte) pero no tiene un registro confiable de cuántos servicios hizo cada barbero.

| Evidencia | Calidad | Fuente |
|---|---|---|
| El barbero cobra 50 % del corte (Tegucigalpa, 2014) | D | [El Heraldo](https://www.elheraldo.hn/alfrente/698591-468/barberos-de-oro-maestros-del-peine-y-las-tijeras) |
| AgendaPro vende "caja" y "cálculo automático de comisiones" como funciones para barberías | C | [AgendaPro](https://agendapro.com/cw/barberia/software-para-barberias) |
| Reseñas de AgendaPro: problemas al registrar pagos; algunos cobran fuera de la plataforma | D | [Capterra](https://www.capterra.es/software/218709/agendapro) |

**Lectura:** el dolor es plausible y los proveedores lo venden, pero **no encontramos ni una cifra** de cuánto dinero se pierde. No se puede elegir como problema principal sin inventar. Queda como hipótesis para la validación, y la fila virtual lo cubre en parte porque cada turno cerrado ya es un registro.

### P4. Captación y retención de clientes

| Evidencia | Calidad | Fuente |
|---|---|---|
| Visitas de clientes nuevos en barberías: −17 % en 2025 (promedio de la industria: −10 %); clientes existentes: +2 % | B | Zenoti, Benchmark 2026 |
| Los marketplaces cobran por cliente nuevo: Booksy Boost 30 % de la primera visita; Fresha 20 % (mínimo USD 6) | C | [Squire vs Booksy](https://getsquire.com/compare/squire-vs-booksy) · [Pabau sobre Fresha](https://pabau.com/blog/fresha-pricing/) |

**Lectura:** es importante pero es un problema de marketing con muchas causas. Un software no lo resuelve solo, y para reactivar clientes primero hace falta tener sus datos, cosa que la fila virtual empieza a juntar.

---

## 5. Competencia

| Producto | Enfoque | Precio publicado | Lo que no cubre para una barbería hondureña |
|---|---|---|---|
| **Booksy** | Citas y marketplace | USD 29.99/mes + USD 20 por barbero adicional; Boost 30 % de la primera visita | Cobra por barbero; pensado para citas, no para fila |
| **Fresha** | Citas, pagos y marketplace | Equipo: USD 14.95 por miembro al mes (dato "reportado"); 20 % por cliente nuevo del marketplace | 8 barberías en Honduras; cobra por miembro |
| **Squire** | Barberías de EE. UU. | PRO USD 50/mes, barberos ilimitados | Mercado estadounidense; pagos con tarjeta de EE. UU. |
| **AgendaPro** | Citas, caja y comisiones en Latinoamérica | Desde USD 19 (Capterra, sin especificar periodo) | Centrado en citas; reseñas con quejas de pagos y velocidad |
| **Waitwhile** | Fila virtual genérica | Gratis hasta 50 visitas/mes; Starter USD 29/mes | En inglés y genérico; sin registro de servicio, monto ni comisión; avisos por SMS |

Fuentes de precios: [Squire vs Booksy (mayo 2026)](https://getsquire.com/compare/squire-vs-booksy), [Pabau sobre Fresha (sept. 2026)](https://pabau.com/blog/fresha-pricing/), [Capterra AgendaPro](https://www.capterra.es/software/218709/agendapro), [Capterra Waitwhile](https://www.capterra.com/p/152494/Waitwhile/). Son fuentes de terceros o de competidores (C): hay que confirmar en la página de cada producto antes de usarlas en material de venta.

**Hueco:** las herramientas fuertes nacieron para **citas** y cobran **en dólares y por barbero**. Las de fila virtual son genéricas y no conectan la fila con lo que pasa en la silla (servicio, monto, barbero). Nadie apunta específicamente a la barbería de orden de llegada en Centroamérica, en español y con un costo que se pague con pocos cortes al mes.

---

## 6. Matriz de decisión

Pesos: frecuencia 20 %, consecuencia económica 25 %, calidad de la evidencia 15 %, hueco de mercado 15 %, viabilidad para construirlo con costo inicial $0 y el nivel técnico actual 15 %, potencial como SaaS y para el portafolio 10 %. Escala de 1 a 5.

| Criterio | P1 Inasistencias | P2 Fila incierta | P3 Caja y comisiones | P4 Captación |
|---|---|---|---|---|
| Frecuencia | 4 · solo en negocios con citas | **5** · cada día pico | 5 · cada servicio | 3 · goteo constante |
| Consecuencia | 4 · ~8 % de citas perdidas (NA) | **4** · ~10 % de ventas con fila larga (Lu et al.) | 4 · plausible, sin cifra | 3 · −17 % clientes nuevos (NA) |
| Evidencia | 4 · A + B | **3** · A + T, pero sin dato de barberías | 1 · solo C y D | 3 · B |
| Hueco de mercado | 2 · todos lo resuelven | **4** · herramientas de citas o genéricas | 3 · AgendaPro lo cubre | 2 · marketplaces |
| Viabilidad ($0, nivel actual) | 3 · WhatsApp y depósitos cuestan | **4** · web + tiempo real + QR | 4 · CRUD simple | 3 · requiere campañas |
| Potencial SaaS | 3 · mercado saturado | **5** · demo visible, QR en la puerta que hace marketing | 3 | 3 |
| **Puntaje ponderado** | **3.45** | **4.15** | **3.50** | **2.85** |

**Sensibilidad** (mismo script, `matriz.py`):

| Escenario | Ganador | Segundo |
|---|---|---|
| Pesos base | P2 (4.15) | P3 (3.50) |
| Pesos iguales | P2 (4.17) | P1 y P3 (3.33) |
| Duplicar el peso de la **evidencia** | P2 (4.00) | P1 (3.52) |
| Duplicar cualquier otro criterio | P2 (4.12–4.29) | P3 |
| Quitar "potencial SaaS" (para evitar sesgo de portafolio) | P2 (4.06) | P3 (3.56) |

Los puntajes son juicio nuestro sobre la evidencia citada, no una medición. Lo que da confianza es que **P2 gana en todos los escenarios**, incluso cuando la evidencia pesa el doble, que es su criterio más débil.

---

## 7. Problema elegido

> **Las barberías que atienden por orden de llegada no pueden ver ni gestionar su fila.** El cliente que llega no sabe cuánto esperará y una parte se va sin ser atendida, sin que esa venta perdida quede registrada. Ocurre en cada día pico y provoca pérdida de ingresos, saturación en los picos con sillas vacías en las horas flojas y decisiones de personal sin datos.

- **Quién lo sufre:** el dueño (ventas perdidas, cero datos), el barbero (presión en los picos, pleitos por el turno) y el cliente (espera larga e incierta).
- **Quién paga:** el dueño. El argumento de venta tiene que ser en dinero: *clientes que ya no se van* y *control de lo que hizo cada barbero*.
- **Cuándo pasa (hipótesis a confirmar):** sábados, días de pago y diciembre.
- **Cómo se mide:** tasa de abandono de la fila, espera real promedio y clientes atendidos por día ([métricas en el README](../README.md#métricas-de-éxito)).

**Por qué no los otros:**
- **P1** está resuelto por la competencia, y sus dos remedios (WhatsApp y depósitos) tienen costo variable en Honduras. Entra en la v0.2 como "citas dentro de la fila híbrida".
- **P3** no tiene datos públicos. Se valida en las entrevistas y, mientras tanto, la fila lo cubre como subproducto (reporte de servicios por barbero).
- **P4** necesita datos de clientes que hoy no existen. La fila los empieza a juntar; reactivación en la v0.3.

---

## 8. Lo que no sabemos (y cómo lo vamos a medir)

| Pregunta abierta | Por qué importa | Cómo se responde |
|---|---|---|
| ¿Cuántos clientes se van por la espera en un sábado? | Es el tamaño del problema | Conteo en sitio ([hoja de observación](validacion-campo.md#3-hoja-de-observación-sábado)) |
| ¿Qué porcentaje llega sin cita en Honduras? | Si casi todos agendan, P1 pesa más que P2 | Entrevista + conteo |
| ¿Cuál es el ticket promedio en El Progreso y SPS? | Para traducir abandonos a lempiras | Entrevista (no encontramos un dato reciente publicado) |
| ¿Cómo se agenda hoy? (WhatsApp personal, llamada, Instagram) | Define el canal del enlace | Entrevista |
| ¿Cómo se paga al barbero y cómo se controla? | Valida P3 como segundo argumento | Entrevista |
| ¿Cuánto pagaría el dueño al mes? | Precio del plan | Preguntas de precio en la entrevista |

**Datos que descartamos por no poder verificarlos:** la cifra "42 % de las reservas se hacen con la barbería cerrada" ([AgendaPro](https://agendapro.com/cw/barberia/software-para-barberias)) aparece sin fuente, y las tasas de "menos del 1 %" de inasistencias de Squire son afirmaciones del propio proveedor. No las usamos para decidir.

---

## 9. Fuentes

Todas consultadas el 25 de octubre de 2026.

1. Lu, Y., Musalem, A., Olivares, M. y Schilkrut, A. (2013). *Measuring the Effect of Queues on Customer Purchases*. Management Science, 59(8), 1743–1763. https://ideas.repec.org/a/inm/ormnsc/v59y2013i8p1743-1763.html
2. Columbia Business School. *The cost of a queue* (resumen del estudio anterior). https://business.columbia.edu/insights/brand-talk/research-cost-queue
3. Maister, D. *The Psychology of Waiting Lines*. https://davidmaister.com/blog/201/The-Psychology-of-Waiting-Lines.html
4. Gurol-Urganci, I. et al. (2013). *Mobile phone messaging reminders for attendance at healthcare appointments*. Cochrane CD007458. https://www.cochrane.org/CD007458/EPOC_mobile-phone-text-messaging-reminders-attendance-healthcare-appointments
5. Zenoti. *Tendencias en peluquerías de 2026* (2026 Beauty and Wellness Benchmark Report). https://www.zenoti.com/es/thecheckin/barbershop-trends-2026
6. Zenoti. *Walk-in vs appointment barbershops*. https://www.zenoti.com/thecheckin/barbershop-walk-in-vs-appointment-guide
7. Zenoti. *6 tendencias sorprendentes en peluquerías para 2026* (encuesta a +1,000 clientes de EE. UU.). https://www.zenoti.com/es/thecheckin/barbershop-booking-software-trends
8. Squire. *How to reduce barbershop no-shows*. https://getsquire.com/business-edge/how-to-reduce-barbershop-no-shows
9. Squire. *Squire vs Booksy* (mayo 2026). https://getsquire.com/compare/squire-vs-booksy
10. Pabau. *Fresha pricing* (sept. 2026). https://pabau.com/blog/fresha-pricing/
11. Capterra. *AgendaPro*. https://www.capterra.es/software/218709/agendapro
12. AgendaPro. *Software para barberías*. https://agendapro.com/cw/barberia/software-para-barberias
13. AgendaPro. *5 problemas que tienen las barberías*. https://agendapro.com/blog/problemas-que-tienen-las-barberias/
14. Capterra. *Waitwhile*. https://www.capterra.com/p/152494/Waitwhile/
15. Fresha. *Barbers in Honduras*. https://www.fresha.com/lp/en/bt/barbers/in/honduras
16. DataReportal. *Digital 2026: Honduras*. https://datareportal.com/reports/digital-2026-honduras
17. Meta. *Pricing on the WhatsApp Business Platform*. https://developers.facebook.com/docs/whatsapp/pricing
18. Contactship. *WhatsApp Business API pricing in Latin America (October 2026)*. https://contactship.ai/en/blog/whatsapp-business-api-pricing-latin-america-2026
19. Última Hora (dic. 2025). *Peluquerías y centros de estética de Mallorca explotan contra los plantones*. https://www.ultimahora.es/noticias/local/2025/12/03/2523639/peluquerias-centros-estetica-mallorca-explotan-contra-plantones-cobran-por-adelantado-parte-del-servicio.html
20. El Heraldo (2014). *Barberos de oro*. https://www.elheraldo.hn/alfrente/698591-468/barberos-de-oro-maestros-del-peine-y-las-tijeras
21. El Heraldo (sept. 2026). *Precio del dólar, 7 de septiembre*. https://www.elheraldo.hn/portada/precio-dolar-hoy-lunes-7-septiembre-honduras-FI31934818
22. La Tribuna (ago. 2026). *¿Y la ley de protección de datos?* https://www.latribuna.hn/2026/08/10/y-la-ley-de-proteccion-de-datos/
23. iProUP (2020). *Cómo funciona FilaVirtual*. https://www.iproup.com/innovacion/15443-como-funciona-filavirtual-app-argentina-para-turnos-digitales
24. Supabase. *Pricing*. https://supabase.com/pricing
25. AgentDeals. *Cloudflare Pages vs Vercel*. https://agentdeals.dev/cloudflare-pages-vs-vercel
