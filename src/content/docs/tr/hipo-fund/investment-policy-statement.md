---
title: 'Hipo Fund Yatırım Politikası Beyanı'
description: "Hipo Fund'ın nasıl yatırıldığı: hedef dağılım, risk ve yoğunlaşma limitleri, saklama, likidite ve fonun büyümesinden bir payın HPO sahiplerine nasıl döndüğü."
---

:::caution

**Bu, topluluk incelemesi altında bir taslaktır. Henüz yürürlükte değildir.**

:::

**Taslak v1.5 · Topluluk incelemesi ve DAO onayı için**

---

## Bir bakışta

_Politikanın tamamı aşağıda yer alır. İkisi farklılık gösterdiğinde numaralı bölümler geçerlidir._

**Hedef dağılım.** HPO dağılımın dışında tutulur. Geri kalan her şey:

| Dilim                                                                      | Hedef | Bant   |
| -------------------------------------------------------------------------- | ----- | ------ |
| Stablecoin getirisi, devreye alınmış                                       | %45   | %35–55 |
| Fırsat Rezervi — yalnızca bir Bitcoin düşüş tetikleyicisinde devreye girer | %10   | %5–15  |
| Bitcoin, doğrudan tutulan                                                  | %30   | %20–35 |
| hGRAM                                                                      | %12   | %8–18  |
| Operasyonel nakit ve gaz                                                   | %3    | %2–6   |

**Temel limitler.**

|                                                     |                  |
| --------------------------------------------------- | ---------------- |
| TON ekosistemi varlıkları (HPO + hGRAM + GRAM)      | Fonun ≤ %45'i    |
| Hiçbir ihraççının donduramadığı varlıklar           | Fonun ≥ %20'si   |
| Herhangi bir tek protokol veya tek ihraççı          | Fonun ≤ %30'u    |
| Çoklu imza (multisig) saklaması dışındaki varlıklar | %0               |
| Kaldıraç                                            | Sıfır, her zaman |

**HPO sahipleri neler kazanır.**

| Kanal              | Nasıl işler                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Değer getirisi** | Yüksek su işaretinin üzerinde fon, birikmiş büyümesinin yarısına kadarını HPO sahiplerine geri verir; bu, yılda fon değerinin %2'sine kadar bir hızla sınırlıdır. Hız sınırlayıcı üst sınır tarafından geride tutulan büyüme kaybedilmez, sıraya alınır. Hipo Club kâr paylaşımı yoluyla veya HPO satın alınıp yakılarak ödenir — DAO, tutarı değil biçimi oylar. |
| **Varlık desteği** | Fonun değerinin HPO'nun piyasa değerine oranı her çeyrekte yayımlanır.                                                                                                                                                                                                                                                                                            |
| **Yönetişim**      | HPO sahipleri bu politikayı, ona yapılan her değişikliği ve fonun HPO'sunun her satışını oylar.                                                                                                                                                                                                                                                                   |

**On kural.**

1. **Kaldıraç yok, türev ürün yok, piyasa yapıcılığı yok.** Hiçbir büyüklükte, hiçbir zaman.
2. **Fon, tutmak amacıyla HPO satın almaz.** Yakmak amacıyla HPO satın alabilir; bu yalnızca kazançlardan fonlanır — bkz. Bölüm 2.2 ve 8.
3. **Fon, HPO piyasa likiditesinin veya operasyonel fonların kaynağı değildir.**
4. **Tüm varlıklar, 3 imzadan 2'sinin gerektiği çoklu imzalı (multisig) cüzdanlarda tutulur** — biri TON'da, biri EVM'de, biri Bitcoin'de.
5. **Her pozisyon, doğrudan kendi sözleşmesinden çekilebilir olmalıdır** — hiçbir operatörün veya arayüzün iznine gerek kalmadan.
6. **Piyasa zamanlaması yok.** Düşükten alıp yüksekten satmayı, mekanik biçimde yeniden dengeleme bantları yapar.
7. **Fırsat Rezervi yalnızca bir tetikleyici üzerine devreye girer** — Bitcoin, geriye dönük 12 aylık zirvesinin %40, %55 ve %70 altına düştüğünde, üç eşit dilimde.
8. **Bu fonu yönetmek için kimseye ödeme yapılmaz.** Yönetim ücreti yok, performans ücreti yok.
9. **Her çeyrekte bir rapor,** tek bir zincir üstü bloktan, kuruluştan bu yana performans ve her limitin güncel değeriyle birlikte.
10. **Çerçeveyi DAO belirler; imza sahipleri bu çerçeve içinde uygular.**

**Açıkça belirtilmesi gereken bir şey.** Bu dağılımda fon yılda kabaca %2 kazanır. Yüksek su işareti (high-water mark), fona konulan sermayedir — yaklaşık 224.056 $ — ve fon bu işaretin üzerine çıkana kadar hiçbir değer getirisi ödenmez. Bu politika hızla toparlanmak için değil, istikrarlı biçimde bileşiklenmek ve piyasa döngülerinin tamamına dayanmak için kurulmuştur.

