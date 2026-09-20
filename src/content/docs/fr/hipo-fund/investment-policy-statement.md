---
title: 'Politique d’investissement du Hipo Fund'
description: 'Comment le Hipo Fund est investi : allocation cible, limites de risque et de concentration, conservation des actifs, liquidité, et comment une part de la croissance du fonds revient aux détenteurs de HPO.'
---

:::caution

**Ceci est une version préliminaire soumise à la revue de la communauté. Elle n’est pas encore en vigueur.**

:::

**Version préliminaire v1.5 · Pour revue par la communauté et ratification par la DAO**

---

## En un coup d’œil

_La politique complète suit. En cas de divergence entre les deux, ce sont les sections numérotées qui font foi._

**Allocation cible.** HPO se situe hors de l’allocation. Tout le reste :

| Poche                                                                         | Cible | Bande   |
| ----------------------------------------------------------------------------- | ----- | ------- |
| Rendement stablecoins, déployé                                                | 45 %  | 35–55 % |
| Opportunity Reserve — se déploie uniquement sur un signal de repli du Bitcoin | 10 %  | 5–15 %  |
| Bitcoin, détenu nativement                                                    | 30 %  | 20–35 % |
| hGRAM                                                                         | 12 %  | 8–18 %  |
| Liquidités d’exploitation et gas                                              | 3 %   | 2–6 %   |

**Limites clés.**

|                                                 |                 |
| ----------------------------------------------- | --------------- |
| Actifs de l’écosystème TON (HPO + hGRAM + GRAM) | ≤ 45 % du fonds |
| Actifs qu’aucun émetteur ne peut geler          | ≥ 20 % du fonds |
| Un seul protocole, ou un seul émetteur          | ≤ 30 % du fonds |
| Actifs hors conservation multisig               | 0 %             |
| Effet de levier                                 | Zéro, toujours  |

**Ce que reçoivent les détenteurs de HPO.**

| Canal                    | Comment ça marche                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retour de valeur**     | Au-dessus de son high-water mark, le fonds restitue jusqu’à la moitié de sa croissance accumulée aux détenteurs de HPO, à un rythme plafonné à 2 % de la valeur du fonds par an. La croissance retenue par ce plafond de rythme est mise en file d’attente, et non perdue. Versée via le partage des revenus du Hipo Club ou en achetant des HPO pour les brûler — la DAO vote la forme, pas le montant. |
| **Adossement en actifs** | La valeur du fonds, rapportée à la capitalisation boursière de HPO, est publiée chaque trimestre.                                                                                                                                                                                                                                                                                                        |
| **Gouvernance**          | Les détenteurs de HPO votent cette politique, chacun de ses amendements et toute vente des HPO du fonds.                                                                                                                                                                                                                                                                                                 |

**Dix règles.**

1. **Pas d’effet de levier, pas de produits dérivés, pas de market-making.** Quelle que soit la taille, jamais.
2. **Le fonds n’achète pas de HPO pour les conserver.** Il peut acheter des HPO pour les brûler, financés uniquement par les gains — voir les sections 2.2 et 8.
3. **Le fonds n’est une source ni de liquidité de marché pour HPO, ni de fonds d’exploitation.**
4. **Tous les actifs en multisigs 2 sur 3** — un sur TON, un sur EVM, un sur Bitcoin.
5. **Chaque position doit pouvoir être retirée directement depuis son contrat,** sans autorisation d’un opérateur ou
   d’une interface.
6. **Pas de market timing.** Ce sont les bandes de rééquilibrage qui achètent bas et vendent haut, mécaniquement.
7. **L’Opportunity Reserve ne se déploie que sur un signal** — Bitcoin à 40 %, 55 % et 70 % sous son plus haut glissant
   sur 12 mois, par tiers.
8. **Personne n’est payé pour gérer ce fonds.** Aucun frais de gestion, aucune commission de performance.
9. **Un rapport chaque trimestre,** établi à partir d’un seul bloc on-chain, avec la performance depuis le lancement et
   la valeur actuelle de chaque limite.
10. **La DAO fixe le cadre ; les signataires exécutent à l’intérieur.**

**Une chose à dire clairement.** À cette allocation, le fonds rapporte environ 2 % par an. Son high-water mark est le
capital qui lui a été apporté, soit environ 224 056 $, et aucun retour de valeur n’est dû tant que le fonds n’est pas
au-dessus de cette marque. Cette politique est conçue pour capitaliser régulièrement et traverser des cycles de marché
complets, pas pour se redresser vite.

