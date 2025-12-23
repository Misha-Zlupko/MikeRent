import { DateRange } from "../SeasonCalendarComponent";

export function formatDateRange(range: DateRange) {
  if (!range.from) return "Оберіть дати";

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  const from = range.from.toLocaleDateString("uk-UA", options);
  if (!range.to) return from;

  const to = range.to.toLocaleDateString("uk-UA", options);
  return `${from} – ${to}`;
}

export function getMobileSearchLabel(range: DateRange, totalGuests: number) {
  const parts: string[] = [];

  if (range.from) {
    parts.push(formatDateRange(range));
  }

  if (totalGuests > 1) {
    parts.push(`${totalGuests} гостей`);
  }

  return parts.length ? parts.join(" · ") : "Почати пошук";
}
