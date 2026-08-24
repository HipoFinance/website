---
title: 'Komisyonlar ve Gas'
description: "Hipo ile stake etmenin ve unstake etmenin gerçek maliyeti: stake ettiğinizden protokol payı alınmaz, yönetişim komisyonu şu anda %0'dır ve gas ön ödemesinin kullanılmayan kısmı iade edilir."
---

## Hipo, stake ettiğinizden pay almaz

Hipo, stake ettiğiniz GRAM'dan protokol komisyonu almaz. Protokol düzeyindeki tek komisyon aşağıda açıklanan yönetişim komisyonudur; bir staking veya unstake işlemine eklenen diğer her şey, Hipo geliri değil, TON'a ödenen ağ gası (gas) ücretidir.

## Yönetişim komisyonu

Protokolde, doğrulama ödülleri üzerinden alınan ve [Hipo DAO](/docs/dao/) tarafından belirlenen bir yönetişim komisyonu vardır; şu anda %0'dır. Yalnızca doğrulama ödüllerine uygulanır, stake ettiğiniz GRAM'a asla uygulanmaz ve %0'da kaldığı sürece ödüller hGRAM sahiplerine tam olarak aktarılır. Herhangi bir değişiklik bir DAO oylamasından geçer ve zincir üzerinde görünür — bkz. [Hipo ödüllerimden pay alıyor mu?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Gas ön ödemeleri ve iadeleri

Stake ettiğinizde veya unstake ettiğinizde, üstüne küçük bir gas ön ödemesi eklenir (şu anda 0,1 GRAM); bunun yalnızca bir kısmı — GRAM'ın yüzde biri mertebesinde — harcanır, geri kalanı iade edilir. İki akış, iadenin ne zaman geldiği bakımından farklıdır:

- **Yatırma**: ön ödeme, stake edilen miktarın üzerine biner ve kullanılmayan kısım kısa süre sonra ayrı bir fazlalık transferi olarak cüzdanınıza döner.
- **Unstake**: ön ödeme token yakma işlemiyle birlikte gider ve talep anında çok azı döner ya da hiç dönmez — kullanılmayan kalan kısım, nihai GRAM çekimiyle birlikte ödenir.

## Kendi rakamlarınızı okumak

Unstake iadesi çekimle birlikte geldiği için, ham çekim ödemesi saf staking ödülünü bir miktar olduğundan fazla gösterir: iade edilen gası da taşır. Bir cüzdanın gerçek staking getirisini ölçmek için her döngüdeki tüm akışları netleştirin: (gönderilen yatırmalar − yatırma iadeleri) ile (talep anındaki iadeler + çekim ödemesi). [Ödüller sayfası](/rewards/) ödüllerinizi sizin için takip eder.

## Güncel tutarlar nereden geliyor

Gas fiyatları TON ağı tarafından belirlenir ve ağla birlikte değişir; bu nedenle bir belgede yazılı sabit hiçbir rakam doğru kalmaz. [Hipo uygulaması](/stake/) onaylamadan önce tam ön ödeme tutarını gösterir. Yetkili kaynak, hazinenin `get_treasury_fees` getter'ıdır; bu aynı zamanda [Hipo MCP Server](/docs/hipo-mcp-server/)'ın `get_fees` aracı olarak da sunulur.

## Hipo dışındaki maliyetler

hGRAM'ı bir DEX'te swap etmek, Hipo'nun gasını havuzun swap komisyonu artı fiyat etkisiyle değiştirir ve oran protokolden değil havuzdan gelir. Güncel havuz listesi [DeFi sayfasındadır](/defi/); ödünleşimler [Riskler](/docs/risks/) sayfasında ele alınmıştır.

## SSS'de dahası

- [Stake etmenin maliyeti nedir?](/faq/#what-does-it-cost-to-stake)
- [Unstake komisyonu var mı?](/faq/#are-there-any-unstaking-fees)
