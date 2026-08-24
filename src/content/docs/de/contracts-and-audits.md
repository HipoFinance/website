---
title: 'Contracts & Audits'
description: 'Hipos Mainnet-Contract-Adressen, die vier unabhängigen Sicherheitsaudits und wo Sie den Quellcode lesen können.'
---

## Mainnet-Adressen

| Contract                                                                          | Address                                                                                                                      |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (Haupt-Protokollkontrakt, empfängt Einzahlungen und hält gestaktes GRAM) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / Jetton-Master (hGRAM)                                                    | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| HPO-Jetton                                                                        | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
Die Parent-Adresse kann sich bei Protokoll-Upgrades ändern — die [README des Contract-Repositorys](https://github.com/HipoFinance/contract) ist die maßgebliche Quelle. Überprüfen Sie eine Adresse stets anhand offizieller Hipo-Quellen, bevor Sie etwas an sie senden.
:::

## Audits

Hipos Smart Contracts haben vier unabhängige Audits durchlaufen: Quantstamp (April 2025) und ProgramCrafter (März 2024) für die v2-Contracts sowie TonTech und Daniil Sedov (Oktober 2023) für v1. Jeder Bericht ist vollständig veröffentlicht unter [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Quellcode

- **Contracts**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — geschrieben in FunC mit dem Blueprint-Toolset; die öffentliche Test-Suite lässt sich direkt aus diesem Repository ausführen.
- **MCP-Server**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — npm-Paket `@hipo-finance/mcp`, MIT-lizenziert.

## Was jeder Contract macht

- **Treasury** — der Haupt-Protokollkontrakt: hält eingezahltes GRAM und verleiht es an Kreditnehmer / Validatoren.
- **Parent** — der Jetton-Master (Minter), über den Wallets und die Treasury kommunizieren.
- **Wallet** — die Jetton-Wallet-Implementierung pro Nutzer.
- **Loan** — wird für Validierungskredite an Kreditnehmer verwendet.
- **Bill** — ein nicht übertragbares NFT (SBT), das ausgestellt wird, wenn ein Vorgang nicht sofort abgeschlossen werden kann, etwa ein Unstake, während sich Mittel in einer Validierungsrunde befinden.
- **Collection** — die NFT-Collection, zu der die Bills gehören.
- **Librarian** — ein Helfer für Contract-Deployment und -Speicherung mithilfe von TON-Library-Funktionen.
- **Borrower application** — hilft Validatoren, sich für die Validierung Mittel vom Protokoll zu leihen.
- **Webapp** — hilft Nutzern beim Staken und Unstaken.

## Technische Dokumente

- [Architecture](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — die Zustandsmaschine der Validierungsrunde und die Protokoll-Invarianten.
- [Integration guide](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — Nachrichtenschemas für Wallets und Protokolle.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — die vollständigen TL-B-Nachrichtenschemas.
- [Message-flow diagrams](https://github.com/HipoFinance/contract/tree/main/graphs/img) — ein Bild pro Protokollfluss.

Um den aktuellen Protokollzustand zu lesen — Wechselkurs, Gebühren, Rundentiming —, verwenden Sie den [Hipo MCP Server](/docs/hipo-mcp-server/).

## Mehr in den FAQ

- [Wurde Hipo auditiert?](/faq/#has-hipo-been-audited)
- [Wo kann ich Hipo-Transaktionen überprüfen?](/faq/#where-can-i-verify-hipo-transactions)
- [Risiken](/docs/risks/)