---

## 1. Objet et origine

Le Hipo Fund a été créé en avril 2025 à partir du produit de l’offre initiale de HPO, auquel se sont ajoutés les claims
de HPO des saisons du Hipo Club. Ce capital n’a pas été attribué à l’équipe et n’a pas été absorbé par le budget
d’exploitation de Hipo. Il a été placé dans une trésorerie distincte et publiquement visible, mise de côté pour
travailler au profit de l’écosystème Hipo et des détenteurs de HPO sur un horizon qui se compte en années.

Ce document expose comment ce capital est investi : ce que le fonds peut détenir, en quelle quantité, qui décide
de quoi, comment la valeur revient aux détenteurs de HPO, et comment tout cela est publié.

Une politique écrite rend les décisions reproductibles, de sorte que le comportement du fonds ne dépend pas de qui y
prête attention ce mois-là. Elle les rend examinables, pour que la communauté puisse juger le processus et pas
seulement le résultat. Et elle met des limites en place avant qu’elles ne soient nécessaires, au moment où il est
facile de s’accorder dessus.

Une fois ratifiée par un vote de la DAO, cette politique s’impose aux signataires du fonds.

---

## 2. Mandat et objectifs

Le Hipo Fund est une trésorerie d’investissement de long terme. Ses objectifs, par ordre de priorité :

1. **Préserver le capital** à travers des cycles de marché complets.
2. **Faire croître la valeur réelle du fonds** sur un horizon qui se compte en années.
3. **Restituer une part de cette croissance aux détenteurs de HPO**, durablement et sans entamer le principal.

### Ce que le Hipo Fund n’est pas

- **Pas un compte de trading.** Il ne prend pas de positions de court terme et ne cherche pas à anticiper les marchés.
- **Pas une source de liquidité de marché pour HPO.** Fournir de la liquidité au marché de HPO est une décision de
  tokenomics, financée par les allocations de trésorerie et de marketing de HPO.
- **Pas une source de fonds d’exploitation.** Le fonds est distinct du budget d’exploitation de Hipo et ne peut pas
  être ponctionné pour couvrir des dépenses.

### 2.1 Comment le Hipo Fund restitue de la valeur aux détenteurs de HPO

Hipo restitue de la valeur aux détenteurs de HPO à partir de ses sources de revenus, de deux façons désormais
établies : par le partage des revenus du Hipo Club, et en achetant des HPO sur le marché pour les brûler. Le Hipo
Fund est destiné à devenir une troisième de ces sources.

Lorsque le fonds dépasse son high-water mark, une part de cette croissance est attribuée chaque année aux détenteurs de
HPO selon la règle de la section 2.2. La forme que cela prend — partage des revenus ou achat-et-burn — est choisie au
moment où une distribution devient due, en s’appuyant sur l’infrastructure que Hipo exploite déjà.

Les deux formes restituent de la valeur réelle ; elles le font différemment, et le choix doit refléter les
conditions du moment :

- **L’achat-et-burn** réduit définitivement l’offre de HPO et profite à chaque détenteur sans que personne n’ait à
  réclamer quoi que ce soit. Il crée le plus de valeur quand HPO se négocie en dessous de ce que les actifs du fonds et
  les fondamentaux du protocole justifient, puisqu’un burn n’est relutif que si les tokens sont achetés en dessous de
  leur valeur. Son coût, c’est l’impact de marché : sur un marché étroit, une partie de la dépense fait monter le
  prix au lieu d’acheter de l’offre.
- **Le partage des revenus** met chaque dollar entre les mains des détenteurs au prorata, sans impact de marché, et
  c’est la voie la plus efficace dès lors que HPO n’est pas clairement bon marché.

En parallèle, la valeur du fonds, exprimée en pourcentage de la capitalisation boursière en circulation de HPO, est
publiée dans chaque rapport trimestriel. C’est la part de la valorisation de HPO adossée à des actifs détenus en dehors
du token lui-même, et elle est publiée qu’elle monte ou qu’elle baisse.

**Une note sur les ordres de grandeur.** À la taille actuelle du fonds, un retour de valeur serait modeste, et aucun
n’est dû tant que le fonds se situe sous son high-water mark. La règle compte pour ce à quoi elle engage : elle
donne aux détenteurs de HPO un droit défini et publié sur la croissance du fonds, qui grandit avec lui, et qui ne peut
pas être modifié sans un vote de la DAO.

