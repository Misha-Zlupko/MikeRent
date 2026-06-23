import type { ApartmentType } from "@/data/ApartmentsTypes";

const STORAGE_KEY = "mikerent:apartments-list";

/** Початкова кількість карток — однакова на SSR і при гідратації */
export const APARTMENTS_GRID_SSR_VISIBLE = 6;

export type HomeSearchSnapshot = {
  typeFilter: ApartmentType | null;
  adults: number;
  childrenCount: number;
  dateFrom: string | null;
  dateTo: string | null;
};

export type ApartmentsListSession = {
  filterKey: string;
  visibleCount: number;
  scrollY: number;
  apartmentId: string;
  search: HomeSearchSnapshot;
  savedAt: number;
};

const SESSION_TTL_MS = 30 * 60 * 1000;

export function buildListFilterKey(params: {
  typeFilter: ApartmentType | null;
  guests: number;
  dateFrom: Date | null;
  dateTo: Date | null;
  apartmentsCount: number;
}) {
  return [
    params.typeFilter ?? "",
    params.guests,
    params.dateFrom?.toISOString() ?? "",
    params.dateTo?.toISOString() ?? "",
    params.apartmentsCount,
  ].join("|");
}

export function saveApartmentsListSession(
  data: Omit<ApartmentsListSession, "savedAt">,
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, savedAt: Date.now() }),
    );
  } catch {
    // ignore quota / private mode
  }
}

function readValidSession(): ApartmentsListSession | null {
  const saved = peekApartmentsListSession();
  if (!saved) return null;
  if (Date.now() - saved.savedAt > SESSION_TTL_MS) {
    clearApartmentsListSession();
    return null;
  }
  return saved;
}

export function peekApartmentsListSession(): ApartmentsListSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApartmentsListSession;
  } catch {
    return null;
  }
}

export function clearApartmentsListSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function readHomeSearchFromSession(): HomeSearchSnapshot | null {
  return readValidSession()?.search ?? null;
}

export function resolveVisibleCountFromSession(
  filterKey: string,
  apartmentIds: string[],
  fallback: number,
): number | null {
  const saved = readValidSession();
  if (!saved || saved.filterKey !== filterKey) return null;

  let count = saved.visibleCount;
  const idx = apartmentIds.indexOf(saved.apartmentId);
  if (idx >= 0) {
    count = Math.max(count, idx + 1);
  }

  return Math.min(Math.max(count, fallback), Math.max(apartmentIds.length, fallback));
}

export function readScrollYFromSession(filterKey: string): number | null {
  const saved = readValidSession();
  if (!saved || saved.filterKey !== filterKey) return null;
  return saved.scrollY;
}
