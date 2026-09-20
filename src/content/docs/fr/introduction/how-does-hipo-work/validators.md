---
title: 'Validateurs'
---

## Prêter des tokens GRAM aux validateurs

1. **Un modèle de validateurs sans permission** : Hipo prête les GRAM en staking à des validateurs selon un modèle ouvert — n’importe quel validateur peut faire une offre, sans accord de Hipo.
2. **Un modèle d’enchère entre validateurs** : à chaque cycle de validation, les validateurs enchérissent pour emprunter des GRAM en staking en indiquant le taux de récompense qu’ils paieront. Les contrats de Hipo retiennent automatiquement les meilleures offres, de sorte que les stakers obtiennent le meilleur taux disponible pour ce cycle.
3. **Un processus sécurisé** : tous les processus, y compris l’emprunt des GRAM en staking et la distribution des récompenses, sont exécutés en toute sécurité par les smart contracts de Hipo. Le protocole a fait l’objet d’[audits de sécurité](https://github.com/HipoFinance/audits) pour garantir l’intégrité et la sûreté des fonds des utilisateurs.
4. **La garantie du validateur** : un validateur emprunteur doit immobiliser ses propres GRAM à hauteur de la pénalité de slashing maximale du cycle plus la récompense qu’il a promise. Une pénalité est prélevée sur cette garantie, pas sur les GRAM en staking.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Schéma : le protocole Hipo prête des GRAM à un validateur, qui valide sur TON et rend les GRAM plus les récompenses de staking."></figure>
