---
title: 'Gebühren & Gas'
description: 'Was Staking und Unstaking mit Hipo tatsächlich kosten: kein Protokollanteil an Ihrem Stake, eine Governance-Gebühr, die derzeit bei 0 % liegt, und eine Gas-Vorauszahlung, deren ungenutzter Teil erstattet wird.'
---

## Hipo nimmt keinen Anteil an Ihrem Stake

Hipo erhebt keine Protokollgebühr auf das GRAM, das Sie staken. Die einzige Gebühr auf Protokollebene ist die unten beschriebene Governance-Gebühr; alles andere, was einer Staking- oder Unstaking-Transaktion anhängt, ist Netzwerk-Gas, das an TON gezahlt wird, nicht Hipo-Einnahmen.

## Die Governance-Gebühr

Das Protokoll hat eine vom [Hipo DAO](/docs/dao/) festgelegte Governance-Gebühr auf Validierungs-Rewards, derzeit 0 %. Sie gilt nur für Validierungs-Rewards, niemals für Ihr gestaktes GRAM, und solange sie bei 0 % bleibt, werden Rewards vollständig an hGRAM-Inhaber weitergegeben. Jede Änderung würde über eine DAO-Abstimmung erfolgen und ist on-chain sichtbar — siehe [Nimmt Hipo einen Anteil meiner Rewards?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Gas-Vorauszahlungen und Erstattungen

Beim Staken oder Unstaken wird zusätzlich eine kleine Gas-Vorauszahlung angehängt (derzeit 0,1 GRAM); nur ein Bruchteil davon — in der Größenordnung von einem Hundertstel GRAM — wird tatsächlich verbraucht, der Rest wird erstattet. Die beiden Abläufe unterscheiden sich darin, wann die Erstattung eintrifft:

- **Einzahlung**: Die Vorauszahlung wird zusätzlich zum gestakten Betrag übertragen, und der ungenutzte Teil kehrt kurz danach als separate Excess-Überweisung in Ihre Wallet zurück.
- **Unstake**: Die Vorauszahlung begleitet das Verbrennen der Token, und zum Zeitpunkt der Anfrage kommt wenig oder nichts zurück — der ungenutzte Rest wird zusammen mit der finalen GRAM-Auszahlung ausgezahlt.

## Ihre eigenen Zahlen lesen

Da die Unstake-Erstattung zusammen mit der Auszahlung eintrifft, überzeichnet eine reine Auszahlungssumme den tatsächlichen Staking-Reward leicht — sie enthält das zurückerstattete Gas. Um die reale Staking-Rendite einer Wallet zu ermitteln, saldieren Sie alle Flüsse pro Zyklus: (gesendete Einzahlungen − Einzahlungserstattungen) gegenüber (Erstattungen zum Anfragezeitpunkt + Auszahlungssumme). Die [Rewards-Seite](/rewards/) verfolgt Ihre Rewards für Sie.

## Woher die aktuellen Beträge stammen

Die Gaspreise werden vom TON-Netzwerk festgelegt und bewegen sich mit ihm, daher bleibt keine in einem Dokument genannte feste Zahl langfristig korrekt. Die [Hipo-App](/stake/) zeigt die genaue Vorauszahlung, bevor Sie bestätigen. Die maßgebliche Quelle ist der `get_treasury_fees`-Getter der Treasury, der auch als `get_fees`-Tool des [Hipo MCP Server](/docs/hipo-mcp-server/) verfügbar ist.

## Kosten außerhalb von Hipo

Das Swappen von hGRAM auf einem DEX ersetzt Hipos Gas durch die Swap-Gebühr des Pools zuzüglich Preiseinfluss, und der Kurs stammt aus dem Pool, nicht aus dem Protokoll. Die aktuelle Liste der Pools finden Sie auf der [DeFi-Seite](/defi/); die Abwägungen werden unter [Risiken](/docs/risks/) behandelt.

## Mehr in den FAQ

- [Was kostet das Staken?](/faq/#what-does-it-cost-to-stake)
- [Gibt es Gebühren für das Unstaken?](/faq/#are-there-any-unstaking-fees)
