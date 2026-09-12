---
title: 'Hipo Fund Investment Policy Statement'
description: 'Wie der Hipo Fund investiert ist: Zielallokation, Risiko- und Konzentrationsgrenzen, Verwahrung, Liquidität und wie ein Teil des Wachstums des Fonds an die HPO-Inhaber zurückfließt.'
---

:::caution

**Dies ist ein Entwurf zur Prüfung durch die Community. Er ist noch nicht in Kraft.**

:::

**Entwurf v1.5 · Zur Prüfung durch die Community und Ratifizierung durch die DAO**

---

## Auf einen Blick

_Es folgt die vollständige Richtlinie. Weichen beide voneinander ab, gelten die nummerierten Abschnitte._

**Zielallokation.** HPO liegt außerhalb der Allokation. Alles Übrige:

| Baustein                                                                      | Ziel | Bandbreite |
| ----------------------------------------------------------------------------- | ---- | ---------- |
| Stablecoin-Rendite, investiert                                                | 45 % | 35–55 %    |
| Opportunity Reserve — wird nur bei einem Bitcoin-Drawdown-Auslöser eingesetzt | 10 % | 5–15 %     |
| Bitcoin, nativ gehalten                                                       | 30 % | 20–35 %    |
| hGRAM                                                                         | 12 % | 8–18 %     |
| Betriebsliquidität und Gas                                                    | 3 %  | 2–6 %      |

**Wichtige Grenzen.**

|                                                     |                  |
| --------------------------------------------------- | ---------------- |
| TON-Ökosystem-Assets (HPO + hGRAM + GRAM)           | ≤ 45 % des Fonds |
| Assets, die kein Emittent einfrieren kann           | ≥ 20 % des Fonds |
| Ein einzelnes Protokoll oder ein einzelner Emittent | ≤ 30 % des Fonds |
| Assets außerhalb der Multisig-Verwahrung            | 0 %              |
| Leverage                                            | Null, immer      |

**Was HPO-Inhaber erhalten.**

| Kanal               | Wie es funktioniert                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wertrückführung** | Oberhalb seiner High-Water-Mark gibt der Fonds bis zur Hälfte seines kumulierten Wachstums an die HPO-Inhaber zurück, begrenzt auf bis zu 2 % des Fondswerts pro Jahr. Wachstum, das durch diese Tempogrenze zurückgehalten wird, wird aufgeschoben, nicht verwirkt. Ausgezahlt über die Gewinnbeteiligung von Hipo Club oder durch den Kauf und das Verbrennen von HPO — die DAO stimmt über die Form ab, nicht über den Betrag. |
| **Asset-Deckung**   | Der Wert des Fonds als Anteil an der Marktkapitalisierung von HPO wird jedes Quartal veröffentlicht.                                                                                                                                                                                                                                                                                                                              |
| **Governance**      | Die HPO-Inhaber stimmen über diese Richtlinie ab, über jede Änderung daran und über jeden Verkauf der HPO-Bestände des Fonds.                                                                                                                                                                                                                                                                                                     |

**Zehn Regeln.**

1. **Kein Leverage, keine Derivate, kein Market-Making.** In keiner Größenordnung, niemals.
2. **Der Fonds kauft kein HPO, um es zu halten.** Er darf HPO kaufen, um es zu verbrennen, finanziert ausschließlich aus Gewinnen — siehe Abschnitt 2.2 und 8.
3. **Der Fonds ist keine Quelle für HPO-Marktliquidität oder für Betriebsmittel.**
4. **Alle Assets in Multisigs mit 2 von 3 Signaturen** — eine auf TON, eine auf EVM, eine auf Bitcoin.
5. **Jede Position muss sich direkt aus ihrem Contract auszahlen lassen,** ohne Erlaubnis eines Betreibers oder eines Front-Ends.
6. **Kein Market-Timing.** Rebalancing-Bandbreiten übernehmen das Kaufen bei niedrigen und das Verkaufen bei hohen Kursen, mechanisch.
7. **Die Opportunity Reserve wird nur bei einem Auslöser eingesetzt** — Bitcoin 40 %, 55 % und 70 % unter seinem gleitenden 12-Monats-Hoch, in Dritteln.
8. **Niemand wird für die Verwaltung dieses Fonds bezahlt.** Keine Verwaltungsgebühr, keine Performancegebühr.
9. **Ein Bericht jedes Quartal,** aus einem einzigen On-Chain-Block, mit der Wertentwicklung seit Auflegung und dem aktuellen Wert jeder Grenze.
10. **Die DAO legt den Rahmen fest; die Unterzeichner setzen ihn um.**

**Eine Sache, die klar sein sollte.** Bei dieser Allokation erwirtschaftet der Fonds rund 2 % pro Jahr. Seine High-Water-Mark ist das ihm zugeführte Kapital, rund 224.056 $, und keine Wertrückführung ist fällig, solange der Fonds nicht über dieser Marke liegt. Diese Richtlinie ist darauf ausgelegt, stetig zu wachsen und volle Marktzyklen zu überstehen, nicht darauf, sich schnell zu erholen.

---

## 1. Zweck und Ursprung

