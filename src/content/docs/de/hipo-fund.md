---
title: 'Hipo Fund — On-Chain-Treasury'
description: 'Der Hipo Fund — eine On-Chain-Treasury, die den HPO-Token deckt.'
---

<figure><img src="/docs/images/hipo-fund-1.jpg" alt="Werbebanner mit der Aufschrift „HipoFund.ton“, einem Geldsack, umgeben von Bitcoin-, Tether-, HPO- und TON-Symbolen und einem nach oben zeigenden Wachstumschart."></figure>

## 📌 Was der Hipo Fund ist

Der Hipo Fund ist die langfristige Investment-Treasury von Hipo. Er hält die Erlöse aus dem Verkauf von
HPO-Token und aus den Season-Claims von Hipo Club und wird getrennt vom operativen Budget von Hipo geführt.

Die Idee ist vom norwegischen Ölfonds übernommen: Einnahmen nicht ausgeben, sobald sie eintreffen, sondern
einen Teil zurücklegen und langfristig verwalten. Der Hipo Fund ist dazu da, dauerhaften Wert hinter HPO
aufzubauen, nicht um laufende Kosten zu decken.

Jedes Asset, das er hält, liegt on-chain und lässt sich von jedem überprüfen.

---

## 📊 Aktueller Stand

| Kennzahl                                       | Wert                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| **Anfangskapital (18. April 2025)**            | 186.963,96 $                                                                |
| **Seither eingebrachtes Kapital**              | ≈ 37.092 $ (Claims aus Saison 2 und Saison 3)                               |
| **Zuletzt berichteter Wert (24. August 2026)** | 98.776,51 $                                                                 |
| **Rendite seit Auflegung (Modified Dietz)**    | −58,4 %                                                                     |
| **GRAM im selben Zeitraum**                    | −49,8 %                                                                     |
| **Aktueller Bericht**                          | [Bericht vom August 2026](/docs/hipo-fund/quarterly-report-august-24-2026/) |

Der Fonds liegt unter seinem Anfangskapital. Der Hauptgrund ist der Rückgang des GRAM-Preises in einem
Portfolio, das im ersten Jahr stark an GRAM gebunden war. Die vollständige Rechnung steht im Bericht vom
August 2026.

Wir veröffentlichen im **September 2026 ein Investment Policy Statement (Anlagerichtlinie)**, das
Zielallokationen, Risikogrenzen, Liquiditätsanforderungen und Rebalancing-Regeln festlegt. Es geht zur Prüfung
an die Community und danach in eine verbindliche DAO-Abstimmung. Es ist der Rahmen, nach dem der Hipo Fund von
da an verwaltet wird.

Die genauen Termine werden im [Telegram-Kanal von Hipo](https://t.me/HipoFinance) und auf
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv) bekannt gegeben.

---

## 🏦 Wallets

Der Hipo Fund hält Assets in zwei Wallets. Beide fließen in jeden Bericht ein.

**Haupt-Wallet — Multisig**\
`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr`
([hipofund.ton](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr))

- Bewegungen von Mitteln erfordern **2 von 3 Signaturen**
- Unterzeichner: zwei Mitgründer von Hipo und ein Teammitglied
- Hält den überwiegenden Teil des Fonds

**Zweit-Wallet — Einzelsignatur**\
`UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG`
([ansehen](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG))

- Die ursprüngliche Wallet des Fonds; sie ist nach der Umstellung auf Multisig in Gebrauch geblieben und hält
  weiterhin einen Teil des Fonds
- Außerdem Proposer in der Multisig
- Einige Hipo-Systeme, darunter Hipo Club, unterstützen keine Multisig-Wallets. Deshalb wird diese Wallet aus
  Gründen der Teilnahmeberechtigung weitergeführt. Das Investment Policy Statement legt eine Obergrenze dafür
  fest, wie viel hier gehalten wird

