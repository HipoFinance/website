---
title: 'Hipo MCP Server'
description: 'Verbinden Sie Claude, Cursor oder einen beliebigen MCP-fähigen KI-Client mit der Dokumentation und den Live-On-Chain-Daten von Hipo.'
---

## Was ist der Hipo MCP Server?

Der Hipo MCP Server ist ein kleiner Open-Source-Dienst, über den KI-Assistenten auf Hipo-bezogene Daten zugreifen können — etwa auf Informationen zum Staken von GRAM und zu anderen Themen. Er spricht das [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), einen offenen Standard für die Anbindung von KI-Clients an externe Daten. So kann jeder MCP-fähige Client — Claude, Claude Code, Cursor und andere — die Dokumentation von Hipo nachschlagen und aktuelle On-Chain-Zahlen abfragen, statt aus dem Gedächtnis zu raten.

Nach dem Verbinden kann Ihr Assistent Fragen wie diese beantworten:

- _Wie hoch ist der aktuelle hGRAM/GRAM-Wechselkurs, und welchen APY bedeutet das?_
- _Wie viel GRAM ist gerade in Hipo gestakt?_
- _Wann endet die laufende Validierungsrunde, und wann mintet meine aufgeschobene Einzahlung hGRAM?_
- _Wie hoch ist das hGRAM-Guthaben dieser Adresse, und was ist es in GRAM wert?_
- _Welche Gas-Gebühr sollte ich einer Einzahlung beifügen?_

Die Antworten stammen aus den Gettern der Smart Contracts von Hipo auf TON, nicht aus den Trainingsdaten des Modells — sie sind also zum Zeitpunkt Ihrer Frage aktuell.

Der Server ist strikt **schreibgeschützt**. Er hält keine Schlüssel, signiert nichts und sendet keine Nachrichten an die Blockchain. Er kann sehen, aber niemals Ihre Mittel bewegen — ihn zu verbinden ermöglicht es niemandem, in Ihrem Namen zu staken, zu unstaken oder zu transferieren.

## Verbinden

### Gehosteter Server (empfohlen)

Hipo betreibt eine öffentliche Instanz. Richten Sie Ihren MCP-Client auf:

```
https://mcp.hipo.finance/mcp
```