Der Hipo Fund wurde im April 2025 aus den Erlösen des HPO-ILO geschaffen, zusammen mit HPO-Claims aus den Saisons von Hipo Club. Dieses Kapital wurde nicht dem Team zugeteilt und nicht in das operative Budget von Hipo übernommen. Es wurde in eine separate, öffentlich einsehbare Treasury eingebracht und zurückgelegt, um über einen in Jahren gemessenen Horizont für das Hipo-Ökosystem und für die HPO-Inhaber zu arbeiten.

Dieses Dokument legt fest, wie dieses Kapital investiert wird: was der Fonds halten darf, wie viel wovon er halten darf, wer worüber entscheidet, wie Wert an die HPO-Inhaber zurückfließt und wie darüber berichtet wird.

Eine schriftliche Richtlinie macht Entscheidungen wiederholbar, sodass das Verhalten des Fonds nicht davon abhängt, wer in diesem Monat gerade aufmerksam ist. Sie macht sie überprüfbar, sodass die Community den Prozess beurteilen kann und nicht nur das Ergebnis. Und sie legt Grenzen fest, bevor sie gebraucht werden, dann, wenn man sich leicht auf sie einigen kann.

Sobald sie per DAO-Abstimmung ratifiziert ist, ist diese Richtlinie für die Unterzeichner des Fonds verbindlich.

---

## 2. Mandat und Ziele

Der Hipo Fund ist eine langfristige Investment-Treasury. Seine Ziele, in Prioritätsreihenfolge:

1. **Kapital erhalten** über vollständige Marktzyklen hinweg.
2. **Den realen Wert des Fonds steigern** über einen in Jahren gemessenen Horizont.
3. **Einen Teil dieses Wachstums an die HPO-Inhaber zurückgeben**, nachhaltig und ohne das Kapital anzugreifen.

### Was der Hipo Fund nicht ist

- **Kein Handelskonto.** Er geht keine kurzfristigen Positionen ein und versucht nicht, den Markt zu timen.
- **Keine Quelle für HPO-Marktliquidität.** Liquidität für den HPO-Markt bereitzustellen, ist eine Tokenomics-Entscheidung, finanziert aus den Treasury- und Marketing-Allokationen von HPO.
- **Keine Quelle für Betriebsmittel.** Der Fonds ist vom operativen Budget von Hipo getrennt und kann nicht für Ausgaben herangezogen werden.

### 2.1 Wie der Hipo Fund Wert an die HPO-Inhaber zurückgibt

Hipo gibt Wert aus seinen Einnahmequellen auf zwei etablierte Arten an die HPO-Inhaber zurück: durch die Gewinnbeteiligung von Hipo Club und durch den Kauf von HPO am Markt und dessen Verbrennung. Der Hipo Fund soll eine weitere dieser Quellen werden.

Wächst der Fonds über seine High-Water-Mark hinaus, wird jedes Jahr ein Teil dieses Wachstums gemäß der Regel in Abschnitt 2.2 den HPO-Inhabern zugeteilt. Welche Form das annimmt — Gewinnbeteiligung oder Buy-and-Burn —, wird entschieden, sobald eine Ausschüttung fällig wird, unter Nutzung der Infrastruktur, die Hipo bereits betreibt.

Beide Formen geben realen Wert zurück; sie tun es auf unterschiedliche Weise, und die Wahl sollte die jeweiligen Bedingungen widerspiegeln:

- **Buy-and-Burn** reduziert das HPO-Angebot dauerhaft und kommt jedem Inhaber zugute, ohne dass jemand etwas beanspruchen muss. Es schafft den größten Wert, wenn HPO unter dem gehandelt wird, was die Assets des Fonds und die Fundamentaldaten des Protokolls stützen, denn ein Burn ist nur wertsteigernd, wenn Tokens unter ihrem Wert gekauft werden. Sein Preis ist Market Impact: In einem dünnen Markt bewegt ein Teil der Ausgaben den Kurs, statt Angebot zu kaufen.
- **Gewinnbeteiligung** gibt jeden Dollar pro rata ohne Market Impact in die Hände der Inhaber und ist der effizientere Weg, wann immer HPO nicht eindeutig günstig ist.

Zusätzlich dazu wird der Wert des Fonds als Prozentsatz der zirkulierenden Marktkapitalisierung von HPO in jedem Quartalsbericht veröffentlicht. Das ist der Anteil der Bewertung von HPO, der durch Assets außerhalb des Tokens selbst gedeckt ist, und er wird berichtet, ob er steigt oder fällt.

**Eine Anmerkung zur Größenordnung.** Bei der aktuellen Größe des Fonds wäre eine Wertrückführung bescheiden, und solange der Fonds unter seiner High-Water-Mark liegt, ist keine fällig. Die Regel ist wichtig für das, wozu sie sich verpflichtet: Sie gibt den HPO-Inhabern einen definierten, veröffentlichten Anspruch auf das Wachstum des Fonds, der mit dem Fonds mitwächst und der nicht ohne DAO-Abstimmung geändert werden kann.

### 2.2 Die Regel zur Wertrückführung

