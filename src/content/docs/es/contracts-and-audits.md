---
title: 'Contratos y auditorías'
description: 'Las direcciones de los contratos de Hipo en mainnet, las cuatro auditorías de seguridad independientes y dónde leer el código fuente.'
---

## Direcciones de mainnet

| Contrato                                                                                        | Dirección                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (contrato principal del protocolo; recibe los depósitos y custodia el GRAM en staking) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                                                  | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| Jetton HPO                                                                                      | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
La dirección de Parent puede cambiar con las actualizaciones del protocolo: el [README del repositorio de contratos](https://github.com/HipoFinance/contract) es la fuente de verdad. Verifica siempre una dirección con fuentes oficiales de Hipo antes de enviarle nada.
:::

## Auditorías

Los contratos inteligentes de Hipo han pasado por cuatro auditorías independientes: Quantstamp (abril de 2025) y ProgramCrafter (marzo de 2024) sobre los contratos v2, y TonTech y Daniil Sedov (octubre de 2023) sobre los v1. Todos los informes están publicados íntegros en [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Código fuente

- **Contratos**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — escritos en FunC con el conjunto de herramientas Blueprint; la batería de pruebas pública se puede ejecutar desde ese repositorio.
- **Servidor MCP**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — paquete npm `@hipo-finance/mcp`, con licencia MIT.

## Qué hace cada contrato

- **Treasury** — el contrato principal del protocolo: custodia el GRAM depositado y lo presta a prestatarios / validadores.
- **Parent** — el jetton master (minter) a través del cual se comunican las billeteras y la tesorería.
- **Wallet** — la implementación de la billetera jetton de cada usuario.
- **Loan** — se utiliza para los préstamos de validación a los prestatarios.
- **Bill** — un NFT no transferible (SBT) emitido cuando una operación no puede completarse al instante, como un unstaking mientras los fondos están en una ronda de validación.
- **Collection** — la colección de NFT a la que pertenecen los bills.
- **Librarian** — un auxiliar para el despliegue y el almacenamiento de contratos mediante las funciones de librería de TON.
- **Borrower application** — ayuda a los validadores a tomar prestado del protocolo para validar.
- **Webapp** — ayuda a los usuarios a hacer staking y a retirar del staking.

## Documentos técnicos

- [Arquitectura](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — la máquina de estados de la ronda de validación y los invariantes del protocolo.
- [Guía de integración](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — los esquemas de mensajes para billeteras y protocolos.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — los esquemas de mensajes TL-B completos.
- [Diagramas de flujo de mensajes](https://github.com/HipoFinance/contract/tree/main/graphs/img) — una imagen por cada flujo del protocolo.

Para leer el estado del protocolo en vivo —tasa de cambio, comisiones, tiempos de la ronda— usa el [Hipo MCP Server](/docs/hipo-mcp-server/).

## Más en las preguntas frecuentes

- [¿Hipo ha sido auditado?](/faq/#has-hipo-been-audited)
- [¿Dónde puedo verificar las transacciones de Hipo?](/faq/#where-can-i-verify-hipo-transactions)
- [Riesgos](/docs/risks/)