---

## 1. Amaç ve köken

Hipo Fund, Nisan 2025'te HPO ilk arzının (ILO) gelirleriyle ve Hipo Club sezonlarından gelen HPO claim'leriyle birlikte kuruldu. Bu sermaye ekibe tahsis edilmedi ve Hipo'nun operasyonel bütçesine dahil edilmedi. Ayrı, herkese açık bir hazineye yerleştirildi ve yıllarla ölçülen bir ufukta Hipo ekosistemi ve HPO sahipleri için çalışması amacıyla bir kenara konuldu.

Bu belge, bu sermayenin nasıl yatırıldığını ortaya koyar: fonun neyi tutabileceğini, herhangi bir şeyden ne kadar tutabileceğini, neyi kimin karar verdiğini, değerin HPO sahiplerine nasıl geri aktığını ve tüm bunların nasıl raporlandığını.

Yazılı bir politika kararları tekrarlanabilir kılar; böylece fonun davranışı o ay kimin dikkat ettiğine bağlı olmaz. Kararları incelenebilir kılar; böylece topluluk yalnızca sonucu değil süreci de değerlendirebilir. Ve limitleri, üzerinde anlaşmanın kolay olduğu anda, ihtiyaç duyulmadan önce yerine koyar.

DAO oylamasıyla onaylandıktan sonra bu politika, fonun imza sahipleri için bağlayıcıdır.

---

## 2. Görev ve hedefler

Hipo Fund uzun vadeli bir yatırım hazinesidir. Öncelik sırasına göre hedefleri:

1. Piyasa döngülerinin tamamında **sermayeyi korumak**.
2. Yıllarla ölçülen bir ufukta **fonun reel değerini büyütmek**.
3. Bu büyümenin bir payını, sürdürülebilir biçimde ve ana parayı tüketmeden **HPO sahiplerine geri vermek**.

### Hipo Fund ne değildir

- **Bir alım satım hesabı değildir.** Kısa vadeli pozisyonlar almaz ve piyasa zamanlaması yapmaya çalışmaz.
- **HPO piyasa likiditesinin kaynağı değildir.** HPO piyasasına likidite sağlamak, HPO'nun hazine ve pazarlama tahsislerinden fonlanan bir tokenomi kararıdır.
- **Operasyonel fonların kaynağı değildir.** Fon, Hipo'nun operasyonel bütçesinden ayrıdır ve giderler için kullanılamaz.

### 2.1 Hipo Fund, HPO sahiplerine değeri nasıl döndürür

Hipo, gelir akışlarından HPO sahiplerine değeri iki yerleşik yöntemle döndürür: Hipo Club kâr paylaşımı yoluyla ve HPO'yu piyasadan satın alıp yakarak. Hipo Fund'ın bu akışlardan bir diğeri hâline gelmesi amaçlanmıştır.

Fon, yüksek su işaretinin ötesine büyüdüğünde, bu büyümenin bir payı Bölüm 2.2'deki kural uyarınca her yıl HPO sahiplerine tahsis edilir. Alacağı biçim — kâr paylaşımı ya da geri alıp yakma — bir dağıtım vadesi geldiğinde, Hipo'nun hâlihazırda işlettiği altyapı kullanılarak seçilir.

Her iki biçim de gerçek değer döndürür; bunu farklı biçimlerde yaparlar ve seçim, o andaki koşulları yansıtmalıdır:

- **Geri alıp yakma**, HPO arzını kalıcı olarak azaltır ve kimsenin bir talepte bulunmasına gerek kalmadan her sahibine fayda sağlar. HPO, fonun varlıklarının ve protokolün temellerinin desteklediği düzeyin altında işlem gördüğünde en fazla değeri yaratır, çünkü bir yakma yalnızca tokenler değerinin altında satın alındığında değer katıcıdır. Maliyeti piyasa etkisidir: sığ bir piyasada harcamanın bir kısmı arz satın almak yerine fiyatı hareket ettirir.
- **Kâr paylaşımı**, her doları piyasa etkisi olmadan orantılı biçimde sahiplerin eline verir ve HPO'nun açıkça ucuz olmadığı her durumda daha verimli yoldur.

Bunun yanında, fonun değerinin HPO'nun dolaşımdaki piyasa değerine oranı her üç aylık raporda yayımlanır. Bu, HPO'nun değerlemesinin, tokenin kendisi dışında tutulan varlıklarla desteklenen payıdır ve yükselsin de düşsün de raporlanır.

**Ölçek üzerine bir not.** Fonun güncel büyüklüğünde bir değer getirisi mütevazı olurdu ve fon yüksek su işaretinin altındayken hiçbiri ödenmez. Kural, taahhüt ettiği şey açısından önemlidir: HPO sahiplerine, fon büyüdükçe ölçeklenen ve bir DAO oylaması olmadan değiştirilemeyen, tanımlı ve yayımlanan bir hak tanır.

