export type MonthlyPrices = Record<string, number>;

const MONTH_KEY_RE = /^\d{4}-\d{2}$/;

/** Ключі місяців сезону (травень–вересень) для року */
export function seasonMonthKeys(year: number): string[] {
  return [`${year}-05`, `${year}-06`, `${year}-07`, `${year}-08`, `${year}-09`];
}

export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const MONTH_LABELS_UK: Record<string, string> = {
  "01": "Січень",
  "02": "Лютий",
  "03": "Березень",
  "04": "Квітень",
  "05": "Травень",
  "06": "Червень",
  "07": "Липень",
  "08": "Серпень",
  "09": "Вересень",
  "10": "Жовтень",
  "11": "Листопад",
  "12": "Грудень",
};

export function formatMonthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const name = MONTH_LABELS_UK[month] ?? month;
  return `${name} ${year}`;
}

export type MonthlyPriceRow = {
  monthKey: string;
  label: string;
  pricePerNight: number;
};

/** Усі місяці з ціною для гостя, відсортовані хронологічно. */
export function getGuestMonthlyPriceRows(
  monthlyPrices: MonthlyPrices,
): MonthlyPriceRow[] {
  return Object.entries(monthlyPrices)
    .filter(([, price]) => price > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, pricePerNight]) => ({
      monthKey,
      label: formatMonthKeyLabel(monthKey),
      pricePerNight,
    }));
}

export function getMonthlyPriceRange(monthlyPrices: MonthlyPrices): {
  min: number;
  max: number;
} | null {
  const values = Object.values(monthlyPrices).filter((p) => p > 0);
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** Ціна за ніч для конкретної дати (місячна ціна = ціна за ніч у цьому місяці). */
export function getNightlyPriceForDate(
  date: Date,
  monthlyPrices: MonthlyPrices,
  fallback = 0,
): number {
  return monthlyPrices[getMonthKey(date)] ?? fallback;
}

/**
 * Ціна для показу в каталозі: за датою пошуку (заїзд) або за сьогодні.
 * Якщо для місяця немає ціни — fallback (зазвичай pricePerNight з БД).
 */
export function getDisplayNightlyPrice(
  monthlyPrices: MonthlyPrices,
  fallback: number,
  anchorDate?: Date | null,
): number {
  const date = anchorDate ? new Date(anchorDate) : new Date();
  date.setHours(0, 0, 0, 0);
  const price = getNightlyPriceForDate(date, monthlyPrices, 0);
  return price > 0 ? price : fallback;
}

function parseMonthlyPositive(
  raw: unknown,
): MonthlyPrices {
  if (!raw || typeof raw !== "object") return {};
  const result: MonthlyPrices = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsedValue = Number(value);
    if (MONTH_KEY_RE.test(key) && Number.isFinite(parsedValue) && parsedValue > 0) {
      result[key] = Math.round(parsedValue);
    }
  }
  return result;
}

/** Не від’ємні суми (для власника / націнки по місяцях) */
export function parseMonthlyNonNegative(raw: unknown): MonthlyPrices {
  if (!raw || typeof raw !== "object") return {};
  const result: MonthlyPrices = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsedValue = Number(value);
    if (MONTH_KEY_RE.test(key) && Number.isFinite(parsedValue) && parsedValue >= 0) {
      result[key] = Math.round(parsedValue);
    }
  }
  return result;
}

export function extractMonthlyOwnerPrices(availability: unknown): MonthlyPrices {
  if (!availability || typeof availability !== "object") return {};
  const o = (availability as { monthlyOwnerPrices?: unknown }).monthlyOwnerPrices;
  return parseMonthlyNonNegative(o);
}

export function extractMonthlyMarkups(availability: unknown): MonthlyPrices {
  if (!availability || typeof availability !== "object") return {};
  const o = (availability as { monthlyMarkups?: unknown }).monthlyMarkups;
  return parseMonthlyNonNegative(o);
}

export function mergeMonthlyGuestPrices(
  owner: MonthlyPrices,
  markup: MonthlyPrices,
): MonthlyPrices {
  const keys = new Set([...Object.keys(owner), ...Object.keys(markup)]);
  const result: MonthlyPrices = {};
  for (const key of keys) {
    if (!MONTH_KEY_RE.test(key)) continue;
    const sum =
      Math.round(Number(owner[key] ?? 0)) + Math.round(Number(markup[key] ?? 0));
    if (sum > 0) result[key] = sum;
  }
  return result;
}

export function extractMonthlyPrices(availability: unknown): MonthlyPrices {
  if (!availability || typeof availability !== "object") {
    return {};
  }

  const maybeMonthlyPrices = (
    availability as { monthlyPrices?: unknown; pricesByMonth?: unknown }
  ).monthlyPrices ??
    (availability as { monthlyPrices?: unknown; pricesByMonth?: unknown })
      .pricesByMonth;

  if (!maybeMonthlyPrices || typeof maybeMonthlyPrices !== "object") {
    return {};
  }

  return parseMonthlyPositive(maybeMonthlyPrices);
}

/** Ціна для гостя по місяцях: з `monthlyPrices` або власник + націнка */
export function resolveGuestMonthlyPrices(availability: unknown): MonthlyPrices {
  const explicit = extractMonthlyPrices(availability);
  if (Object.keys(explicit).length > 0) return explicit;
  return mergeMonthlyGuestPrices(
    extractMonthlyOwnerPrices(availability),
    extractMonthlyMarkups(availability),
  );
}

export function getMissingPriceMonths(
  checkIn: Date,
  checkOut: Date,
  monthlyPrices: MonthlyPrices,
): string[] {
  if (checkOut <= checkIn) return [];

  const missing = new Set<string>();
  const cursor = new Date(checkIn);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  const endInclusive = new Date(checkOut);
  endInclusive.setDate(endInclusive.getDate() - 1);
  endInclusive.setHours(0, 0, 0, 0);

  while (cursor <= endInclusive) {
    const key = getMonthKey(cursor);
    if (!monthlyPrices[key]) {
      missing.add(key);
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return Array.from(missing);
}

export function calculateTotalByMonth(
  checkIn: Date,
  checkOut: Date,
  monthlyPrices: MonthlyPrices,
): number {
  if (checkOut <= checkIn) return 0;

  const dayMs = 1000 * 60 * 60 * 24;
  let total = 0;
  const cursor = new Date(checkIn);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(checkOut);
  end.setHours(0, 0, 0, 0);

  while (cursor < end) {
    const key = getMonthKey(cursor);
    total += monthlyPrices[key] ?? 0;
    cursor.setTime(cursor.getTime() + dayMs);
  }

  return total;
}
