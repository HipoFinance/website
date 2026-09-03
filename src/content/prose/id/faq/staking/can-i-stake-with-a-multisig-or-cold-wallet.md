---
order: 5
section: 'staking'
question: 'Bisakah saya stake dengan multisig atau cold wallet?'
---

Ya. Dompet yang tidak bisa menandatangani transaksi dapp, seperti dompet multisig, melakukan stake dengan transfer biasa: kirim GRAM yang ingin Anda stake, ditambah 0,1 GRAM sebagai uang muka biaya, ke treasury Hipo dengan komentar teks "d". Uang muka ini dibulatkan ke atas dengan lapang — bagian yang tidak terpakai dikembalikan, dan hGRAM dikirim kembali ke alamat yang sama.

Untuk unstake semuanya, kirim 0,1 GRAM ke treasury dengan komentar teks "w". Untuk unstake hanya sebagian saldo Anda, hubungkan multisig ke aplikasi Hipo, ketik jumlahnya, dan tekan Unstake: aplikasi akan membuat raw order — alamat tujuan, jumlah TON, dan isi dalam base64 — yang Anda salin ke multisig Anda, dan inilah yang disebut multisig.ton.org sebagai "Arbitrary order". Prosedur lengkapnya, termasuk alamat treasury, ada di [Staking tanpa aplikasi](/docs/staking-without-the-app/).
