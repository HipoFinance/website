---
title: 'Контракти та аудити'
description: 'Адреси контрактів Hipo в основній мережі, чотири незалежні аудити безпеки та де прочитати вихідний код.'
---

## Адреси в основній мережі

| Контракт                                                                         | Адреса                                                                                                                       |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (головний контракт протоколу, приймає внески й тримає GRAM у стейкінгу) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / майстер жетона (hGRAM)                                                  | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| Жетон HPO                                                                        | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
Адреса parent може змінитися після оновлень протоколу — джерелом істини є [README репозиторію контрактів](https://github.com/HipoFinance/contract). Завжди звіряй адресу з офіційними джерелами Hipo, перш ніж щось на неї надсилати.
:::

## Аудити

Смартконтракти Hipo пройшли чотири незалежні аудити: Quantstamp (квітень 2025 року) і ProgramCrafter (березень 2024 року) — для контрактів v2, а TonTech і Daniil Sedov (жовтень 2023 року) — для v1. Кожен звіт опубліковано повністю на [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Вихідний код

- **Контракти**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — написані на FunC з інструментарієм Blueprint; публічний набір тестів можна запустити з цього репозиторію.
- **MCP-сервер**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — npm-пакет `@hipo-finance/mcp` під ліцензією MIT.

## Що робить кожен контракт

- **Treasury** — головний контракт протоколу: тримає внесений GRAM і позичає його позичальникам / валідаторам.
- **Parent** — майстер жетона (мінтер), через який спілкуються гаманці й скарбниця.
- **Wallet** — реалізація жетон-гаманця для кожного користувача.
- **Loan** — використовується для позик на валідацію, виданих позичальникам.
- **Bill** — непереказуваний NFT (SBT), який видається, коли операцію не можна завершити миттєво, наприклад під час анстейку, поки кошти задіяні в раунді валідації.
- **Collection** — NFT-колекція, до якої належать bill-и.
- **Librarian** — помічник для розгортання контрактів і зберігання даних із використанням бібліотечних можливостей TON.
- **Borrower application** — допомагає валідаторам позичати в протоколу кошти для валідації.
- **Webapp** — допомагає користувачам стейкати й робити анстейк.

## Технічні документи

- [Архітектура](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — стейт-машина раунду валідації та інваріанти протоколу.
- [Посібник з інтеграції](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — схеми повідомлень для гаманців і протоколів.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — повні схеми повідомлень у TL-B.
- [Діаграми потоків повідомлень](https://github.com/HipoFinance/contract/tree/main/graphs/img) — по одному зображенню на кожен потік протоколу.

Щоб читати живий стан протоколу — курс обміну, комісії, тайминг раундів — використовуй [Hipo MCP Server](/docs/hipo-mcp-server/).

## Більше у FAQ

- [Чи проходив Hipo аудит?](/faq/#has-hipo-been-audited)
- [Де можна перевірити транзакції Hipo?](/faq/#where-can-i-verify-hipo-transactions)
- [Ризики](/docs/risks/)
