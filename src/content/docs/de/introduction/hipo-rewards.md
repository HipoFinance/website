---
title: 'Hipo Rewards'
---

Unser Ziel ist es, Hipo als ein wirklich von der Community getragenes Protokoll aufzubauen, in dem Wert und Entscheidungen zur Community wandern.

Wenn Sie GRAM mit Hipo staken, werden Sie über drei getrennte Ströme in drei verschiedenen Takten bezahlt:

- **Basis-Rewards**\
  Staking-Rewards auf GRAM, die sich im Wechselkurs von hGRAM gegenüber GRAM abbilden — verrechnet **in jeder Validierungsrunde** (~18 h), ohne dass Sie etwas beanspruchen müssen
- **Zusätzliche Rewards**\
  Extra HPO auf den GRAM-Wert Ihres Stakes, zu einem Koeffizienten, den Ihr [Hipo Club](https://t.me/HipoFinanceBot/join)-Level bestimmt — fällt **in jeder Validierungsrunde** an und ist auszahlbar, sobald Ihr Guthaben 1.000 HPO übersteigt
- **Weitere Rewards**\
  HPO halten → einen Anteil an den Einnahmen des Protokolls erhalten — ausgezahlt **am Ende jeder Hipo-Club-Season**

Alle drei lassen sich in der [Hipo-App](/rewards/) und im [Hipo Club](https://t.me/HipoFinanceBot/join) verfolgen.

## Basis-Rewards: der Wechselkurs

Sie staken GRAM und erhalten hGRAM. Es gibt keine Sperrfrist und nichts zu beanspruchen: Validierungs-Rewards sammeln sich im Protokoll an, sodass jedes hGRAM mit der Zeit mehr GRAM wert wird. Ihr hGRAM-Guthaben ändert sich nie — sein Wert schon.

Das ist der Hauptstrom, und auf ihn bezieht sich der APY auf der [Stats-Seite](/stats/). Da Hipo keinen Anteil an Ihrem Stake nimmt und die [Governance-Gebühr](/docs/fees-and-gas/) derzeit 0 % beträgt, fließt der gesamte Validierungs-Reward in den Wechselkurs.

## Zusätzliche Rewards: HPO aus dem Hipo Club

Zusätzlich zum Wechselkurs zahlt Ihnen der [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) HPO dafür, dass Sie hGRAM halten. Dieser Strom läuft getrennt, er wird in HPO statt in GRAM ausgezahlt, und Sie lassen ihn sich im Club auszahlen.

### Die Formel

In jeder Validierungsrunde verdient jedes Mitglied:

```
HPO reward = GRAM value of your stake × HPOrewardRate × LevelRate
```

- **HPOrewardRate** liegt derzeit bei **0,0021902**. Der Wert wird von der Governance festgelegt und kann sich ändern.
- **LevelRate** ist der Koeffizient, der zu Ihrem Hipo-Club-Level gehört.

Eine Validierungsrunde dauert 65.536 Sekunden — etwa 18,2 Stunden —, es gibt also rund **481 Runden pro Jahr**. Beim aktuellen Satz verdient jedes GRAM in Ihrem Stake auf Level 1 etwa **1,05 HPO pro Jahr**.

Grundlage ist, was Ihr Stake **gerade jetzt in GRAM wert ist** — Ihr hGRAM-Guthaben zum aktuellen Wechselkurs — und nicht der Betrag, den Sie ursprünglich eingezahlt haben. Da die Basis-Rewards diesen Wert in jeder Runde nach oben treiben, wachsen Ihre HPO-Rewards mit: Die beiden Ströme verstärken einander.

### Level-Koeffizienten

Der Koeffizient ist nicht die Levelnummer — er beginnt bei 1× und beschleunigt sich, je weiter Sie aufsteigen:

| Level | 1    | 2    | 3    | 4    | 5   | 6   | 7    | 8    | 9    | 10  |
| ----- | ---- | ---- | ---- | ---- | --- | --- | ---- | ---- | ---- | --- |
| Rate  | 1,0× | 1,2× | 1,6× | 2,2× | 3×  | 4×  | 5,2× | 6,6× | 8,2× | 10× |

Jedes Level ist mehr wert als das davor: Der Schritt von Level 1 auf Level 2 bringt 0,2× zusätzlich, der Schritt von Level 9 auf Level 10 dagegen 1,8× — das Neunfache. Der Lohn für den Aufstieg kommt spät.

### Was dabei herauskommt

Jährliche HPO-Rewards beim aktuellen Satz:

| Stake (GRAM) | Level 1 (1×) | Level 5 (3×) | Level 10 (10×) |
| ------------ | ------------ | ------------ | -------------- |
| 1.000        | ~1.055 HPO   | ~3.164 HPO   | ~10.546 HPO    |
| 5.000        | ~5.273 HPO   | ~15.819 HPO  | ~52.732 HPO    |
| 10.000       | ~10.546 HPO  | ~31.639 HPO  | ~105.463 HPO   |
| 50.000       | ~52.732 HPO  | ~158.195 HPO | ~527.316 HPO   |

### Was das wert ist

HPO-Rewards werden in einem Token ausgezahlt, der einen Marktpreis hat, und dieser Preis bewegt sich. Bewertet zum HPO-Marktpreis vom 29. August 2026 erhöht der Boost Ihre effektive Jahresrendite auf Level 1 um rund **0,18 Prozentpunkte** und auf Level 10 um rund **1,8 Prozentpunkte**.

Ein Staker auf Level 10 verdient also ungefähr den GRAM-Staking-APY von der [Stats-Seite](/stats/) **plus etwa 1,8 %** in HPO.

:::note
Wir formulieren das bewusst so. Eine große HPO-Zahl allein sagt Ihnen nicht, was Sie verdienen, und der HPO-Markt ist klein — der Token wird dünn gehandelt, deshalb ist der Wert einer großen HPO-Position nicht derselbe wie der einer kleinen. Uns ist lieber, Sie wissen das, als dass es Sie überrascht.
:::

### Level

Ihr Level vervielfacht alles Vorherige: Auf Level 10 verdient derselbe Stake das Zehnfache dessen, was er auf Level 1 verdient. Zusätzlich erhalten Sie 1 % der HPO-Rewards, die von den Personen erwirtschaftet werden, die Sie einladen.

Es gibt zwei Wege, aufzusteigen:

- **Saisonales Upgrade** — Beanspruchen Sie Ihre verdienten Rewards mindestens einmal während der Season; Ihr Level steigt dann am Ende automatisch.
- **Sofort-Upgrade** — Zahlen Sie die Stufenaufstiegs-Gebühr, und Ihr Level steigt sofort.

Zwei Regeln sind wichtig:

- **Der Verkauf von erhaltenem HPO setzt Sie auf Level 1 zurück.** Der Club ist darauf ausgelegt, Menschen zu belohnen, die halten, und das ist der Mechanismus dafür. Erhaltenes HPO an eine Börse zu senden oder an eine Wallet, die Sie nicht mit dem Club verbunden haben, gilt als Verkauf; das Verschieben zwischen Ihren eigenen verbundenen Wallets dagegen nicht — siehe [Mehrere Wallets verwenden](/docs/wallets-and-rewards/).
- **Es gibt kein Claim-Fenster.** Rewards fallen in jeder Runde an und können ausgezahlt werden, sobald Ihr Guthaben mindestens **1.000 HPO** beträgt.

## Weitere Rewards: Gewinnbeteiligung

HPO ist der Governance-Token von Hipo. Wer ihn hält, hat eine Stimme in der [DAO](/docs/dao/) und einen Anteil an den Einnahmen des Protokolls, der am Ende jeder Hipo-Club-Season ausgeschüttet wird — siehe [Gewinnbeteiligung](/docs/profit-sharing/).

:::note
Solange die [Governance-Gebühr](/docs/fees-and-gas/) bei **0 %** liegt, nimmt das Protokoll keine Einnahmen ein, sodass es in diesem Strom nichts zu verteilen gibt. Die Gewinnbeteiligung setzt wieder ein, sobald die Gebühr das tut. Die Gebühr von 0 % ist auch der Grund, warum die Basis-Rewards so hoch sind.
:::

Je mehr Sie sich beteiligen, desto mehr verdienen Sie — und desto größer ist Ihre Rolle bei der Gestaltung der Zukunft von Hipo.

---

_Die HPOrewardRate, die Level-Schwellen, der hGRAM-Wechselkurs und der HPO-Marktpreis ändern sich alle. Die Zahlen auf dieser Seite entsprechen dem Stand der letzten Überprüfung und sind keine Garantie für künftige Rewards. Aktuelle Protokollzahlen finden Sie immer auf der [Stats-Seite](/stats/)._
