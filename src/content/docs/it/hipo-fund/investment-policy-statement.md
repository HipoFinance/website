---
title: 'Investment Policy Statement di Hipo Fund'
description: 'Come viene investito Hipo Fund: allocazione obiettivo, limiti di rischio e di concentrazione, custodia, liquidità e come una quota della crescita del fondo torna a chi detiene HPO.'
---

:::caution

**Questa è una bozza in fase di revisione da parte della community. Non è ancora in vigore.**

:::

**Bozza v1.5 · Per la revisione della community e la ratifica della DAO**

---

## In breve

_Segue la politica completa. Dove le due versioni differiscono, prevalgono le sezioni numerate._

**Allocazione obiettivo.** HPO è escluso dall'allocazione. Tutto il resto:

| Comparto                                                                                | Obiettivo | Banda   |
| --------------------------------------------------------------------------------------- | --------- | ------- |
| Rendimento da stablecoin, impiegato                                                     | 45 %      | 35–55 % |
| Riserva Opportunità — si attiva solo al superamento di una soglia di ribasso di Bitcoin | 10 %      | 5–15 %  |
| Bitcoin, detenuto nativamente                                                           | 30 %      | 20–35 % |
| hGRAM                                                                                   | 12 %      | 8–18 %  |
| Liquidità operativa e gas                                                               | 3 %       | 2–6 %   |

**Limiti chiave.**

|                                                             |                  |
| ----------------------------------------------------------- | ---------------- |
| Asset dell'ecosistema TON (HPO + hGRAM + GRAM)              | ≤ 45 % del fondo |
| Asset che nessun emittente può congelare                    | ≥ 20 % del fondo |
| Qualsiasi singolo protocollo, o qualsiasi singolo emittente | ≤ 30 % del fondo |
| Asset fuori dalla custodia multisig                         | 0 %              |
| Leva finanziaria                                            | Zero, sempre     |

**Cosa ottiene chi detiene HPO.**

| Canale                     | Come funziona                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ritorno di valore**      | Al di sopra del proprio high-water mark, il fondo restituisce fino alla metà della propria crescita accumulata a chi detiene HPO, con un ritmo massimo del 2 % del valore del fondo all'anno. La crescita trattenuta dal tetto di ritmo viene messa in coda, non persa. Viene pagata attraverso la condivisione dei profitti di Hipo Club oppure acquistando HPO e bruciandolo — la DAO vota la forma, non l'importo. |
| **Copertura patrimoniale** | Il valore del fondo come quota della capitalizzazione di mercato di HPO viene pubblicato ogni trimestre.                                                                                                                                                                                                                                                                                                              |
| **Governance**             | Chi detiene HPO vota questa politica, ogni sua modifica, e qualsiasi vendita degli HPO del fondo.                                                                                                                                                                                                                                                                                                                     |

**Dieci regole.**

1. **Nessuna leva, nessun derivato, nessun market making.** A qualsiasi dimensione, sempre.
2. **Il fondo non acquista HPO per detenerlo.** Può acquistare HPO da bruciare, finanziato solo dai guadagni — vedi le Sezioni 2.2 e 8.
3. **Il fondo non è una fonte di liquidità di mercato per HPO né di fondi operativi.**
4. **Tutti gli asset in multisig 2 su 3** — uno su TON, uno su EVM, uno su Bitcoin.
5. **Ogni posizione deve essere prelevabile direttamente dal proprio contratto,** senza il permesso di alcun operatore o front end.
6. **Nessun market timing.** Le bande di ribilanciamento comprano ai minimi e vendono ai massimi, meccanicamente.
7. **La Riserva Opportunità si attiva solo su un trigger** — Bitcoin al 40 %, 55 % e 70 % sotto il suo massimo degli ultimi 12 mesi, in terzi.
8. **Nessuno viene pagato per gestire questo fondo.** Nessuna commissione di gestione, nessuna commissione di performance.
9. **Un report ogni trimestre,** da un singolo blocco on-chain, con la performance dall'avvio e il valore attuale di ogni limite.
10. **La DAO stabilisce il quadro; i firmatari eseguono al suo interno.**

**Una cosa da chiarire.** A questa allocazione il fondo rende circa il 2 % all'anno. Il suo high-water mark è il capitale conferito, circa $224.056, e nessun ritorno di valore è dovuto finché il fondo non è sopra quella soglia. Questa politica è costruita per crescere in modo costante e sopravvivere a interi cicli di mercato, non per recuperare rapidamente.

