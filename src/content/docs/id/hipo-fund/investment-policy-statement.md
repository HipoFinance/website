---
title: 'Investment Policy Statement Hipo Fund'
description: 'Bagaimana Hipo Fund diinvestasikan: alokasi target, batas risiko dan konsentrasi, kustodi, likuiditas, dan bagaimana sebagian pertumbuhan dana ini dikembalikan kepada pemegang HPO.'
---

:::caution

**Ini adalah draf yang sedang dalam tinjauan komunitas. Kebijakan ini belum berlaku.**

:::

**Draf v1.5 · Untuk tinjauan komunitas dan ratifikasi DAO**

---

## Sekilas

_Kebijakan lengkapnya mengikuti di bawah. Jika keduanya berbeda, bagian bernomor yang berlaku._

**Alokasi target.** HPO berada di luar alokasi ini. Selebihnya:

| Porsi                                                                  | Target | Rentang |
| ---------------------------------------------------------------------- | ------ | ------- |
| Imbal hasil stablecoin, di-deploy                                      | 45%    | 35–55%  |
| Cadangan Peluang — di-deploy hanya saat pemicu penurunan Bitcoin aktif | 10%    | 5–15%   |
| Bitcoin, dipegang secara native                                        | 30%    | 20–35%  |
| hGRAM                                                                  | 12%    | 8–18%   |
| Kas operasional dan gas                                                | 3%     | 2–6%    |

**Batas utama.**

|                                                           |                 |
| --------------------------------------------------------- | --------------- |
| Aset ekosistem TON (HPO + hGRAM + GRAM)                   | ≤ 45% dari dana |
| Aset yang tidak dapat dibekukan oleh penerbit mana pun    | ≥ 20% dari dana |
| Protokol tunggal mana pun, atau penerbit tunggal mana pun | ≤ 30% dari dana |
| Aset di luar kustodi multisig                             | 0%              |
| Leverage                                                  | Nol, selalu     |

**Apa yang didapat pemegang HPO.**

| Kanal                  | Cara kerjanya                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pengembalian nilai** | Di atas high-water mark-nya, dana ini mengembalikan hingga separuh pertumbuhan terakumulasinya kepada pemegang HPO, dengan laju hingga 2% dari nilai dana per tahun. Pertumbuhan yang tertahan oleh batas laju ini diantrekan, bukan dihanguskan. Dibayarkan melalui bagi hasil Hipo Club atau dengan membeli HPO lalu mem-burn-nya — DAO memberikan suara atas bentuknya, bukan jumlahnya. |
| **Dukungan aset**      | Nilai dana ini sebagai persentase dari kapitalisasi pasar HPO dipublikasikan setiap kuartal.                                                                                                                                                                                                                                                                                                |
| **Tata kelola**        | Pemegang HPO memberikan suara atas kebijakan ini, setiap amendemennya, dan setiap penjualan HPO milik dana ini.                                                                                                                                                                                                                                                                             |

**Sepuluh aturan.**

1. **Tidak ada leverage, tidak ada derivatif, tidak ada market-making.** Pada ukuran berapa pun, kapan pun.
2. **Dana ini tidak membeli HPO untuk dipegang.** Dana ini boleh membeli HPO untuk di-burn, didanai hanya dari keuntungan — lihat Bagian 2.2 dan 8.
3. **Dana ini bukan sumber likuiditas pasar HPO atau dana operasional.**
4. **Semua aset berada dalam multisig 2 dari 3** — satu di TON, satu di EVM, satu di Bitcoin.
5. **Setiap posisi harus dapat ditarik langsung dari kontraknya,** tanpa izin dari operator atau front end mana pun.
6. **Tidak ada market timing.** Rentang rebalancing yang melakukan beli rendah dan jual tinggi, secara mekanis.
7. **Cadangan Peluang di-deploy hanya saat ada pemicu** — Bitcoin turun 40%, 55%, dan 70% dari titik tertinggi 12 bulan terakhirnya, dalam tiga tahap.
8. **Tidak ada seorang pun yang dibayar untuk mengelola dana ini.** Tidak ada biaya manajemen, tidak ada biaya kinerja.
9. **Sebuah laporan setiap kuartal,** dari satu blok on-chain, dengan kinerja sejak awal dan nilai terkini dari setiap batas.
10. **DAO menetapkan kerangkanya; para penanda tangan mengeksekusi di dalamnya.**

**Satu hal yang perlu diperjelas.** Pada alokasi ini dana menghasilkan kira-kira 2% per tahun. High-water mark-nya adalah modal yang telah disetorkan ke dalamnya, sekitar $224.056, dan tidak ada pengembalian nilai yang harus dibayarkan sampai dana berada di atas titik tersebut. Kebijakan ini dirancang agar dana bertumbuh secara majemuk dan stabil serta bertahan melalui siklus pasar penuh, bukan untuk pulih dengan cepat.

---

## 1. Tujuan dan asal-usul

