import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Category, TransactionType } from "@/types/finance";
import { CategoryIcon, AVAILABLE_ICONS, PRESET_COLORS } from "@/components/CategoryIcon";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";

export default function CategoriesPage() {
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) ?? [];

  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [icon, setIcon] = useState("tag");
  const [color, setColor] = useState("#16a34a");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startCreate = () => {
    setEditingCategory(null);
    setName("");
    setType(activeTab);
    setIcon(activeTab === "income" ? "wallet" : "utensils");
    setColor(activeTab === "income" ? "#16a34a" : "#dc2626");
    setErrorMsg(null);
    setIsCreating(true);
  };

  const startEdit = (cat: Category) => {
    setIsCreating(false);
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || "tag");
    setColor(cat.color || "#64748b");
    setErrorMsg(null);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama kategori wajib diisi");
      return;
    }

    // Check duplicate name in same type
    const duplicate = categories.find(
      (c) =>
        c.name.toLowerCase() === name.trim().toLowerCase() &&
        c.type === type &&
        c.id !== editingCategory?.id
    );
    if (duplicate) {
      setErrorMsg("Kategori dengan nama dan tipe ini sudah ada");
      return;
    }

    if (editingCategory?.id) {
      await db.categories.update(editingCategory.id, {
        name: name.trim(),
        type,
        icon,
        color,
      });
    } else {
      await db.categories.add({
        name: name.trim(),
        type,
        icon,
        color,
      });
    }

    cancelForm();
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory?.id) return;
    await db.categories.delete(deletingCategory.id);
    if (editingCategory?.id === deletingCategory.id) {
      cancelForm();
    }
    setDeletingCategory(null);
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const deletingCategoryUsage = deletingCategory?.id
    ? transactions.filter((t) => t.categoryId === deletingCategory.id).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-orange-600">Manajemen Kategori</h1>
          <p className="text-sm text-slate-500">
            Kelola kategori pemasukan dan pengeluaran sesuai kebutuhan Anda
          </p>
        </div>

        {!isCreating && !editingCategory && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab("expense");
            if (isCreating) setType("expense");
          }}
          className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 ${activeTab === "expense"
            ? "border-orange-500 text-orange-600"
            : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
        >
          Kategori Pengeluaran ({categories.filter((c) => c.type === "expense").length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("income");
            if (isCreating) setType("income");
          }}
          className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 ${activeTab === "income"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
        >
          Kategori Pemasukan ({categories.filter((c) => c.type === "income").length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Create / Edit */}
        {(isCreating || editingCategory) && (
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSave}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  {editingCategory ? "Edit Kategori" : "Kategori Baru"}
                </h2>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Tipe</label>
                <div className="mt-1 flex gap-2">
                  <label
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-sm font-semibold cursor-pointer transition ${type === "expense"
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    <input
                      type="radio"
                      name="catType"
                      value="expense"
                      className="hidden"
                      checked={type === "expense"}
                      onChange={() => setType("expense")}
                    />
                    Pengeluaran
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-sm font-semibold cursor-pointer transition ${type === "income"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    <input
                      type="radio"
                      name="catType"
                      value="income"
                      className="hidden"
                      checked={type === "income"}
                      onChange={() => setType("income")}
                    />
                    Pemasukan
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Nama Kategori</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Investasi, Kopi, dsb"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Warna Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition border border-black/10"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 border rounded-lg border-slate-200">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.component;
                    const isSelected = icon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcon(item.name)}
                        title={item.label}
                        className={`p-2 rounded-lg flex items-center justify-center transition ${isSelected
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                          }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category List */}
        <div className={isCreating || editingCategory ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCategories.map((cat) => {
              const usageCount = transactions.filter((t) => t.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: cat.color || "#64748b" }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-800">{cat.name}</h3>
                      <p className="text-xs text-slate-400">{usageCount} transaksi</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Edit Kategori"
                      type="button"
                      onClick={() => startEdit(cat)}
                      title="Edit Kategori"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      aria-label="Hapus Kategori"
                      type="button"
                      onClick={() => setDeletingCategory(cat)}
                      title="Hapus Kategori"
                      className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                Belum ada kategori untuk tipe ini. Klik tombol "Tambah Kategori" untuk membuat.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pop Up Modal Konfirmasi Hapus Kategori */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        title="Hapus Kategori"
        message={
          deletingCategory ? (
            <div className="space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus kategori{" "}
                <strong>"{deletingCategory.name}"</strong>?
              </p>
              {deletingCategoryUsage > 0 && (
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs text-orange-800 leading-relaxed">
                  ⚠️ Kategori ini sedang digunakan oleh{" "}
                  <strong>{deletingCategoryUsage} transaksi</strong>. Jika dihapus, transaksi tersebut tetap ada di riwayat tetapi tidak memiliki nama kategori.
                </div>
              )}
            </div>
          ) : null
        }
        confirmText="Hapus Kategori"
        cancelText="Batal"
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
