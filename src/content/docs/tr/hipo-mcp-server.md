---
title: 'Hipo MCP Server'
description: "Claude, Cursor veya MCP destekli herhangi bir AI istemcisini Hipo'nun dokümantasyonuna ve canlı zincir üzerindeki verilerine bağlayın."
---

## Hipo MCP Server Nedir?

Hipo MCP Server, AI asistanlarının GRAM staking hakkındaki bilgiler dahil olmak üzere Hipo ile ilgili verilere erişmesini sağlayan küçük, açık kaynaklı bir hizmettir. AI istemcilerini harici verilere bağlamak için açık bir standart olan [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) dilini konuşur; böylece MCP destekli herhangi bir istemci — Claude, Claude Code, Cursor ve diğerleri — belleğinden tahmin etmek yerine Hipo'nun dokümantasyonuna bakabilir ve canlı zincir üzerindeki sayıları sorgulayabilir.

Bağlandıktan sonra asistanınız şu gibi sorulara yanıt verebilir:

- _Güncel hGRAM/GRAM dönüşüm oranı nedir ve bu hangi APY'yi ima ediyor?_
- _Şu anda Hipo'da ne kadar GRAM stake edilmiş durumda?_
- _Mevcut doğrulama turu ne zaman sona eriyor ve ertelenmiş yatırmam ne zaman hGRAM basacak?_
- _Bu adresin hGRAM bakiyesi nedir ve GRAM cinsinden değeri ne kadar?_
- _Bir yatırma işlemine hangi gaz ücretini eklemeliyim?_

Yanıtlar, modelin eğitim verilerinden değil, TON üzerindeki Hipo'nun akıllı sözleşme getter'larından gelir; bu nedenle sorduğunuz an itibarıyla günceldirler.

Sunucu tamamen **salt okunurdur**. Hiçbir anahtar tutmaz, hiçbir şey imzalamaz ve blok zincirine hiçbir mesaj göndermez. Bakabilir ama fonlarınızı asla hareket ettiremez — sunucuyu bağlamak, kimsenin sizin adınıza stake etmesinin, unstake etmesinin veya transfer yapmasının bir yolu değildir.

## Bağlanma

### Barındırılan sunucu (önerilir)

Hipo genel bir örnek çalıştırır. MCP istemcinizi şuna yönlendirin:

```
https://mcp.hipo.finance/mcp
```

