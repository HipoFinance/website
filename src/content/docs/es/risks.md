---
title: 'Riesgos'
description: 'Los riesgos de hacer staking de GRAM con Hipo —contrato inteligente, validador, liquidez, variabilidad de las recompensas y phishing— y qué hace el protocolo con cada uno.'
---

El staking y el DeFi siempre implican riesgo, e Hipo no garantiza ningún rendimiento. Esta página enumera los riesgos de hacer staking de GRAM con Hipo, qué hace el protocolo con cada uno y qué puedes hacer tú.

## Riesgo de contrato inteligente

Los errores o las vulnerabilidades en los contratos inteligentes pueden afectar a los fondos. Los contratos de Hipo son de código abierto y han pasado por cuatro auditorías independientes —Quantstamp (abril de 2025) y ProgramCrafter (marzo de 2024) sobre los contratos v2, y TonTech y Daniil Sedov (octubre de 2023) sobre los v1—, están escritos en FunC con Blueprint y cuentan con una batería de pruebas pública. Verifica tú mismo las direcciones con las que interactúas en [Contratos y auditorías](/docs/contracts-and-audits/).

## Riesgo de validador y de staking

Las recompensas de staking dependen de que los validadores participen correctamente en las rondas de validación de TON. Antes de que un validador pueda tomar prestado GRAM en staking, debe bloquear un colateral que cubra la penalización máxima por slashing de la ronda más la recompensa que prometió, de modo que una penalización sale de ese colateral y no del GRAM en staking. Un rendimiento bajo puede reflejarse igualmente en una recompensa menor para esa ronda: consulta [Validadores y Marketplace](/docs/introduction/how-does-hipo-work/validators/) y [¿Qué pasa si un validador rinde por debajo de lo esperado?](/faq/#what-happens-if-a-validator-underperforms)

## Riesgo de liquidez

Un unstaking Instantáneo solo funciona cuando el protocolo tiene suficiente GRAM libre para cubrirlo; la [app](/unstake/) muestra el máximo disponible en cada momento. Un unstaking Completo siempre se completa, pero se liquida después de la ronda de validación en curso: en el peor de los casos la espera puede llegar a unas 36 horas. Salir a través de un [DEX](/defi/) depende, en cambio, de la liquidez del pool y conlleva impacto en el precio: consulta [¿Por qué a veces no está disponible el unstaking Instantáneo?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Variabilidad de las recompensas

La tasa de recompensa cambia con el tiempo según las ofertas de los validadores y las condiciones de la red, y no se promete ningún rendimiento fijo. Las cifras en vivo e históricas están en la [página de Stats](/stats/), nunca en esta página.

## Riesgo de phishing

Usa solo enlaces oficiales de Hipo y verifica cada solicitud de tu billetera antes de firmar. Los canales oficiales y las direcciones de los contratos están en [Prevención del phishing](/docs/security/phishing-awareness-and-prevention/) y en [Contratos y auditorías](/docs/contracts-and-audits/).

## Lo que Hipo no promete

- Ningún rendimiento fijo: las recompensas varían en cada ronda de validación.
- Ningún staking libre de riesgo: los riesgos anteriores siempre se aplican.
- Ningún retiro nativo instantáneo en todos los casos: el modo Instantáneo depende de la liquidez del protocolo.

## Más en las preguntas frecuentes

- [¿Puedo perder mis fondos?](/faq/#can-i-lose-my-funds)
- [¿Es seguro Hipo?](/faq/#is-hipo-safe)
