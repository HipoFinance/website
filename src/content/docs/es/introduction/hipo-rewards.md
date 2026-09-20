---
title: 'Recompensas de Hipo'
---

Nuestro objetivo es construir Hipo como un protocolo realmente impulsado por la comunidad, donde el valor y las decisiones pasen a manos de la comunidad.

Hacer staking de GRAM con Hipo te paga en tres flujos separados, con tres ritmos distintos:

- **Recompensas base**\
  Recompensas de staking de GRAM, reflejadas en la tasa de cambio de hGRAM frente a GRAM: se liquidan **en cada ronda de validación** (~18 h), sin nada que reclamar
- **Recompensas potenciadas**\
  HPO adicional sobre el valor en GRAM de tu staking, con un coeficiente que fija tu nivel de [Hipo Club](https://t.me/HipoFinanceBot/join): se acumula **en cada ronda de validación** y se puede retirar cuando tu saldo supera los 1.000 HPO
- **Recompensas extra**\
  Ten HPO → recibe una parte de los ingresos del protocolo: se paga **al final de cada temporada de Hipo Club**

Los tres se pueden seguir en la [app de Hipo](/rewards/) y en [Hipo Club](https://t.me/HipoFinanceBot/join).

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

- **HPOrewardRate** está actualmente en **0,0021902**. Lo fija la gobernanza y puede cambiar.
- **LevelRate** es el coeficiente asociado a tu nivel de Hipo Club.

Una ronda de validación dura 65.536 segundos —unas 18,2 horas—, así que hay aproximadamente **481 rondas al año**. Con la tasa actual, cada GRAM de tu staking genera unos **1,05 HPO al año** en el Nivel 1.

La base es lo que tu staking **vale en GRAM ahora mismo** —tu saldo de hGRAM a la tasa de cambio actual—, no la cantidad que depositaste originalmente. Como las recompensas base empujan ese valor hacia arriba en cada ronda, tus recompensas en HPO crecen con él: los dos flujos se componen entre sí.

### Coeficientes por nivel

El coeficiente no es el número de nivel: empieza en 1× y se acelera a medida que subes.

| Nivel | 1    | 2    | 3    | 4    | 5   | 6   | 7    | 8    | 9    | 10  |
| ----- | ---- | ---- | ---- | ---- | --- | --- | ---- | ---- | ---- | --- |
| Tasa  | 1,0× | 1,2× | 1,6× | 2,2× | 3×  | 4×  | 5,2× | 6,6× | 8,2× | 10× |

Cada nivel vale más que el anterior: pasar del Nivel 1 al Nivel 2 añade 0,2×, mientras que pasar del Nivel 9 al Nivel 10 añade 1,8×, nueve veces más. La recompensa por escalar llega al final.

### A cuánto equivale

Recompensas anuales en HPO con la tasa actual:

| Staking (GRAM) | Nivel 1 (1×) | Nivel 5 (3×) | Nivel 10 (10×) |
| -------------- | ------------ | ------------ | -------------- |
| 1.000          | ~1.055 HPO   | ~3.164 HPO   | ~10.546 HPO    |
| 5.000          | ~5.273 HPO   | ~15.819 HPO  | ~52.732 HPO    |
| 10.000         | ~10.546 HPO  | ~31.639 HPO  | ~105.463 HPO   |
| 50.000         | ~52.732 HPO  | ~158.195 HPO | ~527.316 HPO   |

### Cuánto vale

Las recompensas en HPO se pagan en un token que tiene un precio de mercado, y ese precio se mueve. Valorado al precio de mercado de HPO del 29 de agosto de 2026, el impulso añade aproximadamente **0,18 p. p.** a tu rendimiento anual efectivo en el Nivel 1, y aproximadamente **1,8 p. p.** en el Nivel 10.

Así que un staker en el Nivel 10 gana aproximadamente el APY de staking de GRAM que aparece en la [página de Stats](/stats/), **más alrededor de un 1,8 %** en HPO.

:::note
Lo expresamos así a propósito. Una cifra grande de HPO por sí sola no te dice cuánto estás ganando, y el mercado de HPO es pequeño: el token se negocia poco, así que el valor de una posición grande en HPO no es el mismo que el de una pequeña. Preferimos que lo sepas a que te pille por sorpresa.
:::

### Niveles

Tu nivel multiplica todo lo anterior: en el Nivel 10 el mismo staking genera diez veces lo que genera en el Nivel 1. Además ganas un 1 % de las recompensas en HPO que generan las personas a las que invitas.

Hay dos formas de subir de nivel:

- **Subida por temporada**: reclama tus recompensas ganadas al menos una vez durante la temporada; tu nivel sube automáticamente al final de esta.
- **Subida instantánea**: paga la comisión de subida de nivel y tu nivel sube de inmediato.

Hay dos reglas que importan:

- **Vender el HPO recibido como recompensa te devuelve al Nivel 1.** El Club está diseñado para premiar a quien mantiene, y este es el mecanismo. Enviar el HPO de recompensas a un exchange, o a una billetera que no hayas conectado al Club, cuenta como vender; moverlo entre tus propias billeteras conectadas, no. Consulta [Usar varias billeteras](/docs/wallets-and-rewards/).
- **No hay ventana para reclamar.** Las recompensas se acumulan en cada ronda y se pueden retirar cuando tu saldo sea de al menos **1.000 HPO**.

## Recompensas extra: reparto de beneficios

HPO es el token de gobernanza de Hipo. Tenerlo te da voto en la [DAO](/docs/dao/) y una parte de los ingresos del protocolo, que se distribuye al final de cada temporada de Hipo Club. Consulta [Reparto de beneficios](/docs/profit-sharing/).

:::note
Mientras la [comisión de gobernanza](/docs/fees-and-gas/) esté en **0 %**, el protocolo no recauda ingresos, así que no hay nada que distribuir en este flujo. El reparto de beneficios se reanuda cuando lo haga la comisión. Esa comisión del 0 % es lo que hace que las recompensas base sean tan altas como son.
:::

Cuanto más participes, más ganas, y mayor es tu papel a la hora de dar forma al futuro de Hipo.

---

_La HPOrewardRate, los umbrales de nivel, la tasa de cambio de hGRAM y el precio de mercado de HPO cambian todos. Las cifras de esta página están actualizadas a la última revisión y no son una garantía de recompensas futuras. Las cifras del protocolo en vivo están siempre en la [página de Stats](/stats/)._
