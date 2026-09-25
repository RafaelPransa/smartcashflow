# SmartCashFlow

Aplikasi pencatatan keuangan digital berbasis website statis (TypeScript + React + Tailwind CSS).
Data disimpan langsung di browser lewat IndexedDB (via Dexie.js) — tidak butuh backend/server terpisah, aman, cepat, dan bekerja offline (*offline-first*).

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Struktur Folder

```
src/
├── types/finance.ts          # Definisi tipe: Transaction, Category, filter, dll
├── lib/
│   ├── db.ts                 # Setup Dexie (IndexedDB) + kategori default
│   ├── transactionRepository.ts  # Query transaksi: summary, chart, filter rentang
│   └── validation.ts         # Skema Zod untuk validasi form
├── store/
│   └── useFilterStore.ts     # State global filter periode (Zustand)
├── utils/
│   ├── dateRange.ts          # Resolve preset (day/month/year/custom) -> rentang tanggal
│   ├── format.ts             # Format Rupiah
│   └── exportImport.ts       # Ekspor CSV, Backup & Restore JSON
├── components/
│   ├── PeriodFilter.tsx      # Filter hari/bulan/tahun/kustom (lengkap dengan date-range picker)
│   ├── TransactionForm.tsx   # Form tambah & edit transaksi
│   └── CategoryIcon.tsx      # Renderer ikon kategori & palet warna
├── pages/
│   ├── DashboardPage.tsx     # Ringkasan saldo, metrik, & widget transaksi terbaru
│   ├── TransactionsPage.tsx  # CRUD transaksi, pencarian, filter, & ekspor/impor
│   ├── ChartsPage.tsx        # Grafik tren (Bar) & distribusi pengeluaran per kategori (Pie)
│   └── CategoriesPage.tsx    # Manajemen lengkap kategori (tambah/edit/hapus/ikon/warna)
├── App.tsx                   # Routing & layout navigasi utama
└── main.tsx                  # Entry point & registrasi Service Worker PWA
public/
├── manifest.json             # Web App Manifest untuk PWA (bisa diinstal di desktop/HP)
├── sw.js                     # Service Worker caching offline-first
└── icon.svg                  # Ikon aplikasi
```

## Status Fitur

- [x] Pencatatan pemasukan & pengeluaran — `TransactionForm`, disimpan ke `db.transactions`
- [x] Rekap dengan filter hari/bulan/tahun/rentang kustom — `PeriodFilter` + `transactionRepository`
- [x] Grafik perbandingan tren aliran kas — `ChartsPage` (Bar Chart)
- [x] Filter rentang kustom (Date Range Picker) — UI pemilihan tanggal mulai & selesai lengkap dengan validasi
- [x] Manajemen Kategori Kustom (CRUD) — Halaman `/categories` untuk tambah, ubah ikon/warna, dan hapus kategori
- [x] Fitur Edit & Hapus Transaksi — Tombol aksi di `TransactionsPage` dengan konfirmasi aman
- [x] Pencarian & Filter Cepat Transaksi — Cari berdasarkan catatan/kategori dan filter tipe (Semua / Pemasukan / Pengeluaran)
- [x] Ekspor & Backup Data — Ekspor ke format CSV & JSON Backup
- [x] Restore / Impor Data — Impor kembali file backup JSON ke IndexedDB
- [x] Distribusi Pengeluaran per Kategori — Pie / Donut Chart di `ChartsPage`
- [x] PWA (Progressive Web App) & Offline-Ready — Web App Manifest + Service Worker untuk mode aplikasi native