**High-Water-Mark.** Das gesamte dem Fonds zugeführte Kapital, zuzüglich allem, was der Fonds den HPO-Inhabern bereits zurückgegeben hat. Sie liegt derzeit bei rund **224.056 $**. Sie steigt, wenn neues Kapital zugeführt wird, und um den Betrag jeder Wertrückführung. Sie sinkt nie.

**Unterhalb der High-Water-Mark wird nichts zurückgegeben.** Zuerst wird das Kapital wieder aufgebaut. Eine Auszahlung unterhalb der Marke wäre eine Auszahlung aus dem Kapitalstock.

**Darüber** teilt der Fonds in jedem Geschäftsjahr der Wertrückführung an HPO den jeweils **niedrigeren** der folgenden Beträge zu:

- **50 % des Fondswerts oberhalb der High-Water-Mark** und
- **2 % des Gesamtwerts des Fonds** zu Beginn des Jahres

#### Warum es zwei Grenzen gibt

Die beiden Grenzen erfüllen unterschiedliche Aufgaben.

**Die 50-%-Grenze entscheidet, ob überhaupt etwas zurückzugeben ist.** Sie misst den Fonds an allem, was je in ihn eingebracht oder aus ihm ausgezahlt wurde, sodass ein Jahr, in dem der Fonds nicht wächst, nichts hervorbringt — und in keinem Fall wird mehr als die Hälfte des kumulierten Wachstums des Fonds ausgezahlt. Die andere Hälfte bleibt investiert und arbeitet weiter.

**Die jährliche Obergrenze entscheidet, wie schnell ausgezahlt wird.** In den meisten Jahren ist die Obergrenze die maßgebliche Grenze; die 50-%-Grenze greift nur in dem schmalen Band direkt oberhalb der High-Water-Mark. Das ist beabsichtigt. Ein Fonds, der nach einem starken Jahr stark auszahlt und in den folgenden drei Jahren nichts, dient den Inhabern schlechter als einer, der stetig auszahlt, und eine Treasury dieser Größe braucht ihr Compounding mehr als eine einzelne große Zahlung.

**Die Obergrenze verlangsamt das Tempo der Auszahlung. Sie hebt sie nicht auf.** Da die High-Water-Mark nur um das steigt, was tatsächlich zurückgegeben wird, bleibt das durch die Obergrenze zurückgehaltene Wachstum oberhalb der Marke und bleibt in späteren Jahren ausschüttungsfähig. Nichts, das qualifiziert ist, verfällt — es wird aufgeschoben.

_Durchgerechnetes Beispiel._ Angenommen, der Fonds erreicht 300.000 $ gegenüber einer High-Water-Mark von 224.056 $. Das Wachstum oberhalb der Marke beträgt 75.944 $, sodass die 50-%-Grenze 37.972 $ erlauben würde — aber die Obergrenze begrenzt die Rückführung des Jahres auf 6.000 $. Die High-Water-Mark steigt auf 230.056 $. Bleibt der Wert des Fonds im folgenden Jahr unverändert, beträgt das Wachstum oberhalb der Marke 69.944 $, die Obergrenze erlaubt erneut 6.000 $, und dieser Betrag wird ausgezahlt. Der gedeckelte Betrag geht nicht verloren; er wird über die folgenden Jahre zurückgegeben.

#### Der Betrag ist keine Entscheidung

Liegt der Fonds über seiner High-Water-Mark, ist die Zuteilung eine Berechnung, die beim Quartalsbericht durchgeführt wird, kein Vorschlag. Einmal berechnet, wird sie für die HPO-Inhaber zurückgelegt, bis zur Auszahlung als zugesagter Betrag ausgewiesen und kann nicht wieder in den Fonds aufgenommen werden.

**Nur über die Form wird abgestimmt.** Die Unterzeichner schlagen Gewinnbeteiligung, Buy-and-Burn oder eine Aufteilung vor, mit Begründung, und die DAO ratifiziert die Form. Ein Vorschlag, der nicht ratifiziert wird, wird überarbeitet und erneut vorgelegt — die Zuteilung selbst verfällt nicht. Ist innerhalb von 90 Tagen nach dem auslösenden Bericht keine Form ratifiziert, wird die Zuteilung als Buy-and-Burn ausgeführt, was keine externe Infrastruktur benötigt und nicht blockiert werden kann.

**Die Formel kann nur per DAO-Abstimmung geändert werden.** Die Unterzeichner können eine Wertrückführung innerhalb dieser Regel ausführen; sie können sie nicht ändern, aufschieben oder erlassen.

#### Bedingungen

- Der Fonds bleibt nach der Rückführung innerhalb jeder Grenze aus Abschnitt 7
- Sie wird aus Erträgen und aus bereits durch gewöhnliches Rebalancing realisierten Erlösen finanziert — niemals durch den Verkauf von Bitcoin unterhalb seiner Bandbreite, den Einsatz der Opportunity Reserve, den Verkauf der HPO-Bestände des Fonds oder die Liquidation einer Position allein, um einen auszahlbaren Betrag zu schaffen
- Würde die Auszahlung der vollen Zuteilung einen Baustein außerhalb seiner Bandbreite bewegen, wird so viel ausgezahlt, wie die Bandbreiten zulassen, und der Rest wird auf das folgende Jahr übertragen, wobei die High-Water-Mark nur um den tatsächlich ausgezahlten Betrag steigt
- Die vollständige Berechnung wird im Quartalsbericht veröffentlicht, einschließlich der High-Water-Mark davor und danach

