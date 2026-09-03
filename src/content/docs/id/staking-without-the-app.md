---
title: 'Staking tanpa aplikasi'
description: 'Men-stake dan meng-unstake di Hipo dengan transfer dompet biasa — untuk dompet multisig, cold wallet, dan dompet lain yang tidak dapat menandatangani transaksi dapp.'
---

## Kapan Anda membutuhkan ini

Halaman ini ditujukan untuk dompet yang tidak dapat menandatangani transaksi dapp — dompet multisig dan sebagian cold wallet. Selain itu, sebaiknya gunakan [aplikasi Hipo](/stake/), yang lebih murah dan menampilkan perkiraan yang tepat sebelum Anda mengonfirmasi. Ketika dompet multisig terhubung ke aplikasi Hipo, menekan Stake atau Unstake menyerahkan order langsung ke aplikasi dompet Anda; instruksi ini adalah cadangan untuk saat itu tidak berhasil.

## Stake — komentar "d"

Kirim GRAM yang ingin Anda stake **ditambah 0,1 GRAM** sebagai prabayar gas ke treasury Hipo:

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

Atur komentar teks transaksi persis menjadi:

```
d
```

Komentar harus huruf kecil, teks biasa, dan tidak terenkripsi. Prabayar tersebut dibulatkan ke atas dengan longgar — hanya sebagian kecil yang terpakai dan sisanya dikembalikan (lihat [Biaya & gas](/docs/fees-and-gas/)). hGRAM dikirim kembali ke alamat yang sama dengan asal transfer.

## Unstake semuanya — komentar "w"

Kirim 0,1 GRAM ke alamat treasury yang sama dengan komentar teks:

```
w
```

Ini meng-unstake **seluruh** saldo hGRAM dompet tersebut. Untuk meng-unstake hanya sebagian saldo, gunakan raw order sebagai gantinya — lihat bagian berikutnya. Unstake diselesaikan menurut aturan protokol yang normal, jadi ketentuan waktu unstake Penuh berlaku — lihat [Cara kerja unstaking](/docs/introduction/how-does-hipo-work/unstaking/) dan [Berapa lama unstaking berlangsung?](/faq/#how-long-does-unstaking-take)

## Unstake sebagian — raw order

Komentar teks hanya bisa meminta semuanya, karena tidak ada tempat untuk mencantumkan jumlah. Unstake sebagian adalah pesan biasa dengan isi biner, sehingga membutuhkan dompet atau multisig yang bisa mengirimkannya — multisig.ton.org menyebut ini "Arbitrary order", dan formulirnya membutuhkan persis tiga nilai di bawah ini.

Buka [aplikasi Hipo](/unstake/) dengan multisig Anda terhubung, ketik jumlah yang ingin Anda unstake, dan tekan Unstake. Aplikasi menyerahkan order ke aplikasi dompet Anda, yang membuatnya sebagai permintaan multisig untuk disetujui penanda tangan lain. **Pastikan multisig Anda adalah dompet yang terpilih sebelum menandatangani** — tautan ini tidak bisa memilihkannya untuk Anda. Jika tidak ada aplikasi dompet yang terbuka, aplikasi akan menampilkan tiga nilai tersebut sebagai gantinya, sehingga Anda bisa membuat order secara manual:

- **Alamat Tujuan (Destination Address)** — kontrak dompet hGRAM Anda sendiri. Ini bukan treasury: ini adalah kontrak yang menyimpan hGRAM Anda, diturunkan dari alamat multisig Anda. Verifikasi di Tonviewer sebelum Anda menandatangani; aplikasi menautkan ke sana.
- **Jumlah TON (TON Amount)** — 0,1 GRAM, prabayar gas yang sama seperti di tempat lain, dikembalikan kecuali bagian yang terpakai.
- **BOC Order (Order BOC)** — isi pesan, dalam base64.

Dua hal yang perlu diketahui. Hanya kontrak dompet hGRAM Anda sendiri yang menerima order ini, jadi jika secara tidak sengaja ditandatangani dari dompet lain, order tersebut akan bounce dan tidak ada yang di-burn — berbeda dengan komentar "w", yang akan meng-unstake berapa pun saldo yang kebetulan dimiliki dompet pengirim. Selain itu, jika Anda memilih kurs instan, jumlah yang bisa ditebus secara instan berubah setiap putaran: tanda tangani segera, atau pilih kurs terbaik untuk order yang harus menunggu tanda tangan lain.

## Burn hGRAM melalui minter

Anda juga dapat menukarkan GRAM secara langsung dengan mem-burn hGRAM di [minter.ton.org](https://minter.ton.org/), menggunakan alamat master hGRAM (Parent):

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

Setelah di-burn, Anda menerima GRAM dengan kurs penukaran saat ini. Alamat parent dapat berubah saat protokol diperbarui — periksa [Kontrak & audit](/docs/contracts-and-audits/) terlebih dahulu.

## Atau swap di DEX

Pool hGRAM tersedia di DeDust, STON.fi, TONCO, GroypFi, dan swap.coffee — daftar terkininya ada di [halaman DeFi](/defi/). Biaya swap dan dampak harga berlaku.

## Sebelum Anda mengirim

- Verifikasi alamat treasury terhadap [Kontrak & audit](/docs/contracts-and-audits/) — jangan pernah percaya alamat dari pesan yang diteruskan; lihat [Kesadaran phishing](/docs/security/phishing-awareness-and-prevention/).
- Komentar harus berupa teks biasa, persis `d` atau `w`.
- Transfer tanpa komentar, atau dengan komentar yang salah, bukan merupakan permintaan stake atau unstake.
- Untuk raw order, pastikan tujuannya adalah kontrak dompet hGRAM Anda sendiri, bukan alamat dari tempat lain.

## Selengkapnya di FAQ

- [Bisakah saya men-stake dengan dompet multisig atau cold wallet?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Biaya & gas](/docs/fees-and-gas/)
