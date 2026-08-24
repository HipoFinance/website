---
title: 'Контракты и аудиты'
description: 'Адреса контрактов Hipo в основной сети, четыре независимых аудита безопасности и где читать исходный код.'
---

## Адреса в основной сети

| Контракт                                                                              | Адрес                                                                                                                        |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (основной контракт протокола, принимает депозиты и хранит застейканный GRAM) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton-мастер (hGRAM)                                                        | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| Jetton HPO                                                                            | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
Адрес parent может измениться при обновлениях протокола — источником истины является [README репозитория контрактов](https://github.com/HipoFinance/contract). Всегда проверяйте адрес по официальным источникам Hipo, прежде чем отправлять на него что-либо.
:::

## Аудиты

Смарт-контракты Hipo прошли четыре независимых аудита: Quantstamp (апрель 2025 г.) и ProgramCrafter (март 2024 г.) для контрактов v2, а также TonTech и Daniil Sedov (октябрь 2023 г.) для v1. Каждый отчёт опубликован полностью на [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Исходный код

- **Контракты**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — написаны на FunC с использованием набора инструментов Blueprint; открытый тестовый набор можно запустить из этого репозитория.
- **MCP-сервер**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — npm-пакет `@hipo-finance/mcp`, лицензия MIT.

## Что делает каждый контракт

- **Treasury** — основной контракт протокола: хранит внесённый GRAM и выдаёт его в заём заёмщикам / валидаторам.
- **Parent** — jetton-мастер (минтер), через который взаимодействуют кошельки и казна.
- **Wallet** — реализация jetton-кошелька для каждого пользователя.
- **Loan** — используется для выдачи займов заёмщикам на валидацию.
- **Bill** — непередаваемый NFT (SBT), выпускаемый, когда операция не может завершиться мгновенно, например вывод из стейкинга, пока средства участвуют в раунде валидации.
- **Collection** — коллекция NFT, к которой принадлежат сертификаты Bill.
- **Librarian** — вспомогательный контракт для развёртывания и хранения контрактов с использованием библиотечных функций TON.
- **Borrower application** — помогает валидаторам занимать средства у протокола для валидации.
- **Webapp** — помогает пользователям стейкать и выводить из стейкинга.

## Техническая документация

- [Архитектура](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — конечный автомат раунда валидации и инварианты протокола.
- [Руководство по интеграции](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — схемы сообщений для кошельков и протоколов.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — полные схемы сообщений TL-B.
- [Диаграммы потоков сообщений](https://github.com/HipoFinance/contract/tree/main/graphs/img) — по одному изображению на каждый поток протокола.

Чтобы читать текущее состояние протокола — курс обмена, комиссии, тайминг раунда — используйте [Hipo MCP Server](/docs/hipo-mcp-server/).

## Больше в FAQ

- [Проходил ли Hipo аудит?](/faq/#has-hipo-been-audited)
- [Где можно проверить транзакции Hipo?](/faq/#where-can-i-verify-hipo-transactions)
- [Риски](/docs/risks/)
