# belajar-bun-fundamental

Proyek belajar **Bun + TypeScript** yang membahas runtime Bun, API bawaannya, testing,
workspace monorepo, dan integrasi database MySQL lewat **Prisma 8** (contract-first, tanpa
client generation).

Tujuan repo ini adalah kumpulan contoh kecil yang bisa dijalankan satu per satu, bukan
aplikasi produksi tunggal. Hampir semua contoh berada di file `*.ts` pada root repo.

## Kebutuhan

- [Bun](https://bun.com) >= 1.4 (proyek dibuat dengan `bun init` v1.4.4)
- MySQL / MariaDB yang bisa diakses
- Tidak perlu Node.js, `npm`, `ts-node`, `jest`, atau `tsc` — semua digantikan Bun

## Instalasi

```bash
bun install
```

`postinstall` menjalankan `prisma skills sync` (aman dilewati bila gagal).

## Konfigurasi environment

Bun memuat file `.env` secara otomatis, jadi **jangan tambahkan `dotenv`**. Buat `.env`
di root:

```dotenv
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=secret
DATABASE_NAME=belajar_bun

# Dipakai Prisma 8 (prisma.config.ts)
DATABASE_URL=mysql://root:secret@localhost:3306/belajar_bun
```

Variabel dipakai di:

- `env.ts` / `util.ts` — membaca `DATABASE_HOST` dkk dari `process.env` / `Bun.env`
- `prisma.config.ts` — koneksi Prisma dari `DATABASE_URL`
- `prisma/db.ts` — runtime Prisma memakai `DATABASE_URL`

## Menjalankan contoh

Semua contoh dijalankan langsung dengan Bun (tanpa build step):

```bash
bun index.ts       # hello world
bun server.ts      # HTTP server dengan Bun.serve (port 3000)
bun express.ts     # server Express di port 3000 (Bun sebagai runtime)
bun env.ts         # baca environment variable
bun file.ts        # Bun.file: baca .env lalu tulis .env.test
bun hash.ts        # Bun.password: hash & verify bcrypt
bun semver.ts      # Bun.semver: cek versi
bun util.ts        # info runtime Bun
bun winston.ts     # logging dengan winston
bun zod.ts         # validasi schema dengan zod
bun hello.tsx      # JSX tanpa React
bun prisma.ts      # insert satu baris ke tabel contacts
```

Development server dengan hot reload:

```bash
bun --hot server.ts
```

## Testing

```bash
bun test          # bunfig.toml: root ./test, coverage aktif
```

Test yang ada:

- `test/hello.test.ts` — unit test fungsi `sayHello`
- `test/user.test.ts` — import dari workspace `packages/user`
- `test/fetch.test.ts` — Web API `fetch` (butuh jaringan)
- `test/os.test.ts` — API Node.js `node:os` (expects Linux/x64)

## Type checking & formatting

```bash
bun check        # sama dengan tsc --noEmit
bun fmt          # format kode
```

## Struktur proyek

```
.
├── index.ts / server.ts / express.ts / ...   # contoh runtime Bun
├── src/hello.ts                              # kode yang dipakai test
├── test/*.test.ts                            # test Bun
├── packages/                                 # bun workspaces
│   ├── user/                                 # class User
│   ├── contact/                              # contoh workspace kosong
│   └── address/                              # contoh workspace kosong
├── prisma/
│   ├── schema.prisma                         # sumber contract (PSL) — edit di sini
│   ├── schema.json                           # hasil emit, JANGAN edit manual
│   ├── schema.d.ts                            # tipe hasil emit, JANGAN edit manual
│   ├── db.ts                                 # runtime client Prisma 8
│   └── migrations/                           # migration & snapshot
├── prisma.config.ts                          # konfigurasi Prisma 8
├── bunfig.toml                               # konfigurasi Bun (loglevel, test)
└── tsconfig.json
```

## Workspace

`packages/*` terdaftar di `workspaces` pada `package.json`. Setiap workspace punya
`package.json`, `tsconfig.json`, dan `.gitignore` sendiri.

Cara memakai workspace dari root:

```ts
import { User } from "./packages/user/user";
```

Untuk menambah workspace baru: buat folder di `packages/`, tambahkan `package.json`-nya,
lalu jalankan `bun install` agar ter-link.

## Prisma 8 (contract-first)

Proyek ini memakai Prisma 8 (`prisma@8.0.0-rc.34`, `@prisma/orm-mysql@8.0.0-rc.24`).
Modelnya berbeda dari Prisma 5/6: **tidak ada client generation**. Semua berjalan dari
contract yang di-emit.

- Edit `prisma/schema.prisma`, lalu emit ulang setiap kali berubah.
- `prisma/schema.json` dan `prisma/schema.d.ts` adalah hasil generate — jangan diedit manual.
- `migration plan` membaca `schema.json`, bukan `schema.prisma`. Kalau lupa emit, planner
  akan menganggap tidak ada perubahan.

Alur standar:

```bash
bunx prisma contract emit                    # regenerate schema.json + schema.d.ts
bunx prisma migration plan --name add_xxx    # rencanakan delta dari db ref
bunx prisma db migrate --db "$DATABASE_URL"  # apply migration
bunx prisma db verify --db "$DATABASE_URL"   # pastikan tidak ada drift
```

Iterasi cepat saat masih eksperimen:

```bash
bunx prisma contract emit
bunx prisma db update --db "$DATABASE_URL" --dry-run
bunx prisma db update --db "$DATABASE_URL"
```

Catatan penting:

- Prisma 8 tidak menjalankan migration saat aplikasi start; jalankan `prisma db migrate`
  dari pipeline deploy sebelum app boot.
- Migration pertama (`20261118T1705_init`) membuat tabel `contacts`.

Contoh query memakai runtime Prisma 8 (`prisma.ts`):

```ts
import { db } from "./prisma/db.ts";

const insert = db.sql.contacts
  .insert([{ name: "Bima", email: "bima@gmail.com", phone: "0890803234" }])
  .build();

await db.execute(insert);
```

## Materi

`slide/Bun Dasar.pptx` berisi slide materi dasar Bun.

## Referensi

- [Dokumentasi Bun](https://bun.com/docs)
- [Bun API types](node_modules/bun-types/docs)
- `AGENTS.md` — konvensi runtime dan workflow Prisma 8