### 2.2 Değer getirisi kuralı

**Yüksek su işareti (high-water mark).** Fona konulan toplam sermaye, artı fonun HPO sahiplerine şimdiye kadar geri verdiği her şey. Şu anda yaklaşık **224.056 $**'dır. Yeni sermaye konulduğunda ve her değer getirisi tutarı kadar yükselir. Hiçbir zaman düşmez.

**Yüksek su işaretinin altında hiçbir şey geri verilmez.** Önce sermaye yeniden inşa edilir. İşaretin altında ödeme yapmak, ana paradan ödeme yapmaktır.

**Bunun üzerindeyken**, fon her mali yılda HPO değer getirisine şu ikisinin **küçük olanını** tahsis eder:

- **Fonun yüksek su işaretinin üzerindeki değerinin %50'si** ve
- Yılın başındaki **fonun toplam değerinin %2'si**

#### Neden iki sınır var

Bu iki sınırın işlevi farklıdır.

**%50 sınırı, geri verilecek bir şey olup olmadığını belirler.** Fonu, şimdiye kadar içine konulan veya ondan çıkarılan her şeye göre ölçer; bu yüzden fonun büyümediği bir yıl hiçbir şey üretmez — ve hiçbir durumda fonun birikmiş büyümesinin yarısından fazlası ödenmez. Diğer yarısı yatırımda kalır ve çalışmaya devam eder.

**Yıllık üst sınır, ne kadar hızlı ödeneceğini belirler.** Çoğu yılda geçerli olan sınır bu üst sınırdır; %50 sınırı yalnızca yüksek su işaretinin hemen üzerindeki dar bantta uygulanır. Bu kasıtlıdır. Güçlü bir yılın ardından ağır ödeme yapıp sonraki üç yıl hiçbir şey ödemeyen bir fon, istikrarlı ödeyen bir fondan sahiplere daha kötü hizmet eder ve bu büyüklükteki bir hazinenin tek bir büyük ödemeden çok bileşikleşmeye ihtiyacı vardır.

**Üst sınır ödemenin hızını belirler. Onu iptal etmez.** Yüksek su işareti yalnızca fiilen geri verilen tutar kadar yükseldiğinden, üst sınır tarafından geride tutulan büyüme işaretin üzerinde kalır ve sonraki yıllarda dağıtılabilir olmaya devam eder. Hak kazanan hiçbir şey kaybedilmez — sıraya alınır.

_Örnek hesaplama._ Fonun, 224.056 $'lık bir yüksek su işaretine karşı 300.000 $'a ulaştığını varsayalım. İşaretin üzerindeki büyüme 75.944 $'dır, dolayısıyla %50 sınırı 37.972 $'a izin verir — ama üst sınır o yılın getirisini 6.000 $ ile sınırlar. Yüksek su işareti 230.056 $'a yükselir. Fonun değeri sonraki yıl değişmezse işaretin üzerindeki büyüme 69.944 $ olur, üst sınır yine 6.000 $'a izin verir ve bu ödenir. Sınırlanan tutar kaybolmaz; sonraki yıllar boyunca geri verilir.

#### Tutar bir karar değildir

Fon yüksek su işaretinin üzerindeyken tahsis, üç aylık raporda yapılan bir hesaplamadır, bir öneri değildir. Hesaplandıktan sonra HPO sahipleri için bir kenara konur, ödenene kadar taahhüt edilmiş bir tutar olarak raporlanır ve fona geri emilemez.

**Yalnızca biçim oylanır.** İmza sahipleri gerekçeleriyle birlikte kâr paylaşımını, geri alıp yakmayı veya bir bölüşümü önerir ve DAO biçimi onaylar. Onaylanmayan bir öneri gözden geçirilip yeniden getirilir — tahsisin kendisi düşmez. Onu tetikleyen rapordan itibaren 90 gün içinde hiçbir biçim onaylanmazsa tahsis, dış altyapı gerektirmeyen ve engellenemeyen bir geri alıp yakma olarak uygulanır.

**Formül yalnızca bir DAO oylamasıyla değiştirilebilir.** İmza sahipleri bu kural çerçevesinde bir değer getirisini uygulayabilir; onu değiştiremez, erteleyemez veya feragat edemezler.

#### Koşullar

- Fon, getiriden sonra Bölüm 7'deki her limitin içinde kalır
- Gelirden ve olağan yeniden dengeleme yoluyla zaten gerçekleştirilmiş gelirlerden fonlanır — asla Bitcoin'i bandının altında satarak, Fırsat Rezervi'ni kullanarak, fonun HPO'sunu satarak veya yalnızca ödenebilir bir tutar yaratmak için bir pozisyonu tasfiye ederek değil
- Tam tahsisi ödemek herhangi bir dilimi bandının dışına çıkaracaksa, bantların izin verdiği kadarı ödenir ve kalan tutar bir sonraki yıla devreder; yüksek su işareti yalnızca fiilen ödenen tutar kadar yükselir
- Tam hesaplama, öncesi ve sonrasındaki yüksek su işareti de dahil olmak üzere üç aylık raporda yayımlanır

