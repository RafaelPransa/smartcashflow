import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  categoryId: z.coerce.number().int().positive("Kategori wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