---

## 3. Governance und Entscheidungsrechte

| Entscheidung                                                            | Wer entscheidet                                                                                                                          |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Diese Richtlinie ändern                                                 | **DAO-Abstimmung** (verbindlich)                                                                                                         |
| Die Formel zur Wertrückführung ändern                                   | **DAO-Abstimmung** (verbindlich)                                                                                                         |
| Die HPO-Position reduzieren                                             | **DAO-Abstimmung** (verbindlich)                                                                                                         |
| Eine in Abschnitt 5 nicht aufgeführte Anlageklasse hinzufügen           | **DAO-Abstimmung** (verbindlich)                                                                                                         |
| Eine Managervergütung einführen                                         | **DAO-Abstimmung** (verbindlich) — Abschnitt 14                                                                                          |
| Welche Form eine Wertrückführung annimmt                                | Die Unterzeichner schlagen vor, die DAO ratifiziert. Der Betrag ist eine Berechnung gemäß Abschnitt 2.2 und unterliegt keiner Abstimmung |
| Ein neues Protokoll innerhalb einer genehmigten Anlageklasse hinzufügen | Unterzeichner, angekündigt innerhalb von 7 Tagen                                                                                         |
| Die Opportunity Reserve einsetzen, sobald ein Auslöser eintritt         | Unterzeichner, angekündigt innerhalb von 7 Tagen                                                                                         |
| Rebalancing innerhalb der Bandbreiten aus Abschnitt 6                   | Unterzeichner, vierteljährlich berichtet                                                                                                 |
| Ausführungsort, Zeitpunkt und Weg                                       | Unterzeichner                                                                                                                            |

Die DAO legt den Rahmen und die Grenzen fest; die Unterzeichner setzen sie um. Über einzelne Trades wird nicht abgestimmt — eine Treasury, die für ein Rebalancing eine Abstimmung braucht, kann nicht rebalancieren.

**Ankündigung.** Jede einzelne Transaktion über **10.000 $** sowie jede Änderung, die einen Baustein außerhalb seiner Bandbreite bewegt, wird innerhalb von 7 Tagen in den offiziellen Kanälen von Hipo angekündigt.

---

## 4. Verwahrung

Alle Assets des Fonds werden in Multisig-Wallets gehalten. Es gibt drei, jede mit einer Aufgabe.

| Wallet                      | Hält                               | Signaturen |
| --------------------------- | ---------------------------------- | ---------- |
| TON-Multisig `hipofund.ton` | hGRAM, HPO, GRAM für Gas           | 2 von 3    |
| EVM-Safe-Multisig           | Stablecoins und Lending-Positionen | 2 von 3    |
| Bitcoin-Multisig            | BTC                                | 2 von 3    |

- Alle drei verwenden dieselben drei Unterzeichner, allesamt Mitglieder des Hipo-Teams.
- **Keine Assets des Fonds werden in einer Einzelsignatur-Wallet gehalten.**
- **Der Fonds bewegt keine Assets aus der Multisig heraus, um eine Teilnahmebedingung zu erfüllen.** Unterstützt ein Hipo-System keine Multisig-Wallets, wird das System geändert, nicht die Verwahrungsregelung. Multisig-Unterstützung ist eine Voraussetzung, bevor der Fonds an einem Ausschüttungsmechanismus teilnimmt.
- Keine Assets des Fonds werden auf einer zentralisierten Börse, bei einem Verwahrer oder in einem von einer einzelnen Person kontrollierten Konto gehalten, außer während des Transfers gemäß Abschnitt 4.1.
- Bitcoin wird nativ gehalten, nicht gewrappt. Jeder Wrapper führt erneut einen Verwahrer ein, und dieser Baustein muss nicht produktiv sein.

### 4.1 Assets zwischen Blockchains bewegen

Cross-Chain-Transfers nutzen eine On-Chain-Bridge mit einer verifizierten aktiven Route, ausgeführt in Tranchen statt als einzelne Transaktion.

Existiert keine verlässliche On-Chain-Route, darf ein Transfer über ein Börsenkonto eines Unterzeichners laufen, sofern alle der folgenden Bedingungen erfüllt sind:

- Höchstens **15 % des Fonds** gleichzeitig im Transfer
- Abgeschlossen innerhalb von **72 Stunden**
- Beide Teilstrecken im nächsten Quartalsbericht veröffentlicht, mit Transaktions-Hashes auf jeder Chain
- Von mindestens zwei Unterzeichnern vereinbart, bevor er beginnt

Das ist ein Fallback, kein Standard. Während des Transfers liegen die Assets außerhalb der Multisig-Kontrolle und außerhalb der On-Chain-Aufzeichnung, auf der die Transparenz des Fonds beruht. Die Grenzen sind es, die dieses Zeitfenster eng genug machen, um es zu akzeptieren.

---

