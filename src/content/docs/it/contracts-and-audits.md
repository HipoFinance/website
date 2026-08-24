---
title: 'Contratti e audit'
description: 'Gli indirizzi dei contratti di Hipo sulla mainnet, i quattro audit di sicurezza indipendenti e dove leggere il codice sorgente.'
---

## Indirizzi sulla mainnet

| Contratto                                                                                        | Indirizzo                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (contratto principale del protocollo, riceve i depositi e custodisce i GRAM in staking) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                                                   | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| Jetton HPO                                                                                       | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
L'indirizzo del parent può cambiare con gli aggiornamenti del protocollo — il [README del repository dei contratti](https://github.com/HipoFinance/contract) è la fonte autorevole. Verifica sempre un indirizzo sulle fonti ufficiali di Hipo prima di inviarvi qualsiasi cosa.
:::

## Audit

Gli smart contract di Hipo hanno superato quattro audit indipendenti: Quantstamp (aprile 2025) e ProgramCrafter (marzo 2024) sui contratti v2, e TonTech e Daniil Sedov (ottobre 2023) su v1. Ogni report è pubblicato integralmente su [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Codice sorgente

- **Contratti**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — scritti in FunC con il toolset Blueprint; la suite di test pubblica è eseguibile da quel repository.
- **Server MCP**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — pacchetto npm `@hipo-finance/mcp`, con licenza MIT.

## Che cosa fa ogni contratto

- **Treasury** — il contratto principale del protocollo: custodisce i GRAM depositati e li presta ai mutuatari / validatori.
- **Parent** — il jetton master (minter) tramite cui i wallet e la tesoreria comunicano.
- **Wallet** — l'implementazione del jetton wallet per ogni utente.
- **Loan** — usato per i prestiti di validazione ai mutuatari.
- **Bill** — un NFT non trasferibile (SBT) emesso quando un'operazione non può concludersi istantaneamente, per esempio un unstaking mentre i fondi sono impegnati in un round di validazione.
- **Collection** — la collezione NFT a cui appartengono i bill.
- **Librarian** — un contratto di supporto per il deploy e l'archiviazione dei contratti tramite le funzionalità di libreria di TON.
- **Borrower application** — aiuta i validatori a prendere in prestito dal protocollo per la validazione.
- **Webapp** — aiuta gli utenti a fare staking e unstaking.

## Documenti tecnici

- [Architettura](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — la macchina a stati del round di validazione e gli invarianti del protocollo.
- [Guida all'integrazione](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — gli schemi dei messaggi per wallet e protocolli.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — gli schemi completi dei messaggi in TL-B.
- [Diagrammi del flusso dei messaggi](https://github.com/HipoFinance/contract/tree/main/graphs/img) — un'immagine per ogni flusso del protocollo.

Per leggere lo stato del protocollo in tempo reale — tasso di cambio, commissioni, tempistiche dei round — usa l'[Hipo MCP Server](/docs/hipo-mcp-server/).

## Altro nelle FAQ

- [Hipo ha superato un audit?](/faq/#has-hipo-been-audited)
- [Dove posso verificare le transazioni di Hipo?](/faq/#where-can-i-verify-hipo-transactions)
- [Rischi](/docs/risks/)
