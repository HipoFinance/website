---
title: 'Commissioni e gas'
description: "Quanto costano davvero lo staking e l'unstaking con Hipo: nessuna trattenuta del protocollo sul tuo capitale, una commissione di governance attualmente allo 0 % e un anticipo per il gas la cui parte non utilizzata viene rimborsata."
---

## Hipo non trattiene nulla dal tuo capitale in staking

Hipo non applica alcuna commissione di protocollo sui GRAM che metti in staking. L'unica commissione a livello di protocollo è la commissione di governance descritta qui sotto; tutto il resto legato a una transazione di staking o unstaking è gas di rete pagato a TON, non un ricavo di Hipo.

## La commissione di governance

Il protocollo applica una commissione di governance sulle ricompense di validazione, stabilita dalla [DAO di Hipo](/docs/dao/), attualmente pari allo 0 %. Riguarda soltanto le ricompense di validazione, mai i tuoi GRAM in staking, e finché resta allo 0 % le ricompense arrivano per intero ai detentori di hGRAM. Qualsiasi modifica passerebbe da un voto della DAO ed è visibile on-chain — vedi [Hipo trattiene una parte delle mie ricompense?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Anticipi per il gas e rimborsi

Quando fai staking o unstaking viene aggiunto un piccolo anticipo per il gas (attualmente 0,1 GRAM); ne viene speso solo una frazione — nell'ordine di un centesimo di GRAM — e il resto viene rimborsato. I due flussi differiscono per il momento in cui arriva il rimborso:

- **Deposito**: l'anticipo viaggia insieme all'importo messo in staking, e la parte non utilizzata torna al tuo wallet poco dopo, come trasferimento di eccedenza separato.
- **Unstaking**: l'anticipo viaggia insieme al burn dei token, e al momento della richiesta torna poco o nulla — il residuo non utilizzato viene liquidato insieme al prelievo finale in GRAM.

## Come leggere i tuoi numeri

Poiché il rimborso dell'unstaking arriva insieme al prelievo, l'importo grezzo del prelievo sovrastima leggermente la ricompensa di staking pura: contiene anche il gas restituito. Per misurare il rendimento reale di staking di un wallet, compensa tutti i flussi di ogni ciclo: (depositi inviati − rimborsi sui depositi) rispetto a (rimborsi al momento della richiesta + importo del prelievo). La [pagina Ricompense](/rewards/) tiene traccia delle tue ricompense al posto tuo.

## Da dove arrivano gli importi attuali

I prezzi del gas sono stabiliti dalla rete TON e variano con essa, quindi nessuna cifra fissa riportata in un documento resta accurata. L'[app Hipo](/stake/) mostra l'anticipo esatto prima che tu confermi. La fonte autorevole è il getter `get_treasury_fees` della tesoreria, esposto anche come strumento `get_fees` dell'[Hipo MCP Server](/docs/hipo-mcp-server/).

## Costi al di fuori di Hipo

Fare swap di hGRAM su un DEX sostituisce il gas di Hipo con la commissione di swap della pool più l'impatto sul prezzo, e il tasso viene dalla pool, non dal protocollo. L'elenco aggiornato delle pool è nella [pagina DeFi](/defi/); i compromessi sono trattati in [Rischi](/docs/risks/).

## Altro nelle FAQ

- [Quanto costa fare staking?](/faq/#what-does-it-cost-to-stake)
- [Ci sono commissioni per l'unstaking?](/faq/#are-there-any-unstaking-fees)
