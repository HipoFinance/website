---
title: 'Hipo MCP Server'
description: 'Collega Claude, Cursor o qualsiasi client AI compatibile con MCP alla documentazione e ai dati on-chain in tempo reale di Hipo.'
---

## Che cos'è l'Hipo MCP Server?

L'Hipo MCP Server è un piccolo servizio open source che permette agli assistenti AI di accedere ai dati relativi a Hipo, incluse le informazioni sullo staking di GRAM e altri argomenti. Parla il [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), uno standard aperto per collegare i client AI a dati esterni, così qualsiasi client compatibile con MCP — Claude, Claude Code, Cursor e altri — può consultare la documentazione di Hipo e interrogare i numeri on-chain in tempo reale invece di tirare a indovinare dalla memoria.

Una volta collegato, il tuo assistente può rispondere a domande come:

- _Qual è l'attuale tasso di cambio hGRAM/GRAM e quale APY implica?_
- _Quanti GRAM ci sono in staking in Hipo in questo momento?_
- _Quando finisce il round di validazione in corso e quando il mio deposito differito mintarà hGRAM?_
- _Qual è il saldo in hGRAM di questo indirizzo e quanto vale in GRAM?_
- _Quale commissione di gas dovrei allegare a un deposito?_

Le risposte arrivano dai getter degli smart contract di Hipo su TON, non dai dati di addestramento del modello, quindi sono aggiornate al momento in cui poni la domanda.

Il server è rigorosamente in **sola lettura**. Non detiene chiavi, non firma nulla e non invia messaggi alla blockchain. Può guardare, ma non può mai muovere i tuoi fondi — collegarlo non è un modo per permettere a qualcuno di fare staking, unstaking o trasferimenti per tuo conto.

## Collegamento

### Server ospitato (consigliato)

Hipo gestisce un'istanza pubblica. Punta il tuo client MCP a:

```
https://mcp.hipo.finance/mcp
```

