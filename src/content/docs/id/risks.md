---
title: 'Risiko'
description: 'Risiko men-stake GRAM dengan Hipo — smart contract, validator, likuiditas, variasi imbalan, dan phishing — serta apa yang dilakukan protokol untuk masing-masing.'
---

Staking dan DeFi selalu mengandung risiko, dan Hipo tidak menjamin imbal hasil. Halaman ini memuat risiko men-stake GRAM dengan Hipo, apa yang dilakukan protokol untuk masing-masing risiko, dan apa yang dapat Anda lakukan sendiri.

## Risiko smart contract

Bug atau kerentanan pada smart contract dapat memengaruhi dana. Kontrak Hipo bersifat open-source dan telah melalui empat audit independen — Quantstamp (April 2025) dan ProgramCrafter (Maret 2024) pada kontrak v2, TonTech dan Daniil Sedov (Oktober 2023) pada v1 — serta ditulis dalam FunC dengan Blueprint, dengan test suite publik. Verifikasi sendiri alamat yang Anda gunakan melalui [Kontrak & audit](/docs/contracts-and-audits/).

## Risiko validator dan staking

Imbalan staking bergantung pada validator yang berpartisipasi dengan benar dalam putaran validasi TON. Sebelum sebuah validator dapat meminjam GRAM yang di-stake, ia harus mengunci jaminan yang menutupi denda slashing maksimum untuk putaran tersebut ditambah imbalan yang dijanjikannya, sehingga denda diambil dari jaminan itu, bukan dari GRAM yang di-stake. Kinerja yang buruk tetap dapat terlihat sebagai imbalan yang lebih rendah untuk putaran tersebut — lihat [Validator & Marketplace](/docs/introduction/how-does-hipo-work/validators/) dan [Apa yang terjadi jika kinerja validator buruk?](/faq/#what-happens-if-a-validator-underperforms)

## Risiko likuiditas

Unstake Instan hanya berhasil jika protokol memiliki cukup GRAM bebas untuk menutupinya; [aplikasi](/unstake/) menampilkan jumlah maksimum yang tersedia saat ini. Unstake Penuh selalu berhasil tetapi diselesaikan setelah putaran validasi saat ini — dalam kasus terburuk, penantiannya bisa mencapai sekitar 36 jam. Keluar melalui [DEX](/defi/) bergantung pada likuiditas pool dan membawa dampak harga — lihat [Mengapa unstake Instan terkadang tidak tersedia?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Variasi imbalan

Tingkat imbalan berubah dari waktu ke waktu mengikuti penawaran validator dan kondisi jaringan, dan tidak ada imbal hasil tetap yang dijanjikan. Angka terkini dan historis ada di [halaman Stats](/stats/), bukan di halaman ini.

## Risiko phishing

Gunakan hanya tautan resmi Hipo, dan verifikasi setiap permintaan dompet sebelum menandatangani. Saluran resmi dan alamat kontrak tercantum di [Kesadaran phishing](/docs/security/phishing-awareness-and-prevention/) dan [Kontrak & audit](/docs/contracts-and-audits/).

## Yang tidak dijanjikan Hipo

- Tidak ada imbal hasil tetap — imbalan bervariasi pada setiap putaran validasi.
- Tidak ada staking tanpa risiko — risiko di atas selalu berlaku.
- Tidak ada penarikan native instan dalam setiap kasus — Instan bergantung pada likuiditas protokol.

## Selengkapnya di FAQ

- [Bisakah saya kehilangan dana saya?](/faq/#can-i-lose-my-funds)
- [Apakah Hipo aman?](/faq/#is-hipo-safe)
