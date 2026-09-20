---
title: 'Risques'
description: 'Les risques du staking de GRAM avec Hipo — smart contract, validateur, liquidité, variabilité des récompenses et phishing — et ce que le protocole fait pour chacun.'
---

Le staking et la DeFi comportent toujours des risques, et Hipo ne garantit aucun rendement. Cette page recense les risques du staking de GRAM avec Hipo, ce que le protocole fait pour chacun, et ce que tu peux faire de ton côté.

## Risque lié aux smart contracts

Des bugs ou des failles dans les smart contracts peuvent affecter les fonds. Les contrats de Hipo sont open source, ont passé quatre audits indépendants — Quantstamp (avril 2025) et ProgramCrafter (mars 2024) sur les contrats v2, TonTech et Daniil Sedov (octobre 2023) sur la v1 — et sont écrits en FunC avec Blueprint, avec une suite de tests publique. Vérifie toi-même les adresses avec lesquelles tu interagis dans [Contrats et audits](/docs/contracts-and-audits/).

## Risque lié aux validateurs et au staking

Les récompenses de staking dépendent de la participation correcte des validateurs aux cycles de validation de TON. Avant de pouvoir emprunter des GRAM en staking, un validateur doit immobiliser une garantie couvrant la pénalité de slashing maximale du cycle plus la récompense qu’il a promise : une pénalité est donc prélevée sur cette garantie, pas sur les GRAM en staking. Une contre-performance peut malgré tout se traduire par une récompense plus faible pour ce cycle — voir [Validateurs et place de marché](/docs/introduction/how-does-hipo-work/validators/) et [Que se passe-t-il si un validateur sous-performe ?](/faq/#what-happens-if-a-validator-underperforms)

## Risque de liquidité

Un unstake Instantané n’aboutit que si le protocole détient assez de GRAM libres pour le couvrir ; l’[app](/unstake/) affiche le maximum disponible à l’instant T. Un unstake Complet aboutit toujours, mais se règle après le cycle de validation en cours — dans le pire des cas, l’attente peut atteindre environ 36 heures. Sortir par un [DEX](/defi/) dépend en revanche de la liquidité du pool et comporte un impact sur le prix — voir [Pourquoi l’unstake instantané est-il parfois indisponible ?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Variabilité des récompenses

Le taux de récompense évolue dans le temps avec les offres des validateurs et les conditions du réseau, et aucun rendement fixe n’est promis. Les chiffres en direct et historiques sont sur la [page Stats](/stats/), jamais sur cette page.

## Risque de phishing

N’utilise que les liens officiels de Hipo, et vérifie chaque demande de ton portefeuille avant de signer. Les canaux officiels et les adresses des contrats sont listés dans [Sensibilisation au phishing](/docs/security/phishing-awareness-and-prevention/) et [Contrats et audits](/docs/contracts-and-audits/).

## Ce que Hipo ne promet pas

- Aucun rendement fixe — les récompenses varient d’un cycle de validation à l’autre.
- Aucun staking sans risque — les risques ci-dessus s’appliquent toujours.
- Aucun retrait natif instantané dans tous les cas — l’option Instantané dépend de la liquidité du protocole.

## Plus d’infos dans la FAQ

- [Puis-je perdre mes fonds ?](/faq/#can-i-lose-my-funds)
- [Hipo est-il sûr ?](/faq/#is-hipo-safe)