In [Claude Code](https://claude.com/product/claude-code), basta un comando:

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Questo registra il server per il progetto corrente. Per raggiungerlo invece da ogni progetto, passa `-s user` — qui `user` è una parola chiave letterale che indica lo scope, non un segnaposto per il tuo nome utente:

```sh
claude mcp add -s user --transport http hipo https://mcp.hipo.finance/mcp
```

In entrambi i casi, usa il comando invece di modificare a mano un file di configurazione: Claude Code tiene i suoi server MCP nella propria configurazione e un blocco `mcpServers` inserito in `settings.json` viene ignorato. Esegui `claude mcp list` per confermare che il server sia collegato e riavvia Claude Code dopo l'aggiunta — i server vengono collegati all'avvio, quindi uno appena aggiunto non è disponibile in una sessione già in corso.

Gli altri client si configurano con un file JSON (Claude Desktop, Cursor e la maggior parte degli altri) e accettano una voce come questa:

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

### Eseguirlo in locale

Se preferisci eseguire tu stesso il server, è pubblicato su npm come [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) e parla stdio. Richiede Node.js 20 o successivo:

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

Vale lo stesso consiglio anche qui — aggiungilo con il comando, non modificando un file a mano. Per gli altri client, la voce di configurazione JSON è:

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

## Strumenti

Queste sono le domande a cui il server può rispondere. Il tuo client AI sceglie da solo quello giusto — tu chiedi in linguaggio naturale.

| Strumento            | Che cosa restituisce                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_exchange_rate`  | Il tasso hGRAM↔GRAM attuale, il totale dei GRAM in staking, l'offerta di hGRAM e l'APY recente derivato dagli aggiornamenti del tasso on-chain                         |
| `get_treasury_state` | I totali della tesoreria: TVL in GRAM, offerta di hGRAM, depositi e unstaking in attesa, partecipazioni ai round attive, il flag di blocco e i parametri di governance |
| `get_round_timing`   | I tempi del round di validazione: i confini del round attuale e del prossimo, la finestra di partecipazione alle elezioni e per quanto restano bloccati gli importi    |
| `get_fees`           | Le commissioni di gas attuali per le richieste di deposito, unstaking e prestito                                                                                       |
| `get_wallet_status`  | Il saldo in hGRAM di un dato indirizzo, il suo valore in GRAM ed eventuali operazioni di staking o unstaking in attesa                                                 |
| `get_reward_history` | Lo storico delle ricompense di staking in GRAM di un dato indirizzo per ogni round, incluso il livello di Hipo Club e le ricompense in HPO                             |
| `get_participation`  | La partecipazione di Hipo a un round di validazione: stato, numero di prestiti, totali e orario di rilascio degli importi in staking                                   |
| `get_loan_info`      | Il contratto di prestito di un mutuatario per un round: indirizzo, stato del deployment, saldo e parti coinvolte                                                       |
| `get_max_punishment` | La penalità massima che il protocollo può applicare per un dato importo in staking di un validatore                                                                    |

I primi quattro strumenti non richiedono alcun input. `get_wallet_status`, `get_reward_history` e `get_loan_info` accettano un indirizzo TON — quello del proprietario o del mutuatario, non l'indirizzo del suo jetton wallet — e `get_max_punishment` accetta un importo in staking in GRAM. Anche `get_participation` e `get_loan_info` accettano l'orario di inizio di un round, ma è facoltativo: se lo ometti, riportano i dati del round in corso.

Ogni risposta porta con sé lo stesso promemoria: gli strumenti restituiscono dati di protocollo in tempo reale, non consulenza finanziaria; i valori cambiano a ogni round di validazione e nessun rendimento è garantito.

## Risorse di documentazione

Oltre ai dati in tempo reale, il server espone i documenti tecnici di Hipo come risorse MCP, recuperate dalle loro posizioni pubbliche canoniche in modo che siano sempre aggiornate:

| Risorsa                    | Contenuto                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | Il README del repository degli smart contract: riepilogo del protocollo e indirizzi dei contratti deployati |
| `hipo://docs/architecture` | I contratti, la macchina a stati del round di validazione e gli invarianti del protocollo                   |
| `hipo://docs/integration`  | Gli schemi dei messaggi e la guida all'integrazione per wallet e altri protocolli                           |
| `hipo://docs/schema`       | Gli schemi TL-B completi di tutti i contratti di Hipo                                                       |
| `hipo://docs/knowledge`    | La knowledge base curata di Hipo ([llms.txt](https://hipo.finance/llms.txt))                                |

## Esempio

Una chiamata a `get_exchange_rate` restituisce semplice JSON. I numeri cambiano a ogni round, quindi consideralo come una forma, non come valori attuali:

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

Il server non reimplementa mai la matematica del protocollo. Ogni numero qui sopra viene da un getter di un contratto, e il repository dei contratti è la fonte di verità per gli indirizzi deployati.

## Self-hosting

Il server è rilasciato con licenza MIT e si trova su [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp). Include due transport — `stdio` per i client locali e HTTP streamable per un deployment ospitato — e un Dockerfile:

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

Tutta la configurazione è facoltativa; i valori predefiniti puntano alla mainnet attraverso l'API pubblica di toncenter.

| Variabile d'ambiente       | Predefinito                            | Scopo                                                                                                                                     |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` o `testnet`                                                                                                                     |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | Endpoint dell'API HTTP di TON                                                                                                             |
| `TONCENTER_API_KEY`        | _(nessuno)_                            | Chiave API di toncenter; senza una chiave si applica il limite di frequenza pubblico e le chiamate limitate vengono ritentate con backoff |
| `TONCENTER_API_KEY_FILE`   | _(nessuno)_                            | Percorso di un file che contiene la chiave API, per esempio un secret di Docker; ha la precedenza su `TONCENTER_API_KEY`                  |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | Per quanto tempo lo stato della tesoreria, gli orari e le commissioni restano in cache tra una chiamata e l'altra                         |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | Per quanto tempo le risorse di documentazione restano in cache                                                                            |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | URL di base dell'API delle ricompense di Hipo; lasciala vuota per disattivare `get_reward_history`                                        |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | Solo per il transport HTTP                                                                                                                |
