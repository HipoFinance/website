---
title: 'Hipo MCP Server'
description: 'Connecte Claude, Cursor ou n’importe quel client IA compatible MCP à la documentation et aux données on-chain en direct de Hipo.'
---

## Qu’est-ce que le Hipo MCP Server ?

Le Hipo MCP Server est un petit service open source qui permet aux assistants IA d’accéder aux données liées à Hipo, notamment aux informations sur le staking de GRAM et sur d’autres sujets. Il parle le [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), un standard ouvert pour relier des clients IA à des données externes : n’importe quel client compatible MCP — Claude, Claude Code, Cursor et d’autres — peut donc consulter la documentation de Hipo et interroger les chiffres on-chain en direct au lieu de deviner de mémoire.

Une fois connecté, ton assistant peut répondre à des questions comme :

- _Quel est le taux de conversion hGRAM/GRAM actuel, et quel APY cela implique-t-il ?_
- _Combien de GRAM sont en staking dans Hipo en ce moment ?_
- _Quand se termine le cycle de validation en cours, et quand mon dépôt différé émettra-t-il des hGRAM ?_
- _Quel est le solde hGRAM de cette adresse, et combien vaut-il en GRAM ?_
- _Quels frais de gas dois-je joindre à un dépôt ?_

Les réponses proviennent des getters des smart contracts de Hipo sur TON, pas des données d’entraînement du modèle : elles sont donc à jour au moment où tu poses la question.

Le serveur est strictement en **lecture seule**. Il ne détient aucune clé, ne signe rien et n’envoie aucun message à la blockchain. Il peut regarder, mais il ne peut jamais déplacer tes fonds — le connecter ne permet à personne de staker, d’unstaker ou de transférer à ta place.

## Se connecter

### Serveur hébergé (recommandé)

Hipo fait tourner une instance publique. Pointe ton client MCP vers :

```
https://mcp.hipo.finance/mcp
```

