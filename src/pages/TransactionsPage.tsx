import { useEffect, useState, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useFilterStore } from "@/store/useFilterStore";
import { getTransactionsByRange } from "@/lib/transactionRepository";
import type { Transaction, TransactionType } from "@/types/finance";
import { TransactionForm } from "@/components/TransactionForm";
import { PeriodFilter } from "@/components/PeriodFilter";
import { formatCurrency } from "@/utils/format";
import { exportToCSV, exportToJSON, importFromJSON } from "@/utils/exportImport";
import {
  Pencil,
  Trash2,
  Download,
  Upload,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

export default function TransactionsPage() {
  const filter = useFilterStore((s) => s.filter);
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const [items, setItems] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | TransactionType>("all");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    getTransactionsByRange(filter).then((data) => setItems(data.reverse()));
  };

  useEffect(reload, [filter]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const categoryName = (id: number) => categoryMap.get(id) ?? "-";

  const handleDelete = async (t: Transaction) => {
    if (!t.id) return;
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus transaksi "${categoryName(t.categoryId)}" sebesar ${formatCurrency(t.amount)}?`
    );
    if (!confirmed) return;

    await db.transactions.delete(t.id);
    if (editingTransaction?.id === t.id) {
      setEditingTransaction(null);
    }
    reload();
    showToast("Transaksi berhasil dihapus.");
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await importFromJSON(file);
      showToast(`Berhasil mengimpor ${res.transactionsCount} transaksi & ${res.categoriesCount} kategori.`);
      reload();
    } catch (err: any) {
      alert(`Gagal impor: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Filter by search & type
  const filteredItems = items.filter((t) => {
    const matchesType = selectedType === "all" || t.type === selectedType;
    const catName = (categoryName(t.categoryId) || "").toLowerCase();
    const note = (t.note || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || catName.includes(query) || note.includes(query);
    return matchesType && matchesSearch;
  });

  const totalFilteredIncome = filteredItems
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredItems
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="flex flex-col gap-4">
        <PeriodFilter />

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          {/* Search & Type filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi / catatan..."
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 w-48 sm:w-64"
              />
            </div>

            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`px-2.5 py-1 rounded-md transition ${
                  selectedType === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("expense")}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  selectedType === "expense" ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("income")}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  selectedType === "income" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Export & Import actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportToCSV(filteredItems, categories)}
              title="Ekspor ke CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={exportToJSON}
              title="Backup JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              Backup
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Restore data dari berkas JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm px-4 py-2.5 rounded-lg flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-blue-600 font-bold">&times;</button>
        </div>
      )}

      {/* Main Grid: Form on left, Table on right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TransactionForm
            categories={categories}
            editingTransaction={editingTransaction}
            onSaved={() => {
              setEditingTransaction(null);
              reload();
              showToast("Transaksi berhasil disimpan.");
            }}
            onCancelEdit={() => setEditingTransaction(null)}
          />
        </div>

        <div className="lg:col-span-2 space-y-3">
          {/* Sub-summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Menampilkan <strong>{filteredItems.length}</strong> transaksi</span>
            <div className="flex items-center gap-4">
              <span className="text-blue-600 font-semibold">
                + {formatCurrency(totalFilteredIncome)}
              </span>
              <span className="text-orange-600 font-semibold">
                - {formatCurrency(totalFilteredExpense)}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Catatan</th>
                    <th className="px-4 py-3 text-right">Jumlah</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((t) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50 transition ${
                        editingTransaction?.id === t.id ? "bg-amber-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-mono text-xs">
                        {t.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                          {t.type === "income" ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-orange-500 stroke-[2.5]" />
                          )}
                          {categoryName(t.categoryId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {t.note || "-"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                          t.type === "income" ? "text-income font-semibold" : "text-expense font-semibold"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingTransaction(t)}
                            title="Edit Transaksi"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t)}
                            title="Hapus Transaksi"
                            className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                        Belum ada transaksi pada periode atau pencarian ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