Hipo Fund dibentuk pada April 2025 dari hasil penawaran perdana HPO, bersama dengan klaim HPO dari season Hipo Club. Modal tersebut tidak dialokasikan kepada tim dan tidak diserap ke dalam anggaran operasional Hipo. Modal itu ditempatkan dalam sebuah treasury terpisah yang terlihat publik dan disisihkan untuk bekerja bagi ekosistem Hipo dan bagi pemegang HPO dalam horizon yang diukur dalam tahunan.

Dokumen ini menetapkan bagaimana modal tersebut diinvestasikan: apa yang boleh dipegang dana ini, seberapa banyak dari masing-masing yang boleh dipegangnya, siapa yang memutuskan apa, bagaimana nilai mengalir kembali kepada pemegang HPO, dan bagaimana semuanya dilaporkan.

Kebijakan tertulis membuat keputusan dapat diulang, sehingga perilaku dana ini tidak bergantung pada siapa yang sedang memperhatikan pada bulan tertentu. Kebijakan ini membuat keputusan dapat ditinjau, sehingga komunitas dapat menilai prosesnya dan bukan hanya hasilnya. Dan kebijakan ini menetapkan batas-batas sebelum batas itu benar-benar dibutuhkan, saat batas itu masih mudah disepakati.

Setelah diratifikasi melalui pemungutan suara DAO, kebijakan ini mengikat para penanda tangan dana ini.

---

## 2. Mandat dan tujuan

Hipo Fund adalah treasury investasi jangka panjang. Tujuannya, berdasarkan urutan prioritas:

1. **Melestarikan modal** melalui siklus pasar penuh.
2. **Menumbuhkan nilai riil dana ini** dalam horizon yang diukur dalam tahunan.
3. **Mengembalikan sebagian dari pertumbuhan tersebut kepada pemegang HPO**, secara berkelanjutan dan tanpa menggerus pokok modal.

### Apa yang bukan Hipo Fund

- **Bukan akun trading.** Dana ini tidak mengambil posisi jangka pendek atau mencoba melakukan market timing.
- **Bukan sumber likuiditas pasar HPO.** Menyediakan likuiditas untuk pasar HPO adalah keputusan tokenomics yang didanai dari alokasi treasury dan pemasaran HPO.
- **Bukan sumber dana operasional.** Dana ini terpisah dari anggaran operasional Hipo dan tidak dapat ditarik untuk keperluan biaya.

### 2.1 Bagaimana Hipo Fund mengembalikan nilai kepada pemegang HPO

Hipo mengembalikan nilai kepada pemegang HPO dari aliran pendapatannya, melalui dua cara yang sudah mapan: melalui bagi hasil Hipo Club, dan dengan membeli HPO di pasar lalu mem-burn-nya. Hipo Fund dimaksudkan untuk menjadi salah satu aliran tambahan tersebut.

Ketika dana ini bertumbuh melampaui high-water mark-nya, sebagian dari pertumbuhan tersebut dialokasikan kepada pemegang HPO setiap tahun berdasarkan aturan pada Bagian 2.2. Bentuknya — bagi hasil atau buyback-dan-burn — dipilih saat sebuah distribusi jatuh tempo, menggunakan infrastruktur yang sudah dioperasikan Hipo.

Kedua bentuk ini sama-sama mengembalikan nilai riil; keduanya melakukannya dengan cara berbeda, dan pilihannya harus mencerminkan kondisi pada saat itu:

- **Buyback-dan-burn** secara permanen mengurangi suplai HPO dan menguntungkan setiap pemegang tanpa ada yang perlu mengklaim apa pun. Cara ini menciptakan nilai terbesar ketika HPO diperdagangkan di bawah apa yang didukung oleh aset dana ini dan fundamental protokolnya, karena burn hanya bersifat akretif jika token dibeli di bawah nilai sebenarnya. Biayanya adalah dampak pasar (market impact): pada pasar yang tipis, sebagian dari dana yang dibelanjakan menggerakkan harga alih-alih membeli suplai.
- **Bagi hasil** menyalurkan setiap dolar ke tangan pemegang secara pro rata tanpa dampak pasar, dan merupakan jalur yang lebih efisien kapan pun HPO tidak jelas-jelas murah.

Selain itu, nilai dana ini sebagai persentase dari kapitalisasi pasar beredar HPO dipublikasikan dalam setiap laporan kuartalan. Ini adalah bagian dari valuasi HPO yang didukung oleh aset yang dipegang di luar token itu sendiri, dan ini dilaporkan baik saat naik maupun saat turun.

**Catatan tentang skala.** Pada ukuran dana ini saat ini, sebuah pengembalian nilai akan terlihat sederhana, dan tidak ada yang harus dibayarkan selama dana berada di bawah high-water mark-nya. Aturan ini penting karena apa yang dikomitmenkannya: aturan ini memberi pemegang HPO sebuah klaim yang jelas dan terpublikasi atas pertumbuhan dana ini, yang skalanya membesar seiring dana bertumbuh, dan yang tidak dapat diubah tanpa pemungutan suara DAO.

### 2.2 Aturan pengembalian nilai

