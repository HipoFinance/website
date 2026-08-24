---
title: 'Validatörler'
---

## GRAM tokenlerinin validatörlere ödünç verilmesi

1. **İzin gerektirmeyen validatör modeli**: Hipo, stake edilmiş GRAM'ı açık bir model üzerinden validatörlere ödünç verir — her validatör teklif verebilir, Hipo'nun onayı gerekmez.
2. **Validatör açık artırma modeli**: her doğrulama turunda validatörler, ödeyecekleri ödül oranını sunarak stake edilmiş GRAM'ı ödünç almak için teklif verir. Hipo'nun sözleşmeleri en iyi teklifleri otomatik olarak seçer, böylece stakerlar o turda mevcut olan en iyi oranı alır.
3. **Güvenli süreç**: Stake edilmiş GRAM'ın ödünç alınması ve ödüllerin dağıtılması dahil tüm süreçler Hipo'nun akıllı sözleşmeleri aracılığıyla güvenle yürütülür. Protokol, kullanıcı fonlarının bütünlüğünü ve güvenliğini sağlamak için [güvenlik denetimlerinden](https://github.com/HipoFinance/audits) geçmiştir.
4. **Validatör teminatı**: ödünç alan bir validatör, o turun azami ceza tutarını artı vaat ettiği ödülü karşılayacak kadar kendi GRAM'ını kilitlemek zorundadır. Ceza, stake edilmiş GRAM'dan değil, bu teminattan tahsil edilir.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Diyagram: Hipo protokolü bir validatöre GRAM ödünç verir, validatör TON üzerinde doğrulama yapar ve GRAM'ı staking ödülleriyle birlikte geri verir."></figure>
