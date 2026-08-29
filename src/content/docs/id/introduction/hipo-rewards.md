---
title: 'Imbalan Hipo'
---

Tujuan kami adalah membangun Hipo sebagai protokol yang benar-benar digerakkan komunitas, tempat nilai dan pengambilan keputusan berpindah ke komunitas.

Men-stake GRAM di Hipo memberi Anda imbalan lewat tiga aliran terpisah, dengan tiga jadwal yang berbeda:

- **Imbalan dasar**\
  Imbalan staking GRAM, tercermin pada nilai tukar hGRAM terhadap GRAM — diselesaikan **setiap putaran validasi** (~18 jam), tanpa perlu diklaim
- **Imbalan tambahan**\
  HPO ekstra atas nilai GRAM dari stake Anda, dengan koefisien yang ditentukan level [Hipo Club](https://t.me/HipoFinanceBot/join) Anda — terkumpul **setiap putaran validasi**, dapat ditarik setelah saldo Anda melampaui 1.000 HPO
- **Imbalan ekstra**\
  Pegang HPO → terima bagi hasil dari pendapatan protokol — dibayarkan **pada akhir setiap season Hipo Club**

Ketiganya dapat dilacak di [aplikasi Hipo](/rewards/) dan [Hipo Club](https://t.me/HipoFinanceBot/join).

## Imbalan dasar: nilai tukar

Anda men-stake GRAM dan menerima hGRAM. Tidak ada masa kunci dan tidak ada yang perlu diklaim: imbalan validasi terkumpul di dalam protokol, sehingga setiap hGRAM menjadi bernilai lebih banyak GRAM seiring waktu. Saldo hGRAM Anda tidak pernah berubah — nilainyalah yang berubah.

Inilah aliran utamanya, dan inilah yang dirujuk oleh APY di [halaman Statistik](/stats/). Karena Hipo tidak mengambil potongan dari stake Anda dan [biaya tata kelola](/docs/fees-and-gas/) saat ini 0%, seluruh imbalan validasi mengalir ke nilai tukar.

## Imbalan tambahan: HPO dari Hipo Club

Di atas nilai tukar, [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) membayar Anda HPO karena memegang hGRAM. Aliran ini terpisah, dibayarkan dalam HPO alih-alih GRAM, dan Anda menariknya di Club.

### Rumusnya

Setiap putaran validasi, tiap anggota memperoleh:

```
HPO reward = GRAM value of your stake × HPOrewardRate × LevelRate
```

- **HPOrewardRate** saat ini **0,0021902**. Nilainya ditetapkan oleh tata kelola dan dapat berubah.
- **LevelRate** adalah koefisien yang melekat pada level Hipo Club Anda.

Satu putaran validasi berlangsung 65.536 detik — sekitar 18,2 jam — sehingga ada sekitar **481 putaran setahun**. Dengan tarif saat ini, setiap GRAM dalam stake Anda menghasilkan sekitar **1,05 HPO setahun** di Level 1.

Dasar perhitungannya adalah **nilai stake Anda dalam GRAM saat ini** — saldo hGRAM Anda pada nilai tukar berjalan — bukan jumlah yang semula Anda setorkan. Karena imbalan dasar menaikkan nilai itu setiap putaran, imbalan HPO Anda ikut tumbuh bersamanya: kedua aliran itu saling menggandakan.

### Koefisien level

Koefisiennya bukan angka levelnya — dimulai dari 1× lalu makin cepat naik saat Anda memanjat:

| Level     | 1    | 2    | 3    | 4    | 5   | 6   | 7    | 8    | 9    | 10  |
| --------- | ---- | ---- | ---- | ---- | --- | --- | ---- | ---- | ---- | --- |
| Koefisien | 1,0× | 1,2× | 1,6× | 2,2× | 3×  | 4×  | 5,2× | 6,6× | 8,2× | 10× |

Setiap level bernilai lebih besar daripada level sebelumnya: naik dari Level 1 ke Level 2 menambah 0,2×, sedangkan naik dari Level 9 ke Level 10 menambah 1,8× — sembilan kali lipatnya. Imbalan dari memanjat level menumpuk di bagian akhir.

### Berapa hasilnya

Imbalan HPO tahunan dengan tarif saat ini:

| Stake (GRAM) | Level 1 (1×) | Level 5 (3×) | Level 10 (10×) |
| ------------ | ------------ | ------------ | -------------- |
| 1.000        | ~1.055 HPO   | ~3.164 HPO   | ~10.546 HPO    |
| 5.000        | ~5.273 HPO   | ~15.819 HPO  | ~52.732 HPO    |
| 10.000       | ~10.546 HPO  | ~31.639 HPO  | ~105.463 HPO   |
| 50.000       | ~52.732 HPO  | ~158.195 HPO | ~527.316 HPO   |

### Berapa nilainya

Imbalan HPO dibayarkan dalam token yang punya harga pasar, dan harga itu bergerak. Dinilai dengan harga pasar HPO pada 29 Agustus 2026, tambahan ini menyumbang sekitar **0,18 poin persentase** pada imbal hasil tahunan efektif Anda di Level 1, dan sekitar **1,8 poin persentase** di Level 10.

Jadi, staker di Level 10 memperoleh kira-kira APY staking GRAM yang tertera di [halaman Statistik](/stats/), **ditambah sekitar 1,8%** dalam bentuk HPO.

:::note
Kami sengaja menyampaikannya seperti ini. Angka HPO yang besar dengan sendirinya tidak memberi tahu Anda berapa yang sebenarnya Anda peroleh, dan pasar HPO masih kecil — token ini tipis diperdagangkan, sehingga nilai posisi HPO yang besar tidak sama dengan nilai posisi yang kecil. Kami lebih memilih Anda mengetahuinya sejak awal daripada terkejut karenanya.
:::

### Level

Level Anda melipatgandakan semua yang di atas: di Level 10, stake yang sama menghasilkan sepuluh kali lipat dari yang dihasilkannya di Level 1. Anda juga memperoleh 1% dari imbalan HPO yang dihasilkan orang-orang yang Anda undang.

Ada dua cara untuk naik level:

- **Upgrade musiman** — klaim imbalan yang Anda peroleh setidaknya sekali selama season; level Anda naik secara otomatis di akhir season.
- **Upgrade instan** — bayar biaya upgrade level dan level Anda langsung naik.

Ada dua aturan yang penting:

- **Menjual HPO hasil imbalan mengatur ulang level Anda ke Level 1.** Club dirancang untuk memberi imbalan kepada orang yang memegang, dan inilah mekanismenya. Mengirim HPO hasil imbalan ke bursa, atau ke dompet yang belum Anda hubungkan ke Club, dihitung sebagai menjual; memindahkannya di antara dompet-dompet Anda sendiri yang terhubung tidak — lihat [Menggunakan beberapa dompet](/docs/wallets-and-rewards/).
- **Tidak ada jendela klaim.** Imbalan terkumpul setiap putaran dan dapat ditarik kapan saja saldo Anda setidaknya **1.000 HPO**.

## Imbalan ekstra: bagi hasil

HPO adalah token tata kelola milik Hipo. Memegangnya memberi Anda hak suara di [DAO](/docs/dao/) dan bagian dari pendapatan protokol, yang dibagikan pada akhir setiap season Hipo Club — lihat [Bagi Hasil](/docs/profit-sharing/).

:::note
Selama [biaya tata kelola](/docs/fees-and-gas/) masih **0%**, protokol tidak mengumpulkan pendapatan, sehingga tidak ada yang bisa dibagikan di aliran ini. Bagi hasil berjalan kembali begitu biaya itu berlaku lagi. Biaya 0% inilah yang membuat imbalan dasar setinggi sekarang.
:::

Semakin banyak Anda berpartisipasi, semakin banyak yang Anda peroleh, dan semakin besar peran Anda dalam membentuk masa depan Hipo.

---

_HPOrewardRate, ambang batas level, nilai tukar hGRAM, dan harga pasar HPO semuanya berubah. Angka-angka di halaman ini berlaku per tinjauan terakhir dan bukan jaminan imbalan di masa depan. Angka protokol terkini selalu tersedia di [halaman Statistik](/stats/)._