**High-water mark.** Total modal yang telah disetorkan ke dalam dana ini, ditambah semua yang telah dikembalikan dana ini kepada pemegang HPO. Saat ini nilainya sekitar **$224.056**. Nilai ini naik ketika modal baru disetorkan, dan sebesar jumlah setiap pengembalian nilai. Nilai ini tidak pernah turun.

**Di bawah high-water mark, tidak ada yang dikembalikan.** Modal dipulihkan terlebih dahulu. Membayarkan sesuatu di bawah titik tersebut sama dengan membayar dari pokok modal.

**Di atasnya**, pada setiap tahun keuangan dana ini mengalokasikan untuk pengembalian nilai HPO mana yang **lebih kecil** di antara:

- **50% dari nilai dana ini di atas high-water mark**, dan
- **2% dari total nilai dana ini** pada awal tahun

#### Mengapa ada dua batas

Kedua cabang aturan ini menjalankan fungsi yang berbeda.

**Cabang 50% menentukan apakah ada sesuatu untuk dikembalikan.** Cabang ini mengukur dana ini terhadap semua yang pernah dimasukkan ke dalamnya atau dibayarkan darinya, sehingga tahun di mana dana ini tidak bertumbuh tidak menghasilkan apa-apa — dan dalam kondisi apa pun tidak lebih dari separuh pertumbuhan terakumulasi dana ini yang dibayarkan. Separuh lainnya tetap diinvestasikan dan terus bekerja.

**Batas tahunan menentukan seberapa cepat pembayaran dilakukan.** Pada sebagian besar tahun, batas tahunan inilah yang berlaku; cabang 50% hanya berlaku pada rentang sempit tepat di atas high-water mark. Ini disengaja. Sebuah dana yang membayar besar setelah satu tahun yang kuat lalu tidak membayar apa pun selama tiga tahun berikutnya melayani pemegangnya lebih buruk dibandingkan dana yang membayar secara stabil, dan treasury seukuran ini lebih membutuhkan pertumbuhan majemuknya dibandingkan satu pembayaran besar.

**Batas ini mengatur laju pembayaran. Batas ini tidak membatalkannya.** Karena high-water mark hanya naik sebesar apa yang benar-benar dikembalikan, pertumbuhan yang tertahan oleh batas ini tetap berada di atas titik tersebut dan tetap dapat didistribusikan pada tahun-tahun berikutnya. Tidak ada yang memenuhi syarat yang dihanguskan — semuanya diantrekan.

_Contoh perhitungan._ Misalkan dana ini mencapai $300.000 terhadap high-water mark sebesar $224.056. Pertumbuhan di atas titik tersebut adalah $75.944, sehingga cabang 50% mengizinkan $37.972 — tetapi batas tahunan membatasi pengembalian tahun itu menjadi $6.000. High-water mark naik menjadi $230.056. Jika nilai dana ini tidak berubah pada tahun berikutnya, pertumbuhan di atas titik tersebut adalah $69.944, batas tahunan kembali mengizinkan $6.000, dan itu pun dibayarkan. Jumlah yang terbatasi tidak hilang; jumlah itu dikembalikan pada tahun-tahun berikutnya.

#### Jumlahnya bukan keputusan

Ketika dana ini berada di atas high-water mark-nya, alokasinya adalah sebuah perhitungan yang dilakukan pada laporan kuartalan, bukan sebuah proposal. Setelah dihitung, jumlah itu disisihkan untuk pemegang HPO, dilaporkan sebagai jumlah yang telah dikomitmenkan sampai dibayarkan, dan tidak dapat diserap kembali ke dalam dana.

**Hanya bentuknya yang dibawa ke pemungutan suara.** Para penanda tangan mengusulkan bagi hasil, buyback-dan-burn, atau kombinasi keduanya, disertai alasan, dan DAO meratifikasi bentuknya. Sebuah proposal yang tidak diratifikasi direvisi dan diajukan kembali — alokasinya sendiri tidak gugur. Jika tidak ada bentuk yang diratifikasi dalam **90 hari** sejak laporan yang memicunya, alokasi tersebut dieksekusi sebagai buyback-dan-burn, yang tidak memerlukan infrastruktur eksternal dan tidak dapat diblokir.

**Rumusnya hanya dapat diubah melalui pemungutan suara DAO.** Para penanda tangan dapat mengeksekusi sebuah pengembalian nilai sesuai aturan ini; mereka tidak dapat mengubah, menunda, atau mengabaikannya.

#### Ketentuan

- Dana ini tetap berada dalam setiap batas pada Bagian 7 setelah pengembalian dilakukan
- Didanai dari pendapatan dan dari hasil yang sudah direalisasikan melalui rebalancing rutin — tidak pernah dengan menjual Bitcoin di bawah rentangnya, menarik dari Cadangan Peluang, menjual HPO milik dana ini, atau mencairkan sebuah posisi semata-mata untuk menciptakan jumlah yang harus dibayarkan
- Jika membayarkan seluruh alokasi akan membuat porsi mana pun bergerak keluar dari rentangnya, sebanyak yang diizinkan oleh rentang tersebut yang dibayarkan dan sisanya dibawa ke tahun berikutnya, dengan high-water mark naik hanya sebesar jumlah yang benar-benar dibayarkan
- Perhitungan lengkapnya dipublikasikan dalam laporan kuartalan, termasuk high-water mark sebelum dan sesudahnya