### 2.2 La règle du retour de valeur

**High-water mark.** Le total du capital apporté au fonds, plus tout ce que le fonds a déjà restitué aux détenteurs de
HPO. Il s’établit actuellement à environ **224 056 $**. Il monte quand du capital nouveau est apporté, et du montant de
chaque retour de valeur. Il ne baisse jamais.

**Sous le high-water mark, rien n’est restitué.** Le capital est d’abord reconstitué. Verser sous la marque, c’est
verser du principal.

**Au-dessus**, chaque exercice, le fonds affecte au retour de valeur pour HPO le **plus faible** des deux montants
suivants :

- **50 % de la valeur du fonds au-dessus du high-water mark**, et
- **2 % de la valeur totale du fonds** au début de l’exercice

#### Pourquoi il y a deux limites

Les deux branches ne font pas le même travail.

**La branche des 50 % décide s’il y a quelque chose à restituer.** Elle mesure le fonds par rapport à tout ce qui y a
jamais été mis ou en a jamais été sorti : une année sans croissance ne produit donc rien — et en aucun cas plus de
la moitié de la croissance accumulée du fonds n’est versée. L’autre moitié reste investie et continue de travailler.

**Le plafond annuel décide à quelle vitesse c’est versé.** La plupart des années, c’est le plafond qui s’applique ;
la branche des 50 % ne joue que dans l’étroite bande située juste au-dessus du high-water mark. C’est délibéré. Un fonds
qui verse beaucoup après une bonne année puis rien pendant trois ans sert moins bien les détenteurs qu’un fonds qui
verse régulièrement, et une trésorerie de cette taille a plus besoin de capitaliser que d’un unique gros versement.

**Le plafond règle le rythme du versement. Il ne l’annule pas.** Comme le high-water mark ne monte que de ce qui est
réellement restitué, la croissance retenue par le plafond reste au-dessus de la marque et demeure distribuable les
années suivantes. Rien de ce qui est éligible n’est perdu — c’est mis en file d’attente.

_Exemple chiffré._ Supposons que le fonds atteigne 300 000 $ pour un high-water mark de 224 056 $. La croissance
au-dessus de la marque est de 75 944 $, la branche des 50 % autoriserait donc 37 972 $ — mais le plafond limite le
retour de l’année à 6 000 $. Le high-water mark monte à 230 056 $. Si la valeur du fonds est inchangée l’année suivante,
la croissance au-dessus de la marque est de 69 944 $, le plafond autorise de nouveau 6 000 $, et ce montant est versé.
Le montant plafonné n’est pas perdu ; il est restitué au cours des années suivantes.

#### Le montant n’est pas une décision

Quand le fonds est au-dessus de son high-water mark, l’affectation est un calcul effectué au moment du rapport
trimestriel, pas une proposition. Une fois calculée, elle est mise de côté pour les détenteurs de HPO, publiée comme un
montant engagé jusqu’à son versement, et ne peut pas être réintégrée au fonds.

**Seule la forme est soumise au vote.** Les signataires proposent le partage des revenus, l’achat-et-burn ou une
répartition entre les deux, avec leur raisonnement, et la DAO ratifie la forme. Une proposition non ratifiée est revue
et représentée — l’affectation, elle, ne tombe pas. Si aucune forme n’a été ratifiée dans les 90 jours suivant le
rapport qui l’a déclenchée, l’affectation est exécutée sous forme d’achat-et-burn, qui ne nécessite aucune
infrastructure externe et ne peut pas être bloqué.

**La formule ne peut être modifiée que par un vote de la DAO.** Les signataires peuvent exécuter un retour de valeur
dans le cadre de cette règle ; ils ne peuvent ni la modifier, ni la différer, ni y renoncer.

#### Conditions

- Le fonds reste, après le versement, à l’intérieur de chacune des limites de la section 7
- Il est financé par les revenus et par les produits déjà réalisés lors d’un rééquilibrage ordinaire — jamais en vendant
  du Bitcoin sous sa bande, en puisant dans l’Opportunity Reserve, en vendant les HPO du fonds, ou en liquidant une
  position dans le seul but de créer un montant à verser
- Si verser l’intégralité de l’affectation devait faire sortir une poche de sa bande, on verse autant que les bandes le
  permettent et le reste est reporté à l’année suivante, le high-water mark ne montant que du montant réellement versé