## 5. Zulässige Assets

Der Fonds darf nur das Folgende halten. Alles andere erfordert eine DAO-Abstimmung.

**Zulässig**

- **Bitcoin**, nativ gehalten
- **Fiat-gedeckte Stablecoins** von Emittenten, die Reserve-Attestierungen veröffentlichen — derzeit USDT, USDC, USDS
- **hGRAM**
- **HPO**, nur zum bestehenden Guthaben — Abschnitt 8
- **Einlagen in Blue-Chip-Lending-Protokollen**, die alle folgenden Kriterien erfüllen: mindestens 1 Mrd. $ TVL, drei oder mehr unabhängige Audits, seit mindestens 24 Monaten live ohne nicht wiederhergestellten Verlust von Nutzergeldern, und direkte Auszahlung gemäß Abschnitt 5.2
- **Native Gas-Guthaben** in betrieblich notwendigem Umfang

**Nicht zulässig**

- Leverage, Kreditaufnahme, Margin oder jede Position, die liquidiert werden kann
- Perpetual Futures, Optionen oder jedes Derivat
- Market-Making, Liquiditätsbereitstellung oder Vaults, die die Gegenseite von Trader-Positionen einnehmen
- **Synthetische Dollar, deren Deckung eine Derivateposition ist.** Ethenas USDe wurde geprüft und ausgeschlossen: Seine Rendite stammt aus Perpetual-Funding-Rates statt aus Reserven, seine Short-Beine liegen auf zentralisierten Börsen, sein Reservefonds beträgt rund 1 % des Angebots, und seine siebentägige Unstaking-Cooldown-Frist steht im Widerspruch zu Abschnitt 9. Zum Zeitpunkt der Prüfung bot es keine Renditeprämie gegenüber Blue-Chip-Stablecoin-Lending. Es ist ein Basis-Trade, kein Kapitalerhalt-Asset, und es als solches einzustufen, würde das Risiko des Fonds falsch darstellen.
- Jeder Token mit einem 24-Stunden-Handelsvolumen von weniger als 10 Mio. $, außer der bestehenden HPO-Position
- Käufe von HPO zum Halten — Abschnitt 8

### 5.1 Einfrierrisiko und die Untergrenze, die es steuert

Das meiste, was dieser Fonds hält, ist eine Forderung gegenüber einem Unternehmen, und Emittenten von Stablecoins und tokenisierten Assets können eine bestimmte Wallet einfrieren. Das ist kein Grund, solche Assets zu meiden — es gibt keine permissionless Alternative in relevanter Größenordnung für stabile Kaufkraft —, aber es muss bemessen, nicht ignoriert werden.

- **Kein einzelner einfrierbarer Emittent darf 30 % des Fonds übersteigen.**
- **Mindestens 20 % des Fonds werden in Assets gehalten, die kein Emittent, Verwahrer oder keine Behörde einseitig einfrieren kann.** Bitcoin ist derzeit der einzige Bestand, der dieses Kriterium erfüllt.

### 5.2 Direkte Auszahlung

Jede Position muss sich direkt aus dem Smart Contract auszahlen lassen, ohne Erlaubnis eines Betreibers, einer Schnittstelle oder eines Intermediärs. Bevor Kapital in ein neues Protokoll eingesetzt wird, verifizieren die Unterzeichner, dass die Auszahlung über direkte Contract-Interaktion funktioniert, unabhängig vom Front-End des Protokolls.

Ein Protokoll, das die Auszahlung nach Ermessen eines Betreibers sperren, pausieren oder an Bedingungen knüpfen kann, ist nicht zulässig, unabhängig von der Rendite. Für einen Fonds ohne feste Quelle neuen Kapitals ist Kapital, das nicht zurückgeholt werden kann, ein dauerhafter Verlust.

### 5.3 Das Anlageuniversum erweitert sich mit dem Fonds

Die Liste oben ist eng gefasst, weil der Fonds klein ist: Jede zusätzliche Position kostet denselben Aufwand für Einrichtung, Überwachung und Berichterstattung wie eine große, während sie einen zu kleinen Ertrag beisteuert, um ins Gewicht zu fallen. Das ändert sich, wenn der Fonds wächst.

| Fondsgröße, gehalten über zwei aufeinanderfolgende Berichte | Was verfügbar wird                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Unter 250.000 $                                             | Die Liste oben                                                                                 |
| 250.000 $ oder mehr                                         | Die DAO darf **eine** weitere Anlageklasse hinzufügen, begrenzt auf 10 % des Fonds             |
| 500.000 $ oder mehr                                         | Ein opportunistischer Baustein von bis zu 10 % des Fonds, innerhalb der oben genannten Verbote |

Jede Erweiterung erfordert eine DAO-Abstimmung. Das Erreichen einer Schwelle macht eine Ergänzung möglich, nicht automatisch.

---

## 6. Zielallokation

Die HPO-Position liegt außerhalb der Zielallokation. Sie kann weder aufgestockt noch in relevanter Größenordnung gehandelt werden, sodass ihre Einbeziehung jeden anderen Baustein zwingen würde, sich um eine Zahl herum zu rebalancieren, auf die der Fonds nicht einwirken kann.