---

## 1. Scopo e origine

Hipo Fund è stato creato nell'aprile 2025 dai proventi dell'offerta iniziale di HPO, insieme ai riscatti di HPO delle stagioni di Hipo Club. Quel capitale non è stato allocato al team e non è stato assorbito nel budget operativo di Hipo. È stato collocato in una tesoreria separata e pubblicamente visibile e messo da parte per lavorare a favore dell'ecosistema Hipo e di chi detiene HPO su un orizzonte misurato in anni.

Questo documento definisce come quel capitale viene investito: cosa può detenere il fondo, quanto di ciascuna cosa può detenere, chi decide cosa, come il valore torna a chi detiene HPO e come tutto questo viene rendicontato.

Una politica scritta rende le decisioni ripetibili, così il comportamento del fondo non dipende da chi vi presta attenzione in un dato mese. Le rende verificabili, così la community può giudicare il processo e non solo il risultato. E fissa i limiti prima che servano, quando è facile trovare un accordo su di essi.

Una volta ratificata con voto della DAO, questa politica è vincolante per i firmatari del fondo.

---

## 2. Mandato e obiettivi

Hipo Fund è una tesoreria di investimento a lungo termine. I suoi obiettivi, in ordine di priorità:

1. **Preservare il capitale** attraverso interi cicli di mercato.
2. **Far crescere il valore reale del fondo** su un orizzonte misurato in anni.
3. **Restituire una quota di quella crescita a chi detiene HPO**, in modo sostenibile e senza consumare il capitale.

### Cosa non è Hipo Fund

- **Non è un conto di trading.** Non assume posizioni di breve termine né tenta di anticipare i mercati.
- **Non è una fonte di liquidità di mercato per HPO.** Fornire liquidità per il mercato di HPO è una decisione di tokenomics finanziata dalle allocazioni di tesoreria e marketing di HPO.
- **Non è una fonte di fondi operativi.** Il fondo è separato dal budget operativo di Hipo e non può essere utilizzato per le spese.

### 2.1 Come Hipo Fund restituisce valore a chi detiene HPO

Hipo restituisce valore a chi detiene HPO dai propri flussi di ricavi, in due modi già consolidati: attraverso la condivisione dei profitti di Hipo Club, e acquistando HPO sul mercato e bruciandolo. Hipo Fund è pensato per diventare un altro di questi flussi.

Quando il fondo cresce oltre il proprio high-water mark, una quota di quella crescita viene allocata ogni anno a chi detiene HPO secondo la regola della Sezione 2.2. La forma che assume — condivisione dei profitti o buy-and-burn — viene scelta quando una distribuzione diventa dovuta, usando l'infrastruttura che Hipo già gestisce.

Entrambe le forme restituiscono valore reale; lo fanno in modo diverso, e la scelta dovrebbe riflettere le condizioni del momento:

- Il **buy-and-burn** riduce in modo permanente l'offerta di HPO e avvantaggia ogni detentore senza che nessuno debba fare richiesta. Crea il massimo valore quando HPO tratta al di sotto di quanto gli asset del fondo e i fondamentali del protocollo giustificherebbero, poiché un burn è accretivo solo se i token vengono acquistati sotto il loro valore. Il suo costo è l'impatto sul mercato: in un mercato poco profondo, una parte della spesa muove il prezzo invece di acquistare offerta.
- La **condivisione dei profitti** mette ogni dollaro nelle mani di chi detiene HPO pro quota, senza impatto sul mercato, ed è la via più efficiente ogni volta che HPO non è chiaramente sottovalutato.

Accanto a questo, il valore del fondo come percentuale della capitalizzazione di mercato in circolazione di HPO viene pubblicato in ogni report trimestrale. È la quota della valutazione di HPO garantita da asset detenuti al di fuori del token stesso, e viene riportata sia che salga sia che scenda.

**Una nota sulla scala.** Alla dimensione attuale del fondo un ritorno di valore sarebbe modesto, e nessuno è dovuto finché il fondo resta sotto il proprio high-water mark. La regola conta per ciò a cui si impegna: dà a chi detiene HPO una pretesa definita e pubblicata sulla crescita del fondo, che si amplia man mano che il fondo cresce, e che non può essere modificata senza un voto della DAO.