---

## 3. Yönetişim ve karar hakları

| Karar                                                                | Kimin karar verdiği                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Bu politikayı değiştirmek                                            | **DAO oylaması** (bağlayıcı)                                                                                  |
| Değer getirisi formülünü değiştirmek                                 | **DAO oylaması** (bağlayıcı)                                                                                  |
| HPO pozisyonunu azaltmak                                             | **DAO oylaması** (bağlayıcı)                                                                                  |
| Bölüm 5'te listelenmeyen bir varlık sınıfı eklemek                   | **DAO oylaması** (bağlayıcı)                                                                                  |
| Herhangi bir yönetici ücretlendirmesi getirmek                       | **DAO oylaması** (bağlayıcı) — Bölüm 14                                                                       |
| Değer getirisinin alacağı biçim                                      | İmza sahipleri önerir, DAO onaylar. **Tutar** Bölüm 2.2 kapsamında bir hesaplamadır ve oylamaya tabi değildir |
| Onaylı bir varlık sınıfı içinde yeni bir protokol eklemek            | İmza sahipleri, 7 gün içinde duyurulur                                                                        |
| Bir tetikleyici devreye girdiğinde Fırsat Rezervi'ni kullanıma açmak | İmza sahipleri, 7 gün içinde duyurulur                                                                        |
| Bölüm 6'daki bantlar içinde yeniden dengeleme yapmak                 | İmza sahipleri, üç ayda bir raporlanır                                                                        |
| İşlem yeri, zamanlaması ve güzergâhı                                 | İmza sahipleri                                                                                                |

Çerçeveyi ve limitleri DAO belirler; imza sahipleri bunların içinde uygular. Bireysel işlemler oylanmaz — yeniden dengelenmek için oylamaya ihtiyaç duyan bir hazine yeniden dengelenemez.

**Duyuru.** **10.000 $**'ın üzerindeki her tek işlem ve bir dilimi bandının dışına çıkaran her değişiklik, 7 gün içinde Hipo'nun resmî kanallarında duyurulur.

---

## 4. Saklama

Fonun tüm varlıkları çoklu imzalı (multisig) cüzdanlarda tutulur. Her biri tek bir işlevi olan üç tane vardır.

| Cüzdan                          | Tuttuğu                                   | İmza           |
| ------------------------------- | ----------------------------------------- | -------------- |
| TON çoklu imzası `hipofund.ton` | hGRAM, HPO, gaz için GRAM                 | 3 imzadan 2'si |
| EVM Safe çoklu imzası           | Stablecoin'ler ve borç verme pozisyonları | 3 imzadan 2'si |
| Bitcoin çoklu imzası            | BTC                                       | 3 imzadan 2'si |

- Üçü de aynı üç imza sahibini kullanır; hepsi Hipo ekibi üyesidir.
- **Hiçbir fon varlığı tek imzalı bir cüzdanda tutulmaz.**
- **Fon, bir uygunluk gereksinimini karşılamak için varlıkları çoklu imzadan çıkarmaz.** Bir Hipo sistemi çoklu imzalı cüzdanları desteklemiyorsa saklama düzenlemesi değil sistem değiştirilir. Çoklu imza desteği, fonun herhangi bir dağıtım mekanizmasına katılmasından önceki bir ön koşuldur.
- Bölüm 4.1 kapsamındaki transit durumlar dışında, hiçbir fon varlığı merkezi bir borsada, bir saklayıcı nezdinde veya tek bir kişinin kontrolündeki bir hesapta tutulmaz.
- Bitcoin, sarmalanmadan (wrapped), doğrudan tutulur. Her sarmalayıcı bir saklayıcıyı yeniden devreye sokar ve bu dilimin üretken olmaya ihtiyacı yoktur.

### 4.1 Varlıkları zincirler arasında taşımak

Zincirler arası transferler, tek bir işlem olarak değil dilimler hâlinde uygulanan, doğrulanmış ve canlı bir güzergâha sahip zincir üstü bir köprü kullanır.

Güvenilir bir zincir üstü güzergâh bulunmadığında bir transfer, aşağıdakilerin tümüne tabi olmak kaydıyla bir imza sahibine ait bir borsa hesabından geçebilir:

- Aynı anda transit hâlde **fonun %15'inden fazlası** olmaz
- **72 saat** içinde tamamlanır
- Her iki bacak da her zincirdeki işlem karmalarıyla (hash) birlikte bir sonraki üç aylık raporda yayımlanır
- Başlamadan önce en az iki imza sahibi tarafından kararlaştırılır

Bu bir varsayılan değil, bir yedek çözümdür. Transit sırasında varlıklar çoklu imza kontrolünün ve fonun şeffaflığının dayandığı zincir üstü kaydın dışında kalır. Bu limitler, o pencereyi kabul edilebilir kılacak kadar dar tutan şeydir.

---

## 5. Uygun varlıklar

