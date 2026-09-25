import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import type { DateRangeFilter, PeriodPreset } from "@/types/finance";

const ISO = "yyyy-MM-dd";

/**
 * Ubah preset ("day" | "month" | "year") menjadi rentang tanggal ISO nyata,
 * relatif terhadap tanggal acuan (default: hari ini).
 * Untuk preset "custom", startDate/endDate diambil langsung dari input user.
 */
export function resolveDateRange(
  preset: PeriodPreset,
  referenceDate: Date = new Date(),
  custom?: { startDate: string; endDate: string }
): DateRangeFilter {
  switch (preset) {
    case "day":
      return {
        preset,
        startDate: format(startOfDay(referenceDate), ISO),
        endDate: format(endOfDay(referenceDate), ISO),
      };
    case "month":
      return {
        preset,
        startDate: format(startOfMonth(referenceDate), ISO),
        endDate: format(endOfMonth(referenceDate), ISO),
      };
    case "year":
      return {
        preset,
        startDate: format(startOfYear(referenceDate), ISO),
        endDate: format(endOfYear(referenceDate), ISO),
      };
    case "custom":
      return {
        preset,
        startDate: custom?.startDate ?? format(startOfMonth(referenceDate), ISO),
        endDate: custom?.endDate ?? format(endOfMonth(referenceDate), ISO),
      };
  }
}
