import { create } from "zustand";
import type { DateRangeFilter, PeriodPreset } from "@/types/finance";
import { resolveDateRange } from "@/utils/dateRange";

interface FilterState {
  filter: DateRangeFilter;
  setPreset: (preset: PeriodPreset) => void;
  setCustomRange: (startDate: string, endDate: string) => void;
}

/**
 * Store global untuk filter rentang waktu yang dipakai bersama oleh
 * halaman Rekap dan halaman Grafik (poin 2 & 3 kebutuhan awal),
 * supaya user tidak perlu set ulang filter di tiap halaman.
 */
export const useFilterStore = create<FilterState>((set) => ({
  filter: resolveDateRange("month"),

  setPreset: (preset) =>
    set({
      filter: resolveDateRange(preset),
    }),

  setCustomRange: (startDate, endDate) =>
    set({
      filter: { preset: "custom", startDate, endDate },
    }),
}));
