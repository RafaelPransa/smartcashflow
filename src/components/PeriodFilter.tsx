import { useState, useEffect } from "react";
import type { PeriodPreset } from "@/types/finance";
import { useFilterStore } from "@/store/useFilterStore";
import { Calendar, Check } from "lucide-react";

const options: { value: PeriodPreset; label: string }[] = [
  { value: "day", label: "Hari Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
  { value: "custom", label: "Rentang Kustom" },
];

interface Props {
  activePreset?: PeriodPreset;
  onChange?: (preset: PeriodPreset) => void;
}

export function PeriodFilter({ activePreset: propActivePreset, onChange: propOnChange }: Props) {
  const storeFilter = useFilterStore((s) => s.filter);
  const storeSetPreset = useFilterStore((s) => s.setPreset);
  const setCustomRange = useFilterStore((s) => s.setCustomRange);

  const currentPreset = propActivePreset ?? storeFilter.preset;

  const [startDate, setStartDate] = useState(storeFilter.startDate);
  const [endDate, setEndDate] = useState(storeFilter.endDate);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setStartDate(storeFilter.startDate);
    setEndDate(storeFilter.endDate);
  }, [storeFilter.startDate, storeFilter.endDate]);

  const handleSelectPreset = (preset: PeriodPreset) => {
    if (propOnChange) {
      propOnChange(preset);
    } else {
      storeSetPreset(preset);
    }
    setErrorMsg(null);
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setErrorMsg("Tanggal mulai dan selesai wajib diisi");
      return;
    }
    if (startDate > endDate) {
      setErrorMsg("Tanggal mulai tidak boleh melebihi tanggal selesai");
      return;
    }
    setErrorMsg(null);
    setCustomRange(startDate, endDate);
  };

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectPreset(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${currentPreset === opt.value
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Periode: <strong>{storeFilter.startDate}</strong> s/d <strong>{storeFilter.endDate}</strong></span>
        </div>
      </div>

      {currentPreset === "custom" && (
        <form
          onSubmit={handleApplyCustomRange}
          className="flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100"
        >
          <div>
            <label htmlFor="filter-start-date" className="block text-xs font-medium text-slate-600 mb-1">
              Dari Tanggal
            </label>
            <input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

          <div>
            <label htmlFor="filter-end-date" className="block text-xs font-medium text-slate-600 mb-1">
              Sampai Tanggal
            </label>
            <input
              id="filter-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-sm font-semibold text-white transition shadow-sm"
          >
            <Check className="w-4 h-4" />
            Terapkan
          </button>

          {errorMsg && (
            <p className="text-xs text-red-600 self-center">{errorMsg}</p>
          )}
        </form>
      )}
    </div>
  );
}

