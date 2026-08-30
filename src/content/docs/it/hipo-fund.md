---
title: 'Hipo Fund — tesoreria on-chain'
description: 'Hipo Fund — una tesoreria on-chain a sostegno del token HPO.'
---

<figure><img src="/docs/images/hipo-fund-1.jpg" alt="Banner promozionale con la scritta «HipoFund.ton», un sacco di denaro circondato dalle icone di Bitcoin, Tether, HPO e TON e un grafico in crescita."></figure>

## 📌 Che cos'è Hipo Fund

Hipo Fund è la tesoreria di investimento a lungo termine di Hipo. Detiene i proventi delle vendite di token
HPO e dei riscatti delle stagioni di Hipo Club, ed è tenuta separata dal budget operativo di Hipo.

L'idea è mutuata dal fondo petrolifero norvegese: invece di spendere le entrate man mano che arrivano, se ne
mette da parte una quota e la si gestisce nel lungo periodo. Hipo Fund esiste per costruire valore duraturo a
sostegno di HPO, non per coprire i costi quotidiani.

Ogni asset che detiene è custodito on-chain e può essere verificato da chiunque.

---

## 📊 Situazione attuale

| Indicatore                                   | Valore                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| **Capitale iniziale (18 aprile 2025)**       | $186.963,96                                                               |
| **Capitale conferito da allora**             | ~$37.092 (riscatti della Stagione 2 e della Stagione 3)                   |
| **Ultimo valore riportato (24 agosto 2026)** | $98.776,51                                                                |
| **Rendimento dall'avvio (Modified Dietz)**   | −58,4 %                                                                   |
| **GRAM nello stesso periodo**                | −49,8 %                                                                   |
| **Ultimo report**                            | [Report di agosto 2026](/docs/hipo-fund/quarterly-report-august-24-2026/) |

Il fondo si trova al di sotto del suo capitale iniziale, soprattutto per effetto del calo del prezzo di GRAM
su un portafoglio fortemente legato a GRAM nel suo primo anno. La contabilità completa è nel report di agosto 2026.

A **settembre 2026 pubblicheremo un Investment Policy Statement** che definisce le allocazioni obiettivo, i
limiti di rischio, i requisiti di liquidità e le regole di ribilanciamento. Passerà alla revisione della
community e poi a un voto vincolante della DAO. È il quadro entro cui Hipo Fund sarà gestito d'ora in avanti.

Le date esatte sono annunciate nel [canale Telegram di Hipo](https://t.me/HipoFinance) e su
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv).

---

## 🏦 Wallet

Hipo Fund detiene asset in due wallet. Entrambi sono conteggiati in ogni report.

**Wallet principale — multisig**\
`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr`
([hipofund.ton](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr))

- Richiede **2 firme su 3** per movimentare i fondi
- Firmatari: due cofondatori di Hipo e un membro del team
- Detiene la maggior parte del fondo

**Wallet secondario — a firma singola**\
`UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG`
([visualizza](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG))

- Il wallet originario del fondo, rimasto in uso dopo la migrazione a multisig e tuttora detentore di una
  parte del fondo
- È anche proposer sul multisig
- Alcuni sistemi di Hipo, tra cui Hipo Club, non supportano i wallet multisig, quindi questo wallet è
  mantenuto ai fini dell'idoneità. L'Investment Policy Statement fissa un limite a quanto vi viene detenuto

:::note[Una nota sui formati degli indirizzi]
TON mostra lo stesso wallet in due forme — bounceable (`EQ…`) e non-bounceable (`UQ…`). Gli ultimi quattro
caratteri differiscono, ma l'account è identico. Potresti vedere `UQDa2GcC…_GQu` e `EQDa2GcC…_Dnr` usati per
il multisig: sono lo stesso wallet.
:::

---

## 💵 Come viene finanziato Hipo Fund

Hipo Fund non ha mai ricevuto alcuna allocazione dalla tokenomics di HPO. Il suo capitale proviene da:

- **Proventi delle vendite di token HPO**, inclusi l'ILO e gli accordi OTC con investitori strategici
- **Riscatti delle stagioni di Hipo Club** (Stagione 2 e Stagione 3). Dalla Stagione 4 le ricompense in HPO
  maturano direttamente per chi detiene hGRAM, quindi non esiste una finestra di riscatto stagionale né altri
  riscatti di questo tipo
- **Ricompense di staking di hGRAM** — attualmente l'unica fonte di reddito attiva del fondo
- **Condivisione dei profitti sugli HPO detenuti dal fondo**, quando la condivisione dei ricavi del protocollo
  è attiva. La commissione di staking è dello 0 % dal 6 giugno 2026, quindi al momento non viene effettuata
  alcuna distribuzione

Tutti gli HPO detenuti dal fondo sono stati acquistati sul mercato aperto.

---

## 💰 Report di apertura — 18 aprile 2025

- **Capitale iniziale:** $186.963,96
- **Inizio della rendicontazione:** 18 aprile 2025

### 🔸 Allocazione iniziale del portafoglio

