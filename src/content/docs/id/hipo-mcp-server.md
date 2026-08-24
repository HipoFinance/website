---
title: 'Hipo MCP Server'
description: 'Hubungkan Claude, Cursor, atau klien AI apa pun yang mendukung MCP ke dokumentasi Hipo dan data on-chain terkini.'
---

## Apa itu Hipo MCP Server?

Hipo MCP Server adalah layanan kecil dan open-source yang memungkinkan asisten AI mengakses data terkait Hipo, termasuk informasi tentang staking GRAM dan topik lainnya. Layanan ini menggunakan [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), sebuah standar terbuka untuk menghubungkan klien AI ke data eksternal, sehingga klien apa pun yang mendukung MCP — Claude, Claude Code, Cursor, dan lainnya — dapat membaca dokumentasi Hipo dan menanyakan angka on-chain terkini alih-alih menebak dari ingatan.

Setelah terhubung, asisten Anda dapat menjawab pertanyaan seperti:

- _Berapa nilai tukar hGRAM/GRAM saat ini, dan berapa APY yang tersirat darinya?_
- _Berapa banyak GRAM yang di-stake di Hipo saat ini?_
- _Kapan putaran validasi saat ini berakhir, dan kapan setoran tertunda saya akan menghasilkan hGRAM?_
- _Berapa saldo hGRAM alamat ini, dan berapa nilainya dalam GRAM?_
- _Biaya gas berapa yang harus saya sertakan pada sebuah setoran?_

Jawabannya berasal dari getter smart contract Hipo di TON, bukan dari data pelatihan model, sehingga selalu mutakhir pada saat Anda bertanya.

Server ini bersifat **read-only** sepenuhnya. Ia tidak menyimpan kunci, tidak menandatangani apa pun, dan tidak mengirim pesan ke blockchain. Ia bisa melihat, tetapi tidak akan pernah bisa memindahkan dana Anda — menghubungkannya bukan cara bagi siapa pun untuk men-stake, meng-unstake, atau mentransfer atas nama Anda.

## Menghubungkan

### Server terkelola (disarankan)

Hipo menjalankan instance publik. Arahkan klien MCP Anda ke:

```
https://mcp.hipo.finance/mcp
```