### 2.2 La regola del ritorno di valore

**High-water mark.** Il capitale totale conferito al fondo, più tutto ciò che il fondo ha già restituito a chi detiene HPO. Attualmente si attesta a circa **$224.056**. Sale quando viene conferito nuovo capitale, e dell'importo di ogni ritorno di valore. Non scende mai.

**Sotto l'high-water mark, non viene restituito nulla.** Il capitale viene prima ricostituito. Pagare al di sotto della soglia significa pagare dal capitale.

**Al di sopra di essa**, in ogni esercizio finanziario il fondo alloca al ritorno di valore per HPO il **minore** tra:

- **il 50 % del valore del fondo sopra l'high-water mark**, e
- **il 2 % del valore totale del fondo** all'inizio dell'anno

#### Perché ci sono due limiti

I due elementi svolgono compiti diversi.

**Il limite del 50 % decide se c'è qualcosa da restituire.** Misura il fondo rispetto a tutto ciò che vi è mai stato immesso o da esso pagato, quindi un anno in cui il fondo non cresce non produce nulla — e in nessun caso viene pagato più della metà della crescita accumulata del fondo. L'altra metà resta investita e continua a lavorare.

**Il tetto annuo decide quanto velocemente viene pagato.** Nella maggior parte degli anni è il tetto a governare; il limite del 50 % si applica solo nella fascia stretta appena sopra l'high-water mark. Questo è intenzionale. Un fondo che paga molto dopo un anno forte e nulla per i tre successivi serve chi detiene HPO peggio di uno che paga in modo costante, e una tesoreria di questa dimensione ha bisogno della propria capitalizzazione composta più di quanto abbia bisogno di un singolo pagamento ingente.

**Il tetto scandisce il ritmo del pagamento. Non lo annulla.** Poiché l'high-water mark sale solo di quanto viene effettivamente restituito, la crescita trattenuta dal tetto resta sopra la soglia e rimane distribuibile negli anni successivi. Nulla che ne abbia diritto viene perso — viene messo in coda.

_Esempio pratico._ Supponiamo che il fondo raggiunga $300.000 contro un high-water mark di $224.056. La crescita sopra la soglia è $75.944, quindi il limite del 50 % consentirebbe $37.972 — ma il tetto limita il ritorno dell'anno a $6.000. L'high-water mark sale a $230.056. Se il valore del fondo resta invariato l'anno successivo, la crescita sopra la soglia è $69.944, il tetto consente di nuovo $6.000, e viene pagato. L'importo limitato dal tetto non è perso; viene restituito negli anni successivi.

#### L'importo non è una decisione

Quando il fondo è sopra il proprio high-water mark, l'allocazione è un calcolo eseguito al momento del report trimestrale, non una proposta. Una volta calcolato viene accantonato per chi detiene HPO, riportato come importo impegnato finché non viene pagato, e non può essere riassorbito nel fondo.

**Solo la forma è sottoposta a voto.** I firmatari propongono condivisione dei profitti, buy-and-burn, o una combinazione, con le relative motivazioni, e la DAO ratifica la forma. Una proposta non ratificata viene rivista e ripresentata — l'allocazione in sé non decade. Se entro 90 giorni dal report che l'ha determinata non è stata ratificata alcuna forma, l'allocazione viene eseguita come buy-and-burn, che non richiede infrastrutture esterne e non può essere bloccato.

**La formula può essere modificata solo con voto della DAO.** I firmatari possono eseguire un ritorno di valore nell'ambito di questa regola; non possono alterarla, rinviarla o rinunciarvi.

#### Condizioni

- Il fondo resta entro ogni limite della Sezione 7 dopo il ritorno
- È finanziato da reddito e da proventi già realizzati attraverso il normale ribilanciamento — mai vendendo Bitcoin sotto la propria banda, attingendo alla Riserva Opportunità, vendendo gli HPO del fondo, o liquidando una posizione solo per creare un importo pagabile
- Se pagare l'intera allocazione spostasse un comparto fuori dalla propria banda, viene pagato quanto le bande consentono e il resto viene riportato all'anno successivo, con l'high-water mark che sale solo dell'importo effettivamente pagato
- Il calcolo completo viene pubblicato nel report trimestrale, incluso l'high-water mark prima e dopo

