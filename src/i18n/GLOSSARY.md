# Translation glossary

Shared reference for everyone translating hipo.finance — the English catalogs (`src/i18n/en/*.json`), the
`prose` collection (`src/content/prose/en/`), the docs (`src/content/docs/`) and the docs sidebar labels
(`src/i18n/en/docs-sidebar.json`). Translations are drafted LLM-assisted from the English source plus this
file, then reviewed by a native speaker; review state lives in `src/i18n/<locale>/meta.json` and is
maintained by `scripts/check-i18n.mjs` (spec: `specs/multi-language-site.md` §I, decisions 2, 5, 9, 10).
English is the source of truth; when this file and a translator's instinct disagree, follow this file and
note the disagreement in the PR so the locale's reviewer can settle it.

## Do not translate

Keep these exactly as written, in Latin script, in every locale. Never transliterate them (no «هیپو»,
no «Гипо», no «हिपो») and never inflect them inside the Latin word — put case endings, plural markers and
ezafe outside it («توکن‌های HPO», «в сети TON», «HPO टोकन»). In RTL text (fa, later ar) always keep them
Latin and isolate them with a plain space on both sides; never attach Persian letters, ZWNJ or punctuation
directly to a Latin word, and never add Persian plural suffixes to a ticker.

| term                                                                                                    | notes                                                                                       |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hipo                                                                                                    | the protocol / brand                                                                        |
| GRAM                                                                                                    | the TON network's native coin as named on hipo.finance (formerly "TON" / "Toncoin")         |
| hGRAM                                                                                                   | Hipo's liquid staking token (formerly "hTON"); unit stays after the number: `۱٬۲۳۴٫۵ hGRAM` |
| HPO                                                                                                     | Hipo governance and profit-sharing token                                                    |
| TON                                                                                                     | the blockchain name ("TON blockchain", "TON DeFi")                                          |
| TVL, APY, APR, USD                                                                                      | acronyms, keep Latin; gloss once in prose if the language customarily does                  |
| DeFi, DAO, DEX, NFT, SBT, MCP, JSON, API, SDK, URL                                                      | acronyms, keep Latin                                                                        |
| TonConnect                                                                                              | wallet connection protocol name                                                             |
| Tonkeeper, MyTonWallet, Tonhub, Wallet (Telegram), OpenMask, DeDust, STON.fi, TONCO, swap.coffee, Evaa  | wallet and DeFi product names                                                               |
| Telegram, GitHub, Dune, Grafana, YouTube, CoinGecko, CoinMarketCap, Tonviewer, Quantstamp               | third-party product and company names (including audit firms)                               |
| Hipo Gang, Hipo Club, Hipo Fund, Hipo Stats, Hipo MCP Server                                            | programme/product names; a translated gloss in parentheses on first use in prose is fine    |
| URLs, addresses, tx hashes, contract names (`Treasury`, `Parent`, `Wallet`, `Bill`), code, CLI commands | never transformed; `ready_to_burn`-style identifiers and JSON keys are code, not copy       |

## Terminology

One rendering per locale, used consistently across catalogs, prose and docs. Renderings follow what a
crypto-literate native user already sees in wallets and exchanges: transliterate established jargon, translate
plain words. "T" in the note column = keep transliterated, "X" = translate, "L" = keep Latin. Add rows as new
recurring terms appear; change a rendering only together with a sweep of the whole locale.

