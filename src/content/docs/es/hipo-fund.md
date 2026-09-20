---
title: 'Hipo Fund — tesorería on-chain'
description: 'Hipo Fund, una tesorería on-chain que respalda al token HPO.'
---

<figure><img src="/docs/images/hipo-fund-1.jpg" alt="Banner promocional con el texto «HipoFund.ton», una bolsa de dinero rodeada de iconos de Bitcoin, Tether, HPO y TON, y un gráfico de crecimiento al alza."></figure>

## 📌 Qué es Hipo Fund

Hipo Fund es la tesorería de inversión a largo plazo de Hipo. Guarda los ingresos de las ventas del token HPO
y de los claims de las temporadas de Hipo Club, y se mantiene separada del presupuesto operativo de Hipo.

La idea está tomada del fondo petrolero de Noruega: en lugar de gastar los ingresos a medida que llegan, se
aparta una parte y se gestiona a largo plazo. Hipo Fund existe para construir valor duradero detrás de HPO,
no para cubrir costos del día a día.

Todos los activos que mantiene están on-chain y cualquiera puede comprobarlos.

---

## 📊 Situación actual

| Indicador                                         | Valor                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Capital inicial (18 de abril de 2025)**         | 186.963,96 USD                                                                |
| **Capital aportado desde entonces**               | ≈ 37.092 USD (claims de la Temporada 2 y la Temporada 3)                      |
| **Último valor reportado (24 de agosto de 2026)** | 98.776,51 USD                                                                 |
| **Rentabilidad desde el inicio (Modified Dietz)** | −58,4 %                                                                       |
| **GRAM en el mismo periodo**                      | −49,8 %                                                                       |
| **Último informe**                                | [Informe de agosto de 2026](/docs/hipo-fund/quarterly-report-august-24-2026/) |

El fondo está por debajo de su capital inicial, sobre todo por la caída del precio de GRAM en una cartera que
estuvo fuertemente ligada a GRAM durante su primer año. La contabilidad completa está en el informe de agosto
de 2026.

La [**Declaración de política de inversión**](/docs/hipo-fund/investment-policy-statement/) establece las
asignaciones objetivo, los límites de riesgo, los requisitos de liquidez y las reglas de rebalanceo. Se
publica como borrador para que la comunidad la revise y después pasa a una votación vinculante de la DAO. Es
el marco bajo el que se gestionará Hipo Fund a partir de ahora.

Las fechas exactas se anuncian en el [canal de Telegram de Hipo](https://t.me/HipoFinance) y en
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv).

---

## 🏦 Billeteras

Hipo Fund guarda sus activos en dos billeteras. Ambas se contabilizan en todos los informes.

**Billetera principal — multisig**\
`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr`
([hipofund.ton](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr))

- Mover fondos requiere **2 de 3 firmas**
- Firmantes: dos cofundadores de Hipo y un miembro del equipo
- Guarda la mayor parte del fondo

**Billetera secundaria — firma única**\
`UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG`
([ver](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG))

- La billetera original del fondo, que se sigue usando tras la migración al multisig y que todavía guarda parte del fondo
- También es proponente en el multisig
- Algunos sistemas de Hipo, incluido Hipo Club, no admiten billeteras multisig, así que esta billetera se
  mantiene por motivos de elegibilidad. La Declaración de política de inversión fija un límite a cuánto se
  guarda aquí

:::note[Una nota sobre los formatos de dirección]
TON muestra la misma billetera de dos formas: bounceable (`EQ…`) y non-bounceable (`UQ…`). Los cuatro últimos
caracteres difieren, pero la cuenta es idéntica. Puede que veas `UQDa2GcC…_GQu` y `EQDa2GcC…_Dnr` para el
multisig; son la misma billetera.
:::

---

## 💵 Cómo se financia Hipo Fund

Hipo Fund nunca ha recibido una asignación de la tokenómica de HPO. Su capital procede de:

- **Los ingresos de la venta del token HPO**, incluidos la ILO y los acuerdos OTC con inversores estratégicos
- **Los claims de las temporadas de Hipo Club** (Temporadas 2 y 3). Desde la Temporada 4, las recompensas en
  HPO se acumulan directamente para los holders de hGRAM, así que no hay ventana de claim por temporada ni
  más claims de este tipo
- **Las recompensas de staking de hGRAM**, actualmente la única fuente de ingresos activa del fondo
- **El reparto de beneficios sobre el HPO que mantiene el fondo**, cuando el reparto de ingresos del
  protocolo está activo. La comisión de staking está en 0 % desde el 6 de junio de 2026, así que ahora mismo
  no se realizan distribuciones

Todo el HPO que mantiene el fondo se compró en el mercado abierto.

---

## 💰 Informe inicial — 18 de abril de 2025

- **Capital inicial:** 186.963,96 USD
- **Inicio del periodo de reporte:** 18 de abril de 2025

### 🔸 Asignación inicial de la cartera

