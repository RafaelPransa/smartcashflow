import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useFilterStore } from "@/store/useFilterStore";
import { getSummary } from "@/lib/transactionRepository";
import type { FinanceSummary } from "@/types/finance";
import { PeriodFilter } from "@/components/PeriodFilter";
import { formatCurrency } from "@/utils/format";
import { ArrowDownLeft, ArrowUpRight, ArrowRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function DashboardPage() {
  const filter = useFilterStore((s) => s.filter);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const recentTransactions = useLiveQuery(
    () => db.transactions.orderBy("date").reverse().limit(5).toArray(),
    []
  ) ?? [];

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  useEffect(() => {
    getSummary(filter).then(setSummary);
  }, [filter]);

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const balance = summary?.balance ?? 0;

  return (
    <div className="space-y-6">
      <PeriodFilter />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-income">Total Pemasukan</span>
            <span className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-income">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-expense">Total Pengeluaran</span>
            <span className="p-2.5 bg-orange-50 rounded-xl text-orange-500">
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-expense">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-600">Sisa Saldo</span>
            <span className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <p
            className={`mt-3 text-2xl font-bold ${balance >= 0 ? "text-slate-900" : "text-orange-600"
              }`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Recent Transactions Widget */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-orange-600">Transaksi Terakhir</h2>
            <p className="text-xs text-slate-500">5 catatan keuangan yang baru saja dibuat</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Lihat Semua
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-2 rounded-xl ${t.type === "income"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-orange-50 text-orange-500"
                    }`}
                >
                  {t.type === "income" ? (
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {categoryMap.get(t.categoryId) ?? "Kategori"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.date} {t.note ? `• ${t.note}` : ""}
                  </p>
                </div>
              </div>

              <div
                className={`text-sm font-bold ${t.type === "income" ? "text-income" : "text-expense"
                  }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatCurrency(t.amount)}
              </div>
            </div>
          ))}

          {recentTransactions.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">
              Belum ada transaksi. Silakan tambah transaksi di halaman{" "}
              <Link to="/transactions" className="text-blue-600 hover:underline">
                Transaksi
              </Link>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
