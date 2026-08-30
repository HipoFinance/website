---
title: 'Hipo Fund — Treasury on-chain'
description: 'Hipo Fund — treasury on-chain yang menopang token HPO.'
---

<figure><img src="/docs/images/hipo-fund-1.jpg" alt="Banner promosi bertuliskan 'HipoFund.ton', dengan karung uang dikelilingi ikon Bitcoin, Tether, HPO dan TON serta grafik pertumbuhan yang menanjak."></figure>

## 📌 Apa itu Hipo Fund

Hipo Fund adalah treasury investasi jangka panjang milik Hipo. Dana ini menyimpan hasil penjualan token HPO
dan klaim season Hipo Club, dan dipisahkan dari anggaran operasional Hipo.

Idenya dipinjam dari dana minyak Norwegia: alih-alih membelanjakan pendapatan begitu diterima, sisihkan
sebagian dan kelola untuk jangka panjang. Hipo Fund ada untuk membangun nilai yang tahan lama di balik HPO,
bukan untuk menutup biaya sehari-hari.

Setiap aset yang dipegangnya berada on-chain dan dapat diperiksa oleh siapa pun.

---

## 📊 Status saat ini

| Metrik                                               | Nilai                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| **Modal awal (18 April 2025)**                       | $186.963,96                                                              |
| **Modal yang disetorkan sejak itu**                  | ~$37.092 (klaim Season 2 dan Season 3)                                   |
| **Nilai terakhir yang dilaporkan (24 Agustus 2026)** | $98.776,51                                                               |
| **Imbal hasil sejak awal (Modified Dietz)**          | −58,4%                                                                   |
| **GRAM pada periode yang sama**                      | −49,8%                                                                   |
| **Laporan terbaru**                                  | [Laporan Agustus 2026](/docs/hipo-fund/quarterly-report-august-24-2026/) |

Dana ini berada di bawah modal awalnya, terutama karena penurunan harga GRAM pada portofolio yang sangat
terkait GRAM di tahun pertamanya. Perhitungan lengkapnya ada di laporan Agustus 2026.

Kami akan menerbitkan **Investment Policy Statement (pernyataan kebijakan investasi) pada September 2026**,
yang menetapkan alokasi target, batas risiko, kebutuhan likuiditas, dan aturan rebalancing. Dokumen itu
dibawa ke komunitas untuk ditinjau, lalu ke pemungutan suara DAO yang mengikat. Itulah kerangka pengelolaan
Hipo Fund mulai dari sini.

Tanggal pastinya diumumkan di [kanal Telegram Hipo](https://t.me/HipoFinance) dan di
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv).

---

## 🏦 Dompet

Hipo Fund menyimpan aset di dua dompet. Keduanya dihitung dalam setiap laporan.

**Dompet utama — multisig**\
`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr`
([hipofund.ton](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr))

- Memerlukan **2 dari 3 tanda tangan** untuk memindahkan dana
- Penanda tangan: dua co-founder Hipo dan satu anggota tim
- Memegang sebagian besar dana

**Dompet sekunder — tanda tangan tunggal**\
`UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG`
([lihat](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG))

- Dompet asli dana ini, tetap digunakan setelah migrasi ke multisig dan masih memegang sebagian dana
- Juga berperan sebagai proposer pada multisig
- Sebagian sistem Hipo, termasuk Hipo Club, tidak mendukung dompet multisig, sehingga dompet ini
  dipertahankan untuk keperluan kelayakan. Investment Policy Statement menetapkan batas berapa banyak yang
  disimpan di sini

:::note[Catatan tentang format alamat]
TON menampilkan dompet yang sama dalam dua bentuk — bounceable (`EQ…`) dan non-bounceable (`UQ…`). Empat
karakter terakhirnya berbeda, tetapi akunnya identik. Anda mungkin melihat `UQDa2GcC…_GQu` dan
`EQDa2GcC…_Dnr` dipakai untuk multisig; keduanya adalah dompet yang sama.
:::

---

## 💵 Bagaimana Hipo Fund didanai

Hipo Fund tidak pernah menerima alokasi apa pun dari tokenomics HPO. Modalnya berasal dari:

- **Hasil penjualan token HPO**, termasuk ILO dan kesepakatan OTC dengan investor strategis
- **Klaim season Hipo Club** (Season 2 dan Season 3). Sejak Season 4, imbalan HPO mengalir langsung ke
  pemegang hGRAM, sehingga tidak ada jendela klaim musiman dan tidak ada lagi klaim jenis ini
- **Imbalan staking hGRAM** — saat ini satu-satunya sumber pendapatan aktif dana
- **Bagi hasil atas HPO yang dipegang dana**, ketika bagi hasil pendapatan protokol sedang aktif. Biaya
  staking telah 0% sejak 6 Juni 2026, sehingga saat ini tidak ada distribusi yang dilakukan

Seluruh HPO yang dipegang dana ini dibeli di pasar terbuka.

---

## 💰 Laporan pembuka — 18 April 2025

- **Modal awal:** $186.963,96
- **Awal pelaporan:** 18 April 2025

### 🔸 Alokasi portofolio awal