---

## 3. Governance e diritti decisionali

| Decisione                                                              | Chi decide                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Modificare questa politica                                             | **Voto della DAO** (vincolante)                                                                                    |
| Modificare la formula del ritorno di valore                            | **Voto della DAO** (vincolante)                                                                                    |
| Ridurre la posizione in HPO                                            | **Voto della DAO** (vincolante)                                                                                    |
| Aggiungere una classe di asset non elencata nella Sezione 5            | **Voto della DAO** (vincolante)                                                                                    |
| Introdurre qualsiasi compenso per il gestore                           | **Voto della DAO** (vincolante) — Sezione 14                                                                       |
| La forma che assume un ritorno di valore                               | I firmatari propongono, la DAO ratifica. L'**importo** è un calcolo secondo la Sezione 2.2 e non è soggetto a voto |
| Aggiungere un nuovo protocollo entro una classe di asset già approvata | Firmatari, annunciato entro 7 giorni                                                                               |
| Attivare la Riserva Opportunità al verificarsi di un trigger           | Firmatari, annunciato entro 7 giorni                                                                               |
| Ribilanciare entro le bande della Sezione 6                            | Firmatari, rendicontato trimestralmente                                                                            |
| Sede di esecuzione, tempistica e percorso                              | Firmatari                                                                                                          |

La DAO fissa il quadro e i limiti; i firmatari eseguono al loro interno. Le singole operazioni non sono sottoposte a voto — una tesoreria che ha bisogno di un voto per ribilanciarsi non può ribilanciarsi.

**Annuncio.** Qualsiasi singola transazione superiore a **$10.000**, e qualsiasi modifica che sposti un comparto fuori dalla propria banda, viene annunciata sui canali ufficiali di Hipo entro 7 giorni.

---

## 4. Custodia

Tutti gli asset del fondo sono detenuti in wallet multisig. Ce ne sono tre, ciascuno con un compito.

| Wallet                      | Detiene                           | Firma  |
| --------------------------- | --------------------------------- | ------ |
| Multisig TON `hipofund.ton` | hGRAM, HPO, GRAM per il gas       | 2 su 3 |
| Multisig Safe su EVM        | Stablecoin e posizioni di lending | 2 su 3 |
| Multisig Bitcoin            | BTC                               | 2 su 3 |

- Tutti e tre usano gli stessi tre firmatari, tutti membri del team Hipo.
- **Nessun asset del fondo è detenuto in un wallet a firma singola.**
- **Il fondo non sposta asset fuori dal multisig per soddisfare un requisito di idoneità.** Se un sistema di Hipo non supporta i wallet multisig, è il sistema a essere modificato, non l'assetto di custodia. Il supporto al multisig è un prerequisito prima che il fondo partecipi a qualsiasi meccanismo di distribuzione.
- Nessun asset del fondo è detenuto su un exchange centralizzato, presso un custode, o in un conto controllato da una singola persona, tranne che in transito ai sensi della Sezione 4.1.
- Bitcoin è detenuto nativamente, non wrapped. Ogni wrapper reintroduce un custode, e questo comparto non ha bisogno di essere produttivo.

### 4.1 Spostare asset tra chain

I trasferimenti cross-chain usano un bridge on-chain con un percorso attivo e verificato, eseguiti in tranche anziché come un'unica transazione.

Dove non esiste un percorso on-chain affidabile, un trasferimento può passare attraverso un conto exchange appartenente a un firmatario, a condizione che siano soddisfatte tutte le seguenti condizioni:

- Non più del **15 % del fondo** in transito alla volta
- Completato entro **72 ore**
- Entrambe le tratte pubblicate nel report trimestrale successivo con gli hash di transazione su ciascuna chain
- Concordato da almeno due firmatari prima dell'avvio

Questa è una soluzione di riserva, non un'opzione predefinita. Durante il transito gli asset si trovano al di fuori del controllo multisig e al di fuori del registro on-chain da cui dipende la trasparenza del fondo. I limiti sono ciò che rende quella finestra abbastanza stretta da essere accettabile.

---

## 5. Asset ammissibili

Il fondo può detenere solo quanto segue. Qualsiasi altra cosa richiede un voto della DAO.

**Consentiti**

