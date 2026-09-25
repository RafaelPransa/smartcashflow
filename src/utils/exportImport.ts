import { db } from "@/lib/db";
import type { Category, Transaction } from "@/types/finance";
import { format } from "date-fns";

/**
 * Format CSV row escaping quotes and commas.
 */
function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Ekspor transaksi yang sedang ditampilkan ke format CSV
 */
export function exportToCSV(transactions: Transaction[], categories: Category[]) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ["ID", "Tanggal", "Tipe", "Kategori", "Jumlah (IDR)", "Catatan", "Waktu Dibuat"];

  const rows = transactions.map((t) => [
    escapeCSV(t.id),
    escapeCSV(t.date),
    escapeCSV(t.type === "income" ? "Pemasukan" : "Pengeluaran"),
    escapeCSV(categoryMap.get(t.categoryId) ?? "Lainnya"),
    escapeCSV(t.amount),
    escapeCSV(t.note ?? ""),
    escapeCSV(t.createdAt),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `fintrack-transaksi-${format(new Date(), "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Ekspor seluruh data (kategori & transaksi) ke format JSON untuk backup
 */
export async function exportToJSON() {
  const categories = await db.categories.toArray();
  const transactions = await db.transactions.toArray();

  const backupData = {
    appName: "FinTrack",
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    transactions,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `fintrack-backup-${format(new Date(), "yyyy-MM-dd")}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Impor data backup JSON ke dalam IndexedDB
 */
export async function importFromJSON(file: File): Promise<{ transactionsCount: number; categoriesCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!data || (!data.transactions && !data.categories)) {
          throw new Error("Format berkas backup tidak valid.");
        }

        let importedTransactions = 0;
        let importedCategories = 0;

        await db.transaction("rw", db.categories, db.transactions, async () => {
          // Impor kategori (tanpa duplikat nama & tipe)
          if (Array.isArray(data.categories)) {
            const existingCategories = await db.categories.toArray();
            for (const cat of data.categories) {
              const exists = existingCategories.find(
                (c) => c.name.toLowerCase() === cat.name.toLowerCase() && c.type === cat.type
              );
              if (!exists) {
                const { id, ...catWithoutId } = cat;
                await db.categories.add(catWithoutId);
                importedCategories++;
              }
            }
          }

          // Impor transaksi
          if (Array.isArray(data.transactions)) {
            for (const t of data.transactions) {
              const { id, ...tWithoutId } = t;
              await db.transactions.add(tWithoutId);
              importedTransactions++;
            }
          }
        });

        resolve({ transactionsCount: importedTransactions, categoriesCount: importedCategories });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca berkas."));
    reader.readAsText(file);
  });
}
