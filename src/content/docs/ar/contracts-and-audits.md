---
title: 'العقود والتدقيقات'
description: 'عناوين عقود Hipo على الشبكة الرئيسية، والتدقيقات الأمنية المستقلة الأربعة، وأين تقرأ الكود المصدري.'
---

## عناوين الشبكة الرئيسية

| العقد                                                                          | العنوان                                                                                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (عقد البروتوكول الرئيسي، يستلم الإيداعات ويحتفظ بـ GRAM في الستاكينغ) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / الجيتون الرئيسي (hGRAM)                                               | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| جيتون HPO                                                                      | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
يمكن أن يتغيّر عنوان Parent عند ترقيات البروتوكول — [مستودع العقود README](https://github.com/HipoFinance/contract) هو المصدر الموثوق. تحقّق دائمًا من أي عنوان عبر مصادر Hipo الرسمية قبل إرسال أي شيء إليه.
:::

## التدقيقات

خضعت العقود الذكية الخاصة بـ Hipo لأربعة تدقيقات مستقلة: Quantstamp (أبريل ٢٠٢٥) و ProgramCrafter (مارس ٢٠٢٤) على عقود v2، و TonTech و Daniil Sedov (أكتوبر ٢٠٢٣) على v1. كل تقرير منشور بالكامل على [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## الكود المصدري

- **العقود**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — مكتوبة بلغة FunC باستخدام أدوات Blueprint؛ ومجموعة الاختبارات العامة قابلة للتشغيل من ذلك المستودع.
- **خادم MCP**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — حزمة npm باسم `@hipo-finance/mcp` ، برخصة MIT.

## ماذا يفعل كل عقد

- **Treasury** — عقد البروتوكول الرئيسي: يحتفظ بـ GRAM المودعة ويقرضها للمقترضين / الفاليديتورات.
- **Parent** — الجيتون الرئيسي (المُصدِر) الذي تتواصل عبره المحافظ والخزينة.
- **Wallet** — تنفيذ محفظة الجيتون الخاصة بكل مستخدم.
- **Loan** — يُستخدم لقروض التحقق المقدَّمة للمقترضين.
- **Bill** — رمز NFT غير قابل للتحويل (SBT) يُصدَر عندما لا يمكن إتمام عملية فورًا، مثل إلغاء الستاكينغ في حين أن الأموال داخل جولة تحقق.
- **Collection** — مجموعة NFT التي تنتمي إليها الفواتير.
- **Librarian** — أداة مساعدة لنشر العقود وتخزينها باستخدام ميزات المكتبات في TON.
- **Borrower application** — يساعد الفاليديتورات على الاقتراض من البروتوكول لأجل التحقق.
- **Webapp** — يساعد المستخدمين على الإيداع في الستاكينغ وإلغاء الستاكينغ.

## المستندات التقنية

- [البنية المعمارية](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — آلة حالة جولة التحقق وثوابت البروتوكول.
- [دليل التكامل](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — مخططات الرسائل للمحافظ والبروتوكولات.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — مخططات رسائل TL-B الكاملة.
- [مخططات تدفّق الرسائل](https://github.com/HipoFinance/contract/tree/main/graphs/img) — صورة واحدة لكل تدفّق في البروتوكول.

لقراءة حالة البروتوكول الحيّة — سعر الصرف، والرسوم، وتوقيت الجولة — استخدم [Hipo MCP Server](/docs/hipo-mcp-server/).

## المزيد في الأسئلة الشائعة

- [هل خضع Hipo للتدقيق؟](/faq/#has-hipo-been-audited)
- [أين يمكنني التحقّق من معاملات Hipo؟](/faq/#where-can-i-verify-hipo-transactions)
- [المخاطر](/docs/risks/)