Fon yalnızca aşağıdakileri tutabilir. Bunun dışındaki her şey bir DAO oylaması gerektirir.

**İzin verilenler**

- **Bitcoin**, doğrudan tutulan
- Rezerv tasdiki yayımlayan ihraççılardan **fiat destekli stablecoin'ler** — şu anda USDT, USDC, USDS
- **hGRAM**
- **HPO**, yalnızca mevcut bakiye kadar — Bölüm 8
- Şunların tümünü karşılayan **birinci sınıf (blue-chip) borç verme protokollerinde mevduatlar**: en az 1 milyar $ TVL, üç veya daha fazla bağımsız denetim, kullanıcı fonlarında geri kazanılmamış bir kayıp olmaksızın en az 24 aydır yayında olma ve Bölüm 5.2 uyarınca doğrudan çekim
- Operasyonel olarak gerekli miktarlarda **yerel gaz bakiyeleri**

**İzin verilmeyenler**

- Kaldıraç, borçlanma, marjin veya tasfiye edilebilecek herhangi bir pozisyon
- Perpetual vadeli işlemler, opsiyonlar veya herhangi bir türev ürün
- Piyasa yapıcılığı, likidite sağlama veya işlemcilerin pozisyonlarının karşı tarafını alan kasalar (vault)
- **Desteği bir türev pozisyonu olan sentetik dolarlar.** Ethena'nın USDe'si değerlendirildi ve hariç tutuldu: getirisi rezervlerden değil perpetual fonlama oranlarından gelir, kısa pozisyonları merkezi borsalarda bulunur, rezerv fonu arzın kabaca %1'idir ve 7 günlük unstake bekleme süresi Bölüm 9 ile çelişir. Değerlendirme sırasında birinci sınıf stablecoin borç vermeye kıyasla hiçbir getiri primi sunmuyordu. Bu bir sermaye koruma varlığı değil bir baz işlemidir (basis trade) ve onu öyleymiş gibi sınıflandırmak fonun riskini yanlış yansıtır.
- Mevcut HPO pozisyonu dışında, 24 saatlik işlem hacmi 10 milyon $'ın altında olan herhangi bir token
- Tutmak amacıyla HPO alımları — Bölüm 8

### 5.1 Dondurulma riski ve bunu yöneten taban

Bu fonun tuttuğu şeylerin çoğu bir şirket üzerindeki bir haktır ve stablecoin ile tokenize edilmiş varlık ihraççıları belirli bir cüzdanı dondurabilir. Bu, bu tür varlıklardan kaçınmak için bir neden değildir — istikrarlı satın alma gücü için ölçekte izinsiz bir alternatif yoktur — ama görmezden gelinmek yerine büyüklüğünün sınırlandırılması gerekir.

- **Dondurabilen tek bir ihraççı, fonun %30'unu aşamaz.**
- **Fonun en az %20'si, hiçbir ihraççının, saklayıcının veya otoritenin tek taraflı bir eylemle donduramayacağı varlıklarda tutulur.** Şu anda bu testi geçen tek varlık Bitcoin'dir.

### 5.2 Doğrudan çekim

Her pozisyon, hiçbir operatörün, arayüzün veya aracının iznine gerek kalmadan doğrudan akıllı sözleşmeden çekilebilir olmalıdır. Sermaye yeni bir protokole aktarılmadan önce imza sahipleri, çekimin protokolün arayüzünden bağımsız olarak, doğrudan sözleşme etkileşimi yoluyla çalıştığını doğrular.

Çekimi bir operatörün kendi takdirine bağlı olarak kısıtlayabilen, duraklatabilen veya koşula bağlayabilen bir protokol, getirisi ne olursa olsun uygun değildir. Yeni sermaye için taahhüt edilmiş bir kaynağı olmayan bir fon için geri alınamayan sermaye kalıcı bir kayıptır.

### 5.3 Fon büyüdükçe yatırım evreninin genişletilmesi

Yukarıdaki liste, fon küçük olduğu için dardır: her ek pozisyon, büyük bir pozisyonla aynı kurulum, izleme ve raporlama çabasına mal olurken önemsenmeyecek kadar küçük bir getiri katkısı yapar. Bu, fon büyüdükçe değişir.

| Art arda iki raporda sürdürülen fon büyüklüğü | Neyin önü açılır                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| 250.000 $'ın altında                          | Yukarıdaki liste                                                         |
| 250.000 $ ve üzeri                            | DAO, fonun %10'uyla sınırlı bir ek varlık sınıfı ekleyebilir             |
| 500.000 $ ve üzeri                            | Yukarıdaki yasaklar çerçevesinde, fonun %10'una kadar fırsatçı bir dilim |

Her genişleme bir DAO oylaması gerektirir. Bir eşiğe ulaşmak, bir eklemeyi otomatik değil mümkün kılar.

---

## 6. Hedef dağılım