:::note[Eine Anmerkung zu Adressformaten]
TON zeigt dieselbe Wallet in zwei Formen — bounceable (`EQ…`) und non-bounceable (`UQ…`). Die letzten vier
Zeichen unterscheiden sich, das Konto ist identisch. Für die Multisig sehen Sie möglicherweise
`UQDa2GcC…_GQu` und `EQDa2GcC…_Dnr`; es ist dieselbe Wallet.
:::

---

## 💵 Wie der Hipo Fund finanziert wird

Der Hipo Fund hat nie eine Zuteilung aus der HPO-Tokenomics erhalten. Sein Kapital stammt aus:

- **Erlösen aus dem Verkauf von HPO-Token**, einschließlich des ILO und von OTC-Geschäften mit strategischen
  Investoren
- **Season-Claims von Hipo Club** (Saison 2 und Saison 3). Seit Saison 4 fallen HPO-Rewards direkt bei den
  hGRAM-Inhabern an, es gibt also kein saisonales Claim-Fenster und keine weiteren Claims dieser Art
- **hGRAM-Staking-Rewards** — derzeit die einzige aktive Einnahmequelle des Fonds
- **Gewinnbeteiligung auf die vom Fonds gehaltenen HPO**, sofern die Gewinnbeteiligung des Protokolls aktiv
  ist. Die Staking-Gebühr liegt seit dem 6. Juni 2026 bei 0 %, daher werden derzeit keine Ausschüttungen
  vorgenommen

Alle vom Fonds gehaltenen HPO wurden am offenen Markt gekauft.

---

## 💰 Eröffnungsbericht — 18. April 2025

- **Anfangskapital:** 186.963,96 $
- **Beginn der Berichterstattung:** 18. April 2025

### 🔸 Anfängliche Portfolioaufteilung

| Asset              | Menge        | Anteil    | Wert (USD)       | Anmerkungen                              |
| ------------------ | ------------ | --------- | ---------------- | ---------------------------------------- |
| hGRAM              | 34.955,22    | 59,59 %   | 111.405,91 $     | Gestaktes GRAM                           |
| HPO                | 6.754.307,59 | 38,64 %   | 72.238,04 $      | Governance- und Gewinnbeteiligungs-Token |
| Stablecoins (USDT) | 3.304,14     | 1,77 %    | 3.304,14 $       | Kapitalerhalt und Reserve                |
| GRAM               | 5,30         | 0,01 %    | 15,87 $          | Direktes GRAM-Engagement                 |
| **Gesamt**         |              | **100 %** | **186.963,96 $** |                                          |

_Die Prozentsätze sind auf zwei Nachkommastellen gerundet und ergeben in der Summe möglicherweise nicht genau 100._

:::note[Korrektur, 29. August 2026]
Die HPO-Bewertung in dieser Tabelle wurde zuvor mit 15.000 $ veröffentlicht — das war ein Fehler: Die vier
Zeilen ergaben in der Summe nicht das angegebene Anfangskapital. HPO steht jetzt mit 72.238,04 $ in der
Tabelle, dem Marktwert am 18. April 2025 (0,010695 $ pro HPO), und alle vier Anteile wurden aus den USD-Werten
neu berechnet, sodass die Tabelle auf 186.963,96 $ aufgeht. Zuvor veröffentlicht waren 59,28 % (hGRAM),
1,76 % (USDT), 38,95 % (HPO) und 0,01 % (GRAM). Die Vergleichstabelle im
[Bericht vom August 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) wurde entsprechend korrigiert. An
den Guthaben hat sich nichts geändert.
:::

---

## 🔒 Wie der Fonds verwaltet wird

**Vollständig on-chain und überprüfbar**\
Jedes Asset wird in den beiden oben genannten Wallets gehalten und lässt sich jederzeit von jedem überprüfen.
Der Fonds hält nur Assets, die sich transparent on-chain beobachten lassen.

