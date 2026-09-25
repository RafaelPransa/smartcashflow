/**
 * Tipe dasar transaksi keuangan.
 * `id` opsional karena Dexie akan mengisinya otomatis (auto-increment)
 * saat record baru pertama kali disimpan.
 */
export type TransactionType = "income" | "expense";

export interface Category {
  id?: number;
  name: string;
  type: TransactionType;
  icon?: string; // nama icon dari lucide-react, misal "utensils"
  color?: string; // hex color untuk chart, misal "#16a34a"
}

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number; // simpan dalam satuan Rupiah utuh (bukan sen)
  categoryId: number;
  date: string; // ISO string "YYYY-MM-DD", memudahkan query & sort
  note?: string;
  createdAt: string; // ISO datetime, untuk audit / sort sekunder
}

/** Preset filter rentang waktu yang dipakai di rekap & grafik */
export type PeriodPreset = "day" | "month" | "year" | "custom";

export interface DateRangeFilter {
  preset: PeriodPreset;
  /** Dipakai kalau preset === "custom", atau hasil resolve dari preset lain */
  startDate: string; // ISO "YYYY-MM-DD"
  endDate: string; // ISO "YYYY-MM-DD"
}

/** Bentuk data teragregasi, dipakai untuk ringkasan & chart */
export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface ChartPoint {
  label: string; // misal "2026-09-25" atau "Sep 2026"
  income: number;
  expense: number;
}
