---
title: 'Frais et gas'
description: 'Ce que staker et unstaker avec Hipo coûte réellement : aucune part prélevée sur ton stake, des frais de gouvernance actuellement à 0 %, et une avance de gas dont la part non utilisée est remboursée.'
---

## Hipo ne prélève rien sur ton stake

Hipo ne prélève aucuns frais de protocole sur les GRAM que tu stakes. Les seuls frais au niveau du protocole sont les frais de gouvernance décrits ci-dessous ; tout le reste attaché à une transaction de staking ou d’unstaking est du gas réseau payé à TON, pas un revenu pour Hipo.

## Les frais de gouvernance

Le protocole applique des frais de gouvernance sur les récompenses de validation, fixés par la [DAO Hipo](/docs/dao/) et actuellement à 0 %. Ils ne s’appliquent qu’aux récompenses de validation, jamais aux GRAM que tu as en staking, et tant qu’ils restent à 0 % les récompenses reviennent intégralement aux détenteurs de hGRAM. Tout changement passerait par un vote de la DAO et serait visible on-chain — voir [Hipo prélève-t-il une part de mes récompenses ?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Avances de gas et remboursements

Quand tu stakes ou unstakes, une petite avance de gas est ajoutée par-dessus (actuellement 0,1 GRAM) ; seule une fraction — de l’ordre du centième de GRAM — est dépensée, et le reste est remboursé. Les deux flux diffèrent par le moment où le remboursement arrive :

- **Dépôt** : l’avance accompagne le montant staké, et la part non utilisée revient dans ton portefeuille peu après, sous la forme d’un transfert d’excédent distinct.
- **Unstake** : l’avance accompagne le burn des tokens, et peu ou rien ne revient au moment de la demande — le reliquat non utilisé est versé en même temps que le retrait final en GRAM.

## Lire tes propres chiffres

Parce que le remboursement de l’unstake arrive avec le retrait, un versement de retrait brut surestime légèrement la récompense de staking pure : il inclut le gas rendu. Pour mesurer le rendement de staking réel d’un portefeuille, compense tous les flux de chaque cycle : (dépôts envoyés − remboursements de dépôt) face à (remboursements au moment de la demande + versement du retrait). La [page Récompenses](/rewards/) suit tes récompenses à ta place.

## D’où viennent les montants actuels

Les prix du gas sont fixés par le réseau TON et évoluent avec lui : aucun chiffre figé dans un document ne reste exact. L’[app Hipo](/stake/) affiche l’avance exacte avant que tu confirmes. La source qui fait foi est le getter `get_treasury_fees` de la trésorerie, également exposé comme l’outil `get_fees` du [Hipo MCP Server](/docs/hipo-mcp-server/).

## Les coûts en dehors de Hipo

Échanger des hGRAM sur un DEX remplace le gas de Hipo par les frais de swap du pool plus l’impact sur le prix, et le taux vient du pool, pas du protocole. La liste à jour des pools est sur la [page DeFi](/defi/) ; les compromis sont traités dans [Risques](/docs/risks/).

## Plus d’infos dans la FAQ

- [Combien coûte le staking ?](/faq/#what-does-it-cost-to-stake)
- [Y a-t-il des frais d’unstaking ?](/faq/#are-there-any-unstaking-fees)