| Asset             | Quantità     | Allocazione | Valore (USD)    | Note                                               |
| ----------------- | ------------ | ----------- | --------------- | -------------------------------------------------- |
| hGRAM             | 34.955,22    | 59,59 %     | $111.405,91     | GRAM in staking                                    |
| HPO               | 6.754.307,59 | 38,64 %     | $72.238,04      | Token di governance e di condivisione dei profitti |
| Stablecoin (USDT) | 3.304,14     | 1,77 %      | $3.304,14       | Preservazione del capitale e liquidità di riserva  |
| GRAM              | 5,30         | 0,01 %      | $15,87          | Esposizione diretta a GRAM                         |
| **Totale**        |              | **100 %**   | **$186.963,96** |                                                    |

_Le percentuali sono arrotondate a due decimali e potrebbero non sommare esattamente a 100._

:::note[Correzione, 29 agosto 2026]
Il valore di HPO in questa tabella era stato pubblicato in precedenza come $15.000, il che era un errore: le
quattro righe non sommavano al capitale iniziale indicato. HPO è ora riportato a $72.238,04, il suo valore di
mercato al 18 aprile 2025 ($0,010695 per HPO), e tutte e quattro le percentuali di allocazione sono state
ricalcolate a partire dai valori in USD perché la tabella quadri con $186.963,96. Le percentuali pubblicate in
precedenza erano 59,28 % (hGRAM), 1,76 % (USDT), 38,95 % (HPO) e 0,01 % (GRAM). La tabella di confronto nel
[report di agosto 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) è stata corretta di conseguenza.
Nessun saldo è cambiato.
:::

---

## 🔒 Come viene gestito il fondo

**Completamente on-chain e verificabile**\
Ogni asset è detenuto nei due wallet indicati sopra e può essere verificato da chiunque in qualsiasi momento.
Il fondo detiene solo asset che possono essere monitorati in modo trasparente on-chain.

**Rendicontazione basata su snapshot**\
I report da agosto 2026 in poi sono generati da
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
che legge ogni saldo da un singolo blocco della masterchain di TON ed elenca quel blocco, il tasso di cambio
di hGRAM e ogni prezzo usato nelle Note del report. Chiunque legga può rieseguire lo script e riprodurre le
tabelle.

I report di [agosto 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) e
[dicembre 2025](/docs/hipo-fund/quarterly-report-december-18-2025/) precedono lo script e sono stati
assemblati a mano. I loro saldi sono stati da allora verificati sulla catena e quadrano; le loro
valorizzazioni hanno usato convenzioni di prezzo diverse, come indicato nel report di agosto 2026.

**Rendicontazione periodica**\
Hipo Fund pubblica un report ogni trimestre. Ogni report include il rendimento dall'avvio e un benchmark. Il
prossimo report è previsto per **dicembre 2026**.

**Decisioni annunciate**\
Le modifiche rilevanti al portafoglio sono annunciate nei canali ufficiali di Hipo, e le modifiche alla
strategia del fondo passano dal voto della DAO.

**Crescita a rischio controllato**\
Il fondo è gestito per la preservazione del capitale nel lungo periodo e per una crescita sostenibile. Le
allocazioni obiettivo, i limiti di concentrazione, i requisiti di liquidità e le regole di ribilanciamento
sono definiti nell'Investment Policy Statement.

**Governance**\
Chi detiene HPO vota sull'indirizzo di Hipo Fund attraverso la [Hipo DAO](/docs/dao/) su
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv). L'Investment Policy Statement è
la prima politica di Hipo Fund sottoposta a un voto vincolante. L'esecuzione all'interno di una politica
approvata è gestita dai firmatari del multisig; le modifiche alla politica passano dalla DAO.

---

## ⚠️ Rischi

Hipo Fund è una tesoreria in cripto e il suo valore si muove con il mercato. I rischi principali:

- **Rischio di mercato.** Le posizioni del fondo diverse dalle stablecoin sono esposte ai prezzi di GRAM e
  HPO.
- **Rischio di concentrazione.** Gli asset del fondo sono concentrati nell'ecosistema TON e nel token di Hipo
  stesso.
- **Rischio di liquidità.** La posizione in HPO è ampia rispetto alla liquidità di HPO sul mercato. Il valore
  riportato è il prezzo di mercato moltiplicato per il saldo; non significa che l'intera posizione potrebbe
  essere venduta a quel prezzo.
- **Rischio di custodia.** Una parte del fondo si trova in un wallet a firma singola.
- **Rischio di smart contract.** Gli asset detenuti in protocolli DeFi, hGRAM compreso, comportano il rischio
  del malfunzionamento di un contratto.

Questi rischi sono gestiti, non eliminati. L'Investment Policy Statement fissa limiti per ciascuno di essi.

---

## 💜 Per la community di Hipo

Hipo Fund appartiene alla community. La sua crescita sostiene il valore e la sostenibilità di HPO e di ogni
detentore di HPO. Ci impegniamo a una rendicontazione periodica e trasparente e a una governance aperta.

Vuoi proporre strategie, strumenti DeFi o progetti TON per il fondo? Partecipa alla conversazione su
[@hipo_chat su Telegram](https://t.me/hipo_chat).