**Nicht-diskretionäre Position**

|     |                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| HPO | 9.023.524,44, gehalten. Keine Käufe zum Halten. Reduzierungen nur gemäß Abschnitt 8. **Referenzobergrenze 25 % des Fonds.** |

**Diskretionäres Portfolio** — alles Übrige:

| Baustein                       | Ziel | Bandbreite | Zweck                                                                                                                 |
| ------------------------------ | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| Stablecoin-Rendite, investiert | 45 % | 35–55 %    | Kapitalerhalt und die Erträge des Fonds                                                                               |
| **Opportunity Reserve**        | 10 % | 5–15 %     | Nicht eingesetztes Kapital für größere Drawdowns — Abschnitt 6.1                                                      |
| Bitcoin                        | 30 % | 20–35 %    | Langfristiger Wertspeicher; das Asset des Fonds, das nicht eingefroren werden kann und außerhalb des Ökosystems liegt |
| hGRAM                          | 12 % | 8–18 %     | Ausrichtung auf Hipo, plus Staking-Rendite                                                                            |
| Betriebsliquidität und Gas     | 3 %  | 2–6 %      | Transaktionskosten, Puffer                                                                                            |

**Zu hGRAM.** Seine Rendite ist in GRAM denominiert, die Position ist also ein gerichtetes GRAM-Engagement mit angehängter Rendite, kein Ertrags-Asset. Ein Teil des Grundes, es zu halten, ist die Ausrichtung auf das Protokoll, zu dem der Fonds gehört, was ein legitimer Grund ist. Es als Ertrag darzustellen, wäre es nicht.

**Zu Bitcoin.** Es wird keine Rendite unterstellt, und keine sollte unterstellt werden. Die Größe ist so bemessen, dass ein Rückgang um 70 % — den Bitcoin schon erlebt hat — den Fonds rund 16 % seines Werts kostet. Bemessen nach Drawdown-Toleranz, nicht nach Überzeugung.

**Einstieg.** Neue Bitcoin-Positionen werden in gleichen wöchentlichen Tranchen über mindestens acht Wochen aufgebaut. Eine Regel, keine Markteinschätzung.

### 6.1 Die Opportunity Reserve

Der Fonds hält 10 % seines diskretionären Portfolios in Stablecoins, nicht eingesetzt oder in taggleich liquider Rendite, um in schwere Drawdowns hinein zu kaufen. Er wird nur bei einem objektiven Auslöser eingesetzt, in Dritteln, in Assets, die bereits auf der zulässigen Liste stehen:

| Auslöser                                            | Einsatz         |
| --------------------------------------------------- | --------------- |
| Bitcoin 40 % unter seinem gleitenden 12-Monats-Hoch | Ein Drittel     |
| Bitcoin 55 % unter seinem gleitenden 12-Monats-Hoch | Ein Drittel     |
| Bitcoin 70 % unter seinem gleitenden 12-Monats-Hoch | Letztes Drittel |

Das gleitende Hoch verwendet die Reihe der Tagesschlusskurse der veröffentlichten Preisquelle des Fonds. Sobald eingesetzt, wird die Reserve über die folgenden vier Quartale aus dem Stablecoin-Baustein wieder aufgebaut.

**Kein diskretionärer Einsatz.** Ist der Auslöser nicht eingetreten, bleibt das Kapital, wo es ist. Der Sinn eines schriftlich festgelegten Auslösers ist es, die Entscheidung im Voraus zu treffen, wenn es leicht ist, statt unter den Bedingungen, die sie schwer machen.

---

## 7. Konzentrations- und Risikogrenzen

Gemessen am Gesamtwert des Fonds, geprüft bei jedem Quartalsbericht.

| Grenze                                                     | Schwellenwert                                            |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| Ein einzelnes Protokoll                                    | ≤ 30 % des Fonds                                         |
| Ein einzelner Stablecoin-Emittent                          | ≤ 30 % des Fonds                                         |
| Ein einzelner einfrierbarer Emittent, alle Assets zusammen | ≤ 30 % des Fonds                                         |
| Assets, die kein Emittent einfrieren kann                  | **≥ 20 % des Fonds**                                     |
| Eine einzelne Nicht-HPO-Position                           | ≤ 35 % des Fonds                                         |
| HPO                                                        | ≤ 25 % des Fonds (Referenz — Abschnitt 8)                |
| Assets außerhalb der Multisig-Verwahrung                   | **0 %**, außer während des Transfers gemäß Abschnitt 4.1 |
| TON-Ökosystem-Assets (HPO + hGRAM + GRAM)                  | ≤ 45 % des Fonds                                         |
| Leverage                                                   | Null, jederzeit                                          |

Die TON-Grenze ist die wichtigste Zeile in diesem Dokument. Die Einnahmen des Fonds kommen von Hipo, seine Finanzierung kommt von Hipo, und ein Teil seiner Assets sind Hipos eigene Tokens. Eine Treasury, die auf ihr eigenes Ökosystem konzentriert ist, dämpft ein schwieriges Jahr für dieses Ökosystem nicht — sie verstärkt es. Die Grenze hält den Fonds genau dann nützlich, wenn er am dringendsten gebraucht wird.