---

## 3. Tata kelola dan hak pengambilan keputusan

| Keputusan                                                       | Siapa yang memutuskan                                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mengamendemen kebijakan ini                                     | **Pemungutan suara DAO** (mengikat)                                                                                                               |
| Mengubah rumus pengembalian nilai                               | **Pemungutan suara DAO** (mengikat)                                                                                                               |
| Mengurangi posisi HPO                                           | **Pemungutan suara DAO** (mengikat)                                                                                                               |
| Menambahkan kelas aset yang tidak tercantum pada Bagian 5       | **Pemungutan suara DAO** (mengikat)                                                                                                               |
| Memperkenalkan kompensasi manajer apa pun                       | **Pemungutan suara DAO** (mengikat) — Bagian 14                                                                                                   |
| Bentuk yang diambil sebuah pengembalian nilai                   | Penanda tangan mengusulkan, DAO meratifikasi. **Jumlahnya** adalah sebuah perhitungan berdasarkan Bagian 2.2 dan tidak dibawa ke pemungutan suara |
| Menambahkan protokol baru dalam kelas aset yang telah disetujui | Penanda tangan, diumumkan dalam 7 hari                                                                                                            |
| Men-deploy Cadangan Peluang begitu sebuah pemicu aktif          | Penanda tangan, diumumkan dalam 7 hari                                                                                                            |
| Rebalancing dalam rentang pada Bagian 6                         | Penanda tangan, dilaporkan setiap kuartal                                                                                                         |
| Venue eksekusi, waktu, dan rute                                 | Penanda tangan                                                                                                                                    |

DAO menetapkan kerangka dan batas-batasnya; para penanda tangan mengeksekusi di dalamnya. Transaksi individual tidak dibawa ke pemungutan suara — sebuah treasury yang butuh pemungutan suara untuk melakukan rebalancing tidak akan bisa melakukan rebalancing.

**Pengumuman.** Setiap transaksi tunggal di atas **$10.000**, dan setiap perubahan yang menggerakkan sebuah porsi keluar dari rentangnya, diumumkan di kanal resmi Hipo dalam 7 hari.

---

## 4. Kustodi

Semua aset dana ini disimpan dalam dompet multisig. Ada tiga dompet, masing-masing dengan satu tugas.

| Dompet                      | Memegang                      | Tanda tangan |
| --------------------------- | ----------------------------- | ------------ |
| Multisig TON `hipofund.ton` | hGRAM, HPO, GRAM untuk gas    | 2 dari 3     |
| Multisig Safe EVM           | Stablecoin dan posisi lending | 2 dari 3     |
| Multisig Bitcoin            | BTC                           | 2 dari 3     |

- Ketiganya menggunakan tiga penanda tangan yang sama, semuanya anggota tim Hipo.
- **Tidak ada aset dana ini yang disimpan dalam dompet dengan tanda tangan tunggal.**
- **Dana ini tidak memindahkan aset keluar dari multisig demi memenuhi sebuah persyaratan kelayakan.** Jika sebuah sistem Hipo tidak mendukung dompet multisig, sistem itulah yang diubah, bukan pengaturan kustodinya. Dukungan multisig adalah prasyarat sebelum dana ini berpartisipasi dalam mekanisme distribusi apa pun.
- Tidak ada aset dana ini yang disimpan di exchange tersentralisasi, pada seorang kustodian, atau dalam akun mana pun yang dikendalikan oleh satu orang, kecuali dalam masa transit berdasarkan Bagian 4.1.
- Bitcoin dipegang secara native, tidak dalam bentuk wrapped. Setiap wrapper menghadirkan kembali seorang kustodian, dan porsi ini tidak perlu bersifat produktif.

### 4.1 Memindahkan aset lintas chain

Transfer lintas chain menggunakan sebuah bridge on-chain dengan rute live yang telah terverifikasi, dieksekusi dalam beberapa tahap dan bukan sebagai satu transaksi tunggal.

Jika tidak ada rute on-chain yang andal, sebuah transfer boleh melewati akun exchange milik seorang penanda tangan, dengan syarat semua berikut ini terpenuhi:

- Tidak lebih dari **15% dari dana** dalam masa transit pada satu waktu
- Selesai dalam **72 jam**
- Kedua sisi transfer dipublikasikan dalam laporan kuartalan berikutnya beserta hash transaksi pada masing-masing chain
- Disepakati oleh setidaknya dua penanda tangan sebelum dimulai

Ini adalah fallback, bukan default. Selama masa transit, aset-aset tersebut berada di luar kendali multisig dan di luar catatan on-chain yang menjadi sandaran transparansi dana ini. Batas-batas inilah yang membuat jendela waktu tersebut cukup sempit untuk dapat diterima.

---

## 5. Aset yang memenuhi syarat

Dana ini hanya boleh memegang aset-aset berikut. Apa pun di luar itu memerlukan pemungutan suara DAO.

**Diizinkan**