- Le calcul complet est publié dans le rapport trimestriel, y compris le high-water mark avant et après

---

## 3. Gouvernance et pouvoirs de décision

| Décision                                                             | Qui décide                                                                                                           |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Amender cette politique                                              | **Vote de la DAO** (contraignant)                                                                                    |
| Modifier la formule du retour de valeur                              | **Vote de la DAO** (contraignant)                                                                                    |
| Réduire la position en HPO                                           | **Vote de la DAO** (contraignant)                                                                                    |
| Ajouter une classe d’actifs non listée à la section 5                | **Vote de la DAO** (contraignant)                                                                                    |
| Instaurer une quelconque rémunération du gestionnaire                | **Vote de la DAO** (contraignant) — section 14                                                                       |
| La forme que prend un retour de valeur                               | Les signataires proposent, la DAO ratifie. Le **montant** est un calcul relevant de la section 2.2 et n’est pas voté |
| Ajouter un nouveau protocole au sein d’une classe d’actifs approuvée | Les signataires, annonce sous 7 jours                                                                                |
| Déployer l’Opportunity Reserve une fois un signal déclenché          | Les signataires, annonce sous 7 jours                                                                                |
| Rééquilibrer à l’intérieur des bandes de la section 6                | Les signataires, publication trimestrielle                                                                           |
| Lieu, moment et modalités d’exécution                                | Les signataires                                                                                                      |

La DAO fixe le cadre et les limites ; les signataires exécutent à l’intérieur. Les transactions individuelles ne
sont pas soumises au vote — une trésorerie qui a besoin d’un vote pour se rééquilibrer ne peut pas se rééquilibrer.

**Annonce.** Toute transaction unique supérieure à **10 000 $**, et tout changement faisant sortir une poche de sa
bande, est annoncé sur les canaux officiels de Hipo sous 7 jours.

---

## 4. Conservation des actifs

Tous les actifs du fonds sont détenus dans des portefeuilles multisig. Il y en a trois, chacun avec un rôle.

| Portefeuille                | Détient                          | Signature |
| --------------------------- | -------------------------------- | --------- |
| Multisig TON `hipofund.ton` | hGRAM, HPO, GRAM pour le gas     | 2 sur 3   |
| Multisig EVM Safe           | Stablecoins et positions de prêt | 2 sur 3   |
| Multisig Bitcoin            | BTC                              | 2 sur 3   |

- Les trois utilisent les mêmes trois signataires, tous membres de l’équipe Hipo.
- **Aucun actif du fonds n’est détenu dans un portefeuille à signature unique.**
- **Le fonds ne sort pas d’actifs d’un multisig pour satisfaire une condition d’éligibilité.** Si un système Hipo ne
  prend pas en charge les portefeuilles multisig, c’est le système qui est modifié, pas le mode de conservation. La
  prise en charge du multisig est un prérequis avant que le fonds participe à un mécanisme de distribution.
- Aucun actif du fonds n’est détenu sur une plateforme d’échange centralisée, chez un dépositaire, ou sur un compte
  contrôlé par une seule personne, sauf en transit au titre de la section 4.1.
- Le Bitcoin est détenu nativement, non wrappé. Chaque wrapper réintroduit un dépositaire, et cette poche n’a pas besoin
  d’être productive.

### 4.1 Déplacer des actifs entre chaînes

Les transferts inter-chaînes passent par un pont on-chain dont la route en production a été vérifiée, exécutés par
tranches plutôt qu’en une seule transaction.

Là où aucune route on-chain fiable n’existe, un transfert peut passer par un compte de plateforme d’échange appartenant
à un signataire, sous réserve de l’ensemble des conditions suivantes :

- Pas plus de **15 % du fonds** en transit à la fois
- Achevé sous **72 heures**
- Les deux jambes publiées dans le prochain rapport trimestriel, avec les hashs de transaction sur chaque chaîne
- L’accord d’au moins deux signataires avant le départ

C’est une solution de repli, pas un mode par défaut. Pendant le transit, les actifs se trouvent hors du contrôle
multisig et hors de la trace on-chain dont dépend la transparence du fonds. Ce sont ces limites qui rendent cette
fenêtre assez étroite pour être acceptable.

---

## 5. Actifs éligibles

Le fonds ne peut détenir que ce qui suit. Tout le reste exige un vote de la DAO.