| Aset              | Jumlah       | Alokasi  | Nilai (USD)     | Catatan                         |
| ----------------- | ------------ | -------- | --------------- | ------------------------------- |
| hGRAM             | 34.955,22    | 59,59%   | $111.405,91     | GRAM yang di-stake              |
| HPO               | 6.754.307,59 | 38,64%   | $72.238,04      | Token tata kelola & bagi hasil  |
| Stablecoin (USDT) | 3.304,14     | 1,77%    | $3.304,14       | Pelindung modal & dana cadangan |
| GRAM              | 5,30         | 0,01%    | $15,87          | Eksposur GRAM langsung          |
| **Total**         |              | **100%** | **$186.963,96** |                                 |

_Persentase dibulatkan ke dua desimal dan mungkin tidak berjumlah tepat 100._

:::note[Koreksi, 29 Agustus 2026]
Penilaian HPO dalam tabel ini sebelumnya diterbitkan sebagai $15.000, dan itu keliru — keempat barisnya tidak
menjumlah ke modal awal yang dinyatakan. HPO kini ditampilkan pada $72.238,04, nilai pasarnya pada
18 April 2025 ($0,010695 per HPO), dan keempat persentase alokasinya telah dihitung ulang dari nilai USD-nya
sehingga tabelnya cocok dengan $186.963,96. Persentase yang diterbitkan sebelumnya adalah 59,28% (hGRAM),
1,76% (USDT), 38,95% (HPO), dan 0,01% (GRAM). Tabel perbandingan pada
[laporan Agustus 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) telah dikoreksi agar sesuai. Tidak
ada saldo yang berubah.
:::

---

## 🔒 Bagaimana dana ini dikelola

**Sepenuhnya on-chain dan dapat diverifikasi**\
Setiap aset disimpan di kedua dompet di atas dan dapat diperiksa oleh siapa pun kapan saja. Dana ini hanya
memegang aset yang dapat dipantau secara transparan on-chain.

**Pelaporan berbasis snapshot**\
Laporan sejak Agustus 2026 dan seterusnya dihasilkan oleh
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
yang membaca setiap saldo dari satu blok masterchain TON dan mencantumkan blok tersebut, nilai tukar hGRAM,
serta setiap harga yang dipakai di bagian Catatan laporan. Pembaca mana pun dapat menjalankan ulang skripnya
dan mereproduksi tabelnya.

Laporan [Agustus 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) dan
[Desember 2025](/docs/hipo-fund/quarterly-report-december-18-2025/) mendahului skrip tersebut dan disusun
secara manual. Saldonya sejak itu telah dicocokkan dengan chain dan hasilnya sesuai; penilaiannya memakai
konvensi harga yang berbeda, yang dicatat dalam laporan Agustus 2026.

**Pelaporan berkala**\
Hipo Fund menerbitkan laporan setiap kuartal. Setiap laporan memuat kinerja sejak awal dan sebuah benchmark.
Laporan berikutnya dijadwalkan pada **Desember 2026**.

**Keputusan yang diumumkan**\
Perubahan portofolio yang material diumumkan di kanal resmi Hipo, dan perubahan strategi dana dibawa ke
pemungutan suara DAO.

**Pertumbuhan dengan risiko terkendali**\
Dana ini dikelola untuk perlindungan modal jangka panjang dan pertumbuhan yang berkelanjutan. Alokasi target,
batas konsentrasi, kebutuhan likuiditas, dan aturan rebalancing ditetapkan dalam Investment Policy Statement.

**Tata kelola**\
Pemegang HPO memberikan suara atas arah Hipo Fund melalui [Hipo DAO](/docs/dao/) di
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv). Investment Policy Statement
adalah kebijakan Hipo Fund pertama yang dibawa ke pemungutan suara yang mengikat. Eksekusi di dalam kebijakan
yang telah disetujui ditangani oleh para penanda tangan multisig; perubahan pada kebijakannya dibawa ke DAO.

---

## ⚠️ Risiko

Hipo Fund adalah treasury kripto dan nilainya bergerak mengikuti pasar. Risiko utamanya:

- **Risiko pasar.** Kepemilikan dana ini yang bukan stablecoin terekspos pada harga GRAM dan HPO.
- **Risiko konsentrasi.** Aset dana ini terkonsentrasi di ekosistem TON dan pada token Hipo sendiri.
- **Risiko likuiditas.** Posisi HPO tergolong besar dibandingkan likuiditas HPO di pasar. Nilai yang
  dilaporkan adalah harga pasar dikalikan saldonya; ini bukan klaim bahwa seluruh posisi dapat dijual pada
  harga tersebut.
- **Risiko kustodi.** Sebagian dana berada di dompet dengan tanda tangan tunggal.
- **Risiko smart contract.** Aset yang disimpan di protokol DeFi, termasuk hGRAM, membawa risiko kegagalan
  kontrak.

Risiko-risiko ini dikelola, bukan dihilangkan. Investment Policy Statement menetapkan batas untuk
masing-masing risiko tersebut.

---

## 💜 Untuk komunitas Hipo

Hipo Fund dimiliki oleh komunitas. Pertumbuhannya menopang nilai dan keberlanjutan HPO serta setiap pemegang
HPO. Kami berkomitmen pada pelaporan yang berkala dan transparan serta tata kelola yang terbuka.

Ingin mengusulkan strategi, alat DeFi, atau proyek TON untuk dana ini? Ikut berdiskusi di
[@hipo_chat di Telegram](https://t.me/hipo_chat).
