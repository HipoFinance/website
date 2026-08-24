---
title: 'कॉन्ट्रैक्ट्स और ऑडिट'
description: 'Hipo के मेननेट कॉन्ट्रैक्ट पते, चार स्वतंत्र सुरक्षा ऑडिट, और सोर्स पढ़ने की जगह।'
---

## मेननेट पते

| कॉन्ट्रैक्ट                                                                                 | पता                                                                                                                          |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (मुख्य प्रोटोकॉल कॉन्ट्रैक्ट, डिपॉज़िट प्राप्त करता है और स्टेक किया GRAM रखता है) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                                              | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| HPO jetton                                                                                  | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
प्रोटोकॉल अपग्रेड पर parent पता बदल सकता है — [कॉन्ट्रैक्ट रिपॉज़िटरी का README](https://github.com/HipoFinance/contract) असली स्रोत है। कभी भी किसी पते पर कुछ भेजने से पहले उसे आधिकारिक Hipo स्रोतों के मुकाबले वेरिफ़ाई करें।
:::

## ऑडिट

Hipo के स्मार्ट कॉन्ट्रैक्ट्स चार स्वतंत्र ऑडिट से गुज़र चुके हैं: v2 कॉन्ट्रैक्ट्स पर Quantstamp (अप्रैल 2025) और ProgramCrafter (मार्च 2024), और v1 पर TonTech व Daniil Sedov (अक्टूबर 2023)। हर रिपोर्ट पूरी तरह से [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits) पर प्रकाशित है।

## सोर्स कोड

- **कॉन्ट्रैक्ट्स**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — Blueprint टूलसेट के साथ FunC में लिखे गए; पब्लिक टेस्ट सुइट उस रिपॉज़िटरी से रन किया जा सकता है।
- **MCP सर्वर**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — npm पैकेज `@hipo-finance/mcp`, MIT लाइसेंस के तहत।

## हर कॉन्ट्रैक्ट क्या करता है

- **Treasury** — मुख्य प्रोटोकॉल कॉन्ट्रैक्ट: डिपॉज़िट किया GRAM रखता है और इसे उधारकर्ताओं / वैलिडेटर्स को लोन देता है।
- **Parent** — jetton master (minter), जिसके ज़रिए वॉलेट्स और ट्रेज़री एक-दूसरे से संवाद करते हैं।
- **Wallet** — हर यूज़र के लिए jetton वॉलेट इम्प्लीमेंटेशन।
- **Loan** — उधारकर्ताओं को दिए जाने वाले वैलिडेशन लोन के लिए उपयोग होता है।
- **Bill** — एक नॉन-ट्रांसफ़रेबल NFT (SBT), जो तब जारी किया जाता है जब कोई ऑपरेशन तुरंत पूरा नहीं हो सकता, जैसे कि वैलिडेशन राउंड के दौरान फ़ंड होने पर अनस्टेक।
- **Collection** — वह NFT कलेक्शन जिससे बिल्स संबंधित हैं।
- **Librarian** — TON लाइब्रेरी फ़ीचर्स का उपयोग करके कॉन्ट्रैक्ट डिप्लॉयमेंट और स्टोरेज के लिए एक हेल्पर।
- **Borrower application** — वैलिडेशन के लिए वैलिडेटर्स को प्रोटोकॉल से उधार लेने में मदद करता है।
- **Webapp** — यूज़र्स को स्टेक और अनस्टेक करने में मदद करता है।

## तकनीकी दस्तावेज़

- [Architecture](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — वैलिडेशन-राउंड स्टेट मशीन और प्रोटोकॉल इनवेरिएंट्स।
- [Integration guide](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — वॉलेट्स और प्रोटोकॉल्स के लिए मैसेज स्कीमा।
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — पूरे TL-B मैसेज स्कीमा।
- [Message-flow diagrams](https://github.com/HipoFinance/contract/tree/main/graphs/img) — हर प्रोटोकॉल फ़्लो के लिए एक इमेज।

लाइव प्रोटोकॉल स्टेट — एक्सचेंज रेट, शुल्क, राउंड टाइमिंग — पढ़ने के लिए [Hipo MCP Server](/docs/hipo-mcp-server/) का उपयोग करें।

## FAQ में और जानकारी

- [क्या Hipo का ऑडिट हुआ है?](/faq/#has-hipo-been-audited)
- [मैं Hipo ट्रांज़ैक्शन कहां वेरिफ़ाई कर सकता हूं?](/faq/#where-can-i-verify-hipo-transactions)
- [जोखिम](/docs/risks/)
