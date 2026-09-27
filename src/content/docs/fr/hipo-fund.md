---
title: 'Hipo Fund — trésorerie on-chain'
description: 'Le Hipo Fund — une trésorerie on-chain qui adosse le token HPO.'
---

<figure><img src="/docs/images/hipo-fund-1.jpg" alt="Bannière promotionnelle portant la mention « HipoFund.ton », avec un sac d’argent entouré des icônes Bitcoin, Tether, HPO et TON et une courbe de croissance ascendante."></figure>

## 📌 Ce qu’est le Hipo Fund

Le Hipo Fund est la trésorerie d’investissement de long terme de Hipo. Il détient les produits des ventes du
token HPO et des réclamations de saison du Hipo Club, et il est tenu à l’écart du budget de fonctionnement de Hipo.

L’idée est empruntée au fonds pétrolier norvégien : plutôt que de dépenser les revenus à mesure qu’ils
arrivent, en mettre une part de côté et la gérer sur le long terme. Le Hipo Fund existe pour bâtir de la
valeur durable derrière HPO, pas pour couvrir les dépenses courantes.

Chaque actif qu’il détient se trouve on-chain et peut être vérifié par n’importe qui.

---

## 📊 État actuel

| Indicateur                                         | Valeur                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Capital initial (18 avril 2025)**                | 186 963,96 $                                                                                  |
| **Capital apporté depuis**                         | ≈ 37 092 $ (réclamations des saisons 2 et 3)                                                  |
| **Dernière valeur publiée (24 août 2026)**         | 98 776,51 $                                                                                   |
| **Performance depuis la création (Dietz modifié)** | −58,4 %                                                                                       |
| **GRAM sur la même période**                       | −49,8 %                                                                                       |
| **Dernier rapport**                                | [Rapport d’août 2026](/docs/hipo-fund/quarterly-report-august-24-2026/)                       |
| **Investment Policy Statement**                    | [Ratifié par vote de la DAO, 18 septembre 2026](/docs/hipo-fund/investment-policy-statement/) |

Le fonds est en dessous de son capital initial, principalement à cause de la baisse du prix du GRAM dans un
portefeuille fortement lié au GRAM lors de sa première année. Le détail comptable complet figure dans le
rapport d’août 2026.

Le [**Investment Policy Statement**](/docs/hipo-fund/investment-policy-statement/) (politique
d’investissement) fixe les allocations cibles, les limites de risque, les exigences de liquidité et les
règles de rééquilibrage. Les détenteurs de HPO l’ont ratifié par vote de la DAO le 18 septembre 2026, et le Hipo
Fund est géré selon ce cadre.

---

## 🏦 Portefeuilles

Tous les actifs du Hipo Fund au repos sont détenus dans un multisig 2 sur 3. Trois signataires, tous membres de
l’équipe Hipo, et les mêmes trois sur chaque portefeuille.