HPO pozisyonu hedef dağılımın dışında tutulur. Üzerine eklenemez ve büyük hacimde işlem görmez; bu yüzden onu dahil etmek, diğer her dilimi fonun üzerinde hareket edemeyeceği bir sayının etrafında yeniden dengelenmeye zorlardı.

**İhtiyari olmayan pozisyon**

|     |                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------- |
| HPO | 9.023.524,44, tutulan. Tutmak amacıyla alım yok. Yalnızca Bölüm 8 kapsamında azaltma. **Referans üst sınırı fonun %25'i.** |

**İhtiyari portföy** — geri kalan her şey:

| Dilim                                | Hedef | Bant   | Amaç                                                                        |
| ------------------------------------ | ----- | ------ | --------------------------------------------------------------------------- |
| Stablecoin getirisi, devreye alınmış | %45   | %35–55 | Sermaye koruması ve fonun geliri                                            |
| **Fırsat Rezervi**                   | %10   | %5–15  | Büyük düşüşler için devreye alınmamış sermaye — Bölüm 6.1                   |
| Bitcoin                              | %30   | %20–35 | Uzun vadeli değer saklama aracı; fonun dondurulamaz, ekosistem dışı varlığı |
| hGRAM                                | %12   | %8–18  | Hipo ile uyum, artı staking getirisi                                        |
| Operasyonel nakit ve gaz             | %3    | %2–6   | İşlem maliyetleri, tampon                                                   |

**hGRAM üzerine.** Getirisi GRAM cinsinden ifade edildiğinden pozisyon, bir gelir varlığından çok, kendisine getiri eklenmiş yönlü bir GRAM pozisyonudur. Onu tutmanın nedenlerinden biri, fonun ait olduğu protokolle uyumdur ve bu meşru bir nedendir. Onu bir gelir olarak sunmak meşru olmazdı.

**Bitcoin üzerine.** Hiçbir getiri varsayılmaz ve varsayılmamalıdır. Büyüklüğü, Bitcoin'in daha önce yaşadığı türden %70'lik bir düşüşün fona değerinin kabaca %16'sına mal olacağı şekilde belirlenmiştir. Büyüklüğü inanca değil düşüş toleransına göre belirlenmiştir.

**Giriş.** Yeni Bitcoin pozisyonları, en az sekiz hafta boyunca eşit haftalık dilimler hâlinde oluşturulur. Bir kural, bir piyasa görüşü değil.

### 6.1 Fırsat Rezervi

Fon, şiddetli düşüşlerde alım yapabilmek için ihtiyari portföyünün %10'unu stablecoin olarak, devreye alınmamış ya da aynı gün nakde çevrilebilir bir getiride tutar. **Yalnızca nesnel bir tetikleyici üzerine**, üç eşit dilimde, zaten uygun varlıklar listesinde bulunan varlıklara devreye girer:

| Tetikleyici                                           | Devreye giren |
| ----------------------------------------------------- | ------------- |
| Bitcoin, geriye dönük 12 aylık zirvesinin %40 altında | Üçte biri     |
| Bitcoin, geriye dönük 12 aylık zirvesinin %55 altında | Üçte biri     |
| Bitcoin, geriye dönük 12 aylık zirvesinin %70 altında | Son üçte biri |

Geriye dönük zirve, fonun yayımladığı fiyat kaynağının günlük kapanış serisini kullanır. Devreye girdikten sonra Rezerv, izleyen dört çeyrek boyunca stablecoin diliminden yeniden oluşturulur.

**İhtiyari devreye alma yok.** Tetikleyici devreye girmediyse sermaye olduğu yerde kalır. Yazılı bir tetikleyicinin amacı, kararı zor kılan koşullar sırasında değil, kolay olduğu anda, önceden vermektir.

---

## 7. Yoğunlaşma ve risk limitleri

Toplam fon değerine göre ölçülür, her üç aylık raporda kontrol edilir.

| Limit                                                         | Eşik                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| Herhangi bir tek protokol                                     | Fonun ≤ %30'u                                         |
| Herhangi bir tek stablecoin ihraççısı                         | Fonun ≤ %30'u                                         |
| Herhangi bir tek dondurabilen ihraççı, tüm varlıklar birlikte | Fonun ≤ %30'u                                         |
| Hiçbir ihraççının donduramadığı varlıklar                     | **Fonun ≥ %20'si**                                    |
| HPO dışındaki herhangi bir tek pozisyon                       | Fonun ≤ %35'i                                         |
| HPO                                                           | Fonun ≤ %25'i (referans — Bölüm 8)                    |
| Çoklu imza saklaması dışındaki varlıklar                      | **%0**, Bölüm 4.1 kapsamındaki transit durumlar hariç |
| TON ekosistemi varlıkları (HPO + hGRAM + GRAM)                | Fonun ≤ %45'i                                         |
| Kaldıraç                                                      | Her zaman sıfır                                       |