Di [Claude Code](https://claude.com/product/claude-code), satu perintah sudah cukup:

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Perintah itu mendaftarkan server untuk proyek saat ini. Untuk menjangkaunya dari setiap proyek, tambahkan `-s user` — di sini `user` adalah kata kunci scope yang literal, bukan placeholder untuk nama pengguna Anda sendiri:

```sh
claude mcp add -s user --transport http hipo https://mcp.hipo.finance/mcp
```

Apa pun pilihannya, gunakan perintah tersebut alih-alih menyunting berkas konfigurasi secara manual: Claude Code menyimpan server MCP-nya di konfigurasinya sendiri, dan blok `mcpServers` yang diletakkan di `settings.json` akan diabaikan. Jalankan `claude mcp list` untuk memastikan server terhubung, lalu mulai ulang Claude Code — server dihubungkan saat startup, sehingga server yang baru ditambahkan tidak tersedia pada sesi yang sedang berjalan.

Klien lain dikonfigurasi dengan berkas JSON (Claude Desktop, Cursor, dan sebagian besar lainnya) dan menerima entri seperti ini:

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

### Menjalankannya secara lokal

Jika Anda lebih suka menjalankan server sendiri, layanan ini diterbitkan di npm sebagai [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) dan menggunakan stdio. Ini membutuhkan Node.js 20 atau yang lebih baru:

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

Saran yang sama berlaku di sini — tambahkan dengan perintah, bukan dengan menyunting berkas secara manual. Untuk klien lain, entri konfigurasi JSON-nya adalah:

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

## Tool

Berikut pertanyaan-pertanyaan yang dapat dijawab server ini. Klien AI Anda memilih sendiri tool yang tepat — Anda cukup bertanya dengan bahasa biasa.

| Tool                 | Yang dikembalikan                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_exchange_rate`  | Kurs hGRAM↔GRAM saat ini, total GRAM yang di-stake, suplai hGRAM, dan APY terkini yang diturunkan dari pembaruan kurs on-chain                   |
| `get_treasury_state` | Total treasury: TVL dalam GRAM, suplai hGRAM, setoran dan unstake yang menunggu, partisipasi putaran aktif, flag halt, dan parameter tata kelola |
| `get_round_timing`   | Waktu putaran validasi: batas putaran saat ini dan berikutnya, jendela partisipasi pemilihan, dan berapa lama stake tetap dibekukan              |
| `get_fees`           | Biaya gas saat ini untuk setoran, unstake, dan permintaan pinjaman                                                                               |
| `get_wallet_status`  | Saldo hGRAM sebuah alamat, nilainya dalam GRAM, serta stake atau unstake yang masih menunggu                                                     |
| `get_reward_history` | Riwayat imbalan staking GRAM sebuah alamat per putaran, termasuk level Hipo Club dan imbalan HPO                                                 |
| `get_participation`  | Partisipasi Hipo dalam sebuah putaran validasi: status, jumlah pinjaman, total, dan waktu pelepasan stake                                        |
| `get_loan_info`      | Kontrak pinjaman seorang peminjam per putaran: alamat, status deployment, saldo, dan pihak-pihak terkait                                         |
| `get_max_punishment` | Hukuman maksimum yang dapat diterapkan protokol untuk sejumlah stake validator tertentu                                                          |

Empat tool pertama sama sekali tidak memerlukan masukan. `get_wallet_status`, `get_reward_history`, dan `get_loan_info` menerima alamat TON — alamat milik pemilik atau peminjam itu sendiri, bukan alamat dompet jetton mereka — dan `get_max_punishment` menerima jumlah stake dalam GRAM. `get_participation` dan `get_loan_info` juga menerima waktu mulai putaran, tetapi itu opsional: jika dikosongkan, keduanya melaporkan putaran saat ini.

Setiap respons membawa pengingat yang sama bahwa tool ini mengembalikan data protokol terkini, bukan nasihat keuangan: nilai berubah setiap putaran validasi dan tidak ada imbal hasil yang dijamin.

## Sumber dokumentasi

Selain data terkini, server ini juga menyediakan dokumen teknis Hipo sebagai resource MCP, diambil dari lokasi publik kanoniknya sehingga selalu mutakhir:

| Resource                   | Konten                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | README repositori smart contract: ringkasan protokol dan alamat kontrak yang di-deploy |
| `hipo://docs/architecture` | Kontrak, state machine putaran validasi, dan invarian protokol                         |
| `hipo://docs/integration`  | Skema pesan dan panduan integrasi untuk dompet dan protokol lain                       |
| `hipo://docs/schema`       | Skema TL-B lengkap semua kontrak Hipo                                                  |
| `hipo://docs/knowledge`    | Basis pengetahuan Hipo yang dikurasi ([llms.txt](https://hipo.finance/llms.txt))       |

## Contoh

Panggilan ke `get_exchange_rate` mengembalikan JSON biasa. Angka berubah setiap putaran, jadi perlakukan ini sebagai bentuk, bukan sebagai nilai saat ini:

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

Server ini tidak pernah mengimplementasikan ulang perhitungan protokol. Setiap angka di atas berasal dari getter kontrak, dan repositori kontrak adalah sumber kebenaran untuk alamat yang di-deploy.

## Self-hosting

Server ini berlisensi MIT dan berada di [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp). Ia menyediakan dua transport — `stdio` untuk klien lokal dan streamable HTTP untuk deployment terkelola — serta sebuah Dockerfile:

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

Semua konfigurasi bersifat opsional; nilai bawaannya mengarah ke mainnet melalui API toncenter publik.

| Variabel lingkungan        | Bawaan                                 | Kegunaan                                                                                                                  |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` atau `testnet`                                                                                                  |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | Endpoint TON HTTP API                                                                                                     |
| `TONCENTER_API_KEY`        | _(tidak ada)_                          | Kunci API toncenter; tanpa kunci, batas laju publik berlaku, dan panggilan yang terkena batas dicoba ulang dengan backoff |
| `TONCENTER_API_KEY_FILE`   | _(tidak ada)_                          | Path ke berkas yang menyimpan kunci API, misalnya Docker secret; lebih diutamakan daripada `TONCENTER_API_KEY`            |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | Berapa lama status treasury, waktu, dan biaya di-cache di antara pemanggilan tool                                         |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | Berapa lama resource dokumentasi di-cache                                                                                 |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | Base URL dari API imbalan Hipo; kosongkan untuk menonaktifkan `get_reward_history`                                        |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | Hanya untuk transport HTTP                                                                                                |