| English                          | fa                            | ru                                   | hi                                       | note                                                                                            |
| -------------------------------- | ----------------------------- | ------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| liquid staking                   | استیکینگ نقدشونده             | ликвидный стейкинг                   | लिक्विड स्टेकिंग                         | fa: X+T (not «لیکوئید استیکینگ»); ru/hi: T                                                      |
| staking (noun)                   | استیکینگ                      | стейкинг                             | स्टेकिंग                                 | T everywhere                                                                                    |
| stake (verb)                     | استیک کردن                    | стейкать / застейкать (perfective)   | स्टेक करना                               | T; fa compound verb with کردن                                                                   |
| Stake (CTA / button)             | استیک                         | Стейкать                             | स्टेक करें                               | imperative, short; ru: not «Стейк» (reads as noun)                                              |
| unstake (verb)                   | آن‌استیک کردن                 | вывести из стейкинга / анстейкнуть   | अनस्टेक करना                             | fa/hi: T; ru prose uses the long form, UI the short one                                         |
| Unstake (CTA / button)           | آن‌استیک                      | Анстейк                              | अनस्टेक करें                             | fa with ZWNJ after آن; ru short form on buttons only                                            |
| staked (state: "10 GRAM staked") | استیک‌شده                     | в стейкинге                          | स्टेक किया हुआ                           | ru: "10 GRAM в стейкинге"                                                                       |
| staker                           | استیک‌کننده                   | стейкер                              | स्टेकर                                   | fa: X (agent noun); ru/hi: T                                                                    |
| validator                        | ولیدیتور                      | валидатор                            | वैलिडेटर                                 | T everywhere; fa not «اعتبارسنج» (unfamiliar to crypto users)                                   |
| borrower                         | وام‌گیرنده                    | заёмщик                              | उधारकर्ता                                | X; a validator that borrows from the treasury                                                   |
| loan (validation loan)           | وام                           | заём                                 | लोन                                      | fa/ru: X; hi: T (लोन is the everyday word)                                                      |
| round / validation round         | دور / دور اعتبارسنجی          | раунд / раунд валидации              | राउंड / वैलिडेशन राउंड                   | fa: X; "next round" = دور بعد / следующий раунд / अगला राउंड                                    |
| election / election round        | انتخابات / دور انتخابات       | выборы / раунд выборов               | इलेक्शन / इलेक्शन राउंड                  | TON elector's validator election                                                                |
| reward / rewards                 | پاداش / پاداش‌ها              | награда / награды                    | रिवॉर्ड / रिवॉर्ड्स                      | fa/ru: X (not «ریوارد», not «вознаграждение»); hi: T                                            |
| staking rewards                  | پاداش استیکینگ                | награды за стейкинг                  | स्टेकिंग रिवॉर्ड्स                       | also the `/rewards/` page title: پاداش‌ها / Награды / रिवॉर्ड्स                                 |
| yearly reward rate / APY         | نرخ پاداش سالانه (APY)        | годовая доходность (APY)             | वार्षिक रिवॉर्ड दर (APY)                 | keep APY Latin; write the phrase out once per page                                              |
| staking fee                      | کارمزد استیکینگ               | комиссия за стейкинг                 | स्टेकिंग शुल्क                           | X; Hipo's cut of rewards (currently 0%)                                                         |
| protocol fee                     | کارمزد پروتکل                 | комиссия протокола                   | प्रोटोकॉल शुल्क                          | X                                                                                               |
| network fee / gas                | کارمزد شبکه                   | комиссия сети                        | नेटवर्क शुल्क                            | X; "gas" → همان کارمزد شبکه / газ / गैस only when quoting the term                              |
| treasury                         | خزانه                         | казна                                | ट्रेज़री                                 | fa/ru: X; hi: T; the contract name `Treasury` stays Latin in code/addresses                     |
| exchange rate / rate             | نرخ تبدیل / نرخ               | курс обмена / курс                   | विनिमय दर / दर                           | X; "1 hGRAM = ~ 1.05 GRAM" keeps the formula, digits localised                                  |
| Full (unstake option)            | کامل                          | Полный                               | पूर्ण                                    | X; = best-rate unstake, settled after the round; the default                                    |
| best rate                        | بهترین نرخ                    | лучший курс                          | सर्वोत्तम दर                             | X; explanatory line under "Full"                                                                |
| Instant (unstake option)         | آنی                           | Мгновенный                           | तुरंत                                    | X; paid now from free liquidity at a slightly lower rate                                        |
| withdrawal / withdraw            | برداشت / برداشت کردن          | вывод / вывести                      | निकासी / निकालें                         | X                                                                                               |
| deposit (verb)                   | واریز کردن                    | внести                               | जमा करना                                 | X                                                                                               |
| wallet                           | کیف پول                       | кошелёк                              | वॉलेट                                    | fa/ru: X; hi: T; "wallet app" = اپ کیف پول / приложение кошелька / वॉलेट ऐप                     |
| Connect wallet                   | اتصال کیف پول                 | Подключить кошелёк                   | वॉलेट कनेक्ट करें                        | hi: T (कनेक्ट, not जोड़ें)                                                                      |
| Disconnect (wallet)              | قطع اتصال                     | Отключить                            | डिस्कनेक्ट करें                          |                                                                                                 |
| balance                          | موجودی                        | баланс                               | बैलेंस                                   | fa: X; ru/hi: T                                                                                 |
| amount                           | مقدار                         | сумма                                | राशि                                     | X; input placeholder too                                                                        |
| Max (button)                     | حداکثر                        | Макс.                                | अधिकतम                                   | X; fills the input with the full balance                                                        |
| receive                          | دریافت / دریافت کردن          | получить                             | प्राप्त करें                             | X; "You will receive" = دریافت می‌کنید / Вы получите / आपको मिलेगा                              |
| swap                             | سواپ                          | обмен / обменять                     | स्वैप                                    | fa/hi: T; ru: X                                                                                 |
| liquidity                        | نقدینگی                       | ликвидность                          | लिक्विडिटी                               | fa/ru: X; hi: T                                                                                 |
| transaction                      | تراکنش                        | транзакция                           | ट्रांज़ैक्शन                             | fa: X; ru/hi: T                                                                                 |
| confirm / Confirm in wallet      | تأیید / در کیف پول تأیید کنید | подтвердить / Подтвердите в кошельке | पुष्टि करें / वॉलेट में पुष्टि करें      | X                                                                                               |
| pending                          | در انتظار                     | в обработке                          | लंबित                                    | X; tx state                                                                                     |
| confirmed / failed               | تأییدشده / ناموفق             | подтверждена / не удалась            | पुष्ट / विफल                             | X; tx states                                                                                    |
| estimated time                   | زمان تقریبی                   | примерное время                      | अनुमानित समय                             | X; "Receive GRAM in {remain}"                                                                   |
| governance                       | حاکمیت                        | управление (протоколом)              | गवर्नेंस                                 | fa/ru: X; hi: T                                                                                 |
| proposal                         | پیشنهاد                       | предложение                          | प्रस्ताव                                 | X; DAO proposal                                                                                 |
| vote (verb / noun)               | رأی دادن / رأی                | голосовать / голос                   | वोट करें / वोट                           | fa/ru: X; hi: T                                                                                 |
| profit sharing                   | تقسیم سود                     | распределение прибыли                | प्रॉफ़िट शेयरिंग                         | fa/ru: X; hi: T                                                                                 |
| token                            | توکن                          | токен                                | टोकन                                     | T everywhere                                                                                    |
| jetton                           | جتون                          | жетон                                | जेटन                                     | T; TON's fungible token standard, explain once                                                  |
| NFT                              | NFT                           | NFT                                  | NFT                                      | L; fa plural «NFTها» with the Latin word isolated                                               |
| certificate (staking/unstaking)  | گواهی استیک / گواهی آن‌استیک  | сертификат стейкинга / анстейка      | स्टेकिंग प्रमाणपत्र / अनस्टेक प्रमाणपत्र | X; the `Bill` SBT shown in wallets while an unstake waits                                       |
| mainnet                          | شبکه اصلی (مین‌نت)            | основная сеть (мейннет)              | मेननेट                                   | fa/ru: X with T gloss on first use; hi: T                                                       |
| explorer (blockchain)            | اکسپلورر                      | эксплорер                            | एक्सप्लोरर                               | T everywhere; "Treasury on explorer"                                                            |
| smart contract                   | قرارداد هوشمند                | смарт-контракт                       | स्मार्ट कॉन्ट्रैक्ट                      | fa: X; ru/hi: T                                                                                 |
| audit (security audit)           | حسابرسی امنیتی                | аудит                                | ऑडिट                                     | fa: X (short form «حسابرسی» after first use); ru/hi: T                                          |
| open-source                      | متن‌باز                       | с открытым исходным кодом            | ओपन-सोर्स                                | fa/ru: X; hi: T                                                                                 |
| security                         | امنیت                         | безопасность                         | सुरक्षा                                  | X                                                                                               |
| phishing                         | فیشینگ                        | фишинг                               | फ़िशिंग                                  | T                                                                                               |
| multisig (wallet)                | کیف پول چندامضایی (مولتی‌سیگ) | мультисиг                            | मल्टीसिग                                 | fa: X with T gloss; ru/hi: T                                                                    |
| cold wallet                      | کیف پول سرد                   | холодный кошелёк                     | कोल्ड वॉलेट                              | fa/ru: X; hi: T                                                                                 |
| Telegram Mini App                | مینی‌اپ تلگرام                | мини-приложение Telegram             | Telegram मिनी ऐप                         | Telegram itself stays Latin except fa, where «تلگرام» is the established name                   |
| docs / documentation             | مستندات                       | документация                         | दस्तावेज़                                | X; nav label "Docs" = مستندات / Документация / डॉक्स                                            |
| FAQ                              | سؤالات متداول                 | FAQ                                  | FAQ                                      | fa: X; ru/hi: L (headings may spell out Часто задаваемые вопросы / अक्सर पूछे जाने वाले प्रश्न) |
| support                          | پشتیبانی                      | поддержка                            | सहायता                                   | X                                                                                               |
| community                        | جامعه                         | сообщество                           | समुदाय                                   | X; "Hipo community" = جامعه Hipo / сообщество Hipo / Hipo समुदाय                                |
| giveaway                         | هدیه (گیوای)                  | розыгрыш                             | गिवअवे                                   | fa: X, T gloss once; ru: X; hi: T                                                               |
| prize                            | جایزه                         | приз                                 | पुरस्कार                                 | X; sidebar "Giveaways & Prizes" = هدایا و جوایز                                                 |
| ambassador                       | سفیر                          | амбассадор                           | एंबेसडर                                  | fa: X; ru/hi: T                                                                                 |
| tokenomics                       | توکنومیکس                     | токеномика                           | टोकनॉमिक्स                               | T                                                                                               |
| allocation                       | تخصیص                         | распределение                        | आवंटन                                    | X                                                                                               |
| vesting                          | وستینگ (آزادسازی تدریجی)      | вестинг                              | वेस्टिंग                                 | T; fa adds the X gloss on first use                                                             |
| burn / burned                    | سوزاندن / سوزانده‌شده         | сжигание / сожжено                   | बर्न / बर्न किया गया                     | fa/ru: X; hi: T                                                                                 |
| circulating supply               | عرضه در گردش                  | в обращении                          | सर्कुलेटिंग सप्लाई                       | fa/ru: X; hi: T                                                                                 |
| total / fixed supply             | عرضه کل / عرضه ثابت           | общее / фиксированное предложение    | कुल / निश्चित सप्लाई                     | X                                                                                               |
| market cap                       | ارزش بازار                    | капитализация                        | मार्केट कैप                              | fa/ru: X; hi: T                                                                                 |
| volume (24h)                     | حجم معاملات (۲۴ ساعت)         | объём (24 ч)                         | वॉल्यूम (24 घंटे)                        | fa/ru: X; hi: T                                                                                 |
| holders                          | دارندگان                      | держатели                            | होल्डर्स                                 | fa/ru: X; hi: T                                                                                 |
| dashboard                        | داشبورد                       | дашборд                              | डैशबोर्ड                                 | T                                                                                               |
| chart                            | نمودار                        | график                               | चार्ट                                    | fa/ru: X; hi: T                                                                                 |
| range (24H / 1W / 1M / 1Y)       | بازه                          | период                               | अवधि                                     | X; the short codes 24H/1W/1M/3M/1Y stay Latin in every locale                                   |
| Coming soon                      | به‌زودی                       | Скоро                                | जल्द आ रहा है                            | X                                                                                               |
| error                            | خطا                           | ошибка                               | त्रुटि                                   | X                                                                                               |
| warning                          | هشدار                         | предупреждение                       | चेतावनी                                  | X                                                                                               |
| Insufficient funds               | موجودی کافی نیست              | Недостаточно средств                 | अपर्याप्त राशि                           | X                                                                                               |
| Retry / Try again                | تلاش دوباره                   | Повторить                            | फिर कोशिश करें                           | X                                                                                               |
| Loading…                         | در حال بارگذاری…              | Загрузка…                            | लोड हो रहा है…                           | X; keep the ellipsis character                                                                  |

