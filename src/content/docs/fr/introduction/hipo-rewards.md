---
title: 'Récompenses Hipo'
---

Notre objectif est de faire de Hipo un protocole réellement porté par sa communauté, où la valeur et les décisions reviennent à la communauté.

Staker des GRAM avec Hipo te rémunère via trois flux distincts, sur trois rythmes différents :

- **Récompenses de base**\
  Les récompenses de staking des GRAM, reflétées dans le taux de conversion du hGRAM face au GRAM — réglées **à chaque cycle de validation** (~18 h), sans rien à réclamer
- **Récompenses bonus**\
  Des HPO supplémentaires sur la valeur en GRAM de ta mise, boostés par ton niveau [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) — accumulés **à chaque cycle de validation**, réclamables dès que tu as 100 HPO, pour 1 GRAM de frais
- **Récompenses supplémentaires**\
  Détiens des HPO → reçois une part des revenus du protocole — **en pause** tant que les frais du protocole sont à 0 %

Les trois se suivent dans le [Hipo Club](/club/), sur le site ou dans l’[app Hipo](https://t.me/HipoApp) sur Telegram.

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

- **HPOrewardRate** vaut actuellement **0,0015295**. Elle est fixée par la gouvernance et peut changer.
- **LevelRate** est le coefficient attaché à ton niveau Hipo Club.

Un cycle de validation dure 65 536 secondes — environ 18,2 heures — soit à peu près **481 cycles par an**. Au taux actuel, chaque GRAM de ta mise rapporte environ **0,74 HPO par an** au niveau 1.

La base de calcul est ce que vaut ta mise **en GRAM à l’instant présent** — ton solde hGRAM au taux de conversion en vigueur — et non le montant que tu as déposé au départ. Comme les récompenses de base font monter cette valeur à chaque cycle, tes récompenses en HPO grandissent avec elle : les deux flux se composent.

### Les coefficients de niveau

À partir de la saison 6 (31 octobre 2026), le coefficient est ton numéro de niveau :

| Niveau | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Taux   | 1×  | 2×  | 3×  | 4×  | 5×  | 6×  | 7×  | 8×  | 9×  | 10× |

Chaque niveau ajoute le même 1× : le niveau 2 gagne deux fois plus que le niveau 1, le niveau 5 cinq fois plus, le niveau 10 dix fois plus. Jusqu’à la fin de la saison 5, le taux montait plus fort, de 1,2× au niveau 2 à 8,2× au niveau 9.

### Ce que cela donne

Récompenses annuelles en HPO au taux actuel :

| Mise (GRAM) | Niveau 1 (1×) | Niveau 5 (5×) | Niveau 10 (10×) |
| ----------- | ------------- | ------------- | --------------- |
| 1 000       | ~736 HPO      | ~3 680 HPO    | ~7 360 HPO      |
| 5 000       | ~3 680 HPO    | ~18 400 HPO   | ~36 800 HPO     |
| 10 000      | ~7 360 HPO    | ~36 800 HPO   | ~73 600 HPO     |
| 50 000      | ~36 800 HPO   | ~184 000 HPO  | ~368 000 HPO    |

### Ce que cela vaut

Les récompenses en HPO sont versées dans un token qui a un prix de marché, et ce prix bouge. Valorisé au prix de marché du HPO au 16 octobre 2026, le bonus ajoute environ **0,22 point de pourcentage** à ton rendement annuel effectif au niveau 1, et environ **2,2 point de pourcentage** au niveau 10.

Autrement dit, un staker au niveau 10 gagne à peu près l’APY de staking des GRAM affiché sur la [page Stats](/stats/), **plus environ 2,2 %** en HPO.

:::note
Nous le formulons ainsi à dessein. Un grand nombre de HPO, pris isolément, ne te dit pas ce que tu gagnes, et le marché du HPO est petit — le token est peu échangé, donc la valeur d’une grosse position en HPO n’est pas celle d’une petite. Nous préférons que tu le saches plutôt que d’en être surpris.
:::

### Les niveaux

Ton niveau multiplie tout ce qui précède : au niveau 10, la même mise rapporte dix fois ce qu’elle rapporte au niveau 1. Tu gagnes aussi 1 % des récompenses en HPO générées par les personnes que tu invites.

Il y a deux façons de monter de niveau :

- **Montée saisonnière** — réclame au moins une fois pendant la saison et sois au-dessus de ton minimum de niveau à sa fin ; tu montes d’un niveau au début de la saison suivante.
- **Montée instantanée** — paie les frais de montée de niveau en GRAM et monte d’un niveau tout de suite.

Deux règles comptent :

- **Garde ton minimum de niveau.** Tout ce que tu réclames s’y ajoute, et ton portefeuille Club doit détenir au moins cette quantité de HPO, dans le portefeuille ou ses pools de liquidité pris en charge. En dessous, tu as 24 heures de grâce à ton plein boost ; ensuite ton niveau est suspendu et gagne à 1×, et après 7 jours de plus tu retombes au niveau 1. Le Club est conçu pour récompenser celles et ceux qui gardent leurs tokens, et c’est le mécanisme qui le garantit — voir [Hipo Club](/docs/giveaways-and-prizes/hipo-club/).
- **Il n’y a pas de fenêtre de réclamation.** Les récompenses s’accumulent à chaque cycle et peuvent être réclamées dès que tu as au moins **100 HPO**, pour 1 GRAM de frais.

## Récompenses supplémentaires : le partage des profits

HPO est le token de gouvernance de Hipo. Le détenir te donne une voix dans la [DAO](/docs/dao/) et une part des revenus du protocole, en pause tant que les frais du protocole sont à 0 % — voir [Partage des profits](/docs/profit-sharing/).

:::note
Tant que les [frais de gouvernance](/docs/fees-and-gas/) sont à **0 %**, le protocole ne perçoit aucun revenu : il n’y a donc rien à distribuer dans ce flux. Le partage des profits reprendra en même temps que les frais. Ces frais à 0 % sont précisément ce qui rend les récompenses de base aussi élevées.
:::

Plus tu participes, plus tu gagnes, et plus ton rôle dans la construction de l’avenir de Hipo est grand.

---

_Le HPOrewardRate, les seuils de niveau, le taux de conversion du hGRAM et le prix de marché du HPO évoluent tous. Les chiffres de cette page correspondent à la dernière vérification et ne garantissent pas les récompenses à venir. Les chiffres du protocole en direct sont toujours sur la [page Stats](/stats/)._