[Claude Code](https://claude.com/product/claude-code) içinde tek bir komut yeterlidir:

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Bu, sunucuyu geçerli proje için kaydeder. Bunun yerine her projeden erişmek için `-s user` bayrağını iletin — buradaki `user`, kendi kullanıcı adınızın yerini tutan bir ifade değil, gerçek bir kapsam anahtar kelimesidir:

```sh
claude mcp add -s user --transport http hipo https://mcp.hipo.finance/mcp
```

Her iki durumda da bir yapılandırma dosyasını elle düzenlemek yerine komutu kullanın: Claude Code, MCP sunucularını kendi yapılandırmasında tutar ve `settings.json` içine bırakılan bir `mcpServers` bloğu yok sayılır. Sunucunun bağlı olduğunu doğrulamak için `claude mcp list` komutunu çalıştırın ve ardından Claude Code'u yeniden başlatın — sunucular başlangıçta bağlanır, bu nedenle yeni eklenen bir sunucu zaten çalışmakta olan bir oturumda kullanılamaz.

Diğer istemciler bir JSON dosyasıyla yapılandırılır (Claude Desktop, Cursor ve çoğu diğeri) ve şuna benzer bir girdi alırlar:

```json
{
  "mcpServers": {
    "hipo": {
      "type": "http",
      "url": "https://mcp.hipo.finance/mcp"
    }
  }
}
```

### Yerel olarak çalıştırma

Sunucuyu kendiniz çalıştırmayı tercih ederseniz, npm üzerinde [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) olarak yayımlanmıştır ve stdio dilini konuşur. Bunun için Node.js 20 veya daha yeni bir sürüm gerekir:

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

Aynı tavsiye burada da geçerlidir — dosyayı elle düzenlemek yerine komutla ekleyin. Diğer istemciler için JSON yapılandırma girdisi şudur:

```json
{
  "mcpServers": {
    "hipo": {
      "command": "npx",
      "args": ["-y", "@hipo-finance/mcp"]
    }
  }
}
```

## Araçlar

Bunlar sunucunun yanıtlayabileceği sorulardır. AI istemciniz doğru olanı kendi başına seçer — siz sade bir dille sorarsınız.

| Araç                 | Ne döndürür                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_exchange_rate`  | Güncel hGRAM↔GRAM oranı, stake edilmiş toplam GRAM, hGRAM arzı ve zincir üzerindeki oran güncellemelerinden türetilen son APY                                  |
| `get_treasury_state` | Treasury toplamları: GRAM cinsinden TVL, hGRAM arzı, bekleyen yatırma ve unstake işlemleri, aktif tur katılımları, durdurma bayrağı ve yönetişim parametreleri |
| `get_round_timing`   | Doğrulama turu zamanlaması: mevcut ve sonraki tur sınırları, seçim katılım penceresi ve stake'lerin ne kadar süre donuk kaldığı                                |
| `get_fees`           | Yatırma, unstake ve kredi talepleri için güncel gaz ücretleri                                                                                                  |
| `get_wallet_status`  | Verilen bir adresin hGRAM bakiyesi, GRAM cinsinden değeri ve bekleyen stake veya unstake işlemleri                                                             |
| `get_reward_history` | Verilen bir adresin tur başına geçmiş GRAM staking ödülleri, Hipo Club seviyesi ve HPO ödülleri dahil                                                          |
| `get_participation`  | Hipo'nun bir doğrulama turundaki katılımı: durum, kredi sayıları, toplamlar ve stake serbest bırakma zamanı                                                    |
| `get_loan_info`      | Bir borç alanın tur başına kredi sözleşmesi: adres, dağıtım durumu, bakiye ve taraflar                                                                         |
| `get_max_punishment` | Protokolün verilen bir validatör stake'i için uygulayabileceği maksimum ceza                                                                                   |

İlk dört araç hiçbir girdi gerektirmez. `get_wallet_status`, `get_reward_history` ve `get_loan_info` bir TON adresi alır — sahibinin veya borç alanın kendi adresi, jetton cüzdanı adresi değil — ve `get_max_punishment` GRAM cinsinden bir stake miktarı alır. `get_participation` ve `get_loan_info` ayrıca bir tur başlangıç zamanı kabul eder, ancak bu isteğe bağlıdır: belirtmezseniz mevcut tur hakkında bilgi verirler.

Her yanıt, araçların canlı protokol verisi döndürdüğü, finansal tavsiye olmadığı yönünde aynı hatırlatmayı taşır: değerler her doğrulama turunda değişir ve hiçbir getiri garanti edilmez.

## Dokümantasyon kaynakları

Canlı verinin yanı sıra sunucu, Hipo'nun teknik belgelerini MCP kaynakları olarak sunar; bunlar her zaman güncel olmaları için kendi kanonik genel konumlarından alınır:

| Kaynak                     | İçerik                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | Akıllı sözleşme deposunun README dosyası: protokol özeti ve dağıtılmış sözleşme adresleri |
| `hipo://docs/architecture` | Sözleşmeler, doğrulama turu durum makinesi ve protokol değişmezleri                       |
| `hipo://docs/integration`  | Mesaj şemaları ve cüzdanlar ile diğer protokoller için entegrasyon kılavuzu               |
| `hipo://docs/schema`       | Tüm Hipo sözleşmelerinin eksiksiz TL-B şemaları                                           |
| `hipo://docs/knowledge`    | Derlenmiş Hipo bilgi tabanı ([llms.txt](https://hipo.finance/llms.txt))                   |

## Örnek

`get_exchange_rate`'e yapılan bir çağrı sade JSON döndürür. Sayılar her turda değişir, bu nedenle bunları güncel değerler değil bir şekil olarak değerlendirin:

```json
{
  "oneHgramInGram": "1.143623345",
  "oneGramInHgram": "0.874413769",
  "totalCoinsGram": "2501952.200844389",
  "totalTokensHgram": "2187741.455006677",
  "recentApy": "15.59%",
  "apyNote": "APY is derived from the last on-chain rate update (current_rate / previous_rate compounded to a year). Rewards accrue in the exchange rate: hGRAM becomes worth more GRAM over time; there is no separate claim.",
  "disclaimer": "Live protocol data, not financial advice. Values change every validation round and no returns are guaranteed."
}
```

Sunucu protokol matematiğini asla yeniden uygulamaz. Yukarıdaki her sayı bir sözleşme getter'ından gelir ve dağıtılmış adresler için kaynak doğrusu sözleşme deposudur.

## Kendi kendine barındırma

Sunucu MIT lisanslıdır ve [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) adresinde bulunur. İki taşıma yöntemiyle gelir — yerel istemciler için `stdio` ve barındırılan bir dağıtım için akışlı (streamable) HTTP — ve bir Dockerfile içerir:

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

Tüm yapılandırma isteğe bağlıdır; varsayılanlar genel toncenter API'si üzerinden ana ağı (mainnet) hedefler.

| Ortam değişkeni            | Varsayılan                             | Amaç                                                                                                                                          |
| -------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` veya `testnet`                                                                                                                      |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | TON HTTP API uç noktası                                                                                                                       |
| `TONCENTER_API_KEY`        | _(yok)_                                | toncenter API anahtarı; bir anahtar olmadan genel hız sınırı uygulanır ve hız sınırına takılan çağrılar geri çekilmeli olarak yeniden denenir |
| `TONCENTER_API_KEY_FILE`   | _(yok)_                                | API anahtarını tutan bir dosyanın yolu, örneğin bir Docker secret'ı; `TONCENTER_API_KEY`'e göre önceliklidir                                  |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | Treasury durumunun, zamanların ve ücretlerin araç çağrıları arasında ne kadar süre önbelleğe alınacağı                                        |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | Dokümantasyon kaynaklarının ne kadar süre önbelleğe alınacağı                                                                                 |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | Hipo ödüller API'sinin temel URL'si; `get_reward_history`'yi devre dışı bırakmak için boş bırakın                                             |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | Yalnızca HTTP taşıması                                                                                                                        |
