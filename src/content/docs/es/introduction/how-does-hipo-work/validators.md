---
title: 'Validadores'
---

## Prestar tokens GRAM a los validadores

1. **Modelo de validadores sin permisos**: Hipo presta el GRAM en staking a los validadores mediante un modelo abierto: cualquier validador puede pujar, sin necesidad de aprobación por parte de Hipo.
2. **Modelo de subasta entre validadores**: en cada ronda de validación los validadores pujan para tomar prestado GRAM en staking indicando la tasa de recompensa que pagarán. Los contratos de Hipo eligen automáticamente las mejores pujas, de modo que los stakers obtienen la mejor tasa disponible en esa ronda.
3. **Proceso seguro**: todos los procesos, incluidos el préstamo del GRAM en staking y la distribución de las recompensas, se ejecutan de forma segura a través de los contratos inteligentes de Hipo. El protocolo ha pasado [auditorías de seguridad](https://github.com/HipoFinance/audits) que garantizan la integridad y la seguridad de los fondos de los usuarios.
4. **Colateral del validador**: un validador prestatario debe bloquear GRAM propio que cubra la penalización máxima por slashing de la ronda más la recompensa que prometió. Una penalización se toma de ese colateral, no del GRAM en staking.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Diagrama: el protocolo Hipo presta GRAM a un validador, que valida en TON y devuelve el GRAM más las recompensas de staking."></figure>