## Terminology — second batch (ar, de, it, tr, id, pt-br)

The same English terms as the table above, for the six locales added in the 2026-08-24 sync. The note column
of the first table still applies (T = keep transliterated, X = translate, L = keep Latin); where a locale
keeps the English word, that is the deliberate rendering, not an omission. Two-form cells (`reward / rewards`)
keep the same order and separator as the English.

| English                          | ar                                    | de                                                | it                                                      | tr                                        | id                                      | pt-br                                                                                |
| -------------------------------- | ------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| liquid staking                   | ستاكينغ سائل                          | Liquid Staking                                    | lo staking liquido (m.)                                 | likit staking                             | liquid staking                          | staking líquido (o staking líquido)                                                  |
| staking (noun)                   | ستاكينغ                               | das Staking                                       | lo staking (m., inv.)                                   | staking                                   | staking                                 | staking (o staking)                                                                  |
| stake (verb)                     | إيداع في الستاكينغ                    | staken                                            | fare staking                                            | stake etmek                               | men-stake                               | fazer staking (de)                                                                   |
| Stake (CTA / button)             | ستاكينغ                               | Staken                                            | Fai staking                                             | Stake et                                  | Stake                                   | Fazer staking                                                                        |
| unstake (verb)                   | إلغاء الستاكينغ                       | unstaken                                          | ritirare dallo staking / fare unstaking                 | stake'ten çıkarmak                        | meng-unstake                            | fazer unstake (de) / retirar do staking                                              |
| Unstake (CTA / button)           | إلغاء الستاكينغ                       | Unstaken                                          | Fai unstaking                                           | Unstake et                                | Unstake                                 | Fazer unstake                                                                        |
| staked (state: "10 GRAM staked") | في الستاكينغ                          | im Staking                                        | in staking ("10 GRAM in staking")                       | stake edilmiş                             | di-stake                                | em staking ("10 GRAM em staking")                                                    |
| staker                           | المشارك في الستاكينغ                  | der Staker                                        | lo staker (m., pl. gli staker)                          | staker                                    | staker                                  | staker (o staker, os stakers)                                                        |
| validator                        | فاليديتور                             | der Validator                                     | il validatore                                           | validatör                                 | validator                               | validador (o validador)                                                              |
| borrower                         | مقترض                                 | der Kreditnehmer                                  | il mutuatario                                           | borç alan                                 | peminjam                                | tomador do empréstimo (o tomador)                                                    |
| loan (validation loan)           | قرض                                   | der Kredit                                        | il prestito (di validazione)                            | kredi                                     | pinjaman                                | empréstimo (o empréstimo de validação)                                               |
| round / validation round         | جولة / جولة التحقق                    | die Runde / die Validierungsrunde                 | il round / il round di validazione                      | tur / doğrulama turu                      | putaran / putaran validasi              | rodada / rodada de validação (a rodada; "next round" = próxima rodada)               |
| election / election round        | انتخابات / جولة الانتخابات            | die Wahl / die Wahlrunde                          | le elezioni / il round di elezione                      | seçim / seçim turu                        | pemilihan / putaran pemilihan           | eleição / rodada de eleição (a eleição de validadores da TON)                        |
| reward / rewards                 | مكافأة / مكافآت                       | der Reward / die Rewards                          | la ricompensa / le ricompense                           | ödül / ödüller                            | imbalan                                 | recompensa / recompensas (a recompensa)                                              |
| staking rewards                  | مكافآت الستاكينغ                      | die Staking-Rewards                               | le ricompense di staking                                | staking ödülleri                          | imbalan staking                         | recompensas de staking (página /rewards/ = Recompensas)                              |
| yearly reward rate / APY         | معدل المكافأة السنوي (APY)            | jährliche Rendite (APY)                           | il tasso di ricompensa annuo (APY)                      | yıllık ödül oranı (APY)                   | tingkat imbalan tahunan (APY)           | taxa anual de recompensas (APY)                                                      |
| staking fee                      | رسوم الستاكينغ                        | die Staking-Gebühr                                | la commissione di staking                               | staking komisyonu                         | biaya staking                           | taxa de staking (a taxa)                                                             |
| protocol fee                     | رسوم البروتوكول                       | die Protokollgebühr                               | la commissione di protocollo                            | protokol komisyonu                        | biaya protokol                          | taxa do protocolo                                                                    |
| network fee / gas                | رسوم الشبكة / الغاز                   | die Netzwerkgebühr / Gas                          | la commissione di rete                                  | ağ ücreti                                 | biaya jaringan                          | taxa de rede (gas só ao citar o termo: "gas")                                        |
| treasury                         | الخزينة                               | die Treasury                                      | la tesoreria                                            | hazine                                    | treasury                                | tesouraria (a tesouraria; contrato `Treasury` fica em latim)                         |
| exchange rate / rate             | سعر الصرف / السعر                     | der Wechselkurs / der Kurs                        | il tasso di cambio / il tasso                           | dönüşüm oranı / oran                      | nilai tukar / kurs                      | taxa de conversão / taxa (escrever por extenso quando "taxa" puder soar como tarifa) |
| Full (unstake option)            | كامل                                  | Vollständig                                       | Completo                                                | Tam                                       | Penuh                                   | Completo                                                                             |
| best rate                        | أفضل سعر                              | bester Kurs                                       | il tasso migliore                                       | en iyi oran                               | kurs terbaik                            | melhor taxa de conversão                                                             |
| Instant (unstake option)         | فوري                                  | Sofort                                            | Istantaneo                                              | Anında                                    | Instan                                  | Instantâneo                                                                          |
| withdrawal / withdraw            | سحب / تسحب                            | die Auszahlung / auszahlen                        | il prelievo / prelevare                                 | çekim / çekmek                            | penarikan / menarik                     | saque / sacar (o saque)                                                              |
| deposit (verb)                   | إيداع                                 | einzahlen                                         | depositare                                              | yatırmak                                  | menyetor                                | depositar                                                                            |
| wallet                           | محفظة                                 | die Wallet                                        | il wallet (m., pl. i wallet)                            | cüzdan                                    | dompet                                  | carteira (a carteira; "wallet app" = app de carteira)                                |
| Connect wallet                   | ربط المحفظة                           | Wallet verbinden                                  | Connetti il wallet                                      | Cüzdanı bağla                             | Hubungkan dompet                        | Conectar carteira                                                                    |
| Disconnect (wallet)              | فصل الاتصال                           | Trennen                                           | Disconnetti                                             | Bağlantıyı kes                            | Putuskan koneksi                        | Desconectar                                                                          |
| balance                          | الرصيد                                | das Guthaben                                      | il saldo                                                | bakiye                                    | saldo                                   | saldo (o saldo)                                                                      |
| amount                           | المبلغ                                | der Betrag                                        | l'importo (m.)                                          | miktar                                    | jumlah                                  | valor (o valor; também no placeholder do campo)                                      |
| Max (button)                     | الحد الأقصى                           | Max.                                              | Max                                                     | Maks.                                     | Maks                                    | Máx.                                                                                 |
| receive                          | استلام / تستلم                        | erhalten                                          | ricevere ("Riceverai")                                  | almak                                     | menerima                                | receber ("You will receive" = Você vai receber)                                      |
| swap                             | مبادلة                                | der Swap                                          | lo swap (m., inv.) / fare swap                          | swap                                      | swap                                    | swap (o swap; verbo: fazer swap)                                                     |
| liquidity                        | السيولة                               | die Liquidität                                    | la liquidità                                            | likidite                                  | likuiditas                              | liquidez (a liquidez)                                                                |
| transaction                      | معاملة                                | die Transaktion                                   | la transazione                                          | işlem                                     | transaksi                               | transação (a transação)                                                              |
| confirm / Confirm in wallet      | تأكيد / أكِّد في المحفظة              | bestätigen / In der Wallet bestätigen             | confermare / Conferma nel wallet                        | onaylamak / Cüzdanınızda onaylayın        | konfirmasi / Konfirmasi di dompet       | confirmar / Confirme na carteira                                                     |
| pending                          | قيد الانتظار                          | ausstehend                                        | in attesa                                               | beklemede                                 | menunggu                                | pendente                                                                             |
| confirmed / failed               | مؤكَّدة / فشلت                        | bestätigt / fehlgeschlagen                        | confermata / non riuscita (transazione, f.)             | onaylandı / başarısız                     | terkonfirmasi / gagal                   | confirmada / falhou (concorda com "transação")                                       |
| estimated time                   | الوقت التقريبي                        | voraussichtliche Dauer                            | il tempo stimato                                        | tahmini süre                              | perkiraan waktu                         | tempo estimado                                                                       |
| governance                       | الحوكمة                               | die Governance                                    | la governance (f., inv.)                                | yönetişim                                 | tata kelola                             | governança (a governança)                                                            |
| proposal                         | اقتراح                                | der Vorschlag                                     | la proposta                                             | teklif                                    | proposal                                | proposta (a proposta da DAO)                                                         |
| vote (verb / noun)               | تصويت / صوت                           | abstimmen / die Stimme                            | votare / il voto                                        | oy vermek / oy                            | memilih / suara                         | votar / voto (o voto)                                                                |
| profit sharing                   | تقاسم الأرباح                         | die Gewinnbeteiligung                             | la condivisione dei profitti                            | kâr paylaşımı                             | bagi hasil                              | participação nos lucros                                                              |
| token                            | توكن                                  | der Token                                         | il token (m., pl. i token)                              | token                                     | token                                   | token (o token, os tokens)                                                           |
| jetton                           | جيتون                                 | der Jetton                                        | il jetton (m., pl. i jetton)                            | jetton                                    | jetton                                  | jetton (o jetton; explicar uma vez)                                                  |
| NFT                              | NFT                                   | NFT                                               | NFT (m., inv.: un NFT, gli NFT)                         | NFT                                       | NFT                                     | NFT (o NFT, os NFTs)                                                                 |
| certificate (staking/unstaking)  | شهادة ستاكينغ / شهادة إلغاء الستاكينغ | das Staking-Zertifikat / das Unstaking-Zertifikat | il certificato di staking / il certificato di unstaking | staking sertifikası / unstake sertifikası | sertifikat staking / sertifikat unstake | certificado de staking / certificado de unstake                                      |
| mainnet                          | الشبكة الرئيسية                       | das Mainnet                                       | la mainnet (f., inv.)                                   | ana ağ (mainnet)                          | mainnet                                 | mainnet (a mainnet; glosa "rede principal" no primeiro uso)                          |
| explorer (blockchain)            | المستكشف                              | der Explorer                                      | l'explorer (m., pl. gli explorer)                       | explorer                                  | explorer                                | explorer (o explorer; "Tesouraria no explorer")                                      |
| smart contract                   | عقد ذكي                               | der Smart Contract                                | lo smart contract (m., pl. gli smart contract)          | akıllı sözleşme                           | smart contract                          | contrato inteligente (o contrato inteligente)                                        |
| audit (security audit)           | تدقيق أمني                            | das Sicherheitsaudit                              | l'audit di sicurezza (m., pl. gli audit)                | güvenlik denetimi                         | audit keamanan                          | auditoria de segurança (a auditoria; forma curta depois do primeiro uso)             |
| open-source                      | مفتوح المصدر                          | Open Source                                       | open source (agg. inv.)                                 | açık kaynak                               | open-source                             | código aberto (de código aberto)                                                     |
| security                         | الأمان                                | die Sicherheit                                    | la sicurezza                                            | güvenlik                                  | keamanan                                | segurança (a segurança)                                                              |
| phishing                         | تصيّد احتيالي                         | das Phishing                                      | il phishing                                             | phishing                                  | phishing                                | phishing (o phishing)                                                                |
| multisig (wallet)                | محفظة متعددة التواقيع                 | die Multisig-Wallet                               | il wallet multisig                                      | multisig cüzdan                           | multisig                                | carteira multisig (a multisig)                                                       |
| cold wallet                      | محفظة باردة                           | die Cold Wallet                                   | il cold wallet                                          | soğuk cüzdan                              | cold wallet                             | carteira fria                                                                        |
| Telegram Mini App                | تطبيق Telegram المصغّر                | Telegram Mini App                                 | la Mini App di Telegram                                 | Telegram Mini App                         | Telegram Mini App                       | Mini App do Telegram                                                                 |
| docs / documentation             | الوثائق / التوثيق                     | Docs / die Dokumentation                          | la documentazione (nav: Documentazione)                 | dokümanlar / dokümantasyon                | Dokumen / dokumentasi                   | documentação (nav "Docs" = Docs)                                                     |
| FAQ                              | الأسئلة الشائعة                       | FAQ                                               | FAQ (f. pl., inv.; titolo esteso: Domande frequenti)    | SSS                                       | FAQ                                     | FAQ (títulos podem trazer "Perguntas frequentes")                                    |
| support                          | الدعم                                 | der Support                                       | il supporto                                             | destek                                    | dukungan                                | suporte (o suporte)                                                                  |
| community                        | مجتمع                                 | die Community                                     | la community (f., inv.)                                 | topluluk                                  | komunitas                               | comunidade (a comunidade; "Hipo community" = comunidade Hipo)                        |
| giveaway                         | توزيع هدايا                           | das Giveaway                                      | il giveaway (m., inv.)                                  | çekiliş                                   | giveaway                                | sorteio (o sorteio)                                                                  |
| prize                            | جائزة                                 | der Gewinn                                        | il premio                                               | ödül                                      | hadiah                                  | prêmio (o prêmio; "Giveaways & Prizes" = Sorteios e prêmios)                         |
| ambassador                       | سفير                                  | der Ambassador                                    | l'ambassador (m., pl. gli ambassador)                   | elçi                                      | ambassador                              | embaixador (o embaixador)                                                            |
| tokenomics                       | توكنوميكس                             | die Tokenomics                                    | la tokenomics (f., inv.)                                | tokenomi                                  | tokenomics                              | tokenomics (a tokenomics)                                                            |
| allocation                       | تخصيص                                 | die Zuteilung                                     | l'allocazione (f.)                                      | dağılım                                   | alokasi                                 | alocação (a alocação)                                                                |
| vesting                          | فيستينغ (إطلاق تدريجي)                | das Vesting                                       | il vesting (m., inv.)                                   | vesting                                   | vesting                                 | vesting (o vesting; glosa "liberação gradual" no primeiro uso)                       |
| burn / burned                    | حرق / محروق                           | verbrennen / verbrannt                            | bruciare / bruciato                                     | yakma / yakıldı                           | burn / di-burn                          | queima / queimado (a queima de tokens)                                               |
| circulating supply               | المعروض المتداول                      | das zirkulierende Angebot                         | l'offerta circolante (f.)                               | dolaşımdaki arz                           | suplai beredar                          | oferta em circulação (a oferta)                                                      |
| total / fixed supply             | إجمالي المعروض / المعروض الثابت       | das Gesamtangebot / das feste Angebot             | l'offerta totale / l'offerta fissa                      | toplam arz / sabit arz                    | suplai total / suplai tetap             | oferta total / oferta fixa                                                           |
| market cap                       | القيمة السوقية                        | die Marktkapitalisierung                          | la capitalizzazione di mercato                          | piyasa değeri                             | kapitalisasi pasar                      | capitalização de mercado (a capitalização)                                           |
| volume (24h)                     | حجم التداول (٢٤ ساعة)                 | das Volumen (24 h)                                | il volume (24 h)                                        | hacim (24 saat)                           | volume (24 jam)                         | volume (24 h) (o volume)                                                             |
| holders                          | الحائزون                              | die Inhaber                                       | i detentori                                             | sahipler                                  | pemegang                                | holders (os holders)                                                                 |
| dashboard                        | لوحة المعلومات                        | das Dashboard                                     | la dashboard (f., inv.)                                 | panel                                     | dashboard                               | dashboard (o dashboard)                                                              |
| chart                            | رسم بياني                             | der Chart                                         | il grafico                                              | grafik                                    | grafik                                  | gráfico (o gráfico)                                                                  |
| range (24H / 1W / 1M / 1Y)       | الفترة                                | der Zeitraum                                      | il periodo                                              | aralık                                    | rentang                                 | período (o período; códigos 24H/1W/1M/3M/1Y ficam em latim)                          |
| Coming soon                      | قريبًا                                | Demnächst                                         | In arrivo                                               | Yakında                                   | Segera hadir                            | Em breve                                                                             |
| error                            | خطأ                                   | der Fehler                                        | l'errore (m.)                                           | hata                                      | kesalahan                               | erro (o erro)                                                                        |
| warning                          | تحذير                                 | die Warnung                                       | l'avviso (m.)                                           | uyarı                                     | peringatan                              | aviso (o aviso)                                                                      |
| Insufficient funds               | الرصيد غير كافٍ                       | Nicht genügend Guthaben                           | Fondi insufficienti                                     | Yetersiz bakiye                           | Saldo tidak cukup                       | Saldo insuficiente                                                                   |
| Retry / Try again                | إعادة المحاولة / حاول مرة أخرى        | Erneut versuchen                                  | Riprova                                                 | Tekrar dene                               | Coba lagi                               | Tentar novamente                                                                     |
| Loading…                         | جارٍ التحميل…                         | Wird geladen…                                     | Caricamento…                                            | Yükleniyor…                               | Memuat…                                 | Carregando…                                                                          |