- **Bitcoin**, detenuto nativamente
- **Stablecoin garantite da fiat** di emittenti che pubblicano attestazioni di riserva — attualmente USDT, USDC, USDS
- **hGRAM**
- **HPO**, solo al saldo esistente — Sezione 8
- **Depositi in protocolli di lending blue-chip** che soddisfano tutti i seguenti requisiti: almeno $1 miliardo di TVL, tre o più audit indipendenti, 24 o più mesi di operatività senza perdite non recuperate di fondi degli utenti, e prelievo diretto ai sensi della Sezione 5.2
- **Saldi nativi per il gas** in importi operativamente necessari

**Non consentiti**

- Leva, prestiti, margine, o qualsiasi posizione che possa essere liquidata
- Futures perpetui, opzioni, o qualsiasi derivato
- Market making, fornitura di liquidità, o vault che assumono la controparte delle posizioni dei trader
- **Dollari sintetici la cui garanzia è una posizione in derivati.** L'USDe di Ethena è stato valutato ed escluso: il suo rendimento deriva da funding rate su perpetui piuttosto che da riserve, le sue posizioni short si trovano su exchange centralizzati, il suo fondo di riserva è pari a circa l'1 % dell'offerta, e il suo periodo di blocco di 7 giorni per l'unstaking è in conflitto con la Sezione 9. Non offriva alcun premio di rendimento rispetto al lending in stablecoin blue-chip al momento della valutazione. È un'operazione di basis trade, non un asset di preservazione del capitale, e classificarlo come tale travisarebbe il rischio del fondo.
- Qualsiasi token con un volume di scambi nelle 24 ore inferiore a $10 milioni, esclusa la posizione esistente in HPO
- Acquisti di HPO per detenerlo — Sezione 8

### 5.1 Rischio di congelamento, e la soglia che lo gestisce

Gran parte di ciò che questo fondo detiene è una pretesa nei confronti di un'azienda, e gli emittenti di stablecoin e di asset tokenizzati possono congelare un wallet specifico. Questo non è un motivo per evitare tali asset — non esiste un'alternativa senza permesso su scala per un potere d'acquisto stabile — ma è un rischio da dimensionare, non da ignorare.

- **Nessun singolo emittente congelabile può superare il 30 % del fondo.**
- **Almeno il 20 % del fondo è detenuto in asset che nessun emittente, custode o autorità può congelare con un'azione unilaterale.** Bitcoin è attualmente l'unica posizione che soddisfa questo requisito.

### 5.2 Prelievo diretto

Ogni posizione deve essere prelevabile direttamente dallo smart contract, senza il permesso di alcun operatore, interfaccia o intermediario. Prima che il capitale venga impiegato in un nuovo protocollo, i firmatari verificano che il prelievo funzioni tramite interazione diretta con il contratto, indipendentemente dal front end del protocollo.

Un protocollo che può bloccare, sospendere o condizionare il prelievo a discrezione di un operatore non è ammissibile, a prescindere dal rendimento. Per un fondo senza una fonte impegnata di nuovo capitale, capitale che non può essere recuperato è una perdita permanente.

### 5.3 Ampliare l'universo man mano che il fondo cresce

L'elenco sopra è ristretto perché il fondo è piccolo: ogni posizione aggiuntiva costa lo stesso impegno di impostazione, monitoraggio e rendicontazione di una grande, pur contribuendo un rendimento troppo piccolo per contare. Questo cambia man mano che il fondo cresce.

| Dimensione del fondo, sostenuta per due report consecutivi | Cosa diventa disponibile                                                            |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Sotto $250.000                                             | L'elenco sopra                                                                      |
| $250.000+                                                  | La DAO può aggiungere **una** ulteriore classe di asset, limitata al 10 % del fondo |
| $500.000+                                                  | Un comparto opportunistico fino al 10 % del fondo, entro i divieti sopra indicati   |

Ogni ampliamento richiede un voto della DAO. Raggiungere una soglia rende possibile un'aggiunta, non automatica.

---

## 6. Allocazione obiettivo

La posizione in HPO è esclusa dall'allocazione obiettivo. Non può essere incrementata e non può essere scambiata in size, quindi includerla costringerebbe ogni altro comparto a ribilanciarsi attorno a un numero su cui il fondo non può agire.

**Posizione non discrezionale**