| Activo             | Cantidad     | Asignación | Valor (USD)        | Notas                                         |
| ------------------ | ------------ | ---------- | ------------------ | --------------------------------------------- |
| hGRAM              | 34.955,22    | 59,59 %    | 111.405,91 USD     | GRAM en staking                               |
| HPO                | 6.754.307,59 | 38,64 %    | 72.238,04 USD      | Token de gobernanza y reparto de beneficios   |
| Stablecoins (USDT) | 3.304,14     | 1,77 %     | 3.304,14 USD       | Preservación de capital y liquidez de reserva |
| GRAM               | 5,30         | 0,01 %     | 15,87 USD          | Exposición directa a GRAM                     |
| **Total**          |              | **100 %**  | **186.963,96 USD** |                                               |

_Los porcentajes están redondeados a dos decimales y puede que no sumen exactamente 100._

:::note[Corrección, 29 de agosto de 2026]
La valoración de HPO en esta tabla se publicó anteriormente como 15.000 USD, lo cual era un error: las cuatro
filas no sumaban el capital inicial indicado. Ahora HPO aparece con 72.238,04 USD, su valor de mercado el 18
de abril de 2025 (0,010695 USD por HPO), y los cuatro porcentajes de asignación se han recalculado a partir
de los valores en USD para que la tabla cuadre con 186.963,96 USD. Los porcentajes publicados anteriormente
eran 59,28 % (hGRAM), 1,76 % (USDT), 38,95 % (HPO) y 0,01 % (GRAM). La tabla comparativa del
[informe de agosto de 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) se ha corregido para que
coincida. Ningún saldo ha cambiado.
:::

---

## 🔒 Cómo se gestiona el fondo

**Totalmente on-chain y verificable**\
Todos los activos están en las dos billeteras anteriores y cualquiera puede comprobarlos en cualquier momento.
El fondo solo mantiene activos que se puedan supervisar de forma transparente on-chain.

**Informes basados en snapshots**\
Los informes a partir de agosto de 2026 los genera
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
que lee todos los saldos de un único bloque de la masterchain de TON e indica ese bloque, la tasa de cambio de
hGRAM y cada precio utilizado en las notas del informe. Cualquier lector puede volver a ejecutar el script y
reproducir las tablas.

Los informes de [agosto de 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) y
[diciembre de 2025](/docs/hipo-fund/quarterly-report-december-18-2025/) son anteriores al script y se
elaboraron a mano. Sus saldos se han contrastado después con la cadena y cuadran; sus valoraciones usaron
convenciones de precio distintas, algo que se señala en el informe de agosto de 2026.

**Informes periódicos**\
Hipo Fund publica un informe cada trimestre. Todos los informes incluyen la rentabilidad desde el inicio y un
índice de referencia. El próximo informe está previsto para **diciembre de 2026**.

**Decisiones anunciadas**\
Los cambios relevantes en la cartera se anuncian en los canales oficiales de Hipo, y los cambios en la
estrategia del fondo pasan a una votación de la DAO.

**Crecimiento con control del riesgo**\
El fondo se gestiona para la preservación del capital a largo plazo y el crecimiento sostenible. Las
asignaciones objetivo, los límites de concentración, los requisitos de liquidez y las reglas de rebalanceo
están establecidos en la Declaración de política de inversión.

**Gobernanza**\
Los holders de HPO votan la dirección de Hipo Fund a través de la [Hipo DAO](/docs/dao/) en
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv). La Declaración de política de
inversión es la primera política de Hipo Fund que pasa a una votación vinculante. La ejecución dentro de una
política aprobada corre a cargo de los firmantes del multisig; los cambios en la política pasan a la DAO.

---

## ⚠️ Riesgos

Hipo Fund es una tesorería cripto y su valor se mueve con el mercado. Los riesgos principales:

- **Riesgo de mercado.** Las posiciones del fondo que no son stablecoins están expuestas a los precios de GRAM y HPO.
- **Riesgo de concentración.** Los activos del fondo están concentrados en el ecosistema TON y en el propio token de Hipo.
- **Riesgo de liquidez.** La posición en HPO es grande en relación con la liquidez de HPO en el mercado. Su
  valor reportado es el precio de mercado por el saldo; no es una afirmación de que toda la posición pudiera
  venderse a ese precio.
- **Riesgo de custodia.** Parte del fondo está en una billetera de firma única.
- **Riesgo de contrato inteligente.** Los activos mantenidos en protocolos DeFi, incluido hGRAM, conllevan el
  riesgo de un fallo del contrato.

Estos riesgos se gestionan, no se eliminan. La Declaración de política de inversión fija límites para cada uno de ellos.

---

## 💜 Para la comunidad de Hipo

Hipo Fund pertenece a la comunidad. Su crecimiento respalda el valor y la sostenibilidad de HPO y de cada
holder de HPO. Nos comprometemos a informar de forma periódica y transparente y a una gobernanza abierta.

¿Quieres proponer estrategias, herramientas DeFi o proyectos de TON para el fondo? Únete a la conversación en
[@hipo_chat en Telegram](https://t.me/hipo_chat).
