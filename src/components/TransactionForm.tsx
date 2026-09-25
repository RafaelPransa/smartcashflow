import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormValues } from "@/lib/validation";
import { db } from "@/lib/db";
import type { Category, Transaction } from "@/types/finance";
import { format } from "date-fns";

interface Props {
  categories: Category[];
  editingTransaction?: Transaction | null;
  onSaved: () => void;
  onCancelEdit?: () => void;
}

export function TransactionForm({
  categories,
  editingTransaction,
  onSaved,
  onCancelEdit,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const activeType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === activeType);

  useEffect(() => {
    if (editingTransaction) {
      reset({
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        categoryId: editingTransaction.categoryId,
        date: editingTransaction.date,
        note: editingTransaction.note ?? "",
      });
    } else {
      reset({
        type: "expense",
        amount: undefined as any,
        categoryId: undefined as any,
        date: format(new Date(), "yyyy-MM-dd"),
        note: "",
      });
    }
  }, [editingTransaction, reset]);

  const onSubmit = async (values: TransactionFormValues) => {
    if (editingTransaction?.id) {
      await db.transactions.update(editingTransaction.id, {
        ...values,
      });
    } else {
      await db.transactions.add({
        ...values,
        createdAt: new Date().toISOString(),
      });
    }
    reset({ type: values.type, date: values.date });
    onSaved();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">
          {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
        </h2>
        {editingTransaction && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Batal Edit
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <label className="flex-1 text-sm font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer">
          <input type="radio" value="expense" {...register("type")} /> Pengeluaran
        </label>
        <label className="flex-1 text-sm font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer">
          <input type="radio" value="income" {...register("type")} /> Pemasukan
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Jumlah (Rp)</label>
        <input
          type="number"
          step="1"
          placeholder="Contoh: 50000"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Kategori</label>
        <select
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          {...register("categoryId")}
        >
          <option value="">Pilih kategori</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Tanggal</label>
        <input
          type="date"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          {...register("date")}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Catatan (opsional)</label>
        <input
          type="text"
          placeholder="Contoh: Beli makan siang"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          {...register("note")}
        />
      </div>

      <div className="flex gap-2 pt-1">
        {editingTransaction && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          {editingTransaction ? "Simpan Perubahan" : "Simpan Transaksi"}
        </button>
      </div>
    </form>
  );
}