## Style rules per locale

Common to all locales:

- Keep button labels short and imperative; titles in sentence case unless the language capitalises otherwise.
- `{placeholders}` are code: never translate, rename or reorder their names; move them freely inside the
  sentence so the word order is natural («{amount} GRAM دریافت می‌کنید»). Every placeholder in the English
  value must appear exactly once in the translation (`check-i18n` enforces parity).
- Catalog values may contain only the inline HTML subset `a strong em code br`. Keep the same tags the
  English has, translate their text, never add tags where English has none, never translate attribute values.
- Markdown: keep URLs exactly as they are. Root-relative links (`/docs/…`, `/faq/#what-does-it-cost-to-stake`)
  are localised by the build (`remark-localize-links`) — do not prefix them with the locale yourself. Anchor
  ids, heading slugs, file names, JSON keys and prose paths are never translated.
- Units follow the number and stay Latin: `۱۰ GRAM`, `10 GRAM`, `10 GRAM`. Percent follows the locale
  (`۳٫۲٪`, `3,2 %`, `3.2%`). Currency uses the locale's placement (`$۱٫۲ میلیون`, `1,2 млн $`, `$1.2 मिलियन`).
- Copy the English tone: confident, plain, no hype; do not add "risk-free"/"guaranteed" wording.

Persian (`fa`):

