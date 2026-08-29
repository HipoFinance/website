---
title: 'Ricompense Hipo'
---

Il nostro obiettivo è costruire Hipo come un protocollo davvero guidato dalla community, in cui il valore e le decisioni passano alla community.

Fare staking di GRAM con Hipo ti paga in tre flussi distinti, su tre tempistiche diverse:

- **Ricompense base**\
  Le ricompense di staking di GRAM, riflesse nel tasso di cambio di hGRAM rispetto a GRAM — liquidate **a ogni round di validazione** (~18 h), senza nulla da riscuotere
- **Ricompense potenziate**\
  HPO extra sul valore in GRAM del tuo capitale in staking, a un coefficiente stabilito dal tuo livello [Hipo Club](https://t.me/HipoFinanceBot/join) — maturano **a ogni round di validazione** e sono prelevabili quando il tuo saldo supera i 1.000 HPO
- **Ricompense aggiuntive**\
  Detieni HPO → ricevi una quota dei ricavi del protocollo — pagata **alla fine di ogni stagione di Hipo Club**

Tutti e tre sono monitorabili nell'[app Hipo](/rewards/) e in [Hipo Club](https://t.me/HipoFinanceBot/join).

## Ricompense base: il tasso di cambio

Fai staking di GRAM e ricevi hGRAM. Non c'è alcun blocco e non c'è nulla da riscuotere: le ricompense di validazione si accumulano all'interno del protocollo, così ogni hGRAM vale sempre più GRAM col passare del tempo. Il tuo saldo di hGRAM non cambia mai — cambia il suo valore.

Questo è il flusso principale, ed è quello a cui si riferisce l'APY nella [pagina Statistiche](/stats/). Poiché Hipo non trattiene nulla dal tuo capitale in staking e la [commissione di governance](/docs/fees-and-gas/) è attualmente pari allo 0 %, l'intera ricompensa di validazione confluisce nel tasso di cambio.

## Ricompense potenziate: gli HPO di Hipo Club

Oltre al tasso di cambio, [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) ti paga HPO per il fatto che detieni hGRAM. È un flusso separato, viene pagato in HPO anziché in GRAM e lo prelevi nel Club.

### La formula

A ogni round di validazione, ogni membro guadagna:

```
HPO reward = GRAM value of your stake × HPOrewardRate × LevelRate
```

- **HPOrewardRate** è attualmente **0,0021902**. È stabilito dalla governance e può cambiare.
- **LevelRate** è il coefficiente associato al tuo livello Hipo Club.

Un round di validazione dura 65.536 secondi — circa 18,2 ore — quindi in un anno ci sono all'incirca **481 round**. Al tasso attuale, ogni GRAM del tuo capitale in staking guadagna circa **1,05 HPO all'anno** al Livello 1.

La base di calcolo è quanto **vale oggi in GRAM** il tuo capitale in staking — il tuo saldo di hGRAM al tasso di cambio attuale — non l'importo che hai depositato all'inizio. Poiché le ricompense base spingono quel valore verso l'alto a ogni round, anche le tue ricompense in HPO crescono con esso: i due flussi si compongono a vicenda.

### I coefficienti di livello

Il coefficiente non coincide con il numero del livello: parte da 1× e accelera man mano che sali:

| Livello | 1    | 2    | 3    | 4    | 5   | 6   | 7    | 8    | 9    | 10  |
| ------- | ---- | ---- | ---- | ---- | --- | --- | ---- | ---- | ---- | --- |
| Tasso   | 1,0× | 1,2× | 1,6× | 2,2× | 3×  | 4×  | 5,2× | 6,6× | 8,2× | 10× |

Ogni livello vale più di quello che lo precede: passare dal Livello 1 al Livello 2 aggiunge 0,2×, mentre passare dal Livello 9 al Livello 10 aggiunge 1,8× — nove volte tanto. Il premio per la scalata arriva soprattutto in cima.

### Che cosa significa in pratica

Ricompense annuali in HPO al tasso attuale:

| Capitale in staking (GRAM) | Livello 1 (1×) | Livello 5 (3×) | Livello 10 (10×) |
| -------------------------- | -------------- | -------------- | ---------------- |
| 1.000                      | ~1.055 HPO     | ~3.164 HPO     | ~10.546 HPO      |
| 5.000                      | ~5.273 HPO     | ~15.819 HPO    | ~52.732 HPO      |
| 10.000                     | ~10.546 HPO    | ~31.639 HPO    | ~105.463 HPO     |
| 50.000                     | ~52.732 HPO    | ~158.195 HPO   | ~527.316 HPO     |

### Quanto vale

Le ricompense in HPO sono pagate in un token che ha un prezzo di mercato, e quel prezzo si muove. Valutato al prezzo di mercato di HPO del 29 agosto 2026, il potenziamento aggiunge circa **0,18 punti percentuali** al tuo rendimento annuo effettivo al Livello 1, e circa **1,8 punti percentuali** al Livello 10.

Quindi uno staker al Livello 10 guadagna all'incirca l'APY dello staking di GRAM riportato nella [pagina Statistiche](/stats/), **più circa l'1,8 %** in termini di HPO.

:::note
Lo diciamo così di proposito. Un numero grande di HPO, da solo, non ti dice quanto stai guadagnando, e il mercato di HPO è piccolo — il token è scambiato poco, quindi il valore di una posizione grande in HPO non è lo stesso di una piccola. Preferiamo che tu lo sappia, piuttosto che scoprirlo con sorpresa.
:::

### I livelli

Il tuo livello moltiplica tutto quello che precede: al Livello 10 lo stesso capitale in staking guadagna dieci volte quello che guadagna al Livello 1. Guadagni inoltre l'1 % delle ricompense in HPO generate dalle persone che inviti.

Ci sono due modi per salire di livello:

- **Avanzamento stagionale** — riscuoti le ricompense guadagnate almeno una volta durante la stagione; il tuo livello sale automaticamente alla fine della stagione.
- **Avanzamento istantaneo** — paghi la commissione di avanzamento e il tuo livello sale subito.

Due regole contano:

- **Vendere gli HPO ricevuti come ricompensa ti riporta al Livello 1.** Il Club è pensato per premiare chi detiene, e questo è il meccanismo. Inviare gli HPO ricevuti come ricompensa a un exchange, o a un wallet che non hai connesso al Club, conta come vendita; spostarli fra i tuoi stessi wallet connessi no — vedi [Usare più wallet](/docs/wallets-and-rewards/).
- **Non c'è una finestra di riscossione.** Le ricompense maturano a ogni round e possono essere prelevate ogni volta che il tuo saldo è di almeno **1.000 HPO**.

## Ricompense aggiuntive: la condivisione dei profitti

HPO è il token di governance di Hipo. Detenerlo ti dà diritto di voto nella [DAO](/docs/dao/) e a una quota dei ricavi del protocollo, distribuita alla fine di ogni stagione di Hipo Club — vedi [Condivisione dei profitti](/docs/profit-sharing/).

:::note
Finché la [commissione di governance](/docs/fees-and-gas/) è pari allo **0 %**, il protocollo non incassa ricavi, quindi in questo flusso non c'è nulla da distribuire. La condivisione dei profitti riprende quando riprende la commissione. È proprio la commissione allo 0 % a rendere le ricompense base così alte.
:::

Più partecipi, più guadagni, e maggiore è il tuo ruolo nel plasmare il futuro di Hipo.

---

_HPOrewardRate, le soglie dei livelli, il tasso di cambio di hGRAM e il prezzo di mercato di HPO cambiano tutti nel tempo. Le cifre di questa pagina sono aggiornate all'ultima revisione e non sono una garanzia di ricompense future. I dati di protocollo in tempo reale sono sempre nella [pagina Statistiche](/stats/)._