- **Bitcoin**, dipegang secara native
- **Stablecoin yang didukung fiat** dari penerbit yang mempublikasikan atestasi cadangan — saat ini USDT, USDC, USDS
- **hGRAM**
- **HPO**, hanya pada saldo yang sudah ada — Bagian 8
- **Deposit di protokol lending blue-chip** yang memenuhi semua berikut: TVL setidaknya $1 miliar, tiga atau lebih audit independen, telah berjalan 24+ bulan tanpa kerugian dana pengguna yang tidak terpulihkan, dan penarikan langsung sesuai Bagian 5.2
- **Saldo gas native** dalam jumlah yang diperlukan secara operasional

**Tidak diizinkan**

- Leverage, peminjaman, margin, atau posisi apa pun yang dapat dilikuidasi
- Kontrak perpetual futures, opsi, atau derivatif apa pun
- Market-making, penyediaan likuiditas, atau vault yang mengambil posisi berlawanan dari trader
- **Dolar sintetis yang dukungannya berupa posisi derivatif.** Ethena USDe telah dinilai dan dikecualikan: imbal hasilnya berasal dari funding rate kontrak perpetual dan bukan dari cadangan, posisi short-nya berada di exchange tersentralisasi, dana cadangannya kira-kira 1% dari suplai, dan periode cooldown unstaking-nya selama 7 hari bertentangan dengan Bagian 9. Pada saat dinilai, USDe tidak menawarkan premi imbal hasil dibandingkan lending stablecoin blue-chip. USDe adalah sebuah basis trade, bukan aset pelestarian modal, dan mengklasifikasikannya sebagai aset pelestarian modal akan salah menggambarkan risiko dana ini.
- Token mana pun dengan volume perdagangan 24 jam di bawah $10 juta, selain posisi HPO yang sudah ada
- Pembelian HPO untuk dipegang — Bagian 8

### 5.1 Risiko pembekuan, dan batas bawah yang mengelolanya

Sebagian besar dari apa yang dipegang dana ini adalah klaim atas sebuah perusahaan, dan penerbit stablecoin serta aset yang ditokenisasi dapat membekukan sebuah dompet tertentu. Ini bukan alasan untuk menghindari aset semacam itu — tidak ada alternatif tanpa izin (permissionless) dalam skala besar untuk daya beli yang stabil — tetapi risiko ini harus diberi ukuran, bukan diabaikan.

- **Tidak ada satu penerbit yang dapat dibekukan yang boleh melebihi 30% dari dana.**
- **Setidaknya 20% dari dana dipegang dalam aset yang tidak dapat dibekukan oleh penerbit, kustodian, atau otoritas mana pun melalui tindakan sepihak.** Bitcoin saat ini adalah satu-satunya kepemilikan yang memenuhi kriteria ini.

### 5.2 Penarikan langsung

Setiap posisi harus dapat ditarik langsung dari smart contract-nya, tanpa izin dari operator, antarmuka, atau perantara mana pun. Sebelum modal di-deploy ke sebuah protokol baru, para penanda tangan memverifikasi bahwa penarikan berfungsi melalui interaksi kontrak langsung, terlepas dari front end protokol tersebut.

Sebuah protokol yang dapat membatasi, menjeda, atau memberi syarat pada penarikan atas kebijakan seorang operator tidak memenuhi syarat, terlepas dari berapa pun imbal hasilnya. Bagi sebuah dana tanpa sumber modal baru yang sudah pasti, modal yang tidak dapat ditarik kembali adalah sebuah kerugian permanen.

### 5.3 Memperluas cakupan aset seiring pertumbuhan dana

Daftar di atas sengaja dibuat sempit karena dana ini masih kecil: setiap posisi tambahan membutuhkan upaya setup, pemantauan, dan pelaporan yang sama besarnya dengan posisi besar, sementara kontribusi imbal hasilnya terlalu kecil untuk berarti. Hal ini berubah seiring pertumbuhan dana.

| Ukuran dana, bertahan selama dua laporan berturut-turut | Apa yang menjadi tersedia                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Di bawah $250.000                                       | Daftar di atas                                                                    |
| $250.000+                                               | DAO boleh menambahkan **satu** kelas aset tambahan, dibatasi hingga 10% dari dana |
| $500.000+                                               | Sebuah porsi oportunistik hingga 10% dari dana, dalam batas larangan di atas      |

Setiap perluasan memerlukan pemungutan suara DAO. Mencapai sebuah ambang batas membuat sebuah penambahan menjadi mungkin, bukan otomatis.

---

## 6. Alokasi target

Posisi HPO berada di luar alokasi target. Posisi ini tidak dapat ditambah dan tidak dapat diperdagangkan dalam jumlah besar, sehingga memasukkannya akan memaksa setiap porsi lain melakukan rebalancing di sekitar sebuah angka yang tidak bisa ditindaklanjuti oleh dana ini.

**Kepemilikan non-diskresioner**

|     |                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- |
| HPO | 9.023.524,44, dipegang. Tidak ada pembelian untuk dipegang. Pengurangan hanya berdasarkan Bagian 8. **Batas acuan 25% dari dana.** |

**Portofolio diskresioner** — selebihnya:

| Porsi                             | Target | Rentang | Tujuan                                                                                         |
| --------------------------------- | ------ | ------- | ---------------------------------------------------------------------------------------------- |
| Imbal hasil stablecoin, di-deploy | 45%    | 35–55%  | Pelestarian modal dan pendapatan dana ini                                                      |
| **Cadangan Peluang**              | 10%    | 5–15%   | Modal yang belum di-deploy untuk penurunan besar — Bagian 6.1                                  |
| Bitcoin                           | 30%    | 20–35%  | Penyimpan nilai jangka panjang; aset dana ini yang tidak dapat dibekukan dan di luar ekosistem |
| hGRAM                             | 12%    | 8–18%   | Keselarasan dengan Hipo, ditambah imbal hasil staking                                          |
| Kas operasional dan gas           | 3%     | 2–6%    | Biaya transaksi, buffer                                                                        |

**Tentang hGRAM.** Imbal hasilnya didenominasikan dalam GRAM, sehingga posisi ini adalah sebuah kepemilikan GRAM yang bersifat directional dengan imbal hasil yang menyertainya, dan bukan sebuah aset pendapatan. Sebagian alasan memegangnya adalah keselarasan dengan protokol tempat dana ini berada, yang merupakan alasan yang sah. Menyajikannya sebagai pendapatan tidak akan sah.

**Tentang Bitcoin.** Tidak ada imbal hasil yang diasumsikan dan memang seharusnya tidak ada. Ukurannya ditetapkan sedemikian rupa sehingga sebuah penurunan 70% — yang pernah dialami Bitcoin sebelumnya — merugikan dana ini sekitar 16% dari nilainya. Ukurannya ditentukan berdasarkan toleransi penurunan (drawdown), bukan keyakinan.

**Entry.** Posisi Bitcoin baru dibangun dalam tahap mingguan dengan besaran yang sama selama tidak kurang dari delapan minggu. Sebuah aturan, bukan sebuah pandangan pasar.

### 6.1 Cadangan Peluang

Dana ini memegang 10% dari portofolio diskresionernya dalam stablecoin, belum di-deploy atau berada dalam imbal hasil yang likuid dalam hari yang sama, untuk membeli saat terjadi penurunan parah. Dana ini di-deploy **hanya berdasarkan sebuah pemicu objektif**, dalam tiga tahap, ke dalam aset yang sudah ada pada daftar yang memenuhi syarat:

| Pemicu                                                      | Yang di-deploy     |
| ----------------------------------------------------------- | ------------------ |
| Bitcoin turun 40% dari titik tertinggi 12 bulan terakhirnya | Sepertiga pertama  |
| Bitcoin turun 55% dari titik tertinggi 12 bulan terakhirnya | Sepertiga kedua    |
| Bitcoin turun 70% dari titik tertinggi 12 bulan terakhirnya | Sepertiga terakhir |

Titik tertinggi tersebut menggunakan seri harga penutupan harian dari sumber harga yang dipublikasikan dana ini. Setelah di-deploy, Cadangan ini dibangun kembali dari porsi stablecoin selama empat kuartal berikutnya.

**Tidak ada deployment yang bersifat diskresioner.** Jika pemicu belum aktif, modal tersebut tetap berada di tempatnya. Inti dari sebuah pemicu tertulis adalah membuat keputusan itu di muka, saat keputusan itu masih mudah, dan bukan pada saat kondisi yang membuatnya sulit.

---

## 7. Batas konsentrasi dan risiko

Diukur terhadap total nilai dana ini, diperiksa pada setiap laporan kuartalan.

| Batas                                                                    | Ambang batas                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------- |
| Protokol tunggal mana pun                                                | ≤ 30% dari dana                                           |
| Penerbit stablecoin tunggal mana pun                                     | ≤ 30% dari dana                                           |
| Penerbit tunggal mana pun yang dapat dibekukan, seluruh aset digabungkan | ≤ 30% dari dana                                           |
| Aset yang tidak dapat dibekukan oleh penerbit mana pun                   | **≥ 20% dari dana**                                       |
| Posisi tunggal non-HPO mana pun                                          | ≤ 35% dari dana                                           |
| HPO                                                                      | ≤ 25% dari dana (acuan — Bagian 8)                        |
| Aset di luar kustodi multisig                                            | **0%**, kecuali dalam masa transit berdasarkan Bagian 4.1 |
| Aset ekosistem TON (HPO + hGRAM + GRAM)                                  | ≤ 45% dari dana                                           |
| Leverage                                                                 | Nol, setiap saat                                          |

Batas TON adalah baris paling penting dalam dokumen ini. Pendapatan dana ini berasal dari Hipo, pendanaannya berasal dari Hipo, dan sebagian asetnya adalah token milik Hipo sendiri. Sebuah treasury yang terkonsentrasi pada ekosistemnya sendiri tidak meredam sebuah tahun yang sulit bagi ekosistem itu — treasury semacam itu justru memperbesarnya. Batas ini menjaga agar dana ini tetap berguna justru pada saat paling dibutuhkan.