- Register: polite plural «شما», verbs in the polite second person plural («استیک کنید», «دریافت می‌کنید»);
  never the intimate «تو». Avoid ornate Arabic-heavy vocabulary where a common Persian word exists.
- Digits: Persian digits (۰–۹) everywhere, prose included (decision 2) — step numbers, years, percentages,
  counts, `۱٬۰۰۰٬۰۰۰٬۰۰۰ HPO`. Thousands separator «٬», decimal «٫». Exceptions: code, addresses, URLs,
  version strings like `v2`, and the range codes (`24H`, `1W`).
- Dates: Jalali calendar with Persian digits (decision 9). For historical records — audits, launch dates,
  quarterly reports — give the Gregorian date in parentheses on first mention: «۸ آبان ۱۴۰۲ (۳۰ اکتبر ۲۰۲۳)».
- Punctuation: «» for quotes, «،» as comma, «؛» semicolon, «؟» question mark. Use ZWNJ (U+200C) in
  compounds and suffixes («می‌کنید», «آن‌استیک», «توکن‌ها», «نقدشونده»); never a plain space or a joined
  form. Ezafe before a Latin word is written as a space only («خزانه Hipo»).
- Latin tokens (tickers, product names) sit inline, isolated by spaces; do not wrap them in quotes or parentheses
  just because they are Latin.

Russian (`ru`):

- Register: formal «вы» in lowercase (not «Вы»); imperative buttons («Подключить кошелёк»).
- Digits: Latin digits, space as thousands separator, comma decimal (`1 234,5`, `3,2 %`); dates Gregorian
  in Russian order («30 октября 2023 г.»). Use «ё» consistently («кошелёк», «заём»).
- Quotes «», dash «—» with spaces. Do not decline Latin product names; decline the surrounding Russian word.

Hindi (`hi`):

- Register: formal «आप» with polite imperatives («करें», not «करो»). Mixed Hindi-English register as in
  Indian crypto apps: established jargon stays transliterated in Devanagari (स्टेकिंग, वॉलेट, टोकन), tickers Latin.
- Digits: Latin digits with Indian grouping (`12,34,567`), period decimal; dates Gregorian in Indian order
  («30 अक्टूबर 2023»). Use the Devanagari danda «।» only in long prose; UI strings end without it.
