import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useFilterStore } from "@/store/useFilterStore";
import { getChartData, getTransactionsByRange } from "@/lib/transactionRepository";
import type { ChartPoint } from "@/types/finance";
import { PeriodFilter } from "@/components/PeriodFilter";
import { formatCurrency } from "@/utils/format";

interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

const DEFAULT_COLORS = [
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#059669",
  "#64748b",
];

export default function ChartsPage() {
  const filter = useFilterStore((s) => s.filter);
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const [data, setData] = useState<ChartPoint[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    const granularity = filter.preset === "year" ? "month" : "day";
    getChartData(filter, granularity).then(setData);

    getTransactionsByRange(filter).then((transactions) => {
      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const expenseTotals = new Map<number, number>();

      for (const t of transactions) {
        if (t.type === "expense") {
          const current = expenseTotals.get(t.categoryId) ?? 0;
          expenseTotals.set(t.categoryId, current + t.amount);
        }
      }

      const breakdown: CategoryBreakdown[] = [];
      let colorIndex = 0;
      expenseTotals.forEach((amount, catId) => {
        const cat = categoryMap.get(catId);
        breakdown.push({
          name: cat?.name ?? "Lainnya",
          value: amount,
          color: cat?.color || DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length],
        });
        colorIndex++;
      });

      // Sort descending by amount
      breakdown.sort((a, b) => b.value - a.value);
      setExpenseBreakdown(breakdown);
    });
  }, [filter, categories]);

  const totalExpense = expenseBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <PeriodFilter />

      {/* Main Bar Chart: Perbandingan Tren */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Tren Pemasukan vs Pengeluaran</h2>
          <p className="text-xs text-slate-500">
            Perbandingan aliran kas masuk dan keluar pada periode yang dipilih
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" fontSize={12} stroke="#94a3b8" />
              <YAxis
                fontSize={12}
                stroke="#94a3b8"
                tickFormatter={(val) =>
                  val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}jt`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}rb`
                    : `${val}`
                }
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), ""]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Bar dataKey="income" name="Pemasukan" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Donut / Pie Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Distribusi Pengeluaran per Kategori</h2>
          <p className="text-xs text-slate-500">
            Total Pengeluaran: <strong>{formatCurrency(totalExpense)}</strong>
          </p>
        </div>

        {expenseBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Pengeluaran"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown with percentages */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
              {expenseBreakdown.map((item) => {
                const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-xs text-slate-400 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            Tidak ada pengeluaran pada periode ini.
          </div>
        )}
      </div>
    </div>
  );
}
