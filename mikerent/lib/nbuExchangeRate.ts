import { calendarDateKyiv } from "@/lib/dates/ukraine";

const NBU_EXCHANGE_URL =
  "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange";

type NbuExchangeRow = {
  rate: number;
  cc?: string;
};

const rateCache = new Map<string, number>();
const MAX_LOOKBACK_DAYS = 14;

function kyivCalendarToNbuParam(kyivDate: string): string {
  return kyivDate.replace(/-/g, "");
}

function shiftKyivCalendarDate(kyivDate: string, days: number): string {
  const [y, m, d] = kyivDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return utc.toISOString().slice(0, 10);
}

async function fetchNbuUsdRateForParam(dateParam: string): Promise<number | null> {
  const cached = rateCache.get(dateParam);
  if (cached != null) return cached;

  const url = `${NBU_EXCHANGE_URL}?valcode=USD&date=${dateParam}&json`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  const rows = (await res.json()) as NbuExchangeRow[];
  const rate = rows[0]?.rate;
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return null;

  rateCache.set(dateParam, rate);
  return rate;
}

/** Курс USD/UAH НБУ на календарний день (Kyiv YYYY-MM-DD), з відкатом на попередні дні */
export async function getNbuUsdRateForKyivDate(
  kyivDate: string,
): Promise<{ rate: number; rateDate: string } | null> {
  for (let i = 0; i <= MAX_LOOKBACK_DAYS; i += 1) {
    const candidate = shiftKyivCalendarDate(kyivDate, -i);
    const rate = await fetchNbuUsdRateForParam(kyivCalendarToNbuParam(candidate));
    if (rate != null) {
      return { rate, rateDate: candidate };
    }
  }
  return null;
}

/** Курс на дату заїзду; для майбутніх дат — поточний курс НБУ */
export async function getNbuUsdRateForBookingDate(
  date: Date,
  now = new Date(),
): Promise<{ rate: number; rateDate: string; isEstimate: boolean } | null> {
  const checkInDay = calendarDateKyiv(date);
  const today = calendarDateKyiv(now);

  if (checkInDay > today) {
    const current = await getNbuUsdRateForKyivDate(today);
    if (!current) return null;
    return { ...current, isEstimate: true };
  }

  const historical = await getNbuUsdRateForKyivDate(checkInDay);
  if (!historical) return null;
  return { ...historical, isEstimate: false };
}

export async function getNbuUsdRatesForKyivDates(
  kyivDates: string[],
): Promise<Map<string, { rate: number; rateDate: string }>> {
  const unique = [...new Set(kyivDates)];
  const entries = await Promise.all(
    unique.map(async (day) => {
      const resolved = await getNbuUsdRateForKyivDate(day);
      return [day, resolved] as const;
    }),
  );

  const map = new Map<string, { rate: number; rateDate: string }>();
  for (const [day, resolved] of entries) {
    if (resolved) map.set(day, resolved);
  }
  return map;
}

export function uahToUsd(uah: number, usdRate: number): number {
  if (!Number.isFinite(uah) || !Number.isFinite(usdRate) || usdRate <= 0) return 0;
  return Math.round((uah / usdRate) * 100) / 100;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
