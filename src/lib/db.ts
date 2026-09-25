import Dexie, { type Table } from "dexie";
import type { Category, Transaction } from "@/types/finance";

/**
 * FinTrackDB — lapisan penyimpanan lokal (IndexedDB) menggantikan backend.
 * Index "date" & "categoryId" penting karena jadi dasar query filter
 * rekap (harian/bulanan/tahunan/rentang) dan grafik perbandingan.
 */
class FinTrackDB extends Dexie {
  transactions!: Table<Transaction, number>;
  categories!: Table<Category, number>;

  constructor() {
    super("fintrack-db");

    this.version(1).stores({
      // '++id' = auto increment primary key
      // field lain yang diberi index bisa dipakai di .where()
      transactions: "++id, type, date, categoryId, createdAt",
      categories: "++id, type, name",
    });
  }
}

export const db = new FinTrackDB();

/** Kategori default supaya app tidak kosong saat pertama kali dibuka */
export async function seedDefaultCategories() {
  const count = await db.categories.count();
  if (count > 0) return;

  await db.categories.bulkAdd([
    { name: "Gaji", type: "income", icon: "wallet", color: "#16a34a" },
    { name: "Bonus", type: "income", icon: "gift", color: "#22c55e" },
    { name: "Makan", type: "expense", icon: "utensils", color: "#dc2626" },
    { name: "Transportasi", type: "expense", icon: "car", color: "#ea580c" },
    { name: "Belanja", type: "expense", icon: "shopping-cart", color: "#d97706" },
    { name: "Tagihan", type: "expense", icon: "receipt", color: "#b91c1c" },
  ]);
}
