import type { Apartment, Booking, PaymentStatus } from "@prisma/client";
import { bookingMoneyToUah } from "@/lib/bookingAmounts";
import { calcPrepaymentTotals } from "@/lib/bookingPrepayment";
import { PAYMENT_STATUS_LABELS } from "@/lib/paymentStatus";

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(cells: unknown[]) {
  return cells.map(escapeCsvCell).join(",");
}

export function csvWithBom(lines: string[]): string {
  return "\uFEFF" + lines.join("\r\n");
}

type BookingWithApt = Booking & {
  apartment: Apartment;
};

export function buildBookingsCsv(bookings: BookingWithApt[], guestNotes: Map<string, string>) {
  const header = [
    "ID",
    "Квартира",
    "Місто",
    "Заїзд",
    "Виїзд",
    "Ночей",
    "Статус",
    "Оплата",
    "Гість",
    "Телефон гостя",
    "Контакт",
    "Гостей",
    "Сума клієнта грн",
    "Хазяїну грн",
    "Наш заробіток грн",
    "Передоплата мені грн",
    "Передоплата хазяїну грн",
    "Залишок грн",
    "Хазяїн (ім'я)",
    "Тел. хазяїна (квартира)",
    "Тел. хазяїна (бронь)",
    "Нотатки про гостя",
    "Створено",
  ];

  const lines = [row(header)];

  for (const b of bookings) {
    const nights = Math.max(
      1,
      Math.ceil(
        (b.dateTo.getTime() - b.dateFrom.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const money = bookingMoneyToUah(b);
    const clientTotal = money.clientTotal;
    const ownerTotal = money.ownerPayout;
    const profit = money.ourProfit;
    const prepaidToMe = money.prepaidToMe;
    const prepaidToOwner = money.prepaidToOwner;
    const { remainingToPay } = calcPrepaymentTotals({
      clientTotal,
      ownerTotalPrice: ownerTotal,
      ourProfit: profit,
      prepaidToMe,
      prepaidToOwner,
    });
    const notesKey = b.guestPhone?.trim() ? b.guestPhone : "";
    const notes = guestNotes.get(notesKey) ?? "";

    lines.push(
      row([
        b.id,
        b.apartment.title,
        b.apartment.city,
        b.dateFrom.toISOString().slice(0, 10),
        b.dateTo.toISOString().slice(0, 10),
        nights,
        b.status,
        PAYMENT_STATUS_LABELS[b.paymentStatus as PaymentStatus],
        b.guestName,
        b.guestPhone,
        b.guestContact,
        b.guestCount,
        clientTotal,
        ownerTotal,
        profit,
        prepaidToMe,
        prepaidToOwner,
        remainingToPay,
        b.apartment.ownerName,
        b.apartment.ownerPhone,
        b.ownerPhone,
        notes,
        b.createdAt.toISOString().slice(0, 10),
      ]),
    );
  }

  return csvWithBom(lines);
}

export function buildApartmentsCsv(apartments: Apartment[]) {
  const header = [
    "ID",
    "Назва",
    "Тип",
    "Категорія",
    "Місто",
    "Адреса",
    "Хазяїн",
    "Тел. хазяїна",
    "Ціна гостя max",
    "Ціна власника max",
    "Націнка max",
    "Гостей",
    "Спальні",
    "Ліжка",
    "Ванні",
    "Поверх",
    "Поверхів у буд.",
    "До моря мін",
    "До моря макс",
    "Останній прозвон",
    "Сезон з",
    "Сезон до",
    "Створено",
  ];

  const lines = [row(header)];

  for (const a of apartments) {
    const avail =
      a.availability && typeof a.availability === "object"
        ? (a.availability as {
            season?: { from?: string; to?: string };
          })
        : null;

    lines.push(
      row([
        a.id,
        a.title,
        a.type,
        a.category,
        a.city,
        a.address,
        a.ownerName,
        a.ownerPhone,
        a.pricePerNight,
        a.ownerPrice,
        a.markup,
        a.guests,
        a.bedrooms,
        a.beds,
        a.bathrooms,
        a.floor,
        a.totalFloors,
        a.seaDistanceMin,
        a.seaDistanceMax,
        a.lastCalledAt?.toISOString().slice(0, 16) ?? "",
        avail?.season?.from ?? "",
        avail?.season?.to ?? "",
        a.createdAt.toISOString().slice(0, 10),
      ]),
    );
  }

  return csvWithBom(lines);
}