Wird eine Grenze durch eine Marktbewegung statt durch eine Transaktion überschritten, hat der Fonds ein Quartal Zeit, sie wieder einzuhalten, und der Verstoß wird im Bericht dieses Quartals offengelegt.

---

## 8. HPO-Richtlinie

**Der Fonds kauft kein HPO, um es zu halten.** Die Position des Fonds ist relativ zur Marktliquidität von HPO bereits groß, und sie aufzustocken würde liquides Kapital in einen Bestand verwandeln, aus dem der Fonds nicht annähernd zu seinem ausgewiesenen Wert aussteigen könnte. Die Aufgabe des Fonds ist es, einsetzbare Assets zu vermehren, nicht seinen eigenen Token anzuhäufen.

**HPO zu kaufen, um es zu verbrennen, ist eine andere Handlung und ist zulässig.** Gemäß Abschnitt 2.2 darf der Fonds HPO am Markt kaufen und vernichten, als eine der beiden Formen, Wert an die Inhaber zurückzugeben. Die Tokens verlassen den Umlauf, statt in die Bilanz des Fonds einzugehen, und dies wird ausschließlich aus Gewinnen oberhalb der High-Water-Mark finanziert — nie aus Kapital.

**Die bestehende Position reduzieren.** Das HPO des Fonds wird gehalten. Es ist der Anteil des Fonds an seinem eigenen Protokoll, und es gibt keine Möglichkeit, in relevanter Größenordnung am offenen Markt auszusteigen.

Wird sie jemals reduziert, geschieht das nur durch einen OTC-Verkauf an einen strategischen Käufer oder einen strukturierten Verkauf, der per DAO-Abstimmung genehmigt wird. **Der Fonds verkauft HPO in keiner Größenordnung am offenen Markt.** Beide Wege erfordern alle der folgenden Punkte:

- **Eine DAO-Abstimmung**, die den Verkauf vor der Ausführung genehmigt
- **Die Verwendung der Erlöse im Vorschlag angegeben** — die Inhaber stimmen darüber ab, was mit dem Geld geschieht, nicht nur darüber, ob die Tokens verkauft werden
- **Vollständige Offenlegung nach Abschluss**, einschließlich Größe, Preis und aller mit dem Verkauf verbundenen Bedingungen

Die Inhaber haben das Kapital finanziert, mit dem diese Position gekauft wurde. Die Abstimmung und die Offenlegungspflichten stellen sicher, dass jeder Verkauf zu Bedingungen erfolgt, die sie zuvor gesehen und genehmigt haben.

Die 25-%-Obergrenze in Abschnitt 7 ist ein Referenzwert, kein Zwangsverkauf. Steigt HPO darüber hinaus, berichtet der Fonds den Verstoß, und die DAO entscheidet, ob gehandelt wird.

---

## 9. Liquidität

- Mindestens **35 % des Fonds** innerhalb von **7 Tagen** ohne wesentlichen Verlust in Stablecoins umwandelbar
- Höchstens **10 % des Fonds** in Positionen mit einer Lockup-Frist von mehr als 7 Tagen
- Keine Position, aus der der Fonds nicht innerhalb von **30 Tagen** aussteigen könnte, außer HPO, das in jedem Bericht als illiquide offengelegt wird

---

## 10. Rebalancing

- **Vierteljährlich überprüft**, zusammen mit dem Bericht
- Rebalanciert, wenn sich ein Baustein außerhalb seiner Bandbreite bewegt, nicht nach Kalender — Transaktionskosten sind bei einem Fonds dieser Größe real
- Zurück auf den Zielmittelpunkt rebalanciert, ausgeführt über einen Zeitraum, wo die Größe es rechtfertigt
- Jeder Rebalancing-Trade über 10.000 $ wird innerhalb von 7 Tagen angekündigt

**Rebalancing ist, wie dieser Fonds niedrig kauft und hoch verkauft.** Fällt Bitcoin unter seine Bandbreite, verlangt die Regel den Kauf. Steigt es darüber, verlangt die Regel eine Reduzierung. Die Entscheidung wird im Voraus getroffen und mechanisch ausgeführt.

**Der Fonds versucht nicht, Markthochs oder -tiefs zu bestimmen.** Keine Position wird aufgrund einer Prognose oder von Sentiment eröffnet, geschlossen oder in der Größe verändert. Auf eine Markteinschätzung zu setzen, erfordert, zweimal richtig zu liegen — beim Ausstieg und beim Wiedereinstieg —, mit einem Signaturprozess mit 2 von 3 Unterzeichnern, der sich nicht in dieser Geschwindigkeit bewegen kann. Die Bandbreiten und die Opportunity Reserve fangen dieselbe Absicht durch Regeln ein, die sich tatsächlich ausführen lassen.

---

## 11. Berichterstattung

