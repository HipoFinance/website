---
title: 'Contrats et audits'
description: 'Les adresses des contrats de Hipo sur le mainnet, les quatre audits de sécurité indépendants, et où lire le code source.'
---

## Adresses sur le mainnet

| Contrat                                                                                     | Adresse                                                                                                                      |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (contrat principal du protocole, reçoit les dépôts et détient les GRAM en staking) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                                              | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| Jetton HPO                                                                                  | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
L’adresse du parent peut changer lors d’une mise à jour du protocole — c’est le [README du dépôt des contrats](https://github.com/HipoFinance/contract) qui fait foi. Vérifie toujours une adresse auprès des sources officielles de Hipo avant de lui envoyer quoi que ce soit.
:::

## Audits

Les smart contracts de Hipo ont passé quatre audits indépendants : Quantstamp (avril 2025) et ProgramCrafter (mars 2024) sur les contrats v2, TonTech et Daniil Sedov (octobre 2023) sur la v1. Chaque rapport est publié intégralement sur [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Code source

- **Contrats** : [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — écrits en FunC avec l’outillage Blueprint ; la suite de tests publique s’exécute depuis ce dépôt.
- **Serveur MCP** : [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — paquet npm `@hipo-finance/mcp`, sous licence MIT.

## Ce que fait chaque contrat

- **Treasury** — le contrat principal du protocole : il détient les GRAM déposés et les prête aux emprunteurs / validateurs.
- **Parent** — le jetton master (minter) par lequel les portefeuilles et la trésorerie communiquent.
- **Wallet** — l’implémentation du jetton wallet propre à chaque utilisateur.
- **Loan** — utilisé pour les prêts de validation accordés aux emprunteurs.
- **Bill** — un NFT non transférable (SBT) émis lorsqu’une opération ne peut pas aboutir immédiatement, par exemple un unstake pendant que les fonds sont engagés dans un cycle de validation.
- **Collection** — la collection NFT à laquelle appartiennent les bills.
- **Librarian** — un utilitaire de déploiement et de stockage des contrats qui s’appuie sur les fonctions de bibliothèque de TON.
- **Borrower application** — aide les validateurs à emprunter au protocole pour valider.
- **Webapp** — aide les utilisateurs à staker et à unstaker.

## Documents techniques

- [Architecture](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — la machine à états du cycle de validation et les invariants du protocole.
- [Guide d’intégration](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — les schémas de messages pour les portefeuilles et les protocoles.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — l’intégralité des schémas de messages TL-B.
- [Diagrammes de flux de messages](https://github.com/HipoFinance/contract/tree/main/graphs/img) — une image par flux du protocole.

Pour lire l’état du protocole en direct — taux de conversion, frais, calendrier des cycles — utilise le [Hipo MCP Server](/docs/hipo-mcp-server/).

## Plus d’infos dans la FAQ

- [Hipo a-t-il été audité ?](/faq/#has-hipo-been-audited)
- [Où vérifier les transactions Hipo ?](/faq/#where-can-i-verify-hipo-transactions)
- [Risques](/docs/risks/)
