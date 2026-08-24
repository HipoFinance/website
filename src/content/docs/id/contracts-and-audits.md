---
title: 'Kontrak & audit'
description: 'Alamat kontrak Hipo di mainnet, empat audit keamanan independen, dan di mana membaca kode sumbernya.'
---

## Alamat mainnet

| Kontrak                                                                              | Alamat                                                                                                                       |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (kontrak protokol utama, menerima setoran dan menyimpan GRAM yang di-stake) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                                       | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| Jetton HPO                                                                           | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
Alamat parent dapat berubah saat protokol ditingkatkan — [README repositori kontrak](https://github.com/HipoFinance/contract) adalah sumber kebenarannya. Selalu verifikasi sebuah alamat terhadap sumber resmi Hipo sebelum mengirim apa pun ke alamat tersebut.
:::

## Audit

Smart contract Hipo telah melalui empat audit independen: Quantstamp (April 2025) dan ProgramCrafter (Maret 2024) pada kontrak v2, serta TonTech dan Daniil Sedov (Oktober 2023) pada v1. Setiap laporan diterbitkan lengkap di [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Kode sumber

- **Kontrak**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — ditulis dalam FunC dengan perangkat Blueprint; rangkaian pengujian publiknya dapat dijalankan dari repositori tersebut.
- **Server MCP**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — paket npm `@hipo-finance/mcp`, berlisensi MIT.

## Apa yang dilakukan setiap kontrak

- **Treasury** — kontrak protokol utama: menyimpan GRAM yang disetor dan meminjamkannya kepada peminjam / validator.
- **Parent** — jetton master (minter) yang menjadi perantara komunikasi antara dompet dan treasury.
- **Wallet** — implementasi dompet jetton per pengguna.
- **Loan** — digunakan untuk pinjaman validasi kepada peminjam.
- **Bill** — NFT yang tidak dapat ditransfer (SBT), diterbitkan ketika sebuah operasi tidak dapat selesai seketika, misalnya unstake saat dana sedang berada dalam putaran validasi.
- **Collection** — koleksi NFT tempat bill tersebut bernaung.
- **Librarian** — pembantu untuk deployment dan penyimpanan kontrak menggunakan fitur library TON.
- **Borrower application** — membantu validator meminjam dari protokol untuk validasi.
- **Webapp** — membantu pengguna men-stake dan meng-unstake.

## Dokumen teknis

- [Arsitektur](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — state machine putaran validasi dan invarian protokol.
- [Panduan integrasi](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — skema pesan untuk dompet dan protokol.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — skema pesan TL-B lengkap.
- [Diagram alur pesan](https://github.com/HipoFinance/contract/tree/main/graphs/img) — satu gambar untuk setiap alur protokol.

Untuk membaca kondisi protokol secara langsung — nilai tukar, biaya, waktu putaran — gunakan [Hipo MCP Server](/docs/hipo-mcp-server/).

## Selengkapnya di FAQ

- [Apakah Hipo sudah diaudit?](/faq/#has-hipo-been-audited)
- [Di mana saya bisa memverifikasi transaksi Hipo?](/faq/#where-can-i-verify-hipo-transactions)
- [Risiko](/docs/risks/)
