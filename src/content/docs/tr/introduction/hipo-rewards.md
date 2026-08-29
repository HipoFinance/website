---
title: 'Hipo Ödülleri'
---

Amacımız Hipo'yu, değerin ve karar alma gücünün topluluğa geçtiği gerçek anlamda toplulukla yönetilen bir protokol olarak inşa etmektir.

Hipo ile GRAM stake etmek size üç ayrı akıştan, üç farklı zamanlamayla ödeme yapar:

- **Temel ödüller**\
  hGRAM'ın GRAM karşısındaki dönüşüm oranına yansıyan GRAM staking ödülleri — **her doğrulama turunda** (~18 saat) hesaba geçer, talep etmeniz gereken bir şey olmaz
- **Artırılmış ödüller**\
  Stake'inizin GRAM cinsinden değeri üzerinden, [Hipo Club](https://t.me/HipoFinanceBot/join) seviyenizin belirlediği bir katsayıyla ek HPO — **her doğrulama turunda** birikir, bakiyeniz 1.000 HPO'yu aştığında çekilebilir
- **Ekstra ödüller**\
  HPO tutun → protokol gelirinden pay alın — **her Hipo Club sezonunun sonunda** ödenir

Üçü de [Hipo uygulamasından](/rewards/) ve [Hipo Club](https://t.me/HipoFinanceBot/join) üzerinden takip edilebilir.

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

- **HPOrewardRate** şu anda **0,0021902**. Yönetişim tarafından belirlenir ve değişebilir.
- **LevelRate**, Hipo Club seviyenize bağlı olan katsayıdır.

Bir doğrulama turu 65.536 saniye — yaklaşık 18,2 saat — sürer, dolayısıyla yılda kabaca **481 tur** vardır. Güncel oranda, stake'inizdeki her GRAM 1. seviyede yılda yaklaşık **1,05 HPO** kazandırır.

Hesabın temeli, stake'inizin **şu anda GRAM cinsinden ne ettiğidir** — güncel dönüşüm oranıyla hGRAM bakiyeniz — başlangıçta yatırdığınız miktar değil. Temel ödüller bu değeri her turda yukarı ittiği için HPO ödülleriniz de onunla birlikte büyür: iki akış birlikte bileşik kazanç sağlar.

### Seviye katsayıları

Katsayı, seviye numarasının kendisi değildir — 1× ile başlar ve yükseldikçe hızlanır:

| Seviye | 1    | 2    | 3    | 4    | 5   | 6   | 7    | 8    | 9    | 10  |
| ------ | ---- | ---- | ---- | ---- | --- | --- | ---- | ---- | ---- | --- |
| Oran   | 1,0× | 1,2× | 1,6× | 2,2× | 3×  | 4×  | 5,2× | 6,6× | 8,2× | 10× |

Her seviye bir öncekinden daha değerlidir: 1. seviyeden 2. seviyeye geçmek 0,2× ekler, 9. seviyeden 10. seviyeye geçmek ise 1,8× — dokuz katı. Yükselmenin ödülü sona doğru ağırlaşır.

### Pratikte ne kadar ediyor

Güncel oranda yıllık HPO ödülleri:

| Stake (GRAM) | 1. seviye (1×) | 5. seviye (3×) | 10. seviye (10×) |
| ------------ | -------------- | -------------- | ---------------- |
| 1.000        | ~1.055 HPO     | ~3.164 HPO     | ~10.546 HPO      |
| 5.000        | ~5.273 HPO     | ~15.819 HPO    | ~52.732 HPO      |
| 10.000       | ~10.546 HPO    | ~31.639 HPO    | ~105.463 HPO     |
| 50.000       | ~52.732 HPO    | ~158.195 HPO   | ~527.316 HPO     |

### Değeri ne kadar

HPO ödülleri, piyasa fiyatı olan bir tokenle ödenir ve o fiyat değişir. HPO'nun 29 Ağustos 2026 tarihli piyasa fiyatıyla değerlendirildiğinde, bu artış efektif yıllık getirinize 1. seviyede kabaca **0,18 yüzde puanı**, 10. seviyede ise kabaca **1,8 yüzde puanı** ekler.

Yani 10. seviyedeki bir staker, yaklaşık olarak [İstatistikler sayfasındaki](/stats/) GRAM staking APY'sini, **artı HPO cinsinden yaklaşık %1,8** kazanır.

:::note
Bunu bilinçli olarak böyle ifade ediyoruz. Büyük bir HPO rakamı tek başına ne kazandığınızı anlatmaz ve HPO piyasası küçüktür — token seyrek işlem görür, dolayısıyla büyük bir HPO pozisyonunun değeri küçük bir pozisyonunkiyle aynı değildir. Bunu sonradan şaşırarak öğrenmenizdense baştan bilmenizi tercih ederiz.
:::

### Seviyeler

Seviyeniz yukarıdaki her şeyi çarpar: 10. seviyede aynı stake, 1. seviyede kazandığının on katını kazanır. Ayrıca davet ettiğiniz kişilerin ürettiği HPO ödüllerinin %1'ini de kazanırsınız.

Seviye atlamanın iki yolu vardır:

- **Sezonluk yükseltme** — sezon boyunca kazandığınız ödülleri en az bir kez talep edin; seviyeniz sezonun sonunda otomatik olarak yükselir.
- **Anında yükseltme** — seviye atlama ücretini ödeyin, seviyeniz hemen yükselsin.

İki kural önemlidir:

- **Ödül olarak aldığınız HPO'yu satmak sizi 1. seviyeye sıfırlar.** Club, elde tutan kişileri ödüllendirmek üzere tasarlanmıştır ve mekanizma budur. Ödül HPO'yu bir borsaya ya da Club'a bağlamadığınız bir cüzdana göndermek satmak sayılır; kendi bağlı cüzdanlarınız arasında taşımak sayılmaz — bkz. [Birden fazla cüzdan kullanma](/docs/wallets-and-rewards/).
- **Talep penceresi yoktur.** Ödüller her turda birikir ve bakiyeniz en az **1.000 HPO** olduğunda istediğiniz zaman çekilebilir.

## Ekstra ödüller: kâr paylaşımı

HPO, Hipo'nun yönetişim tokenidir. Onu tutmak size [DAO'da](/docs/dao/) oy hakkı ve her Hipo Club sezonunun sonunda dağıtılan protokol gelirinden bir pay verir — bkz. [Kâr paylaşımı](/docs/profit-sharing/).

:::note
[Yönetişim komisyonu](/docs/fees-and-gas/) **%0** olduğu sürece protokol gelir toplamaz, dolayısıyla bu akışta dağıtılacak bir şey de olmaz. Komisyon geri geldiğinde kâr paylaşımı da geri gelir. Temel ödülleri bu kadar yüksek yapan şey, %0'lık komisyondur.
:::

Ne kadar çok katılırsanız o kadar çok kazanır ve Hipo'nun geleceğini şekillendirmede o kadar büyük rol oynarsınız.

---

_HPOrewardRate, seviye eşikleri, hGRAM dönüşüm oranı ve HPO piyasa fiyatının hepsi değişir. Bu sayfadaki rakamlar son gözden geçirme tarihi itibarıyla günceldir ve gelecekteki ödüllerin garantisi değildir. Canlı protokol rakamları her zaman [İstatistikler sayfasındadır](/stats/)._
