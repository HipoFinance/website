---
order: 5
section: 'staking'
question: 'Kann ich mit einer Multisig- oder Cold-Wallet staken?'
---

Ja. Wallets, die keine dApp-Transaktionen signieren können, etwa Multisig-Wallets, staken mit einer einfachen Überweisung: Senden Sie das GRAM, das Sie staken möchten, plus 0,1 GRAM als Gebührenvorauszahlung, mit dem Textkommentar „d“ an die Hipo-Treasury. Die Vorauszahlung ist großzügig aufgerundet — der ungenutzte Teil wird erstattet, und hGRAM wird an dieselbe Adresse zurückgesendet.

Um alles zu unstaken, senden Sie 0,1 GRAM mit dem Textkommentar „w“ an die Treasury. Um nur einen Teil Ihres Guthabens zu unstaken, verbinden Sie die Multisig mit der Hipo-App, geben Sie den Betrag ein und drücken Sie Unstake: Die App erstellt eine Roh-Order — eine Zieladresse, einen TON-Betrag und einen Base64-Inhalt —, die Sie in Ihre Multisig kopieren; multisig.ton.org nennt das einen „Arbitrary order“. Das vollständige Verfahren, einschließlich der Treasury-Adresse, steht in [Staking ohne die App](/docs/staking-without-the-app/).
