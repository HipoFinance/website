---
title: 'Validator'
---

## Meminjamkan token GRAM ke validator

1. **Model validator tanpa izin**: Hipo meminjamkan GRAM yang di-stake kepada validator melalui model terbuka — validator mana pun bisa menawar, tanpa persetujuan dari Hipo.
2. **Model lelang validator**: pada setiap putaran validasi, validator menawar untuk meminjam GRAM yang di-stake dengan mengajukan tingkat imbalan yang akan mereka bayar. Kontrak Hipo memilih penawaran terbaik secara otomatis, sehingga staker mendapat kurs terbaik yang tersedia pada putaran itu.
3. **Proses yang aman**: Semua proses, termasuk peminjaman GRAM yang di-stake dan pembagian imbalan, dijalankan dengan aman melalui smart contract Hipo. Protokol ini telah menjalani [audit keamanan](https://github.com/HipoFinance/audits) untuk memastikan integritas dan keamanan dana pengguna.
4. **Jaminan validator**: validator yang meminjam harus mengunci GRAM miliknya sendiri yang menutup penalti slashing maksimum untuk putaran tersebut ditambah imbalan yang dijanjikannya. Penalti diambil dari jaminan itu, bukan dari GRAM yang di-stake.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Diagram: protokol Hipo meminjamkan GRAM ke validator, yang melakukan validasi di TON dan mengembalikan GRAM beserta imbalan staking."></figure>
