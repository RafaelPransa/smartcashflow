import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Category, TransactionType } from "@/types/finance";
import { CategoryIcon, AVAILABLE_ICONS, PRESET_COLORS } from "@/components/CategoryIcon";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";

export default function CategoriesPage() {
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) ?? [];

  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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

  const handleDelete = async (cat: Category) => {
    if (!cat.id) return;
    const usageCount = transactions.filter((t) => t.categoryId === cat.id).length;

    let confirmMsg = `Hapus kategori "${cat.name}"?`;
    if (usageCount > 0) {
      confirmMsg = `Kategori "${cat.name}" digunakan oleh ${usageCount} transaksi. Jika dihapus, transaksi tersebut tetap tersimpan tetapi tidak memiliki kategori. Yakin ingin menghapus?`;
    }

    if (!window.confirm(confirmMsg)) return;

    await db.categories.delete(cat.id);
    if (editingCategory?.id === cat.id) {
      cancelForm();
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Kategori</h1>
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
          className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 ${
            activeTab === "expense"
              ? "border-red-600 text-red-600"
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
          className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 ${
            activeTab === "income"
              ? "border-emerald-600 text-emerald-600"
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
                  <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-sm font-medium cursor-pointer transition">
                    <input
                      type="radio"
                      name="catType"
                      value="expense"
                      checked={type === "expense"}
                      onChange={() => setType("expense")}
                    />
                    Pengeluaran
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-sm font-medium cursor-pointer transition">
                    <input
                      type="radio"
                      name="catType"
                      value="income"
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
                        className={`p-2 rounded-lg flex items-center justify-center transition ${
                          isSelected
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
                      type="button"
                      onClick={() => startEdit(cat)}
                      title="Edit Kategori"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
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
    </div>
  );
}
