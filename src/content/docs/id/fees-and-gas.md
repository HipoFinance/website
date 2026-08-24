---
title: 'Biaya & Gas'
description: 'Berapa sebenarnya biaya men-stake dan meng-unstake dengan Hipo: tidak ada potongan protokol dari stake Anda, biaya tata kelola yang saat ini 0%, dan prabayar gas yang bagian tak terpakainya dikembalikan.'
---

## Hipo tidak mengambil potongan dari stake Anda

Hipo tidak mengambil biaya protokol dari GRAM yang Anda stake. Satu-satunya biaya di tingkat protokol adalah biaya tata kelola yang dijelaskan di bawah; semua hal lain yang melekat pada transaksi staking atau unstake adalah gas jaringan yang dibayarkan ke TON, bukan pendapatan Hipo.

## Biaya tata kelola

Protokol memiliki biaya tata kelola atas imbalan validasi, yang ditetapkan oleh [Hipo DAO](/docs/dao/), saat ini 0%. Biaya ini hanya berlaku untuk imbalan validasi, tidak pernah untuk GRAM yang Anda stake, dan selama tetap 0% seluruh imbalan diteruskan sepenuhnya kepada pemegang hGRAM. Setiap perubahan harus melalui pemungutan suara DAO dan terlihat on-chain — lihat [Apakah Hipo mengambil potongan dari imbalan saya?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Prabayar gas dan pengembaliannya

Saat Anda men-stake atau meng-unstake, sejumlah kecil prabayar gas ditambahkan di atasnya (saat ini 0,1 GRAM); hanya sebagian kecil — sekitar seperseratus GRAM — yang terpakai dan sisanya dikembalikan. Kedua alur ini berbeda dalam hal kapan pengembalian itu tiba:

- **Setoran**: prabayar menyertai jumlah yang di-stake, dan bagian yang tidak terpakai kembali ke dompet Anda tak lama kemudian, sebagai transfer kelebihan terpisah.
- **Unstake**: prabayar menyertai burn token, dan hanya sedikit atau tidak ada yang kembali saat permintaan diajukan — sisa yang tidak terpakai dibayarkan bersama penarikan GRAM final.

## Membaca angka Anda sendiri

Karena pengembalian dari unstake tiba bersama penarikan, pembayaran penarikan mentah sedikit melebih-lebihkan imbalan staking murni — di dalamnya terbawa gas yang dikembalikan. Untuk mengukur hasil staking sebenarnya dari sebuah dompet, hitung selisih seluruh aliran per siklus: (setoran yang dikirim − pengembalian setoran) dibandingkan (pengembalian saat permintaan + pembayaran penarikan). [Halaman Imbalan](/rewards/) melacak imbalan Anda untuk Anda.

## Dari mana angka saat ini berasal

Harga gas ditetapkan oleh jaringan TON dan berubah mengikutinya, sehingga tidak ada angka tetap yang dikutip dalam sebuah dokumen yang akan terus akurat. [Aplikasi Hipo](/stake/) menampilkan prabayar yang tepat sebelum Anda mengonfirmasi. Sumber yang otoritatif adalah getter `get_treasury_fees` milik treasury, yang juga tersedia sebagai tool `get_fees` dari [Hipo MCP Server](/docs/hipo-mcp-server/).

## Biaya di luar Hipo

Melakukan swap hGRAM di DEX menggantikan gas Hipo dengan biaya swap pool ditambah price impact, dan kursnya berasal dari pool, bukan dari protokol. Daftar pool saat ini ada di [halaman DeFi](/defi/); pertimbangannya dibahas di [Risiko](/docs/risks/).

## Selengkapnya di FAQ

- [Berapa biaya untuk men-stake?](/faq/#what-does-it-cost-to-stake)
- [Apakah ada biaya unstake?](/faq/#are-there-any-unstaking-fees)
