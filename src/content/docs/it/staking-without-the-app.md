---
title: "Fare staking senza l'app"
description: 'Fai staking e unstaking con Hipo usando semplici trasferimenti dal wallet — per wallet multisig, cold e altri che non possono firmare transazioni dapp.'
---

## Quando serve

Questa pagina è pensata per i wallet che non possono firmare transazioni dapp: i wallet multisig e alcuni cold wallet. Per tutti gli altri è meglio usare l'[app Hipo](/stake/), che costa meno e mostra la stima esatta prima della conferma. Quando un wallet multisig si connette all'app Hipo, l'app mostra queste stesse istruzioni con gli indirizzi e i valori pronti da copiare.

## Staking — il commento «d»

Invia i GRAM che vuoi mettere in staking **più 0,1 GRAM** come anticipo per il gas alla tesoreria di Hipo:

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

Imposta il commento testuale della transazione esattamente così:

```
d
```

Il commento deve essere in minuscolo, in testo semplice e non cifrato. L'anticipo è arrotondato per eccesso con abbondanza: ne viene speso solo una frazione e la parte non utilizzata viene rimborsata (vedi [Commissioni e gas](/docs/fees-and-gas/)). Gli hGRAM vengono inviati allo stesso indirizzo da cui è partito il trasferimento.

## Unstaking totale — il commento «w»

Invia 0,1 GRAM allo stesso indirizzo della tesoreria con il commento testuale:

```
w
```

In questo modo viene ritirato dallo staking l'**intero** saldo di hGRAM di quel wallet. Per ritirarne solo una parte, usa invece un ordine raw — vedi la sezione successiva. L'unstaking si regola secondo le normali regole del protocollo, quindi valgono le tempistiche dell'unstaking Completo — vedi [Come funziona l'unstaking](/docs/introduction/how-does-hipo-work/unstaking/) e [Quanto tempo richiede l'unstaking?](/faq/#how-long-does-unstaking-take)

## Unstaking parziale — un ordine raw

Un commento di testo può chiedere solo tutto, perché non c'è modo di indicarvi un importo. Un unstaking parziale è un messaggio ordinario con un corpo binario, quindi serve un wallet o un multisig in grado di inviarne uno — multisig.ton.org lo chiama «Arbitrary order», e il suo modulo richiede esattamente i tre valori qui sotto.

Apri l'[app Hipo](/unstake/) con il tuo multisig connesso, digita l'importo che vuoi ritirare dallo staking e premi Unstake. L'app crea l'ordine e mostra i tre valori pronti da copiare:

- **Indirizzo di destinazione (Destination Address)** — il contratto del tuo wallet hGRAM. Non è la tesoreria: è il contratto che detiene i tuoi hGRAM, derivato dall'indirizzo del tuo multisig. Verificalo su Tonviewer prima di firmare; l'app include il link.
- **Importo TON (TON Amount)** — 0,1 GRAM, lo stesso anticipo per il gas usato ovunque, rimborsato tranne la frazione spesa.
- **BOC dell'ordine (Order BOC)** — il corpo del messaggio, in base64.

Due cose da sapere. Solo il contratto del tuo wallet hGRAM accetta questo ordine, quindi se per errore viene firmato da un wallet diverso rimbalza semplicemente e non viene bruciato nulla — a differenza del commento «w», che ritirerebbe dallo staking qualunque saldo si trovi nel wallet mittente. Inoltre, se hai scelto il tasso istantaneo, l'importo riscattabile istantaneamente cambia a ogni round: firma tempestivamente, oppure scegli il tasso migliore per un ordine che deve aspettare altre firme.

## Bruciare hGRAM tramite il minter

Puoi anche riscattare GRAM direttamente bruciando hGRAM su [minter.ton.org](https://minter.ton.org/), usando l'indirizzo del master hGRAM (Parent):

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

Dopo il burn ricevi GRAM al tasso di riscatto corrente. L'indirizzo del parent può cambiare con gli aggiornamenti del protocollo — controlla prima [Contratti e audit](/docs/contracts-and-audits/).

## Oppure fai swap su un DEX

Esistono pool di hGRAM su DeDust, STON.fi, TONCO, GroypFi e swap.coffee — l'elenco aggiornato è nella [pagina DeFi](/defi/). Si applicano le commissioni di swap e l'impatto sul prezzo.

## Prima di inviare

- Verifica l'indirizzo della tesoreria confrontandolo con [Contratti e audit](/docs/contracts-and-audits/) — non fidarti mai di un indirizzo ricevuto in un messaggio inoltrato; vedi [Conoscere e prevenire il phishing](/docs/security/phishing-awareness-and-prevention/).
- Il commento deve essere in testo semplice, esattamente `d` oppure `w`.
- Un trasferimento senza commento, o con il commento sbagliato, non è una richiesta di staking o di unstaking.
- Per un ordine raw, controlla che la destinazione sia il contratto del tuo wallet hGRAM e non un indirizzo proveniente da qualche altra parte.

## Altro nelle FAQ

- [Posso fare staking con un wallet multisig o cold?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Commissioni e gas](/docs/fees-and-gas/)
