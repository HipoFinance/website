---
title: 'Staken ohne die App'
description: 'Staken und Unstaken mit Hipo per einfacher Wallet-Überweisung — für Multisig-, Cold- und andere Wallets, die keine Dapp-Transaktionen signieren können.'
---

## Wann Sie das brauchen

Diese Seite richtet sich an Wallets, die keine Dapp-Transaktionen signieren können — Multisig-Wallets und manche Cold Wallets. Alle anderen sollten die [Hipo-App](/stake/) verwenden, die günstiger ist und die genaue Schätzung anzeigt, bevor Sie bestätigen. Wenn eine Multisig-Wallet mit der Hipo-App verbunden ist, übergibt ein Klick auf Staken oder Unstaken die Order direkt an Ihre Wallet-App; diese Anleitung ist die Ersatzlösung für den Fall, dass das nicht funktioniert.

## Staken — der Kommentar „d“

Senden Sie das GRAM, das Sie staken möchten, **zuzüglich 0,1 GRAM** als Gas-Vorauszahlung an die Hipo-Treasury:

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

Setzen Sie den Textkommentar der Transaktion genau auf:

```
d
```

Der Kommentar muss klein geschrieben, reiner Text und unverschlüsselt sein. Die Vorauszahlung ist großzügig aufgerundet — nur ein Bruchteil wird verbraucht, und der ungenutzte Teil wird erstattet (siehe [Gebühren & Gas](/docs/fees-and-gas/)). Das hGRAM wird an dieselbe Adresse zurückgesendet, von der die Überweisung stammte.

## Alles unstaken — der Kommentar „w“

Senden Sie 0,1 GRAM an dieselbe Treasury-Adresse mit dem Textkommentar:

```
w
```

Dies unstaked das **gesamte** hGRAM-Guthaben dieser Wallet. Um nur einen Teil davon zu unstaken, verwenden Sie stattdessen eine Roh-Order — siehe den nächsten Abschnitt. Der Unstake wird nach den normalen Protokollregeln abgewickelt, es gilt also das Timing des Vollständig-Unstakes — siehe [Wie Unstaking funktioniert](/docs/introduction/how-does-hipo-work/unstaking/) und [Wie lange dauert das Unstaking?](/faq/#how-long-does-unstaking-take)

## Einen Teil unstaken — eine Roh-Order

Ein Textkommentar kann nur nach allem fragen, weil er keinen Platz für einen Betrag hat. Ein teilweiser Unstake ist eine gewöhnliche Nachricht mit binärem Inhalt, daher braucht es eine Wallet oder Multisig, die eine solche senden kann — multisig.ton.org nennt das einen „Arbitrary order“, und dessen Formular verlangt genau die drei Werte unten.

Öffnen Sie die [Hipo-App](/unstake/) mit verbundener Multisig, geben Sie den Betrag ein, den Sie unstaken möchten, und drücken Sie Unstake. Die App übergibt die Order an Ihre Wallet-App, die daraus einen Multisig-Request für die anderen Unterzeichner erstellt. **Prüfen Sie vor dem Signieren, dass Ihre Multisig die ausgewählte Wallet ist** — der Link kann sie nicht für Sie auswählen. Öffnet sich keine Wallet-App, zeigt die App stattdessen die drei Werte an, sodass Sie die Order von Hand erstellen können:

- **Destination Address** (Zieladresse) — Ihr eigener hGRAM-Wallet-Contract. Das ist nicht die Treasury: Es ist der Contract, der Ihr hGRAM hält, abgeleitet von Ihrer Multisig-Adresse. Prüfen Sie ihn auf Tonviewer, bevor Sie signieren; die App verlinkt dorthin.
- **TON Amount** (TON-Betrag) — 0,1 GRAM, dieselbe Gas-Vorauszahlung wie überall sonst, erstattet abzüglich des verbrauchten Anteils.
- **Order BOC** — der Nachrichteninhalt, in Base64.

Zwei Dinge, die Sie wissen sollten. Nur der eigene hGRAM-Wallet-Contract dieser Multisig akzeptiert diese Order — wird sie versehentlich von einer anderen Wallet signiert, wird sie einfach zurückgewiesen, und nichts wird verbrannt — anders als beim Kommentar „w“, der jedes Guthaben unstaken würde, das die sendende Wallet gerade hält. Und wenn Sie den Sofort-Kurs gewählt haben: Wie viel sofort eingelöst werden kann, ändert sich mit jeder Runde — signieren Sie zeitnah, oder wählen Sie den besten Kurs für eine Order, die auf weitere Signaturen warten muss.

## hGRAM über den Minter verbrennen

Sie können GRAM auch direkt einlösen, indem Sie hGRAM bei [minter.ton.org](https://minter.ton.org/) verbrennen, unter Verwendung der hGRAM-Master-Adresse (Parent):

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

Nach dem Verbrennen erhalten Sie GRAM zum aktuellen Rücktauschkurs. Die Parent-Adresse kann sich bei Protokoll-Upgrades ändern — prüfen Sie zuerst [Contracts & Audits](/docs/contracts-and-audits/).

## Oder auf einem DEX swappen

hGRAM-Pools gibt es auf DeDust, STON.fi, TONCO, GroypFi und swap.coffee — die aktuelle Liste finden Sie auf der [DeFi-Seite](/defi/). Es fallen Swap-Gebühren und Preiseinfluss an.

## Bevor Sie senden

- Überprüfen Sie die Treasury-Adresse anhand von [Contracts & Audits](/docs/contracts-and-audits/) — vertrauen Sie niemals einer Adresse aus einer weitergeleiteten Nachricht; siehe [Phishing Awareness](/docs/security/phishing-awareness-and-prevention/).
- Der Kommentar muss reiner Text sein, genau `d` oder `w`.
- Eine Überweisung ohne Kommentar oder mit dem falschen Kommentar ist keine Stake- oder Unstake-Anfrage.
- Prüfen Sie bei einer Roh-Order, dass die Zieladresse Ihr eigener hGRAM-Wallet-Contract ist und keine Adresse von woanders.

## Mehr in den FAQ

- [Kann ich mit einer Multisig- oder Cold Wallet staken?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Gebühren & Gas](/docs/fees-and-gas/)