Jika sebuah batas dilanggar akibat pergerakan pasar dan bukan akibat sebuah transaksi, dana ini memiliki waktu satu kuartal untuk mengembalikannya ke dalam batas, dan pelanggaran tersebut diungkapkan dalam laporan kuartal itu.

---

## 8. Kebijakan HPO

**Dana ini tidak membeli HPO untuk dipegang.** Posisi dana ini sudah besar relatif terhadap likuiditas pasar HPO, dan menambahnya akan mengubah modal yang likuid menjadi sebuah kepemilikan yang tidak dapat dikeluarkan dana ini pada harga yang mendekati nilai yang tercatat. Tugas dana ini adalah menumbuhkan aset yang dapat di-deploy, bukan mengakumulasi token miliknya sendiri.

**Membeli HPO untuk di-burn adalah tindakan yang berbeda dan diizinkan.** Berdasarkan Bagian 2.2, dana ini boleh membeli HPO di pasar dan memusnahkannya sebagai salah satu dari dua bentuk pengembalian nilai kepada pemegang. Token-token tersebut keluar dari peredaran dan bukannya masuk ke dalam neraca dana ini, dan hal ini hanya didanai dari keuntungan di atas high-water mark — tidak pernah dari modal.

**Mengurangi posisi yang sudah ada.** HPO milik dana ini dipegang. Ini adalah taruhan (stake) dana ini pada protokolnya sendiri, dan tidak ada cara untuk mengeluarkannya dalam jumlah besar di pasar terbuka.

Jika posisi ini pernah dikurangi, hal itu hanya terjadi melalui penjualan OTC kepada pembeli strategis atau penjualan terstruktur yang disetujui melalui pemungutan suara DAO. **Dana ini tidak menjual HPO di pasar terbuka, dalam jumlah berapa pun.** Kedua jalur tersebut mensyaratkan semua berikut:

- **Sebuah pemungutan suara DAO** yang menyetujui penjualan sebelum dieksekusi
- **Penggunaan hasil penjualan dinyatakan dalam proposal** — pemegang memberikan suara atas apa yang terjadi pada uang tersebut, bukan hanya atas apakah token tersebut dijual
- **Pengungkapan penuh setelah selesai**, termasuk ukuran, harga, dan syarat apa pun yang melekat pada penjualan tersebut

Para pemegang yang mendanai modal yang membeli posisi ini. Persyaratan pemungutan suara dan pengungkapan inilah yang memastikan bahwa setiap penjualan terjadi dengan syarat yang telah mereka lihat dan setujui sebelumnya.

Batas 25% pada Bagian 7 adalah tingkat acuan, bukan sebuah penjualan paksa. Jika HPO terapresiasi melewati batas tersebut, dana ini melaporkan pelanggaran itu dan DAO yang memutuskan apakah akan bertindak.

---

## 9. Likuiditas

- Setidaknya **35% dari dana** dapat ditukar menjadi stablecoin dalam 7 hari tanpa kerugian material
- Tidak lebih dari **10% dari dana** dalam posisi dengan lockup lebih lama dari 7 hari
- Tidak ada posisi yang tidak dapat dikeluarkan dana ini dalam 30 hari, selain HPO, yang diungkapkan sebagai tidak likuid dalam setiap laporan

---

## 10. Rebalancing

- **Ditinjau setiap kuartal**, bersamaan dengan laporan
- Di-rebalance ketika sebuah porsi bergerak **keluar dari rentangnya**, bukan berdasarkan kalender — biaya transaksi adalah nyata bagi dana seukuran ini
- Di-rebalance kembali ke titik tengah target, dieksekusi selama periode tertentu jika ukurannya memang membutuhkan
- Setiap transaksi rebalancing di atas $10.000 diumumkan dalam 7 hari

**Rebalancing adalah cara dana ini melakukan beli rendah dan jual tinggi.** Ketika Bitcoin turun di bawah rentangnya, aturan mewajibkan pembelian. Ketika Bitcoin naik di atasnya, aturan mewajibkan pengurangan (trimming). Keputusannya dibuat di muka dan dieksekusi secara mekanis.

**Dana ini tidak berusaha mengidentifikasi puncak atau dasar pasar.** Tidak ada posisi yang dibuka, ditutup, atau diubah ukurannya berdasarkan sebuah prakiraan atau sentimen. Bertindak berdasarkan sebuah market call membutuhkan ketepatan dua kali — pada saat keluar maupun saat masuk kembali — dengan proses tanda tangan 2 dari 3 yang tidak dapat bergerak secepat itu. Rentang-rentang tersebut dan Cadangan Peluang menangkap maksud yang sama melalui aturan yang benar-benar dapat dieksekusi.

---

## 11. Pelaporan

- Sebuah **laporan lengkap setiap kuartal**, dihasilkan dari satu blok on-chain oleh [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs), mencantumkan blok, nilai tukar, dan setiap harga yang digunakan, sehingga pembaca mana pun dapat mereproduksinya
- Setiap laporan mencakup: alokasi terhadap target pada Bagian 6, setiap batas pada Bagian 7 beserta nilai terkininya, **kinerja sejak awal menggunakan Modified Dietz**, sebuah benchmark, nilai dana ini sebagai bagian dari kapitalisasi pasar HPO, dan setiap transaksi di atas $10.000
- Setiap kontribusi dicatat beserta blok dan harga pada saat diterima
- Pelanggaran batas diungkapkan baik sudah dikoreksi maupun belum
- Laporan dipublikasikan sesuai jadwal terlepas dari apa pun yang ditunjukkan angka-angkanya

