---
title: 'Validatori'
---

## Prestare token GRAM ai validatori

1. **Modello di validatori senza permessi**: Hipo presta i GRAM in staking ai validatori tramite un modello aperto — qualsiasi validatore può fare un'offerta, senza bisogno dell'approvazione di Hipo.
2. **Modello ad asta tra validatori**: a ogni round di validazione i validatori fanno un'offerta per prendere in prestito i GRAM in staking indicando il tasso di ricompensa che pagheranno. I contratti di Hipo selezionano automaticamente le offerte migliori, così gli staker ottengono il tasso migliore disponibile in quel round.
3. **Processo sicuro**: tutti i processi, compresi il prestito dei GRAM in staking e la distribuzione delle ricompense, vengono eseguiti in sicurezza tramite gli smart contract di Hipo. Il protocollo è stato sottoposto ad [audit di sicurezza](https://github.com/HipoFinance/audits) per garantire l'integrità e la sicurezza dei fondi degli utenti.
4. **Garanzia del validatore**: un validatore che prende in prestito deve bloccare GRAM propri a copertura della penalità massima di slashing per il round più la ricompensa promessa. Un'eventuale penalità viene prelevata da quella garanzia, non dai GRAM in staking.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Diagramma: il protocollo Hipo presta GRAM a un validatore, che valida su TON e restituisce i GRAM più le ricompense di staking."></figure>