TON limiti bu belgedeki en önemli satırdır. Fonun geliri Hipo'dan gelir, fonlaması Hipo'dan gelir ve varlıklarının bir kısmı Hipo'nun kendi tokenleridir. Kendi ekosisteminde yoğunlaşmış bir hazine, o ekosistem için zor bir yılı yastıklamaz — onu büyütür. Bu limit, fonu tam da en çok ihtiyaç duyulduğu anda yararlı tutar.

Bir limit, bir işlem yerine piyasa hareketiyle ihlal edilirse fonun onu yeniden içine çekmek için bir çeyreği vardır ve ihlal o çeyreğin raporunda açıklanır.

---

## 8. HPO politikası

**Fon, tutmak amacıyla HPO satın almaz.** Fonun pozisyonu, HPO'nun piyasa likiditesine göre zaten büyüktür ve buna eklemek, likit sermayeyi fonun işaretlenen değerine yakın hiçbir yerden çıkamayacağı bir pozisyona dönüştürür. Fonun işi kendi tokenini biriktirmek değil, devreye alınabilir varlıkları büyütmektir.

**Yakmak amacıyla HPO satın almak farklı bir eylemdir ve buna izin verilir.** Bölüm 2.2 kapsamında fon, sahiplere değer döndürmenin iki biçiminden biri olarak HPO'yu piyasadan satın alıp yok edebilir. Tokenler fonun bilançosuna katılmak yerine dolaşımdan çıkar ve bu yalnızca yüksek su işaretinin üzerindeki kazançlardan fonlanır — asla sermayeden değil.

**Mevcut pozisyonu azaltmak.** Fonun HPO'su tutulur. Bu, fonun kendi protokolündeki payıdır ve açık piyasada büyük hacimde çıkış yapmanın bir yolu yoktur.

Bir gün azaltılırsa bu yalnızca stratejik bir alıcıya yapılan bir OTC satışı veya bir DAO oylamasıyla onaylanan yapılandırılmış bir satış yoluyla olur. **Fon, HPO'yu hiçbir hacimde açık piyasada satmaz.** Her iki yol da aşağıdakilerin tümünü gerektirir:

- Uygulamadan önce satışı onaylayan **bir DAO oylaması**
- **Önerideki gelirin kullanımı belirtilir** — sahipler yalnızca tokenlerin satılıp satılmayacağını değil, paraya ne olacağını da oylar
- Büyüklük, fiyat ve satışa bağlı her şart dahil, **tamamlandığında tam açıklama**

Bu pozisyonu satın alan sermayeyi sahipler fonladı. Oylama ve açıklama gereksinimleri, herhangi bir satışın önceden görüp onayladıkları şartlarla gerçekleşmesini sağlayan şeydir.

Bölüm 7'deki %25 üst sınırı bir referans düzeyidir, zorunlu bir satış değildir. HPO bunun ötesine değer kazanırsa fon ihlali raporlar ve DAO harekete geçip geçmeyeceğine karar verir.

---

## 9. Likidite

- **Fonun en az %35'i**, önemli bir kayıp olmadan 7 gün içinde stablecoin'e çevrilebilir
- 7 günden uzun bir kilit süresine sahip pozisyonlarda **fonun %10'undan fazlası** olmaz
- HPO dışında, fonun 30 gün içinde çıkamayacağı hiçbir pozisyon bulunmaz; HPO her raporda likit olmayan bir varlık olarak açıklanır

---

## 10. Yeniden dengeleme

- Raporla birlikte **üç ayda bir gözden geçirilir**
- Bir takvime göre değil, bir dilim **bandının dışına çıktığında** yeniden dengelenir — bu büyüklükteki bir fon için işlem maliyetleri gerçektir
- Hedef orta noktasına geri dengelenir, büyüklüğün gerektirdiği durumlarda bir süreye yayılarak uygulanır
- 10.000 $'ın üzerindeki her yeniden dengeleme işlemi 7 gün içinde duyurulur

**Bu fonun düşükten alıp yüksekten satması, yeniden dengeleme yoluyla olur.** Bitcoin bandının altına düştüğünde kural alım yapılmasını gerektirir. Üzerine çıktığında kural azaltım yapılmasını gerektirir. Karar önceden verilir ve mekanik olarak uygulanır.

**Fon, piyasa tepe veya dip noktalarını belirlemeye çalışmaz.** Hiçbir pozisyon bir tahmine veya piyasa hissiyatına göre açılmaz, kapatılmaz veya yeniden boyutlandırılmaz. Bir piyasa öngörüsüne göre hareket etmek, çıkışta ve yeniden girişte olmak üzere iki kez haklı çıkmayı gerektirir — üstelik bunu, o hızda hareket edemeyen 3 imzadan 2'sinin gerektiği bir imza süreciyle yapmak gerekir. Bantlar ve Fırsat Rezervi, fiilen uygulanabilen kurallar aracılığıyla aynı amacı yakalar.

---

## 11. Raporlama

