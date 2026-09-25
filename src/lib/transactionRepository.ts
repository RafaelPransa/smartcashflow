import { db } from "@/lib/db";
import type {
  ChartPoint,
  DateRangeFilter,
  FinanceSummary,
  Transaction,
} from "@/types/finance";
import { format, eachDayOfInterval, eachMonthOfInterval, parseISO } from "date-fns";

/** Ambil semua transaksi dalam rentang tanggal (inklusif) */
export async function getTransactionsByRange(
  range: DateRangeFilter
): Promise<Transaction[]> {
  return db.transactions
    .where("date")
    .between(range.startDate, range.endDate, true, true)
    .sortBy("date");
}

/** Hitung ringkasan total pemasukan, pengeluaran, dan saldo dalam rentang */
export async function getSummary(range: DateRangeFilter): Promise<FinanceSummary> {
  const items = await getTransactionsByRange(range);

  const totalIncome = items
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = items
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

/**
 * Susun data untuk grafik perbandingan income vs expense.
 * granularity "day" -> titik per hari (cocok untuk rentang pendek/bulan)
 * granularity "month" -> titik per bulan (cocok untuk rentang tahun)
 */
export async function getChartData(
  range: DateRangeFilter,
  granularity: "day" | "month" = "day"
): Promise<ChartPoint[]> {
  const items = await getTransactionsByRange(range);
  const start = parseISO(range.startDate);
  const end = parseISO(range.endDate);

  const buckets =
    granularity === "day"
      ? eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"))
      : eachMonthOfInterval({ start, end }).map((d) => format(d, "yyyy-MM"));

  const keyOf = (dateStr: string) =>
    granularity === "day" ? dateStr : dateStr.slice(0, 7);

  const map = new Map<string, ChartPoint>();
  for (const label of buckets) {
    map.set(label, { label, income: 0, expense: 0 });
  }

  for (const t of items) {
    const key = keyOf(t.date);
    const point = map.get(key);
    if (!point) continue;
    if (t.type === "income") point.income += t.amount;
    else point.expense += t.amount;
  }

  return Array.from(map.values());
}
