---
title: 'Sözleşmeler ve denetimler'
description: 'Hipo’nun ana ağ sözleşme adresleri, dört bağımsız güvenlik denetimi ve kaynak kodun nerede okunacağı.'
---

## Ana ağ (mainnet) adresleri

| Sözleşme                                                                             | Adres                                                                                                                        |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (ana protokol sözleşmesi, yatırılanları alır ve stake edilmiş GRAM'ı tutar) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                                       | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| HPO jettonu                                                                          | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
Parent adresi protokol yükseltmelerinde değişebilir — doğru bilgi kaynağı [sözleşme deposunun README dosyasıdır](https://github.com/HipoFinance/contract). Bir adrese herhangi bir şey göndermeden önce adresi mutlaka resmi Hipo kaynaklarıyla doğrulayın.
:::

## Denetimler

Hipo’nun akıllı sözleşmeleri dört bağımsız güvenlik denetiminden geçti: v2 sözleşmeleri için Quantstamp (Nisan 2025) ve ProgramCrafter (Mart 2024), v1 için TonTech ve Daniil Sedov (Ekim 2023). Tüm raporlar [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits) adresinde tam olarak yayımlanmıştır.

## Kaynak kodu

- **Sözleşmeler**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — Blueprint araç seti ile FunC dilinde yazıldı; açık test paketi bu depodan çalıştırılabilir.
- **MCP sunucusu**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — npm paketi `@hipo-finance/mcp`, MIT lisanslı.

## Her sözleşme ne yapar

- **Treasury** — ana protokol sözleşmesi: yatırılan GRAM'ı tutar ve borç alanlara / validatörlere kredi olarak verir.
- **Parent** — cüzdanların ve hazinenin üzerinden haberleştiği jetton master (üretici) sözleşmesidir.
- **Wallet** — kullanıcı başına jetton cüzdanı uygulamasıdır.
- **Loan** — borç alanlara verilen doğrulama kredileri için kullanılır.
- **Bill** — bir işlem anında tamamlanamadığında (örneğin varlıklar bir doğrulama turundayken yapılan unstake işleminde) verilen, transfer edilemeyen bir NFT'dir (SBT).
- **Collection** — bill'lerin ait olduğu NFT koleksiyonudur.
- **Librarian** — TON kütüphane özelliklerini kullanarak sözleşme dağıtımı ve depolamasına yardımcı olur.
- **Borrower application** — validatörlerin doğrulama için protokolden borç almasına yardımcı olur.
- **Webapp** — kullanıcıların stake ve unstake etmesine yardımcı olur.

## Teknik dokümanlar

- [Mimari](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — doğrulama turu durum makinesi ve protokol değişmezleri.
- [Entegrasyon rehberi](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — cüzdanlar ve protokoller için mesaj şemaları.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — eksiksiz TL-B mesaj şemaları.
- [Mesaj akışı diyagramları](https://github.com/HipoFinance/contract/tree/main/graphs/img) — her protokol akışı için bir görsel.

Canlı protokol durumunu — dönüşüm oranı, komisyonlar, tur zamanlaması — okumak için [Hipo MCP Server](/docs/hipo-mcp-server/) kullanın.

## SSS'de daha fazlası

- [Hipo denetimden geçti mi?](/faq/#has-hipo-been-audited)
- [Hipo işlemlerini nerede doğrulayabilirim?](/faq/#where-can-i-verify-hipo-transactions)
- [Riskler](/docs/risks/)