- Tek bir zincir üstü bloktan [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs) tarafından üretilen, blok numarasını, dönüşüm oranlarını ve kullanılan her fiyatı listeleyen **her çeyrekte tam bir rapor**; böylece her okuyucu onu yeniden üretebilir
- Her rapor şunları içerir: Bölüm 6'daki hedeflere göre dağılım, güncel değeriyle Bölüm 7'deki her limit, **Modified Dietz yöntemiyle kuruluştan bu yana performans**, bir karşılaştırma ölçütü, fonun değerinin HPO'nun piyasa değerine oranı ve 10.000 $'ın üzerindeki her işlem
- Katkılar, alındıkları andaki blok ve fiyatla kaydedilir
- Limit ihlalleri, düzeltilmiş olsun olmasın açıklanır
- Raporlar, rakamlar ne gösterirse göstersin zamanında yayımlanır

**Fiyatlama.** GRAM ve Bitcoin, yayımlanan bir toplayıcıdan (aggregator) alınan piyasa fiyatı üzerinden. hGRAM, protokol itfa oranı üzerinden — fonun unstake ederek elde edeceği değer. HPO, Hipo'nun yayımladığı piyasa değeriyle çapraz kontrol edilerek CoinGecko üzerinden; sığ havuzlu DEX kotasyonları hariç tutulur. Stablecoin'ler, kural gereği 1,0000 üzerinden.

---

## 12. İnceleme ve değişiklik

- **Yıllık** olarak veya önemli bir değişiklikte daha erken gözden geçirilir — büyük bir giriş, yeni bir gelir akışı veya bir çeyrek içinde düzeltilemeyen bir limit ihlali
- Değişiklikler **bir DAO oylaması** gerektirir
- Her sürüm yayımlanır; yerini alınan sürümler tarihleriyle birlikte çevrimiçi kalır

---

## 13. Bilinen açık noktalar

- **Fonun yeni sermaye için taahhüt edilmiş bir kaynağı yoktur.** hGRAM staking ödülleri şu anda tek aktif gelir kaynağıdır. OTC anlaşmaları ve yeniden tesis edilen protokol geliri her ikisi de mümkündür; bu politika ikisini de varsaymaz.
- **HPO pozisyonunun değeri bir işaretlenmiş değerdir (mark), bir fiyat değildir.** Her rapor bunu belirtir ve belirtmeye devam edecektir.
- Protokol staking komisyonu %0 iken **fonun HPO'su hiçbir gelir üretmez**. Bir komisyonu yeniden yürürlüğe koymak ayrı bir karardır, ama ikisi etkileşir: fonun en büyük pozisyonuna bir getiri kazandırırken hGRAM'ının getirisini azaltır.

---

## 14. Yönetici ücretlendirmesi

**Hipo Fund'ı yönetmek için kimseye hiçbir ödeme yapılmaz. Yönetim ücreti yoktur ve performans ücreti yoktur.**

Bu, belirtilmeden bırakılmak yerine yayımlanır, çünkü bir ücretin yokluğu başlı başına bir politikadır ve konuyu yeniden açmanın koşullarını önceden taahhüt etmek, ileride yapılandırılmamış bir önerinin gelmesini engeller.

Hipo Fund'ın modellendiği egemen varlık fonunu yöneten Norges Bank Investment Management'a, kazançların bir payı değil, Maliye Bakanlığı'nın belirlediği yıllık bir üst sınıra kadar geri ödenen bir maliyet bütçesi ödenir. Yönetim maliyetleri 2024'te varlıkların %0,034'ü kadardı. Oradaki performansa dayalı ücretler, fonun yöneticisine değil dış yöneticilere uygulanır.

İki şey de burada buna karşı bir gerekçe oluşturuyor. Bir performans ücreti, yöneticiye düşüşü olmadan yükselişi verir; bu, sermaye koruma görevine sahip küçük bir fon için yanlış bir teşviktir. Ve uyum zaten daha iyi bir biçimde mevcuttur: imza sahipleri HPO tutar, dolayısıyla fon bileşiklendikçe HPO'nun desteği güçlenir — düşüş dahil, sonucun tamamına maruziyet.

**Konu yeniden açılırsa** bir DAO oylaması gerekir ve yalnızca fon **500.000 $**'ın üzerindeyken, yüksek su işaretinin üzerindeyken ve bu ikisini **art arda iki üç aylık rapor** boyunca koruduğunda önerilebilir. Her öneri şunları içermelidir: yalnızca bir performans ücreti ve hiçbir yönetim ücreti; sabit bir yüksek su işareti; bir stablecoin getirisi karşılaştırma ölçütünün üzerinde bir eşik oranı (hurdle rate); en az 12 ay kilitli HPO cinsinden ödeme; ve varlıkların bir yüzdesi olarak yıllık bir üst sınır.

**Fonu yönetmek bir gün ücretli zaman gerektirirse** bu, fondan değil ve getirilerin bir payı olarak değil, Hipo'nun operasyonel bütçesinden, sabit maliyetli tanımlı bir rol olarak ödenir. Bu, ücretlendirmeyi yatırım sonuçlarından ayrı tutar; bir sermaye koruma görevinin gerektirdiği de budur.