**Autorisé**

- **Le Bitcoin**, détenu nativement
- **Les stablecoins adossés à des monnaies fiduciaires** dont les émetteurs publient des attestations de réserves —
  actuellement USDT, USDC, USDS
- **hGRAM**
- **HPO**, au solde existant uniquement — section 8
- **Les dépôts dans des protocoles de prêt de premier plan** remplissant toutes ces conditions : au moins
  1 milliard de dollars de TVL, trois audits indépendants ou plus, plus de 24 mois en production sans perte non
  recouvrée de fonds d’utilisateurs, et un retrait direct au sens de la section 5.2
- **Les soldes de gas natifs**, dans les montants nécessaires à l’exploitation

**Non autorisé**

- L’effet de levier, l’emprunt, la marge, ou toute position susceptible d’être liquidée
- Les contrats à terme perpétuels, les options, ou tout produit dérivé
- Le market-making, l’apport de liquidité, ou les coffres qui prennent la contrepartie des positions de traders
- **Les dollars synthétiques dont l’adossement est une position sur dérivés.** L’USDe d’Ethena a été évalué puis
  écarté : son rendement vient des taux de financement des perpétuels plutôt que de réserves, ses jambes vendeuses
  se trouvent sur des plateformes d’échange centralisées, son fonds de réserve représente environ 1 % de l’offre, et son
  délai de retrait de 7 jours entre en conflit avec la section 9. Il n’offrait aucune prime de rendement par rapport au
  prêt de stablecoins de premier plan au moment de l’évaluation. C’est une opération d’arbitrage de base, pas un actif
  de préservation du capital, et le classer comme tel fausserait la description du risque du fonds.
- Tout token affichant moins de 10 millions de dollars de volume d’échange sur 24 heures, hormis la position existante
  en HPO
- Les achats de HPO destinés à être conservés — section 8

### 5.1 Le risque de gel, et le plancher qui l’encadre

L’essentiel de ce que ce fonds détient est une créance sur une entreprise, et les émetteurs de stablecoins et d’actifs
tokenisés peuvent geler un portefeuille donné. Ce n’est pas une raison d’éviter ces actifs — il n’existe aucune
alternative sans permission à grande échelle pour un pouvoir d’achat stable —, mais cela doit être dimensionné plutôt
qu’ignoré.

- **Aucun émetteur susceptible de geler des avoirs ne peut dépasser 30 % du fonds.**
- **Au moins 20 % du fonds est détenu en actifs qu’aucun émetteur, dépositaire ou autorité ne peut geler par une action
  unilatérale.** Le Bitcoin est actuellement le seul avoir qui satisfait à ce critère.

### 5.2 Le retrait direct

Chaque position doit pouvoir être retirée directement depuis le smart contract, sans autorisation d’un opérateur, d’une
interface ou d’un intermédiaire. Avant qu’un capital soit déployé sur un nouveau protocole, les signataires vérifient
que le retrait fonctionne par interaction directe avec le contrat, indépendamment de l’interface du protocole.

Un protocole capable de filtrer, suspendre ou conditionner un retrait à la discrétion d’un opérateur n’est pas
éligible, quel que soit son rendement. Pour un fonds sans source engagée de capital nouveau, un capital que l’on ne peut
pas récupérer est une perte définitive.

### 5.3 Élargir l’univers à mesure que le fonds grandit

La liste ci-dessus est étroite parce que le fonds est petit : chaque position supplémentaire coûte autant en
mise en place, en suivi et en publication qu’une grande, pour une contribution au rendement trop faible pour compter.
Cela change à mesure que le fonds grandit.

| Taille du fonds, maintenue sur deux rapports consécutifs | Ce qui devient possible                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Moins de 250 000 $                                       | La liste ci-dessus                                                                               |
| 250 000 $ et plus                                        | La DAO peut ajouter **une** classe d’actifs de plus, plafonnée à 10 % du fonds                   |
| 500 000 $ et plus                                        | Une poche opportuniste allant jusqu’à 10 % du fonds, dans le respect des interdictions ci-dessus |

Chaque élargissement exige un vote de la DAO. Atteindre un seuil rend un ajout possible, pas automatique.

---

## 6. Allocation cible

La position en HPO se situe hors de l’allocation cible. Elle ne peut pas être renforcée et ne peut pas être négociée en
taille ; l’inclure obligerait donc toutes les autres poches à se rééquilibrer autour d’un chiffre sur lequel le
fonds ne peut pas agir.

