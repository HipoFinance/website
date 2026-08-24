---
title: 'Staken ohne die App'
description: 'Staken und Unstaken mit Hipo per einfacher Wallet-Überweisung — für Multisig-, Cold- und andere Wallets, die keine Dapp-Transaktionen signieren können.'
---

## Wann Sie das brauchen

Diese Seite richtet sich an Wallets, die keine Dapp-Transaktionen signieren können — Multisig-Wallets und manche Cold Wallets. Alle anderen sollten die [Hipo-App](/stake/) verwenden, die günstiger ist und die genaue Schätzung anzeigt, bevor Sie bestätigen. Wenn eine Multisig-Wallet mit der Hipo-App verbunden wird, zeigt die App dieselben Anweisungen mit der zum Kopieren bereiten Treasury-Adresse.

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

Dies unstaked das **gesamte** hGRAM-Guthaben dieser Wallet — ein Teilbetrag ist nicht möglich. Der Unstake wird nach den normalen Protokollregeln abgewickelt, es gilt also das Timing des Vollständig-Unstakes — siehe [Wie Unstaking funktioniert](/docs/introduction/how-does-hipo-work/unstaking/) und [Wie lange dauert das Unstaking?](/faq/#how-long-does-unstaking-take)

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

## Mehr in den FAQ

- [Kann ich mit einer Multisig- oder Cold Wallet staken?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Gebühren & Gas](/docs/fees-and-gas/)