|     |                                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| HPO | 9.023.524,44, detenuto. Nessun acquisto per detenerlo. Riduzioni solo ai sensi della Sezione 8. **Tetto di riferimento 25 % del fondo.** |

**Portafoglio discrezionale** — tutto il resto:

| Comparto                            | Obiettivo | Banda   | Finalità                                                                                     |
| ----------------------------------- | --------- | ------- | -------------------------------------------------------------------------------------------- |
| Rendimento da stablecoin, impiegato | 45 %      | 35–55 % | Preservazione del capitale e reddito del fondo                                               |
| **Riserva Opportunità**             | 10 %      | 5–15 %  | Capitale non impiegato per grandi ribassi — Sezione 6.1                                      |
| Bitcoin                             | 30 %      | 20–35 % | Riserva di valore a lungo termine; l'asset del fondo non congelabile e fuori dall'ecosistema |
| hGRAM                               | 12 %      | 8–18 %  | Allineamento con Hipo, più rendimento da staking                                             |
| Liquidità operativa e gas           | 3 %       | 2–6 %   | Costi di transazione, cuscinetto                                                             |

**Su hGRAM.** Il suo rendimento è denominato in GRAM, quindi la posizione è una posizione direzionale in GRAM con un rendimento associato piuttosto che un asset di reddito. Parte della ragione per detenerlo è l'allineamento con il protocollo a cui il fondo appartiene, che è una motivazione legittima. Presentarlo come reddito non lo sarebbe.

**Su Bitcoin.** Non si assume alcun rendimento e non dovrebbe essercene. È dimensionato in modo che un calo del 70 % — che Bitcoin ha già registrato in passato — costi al fondo circa il 16 % del suo valore. Dimensionato sulla tolleranza al ribasso, non sulla convinzione.

**Ingresso.** Le nuove posizioni in Bitcoin vengono costruite in tranche settimanali di pari importo per non meno di otto settimane. Una regola, non una view di mercato.

### 6.1 La Riserva Opportunità

Il fondo detiene il 10 % del proprio portafoglio discrezionale in stablecoin, non impiegate o in rendimento liquido nella stessa giornata, per acquistare durante ribassi severi. Si attiva **solo su un trigger oggettivo**, in terzi, in asset già presenti nell'elenco ammissibile:

| Trigger                                                | Attiva          |
| ------------------------------------------------------ | --------------- |
| Bitcoin 40 % sotto il suo massimo degli ultimi 12 mesi | Un terzo        |
| Bitcoin 55 % sotto il suo massimo degli ultimi 12 mesi | Un terzo        |
| Bitcoin 70 % sotto il suo massimo degli ultimi 12 mesi | Il terzo finale |

Il massimo mobile utilizza la serie delle chiusure giornaliere della fonte di prezzo pubblicata dal fondo. Una volta attivata, la Riserva viene ricostituita dal comparto in stablecoin nei quattro trimestri successivi.

**Nessun impiego discrezionale.** Se il trigger non è scattato, il capitale resta dov'è. Il punto di un trigger scritto è prendere la decisione in anticipo, quando è facile, piuttosto che durante le condizioni che la rendono difficile.

---

## 7. Limiti di concentrazione e di rischio

Misurati rispetto al valore totale del fondo, verificati a ogni report trimestrale.

| Limite                                                             | Soglia                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Qualsiasi singolo protocollo                                       | ≤ 30 % del fondo                                           |
| Qualsiasi singolo emittente di stablecoin                          | ≤ 30 % del fondo                                           |
| Qualsiasi singolo emittente congelabile, tutti gli asset combinati | ≤ 30 % del fondo                                           |
| Asset che nessun emittente può congelare                           | **≥ 20 % del fondo**                                       |
| Qualsiasi singola posizione diversa da HPO                         | ≤ 35 % del fondo                                           |
| HPO                                                                | ≤ 25 % del fondo (riferimento — Sezione 8)                 |
| Asset fuori dalla custodia multisig                                | **0 %**, tranne che in transito ai sensi della Sezione 4.1 |
| Asset dell'ecosistema TON (HPO + hGRAM + GRAM)                     | ≤ 45 % del fondo                                           |
| Leva finanziaria                                                   | Zero, in ogni momento                                      |