**Avoir non discrétionnaire**

|     |                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| HPO | 9 023 524,44, détenus. Aucun achat pour conservation. Réductions uniquement au titre de la section 8. **Plafond de référence de 25 % du fonds.** |

**Portefeuille discrétionnaire** — tout le reste :

| Poche                            | Cible | Bande   | Rôle                                                                              |
| -------------------------------- | ----- | ------- | --------------------------------------------------------------------------------- |
| Rendement stablecoins, déployé   | 45 %  | 35–55 % | Préservation du capital et revenus du fonds                                       |
| **Opportunity Reserve**          | 10 %  | 5–15 %  | Capital non déployé pour les replis majeurs — section 6.1                         |
| Bitcoin                          | 30 %  | 20–35 % | Réserve de valeur de long terme ; l’actif non gelable et hors écosystème du fonds |
| hGRAM                            | 12 %  | 8–18 %  | Alignement avec Hipo, plus le rendement du staking                                |
| Liquidités d’exploitation et gas | 3 %   | 2–6 %   | Coûts de transaction, tampon                                                      |

**À propos du hGRAM.** Son rendement est libellé en GRAM : la position est donc un pari directionnel sur le GRAM
assorti d’un rendement, plutôt qu’un actif de revenu. Une partie de la raison de le détenir tient à l’alignement avec le
protocole auquel le fonds appartient, ce qui est une raison légitime. Le présenter comme un revenu ne le serait pas.

**À propos du Bitcoin.** Aucun rendement n’est supposé, et il ne faut en supposer aucun. Sa taille est fixée pour qu’une
baisse de 70 % — que le Bitcoin a déjà connue — coûte au fonds environ 16 % de sa valeur. Dimensionné sur la tolérance
au repli, pas sur la conviction.

**Entrée.** Les nouvelles positions en Bitcoin se construisent par tranches hebdomadaires égales, sur huit semaines au
minimum. Une règle, pas une vue de marché.

### 6.1 L’Opportunity Reserve

Le fonds conserve 10 % de son portefeuille discrétionnaire en stablecoins, non déployés ou placés à rendement
disponible le jour même, pour acheter lors des replis sévères. Elle ne se déploie **que sur un signal objectif**, par
tiers, vers des actifs déjà présents sur la liste des actifs éligibles :

| Signal                                                 | Déploie       |
| ------------------------------------------------------ | ------------- |
| Bitcoin à 40 % sous son plus haut glissant sur 12 mois | Un tiers      |
| Bitcoin à 55 % sous son plus haut glissant sur 12 mois | Un tiers      |
| Bitcoin à 70 % sous son plus haut glissant sur 12 mois | Dernier tiers |

Le plus haut glissant utilise la série des cours de clôture quotidiens de la source de prix publiée par le fonds. Une
fois déployée, la Réserve est reconstituée à partir de la poche stablecoins au cours des quatre trimestres suivants.

**Aucun déploiement discrétionnaire.** Si le signal ne s’est pas déclenché, le capital reste où il est. L’intérêt d’un
signal écrit est de prendre la décision à l’avance, quand c’est facile, plutôt que pendant les conditions qui la rendent
difficile.

---

## 7. Limites de concentration et de risque

Mesurées par rapport à la valeur totale du fonds, vérifiées à chaque rapport trimestriel.

| Limite                                                       | Seuil                                               |
| ------------------------------------------------------------ | --------------------------------------------------- |
| Un seul protocole                                            | ≤ 30 % du fonds                                     |
| Un seul émetteur de stablecoin                               | ≤ 30 % du fonds                                     |
| Un seul émetteur susceptible de geler, tous actifs confondus | ≤ 30 % du fonds                                     |
| Actifs qu’aucun émetteur ne peut geler                       | **≥ 20 % du fonds**                                 |
| Une seule position hors HPO                                  | ≤ 35 % du fonds                                     |
| HPO                                                          | ≤ 25 % du fonds (référence — section 8)             |
| Actifs hors conservation multisig                            | **0 %**, sauf en transit au titre de la section 4.1 |
| Actifs de l’écosystème TON (HPO + hGRAM + GRAM)              | ≤ 45 % du fonds                                     |
| Effet de levier                                              | Zéro, à tout moment                                 |