In [Claude Code](https://claude.com/product/claude-code) genügt ein einziger Befehl:

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Damit wird der Server für das aktuelle Projekt registriert. Um ihn stattdessen aus jedem Projekt zu erreichen, übergeben Sie `-s user` — `user` ist hier ein wörtliches Scope-Schlüsselwort und kein Platzhalter für Ihren eigenen Benutzernamen:

```sh
claude mcp add -s user --transport http hipo https://mcp.hipo.finance/mcp
```

Verwenden Sie in beiden Fällen den Befehl, statt eine Konfigurationsdatei von Hand zu bearbeiten: Claude Code verwaltet seine MCP-Server in einer eigenen Konfiguration, und ein `mcpServers`-Block in `settings.json` wird ignoriert. Mit `claude mcp list` prüfen Sie, ob der Server verbunden ist; starten Sie Claude Code danach neu — Server werden beim Start verbunden, ein neu hinzugefügter steht in einer bereits laufenden Sitzung also noch nicht zur Verfügung.

Andere Clients werden über eine JSON-Datei konfiguriert (Claude Desktop, Cursor und die meisten anderen) und erwarten einen Eintrag wie diesen:

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

### Lokal betreiben

Wenn Sie den Server lieber selbst betreiben möchten: Er ist auf npm als [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) veröffentlicht und spricht stdio. Dafür wird Node.js 20 oder neuer benötigt:

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

Auch hier gilt derselbe Rat — fügen Sie ihn mit dem Befehl hinzu, nicht durch das Bearbeiten einer Datei von Hand. Für andere Clients lautet der JSON-Konfigurationseintrag:

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

## Tools

Das sind die Fragen, die der Server beantworten kann. Ihr KI-Client wählt das passende Tool selbst aus — Sie fragen einfach in normaler Sprache.

| Tool                 | Was es zurückgibt                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_exchange_rate`  | Den aktuellen hGRAM↔GRAM-Kurs, das gesamte gestakte GRAM, das hGRAM-Angebot und den jüngsten APY, abgeleitet aus On-Chain-Kursaktualisierungen                 |
| `get_treasury_state` | Treasury-Summen: TVL in GRAM, hGRAM-Angebot, ausstehende Einzahlungen und Unstakes, aktive Rundenbeteiligungen, das Halt-Flag und Governance-Parameter         |
| `get_round_timing`   | Zeitplan der Validierungsrunde: Grenzen der aktuellen und der nächsten Runde, das Zeitfenster für die Wahlteilnahme und wie lange Einlagen eingefroren bleiben |
| `get_fees`           | Aktuelle Gas-Gebühren für Einzahlungen, Unstakes und Kreditanfragen                                                                                            |
| `get_wallet_status`  | Das hGRAM-Guthaben einer bestimmten Adresse, seinen Wert in GRAM sowie alle ausstehenden Stakes oder Unstakes                                                  |
| `get_reward_history` | Die historischen GRAM-Staking-Rewards einer bestimmten Adresse pro Runde, inklusive Hipo-Club-Level und HPO-Rewards                                            |
| `get_participation`  | Die Beteiligung von Hipo an einer Validierungsrunde: Status, Anzahl der Kredite, Summen und Freigabezeitpunkt der Einlagen                                     |
| `get_loan_info`      | Den Kreditvertrag eines Kreditnehmers für eine Runde: Adresse, Deployment-Status, Guthaben und beteiligte Parteien                                             |
| `get_max_punishment` | Die maximale Strafe, die das Protokoll für eine bestimmte Validator-Einlage verhängen kann                                                                     |

Die ersten vier Tools benötigen überhaupt keine Eingabe. `get_wallet_status`, `get_reward_history` und `get_loan_info` erwarten eine TON-Adresse — die eigene Adresse des Inhabers bzw. des Kreditnehmers, nicht dessen Jetton-Wallet-Adresse — und `get_max_punishment` erwartet einen Einlagenbetrag in GRAM. `get_participation` und `get_loan_info` akzeptieren außerdem einen Rundenstartzeitpunkt, dieser ist jedoch optional: Ohne ihn berichten sie über die laufende Runde.

Jede Antwort enthält denselben Hinweis darauf, dass die Tools aktuelle Protokolldaten liefern und keine Finanzberatung: Die Werte ändern sich mit jeder Validierungsrunde, und es werden keine Erträge garantiert.

## Dokumentations-Ressourcen

Neben den Live-Daten stellt der Server die technischen Dokumente von Hipo als MCP-Ressourcen bereit, abgerufen von ihren kanonischen öffentlichen Speicherorten, sodass sie immer aktuell sind:

| Ressource                  | Inhalt                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | Die README des Smart-Contract-Repositorys: Protokollüberblick und Adressen der deployten Contracts |
| `hipo://docs/architecture` | Contracts, der Zustandsautomat der Validierungsrunde und die Protokollinvarianten                  |
| `hipo://docs/integration`  | Nachrichtenschemata und der Integrationsleitfaden für Wallets und andere Protokolle                |
| `hipo://docs/schema`       | Die vollständigen TL-B-Schemata aller Hipo-Contracts                                               |
| `hipo://docs/knowledge`    | Die kuratierte Hipo-Wissensbasis ([llms.txt](https://hipo.finance/llms.txt))                       |

## Beispiel

Ein Aufruf von `get_exchange_rate` gibt schlichtes JSON zurück. Die Zahlen ändern sich mit jeder Runde — betrachten Sie sie also als Beispielform, nicht als aktuelle Werte:

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

Der Server bildet die Protokollmathematik nie selbst nach. Jede Zahl oben stammt aus einem Contract-Getter, und das Contract-Repository ist die maßgebliche Quelle für die deployten Adressen.

## Selbst hosten

Der Server steht unter der MIT-Lizenz und liegt unter [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp). Er bringt zwei Transporte mit — `stdio` für lokale Clients und streamable HTTP für ein gehostetes Deployment — sowie ein Dockerfile:

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

Die gesamte Konfiguration ist optional; die Standardwerte zielen über die öffentliche toncenter-API auf das Mainnet.

| Umgebungsvariable          | Standard                               | Zweck                                                                                                                    |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` oder `testnet`                                                                                                 |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | Endpunkt der TON HTTP API                                                                                                |
| `TONCENTER_API_KEY`        | _(keiner)_                             | toncenter-API-Schlüssel; ohne ihn gilt das öffentliche Ratenlimit, und gedrosselte Aufrufe werden mit Backoff wiederholt |
| `TONCENTER_API_KEY_FILE`   | _(keiner)_                             | Pfad zu einer Datei mit dem API-Schlüssel, etwa einem Docker-Secret; hat Vorrang vor `TONCENTER_API_KEY`                 |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | Wie lange Treasury-Status, Zeiten und Gebühren zwischen Tool-Aufrufen zwischengespeichert werden                         |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | Wie lange Dokumentations-Ressourcen zwischengespeichert werden                                                           |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | Basis-URL der Hipo-Rewards-API; leer setzen, um `get_reward_history` zu deaktivieren                                     |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | Nur für den HTTP-Transport                                                                                               |