**Penilaian harga.** GRAM dan Bitcoin pada harga pasar dari sebuah agregator yang dipublikasikan. hGRAM pada kurs penebusan protokol — yaitu apa yang akan diterima dana ini dengan meng-unstake. HPO pada CoinGecko, disilangkan (cross-check) terhadap kapitalisasi pasar Hipo yang dipublikasikan; kuotasi DEX dari pool yang tipis dikecualikan. Stablecoin dinilai tepat 1,0000 sebagai konvensi.

---

## 12. Peninjauan dan amendemen

- Ditinjau **setiap tahun**, atau lebih cepat jika terjadi sebuah perubahan material — aliran masuk yang besar, sebuah aliran pendapatan baru, atau sebuah pelanggaran batas yang tidak dapat dikoreksi dalam satu kuartal
- Amendemen memerlukan sebuah **pemungutan suara DAO**
- Setiap versi dipublikasikan; versi yang telah digantikan tetap online beserta tanggalnya

---

## 13. Isu terbuka yang diketahui

- **Dana ini tidak memiliki sumber modal baru yang sudah pasti.** Imbalan staking hGRAM saat ini adalah satu-satunya aliran pendapatan aktifnya. Kesepakatan OTC dan pemulihan pendapatan protokol sama-sama mungkin terjadi; kebijakan ini tidak mengasumsikan keduanya.
- **Nilai posisi HPO adalah sebuah mark, bukan sebuah harga.** Setiap laporan menyatakan hal ini dan akan terus melakukannya.
- **HPO milik dana ini tidak menghasilkan pendapatan** selama biaya staking protokol adalah 0%. Memberlakukan kembali sebuah biaya adalah keputusan yang terpisah, tetapi keduanya saling memengaruhi: hal itu akan memberikan imbal hasil pada kepemilikan terbesar dana ini sekaligus mengurangi imbal hasil pada hGRAM-nya.

---

## 14. Kompensasi manajer

**Tidak ada seorang pun yang dibayar apa pun untuk mengelola Hipo Fund. Tidak ada biaya manajemen dan tidak ada biaya kinerja.**

Hal ini dipublikasikan dan bukannya dibiarkan tidak dinyatakan, karena ketiadaan sebuah biaya itu sendiri adalah sebuah kebijakan, dan mengomitmenkan lebih dulu syarat-syarat untuk membuka kembali pertanyaan ini mencegah munculnya sebuah proposal yang tidak terstruktur di kemudian hari.

Norges Bank Investment Management, yang mengelola dana kekayaan negara yang menjadi model bagi Hipo Fund, dibayar melalui sebuah anggaran biaya yang diganti hingga sebuah batas tahunan yang ditetapkan oleh Kementerian Keuangan — bukan sebagai bagian dari keuntungan. Biaya manajemennya adalah 0,034% dari aset pada 2024. Biaya berbasis kinerja di sana berlaku bagi manajer eksternal, bukan bagi pengelola dana itu sendiri.

Ada dua hal lagi yang menjadi alasan menentang sebuah biaya kinerja di sini. Sebuah biaya kinerja memberi manajer keuntungan sisi atas (upside) tanpa risiko sisi bawah (downside), yang merupakan insentif yang salah bagi sebuah dana kecil dengan mandat pelestarian modal. Dan keselarasan itu sudah ada dalam bentuk yang lebih baik: para penanda tangan memegang HPO, sehingga jika dana ini bertumbuh secara majemuk, dukungan terhadap HPO menguat — eksposur terhadap keseluruhan hasil, termasuk sisi bawahnya.

**Jika pertanyaan ini dibuka kembali**, hal itu memerlukan sebuah pemungutan suara DAO dan hanya boleh diusulkan ketika dana ini berada di atas **$500.000**, di atas high-water mark-nya, dan telah mempertahankan keduanya selama **dua laporan kuartalan berturut-turut**. Proposal apa pun harus mencakup: hanya sebuah biaya kinerja dan tanpa biaya manajemen; sebuah high-water mark yang keras (hard); sebuah hurdle rate di atas sebuah benchmark imbal hasil stablecoin; pembayaran dalam HPO yang dikunci selama setidaknya 12 bulan; dan sebuah batas tahunan sebagai persentase dari aset.

**Jika pengelolaan dana ini pada suatu saat membutuhkan waktu berbayar**, hal itu dibayar dari anggaran operasional Hipo sebagai sebuah peran yang jelas dengan biaya tetap — bukan dari dana ini, dan bukan sebagai bagian dari imbal hasil. Hal ini menjaga kompensasi tetap terpisah dari hasil investasi, yang merupakan hal yang disyaratkan oleh sebuah mandat pelestarian modal.
