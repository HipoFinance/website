---
title: 'Staker sans l’app'
description: 'Staker et unstaker avec Hipo par simples virements depuis ton portefeuille — pour les multisig, les cold wallets et les autres portefeuilles incapables de signer des transactions dapp.'
---

## Quand en as-tu besoin

Cette page s’adresse aux portefeuilles qui ne peuvent pas signer de transactions dapp : les portefeuilles multisig et certains cold wallets. Tous les autres devraient utiliser l’[app Hipo](/stake/), moins chère et qui affiche l’estimation exacte avant que tu confirmes. Quand un portefeuille multisig se connecte à l’app Hipo, appuyer sur Staker ou Unstaker transmet directement l’ordre à ton application de portefeuille ; ces instructions sont la solution de repli si cela ne fonctionne pas.

## Staker — le commentaire « d »

Envoie les GRAM que tu veux staker **plus 0,1 GRAM** d’avance de gas à la trésorerie Hipo :

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

Mets exactement ceci comme commentaire texte de la transaction :

```
d
```

Le commentaire doit être en minuscules, en texte brut et non chiffré. L’avance est arrondie généreusement vers le haut — seule une fraction est dépensée et la part non utilisée est remboursée (voir [Frais et gas](/docs/fees-and-gas/)). Les hGRAM sont renvoyés à l’adresse d’où vient le virement.

## Tout unstaker — le commentaire « w »

Envoie 0,1 GRAM à la même adresse de trésorerie avec le commentaire texte :

```
w
```

Cela unstake **l’intégralité** du solde hGRAM de ce portefeuille. Pour n’en unstaker qu’une partie, utilise plutôt un ordre brut — voir la section suivante. L’unstake se règle selon les règles habituelles du protocole, donc le calendrier de l’unstake Complet s’applique — voir [Comment fonctionne l’unstaking](/docs/introduction/how-does-hipo-work/unstaking/) et [Combien de temps prend un unstake ?](/faq/#how-long-does-unstaking-take)

## Unstaker une partie — un ordre brut

Un commentaire texte ne peut demander que la totalité, car il n’a nulle part où mettre un montant. Un unstake partiel est un message ordinaire à corps binaire : il faut donc un portefeuille ou un multisig capable d’en envoyer un — multisig.ton.org appelle cela un « Arbitrary order », et son formulaire demande exactement les trois valeurs ci-dessous.

Ouvre l’[app Hipo](/unstake/) avec ton multisig connecté, saisis le montant que tu veux unstaker, et appuie sur Unstaker. L’app transmet l’ordre à ton application de portefeuille, qui le crée sous forme de requête multisig à approuver par les autres signataires. **Vérifie que ton multisig est bien le portefeuille sélectionné avant de signer** — le lien ne peut pas le choisir à ta place. Si aucune application de portefeuille ne s’ouvre, l’app affiche les trois valeurs pour que tu crées l’ordre à la main :

- **Destination Address** — le contrat de ton propre portefeuille hGRAM. Ce n’est pas la trésorerie : c’est le contrat qui détient tes hGRAM, dérivé de ton adresse multisig. Vérifie-le sur Tonviewer avant de signer ; l’app y renvoie.
- **TON Amount** — 0,1 GRAM, la même avance de gas que partout ailleurs, remboursée hormis la fraction dépensée.
- **Order BOC** — le corps du message, en base64.

Deux points méritent d’être signalés. Seul le contrat de ton propre portefeuille hGRAM accepte cet ordre : s’il est signé par erreur depuis un autre portefeuille, il rebondit simplement et rien n’est brûlé — contrairement au commentaire « w », qui unstakerait le solde que le portefeuille émetteur détient. Et si tu as choisi le taux instantané, le montant rachetable instantanément bouge à chaque cycle : signe rapidement, ou choisis le meilleur taux pour un ordre qui doit attendre d’autres signatures.

## Brûler des hGRAM via le minter

Tu peux aussi récupérer des GRAM directement en brûlant des hGRAM sur [minter.ton.org](https://minter.ton.org/), avec l’adresse du master hGRAM (Parent) :

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

Après le burn, tu reçois des GRAM au taux de rachat en vigueur. L’adresse du parent peut changer lors d’une mise à jour du protocole — consulte d’abord [Contrats et audits](/docs/contracts-and-audits/).

## Ou échanger sur un DEX

Des pools hGRAM existent sur DeDust, STON.fi, TONCO, GroypFi et swap.coffee — la liste à jour est sur la [page DeFi](/defi/). Les frais de swap et l’impact sur le prix s’appliquent.

## Avant d’envoyer

- Vérifie l’adresse de la trésorerie dans [Contrats et audits](/docs/contracts-and-audits/) — ne fais jamais confiance à une adresse venue d’un message transféré ; voir [Sensibilisation au phishing](/docs/security/phishing-awareness-and-prevention/).
- Le commentaire doit être du texte brut, exactement `d` ou `w`.
- Un virement sans commentaire, ou avec le mauvais commentaire, n’est pas une demande de stake ou d’unstake.
- Pour un ordre brut, vérifie que la destination est bien le contrat de ton propre portefeuille hGRAM, et pas une adresse venue d’ailleurs.

## Plus d’infos dans la FAQ

- [Puis-je staker avec un portefeuille multisig ou un cold wallet ?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Frais et gas](/docs/fees-and-gas/)
