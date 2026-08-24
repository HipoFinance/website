---
title: 'Risiken'
description: 'Die Risiken des Stakens von GRAM mit Hipo — Smart Contract, Validator, Liquidität, Reward-Schwankungen und Phishing — und was das Protokoll jeweils dagegen unternimmt.'
---

Staking und DeFi sind stets mit Risiko verbunden, und Hipo garantiert keine Renditen. Diese Seite listet die Risiken des Stakens von GRAM mit Hipo auf, was das Protokoll jeweils dagegen unternimmt und was Sie selbst tun können.

## Smart-Contract-Risiko

Fehler oder Schwachstellen in Smart Contracts können Gelder beeinträchtigen. Hipos Contracts sind Open Source und haben vier unabhängige Audits durchlaufen — Quantstamp (April 2025) und ProgramCrafter (März 2024) für die v2-Contracts, TonTech und Daniil Sedov (Oktober 2023) für v1 — und sind in FunC mit Blueprint geschrieben, mit einer öffentlichen Test-Suite. Überprüfen Sie die Adressen, mit denen Sie interagieren, selbst anhand von [Contracts & Audits](/docs/contracts-and-audits/).

## Validator- und Staking-Risiko

Staking-Rewards hängen davon ab, dass Validatoren korrekt an den TON-Validierungsrunden teilnehmen. Bevor ein Validator gestaktes GRAM leihen kann, muss er Sicherheiten hinterlegen, die die maximale Slashing-Strafe für die Runde zuzüglich des zugesagten Rewards abdecken — eine Strafe wird also aus diesen Sicherheiten beglichen, nicht aus gestaktem GRAM. Unterdurchschnittliche Leistung kann sich dennoch in einem niedrigeren Reward für diese Runde niederschlagen — siehe [Validatoren & der Marktplatz](/docs/introduction/how-does-hipo-work/validators/) und [Was passiert, wenn ein Validator unterdurchschnittlich abschneidet?](/faq/#what-happens-if-a-validator-underperforms)

## Liquiditätsrisiko

Ein Sofort-Unstake gelingt nur, wenn das Protokoll genügend freies GRAM hält, um ihn zu decken; die [App](/unstake/) zeigt das aktuell verfügbare Maximum. Ein Vollständig-Unstake geht immer durch, wird aber erst nach der aktuellen Validierungsrunde abgewickelt — im schlimmsten Fall kann die Wartezeit rund 36 Stunden erreichen. Der Ausstieg über einen [DEX](/defi/) hängt stattdessen von der Pool-Liquidität ab und ist mit Preiseinfluss verbunden — siehe [Warum ist Sofort-Unstaking manchmal nicht verfügbar?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Reward-Schwankungen

Die Reward-Rate ändert sich im Zeitverlauf mit den Geboten der Validatoren und den Netzwerkbedingungen, und es wird keine feste Rendite versprochen. Aktuelle und historische Zahlen finden Sie auf der [Stats-Seite](/stats/), niemals auf dieser Seite.

## Phishing-Risiko

Verwenden Sie ausschließlich offizielle Hipo-Links und überprüfen Sie jede Wallet-Aufforderung, bevor Sie unterschreiben. Die offiziellen Kanäle und Contract-Adressen sind unter [Phishing Awareness](/docs/security/phishing-awareness-and-prevention/) und [Contracts & Audits](/docs/contracts-and-audits/) aufgeführt.

## Was Hipo nicht verspricht

- Keine festen Renditen — Rewards variieren mit jeder Validierungsrunde.
- Kein Staking ohne Risiko — die oben genannten Risiken gelten immer.
- Keine sofortige native Auszahlung in jedem Fall — Sofort ist an die Protokoll-Liquidität gebunden.

## Mehr in den FAQ

- [Kann ich meine Gelder verlieren?](/faq/#can-i-lose-my-funds)
- [Ist Hipo sicher?](/faq/#is-hipo-safe)