Il limite su TON è la linea più importante di questo documento. Il reddito del fondo proviene da Hipo, il suo finanziamento proviene da Hipo, e parte dei suoi asset sono i token di Hipo stessi. Una tesoreria concentrata nel proprio ecosistema non attutisce un anno difficile per quell'ecosistema — lo amplifica. Il limite mantiene il fondo utile proprio quando serve di più.

Se un limite viene superato per effetto di un movimento di mercato e non di una transazione, il fondo ha un trimestre per rientrare, e lo sconfinamento viene comunicato nel report di quel trimestre.

---

## 8. Politica su HPO

**Il fondo non acquista HPO per detenerlo.** La posizione del fondo è già ampia rispetto alla liquidità di mercato di HPO, e aumentarla convertirebbe capitale liquido in una posizione che il fondo non può liquidare a un valore vicino a quello contabilizzato. Il compito del fondo è far crescere asset che possono essere impiegati, non accumulare il proprio token.

**Acquistare HPO da bruciare è un'azione diversa ed è consentita.** Ai sensi della Sezione 2.2 il fondo può acquistare HPO sul mercato e distruggerlo come una delle due forme di ritorno di valore a chi lo detiene. I token escono dalla circolazione invece di entrare nel bilancio del fondo, ed è finanziato solo dai guadagni sopra l'high-water mark — mai dal capitale.

**Riduzione della posizione esistente.** Gli HPO del fondo sono detenuti. È la partecipazione del fondo nel proprio protocollo, e non esiste un modo per uscirne in size sul mercato aperto.

Se mai venisse ridotta, ciò avviene solo tramite una vendita OTC a un acquirente strategico o una vendita strutturata approvata con voto della DAO. **Il fondo non vende HPO sul mercato aperto, a nessuna dimensione.** Entrambe le vie richiedono tutti i seguenti elementi:

- **Un voto della DAO** che approvi la vendita prima dell'esecuzione
- **L'uso dei proventi indicato nella proposta** — chi detiene HPO vota su cosa succede al denaro, non solo su se i token vengono venduti
- **Piena divulgazione al completamento**, incluse dimensione, prezzo e qualsiasi condizione associata alla vendita

Chi detiene HPO ha finanziato il capitale che ha acquistato questa posizione. Il voto e i requisiti di divulgazione sono ciò che garantisce che qualsiasi vendita avvenga a condizioni che essi abbiano visto e approvato in anticipo.

Il tetto del 25 % nella Sezione 7 è un livello di riferimento, non una vendita forzata. Se HPO si apprezza oltre tale livello, il fondo comunica lo sconfinamento e la DAO decide se agire.

---

## 9. Liquidità

- Almeno il **35 % del fondo** convertibile in stablecoin entro 7 giorni senza perdita rilevante
- Non più del **10 % del fondo** in posizioni con un vincolo superiore a 7 giorni
- Nessuna posizione che il fondo non potrebbe liquidare entro 30 giorni, ad eccezione di HPO, indicata come illiquida in ogni report

---

## 10. Ribilanciamento

- **Rivisto trimestralmente**, insieme al report
- Ribilanciato quando un comparto si muove **fuori dalla propria banda**, non a calendario — i costi di transazione sono reali per un fondo di questa dimensione
- Riportato al punto medio dell'obiettivo, eseguito in un periodo commisurato alla dimensione
- Qualsiasi operazione di ribilanciamento superiore a $10.000 annunciata entro 7 giorni

**Il ribilanciamento è il modo in cui questo fondo compra ai minimi e vende ai massimi.** Quando Bitcoin scende sotto la propria banda, la regola impone di comprare. Quando sale sopra, la regola impone di ridurre. La decisione viene presa in anticipo ed eseguita meccanicamente.

**Il fondo non tenta di individuare massimi o minimi di mercato.** Nessuna posizione viene aperta, chiusa o ridimensionata sulla base di una previsione o del sentiment. Agire su una previsione di mercato richiede avere ragione due volte — sull'uscita e sul rientro — con un processo di firma 2 su 3 che non può muoversi a quella velocità. Le bande e la Riserva Opportunità catturano la stessa intenzione attraverso regole che possono essere effettivamente eseguite.

---

## 11. Rendicontazione