**Berichte auf Basis von Momentaufnahmen**\
Berichte ab August 2026 werden von
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs)
erzeugt. Das Skript liest jedes Guthaben aus einem einzigen TON-Masterchain-Block und nennt diesen Block, den
hGRAM-Wechselkurs und jeden Preis, der in den Anmerkungen des Berichts verwendet wird. Jeder Leser kann das
Skript erneut ausführen und die Tabellen reproduzieren.

Die Berichte vom [August 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) und
[Dezember 2025](/docs/hipo-fund/quarterly-report-december-18-2025/) stammen aus der Zeit vor dem Skript und
wurden von Hand zusammengestellt. Ihre Guthaben wurden seither gegen die Chain geprüft und stimmen überein;
ihre Bewertungen folgten anderen Preiskonventionen, worauf der Bericht vom August 2026 hinweist.

**Regelmäßige Berichte**\
Der Hipo Fund veröffentlicht jedes Quartal einen Bericht. Jeder Bericht enthält die Wertentwicklung seit
Auflegung und einen Benchmark. Der nächste Bericht ist für **Dezember 2026** vorgesehen.

**Angekündigte Entscheidungen**\
Wesentliche Änderungen am Portfolio werden in den offiziellen Kanälen von Hipo angekündigt, und Änderungen an
der Strategie des Fonds gehen in eine DAO-Abstimmung.

**Wachstum mit kontrolliertem Risiko**\
Der Fonds wird auf langfristigen Kapitalerhalt und nachhaltiges Wachstum hin verwaltet. Zielallokationen,
Konzentrationsgrenzen, Liquiditätsanforderungen und Rebalancing-Regeln legt das Investment Policy Statement
fest.

**Governance**\
Die HPO-Inhaber stimmen über die [Hipo DAO](/docs/dao/) auf
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv) über die Ausrichtung des Hipo
Fund ab. Das Investment Policy Statement ist die erste Richtlinie des Hipo Fund, die in eine verbindliche
Abstimmung geht. Die Umsetzung innerhalb einer beschlossenen Richtlinie übernehmen die Unterzeichner der
Multisig; Änderungen an der Richtlinie gehen an die DAO.

---

## ⚠️ Risiken

Der Hipo Fund ist eine Krypto-Treasury, und sein Wert bewegt sich mit dem Markt. Die wichtigsten Risiken:

- **Marktrisiko.** Die Bestände des Fonds außerhalb der Stablecoins sind den Preisen von GRAM und HPO
  ausgesetzt.
- **Konzentrationsrisiko.** Die Assets des Fonds sind auf das TON-Ökosystem und auf den eigenen Token von
  Hipo konzentriert.
- **Liquiditätsrisiko.** Die HPO-Position ist im Verhältnis zur Liquidität von HPO am Markt groß. Ihr
  ausgewiesener Wert ist der Marktpreis mal das Guthaben; das ist keine Aussage darüber, dass sich die
  gesamte Position zu diesem Preis verkaufen ließe.
- **Verwahrrisiko.** Ein Teil des Fonds liegt in einer Einzelsignatur-Wallet.
- **Smart-Contract-Risiko.** In DeFi-Protokollen gehaltene Assets, hGRAM eingeschlossen, tragen das Risiko
  eines Ausfalls des Contracts.

Diese Risiken werden gesteuert, nicht beseitigt. Das Investment Policy Statement setzt für jedes von ihnen
Grenzen.

---

## 💜 Für die Hipo Community

Der Hipo Fund gehört der Community. Sein Wachstum stützt den Wert und die Tragfähigkeit von HPO und kommt
allen HPO-Inhabern zugute. Wir setzen auf regelmäßige, transparente Berichterstattung und offene Governance.

Sie möchten Strategien, DeFi-Tools oder TON-Projekte für den Fonds vorschlagen? Beteiligen Sie sich an der
Diskussion in [@hipo_chat auf Telegram](https://t.me/hipo_chat).
