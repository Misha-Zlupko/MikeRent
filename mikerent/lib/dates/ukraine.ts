const KYIV_TZ = "Europe/Kyiv";

/** Календарна дата YYYY-MM-DD у часовому поясі Києва */
export function calendarDateKyiv(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KYIV_TZ }).format(d);
}

export function isSameCalendarDayKyiv(a: Date, b: Date): boolean {
  return calendarDateKyiv(a) === calendarDateKyiv(b);
}

export function kyivHour(d: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: KYIV_TZ,
      hour: "numeric",
      hour12: false,
    }).format(d),
  );
}

export function formatDateKyiv(d: Date): string {
  return d.toLocaleDateString("uk-UA", { timeZone: KYIV_TZ });
}