Dans [Claude Code](https://claude.com/product/claude-code), une seule commande suffit :

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Cela enregistre le serveur pour le projet en cours. Pour y accéder depuis tous tes projets, passe plutôt `-s user` — ici, `user` est un mot-clé de portée littéral, pas un espace réservé pour ton propre nom d’utilisateur :

```sh
claude mcp add -s user --transport http hipo https://mcp.hipo.finance/mcp
```

Dans les deux cas, utilise la commande plutôt que de modifier un fichier de configuration à la main : Claude Code garde ses serveurs MCP dans sa propre configuration, et un bloc `mcpServers` déposé dans `settings.json` est ignoré. Lance `claude mcp list` pour vérifier que le serveur est bien connecté, et redémarre Claude Code ensuite — les serveurs sont connectés au démarrage, donc un serveur fraîchement ajouté n’est pas disponible dans une session déjà en cours.

Les autres clients se configurent avec un fichier JSON (Claude Desktop, Cursor et la plupart des autres) et attendent une entrée comme celle-ci :

```json
{
  "mcpServers": {
    "hipo": {
      "type": "http",
      "url": "https://mcp.hipo.finance/mcp"
    }
  }
}
```

### L’exécuter en local

Si tu préfères faire tourner le serveur toi-même, il est publié sur npm sous le nom [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) et parle stdio. Node.js 20 ou plus récent est requis :

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

Le même conseil s’applique ici : ajoute-le avec la commande, pas en modifiant un fichier à la main. Pour les autres clients, l’entrée de configuration JSON est :

```json
{
  "mcpServers": {
    "hipo": {
      "command": "npx",
      "args": ["-y", "@hipo-finance/mcp"]
    }
  }
}
```

## Outils

Voici les questions auxquelles le serveur sait répondre. Ton client IA choisit lui-même le bon outil — toi, tu demandes en langage naturel.

| Outil                | Ce qu’il renvoie                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_exchange_rate`  | Le taux hGRAM↔GRAM actuel, le total des GRAM en staking, l’offre de hGRAM et l’APY récent déduit des mises à jour de taux on-chain                                            |
| `get_treasury_state` | Les totaux de la trésorerie : TVL en GRAM, offre de hGRAM, dépôts et unstakes en attente, participations aux cycles en cours, indicateur d’arrêt et paramètres de gouvernance |
| `get_round_timing`   | Le calendrier des cycles de validation : bornes du cycle en cours et du suivant, fenêtre de participation aux élections, et durée de gel des mises                            |
| `get_fees`           | Les frais de gas actuels pour les dépôts, les unstakes et les demandes de prêt                                                                                                |
| `get_wallet_status`  | Le solde hGRAM d’une adresse donnée, sa valeur en GRAM, et ses éventuels stakes ou unstakes en attente                                                                        |
| `get_reward_history` | L’historique des récompenses de staking en GRAM d’une adresse donnée, cycle par cycle, avec le niveau Hipo Club et les récompenses en HPO                                     |
| `get_participation`  | La participation de Hipo à un cycle de validation : état, nombre de prêts, totaux et heure de libération des mises                                                            |
| `get_loan_info`      | Le contrat de prêt d’un emprunteur pour un cycle donné : adresse, état de déploiement, solde et parties prenantes                                                             |
| `get_max_punishment` | La pénalité maximale que le protocole peut appliquer pour une mise de validateur donnée                                                                                       |

Les quatre premiers outils n’ont besoin d’aucune entrée. `get_wallet_status`, `get_reward_history` et `get_loan_info` attendent une adresse TON — celle du propriétaire ou de l’emprunteur, pas celle de son jetton wallet — et `get_max_punishment` attend un montant de mise en GRAM. `get_participation` et `get_loan_info` acceptent aussi une heure de début de cycle, mais elle est facultative : sans elle, ils rendent compte du cycle en cours.

Chaque réponse porte le même rappel : les outils renvoient des données de protocole en direct, pas un conseil financier ; les valeurs changent à chaque cycle de validation et aucun rendement n’est garanti.

## Ressources documentaires

À côté des données en direct, le serveur expose les documents techniques de Hipo comme ressources MCP, récupérés depuis leurs emplacements publics canoniques pour qu’ils soient toujours à jour :

| Ressource                  | Contenu                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | Le README du dépôt des smart contracts : résumé du protocole et adresses des contrats déployés    |
| `hipo://docs/architecture` | Les contrats, la machine à états du cycle de validation et les invariants du protocole            |
| `hipo://docs/integration`  | Les schémas de messages et le guide d’intégration pour les portefeuilles et les autres protocoles |
| `hipo://docs/schema`       | L’intégralité des schémas TL-B de tous les contrats Hipo                                          |
| `hipo://docs/knowledge`    | La base de connaissances Hipo curatée ([llms.txt](https://hipo.finance/llms.txt))                 |

## Exemple

Un appel à `get_exchange_rate` renvoie du JSON simple. Les nombres changent à chaque cycle : considère-les comme une forme, pas comme des valeurs actuelles.

```json
{
  "oneHgramInGram": "1.143623345",
  "oneGramInHgram": "0.874413769",
  "totalCoinsGram": "2501952.200844389",
  "totalTokensHgram": "2187741.455006677",
  "recentApy": "15.59%",
  "apyNote": "APY is derived from the last on-chain rate update (current_rate / previous_rate compounded to a year). Rewards accrue in the exchange rate: hGRAM becomes worth more GRAM over time; there is no separate claim.",
  "disclaimer": "Live protocol data, not financial advice. Values change every validation round and no returns are guaranteed."
}
```

Le serveur ne réimplémente jamais les calculs du protocole. Chaque nombre ci-dessus vient d’un getter de contrat, et le dépôt des contrats fait foi pour les adresses déployées.

## Auto-hébergement

Le serveur est sous licence MIT et vit sur [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp). Il embarque deux transports — `stdio` pour les clients locaux et HTTP streamable pour un déploiement hébergé — ainsi qu’un Dockerfile :

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

Toute la configuration est facultative ; par défaut, le serveur vise le mainnet via l’API publique toncenter.

| Variable d’environnement   | Valeur par défaut                      | Rôle                                                                                                                       |
| -------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` ou `testnet`                                                                                                     |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | Point d’accès de l’API HTTP TON                                                                                            |
| `TONCENTER_API_KEY`        | _(aucune)_                             | Clé d’API toncenter ; sans elle, la limite de débit publique s’applique, et les appels limités sont réessayés avec backoff |
| `TONCENTER_API_KEY_FILE`   | _(aucune)_                             | Chemin d’un fichier contenant la clé d’API, par exemple un secret Docker ; prioritaire sur `TONCENTER_API_KEY`             |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | Durée de mise en cache de l’état de la trésorerie, des horaires et des frais entre deux appels d’outil                     |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | Durée de mise en cache des ressources documentaires                                                                        |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | URL de base de l’API des récompenses Hipo ; laisse-la vide pour désactiver `get_reward_history`                            |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | Transport HTTP uniquement                                                                                                  |
