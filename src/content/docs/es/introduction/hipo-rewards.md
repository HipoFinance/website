---
title: 'Recompensas de Hipo'
---

Nuestro objetivo es construir Hipo como un protocolo realmente impulsado por la comunidad, donde el valor y las decisiones pasen a manos de la comunidad.

Hacer staking de GRAM con Hipo te paga en tres flujos separados, con tres ritmos distintos:

- **Recompensas base**\
  Recompensas de staking de GRAM, reflejadas en la tasa de cambio de hGRAM frente a GRAM: se liquidan **en cada ronda de validación** (~18 h), sin nada que reclamar
- **Recompensas potenciadas**\
  HPO adicional sobre el valor en GRAM de tu staking, potenciado por tu nivel de [Hipo Club](/docs/giveaways-and-prizes/hipo-club/): se acumula **en cada ronda de validación** y se puede reclamar cuando tienes 100 HPO, con una comisión de 1 GRAM
- **Recompensas extra**\
  Ten HPO → recibe una parte de los ingresos del protocolo: **en pausa** mientras la comisión del protocolo sea 0 %

Los tres se pueden seguir en [Hipo Club](/club/), en la web o en la [app de Hipo](https://t.me/HipoApp) en Telegram.

## Recompensas base: la tasa de cambio

Haces staking de GRAM y recibes hGRAM. No hay periodo de bloqueo ni nada que reclamar: las recompensas de validación se acumulan dentro del protocolo, así que cada hGRAM pasa a valer más GRAM con el tiempo. Tu saldo de hGRAM nunca cambia; lo que cambia es su valor.

Este es el flujo principal, y es al que se refiere el APY de la [página de Stats](/stats/). Como Hipo no se queda con nada de tu staking y la [comisión de gobernanza](/docs/fees-and-gas/) está actualmente en 0 %, toda la recompensa de validación va a parar a la tasa de cambio.

## Recompensas potenciadas: HPO de Hipo Club

Además de la tasa de cambio, [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) te paga HPO por mantener hGRAM. Este flujo es independiente, se paga en HPO y no en GRAM, y lo retiras en el Club.

### La fórmula

En cada ronda de validación, cada miembro gana:

```
HPO reward = GRAM value of your stake × HPOrewardRate × LevelRate
```

- **HPOrewardRate** está actualmente en **0,0015295**. Lo fija la gobernanza y puede cambiar.
- **LevelRate** es el coeficiente asociado a tu nivel de Hipo Club.

Una ronda de validación dura 65.536 segundos —unas 18,2 horas—, así que hay aproximadamente **481 rondas al año**. Con la tasa actual, cada GRAM de tu staking genera unos **0,74 HPO al año** en el Nivel 1.

La base es lo que tu staking **vale en GRAM ahora mismo** —tu saldo de hGRAM a la tasa de cambio actual—, no la cantidad que depositaste originalmente. Como las recompensas base empujan ese valor hacia arriba en cada ronda, tus recompensas en HPO crecen con él: los dos flujos se componen entre sí.

### Coeficientes por nivel

A partir de la Temporada 6 (31 de octubre de 2026), el coeficiente es tu número de nivel:

| Nivel | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tasa  | 1×  | 2×  | 3×  | 4×  | 5×  | 6×  | 7×  | 8×  | 9×  | 10× |

Cada nivel suma el mismo 1×: el Nivel 2 gana el doble que el Nivel 1, el Nivel 5 cinco veces más y el Nivel 10 diez veces más. Hasta el final de la Temporada 5 la tasa subía con más pendiente, de 1,2× en el Nivel 2 a 8,2× en el Nivel 9.

### A cuánto equivale

Recompensas anuales en HPO con la tasa actual:

| Staking (GRAM) | Nivel 1 (1×) | Nivel 5 (5×) | Nivel 10 (10×) |
| -------------- | ------------ | ------------ | -------------- |
| 1.000          | ~736 HPO     | ~3.680 HPO   | ~7.360 HPO     |
| 5.000          | ~3.680 HPO   | ~18.400 HPO  | ~36.800 HPO    |
| 10.000         | ~7.360 HPO   | ~36.800 HPO  | ~73.600 HPO    |
| 50.000         | ~36.800 HPO  | ~184.000 HPO | ~368.000 HPO   |

### Cuánto vale

Las recompensas en HPO se pagan en un token que tiene un precio de mercado, y ese precio se mueve. Valorado al precio de mercado de HPO del 16 de octubre de 2026, el impulso añade aproximadamente **0,22 p. p.** a tu rendimiento anual efectivo en el Nivel 1, y aproximadamente **2,2 p. p.** en el Nivel 10.

Así que un staker en el Nivel 10 gana aproximadamente el APY de staking de GRAM que aparece en la [página de Stats](/stats/), **más alrededor de un 2,2 %** en HPO.

:::note
Lo expresamos así a propósito. Una cifra grande de HPO por sí sola no te dice cuánto estás ganando, y el mercado de HPO es pequeño: el token se negocia poco, así que el valor de una posición grande en HPO no es el mismo que el de una pequeña. Preferimos que lo sepas a que te pille por sorpresa.
:::

### Niveles

Tu nivel multiplica todo lo anterior: en el Nivel 10 el mismo staking genera diez veces lo que genera en el Nivel 1. Además ganas un 1 % de las recompensas en HPO que generan las personas a las que invitas.

Hay dos formas de subir de nivel:

- **Subida por temporada**: reclama al menos una vez durante la temporada y estate por encima de tu mínimo de nivel cuando termine; subes un nivel cuando empieza la siguiente temporada.
- **Subida instantánea**: paga la comisión de subida de nivel en GRAM y subes un nivel de inmediato.

Hay dos reglas que importan:

- **Mantén tu mínimo de nivel.** Todo lo que reclamas se suma a él, y tu billetera del Club debe tener al menos esa cantidad de HPO, en la billetera o en sus pools de liquidez compatibles. Por debajo del mínimo tienes 24 horas de gracia con todo tu multiplicador; después tu nivel se suspende y ganas a 1×, y pasados 7 días más vuelves al Nivel 1. El Club está diseñado para premiar a quien mantiene, y este es el mecanismo; consulta [Hipo Club](/docs/giveaways-and-prizes/hipo-club/).
- **No hay ventana para reclamar.** Las recompensas se acumulan en cada ronda y se pueden reclamar cuando tengas al menos **100 HPO**, con una comisión de 1 GRAM.

## Recompensas extra: reparto de beneficios

HPO es el token de gobernanza de Hipo. Tenerlo te da voto en la [DAO](/docs/dao/) y una parte de los ingresos del protocolo, en pausa mientras la comisión del protocolo sea 0 %. Consulta [Reparto de beneficios](/docs/profit-sharing/).

:::note
Mientras la [comisión de gobernanza](/docs/fees-and-gas/) esté en **0 %**, el protocolo no recauda ingresos, así que no hay nada que distribuir en este flujo. El reparto de beneficios se reanuda cuando lo haga la comisión. Esa comisión del 0 % es lo que hace que las recompensas base sean tan altas como son.
:::

Cuanto más participes, más ganas, y mayor es tu papel a la hora de dar forma al futuro de Hipo.

---

_La HPOrewardRate, los umbrales de nivel, la tasa de cambio de hGRAM y el precio de mercado de HPO cambian todos. Las cifras de esta página están actualizadas a la última revisión y no son una garantía de recompensas futuras. Las cifras del protocolo en vivo están siempre en la [página de Stats](/stats/)._