| Chaîne       | Contenu                            | Adresse                                                                                                                                                          |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TON**      | hGRAM, HPO, USDT, GRAM pour le gas | [`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr`](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr) (hipofund.ton)                      |
| **Ethereum** | USDC et positions de prêt (Aave)   | [`0xaAf440f8E7E45Bf63a19fE29107E240B9844a173`](https://etherscan.io/address/0xaAf440f8E7E45Bf63a19fE29107E240B9844a173)                                          |
| **Bitcoin**  | BTC                                | [`bc1qpk3g8saskt89acwa976hvzjv8jrcqdn0d2lpf9l9a5ksrj0akfnsxneedc`](https://mempool.space/address/bc1qpk3g8saskt89acwa976hvzjv8jrcqdn0d2lpf9l9a5ksrj0akfnsxneedc) |

Le portefeuille Ethereum est un Safe ; le même Safe, avec la même adresse et les mêmes signataires, existe aussi
sur Base.

Le fonds est passé à un nouveau portefeuille Bitcoin le 27 septembre 2026, après qu’une des trois clés du portefeuille
précédent s’est révélée incorrecte. Les adresses du portefeuille précédent sont désormais vides :
[`bc1qzuwj…qk2w`](https://mempool.space/address/bc1qzuwj3wm88qhnpw7zw4kyk0jdmph0v7h7m7z2dstttx4mzm7hm4es43qk2w),
[`bc1qqz9m…g3jp`](https://mempool.space/address/bc1qqz9mds6pfak0sg8l79h28nf6cwvaasl08zh6xc8jwl3sthmtzhgqfgg3jp) et
[`bc1qce5f…c3w7`](https://mempool.space/address/bc1qce5ftgna5g34kaup44ucvlmu5wtj9cyxuf507n2l8apnxrma9rcqdec3w7). Un
portefeuille Bitcoin peut fournir une nouvelle adresse pour chaque dépôt : si les BTC du fonds se répartissent un
jour sur plusieurs adresses, chaque rapport trimestriel les liste toutes.

Le portefeuille d’origine du fonds, à signature unique —
[`UQBwGlrp…DdLfG`](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG) — a été vidé en septembre
2026 et ne détient plus aucun actif du fonds au repos. Ce n’est pas un lieu de conservation, mais il peut servir de
bref point de transit lorsque des actifs passent d’une chaîne à une autre en vertu de la
[section 4.1](/docs/hipo-fund/investment-policy-statement/#41-déplacer-des-actifs-entre-chaînes) de l’Investment Policy Statement ; pendant ce
passage, une seule clé les contrôle. Il reste aussi le proposeur du multisig TON : il peut proposer une transaction,
mais son exécution exige toujours deux des trois signataires.

:::note[Une note sur les formats d’adresse]
TON affiche le même portefeuille sous deux formes : bounceable (`EQ…`) et non bounceable (`UQ…`). Les quatre
derniers caractères diffèrent, mais le compte est identique.
:::

---

## 💵 Comment le Hipo Fund est financé

Le Hipo Fund n’a jamais reçu d’allocation issue de la tokenomics de HPO. Son capital provient :

- **du produit des ventes du token HPO**, dont l’ILO et des accords OTC avec des investisseurs stratégiques ;
- **des réclamations de saison du Hipo Club** (saisons 2 et 3). Depuis la saison 4, les récompenses en HPO
  reviennent directement aux détenteurs de hGRAM : il n’y a donc plus de fenêtre de réclamation saisonnière ni
  de nouvelles réclamations de ce type ;
- **des récompenses de staking des hGRAM** — actuellement la seule source de revenus active du fonds ;
- **du partage des profits sur les HPO que le fonds détient**, quand le partage des revenus du protocole est
  actif. Les frais de staking sont à 0 % depuis le 6 juin 2026, donc aucune distribution n’a lieu
  actuellement.

Tous les HPO détenus par le fonds ont été achetés sur le marché libre.

---

## 💰 Rapport d’ouverture — 18 avril 2025

- **Capital initial :** 186 963,96 $
- **Début du reporting :** 18 avril 2025

### 🔸 Allocation initiale du portefeuille

| Actif              | Montant      | Allocation | Valeur (USD)     | Notes                                   |
| ------------------ | ------------ | ---------- | ---------------- | --------------------------------------- |
| hGRAM              | 34 955,22    | 59,59 %    | 111 405,91 $     | GRAM en staking                         |
| HPO                | 6 754 307,59 | 38,64 %    | 72 238,04 $      | Token de gouvernance et de profits      |
| Stablecoins (USDT) | 3 304,14     | 1,77 %     | 3 304,14 $       | Préservation du capital et poudre sèche |
| GRAM               | 5,30         | 0,01 %     | 15,87 $          | Exposition directe au GRAM              |
| **Total**          |              | **100 %**  | **186 963,96 $** |                                         |

_Les pourcentages sont arrondis à deux décimales et leur somme peut ne pas faire exactement 100._

:::note[Correction du 29 août 2026]
La valorisation des HPO dans ce tableau avait d’abord été publiée à 15 000 $, ce qui était une erreur : les
quatre lignes ne totalisaient pas le capital initial annoncé. Les HPO sont désormais affichés à 72 238,04 $,
leur valeur de marché au 18 avril 2025 (0,010695 $ par HPO), et les quatre pourcentages d’allocation ont été
recalculés à partir des valeurs en dollars pour que le tableau se réconcilie à 186 963,96 $. Les pourcentages
publiés auparavant étaient 59,28 % (hGRAM), 1,76 % (USDT), 38,95 % (HPO) et 0,01 % (GRAM). Le tableau
comparatif du [rapport d’août 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) a été corrigé en
conséquence. Aucun solde n’a changé.
:::

---

## 🔒 Comment le fonds est géré

**Entièrement on-chain et vérifiable**\
Chaque actif au repos est détenu dans les portefeuilles multisig ci-dessus et peut être vérifié par n’importe qui à tout
moment. Le fonds ne détient que des actifs dont le suivi on-chain est transparent.

**Un reporting fondé sur des instantanés**\
Les rapports à partir d’août 2026 sont générés par
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
qui lit chaque solde depuis un unique bloc de la masterchain TON et indique ce bloc, le taux de conversion du
hGRAM et chaque prix utilisé dans les notes du rapport. N’importe quel lecteur peut réexécuter le script et
reproduire les tableaux.

Les rapports d’[août 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) et de
[décembre 2025](/docs/hipo-fund/quarterly-report-december-18-2025/) sont antérieurs au script et ont été
assemblés à la main. Leurs soldes ont depuis été vérifiés contre la chaîne et se réconcilient ; leurs
valorisations reposaient sur d’autres conventions de prix, ce que signale le rapport d’août 2026.

**Un reporting régulier**\
Le Hipo Fund publie un rapport chaque trimestre. Chaque rapport comprend la performance depuis la création et
un indice de référence. Le prochain rapport est attendu en **décembre 2026**.

**Des décisions annoncées**\
Les changements significatifs de portefeuille sont annoncés sur les canaux officiels de Hipo, et les
changements de stratégie du fonds passent par un vote de la DAO.

**Une croissance maîtrisée**\
Le fonds est géré pour la préservation du capital sur le long terme et une croissance soutenable. Les
allocations cibles, les limites de concentration, les exigences de liquidité et les règles de rééquilibrage
sont fixées dans l’Investment Policy Statement.

**Gouvernance**\
Les détenteurs de HPO votent sur l’orientation du Hipo Fund via la [DAO Hipo](/docs/dao/) sur
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv). L’Investment Policy Statement,
ratifié le 18 septembre 2026, est la première politique du Hipo Fund adoptée par un vote contraignant. L’exécution dans le cadre d’une
politique approuvée revient aux signataires du multisig ; les changements de politique reviennent à la DAO.

---

## ⚠️ Risques

Le Hipo Fund est une trésorerie crypto et sa valeur suit le marché. Les principaux risques :

- **Risque de marché.** Les avoirs non stables du fonds sont exposés aux prix du GRAM et du HPO.
- **Risque de concentration.** Les actifs du fonds sont concentrés sur l’écosystème TON et sur le token de
  Hipo lui-même.
- **Risque de liquidité.** La position en HPO est importante au regard de la liquidité de HPO sur le marché.
  Sa valeur publiée est le prix de marché multiplié par le solde ; ce n’est pas une affirmation que toute la
  position pourrait être vendue à ce prix.
- **Risque de conservation.** Le fonds dépend des signataires de son multisig et de leurs clés. Un seuil de 2 sur 3
  supprime tout point de défaillance unique, mais pas le risque que deux clés soient perdues ou compromises en même
  temps.
- **Risque lié aux smart contracts.** Les actifs placés dans des protocoles DeFi, hGRAM compris, portent le
  risque de défaillance d’un contrat.

Ces risques sont gérés, pas éliminés. L’Investment Policy Statement fixe des limites pour chacun d’eux.

---

## 💜 Pour la communauté Hipo

Le Hipo Fund appartient à la communauté. Sa croissance soutient la valeur et la pérennité de HPO et de chaque
détenteur de HPO. Nous nous engageons à un reporting régulier et transparent et à une gouvernance ouverte.

Envie de suggérer des stratégies, des outils DeFi ou des projets TON pour le fonds ? Rejoins la conversation
sur [@hipo_chat sur Telegram](https://t.me/hipo_chat).