La limite TON est la ligne la plus importante de ce document. Les revenus du fonds viennent de Hipo, son financement
vient de Hipo, et une partie de ses actifs sont les tokens de Hipo. Une trésorerie concentrée sur son propre écosystème
n’amortit pas une année difficile pour cet écosystème — elle l’amplifie. La limite garde le fonds utile précisément
quand on en a le plus besoin.

Si une limite est franchie du fait d’un mouvement de marché plutôt que d’une transaction, le fonds dispose d’un
trimestre pour revenir à l’intérieur, et le dépassement est signalé dans le rapport de ce trimestre.

---

## 8. Politique relative à HPO

**Le fonds n’achète pas de HPO pour les conserver.** La position du fonds est déjà importante au regard de la liquidité
de marché de HPO, et la renforcer transforme du capital liquide en un avoir dont le fonds ne peut pas sortir à un prix
proche de sa valeur comptabilisée. Le rôle du fonds est de faire croître des actifs qui peuvent être déployés, pas
d’accumuler son propre token.

**Acheter des HPO pour les brûler est une action différente, et elle est autorisée.** Au titre de la section 2.2, le
fonds peut acheter des HPO sur le marché et les détruire, comme l’une des deux formes de restitution de valeur aux
détenteurs. Les tokens quittent la circulation au lieu de rejoindre le bilan du fonds, et l’opération est financée
uniquement par les gains au-dessus du high-water mark — jamais par le capital.

**Réduire la position existante.** Les HPO du fonds sont conservés. Ils constituent la participation du fonds dans son
propre protocole, et il n’existe aucun moyen d’en sortir en taille sur le marché ouvert.

Si elle devait être réduite un jour, cela ne se ferait que par une vente de gré à gré à un acheteur stratégique ou par
une vente structurée approuvée par un vote de la DAO. **Le fonds ne vend pas de HPO sur le marché ouvert, quelle qu’en
soit la taille.** L’une comme l’autre de ces voies exige l’ensemble des conditions suivantes :

- **Un vote de la DAO** approuvant la vente avant son exécution
- **L’usage du produit de la vente indiqué dans la proposition** — les détenteurs votent sur ce qu’il advient de
  l’argent, et pas seulement sur le fait de vendre ou non les tokens
- **Une information complète à l’issue de l’opération**, y compris la taille, le prix et toute condition attachée à la
  vente

Ce sont les détenteurs qui ont financé le capital ayant servi à constituer cette position. Le vote et les obligations
d’information sont ce qui garantit qu’une vente éventuelle se fait à des conditions qu’ils ont vues et approuvées à
l’avance.

Le plafond de 25 % de la section 7 est un niveau de référence, pas une vente forcée. Si HPO s’apprécie au-delà, le fonds
signale le dépassement et la DAO décide s’il faut agir.

---

## 9. Liquidité

- Au moins **35 % du fonds** convertible en stablecoins sous 7 jours sans perte significative
- Pas plus de **10 % du fonds** dans des positions dont le blocage dépasse 7 jours
- Aucune position dont le fonds ne pourrait pas sortir sous 30 jours, hormis HPO, signalée comme illiquide dans chaque
  rapport

---

## 10. Rééquilibrage

- **Revu chaque trimestre**, en même temps que le rapport
- Rééquilibré quand une poche sort **de sa bande**, et non selon un calendrier — les coûts de transaction sont bien
  réels face à un fonds de cette taille
- Ramené au point médian de la cible, exécuté sur une période lorsque la taille le justifie
- Toute opération de rééquilibrage supérieure à 10 000 $ annoncée sous 7 jours

**C’est par le rééquilibrage que ce fonds achète bas et vend haut.** Quand le Bitcoin passe sous sa bande, la règle
impose d’acheter. Quand il passe au-dessus, la règle impose d’alléger. La décision est prise à l’avance et exécutée
mécaniquement.

**Le fonds ne cherche pas à identifier les sommets ni les creux de marché.** Aucune position n’est ouverte, fermée ou
redimensionnée sur la base d’une prévision ou d’un sentiment. Agir sur une anticipation de marché suppose d’avoir raison
deux fois — à la sortie et au retour — avec un processus de signature 2 sur 3 qui ne peut pas bouger à cette vitesse.
Les bandes et l’Opportunity Reserve traduisent la même intention par des règles réellement exécutables.

---

## 11. Publication

