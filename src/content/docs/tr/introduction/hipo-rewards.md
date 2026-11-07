---
title: 'Hipo Ödülleri'
---

Amacımız Hipo'yu, değerin ve karar alma gücünün topluluğa geçtiği gerçek anlamda toplulukla yönetilen bir protokol olarak inşa etmektir.

Hipo ile GRAM stake etmek size üç ayrı akıştan, üç farklı zamanlamayla ödeme yapar:

- **Temel ödüller**\
  hGRAM'ın GRAM karşısındaki dönüşüm oranına yansıyan GRAM staking ödülleri — **her doğrulama turunda** (~18 saat) hesaba geçer, talep etmeniz gereken bir şey olmaz
- **Artırılmış ödüller**\
  Stake'inizin GRAM cinsinden değeri üzerinden, [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) seviyenizle güçlendirilmiş ek HPO — **her doğrulama turunda** birikir, 100 HPO'ya ulaştığınızda 1 GRAM ücretle talep edilebilir
- **Ekstra ödüller**\
  HPO tutun → protokol gelirinden pay alın — protokol ücreti %0 olduğu sürece **duraklatılmıştır**

Üçü de [Hipo Club](/club/) üzerinden, web sitesinde veya Telegram'daki [Hipo uygulamasında](https://t.me/HipoApp) takip edilebilir.

## Temel ödüller: dönüşüm oranı

GRAM stake eder, hGRAM alırsınız. Kilitlenme yoktur ve talep etmeniz gereken bir şey olmaz: doğrulama ödülleri protokolün içinde birikir, böylece her hGRAM zamanla daha fazla GRAM değerinde olur. hGRAM bakiyeniz hiç değişmez — değeri değişir.

Ana akış budur ve [İstatistikler sayfasındaki](/stats/) APY de bunu ifade eder. Hipo stake'inizden pay almadığı ve [yönetişim komisyonu](/docs/fees-and-gas/) şu anda %0 olduğu için, doğrulama ödülünün tamamı dönüşüm oranına akar.

## Artırılmış ödüller: Hipo Club'dan gelen HPO

Dönüşüm oranının üstüne, [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) hGRAM tuttuğunuz için size HPO öder. Bu akış ayrıdır, GRAM yerine HPO olarak ödenir ve onu Club'da çekersiniz.

### Formül

Her doğrulama turunda her üye şu kadar kazanır:

```
HPO reward = GRAM value of your stake × HPOrewardRate × LevelRate
```

- **HPOrewardRate** şu anda **0,0015295**. Yönetişim tarafından belirlenir ve değişebilir.
- **LevelRate**, Hipo Club seviyenize bağlı olan katsayıdır.

Bir doğrulama turu 65.536 saniye — yaklaşık 18,2 saat — sürer, dolayısıyla yılda kabaca **481 tur** vardır. Güncel oranda, stake'inizdeki her GRAM 1. seviyede yılda yaklaşık **0,74 HPO** kazandırır.

Hesabın temeli, stake'inizin **şu anda GRAM cinsinden ne ettiğidir** — güncel dönüşüm oranıyla hGRAM bakiyeniz — başlangıçta yatırdığınız miktar değil. Temel ödüller bu değeri her turda yukarı ittiği için HPO ödülleriniz de onunla birlikte büyür: iki akış birlikte bileşik kazanç sağlar.

### Seviye katsayıları

6. Sezon'dan (31 Ekim 2026) itibaren katsayı, seviye numaranızdır:

| Seviye | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Oran   | 1×  | 2×  | 3×  | 4×  | 5×  | 6×  | 7×  | 8×  | 9×  | 10× |

Her seviye aynı 1× değerini ekler: 2. seviye 1. seviyenin iki katını, 5. seviye beş katını, 10. seviye on katını kazanır. 5. Sezon'un sonuna kadar oran daha dik yükseliyordu: 2. seviyede 1,2×'ten 9. seviyede 8,2×'e.

### Pratikte ne kadar ediyor

Güncel oranda yıllık HPO ödülleri:

