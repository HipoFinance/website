---
title: 'Uygulama Olmadan Staking'
description: 'Dapp işlemlerini imzalayamayan multisig, soğuk ve diğer cüzdanlar için düz cüzdan transferleriyle Hipo üzerinde stake ve unstake yapın.'
---

## Buna ne zaman ihtiyaç duyarsınız

Bu sayfa, dapp işlemlerini imzalayamayan cüzdanlar — multisig cüzdanlar ve bazı soğuk cüzdanlar — içindir. Diğer herkes daha ucuz olan ve onaylamadan önce tam tahmini gösteren [Hipo uygulamasını](/stake/) kullanmalıdır. Bir multisig cüzdan Hipo uygulamasına bağlandığında uygulama, kopyalanmaya hazır adresler ve değerlerle birlikte bu aynı yönergeleri gösterir.

## Stake — “d” yorumu

Stake etmek istediğiniz GRAM'a **ek olarak 0,1 GRAM**'ı ağ ücreti ön ödemesi olarak Hipo hazinesine gönderin:

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

İşlemin metin yorumunu tam olarak şu şekilde ayarlayın:

```
d
```

Yorum küçük harfli, düz metin ve şifrelenmemiş olmalıdır. Ön ödeme bolca yukarı yuvarlanır — yalnızca küçük bir kısmı harcanır ve kullanılmayan bölüm iade edilir (bkz. [Komisyonlar ve Ağ Ücreti](/docs/fees-and-gas/)). hGRAM, transferin geldiği adrese geri gönderilir.

## Her şeyi stake'ten çıkarma — “w” yorumu

Aynı hazine adresine şu metin yorumuyla 0,1 GRAM gönderin:

```
w
```

Bu işlem, o cüzdanın **tüm** hGRAM bakiyesini stake'ten çıkarır. Yalnızca bir kısmını unstake etmek için bunun yerine ham bir emir kullanın — sonraki bölüme bakın. Unstake normal protokol kuralları çerçevesinde sonuçlanır, dolayısıyla Tam unstake zamanlaması geçerlidir — bkz. [Unstake Nasıl Çalışır](/docs/introduction/how-does-hipo-work/unstaking/) ve [Unstake ne kadar sürer?](/faq/#how-long-does-unstaking-take)

## Bir kısmını unstake etme — ham bir emir

Bir metin yorumu yalnızca her şeyi isteyebilir, çünkü içine bir miktar koyacak yeri yoktur. Kısmi bir unstake, ikili (binary) gövdeli sıradan bir mesajdır, bu yüzden bunu gönderebilen bir cüzdan veya multisig gerekir — multisig.ton.org buna “Arbitrary order” der ve formu tam olarak aşağıdaki üç değeri ister.

Multisig'iniz bağlıyken [Hipo uygulamasını](/unstake/) açın, unstake etmek istediğiniz miktarı yazın ve Unstake'e basın. Uygulama emri oluşturur ve kopyalamaya hazır üç değeri gösterir:

- **Destination Address** (Hedef Adres) — kendi hGRAM cüzdan sözleşmeniz. Bu, hazine değildir: multisig adresinizden türetilen, hGRAM'ınızı tutan sözleşmedir. İmzalamadan önce Tonviewer'da doğrulayın; uygulama oraya bağlantı verir.
- **TON Amount** (TON Miktarı) — 0,1 GRAM, her yerdeki aynı ağ ücreti ön ödemesi, harcanan kısım dışında iade edilir.
- **Order BOC** — mesaj gövdesi, base64 formatında.

Bilinmesi gereken iki şey var. Bu emri yalnızca kendi hGRAM cüzdan sözleşmeniz kabul eder, bu yüzden yanlışlıkla başka bir cüzdandan imzalanırsa geri döner ve hiçbir şey yakılmaz — gönderen cüzdanın elindeki bakiyeyi ne olursa olsun unstake eden “w” yorumunun aksine. Ve anında oranı seçtiyseniz, ne kadarının anında geri alınabileceği her turda değişir: hemen imzalayın veya başka imzaları beklemesi gereken bir emir için en iyi oranı seçin.

## Minter aracılığıyla hGRAM yakma

hGRAM master (Parent) adresini kullanarak [minter.ton.org](https://minter.ton.org/) üzerinde hGRAM yakarak da doğrudan GRAM alabilirsiniz:

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

Yakma işleminden sonra güncel geri alım oranıyla GRAM alırsınız. Parent adresi protokol yükseltmelerinde değişebilir — önce [Sözleşmeler ve Denetimler](/docs/contracts-and-audits/) sayfasına bakın.

## Ya da bir DEX'te swap yapın

hGRAM havuzları DeDust, STON.fi, TONCO, GroypFi ve swap.coffee üzerinde bulunur — güncel liste [DeFi sayfasındadır](/defi/). Swap komisyonları ve fiyat etkisi geçerlidir.

## Göndermeden önce

- Hazine adresini [Sözleşmeler ve Denetimler](/docs/contracts-and-audits/) sayfasından doğrulayın — iletilmiş bir mesajdaki adrese asla güvenmeyin; bkz. [Phishing Farkındalığı](/docs/security/phishing-awareness-and-prevention/).
- Yorum düz metin ve tam olarak `d` ya da `w` olmalıdır.
- Yorumsuz veya yanlış yorumlu bir transfer, stake ya da unstake talebi sayılmaz.
- Ham bir emir için, hedefin başka bir yerden gelen bir adres değil, kendi hGRAM cüzdan sözleşmeniz olduğunu kontrol edin.

## SSS'de daha fazlası

- [Multisig veya soğuk cüzdanla stake edebilir miyim?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Komisyonlar ve Ağ Ücreti](/docs/fees-and-gas/)