- Un **rapport complet chaque trimestre**, généré à partir d’un seul bloc on-chain par
  [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
  indiquant le bloc, les taux de conversion et tous les prix utilisés, pour que n’importe quel lecteur puisse le
  reproduire
- Chaque rapport comprend : l’allocation face aux cibles de la section 6, chaque limite de la section 7 avec sa
  valeur actuelle, la **performance depuis le lancement selon Modified Dietz**, un indice de référence, la valeur du
  fonds rapportée à la capitalisation boursière de HPO, et chaque transaction supérieure à 10 000 $
- Les apports enregistrés avec le bloc et le prix au moment de la réception
- Les dépassements de limites signalés qu’ils aient été corrigés ou non
- Les rapports publiés aux échéances prévues, quels que soient les chiffres

**Valorisation.** GRAM et Bitcoin au prix de marché d’un agrégateur publié. hGRAM au taux de rachat du protocole — ce
que le fonds recevrait en unstakant. HPO chez CoinGecko, recoupé avec la capitalisation boursière publiée par
Hipo ; les cours de DEX aux pools étroits sont exclus. Stablecoins à 1,0000 par convention.

---

## 12. Revue et amendement

- Revue **annuelle**, ou plus tôt en cas de changement significatif — une entrée de capital importante, une nouvelle
  source de revenus, ou un dépassement de limite qui ne peut pas être corrigé en un trimestre
- Les amendements exigent un **vote de la DAO**
- Chaque version est publiée ; les versions remplacées restent en ligne avec leurs dates

---

## 13. Points ouverts connus

- **Le fonds n’a aucune source engagée de capital nouveau.** Les récompenses de staking du hGRAM sont actuellement sa
  seule source de revenus active. Des accords de gré à gré et un retour des revenus du protocole sont tous deux
  possibles ; cette politique ne suppose ni l’un ni l’autre.
- **La valeur de la position en HPO est une valorisation comptable, pas un prix.** Chaque rapport le dit et continuera
  de le dire.
- **Les HPO du fonds ne génèrent aucun revenu** tant que les frais de staking du protocole sont à 0 %. Rétablir des
  frais est une décision distincte, mais les deux interagissent : cela donnerait un rendement au plus gros avoir
  du fonds tout en réduisant le rendement de ses hGRAM.

---

## 14. Rémunération du gestionnaire

**Personne n’est payé quoi que ce soit pour gérer le Hipo Fund. Il n’y a ni frais de gestion, ni commission de
performance.**

C’est publié plutôt que laissé sous silence, parce que l’absence de frais est elle-même une politique, et parce que
fixer à l’avance les conditions d’une réouverture du débat évite qu’une proposition non encadrée n’arrive plus tard.

Norges Bank Investment Management, qui gère le fonds souverain dont le Hipo Fund s’inspire, est rémunéré par un budget
de coûts remboursé dans la limite d’un plafond annuel fixé par le ministère des Finances — et non par une part des
gains. Ses coûts de gestion représentaient 0,034 % des actifs en 2024. Les commissions de performance y concernent les
gestionnaires externes, pas le gestionnaire du fonds lui-même.

Deux autres éléments plaident contre une telle rémunération ici. Une commission de performance donne au gestionnaire le
gain sans la perte, ce qui est la mauvaise incitation pour un petit fonds ayant un mandat de préservation du capital. Et
l’alignement existe déjà sous une meilleure forme : les signataires détiennent des HPO ; si le fonds
capitalise, l’adossement de HPO se renforce — une exposition à l’ensemble du résultat, perte comprise.

**Si la question est rouverte**, cela exige un vote de la DAO et ne peut être proposé que lorsque le fonds dépasse
**500 000 $**, se situe au-dessus de son high-water mark, et a tenu ces deux conditions sur **deux rapports
trimestriels consécutifs**. Toute proposition doit comporter : une commission de performance uniquement, sans
frais de gestion ; un high-water mark strict ; un taux de rendement minimal supérieur à un indice de
référence de rendement stablecoin ; un paiement en HPO bloqués pendant au moins 12 mois ; et un plafond
annuel exprimé en pourcentage des actifs.

**Si gérer le fonds venait un jour à exiger du temps rémunéré**, celui-ci est payé sur le budget d’exploitation de Hipo
comme un rôle défini à coût fixe — pas par le fonds, et pas sous forme d’une part des rendements. Cela maintient la
rémunération séparée des résultats d’investissement, ce qu’exige un mandat de préservation du capital.