| Stake (GRAM) | 1. seviye (1×) | 5. seviye (5×) | 10. seviye (10×) |
| ------------ | -------------- | -------------- | ---------------- |
| 1.000        | ~736 HPO       | ~3.680 HPO     | ~7.360 HPO       |
| 5.000        | ~3.680 HPO     | ~18.400 HPO    | ~36.800 HPO      |
| 10.000       | ~7.360 HPO     | ~36.800 HPO    | ~73.600 HPO      |
| 50.000       | ~36.800 HPO    | ~184.000 HPO   | ~368.000 HPO     |

### Değeri ne kadar

HPO ödülleri, piyasa fiyatı olan bir tokenle ödenir ve o fiyat değişir. HPO'nun 16 Ekim 2026 tarihli piyasa fiyatıyla değerlendirildiğinde, bu artış efektif yıllık getirinize 1. seviyede kabaca **0,22 yüzde puanı**, 10. seviyede ise kabaca **2,2 yüzde puanı** ekler.

Yani 10. seviyedeki bir staker, yaklaşık olarak [İstatistikler sayfasındaki](/stats/) GRAM staking APY'sini, **artı HPO cinsinden yaklaşık %2,2** kazanır.

:::note
Bunu bilinçli olarak böyle ifade ediyoruz. Büyük bir HPO rakamı tek başına ne kazandığınızı anlatmaz ve HPO piyasası küçüktür — token seyrek işlem görür, dolayısıyla büyük bir HPO pozisyonunun değeri küçük bir pozisyonunkiyle aynı değildir. Bunu sonradan şaşırarak öğrenmenizdense baştan bilmenizi tercih ederiz.
:::

### Seviyeler

Seviyeniz yukarıdaki her şeyi çarpar: 10. seviyede aynı stake, 1. seviyede kazandığının on katını kazanır. Ayrıca davet ettiğiniz kişilerin ürettiği HPO ödüllerinin %1'ini de kazanırsınız.

Seviye atlamanın iki yolu vardır:

- **Sezonluk yükseltme** — sezon boyunca en az bir kez talep edin ve sezon bittiğinde Seviye minimumunuzun üzerinde olun; sonraki sezon başladığında bir seviye atlarsınız.
- **Anında yükseltme** — seviye atlama ücretini GRAM olarak ödeyin ve hemen bir seviye atlayın.

İki kural önemlidir:

- **Seviye minimumunuzu koruyun.** Talep ettiğiniz her şey ona eklenir ve Club cüzdanınızın, cüzdanda ya da desteklenen likidite havuzlarında, en az o kadar HPO tutması gerekir. Altına düşerseniz tam güçlendirmenizle 24 saatlik ek süreniz olur; sonra seviyeniz askıya alınır ve 1× kazanır, 7 gün daha geçince Seviye 1'e dönersiniz. Club, elde tutan kişileri ödüllendirmek üzere tasarlanmıştır ve mekanizma budur — bkz. [Hipo Club](/docs/giveaways-and-prizes/hipo-club/).
- **Talep penceresi yoktur.** Ödüller her turda birikir ve en az **100 HPO**'nuz olduğunda, 1 GRAM ücretle istediğiniz zaman talep edilebilir.

## Ekstra ödüller: kâr paylaşımı

HPO, Hipo'nun yönetişim tokenidir. Onu tutmak size [DAO'da](/docs/dao/) oy hakkı ve protokol ücreti %0 olduğu sürece duraklatılmış olan protokol gelirinden bir pay verir — bkz. [Kâr paylaşımı](/docs/profit-sharing/).

:::note
[Yönetişim komisyonu](/docs/fees-and-gas/) **%0** olduğu sürece protokol gelir toplamaz, dolayısıyla bu akışta dağıtılacak bir şey de olmaz. Komisyon geri geldiğinde kâr paylaşımı da geri gelir. Temel ödülleri bu kadar yüksek yapan şey, %0'lık komisyondur.
:::

Ne kadar çok katılırsanız o kadar çok kazanır ve Hipo'nun geleceğini şekillendirmede o kadar büyük rol oynarsınız.

---

_HPOrewardRate, seviye eşikleri, hGRAM dönüşüm oranı ve HPO piyasa fiyatının hepsi değişir. Bu sayfadaki rakamlar son gözden geçirme tarihi itibarıyla günceldir ve gelecekteki ödüllerin garantisi değildir. Canlı protokol rakamları her zaman [İstatistikler sayfasındadır](/stats/)._