- Ein **vollständiger Bericht jedes Quartal**, erzeugt aus einem einzigen On-Chain-Block von
  [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
  mit Angabe des Blocks, der Wechselkurse und jedes verwendeten Preises, sodass jeder Leser ihn reproduzieren kann
- Jeder Bericht enthält: die Allokation gegenüber den Zielen aus Abschnitt 6, jede Grenze aus Abschnitt 7 mit ihrem
  aktuellen Wert, **die Wertentwicklung seit Auflegung nach Modified Dietz**, einen Benchmark, den Wert des Fonds als
  Anteil an der Marktkapitalisierung von HPO und jede Transaktion über 10.000 $
- Zuflüsse werden mit dem Block und dem Preis zum Zeitpunkt des Eingangs erfasst
- Grenzverstöße werden offengelegt, unabhängig davon, ob sie behoben wurden
- Berichte werden termingerecht veröffentlicht, unabhängig davon, was die Zahlen zeigen

**Bewertung.** GRAM und Bitcoin zum Marktpreis aus einem veröffentlichten Aggregator. hGRAM zum Rücknahmekurs des
Protokolls — dem Betrag, den der Fonds durch Unstaken erhalten würde. HPO bei CoinGecko, abgeglichen mit der
veröffentlichten Marktkapitalisierung von Hipo; DEX-Kurse aus dünnen Pools sind ausgeschlossen. Stablecoins per
Konvention zu 1,0000.

---

## 12. Überprüfung und Änderung

- **Jährlich überprüft**, oder früher bei einer wesentlichen Änderung — einem großen Zufluss, einer neuen
  Einnahmequelle oder einem Grenzverstoß, der nicht innerhalb eines Quartals behoben werden kann
- Änderungen erfordern eine **DAO-Abstimmung**
- Jede Version wird veröffentlicht; überholte Versionen bleiben mit ihrem Datum online

---

## 13. Bekannte offene Punkte

- **Der Fonds hat keine feste Quelle neuen Kapitals.** hGRAM-Staking-Rewards sind derzeit seine einzige aktive
  Einnahmequelle. OTC-Geschäfte und wiederhergestellte Protokolleinnahmen sind beide möglich; diese Richtlinie setzt
  keines von beiden voraus.
- **Der Wert der HPO-Position ist eine Bewertungsmarke, kein Preis.** Jeder Bericht sagt das, und das wird auch
  weiterhin so sein.
- **Das HPO des Fonds erwirtschaftet keine Erträge**, solange die Staking-Gebühr des Protokolls 0 % beträgt. Eine
  Gebühr wieder einzuführen, ist eine gesonderte Entscheidung, aber beide hängen zusammen: Sie würde dem größten
  Bestand des Fonds eine Rendite verschaffen und gleichzeitig die Rendite auf sein hGRAM verringern.

---

## 14. Managervergütung

**Niemand wird für die Verwaltung des Hipo Fund bezahlt. Es gibt keine Verwaltungsgebühr und keine Performancegebühr.**

Dies wird veröffentlicht statt unausgesprochen gelassen, weil das Fehlen einer Gebühr selbst eine Richtlinie ist, und die Bedingungen für ein erneutes Aufgreifen der Frage im Voraus festzulegen, verhindert, dass später ein unstrukturierter Vorschlag auftaucht.

Norges Bank Investment Management, das den Staatsfonds verwaltet, dem der Hipo Fund nachempfunden ist, erhält ein Kostenbudget, das bis zu einer vom Finanzministerium festgelegten jährlichen Obergrenze erstattet wird — keinen Anteil an den Gewinnen. Seine Verwaltungskosten lagen 2024 bei **0,034 % der Assets**. Erfolgsabhängige Gebühren gelten dort für externe Manager, nicht für den Manager des Fonds selbst.

Zwei weitere Gründe sprechen hier dagegen. Eine Performancegebühr gibt dem Manager die Chance auf Gewinn ohne das Risiko des Verlusts, was der falsche Anreiz für einen kleinen Fonds mit einem Kapitalerhalt-Mandat ist. Und die Interessenübereinstimmung besteht bereits in besserer Form: Die Unterzeichner halten HPO, sodass sich die Deckung von HPO stärkt, wenn der Fonds wächst — ein Engagement im gesamten Ergebnis, einschließlich des Abwärtsrisikos.

**Wird die Frage erneut aufgegriffen**, erfordert das eine DAO-Abstimmung, und ein Vorschlag darf erst gemacht werden, wenn der Fonds über 500.000 $ liegt, über seiner High-Water-Mark liegt, und beides über zwei aufeinanderfolgende Quartalsberichte hinweg gehalten hat. Jeder Vorschlag muss enthalten: ausschließlich eine Performancegebühr und keine Verwaltungsgebühr; eine feste High-Water-Mark; eine Hurdle Rate oberhalb eines Stablecoin-Rendite-Benchmarks; Zahlung in HPO mit einer Sperrfrist von mindestens 12 Monaten; und eine jährliche Obergrenze als Prozentsatz der Assets.

**Erfordert die Verwaltung des Fonds jemals bezahlte Zeit**, wird sie aus dem operativen Budget von Hipo bezahlt, als definierte Rolle mit fixen Kosten — nicht aus dem Fonds und nicht als Anteil an den Erträgen. Das hält die Vergütung von den Anlageergebnissen getrennt, was ein Kapitalerhalt-Mandat erfordert.
