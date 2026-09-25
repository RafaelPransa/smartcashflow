# SmartCashFlow

SmartCashFlow adalah aplikasi pencatatan keuangan pribadi berbasis web statis (*client-only*) yang dirancang untuk bekerja secara cepat, aman, dan dapat digunakan sepenuhnya tanpa koneksi internet (*offline-first*).

---

## Cara Menjalankan

### Prasyarat
- **Node.js** (versi 18 ke atas disarankan)
- **NPM** atau package manager sejenis

### Langkah Instalasi & Menjalankan

1. **Clone / Masuk ke direktori project**:
   ```bash
   cd d:\Project\smartcashflow
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan server development lokal**:
   ```bash
   npm run dev
   ```
   Buka browser dan akses alamat: `http://localhost:5173`.

4. **Kompilasi produksi (Opsional)**:
   ```bash
   npm run build     # Kompilasi TypeScript dan membuat bundle dist/
   npm run preview   # Menjalankan preview lokal hasil build dist/
   ```

---

## Alur dan Cara Kerja Sistem

Sistem SmartCashFlow bekerja sepenuhnya di sisi klien (*browser-side*) tanpa server backend eksternal. Seluruh proses pemrosesan data, validasi, kalkulasi, hingga penyimpanan dilakukan di browser pengguna.

```
Pengguna (UI)
   │
   ├── Input Transaksi / Kategori ──> Validasi (Zod Schema) ──> Simpan ke IndexedDB (Dexie.js)
   │
   ├── Pilih Filter Periode ───────> Global State (Zustand) ──> Query Rentang Tanggal
   │                                                                 │
   └── Lihat Rekap & Grafik <────── Kalkulasi & Agregasi Data <──────┘
```

### 1. Inisialisasi & Penyimpanan Data Lokal (IndexedDB via Dexie.js)
- **Tanpa Backend**: Menggantikan database server tradisional dengan **IndexedDB** bawaan browser melalui library **Dexie.js** (`fintrack-db`).
- **Skema Penyimpanan**:
  - `transactions`: Menyimpan data transaksi dengan indeks pada field `date`, `type`, `categoryId`, dan `createdAt`.
  - `categories`: Menyimpan daftar kategori dengan indeks `name` dan `type`.
- **Auto Seeding**: Saat aplikasi pertama kali dibuka, sistem mendeteksi apakah tabel kategori kosong. Jika kosong, sistem otomatis memasukkan kategori bawaan (Gaji, Bonus, Makan, Transportasi, Belanja, Tagihan).
- **Keamanan Privasi**: Data keuangan tidak pernah dikirim ke internet, sepenuhnya berada di perangkat lokal pengguna.

### 2. Sinkronisasi Filter Periode Terpusat (Zustand)
- Seluruh halaman (Dashboard, Transaksi, dan Grafik) menggunakan store terpusat (`useFilterStore`) berbasis **Zustand**.
- Pengguna dapat memilih preset: **Hari Ini**, **Bulan Ini**, **Tahun Ini**, atau **Rentang Kustom** (dengan input tanggal mulai dan akhir).
- Ketika filter diubah di satu halaman, nilai rentang tanggal aktif (`startDate` dan `endDate`) langsung tersinkronisasi ke seluruh bagian aplikasi secara otomatis tanpa perlu *reload*.

### 3. Alur Pencatatan & Validasi Transaksi (React Hook Form + Zod)
- **Validasi Data**: Setiap input pada form divalidasi oleh skema **Zod** (`transactionSchema`) untuk memastikan nominal bernilai positif (> 0), tanggal terisi, dan kategori dipilih sesuai tipenya (pemasukan/pengeluaran).
- **Mode Tambah & Edit**: Form mendukung pembuatan transaksi baru (`db.transactions.add`) maupun pembaruan data yang sudah ada (`db.transactions.update`).
- **Penghapusan Transaksi**: Transaksi dapat dihapus dengan dialog konfirmasi aman untuk mencegah ketidaksengajaan.

### 4. Agregasi Data Rekapitulasi & Visualisasi Grafik
- **Repository Layer** (`transactionRepository.ts`):
  - Mengambil transaksi yang berada di antara `startDate` dan `endDate` secara inklusif.
  - **Kalkulasi Saldo**: Menjumlahkan total pemasukan dan total pengeluaran untuk menghasilkan saldo bersih (`totalIncome - totalExpense`).
- **Visualisasi Recharts**:
  - **Bar Chart (Tren)**: Mengelompokkan transaksi ke bucket waktu harian (untuk rentang harian/bulanan) atau bulanan (untuk rentang tahunan) guna membandingkan rasio pemasukan vs pengeluaran.
  - **Donut/Pie Chart (Distribusi Pengeluaran)**: Mengelompokkan pengeluaran berdasarkan masing-masing kategori untuk melihat persentase pos pengeluaran terbesar.

### 5. Manajemen Kategori & Relasi Transaksi
- Pengguna dapat mengelola kategori sendiri di halaman **Kategori**:
  - Menentukan nama, jenis (pemasukan/pengeluaran), ikon visual (dari pustaka Lucide), dan kode warna khusus.
  - Menghapus kategori dilengkapi sistem pengecekan riwayat: jika kategori masih digunakan oleh transaksi aktif, sistem menampilkan peringatan jumlah transaksi terdampak.

### 6. Portabilitas Data: Backup & Restore (CSV / JSON)
- **Ekspor CSV**: Menghasilkan berkas spreadsheet `.csv` berisi daftar transaksi terpilih untuk keperluan pelaporan atau analisis eksternal.
- **Backup JSON**: Mengekspor seluruh database (seluruh transaksi dan kategori) ke dalam format `.json`.
- **Restore JSON**: Membaca kembali berkas backup `.json`, memvalidasi strukturnya, dan memulihkan seluruh data transaksi serta kategori ke IndexedDB tanpa duplikasi yang tidak diinginkan.

### 7. Penggunaan Offline & PWA (Progressive Web App)
- **Aplikasi Web Progresif**: Dilengkapi `manifest.json` sehingga dapat di-*install* langsung ke layar utama smartphone (Android/iOS) maupun desktop layaknya aplikasi native.
- **Service Worker (`sw.js`)**: Melakukan *caching* otomatis terhadap aset statis (HTML, JS, CSS, ikon). Pengguna dapat membuka dan mencatat transaksi meskipun perangkat sedang tidak terhubung ke jaringan internet (*offline-ready*).
- **Responsif Mobile**: Menggunakan tata letak adaptif; saat diakses melalui smartphone, sistem menampilkan bilah navigasi bawah (*bottom bar*) untuk kemudahan navigasi satu tangan.
