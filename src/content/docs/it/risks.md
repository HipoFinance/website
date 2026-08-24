---
title: 'Rischi'
description: 'I rischi dello staking di GRAM con Hipo — smart contract, validatori, liquidità, variabilità delle ricompense e phishing — e cosa fa il protocollo per ciascuno di essi.'
---

Lo staking e la DeFi comportano sempre dei rischi, e Hipo non garantisce alcun rendimento. Questa pagina elenca i rischi dello staking di GRAM con Hipo, cosa fa il protocollo per ciascuno di essi e cosa puoi fare tu.

## Rischio degli smart contract

Bug o vulnerabilità negli smart contract possono avere conseguenze sui fondi. I contratti di Hipo sono open source e hanno superato quattro audit indipendenti — Quantstamp (aprile 2025) e ProgramCrafter (marzo 2024) sui contratti v2, TonTech e Daniil Sedov (ottobre 2023) sulla v1 — e sono scritti in FunC con Blueprint, con una suite di test pubblica. Verifica tu stesso gli indirizzi con cui interagisci confrontandoli con [Contratti e audit](/docs/contracts-and-audits/).

## Rischio dei validatori e dello staking

Le ricompense di staking dipendono dalla corretta partecipazione dei validatori ai round di validazione di TON. Prima di poter prendere in prestito i GRAM in staking, un validatore deve bloccare un collaterale che copra la penalità di slashing massima del round più la ricompensa promessa, quindi un'eventuale penalità viene prelevata da quel collaterale e non dai GRAM in staking. Prestazioni insufficienti possono comunque tradursi in una ricompensa più bassa per quel round — vedi [Validatori e il Marketplace](/docs/introduction/how-does-hipo-work/validators/) e [Cosa succede se un validatore ha prestazioni insufficienti?](/faq/#what-happens-if-a-validator-underperforms)

## Rischio di liquidità

Un unstaking Istantaneo riesce solo quando il protocollo dispone di GRAM liberi sufficienti a coprirlo; l'[app](/unstake/) mostra il massimo attualmente disponibile. Un unstaking Completo va sempre a buon fine, ma viene liquidato al termine del round di validazione in corso — nel caso peggiore l'attesa può arrivare a circa 36 ore. Uscire tramite un [DEX](/defi/) dipende invece dalla liquidità della pool e comporta un impatto sul prezzo — vedi [Perché l'unstaking istantaneo a volte non è disponibile?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Variabilità delle ricompense

Il tasso di ricompensa cambia nel tempo in base alle offerte dei validatori e alle condizioni della rete, e nessun rendimento fisso viene promesso. I dati in tempo reale e storici sono nella [pagina Statistiche](/stats/), mai in questa pagina.

## Rischio di phishing

Usa solo link ufficiali di Hipo e verifica ogni richiesta del wallet prima di firmare. I canali ufficiali e gli indirizzi dei contratti sono elencati in [Consapevolezza sul phishing](/docs/security/phishing-awareness-and-prevention/) e [Contratti e audit](/docs/contracts-and-audits/).

## Cosa Hipo non promette

- Nessun rendimento fisso — le ricompense variano a ogni round di validazione.
- Nessuno staking privo di rischi — i rischi sopra elencati si applicano sempre.
- Nessun prelievo nativo istantaneo in ogni caso — l'opzione Istantaneo dipende dalla liquidità del protocollo.

## Altro nelle FAQ

- [Posso perdere i miei fondi?](/faq/#can-i-lose-my-funds)
- [Hipo è sicuro?](/faq/#is-hipo-safe)
