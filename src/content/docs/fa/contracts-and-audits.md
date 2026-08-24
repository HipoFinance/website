---
title: 'قراردادها و حسابرسی‌ها'
description: 'آدرس‌های قرارداد Hipo روی شبکهٔ اصلی، چهار حسابرسی امنیتی مستقل، و مکان مطالعهٔ سورس‌کد.'
---

## آدرس‌های شبکهٔ اصلی

| قرارداد                                                                         | آدرس                                                                                                                         |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| خزانه (قرارداد اصلی پروتکل، دریافت‌کنندهٔ واریزها و نگه‌دارندهٔ GRAM استیک‌شده) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / مستر جتون (hGRAM)                                                      | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| جتون HPO                                                                        | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
آدرس Parent می‌تواند با ارتقای پروتکل تغییر کند — [ریدمی مخزن قرارداد](https://github.com/HipoFinance/contract) منبع معتبر است. همیشه پیش از ارسال هر چیزی به یک آدرس، آن را در برابر منابع رسمی Hipo تأیید کنید.
:::

## حسابرسی‌ها

قراردادهای هوشمند Hipo از چهار حسابرسی مستقل عبور کرده‌اند: Quantstamp (فروردین ۱۴۰۴ / آوریل ۲۰۲۵) و ProgramCrafter (اسفند ۱۴۰۲ / مارس ۲۰۲۴) روی قراردادهای نسخهٔ ۲، و TonTech و Daniil Sedov (مهر ۱۴۰۲ / اکتبر ۲۰۲۳) روی نسخهٔ ۱. هر گزارش به‌طور کامل در [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits) منتشر شده است.

## سورس‌کد

- **قراردادها**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — نوشته‌شده با FunC و ابزار Blueprint؛ مجموعه‌تست عمومی از همان مخزن قابل اجراست.
- **سرور MCP**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — پکیج npm با نام `@hipo-finance/mcp`، تحت مجوز MIT.

## هر قرارداد چه کاری انجام می‌دهد

- **خزانه** — قرارداد اصلی پروتکل: GRAM واریزشده را نگه می‌دارد و به وام‌گیرندگان / ولیدیتورها وام می‌دهد.
- **Parent** — مستر جتون (مینتر) که کیف پول‌ها و خزانه از طریق آن ارتباط برقرار می‌کنند.
- **Wallet** — پیاده‌سازی کیف پول جتون مخصوص هر کاربر.
- **Loan** — برای وام‌های اعتبارسنجی به وام‌گیرندگان استفاده می‌شود.
- **Bill** — یک NFT غیرقابل‌انتقال (SBT) که هنگام عدم امکان تکمیل فوری یک عملیات صادر می‌شود، مانند آن‌استیک هنگامی که وجوه در یک دور اعتبارسنجی هستند.
- **Collection** — مجموعهٔ NFTی که بیل‌ها به آن تعلق دارند.
- **Librarian** — کمکی برای استقرار و ذخیره‌سازی قرارداد با استفاده از قابلیت‌های کتابخانهٔ TON.
- **برنامهٔ وام‌گیرنده** — به ولیدیتورها کمک می‌کند برای اعتبارسنجی از پروتکل وام بگیرند.
- **اپ وب** — به کاربران در استیک و آن‌استیک کردن کمک می‌کند.

## اسناد فنی

- [معماری](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — ماشین حالت دور اعتبارسنجی و پایسته‌های پروتکل.
- [راهنمای یکپارچه‌سازی](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — شمای پیام‌ها برای کیف پول‌ها و پروتکل‌ها.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — شمای کامل پیام‌های TL-B.
- [نمودارهای جریان پیام](https://github.com/HipoFinance/contract/tree/main/graphs/img) — یک تصویر برای هر جریان پروتکل.

برای خواندن وضعیت زندهٔ پروتکل — نرخ تبدیل، کارمزدها، زمان‌بندی دور — از [سرور MCP هیپو](/docs/hipo-mcp-server/) استفاده کنید.

## بیشتر در پرسش‌های متداول

- [آیا Hipo حسابرسی شده است؟](/faq/#has-hipo-been-audited)
- [کجا می‌توانم تراکنش‌های Hipo را تأیید کنم؟](/faq/#where-can-i-verify-hipo-transactions)
- [ریسک‌ها](/docs/risks/)
