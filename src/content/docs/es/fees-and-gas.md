---
title: 'Comisiones y gas'
description: 'Cuánto cuesta realmente hacer staking y retirar del staking con Hipo: el protocolo no se queda con nada de tu staking, la comisión de gobernanza está actualmente en 0 % y la parte no usada del prepago de gas se reembolsa.'
---

## Hipo no se queda con nada de tu staking

Hipo no cobra ninguna comisión de protocolo sobre el GRAM del que haces staking. La única comisión a nivel de protocolo es la comisión de gobernanza que se describe más abajo; todo lo demás que acompaña a una transacción de staking o de unstaking es gas de red que se paga a TON, no ingresos de Hipo.

## La comisión de gobernanza

El protocolo tiene una comisión de gobernanza sobre las recompensas de validación, fijada por la [Hipo DAO](/docs/dao/) y actualmente en 0 %. Se aplica solo a las recompensas de validación, nunca a tu GRAM en staking, y mientras siga en 0 % las recompensas llegan íntegras a los holders de hGRAM. Cualquier cambio pasaría por una votación de la DAO y es visible on-chain: consulta [¿Hipo se queda con una parte de mis recompensas?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Prepagos de gas y reembolsos

Cuando haces staking o retiras del staking, se adjunta por encima un pequeño prepago de gas (actualmente 0,1 GRAM); solo se gasta una fracción —del orden de una centésima de GRAM— y el resto se reembolsa. Los dos flujos se diferencian en cuándo llega el reembolso:

- **Depósito**: el prepago viaja junto a la cantidad depositada y la parte no usada vuelve a tu billetera poco después, como una transferencia de excedente independiente.
- **Unstaking**: el prepago viaja con la quema de tokens, y en el momento de la solicitud vuelve poco o nada; el remanente no usado se paga junto con el retiro final de GRAM.

## Interpretar tus propias cifras

Como el reembolso del unstaking llega con el retiro, el pago bruto de un retiro sobrestima ligeramente la recompensa pura del staking: lleva incluido el gas devuelto. Para medir el rendimiento real de staking de una billetera, calcula el neto de todos los flujos por ciclo: (depósitos enviados − reembolsos de depósito) frente a (reembolsos en el momento de la solicitud + pago del retiro). La [página de recompensas](/rewards/) hace ese seguimiento por ti.

## De dónde salen las cantidades actuales

Los precios del gas los fija la red TON y varían con ella, así que ninguna cifra fija citada en un documento se mantiene exacta. La [app de Hipo](/stake/) muestra el prepago exacto antes de que confirmes. La fuente autoritativa es el getter `get_treasury_fees` de la tesorería, expuesto también como la herramienta `get_fees` del [Hipo MCP Server](/docs/hipo-mcp-server/).

## Costos fuera de Hipo

Intercambiar hGRAM en un DEX sustituye el gas de Hipo por la comisión de swap del pool más el impacto en el precio, y la tasa la marca el pool, no el protocolo. La lista actual de pools está en la [página de DeFi](/defi/); las contrapartidas se explican en [Riesgos](/docs/risks/).

## Más en las preguntas frecuentes

- [¿Cuánto cuesta hacer staking?](/faq/#what-does-it-cost-to-stake)
- [¿Hay comisiones por retirar del staking?](/faq/#are-there-any-unstaking-fees)
