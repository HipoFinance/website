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

## How to verify

- `node scripts/check-i18n.mjs` — diffs every locale against English: missing keys, placeholder parity, the
  HTML subset, stale `sourceHash`. Released locales fail the build on gaps; draft locales only warn and print
  a coverage percentage. It runs as `prebuild`, so `npm run build` runs it too.
- `node scripts/check-i18n.mjs --update-hashes <locale>` — after a translation pass, record the current
  English hashes in `src/i18n/<locale>/meta.json` (reviewers later use `--mark-reviewed <locale> <prefix>`).
- `I18N_INCLUDE_DRAFTS=1 npm run build` (or `npm run dev`) — build draft locales too, then open
  `/<locale>/…` in the preview to check RTL layout, digits, dates and line breaks in context.
