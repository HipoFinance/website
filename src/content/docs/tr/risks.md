---
title: 'Riskler'
description: "GRAM'ı Hipo ile stake etmenin riskleri — akıllı sözleşme, validatör, likidite, ödül değişkenliği ve phishing — ve protokolün her biri için ne yaptığı."
---

Staking ve DeFi her zaman risk içerir ve Hipo getiri garantisi vermez. Bu sayfa, GRAM'ı Hipo ile stake etmenin risklerini, protokolün her biri için ne yaptığını ve sizin kendi başınıza neler yapabileceğinizi listeler.

## Akıllı sözleşme riski

Akıllı sözleşmelerdeki hatalar veya güvenlik açıkları fonları etkileyebilir. Hipo'nun sözleşmeleri açık kaynaktır ve dört bağımsız güvenlik denetiminden geçmiştir — v2 sözleşmeleri için Quantstamp (Nisan 2025) ve ProgramCrafter (Mart 2024), v1 için TonTech ve Daniil Sedov (Ekim 2023) — ayrıca Blueprint ile FunC'ta yazılmıştır ve herkese açık bir test paketi vardır. Etkileşimde bulunduğunuz adresleri [Sözleşmeler ve Denetimler](/docs/contracts-and-audits/) sayfasından kendiniz doğrulayın.

## Validatör ve staking riski

Staking ödülleri, validatörlerin TON doğrulama turlarına doğru şekilde katılmasına bağlıdır. Bir validatör stake edilmiş GRAM'ı ödünç alabilmek için önce, o turun azami ceza tutarını ve vaat ettiği ödülü karşılayan bir teminat kilitlemek zorundadır; böylece ceza, stake edilmiş GRAM'dan değil bu teminattan düşülür. Yine de düşük performans, o tur için daha düşük bir ödül olarak yansıyabilir — bkz. [Validatörler ve Pazar Yeri](/docs/introduction/how-does-hipo-work/validators/) ve [Bir validatör düşük performans gösterirse ne olur?](/faq/#what-happens-if-a-validator-underperforms)

## Likidite riski

Anında unstake yalnızca protokol bu miktarı karşılayacak kadar serbest GRAM tuttuğunda başarılı olur; [uygulama](/unstake/) o an mevcut olan azami tutarı gösterir. Tam unstake her zaman gerçekleşir ancak mevcut doğrulama turundan sonra sonuçlanır — en kötü durumda bekleme yaklaşık 36 saati bulabilir. Bunun yerine bir [DEX](/defi/) üzerinden çıkmak havuz likiditesine bağlıdır ve fiyat etkisi taşır — bkz. [Anında unstake neden bazen kullanılamıyor?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Ödül değişkenliği

Ödül oranı, validatör tekliflerine ve ağ koşullarına göre zaman içinde değişir; sabit bir getiri vaat edilmez. Güncel ve geçmiş rakamlar bu sayfada değil, [İstatistikler sayfasındadır](/stats/).

## Phishing riski

Yalnızca resmî Hipo bağlantılarını kullanın ve imzalamadan önce her cüzdan isteğini doğrulayın. Resmî kanallar ve sözleşme adresleri [Phishing Farkındalığı](/docs/security/phishing-awareness-and-prevention/) ve [Sözleşmeler ve Denetimler](/docs/contracts-and-audits/) sayfalarında listelenmiştir.

## Hipo'nun vaat etmediği şeyler

- Sabit getiri yok — ödüller her doğrulama turunda değişir.
- Risksiz staking yok — yukarıdaki riskler her zaman geçerlidir.
- Her durumda anında yerel çekim yok — Anında seçeneği protokol likiditesine bağlıdır.

## SSS'de daha fazlası

- [Fonlarımı kaybedebilir miyim?](/faq/#can-i-lose-my-funds)
- [Hipo güvenli mi?](/faq/#is-hipo-safe)
