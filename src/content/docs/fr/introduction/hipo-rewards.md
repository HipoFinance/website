---
title: 'Récompenses Hipo'
---

Notre objectif est de faire de Hipo un protocole réellement porté par sa communauté, où la valeur et les décisions reviennent à la communauté.

Staker des GRAM avec Hipo te rémunère via trois flux distincts, sur trois rythmes différents :

- **Récompenses de base**\
  Les récompenses de staking des GRAM, reflétées dans le taux de conversion du hGRAM face au GRAM — réglées **à chaque cycle de validation** (~18 h), sans rien à réclamer
- **Récompenses bonus**\
  Des HPO supplémentaires sur la valeur en GRAM de ta mise, à un coefficient fixé par ton niveau [Hipo Club](https://t.me/HipoFinanceBot/join) — accumulés **à chaque cycle de validation**, retirables dès que ton solde dépasse 1 000 HPO
- **Récompenses supplémentaires**\
  Détiens des HPO → reçois une part des revenus du protocole — versée **à la fin de chaque saison du Hipo Club**

Les trois se suivent dans l’[app Hipo](/rewards/) et dans le [Hipo Club](https://t.me/HipoFinanceBot/join).

## Récompenses de base : le taux de conversion

Tu stakes des GRAM et tu reçois des hGRAM. Il n’y a ni blocage ni réclamation : les récompenses de validation s’accumulent dans le protocole, si bien que chaque hGRAM vaut de plus en plus de GRAM au fil du temps. Ton solde en hGRAM ne change jamais — c’est sa valeur qui change.

C’est le flux principal, et c’est à lui que se rapporte l’APY de la [page Stats](/stats/). Comme Hipo ne prélève rien sur ta mise et que les [frais de gouvernance](/docs/fees-and-gas/) sont actuellement de 0 %, l’intégralité de la récompense de validation alimente le taux de conversion.

## Récompenses bonus : des HPO grâce au Hipo Club

En plus du taux de conversion, le [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) te verse des HPO parce que tu détiens des hGRAM. Ce flux est distinct, il est payé en HPO et non en GRAM, et c’est dans le Club que tu le retires.

### La formule

À chaque cycle de validation, chaque membre gagne :

```
HPO reward = GRAM value of your stake × HPOrewardRate × LevelRate
```

- **HPOrewardRate** vaut actuellement **0,0021902**. Elle est fixée par la gouvernance et peut changer.
- **LevelRate** est le coefficient attaché à ton niveau Hipo Club.

Un cycle de validation dure 65 536 secondes — environ 18,2 heures — soit à peu près **481 cycles par an**. Au taux actuel, chaque GRAM de ta mise rapporte environ **1,05 HPO par an** au niveau 1.

La base de calcul est ce que vaut ta mise **en GRAM à l’instant présent** — ton solde hGRAM au taux de conversion en vigueur — et non le montant que tu as déposé au départ. Comme les récompenses de base font monter cette valeur à chaque cycle, tes récompenses en HPO grandissent avec elle : les deux flux se composent.

### Les coefficients de niveau

Le coefficient n’est pas le numéro du niveau — il part de 1× et s’accélère à mesure que tu montes :

| Niveau | 1    | 2    | 3    | 4    | 5   | 6   | 7    | 8    | 9    | 10  |
| ------ | ---- | ---- | ---- | ---- | --- | --- | ---- | ---- | ---- | --- |
| Taux   | 1,0× | 1,2× | 1,6× | 2,2× | 3×  | 4×  | 5,2× | 6,6× | 8,2× | 10× |

Chaque niveau vaut plus que le précédent : passer du niveau 1 au niveau 2 ajoute 0,2×, alors que passer du niveau 9 au niveau 10 ajoute 1,8× — neuf fois plus. La récompense de l’ascension arrive tard.

### Ce que cela donne

Récompenses annuelles en HPO au taux actuel :

| Mise (GRAM) | Niveau 1 (1×) | Niveau 5 (3×) | Niveau 10 (10×) |
| ----------- | ------------- | ------------- | --------------- |
| 1 000       | ~1 055 HPO    | ~3 164 HPO    | ~10 546 HPO     |
| 5 000       | ~5 273 HPO    | ~15 819 HPO   | ~52 732 HPO     |
| 10 000      | ~10 546 HPO   | ~31 639 HPO   | ~105 463 HPO    |
| 50 000      | ~52 732 HPO   | ~158 195 HPO  | ~527 316 HPO    |

### Ce que cela vaut

Les récompenses en HPO sont versées dans un token qui a un prix de marché, et ce prix bouge. Valorisé au prix de marché du HPO au 29 août 2026, le bonus ajoute environ **0,18 point de pourcentage** à ton rendement annuel effectif au niveau 1, et environ **1,8 point de pourcentage** au niveau 10.

Autrement dit, un staker au niveau 10 gagne à peu près l’APY de staking des GRAM affiché sur la [page Stats](/stats/), **plus environ 1,8 %** en HPO.

:::note
Nous le formulons ainsi à dessein. Un grand nombre de HPO, pris isolément, ne te dit pas ce que tu gagnes, et le marché du HPO est petit — le token est peu échangé, donc la valeur d’une grosse position en HPO n’est pas celle d’une petite. Nous préférons que tu le saches plutôt que d’en être surpris.
:::

### Les niveaux

Ton niveau multiplie tout ce qui précède : au niveau 10, la même mise rapporte dix fois ce qu’elle rapporte au niveau 1. Tu gagnes aussi 1 % des récompenses en HPO générées par les personnes que tu invites.

Il y a deux façons de monter de niveau :

- **Montée saisonnière** — réclame tes récompenses au moins une fois pendant la saison ; ton niveau monte automatiquement à la fin de celle-ci.
- **Montée instantanée** — paie les frais de montée de niveau et ton niveau monte immédiatement.

Deux règles comptent :

- **Vendre les HPO reçus en récompense te ramène au niveau 1.** Le Club est conçu pour récompenser celles et ceux qui gardent leurs tokens, et c’est le mécanisme qui le garantit. Envoyer des HPO de récompense sur une plateforme d’échange, ou vers un portefeuille que tu n’as pas connecté au Club, compte comme une vente ; les déplacer entre tes propres portefeuilles connectés, non — voir [Utiliser plusieurs portefeuilles](/docs/wallets-and-rewards/).
- **Il n’y a pas de fenêtre de réclamation.** Les récompenses s’accumulent à chaque cycle et peuvent être retirées dès que ton solde atteint au moins **1 000 HPO**.

## Récompenses supplémentaires : le partage des profits

HPO est le token de gouvernance de Hipo. Le détenir te donne une voix dans la [DAO](/docs/dao/) et une part des revenus du protocole, distribuée à la fin de chaque saison du Hipo Club — voir [Partage des profits](/docs/profit-sharing/).

:::note
Tant que les [frais de gouvernance](/docs/fees-and-gas/) sont à **0 %**, le protocole ne perçoit aucun revenu : il n’y a donc rien à distribuer dans ce flux. Le partage des profits reprendra en même temps que les frais. Ces frais à 0 % sont précisément ce qui rend les récompenses de base aussi élevées.
:::

Plus tu participes, plus tu gagnes, et plus ton rôle dans la construction de l’avenir de Hipo est grand.

---

_Le HPOrewardRate, les seuils de niveau, le taux de conversion du hGRAM et le prix de marché du HPO évoluent tous. Les chiffres de cette page correspondent à la dernière vérification et ne garantissent pas les récompenses à venir. Les chiffres du protocole en direct sont toujours sur la [page Stats](/stats/)._
