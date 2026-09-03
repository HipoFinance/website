---
order: 5
section: 'staking'
question: 'Posso fare staking con un wallet multisig o cold wallet?'
---

Sì. I wallet che non possono firmare transazioni dapp, come i wallet multisig, fanno staking con un semplice trasferimento: invia il GRAM che vuoi mettere in staking, più 0,1 GRAM come anticipo per la commissione, alla tesoreria di Hipo con il commento di testo «d». L’anticipo è arrotondato per eccesso con margine — la parte non utilizzata viene rimborsata, e l’hGRAM viene inviato allo stesso indirizzo.

Per ritirare tutto dallo staking, invia 0,1 GRAM alla tesoreria con il commento di testo «w». Per ritirarne solo una parte, connetti il multisig all’app Hipo, digita l’importo e premi Unstake: l’app crea un ordine raw — un indirizzo di destinazione, un importo TON e un corpo in base64 — che copi nel tuo multisig, ed è quello che multisig.ton.org chiama «Arbitrary order». La procedura completa, incluso l’indirizzo della tesoreria, è in [Fare staking senza l’app](/docs/staking-without-the-app/).