- Nukta where standard (ज़, फ़, ड़); keep one spelling per term (this table's).

Arabic (`ar`):

- Register: Modern Standard Arabic, the neutral register of exchange and wallet UIs — no dialect, no
  colloquial loan verbs («تستيك», «تسوّب»), no classical flourish. Address the reader in the second person
  singular («تحصل على hGRAM», «اربط محفظتك»); prefer gender-neutral verbal nouns over gendered verb forms
  where a label allows it. Never «حضرتك» or plural «أنتم» for one reader.
- Buttons and nav labels use the verbal noun (masdar), which is the Arabic UI convention: «ستاكينغ»,
  «إلغاء الستاكينغ», «ربط المحفظة», «إعادة المحاولة». Keep the true imperative for sentences that tell the
  user to act somewhere else («أكِّد في المحفظة», «افتح تطبيق المحفظة»). Labels stay short — never a full
  sentence on a button.
- Digits: Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) everywhere, prose included — step numbers, years, counts,
  percentages, amounts: «١٬٠٠٠٬٠٠٠٬٠٠٠ HPO». Decimal separator «٫» (U+066B), thousands «٬» (U+066C),
  percent sign «٪» (U+066A). Exceptions kept in Latin digits: code and CLI, contract addresses and tx
  hashes, URLs and anchor ids, version strings like `v2`, and the chart range codes `24H`/`1W`/`1M`/`3M`/`1Y`.
- Dates: Gregorian only, in Arabic month names, day-month-year: «٣٠ أكتوبر ٢٠٢٣». Use the international
  month set (يناير، فبراير، مارس، أبريل، مايو، يونيو، يوليو، أغسطس، سبتمبر، أكتوبر، نوفمبر، ديسمبر), not
  the Levantine كانون/تشرين set. Do **not** add a Hijri gloss: audits, launch dates and quarterly reports
  are financial records and must match the English source date exactly.
- Punctuation: Arabic comma «،», semicolon «؛», question mark «؟». Quotation marks «…» (U+00AB/U+00BB);
  never straight ASCII quotes around Arabic. Keep the ellipsis character «…» as in English. Headings and UI
  strings end without a full stop; prose sentences take the ordinary «.».
- Latin tokens (Hipo, GRAM, hGRAM, HPO, TON, TonConnect, DeFi, APY, TVL, NFT, product names, tickers)
  always stay Latin and are never transliterated. Isolate each with a plain space on both sides; never glue
  an Arabic letter, prefix or punctuation mark to them — no «الـHPO», «بTON», «وGRAM», «hGRAMـات».
- Attach the article, prepositions and plurals through an Arabic head noun placed before the Latin token:
  «رموز HPO», «توكن hGRAM», «شبكة TON», «عملة GRAM», «بروتوكول Hipo», «مجتمع Hipo», «في TON DeFi»,
  «عبر TonConnect», «رموز NFT». When the sentence needs a definite phrase, define the head noun, not the
  token: «توكنات HPO المتداولة», «الخزينة الخاصة بـ Hipo» → prefer «خزينة Hipo».
- Units follow the number and stay Latin: «١٠ GRAM», «١٬٢٣٤٫٥ hGRAM», «٥٠٠ HPO». The percent sign follows
  the number with no space: «٣٫٢٪». In prose write currency as a word after the number («١٫٢ مليون دولار»);
  keep the `$` prefix only in compact stat tiles where the English source shows it.
- Terminology discipline: the staking family is transliterated and fixed — «ستاكينغ», «إلغاء الستاكينغ»,
  «مكافآت الستاكينغ», «في الستاكينغ». Do not switch to «التخزين», «الرهن» or «التجميد» mid-page; do not
  invent purist coinages for terms the table already settles.
- `{placeholders}` are code: keep the name exactly, move it wherever Arabic word order wants it
  («تستلم {amount} GRAM»). Every placeholder appears exactly once, and a placeholder that renders a number
  or a ticker still needs the surrounding text to leave it space-isolated.