- Un **report completo ogni trimestre**, generato da un singolo blocco on-chain da [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs), che elenca il blocco, i tassi di cambio e ogni prezzo utilizzato, così che chiunque lo legga possa riprodurlo
- Ogni report include: l'allocazione rispetto agli obiettivi della Sezione 6, ogni limite della Sezione 7 con il suo valore attuale, **la performance dall'avvio secondo il Modified Dietz**, un benchmark, il valore del fondo come quota della capitalizzazione di mercato di HPO, e ogni transazione superiore a $10.000
- I conferimenti registrati con il blocco e il prezzo al momento della ricezione
- Gli sconfinamenti dai limiti comunicati indipendentemente dal fatto che siano stati corretti
- I report pubblicati secondo il calendario indipendentemente da cosa dicano i numeri

**Valorizzazione.** GRAM e Bitcoin al prezzo di mercato da un aggregatore pubblicato. hGRAM al tasso di riscatto del protocollo — quanto il fondo riceverebbe ritirando dallo staking. HPO su CoinGecko, verificato incrociando la capitalizzazione di mercato pubblicata da Hipo; le quotazioni DEX di pool poco profonde sono escluse. Le stablecoin a 1,0000 per convenzione.

---

## 12. Revisione e modifica

- Rivista **annualmente**, o prima in caso di cambiamento rilevante — un grande afflusso, un nuovo flusso di ricavi, o uno sconfinamento da un limite che non può essere corretto entro un trimestre
- Le modifiche richiedono un **voto della DAO**
- Ogni versione viene pubblicata; le versioni superate restano online con le loro date

---

## 13. Questioni aperte note

- **Il fondo non ha una fonte impegnata di nuovo capitale.** Le ricompense di staking di hGRAM sono attualmente la sua unica fonte di reddito attiva. Accordi OTC e il ripristino dei ricavi del protocollo sono entrambi possibili; questa politica non presuppone nessuno dei due.
- **Il valore della posizione in HPO è una valorizzazione contabile, non un prezzo.** Ogni report lo dichiara e continuerà a farlo.
- **Gli HPO del fondo non generano alcun reddito** finché la commissione di staking del protocollo è dello 0 %. Ripristinare una commissione è una decisione separata, ma le due cose interagiscono: darebbe un rendimento alla posizione più grande del fondo riducendo al contempo il rendimento dei suoi hGRAM.

---

## 14. Compenso del gestore

**Nessuno viene pagato per gestire Hipo Fund. Non c'è alcuna commissione di gestione né alcuna commissione di performance.**

Questo viene reso pubblico anziché lasciato non dichiarato, perché l'assenza di una commissione è essa stessa una politica, e definire in anticipo le condizioni per riaprire la questione evita che una proposta non strutturata arrivi in seguito.

Norges Bank Investment Management, che gestisce il fondo sovrano su cui Hipo Fund è modellato, riceve un budget di costi rimborsato fino a un limite annuo fissato dal Ministero delle Finanze — non una quota dei guadagni. I suoi costi di gestione sono stati dello 0,034 % degli asset nel 2024. Le commissioni legate alla performance lì si applicano ai gestori esterni, non al gestore del fondo stesso.

Anche due elementi giocano contro una commissione qui. Una commissione di performance dà al gestore il rialzo senza il ribasso, il che è l'incentivo sbagliato per un piccolo fondo con un mandato di preservazione del capitale. E l'allineamento esiste già in una forma migliore: i firmatari detengono HPO, quindi se il fondo cresce in modo composto, la copertura patrimoniale di HPO si rafforza — un'esposizione all'intero risultato, incluso il ribasso.

**Se la questione viene riaperta**, richiede un voto della DAO e può essere proposta solo quando il fondo è sopra i **$500.000**, al di sopra del proprio high-water mark, e ha mantenuto entrambe le condizioni per **due report trimestrali consecutivi**. Qualsiasi proposta deve includere: solo una commissione di performance e nessuna commissione di gestione; un high-water mark rigido; un hurdle rate superiore a un benchmark di rendimento da stablecoin; pagamento in HPO bloccato per almeno 12 mesi; e un tetto annuo espresso come percentuale degli asset.

**Se gestire il fondo dovesse mai richiedere tempo retribuito**, viene pagato dal budget operativo di Hipo come un ruolo definito con un costo fisso — non dal fondo, e non come quota dei rendimenti. Questo mantiene il compenso separato dai risultati dell'investimento, che è ciò che richiede un mandato di preservazione del capitale.
