---
title: 'Contratos e auditorias'
description: 'Os endereços dos contratos da Hipo na mainnet, as quatro auditorias de segurança independentes e onde ler o código-fonte.'
---

## Endereços na mainnet

| Contrato                                                                                | Endereço                                                                                                                     |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (contrato principal do protocolo, recebe depósitos e guarda o GRAM em staking) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                                          | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| Jetton HPO                                                                              | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
O endereço do parent pode mudar em atualizações do protocolo — o [README do repositório de contratos](https://github.com/HipoFinance/contract) é a fonte da verdade. Sempre verifique um endereço nas fontes oficiais da Hipo antes de enviar qualquer coisa para ele.
:::

## Auditorias

Os contratos inteligentes da Hipo passaram por quatro auditorias independentes: Quantstamp (abril de 2025) e ProgramCrafter (março de 2024) nos contratos v2, e TonTech e Daniil Sedov (outubro de 2023) na v1. Todos os relatórios estão publicados na íntegra em [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Código-fonte

- **Contratos**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — escritos em FunC com o conjunto de ferramentas Blueprint; a suíte de testes pública pode ser executada a partir desse repositório.
- **Servidor MCP**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — pacote npm `@hipo-finance/mcp`, licença MIT.

## O que cada contrato faz

- **Treasury** — o contrato principal do protocolo: guarda o GRAM depositado e o empresta a tomadores / validadores.
- **Parent** — o jetton master (minter) pelo qual as carteiras e a tesouraria se comunicam.
- **Wallet** — a implementação da carteira de jetton de cada usuário.
- **Loan** — usado para os empréstimos de validação aos tomadores.
- **Bill** — um NFT não transferível (SBT) emitido quando uma operação não pode ser concluída na hora, como um unstake enquanto os fundos estão em uma rodada de validação.
- **Collection** — a coleção de NFTs à qual os bills pertencem.
- **Librarian** — um auxiliar para o deploy e o armazenamento de contratos usando os recursos de biblioteca da TON.
- **Aplicação do tomador** — ajuda os validadores a tomar empréstimos do protocolo para validação.
- **Webapp** — ajuda os usuários a fazer staking e unstake.

## Documentos técnicos

- [Arquitetura](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — a máquina de estados da rodada de validação e os invariantes do protocolo.
- [Guia de integração](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — esquemas de mensagens para carteiras e protocolos.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — os esquemas de mensagem TL-B completos.
- [Diagramas de fluxo de mensagens](https://github.com/HipoFinance/contract/tree/main/graphs/img) — uma imagem por fluxo do protocolo.

Para ler o estado do protocolo ao vivo — taxa de conversão, taxas, tempos das rodadas — use o [Hipo MCP Server](/docs/hipo-mcp-server/).

## Mais no FAQ

- [A Hipo foi auditada?](/faq/#has-hipo-been-audited)
- [Onde posso verificar as transações da Hipo?](/faq/#where-can-i-verify-hipo-transactions)
- [Riscos](/docs/risks/)