- Orthography: correct hamza forms (أ/إ/آ/ئ/ؤ), final «ة» vs «ه» and «ى» vs «ي». No full diacritics —
  add a single shadda or vowel only to disambiguate («أكِّد», «مؤكَّدة»). Use the Arabic tatweel never, and
  a single spelling per term (this table's).
- Tone: confident and plain, exactly as the English. State what the protocol does, not how great it is —
  no «مضمون», «بلا مخاطر», «أرباح مؤكدة», no exclamation marks, no added marketing adjectives that the
  English source does not have.

German (`de`):

- Register: formal «Sie», lowercase «Sie erhalten», never «du» — the site talks about people's money next to
  audits and fees, and «Sie» is what German finance and exchange UIs use for that content; the infinitive CTAs
  below keep the address form out of most short strings anyway, so the choice rarely surfaces.
- Buttons and CTAs use the infinitive, not the imperative: «Wallet verbinden», «Staken», «Unstaken»,
  «Erneut versuchen», «Jetzt staken». Imperatives («Verbinde deine Wallet») are wrong for this register.
  Nav labels and page titles are nouns («Belohnungen» → «Rewards», «Statistiken»), in sentence case except
  for the nouns German capitalises anyway.
- Established crypto jargon stays English and is capitalised as a German noun with an article:
  das Staking, die Wallet, der Token, der Swap, die Governance, das Vesting, das Mainnet, die Treasury,
  der Smart Contract, die Liquidität (X). Do not Germanise these («Einsatz», «Geldbörse», «Schatzkammer» are
  wrong). Plain words stay German: die Gebühr, das Guthaben, der Betrag, die Runde, der Kreditnehmer.
- Mixed compounds take a hyphen at every seam: `Staking-Gebühr`, `Staking-Rewards`, `hGRAM-Token`,
  `GRAM-Guthaben`, `Multisig-Wallet`, `Open-Source-Smart-Contracts`, `TON-Blockchain`, `24-Stunden-Volumen`.
  Two English words that already form a name stay open («Smart Contract», «Cold Wallet», «Open Source»,
  «Liquid Staking») but hyphenate as soon as a German noun joins them («Liquid-Staking-Protokoll»).
  Verbs from English are lowercase and inflect regularly: staken, unstaken, geswappt, gestakt.
- Digits: period as thousands separator, comma as decimal separator (`1.234,5`); percent with a
  non-breaking space (`3,2 %`), likewise before units and currency (`10 GRAM`, `1,2 Mio. $`). Never a bare
  `3,2%`. Keep the range codes Latin (`24H`, `1W`, `1M`, `3M`, `1Y`).
- Dates Gregorian in German order with a period after the day: «30. Oktober 2023», short form «30.10.2023».
  Times 24-hour with a colon («14:30»); durations «2 Std. 15 Min.».
- Quotation marks are „…“ (never "…" or «…»); the dash is the em dash «—» with spaces around it, and the
  range dash is the en dash without spaces («2023–2025»).
- Latin tokens (Hipo, GRAM, hGRAM, HPO, TON, TonConnect, product names) are never inflected internally and
  never take a German plural or genitive `-s` inside the word: «die Treasury von Hipo», «drei hGRAM»,
  «auf der TON-Blockchain». Case endings ride on the surrounding German word or on a hyphenated compound.
- Gender: neutral formulations, no gender star and no `:innen` — the English source is plain and neutral, so
  prefer role-free wording («wer stakt», «alle Staker», «Ihr Guthaben») over gendered pairs. Generic
  masculines like «der Staker», «der Validator», «der Inhaber» stay as the glossary spells them.
- Tone: confident, plain, no hype. Never «risikofrei», «garantiert», «sicher verdienen» or «passives
  Einkommen» — English says what the protocol does, so does German. Avoid Behördendeutsch: short main
  clauses, verbs over nominalisations («Sie staken GRAM», not «die Durchführung des Stakings»).
- Prose may expand a short UI term once for clarity — «unstaken (aus dem Staking nehmen)», «Rewards
  (Belohnungen)» — but every following mention uses the glossary rendering.

Italian (`it`):

- Register: informal «tu» throughout («connetti il tuo wallet», «riceverai hGRAM») — every Italian crypto
  product a reader already uses (Tonkeeper, exchanges, DeFi front-ends) addresses the user with «tu»; «lei»
  would read as a bank. Never mix the two within a page.
- Buttons and CTAs: second person singular imperative, short, no final period («Connetti il wallet», «Fai
  staking», «Fai unstaking», «Riprova», «Apri l'app»). Do not use infinitives («Connettere») or nouns
  («Connessione») as button labels.
- English crypto terms stay English: staking, unstaking, wallet, swap, token, jetton, smart contract, explorer,
  vesting, dashboard, governance, tokenomics, community, mainnet, cold wallet, multisig, phishing, open source.
  Plain words are translated: ricompensa, commissione, saldo, importo, prelievo, tesoreria, prestito, grafico,
  sicurezza, proposta, premio.
- English loanwords are invariable in the plural: «i wallet», «gli staker», «i token», «gli smart contract»,
  «le ricompense di staking» — never «i wallets», «gli smart contracts», «i tokens». Gender is fixed by the
  glossary (`lo staking`, `il wallet`, `la governance`, `la dashboard`) and never varies.
- Verbs around the loanwords use the periphrasis «fare + sostantivo»: «fare staking», «fare unstaking»,
  «fare swap». Never «stakare», «stekare», «unstakare», «swappare» — they read as slang, not product copy.
  In prose the fuller «ritirare dallo staking» is preferred for unstake; the UI keeps the short form.
- Digits: Latin digits, period as thousands separator, comma as decimal (`1.234,5`); percent with a
  non-breaking space (U+00A0) before the sign (`3,2 %`, written `3,2 %`); units follow the number and stay Latin (`10 GRAM`,
  `1.234,5 hGRAM`); currency before the figure as on the English site (`$1,2 milioni`).
- Dates: Gregorian in Italian order, month in lowercase and no ordinal («30 ottobre 2023», «1º agosto 2026»
  only where a day-one is meant). Times use the 24-hour clock («14:30»).
- Punctuation: «» for quotes (never "" or ""), em dash «—» with spaces around it as in the English copy,
  and the ellipsis character «…» in loading strings. No space before `:` `;` `?` `!`.
- Latin tokens (Hipo, GRAM, hGRAM, HPO, TON, TonConnect, product names) are never inflected, pluralised or
  apostrophised: «i token HPO», not «gli HPOs» or «l'HPO's». Articles agree with the implied Italian noun
  («il protocollo Hipo» → «Hipo», «la rete TON», «gli hGRAM» only when «i token hGRAM» is clumsy).
  Elision before a Latin word is allowed only when the pronunciation is vowel-initial («l'app Hipo»).
- Capitalisation: Italian sentence case in titles, headings and nav labels — «Fai staking di GRAM, ricevi
  hGRAM», not «Fai Staking Di GRAM». Only proper nouns, tickers and product names keep their capitals;
  «staking», «wallet», «token» are common nouns and stay lowercase mid-sentence.
- Tone: confident and plain, matching the English. No hype, no superlatives the English does not have, and
  never «senza rischi», «garantito», «rendimento sicuro» or «guadagno assicurato» — say what the protocol
  does, not what it promises.

Turkish (`tr`):

- Register: polite plural «siz» throughout prose («cüzdanınızı bağlayın», «hGRAM alırsınız», «ödülleriniz»);
  never «sen»/«-in» singular in sentences. Buttons and short CTAs use the bare imperative instead
  («Cüzdanı bağla», «Stake et», «Tekrar dene») — this split (imperative on buttons, «siz» in copy) is
  deliberate and matches Turkish wallet/exchange UI; keep it consistent.
- English stays English for jargon a Turkish crypto user already reads in wallets and on Binance TR:
  staking, likit staking, stake etmek, unstake, swap, DeFi, DEX, NFT, token, jetton, vesting, multisig,
  explorer, phishing, APY/TVL. Everything with a settled Turkish word is translated: cüzdan, ödül, komisyon,
  ücret, bakiye, miktar, işlem, hazine, oran, arz, akıllı sözleşme, güvenlik denetimi, açık kaynak,
  yönetişim, teklif, oy, piyasa değeri, hacim. Do not invent Turkish coinages for the first list
  (no «pay biriktirme», no «zincir gezgini») and do not leave the second list in English.
- Fees: Hipo's own cut is «komisyon» (staking komisyonu, protokol komisyonu), the network's cost is
  «ağ ücreti»; the two are not interchangeable. «gas» only when quoting the term itself.
- Latin tokens (Hipo, GRAM, hGRAM, HPO, TON, TonConnect, product and contract names) are never
  transliterated, never pluralised and never re-cased — no «Ton», «HGRAM», «hipo», «GRAM'lar». Suffixes go
  **outside** the token, joined with an apostrophe per TDK: «TON'da», «HPO'yu», «hGRAM'ınız», «Hipo'nun»,
  «Treasury'ye», «DeFi'de». For plurals prefer a Turkish head noun («HPO tokenleri»), not a suffixed ticker.
- Vowel harmony after an acronym follows how the acronym is **read aloud**, not how it is spelled:
  TON = «ton» → «TON'da», «TON'un»; hGRAM = «heygram» → «hGRAM'ı», «hGRAM'ınız»; HPO = «ha-pe-o» →
  «HPO'yu», «HPO'nun»; APY = «a-pe-ye» → «APY'yi», «APY'nin»; TVL = «te-ve-le» → «TVL'yi»; NFT = «en-ef-te»
  → «NFT'yi», «NFT'ler»; DAO → «DAO'da»; DEX = «deks» → «DEX'te». When in doubt, rewrite the sentence so
  the token needs no suffix.
- English loanwords kept in English spelling take the apostrophe too («stake'ten», «staking'e», «swap'ı»);
  naturalised Turkish spellings do not («tokenler», «tokeni», «likiditede», «grafikte», «panelde»).
- Digits: Latin digits, period as thousands separator, comma as decimal — `1.234,5`, `0,05 GRAM`,
  `1,2 milyon`. The currency symbol follows the number with a space (`1,2 milyon $`); units follow the
  number and stay Latin (`10 GRAM`, `1.000.000.000 HPO`). The range codes `24H`, `1W`, `1M`, `3M`, `1Y`
  stay Latin.
- Percent: the sign goes **before** the number in Turkish typography — `%3,2`, `%0`, `%100`, ranges `%3–5`.
  Never `3,2%`. This is the single most frequent error; check every fee, APY and share figure.
- Dates: Gregorian in Turkish order, month name capitalised — «30 Ekim 2023»; numeric form `30.10.2023`.
  Time as `14:30`. Durations: «36 saat», «2 gün».
- Punctuation: Turkish double quotes "…" (not «» and not straight quotes); em dash «—» with spaces as in
  English, but prefer splitting the sentence or using a comma when the dash makes the clause hard to read.
  No space before `:`, `;`, `!`, `?`.
- Capitalisation: Turkish sentence case in headings, buttons and nav labels — only the first word and proper
  nouns («Ödülleriniz», «Cüzdanı bağla», «Hipo nedir?»); never English Title Case. Dotted/dotless i must be
  correct: «İşlem», «İptal», «İstatistikler», «Yükleniyor…», «çıkarma»/«çıkarın» — and Turkish casing is
  never applied to Latin tokens or code.
- Ambiguity note: «ödül» renders both _reward_ and _prize_. In giveaway copy say «çekiliş ödülü», in staking
  copy say «staking ödülü» whenever both senses could be read in the same block.
- Gloss once, then use the short form: «ana ağ (mainnet)», «phishing (oltalama)», «yönetişim teklifi».
- Tone: confident, plain, no hype. Never «risksiz», «garantili», «kesin kazanç», «kaçırmayın» — English says
  none of it and Turkish crypto copy is legally sensitive about it.

Indonesian (`id`):

- Register: «Anda», always capitalised, never «kamu» or «kau»; verbs stay in the plain form
  («Anda menerima hGRAM»). Buttons and CTAs are the bare verb without «Anda» and without «-lah»
  («Hubungkan dompet», «Stake sekarang», «Coba lagi»).
- English is kept where Indonesian crypto users already read English: `staking`, `liquid staking`,
  `swap`, `stake`/`unstake`, `smart contract`, `mainnet`, `explorer`, `vesting`, `tokenomics`,
  `multisig`, `cold wallet`, `phishing`, `open-source`, `dashboard`, `jetton`. Do not "correct" these
  into formal Bahasa (no «kontrak pintar», no «penjelajah blok», no «pertaruhan»).
- The Indonesian word wins where it is the everyday one: «dompet» (not wallet), «imbalan» (not reward;
  «hadiah» is reserved for giveaway prizes), «biaya» (not fee), «saldo», «jumlah», «keamanan»,
  «likuiditas», «nilai tukar»/«kurs», «bagi hasil», «grafik», «pemegang», «suplai beredar».
- Affixation on borrowed verbs: always hyphenate the affix, one convention everywhere —
  «men-stake», «meng-unstake», «di-stake», «di-burn», «staking-nya», «swap-nya». Never write
  «menstake», «distake» or «stakingnya», and never affix a ticker («men-stake GRAM», not «men-GRAM»).
- Latin tokens — Hipo, GRAM, hGRAM, HPO, TON, TonConnect, product names — are never inflected,
  never given a plural `-s`, never reduplicated («token HPO», not «token-token HPO», not «HPOs»).
  Indonesian has no plural marker: «10 imbalan», «pemegang hGRAM», plural only from context or
  «para»/«banyak» when genuinely needed.
- Digits: period as thousands separator, comma as decimal — `1.234,5`, `0,05 GRAM`, `3,2%` (percent
  sign attached, no space). Units follow the number and stay Latin: `10 GRAM`, `1.234,5 hGRAM`.
  Currency keeps the source placement: `$1,2 juta`. The range codes `24H`, `1W`, `1M`, `3M`, `1Y`
  stay Latin.
- Dates: Gregorian in Indonesian order with the month spelled out and capitalised —
  «30 Oktober 2023», «Kuartal 3 2025» (or «Q3 2025» when the English cites the short form).
- Punctuation: straight double quotes `"…"` for quoted copy (not «» and not curly quotes in JSON
  catalogs); em dash «—» with a space on each side, as in English; keep the ellipsis character «…».
- Capitalisation: sentence case for headings, buttons, nav labels and table headers — «Stake GRAM,
  terima hGRAM», «Imbalan staking», «Hubungkan dompet». Never English title case. Proper nouns,
  tickers, month names and the first word only.
- Tone: confident and plain, mirroring the English. No hype, no exclamation marks, and never
  «tanpa risiko», «dijamin», «pasti untung» or any wording that promises a return.
- `{placeholders}` and inline HTML follow the common rules above; move a placeholder to wherever the
  Indonesian word order needs it («Terima GRAM dalam {remain}»).

Brazilian Portuguese (`pt-br`):

- Register: «você» everywhere (never «tu», never «vós»), verbs in the third person singular that «você» takes
  («você recebe hGRAM», «você não precisa criar conta»). Brazilian usage, not European: «app» not «aplicação»,
  «celular» not «telemóvel», gerund progressives («está carregando») are fine.
- Buttons and CTAs use the **infinitive**, never the imperative: «Conectar carteira», «Fazer staking»,
  «Fazer unstake», «Confirmar», «Tentar novamente» — not «Conecte a carteira». The one exception is an
  instruction line that is not a button, which stays imperative («Confirme na carteira»).
- Which words stay English: `staking`, `unstake`, `swap`, `jetton`, `token`, `staker`, `holders`, `dashboard`,
  `vesting`, `phishing`, `tokenomics`, `mainnet`, `explorer`, `multisig`, `NFT`, `APY`. Which are Portuguese:
  `carteira`, `recompensa`, `taxa`, `saldo`, `valor`, `saque`, `liquidez`, `transação`, `governança`,
  `validador`, `empréstimo`, `rodada`, `tesouraria`, `contrato inteligente`, `código aberto`, `queima`,
  `sorteio`, `prêmio`, `gráfico`. No mixing: never «wallet», never «reward», never «fee» in running copy.
- Verbs around borrowings are periphrastic with `fazer`: «fazer staking de 100 GRAM», «fazer unstake»,
  «fazer swap». Never «stakear», «anstakear», «swapar», never «deletar»-style coinages. In prose the long form
  «retirar do staking» may replace «fazer unstake»; UI keeps the short one.
- Borrowed nouns take Portuguese articles and gender (o staking, o token, o swap, a carteira, a liquidez, a
  mainnet) but Latin tickers and product names take **no** Portuguese plural or inflection: «10 GRAM», «seus
  tokens hGRAM», «na rede TON» — never «GRAMs», «hGRAMs», «HPOs».
- Digits: period as thousands separator, comma as decimal (`1.234,5`; `1.000.000.000 HPO`). Percent with a
  non-breaking space before the sign: `3,2 %`. Units follow the number and stay Latin: `10 GRAM`, `1,05 hGRAM`.
  The range codes (`24H`, `1W`, `1M`, `3M`, `1Y`), addresses, versions (`v2`) and code are never localised.
- Currency: `R$` only when the figure really is Brazilian reais. Dollar figures stay dollars, written
  `US$ 1,2 milhão` / `US$ 3,4 bilhões` (space after the symbol, Brazilian short scale — `bilhão` = 10⁹).
- Dates in Brazilian order, month spelled out in lowercase: «30 de outubro de 2023»; numeric form `30/10/2023`.
  Times use the 24-hour clock («14h30», «em 18 h»).
- Punctuation: use the straight double quote `"…"` for quotations (not «…», not curly typographic pairs), and
  the em dash «—» with spaces around it, as in the English source. Keep the ellipsis character «…».
- Capitalisation: sentence case in headings, buttons, nav labels and card titles — «Fazer staking de GRAM e
  receber hGRAM», not English title case. Proper nouns, tickers and product names keep their own casing (Hipo,
  GRAM, hGRAM, TON, TonConnect, DeFi); months, weekdays and «português» stay lowercase.
- Accents and spelling follow the 1990 orthographic agreement as used in Brazil: «recompensa», «prêmio»,
  «segurança», «transação», «período», «início», «único». Use «ç» and the tildes correctly; never drop accents
  because a field is short.
- Tone: confident and plain, matching the English. No hype, no exclamation marks, no marketing superlatives.
  Never write «sem risco», «garantido», «lucro garantido», «rendimento garantido» or «investimento seguro» —
  besides being off-tone, guarantee wording is regulatorily sensitive in Brazil. Prefer «recompensas de
  staking» over «rendimento» / «lucro» when describing what a staker earns.

## How to verify

- `node scripts/check-i18n.mjs` — diffs every locale against English: missing keys, placeholder parity, the
  HTML subset, stale `sourceHash`. Released locales fail the build on gaps; draft locales only warn and print
  a coverage percentage. It runs as `prebuild`, so `npm run build` runs it too.
- `node scripts/check-i18n.mjs --update-hashes <locale>` — after a translation pass, record the current
  English hashes in `src/i18n/<locale>/meta.json` (reviewers later use `--mark-reviewed <locale> <prefix>`).
- `I18N_INCLUDE_DRAFTS=1 npm run build` (or `npm run dev`) — build draft locales too, then open
  `/<locale>/…` in the preview to check RTL layout, digits, dates and line breaks in context.
